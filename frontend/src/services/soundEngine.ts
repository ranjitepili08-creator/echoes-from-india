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

  // Helper to generate realistic acoustic parchment/leather impact slap transients
  private createParchmentTransient(
    ctx: AudioContext,
    now: number,
    freq: number,
    duration: number = 0.025,
    gainLevel: number = 0.35,
    type: BiquadFilterType = 'bandpass'
  ) {
    try {
      const bufferSize = Math.floor(ctx.sampleRate * Math.max(0.01, duration));
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.setValueAtTime(freq, now);
      filter.Q.setValueAtTime(2.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(gainLevel, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain!);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
    } catch {}
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
      // 🥁 DRUMS & MEMBRANOPHONES (Authentic Pakhawaj / Dhrupad Drum Synthesis)
      const drumDecay = Math.max(0.35, Math.min(1.2, safeDur * 0.65));
      const basePitch = safeFreq < 160 ? safeFreq : safeFreq < 320 ? safeFreq * 0.5 : 82;

      // 1. Parchment Skin Impact Click
      this.createParchmentTransient(ctx, now, 1800, 0.025, safeVel * 0.4, 'bandpass');

      // 2. Bass Dough Cavity (Aata Head) - Deep Thud with downward pitch deflection
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(basePitch * 1.5, now);
      bassOsc.frequency.exponentialRampToValueAtTime(basePitch, now + 0.06);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(240, now);
      bassFilter.Q.setValueAtTime(2.0, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(safeVel * 0.95, now + 0.006);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + drumDecay);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(now);
      bassOsc.stop(now + drumDecay);

      // 3. Dayan Treble Syahi Metallic Overtones
      const trebleOsc = ctx.createOscillator();
      const trebleGain = ctx.createGain();
      const trebleFilter = ctx.createBiquadFilter();

      trebleOsc.type = 'sine';
      trebleOsc.frequency.setValueAtTime(safeFreq, now);

      trebleFilter.type = 'bandpass';
      trebleFilter.frequency.setValueAtTime(safeFreq * 1.5, now);
      trebleFilter.Q.setValueAtTime(3.0, now);

      trebleGain.gain.setValueAtTime(0.001, now);
      trebleGain.gain.linearRampToValueAtTime(safeVel * 0.7, now + 0.004);
      trebleGain.gain.exponentialRampToValueAtTime(0.0001, now + drumDecay * 0.6);

      trebleOsc.connect(trebleFilter);
      trebleFilter.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      trebleOsc.start(now);
      trebleOsc.stop(now + drumDecay * 0.6);

      stopFn = () => {
        bassGain.gain.setValueAtTime(0.001, ctx.currentTime);
        trebleGain.gain.setValueAtTime(0.001, ctx.currentTime);
      };
      bendFn = (newFreq: number) => {
        bassOsc.frequency.setValueAtTime(newFreq * 0.5, ctx.currentTime);
        trebleOsc.frequency.setValueAtTime(newFreq, ctx.currentTime);
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

  // Play Percussion Bol (Pakhawaj / Dhrupad Membranophone Engine)
  public playBol(
    bolName: string, 
    pitch: number = 110, 
    decay: number = 1.2, 
    head: 'left_bass' | 'right_treble' | 'both' = 'both'
  ) {
    const ctx = this.init();
    this.unlockMobileAudio();
    const now = ctx.currentTime;

    const name = bolName.trim();
    const isTa = name === 'Ta' || name === 'Tin';
    const isNa = name === 'Na';
    const isDhin = name === 'Dhin';
    const isGe = name === 'Ge' || name === 'Ga';
    const isDha = name === 'Dha';
    const isMutedBass = name === 'Ka' || name === 'Ki';
    const isMutedTreble = name === 'Tit' || name === 'Te';

    // 1. LEFT BASS HEAD (Bayan with wheat dough / aata)
    if (head === 'left_bass' || head === 'both' || isDha || isGe || isMutedBass) {
      const bassDecay = isMutedBass ? 0.08 : Math.max(0.4, (isGe ? 1.3 : 0.85) * decay);
      const baseFreq = pitch > 40 && pitch < 200 ? pitch : (isGe ? 68 : 82);

      // Transient slap on leather parchment
      this.createParchmentTransient(
        ctx, 
        now, 
        isMutedBass ? 350 : 220, 
        isMutedBass ? 0.04 : 0.03, 
        isMutedBass ? 0.5 : 0.35, 
        'lowpass'
      );

      // Deep sub-bass dough oscillator with downward pitch sweep
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();

      bassOsc.type = 'sine';
      // Pitch inflection: initial impact punch dropping into resonant sub-bass
      bassOsc.frequency.setValueAtTime(baseFreq * 1.5, now);
      bassOsc.frequency.exponentialRampToValueAtTime(baseFreq, now + (isMutedBass ? 0.03 : 0.07));
      if (!isMutedBass && isGe) {
        // Dough pitch inflection
        bassOsc.frequency.linearRampToValueAtTime(baseFreq * 0.92, now + bassDecay * 0.5);
      }

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(isMutedBass ? 300 : 240, now);
      bassFilter.Q.setValueAtTime(2.0, now);

      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(isMutedBass ? 0.7 : 0.95, now + 0.005);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, now + bassDecay);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain!);

      bassOsc.start(now);
      bassOsc.stop(now + bassDecay);

      // Wood body barrel cavity warmth
      if (!isMutedBass) {
        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = 'triangle';
        bodyOsc.frequency.setValueAtTime(baseFreq * 1.95, now);
        bodyGain.gain.setValueAtTime(0.001, now);
        bodyGain.gain.linearRampToValueAtTime(0.25, now + 0.008);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + bassDecay * 0.45);
        bodyOsc.connect(bassGain);
        bodyOsc.start(now);
        bodyOsc.stop(now + bassDecay * 0.45);
      }
    }

    // 2. RIGHT TREBLE HEAD (Dayan with black iron-ore syahi paste)
    if (head === 'right_treble' || head === 'both' || isDha || isTa || isNa || isDhin || isMutedTreble) {
      const trebleDecay = isMutedTreble 
        ? 0.06 
        : isTa 
        ? 0.22 
        : isNa 
        ? Math.max(0.45, 0.7 * decay) 
        : isDhin 
        ? Math.max(0.6, 0.9 * decay) 
        : Math.max(0.3, 0.5 * decay);

      // Sharp parchment click transient
      this.createParchmentTransient(
        ctx, 
        now, 
        isTa ? 3200 : isNa ? 2200 : 1600, 
        isMutedTreble ? 0.025 : 0.02, 
        isTa ? 0.45 : 0.3, 
        isTa ? 'highpass' : 'bandpass'
      );

      // Main harmonic syahi fundamental
      const trebleFreq = isTa ? 310 : isNa ? 261.63 : isDhin ? 175 : isMutedTreble ? 240 : 261.63;
      
      const trebleOsc1 = ctx.createOscillator();
      const trebleGain = ctx.createGain();
      const trebleFilter = ctx.createBiquadFilter();

      trebleOsc1.type = 'sine';
      trebleOsc1.frequency.setValueAtTime(trebleFreq * (isMutedTreble ? 1.2 : 1.05), now);
      trebleOsc1.frequency.exponentialRampToValueAtTime(trebleFreq, now + 0.025);

      trebleFilter.type = isDhin ? 'lowpass' : 'bandpass';
      trebleFilter.frequency.setValueAtTime(isDhin ? 900 : trebleFreq * 1.5, now);
      trebleFilter.Q.setValueAtTime(isDhin ? 1.5 : 3.5, now);

      trebleGain.gain.setValueAtTime(0.001, now);
      trebleGain.gain.linearRampToValueAtTime(isMutedTreble ? 0.6 : (isTa ? 0.85 : 0.75), now + 0.004);
      trebleGain.gain.exponentialRampToValueAtTime(0.0001, now + trebleDecay);

      trebleOsc1.connect(trebleFilter);
      trebleFilter.connect(trebleGain);
      trebleGain.connect(this.masterGain!);

      trebleOsc1.start(now);
      trebleOsc1.stop(now + trebleDecay);

      // Metallic Syahi Concentric Ring Overtones (distinctive bell-like ring of Indian drums)
      if (!isMutedTreble) {
        const overtoneOsc = ctx.createOscillator();
        const overtoneGain = ctx.createGain();
        overtoneOsc.type = 'sine';
        // Non-harmonic Bessel membrane mode
        overtoneOsc.frequency.setValueAtTime(trebleFreq * 2.76, now);

        overtoneGain.gain.setValueAtTime(0.001, now);
        overtoneGain.gain.linearRampToValueAtTime(isNa ? 0.35 : 0.18, now + 0.003);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + trebleDecay * 0.4);

        overtoneOsc.connect(trebleGain);
        overtoneOsc.start(now);
        overtoneOsc.stop(now + trebleDecay * 0.4);
      }
    }
  }

  // 🥁 Background Rhythmic Tabla/Pakhawaj Percussion Engine
  public startRhythmBeat(bpm: number = 120) {
    this.stopRhythmBeat();
    const intervalMs = (60 / Math.max(40, bpm)) * 500;
    const pattern = ['Dha', 'Ta', 'Dhin', 'Ta', 'Ge', 'Tit', 'Dha', 'Dhin'];

    // Play first beat immediately without waiting for first interval
    const firstBol = pattern[0];
    this.playBol(firstBol, 82, 0.8, 'both');
    let step = 1;

    this.rhythmInterval = window.setInterval(() => {
      const bol = pattern[step % pattern.length];
      const isBass = bol === 'Dha' || bol === 'Ge';
      this.playBol(bol, isBass ? 82 : 261, 0.7, isBass ? 'both' : 'right_treble');
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
