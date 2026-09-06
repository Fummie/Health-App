import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Check, 
  Coffee, 
  Utensils, 
  Lightbulb, 
  Flame, 
  Clock, 
  Award,
  Target
} from 'lucide-react';
import { NutritionLogItem, HealthGoal } from '../../types';

interface MealImpactCardProps {
  item: NutritionLogItem;
  userGoal: HealthGoal;
}

export const MealImpactCard: React.FC<MealImpactCardProps> = ({ item, userGoal }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const goalImpact = item.goalImpact;
  const isDrink = item.itemType === 'drink' || item.mealType === 'drink';

  const goalDisplayMap: Record<string, string> = {
    weight_loss: 'Weight Loss & Satiety',
    longevity: 'Longevity & Cellular Repair',
    cardio: 'Cardiovascular & Blood Pressure',
    hormonal_balance: 'Hormonal & Cycle Balance',
    metabolic_fitness: 'Metabolic Fitness & Low-Insulin',
    stress_reduction: 'Stress Reduction & Adrenal Balance'
  };

  return (
    <div className="bg-[#FAF8F5] rounded-[24px] border border-[#E8E4DE] p-4 sm:p-5 shadow-xs hover:border-[#7C9070] transition-all space-y-3.5">
      {/* Top row: Thumbnail, Name, Time, Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {item.imageUrl && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#E8E4DE] shrink-0 border border-[#E8E4DE]">
              <img
                src={item.imageUrl}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="capitalize font-bold text-[10px] uppercase tracking-wider text-[#3A4D39] bg-[#E8E4DE] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                {isDrink ? <Coffee className="w-3 h-3 text-[#7C9070]" /> : <Utensils className="w-3 h-3 text-[#7C9070]" />}
                {isDrink ? (item.beverageCategory || 'Drink') : item.mealType}
              </span>

              <span className="text-[11px] font-mono text-[#6B7280] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.timestamp}
              </span>

              {goalImpact && (
                <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  goalImpact.verdict === 'optimal'
                    ? 'bg-[#3A4D39] text-white'
                    : goalImpact.verdict === 'supportive'
                    ? 'bg-[#7C9070] text-white'
                    : 'bg-[#A45C40] text-white'
                }`}>
                  <Award className="w-3 h-3" />
                  {goalImpact.alignmentScore}% Synergy with {goalDisplayMap[userGoal] || userGoal}
                </span>
              )}
            </div>

            <h4 className="text-base sm:text-lg font-serif italic text-[#3A4D39] leading-snug">
              {item.name}
            </h4>

            {/* Quick macro strip */}
            <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-[#6B7280] flex-wrap">
              <span className="text-[#3A4D39] font-bold">{item.calories} kcal</span>
              <span>Protein: <strong className="text-[#2D2D2D]">{item.proteinGrams}g</strong></span>
              <span>Carbs: <strong className="text-[#2D2D2D]">{item.carbsGrams}g</strong></span>
              <span>Fats: <strong className="text-[#2D2D2D]">{item.fatGrams}g</strong></span>
              {item.fiberGrams !== undefined && (
                <span>Fiber: <strong className="text-[#2D2D2D]">{item.fiberGrams}g</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Expand Analysis */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-full bg-white hover:bg-[#E8E4DE] text-[#3A4D39] border border-[#E8E4DE] transition-colors shrink-0"
          title={isExpanded ? "Collapse Details" : "Expand Consumption & Goal Analysis"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Major Ingredients Chips */}
      {item.majorIngredients && item.majorIngredients.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-[#E8E4DE]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070]">
              Major Ingredients Consumed:
            </span>
            <span className="text-[10px] font-mono text-[#6B7280]">
              {item.majorIngredients.length} ingredients
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.majorIngredients.map((ing, i) => (
              <span 
                key={i}
                className="px-2.5 py-0.5 bg-[#FAF8F5] border border-[#E8E4DE] rounded-md text-[11px] text-[#3A4D39] font-medium"
              >
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Consumption Summary preview */}
      {item.consumedSummary && !isExpanded && (
        <p className="text-xs text-[#4B5563] font-serif italic line-clamp-2">
          {item.consumedSummary}
        </p>
      )}

      {/* EXPANDED SECTION: Detailed targeted result effect & biological mechanism */}
      {isExpanded && goalImpact && (
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#7C9070] space-y-3 pt-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
            <Target className="w-4 h-4 text-[#7C9070]" />
            <span>Targeted Result Impact Evaluation: {goalDisplayMap[userGoal] || userGoal}</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DE]">
            <p className="text-xs text-[#2D2D2D] leading-relaxed font-serif">
              {goalImpact.summaryEffect}
            </p>

            {goalImpact.physiologicalMechanisms && goalImpact.physiologicalMechanisms.length > 0 && (
              <div className="mt-2.5 pt-2.5 border-t border-[#E8E4DE] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070] block">
                  Physiological Mechanisms in the Body:
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
          {goalImpact.keyNutrientsIdentified && goalImpact.keyNutrientsIdentified.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070]">
                Active Compounds Detected:
              </span>
              {goalImpact.keyNutrientsIdentified.map((bio, bIdx) => (
                <span key={bIdx} className="px-2 py-0.5 bg-white border border-[#E8E4DE] text-[#3A4D39] rounded-md text-[10px] font-semibold">
                  {bio}
                </span>
              ))}
            </div>
          )}

          {/* Optimization Tip */}
          {goalImpact.optimizationTip && (
            <div className="flex items-start gap-2 p-2.5 bg-white rounded-xl border border-[#E8E4DE] text-[11px] text-[#3A4D39]">
              <Lightbulb className="w-4 h-4 text-[#A45C40] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#A45C40]">Actionable Tip for Your Plan: </strong>
                <span>{goalImpact.optimizationTip}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
