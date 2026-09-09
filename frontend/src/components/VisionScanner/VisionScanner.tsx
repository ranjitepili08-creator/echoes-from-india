import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Layers, 
  Music, 
  BookOpen, 
  Gamepad2, 
  CheckCircle2, 
  RefreshCw, 
  Info,
  X,
  Radio,
  ArrowRight
} from 'lucide-react';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { VisionClassifier } from '../../services/visionClassifier';
import { Instrument, VisionDetectionResult } from '../../types';
import { ActiveTab } from '../Navbar';

interface VisionScannerProps {
  onInstrumentIdentified: (inst: Instrument) => void;
  onNavigate: (tab: ActiveTab) => void;
  selectedInstrument: Instrument;
}

export const VisionScanner: React.FC<VisionScannerProps> = ({
  onInstrumentIdentified,
  onNavigate,
  selectedInstrument,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(selectedInstrument.image);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStageText, setScanStageText] = useState('');
  const [detectionResult, setDetectionResult] = useState<VisionDetectionResult | null>(null);
  const [activeFeatureBox, setActiveFeatureBox] = useState<number | null>(null);
  
  // Camera Capture Modal State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Curated sample museum artifacts
  const sampleArtifacts = [
    {
      id: 'yazh',
      title: 'Amaravati Yazh Carving',
      subtitle: '2nd c. BCE Ancient Harp',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'rudra-veena',
      title: 'Dhrupad Rudra Veena',
      subtitle: 'Twin Gourd Zither',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'pinaka-veena',
      title: 'Shaivite Pinaka Veena',
      subtitle: 'Bowed Vedic Monochord',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jal-tarang',
      title: 'Jal Tarang Porcelain',
      subtitle: 'Kama Sutra Udaka Vadya',
      image: 'https://images.unsplash.com/photo-1519744346361-8935c18e15c3?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'ravanahatha',
      title: 'Bhopa Ravanahatha',
      subtitle: 'Coconut Soundbox Fiddle',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'pakhawaj',
      title: 'Temple Pakhawaj Drum',
      subtitle: 'Wheat Dough & Syahi Head',
      image: 'https://images.unsplash.com/photo-1543791107-f3769cb3f736?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mayuri-veena',
      title: 'Taus Peacock Lute',
      subtitle: '30 Sympathetic Tarab',
      image: 'https://images.unsplash.com/photo-1520523839898-5071282543e1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'algoza',
      title: 'Thar Desert Algoza',
      subtitle: 'Circular Breathing Twin Flute',
      image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80',
    }
  ];

  // Auto-scan on component mount so the result is immediately visible
  useEffect(() => {
    runScanPipeline(selectedInstrument.image, selectedInstrument.id);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setSelectedImage(resultUrl);
        runScanPipeline(resultUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const runScanPipeline = async (imageUrl: string, forcedId?: string) => {
    setIsScanning(true);
    setScanProgress(20);
    setScanStageText('Stage 1: Extracting visual contours & segmenting body geometry...');

    setTimeout(() => {
      setScanProgress(50);
      setScanStageText('Stage 2: Analyzing material textures (Gourds, Jackfruit Wood, Parchment)...');
    }, 350);

    setTimeout(() => {
      setScanProgress(80);
      setScanStageText('Stage 3: Cross-referencing Natya Shastra & Sangita Ratnakara organology...');
    }, 700);

    try {
      const result = await VisionClassifier.analyzeImage(imageUrl, forcedId);
      setScanProgress(100);
      setScanStageText('Stage 4: Acoustic parameters synthesized & verified!');
      
      setTimeout(() => {
        setIsScanning(false);
        setDetectionResult(result);
        onInstrumentIdentified(result.instrument);
      }, 300);
    } catch (err) {
      console.error('Scan error:', err);
      setIsScanning(false);
    }
  };

  // Live Camera Access
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Direct camera stream not supported, opening fallback camera capture:', err);
      setIsCameraOpen(false);
      cameraInputRef.current?.click();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
        runScanPipeline(dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleSelectSample = (sample: typeof sampleArtifacts[0]) => {
    setSelectedImage(sample.image);
    runScanPipeline(sample.image, sample.id);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Hidden File Inputs for Standard & Mobile Camera Capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header Banner - Mobile Responsive */}
      <div className="bg-indigoHeritage-900/70 border border-saffron-500/25 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Vision & Acoustic Reconstruction</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-parchment-100">
              Image-Based Instrument Recognition
            </h2>
            <p className="text-xs sm:text-sm text-parchment-300 mt-1 max-w-2xl leading-relaxed">
              Upload or snap a photo of any instrument carving or museum artifact. 
              Our vision AI segments organological features and derives its playable soundfont.
            </p>
          </div>

          {/* Action Buttons for Upload & Camera */}
          <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-saffron-500 text-indigoHeritage-950 font-bold text-xs hover:bg-saffron-400 active:scale-95 transition-all shadow-md touch-manipulation"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>

            <button
              onClick={startCamera}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigoHeritage-800 hover:bg-indigoHeritage-700 border border-saffron-500/40 text-saffron-300 font-bold text-xs active:scale-95 transition-all shadow-md touch-manipulation"
            >
              <Camera className="w-4 h-4" />
              <span>Live Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Camera Stream Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-indigoHeritage-950 border-2 border-saffron-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-saffron-300 text-xs font-bold">
                <Camera className="w-4 h-4" />
                <span>Align Instrument in Frame</span>
              </div>
              <button onClick={stopCamera} className="p-1 rounded-full bg-white/10 text-parchment-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-8 border-2 border-dashed border-saffron-400/80 rounded-xl pointer-events-none animate-pulse" />
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={capturePhoto}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 text-indigoHeritage-950 font-bold text-sm shadow-xl active:scale-95 transition-all touch-manipulation"
              >
                📸 Capture & Identify Instrument
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Scanner Section - 2 Columns on Desktop, 1 Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Left Column: Image Viewfinder & Curated Samples */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-indigoHeritage-900/80 border-2 border-dashed border-saffron-500/40 flex items-center justify-center group shadow-2xl">
            {selectedImage ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black/50">
                <img
                  src={selectedImage}
                  alt="Scanned Instrument"
                  className="w-full h-full object-cover"
                />

                {/* Scanning Animation Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 bg-indigoHeritage-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-t-saffron-500 border-r-amber-500 border-b-transparent border-l-transparent animate-spin flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-saffron-300" />
                    </div>
                    <div className="space-y-2 max-w-xs">
                      <p className="font-serif text-base sm:text-lg font-bold text-parchment-100">
                        Scanning Organological Cues...
                      </p>
                      <p className="text-xs text-saffron-300 font-mono">
                        {scanStageText}
                      </p>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-2">
                        <div 
                          className="bg-gradient-to-r from-saffron-500 to-terracotta-500 h-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Feature Bounding Boxes (When scanned) */}
                {!isScanning && detectionResult && (
                  <div className="absolute inset-0 pointer-events-none">
                    {detectionResult.detectedFeatures.map((feat, idx) => {
                      if (!feat.box) return null;
                      const [x, y, w, h] = feat.box;
                      const isHovered = activeFeatureBox === idx;
                      return (
                        <div
                          key={idx}
                          className={`absolute border-2 transition-all duration-300 ${
                            isHovered
                              ? 'border-saffron-300 bg-saffron-500/25 shadow-lg shadow-saffron-500/40'
                              : 'border-saffron-500/70 bg-saffron-500/10'
                          }`}
                          style={{
                            left: `${x}%`,
                            top: `${y}%`,
                            width: `${w}%`,
                            height: `${h}%`,
                          }}
                        >
                          <span className="absolute -top-5 left-0 bg-indigoHeritage-950/95 border border-saffron-500/40 text-saffron-200 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                            {feat.feature} ({Math.round(feat.confidence * 100)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Scan Action Overlay Button */}
                {!isScanning && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => runScanPipeline(selectedImage)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigoHeritage-950/90 border border-saffron-500/50 text-saffron-300 text-xs font-semibold hover:bg-saffron-500 hover:text-indigoHeritage-950 active:scale-95 transition-all shadow-lg backdrop-blur-md touch-manipulation"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-Analyze</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-6 cursor-pointer space-y-3"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center text-saffron-300">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-serif font-bold text-parchment-100 text-sm sm:text-base">
                    Tap to Upload or Snap Instrument Photo
                  </p>
                  <p className="text-xs text-parchment-400 mt-1">
                    Museum carvings, paintings, sculptures, or books
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Curated Sample Gallery for Quick 1-Click Scan */}
          <div className="space-y-2.5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-parchment-300 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-saffron-400" />
              <span>Or Pick A Curated Historical Artifact Sample:</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleArtifacts.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group rounded-xl overflow-hidden border border-white/10 hover:border-saffron-500/50 bg-indigoHeritage-900/60 p-1.5 text-left transition-all active:scale-95 touch-manipulation"
                >
                  <div className="aspect-[4/3] rounded-lg overflow-hidden mb-1.5 bg-black/40">
                    <img
                      src={sample.image}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-parchment-200 truncate group-hover:text-saffron-300">
                    {sample.title}
                  </p>
                  <p className="text-[9px] text-parchment-400 truncate">
                    {sample.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Organology Classification & Immediate Play In Rhythm Game */}
        <div className="lg:col-span-5 space-y-4">
          {detectionResult ? (
            <div className="bg-indigoHeritage-900/70 border border-saffron-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
              
              {/* Header Status & Confidence */}
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      Verified AI Match
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-parchment-100">
                    {detectionResult.instrument.name}
                  </h3>
                  <p className="text-xs font-serif text-saffron-300 italic mb-2">
                    {detectionResult.instrument.sanskritName}
                  </p>

                  {/* Manual Instrument Switcher */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-parchment-400 font-semibold whitespace-nowrap">Switch to:</span>
                    <select
                      value={detectionResult.instrument.id}
                      onChange={(e) => {
                        const targetInst = HISTORICAL_INSTRUMENTS.find(i => i.id === e.target.value);
                        if (targetInst) {
                          setSelectedImage(targetInst.image);
                          runScanPipeline(targetInst.image, targetInst.id);
                        }
                      }}
                      className="bg-indigoHeritage-950 border border-saffron-500/40 text-saffron-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-saffron-400 font-medium cursor-pointer"
                    >
                      {HISTORICAL_INSTRUMENTS.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-indigoHeritage-950 text-parchment-100">
                          {inst.name} ({inst.sanskritName.split('/')[0].trim()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-right bg-saffron-500/15 border border-saffron-500/40 px-3 py-1.5 rounded-xl">
                  <span className="block text-[9px] text-parchment-400 uppercase font-bold">Confidence</span>
                  <span className="text-lg font-mono font-extrabold text-saffron-300">
                    {detectionResult.confidence}%
                  </span>
                </div>
              </div>

              {/* PRIMARY PROMINENT CALL TO ACTION: Play in Rhythm Game with Scanned Tone */}
              <button
                onClick={() => {
                  onInstrumentIdentified(detectionResult.instrument);
                  onNavigate('game');
                }}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-saffron-500 via-amber-500 to-terracotta-500 text-indigoHeritage-950 font-extrabold text-sm shadow-xl shadow-saffron-500/25 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigoHeritage-950/20 flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-indigoHeritage-950" />
                  </div>
                  <div className="text-left">
                    <span className="block leading-tight font-serif">Play In Rhythm Game</span>
                    <span className="text-[10px] opacity-80 font-mono font-semibold">
                      Soundfont: {detectionResult.instrument.name} Timbre
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Organological Meta Tags */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-parchment-400 uppercase font-bold block mb-0.5">Classification</span>
                  <span className="font-semibold text-parchment-200 truncate block">
                    {detectionResult.instrument.categoryLabel.split('(')[0]}
                  </span>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-parchment-400 uppercase font-bold block mb-0.5">Historical Era</span>
                  <span className="font-semibold text-parchment-200 truncate block">
                    {detectionResult.instrument.century}
                  </span>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-parchment-400 uppercase font-bold block mb-0.5">Region of Origin</span>
                  <span className="font-semibold text-parchment-200 truncate block">
                    {detectionResult.instrument.region}
                  </span>
                </div>

                <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[9px] text-parchment-400 uppercase font-bold block mb-0.5">Status</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    detectionResult.instrument.status === 'extinct' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    detectionResult.instrument.status === 'rare' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {detectionResult.instrument.status}
                  </span>
                </div>
              </div>

              {/* Detected Physical Components (Interactive) */}
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-parchment-300 mb-2 flex items-center justify-between">
                  <span>Detected Features:</span>
                  <span className="text-[10px] text-parchment-400 font-normal">Tap to highlight</span>
                </h4>
                <div className="space-y-1.5">
                  {detectionResult.detectedFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveFeatureBox(activeFeatureBox === idx ? null : idx)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        activeFeatureBox === idx
                          ? 'bg-saffron-500/25 border-saffron-500/60 text-saffron-200 font-semibold'
                          : 'bg-white/5 border-white/5 text-parchment-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="font-medium text-[11px] sm:text-xs">{feat.feature}</span>
                      <span className="font-mono text-saffron-400 text-[10px] sm:text-[11px]">
                        {Math.round(feat.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secondary Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    onInstrumentIdentified(detectionResult.instrument);
                    onNavigate('studio');
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-parchment-100 font-semibold text-xs transition-all touch-manipulation"
                >
                  <Music className="w-3.5 h-3.5 text-saffron-300" />
                  <span>Virtual Studio</span>
                </button>

                <button
                  onClick={() => {
                    onInstrumentIdentified(detectionResult.instrument);
                    onNavigate('knowledge');
                  }}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-parchment-100 font-semibold text-xs transition-all touch-manipulation"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>Historical Dossier</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-indigoHeritage-900/40 border border-white/10 rounded-2xl p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[300px]">
              <Sparkles className="w-8 h-8 text-saffron-400 animate-pulse" />
              <p className="text-xs text-parchment-300">
                Analyzing photo to classify organology and synthesize acoustic soundfont...
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
