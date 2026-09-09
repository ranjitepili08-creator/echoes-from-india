import { Instrument } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private droneNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;
  private isDronePlaying = false;
  private rhythmInterval: number | null = null;
  private isRhythmBeatPlaying = false;

  // Initialize Web Audio Context upon user interaction
  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.9;

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

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  // Jivari WaveShaper curve generator for authentic buzzing bridge harmonic dispersion
  private makeJivariCurve(amount: number = 0.6): Float32Array {
    const k = typeof amount === 'number' ? amount * 45 : 25;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x)) + 0.15 * Math.sin(x * Math.PI * 3);
    }
    return curve;
  }

  // Play Note based on Instrument Organology & Timbre Type
  public playNote(
    freq: number, 
    instrument: Instrument, 
    duration: number = 1.8, 
    velocity: number = 0.95
  ): { stop: () => void; bendPitch: (newFreq: number) => void } {
    const ctx = this.init();
    const now = ctx.currentTime;
    const timbre = instrument?.acousticProfile?.timbreType || 'plucked_wire';
    const instId = instrument?.id || '';

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
      bassOsc.frequency.setValueAtTime(Math.min(freq * 0.5, 120), now);
      bassOsc.frequency.exponentialRampToValueAtTime(Math.min(freq * 0.25, 60), now + 0.18);

      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(velocity * 0.95, now + 0.005);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.7, duration));

      // Treble head: tuned syahi metallic ring with harmonic overtones
      trebleOsc1.type = 'triangle';
      trebleOsc1.frequency.setValueAtTime(freq, now);

      trebleOsc2.type = 'sine';
      trebleOsc2.frequency.setValueAtTime(freq * 2.01, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(4.0, now);

      trebleGain.gain.setValueAtTime(0, now);
      trebleGain.gain.linearRampToValueAtTime(velocity * 0.9, now + 0.003);
      trebleGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.5, duration * 0.8));

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      trebleOsc1.connect(filter);
      trebleOsc2.connect(filter);
      filter.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      bassOsc.start(now);
      trebleOsc1.start(now);
      trebleOsc2.start(now);
      bassOsc.stop(now + duration);
      trebleOsc1.stop(now + duration);
      trebleOsc2.stop(now + duration);

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
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 3.5, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.8, now + 0.2);
      filter.Q.setValueAtTime(7.0, now); // sharp formant pole

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.9, now + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.min(1.2, duration));

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);

    } else if (timbre === 'plucked_silk' || instId === 'yazh') {
      // 🪕 YAZH: Ancient silk string over parchment soundboard
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq * 0.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + duration);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.9, now + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(velocity * 0.35, now + 0.25);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration);
      subOsc.stop(now + duration);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      bendFn = (newFreq: number) => osc.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.03);

    } else if (timbre === 'plucked_wire' || instId === 'rudra-veena' || instId === 'kinnera') {
      // 🪕 RUDRA VEENA / KINNERA: Plucked wire with Jivari buzzing bridge
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const jivariShaper = ctx.createWaveShaper();
      const bodyFilter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.002, now);

      (jivariShaper as any).curve = this.makeJivariCurve(instrument?.acousticProfile?.jawariBuzz || 0.7);
      jivariShaper.oversample = '2x';

      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(instrument?.acousticProfile?.bodyResonanceFreq || 120, now);
      bodyFilter.Q.setValueAtTime(2.8, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.95, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(velocity * 0.45, now + 0.4);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(jivariShaper);
      osc2.connect(jivariShaper);
      jivariShaper.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
      bendFn = (newFreq: number) => {
        osc1.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.04);
        osc2.frequency.setTargetAtTime(newFreq * 2.002, ctx.currentTime, 0.04);
      };

    } else if (timbre === 'percussive_ceramic' || instId === 'jal-tarang') {
      // 🥣 JAL TARANG: Water-tuned porcelain bowls
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, now);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(velocity * 0.35, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.95, now + 0.004);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gainNode);
      osc2.connect(gain2);
      gain2.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.03);

    } else if (timbre === 'bowed_folk' || instId === 'mayuri-veena' || instId === 'ravanahatha' || instId === 'pena' || instId === 'pinaka-veena') {
      // 🎻 BOWED FOLK STRINGS (Mayuri Taus, Ravanahatha, Pena, Pinaka)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(2800, freq * 4), now);
      filter.Q.setValueAtTime(2.0, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.9, now + 0.04);
      gainNode.gain.setValueAtTime(velocity * 0.8, now + duration * 0.7);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration);

      stopFn = () => gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.06);
      bendFn = (newFreq: number) => osc.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.03);

    } else {
      // 🪈 WIND & HORNS (Algoza, Nagfani, Shankha)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = timbre === 'conch_horn' ? 'sawtooth' : 'triangle';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * (timbre === 'conch_horn' ? 1.5 : 2.0), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(timbre === 'conch_horn' ? 950 : 2200, now);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocity * 0.85, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain!);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);

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

    if (head === 'left_bass' || head === 'both') {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(pitch * 1.35, now);
      bassOsc.frequency.exponentialRampToValueAtTime(pitch * 0.75, now + 0.12);

      bassGain.gain.setValueAtTime(0, now);
      bassGain.gain.linearRampToValueAtTime(0.9, now + 0.008);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(now);
      bassOsc.stop(now + decay);
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

      trebleGain.gain.setValueAtTime(0, now);
      trebleGain.gain.linearRampToValueAtTime(0.85, now + 0.005);
      trebleGain.gain.exponentialRampToValueAtTime(0.0001, now + (bolName === 'Ta' || bolName === 'Tit' ? 0.35 : decay * 0.8));

      trebleOsc.connect(filter);
      filter.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      trebleOsc.start(now);
      trebleOsc.stop(now + decay);
    }
  }

  // 🥁 Background Rhythmic Tabla/Pakhawaj Percussion Engine for Rhythm Game
  public startRhythmBeat(bpm: number = 130) {
    this.stopRhythmBeat();
    const intervalMs = (60 / bpm) * 500; // eighth-note pulse
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

      droneGain.gain.setValueAtTime(0, now);
      droneGain.gain.linearRampToValueAtTime(0.18, now + 1.5);

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
