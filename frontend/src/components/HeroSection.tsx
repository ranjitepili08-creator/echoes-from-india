import React from 'react';
import { 
  Sparkles, 
  Music, 
  Gamepad2, 
  BookOpen, 
  Library, 
  MonitorPlay, 
  ArrowDown, 
  ChevronRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { ActiveTab } from './Navbar';

interface HeroSectionProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectSample: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onSelectSample }) => {
  const featureCards = [
    {
      id: 'scanner' as ActiveTab,
      title: 'AI Vision Scanner',
      subtitle: 'Organological Attribute Extraction',
      description: 'Upload or snap a photo of any ancient temple carving or museum relic to classify shape, resonators, and sound production.',
      icon: Sparkles,
      accent: 'from-amber-400 to-amber-600',
    },
    {
      id: 'game' as ActiveTab,
      title: 'Rhythm Quest',
      subtitle: 'Ancient Raga Tile Game',
      description: 'Play across 4 lanes to ancient ragas (Bhairav, Yaman, Malkauns) with authentic physical microtonal acoustic feedback.',
      icon: Gamepad2,
      accent: 'from-amber-500 to-red-500',
    },
    {
      id: 'studio' as ActiveTab,
      title: 'Virtual Studio',
      subtitle: 'Interactive Acoustic Synthesis',
      description: 'Synthesize real-time physical resonance, Jivari bridge buzzing, harmonic decay, and sympathetic Tarab overtones.',
      icon: Music,
      accent: 'from-amber-400 to-orange-500',
    },
    {
      id: 'knowledge' as ActiveTab,
      title: 'Historical Dossier',
      subtitle: 'Sanskrit Treatises & RAG',
      description: 'Explore translations and citations from the Natya Shastra, Sangita Ratnakara, and Silappadikaram Sangam poetry.',
      icon: BookOpen,
      accent: 'from-yellow-400 to-amber-600',
    },
    {
      id: 'archive' as ActiveTab,
      title: 'Museum Archive',
      subtitle: 'Civilizational Timeline',
      description: 'Browse 13 near-extinct and rare instruments across Vedic, Sangam, Maurya, Gupta, and Medieval Indian eras.',
      icon: Library,
      accent: 'from-amber-300 to-amber-500',
    },
    {
      id: 'kiosk' as ActiveTab,
      title: 'Museum Kiosk',
      subtitle: 'Interactive Exhibition Mode',
      description: 'Touchscreen-friendly kiosk experience built for museum visitors, school workshops, and cultural exhibitions.',
      icon: MonitorPlay,
      accent: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="w-full bg-[#0a0b0e] text-[#f0f2f5] font-sans selection:bg-amber-400/30 selection:text-amber-200">
      
      {/* 100VH FULL-SCREEN HERO STAGE (Exact match to Empire reference layout) */}
      <section className="relative w-full h-[92vh] min-h-[700px] max-h-[1050px] flex flex-col justify-between px-6 sm:px-12 lg:px-16 pt-6 pb-10 overflow-hidden bg-[#0a0b0e]">
        
        {/* TOP EDITORIAL SUBTITLE BAR (Crisp, perfectly spaced above typography) */}
        <div className="relative z-30 flex items-center justify-between w-full max-w-[1350px] mx-auto text-[12px] sm:text-[13px] tracking-wider text-[#8e95a5] font-normal select-none">
          {/* Left Links */}
          <div className="flex items-center gap-6 sm:gap-10">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('knowledge')}>Philosophy &amp; Power</span>
            <span className="hover:text-white transition-colors cursor-pointer hidden sm:inline" onClick={() => onNavigate('knowledge')}>Rituals &amp; Religion</span>
          </div>

          {/* Center Brand Title */}
          <div 
            className="font-serif text-sm sm:text-base font-bold tracking-[0.14em] text-white uppercase text-center" 
            style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif" }}
          >
            Echoes of India
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-6 sm:gap-10 justify-end">
            <span className="hover:text-white transition-colors cursor-pointer hidden sm:inline" onClick={() => onNavigate('archive')}>Warfare &amp; Honor</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('archive')}>Legacy &amp; Ruins</span>
          </div>
        </div>

        {/* GIANT BACKGROUND TYPOGRAPHY: "EMPIRE" + "EXPLORER" */}
        <div className="absolute top-[80px] sm:top-[90px] left-0 w-full text-center pointer-events-none select-none z-[1]">
          <h1 
            className="font-serif font-black text-[clamp(6rem,17.5vw,20.5rem)] tracking-[0.18em] leading-[0.82] text-transparent bg-clip-text ml-[0.18em] opacity-95"
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
            className="absolute right-[8vw] sm:right-[10vw] lg:right-[12vw] top-[74%] font-serif font-normal text-[clamp(1.3rem,3.2vw,3.8rem)] tracking-[0.28em] text-[#d6d9e0] uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            EXPLORER
          </span>
        </div>

        {/* PROMINENT OVERLAPPING CENTRAL FIGURE */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[850px] h-[78vh] z-[10] flex justify-center items-end pointer-events-none">
          <img 
            src="/musician.png" 
            alt="Classical Musician"
            className="h-full w-auto max-w-none object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.98)] transform scale-110 sm:scale-120 lg:scale-130 origin-bottom"
            style={{
              maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Rudra_Vina_MIM_Brussels.jpg/800px-Rudra_Vina_MIM_Brussels.jpg';
            }}
          />
        </div>

        {/* SIDE STORY CARDS */}
        <div className="relative z-[20] flex flex-col lg:flex-row justify-between items-end w-full max-w-[1350px] mx-auto gap-8 mb-2">
          
          {/* Left Column: Voices of Reason */}
          <div className="max-w-[310px] w-full space-y-2.5">
            <div 
              onClick={() => onSelectSample('mayuri-veena')}
              className="w-full h-[185px] rounded-sm overflow-hidden border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.7)] group cursor-pointer relative"
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
              Socrates defends truth before the Athenian court – a moment that defines the ancient philosophical harmony of courtly reason.
            </p>
            <button 
              onClick={() => {
                const el = document.getElementById('feature-matrix-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('knowledge');
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#9299a8] hover:text-white transition-colors tracking-wider font-normal pt-1 uppercase"
            >
              <span>Explore Features</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Sacrifice and Sovereignty */}
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

      {/* LUXURY FEATURE LAUNCHPAD MATRIX (Clean, perfectly positioned below the Hero fold) */}
      <section id="feature-matrix-section" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-14 border-t border-white/10 space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-amber-400">
            Interactive AI &amp; Organological Suite
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
            Experience the Living Sound of Ancient India
          </h2>
          <p className="text-xs sm:text-sm text-[#8e95a5] max-w-xl mx-auto leading-relaxed">
            Select a module to classify museum carvings, synthesize historical timbres, or play ancient ragas in the rhythm game.
          </p>
        </div>

        {/* 6 Feature Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onNavigate(feat.id)}
                className="group relative p-6 rounded-2xl bg-[#12141a]/80 hover:bg-[#161922] border border-white/10 hover:border-amber-400/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl flex flex-col justify-between space-y-5 active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${feat.accent} flex items-center justify-center text-black font-bold shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-black" />
                    </div>
                    <span className="text-xs text-[#8e95a5] group-hover:text-white font-mono flex items-center gap-1 transition-colors">
                      Launch <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-200 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                      {feat.title}
                    </h3>
                    <p className="text-[11px] font-mono text-amber-400/90 font-medium">
                      {feat.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-[#8e95a5] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-[#6b7280]">
                  <span>Explore Module</span>
                  <span className="font-mono text-amber-300/80 uppercase">Interactive</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Historical Instrument Audition Strip */}
        <div className="p-6 rounded-2xl bg-[#111318] border border-white/10 text-center space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="text-left">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300 block">
                Quick Historical Instrument Audition
              </span>
              <span className="text-xs text-[#8e95a5]">
                Tap any instrument to load its acoustics and historical dossier:
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#6b7280]">
              13 Verified Indian Organologies
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
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
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-xs font-medium transition-all active:scale-95"
              >
                <span className="text-white group-hover:text-amber-300">
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
