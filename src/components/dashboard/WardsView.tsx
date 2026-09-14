"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Search,
  Activity,
  ShieldAlert,
  Flame,
  Car,
  HeartCrack,
  UserCheck,
  Stethoscope,
  Filter,
} from "lucide-react";

interface BedRecord {
  id: string;
  bedNumber: string;
  ward: string;
  department: "ICU" | "Trauma" | "Burn" | "General" | "Emergency";
  status: "Available" | "Occupied" | "Cleaning";
  patientName?: string;
  age?: number | string;
  gender?: string;
  diagnosis?: string;
  condition?: string;
  vitals?: string;
  allocatedAt?: string;
  statOrders?: string[];
}

const DEFAULT_BEDS_INVENTORY: BedRecord[] = [
  { id: "B-101", bedNumber: "ICU-BAY-01", ward: "Cardio-Thoracic ICU", department: "ICU", status: "Available" },
  { id: "B-102", bedNumber: "TRAUMA-RESUS-02", ward: "Red Zone Trauma Bay", department: "Trauma", status: "Available" },
  { id: "B-103", bedNumber: "BURN-STERILE-03", ward: "Plastic & Burn Isolation", department: "Burn", status: "Available" },
  { id: "B-104", bedNumber: "ER-CRIT-04", ward: "Triage Crash Unit", department: "Emergency", status: "Available" },
  { id: "B-105", bedNumber: "ICU-BAY-02", ward: "Intensive Care Unit 2", department: "ICU", status: "Occupied", patientName: "Ramanathan Iyer", age: 62, gender: "Male", diagnosis: "NSTEMI / Heart Failure", condition: "Stable Critical", vitals: "BP 130/84, SpO2 96%", allocatedAt: "08:15 AM" },
  { id: "B-106", bedNumber: "GEN-WARD-11", ward: "General Medicine Male", department: "General", status: "Available" },
  { id: "B-107", bedNumber: "GEN-WARD-12", ward: "General Medicine Male", department: "General", status: "Available" },
  { id: "B-108", bedNumber: "GEN-WARD-21", ward: "Post-Op Surgery Ward", department: "General", status: "Occupied", patientName: "Sunita Deshmukh", age: 44, gender: "Female", diagnosis: "Laparoscopic Cholecystectomy", condition: "Recovering", vitals: "BP 118/76, SpO2 99%", allocatedAt: "Yesterday" },
];

export default function WardsView() {
  const { setBeds } = useHospital() as any;
  const [bedsList, setBedsList] = useState<BedRecord[]>(DEFAULT_BEDS_INVENTORY);
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastSavedTime, setLastSavedTime] = useState<string>("");

  // 1. Permanent Storage Hydration (Refresh hone par bhi data safe rahega)
  const syncFromPersistentStorage = () => {
    try {
      const savedPersistentBeds = localStorage.getItem("medcare_permanent_beds");
      const emergencyAllocations = JSON.parse(localStorage.getItem("emergency_allocated_beds") || "[]");

      let currentBeds = DEFAULT_BEDS_INVENTORY;

      if (savedPersistentBeds) {
        currentBeds = JSON.parse(savedPersistentBeds);
      }

      // Emergency real-time allocations merge karein
      if (emergencyAllocations.length > 0) {
        currentBeds = currentBeds.map((bed) => {
          const match = emergencyAllocations.find(
            (e: any) =>
              String(e.id) === String(bed.id) ||
              String(e.bedNumber) === String(bed.bedNumber)
          );
          if (match) {
            return {
              ...bed,
              status: "Occupied",
              patientName: match.patientName,
              diagnosis: match.diagnosis,
              condition: match.condition || "Critical (Code Red)",
              allocatedAt: match.allocatedAt || "Just Now",
              vitals: match.vitals || "Triage Monitored",
            };
          }
          return bed;
        });
      }

      setBedsList(currentBeds);
      setLastSavedTime(new Date().toLocaleTimeString());
      if (setBeds) setBeds(currentBeds);
    } catch (e) {
      console.error("Storage hydration error:", e);
    }
  };

  useEffect(() => {
    syncFromPersistentStorage();
    window.addEventListener("emergency_bed_update", syncFromPersistentStorage);
    return () => window.removeEventListener("emergency_bed_update", syncFromPersistentStorage);
  }, []);

  // 2. State change ko permanent store karein
  const saveAndBroadcastBeds = (updated: BedRecord[]) => {
    setBedsList(updated);
    setLastSavedTime(new Date().toLocaleTimeString());
    localStorage.setItem("medcare_permanent_beds", JSON.stringify(updated));
    if (setBeds) setBeds(updated);
  };

  // 3. Discharge / Bed Free Logic
  const handleDischargePatient = (bedId: string) => {
    const updated = bedsList.map((bed) => {
      if (bed.id === bedId) {
        return {
          ...bed,
          status: "Available" as const,
          patientName: undefined,
          age: undefined,
          gender: undefined,
          diagnosis: undefined,
          condition: undefined,
          vitals: undefined,
          allocatedAt: undefined,
        };
      }
      return bed;
    });

    // Emergency storage se bhi clean karein
    try {
      const emergencyAllocations = JSON.parse(localStorage.getItem("emergency_allocated_beds") || "[]");
      const filtered = emergencyAllocations.filter((e: any) => String(e.id) !== String(bedId));
      localStorage.setItem("emergency_allocated_beds", JSON.stringify(filtered));
    } catch (err) {
      console.error(err);
    }

    saveAndBroadcastBeds(updated);
  };

  // Metrics
  const totalBeds = bedsList.length;
  const occupiedCount = bedsList.filter((b) => b.status === "Occupied").length;
  const availableCount = bedsList.filter((b) => b.status === "Available").length;
  const criticalCount = bedsList.filter((b) => (b.condition || "").toLowerCase().includes("critical") || (b.condition || "").toLowerCase().includes("code red")).length;

  // Filtered List
  const filteredBeds = useMemo(() => {
    return bedsList.filter((b) => {
      const matchesDept = selectedDept === "All" || b.department === selectedDept;
      const matchesStatus = selectedStatus === "All" || b.status === selectedStatus;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        b.bedNumber.toLowerCase().includes(q) ||
        b.ward.toLowerCase().includes(q) ||
        (b.patientName && b.patientName.toLowerCase().includes(q)) ||
        (b.diagnosis && b.diagnosis.toLowerCase().includes(q));

      return matchesDept && matchesStatus && matchesQuery;
    });
  }, [bedsList, selectedDept, selectedStatus, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Clinical Header & Stats */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Clinical Wards & Bed Occupancy Matrix
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                Permanent Sync Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Direct telemetry sync between Emergency Triage (Code Red), OT Resus, and Inpatient Admissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Saved at {lastSavedTime || "Auto"}
            </span>
            <button
              onClick={syncFromPersistentStorage}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Sync
            </button>
          </div>
        </div>

        {/* 4 Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/70">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Bed Inventory</span>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalBeds} Beds</h3>
            <span className="text-[10px] text-gray-400 mt-0.5 block">100% Ward Coverage</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Available & Sanitized</span>
            <h3 className="text-2xl font-black text-emerald-900 mt-1">{availableCount} Free</h3>
            <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">Ready for Instant Intake</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Currently Occupied</span>
            <h3 className="text-2xl font-black text-amber-900 mt-1">{occupiedCount} Beds</h3>
            <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">Active Admissions</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Critical / Code Red</span>
            <h3 className="text-2xl font-black text-rose-900 mt-1">{criticalCount} Resus</h3>
            <span className="text-[10px] text-rose-700 font-bold mt-0.5 block animate-pulse">STAT Protocol Engaged</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["All", "ICU", "Trauma", "Burn", "Emergency", "General"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedDept === dept
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {dept === "All" ? "All Departments" : `${dept} Unit`}
            </button>
          ))}
        </div>

        {/* Status Filter + Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Occupied">Occupied Only</option>
          </select>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Bed No, Patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Main Clinical Beds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === "Occupied";
          const isCritical =
            (bed.condition || "").toLowerCase().includes("code red") ||
            (bed.condition || "").toLowerCase().includes("critical");

          return (
            <div
              key={bed.id}
              className={`rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs ${
                isOccupied
                  ? isCritical
                    ? "bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20"
                    : "bg-white border-amber-300"
                  : "bg-white border-emerald-200 hover:border-emerald-400"
              }`}
            >
              {/* Card Top Strip */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                        isOccupied
                          ? isCritical
                            ? "bg-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse"
                            : "bg-amber-500 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <BedDouble className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-gray-900 tracking-tight">
                        {bed.bedNumber}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-semibold">{bed.ward}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      isOccupied
                        ? isCritical
                          ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isOccupied ? (isCritical ? "Code Red Locked" : "Occupied") : "Sanitized Available"}
                  </span>
                </div>

                {/* Patient / Telemetry Details Area */}
                <div className="mt-4">
                  {isOccupied ? (
                    <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-700 shrink-0" />
                          <span className="text-xs font-black text-gray-900">
                            {bed.patientName || "Emergency Intake Case"}
                          </span>
                        </div>
                        {bed.gender && (
                          <span className="text-[10px] font-bold text-gray-400">
                            {bed.gender} • {bed.age} Yrs
                          </span>
                        )}
                      </div>

                      <div className="p-2 bg-rose-50/80 rounded-xl border border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-rose-900 font-bold">
                          <HeartPulse className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">{bed.diagnosis || "Acute Clinical Condition"}</span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded">
                          {bed.condition || "Critical"}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-emerald-600" /> {bed.vitals || "Vitals Monitored"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {bed.allocatedAt || "Admitted"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-1.5" />
                      <p className="text-xs font-bold text-gray-800">Bed Clean & Ready</p>
                      <span className="text-[10px] text-gray-400">
                        Oxygen & Defib Calibrated • Auto-intake available
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Dept: {bed.department}
                </span>

                {isOccupied ? (
                  <button
                    onClick={() => handleDischargePatient(bed.id)}
                    className="text-[11px] font-black text-rose-600 hover:text-rose-800 hover:bg-rose-100/60 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Discharge & Free Bed →
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}