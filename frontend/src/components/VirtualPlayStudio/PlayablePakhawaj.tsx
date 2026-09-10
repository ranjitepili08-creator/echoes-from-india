import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Disc, Play, Square, Volume2, Award, Zap, Trophy, RotateCcw } from 'lucide-react';
import { Instrument } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface PlayablePakhawajProps {
  instrument: Instrument;
}

type PatternType = 'chautal' | 'dhamar' | 'jhaptaal' | 'free';

interface FallingNote {
  id: number;
  bol: string;
  laneIndex: number;
  targetTime: number; // in seconds relative to track start
  hit: boolean;
  missed: boolean;
}

interface BolLane {
  name: string;
  key: string;
  color: string;
  head: 'left_bass' | 'right_treble' | 'both';
  pitch: number;
  decay: number;
}

export const PlayablePakhawaj: React.FC<PlayablePakhawajProps> = ({ instrument }) => {
  // Game & Play State
  const [currentPattern, setCurrentPattern] = useState<PatternType>('chautal');
  const [isPlayingGame, setIsPlayingGame] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [hitFeedback, setHitFeedback] = useState<{ text: string; color: string } | null>(null);

  // Active visual feedback on drum heads
  const [isLeftActive, setIsLeftActive] = useState<boolean>(false);
  const [isRightActive, setIsRightActive] = useState<boolean>(false);
  const [activeBolName, setActiveBolName] = useState<string | null>(null);

  // Canvas & Game Loop Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const notesRef = useRef<FallingNote[]>([]);
  const nextNoteIdRef = useRef<number>(1);

  // 4 Bol Lanes matching Pakhawaj playing zones
  const LANES: BolLane[] = [
    { name: 'DHA', key: 'A', color: '#ffb15c', head: 'both', pitch: 110, decay: 1.4 },
    { name: 'GE',  key: 'S', color: '#4ade80', head: 'left_bass', pitch: 75, decay: 1.8 },
    { name: 'TA',  key: 'K', color: '#60a5fa', head: 'right_treble', pitch: 320, decay: 0.6 },
    { name: 'TIT', key: 'L', color: '#f472b6', head: 'right_treble', pitch: 220, decay: 0.25 }
  ];

  // Canonical Classical Dhrupad Taals (Beat Patterns in Seconds)
  const TAAL_PATTERNS: { [key in PatternType]?: { bol: string; offset: number }[] } = {
    chautal: [
      { bol: 'DHA', offset: 0.0 },
      { bol: 'DHA', offset: 0.6 },
      { bol: 'GE',  offset: 1.2 },
      { bol: 'TA',  offset: 1.8 },
      { bol: 'TIT', offset: 2.4 },
      { bol: 'TA',  offset: 3.0 },
      { bol: 'DHA', offset: 3.6 },
      { bol: 'DHA', offset: 4.2 },
      { bol: 'TA',  offset: 4.8 },
      { bol: 'TA',  offset: 5.4 },
      { bol: 'TIT', offset: 6.0 },
      { bol: 'TIT', offset: 6.6 }
    ],
    dhamar: [
      { bol: 'GE',  offset: 0.0 },
      { bol: 'DHA', offset: 0.5 },
      { bol: 'TIT', offset: 1.0 },
      { bol: 'TIT', offset: 1.5 },
      { bol: 'TA',  offset: 2.0 },
      { bol: 'DHA', offset: 2.5 },
      { bol: 'GE',  offset: 3.0 },
      { bol: 'DHA', offset: 3.5 },
      { bol: 'TA',  offset: 4.0 },
      { bol: 'TIT', offset: 4.5 },
      { bol: 'GE',  offset: 5.0 },
      { bol: 'TIT', offset: 5.5 },
      { bol: 'DHA', offset: 6.0 },
      { bol: 'TA',  offset: 6.5 }
    ],
    jhaptaal: [
      { bol: 'DHA', offset: 0.0 },
      { bol: 'TA',  offset: 0.7 },
      { bol: 'DHA', offset: 1.4 },
      { bol: 'DHA', offset: 2.1 },
      { bol: 'TA',  offset: 2.8 },
      { bol: 'TIT', offset: 3.5 },
      { bol: 'TA',  offset: 4.2 },
      { bol: 'DHA', offset: 4.9 },
      { bol: 'DHA', offset: 5.6 },
      { bol: 'TA',  offset: 6.3 }
    ]
  };

  // Trigger Authentic Pakhawaj Sound Synthesis
  const triggerBol = (bolName: string) => {
    soundEngine.init();
    soundEngine.unlockMobileAudio();

    const nameUpper = bolName.toUpperCase();
    const matched = LANES.find((l) => l.name === nameUpper) || LANES[0];

    // Play synthesized acoustic bol
    soundEngine.playBol(matched.name, matched.pitch, matched.decay, matched.head);

    // Visual feedback
    setActiveBolName(matched.name);
    if (matched.head === 'left_bass' || matched.head === 'both') {
      setIsLeftActive(true);
      setTimeout(() => setIsLeftActive(false), 140);
    }
    if (matched.head === 'right_treble' || matched.head === 'both') {
      setIsRightActive(true);
      setTimeout(() => setIsRightActive(false), 140);
    }

    // Process rhythm game hit check if playing
    if (isPlayingGame && currentPattern !== 'free') {
      handleGameHit(matched.name);
    }
  };

  // Rhythm Game Hit Detection
  const handleGameHit = (bolName: string) => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const hitThreshold = 0.28; // +/- 280ms hit window

    // Find closest unhit note for this bol
    const candidates = notesRef.current.filter(
      (n) => !n.hit && !n.missed && n.bol === bolName && Math.abs(n.targetTime - elapsed) <= hitThreshold
    );

    setTotalAttempts((prev) => prev + 1);

    if (candidates.length > 0) {
      // Sort by closest time
      candidates.sort((a, b) => Math.abs(a.targetTime - elapsed) - Math.abs(b.targetTime - elapsed));
      const note = candidates[0];
      note.hit = true;

      const diff = Math.abs(note.targetTime - elapsed);
      let hitScore = 100;
      let text = 'PERFECT!';
      let color = '#4ade80';

      if (diff > 0.14) {
        hitScore = 50;
        text = 'GOOD';
        color = '#ffb15c';
      }

      setScore((prev) => prev + hitScore * Math.max(1, Math.floor(combo / 5) + 1));
      setCombo((prev) => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setTotalHits((prev) => prev + 1);
      showHitBadge(text, color);
    } else {
      // Miss on premature/wrong strike
      setCombo(0);
      showHitBadge('MISS', '#ef4444');
    }
  };

  const showHitBadge = (text: string, color: string) => {
    setHitFeedback({ text, color });
    setTimeout(() => setHitFeedback(null), 500);
  };

  // Initialize or Change Pattern
  const selectPattern = (pattern: PatternType) => {
    setCurrentPattern(pattern);
    setScore(0);
    setCombo(0);
    setTotalHits(0);
    setTotalAttempts(0);
    notesRef.current = [];

    if (pattern === 'free') {
      setIsPlayingGame(false);
    } else {
      setIsPlayingGame(true);
      generateTaalNotes(pattern);
      startTimeRef.current = performance.now() + 1500; // 1.5s countdown
    }
  };

  // Generate loop of falling notes for the selected Taal
  const generateTaalNotes = (pattern: PatternType) => {
    const sequence = TAAL_PATTERNS[pattern];
    if (!sequence) return;

    const patternDuration = sequence[sequence.length - 1].offset + 1.2;
    const repeats = 6; // 6 loops of the rhythmic cycle
    const generated: FallingNote[] = [];

    for (let r = 0; r < repeats; r++) {
      const loopOffset = r * patternDuration + 1.5; // Lead-in time
      sequence.forEach((step) => {
        const laneIdx = LANES.findIndex((l) => l.name === step.bol);
        generated.push({
          id: nextNoteIdRef.current++,
          bol: step.bol,
          laneIndex: laneIdx !== -1 ? laneIdx : 0,
          targetTime: loopOffset + step.offset,
          hit: false,
          missed: false
        });
      });
    }

    notesRef.current = generated;
  };

  // Canvas Dimensions & Rendering Animation Loop
  const renderGameCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const now = performance.now();
    const elapsed = isPlayingGame ? (now - startTimeRef.current) / 1000 : 0;

    // Clear Canvas
    ctx.fillStyle = '#0f0805';
    ctx.fillRect(0, 0, w, h);

    const laneCount = LANES.length;
    const laneWidth = w / laneCount;
    const hitLineY = h - 55;
    const noteSpeed = 220; // Pixels per second

    // 1. Draw Lane Dividers & Hit Zone
    for (let i = 0; i < laneCount; i++) {
      const laneX = i * laneWidth;

      // Lane Divider Line
      ctx.strokeStyle = 'rgba(122, 46, 24, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(laneX, 0);
      ctx.lineTo(laneX, h);
      ctx.stroke();

      // Hit Target Circle at Bottom
      const centerX = laneX + laneWidth / 2;
      const lane = LANES[i];

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = lane.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, hitLineY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Lane Bol Label
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#f2e8d5';
      ctx.textAlign = 'center';
      ctx.fillText(lane.name, centerX, hitLineY + 4);

      // Key shortcut badge
      ctx.font = '9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillText(`[${lane.key}]`, centerX, hitLineY + 34);
      ctx.restore();
    }

    // 2. Draw Target Hit Line
    ctx.strokeStyle = 'rgba(255, 177, 92, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, hitLineY);
    ctx.lineTo(w, hitLineY);
    ctx.stroke();

    // 3. Render Falling Taal Notes
    if (isPlayingGame) {
      notesRef.current.forEach((note) => {
        const timeDiff = note.targetTime - elapsed;
        const noteY = hitLineY - timeDiff * noteSpeed;

        // Check if note was missed
        if (!note.hit && !note.missed && timeDiff < -0.32) {
          note.missed = true;
          setCombo(0);
          showHitBadge('MISS', '#ef4444');
        }

        // Draw note if visible on screen
        if (noteY >= -40 && noteY <= h + 20 && !note.hit) {
          const lane = LANES[note.laneIndex];
          const centerX = note.laneIndex * laneWidth + laneWidth / 2;

          ctx.save();
          // Note Glow & Body
          ctx.fillStyle = lane.color;
          ctx.shadowColor = lane.color;
          ctx.shadowBlur = 12;

          ctx.beginPath();
          ctx.roundRect(centerX - 24, noteY - 14, 48, 28, 8);
          ctx.fill();

          // Note Bol Text
          ctx.shadowBlur = 0;
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#000000';
          ctx.textAlign = 'center';
          ctx.fillText(note.bol, centerX, noteY + 4);
          ctx.restore();
        }
      });
    } else {
      // Free play ambient idle prompt
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Free Play Jam Mode — Tap Drumheads or Use Keys [A] [S] [K] [L]', w / 2, h / 2);
    }
  }, [isPlayingGame]);

  // Animation Loop
  useEffect(() => {
    const loop = () => {
      renderGameCanvas();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [renderGameCanvas]);

  // Canvas Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight || 320;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Event Listeners (A, S, K, L)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyUpper = e.key.toUpperCase();
      const matched = LANES.find((l) => l.key === keyUpper);
      if (matched) {
        triggerBol(matched.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingGame, currentPattern]);

  const accuracyPct = totalAttempts > 0 ? Math.round((totalHits / totalAttempts) * 100) : 100;

  return (
    <div className="space-y-4 sm:space-y-6 select-none max-w-4xl mx-auto w-full">
      
      {/* HEADER & SCORE DASHBOARD */}
      <div className="bg-[#1a0f0a] border border-[#7a2e18]/60 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 text-center">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#7a2e18]/40 pb-3">
          <div className="text-left">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#ffb15c] flex items-center gap-2">
              <span>🥁 Pakhawaj Rhythm Challenge</span>
            </h2>
            <p className="text-xs text-[#c9b696] mt-0.5">
              Ancient Dhrupad Percussion Engine — Real-time Syahi &amp; Wheat Dough Synthesis
            </p>
          </div>

          {/* Hit Rating Floating Badge */}
          {hitFeedback && (
            <div
              className="px-4 py-1.5 rounded-full font-mono font-black text-sm animate-bounce shadow-lg"
              style={{ backgroundColor: `${hitFeedback.color}20`, color: hitFeedback.color, border: `1px solid ${hitFeedback.color}` }}
            >
              {hitFeedback.text}
            </div>
          )}
        </div>

        {/* Dashboard Stats (Score, Streak, Accuracy) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-black/40 p-3 rounded-2xl border border-[#ffb15c]/20 max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#c9b696]">Score</span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-[#ffb15c]">{score}</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#c9b696]">Streak</span>
            <span className={`text-lg sm:text-xl font-mono font-extrabold ${combo > 4 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {combo}x
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#c9b696]">Accuracy</span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-emerald-400">{accuracyPct}%</span>
          </div>
        </div>

        {/* Taal Rhythm Mode Selector Strip */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
          <button
            onClick={() => selectPattern('chautal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPattern === 'chautal'
                ? 'bg-[#ffb15c] text-black shadow-md font-extrabold scale-105'
                : 'bg-[#3a1f10] text-[#f2e8d5] hover:bg-[#5c2010] border border-[#7a2e18]'
            }`}
          >
            Chautal (12 Beats)
          </button>

          <button
            onClick={() => selectPattern('dhamar')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPattern === 'dhamar'
                ? 'bg-[#ffb15c] text-black shadow-md font-extrabold scale-105'
                : 'bg-[#3a1f10] text-[#f2e8d5] hover:bg-[#5c2010] border border-[#7a2e18]'
            }`}
          >
            Dhamar (14 Beats)
          </button>

          <button
            onClick={() => selectPattern('jhaptaal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPattern === 'jhaptaal'
                ? 'bg-[#ffb15c] text-black shadow-md font-extrabold scale-105'
                : 'bg-[#3a1f10] text-[#f2e8d5] hover:bg-[#5c2010] border border-[#7a2e18]'
            }`}
          >
            Jhaptaal (10 Beats)
          </button>

          <button
            onClick={() => selectPattern('free')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPattern === 'free'
                ? 'bg-[#ffb15c] text-black shadow-md font-extrabold scale-105'
                : 'bg-[#3a1f10] text-[#f2e8d5] hover:bg-[#5c2010] border border-[#7a2e18]'
            }`}
          >
            Free Jam Mode
          </button>
        </div>

        {/* 🎮 RHYTHM TRACK CANVAS CONTAINER */}
        <div className="relative w-full max-w-lg mx-auto h-72 rounded-2xl overflow-hidden border-2 border-[#7a2e18]/80 shadow-2xl bg-[#0f0805]">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* 🥁 DUAL DRUM HEADS (Touch / Click To Play) */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap py-2">
          
          {/* Left Head: Bayan (Bass - Wheat Dough) */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs font-bold text-[#ffb15c] uppercase tracking-wider">
              LEFT HEAD (Bass - Bayan)
            </span>

            <div
              onMouseDown={() => triggerBol('DHA')}
              onTouchStart={(e) => {
                e.preventDefault();
                triggerBol('DHA');
              }}
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-8 border-[#3a1f10] shadow-2xl relative flex items-center justify-center cursor-pointer transition-all duration-75 touch-manipulation ${
                isLeftActive
                  ? 'scale-95 shadow-[0_0_30px_#ffb15c] border-[#ffb15c]'
                  : 'hover:scale-[1.02]'
              }`}
              style={{
                background: 'radial-gradient(circle at 40% 40%, #e3cd9e 0%, #c7a86f 75%, #7a2e18 100%)'
              }}
            >
              {/* Moist Wheat Dough Disc */}
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#3c1e0a]/40 flex items-center justify-center text-center shadow-inner"
                style={{
                  background: 'radial-gradient(circle, #ded3b6 0%, #c7b591 80%, #a89470 100%)'
                }}
              >
                {/* Center Slap Zone */}
                <div className="w-10 h-10 rounded-full bg-[#161311] opacity-90" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#c9b696]">
              <span>Keys:</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 font-mono font-bold text-[#ffb15c]">A (DHA)</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 font-mono font-bold text-[#ffb15c]">S (GE)</span>
            </div>
          </div>

          {/* Right Head: Dayan (Treble - Syahi Paste) */}
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs font-bold text-[#ffb15c] uppercase tracking-wider">
              RIGHT HEAD (Treble - Dayan)
            </span>

            <div
              onMouseDown={() => triggerBol('TA')}
              onTouchStart={(e) => {
                e.preventDefault();
                triggerBol('TA');
              }}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full border-8 border-[#3a1f10] shadow-2xl relative flex items-center justify-center cursor-pointer transition-all duration-75 touch-manipulation ${
                isRightActive
                  ? 'scale-95 shadow-[0_0_30px_#ffb15c] border-[#ffb15c]'
                  : 'hover:scale-[1.02]'
              }`}
              style={{
                background: 'radial-gradient(circle at 45% 45%, #e3cd9e 0%, #c7a86f 70%, #7a2e18 100%)'
              }}
            >
              {/* Maidan Ring */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#7a2e18]/40 flex items-center justify-center">
                {/* Black Metallic Iron-Oxide Syahi Disc */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#161311] border border-white/10 flex items-center justify-center shadow-lg" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#c9b696]">
              <span>Keys:</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 font-mono font-bold text-[#ffb15c]">K (TA)</span>
              <span className="px-2 py-0.5 rounded bg-white/10 border border-white/20 font-mono font-bold text-[#ffb15c]">L (TIT)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
