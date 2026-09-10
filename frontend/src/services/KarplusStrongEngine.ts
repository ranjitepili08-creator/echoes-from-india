/**
 * Karplus-Strong Physical Modeling String Synthesis Audio Engine
 * Real-time dynamic string excitation with Jivari bridge buzzing and resonant body filtering.
 */

export type InstrumentStringPreset = 'sitar' | 'tanpura' | 'sarod' | 'yazh' | 'rudra_veena';

export interface RagaScale {
  id: string;
  name: string;
  sanskrit: string;
  vadi: string;
  intervals: number[]; // semitone offsets from Sa (0)
  swaras: string[];
}

export const RAGA_SCALES: RagaScale[] = [
  {
    id: 'bilawal',
    name: 'Raga Bilawal (Natural / Shuddha)',
    sanskrit: 'बिलावल',
    vadi: 'Dha',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    swaras: ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Sa\'']
  },
  {
    id: 'yaman',
    name: 'Raga Yaman (Teevra Ma)',
    sanskrit: 'यमन',
    vadi: 'Ga',
    intervals: [0, 2, 4, 6, 7, 9, 11, 12],
    swaras: ['Sa', 'Re', 'Ga', 'Ma(T)', 'Pa', 'Dha', 'Ni', 'Sa\'']
  },
  {
    id: 'bhairav',
    name: 'Raga Bhairav (Komal Re & Dha)',
    sanskrit: 'भैरव',
    vadi: 'Dha',
    intervals: [0, 1, 4, 5, 7, 8, 11, 12],
    swaras: ['Sa', 're', 'Ga', 'Ma', 'Pa', 'dha', 'Ni', 'Sa\'']
  },
  {
    id: 'bhairavi',
    name: 'Raga Bhairavi (All Komal)',
    sanskrit: 'भैरवी',
    vadi: 'Ma',
    intervals: [0, 1, 3, 5, 7, 8, 10, 12],
    swaras: ['Sa', 're', 'ga', 'Ma', 'Pa', 'dha', 'ni', 'Sa\'']
  },
  {
    id: 'kafi',
    name: 'Raga Kafi (Komal Ga & Ni)',
    sanskrit: 'काफ़ी',
    vadi: 'Pa',
    intervals: [0, 2, 3, 5, 7, 9, 10, 12],
    swaras: ['Sa', 'Re', 'ga', 'Ma', 'Pa', 'Dha', 'ni', 'Sa\'']
  }
];

export class KarplusStrongEngine {
  private static instance: KarplusStrongEngine;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isDronePlaying = false;
  private jivariShaperCurve: Float32Array | null = null;

  private constructor() {}

  public static getInstance(): KarplusStrongEngine {
    if (!KarplusStrongEngine.instance) {
      KarplusStrongEngine.instance = new KarplusStrongEngine();
    }
    return KarplusStrongEngine.instance;
  }

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Tanpura Drone Sub-mix
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.droneGain.connect(this.masterGain);

      this.buildJivariCurve();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public isReady(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /**
   * Generates a non-linear transfer function simulating wide bone Jivari buzzing overtones.
   */
  private buildJivariCurve(): void {
    const samples = 1024;
    const curve = new Float32Array(samples);
    const k = 2.5;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Asymmetric parabolic clipping creates rich even & odd Bessel harmonics
      if (x < -0.3) {
        curve[i] = -0.3 + (x + 0.3) * 0.4;
      } else {
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
      }
    }
    this.jivariShaperCurve = curve;
  }

  /**
   * Synthesizes an authentic Karplus-Strong plucked acoustic string.
   */
  public pluckString(
    frequency: number,
    velocity: number = 0.8,
    decaySeconds: number = 2.8,
    preset: InstrumentStringPreset = 'sitar'
  ): void {
    const ctx = this.init();
    if (!ctx || frequency <= 20) return;

    const sampleRate = ctx.sampleRate;
    const clampedVel = Math.max(0.15, Math.min(1.0, velocity));

    // Calculate delay line period (samples per cycle)
    const periodSamples = Math.max(2, Math.round(sampleRate / frequency));

    // Determine duration based on instrument preset
    let sustainMultiplier = 1.0;
    let feedbackGain = 0.992;
    let jivariDepth = 0.4;

    switch (preset) {
      case 'sitar':
        sustainMultiplier = 1.3;
        feedbackGain = 0.994;
        jivariDepth = 0.55;
        break;
      case 'tanpura':
        sustainMultiplier = 1.6;
        feedbackGain = 0.997;
        jivariDepth = 0.7;
        break;
      case 'sarod':
        sustainMultiplier = 0.9;
        feedbackGain = 0.988;
        jivariDepth = 0.2;
        break;
      case 'yazh':
        sustainMultiplier = 1.0;
        feedbackGain = 0.991;
        jivariDepth = 0.08;
        break;
      case 'rudra_veena':
        sustainMultiplier = 1.4;
        feedbackGain = 0.995;
        jivariDepth = 0.65;
        break;
    }

    const totalSeconds = Math.max(0.6, decaySeconds * sustainMultiplier);
    const totalSamples = Math.floor(sampleRate * totalSeconds);

    // 1. Create AudioBuffer for Karplus-Strong delay loop
    const audioBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // 2. Excitation noise pulse with velocity envelope
    const noiseBurstSamples = Math.min(periodSamples, Math.round(sampleRate * 0.008));
    for (let i = 0; i < noiseBurstSamples; i++) {
      // Shaped impulse excitation
      const windowCoeff = Math.sin((Math.PI * i) / noiseBurstSamples);
      channelData[i] = (Math.random() * 2 - 1) * windowCoeff * clampedVel;
    }

    // 3. Karplus-Strong Recurrence Loop with Loss Filter:
    // y[n] = feedback * 0.5 * (y[n - L] + y[n - L - 1])
    let prevSample = 0;
    for (let i = noiseBurstSamples; i < totalSamples; i++) {
      const delayedIndex = i - periodSamples;
      if (delayedIndex >= 0) {
        const delayedSample = channelData[delayedIndex];
        // Low-pass averaging filter (string stiffness & loss)
        const filtered = 0.5 * (delayedSample + prevSample) * feedbackGain;
        channelData[i] = filtered;
        prevSample = delayedSample;
      }
    }

    // 4. Playback Graph
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = audioBuffer;

    // Resonant body acoustic filter
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'peaking';
    bodyFilter.frequency.value = frequency * 2.2;
    bodyFilter.Q.value = 3.0;
    bodyFilter.gain.value = 4.0;

    // Lowpass cutoff for organic warmth
    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = Math.min(8000, frequency * 6);

    // Jivari Non-linear WaveShaper
    let waveshaper: WaveShaperNode | null = null;
    if (this.jivariShaperCurve && jivariDepth > 0.1) {
      waveshaper = ctx.createWaveShaper();
      waveshaper.curve = this.jivariShaperCurve as any;
      waveshaper.oversample = '2x';
    }

    // Dynamic Pluck Gain Envelope
    const pluckGain = ctx.createGain();
    const now = ctx.currentTime;
    pluckGain.gain.setValueAtTime(0.001, now);
    pluckGain.gain.exponentialRampToValueAtTime(clampedVel, now + 0.006);
    pluckGain.gain.exponentialRampToValueAtTime(0.001, now + totalSeconds);

    // Connect Audio Nodes
    if (waveshaper) {
      bufferSource.connect(waveshaper);
      waveshaper.connect(bodyFilter);
    } else {
      bufferSource.connect(bodyFilter);
    }

    bodyFilter.connect(warmFilter);
    warmFilter.connect(pluckGain);
    pluckGain.connect(this.masterGain || ctx.destination);

    bufferSource.start(now);
    bufferSource.stop(now + totalSeconds);
  }

  /**
   * Continuous Tanpura Drone Background Bed (Sa - Pa - Sa')
   */
  public toggleTanpuraDrone(rootSaFreq: number = 130.81): boolean {
    const ctx = this.init();
    if (!ctx) return false;

    if (this.isDronePlaying) {
      this.stopTanpuraDrone();
      return false;
    }

    const pitches = [
      { f: rootSaFreq * 1.5, type: 'triangle' as OscillatorType, vol: 0.15 }, // Pa (G3)
      { f: rootSaFreq, type: 'sawtooth' as OscillatorType, vol: 0.18 },       // Sa (C3)
      { f: rootSaFreq * 2, type: 'triangle' as OscillatorType, vol: 0.12 },   // Sa' (C4)
      { f: rootSaFreq * 0.5, type: 'sine' as OscillatorType, vol: 0.22 }      // Kharaj Sa (C2)
    ];

    const now = ctx.currentTime;
    this.droneOscs = pitches.map(({ f, type, vol }) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(f, now);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 650;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(vol, now + 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.droneGain || ctx.destination);

      osc.start(now);
      return { osc, gain };
    });

    this.isDronePlaying = true;
    return true;
  }

  public stopTanpuraDrone(): void {
    if (!this.ctx || !this.isDronePlaying) return;
    const now = this.ctx.currentTime;
    this.droneOscs.forEach(({ osc, gain }) => {
      try {
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        }, 900);
      } catch {}
    });
    this.droneOscs = [];
    this.isDronePlaying = false;
  }

  public isDroneActive(): boolean {
    return this.isDronePlaying;
  }

  public setMasterVolume(val: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
    }
  }
}

export const karplusEngine = KarplusStrongEngine.getInstance();
