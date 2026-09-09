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
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HERITAGE_SONGS } from '../../data/songsData';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { Instrument, SongChart, SongNote } from '../../types';
import { soundEngine } from '../../services/soundEngine';

interface RhythmGameProps {
  currentInstrument: Instrument;
  onSelectInstrument: (inst: Instrument) => void;
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
}) => {
  // Default is the Tarana "Dheem Ta Dare Dani" theme
  const [selectedSong, setSelectedSong] = useState<SongChart>(HERITAGE_SONGS[0]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  
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
  };

  // Auto-play song melody demo with scanned instrument
  const startPreview = () => {
    stopPreview();
    soundEngine.init();
    setIsPreviewPlaying(true);

    selectedSong.notes.forEach((note) => {
      const timerId = window.setTimeout(() => {
        const freq = getFrequencyForPitch(note.pitch);
        soundEngine.playNote(freq, currentInstrument, note.duration, 0.95);
        
        // Visual touch indication
        setActiveLaneTouch((prev) => ({ ...prev, [note.lane]: true }));
        setTimeout(() => {
          setActiveLaneTouch((prev) => ({ ...prev, [note.lane]: false }));
        }, Math.min(250, note.duration * 600));
      }, note.time * 1000);

      previewTimersRef.current.push(timerId);
    });

    // Cleanup timer at end of song
    const endTimerId = window.setTimeout(() => {
      setIsPreviewPlaying(false);
    }, (selectedSong.duration + 1) * 1000);
    previewTimersRef.current.push(endTimerId);
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
    return () => {
      stopPreview();
      soundEngine.stopRhythmBeat();
    };
  }, [selectedSong]);

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

    if (gameState !== 'playing') {
      if (gameState === 'idle' || gameState === 'gameover') {
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
    const hitWindow = 0.24; // tolerance

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

      if (minDistance < 0.09) {
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
      soundEngine.playNote(getFrequencyForPitch(defaultPitches[lane]), currentInstrument, 0.5, 0.85);
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
  }, [gameState, currentInstrument, combo]);

  // Main 60fps Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let tileIdCounter = 0;
    const fallDuration = 2.2 / tileSpeedMultiplier; // seconds for a tile to travel top to bottom
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

      // 2. Update tile positions & check for misses
      for (const tile of activeTilesRef.current) {
        const timeSinceSpawn = elapsedSeconds - (tile.note.time - fallDuration * targetY);
        tile.y = (timeSinceSpawn / fallDuration);

        // Check if tile fell past target line without hit
        if (!tile.hit && !tile.missed && tile.y > targetY + 0.14) {
          tile.missed = true;
          setCombo(0);
          setMisses((m) => m + 1);
          setLastJudgement({ text: 'MISS', color: 'text-red-400' });
        }
      }

      // 3. Remove out-of-screen tiles
      activeTilesRef.current = activeTilesRef.current.filter((t) => t.y <= 1.15);

      // 4. Render Game Canvas
      renderCanvas();

      // 5. Check if Song Complete
      if (elapsedSeconds >= selectedSong.duration + 1.2) {
        setGameState('gameover');
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
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
      const hitY = h * 0.85;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(245, 158, 11, 1)';
      ctx.beginPath();
      ctx.moveTo(0, hitY);
      ctx.lineTo(w, hitY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Falling Tiles
      for (const tile of activeTilesRef.current) {
        if (tile.hit) continue;

        const x = tile.note.lane * laneWidth + 4;
        const tileY = tile.y * h;
        const tileWidth = laneWidth - 8;
        const tileHeight = Math.max(34, tile.note.duration * 42);

        // Gradient for falling tile
        const grad = ctx.createLinearGradient(x, tileY, x, tileY + tileHeight);
        if (tile.missed) {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
          grad.addColorStop(1, 'rgba(185, 28, 28, 0.2)');
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
        ctx.strokeStyle = tile.missed ? 'rgba(239, 68, 68, 0.8)' : 'rgba(254, 243, 199, 0.95)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tile Syllable / Sargam Label (e.g. Dheem, Ta, Dare, Dani)
        ctx.fillStyle = '#0a0a14';
        ctx.font = 'bold 13px Cinzel, serif';
        ctx.textAlign = 'center';
        ctx.fillText(tile.note.sargam, x + tileWidth / 2, tileY + tileHeight / 2 + 5);
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [gameState, selectedSong, tileSpeedMultiplier, currentInstrument]);

  const accuracy = Math.round(
    (perfectHits + greatHits + misses > 0)
      ? ((perfectHits + greatHits * 0.7) / (perfectHits + greatHits + misses)) * 100
      : 100
  );

  return (
    <div className="space-y-4 sm:space-y-6 select-none touch-manipulation">
      
      {/* Top Banner & Active Scanned Instrument Soundfont Indicator */}
      <div className="bg-indigoHeritage-900/70 border border-saffron-500/25 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-500/10 text-terracotta-300 text-xs font-semibold mb-1">
              <Gamepad2 className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Interactive Rhythm Quest</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-parchment-100">
              Hear History Play: {selectedSong.title}
            </h2>
            <p className="text-xs sm:text-sm text-parchment-300 mt-0.5 max-w-2xl">
              Tap the rhythm tiles in sync to play the classical Tarana. Every tile sounds in the exact 
              reconstructed tone of your scanned instrument: <strong className="text-saffron-300">{currentInstrument.name}</strong>.
            </p>
          </div>

          {/* Scanned Instrument Soundfont Tone Picker & Audio Test */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <div className="flex items-center gap-2.5 bg-indigoHeritage-950/80 p-3 rounded-2xl border border-saffron-500/40 w-full md:w-auto shadow-md">
              <Radio className="w-4 h-4 text-saffron-400 animate-pulse" />
              <div className="text-xs flex-1 md:flex-none">
                <span className="text-[9px] uppercase font-bold text-parchment-400 block">Active Instrument Soundfont:</span>
                <select
                  value={currentInstrument.id}
                  onChange={(e) => {
                    const inst = HISTORICAL_INSTRUMENTS.find((i) => i.id === e.target.value);
                    if (inst) onSelectInstrument(inst);
                  }}
                  className="w-full bg-transparent text-saffron-300 font-bold text-xs outline-none cursor-pointer"
                >
                  {HISTORICAL_INSTRUMENTS.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-indigoHeritage-950 text-parchment-100">
                      {inst.name} ({inst.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.init();
                soundEngine.playNote(392.00, currentInstrument, 1.2, 1.0); // Play Pa (G4) loud chime
              }}
              title="Click to test and unlock browser audio"
              className="px-3.5 py-3 rounded-2xl bg-saffron-500/15 hover:bg-saffron-500/25 border border-saffron-500/40 text-saffron-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 touch-manipulation"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio 🔊</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: Song Selection & Tempo (Hidden on mobile if playing, visible above) */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Song Selector */}
          <div className="bg-indigoHeritage-900/60 border border-white/10 rounded-2xl p-3 sm:p-4 space-y-2.5">
            <span className="text-xs uppercase font-bold tracking-wider text-parchment-300 flex items-center gap-2">
              <Music className="w-3.5 h-3.5 text-saffron-400" />
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
                        ? 'bg-saffron-500/20 border-saffron-500/60 shadow-md text-parchment-100'
                        : 'bg-white/5 border-white/5 text-parchment-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs truncate">{song.title}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-saffron-300">
                        {song.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] text-parchment-400 truncate mt-0.5">{song.ragaOrOrigin}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed, Rhythm Beat & Melody Preview Controls */}
          <div className="bg-indigoHeritage-900/60 border border-white/10 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-parchment-300">Tempo:</span>
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
                        ? 'bg-saffron-500 text-indigoHeritage-950 font-bold border-saffron-400'
                        : 'bg-white/5 border-white/5 text-parchment-300'
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
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all touch-manipulation shadow-md ${
                  isPreviewPlaying
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 animate-pulse'
                    : 'bg-saffron-500/15 border-saffron-500/40 text-saffron-300 hover:bg-saffron-500/25'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isPreviewPlaying ? '⏹ Stop Song Preview' : '🎧 Listen Song Melody (Demo)'}</span>
              </button>

              <button
                onClick={toggleRhythmBeat}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all touch-manipulation shadow-md ${
                  isRhythmBeatActive
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-amber-500/20'
                    : 'bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10'
                }`}
              >
                <Radio className={`w-4 h-4 ${isRhythmBeatActive ? 'text-amber-300 animate-spin' : 'text-parchment-400'}`} />
                <span>{isRhythmBeatActive ? '🥁 Pakhawaj / Tabla Beat: ON' : '🥁 Add Tabla / Pakhawaj Beat'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Game Viewport & Phone Touch Controls */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Game Stats HUD Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-indigoHeritage-900/60 border border-white/10 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] text-parchment-400 uppercase block font-bold">Score</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-saffron-300">{score}</span>
            </div>

            <div className="bg-indigoHeritage-900/60 border border-white/10 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] text-parchment-400 uppercase block font-bold">Combo</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-terracotta-400">{combo}x</span>
            </div>

            <div className="bg-indigoHeritage-900/60 border border-white/10 p-2 sm:p-2.5 rounded-xl">
              <span className="text-[9px] text-parchment-400 uppercase block font-bold">Accuracy</span>
              <span className="text-base sm:text-lg font-mono font-extrabold text-emerald-300">{accuracy}%</span>
            </div>

            <div className="bg-indigoHeritage-900/60 border border-white/10 p-2 sm:p-2.5 rounded-xl flex flex-col justify-center">
              <span className="text-[9px] text-parchment-400 uppercase block font-bold">Judgement</span>
              <span className={`text-xs font-mono font-extrabold ${lastJudgement?.color || 'text-parchment-400'}`}>
                {lastJudgement?.text || 'READY'}
              </span>
            </div>
          </div>

          {/* Main Falling Tiles Canvas Viewport */}
          <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-b from-indigoHeritage-950 via-indigoHeritage-900 to-indigoHeritage-950 border-2 border-saffron-500/40 shadow-2xl">
            
            <canvas
              ref={canvasRef}
              width={600}
              height={440}
              className="w-full h-full block"
            />

            {/* Top Live Playing Banner when in Preview Mode */}
            {isPreviewPlaying && (
              <div className="absolute top-3 left-3 right-3 bg-emerald-950/90 border border-emerald-400/50 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-200 backdrop-blur-md animate-fade-in shadow-xl z-20">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>
                    Playing Song Demo in <strong>{currentInstrument.name}</strong> timbre...
                  </span>
                </div>
                <button
                  onClick={stopPreview}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-indigoHeritage-950 font-bold text-[10px]"
                >
                  Stop Preview
                </button>
              </div>
            )}

            {/* Overlay: Game Start / Pause / Game Over Modals */}
            {gameState === 'idle' && !isPreviewPlaying && (
              <div className="absolute inset-0 bg-indigoHeritage-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-saffron-500/15 border border-saffron-500/30 flex items-center justify-center text-saffron-300 animate-pulse">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-2xl font-bold text-parchment-100">
                    {selectedSong.title}
                  </h3>
                  <p className="text-xs text-saffron-300 font-medium">
                    Tone: <strong>{currentInstrument.name}</strong> Soundfont
                  </p>
                  <p className="text-[10px] sm:text-xs text-parchment-400 mt-1">
                    📱 Mobile: Tap the 4 touch lanes below • 💻 Desktop: Keys [D, F, J, K]
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 text-indigoHeritage-950 font-extrabold text-xs sm:text-sm shadow-xl active:scale-95 transition-all touch-manipulation"
                  >
                    Start Rhythm Quest ▶
                  </button>
                  <button
                    onClick={startPreview}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-parchment-200 font-bold text-xs flex items-center gap-1.5 transition-all touch-manipulation"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-saffron-400" />
                    <span>Listen Demo Preview</span>
                  </button>
                </div>
              </div>
            )}

            {gameState === 'paused' && (
              <div className="absolute inset-0 bg-indigoHeritage-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                <h3 className="font-serif text-2xl font-bold text-parchment-100">Game Paused</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resumeGame}
                    className="px-5 py-2.5 rounded-xl bg-saffron-500 text-indigoHeritage-950 font-bold text-xs"
                  >
                    Resume
                  </button>
                  <button
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-xl bg-white/10 text-parchment-200 font-semibold text-xs"
                  >
                    Restart
                  </button>
                </div>
              </div>
            )}

            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-indigoHeritage-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 text-center space-y-3 sm:space-y-4 animate-fade-in">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-saffron-400 uppercase tracking-widest">Performance Complete!</span>
                  <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-parchment-100">
                    Score: {score}
                  </h3>
                  <div className="flex items-center justify-center gap-4 text-xs text-parchment-300 pt-1">
                    <span>Accuracy: <strong className="text-emerald-300">{accuracy}%</strong></span>
                    <span>Max Combo: <strong className="text-terracotta-300">{maxCombo}x</strong></span>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 text-indigoHeritage-950 font-bold text-xs sm:text-sm hover:scale-105 active:scale-95 transition-all shadow-md touch-manipulation"
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
                  className={`py-4 sm:py-5 rounded-2xl border text-center transition-all touch-manipulation select-none active:scale-95 ${
                    isTouched
                      ? 'bg-saffron-500 border-saffron-300 text-indigoHeritage-950 scale-95 shadow-xl shadow-saffron-500/40'
                      : 'bg-white/5 hover:bg-saffron-500/20 border-white/10 hover:border-saffron-500/40 text-parchment-200'
                  }`}
                >
                  <span className="font-mono text-sm sm:text-base font-extrabold block">
                    [{col.key}]
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-serif block opacity-80 mt-0.5">
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
