"use client";

import React, { useMemo } from "react";
import { useHospital } from "@/context/HospitalContext";
import { BedDouble, ArrowUpRight } from "lucide-react";

const BASE_WARDS = [
  { id: "B-101", bedNumber: "ICU-BAY-01" },
  { id: "B-102", bedNumber: "TRAUMA-RESUS-02" },
  { id: "B-103", bedNumber: "BURN-STERILE-03" },
  { id: "B-104", bedNumber: "ER-CRIT-04" },
  { id: "B-105", bedNumber: "ICU-BAY-02" },
  { id: "B-106", bedNumber: "GEN-WARD-11" },
  { id: "B-107", bedNumber: "GEN-WARD-12" },
  { id: "B-108", bedNumber: "GEN-WARD-21" },
];

export default function LiveHospitalMetrics({
  onNavigateToWards,
}: {
  onNavigateToWards?: () => void;
}) {
  const { patients, beds } = useHospital() as any;

  const verifiedPatients = useMemo(() => {
    let local: any[] = [];
    if (typeof window !== "undefined") {
      try {
        local = JSON.parse(localStorage.getItem("medcare_patients_db") || "[]");
      } catch (e) {}
    }
    const map = new Map();
    [...(patients || []), ...local].forEach((p: any) => {
      if (p?.id) map.set(p.id, p);
    });
    return Array.from(map.values());
  }, [patients]);

  const bedStats = useMemo(() => {
    let occupied = 0;
    let critical = 0;

    BASE_WARDS.forEach((base) => {
      const patientMatch = verifiedPatients.find((p: any) => {
        const bedRef = String(p.bedNumber || "").trim().toLowerCase();
        return (
          (bedRef === base.bedNumber.toLowerCase() || bedRef === base.id.toLowerCase()) &&
          p.status !== "Discharged" &&
          p.bedNumber !== "Discharged"
        );
      });

      const contextBed = (beds || []).find((b: any) => {
        const bRef = String(b.bedNumber || b.id || "").trim().toLowerCase();
        return bRef === base.bedNumber.toLowerCase() || bRef === base.id.toLowerCase();
      });

      const isOcc = !!patientMatch || contextBed?.status === "Occupied";
      if (isOcc) {
        occupied++;
        const diag = `${patientMatch?.diagnosis || ""} ${patientMatch?.complaint || ""}`.toLowerCase();
        if (diag.includes("code red") || diag.includes("arrest") || diag.includes("trauma") || diag.includes("burn")) {
          critical++;
        }
      }
    });

    const total = BASE_WARDS.length;
    const available = total - occupied;
    const percentage = Math.round((occupied / total) * 100);

    return { total, occupied, available, critical, percentage };
  }, [verifiedPatients, beds]);

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between font-sans w-full">
      <div>
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
                Live Dynamic Sync • Wards & Trauma Console
              </p>
            </div>
          </div>

          {onNavigateToWards && (
            <button
              onClick={onNavigateToWards}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 transition cursor-pointer"
            >
              Ward Console <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-gray-700">Total Ward Capacity</span>
            <span className="font-mono font-black text-emerald-700">
              {bedStats.percentage}% Utilized
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                bedStats.percentage > 80
                  ? "bg-rose-500"
                  : bedStats.percentage > 50
                  ? "bg-amber-500"
                  : "bg-emerald-600"
              }`}
              style={{ width: `${Math.max(5, bedStats.percentage)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 text-center">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Available</span>
            <b className="text-lg font-black text-emerald-700">{bedStats.available} Ready</b>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
            <span className="text-[10px] font-extrabold text-gray-500 uppercase block">Occupied</span>
            <b className="text-lg font-black text-gray-800">{bedStats.occupied} In-Use</b>
          </div>
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl">
            <span className="text-[10px] font-extrabold text-rose-800 uppercase block">Code Red</span>
            <b className="text-lg font-black text-rose-600">{bedStats.critical} STAT</b>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Central Bed Matrix Active
        </span>
        <span className="font-mono">{bedStats.total} Total Configured Beds</span>
      </div>
    </div>
  );
}