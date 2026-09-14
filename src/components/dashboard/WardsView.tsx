"use client";

import React, { useState, useEffect } from "react";
import { useHospital } from "@/context/HospitalContext";
import {
  BedDouble,
  Building2,
  CheckCircle2,
  AlertTriangle,
  User,
  HeartPulse,
  RefreshCw,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

export default function WardsView() {
  const { beds, setBeds } = useHospital() as any;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWard, setFilterWard] = useState<string>("All");

  // Local storage emergency bed sync fallback (instant real-time listener)
  const [emergencyAllocations, setEmergencyAllocations] = useState<any[]>([]);

  useEffect(() => {
    const syncEmergencyStorage = () => {
      try {
        const stored = localStorage.getItem("emergency_allocated_beds");
        if (stored) {
          setEmergencyAllocations(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    };

    syncEmergencyStorage();
    window.addEventListener("emergency_bed_update", syncEmergencyStorage);
    return () => window.removeEventListener("emergency_bed_update", syncEmergencyStorage);
  }, []);

  // Merge context beds with emergency real-time storage
  const activeBeds = React.useMemo(() => {
    if (!beds || !Array.isArray(beds)) return [];

    return beds.map((bed: any) => {
      const bedIdStr = String(bed.id);
      const bedNumStr = String(bed.bedNumber || bed.number || bed.id);

      // Check if this bed was allocated by Code Red
      const emergencyMatch = emergencyAllocations.find(
        (e: any) =>
          String(e.id) === bedIdStr ||
          String(e.bedNumber) === bedNumStr ||
          String(e.bedNumber) === bedIdStr
      );

      if (emergencyMatch) {
        return {
          ...bed,
          status: "Occupied",
          patientName: emergencyMatch.patientName,
          patient: emergencyMatch.patientName,
          diagnosis: emergencyMatch.diagnosis,
          condition: emergencyMatch.condition || "Critical (Code Red)",
          allocatedAt: emergencyMatch.allocatedAt,
        };
      }

      return bed;
    });
  }, [beds, emergencyAllocations]);

  // Ward categories list
  const wardTypes = ["All", ...Array.from(new Set(activeBeds.map((b: any) => b.ward || "General")))];

  // Filtered beds
  const displayedBeds = activeBeds.filter((b: any) => {
    const bedName = String(b.bedNumber || b.number || b.id).toLowerCase();
    const patient = String(b.patientName || b.patient || "").toLowerCase();
    const condition = String(b.diagnosis || b.condition || "").toLowerCase();
    const ward = String(b.ward || "General");

    const matchesSearch =
      bedName.includes(searchTerm.toLowerCase()) ||
      patient.includes(searchTerm.toLowerCase()) ||
      condition.includes(searchTerm.toLowerCase());

    const matchesWard = filterWard === "All" || ward === filterWard;

    return matchesSearch && matchesWard;
  });

  const occupiedCount = activeBeds.filter((b: any) => b.status === "Occupied").length;
  const availableCount = activeBeds.filter((b: any) => b.status === "Available" || b.status === "available").length;

  // Bed free / discharge action
  const handleFreeBed = (targetBed: any) => {
    const targetId = String(targetBed.id);
    const targetNum = String(targetBed.bedNumber || targetBed.number || targetBed.id);

    // 1. Context bed state free karein
    if (setBeds) {
      setBeds((prev: any[]) =>
        prev.map((b: any) =>
          String(b.id) === targetId || String(b.bedNumber || b.number || b.id) === targetNum
            ? { ...b, status: "Available", patientName: undefined, patient: undefined, diagnosis: undefined, condition: undefined }
            : b
        )
      );
    }

    // 2. Local storage clean karein
    try {
      const remaining = emergencyAllocations.filter(
        (e: any) => String(e.id) !== targetId && String(e.bedNumber) !== targetNum
      );
      localStorage.setItem("emergency_allocated_beds", JSON.stringify(remaining));
      setEmergencyAllocations(remaining);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              Hospital Wards & Bed Occupancy
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
              Live State
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time allocation sync with Emergency Code Red & Routine Inflow
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-800">
              Occupied: <b>{occupiedCount}</b>
            </span>
          </div>
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-800">
              Available: <b>{availableCount}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {wardTypes.map((ward: any) => (
            <button
              key={ward}
              onClick={() => setFilterWard(ward)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filterWard === ward
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {ward}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search bed, patient or condition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* Bed Grid Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedBeds.map((bed: any) => {
          const isOccupied = bed.status === "Occupied";
          const bedLabel = bed.bedNumber || bed.number || bed.id;
          const patientName = bed.patientName || bed.patient;
          const isCodeRed = (bed.condition || "").toLowerCase().includes("code red") || (bed.condition || "").toLowerCase().includes("critical");

          return (
            <div
              key={bed.id}
              className={`p-4 rounded-3xl border-2 transition relative flex flex-col justify-between ${
                isOccupied
                  ? isCodeRed
                    ? "bg-rose-50/70 border-rose-400/80 shadow-xs"
                    : "bg-white border-amber-300 shadow-xs"
                  : "bg-white border-emerald-200/80 hover:border-emerald-400"
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isOccupied
                          ? isCodeRed
                            ? "bg-rose-600 text-white"
                            : "bg-amber-500 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900">{bedLabel}</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{bed.ward || "General Care"}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                      isOccupied
                        ? isCodeRed
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isOccupied ? "Occupied" : "Available"}
                  </span>
                </div>

                {/* Patient Occupancy Info */}
                {isOccupied ? (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-white/80 border border-rose-100 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-900 font-black">
                      <User className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">{patientName || "Emergency Intake Patient"}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-rose-700 font-bold">
                      <HeartPulse className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{bed.diagnosis || bed.condition || "Acute Trauma / Code Red"}</span>
                    </div>

                    {bed.allocatedAt && (
                      <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-1 font-mono">
                        <Clock className="w-3 h-3" /> Admitted at {bed.allocatedAt}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center py-5">
                    <p className="text-[11px] font-bold text-gray-400">Bed Clean & Ready</p>
                    <span className="text-[9px] text-emerald-600 font-semibold">Available for Intake</span>
                  </div>
                )}
              </div>

              {/* Bottom Card Action */}
              {isOccupied && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-medium">Auto-synced</span>
                  <button
                    type="button"
                    onClick={() => handleFreeBed(bed)}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                  >
                    Discharge / Free Bed →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}