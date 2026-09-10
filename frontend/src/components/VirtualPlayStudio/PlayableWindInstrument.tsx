import React, { useState, useEffect, useRef } from 'react';
import { Wind, Mic, MicOff, Volume2, Sparkles, Activity } from 'lucide-react';
import { Instrument } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayableWindInstrumentProps {
  instrument: Instrument;
}

export const PlayableWindInstrument: React.FC<PlayableWindInstrumentProps> = ({ instrument }) => {
  // 6 finger holes (true = hole covered/closed, false = hole open)
  const [holes, setHoles] = useState<boolean[]>([true, true, true, false, false, false]);
  const [isBlowing, setIsBlowing] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [breathPressure, setBreathPressure] = useState<number>(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const activeSoundRef = useRef<{ stop: () => void; bendPitch: (f: number) => void } | null>(null);
  const isBlowingRef = useRef<boolean>(false);

  // Scale frequencies based on covered finger holes (0 to 6)
  const holeFrequencies: { [holesCovered: number]: { note: string; freq: number; sargam: string } } = {
    6: { note: 'D4', freq: 293.66, sargam: 'Sa (Shadja)' },
    5: { note: 'E4', freq: 329.63, sargam: 'Re (Rishabha)' },
    4: { note: 'F#4', freq: 369.99, sargam: 'Ga (Gandhara)' },
    3: { note: 'G4', freq: 392.00, sargam: 'Ma (Madhyama)' },
    2: { note: 'A4', freq: 440.00, sargam: 'Pa (Panchama)' },
    1: { note: 'B4', freq: 493.88, sargam: 'Dha (Dhaivata)' },
    0: { note: 'C#5', freq: 554.37, sargam: 'Ni (Nishada)' },
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

  const startSound = (velocity: number = 0.9) => {
    soundEngine.init();
    soundEngine.unlockMobileAudio();
    if (!activeSoundRef.current) {
      activeSoundRef.current = soundEngine.playNote(currentPitchInfo.freq, instrument, 15.0, velocity);
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

  // Update pitch in real-time when hole configuration changes while blowing
  useEffect(() => {
    if (activeSoundRef.current) {
      activeSoundRef.current.bendPitch(currentPitchInfo.freq);
    }
  }, [coveredCount]);

  // Activate Real-Time Microphone Breath Detection
  const startMicBreathSensor = async () => {
    soundEngine.init();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });
      audioStreamRef.current = stream;

      const ctx = soundEngine.init();
      const source = ctx.createMediaStreamSource(stream);

      // Band-pass filter to catch high-energy breath friction & air rush
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 600;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;

      source.connect(filter);
      filter.connect(analyser);
      micAnalyserRef.current = analyser;

      setIsMicActive(true);
      setMicPermissionDenied(false);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const trackBreathLoop = () => {
        if (!micAnalyserRef.current) return;
        micAnalyserRef.current.getByteFrequencyData(dataArray);

        let energy = 0;
        for (let i = 0; i < dataArray.length; i++) {
          energy += dataArray[i];
        }
        const avg = energy / dataArray.length;
        // Normalize 0.0 to 1.0 breath level
        const normalizedPressure = Math.min(1.0, Math.max(0.0, (avg - 10) / 45));

        setBreathPressure(normalizedPressure);

        // Breath threshold detection
        if (normalizedPressure > 0.12) {
          if (!isBlowingRef.current) {
            isBlowingRef.current = true;
            setIsBlowing(true);
          }
          startSound(Math.min(1.0, 0.4 + normalizedPressure * 0.8));
        } else {
          if (isBlowingRef.current) {
            isBlowingRef.current = false;
            setIsBlowing(false);
            stopSound();
          }
        }

        animFrameRef.current = requestAnimationFrame(trackBreathLoop);
      };

      trackBreathLoop();
    } catch (err) {
      console.warn('Microphone breath access error:', err);
      setMicPermissionDenied(true);
      setIsMicActive(false);
    }
  };

  const stopMicBreathSensor = () => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    micAnalyserRef.current = null;
    setIsMicActive(false);
    setBreathPressure(0);
    setIsBlowing(false);
    isBlowingRef.current = false;
    stopSound();
  };

  // Auto-attempt breath sensor activation on mount
  useEffect(() => {
    startMicBreathSensor();

    return () => {
      stopMicBreathSensor();
    };
  }, []);

  // Keyboard shortcut listener (1-6 for holes, Space for emergency breath trigger)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) {
        toggleHole(num - 1);
      } else if (e.key === ' ' && !isMicActive) {
        setIsBlowing(true);
        startSound(1.0);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isMicActive) {
        setIsBlowing(false);
        stopSound();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentPitchInfo, isMicActive]);

  return (
    <div className="space-y-4 max-w-xl w-full mx-auto select-none touch-manipulation">
      
      {/* Studio Card */}
      <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-center">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold">
            <Wind className="w-3.5 h-3.5 text-white" />
            <span>Acoustic Aerophone Studio</span>
          </div>

          <div className={`flex items-center gap-1.5 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
            isMicActive
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border border-white/10 text-[#8e95a5]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isMicActive ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
            <span>{isMicActive ? 'Real Breath Active' : 'Microphone Ready'}</span>
          </div>
        </div>

        <div className="space-y-1 text-left">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Play the {instrument.name}
          </h3>
          <p className="text-xs text-[#9da4b0] leading-relaxed">
            Blow air directly into your device's microphone to produce authentic sound. Toggle finger holes to shift notes and ragas in real time.
          </p>
        </div>

        {/* 💨 REAL BREATH DETECTION HUD & SENSOR */}
        <div className="py-4 px-4 sm:px-6 rounded-2xl bg-[#08090c] border border-white/10 space-y-4 shadow-inner">
          
          {/* Circular Airflow Ripple Visualizer */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto flex items-center justify-center">
            {/* Animated Breath Ripple Waves */}
            {isBlowing && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                <div className="absolute -inset-3 rounded-full border border-emerald-400/30 animate-pulse" />
              </>
            )}

            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 transition-all flex flex-col items-center justify-center gap-1 shadow-2xl ${
              isBlowing
                ? 'bg-white text-black border-white shadow-[0_0_30px_#ffffff] scale-105'
                : 'bg-white/5 border-white/20 text-white'
            }`}>
              <Wind className={`w-6 h-6 ${isBlowing ? 'animate-spin text-black' : 'text-white/80'}`} />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                {isBlowing ? 'Blowing!' : 'Blow Here'}
              </span>
            </div>
          </div>

          {/* Live Breath Pressure Meter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#8e95a5] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-white" />
                <span>Breath Airflow Intensity:</span>
              </span>
              <span className="font-bold text-white font-mono">
                {Math.round(breathPressure * 100)}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/15 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-emerald-400 via-amber-300 to-white shadow-sm"
                style={{ width: `${Math.min(100, Math.max(isBlowing ? 15 : 0, breathPressure * 100))}%` }}
              />
            </div>
          </div>

          {/* Microphone Permission Action if disabled */}
          {!isMicActive && (
            <button
              onClick={startMicBreathSensor}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Enable Microphone for Real Blowing</span>
            </button>
          )}

          {isMicActive && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-400 font-mono">
                🎙️ Mic listening — blow gently or strongly
              </span>
              <button
                onClick={stopMicBreathSensor}
                className="text-[10px] text-[#646c7c] hover:text-[#9da4b0] underline font-mono"
              >
                Mute Mic
              </button>
            </div>
          )}

          {micPermissionDenied && (
            <p className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
              Microphone access blocked. Please allow mic in browser settings to blow directly into the phone.
            </p>
          )}
        </div>

        {/* 🪈 6 FINGER HOLES (Pipe Body) */}
        <div className="py-2 relative flex flex-col items-center">
          <div className="text-[11px] font-mono text-[#8e95a5] mb-2 uppercase font-semibold">
            Finger Holes (Tap to open / close):
          </div>

          <div className="relative w-20 sm:w-24 py-5 bg-[#0a0b0e] border-x-2 border-white/20 rounded-3xl shadow-inner flex flex-col items-center gap-3 sm:gap-3.5">
            {holes.map((isCovered, index) => (
              <button
                key={index}
                onClick={() => toggleHole(index)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 transition-all flex items-center justify-center font-mono font-bold text-xs shadow-md active:scale-90 touch-manipulation ${
                  isCovered
                    ? 'bg-white border-white text-black shadow-white/30 scale-105'
                    : 'bg-black/60 border-white/30 text-[#9da4b0] hover:border-white/60'
                }`}
              >
                <span>{index + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Note Status readout */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div className="text-left">
            <span className="text-[#8e95a5] block text-[10px] uppercase font-bold">Active Note</span>
            <span className="text-white font-mono font-extrabold text-base">
              {currentPitchInfo.note} <span className="text-[#9da4b0] text-xs font-serif font-normal">({currentPitchInfo.sargam})</span>
            </span>
          </div>

          <div className="text-right">
            <span className="text-[#8e95a5] block text-[10px] uppercase font-bold">Finger Configuration</span>
            <span className="text-[#d6d9e0] font-mono text-xs">
              {coveredCount} / 6 holes closed
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
