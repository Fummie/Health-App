import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  Trash2, 
  Utensils, 
  Coffee, 
  Check, 
  AlertCircle, 
  Loader2, 
  Info,
  Lightbulb
} from 'lucide-react';
import { NutritionLogItem, NutritionMealType, UserProfile, HealthGoal, GoalImpactAnalysis } from '../../types';
import { analyzeMealAndIngredients } from '../../utils/nutritionEngine';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: NutritionLogItem) => void;
  userProfile: UserProfile;
  initialRecipeData?: {
    name: string;
    mealType: NutritionMealType;
    ingredients: string[];
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    imageUrl?: string;
  };
}

const COMMON_INGREDIENTS = [
  'Wild Salmon', 'Eggs', 'Avocado', 'Baby Spinach', 'Quinoa', 'Olive Oil', 
  'Blueberries', 'Chia Seeds', 'Almond Milk', 'Matcha', 'Chicken Breast', 
  'Walnuts', 'Broccoli', 'Sweet Potato', 'Greek Yogurt', 'Turmeric', 'Oats'
];

export const LogMealModal: React.FC<LogMealModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  userProfile,
  initialRecipeData
}) => {
  const [itemType, setItemType] = useState<'meal' | 'drink'>(
    initialRecipeData?.mealType === 'drink' ? 'drink' : 'meal'
  );
  const [name, setName] = useState<string>(initialRecipeData?.name || '');
  const [mealType, setMealType] = useState<NutritionMealType>(initialRecipeData?.mealType || 'lunch');
  const [beverageCategory, setBeverageCategory] = useState<'tea' | 'coffee' | 'smoothie' | 'juice' | 'protein_shake' | 'elixir' | 'other'>('tea');
  
  // Ingredients list & tag input
  const [ingredients, setIngredients] = useState<string[]>(
    initialRecipeData?.ingredients || ['']
  );
  const [ingredientInput, setIngredientInput] = useState<string>('');

  // Macros (can be auto-analyzed or manually adjusted)
  const [calories, setCalories] = useState<number>(initialRecipeData?.calories || 0);
  const [protein, setProtein] = useState<number>(initialRecipeData?.protein || 0);
  const [carbs, setCarbs] = useState<number>(initialRecipeData?.carbs || 0);
  const [fats, setFats] = useState<number>(initialRecipeData?.fats || 0);
  const [fiber, setFiber] = useState<number>(initialRecipeData?.fiber || 0);
  const [imageUrl, setImageUrl] = useState<string>(initialRecipeData?.imageUrl || '');

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [goalImpact, setGoalImpact] = useState<GoalImpactAnalysis | null>(null);
  const [consumedSummary, setConsumedSummary] = useState<string>('');
  const [keyBioactives, setKeyBioactives] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentGoal = userProfile.primaryGoal || 'longevity';

  // Format goal name nicely
  const goalDisplayMap: Record<HealthGoal, string> = {
    weight_loss: 'Weight Loss & Satiety',
    longevity: 'Longevity & Cellular Repair',
    cardio: 'Cardiovascular & Blood Pressure',
    hormonal_balance: 'Hormonal & Cycle Balance',
    metabolic_fitness: 'Metabolic Fitness & Low-Insulin',
    stress_reduction: 'Stress Reduction & Adrenal Recovery'
  };

  const handleAddIngredient = (ing: string) => {
    const trimmed = ing.trim();
    if (!trimmed) return;
    if (!ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev.filter(i => i.trim().length > 0), trimmed]);
    }
    setIngredientInput('');
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Run AI & deterministic clinical engine analysis
  const handleAnalyzeMeal = async () => {
    const activeIngredients = ingredients.filter(i => i.trim().length > 0);
    if (!name.trim() && activeIngredients.length === 0) return;

    setIsAnalyzing(true);

    try {
      // 1. First obtain deterministic baseline
      const baseline = analyzeMealAndIngredients({
        name: name || 'Consumed Item',
        mealType: itemType === 'drink' ? 'drink' : mealType,
        ingredients: activeIngredients.length > 0 ? activeIngredients : [name],
        goal: currentGoal,
        userProfile,
        manualCalories: calories > 0 ? calories : undefined,
        manualProtein: protein > 0 ? protein : undefined,
        manualCarbs: carbs > 0 ? carbs : undefined,
        manualFats: fats > 0 ? fats : undefined,
      });

      // 2. Try calling backend Gemini endpoint for deep physiological evaluation
      try {
        const response = await fetch('/api/ai/analyze-meal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mealName: name || activeIngredients.join(', '),
            mealType: itemType === 'drink' ? 'drink' : mealType,
            beverageCategory: itemType === 'drink' ? beverageCategory : undefined,
            ingredients: activeIngredients,
            userGoal: goalDisplayMap[currentGoal] || currentGoal,
            userProfile
          })
        });

        const data = await response.json();
        if (data.success && data.analysis) {
          const aiRes = data.analysis;
          setCalories(aiRes.calories || baseline.estimatedCalories);
          setProtein(aiRes.protein || baseline.estimatedProtein);
          setCarbs(aiRes.carbs || baseline.estimatedCarbs);
          setFats(aiRes.fats || baseline.estimatedFats);
          setFiber(aiRes.fiber || baseline.estimatedFiber);
          setConsumedSummary(aiRes.consumedSummary || baseline.consumedSummary);
          setKeyBioactives(aiRes.goalImpact?.keyNutrientsIdentified || baseline.keyNutrients);
          setGoalImpact(aiRes.goalImpact || baseline.goalImpact);
          return;
        }
      } catch {
        // Fallback to deterministic engine
      }

      // Apply baseline
      setCalories(baseline.estimatedCalories);
      setProtein(baseline.estimatedProtein);
      setCarbs(baseline.estimatedCarbs);
      setFats(baseline.estimatedFats);
      setFiber(baseline.estimatedFiber);
      setConsumedSummary(baseline.consumedSummary);
      setKeyBioactives(baseline.keyNutrients);
      setGoalImpact(baseline.goalImpact);

    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const activeIngredients = ingredients.filter(i => i.trim().length > 0);
    if (!name.trim() && activeIngredients.length === 0) return;

    // Ensure we have an analysis if user clicks save directly
    let finalImpact = goalImpact;
    let finalSummary = consumedSummary;
    let finalCalories = calories;
    let finalProtein = protein;
    let finalCarbs = carbs;
    let finalFats = fats;
    let finalFiber = fiber;

    if (!finalImpact) {
      const fallback = analyzeMealAndIngredients({
        name: name || 'Logged Item',
        mealType: itemType === 'drink' ? 'drink' : mealType,
        ingredients: activeIngredients.length > 0 ? activeIngredients : [name],
        goal: currentGoal,
        userProfile,
        manualCalories: calories > 0 ? calories : undefined,
        manualProtein: protein > 0 ? protein : undefined,
        manualCarbs: carbs > 0 ? carbs : undefined,
        manualFats: fats > 0 ? fats : undefined,
      });
      finalImpact = fallback.goalImpact;
      finalSummary = fallback.consumedSummary;
      finalCalories = fallback.estimatedCalories;
      finalProtein = fallback.estimatedProtein;
      finalCarbs = fallback.estimatedCarbs;
      finalFats = fallback.estimatedFats;
      finalFiber = fallback.estimatedFiber;
    }

    const newLogItem: NutritionLogItem = {
      id: `nut_${Date.now()}`,
      mealType: itemType === 'drink' ? 'drink' : mealType,
      itemType,
      beverageCategory: itemType === 'drink' ? beverageCategory : undefined,
      name: name.trim() || activeIngredients.slice(0, 2).join(' & '),
      calories: finalCalories,
      proteinGrams: finalProtein,
      carbsGrams: finalCarbs,
      fatGrams: finalFats,
      fiberGrams: finalFiber,
      majorIngredients: activeIngredients.length > 0 ? activeIngredients : [name],
      consumedSummary: finalSummary,
      goalImpact: finalImpact,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imageUrl || (itemType === 'drink' 
        ? 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80')
    };

    onSaveLog(newLogItem);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#3A4D39] text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8E4DE] bg-white/10 px-2.5 py-0.5 rounded-full">
                Intake & Targeted Result Engine
              </span>
              <span className="text-[10px] uppercase font-bold text-[#E8E4DE]">
                Target: {goalDisplayMap[currentGoal]}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif italic">Log Food or Drink (Other Than Water)</h3>
            <p className="text-xs text-[#E8E4DE]/80 mt-0.5">
              Input major ingredients to analyze what was consumed and its direct biological effect on your plan
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Item Type Switcher: Meal vs Drink */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
              What are you consuming?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setItemType('meal')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold uppercase tracking-wider text-xs transition-all ${
                  itemType === 'meal'
                    ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6B7280] border-[#E8E4DE] hover:bg-[#F4F1ED]'
                }`}
              >
                <Utensils className="w-4 h-4" />
                <span>Meal or Food Snack</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType('drink')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-bold uppercase tracking-wider text-xs transition-all ${
                  itemType === 'drink'
                    ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-xs'
                    : 'bg-[#FAF8F5] text-[#6B7280] border-[#E8E4DE] hover:bg-[#F4F1ED]'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>Drink (Non-Water Beverage)</span>
              </button>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1.5 italic">
              Note: Pure drinking water is tracked on the Hydration Counter. Log coffees, herbal teas, smoothies, juices, protein shakes, or any beverage prepared with ingredients here.
            </p>
          </div>

          {/* Name and Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                {itemType === 'meal' ? 'Meal / Dish Name' : 'Beverage Name'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={itemType === 'meal' ? "e.g. Pan-Seared Salmon Bowl" : "e.g. Iced Matcha Oat Latte"}
                className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                required
              />
            </div>

            {itemType === 'meal' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Meal Category
                </label>
                <select
                  value={mealType}
                  onChange={(e: any) => setMealType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Drink Category
                </label>
                <select
                  value={beverageCategory}
                  onChange={(e: any) => setBeverageCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                >
                  <option value="tea">Herbal Tea / Green Tea / Matcha</option>
                  <option value="coffee">Coffee / Espresso / Latte</option>
                  <option value="smoothie">Nutrient Smoothie / Shake</option>
                  <option value="protein_shake">Protein Recovery Shake</option>
                  <option value="juice">Fresh Cold-Pressed Juice</option>
                  <option value="elixir">Adaptogen / Functional Elixir</option>
                  <option value="other">Other Beverage</option>
                </select>
              </div>
            )}
          </div>

          {/* MAJOR INGREDIENTS SECTION (Crucial User Requirement) */}
          <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#E8E4DE] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#3A4D39] block">
                  Major Ingredients Used to Prepare
                </label>
                <span className="text-[11px] text-[#6B7280]">
                  Enter all primary ingredients (fats, proteins, greens, herbs, liquids) used in preparation
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold bg-[#E8E4DE] px-2 py-0.5 rounded-full text-[#3A4D39]">
                {ingredients.filter(i => i.trim().length > 0).length} ingredients
              </span>
            </div>

            {/* Input field to add ingredient */}
            <div className="flex gap-2">
              <input
                type="text"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient(ingredientInput);
                  }
                }}
                placeholder="Type an ingredient (e.g., wild salmon, spinach, olive oil, lemon) and press Add"
                className="flex-1 px-3.5 py-2 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddIngredient(ingredientInput)}
                className="px-4 py-2 bg-[#3A4D39] text-white hover:bg-[#2F3F2E] rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Active Ingredients Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 bg-white rounded-xl border border-[#E8E4DE]">
              {ingredients.filter(i => i.trim().length > 0).length === 0 ? (
                <span className="text-[11px] text-[#9CA3AF] italic">
                  No ingredients added yet. Type above or click quick ingredients below.
                </span>
              ) : (
                ingredients.filter(i => i.trim().length > 0).map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F4F1ED] text-[#3A4D39] rounded-lg border border-[#E8E4DE] text-[11px] font-medium"
                  >
                    <span>{ing}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-[#6B7280] hover:text-[#A45C40] ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Click Ingredient Suggestions */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7C9070] tracking-wider block mb-1.5">
                Quick Ingredient Suggestions:
              </span>
              <div className="flex flex-wrap gap-1">
                {COMMON_INGREDIENTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddIngredient(item)}
                    className="px-2.5 py-1 bg-white hover:bg-[#E8E4DE] text-[#3A4D39] border border-[#E8E4DE] rounded-full text-[10px] font-medium transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger Ingredient & Goal Impact Analysis */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAnalyzeMeal}
                disabled={isAnalyzing || ingredients.filter(i => i.trim().length > 0).length === 0}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#7C9070] hover:bg-[#687C5E] text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Ingredients & Target Goal Impact...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Calculate What Was Consumed & Goal Effect</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* DYNAMIC ANALYSIS RESULT: What was consumed & effect on targeted goal */}
          {goalImpact && (
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#7C9070] space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7C9070] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                    Consumption & Goal Impact Analysis
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-[#3A4D39]">
                    {goalImpact.alignmentScore}% Synergy
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    goalImpact.verdict === 'optimal' 
                      ? 'bg-[#3A4D39] text-white' 
                      : goalImpact.verdict === 'supportive'
                      ? 'bg-[#7C9070] text-white'
                      : 'bg-[#A45C40] text-white'
                  }`}>
                    {goalImpact.verdict}
                  </span>
                </div>
              </div>

              {/* What was consumed statement */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070] block mb-1">
                  What Was Consumed:
                </span>
                <p className="text-xs text-[#2D2D2D] leading-relaxed font-serif italic">
                  {consumedSummary || goalImpact.summaryEffect}
                </p>
              </div>

              {/* Effect to targeted result */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DE]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3A4D39] block mb-1">
                  Effect on Targeted Result ({goalDisplayMap[currentGoal]}):
                </span>
                <p className="text-xs text-[#2D2D2D] leading-relaxed font-serif">
                  {goalImpact.summaryEffect}
                </p>

                {/* Biological Mechanisms */}
                {goalImpact.physiologicalMechanisms && goalImpact.physiologicalMechanisms.length > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#E8E4DE] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070] block">
                      Physiological Mechanisms Activated:
                    </span>
                    <ul className="space-y-1 text-[11px] text-[#4B5563]">
                      {goalImpact.physiologicalMechanisms.map((mech, mIdx) => (
                        <li key={mIdx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#7C9070] shrink-0 mt-0.5" />
                          <span>{mech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Key Bioactives */}
              {keyBioactives && keyBioactives.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070]">
                    Bioactive Compounds Identified:
                  </span>
                  {keyBioactives.map((bio, bIdx) => (
                    <span key={bIdx} className="px-2 py-0.5 bg-white border border-[#E8E4DE] text-[#3A4D39] rounded-md text-[10px] font-medium">
                      {bio}
                    </span>
                  ))}
                </div>
              )}

              {/* Optimization Tip */}
              {goalImpact.optimizationTip && (
                <div className="flex items-start gap-2 p-2.5 bg-[#F4F1ED] rounded-xl text-[11px] text-[#3A4D39]">
                  <Lightbulb className="w-4 h-4 text-[#A45C40] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#A45C40]">Clinical Optimization Tip: </strong>
                    <span>{goalImpact.optimizationTip}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nutritional Breakdown Inputs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7C9070]">
                Nutritional Breakdown (Auto-Calculated or Manual Adjustment)
              </label>
              <span className="text-[10px] text-[#6B7280]">
                {calories > 0 ? 'Calculated from ingredients' : 'Enter or calculate above'}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7C9070] mb-0.5">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E8E4DE] bg-white rounded-lg text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7C9070] mb-0.5">Protein (g)</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E8E4DE] bg-white rounded-lg text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7C9070] mb-0.5">Carbs (g)</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E8E4DE] bg-white rounded-lg text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7C9070] mb-0.5">Fats (g)</label>
                <input
                  type="number"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E8E4DE] bg-white rounded-lg text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#7C9070] mb-0.5">Fiber (g)</label>
                <input
                  type="number"
                  value={fiber}
                  onChange={(e) => setFiber(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-[#E8E4DE] bg-white rounded-lg text-xs font-mono focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-[#E8E4DE] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#2D2D2D] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
            >
              Confirm & Save to Intake Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
