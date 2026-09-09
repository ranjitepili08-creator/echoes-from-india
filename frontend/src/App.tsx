import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VisionScanner } from './components/VisionScanner/VisionScanner';
import { HistoricalPanel } from './components/KnowledgePanel/HistoricalPanel';
import { VirtualPlayStudio } from './components/VirtualPlayStudio/VirtualPlayStudio';
import { RhythmGame } from './components/RhythmGame/RhythmGame';
import { CulturalArchive } from './components/CulturalArchive/CulturalArchive';
import { MuseumKiosk } from './components/KioskMode/MuseumKiosk';
import { HISTORICAL_INSTRUMENTS } from './data/instrumentsData';
import { Instrument } from './types';
import { soundEngine } from './services/soundEngine';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [currentInstrument, setCurrentInstrument] = useState<Instrument>(HISTORICAL_INSTRUMENTS[0]);
  const [isDroneActive, setIsDroneActive] = useState<boolean>(false);
  const [masterVolume, setMasterVolume] = useState<number>(0.85);

  const handleToggleDrone = () => {
    const status = soundEngine.toggleDrone(130.81);
    setIsDroneActive(status);
  };

  const handleSelectSampleFromHero = (sampleId: string) => {
    const found = HISTORICAL_INSTRUMENTS.find((i) => i.id === sampleId);
    if (found) {
      setCurrentInstrument(found);
      setActiveTab('knowledge');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-[#f0f2f5] flex flex-col font-sans selection:bg-white/20 selection:text-white pb-20">
      
      {/* Sleek Floating Luxury Navigation Dock */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDroneActive={isDroneActive}
        onToggleDrone={handleToggleDrone}
        masterVolume={masterVolume}
        onVolumeChange={setMasterVolume}
      />

      {/* Full-Screen Hero Section (Only on Scanner/Home view) */}
      {activeTab === 'scanner' && (
        <HeroSection
          onNavigate={setActiveTab}
          onSelectSample={handleSelectSampleFromHero}
        />
      )}

      {/* Main Feature Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'scanner' && (
          <VisionScanner
            onInstrumentIdentified={setCurrentInstrument}
            onNavigate={setActiveTab}
            selectedInstrument={currentInstrument}
          />
        )}

        {activeTab === 'studio' && (
          <VirtualPlayStudio
            currentInstrument={currentInstrument}
            onSelectInstrument={setCurrentInstrument}
            onNavigate={setActiveTab}
            isDroneActive={isDroneActive}
            onToggleDrone={handleToggleDrone}
          />
        )}

        {activeTab === 'knowledge' && (
          <HistoricalPanel
            currentInstrument={currentInstrument}
            onSelectInstrument={setCurrentInstrument}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'game' && (
          <RhythmGame
            currentInstrument={currentInstrument}
            onSelectInstrument={setCurrentInstrument}
          />
        )}

        {activeTab === 'archive' && (
          <CulturalArchive
            onSelectInstrument={(inst) => {
              setCurrentInstrument(inst);
              setActiveTab('knowledge');
            }}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'kiosk' && (
          <MuseumKiosk
            onSelectInstrument={setCurrentInstrument}
            onNavigate={setActiveTab}
          />
        )}
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#0a0b0e] py-10 px-6 sm:px-12 text-xs text-[#8e95a5]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-serif font-bold text-xs">
              ॐ
            </div>
            <div>
              <span className="font-serif font-bold text-white tracking-wider block text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
                ECHOES OF INDIA
              </span>
              <span className="text-[11px] text-[#646c7c] block">
                Reviving Ancient Indian Instruments through AI &amp; Organological Timbre Synthesis
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 text-center text-[12px]">
            <span>Concept: <strong>Ranjeet</strong></span>
            <span>•</span>
            <span>Treatises: <em>Natya Shastra &amp; Sangita Ratnakara</em></span>
            <span>•</span>
            <span>Research Prototype</span>
          </div>

          <div className="text-[11px] text-[#646c7c]">
            Digital Museum &amp; Acoustic Archive
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
