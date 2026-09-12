"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  Calendar,
  Pill,
  Heart,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  Bell,
  Sun,
  Moon,
  Sparkles,
  QrCode,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

export default function PatientPortalView() {
  const { patients, labQueue } = useHospital();

  // Active patient selected for demo
  const [selectedPtId, setSelectedPtId] = useState<string>(patients[0]?.id || "");
  const currentPatient = patients.find((p) => p.id === selectedPtId) || patients[0];

  // Interactive pill schedule state
  const [schedule, setSchedule] = useState([
    {
      id: "slot-1",
      time: "Morning (8:00 AM)",
      icon: Sun,
      color: "text-amber-500 bg-amber-50 border-amber-200",
      meds: [
        { id: "m1", name: "Dolo 650mg", dose: "1 Tablet", instruction: "Take after breakfast", taken: true },
        { id: "m2", name: "Augmentin 625 Duo", dose: "1 Tablet", instruction: "Take with warm water", taken: true },
      ],
    },
    {
      id: "slot-2",
      time: "Afternoon (1:30 PM)",
      icon: Sun,
      color: "text-orange-500 bg-orange-50 border-orange-200",
      meds: [
        { id: "m3", name: "Electral ORS Solution", dose: "200 ml", instruction: "Post lunch hydration", taken: false },
      ],
    },
    {
      id: "slot-3",
      time: "Night (9:00 PM)",
      icon: Moon,
      color: "text-indigo-500 bg-indigo-50 border-indigo-200",
      meds: [
        { id: "m4", name: "Augmentin 625 Duo", dose: "1 Tablet", instruction: "Take after dinner", taken: false },
        { id: "m5", name: "Pan 40mg (if acid reflux)", dose: "1 Tablet", instruction: "Before sleep", taken: false },
      ],
    },
  ]);

  const toggleMedTaken = (slotId: string, medId: string) => {
    setSchedule((prev) =>
      prev.map((slot) => {
        if (slot.id !== slotId) return slot;
        return {
          ...slot,
          meds: slot.meds.map((m) =>
            m.id === medId ? { ...m, taken: !m.taken } : m
          ),
        };
      })
    );
  };

  if (!currentPatient) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-gray-200">
        <p className="text-sm text-gray-500">No patient records available in the hospital database.</p>
      </div>
    );
  }

  // Calculate adherence percentage
  const allMeds = schedule.flatMap((s) => s.meds);
  const takenCount = allMeds.filter((m) => m.taken).length;
  const adherenceRate = Math.round((takenCount / allMeds.length) * 100);

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar with Patient Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#072a22] to-[#0e483b] text-white p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Ayushman Bharat Digital Mission (ABDM) PHR
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Namaste, {currentPatient.name} 🙏
          </h2>
          <p className="text-xs text-emerald-100/80">
            Manage your personal health record, active prescriptions, and diagnostic tokens.
          </p>
        </div>

        {/* Demo Switcher for different patients */}
        <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-xs border border-white/20">
          <span className="text-[10px] text-emerald-200 block mb-1 font-semibold">Active Patient Profile:</span>
          <select
            value={selectedPtId}
            onChange={(e) => setSelectedPtId(e.target.value)}
            className="text-xs font-bold bg-white text-gray-800 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.abhaId ? p.abhaId.slice(-4) : "OPD"})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Official ABHA Digital Health Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0c382e] via-[#072a22] to-[#041a15] text-white p-6 rounded-3xl shadow-lg border border-emerald-500/30 relative overflow-hidden">
            {/* Background Emblem Watermark */}
            <div className="absolute -right-8 -bottom-8 opacity-10 text-white pointer-events-none">
              <QrCode className="w-48 h-48" />
            </div>

            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center font-black text-xs text-emerald-300">
                  AB
                </div>
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase">ABHA Smart Health Card</h4>
                  <p className="text-[8px] text-emerald-300/70">National Health Authority • Govt. of India</p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-300 border border-emerald-400/30 font-bold">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-emerald-300/80 font-semibold block">
                  Card Holder Name
                </span>
                <h3 className="text-base font-black tracking-wide">{currentPatient.name}</h3>
              </div>

              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-emerald-300/80 font-semibold block">
                    ABHA Number
                  </span>
                  <span className="font-mono font-bold text-emerald-200">
                    {currentPatient.abhaId || "91-8842-1092-4411"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-300/80 font-semibold block">
                    Demographics
                  </span>
                  <span className="font-semibold text-white">
                    {currentPatient.age} Yrs • {currentPatient.gender}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Code */}
              <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between">
                <div className="bg-white p-1.5 rounded-xl shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=abha:${currentPatient.abhaId || currentPatient.id}`}
                    alt="ABHA QR Code"
                    className="w-14 h-14 rounded-md"
                  />
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[8px] text-emerald-300/80 block font-mono">
                    HFR Facility: MEDCARE-DL-01
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-[#072a22] font-black text-[10px] rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer ml-auto"
                  >
                    <Download className="w-3 h-3" /> Download Card
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Summary Card */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" /> Recorded Baseline Vitals
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block">BP</span>
                <span className="text-xs font-black text-gray-800">{currentPatient.bp || "120/80"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block">Pulse</span>
                <span className="text-xs font-black text-emerald-700">{currentPatient.pulse || "72"} BPM</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-[10px] text-gray-400 font-semibold block">Temp</span>
                <span className="text-xs font-black text-amber-700">{currentPatient.temperature || "98.6"} °F</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right: Daily Medicine Schedule + Diagnostic Slips */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Medication Reminder Timeline */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" /> My Daily Pill Timetable & Reminders
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Synchronized with your doctor's electronic prescription
                </p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                Today's Adherence: {adherenceRate}%
              </span>
            </div>

            <div className="space-y-4">
              {schedule.map((slot) => {
                const SlotIcon = slot.icon;
                return (
                  <div key={slot.id} className="p-4 rounded-2xl bg-gray-50/70 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${slot.color}`}>
                        <SlotIcon className="w-3.5 h-3.5" /> {slot.time}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {slot.meds.map((m) => (
                        <div
                          key={m.id}
                          className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-xs text-gray-800">{m.name}</span>
                            <span className="text-[11px] text-gray-400 ml-2">({m.dose})</span>
                            <p className="text-[10px] text-gray-500 mt-0.5">{m.instruction}</p>
                          </div>

                          <button
                            onClick={() => toggleMedTaken(slot.id, m.id)}
                            className={`px-3 py-1 rounded-xl text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                              m.taken
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-[#072a22] text-white hover:bg-[#0c382e]"
                            }`}
                          >
                            {m.taken ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Taken
                              </>
                            ) : (
                              "Mark Taken"
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Access: Lab Reports & Clinical Records */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> My Diagnostic Slips & Reports
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {labQueue.slice(0, 2).map((lab) => (
                <div
                  key={lab.token}
                  className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">{lab.test}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Token: <span className="font-mono text-emerald-800 font-semibold">{lab.token}</span> • TAT: {lab.tat}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                        lab.status === "Analysis Complete"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {lab.status}
                    </span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-700 transition cursor-pointer"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}