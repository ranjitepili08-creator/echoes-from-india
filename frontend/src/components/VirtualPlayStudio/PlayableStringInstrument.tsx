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
    <div className="space-y-4 max-w-xl w-full mx-auto select-none touch-manipulation">
      
      {/* Museum Explorer Top Header */}
      <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>INDIAN ART &amp; HERITAGE COLLECTION</span>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#9da4b0] text-xs font-medium border border-white/10 flex items-center gap-1.5"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>

        <div className="space-y-1 text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Play the {instrument.name}
          </h3>
          <p className="text-xs text-[#9da4b0] leading-relaxed">
            Produces a distinctive percussive attack followed by a resonant, buzzing sustain with subtle pitch bends and vibrato. Swipe across strings to strum.
          </p>
        </div>

        {/* Microtonal Meend / Gamaka Deflection */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold text-white">Meend Bend:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white">+{meendBend.toFixed(1)} ST</span>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={meendBend}
              onChange={(e) => setMeendBend(parseFloat(e.target.value))}
              className="w-24 sm:w-32 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>
        </div>

        {/* 🪕 HORIZONTAL GLOWING STRINGS VIEWPORT */}
        <div
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="space-y-2.5 sm:space-y-3 py-2"
        >
          {notes.map((note, index) => {
            const isVibrating = activeStrings[note.western];
            return (
              <div
                key={note.western}
                data-string-note={note.western}
                onMouseDown={() => handlePluck(note)}
                onTouchStart={() => handlePluck(note)}
                className={`relative flex items-center gap-3 sm:gap-4 py-3 sm:py-3.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer group active:scale-[0.99] touch-manipulation ${
                  isVibrating
                    ? 'bg-white/20 border-white shadow-xl shadow-white/10'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/30'
                }`}
              >
                {/* Note Label */}
                <div className="w-9 sm:w-10 text-left">
                  <span className={`font-mono text-xs sm:text-sm font-bold block ${
                    isVibrating ? 'text-white' : 'text-[#d6d9e0] group-hover:text-white'
                  }`}>
                    {note.western}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-serif text-[#646c7c] block -mt-0.5">
                    {note.sargam}
                  </span>
                </div>

                {/* Horizontal Glowing String Bar */}
                <div className="flex-1 relative h-6 flex items-center">
                  <div
                    className={`w-full rounded-full transition-all duration-75 ${
                      isVibrating
                        ? 'h-1.5 bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)] animate-pulse'
                        : 'h-1 bg-white/40 group-hover:h-1.5 group-hover:bg-white/70'
                    }`}
                  />
                </div>

                {/* Keyboard key index */}
                <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded bg-black/40 text-[#646c7c] border border-white/10">
                  [{index + 1}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <p className="text-[10px] sm:text-[11px] text-[#646c7c] text-center font-mono pt-2 border-t border-white/10">
          📱 Swipe across strings to strum • Press keys <strong>1 through 7</strong> on desktop
        </p>

      </div>

    </div>
  );
};
