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
    planCategory: 'cardio',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
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
    category: 'lunch',
    dietaryMatch: ['Mediterranean', 'Gluten-Free', 'High-Protein']
  },
  {
    id: 'rec_2',
    title: 'Golden Anti-Inflammatory Turmeric & Chia Overnight Pudding',
    prepTime: '5 minutes prep (chill overnight)',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Gut Microbiome & Systemic Inflammation',
    planCategory: 'longevity',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80',
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
    category: 'breakfast',
    dietaryMatch: ['Plant-Based', 'Gluten-Free', 'Low-GI']
  },
  {
    id: 'rec_3',
    title: 'Spinach, Pasture Egg & Avocado Iron Scramble',
    prepTime: '8 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Cellular Choline, Iron & Testosterone Support',
    planCategory: 'hormonal_balance',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
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
    category: 'breakfast',
    dietaryMatch: ['Keto', 'Gluten-Free', 'Low-Carb']
  },
  {
    id: 'rec_4',
    title: 'Zesty Moroccan Spiced Chickpea & Walnut Salad',
    prepTime: '10 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Slow-Release Energy & Endothelial Blood Flow',
    planCategory: 'metabolic_fitness',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
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
    category: 'lunch',
    dietaryMatch: ['Plant-Based', 'Mediterranean', 'Gluten-Free']
  },
  {
    id: 'rec_5',
    title: 'Post-Workout Tart Cherry & Cacao Recovery Smoothie',
    prepTime: '4 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Muscle Protein Synthesis & Delayed Onset Soreness',
    planCategory: 'stress_reduction',
    itemType: 'drink',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    calories: 320,
    macros: { protein: '28g', carbs: '34g', fats: '7g', fiber: '6g' },
    keyBenefits: 'Anthocyanins in tart cherry juice inhibit COX-2 inflammatory pathways and naturally supply bio-identical melatonin.',
    ingredients: [
      '1 scoop grass-fed whey or organic pea protein isolate',
      '1/2 cup 100% pure tart cherry juice',
      '1/2 frozen banana',
      '1 tbsp raw unsweetened raw cacao powder',
      '1 cup filtered almond milk'
    ],
    steps: [
      'Add all ingredients into a high-speed blender.',
      'Blend for 45 seconds until velvety and chilled.',
      'Drink within 45 minutes of physical activity or before bed.'
    ],
    quickTip: 'Tart cherry juice improves sleep efficiency by increasing sleep duration by an average of 34 minutes in clinical trials.',
    category: 'smoothie',
    dietaryMatch: ['Gluten-Free', 'High-Protein', 'Recovery']
  },
  {
    id: 'rec_6',
    title: 'Ceremonial Matcha & Lion\'s Mane Nootropic Latte',
    prepTime: '3 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Cognitive Alpha Waves & Sustained Fat Oxidation',
    planCategory: 'weight_loss',
    itemType: 'drink',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    calories: 85,
    macros: { protein: '3g', carbs: '8g', fats: '4g', fiber: '1g' },
    keyBenefits: 'EGCG catechins combined with L-Theanine stimulate steady thermogenesis without the cortisol spike of standard drip coffee.',
    ingredients: [
      '1.5 tsp ceremonial grade Japanese matcha',
      '1 tsp organic Lion\'s Mane mushroom extract powder',
      '3/4 cup unsweetened warm oat or macadamia milk',
      '1/4 cup hot water (80°C / 175°F)',
      '1/4 tsp pure Madagascar vanilla extract'
    ],
    steps: [
      'Sift matcha and lion\'s mane into a shallow bowl; whisk with hot water using a bamboo whisk until frothy.',
      'Steam or warm milk, then pour gently over the matcha froth.',
      'Sprinkle with a dusting of cinnamon and sip slowly.'
    ],
    quickTip: 'L-Theanine in matcha induces 8-12 Hz alpha brain waves, creating calm focus without jitters.',
    category: 'drink',
    dietaryMatch: ['Plant-Based', 'Keto-Friendly', 'Antioxidant']
  },
  {
    id: 'rec_7',
    title: 'Crispy Lemon Rosemary Chicken with Broccolini & Sweet Potato',
    prepTime: '18 minutes',
    servings: 1,
    difficulty: 'Medium',
    targetGoal: 'Lean Muscle Preservation & Glycogen Replenishment',
    planCategory: 'weight_loss',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
    calories: 490,
    macros: { protein: '42g', carbs: '38g', fats: '15g', fiber: '7g' },
    keyBenefits: 'High protein-to-energy ratio maximizes the thermic effect of feeding (TEF) and maintains satiety for 5+ hours.',
    ingredients: [
      '1 pasture-raised chicken breast fillet (180g)',
      '1 small baked sweet potato, cubed',
      '1 bundle fresh broccolini spears',
      '1 tbsp extra virgin olive oil + juice of 1/2 lemon',
      'Fresh rosemary sprig, minced garlic, sea salt'
    ],
    steps: [
      'Pound chicken to even thickness; season with fresh rosemary, minced garlic, and sea salt.',
      'Pan-sear in olive oil for 5 minutes per side until golden and cooked through.',
      'In the same pan, flash-toss the broccolini and sweet potato cubes with lemon juice for 3 minutes until tender-crisp.'
    ],
    quickTip: 'Broccolini contains sulforaphane which triggers Phase II liver detoxification of metabolic waste.',
    category: 'dinner',
    dietaryMatch: ['Gluten-Free', 'High-Protein', 'Clean-Whole-Food']
  },
  {
    id: 'rec_8',
    title: 'Warm Cinnamon Vanilla Blueberry Power Porridge',
    prepTime: '7 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Slow-Release Beta-Glucan & Arterial Health',
    planCategory: 'longevity',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=800&q=80',
    calories: 380,
    macros: { protein: '18g', carbs: '44g', fats: '12g', fiber: '9g' },
    keyBenefits: 'Beta-glucan fibers bond with bile acids to lower LDL cholesterol while blueberries deliver brain-protective anthocyanins.',
    ingredients: [
      '1/2 cup rolled sprouted organic oats',
      '1 cup unsweetened almond milk',
      '1 scoop unflavored collagen peptides or pea protein',
      '1/2 cup fresh wild blueberries',
      '1 tbsp creamy almond butter',
      '1/2 tsp Ceylon cinnamon'
    ],
    steps: [
      'Simmer oats in almond milk over medium heat for 4 minutes until thick and creamy.',
      'Stir in protein powder, cinnamon, and a pinch of salt off heat.',
      'Transfer to bowl and top with fresh blueberries and a drizzle of almond butter.'
    ],
    quickTip: 'Ceylon cinnamon acts as a natural insulin mimetic, reducing post-prandial blood sugar spikes.',
    category: 'breakfast',
    dietaryMatch: ['High-Fiber', 'Cardio-Protective']
  },
  {
    id: 'rec_9',
    title: 'Ruby Hibiscus & Fresh Mint Electrolyte Quencher',
    prepTime: '3 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Endothelial Nitric Oxide & Blood Pressure Support',
    planCategory: 'cardio',
    itemType: 'drink',
    imageUrl: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
    calories: 25,
    macros: { protein: '0g', carbs: '5g', fats: '0g', fiber: '1g' },
    keyBenefits: 'Hibiscus calyces act as natural ACE inhibitors, clinically demonstrated to lower systolic BP by 7 mmHg.',
    ingredients: [
      '1 cup brewed iced hibiscus herbal tea',
      '1/2 cup sparkling mineral water',
      'Juice of 1/2 fresh lime or blood orange',
      'Pinch of Celtic sea salt (natural trace minerals)',
      'Fresh bruised mint leaves and lime wheel'
    ],
    steps: [
      'Fill a tall glass with crushed ice.',
      'Pour cold-brewed hibiscus tea and lime juice over ice; top with sparkling mineral water.',
      'Add a pinch of Celtic salt, stir with fresh mint sprigs, and enjoy chilled.'
    ],
    quickTip: 'Drink between meals for cellular microvascular hydration without breaking an intermittent fasting window.',
    category: 'drink',
    dietaryMatch: ['Zero-Sugar', 'Hydration', 'Keto']
  },
  {
    id: 'rec_10',
    title: 'Grass-Fed Ribeye with Garlic Herb Ghee & Charred Asparagus',
    prepTime: '15 minutes',
    servings: 1,
    difficulty: 'Medium',
    targetGoal: 'Mitochondrial Carnitine, Heme Iron & Zinc Saturation',
    planCategory: 'metabolic_fitness',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    calories: 560,
    macros: { protein: '46g', carbs: '7g', fats: '38g', fiber: '4g' },
    keyBenefits: 'Provides highly bioavailable heme iron, zinc, and CLA (conjugated linoleic acid) for cellular energy enzymes.',
    ingredients: [
      '1 grass-fed pasture-raised steak cut (200g)',
      '10 fresh asparagus spears, woody ends snapped',
      '1 tbsp grass-fed ghee or butter',
      '2 cloves crushed garlic',
      'Coarse sea salt and cracked black pepper'
    ],
    steps: [
      'Bring steak to room temp for 10 minutes; season generously with coarse sea salt.',
      'Sear in a smoking hot cast iron skillet for 3 minutes per side.',
      'Add ghee and crushed garlic, baste the steak for 1 minute, and let rest 5 minutes.',
      'Quickly sauté asparagus in the remaining pan juices for 2 minutes and serve.'
    ],
    quickTip: 'Grass-fed beef possesses an optimal 1:1 to 1:2 ratio of Omega-3 to Omega-6 fatty acids.',
    category: 'dinner',
    dietaryMatch: ['Keto', 'Paleo', 'Carnivore-Friendly']
  },
  {
    id: 'rec_11',
    title: 'Warm Spiced Coconut Golden Milk Nightcap',
    prepTime: '4 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Vagus Nerve Decompression & Deep Sleep Preparation',
    planCategory: 'stress_reduction',
    itemType: 'drink',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80',
    calories: 140,
    macros: { protein: '2g', carbs: '9g', fats: '11g', fiber: '1g' },
    keyBenefits: 'Medium-chain triglycerides (MCTs) provide steady cerebral fuel during nocturnal fasting, calming adrenal cortisol.',
    ingredients: [
      '1 cup light organic coconut milk or almond milk',
      '1/2 tsp organic ground turmeric',
      '1/4 tsp ground ginger + pinch black pepper',
      '1/4 tsp ground cardamom & nutmeg',
      '1 tsp raw unheated honey (optional)'
    ],
    steps: [
      'Warm coconut milk in a small saucepan over medium-low heat (do not boil).',
      'Whisk in turmeric, ginger, black pepper, cardamom, and nutmeg until frothy.',
      'Pour into your favorite mug, stir in raw honey if desired, and sip 45 minutes before sleep.'
    ],
    quickTip: 'Cardamom and nutmeg contain myristicin, an aromatic compound with mild natural sedating properties.',
    category: 'drink',
    dietaryMatch: ['Ayurvedic', 'Sleep-Enhancing', 'Anti-Inflammatory']
  },
  {
    id: 'rec_12',
    title: 'Sesame Ginger Wild Ahi Tuna Poke & Avocado Bowl',
    prepTime: '10 minutes',
    servings: 1,
    difficulty: 'Easy',
    targetGoal: 'Endocrine Health & Cellular Phospholipids',
    planCategory: 'hormonal_balance',
    itemType: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-d779f64bf729?auto=format&fit=crop&w=800&q=80',
    calories: 460,
    macros: { protein: '40g', carbs: '32g', fats: '17g', fiber: '6g' },
    keyBenefits: 'Sashimi-grade tuna delivers pure bio-identical iodine and selenium, the two co-factors for thyroid T3/T4 synthesis.',
    ingredients: [
      '150g sashimi-grade wild ahi tuna, cubed',
      '1/2 cup steamed edamame beans',
      '1/2 ripe avocado, diced',
      '1/2 cup warm cauliflower rice or brown rice',
      '1 tbsp coconut aminos or low-sodium tamari',
      '1 tsp toasted sesame oil + black sesame seeds'
    ],
    steps: [
      'Toss cubed ahi tuna with tamari, sesame oil, and grated fresh ginger.',
      'Layer warm grain bed with edamame, sliced avocado, and cucumber slices.',
      'Place marinated ahi tuna on top, garnish with black sesame seeds and fresh scallions.'
    ],
    quickTip: 'Eating raw wild tuna preserves heat-sensitive taurine, an amino acid that protects heart mitochondria.',
    category: 'lunch',
    dietaryMatch: ['Gluten-Free', 'High-Protein', 'Thyroid-Support']
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
    itemType: 'meal',
    name: 'Pasture Eggs, Sliced Avocado & Sprouted Grain Toast',
    calories: 420,
    proteinGrams: 26,
    carbsGrams: 24,
    fatGrams: 22,
    fiberGrams: 7,
    timestamp: '08:15 AM',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
    majorIngredients: [
      '3 pasture-raised organic eggs',
      '1/2 ripe Haas avocado',
      '1 slice sprouted sourdough grain toast',
      '1 tsp grass-fed butter',
      'Pink Himalayan salt & cracked pepper'
    ],
    consumedSummary: 'High-density morning meal prepared with 3 pasture eggs, 1/2 avocado, sprouted toast, and grass-fed butter.',
    goalImpact: {
      goal: 'longevity',
      alignmentScore: 94,
      verdict: 'optimal',
      summaryEffect: 'Supplies 26g bioavailable protein and dense dietary choline, keeping insulin flat while providing essential substrates for cellular membrane fluidity and brain neurotransmitters.',
      physiologicalMechanisms: [
        'Choline fuels hepatic methylation pathways and acetylcholine synthesis.',
        'Monounsaturated oleic acid slows gastric emptying, preventing mid-morning reactive hypoglycemia.',
        'Lutein and zeaxanthin accumulate in the retinal macula for blue-light photoprotection.'
      ],
      keyNutrientsIdentified: ['Choline', 'Lutein & Zeaxanthin', 'Oleic Acid', 'Vitamin B12'],
      optimizationTip: 'Enjoy alongside a 10-minute daylight walk to lock in morning cortisol rhythms.'
    }
  },
  {
    id: 'nut_2',
    mealType: 'drink',
    itemType: 'drink',
    beverageCategory: 'tea',
    name: 'Ceremonial Matcha & Lion\'s Mane Nootropic Elixir',
    calories: 85,
    proteinGrams: 3,
    carbsGrams: 8,
    fatGrams: 4,
    fiberGrams: 1,
    timestamp: '10:45 AM',
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80',
    majorIngredients: [
      '1.5 tsp ceremonial Japanese matcha powder',
      '1 tsp organic Lion\'s Mane mushroom extract',
      '3/4 cup unsweetened oat milk',
      'Hot spring water',
      'Pinch of Ceylon cinnamon'
    ],
    consumedSummary: 'Bioactive functional drink prepared with ceremonial matcha, neuro-protective Lion\'s Mane mushroom, and oat milk.',
    goalImpact: {
      goal: 'metabolic_fitness',
      alignmentScore: 96,
      verdict: 'optimal',
      summaryEffect: 'Delivers potent EGCG catechins and L-Theanine without the cortisol spike of traditional coffee, enhancing cognitive alpha brainwaves and resting fat oxidation.',
      physiologicalMechanisms: [
        'EGCG inhibits COMT enzyme, prolonging norepinephrine-mediated cellular thermogenesis.',
        'L-Theanine crosses blood-brain barrier to trigger relaxed alertness (8-12 Hz alpha waves).',
        'Hericenones in Lion\'s Mane stimulate nerve growth factor (NGF) synthesis.'
      ],
      keyNutrientsIdentified: ['EGCG Catechins', 'L-Theanine', 'Hericenones', 'Chlorophyll'],
      optimizationTip: 'Drink slowly between morning focus blocks to maintain calm, non-jittery cognitive endurance.'
    }
  },
  {
    id: 'nut_3',
    mealType: 'lunch',
    itemType: 'meal',
    name: 'Mediterranean Wild Salmon & Quinoa Super Bowl',
    calories: 510,
    proteinGrams: 39,
    carbsGrams: 42,
    fatGrams: 17,
    fiberGrams: 8,
    timestamp: '01:15 PM',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    majorIngredients: [
      '150g wild Alaskan sockeye salmon fillet',
      '1/2 cup cooked organic tricolor quinoa',
      'Baby arugula, baby spinach, cucumber',
      '6 kalamata olives',
      '1 tbsp cold-pressed extra virgin olive oil',
      'Fresh lemon juice & oregano'
    ],
    consumedSummary: 'Anti-inflammatory powerhouse bowl prepared with wild salmon, tricolor quinoa, extra virgin olive oil, and fresh greens.',
    goalImpact: {
      goal: 'cardio',
      alignmentScore: 98,
      verdict: 'optimal',
      summaryEffect: 'Marine EPA/DHA Omega-3s combined with oleocanthal polyphenols directly lower vascular adhesion molecules, promote arterial nitric oxide dilation, and support cardiac stability.',
      physiologicalMechanisms: [
        'EPA/DHA incorporates directly into myocardial membranes, enhancing heart rate variability (HRV).',
        'Oleocanthal suppresses systemic NF-kB and COX inflammatory cascades.',
        'Soluble fiber and resistant starch feed colonic microbiota to produce beneficial short-chain fatty acids.'
      ],
      keyNutrientsIdentified: ['EPA/DHA Omega-3', 'Astaxanthin', 'Oleocanthal', 'Magnesium'],
      optimizationTip: 'Add an extra squeeze of fresh lemon to double the non-heme iron absorption from the greens.'
    }
  },
  {
    id: 'nut_4',
    mealType: 'snack',
    itemType: 'meal',
    name: 'Raw Activated Walnuts & Wild Blueberries',
    calories: 190,
    proteinGrams: 4,
    carbsGrams: 14,
    fatGrams: 13,
    fiberGrams: 4,
    timestamp: '04:30 PM',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    majorIngredients: [
      '1/4 cup raw sprouted walnuts',
      '1/3 cup fresh wild blueberries'
    ],
    consumedSummary: 'Clean afternoon brain fuel prepared with raw walnuts and antioxidant-dense wild blueberries.',
    goalImpact: {
      goal: 'longevity',
      alignmentScore: 92,
      verdict: 'supportive',
      summaryEffect: 'Anthocyanins easily cross the blood-brain barrier to promote BDNF, while walnut alpha-linolenic acid (ALA) curbs late-afternoon sugar cravings.',
      physiologicalMechanisms: [
        'Anthocyanins neutralize free radicals in hippocampal memory centers.',
        'L-Arginine from walnuts provides substrate for endothelial nitric oxide production.'
      ],
      keyNutrientsIdentified: ['Anthocyanins', 'Alpha-Linolenic Acid (ALA)', 'Ellagic Acid', 'Vitamin E'],
      optimizationTip: 'Pair with warm herbal tea to ease evening digestion.'
    }
  }
];
