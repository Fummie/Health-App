import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Droplet, 
  Wind, 
  Thermometer, 
  Zap, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Bluetooth, 
  ChevronRight,
  Loader2,
  X,
  ShieldAlert,
  AlertOctagon,
  Stethoscope,
  FileCheck,
  BellRing
} from 'lucide-react';
import { VitalRecord, BluetoothWearableState, UserProfile, HealthAlert } from '../types';

interface VitalsSegmentProps {
  vitalsHistory: VitalRecord[];
  onAddVitalRecord: (record: VitalRecord) => void;
  wearableState: BluetoothWearableState;
  userProfile: UserProfile;
  dailySteps: number;
  healthAlerts?: HealthAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onOpenAlertModal?: (alert: HealthAlert) => void;
  onSimulateDangerSpike?: (type: 'bp_crisis' | 'hypoxemia' | 'tachycardia' | 'hypoglycemia') => void;
}

export const VitalsSegment: React.FC<VitalsSegmentProps> = ({
  vitalsHistory,
  onAddVitalRecord,
  wearableState,
  userProfile,
  dailySteps,
  healthAlerts = [],
  onAcknowledgeAlert,
  onOpenAlertModal,
  onSimulateDangerSpike,
}) => {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [showSimulateDropdown, setShowSimulateDropdown] = useState(false);

  // Active (unresolved) alerts
  const activeAlerts = healthAlerts.filter((a) => a.status !== 'resolved');
  const resolvedAlerts = healthAlerts.filter((a) => a.status === 'resolved');
  const highestActiveAlert = activeAlerts[0];

  // Form State for new vital record
  const [newSystolic, setNewSystolic] = useState(120);
  const [newDiastolic, setNewDiastolic] = useState(80);
  const [newHeartRate, setNewHeartRate] = useState(wearableState.liveHeartRate || 68);
  const [newGlucose, setNewGlucose] = useState(95);
  const [newSpo2, setNewSpo2] = useState(98);
  const [newTemp, setNewTemp] = useState(36.6);
  const [newHrv, setNewHrv] = useState(60);
  const [newResp, setNewResp] = useState(14);
  const [newNotes, setNewNotes] = useState('');

  // Latest vital record
  const latestVital = vitalsHistory[0] || {
    systolicBP: 120,
    diastolicBP: 80,
    heartRate: wearableState.liveHeartRate || 68,
    bloodGlucose: 94,
    spo2: 99,
    bodyTempC: 36.6,
    hrvMs: 62,
    respiratoryRate: 14,
    timestamp: new Date().toISOString(),
    source: 'manual',
  };

  // Helper for Blood Pressure Category
  const getBPCategory = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: 'Optimal / Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (sys >= 120 && sys <= 129 && dia < 80) return { label: 'Elevated Pre-hypertensive', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'Stage 1 Hypertension', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Stage 2 Hypertension', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const bpStatus = getBPCategory(latestVital.systolicBP, latestVital.diastolicBP);

  const handleSaveVital = (e: React.FormEvent) => {
    e.preventDefault();
    const record: VitalRecord = {
      id: `vit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      systolicBP: Number(newSystolic),
      diastolicBP: Number(newDiastolic),
      heartRate: Number(newHeartRate),
      bloodGlucose: Number(newGlucose),
      spo2: Number(newSpo2),
      bodyTempC: Number(newTemp),
      hrvMs: Number(newHrv),
      respiratoryRate: Number(newResp),
      notes: newNotes || 'Routine check',
      source: wearableState.isConnected ? 'bluetooth' : 'manual',
    };

    onAddVitalRecord(record);
    setIsLogModalOpen(false);
    setNewNotes('');
  };

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/vitals-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vitals: {
            bloodPressure: { systolic: latestVital.systolicBP, diastolic: latestVital.diastolicBP },
            heartRate: latestVital.heartRate,
            bloodGlucose: latestVital.bloodGlucose,
            spo2: latestVital.spo2,
            hrvMs: latestVital.hrvMs,
            bodyTempC: latestVital.bodyTempC,
          },
          steps: dailySteps,
          userBio: {
            age: userProfile.age,
            gender: userProfile.gender,
            goal: userProfile.primaryGoal,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAiAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Error running AI vitals analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PERSISTENT HEALTH DANGER ALERT RIBBON (Displayed until acknowledged AND cleared by doctor checkup) */}
      {highestActiveAlert && (
        <div className={`p-5 sm:p-6 rounded-[28px] border-2 shadow-lg transition-all animate-in fade-in slide-in-from-top-4 duration-300 ${
          highestActiveAlert.severity === 'critical'
            ? 'bg-rose-50/95 border-rose-600/70 text-rose-950 shadow-rose-900/10'
            : 'bg-amber-50/95 border-amber-600/70 text-amber-950 shadow-amber-900/10'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                highestActiveAlert.severity === 'critical' 
                  ? 'bg-rose-600 text-white animate-pulse' 
                  : 'bg-amber-600 text-white'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                    highestActiveAlert.severity === 'critical' 
                      ? 'bg-rose-600 text-white' 
                      : 'bg-amber-600 text-white'
                  }`}>
                    {highestActiveAlert.status === 'active_unacknowledged' 
                      ? 'UNACKNOWLEDGED DANGER ALARM' 
                      : 'PENDING DOCTOR CHECKUP & CLEARANCE'}
                  </span>
                  <span className="text-[11px] font-mono text-[#6B7280]">
                    Flagged: {new Date(highestActiveAlert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h2 className="text-xl font-serif italic font-bold">
                  {highestActiveAlert.conditionTitle}
                </h2>
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {highestActiveAlert.triggerMetrics.map((m, idx) => (
                    <span key={idx} className="font-semibold">
                      {m.label}: <strong className="font-mono">{m.value} {m.unit}</strong> (Safe: {m.safeRange})
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#6B7280] italic">
                  {highestActiveAlert.status === 'active_unacknowledged'
                    ? 'Immediate clinical review and acknowledgement required to initiate safety protocol.'
                    : 'This safety flag remains locked in your profile until documented physician results are entered.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              {highestActiveAlert.status === 'active_unacknowledged' ? (
                <button
                  onClick={() => onOpenAlertModal && onOpenAlertModal(highestActiveAlert)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all animate-bounce"
                >
                  <BellRing className="w-4 h-4" />
                  <span>Acknowledge Urgent Alert</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAlertModal && onOpenAlertModal(highestActiveAlert)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all"
                >
                  <Stethoscope className="w-4 h-4 text-[#A45C40]" />
                  <span>Enter Doctor Checkup & Results</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Header & Quick Action in Natural Tones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Biometric Flow & Telemetry
            </span>
            {wearableState.isConnected && (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A45C40] animate-ping" />
                Live Oura Stream
              </span>
            )}
          </div>
          <h1 className="text-3xl font-serif italic text-[#3A4D39]">Clinical Vitals Telemetry</h1>
          <p className="text-xs text-[#6B7280]">Continuous monitoring of cardiovascular, respiratory, and metabolic homeostasis</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#A45C40] hover:bg-[#8F4F36] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-60"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing Biomarkers...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FAF8F5]" />
                <span>AI Clinical Analysis</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Vitals</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Insight Panel (When triggered) */}
      {aiAnalysisResult && (
        <div className="bg-[#3A4D39] text-[#FDFCFB] p-6 sm:p-7 rounded-[32px] border border-[#2F3F2E] shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start justify-between pb-3 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl text-[#FDFCFB]">
                <Sparkles className="w-5 h-5 text-[#A45C40]" />
              </div>
              <div>
                <h3 className="font-serif italic text-lg text-white">Gemini Clinical Biomarker Synthesis</h3>
                <p className="text-xs text-[#E8E4DE]">Integrated telemetry evaluation with step-count longevity correlations</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-white/15 text-[#FDFCFB] border border-white/20">
              {aiAnalysisResult.overallStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
            <div className="space-y-2 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-xs">
              <span className="font-bold text-[#E8E4DE] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#A45C40]" />
                Step Count Benefit Unlocked Today:
              </span>
              <p className="text-[#FDFCFB] leading-relaxed">{aiAnalysisResult.stepBenefitUnlocked}</p>
              <p className="text-[11px] text-[#E8E4DE] pt-1">Next Milestone: {aiAnalysisResult.nextStepMilestone}</p>
            </div>

            <div className="space-y-2 bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-xs">
              <span className="font-bold text-[#E8E4DE] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#7C9070]" />
                Clinical Observations:
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#FDFCFB]">
                {aiAnalysisResult.clinicalObservations?.map((obs: string, idx: number) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>

          {aiAnalysisResult.actionableAdvice && (
            <div className="mt-4 pt-3 border-t border-white/15">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#E8E4DE] block mb-2">Physician Action Directives:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {aiAnalysisResult.actionableAdvice.map((adv: string, idx: number) => (
                  <div key={idx} className="bg-white/10 p-3 rounded-xl border border-white/15 text-[11px] text-[#FDFCFB]">
                    <span className="font-bold text-[#A45C40] block mb-0.5 uppercase tracking-wider text-[9px]">Directive {idx + 1}</span>
                    {adv}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Primary Vitals Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Pressure */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] shadow-xs hover:border-[#3A4D39] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#7C9070] uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#A45C40]" />
              Blood Pressure
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
              {bpStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif text-[#3A4D39] tracking-tight">
              {latestVital.systolicBP}
            </span>
            <span className="text-xl font-serif text-[#6B7280]">/</span>
            <span className="text-2xl font-serif text-[#3A4D39]">
              {latestVital.diastolicBP}
            </span>
            <span className="text-xs text-[#6B7280] ml-1 font-sans">mmHg</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E8E4DE] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Target: &lt;120/80</span>
            <span className="uppercase text-[10px] tracking-wider font-semibold">Normotensive</span>
          </div>
        </div>

        {/* Card 2: Heart Rate */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] shadow-xs hover:border-[#3A4D39] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#7C9070] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#3A4D39]" />
              Pulse Rate
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
              Resting Zone
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-serif text-[#3A4D39] tracking-tight">
              {wearableState.isConnected && wearableState.liveHeartRate ? wearableState.liveHeartRate : latestVital.heartRate}
            </span>
            <span className="text-xs text-[#6B7280] font-sans">BPM</span>
            {wearableState.isConnected && (
              <span className="ml-auto flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A45C40] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A45C40]" />
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-[#E8E4DE] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Resting: 60-100 bpm</span>
            <span>HRV: {latestVital.hrvMs} ms</span>
          </div>
        </div>

        {/* Card 3: Blood Glucose */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] shadow-xs hover:border-[#3A4D39] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#7C9070] uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 text-[#A45C40]" />
              Blood Glucose
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
              Fasting Normal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-serif text-[#3A4D39] tracking-tight">
              {latestVital.bloodGlucose || 92}
            </span>
            <span className="text-xs text-[#6B7280] font-sans">mg/dL</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E8E4DE] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Fasting: 70-99</span>
            <span>HbA1c Est: ~5.1%</span>
          </div>
        </div>

        {/* Card 4: Blood Oxygen SpO2 */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] shadow-xs hover:border-[#3A4D39] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-[#7C9070] uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-[#3A4D39]" />
              Oxygen Saturation
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
              Optimal
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-serif text-[#3A4D39] tracking-tight">
              {latestVital.spo2}
            </span>
            <span className="text-xs text-[#6B7280] font-sans">% SpO2</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E8E4DE] flex items-center justify-between text-[11px] text-[#6B7280]">
            <span>Normal: &gt;95%</span>
            <span>Resp: {latestVital.respiratoryRate} bpm</span>
          </div>
        </div>
      </div>

      {/* Secondary Biometrics Strip: Temp & HRV */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F4F1ED] p-4 rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl border border-[#E8E4DE] text-[#3A4D39]">
              <Thermometer className="w-5 h-5 text-[#A45C40]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">Core Body Temp</span>
              <p className="text-xl font-serif text-[#3A4D39]">{latestVital.bodyTempC}°C <span className="text-xs font-sans text-[#6B7280]">({((latestVital.bodyTempC * 9/5) + 32).toFixed(1)}°F)</span></p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#3A4D39] bg-[#E8E4DE] px-2.5 py-1 rounded-full">Normothermic</span>
        </div>

        <div className="bg-[#F4F1ED] p-4 rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl border border-[#E8E4DE] text-[#3A4D39]">
              <Zap className="w-5 h-5 text-[#3A4D39]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">Autonomic HRV</span>
              <p className="text-xl font-serif text-[#3A4D39]">{latestVital.hrvMs} <span className="text-xs font-sans text-[#6B7280]">ms</span></p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#3A4D39] bg-[#E8E4DE] px-2.5 py-1 rounded-full">Parasympathetic</span>
        </div>

        <div className="bg-[#F4F1ED] p-4 rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-xl border border-[#E8E4DE] text-[#3A4D39]">
              <Wind className="w-5 h-5 text-[#7C9070]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070]">Respiratory Rate</span>
              <p className="text-xl font-serif text-[#3A4D39]">{latestVital.respiratoryRate} <span className="text-xs font-sans text-[#6B7280]">breaths/min</span></p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#3A4D39] bg-[#E8E4DE] px-2.5 py-1 rounded-full">Eupneic</span>
        </div>
      </div>

      {/* Interactive Trends & History Log */}
      <div className="bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DE] p-6 sm:p-7 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-serif italic text-[#3A4D39]">Vitals Historical Timeline</h3>
            <p className="text-xs text-[#6B7280]">Chronological telemetry audit log for physician review</p>
          </div>
          <span className="text-xs font-mono text-[#6B7280] bg-[#E8E4DE] px-3 py-1 rounded-full">
            {vitalsHistory.length} Recorded Checkpoints
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E4DE] text-[#7C9070] uppercase tracking-wider font-bold text-[10px]">
                <th className="pb-3 pl-2">Timestamp</th>
                <th className="pb-3">Blood Pressure</th>
                <th className="pb-3">Heart Rate</th>
                <th className="pb-3">Glucose</th>
                <th className="pb-3">SpO2</th>
                <th className="pb-3">HRV</th>
                <th className="pb-3">Source</th>
                <th className="pb-3 pr-2">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4DE] text-[#2D2D2D]">
              {vitalsHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#F4F1ED] transition-colors">
                  <td className="py-3 pl-2 font-mono text-[#6B7280]">
                    {new Date(rec.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} {' '}
                    {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-semibold text-[#3A4D39] font-mono">
                    {rec.systolicBP}/{rec.diastolicBP} <span className="text-[10px] text-[#6B7280] font-sans">mmHg</span>
                  </td>
                  <td className="py-3 font-mono font-medium">
                    {rec.heartRate} <span className="text-[10px] text-[#6B7280] font-sans">bpm</span>
                  </td>
                  <td className="py-3 font-mono font-medium">
                    {rec.bloodGlucose ? `${rec.bloodGlucose} mg/dL` : '—'}
                  </td>
                  <td className="py-3 font-mono">
                    {rec.spo2}%
                  </td>
                  <td className="py-3 font-mono">
                    {rec.hrvMs} ms
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rec.source === 'bluetooth' 
                        ? 'bg-[#FAF8F5] text-[#A45C40] border border-[#E8E4DE]' 
                        : 'bg-[#E8E4DE] text-[#3A4D39]'
                    }`}>
                      {rec.source === 'bluetooth' ? <Bluetooth className="w-3 h-3" /> : null}
                      {rec.source}
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-[#6B7280] italic font-serif max-w-xs truncate">
                    {rec.notes || 'Routine check'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Safety & Physician Clearance Audit Log */}
      <div className="bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DE] p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4DE]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E8E4DE] rounded-2xl text-[#3A4D39]">
              <ShieldAlert className="w-5 h-5 text-[#3A4D39]" />
            </div>
            <div>
              <h3 className="text-xl font-serif italic text-[#3A4D39]">
                Clinical Safety & Physician Clearance Records
              </h3>
              <p className="text-xs text-[#6B7280]">
                Continuous telemetry comparison, danger flags, and documented doctor results
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSimulateDropdown(!showSimulateDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8E4DE] hover:bg-[#F4F1ED] text-[#3A4D39] text-xs font-bold uppercase tracking-wider transition-all"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-[#A45C40]" />
              <span>Simulate Telemetry Danger</span>
            </button>

            {showSimulateDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E8E4DE] p-2 z-20 space-y-1 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase text-[#7C9070] tracking-wider">
                  Test Routine Anomaly Sensing
                </div>
                <button
                  onClick={() => {
                    onSimulateDangerSpike && onSimulateDangerSpike('bp_crisis');
                    setShowSimulateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-800 font-medium transition-colors flex items-center justify-between"
                >
                  <span>Acute BP Spike (184/118 mmHg)</span>
                  <span className="text-[10px] font-bold font-mono text-rose-600">Crisis</span>
                </button>
                <button
                  onClick={() => {
                    onSimulateDangerSpike && onSimulateDangerSpike('hypoxemia');
                    setShowSimulateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-800 font-medium transition-colors flex items-center justify-between"
                >
                  <span>Acute Hypoxemia (88% SpO2)</span>
                  <span className="text-[10px] font-bold font-mono text-rose-600">Critical</span>
                </button>
                <button
                  onClick={() => {
                    onSimulateDangerSpike && onSimulateDangerSpike('tachycardia');
                    setShowSimulateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-800 font-medium transition-colors flex items-center justify-between"
                >
                  <span>Resting Tachycardia (135 bpm)</span>
                  <span className="text-[10px] font-bold font-mono text-amber-600">Urgent</span>
                </button>
                <button
                  onClick={() => {
                    onSimulateDangerSpike && onSimulateDangerSpike('hypoglycemia');
                    setShowSimulateDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-800 font-medium transition-colors flex items-center justify-between"
                >
                  <span>Severe Hypoglycemia (58 mg/dL)</span>
                  <span className="text-[10px] font-bold font-mono text-amber-600">Urgent</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Display Alert Records */}
        {healthAlerts.length === 0 ? (
          <div className="p-5 rounded-2xl bg-white border border-[#E8E4DE] text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-[#7C9070] mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
              All Telemetry Metrics Safe
            </p>
            <p className="text-xs text-[#6B7280] font-serif italic max-w-md mx-auto">
              Automated surveillance continuously compares every vital checkpoint against baseline safe thresholds. No active clinical flags detected.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {healthAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alert.status === 'resolved'
                    ? 'bg-white border-[#E8E4DE]'
                    : alert.severity === 'critical'
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E4DE]/60">
                  <div className="flex items-center gap-2.5">
                    {alert.status === 'resolved' ? (
                      <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FileCheck className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1.5 rounded-xl bg-rose-100 text-rose-700 animate-pulse">
                        <ShieldAlert className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <h4 className="font-serif italic font-bold text-sm text-[#3A4D39]">
                        {alert.conditionTitle}
                      </h4>
                      <span className="text-[10px] font-mono text-[#6B7280]">
                        Flagged: {new Date(alert.detectedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {alert.status === 'resolved' ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Doctor Cleared & Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => onOpenAlertModal && onOpenAlertModal(alert)}
                        className="px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#3A4D39] text-white hover:bg-[#2F3F2E] transition-all flex items-center gap-1.5"
                      >
                        <Stethoscope className="w-3 h-3" />
                        <span>Update Doctor Results</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-3 text-xs">
                  {alert.triggerMetrics.map((m, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DE] text-[11px]">
                      <span className="text-[#6B7280] block text-[10px]">{m.label}</span>
                      <strong className="text-rose-700 font-mono text-sm">{m.value} {m.unit}</strong>
                      <span className="text-[#7C9070] block text-[10px]">Normal: {m.safeRange}</span>
                    </div>
                  ))}
                </div>

                {/* Doctor Resolution Details (if resolved) */}
                {alert.resolution && (
                  <div className="mt-3 p-3.5 rounded-xl bg-[#F4F1ED] border border-[#E8E4DE] space-y-1.5 text-xs font-serif">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#3A4D39]">
                        Cleared by: {alert.resolution.doctorName} ({alert.resolution.clinicName})
                      </span>
                      <span className="text-[#6B7280] font-mono">
                        Exam Date: {alert.resolution.checkupDate}
                      </span>
                    </div>
                    <p className="text-[#2D2D2D] italic">
                      <strong>Clinical Diagnosis:</strong> {alert.resolution.clinicalDiagnosis}
                    </p>
                    <p className="text-[#6B7280] italic text-[11px]">
                      <strong>Examination Findings:</strong> {alert.resolution.examinationNotes}
                    </p>
                    {alert.resolution.medicationAdjustments && (
                      <p className="text-[#7C9070] text-[11px]">
                        <strong>Prescription Changes:</strong> {alert.resolution.medicationAdjustments}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Log New Vitals */}
      {isLogModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-vitals-title"
        >
          <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#3A4D39] text-[#FDFCFB] px-6 py-5 flex items-center justify-between">
              <div>
                <h3 id="log-vitals-title" className="text-xl font-serif italic">Record Clinical Vitals</h3>
                <p className="text-xs text-[#E8E4DE]">Enter biometric measurements or synchronize from wearable</p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVital} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="70"
                    max="240"
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="40"
                    max="150"
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Heart Rate (BPM)</label>
                  <input
                    type="number"
                    min="35"
                    max="220"
                    value={newHeartRate}
                    onChange={(e) => setNewHeartRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Blood Glucose (mg/dL)</label>
                  <input
                    type="number"
                    min="40"
                    max="400"
                    value={newGlucose}
                    onChange={(e) => setNewGlucose(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    min="80"
                    max="100"
                    value={newSpo2}
                    onChange={(e) => setNewSpo2(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="34"
                    max="42"
                    value={newTemp}
                    onChange={(e) => setNewTemp(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">HRV (ms)</label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={newHrv}
                    onChange={(e) => setNewHrv(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm font-mono text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Clinical Context / Patient Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Post-prandial reading, felt calm, resting 5 minutes prior"
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-sm text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E8E4DE] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#2D2D2D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-xs transition-all"
                >
                  Save Vital Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
