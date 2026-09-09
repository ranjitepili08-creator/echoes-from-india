import React from 'react';
import { ActiveTab } from './Navbar';
import { Sparkles, Scan, Music2, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  return (
    <div className="w-full bg-[#0a0b0e] text-[#f0f2f5] font-sans selection:bg-white/20 selection:text-white">
      
      {/* HERO SECTION CONTAINER */}
      <section className="relative w-full min-h-[90vh] lg:h-screen lg:max-h-[1080px] flex flex-col justify-between px-4 sm:px-10 lg:px-20 pt-6 sm:pt-8 pb-8 sm:pb-12 overflow-hidden bg-[#0a0b0e]">
        
        {/* TOP EDITORIAL NAVBAR */}
        <header className="relative z-30 flex items-center justify-between w-full max-w-[1400px] mx-auto text-[11px] sm:text-[13px] tracking-[0.08em] text-[#8e95a5] font-normal select-none mb-4 sm:mb-0">
          {/* Left Links */}
          <div className="flex items-center gap-4 sm:gap-10">
            <button 
              onClick={() => onNavigate('scanner')}
              className="hover:text-white transition-colors duration-200 text-left cursor-pointer uppercase text-[10px] sm:text-xs font-semibold tracking-wider"
            >
              AI Scanner
            </button>
            <button 
              onClick={() => onNavigate('knowledge')}
              className="hover:text-white transition-colors duration-200 text-left cursor-pointer hidden md:inline uppercase text-[10px] sm:text-xs font-semibold tracking-wider"
            >
              Natya Shastra
            </button>
          </div>

          {/* Center Brand Title */}
          <div 
            className="font-serif text-sm sm:text-lg font-bold tracking-[0.14em] text-white uppercase text-center" 
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Echoes of India
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-4 sm:gap-10 justify-end">
            <button 
              onClick={() => onNavigate('studio')}
              className="hover:text-white transition-colors duration-200 text-right cursor-pointer hidden md:inline uppercase text-[10px] sm:text-xs font-semibold tracking-wider"
            >
              Live Studio
            </button>
            <button 
              onClick={() => onNavigate('archive')}
              className="hover:text-white transition-colors duration-200 text-right cursor-pointer uppercase text-[10px] sm:text-xs font-semibold tracking-wider"
            >
              Archive
            </button>
          </div>
        </header>

        {/* DESKTOP GIANT TYPOGRAPHY: "EMPIRE" + "EXPLORER" */}
        <div className="hidden lg:block absolute top-[6%] left-0 w-full text-center pointer-events-none select-none z-[1] overflow-hidden px-2">
          <h1 
            className="font-serif font-black text-[clamp(4.5rem,15vw,20rem)] tracking-[0.18em] leading-[0.85] text-transparent bg-clip-text ml-[0.18em] opacity-90"
            style={{
              fontFamily: "'Cinzel', serif",
              backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #9da4b0 60%, rgba(50, 55, 68, 0.3) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EMPIRE
          </h1>
          <span 
            className="absolute right-[12vw] top-[74%] font-serif font-normal text-[clamp(1.2rem,3.2vw,4rem)] tracking-[0.28em] text-[#c4cad4] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            EXPLORER
          </span>
        </div>

        {/* MOBILE HERO HEADER & INTRO (Flows cleanly without overlapping on small screens) */}
        <div className="block lg:hidden text-center my-4 space-y-1.5 z-20">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8e95a5] block">
            Acoustic Heritage of Bharat
          </span>
          <h1 
            className="font-serif font-extrabold text-3xl sm:text-5xl text-white tracking-[0.08em] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Echoes of India
          </h1>
          <p className="text-xs text-[#9da4b0] max-w-md mx-auto leading-relaxed px-4">
            Resurrecting rare &amp; ancient Indian instruments through AI organology and physical timbre synthesis.
          </p>
        </div>

        {/* CENTRAL MAESTRO ARTWORK */}
        {/* On desktop: position absolute layered behind side cards. On mobile: centered fluid hero visual */}
        <div className="relative lg:absolute lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2 w-full max-w-[340px] sm:max-w-[480px] lg:max-w-[850px] mx-auto h-[260px] sm:h-[360px] lg:h-[82vh] z-[10] flex justify-center items-end pointer-events-none my-2 lg:my-0">
          <img 
            src="/musician.png" 
            alt="Classical Indian Musician"
            className="h-full w-auto max-w-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] transform scale-100 sm:scale-105 lg:scale-125 origin-bottom"
            style={{
              maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/instruments/rudra-veena.jpg';
            }}
          />
        </div>

        {/* ACTION CTA ON MOBILE */}
        <div className="flex lg:hidden items-center justify-center gap-3 z-20 my-3">
          <button
            onClick={() => {
              const el = document.getElementById('main-suite-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else onNavigate('scanner');
            }}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all touch-manipulation"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Scan Instrument</span>
          </button>
          <button
            onClick={() => onNavigate('studio')}
            className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition-all touch-manipulation"
          >
            <Music2 className="w-3.5 h-3.5 text-white/80" />
            <span>Play Studio</span>
          </button>
        </div>

        {/* SIDE STORY CARDS / FEATURED SPOTLIGHTS */}
        {/* On desktop: positioned at bottom left & right corners. On mobile: responsive grid cards */}
        <div className="relative z-[20] grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row justify-between items-stretch lg:items-end w-full max-w-[1400px] mx-auto gap-3 sm:gap-6 mt-2 lg:mt-0">
          
          {/* Left Spotlight: Pena (Sacred Manipuri Fiddle) */}
          <div 
            onClick={() => onSelectSample('pena')}
            className="group cursor-pointer bg-[#12141a]/90 sm:bg-[#12141a]/70 lg:bg-transparent lg:hover:bg-[#12141a]/40 p-3 lg:p-0 rounded-2xl lg:rounded-none border border-white/10 lg:border-none backdrop-blur-md max-w-full sm:max-w-[320px] lg:max-w-[300px] w-full space-y-2 transition-all"
          >
            <div className="w-full h-[120px] sm:h-[150px] lg:h-[170px] rounded-xl lg:rounded-sm overflow-hidden border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.6)] relative bg-black/40">
              <img 
                src="/instruments/pena.jpg" 
                alt="Pena Lute of Manipur" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/hero1.jpeg';
                }}
              />
              <span className="absolute top-2 left-2 text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-black/70 text-white border border-white/15">
                Spotlight • Manipur
              </span>
            </div>
            
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide group-hover:text-white/90" style={{ fontFamily: "'Cinzel', serif" }}>
                  Pena of Manipur
                </h2>
                <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#8e95a5] leading-relaxed line-clamp-2">
                Sacred single-string bowed lute with bell-bow, invoking cosmic creation in the ancient Lai Haraoba.
              </p>
            </div>
          </div>

          {/* Right Spotlight: Mayuri Veena & Yazh */}
          <div 
            onClick={() => onSelectSample('mayuri-veena')}
            className="group cursor-pointer bg-[#12141a]/90 sm:bg-[#12141a]/70 lg:bg-transparent lg:hover:bg-[#12141a]/40 p-3 lg:p-0 rounded-2xl lg:rounded-none border border-white/10 lg:border-none backdrop-blur-md max-w-full sm:max-w-[320px] lg:max-w-[300px] w-full space-y-2 transition-all"
          >
            <div className="space-y-0.5 hidden lg:block">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                  Mayuri Veena &amp; Taus
                </h2>
                <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#8e95a5] leading-relaxed line-clamp-2">
                Peacock-carved bowed chordophone embodying the royal court elegance and Dhrupad ragas.
              </p>
            </div>

            <div className="w-full h-[120px] sm:h-[150px] lg:h-[170px] rounded-xl lg:rounded-sm overflow-hidden border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.6)] relative bg-black/40">
              <img 
                src="/instruments/mayuri-veena.jpg" 
                alt="Mayuri Veena" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/hero2.jpeg';
                }}
              />
              <span className="absolute top-2 left-2 text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-black/70 text-white border border-white/15">
                Court Instrument
              </span>
            </div>

            <div className="space-y-0.5 block lg:hidden">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-sm sm:text-base font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                  Mayuri Veena &amp; Taus
                </h2>
                <ArrowRight className="w-3.5 h-3.5 text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#8e95a5] leading-relaxed line-clamp-2">
                Peacock-carved bowed chordophone embodying the royal court elegance and Dhrupad ragas.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ANCHOR TARGET FOR SMOOTH SCROLL */}
      <div id="main-suite-section" />

    </div>
  );
};
