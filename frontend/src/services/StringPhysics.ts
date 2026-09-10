/**
 * StringPhysics: Manages vertical parallel string positions, crossing-based gesture pluck detection,
 * non-linear quadratic Bezier vibration damping, fret pitch modulation, and particle resonance rendering.
 */

import { InstrumentStringPreset, karplusEngine } from './KarplusStrongEngine';
import { Instrument } from '../types';

export interface VirtualString {
  id: number;
  name: string;
  sargam: string;
  baseFreq: number;
  xPos: number;
  targetX: number;
  vibrationAmplitude: number;
  vibrationPhase: number;
  vibrationFreq: number;
  decayRate: number;
  color: string;
  glowColor: string;
  thickness: number;
  lastPluckedTime: number;
  pluckY: number;
}

export interface PluckParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface PluckEvent {
  stringId: number;
  noteName: string;
  frequency: number;
  velocity: number;
  x: number;
  y: number;
}

export class StringPhysics {
  public strings: VirtualString[] = [];
  public particles: PluckParticle[] = [];
  public topY: number = 60;
  public bottomY: number = 500;
  public width: number = 800;
  public height: number = 600;
  public sensitivity: number = 1.0;
  public fretModulationEnabled: boolean = true;
  public preset: InstrumentStringPreset = 'sitar';
  public currentInstrument: Instrument | null = null;

  private prevPoint: { x: number; y: number; time: number } | null = null;
  private onPluckCallback: ((event: PluckEvent) => void) | null = null;

  constructor(
    width: number = 800,
    height: number = 600,
    presetOrInstrument: InstrumentStringPreset | Instrument = 'sitar'
  ) {
    this.updateDimensions(width, height);
    if (typeof presetOrInstrument === 'string') {
      this.setPreset(presetOrInstrument);
    } else {
      this.setInstrument(presetOrInstrument);
    }
  }

  public setPluckCallback(cb: (event: PluckEvent) => void): void {
    this.onPluckCallback = cb;
  }

  public updateDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.topY = Math.round(height * 0.12);
    this.bottomY = Math.round(height * 0.88);
    this.recalculateStringPositions();
  }

  /**
   * Set up strings dynamically based on full Instrument definition
   */
  public setInstrument(instrument: Instrument): void {
    this.currentInstrument = instrument;
    const instId = (instrument.id || 'sitar').toLowerCase().replace(/_/g, '-') as InstrumentStringPreset;
    this.preset = instId;

    const notes = instrument.playInterface?.notes || [];
    if (notes.length > 0) {
      const palette = [
        { color: '#d97706', glow: '#f59e0b' },
        { color: '#f59e0b', glow: '#fbbf24' },
        { color: '#e2e8f0', glow: '#ffffff' },
        { color: '#4ade80', glow: '#86efac' },
        { color: '#38bdf8', glow: '#7dd3fc' },
        { color: '#a78bfa', glow: '#c4b5fd' },
        { color: '#ec4899', glow: '#f472b6' },
        { color: '#f43f5e', glow: '#fda4af' }
      ];

      const stringConfigs = notes.map((n, idx) => {
        const pal = palette[idx % palette.length];
        const isBass = n.frequency < 200;
        return {
          name: `${n.sargam} (${n.western})`,
          sargam: n.sargam,
          freq: n.frequency,
          color: pal.color,
          glow: pal.glow,
          thick: isBass ? 4.2 : Math.max(1.5, 3.6 - idx * 0.3)
        };
      });

      this.buildStrings(stringConfigs);
    } else {
      this.setPreset(instId);
    }
  }

  public setPreset(preset: InstrumentStringPreset, rootFreq: number = 130.81): void {
    this.preset = preset;
    const stringConfigs: { name: string; sargam: string; freq: number; color: string; glow: string; thick: number }[] = [];
    const normalizedPreset = preset.toLowerCase().replace(/_/g, '-');

    switch (normalizedPreset) {
      case 'tanpura':
        stringConfigs.push(
          { name: 'Pa (G3)', sargam: 'Pa', freq: rootFreq * 1.5, color: '#f59e0b', glow: '#fbbf24', thick: 3.5 },
          { name: 'Sa (C4)', sargam: 'Sa', freq: rootFreq * 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.5 },
          { name: 'Sa (C4)', sargam: 'Sa', freq: rootFreq * 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.5 },
          { name: 'Kharaj Sa (C3)', sargam: 'Sa(K)', freq: rootFreq * 1.0, color: '#d97706', glow: '#f59e0b', thick: 4.5 }
        );
        break;

      case 'sarod':
        stringConfigs.push(
          { name: 'Kharaj (C3)', sargam: 'Kharaj', freq: rootFreq * 1.0, color: '#d97706', glow: '#f59e0b', thick: 4.0 },
          { name: 'Pa (G3)', sargam: 'Pa', freq: rootFreq * 1.5, color: '#f59e0b', glow: '#fbbf24', thick: 3.2 },
          { name: 'Sa (C4)', sargam: 'Sa', freq: rootFreq * 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.6 },
          { name: 'Ma (F4)', sargam: 'Ma', freq: rootFreq * 2.67, color: '#38bdf8', glow: '#7dd3fc', thick: 2.2 },
          { name: 'Chikari 1 (C5)', sargam: 'Chikari', freq: rootFreq * 4.0, color: '#a78bfa', glow: '#c4b5fd', thick: 1.5 },
          { name: 'Chikari 2 (G5)', sargam: 'Tara Pa', freq: rootFreq * 6.0, color: '#ec4899', glow: '#f472b6', thick: 1.2 }
        );
        break;

      case 'yazh':
        stringConfigs.push(
          { name: 'Kural (C4)', sargam: 'Kural (Sa)', freq: 261.63, color: '#f59e0b', glow: '#fbbf24', thick: 3.0 },
          { name: 'Thuttam (D4)', sargam: 'Thuttam (Re)', freq: 293.66, color: '#fbbf24', glow: '#fde68a', thick: 2.7 },
          { name: 'Kaikkilai (E4)', sargam: 'Kaikkilai (Ga)', freq: 329.63, color: '#34d399', glow: '#a7f3d0', thick: 2.4 },
          { name: 'Uzhai (F4)', sargam: 'Uzhai (Ma)', freq: 349.23, color: '#38bdf8', glow: '#bae6fd', thick: 2.1 },
          { name: 'Ili (G4)', sargam: 'Ili (Pa)', freq: 392.00, color: '#818cf8', glow: '#c7d2fe', thick: 1.8 },
          { name: 'Vilari (A4)', sargam: 'Vilari (Dha)', freq: 440.00, color: '#c084fc', glow: '#e9d5ff', thick: 1.5 },
          { name: 'Tharam (B4)', sargam: 'Tharam (Ni)', freq: 493.88, color: '#f472b6', glow: '#fbcfe8', thick: 1.2 }
        );
        break;

      case 'morchang':
        stringConfigs.push(
          { name: 'Ta (C4)', sargam: 'Ta (Low)', freq: 261.63, color: '#38bdf8', glow: '#7dd3fc', thick: 3.5 },
          { name: 'Dhin (E4)', sargam: 'Dhin (F1)', freq: 329.63, color: '#4ade80', glow: '#86efac', thick: 3.0 },
          { name: 'Ki (G4)', sargam: 'Ki (F2)', freq: 392.00, color: '#fbbf24', glow: '#fde68a', thick: 2.5 },
          { name: 'Te (C5)', sargam: 'Te (F3)', freq: 523.25, color: '#a78bfa', glow: '#c4b5fd', thick: 2.0 },
          { name: 'Dha (E5)', sargam: 'Dha (Harm)', freq: 659.25, color: '#f43f5e', glow: '#fda4af', thick: 1.6 }
        );
        break;

      case 'jal-tarang':
        stringConfigs.push(
          { name: 'Bowl 1 (C4)', sargam: 'Sa (Bowl 1)', freq: 261.63, color: '#38bdf8', glow: '#7dd3fc', thick: 3.5 },
          { name: 'Bowl 2 (D4)', sargam: 'Re (Bowl 2)', freq: 293.66, color: '#60a5fa', glow: '#93c5fd', thick: 3.2 },
          { name: 'Bowl 3 (E4)', sargam: 'Ga (Bowl 3)', freq: 329.63, color: '#34d399', glow: '#6ee7b7', thick: 2.9 },
          { name: 'Bowl 4 (F4)', sargam: 'Ma (Bowl 4)', freq: 349.23, color: '#2dd4bf', glow: '#5eead4', thick: 2.6 },
          { name: 'Bowl 5 (G4)', sargam: 'Pa (Bowl 5)', freq: 392.00, color: '#fbbf24', glow: '#fde68a', thick: 2.3 },
          { name: 'Bowl 6 (A4)', sargam: 'Dha (Bowl 6)', freq: 440.00, color: '#a78bfa', glow: '#c4b5fd', thick: 2.0 },
          { name: 'Bowl 7 (B4)', sargam: 'Ni (Bowl 7)', freq: 493.88, color: '#e879f9', glow: '#f0abfc', thick: 1.7 },
          { name: 'Bowl 8 (C5)', sargam: 'Sa\' (Bowl 8)', freq: 523.25, color: '#f43f5e', glow: '#fda4af', thick: 1.4 }
        );
        break;

      case 'rudra-veena':
      case 'rudra_veena':
        stringConfigs.push(
          { name: 'Kharaj Sa (C3)', sargam: 'Kharaj Sa', freq: 130.81, color: '#d97706', glow: '#f59e0b', thick: 4.8 },
          { name: 'Komal Re (Db3)', sargam: 're', freq: 138.59, color: '#f59e0b', glow: '#fbbf24', thick: 4.2 },
          { name: 'Shuddha Ga (E3)', sargam: 'Ga', freq: 164.81, color: '#fbbf24', glow: '#fde68a', thick: 3.8 },
          { name: 'Teevra Ma (F#3)', sargam: 'Ma(T)', freq: 185.00, color: '#38bdf8', glow: '#7dd3fc', thick: 3.4 },
          { name: 'Pancham (G3)', sargam: 'Pa', freq: 196.00, color: '#818cf8', glow: '#c7d2fe', thick: 3.0 },
          { name: 'Komal Dha (Ab3)', sargam: 'dha', freq: 207.65, color: '#c084fc', glow: '#e9d5ff', thick: 2.6 },
          { name: 'Shuddha Ni (B3)', sargam: 'Ni', freq: 246.94, color: '#f472b6', glow: '#fbcfe8', thick: 2.2 }
        );
        break;

      case 'sitar':
      default:
        stringConfigs.push(
          { name: 'Kharaj (C3)', sargam: 'Kharaj Sa', freq: rootFreq * 1.0, color: '#d97706', glow: '#f59e0b', thick: 4.2 },
          { name: 'Pa (G3)', sargam: 'Pancham', freq: rootFreq * 1.5, color: '#f59e0b', glow: '#fbbf24', thick: 3.5 },
          { name: 'Sa (C4)', sargam: 'Madhya Sa', freq: rootFreq * 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.8 },
          { name: 'Ga (E4)', sargam: 'Gandhara', freq: rootFreq * 2.5, color: '#4ade80', glow: '#86efac', thick: 2.2 },
          { name: 'Pa (G4)', sargam: 'Pancham', freq: rootFreq * 3.0, color: '#38bdf8', glow: '#7dd3fc', thick: 1.8 },
          { name: 'Dha (A4)', sargam: 'Dhaivata', freq: rootFreq * 3.375, color: '#a78bfa', glow: '#c4b5fd', thick: 1.4 },
          { name: 'Taar Sa (C5)', sargam: 'Taar Sa', freq: rootFreq * 4.0, color: '#ec4899', glow: '#f472b6', thick: 1.0 }
        );
        break;
    }

    this.buildStrings(stringConfigs);
  }

  private buildStrings(stringConfigs: { name: string; sargam: string; freq: number; color: string; glow: string; thick: number }[]): void {
    const count = stringConfigs.length;
    const margin = Math.min(120, this.width * 0.12);
    const availableWidth = this.width - margin * 2;
    const step = count > 1 ? availableWidth / (count - 1) : availableWidth / 2;

    this.strings = stringConfigs.map((cfg, index) => ({
      id: index,
      name: cfg.name,
      sargam: cfg.sargam,
      baseFreq: Math.round(cfg.freq * 100) / 100,
      xPos: Math.round(margin + index * step),
      targetX: Math.round(margin + index * step),
      vibrationAmplitude: 0,
      vibrationPhase: 0,
      vibrationFreq: 22 + index * 3,
      decayRate: 0.94,
      color: cfg.color,
      glowColor: cfg.glow,
      thickness: cfg.thick,
      lastPluckedTime: 0,
      pluckY: (this.topY + this.bottomY) / 2
    }));
  }

  private recalculateStringPositions(): void {
    const count = this.strings.length;
    if (count === 0) return;
    const margin = Math.min(120, this.width * 0.12);
    const availableWidth = this.width - margin * 2;
    const step = count > 1 ? availableWidth / (count - 1) : availableWidth / 2;

    this.strings.forEach((str, index) => {
      str.xPos = Math.round(margin + index * step);
      str.targetX = str.xPos;
    });
  }

  /**
   * Process point trajectory (from HandTracker or Mouse) and detect line crossings
   */
  public processTrackingPoint(x: number, y: number, now: number = performance.now()): void {
    if (!this.prevPoint) {
      this.prevPoint = { x, y, time: now };
      return;
    }

    const dt = Math.max(0.001, (now - this.prevPoint.time) / 1000);
    const vx = (x - this.prevPoint.x) / dt;
    const vy = (y - this.prevPoint.y) / dt;

    // Test crossing for every string
    for (const string of this.strings) {
      const sX = string.xPos;

      const wasLeft = this.prevPoint.x < sX;
      const isRight = x >= sX;
      const wasRight = this.prevPoint.x > sX;
      const isLeft = x <= sX;
      const hasCrossed = (wasLeft && isRight) || (wasRight && isLeft);

      if (hasCrossed) {
        const interpY = this.prevPoint.y + ((sX - this.prevPoint.x) / (x - this.prevPoint.x || 1)) * (y - this.prevPoint.y);
        if (interpY >= this.topY - 20 && interpY <= this.bottomY + 20) {
          if (now - string.lastPluckedTime > 85) {
            this.triggerPluck(string, interpY, Math.abs(vx), now);
          }
        }
      }
    }

    this.prevPoint = { x, y, time: now };
  }

  /**
   * Triggers acoustic pluck synthesis, physical wave displacement, and particle bursts.
   */
  public triggerPluck(
    string: VirtualString,
    contactY: number,
    velocityPxSec: number,
    now: number = performance.now()
  ): void {
    string.lastPluckedTime = now;
    string.pluckY = Math.max(this.topY, Math.min(this.bottomY, contactY));

    // Dynamic Velocity-to-Gain
    const normalizedVel = Math.min(1.0, Math.max(0.25, (velocityPxSec / 1200) * this.sensitivity));

    // Amplitude displacement in pixels
    string.vibrationAmplitude = Math.min(24, Math.max(8, normalizedVel * 20));
    string.vibrationPhase = 0;

    // Pitch & Formant Modulation along vertical axis (P.y relative to string length)
    const stringLength = this.bottomY - this.topY;
    const normalizedPos = Math.max(0, Math.min(1, (this.bottomY - string.pluckY) / stringLength));

    let finalFreq = string.baseFreq;
    if (this.fretModulationEnabled) {
      const octaveShift = normalizedPos * 0.75;
      finalFreq = string.baseFreq * Math.pow(2, octaveShift);
    }

    // Synthesize physical acoustic note using instrument-specific synthesis engine
    karplusEngine.pluckString(finalFreq, normalizedVel, 2.8, this.preset, normalizedPos);

    // Spawn visual resonance particle burst
    this.spawnParticles(string.xPos, string.pluckY, string.glowColor, normalizedVel);

    if (this.onPluckCallback) {
      this.onPluckCallback({
        stringId: string.id,
        noteName: string.name,
        frequency: Math.round(finalFreq * 100) / 100,
        velocity: Math.round(normalizedVel * 100) / 100,
        x: string.xPos,
        y: string.pluckY
      });
    }
  }

  private spawnParticles(x: number, y: number, color: string, intensity: number): void {
    const particleCount = Math.round(12 + intensity * 16);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 4 + 1.5) * intensity;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 1.5,
        color,
        alpha: 1.0,
        life: 0,
        maxLife: Math.random() * 25 + 20
      });
    }
  }

  /**
   * Update physics and render fretboard, strings, and particles onto HTML Canvas.
   */
  public render(ctx: CanvasRenderingContext2D, dt: number): void {
    // 1. Draw Fretboard Neck Background & Frets
    this.drawFretboard(ctx);

    // 2. Draw Strings with Dynamic Bezier Vibration Curves
    for (const string of this.strings) {
      string.vibrationAmplitude *= Math.pow(string.decayRate, dt * 60);
      if (string.vibrationAmplitude < 0.05) string.vibrationAmplitude = 0;

      string.vibrationPhase += dt * string.vibrationFreq * 8;

      const currentOffset = string.vibrationAmplitude * Math.sin(string.vibrationPhase);
      const isPlucked = string.vibrationAmplitude > 0.5;

      ctx.save();

      // String Outer Glow when active
      if (isPlucked) {
        ctx.strokeStyle = string.glowColor;
        ctx.lineWidth = string.thickness + 4;
        ctx.shadowColor = string.glowColor;
        ctx.shadowBlur = 16;
        ctx.globalAlpha = Math.min(1.0, string.vibrationAmplitude / 10);

        ctx.beginPath();
        ctx.moveTo(string.xPos, this.topY);
        ctx.quadraticCurveTo(
          string.xPos + currentOffset * 1.5,
          string.pluckY,
          string.xPos,
          this.bottomY
        );
        ctx.stroke();
      }

      // Core Physical String Wire
      ctx.strokeStyle = isPlucked ? '#ffffff' : string.color;
      ctx.lineWidth = string.thickness;
      ctx.shadowBlur = isPlucked ? 8 : 0;
      ctx.globalAlpha = isPlucked ? 1.0 : 0.85;

      ctx.beginPath();
      ctx.moveTo(string.xPos, this.topY);
      ctx.quadraticCurveTo(
        string.xPos + currentOffset,
        (this.topY + this.bottomY) / 2,
        string.xPos,
        this.bottomY
      );
      ctx.stroke();

      // Top Tuning Peg & Nut Node
      ctx.fillStyle = isPlucked ? string.glowColor : '#475569';
      ctx.beginPath();
      ctx.arc(string.xPos, this.topY, string.thickness + 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Bridge Node
      ctx.beginPath();
      ctx.arc(string.xPos, this.bottomY, string.thickness + 2.5, 0, Math.PI * 2);
      ctx.fill();

      // String Sargam Label
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = isPlucked ? '#ffffff' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(string.sargam, string.xPos, this.bottomY + 24);

      ctx.font = '9px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`${string.baseFreq}Hz`, string.xPos, this.bottomY + 36);

      ctx.restore();
    }

    // 3. Render and Update Resonance Particles
    this.renderParticles(ctx);
  }

  private drawFretboard(ctx: CanvasRenderingContext2D): void {
    const stringLength = this.bottomY - this.topY;
    const fretCount = 12;

    ctx.save();
    const margin = Math.min(120, this.width * 0.12) - 20;
    const neckWidth = this.width - margin * 2;

    const grad = ctx.createLinearGradient(margin, 0, margin + neckWidth, 0);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
    grad.addColorStop(0.5, 'rgba(30, 41, 59, 0.6)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.4)');

    ctx.fillStyle = grad;
    ctx.fillRect(margin, this.topY - 10, neckWidth, stringLength + 20);

    // Horizontal Brass Frets
    for (let f = 1; f <= fretCount; f++) {
      const fretY = this.topY + stringLength * (1 - Math.pow(2, -f / 12));

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = f % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(margin, fretY);
      ctx.lineTo(margin + neckWidth, fretY);
      ctx.stroke();

      if ([3, 5, 7, 9].includes(f)) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(this.width / 2, fretY - 15, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (f === 12) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.arc(this.width / 2 - 12, fretY - 15, 3, 0, Math.PI * 2);
        ctx.arc(this.width / 2 + 12, fretY - 15, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.life++;
      p.alpha = 1.0 - p.life / p.maxLife;

      if (p.life >= p.maxLife || p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
