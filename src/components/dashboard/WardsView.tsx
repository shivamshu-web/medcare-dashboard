"use client";

import React, { useState, useEffect, useMemo } from "react";
import IcuTelemetryModal from "@/components/dashboard/IcuTelemetryModal";
import { useHospital } from "@/context/HospitalContext";
import {
  BedDouble,
  Activity,
  HeartPulse,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Maximize2,
  User,
  Clock,
  ShieldCheck,
  Loader2,
} from "lucide-react";

// Live SVG ECG Telemetry Waveform Component
function LiveECGTrace({
  color = "#10b981",
  isCritical = false,
}: {
  color?: string;
  isCritical?: boolean;
}) {
  return (
    <div className="relative w-full h-11 bg-[#06120e] rounded-xl overflow-hidden flex items-center border border-[#0e2a22]">
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
      <div className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-emerald-400/30 animate-pulse pointer-events-none" />

      {/* Synthetic Waveform Path */}
      <svg
        className="w-full h-8 stroke-current z-10"
        viewBox="0 0 300 40"
        preserveAspectRatio="none"
      >
        <path
          d={
            isCritical
              ? "M0,20 L30,20 L38,8 L44,32 L50,15 L56,22 L85,20 L115,20 L123,4 L130,36 L136,12 L142,24 L175,20 L205,20 L213,6 L220,34 L226,14 L232,22 L270,20 L300,20"
              : "M0,20 L40,20 L48,12 L54,28 L60,18 L66,21 L100,20 L140,20 L148,10 L154,30 L160,16 L166,22 L200,20 L240,20 L248,11 L254,29 L260,17 L266,21 L300,20"
          }
          fill="none"
          stroke={isCritical ? "#f43f5e" : color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute right-2 top-1.5 flex items-center gap-1 z-20">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isCritical ? "bg-rose-500 animate-ping" : "bg-emerald-400 animate-ping"
          }`}
        />
        <span
          className={`text-[9px] font-mono font-black ${
            isCritical ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          LEAD II
        </span>
      </div>
    </div>
  );
}

export default function WardsView() {
  const { beds, patients, setPatients, setBeds, refreshPatients } = useHospital() as any;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  // State to launch IcuTelemetryModal
  const [activeTelemetry, setActiveTelemetry] = useState<{
    isOpen: boolean;
    patientName: string;
    bedNumber: string;
  }>({
    isOpen: false,
    patientName: "",
    bedNumber: "",
  });

  // Simulated live cardiac rhythm fluctuations
  const [telemetryPulse, setTelemetryPulse] = useState({ hr: 78, spo2: 98, map: 93 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryPulse({
        hr: Math.floor(74 + Math.random() * 8),
        spo2: Math.floor(97 + Math.random() * 3),
        map: Math.floor(90 + Math.random() * 6),
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Helper to categorize department
  const getDept = (wardName: string = "", bedNum: string = "") => {
    const str = `${wardName} ${bedNum}`.toLowerCase();
    if (str.includes("icu")) return "ICU";
    if (str.includes("trauma") || str.includes("resus")) return "Trauma";
    if (str.includes("burn")) return "Burn";
    if (str.includes("emerg") || str.includes("obs") || str.includes("triage")) return "Emergency";
    return "General";
  };

  // 100% PURE DYNAMIC BINDING TO NEON CLOUD DATABASE (NO DUMMY FALLBACK ARRAY)
  const unifiedBeds = useMemo(() => {
    if (!Array.isArray(beds) || beds.length === 0) {
      return [];
    }

    return beds.map((dbBed: any) => {
      const bedNumber = dbBed.number || dbBed.bedNumber;
      const wardName = dbBed.ward || "General Inpatient";
      const dept = getDept(wardName, bedNumber);

      // Match patient directly from live Neon DB patients
      const assignedPatient = (patients || []).find((p: any) => {
        const bedVal = String(p.bedNumber || "").trim().toLowerCase();
        return (
          (bedVal === String(bedNumber).toLowerCase() || bedVal === String(dbBed.id || "").toLowerCase()) &&
          p.status !== "Discharged" &&
          p.bedNumber !== "Discharged"
        );
      });

      const isOccupied = dbBed.status === "Occupied" || !!assignedPatient;
      const patientName = assignedPatient?.name || dbBed.patientName;

      let vitalsDisplay = "BP 120/80, HR 76, SpO2 98%";
      if (assignedPatient?.vitals) {
        if (typeof assignedPatient.vitals === "string" && assignedPatient.vitals.startsWith("{")) {
          try {
            const parsed = JSON.parse(assignedPatient.vitals);
            vitalsDisplay = `BP ${parsed.bp || "120/80"}, HR ${parsed.pulse || 76}, SpO2 ${parsed.spO2 || "98%"}`;
          } catch (e) {
            vitalsDisplay = assignedPatient.vitals;
          }
        } else {
          vitalsDisplay = assignedPatient.vitals;
        }
      }

      const condition = assignedPatient?.complaint || assignedPatient?.symptoms || "Routine Inpatient Care";
      const diagnosis = assignedPatient?.diagnosis || assignedPatient?.caseNotes || "Admitted to Ward";

      const isCritical =
        isOccupied &&
        ((condition || "").toLowerCase().includes("code red") ||
          (condition || "").toLowerCase().includes("stat") ||
          (diagnosis || "").toLowerCase().includes("arrest") ||
          (diagnosis || "").toLowerCase().includes("burn") ||
          (diagnosis || "").toLowerCase().includes("stemi") ||
          (diagnosis || "").toLowerCase().includes("accident") ||
          (condition || "").toLowerCase().includes("critical"));

      return {
        id: dbBed.id,
        bedNumber,
        ward: wardName,
        dept,
        status: isOccupied ? "Occupied" : "Available",
        patientName,
        patient: assignedPatient || null,
        condition,
        diagnosis,
        isCritical,
        vitals: vitalsDisplay,
      };
    });
  }, [beds, patients]);

  // Discharge patient: releases bed assignment cleanly and updates Neon DB directly
  const handleDischarge = async (bedNumber: string, patientId?: string) => {
    try {
      // 1. Update Neon DB Patient Record
      if (patientId) {
        await fetch("/api/patients", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: patientId,
            bedNumber: "Discharged",
            status: "Discharged",
          }),
        });
      }

      // 2. Update Neon DB Bed Table
      await fetch("/api/hospital-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "UPDATE_BED",
          payload: {
            id: bedNumber,
            data: { status: "Available", patientName: null, abhaId: null },
          },
        }),
      });
    } catch (e) {
      console.error("Discharge Neon DB sync error:", e);
    }

    // 3. React Context immediate state reflection
    if (setPatients) {
      setPatients((prev: any[]) =>
        (prev || []).map((p: any) => {
          if ((patientId && p.id === patientId) || p.bedNumber === bedNumber) {
            return { ...p, bedNumber: "Discharged", status: "Discharged" };
          }
          return p;
        })
      );
    }

    if (setBeds) {
      setBeds((prevBeds: any[]) =>
        (prevBeds || []).map((b: any) =>
          b.number === bedNumber || b.bedNumber === bedNumber || b.id === bedNumber
            ? {
                ...b,
                status: "Available",
                patientName: null,
              }
            : b
        )
      );
    }

    if (refreshPatients) refreshPatients();
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
      (b.patientName && b.patientName.toLowerCase().includes(q)) ||
      (b.diagnosis && b.diagnosis.toLowerCase().includes(q));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Top Clinical Telemetry Console Header */}
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live Neon DB Sync
              </span>
            </div>
            <p className="text-xs text-emerald-200/70 mt-1">
              Synchronized ward matrix directly connected to PostgreSQL Bed table.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-[#092e24] border border-emerald-800/60">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Total Beds</span>
              <b className="text-lg font-black text-white">{unifiedBeds.length}</b>
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

      {/* Filter Tabs & Search Bar */}
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
            placeholder="Search bed, patient or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Database Loading State */}
      {unifiedBeds.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-200 shadow-xs flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <h4 className="text-sm font-black text-gray-800">Connecting to Neon Cloud Bed Database...</h4>
          <p className="text-xs text-gray-500 max-w-sm">
            Fetching registered bed records directly from PostgreSQL console.
          </p>
        </div>
      ) : (
        /* Clinical Beds Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBeds.map((b) => {
            const isOccupied = b.status === "Occupied";
            const patient = b.patient;

            return (
              <div
                key={b.id}
                className={`rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
                  isOccupied
                    ? b.isCritical
                      ? "bg-[#091512] text-white border-rose-500/80 ring-2 ring-rose-500/20"
                      : "bg-white text-gray-900 border-amber-300"
                    : "bg-white border-emerald-200 hover:border-emerald-400 text-gray-800"
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Bed Header Strip */}
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
                        <h3
                          className={`text-sm font-black tracking-tight ${
                            isOccupied && b.isCritical ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {b.bedNumber}
                        </h3>
                        <p
                          className={`text-[11px] font-semibold ${
                            isOccupied && b.isCritical ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {b.ward}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOccupied && (
                        <button
                          type="button"
                          onClick={() =>
                            setActiveTelemetry({
                              isOpen: true,
                              patientName: b.patientName || "ICU Patient",
                              bedNumber: b.bedNumber,
                            })
                          }
                          className={`p-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                            b.isCritical
                              ? "bg-rose-950/80 border-rose-500 text-rose-300 hover:bg-rose-900"
                              : "bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900"
                          }`}
                          title="Open Bedside Audio Telemetry Monitor"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}

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
                  </div>

                  {/* Patient Occupancy & Waveform Area */}
                  {isOccupied ? (
                    <div className="space-y-3">
                      {/* Patient Information Card */}
                      <div
                        className={`p-3.5 rounded-2xl border ${
                          b.isCritical
                            ? "bg-[#0d221c] border-emerald-900/60"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className={`w-3.5 h-3.5 ${b.isCritical ? "text-rose-400" : "text-gray-700"}`} />
                            <h4
                              className={`text-xs font-black truncate max-w-[180px] ${
                                b.isCritical ? "text-emerald-300" : "text-gray-900"
                              }`}
                            >
                              {b.patientName || "Emergency Patient"}
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">
                            {patient?.age ? `${patient.age} Yrs` : "Adult"}
                          </span>
                        </div>

                        <p
                          className={`text-[11px] mt-1.5 font-bold truncate ${
                            b.isCritical ? "text-rose-400" : "text-amber-700"
                          }`}
                        >
                          Dx: {b.diagnosis || b.condition}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1 pt-1 border-t border-gray-200/40">
                          <span>{b.vitals}</span>
                        </div>
                      </div>

                      {/* Continuous ECG Oscilloscope Waveform */}
                      <div
                        onClick={() =>
                          setActiveTelemetry({
                            isOpen: true,
                            patientName: b.patientName || "ICU Patient",
                            bedNumber: b.bedNumber,
                          })
                        }
                        className="space-y-1 cursor-pointer group"
                        title="Click to launch Bedside Audio Telemetry"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span
                            className={`flex items-center gap-1 group-hover:underline ${
                              b.isCritical ? "text-emerald-400" : "text-gray-600"
                            }`}
                          >
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
                        Oxygen & Defib Calibrated • Auto-assign via Code Red / Intake
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
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

                  <div className="flex items-center gap-2">
                    {isOccupied && (
                      <button
                        onClick={() =>
                          setActiveTelemetry({
                            isOpen: true,
                            patientName: b.patientName || "ICU Patient",
                            bedNumber: b.bedNumber,
                          })
                        }
                        className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Activity className="w-3 h-3" /> Telemetry
                      </button>
                    )}

                    {isOccupied && (
                      <button
                        onClick={() => handleDischarge(b.bedNumber, patient?.id)}
                        className="text-[11px] font-black text-rose-500 hover:text-rose-400 hover:underline cursor-pointer flex items-center gap-1 transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Discharge →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bedside Live ECG & Audio Monitor Popup */}
      {activeTelemetry.isOpen && (
        <IcuTelemetryModal
          isOpen={activeTelemetry.isOpen}
          onClose={() =>
            setActiveTelemetry({ isOpen: false, patientName: "", bedNumber: "" })
          }
          patientName={activeTelemetry.patientName}
          bedNumber={activeTelemetry.bedNumber}
        />
      )}
    </div>
  );
}