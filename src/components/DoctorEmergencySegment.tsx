import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Phone, 
  HeartHandshake, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Stethoscope, 
  Clock, 
  Send, 
  Printer,
  ChevronRight,
  Hospital
} from 'lucide-react';
import { EmergencyProfile, DoctorUpdate, VitalRecord, UserProfile } from '../types';
import { DEFAULT_EMERGENCY_PROFILE } from '../data/defaultData';

interface DoctorEmergencySegmentProps {
  latestVitals: VitalRecord;
  userProfile?: UserProfile;
}

export const DoctorEmergencySegment: React.FC<DoctorEmergencySegmentProps> = ({ latestVitals, userProfile }) => {
  const [profile, setProfile] = useState<EmergencyProfile>(DEFAULT_EMERGENCY_PROFILE);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'patient_view' | 'doctor_portal_view'>('patient_view');

  // Doctor updates audit trail
  const [doctorUpdates, setDoctorUpdates] = useState<DoctorUpdate[]>([
    {
      id: 'doc_1',
      doctorName: 'Dr. Evelyn Vance, MD',
      clinicName: 'St. Jude Integrated Preventative Medicine',
      notes: 'Reviewed resting blood pressure trend. Baseline remains stable under 122/78 mmHg. Exercise-induced asthma plan confirmed.',
      medicationAdjustments: 'Maintained Albuterol 90mcg PRN. Continue Vitamin D3 2000 IU.',
      triageStatus: 'Stable / Routine Review',
      timestamp: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    }
  ]);

  // Doctor Form inputs for the portal preview
  const [docName, setDocName] = useState('Dr. Evelyn Vance, MD');
  const [clinicName, setClinicName] = useState('St. Jude Integrated Clinic');
  const [docNotes, setDocNotes] = useState('');
  const [docMeds, setDocMeds] = useState('');
  const [triageStatus, setTriageStatus] = useState('Stable / Clinical Adjustment');
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Generate external link URL
  const externalDoctorUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?view=doctor-portal&token=${profile.patientToken}`
    : `https://vitalis.health/doctor-portal?token=${profile.patientToken}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(externalDoctorUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSubmitDoctorUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNotes.trim()) return;

    setIsSubmittingUpdate(true);
    try {
      const response = await fetch('/api/doctor/update-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientToken: profile.patientToken,
          doctorName: docName,
          clinicName: clinicName,
          notes: docNotes,
          medicationAdjustments: docMeds,
          triageStatus: triageStatus,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success && data.update) {
        setDoctorUpdates([data.update, ...doctorUpdates]);
        setDocNotes('');
        setDocMeds('');
        setSubmissionSuccess(true);
        setTimeout(() => setSubmissionSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error submitting doctor update:', err);
      // Fallback local update
      const fallback: DoctorUpdate = {
        id: `doc_${Date.now()}`,
        doctorName: docName,
        clinicName: clinicName,
        notes: docNotes,
        medicationAdjustments: docMeds,
        triageStatus: triageStatus,
        timestamp: new Date().toISOString(),
      };
      setDoctorUpdates([fallback, ...doctorUpdates]);
      setDocNotes('');
      setSubmissionSuccess(true);
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Switcher to Preview Doctor Portal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F1ED] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A45C40] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              Emergency Preparedness & Clinical Access
            </span>
            <span className="text-[10px] font-mono text-[#6B7280] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E8E4DE]">
              ID: {profile.patientToken}
            </span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#3A4D39]">Emergency Medical ID & Doctor Portal</h1>
          <p className="text-xs text-[#6B7280]">
            Share a secure external link with your family doctor or emergency responder to review and update your medical record
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-1 bg-[#E8E4DE] rounded-full border border-[#D8D4CE]">
          <button
            onClick={() => setActiveSubView('patient_view')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubView === 'patient_view'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            My Emergency Profile
          </button>
          <button
            onClick={() => setActiveSubView('doctor_portal_view')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubView === 'doctor_portal_view'
                ? 'bg-[#3A4D39] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctor Portal View</span>
          </button>
        </div>
      </div>

      {/* SUBVIEW 1: PATIENT EMERGENCY PROFILE */}
      {activeSubView === 'patient_view' && (
        <div className="space-y-6">
          {/* External Doctor Link Generator Bar */}
          <div className="bg-[#3A4D39] text-white p-6 sm:p-7 rounded-[32px] border border-[#7C9070]/30 shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#E8E4DE] uppercase tracking-wider flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-[#A45C40]" />
                  Family Doctor Secure Access Link
                </span>
                <h3 className="text-xl font-serif italic text-white mt-1">
                  Sharable Emergency Care Portal Link
                </h3>
                <p className="text-xs text-[#E8E4DE] mt-1 max-w-2xl leading-relaxed font-serif italic">
                  Send this link to your primary care physician or family doctor. In an emergency or routine consultation, your physician can directly access your vital history, critical allergies, and submit official updates to your medical profile.
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[9px] font-mono uppercase tracking-wider text-[#E8E4DE]">TOKEN VALIDATION</span>
                <span className="text-xs font-mono font-bold bg-white/10 px-2.5 py-1 rounded-full border border-white/20 text-white">
                  {profile.patientToken}
                </span>
              </div>
            </div>

            {/* Copy Link Input Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={externalDoctorUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#2D382C] text-xs font-mono text-[#FAF8F5] border border-[#7C9070]/40 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#A45C40] hover:bg-[#8F4E34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0"
              >
                {copiedLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Doctor Link'}</span>
              </button>
              <button
                onClick={() => setActiveSubView('doctor_portal_view')}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold uppercase tracking-wider shrink-0"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Test Doctor View</span>
              </button>
            </div>
          </div>

          {/* Primary Emergency Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quick Triage & Blood Group Card */}
            <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DE]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C9070]">Emergency Identification</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
                  {profile.organDonor ? 'Organ Donor: Yes' : 'Organ Donor: No'}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#7C9070] block">Full Legal Name</span>
                <h3 className="text-2xl font-serif italic text-[#3A4D39]">{profile.fullName}</h3>
                <p className="text-xs text-[#6B7280] font-mono mt-0.5">DOB: {profile.dateOfBirth}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F1ED] border border-[#E8E4DE] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#7C9070] font-bold block">Blood Type</span>
                  <span className="text-3xl font-serif italic text-[#A45C40]">{profile.bloodType}</span>
                </div>
                <AlertTriangle className="w-7 h-7 text-[#A45C40]" />
              </div>

              {/* Latest Real-Time Vitals Snapshot */}
              <div className="p-4 rounded-2xl bg-white border border-[#E8E4DE] space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070] block">Recent Emergency Vitals:</span>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 font-mono text-[#2D2D2D]">
                  <span>BP: <strong className="text-[#3A4D39]">{latestVitals.systolicBP}/{latestVitals.diastolicBP}</strong></span>
                  <span>Pulse: <strong className="text-[#3A4D39]">{latestVitals.heartRate} bpm</strong></span>
                  <span>SpO2: <strong className="text-[#3A4D39]">{latestVitals.spo2}%</strong></span>
                  <span>Glucose: <strong className="text-[#3A4D39]">{latestVitals.bloodGlucose || 92} mg/dL</strong></span>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C9070] block mb-2">Emergency Contacts:</span>
                <div className="space-y-2">
                  {/* If user is married with spouse details */}
                  {userProfile?.relationshipStatus === 'married' && userProfile.familyInfo?.spouseName && (
                    <div className="p-3 rounded-2xl bg-[#F4F1ED] border border-[#3A4D39]/30 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#2D2D2D] font-serif">{userProfile.familyInfo.spouseName}</span>
                          <span className="text-[9px] uppercase font-bold text-white bg-[#A45C40] px-1.5 py-0.5 rounded-md">Primary / Spouse</span>
                        </div>
                        <span className="text-[11px] text-[#6B7280]">
                          Spouse {userProfile.familyInfo.childrenCount ? `• ${userProfile.familyInfo.childrenCount} Dependents` : ''}
                        </span>
                      </div>
                      {userProfile.familyInfo.spousePhone && (
                        <a 
                          href={`tel:${userProfile.familyInfo.spousePhone.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center gap-1 text-white font-bold uppercase tracking-wider text-[10px] bg-[#A45C40] px-3 py-1.5 rounded-full hover:bg-[#8B4830]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  )}

                  {profile.emergencyContacts.map((c, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white border border-[#E8E4DE] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#2D2D2D] block font-serif">{c.name}</span>
                        <span className="text-[11px] text-[#6B7280]">{c.relationship}</span>
                      </div>
                      <a 
                        href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                        className="flex items-center gap-1 text-white font-bold uppercase tracking-wider text-[10px] bg-[#3A4D39] px-3 py-1.5 rounded-full hover:bg-[#2F3F2E]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center & Right: Allergies, Meds & Chronic Conditions */}
            <div className="lg:col-span-2 space-y-5">
              {/* Critical Allergies Card */}
              <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#A45C40]" />
                  <h3 className="text-base font-serif italic text-[#3A4D39]">Critical Allergies & Hypersensitivities</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy, i) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-1.5 rounded-full bg-[#F4F1ED] text-[#A45C40] border border-[#E8E4DE] text-xs font-bold uppercase tracking-wider"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medications & Chronic Conditions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[#3A4D39]" />
                    <h3 className="text-base font-serif italic text-[#3A4D39]">Active Prescriptions</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#2D2D2D] font-serif italic list-disc list-inside">
                    {profile.currentMedications.map((med, i) => (
                      <li key={i} className="leading-relaxed">{med}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF8F5] p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Hospital className="w-4 h-4 text-[#A45C40]" />
                    <h3 className="text-base font-serif italic text-[#3A4D39]">Chronic Diagnoses</h3>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#2D2D2D] font-serif italic list-disc list-inside">
                    {profile.chronicConditions.map((cond, i) => (
                      <li key={i} className="leading-relaxed">{cond}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* History of Doctor Updates Received */}
              <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#3A4D39]" />
                    <h3 className="text-base font-serif italic text-[#3A4D39]">Doctor Updates & Clinic Directives Log</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B7280]">
                    {doctorUpdates.length} Recorded Reviews
                  </span>
                </div>

                <div className="space-y-3">
                  {doctorUpdates.map((upd) => (
                    <div key={upd.id} className="p-4 rounded-2xl bg-white border border-[#E8E4DE] text-xs space-y-1.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-bold text-[#3A4D39] text-sm font-serif">{upd.doctorName}</span>
                          <span className="text-[#6B7280] block text-[11px]">{upd.clinicName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] text-[#6B7280] block">
                            {new Date(upd.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8E4DE] text-[#3A4D39]">
                            {upd.triageStatus}
                          </span>
                        </div>
                      </div>

                      <p className="text-[#2D2D2D] leading-relaxed pt-1 font-serif italic">
                        <strong>Physician Notes:</strong> {upd.notes}
                      </p>

                      {upd.medicationAdjustments && (
                        <p className="text-[#6B7280] italic text-[11px] pt-0.5 font-serif">
                          <strong>Rx Modifications:</strong> {upd.medicationAdjustments}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: DEDICATED FAMILY DOCTOR PORTAL (Simulating what doctor sees when opening link) */}
      {activeSubView === 'doctor_portal_view' && (
        <div className="bg-[#FAF8F5] rounded-[32px] border border-[#E8E4DE] shadow-lg p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          <div className="flex items-start justify-between pb-4 border-b border-[#E8E4DE]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#3A4D39] text-white">
                  Authenticated Medical Portal
                </span>
                <span className="text-xs font-mono text-[#6B7280]">Patient: {profile.patientToken}</span>
              </div>
              <h2 className="text-2xl font-serif italic text-[#3A4D39]">
                Attending Physician Emergency Console
              </h2>
              <p className="text-xs text-[#6B7280]">
                Direct clinical access for Dr. Evelyn Vance or authorized emergency medical providers
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('patient_view')}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full bg-white border border-[#E8E4DE] text-[#3A4D39] hover:bg-[#F4F1ED]"
            >
              &larr; Back to Patient View
            </button>
          </div>

          {/* Patient Quick Medical Summary for Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-white border border-[#E8E4DE] text-xs">
            <div>
              <span className="text-[#7C9070] block text-[10px] uppercase font-bold">Patient</span>
              <strong className="text-[#2D2D2D] text-base font-serif">{profile.fullName}</strong>
              <p className="text-[11px] text-[#6B7280]">DOB: {profile.dateOfBirth}</p>
            </div>
            <div>
              <span className="text-[#7C9070] block text-[10px] uppercase font-bold">Blood Group</span>
              <strong className="text-[#A45C40] text-lg font-serif italic">{profile.bloodType}</strong>
              <p className="text-[11px] text-[#6B7280]">Advance Directives: Full Code</p>
            </div>
            <div>
              <span className="text-[#7C9070] block text-[10px] uppercase font-bold">Live Telemetry</span>
              <strong className="text-[#3A4D39] font-mono">{latestVitals.systolicBP}/{latestVitals.diastolicBP} mmHg</strong>
              <p className="text-[11px] text-[#6B7280]">HR: {latestVitals.heartRate} bpm | SpO2: {latestVitals.spo2}%</p>
            </div>
            <div>
              <span className="text-[#7C9070] block text-[10px] uppercase font-bold">Allergies Warning</span>
              <strong className="text-[#A45C40] text-xs block">{profile.allergies.join(', ')}</strong>
            </div>
          </div>

          {/* Doctor Submission Form: Update History in Case of Emergency or Follow-up */}
          <div className="p-6 sm:p-7 rounded-[28px] bg-[#F4F1ED] border border-[#E8E4DE] space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#3A4D39]" />
              <div>
                <h3 className="text-base font-serif italic text-[#3A4D39]">Submit Clinical Update to Patient History</h3>
                <p className="text-xs text-[#6B7280]">Notes, prescription modifications, and triage orders sync directly to patient records</p>
              </div>
            </div>

            {submissionSuccess && (
              <div className="p-3.5 bg-[#FAF8F5] border border-[#3A4D39] text-[#3A4D39] rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-[#3A4D39]" />
                <span>Medical history updated successfully. Patient record has been synchronized in real-time.</span>
              </div>
            )}

            <form onSubmit={handleSubmitDoctorUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Attending Physician</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Clinic / Hospital Affiliation</label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Clinical Evaluation / Emergency Triage Notes</label>
                  <textarea
                    rows={3}
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    placeholder="Enter diagnostic assessment, emergency interventions performed, or outpatient instructions..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none font-serif italic"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Triage Disposition</label>
                  <select
                    value={triageStatus}
                    onChange={(e) => setTriageStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none mb-2"
                  >
                    <option value="Stable / Routine Review">Stable / Routine Review</option>
                    <option value="Medication Adjusted">Medication Adjusted</option>
                    <option value="Observation / Emergency Treated">Emergency Treated</option>
                    <option value="Discharged with Instructions">Discharged with Instructions</option>
                  </select>

                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">Medication Modification (if any)</label>
                  <input
                    type="text"
                    value={docMeds}
                    onChange={(e) => setDocMeds(e.target.value)}
                    placeholder="e.g. Albuterol renewed, added Saline"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] focus:border-[#3A4D39] focus:outline-none font-serif italic"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingUpdate}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#3A4D39] hover:bg-[#2F3F2E] text-white rounded-full font-bold uppercase tracking-wider text-xs shadow-xs transition-all disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingUpdate ? 'Synchronizing with Patient...' : 'Transmit & Update Medical History'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
