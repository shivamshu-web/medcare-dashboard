"use client";

import React, { useMemo } from "react";
import { useHospital } from "@/context/HospitalContext";
import {
  BedDouble,
  Activity,
  Database,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Siren,
  User,
} from "lucide-react";

// Standard Master Wards (Exact match with WardsView)
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

export default function LiveHospitalMetrics({
  onSelectPatient,
  onNavigateToWards,
  onNavigateToPatients,
}: {
  onSelectPatient?: (patient: any) => void;
  onNavigateToWards?: () => void;
  onNavigateToPatients?: () => void;
}) {
  const { patients, beds } = useHospital() as any;

  // Single Source of Truth for Patients (Context + LocalStorage Hybrid)
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

  // Real-time Bed Occupancy Sync
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

  // Latest 4 Inpatient Admissions
  const latestRecords = useMemo(() => {
    return verifiedPatients.slice(0, 4);
  }, [verifiedPatients]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-sans">
      {/* 1. Bed Occupancy Meter (Live Sync with WardsView) */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between">
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
                  Live Sync • ICU, Trauma & General Units
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

          {/* Occupancy Progress Bar */}
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

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">
                Available
              </span>
              <b className="text-lg font-black text-emerald-700">{bedStats.available} Ready</b>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase block">
                Occupied
              </span>
              <b className="text-lg font-black text-gray-800">{bedStats.occupied} In-Use</b>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-2xl">
              <span className="text-[10px] font-extrabold text-rose-800 uppercase block">
                Code Red
              </span>
              <b className="text-lg font-black text-rose-600">{bedStats.critical} STAT</b>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Central Bed Matrix Active
          </span>
          <span className="font-mono">{bedStats.total} Total Configured Beds</span>
        </div>
      </div>

      {/* 2. Patient Cases Database Record (Live Sync with PatientTableView) */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/90 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900 tracking-tight">
                  Recent Patient Admissions
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">
                  Direct Live Feed from Patient Cases
                </p>
              </div>
            </div>

            {onNavigateToPatients && (
              <button
                onClick={onNavigateToPatients}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5 transition cursor-pointer"
              >
                All Cases ({verifiedPatients.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of Recent Patients */}
          <div className="space-y-2 mt-3.5">
            {latestRecords.length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-medium">
                No active patient admissions registered yet.
              </div>
            ) : (
              latestRecords.map((p: any) => {
                const isCrit = `${p.complaint || ""} ${p.diagnosis || ""}`.toLowerCase().includes("code red");
                const hasBed = p.bedNumber && p.bedNumber !== "Discharged" && p.bedNumber !== "OPD";

                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPatient && onSelectPatient(p)}
                    className="p-2.5 rounded-2xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-emerald-300 transition cursor-pointer flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isCrit
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isCrit ? <Siren className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-black text-gray-900 truncate">{p.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ({p.age || 35}Y)
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-500 truncate block">
                          {p.diagnosis || p.complaint || "Clinical Inpatient"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {hasBed ? (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {p.bedNumber}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-600">
                          OPD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> ABDM M1 Standard Linked
          </span>
          <span className="font-mono">{verifiedPatients.length} Active Records</span>
        </div>
      </div>
    </div>
  );
}