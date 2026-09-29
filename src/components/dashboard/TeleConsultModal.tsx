"use client";

import React, { useState, useEffect } from "react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Share2,
  FileText,
  User,
  Activity,
  CheckCircle2,
  Plus,
  Send,
  Sparkles,
  ShieldCheck,
  Signal,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface TeleConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
}

export default function TeleConsultModal({
  isOpen,
  onClose,
  patientName,
}: TeleConsultModalProps) {
  const { patients } = useHospital() as any;

  // Media Controls States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [rxNotes, setRxNotes] = useState("");
  const [prescribedMeds, setPrescribedMeds] = useState([
    "Tab. Paracetamol 650mg - 1 TID (After Food)",
    "Syp. Ambroxol 15ml - BD x 5 Days",
  ]);
  const [newMed, setNewMed] = useState("");

  // Target Patient
  const activePt =
    (patients || []).find((p: any) => p.name === patientName) ||
    patients?.[0] || {
      name: patientName || "Aarav Sharma",
      age: 29,
      gender: "Male",
      symptoms: "Mild fever, throat irritation, dry cough",
      bedNumber: "OPD-Tele",
    };

  // Live Timer
  useEffect(() => {
    let timer: any;
    if (isOpen) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.trim()) return;
    setPrescribedMeds([...prescribedMeds, newMed.trim()]);
    setNewMed("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-[#0f1715] w-full max-w-6xl rounded-3xl border border-emerald-950/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#0a1210] border-b border-emerald-950/80 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Video className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-100">
                  eSanjeevani Tele-Consult Room • {activePt.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                  ENCRYPTED WebRTC
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Patient Age: {activePt.age || 30}Y • Gender: {activePt.gender || "M"} • Token: TELE-902
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-emerald-400 font-bold">{formatTime(callDuration)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Signal className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px]">1080p HD</span>
            </div>
          </div>
        </div>

        {/* Center Main Stage (Video + Side Clinical Pad) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          
          {/* Left 2 Cols: Video Stream Area */}
          <div className="lg:col-span-2 relative bg-black flex items-center justify-center min-h-[420px] p-4 select-none">
            
            {/* Patient Remote Video Feed */}
            {isVideoOn ? (
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80"
                  alt="Patient Video"
                  className="w-full h-full object-cover max-h-[500px]"
                />
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-2 border border-white/10">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activePt.name} (Remote Feed)</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl bg-gray-950 border border-white/5 flex flex-col items-center justify-center text-gray-500 gap-2">
                <VideoOff className="w-12 h-12 text-gray-600" />
                <span className="text-xs">Camera is turned off</span>
              </div>
            )}

            {/* Doctor Self-View PiP (Picture-in-Picture) */}
            <div className="absolute top-8 right-8 w-36 h-28 rounded-2xl bg-gray-800 border-2 border-emerald-500/50 overflow-hidden shadow-2xl z-20">
              <img
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80"
                alt="Dr. Morgan Self View"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                Dr. Morgan (You)
              </div>
            </div>

            {/* Live Call Control Floating Dock */}
            <div className="absolute bottom-8 inset-x-0 flex items-center justify-center gap-3 z-30">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3.5 rounded-2xl transition cursor-pointer shadow-lg backdrop-blur-md ${
                  isMicOn
                    ? "bg-white/15 hover:bg-white/25 text-white"
                    : "bg-rose-600 text-white hover:bg-rose-700"
                }`}
                title="Toggle Mic"
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3.5 rounded-2xl transition cursor-pointer shadow-lg backdrop-blur-md ${
                  isVideoOn
                    ? "bg-white/15 hover:bg-white/25 text-white"
                    : "bg-rose-600 text-white hover:bg-rose-700"
                }`}
                title="Toggle Camera"
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={onClose}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-900/40 transition hover:scale-105 active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            </div>
          </div>

          {/* Right Col: Instant In-Call Clinical Prescription Desk */}
          <div className="bg-[#121c19] border-l border-emerald-950/80 p-5 flex flex-col justify-between overflow-y-auto text-white space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-bold text-gray-200">Live e-Prescription Pad</h4>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Rx Digital Sign
                </span>
              </div>

              {/* Patient Intake Chief Complaint */}
              <div className="mt-3 p-3 bg-white/5 rounded-2xl border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Chief Complaint
                </span>
                <p className="text-emerald-300 font-medium">
                  {activePt.symptoms || "Follow-up consultation for respiratory symptoms"}
                </p>
              </div>

              {/* Prescribed Medications Queue */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Prescribed Medicines ({prescribedMeds.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {prescribedMeds.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-200 text-[11px] font-mono">{med}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Add Quick Medicine Form */}
                <form onSubmit={handleAddMed} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="e.g. Tab Azithromycin 500mg OD"
                    value={newMed}
                    onChange={(e) => setNewMed(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition cursor-pointer"
                    title="Add to Rx"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Consultation Summary Notes */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Consultation Impressions
                </span>
                <textarea
                  rows={3}
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  placeholder="Type clinical observation notes here..."
                  className="w-full p-2.5 bg-black/40 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500 placeholder:text-gray-600 resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  alert(`e-Prescription successfully signed and sent to patient's ABHA Portal.`);
                  onClose();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save & Issue Digital Rx to ABHA</span>
              </button>
              <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>NHA Gateway: Connected</span>
                <span>Latency: 18ms</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}