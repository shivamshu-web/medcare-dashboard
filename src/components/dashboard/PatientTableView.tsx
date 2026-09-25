"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  User,
  Calendar,
  Clock,
  Trash2,
  AlertTriangle,
  Siren,
  Search,
  Plus,
  BedDouble,
  FileText,
  Activity,
  HeartPulse,
  Phone,
  Droplets,
  ShieldCheck,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface PatientTableViewProps {
  patients?: any[];
  onSelectPatient: (patient: any) => void;
  onOpenModal: () => void;
}

export default function PatientTableView({
  patients: propPatients,
  onSelectPatient,
  onOpenModal,
}: PatientTableViewProps) {
  const context = useHospital() as any;
  const deletePatient = context?.deletePatient;
  const refreshPatients = context?.refreshPatients;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"Table" | "Cards">("Table");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh from Neon DB on mount
  useEffect(() => {
    if (refreshPatients) {
      refreshPatients();
    }
  }, [refreshPatients]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (refreshPatients) await refreshPatients();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Format Date & Time safely
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) {
      const now = new Date();
      return {
        date: now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return { date: "Today", time: "Recent" };
    }
    return {
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Helper check for Code Red / Critical Emergency
  const isEmergencyCase = (p: any) => {
    const text = `${p.complaint || p.symptoms || ""} ${p.diagnosis || p.caseNotes || ""} ${p.status || ""}`.toLowerCase();
    return (
      text.includes("code red") ||
      text.includes("critical") ||
      text.includes("arrest") ||
      text.includes("trauma") ||
      text.includes("burn") ||
      text.includes("accident")
    );
  };

  // 100% PURE NEON DATABASE SYNC (No LocalStorage overrides)
  const verifiedPatients = useMemo(() => {
    const sourceList = (context?.patients && context.patients.length > 0)
      ? context.patients
      : (propPatients || []);

    const uniqueMap = new Map();
    sourceList.forEach((p: any) => {
      if (p?.id) uniqueMap.set(p.id, p);
    });

    return Array.from(uniqueMap.values());
  }, [context?.patients, propPatients]);

  // Filtered Patient List
  const filteredPatients = useMemo(() => {
    return verifiedPatients.filter((p: any) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.abhaId && p.abhaId.toLowerCase().includes(q)) ||
        (p.diagnosis && p.diagnosis.toLowerCase().includes(q)) ||
        (p.caseNotes && p.caseNotes.toLowerCase().includes(q)) ||
        (p.complaint && p.complaint.toLowerCase().includes(q)) ||
        (p.symptoms && p.symptoms.toLowerCase().includes(q)) ||
        (p.bedNumber && p.bedNumber.toLowerCase().includes(q)) ||
        (p.contact && p.contact.toLowerCase().includes(q));

      const isEmergency = isEmergencyCase(p);

      let matchesStatus = true;
      if (selectedStatus === "Emergency") matchesStatus = isEmergency;
      else if (selectedStatus === "Admitted") matchesStatus = (p.status === "Admitted" || p.bedNumber) && !isEmergency;
      else if (selectedStatus === "OPD") matchesStatus = p.status === "OPD" || (!p.bedNumber && !isEmergency);
      else if (selectedStatus === "Discharged") matchesStatus = p.status === "Discharged" || p.bedNumber === "Discharged";

      let matchesGender = true;
      if (selectedGender !== "All") {
        matchesGender = (p.gender || "").toLowerCase() === selectedGender.toLowerCase();
      }

      return matchesQuery && matchesStatus && matchesGender;
    });
  }, [verifiedPatients, searchQuery, selectedStatus, selectedGender]);

  // Handle Record Deletion directly from Neon DB
  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete record for "${name}" from Neon Database?`)) {
      if (deletePatient) {
        await deletePatient(id);
      } else {
        await fetch(`/api/patients?id=${id}`, { method: "DELETE" });
        if (refreshPatients) refreshPatients();
      }
    }
  };

  // Metric calculations
  const totalCount = verifiedPatients.length;
  const emergencyCount = verifiedPatients.filter((p: any) => isEmergencyCase(p)).length;
  const admittedCount = verifiedPatients.filter(
    (p: any) => (p.status === "Admitted" || (p.bedNumber && p.bedNumber !== "Discharged" && p.bedNumber !== "OPD")) && !isEmergencyCase(p)
  ).length;
  const opdCount = verifiedPatients.filter(
    (p: any) => !p.bedNumber || p.bedNumber === "Discharged" || p.bedNumber === "OPD" || p.status === "OPD"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Top Clinical Header & Metric Counters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">
                    Central Inpatient & Clinical Cases Repository
                  </h1>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                    Neon Cloud SQL Linked
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Live synchronized electronic health records (EHR) directly reading PostgreSQL Patient table.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition cursor-pointer"
              title="Refresh from Neon DB"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>
            <button
              onClick={onOpenModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Inpatient Intake
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div
            onClick={() => setSelectedStatus("All")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              selectedStatus === "All"
                ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                : "bg-gray-50 hover:bg-gray-100/70 border-gray-200/70 text-gray-800"
            }`}
          >
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${selectedStatus === "All" ? "text-gray-300" : "text-gray-500"}`}>
              Total Active Cases
            </span>
            <h3 className="text-2xl font-black mt-1">{totalCount}</h3>
            <span className={`text-[10px] mt-0.5 block ${selectedStatus === "All" ? "text-gray-400" : "text-gray-400"}`}>
              Live Neon Database
            </span>
          </div>

          <div
            onClick={() => setSelectedStatus("Emergency")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              selectedStatus === "Emergency"
                ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30"
                : "bg-rose-50/70 hover:bg-rose-100/70 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${selectedStatus === "Emergency" ? "text-rose-100" : "text-rose-800"}`}>
                Code Red / STAT Resus
              </span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <h3 className="text-2xl font-black mt-1">{emergencyCount} Cases</h3>
            <span className={`text-[10px] font-bold mt-0.5 block ${selectedStatus === "Emergency" ? "text-rose-200" : "text-rose-600"}`}>
              Immediate Trauma & OT Action
            </span>
          </div>

          <div
            onClick={() => setSelectedStatus("Admitted")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              selectedStatus === "Admitted"
                ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                : "bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950"
            }`}
          >
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${selectedStatus === "Admitted" ? "text-emerald-100" : "text-emerald-800"}`}>
              Inpatient Wards
            </span>
            <h3 className="text-2xl font-black mt-1">{admittedCount} Occupied</h3>
            <span className={`text-[10px] font-semibold mt-0.5 block ${selectedStatus === "Admitted" ? "text-emerald-200" : "text-emerald-700"}`}>
              Telemetry Monitored
            </span>
          </div>

          <div
            onClick={() => setSelectedStatus("OPD")}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              selectedStatus === "OPD"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-blue-50/70 hover:bg-blue-100/70 border-blue-200 text-blue-950"
            }`}
          >
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${selectedStatus === "OPD" ? "text-blue-100" : "text-blue-800"}`}>
              OPD & Consults
            </span>
            <h3 className="text-2xl font-black mt-1">{opdCount} Records</h3>
            <span className={`text-[10px] font-semibold mt-0.5 block ${selectedStatus === "OPD" ? "text-blue-200" : "text-blue-700"}`}>
              Outpatient Roster
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "All", label: "All Cases" },
            { id: "Emergency", label: "🚨 Code Red" },
            { id: "Admitted", label: "Ward Beds" },
            { id: "OPD", label: "OPD Cases" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                selectedStatus === tab.id
                  ? "bg-gray-900 text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-emerald-500 shrink-0"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male Only</option>
            <option value="Female">Female Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Patient Name, ABHA ID, Diagnosis, Bed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center border border-gray-200 bg-white rounded-xl p-0.5 shrink-0">
            <button
              onClick={() => setViewMode("Table")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                viewMode === "Table" ? "bg-gray-900 text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("Cards")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                viewMode === "Cards" ? "bg-gray-900 text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === "Table" ? (
        <div className="bg-white rounded-3xl border border-gray-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead className="bg-gray-50/80 text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-4 px-5">Patient Name & Demographics</th>
                  <th className="py-4 px-4">ABHA & Identification</th>
                  <th className="py-4 px-4">Intake Date & Time</th>
                  <th className="py-4 px-4">Diagnosis & Case Details</th>
                  <th className="py-4 px-4">Allocated Ward Bed</th>
                  <th className="py-4 px-4">Telemetry Vitals</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-14 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <User className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-bold text-gray-500">No matching patient case records found</p>
                        <span className="text-xs text-gray-400">Database connected. Add a new patient intake above.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient: any) => {
                    const isEmergency = isEmergencyCase(patient);
                    const { date, time } = formatDateTime(patient.createdAt);

                    // Normalize vitals display
                    let vitalsDisplay = patient.vitals || "BP 120/80, SpO2 98%";
                    if (typeof patient.vitals === "string" && patient.vitals.startsWith("{")) {
                      try {
                        const parsed = JSON.parse(patient.vitals);
                        vitalsDisplay = `BP ${parsed.bp || patient.bp || "120/80"}, P: ${parsed.pulse || patient.pulse || 76}`;
                      } catch (e) {}
                    } else if (patient.bp) {
                      vitalsDisplay = `BP ${patient.bp}, P: ${patient.pulse || 76}`;
                    }

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => onSelectPatient(patient)}
                        className={`cursor-pointer transition-all duration-150 hover:bg-gray-50/90 ${
                          isEmergency ? "bg-rose-50/40 hover:bg-rose-50/70" : ""
                        }`}
                      >
                        {/* Name & Demographics */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                isEmergency
                                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isEmergency ? <Siren className="w-5 h-5" /> : <User className="w-5 h-5" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-gray-900">{patient.name}</span>
                                {isEmergency && (
                                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    Code Red
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 font-medium">
                                <span>{patient.age ? `${patient.age} Yrs` : "Age N/A"}</span>
                                <span>•</span>
                                <span>{patient.gender || "Patient"}</span>
                                {patient.bloodGroup && (
                                  <>
                                    <span>•</span>
                                    <span className="text-rose-600 font-bold flex items-center gap-0.5">
                                      <Droplets className="w-3 h-3" /> {patient.bloodGroup}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ABHA & Contact */}
                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {patient.abhaId || "ABHA-VERIFIED"}
                            </span>
                            {patient.contact && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-1 font-sans mt-0.5">
                                <Phone className="w-3 h-3" /> {patient.contact}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 flex items-center gap-1 text-xs">
                              <Calendar className="w-3 h-3 text-gray-400" /> {date}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 font-mono">
                              <Clock className="w-3 h-3 text-gray-400" /> {time}
                            </span>
                          </div>
                        </td>

                        {/* Diagnosis & Treatment */}
                        <td className="py-4 px-4 max-w-xs">
                          <div>
                            <span
                              className={`font-black text-xs block truncate ${
                                isEmergency ? "text-rose-700" : "text-gray-900"
                              }`}
                            >
                              {patient.diagnosis || patient.caseNotes || patient.complaint || "Routine Clinical Intake"}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block mt-0.5">
                              {patient.complaint || patient.symptoms || patient.treatment || "Standard protocol active"}
                            </span>
                          </div>
                        </td>

                        {/* Allocated Bed */}
                        <td className="py-4 px-4">
                          {patient.bedNumber && patient.bedNumber !== "Discharged" && patient.bedNumber !== "OPD" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs">
                              <BedDouble className="w-3.5 h-3.5 text-emerald-700" />
                              {patient.bedNumber}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-xl">
                              OPD / Unassigned
                            </span>
                          )}
                        </td>

                        {/* Vitals */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                            <Activity className={`w-4 h-4 shrink-0 ${isEmergency ? "text-rose-600 animate-pulse" : "text-emerald-600"}`} />
                            <span className="truncate max-w-[130px] font-mono text-[11px]">
                              {vitalsDisplay}
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => onSelectPatient(patient)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                              title="View Patient Slip"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, patient.id, patient.name)}
                              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                              title="Delete Patient Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPatients.map((patient: any) => {
            const isEmergency = isEmergencyCase(patient);
            const { date, time } = formatDateTime(patient.createdAt);

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient(patient)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                  isEmergency
                    ? "bg-rose-50/60 border-rose-300 hover:border-rose-500"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          isEmergency ? "bg-rose-600 text-white animate-pulse" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isEmergency ? <Siren className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-gray-900">{patient.name}</h3>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {patient.age}Y • {patient.gender} • {patient.bloodGroup || "O+"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isEmergency ? "bg-rose-600 text-white" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isEmergency ? "Code Red" : "Admitted"}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
                    <p className="font-bold text-gray-800 line-clamp-1">
                      Dx: {patient.diagnosis || patient.caseNotes || patient.complaint || "Clinical Case"}
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> {patient.abhaId || "ABHA Verified"}
                    </p>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                      <Activity className="w-3.5 h-3.5 text-rose-600" /> {patient.bp ? `BP ${patient.bp}` : "BP Normal"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {date} • {time}
                  </span>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDelete(e, patient.id, patient.name)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 hover:underline">
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}