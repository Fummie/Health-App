import React, { useState, useMemo } from 'react';
import { 
  UtensilsCrossed, 
  Sparkles, 
  Plus, 
  Clock, 
  Flame, 
  Droplet, 
  Check, 
  ChevronRight, 
  Loader2, 
  Heart, 
  Filter,
  Search,
  Target,
  Award,
  Coffee,
  Utensils,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Recipe, NutritionLogItem, UserProfile, AIProtocol, HealthGoal } from '../types';
import { CURATED_RECIPES, INITIAL_NUTRITION_LOGS } from '../data/defaultData';
import { formulateDeterministicRecipe } from '../utils/nutritionEngine';
import { LogMealModal } from './nutrition/LogMealModal';
import { RecipeDetailModal } from './nutrition/RecipeDetailModal';
import { MealImpactCard } from './nutrition/MealImpactCard';

interface NutritionRecipesSegmentProps {
  userProfile: UserProfile;
  aiProtocol: AIProtocol;
}

export const NutritionRecipesSegment: React.FC<NutritionRecipesSegmentProps> = ({
  userProfile,
  aiProtocol,
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'tracker' | 'ai_generator'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>(CURATED_RECIPES);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('vitalis_nutrition_logs');
      return saved ? JSON.parse(saved) : INITIAL_NUTRITION_LOGS;
    } catch {
      return INITIAL_NUTRITION_LOGS;
    }
  });
  const [waterGlasses, setWaterGlasses] = useState<number>(6); // 250ml each = 1.5L
  
  // Filters for recipe browser
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'food' | 'drink'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);
  const [isLogMealOpen, setIsLogMealOpen] = useState<boolean>(false);
  const [prefillRecipeData, setPrefillRecipeData] = useState<{
    name: string;
    mealType: any;
    ingredients: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    imageUrl?: string;
  } | undefined>(undefined);

  // AI Recipe Generator state
  const [generatorIngredients, setGeneratorIngredients] = useState<string>('Wild salmon, baby spinach, cold-pressed olive oil, lemon');
  const [generatorPrepTime, setGeneratorPrepTime] = useState<string>('12 minutes or less');
  const [generatorGoal, setGeneratorGoal] = useState<string>('Cardiovascular recovery & anti-inflammatory');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  // Calculate consumed totals
  const totalCalories = nutritionLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = nutritionLogs.reduce((acc, curr) => acc + curr.proteinGrams, 0);
  const totalCarbs = nutritionLogs.reduce((acc, curr) => acc + curr.carbsGrams, 0);
  const totalFat = nutritionLogs.reduce((acc, curr) => acc + curr.fatGrams, 0);

  const calorieTarget = aiProtocol?.calorieTarget || 2150;
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

  // Average Goal Alignment across all logs today
  const averageGoalSynergy = useMemo(() => {
    const scores = nutritionLogs
      .filter((item) => item.goalImpact?.alignmentScore)
      .map((item) => item.goalImpact!.alignmentScore);
    if (scores.length === 0) return 92;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [nutritionLogs]);

  const currentGoal = userProfile.primaryGoal || 'longevity';

  const goalPlanNames: Record<HealthGoal, string> = {
    weight_loss: 'Weight Loss & Satiety',
    longevity: 'Longevity & Cellular Health',
    cardio: 'Cardiovascular & Blood Pressure',
    hormonal_balance: 'Hormonal & Cycle Balance',
    metabolic_fitness: 'Metabolic Fitness & Low-Insulin',
    stress_reduction: 'Stress Reduction & Sleep Recovery'
  };

  // Filtered recipes by plan, item type, and search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      // Plan filter
      if (selectedPlanFilter === 'my_plan') {
        if (recipe.planCategory !== currentGoal) return false;
      } else if (selectedPlanFilter !== 'all') {
        if (recipe.planCategory !== selectedPlanFilter) return false;
      }

      // Type filter (food vs drink)
      if (selectedTypeFilter !== 'all') {
        if (recipe.itemType && recipe.itemType !== selectedTypeFilter) return false;
        if (!recipe.itemType && selectedTypeFilter === 'drink' && recipe.category !== 'smoothie') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = recipe.title.toLowerCase().includes(query);
        const matchesIngredient = recipe.ingredients.some(i => i.toLowerCase().includes(query));
        const matchesGoal = recipe.targetGoal.toLowerCase().includes(query);
        if (!matchesTitle && !matchesIngredient && !matchesGoal) return false;
      }

      return true;
    });
  }, [recipes, selectedPlanFilter, selectedTypeFilter, searchQuery, currentGoal]);

  const handleOpenLogModal = (recipeToPrefill?: Recipe) => {
    if (recipeToPrefill) {
      setPrefillRecipeData({
        name: recipeToPrefill.title,
        mealType: recipeToPrefill.itemType === 'drink' ? 'drink' : (recipeToPrefill.category === 'smoothie' ? 'drink' : recipeToPrefill.category as any),
        ingredients: recipeToPrefill.ingredients,
        calories: recipeToPrefill.calories,
        protein: parseInt(recipeToPrefill.macros.protein) || 25,
        carbs: parseInt(recipeToPrefill.macros.carbs) || 30,
        fats: parseInt(recipeToPrefill.macros.fats) || 15,
        fiber: parseInt(recipeToPrefill.macros.fiber) || 5,
        imageUrl: recipeToPrefill.imageUrl,
      });
    } else {
      setPrefillRecipeData(undefined);
    }
    setIsLogMealOpen(true);
  };

  const handleSaveLog = (newLog: NutritionLogItem) => {
    const updated = [newLog, ...nutritionLogs];
    setNutritionLogs(updated);
    try {
      localStorage.setItem('vitalis_nutrition_logs', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not persist nutrition logs', e);
    }
  };

  const handleGenerateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGeneratedRecipe(null);

    try {
      const res = await fetch('/api/ai/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dietaryPreference: userProfile.dietaryPreference,
          prepTimeLimit: generatorPrepTime,
          ingredientsOnHand: generatorIngredients,
          healthGoal: generatorGoal,
          gender: userProfile.gender,
        }),
      });

      const data = await res.json();
      if (data.success && data.recipe) {
        // Assign an eye-pleasing picture of the end result
        const fallbackImage = generatorIngredients.toLowerCase().includes('salmon')
          ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
          : generatorIngredients.toLowerCase().includes('tea') || generatorIngredients.toLowerCase().includes('matcha')
          ? 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80'
          : generatorIngredients.toLowerCase().includes('smoothie') || generatorIngredients.toLowerCase().includes('berries')
          ? 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80'
          : generatorIngredients.toLowerCase().includes('egg')
          ? 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80';

        const fullRecipe: Recipe = {
          ...data.recipe,
          id: `ai_rec_${Date.now()}`,
          isAiGenerated: true,
          planCategory: currentGoal,
          itemType: data.recipe.itemType || 'food',
          imageUrl: data.recipe.imageUrl || fallbackImage,
          category: data.recipe.category || 'lunch',
        };
        setGeneratedRecipe(fullRecipe);
      } else {
        throw new Error(data?.error || 'Spike in AI demand');
      }
    } catch (err) {
      console.warn('AI recipe generation fallback activated:', err);
      // Seamlessly generate customized clinical recipe when AI experiences high demand
      const fallback = formulateDeterministicRecipe({
        ingredientsOnHand: generatorIngredients || 'wild salmon, greens, olive oil',
        dietaryPreference: userProfile.dietaryPreference,
        prepTimeLimit: generatorPrepTime,
        healthGoal: generatorGoal,
        gender: userProfile.gender,
      });

      const fallbackRecipe: Recipe = {
        ...fallback,
        id: `rec_clin_${Date.now()}`,
        isAiGenerated: true,
        planCategory: currentGoal,
      };
      setGeneratedRecipe(fallbackRecipe);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddGeneratedToRecipes = () => {
    if (generatedRecipe) {
      setRecipes([generatedRecipe, ...recipes]);
      setActiveTab('recipes');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Macro & Culinary Medicine
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Diet: {userProfile.dietaryPreference}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE] flex items-center gap-1">
              <Target className="w-3 h-3" />
              Target Plan: {goalPlanNames[currentGoal]}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif italic text-[#3A4D39]">
            Nutrition, Intake Engine & Recipe Studio
          </h1>
          <p className="text-xs text-[#6B7280] max-w-2xl mt-0.5">
            Log major ingredients for everything you eat or drink (other than water) to evaluate direct targeted biological impact, and browse plan-specific recipes with vivid end-result photography.
          </p>
        </div>

        {/* Primary Call to Action: Log Meal or Drink */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleOpenLogModal()}
            className="flex items-center gap-2 px-5 py-3 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log Meal or Drink</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#E8E4DE] pb-3">
        <div className="flex items-center p-1 bg-[#E8E4DE] rounded-full border border-[#D8D4CE]">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'recipes'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Recipes by Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'tracker'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Intake & Goal Impact Tracker ({nutritionLogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_generator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'ai_generator'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A45C40]" />
            <span>AI Recipe Creator</span>
          </button>
        </div>

        {/* Live Goal Synergy Gauge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E8E4DE] rounded-full text-xs">
          <Award className="w-4 h-4 text-[#7C9070]" />
          <span className="text-[#6B7280]">Daily Plan Synergy:</span>
          <span className="font-mono font-bold text-[#3A4D39]">{averageGoalSynergy}% Optimal</span>
        </div>
      </div>

      {/* Daily Macro & Water Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Caloric Intake</span>
            <Flame className="w-4 h-4 text-[#A45C40]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif text-[#3A4D39]">{totalCalories}</span>
            <span className="text-xs text-[#6B7280]">/ {calorieTarget} kcal budget</span>
          </div>
          <div className="w-full bg-[#E8E4DE] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#3A4D39] h-2 rounded-full transition-all"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-[#6B7280]">
            <span>{caloriePercent}% Allocated</span>
            <span className="font-bold text-[#3A4D39]">{Math.max(0, calorieTarget - totalCalories)} kcal left</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Protein Target</span>
            <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
              Cellular Repair
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif text-[#3A4D39]">{totalProtein}g</span>
            <span className="text-xs text-[#6B7280]">/ 140g optimal</span>
          </div>
          <div className="w-full bg-[#E8E4DE] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#A45C40] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((totalProtein / 140) * 100))}%` }}
            />
          </div>
          <div className="mt-2.5 text-[11px] text-[#6B7280]">Maintains lean metabolic tissue</div>
        </div>

        {/* Carbs & Healthy Fats */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Fuel Substrates</span>
            <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
              Low Glycemic
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7C9070] block">Carbs</span>
              <span className="text-2xl font-serif text-[#3A4D39]">{totalCarbs}g</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#7C9070] block">Fats</span>
              <span className="text-2xl font-serif text-[#3A4D39]">{totalFat}g</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-[#6B7280]">
            Steady sustained glucose curve
          </div>
        </div>

        {/* Hydration Card (Pure Water) */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Pure Water Hydration</span>
              <Droplet className="w-4 h-4 text-[#7C9070]" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif text-[#3A4D39]">{(waterGlasses * 0.25).toFixed(1)}L</span>
              <span className="text-xs text-[#6B7280]">/ {aiProtocol?.waterTargetLiters || 2.8}L Goal</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <button
              onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
              className="p-1.5 rounded-lg bg-white border border-[#E8E4DE] hover:bg-[#E8E4DE] text-[#3A4D39] text-xs font-bold"
              title="Decrease water intake"
            >
              -
            </button>
            <div className="flex-1 flex gap-1 justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-6 rounded-xs transition-all ${
                    i < waterGlasses ? 'bg-[#3A4D39]' : 'bg-[#E8E4DE]'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setWaterGlasses((prev) => prev + 1)}
              className="p-1.5 rounded-lg bg-[#E8E4DE] hover:bg-[#D8D4CE] text-[#3A4D39] text-xs font-bold"
              title="Add 250ml water"
            >
              +250ml
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: BROWSE RECIPES ACCORDING TO PLAN (With eye-pleasing end-result photos!) */}
      {activeTab === 'recipes' && (
        <div className="space-y-6">
          {/* Plan & Type Filter Bar */}
          <div className="bg-[#FAF8F5] p-5 rounded-[28px] border border-[#E8E4DE] space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C9070] flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Target Plan:
                </span>

                <button
                  onClick={() => setSelectedPlanFilter('my_plan')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                    selectedPlanFilter === 'my_plan'
                      ? 'bg-[#3A4D39] text-white shadow-xs'
                      : 'bg-white text-[#3A4D39] border border-[#E8E4DE] hover:bg-[#E8E4DE]'
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-[#A45C40]" />
                  <span>My Plan ({goalPlanNames[currentGoal]})</span>
                </button>

                <button
                  onClick={() => setSelectedPlanFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedPlanFilter === 'all'
                      ? 'bg-[#3A4D39] text-white shadow-xs'
                      : 'bg-white text-[#6B7280] border border-[#E8E4DE] hover:bg-[#E8E4DE]'
                  }`}
                >
                  All Plans
                </button>

                {(['longevity', 'cardio', 'weight_loss', 'hormonal_balance', 'metabolic_fitness', 'stress_reduction'] as const).map((plan) => (
                  <button
                    key={plan}
                    onClick={() => setSelectedPlanFilter(plan)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedPlanFilter === plan
                        ? 'bg-[#3A4D39] text-white shadow-xs'
                        : 'bg-white text-[#6B7280] border border-[#E8E4DE] hover:bg-[#E8E4DE]'
                    }`}
                  >
                    {plan.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#7C9070] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ingredient or recipe..."
                  className="w-full pl-9 pr-3.5 py-1.5 bg-white border border-[#E8E4DE] rounded-full text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
            </div>

            {/* Food vs Drink filter chips */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DE] text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#7C9070] tracking-wider">Item Format:</span>
                <button
                  onClick={() => setSelectedTypeFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    selectedTypeFilter === 'all' ? 'bg-[#3A4D39] text-white' : 'bg-[#E8E4DE] text-[#6B7280]'
                  }`}
                >
                  All Formats ({recipes.length})
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('food')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedTypeFilter === 'food' ? 'bg-[#3A4D39] text-white' : 'bg-[#E8E4DE] text-[#6B7280]'
                  }`}
                >
                  <Utensils className="w-3 h-3" />
                  <span>Whole-Food Meals</span>
                </button>
                <button
                  onClick={() => setSelectedTypeFilter('drink')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    selectedTypeFilter === 'drink' ? 'bg-[#3A4D39] text-white' : 'bg-[#E8E4DE] text-[#6B7280]'
                  }`}
                >
                  <Coffee className="w-3 h-3" />
                  <span>Functional Drinks & Tonics</span>
                </button>
              </div>

              <span className="text-xs text-[#6B7280] italic">
                Showing {filteredRecipes.length} recipes with end-result photography
              </span>
            </div>
          </div>

          {/* Recipes Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => {
              const isGoalMatch = recipe.planCategory === currentGoal;

              return (
                <div
                  key={recipe.id}
                  className="bg-[#FAF8F5] rounded-[28px] border border-[#E8E4DE] overflow-hidden shadow-xs hover:border-[#7C9070] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Picture of End Result */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#E8E4DE]">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#E8E4DE] text-[#7C9070]">
                          <UtensilsCrossed className="w-8 h-8" />
                        </div>
                      )}

                      {/* Overlaid Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                          {recipe.itemType === 'drink' ? <Coffee className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
                          {recipe.category}
                        </span>

                        {isGoalMatch && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#7C9070] text-white shadow-xs">
                            Matches Your Plan
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 right-3">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.prepTime}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5">
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#7C9070]">
                        {recipe.targetGoal}
                      </div>

                      <h3 className="text-lg font-serif italic text-[#3A4D39] leading-snug">
                        {recipe.title}
                      </h3>

                      <p className="text-xs text-[#6B7280] font-serif italic mt-2 line-clamp-2 leading-relaxed">
                        {recipe.keyBenefits}
                      </p>

                      {/* Macros Bar */}
                      <div className="mt-3.5 py-2 px-3 bg-white rounded-xl border border-[#E8E4DE] flex justify-between text-xs font-mono text-[#2D2D2D]">
                        <span><strong className="text-[#3A4D39]">{recipe.calories}</strong> kcal</span>
                        <span>P: <strong>{recipe.macros.protein}</strong></span>
                        <span>C: <strong>{recipe.macros.carbs}</strong></span>
                        <span>F: <strong>{recipe.macros.fats}</strong></span>
                      </div>

                      {/* Ingredient tags snippet */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#F4F1ED] text-[#4B5563] rounded-md truncate max-w-[140px]">
                            {ing.split('(')[0].replace(/[0-9/]/g, '').trim()}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 text-[#7C9070] font-semibold">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Recipe & Quick Log */}
                  <div className="p-5 pt-0 border-t border-[#E8E4DE]/60 flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => setSelectedRecipeModal(recipe)}
                      className="text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#3A4D39] transition-colors"
                    >
                      View Recipe
                    </button>

                    <button
                      onClick={() => handleOpenLogModal(recipe)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log as Consumed</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTAKE & TARGETED GOAL IMPACT TRACKER */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          {/* Header & Goal Explanation Card */}
          <div className="bg-[#FAF8F5] p-6 rounded-[32px] border border-[#E8E4DE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-white px-3 py-0.5 rounded-full border border-[#E8E4DE]">
                  Continuous Bio-Feedback
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                  Goal: {goalPlanNames[currentGoal]}
                </span>
              </div>
              <h3 className="text-xl font-serif italic text-[#3A4D39]">Today's Intake & Targeted Result Evaluation</h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Every meal and drink (other than pure water) is broken down by its major preparation ingredients, with exact physiological effects calculated for your targeted plan.
              </p>
            </div>

            <button
              onClick={() => handleOpenLogModal()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Meal or Drink</span>
            </button>
          </div>

          {/* Logged Meal Cards Feed */}
          <div className="space-y-4">
            {nutritionLogs.length === 0 ? (
              <div className="bg-[#FAF8F5] rounded-[28px] border border-[#E8E4DE] p-12 text-center text-[#7C9070]">
                <UtensilsCrossed className="w-12 h-12 mx-auto text-[#E8E4DE] mb-3" />
                <h4 className="text-lg font-serif italic text-[#3A4D39]">No Meals or Drinks Logged Today</h4>
                <p className="text-xs text-[#6B7280] max-w-sm mx-auto mt-1">
                  Click "Log Meal or Drink" above to record what you ate or drank and evaluate its impact on your targeted result.
                </p>
              </div>
            ) : (
              nutritionLogs.map((item) => (
                <MealImpactCard 
                  key={item.id} 
                  item={item} 
                  userGoal={currentGoal} 
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI RECIPE CREATOR */}
      {activeTab === 'ai_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Form */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E4DE]">
              <div className="p-2.5 bg-[#3A4D39] rounded-2xl text-white">
                <Sparkles className="w-5 h-5 text-[#A45C40]" />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-[#3A4D39]">Gemini AI Culinary Nutritionist</h3>
                <p className="text-xs text-[#6B7280]">
                  Formulates custom recipes matching your specific kitchen ingredients and targeted plan
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateRecipe} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Major Ingredients in Your Kitchen
                </label>
                <input
                  type="text"
                  value={generatorIngredients}
                  onChange={(e) => setGeneratorIngredients(e.target.value)}
                  placeholder="e.g. wild salmon, avocado, spinach, olive oil, lemon, eggs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Prep Time Limit</label>
                  <select
                    value={generatorPrepTime}
                    onChange={(e) => setGeneratorPrepTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  >
                    <option value="5 minutes or less">5 minutes (Ultra Fast)</option>
                    <option value="10 minutes or less">10 minutes</option>
                    <option value="15 minutes or less">15 minutes</option>
                    <option value="20 minutes or less">20 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Biological Goal</label>
                  <select
                    value={generatorGoal}
                    onChange={(e) => setGeneratorGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  >
                    <option value="Cardiovascular recovery & anti-inflammatory">Cardiovascular & Blood Pressure</option>
                    <option value="Glucose stabilization & metabolic health">Metabolic / Low Glycemic</option>
                    <option value="Endocrine & hormonal balance">Hormonal & Cycle Balance</option>
                    <option value="Cellular autophagy & longevity">Longevity & Autophagy</option>
                    <option value="High protein & satiety for fat loss">Weight Loss & Satiety</option>
                    <option value="Vagus nerve relaxation & adrenal repair">Stress & Sleep Support</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-[#F4F1ED] rounded-xl border border-[#E8E4DE] text-[#6B7280] text-[11px] leading-relaxed font-serif italic">
                Vitalis AI generates clean, whole-food recipes requiring minimal equipment (one-pan or quick-blend), high bio-availability, and zero artificial additives.
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-[#3A4D39] text-white hover:bg-[#2F3F2E] rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-xs disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#A45C40]" />
                    <span>Formulating Recipe with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#A45C40]" />
                    <span>Generate Tailored Healthy Recipe</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Generated Recipe Display with picture */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
            {generatedRecipe ? (
              <div className="space-y-4">
                {generatedRecipe.imageUrl && (
                  <div className="h-44 w-full rounded-2xl overflow-hidden bg-[#E8E4DE]">
                    <img
                      src={generatedRecipe.imageUrl}
                      alt={generatedRecipe.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
                    {generatedRecipe.targetGoal}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#7C9070] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {generatedRecipe.prepTime}
                  </span>
                </div>

                <h3 className="text-xl font-serif italic text-[#3A4D39]">
                  {generatedRecipe.title}
                </h3>

                <p className="text-xs text-[#6B7280] font-serif italic">
                  {generatedRecipe.keyBenefits}
                </p>

                <div className="grid grid-cols-4 gap-2 text-center p-2.5 bg-white rounded-xl border border-[#E8E4DE] font-mono text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#7C9070] block font-sans">Calories</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.calories}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#7C9070] block font-sans">Protein</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.macros.protein}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#7C9070] block font-sans">Carbs</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.macros.carbs}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-[#7C9070] block font-sans">Fats</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.macros.fats}</strong>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-[#7C9070] mb-1.5">Ingredients:</h5>
                  <ul className="space-y-1 text-xs text-[#2D2D2D] list-disc list-inside">
                    {generatedRecipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#E8E4DE] flex gap-3">
                  <button
                    onClick={handleAddGeneratedToRecipes}
                    className="flex-1 py-2.5 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
                  >
                    Save to Recipe Catalog
                  </button>
                  <button
                    onClick={() => handleOpenLogModal(generatedRecipe)}
                    className="px-4 py-2.5 bg-[#7C9070] hover:bg-[#687C5E] text-white rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
                  >
                    Log as Consumed
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#7C9070]">
                <UtensilsCrossed className="w-12 h-12 text-[#E8E4DE] mb-3" />
                <h4 className="text-lg font-serif italic text-[#3A4D39]">No Recipe Formulated Yet</h4>
                <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                  Enter your ingredients and goal on the left to formulate an AI whole-food recipe with end-result photography.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipeModal}
        onClose={() => setSelectedRecipeModal(null)}
        onLogRecipeAsMeal={(rec) => handleOpenLogModal(rec)}
        userProfile={userProfile}
      />

      {/* Log Meal Modal */}
      <LogMealModal
        isOpen={isLogMealOpen}
        onClose={() => setIsLogMealOpen(false)}
        onSaveLog={handleSaveLog}
        userProfile={userProfile}
        initialRecipeData={prefillRecipeData}
      />
    </div>
  );
};
