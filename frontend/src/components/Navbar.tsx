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
  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'scanner', label: 'AI Scanner', icon: Sparkles },
    { id: 'game', label: 'Rhythm Game', icon: Gamepad2 },
    { id: 'studio', label: 'Studio', icon: Music },
    { id: 'knowledge', label: 'Dossier', icon: BookOpen },
    { id: 'archive', label: 'Museum', icon: Library },
    { id: 'kiosk', label: 'Kiosk', icon: MonitorPlay },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a0b0e]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Project Logo */}
        <div 
          onClick={() => setActiveTab('scanner')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-300">
            <span className="font-serif text-black font-extrabold text-sm">ॐ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-bold tracking-[0.14em] text-white uppercase group-hover:text-amber-200 transition-colors" style={{ fontFamily: "'Cinzel', serif" }}>
                Echoes of India
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-amber-400/30">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Minimalist Centered Navigation Dock */}
        <nav className="flex items-center gap-1 bg-[#12141a]/90 p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto max-w-full scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black shadow-md font-bold scale-[1.02]'
                    : 'text-[#8e95a5] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400/80'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Audio Controls (Tanpura Drone & Volume) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleDrone}
            title={isDroneActive ? 'Stop Tanpura Drone' : 'Start Tanpura Drone Sound'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isDroneActive
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-white/5 text-[#8e95a5] border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tanpura Drone</span>
          </button>

          <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
            <button 
              onClick={() => {
                const newVol = masterVolume > 0 ? 0 : 0.85;
                onVolumeChange(newVol);
                soundEngine.setMasterVolume(newVol);
              }}
              className="text-[#8e95a5] hover:text-white transition-colors"
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
              className="w-14 sm:w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

      </div>
    </header>
  );
};
