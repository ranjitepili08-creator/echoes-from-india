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
      this.masterGain.gain.setValueAtTime(0.95, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Special mobile unlocker for iOS Safari & Android Web Audio pipeline
  public unlockMobileAudio() {
    try {
      const ctx = this.init();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Play 1-sample silent buffer to unlock iOS audio subsystem
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
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
      this.masterGain.gain.setTargetAtTime(Math.max(0.0001, Math.min(1, vol)), ctx.currentTime, 0.05);
    }
  }

  // Play Note based on Instrument Organology & Timbre Type
  public playNote(
    freq: number = 261.63, 
    instrument?: Instrument, 
    duration: number = 1.8, 
    velocity: number = 0.95
  ): { stop: () => void; bendPitch: (newFreq: number) => void } {
    const ctx = this.init();
    const now = ctx.currentTime;
    const timbre = instrument?.acousticProfile?.timbreType || 'plucked_wire';
    const instId = instrument?.id || '';
    const safeFreq = Math.max(40, Math.min(4000, freq || 261.63));
    const safeDur = Math.max(0.2, duration || 1.8);
    const safeVel = Math.max(0.1, Math.min(1.0, velocity || 0.95));

    let stopFn = () => {};
    let bendFn = (_newFreq: number) => {};

    if (timbre === 'percussive_membrane' || instId === 'pakhawaj') {
      // 🥁 DRUMS & MEMBRANOPHONES (Pakhawaj, Tabla, Mridangam)
      // Combines bass wheat-dough pitch drop + black iron-ore syahi harmonics
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const trebleOsc1 = ctx.createOscillator();
      const trebleOsc2 = ctx.createOscillator();
      const trebleGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bass head: pitch drops swiftly with resonant warmth
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(Math.min(safeFreq * 0.6, 130), now);
      bassOsc.frequency.exponentialRampToValueAtTime(Math.min(safeFreq * 0.28, 55), now + 0.18);

      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.008);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.6, safeDur));

      // Treble head: tuned syahi metallic ring with harmonic overtones
      trebleOsc1.type = 'triangle';
      trebleOsc1.frequency.setValueAtTime(safeFreq, now);

      trebleOsc2.type = 'sine';
      trebleOsc2.frequency.setValueAtTime(safeFreq * 2.01, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(safeFreq * 1.5, now);
      filter.Q.setValueAtTime(3.5, now);

      trebleGain.gain.setValueAtTime(0.0001, now);
      trebleGain.gain.linearRampToValueAtTime(safeVel * 0.9, now + 0.005);
      trebleGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.4, safeDur * 0.75));

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      trebleOsc1.connect(filter);
      trebleOsc2.connect(filter);
      filter.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      bassOsc.start(now);
      trebleOsc1.start(now);
      trebleOsc2.start(now);
      bassOsc.stop(now + safeDur);
      trebleOsc1.stop(now + safeDur);
      trebleOsc2.stop(now + safeDur);

      stopFn = () => {
        bassGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
        trebleGain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.04);
      };

    } else if (instId === 'morchang') {
      // 👄 MORCHANG / MORSING: Metallic reed with dynamic oral cavity formant
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(safeFreq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(safeFreq * 3.5, now);
      filter.frequency.exponentialRampToValueAtTime(safeFreq * 1.8, now + 0.2);
      filter.Q.setValueAtTime(6.0, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(1.4, safeDur));

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + safeDur);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);

    } else if (timbre === 'plucked_silk' || instId === 'yazh') {
      // 🪕 YAZH: Ancient silk string over parchment soundboard
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(safeFreq, now);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(safeFreq * 0.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + safeDur);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(safeVel * 0.35, now + 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + safeDur);
      subOsc.stop(now + safeDur);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      bendFn = (newFreq: number) => osc.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.03);

    } else if (timbre === 'plucked_wire' || instId === 'rudra-veena' || instId === 'kinnera') {
      // 🪕 RUDRA VEENA / KINNERA: Plucked wire with Jivari buzzing bridge
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const buzzOsc = ctx.createOscillator();
      const bodyFilter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(safeFreq * 2.002, now);

      // Jivari buzzing overtone oscillator
      buzzOsc.type = 'sawtooth';
      buzzOsc.frequency.setValueAtTime(safeFreq * 3.01, now);

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(2800, now);
      bodyFilter.frequency.exponentialRampToValueAtTime(700, now + safeDur);
      bodyFilter.Q.setValueAtTime(2.5, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(safeVel * 0.4, now + 0.35);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

      osc1.connect(bodyFilter);
      osc2.connect(bodyFilter);
      buzzOsc.connect(bodyFilter);
      bodyFilter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      buzzOsc.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);
      buzzOsc.stop(now + safeDur);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      bendFn = (newFreq: number) => {
        osc1.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.04);
        osc2.frequency.setTargetAtTime(newFreq * 2.002, ctx.currentTime, 0.04);
        buzzOsc.frequency.setTargetAtTime(newFreq * 3.01, ctx.currentTime, 0.04);
      };

    } else if (timbre === 'percussive_ceramic' || instId === 'jal-tarang') {
      // 🥣 JAL TARANG: Water-tuned porcelain bowls
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(safeFreq * 2.76, now);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(safeVel * 0.35, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

      osc1.connect(gainNode);
      osc2.connect(gain2);
      gain2.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);

    } else if (timbre === 'bowed_folk' || instId === 'mayuri-veena' || instId === 'ravanahatha' || instId === 'pena' || instId === 'pinaka-veena') {
      // 🎻 BOWED FOLK STRINGS (Mayuri Taus, Ravanahatha, Pena, Pinaka)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(safeFreq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(safeFreq * 1.003, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(3200, safeFreq * 4.5), now);
      filter.Q.setValueAtTime(2.2, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(safeVel * 0.6, now + safeDur * 0.6);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
      bendFn = (newFreq: number) => {
        osc1.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.03);
        osc2.frequency.setTargetAtTime(newFreq * 1.003, ctx.currentTime, 0.03);
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
      osc2.frequency.setValueAtTime(safeFreq * (timbre === 'conch_horn' ? 1.5 : 2.0), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(timbre === 'conch_horn' ? 1100 : 2500, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(safeVel * 0.9, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + safeDur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + safeDur);
      osc2.stop(now + safeDur);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      bendFn = (newFreq: number) => osc1.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.04);
    }

    return { stop: stopFn, bendPitch: bendFn };
  }

  // Play Percussion Bol (Pakhawaj / Membranophones)
  public playBol(
    bolName: string, 
    pitch: number = 110, 
    decay: number = 1.5, 
    head: 'left_bass' | 'right_treble' | 'both' = 'both'
  ) {
    const ctx = this.init();
    const now = ctx.currentTime;
    const safeDecay = Math.max(0.2, decay);

    if (head === 'left_bass' || head === 'both') {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(pitch * 1.35, now);
      bassOsc.frequency.exponentialRampToValueAtTime(pitch * 0.75, now + 0.12);

      bassGain.gain.setValueAtTime(0.0001, now);
      bassGain.gain.linearRampToValueAtTime(0.95, now + 0.008);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + safeDecay);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(now);
      bassOsc.stop(now + safeDecay);
    }

    if (head === 'right_treble' || head === 'both') {
      const trebleOsc = ctx.createOscillator();
      const trebleGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      trebleOsc.type = 'triangle';
      trebleOsc.frequency.setValueAtTime(bolName === 'Ta' ? 293 : bolName === 'Tit' ? 220 : 261, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(bolName === 'Ta' ? 1200 : 550, now);
      filter.Q.setValueAtTime(4.0, now);

      trebleGain.gain.setValueAtTime(0.0001, now);
      trebleGain.gain.linearRampToValueAtTime(0.9, now + 0.005);
      trebleGain.gain.exponentialRampToValueAtTime(0.0001, now + (bolName === 'Ta' || bolName === 'Tit' ? 0.35 : safeDecay * 0.8));

      trebleOsc.connect(filter);
      filter.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      trebleOsc.start(now);
      trebleOsc.stop(now + safeDecay);
    }
  }

  // 🥁 Background Rhythmic Tabla/Pakhawaj Percussion Engine for Rhythm Game
  public startRhythmBeat(bpm: number = 130) {
    this.stopRhythmBeat();
    const intervalMs = (60 / Math.max(40, bpm)) * 500; // eighth-note pulse
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
    const now = ctx.currentTime;

    if (this.isDronePlaying && this.droneNodes) {
      this.droneNodes.gain.gain.setTargetAtTime(0.0001, now, 0.2);
      setTimeout(() => {
        try {
          this.droneNodes?.osc1.stop();
          this.droneNodes?.osc2.stop();
          this.droneNodes = null;
        } catch {}
      }, 300);
      this.isDronePlaying = false;
      return false;
    } else {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const droneGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(baseFreq, now); // Sa

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(baseFreq * 1.5, now); // Pa

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      droneGain.gain.setValueAtTime(0.0001, now);
      droneGain.gain.linearRampToValueAtTime(0.2, now + 1.2);

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


