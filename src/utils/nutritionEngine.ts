import { HealthGoal, GoalImpactAnalysis, NutritionMealType, UserProfile } from '../types';

export interface IngredientAnalysisResult {
  consumedSummary: string;
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFats: number;
  estimatedFiber: number;
  glycemicImpact: 'Low' | 'Moderate' | 'High';
  keyNutrients: string[];
  goalImpact: GoalImpactAnalysis;
}

// Known nutrient profiles for common ingredients to power smart auto-calculation
interface IngredientProfile {
  keywords: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  bioactives: string[];
  glycemic: 'Low' | 'Moderate' | 'High';
  effects: {
    weight_loss: string;
    longevity: string;
    cardio: string;
    hormonal_balance: string;
    metabolic_fitness: string;
    stress_reduction: string;
  };
}

const INGREDIENT_DATABASE: IngredientProfile[] = [
  {
    keywords: ['salmon', 'trout', 'sardine', 'mackerel', 'tuna', 'cod', 'fish', 'seafood'],
    calories: 190,
    protein: 28,
    carbs: 0,
    fats: 8,
    fiber: 0,
    bioactives: ['Omega-3 (EPA/DHA)', 'Astaxanthin', 'Selenium', 'Vitamin D'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'High satiety index blunts appetite signals (ghrelin) for up to 4 hours while preserving lean metabolic tissue.',
      longevity: 'Marine EPA/DHA suppresses cellular senescence markers and downregulates NF-kB inflammatory cascades.',
      cardio: 'Directly lowers systemic triglycerides, improves arterial elasticity, and stabilizes myocardial membrane currents.',
      hormonal_balance: 'Provides essential fatty acids necessary for steroid hormone synthesis and cell receptor sensitivity.',
      metabolic_fitness: 'Zero glycemic impact prevents reactive insulin spikes and promotes uninterrupted fatty acid oxidation.',
      stress_reduction: 'DHA modulates neuro-inflammation, protecting hippocampal neurons from stress-induced cortisol damage.'
    }
  },
  {
    keywords: ['egg', 'eggs', 'egg white', 'omelette', 'scramble'],
    calories: 145,
    protein: 13,
    carbs: 1,
    fats: 10,
    fiber: 0,
    bioactives: ['Choline', 'Lutein & Zeaxanthin', 'Vitamin B12', 'Biotin'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Near-perfect biological protein value with high thermic effect, burning 25% of its calories during digestion.',
      longevity: 'Choline fuels cellular methylation pathways and homocysteine clearance to protect genetic telomeres.',
      cardio: 'HDL-enhancing phospholipid profile supports reverse cholesterol transport.',
      hormonal_balance: 'Dietary cholesterol from yolks provides the direct biochemical substrate for testosterone and progesterone synthesis.',
      metabolic_fitness: 'Flat insulin curve keeps GLUT4 receptors sensitive for daytime glucose handling.',
      stress_reduction: 'Supports acetylcholine neurotransmitter synthesis for steady parasympathetic vagal tone.'
    }
  },
  {
    keywords: ['chicken', 'turkey', 'poultry', 'breast'],
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.5,
    fiber: 0,
    bioactives: ['Carnitine', 'Niacin (B3)', 'Zinc', 'Phosphorus'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Maximum protein-to-energy ratio triggers maximal peptide YY release, accelerating metabolic resting burn.',
      longevity: 'Sustains musculoskeletal mass, the single strongest biomarker of physical longevity past age 60.',
      cardio: 'Ultra lean lipid profile minimizes vascular atherogenic load.',
      hormonal_balance: 'Supplies branched-chain amino acids for pituitary endocrine signaling.',
      metabolic_fitness: 'Spares glycogen reserves without elevating blood glucose.',
      stress_reduction: 'High tryptophan content serves as the biochemical precursor to calming serotonin.'
    }
  },
  {
    keywords: ['spinach', 'kale', 'arugula', 'greens', 'broccoli', 'cabbage', 'cauliflower', 'asparagus'],
    calories: 35,
    protein: 3,
    carbs: 5,
    fats: 0.5,
    fiber: 4,
    bioactives: ['Sulforaphane', 'Folate', 'Lutein', 'Chlorophyll', 'Vitamin K1'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Caloric density under 0.3 kcal/g delivers gastric stretch-receptor fullness with negligible caloric load.',
      longevity: 'Sulforaphane activates Nrf2 cellular defense pathways and stimulates phase-II hepatic detoxification.',
      cardio: 'Dietary inorganic nitrates convert into nitric oxide (NO), naturally dilating micro-vessels and reducing blood pressure.',
      hormonal_balance: 'Indole-3-carbinol and DIM actively support healthy liver clearance of antagonistic estrogen metabolites.',
      metabolic_fitness: 'Prebiotic cellulose fibers delay glucose absorption, flattening postprandial glucose curves.',
      stress_reduction: 'High cellular magnesium relaxes vascular smooth muscle and tempers central sympathetic output.'
    }
  },
  {
    keywords: ['avocado', 'guacamole'],
    calories: 160,
    protein: 2,
    carbs: 8,
    fats: 15,
    fiber: 7,
    bioactives: ['Oleic Acid', 'Potassium', 'Beta-Sitosterol', 'Glutathione'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Rich in monounsaturated fats that signal satiety hormone cholecystokinin (CCK) to end cravings.',
      longevity: 'Abundant glutathione protects mitochondrial membranes from endogenous oxidative stress.',
      cardio: 'Exceptional potassium content (more than bananas) counters sodium-induced vascular tension.',
      hormonal_balance: 'Plant sterols regulate adrenal cortisol without perturbing protective gonadal steroids.',
      metabolic_fitness: 'Zero glycemic spike with high soluble fiber feeds gut Akkermansia muciniphila for insulin sensitivity.',
      stress_reduction: 'B-complex vitamins replenish adrenal glands depleted by prolonged mental or physical stress.'
    }
  },
  {
    keywords: ['chia', 'chia seeds', 'flax', 'flaxseed', 'hemp', 'hemp seeds'],
    calories: 120,
    protein: 5,
    carbs: 8,
    fats: 8,
    fiber: 7,
    bioactives: ['Alpha-Linolenic Acid (ALA)', 'Mucilage Soluble Fiber', 'Lignans'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Hydrates into a dense mucilage gel in the stomach, physically delaying digestion and preventing sugar crashes.',
      longevity: 'Plant lignans exert phyto-protective antioxidant activity throughout the micro-biome.',
      cardio: 'Plant-based Omega-3 ALA reduces circulating inflammatory adhesion molecules on vascular walls.',
      hormonal_balance: 'Lignans gently bind excess estrogens in the gut, aiding balanced systemic hormone excretion.',
      metabolic_fitness: 'Forms a viscous gel layer in the small intestine that slows down sugar absorption to a slow trickle.',
      stress_reduction: 'Magnesium and zinc calm neuro-muscular excitability and support deeper restorative sleep.'
    }
  },
  {
    keywords: ['quinoa', 'brown rice', 'oats', 'oatmeal', 'sweet potato', 'potato', 'chickpeas', 'lentils', 'beans'],
    calories: 180,
    protein: 6,
    carbs: 34,
    fats: 2,
    fiber: 5,
    bioactives: ['Resistant Starch', 'Beta-Glucan', 'Complex Carbohydrates', 'Polyphenols'],
    glycemic: 'Moderate',
    effects: {
      weight_loss: 'Resistant starch bypasses small intestinal absorption, nourishing colonocytes without high caloric uptake.',
      longevity: 'Feeds butyrate-producing intestinal flora, strengthening the epithelial gut barrier against endotoxemia.',
      cardio: 'Soluble beta-glucans trap intestinal bile acids, accelerating low-density cholesterol excretion.',
      hormonal_balance: 'Supports steady evening insulin which aids pineal melatonin conversion for hormonal restoration.',
      metabolic_fitness: 'Slow-burn complex polysaccharide structure prevents sharp reactive hypoglycemia and fatigue.',
      stress_reduction: 'Triggers mild serotonin release in the brain, lowering acute subjective anxiety.'
    }
  },
  {
    keywords: ['matcha', 'green tea', 'tea', 'herbal tea', 'peppermint', 'chamomile', 'hibiscus'],
    calories: 25,
    protein: 1,
    carbs: 2,
    fats: 0,
    fiber: 0.5,
    bioactives: ['EGCG (Epigallocatechin Gallate)', 'L-Theanine', 'Anthocyanins', 'Quercetin'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'EGCG catechins inhibit catechol-O-methyltransferase, extending norepinephrine-mediated thermogenesis and fat burn.',
      longevity: 'Potent polyphenol class induces autophagy and mitigates systemic cellular senescence.',
      cardio: 'Hibiscus and tea polyphenols promote endothelial relaxation and microvascular flow.',
      hormonal_balance: 'Does not spike insulin; balances cortisol without overtaxing adrenal output.',
      metabolic_fitness: 'Improves peripheral insulin sensitivity and protects pancreatic beta-cells.',
      stress_reduction: 'L-Theanine crosses the blood-brain barrier to trigger relaxed alpha brainwaves (8-12 Hz) without sedation.'
    }
  },
  {
    keywords: ['coffee', 'espresso', 'cold brew', 'latte', 'cappuccino'],
    calories: 30,
    protein: 1,
    carbs: 2,
    fats: 0.5,
    fiber: 0,
    bioactives: ['Chlorogenic Acid', 'Caffeine', 'Trigonelline', 'Ferulic Acid'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Acutely boosts resting metabolic rate by 3-11% and stimulates adrenaline-driven adipocyte lipolysis.',
      longevity: 'High chlorogenic acid intake is statistically correlated with reduced all-cause cardiometabolic mortality.',
      cardio: 'Improves coronary endothelial function in habituated drinkers; excessive intake may temporarily raise acute blood pressure.',
      hormonal_balance: 'Consume before 2:00 PM to avoid blunting nocturnal growth hormone and progesterone clearance.',
      metabolic_fitness: 'Chlorogenic acids reduce intestinal glucose absorption and enhance liver glycogen turnover.',
      stress_reduction: 'Mild doses enhance alertness; keep intake bounded to prevent sustained HPA-axis cortisol spikes.'
    }
  },
  {
    keywords: ['berries', 'blueberry', 'blueberries', 'strawberry', 'raspberry', 'blackberry', 'tart cherry'],
    calories: 60,
    protein: 1,
    carbs: 14,
    fats: 0.5,
    fiber: 4,
    bioactives: ['Anthocyanins', 'Ellagic Acid', 'Resveratrol', 'Vitamin C'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Low glycemic load with abundant polyphenols that inhibit intestinal amylase and lipase enzymes.',
      longevity: 'Anthocyanins cross the blood-brain barrier to promote brain-derived neurotrophic factor (BDNF) and neurogenesis.',
      cardio: 'Protects LDL particles from oxidative modification and enhances flow-mediated arterial dilation.',
      hormonal_balance: 'Stabilizes luteal and follicular glucose fluctuations without insulin spikes.',
      metabolic_fitness: 'One of the lowest glycemic fruit profiles; dramatically mitigates post-meal reactive hypoglycemia.',
      stress_reduction: 'Tart cherry anthocyanins naturally provide bio-identical melatonin and suppress inflammatory cytokines.'
    }
  },
  {
    keywords: ['olive oil', 'extra virgin olive oil', 'olives'],
    calories: 120,
    protein: 0,
    carbs: 0,
    fats: 14,
    fiber: 0,
    bioactives: ['Oleocanthal', 'Hydroxytyrosol', 'Oleic Acid', 'Polyphenols'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Oleic acid is readily oxidized for direct energy rather than deposited into adipose tissue.',
      longevity: 'Oleocanthal acts as a natural COX inhibitor comparable to low-dose NSAIDs without gastric irritation.',
      cardio: 'Cornerstone of Mediterranean longevity: prevents oxidized LDL adhesion to endothelial walls.',
      hormonal_balance: 'Stabilizes lipid membrane fluidity, allowing peptide hormones to bind smoothly to cell surfaces.',
      metabolic_fitness: 'Adding extra virgin olive oil to carbohydrates slows gastric emptying and lowers total meal glycemic spike by up to 30%.',
      stress_reduction: 'Neuroprotective polyphenols reduce oxidative stress in the central nervous system.'
    }
  },
  {
    keywords: ['turmeric', 'ginger', 'garlic', 'cinnamon', 'rosemary', 'herbs', 'spices'],
    calories: 15,
    protein: 0.5,
    carbs: 3,
    fats: 0.2,
    fiber: 1,
    bioactives: ['Curcumin', 'Gingerols', 'Allicin', 'Cinnamaldehyde'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Ginger and cinnamaldehyde increase diet-induced thermogenesis and promote brown adipose tissue activation.',
      longevity: 'Curcumin suppresses NF-kB and downregulates pro-inflammatory cytokines TNF-alpha and IL-6.',
      cardio: 'Allicin from garlic naturally relaxes vascular walls and gently reduces arterial peripheral resistance.',
      hormonal_balance: 'Supports phase-II liver detoxification pathways critical for processing steroid metabolites.',
      metabolic_fitness: 'Cinnamon mimics insulin activity at cell surface receptors, accelerating muscle glucose clearance.',
      stress_reduction: 'Anti-inflammatory action mitigates stress-induced gut permeability and systemic inflammation.'
    }
  },
  {
    keywords: ['almonds', 'walnuts', 'nuts', 'nut butter', 'almond butter', 'peanut butter'],
    calories: 170,
    protein: 6,
    carbs: 6,
    fats: 15,
    fiber: 3,
    bioactives: ['L-Arginine', 'Vitamin E (alpha-tocopherol)', 'Magnesium', 'ALA Omega-3'],
    glycemic: 'Low',
    effects: {
      weight_loss: 'Cellular cell walls of whole nuts limit lipid bio-accessibility, so 15-20% of calories are excreted unabsorbed.',
      longevity: 'Rich in vitamin E isomers that protect delicate lipid cell membranes against free-radical peroxidation.',
      cardio: 'Walnuts provide dense L-arginine, the direct precursor for endothelial nitric oxide vessel relaxation.',
      hormonal_balance: 'Essential fats and zinc support testosterone production and ovarian follicular health.',
      metabolic_fitness: 'Adding nuts to any carbohydrate flattens the glucose spike and maintains stable postprandial energy.',
      stress_reduction: 'Abundant magnesium calms sympathetic nervous system tension and relaxes tense muscles.'
    }
  }
];

// Helper to match text to ingredient profiles
function matchIngredients(ingredients: string[]): {
  matchedProfiles: IngredientProfile[];
  keyBioactives: string[];
  totalCal: number;
  totalP: number;
  totalC: number;
  totalF: number;
  totalFib: number;
} {
  const combinedText = ingredients.join(' ').toLowerCase();
  const matched: IngredientProfile[] = [];
  const bioactivesSet = new Set<string>();

  for (const profile of INGREDIENT_DATABASE) {
    const hasMatch = profile.keywords.some((kw) => combinedText.includes(kw));
    if (hasMatch) {
      matched.push(profile);
      profile.bioactives.forEach((b) => bioactivesSet.add(b));
    }
  }

  // If no specific match, provide a healthy baseline
  if (matched.length === 0) {
    return {
      matchedProfiles: [],
      keyBioactives: ['Micronutrient Phytonutrients', 'Essential Minerals', 'Cellular Fuel'],
      totalCal: 280,
      totalP: 18,
      totalC: 25,
      totalF: 10,
      totalFib: 4,
    };
  }

  let totalCal = 0;
  let totalP = 0;
  let totalC = 0;
  let totalF = 0;
  let totalFib = 0;

  matched.forEach((p) => {
    totalCal += p.calories;
    totalP += p.protein;
    totalC += p.carbs;
    totalF += p.fats;
    totalFib += p.fiber;
  });

  return {
    matchedProfiles: matched,
    keyBioactives: Array.from(bioactivesSet),
    totalCal,
    totalP,
    totalC,
    totalF,
    totalFib,
  };
}

// Goal specific evaluation
export function analyzeMealAndIngredients(params: {
  name: string;
  mealType: NutritionMealType;
  ingredients: string[];
  goal: HealthGoal;
  userProfile?: UserProfile;
  manualCalories?: number;
  manualProtein?: number;
  manualCarbs?: number;
  manualFats?: number;
}): IngredientAnalysisResult {
  const { name, mealType, ingredients, goal, manualCalories, manualProtein, manualCarbs, manualFats } = params;

  const { matchedProfiles, keyBioactives, totalCal, totalP, totalC, totalF, totalFib } = matchIngredients(ingredients);

  const cal = manualCalories && manualCalories > 0 ? manualCalories : totalCal;
  const p = manualProtein && manualProtein > 0 ? manualProtein : totalP;
  const c = manualCarbs && manualCarbs > 0 ? manualCarbs : totalC;
  const f = manualFats && manualFats > 0 ? manualFats : totalF;
  const fib = totalFib;

  const isDrink = mealType === 'drink';
  const cleanIngredientsList = ingredients.filter(i => i.trim().length > 0);
  const ingredientString = cleanIngredientsList.length > 0 
    ? cleanIngredientsList.join(', ')
    : name;

  // Determine Glycemic Impact
  let glycemicImpact: 'Low' | 'Moderate' | 'High' = 'Low';
  if (c > 50 && fib < 4) {
    glycemicImpact = 'High';
  } else if (c > 30 || (c > 20 && p < 10)) {
    glycemicImpact = 'Moderate';
  } else {
    glycemicImpact = 'Low';
  }

  // Evaluate Alignment & Effects specifically for the targeted goal
  const goalNamesMap: Record<HealthGoal, string> = {
    weight_loss: 'Weight Loss & Satiety',
    longevity: 'Longevity & Cellular Health',
    cardio: 'Cardiovascular Health & Blood Pressure',
    hormonal_balance: 'Hormonal & Endocrine Optimization',
    metabolic_fitness: 'Metabolic Fitness & Low-Insulin',
    stress_reduction: 'Stress Reduction & Adrenal Balance'
  };

  const goalName = goalNamesMap[goal] || 'Optimal Health';
  const mechanisms: string[] = [];

  matchedProfiles.forEach((profile) => {
    if (profile.effects[goal]) {
      mechanisms.push(profile.effects[goal]);
    }
  });

  // Calculate alignment score based on the goal
  let alignmentScore = 85;
  let verdict: 'optimal' | 'supportive' | 'moderate' | 'caution' = 'supportive';
  let optimizationTip = 'Stay hydrated and pair with mindful chewing to maximize digestion.';

  switch (goal) {
    case 'weight_loss': {
      const proteinRatio = cal > 0 ? (p * 4) / cal : 0;
      if (proteinRatio >= 0.28 && fib >= 5 && glycemicImpact === 'Low') {
        alignmentScore = 96;
        verdict = 'optimal';
        optimizationTip = 'Outstanding satiety profile. Follow with a brisk 10-minute post-meal stroll to increase muscle GLUT4 uptake.';
      } else if (glycemicImpact === 'High') {
        alignmentScore = 62;
        verdict = 'moderate';
        optimizationTip = 'Higher glycemic load detected. Add leafy greens, lemon juice, or extra protein to blunt insulin spikes.';
      } else {
        alignmentScore = 88;
        verdict = 'supportive';
        optimizationTip = 'Solid fuel for fat oxidation. Drink a glass of water before eating to prime gastric stretch receptors.';
      }
      break;
    }
    case 'longevity': {
      const hasAntioxidants = keyBioactives.some(b => 
        ['Polyphenols', 'Sulforaphane', 'EGCG', 'Curcumin', 'Anthocyanins', 'Omega-3 (EPA/DHA)'].some(k => b.includes(k))
      );
      if (hasAntioxidants && fib >= 4) {
        alignmentScore = 97;
        verdict = 'optimal';
        optimizationTip = 'Exceptional antioxidant and anti-senescence density. Minimizes advanced glycation end-products (AGEs).';
      } else {
        alignmentScore = 86;
        verdict = 'supportive';
        optimizationTip = 'Drizzle with cold-pressed extra virgin olive oil to increase fat-soluble phytonutrient absorption.';
      }
      break;
    }
    case 'cardio': {
      const hasCardioFriendly = keyBioactives.some(b => 
        ['Omega-3 (EPA/DHA)', 'Potassium', 'Oleic Acid', 'Nitrates', 'L-Arginine'].some(k => b.includes(k))
      );
      if (hasCardioFriendly && glycemicImpact !== 'High') {
        alignmentScore = 95;
        verdict = 'optimal';
        optimizationTip = 'Supports endothelial nitric oxide production and flexible arterial compliance.';
      } else {
        alignmentScore = 84;
        verdict = 'supportive';
        optimizationTip = 'Keep sodium moderate and boost potassium with fresh avocado, leafy spinach, or lemon.';
      }
      break;
    }
    case 'hormonal_balance': {
      const hasHormoneFats = f >= 10 || keyBioactives.some(b => ['Choline', 'Lignans', 'Omega-3', 'Zinc'].some(k => b.includes(k)));
      if (hasHormoneFats && glycemicImpact !== 'High') {
        alignmentScore = 94;
        verdict = 'optimal';
        optimizationTip = 'Healthy lipid substrates supply essential building blocks for balanced steroid and thyroid hormone output.';
      } else {
        alignmentScore = 82;
        verdict = 'supportive';
        optimizationTip = 'Include cruciferous vegetables (broccoli sprouts, cauliflower) to support liver clearance of used hormones.';
      }
      break;
    }
    case 'metabolic_fitness': {
      if (glycemicImpact === 'Low' && fib >= 3) {
        alignmentScore = 98;
        verdict = 'optimal';
        optimizationTip = 'Near-zero insulin excursion ensures sustained cellular mitochondrial beta-oxidation and steady energy.';
      } else if (glycemicImpact === 'High') {
        alignmentScore = 65;
        verdict = 'moderate';
        optimizationTip = 'To prevent reactive hypoglycemia and afternoon fatigue, precede carbohydrates with fiber and protein.';
      } else {
        alignmentScore = 87;
        verdict = 'supportive';
        optimizationTip = 'Maintain steady hydration to support renal glucose filtration and electrolyte balance.';
      }
      break;
    }
    case 'stress_reduction': {
      const hasCalming = keyBioactives.some(b => 
        ['L-Theanine', 'Magnesium', 'Choline', 'Omega-3', 'B-complex'].some(k => b.includes(k))
      );
      if (hasCalming) {
        alignmentScore = 95;
        verdict = 'optimal';
        optimizationTip = 'Calming nutrients nourish the central nervous system and buffer against sympathetic cortisol spikes.';
      } else {
        alignmentScore = 83;
        verdict = 'supportive';
        optimizationTip = 'Enjoy in a calm environment without screens to activate vagus-mediated digestive parasympathetic tone.';
      }
      break;
    }
    default:
      alignmentScore = 88;
      verdict = 'supportive';
      optimizationTip = 'Balanced whole-food nourishment supporting daily metabolic equilibrium.';
  }

  // Summary effect on targeted result
  let summaryEffect = '';
  if (isDrink) {
    summaryEffect = `Consumed ${name} prepared with ${ingredientString}. Delivers fast-absorbing hydration, ${cal} kcal, ${p}g protein, and ${keyBioactives.slice(0, 3).join(', ')}. Directly supports your ${goalName} plan by maintaining steady internal balance and cellular nutrient delivery.`;
  } else {
    summaryEffect = `Consumed ${name} prepared with ${ingredientString}. Supplies ${cal} kcal (${p}g protein, ${c}g carbs, ${f}g fats, ${fib}g fiber) with ${glycemicImpact.toLowerCase()} glycemic impact. Synergizes with your ${goalName} plan by ${mechanisms[0] || 'delivering nutrient-dense substrates for cellular recovery'}.`;
  }

  if (mechanisms.length === 0) {
    mechanisms.push(`Supplies clean cellular energy and amino acids without triggering excessive glycemic volatility.`);
    mechanisms.push(`Delivers bio-available micronutrients that nourish cellular mitochondria and metabolic enzymes.`);
  }

  const goalImpact: GoalImpactAnalysis = {
    goal,
    alignmentScore,
    verdict,
    summaryEffect,
    physiologicalMechanisms: mechanisms.slice(0, 3),
    keyNutrientsIdentified: keyBioactives.slice(0, 4),
    optimizationTip,
  };

  return {
    consumedSummary: isDrink ? `Beverage: ${name} (${cleanIngredientsList.join(', ')})` : `Meal: ${name} (${cleanIngredientsList.join(', ')})`,
    estimatedCalories: cal,
    estimatedProtein: p,
    estimatedCarbs: c,
    estimatedFats: f,
    estimatedFiber: fib,
    glycemicImpact,
    keyNutrients: keyBioactives,
    goalImpact,
  };
}

/**
 * Deterministic recipe formulator that creates a clinical, delicious recipe
 * tailored to user ingredients and targeted goal when the AI model is experiencing spikes in demand.
 */
export function formulateDeterministicRecipe(params: {
  ingredientsOnHand: string;
  dietaryPreference?: string;
  prepTimeLimit?: string;
  healthGoal?: string;
  gender?: string;
}): any {
  const { ingredientsOnHand, dietaryPreference = 'Healthy whole foods', prepTimeLimit = '12 minutes', healthGoal = 'Metabolic & Longevity', gender } = params;
  const lower = ingredientsOnHand.toLowerCase();

  let title = 'Nourishing Vitalis Longevity Bowl';
  let category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'smoothie' | 'drink' = 'lunch';
  let itemType: 'food' | 'drink' = 'food';
  let imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  let cal = 440;
  let p = '32g';
  let c = '38g';
  let f = '16g';
  let fib = '7g';
  let keyBenefits = 'Rich in anti-inflammatory micronutrients, bio-available clean protein, and slow-burning complex fiber to support sustained cellular ATP production.';
  let quickTip = 'Drizzle extra virgin olive oil cold at the end to keep heat-sensitive polyphenol bonds intact.';

  const ingredientsList: string[] = [];
  const stepsList: string[] = [];

  if (lower.includes('salmon') || lower.includes('trout') || lower.includes('fish')) {
    title = 'Pan-Seared Wild Salmon with Wilted Greens & Citrus Emulsion';
    imageUrl = 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80';
    cal = 460;
    p = '38g';
    c = '18g';
    f = '22g';
    fib = '5g';
    keyBenefits = 'High concentration of marine Omega-3 fatty acids (EPA/DHA) and astaxanthin reduces arterial stiffness and suppresses systemic TNF-alpha.';
    quickTip = 'Cook skin-side down first on medium heat for 4 minutes to crisp the skin and preserve heat-sensitive omega-3 oils.';
    ingredientsList.push('1 fillet wild Alaskan salmon (approx. 180g)');
    ingredientsList.push('2 generous cups baby spinach or shredded lacinato kale');
    ingredientsList.push('1 tbsp extra virgin cold-pressed olive oil');
    ingredientsList.push('1/2 organic lemon (freshly juiced)');
    ingredientsList.push('1 clove fresh garlic, minced');
    ingredientsList.push('Pinch of Himalayan pink salt & cracked black pepper');

    stepsList.push('Pat salmon dry and season both sides with salt and black pepper.');
    stepsList.push('Warm olive oil in a skillet over medium heat. Place salmon skin-side down for 4 minutes, flip and cook 3 minutes until medium-rare.');
    stepsList.push('Toss garlic and greens into the same pan for 90 seconds until vibrant green and lightly wilted.');
    stepsList.push('Plate salmon over the greens, squeeze fresh lemon over the fillet, and serve immediately.');
  } else if (lower.includes('egg') || lower.includes('omelette') || lower.includes('scramble')) {
    title = 'Pasture-Raised Mediterranean Herb Omelette with Avocado';
    imageUrl = 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80';
    category = 'breakfast';
    cal = 390;
    p = '24g';
    c = '12g';
    f = '26g';
    fib = '6g';
    keyBenefits = 'Choline and lutein from egg yolks nourish acetylcholine neurotransmitter synthesis, while monounsaturated avocado fats stabilize post-meal satiety.';
    quickTip = 'Cook eggs over low heat to avoid oxidizing delicate cholesterol and lutein particles.';
    ingredientsList.push('3 pasture-raised organic eggs');
    ingredientsList.push('1/2 ripe Haas avocado, sliced');
    ingredientsList.push('1 cup baby spinach or microgreens');
    ingredientsList.push('1 tsp extra virgin olive oil or grass-fed ghee');
    ingredientsList.push('Fresh chives and pinch of sea salt');

    stepsList.push('Whisk eggs lightly with a fork and a pinch of sea salt.');
    stepsList.push('Melt ghee or olive oil in a non-stick pan over medium-low heat.');
    stepsList.push('Pour eggs, cook gently for 2 minutes until almost set, fold in baby spinach, and transfer to plate.');
    stepsList.push('Top with sliced avocado, fresh chopped chives, and serve warm.');
  } else if (lower.includes('smoothie') || lower.includes('berry') || lower.includes('blueberr') || lower.includes('chia')) {
    title = 'Antioxidant Berry & Chia Longevity Elixir';
    category = 'smoothie';
    itemType = 'drink';
    imageUrl = 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80';
    cal = 310;
    p = '20g';
    c = '36g';
    f = '10g';
    fib = '11g';
    keyBenefits = 'Anthocyanins cross the blood-brain barrier to scavenge reactive oxygen species, while soluble chia mucilage nourishes gut Akkermansia muciniphila.';
    quickTip = 'Pre-soak chia seeds in almond milk for 5 minutes before blending to maximize gelatinous fiber extraction.';
    ingredientsList.push('1 cup wild organic blueberries (fresh or frozen)');
    ingredientsList.push('1 tbsp whole chia seeds');
    ingredientsList.push('1 scoop unflavored or vanilla clean protein powder');
    ingredientsList.push('1 cup unsweetened almond or oat milk');
    ingredientsList.push('1/2 tsp ground Ceylon cinnamon');

    stepsList.push('Combine plant milk, wild blueberries, and protein powder in a high-speed blender.');
    stepsList.push('Blend on high for 45 seconds until velvety smooth.');
    stepsList.push('Stir in chia seeds and sprinkle cinnamon on top for blood-sugar stabilization.');
  } else if (lower.includes('chicken') || lower.includes('poultry')) {
    title = 'Herb-Crusted Golden Chicken & Roasted Broccoli Skillet';
    imageUrl = 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80';
    cal = 430;
    p = '42g';
    c = '14g';
    f = '18g';
    fib = '5g';
    keyBenefits = 'High biological value leucine activates muscle mTOR for tissue repair; sulforaphane in broccoli upregulates cellular Nrf2 detox pathways.';
    quickTip = 'Chop broccoli 15 minutes before cooking to maximize the enzymatic formation of bioactive sulforaphane.';
    ingredientsList.push('1 free-range chicken breast (approx. 200g), sliced into cutlets');
    ingredientsList.push('2 cups fresh broccoli florets');
    ingredientsList.push('1 tbsp avocado oil or cold-pressed olive oil');
    ingredientsList.push('1 tsp dried oregano & rosemary');
    ingredientsList.push('Sea salt & lemon zest');

    stepsList.push('Season chicken cutlets with herbs, sea salt, and lemon zest.');
    stepsList.push('Heat skillet with oil, sear chicken 4 minutes per side until golden and cooked through.');
    stepsList.push('Add broccoli florets to pan edges with 2 tbsp water, cover with lid to steam-sear for 3 minutes.');
    stepsList.push('Plate chicken alongside tender crisp broccoli and drizzle pan juices over top.');
  } else {
    // Default whole food rainbow bowl
    title = 'Vitalis Nutrient-Dense Garden Harvest Bowl';
    imageUrl = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80';
    cal = 380;
    p = '22g';
    c = '42g';
    f = '14g';
    fib = '9g';
    keyBenefits = 'Broad spectrum phytonutrients optimize cellular methylation and provide prebiotic sustenance for diverse intestinal microbiome strains.';
    quickTip = 'Chew thoroughly to activate salivary amylase and improve bio-availability of fat-soluble vitamins.';
    ingredientsList.push('1 cup cooked organic quinoa or brown rice');
    ingredientsList.push('1 cup mixed greens (spinach, arugula, watercress)');
    ingredientsList.push('1/2 avocado or handful raw walnuts');
    ingredientsList.push('1/2 cup steamed or sautéed seasonal vegetables');
    ingredientsList.push('1 tbsp extra virgin olive oil + apple cider vinegar dressing');

    stepsList.push('Warm grain base and spoon into a wide bowl.');
    stepsList.push('Layer fresh mixed greens and warm vegetables on top.');
    stepsList.push('Add sliced avocado and drizzle with olive oil and apple cider vinegar.');
    stepsList.push('Toss gently and enjoy immediately.');
  }

  return {
    title,
    prepTime: prepTimeLimit,
    servings: 1,
    difficulty: 'Easy',
    targetGoal: healthGoal,
    calories: cal,
    macros: { protein: p, carbs: c, fats: f, fiber: fib },
    keyBenefits,
    ingredients: ingredientsList,
    steps: stepsList,
    quickTip,
    category,
    itemType,
    imageUrl,
    dietaryMatch: [dietaryPreference],
  };
}

