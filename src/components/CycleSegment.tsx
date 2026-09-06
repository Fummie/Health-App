import React, { useState, useEffect } from 'react';
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
  Droplet,
  ShieldCheck,
  Check,
  AlertCircle,
  Users,
  ChevronRight,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { 
  FemaleCycleData, 
  MaleTestosteroneData, 
  Gender, 
  UserProfile, 
  NutritionLogItem,
  DailyCycleLog,
  PartnerCycleInfo,
  MenstrualPhase 
} from '../types';
import { DEFAULT_FEMALE_CYCLE, DEFAULT_MALE_TESTOSTERONE, DEFAULT_PARTNER_INFO } from '../data/defaultData';
import { CycleCylinder } from './cycle/CycleCylinder';
import { NutritionCycleSync } from './cycle/NutritionCycleSync';
import { PartnerCareHub } from './cycle/PartnerCareHub';
import { BodyBalanceMastery } from './cycle/BodyBalanceMastery';
import { IrregularStageCalibrator } from './cycle/IrregularStageCalibrator';
import { CycleStagePredictor } from './cycle/CycleStagePredictor';

interface CycleSegmentProps {
  userProfile?: UserProfile;
  userGender?: Gender;
  onUpdateProfile?: (profile: UserProfile) => void;
  nutritionLogs?: NutritionLogItem[];
  onNavigateToNutrition?: () => void;
}

export const CycleSegment: React.FC<CycleSegmentProps> = ({ 
  userProfile, 
  userGender,
  onUpdateProfile,
  nutritionLogs = [],
  onNavigateToNutrition
}) => {
  // Determine gender strictly from user profile
  const resolvedGender: Gender = userProfile?.gender || userGender || 'female';
  const [activeGender, setActiveGender] = useState<Gender>(resolvedGender);

  // Sync if prop changes
  useEffect(() => {
    if (userProfile?.gender) {
      setActiveGender(userProfile.gender);
    } else if (userGender) {
      setActiveGender(userGender);
    }
  }, [userProfile?.gender, userGender]);

  // Female Cycle State
  const [femaleCycle, setFemaleCycle] = useState<FemaleCycleData>(() => {
    try {
      const saved = localStorage.getItem('vitalis_female_cycle_data');
      return saved ? JSON.parse(saved) : DEFAULT_FEMALE_CYCLE;
    } catch {
      return DEFAULT_FEMALE_CYCLE;
    }
  });

  // Selected date on the cylinder
  const [selectedCycleDay, setSelectedCycleDay] = useState<number>(femaleCycle.currentCycleDay || 13);

  // Today's Major Cycle Began tick state
  const [majorCycleBeganToday, setMajorCycleBeganToday] = useState<boolean>(
    femaleCycle.majorCycleBeganToday || false
  );
  const [showTickConfirmation, setShowTickConfirmation] = useState<string | null>(null);

  // Partner State linked with profile
  const [partnerInfo, setPartnerInfo] = useState<PartnerCycleInfo | null>(() => {
    if (userProfile?.partnerInfo) return userProfile.partnerInfo;
    try {
      const saved = localStorage.getItem('vitalis_partner_cycle_info');
      return saved ? JSON.parse(saved) : DEFAULT_PARTNER_INFO;
    } catch {
      return DEFAULT_PARTNER_INFO;
    }
  });

  const [showAddPartnerModal, setShowAddPartnerModal] = useState<boolean>(false);
  const [newPartnerNameInput, setNewPartnerNameInput] = useState<string>('');
  const [newPartnerRelationshipInput, setNewPartnerRelationshipInput] = useState<string>('Spouse / Life Partner');
  const [newPartnerGenderInput, setNewPartnerGenderInput] = useState<Gender>(activeGender === 'female' ? 'male' : 'female');
  const [newPartnerCycleDayInput, setNewPartnerCycleDayInput] = useState<number>(21);

  // Sync partner if userProfile changes
  useEffect(() => {
    if (userProfile?.partnerInfo) {
      setPartnerInfo(userProfile.partnerInfo);
    }
  }, [userProfile?.partnerInfo]);

  const handleUpdatePartner = (updated: PartnerCycleInfo | null) => {
    setPartnerInfo(updated);
    if (userProfile && onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        partnerInfo: updated || undefined
      });
    }
    if (updated) {
      localStorage.setItem('vitalis_partner_cycle_info', JSON.stringify(updated));
    } else {
      localStorage.removeItem('vitalis_partner_cycle_info');
    }
  };

  const handleQuickAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerNameInput.trim()) return;
    const newPartner: PartnerCycleInfo = {
      id: 'partner-' + Date.now(),
      name: newPartnerNameInput.trim(),
      relationship: newPartnerRelationshipInput,
      gender: newPartnerGenderInput,
      currentCycleDay: newPartnerCycleDayInput,
      currentPhase: newPartnerGenderInput === 'female'
        ? (newPartnerCycleDayInput <= 5 ? 'menstrual' : newPartnerCycleDayInput <= 12 ? 'follicular' : newPartnerCycleDayInput <= 16 ? 'ovulatory' : 'luteal')
        : 'morning_peak',
      moodToday: 'Calm & caring',
      careNeeds: ['Warm herbal tea', 'Restorative evening'],
      avoidList: ['High stress demands'],
      recommendedMeal: 'Warm wild salmon & roasted butternut squash',
      lastUpdated: new Date().toISOString()
    };
    handleUpdatePartner(newPartner);
    setNewPartnerNameInput('');
    setShowAddPartnerModal(false);
    setShowTickConfirmation(`Partner "${newPartner.name}" successfully connected to ${userProfile?.name || 'User'}'s profile!`);
    setTimeout(() => setShowTickConfirmation(null), 4000);
  };

  // Handler for stage diagnosis / irregular cycle calibration
  const handleApplyDiagnosis = (diagnosedPhase: MenstrualPhase, suggestedCycleDay: number, reason: string) => {
    const updated: FemaleCycleData = {
      ...femaleCycle,
      currentPhase: diagnosedPhase,
      currentCycleDay: suggestedCycleDay,
      isIrregular: true,
      diagnosedStageOverride: diagnosedPhase,
    };
    saveFemaleCycle(updated);
    setSelectedCycleDay(suggestedCycleDay);
    setShowTickConfirmation(`Cycle Calibrated: Diagnosed as ${diagnosedPhase.toUpperCase()} (Day ${suggestedCycleDay}) based on physical biomarkers.`);
    setTimeout(() => setShowTickConfirmation(null), 5000);
  };

  // Selected Day Log editing state
  const currentSelectedLog = femaleCycle.dailyLogs?.[selectedCycleDay] || {
    cycleDay: selectedCycleDay,
    date: new Date().toISOString().split('T')[0],
    majorCycleBegan: selectedCycleDay === 1 && majorCycleBeganToday,
    crampsLevel: femaleCycle.symptoms.cramps || 0,
    flow: femaleCycle.symptoms.flow || 'none',
    symptoms: [],
    moods: [femaleCycle.symptoms.mood || 'Focused'],
    energyLevel: femaleCycle.symptoms.energy || 4,
    notes: ''
  };

  const [crampsLevel, setCrampsLevel] = useState<number>(currentSelectedLog.crampsLevel);
  const [flowLevel, setFlowLevel] = useState<'none' | 'spotting' | 'light' | 'medium' | 'heavy'>(currentSelectedLog.flow);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(currentSelectedLog.symptoms || []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(currentSelectedLog.moods || ['Focused']);
  const [energyScore, setEnergyScore] = useState<number>(currentSelectedLog.energyLevel || 4);
  const [logNotes, setLogNotes] = useState<string>(currentSelectedLog.notes || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  // Sync edit form when cylinder selection changes
  useEffect(() => {
    const log = femaleCycle.dailyLogs?.[selectedCycleDay];
    if (log) {
      setCrampsLevel(log.crampsLevel || 0);
      setFlowLevel(log.flow || 'none');
      setSelectedSymptoms(log.symptoms || []);
      setSelectedMoods(log.moods || ['Focused']);
      setEnergyScore(log.energyLevel || 4);
      setLogNotes(log.notes || '');
    } else {
      setCrampsLevel(0);
      setFlowLevel(selectedCycleDay <= 5 ? 'light' : 'none');
      setSelectedSymptoms([]);
      setSelectedMoods(['Balanced']);
      setEnergyScore(4);
      setLogNotes('');
    }
  }, [selectedCycleDay, femaleCycle.dailyLogs]);

  // Male Diurnal State
  const [maleData, setMaleData] = useState<MaleTestosteroneData>(() => {
    try {
      const saved = localStorage.getItem('vitalis_male_testosterone_data');
      return saved ? JSON.parse(saved) : DEFAULT_MALE_TESTOSTERONE;
    } catch {
      return DEFAULT_MALE_TESTOSTERONE;
    }
  });
  const [morningSurgeTicked, setMorningSurgeTicked] = useState<boolean>(true);
  const [trainedToday, setTrainedToday] = useState<boolean>(maleData.resistanceTrainedToday);
  const [zincTaken, setZincTaken] = useState<boolean>(maleData.zincAndVitaminDIntake);
  const [stressScore, setStressScore] = useState<number>(maleData.stressLevel);

  // Save female cycle to localStorage
  const saveFemaleCycle = (updated: FemaleCycleData) => {
    setFemaleCycle(updated);
    localStorage.setItem('vitalis_female_cycle_data', JSON.stringify(updated));
  };

  // Save male cycle to localStorage
  const saveMaleData = (updated: MaleTestosteroneData) => {
    setMaleData(updated);
    localStorage.setItem('vitalis_male_testosterone_data', JSON.stringify(updated));
  };

  // Handle ticking "Major Cycle Began Today"
  const handleToggleMajorCycleBegan = () => {
    const nextState = !majorCycleBeganToday;
    setMajorCycleBeganToday(nextState);

    if (nextState) {
      const todayStr = new Date().toISOString().split('T')[0];
      const updatedLogs = {
        ...(femaleCycle.dailyLogs || {}),
        1: {
          cycleDay: 1,
          date: todayStr,
          majorCycleBegan: true,
          crampsLevel: crampsLevel > 0 ? crampsLevel : 2,
          flow: 'medium' as const,
          symptoms: ['Period Started', 'Pelvic Heaviness'],
          moods: ['Reflective', 'Slow Energy'],
          energyLevel: 2,
          notes: 'Major menstrual cycle began today. Resetting cycle clock.'
        }
      };

      const updated: FemaleCycleData = {
        ...femaleCycle,
        lastPeriodStartDate: todayStr,
        currentCycleDay: 1,
        currentPhase: 'menstrual',
        majorCycleBeganToday: true,
        daysUntilNextPeriod: femaleCycle.cycleLengthDays - 1,
        fertilityStatus: 'low',
        dailyLogs: updatedLogs
      };

      saveFemaleCycle(updated);
      setSelectedCycleDay(1);
      setFlowLevel('medium');
      setShowTickConfirmation('Cycle clock reset to Day 1: Menstrual Restorative Phase activated');
      setTimeout(() => setShowTickConfirmation(null), 4500);
    } else {
      const updated: FemaleCycleData = {
        ...femaleCycle,
        majorCycleBeganToday: false
      };
      saveFemaleCycle(updated);
    }
  };

  // Handle saving daily log for selected cycle day
  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();

    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: DailyCycleLog = {
      cycleDay: selectedCycleDay,
      date: todayStr,
      majorCycleBegan: selectedCycleDay === 1 && majorCycleBeganToday,
      crampsLevel,
      flow: flowLevel,
      symptoms: selectedSymptoms,
      moods: selectedMoods,
      energyLevel: energyScore,
      notes: logNotes
    };

    const updatedLogs = {
      ...(femaleCycle.dailyLogs || {}),
      [selectedCycleDay]: newLog
    };

    const updated: FemaleCycleData = {
      ...femaleCycle,
      dailyLogs: updatedLogs,
      symptoms: selectedCycleDay === femaleCycle.currentCycleDay ? {
        ...femaleCycle.symptoms,
        cramps: crampsLevel,
        flow: flowLevel,
        energy: energyScore,
        mood: selectedMoods.join(', ') || femaleCycle.symptoms.mood
      } : femaleCycle.symptoms
    };

    saveFemaleCycle(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) => 
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const toggleMood = (m: string) => {
    setSelectedMoods((prev) => 
      prev.includes(m) ? prev.filter((item) => item !== m) : [...prev, m]
    );
  };

  // Common symptoms list
  const SYMPTOM_OPTIONS = [
    'Pelvic Cramping',
    'Lower Back Ache',
    'Bloating & Water Retention',
    'Breast Tenderness',
    'Headache / Migraine',
    'Fatigue / Heaviness',
    'Hot Flush / Body Heat',
    'Cervical Fluid Changes',
    'Digestive Sensitivity',
    'Skin Breakout / Acne'
  ];

  // Common moods list
  const MOOD_OPTIONS = [
    'Calm & Grounded',
    'Focused & Sharp',
    'High Energy',
    'Euphoric & Social',
    'Tender & Emotional',
    'Irritable',
    'Anxious / Restless',
    'Brain Fog',
    'Low Motivation',
    'Nurturing & Loving'
  ];

  return (
    <div className="space-y-7">
      {/* Profile Biological Alignment Banner */}
      <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-white px-3 py-1 rounded-full border border-[#E8E4DE]">
              Biological Profile Calibrated
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-white px-3 py-1 rounded-full border border-[#E8E4DE]">
              {activeGender === 'female' ? "Female Infradian Rhythm" : "Male Diurnal Rhythm"}
            </span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#2D2D2D]">
            {activeGender === 'female' ? "Infradian Cycle & Hormonal Architecture" : "Diurnal Testosterone & Endocrine Rhythm"}
          </h1>
          <p className="text-xs text-[#6B7280] max-w-xl">
            {activeGender === 'female'
              ? `Calibrated exclusively for ${userProfile?.name || 'User'}'s 28-day monthly hormonal wave. Track symptoms, predict ovulation, and harness nutrition to eliminate cramps.`
              : `Calibrated exclusively for ${userProfile?.name || 'User'}'s 24-hour diurnal endocrine cycle. Align peak cognitive output, optimize deep sleep synthesis, and maintain hormonal drive.`}
          </p>
        </div>

        {/* Controls: Switch biological profile and Add Partner */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Add Partner Button */}
          <button
            onClick={() => setShowAddPartnerModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-[#A45C40] hover:bg-[#8F4F36] text-white transition-all shadow-xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{partnerInfo ? `Partner: ${partnerInfo.name}` : '+ Add Partner for this Profile'}</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E8E4DE]">
            <span className="text-[11px] text-[#6B7280] px-2 font-medium">Profile:</span>
            <button
              onClick={() => {
                setActiveGender('female');
                if (onUpdateProfile && userProfile) onUpdateProfile({ ...userProfile, gender: 'female' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeGender === 'female'
                  ? 'bg-[#A45C40] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#2D2D2D]'
              }`}
            >
              Female
            </button>
            <button
              onClick={() => {
                setActiveGender('male');
                if (onUpdateProfile && userProfile) onUpdateProfile({ ...userProfile, gender: 'male' });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeGender === 'male'
                  ? 'bg-[#3A4D39] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#2D2D2D]'
              }`}
            >
              Male
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add / Manage Partner Modal */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#E8E4DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DE]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#A45C40]/10 text-[#A45C40]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif italic text-lg text-[#2D2D2D]">
                    {partnerInfo ? 'Manage Partner Connection' : 'Add Partner for this Profile'}
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Synchronize cycles, share care tokens, and adapt meals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickAddPartner} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Partner's Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={newPartnerNameInput}
                  onChange={(e) => setNewPartnerNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] text-xs text-[#2D2D2D] outline-hidden focus:border-[#A45C40]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Relationship
                </label>
                <select
                  value={newPartnerRelationshipInput}
                  onChange={(e) => setNewPartnerRelationshipInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] text-xs text-[#2D2D2D] outline-hidden"
                >
                  <option value="Spouse / Husband / Wife">Spouse / Husband / Wife</option>
                  <option value="Fiancé / Fiancée">Fiancé / Fiancée</option>
                  <option value="Life Partner">Life Partner</option>
                  <option value="Romantic Companion">Romantic Companion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Partner's Biological System
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPartnerGenderInput('female')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      newPartnerGenderInput === 'female'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'border-[#E8E4DE] text-gray-600'
                    }`}
                  >
                    Female (Infradian)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPartnerGenderInput('male')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      newPartnerGenderInput === 'male'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-[#E8E4DE] text-gray-600'
                    }`}
                  >
                    Male (Diurnal)
                  </button>
                </div>
              </div>

              {newPartnerGenderInput === 'female' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                    Partner's Current Cycle Day: <span className="text-[#A45C40]">Day {newPartnerCycleDayInput}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="28"
                    value={newPartnerCycleDayInput}
                    onChange={(e) => setNewPartnerCycleDayInput(Number(e.target.value))}
                    className="w-full accent-[#A45C40]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Day 1 (Period)</span>
                    <span>Day 14 (Ovulation)</span>
                    <span>Day 28 (Luteal)</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#E8E4DE]">
                {partnerInfo && (
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdatePartner(null);
                      setShowAddPartnerModal(false);
                    }}
                    className="text-xs text-rose-600 hover:underline font-medium"
                  >
                    Disconnect Partner
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowAddPartnerModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#A45C40] hover:bg-[#8F4F36] text-white"
                  >
                    Save Partner Link
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* Confirmation Banner for Ticking Cycle */}
      {showTickConfirmation && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs flex items-center gap-3 animate-fade-in shadow-xs">
          <Droplet className="w-5 h-5 text-rose-600 fill-current shrink-0" />
          <div className="flex-1">
            <span className="font-bold block text-sm">Major Cycle Activated</span>
            <span>{showTickConfirmation}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. THE 3D CYLINDER THAT SHOWS EACH CYCLE DATE */}
      {/* ========================================================================= */}
      <CycleCylinder
        gender={activeGender}
        cycleLengthDays={femaleCycle.cycleLengthDays || 28}
        currentCycleDay={femaleCycle.currentCycleDay || 13}
        selectedCycleDay={selectedCycleDay}
        lastPeriodStartDate={femaleCycle.lastPeriodStartDate}
        dailyLogs={femaleCycle.dailyLogs || {}}
        onSelectDay={(day) => setSelectedCycleDay(day)}
      />

      {/* ========================================================================= */}
      {/* 2. TICK MAJOR CYCLE BEGAN & SUMMARY CARD */}
      {/* ========================================================================= */}
      {activeGender === 'female' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tick Major Cycle Card */}
          <div className="bg-white p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  Cycle Clock Calibrator
                </span>
                <span className="text-xs font-mono text-[#6B7280]">Day 1 Reset</span>
              </div>
              <h3 className="font-serif italic text-lg font-bold text-[#2D2D2D] mb-1">
                Major Menstrual Cycle
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                Did your period bleeding begin today? Ticking this resets the 28-day clock to Day 1, activates the restorative phase, and predicts your next cycle dates.
              </p>
            </div>

            {/* Tactile Tick Button */}
            <button
              onClick={handleToggleMajorCycleBegan}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer ${
                majorCycleBeganToday
                  ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                  : 'bg-[#FAF8F5] text-[#2D2D2D] border-[#D8D4CE] hover:border-rose-400 hover:bg-rose-50/40'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                majorCycleBeganToday ? 'bg-white text-rose-600 border-white' : 'border-[#A0A09C] bg-white'
              }`}>
                {majorCycleBeganToday && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <span className="font-bold text-xs">
                {majorCycleBeganToday ? '✓ Major Cycle Began Today' : 'Tick: Major Cycle Began Today'}
              </span>
            </button>
          </div>

          {/* Current Phase Highlight */}
          <div className="bg-[#3A4D39] text-white p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8E4DE] bg-white/15 px-2.5 py-1 rounded-full">
                  Current Hormone Phase
                </span>
                <span className="text-xs font-mono text-emerald-200 font-bold">
                  Day {femaleCycle.currentCycleDay} of {femaleCycle.cycleLengthDays}
                </span>
              </div>
              <h3 className="text-2xl font-serif italic capitalize text-white mt-2">
                {femaleCycle.currentPhase} Phase
              </h3>
              <p className="text-xs text-[#E8E4DE] mt-2 leading-relaxed font-serif italic">
                {femaleCycle.currentPhase === 'menstrual' && "Uterine lining shedding. Estrogen and progesterone are baseline low. Body energy requests gentle pace, warm mineral broths, and pelvic warmth."}
                {femaleCycle.currentPhase === 'follicular' && "Follicle-Stimulating Hormone (FSH) and estrogen are ascending. Neurochemistry is energized, mental curiosity is high, and muscle protein synthesis is optimized."}
                {femaleCycle.currentPhase === 'ovulatory' && "Estrogen and Luteinizing Hormone (LH) peak. Metabolic efficiency is high, verbal communication is sharpest, and maximum strength output is accessible."}
                {femaleCycle.currentPhase === 'luteal' && "Progesterone dominates from corpus luteum. Basal body temperature rises ~0.4°C. Prioritize slow complex carbohydrates, magnesium glycinate, and nervous system decompression."}
              </p>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-[#E8E4DE]">
              <span>Estimated Next Period:</span>
              <span className="font-bold font-mono text-white">In ~{femaleCycle.daysUntilNextPeriod} Days</span>
            </div>
          </div>

          {/* Fertility & Biological Status */}
          <div className="bg-white p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DE]">
                  Conception & Vitality Status
                </span>
                <span className="text-xs font-mono text-[#7C9070] font-bold capitalize">
                  {femaleCycle.fertilityStatus} Fertility
                </span>
              </div>
              <h3 className="font-serif italic text-lg font-bold text-[#2D2D2D] mb-1">
                Biomarker Readout
              </h3>
              <div className="space-y-2 text-xs text-[#4A4A48] mt-3">
                <div className="flex items-center justify-between py-1 border-b border-[#E8E4DE]">
                  <span className="text-[#6B7280]">Estrogen Level:</span>
                  <span className="font-bold text-[#3A4D39]">
                    {femaleCycle.currentPhase === 'ovulatory' ? 'Peak High' : femaleCycle.currentPhase === 'follicular' ? 'Ascending' : 'Low Steady'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#E8E4DE]">
                  <span className="text-[#6B7280]">Progesterone Level:</span>
                  <span className="font-bold text-[#A45C40]">
                    {femaleCycle.currentPhase === 'luteal' ? 'Dominant Peak' : 'Quiescent Baseline'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#6B7280]">Insulin Sensitivity:</span>
                  <span className="font-bold text-emerald-700">
                    {femaleCycle.currentPhase === 'follicular' || femaleCycle.currentPhase === 'ovulatory' ? 'High (Carb Tolerant)' : 'Lower (Needs Steady Fats/Fibers)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-[#A0A09C] italic">
              Synchronized with basal body temperature algorithms.
            </div>
          </div>
        </div>

        {/* Irregular Cycle Stage Calibrator Side Panel / Diagnostic Tool */}
        <div className="pt-2">
          <IrregularStageCalibrator
            currentCycleDay={femaleCycle.currentCycleDay}
            currentPhase={femaleCycle.currentPhase}
            onApplyDiagnosis={handleApplyDiagnosis}
          />
        </div>
        </>
      ) : (
        /* Male Tick & Summary */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Diurnal Clock Reset
                </span>
                <span className="text-xs font-mono text-[#6B7280]">07:00 Waking Anchor</span>
              </div>
              <h3 className="font-serif italic text-lg font-bold text-[#2D2D2D] mb-1">
                Morning Diurnal Surge
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                Did your morning awakening surge begin? Ticking confirms waking light exposure and sets the 24-hour endocrine curve.
              </p>
            </div>

            <button
              onClick={() => setMorningSurgeTicked(!morningSurgeTicked)}
              className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-3 cursor-pointer ${
                morningSurgeTicked
                  ? 'bg-[#3A4D39] text-white border-[#2D3E2C] shadow-sm'
                  : 'bg-[#FAF8F5] text-[#2D2D2D] border-[#D8D4CE]'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                morningSurgeTicked ? 'bg-white text-[#3A4D39] border-white' : 'border-[#A0A09C] bg-white'
              }`}>
                {morningSurgeTicked && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
              <span className="font-bold text-xs">
                {morningSurgeTicked ? '✓ Morning Surge Began & Synced' : 'Tick: Morning Surge Began Today'}
              </span>
            </button>
          </div>

          <div className="bg-[#3A4D39] text-white p-6 rounded-[28px] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8E4DE] bg-white/15 px-2.5 py-1 rounded-full">
                  24-Hour Curve Status
                </span>
                <span className="text-xs font-mono text-emerald-200 font-bold">
                  {new Date().getHours()}:00 Hour
                </span>
              </div>
              <h3 className="text-2xl font-serif italic text-white mt-2">
                {new Date().getHours() >= 6 && new Date().getHours() < 12 ? "Morning Peak Window" : new Date().getHours() < 18 ? "Midday Sustained Drive" : "Evening Recovery Window"}
              </h3>
              <p className="text-xs text-[#E8E4DE] mt-2 leading-relaxed font-serif italic">
                Testosterone synthesis happens primarily during Stage 3/4 non-REM slow wave sleep. Morning concentrations are 30-50% higher than evening troughs.
              </p>
            </div>

            <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-[#E8E4DE]">
              <span>Deep Sleep Synthesized:</span>
              <span className="font-bold font-mono text-white">{maleData.deepSleepHours} hrs Slow Wave</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E8E4DE]">
                  Leydig Cell Optimization
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">Score: 92/100</span>
              </div>
              <h3 className="font-serif italic text-lg font-bold text-[#2D2D2D] mb-1">
                Daily Biomarker Foundations
              </h3>
              <div className="space-y-2 text-xs text-[#4A4A48] mt-3">
                <div className="flex items-center justify-between py-1 border-b border-[#E8E4DE]">
                  <span className="text-[#6B7280]">Resistance Trained Today:</span>
                  <button 
                    onClick={() => {
                      const updated = { ...maleData, resistanceTrainedToday: !trainedToday };
                      setTrainedToday(!trainedToday);
                      saveMaleData(updated);
                    }}
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${trainedToday ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {trainedToday ? 'Yes (Heavy Lifts)' : 'Not Yet'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[#E8E4DE]">
                  <span className="text-[#6B7280]">Zinc & Vitamin D3:</span>
                  <button 
                    onClick={() => {
                      const updated = { ...maleData, zincAndVitaminDIntake: !zincTaken };
                      setZincTaken(!zincTaken);
                      saveMaleData(updated);
                    }}
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${zincTaken ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {zincTaken ? 'Taken' : 'Pending'}
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-2 text-[10px] text-[#A0A09C] italic">
              Cortisol balance maintains optimal Leydig hormone output.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SYMPTOMS ASSOCIATED WITH CYCLE AND EACH DAY, MOODS FOR THE DAY */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4DE]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DE]">
                Daily Check-in
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DE]">
                Inspecting: Day {selectedCycleDay}
              </span>
            </div>
            <h3 className="text-2xl font-serif italic text-[#2D2D2D]">
              Daily Symptoms & Moods Associated with Cycle Day {selectedCycleDay}
            </h3>
            <p className="text-xs text-[#6B7280]">
              Log your physical symptoms and emotional moods for this specific date on the cylinder
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log Saved for Day {selectedCycleDay}!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveDailyLog} className="space-y-6">
          {/* Sliders & Flow Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Cramps Intensity */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D] uppercase tracking-wider text-[11px]">
                  Cramp Discomfort: {crampsLevel} / 4
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  crampsLevel === 0 ? 'bg-emerald-100 text-emerald-800' :
                  crampsLevel <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {crampsLevel === 0 ? 'None' : crampsLevel === 1 ? 'Mild' : crampsLevel === 2 ? 'Moderate' : crampsLevel === 3 ? 'Intense' : 'Severe'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={crampsLevel}
                onChange={(e) => setCrampsLevel(Number(e.target.value))}
                className="w-full accent-[#A45C40] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B7280]">
                <span>0: Relaxed</span>
                <span>2: Noticeable</span>
                <span>4: Strong Spasms</span>
              </div>
            </div>

            {/* Energy Level */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D] uppercase tracking-wider text-[11px]">
                  Vitality & Energy: {energyScore} / 5
                </span>
                <span className="text-[10px] font-bold text-[#3A4D39] bg-[#E8E4DE] px-2 py-0.5 rounded-md">
                  {energyScore >= 4 ? 'High & Radiant' : energyScore === 3 ? 'Steady' : 'Fatigued'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={energyScore}
                onChange={(e) => setEnergyScore(Number(e.target.value))}
                className="w-full accent-[#3A4D39] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6B7280]">
                <span>1: Depleted</span>
                <span>3: Neutral</span>
                <span>5: Peak Vigor</span>
              </div>
            </div>

            {/* Flow State */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D2D2D] uppercase tracking-wider text-[11px]">
                  Flow / Fluid State
                </span>
                <span className="text-[10px] font-mono text-[#6B7280] capitalize">
                  {flowLevel}
                </span>
              </div>
              <select
                value={flowLevel}
                onChange={(e: any) => setFlowLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D8D4CE] text-xs bg-white text-[#2D2D2D] focus:border-[#A45C40] outline-hidden"
              >
                <option value="none">None / Clear</option>
                <option value="spotting">Spotting (Trace)</option>
                <option value="light">Light Flow</option>
                <option value="medium">Medium Flow</option>
                <option value="heavy">Heavy Flow</option>
              </select>
              <div className="text-[10px] text-[#6B7280]">
                Logged on Day {selectedCycleDay}
              </div>
            </div>
          </div>

          {/* Daily Symptoms Checklist */}
          <div>
            <label className="font-bold text-xs uppercase tracking-wider text-[#2D2D2D] block mb-2">
              Physical Symptoms Experienced Today
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#A45C40] text-white shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#4A4A48] hover:bg-white border border-[#E8E4DE]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Moods Checklist */}
          <div>
            <label className="font-bold text-xs uppercase tracking-wider text-[#2D2D2D] block mb-2">
              Moods & Emotional Weather for Today
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#3A4D39] text-white shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#4A4A48] hover:bg-white border border-[#E8E4DE]'
                    }`}
                  >
                    {isSelected ? '✨ ' : ''}
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daily Notes & Save Button */}
          <div className="space-y-2">
            <label className="font-bold text-xs text-[#2D2D2D] block">
              Personal Observations & Body Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Felt warm and energized after midday walk, lower back felt loose after chamomile tea..."
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#D8D4CE] bg-[#FAF8F5] text-xs focus:border-[#3A4D39] focus:bg-white outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#6B7280]">
              Selected on Cylinder: <strong>Day {selectedCycleDay}</strong>
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#3A4D39] text-white text-xs font-bold hover:bg-[#2D3E2C] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Daily Log for Day {selectedCycleDay}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* 4. USE DATA FROM NUTRITION & RECIPES: PREPAREDNESS, CIRCULATION & CRAMPS */}
      {/* ========================================================================= */}
      <NutritionCycleSync
        gender={activeGender}
        currentPhase={femaleCycle.currentPhase}
        cycleDay={femaleCycle.currentCycleDay}
        nutritionLogs={nutritionLogs}
        onNavigateToNutrition={onNavigateToNutrition}
      />

      {/* ========================================================================= */}
      {/* 5. CYCLE STAGE PREDICTOR FOR EACH PROFILE (USER & PARTNER) */}
      {/* ========================================================================= */}
      <CycleStagePredictor
        userProfile={
          userProfile || {
            name: 'Primary Profile',
            email: '',
            gender: activeGender,
            age: 29,
            weightKg: 65,
            heightCm: 170,
            bloodType: 'O_POS',
            relationshipStatus: 'in_relationship',
            partnerInfo: partnerInfo || undefined,
            chronotype: 'intermediate',
            primaryGoal: 'hormonal_balance',
            dietaryPattern: 'mediterranean',
            fastingRegimen: '16_8',
            biologicalAge: 27,
            allergies: [],
            healthConditions: [],
            vitalityScore: 88,
            healthSpanProjectionYears: 85,
            completedOnboarding: true,
            emergencyContacts: [],
            familyMembers: []
          }
        }
        partnerInfo={partnerInfo}
        lastPeriodStartDate={femaleCycle.lastPeriodStartDate || new Date().toISOString().split('T')[0]}
        cycleLengthDays={femaleCycle.cycleLengthDays || 28}
        onOpenAddPartner={() => setShowAddPartnerModal(true)}
      />

      {/* ========================================================================= */}
      {/* 6. PLACE TO ADD A PARTNER WHO WISH TO KNOW EACH OTHER'S CYCLE */}
      {/* ========================================================================= */}
      <PartnerCareHub 
        userGender={activeGender} 
        partner={partnerInfo}
        onPartnerChange={handleUpdatePartner}
      />

      {/* ========================================================================= */}
      {/* 7. TIPS ON HOW TO KEEP THE BODY IN PERFECT BALANCE & INSIGHTS */}
      {/* ========================================================================= */}
      <BodyBalanceMastery
        gender={activeGender}
        currentPhase={femaleCycle.currentPhase}
      />
    </div>
  );
};
