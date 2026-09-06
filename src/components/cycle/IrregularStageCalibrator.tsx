import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Thermometer, 
  Droplet, 
  Heart, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
  Clock
} from 'lucide-react';
import { MenstrualPhase } from '../../types';

interface IrregularStageCalibratorProps {
  currentCycleDay: number;
  currentPhase: MenstrualPhase;
  onApplyDiagnosis: (diagnosedPhase: MenstrualPhase, suggestedCycleDay: number, reason: string) => void;
}

export const IrregularStageCalibrator: React.FC<IrregularStageCalibratorProps> = ({
  currentCycleDay,
  currentPhase,
  onApplyDiagnosis,
}) => {
  // Bio-marker inputs
  const [mucusType, setMucusType] = useState<'dry' | 'sticky' | 'creamy' | 'egg_white' | 'watery'>('egg_white');
  const [bbtShift, setBbtShift] = useState<boolean>(false); // Has temp shifted up +0.3-0.5°C
  const [lhSurge, setLhSurge] = useState<'not_tested' | 'negative' | 'positive'>('positive');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Mittelschmerz (Pelvic Twinge)']);
  const [irregularityCause, setIrregularityCause] = useState<string>('pcos');
  const [hasApplied, setHasApplied] = useState<boolean>(false);

  // Toggle physical signs
  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const SYMPTOM_CHOICES = [
    'Mittelschmerz (Pelvic Twinge)',
    'High, Soft, Open Cervix',
    'Breast Tenderness / Swelling',
    'Water Retention / Bloat',
    'Active Pelvic Spotting / Flow',
    'Elevated Libido / High Energy',
    'Irritability / PMS Moodiness',
    'Cervical Heaviness / Pelvic Aches'
  ];

  // Clinical Diagnosis Engine
  const diagnoseCurrentStage = (): {
    phase: MenstrualPhase;
    confidence: number;
    suggestedDay: number;
    title: string;
    rationale: string;
    actionableAdvice: string;
  } => {
    // 1. Menstrual Check
    if (selectedSymptoms.includes('Active Pelvic Spotting / Flow')) {
      return {
        phase: 'menstrual',
        confidence: 95,
        suggestedDay: 1,
        title: 'Menstrual Phase (Flow Active)',
        rationale: 'Active bleeding indicates endometrial shedding has commenced. Regardless of calendar variance, the cycle clock resets to Day 1.',
        actionableAdvice: 'Activate restorative recovery, prioritize warm ginger broths, and avoid intense eccentric strength training.'
      };
    }

    // 2. Ovulatory Check (Egg white / Watery mucus OR positive LH surge OR Mittelschmerz without BBT shift)
    if ((lhSurge === 'positive' || mucusType === 'egg_white' || mucusType === 'watery') && !bbtShift) {
      return {
        phase: 'ovulatory',
        confidence: 94,
        suggestedDay: 14,
        title: 'Peak Ovulatory Window (Estrogen Peak)',
        rationale: 'Fertile cervical fluid (stretchy egg-white / watery) combined with an LH surge or ovulatory twinge confirms the Graafian follicle is rupturing. Your biological rhythm is at maximum peak fertility.',
        actionableAdvice: 'Estrogen and LH are at their monthly zenith. Ideal window for peak athletic PRs or conception planning.'
      };
    }

    // 3. Luteal Check (Biphasic BBT shift confirmed OR heavy breast tenderness + creamy/dry mucus)
    if (bbtShift || (selectedSymptoms.includes('Breast Tenderness / Swelling') && (mucusType === 'dry' || mucusType === 'sticky' || mucusType === 'creamy'))) {
      return {
        phase: 'luteal',
        confidence: 89,
        suggestedDay: 21,
        title: 'Luteal Phase (Progesterone Elevation)',
        rationale: 'A sustained thermal shift (+0.3°C to +0.5°C) confirms the corpus luteum has formed and is synthesizing progesterone. Cervical fluid has dried or turned lotion-like.',
        actionableAdvice: 'Progesterone raises resting metabolic rate by 100-300 kcal. Fuel your body with slow complex carbohydrates and magnesium glycinate.'
      };
    }

    // 4. Follicular Check (Pre-ovulatory, dry or sticky or creamy mucus, no temperature shift)
    return {
      phase: 'follicular',
      confidence: 85,
      suggestedDay: 8,
      title: 'Follicular Phase (Estrogen Building)',
      rationale: 'Baseline low basal body temperatures without an LH surge or fertile mucus indicates follicular development is progressing. In irregular cycles, this phase is often lengthened due to stress or metabolic delays.',
      actionableAdvice: 'Support healthy liver estrogen conjugation with cruciferous vegetables and lean protein. Progressive resistance overload is highly effective now.'
    };
  };

  const diagnosis = diagnoseCurrentStage();

  const handleApply = () => {
    onApplyDiagnosis(diagnosis.phase, diagnosis.suggestedDay, diagnosis.rationale);
    setHasApplied(true);
    setTimeout(() => setHasApplied(false), 3000);
  };

  return (
    <div className="bg-[#FAF8F5] p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DE]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#A45C40]/10 text-[#A45C40]">
            <Sliders className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2D2D2D]">
              Stage Diagnosis & Irregular Cycle Calibrator
            </h3>
            <p className="text-[11px] text-[#6B7280]">
              Detect your actual biological phase using physical biomarkers when cycles deviate from 28 days
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#7C9070] bg-white px-2 py-0.5 rounded-full border border-[#E8E4DE]">
          Adaptive Bio-Sync
        </span>
      </div>

      {/* Irregular Cycle Context Selector */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4DE] space-y-1.5 text-xs">
        <label className="font-bold text-[#2D2D2D] block">
          Cycle Variability Context (Optional)
        </label>
        <select
          value={irregularityCause}
          onChange={(e) => setIrregularityCause(e.target.value)}
          className="w-full px-3 py-1.5 rounded-xl border border-[#D8D4CE] bg-[#FAF8F5] text-xs text-[#2D2D2D] outline-hidden focus:border-[#A45C40]"
        >
          <option value="pcos">PCOS (Polycystic Ovarian Syndrome) / Variable Ovulation</option>
          <option value="stress">Elevated Stress / Cortisol Phase Delay</option>
          <option value="perimenopause">Perimenopausal Hormonal Fluctuation</option>
          <option value="postpartum">Postpartum / Nursing Hormonal Readaptation</option>
          <option value="athletic">High-Intensity Athletic Training</option>
          <option value="general">Naturally Variable Cycle Length (21–45 Days)</option>
        </select>
      </div>

      {/* Biomarker Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        {/* Cervical Fluid */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4DE] space-y-2">
          <div className="flex items-center gap-1.5 text-[#3A4D39] font-bold">
            <Droplet className="w-3.5 h-3.5" />
            <span>Cervical Fluid Consistency</span>
          </div>
          <select
            value={mucusType}
            onChange={(e: any) => setMucusType(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-[#D8D4CE] text-[11px] bg-[#FAF8F5] outline-hidden"
          >
            <option value="dry">Dry / None (Early Follicular/Late Luteal)</option>
            <option value="sticky">Sticky / Tacky (Mid Follicular)</option>
            <option value="creamy">Creamy / Lotion (Transitional)</option>
            <option value="egg_white">Egg-White / Stretchy (Peak Ovulation)</option>
            <option value="watery">Watery / Slippery (High Fertility)</option>
          </select>
          <span className="text-[10px] text-[#6B7280] block">
            Egg-white mucus indicates peak estrogen surge.
          </span>
        </div>

        {/* Basal Temperature Shift */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4DE] space-y-2">
          <div className="flex items-center gap-1.5 text-[#A45C40] font-bold">
            <Thermometer className="w-3.5 h-3.5" />
            <span>Basal Temp Shift (+0.3°C to +0.5°C)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBbtShift(false)}
              className={`p-1.5 rounded-xl border font-semibold text-[11px] text-center transition-all ${
                !bbtShift ? 'bg-[#3A4D39] text-white border-[#3A4D39]' : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#6B7280]'
              }`}
            >
              No Shift (Low)
            </button>
            <button
              type="button"
              onClick={() => setBbtShift(true)}
              className={`p-1.5 rounded-xl border font-semibold text-[11px] text-center transition-all ${
                bbtShift ? 'bg-[#A45C40] text-white border-[#A45C40]' : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#6B7280]'
              }`}
            >
              Shifted Up (+0.4°C)
            </button>
          </div>
          <span className="text-[10px] text-[#6B7280] block">
            Temperature rise confirms progesterone synthesis.
          </span>
        </div>

        {/* LH Strip */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E8E4DE] space-y-2">
          <div className="flex items-center gap-1.5 text-[#7C9070] font-bold">
            <Activity className="w-3.5 h-3.5" />
            <span>LH Ovulation Test Strip</span>
          </div>
          <select
            value={lhSurge}
            onChange={(e: any) => setLhSurge(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-[#D8D4CE] text-[11px] bg-[#FAF8F5] outline-hidden"
          >
            <option value="not_tested">Not Tested Today</option>
            <option value="negative">Negative / Faint Line</option>
            <option value="positive">Positive / Peak Dark Line</option>
          </select>
          <span className="text-[10px] text-[#6B7280] block">
            Positive LH predicts follicle release in 24 hrs.
          </span>
        </div>
      </div>

      {/* Secondary Sensation Chips */}
      <div>
        <label className="font-bold text-xs text-[#2D2D2D] block mb-1.5">
          Active Bodily Sensations (Select all that apply)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOM_CHOICES.map((sym) => {
            const isSelected = selectedSymptoms.includes(sym);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => toggleSymptom(sym)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  isSelected
                    ? 'bg-[#3A4D39] text-white shadow-2xs'
                    : 'bg-white text-[#4A4A48] hover:bg-[#FAF8F5] border border-[#E8E4DE]'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {sym}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clinical Diagnosis Result Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#A45C40] shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-rose-100 text-rose-800 font-bold text-xs">
              Diagnosis
            </span>
            <h4 className="font-serif italic text-base font-bold text-[#2D2D2D]">
              {diagnosis.title}
            </h4>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">Biomarker Confidence:</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {diagnosis.confidence}% Match
            </span>
          </div>
        </div>

        <p className="text-xs text-[#4A4A48] leading-relaxed">
          <strong>Clinical Rationale:</strong> {diagnosis.rationale}
        </p>

        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] text-[11px] text-[#3A4D39]">
          <strong>Target Advice:</strong> {diagnosis.actionableAdvice}
        </div>

        {/* Apply Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E4DE]">
          <div className="text-[11px] text-[#6B7280]">
            Will calibrate cycle tracker to: <strong>{diagnosis.phase.toUpperCase()} (Day {diagnosis.suggestedDay})</strong>
          </div>

          <button
            onClick={handleApply}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 ${
              hasApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#A45C40] hover:bg-[#8F4F36] text-white cursor-pointer'
            }`}
          >
            {hasApplied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Calibrated to Tracker!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Apply Diagnosed Stage to Tracker</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
