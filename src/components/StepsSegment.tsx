import React, { useState, useEffect } from 'react';
import { 
  Footprints, 
  TrendingUp, 
  Flame, 
  Zap, 
  Heart, 
  ShieldCheck, 
  Brain, 
  Trophy, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  Compass, 
  Clock, 
  Info,
  ChevronRight
} from 'lucide-react';
import { StepBenefitMilestone } from '../types';
import { STEP_MILESTONES } from '../data/defaultData';

interface StepsSegmentProps {
  currentSteps: number;
  targetSteps: number;
  onUpdateSteps: (newSteps: number) => void;
  isWearableConnected: boolean;
}

export const StepsSegment: React.FC<StepsSegmentProps> = ({
  currentSteps = 0,
  targetSteps = 8500,
  onUpdateSteps,
  isWearableConnected,
}) => {
  const [isWalkingActive, setIsWalkingActive] = useState(false);
  const [walkingSeconds, setWalkingSeconds] = useState(0);
  const [customAddAmount, setCustomAddAmount] = useState<number>(1000);
  const [selectedMilestone, setSelectedMilestone] = useState<StepBenefitMilestone | null>(null);

  const safeSteps = currentSteps ?? 0;
  const safeTarget = targetSteps || 8500;

  // Derived metrics
  const progressPercent = Math.min(100, Math.round((safeSteps / safeTarget) * 100));
  const distanceKm = (safeSteps * 0.00078).toFixed(2);
  const caloriesBurned = Math.round(safeSteps * 0.042);
  const activeMinutes = Math.round(safeSteps / 115);

  // Live Pedometer Simulator when walking mode is active
  useEffect(() => {
    let interval: any = null;
    if (isWalkingActive) {
      interval = setInterval(() => {
        setWalkingSeconds((s) => s + 1);
        // Add 2-3 steps per second (standard cadence ~110-130 steps/min)
        const stepIncrement = Math.floor(Math.random() * 2) + 2;
        onUpdateSteps(safeSteps + stepIncrement);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWalkingActive, safeSteps, onUpdateSteps]);

  // Determine unlocked status of milestones
  const milestonesWithStatus = STEP_MILESTONES.map((m) => ({
    ...m,
    unlocked: safeSteps >= (m.stepCount ?? 0),
  }));

  // Find next upcoming milestone
  const nextMilestone = milestonesWithStatus.find((m) => !m.unlocked) || null;
  const stepsUntilNext = nextMilestone ? Math.max(0, (nextMilestone.stepCount ?? 0) - safeSteps) : 0;

  // Icon map for milestones
  const getIcon = (iconName: string, unlocked: boolean) => {
    const className = `w-5 h-5 ${unlocked ? 'text-emerald-700' : 'text-stone-400'}`;
    switch (iconName) {
      case 'Flame': return <Flame className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Brain': return <Brain className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      default: return <Footprints className={className} />;
    }
  };

  const handleQuickAdd = (amount: number) => {
    onUpdateSteps(currentSteps + amount);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Physiological Pedometer
            </span>
            {isWearableConnected && (
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
                Oura Ring Synced
              </span>
            )}
          </div>
          <h1 className="text-3xl font-serif italic text-[#3A4D39]">Daily Steps & Cellular Milestones</h1>
          <p className="text-xs text-[#6B7280]">Every step triggers specific cellular nitric oxide, glycemic, and neurogenesis cascades</p>
        </div>

        {/* Live Walk Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWalkingActive(!isWalkingActive)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs transition-all ${
              isWalkingActive
                ? 'bg-[#A45C40] text-white hover:bg-[#8F4F36] animate-pulse'
                : 'bg-[#3A4D39] text-white hover:bg-[#2F3F2E]'
            }`}
          >
            {isWalkingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isWalkingActive ? `Walking (${Math.floor(walkingSeconds / 60)}m ${walkingSeconds % 60}s)` : 'Start Pedometer Walk'}</span>
          </button>
        </div>
      </div>

      {/* Main Step Ring & Activity Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Progress Ring */}
        <div className="bg-[#FAF8F5] p-6 rounded-[32px] border border-[#E8E4DE] shadow-xs flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Circular Meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[#E8E4DE]"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Foreground Gradient Circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[#3A4D39] transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <Footprints className="w-6 h-6 text-[#3A4D39] mb-1" />
              <span className="text-3xl font-serif text-[#3A4D39] tracking-tight">
                {safeSteps.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">
                Goal: {safeTarget.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 w-full pt-4 border-t border-[#E8E4DE] flex items-center justify-between text-xs text-[#6B7280]">
            <span className="font-semibold">{progressPercent}% of Daily Target</span>
            <span className="text-[#3A4D39] font-serif italic font-bold">
              {safeSteps >= safeTarget ? 'Target Crushed!' : `${(safeTarget - safeSteps).toLocaleString()} to goal`}
            </span>
          </div>

          {/* Quick Increment Controls */}
          <div className="flex items-center gap-2 mt-4 w-full">
            <button
              onClick={() => handleQuickAdd(500)}
              className="flex-1 py-2 px-2 bg-white hover:bg-[#E8E4DE] text-[#3A4D39] border border-[#E8E4DE] rounded-xl text-xs font-bold transition-colors"
            >
              +500
            </button>
            <button
              onClick={() => handleQuickAdd(1000)}
              className="flex-1 py-2 px-2 bg-white hover:bg-[#E8E4DE] text-[#3A4D39] border border-[#E8E4DE] rounded-xl text-xs font-bold transition-colors"
            >
              +1,000
            </button>
            <button
              onClick={() => handleQuickAdd(2500)}
              className="flex-1 py-2 px-2 bg-[#E8E4DE] hover:bg-[#D8D4CE] text-[#3A4D39] border border-[#D8D4CE] rounded-xl text-xs font-bold transition-colors"
            >
              +2,500
            </button>
          </div>
        </div>

        {/* Middle & Right: Real-time Health Benefit Unlocker Banner */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Biological Benefit Status Card */}
          <div className="bg-[#3A4D39] text-[#FDFCFB] p-6 sm:p-7 rounded-[32px] border border-[#2F3F2E] shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FDFCFB] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#A45C40]" />
                Biological Benefit Unlocked Today
              </span>
              <span className="text-[11px] font-mono text-[#E8E4DE]">
                {distanceKm} km traversed
              </span>
            </div>

            {/* Current Tier Statement */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif italic text-white">
                {currentSteps >= 10000 
                  ? 'Hippocampal BDNF Neurogenesis & Deep Longevity Active' 
                  : currentSteps >= 8000 
                  ? 'Peak JAMA Longevity Inflection Plateau Achieved' 
                  : currentSteps >= 6500 
                  ? 'Cardiovascular Arterial Defense & Nitric Oxide Flowing' 
                  : currentSteps >= 4500 
                  ? 'Metabolic GLUT4 Awakening & Glycemic Blunting Active' 
                  : currentSteps >= 2500 
                  ? 'Sedentary Baseline Broken (15% Mortality Risk Drop)' 
                  : 'Starting Base: Take 2,500 steps to activate endothelial health'}
              </h2>
              <p className="text-xs text-[#E8E4DE] leading-relaxed">
                {currentSteps >= 8000
                  ? 'You have reached the premier epidemiological longevity threshold documented by JAMA and Lancet: all-cause premature mortality risk is reduced by 40-50%, arterial compliance is peak, and insulin-independent glucose clearance is fully stimulated.'
                  : currentSteps >= 5000
                  ? 'Your physical exertion has triggered smooth muscle vasodilation and muscle-cell GLUT4 transporter recruitment, meaning food eaten today will be routed directly to muscle glycogen instead of adipose storage.'
                  : 'Light walking primes the vascular endothelium. Reaching 4,500+ steps will stimulate metabolic insulin sensitivity.'}
              </p>
            </div>

            {/* Next Milestone Countdown */}
            {nextMilestone && (
              <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-[#E8E4DE] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#7C9070]" />
                  <span>Next Tier: <strong className="text-white">{nextMilestone.title}</strong></span>
                </span>
                <span className="text-[#A45C40] font-bold font-mono bg-white/10 px-2.5 py-0.5 rounded-full">
                  {stepsUntilNext.toLocaleString()} steps to unlock
                </span>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar (Calories, Distance, Active Mins) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">Distance</span>
              <p className="text-2xl font-serif text-[#3A4D39] mt-0.5">{distanceKm} <span className="text-xs font-sans text-[#6B7280]">km</span></p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">Energy Burned</span>
              <p className="text-2xl font-serif text-[#3A4D39] mt-0.5">{caloriesBurned} <span className="text-xs font-sans text-[#6B7280]">kcal</span></p>
            </div>
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">Active Duration</span>
              <p className="text-2xl font-serif text-[#3A4D39] mt-0.5">{activeMinutes} <span className="text-xs font-sans text-[#6B7280]">mins</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* The Science: Daily Step Benefit Milestones Ladder */}
      <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-serif italic text-[#3A4D39]">Scientific Step Benefit Thresholds</h2>
          <p className="text-xs text-[#6B7280]">Peer-reviewed cardiology and metabolic thresholds mapped to your exact daily step progression</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestonesWithStatus.map((m) => (
            <div
              key={m.stepCount}
              className={`p-5 rounded-2xl border transition-all ${
                m.unlocked
                  ? 'bg-white border-[#3A4D39] shadow-xs'
                  : 'bg-[#F4F1ED] border-[#E8E4DE] opacity-80'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl ${m.unlocked ? 'bg-[#E8E4DE] text-[#3A4D39]' : 'bg-[#EAE7E2] text-[#6B7280]'}`}>
                    {getIcon(m.iconName, m.unlocked)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#2D2D2D]">{m.title}</h3>
                    <span className="text-[10px] font-mono font-semibold text-[#7C9070]">{(m.stepCount ?? 0).toLocaleString()} steps</span>
                  </div>
                </div>
                {m.unlocked ? (
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#3A4D39]" /> Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#EAE7E2] text-[#6B7280]">
                    Locked
                  </span>
                )}
              </div>

              <p className="text-xs text-[#2D2D2D] leading-relaxed mt-2 font-serif italic">
                {m.physiologicalBenefit}
              </p>

              <div className="mt-3 pt-2.5 border-t border-[#E8E4DE] flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                <Info className="w-3.5 h-3.5 text-[#7C9070] shrink-0" />
                <span>{m.clinicalEvidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
