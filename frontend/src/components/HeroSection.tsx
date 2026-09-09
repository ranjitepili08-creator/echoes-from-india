import React from 'react';
import { Sparkles, Music, ArrowDown, BookOpen, Gamepad2, Layers } from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  return (
    <div className="w-full bg-[#0a0b0e] text-[#f0f2f5] font-sans selection:bg-saffron-500/30 selection:text-saffron-200">
      
      {/* FULL-SCREEN EDITORIAL HERO STAGE (Matching the exact Empire reference layout) */}
      <section className="relative w-full min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-16 pt-7 pb-10 overflow-hidden bg-[#0a0b0e] border-b border-white/5">
        
        {/* Minimal Editorial Top Navigation (from reference design) */}
        <header className="relative z-30 grid grid-cols-1 md:grid-cols-3 items-center w-full max-w-7xl mx-auto text-xs tracking-widest uppercase font-medium text-[#9da4b0]">
          {/* Left Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => onNavigate('scanner')}
              className="hover:text-white transition-colors duration-200 tracking-wider text-left"
            >
              AI Vision Scan
            </button>
            <button 
              onClick={() => onNavigate('knowledge')}
              className="hover:text-white transition-colors duration-200 tracking-wider text-left"
            >
              Rituals &amp; Treatises
            </button>
          </nav>

          {/* Center Brand Title */}
          <div className="text-center font-serif text-lg sm:text-xl font-bold tracking-[0.14em] text-white uppercase" style={{ fontFamily: "'Cinzel', serif" }}>
            Echoes of India
          </div>

          {/* Right Nav Links */}
          <nav className="hidden md:flex items-center justify-end gap-8">
            <button 
              onClick={() => onNavigate('studio')}
              className="hover:text-white transition-colors duration-200 tracking-wider text-right"
            >
              Virtual Studio
            </button>
            <button 
              onClick={() => onNavigate('game')}
              className="hover:text-white transition-colors duration-200 tracking-wider text-right"
            >
              Rhythm Quest
            </button>
          </nav>
        </header>

        {/* GIANT BACKGROUND TYPOGRAPHY: "EMPIRE / ECHOES" (Behind the central figure) */}
        <div className="absolute top-[8%] sm:top-[6%] lg:top-[5%] left-0 w-full text-center pointer-events-none select-none z-[5]">
          <h1 
            className="font-serif font-black text-[clamp(6.5rem,17.5vw,19.5rem)] tracking-[0.16em] leading-[0.85] text-transparent bg-clip-text ml-[0.16em] opacity-95"
            style={{
              fontFamily: "'Cinzel', serif",
              backgroundImage: 'linear-gradient(180deg, #ffffff 15%, #b5bcc9 55%, rgba(60, 65, 80, 0.2) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(0,0,0,0.8)'
            }}
          >
            EMPIRE
          </h1>
          <span 
            className="absolute right-[8vw] sm:right-[10vw] lg:right-[12vw] top-[75%] font-serif font-normal text-[clamp(1.4rem,3.4vw,4rem)] tracking-[0.26em] text-[#d6d9e0] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            EXPLORER
          </span>
        </div>

        {/* PROMINENT OVERLAPPING CENTRAL FIGURE (In front of giant typography) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[820px] h-[82%] sm:h-[86%] lg:h-[90%] z-[15] flex justify-center items-end pointer-events-none">
          <img 
            src="/musician.png" 
            alt="Classical Musician"
            className="max-h-full max-w-full object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] transition-transform duration-700 hover:scale-[1.02]"
            style={{
              maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rudra_Vina_MIM_Brussels.jpg/800px-Rudra_Vina_MIM_Brussels.jpg';
            }}
          />
        </div>

        {/* SIDE CONTENT OVERLAYS (Voices of Reason on Left, Sacrifice & Sovereignty on Right) */}
        <div className="relative z-[25] flex flex-col lg:flex-row justify-between items-center lg:items-end w-full max-w-7xl mx-auto mt-28 sm:mt-36 lg:mt-48 gap-8">
          
          {/* Left Column: Voices of Reason (Image top, text bottom, explore link) */}
          <div className="max-w-[320px] w-full space-y-3 bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-2xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none">
            <div 
              onClick={() => onSelectSample('mayuri-veena')}
              className="w-full h-52 sm:h-56 rounded-md overflow-hidden border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.8)] group cursor-pointer relative"
            >
              <img 
                src="/hero1.jpeg" 
                alt="Voices of Reason" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mayuri_vina_or_Taus_MIM_1947.jpg/800px-Mayuri_vina_or_Taus_MIM_1947.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-[11px] font-mono text-saffron-300 font-semibold">Audition Mayuri Veena →</span>
              </div>
            </div>
            
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide pt-1" style={{ fontFamily: "'Cinzel', serif" }}>
              Voices of Reason
            </h2>
            <p className="text-[13px] text-[#8e95a5] leading-relaxed font-normal">
              Socrates defends truth before the Athenian court – a timeless moment that defines the ancient philosophical harmony of courtly reason.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('audition-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('knowledge');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#9299a8] hover:text-white transition-colors tracking-wider font-semibold group pt-1 uppercase"
            >
              <span>Explore Further</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Right Column: Sacrifice and Sovereignty (Text top, image bottom) */}
          <div className="max-w-[340px] w-full space-y-3 bg-black/40 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4 lg:p-0 rounded-2xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none text-left lg:text-left">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              Sacrifice and Sovereignty
            </h2>
            <p className="text-[13px] text-[#8e95a5] leading-relaxed font-normal">
              A Roman general presents offerings to the gods, embodying the empire's deep civilizational ties to ritual, music, and divine order.
            </p>
            <div 
              onClick={() => onSelectSample('yazh')}
              className="w-full h-48 sm:h-52 rounded-md overflow-hidden border border-white/15 shadow-[0_20px_40px_rgba(0,0,0,0.8)] group cursor-pointer relative"
            >
              <img 
                src="/hero2.jpeg" 
                alt="Sacrifice and Sovereignty" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Amaravati_harp_relief_detail.jpg/800px-Amaravati_harp_relief_detail.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <span className="text-[11px] font-mono text-saffron-300 font-semibold">Audition Ancient Yazh →</span>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* QUICK HISTORICAL INSTRUMENT AUDITION (Moved down below the hero section) */}
      <section id="audition-section" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 border-b border-white/5">
        <div className="p-6 rounded-2xl bg-[#111318]/90 border border-saffron-500/20 text-center space-y-4 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Historical Instrument Quick Audition</span>
            </div>
            <p className="text-xs text-parchment-400">
              Select any ancient instrument below to reconstruct its acoustic profile, treatises, and playable soundfont:
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
