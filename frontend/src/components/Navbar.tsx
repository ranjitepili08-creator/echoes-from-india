import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Music, 
  Gamepad2, 
  Library, 
  MonitorPlay, 
  Volume2, 
  VolumeX, 
  Radio 
} from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

export type ActiveTab = 'scanner' | 'studio' | 'knowledge' | 'game' | 'archive' | 'kiosk';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDroneActive: boolean;
  onToggleDrone: () => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDroneActive,
  onToggleDrone,
  masterVolume,
  onVolumeChange,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-indigoHeritage-950/95 backdrop-blur-md border-b border-saffron-500/20 px-3 sm:px-6 lg:px-8 py-2.5 transition-all duration-200 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Project Identity */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('scanner')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-600 via-amber-500 to-terracotta-500 flex items-center justify-center shadow-md shadow-saffron-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-indigoHeritage-950 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-parchment-100 bg-gradient-to-r from-parchment-100 via-saffron-200 to-saffron-400 bg-clip-text text-transparent">
                  ECHOES OF INDIA
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-full bg-saffron-500/20 text-saffron-300 border border-saffron-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-parchment-400 hidden sm:block">
                Reviving Ancient Indian Instruments Through AI & Organology
              </p>
            </div>
          </div>

          {/* Mobile Drone & Volume Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleDrone}
              className={`p-1.5 rounded-xl border text-xs ${
                isDroneActive ? 'bg-saffron-500/20 text-saffron-300 border-saffron-500/40' : 'bg-white/5 text-parchment-400 border-white/10'
              }`}
            >
              <Radio className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                const newVol = masterVolume > 0 ? 0 : 0.85;
                onVolumeChange(newVol);
                soundEngine.setMasterVolume(newVol);
              }}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-parchment-400"
            >
              {masterVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Smooth Horizontal Scroll on Mobile Phones) */}
        <nav className="w-full md:w-auto flex items-center justify-start md:justify-center gap-1 bg-indigoHeritage-900/90 p-1 rounded-2xl border border-saffron-500/20 overflow-x-auto scrollbar-none touch-manipulation">
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'scanner'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md font-bold'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'game'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md font-bold'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-white/5'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Rhythm Game</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md font-bold'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-white/5'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'knowledge'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md font-bold'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'archive'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md font-bold'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-white/5'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Museum</span>
          </button>

          <button
            onClick={() => setActiveTab('kiosk')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'kiosk'
                ? 'bg-gradient-to-r from-saffron-600 to-amber-600 text-indigoHeritage-950 shadow-md font-bold'
                : 'text-parchment-300 hover:text-parchment-100 hover:bg-white/5'
            }`}
          >
            <MonitorPlay className="w-3.5 h-3.5" />
            <span>Kiosk</span>
          </button>
        </nav>

        {/* Desktop Audio Controls */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onToggleDrone}
            title={isDroneActive ? 'Stop Tanpura Drone' : 'Start Tanpura Drone Accompaniment'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isDroneActive
                ? 'bg-saffron-500/20 text-saffron-300 border-saffron-500/50 shadow-sm animate-pulse'
                : 'bg-white/5 text-parchment-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Tanpura</span>
          </button>

          <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
            <button 
              onClick={() => {
                const newVol = masterVolume > 0 ? 0 : 0.85;
                onVolumeChange(newVol);
                soundEngine.setMasterVolume(newVol);
              }}
              className="text-parchment-400 hover:text-parchment-200"
            >
              {masterVolume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onVolumeChange(val);
                soundEngine.setMasterVolume(val);
              }}
              className="w-16 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-saffron-500"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
