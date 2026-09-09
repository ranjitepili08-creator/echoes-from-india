import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Maximize2, Minimize2, Sliders, Volume2 } from 'lucide-react';
import { Instrument, NoteDefinition } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableStringInstrumentProps {
  instrument: Instrument;
}

export const PlayableStringInstrument: React.FC<PlayableStringInstrumentProps> = ({ instrument }) => {
  const [activeStrings, setActiveStrings] = useState<{ [key: string]: boolean }>({});
  const [meendBend, setMeendBend] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const lastPluckedRef = useRef<string | null>(null);

  const notes: NoteDefinition[] = instrument.playInterface.notes || [
    { sargam: 'Pa', western: 'G3', frequency: 196.00, keyboardKey: '1' },
    { sargam: 'Sa', western: 'C4', frequency: 261.63, keyboardKey: '2' },
    { sargam: 'Ma', western: 'F4', frequency: 349.23, keyboardKey: '3' },
    { sargam: 'Komal Ni', western: 'Bb4', frequency: 466.16, keyboardKey: '4' },
    { sargam: 'Re', western: 'D5', frequency: 587.33, keyboardKey: '5' },
    { sargam: 'Ga', western: 'E5', frequency: 659.25, keyboardKey: '6' },
    { sargam: 'Pa', western: 'G5', frequency: 783.99, keyboardKey: '7' }
  ];

  const handlePluck = (note: NoteDefinition) => {
    soundEngine.init();
    soundEngine.unlockMobileAudio();

    const bentFreq = note.frequency * Math.pow(2, meendBend / 12);
    soundEngine.playNote(bentFreq, instrument, 2.4, 1.0);

    setActiveStrings((prev) => ({ ...prev, [note.western]: true }));
    setTimeout(() => {
      setActiveStrings((prev) => ({ ...prev, [note.western]: false }));
    }, 350);
  };

  // Touch Move / Strumming across horizontal strings
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const stringElement = element.closest('[data-string-note]') as HTMLElement;
    if (stringElement) {
      const noteWestern = stringElement.getAttribute('data-string-note');
      if (noteWestern && noteWestern !== lastPluckedRef.current) {
        lastPluckedRef.current = noteWestern;
        const matched = notes.find((n) => n.western === noteWestern);
        if (matched) {
          handlePluck(matched);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    lastPluckedRef.current = null;
  };

  // Keyboard shortcut listener (1-9 and 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key;

      const num = parseInt(key);
      if (!isNaN(num) && num >= 1 && num <= notes.length) {
        handlePluck(notes[num - 1]);
      } else {
        const matched = notes.find((n) => n.keyboardKey.toUpperCase() === key.toUpperCase());
        if (matched) handlePluck(matched);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes, meendBend, instrument]);

  return (
    <div className="space-y-4 max-w-lg mx-auto select-none touch-manipulation">
      
      {/* Museum Explorer Top Header (Matching Reference Image) */}
      <div className="bg-[#0b0c16] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>INDIAN ART & HERITAGE COLLECTION</span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-parchment-300 text-xs font-medium border border-white/10 flex items-center gap-1.5"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div className="space-y-1 text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-parchment-100">
            Play the {instrument.name}
          </h3>
          <p className="text-xs text-parchment-300 leading-relaxed opacity-90">
            Produces a distinctive percussive attack followed by a resonant, buzzing sustain with subtle pitch bends and vibrato. Swipe across strings to strum.
          </p>
        </div>

        {/* Microtonal Meend / Gamaka Deflection */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-parchment-300">Meend Bend:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-300">+{meendBend.toFixed(1)} ST</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={meendBend}
              onChange={(e) => setMeendBend(parseFloat(e.target.value))}
              className="w-24 sm:w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* 🪕 HORIZONTAL GLOWING STRINGS VIEWPORT */}
        <div
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="space-y-3 py-4"
        >
          {notes.map((note, index) => {
            const isVibrating = activeStrings[note.western];
            return (
              <div
                key={note.western}
                data-string-note={note.western}
                onMouseDown={() => handlePluck(note)}
                onTouchStart={() => handlePluck(note)}
                className={`relative flex items-center gap-4 py-3.5 px-4 rounded-2xl border transition-all cursor-pointer group active:scale-[0.99] touch-manipulation ${
                  isVibrating
                    ? 'bg-amber-500/25 border-amber-400 shadow-xl shadow-amber-500/30'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-500/40'
                }`}
              >
                {/* Note Label */}
                <div className="w-10 text-left">
                  <span className={`font-mono text-sm font-bold block ${
                    isVibrating ? 'text-amber-300' : 'text-parchment-200 group-hover:text-amber-300'
                  }`}>
                    {note.western}
                  </span>
                  <span className="text-[10px] font-serif text-parchment-400 block -mt-0.5">
                    {note.sargam}
                  </span>
                </div>

                {/* Horizontal Glowing String Bar */}
                <div className="flex-1 relative h-6 flex items-center">
                  <div
                    className={`w-full rounded-full transition-all duration-75 ${
                      isVibrating
                        ? 'h-1.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,1)] animate-pulse'
                        : 'h-1 bg-gradient-to-r from-amber-500/60 via-amber-400/80 to-amber-500/60 group-hover:h-1.5'
                    }`}
                  />
                </div>

                {/* Keyboard key index */}
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-parchment-400 border border-white/10">
                  [{index + 1}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info matching reference screenshot */}
        <p className="text-[11px] text-parchment-400 text-center font-mono pt-2 border-t border-white/10">
          You can also use keyboard keys <strong>1 through 7</strong> to play notes
        </p>

      </div>

    </div>
  );
};
