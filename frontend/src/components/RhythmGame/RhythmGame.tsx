import React, { useState, useEffect, useRef } from 'react';
import { 
  Gamepad2, 
  Play, 
  Trophy, 
  Sparkles, 
  Music, 
  Flame, 
  Volume2, 
  Pause, 
  RotateCcw,
  Radio,
  Sliders,
  Brain
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HERITAGE_SONGS } from '../../data/songsData';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { Instrument, SongChart, SongNote } from '../../types';
import { soundEngine } from '../../services/soundEngine';
import { EchoMatchGame } from './EchoMatchGame';

interface RhythmGameProps {
  currentInstrument: Instrument;
  onSelectInstrument: (inst: Instrument) => void;
  initialMode?: 'tiles' | 'echo';
}

interface ActiveTile {
  id: number;
  note: SongNote;
  y: number; // 0 to 1 (normalized vertical position)
  hit: boolean;
  missed: boolean;
}

export const RhythmGame: React.FC<RhythmGameProps> = ({
  currentInstrument,
  onSelectInstrument,
  initialMode = 'tiles',
}) => {
  const [gameMode, setGameMode] = useState<'tiles' | 'echo'>(initialMode);

  // Default is the Tarana "Dheem Ta Dare Dani" theme
  const [selectedSong, setSelectedSong] = useState<SongChart>(HERITAGE_SONGS[0]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [bestTilesScore, setBestTilesScore] = useState<number>(0);
  
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [perfectHits, setPerfectHits] = useState(0);
  const [greatHits, setGreatHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [lastJudgement, setLastJudgement] = useState<{ text: string; color: string } | null>(null);

  const [tileSpeedMultiplier, setTileSpeedMultiplier] = useState(1.0);
  const [activeLaneTouch, setActiveLaneTouch] = useState<{ [lane: number]: boolean }>({});
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isRhythmBeatActive, setIsRhythmBeatActive] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const noteIndexRef = useRef<number>(0);
  const activeTilesRef = useRef<ActiveTile[]>([]);
  const previewTimersRef = useRef<number[]>([]);

  // Stop auto-preview melody
  const stopPreview = () => {
    previewTimersRef.current.forEach((t) => clearTimeout(t));
    previewTimersRef.current = [];
    setIsPreviewPlaying(false);
    if (gameState === 'playing') {
      setGameState('idle');
    }
  };

  // Auto-play song melody demo with scanned instrument
  const startPreview = () => {
    stopPreview();
    soundEngine.init();
    setIsPreviewPlaying(true);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectHits(0);
    setGreatHits(0);
    setMisses(0);
    setLastJudgement({ text: 'DEMO MODE', color: 'text-emerald-300' });

    noteIndexRef.current = 0;
    activeTilesRef.current = [];
    startTimeRef.current = performance.now();
    setGameState('playing');
  };

  // Toggle Tabla/Pakhawaj rhythm beat accompaniment
  const toggleRhythmBeat = () => {
    soundEngine.init();
    if (isRhythmBeatActive) {
      soundEngine.stopRhythmBeat();
      setIsRhythmBeatActive(false);
    } else {
      soundEngine.startRhythmBeat(selectedSong.bpm);
      setIsRhythmBeatActive(true);
    }
  };

  // Stop preview and accompaniment on unmount or song switch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`piano_tiles_best_${currentInstrument.id}`);
      setBestTilesScore(stored ? parseInt(stored, 10) : 0);
    } catch {
      setBestTilesScore(0);
    }

    return () => {
      stopPreview();
      soundEngine.stopRhythmBeat();
    };
  }, [selectedSong, currentInstrument.id]);

  // Frequency mapping for the scanned instrument tone
  const getFrequencyForPitch = (pitch: string): number => {
    const noteMap: { [key: string]: number } = {
      'C3': 130.81, 'Db3': 138.59, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'Db5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77
    };
    return noteMap[pitch] || 261.63;
  };

  const startGame = () => {
    stopPreview();
    soundEngine.init();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectHits(0);
    setGreatHits(0);
    setMisses(0);
    setLastJudgement(null);
    
    noteIndexRef.current = 0;
    activeTilesRef.current = [];
    
    if (isRhythmBeatActive) {
      soundEngine.startRhythmBeat(selectedSong.bpm);
    }

    startTimeRef.current = performance.now();
    setGameState('playing');
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const handleTileHit = (lane: number) => {
    soundEngine.init();

    if (gameState !== 'playing' || isPreviewPlaying) {
      if (gameState === 'idle' || gameState === 'gameover' || isPreviewPlaying) {
        startGame();
      }
      return;
    }

    // Visual touch flash on lane
    setActiveLaneTouch((prev) => ({ ...prev, [lane]: true }));
    setTimeout(() => {
      setActiveLaneTouch((prev) => ({ ...prev, [lane]: false }));
    }, 150);

    // Find the closest unhit tile in this lane near the hit target line (y = 0.85)
    const targetY = 0.85;
    const hitWindow = 0.22; // tolerance window

    let closestTile: ActiveTile | null = null;
    let minDistance = 999;

    for (const tile of activeTilesRef.current) {
      if (!tile.hit && !tile.missed && tile.note.lane === lane) {
        const dist = Math.abs(tile.y - targetY);
        if (dist < hitWindow && dist < minDistance) {
          minDistance = dist;
          closestTile = tile;
        }
      }
    }

    if (closestTile) {
      closestTile.hit = true;
      const freq = getFrequencyForPitch(closestTile.note.pitch);
      
      // Play note through the active scanned instrument soundfont!
      soundEngine.playNote(freq, currentInstrument, closestTile.note.duration, 0.95);

      if (minDistance <= 0.08) {
        // Perfect Hit
        setScore((s) => s + 100 * (1 + Math.min(4, Math.floor(combo / 10)) * 0.5));
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
        setPerfectHits((p) => p + 1);
        setLastJudgement({ text: 'PERFECT', color: 'text-amber-300' });
      } else {
        // Great Hit
        setScore((s) => s + 50 * (1 + Math.min(4, Math.floor(combo / 10)) * 0.5));
        setCombo((c) => {
          const next = c + 1;
          setMaxCombo((m) => Math.max(m, next));
          return next;
        });
        setGreatHits((g) => g + 1);
        setLastJudgement({ text: 'GREAT', color: 'text-emerald-300' });
      }
    } else {
      // Empty lane tap gives rich audible feedback
      const defaultPitches = ['C4', 'D4', 'E4', 'G4'];
      soundEngine.playNote(getFrequencyForPitch(defaultPitches[lane]), currentInstrument, 0.4, 0.75);
    }
  };

  // Keyboard controls listener (D, F, J, K or 1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      if (key === 'D' || key === '1') handleTileHit(0);
      else if (key === 'F' || key === '2') handleTileHit(1);
      else if (key === 'J' || key === '3') handleTileHit(2);
      else if (key === 'K' || key === '4') handleTileHit(3);
      else if (key === ' ') {
        if (gameState === 'idle' || gameState === 'gameover') startGame();
        else if (gameState === 'playing') pauseGame();
        else if (gameState === 'paused') resumeGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentInstrument, combo, isPreviewPlaying]);

  // Main 60fps Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let tileIdCounter = 0;
    const fallDuration = 2.0 / tileSpeedMultiplier; // seconds for a tile to travel top to bottom
    const targetY = 0.85;

    const gameLoop = (timestamp: number) => {
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;

      // 1. Spawn upcoming notes
      while (
        noteIndexRef.current < selectedSong.notes.length &&
        selectedSong.notes[noteIndexRef.current].time - (fallDuration * targetY) <= elapsedSeconds
      ) {
        const note = selectedSong.notes[noteIndexRef.current];
        const newTile: ActiveTile = {
          id: ++tileIdCounter,
          note,
          y: 0,
          hit: false,
          missed: false,
        };
        activeTilesRef.current.push(newTile);
        noteIndexRef.current++;
      }

      // 2. Update tile positions & check for hits/misses
      for (const tile of activeTilesRef.current) {
        const timeSinceSpawn = elapsedSeconds - (tile.note.time - fallDuration * targetY);
        tile.y = (timeSinceSpawn / fallDuration);

        // In Demo / Preview Mode: Auto-play notes precisely when centered at target line
        if (isPreviewPlaying && !tile.hit && tile.y >= targetY) {
          tile.hit = true;
          const freq = getFrequencyForPitch(tile.note.pitch);
          soundEngine.playNote(freq, currentInstrument, tile.note.duration, 0.95);
          
          setActiveLaneTouch((prev) => ({ ...prev, [tile.note.lane]: true }));
          setTimeout(() => {
            setActiveLaneTouch((prev) => ({ ...prev, [tile.note.lane]: false }));
          }, Math.min(180, tile.note.duration * 400));
        }

        // In Manual Play: Check if tile fell past target line without hit
        if (!isPreviewPlaying && !tile.hit && !tile.missed && tile.y > targetY + 0.16) {
          tile.missed = true;
          setCombo(0);
          setMisses((m) => m + 1);
          setLastJudgement({ text: 'MISS', color: 'text-red-400' });
        }
      }

      // 3. Remove out-of-screen tiles
      activeTilesRef.current = activeTilesRef.current.filter((t) => t.y <= 1.2);

      // 4. Render Game Canvas
      renderCanvas();

      // 5. Check if Song Complete
      if (elapsedSeconds >= selectedSong.duration + 1.2) {
        if (isPreviewPlaying) {
          setIsPreviewPlaying(false);
          setGameState('idle');
        } else {
          setGameState('gameover');
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          setScore((currentScore) => {
            if (currentScore > bestTilesScore) {
              setBestTilesScore(currentScore);
              try {
                localStorage.setItem(`piano_tiles_best_${currentInstrument.id}`, currentScore.toString());
              } catch {}
            }
            return currentScore;
          });
        }
        return;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    const renderCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const laneWidth = w / 4;

      ctx.clearRect(0, 0, w, h);

      // Draw 4 Lane Columns & Dividers
      for (let i = 0; i < 4; i++) {
        const x = i * laneWidth;
        
        // Lane background
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.04)';
        ctx.fillRect(x, 0, laneWidth, h);

        // Divider lines
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Target Hit Line at Y = 0.85
      const hitY = h * targetY;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 14;
      ctx.shadowColor = 'rgba(245, 158, 11, 1)';
      ctx.beginPath();
      ctx.moveTo(0, hitY);
      ctx.lineTo(w, hitY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Falling Tiles (Centered precisely over tile.y)
      for (const tile of activeTilesRef.current) {
        if (tile.hit && !isPreviewPlaying) continue;

        const x = tile.note.lane * laneWidth + 4;
        const tileWidth = laneWidth - 8;
        const tileHeight = Math.max(34, tile.note.duration * 44);
        const tileY = tile.y * h - tileHeight / 2;

        // Gradient for falling tile
        const grad = ctx.createLinearGradient(x, tileY, x, tileY + tileHeight);
        if (tile.missed) {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
          grad.addColorStop(1, 'rgba(185, 28, 28, 0.25)');
        } else if (tile.hit) {
          grad.addColorStop(0, '#10b981');
          grad.addColorStop(1, '#059669');
        } else {
          grad.addColorStop(0, '#f59e0b');
          grad.addColorStop(0.5, '#d97706');
          grad.addColorStop(1, '#92400e');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, tileY, tileWidth, tileHeight, 8);
        ctx.fill();

        // Tile glow border
        ctx.strokeStyle = tile.missed 
          ? 'rgba(239, 68, 68, 0.8)' 
          : tile.hit 
          ? 'rgba(52, 211, 153, 0.95)' 
          : 'rgba(254, 243, 199, 0.95)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tile Syllable / Sargam Label (e.g. Dheem, Ta, Dare, Dani)
        ctx.fillStyle = '#0a0a14';
        ctx.font = 'bold 12px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(tile.note.sargam, x + tileWidth / 2, tileY + tileHeight / 2 + 4);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, selectedSong, tileSpeedMultiplier, currentInstrument, isPreviewPlaying]);

  const accuracy = Math.round(
    (perfectHits + greatHits + misses > 0)
      ? ((perfectHits + greatHits * 0.7) / (perfectHits + greatHits + misses)) * 100
      : 100
  );

  if (gameMode === 'echo') {
    return (
      <EchoMatchGame
        currentInstrument={currentInstrument}
        onSelectInstrument={onSelectInstrument}
        onSwitchMode={setGameMode}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 select-none touch-manipulation max-w-5xl mx-auto w-full">
      
      {/* Game Mode Navigation Switcher Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12141a]/95 border border-white/10 p-3 sm:p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-white text-black shadow-md border border-white transition-all cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-black" />
            <span>Piano Tiles (Cascade)</span>
          </button>

          <button
            onClick={() => {
              stopPreview();
              soundEngine.stopRhythmBeat();
              setGameMode('echo');
            }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-[#8e95a5] hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Echo Match (Memory)</span>
          </button>
        </div>

        {/* Best Score Badge for Piano Tiles */}
        <div className="flex items-center gap-2 bg-[#181a22] px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[#8e95a5]">Best Score:</span>
          <span className="font-mono font-bold text-amber-300">{bestTilesScore}</span>
        </div>
      </div>

      {/* Top Banner & Active Scanned Instrument Soundfont Indicator */}
      <div className="bg-[#12141a] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold mb-1">
              <Gamepad2 className="w-3.5 h-3.5 text-white/70" />
              <span>Interactive Rhythm Quest</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              Hear History Play: {selectedSong.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#9da4b0] mt-0.5 max-w-2xl">
              Tap the rhythm tiles in sync to play the classical Tarana. Every tile sounds in the exact 
              reconstructed tone of your active instrument: <strong className="text-white">{currentInstrument.name}</strong>.
            </p>
          </div>

          {/* Scanned Instrument Soundfont Tone Picker & Audio Test */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-2.5 bg-[#181a22] p-3 rounded-2xl border border-white/10 w-full md:w-auto shadow-md">
              <Radio className="w-4 h-4 text-white/80 animate-pulse" />
              <div className="text-xs flex-1 md:flex-none">
                <span className="text-[9px] uppercase font-bold text-[#646c7c] block tracking-wider">Active Soundfont:</span>
                <select
                  value={currentInstrument.id}
                  onChange={(e) => {
                    const inst = HISTORICAL_INSTRUMENTS.find((i) => i.id === e.target.value);
                    if (inst) onSelectInstrument(inst);
                  }}
                  className="w-full bg-transparent text-white font-semibold text-xs outline-none cursor-pointer"
                >
                  {HISTORICAL_INSTRUMENTS.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-[#12141a] text-[#f0f2f5]">
                      {inst.name} ({inst.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.init();
                soundEngine.playNote(392.00, currentInstrument, 1.2, 1.0);
              }}
              title="Click to test and unlock browser audio"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio 🔊</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Song Selection & Tempo */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Song Selector */}
          <div className="bg-[#12141a] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-2.5">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8e95a5] flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-white/80" />
              <span>Featured Melodies:</span>
            </span>

            <div className="space-y-1.5 max-h-[220px] lg:max-h-none overflow-y-auto">
              {HERITAGE_SONGS.map((song) => {
                const isSelected = song.id === selectedSong.id;
                return (
                  <button
                    key={song.id}
                    disabled={gameState === 'playing'}
                    onClick={() => {
                      setSelectedSong(song);
                      setGameState('idle');
                    }}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all touch-manipulation ${
                      isSelected
                        ? 'bg-white/15 border-white/40 shadow-md text-white'
                        : 'bg-white/[0.03] border-white/5 text-[#9da4b0] hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs truncate" style={{ fontFamily: "'Cinzel', serif" }}>{song.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white/90 border border-white/10">
                        {song.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#646c7c] truncate mt-0.5">{song.ragaOrOrigin}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed, Rhythm Beat & Melody Preview Controls */}
          <div className="bg-[#12141a] border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#8e95a5]">Tempo:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'Normal (1x)', val: 1.0 },
                  { label: 'Fast (1.3x)', val: 1.3 },
                ].map((sp) => (
                  <button
                    key={sp.label}
                    onClick={() => setTileSpeedMultiplier(sp.val)}
                    className={`py-1 px-3 rounded-lg text-xs font-semibold border transition-all touch-manipulation ${
                      tileSpeedMultiplier === sp.val
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-white/5 border-white/10 text-[#9da4b0] hover:text-white'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Accompaniment & Preview Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={isPreviewPlaying ? stopPreview : startPreview}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all touch-manipulation shadow-md ${
                  isPreviewPlaying
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300 animate-pulse'
                    : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPreviewPlaying ? '⏹ Stop Song Preview' : '🎧 Listen Song Melody (Demo)'}</span>
              </button>

              <button
                onClick={toggleRhythmBeat}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all touch-manipulation shadow-md ${
                  isRhythmBeatActive
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/[0.04] border-white/10 text-[#9da4b0] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Radio className={`w-4 h-4 ${isRhythmBeatActive ? 'text-white animate-spin' : 'text-[#646c7c]'}`} />
                <span>{isRhythmBeatActive ? '🥁 Pakhawaj / Tabla Beat: ON' : '🥁 Add Tabla / Pakhawaj Beat'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Game Viewport & Phone Touch Controls */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Game Stats HUD Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-[#12141a] border border-white/10 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] text-[#646c7c] uppercase block font-bold tracking-wider">Score</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-white">{score}</span>
            </div>

            <div className="bg-[#12141a] border border-white/10 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] text-[#646c7c] uppercase block font-bold tracking-wider">Combo</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-white/90">{combo}x</span>
            </div>

            <div className="bg-[#12141a] border border-white/10 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] text-[#646c7c] uppercase block font-bold tracking-wider">Accuracy</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">{accuracy}%</span>
            </div>

            <div className="bg-[#12141a] border border-white/10 p-2 sm:p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] text-[#646c7c] uppercase block font-bold tracking-wider">Judgement</span>
              <span className={`text-xs font-mono font-extrabold ${lastJudgement?.color || 'text-[#8e95a5]'}`}>
                {lastJudgement?.text || 'READY'}
              </span>
            </div>
          </div>

          {/* Main Falling Tiles Canvas Viewport */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0c0d12] border border-white/15 shadow-2xl">
            
            <canvas
              ref={canvasRef}
              width={600}
              height={440}
              className="w-full h-full block"
            />

            {/* Top Live Playing Banner when in Preview Mode */}
            {isPreviewPlaying && (
              <div className="absolute top-3 left-3 right-3 bg-[#12141a]/95 border border-emerald-400/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-300 backdrop-blur-md animate-fade-in shadow-xl z-20">
                <div className="flex items-center gap-2 truncate">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="truncate">
                    Playing Demo in <strong className="text-white">{currentInstrument.name}</strong> timbre...
                  </span>
                </div>
                <button
                  onClick={stopPreview}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[10px] flex-shrink-0 ml-2"
                >
                  Stop Preview
                </button>
              </div>
            )}

            {/* Overlay: Game Start / Pause / Game Over Modals */}
            {gameState === 'idle' && !isPreviewPlaying && (
              <div className="absolute inset-0 bg-[#0a0b0e]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white animate-pulse">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                    {selectedSong.title}
                  </h3>
                  <p className="text-xs text-[#9da4b0] font-medium">
                    Timbre: <strong className="text-white">{currentInstrument.name}</strong>
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#646c7c] mt-1">
                    📱 Mobile: Tap the 4 touch lanes below • 💻 Desktop: Keys [D, F, J, K]
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-xl bg-white text-black font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 hover:bg-white/90 transition-all touch-manipulation"
                  >
                    Start Rhythm Quest ▶
                  </button>
                  <button
                    onClick={startPreview}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-all touch-manipulation"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-white/80" />
                    <span>Listen Demo Preview</span>
                  </button>
                </div>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-[#0a0b0e]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h3 className="font-serif text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>Game Paused</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resumeGame}
                    className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs"
                  >
                    Resume
                  </button>
                  <button
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-xs"
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-[#0a0b0e]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3 sm:space-y-4 animate-fade-in">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Performance Complete</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                    Score: {score}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-xs text-[#9da4b0] pt-1">
                    <span>Accuracy: <strong className="text-emerald-400">{accuracy}%</strong></span>
                    <span>Max Combo: <strong className="text-white">{maxCombo}x</strong></span>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-white/90 active:scale-95 transition-all shadow-md touch-manipulation"
                >
                  Play Again ↺
                </button>
              </div>
            )}
          </div>

          {/* 📱 PHONE-OPTIMIZED TOUCH PADS (Immediate zero-latency touch trigger) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { key: 'D', lane: 0, sargam: 'Dheem / Sa' },
              { key: 'F', lane: 1, sargam: 'Ta / Re' },
              { key: 'J', lane: 2, sargam: 'Dare / Ga' },
              { key: 'K', lane: 3, sargam: 'Dani / Pa' },
            ].map((col) => {
              const isTouched = activeLaneTouch[col.lane];
              return (
                <button
                  key={col.key}
                  onMouseDown={() => handleTileHit(col.lane)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleTileHit(col.lane);
                  }}
                  className={`py-3.5 sm:py-5 rounded-2xl border text-center transition-all touch-manipulation select-none active:scale-95 ${
                    isTouched
                      ? 'bg-white border-white text-black scale-95 shadow-xl'
                      : 'bg-[#12141a] hover:bg-white/10 border-white/10 hover:border-white/25 text-white'
                  }`}
                >
                  <span className="font-mono text-sm sm:text-base font-extrabold block">
                    [{col.key}]
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-sans block text-[#8e95a5] mt-0.5 truncate">
                    {col.sargam}
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
