"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useHospital } from "@/context/HospitalContext";
import { BedDouble, ArrowUpRight } from "lucide-react";

export default function LiveHospitalMetrics({
  onNavigateToWards,
}: {
  onNavigateToWards?: () => void;
}) {
  const { beds, patients, activeEmergency } = useHospital() as any;
  const [tick, setTick] = useState(0);

  // Storage aur window events sync taaki kisi bhi module se bed assign hone par live update ho
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("storage", handler);
    window.addEventListener("medcare_wards_updated", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("medcare_wards_updated", handler);
    };
  }, []);

  // DIRECT DYNAMIC SYNCHRONIZATION WITH NEON DB & ADMISSIONS
  const stats = useMemo(() => {
    const totalConfiguredBeds = Array.isArray(beds) && beds.length > 0 ? beds.length : 22;

    // 1. Neon DB Patients jo currently kisi bed par admitted hain
    const activeAdmittedPatients = (patients || []).filter((p: any) => {
      const status = String(p?.status || "").toLowerCase();
      const bed = String(p?.bedNumber || "").toUpperCase();
      return (
        bed !== "" &&
        bed !== "OPD" &&
        bed !== "NONE" &&
        !status.includes("discharged")
      );
    });

    // 2. Code Red / Critical / STAT ER cases count
    const criticalCases = (patients || []).filter((p: any) => {
      const s = String(p?.status || "").toLowerCase();
      const b = String(p?.bedNumber || "").toUpperCase();
      const c = String(p?.caseNotes || p?.symptoms || "").toLowerCase();
      return (
        s.includes("critical") ||
        s.includes("resus") ||
        s.includes("code red") ||
        b.includes("TRAUMA") ||
        b.includes("ER") ||
        c.includes("stemie") ||
        c.includes("arrest")
      );
    }).length + (activeEmergency ? 1 : 0);

    // 3. Occupied Beds count (Beds array OR Admitted Patients)
    const dbOccupiedBeds = Array.isArray(beds)
      ? beds.filter((b: any) => b?.status === "Occupied" || b?.occupied).length
      : 0;

    const finalOccupied = Math.max(activeAdmittedPatients.length, dbOccupiedBeds);
    const finalAvailable = Math.max(0, totalConfiguredBeds - finalOccupied);
    const finalPercentage = totalConfiguredBeds > 0
      ? Math.min(100, Math.round((finalOccupied / totalConfiguredBeds) * 100))
      : 0;

    return {
      total: totalConfiguredBeds,
      occupied: finalOccupied,
      available: finalAvailable,
      critical: criticalCases,
      percentage: finalPercentage,
    };
  }, [beds, patients, activeEmergency, tick]);

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between h-full font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">
                Clinical Ward Bed Occupancy
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">
                Live Dynamic Sync • Wards Console
              </p>
            </div>
          </div>

          {onNavigateToWards && (
            <button
              onClick={onNavigateToWards}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition cursor-pointer"
            >
              Wards <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700">Total Ward Occupancy</span>
            <span className="font-mono font-black text-emerald-700">
              {stats.percentage}% Utilized
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                stats.percentage > 75
                  ? "bg-rose-500"
                  : stats.percentage > 40
                  ? "bg-amber-500"
                  : "bg-emerald-600"
              }`}
              style={{ width: `${Math.max(stats.percentage > 0 ? 6 : 0, stats.percentage)}%` }}
            />
          </div>
        </div>

        {/* 3 Metrics: Available, Occupied, Code Red */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-tight block">
              Available
            </span>
            <b className="text-base font-black text-emerald-700">{stats.available} Ready</b>
          </div>

          <div className="p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
            <span className="text-[10px] font-extrabold text-blue-800 uppercase tracking-tight block">
              Occupied
            </span>
            <b className="text-base font-black text-blue-700">{stats.occupied} In-Use</b>
          </div>

          <div className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-2xl">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-tight block">
              Code Red
            </span>
            <b className="text-base font-black text-rose-600">{stats.critical} STAT</b>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Central Matrix Active
        </span>
        <span className="font-mono font-medium">{stats.total} Configured Beds</span>
      </div>
    </div>
  );
}