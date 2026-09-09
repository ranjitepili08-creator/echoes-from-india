import React, { useState, useEffect } from 'react';
import { Sparkles, Droplets, Volume2, RotateCcw } from 'lucide-react';
import { Instrument } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableJalTarangProps {
  instrument: Instrument;
}

export const PlayableJalTarang: React.FC<PlayableJalTarangProps> = ({ instrument }) => {
  const initialNotes = instrument.playInterface.notes || [];
  const defaultWaterLevels = instrument.playInterface.waterLevels || [85, 72, 60, 52, 40, 28, 16, 5];

  const [waterLevels, setWaterLevels] = useState<number[]>(defaultWaterLevels);
  const [activeBowls, setActiveBowls] = useState<{ [index: number]: boolean }>({});

  const handleStrike = (index: number) => {
    const note = initialNotes[index];
    if (!note) return;

    // Pitch physics: More water = lower frequency (frequency damping factor)
    const waterFactor = 1 - (waterLevels[index] / 100) * 0.18;
    const dynamicFreq = note.frequency * waterFactor;

    soundEngine.playNote(dynamicFreq, instrument, 2.2, 0.95);

    setActiveBowls((prev) => ({ ...prev, [index]: true }));
    setTimeout(() => {
      setActiveBowls((prev) => ({ ...prev, [index]: false }));
    }, 350);
  };

  const handleWaterChange = (index: number, newLevel: number) => {
    setWaterLevels((prev) => {
      const copy = [...prev];
      copy[index] = newLevel;
      return copy;
    });
  };

  const resetWater = () => {
    setWaterLevels(defaultWaterLevels);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key;
      const idx = parseInt(key) - 1;
      if (idx >= 0 && idx < initialNotes.length) {
        handleStrike(idx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [waterLevels, initialNotes, instrument]);

  return (
    <div className="space-y-4 sm:space-y-6 select-none max-w-5xl mx-auto w-full">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#12141a]/90 border border-white/10 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-white block">
              Hydro-Acoustic Tuning
            </span>
            <span className="text-[11px] text-[#9da4b0]">
              Adjust water volume in porcelain cups to alter pitch &amp; vibrational damping
            </span>
          </div>
        </div>

        <button
          onClick={resetWater}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[#9da4b0] hover:text-white text-xs font-semibold touch-manipulation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Water</span>
        </button>
      </div>

      {/* Main Jal Tarang Bowl Array */}
      <div className="relative bg-[#12141a]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="font-serif font-bold text-white text-sm sm:text-base">
              Jal Tarang (जल तरङ्ग) • Semicircular Crescent Array
            </span>
          </div>
          <span className="text-xs text-[#646c7c] font-mono hidden sm:inline">
            Tap porcelain bowl or press keys [1 - 8]
          </span>
        </div>

        {/* Responsive Grid of Bowls */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-4 pt-2">
          {initialNotes.map((note, idx) => {
            const isActive = activeBowls[idx];
            const water = waterLevels[idx] || 50;

            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                {/* Hotkey Badge */}
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-black/50 text-[#9da4b0] border border-white/10">
                  [{note.keyboardKey}]
                </span>

                {/* Struck Porcelain Bowl Graphic */}
                <button
                  onClick={() => handleStrike(idx)}
                  className={`relative rounded-full border-2 transition-all duration-150 flex items-center justify-center overflow-hidden shadow-lg group w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 touch-manipulation active:scale-95 ${
                    isActive
                      ? 'border-white scale-105 shadow-white/20 shadow-xl'
                      : 'border-white/30 hover:border-white/70'
                  }`}
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #e2e8f0 40%, #94a3b8 100%)',
                  }}
                >
                  {/* Water Fill Layer */}
                  <div
                    className="absolute inset-x-0 bottom-0 bg-cyan-500/40 backdrop-blur-xs border-t border-cyan-300/60 transition-all duration-200"
                    style={{ height: `${water}%` }}
                  >
                    {/* Water Surface Wave Graphic */}
                    <div className="w-full h-1 bg-cyan-200/60 animate-pulse" />
                  </div>

                  {/* Water Ripple on Strike */}
                  {isActive && (
                    <div className="absolute inset-2 rounded-full border-2 border-white/80 animate-ping pointer-events-none" />
                  )}

                  {/* Sargam Label inside Bowl */}
                  <div className="z-10 text-center select-none">
                    <span className="font-serif text-xs sm:text-base font-extrabold text-black block">
                      {note.sargam}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-neutral-800 font-bold block">
                      {note.western}
                    </span>
                  </div>
                </button>

                {/* Water Level Slider */}
                <div className="w-full px-1 text-center space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-[#646c7c]">
                    <span>Water</span>
                    <span className="text-cyan-300">{water}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={water}
                    onChange={(e) => handleWaterChange(idx, parseInt(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
