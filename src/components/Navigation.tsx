import React from 'react';
import { 
  HeartPulse, 
  Footprints, 
  Moon,
  UtensilsCrossed, 
  Repeat, 
  ShieldAlert, 
  Bluetooth, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Eye, 
  Lock, 
  CheckCircle2, 
  Wifi,
  Menu,
  X,
  HeartHandshake,
  Users
} from 'lucide-react';
import { BluetoothWearableState, AccessibilitySettings, UserProfile } from '../types';

export type ActiveSegment = 
  | 'vitals' 
  | 'steps' 
  | 'sleep'
  | 'nutrition' 
  | 'cycle' 
  | 'emergency' 
  | 'wearables' 
  | 'ai_assistant';

interface NavigationProps {
  activeSegment: ActiveSegment;
  onSelectSegment: (segment: ActiveSegment) => void;
  wearableState: BluetoothWearableState;
  onOpenAccessibility: () => void;
  onOpenAuth: () => void;
  onOpenOnboarding: () => void;
  onOpenProfile: () => void;
  userProfile: UserProfile;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  a11y: AccessibilitySettings;
  activeAlertCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeSegment,
  onSelectSegment,
  wearableState,
  onOpenAccessibility,
  onOpenAuth,
  onOpenOnboarding,
  onOpenProfile,
  userProfile,
  isSpeaking,
  onToggleSpeech,
  a11y,
  activeAlertCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'vitals' as ActiveSegment, label: 'Vitals & Telemetry', icon: HeartPulse },
    { id: 'steps' as ActiveSegment, label: 'Steps & Benefits', icon: Footprints },
    { id: 'sleep' as ActiveSegment, label: 'Sleep & Alarms', icon: Moon },
    { id: 'nutrition' as ActiveSegment, label: 'Nutrition & Recipes', icon: UtensilsCrossed },
    { id: 'cycle' as ActiveSegment, label: 'Cycle Tracking', icon: Repeat },
    { id: 'emergency' as ActiveSegment, label: 'Doctor & Emergency', icon: ShieldAlert },
    { id: 'wearables' as ActiveSegment, label: 'Wearable Sync', icon: Bluetooth },
    { id: 'ai_assistant' as ActiveSegment, label: 'AI Concierge', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCFB]/95 backdrop-blur-md text-[#2D2D2D] border-b border-[#E8E4DE] shadow-xs">
      {/* Top Banner / Status Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onSelectSegment('vitals')}
              className="flex items-center gap-3 text-left group focus:outline-none rounded-2xl p-1"
              aria-label="Vitalis Health AI Home"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#EAE7E2] border border-[#D8D4CE] flex items-center justify-center text-[#3A4D39] shadow-xs group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5 text-[#3A4D39]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl text-[#3A4D39] italic font-normal tracking-tight">
                    Vitalis AI
                  </span>
                  <span className="bg-[#FAF8F5] px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest text-[#7C9070] border border-[#E8E4DE]">
                    Precision
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-[#7C9070] font-semibold">Tailored Health Intelligence</p>
              </div>
            </button>
          </div>

          {/* Quick Status Badges & Universal Accessibility Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Bluetooth Live Status */}
            <button
              onClick={() => onSelectSegment('wearables')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                wearableState.isConnected 
                  ? 'bg-[#FAF8F5] text-[#A45C40] border-[#E8E4DE] shadow-xs' 
                  : 'bg-[#F4F1ED] text-[#6B7280] border-[#E8E4DE] hover:bg-[#EAE7E2]'
              }`}
              title="Bluetooth Wearable Monitor"
            >
              <Bluetooth className={`w-3.5 h-3.5 ${wearableState.isConnected ? 'text-[#A45C40] animate-pulse' : 'text-[#6B7280]'}`} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {wearableState.isConnected ? (wearableState.deviceName || 'Oura • Active') : 'Wearable Standby'}
              </span>
              {wearableState.isConnected && wearableState.liveHeartRate && (
                <span className="font-serif italic text-xs text-[#3A4D39] ml-0.5">
                  {wearableState.liveHeartRate} bpm
                </span>
              )}
            </button>

            {/* AI Customization Profile Indicator */}
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4F1ED] hover:bg-[#EAE7E2] text-[#3A4D39] border border-[#E8E4DE] transition-all"
              title="Recalibrate AI Health Profile"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A45C40]" />
              <span className="text-[11px] uppercase tracking-wider font-bold">AI Protocol</span>
            </button>

            {/* Read Aloud / Speech Synthesis Trigger */}
            <button
              onClick={onToggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                isSpeaking 
                  ? 'bg-[#A45C40] text-white border-[#A45C40] animate-pulse' 
                  : 'bg-[#F4F1ED] text-[#3A4D39] hover:bg-[#EAE7E2] border-[#E8E4DE]'
              }`}
              aria-label={isSpeaking ? 'Stop speech readout' : 'Read current screen aloud'}
              title="Disability Audio Readout"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#7C9070]" />}
              <span className="text-[11px] uppercase tracking-wider font-bold">{isSpeaking ? 'Speaking' : 'Audio'}</span>
            </button>

            {/* Accessibility Suite Trigger */}
            <button
              onClick={onOpenAccessibility}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                a11y.highContrast || a11y.dyslexiaFont || a11y.fontScale !== 'normal'
                  ? 'bg-[#3A4D39] text-white border-[#3A4D39]'
                  : 'bg-[#F4F1ED] text-[#3A4D39] hover:bg-[#EAE7E2] border-[#E8E4DE]'
              }`}
              aria-label="Accessibility settings"
              title="Accessibility & Disability Mode"
            >
              <Eye className="w-3.5 h-3.5 text-[#7C9070]" />
              <span className="text-[11px] uppercase tracking-wider font-bold">A11y</span>
            </button>

            {/* Secure Vault / Privacy */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#3A4D39] hover:bg-[#2F3F2E] text-white transition-all shadow-xs"
              title="Secure Vault & Cloud Privacy"
            >
              <Lock className="w-3 h-3 text-[#E8E4DE]" />
              <span className="text-[10px]">Vault</span>
            </button>

            {/* User Avatar & Profile Trigger */}
            <button 
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#FAF8F5] border border-[#D8D4CE] hover:border-[#3A4D39] transition-all group shadow-2xs text-left"
              title={`Patient Profile & Family Record: ${userProfile.name} (${userProfile.relationshipStatus || 'Single'})`}
              aria-label="Open User Profile and Family Settings"
            >
              <div className="w-8 h-8 rounded-full bg-[#E8E4DE] border border-[#D8D4CE] flex items-center justify-center text-[#3A4D39] font-serif italic text-sm overflow-hidden shrink-0 group-hover:ring-2 group-hover:ring-[#3A4D39]/30 transition-all">
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
              <div className="hidden lg:block leading-tight">
                <span className="text-xs font-bold text-[#2D2D2D] block truncate max-w-[90px]">
                  {userProfile.name.split(' ')[0]}
                </span>
                <span className="text-[9px] uppercase font-semibold text-[#7C9070] tracking-wider block">
                  {userProfile.relationshipStatus === 'married' ? 'Married' : userProfile.relationshipStatus === 'in_relationship' ? 'Partner' : 'Profile'}
                </span>
              </div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleSpeech}
              className="p-2 rounded-xl bg-[#F4F1ED] border border-[#E8E4DE] text-[#3A4D39]"
              aria-label="Read page aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-[#A45C40]" /> : <Volume2 className="w-4 h-4 text-[#7C9070]" />}
            </button>
            <button
              onClick={onOpenAccessibility}
              className="p-2 rounded-xl bg-[#F4F1ED] border border-[#E8E4DE] text-[#3A4D39]"
              aria-label="Accessibility options"
            >
              <Eye className="w-4 h-4 text-[#7C9070]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#F4F1ED] border border-[#E8E4DE] text-[#3A4D39] hover:bg-[#EAE7E2]"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Sub-bar: Primary Health Segments Pill Bar */}
        <div className="pb-3 overflow-x-auto no-scrollbar">
          <nav className="bg-[#F4F1ED] p-1.5 rounded-2xl border border-[#E8E4DE] inline-flex min-w-full md:min-w-0 space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSegment === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSegment(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'bg-[#3A4D39] text-white shadow-xs'
                      : 'text-[#6B7280] hover:text-[#3A4D39] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FDFCFB]' : 'text-[#7C9070]'}`} />
                  <span>{item.label}</span>
                  {item.id === 'vitals' && activeAlertCount > 0 && (
                    <span className="flex items-center gap-1 bg-rose-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      {activeAlertCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E8E4DE] px-4 pt-2 pb-4 space-y-2">
          <div className="grid grid-cols-1 gap-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSegment === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectSegment(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider w-full text-left transition-colors ${
                    isActive
                      ? 'bg-[#3A4D39] text-white'
                      : 'text-[#6B7280] hover:bg-[#F4F1ED]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#7C9070]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'vitals' && activeAlertCount > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full animate-pulse">
                      Alert Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile Quick Card in Mobile Drawer */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8E4DE] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#E8E4DE] overflow-hidden flex items-center justify-center text-[#3A4D39] font-serif italic text-base">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{userProfile.name?.charAt(0) || 'V'}</span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-[#2D2D2D] block">{userProfile.name}</span>
                <span className="text-[10px] text-[#7C9070] font-medium block">
                  {userProfile.relationshipStatus === 'married' ? 'Married (Family Plan)' : userProfile.relationshipStatus || 'Single'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onOpenProfile();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-1 rounded-xl bg-[#3A4D39] text-white text-[11px] font-bold uppercase tracking-wider"
            >
              Edit Profile
            </button>
          </div>

          <div className="pt-3 border-t border-[#E8E4DE] flex flex-wrap gap-2">
            <button
              onClick={() => {
                onOpenOnboarding();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#F4F1ED] text-[#3A4D39] border border-[#E8E4DE]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A45C40]" />
              <span>AI Protocol</span>
            </button>
            <button
              onClick={() => {
                onOpenAuth();
                setMobileMenuOpen(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#3A4D39] text-white"
            >
              <Lock className="w-3.5 h-3.5 text-[#E8E4DE]" />
              <span>Privacy Vault</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
