import React, { useState, useEffect } from 'react';
import { Wind, Sparkles, Volume2, Radio } from 'lucide-react';
import { Instrument, NoteDefinition } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableWindInstrumentProps {
  instrument: Instrument;
}

export const PlayableWindInstrument: React.FC<PlayableWindInstrumentProps> = ({ instrument }) => {
  const notes = instrument.playInterface.notes || [];
  const droneNotes = instrument.playInterface.droneNotes || [];

  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [breathPressure, setBreathPressure] = useState<number>(0.85);
  const [isDroneActive, setIsDroneActive] = useState<boolean>(false);
  const [droneHandle, setDroneHandle] = useState<{ stop: () => void } | null>(null);

  const handlePlayTone = (note: NoteDefinition, duration: number = 2.0) => {
    soundEngine.playNote(note.frequency, instrument, duration, breathPressure);
    setActiveNote(note.western);
    setTimeout(() => setActiveNote(null), 300);
  };

  const toggleContinuousDrone = (droneNote: NoteDefinition) => {
    if (isDroneActive && droneHandle) {
      droneHandle.stop();
      setDroneHandle(null);
      setIsDroneActive(false);
    } else {
      const handle = soundEngine.playNote(droneNote.frequency, instrument, 15.0, 0.7);
      setDroneHandle(handle);
      setIsDroneActive(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      const matched = notes.find((n) => n.keyboardKey === key);
      if (matched) {
        handlePlayTone(matched);
      }
      if (key === 'Z' && droneNotes[0]) {
        toggleContinuousDrone(droneNotes[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (droneHandle) droneHandle.stop();
    };
  }, [notes, droneNotes, breathPressure, isDroneActive, droneHandle, instrument]);

  return (
    <div className="space-y-6 select-none">
      
      {/* Breath & Air Pressure Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigoHeritage-900/60 border border-saffron-500/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-300">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-parchment-200 block">
              Breath Pressure & Air Column Turbulence
            </span>
            <span className="text-[11px] text-parchment-400">
              Modulates embouchure velocity, turbulence noise, and overtone harmonics
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-mono font-bold text-cyan-300 min-w-[3rem] text-right">
            {Math.round(breathPressure * 100)}%
          </span>
          <input
            type="range"
            min="0.4"
            max="1.0"
            step="0.05"
            value={breathPressure}
            onChange={(e) => setBreathPressure(parseFloat(e.target.value))}
            className="w-full sm:w-44 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Main Playable Flute / Conch Body */}
      <div className="bg-gradient-to-b from-indigoHeritage-900 via-indigoHeritage-950 to-indigoHeritage-950 border-2 border-saffron-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <span className="font-serif font-bold text-parchment-100 text-sm">
              {instrument.name} • Aerophone Tone Generator
            </span>
          </div>
          <span className="text-xs text-parchment-400 font-mono hidden sm:inline">
            Tap fingerholes or press keys [A, S, D, F, J, K, L]
          </span>
        </div>

        {/* Melody Finger Holes */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-300 block">
            Melody Tone Holes (Surakh):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {notes.map((note) => {
              const isActive = activeNote === note.western;
              return (
                <button
                  key={note.western}
                  onClick={() => handlePlayTone(note)}
                  className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[120px] group ${
                    isActive
                      ? 'bg-cyan-500/30 border-cyan-300 scale-105 shadow-xl shadow-cyan-500/20'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-cyan-400/50'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/50 text-parchment-300 border border-white/10">
                    [{note.keyboardKey}]
                  </span>

                  {/* Hole Graphic */}
                  <div className={`w-8 h-8 rounded-full border-2 my-2 flex items-center justify-center transition-all ${
                    isActive ? 'bg-cyan-400 border-white shadow-glow' : 'bg-black/40 border-white/30 group-hover:border-cyan-400/60'
                  }`} />

                  <div>
                    <span className="font-serif text-lg font-bold text-parchment-100 block group-hover:text-cyan-300">
                      {note.sargam}
                    </span>
                    <span className="text-[10px] font-mono text-parchment-400">
                      {note.western}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continuous Drone Pipe (Algoza / Shankha Prana) */}
        {droneNotes.length > 0 && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-parchment-200">
                Continuous Circular Breathing Drone Pipe:
              </span>
            </div>

            <button
              onClick={() => toggleContinuousDrone(droneNotes[0])}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDroneActive
                  ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 animate-pulse'
                  : 'bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{isDroneActive ? 'Stop Continuous Air Drone (Z)' : 'Start Continuous Air Drone (Z)'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
