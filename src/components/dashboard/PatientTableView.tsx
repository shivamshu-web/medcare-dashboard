"use client";

import React, { useState, useMemo } from "react";
import { useHospital } from "@/context/HospitalContext";
import {
  Search,
  Activity,
  Heart,
  FileText,
  Eye,
  Stethoscope,
  Printer,
  X,
  Filter,
  Plus,
} from "lucide-react";

interface PatientTableViewProps {
  patients?: any[];
  onSelectPatient?: (pt: any) => void;
  onOpenModal?: () => void;
}

export default function PatientTableView({
  patients: propPatients,
  onSelectPatient,
  onOpenModal,
}: PatientTableViewProps) {
  const hospital = useHospital() as any;

  // Context ya Prop dono se safely data lega
  const activePatients: any[] = propPatients || hospital?.patients || [];

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");

  // Real-time Search by Name, ABHA ID & Symptoms
  const filteredPatients = useMemo(() => {
    return activePatients.filter((pt) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesName = (pt.name || "").toLowerCase().includes(q);
      const matchesAbha = (pt.abhaId || "").toLowerCase().includes(q);
      const matchesSymptoms = (pt.symptoms || "").toLowerCase().includes(q);
      const matchesQuery = !q || matchesName || matchesAbha || matchesSymptoms;

      const matchesGender =
        genderFilter === "All" ||
        (pt.gender || "").toLowerCase() === genderFilter.toLowerCase();

      return matchesQuery && matchesGender;
    });
  }, [activePatients, searchQuery, genderFilter]);

  const handleInspect = (pt: any) => {
    if (onSelectPatient) {
      onSelectPatient(pt);
    } else {
      setSelectedPatient(pt);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#072a22] text-emerald-400 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-gray-800">
              Clinical Case Registry & OPD Records
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Total Cases: <b className="text-emerald-700">{activePatients.length} Registered</b> • Filtered:{" "}
            <b className="text-gray-700">{filteredPatients.length}</b>
          </p>
        </div>

        {/* Search, Filter & New Intake */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Live Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patient name, ABHA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400 ml-1" />
            {["All", "Male", "Female"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                  genderFilter === g
                    ? "bg-[#072a22] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Open Intake Button */}
          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="px-3 py-2 rounded-xl bg-[#072a22] text-emerald-300 hover:bg-emerald-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Intake</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
              <th className="py-3 px-4 rounded-l-xl">Patient Details</th>
              <th className="py-3 px-3">ABHA Health ID</th>
              <th className="py-3 px-3">Vitals (BP / Pulse / Temp)</th>
              <th className="py-3 px-3">Chief Symptoms & Diagnosis</th>
              <th className="py-3 px-3">Physician Notes</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 opacity-60" />
                  {searchQuery
                    ? `No patient case matched "${searchQuery}"`
                    : "No patient records found."}
                </td>
              </tr>
            ) : (
              filteredPatients.map((pt: any) => (
                <tr key={pt.id} className="hover:bg-emerald-50/40 transition group">
                  <td className="py-3 px-4 text-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#072a22] to-emerald-800 text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {pt.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 group-hover:text-emerald-950">
                          {pt.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {pt.age || 30} Yrs • {pt.gender || "Male"} •{" "}
                          <span className="font-mono text-gray-500">{pt.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-900">
                    <span className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[11px]">
                      {pt.abhaId || "91-0000-0000-0000"}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-mono font-bold text-gray-800 text-[10px]">
                        BP: {pt.bp || "120/80"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-mono font-bold text-[10px] flex items-center gap-1">
                        <Heart className="w-2.5 h-2.5 fill-rose-500" />
                        {pt.pulse || 72} bpm
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-mono text-[10px]">
                        {pt.temperature || "98.6"}°F
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-gray-700 font-semibold line-clamp-2 leading-relaxed">
                      {pt.symptoms || "Routine OPD Consultation"}
                    </p>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-gray-500 text-[11px] line-clamp-2 italic">
                      {pt.caseNotes || "Routine examination complete."}
                    </p>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleInspect(pt)}
                      className="px-3 py-1.5 rounded-xl bg-[#072a22] text-white hover:bg-emerald-900 font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Inspect EHR</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Inspection Sheet Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#072a22] text-emerald-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-900">
                    Clinical Case Inspection
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    ABDM Record ID:{" "}
                    <span className="font-mono text-emerald-800 font-bold">
                      {selectedPatient.id}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-gray-900 text-sm">{selectedPatient.name}</h5>
                <p className="text-xs text-gray-600">
                  {selectedPatient.age} Years • {selectedPatient.gender} • ABHA:{" "}
                  <b className="font-mono text-emerald-900">{selectedPatient.abhaId}</b>
                </p>
              </div>
              <span className="px-3 py-1 bg-white rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
                Active Record
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Blood Pressure</span>
                <span className="font-bold text-gray-900 text-xs font-mono">
                  {selectedPatient.bp || "120/80"} mmHg
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Pulse Rate</span>
                <span className="font-bold text-rose-600 text-xs font-mono">
                  {selectedPatient.pulse || 72} BPM
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Temperature</span>
                <span className="font-bold text-gray-900 text-xs font-mono">
                  {selectedPatient.temperature || "98.6"} °F
                </span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Status</span>
                <span className="font-bold text-emerald-700 text-xs">Synchronized</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Chief Symptoms
              </span>
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 text-xs text-gray-800 font-semibold leading-relaxed">
                {selectedPatient.symptoms || "No symptoms recorded."}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Doctor Notes
              </span>
              <div className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100 text-xs text-gray-800 leading-relaxed italic">
                {selectedPatient.caseNotes || "Routine examination complete."}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Case Sheet
              </button>
              <button
                type="button"
                onClick={() => setSelectedPatient(null)}
                className="flex-1 py-2.5 bg-[#072a22] text-white font-bold rounded-2xl transition cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}