import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Radio, 
  Activity, 
  Layers, 
  Music, 
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Hand
} from 'lucide-react';
import { Instrument } from '../../types';
import { 
  KarplusStrongEngine, 
  karplusEngine, 
  InstrumentStringPreset, 
  RAGA_SCALES, 
  RagaScale 
} from '../../services/KarplusStrongEngine';
import { StringPhysics, PluckEvent } from '../../services/StringPhysics';
import { HandTracker, TrackedHandPoint } from '../../services/HandTracker';

interface InteractiveGestureStringInstrumentProps {
  instrument: Instrument;
  onNavigate?: (tab: any) => void;
}

export const InteractiveGestureStringInstrument: React.FC<InteractiveGestureStringInstrumentProps> = ({
  instrument,
}) => {
  // State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [trackingStatus, setTrackingStatus] = useState<'ready' | 'loading' | 'tracking' | 'error' | 'no_hand'>('ready');
  const [fps, setFps] = useState<number>(0);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(() => karplusEngine.isReady());
  const [isDroneOn, setIsDroneOn] = useState<boolean>(() => karplusEngine.isDroneActive());
  const [instrumentPreset, setInstrumentPreset] = useState<InstrumentStringPreset>('sitar');
  const [selectedRaga, setSelectedRaga] = useState<RagaScale>(RAGA_SCALES[0]);
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [decaySeconds, setDecaySeconds] = useState<number>(3.0);
  const [fretModulation, setFretModulation] = useState<boolean>(true);
  const [lastPluckInfo, setLastPluckInfo] = useState<PluckEvent | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const physicsRef = useRef<StringPhysics | null>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const latestTrackedPointRef = useRef<TrackedHandPoint | null>(null);
  const animFrameIdRef = useRef<number>(0);

  // Initialize StringPhysics
  useEffect(() => {
    const initialWidth = containerRef.current?.clientWidth || 800;
    const initialHeight = Math.min(560, Math.max(420, window.innerHeight * 0.55));

    const physics = new StringPhysics(initialWidth, initialHeight, instrumentPreset);
    physics.sensitivity = sensitivity;
    physics.fretModulationEnabled = fretModulation;
    physics.setPluckCallback((event) => {
      setLastPluckInfo(event);
    });

    physicsRef.current = physics;

    return () => {
      if (trackerRef.current) trackerRef.current.stop();
    };
  }, []);

  // Update physics settings when props/state change
  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.setPreset(instrumentPreset);
      physicsRef.current.sensitivity = sensitivity;
      physicsRef.current.fretModulationEnabled = fretModulation;
    }
  }, [instrumentPreset, sensitivity, fretModulation]);

  // Audio Context Unlock
  const handleEnableAudio = () => {
    karplusEngine.init();
    setIsAudioReady(true);
  };

  // Toggle Tanpura Drone
  const handleToggleDrone = () => {
    const active = karplusEngine.toggleTanpuraDrone(130.81);
    setIsDroneOn(active);
  };

  // Toggle Webcam Gesture Tracking
  const toggleCamera = async () => {
    handleEnableAudio();

    if (isCameraActive) {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      setIsCameraActive(false);
      setTrackingStatus('ready');
      latestTrackedPointRef.current = null;
    } else {
      if (!videoRef.current || !canvasRef.current) return;

      const tracker = new HandTracker({
        onPointUpdate: (point) => {
          latestTrackedPointRef.current = point;
          if (point && physicsRef.current) {
            physicsRef.current.processTrackingPoint(point.x, point.y, point.timestamp);
          }
        },
        onFpsUpdate: (val) => setFps(val),
        onStatusChange: (status) => setTrackingStatus(status)
      });

      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      tracker.setDimensions(w, h);
      trackerRef.current = tracker;

      const started = await tracker.start(videoRef.current);
      setIsCameraActive(started);
    }
  };

  // Resize Canvas to Container Dimensions
  const handleResize = useCallback(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const w = containerRef.current.clientWidth;
    const h = Math.min(580, Math.max(420, Math.round(w * 0.65)));

    canvasRef.current.width = w;
    canvasRef.current.height = h;

    if (physicsRef.current) {
      physicsRef.current.updateDimensions(w, h);
    }
    if (trackerRef.current) {
      trackerRef.current.setDimensions(w, h);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Main Canvas Render Animation Loop (60 FPS)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 1. If camera is off, draw rich background rosewood shading
          if (!isCameraActive) {
            ctx.fillStyle = '#0a0b0e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // 2. Render Fretboard Strings & Particles
          if (physicsRef.current) {
            physicsRef.current.render(ctx, dt);
          }

          // 3. Render Fingertip Reticle & Ghost Trajectory Trail
          if (isCameraActive && trackerRef.current) {
            trackerRef.current.renderReticle(ctx, latestTrackedPointRef.current);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameIdRef.current);
  }, [isCameraActive]);

  // Mouse / Touch Pointer Fallback Listeners
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handleEnableAudio();
    if (isCameraActive) return; // Camera takes precedence when active

    const canvas = canvasRef.current;
    if (!canvas || !physicsRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    physicsRef.current.processTrackingPoint(x, y, performance.now());
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
  };

  return (
    <div className="space-y-5 max-w-4xl w-full mx-auto select-none">
      
      {/* Hidden WebCam Video Stream for MediaPipe Frame Capture */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="hidden"
      />

      {/* HEADER & CONTROLS TOOLBAR */}
      <div className="bg-[#12141a]/95 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Gesture-Driven String Synthesis</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
              AI Hand-Tracking String Studio
            </h2>
            <p className="text-xs text-[#9da4b0] max-w-lg mt-0.5 leading-relaxed">
              Use your webcam to pluck virtual classical strings with finger gestures in real time, or glide your mouse across the fretboard.
            </p>
          </div>

          {/* Action Button Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Webcam Gesture Tracker Toggle */}
            <button
              onClick={toggleCamera}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
                isCameraActive
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : 'bg-white text-black hover:bg-neutral-200'
              }`}
            >
              {isCameraActive ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              <span>{isCameraActive ? 'Webcam Tracking ON' : 'Enable Webcam Gestures'}</span>
            </button>

            {/* Tanpura Drone Bed */}
            <button
              onClick={handleToggleDrone}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 ${
                isDroneOn
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-[#8e95a5] border-white/10'
              }`}
              title="Toggle Sa-Pa Tanpura Drone Accompaniment"
            >
              <Radio className={`w-3.5 h-3.5 ${isDroneOn ? 'animate-pulse text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Tanpura Drone</span>
            </button>
          </div>
        </div>

        {/* Live Tracking HUD Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-black/40 p-2.5 sm:p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            {/* Hand Status Pill */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                !isCameraActive
                  ? 'bg-blue-400'
                  : trackingStatus === 'tracking'
                  ? 'bg-emerald-400 animate-ping'
                  : trackingStatus === 'loading'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-red-400'
              }`} />
              <span className="text-white font-medium">
                {!isCameraActive
                  ? 'Pointer Mode (Hover/Drag Canvas)'
                  : trackingStatus === 'tracking'
                  ? 'Index Fingertip Tracked'
                  : trackingStatus === 'loading'
                  ? 'Initializing MediaPipe...'
                  : 'Searching for Hand...'}
              </span>
            </div>

            {isCameraActive && (
              <span className="text-[10px] font-mono text-[#64748b] bg-white/5 px-2 py-0.5 rounded">
                {fps} FPS
              </span>
            )}
          </div>

          {/* Last Pluck Swara Display */}
          {lastPluckInfo && (
            <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg animate-fade-in">
              <span>Plucked: <strong>{lastPluckInfo.noteName}</strong></span>
              <span className="text-[#8e95a5]">({lastPluckInfo.frequency} Hz)</span>
              <span className="text-[10px] text-emerald-400">Vel: {Math.round(lastPluckInfo.velocity * 100)}%</span>
            </div>
          )}
        </div>

        {/* 🪕 INTERACTIVE CANVAS VIEWPORT */}
        <div
          ref={containerRef}
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black flex items-center justify-center group"
          style={{ minHeight: '420px' }}
        >
          {/* Mirrored Webcam Video Feed Layer (when active) */}
          {isCameraActive && (
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <video
                ref={(el) => {
                  if (el && videoRef.current && videoRef.current.srcObject) {
                    el.srcObject = videoRef.current.srcObject;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/70" />
            </div>
          )}

          {/* Interactive Physics & Tracking Canvas */}
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            className="relative z-10 w-full h-full cursor-crosshair touch-manipulation"
          />

          {/* Audio Unlock Banner if needed */}
          {!isAudioReady && (
            <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Volume2 className="w-10 h-10 text-white animate-bounce" />
              <p className="font-serif text-lg font-bold text-white">
                Initialize Karplus-Strong Audio Engine
              </p>
              <button
                onClick={handleEnableAudio}
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-xl active:scale-95"
              >
                Click to Start Sound Engine
              </button>
            </div>
          )}

          {/* Bottom HUD Overlay Instruction */}
          <div className="absolute bottom-2 left-4 right-4 z-20 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-[#64748b] pointer-events-none bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
            <span>👋 {isCameraActive ? 'Wave index finger across vertical strings' : 'Hover / drag pointer horizontally across strings to strum'}</span>
            <span>↕️ Vertical height modulates microtonal fret pitch</span>
          </div>
        </div>

        {/* STUDIO CUSTOMIZATION PARAMETERS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          
          {/* Preset Selector */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e95a5] block">
              Instrument Preset
            </span>
            <select
              value={instrumentPreset}
              onChange={(e) => setInstrumentPreset(e.target.value as InstrumentStringPreset)}
              className="w-full bg-[#0a0b0e] border border-white/20 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-white font-medium"
            >
              <option value="sitar">Sitar (7 Strings + Tarab)</option>
              <option value="tanpura">Tanpura (4 Drone Strings)</option>
              <option value="sarod">Sarod (6 Fretless Strings)</option>
              <option value="yazh">Ancient Yazh (7 Silk Strings)</option>
              <option value="rudra_veena">Rudra Veena (Heavy Been)</option>
            </select>
          </div>

          {/* Raga Scale Selector */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e95a5] block">
              Classical Raga Scale
            </span>
            <select
              value={selectedRaga.id}
              onChange={(e) => {
                const found = RAGA_SCALES.find((r) => r.id === e.target.value);
                if (found) setSelectedRaga(found);
              }}
              className="w-full bg-[#0a0b0e] border border-white/20 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-white font-medium"
            >
              {RAGA_SCALES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Velocity Sensitivity Slider */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#8e95a5]">
              <span>Pluck Sensitivity</span>
              <span className="text-white font-mono">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Fret Height Modulation Toggle */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e95a5] block">
              Vertical Fret Modulation
            </span>
            <button
              onClick={() => setFretModulation(!fretModulation)}
              className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                fretModulation
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-[#8e95a5] border-white/10'
              }`}
            >
              {fretModulation ? '✓ Fret Stops Enabled' : 'Fixed Open Strings'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
