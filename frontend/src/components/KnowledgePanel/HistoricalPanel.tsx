import React, { useState } from 'react';
import { 
  BookOpen, 
  MapPin, 
  Calendar, 
  Scroll, 
  Cpu, 
  Music, 
  Volume2, 
  ShieldAlert, 
  Layers, 
  Flame, 
  Sparkles, 
  ChevronRight,
  Gamepad2,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { ANCIENT_TREATISES } from '../../data/treatisesData';
import { Instrument } from '../../types';
import { ActiveTab } from '../Navbar';
import { soundEngine } from '../../services/soundEngine';

interface HistoricalPanelProps {
  currentInstrument: Instrument;
  onSelectInstrument: (inst: Instrument) => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const HistoricalPanel: React.FC<HistoricalPanelProps> = ({
  currentInstrument,
  onSelectInstrument,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'treatises' | 'acoustics'>('overview');
  const [isPlayingAudition, setIsPlayingAudition] = useState(false);

  const handleAuditionSample = () => {
    setIsPlayingAudition(true);
    // Play a classical ascending-descending phrase
    const notes = currentInstrument.playInterface.notes;
    if (notes && notes.length > 0) {
      notes.forEach((note, idx) => {
        setTimeout(() => {
          soundEngine.playNote(note.frequency, currentInstrument, 1.2, 0.85);
          if (idx === notes.length - 1) {
            setTimeout(() => setIsPlayingAudition(false), 1200);
          }
        }, idx * 280);
      });
    } else if (currentInstrument.playInterface.bols) {
      currentInstrument.playInterface.bols.forEach((bol, idx) => {
        setTimeout(() => {
          soundEngine.playBol(bol.name, bol.pitch, bol.decay, bol.head);
          if (idx === currentInstrument.playInterface.bols!.length - 1) {
            setTimeout(() => setIsPlayingAudition(false), 1200);
          }
        }, idx * 350);
      });
    } else {
      setIsPlayingAudition(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Instrument Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {HISTORICAL_INSTRUMENTS.map((inst) => {
          const isSelected = inst.id === currentInstrument.id;
          return (
            <button
              key={inst.id}
              onClick={() => onSelectInstrument(inst)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md font-bold'
                  : 'bg-[#12141a]/90 text-[#9da4b0] border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{inst.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono ${
                inst.status === 'extinct' ? 'bg-red-500/20 text-red-300' :
                inst.status === 'rare' ? 'bg-amber-500/20 text-amber-300' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {inst.status}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Dossier Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#12141a]/90 border border-white/10 p-5 sm:p-6 lg:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 text-white text-xs font-semibold border border-white/10">
                {currentInstrument.categoryLabel}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                currentInstrument.status === 'extinct' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                currentInstrument.status === 'rare' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Status: {currentInstrument.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-[#9da4b0] text-xs border border-white/10 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-white" />
                <span>{currentInstrument.century}</span>
              </span>
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
                {currentInstrument.name}
              </h1>
              <p className="font-serif text-base sm:text-lg text-[#9da4b0] italic mt-1">
                {currentInstrument.sanskritName}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#d6d9e0] max-w-2xl leading-relaxed">
              {currentInstrument.shortDescription}
            </p>

            {/* Regional Names & Origin Tag */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-[#9da4b0]">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>Origin: <strong className="text-white">{currentInstrument.region}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Scroll className="w-3.5 h-3.5 text-white" />
                <span>Regional: {currentInstrument.regionalNames.join(' • ')}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              <button
                onClick={handleAuditionSample}
                disabled={isPlayingAudition}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all shadow-md touch-manipulation"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudition ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudition ? 'Playing Scale...' : 'Audition Sound'}</span>
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all touch-manipulation"
              >
                <Music className="w-4 h-4 text-white" />
                <span>Play Live</span>
              </button>

              <button
                onClick={() => onNavigate('game')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all touch-manipulation"
              >
                <Gamepad2 className="w-4 h-4 text-white" />
                <span>Rhythm Game</span>
              </button>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="lg:col-span-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-lg relative group">
                <img
                  src={currentInstrument.image}
                  alt={currentInstrument.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  Artifact Profile
                </span>
              </div>

              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-lg relative group">
                <img
                  src={currentInstrument.carvingImage || currentInstrument.image}
                  alt="Ancient Carving"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  Temple Carving
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#646c7c] text-center italic">
              Comparative organological iconography: artifact model vs. historical temple sculpture.
            </p>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'overview', label: 'Historical & Cultural Context', icon: BookOpen },
          { id: 'materials', label: 'Material Science & Anatomy', icon: Layers },
          { id: 'treatises', label: 'Ancient Treatises & Slokas', icon: Scroll },
          { id: 'acoustics', label: 'AI Sound Reconstruction Model', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 touch-manipulation ${
                isActive
                  ? 'bg-white text-black font-bold shadow-sm'
                  : 'text-[#9da4b0] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Scroll className="w-4 h-4 text-white" />
              <span>Civilizational Background</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#9da4b0] leading-relaxed">
              {currentInstrument.historicalContext}
            </p>
          </div>

          <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-3">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-white" />
              <span>Cultural &amp; Sacred Significance</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#9da4b0] leading-relaxed">
              {currentInstrument.culturalSignificance}
            </p>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5 mt-2">
              <span className="text-xs uppercase tracking-wider font-bold text-white block">
                Method of Performance:
              </span>
              <p className="text-xs text-[#9da4b0] leading-relaxed">
                {currentInstrument.playingTechnique}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Organological Anatomy &amp; Material Science
            </h3>
            <p className="text-xs text-[#646c7c] mt-1">
              Physical materials directly determine sound velocity, harmonic impedance, and overtone spectra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentInstrument.constructionMaterials.map((mat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">{mat.name}</span>
                  <span className="text-[10px] font-mono bg-white/10 text-white px-2 py-0.5 rounded">
                    Component #{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-[#d6d9e0]">{mat.description}</p>
                {mat.acousticRole && (
                  <div className="text-[11px] text-[#9da4b0] bg-black/30 p-2 rounded-lg border border-white/5">
                    <strong className="text-white">Acoustic Role:</strong> {mat.acousticRole}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'treatises' && (
        <div className="space-y-6">
          <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-5">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Scroll className="w-4 h-4 text-white" />
              <span>Documented Treatise Citations for {currentInstrument.name}</span>
            </h3>

            <div className="space-y-4">
              {currentInstrument.treatiseCitations.map((cite, idx) => (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-serif">{cite.treatise}</span>
                    {cite.chapter && <span className="text-[#646c7c] font-mono text-[11px]">{cite.chapter}</span>}
                  </div>

                  <div className="bg-[#0a0b0e] p-3.5 sm:p-4 rounded-xl border border-white/5">
                    <p className="font-serif text-xs sm:text-sm text-white italic tracking-wide text-center">
                      "{cite.quote}"
                    </p>
                  </div>

                  <div className="text-xs text-[#9da4b0]">
                    <strong className="text-white">Translation:</strong> {cite.translation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Treatise Catalog */}
          <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-[#646c7c]">
              Foundational Musicological Treatises (RAG Knowledge Base)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ANCIENT_TREATISES.map((t) => (
                <div key={t.id} className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="font-bold text-xs text-white block">{t.name}</span>
                  <span className="text-[10px] text-[#646c7c] font-mono block">Author: {t.author} ({t.century})</span>
                  <p className="text-[11px] text-[#9da4b0] line-clamp-2">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'acoustics' && (
        <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6">
          
          <div className="border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Acoustic Reconstruction Methodology</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white">
              Physical Modeling &amp; Timbre Synthesis Engine
            </h3>
            <p className="text-xs text-[#9da4b0] mt-1 max-w-3xl leading-relaxed">
              As emphasized in project specifications, because audio recordings of extinct instruments do not survive, 
              sound is algorithmically synthesized by modeling physical acoustic variables: cavity volume, air resonance, 
              string tension impedance, flat-bridge buzzing dispersion (Jivari), and sympathetic resonance.
            </p>
          </div>

          {/* Synthesis Parameter Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-[#646c7c] uppercase font-bold block">Resonator Resonance</span>
              <span className="text-base sm:text-lg font-mono font-bold text-white">
                {currentInstrument.acousticProfile.bodyResonanceFreq} Hz
              </span>
              <span className="text-[10px] text-[#646c7c] block">Formant peak frequency</span>
            </div>

            <div className="bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-[#646c7c] uppercase font-bold block">Jivari Overtone Buzz</span>
              <span className="text-base sm:text-lg font-mono font-bold text-white">
                {Math.round(currentInstrument.acousticProfile.jawariBuzz * 100)}%
              </span>
              <span className="text-[10px] text-[#646c7c] block">Bridge dispersion</span>
            </div>

            <div className="bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-[#646c7c] uppercase font-bold block">Natural Decay Time</span>
              <span className="text-base sm:text-lg font-mono font-bold text-white">
                {currentInstrument.acousticProfile.decayTime}s
              </span>
              <span className="text-[10px] text-[#646c7c] block">T60 acoustic envelope</span>
            </div>

            <div className="bg-white/5 p-3.5 sm:p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-[#646c7c] uppercase font-bold block">Harmonic Richness</span>
              <span className="text-base sm:text-lg font-mono font-bold text-white">
                {Math.round(currentInstrument.acousticProfile.harmonicRichness * 100)}%
              </span>
              <span className="text-[10px] text-[#646c7c] block">Sympathetic density</span>
            </div>
          </div>

          {/* Organological Reconstruction Notes */}
          <div className="bg-[#0a0b0e] border border-white/10 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Organological Acoustic Notes:
            </span>
            <p className="text-xs text-[#d6d9e0] leading-relaxed font-mono">
              {currentInstrument.acousticProfile.soundReconstructionNotes}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
