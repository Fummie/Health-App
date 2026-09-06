import React, { useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Droplet, 
  Sparkles, 
  Sun, 
  Moon, 
  Clock, 
  Activity,
  Heart
} from 'lucide-react';
import { MenstrualPhase, DailyCycleLog, Gender } from '../../types';

interface CycleCylinderProps {
  gender: Gender;
  cycleLengthDays: number;
  currentCycleDay: number;
  selectedCycleDay: number;
  lastPeriodStartDate: string;
  dailyLogs: Record<number, DailyCycleLog>;
  onSelectDay: (day: number) => void;
}

export const CycleCylinder: React.FC<CycleCylinderProps> = ({
  gender,
  cycleLengthDays = 28,
  currentCycleDay,
  selectedCycleDay,
  lastPeriodStartDate,
  dailyLogs,
  onSelectDay,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper to determine phase of a given day
  const getPhaseForDay = (day: number): { phase: MenstrualPhase; name: string; color: string; badge: string } => {
    if (day <= 5) {
      return { 
        phase: 'menstrual', 
        name: 'Menstrual', 
        color: 'from-rose-500/20 to-rose-600/30 border-rose-400 text-rose-800',
        badge: 'bg-rose-100 text-rose-700 border-rose-200'
      };
    }
    if (day <= 12) {
      return { 
        phase: 'follicular', 
        name: 'Follicular', 
        color: 'from-amber-400/20 to-amber-500/30 border-amber-400 text-amber-800',
        badge: 'bg-amber-100 text-amber-700 border-amber-200'
      };
    }
    if (day <= 16) {
      return { 
        phase: 'ovulatory', 
        name: 'Ovulatory', 
        color: 'from-emerald-400/25 to-emerald-500/35 border-emerald-400 text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
      };
    }
    return { 
      phase: 'luteal', 
      name: 'Luteal', 
      color: 'from-indigo-400/20 to-indigo-500/30 border-indigo-400 text-indigo-800',
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
  };

  // Helper to compute calendar date for a cycle day
  const getCalendarDateString = (day: number): string => {
    try {
      const baseDate = new Date(lastPeriodStartDate || Date.now());
      baseDate.setDate(baseDate.getDate() + (day - 1));
      return baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return `Day ${day}`;
    }
  };

  // Auto-scroll selected day into view on initial load or change
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const targetElement = container.querySelector(`[data-day="${selectedCycleDay}"]`) as HTMLElement;
      if (targetElement) {
        const offset = targetElement.offsetLeft - container.offsetWidth / 2 + targetElement.offsetWidth / 2;
        container.scrollTo({ left: offset, behavior: 'smooth' });
      }
    }
  }, [selectedCycleDay]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  if (gender === 'male') {
    // 24-Hour Diurnal Endocrine Cylinder for Men
    const currentHour = new Date().getHours();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    const getDiurnalZone = (hour: number) => {
      if (hour >= 6 && hour < 11) {
        return { 
          label: 'Morning Surge Peak', 
          desc: 'Max Testosterone & Cortisol sync',
          color: 'from-amber-500/20 to-orange-500/30 border-amber-400 text-amber-900',
          badge: 'bg-amber-100 text-amber-800',
          testoVal: '~95-100%'
        };
      }
      if (hour >= 11 && hour < 17) {
        return { 
          label: 'Midday Focus & Drive', 
          desc: 'Sustained cognitive efficiency',
          color: 'from-emerald-500/20 to-teal-500/30 border-emerald-400 text-emerald-900',
          badge: 'bg-emerald-100 text-emerald-800',
          testoVal: '~75-85%'
        };
      }
      if (hour >= 17 && hour < 22) {
        return { 
          label: 'Evening Trough & Recovery', 
          desc: 'Parasympathetic shift, wind down',
          color: 'from-indigo-500/20 to-purple-500/30 border-indigo-400 text-indigo-900',
          badge: 'bg-indigo-100 text-indigo-800',
          testoVal: '~55-65%'
        };
      }
      return { 
        label: 'Nocturnal Regeneration', 
        desc: 'Deep sleep slow-wave synthesis',
        color: 'from-slate-700/20 to-slate-900/30 border-slate-400 text-slate-800',
        badge: 'bg-slate-100 text-slate-800',
        testoVal: 'Synthesis Window'
      };
    };

    return (
      <div className="relative bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs overflow-hidden">
        {/* Cylinder Ambient Lighting Bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-amber-400 via-emerald-400 to-indigo-500 opacity-80" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#E8E4DE] px-2.5 py-0.5 rounded-full">
                24-Hour Diurnal Dial
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C9070] bg-[#E8E4DE] px-2.5 py-0.5 rounded-full">
                Diurnal Endocrine Cylinder
              </span>
            </div>
            <h3 className="text-xl font-serif italic text-[#2D2D2D]">
              Diurnal Testosterone & Energy Cylinder
            </h3>
            <p className="text-xs text-[#6B7280]">
              Scroll along the 24-hour endocrine wheel to align cognitive focus, training, and sleep
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleScrollLeft}
              className="p-2 rounded-full bg-[#E8E4DE] hover:bg-[#D8D4CE] text-[#3A4D39] transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (scrollRef.current) {
                  const target = scrollRef.current.querySelector(`[data-hour="${currentHour}"]`) as HTMLElement;
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                  }
                }
              }}
              className="px-3 py-1.5 rounded-full bg-[#3A4D39] text-white text-xs font-semibold hover:bg-[#2D3E2C] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Now ({currentHour}:00)</span>
            </button>
            <button
              onClick={handleScrollRight}
              className="p-2 rounded-full bg-[#E8E4DE] hover:bg-[#D8D4CE] text-[#3A4D39] transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Cylindrical Visual Carousel */}
        <div className="relative py-2">
          {/* Cylinder Edge Shadows for 3D depth */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-linear-to-r from-[#FAF8F5] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-linear-to-l from-[#FAF8F5] to-transparent z-10" />

          <div
            ref={scrollRef}
            className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-2 px-4 no-scrollbar scroll-smooth"
            style={{ perspective: '800px' }}
          >
            {hours.map((hour) => {
              const zone = getDiurnalZone(hour);
              const isCurrent = hour === currentHour;
              const formattedTime = `${hour.toString().padStart(2, '0')}:00`;

              return (
                <div
                  key={hour}
                  data-hour={hour}
                  className={`shrink-0 w-36 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-3.5 ${
                    isCurrent
                      ? 'bg-linear-to-b from-[#FAF8F5] to-[#E8E4DE] border-[#3A4D39] ring-2 ring-[#3A4D39]/30 shadow-md scale-105'
                      : 'bg-white border-[#E8E4DE] hover:border-[#7C9070] opacity-85 hover:opacity-100 shadow-2xs'
                  }`}
                  style={{
                    boxShadow: isCurrent 
                      ? '0 10px 25px -5px rgba(58, 77, 57, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.8)' 
                      : '0 2px 5px rgba(0,0,0,0.03)',
                  }}
                >
                  {isCurrent && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-mono font-bold text-[#2D2D2D]">
                        {formattedTime}
                      </span>
                      {isCurrent ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-[#6B7280]">
                          {hour >= 6 && hour < 18 ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-serif italic text-[#3A4D39] font-bold line-clamp-1 mb-1">
                      {zone.label}
                    </div>

                    <p className="text-[10px] text-[#6B7280] leading-tight line-clamp-2">
                      {zone.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#E8E4DE]/60 flex items-center justify-between text-[10px]">
                    <span className="text-[#6B7280]">Testosterone:</span>
                    <span className="font-bold text-[#3A4D39]">{zone.testoVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Female 28-Day Menstrual Cycle Cylinder
  const days = Array.from({ length: cycleLengthDays }, (_, i) => i + 1);

  return (
    <div className="relative bg-[#FAF8F5] p-5 sm:p-6 rounded-[28px] border border-[#E8E4DE] shadow-xs overflow-hidden">
      {/* 3D Cylinder Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A45C40] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DE]">
              3D Interactive Dial
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3A4D39] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E8E4DE]">
              {cycleLengthDays}-Day Infradian Cylinder
            </span>
          </div>
          <h3 className="text-xl font-serif italic text-[#2D2D2D]">
            Cycle Date Cylinder & Hormonal Timeline
          </h3>
          <p className="text-xs text-[#6B7280]">
            Scroll along the cylinder to inspect any cycle date, log symptoms, and check phase status
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleScrollLeft}
            className="p-2 rounded-full bg-[#E8E4DE] hover:bg-[#D8D4CE] text-[#3A4D39] transition-colors"
            aria-label="Scroll cylinder left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectDay(currentCycleDay)}
            className="px-3 py-1.5 rounded-full bg-[#A45C40] text-white text-xs font-semibold hover:bg-[#8F4F36] transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Today (Day {currentCycleDay})</span>
          </button>

          <button
            onClick={handleScrollRight}
            className="p-2 rounded-full bg-[#E8E4DE] hover:bg-[#D8D4CE] text-[#3A4D39] transition-colors"
            aria-label="Scroll cylinder right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Phases Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="flex items-center gap-2 bg-rose-50/80 border border-rose-200 px-2.5 py-1.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-rose-900 block">Menstrual (1-5)</span>
            <span className="text-[9px] text-rose-700">Rest & Replenish</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50/80 border border-amber-200 px-2.5 py-1.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-amber-900 block">Follicular (6-12)</span>
            <span className="text-[9px] text-amber-700">Estrogen Rise & Drive</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 px-2.5 py-1.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-emerald-900 block">Ovulatory (13-16)</span>
            <span className="text-[9px] text-emerald-700">Peak Vitality & Power</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-200 px-2.5 py-1.5 rounded-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-indigo-900 block">Luteal (17-28)</span>
            <span className="text-[9px] text-indigo-700">Progesterone & Nourish</span>
          </div>
        </div>
      </div>

      {/* 3D Cylindrical Container */}
      <div className="relative py-2">
        {/* Optical gradient shadows for curved cylinder sensation */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-[#FAF8F5] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-[#FAF8F5] to-transparent z-10" />

        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-3 no-scrollbar scroll-smooth"
          style={{ perspective: '900px' }}
        >
          {days.map((day) => {
            const phaseInfo = getPhaseForDay(day);
            const calDate = getCalendarDateString(day);
            const isToday = day === currentCycleDay;
            const isSelected = day === selectedCycleDay;
            const logEntry = dailyLogs[day];

            return (
              <button
                key={day}
                data-day={day}
                onClick={() => onSelectDay(day)}
                className={`shrink-0 w-28 text-left rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between p-3.5 cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#A45C40] ring-2 ring-[#A45C40]/40 shadow-lg scale-105 z-10'
                    : isToday
                    ? 'bg-white border-[#3A4D39] shadow-sm'
                    : 'bg-[#FAF8F5] border-[#E8E4DE] hover:bg-white hover:border-[#D8D4CE] opacity-85 hover:opacity-100 shadow-2xs'
                }`}
                style={{
                  boxShadow: isSelected 
                    ? '0 12px 24px -6px rgba(164, 92, 64, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
                    : '0 2px 4px rgba(0,0,0,0.03)',
                }}
              >
                {/* Top bar with phase color accent */}
                <div 
                  className={`absolute top-0 inset-x-0 h-1.5 ${
                    day <= 5 ? 'bg-rose-500' :
                    day <= 12 ? 'bg-amber-500' :
                    day <= 16 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} 
                />

                {/* Day & Date */}
                <div>
                  <div className="flex items-center justify-between mb-1 pt-1">
                    <span className="text-sm font-serif italic font-bold text-[#2D2D2D]">
                      Day {day}
                    </span>
                    {isToday && (
                      <span className="text-[8px] font-extrabold uppercase tracking-wider bg-[#3A4D39] text-white px-1.5 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-[#6B7280] mb-2">
                    {calDate}
                  </div>

                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border inline-block ${phaseInfo.badge}`}>
                    {phaseInfo.name}
                  </span>
                </div>

                {/* Logged Indicators */}
                <div className="mt-3 pt-2 border-t border-[#E8E4DE] flex items-center justify-between">
                  {logEntry ? (
                    <div className="flex items-center gap-1">
                      {logEntry.majorCycleBegan && (
                        <span className="text-[10px] text-rose-600" title="Period Flow Began">
                          🩸
                        </span>
                      )}
                      {logEntry.crampsLevel > 0 && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded">
                          C:{logEntry.crampsLevel}
                        </span>
                      )}
                      {logEntry.moods?.length > 0 && (
                        <span className="text-[10px]" title={logEntry.moods.join(', ')}>
                          ✨
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-[#A0A09C]">No logs</span>
                  )}

                  {isSelected && (
                    <span className="text-[9px] font-bold text-[#A45C40]">Active</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
