import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  RotateCcw, 
  Trophy, 
  Volume2, 
  Radio, 
  Brain, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Music,
  Gamepad2,
  Droplets,
  Layers,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Instrument, NoteDefinition, BolDefinition } from '../../types';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { soundEngine } from '../../services/soundEngine';

interface EchoMatchGameProps {
  currentInstrument: Instrument;
  onSelectInstrument: (inst: Instrument) => void;
  onSwitchMode?: (mode: 'tiles' | 'echo') => void;
}

type GamePhase = 'idle' | 'countdown' | 'playback' | 'input' | 'success_round' | 'gameover';

interface PlayZone {
  index: number;
  id: string;
  label: string;
  sublabel: string;
  key: string;
  frequency?: number;
  bol?: BolDefinition;
  waterLevel?: number;
}

export const EchoMatchGame: React.FC<EchoMatchGameProps> = ({
  currentInstrument,
  onSelectInstrument,
  onSwitchMode,
}) => {
  // Game State
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [activeHighlightedZone, setActiveHighlightedZone] = useState<number | null>(null);
  const [lastTappedZone, setLastTappedZone] = useState<number | null>(null);
  const [wrongTappedZone, setWrongTappedZone] = useState<number | null>(null);
  const [playbackNoteIndex, setPlaybackNoteIndex] = useState<number | null>(null);
  const [roundNotice, setRoundNotice] = useState<string>('');

  const playbackTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Extract playable zones based on instrument interface
  const getPlayZones = (): PlayZone[] => {
    const pType = currentInstrument.playInterface.type;

    if (pType === 'pakhawaj') {
      const bols = currentInstrument.playInterface.bols || [
        { name: 'Dha', westernEquivalent: 'Bass + Rim', key: 'Q', description: 'Thunderous open bass', pitch: 110, decay: 1.8, harmonicNoise: 0.2, head: 'both' },
        { name: 'Dhin', westernEquivalent: 'Open Syahi', key: 'W', description: 'Deep singing resonance', pitch: 146, decay: 1.6, harmonicNoise: 0.1, head: 'right_treble' },
        { name: 'Ta', westernEquivalent: 'Crisp Rim', key: 'E', description: 'Sharp perimeter ring', pitch: 293, decay: 0.6, harmonicNoise: 0.05, head: 'right_treble' },
        { name: 'Na', westernEquivalent: 'Open Treble', key: 'R', description: 'Bright ringing fundamental', pitch: 261, decay: 1.2, harmonicNoise: 0.08, head: 'right_treble' },
        { name: 'Ge', westernEquivalent: 'Bass Dough Slide', key: 'A', description: 'Wheat dough sub-bass', pitch: 75, decay: 2.2, harmonicNoise: 0.15, head: 'left_bass' },
        { name: 'Ka', westernEquivalent: 'Muffled Slap', key: 'S', description: 'Flat palm slap', pitch: 90, decay: 0.3, harmonicNoise: 0.4, head: 'left_bass' },
        { name: 'Tit', westernEquivalent: 'Center Damp', key: 'D', description: 'Fast muted 3-finger stroke', pitch: 220, decay: 0.2, harmonicNoise: 0.25, head: 'right_treble' }
      ];

      return bols.map((bol, idx) => ({
        index: idx,
        id: bol.name,
        label: bol.name,
        sublabel: bol.westernEquivalent || bol.head,
        key: bol.key,
        bol: bol
      }));
    }

    if (pType === 'jaltarang') {
      const notes = currentInstrument.playInterface.notes || [];
      const water = currentInstrument.playInterface.waterLevels || [85, 72, 60, 52, 40, 28, 16, 5];
      return notes.map((note, idx) => ({
        index: idx,
        id: `bowl-${idx}`,
        label: note.sargam || `Bowl ${idx + 1}`,
        sublabel: note.western || `${water[idx] || 0}%`,
        key: note.keyboardKey || `${idx + 1}`,
        frequency: note.frequency,
        waterLevel: water[idx] || 50
      }));
    }

    // Default: Strings & Wind
    const notes = currentInstrument.playInterface.notes || [
      { sargam: 'Sa', western: 'C4', frequency: 261.63, keyboardKey: '1' },
      { sargam: 'Re', western: 'D4', frequency: 293.66, keyboardKey: '2' },
      { sargam: 'Ga', western: 'E4', frequency: 329.63, keyboardKey: '3' },
      { sargam: 'Ma', western: 'F4', frequency: 349.23, keyboardKey: '4' },
      { sargam: 'Pa', western: 'G4', frequency: 392.00, keyboardKey: '5' },
      { sargam: 'Dha', western: 'A4', frequency: 440.00, keyboardKey: '6' },
      { sargam: 'Ni', western: 'B4', frequency: 493.88, keyboardKey: '7' }
    ];

    return notes.map((note, idx) => ({
      index: idx,
      id: `note-${idx}`,
      label: note.sargam,
      sublabel: note.western,
      key: note.keyboardKey || `${idx + 1}`,
      frequency: note.frequency
    }));
  };

  const zones = getPlayZones();

  // Load High Score for current instrument in Echo Match mode
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`echo_match_best_${currentInstrument.id}`);
      setBestScore(stored ? parseInt(stored, 10) : 0);
    } catch {
      setBestScore(0);
    }
  }, [currentInstrument.id]);

  // Clean up all playback timers
  const clearPlaybackTimers = () => {
    playbackTimeoutsRef.current.forEach((t) => clearTimeout(t));
    playbackTimeoutsRef.current = [];
    setActiveHighlightedZone(null);
  };

  useEffect(() => {
    return () => clearPlaybackTimers();
  }, [currentInstrument.id]);

  // Play sound for a specific zone
  const triggerZoneSound = (zoneIndex: number, isPreviewOrPlayback: boolean = false) => {
    const zone = zones[zoneIndex];
    if (!zone) return;

    soundEngine.init();
    soundEngine.unlockMobileAudio();

    if (zone.bol) {
      soundEngine.playBol(zone.bol.name, zone.bol.pitch, zone.bol.decay, zone.bol.head);
    } else if (zone.frequency) {
      let freq = zone.frequency;
      if (zone.waterLevel !== undefined) {
        const waterFactor = 1 - (zone.waterLevel / 100) * 0.18;
        freq = freq * waterFactor;
      }
      const dur = isPreviewOrPlayback ? 0.7 : 1.2;
      soundEngine.playNote(freq, currentInstrument, dur, 1.0);
    }
  };

  // Calculate dynamic playback timing scaling based on sequence length
  const getPlaybackTiming = (seqLength: number) => {
    if (seqLength <= 3) return { noteDuration: 550, pauseGap: 220 };
    if (seqLength <= 6) return { noteDuration: 450, pauseGap: 180 };
    if (seqLength <= 10) return { noteDuration: 370, pauseGap: 140 };
    return { noteDuration: 300, pauseGap: 100 };
  };

  // Start Playback phase for the current sequence
  const startPlaybackSequence = (seq: number[]) => {
    clearPlaybackTimers();
    setPhase('playback');
    setUserStep(0);
    setWrongTappedZone(null);
    setRoundNotice(`Watch & listen to the ${seq.length}-note echo sequence...`);

    const { noteDuration, pauseGap } = getPlaybackTiming(seq.length);
    const stepInterval = noteDuration + pauseGap;

    // Initial brief breath before sequence begins
    const startDelay = 400;

    seq.forEach((zoneIdx, stepIdx) => {
      const timeoutId = setTimeout(() => {
        setPlaybackNoteIndex(stepIdx + 1);
        setActiveHighlightedZone(zoneIdx);
        triggerZoneSound(zoneIdx, true);

        // Turn off highlight slightly before next note
        const offTimeout = setTimeout(() => {
          setActiveHighlightedZone(null);
        }, noteDuration);
        playbackTimeoutsRef.current.push(offTimeout);
      }, startDelay + stepIdx * stepInterval);

      playbackTimeoutsRef.current.push(timeoutId);
    });

    // When full sequence finishes, switch to input phase
    const totalPlaybackTime = startDelay + seq.length * stepInterval + 150;
    const endTimeout = setTimeout(() => {
      setPhase('input');
      setPlaybackNoteIndex(null);
      setActiveHighlightedZone(null);
      setRoundNotice(`Your turn! Replicate the ${seq.length}-note echo.`);
    }, totalPlaybackTime);

    playbackTimeoutsRef.current.push(endTimeout);
  };

  // Start fresh game
  const handleStartGame = () => {
    clearPlaybackTimers();
    soundEngine.init();
    setScore(0);
    setUserStep(0);
    setWrongTappedZone(null);

    // Procedurally generate first note
    const firstNote = Math.floor(Math.random() * zones.length);
    const initialSeq = [firstNote];
    setSequence(initialSeq);

    startPlaybackSequence(initialSeq);
  };

  // Handle user tap on a zone
  const handleUserTap = (zoneIndex: number) => {
    // If not in input phase, ignore clicks
    if (phase !== 'input') return;

    // Trigger instant responsive audio + visual feedback
    triggerZoneSound(zoneIndex, false);
    setLastTappedZone(zoneIndex);
    setTimeout(() => setLastTappedZone(null), 250);

    const expectedZoneIndex = sequence[userStep];

    if (zoneIndex === expectedZoneIndex) {
      // Correct tap!
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Check if user completed the full sequence
      if (nextStep === sequence.length) {
        // Round Won!
        const newScore = sequence.length;
        setScore(newScore);
        setPhase('success_round');
        setRoundNotice(`✨ Perfect! Echo matched (${newScore}/${newScore})`);

        // Update High Score
        if (newScore > bestScore) {
          setBestScore(newScore);
          try {
            localStorage.setItem(`echo_match_best_${currentInstrument.id}`, newScore.toString());
          } catch {}
        }

        // Milestone celebratory confetti (every 5 rounds)
        if (newScore % 5 === 0) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }

        // Append next procedurally generated note after short delay
        setTimeout(() => {
          const nextNote = Math.floor(Math.random() * zones.length);
          const nextSeq = [...sequence, nextNote];
          setSequence(nextSeq);
          startPlaybackSequence(nextSeq);
        }, 800);
      }
    } else {
      // Wrong tap -> Game Over
      setWrongTappedZone(zoneIndex);
      setPhase('gameover');
      setRoundNotice(`Incorrect note! Reached sequence length: ${score}`);

      // Small error sound feedback
      try {
        const ctx = soundEngine.init();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } catch {}
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (phase !== 'input') return;

      const key = e.key.toUpperCase();
      const matchedIdx = zones.findIndex((z) => z.key.toUpperCase() === key);
      if (matchedIdx !== -1) {
        handleUserTap(matchedIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, sequence, userStep, zones]);

  // Color theme generator for different zones
  const getZoneAccent = (idx: number, isHighlighted: boolean, isWrong: boolean, isLastTapped: boolean) => {
    if (isWrong) {
      return 'bg-red-500 text-white border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-95 ring-4 ring-red-500/50';
    }
    if (isHighlighted) {
      return 'bg-amber-400 text-black border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.95)] scale-[1.03] ring-4 ring-amber-400/60 font-black';
    }
    if (isLastTapped) {
      return 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.8)] scale-[1.02] ring-2 ring-white';
    }
    return 'bg-[#181a22] text-[#e1e4ea] border-white/10 hover:border-white/30 hover:bg-[#20232d]';
  };

  return (
    <div className="space-y-4 sm:space-y-6 select-none touch-manipulation max-w-5xl mx-auto w-full">
      
      {/* Game Mode Navigation Switcher Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12141a]/95 border border-white/10 p-3 sm:p-4 rounded-2xl shadow-xl">
        
        {/* Left: Mode Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSwitchMode && onSwitchMode('tiles')}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold text-[#8e95a5] hover:text-white hover:bg-white/5 border border-transparent transition-all cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Piano Tiles (Cascade)</span>
          </button>

          <button
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-white text-black shadow-md border border-white transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-black" />
            <span>Echo Match (Memory)</span>
          </button>
        </div>

        {/* Right: Instrument Soundfont Selector */}
        <div className="flex items-center gap-2 bg-[#181a22] px-3 py-1.5 rounded-xl border border-white/10">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-[9px] uppercase font-bold text-[#646c7c] block tracking-wider">Active Instrument:</span>
            <select
              value={currentInstrument.id}
              onChange={(e) => {
                const inst = HISTORICAL_INSTRUMENTS.find((i) => i.id === e.target.value);
                if (inst) {
                  clearPlaybackTimers();
                  setPhase('idle');
                  setSequence([]);
                  setScore(0);
                  onSelectInstrument(inst);
                }
              }}
              className="bg-transparent text-white font-semibold text-xs outline-none cursor-pointer"
            >
              {HISTORICAL_INSTRUMENTS.map((inst) => (
                <option key={inst.id} value={inst.id} className="bg-[#12141a] text-white">
                  {inst.name}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Main Game Header & Live Score Dashboard */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-1">
              <Brain className="w-3.5 h-3.5" />
              <span>Simon-Says Auditory Memory Mode</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
              Echo Match: {currentInstrument.name}
            </h2>
            <p className="text-xs text-[#9da4b0] mt-0.5 max-w-xl leading-relaxed">
              Listen to the procedural musical phrase generated from the authentic sound of {currentInstrument.name}, then tap back the exact sequence.
            </p>
          </div>

          {/* Score & Streak Badges */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Current Score / Sequence Length */}
            <div className="flex items-center gap-2.5 bg-[#181a22] px-4 py-2.5 rounded-2xl border border-white/10 shadow-md">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#646c7c] block">Current Sequence</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-white">{sequence.length > 0 ? sequence.length : 0}</span>
              </div>
            </div>

            {/* Best Score for this Instrument */}
            <div className="flex items-center gap-2.5 bg-[#181a22] px-4 py-2.5 rounded-2xl border border-white/10 shadow-md">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#646c7c] block">Best Echo</span>
                <span className="text-xl sm:text-2xl font-mono font-black text-amber-300">{bestScore}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Phase Status Banner */}
        <div className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-300 ${
          phase === 'playback' ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' :
          phase === 'input' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200' :
          phase === 'success_round' ? 'bg-emerald-600/30 border-emerald-400 text-white animate-pulse' :
          phase === 'gameover' ? 'bg-red-500/20 border-red-500/40 text-red-200' :
          'bg-white/5 border-white/10 text-[#9da4b0]'
        }`}>
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-center sm:text-left">
            {phase === 'playback' && <Radio className="w-4 h-4 text-amber-400 animate-spin" />}
            {phase === 'input' && <Brain className="w-4 h-4 text-emerald-400 animate-bounce" />}
            {phase === 'success_round' && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            {phase === 'gameover' && <XCircle className="w-4 h-4 text-red-400" />}
            {phase === 'idle' && <Sparkles className="w-4 h-4 text-white" />}
            
            <span>
              {phase === 'idle' && 'Ready to begin? Press Start to hear the first note!'}
              {phase === 'playback' && `🤖 Listening Phase: Note ${playbackNoteIndex || 1} of ${sequence.length}...`}
              {phase === 'input' && `🎯 Your Turn: Step ${userStep + 1} of ${sequence.length}`}
              {phase === 'success_round' && `✨ Round Completed! Sequence expanding to ${sequence.length + 1}...`}
              {phase === 'gameover' && `Game Over! Final Sequence Reached: ${score}`}
            </span>
          </div>

          {/* Sequence Step Progress Dots */}
          {sequence.length > 0 && phase !== 'idle' && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full px-2 py-1">
              {sequence.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    phase === 'playback' && (playbackNoteIndex || 0) > idx ? 'bg-amber-400 scale-110 shadow-sm' :
                    phase === 'input' && userStep > idx ? 'bg-emerald-400 scale-110 shadow-sm' :
                    phase === 'gameover' && userStep === idx ? 'bg-red-500 scale-125' :
                    'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Trigger in Banner */}
          {phase === 'idle' && (
            <button
              onClick={handleStartGame}
              className="px-5 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 shadow-md transition-all cursor-pointer touch-manipulation w-full sm:w-auto"
            >
              Start Echo Match
            </button>
          )}

          {phase === 'gameover' && (
            <button
              onClick={handleStartGame}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 shadow-md transition-all cursor-pointer touch-manipulation w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>
          )}
        </div>

      </div>

      {/* Interactive Tap Zone Interface (Reused Organological Layout) */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl space-y-6">
        
        <div className="flex items-center justify-between text-xs text-[#8e95a5] border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="uppercase font-bold tracking-wider text-white text-[11px]">
              {currentInstrument.playInterface.type.toUpperCase()} TAP ZONES ({zones.length} TONES)
            </span>
          </div>

          <span className="hidden sm:inline font-mono text-[11px] text-[#646c7c]">
            Click, tap, or press Keys [{zones.map(z => z.key).join(', ')}]
          </span>
        </div>

        {/* 1. STRINGS & WIND TAP ZONES (Horizontal Vibrant Resonator Bars) */}
        {(currentInstrument.playInterface.type === 'strings' || currentInstrument.playInterface.type === 'wind') && (
          <div className="space-y-3 py-2">
            {zones.map((zone) => {
              const isHighlighted = activeHighlightedZone === zone.index;
              const isLastTapped = lastTappedZone === zone.index;
              const isWrong = wrongTappedZone === zone.index;

              return (
                <button
                  key={zone.id}
                  onClick={() => handleUserTap(zone.index)}
                  disabled={phase === 'playback'}
                  className={`w-full relative flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl border transition-all duration-150 touch-manipulation cursor-pointer ${
                    getZoneAccent(zone.index, isHighlighted, isWrong, isLastTapped)
                  } ${phase === 'playback' ? 'cursor-not-allowed opacity-90' : 'active:scale-95'}`}
                >
                  {/* Left: Swara / Sargam & Tone info */}
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isHighlighted ? 'bg-black text-amber-300' : 'bg-white/10 text-white'
                    }`}>
                      {zone.key}
                    </span>
                    <div className="text-left">
                      <span className="font-serif font-bold text-base sm:text-lg block leading-tight">
                        {zone.label}
                      </span>
                      <span className="text-[10px] sm:text-xs opacity-70 block font-mono">
                        {zone.sublabel} {zone.frequency ? `• ${Math.round(zone.frequency)}Hz` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Right: Resonant Waveform Indicator */}
                  <div className="flex items-center gap-1">
                    <div className={`h-4 w-1 rounded-full ${isHighlighted || isLastTapped ? 'bg-current animate-ping' : 'bg-white/20'}`} />
                    <div className={`h-6 w-1 rounded-full ${isHighlighted || isLastTapped ? 'bg-current animate-pulse' : 'bg-white/20'}`} />
                    <div className={`h-3 w-1 rounded-full ${isHighlighted || isLastTapped ? 'bg-current animate-ping' : 'bg-white/20'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. JAL TARANG TAP ZONES (Acoustic Porcelain Water Bowls Grid) */}
        {currentInstrument.playInterface.type === 'jaltarang' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-2">
            {zones.map((zone) => {
              const isHighlighted = activeHighlightedZone === zone.index;
              const isLastTapped = lastTappedZone === zone.index;
              const isWrong = wrongTappedZone === zone.index;

              return (
                <button
                  key={zone.id}
                  onClick={() => handleUserTap(zone.index)}
                  disabled={phase === 'playback'}
                  className={`aspect-[4/3] relative rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-between p-3 sm:p-4 transition-all duration-150 touch-manipulation cursor-pointer ${
                    getZoneAccent(zone.index, isHighlighted, isWrong, isLastTapped)
                  } ${phase === 'playback' ? 'cursor-not-allowed opacity-90' : 'active:scale-95'}`}
                >
                  <div className="w-full flex items-center justify-between text-[10px] font-mono opacity-80">
                    <span>Key [{zone.key}]</span>
                    <span>{zone.sublabel}</span>
                  </div>

                  {/* Semicircular Porcelain Bowl Graphic */}
                  <div className="relative w-16 h-12 sm:w-20 sm:h-14 rounded-b-full border-2 border-current bg-white/5 flex items-end justify-center overflow-hidden">
                    <div 
                      className="w-full bg-cyan-400/30 transition-all"
                      style={{ height: `${zone.waterLevel || 40}%` }}
                    />
                  </div>

                  <span className="font-serif font-bold text-sm sm:text-base">
                    {zone.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. PAKHAWAJ TAP ZONES (Authentic Drum Bols Grid) */}
        {currentInstrument.playInterface.type === 'pakhawaj' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 py-2">
            {zones.map((zone) => {
              const isHighlighted = activeHighlightedZone === zone.index;
              const isLastTapped = lastTappedZone === zone.index;
              const isWrong = wrongTappedZone === zone.index;

              return (
                <button
                  key={zone.id}
                  onClick={() => handleUserTap(zone.index)}
                  disabled={phase === 'playback'}
                  className={`relative p-4 rounded-2xl border flex flex-col items-start justify-between min-h-[105px] transition-all duration-150 touch-manipulation cursor-pointer ${
                    getZoneAccent(zone.index, isHighlighted, isWrong, isLastTapped)
                  } ${phase === 'playback' ? 'cursor-not-allowed opacity-90' : 'active:scale-95'}`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isHighlighted ? 'bg-black text-amber-300' : 'bg-white/10 text-white'
                    }`}>
                      {zone.key}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">
                      {zone.bol?.head === 'both' ? 'Dual Head' : zone.bol?.head === 'left_bass' ? 'Bayan' : 'Dayan'}
                    </span>
                  </div>

                  <div>
                    <span className="font-serif font-black text-xl sm:text-2xl block leading-tight">
                      {zone.label}
                    </span>
                    <span className="text-[11px] opacity-80 block truncate">
                      {zone.sublabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Game Over Summary Modal / Bottom Card */}
      {phase === 'gameover' && (
        <div className="bg-[#12141a]/95 border border-red-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold text-red-400 tracking-wider block">
                Session Complete
              </span>
              <h3 className="font-serif text-2xl font-bold text-white">
                Echo Sequence Result: {score} Notes
              </h3>
              <p className="text-xs text-[#9da4b0]">
                {score >= bestScore && score > 0 
                  ? '🎉 New High Score achieved on this instrument!' 
                  : `Your all-time best for ${currentInstrument.name} is ${bestScore}.`}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleStartGame}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-all shadow-md touch-manipulation cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>

              <button
                onClick={() => onSwitchMode && onSwitchMode('tiles')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all touch-manipulation cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Try Piano Tiles</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
