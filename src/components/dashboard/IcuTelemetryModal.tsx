"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  Heart,
  Wind,
  Droplets,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Maximize2,
} from "lucide-react";

interface IcuTelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  bedNumber?: string;
}

export default function IcuTelemetryModal({
  isOpen,
  onClose,
  patientName = "Rajeshwar Singh",
  bedNumber = "ICU-01",
}: IcuTelemetryModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [heartRate, setHeartRate] = useState(74);
  const [spo2, setSpo2] = useState(98);
  const [respRate, setRespRate] = useState(16);
  const [bpSystolic, setBpSystolic] = useState(122);
  const [bpDiastolic, setBpDiastolic] = useState(78);
  const [isMuted, setIsMuted] = useState(true);
  const [arrhythmiaAlert, setArrhythmiaAlert] = useState(false);

  // Fluctuating vitals simulation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setHeartRate((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = Math.max(62, Math.min(105, prev + delta));
        setArrhythmiaAlert(next > 100);
        return next;
      });

      setSpo2((prev) => {
        const delta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(94, Math.min(100, prev + delta));
      });

      setRespRate((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(12, Math.min(22, prev + delta));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Live ECG & Pleth Waveform Canvas Rendering Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const ecgMidY = height * 0.35;
    const plethMidY = height * 0.8;

    ctx.fillStyle = "#020806";
    ctx.fillRect(0, 0, width, height);

    let step = 0;

    const render = () => {
      ctx.fillStyle = "rgba(2, 8, 6, 0.08)";
      ctx.fillRect(x, 0, 10, height);

      // Lead II ECG Synthetic Waveform (P - Q - R - S - T)
      ctx.strokeStyle = "#10b981"; // ECG Green
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      const prevX = x;
      x = (x + 2) % width;

      const phase = step % 60;
      let yOffset = 0;

      if (phase === 10) yOffset = -8; // P wave
      else if (phase === 18) yOffset = 4; // Q wave
      else if (phase === 20) yOffset = -55; // R peak
      else if (phase === 22) yOffset = 14; // S dip
      else if (phase === 30) yOffset = -14; // T wave
      else yOffset = (Math.random() - 0.5) * 1.5; // baseline noise

      const currentY = ecgMidY + yOffset;

      ctx.moveTo(prevX, ecgMidY);
      ctx.lineTo(x, currentY);
      ctx.stroke();

      // Pleth (SpO2) Pulse Waveform
      ctx.strokeStyle = "#06b6d4"; // Cyan
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const plethY = plethMidY + Math.sin(step * 0.12) * 18;
      ctx.moveTo(prevX, plethMidY);
      ctx.lineTo(x, plethY);
      ctx.stroke();

      step++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-[#030d09] w-full max-w-5xl rounded-3xl border border-emerald-900/60 shadow-2xl overflow-hidden font-mono flex flex-col">
        {/* Monitor Header */}
        <div className="p-4 px-6 bg-[#051811] border-b border-emerald-900/40 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                BEDSIDE PATIENT MONITOR • {bedNumber}
              </span>
              <p className="text-sm font-bold text-white tracking-wide">
                {patientName} (Adult ICU Bed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {arrhythmiaAlert && (
              <span className="bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> TACHYCARDIA ALERT
              </span>
            )}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 transition cursor-pointer"
              title={isMuted ? "Unmute Beep" : "Mute Monitor"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Oscilloscope Grid & Vitals Display */}
        <div className="grid grid-cols-1 lg:grid-cols-4 p-4 gap-4 bg-[#020806]">
          {/* Waveform Canvas Area (3 Cols) */}
          <div className="lg:col-span-3 bg-[#010504] rounded-2xl border border-emerald-950 p-3 relative flex flex-col justify-between">
            <div className="flex justify-between items-center text-[10px] text-emerald-400/80 mb-2">
              <span className="font-bold">LEAD II • 25mm/s • 10mm/mV</span>
              <span className="text-cyan-400 font-bold">PLETH • SpO2 100%</span>
            </div>

            <canvas
              ref={canvasRef}
              width={680}
              height={320}
              className="w-full h-80 rounded-xl block bg-[#020806]"
            />

            <div className="flex justify-between items-center text-[9px] text-gray-500 mt-2">
              <span>NIBP AUTO INTERVAL: 15 MINS</span>
              <span>FILTER: DIAGNOSTIC (0.05 - 150 Hz)</span>
            </div>
          </div>

          {/* Vitals Numeric Side Strip (1 Col) */}
          <div className="space-y-3">
            {/* Heart Rate Block */}
            <div className="bg-[#051811] p-4 rounded-2xl border border-emerald-800/40">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] font-black uppercase">HR (ECG)</span>
                <Heart className="w-4 h-4 text-emerald-500 animate-pulse" />
              </div>
              <div className="text-4xl font-black text-emerald-400 mt-1">{heartRate}</div>
              <span className="text-[9px] text-emerald-300/60 block mt-0.5">BPM • LIMITS 50-120</span>
            </div>

            {/* SpO2 Block */}
            <div className="bg-[#031519] p-4 rounded-2xl border border-cyan-800/40">
              <div className="flex items-center justify-between text-cyan-400">
                <span className="text-[10px] font-black uppercase">SpO2 (PLETH)</span>
                <Droplets className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-4xl font-black text-cyan-400 mt-1">{spo2}%</div>
              <span className="text-[9px] text-cyan-300/60 block mt-0.5">PERFUSION INDEX: 4.2%</span>
            </div>

            {/* Blood Pressure Block */}
            <div className="bg-[#171203] p-4 rounded-2xl border border-amber-800/40">
              <div className="flex items-center justify-between text-amber-400">
                <span className="text-[10px] font-black uppercase">NIBP (SYS/DIA)</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {bpSystolic}/{bpDiastolic}
              </div>
              <span className="text-[9px] text-amber-300/60 block mt-0.5">MAP: 92 mmHg</span>
            </div>

            {/* Respiratory Rate Block */}
            <div className="bg-[#051811] p-4 rounded-2xl border border-emerald-800/40">
              <div className="flex items-center justify-between text-emerald-300">
                <span className="text-[10px] font-black uppercase">RESP (IMP)</span>
                <Wind className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-3xl font-black text-emerald-300 mt-1">{respRate}</div>
              <span className="text-[9px] text-emerald-300/60 block mt-0.5">RPM • APNEA DELAY 20s</span>
            </div>
          </div>
        </div>

        {/* Footer Monitor Actions */}
        <div className="p-3 px-6 bg-[#051811] border-t border-emerald-900/40 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Central Telemetry Node Online • 0 dropped packets
          </span>
          <button
            onClick={() => setHeartRate(118)}
            className="px-3 py-1 bg-white/5 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
          >
            Simulate Tachycardia
          </button>
        </div>
      </div>
    </div>
  );
}