"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Mic,
  MicOff,
  Stethoscope,
  Activity,
  Save,
  Languages,
  CheckCircle2,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface CaseTakingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CaseTakingModal({ isOpen, onClose }: CaseTakingModalProps) {
  const { addPatient } = useHospital();

  // Basic Form Fields
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [abhaId, setAbhaId] = useState("");

  // Clinical Vitals
  const [bpSystolic, setBpSystolic] = useState("120");
  const [bpDiastolic, setBpDiastolic] = useState("80");
  const [pulse, setPulse] = useState("72");
  const [temperature, setTemperature] = useState("98.6");
  const [spO2, setSpO2] = useState("98");

  // Clinical Complaints & Case Notes
  const [symptoms, setSymptoms] = useState("");
  const [caseNotes, setCaseNotes] = useState("");

  // Success Notification State
  const [showSuccess, setShowSuccess] = useState(false);

  // Speech-to-Text Setup
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<"en-IN" | "hi-IN">("en-IN");
  const [speechTarget, setSpeechTarget] = useState<"symptoms" | "caseNotes">("symptoms");

  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let accumulatedFinal = "";
          let interimText = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              accumulatedFinal += transcript + " ";
            } else {
              interimText += transcript;
            }
          }

          if (accumulatedFinal) {
            baseTextRef.current = (baseTextRef.current + " " + accumulatedFinal)
              .replace(/\s+/g, " ")
              .trim();
          }

          const displayText = (baseTextRef.current + (interimText ? " " + interimText : ""))
            .replace(/\s+/g, " ")
            .trim();

          if (speechTarget === "symptoms") {
            setSymptoms(displayText);
          } else {
            setCaseNotes(displayText);
          }
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [speechTarget]);

  const toggleSpeechRecognition = (targetField: "symptoms" | "caseNotes") => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    if (isListening && speechTarget === targetField) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (isListening) recognitionRef.current.stop();

    setSpeechTarget(targetField);
    baseTextRef.current = targetField === "symptoms" ? symptoms : caseNotes;
    recognitionRef.current.lang = speechLanguage;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleGenerateAbha = () => {
    const r = () => Math.floor(1000 + Math.random() * 9000);
    setAbhaId(`91-${r()}-${r()}-${r()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert("Please enter patient name.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const uniqueId = `PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPatient = {
      id: uniqueId,
      name: patientName.trim(),
      age: Number(age) || 35,
      gender: gender || "Male",
      abhaId:
        abhaId.trim() ||
        `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}-${Math.floor(1000 + Math.random() * 9000)}`,
      bp: `${bpSystolic}/${bpDiastolic}`,
      pulse: Number(pulse) || 72,
      temperature: String(temperature || "98.6"),
      symptoms: symptoms.trim() || "Routine General Health Consultation",
      caseNotes:
        caseNotes.trim() ||
        "Vitals within normal baseline. Scheduled follow-up in 10 days.",
      createdAt: new Date().toISOString(),
    };

    // Save to Context
    await addPatient(newPatient);

    // Show "Saved Successfully" Banner
    setShowSuccess(true);

    // 1.2s baad close modal
    setTimeout(() => {
      setShowSuccess(false);
      setPatientName("");
      setAge("");
      setAbhaId("");
      setSymptoms("");
      setCaseNotes("");
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100 my-6 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Saved Successfully Floating Toast */}
        {showSuccess && (
          <div className="absolute inset-x-6 top-6 z-20 p-4 bg-[#072a22] text-emerald-300 border border-emerald-400/30 rounded-2xl flex items-center justify-center gap-2.5 shadow-xl animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-black text-sm">
              Saved Successfully! Case Added to Clinical Records.
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#072a22] text-emerald-400 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-800">
                Patient Case Intake (OPD Triage)
              </h3>
              <p className="text-[11px] text-gray-400">
                Voice-to-Text Clinical Scribe • NHA ABHA M1 Registration
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isListening && recognitionRef.current) recognitionRef.current.stop();
              onClose();
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 px-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-emerald-900">Voice Input Language:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-emerald-200">
            <button
              type="button"
              onClick={() => setSpeechLanguage("en-IN")}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                speechLanguage === "en-IN" ? "bg-[#072a22] text-white" : "text-gray-600"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setSpeechLanguage("hi-IN")}
              className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                speechLanguage === "hi-IN" ? "bg-[#072a22] text-white" : "text-gray-600"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Live Voice Indicator */}
        {isListening && (
          <div className="p-3 bg-[#072a22] text-emerald-300 rounded-2xl flex items-center justify-between text-xs animate-pulse">
            <span className="font-bold">
              Recording voice for {speechTarget === "symptoms" ? "Symptoms" : "Doctor Notes"}...
            </span>
            <button
              type="button"
              onClick={() => {
                if (recognitionRef.current) recognitionRef.current.stop();
                setIsListening(false);
              }}
              className="px-2 py-1 bg-rose-600 text-white font-bold rounded-lg text-[10px] cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Age & Gender
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-1/2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-1/2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  ABHA ID
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAbha}
                  className="text-[10px] font-bold text-emerald-700 cursor-pointer"
                >
                  Generate
                </button>
              </div>
              <input
                type="text"
                placeholder="91-XXXX-XXXX-XXXX"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          {/* Vitals */}
          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
            <span className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" /> Patient Vitals
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[9px] font-bold text-gray-400 block">BP</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full p-1.5 bg-white border border-gray-200 rounded text-center font-bold"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full p-1.5 bg-white border border-gray-200 rounded text-center font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 block">Pulse (BPM)</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full p-1.5 bg-white border border-gray-200 rounded text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 block">Temp (°F)</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full p-1.5 bg-white border border-gray-200 rounded text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 block">SpO2 (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(e.target.value)}
                  className="w-full p-1.5 bg-white border border-gray-200 rounded text-center font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Chief Symptoms */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Chief Symptoms
              </label>
              <button
                type="button"
                onClick={() => toggleSpeechRecognition("symptoms")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer ${
                  isListening && speechTarget === "symptoms"
                    ? "bg-rose-600 text-white"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {isListening && speechTarget === "symptoms" ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>Voice Input</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. High fever for 3 days, cough..."
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                baseTextRef.current = e.target.value;
              }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
            />
          </div>

          {/* Doctor Case Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                Doctor Case Notes
              </label>
              <button
                type="button"
                onClick={() => toggleSpeechRecognition("caseNotes")}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer ${
                  isListening && speechTarget === "caseNotes"
                    ? "bg-rose-600 text-white"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                }`}
              >
                {isListening && speechTarget === "caseNotes" ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                <span>Voice Input</span>
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="e.g. Prescribed Paracetamol 650mg TDS, advise rest..."
              value={caseNotes}
              onChange={(e) => {
                setCaseNotes(e.target.value);
                baseTextRef.current = e.target.value;
              }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={showSuccess}
              className="flex-1 py-2.5 bg-[#072a22] hover:bg-[#0c382e] text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Save & Register Patient</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}