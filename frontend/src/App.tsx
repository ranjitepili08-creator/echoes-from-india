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
import { Sparkles, Heart, Landmark, Code, BookOpen } from 'lucide-react';

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
    <div className="min-h-screen bg-indigoHeritage-950 text-parchment-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDroneActive={isDroneActive}
        onToggleDrone={handleToggleDrone}
        masterVolume={masterVolume}
        onVolumeChange={setMasterVolume}
      />

      {/* Hero Section (Visible on Scanner Tab) */}
      {activeTab === 'scanner' && (
        <HeroSection
          onNavigate={setActiveTab}
          onSelectSample={handleSelectSampleFromHero}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
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

      {/* Footer */}
      <footer className="border-t border-saffron-500/15 bg-indigoHeritage-950/90 py-8 px-4 lg:px-8 text-xs text-parchment-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-saffron-500/20 text-saffron-300 flex items-center justify-center font-serif font-bold text-xs">
              ॐ
            </div>
            <div>
              <span className="font-serif font-bold text-parchment-200">ECHOES OF INDIA</span>
              <span className="text-[11px] text-parchment-500 block">
                Reviving the Sound of Historical Indian Instruments through AI
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 text-center">
            <span>Project Concept: <strong>Ranjeet</strong></span>
            <span>•</span>
            <span>•</span>
            <span>Grounding: <em>Natya Shastra & Sangita Ratnakara</em></span>
          </div>

          <div className="text-[11px] text-parchment-500">
            Researched Organological Sound Reconstruction
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
