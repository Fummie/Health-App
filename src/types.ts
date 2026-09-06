export type Gender = 'female' | 'male';

export type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'athlete';

export type HealthGoal = 
  | 'longevity' 
  | 'cardio' 
  | 'weight_loss' 
  | 'hormonal_balance' 
  | 'metabolic_fitness' 
  | 'stress_reduction';

export type DietaryPreference = 
  | 'mediterranean' 
  | 'omnivore' 
  | 'plant_based' 
  | 'keto' 
  | 'low_gi' 
  | 'gluten_free';

export type RelationshipStatus = 
  | 'single' 
  | 'in_relationship' 
  | 'married' 
  | 'domestic_partnership' 
  | 'divorced' 
  | 'widowed' 
  | 'prefer_not_to_say';

export interface ChildDependentInfo {
  id: string;
  name: string;
  age?: number;
  gender?: 'female' | 'male' | 'other';
  bloodType?: string;
  notes?: string;
}

export interface FamilyInformation {
  spouseName: string;
  spouseAge?: number;
  spouseDateOfBirth?: string;
  spouseBloodType?: string;
  spousePhone?: string;
  anniversaryDate?: string;
  yearsMarried?: number;
  hasChildren?: boolean;
  childrenCount?: number;
  children?: ChildDependentInfo[];
  emergencyDesignation?: boolean;
  familyMedicalHistory?: string;
  householdDietaryNotes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  gender: Gender;
  age: number;
  weightKg: number;
  heightCm: number;
  primaryGoal: HealthGoal;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  relationshipStatus?: RelationshipStatus;
  familyInfo?: FamilyInformation;
  isOnboarded: boolean;
  createdAt: string;
  syncEnabled?: boolean;
  lastSyncTimestamp?: string;
  bloodType?: string;
}

export interface AIProtocol {
  summary: string;
  dailyStepTarget: number;
  calorieTarget: number;
  macroRatio: {
    protein: number;
    carbs: number;
    fats: number;
  };
  waterTargetLiters: number;
  priorityFocus: string[];
  aiHealthQuote: string;
  focusArea?: string;
  clinicalSummary?: string;
  stepTarget?: number;
}

export interface VitalRecord {
  id: string;
  timestamp: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  bloodGlucose?: number; // mg/dL
  spo2: number; // %
  bodyTempC: number; // °C
  hrvMs: number; // Heart Rate Variability in ms
  respiratoryRate: number; // breaths/min
  notes?: string;
  source: 'manual' | 'bluetooth' | 'sensor';
}

export interface StepBenefitMilestone {
  stepCount: number;
  title: string;
  physiologicalBenefit: string;
  clinicalEvidence: string;
  unlocked: boolean;
  iconName: string;
}

export interface DailyStepData {
  currentSteps: number;
  targetSteps: number;
  activeMinutes: number;
  caloriesBurned: number;
  distanceKm: number;
  hourlyBreakdown: { hour: string; steps: number }[];
  isPedometerActive: boolean;
}

export interface NutritionLogItem {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  timestamp: string;
}

export interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium';
  targetGoal: string;
  calories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
    fiber: string;
  };
  keyBenefits: string;
  ingredients: string[];
  steps: string[];
  quickTip: string;
  isAiGenerated?: boolean;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'smoothie';
}

export interface EmergencyProfile {
  patientToken: string;
  fullName: string;
  dateOfBirth: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  organDonor: boolean;
  primaryPhysician: {
    name: string;
    clinic: string;
    phone: string;
  };
  advanceDirectives: string;
  lastUpdated: string;
}

export interface DoctorUpdate {
  id: string;
  doctorName: string;
  clinicName: string;
  notes: string;
  medicationAdjustments?: string;
  triageStatus: string;
  timestamp: string;
}

// Female Cycle Tracking
export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export interface FemaleCycleData {
  lastPeriodStartDate: string;
  cycleLengthDays: number;
  periodLengthDays: number;
  currentCycleDay: number;
  currentPhase: MenstrualPhase;
  daysUntilNextPeriod: number;
  fertilityStatus: 'low' | 'medium' | 'peak';
  symptoms: {
    cramps: number; // 0 to 5
    mood: string;
    energy: number; // 1 to 5
    flow: 'light' | 'medium' | 'heavy' | 'spotting' | 'none';
    skin: string;
  };
  phaseNutritionTips: string[];
  phaseWorkoutTips: string[];
}

// Male Endocrine / Testosterone Tracking
export interface MaleTestosteroneData {
  morningEnergyScore: number; // 1 to 10
  deepSleepHours: number;
  resistanceTrainedToday: boolean;
  zincAndVitaminDIntake: boolean;
  stressLevel: number; // 1 to 10
  vitalityTrend: { day: string; estimatedPercent: number }[];
  currentDiurnalState: 'morning_peak' | 'midday_stable' | 'evening_trough';
  optimizationTips: string[];
}

// Bluetooth Wearable State
export interface BluetoothWearableState {
  isConnected: boolean;
  isScanning: boolean;
  deviceName: string | null;
  batteryLevel: number | null;
  liveHeartRate: number | null;
  liveHrv: number | null;
  liveSteps: number;
  pulseStream: number[];
  isSimulator: boolean;
  isSimulated?: boolean;
  lastSyncTime?: string;
  errorMessage: string | null;
}

// Accessibility Settings
export interface AccessibilitySettings {
  highContrast: boolean;
  dyslexiaFont: boolean;
  fontScale: 'normal' | 'large' | 'xlarge';
  fontSize?: 'normal' | 'large' | 'xlarge';
  reducedMotion: boolean;
  screenReaderVoice: boolean;
}

// Sleep Tracking & Nocturnal Acoustic Disorder Monitoring
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type AlarmSoundId = 
  | 'zen_bowl' 
  | 'gentle_harp' 
  | 'binaural_dawn' 
  | 'soft_marimba' 
  | 'forest_birds'
  | string;

export interface CustomAudioTrack {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  durationSeconds?: number;
  addedAt: string;
  audioDataUrl?: string; // base64 data url or blob url
  isPreloaded?: boolean;
}

export interface DailyAlarmSchedule {
  day: DayOfWeek;
  label: string;
  bedtime: string; // e.g. "22:30"
  wakeTime: string; // e.g. "06:45"
  bedtimeReminder: boolean;
  wakeAlarm: boolean;
  targetSleepMinutes: number;
}

export interface SleepRoutineSettings {
  mode: 'weekly_individual' | 'uniform';
  uniformBedtime: string;
  uniformWakeTime: string;
  uniformBedtimeReminder: boolean;
  uniformWakeAlarm: boolean;
  alarmSound: AlarmSoundId;
  alarmVolume: number; // 0 to 100
  smartWakeWindowMinutes: number; // 0, 15, 20, 30
  snoozeMinutes: number;
  dailySchedules: Record<DayOfWeek, DailyAlarmSchedule>;
  // Bedtime Soft Music & Calming Tones Settings
  bedtimeCalmingTone: BackgroundSoundscapeId;
  autoPlayBedtimeMusic: boolean;
  bedtimeMusicTimerMinutes: number; // 15, 30, 45, 60, or 0 for continuous
  bedtimeMusicVolume: number; // 0 to 100
}

export type SleepDisorderType = 
  | 'none' 
  | 'snoring' 
  | 'insomnia_wakefulness' 
  | 'respiratory_apnea_pause' 
  | 'restless_movement' 
  | 'ambient_noise_spike';

export interface NocturnalAudioEvent {
  id: string;
  timestamp: string;
  type: SleepDisorderType;
  decibels: number;
  durationSeconds: number;
  confidence: number; // 0 to 100
  title: string;
  description: string;
}

export type BackgroundSoundscapeId = 
  | 'off' 
  | 'starlight_piano_lullaby'
  | 'moonlit_music_box'
  | 'celestial_dream_pad'
  | 'stellar_cosmic_slumber'
  | 'zen_bamboo_koto'
  | 'twilight_acoustic_guitar'
  | 'midnight_ocean_waves'
  | 'binaural_theta_6hz'
  | 'delta_restoration_2hz'
  | 'solfeggio_528hz'
  | 'solfeggio_432hz'
  | 'solfeggio_639hz'
  | 'somatic_vagus_pulse'
  | 'tibetan_overtones'
  | 'delta_waves_4hz'
  | 'brown_noise' 
  | 'pink_noise' 
  | 'rain_droplets' 
  | 'forest_stream';

export interface SleepSessionRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  durationMinutes: number;
  targetDurationMinutes: number;
  sleepScore: number; // 0 - 100
  efficiencyPercent: number; // 0 - 100
  timeToFallAsleepMinutes: number;
  stages: {
    deepMinutes: number;
    remMinutes: number;
    lightMinutes: number;
    awakeMinutes: number;
  };
  snoringMinutes: number;
  snoringEventsCount: number;
  insomniaEpisodesCount: number;
  restlessEventsCount: number;
  apneaPauseCount: number;
  disorderRisk: 'optimal' | 'mild_snoring' | 'moderate_disruption' | 'high_apnea_insomnia_risk';
  soundscapePlayed?: BackgroundSoundscapeId;
  avgNoiseDb: number;
  peakNoiseDb: number;
  audioEvents: NocturnalAudioEvent[];
  notes?: string;
}

// Clinical Vitals Telemetry Anomaly & Health Danger Alert Types
export type AlertSeverity = 'critical' | 'urgent' | 'warning';
export type AlertStatus = 'active_unacknowledged' | 'acknowledged_pending_doctor' | 'resolved';

export interface HealthAlertTriggerMetric {
  label: string;
  value: string | number;
  unit: string;
  safeRange: string;
  status: string;
  trendComparison?: string;
}

export interface DoctorCheckupResolution {
  doctorName: string;
  clinicName: string;
  checkupDate: string;
  examinationNotes: string;
  clinicalDiagnosis: string;
  labResultsSummary: string;
  medicationAdjustments?: string;
  clearanceStatus: 'cleared_controlled' | 'under_observation_rx' | 'specialist_referral';
  resolvedAt: string;
  repeatVitals?: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    bloodGlucose?: number;
    spo2?: number;
  };
}

export interface HealthAlert {
  id: string;
  conditionKey: string;
  conditionTitle: string;
  severity: AlertSeverity;
  detectedAt: string;
  triggerVitalId?: string;
  triggerMetrics: HealthAlertTriggerMetric[];
  clinicalImplications: string[];
  immediateDirectives: string[];
  status: AlertStatus;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolution?: DoctorCheckupResolution;
}
