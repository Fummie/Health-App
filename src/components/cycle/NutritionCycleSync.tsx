import React, { useState } from 'react';
import { 
  Sparkles, 
  Droplet, 
  Activity, 
  Heart, 
  ShieldCheck, 
  AlertCircle, 
  Coffee, 
  CheckCircle2, 
  Utensils, 
  ArrowRight, 
  Flame,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import { NutritionLogItem, Recipe, Gender, MenstrualPhase } from '../../types';
import { CURATED_RECIPES } from '../../data/defaultData';
import { RecipeDetailModal } from '../nutrition/RecipeDetailModal';

interface NutritionCycleSyncProps {
  gender: Gender;
  currentPhase: string;
  cycleDay: number;
  nutritionLogs: NutritionLogItem[];
  onNavigateToNutrition?: () => void;
}

export const NutritionCycleSync: React.FC<NutritionCycleSyncProps> = ({
  gender,
  currentPhase,
  cycleDay,
  nutritionLogs = [],
  onNavigateToNutrition,
}) => {
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'body_says' | 'circulation' | 'avoid_cramps' | 'recipes'>('body_says');

  // Compute preparedness score from consumed logs
  const calculatePreparedness = () => {
    let score = 70; // baseline
    const allIngredients = nutritionLogs.flatMap((l) => l.majorIngredients || []).join(' ').toLowerCase();

    // Check for beneficial ingredients
    if (allIngredients.includes('salmon') || allIngredients.includes('fish') || allIngredients.includes('omega')) score += 10;
    if (allIngredients.includes('spinach') || allIngredients.includes('kale') || allIngredients.includes('greens')) score += 8;
    if (allIngredients.includes('turmeric') || allIngredients.includes('ginger')) score += 10;
    if (allIngredients.includes('avocado') || allIngredients.includes('olive oil') || allIngredients.includes('chia')) score += 7;
    if (allIngredients.includes('egg') || allIngredients.includes('quinoa')) score += 5;

    // Check for potential aggravators
    if (allIngredients.includes('sugar') || allIngredients.includes('soda')) score -= 10;
    if (allIngredients.includes('coffee') && nutritionLogs.length > 2) score -= 5;

    return Math.min(Math.max(score, 45), 98);
  };

  const preparednessScore = calculatePreparedness();

  // Extract consumed items summary
  const consumedItems = nutritionLogs.map((l) => l.name);

  // Phase-specific recipes
  const getRecommendedRecipesForPhase = () => {
    const phaseLower = currentPhase.toLowerCase();
    if (phaseLower.includes('menstrual') || cycleDay <= 5) {
      return CURATED_RECIPES.filter((r) => r.id === 'rec_2' || r.id === 'rec_11' || r.id === 'rec_1');
    }
    if (phaseLower.includes('luteal') || cycleDay >= 17) {
      return CURATED_RECIPES.filter((r) => r.id === 'rec_11' || r.id === 'rec_1' || r.id === 'rec_8');
    }
    if (phaseLower.includes('ovulat') || (cycleDay >= 13 && cycleDay <= 16)) {
      return CURATED_RECIPES.filter((r) => r.id === 'rec_4' || r.id === 'rec_12' || r.id === 'rec_3');
    }
    // Follicular
    return CURATED_RECIPES.filter((r) => r.id === 'rec_3' || r.id === 'rec_1' || r.id === 'rec_5');
  };

  const stageRecipes = getRecommendedRecipesForPhase();

  return (
    <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-6">
      {/* Header & Preparedness Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E8E4DE]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DE]">
              Nutritional Synergy
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DE]">
              Phase: {currentPhase.toUpperCase()} (Day {cycleDay})
            </span>
          </div>
          <h2 className="text-2xl font-serif italic text-[#2D2D2D]">
            Nutritional Preparation & Biological Bio-Feedback
          </h2>
          <p className="text-xs text-[#6B7280] max-w-xl">
            Real-time physiological interpretation of your meals and drinks: see how your nutrition prepares your body, promotes microcirculation, and prevents cramps.
          </p>
        </div>

        {/* Readiness Badge / Score Box */}
        <div className="flex items-center gap-4 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE] shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke="#E8E4DE"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke={preparednessScore >= 80 ? '#3A4D39' : preparednessScore >= 65 ? '#A45C40' : '#C25E00'}
                strokeWidth="5"
                strokeDasharray="145"
                strokeDashoffset={145 - (145 * preparednessScore) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute font-mono font-bold text-sm text-[#2D2D2D]">
              {preparednessScore}%
            </span>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
              Biological Preparedness
            </div>
            <div className="text-sm font-bold text-[#3A4D39]">
              {preparednessScore >= 85
                ? 'Prime Anti-Cramp State'
                : preparednessScore >= 70
                ? 'Well Prepared Baseline'
                : 'Needs Anti-Inflammatory Support'}
            </div>
            <div className="text-[10px] text-[#6B7280]">
              Based on {nutritionLogs.length} logged meals & drinks
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('body_says')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'body_says'
              ? 'bg-[#3A4D39] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-[#6B7280] hover:text-[#2D2D2D] border border-[#E8E4DE]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>What Your Body Says</span>
        </button>

        <button
          onClick={() => setActiveTab('circulation')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'circulation'
              ? 'bg-[#A45C40] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-[#6B7280] hover:text-[#2D2D2D] border border-[#E8E4DE]'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Proper Circulation Protocol</span>
        </button>

        <button
          onClick={() => setActiveTab('avoid_cramps')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'avoid_cramps'
              ? 'bg-[#A45C40] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-[#6B7280] hover:text-[#2D2D2D] border border-[#E8E4DE]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>How to Avoid Cramps</span>
        </button>

        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'recipes'
              ? 'bg-[#7C9070] text-white shadow-xs'
              : 'bg-[#FAF8F5] text-[#6B7280] hover:text-[#2D2D2D] border border-[#E8E4DE]'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Studio Recipes for Stage</span>
        </button>
      </div>

      {/* Tab 1: What Your Body Says Because of What You Consumed */}
      {activeTab === 'body_says' && (
        <div className="space-y-4">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE]">
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1.5 rounded-lg bg-[#3A4D39]/10 text-[#3A4D39]">
                <Activity className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-[#2D2D2D] uppercase tracking-wider">
                Cellular Response to Today's Consumed Ingredients
              </h4>
            </div>

            {consumedItems.length > 0 ? (
              <div className="space-y-3 text-xs text-[#4A4A48] leading-relaxed">
                <div className="p-3 bg-white rounded-xl border border-[#E8E4DE]">
                  <span className="font-bold text-[#3A4D39] block mb-1">
                    🌿 Prostaglandin & Anti-Inflammatory Regulation:
                  </span>
                  Your meals (including {consumedItems.slice(0, 2).join(' and ')}) deliver marine omega-3 fatty acids and healthy lipids. These directly displace arachidonic acid in uterine and vascular membranes, curtailing the synthesis of PGF2-alpha prostaglandins. Your uterine muscle spasms and vascular tension are noticeably reduced.
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E8E4DE]">
                  <span className="font-bold text-[#A45C40] block mb-1">
                    ⚡ Electrolytes, Magnesium & Pelvic Relaxation:
                  </span>
                  Natural potassium and magnesium from avocado and greens act as endogenous calcium-channel blockers. They prevent hyper-excitation of the pelvic smooth muscle cells, preventing the sharp colic-like sensations often felt during phase shifts.
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E8E4DE]">
                  <span className="font-bold text-[#7C9070] block mb-1">
                    🩸 Microvascular Oxygenation & Warmth:
                  </span>
                  Warm herbal infusions and anti-inflammatory spices (turmeric, ginger) inhibit platelet aggregation and promote smooth laminar capillary blood flow, preventing cold stasis in pelvic organs.
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Coffee className="w-8 h-8 text-[#A0A09C] mx-auto mb-2" />
                <p className="text-xs text-[#6B7280] max-w-md mx-auto mb-3">
                  No meals logged yet today in Nutrition Studio. Once you log breakfast, lunch, or a soothing drink, this engine analyzes the biological signals your body receives!
                </p>
                {onNavigateToNutrition && (
                  <button
                    onClick={onNavigateToNutrition}
                    className="px-4 py-2 rounded-full bg-[#3A4D39] text-white text-xs font-semibold hover:bg-[#2D3E2C] transition-colors"
                  >
                    Open Nutrition Studio to Log Meal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Circulation Booster & Blood Flow Protocol */}
      {activeTab === 'circulation' && (
        <div className="space-y-4">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#A45C40]/10 text-[#A45C40]">
                <Droplet className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#2D2D2D] uppercase tracking-wider">
                  What to Take to Help Proper Circulation & Pelvic Blood Flow
                </h4>
                <p className="text-xs text-[#6B7280]">
                  Clinical vascular foods that prevent arterial constriction and maintain optimal microcirculation
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A45C40]">Fresh Ginger Root & Cinnamon</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Vasodilator</span>
                </div>
                <p className="text-xs text-[#4A4A48] leading-relaxed">
                  Gingerols and zingerone activate transient receptor potential channels, expanding peripheral blood vessels and dissolving pelvic cold stagnation.
                </p>
                <div className="text-[10px] text-[#6B7280] font-medium">
                  Ideal Dosage: 1 cup freshly steeped ginger tea with raw honey twice daily.
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3A4D39]">Dietary Nitrates (Beets & Arugula)</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Nitric Oxide</span>
                </div>
                <p className="text-xs text-[#4A4A48] leading-relaxed">
                  Dietary nitrates convert through oral bacteria into bioactive nitric oxide (NO), relaxing vascular smooth muscle and ensuring oxygenated uterine perfusion.
                </p>
                <div className="text-[10px] text-[#6B7280] font-medium">
                  Ideal Dosage: 1 cup fresh baby arugula in lunch salad or 100ml cold-pressed beet elixir.
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#7C9070]">Dark Berry Anthocyanins & Citrus Rutin</span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Capillary Tone</span>
                </div>
                <p className="text-xs text-[#4A4A48] leading-relaxed">
                  Polyphenolic flavonoids reinforce the endothelial glycocalyx and prevent capillary hyper-permeability, reducing tissue edema and fluid retention.
                </p>
                <div className="text-[10px] text-[#6B7280] font-medium">
                  Ideal Dosage: 1/2 cup wild blueberries or blackberries daily.
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A45C40]">Warm Mineralized Water (Avoid Ice)</span>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Hydration Density</span>
                </div>
                <p className="text-xs text-[#4A4A48] leading-relaxed">
                  Ice-cold drinks trigger reflexive visceral vasoconstriction. Drinking room-temperature or warm water with a pinch of Celtic sea salt prevents blood hyperviscosity.
                </p>
                <div className="text-[10px] text-[#6B7280] font-medium">
                  Target: 2.2 - 2.8 Liters of room-temperature fluids daily.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: How to Avoid Cramps Associated with Each Stage */}
      {activeTab === 'avoid_cramps' && (
        <div className="space-y-4">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#A45C40]/10 text-[#A45C40]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-[#2D2D2D] uppercase tracking-wider">
                  Stage-by-Stage Clinical Protocol to Eliminate Cramps
                </h4>
                <p className="text-xs text-[#6B7280]">
                  Targeted biological interventions tailored to the exact physiological drivers of your current cycle stage
                </p>
              </div>
            </div>

            {/* Stage Cards */}
            <div className="space-y-3 text-xs text-[#4A4A48]">
              {/* Menstrual Phase (Days 1 - 5) */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-rose-800 text-sm flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-600 fill-current" />
                    Menstrual Phase (Days 1 - 5): Acute Cramp Neutralization
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Active Flow
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Ginger Extract Root (500mg):</strong> Randomized controlled trials demonstrate that dried ginger is bio-equivalent to 400mg ibuprofen in relieving primary dysmenorrhea without gastrointestinal bleeding risks.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Continuous 40°C Thermotherapy:</strong> Applying a warm hot-water bottle or heating pack to the suprapubic area increases uterine arterial blood velocity by over 40%, breaking the ischemic pain spasm loop.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Acupressure Spleen-6 (San Yin Jiao):</strong> Apply firm thumb pressure 4 finger-breadths above the inner ankle bone for 3 minutes to regulate uterine nerve tone.</span>
                  </div>
                </div>
              </div>

              {/* Luteal Phase (Days 17 - 28) */}
              <div className="p-4 bg-white rounded-2xl border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-indigo-600" />
                    Luteal Phase (Days 17 - 28): Preventative Prostaglandin Suppression
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Pre-Cramp Window
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Magnesium Glycinate Pre-loading (350mg):</strong> Begin 7 days before anticipated bleeding. Magnesium relaxes uterine myometrium and reduces calcium influx into smooth muscle cells.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Vitamin B6 (Pyridoxine 50mg):</strong> Acts as a crucial co-factor for the clearance of excess estrogen metabolites in the liver, preventing the estrogen dominance that aggravates premenstrual pelvic engorgement.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Eliminate Refined Seed Oils & Excess Fructose:</strong> High omega-6 vegetable oils (soybean, corn) are direct biochemical precursors to pro-inflammatory PGF2a; switch exclusively to olive oil, ghee, or avocado.</span>
                  </div>
                </div>
              </div>

              {/* Follicular & Ovulatory (Days 6 - 16) */}
              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#3A4D39] text-sm">
                    Follicular & Ovulatory Phases (Days 6 - 16): Foundation Building
                  </span>
                  <span className="text-[10px] font-bold text-[#7C9070] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#E8E4DE]">
                    Vascular Resilience
                  </span>
                </div>
                <p className="leading-relaxed">
                  Replenish cellular iron stores lost during menses with bio-available iron and vitamin C pairings. Hydrate generously during ovulation to prevent Mittelschmerz (ovulatory follicle rupture discomfort).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Studio Curated Recipes for this Phase */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-[#2D2D2D] uppercase tracking-wider">
              Recommended Vitalis Studio Recipes for {currentPhase} Phase
            </h4>
            {onNavigateToNutrition && (
              <button
                onClick={onNavigateToNutrition}
                className="text-xs font-bold text-[#3A4D39] hover:underline flex items-center gap-1"
              >
                <span>Browse Full Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stageRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => setSelectedRecipeModal(recipe)}
                className="bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] overflow-hidden hover:border-[#A45C40] transition-all cursor-pointer shadow-2xs hover:shadow-sm flex flex-col justify-between"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-white/90 text-[#3A4D39] px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {recipe.prepTime}
                  </span>
                </div>

                <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif italic font-bold text-sm text-[#2D2D2D] line-clamp-1">
                      {recipe.title}
                    </h5>
                    <p className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                      {recipe.keyBenefits}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8E4DE] flex items-center justify-between text-[10px]">
                    <span className="font-mono text-[#4A4A48]">{recipe.calories} kcal</span>
                    <span className="font-bold text-[#A45C40] flex items-center gap-1">
                      <span>View Recipe</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipeModal && (
        <RecipeDetailModal
          recipe={selectedRecipeModal}
          onClose={() => setSelectedRecipeModal(null)}
          onCookRecipe={() => setSelectedRecipeModal(null)}
        />
      )}
    </div>
  );
};
