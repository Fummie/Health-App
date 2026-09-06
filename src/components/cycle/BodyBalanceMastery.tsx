import React from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Dumbbell, 
  Flame, 
  ShieldCheck, 
  Activity, 
  Heart,
  TrendingUp,
  Apple
} from 'lucide-react';
import { Gender } from '../../types';

interface BodyBalanceMasteryProps {
  gender: Gender;
  currentPhase: string;
}

export const BodyBalanceMastery: React.FC<BodyBalanceMasteryProps> = ({
  gender,
  currentPhase,
}) => {
  return (
    <div className="bg-white p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E4DE]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DE]">
              Biological Homeostasis
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DE]">
              Preventative Endocrinology
            </span>
          </div>
          <h3 className="text-xl font-serif italic text-[#2D2D2D]">
            Body in Perfect Balance: Masterclass & Bio-Insights
          </h3>
          <p className="text-xs text-[#6B7280]">
            Evidence-based clinical guidelines to calibrate your endocrine, nervous, and musculoskeletal systems into optimal harmony
          </p>
        </div>
      </div>

      {/* Grid of Balance Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Pillar 1: Phase-Locked Movement */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[#3A4D39]/10 text-[#3A4D39]">
                <Dumbbell className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Movement & Training Sync
              </h4>
            </div>
            <p className="text-xs text-[#4A4A48] leading-relaxed">
              {gender === 'female' 
                ? 'Your muscle protein synthesis and tendon stiffness shift across cycle phases. Match progressive overload lifts to Follicular/Ovulatory phases, and transition to restorative mobility, yoga, and Zone 2 walks during Menstrual and Late Luteal.'
                : 'For men, testosterone is highest between 7:00 AM and 10:00 AM. Schedule compound lifts or high-demand athletic output in the morning to leverage peak androgen receptor activation.'}
            </p>
          </div>
          <div className="text-[10px] font-semibold text-[#3A4D39] pt-2 border-t border-[#E8E4DE]">
            Key Takeaway: Never fight your biological fatigue; adjust volume, not commitment.
          </div>
        </div>

        {/* Pillar 2: Circadian Light & Melatonin Anchoring */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
                <Sun className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Circadian Light Anchoring
              </h4>
            </div>
            <p className="text-xs text-[#4A4A48] leading-relaxed">
              Viewing 10-15 minutes of outdoor sunlight within 30 minutes of waking triggers a healthy cortisol awakening response (CAR) and sets the timer for nightly melatonin release. This stabilizes the pituitary-gonadal axis, promoting regular ovulation and high testosterone.
            </p>
          </div>
          <div className="text-[10px] font-semibold text-amber-800 pt-2 border-t border-[#E8E4DE]">
            Key Takeaway: Avoid overhead artificial lights after 9:00 PM to preserve deep sleep.
          </div>
        </div>

        {/* Pillar 3: Basal Metabolic Rate & Caloric Needs */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[#A45C40]/10 text-[#A45C40]">
                <Flame className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Metabolic & Caloric Shifts
              </h4>
            </div>
            <p className="text-xs text-[#4A4A48] leading-relaxed">
              During the luteal phase, elevated progesterone raises basal body temperature by ~0.3-0.5°C and boosts basal metabolic rate by 100-300 kcal/day. Craving more food is physiologically normal! Fulfill it with slow complex carbs (sweet potatoes, oats, squash) rather than refined sugar.
            </p>
          </div>
          <div className="text-[10px] font-semibold text-[#A45C40] pt-2 border-t border-[#E8E4DE]">
            Key Takeaway: Fuel the metabolic thermogenic burn; do not enforce harsh deficits.
          </div>
        </div>

        {/* Pillar 4: Autonomic & Vagal Relaxation */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-700">
                <Heart className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Pelvic Vagal Decompression
              </h4>
            </div>
            <p className="text-xs text-[#4A4A48] leading-relaxed">
              Chronic stress elevates cortisol, which can steal raw pregnenolone substrate from sex hormones (the "pregnenolone steal" effect). Practice 3 minutes of diaphragmatic pelvic floor breathing: deep belly in-breath, slow elongated exhale to activate the vagus nerve and release pelvic tension.
            </p>
          </div>
          <div className="text-[10px] font-semibold text-indigo-800 pt-2 border-t border-[#E8E4DE]">
            Key Takeaway: 3 double-inhale sighs instantly breaks sympathetic vascular spasms.
          </div>
        </div>

        {/* Pillar 5: Micronutrient Density & Detox */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700">
                <Apple className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Liver Phase II Estrogen Clearance
              </h4>
            </div>
            <p className="text-xs text-[#4A4A48] leading-relaxed">
              Excess circulating estrogen must be conjugated in the liver and eliminated through the bowel. Ingest cruciferous vegetables (broccoli sprouts containing sulforaphane, indole-3-carbinol) and 30g daily fiber to prevent re-absorption of estrogens that cause severe breast tenderness and cramps.
            </p>
          </div>
          <div className="text-[10px] font-semibold text-emerald-800 pt-2 border-t border-[#E8E4DE]">
            Key Takeaway: Healthy regular bowel transit is mandatory for hormonal equilibrium.
          </div>
        </div>

        {/* Pillar 6: Endocrine Disruptor Elimination */}
        <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E4DE] space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-700">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D2D2D]">
                Xenoestrogen Defense
              </h4>
            </div>
            <p className="text-xs text-[#4A4A48] leading-relaxed">
              BPA in plastic food containers and phthalates in synthetic fragrances mimic estrogen in the human body, disrupting natural feedback loops. Drink exclusively from glass or stainless steel and avoid heating foods in soft plastics.
            </p>
          </div>
          <div className="text-[10px] font-semibold text-rose-800 pt-2 border-t border-[#E8E4DE]">
            Key Takeaway: Protect your hormone receptors from chemical counterfeits.
          </div>
        </div>
      </div>
    </div>
  );
};
