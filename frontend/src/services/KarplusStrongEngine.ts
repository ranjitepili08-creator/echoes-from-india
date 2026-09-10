/**
 * Karplus-Strong & Physical Acoustic Modeling Audio Engine
 * Real-time dynamic string excitation with Jivari bridge buzzing, Helmholtz gourd resonance,
 * bow friction slip-stick, oral cavity formant filters, ceramic water modes, and parchment drum acoustics.
 */

export type InstrumentStringPreset = 
  | 'sitar' 
  | 'tanpura' 
  | 'sarod' 
  | 'yazh' 
  | 'rudra-veena' 
  | 'rudra_veena' 
  | 'mayuri-veena' 
  | 'kinnera' 
  | 'pena' 
  | 'ravanahatha' 
  | 'morchang' 
  | 'jal-tarang' 
  | 'pakhawaj' 
  | 'algoza' 
  | 'nagfani' 
  | 'pinaka-veena';

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
  private morchangShaperCurve: Float32Array | null = null;

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
      this.buildMorchangCurve();
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
   * Non-linear transfer function simulating wide bone Jivari buzzing overtones
   */
  private buildJivariCurve(): void {
    const samples = 1024;
    const curve = new Float32Array(samples);
    const k = 2.8;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      if (x < -0.25) {
        curve[i] = -0.25 + (x + 0.25) * 0.35;
      } else {
        curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x));
      }
    }
    this.jivariShaperCurve = curve;
  }

  /**
   * Transfer curve for flexible high-carbon steel reed twang (Morchang)
   */
  private buildMorchangCurve(): void {
    const samples = 1024;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Asymmetric polynomial saturation with prominent 3rd and 5th harmonic punch
      curve[i] = Math.tanh(x * 3.2) * 0.85 + Math.sin(x * Math.PI) * 0.15;
    }
    this.morchangShaperCurve = curve;
  }

  /**
   * Helper to create brief parchment / skin impact transient
   */
  private createSkinImpact(ctx: AudioContext, now: number, freq: number, dur: number, gainVal: number) {
    try {
      const bufferSize = Math.floor(ctx.sampleRate * Math.max(0.01, dur));
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(freq, now);
      bp.Q.setValueAtTime(3.0, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gainVal, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      noise.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain || ctx.destination);
      noise.start(now);
      noise.stop(now + dur);
    } catch {}
  }

  /**
   * Synthesizes distinct physical acoustics matching the selected Indian instrument organology.
   */
  public pluckString(
    frequency: number,
    velocity: number = 0.8,
    decaySeconds: number = 2.8,
    preset: InstrumentStringPreset = 'sitar',
    normalizedModulation: number = 0.5 // 0.0 to 1.0 vertical gesture position
  ): void {
    const ctx = this.init();
    if (!ctx || frequency <= 20) return;

    const sampleRate = ctx.sampleRate;
    const clampedVel = Math.max(0.15, Math.min(1.0, velocity));
    const now = ctx.currentTime;
    const normalizedPreset = preset.toLowerCase().replace(/_/g, '-') as InstrumentStringPreset;

    // -------------------------------------------------------------
    // 1. 🥣 JAL TARANG: Water-tuned porcelain ceramic bowls
    // -------------------------------------------------------------
    if (normalizedPreset === 'jal-tarang') {
      const dur = Math.max(0.6, decaySeconds * 0.8);
      // Mode 1: Pure fundamental chime
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(frequency, now);

      // Mode 2: Non-harmonic Bessel ceramic overtone (2.76 * f0)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(frequency * 2.76, now);

      // Mode 3: Higher glass rim sheen (5.4 * f0)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(frequency * 5.4, now);

      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      const g3 = ctx.createGain();

      g1.gain.setValueAtTime(0.001, now);
      g1.gain.linearRampToValueAtTime(clampedVel * 0.85, now + 0.004);
      g1.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      g2.gain.setValueAtTime(0.001, now);
      g2.gain.linearRampToValueAtTime(clampedVel * 0.35, now + 0.003);
      g2.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.35);

      g3.gain.setValueAtTime(0.001, now);
      g3.gain.linearRampToValueAtTime(clampedVel * 0.15, now + 0.002);
      g3.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.15);

      osc1.connect(g1);
      osc2.connect(g2);
      osc3.connect(g3);

      g1.connect(this.masterGain || ctx.destination);
      g2.connect(this.masterGain || ctx.destination);
      g3.connect(this.masterGain || ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);
      osc3.stop(now + dur);
      return;
    }

    // -------------------------------------------------------------
    // 2. 👄 MORCHANG: Spring-steel lamella with oral vowel filtering
    // -------------------------------------------------------------
    if (normalizedPreset === 'morchang') {
      const dur = Math.max(0.4, Math.min(1.4, decaySeconds * 0.5));
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);

      // Dynamic oral cavity formant filter sweeping with finger height
      // F1: 380Hz to 900Hz, F2: 1100Hz to 2800Hz
      const f1Freq = 380 + normalizedModulation * 520;
      const f2Freq = 1100 + normalizedModulation * 1600;

      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(f1Freq, now);
      f1.Q.setValueAtTime(5.5, now);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(f2Freq, now);
      f2.Q.setValueAtTime(7.0, now);

      const reedGain = ctx.createGain();
      reedGain.gain.setValueAtTime(0.001, now);
      reedGain.gain.linearRampToValueAtTime(clampedVel * 1.0, now + 0.005);
      reedGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      let shaper: WaveShaperNode | null = null;
      if (this.morchangShaperCurve) {
        shaper = ctx.createWaveShaper();
        shaper.curve = this.morchangShaperCurve as any;
        shaper.oversample = '2x';
      }

      if (shaper) {
        osc.connect(shaper);
        shaper.connect(f1);
        shaper.connect(f2);
      } else {
        osc.connect(f1);
        osc.connect(f2);
      }

      f1.connect(reedGain);
      f2.connect(reedGain);
      reedGain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
      return;
    }

    // -------------------------------------------------------------
    // 3. 🥁 PAKHAWAJ: Dual drumhead strike (Wheat dough + Iron syahi)
    // -------------------------------------------------------------
    if (normalizedPreset === 'pakhawaj') {
      const dur = Math.max(0.5, decaySeconds * 0.6);
      const baseBass = frequency < 160 ? frequency : 82;

      // Parchment slap transient
      this.createSkinImpact(ctx, now, 1600, 0.03, clampedVel * 0.5);

      // Bayan sub-bass dough sweep
      const bassOsc = ctx.createOscillator();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(baseBass * 1.6, now);
      bassOsc.frequency.exponentialRampToValueAtTime(baseBass, now + 0.06);

      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(240, now);
      bassFilter.Q.setValueAtTime(2.0, now);

      const bassGain = ctx.createGain();
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(clampedVel * 0.95, now + 0.006);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain || ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + dur);

      // Dayan Syahi metallic ring
      const syahiOsc = ctx.createOscillator();
      syahiOsc.type = 'sine';
      syahiOsc.frequency.setValueAtTime(frequency * 1.05, now);
      syahiOsc.frequency.exponentialRampToValueAtTime(frequency, now + 0.02);

      const syahiFilter = ctx.createBiquadFilter();
      syahiFilter.type = 'bandpass';
      syahiFilter.frequency.setValueAtTime(frequency * 1.5, now);
      syahiFilter.Q.setValueAtTime(3.5, now);

      const syahiGain = ctx.createGain();
      syahiGain.gain.setValueAtTime(0.001, now);
      syahiGain.gain.linearRampToValueAtTime(clampedVel * 0.7, now + 0.004);
      syahiGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.6);

      syahiOsc.connect(syahiFilter);
      syahiFilter.connect(syahiGain);
      syahiGain.connect(this.masterGain || ctx.destination);

      syahiOsc.start(now);
      syahiOsc.stop(now + dur * 0.6);
      return;
    }

    // -------------------------------------------------------------
    // 4. 🪈 ALGOZA & NAGFANI: Aerophones & Brass Horns
    // -------------------------------------------------------------
    if (normalizedPreset === 'algoza' || normalizedPreset === 'nagfani') {
      const dur = Math.max(0.6, decaySeconds * 0.7);
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = normalizedPreset === 'nagfani' ? 'sawtooth' : 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(frequency, now);
      osc2.frequency.setValueAtTime(frequency * 2.002, now);

      const f = ctx.createBiquadFilter();
      f.type = normalizedPreset === 'nagfani' ? 'bandpass' : 'lowpass';
      f.frequency.setValueAtTime(normalizedPreset === 'nagfani' ? frequency * 2.2 : 2400, now);
      f.Q.setValueAtTime(normalizedPreset === 'nagfani' ? 3.0 : 1.0, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(clampedVel * 0.8, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc1.connect(f);
      osc2.connect(f);
      f.connect(g);
      g.connect(this.masterGain || ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);
      return;
    }

    // -------------------------------------------------------------
    // 5. 🎻 BOWED CHORDOPHONES (Mayuri Veena, Ravanahatha, Pena, Pinaka)
    // -------------------------------------------------------------
    if (
      normalizedPreset === 'mayuri-veena' || 
      normalizedPreset === 'ravanahatha' || 
      normalizedPreset === 'pena' || 
      normalizedPreset === 'pinaka-veena'
    ) {
      const dur = Math.max(0.8, decaySeconds * 1.1);

      // Bow friction sawtooth + triangle body
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(frequency, now);
      osc2.frequency.setValueAtTime(frequency * 1.002, now);

      // Body resonator filter
      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = 'bandpass';
      const bodyCenter = normalizedPreset === 'mayuri-veena' ? 220 
        : normalizedPreset === 'ravanahatha' ? 310 
        : normalizedPreset === 'pena' ? 340 
        : 145;
      bodyFilter.frequency.setValueAtTime(bodyCenter, now);
      bodyFilter.Q.setValueAtTime(2.2, now);

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(3400, now);

      const bowGain = ctx.createGain();
      bowGain.gain.setValueAtTime(0.001, now);
      bowGain.gain.linearRampToValueAtTime(clampedVel * 0.85, now + 0.04);
      bowGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      osc1.connect(bodyFilter);
      osc2.connect(lpFilter);
      bodyFilter.connect(bowGain);
      lpFilter.connect(bowGain);
      bowGain.connect(this.masterGain || ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + dur);
      osc2.stop(now + dur);

      // For Pena & Ravanahatha: Add distinct Ghungroo / Bell chimes on plucks!
      if (normalizedPreset === 'ravanahatha' || normalizedPreset === 'pena') {
        const bellOsc = ctx.createOscillator();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(3200 + Math.random() * 400, now);
        const bellGain = ctx.createGain();
        bellGain.gain.setValueAtTime(clampedVel * 0.25, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        bellOsc.connect(bellGain);
        bellGain.connect(this.masterGain || ctx.destination);
        bellOsc.start(now);
        bellOsc.stop(now + 0.12);
      }

      // For Mayuri: Add 30-string sympathetic Tarab halo
      if (normalizedPreset === 'mayuri-veena') {
        const tarabOsc = ctx.createOscillator();
        tarabOsc.type = 'sine';
        tarabOsc.frequency.setValueAtTime(frequency * 1.5, now);
        const tarabGain = ctx.createGain();
        tarabGain.gain.setValueAtTime(0.001, now);
        tarabGain.gain.linearRampToValueAtTime(clampedVel * 0.2, now + 0.08);
        tarabGain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 1.2);
        tarabOsc.connect(tarabGain);
        tarabGain.connect(this.masterGain || ctx.destination);
        tarabOsc.start(now);
        tarabOsc.stop(now + dur * 1.2);
      }
      return;
    }

    // -------------------------------------------------------------
    // 6. 🪕 PLUCKED CHORDOPHONES (Yazh, Rudra Veena, Kinnera, Sitar, Sarod, Tanpura)
    // -------------------------------------------------------------
    const periodSamples = Math.max(2, Math.round(sampleRate / frequency));

    let sustainMultiplier = 1.0;
    let feedbackGain = 0.992;
    let jivariDepth = 0.4;
    let isSilkString = false;
    let isHeavyBeen = false;
    let isSarodSkin = false;
    let isKinneraFolk = false;

    switch (normalizedPreset) {
      case 'yazh':
        // Ancient Silk Bow Harp: Soft, rounded, Jackfruit boat soundbox, high damping, no metal buzz
        sustainMultiplier = 0.85;
        feedbackGain = 0.978;
        jivariDepth = 0.0;
        isSilkString = true;
        break;

      case 'rudra-veena':
      case 'rudra_veena':
        // Rudra Veena (Been): Heavy bronze wire, massive dual gourd Helmholtz 95Hz, wide Jivari buzz, long sustain
        sustainMultiplier = 1.6;
        feedbackGain = 0.996;
        jivariDepth = 0.75;
        isHeavyBeen = true;
        break;

      case 'kinnera':
        // 12-Fret Kinnera: 3-gourd tri-cavity formant (160Hz), beeswax fret buzz, snappy folk twang
        sustainMultiplier = 0.95;
        feedbackGain = 0.985;
        jivariDepth = 0.5;
        isKinneraFolk = true;
        break;

      case 'sarod':
        // Sarod: Goat-skin soundboard slap, polished chrome fingerboard, bright plectrum attack, fast dry decay
        sustainMultiplier = 0.85;
        feedbackGain = 0.986;
        jivariDepth = 0.15;
        isSarodSkin = true;
        break;

      case 'tanpura':
        // Tanpura: Jiva wool threads, ultra-long sustain, rich drone bloom
        sustainMultiplier = 1.8;
        feedbackGain = 0.997;
        jivariDepth = 0.8;
        break;

      case 'sitar':
      default:
        // Classical Sitar: Wide Jivari bone bridge, copper/steel wire bite, moderate sustain
        sustainMultiplier = 1.3;
        feedbackGain = 0.994;
        jivariDepth = 0.6;
        break;
    }

    const totalSeconds = Math.max(0.6, decaySeconds * sustainMultiplier);
    const totalSamples = Math.floor(sampleRate * totalSeconds);

    // AudioBuffer for Karplus-Strong physical recurrence loop
    const audioBuffer = ctx.createBuffer(1, totalSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Excitation impulse
    const burstLen = isSilkString 
      ? Math.min(periodSamples * 2, Math.round(sampleRate * 0.015))
      : isHeavyBeen
      ? Math.min(periodSamples, Math.round(sampleRate * 0.012))
      : Math.min(periodSamples, Math.round(sampleRate * 0.008));

    for (let i = 0; i < burstLen; i++) {
      const windowCoeff = Math.sin((Math.PI * i) / burstLen);
      // Silk strings use smooth parabolic curve; wire strings use shaped impulse noise
      if (isSilkString) {
        channelData[i] = windowCoeff * (Math.sin((Math.PI * 4 * i) / burstLen) * 0.8) * clampedVel;
      } else {
        channelData[i] = (Math.random() * 2 - 1) * windowCoeff * clampedVel;
      }
    }

    // Karplus-Strong Recurrence Loop with Loss Filter
    let prevSample = 0;
    const filterWeight = isSilkString ? 0.65 : 0.5;
    for (let i = burstLen; i < totalSamples; i++) {
      const delayedIndex = i - periodSamples;
      if (delayedIndex >= 0) {
        const delayedSample = channelData[delayedIndex];
        const filtered = (filterWeight * delayedSample + (1 - filterWeight) * prevSample) * feedbackGain;
        channelData[i] = filtered;
        prevSample = delayedSample;
      }
    }

    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = audioBuffer;

    // Body Acoustic Filters
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'peaking';
    if (isHeavyBeen) {
      // Twin Gourd Helmholtz Cavity resonance (95 Hz)
      bodyFilter.frequency.value = 95.0;
      bodyFilter.Q.value = 4.0;
      bodyFilter.gain.value = 8.0;
    } else if (isSilkString) {
      // Jackfruit boat body formant (185 Hz)
      bodyFilter.frequency.value = 185.0;
      bodyFilter.Q.value = 2.0;
      bodyFilter.gain.value = 3.0;
    } else if (isKinneraFolk) {
      // Triple Gourd Formant (160 Hz)
      bodyFilter.frequency.value = 160.0;
      bodyFilter.Q.value = 3.0;
      bodyFilter.gain.value = 5.0;
    } else {
      bodyFilter.frequency.value = frequency * 2.2;
      bodyFilter.Q.value = 3.0;
      bodyFilter.gain.value = 4.0;
    }

    const warmFilter = ctx.createBiquadFilter();
    warmFilter.type = 'lowpass';
    warmFilter.frequency.value = isSilkString ? 1600 : isHeavyBeen ? 4800 : Math.min(8000, frequency * 6);

    let waveshaper: WaveShaperNode | null = null;
    if (this.jivariShaperCurve && jivariDepth > 0.1) {
      waveshaper = ctx.createWaveShaper();
      waveshaper.curve = this.jivariShaperCurve as any;
      waveshaper.oversample = '2x';
    }

    const pluckGain = ctx.createGain();
    pluckGain.gain.setValueAtTime(0.001, now);
    pluckGain.gain.exponentialRampToValueAtTime(clampedVel, now + (isSilkString ? 0.015 : 0.006));
    pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSeconds);

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

    // If Rudra Veena: Add deep sub-octave fundamental reinforcement
    if (isHeavyBeen && frequency > 60) {
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(frequency * 0.5, now);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(clampedVel * 0.35, now + 0.01);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + totalSeconds * 0.8);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain || ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + totalSeconds * 0.8);
    }

    // If Sarod: Add goatskin slap transient
    if (isSarodSkin) {
      this.createSkinImpact(ctx, now, 1400, 0.02, clampedVel * 0.35);
    }
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
