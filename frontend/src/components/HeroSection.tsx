import React from 'react';
import { Sparkles, Music, Play, BookOpen, ChevronRight, ShieldCheck, Flame, Layers } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 border-b border-saffron-500/15 bg-gradient-to-b from-indigoHeritage-900/60 via-indigoHeritage-950 to-indigoHeritage-950">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-br from-saffron-500/10 via-terracotta-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Academic / Institution Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/25 text-saffron-300 text-xs font-semibold tracking-wide">
            <Flame className="w-3.5 h-3.5 text-saffron-400" />
            <span>AI/ML Research Prototype</span>
            <span className="text-parchment-500">•</span>
            <span className="text-parchment-300 font-normal">Masai School × IIT Patna</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-parchment-300 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Organological Sound Synthesis</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-parchment-100 leading-tight">
            Reviving the Sound of <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-saffron-300 via-amber-200 to-terracotta-400 bg-clip-text text-transparent">
              Historical Indian Instruments
            </span>
          </h1>
          
          <p className="text-sm sm:text-base lg:text-lg text-parchment-300 max-w-2xl mx-auto leading-relaxed">
            From ancient temple stone carvings and palm-leaf manuscripts to living sound. 
            Upload an instrument photo, discover verified civilizational history, reconstruct its acoustic timbre, 
            and play it through our interactive virtual studio & rhythm game.
          </p>
        </div>

        {/* 5-Stage System Pipeline Visual Strip */}
        <div className="mt-8 py-3 px-4 rounded-2xl bg-indigoHeritage-900/60 border border-saffron-500/20 max-w-4xl mx-auto shadow-inner">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-saffron-500/20 text-saffron-300 font-bold text-[10px] flex items-center justify-center">1</span>
              <span className="font-semibold text-parchment-200">Image Upload</span>
              <span className="text-[10px] text-parchment-400">Museums & Carvings</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-saffron-500/20 text-saffron-300 font-bold text-[10px] flex items-center justify-center">2</span>
              <span className="font-semibold text-parchment-200">AI Vision ID</span>
              <span className="text-[10px] text-parchment-400">Feature Extraction</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-saffron-500/20 text-saffron-300 font-bold text-[10px] flex items-center justify-center">3</span>
              <span className="font-semibold text-parchment-200">History & RAG</span>
              <span className="text-[10px] text-parchment-400">Natya Shastra Text</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-saffron-500/20 text-saffron-300 font-bold text-[10px] flex items-center justify-center">4</span>
              <span className="font-semibold text-parchment-200">Sound Engine</span>
              <span className="text-[10px] text-parchment-400">Acoustic Synthesis</span>
            </div>
            <div className="p-2 rounded-xl bg-saffron-500/20 border border-saffron-500/40 flex flex-col items-center gap-1 col-span-2 sm:col-span-1">
              <span className="w-5 h-5 rounded-full bg-saffron-500 text-indigoHeritage-950 font-bold text-[10px] flex items-center justify-center">5</span>
              <span className="font-bold text-saffron-200">Play & Game</span>
              <span className="text-[10px] text-saffron-300/80">Interactive Studio</span>
            </div>
          </div>
        </div>

        {/* Primary Call to Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('scanner')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 via-amber-500 to-terracotta-500 text-indigoHeritage-950 font-bold text-sm shadow-lg shadow-saffron-500/25 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>Scan Instrument Photo</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('studio')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigoHeritage-900 border border-saffron-500/30 text-parchment-100 font-semibold text-sm hover:bg-indigoHeritage-800 transition-all duration-200 shadow-sm"
          >
            <Music className="w-4 h-4 text-saffron-400" />
            <span>Launch Virtual Play Studio</span>
          </button>

          <button
            onClick={() => onNavigate('game')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigoHeritage-900/60 border border-white/10 text-parchment-200 font-semibold text-sm hover:bg-white/10 transition-all duration-200"
          >
            <Play className="w-4 h-4 text-terracotta-400" />
            <span>Play Rhythm Game Mode</span>
          </button>
        </div>

        {/* Quick Audition Instrument Badges */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <p className="text-xs uppercase tracking-widest text-parchment-400 font-medium mb-3">
            Quick Historical Sample Audition:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'yazh', name: 'Yazh (Sangam Harp)', badge: 'Extinct' },
              { id: 'pinaka-veena', name: 'Pinaka Veena (Shiva Bow)', badge: 'Extinct' },
              { id: 'rudra-veena', name: 'Rudra Veena (Dhrupad)', badge: 'Rare' },
              { id: 'jal-tarang', name: 'Jal Tarang (Water Bowls)', badge: 'Rare' },
              { id: 'ravanahatha', name: 'Ravanahatha (Folk Fiddle)', badge: 'Rare' },
              { id: 'algoza', name: 'Algoza (Twin Flute)', badge: 'Living' }
            ].map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample.id)}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-saffron-500/15 border border-white/10 hover:border-saffron-500/40 text-xs transition-all duration-200"
              >
                <span className="text-parchment-200 font-medium group-hover:text-saffron-300">
                  {sample.name}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  sample.badge === 'Extinct' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  sample.badge === 'Rare' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {sample.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
