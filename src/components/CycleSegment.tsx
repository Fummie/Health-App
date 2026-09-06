import React, { useState } from 'react';
import { 
  Repeat, 
  Moon, 
  Sun, 
  Calendar, 
  Activity, 
  Zap, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Dumbbell, 
  Coffee, 
  CheckCircle2, 
  Clock, 
  Flame,
  Droplet
} from 'lucide-react';
import { FemaleCycleData, MaleTestosteroneData, Gender } from '../types';
import { DEFAULT_FEMALE_CYCLE, DEFAULT_MALE_TESTOSTERONE } from '../data/defaultData';

interface CycleSegmentProps {
  userGender: Gender;
}

export const CycleSegment: React.FC<CycleSegmentProps> = ({ userGender }) => {
  const [activeCycleMode, setActiveCycleMode] = useState<Gender>(userGender || 'female');
  
  // Female cycle state
  const [femaleCycle, setFemaleCycle] = useState<FemaleCycleData>(DEFAULT_FEMALE_CYCLE);
  const [loggedCramps, setLoggedCramps] = useState<number>(femaleCycle.symptoms.cramps);
  const [loggedEnergy, setLoggedEnergy] = useState<number>(femaleCycle.symptoms.energy);
  const [loggedFlow, setLoggedFlow] = useState(femaleCycle.symptoms.flow);

  // Male cycle state
  const [maleData, setMaleData] = useState<MaleTestosteroneData>(DEFAULT_MALE_TESTOSTERONE);
  const [trainedToday, setTrainedToday] = useState<boolean>(maleData.resistanceTrainedToday);
  const [zincTaken, setZincTaken] = useState<boolean>(maleData.zincAndVitaminDIntake);
  const [stressScore, setStressScore] = useState<number>(maleData.stressLevel);

  // Female Phase Calculations
  const phases = [
    { name: 'Menstrual', days: '1 - 5', desc: 'Restorative phase. Replenish iron, zinc, and warm bone broths.', color: 'border-rose-400 bg-rose-50 text-rose-800' },
    { name: 'Follicular', days: '6 - 12', desc: 'Estrogen rising. High cognitive drive, progressive overload training.', color: 'border-amber-400 bg-amber-50 text-amber-800' },
    { name: 'Ovulatory', days: '13 - 16', desc: 'Peak estrogen & LH. Highest power output, maximum fertility.', color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
    { name: 'Luteal', days: '17 - 28', desc: 'Progesterone dominant. Prioritize magnesium, slow complex carbs, and sleep.', color: 'border-indigo-400 bg-indigo-50 text-indigo-800' },
  ];

  // Diurnal testosterone timeline (24-hour cycle)
  const currentHour = new Date().getHours();
  const getDiurnalPhase = () => {
    if (currentHour >= 6 && currentHour < 11) return { phase: 'Morning Endocrine Peak', value: '~95-100%', tip: 'Ideal time for demanding cognitive tasks or heavy compound resistance training.' };
    if (currentHour >= 11 && currentHour < 17) return { phase: 'Midday Metabolic Stabilization', value: '~75-85%', tip: 'Maintain hydration and steady low-GI protein; avoid glucose crashes.' };
    return { phase: 'Evening Diurnal Trough & Recovery', value: '~55-65%', tip: 'Dim overhead lights. Deep slow-wave sleep tonight synthesizes tomorrow\'s peak hormone supply.' };
  };

  const diurnal = getDiurnalPhase();

  return (
    <div className="space-y-6">
      {/* Header & Gender Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Endocrine & Biological Rhythms
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Hormone Optimization
            </span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#3A4D39]">Biological Cycle Synchronization</h1>
          <p className="text-xs text-[#6B7280]">
            Track women's 28-day infradian menstrual cycle or men's 24-hour diurnal testosterone rhythm
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center p-1 bg-[#E8E4DE] rounded-full border border-[#D8D4CE]">
          <button
            onClick={() => setActiveCycleMode('female')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeCycleMode === 'female'
                ? 'bg-[#A45C40] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            <span>Women's Menstrual Cycle</span>
          </button>
          <button
            onClick={() => setActiveCycleMode('male')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeCycleMode === 'male'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Men's Testosterone Cycle</span>
          </button>
        </div>
      </div>

      {/* VIEW A: WOMEN'S MENSTRUAL CYCLE */}
      {activeCycleMode === 'female' && (
        <div className="space-y-6">
          {/* Main Cycle Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cycle Day Meter */}
            <div className="bg-[#3A4D39] text-white p-6 sm:p-7 rounded-[32px] border border-[#7C9070]/40 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E8E4DE] flex items-center gap-1.5">
                    <Repeat className="w-4 h-4 text-[#A45C40]" />
                    Infradian Rhythm
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                    28-Day Clock
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-serif italic text-white">Day {femaleCycle.currentCycleDay}</span>
                  <span className="text-[#E8E4DE] text-sm ml-2 font-medium">of {femaleCycle.cycleLengthDays}</span>
                </div>
                <h3 className="text-xl font-serif italic text-[#FAF8F5] mt-1 capitalize">
                  {femaleCycle.currentPhase} Phase
                </h3>
                <p className="text-xs text-[#E8E4DE] mt-2 leading-relaxed font-serif italic">
                  Estrogen and Luteinizing Hormone (LH) are at their biological summit. Metabolic rate is heightened and neurological coordination is peak.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-[#E8E4DE]">Next Cycle In:</span>
                <span className="font-bold text-white font-mono">~{femaleCycle.daysUntilNextPeriod} Days</span>
              </div>
            </div>

            {/* Infradian 4-Phases Progression */}
            <div className="lg:col-span-2 bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif italic text-[#3A4D39]">Infradian Phase Architecture</h3>
                <span className="text-xs text-[#7C9070] font-mono">Current: Ovulatory Window</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phases.map((ph) => {
                  const isCurrent = ph.name.toLowerCase() === femaleCycle.currentPhase;
                  return (
                    <div
                      key={ph.name}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent 
                          ? 'bg-white border-[#A45C40] ring-2 ring-[#A45C40]/30 shadow-xs' 
                          : 'bg-white border-[#E8E4DE] text-[#2D2D2D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-[#A45C40]' : 'text-[#3A4D39]'}`}>
                          {ph.name} Phase
                        </span>
                        <span className="text-[10px] font-mono text-[#6B7280]">Days {ph.days}</span>
                      </div>
                      <p className="text-xs text-[#6B7280] font-serif italic leading-relaxed">{ph.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Phase Specific Bio-Hacks */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] text-[#2D2D2D] text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-[#3A4D39]">
                  <Sparkles className="w-4 h-4 text-[#A45C40]" />
                  <span className="text-xs uppercase tracking-wider font-bold">Phase-Specific Precision Guidance</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#6B7280] text-xs font-serif italic">
                  {femaleCycle.phaseNutritionTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                  {femaleCycle.phaseWorkoutTips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Daily Symptom & Biomarker Logger */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
            <h3 className="text-xl font-serif italic text-[#3A4D39]">Daily Cycle Check-in</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Cramps */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#7C9070] block">
                  Cramp Severity: {loggedCramps} / 5
                </span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={loggedCramps}
                  onChange={(e) => setLoggedCramps(Number(e.target.value))}
                  className="w-full accent-[#A45C40] cursor-pointer"
                />
                <span className="text-[10px] text-[#6B7280] block text-right font-mono">
                  {loggedCramps === 0 ? 'None' : loggedCramps <= 2 ? 'Mild' : 'Intense'}
                </span>
              </div>

              {/* Energy Level */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#7C9070] block">
                  Vitality / Energy: {loggedEnergy} / 5
                </span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={loggedEnergy}
                  onChange={(e) => setLoggedEnergy(Number(e.target.value))}
                  className="w-full accent-[#3A4D39] cursor-pointer"
                />
                <span className="text-[10px] text-[#6B7280] block text-right font-mono">
                  {loggedEnergy >= 4 ? 'High & Vibrant' : loggedEnergy === 3 ? 'Moderate' : 'Fatigued'}
                </span>
              </div>

              {/* Flow Intensity */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] space-y-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#7C9070] block">Flow State</span>
                <select
                  value={loggedFlow}
                  onChange={(e: any) => setLoggedFlow(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E4DE] text-xs bg-white text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                >
                  <option value="none">None / Clear</option>
                  <option value="spotting">Spotting</option>
                  <option value="light">Light Flow</option>
                  <option value="medium">Medium Flow</option>
                  <option value="heavy">Heavy Flow</option>
                </select>
                <span className="text-[10px] text-[#6B7280] block text-right">Current Phase: Ovulatory</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: MEN'S TESTOSTERONE CYCLE */}
      {activeCycleMode === 'male' && (
        <div className="space-y-6">
          {/* Main Diurnal Rhythm Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 24-Hour Diurnal Clock */}
            <div className="bg-[#3A4D39] text-white p-6 sm:p-7 rounded-[32px] border border-[#7C9070]/40 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E8E4DE] flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-[#A45C40]" />
                    Circadian Diurnal Wave
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                    24h Cycle
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-serif italic text-white">{diurnal.value}</span>
                  <span className="text-[#E8E4DE] text-xs ml-2 font-medium">Estimated Diurnal Output</span>
                </div>
                <h3 className="text-xl font-serif italic text-[#FAF8F5] mt-1">
                  {diurnal.phase}
                </h3>
                <p className="text-xs text-[#E8E4DE] mt-2 leading-relaxed font-serif italic">
                  {diurnal.tip}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <span className="text-[#E8E4DE]">Current Biological Time:</span>
                <span className="font-bold text-white font-mono">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Endocrine Modulators & Habits Checklist */}
            <div className="lg:col-span-2 bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif italic text-[#3A4D39]">Daily Endocrine Modulators</h3>
                <span className="text-xs text-[#7C9070] font-mono">Steroidogenesis Checkpoint</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Modulator 1: Deep Sleep */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] flex items-start gap-3">
                  <div className="p-2.5 bg-[#F4F1ED] rounded-xl text-[#3A4D39]">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3A4D39] block">Deep Restorative Sleep</span>
                    <p className="text-xs text-[#6B7280] font-serif italic mt-0.5">Over 80% of daily testosterone is synthesized during deep slow-wave stage 3/4 sleep.</p>
                    <span className="text-[10px] font-mono font-bold text-[#7C9070] mt-1 inline-block">Goal: &gt;1.75 Hours</span>
                  </div>
                </div>

                {/* Modulator 2: Heavy Resistance */}
                <div 
                  onClick={() => setTrainedToday(!trainedToday)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    trainedToday ? 'bg-white border-[#3A4D39] ring-2 ring-[#3A4D39]/20' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${trainedToday ? 'bg-[#3A4D39] text-white' : 'bg-[#F4F1ED] text-[#6B7280]'}`}>
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3A4D39]">Compound Lifting</span>
                      {trainedToday && <CheckCircle2 className="w-4 h-4 text-[#3A4D39]" />}
                    </div>
                    <p className="text-xs text-[#6B7280] font-serif italic mt-0.5">Heavy multi-joint resistance triggers acute androgen receptor upregulation.</p>
                    <span className="text-[10px] font-semibold text-[#7C9070]">{trainedToday ? 'Completed Today' : 'Tap to toggle complete'}</span>
                  </div>
                </div>

                {/* Modulator 3: Zinc & Vitamin D3 */}
                <div 
                  onClick={() => setZincTaken(!zincTaken)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    zincTaken ? 'bg-white border-[#3A4D39] ring-2 ring-[#3A4D39]/20' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${zincTaken ? 'bg-[#3A4D39] text-white' : 'bg-[#F4F1ED] text-[#6B7280]'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3A4D39]">Zinc & D3 Cofactors</span>
                      {zincTaken && <CheckCircle2 className="w-4 h-4 text-[#3A4D39]" />}
                    </div>
                    <p className="text-xs text-[#6B7280] font-serif italic mt-0.5">Zinc acts as an essential cofactor for testicular 17β-HSD enzyme synthesis.</p>
                    <span className="text-[10px] font-semibold text-[#7C9070]">{zincTaken ? 'Stacked Today' : 'Tap to toggle complete'}</span>
                  </div>
                </div>

                {/* Modulator 4: Cortisol / Stress */}
                <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] flex items-start gap-3">
                  <div className="p-2.5 bg-[#F4F1ED] rounded-xl text-[#A45C40]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-[#3A4D39] block">Cortisol Inverse Index</span>
                    <p className="text-xs text-[#6B7280] font-serif italic mt-0.5">Elevated stress competitively inhibits testosterone receptors.</p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={stressScore}
                        onChange={(e) => setStressScore(Number(e.target.value))}
                        className="w-24 accent-[#A45C40] cursor-pointer"
                      />
                      <span className="text-[11px] font-mono font-bold text-[#3A4D39]">{stressScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7-Day Endocrine Trend Curve */}
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C9070] block mb-1">
                  7-Day Estimated Vitality Trajectory:
                </span>
                <div className="flex items-end gap-2 h-16 pt-2">
                  {maleData.vitalityTrend.map((t) => (
                    <div key={t.day} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-[#3A4D39] rounded-t-sm transition-all"
                        style={{ height: `${(t.estimatedPercent / 100) * 45}px` }}
                      />
                      <span className="text-[10px] font-mono text-[#6B7280]">{t.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
