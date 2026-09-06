import React from 'react';
import { 
  X, 
  Clock, 
  ChefHat, 
  Sparkles, 
  Check, 
  Utensils, 
  Heart, 
  Flame, 
  Plus
} from 'lucide-react';
import { Recipe, UserProfile } from '../../types';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onLogRecipeAsMeal: (recipe: Recipe) => void;
  userProfile: UserProfile;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onLogRecipeAsMeal,
  userProfile
}) => {
  if (!recipe) return null;

  const isUserGoalMatch = recipe.planCategory === userProfile.primaryGoal;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* End Result Picture & Hero Header */}
        <div className="relative">
          {recipe.imageUrl ? (
            <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#E8E4DE]">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Close button on image */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Goal Overlay */}
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {recipe.targetGoal}
                  </span>
                  {isUserGoalMatch && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#7C9070] text-white">
                      Matches Your Plan
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 text-white flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif italic text-white leading-tight">
                  {recipe.title}
                </h2>
              </div>
            </div>
          ) : (
            <div className="bg-[#3A4D39] text-white p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8E4DE]">
                  {recipe.targetGoal}
                </span>
                <h2 className="text-2xl font-serif italic">{recipe.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Recipe Details */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Macros Banner */}
          <div className="grid grid-cols-4 gap-2 text-center p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] font-mono">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Calories</span>
              <strong className="text-[#3A4D39] text-sm">{recipe.calories} kcal</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Protein</span>
              <strong className="text-[#3A4D39] text-sm">{recipe.macros.protein}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Carbs</span>
              <strong className="text-[#3A4D39] text-sm">{recipe.macros.carbs}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7C9070] block font-sans">Healthy Fats</span>
              <strong className="text-[#3A4D39] text-sm">{recipe.macros.fats}</strong>
            </div>
          </div>

          {/* Key Biological Benefit */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070] block mb-1">
              Physiological & Cellular Mechanism:
            </span>
            <p className="leading-relaxed font-serif italic text-xs text-[#2D2D2D]">
              {recipe.keyBenefits}
            </p>
          </div>

          {/* Major Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#7C9070]">
                Major Ingredients ({recipe.ingredients.length})
              </h4>
              <span className="text-[11px] text-[#6B7280] italic">Clean, Whole-Food Substrates</span>
            </div>
            <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E4DE]">
              <ul className="space-y-1.5 text-[#2D2D2D]">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-[#7C9070] shrink-0 mt-0.5" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Directions */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#7C9070] mb-2">
              Preparation Steps:
            </h4>
            <ol className="space-y-2 text-[#2D2D2D] bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE]">
              {recipe.steps.map((st, i) => (
                <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-[#3A4D39] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Clinical Tip */}
          {recipe.quickTip && (
            <div className="text-[11px] text-[#A45C40] bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E4DE] italic font-serif">
              <strong>Culinary Medicine Note: </strong> {recipe.quickTip}
            </div>
          )}
        </div>

        {/* Modal Footer with One-Click Log Meal */}
        <div className="bg-[#FAF8F5] px-6 py-4 border-t border-[#E8E4DE] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold uppercase tracking-wider text-xs text-[#6B7280] hover:text-[#2D2D2D]"
          >
            Close
          </button>

          <button
            onClick={() => {
              onLogRecipeAsMeal(recipe);
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#3A4D39] text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#2F3F2E] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Log This Recipe as Consumed {recipe.itemType === 'drink' ? 'Drink' : 'Meal'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
