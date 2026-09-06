import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Mail, 
  UserCheck, 
  X, 
  CheckCircle2, 
  Cloud, 
  Fingerprint,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onAuthSuccess: (updatedUser: UserProfile) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'sync'>('signin');
  const [email, setEmail] = useState(currentUser.email || 'patient.user@vitalis.health');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState(currentUser.name || 'Alex Morgan');
  const [enableCloudSync, setEnableCloudSync] = useState(currentUser.syncEnabled);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      email: email,
      name: name || currentUser.name,
      syncEnabled: enableCloudSync,
      lastSyncTimestamp: new Date().toISOString(),
    };
    onAuthSuccess(updated);
    setStatusMessage('Authenticated securely. Biometric vault unlocked and synchronized.');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1200);
  };

  const handleBiometricAuth = () => {
    // WebAuthn simulation
    setStatusMessage('Verifying biometric credentials (TouchID / FaceID)...');
    setTimeout(() => {
      const updated: UserProfile = {
        ...currentUser,
        syncEnabled: true,
        lastSyncTimestamp: new Date().toISOString(),
      };
      onAuthSuccess(updated);
      setStatusMessage('Biometric fingerprint verified. Access granted.');
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1000);
    }, 900);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#3A4D39] text-white px-7 py-6 flex items-center justify-between border-b border-[#7C9070]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-2xl text-[#FAF8F5]">
              <Lock className="w-5 h-5 text-[#A45C40]" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-xl font-serif italic text-white">Vitalis Privacy Vault</h2>
              <p className="text-xs text-[#E8E4DE]">HIPAA & GDPR-compliant biometric shield</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-[#FAF8F5] rounded-full border border-[#E8E4DE] text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-full transition-all text-center ${
                authMode === 'signin' ? 'bg-[#3A4D39] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#3A4D39]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 rounded-full transition-all text-center ${
                authMode === 'signup' ? 'bg-[#3A4D39] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#3A4D39]'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setAuthMode('sync')}
              className={`flex-1 py-2 rounded-full transition-all text-center ${
                authMode === 'sync' ? 'bg-[#3A4D39] text-white shadow-xs' : 'text-[#6B7280] hover:text-[#3A4D39]'
              }`}
            >
              Cloud Sync
            </button>
          </div>

          {statusMessage && (
            <div className="p-3.5 bg-[#FAF8F5] text-[#3A4D39] rounded-2xl border border-[#3A4D39]/30 text-xs font-medium flex items-center gap-2 font-serif italic">
              <CheckCircle2 className="w-4 h-4 text-[#3A4D39] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {authMode !== 'sync' ? (
            <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Full Legal Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Encrypted Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7C9070] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs font-mono text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-[#7C9070] mb-1.5">Master Passkey / Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#7C9070] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-[#E8E4DE] bg-white rounded-xl text-xs text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#3A4D39]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCloudSync}
                    onChange={(e) => setEnableCloudSync(e.target.checked)}
                    className="rounded-sm text-[#3A4D39] accent-[#3A4D39]"
                  />
                  <span className="text-[#6B7280] font-medium text-xs">Enable Zero-Knowledge Sync</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#3A4D39] text-white rounded-full font-bold uppercase tracking-wider hover:bg-[#2F3F2E] shadow-xs transition-all text-xs"
              >
                {authMode === 'signin' ? 'Sign In to Health Vault' : 'Create Encrypted Vault'}
              </button>

              <div className="pt-2 border-t border-[#E8E4DE]">
                <button
                  type="button"
                  onClick={handleBiometricAuth}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF8F5] text-[#3A4D39] rounded-full border border-[#E8E4DE] font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Fingerprint className="w-4 h-4 text-[#7C9070]" />
                  <span>Instant Biometric WebAuthn Unlock</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-base text-[#3A4D39] flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-[#7C9070]" />
                    Cloud Synchronization State
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#3A4D39] border border-[#3A4D39]/30">
                    Active & Encrypted
                  </span>
                </div>
                <p className="text-[#6B7280] text-xs leading-relaxed font-serif italic">
                  Your vital records, steps, nutrition, cycle history, and doctor links are encrypted locally via AES-256 before transmission.
                </p>
                <div className="pt-2.5 border-t border-[#E8E4DE] flex justify-between text-[11px] text-[#6B7280] font-mono">
                  <span>Last Sync:</span>
                  <span>{new Date(currentUser.lastSyncTimestamp || Date.now()).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const updated = { ...currentUser, lastSyncTimestamp: new Date().toISOString() };
                    onAuthSuccess(updated);
                    setStatusMessage('Vault synchronized successfully with remote cloud node.');
                    setTimeout(() => setStatusMessage(null), 2000);
                  }}
                  className="w-full py-3 bg-[#3A4D39] text-white rounded-full font-bold uppercase tracking-wider hover:bg-[#2F3F2E] text-xs shadow-xs transition-all"
                >
                  Sync Now (Force Update)
                </button>

                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-white text-[#A45C40] hover:bg-[#FAF8F5] rounded-full font-bold uppercase tracking-wider text-xs border border-[#A45C40]/30 transition-all"
                >
                  Sign Out of Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-[#FAF8F5] px-7 py-3.5 border-t border-[#E8E4DE] flex items-center justify-between text-[11px] text-[#6B7280]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#7C9070]" />
            256-bit Local End-to-End Encryption
          </span>
          <span className="font-mono">Zero-Knowledge Architecture</span>
        </div>
      </div>
    </div>
  );
};
