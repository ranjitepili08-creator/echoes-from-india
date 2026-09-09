import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  return (
    <div className="w-full bg-[#0a0b0e] text-[#f0f2f5] font-sans selection:bg-saffron-500/30 selection:text-saffron-200">
      
      {/* 100VH FULL-SCREEN HERO STAGE (Exact match to Empire reference layout) */}
      <section className="relative w-full h-screen min-h-[700px] max-h-[1080px] flex flex-col justify-between px-8 sm:px-14 lg:px-20 pt-6 pb-12 overflow-hidden bg-[#0a0b0e]">
        
        {/* GIANT BACKGROUND TYPOGRAPHY: "EMPIRE" + "EXPLORER" */}
        <div className="absolute top-[2%] left-0 w-full text-center pointer-events-none select-none z-[1]">
          <h1 
            className="font-serif font-black text-[clamp(6.5rem,18vw,22rem)] tracking-[0.18em] leading-[0.82] text-transparent bg-clip-text ml-[0.18em] opacity-95"
            style={{
              fontFamily: "'Cinzel', serif",
              backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #b5bcc9 60%, rgba(50, 55, 68, 0.35) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EMPIRE
          </h1>
          <span 
            className="absolute right-[8vw] sm:right-[10vw] lg:right-[12vw] top-[74%] font-serif font-medium text-[clamp(1.3rem,3.2vw,3.8rem)] tracking-[0.28em] text-[#d6d9e0] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            EXPLORER
          </span>
        </div>

        {/* PROMINENT OVERLAPPING CENTRAL FIGURE (Reaches high up into EMPIRE) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[85vh] z-[10] flex justify-center items-end pointer-events-none">
          <img 
            src="/musician.png" 
            alt="Classical Musician"
            className="h-full w-auto max-w-none object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] transform scale-110 sm:scale-125 lg:scale-135 origin-bottom"
            style={{
              maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rudra_Vina_MIM_Brussels.jpg/800px-Rudra_Vina_MIM_Brussels.jpg';
            }}
          />
        </div>

        {/* Empty Spacer Top to balance flex layout */}
        <div className="w-full h-8 z-[20] pointer-events-none" />

        {/* SIDE STORY CARDS (Positioned on the lower left and right) */}
        <div className="relative z-[20] flex flex-col lg:flex-row justify-between items-end w-full max-w-[1400px] mx-auto gap-8 mb-2">
          
          {/* Left Column: Voices of Reason (Image on top, Title, Text, Link) */}
          <div className="max-w-[310px] w-full space-y-2.5">
            <div 
              onClick={() => onSelectSample('mayuri-veena')}
              className="w-full h-[190px] rounded-sm overflow-hidden border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
            >
              <img 
                src="/hero1.jpeg" 
                alt="Voices of Reason" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mayuri_vina_or_Taus_MIM_1947.jpg/800px-Mayuri_vina_or_Taus_MIM_1947.jpg';
                }}
              />
            </div>
            
            <h2 className="font-serif text-lg font-bold text-white tracking-wide pt-1" style={{ fontFamily: "'Cinzel', serif" }}>
              Voices of Reason
            </h2>
            <p className="text-[12px] text-[#8e95a5] leading-relaxed font-normal">
              Socrates defends truth before the Athenian court – a moment that defines the birth of Western philosophy.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('audition-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('knowledge');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#9299a8] hover:text-white transition-colors tracking-wider font-normal pt-1"
            >
              <span>Explore Further</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Sacrifice and Sovereignty (Title on top, Text, Image on bottom) */}
          <div className="max-w-[330px] w-full space-y-2.5 text-left">
            <h2 className="font-serif text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              Sacrifice and Sovereignty
            </h2>
            <p className="text-[12px] text-[#8e95a5] leading-relaxed font-normal">
              A Roman general presents offerings to the gods, embodying the empire's deep ties to ritual and divine order.
            </p>
            <div 
              onClick={() => onSelectSample('yazh')}
              className="w-full h-[180px] rounded-sm overflow-hidden border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
            >
              <img 
                src="/hero2.jpeg" 
                alt="Sacrifice and Sovereignty" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Amaravati_harp_relief_detail.jpg/800px-Amaravati_harp_relief_detail.jpg';
                }}
              />
            </div>
          </div>

        </div>

      </section>

      {/* QUICK HISTORICAL INSTRUMENT AUDITION (Cleanly below the hero fold) */}
      <section id="audition-section" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-white/5">
        <div className="p-6 rounded-2xl bg-[#111318] border border-saffron-500/20 text-center space-y-4 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Historical Instrument Quick Audition</span>
            </div>
            <p className="text-xs text-parchment-400">
              Select any ancient instrument below to explore its acoustic profile and play its sound:
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {[
              { id: 'yazh', name: 'Yazh (Sangam Harp)', badge: 'Extinct' },
              { id: 'pinaka-veena', name: 'Pinaka Veena (Shiva Bow)', badge: 'Extinct' },
              { id: 'rudra-veena', name: 'Rudra Veena (Dhrupad)', badge: 'Rare' },
              { id: 'jal-tarang', name: 'Jal Tarang (Water Bowls)', badge: 'Rare' },
              { id: 'ravanahatha', name: 'Ravanahatha (Folk Fiddle)', badge: 'Rare' },
              { id: 'mayuri-veena', name: 'Mayuri Veena (Taus)', badge: 'Rare' },
              { id: 'algoza', name: 'Algoza (Twin Flute)', badge: 'Living' },
              { id: 'pakhawaj', name: 'Pakhawaj (Dhrupad Drum)', badge: 'Living' },
              { id: 'shankha', name: 'Shankha (Conch Horn)', badge: 'Living' }
            ].map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample.id)}
                className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-saffron-500/20 border border-white/10 hover:border-saffron-500/50 text-xs font-medium transition-all active:scale-95 touch-manipulation shadow-sm"
              >
                <span className="text-parchment-200 group-hover:text-saffron-300">
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
      </section>

    </div>
  );
};
