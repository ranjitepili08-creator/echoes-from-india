import React, { useEffect, useRef } from 'react';
import { soundEngine } from '../../services/soundEngine';

interface AudioVisualizerProps {
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ height = 110 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const analyser = soundEngine.getAnalyser();
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!analyser) {
        // Draw idle subtle sine wave
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const midY = canvas.height / 2;
        ctx.moveTo(0, midY);
        for (let x = 0; x < canvas.width; x += 5) {
          const y = midY + Math.sin(x * 0.03 + Date.now() * 0.002) * 4;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        animationId = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const timeDomainArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(timeDomainArray);

      const width = canvas.width;
      const h = canvas.height;

      // 1. Draw FFT Frequency Spectrum Bars (Crisp monochrome & subtle white/silver glow)
      const barCount = 48;
      const barWidth = (width / barCount) - 2;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const barHeight = percent * (h * 0.75);

        const x = i * (barWidth + 2);
        const y = h - barHeight;

        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(0.5, 'rgba(200, 210, 230, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Top cap glow
        if (barHeight > 5) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.fillRect(x, y, barWidth, 2);
        }
      }

      // 2. Draw Oscilloscope Waveform Line Overlay
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let lineX = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeDomainArray[i] / 128.0;
        const lineY = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(lineX, lineY);
        } else {
          ctx.lineTo(lineX, lineY);
        }

        lineX += sliceWidth;
      }

      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-[#0c0d12] border border-white/10 p-2 shadow-inner">
      <div className="absolute top-2 left-3 flex items-center gap-2 pointer-events-none z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-mono uppercase font-bold text-[#8e95a5]">
          Real-Time Acoustic Spectrum & FFT Waveform
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full block"
      />
    </div>
  );
};
