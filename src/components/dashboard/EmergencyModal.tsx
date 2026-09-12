"use client";

import React, { useState } from "react";
import { Siren, AlertOctagon, HeartCrack, Activity, Zap, X, ShieldAlert } from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { triggerEmergencyTriage } = useHospital();

  const [traumaCategory, setTraumaCategory] = useState("Polytrauma / Road Accident");
  const [priority, setPriority] = useState<"RED" | "YELLOW">("RED");
  const [age, setAge] = useState(28);
  const [gender, setGender] = useState("Male");
  const [notes, setNotes] = useState("Unresponsive, GCS 8/15. Active hemorrhage noted.");

  if (!isOpen) return null;

  const traumaPresets = [
    "Polytrauma / Road Accident",
    "Acute STEMI (Cardiac Arrest)",
    "Acute Stroke / Seizure",
    "Severe Burn / Acid Trauma",
    "Anaphylaxis / Respiratory Failure",
  ];

  const handleActivateRedCode = () => {
    triggerEmergencyTriage(traumaCategory, Number(age) || 30, gender, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-rose-600 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Urgent Red Emergency Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl animate-bounce">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide uppercase">
                  Level-1 Trauma & Emergency Triage
                </h3>
                <span className="bg-white text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                  CODE RED
                </span>
              </div>
              <p className="text-[11px] text-rose-100 font-medium mt-0.5">
                Immediate clinical bypass • Auto-assigns ER Bed & STAT Labs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-rose-200 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Triage Form */}
        <div className="p-6 space-y-5">
          
          {/* Priority Matrix Badge Selector */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">
              TRIAGE ACUITY INDEX (ATS LEVEL)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPriority("RED")}
                className={`p-3 rounded-2xl border-2 text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                  priority === "RED"
                    ? "border-rose-600 bg-rose-50 text-rose-800 shadow-sm"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <div>
                  <span className="block text-xs uppercase">Priority RED (Resuscitation)</span>
                  <span className="text-[10px] font-normal text-rose-700">Immediate threat to life</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPriority("YELLOW")}
                className={`p-3 rounded-2xl border-2 text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                  priority === "YELLOW"
                    ? "border-amber-500 bg-amber-50 text-amber-800 shadow-sm"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div>
                  <span className="block text-xs uppercase">Priority YELLOW (Emergent)</span>
                  <span className="text-[10px] font-normal text-amber-700">Assessment &lt; 10 mins</span>
                </div>
              </button>
            </div>
          </div>

          {/* Trauma Condition Presets */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              PRIMARY CLINICAL PRESENTATION
            </label>
            <div className="flex flex-wrap gap-2">
              {traumaPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTraumaCategory(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    traumaCategory === preset
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Demographics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Estimated Age (Years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-600 font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                Patient Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-600 font-bold"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          {/* Immediate Findings / GCS notes */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">
              Initial Resuscitation Notes (GCS / Airway Status)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bilateral chest trauma, Intubation in progress..."
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Immediate Action Button */}
          <button
            onClick={handleActivateRedCode}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            ACTIVATE CODE RED & DISPATCH EMERGENCY RESPONSE
          </button>
        </div>

      </div>
    </div>
  );
}