"use client";

import React, { useState } from "react";
import {
  Siren,
  AlertTriangle,
  BedDouble,
  FlaskConical,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  Activity,
  HeartPulse,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { beds, bloodStock } = useHospital();

  const [triageLevel, setTriageLevel] = useState<"Red" | "Orange" | "Yellow">("Red");
  const [patientSummary, setPatientSummary] = useState("Unknown Trauma / Acute Hypotension");
  const [selectedBed, setSelectedBed] = useState("ER-RESUS-01");
  const [statOrders, setStatOrders] = useState({
    abg: true,
    troponin: true,
    crossmatch: true,
    ctTrauma: false,
    focusedEcho: true,
  });

  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen) return null;

  const toggleOrder = (key: keyof typeof statOrders) => {
    setStatOrders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const availableErBeds = beds?.filter((b) => b.status === "Available") || [
    { id: "ER-RESUS-01", ward: "Emergency Trauma Resus", bedNumber: "Bed 01" },
    { id: "ER-CRIT-04", ward: "Emergency ICU Bay", bedNumber: "Bed 04" },
  ];

  const handleTriggerDispatch = () => {
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-rose-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl animate-pulse">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight uppercase">
                  Code Red Emergency Dispatch
                </h2>
                <span className="bg-white/25 text-white px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                  Level 1 Trauma
                </span>
              </div>
              <p className="text-xs text-rose-100">
                Instant ER Bed Reserve & Automated STAT Diagnostics Order
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
              Emergency Workflow Dispatched!
            </h3>
            <p className="text-xs text-gray-500 max-w-md">
              Bed <b className="text-gray-900">{selectedBed}</b> reserved immediately. STAT Lab orders routed to Central Pathology & Crossmatch initiated.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Step 1: Patient Triage & Vitals Quick Banner */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Patient Presentation / Triage Category
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { level: "Red", label: "Crash / Arrest / MAP < 60", color: "border-rose-500 bg-rose-50 text-rose-800" },
                  { level: "Orange", label: "Severe Trauma / Sepsis", color: "border-amber-500 bg-amber-50 text-amber-800" },
                  { level: "Yellow", label: "Urgent Observation", color: "border-yellow-500 bg-yellow-50 text-yellow-800" },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setTriageLevel(item.level as any)}
                    className={`p-2.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                      triageLevel === item.level
                        ? `${item.color} shadow-xs font-black ring-2 ring-rose-400/40`
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xs block font-bold">Priority: {item.level}</span>
                    <span className="text-[10px] opacity-80">{item.label}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={patientSummary}
                onChange={(e) => setPatientSummary(e.target.value)}
                placeholder="Trauma / Acute Symptoms description..."
                className="w-full mt-2.5 px-3.5 py-2 border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            {/* Step 2: Instant ER Bed Allocation */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <BedDouble className="w-4 h-4 text-emerald-600" /> Direct ER Bed Reservation
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableErBeds.slice(0, 4).map((b: any) => {
                  const isSelected = selectedBed === b.id || selectedBed === b.bedNumber;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBed(b.id || b.bedNumber)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/60 shadow-xs"
                          : "border-gray-200 bg-white hover:border-emerald-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-gray-900">
                            {b.bedNumber || b.id}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                            Equipped
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {b.ward || "Trauma Stabilization Bay"}
                        </p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: STAT Diagnostics & Blood Reserve Dispatch */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-purple-600" /> Automated STAT Lab & Diagnostic Orders
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  Pathology Express Queue
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: "abg", label: "Arterial Blood Gas (ABG)", stat: "10 mins" },
                  { key: "troponin", label: "STAT Troponin-I / ECG", stat: "15 mins" },
                  { key: "crossmatch", label: "Crossmatch & 2U PRBC", stat: "Immediate" },
                  { key: "focusedEcho", label: "eFAST / Point-of-Care US", stat: "Bedside" },
                  { key: "ctTrauma", label: "Whole Body STAT CT", stat: "On-Call" },
                ].map((test) => {
                  const active = statOrders[test.key as keyof typeof statOrders];
                  return (
                    <button
                      key={test.key}
                      type="button"
                      onClick={() => toggleOrder(test.key as keyof typeof statOrders)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        active
                          ? "border-purple-500 bg-purple-50/70 text-purple-950 font-bold"
                          : "border-gray-200 bg-gray-50/50 text-gray-500"
                      }`}
                    >
                      <span className="text-[11px] block">{test.label}</span>
                      <span className="text-[9px] text-purple-700 font-semibold mt-1">
                        Turnaround: {test.stat}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
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
                onClick={handleTriggerDispatch}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Send className="w-4 h-4" /> Trigger CODE RED Protocol & Lock Bed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}