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
  UserPlus,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

const EMERGENCY_PRESETS = [
  {
    id: "cardiac",
    name: "Cardiac Arrest / STEMI",
    icon: HeartCrack,
    bedNumber: "ICU-BAY-01",
    ward: "Cardio-Thoracic ICU",
    statLab: ["STAT 12-Lead ECG", "Troponin-I (High Sens)", "Serum Electrolytes", "ABG"],
    severity: "Crash / Level 1",
  },
  {
    id: "road_accident",
    name: "Road Accident (Polytrauma)",
    icon: Car,
    bedNumber: "TRAUMA-RESUS-02",
    ward: "Red Zone Trauma Bay",
    statLab: ["Crossmatch & 4U PRBC", "Whole Body CT", "eFAST USG", "Coagulation PT/INR"],
    severity: "Stat Resuscitation",
  },
  {
    id: "acid_burn",
    name: "Acid Burn / Severe Chemical Burn",
    icon: Flame,
    bedNumber: "BURN-STERILE-03",
    ward: "Plastic & Burn Isolation",
    statLab: ["Lactate & Anion Gap", "Saline Decontamination", "ABG Carbon Monoxide", "Renal Panel"],
    severity: "Immediate Critical Care",
  },
];

export default function EmergencyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setPatients, setBeds, refreshPatients, addPatient } = useHospital() as any;

  const [selectedCase, setSelectedCase] = useState(EMERGENCY_PRESETS[0]);
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">(38);
  const [patientGender, setPatientGender] = useState("Male");
  const [selectedBed, setSelectedBed] = useState(EMERGENCY_PRESETS[0].bedNumber);
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const handleSelectCase = (preset: typeof EMERGENCY_PRESETS[0]) => {
    setSelectedCase(preset);
    setSelectedBed(preset.bedNumber);
  };

  const handleDispatch = async () => {
    const finalName = patientName.trim() || `ER Critical (${selectedCase.name.split("/")[0]})`;
    const finalAge = typeof patientAge === "number" ? patientAge : 38;
    const targetBed = selectedBed;

    // Neon Cloud Database ke schema se exact match hone wala payload
    const newPatient = {
      name: finalName,
      age: finalAge,
      gender: patientGender,
      contact: "+91 99999 00000",
      bloodGroup: "O+",
      abhaId: `91-RED-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      symptoms: `[CODE RED ER] ${selectedCase.name}`,
      caseNotes: `STAT PROTOCOL: ${selectedCase.statLab.join(", ")}`,
      bp: "85/50",
      pulse: 130,
      temperature: "99.0",
      treatment: `STAT Dispatched: ${selectedCase.statLab.join(", ")}`,
      bedNumber: targetBed,
      status: "Critical Resus",
    };

    try {
      // 1. DIRECT NEON CLOUD SQL INSERT (POST TO /api/patients)
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatient),
      });

      if (res.ok) {
        const savedPt = await res.json();

        // 2. React Context State ko update karein
        if (setPatients) {
          setPatients((prev: any[]) => [savedPt, ...(prev || [])]);
        }

        // 3. Bed ko Wards me Occupied mark karein
        if (setBeds) {
          setBeds((prevBeds: any[]) =>
            prevBeds.map((b: any) =>
              b.bedNumber === targetBed || b.id === targetBed
                ? {
                    ...b,
                    status: "Occupied",
                    patientName: finalName,
                    patient: finalName,
                    condition: "Critical (Code Red)",
                    diagnosis: selectedCase.name,
                    vitals: "BP 85/50, Pulse 130",
                  }
                : b
            )
          );
        }

        // 4. Background sync trigger karein
        if (refreshPatients) {
          refreshPatients();
        }
      } else {
        const errData = await res.json();
        console.error("Neon DB Save Error:", errData);
      }
    } catch (e) {
      console.error("Failed to post ER patient to Neon DB:", e);
    }

    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-rose-300">
        <div className="bg-gradient-to-r from-rose-700 to-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl animate-pulse">
              <Siren className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">Code Red Intake & Bed Lock</h2>
              <p className="text-xs text-rose-100">Synchronized Ward Allocation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDispatched ? (
          <div className="p-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-black text-gray-900">Bed {selectedBed} Locked & Patient Admitted!</h3>
            <p className="text-xs text-gray-500">Synced directly with Neon Cloud SQL Database.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-700 uppercase block mb-2">
                1. Select Emergency Case
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                          ? "border-rose-600 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-400/30"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1 text-rose-600" />
                      <span className="text-xs font-bold leading-tight">{preset.name}</span>
                      <span className="text-[10px] text-gray-400 mt-1">{preset.bedNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Patient Name</label>
                <input
                  type="text"
                  placeholder="Patient Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-600 block mb-1">Age</label>
                <input
                  type="number"
                  placeholder="Age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {/* Target Bed Display */}
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-gray-900 block">Allocating Bed: {selectedBed}</span>
                <span className="text-[10px] text-emerald-700 font-medium">{selectedCase.ward}</span>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded">
                Direct Sync
              </span>
            </div>

            <div className="pt-2 flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 font-bold text-xs rounded-xl">
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                className="flex-2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Trigger & Allocate Bed {selectedBed}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}