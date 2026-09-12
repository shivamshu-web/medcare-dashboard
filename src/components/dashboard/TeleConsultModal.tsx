"use client";

import React, { useState, useEffect } from "react";
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  User,
  ShieldCheck,
  FileSignature,
  Clock,
  X,
} from "lucide-react";
import { useHospital } from "../../context/HospitalContext";

interface TeleConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TeleConsultModal({ isOpen, onClose }: TeleConsultModalProps) {
  const { patients } = useHospital();
  const [selectedPatient, setSelectedPatient] = useState(patients[0]?.name || "Sunita Devi");
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleEndCall = () => {
    setCallActive(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#04130e] text-white w-full max-w-2xl rounded-3xl border border-emerald-900/60 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 px-6 bg-[#072a22] border-b border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-400/20 text-emerald-300 rounded-xl">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ABDM Tele-Consultation Studio</h3>
              <p className="text-[10px] text-emerald-300/80">End-to-End Encrypted eSanjeevani Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Call Room */}
        <div className="p-6 space-y-6">
          {!callActive ? (
            <div className="bg-[#020906] p-8 rounded-2xl border border-emerald-950 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-pulse">
                <PhoneCall className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Initiate Remote Consult</h4>
                <p className="text-xs text-gray-400 mt-1">Select patient from queue to connect voice/video stream:</p>
              </div>

              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full max-w-sm mx-auto p-2.5 text-xs bg-[#072a22] border border-emerald-800/80 rounded-xl font-semibold text-emerald-200 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} (ABHA: {p.abhaId ? p.abhaId.slice(-4) : "OPD"})
                  </option>
                ))}
              </select>

              <button
                onClick={() => setCallActive(true)}
                className="w-full max-w-sm mx-auto py-3 bg-emerald-500 hover:bg-emerald-400 text-[#072a22] font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <PhoneCall className="w-4 h-4" /> Start Tele-Consult Call
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Call Box */}
              <div className="relative bg-[#020906] h-64 rounded-2xl border border-emerald-900/60 overflow-hidden flex items-center justify-center">
                {isVideoOff ? (
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-[#072a22] text-emerald-400 mx-auto flex items-center justify-center font-bold text-xl border border-emerald-700">
                      {selectedPatient.charAt(0)}
                    </div>
                    <h4 className="text-sm font-bold text-white">{selectedPatient}</h4>
                    <span className="text-[10px] text-emerald-400 font-mono">Audio Stream Connected</span>
                  </div>
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                    alt="Patient Stream"
                    className="w-full h-full object-cover opacity-85"
                  />
                )}

                {/* Floating Call Info */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-xl text-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold">{selectedPatient}</span>
                  <span className="font-mono text-emerald-400">({formatTimer(callSeconds)})</span>
                </div>
              </div>

              {/* In-Call Controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer ${
                    isMuted ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-emerald-300"
                  }`}
                  title={isMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3.5 rounded-2xl transition cursor-pointer ${
                    isVideoOff ? "bg-rose-600 text-white" : "bg-white/10 hover:bg-white/20 text-emerald-300"
                  }`}
                  title={isVideoOff ? "Enable Video" : "Disable Video"}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
                >
                  <PhoneOff className="w-5 h-5" /> End Call
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}