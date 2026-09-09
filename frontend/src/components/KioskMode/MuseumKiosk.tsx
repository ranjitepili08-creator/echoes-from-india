import React, { useState, useEffect } from 'react';
import { 
  MonitorPlay, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  Volume2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Music, 
  BookOpen, 
  Layers, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { Instrument } from '../../types';
import { ActiveTab } from '../Navbar';
import { soundEngine } from '../../services/soundEngine';

interface MuseumKioskProps {
  onSelectInstrument: (inst: Instrument) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const MuseumKiosk: React.FC<MuseumKioskProps> = ({
  onSelectInstrument,
  onNavigate,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(false);
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);

  const current = HISTORICAL_INSTRUMENTS[currentIndex];

  const nextInstrument = () => {
    setCurrentIndex((prev) => (prev + 1) % HISTORICAL_INSTRUMENTS.length);
  };

  const prevInstrument = () => {
    setCurrentIndex((prev) => (prev - 1 + HISTORICAL_INSTRUMENTS.length) % HISTORICAL_INSTRUMENTS.length);
  };

  // Auto-cycling timer for hands-off museum kiosk displays
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoCycling) {
      timer = setInterval(() => {
        nextInstrument();
      }, 7000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoCycling]);

  const handleAudition = () => {
    setIsPlayingAudition(true);
    const notes = current.playInterface.notes;
    if (notes && notes.length > 0) {
      notes.forEach((n, idx) => {
        setTimeout(() => {
          soundEngine.playNote(n.frequency, current, 1.2, 0.95);
          if (idx === notes.length - 1) {
            setTimeout(() => setIsPlayingAudition(false), 1200);
          }
        }, idx * 260);
      });
    } else if (current.playInterface.bols) {
      current.playInterface.bols.forEach((b, idx) => {
        setTimeout(() => {
          soundEngine.playBol(b.name, b.pitch, b.decay, b.head);
          if (idx === current.playInterface.bols!.length - 1) {
            setTimeout(() => setIsPlayingAudition(false), 1200);
          }
        }, idx * 300);
      });
    } else {
      setIsPlayingAudition(false);
    }
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Kiosk Controls Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigoHeritage-900/80 border border-saffron-500/30 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-saffron-500/20 text-saffron-300 flex items-center justify-center">
            <MonitorPlay className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-parchment-100 block">
              Museum Exhibit Kiosk Mode
            </span>
            <span className="text-[11px] text-parchment-400">
              Interactive high-contrast touchscreen display for heritage institutions & academic kiosks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAutoCycling(!isAutoCycling)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isAutoCycling
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10'
            }`}
          >
            {isAutoCycling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoCycling ? 'Auto Tour: Active' : 'Start Auto Tour'}</span>
          </button>
        </div>
      </div>

      {/* Main Large-Format Exhibit Showcase Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-indigoHeritage-900 via-indigoHeritage-950 to-indigoHeritage-950 border-2 border-saffron-500/40 shadow-2xl p-6 lg:p-10">
        
        {/* Navigation Arrows */}
        <button
          onClick={prevInstrument}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigoHeritage-950/80 hover:bg-saffron-500 hover:text-indigoHeritage-950 text-parchment-200 border border-saffron-500/30 flex items-center justify-center transition-all z-20 shadow-xl backdrop-blur-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextInstrument}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-indigoHeritage-950/80 hover:bg-saffron-500 hover:text-indigoHeritage-950 text-parchment-200 border border-saffron-500/30 flex items-center justify-center transition-all z-20 shadow-xl backdrop-blur-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Visual Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/50 border-2 border-saffron-500/30 shadow-2xl group">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className={`absolute top-3 left-3 text-xs font-bold uppercase px-3 py-1 rounded-full backdrop-blur-md shadow-lg ${
                current.status === 'extinct' ? 'bg-red-500/90 text-white' :
                current.status === 'rare' ? 'bg-amber-500/90 text-indigoHeritage-950' :
                'bg-emerald-500/90 text-white'
              }`}>
                {current.status}
              </span>
            </div>

            {/* Quick Carving Mini Showcase */}
            {current.carvingImage && (
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <img
                  src={current.carvingImage}
                  alt="Temple Carving"
                  className="w-14 h-14 rounded-lg object-cover border border-white/10"
                />
                <div className="text-xs">
                  <span className="font-bold text-saffron-300 block">Historical Temple Sculpture</span>
                  <span className="text-[11px] text-parchment-400">Archaeological evidence matching this organological form</span>
                </div>
              </div>
            )}
          </div>

          {/* Instrument Dossier Content */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-saffron-300 uppercase tracking-wider">
                  Exhibit {currentIndex + 1} of {HISTORICAL_INSTRUMENTS.length}
                </span>
                <span className="text-parchment-500">•</span>
                <span className="text-xs text-parchment-300">{current.century}</span>
              </div>
              
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-parchment-100">
                {current.name}
              </h2>
              <p className="font-serif text-lg text-saffron-300 italic mt-0.5">
                {current.sanskritName}
              </p>
            </div>

            <p className="text-sm sm:text-base text-parchment-200 leading-relaxed">
              {current.shortDescription}
            </p>

            {/* Origin & Classification Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/10 text-parchment-200 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta-400" />
                <span>{current.region}</span>
              </span>
              <span className="bg-white/10 text-parchment-200 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{current.era}</span>
              </span>
            </div>

            {/* Touch Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleAudition}
                disabled={isPlayingAudition}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 text-indigoHeritage-950 font-bold text-sm hover:scale-105 transition-all shadow-xl"
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudition ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudition ? 'Playing Acoustic Scale...' : 'Audition Sound'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectInstrument(current);
                  onNavigate('studio');
                }}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigoHeritage-800 hover:bg-indigoHeritage-700 border border-saffron-500/30 text-parchment-100 font-semibold text-sm transition-all"
              >
                <Music className="w-4 h-4 text-saffron-400" />
                <span>Play Live Studio</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
