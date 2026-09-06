import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Apple, 
  Sparkles, 
  Plus, 
  Clock, 
  Flame, 
  Droplet, 
  Check, 
  ChevronRight, 
  Loader2, 
  BookOpen, 
  Heart, 
  Filter,
  X
} from 'lucide-react';
import { Recipe, NutritionLogItem, UserProfile, AIProtocol } from '../types';
import { CURATED_RECIPES, INITIAL_NUTRITION_LOGS } from '../data/defaultData';

interface NutritionRecipesSegmentProps {
  userProfile: UserProfile;
  aiProtocol: AIProtocol;
}

export const NutritionRecipesSegment: React.FC<NutritionRecipesSegmentProps> = ({
  userProfile,
  aiProtocol,
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'ai_generator' | 'tracker'>('recipes');
  const [recipes, setRecipes] = useState<Recipe[]>(CURATED_RECIPES);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLogItem[]>(INITIAL_NUTRITION_LOGS);
  const [waterGlasses, setWaterGlasses] = useState<number>(6); // 250ml each = 1.5L
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<Recipe | null>(null);

  // AI Recipe Generator state
  const [generatorIngredients, setGeneratorIngredients] = useState<string>('Salmon, spinach, olive oil, lemon');
  const [generatorPrepTime, setGeneratorPrepTime] = useState<string>('12 minutes or less');
  const [generatorGoal, setGeneratorGoal] = useState<string>('Cardiovascular recovery & anti-inflammatory');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

  // New Meal Log modal
  const [isLogMealOpen, setIsLogMealOpen] = useState<boolean>(false);
  const [newMealName, setNewMealName] = useState<string>('');
  const [newMealType, setNewMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [newCalories, setNewCalories] = useState<number>(450);
  const [newProtein, setNewProtein] = useState<number>(30);
  const [newCarbs, setNewCarbs] = useState<number>(40);
  const [newFat, setNewFat] = useState<number>(15);

  // Calculate consumed totals
  const totalCalories = nutritionLogs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = nutritionLogs.reduce((acc, curr) => acc + curr.proteinGrams, 0);
  const totalCarbs = nutritionLogs.reduce((acc, curr) => acc + curr.carbsGrams, 0);
  const totalFat = nutritionLogs.reduce((acc, curr) => acc + curr.fatGrams, 0);

  const calorieTarget = aiProtocol?.calorieTarget || 2150;
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieTarget) * 100));

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
        const fullRecipe: Recipe = {
          ...data.recipe,
          id: `ai_rec_${Date.now()}`,
          isAiGenerated: true,
          category: 'lunch',
        };
        setGeneratedRecipe(fullRecipe);
      }
    } catch (err) {
      console.error('Failed to generate recipe:', err);
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

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealName.trim()) return;

    const newLog: NutritionLogItem = {
      id: `meal_${Date.now()}`,
      name: newMealName,
      mealType: newMealType,
      calories: Number(newCalories),
      proteinGrams: Number(newProtein),
      carbsGrams: Number(newCarbs),
      fatGrams: Number(newFat),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setNutritionLogs([newLog, ...nutritionLogs]);
    setIsLogMealOpen(false);
    setNewMealName('');
  };

  const filteredRecipes = recipes.filter((r) => {
    if (categoryFilter === 'all') return true;
    return r.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Macro & Culinary Medicine
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              {userProfile.dietaryPreference}
            </span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#3A4D39]">Nutrition & AI Recipe Studio</h1>
          <p className="text-xs text-[#6B7280]">Curated and AI-customized whole-food recipes designed for rapid prep and cellular longevity</p>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex items-center p-1 bg-[#E8E4DE] rounded-full border border-[#D8D4CE]">
          <button
            onClick={() => setActiveTab('recipes')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'recipes'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            Curated Recipes
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
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'tracker'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            Macro Tracker
          </button>
        </div>
      </div>

      {/* Daily Macro & Water Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Caloric Target</span>
            <Flame className="w-4 h-4 text-[#A45C40]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif text-[#3A4D39]">{totalCalories}</span>
            <span className="text-xs text-[#6B7280]">/ {calorieTarget} kcal</span>
          </div>
          <div className="w-full bg-[#E8E4DE] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#3A4D39] h-2 rounded-full transition-all"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-[#6B7280]">
            <span>{caloriePercent}% Budget</span>
            <span className="font-bold text-[#3A4D39]">{Math.max(0, calorieTarget - totalCalories)} kcal remaining</span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Protein Target</span>
            <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">Muscle & Tissue</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif text-[#3A4D39]">{totalProtein}g</span>
            <span className="text-xs text-[#6B7280]">/ 140g</span>
          </div>
          <div className="w-full bg-[#E8E4DE] rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-[#A45C40] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, Math.round((totalProtein / 140) * 100))}%` }}
            />
          </div>
          <div className="mt-2.5 text-[11px] text-[#6B7280]">Essential for cellular nitrogen balance</div>
        </div>

        {/* Carbs & Healthy Fats */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Carbs & Healthy Fats</span>
            <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">Clean Energy</span>
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
          <div className="mt-3 flex gap-2 text-[11px] text-[#6B7280]">
            <span>Low-GI, plant-rich sources prioritized</span>
          </div>
        </div>

        {/* Interactive Hydration Card */}
        <div className="bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-[#7C9070] uppercase tracking-wider">Hydration (Liters)</span>
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
            >
              +250ml
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CURATED RECIPES */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#7C9070]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C9070]">Category:</span>
              {(['all', 'breakfast', 'lunch', 'smoothie'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#3A4D39] text-white'
                      : 'bg-[#F4F1ED] text-[#6B7280] hover:bg-[#E8E4DE]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('ai_generator')}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3A4D39] hover:text-[#A45C40] transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A45C40]" />
              <span>Prompt AI for a New Custom Recipe &rarr;</span>
            </button>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-[#FAF8F5] rounded-[28px] border border-[#E8E4DE] p-6 shadow-xs hover:border-[#7C9070] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
                      {recipe.targetGoal}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#7C9070] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#7C9070]" />
                      {recipe.prepTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif italic text-[#3A4D39] leading-snug">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#6B7280] font-serif italic mt-2 line-clamp-2 leading-relaxed">
                    {recipe.keyBenefits}
                  </p>

                  {/* Macros Strip */}
                  <div className="mt-3.5 py-2.5 px-3.5 bg-white rounded-xl border border-[#E8E4DE] flex justify-between text-xs font-mono text-[#2D2D2D]">
                    <span><strong className="text-[#3A4D39]">{recipe.calories}</strong> kcal</span>
                    <span>P: <strong>{recipe.macros.protein}</strong></span>
                    <span>C: <strong>{recipe.macros.carbs}</strong></span>
                    <span>F: <strong>{recipe.macros.fats}</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#E8E4DE] flex items-center justify-between">
                  <span className="text-[11px] text-[#6B7280] italic">
                    {recipe.ingredients.length} Whole Ingredients
                  </span>
                  <button
                    onClick={() => setSelectedRecipeModal(recipe)}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#3A4D39] hover:text-[#A45C40] transition-colors"
                  >
                    <span>View Recipe</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI RECIPE GENERATOR */}
      {activeTab === 'ai_generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Form: Prompt Gemini for specific recipe */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#E8E4DE]">
              <div className="p-2.5 bg-[#3A4D39] rounded-2xl text-white">
                <Sparkles className="w-5 h-5 text-[#A45C40]" />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-[#3A4D39]">Gemini AI Culinary Nutritionist</h3>
                <p className="text-xs text-[#6B7280]">Custom tailored recipes based on your pantry and biological goals</p>
              </div>
            </div>

            <form onSubmit={handleGenerateRecipe} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Ingredients Currently in Your Kitchen
                </label>
                <input
                  type="text"
                  value={generatorIngredients}
                  onChange={(e) => setGeneratorIngredients(e.target.value)}
                  placeholder="e.g. eggs, avocados, spinach, wild salmon, walnuts"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Preparation Time Limit</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Biological Health Goal</label>
                  <select
                    value={generatorGoal}
                    onChange={(e) => setGeneratorGoal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  >
                    <option value="Cardiovascular recovery & anti-inflammatory">Cardiovascular & Blood Pressure</option>
                    <option value="Glucose stabilization & metabolic health">Glucose / Low-Insulin</option>
                    <option value="Endocrine & hormonal balance">Hormonal & Cycle Optimization</option>
                    <option value="Mitochondrial energy & athletic recovery">Mitochondrial Recovery</option>
                    <option value="Gut microbiome & prebiotic density">Gut Microbiome Repair</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-[#F4F1ED] rounded-xl border border-[#E8E4DE] text-[#6B7280] text-[11px] leading-relaxed font-serif italic">
                Vitalis AI generates clean, whole-food recipes requiring minimal equipment (one-pan or quick-blend), balanced macronutrients, and high micronutrient bioavailability.
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

          {/* Right Preview: Generated Recipe Display */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
            {generatedRecipe ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
                    {generatedRecipe.targetGoal}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#7C9070]">
                    {generatedRecipe.prepTime}
                  </span>
                </div>

                <h3 className="text-2xl font-serif italic text-[#3A4D39]">
                  {generatedRecipe.title}
                </h3>

                <p className="text-xs text-[#2D2D2D] bg-white p-3.5 rounded-xl border border-[#E8E4DE] leading-relaxed font-serif italic">
                  {generatedRecipe.keyBenefits}
                </p>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 bg-white rounded-xl border border-[#E8E4DE] text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Calories</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.calories}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Protein</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.macros.protein}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Carbs</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.macros.carbs}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Fats</span>
                    <strong className="text-[#3A4D39]">{generatedRecipe.macros.fats}</strong>
                  </div>
                </div>

                {/* Ingredients */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Ingredients:</h4>
                  <ul className="text-xs space-y-1 text-[#2D2D2D] list-disc list-inside">
                    {generatedRecipe.ingredients.map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>

                {/* Steps */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Easy Preparation Steps:</h4>
                  <ol className="text-xs space-y-1 text-[#2D2D2D] list-decimal list-inside">
                    {generatedRecipe.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </div>

                {generatedRecipe.quickTip && (
                  <div className="text-[11px] text-[#A45C40] bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DE] italic font-serif">
                    <strong>Bio Tip:</strong> {generatedRecipe.quickTip}
                  </div>
                )}

                <button
                  onClick={handleAddGeneratedToRecipes}
                  className="w-full py-2.5 px-4 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Save to My Recipe Collection
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#7C9070]">
                <UtensilsCrossed className="w-12 h-12 text-[#E8E4DE] mb-3" />
                <h4 className="text-lg font-serif italic text-[#3A4D39]">No Recipe Formulated Yet</h4>
                <p className="text-xs text-[#6B7280] max-w-xs mt-1">
                  Enter your ingredients and goal on the left to generate an AI formulated recipe customized to your health.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MACRO & MEAL LOGS */}
      {activeTab === 'tracker' && (
        <div className="bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DE] p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-serif italic text-[#3A4D39]">Logged Meals Today</h3>
              <p className="text-xs text-[#6B7280]">Track and adjust daily macronutrient balance</p>
            </div>
            <button
              onClick={() => setIsLogMealOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] text-white text-xs font-bold uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E4DE] text-[#7C9070] uppercase tracking-wider font-bold text-[10px]">
                  <th className="pb-3 pl-2">Time</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Meal Name</th>
                  <th className="pb-3">Calories</th>
                  <th className="pb-3">Protein</th>
                  <th className="pb-3">Carbs</th>
                  <th className="pb-3 pr-2">Fats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E4DE] text-[#2D2D2D]">
                {nutritionLogs.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F4F1ED]">
                    <td className="py-3 pl-2 font-mono text-[#6B7280]">{item.timestamp}</td>
                    <td className="py-3">
                      <span className="capitalize font-bold text-[10px] uppercase tracking-wider text-[#3A4D39] bg-[#E8E4DE] px-2.5 py-0.5 rounded-full">
                        {item.mealType}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-[#2D2D2D] font-serif">{item.name}</td>
                    <td className="py-3 font-mono font-bold text-[#3A4D39]">{item.calories} kcal</td>
                    <td className="py-3 font-mono">{item.proteinGrams}g</td>
                    <td className="py-3 font-mono">{item.carbsGrams}g</td>
                    <td className="py-3 pr-2 font-mono">{item.fatGrams}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipeModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-xl w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#3A4D39] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8E4DE]">
                  {selectedRecipeModal.targetGoal}
                </span>
                <h3 className="text-xl font-serif italic">{selectedRecipeModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="p-1.5 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-4 gap-2 text-center p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Calories</span>
                  <strong className="text-[#3A4D39]">{selectedRecipeModal.calories}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Protein</span>
                  <strong className="text-[#3A4D39]">{selectedRecipeModal.macros.protein}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Carbs</span>
                  <strong className="text-[#3A4D39]">{selectedRecipeModal.macros.carbs}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Fats</span>
                  <strong className="text-[#3A4D39]">{selectedRecipeModal.macros.fats}</strong>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] text-[#2D2D2D]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070] block mb-1">Physiological Benefit:</span>
                <p className="leading-relaxed font-serif italic">{selectedRecipeModal.keyBenefits}</p>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#7C9070] mb-2">Ingredients:</h4>
                <ul className="space-y-1.5 text-[#2D2D2D] list-disc list-inside">
                  {selectedRecipeModal.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#7C9070] mb-2">Step-by-Step Directions:</h4>
                <ol className="space-y-2 text-[#2D2D2D] list-decimal list-inside">
                  {selectedRecipeModal.steps.map((st, i) => (
                    <li key={i} className="leading-relaxed">{st}</li>
                  ))}
                </ol>
              </div>

              {selectedRecipeModal.quickTip && (
                <div className="text-[11px] text-[#A45C40] bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E4DE] italic font-serif">
                  <strong>Culinary Medicine Note:</strong> {selectedRecipeModal.quickTip}
                </div>
              )}
            </div>

            <div className="bg-[#FAF8F5] px-6 py-3.5 border-t border-[#E8E4DE] flex justify-end">
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="px-5 py-2 bg-[#3A4D39] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Meal Modal */}
      {isLogMealOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D]">
            <div className="bg-[#3A4D39] text-white px-6 py-5 flex items-center justify-between">
              <h3 className="text-xl font-serif italic">Log Meal Item</h3>
              <button onClick={() => setIsLogMealOpen(false)} className="p-1.5 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Meal Name</label>
                <input
                  type="text"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  placeholder="e.g. Grilled Chicken & Sweet Potato"
                  className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Meal Category</label>
                  <select
                    value={newMealType}
                    onChange={(e: any) => setNewMealType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={newCalories}
                    onChange={(e) => setNewCalories(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] font-mono focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={newProtein}
                    onChange={(e) => setNewProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] bg-white rounded-xl text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={newCarbs}
                    onChange={(e) => setNewCarbs(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] bg-white rounded-xl text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={newFat}
                    onChange={(e) => setNewFat(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] bg-white rounded-xl text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogMealOpen(false)}
                  className="px-4 py-2 font-bold uppercase tracking-wider text-xs text-[#6B7280] hover:text-[#2D2D2D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3A4D39] text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#2F3F2E] shadow-xs"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
