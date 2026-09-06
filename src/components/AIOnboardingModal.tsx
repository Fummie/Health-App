import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Check, 
  Activity, 
  Heart, 
  Compass, 
  Apple, 
  ShieldCheck, 
  Loader2,
  X,
  Camera,
  Upload,
  HeartHandshake,
  Users
} from 'lucide-react';
import { UserProfile, AIProtocol, Gender, HealthGoal, ActivityLevel, DietaryPreference, RelationshipStatus } from '../types';
import { PRESET_AVATARS } from '../data/defaultData';

interface AIOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfileAndProtocol: (profile: UserProfile, protocol: AIProtocol) => void;
}

export const AIOnboardingModal: React.FC<AIOnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfileAndProtocol,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<UserProfile>({ 
    ...currentProfile,
    relationshipStatus: currentProfile.relationshipStatus || 'single',
    familyInfo: currentProfile.familyInfo || {
      spouseName: '',
      spousePhone: '',
      anniversaryDate: '',
      hasChildren: false,
      childrenCount: 0,
      emergencyDesignation: true,
      familyMedicalHistory: '',
      householdDietaryNotes: '',
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, avatarUrl: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleGenerateProtocol = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/ai/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: formData }),
      });

      const data = await response.json();
      if (data.success && data.protocol) {
        onSaveProfileAndProtocol({ ...formData, isOnboarded: true }, data.protocol);
        onClose();
      } else {
        throw new Error(data.error || 'Failed to calibrate AI protocol');
      }
    } catch (err: any) {
      console.warn('AI onboarding fallback:', err);
      // Fallback protocol if network or server error
      const fallbackProtocol: AIProtocol = {
        summary: `Welcome, ${formData.name || 'Friend'}. Your bio-adaptive health protocol is calibrated for ${formData.primaryGoal}.`,
        dailyStepTarget: formData.activityLevel === 'sedentary' ? 6500 : formData.activityLevel === 'moderate' ? 8500 : 10500,
        calorieTarget: formData.gender === 'female' ? 1950 : 2350,
        macroRatio: { protein: 30, carbs: 40, fats: 30 },
        waterTargetLiters: 2.8,
        priorityFocus: [
          'Post-prandial 10-min walks to flatten glycemic excursions',
          'Circadian alignment with morning sunlight within 45 mins of waking',
          'Anti-inflammatory whole food nutrition with optimal magnesium'
        ],
        aiHealthQuote: "Consistency in small physiological baselines generates lifelong metabolic compounding."
      };
      onSaveProfileAndProtocol({ ...formData, isOnboarded: true }, fallbackProtocol);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-xl w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] animate-in fade-in zoom-in-95 duration-150">
        {/* Banner Header */}
        <div className="bg-[#3A4D39] text-white px-7 py-6 flex items-center justify-between border-b border-[#7C9070]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-2xl text-[#FAF8F5]">
              <Sparkles className="w-5 h-5 text-[#A45C40]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="onboarding-title" className="text-xl font-serif italic text-white">AI Health Calibration</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/15 text-[#FAF8F5] border border-white/20">
                  Step {step} of 3
                </span>
              </div>
              <p className="text-xs text-[#E8E4DE]">Intelligent preventative initialization for your biological profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close onboarding modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="w-full bg-[#E8E4DE] h-1.5">
          <div 
            className="bg-[#A45C40] h-1.5 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 max-h-[70vh] overflow-y-auto space-y-6">
          {/* STEP 1: Biometrics & Gender */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-serif italic text-[#3A4D39]">Biological Demographics</h3>
                <p className="text-xs text-[#6B7280]">Essential for metabolic rate calculation and endocrine cycle tracking.</p>
              </div>

              {/* Profile Photo Selector */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8E4DE]">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#3A4D39] bg-[#EAE7E2] shrink-0 flex items-center justify-center">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif italic text-xl text-[#3A4D39]">
                        {formData.name.charAt(0) || 'V'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">Profile Picture</span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#A45C40] hover:underline flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" />
                        Upload
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {PRESET_AVATARS.slice(0, 6).map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, avatarUrl: preset.url })}
                          className={`w-7 h-7 rounded-full overflow-hidden shrink-0 border transition-all ${
                            formData.avatarUrl === preset.url ? 'border-[#A45C40] ring-1 ring-[#A45C40]' : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Preferred Name / Call-sign</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Jordan"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] focus:border-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                />
              </div>

              {/* Relationship Status & Family Information */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Relationship Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'single', label: 'Single' },
                    { id: 'in_relationship', label: 'In Relationship' },
                    { id: 'married', label: 'Married' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, relationshipStatus: st.id as RelationshipStatus })}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.relationshipStatus === st.id
                          ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-xs'
                          : 'bg-white border-[#E8E4DE] text-[#2D2D2D] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* When Married, Added Family Information */}
              {(formData.relationshipStatus === 'married' || formData.relationshipStatus === 'domestic_partnership') && (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-[#A45C40]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                      Added Family Information (Married Status)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                        Spouse's Name
                      </label>
                      <input
                        type="text"
                        value={formData.familyInfo?.spouseName || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyInfo: {
                            ...(formData.familyInfo || { emergencyDesignation: true }),
                            spouseName: e.target.value
                          }
                        })}
                        placeholder="e.g. Morgan Reed"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                        Spouse Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.familyInfo?.spousePhone || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyInfo: {
                            ...(formData.familyInfo || { emergencyDesignation: true }),
                            spousePhone: e.target.value
                          }
                        })}
                        placeholder="+1 (555) 234-5678"
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                        Anniversary Date
                      </label>
                      <input
                        type="date"
                        value={formData.familyInfo?.anniversaryDate || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyInfo: {
                            ...(formData.familyInfo || { emergencyDesignation: true }),
                            anniversaryDate: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                        Children / Dependents Count
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="12"
                        value={formData.familyInfo?.childrenCount ?? 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          familyInfo: {
                            ...(formData.familyInfo || { emergencyDesignation: true }),
                            childrenCount: Number(e.target.value) || 0,
                            hasChildren: (Number(e.target.value) || 0) > 0,
                          }
                        })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                      Family Medical / Dietary Considerations
                    </label>
                    <input
                      type="text"
                      value={formData.familyInfo?.familyMedicalHistory || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        familyInfo: {
                          ...(formData.familyInfo || { emergencyDesignation: true }),
                          familyMedicalHistory: e.target.value
                        }
                      })}
                      placeholder="e.g. Nut-free home, maternal mild hypertension, pediatric asthma..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs text-[#2D2D2D] outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Biological Sex</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.gender === 'female'
                          ? 'bg-[#A45C40] border-[#A45C40] text-white shadow-xs'
                          : 'bg-white border-[#E8E4DE] text-[#2D2D2D] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      Female
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.gender === 'male'
                          ? 'bg-[#3A4D39] border-[#3A4D39] text-white shadow-xs'
                          : 'bg-white border-[#E8E4DE] text-[#2D2D2D] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      Male
                    </button>
                  </div>
                  <p className="text-[11px] text-[#6B7280] mt-1.5 font-serif italic">
                    {formData.gender === 'female' 
                      ? 'Calibrates Menstrual cycle phases & hormone balancing.' 
                      : 'Calibrates Testosterone diurnal rhythm & vitality curve.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Age</label>
                  <input
                    type="number"
                    min="16"
                    max="110"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 30 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    min="35"
                    max="250"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) || 70 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Height (cm)</label>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) || 175 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goals & Activity Level */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-serif italic text-[#3A4D39]">Primary Health & Longevity Focus</h3>
                <p className="text-xs text-[#6B7280]">The AI will adapt your daily step benefits and macronutrients to this target.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { id: 'longevity', title: 'Longevity & Cellular Health', desc: 'Mitochondrial efficiency, BDNF, all-cause mortality reduction' },
                  { id: 'cardio', title: 'Cardiovascular Resilience', desc: 'Blood pressure control, HRV, nitric oxide optimization' },
                  { id: 'metabolic_fitness', title: 'Metabolic & Glycemic Balance', desc: 'Insulin sensitivity, stable energy, body composition' },
                  { id: 'hormonal_balance', title: 'Endocrine & Cycle Harmony', desc: 'Testosterone or Menstrual phase bio-synchronization' },
                  { id: 'stress_reduction', title: 'Stress & Autonomic Nervous Recovery', desc: 'Vagal nerve tone, restorative deep sleep, cortisol regulation' },
                  { id: 'weight_loss', title: 'Sustainable Fat Oxidation', desc: 'Metabolic rate preservation & gentle caloric deficit' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryGoal: item.id as HealthGoal })}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      formData.primaryGoal === item.id
                        ? 'bg-[#F4F1ED] border-[#3A4D39] ring-2 ring-[#3A4D39]/20'
                        : 'bg-white border-[#E8E4DE] hover:border-[#7C9070]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3A4D39]">{item.title}</span>
                      {formData.primaryGoal === item.id && <Check className="w-3.5 h-3.5 text-[#3A4D39]" />}
                    </div>
                    <p className="text-[11px] text-[#6B7280] mt-1 font-serif italic">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Daily Physical Activity Baseline</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sedentary', label: 'Desk / Low' },
                    { id: 'moderate', label: 'Moderate' },
                    { id: 'active', label: 'Very Active' },
                    { id: 'athlete', label: 'Athletic' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, activityLevel: lvl.id as ActivityLevel })}
                      className={`py-2 px-1.5 text-center rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                        formData.activityLevel === lvl.id
                          ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                          : 'bg-white text-[#2D2D2D] border-[#E8E4DE] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Dietary Preference & Finish */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-serif italic text-[#3A4D39]">Nutritional Calibration</h3>
                <p className="text-xs text-[#6B7280]">Tailors healthy recipe suggestions and macronutrient targets.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-2">Nutritional Philosophy</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'mediterranean', label: 'Mediterranean (Anti-inflammatory)' },
                    { id: 'omnivore', label: 'Whole-Food Omnivore' },
                    { id: 'plant_based', label: 'Plant-Based / Vegan' },
                    { id: 'low_gi', label: 'Low-Glycemic Index' },
                    { id: 'keto', label: 'Ketogenic / Low-Carb' },
                    { id: 'gluten_free', label: 'Gluten-Free Gut Focus' },
                  ].map((diet) => (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dietaryPreference: diet.id as DietaryPreference })}
                      className={`p-3 rounded-xl border text-xs font-medium text-left transition-all ${
                        formData.dietaryPreference === diet.id
                          ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                          : 'bg-white text-[#2D2D2D] border-[#E8E4DE] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {diet.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#F4F1ED] rounded-2xl border border-[#E8E4DE] text-[#3A4D39] space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#7C9070]" />
                  <span>Clinical Customization Ready</span>
                </div>
                <p className="text-xs text-[#6B7280] font-serif italic">
                  Vitalis AI will now compute your personalized daily step milestones, target macronutrients, cycle synchronization advice, and health benefit forecasts.
                </p>
              </div>

              {errorMessage && (
                <p className="text-xs text-[#A45C40] bg-[#FAF8F5] p-3 rounded-xl border border-[#A45C40]/30 font-serif italic">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-[#FAF8F5] px-7 py-4 border-t border-[#E8E4DE] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#3A4D39] transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#3A4D39]"
            >
              Skip for Now
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#3A4D39] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E] transition-all shadow-xs"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerateProtocol}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3A4D39] text-white border border-[#3A4D39] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E] transition-all shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E8E4DE]" />
                  <span>Calibrating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#A45C40]" />
                  <span>Generate AI Health Protocol</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
