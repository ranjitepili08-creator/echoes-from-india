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
    <div className="space-y-6 select-none">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigoHeritage-900/60 border border-saffron-500/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-saffron-500/10 flex items-center justify-center text-saffron-300">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-parchment-200 block">
              Hydro-Acoustic Tuning
            </span>
            <span className="text-[11px] text-parchment-400">
              Adjust water volume in porcelain cups to alter pitch & vibrational damping
            </span>
          </div>
        </div>

        <button
          onClick={resetWater}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-parchment-300 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Water Levels</span>
        </button>
      </div>

      {/* Main Jal Tarang Bowl Array */}
      <div className="relative bg-gradient-to-b from-indigoHeritage-900 via-indigoHeritage-950 to-indigoHeritage-950 border-2 border-saffron-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <span className="font-serif font-bold text-parchment-100 text-sm">
              Jal Tarang (जल तरङ्ग) • Semicircular Crescent Array
            </span>
          </div>
          <span className="text-xs text-parchment-400 font-mono hidden sm:inline">
            Tap porcelain bowl or press keys [1 - 8]
          </span>
        </div>

        {/* Crescent Arrangement of Bowls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 pt-4">
          {initialNotes.map((note, idx) => {
            const isActive = activeBowls[idx];
            const water = waterLevels[idx] || 50;
            // Bowl size scales down from low to high pitch
            const scaleSize = 100 - idx * 4;

            return (
              <div key={idx} className="flex flex-col items-center gap-3">
                {/* Hotkey Badge */}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/50 text-parchment-300 border border-white/10">
                  Key {note.keyboardKey}
                </span>

                {/* Struck Porcelain Bowl Graphic */}
                <button
                  onClick={() => handleStrike(idx)}
                  className={`relative rounded-full border-2 transition-all duration-150 flex items-center justify-center overflow-hidden shadow-lg group ${
                    isActive
                      ? 'border-saffron-300 scale-105 shadow-saffron-500/40 shadow-xl'
                      : 'border-white/30 hover:border-saffron-400/80'
                  }`}
                  style={{
                    width: `${scaleSize}px`,
                    height: `${scaleSize}px`,
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
                    <span className="font-serif text-base font-extrabold text-indigoHeritage-950 block">
                      {note.sargam}
                    </span>
                    <span className="text-[9px] font-mono text-indigoHeritage-900 font-bold block">
                      {note.western}
                    </span>
                  </div>
                </button>

                {/* Water Level Slider */}
                <div className="w-full px-2 text-center space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-parchment-400">
                    <span>Water</span>
                    <span className="text-cyan-300">{water}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={water}
                    onChange={(e) => handleWaterChange(idx, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
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
