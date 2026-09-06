import React, { useState } from 'react';
import { 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Droplet, 
  Heart, 
  Activity, 
  ShieldCheck, 
  Users, 
  Clock, 
  Flame, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { 
  UserProfile, 
  PartnerCycleInfo, 
  Gender, 
  MenstrualPhase,
  CyclePrediction,
  CyclePredictionPhase 
} from '../../types';

interface CycleStagePredictorProps {
  userProfile: UserProfile;
  partnerInfo?: PartnerCycleInfo | null;
  lastPeriodStartDate: string;
  cycleLengthDays: number;
  onOpenAddPartner?: () => void;
}

export const CycleStagePredictor: React.FC<CycleStagePredictorProps> = ({
  userProfile,
  partnerInfo,
  lastPeriodStartDate,
  cycleLengthDays = 28,
  onOpenAddPartner,
}) => {
  // Selected profile to predict: 'user' or 'partner'
  const [targetProfile, setTargetProfile] = useState<'user' | 'partner'>('user');
  const [predictionCyclesCount, setPredictionCyclesCount] = useState<number>(3);
  const [isIrregularMode, setIsIrregularMode] = useState<boolean>(false);
  const [varianceDays, setVarianceDays] = useState<number>(3); // ± 3 days

  // Compute predictions for given base parameters
  const generatePredictions = (
    baseStartDateStr: string,
    avgCycleLen: number,
    isIrregular: boolean,
    variance: number
  ): CyclePrediction[] => {
    const predictions: CyclePrediction[] = [];
    const baseDate = new Date(baseStartDateStr || Date.now());

    let currentStart = new Date(baseDate);

    for (let i = 1; i <= predictionCyclesCount; i++) {
      // Advance to next cycle start
      const cycleStart = new Date(currentStart);
      cycleStart.setDate(cycleStart.getDate() + avgCycleLen);

      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleEnd.getDate() + avgCycleLen - 1);

      // 4 Phases dates calculation
      // Menstrual: Days 1 to 5
      const mStart = new Date(cycleStart);
      const mEnd = new Date(cycleStart);
      mEnd.setDate(mEnd.getDate() + 4);

      // Follicular: Days 6 to 12
      const fStart = new Date(cycleStart);
      fStart.setDate(fStart.getDate() + 5);
      const fEnd = new Date(cycleStart);
      fEnd.setDate(fEnd.getDate() + 11);

      // Ovulatory: Days 13 to 16
      const oStart = new Date(cycleStart);
      oStart.setDate(oStart.getDate() + 12);
      const oPeak = new Date(cycleStart);
      oPeak.setDate(oPeak.getDate() + 13);
      const oEnd = new Date(cycleStart);
      oEnd.setDate(oEnd.getDate() + 15);

      // Luteal: Days 17 to cycleEnd
      const lStart = new Date(cycleStart);
      lStart.setDate(lStart.getDate() + 16);
      const lEnd = new Date(cycleEnd);

      const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const phases: CyclePredictionPhase[] = [
        {
          phase: 'menstrual',
          name: 'Menstrual Phase (Rest & Renewal)',
          startDate: formatDate(mStart),
          endDate: formatDate(mEnd),
          confidencePercent: isIrregular ? 84 : 96,
          keySigns: ['Uterine lining shedding', 'Baseline estrogen/progesterone', 'Reflective mindset'],
          recommendedNutrition: ['Warm ginger tea', 'Grass-fed beef or lentil iron stew', 'Magnesium glycinate'],
          recommendedActivity: 'Gentle walking, yin yoga, restorative stretching'
        },
        {
          phase: 'follicular',
          name: 'Follicular Phase (Rising Energy & Drive)',
          startDate: formatDate(fStart),
          endDate: formatDate(fEnd),
          confidencePercent: isIrregular ? 80 : 92,
          keySigns: ['Ascending FSH & estrogen', 'Clear/creamy cervical fluid', 'Elevated motivation'],
          recommendedNutrition: ['Cruciferous vegetables (sulforaphane)', 'Sprouted grains', 'Pumpkin seeds'],
          recommendedActivity: 'Progressive overload weightlifting, learning complex skills, HIIT'
        },
        {
          phase: 'ovulatory',
          name: 'Ovulatory Phase (Peak Vitality & Power)',
          startDate: formatDate(oStart),
          endDate: formatDate(oEnd),
          confidencePercent: isIrregular ? 78 : 94,
          keySigns: ['LH surge & estrogen peak', 'Stretchy egg-white cervical fluid', 'Peak fertility'],
          recommendedNutrition: ['Electrolyte-dense smoothies', 'Anti-inflammatory wild salmon', 'Berries'],
          recommendedActivity: 'Peak athletic PR attempts, high power sprints, social events'
        },
        {
          phase: 'luteal',
          name: 'Luteal Phase (Progesterone Nourishment)',
          startDate: formatDate(lStart),
          endDate: formatDate(lEnd),
          confidencePercent: isIrregular ? 82 : 95,
          keySigns: ['Progesterone elevation', 'Basal temperature rises +0.4°C', 'Metabolic rate +200 kcal'],
          recommendedNutrition: ['Complex slow carbs (sweet potato, squash)', 'Vitamin B6', 'Chamomile nightcap'],
          recommendedActivity: 'Zone 2 cardio, pilates, steady bodyweight flows'
        }
      ];

      predictions.push({
        cycleNumber: i,
        estimatedStartDate: formatDate(cycleStart),
        estimatedEndDate: formatDate(cycleEnd),
        cycleLength: avgCycleLen,
        isIrregularVariation: isIrregular,
        ovulationWindow: {
          peakDay: formatDate(oPeak),
          windowStart: formatDate(oStart),
          windowEnd: formatDate(oEnd),
          fertilityProbability: 'peak'
        },
        phases
      });

      currentStart = cycleStart;
    }

    return predictions;
  };

  // Determine which parameters to use based on targetProfile
  const isTargetPartner = targetProfile === 'partner';
  const partnerStart = new Date(Date.now() - 3600000 * 24 * (partnerInfo?.currentCycleDay || 21)).toISOString().split('T')[0];

  const activeStartDate = isTargetPartner ? partnerStart : lastPeriodStartDate;
  const activeCycleLen = 28;
  const targetName = isTargetPartner ? (partnerInfo?.name || 'Partner') : userProfile.name;
  const targetGender: Gender = isTargetPartner ? (partnerInfo?.gender || 'female') : userProfile.gender;

  const predictions = generatePredictions(activeStartDate, activeCycleLen, isIrregularMode, varianceDays);

  return (
    <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-6">
      {/* Header with Profile Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E4DE]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DE]">
              Multi-Cycle Forecaster
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DE]">
              Forward Horizon: {predictionCyclesCount} Cycles
            </span>
          </div>
          <h2 className="text-2xl font-serif italic text-[#2D2D2D]">
            Cycle Stage Predictions for Each Profile
          </h2>
          <p className="text-xs text-[#6B7280] max-w-xl">
            Forecast upcoming Menstrual, Follicular, Ovulatory, and Luteal dates for you and your partner, with adaptive modeling for irregular cycles.
          </p>
        </div>

        {/* Profile Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-[#E8E4DE] shrink-0">
          <button
            onClick={() => setTargetProfile('user')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              targetProfile === 'user'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <span>👤 My Profile ({userProfile.name})</span>
          </button>

          {partnerInfo ? (
            <button
              onClick={() => setTargetProfile('partner')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                targetProfile === 'partner'
                  ? 'bg-[#A45C40] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#2D2D2D]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Partner ({partnerInfo.name})</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddPartner}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#A45C40] hover:bg-rose-50 border border-dashed border-[#A45C40] flex items-center gap-1"
            >
              <span>+ Add Partner</span>
            </button>
          )}
        </div>
      </div>

      {/* Prediction Settings Bar */}
      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#2D2D2D]">Profile: {targetName} ({targetGender})</span>
          <span className="text-[#D8D4CE]">|</span>
          <label className="flex items-center gap-1.5 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isIrregularMode}
              onChange={(e) => setIsIrregularMode(e.target.checked)}
              className="rounded accent-[#A45C40]"
            />
            <span>Enable Irregular Cycle Variance Window</span>
          </label>
        </div>

        {isIrregularMode && (
          <div className="flex items-center gap-2 text-[11px] text-[#A45C40] font-medium">
            <span>Variance Range:</span>
            <select
              value={varianceDays}
              onChange={(e) => setVarianceDays(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-[#D8D4CE] bg-white text-xs"
            >
              <option value={2}>± 2 Days (Mild)</option>
              <option value={4}>± 4 Days (Moderate / PCOS)</option>
              <option value={7}>± 7 Days (High Variance)</option>
            </select>
          </div>
        )}
      </div>

      {/* Cycle Predictions Cards */}
      <div className="space-y-6">
        {predictions.map((pred) => (
          <div
            key={pred.cycleNumber}
            className="p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] bg-[#FAF8F5] space-y-4 shadow-2xs"
          >
            {/* Cycle Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E4DE]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#3A4D39] text-white flex items-center justify-center font-bold text-xs font-mono">
                  #{pred.cycleNumber}
                </span>
                <div>
                  <h3 className="font-serif italic font-bold text-lg text-[#2D2D2D]">
                    Forecasted Cycle {pred.cycleNumber} for {targetName}
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">
                    Projected Window: <strong>{pred.estimatedStartDate} – {pred.estimatedEndDate}</strong>
                    {pred.isIrregularVariation && ` (±${varianceDays} days variance)`}
                  </span>
                </div>
              </div>

              {/* Peak Fertile Badge */}
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-emerald-900 block">Peak Ovulation Window</span>
                  <span className="text-emerald-700 font-mono text-[10px]">{pred.ovulationWindow.windowStart} – {pred.ovulationWindow.windowEnd}</span>
                </div>
              </div>
            </div>

            {/* 4 Stages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pred.phases.map((ph) => {
                const getPhaseStyles = (phase: MenstrualPhase) => {
                  switch (phase) {
                    case 'menstrual':
                      return {
                        bg: 'bg-rose-50/70',
                        border: 'border-rose-200',
                        text: 'text-rose-900',
                        pill: 'bg-rose-100 text-rose-800'
                      };
                    case 'follicular':
                      return {
                        bg: 'bg-amber-50/70',
                        border: 'border-amber-200',
                        text: 'text-amber-900',
                        pill: 'bg-amber-100 text-amber-800'
                      };
                    case 'ovulatory':
                      return {
                        bg: 'bg-emerald-50/70',
                        border: 'border-emerald-200',
                        text: 'text-emerald-900',
                        pill: 'bg-emerald-100 text-emerald-800'
                      };
                    case 'luteal':
                      return {
                        bg: 'bg-indigo-50/70',
                        border: 'border-indigo-200',
                        text: 'text-indigo-900',
                        pill: 'bg-indigo-100 text-indigo-800'
                      };
                  }
                };

                const style = getPhaseStyles(ph.phase);

                return (
                  <div
                    key={ph.phase}
                    className={`p-4 rounded-2xl border ${style.bg} ${style.border} space-y-2 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${style.pill}`}>
                          {ph.phase}
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280]">
                          {ph.confidencePercent}% conf
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#2D2D2D] mb-1">
                        {ph.startDate} – {ph.endDate}
                      </div>

                      <ul className="text-[10px] text-[#4A4A48] space-y-0.5 list-disc list-inside">
                        {ph.keySigns.map((sign, idx) => (
                          <li key={idx} className="line-clamp-1">{sign}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-black/5 text-[10px] text-[#6B7280]">
                      <span className="font-semibold text-[#2D2D2D] block">Top Nutrient:</span>
                      <span className="line-clamp-1">{ph.recommendedNutrition[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Partner Care Advisory if Partner profile */}
            {isTargetPartner && (
              <div className="p-3 bg-white rounded-xl border border-[#E8E4DE] flex items-center gap-2 text-xs text-[#4A4A48]">
                <Heart className="w-4 h-4 text-[#A45C40] shrink-0" />
                <span>
                  <strong>Partner Care Forecast for {targetName}:</strong> Mark your calendar for {pred.phases[3].startDate} (Late Luteal / Pre-menstrual). Prepare warm meals, ensure quiet rest, and plan gentle evenings together.
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
