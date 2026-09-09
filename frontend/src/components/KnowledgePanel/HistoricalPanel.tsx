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
    <div className="space-y-8">
      {/* Top Instrument Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-saffron-500/20">
        {HISTORICAL_INSTRUMENTS.map((inst) => {
          const isSelected = inst.id === currentInstrument.id;
          return (
            <button
              key={inst.id}
              onClick={() => onSelectInstrument(inst)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isSelected
                  ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 border-saffron-400 shadow-md font-bold'
                  : 'bg-indigoHeritage-900/60 text-parchment-300 border-white/10 hover:bg-white/5 hover:text-parchment-100'
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
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigoHeritage-900 via-indigoHeritage-900/90 to-indigoHeritage-950 border border-saffron-500/30 p-6 lg:p-8 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-300 text-xs font-semibold border border-saffron-500/30">
                {currentInstrument.categoryLabel}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                currentInstrument.status === 'extinct' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                currentInstrument.status === 'rare' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Status: {currentInstrument.status}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-parchment-300 text-xs border border-white/10 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentInstrument.century}</span>
              </span>
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-parchment-100">
                {currentInstrument.name}
              </h1>
              <p className="font-serif text-lg text-saffron-300 italic mt-1">
                {currentInstrument.sanskritName}
              </p>
            </div>

            <p className="text-sm sm:text-base text-parchment-200 max-w-2xl leading-relaxed">
              {currentInstrument.shortDescription}
            </p>

            {/* Regional Names & Origin Tag */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-parchment-300">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <MapPin className="w-3.5 h-3.5 text-terracotta-400" />
                <span>Origin: <strong>{currentInstrument.region}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Scroll className="w-3.5 h-3.5 text-saffron-400" />
                <span>Regional: {currentInstrument.regionalNames.join(' • ')}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={handleAuditionSample}
                disabled={isPlayingAudition}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-amber-500 text-indigoHeritage-950 font-bold text-xs hover:scale-105 transition-all shadow-md"
              >
                <Volume2 className={`w-4 h-4 ${isPlayingAudition ? 'animate-bounce' : ''}`} />
                <span>{isPlayingAudition ? 'Playing Audition Scale...' : 'Audition Sound Profile'}</span>
              </button>

              <button
                onClick={() => onNavigate('studio')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigoHeritage-800 hover:bg-indigoHeritage-700 border border-saffron-500/30 text-parchment-100 font-semibold text-xs transition-all"
              >
                <Music className="w-4 h-4 text-saffron-400" />
                <span>Play In Virtual Studio</span>
              </button>

              <button
                onClick={() => onNavigate('game')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta-500/20 hover:bg-terracotta-500/30 border border-terracotta-500/40 text-terracotta-200 font-semibold text-xs transition-all"
              >
                <Gamepad2 className="w-4 h-4 text-terracotta-400" />
                <span>Play in Rhythm Game</span>
              </button>
            </div>
          </div>

          {/* Visual Showcase (Photo + Sculpture Side by Side) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/40 border border-saffron-500/20 shadow-lg relative group">
                <img
                  src={currentInstrument.image}
                  alt={currentInstrument.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-parchment-200 text-[10px] font-mono px-2 py-0.5 rounded">
                  Artifact Profile
                </span>
              </div>

              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-black/40 border border-saffron-500/20 shadow-lg relative group">
                <img
                  src={currentInstrument.carvingImage || currentInstrument.image}
                  alt="Ancient Carving"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-saffron-300 text-[10px] font-mono px-2 py-0.5 rounded">
                  Temple Carving
                </span>
              </div>
            </div>
            <p className="text-[11px] text-parchment-400 text-center italic">
              Comparative organological iconography: artifact model vs. historical temple sculpture.
            </p>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/40 shadow-sm'
                  : 'text-parchment-400 hover:text-parchment-200 hover:bg-white/5'
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigoHeritage-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-parchment-100 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-saffron-400" />
              <span>Civilizational Background</span>
            </h3>
            <p className="text-sm text-parchment-300 leading-relaxed">
              {currentInstrument.historicalContext}
            </p>
          </div>

          <div className="bg-indigoHeritage-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-parchment-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-terracotta-400" />
              <span>Cultural & Sacred Significance</span>
            </h3>
            <p className="text-sm text-parchment-300 leading-relaxed">
              {currentInstrument.culturalSignificance}
            </p>
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 mt-2">
              <span className="text-xs uppercase tracking-wider font-bold text-saffron-300 block">
                Method of Performance:
              </span>
              <p className="text-xs text-parchment-300 leading-relaxed">
                {currentInstrument.playingTechnique}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="bg-indigoHeritage-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-parchment-100">
              Organological Anatomy & Material Science
            </h3>
            <p className="text-xs text-parchment-400 mt-1">
              Physical materials directly determine sound velocity, harmonic impedance, and overtone spectra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentInstrument.constructionMaterials.map((mat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-saffron-300">{mat.name}</span>
                  <span className="text-[10px] font-mono bg-saffron-500/10 text-saffron-400 px-2 py-0.5 rounded">
                    Component #{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-parchment-200">{mat.description}</p>
                {mat.acousticRole && (
                  <div className="text-[11px] text-parchment-400 bg-black/20 p-2 rounded-lg border border-white/5">
                    <strong className="text-terracotta-300">Acoustic Role:</strong> {mat.acousticRole}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'treatises' && (
        <div className="space-y-6">
          <div className="bg-indigoHeritage-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="font-serif text-lg font-bold text-parchment-100 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-saffron-400" />
              <span>Documented Treatise Citations for {currentInstrument.name}</span>
            </h3>

            <div className="space-y-4">
              {currentInstrument.treatiseCitations.map((cite, idx) => (
                <div key={idx} className="bg-white/5 border border-saffron-500/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-saffron-300 font-serif">{cite.treatise}</span>
                    {cite.chapter && <span className="text-parchment-400 font-mono text-[11px]">{cite.chapter}</span>}
                  </div>

                  <div className="bg-indigoHeritage-950/80 p-4 rounded-xl border border-white/5">
                    <p className="font-serif text-sm sm:text-base text-parchment-100 italic tracking-wide text-center">
                      "{cite.quote}"
                    </p>
                  </div>

                  <div className="text-xs text-parchment-300">
                    <strong className="text-parchment-100">Translation:</strong> {cite.translation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Treatise Catalog */}
          <div className="bg-indigoHeritage-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-parchment-400">
              Foundational Musicological Treatises (RAG Knowledge Base)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ANCIENT_TREATISES.map((t) => (
                <div key={t.id} className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="font-bold text-xs text-saffron-300 block">{t.name}</span>
                  <span className="text-[10px] text-parchment-400 font-mono block">Author: {t.author} ({t.century})</span>
                  <p className="text-[11px] text-parchment-300 line-clamp-2">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'acoustics' && (
        <div className="bg-indigoHeritage-900/60 border border-saffron-500/30 rounded-2xl p-6 lg:p-8 space-y-6">
          
          <div className="border-b border-white/10 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-500/10 text-saffron-300 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Acoustic Reconstruction Methodology</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-parchment-100">
              Physical Modeling & Timbre Synthesis Engine
            </h3>
            <p className="text-xs text-parchment-300 mt-1 max-w-3xl leading-relaxed">
              As emphasized in project specifications, because audio recordings of extinct instruments do not survive, 
              sound is algorithmically synthesized by modeling physical acoustic variables: cavity volume, air resonance, 
              string tension impedance, flat-bridge buzzing dispersion (Jivari), and sympathetic resonance.
            </p>
          </div>

          {/* Synthesis Parameter Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-parchment-400 uppercase font-bold block">Resonator Resonance</span>
              <span className="text-lg font-mono font-bold text-saffron-300">
                {currentInstrument.acousticProfile.bodyResonanceFreq} Hz
              </span>
              <span className="text-[10px] text-parchment-400 block">Formant peak frequency</span>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-parchment-400 uppercase font-bold block">Jivari Overtone Buzz</span>
              <span className="text-lg font-mono font-bold text-terracotta-300">
                {Math.round(currentInstrument.acousticProfile.jawariBuzz * 100)}%
              </span>
              <span className="text-[10px] text-parchment-400 block">Non-linear bridge dispersion</span>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-parchment-400 uppercase font-bold block">Natural Decay Time</span>
              <span className="text-lg font-mono font-bold text-amber-300">
                {currentInstrument.acousticProfile.decayTime}s
              </span>
              <span className="text-[10px] text-parchment-400 block">T60 acoustic envelope</span>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] text-parchment-400 uppercase font-bold block">Harmonic Richness</span>
              <span className="text-lg font-mono font-bold text-emerald-300">
                {Math.round(currentInstrument.acousticProfile.harmonicRichness * 100)}%
              </span>
              <span className="text-[10px] text-parchment-400 block">Sympathetic spectral density</span>
            </div>
          </div>

          {/* Organological Reconstruction Notes */}
          <div className="bg-indigoHeritage-950/80 border border-saffron-500/20 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-saffron-300 uppercase tracking-wider block">
              Organological Acoustic Notes:
            </span>
            <p className="text-xs text-parchment-200 leading-relaxed font-mono">
              {currentInstrument.acousticProfile.soundReconstructionNotes}
            </p>
          </div>

        </div>
      )}

    </div>
  );
};
