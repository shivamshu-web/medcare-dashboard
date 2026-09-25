"use client";

import React, { useState, useEffect } from "react";
import {
  Siren,
  CheckCircle2,
  X,
  Send,
  Flame,
  Car,
  HeartCrack,
  Activity,
  ShieldAlert,
  RefreshCw,
  Phone,
  User,
  HeartPulse
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

const EMERGENCY_PRESETS = [
  {
    id: "cardiac",
    name: "Cardiac Arrest / STEMI",
    icon: HeartCrack,
    bedNumber: "ICU-BAY-01",
    ward: "Cardio-Thoracic ICU",
    statLab: ["STAT 12-Lead ECG", "Troponin-I (High Sens)", "ABG Analysis"],
    severity: "Level 1 Stat Resus",
    defaultVitals: { bp: "70/40", pulse: 145, spO2: "84%", temp: "98.4" }
  },
  {
    id: "road_accident",
    name: "Road Accident (Polytrauma)",
    icon: Car,
    bedNumber: "TRAUMA-RESUS-02",
    ward: "Red Zone Trauma Bay",
    statLab: ["Crossmatch 4U PRBC", "Whole Body CT", "eFAST USG"],
    severity: "Immediate Hemorrhage Control",
    defaultVitals: { bp: "85/55", pulse: 132, spO2: "89%", temp: "97.8" }
  },
  {
    id: "acid_burn",
    name: "Severe Burn / Chemical Shock",
    icon: Flame,
    bedNumber: "BURN-STERILE-03",
    ward: "Plastic & Burn Sterile Unit",
    statLab: ["Lactate Panel", "Saline Decontamination", "Renal Profile"],
    severity: "Critical Shock Protocol",
    defaultVitals: { bp: "90/60", pulse: 120, spO2: "94%", temp: "100.2" }
  },
];

// ABDM 14-digit standard format: 91-XXXX-XXXX-XXXX
const generateAbhaId = () => {
  const seg1 = Math.floor(1000 + Math.random() * 9000);
  const seg2 = Math.floor(1000 + Math.random() * 9000);
  const seg3 = Math.floor(1000 + Math.random() * 9000);
  return `91-${seg1}-${seg2}-${seg3}`;
};

export default function EmergencyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setPatients, setBeds, refreshPatients } = useHospital() as any;

  const [selectedCase, setSelectedCase] = useState(EMERGENCY_PRESETS[0]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">(42);
  const [patientGender, setPatientGender] = useState("Male");
  const [contactNumber, setContactNumber] = useState("+91 98765 00000");
  const [bloodGroup, setBloodGroup] = useState("O-");
  const [abhaId, setAbhaId] = useState(generateAbhaId());
  const [selectedBed, setSelectedBed] = useState(EMERGENCY_PRESETS[0].bedNumber);
  
  // Clinical Vitals
  const [bp, setBp] = useState(EMERGENCY_PRESETS[0].defaultVitals.bp);
  const [pulse, setPulse] = useState<number | "">(EMERGENCY_PRESETS[0].defaultVitals.pulse);
  const [spO2, setSpO2] = useState(EMERGENCY_PRESETS[0].defaultVitals.spO2);
  const [temperature, setTemperature] = useState(EMERGENCY_PRESETS[0].defaultVitals.temp);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAbhaId(generateAbhaId());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectCase = (preset: typeof EMERGENCY_PRESETS[0]) => {
    setSelectedCase(preset);
    setSelectedBed(preset.bedNumber);
    setBp(preset.defaultVitals.bp);
    setPulse(preset.defaultVitals.pulse);
    setSpO2(preset.defaultVitals.spO2);
    setTemperature(preset.defaultVitals.temp);
  };

  const handleDispatch = async () => {
    setIsSubmitting(true);

    const finalName = patientName.trim() || `EMERGENCY STAT: ${selectedCase.name.split("/")[0]}`;
    const finalAge = typeof patientAge === "number" ? patientAge : 35;
    const finalPulse = typeof pulse === "number" ? pulse : 130;

    // Prisma Schema Exact Payload for Neon PostgreSQL
    const payload = {
      name: finalName,
      age: finalAge,
      gender: patientGender,
      contact: contactNumber || "+91 98765 00000",
      bloodGroup: bloodGroup,
      abhaId: abhaId || generateAbhaId(),
      complaint: `[STAT RESUS] ${selectedCase.name} - Priority Level 1 Triage`,
      diagnosis: `${selectedCase.name} - Severe Clinical Presentation`,
      treatment: `STAT Dispatched: ${selectedCase.statLab.join(", ")} | Continuous Monitoring`,
      vitals: JSON.stringify({
        bp: bp || "80/50",
        pulse: finalPulse,
        temperature: temperature || "98.6",
        spO2: spO2 || "88%"
      }),
      bp: bp || "80/50",
      pulse: finalPulse,
      temperature: temperature || "98.6",
      bedNumber: selectedBed,
      status: "Critical Resus",
    };

    try {
      // 1. Direct Cloud API call to Neon SQL
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedPt = await res.json();

        // 2. Immediate Context Sync
        if (setPatients) {
          setPatients((prev: any[]) => [savedPt, ...(prev || []).filter((p: any) => p.id !== savedPt.id)]);
        }

        // 3. Mark target Bed Occupied
        if (setBeds) {
          setBeds((prevBeds: any[]) =>
            prevBeds.map((b: any) =>
              b.bedNumber === selectedBed || b.id === selectedBed
                ? {
                    ...b,
                    status: "Occupied",
                    patientName: finalName,
                    condition: "Critical (Code Red)",
                    diagnosis: selectedCase.name,
                  }
                : b
            )
          );
        }

        if (refreshPatients) refreshPatients();

        setIsDispatched(true);
        setTimeout(() => {
          setIsDispatched(false);
          onClose();
        }, 1800);
      } else {
        const err = await res.json();
        alert(`Neon DB Error: ${err.error || "Failed to persist intake"}`);
      }
    } catch (e: any) {
      console.error("Neon Insert Failed:", e);
      alert("Failed to communicate with Neon Database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-rose-300 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl animate-pulse ring-2 ring-white/30">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black uppercase tracking-wide">Code Red Emergency Intake</h2>
                <span className="text-[10px] font-black uppercase bg-white text-rose-700 px-2 py-0.5 rounded-full shadow-xs">
                  Neon DB Sync
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">ABDM-Compliant Emergency State Registration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/90">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDispatched ? (
          <div className="p-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-gray-900">Bed {selectedBed} Locked & Registered!</h3>
            <p className="text-xs text-gray-500">Record successfully written to Neon Cloud PostgreSQL Database.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* 1. ABHA ID Section */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-900">
                    ABHA Health ID (Mandatory)
                  </span>
                </div>
                <input
                  type="text"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  className="font-mono text-sm font-bold text-gray-900 bg-transparent outline-none w-64 tracking-wider"
                  placeholder="91-XXXX-XXXX-XXXX"
                />
              </div>
              <button
                type="button"
                onClick={() => setAbhaId(generateAbhaId())}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold text-rose-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Generate
              </button>
            </div>

            {/* 2. Emergency Case Presets */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide block mb-2">
                Emergency Triage Condition
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {EMERGENCY_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedCase.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectCase(preset)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400/20"
                          : "border-gray-200 bg-white hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1.5 text-rose-600" />
                      <span className="text-xs font-bold leading-tight block">{preset.name}</span>
                      <span className="text-[10px] text-gray-400 mt-1 block">{preset.bedNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Patient Demographics Form */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
                Patient Demographics
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Full Name / Unknown Tag</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. John Doe (Trauma Unknown)"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-rose-700"
                  >
                    {["O-", "O+", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">Emergency Contact</label>
                  <div className="relative">
                    <Phone className="w-3 h-3 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full pl-7 pr-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Critical Vitals */}
            <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
              <span className="text-[10px] font-black uppercase text-red-600 tracking-wider block mb-2 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" /> Initial Stat Vitals
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">BP (mmHg)</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Pulse (BPM)</label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">SpO2 (%)</label>
                  <input
                    type="text"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase block mb-0.5">Temp (°F)</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-bold text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* 5. Target Bed Allocation Banner */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-gray-900 block">Bed Reserved: {selectedBed}</span>
                <span className="text-[10px] text-emerald-700 font-semibold">{selectedCase.ward}</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2.5 py-1 rounded-md shadow-xs">
                PostgreSQL Ready
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 font-bold text-xs rounded-xl text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDispatch}
                className="flex-2 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Persisting to Neon..." : `Trigger & Lock Bed ${selectedBed}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}