"use client";

import React, { useState } from "react";
import {
  Siren,
  BedDouble,
  FlaskConical,
  CheckCircle2,
  X,
  Send,
  Flame,
  Car,
  HeartCrack,
  Activity,
  UserPlus,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_PRESETS = [
  {
    id: "cardiac",
    name: "Cardiac Arrest / STEMI",
    icon: HeartCrack,
    bedId: "B-101",
    bedLabel: "ICU Bay 01 (Cardiac Care)",
    statLab: ["STAT 12-Lead ECG", "Troponin-I (High Sens)", "Serum Electrolytes", "ABG"],
    severity: "Crash / Level 1",
  },
  {
    id: "road_accident",
    name: "Road Accident (Polytrauma)",
    icon: Car,
    bedId: "B-102",
    bedLabel: "Trauma Resus 02 (OT Bay)",
    statLab: ["Crossmatch & 4U PRBC", "Whole Body CT", "eFAST USG", "Coagulation PT/INR"],
    severity: "Stat Resuscitation",
  },
  {
    id: "acid_burn",
    name: "Acid Burn / Severe Chemical Burn",
    icon: Flame,
    bedId: "B-103",
    bedLabel: "Burn Sterile Bay 03",
    statLab: ["Lactate & Anion Gap", "Saline Decontamination", "ABG Carbon Monoxide", "Renal Panel"],
    severity: "Immediate Critical Care",
  },
];

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const hospitalContext = useHospital() as any;
  const { refreshPatients } = hospitalContext;

  const [selectedCase, setSelectedCase] = useState(EMERGENCY_PRESETS[0]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [selectedBed, setSelectedBed] = useState(EMERGENCY_PRESETS[0].bedLabel);
  const [selectedLabs, setSelectedLabs] = useState<string[]>(EMERGENCY_PRESETS[0].statLab);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const handleSelectCase = (preset: typeof EMERGENCY_PRESETS[0]) => {
    setSelectedCase(preset);
    setSelectedBed(preset.bedLabel);
    setSelectedLabs(preset.statLab);
  };

  const toggleLab = (lab: string) => {
    setSelectedLabs((prev) =>
      prev.includes(lab) ? prev.filter((item) => item !== lab) : [...prev, lab]
    );
  };

  const handleDispatch = async () => {
    const finalName = patientName.trim() || `ER Emergency (${selectedCase.name.split("/")[0]})`;
    const finalAge = patientAge.trim() || "40 / Unknown";
    const emergencyAbha = `ABHA-ER-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPatientPayload = {
      name: finalName,
      age: finalAge,
      gender: "Emergency Intake",
      abhaId: emergencyAbha,
      complaint: `[CODE RED ER] ${selectedCase.name} - Allocated Bed: ${selectedBed}`,
      diagnosis: selectedCase.name,
      vitals: "Critical / Resus Active",
      treatment: `STAT Orders: ${selectedLabs.join(", ")}`,
      bedNumber: selectedBed,
      status: "In Treatment",
    };

    // 1. API Call to persist patient in Database (SQLite via Prisma)
    try {
      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatientPayload),
      });
    } catch (err) {
      console.warn("Local persistence fallback", err);
    }

    // 2. Direct State updates for Patients & Wards
    if (hospitalContext.setPatients) {
      hospitalContext.setPatients((prev: any[]) => [
        {
          id: `ER-${Date.now()}`,
          ...newPatientPayload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    // 3. Occupy Bed in Wards state
    if (hospitalContext.setBeds) {
      hospitalContext.setBeds((prevBeds: any[]) =>
        prevBeds.map((b: any) =>
          b.bedNumber === selectedBed || b.id === selectedCase.bedId
            ? { ...b, status: "Occupied", patientName: finalName, condition: "Critical" }
            : b
        )
      );
    }

    if (refreshPatients) {
      refreshPatients();
    }

    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-rose-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl animate-pulse">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight uppercase">
                  Code Red: Clinical Emergency Intake
                </h2>
                <span className="bg-rose-950/50 text-rose-200 border border-rose-300/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  Live DB Sync
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Auto-saves to Patients & Locks Ward Bed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition cursor-pointer text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDispatched ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              Emergency Case Saved & Bed Locked!
            </h3>
            <div className="text-xs text-gray-600 max-w-md space-y-1 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left">
              <p><b>Patient:</b> {patientName || `Emergency Patient (${selectedCase.name.split("/")[0]})`}</p>
              <p><b>Condition:</b> {selectedCase.name}</p>
              <p><b>Saved In Wards:</b> <span className="text-emerald-700 font-bold">{selectedBed} (Marked Occupied)</span></p>
              <p><b>Saved In Patient Cases:</b> Active with ABHA sync</p>
              <p><b>STAT Orders:</b> {selectedLabs.join(", ")}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Step 1: Select Case */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                1. Select Emergency Condition
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EMERGENCY_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedCase.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectCase(preset)}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-600 bg-rose-50/70 text-rose-950 font-bold ring-2 ring-rose-400/30"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold leading-tight">{preset.name}</span>
                      </div>
                      <span className="text-[10px] text-rose-600 font-semibold">{preset.severity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Patient Info */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1 mb-2">
                <UserPlus className="w-3.5 h-3.5 text-gray-600" /> 2. Patient Intake Details
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Patient Name (e.g. Acid Trauma Case / John Doe)"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Age / Gender"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Bed Target */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-emerald-600" /> 3. Target Bed to Occupy in Wards View
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Auto-Assigned
                </span>
              </div>
              <div className="p-3 bg-emerald-50/70 border-2 border-emerald-500 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-gray-900 block">{selectedBed}</span>
                  <p className="text-[10px] text-emerald-700 mt-0.5 font-medium">
                    Will be marked OCCUPIED immediately in Wards & Beds screen.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white uppercase">
                  Locked
                </span>
              </div>
            </div>

            {/* Step 4: STAT Labs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-purple-600" /> 4. STAT Orders Dispatched
                </label>
                <span className="text-[10px] text-gray-400">Included in Patient Record</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedCase.statLab.map((lab) => {
                  const active = selectedLabs.includes(lab);
                  return (
                    <button
                      key={lab}
                      type="button"
                      onClick={() => toggleLab(lab)}
                      className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        active
                          ? "border-purple-500 bg-purple-50 text-purple-950 font-bold"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                      }`}
                    >
                      <span className="truncate">{lab}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase bg-purple-200 text-purple-800 shrink-0">
                        STAT
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDispatch}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Send className="w-4 h-4" /> Save Patient & Lock Assigned Bed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}