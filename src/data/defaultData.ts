import { 
  Recipe, 
  StepBenefitMilestone, 
  VitalRecord, 
  EmergencyProfile, 
  FemaleCycleData, 
  MaleTestosteroneData, 
  AIProtocol,
  NutritionLogItem,
  UserProfile,
  AccessibilitySettings 
} from '../types';

export const PRESET_AVATARS = [
  {
    id: 'av_1',
    label: 'Warm Sunlight',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_2',
    label: 'Natural Forest',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_3',
    label: 'Modern Serene',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_4',
    label: 'Vitality Earth',
    gender: 'female',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_5',
    label: 'Acoustic Calm',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_6',
    label: 'Nordic Clean',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_7',
    label: 'Earthy Warmth',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'av_8',
    label: 'Sage Focus',
    gender: 'male',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr_vitalis_default',
  name: 'Alex Morgan Reed',
  email: 'alex.morgan@vitalis.health',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  gender: 'female',
  age: 32,
  weightKg: 64,
  heightCm: 172,
  primaryGoal: 'longevity',
  activityLevel: 'moderate',
  dietaryPreference: 'mediterranean',
  relationshipStatus: 'married',
  familyInfo: {
    spouseName: 'Morgan Reed',
    spouseAge: 34,
    spouseDateOfBirth: '1992-04-18',
    spouseBloodType: 'A Positive (A+)',
    spousePhone: '+1 (555) 234-5678',
    anniversaryDate: '2019-09-18',
    yearsMarried: 7,
    hasChildren: true,
    childrenCount: 2,
    children: [
      { id: 'ch_1', name: 'Leo Reed', age: 4, gender: 'male', bloodType: 'O Positive (O+)', notes: 'Peanut sensitivity' },
      { id: 'ch_2', name: 'Maya Reed', age: 2, gender: 'female', bloodType: 'A Positive (A+)', notes: 'Routine pediatric vaccines up to date' }
    ],
    emergencyDesignation: true,
    familyMedicalHistory: 'Maternal history of mild hypertension; paternal longevity (grandparents lived to 92+). No known early cardiovascular events.',
    householdDietaryNotes: 'Nut-aware household for children; Mediterranean anti-inflammatory family dinners.'
  },
  isOnboarded: true,
  createdAt: new Date().toISOString(),
  syncEnabled: true,
  lastSyncTimestamp: new Date().toISOString(),
  bloodType: 'O Positive (O+)',
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  dyslexiaFont: false,
  fontScale: 'normal',
  fontSize: 'normal',
  reducedMotion: false,
  screenReaderVoice: true,
};

export const DEFAULT_AI_PROTOCOL: AIProtocol = {
  summary: "Your metabolic and longevity baseline is calibrated. Priority is maintaining stable insulin sensitivity, optimizing circadian sleep-wake cycles, and achieving the 7,500+ daily step threshold.",
  dailyStepTarget: 8500,
  stepTarget: 8500,
  calorieTarget: 2150,
  macroRatio: { protein: 30, carbs: 40, fats: 30 },
  waterTargetLiters: 2.7,
  priorityFocus: [
    "Post-prandial 10-min walks to flatten glycemic glucose excursions",
    "Morning natural sunlight exposure within 45 minutes of waking",
    "Micronutrient density: Magnesium glycinate, Omega-3s, and zinc"
  ],
  aiHealthQuote: "Small physiological habits, performed consistently, outwork any temporary intervention.",
  focusArea: "Longevity & Endocrine Balance",
  clinicalSummary: "Optimal cardiovascular parameters with healthy heart rate variability and active step progression."
};

export const STEP_MILESTONES: StepBenefitMilestone[] = [
  {
    stepCount: 2500,
    title: "Sedentary Baseline Broken",
    physiologicalBenefit: "Reduces all-cause mortality risk by 15% compared to complete inactivity.",
    clinicalEvidence: "Activates endothelial nitric oxide synthase, restoring resting blood flow in lower limbs.",
    unlocked: true,
    iconName: "Flame"
  },
  {
    stepCount: 4500,
    title: "Metabolic Awakening",
    physiologicalBenefit: "Triggers non-insulin-mediated glucose transporter (GLUT4) uptake into muscle tissue.",
    clinicalEvidence: "Significantly lowers postprandial glucose curves and reduces systemic triglycerides.",
    unlocked: true,
    iconName: "Zap"
  },
  {
    stepCount: 6500,
    title: "Cardiovascular Defense",
    physiologicalBenefit: "Decreases resting systolic blood pressure by 4-7 mmHg and reduces arterial stiffness.",
    clinicalEvidence: "Lancet Public Health meta-analysis confirms dramatic drop in ischemic heart events.",
    unlocked: true,
    iconName: "Heart"
  },
  {
    stepCount: 8000,
    title: "Optimal Longevity Inflection",
    physiologicalBenefit: "Maximum risk reduction plateau for all-cause premature mortality (40-50% risk drop).",
    clinicalEvidence: "JAMA Cardiology large cohort shows peak risk-reduction per step achieved around 8,000 steps.",
    unlocked: false,
    iconName: "ShieldCheck"
  },
  {
    stepCount: 10000,
    title: "Neurogenesis & Cognitive Longevity",
    physiologicalBenefit: "Elevates Brain-Derived Neurotrophic Factor (BDNF) by up to 25%, stimulating hippocampal health.",
    clinicalEvidence: "Associated with enhanced executive cognitive function, slow-wave deep sleep, and neuroprotection.",
    unlocked: false,
    iconName: "Brain"
  },
  {
    stepCount: 12500,
    title: "Athletic Metabolic Conditioning",
    physiologicalBenefit: "Maximizes mitochondrial biogenesis and enhances intramuscular fat oxidation efficiency.",
    clinicalEvidence: "Cardiorespiratory VO2 ceiling preservation and elite longevity biomarker stabilization.",
    unlocked: false,
    iconName: "Trophy"
  }
];

export const INITIAL_VITALS: VitalRecord[] = [
  {
    id: 'vit_1',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
    systolicBP: 118,
    diastolicBP: 76,
    heartRate: 64,
    bloodGlucose: 92,
    spo2: 99,
    bodyTempC: 36.6,
    hrvMs: 62,
    respiratoryRate: 14,
    notes: 'Morning resting vitals post 8h sleep',
    source: 'manual'
  },
  {
    id: 'vit_2',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    systolicBP: 122,
    diastolicBP: 78,
    heartRate: 68,
    bloodGlucose: 96,
    spo2: 98,
    bodyTempC: 36.7,
    hrvMs: 58,
    respiratoryRate: 15,
    notes: 'Afternoon post-lunch check',
    source: 'bluetooth'
  },
  {
    id: 'vit_3',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    systolicBP: 116,
    diastolicBP: 74,
    heartRate: 62,
    bloodGlucose: 89,
    spo2: 99,
    bodyTempC: 36.5,
    hrvMs: 66,
    respiratoryRate: 13,
    notes: 'Live sync from wearable device',
    source: 'bluetooth'
  }
];

export const DEFAULT_VITALS: VitalRecord[] = INITIAL_VITALS;

export const CURATED_RECIPES: Recipe[] = [
  {
    id: 'rec_1',
    title: 'Mediterranean Lemon & Herb Wild Salmon Bowl',
    prepTime: '12 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Cardiovascular & Hormonal Membrane Fluidity',
    calories: 480,
    macros: { protein: '38g', carbs: '36g', fats: '18g', fiber: '6g' },
    keyBenefits: 'Rich in EPA/DHA Omega-3 fats that reduce endothelial inflammation and support endocrine cellular receptors.',
    ingredients: [
      '1 fresh wild Alaskan salmon fillet (150g)',
      '1/2 cup cooked organic quinoa or cauliflower rice',
      '1 cup baby arugula and cucumber slices',
      '6 kalamata olives, pitted',
      '1 tbsp cold-pressed extra virgin olive oil + fresh lemon juice',
      'Pinch of oregano, garlic powder, and pink salt'
    ],
    steps: [
      'Heat a skillet on medium-high; season salmon with oregano, garlic, and sea salt.',
      'Sear for 3.5 minutes per side until flaky and tender.',
      'Assemble warm quinoa, greens, cucumbers, and olives in a bowl, top with salmon, and dress with olive oil and lemon.'
    ],
    quickTip: 'Do not remove salmon skin during cooking; it retains healthy astaxanthin and healthy fats.',
    category: 'lunch'
  },
  {
    id: 'rec_2',
    title: 'Golden Anti-Inflammatory Turmeric & Chia Overnight Pudding',
    prepTime: '5 minutes prep (chill overnight)',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Gut Microbiome & Systemic Inflammation',
    calories: 340,
    macros: { protein: '14g', carbs: '28g', fats: '16g', fiber: '12g' },
    keyBenefits: 'Provides 12g of prebiotic mucilage fiber to feed gut commensal bacteria and stabilize morning blood glucose.',
    ingredients: [
      '3 tbsp organic black chia seeds',
      '1 cup unsweetened almond or coconut milk',
      '1/2 tsp ground organic turmeric + pinch of black pepper',
      '1/2 tsp Ceylon cinnamon',
      '1 tbsp raw hemp seeds',
      '1/3 cup fresh blueberries'
    ],
    steps: [
      'Whisk chia seeds, milk, turmeric, black pepper, and cinnamon in a mason jar until combined.',
      'Let sit for 5 minutes, stir again to prevent clumping, then refrigerate for at least 2 hours or overnight.',
      'Top with fresh blueberries and hemp seeds before eating.'
    ],
    quickTip: 'Pairing turmeric with black pepper boosts active curcumin bioavailability by 2000%.',
    category: 'breakfast'
  },
  {
    id: 'rec_3',
    title: 'Spinach, Pasture Egg & Avocado Iron Scramble',
    prepTime: '8 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Cellular Choline, Iron & Testosterone Support',
    calories: 410,
    macros: { protein: '24g', carbs: '6g', fats: '31g', fiber: '7g' },
    keyBenefits: 'Rich in dietary choline for liver methylation and acetylcholine neurotransmitters, plus bioavailable zinc and lutein.',
    ingredients: [
      '3 pasture-raised eggs',
      '2 generous handfuls fresh organic baby spinach',
      '1/2 ripe avocado, diced',
      '1 tsp grass-fed butter or coconut oil',
      'Sea salt and cracked black pepper to taste'
    ],
    steps: [
      'Melt butter in non-stick pan over medium-low heat.',
      'Add spinach and wilt for 45 seconds.',
      'Whisk eggs with a fork, pour into pan, and gently fold for 2 minutes until soft and creamy.',
      'Remove to plate immediately and top with diced avocado and pepper.'
    ],
    quickTip: 'Cook eggs on gentle low heat to preserve cholesterol esters needed for healthy steroid hormone synthesis.',
    category: 'breakfast'
  },
  {
    id: 'rec_4',
    title: 'Zesty Moroccan Spiced Chickpea & Walnut Salad',
    prepTime: '10 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Slow-Release Energy & Endothelial Blood Flow',
    calories: 430,
    macros: { protein: '16g', carbs: '46g', fats: '19g', fiber: '11g' },
    keyBenefits: 'High in L-arginine from walnuts and resistant starch from chickpeas for continuous steady-state mitochondrial ATP.',
    ingredients: [
      '1 cup cooked organic chickpeas (rinsed and drained)',
      '1/4 cup chopped raw walnuts',
      '1 cup shredded red cabbage & flat-leaf parsley',
      '1 tbsp tahini mixed with lemon juice and 1 tbsp warm water',
      '1/4 tsp ground cumin & sumac'
    ],
    steps: [
      'Toss chickpeas with cumin, sumac, and sea salt in a mixing bowl.',
      'Combine shredded cabbage, parsley, and toasted raw walnuts.',
      'Drizzle with the lemon-tahini dressing and serve at room temperature.'
    ],
    quickTip: 'Chickpeas have an extremely low glycemic index of 28, keeping insulin flat for 4+ hours.',
    category: 'lunch'
  },
  {
    id: 'rec_5',
    title: 'Post-Workout Tart Cherry & Cacao Recovery Smoothie',
    prepTime: '4 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Muscle Protein Synthesis & Delayed Onset Soreness',
    calories: 320,
    macros: { protein: '28g', carbs: '34g', fats: '7g', fiber: '6g' },
    keyBenefits: 'Anthocyanins in tart cherry juice inhibit COX-2 inflammatory pathways and naturally supply bio-identical melatonin.',
    ingredients: [
      '1 scoop grass-fed whey or organic pea protein isolate (unflavored or vanilla)',
      '1/2 cup 100% pure tart cherry juice',
      '1/2 frozen banana',
      '1 tbsp raw unsweetened raw cacao powder',
      '1 cup filtered water or almond milk'
    ],
    steps: [
      'Add all ingredients into a high-speed blender.',
      'Blend for 45 seconds until velvety and chilled.',
      'Drink within 45 minutes of physical activity or before bed.'
    ],
    quickTip: 'Tart cherry juice improves sleep efficiency by increasing sleep duration by an average of 34 minutes in clinical trials.',
    category: 'smoothie'
  }
];

export const DEFAULT_EMERGENCY_PROFILE: EmergencyProfile = {
  patientToken: 'VTL-8941-EMERG',
  fullName: 'Alex Jordan Reed',
  dateOfBirth: '1992-06-14',
  bloodType: 'O Positive (O+)',
  allergies: ['Penicillin (Moderate rash)', 'Shellfish (Anaphylaxis risk - Carries EpiPen)', 'Latex (Mild contact dermatitis)'],
  chronicConditions: ['Mild Asthma (Exercise-induced)', 'History of seasonal vasovagal syncope'],
  currentMedications: ['Albuterol Inhaler (90mcg PRN)', 'Vitamin D3 2000 IU daily', 'Magnesium Glycinate 300mg at night'],
  emergencyContacts: [
    {
      name: 'Morgan Reed',
      relationship: 'Spouse / Primary Next of Kin',
      phone: '+1 (555) 234-5678'
    },
    {
      name: 'Dr. Evelyn Vance, MD',
      relationship: 'Primary Family Physician',
      phone: '+1 (555) 987-6543'
    }
  ],
  organDonor: true,
  primaryPhysician: {
    name: 'Dr. Evelyn Vance, MD',
    clinic: 'St. Jude Integrated Preventative Medicine',
    phone: '+1 (555) 987-6543'
  },
  advanceDirectives: 'Full code. No known DNR. Patient consents to standard emergency interventions. In emergency, contact Morgan Reed immediately.',
  lastUpdated: new Date().toISOString()
};

export const DEFAULT_FEMALE_CYCLE: FemaleCycleData = {
  lastPeriodStartDate: new Date(Date.now() - 3600000 * 24 * 12).toISOString().split('T')[0],
  cycleLengthDays: 28,
  periodLengthDays: 5,
  currentCycleDay: 13,
  currentPhase: 'ovulatory',
  daysUntilNextPeriod: 15,
  fertilityStatus: 'peak',
  symptoms: {
    cramps: 1,
    mood: 'High Energy & Focused',
    energy: 5,
    flow: 'none',
    skin: 'Clear & Radiant'
  },
  phaseNutritionTips: [
    'Estrogen is peaking; support liver clearance with cruciferous veggies (broccoli sprouts, cauliflower).',
    'Include zinc-rich pumpkin seeds and glutathione-boosting citrus.',
    'Hydrate with electrolyte-balanced water to match increased body temperature.'
  ],
  phaseWorkoutTips: [
    'Strength and power potential are at their monthly peak—ideal time for PR attempts or HIIT.',
    'Estrogen increases ligament laxity; ensure thorough warm-ups for knee and ankle stability.'
  ]
};

export const DEFAULT_MALE_TESTOSTERONE: MaleTestosteroneData = {
  morningEnergyScore: 8,
  deepSleepHours: 2.1,
  resistanceTrainedToday: true,
  zincAndVitaminDIntake: true,
  stressLevel: 3,
  vitalityTrend: [
    { day: 'Mon', estimatedPercent: 88 },
    { day: 'Tue', estimatedPercent: 92 },
    { day: 'Wed', estimatedPercent: 84 },
    { day: 'Thu', estimatedPercent: 90 },
    { day: 'Fri', estimatedPercent: 94 },
    { day: 'Sat', estimatedPercent: 91 },
    { day: 'Sun', estimatedPercent: 95 }
  ],
  currentDiurnalState: 'morning_peak',
  optimizationTips: [
    'Peak Diurnal Window (7:00 AM - 10:00 AM): Cortisol and testosterone are synchronized for maximum mental focus and high-effort cognitive or heavy resistance tasks.',
    'Sleep Architecture: Over 80% of daily testosterone is synthesized during deep slow-wave and REM sleep. Aim for >1.75 hours of deep sleep.',
    'Micronutrient Foundation: Maintain zinc (15mg), Vitamin D3 (4000 IU), and avoid elevated chronic alcohol or refined sugar which acutely blunts Leydig cell production.'
  ]
};

export const INITIAL_NUTRITION_LOGS: NutritionLogItem[] = [
  {
    id: 'nut_1',
    mealType: 'breakfast',
    name: 'Pasture Eggs, Sliced Avocado & Sprouted Toast',
    calories: 420,
    proteinGrams: 26,
    carbsGrams: 24,
    fatGrams: 22,
    fiberGrams: 7,
    timestamp: '08:15 AM'
  },
  {
    id: 'nut_2',
    mealType: 'lunch',
    name: 'Mediterranean Wild Salmon & Quinoa Bowl',
    calories: 510,
    proteinGrams: 39,
    carbsGrams: 42,
    fatGrams: 17,
    fiberGrams: 8,
    timestamp: '01:00 PM'
  },
  {
    id: 'nut_3',
    mealType: 'snack',
    name: 'Raw Walnuts & Blueberries',
    calories: 190,
    proteinGrams: 4,
    carbsGrams: 14,
    fatGrams: 13,
    fiberGrams: 4,
    timestamp: '04:30 PM'
  }
];
