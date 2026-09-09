import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, Volume2, MoveHorizontal, Radio } from 'lucide-react';
import { Instrument, NoteDefinition } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableStringInstrumentProps {
  instrument: Instrument;
}

export const PlayableStringInstrument: React.FC<PlayableStringInstrumentProps> = ({ instrument }) => {
  const [activeStrings, setActiveStrings] = useState<{ [key: string]: boolean }>({});
  const [meendBend, setMeendBend] = useState<number>(0); // semitone deflection 0 to 4
  const [isStrumming, setIsStrumming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const notes = instrument.playInterface.notes || [];
  const droneNotes = instrument.playInterface.droneNotes || [];

  const handlePluck = (note: NoteDefinition, duration: number = 2.5) => {
    // Apply meend pitch multiplier: 2^(meendBend/12)
    const bentFreq = note.frequency * Math.pow(2, meendBend / 12);
    
    soundEngine.playNote(bentFreq, instrument, duration, 0.95);

    setActiveStrings((prev) => ({ ...prev, [note.western]: true }));
    setTimeout(() => {
      setActiveStrings((prev) => ({ ...prev, [note.western]: false }));
    }, 400);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();

      // Check melody notes
      const matchedNote = notes.find((n) => n.keyboardKey === key);
      if (matchedNote) {
        handlePluck(matchedNote);
      }

      // Check drone notes
      const matchedDrone = droneNotes.find((d) => d.keyboardKey === key);
      if (matchedDrone) {
        handlePluck(matchedDrone, 3.5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes, droneNotes, meendBend, instrument]);

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Controls: Meend Microtonal Bend & Strum Guide */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigoHeritage-900/60 border border-saffron-500/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-saffron-500/10 flex items-center justify-center text-saffron-300">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-parchment-200 block">
              Microtonal Meend / Gamaka Deflection
            </span>
            <span className="text-[11px] text-parchment-400">
              Bend pitch laterally up to +3 semitones (Dhrupad pulling style)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-mono font-bold text-saffron-300 min-w-[3.5rem] text-right">
            +{meendBend.toFixed(1)} ST
          </span>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={meendBend}
            onChange={(e) => setMeendBend(parseFloat(e.target.value))}
            className="w-full sm:w-44 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-saffron-500"
          />
          {meendBend > 0 && (
            <button
              onClick={() => setMeendBend(0)}
              className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-parchment-300 hover:bg-white/20"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Playable Instrument Body & Fretboard */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsStrumming(true)}
        onMouseUp={() => setIsStrumming(false)}
        onMouseLeave={() => setIsStrumming(false)}
        className="relative bg-gradient-to-b from-indigoHeritage-900 via-indigoHeritage-950 to-indigoHeritage-950 border-2 border-saffron-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl overflow-hidden"
      >
        {/* Background Resonator Silhouette */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-saffron-500 via-transparent to-transparent pointer-events-none" />

        {/* Header Sargam / Scale Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <span className="font-serif font-bold text-parchment-100 text-sm">
              {instrument.name} • {instrument.categoryLabel.split('(')[0]}
            </span>
          </div>
          <span className="text-xs text-parchment-400 font-mono hidden sm:inline">
            Click string, drag mouse to strum, or press QWERTY hotkeys
          </span>
        </div>

        {/* Primary Melody Strings Course */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5" />
            <span>Primary Melodic Strings:</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
            {notes.map((note) => {
              const isActive = activeStrings[note.western];
              return (
                <button
                  key={note.western}
                  onClick={() => handlePluck(note)}
                  onMouseEnter={() => {
                    if (isStrumming) handlePluck(note);
                  }}
                  className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border transition-all duration-150 group overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-t from-saffron-500/40 via-amber-500/20 to-terracotta-500/30 border-saffron-400 scale-[1.03] shadow-lg shadow-saffron-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-saffron-500/40'
                  }`}
                >
                  {/* Vibrating String Line Graphic */}
                  <div
                    className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-all ${
                      isActive
                        ? 'bg-saffron-300 w-1 shadow-glow animate-pulse'
                        : 'bg-white/20 group-hover:bg-saffron-400/50'
                    }`}
                  />

                  {/* Hotkey Badge */}
                  <span className="z-10 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/50 text-parchment-300 border border-white/10">
                    {note.keyboardKey}
                  </span>

                  {/* Sargam Character */}
                  <div className="z-10 py-5 text-center">
                    <span className="font-serif text-lg lg:text-xl font-extrabold text-parchment-100 block group-hover:text-saffron-300 transition-colors">
                      {note.sargam}
                    </span>
                    <span className="text-[11px] font-mono text-parchment-400 block mt-0.5">
                      {note.western}
                    </span>
                  </div>

                  {/* Frequency Tag */}
                  <span className="z-10 text-[10px] font-mono text-saffron-400/80">
                    {Math.round(note.frequency)} Hz
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drone / Chikari Strings Course (If present) */}
        {droneNotes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Chikari & Drone Resonance Strings:</span>
            </span>

            <div className="flex flex-wrap gap-3">
              {droneNotes.map((drone) => {
                const isActive = activeStrings[drone.western];
                return (
                  <button
                    key={drone.western}
                    onClick={() => handlePluck(drone, 3.5)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-amber-500/30 border-amber-400 text-amber-200 scale-105'
                        : 'bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-amber-300 border border-white/10">
                      {drone.keyboardKey}
                    </span>
                    <span className="font-serif font-bold text-xs">{drone.sargam}</span>
                    <span className="text-[10px] font-mono text-parchment-400">({drone.western})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
