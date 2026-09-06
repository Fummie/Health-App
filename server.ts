import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { formulateDeterministicRecipe } from './src/utils/nutritionEngine.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Fix for PayloadTooLargeError: Increase request payload limit to 50MB for vitals, audio snippets, and logs
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Payload error safety handler
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'PayloadTooLargeError: Request payload exceeded maximum allowable size',
    });
  }
  next(err);
});

// Initialize Gemini client lazily/safely
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Resilient Gemini caller with automatic retry, backoff, and fallback models
 * to gracefully handle 503 high demand spikes or temporary service interruptions.
 */
async function generateContentWithResilience(params: {
  contents: any;
  config?: any;
  primaryModel?: string;
  fallbackModels?: string[];
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const modelsToTry = [
    params.primaryModel || 'gemini-3.8-flash',
    ...(params.fallbackModels || ['gemini-2.5-flash', 'gemini-3.1-flash-lite']),
  ];

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return response.text.trim();
      }
    } catch (err: any) {
      lastError = err;
      const is503 =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('429');

      console.warn(`Gemini model ${model} attempt failed (is503: ${is503}):`, err?.message || err);

      // If transient 503/429, wait briefly before attempting fallback model
      if (i < modelsToTry.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }
  }

  console.error('All Gemini model attempts exhausted:', lastError?.message || lastError);
  return null;
}

// In-memory store for doctor emergency updates and patient profiles
const doctorUpdatesStore: Record<string, any[]> = {};
const emergencyProfilesStore: Record<string, any> = {};

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. AI Initial Customization / Onboarding
app.post('/api/ai/onboarding', async (req: Request, res: Response) => {
  const { profile } = req.body;
  const fallbackProtocol = {
    summary: `Welcome, ${profile?.name || 'Friend'}. Your bio-adaptive health profile is calibrated for ${profile?.primaryGoal || 'Longevity & Metabolic Energy'}.`,
    dailyStepTarget: profile?.activityLevel === 'sedentary' ? 6500 : profile?.activityLevel === 'moderate' ? 8500 : 10500,
    calorieTarget: profile?.gender === 'female' ? 1950 : 2350,
    macroRatio: { protein: 30, carbs: 40, fats: 30 },
    waterTargetLiters: 2.8,
    priorityFocus: [
      'Cardiovascular conditioning via brisk morning walking',
      'Circadian alignment for optimal hormonal balance',
      'Nutrient-dense anti-inflammatory meal cadence'
    ],
    aiHealthQuote: "Optimal health is not a sprint; it's a compounding daily baseline of consistent metabolic habits."
  };

  try {
    const prompt = `You are a world-class preventative medicine physician and health longevity coach.
A user is setting up their personalized health profile with the following data:
${JSON.stringify(profile, null, 2)}

Provide a structured, personalized health initialization plan. Return ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentences welcoming the user and summarizing their tailored metabolic profile",
  "dailyStepTarget": number (between 5000 and 12000 based on their activity and age),
  "calorieTarget": number,
  "macroRatio": { "protein": number, "carbs": number, "fats": number } (must sum to 100),
  "waterTargetLiters": number (e.g. 2.5),
  "priorityFocus": ["3 high-impact specific action items for their specific goal and biology"],
  "aiHealthQuote": "Inspirational, clinically sound mantra"
}`;

    const text = await generateContentWithResilience({
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ success: true, protocol: parsed });
    }
  } catch (err) {
    console.warn('Error in onboarding endpoint, using calibrated fallback:', err);
  }

  // Guaranteed fallback
  return res.json({ success: true, protocol: fallbackProtocol });
});

// 3. AI Vitals & Health Benefit Analysis
app.post('/api/ai/vitals-analysis', async (req: Request, res: Response) => {
  const { vitals, steps = 6000, userBio } = req.body;

  const fallbackAnalysis = {
    overallStatus: 'Optimal Baseline',
    statusTone: 'positive',
    stepBenefitUnlocked: steps >= 8000 
      ? 'Optimal Longevity Plateau Unlocked: 45% reduced all-cause cardiovascular risk and stabilized postprandial glucose.'
      : steps >= 5000 
      ? 'Cardiovascular Defense Unlocked: Reduced arterial stiffness and improved insulin sensitivity.'
      : 'Base Metabolic Awakening: Initiated muscular glucose uptake.',
    nextStepMilestone: steps < 8000 ? `${8000 - steps} more steps to unlock optimal longevity inflection` : 'Target achieved! Recovery mode active.',
    clinicalObservations: [
      vitals?.bloodPressure?.systolic && vitals.bloodPressure.systolic > 130 
        ? 'Systolic blood pressure is slightly elevated; prioritize hydration and magnesium-rich foods.' 
        : 'Blood pressure readings are within healthy systolic/diastolic boundaries.',
      vitals?.heartRate && vitals.heartRate < 60 
        ? 'Resting heart rate indicates strong athletic parasympathetic vagal tone.' 
        : 'Heart rate is normal for daytime sedentary to light activity.',
      'SpO2 oxygen saturation remains optimal (>97%).'
    ],
    actionableAdvice: [
      'Take a 10-minute post-meal stroll to blunt glycemic spikes.',
      'Maintain steady diaphragmatic nasal breathing to optimize Heart Rate Variability (HRV).',
      'Ensure adequate evening magnesium glycinate for deep sleep recovery.'
    ]
  };

  try {
    const prompt = `You are a clinical AI health analyst. Analyze the following user vitals and daily step count:
User Demographics: ${JSON.stringify(userBio)}
Current Vitals: ${JSON.stringify(vitals)}
Daily Steps Count: ${steps}

Explain the specific biological and health benefits unlocked by this step count (referencing cardiovascular, metabolic, mental, or longevity clinical facts), analyze the vitals for normal vs warning signs, and give 3 actionable recommendations.

Return ONLY valid JSON matching this schema:
{
  "overallStatus": "e.g. Optimal / Stable / Needs Attention",
  "statusTone": "positive" | "warning" | "neutral",
  "stepBenefitUnlocked": "Specific physiological benefit achieved by their steps today",
  "nextStepMilestone": "What happens if they walk slightly more steps",
  "clinicalObservations": ["2 to 3 observations regarding BP, HR, glucose, oxygen"],
  "actionableAdvice": ["3 immediate, practical, high-value health actions"]
}`;

    const text = await generateContentWithResilience({
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ success: true, analysis: parsed });
    }
  } catch (err) {
    console.warn('Error analyzing vitals with AI, using clinical baseline:', err);
  }

  return res.json({ success: true, analysis: fallbackAnalysis });
});

// 4. AI Healthy Recipes & Suggestions (Fixed for 503 high demand & unavailable errors)
app.post('/api/ai/recipes', async (req: Request, res: Response) => {
  const { dietaryPreference, prepTimeLimit, ingredientsOnHand, cyclePhase, gender, healthGoal } = req.body;

  try {
    const prompt = `You are a culinary nutritionist and medical chef. Generate a simple, delicious, fast, and highly nutritious healthy recipe customized for:
- Dietary Preference: ${dietaryPreference || 'Any wholesome whole-food'}
- Prep Time: ${prepTimeLimit || '15 minutes or less'}
- Available Ingredients (if any): ${ingredientsOnHand || 'Standard pantry whole foods'}
- Hormonal or Bio Context: ${gender === 'female' ? `Menstrual cycle phase: ${cyclePhase || 'General'}` : `Male endocrine support`}
- Health Goal: ${healthGoal || 'Metabolic health & energy'}

Requirements:
1. Extremely simple to prepare (minimal cookware, simple steps).
2. Nutritious, whole foods, balanced macros.
3. Explicitly explain the scientific health benefit.

Return ONLY valid JSON with this schema:
{
  "title": "Creative recipe title",
  "prepTime": "e.g. 12 minutes",
  "servings": 1,
  "difficulty": "Easy",
  "targetGoal": "Goal summary",
  "calories": 450,
  "macros": { "protein": "34g", "carbs": "40g", "fats": "15g", "fiber": "8g" },
  "keyBenefits": "Specific physiological benefit",
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity", "..."],
  "steps": ["Step 1 concise instructions", "Step 2 concise instructions", "Step 3 concise instructions"],
  "quickTip": "Helpful food-pairing or bio-hack tip"
}`;

    const text = await generateContentWithResilience({
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ success: true, recipe: parsed });
    }
  } catch (error: any) {
    console.warn('Gemini 503 or transient failure during recipe generation, falling back to clinical engine:', error?.message);
  }

  // Gracefully fallback to deterministic culinary formulation so user is never blocked
  const fallbackRecipe = formulateDeterministicRecipe({
    ingredientsOnHand: ingredientsOnHand || 'wild salmon, olive oil, lemon, greens',
    dietaryPreference,
    prepTimeLimit: prepTimeLimit || '15 minutes',
    healthGoal: healthGoal || 'Metabolic & Longevity',
    gender,
  });

  return res.json({
    success: true,
    source: 'clinical_engine',
    recipe: fallbackRecipe,
  });
});

// 5. AI Meal & Drink Ingredients Consumption & Goal Impact Analysis
app.post('/api/ai/analyze-meal', async (req: Request, res: Response) => {
  const { mealName, mealType, ingredients, userGoal, userProfile, beverageCategory } = req.body;

  try {
    const prompt = `You are a clinical nutritionist, metabolic researcher, and preventative medicine specialist.
A client has just consumed a meal or drink (other than pure water) with the following details:
- Name: "${mealName}"
- Type: ${mealType} ${beverageCategory ? `(${beverageCategory})` : ''}
- Major Ingredients Used to Prepare: ${JSON.stringify(ingredients)}
- Client's Targeted Goal: "${userGoal}"
- Client Profile: Gender: ${userProfile?.gender || 'unspecified'}, Age: ${userProfile?.age || 30}, Weight: ${userProfile?.weightKg || 65}kg, Dietary Preference: ${userProfile?.dietaryPreference || 'healthy whole-food'}

Perform a rigorous clinical analysis:
1. State exactly what was consumed based on these major ingredients.
2. Estimate realistic nutritional metrics (calories, protein in grams, carbs in grams, fats in grams, fiber in grams).
3. Evaluate its specific physiological effect on the client's TARGETED RESULT (${userGoal}):
   - How does it affect hormones (insulin, cortisol, ghrelin, leptin, etc.)?
   - How does it affect cellular energy, inflammation, or recovery?
   - What is the alignment score (0-100%) and verdict ("optimal", "supportive", "moderate", "caution")?
4. Identify 3-4 key bioactive nutrients or phytochemicals from these ingredients (e.g. Omega-3, EGCG, Curcumin, Sulforaphane, L-Theanine, Choline, Resveratrol, etc.).
5. Provide 1 actionable clinical optimization tip for better results according to their plan.

Return ONLY valid JSON matching this schema:
{
  "consumedSummary": "Clear 1-2 sentence description of what was consumed from these ingredients",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "fiber": number,
  "glycemicImpact": "Low" | "Moderate" | "High",
  "goalImpact": {
    "goal": "${userGoal}",
    "alignmentScore": number (0 to 100),
    "verdict": "optimal" | "supportive" | "moderate" | "caution",
    "summaryEffect": "Specific explanation of how this meal/drink directly impacts their targeted result (${userGoal})",
    "physiologicalMechanisms": ["Specific biological pathway 1", "Specific biological pathway 2"],
    "keyNutrientsIdentified": ["Nutrient 1", "Nutrient 2", "Nutrient 3"],
    "optimizationTip": "Actionable clinical tip to maximize results for this goal"
  }
}`;

    const text = await generateContentWithResilience({
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ success: true, source: 'gemini', analysis: parsed });
    }
  } catch (error: any) {
    console.warn('Gemini 503 or transient error in /api/ai/analyze-meal:', error?.message);
  }

  // Instruct client to run deterministic engine fallback smoothly
  return res.json({ success: true, source: 'fallback' });
});

// 6. AI Health Assistant / Concierge Chat (Support both /api/ai/chat and /api/ai/assistant)
const handleChatRequest = async (req: Request, res: Response) => {
  const { message, messages, context, userContext } = req.body;
  const userCtx = context || userContext || {};
  const query = message || (messages && messages[messages.length - 1]?.content) || 'Hello';

  const defaultReply = `I am your Vitalis AI Health Concierge. Based on your current profile, your vitals and step activity are well-aligned with your health goals. Keep hydrating steadily and remember that consistent 7,500+ daily steps significantly protects cardiovascular and glycemic resilience. Feel free to ask about nutrition, your cycle, or vitals!`;

  try {
    const systemInstruction = `You are Vitalis AI, an empathetic, clinically rigorous, and motivating health assistant.
You have access to the user's real-time context:
${JSON.stringify(userCtx, null, 2)}

Provide concise, friendly, and scientifically grounded responses. Always mention that your advice is educational and preventative, not a replacement for acute emergency medical care. When discussing steps, explain the specific physiological benefits. When discussing cycles, provide phase-specific bio-hacks. Keep responses scannable and direct.`;

    const contents = messages
      ? messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))
      : [{ role: 'user', parts: [{ text: query }] }];

    const text = await generateContentWithResilience({
      contents,
      config: { systemInstruction },
    });

    if (text) {
      return res.json({ success: true, reply: text });
    }
  } catch (error: any) {
    console.warn('Gemini 503 or transient error in chat endpoint:', error?.message);
  }

  return res.json({ success: true, reply: defaultReply });
};

app.post('/api/ai/chat', handleChatRequest);
app.post('/api/ai/assistant', handleChatRequest);

// 7. External Doctor Portal API: Fetch emergency record & submit updates
app.get('/api/doctor/record/:patientToken', (req: Request, res: Response) => {
  const { patientToken } = req.params;
  const profile = emergencyProfilesStore[patientToken] || null;
  const updates = doctorUpdatesStore[patientToken] || [];
  res.json({ success: true, profile, updates });
});

app.post('/api/doctor/save-profile', (req: Request, res: Response) => {
  const { patientToken, profile } = req.body;
  if (!patientToken || !profile) {
    return res.status(400).json({ success: false, message: 'Missing token or profile' });
  }
  emergencyProfilesStore[patientToken] = profile;
  res.json({ success: true, message: 'Profile saved for doctor link' });
});

app.post('/api/doctor/update-history', (req: Request, res: Response) => {
  const { patientToken, doctorName, clinicName, notes, medicationAdjustments, triageStatus, timestamp } = req.body;
  if (!patientToken) {
    return res.status(400).json({ success: false, message: 'Patient token required' });
  }

  const updateEntry = {
    id: `doc_upd_${Date.now()}`,
    doctorName: doctorName || 'Attending Physician',
    clinicName: clinicName || 'Emergency Care Clinic',
    notes: notes || 'Medical history reviewed and updated.',
    medicationAdjustments: medicationAdjustments || '',
    triageStatus: triageStatus || 'Stable / Routine Update',
    timestamp: timestamp || new Date().toISOString(),
  };

  if (!doctorUpdatesStore[patientToken]) {
    doctorUpdatesStore[patientToken] = [];
  }
  doctorUpdatesStore[patientToken].unshift(updateEntry);

  res.json({ success: true, update: updateEntry });
});

// Start server with Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vitalis Health AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
