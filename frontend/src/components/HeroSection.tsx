import React from 'react';
import { Sparkles, Music, ArrowDown, ShieldCheck, Flame, ChevronRight } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-4 pb-10 overflow-hidden bg-[#0a0b0e] text-[#f0f2f5] border-b border-white/5 select-none">
      
      {/* Top Academic Research Header Tag */}
      <div className="relative z-30 flex flex-wrap items-center justify-center gap-2 mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/25 text-saffron-300 text-xs font-semibold tracking-wide">
          <Flame className="w-3.5 h-3.5 text-saffron-400" />
          <span>AI/ML Research Prototype</span>
          <span className="text-white/20">•</span>
          <span className="text-parchment-300 font-normal">Masai School × IIT Patna</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-parchment-300 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Organological Timbre Synthesis</span>
        </div>
      </div>

      {/* Giant Background Editorial Typography: "MUSIC EXPLORER" */}
      <div className="absolute top-[5%] sm:top-[3%] left-0 w-full text-center pointer-events-none z-0">
        <h1 
          className="font-serif font-black text-[clamp(5.5rem,16vw,18rem)] tracking-[0.18em] leading-[0.85] text-transparent bg-clip-text opacity-95 ml-[0.18em]"
          style={{
            fontFamily: "'Cinzel', serif",
            backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #b5bcc9 60%, rgba(50, 55, 68, 0.35) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          MUSIC
        </h1>
        <span 
          className="absolute right-[6vw] lg:right-[9vw] top-[70%] font-serif font-medium text-[clamp(1.2rem,3.2vw,3.8rem)] tracking-[0.28em] text-[#d6d9e0] uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          EXPLORER
        </span>
      </div>

      {/* Central Maestro Cutout (Rudra Veena / Classical Musician) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[760px] h-[70%] sm:h-[80%] z-10 flex justify-center items-end pointer-events-none">
        <img 
          src="/musician.png" 
          alt="Classical Indian Musician playing Rudra Veena"
          className="max-h-full max-w-full object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)] transition-transform duration-700 hover:scale-105"
          style={{
            maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
          }}
          onError={(e) => {
            // Graceful fallback
            (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rudra_Vina_MIM_Brussels.jpg/800px-Rudra_Vina_MIM_Brussels.jpg';
          }}
        />
      </div>

      {/* Side Content Overlays (Editorial Left & Right Cards) */}
      <div className="relative z-20 flex flex-col lg:flex-row justify-between items-center lg:items-end w-full mt-24 sm:mt-32 lg:mt-40 gap-8">
        
        {/* Left Card: Voices of Reason */}
        <div className="max-w-[320px] w-full space-y-3 bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-2xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none">
          <div 
            onClick={() => onSelectSample('mayuri-veena')}
            className="w-full h-52 rounded-md overflow-hidden border border-white/15 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
          >
            <img 
              src="/hero1.jpeg" 
              alt="Royal ensemble of musicians" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mayuri_vina_or_Taus_MIM_1947.jpg/800px-Mayuri_vina_or_Taus_MIM_1947.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
              <span className="text-[11px] font-mono text-saffron-300 font-semibold">Audition Mayuri Veena →</span>
            </div>
          </div>
          <h2 className="font-serif text-xl font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
            Voices of Reason
          </h2>
          <p className="text-[13px] text-[#8e95a5] leading-relaxed font-normal">
            The timeless harmony of court musicians blending classical ragas, vocal nuances, and acoustic heritage across historical royal traditions.
          </p>
          <button 
            onClick={() => onNavigate('knowledge')}
            className="inline-flex items-center gap-1.5 text-xs text-[#9299a8] hover:text-white transition-colors tracking-wider uppercase font-semibold group pt-1"
          >
            <span>Explore Further</span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Right Card: Sacrifice and Sovereignty */}
        <div className="max-w-[340px] w-full space-y-3 bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-2xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none text-left lg:text-right">
          <h2 className="font-serif text-xl font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
            Sacrifice &amp; Sovereignty
          </h2>
          <p className="text-[13px] text-[#8e95a5] leading-relaxed font-normal">
            Echoes of Vedic harps and ancient strings played under open canopies, celebrating devotion, ceremony, and historic acoustic rituals.
          </p>
          <div 
            onClick={() => onSelectSample('yazh')}
            className="w-full h-48 rounded-md overflow-hidden border border-white/15 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
          >
            <img 
              src="/hero2.jpeg" 
              alt="Ancient Indian Yazh and harp players sketch" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Amaravati_harp_relief_detail.jpg/800px-Amaravati_harp_relief_detail.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5 justify-end">
              <span className="text-[11px] font-mono text-saffron-300 font-semibold">Audition Ancient Yazh →</span>
            </div>
          </div>
          <div className="flex justify-start lg:justify-end gap-2.5 pt-2">
            <button 
              onClick={() => onNavigate('scanner')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-400 hover:to-amber-400 text-indigoHeritage-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Vision Scan</span>
            </button>
            <button 
              onClick={() => onNavigate('studio')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Music className="w-3.5 h-3.5 text-saffron-300" />
              <span>Play Studio</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Audition Strip */}
      <div className="relative z-30 mt-10 pt-4 border-t border-white/10 text-center">
        <p className="text-[11px] uppercase tracking-widest text-parchment-400 font-semibold mb-2.5">
          Quick Historical Instrument Audition:
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'yazh', name: 'Yazh (Sangam Harp)', badge: 'Extinct' },
            { id: 'pinaka-veena', name: 'Pinaka Veena (Shiva Bow)', badge: 'Extinct' },
            { id: 'rudra-veena', name: 'Rudra Veena (Dhrupad)', badge: 'Rare' },
            { id: 'jal-tarang', name: 'Jal Tarang (Water Bowls)', badge: 'Rare' },
            { id: 'ravanahatha', name: 'Ravanahatha (Folk Fiddle)', badge: 'Rare' },
            { id: 'mayuri-veena', name: 'Mayuri Veena (Taus)', badge: 'Rare' },
            { id: 'algoza', name: 'Algoza (Twin Flute)', badge: 'Living' }
          ].map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample.id)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-saffron-500/15 border border-white/10 hover:border-saffron-500/40 text-xs transition-all active:scale-95"
            >
              <span className="text-parchment-200 font-medium group-hover:text-saffron-300">
                {sample.name}
              </span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
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

    </section>
  );
};
