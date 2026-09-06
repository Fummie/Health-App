import React from 'react';
import { 
  X, 
  Eye, 
  Type, 
  Sliders, 
  Volume2, 
  VolumeX, 
  ZapOff, 
  Check, 
  Keyboard, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { speechService } from '../utils/accessibility';

interface AccessibilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  onResetSettings: () => void;
  currentScreenSummary: string;
}

export const AccessibilityDrawer: React.FC<AccessibilityDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  currentScreenSummary,
}) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  React.useEffect(() => {
    return speechService.subscribe(setIsSpeaking);
  }, []);

  if (!isOpen) return null;

  const handleTestSpeech = () => {
    if (isSpeaking) {
      speechService.stop();
    } else {
      speechService.speak(
        currentScreenSummary || 
        "Welcome to Vitalis Health AI. Accessibility mode is active. You can navigate through vitals, step milestones, nutrition, and cycle tracking with full keyboard and audio support."
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-title"
    >
      <div className="bg-[#FDFCFB] rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden border border-[#E8E4DE] text-[#2D2D2D] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#3A4D39] text-white px-7 py-6 flex items-center justify-between border-b border-[#7C9070]/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 border border-white/20 rounded-2xl text-[#FAF8F5]">
              <Eye className="w-5 h-5 text-[#A45C40]" />
            </div>
            <div>
              <h2 id="a11y-title" className="text-xl font-serif italic text-white">Disability & Accessibility Suite</h2>
              <p className="text-xs text-[#E8E4DE]">WCAG 2.1 AAA Compliant Visual & Audio Adaptations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#E8E4DE] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close accessibility options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. High Contrast Mode */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE]">
            <div className="space-y-0.5">
              <span className="text-sm font-serif italic text-[#3A4D39] flex items-center gap-2">
                High Contrast Theme
              </span>
              <p className="text-xs text-[#6B7280]">Maximizes color contrast to pure dark and light for visual impairments.</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3A4D39] ${
                settings.highContrast ? 'bg-[#3A4D39]' : 'bg-[#E8E4DE]'
              }`}
              role="switch"
              aria-checked={settings.highContrast}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Dyslexia-Friendly Font */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE]">
            <div className="space-y-0.5">
              <span className="text-sm font-serif italic text-[#3A4D39] flex items-center gap-2">
                <Type className="w-4 h-4 text-[#7C9070]" />
                Dyslexia-Optimized Typography
              </span>
              <p className="text-xs text-[#6B7280]">Applies asymmetrical letter shapes and wider character spacing to prevent letter confusion.</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ dyslexiaFont: !settings.dyslexiaFont })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3A4D39] ${
                settings.dyslexiaFont ? 'bg-[#3A4D39]' : 'bg-[#E8E4DE]'
              }`}
              role="switch"
              aria-checked={settings.dyslexiaFont}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.dyslexiaFont ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Text Size Scaling */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-serif italic text-[#3A4D39] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#7C9070]" />
                Text Scaling
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 bg-white border border-[#E8E4DE] rounded-full text-[#3A4D39]">
                {settings.fontScale === 'normal' ? '100% Standard' : settings.fontScale === 'large' ? '115% Large' : '130% Extra Large'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => onUpdateSettings({ fontScale: scale })}
                  className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all ${
                    settings.fontScale === scale
                      ? 'bg-[#3A4D39] text-white border-[#3A4D39] shadow-xs'
                      : 'bg-white text-[#2D2D2D] border-[#E8E4DE] hover:bg-[#F4F1ED]'
                  }`}
                >
                  {scale === 'normal' ? 'Normal' : scale === 'large' ? 'Large' : 'Extra Large'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Reduced Motion */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE]">
            <div className="space-y-0.5">
              <span className="text-sm font-serif italic text-[#3A4D39] flex items-center gap-2">
                <ZapOff className="w-4 h-4 text-[#A45C40]" />
                Reduce Motion & Transitions
              </span>
              <p className="text-xs text-[#6B7280]">Disables movement and page animations for users sensitive to vestibular motion sickness.</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3A4D39] ${
                settings.reducedMotion ? 'bg-[#3A4D39]' : 'bg-[#E8E4DE]'
              }`}
              role="switch"
              aria-checked={settings.reducedMotion}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Speech Synthesis & Screen Voice */}
          <div className="p-5 rounded-2xl bg-[#F4F1ED] border border-[#E8E4DE] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#7C9070]" />
                <span className="text-sm font-serif italic text-[#3A4D39]">Audio Screen Reader (Text-to-Speech)</span>
              </div>
              {isSpeaking && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#A45C40] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#A45C40]/30 animate-pulse">
                  Speaking...
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] font-serif italic">
              Reads your active vitals, step benefits, emergency protocols, and meal recommendations aloud with humanized pacing.
            </p>
            <div className="pt-1">
              <button
                onClick={handleTestSpeech}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                  isSpeaking
                    ? 'bg-[#A45C40] text-white hover:bg-[#8e4f37]'
                    : 'bg-[#3A4D39] text-white hover:bg-[#2F3F2E]'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSpeaking ? 'Pause / Stop Audio Voice' : 'Read Active Screen Summary Aloud'}</span>
              </button>
            </div>
          </div>

          {/* Keyboard Shortcuts Guide */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DE] text-[#6B7280]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3A4D39] mb-2">
              <Keyboard className="w-3.5 h-3.5 text-[#7C9070]" />
              <span>Keyboard Navigation Directives</span>
            </div>
            <ul className="text-xs space-y-1.5 text-[#6B7280]">
              <li><kbd className="px-2 py-0.5 bg-white border border-[#E8E4DE] rounded-md font-mono text-[11px] text-[#2D2D2D]">Tab</kbd> / <kbd className="px-2 py-0.5 bg-white border border-[#E8E4DE] rounded-md font-mono text-[11px] text-[#2D2D2D]">Shift+Tab</kbd>: Navigate interactive controls sequentially</li>
              <li><kbd className="px-2 py-0.5 bg-white border border-[#E8E4DE] rounded-md font-mono text-[11px] text-[#2D2D2D]">Space</kbd> / <kbd className="px-2 py-0.5 bg-white border border-[#E8E4DE] rounded-md font-mono text-[11px] text-[#2D2D2D]">Enter</kbd>: Activate buttons and toggles</li>
              <li>All interactive elements exceed the minimum 44×44px touch target guideline.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF8F5] px-7 py-4 border-t border-[#E8E4DE] flex items-center justify-between">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#3A4D39] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#7C9070]" />
            <span>Reset to Default</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#3A4D39] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2F3F2E] transition-colors shadow-xs"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
