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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#12141a] border border-white/10 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
            <MonitorPlay className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-white block tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
              Museum Exhibit Kiosk Mode
            </span>
            <span className="text-[11px] text-[#8e95a5]">
              Interactive high-contrast touchscreen display for heritage institutions & academic kiosks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsAutoCycling(!isAutoCycling)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all w-full sm:w-auto touch-manipulation ${
              isAutoCycling
                ? 'bg-white text-black border-white animate-pulse'
                : 'bg-white/5 border-white/10 text-[#9da4b0] hover:bg-white/10 hover:text-white'
            }`}
          >
            {isAutoCycling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoCycling ? 'Auto Tour: Active' : 'Start Auto Tour'}</span>
          </button>
        </div>
      </div>

      {/* Main Large-Format Exhibit Showcase Card */}
      <div className="relative rounded-3xl overflow-hidden bg-[#12141a] border border-white/10 shadow-2xl p-5 sm:p-8 lg:p-10">
        
        {/* Navigation Arrows */}
        <button
          onClick={prevInstrument}
          aria-label="Previous Instrument"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0a0b0e]/80 hover:bg-white hover:text-black text-white border border-white/15 flex items-center justify-center transition-all z-20 shadow-xl backdrop-blur-md touch-manipulation"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextInstrument}
          aria-label="Next Instrument"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0a0b0e]/80 hover:bg-white hover:text-black text-white border border-white/15 flex items-center justify-center transition-all z-20 shadow-xl backdrop-blur-md touch-manipulation"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center px-4 sm:px-8">
          
          {/* Visual Showcase */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl group">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className={`absolute top-3 left-3 text-[10px] sm:text-xs font-semibold uppercase px-3 py-1 rounded-full backdrop-blur-md shadow-lg border ${
                current.status === 'extinct' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                current.status === 'rare' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {current.status}
              </span>
            </div>

            {/* Quick Carving Mini Showcase */}
            {current.carvingImage && (
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                <img
                  src={current.carvingImage}
                  alt="Temple Carving"
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border border-white/10"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Historical Temple Sculpture</span>
                  <span className="text-[11px] text-[#646c7c]">Archaeological evidence matching this organological form</span>
                </div>
              </div>
            )}
          </div>

          {/* Instrument Dossier Content */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold text-[#8e95a5] uppercase tracking-wider">
                  Exhibit {currentIndex + 1} of {HISTORICAL_INSTRUMENTS.length}
                </span>
                <span className="text-[#646c7c]">•</span>
                <span className="text-xs text-[#8e95a5]">{current.century}</span>
              </div>
              
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                {current.name}
              </h2>
              <p className="font-serif text-base sm:text-lg text-white/80 italic mt-0.5">
                {current.sanskritName}
              </p>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-[#9da4b0] leading-relaxed">
              {current.shortDescription}
            </p>

            {/* Origin & Classification Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/5 text-[#9da4b0] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/70" />
                <span>{current.region}</span>
              </span>
              <span className="bg-white/5 text-[#9da4b0] px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/70" />
                <span>{current.era}</span>
              </span>
            </div>

            {/* Touch Action Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleAudition}
                disabled={isPlayingAudition}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-white text-black font-bold text-xs sm:text-sm hover:bg-white/90 active:scale-95 transition-all shadow-xl touch-manipulation w-full sm:w-auto"
              >
                <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 ${isPlayingAudition ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudition ? 'Playing Acoustic Scale...' : 'Audition Sound'}</span>
              </button>

              <button
                onClick={() => {
                  onSelectInstrument(current);
                  onNavigate('studio');
                }}
                className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs sm:text-sm active:scale-95 transition-all touch-manipulation w-full sm:w-auto"
              >
                <Music className="w-4 h-4 text-white/80" />
                <span>Play Live Studio</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
