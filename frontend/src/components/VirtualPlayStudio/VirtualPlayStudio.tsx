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
  BookOpen,
  Brain,
  Camera
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
import { EchoMatchGame } from '../RhythmGame/EchoMatchGame';

import { InteractiveGestureStringInstrument } from './InteractiveGestureStringInstrument';

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
  const [studioMode, setStudioMode] = useState<'play' | 'gesture' | 'echo'>('play');
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
      <div className="bg-[#12141a]/90 border border-white/10 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-xs uppercase font-mono font-bold text-white">
                Interactive Organological Play Engine
              </span>
            </div>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white">
              Virtual Play Studio: {currentInstrument.name}
            </h2>
            <p className="text-xs text-[#9da4b0] mt-0.5">
              {currentInstrument.categoryLabel} • Modeled Timbre: <strong>{currentInstrument.acousticProfile.timbreType}</strong>
            </p>
          </div>

          {/* Performance Recorder & Accompaniment Controls */}
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {/* Record / Stop Button */}
            {!isRecording ? (
              <button
                onClick={handleStartRecord}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 text-xs font-bold transition-all shadow-sm touch-manipulation"
              >
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>Record</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecord}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold transition-all shadow-md animate-pulse touch-manipulation"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop ({formatTimer(recordingDuration)})</span>
              </button>
            )}

            {/* Tanpura Accompaniment */}
            <button
              onClick={onToggleDrone}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all touch-manipulation ${
                isDroneActive
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-white/5 border-white/10 text-[#9da4b0] hover:bg-white/10 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isDroneActive ? 'Tanpura: ON' : 'Tanpura: OFF'}</span>
            </button>

            {/* Jump to Echo Match Memory Game */}
            <button
              onClick={() => setStudioMode('echo')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all touch-manipulation cursor-pointer ${
                studioMode === 'echo'
                  ? 'bg-amber-400 text-black border-amber-300 shadow-md'
                  : 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Echo Match</span>
            </button>

            {/* Jump to Piano Tiles Rhythm Game */}
            <button
              onClick={() => onNavigate('game')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold touch-manipulation cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Piano Tiles</span>
            </button>
          </div>
        </div>

        {/* Recorded Audio Playback Bar */}
        {recordedAudioUrl && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">
                Recording Complete!
              </span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
              <audio src={recordedAudioUrl} controls className="h-8 max-w-[200px]" />
              <a
                href={recordedAudioUrl}
                download={`${currentInstrument.id}-performance.webm`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-neutral-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </a>
            </div>
          </div>
        )}

        {/* Mode Selector & Instrument Quick Switcher Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/5">
          
          {/* Studio Mode Selector Pills */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setStudioMode('play')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'play'
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/5 text-[#9da4b0] hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Tactile Studio</span>
            </button>

            <button
              onClick={() => setStudioMode('gesture')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'gesture'
                  ? 'bg-emerald-400 text-black shadow-sm font-black'
                  : 'bg-white/5 text-[#9da4b0] hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>AI Hand Tracking</span>
            </button>

            <button
              onClick={() => setStudioMode('echo')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                studioMode === 'echo'
                  ? 'bg-amber-400 text-black shadow-sm font-black'
                  : 'bg-white/5 text-[#9da4b0] hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Echo Match</span>
            </button>

            <button
              onClick={() => onNavigate('game')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#9da4b0] hover:bg-white/10 hover:text-white bg-white/5 border border-white/5 transition-all cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Piano Tiles</span>
            </button>
          </div>

          {/* Instrument Quick Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {HISTORICAL_INSTRUMENTS.map((inst) => {
              const isSelected = inst.id === currentInstrument.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => onSelectInstrument(inst)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-white text-black border-white font-bold shadow-sm'
                      : 'bg-white/5 text-[#9da4b0] border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {inst.name}
                </button>
              );
            })}
          </div>

        </div>

      </div>

      {/* Mode 1: AI Webcam Hand Tracking String Instrument */}
      {studioMode === 'gesture' && (
        <InteractiveGestureStringInstrument
          instrument={currentInstrument}
          onNavigate={onNavigate}
          onSelectInstrument={onSelectInstrument}
        />
      )}

      {/* Mode 2: Echo Match Memory Game */}
      {studioMode === 'echo' && (
        <EchoMatchGame
          currentInstrument={currentInstrument}
          onSelectInstrument={onSelectInstrument}
          onSwitchMode={(m) => {
            if (m === 'tiles') onNavigate('game');
            else setStudioMode('echo');
          }}
        />
      )}

      {/* Mode 3: Specialized Tactile Play Interface based on Organological Type */}
      {studioMode === 'play' && (
        <>
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
        </>
      )}

    </div>
  );
};
