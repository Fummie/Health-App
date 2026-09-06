import React, { useState, useRef } from 'react';
import { 
  User, 
  Upload, 
  Camera, 
  Trash2, 
  Heart, 
  Users, 
  HeartHandshake, 
  ShieldCheck, 
  Plus, 
  X, 
  Check, 
  Sparkles, 
  Calendar, 
  Phone, 
  FileText,
  AlertCircle,
  Baby,
  Activity,
  Award
} from 'lucide-react';
import { 
  UserProfile, 
  RelationshipStatus, 
  FamilyInformation, 
  ChildDependentInfo,
  Gender, 
  HealthGoal, 
  ActivityLevel, 
  DietaryPreference 
} from '../types';
import { PRESET_AVATARS } from '../data/defaultData';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onOpenOnboarding?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onOpenOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'health'>('profile');
  
  // Local editable form state initialized from current userProfile
  const [formData, setFormData] = useState<UserProfile>(() => ({
    ...userProfile,
    relationshipStatus: userProfile.relationshipStatus || 'single',
    familyInfo: userProfile.familyInfo || {
      spouseName: '',
      spouseAge: undefined,
      spouseDateOfBirth: '',
      spouseBloodType: 'O Positive (O+)',
      spousePhone: '',
      anniversaryDate: '',
      yearsMarried: 0,
      hasChildren: false,
      childrenCount: 0,
      children: [],
      emergencyDesignation: true,
      familyMedicalHistory: '',
      householdDietaryNotes: '',
    }
  }));

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState<number | ''>('');
  const [newChildGender, setNewChildGender] = useState<'female' | 'male' | 'other'>('female');
  const [newChildBloodType, setNewChildBloodType] = useState('O Positive (O+)');
  const [newChildNotes, setNewChildNotes] = useState('');
  const [showAddChildForm, setShowAddChildForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle custom image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: event.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: undefined,
    }));
  };

  const handleSelectPresetAvatar = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      avatarUrl: url,
    }));
  };

  // Relationship status change handler
  const handleRelationshipStatusChange = (status: RelationshipStatus) => {
    setFormData((prev) => {
      const isNowMarried = status === 'married' || status === 'domestic_partnership';
      return {
        ...prev,
        relationshipStatus: status,
        familyInfo: prev.familyInfo || {
          spouseName: '',
          spouseAge: undefined,
          spouseDateOfBirth: '',
          spouseBloodType: 'O Positive (O+)',
          spousePhone: '',
          anniversaryDate: '',
          yearsMarried: 0,
          hasChildren: false,
          childrenCount: 0,
          children: [],
          emergencyDesignation: true,
          familyMedicalHistory: '',
          householdDietaryNotes: '',
        }
      };
    });
    // Auto-switch to family tab if married is chosen
    if (status === 'married') {
      setActiveTab('family');
    }
  };

  // Spouse & family detail updates
  const updateFamilyInfo = (updates: Partial<FamilyInformation>) => {
    setFormData((prev) => ({
      ...prev,
      familyInfo: {
        ...(prev.familyInfo || {
          spouseName: '',
          emergencyDesignation: true,
        }),
        ...updates,
      }
    }));
  };

  // Calculate years married if anniversary date is set
  const calculateYearsMarried = (anniversaryDateStr?: string) => {
    if (!anniversaryDateStr) return null;
    const anniv = new Date(anniversaryDateStr);
    if (isNaN(anniv.getTime())) return null;
    const diffMs = Date.now() - anniv.getTime();
    const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
    return Math.max(0, diffYears);
  };

  // Add Child
  const handleAddChild = () => {
    if (!newChildName.trim()) return;

    const newChild: ChildDependentInfo = {
      id: `child_${Date.now()}`,
      name: newChildName.trim(),
      age: typeof newChildAge === 'number' ? newChildAge : undefined,
      gender: newChildGender,
      bloodType: newChildBloodType,
      notes: newChildNotes.trim() || undefined,
    };

    const currentChildren = formData.familyInfo?.children || [];
    const updatedChildren = [...currentChildren, newChild];

    updateFamilyInfo({
      children: updatedChildren,
      childrenCount: updatedChildren.length,
      hasChildren: true,
    });

    setNewChildName('');
    setNewChildAge('');
    setNewChildNotes('');
    setShowAddChildForm(false);
  };

  // Remove Child
  const handleRemoveChild = (childId: string) => {
    const currentChildren = formData.familyInfo?.children || [];
    const updatedChildren = currentChildren.filter((c) => c.id !== childId);
    updateFamilyInfo({
      children: updatedChildren,
      childrenCount: updatedChildren.length,
      hasChildren: updatedChildren.length > 0,
    });
  };

  // BMI calculation
  const heightM = (formData.heightCm || 170) / 100;
  const bmi = formData.weightKg ? (formData.weightKg / (heightM * heightM)).toFixed(1) : '22.0';

  // Save changes
  const handleSave = () => {
    // If anniversary is provided, compute years married
    let finalFamilyInfo = formData.familyInfo;
    if (finalFamilyInfo?.anniversaryDate) {
      const calculated = calculateYearsMarried(finalFamilyInfo.anniversaryDate);
      if (calculated !== null) {
        finalFamilyInfo = {
          ...finalFamilyInfo,
          yearsMarried: calculated,
        };
      }
    }

    const updated: UserProfile = {
      ...formData,
      familyInfo: finalFamilyInfo,
    };

    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const isMarried = formData.relationshipStatus === 'married' || formData.relationshipStatus === 'domestic_partnership';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-[#3A4D39] text-white px-7 py-5 flex items-center justify-between border-b border-[#7C9070]/30 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-2xl text-[#FAF8F5]">
              <User className="w-5 h-5 text-[#A45C40]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="profile-modal-title" className="text-xl font-serif italic text-white">Patient Profile & Family Record</h2>
                {isMarried && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#A45C40] text-white">
                    Family Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#E8E4DE]">Manage biometrics, profile picture, marital status, and family medical context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close profile modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Strip */}
        <div className="bg-[#F4F1ED] px-7 pt-3 border-b border-[#E8E4DE] flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'profile'
                ? 'bg-[#FDFCFB] text-[#3A4D39] border-[#3A4D39] shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D] border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Biometrics</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 relative ${
              activeTab === 'family'
                ? 'bg-[#FDFCFB] text-[#3A4D39] border-[#3A4D39] shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D] border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Relationship & Family</span>
            {isMarried && (
              <span className="w-2 h-2 rounded-full bg-[#A45C40]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'health'
                ? 'bg-[#FDFCFB] text-[#3A4D39] border-[#3A4D39] shadow-xs'
                : 'text-[#6B7280] hover:text-[#2D2D2D] border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A45C40]" />
            <span>Health & Lifestyle Targets</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Profile & Biometrics */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Profile Picture & Avatar Selector */}
              <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E8E4DE] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#3A4D39] flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#7C9070]" />
                      Profile Picture & Identity
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-0.5">Upload your own photo or choose from curated natural aesthetics.</p>
                  </div>
                  {formData.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-[#A45C40] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Current Active Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-[#3A4D39] bg-[#EAE7E2] shadow-sm flex items-center justify-center">
                      {formData.avatarUrl ? (
                        <img 
                          src={formData.avatarUrl} 
                          alt={formData.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-serif italic text-3xl text-[#3A4D39]">
                          {formData.name.charAt(0) || 'V'}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-[#3A4D39] text-white rounded-full shadow-md hover:bg-[#2F3F2E] transition-all"
                      title="Upload New Photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* Actions and Preset Gallery */}
                  <div className="flex-1 space-y-3 w-full">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#3A4D39] rounded-xl border border-[#D8D4CE] text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#7C9070]" />
                        <span>Upload Custom Photo</span>
                      </button>
                      <span className="text-[11px] text-[#6B7280]">Supports JPG, PNG, WebP</span>
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#7C9070] block mb-1.5">
                        Or pick a curated aesthetic portrait
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {PRESET_AVATARS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPresetAvatar(preset.url)}
                            className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 transition-transform hover:scale-105 ${
                              formData.avatarUrl === preset.url 
                                ? 'border-[#A45C40] ring-2 ring-[#A45C40]/30 scale-105' 
                                : 'border-[#E8E4DE] opacity-80 hover:opacity-100'
                            }`}
                            title={preset.label}
                          >
                            <img 
                              src={preset.url} 
                              alt={preset.label} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information & Biometrics Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                    Full Legal / Preferred Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                    placeholder="e.g. Alex Morgan Reed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                    placeholder="alex@vitalis.health"
                  />
                </div>

                {/* Biological Sex */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                    Biological Sex (For Endocrine Modeling)
                  </label>
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
                      Female (Infradian)
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
                      Male (Diurnal)
                    </button>
                  </div>
                </div>

                {/* Blood Type */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                    Blood Type & Rh Factor
                  </label>
                  <select
                    value={formData.bloodType || 'O Positive (O+)'}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                  >
                    {['O Positive (O+)', 'O Negative (O-)', 'A Positive (A+)', 'A Negative (A-)', 'B Positive (B+)', 'B Negative (B-)', 'AB Positive (AB+)', 'AB Negative (AB-)'].map(bt => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="115"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 30 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                  />
                </div>

                {/* Weight & Height with live BMI */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="250"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) || 65 })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="240"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) || 170 })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DE] bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* BMI indicator card */}
              <div className="p-4 bg-[#F4F1ED] rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#3A4D39] text-white rounded-xl">
                    <Activity className="w-4 h-4 text-[#FAF8F5]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                      Calculated Body Mass Index (BMI): {bmi}
                    </span>
                    <p className="text-[11px] text-[#6B7280]">
                      Standard healthy range: 18.5 – 24.9 kg/m². Used for baseline metabolic rate calibration.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#3A4D39] text-white">
                  Normal Range
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Relationship Status & Family Information */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              {/* Relationship Status Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-2">
                  Current Relationship Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'single', label: 'Single', icon: User },
                    { id: 'in_relationship', label: 'In a Relationship', icon: Heart },
                    { id: 'married', label: 'Married', icon: HeartHandshake },
                    { id: 'domestic_partnership', label: 'Domestic Partnership', icon: Users },
                    { id: 'divorced', label: 'Divorced', icon: User },
                    { id: 'widowed', label: 'Widowed', icon: User },
                    { id: 'prefer_not_to_say', label: 'Prefer Not to Say', icon: User },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = formData.relationshipStatus === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleRelationshipStatusChange(item.id as RelationshipStatus)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-xs'
                            : 'bg-white text-[#2D2D2D] border-[#E8E4DE] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#FAF8F5]' : 'text-[#7C9070]'}`} />
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider leading-tight">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC FAMILY INFORMATION (WHEN MARRIED OR DOMESTIC PARTNERSHIP) */}
              {isMarried ? (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Banner for Family Module */}
                  <div className="bg-[#FAF8F5] p-4.5 rounded-3xl border border-[#E8E4DE] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#A45C40] text-white rounded-2xl">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[#3A4D39]">
                          Family Information & Spousal Health Record
                        </h4>
                        <p className="text-xs text-[#6B7280]">
                          Married status unlocks household health synchronization, emergency spousal designations, and pediatric notes.
                        </p>
                      </div>
                    </div>
                    {formData.familyInfo?.anniversaryDate && (
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8E4DE] rounded-full text-xs font-serif italic text-[#3A4D39]">
                        <Calendar className="w-3.5 h-3.5 text-[#A45C40]" />
                        Anniversary: {formData.familyInfo.anniversaryDate}
                      </span>
                    )}
                  </div>

                  {/* Section A: Spouse Information */}
                  <div className="bg-white p-5 rounded-3xl border border-[#E8E4DE] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A4D39] flex items-center gap-2">
                        <Heart className="w-4 h-4 text-[#A45C40]" />
                        Spouse Profile & Primary Next of Kin
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[#3A4D39] font-medium">
                        <input
                          type="checkbox"
                          checked={formData.familyInfo?.emergencyDesignation ?? true}
                          onChange={(e) => updateFamilyInfo({ emergencyDesignation: e.target.checked })}
                          className="rounded text-[#3A4D39] focus:ring-[#3A4D39] w-4 h-4"
                        />
                        <span>Designate as primary emergency contact</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                          Spouse's Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.familyInfo?.spouseName || ''}
                          onChange={(e) => updateFamilyInfo({ spouseName: e.target.value })}
                          placeholder="e.g. Morgan Reed"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                          Spouse's Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#7C9070] absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={formData.familyInfo?.spousePhone || ''}
                            onChange={(e) => updateFamilyInfo({ spousePhone: e.target.value })}
                            placeholder="+1 (555) 234-5678"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                            Spouse Age
                          </label>
                          <input
                            type="number"
                            min="18"
                            max="115"
                            value={formData.familyInfo?.spouseAge ?? ''}
                            onChange={(e) => updateFamilyInfo({ spouseAge: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="34"
                            className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#3A4D39] text-sm text-[#2D2D2D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                            Spouse Blood Type
                          </label>
                          <select
                            value={formData.familyInfo?.spouseBloodType || 'A Positive (A+)'}
                            onChange={(e) => updateFamilyInfo({ spouseBloodType: e.target.value })}
                            className="w-full px-2.5 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#3A4D39] text-xs text-[#2D2D2D] outline-none"
                          >
                            {['A Positive (A+)', 'A Negative (A-)', 'B Positive (B+)', 'B Negative (B-)', 'O Positive (O+)', 'O Negative (O-)', 'AB Positive (AB+)', 'AB Negative (AB-)'].map(bt => (
                              <option key={bt} value={bt}>{bt}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                            Wedding Anniversary
                          </label>
                          <input
                            type="date"
                            value={formData.familyInfo?.anniversaryDate || ''}
                            onChange={(e) => updateFamilyInfo({ anniversaryDate: e.target.value })}
                            className="w-full px-3 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white focus:ring-2 focus:ring-[#3A4D39] text-xs text-[#2D2D2D] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                            Years Married
                          </label>
                          <div className="px-3 py-2.5 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] text-xs font-serif italic text-[#3A4D39] flex items-center justify-between">
                            <span>
                              {calculateYearsMarried(formData.familyInfo?.anniversaryDate) ?? formData.familyInfo?.yearsMarried ?? 0} Years
                            </span>
                            <Award className="w-3.5 h-3.5 text-[#A45C40]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Children & Dependents */}
                  <div className="bg-white p-5 rounded-3xl border border-[#E8E4DE] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8E4DE] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-[#3A4D39]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                          Children & Dependents ({formData.familyInfo?.children?.length || 0})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddChildForm(!showAddChildForm)}
                        className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 bg-[#F4F1ED] hover:bg-[#EAE7E2] text-[#3A4D39] rounded-xl border border-[#E8E4DE] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#A45C40]" />
                        <span>{showAddChildForm ? 'Cancel' : 'Add Child'}</span>
                      </button>
                    </div>

                    {/* Inline Add Child Form */}
                    {showAddChildForm && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#D8D4CE] space-y-3 animate-in fade-in duration-150">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39] block">
                          New Child / Dependent Record
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <input
                            type="text"
                            placeholder="Child's Full Name"
                            value={newChildName}
                            onChange={(e) => setNewChildName(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs outline-none focus:ring-2 focus:ring-[#3A4D39]"
                          />
                          <input
                            type="number"
                            placeholder="Age"
                            min="0"
                            max="30"
                            value={newChildAge}
                            onChange={(e) => setNewChildAge(e.target.value ? Number(e.target.value) : '')}
                            className="px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs outline-none focus:ring-2 focus:ring-[#3A4D39]"
                          />
                          <select
                            value={newChildGender}
                            onChange={(e) => setNewChildGender(e.target.value as any)}
                            className="px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs outline-none"
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <select
                            value={newChildBloodType}
                            onChange={(e) => setNewChildBloodType(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs outline-none"
                          >
                            {['O Positive (O+)', 'O Negative (O-)', 'A Positive (A+)', 'A Negative (A-)', 'B Positive (B+)', 'B Negative (B-)', 'AB Positive (AB+)'].map(bt => (
                              <option key={bt} value={bt}>{bt}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Health notes (e.g. peanut allergy, asthma)"
                            value={newChildNotes}
                            onChange={(e) => setNewChildNotes(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-[#E8E4DE] bg-white text-xs outline-none focus:ring-2 focus:ring-[#3A4D39]"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddChildForm(false)}
                            className="px-3 py-1.5 rounded-xl border border-[#E8E4DE] text-xs font-semibold text-[#6B7280] hover:bg-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddChild}
                            className="px-4 py-1.5 rounded-xl bg-[#3A4D39] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E]"
                          >
                            Save Child
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Children List */}
                    {formData.familyInfo?.children && formData.familyInfo.children.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {formData.familyInfo.children.map((child) => (
                          <div 
                            key={child.id}
                            className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE] flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-[#2D2D2D]">{child.name}</span>
                                {child.age !== undefined && (
                                  <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-[#E8E4DE] text-[#3A4D39] font-medium">
                                    {child.age} yrs
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-2">
                                <span>{child.gender}</span>
                                <span>•</span>
                                <span>{child.bloodType}</span>
                              </div>
                              {child.notes && (
                                <p className="text-[11px] text-[#A45C40] mt-1 font-serif italic">
                                  {child.notes}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveChild(child.id)}
                              className="p-1.5 text-[#6B7280] hover:text-[#A45C40] transition-colors"
                              title="Remove Child Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#D8D4CE] text-center">
                        <Baby className="w-5 h-5 text-[#7C9070] mx-auto mb-1 opacity-60" />
                        <p className="text-xs text-[#6B7280]">No children or dependents currently listed.</p>
                        <p className="text-[11px] text-[#7C9070]">Click "Add Child" above to record children details for family health modeling.</p>
                      </div>
                    )}
                  </div>

                  {/* Section C: Household Health & Hereditary Context */}
                  <div className="bg-white p-5 rounded-3xl border border-[#E8E4DE] space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#3A4D39] flex items-center gap-2 border-b border-[#E8E4DE] pb-2.5">
                      <FileText className="w-4 h-4 text-[#7C9070]" />
                      Household Nutrition & Hereditary Medical Context
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                          Family & Hereditary Medical History
                        </label>
                        <textarea
                          rows={3}
                          value={formData.familyInfo?.familyMedicalHistory || ''}
                          onChange={(e) => updateFamilyInfo({ familyMedicalHistory: e.target.value })}
                          placeholder="e.g. Maternal history of hypertension; family longevity into late 90s; no early cardiac incidents..."
                          className="w-full p-3 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white text-xs text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                        />
                        <span className="text-[10px] text-[#6B7280]">Informs preventative AI longevity recommendations.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-1">
                          Household Dietary & Meal Preferences
                        </label>
                        <textarea
                          rows={3}
                          value={formData.familyInfo?.householdDietaryNotes || ''}
                          onChange={(e) => updateFamilyInfo({ householdDietaryNotes: e.target.value })}
                          placeholder="e.g. Nut-aware home for kids, low sodium dinners for spouse, shared Mediterranean recipes..."
                          className="w-full p-3 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] focus:bg-white text-xs text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                        />
                        <span className="text-[10px] text-[#6B7280]">Used to tailor the Nutrition & Recipes meal planner.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Non-Married information card */
                <div className="p-6 bg-[#FAF8F5] rounded-3xl border border-[#E8E4DE] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#EAE7E2] flex items-center justify-center text-[#3A4D39] mx-auto">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#3A4D39]">
                    Individual Health Profile Active
                  </h4>
                  <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                    Your account is set to <span className="font-semibold text-[#2D2D2D]">{formData.relationshipStatus?.replace('_', ' ')}</span>.
                    If your status changes to "Married" or "Domestic Partnership", Vitalis AI unlocks joint family health tracking, spouse emergency contact link, and pediatric dependents.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Health & Lifestyle Targets */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-2">
                  Primary Longevity & Health Goal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'longevity', title: 'Longevity & Cellular Health', desc: 'Mitochondrial efficiency, BDNF, all-cause mortality reduction' },
                    { id: 'cardio', title: 'Cardiovascular Resilience', desc: 'Blood pressure control, HRV, nitric oxide optimization' },
                    { id: 'metabolic_fitness', title: 'Metabolic & Glycemic Balance', desc: 'Insulin sensitivity, stable energy, body composition' },
                    { id: 'hormonal_balance', title: 'Endocrine & Cycle Harmony', desc: 'Testosterone or Menstrual phase bio-synchronization' },
                    { id: 'stress_reduction', title: 'Stress & Autonomic Recovery', desc: 'Vagal nerve tone, restorative deep sleep, cortisol regulation' },
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
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-2">
                  Baseline Physical Activity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sedentary', label: 'Desk / Sedentary' },
                    { id: 'moderate', label: 'Moderate' },
                    { id: 'active', label: 'Very Active' },
                    { id: 'athlete', label: 'Athletic' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, activityLevel: lvl.id as ActivityLevel })}
                      className={`py-2 px-2 text-center rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
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

              {/* Dietary Preference */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7C9070] mb-2">
                  Dietary Philosophy
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'mediterranean', label: 'Mediterranean' },
                    { id: 'omnivore', label: 'Whole-Food Omnivore' },
                    { id: 'plant_based', label: 'Plant-Based' },
                    { id: 'low_gi', label: 'Low-Glycemic Index' },
                    { id: 'keto', label: 'Ketogenic / Low-Carb' },
                    { id: 'gluten_free', label: 'Gluten-Free' },
                  ].map((diet) => (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dietaryPreference: diet.id as DietaryPreference })}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
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

              {/* AI Protocol Recalibration Trigger */}
              {onOpenOnboarding && (
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-[#A45C40]" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#3A4D39]">
                        Full Gemini AI Calibration Wizard
                      </span>
                      <p className="text-[11px] text-[#6B7280]">
                        Launch the 3-step AI protocol generator to recalculate your macros and step targets.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOnboarding();
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#3A4D39] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E] transition-all"
                  >
                    Run Wizard
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF8F5] px-7 py-4 border-t border-[#E8E4DE] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#E8E4DE] text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#3A4D39] hover:bg-white transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-[#3A4D39] flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4 text-[#3A4D39]" />
                Profile & Family Saved!
              </span>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#3A4D39] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E] transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#E8E4DE]" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
