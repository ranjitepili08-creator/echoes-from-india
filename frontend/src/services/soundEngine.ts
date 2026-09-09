import { Instrument } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private droneNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;
  private isDronePlaying = false;
  private rhythmInterval: number | null = null;
  private isRhythmBeatPlaying = false;
  private isUnlocked = false;

  // Initialize Web Audio Context upon user interaction
  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.7;

      this.masterGain.connect(this.analyser);
      this.masterGain.connect(this.ctx.destination);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Universal mobile unlocker (forces iOS Safari & Android to route to loud speaker)
  public unlockMobileAudio() {
    try {
      const ctx = this.init();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // 1. Play empty Web Audio buffer
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      // 2. Play tiny silent HTML5 audio to force iOS audio session to "Playback" mode
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.play().catch(() => {});

      this.isUnlocked = true;
    } catch {}
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    const ctx = this.init();
    if (this.masterGain && ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0.001, Math.min(1.0, vol)), ctx.currentTime);
    }
  }

  // Play Note based on Instrument Organology & Timbre Type
  public playNote(
    freq: number = 261.63, 
    instrument?: Instrument, 
    duration: number = 1.6, 
    velocity: number = 1.0
  ): { stop: () => void; bendPitch: (newFreq: number) => void } {
    const ctx = this.init();
    this.unlockMobileAudio();

    const now = ctx.currentTime;
    const timbre = instrument?.acousticProfile?.timbreType || 'plucked_wire';
    const instId = instrument?.id || '';
    const safeFreq = Math.max(50, Math.min(3500, freq || 261.63));
    const safeDur = Math.max(0.3, duration || 1.6);
    const safeVel = Math.max(0.2, Math.min(1.0, velocity || 1.0));

    let stopFn = () => {};
    let bendFn = (_newFreq: number) => {};

    if (timbre === 'percussive_membrane' || instId === 'pakhawaj') {
      // 🥁 DRUMS & MEMBRANOPHONES (Pakhawaj, Tabla, Mridangam)
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const trebleOsc = ctx.createOscillator();
      const trebleGain = ctx.createGain();

      // Bass head: pitch drops from 120Hz to 60Hz
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(Math.min(safeFreq * 0.7, 140), now);
      bassOsc.frequency.linearRampToValueAtTime(Math.min(safeFreq * 0.3, 60), now + 0.15);

      bassGain.gain.setValueAtTime(0.01, now);
      bassGain.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.01);
      bassGain.gain.linearRampToValueAtTime(0.001, now + Math.max(0.6, safeDur));

      // Treble head: bright singing syahi ring
      trebleOsc.type = 'triangle';
      trebleOsc.frequency.setValueAtTime(safeFreq, now);

      trebleGain.gain.setValueAtTime(0.01, now);
      trebleGain.gain.linearRampToValueAtTime(safeVel * 0.9, now + 0.008);
      trebleGain.gain.linearRampToValueAtTime(0.001, now + Math.max(0.4, safeDur * 0.7));

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      trebleOsc.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      bassOsc.start(now);
      trebleOsc.start(now);
      bassOsc.stop(now + safeDur);
      trebleOsc.stop(now + safeDur);

      stopFn = () => {
        bassGain.gain.setValueAtTime(0.001, ctx.currentTime);
        trebleGain.gain.setValueAtTime(0.001, ctx.currentTime);
      };

    } else if (instId === 'morchang') {
      // 👄 MORCHANG: Metallic reed twang
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(safeFreq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(safeFreq * 3.2, now);
      filter.frequency.linearRampToValueAtTime(safeFreq * 1.6, now + 0.2);
      filter.Q.setValueAtTime(5.0, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.001, now + Math.min(1.4, safeDur));

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + safeDur);

      stopFn = () => gainNode.gain.setValueAtTime(0.001, ctx.currentTime);

    } else if (timbre === 'plucked_silk' || instId === 'yazh') {
      // 🪕 YAZH: Ancient silk string (Warm, mellow plucked harp)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(safeFreq * 2.0, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.frequency.linearRampToValueAtTime(600, now + safeDur);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.015);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.4, now + 0.3);
      gainNode.gain.linearRampToValueAtTime(0.001, now + safeDur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      bendFn = (newFreq: number) => osc1.frequency.setValueAtTime(newFreq, ctx.currentTime);

    } else if (timbre === 'plucked_wire' || instId === 'rudra-veena' || instId === 'kinnera') {
      // 🪕 RUDRA VEENA / KINNERA: Plucked wire with rich buzzing overtones
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(safeFreq * 2.004, now);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(safeFreq * 3.01, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.frequency.linearRampToValueAtTime(850, now + safeDur);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.012);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.45, now + 0.35);
      gainNode.gain.linearRampToValueAtTime(0.001, now + safeDur);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);
      osc3.stop(now + safeDur);

      stopFn = () => gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      bendFn = (newFreq: number) => {
        osc1.frequency.setValueAtTime(newFreq, ctx.currentTime);
        osc2.frequency.setValueAtTime(newFreq * 2.004, ctx.currentTime);
        osc3.frequency.setValueAtTime(newFreq * 3.01, ctx.currentTime);
      };

    } else if (timbre === 'percussive_ceramic' || instId === 'jal-tarang') {
      // 🥣 JAL TARANG: Water porcelain chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(safeFreq * 2.76, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.006);
      gainNode.gain.linearRampToValueAtTime(0.001, now + safeDur);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setValueAtTime(0.001, ctx.currentTime);

    } else if (timbre === 'bowed_folk' || instId === 'mayuri-veena' || instId === 'ravanahatha' || instId === 'pena' || instId === 'pinaka-veena') {
      // 🎻 BOWED FOLK STRINGS: Rich singing violin-like timbre
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(safeFreq * 1.002, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.03);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.7, now + safeDur * 0.7);
      gainNode.gain.linearRampToValueAtTime(0.001, now + safeDur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      bendFn = (newFreq: number) => {
        osc1.frequency.setValueAtTime(newFreq, ctx.currentTime);
        osc2.frequency.setValueAtTime(newFreq * 1.002, ctx.currentTime);
      };

    } else {
      // 🪈 WIND & HORNS (Algoza, Nagfani, Shankha)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = timbre === 'conch_horn' ? 'sawtooth' : 'triangle';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(safeFreq * 2.0, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, now);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 1.0, now + 0.025);
      gainNode.gain.linearRampToValueAtTime(0.001, now + safeDur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      bendFn = (newFreq: number) => osc1.frequency.setValueAtTime(newFreq, ctx.currentTime);
    }

    return { stop: stopFn, bendPitch: bendFn };
  }

  // Play Percussion Bol (Pakhawaj / Membranophones)
  public playBol(
    bolName: string, 
    pitch: number = 110, 
    decay: number = 1.2, 
    head: 'left_bass' | 'right_treble' | 'both' = 'both'
  ) {
    const ctx = this.init();
    this.unlockMobileAudio();
    const now = ctx.currentTime;
    const safeDecay = Math.max(0.2, decay);

    if (head === 'left_bass' || head === 'both') {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(pitch * 1.4, now);
      bassOsc.frequency.linearRampToValueAtTime(pitch * 0.7, now + 0.12);

      bassGain.gain.setValueAtTime(0.01, now);
      bassGain.gain.linearRampToValueAtTime(1.0, now + 0.008);
      bassGain.gain.linearRampToValueAtTime(0.001, now + safeDecay);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(now);
      bassOsc.stop(now + safeDecay);
    }

    if (head === 'right_treble' || head === 'both') {
      const trebleOsc = ctx.createOscillator();
      const trebleGain = ctx.createGain();

      trebleOsc.type = 'triangle';
      trebleOsc.frequency.setValueAtTime(bolName === 'Ta' ? 293 : bolName === 'Tit' ? 220 : 261, now);

      trebleGain.gain.setValueAtTime(0.01, now);
      trebleGain.gain.linearRampToValueAtTime(0.95, now + 0.005);
      trebleGain.gain.linearRampToValueAtTime(0.001, now + (bolName === 'Ta' || bolName === 'Tit' ? 0.35 : safeDecay * 0.8));

      trebleOsc.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      trebleOsc.start(now);
      trebleOsc.stop(now + safeDecay);
    }
  }

  // 🥁 Background Rhythmic Tabla/Pakhawaj Percussion Engine
  public startRhythmBeat(bpm: number = 130) {
    this.stopRhythmBeat();
    const intervalMs = (60 / Math.max(40, bpm)) * 500;
    let step = 0;

    const pattern = ['Dha', 'Ta', 'Dhin', 'Ta', 'Ge', 'Tit', 'Dha', 'Dhin'];

    this.rhythmInterval = window.setInterval(() => {
      const bol = pattern[step % pattern.length];
      const isBass = bol === 'Dha' || bol === 'Ge';
      this.playBol(bol, isBass ? 85 : 220, 0.4, isBass ? 'both' : 'right_treble');
      step++;
    }, intervalMs);

    this.isRhythmBeatPlaying = true;
  }

  public stopRhythmBeat() {
    if (this.rhythmInterval) {
      clearInterval(this.rhythmInterval);
      this.rhythmInterval = null;
    }
    this.isRhythmBeatPlaying = false;
  }

  public getRhythmBeatStatus(): boolean {
    return this.isRhythmBeatPlaying;
  }

  // Toggle Background Classical Tanpura Drone
  public toggleDrone(baseFreq: number = 130.81): boolean {
    const ctx = this.init();
    this.unlockMobileAudio();
    const now = ctx.currentTime;

    if (this.isDronePlaying && this.droneNodes) {
      this.droneNodes.gain.gain.setValueAtTime(0.001, now);
      setTimeout(() => {
        try {
          this.droneNodes?.osc1.stop();
          this.droneNodes?.osc2.stop();
          this.droneNodes = null;
        } catch {}
      }, 100);
      this.isDronePlaying = false;
      return false;
    } else {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(baseFreq, now);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      droneGain.gain.setValueAtTime(0.01, now);
      droneGain.gain.linearRampToValueAtTime(0.25, now + 1.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);

      this.droneNodes = { osc1, osc2, gain: droneGain };
      this.isDronePlaying = true;
      return true;
    }
  }

  public getDroneStatus(): boolean {
    return this.isDronePlaying;
  }
}

export const soundEngine = new SoundEngine();

// Auto-unlock Web Audio pipeline on first mobile touch or interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'];
  const unlockHandler = () => {
    soundEngine.unlockMobileAudio();
    unlockEvents.forEach((ev) => window.removeEventListener(ev, unlockHandler));
  };
  unlockEvents.forEach((ev) => {
    window.addEventListener(ev, unlockHandler, { passive: true, once: true });
  });
}
