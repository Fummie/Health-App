import React, { useState } from 'react';
import { 
  Heart, 
  Users, 
  UserPlus, 
  Sparkles, 
  Droplet, 
  Zap, 
  Send, 
  Check, 
  Clock, 
  X, 
  Calendar,
  Smile,
  AlertCircle,
  Coffee,
  Bed,
  Utensils
} from 'lucide-react';
import { PartnerCycleInfo, PartnerCareToken, Gender } from '../../types';
import { DEFAULT_PARTNER_INFO } from '../../data/defaultData';

interface PartnerCareHubProps {
  userGender: Gender;
  partner?: PartnerCycleInfo | null;
  onPartnerChange?: (partner: PartnerCycleInfo | null) => void;
}

export const PartnerCareHub: React.FC<PartnerCareHubProps> = ({ 
  userGender,
  partner: externalPartner,
  onPartnerChange
}) => {
  const [partner, setPartner] = useState<PartnerCycleInfo | null>(() => {
    if (externalPartner !== undefined) return externalPartner;
    try {
      const saved = localStorage.getItem('vitalis_partner_cycle_info');
      return saved ? JSON.parse(saved) : DEFAULT_PARTNER_INFO;
    } catch {
      return DEFAULT_PARTNER_INFO;
    }
  });

  // Sync if external changes
  React.useEffect(() => {
    if (externalPartner !== undefined) {
      setPartner(externalPartner);
    }
  }, [externalPartner]);

  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState<boolean>(false);
  const [newPartnerName, setNewPartnerName] = useState<string>('');
  const [newPartnerRelationship, setNewPartnerRelationship] = useState<string>('Life Partner');
  const [newPartnerGender, setNewPartnerGender] = useState<Gender>(userGender === 'male' ? 'female' : 'male');
  const [newPartnerCycleDay, setNewPartnerCycleDay] = useState<number>(21);

  // State for sending care token animation
  const [sentTokenSuccess, setSentTokenSuccess] = useState<string | null>(null);

  // Save to localStorage when partner changes
  const savePartner = (updated: PartnerCycleInfo | null) => {
    setPartner(updated);
    if (onPartnerChange) {
      onPartnerChange(updated);
    }
    if (updated) {
      localStorage.setItem('vitalis_partner_cycle_info', JSON.stringify(updated));
    } else {
      localStorage.removeItem('vitalis_partner_cycle_info');
    }
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;

    let initialPhase = 'Follicular Phase';
    if (newPartnerGender === 'female') {
      if (newPartnerCycleDay <= 5) initialPhase = 'Menstrual Phase (Rest)';
      else if (newPartnerCycleDay <= 12) initialPhase = 'Follicular Phase (Rising Energy)';
      else if (newPartnerCycleDay <= 16) initialPhase = 'Ovulatory Phase (Peak Vitality)';
      else initialPhase = 'Luteal Phase (Progesterone Nourish)';
    } else {
      initialPhase = 'Diurnal Endocrine Balance';
    }

    const createdPartner: PartnerCycleInfo = {
      id: `partner_${Date.now()}`,
      name: newPartnerName.trim(),
      relationship: newPartnerRelationship.trim() || 'Partner',
      gender: newPartnerGender,
      currentCycleDay: newPartnerCycleDay,
      currentPhase: initialPhase,
      moodToday: newPartnerGender === 'female' && newPartnerCycleDay >= 20 ? 'Sensitive & Needs Rest' : 'Balanced & Energetic',
      symptomsToday: newPartnerGender === 'female' && newPartnerCycleDay >= 20 ? ['Mild Cramping', 'Pelvic Heaviness'] : ['Normal vitality'],
      careNeeds: newPartnerGender === 'female' ? [
        'Brew warm soothing herbal tea (ginger / chamomile)',
        'Provide quiet space and run a warm bath or heating pad',
        'Prepare warm nutrient-rich whole food dinner'
      ] : [
        'Support healthy morning light exposure & morning workout',
        'Allow 8 hours of uninterrupted nocturnal recovery',
        'Balanced protein dinner without late-night alcohol'
      ],
      avoidList: newPartnerGender === 'female' ? [
        'Demanding high-stakes arguments during late evening',
        'Last-minute chaotic social plans when fatigued',
        'Cold drinks or high-sodium fast food'
      ] : [
        'Excessive late-night blue screen exposure',
        'Skipping balanced meals before resistance training'
      ],
      recommendedMeal: 'Warm Spiced Coconut Golden Milk Nightcap & Quinoa Salmon Bowl',
      lastUpdated: 'Just now',
      receivedCareTokens: []
    };

    savePartner(createdPartner);
    setIsAddPartnerModalOpen(false);
    setNewPartnerName('');
  };

  const handleSendCareToken = (tokenLabel: string, message: string) => {
    if (!partner) return;

    const newToken: PartnerCareToken = {
      id: `token_${Date.now()}`,
      from: 'You',
      token: tokenLabel,
      message,
      timestamp: 'Just now'
    };

    const updated: PartnerCycleInfo = {
      ...partner,
      receivedCareTokens: [newToken, ...(partner.receivedCareTokens || [])]
    };

    savePartner(updated);
    setSentTokenSuccess(tokenLabel);
    setTimeout(() => setSentTokenSuccess(null), 3000);
  };

  return (
    <div className="bg-[#FAF8F5] p-6 sm:p-7 rounded-[32px] border border-[#E8E4DE] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#A45C40] bg-white px-3 py-1 rounded-full border border-[#E8E4DE]">
              Mutual Biology Sync
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-white px-3 py-1 rounded-full border border-[#E8E4DE]">
              Empathetic Connection
            </span>
          </div>
          <h2 className="text-2xl font-serif italic text-[#2D2D2D]">
            Partner Cycle Synchronization & Care Hub
          </h2>
          <p className="text-xs text-[#6B7280]">
            Connect with your partner to understand their biological rhythm, anticipate their physical needs, and nurture each other with proper care.
          </p>
        </div>

        {partner ? (
          <button
            onClick={() => setIsAddPartnerModalOpen(true)}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#F4F1ED] text-[#3A4D39] text-xs font-bold border border-[#D8D4CE] transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Partner</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddPartnerModalOpen(true)}
            className="px-4 py-2 rounded-full bg-[#A45C40] hover:bg-[#8F4F36] text-white text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Partner</span>
          </button>
        )}
      </div>

      {/* Success notification banner */}
      {sentTokenSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Care token "{sentTokenSuccess}" sent to {partner?.name}! They have been notified with your warm support.</span>
        </div>
      )}

      {/* Partner Active View */}
      {partner ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Partner Profile & Current Cycle Status */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E4DE] space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DE]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-tr from-[#A45C40] to-[#E8B4A2] flex items-center justify-center text-white font-serif italic text-lg font-bold shadow-xs">
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif italic font-bold text-base text-[#2D2D2D]">
                    {partner.name}
                  </h3>
                  <span className="text-[11px] text-[#6B7280]">
                    {partner.relationship} • {partner.gender === 'female' ? 'Menstrual Infradian Rhythm' : 'Diurnal Testosterone Rhythm'}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono text-[#7C9070] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E8E4DE]">
                Live Sync
              </span>
            </div>

            {/* Current Phase Badge */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Current Phase:</span>
                <span className="font-bold text-[#A45C40] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  {partner.currentPhase}
                </span>
              </div>
              {partner.currentCycleDay && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B7280]">Cycle Day:</span>
                  <span className="font-mono font-bold text-[#3A4D39]">
                    Day {partner.currentCycleDay} of 28
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B7280]">Reported Mood:</span>
                <span className="font-medium text-[#2D2D2D]">
                  {partner.moodToday}
                </span>
              </div>
            </div>

            {/* Reported Symptoms */}
            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280] mb-1.5">
                Current Physical Sensations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {partner.symptomsToday && partner.symptomsToday.length > 0 ? (
                  partner.symptomsToday.map((sym, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-[#F4F1ED] text-[#4A4A48] px-2.5 py-1 rounded-full border border-[#E8E4DE]"
                    >
                      {sym}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#6B7280]">No active discomfort reported</span>
                )}
              </div>
            </div>

            {/* Quick Token Care Actions */}
            <div className="pt-2 border-t border-[#E8E4DE] space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#3A4D39] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#A45C40]" />
                <span>Send One-Click Care Gesture</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendCareToken('🍵 Warm Tea', 'Brewed a cup of warm chamomile & ginger tea for you.')}
                  className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 text-[11px] font-medium text-[#4A4A48] hover:text-[#A45C40] border border-[#E8E4DE] hover:border-rose-300 transition-all text-left flex items-center gap-1.5"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Send Warm Tea</span>
                </button>

                <button
                  onClick={() => handleSendCareToken('🛁 Warm Bath', 'Prepared a soothing warm magnesium bath for your recovery.')}
                  className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 text-[11px] font-medium text-[#4A4A48] hover:text-[#A45C40] border border-[#E8E4DE] hover:border-rose-300 transition-all text-left flex items-center gap-1.5"
                >
                  <Droplet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Warm Bath</span>
                </button>

                <button
                  onClick={() => handleSendCareToken('🍲 Cooked Meal', 'Making an anti-inflammatory nourishing dinner for us tonight.')}
                  className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 text-[11px] font-medium text-[#4A4A48] hover:text-[#A45C40] border border-[#E8E4DE] hover:border-rose-300 transition-all text-left flex items-center gap-1.5"
                >
                  <Utensils className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Dinner Done</span>
                </button>

                <button
                  onClick={() => handleSendCareToken('💛 Rest Notice', 'Taking care of chores tonight. Relax and rest!')}
                  className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 text-[11px] font-medium text-[#4A4A48] hover:text-[#A45C40] border border-[#E8E4DE] hover:border-rose-300 transition-all text-left flex items-center gap-1.5"
                >
                  <Bed className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Rest Tonight</span>
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column: Empathetic Care Guide & What Partner Needs */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E4DE] space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DE]">
              <span className="p-1 rounded-md bg-[#A45C40]/10 text-[#A45C40]">
                <Heart className="w-4 h-4 fill-current" />
              </span>
              <h4 className="text-sm font-bold text-[#2D2D2D] uppercase tracking-wider">
                How to Care for {partner.name} Today
              </h4>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-[#3A4D39]">
                ✨ Highest-Impact Actions for this Stage:
              </div>
              <ul className="space-y-2 text-xs text-[#4A4A48]">
                {partner.careNeeds?.map((need, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E4DE]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{need}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-[#E8E4DE] space-y-2">
              <div className="text-xs font-bold text-[#A45C40] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>What to Avoid Doing or Saying:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[#6B7280]">
                {partner.avoidList?.map((avoid, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-rose-50/50 p-2 rounded-xl border border-rose-100 text-rose-900">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{avoid}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Recommended Comfort Meal & Care History */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E4DE] space-y-4 shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E8E4DE]">
                <span className="p-1 rounded-md bg-[#7C9070]/10 text-[#7C9070]">
                  <Utensils className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-bold text-[#2D2D2D] uppercase tracking-wider">
                  Nourishing Meal to Prepare
                </h4>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] space-y-1.5">
                <span className="text-xs font-serif italic font-bold text-[#3A4D39] block">
                  {partner.recommendedMeal}
                </span>
                <p className="text-[11px] text-[#6B7280] leading-relaxed">
                  Packed with anti-spasmodic magnesium, turmeric curcumin, and clean complex carbohydrates to soothe uterine muscle contractions and stabilize GABA neurotransmitters.
                </p>
              </div>

              {/* Sent Care Tokens History */}
              <div className="pt-2 border-t border-[#E8E4DE] space-y-2">
                <div className="text-[11px] uppercase tracking-wider font-bold text-[#6B7280]">
                  Mutual Care Moments
                </div>

                {partner.receivedCareTokens && partner.receivedCareTokens.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {partner.receivedCareTokens.map((t) => (
                      <div key={t.id} className="p-2 bg-[#FAF8F5] rounded-xl border border-[#E8E4DE] text-[11px]">
                        <div className="flex items-center justify-between font-bold text-[#2D2D2D] mb-0.5">
                          <span>{t.token}</span>
                          <span className="text-[9px] font-mono text-[#A0A09C]">{t.timestamp}</span>
                        </div>
                        <p className="text-[#6B7280] text-[10px] leading-tight">{t.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-[#A0A09C]">
                    No tokens sent yet today. Send a loving gesture above!
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => savePartner(null)}
              className="mt-2 text-[10px] text-red-500 hover:text-red-700 underline text-center"
            >
              Disconnect Partner Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-[#E8E4DE] text-center space-y-3">
          <Heart className="w-10 h-10 text-[#A45C40] mx-auto opacity-70" />
          <h3 className="font-serif italic text-lg text-[#2D2D2D]">No Partner Connected Yet</h3>
          <p className="text-xs text-[#6B7280] max-w-md mx-auto">
            Connect your partner to sync each other's cycles. You will be able to see when they are in high energy vs deep recovery, how to alleviate cramps, and which meals nurture their body.
          </p>
          <button
            onClick={() => setIsAddPartnerModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#A45C40] text-white text-xs font-bold shadow-xs hover:bg-[#8F4F36] transition-all"
          >
            Connect Partner Now
          </button>
        </div>
      )}

      {/* Add / Edit Partner Modal */}
      {isAddPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[28px] border border-[#E8E4DE] max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DE]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#A45C40]" />
                <h3 className="font-serif italic font-bold text-lg text-[#2D2D2D]">
                  {partner ? 'Update Partner Profile' : 'Connect Your Partner'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddPartnerModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F4F1ED] text-[#6B7280]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">Partner's Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah, Alex, Jordan"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8D4CE] focus:border-[#A45C40] focus:ring-1 focus:ring-[#A45C40] outline-hidden bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">Relationship / Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse, Fiancé, Life Partner"
                  value={newPartnerRelationship}
                  onChange={(e) => setNewPartnerRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D8D4CE] focus:border-[#A45C40] focus:ring-1 focus:ring-[#A45C40] outline-hidden bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#2D2D2D] block mb-1">Partner's Biological Rhythm</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPartnerGender('female')}
                    className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                      newPartnerGender === 'female'
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#6B7280]'
                    }`}
                  >
                    Female (Menstrual Cycle)
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPartnerGender('male')}
                    className={`p-2.5 rounded-xl border font-semibold text-center transition-all ${
                      newPartnerGender === 'male'
                        ? 'bg-[#3A4D39]/10 border-[#3A4D39] text-[#3A4D39]'
                        : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#6B7280]'
                    }`}
                  >
                    Male (Diurnal Rhythm)
                  </button>
                </div>
              </div>

              {newPartnerGender === 'female' && (
                <div>
                  <label className="font-bold text-[#2D2D2D] block mb-1">
                    Current Estimated Cycle Day: Day {newPartnerCycleDay}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="28"
                    value={newPartnerCycleDay}
                    onChange={(e) => setNewPartnerCycleDay(Number(e.target.value))}
                    className="w-full accent-[#A45C40]"
                  />
                  <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
                    <span>Day 1 (Menstrual)</span>
                    <span>Day 14 (Ovulatory)</span>
                    <span>Day 28 (Luteal)</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8E4DE]">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#D8D4CE] text-[#6B7280] font-semibold hover:bg-[#F4F1ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#A45C40] text-white font-bold hover:bg-[#8F4F36] shadow-xs"
                >
                  Save Partner Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
