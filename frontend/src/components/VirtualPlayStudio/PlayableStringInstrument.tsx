import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Sliders, Volume2, Music } from 'lucide-react';
import { Instrument, NoteDefinition } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableStringInstrumentProps {
  instrument: Instrument;
}

export const PlayableStringInstrument: React.FC<PlayableStringInstrumentProps> = ({ instrument }) => {
  const [activeStrings, setActiveStrings] = useState<{ [key: string]: boolean }>({});
  const [meendBend, setMeendBend] = useState<number>(0);
  const lastPluckedTimeRef = useRef<{ [key: string]: number }>({});

  // Exactly 4 Fixed Classical Strings (Kharaj, Pancham, Madhya Sa, Taar Sa / Chikari)
  const fixedFourStrings: NoteDefinition[] = [
    {
      sargam: 'Kharaj (Mandra Sa)',
      western: 'C3',
      frequency: 130.81,
      keyboardKey: '1'
    },
    {
      sargam: 'Pancham (Pa)',
      western: 'G3',
      frequency: 196.00,
      keyboardKey: '2'
    },
    {
      sargam: 'Madhya Sa (Sa)',
      western: 'C4',
      frequency: 261.63,
      keyboardKey: '3'
    },
    {
      sargam: 'Taar Sa / Chikari (Sa\')',
      western: 'C5',
      frequency: 523.25,
      keyboardKey: '4'
    }
  ];

  // String Gauge Specs (thickness & styling for the 4 strings)
  const stringSpecs = [
    { name: 'String 1 (Kharaj)', thickness: 'h-2 sm:h-2.5', color: 'from-amber-700 via-amber-400 to-amber-600', wire: 'Heavy Wound Bronze' },
    { name: 'String 2 (Pancham)', thickness: 'h-1.5 sm:h-2', color: 'from-amber-600 via-yellow-200 to-amber-500', wire: 'Medium Brass Core' },
    { name: 'String 3 (Madhya Sa)', thickness: 'h-1 sm:h-1.5', color: 'from-neutral-400 via-white to-neutral-300', wire: 'Polished Steel Melody' },
    { name: 'String 4 (Chikari)', thickness: 'h-0.5 sm:h-1', color: 'from-slate-200 via-white to-slate-100', wire: 'Fine Resonant Silver' }
  ];

  const handlePluck = (note: NoteDefinition) => {
    const now = Date.now();
    const lastTime = lastPluckedTimeRef.current[note.western] || 0;
    // Debounce rapid re-triggers on the exact same string (70ms)
    if (now - lastTime < 70) return;
    lastPluckedTimeRef.current[note.western] = now;

    soundEngine.init();
    soundEngine.unlockMobileAudio();

    const bentFreq = note.frequency * Math.pow(2, meendBend / 12);
    soundEngine.playNote(bentFreq, instrument, 3.2, 1.0);

    setActiveStrings((prev) => ({ ...prev, [note.western]: true }));
    setTimeout(() => {
      setActiveStrings((prev) => ({ ...prev, [note.western]: false }));
    }, 400);
  };

  // Hover & Pointer Gliding (Strumming without clicking)
  const handleStringHover = (note: NoteDefinition) => {
    handlePluck(note);
  };

  // Touch Move Strumming on Mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const stringElement = element.closest('[data-string-note]') as HTMLElement;
    if (stringElement) {
      const noteWestern = stringElement.getAttribute('data-string-note');
      if (noteWestern) {
        const matched = fixedFourStrings.find((n) => n.western === noteWestern);
        if (matched) {
          handlePluck(matched);
        }
      }
    }
  };

  // Keyboard shortcut listener (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key;
      const num = parseInt(key);
      if (!isNaN(num) && num >= 1 && num <= 4) {
        handlePluck(fixedFourStrings[num - 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [meendBend, instrument]);

  return (
    <div className="space-y-4 max-w-xl w-full mx-auto select-none touch-manipulation">
      
      {/* Studio Instrument Card */}
      <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold">
            <Music className="w-3.5 h-3.5 text-white" />
            <span>4-String Timbre Studio</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Hover to Strum Active</span>
          </div>
        </div>

        <div className="space-y-1 text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
            {instrument.name}
          </h3>
          <p className="text-xs text-[#9da4b0] leading-relaxed">
            Glide or hover your cursor across the 4 taut acoustic strings below to play notes and glissando strums in real time.
          </p>
        </div>

        {/* Microtonal Meend / Pitch Deflection Slider */}
        <div className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold text-white">Meend Gamaka Bend:</span>
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

        {/* 🪕 4 FIXED ACOUSTIC STRINGS (Hover to Produce Sound) */}
        <div
          onTouchMove={handleTouchMove}
          className="space-y-3 sm:space-y-4 py-3 bg-[#08090c] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-inner"
        >
          {fixedFourStrings.map((note, index) => {
            const isVibrating = activeStrings[note.western];
            const spec = stringSpecs[index];

            return (
              <div
                key={note.western}
                data-string-note={note.western}
                onMouseEnter={() => handleStringHover(note)}
                onPointerEnter={() => handleStringHover(note)}
                className={`relative flex items-center gap-3 sm:gap-4 py-4 sm:py-5 px-3 sm:px-4 rounded-xl border transition-all cursor-crosshair group ${
                  isVibrating
                    ? 'bg-white/15 border-white/60 shadow-xl shadow-white/10'
                    : 'bg-white/[0.02] hover:bg-white/[0.08] border-white/10 hover:border-white/30'
                }`}
              >
                {/* Note Sargam & Pitch Readout */}
                <div className="w-24 sm:w-28 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-mono text-sm sm:text-base font-extrabold ${
                      isVibrating ? 'text-white' : 'text-[#d6d9e0] group-hover:text-white'
                    }`}>
                      {note.western}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-[#8e95a5] border border-white/10">
                      [{index + 1}]
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-serif font-medium text-[#9da4b0] block truncate">
                    {note.sargam}
                  </span>
                </div>

                {/* Dynamic Vibrating Acoustic String Wire */}
                <div className="flex-1 relative h-8 flex items-center justify-center overflow-hidden">
                  {/* Outer Glow on Vibration */}
                  {isVibrating && (
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-md animate-pulse" />
                  )}

                  {/* Physical String Wire */}
                  <div
                    className={`w-full rounded-full transition-all duration-75 bg-gradient-to-r ${spec.color} ${spec.thickness} ${
                      isVibrating
                        ? 'scale-y-125 shadow-[0_0_18px_#ffffff] -translate-y-0.5 animate-pulse'
                        : 'group-hover:opacity-100 opacity-80'
                    }`}
                  />
                </div>

                {/* Wire Gauge Badge */}
                <div className="text-right hidden sm:block">
                  <span className="text-[9px] font-mono text-[#646c7c] uppercase font-semibold">
                    {spec.wire}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Hint Info */}
        <div className="flex items-center justify-between text-[11px] text-[#646c7c] font-mono pt-2 border-t border-white/10">
          <span>✨ Hover cursor or swipe across to strum</span>
          <span>Keys [1] [2] [3] [4]</span>
        </div>

      </div>

    </div>
  );
};
