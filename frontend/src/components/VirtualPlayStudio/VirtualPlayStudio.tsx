import React, { useState, useEffect } from 'react';
import { 
  Music, 
  Mic, 
  Square, 
  Play, 
  Download, 
  Radio, 
  Sparkles, 
  Layers, 
  Volume2,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { HISTORICAL_INSTRUMENTS } from '../../data/instrumentsData';
import { Instrument } from '../../types';
import { PlayableStringInstrument } from './PlayableStringInstrument';
import { PlayableJalTarang } from './PlayableJalTarang';
import { PlayablePakhawaj } from './PlayablePakhawaj';
import { PlayableWindInstrument } from './PlayableWindInstrument';
import { AudioVisualizer } from './AudioVisualizer';
import { audioRecorder } from '../../services/audioRecorder';
import { ActiveTab } from '../Navbar';

interface VirtualPlayStudioProps {
  currentInstrument: Instrument;
  onSelectInstrument: (inst: Instrument) => void;
  onNavigate: (tab: ActiveTab) => void;
  isDroneActive: boolean;
  onToggleDrone: () => void;
}

export const VirtualPlayStudio: React.FC<VirtualPlayStudioProps> = ({
  currentInstrument,
  onSelectInstrument,
  onNavigate,
  isDroneActive,
  onToggleDrone,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Recording Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecord = () => {
    const started = audioRecorder.startRecording();
    if (started) {
      setIsRecording(true);
      setRecordedAudioUrl(null);
    }
  };

  const handleStopRecord = async () => {
    const url = await audioRecorder.stopRecording();
    setIsRecording(false);
    if (url) {
      setRecordedAudioUrl(url);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Real-time Spectrum Visualizer */}
      <AudioVisualizer height={100} />

      {/* Top Header & Instrument Switcher */}
      <div className="bg-indigoHeritage-900/60 border border-saffron-500/20 rounded-2xl p-4 lg:p-6 space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-saffron-400 animate-ping" />
              <span className="text-xs uppercase font-mono font-bold text-saffron-300">
                Interactive Organological Play Engine
              </span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-parchment-100">
              Virtual Play Studio: {currentInstrument.name}
            </h2>
            <p className="text-xs text-parchment-300 mt-0.5">
              {currentInstrument.categoryLabel} • Modeled Timbre: <strong>{currentInstrument.acousticProfile.timbreType}</strong>
            </p>
          </div>

          {/* Performance Recorder & Accompaniment Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Record / Stop Button */}
            {!isRecording ? (
              <button
                onClick={handleStartRecord}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-bold transition-all shadow-sm"
              >
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>Record Performance</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecord}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition-all shadow-md animate-pulse"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Recording ({formatTimer(recordingDuration)})</span>
              </button>
            )}

            {/* Tanpura Accompaniment */}
            <button
              onClick={onToggleDrone}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDroneActive
                  ? 'bg-saffron-500/20 text-saffron-300 border-saffron-500/40 animate-pulse'
                  : 'bg-white/5 border-white/10 text-parchment-300 hover:bg-white/10'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isDroneActive ? 'Tanpura Drone: ON' : 'Tanpura Drone: OFF'}</span>
            </button>

            {/* Jump to Rhythm Game */}
            <button
              onClick={() => onNavigate('game')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-terracotta-500/20 hover:bg-terracotta-500/30 border border-terracotta-500/40 text-terracotta-200 text-xs font-bold"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-terracotta-400" />
              <span>Rhythm Game</span>
            </button>
          </div>
        </div>

        {/* Recorded Audio Playback Bar */}
        {recordedAudioUrl && (
          <div className="bg-white/5 border border-saffron-500/30 rounded-xl p-3 flex items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-saffron-400" />
              <span className="text-xs font-bold text-parchment-100">
                Recording Complete!
              </span>
            </div>
            <div className="flex items-center gap-3">
              <audio src={recordedAudioUrl} controls className="h-8 max-w-[220px]" />
              <a
                href={recordedAudioUrl}
                download={`${currentInstrument.id}-performance.webm`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-saffron-500 text-indigoHeritage-950 text-xs font-bold hover:bg-saffron-400"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Audio</span>
              </a>
            </div>
          </div>
        )}

        {/* Instrument Quick Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-saffron-500/20 pt-2 border-t border-white/5">
          {HISTORICAL_INSTRUMENTS.map((inst) => {
            const isSelected = inst.id === currentInstrument.id;
            return (
              <button
                key={inst.id}
                onClick={() => onSelectInstrument(inst)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-saffron-500 text-indigoHeritage-950 border-saffron-300 font-bold shadow-sm'
                    : 'bg-white/5 text-parchment-300 border-white/5 hover:bg-white/10'
                }`}
              >
                {inst.name}
              </button>
            );
          })}
        </div>

      </div>

      {/* Specialized Tactile Play Interface based on Organological Type */}
      {currentInstrument.playInterface.type === 'strings' && (
        <PlayableStringInstrument instrument={currentInstrument} />
      )}

      {currentInstrument.playInterface.type === 'jaltarang' && (
        <PlayableJalTarang instrument={currentInstrument} />
      )}

      {currentInstrument.playInterface.type === 'pakhawaj' && (
        <PlayablePakhawaj instrument={currentInstrument} />
      )}

      {currentInstrument.playInterface.type === 'wind' && (
        <PlayableWindInstrument instrument={currentInstrument} />
      )}

    </div>
  );
};
