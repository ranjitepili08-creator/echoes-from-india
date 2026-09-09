import React, { useState, useEffect, useRef } from 'react';
import { Wind, Mic, MicOff, Maximize2, Minimize2, Sparkles, Volume2 } from 'lucide-react';
import { Instrument } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableWindInstrumentProps {
  instrument: Instrument;
}

export const PlayableWindInstrument: React.FC<PlayableWindInstrumentProps> = ({ instrument }) => {
  // 6 finger holes (true = hole covered/closed, false = hole open)
  const [holes, setHoles] = useState<boolean[]>([true, true, true, false, false, false]);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const activeSoundRef = useRef<{ stop: () => void; bendPitch: (f: number) => void } | null>(null);

  // Flute scale notes based on number of holes covered (0 to 6)
  const holeFrequencies: { [holesCovered: number]: { note: string; freq: number } } = {
    6: { note: 'D4 (Sa)', freq: 293.66 },
    5: { note: 'E4 (Re)', freq: 329.63 },
    4: { note: 'F#4 (Ga)', freq: 369.99 },
    3: { note: 'G4 (Ma)', freq: 392.00 },
    2: { note: 'A4 (Pa)', freq: 440.00 },
    1: { note: 'B4 (Dha)', freq: 493.88 },
    0: { note: 'C#5 (Ni)', freq: 554.37 },
  };

  const coveredCount = holes.filter(Boolean).length;
  const currentPitchInfo = holeFrequencies[coveredCount] || holeFrequencies[3];

  // Toggle individual finger hole
  const toggleHole = (index: number) => {
    soundEngine.init();
    setHoles((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Start sound when blowing (either via touch hold or mic detection)
  const startSound = (vel: number = 0.95) => {
    soundEngine.init();
    soundEngine.unlockMobileAudio();
    if (!activeSoundRef.current) {
      activeSoundRef.current = soundEngine.playNote(currentPitchInfo.freq, instrument, 15.0, vel);
    } else {
      activeSoundRef.current.bendPitch(currentPitchInfo.freq);
    }
  };

  const stopSound = () => {
    if (activeSoundRef.current) {
      activeSoundRef.current.stop();
      activeSoundRef.current = null;
    }
  };

  // Update pitch in real-time when hole configuration changes
  useEffect(() => {
    if (activeSoundRef.current) {
      activeSoundRef.current.bendPitch(currentPitchInfo.freq);
    }
  }, [coveredCount]);

  // Handle Touch/Mouse Hold to Blow
  const handleHoldStart = () => {
    setIsBlowing(true);
    startSound(1.0);
  };

  const handleHoldEnd = () => {
    setIsBlowing(false);
    if (!isMicEnabled) {
      stopSound();
    }
  };

  // Real-time Microphone Breath Detection
  const toggleMicrophone = async () => {
    soundEngine.init();
    if (isMicEnabled) {
      // Turn off mic
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
      cancelAnimationFrame(animFrameRef.current);
      setIsMicEnabled(false);
      setMicLevel(0);
      stopSound();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        audioStreamRef.current = stream;

        const ctx = soundEngine.init();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);
        micAnalyserRef.current = analyser;

        setIsMicEnabled(true);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkBreath = () => {
          if (!micAnalyserRef.current) return;
          micAnalyserRef.current.getByteFrequencyData(dataArray);

          // Calculate average air turbulence energy
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalizedLevel = Math.min(1.0, avg / 65); // 0 to 1

          setMicLevel(normalizedLevel);

          // Threshold for breath blow detection
          if (normalizedLevel > 0.15) {
            setIsBlowing(true);
            startSound(Math.min(1.0, normalizedLevel * 1.5));
          } else {
            setIsBlowing(false);
            stopSound();
          }

          animFrameRef.current = requestAnimationFrame(checkBreath);
        };

        checkBreath();
      } catch (err) {
        alert('Please allow microphone permissions to blow into your phone mic!');
      }
    }
  };

  // Keyboard shortcut support (1-6 for holes, Space for blow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) {
        toggleHole(num - 1);
      } else if (e.key === ' ') {
        handleHoldStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        handleHoldEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      stopSound();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentPitchInfo]);

  return (
    <div className="space-y-4 max-w-lg mx-auto select-none touch-manipulation">
      
      {/* Museum Explorer Top Header */}
      <div className="bg-[#0b0c16] border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl text-center space-y-4">
        
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
            Produces a resonant, airy acoustic tone with haunting microtonal vibrato. Cover the fingerholes below and blow into your phone's microphone!
          </p>
        </div>

        {/* 💨 BREATH BLOW CONTROLS */}
        <div className="space-y-2.5 pt-2">
          
          {/* Main Hold to Blow Touch Pad */}
          <button
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={(e) => {
              e.preventDefault();
              handleHoldStart();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleHoldEnd();
            }}
            className={`w-full py-4 rounded-2xl border-2 border-dashed font-serif font-bold text-sm sm:text-base transition-all duration-150 shadow-lg flex items-center justify-center gap-2 touch-manipulation active:scale-95 ${
              isBlowing
                ? 'bg-amber-500 text-indigoHeritage-950 border-amber-300 shadow-amber-500/40 scale-[0.98]'
                : 'bg-white/5 border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Wind className={`w-5 h-5 ${isBlowing ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isBlowing ? '💨 Air Flowing — Playing Note!' : 'Touch & Hold to Blow Air'}</span>
          </button>

          {/* Real Phone Microphone Blow Toggle */}
          <button
            onClick={toggleMicrophone}
            className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              isMicEnabled
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 animate-pulse shadow-md'
                : 'bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10'
            }`}
          >
            {isMicEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-parchment-400" />}
            <span>{isMicEnabled ? '🎙️ Mic Active — Blow Into Bottom Phone Mic!' : '🎙️ Use Microphone to Blow (Real Breath)'}</span>
          </button>

          {/* Real-time Breath Pressure Meter */}
          {isMicEnabled && (
            <div className="space-y-1 animate-fade-in">
              <div className="flex items-center justify-between text-[10px] font-mono text-parchment-400">
                <span>Breath Airflow:</span>
                <span className="text-emerald-300 font-bold">{Math.round(micLevel * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
                  style={{ width: `${Math.min(100, micLevel * 100)}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* 🪈 6 VERTICAL FINGER HOLES (Flute Barrel) */}
        <div className="py-4 relative flex flex-col items-center">
          
          {/* Flute Pipe Body */}
          <div className="relative w-20 py-6 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 border-x-2 border-amber-500/40 rounded-3xl shadow-inner flex flex-col items-center gap-4">
            
            {holes.map((isCovered, index) => (
              <button
                key={index}
                onClick={() => toggleHole(index)}
                className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-mono font-bold text-xs shadow-md active:scale-90 touch-manipulation ${
                  isCovered
                    ? 'bg-amber-500 border-amber-300 text-indigoHeritage-950 shadow-amber-500/50 scale-105'
                    : 'bg-black/60 border-amber-500/50 text-amber-300 hover:border-amber-400'
                }`}
              >
                <span>{index + 1}</span>
              </button>
            ))}

          </div>

        </div>

        {/* Real-time Note Status readout */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-parchment-400">
            Playing: <strong className="text-amber-300 font-mono text-sm">{currentPitchInfo.note}</strong>
          </span>
          <span className="text-[11px] font-mono text-parchment-400">
            ({coveredCount} / 6 holes covered)
          </span>
        </div>

        <p className="text-[10px] text-parchment-400 font-mono">
          📱 Tap holes to cover/uncover • Blow into bottom mic or hold button above
        </p>

      </div>

    </div>
  );
};
