"use client";

import React, { useState } from "react";
import {
  BedDouble,
  UserMinus,
  UserPlus,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";
import IcuTelemetryModal from "@/components/dashboard/IcuTelemetryModal";

export default function WardsView() {
  const { beds, patients, admitPatientToBed, dischargeBed, sanitizeBed } = useHospital();
  const [selectedWard, setSelectedWard] = useState<string>("All");
  const [admitTargetBed, setAdmitTargetBed] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [telemetryPatient, setTelemetryPatient] = useState<{
    name: string;
    bed: string;
  } | null>(null);

  const wardTabs = ["All", "Emergency", "ICU", "General", "Private"];

  const filteredBeds = beds.filter(
    (b) => selectedWard === "All" || b.ward === selectedWard
  );

  const totalBeds = beds.length;
  const occupiedCount = beds.filter((b) => b.status === "Occupied").length;
  const availableCount = beds.filter((b) => b.status === "Available").length;
  const cleaningCount = beds.filter((b) => b.status === "Cleaning").length;

  const handleConfirmAdmission = () => {
    if (!admitTargetBed || !selectedPatientId) return;
    const pt = patients.find((p) => p.id === selectedPatientId);
    if (pt) {
      admitPatientToBed(admitTargetBed, pt.name, pt.abhaId);
    }
    setAdmitTargetBed(null);
    setSelectedPatientId("");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Hospital Ward & Bed Management Grid</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              Live Facility Tracking
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time bed allocation, terminal cleaning status, and bedside vital telemetry
          </p>
        </div>

        {/* Quick Ward Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-gray-50 p-1 rounded-2xl border border-gray-200/60">
          {wardTabs.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWard(w)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedWard === w
                  ? "bg-[#072a22] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Ward Occupancy KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Monitored Beds</span>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{totalBeds}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Central Hospital Capacity</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Clean & Ready</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{availableCount}</h3>
          <p className="text-[10px] text-emerald-600 mt-0.5">Instant Admission Available</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-600">Active In-Patients</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{occupiedCount}</h3>
          <p className="text-[10px] text-rose-600 mt-0.5">
            Occupancy Rate: {totalBeds > 0 ? Math.round((occupiedCount / totalBeds) * 100) : 0}%
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600">Terminal Sanitization</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{cleaningCount}</h3>
          <p className="text-[10px] text-amber-600 mt-0.5">Disinfection Protocol Active</p>
        </div>
      </div>

      {/* Visual Floor Plan Bed Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBeds.map((bed) => {
          const isOcc = bed.status === "Occupied";
          const isClean = bed.status === "Cleaning";

          return (
            <div
              key={bed.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between ${
                isOcc
                  ? "bg-rose-50/40 border-rose-200"
                  : isClean
                  ? "bg-amber-50/40 border-amber-200"
                  : "bg-white border-gray-200/80 hover:border-emerald-500 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isOcc
                          ? "bg-rose-100 text-rose-700"
                          : isClean
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-800">{bed.number}</h4>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        {bed.ward} Ward
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isOcc
                        ? "bg-rose-100 text-rose-800"
                        : isClean
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                {isOcc ? (
                  <div className="p-3 bg-white/80 rounded-2xl border border-rose-100 space-y-1 text-xs mb-4">
                    <p className="font-bold text-gray-800">{bed.patientName}</p>
                    <p className="text-[10px] font-mono text-gray-500">ABHA: {bed.abhaId}</p>
                    <p className="text-[10px] text-gray-400">Admitted: {bed.admitTime}</p>
                  </div>
                ) : isClean ? (
                  <div className="p-3 bg-white/80 rounded-2xl border border-amber-100 text-xs text-amber-800 mb-4">
                    <span className="font-semibold block">Undergoing Disinfection</span>
                    <span className="text-[10px] text-amber-700">Ready for release in 15 mins</span>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 text-xs text-gray-500 mb-4">
                    Clean, sanitized and prepped for immediate ER / OPD triage transfer.
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-2 border-t border-gray-100">
                {isOcc ? (
                  <div className="space-y-2">
                    {/* Live Telemetry Button */}
                    <button
                      onClick={() =>
                        setTelemetryPatient({
                          name: bed.patientName || "Admitted Patient",
                          bed: bed.number,
                        })
                      }
                      className="w-full py-2 bg-[#072a22] hover:bg-[#0c382e] text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Live ICU Telemetry
                    </button>

                    {/* Discharge Patient Button */}
                    <button
                      onClick={() => dischargeBed(bed.id)}
                      className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <UserMinus className="w-3.5 h-3.5" /> Discharge Patient
                    </button>
                  </div>
                ) : isClean ? (
                  <button
                    onClick={() => sanitizeBed(bed.id)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Sanitation Done
                  </button>
                ) : (
                  <button
                    onClick={() => setAdmitTargetBed(bed.id)}
                    className="w-full py-2 bg-[#072a22] hover:bg-[#0c382e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" /> Admit Patient
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Admit Modal */}
      {admitTargetBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-800">
              Assign In-Patient to Bed ({beds.find((b) => b.id === admitTargetBed)?.number})
            </h3>
            <p className="text-xs text-gray-500">
              Select an admitted patient from the active OPD & Registry list:
            </p>

            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold"
            >
              <option value="">-- Choose Registered Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ABHA: {p.abhaId ? p.abhaId.slice(-4) : "OPD"})
                </option>
              ))}
            </select>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                onClick={() => setAdmitTargetBed(null)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedPatientId}
                onClick={handleConfirmAdmission}
                className="px-5 py-2 bg-[#072a22] text-white text-xs font-bold rounded-xl hover:bg-[#0c382e] disabled:opacity-50 transition cursor-pointer"
              >
                Confirm Admission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live ICU Telemetry Bedside Monitor Modal */}
      <IcuTelemetryModal
        isOpen={!!telemetryPatient}
        onClose={() => setTelemetryPatient(null)}
        patientName={telemetryPatient?.name}
        bedNumber={telemetryPatient?.bed}
      />
    </div>
  );
}