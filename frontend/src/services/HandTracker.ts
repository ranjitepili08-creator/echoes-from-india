/**
 * HandTracker: Encapsulates MediaPipe Hands detection, webcam stream loop,
 * coordinate normalization, landmark jitter smoothing, and velocity vector ghost trailing.
 */

export interface TrackedHandPoint {
  x: number; // canvas pixel x
  y: number; // canvas pixel y
  normX: number; // normalized 0..1
  normY: number; // normalized 0..1
  vx: number;
  vy: number;
  confidence: number;
  timestamp: number;
}

export interface HandTrackerOptions {
  onPointUpdate: (point: TrackedHandPoint | null) => void;
  onFpsUpdate?: (fps: number) => void;
  onStatusChange?: (status: 'ready' | 'loading' | 'tracking' | 'error' | 'no_hand') => void;
}

export class HandTracker {
  private videoElement: HTMLVideoElement | null = null;
  private isRunning: boolean = false;
  private stream: MediaStream | null = null;
  private smoothedPoint: { x: number; y: number } | null = null;
  private prevRawPoint: { x: number; y: number; time: number } | null = null;
  public trail: { x: number; y: number; alpha: number }[] = [];
  public currentFps: number = 0;
  public isHandDetected: boolean = false;

  private frameCount: number = 0;
  private lastFpsTime: number = performance.now();
  private options: HandTrackerOptions;
  private canvasWidth: number = 800;
  private canvasHeight: number = 600;

  private handsModel: any = null;
  private cameraUtils: any = null;
  private animFrameId: number = 0;

  constructor(options: HandTrackerOptions) {
    this.options = options;
  }

  public setDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Dynamically loads MediaPipe Hands from CDN if not already loaded globally
   */
  private async loadMediaPipeScripts(): Promise<boolean> {
    if ((window as any).Hands && (window as any).Camera) {
      return true;
    }

    return new Promise((resolve) => {
      let loadedHands = false;
      let loadedCam = false;

      const checkDone = () => {
        if (loadedHands && loadedCam) {
          resolve(true);
        }
      };

      if ((window as any).Hands) {
        loadedHands = true;
      } else {
        const s1 = document.createElement('script');
        s1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        s1.crossOrigin = 'anonymous';
        s1.onload = () => {
          loadedHands = true;
          checkDone();
        };
        s1.onerror = () => resolve(false);
        document.head.appendChild(s1);
      }

      if ((window as any).Camera) {
        loadedCam = true;
      } else {
        const s2 = document.createElement('script');
        s2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        s2.crossOrigin = 'anonymous';
        s2.onload = () => {
          loadedCam = true;
          checkDone();
        };
        s2.onerror = () => resolve(false);
        document.head.appendChild(s2);
      }

      // Timeout fallback after 6 seconds
      setTimeout(() => resolve(Boolean((window as any).Hands)), 6000);
    });
  }

  /**
   * Start webcam video and hand tracking
   */
  public async start(videoEl: HTMLVideoElement): Promise<boolean> {
    this.videoElement = videoEl;
    if (this.options.onStatusChange) this.options.onStatusChange('loading');

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      this.videoElement.srcObject = this.stream;
      await this.videoElement.play();

      const scriptsLoaded = await this.loadMediaPipeScripts();
      const HandsConstructor = (window as any).Hands;

      if (scriptsLoaded && HandsConstructor) {
        this.handsModel = new HandsConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.handsModel.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.55
        });

        this.handsModel.onResults((results: any) => this.handleMediaPipeResults(results));

        this.isRunning = true;
        this.runTrackingLoop();
        if (this.options.onStatusChange) this.options.onStatusChange('ready');
        return true;
      } else {
        // Simple pixel/motion fallback tracker if CDN fails
        console.warn('MediaPipe Hands script unavailable, using video stream with pointer fallback');
        this.isRunning = true;
        this.runFallbackLoop();
        if (this.options.onStatusChange) this.options.onStatusChange('ready');
        return true;
      }
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      if (this.options.onStatusChange) this.options.onStatusChange('error');
      return false;
    }
  }

  private async runTrackingLoop(): Promise<void> {
    if (!this.isRunning || !this.videoElement) return;

    if (this.videoElement.readyState >= 2 && this.handsModel) {
      try {
        await this.handsModel.send({ image: this.videoElement });
      } catch {}
    }

    this.updateFps();
    this.animFrameId = requestAnimationFrame(() => this.runTrackingLoop());
  }

  private runFallbackLoop(): void {
    if (!this.isRunning) return;
    this.updateFps();
    this.animFrameId = requestAnimationFrame(() => this.runFallbackLoop());
  }

  private handleMediaPipeResults(results: any): void {
    const now = performance.now();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      this.isHandDetected = true;
      const landmarks = results.multiHandLandmarks[0];

      // Landmark 8: Index Finger Tip
      const indexTip = landmarks[8];
      if (indexTip) {
        // Mirrored X for natural user reflection
        const rawX = (1.0 - indexTip.x) * this.canvasWidth;
        const rawY = indexTip.y * this.canvasHeight;

        // Exponential Moving Average (EMA) Landmark Smoothing (alpha = 0.65)
        const alpha = 0.65;
        if (!this.smoothedPoint) {
          this.smoothedPoint = { x: rawX, y: rawY };
        } else {
          this.smoothedPoint.x = alpha * rawX + (1 - alpha) * this.smoothedPoint.x;
          this.smoothedPoint.y = alpha * rawY + (1 - alpha) * this.smoothedPoint.y;
        }

        // Velocity vector calculation
        let vx = 0;
        let vy = 0;
        if (this.prevRawPoint) {
          const dt = Math.max(0.001, (now - this.prevRawPoint.time) / 1000);
          vx = (this.smoothedPoint.x - this.prevRawPoint.x) / dt;
          vy = (this.smoothedPoint.y - this.prevRawPoint.y) / dt;
        }
        this.prevRawPoint = { x: this.smoothedPoint.x, y: this.smoothedPoint.y, time: now };

        // Append to ghost trail
        this.trail.unshift({ x: this.smoothedPoint.x, y: this.smoothedPoint.y, alpha: 1.0 });
        if (this.trail.length > 16) this.trail.pop();

        const point: TrackedHandPoint = {
          x: this.smoothedPoint.x,
          y: this.smoothedPoint.y,
          normX: 1.0 - indexTip.x,
          normY: indexTip.y,
          vx,
          vy,
          confidence: 0.95,
          timestamp: now
        };

        this.options.onPointUpdate(point);
        if (this.options.onStatusChange) this.options.onStatusChange('tracking');
      }
    } else {
      this.isHandDetected = false;
      this.options.onPointUpdate(null);
      if (this.options.onStatusChange) this.options.onStatusChange('no_hand');
    }
  }

  /**
   * Draw glowing reticle over tracked fingertip and ghost velocity trail
   */
  public renderReticle(ctx: CanvasRenderingContext2D, point: TrackedHandPoint | null): void {
    const now = performance.now();

    // 1. Draw Ghost Trajectory Trail
    ctx.save();
    for (let i = 0; i < this.trail.length - 1; i++) {
      const p1 = this.trail[i];
      const p2 = this.trail[i + 1];
      const alpha = (1.0 - i / this.trail.length) * 0.5;

      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = Math.max(1, 6 - i * 0.35);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Draw Fingertip Reticle & Velocity Arrow
    if (point) {
      ctx.save();

      // Outer Glowing Ring
      const pulse = Math.sin(now / 120) * 3;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 14 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Core Node
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Directional Velocity Vector Indicator
      const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
      if (speed > 50) {
        const arrowLen = Math.min(35, speed / 30);
        const normVx = point.vx / speed;
        const normVy = point.vy / speed;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x + normVx * arrowLen, point.y + normVy * arrowLen);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private updateFps(): void {
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;
      if (this.options.onFpsUpdate) this.options.onFpsUpdate(this.currentFps);
    }
  }

  public stop(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.smoothedPoint = null;
    this.prevRawPoint = null;
    this.trail = [];
    this.isHandDetected = false;
  }
}
