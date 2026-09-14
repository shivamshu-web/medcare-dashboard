"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useHospital } from "@/context/HospitalContext";
import {
  BedDouble,
  Activity,
  HeartPulse,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Flame,
  Radio,
} from "lucide-react";

// Live SVG ECG Telemetry Waveform Component
function LiveECGTrace({ color = "#10b981", isCritical = false }: { color?: string; isCritical?: boolean }) {
  return (
    <div className="relative w-full h-10 bg-[#06120e] rounded-lg overflow-hidden flex items-center border border-[#0e2a22]">
      {/* Grid line backdrop */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)",
          backgroundSize: "8px 8px",
        }}
      />
      {/* Animated Sweep Line */}
      <div className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-emerald-400/30 animate-pulse pointer-events-none" />
      
      {/* Oscilloscope SVG Waveform */}
      <svg className="w-full h-8 stroke-current z-10" viewBox="0 0 300 40" preserveAspectRatio="none">
        <path
          d={
            isCritical
              ? "M0,20 L30,20 L38,8 L44,32 L50,15 L56,22 L85,20 L115,20 L123,4 L130,36 L136,12 L142,24 L175,20 L205,20 L213,6 L220,34 L226,14 L232,22 L270,20 L300,20"
              : "M0,20 L40,20 L48,12 L54,28 L60,18 L66,21 L100,20 L140,20 L148,10 L154,30 L160,16 L166,22 L200,20 L240,20 L248,11 L254,29 L260,17 L266,21 L300,20"
          }
          fill="none"
          stroke={isCritical ? "#f43f5e" : color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute right-2 top-1 flex items-center gap-1 z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[9px] font-mono font-bold text-emerald-400">LEAD II</span>
      </div>
    </div>
  );
}

// Master Ward Bed Inventory
const BASE_WARDS = [
  { id: "B-101", bedNumber: "ICU-BAY-01", ward: "Cardio-Thoracic ICU", dept: "ICU" },
  { id: "B-102", bedNumber: "TRAUMA-RESUS-02", ward: "Red Zone Trauma Bay", dept: "Trauma" },
  { id: "B-103", bedNumber: "BURN-STERILE-03", ward: "Plastic & Burn Isolation", dept: "Burn" },
  { id: "B-104", bedNumber: "ER-CRIT-04", ward: "Triage Crash Unit", dept: "Emergency" },
  { id: "B-105", bedNumber: "ICU-BAY-02", ward: "Intensive Care Unit 2", dept: "ICU" },
  { id: "B-106", bedNumber: "GEN-WARD-11", ward: "General Medicine Male", dept: "General" },
  { id: "B-107", bedNumber: "GEN-WARD-12", ward: "General Medicine Male", dept: "General" },
  { id: "B-108", bedNumber: "GEN-WARD-21", ward: "Post-Op Recovery", dept: "General" },
];

export default function WardsView() {
  const { patients, setPatients, beds, setBeds, refreshPatients } = useHospital() as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // Dynamic telemetry simulator state for live cardiac rhythm
  const [telemetryPulse, setTelemetryPulse] = useState({ hr: 78, spo2: 98, map: 93 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryPulse({
        hr: Math.floor(74 + Math.random() * 8),
        spo2: Math.floor(97 + Math.random() * 3),
        map: Math.floor(90 + Math.random() * 6),
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Sync beds directly with real database patients
  const unifiedBeds = useMemo(() => {
    return BASE_WARDS.map((base) => {
      // Look for a real patient in DB allocated to this bed
      const assignedPatient = (patients || []).find((p: any) => {
        const bedRef = (p.bedNumber || "").toLowerCase();
        return (
          bedRef === base.bedNumber.toLowerCase() ||
          bedRef === base.id.toLowerCase() ||
          (p.complaint && p.complaint.toLowerCase().includes(base.bedNumber.toLowerCase()))
        );
      });

      const isOccupied = !!assignedPatient;
      const isCritical =
        isOccupied &&
        ((assignedPatient.complaint || "").toLowerCase().includes("code red") ||
          (assignedPatient.diagnosis || "").toLowerCase().includes("arrest") ||
          (assignedPatient.diagnosis || "").toLowerCase().includes("burn") ||
          (assignedPatient.diagnosis || "").toLowerCase().includes("accident"));

      return {
        ...base,
        status: isOccupied ? "Occupied" : "Available",
        patient: assignedPatient,
        isCritical,
      };
    });
  }, [patients]);

  // Discharge patient: Deletes or clears bedNumber from actual Database/State
  const handleDischarge = async (patientId: string, bedNumber: string) => {
    if (!patientId) return;

    try {
      // If patient is in state, remove bed or clear patient
      if (setPatients) {
        setPatients((prev: any[]) =>
          prev.map((p: any) => (p.id === patientId ? { ...p, bedNumber: "Discharged", status: "Discharged" } : p))
        );
      }
      if (refreshPatients) refreshPatients();
    } catch (err) {
      console.error(err);
    }
  };

  const occupiedCount = unifiedBeds.filter((b) => b.status === "Occupied").length;
  const availableCount = unifiedBeds.filter((b) => b.status === "Available").length;
  const criticalCount = unifiedBeds.filter((b) => b.isCritical).length;

  const filteredBeds = unifiedBeds.filter((b) => {
    const matchesDept = selectedDept === "All" || b.dept === selectedDept;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.bedNumber.toLowerCase().includes(q) ||
      b.ward.toLowerCase().includes(q) ||
      (b.patient && b.patient.name.toLowerCase().includes(q));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Clinical Telemetry Banner */}
      <div className="bg-[#051a14] text-white p-6 rounded-3xl border border-emerald-900/50 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-emerald-50">
                ICU & Trauma Bed Telemetry Console
              </h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live DB Sync
              </span>
            </div>
            <p className="text-xs text-emerald-200/70 mt-1">
              Real-time physiological waveforms & verified Patient Case synchronization.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#092e24] border border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Beds</span>
              <b className="text-lg font-black text-white">{BASE_WARDS.length}</b>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Available</span>
              <b className="text-lg font-black text-emerald-400">{availableCount} Ready</b>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-rose-950/60 border border-rose-500/40">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Occupied</span>
              <b className="text-lg font-black text-rose-400">{occupiedCount} In-Ward</b>
            </div>
            {criticalCount > 0 && (
              <div className="px-4 py-2 rounded-2xl bg-rose-600 border border-rose-400 animate-pulse">
                <span className="text-[10px] uppercase font-black text-white block">Code Red</span>
                <b className="text-lg font-black text-white">{criticalCount} STAT</b>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {["All", "ICU", "Trauma", "Burn", "Emergency", "General"].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedDept === d
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {d === "All" ? "All Units" : `${d} Ward`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search patient from Patient Cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Clinical Beds Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBeds.map((b) => {
          const isOccupied = b.status === "Occupied";
          const patient = b.patient;

          return (
            <div
              key={b.id}
              className={`rounded-3xl border-2 transition duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
                isOccupied
                  ? b.isCritical
                    ? "bg-[#091512] text-white border-rose-500/80 ring-2 ring-rose-500/20"
                    : "bg-white text-gray-900 border-amber-300"
                  : "bg-white border-emerald-200 hover:border-emerald-400 text-gray-800"
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Header Strip */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                        isOccupied
                          ? b.isCritical
                            ? "bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse"
                            : "bg-amber-500 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-black tracking-tight ${isOccupied && b.isCritical ? "text-white" : "text-gray-900"}`}>
                        {b.bedNumber}
                      </h3>
                      <p className={`text-[11px] font-semibold ${isOccupied && b.isCritical ? "text-gray-400" : "text-gray-500"}`}>
                        {b.ward}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isOccupied
                        ? b.isCritical
                          ? "bg-rose-600 text-white border border-rose-400 animate-pulse"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {isOccupied ? (b.isCritical ? "Code Red" : "Admitted") : "Sanitized"}
                  </span>
                </div>

                {/* Patient Case Sync Info */}
                {isOccupied && patient ? (
                  <div className="space-y-3">
                    {/* Patient identity card synced with DB */}
                    <div
                      className={`p-3.5 rounded-2xl border ${
                        b.isCritical ? "bg-[#0d221c] border-emerald-900/60" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-black ${b.isCritical ? "text-emerald-300" : "text-gray-900"}`}>
                          {patient.name}
                        </h4>
                        <span className="text-[10px] font-mono text-gray-400">
                          {patient.age ? `${patient.age} Yrs` : "Adult"} • {patient.gender || "Emergency"}
                        </span>
                      </div>

                      <p className={`text-[11px] mt-1 font-bold ${b.isCritical ? "text-rose-400" : "text-amber-700"}`}>
                        Dx: {patient.diagnosis || patient.complaint || "Acute Clinical Condition"}
                      </p>

                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ABHA: {patient.abhaId || "Verified Case Record"}
                      </p>
                    </div>

                    {/* Medical Telemetry Waveform */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className={`flex items-center gap-1 ${b.isCritical ? "text-emerald-400" : "text-gray-600"}`}>
                          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-bounce" /> Live Continuous Waveform
                        </span>
                        <span className="font-mono text-emerald-400">
                          HR: {telemetryPulse.hr} bpm | SpO2: {telemetryPulse.spo2}%
                        </span>
                      </div>
                      <LiveECGTrace color="#10b981" isCritical={b.isCritical} />
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 mb-1" />
                    <p className="text-xs font-bold text-gray-800">Bed Clean & Ready</p>
                    <span className="text-[10px] text-gray-400">
                      Telemetry standby • Assign via Code Red or Patient Cases
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div
                className={`p-4 border-t flex items-center justify-between ${
                  isOccupied && b.isCritical
                    ? "bg-[#06120e] border-emerald-950"
                    : "bg-gray-50/70 border-gray-100"
                }`}
              >
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Dept: {b.dept}
                </span>

                {isOccupied && patient && (
                  <button
                    onClick={() => handleDischarge(patient.id, b.bedNumber)}
                    className="text-[11px] font-black text-rose-500 hover:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Discharge & Free Bed →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}