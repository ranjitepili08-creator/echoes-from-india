import React from 'react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  return (
    <div className="w-full bg-[#0a0b0e] text-[#f0f2f5] font-sans selection:bg-white/20 selection:text-white">
      
      {/* 100VH FULL-SCREEN HERO STAGE (Exact 1:1 match to Empire reference art direction) */}
      <section className="relative w-full min-h-[92vh] sm:min-h-[720px] lg:h-screen max-h-[1080px] flex flex-col justify-between px-4 sm:px-14 lg:px-20 pt-6 sm:pt-8 pb-10 sm:pb-12 overflow-hidden bg-[#0a0b0e]">
        
        {/* TOP EDITORIAL NAVBAR (Exact to reference design) */}
        <header className="relative z-30 flex items-center justify-between w-full max-w-[1400px] mx-auto text-[11px] sm:text-[13px] tracking-[0.06em] text-[#9da4b0] font-normal select-none">
          {/* Left Links */}
          <div className="flex items-center gap-4 sm:gap-12">
            <button 
              onClick={() => onNavigate('scanner')}
              className="hover:text-white transition-colors duration-200 text-left cursor-pointer"
            >
              Philosophy &amp; Power
            </button>
            <button 
              onClick={() => onNavigate('knowledge')}
              className="hover:text-white transition-colors duration-200 text-left cursor-pointer hidden md:inline"
            >
              Rituals &amp; Religion
            </button>
          </div>

          {/* Center Brand Title */}
          <div 
            className="font-serif text-sm sm:text-lg font-bold tracking-[0.1em] text-white uppercase text-center" 
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Echoes of India
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-4 sm:gap-12 justify-end">
            <button 
              onClick={() => onNavigate('studio')}
              className="hover:text-white transition-colors duration-200 text-right cursor-pointer hidden md:inline"
            >
              Warfare &amp; Honor
            </button>
            <button 
              onClick={() => onNavigate('archive')}
              className="hover:text-white transition-colors duration-200 text-right cursor-pointer"
            >
              Legacy &amp; Ruins
            </button>
          </div>
        </header>

        {/* GIANT BACKGROUND TYPOGRAPHY: "EMPIRE" + "EXPLORER" */}
        <div className="absolute top-[8%] sm:top-[6%] lg:top-[5%] left-0 w-full text-center pointer-events-none select-none z-[1] overflow-hidden px-2">
          <h1 
            className="font-serif font-black text-[clamp(3.8rem,14vw,20rem)] tracking-[0.06em] sm:tracking-[0.18em] leading-[0.85] text-transparent bg-clip-text ml-[0.06em] sm:ml-[0.18em] opacity-95"
            style={{
              fontFamily: "'Cinzel', serif",
              backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #b5bcc9 60%, rgba(50, 55, 68, 0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EMPIRE
          </h1>
          <span 
            className="absolute right-[4vw] sm:right-[10vw] lg:right-[12vw] top-[72%] sm:top-[74%] font-serif font-normal text-[clamp(1.1rem,3.2vw,4rem)] tracking-[0.15em] sm:tracking-[0.28em] text-[#d6d9e0] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            EXPLORER
          </span>
        </div>

        {/* PROMINENT OVERLAPPING CENTRAL FIGURE (In front of giant typography) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[62vh] sm:h-[82vh] lg:h-[86vh] z-[10] flex justify-center items-end pointer-events-none overflow-hidden">
          <img 
            src="/musician.png" 
            alt="Classical Musician"
            className="h-full w-auto max-w-full object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] transform scale-105 sm:scale-120 lg:scale-130 origin-bottom"
            style={{
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rudra_Vina_MIM_Brussels.jpg/800px-Rudra_Vina_MIM_Brussels.jpg';
            }}
          />
        </div>

        {/* SIDE STORY CARDS (Positioned on the lower left and right) */}
        <div className="relative z-[20] flex flex-col md:flex-row justify-between items-start md:items-end w-full max-w-[1400px] mx-auto gap-4 sm:gap-8 mb-2">
          
          {/* Left Column: Voices of Reason */}
          <div className="max-w-[280px] sm:max-w-[310px] w-full space-y-2">
            <div 
              onClick={() => onSelectSample('mayuri-veena')}
              className="w-full h-[130px] sm:h-[190px] rounded-sm overflow-hidden border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
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
            
            <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide pt-0.5" style={{ fontFamily: "'Cinzel', serif" }}>
              Voices of Reason
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#8e95a5] leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
              Socrates defends truth before the Athenian court – a moment that defines the birth of Western philosophy.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('main-suite-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('scanner');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#9da4b0] hover:text-white transition-colors tracking-wider font-normal pt-0.5 cursor-pointer"
            >
              <span>Explore Further &darr;</span>
            </button>
          </div>

          {/* Right Column: Sacrifice and Sovereignty */}
          <div className="max-w-[280px] sm:max-w-[330px] w-full space-y-2 text-left hidden sm:block">
            <h2 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              Sacrifice and Sovereignty
            </h2>
            <p className="text-[11px] sm:text-[12px] text-[#8e95a5] leading-relaxed font-normal line-clamp-2 sm:line-clamp-none">
              A Roman general presents offerings to the gods, embodying the empire's deep ties to ritual and divine order.
            </p>
            <div 
              onClick={() => onSelectSample('yazh')}
              className="w-full h-[130px] sm:h-[180px] rounded-sm overflow-hidden border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
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

      {/* ANCHOR TARGET FOR SMOOTH SCROLL */}
      <div id="main-suite-section" />

    </div>
  );
};
