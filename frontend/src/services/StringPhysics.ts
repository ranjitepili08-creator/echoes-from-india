/**
 * StringPhysics: Manages vertical parallel string positions, crossing-based gesture pluck detection,
 * non-linear quadratic Bezier vibration damping, fret pitch modulation, and particle resonance rendering.
 */

import { InstrumentStringPreset, karplusEngine } from './KarplusStrongEngine';

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

  private prevPoint: { x: number; y: number; time: number } | null = null;
  private onPluckCallback: ((event: PluckEvent) => void) | null = null;

  constructor(
    width: number = 800,
    height: number = 600,
    preset: InstrumentStringPreset = 'sitar'
  ) {
    this.updateDimensions(width, height);
    this.setPreset(preset);
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

  public setPreset(preset: InstrumentStringPreset, rootFreq: number = 130.81): void {
    this.preset = preset;
    const stringConfigs: { name: string; sargam: string; ratio: number; color: string; glow: string; thick: number }[] = [];

    switch (preset) {
      case 'tanpura':
        stringConfigs.push(
          { name: 'Pa (G3)', sargam: 'Pa', ratio: 1.5, color: '#f59e0b', glow: '#fbbf24', thick: 3.5 },
          { name: 'Sa (C4)', sargam: 'Sa', ratio: 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.5 },
          { name: 'Sa (C4)', sargam: 'Sa', ratio: 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.5 },
          { name: 'Kharaj Sa (C3)', sargam: 'Sa(K)', ratio: 1.0, color: '#d97706', glow: '#f59e0b', thick: 4.5 }
        );
        break;

      case 'sarod':
        stringConfigs.push(
          { name: 'Kharaj (C3)', sargam: 'Kharaj', ratio: 1.0, color: '#d97706', glow: '#f59e0b', thick: 4.0 },
          { name: 'Pa (G3)', sargam: 'Pa', ratio: 1.5, color: '#f59e0b', glow: '#fbbf24', thick: 3.2 },
          { name: 'Sa (C4)', sargam: 'Sa', ratio: 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.6 },
          { name: 'Ma (F4)', sargam: 'Ma', ratio: 2.67, color: '#38bdf8', glow: '#7dd3fc', thick: 2.2 },
          { name: 'Chikari 1 (C5)', sargam: 'Chikari', ratio: 4.0, color: '#a78bfa', glow: '#c4b5fd', thick: 1.5 },
          { name: 'Chikari 2 (G5)', sargam: 'Tara Pa', ratio: 6.0, color: '#ec4899', glow: '#f472b6', thick: 1.2 }
        );
        break;

      case 'yazh':
      case 'sitar':
      default:
        stringConfigs.push(
          { name: 'Kharaj (C3)', sargam: 'Kharaj Sa', ratio: 1.0, color: '#d97706', glow: '#f59e0b', thick: 4.2 },
          { name: 'Pa (G3)', sargam: 'Pancham', ratio: 1.5, color: '#f59e0b', glow: '#fbbf24', thick: 3.5 },
          { name: 'Sa (C4)', sargam: 'Madhya Sa', ratio: 2.0, color: '#e2e8f0', glow: '#ffffff', thick: 2.8 },
          { name: 'Ga (E4)', sargam: 'Gandhara', ratio: 2.5, color: '#4ade80', glow: '#86efac', thick: 2.2 },
          { name: 'Pa (G4)', sargam: 'Pancham', ratio: 3.0, color: '#38bdf8', glow: '#7dd3fc', thick: 1.8 },
          { name: 'Dha (A4)', sargam: 'Dhaivata', ratio: 3.375, color: '#a78bfa', glow: '#c4b5fd', thick: 1.4 },
          { name: 'Taar Sa (C5)', sargam: 'Taar Sa', ratio: 4.0, color: '#ec4899', glow: '#f472b6', thick: 1.0 }
        );
        break;
    }

    const count = stringConfigs.length;
    const margin = Math.min(120, this.width * 0.12);
    const availableWidth = this.width - margin * 2;
    const step = count > 1 ? availableWidth / (count - 1) : availableWidth / 2;

    this.strings = stringConfigs.map((cfg, index) => ({
      id: index,
      name: cfg.name,
      sargam: cfg.sargam,
      baseFreq: Math.round(rootFreq * cfg.ratio * 100) / 100,
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
    const speed = Math.sqrt(vx * vx + vy * vy);

    // Test crossing for every string
    for (const string of this.strings) {
      const sX = string.xPos;

      // 1. Intersection test: Did the line segment cross the string plane?
      const wasLeft = this.prevPoint.x < sX;
      const isRight = x >= sX;
      const wasRight = this.prevPoint.x > sX;
      const isLeft = x <= sX;
      const hasCrossed = (wasLeft && isRight) || (wasRight && isLeft);

      if (hasCrossed) {
        // 2. Vertical bound check
        const interpY = this.prevPoint.y + ((sX - this.prevPoint.x) / (x - this.prevPoint.x || 1)) * (y - this.prevPoint.y);
        if (interpY >= this.topY - 20 && interpY <= this.bottomY + 20) {
          // 3. Debounce refractory period (90ms)
          if (now - string.lastPluckedTime > 90) {
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

    // Dynamic Velocity-to-Gain (clamped 0.25 to 1.0)
    const normalizedVel = Math.min(1.0, Math.max(0.25, (velocityPxSec / 1200) * this.sensitivity));

    // Amplitude displacement in pixels
    string.vibrationAmplitude = Math.min(24, Math.max(8, normalizedVel * 20));
    string.vibrationPhase = 0;

    // Pitch Modulation along the Fretboard (P.y relative to string length)
    let finalFreq = string.baseFreq;
    if (this.fretModulationEnabled) {
      const stringLength = this.bottomY - this.topY;
      const normalizedPos = Math.max(0, Math.min(1, (this.bottomY - string.pluckY) / stringLength));
      // Continuous microtonal fret stop up to 1 octave higher
      const octaveShift = normalizedPos * 0.75;
      finalFreq = string.baseFreq * Math.pow(2, octaveShift);
    }

    // Synthesize physical Karplus-Strong audio note
    karplusEngine.pluckString(finalFreq, normalizedVel, 2.8, this.preset);

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
    const timeSec = performance.now() / 1000;

    for (const string of this.strings) {
      // Exponential decay of vibration
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
    // Neck Wood Subtle Shading
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
      // Exponential fret spacing: L_f = L * (1 - 2^(-f/12))
      const fretY = this.topY + stringLength * (1 - Math.pow(2, -f / 12));

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = f % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(margin, fretY);
      ctx.lineTo(margin + neckWidth, fretY);
      ctx.stroke();

      // Fret Marker Dots at 3rd, 5th, 7th, 9th, 12th frets
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
      p.vy += 0.08; // subtle gravity
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
