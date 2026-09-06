import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, 
  Sun, 
  AlarmClock, 
  Bell, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Mic, 
  MicOff, 
  Activity, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Waves, 
  ShieldCheck, 
  ChevronRight, 
  BarChart3, 
  Sliders, 
  Heart, 
  Info,
  RotateCcw,
  Zap,
  Ear,
  Music,
  Upload,
  Trash2,
  Pause,
  Smartphone,
  FileAudio,
  Timer,
  Check,
  Edit2
} from 'lucide-react';
import { 
  DayOfWeek, 
  DailyAlarmSchedule, 
  SleepRoutineSettings, 
  SleepSessionRecord, 
  AlarmSoundId, 
  BackgroundSoundscapeId, 
  NocturnalAudioEvent, 
  SleepDisorderType,
  CustomAudioTrack
} from '../types';
import { 
  DEFAULT_SLEEP_ROUTINE, 
  ALARM_SOUND_OPTIONS, 
  BACKGROUND_SOUNDSCAPES, 
  INITIAL_SLEEP_SESSIONS,
  SAMPLE_PHONE_AUDIO_TRACKS
} from '../data/defaultSleepData';
import { sleepAudioEngine, AcousticMetrics } from '../utils/sleepAudioEngine';

interface SleepSegmentProps {
  userGender?: 'female' | 'male';
}

type SleepTab = 'routine' | 'active_session' | 'calm_tones' | 'disorders' | 'history';

const DAYS_ORDER: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const SleepSegment: React.FC<SleepSegmentProps> = () => {
  const [activeTab, setActiveTab] = useState<SleepTab>('routine');

  // 1. Sleep Schedule & Alarms Routine State
  const [routine, setRoutine] = useState<SleepRoutineSettings>(() => {
    try {
      const saved = localStorage.getItem('vitalis_sleep_routine');
      return saved ? JSON.parse(saved) : DEFAULT_SLEEP_ROUTINE;
    } catch {
      return DEFAULT_SLEEP_ROUTINE;
    }
  });

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon');
  const [isPreviewingAlarm, setIsPreviewingAlarm] = useState<boolean>(false);
  const [previewSoundId, setPreviewSoundId] = useState<AlarmSoundId>(routine.alarmSound);

  // 2. Active Sleep Session & Background Audio State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [selectedSoundscape, setSelectedSoundscape] = useState<BackgroundSoundscapeId>('brown_noise');
  const [soundscapeVolume, setSoundscapeVolume] = useState<number>(45);

  // 3. Acoustic Metrics & Nocturnal Disorder Events
  const [acousticMetrics, setAcousticMetrics] = useState<AcousticMetrics>({
    currentDb: 32,
    peakDb: 32,
    snoringProbability: 0,
    restlessnessScore: 0,
    frequencyBands: { lowHz: 12, midHz: 10, highHz: 5 },
    isMicActive: false,
    isSimulated: false,
  });

  const [currentSessionEvents, setCurrentSessionEvents] = useState<NocturnalAudioEvent[]>([]);
  const [alarmRinging, setAlarmRinging] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // 4. Sleep History Sessions
  const [sleepHistory, setSleepHistory] = useState<SleepSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('vitalis_sleep_history');
      return saved ? JSON.parse(saved) : INITIAL_SLEEP_SESSIONS;
    } catch {
      return INITIAL_SLEEP_SESSIONS;
    }
  });

  // 5. Custom Phone Audio Awakening Tones Library
  const [customAudioTracks, setCustomAudioTracks] = useState<CustomAudioTrack[]>(() => {
    try {
      const saved = localStorage.getItem('vitalis_custom_alarm_tracks');
      return saved ? JSON.parse(saved) : SAMPLE_PHONE_AUDIO_TRACKS;
    } catch {
      return SAMPLE_PHONE_AUDIO_TRACKS;
    }
  });
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTrackName, setEditingTrackName] = useState<string>('');

  // 6. Body-Calming & Sleep-Inducing Frequencies Studio State
  const [isPlayingCalmTone, setIsPlayingCalmTone] = useState<boolean>(false);
  const [selectedCalmTone, setSelectedCalmTone] = useState<BackgroundSoundscapeId>('binaural_theta_6hz');
  const [calmToneVolume, setCalmToneVolume] = useState<number>(55);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(30); // 0 = continuous, 15, 30, 45, 60
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number | null>(null);
  const [calmCategoryFilter, setCalmCategoryFilter] = useState<string>('all');

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('vitalis_sleep_routine', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('vitalis_sleep_history', JSON.stringify(sleepHistory));
  }, [sleepHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('vitalis_custom_alarm_tracks', JSON.stringify(customAudioTracks));
    } catch (e) {
      console.warn('Storage quota limit reached for phone audio, keeping in active session:', e);
    }
  }, [customAudioTracks]);

  // Calming Tone Sleep Countdown Timer
  useEffect(() => {
    let timer: number | null = null;
    if (isPlayingCalmTone && timerRemainingSeconds !== null && timerRemainingSeconds > 0) {
      timer = window.setInterval(() => {
        setTimerRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            sleepAudioEngine.stopBackgroundSoundscape();
            setIsPlayingCalmTone(false);
            setSaveToast('Sleep timer reached. Calming tone faded out gently.');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingCalmTone, timerRemainingSeconds]);

  // Timer for active sleep session
  useEffect(() => {
    let timer: number | null = null;
    if (isSessionActive && sessionStartTime) {
      timer = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, sessionStartTime]);

  // Live Alarm Time Checker
  useEffect(() => {
    const alarmChecker = window.setInterval(() => {
      if (alarmRinging) return;
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayDay = dayNames[now.getDay()];

      const todaySchedule = routine.mode === 'uniform' 
        ? { wakeTime: routine.uniformWakeTime, wakeAlarm: routine.uniformWakeAlarm }
        : { wakeTime: routine.dailySchedules[todayDay]?.wakeTime, wakeAlarm: routine.dailySchedules[todayDay]?.wakeAlarm };

      if (todaySchedule.wakeAlarm && todaySchedule.wakeTime === currentTimeStr && now.getSeconds() < 4) {
        triggerWakeAlarm();
      }
    }, 4000);

    return () => clearInterval(alarmChecker);
  }, [routine, alarmRinging]);

  // Format seconds to H:MM:SS
  const formatElapsedTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  // Helper to calculate minutes between Bedtime and Wake time
  const calculateSleepDurationMinutes = (bed: string, wake: string): number => {
    const [bH, bM] = bed.split(':').map(Number);
    const [wH, wM] = wake.split(':').map(Number);
    let bedMinutes = bH * 60 + bM;
    let wakeMinutes = wH * 60 + wM;
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60; // Next day
    }
    return wakeMinutes - bedMinutes;
  };

  // Routine Handlers
  const handleUpdateSchedule = (day: DayOfWeek, updates: Partial<DailyAlarmSchedule>) => {
    setRoutine(prev => {
      const currentDay = prev.dailySchedules[day];
      const newSchedule = { ...currentDay, ...updates };
      if (updates.bedtime || updates.wakeTime) {
        newSchedule.targetSleepMinutes = calculateSleepDurationMinutes(
          newSchedule.bedtime,
          newSchedule.wakeTime
        );
      }
      return {
        ...prev,
        dailySchedules: {
          ...prev.dailySchedules,
          [day]: newSchedule,
        },
      };
    });
    showToast(`Updated ${day} schedule`);
  };

  const handleUpdateUniform = (updates: Partial<SleepRoutineSettings>) => {
    setRoutine(prev => ({ ...prev, ...updates }));
    showToast('Updated everyday uniform routine');
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Helper to resolve custom audio URL for alarm
  const getAudioUrlForAlarm = (soundId: AlarmSoundId): string | undefined => {
    const track = customAudioTracks.find(t => t.id === soundId);
    return track?.audioDataUrl;
  };

  // Alarm Sound Preview & Selection
  const handleToggleAlarmPreview = (soundId: AlarmSoundId) => {
    if (isPreviewingAlarm && previewSoundId === soundId) {
      sleepAudioEngine.stopAlarm();
      setIsPreviewingAlarm(false);
    } else {
      setPreviewSoundId(soundId);
      const customUrl = getAudioUrlForAlarm(soundId);
      sleepAudioEngine.playAlarm(soundId, routine.alarmVolume, customUrl);
      setIsPreviewingAlarm(true);
    }
  };

  const handleSelectAlarmSound = (soundId: AlarmSoundId) => {
    setRoutine(prev => ({ ...prev, alarmSound: soundId }));
    setPreviewSoundId(soundId);
    const customTrack = customAudioTracks.find(t => t.id === soundId);
    const soundName = customTrack ? customTrack.name : ALARM_SOUND_OPTIONS.find(s => s.id === soundId)?.name || 'Awakening Tone';
    showToast(`Selected "${soundName}" as awakening tone`);
  };

  const triggerWakeAlarm = () => {
    setAlarmRinging(true);
    const customUrl = getAudioUrlForAlarm(routine.alarmSound);
    sleepAudioEngine.playAlarm(routine.alarmSound, routine.alarmVolume, customUrl);
  };

  // Phone Music File Management Handlers
  const handlePhoneFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i)) {
        showToast(`Skipped ${file.name}: only audio files supported`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

        const newTrack: CustomAudioTrack = {
          id: `phone_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: formattedName,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'audio/mpeg',
          durationSeconds: 180,
          addedAt: new Date().toISOString(),
          audioDataUrl: dataUrl,
          isPreloaded: false,
        };

        setCustomAudioTracks(prev => [newTrack, ...prev]);
        setRoutine(prev => ({ ...prev, alarmSound: newTrack.id }));
        setPreviewSoundId(newTrack.id);
        showToast(`Added & set "${formattedName}" as awakening tone`);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteCustomTrack = (trackId: string) => {
    if (previewingTrackId === trackId) {
      sleepAudioEngine.stopTrackPreview();
      setPreviewingTrackId(null);
    }
    setCustomAudioTracks(prev => prev.filter(t => t.id !== trackId));
    if (routine.alarmSound === trackId) {
      setRoutine(prev => ({ ...prev, alarmSound: 'zen_bowl' }));
      setPreviewSoundId('zen_bowl');
    }
    showToast('Removed track from awakening library');
  };

  const handleToggleTrackPreview = (track: CustomAudioTrack) => {
    if (previewingTrackId === track.id) {
      sleepAudioEngine.stopTrackPreview();
      setPreviewingTrackId(null);
    } else {
      setPreviewingTrackId(track.id);
      sleepAudioEngine.playTrackPreview(track.audioDataUrl, track.id, routine.alarmVolume);
    }
  };

  const handleSaveRenameTrack = (trackId: string) => {
    if (!editingTrackName.trim()) {
      setEditingTrackId(null);
      return;
    }
    setCustomAudioTracks(prev => prev.map(t => t.id === trackId ? { ...t, name: editingTrackName.trim() } : t));
    setEditingTrackId(null);
    showToast('Updated track name');
  };

  // Calming & Sleep-Inducing Tones Handlers
  const handleToggleCalmTone = (toneId: BackgroundSoundscapeId) => {
    if (isPlayingCalmTone && selectedCalmTone === toneId) {
      sleepAudioEngine.stopBackgroundSoundscape();
      setIsPlayingCalmTone(false);
      setTimerRemainingSeconds(null);
    } else {
      setSelectedCalmTone(toneId);
      sleepAudioEngine.playBackgroundSoundscape(toneId, calmToneVolume);
      setIsPlayingCalmTone(true);
      if (sleepTimerMinutes > 0) {
        setTimerRemainingSeconds(sleepTimerMinutes * 60);
      } else {
        setTimerRemainingSeconds(null);
      }
      const toneInfo = BACKGROUND_SOUNDSCAPES.find(s => s.id === toneId);
      showToast(`Playing ${toneInfo?.name || 'Calming Tone'}`);
    }
  };

  const handleStopCalmTone = () => {
    sleepAudioEngine.stopBackgroundSoundscape();
    setIsPlayingCalmTone(false);
    setTimerRemainingSeconds(null);
    showToast('Calming tone paused');
  };

  const handleChangeCalmVolume = (vol: number) => {
    setCalmToneVolume(vol);
    sleepAudioEngine.setSoundscapeVolume(vol);
  };

  const handleSetSleepTimer = (mins: number) => {
    setSleepTimerMinutes(mins);
    if (mins === 0) {
      setTimerRemainingSeconds(null);
      showToast('Sleep timer: Continuous loop');
    } else {
      setTimerRemainingSeconds(mins * 60);
      showToast(`Sleep timer: ${mins} minutes`);
    }
  };

  const handleSetBedtimeCalmingTone = (toneId: BackgroundSoundscapeId) => {
    setRoutine(prev => ({
      ...prev,
      bedtimeCalmingTone: toneId,
    }));
    const tone = BACKGROUND_SOUNDSCAPES.find(s => s.id === toneId);
    showToast(`Set "${tone?.name || toneId}" as Sweet Sleep Bedtime Tone`);
  };

  const handleStartBedtimeSweetSleep = (toneId?: BackgroundSoundscapeId) => {
    const toneToPlay = toneId || routine.bedtimeCalmingTone || 'starlight_piano_lullaby';
    setSelectedCalmTone(toneToPlay);
    const vol = routine.bedtimeMusicVolume || 40;
    setCalmToneVolume(vol);
    const timerMins = routine.bedtimeMusicTimerMinutes || 30;
    setSleepTimerMinutes(timerMins);
    setTimerRemainingSeconds(timerMins > 0 ? timerMins * 60 : null);
    sleepAudioEngine.playBackgroundSoundscape(toneToPlay, vol);
    setIsPlayingCalmTone(true);
    showToast('Bedtime Sweet Sleep music started. Drift away peacefully.');
  };

  const handleStopAlarm = () => {
    setAlarmRinging(false);
    sleepAudioEngine.stopAlarm();
    showToast('Alarm dismissed');
  };

  const handleSnoozeAlarm = () => {
    setAlarmRinging(false);
    sleepAudioEngine.stopAlarm();
    showToast(`Snoozed for ${routine.snoozeMinutes} minutes`);
    setTimeout(() => {
      triggerWakeAlarm();
    }, routine.snoozeMinutes * 60 * 1000);
  };

  // Start Active Overnight Sleep Session
  const handleStartSession = async () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setElapsedSeconds(0);
    setCurrentSessionEvents([]);

    // Start background soundscape
    if (selectedSoundscape !== 'off') {
      sleepAudioEngine.playBackgroundSoundscape(selectedSoundscape, soundscapeVolume);
    }

    // Start acoustic monitoring
    await sleepAudioEngine.startAcousticMonitoring(
      (metrics) => setAcousticMetrics(metrics),
      (event) => {
        setCurrentSessionEvents(prev => [event, ...prev]);
      }
    );

    showToast('Overnight sleep session & acoustic monitoring active');
  };

  // Stop & Save Sleep Session
  const handleEndSession = () => {
    sleepAudioEngine.stopAcousticMonitoring();
    sleepAudioEngine.stopBackgroundSoundscape();

    const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
    const now = new Date();
    const startObj = sessionStartTime ? new Date(sessionStartTime) : new Date(Date.now() - durationMin * 60000);

    const snoreCount = currentSessionEvents.filter(e => e.type === 'snoring').length;
    const insomniaCount = currentSessionEvents.filter(e => e.type === 'insomnia_wakefulness').length;
    const restlessCount = currentSessionEvents.filter(e => e.type === 'restless_movement').length;
    const apneaCount = currentSessionEvents.filter(e => e.type === 'respiratory_apnea_pause').length;

    // Calculate realistic sleep stages based on duration & disruptions
    const deepFraction = Math.max(0.12, 0.23 - (snoreCount * 0.01) - (insomniaCount * 0.03));
    const remFraction = 0.21;
    const awakeFraction = Math.min(0.25, 0.06 + (insomniaCount * 0.04) + (restlessCount * 0.01));
    const lightFraction = Math.max(0.35, 1 - (deepFraction + remFraction + awakeFraction));

    // Dynamic sleep score calculation
    let score = 95;
    if (durationMin < 420) score -= Math.round((420 - durationMin) / 10);
    score -= snoreCount * 2;
    score -= insomniaCount * 6;
    score -= apneaCount * 8;
    score = Math.max(45, Math.min(99, score));

    let disorderRisk: SleepSessionRecord['disorderRisk'] = 'optimal';
    if (apneaCount > 1 || insomniaCount > 2) {
      disorderRisk = 'high_apnea_insomnia_risk';
    } else if (snoreCount > 4 || restlessCount > 6) {
      disorderRisk = 'moderate_disruption';
    } else if (snoreCount > 1) {
      disorderRisk = 'mild_snoring';
    }

    const newRecord: SleepSessionRecord = {
      id: `slp_${Date.now()}`,
      date: now.toISOString().split('T')[0],
      startTime: startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: durationMin,
      targetDurationMinutes: 495,
      sleepScore: score,
      efficiencyPercent: Math.round((1 - awakeFraction) * 100),
      timeToFallAsleepMinutes: Math.min(35, Math.max(8, insomniaCount * 12 + 10)),
      stages: {
        deepMinutes: Math.round(durationMin * deepFraction),
        remMinutes: Math.round(durationMin * remFraction),
        lightMinutes: Math.round(durationMin * lightFraction),
        awakeMinutes: Math.round(durationMin * awakeFraction),
      },
      snoringMinutes: snoreCount * 3,
      snoringEventsCount: snoreCount,
      insomniaEpisodesCount: insomniaCount,
      restlessEventsCount: restlessCount,
      apneaPauseCount: apneaCount,
      disorderRisk,
      soundscapePlayed: selectedSoundscape,
      avgNoiseDb: acousticMetrics.currentDb,
      peakNoiseDb: acousticMetrics.peakDb,
      audioEvents: currentSessionEvents,
      notes: 'Monitored overnight via Vitalis Sleep Acoustic Engine.',
    };

    setSleepHistory([newRecord, ...sleepHistory]);
    setIsSessionActive(false);
    setSessionStartTime(null);
    setElapsedSeconds(0);
    setActiveTab('disorders');
    showToast('Morning sleep session analysis saved to history!');
  };

  // Switch Soundscape live
  const handleChangeSoundscape = (id: BackgroundSoundscapeId) => {
    setSelectedSoundscape(id);
    if (isSessionActive) {
      sleepAudioEngine.playBackgroundSoundscape(id, soundscapeVolume);
    }
  };

  const handleChangeVolume = (vol: number) => {
    setSoundscapeVolume(vol);
    if (isSessionActive) {
      sleepAudioEngine.setSoundscapeVolume(vol);
    }
  };

  // Simulate instant acoustic events for user testing
  const handleSimulateEvent = (type: SleepDisorderType) => {
    sleepAudioEngine.simulateManualEvent(type);
    showToast(`Triggered test: ${type.replace(/_/g, ' ')}`);
  };

  const latestSession = sleepHistory[0] || INITIAL_SLEEP_SESSIONS[0];
  const activeDaily = routine.dailySchedules[selectedDay];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-24 right-8 z-50 bg-[#3A4D39] text-white px-5 py-3 rounded-2xl shadow-lg border border-white/20 text-xs font-serif italic flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-[#FAF8F5]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Persistent Alarm Ringing Banner */}
      {alarmRinging && (
        <div className="bg-[#A45C40] text-white p-5 rounded-[28px] border-2 border-white/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-3 bg-white/20 rounded-2xl">
              <AlarmClock className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic font-bold">Good Morning! Wake Alarm Ringing</h3>
              <p className="text-xs text-white/90">Time to rise gently and hydrate for optimal cortisol awakening.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSnoozeAlarm}
              className="px-5 py-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider transition-all"
            >
              Snooze ({routine.snoozeMinutes}m)
            </button>
            <button
              onClick={handleStopAlarm}
              className="px-6 py-2.5 rounded-full bg-white text-[#A45C40] hover:bg-[#FAF8F5] text-xs font-bold uppercase tracking-wider shadow-md transition-all"
            >
              Stop & Wake
            </button>
          </div>
        </div>
      )}

      {/* Main Sleep Executive Header Card */}
      <div className="bg-[#3A4D39] text-[#FDFCFB] rounded-[32px] p-6 sm:p-8 border border-[#2F3F2E] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#FDFCFB] bg-white/15 px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
                <Moon className="w-3 h-3 text-[#A45C40]" />
                Circadian Sleep & Nocturnal Acoustics Engine
              </span>
              {isSessionActive && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-white bg-[#A45C40] px-3 py-1 rounded-full border border-white/30 animate-pulse flex items-center gap-1.5">
                  <Radio className="w-3 h-3" />
                  Nocturnal Tracking In Progress
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif italic text-white tracking-tight">
              Sleep Restoration & Disorder Telemetry
            </h1>

            <p className="text-xs sm:text-sm text-[#E8E4DE] max-w-2xl leading-relaxed">
              Program individual daily or uniform weekly sleep/wake routines with gentle awakening alarms. Run overnight background soundscapes to monitor snoring, insomnia wakefulness, and respiratory pauses in real time.
            </p>
          </div>

          {/* Quick Metrics Capsule Strip */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Last Night Sleep Score */}
            <div className="bg-white/10 p-4 rounded-2xl border border-white/15 min-w-[130px]">
              <div className="text-[10px] uppercase tracking-wider text-[#E8E4DE] font-semibold flex items-center justify-between">
                <span>Sleep Score</span>
                <span className="font-serif italic text-xs text-white">Last Night</span>
              </div>
              <div className="text-2xl font-serif text-white mt-1">
                {latestSession.sleepScore} <span className="text-xs font-sans opacity-70">/ 100</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#E8E4DE] font-bold block mt-0.5">
                {latestSession.sleepScore >= 85 ? 'Restorative Quality' : 'Moderate Disruption'}
              </span>
            </div>

            {/* Target Bedtime & Wake */}
            <div className="bg-white/10 p-4 rounded-2xl border border-white/15 min-w-[140px]">
              <div className="text-[10px] uppercase tracking-wider text-[#E8E4DE] font-semibold">
                Tonight&apos;s Target
              </div>
              <div className="text-xl font-serif text-white mt-1">
                {routine.mode === 'uniform' ? routine.uniformBedtime : routine.dailySchedules['Mon']?.bedtime || '22:30'}
                <span className="text-xs font-sans opacity-80"> → </span>
                {routine.mode === 'uniform' ? routine.uniformWakeTime : routine.dailySchedules['Mon']?.wakeTime || '06:45'}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#E8E4DE] font-bold block mt-0.5">
                {routine.uniformWakeAlarm || routine.dailySchedules['Mon']?.wakeAlarm ? 'Alarm Set' : 'Silent'}
              </span>
            </div>

            {/* Session Action Button */}
            {!isSessionActive ? (
              <button
                onClick={handleStartSession}
                className="bg-[#A45C40] hover:bg-[#8e4f37] text-white p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center gap-1 min-w-[145px] transition-all"
              >
                <Moon className="w-5 h-5 text-[#FAF8F5]" />
                <span className="text-xs font-bold uppercase tracking-wider">Start Overnight</span>
                <span className="text-[10px] text-white/80">Acoustic Tracking</span>
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                className="bg-white hover:bg-[#FAF8F5] text-[#3A4D39] p-4 rounded-2xl shadow-sm flex flex-col justify-center items-center gap-1 min-w-[145px] transition-all"
              >
                <Square className="w-5 h-5 text-[#A45C40]" />
                <span className="text-xs font-bold uppercase tracking-wider">End Session</span>
                <span className="text-[10px] text-[#6B7280]">Generate Report</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Pill Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] rounded-full border border-[#E8E4DE] overflow-x-auto">
        <button
          onClick={() => setActiveTab('routine')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'routine'
              ? 'bg-[#3A4D39] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#3A4D39]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bedtime & Alarm Routine</span>
        </button>

        <button
          onClick={() => setActiveTab('active_session')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'active_session'
              ? 'bg-[#3A4D39] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#3A4D39]'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Active Nocturnal Tracker</span>
          {isSessionActive && (
            <span className="w-2 h-2 rounded-full bg-[#A45C40] animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('calm_tones')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'calm_tones'
              ? 'bg-[#3A4D39] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#3A4D39]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#A45C40]" />
          <span>Calm & Sleep Tones</span>
          {isPlayingCalmTone && (
            <span className="w-2 h-2 rounded-full bg-[#7C9070] animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('disorders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'disorders'
              ? 'bg-[#3A4D39] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#3A4D39]'
          }`}
        >
          <Ear className="w-4 h-4" />
          <span>Snoring & Disorder Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-[#3A4D39] text-white shadow-xs'
              : 'text-[#6B7280] hover:text-[#3A4D39]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Architecture & History</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BEDTIME & ALARM ROUTINE                            */}
      {/* ========================================================= */}
      {activeTab === 'routine' && (
        <div className="space-y-6">
          {/* Routine Mode Switcher Header */}
          <div className="bg-[#FAF8F5] p-6 rounded-[28px] border border-[#E8E4DE] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <AlarmClock className="w-5 h-5 text-[#A45C40]" />
                <h2 className="text-xl font-serif italic text-[#3A4D39]">
                  Circadian Alarm & Schedule Strategy
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-1 max-w-xl">
                Align melatonin onset and cortisol awakening response. Choose between configuring an individual schedule for each day of the week or a single uniform weekly rhythm.
              </p>
            </div>

            {/* Mode Toggle Button */}
            <div className="flex p-1 bg-white rounded-full border border-[#E8E4DE] text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => handleUpdateUniform({ mode: 'weekly_individual' })}
                className={`px-4 py-2 rounded-full transition-all ${
                  routine.mode === 'weekly_individual'
                    ? 'bg-[#3A4D39] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#3A4D39]'
                }`}
              >
                Day-by-Day Routine
              </button>
              <button
                onClick={() => handleUpdateUniform({ mode: 'uniform' })}
                className={`px-4 py-2 rounded-full transition-all ${
                  routine.mode === 'uniform'
                    ? 'bg-[#3A4D39] text-white shadow-xs'
                    : 'text-[#6B7280] hover:text-[#3A4D39]'
                }`}
              >
                Everyday Uniform
              </button>
            </div>
          </div>

          {/* Mode 1: Individual Day Schedule (Mon - Sun) */}
          {routine.mode === 'weekly_individual' ? (
            <div className="space-y-6">
              {/* Day Selector Chips */}
              <div className="grid grid-cols-7 gap-2">
                {DAYS_ORDER.map((day) => {
                  const sched = routine.dailySchedules[day];
                  const isSelected = selectedDay === day;
                  const durHrs = (sched.targetSleepMinutes / 60).toFixed(1);
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-sm'
                          : 'bg-white hover:bg-[#FAF8F5] text-[#2D2D2D] border-[#E8E4DE]'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider">{day}</div>
                      <div className={`text-base font-serif italic mt-1 ${isSelected ? 'text-white' : 'text-[#3A4D39]'}`}>
                        {sched.wakeTime}
                      </div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-[#E8E4DE]' : 'text-[#6B7280]'}`}>
                        {durHrs}h target
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Customizer Card */}
              <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
                  <div>
                    <h3 className="text-2xl font-serif italic text-[#3A4D39]">
                      {activeDaily.label} Sleep & Wake Plan
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Target duration: {Math.floor(activeDaily.targetSleepMinutes / 60)}h {activeDaily.targetSleepMinutes % 60}m 
                      ({(activeDaily.targetSleepMinutes / 90).toFixed(1)} full 90-minute sleep cycles)
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE]">
                    Individual Day Config
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bedtime Target Box */}
                  <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl text-[#3A4D39] border border-[#E8E4DE]">
                          <Moon className="w-4 h-4 text-[#3A4D39]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">Target Bedtime</span>
                          <p className="text-[11px] text-[#6B7280]">Wind-down & sleep onset</p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-[11px] text-[#6B7280]">Wind-down Alert</span>
                        <input
                          type="checkbox"
                          checked={activeDaily.bedtimeReminder}
                          onChange={(e) => handleUpdateSchedule(selectedDay, { bedtimeReminder: e.target.checked })}
                          className="w-4 h-4 rounded text-[#3A4D39] accent-[#3A4D39]"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={activeDaily.bedtime}
                        onChange={(e) => handleUpdateSchedule(selectedDay, { bedtime: e.target.value })}
                        className="px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-lg font-mono font-bold text-[#3A4D39] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                      />
                      <div className="text-xs text-[#6B7280] leading-relaxed">
                        Prepare 30 mins prior. Dim overhead lighting to promote natural melatonin secretion.
                      </div>
                    </div>
                  </div>

                  {/* Wake Time Target Box */}
                  <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl text-[#A45C40] border border-[#E8E4DE]">
                          <Sun className="w-4 h-4 text-[#A45C40]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">Wake Up Alarm</span>
                          <p className="text-[11px] text-[#6B7280]">Morning awakening chime</p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-[11px] text-[#6B7280]">Alarm Enabled</span>
                        <input
                          type="checkbox"
                          checked={activeDaily.wakeAlarm}
                          onChange={(e) => handleUpdateSchedule(selectedDay, { wakeAlarm: e.target.checked })}
                          className="w-4 h-4 rounded text-[#3A4D39] accent-[#3A4D39]"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={activeDaily.wakeTime}
                        onChange={(e) => handleUpdateSchedule(selectedDay, { wakeTime: e.target.value })}
                        className="px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-lg font-mono font-bold text-[#A45C40] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                      />
                      <div className="text-xs text-[#6B7280] leading-relaxed">
                        Wakes you gently using your chosen acoustic ringtone. Smart window activates in light sleep.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Everyday Uniform Schedule */
            <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-6">
              <div className="border-b border-[#E8E4DE] pb-4">
                <h3 className="text-2xl font-serif italic text-[#3A4D39]">
                  Everyday Standard Routine (Monday – Sunday)
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Maintains high circadian consistency. Going to sleep and waking at the exact same hour every day anchors peripheral organ clocks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">Uniform Bedtime</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B7280]">
                      <span>Reminder</span>
                      <input
                        type="checkbox"
                        checked={routine.uniformBedtimeReminder}
                        onChange={(e) => handleUpdateUniform({ uniformBedtimeReminder: e.target.checked })}
                        className="w-4 h-4 rounded text-[#3A4D39] accent-[#3A4D39]"
                      />
                    </label>
                  </div>
                  <input
                    type="time"
                    value={routine.uniformBedtime}
                    onChange={(e) => handleUpdateUniform({ uniformBedtime: e.target.value })}
                    className="px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-lg font-mono font-bold text-[#3A4D39] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                  />
                </div>

                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">Uniform Wake Time</span>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B7280]">
                      <span>Alarm Enabled</span>
                      <input
                        type="checkbox"
                        checked={routine.uniformWakeAlarm}
                        onChange={(e) => handleUpdateUniform({ uniformWakeAlarm: e.target.checked })}
                        className="w-4 h-4 rounded text-[#3A4D39] accent-[#3A4D39]"
                      />
                    </label>
                  </div>
                  <input
                    type="time"
                    value={routine.uniformWakeTime}
                    onChange={(e) => handleUpdateUniform({ uniformWakeTime: e.target.value })}
                    className="px-4 py-3 bg-white border border-[#E8E4DE] rounded-xl text-lg font-mono font-bold text-[#A45C40] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Alarm Acoustics & Tone Customization Panel */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-[#3A4D39] border border-[#E8E4DE]">
                  <Volume2 className="w-5 h-5 text-[#A45C40]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif italic text-[#3A4D39]">
                    Synthesized Gentle Awakening Tones
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Acoustically formulated chords synthesized via Web Audio API without abrupt jarring sirens.
                  </p>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] font-medium">Volume:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={routine.alarmVolume}
                  onChange={(e) => setRoutine(prev => ({ ...prev, alarmVolume: Number(e.target.value) }))}
                  className="w-24 accent-[#3A4D39]"
                />
                <span className="text-xs font-mono font-bold text-[#3A4D39]">{routine.alarmVolume}%</span>
              </div>
            </div>

            {/* Sound Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALARM_SOUND_OPTIONS.map((snd) => {
                const isSelected = routine.alarmSound === snd.id;
                const isPlayingThis = isPreviewingAlarm && previewSoundId === snd.id;

                return (
                  <div
                    key={snd.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#3A4D39] shadow-xs ring-1 ring-[#3A4D39]'
                        : 'bg-white/70 border-[#E8E4DE] hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-serif italic font-bold text-base text-[#3A4D39]">
                          {snd.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#7C9070] border border-[#E8E4DE]">
                          {snd.vibe}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {snd.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E8E4DE]">
                      <button
                        onClick={() => handleToggleAlarmPreview(snd.id)}
                        className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                          isPlayingThis
                            ? 'bg-[#A45C40] text-white animate-pulse'
                            : 'bg-[#FAF8F5] hover:bg-[#EAE7E2] text-[#3A4D39] border border-[#E8E4DE]'
                        }`}
                      >
                        {isPlayingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlayingThis ? 'Stop Tone' : 'Test Tone'}</span>
                      </button>

                      <button
                        onClick={() => handleSelectAlarmSound(snd.id)}
                        className={`py-1.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-[#3A4D39] text-white'
                            : 'bg-white text-[#6B7280] hover:text-[#3A4D39] border border-[#E8E4DE]'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Phone Music & Audio Files for Awakening Tones */}
            <div className="mt-8 pt-6 border-t border-[#E8E4DE] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl text-[#3A4D39] border border-[#E8E4DE]">
                    <Smartphone className="w-5 h-5 text-[#A45C40]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-serif italic text-[#3A4D39]">
                        Phone Awakening Tones & Local Music Library
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE]">
                        {customAudioTracks.length} Available
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Add local audio files (.mp3, .m4a, .wav, .aac, .ogg, .flac) from your phone storage to awaken to your favorite songs.
                    </p>
                  </div>
                </div>

                {/* Upload Button */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhoneFileUpload}
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                    multiple
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#3A4D39] hover:bg-[#2e3e2d] text-white rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#FAF8F5]" />
                    <span>Add Music from Phone</span>
                  </button>
                </div>
              </div>

              {/* Custom Track Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {customAudioTracks.map((track) => {
                  const isSelected = routine.alarmSound === track.id;
                  const isPreviewing = previewingTrackId === track.id || (isPreviewingAlarm && previewSoundId === track.id);
                  const isEditing = editingTrackId === track.id;

                  return (
                    <div
                      key={track.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white border-[#3A4D39] shadow-xs ring-1 ring-[#3A4D39]'
                          : 'bg-white/70 border-[#E8E4DE] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-2 rounded-xl shrink-0 ${
                              isPreviewing ? 'bg-[#A45C40] text-white' : 'bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE]'
                            }`}>
                              <Music className={`w-4 h-4 ${isPreviewing ? 'animate-bounce' : ''}`} />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editingTrackName}
                                    onChange={(e) => setEditingTrackName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRenameTrack(track.id)}
                                    className="px-2 py-0.5 text-xs font-serif font-bold text-[#3A4D39] bg-white border border-[#3A4D39] rounded-md outline-none w-full"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveRenameTrack(track.id)}
                                    className="p-1 text-[#3A4D39] hover:bg-[#FAF8F5] rounded"
                                  >
                                    <Check className="w-3.5 h-3.5 text-[#3A4D39]" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 group">
                                  <span className="font-serif italic font-bold text-sm text-[#3A4D39] truncate">
                                    {track.name}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingTrackId(track.id);
                                      setEditingTrackName(track.name);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-[#7C9070] hover:text-[#3A4D39] transition-opacity"
                                    title="Rename track"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              
                              <p className="text-[11px] text-[#6B7280] truncate font-mono">
                                {track.fileName}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 border ${
                            track.isPreloaded
                              ? 'bg-[#FAF8F5] text-[#7C9070] border-[#E8E4DE]'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {track.isPreloaded ? 'Phone Sample' : 'Phone Audio'}
                          </span>
                        </div>

                        {/* File Details */}
                        <div className="flex items-center gap-3 text-[10px] text-[#6B7280] py-1">
                          <span>Size: {(track.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                          <span>•</span>
                          <span>Format: {track.mimeType.replace('audio/', '').toUpperCase()}</span>
                          {isSelected && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-[#3A4D39]">Active Alarm</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Controls Footer */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E8E4DE]">
                        <button
                          onClick={() => handleToggleTrackPreview(track)}
                          className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                            isPreviewing
                              ? 'bg-[#A45C40] text-white animate-pulse'
                              : 'bg-[#FAF8F5] hover:bg-[#EAE7E2] text-[#3A4D39] border border-[#E8E4DE]'
                          }`}
                        >
                          {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPreviewing ? 'Pause' : 'Preview'}</span>
                        </button>

                        <button
                          onClick={() => handleSelectAlarmSound(track.id)}
                          className={`py-1.5 px-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                            isSelected
                              ? 'bg-[#3A4D39] text-white'
                              : 'bg-white text-[#6B7280] hover:text-[#3A4D39] border border-[#E8E4DE]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          <span>{isSelected ? 'Active' : 'Set Alarm'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCustomTrack(track.id)}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                          title="Remove track"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Dropzone Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-dashed border-[#E8E4DE] hover:border-[#3A4D39] rounded-2xl bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] cursor-pointer text-center transition-all flex flex-col items-center justify-center gap-1.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                  <FileAudio className="w-4 h-4 text-[#A45C40]" />
                  <span>Tap to Select Music Files from Phone</span>
                </div>
                <p className="text-xs text-[#6B7280]">
                  Tap to open your phone&apos;s audio picker, file manager, or music downloads
                </p>
              </div>
            </div>

            {/* Bedtime Soft Music & Sweet Sleep Routine Section */}
            <div className="mt-8 pt-6 border-t border-[#E8E4DE] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl text-[#3A4D39] border border-[#E8E4DE]">
                    <Sparkles className="w-5 h-5 text-[#A45C40]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-serif italic text-[#3A4D39]">
                        Bedtime Soft Music &amp; Calming Tones
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE]">
                        Sweet Sleep Induction
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Automatic or one-touch soothing music and harmonic tones to calm the body and drift into restorative sleep at bedtime.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleStartBedtimeSweetSleep()}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all ${
                      isPlayingCalmTone
                        ? 'bg-[#A45C40] hover:bg-[#8e4f37] text-white'
                        : 'bg-[#3A4D39] hover:bg-[#2e3e2d] text-white'
                    }`}
                  >
                    {isPlayingCalmTone ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#FAF8F5]" />}
                    <span>{isPlayingCalmTone ? 'Pause Bedtime Music' : 'Start Sweet Sleep Music'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('calm_tones')}
                    className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE] rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
                  >
                    <Music className="w-3.5 h-3.5 text-[#A45C40]" />
                    <span>Studio Library</span>
                  </button>
                </div>
              </div>

              {/* Bedtime Routine Controls Card */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bedtime Auto-Play Toggle */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E4DE] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#3A4D39] block">Auto-Play at Bedtime</span>
                      <span className="text-[11px] text-[#6B7280]">Starts when bedtime target arrives</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={routine.autoPlayBedtimeMusic}
                        onChange={(e) => setRoutine(prev => ({ ...prev, autoPlayBedtimeMusic: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3A4D39]"></div>
                    </label>
                  </div>

                  {/* Bedtime Music Volume */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E4DE] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#3A4D39] block">Bedtime Volume</span>
                      <span className="text-[11px] text-[#6B7280]">Subtle background level</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={routine.bedtimeMusicVolume || 40}
                        onChange={(e) => {
                          const vol = Number(e.target.value);
                          setRoutine(prev => ({ ...prev, bedtimeMusicVolume: vol }));
                          if (isPlayingCalmTone) {
                            handleChangeCalmVolume(vol);
                          }
                        }}
                        className="w-20 accent-[#3A4D39]"
                      />
                      <span className="text-xs font-mono font-bold text-[#3A4D39] min-w-[28px]">
                        {routine.bedtimeMusicVolume || 40}%
                      </span>
                    </div>
                  </div>

                  {/* Bedtime Sleep Fade Timer */}
                  <div className="p-3.5 bg-white rounded-xl border border-[#E8E4DE] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#3A4D39] block">Fade-Out Timer</span>
                      <span className="text-[11px] text-[#6B7280]">Gentle sleep transition</span>
                    </div>
                    <div className="flex gap-1">
                      {[15, 30, 45, 0].map(mins => (
                        <button
                          key={mins}
                          onClick={() => {
                            setRoutine(prev => ({ ...prev, bedtimeMusicTimerMinutes: mins }));
                            if (isPlayingCalmTone) {
                              handleSetSleepTimer(mins);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            (routine.bedtimeMusicTimerMinutes ?? 30) === mins
                              ? 'bg-[#3A4D39] text-white'
                              : 'bg-[#FAF8F5] text-[#6B7280] hover:bg-gray-100'
                          }`}
                        >
                          {mins === 0 ? 'Loop' : `${mins}m`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Bedtime Genre / Tone Cards */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                      Choose Bedtime Calming Tone or Music Genre:
                    </span>
                    <span className="text-[11px] text-[#6B7280]">
                      Active Default: <span className="font-bold text-[#3A4D39]">{BACKGROUND_SOUNDSCAPES.find(s => s.id === routine.bedtimeCalmingTone)?.name || 'Starlight Piano Lullaby'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'starlight_piano_lullaby' as BackgroundSoundscapeId, icon: '🎹', title: 'Starlight Piano', genre: 'Lullaby Piano', desc: 'Warm Cmaj9/Am9 acoustic chords' },
                      { id: 'moonlit_music_box' as BackgroundSoundscapeId, icon: '🔔', title: 'Moonlit Music Box', genre: 'Lullaby Piano', desc: 'Nostalgic crystalline chime melody' },
                      { id: 'celestial_dream_pad' as BackgroundSoundscapeId, icon: '🌌', title: 'Celestial Dream Pad', genre: 'Warm Ambient', desc: 'Analog 5th swell like floating clouds' },
                      { id: 'stellar_cosmic_slumber' as BackgroundSoundscapeId, icon: '🪐', title: 'Cosmic Slumber', genre: 'Warm Ambient', desc: 'Deep sub-drone with star glisten' },
                      { id: 'zen_bamboo_koto' as BackgroundSoundscapeId, icon: '🎋', title: 'Bamboo Koto', genre: 'Organic Zen', desc: 'Japanese pentatonic night breeze' },
                      { id: 'twilight_acoustic_guitar' as BackgroundSoundscapeId, icon: '🎸', title: 'Twilight Guitar', genre: 'Organic Zen', desc: 'Nylon acoustic fingerpicked arpeggio' },
                      { id: 'binaural_theta_6hz' as BackgroundSoundscapeId, icon: '🧠', title: 'Theta Calm 6 Hz', genre: 'Brainwave', desc: 'Eases racing cognitive thoughts' },
                      { id: 'solfeggio_528hz' as BackgroundSoundscapeId, icon: '✨', title: '528 Hz Harmony', genre: 'Solfeggio', desc: 'Somatic decompression & recovery' },
                    ].map(item => {
                      const isBedtimeDefault = (routine.bedtimeCalmingTone || 'starlight_piano_lullaby') === item.id;
                      const isCurrentlyPlaying = isPlayingCalmTone && selectedCalmTone === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                            isBedtimeDefault
                              ? 'bg-white border-[#3A4D39] ring-1 ring-[#3A4D39] shadow-xs'
                              : 'bg-white/80 border-[#E8E4DE] hover:bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-sm">{item.icon}</span>
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#7C9070]">
                                {item.genre}
                              </span>
                            </div>
                            <h5 className="font-serif italic font-bold text-sm text-[#3A4D39]">
                              {item.title}
                            </h5>
                            <p className="text-[11px] text-[#6B7280] leading-snug mt-0.5">
                              {item.desc}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-[#E8E4DE]">
                            <button
                              onClick={() => handleToggleCalmTone(item.id)}
                              className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
                                isCurrentlyPlaying
                                  ? 'bg-[#A45C40] text-white animate-pulse'
                                  : 'bg-[#FAF8F5] hover:bg-[#EAE7E2] text-[#3A4D39]'
                              }`}
                            >
                              {isCurrentlyPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                              <span>{isCurrentlyPlaying ? 'Pause' : 'Test'}</span>
                            </button>

                            <button
                              onClick={() => handleSetBedtimeCalmingTone(item.id)}
                              className={`py-1 px-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                isBedtimeDefault
                                  ? 'bg-[#3A4D39] text-white'
                                  : 'bg-white text-[#6B7280] hover:text-[#3A4D39] border border-[#E8E4DE]'
                              }`}
                            >
                              {isBedtimeDefault ? <Check className="w-3 h-3" /> : null}
                              <span>{isBedtimeDefault ? 'Default' : 'Set'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Wake Window & Snooze Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE] space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                  Smart Awakening Window
                </span>
                <p className="text-xs text-[#6B7280]">
                  Gently rings during the nearest light sleep phase to prevent groggy sleep inertia.
                </p>
                <div className="flex gap-2 pt-2">
                  {[0, 15, 20, 30].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setRoutine(prev => ({ ...prev, smartWakeWindowMinutes: mins }))}
                      className={`py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                        routine.smartWakeWindowMinutes === mins
                          ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                          : 'bg-[#FAF8F5] text-[#6B7280] border-[#E8E4DE]'
                      }`}
                    >
                      {mins === 0 ? 'Exact' : `${mins}m Window`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8E4DE] space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                  Snooze Interval
                </span>
                <p className="text-xs text-[#6B7280]">
                  Duration before awakening tone gently resurfaces if snooze is tapped.
                </p>
                <div className="flex gap-2 pt-2">
                  {[5, 9, 15].map(mins => (
                    <button
                      key={mins}
                      onClick={() => setRoutine(prev => ({ ...prev, snoozeMinutes: mins }))}
                      className={`py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                        routine.snoozeMinutes === mins
                          ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                          : 'bg-[#FAF8F5] text-[#6B7280] border-[#E8E4DE]'
                      }`}
                    >
                      {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ACTIVE NOCTURNAL TRACKER & BACKGROUND SOUNDSCAPES   */}
      {/* ========================================================= */}
      {activeTab === 'active_session' && (
        <div className="space-y-6">
          {/* Active Bedside Status Panel */}
          <div className={`p-6 sm:p-8 rounded-[32px] border transition-all ${
            isSessionActive 
              ? 'bg-[#2A3929] text-white border-[#3A4D39] shadow-lg' 
              : 'bg-[#FAF8F5] text-[#2D2D2D] border-[#E8E4DE]'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${isSessionActive ? 'bg-white/10 text-[#FAF8F5]' : 'bg-white text-[#3A4D39] border border-[#E8E4DE]'}`}>
                    <Radio className={`w-5 h-5 ${isSessionActive ? 'text-[#A45C40] animate-pulse' : 'text-[#7C9070]'}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      Bedside Acoustic Monitor
                    </span>
                    <h2 className={`text-2xl font-serif italic ${isSessionActive ? 'text-white' : 'text-[#3A4D39]'}`}>
                      {isSessionActive ? 'Overnight Tracking Active' : 'Standby Bedside Monitor'}
                    </h2>
                  </div>
                </div>

                <p className={`text-xs leading-relaxed max-w-xl ${isSessionActive ? 'text-[#E8E4DE]' : 'text-[#6B7280]'}`}>
                  {isSessionActive
                    ? 'Background soundscapes and nocturnal audio classification are actively running. The engine monitors for snoring frequencies (80–250 Hz), insomnia tossing, and noise spikes.'
                    : 'Place your phone or laptop on your bedside table. When you hit Start Overnight, background soundscapes can play to induce deep sleep while audio algorithms track any snoring or insomnia.'}
                </p>
              </div>

              {/* Timer / Trigger Controls */}
              <div className="flex flex-col items-center sm:items-end gap-3 w-full md:w-auto">
                {isSessionActive && (
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8E4DE]">Elapsed Time</span>
                    <div className="text-3xl font-mono font-bold text-white tracking-wider">
                      {formatElapsedTime(elapsedSeconds)}
                    </div>
                  </div>
                )}

                {!isSessionActive ? (
                  <button
                    onClick={handleStartSession}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Play className="w-4 h-4 text-[#A45C40]" />
                    <span>Start Overnight Sleep Session</span>
                  </button>
                ) : (
                  <button
                    onClick={handleEndSession}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-[#FAF8F5] text-[#3A4D39] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <Square className="w-4 h-4 text-[#A45C40]" />
                    <span>Stop Session & Log Sleep</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Acoustic Waveform & Real-Time Decibel Meter */}
            <div className={`mt-6 pt-6 border-t ${isSessionActive ? 'border-white/10' : 'border-[#E8E4DE]'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Real-time Decibel Card */}
                <div className={`p-4 rounded-2xl ${isSessionActive ? 'bg-white/5 border border-white/10' : 'bg-white border border-[#E8E4DE]'}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase tracking-wider opacity-75">Acoustic Noise Level</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      acousticMetrics.currentDb > 55 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {acousticMetrics.currentDb < 36 ? 'Whisper Quiet' : acousticMetrics.currentDb < 50 ? 'Moderate' : 'Noisy / Snoring'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-bold">
                      {acousticMetrics.currentDb}
                    </span>
                    <span className="text-xs opacity-75">dB SPL</span>
                    <span className="text-[10px] opacity-60 ml-auto font-mono">Peak: {acousticMetrics.peakDb} dB</span>
                  </div>
                  {/* Visual Level Bar */}
                  <div className="w-full h-2 bg-black/20 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-150 ${
                        acousticMetrics.currentDb > 55 ? 'bg-[#A45C40]' : 'bg-[#7C9070]'
                      }`}
                      style={{ width: `${Math.min(100, (acousticMetrics.currentDb / 80) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Frequency Band Breakdown */}
                <div className={`p-4 rounded-2xl ${isSessionActive ? 'bg-white/5 border border-white/10' : 'bg-white border border-[#E8E4DE]'}`}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-75 block mb-2">
                    Frequency Classification
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="opacity-80">Snore Band (60–350 Hz)</span>
                      <span className="font-mono">{acousticMetrics.frequencyBands.lowHz}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="opacity-80">Movement / Rustle (400–1.5k Hz)</span>
                      <span className="font-mono">{acousticMetrics.frequencyBands.midHz}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="opacity-80">Ambient Spikes (&gt;2k Hz)</span>
                      <span className="font-mono">{acousticMetrics.frequencyBands.highHz}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated / Test Diagnostic Triggers */}
                <div className={`p-4 rounded-2xl ${isSessionActive ? 'bg-white/5 border border-white/10' : 'bg-white border border-[#E8E4DE]'}`}>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-75 block mb-2">
                    Instant Disorder Simulation Tests
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSimulateEvent('snoring')}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                        isSessionActive 
                          ? 'bg-white/15 hover:bg-white/25 text-white' 
                          : 'bg-[#FAF8F5] hover:bg-[#EAE7E2] text-[#3A4D39] border border-[#E8E4DE]'
                      }`}
                    >
                      + Snore Event
                    </button>
                    <button
                      onClick={() => handleSimulateEvent('insomnia_wakefulness')}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                        isSessionActive 
                          ? 'bg-white/15 hover:bg-white/25 text-white' 
                          : 'bg-[#FAF8F5] hover:bg-[#EAE7E2] text-[#3A4D39] border border-[#E8E4DE]'
                      }`}
                    >
                      + Insomnia Wake
                    </button>
                    <button
                      onClick={() => handleSimulateEvent('respiratory_apnea_pause')}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                        isSessionActive 
                          ? 'bg-white/15 hover:bg-white/25 text-white' 
                          : 'bg-[#FAF8F5] hover:bg-[#EAE7E2] text-[#3A4D39] border border-[#E8E4DE]'
                      }`}
                    >
                      + Apnea Pause
                    </button>
                    <button
                      onClick={triggerWakeAlarm}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                        isSessionActive 
                          ? 'bg-[#A45C40] text-white hover:bg-[#8e4f37]' 
                          : 'bg-[#A45C40] text-white hover:bg-[#8e4f37]'
                      }`}
                    >
                      Ring Alarm Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Sleep Soundscapes Player */}
          <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E4DE] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Waves className="w-5 h-5 text-[#A45C40]" />
                  <h3 className="text-xl font-serif italic text-[#3A4D39]">
                    Nocturnal Background Soundscapes
                  </h3>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Play continuous synthetic noise and nature textures in the background while sleeping to induce alpha and delta brainwaves.
                </p>
              </div>

              {/* Soundscape Volume */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280] font-medium">Soundscape Volume:</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={soundscapeVolume}
                  onChange={(e) => handleChangeVolume(Number(e.target.value))}
                  className="w-28 accent-[#3A4D39]"
                />
                <span className="text-xs font-mono font-bold text-[#3A4D39]">{soundscapeVolume}%</span>
              </div>
            </div>

            {/* Soundscape Choices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BACKGROUND_SOUNDSCAPES.map((sc) => {
                const isSelected = selectedSoundscape === sc.id;
                return (
                  <div
                    key={sc.id}
                    onClick={() => handleChangeSoundscape(sc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FAF8F5] border-[#3A4D39] ring-1 ring-[#3A4D39] shadow-xs'
                        : 'bg-white border-[#E8E4DE] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif italic font-bold text-base text-[#3A4D39]">
                          {sc.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-[#7C9070] border border-[#E8E4DE]">
                          {sc.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E8E4DE] flex items-center justify-between text-[11px]">
                      <span className="text-[#7C9070] font-mono text-[10px]">{sc.frequencyProfile}</span>
                      <span className={`font-bold uppercase tracking-wider text-[10px] ${isSelected ? 'text-[#A45C40]' : 'text-[#6B7280]'}`}>
                        {isSelected ? 'Selected' : 'Tap to Choose'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Session Event Timeline */}
          {currentSessionEvents.length > 0 && (
            <div className="bg-[#FAF8F5] p-6 rounded-[28px] border border-[#E8E4DE] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif italic text-[#3A4D39]">
                  Live Overnight Events Logged ({currentSessionEvents.length})
                </h3>
                <span className="text-xs text-[#7C9070] font-medium">Session in progress</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {currentSessionEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 bg-white rounded-2xl border border-[#E8E4DE] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl text-xs font-bold ${
                        evt.type === 'snoring' ? 'bg-[#A45C40]/15 text-[#A45C40]' :
                        evt.type === 'insomnia_wakefulness' ? 'bg-amber-100 text-amber-800' :
                        evt.type === 'respiratory_apnea_pause' ? 'bg-rose-100 text-rose-800' :
                        'bg-[#3A4D39]/10 text-[#3A4D39]'
                      }`}>
                        {evt.decibels} dB
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#2D2D2D]">{evt.title}</div>
                        <p className="text-[11px] text-[#6B7280]">{evt.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#7C9070] shrink-0">{evt.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: BODY-CALMING & SLEEP-INDUCING FREQUENCIES STUDIO     */}
      {/* ========================================================= */}
      {activeTab === 'calm_tones' && (
        <div className="space-y-6">
          {/* Main Somatic Coherence & Acoustic Entrainment Player */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-[#2A3929] text-white border border-[#3A4D39] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C9070]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#A45C40]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              {/* Left Column: Active Tone Info */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/10 text-white border border-white/15">
                    <Sparkles className="w-5 h-5 text-[#A45C40]" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#E8E4DE]">
                      Neuro-Acoustic Biofeedback & Relaxation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-serif italic text-white">
                      Body-Calming &amp; Sleep Induction
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-[#E8E4DE] leading-relaxed">
                  Scientifically tuned frequencies modulate electrical brainwave oscillations (Theta 4–7 Hz, Delta 0.5–4 Hz) and stimulate parasympathetic vagal tone. These tones actively lower nocturnal heart rate, release somatic muscle tension, and facilitate deep sleep transition.
                </p>

                {/* Currently Selected Tone Card */}
                {(() => {
                  const currentTone = BACKGROUND_SOUNDSCAPES.find(s => s.id === selectedCalmTone);
                  if (!currentTone) return null;

                  return (
                    <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex items-center justify-between gap-4 mt-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-serif italic font-bold text-base text-white truncate">
                            {currentTone.name}
                          </span>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-[#E8E4DE]">
                            {currentTone.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#E8E4DE]/80 truncate">
                          {currentTone.frequencyProfile} • {currentTone.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isPlayingCalmTone && (
                          <div className="flex items-end gap-1 h-5 px-2">
                            <span className="w-1 bg-[#7C9070] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-3" />
                            <span className="w-1 bg-[#A45C40] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-5" />
                            <span className="w-1 bg-white rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2" />
                          </div>
                        )}
                        <button
                          onClick={() => handleToggleCalmTone(currentTone.id)}
                          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all ${
                            isPlayingCalmTone
                              ? 'bg-[#A45C40] hover:bg-[#8e4f37] text-white'
                              : 'bg-white hover:bg-[#FAF8F5] text-[#3A4D39]'
                          }`}
                        >
                          {isPlayingCalmTone ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#A45C40]" />}
                          <span>{isPlayingCalmTone ? 'Pause Tone' : 'Play Tone'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Right Column: Breathing Pacer & Coherence Circle */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10 w-full lg:w-72 shrink-0 text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#E8E4DE] mb-3">
                  0.1 Hz Somatic Breathing Pacer
                </span>

                {/* Animated Breathing Circle */}
                <div className="relative flex items-center justify-center w-36 h-36">
                  <div className={`absolute inset-0 rounded-full border-2 border-dashed border-[#7C9070]/50 ${isPlayingCalmTone ? 'animate-spin' : ''}`} style={{ animationDuration: '24s' }} />
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-[#7C9070]/30 to-[#A45C40]/30 border border-white/20 flex flex-col items-center justify-center transition-all duration-3000 ${
                    isPlayingCalmTone ? 'scale-110 shadow-lg shadow-[#7C9070]/20' : 'scale-95'
                  }`}>
                    <Heart className="w-5 h-5 text-white/90 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                      {isPlayingCalmTone ? 'Inhale 4s • Exhale 6s' : 'Coherence'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-[#E8E4DE]/80 mt-3 leading-relaxed">
                  Slow rhythmic exhalations signal the brainstem to slow cardiac pacing and quiet mental chatter.
                </p>
              </div>
            </div>

            {/* Bottom Controls Bar: Volume & Sleep Timer */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Volume Slider */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Volume2 className="w-4 h-4 text-[#E8E4DE]" />
                <span className="text-xs text-[#E8E4DE] font-medium">Volume:</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={calmToneVolume}
                  onChange={(e) => handleChangeCalmVolume(Number(e.target.value))}
                  className="w-32 accent-[#A45C40]"
                />
                <span className="text-xs font-mono font-bold text-white min-w-[36px]">{calmToneVolume}%</span>
              </div>

              {/* Sleep Fade-Out Timer */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#E8E4DE] mr-2">
                  <Timer className="w-4 h-4 text-[#A45C40]" />
                  <span>Sleep Fade Timer:</span>
                </div>

                {[15, 30, 45, 60, 0].map((mins) => {
                  const isActive = sleepTimerMinutes === mins;
                  return (
                    <button
                      key={mins}
                      onClick={() => handleSetSleepTimer(mins)}
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-white text-[#3A4D39]'
                          : 'bg-white/10 hover:bg-white/20 text-[#E8E4DE]'
                      }`}
                    >
                      {mins === 0 ? 'Continuous' : `${mins}m`}
                    </button>
                  );
                })}

                {/* Remaining Timer Badge */}
                {timerRemainingSeconds !== null && (
                  <div className="ml-2 px-3 py-1 rounded-full bg-[#A45C40] text-white text-xs font-mono font-bold">
                    Fading in {Math.floor(timerRemainingSeconds / 60)}:{String(timerRemainingSeconds % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calming Frequencies Library */}
          <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E4DE] pb-4">
              <div>
                <h3 className="text-xl font-serif italic text-[#3A4D39]">
                  Body-Calming &amp; Sleep Frequencies Library
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Select any acoustic formulation designed for somatic decompression, vagal stimulation, or sleep onset.
                </p>
              </div>

              {/* Category & Genre Filter Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All Genres & Tones' },
                  { id: 'Lullaby Piano & Neo-Classical', label: '🎹 Lullaby Piano' },
                  { id: 'Warm Ambient & Dream Pad', label: '🌌 Ambient Pads' },
                  { id: 'Organic Zen & Meditative Strings', label: '🎋 Zen & Acoustic' },
                  { id: 'Brainwave Entrainment', label: '🧠 Theta & Delta' },
                  { id: 'Solfeggio Frequencies', label: '✨ Solfeggio' },
                  { id: 'Vagus Nerve & Autonomic Calm', label: '🫀 Vagus Nerve' },
                  { id: 'Nature Sanctuary & Masking', label: '🌧️ Nature & Noise' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCalmCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all ${
                      calmCategoryFilter === cat.id
                        ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                        : 'bg-[#FAF8F5] text-[#6B7280] border-[#E8E4DE] hover:bg-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Tone Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BACKGROUND_SOUNDSCAPES.filter(sc => {
                if (sc.id === 'off') return false;
                if (calmCategoryFilter === 'all') return true;
                if (calmCategoryFilter === 'Nature Sanctuary & Masking') {
                  return sc.genre === 'Nature Sanctuary & Masking' || sc.category === 'Synthetic Noise' || sc.category === 'Nature Soundscape';
                }
                return sc.genre === calmCategoryFilter || sc.category === calmCategoryFilter;
              }).map((sc) => {
                const isSelected = selectedCalmTone === sc.id;
                const isPlayingThis = isPlayingCalmTone && selectedCalmTone === sc.id;
                const isBedtimeDefault = (routine.bedtimeCalmingTone || 'starlight_piano_lullaby') === sc.id;

                return (
                  <div
                    key={sc.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FAF8F5] border-[#3A4D39] ring-1 ring-[#3A4D39] shadow-xs'
                        : 'bg-white border-[#E8E4DE] hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#7C9070] border border-[#E8E4DE]">
                              {sc.genre}
                            </span>
                            {isBedtimeDefault && (
                              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#3A4D39] text-white flex items-center gap-1">
                                <Moon className="w-2.5 h-2.5" />
                                Bedtime Default
                              </span>
                            )}
                          </div>
                          <span className="font-serif italic font-bold text-base text-[#3A4D39] block">
                            {sc.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#7C9070]">
                            {sc.frequencyProfile}
                          </span>
                        </div>

                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white text-[#3A4D39] border border-[#E8E4DE] shrink-0">
                          {sc.category}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B7280] leading-relaxed">
                        {sc.description}
                      </p>

                      {/* Scientific Benefits Bullet */}
                      {sc.benefits && (
                        <div className="p-2.5 rounded-xl bg-white border border-[#E8E4DE] text-[11px] text-[#3A4D39] flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#A45C40] shrink-0 mt-0.5" />
                          <span className="leading-snug">{sc.benefits}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E8E4DE]">
                      <button
                        onClick={() => handleToggleCalmTone(sc.id)}
                        className={`flex-1 py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all ${
                          isPlayingThis
                            ? 'bg-[#A45C40] hover:bg-[#8e4f37] text-white animate-pulse'
                            : 'bg-[#3A4D39] hover:bg-[#2e3e2d] text-white'
                        }`}
                      >
                        {isPlayingThis ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#FAF8F5]" />}
                        <span>{isPlayingThis ? 'Pause Tone' : 'Play Tone'}</span>
                      </button>

                      <button
                        onClick={() => handleSetBedtimeCalmingTone(sc.id)}
                        title={isBedtimeDefault ? 'Active Bedtime Routine Default' : 'Set as Bedtime Routine Default'}
                        className={`py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 border ${
                          isBedtimeDefault
                            ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                            : 'bg-white text-[#6B7280] hover:text-[#3A4D39] border-[#E8E4DE]'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>{isBedtimeDefault ? 'Default' : 'Set Default'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Link Card to Awakening Alarm Library */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white rounded-xl text-[#3A4D39] border border-[#E8E4DE]">
                  <Smartphone className="w-5 h-5 text-[#A45C40]" />
                </div>
                <div>
                  <h4 className="text-sm font-serif italic font-bold text-[#3A4D39]">
                    Looking to set Morning Awakening Tones?
                  </h4>
                  <p className="text-xs text-[#6B7280]">
                    You can upload local music files from your phone or choose peaceful acoustic tones for your wake-up alarm.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('routine')}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
              >
                <span>Manage Phone Awakening Tones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SNORING & SLEEP DISORDER AUDIT                     */}
      {/* ========================================================= */}
      {activeTab === 'disorders' && (
        <div className="space-y-6">
          {/* Disorder Classification Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Snoring Index Card */}
            <div className="bg-white p-5 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7C9070] font-bold uppercase tracking-wider">
                <span>Snore Index</span>
                <Ear className="w-4 h-4 text-[#A45C40]" />
              </div>
              <div className="text-3xl font-serif italic text-[#3A4D39]">
                {latestSession.snoringMinutes} <span className="text-xs font-sans not-italic text-[#6B7280]">mins total</span>
              </div>
              <div className="text-xs text-[#6B7280]">
                {latestSession.snoringEventsCount} distinct episodes. Low pharyngeal airway resistance.
              </div>
              <div className="pt-2 border-t border-[#E8E4DE] flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">Disruption Status:</span>
                <span className="font-bold text-emerald-700">
                  {latestSession.snoringMinutes < 10 ? 'Mild / Normal' : 'Elevated'}
                </span>
              </div>
            </div>

            {/* Insomnia & Sleep Latency Card */}
            <div className="bg-white p-5 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7C9070] font-bold uppercase tracking-wider">
                <span>Sleep Latency</span>
                <Clock className="w-4 h-4 text-[#3A4D39]" />
              </div>
              <div className="text-3xl font-serif italic text-[#3A4D39]">
                {latestSession.timeToFallAsleepMinutes} <span className="text-xs font-sans not-italic text-[#6B7280]">mins onset</span>
              </div>
              <div className="text-xs text-[#6B7280]">
                {latestSession.insomniaEpisodesCount === 0 ? 'No midnight insomnia wakefulness detected.' : `${latestSession.insomniaEpisodesCount} awakening episode.`}
              </div>
              <div className="pt-2 border-t border-[#E8E4DE] flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">Insomnia Risk:</span>
                <span className="font-bold text-emerald-700">
                  {latestSession.timeToFallAsleepMinutes < 20 ? 'Low / Optimal' : 'Mild Latency'}
                </span>
              </div>
            </div>

            {/* Respiratory Apnea Screening */}
            <div className="bg-white p-5 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7C9070] font-bold uppercase tracking-wider">
                <span>Airway Pauses</span>
                <Activity className="w-4 h-4 text-[#A45C40]" />
              </div>
              <div className="text-3xl font-serif italic text-[#3A4D39]">
                {latestSession.apneaPauseCount} <span className="text-xs font-sans not-italic text-[#6B7280]">pauses (&gt;10s)</span>
              </div>
              <div className="text-xs text-[#6B7280]">
                Acoustic monitoring of breathing rhythm and cessation gasp index.
              </div>
              <div className="pt-2 border-t border-[#E8E4DE] flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">OSA Screening:</span>
                <span className="font-bold text-emerald-700">
                  {latestSession.apneaPauseCount === 0 ? 'Negative / Clear' : 'Follow up'}
                </span>
              </div>
            </div>

            {/* Bedroom Noise Pollution */}
            <div className="bg-white p-5 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#7C9070] font-bold uppercase tracking-wider">
                <span>Room Noise</span>
                <Waves className="w-4 h-4 text-[#7C9070]" />
              </div>
              <div className="text-3xl font-serif italic text-[#3A4D39]">
                {latestSession.avgNoiseDb} <span className="text-xs font-sans not-italic text-[#6B7280]">dB avg</span>
              </div>
              <div className="text-xs text-[#6B7280]">
                Peak decibels: {latestSession.peakNoiseDb} dB. Acoustic sanctuary quality maintained.
              </div>
              <div className="pt-2 border-t border-[#E8E4DE] flex items-center justify-between text-[11px]">
                <span className="text-[#6B7280]">Sleep Quietude:</span>
                <span className="font-bold text-emerald-700">Quiet Bedroom</span>
              </div>
            </div>
          </div>

          {/* Deep Clinical Disorder Analysis */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] space-y-6">
            <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
              <div>
                <h3 className="text-xl font-serif italic text-[#3A4D39]">
                  Comprehensive Nocturnal Acoustic Log
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Events recorded during last night&apos;s session ({latestSession.date}).
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white border border-[#E8E4DE] rounded-full text-[#3A4D39]">
                {latestSession.audioEvents.length} Acoustic Events
              </span>
            </div>

            <div className="space-y-3">
              {latestSession.audioEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 bg-white rounded-2xl border border-[#E8E4DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] text-center min-w-[55px]">
                      <div className="text-xs font-mono font-bold text-[#A45C40]">{evt.decibels}</div>
                      <div className="text-[9px] text-[#6B7280] uppercase tracking-wider">dB SPL</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#2D2D2D]">{evt.title}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#7C9070] border border-[#E8E4DE]">
                          {evt.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{evt.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-[#3A4D39]">{evt.timestamp}</div>
                    <span className="text-[10px] text-[#6B7280]">Duration: {evt.durationSeconds}s</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Longevity Guidance on Sleep Disorders */}
            <div className="p-5 bg-white rounded-2xl border border-[#E8E4DE] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                <ShieldCheck className="w-4 h-4 text-[#7C9070]" />
                Preventative Medicine & Sleep Disorder Prevention
              </div>
              <ul className="text-xs text-[#6B7280] space-y-1.5 list-disc pl-5 leading-relaxed">
                <li><strong>Positional Therapy:</strong> Nasal and palatal snoring occurs predominantly in the supine (back-sleeping) posture. Side sleeping reduces airway collapse by up to 60%.</li>
                <li><strong>Circadian Insomnia Management:</strong> Consistent wake times, morning light exposure within 45 minutes of rising, and cessation of caffeine after 1:00 PM significantly accelerate sleep onset latency.</li>
                <li><strong>Acoustic Shielding:</strong> Continuous Brown or Pink noise dampens sudden decibel variations that could trigger micro-arousals and fragmented REM cycles.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: ARCHITECTURE & SLEEP HISTORY                       */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Hypnogram & Stage Architecture Card */}
          <div className="bg-white p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8E4DE] pb-4">
              <div>
                <h3 className="text-2xl font-serif italic text-[#3A4D39]">
                  Last Night&apos;s Hypnogram & Sleep Architecture
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Total sleep: {Math.floor(latestSession.durationMinutes / 60)}h {latestSession.durationMinutes % 60}m 
                  • Sleep Efficiency: {latestSession.efficiencyPercent}%
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#3A4D39] text-white">
                Score: {latestSession.sleepScore} / 100
              </span>
            </div>

            {/* Stage Proportions Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <span>Sleep Stages Breakdown</span>
                <span className="font-mono">{latestSession.durationMinutes} minutes tracked</span>
              </div>

              <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner">
                {/* Deep Sleep */}
                <div 
                  className="bg-[#3A4D39] flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ width: `${(latestSession.stages.deepMinutes / latestSession.durationMinutes) * 100}%` }}
                  title={`Deep Sleep: ${latestSession.stages.deepMinutes}m`}
                >
                  Deep ({latestSession.stages.deepMinutes}m)
                </div>
                {/* REM Sleep */}
                <div 
                  className="bg-[#7C9070] flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ width: `${(latestSession.stages.remMinutes / latestSession.durationMinutes) * 100}%` }}
                  title={`REM Sleep: ${latestSession.stages.remMinutes}m`}
                >
                  REM ({latestSession.stages.remMinutes}m)
                </div>
                {/* Light Sleep */}
                <div 
                  className="bg-[#D8D4CE] flex items-center justify-center text-[10px] text-[#2D2D2D] font-bold"
                  style={{ width: `${(latestSession.stages.lightMinutes / latestSession.durationMinutes) * 100}%` }}
                  title={`Light Sleep: ${latestSession.stages.lightMinutes}m`}
                >
                  Light ({latestSession.stages.lightMinutes}m)
                </div>
                {/* Awake */}
                <div 
                  className="bg-[#A45C40] flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ width: `${(latestSession.stages.awakeMinutes / latestSession.durationMinutes) * 100}%` }}
                  title={`Awake: ${latestSession.stages.awakeMinutes}m`}
                >
                  Awake ({latestSession.stages.awakeMinutes}m)
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 pt-2 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#3A4D39]" />
                  <span className="font-medium text-[#2D2D2D]">Deep / Delta (Cellular repair & Growth Hormone)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#7C9070]" />
                  <span className="font-medium text-[#2D2D2D]">REM (Neuroplasticity & Emotional consolidation)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#D8D4CE]" />
                  <span className="font-medium text-[#2D2D2D]">Light Sleep</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#A45C40]" />
                  <span className="font-medium text-[#2D2D2D]">Awake / Micro-arousal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Past 7 Days History Table */}
          <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[28px] border border-[#E8E4DE] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-4">
              <div>
                <h3 className="text-xl font-serif italic text-[#3A4D39]">
                  Historical Sleep & Acoustic Trends
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Longitudinal records of duration, sleep scores, snoring, and acoustic disturbances.
                </p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white border border-[#E8E4DE] rounded-full text-[#3A4D39]">
                {sleepHistory.length} Sessions Logged
              </span>
            </div>

            <div className="space-y-3">
              {sleepHistory.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 bg-white rounded-2xl border border-[#E8E4DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xs transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-serif italic text-base text-[#3A4D39] font-bold">
                        {sess.date}
                      </span>
                      <span className="text-xs text-[#6B7280] font-mono">
                        ({sess.startTime} - {sess.endTime})
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sess.sleepScore >= 90 ? 'bg-emerald-100 text-emerald-800' :
                        sess.sleepScore >= 80 ? 'bg-[#FAF8F5] text-[#3A4D39] border border-[#E8E4DE]' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        Score {sess.sleepScore}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#6B7280] flex-wrap">
                      <span><strong>Duration:</strong> {Math.floor(sess.durationMinutes / 60)}h {sess.durationMinutes % 60}m</span>
                      <span>•</span>
                      <span><strong>Deep:</strong> {sess.stages.deepMinutes}m</span>
                      <span>•</span>
                      <span><strong>REM:</strong> {sess.stages.remMinutes}m</span>
                      <span>•</span>
                      <span><strong>Snoring:</strong> {sess.snoringMinutes}m ({sess.snoringEventsCount} events)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#3A4D39]">{sess.efficiencyPercent}% Efficiency</div>
                      <span className="text-[10px] text-[#7C9070]">Noise: {sess.avgNoiseDb} dB</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
