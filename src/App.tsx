import React, { useState, useEffect } from 'react';
import { Navigation, ActiveSegment } from './components/Navigation';
import { VitalsSegment } from './components/VitalsSegment';
import { StepsSegment } from './components/StepsSegment';
import { NutritionRecipesSegment } from './components/NutritionRecipesSegment';
import { CycleSegment } from './components/CycleSegment';
import { DoctorEmergencySegment } from './components/DoctorEmergencySegment';
import { WearablesSegment } from './components/WearablesSegment';
import { SleepSegment } from './components/SleepSegment';
import { AIOnboardingModal } from './components/AIOnboardingModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AccessibilityDrawer } from './components/AccessibilityDrawer';
import { AuthModal } from './components/AuthModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { HealthDangerModal } from './components/HealthDangerModal';

import { 
  UserProfile, 
  AIProtocol, 
  VitalRecord, 
  BluetoothWearableState, 
  AccessibilitySettings,
  HealthAlert,
  DoctorCheckupResolution
} from './types';
import { 
  DEFAULT_USER_PROFILE, 
  DEFAULT_AI_PROTOCOL, 
  DEFAULT_VITALS, 
  DEFAULT_ACCESSIBILITY_SETTINGS 
} from './data/defaultData';
import { bluetoothManager } from './utils/bluetoothHealth';
import { speechService } from './utils/accessibility';
import { evaluateVitalsAnomaly } from './utils/vitalsAnomalyDetector';

import { 
  Sparkles, 
  MessageSquare, 
  Activity, 
  Footprints, 
  Heart, 
  Moon,
  ShieldCheck, 
  Lock, 
  Eye, 
  Flame,
  CheckCircle2,
  HeartHandshake,
  Users,
  UserCheck
} from 'lucide-react';

export default function App() {
  // 1. User Profile & AI Protocol State (Local Persistence)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('vitalis_user_profile');
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [aiProtocol, setAiProtocol] = useState<AIProtocol>(() => {
    try {
      const saved = localStorage.getItem('vitalis_ai_protocol');
      return saved ? JSON.parse(saved) : DEFAULT_AI_PROTOCOL;
    } catch {
      return DEFAULT_AI_PROTOCOL;
    }
  });

  // 2. Vitals & Steps Data
  const [vitalsHistory, setVitalsHistory] = useState<VitalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vitalis_vitals_history');
      return saved ? JSON.parse(saved) : DEFAULT_VITALS;
    } catch {
      return DEFAULT_VITALS;
    }
  });

  const [dailySteps, setDailySteps] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vitalis_daily_steps');
      return saved ? Number(saved) : 7420;
    } catch {
      return 7420;
    }
  });

  // 3. Wearable State
  const [wearableState, setWearableState] = useState<BluetoothWearableState>(() => 
    bluetoothManager.getState()
  );

  // 4. Accessibility Settings
  const [a11ySettings, setA11ySettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem('vitalis_a11y_settings');
      return saved ? JSON.parse(saved) : DEFAULT_ACCESSIBILITY_SETTINGS;
    } catch {
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // 4b. Health Danger Telemetry Alerts State
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>(() => {
    try {
      const saved = localStorage.getItem('vitalis_health_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeAlertModal, setActiveAlertModal] = useState<HealthAlert | null>(null);

  // 5. Active Segment & Modals
  const [activeSegment, setActiveSegment] = useState<ActiveSegment>('vitals');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isA11yDrawerOpen, setIsA11yDrawerOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('vitalis_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('vitalis_ai_protocol', JSON.stringify(aiProtocol));
  }, [aiProtocol]);

  useEffect(() => {
    localStorage.setItem('vitalis_vitals_history', JSON.stringify(vitalsHistory));
  }, [vitalsHistory]);

  useEffect(() => {
    localStorage.setItem('vitalis_daily_steps', dailySteps.toString());
  }, [dailySteps]);

  useEffect(() => {
    localStorage.setItem('vitalis_health_alerts', JSON.stringify(healthAlerts));
  }, [healthAlerts]);

  // If there is an active unacknowledged alert, ensure it is surfaced in the danger modal
  useEffect(() => {
    const unacknowledged = healthAlerts.find((a) => a.status === 'active_unacknowledged');
    if (unacknowledged && !activeAlertModal) {
      setActiveAlertModal(unacknowledged);
    }
  }, [healthAlerts]);

  useEffect(() => {
    localStorage.setItem('vitalis_a11y_settings', JSON.stringify(a11ySettings));
    // Apply classes to document root for global CSS styling
    const root = document.documentElement;
    if (a11ySettings.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    if (a11ySettings.dyslexiaFont) {
      root.classList.add('dyslexia-mode');
    } else {
      root.classList.remove('dyslexia-mode');
    }

    if (a11ySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font scaling
    if (a11ySettings.fontSize === 'large') {
      root.style.fontSize = '18px';
    } else if (a11ySettings.fontSize === 'xlarge') {
      root.style.fontSize = '20px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [a11ySettings]);

  // Handle URL query parameters (e.g. Doctor Portal link opened)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'doctor-portal' || params.get('token')) {
        setActiveSegment('emergency');
      }
    }
  }, []);

  // Subscribe to speech service events
  useEffect(() => {
    speechService.setOnStateChange((speaking) => {
      setIsSpeaking(speaking);
    });
  }, []);

  // Sync with Bluetooth Manager state
  useEffect(() => {
    bluetoothManager.addListener((newState) => {
      setWearableState({ ...newState });
      if (newState.liveSteps) {
        setDailySteps(newState.liveSteps);
      }
      if (newState.liveHeartRate) {
        // Automatically append or update latest heart rate
        setVitalsHistory((prev) => {
          if (prev.length === 0) return prev;
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            heartRate: newState.liveHeartRate!,
            source: 'bluetooth',
          };
          return updated;
        });
      }
    });
  }, []);

  // Handlers
  const handleAddVitalRecord = (record: VitalRecord) => {
    setVitalsHistory((prevHistory) => {
      const previous = prevHistory[0];
      const detectedAlert = evaluateVitalsAnomaly(record, previous, healthAlerts);

      if (detectedAlert) {
        setHealthAlerts((prevAlerts) => [detectedAlert, ...prevAlerts]);
        setActiveAlertModal(detectedAlert);
      }

      return [record, ...prevHistory];
    });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setHealthAlerts((prev) => {
      const updated = prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'acknowledged_pending_doctor' as const,
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      );
      const current = updated.find((a) => a.id === alertId);
      if (current) {
        setActiveAlertModal(current);
      }
      return updated;
    });
  };

  const handleResolveAlertWithDoctor = (
    alertId: string,
    resolution: DoctorCheckupResolution,
    repeatVital?: Partial<VitalRecord>
  ) => {
    setHealthAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'resolved' as const,
              resolution,
            }
          : a
      )
    );

    // If doctor recorded repeat vitals at checkup, add as a verified vital record
    if (repeatVital) {
      const latest = vitalsHistory[0] || DEFAULT_VITALS[0];
      const verifiedRecord: VitalRecord = {
        id: `vital_doc_${Date.now()}`,
        timestamp: new Date().toISOString(),
        systolicBP: repeatVital.systolicBP ?? latest.systolicBP,
        diastolicBP: repeatVital.diastolicBP ?? latest.diastolicBP,
        heartRate: repeatVital.heartRate ?? latest.heartRate,
        spo2: repeatVital.spo2 ?? latest.spo2,
        bloodGlucose: repeatVital.bloodGlucose ?? latest.bloodGlucose,
        bodyTempC: repeatVital.bodyTempC ?? latest.bodyTempC,
        hrvMs: latest.hrvMs || 55,
        respiratoryRate: latest.respiratoryRate || 14,
        notes: repeatVital.notes || `Post-checkup verification by ${resolution.doctorName}`,
        source: 'manual',
      };
      setVitalsHistory((prev) => [verifiedRecord, ...prev]);
    }

    // Add to userProfile doctor updates
    const docUpdate = {
      id: `doc_${Date.now()}`,
      doctorName: resolution.doctorName,
      clinicName: resolution.clinicName,
      notes: `${resolution.clinicalDiagnosis}. ${resolution.examinationNotes}`,
      medicationAdjustments: resolution.medicationAdjustments,
      triageStatus: 'Cleared & Controlled',
      timestamp: resolution.checkupDate || new Date().toISOString(),
    };
    setUserProfile((prev) => ({
      ...prev,
      doctorUpdates: [docUpdate, ...(prev.doctorUpdates || [])],
    }));

    setActiveAlertModal(null);
  };

  const handleSimulateDangerSpike = (type: 'bp_crisis' | 'hypoxemia' | 'tachycardia' | 'hypoglycemia') => {
    const latest = vitalsHistory[0] || DEFAULT_VITALS[0];
    let spikedRecord: VitalRecord;

    switch (type) {
      case 'bp_crisis':
        spikedRecord = {
          id: `vital_spike_${Date.now()}`,
          timestamp: new Date().toISOString(),
          systolicBP: 184,
          diastolicBP: 118,
          heartRate: 98,
          spo2: 97,
          bloodGlucose: latest.bloodGlucose || 105,
          bodyTempC: 37.0,
          hrvMs: 32,
          respiratoryRate: 20,
          notes: 'Routine Telemetry Reading - Acute BP Spike Detected',
          source: 'manual',
        };
        break;
      case 'hypoxemia':
        spikedRecord = {
          id: `vital_spike_${Date.now()}`,
          timestamp: new Date().toISOString(),
          systolicBP: 118,
          diastolicBP: 78,
          heartRate: 112,
          spo2: 88,
          bloodGlucose: latest.bloodGlucose || 102,
          bodyTempC: 36.8,
          hrvMs: 28,
          respiratoryRate: 26,
          notes: 'Routine Telemetry Reading - Respiratory Desaturation Flagged',
          source: 'manual',
        };
        break;
      case 'tachycardia':
        spikedRecord = {
          id: `vital_spike_${Date.now()}`,
          timestamp: new Date().toISOString(),
          systolicBP: 132,
          diastolicBP: 84,
          heartRate: 136,
          spo2: 98,
          bloodGlucose: latest.bloodGlucose || 108,
          bodyTempC: 37.2,
          hrvMs: 24,
          respiratoryRate: 22,
          notes: 'Routine Telemetry Reading - Severe Tachyarrhythmia Flagged',
          source: 'manual',
        };
        break;
      case 'hypoglycemia':
        spikedRecord = {
          id: `vital_spike_${Date.now()}`,
          timestamp: new Date().toISOString(),
          systolicBP: 114,
          diastolicBP: 74,
          heartRate: 88,
          spo2: 98,
          bloodGlucose: 58,
          bodyTempC: 36.6,
          hrvMs: 35,
          respiratoryRate: 18,
          notes: 'Routine Telemetry Reading - Acute Neuroglycopenia Danger Flagged',
          source: 'manual',
        };
        break;
    }

    handleAddVitalRecord(spikedRecord);
    setActiveSegment('vitals');
  };

  const handleUpdateSteps = (newSteps: number) => {
    setDailySteps(newSteps);
  };

  const handleSaveProfileAndProtocol = (profile: UserProfile, protocol: AIProtocol) => {
    setUserProfile(profile);
    setAiProtocol(protocol);
    setIsOnboardingOpen(false);
  };

  const handleUpdateA11y = (newSettings: Partial<AccessibilitySettings>) => {
    setA11ySettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetA11y = () => {
    setA11ySettings(DEFAULT_ACCESSIBILITY_SETTINGS);
  };

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      speechService.speak(getCurrentScreenSummary());
    }
  };

  // Generate dynamic screen reader summary based on active screen
  const getCurrentScreenSummary = (): string => {
    const latest = vitalsHistory[0] || DEFAULT_VITALS[0];
    switch (activeSegment) {
      case 'vitals':
        return `Vitals Telemetry. Latest Blood Pressure is ${latest.systolicBP} over ${latest.diastolicBP} millimeters of mercury. Heart rate is ${wearableState.liveHeartRate || latest.heartRate} beats per minute. Blood oxygen is ${latest.spo2} percent. Blood glucose is ${latest.bloodGlucose} milligrams per deciliter.`;
      case 'steps': {
        const safeTarget = aiProtocol?.stepTarget || aiProtocol?.dailyStepTarget || 8500;
        const safeSteps = dailySteps ?? 0;
        return `Steps Pedometer. You have taken ${safeSteps.toLocaleString()} steps today towards your ${safeTarget.toLocaleString()} goal. Current physiological benefit tier: ${safeSteps >= 8000 ? 'JAMA Longevity Plateau' : 'Sedentary Baseline Cleared'}.`;
      }
      case 'sleep':
        return `Sleep Restoration and Nocturnal Acoustics Telemetry. Circadian routine is configured. Last night's sleep score was 91 with 8 hours 6 minutes duration. Nocturnal acoustic monitoring and gentle awakening alarms are available.`;
      case 'nutrition':
        return `Nutrition and AI Recipes. Dietary preference is ${userProfile.dietaryPreference}. Daily calorie budget is ${aiProtocol.calorieTarget} calories. Multiple fast whole food recipes are available.`;
      case 'cycle':
        return `Biological Cycles. Current view is ${userProfile.gender === 'female' ? 'Women\'s Infradian Menstrual Cycle' : 'Men\'s Diurnal Testosterone Rhythm'}.`;
      case 'emergency':
        return `Emergency Medical History. Sharable external link is generated for your family doctor. Blood type ${DEFAULT_USER_PROFILE.bloodType || 'O Positive'}. Emergency contacts and critical allergies are configured.`;
      case 'wearables':
        return `Wearables synchronization. Status is ${wearableState.isConnected ? 'Connected and streaming' : 'Disconnected'}.`;
      default:
        return 'Vitalis Health AI Longevity and Medical Telemetry.';
    }
  };

  const latestVital = vitalsHistory[0] || DEFAULT_VITALS[0];
  const targetSteps = aiProtocol?.stepTarget || aiProtocol?.dailyStepTarget || 8500;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] font-sans flex flex-col antialiased selection:bg-[#E8E4DE] selection:text-[#3A4D39]">
      {/* Top Universal Navigation */}
      <Navigation
        activeSegment={activeSegment}
        onSelectSegment={(seg) => {
          if (seg === 'ai_assistant') {
            setIsAIChatOpen(true);
          } else {
            setActiveSegment(seg);
          }
        }}
        wearableState={wearableState}
        onOpenAccessibility={() => setIsA11yDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        userProfile={userProfile}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        a11y={a11ySettings}
        activeAlertCount={healthAlerts.filter((a) => a.status !== 'resolved').length}
      />

      {/* Primary Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Executive Patient Summary Card - Natural Deep Forest Tonal Container */}
        <div className="bg-[#3A4D39] text-[#FDFCFB] rounded-[32px] p-6 sm:p-8 border border-[#2F3F2E] shadow-sm relative overflow-hidden">
          {/* Subtle natural lighting accent */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#FDFCFB] bg-white/15 px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#A45C40]" />
                  AI Protocol: {aiProtocol.focusArea || 'Longevity & Endocrine Balance'}
                </span>

                {userProfile.syncEnabled && (
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8E4DE] bg-white/10 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#7C9070]" />
                    Encrypted Cloud Sync Active
                  </span>
                )}

                {/* Relationship / Family Status Tag */}
                <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-[#A45C40]/80 px-2.5 py-1 rounded-full border border-white/15 flex items-center gap-1.5">
                  {userProfile.relationshipStatus === 'married' ? (
                    <>
                      <HeartHandshake className="w-3 h-3 text-[#E8E4DE]" />
                      <span>Married {userProfile.familyInfo?.spouseName ? `• ${userProfile.familyInfo.spouseName}` : ''}</span>
                    </>
                  ) : userProfile.relationshipStatus === 'in_relationship' ? (
                    <>
                      <Heart className="w-3 h-3 text-[#E8E4DE]" />
                      <span>In a Relationship</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3 text-[#E8E4DE]" />
                      <span>Individual Patient</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="relative group rounded-full"
                  title="Click to edit profile picture and family records"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 bg-[#2F3F2E] flex items-center justify-center font-serif italic text-2xl text-white group-hover:border-white transition-all shadow-md">
                    {userProfile.avatarUrl ? (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span>{userProfile.name?.charAt(0) || 'V'}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 p-1 bg-[#A45C40] rounded-full text-white text-[9px] shadow-xs group-hover:scale-110 transition-transform">
                    <Users className="w-2.5 h-2.5" />
                  </span>
                </button>

                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-white tracking-tight flex items-center gap-3">
                    Welcome, {userProfile.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#E8E4DE] flex-wrap">
                    <span>{userProfile.age} yrs</span>
                    <span>•</span>
                    <span>{userProfile.gender === 'female' ? 'Female' : 'Male'}</span>
                    <span>•</span>
                    <span>{userProfile.weightKg} kg</span>
                    {userProfile.relationshipStatus === 'married' && userProfile.familyInfo?.childrenCount ? (
                      <>
                        <span>•</span>
                        <span className="text-white/90 font-medium">{userProfile.familyInfo.childrenCount} {userProfile.familyInfo.childrenCount === 1 ? 'Dependent' : 'Dependents'}</span>
                      </>
                    ) : null}
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="ml-2 text-[11px] underline underline-offset-2 font-bold text-white/90 hover:text-white"
                    >
                      Edit Profile & Family
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#E8E4DE] max-w-2xl leading-relaxed">
                {aiProtocol.clinicalSummary || 'Your personalized AI physiological protocol is active. All vitals, step milestones, and endocrine rhythms are continuously monitored.'}
              </p>
            </div>

            {/* Quick Metrics Capsule Strip */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              {/* Daily Steps Quick Capsule */}
              <div 
                onClick={() => setActiveSegment('steps')}
                className="bg-white/10 hover:bg-white/15 cursor-pointer p-4 rounded-2xl border border-white/15 backdrop-blur-xs transition-all min-w-[135px]"
              >
                <div className="flex items-center justify-between text-[11px] text-[#E8E4DE] mb-1">
                  <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
                    <Footprints className="w-3.5 h-3.5 text-[#E8E4DE]" />
                    Steps
                  </span>
                  <span className="font-mono text-xs">{Math.round(((dailySteps ?? 0) / (targetSteps || 8500)) * 100)}%</span>
                </div>
                <div className="text-2xl font-serif text-white">
                  {(dailySteps ?? 0).toLocaleString()}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-[#E8E4DE] font-bold block mt-1">
                  {dailySteps >= 8000 ? 'Longevity Plateau' : 'Base Active'}
                </span>
              </div>

              {/* Heart Rate Quick Capsule */}
              <div 
                onClick={() => setActiveSegment('vitals')}
                className="bg-white/10 hover:bg-white/15 cursor-pointer p-4 rounded-2xl border border-white/15 backdrop-blur-xs transition-all min-w-[135px]"
              >
                <div className="flex items-center justify-between text-[11px] text-[#E8E4DE] mb-1">
                  <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
                    <Heart className="w-3.5 h-3.5 text-[#A45C40]" />
                    Pulse
                  </span>
                  {wearableState.isConnected && <span className="w-2 h-2 rounded-full bg-[#A45C40] animate-ping" />}
                </div>
                <div className="text-2xl font-serif text-white">
                  {wearableState.liveHeartRate || latestVital.heartRate} <span className="text-xs font-sans italic opacity-80">bpm</span>
                </div>
                <span className="text-[10px] text-[#E8E4DE] font-medium block mt-1">
                  BP {latestVital.systolicBP}/{latestVital.diastolicBP} mmHg
                </span>
              </div>

              {/* Sleep Quick Capsule */}
              <div 
                onClick={() => setActiveSegment('sleep')}
                className="bg-white/10 hover:bg-white/15 cursor-pointer p-4 rounded-2xl border border-white/15 backdrop-blur-xs transition-all min-w-[135px]"
              >
                <div className="flex items-center justify-between text-[11px] text-[#E8E4DE] mb-1">
                  <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px]">
                    <Moon className="w-3.5 h-3.5 text-[#FDFCFB]" />
                    Sleep
                  </span>
                  <span className="text-[10px] text-[#E8E4DE] font-mono">91/100</span>
                </div>
                <div className="text-2xl font-serif text-white">
                  8h 06m
                </div>
                <span className="text-[10px] text-[#E8E4DE] font-medium block mt-1">
                  Quiet • Low Snore
                </span>
              </div>

              {/* AI Clinical Assistant Trigger */}
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="bg-[#A45C40] hover:bg-[#8F4F36] text-white rounded-2xl p-4 shadow-sm flex flex-col justify-center items-center gap-1 min-w-[130px] transition-all"
              >
                <Sparkles className="w-5 h-5 text-[#FAF8F5]" />
                <span className="text-xs font-bold uppercase tracking-wider">Ask Clinical AI</span>
                <span className="text-[10px] text-white/80">24/7 Companion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Segment Rendering */}
        <section aria-label="Main Health Segment">
          {activeSegment === 'vitals' && (
            <VitalsSegment
              vitalsHistory={vitalsHistory}
              onAddVitalRecord={handleAddVitalRecord}
              wearableState={wearableState}
              userProfile={userProfile}
              dailySteps={dailySteps}
              healthAlerts={healthAlerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onOpenAlertModal={(alert) => setActiveAlertModal(alert)}
              onSimulateDangerSpike={handleSimulateDangerSpike}
            />
          )}

          {activeSegment === 'steps' && (
            <StepsSegment
              currentSteps={dailySteps}
              targetSteps={targetSteps}
              onUpdateSteps={handleUpdateSteps}
              isWearableConnected={wearableState.isConnected}
            />
          )}

          {activeSegment === 'sleep' && (
            <SleepSegment userGender={userProfile.gender} />
          )}

          {activeSegment === 'nutrition' && (
            <NutritionRecipesSegment
              userProfile={userProfile}
              aiProtocol={aiProtocol}
            />
          )}

          {activeSegment === 'cycle' && (
            <CycleSegment 
              userProfile={userProfile}
              userGender={userProfile.gender}
              onUpdateProfile={(updated) => setUserProfile(updated)}
              onNavigateToNutrition={() => setActiveSegment('nutrition')}
            />
          )}

          {activeSegment === 'emergency' && (
            <DoctorEmergencySegment 
              latestVitals={latestVital} 
              userProfile={userProfile} 
            />
          )}

          {activeSegment === 'wearables' && (
            <WearablesSegment
              wearableState={wearableState}
              onStateChange={(newState) => setWearableState({ ...newState })}
            />
          )}
        </section>
      </main>

      {/* Persistent Footer with Natural Tones theme & Accessibility */}
      <footer className="mt-12 bg-[#FAF8F5] border-t border-[#E8E4DE] py-8 px-4 text-center text-xs text-[#6B7280] space-y-3">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-serif italic font-normal text-base text-[#3A4D39]">Vitalis AI</span>
            <span className="text-[#D8D4CE]">|</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#7C9070]">Tailored Health Intelligence</span>
          </div>

          <div className="flex items-center gap-4 text-[#6B7280]">
            <button
              onClick={() => setIsA11yDrawerOpen(true)}
              className="hover:text-[#3A4D39] font-medium transition-colors"
            >
              Accessibility Suite
            </button>
            <span className="text-[#D8D4CE]">•</span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-[#3A4D39] font-medium transition-colors"
            >
              Privacy & Encryption
            </button>
            <span className="text-[#D8D4CE]">•</span>
            <span className="text-[10px] uppercase font-bold text-[#7C9070]">HIPAA Compliant</span>
          </div>
        </div>

        <p className="text-[10px] text-[#6B7280] max-w-3xl mx-auto pt-2 italic font-serif leading-relaxed">
          &copy; Vitalis AI Health Systems. Unified Data Architecture. Clinical Disclaimer: Health metrics tracking, preventative guidance, and peer-reviewed educational insights. In case of acute medical emergency, contact emergency services.
        </p>
      </footer>

      {/* Floating Action Button: Open AI Assistant */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white p-4 rounded-full shadow-lg border border-[#E8E4DE] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 group"
        aria-label="Open AI Health Assistant"
      >
        <Sparkles className="w-5 h-5 text-[#A45C40] group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-[#FDFCFB] pr-1">
          Clinical AI Companion
        </span>
      </button>

      {/* MODALS & DRAWERS */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={(updated) => setUserProfile(updated)}
        onOpenOnboarding={() => {
          setIsProfileModalOpen(false);
          setIsOnboardingOpen(true);
        }}
      />

      <AIOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={userProfile}
        onSaveProfileAndProtocol={handleSaveProfileAndProtocol}
      />

      <AccessibilityDrawer
        isOpen={isA11yDrawerOpen}
        onClose={() => setIsA11yDrawerOpen(false)}
        settings={a11ySettings}
        onUpdateSettings={handleUpdateA11y}
        onResetSettings={handleResetA11y}
        currentScreenSummary={getCurrentScreenSummary()}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userProfile}
        onAuthSuccess={(updated) => setUserProfile(updated)}
        onSignOut={() => setUserProfile(DEFAULT_USER_PROFILE)}
      />

      <AIAssistantDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        userProfile={userProfile}
        aiProtocol={aiProtocol}
        latestVitals={latestVital}
        currentSteps={dailySteps}
      />

      <HealthDangerModal
        alert={activeAlertModal}
        userProfile={userProfile}
        latestVitals={latestVital}
        onAcknowledge={handleAcknowledgeAlert}
        onResolveWithDoctor={handleResolveAlertWithDoctor}
        onCloseBanner={() => setActiveAlertModal(null)}
      />
    </div>
  );
}
