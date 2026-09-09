import React, { useState, useEffect } from 'react';
import { Sparkles, Disc, Play, Square, Radio } from 'lucide-react';
import { Instrument, BolDefinition } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayablePakhawajProps {
  instrument: Instrument;
}

export const PlayablePakhawaj: React.FC<PlayablePakhawajProps> = ({ instrument }) => {
  const bols: BolDefinition[] = instrument.playInterface.bols || [
    { name: 'Dha', westernEquivalent: 'Bass + Treble Rim', key: 'Q', description: 'Thunderous open bass with treble rim', pitch: 110, decay: 1.8, harmonicNoise: 0.2, head: 'both' },
    { name: 'Dhin', westernEquivalent: 'Open Syahi Resonant', key: 'W', description: 'Deep singing resonance on syahi', pitch: 146, decay: 1.6, harmonicNoise: 0.1, head: 'right_treble' },
    { name: 'Ta', westernEquivalent: 'Crisp Treble Chanti', key: 'E', description: 'Sharp crisp strike on perimeter ring', pitch: 293, decay: 0.6, harmonicNoise: 0.05, head: 'right_treble' },
    { name: 'Na', westernEquivalent: 'Open Treble Harmonic', key: 'R', description: 'Bright ringing open fundamental', pitch: 261, decay: 1.2, harmonicNoise: 0.08, head: 'right_treble' },
    { name: 'Ge', westernEquivalent: 'Deep Bass Dough Slide', key: 'A', description: 'Moist wheat dough bass slide', pitch: 75, decay: 2.2, harmonicNoise: 0.15, head: 'left_bass' },
    { name: 'Ka', westernEquivalent: 'Muffled Bass Slap', key: 'S', description: 'Muffled flat palm slap without ring', pitch: 90, decay: 0.3, harmonicNoise: 0.4, head: 'left_bass' },
    { name: 'Tit', westernEquivalent: 'Center Damp Strike', key: 'D', description: 'Fast muted stroke with 3 fingers on syahi', pitch: 220, decay: 0.2, harmonicNoise: 0.25, head: 'right_treble' }
  ];

  const [activeBol, setActiveBol] = useState<string | null>(null);
  const [isPlayingTheka, setIsPlayingTheka] = useState(false);
  const [thekaStep, setThekaStep] = useState(0);

  const handleTriggerBol = (bol: BolDefinition) => {
    soundEngine.playBol(bol.name, bol.pitch, bol.decay, bol.head);
    setActiveBol(bol.name);
    setTimeout(() => setActiveBol(null), 250);
  };

  // 12-beat Chautal Dhrupad Classical Rhythm Loop: Dha Dha Dhin Ta | Ki Te Dha Dha | Tin Ta Te Te
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingTheka) {
      const chautalBols = ['Dha', 'Dha', 'Dhin', 'Ta', 'Ka', 'Tit', 'Dha', 'Dha', 'Ta', 'Ta', 'Tit', 'Tit'];
      let step = 0;

      timer = setInterval(() => {
        const bolName = chautalBols[step % chautalBols.length];
        const matched = bols.find((b) => b.name === bolName) || bols[0];
        handleTriggerBol(matched);
        setThekaStep(step % 12);
        step++;
      }, 420);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingTheka]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      const matched = bols.find((b) => b.key === key);
      if (matched) {
        handleTriggerBol(matched);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bols]);

  return (
    <div className="space-y-6 select-none">
      
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigoHeritage-900/60 border border-saffron-500/20 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-terracotta-500/10 flex items-center justify-center text-terracotta-400">
            <Disc className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-parchment-200 block">
              Classical Chautal Dhrupad Theka (12 Matras)
            </span>
            <span className="text-[11px] text-parchment-400">
              Traditional rhythmic cycle: Dha Dha Dhin Ta | Ki Te Dha Dha | Tin Ta Te Te
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsPlayingTheka(!isPlayingTheka)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isPlayingTheka
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md'
          }`}
        >
          {isPlayingTheka ? (
            <>
              <Square className="w-3.5 h-3.5" />
              <span>Stop Theka Loop (Step {thekaStep + 1}/12)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Play Dhrupad 12-Beat Theka</span>
            </>
          )}
        </button>
      </div>

      {/* Main Drum Studio Visual */}
      <div className="bg-gradient-to-b from-indigoHeritage-900 via-indigoHeritage-950 to-indigoHeritage-950 border-2 border-saffron-500/30 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-8">
        
        {/* Dual Drum Head Representations (Left: Bayan / Right: Dayan) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center py-4">
          
          {/* Left Head: Bayan (Wheat Dough Head) */}
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block">
              Left Bass Head (Bayan / Aata Dough)
            </span>
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-stone-800 border-4 border-amber-800/80 shadow-2xl flex items-center justify-center p-4">
              {/* Outer Parchment Rim */}
              <div className="w-full h-full rounded-full bg-stone-200 border-2 border-amber-900/40 flex items-center justify-center relative shadow-inner">
                {/* Center Fresh Kneaded Wheat Dough Disc (Aata) */}
                <div className="w-28 h-28 rounded-full bg-amber-100 border border-amber-300/80 shadow-md flex items-center justify-center text-center p-2">
                  <span className="text-[10px] font-mono font-bold text-amber-950/70">
                    Moist Wheat Dough Tuning
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-parchment-400">Deep pitch-bending sub-bass resonance</p>
          </div>

          {/* Right Head: Dayan (Syahi Iron-Ore Head) */}
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-300 block">
              Right Treble Head (Dayan / Syahi Paste)
            </span>
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-stone-800 border-4 border-amber-800/80 shadow-2xl flex items-center justify-center p-4">
              {/* Outer Rim (Chanti) */}
              <div className="w-full h-full rounded-full bg-amber-50 border-2 border-amber-900/40 flex items-center justify-center relative shadow-inner">
                {/* Middle Maidan Ring */}
                <div className="w-36 h-36 rounded-full bg-amber-100/80 border border-amber-300 flex items-center justify-center">
                  {/* Center Black Syahi Disc (Iron ore & charcoal) */}
                  <div className="w-20 h-20 rounded-full bg-neutral-900 border border-neutral-700 shadow-inner flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold text-neutral-400">
                      Syahi
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-parchment-400">Metallic harmonic tuned overtones</p>
          </div>

        </div>

        {/* Bols Trigger Pads */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-parchment-300 block mb-3">
            Interactive Classical Bol Trigger Pads:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {bols.map((bol) => {
              const isTriggered = activeBol === bol.name;
              return (
                <button
                  key={bol.name}
                  onClick={() => handleTriggerBol(bol)}
                  className={`relative p-4 rounded-2xl border text-center transition-all duration-100 group flex flex-col items-center justify-between min-h-[110px] ${
                    isTriggered
                      ? 'bg-saffron-500 text-indigoHeritage-950 border-saffron-300 scale-105 shadow-xl shadow-saffron-500/30 font-bold'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-saffron-500/40'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isTriggered ? 'bg-indigoHeritage-950 text-saffron-300 border-indigoHeritage-900' : 'bg-black/40 text-parchment-300 border-white/10'
                  }`}>
                    Key [{bol.key}]
                  </span>

                  <span className={`font-serif text-2xl font-extrabold my-1 ${
                    isTriggered ? 'text-indigoHeritage-950' : 'text-parchment-100 group-hover:text-saffron-300'
                  }`}>
                    {bol.name}
                  </span>

                  <span className={`text-[10px] truncate max-w-full ${
                    isTriggered ? 'text-indigoHeritage-900' : 'text-parchment-400'
                  }`}>
                    {bol.westernEquivalent.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
