import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Phone, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Stethoscope, 
  Hospital, 
  FileText, 
  Activity, 
  Clock, 
  Calendar,
  UserCheck,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { HealthAlert, DoctorCheckupResolution, UserProfile, VitalRecord } from '../types';
import { alertAudioService } from '../utils/alertChime';

interface HealthDangerModalProps {
  alert: HealthAlert | null;
  userProfile: UserProfile;
  latestVitals?: VitalRecord;
  onAcknowledge: (alertId: string) => void;
  onResolveWithDoctor: (alertId: string, resolution: DoctorCheckupResolution, repeatVital?: Partial<VitalRecord>) => void;
  onCloseBanner?: () => void;
}

export const HealthDangerModal: React.FC<HealthDangerModalProps> = ({
  alert,
  userProfile,
  latestVitals,
  onAcknowledge,
  onResolveWithDoctor,
  onCloseBanner,
}) => {
  const [viewMode, setViewMode] = useState<'alarm_warning' | 'doctor_resolution'>('alarm_warning');
  const [confirmedUnderstanding, setConfirmedUnderstanding] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Doctor Checkup Form State
  const [doctorName, setDoctorName] = useState(userProfile.emergencyContacts?.[0]?.name ? 'Dr. Evelyn Vance, MD' : 'Dr. Evelyn Vance, MD');
  const [clinicName, setClinicName] = useState('Metro Cardiology & Primary Care Clinic');
  const [checkupDate, setCheckupDate] = useState(new Date().toISOString().split('T')[0]);
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState('');
  const [examinationNotes, setExaminationNotes] = useState('');
  const [labResultsSummary, setLabResultsSummary] = useState('');
  const [medicationAdjustments, setMedicationAdjustments] = useState('');
  const [clearanceStatus, setClearanceStatus] = useState<'cleared_controlled' | 'under_observation_rx' | 'specialist_referral'>('cleared_controlled');

  // Repeat vitals entered by doctor
  const [repeatSystolic, setRepeatSystolic] = useState<number>(118);
  const [repeatDiastolic, setRepeatDiastolic] = useState<number>(78);
  const [repeatHeartRate, setRepeatHeartRate] = useState<number>(68);
  const [repeatSpo2, setRepeatSpo2] = useState<number>(98);
  const [logRepeatVitals, setLogRepeatVitals] = useState(true);

  // Trigger audio alarm if unacknowledged
  useEffect(() => {
    if (alert && alert.status === 'active_unacknowledged' && !isMuted) {
      alertAudioService.startContinuousAlert(alert.severity === 'critical');
    }
    return () => {
      alertAudioService.stopContinuousAlert();
    };
  }, [alert?.id, alert?.status, isMuted]);

  // If the alert is already acknowledged and pending doctor, open directly into resolution view
  useEffect(() => {
    if (alert?.status === 'acknowledged_pending_doctor') {
      setViewMode('doctor_resolution');
    } else {
      setViewMode('alarm_warning');
    }
  }, [alert?.status, alert?.id]);

  if (!alert || alert.status === 'resolved') return null;

  const toggleSound = () => {
    const muted = alertAudioService.toggleMute();
    setIsMuted(muted);
  };

  const handleAcknowledge = () => {
    alertAudioService.stopContinuousAlert();
    onAcknowledge(alert.id);
    setViewMode('doctor_resolution');
  };

  const handleSubmitDoctorResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !clinicalDiagnosis || !examinationNotes) return;

    const resolution: DoctorCheckupResolution = {
      doctorName,
      clinicName,
      checkupDate,
      examinationNotes,
      clinicalDiagnosis,
      labResultsSummary: labResultsSummary || 'Normal evaluation. Parameter returned to physiological baseline.',
      medicationAdjustments: medicationAdjustments || undefined,
      clearanceStatus,
      resolvedAt: new Date().toISOString(),
      repeatVitals: logRepeatVitals ? {
        systolicBP: Number(repeatSystolic),
        diastolicBP: Number(repeatDiastolic),
        heartRate: Number(repeatHeartRate),
        spo2: Number(repeatSpo2),
      } : undefined,
    };

    const repeatVitalRecord: Partial<VitalRecord> | undefined = logRepeatVitals ? {
      systolicBP: Number(repeatSystolic),
      diastolicBP: Number(repeatDiastolic),
      heartRate: Number(repeatHeartRate),
      spo2: Number(repeatSpo2),
      notes: `Post-checkup verification by ${doctorName}: ${clinicalDiagnosis}`,
      source: 'manual',
    } : undefined;

    onResolveWithDoctor(alert.id, resolution, repeatVitalRecord);
  };

  const isCritical = alert.severity === 'critical';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-danger-modal-title"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-rose-600/40 text-[#2D2D2D] my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Urgent Emergency Header */}
        <div className={`p-6 sm:p-7 text-white flex items-start justify-between relative overflow-hidden ${
          isCritical 
            ? 'bg-gradient-to-r from-[#8B1E1E] via-[#A42828] to-[#8B1E1E]' 
            : 'bg-gradient-to-r from-[#A45C40] via-[#8F4F36] to-[#A45C40]'
        }`}>
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/15 rounded-2xl border border-white/25 backdrop-blur-xs animate-pulse">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white text-rose-800 font-mono shadow-xs">
                  {isCritical ? 'CRITICAL CLINICAL ALERT' : 'PHYSIOLOGICAL DANGER WARNING'}
                </span>
                <span className="text-xs text-white/80 font-mono">
                  Detected: {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 id="health-danger-modal-title" className="text-2xl sm:text-3xl font-serif italic text-white leading-tight">
                {alert.conditionTitle}
              </h2>
              <p className="text-xs text-white/90 mt-1 max-w-lg">
                Automated telemetry comparison has identified acute biometric divergence requiring verified medical clearance.
              </p>
            </div>
          </div>

          {/* Sound & Dismiss Controls */}
          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              title={isMuted ? 'Unmute alarm tone' : 'Mute alarm tone'}
              aria-label="Toggle alarm sound"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-white/70" /> : <Volume2 className="w-5 h-5 text-white" />}
            </button>
            {alert.status === 'acknowledged_pending_doctor' && onCloseBanner && (
              <button
                onClick={onCloseBanner}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
                title="Minimize banner"
                aria-label="Minimize banner"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode 1: Initial Alarm Warning Screen */}
        {viewMode === 'alarm_warning' && (
          <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Telemetry Comparison Table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C9070] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#A45C40]" />
                  Comparative Biometric Diagnostics
                </span>
                <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Exceeds Safety Threshold
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alert.triggerMetrics.map((metric, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                    <span className="text-xs font-semibold text-[#2D2D2D] block">{metric.label}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif text-rose-800 font-bold">
                        {metric.value} <span className="text-xs font-sans text-rose-600 font-normal">{metric.unit}</span>
                      </span>
                      {metric.trendComparison && (
                        <span className="text-[11px] font-mono font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {metric.trendComparison}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#6B7280] pt-1 flex items-center justify-between border-t border-rose-200/50">
                      <span>Normal Safe Range:</span>
                      <strong className="text-[#3A4D39] font-mono">{metric.safeRange}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Implications */}
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DE] space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#3A4D39] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#A45C40]" />
                Physiological Implications & Clinical Risks
              </h3>
              <ul className="space-y-1.5 text-xs text-[#2D2D2D] list-disc list-inside leading-relaxed font-serif">
                {alert.clinicalImplications.map((imp, i) => (
                  <li key={i}>{imp}</li>
                ))}
              </ul>
            </div>

            {/* Immediate Action Directives */}
            <div className="bg-[#F4F1ED] p-5 rounded-2xl border border-[#E8E4DE] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7C9070]">
                Immediate Safety Directives:
              </h3>
              <div className="space-y-1.5">
                {alert.immediateDirectives.map((dir, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#2D2D2D]">
                    <span className="w-4 h-4 rounded-full bg-[#3A4D39] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{dir}</span>
                  </div>
                ))}
              </div>

              {/* Emergency Contact Quick Dials */}
              <div className="pt-3 border-t border-[#E8E4DE] flex items-center gap-3 flex-wrap">
                <a
                  href="tel:911"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Emergency (911 / 112)</span>
                </a>
                <a
                  href="tel:+15550192834"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E8E4DE] hover:bg-[#FAF8F5] text-[#3A4D39] text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#A45C40]" />
                  <span>Call Primary Doctor (Dr. Vance)</span>
                </a>
              </div>
            </div>

            {/* Compulsory Acknowledgment Guard */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedUnderstanding}
                  onChange={(e) => setConfirmedUnderstanding(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#3A4D39] focus:ring-[#3A4D39]"
                />
                <span className="text-xs text-[#2D2D2D] leading-relaxed">
                  <strong>I acknowledge and understand the clinical risks</strong> of this telemetry alert. I recognize that this flag will remain persistently active in my profile until I have been examined by a physician and submitted my official doctor checkup result.
                </span>
              </label>

              <button
                onClick={handleAcknowledge}
                disabled={!confirmedUnderstanding}
                className="w-full py-3.5 px-6 rounded-full bg-[#3A4D39] hover:bg-[#2F3F2E] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge Danger & Proceed to Doctor Checkup Update</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* View Mode 2: Compulsory Doctor Checkup & Result Update Form */}
        {viewMode === 'doctor_resolution' && (
          <form onSubmit={handleSubmitDoctorResolution} className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7C9070] tracking-wider block">Clinical Flag Clearance:</span>
                <h3 className="text-base font-serif italic text-[#3A4D39]">{alert.conditionTitle}</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Awaiting Doctor Result
              </span>
            </div>

            <p className="text-xs text-[#6B7280] leading-relaxed font-serif italic">
              Please enter the clinical examination findings, formal diagnosis, and therapeutic adjustments from your consultation with your physician to officially clear this telemetry alert.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Attending Physician
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-[#7C9070] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Evelyn Vance, MD"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs font-medium text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Hospital / Clinic Name
                </label>
                <div className="relative">
                  <Hospital className="w-4 h-4 text-[#7C9070] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="e.g. Metro Medical Center"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs font-medium text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Date of Consultation
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#7C9070] absolute left-3.5 top-3" />
                  <input
                    type="date"
                    value={checkupDate}
                    onChange={(e) => setCheckupDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs font-medium text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Physician Clearance Status
                </label>
                <select
                  value={clearanceStatus}
                  onChange={(e: any) => setClearanceStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs font-medium text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                >
                  <option value="cleared_controlled">Clinically Cleared & Stabilized in Safe Range</option>
                  <option value="under_observation_rx">Controlled with Prescription Adjustment</option>
                  <option value="specialist_referral">Referred to Secondary Specialist</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                Doctor's Clinical Assessment & Diagnosis
              </label>
              <textarea
                value={clinicalDiagnosis}
                onChange={(e) => setClinicalDiagnosis(e.target.value)}
                placeholder="e.g. Transient acute blood pressure elevation secondary to acute physiological stress; no acute ischemic changes on ECG. Resting vitals returned to normotensive parameters."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none font-serif"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                Examination Notes & Physical Evaluation
              </label>
              <textarea
                value={examinationNotes}
                onChange={(e) => setExaminationNotes(e.target.value)}
                placeholder="e.g. Bilateral auscultation clear. Neurological exam intact. Fundoscopic exam revealed no papilledema. Patient counseled on hydration and stress management."
                rows={2}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none font-serif"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Diagnostic Lab & Test Results
                </label>
                <input
                  type="text"
                  value={labResultsSummary}
                  onChange={(e) => setLabResultsSummary(e.target.value)}
                  placeholder="e.g. 12-lead ECG: Normal Sinus Rhythm; Basic Metabolic Panel normal"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                  Prescription / Therapy Adjustments
                </label>
                <input
                  type="text"
                  value={medicationAdjustments}
                  onChange={(e) => setMedicationAdjustments(e.target.value)}
                  placeholder="e.g. Initiated Amlodipine 5mg daily; temporary restriction of intense HIIT"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E8E4DE] rounded-xl text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                />
              </div>
            </div>

            {/* Repeat Vitals Checkbox & Form */}
            <div className="p-4 rounded-2xl bg-[#F4F1ED] border border-[#E8E4DE] space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={logRepeatVitals}
                  onChange={(e) => setLogRepeatVitals(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3A4D39] focus:ring-[#3A4D39]"
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                  Record Doctor's In-Clinic Repeat Vitals Checkpoint
                </span>
              </label>

              {logRepeatVitals && (
                <div className="grid grid-cols-4 gap-2.5 pt-1">
                  <div>
                    <span className="text-[10px] font-bold text-[#7C9070] block mb-1">Systolic BP</span>
                    <input
                      type="number"
                      value={repeatSystolic}
                      onChange={(e) => setRepeatSystolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8E4DE] rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7C9070] block mb-1">Diastolic BP</span>
                    <input
                      type="number"
                      value={repeatDiastolic}
                      onChange={(e) => setRepeatDiastolic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8E4DE] rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7C9070] block mb-1">Heart Rate</span>
                    <input
                      type="number"
                      value={repeatHeartRate}
                      onChange={(e) => setRepeatHeartRate(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8E4DE] rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#7C9070] block mb-1">SpO2 (%)</span>
                    <input
                      type="number"
                      value={repeatSpo2}
                      onChange={(e) => setRepeatSpo2(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E8E4DE] rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-[#E8E4DE] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setViewMode('alarm_warning')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#2D2D2D]"
              >
                &larr; View Alert Details
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Submit Official Doctor Checkup & Clear Flag</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
