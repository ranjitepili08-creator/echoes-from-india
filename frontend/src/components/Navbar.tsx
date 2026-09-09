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
    <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[calc(100vw-16px)] sm:max-w-max px-1 pointer-events-auto">
      <nav className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 bg-[#12141a]/95 backdrop-blur-2xl border border-white/10 p-1 sm:p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] max-w-full">
        
        {/* Navigation Tab Pills */}
        <div className="flex items-center justify-around sm:justify-start gap-0.5 sm:gap-1 w-full sm:w-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.id !== 'scanner') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer min-w-[44px] sm:min-w-0 ${
                  isActive
                    ? 'bg-white text-black font-bold shadow-md'
                    : 'text-[#8e95a5] hover:text-white hover:bg-white/5'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isActive ? 'text-black' : 'text-[#8e95a5]'}`} />
                <span className="text-[9px] sm:text-xs sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

        {/* Audio Engine Quick Controls */}
        <div className="hidden sm:flex items-center gap-2 pr-1">
          <button
            onClick={onToggleDrone}
            title={isDroneActive ? 'Stop Tanpura Drone' : 'Start Tanpura Drone Accompaniment'}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              isDroneActive
                ? 'bg-white/20 text-white border-white/40 shadow-sm'
                : 'bg-white/5 text-[#8e95a5] border-white/10 hover:text-white hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Tanpura</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white/5 px-2 py-2 rounded-xl border border-white/10">
            <button 
              onClick={() => {
                const newVol = masterVolume > 0 ? 0 : 0.85;
                onVolumeChange(newVol);
                soundEngine.setMasterVolume(newVol);
              }}
              className="text-[#8e95a5] hover:text-white transition-colors cursor-pointer"
            >
              {masterVolume > 0 ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
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
              className="w-12 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hidden lg:block"
            />
          </div>
        </div>

      </nav>
    </div>
  );
};
