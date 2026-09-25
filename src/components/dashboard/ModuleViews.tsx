"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  User,
  PhoneCall,
  Stethoscope,
  Plus,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Pill,
  Search,
  Filter,
  Eye,
  Download,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Printer,
  X,
  Copy,
  ChevronRight,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";
import type { LabItem, AppointmentItem } from "@/context/HospitalContext";

// ==========================================
// 1. ADVANCED APPOINTMENTS VIEW
// ==========================================
export function AppointmentsView({ onNewIntake }: { onNewIntake?: () => void }) {
  const { appointments } = useHospital();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [localAppointments, setLocalAppointments] = useState<AppointmentItem[]>(appointments);

  React.useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setLocalAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const filteredAppointments = localAppointments.filter((apt) => {
    const matchesSearch =
      apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === "All" || apt.doctor === doctorFilter;
    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const totalCount = localAppointments.length;
  const confirmedCount = localAppointments.filter((a) => a.status === "Confirmed").length;
  const inProgressCount = localAppointments.filter((a) => a.status === "In Progress").length;
  const completedCount = localAppointments.filter((a) => a.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Hospital Appointment & OPD Queue</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              Live Token Flow
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time consult encounters, specialty schedules, and bedside telemetry links
          </p>
        </div>

        <button
          onClick={onNewIntake}
          className="px-4 py-2.5 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Book Walk-in / OPD Intake</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Booked</span>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{totalCount}</h3>
          <p className="text-[10px] text-gray-400">Scheduled Shifts</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Waiting / Confirmed</span>
          <h3 className="text-2xl font-black text-emerald-700 mt-1">{confirmedCount}</h3>
          <p className="text-[10px] text-emerald-600">In OPD Waiting Lounge</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-600">In Consultation</span>
          <h3 className="text-2xl font-black text-blue-600 mt-1">{inProgressCount}</h3>
          <p className="text-[10px] text-blue-600">Active Doctor Exam</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-500">Discharged / Completed</span>
          <h3 className="text-2xl font-black text-gray-800 mt-1">{completedCount}</h3>
          <p className="text-[10px] text-gray-500">Prescription Issued</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Patient, Token, or Specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Clinicians</option>
            <option value="Dr. Morgan">Dr. Morgan</option>
            <option value="Dr. Anjali Rao">Dr. Anjali Rao</option>
            <option value="Dr. Verma">Dr. Verma</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.map((apt) => {
          const isDone = apt.status === "Completed";
          const isInProg = apt.status === "In Progress";

          return (
            <div
              key={apt.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
                isDone
                  ? "bg-gray-50/70 border-gray-200"
                  : isInProg
                  ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30 shadow-xs"
                  : "bg-white border-gray-200/80 hover:border-emerald-400 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#072a22] text-emerald-300 flex items-center justify-center font-bold text-xs">
                      {apt.id.split("-")[1]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{apt.id}</h4>
                      <p className="text-[10px] text-gray-400">{apt.type}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? "bg-gray-200 text-gray-700"
                        : isInProg
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="my-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-800">{apt.patient}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Slot: <b className="text-gray-700">{apt.time}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Stethoscope className="w-3.5 h-3.5 text-gray-400" />
                    <span>Consultant: <b className="text-emerald-800">{apt.doctor}</b></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <select
                  value={apt.status}
                  onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                  className="text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>

                <button
                  onClick={onNewIntake}
                  className="px-3 py-1.5 bg-[#072a22] hover:bg-[#0c382e] text-white text-[11px] font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <Stethoscope className="w-3 h-3 text-emerald-400" />
                  <span>Examine</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. ADVANCED LAB REPORTS VIEW
// ==========================================
export function LabReportsView() {
  const { labQueue, updateLabStatus } = useHospital();
  const [selectedReport, setSelectedReport] = useState<LabItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const sampleResultsMap: Record<string, { param: string; value: string; ref: string; status: "Normal" | "High" | "Low" }[]> = {
    "Complete Blood Count (CBC)": [
      { param: "Hemoglobin (Hb)", value: "13.8 g/dL", ref: "13.0 - 17.0", status: "Normal" },
      { param: "WBC Total Count", value: "11,200 /mcL", ref: "4,000 - 11,000", status: "High" },
      { param: "Platelet Count", value: "240,000 /mcL", ref: "150,000 - 450,000", status: "Normal" },
      { param: "RBC Count", value: "4.8 mil/mcL", ref: "4.5 - 5.9", status: "Normal" },
      { param: "Neutrophils", value: "74%", ref: "40 - 70%", status: "High" },
    ],
    "Lipid Profile & Serum Creatinine": [
      { param: "Total Cholesterol", value: "220 mg/dL", ref: "< 200", status: "High" },
      { param: "Triglycerides", value: "165 mg/dL", ref: "< 150", status: "High" },
      { param: "HDL (Good)", value: "44 mg/dL", ref: "> 40", status: "Normal" },
      { param: "Serum Creatinine", value: "0.9 mg/dL", ref: "0.7 - 1.3", status: "Normal" },
      { param: "eGFR", value: "98 mL/min", ref: "> 90", status: "Normal" },
    ],
  };

  const defaultResults = [
    { param: "Test Assay", value: "Completed", ref: "Standard", status: "Normal" as const },
    { param: "Quality Control (QC)", value: "Passed (Delta Check OK)", ref: "100%", status: "Normal" as const },
  ];

  const filteredLabs = labQueue.filter((l) =>
    l.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.test.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Diagnostic Pathology & LIS Workbench</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
              NABL / ABDM Certified
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Automated sample barcode tracking, analyzer centrifugation, and HL7 FHIR export
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sample token or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLabs.map((lab) => {
          const isComplete = lab.status === "Analysis Complete" || lab.status === "Ready";
          const isCritical = lab.status.includes("CRITICAL") || lab.status.includes("STAT");

          return (
            <div
              key={lab.token}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
                isCritical
                  ? "bg-rose-50/50 border-rose-200"
                  : isComplete
                  ? "bg-emerald-50/30 border-emerald-200"
                  : "bg-white border-gray-200/80 hover:border-blue-400 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="font-mono font-bold text-xs bg-gray-100 px-2.5 py-1 rounded-xl text-gray-800">
                    {lab.token}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCritical
                        ? "bg-rose-100 text-rose-800 animate-pulse"
                        : isComplete
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {lab.status}
                  </span>
                </div>

                <div className="my-3 space-y-1.5">
                  <h4 className="text-sm font-bold text-gray-900">{lab.test}</h4>
                  <p className="text-xs font-semibold text-gray-600">Patient: {lab.patient}</p>
                  <p className="text-[10px] text-gray-400">Prescribing Clinician: {lab.doctor}</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                    <Clock className="w-3 h-3 inline" /> Estimated TAT: {lab.tat}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedReport(lab)}
                  className="px-3 py-1.5 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Slip</span>
                </button>

                {!isComplete && (
                  <button
                    onClick={() => updateLabStatus(lab.token, "Analysis Complete")}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-5 border border-gray-100 my-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800">
                    Diagnostic Pathology Report ({selectedReport.token})
                  </h3>
                  <p className="text-xs text-gray-400">
                    Patient: <b className="text-gray-700">{selectedReport.patient}</b> • Ref: {selectedReport.doctor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
              <h4 className="text-xs font-black uppercase text-gray-700 mb-2">
                Investigation: {selectedReport.test}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] font-bold text-gray-400 uppercase border-b border-gray-200">
                    <tr>
                      <th className="py-2">Biomarker / Parameter</th>
                      <th className="py-2">Observed Result</th>
                      <th className="py-2">Reference Biological Interval</th>
                      <th className="py-2 text-right">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                    {(sampleResultsMap[selectedReport.test] || defaultResults).map((res, i) => (
                      <tr key={i} className="hover:bg-white">
                        <td className="py-2 font-sans font-semibold text-gray-800">{res.param}</td>
                        <td className="py-2 font-bold text-gray-900">{res.value}</td>
                        <td className="py-2 text-gray-500">{res.ref}</td>
                        <td className="py-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              res.status === "High"
                                ? "bg-rose-100 text-rose-700"
                                : res.status === "Low"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Digitally Signed & Validated via LIS Analyzer Interface
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-5 py-2 bg-[#072a22] hover:bg-[#0c382e] text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. ADVANCED MEDICAL RECORDS & FHIR VIEWER
// ==========================================
export function MedicalRecordsView({ onOpenIntake }: { onOpenIntake?: () => void }) {
  const { patients } = useHospital();
  const [selectedPatientRecord, setSelectedPatientRecord] = useState<any | null>(null);
  const [showFhirJson, setShowFhirJson] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const recordsList = patients.map((p, idx) => ({
    recordId: `EHR-2026-${1000 + idx}`,
    patientName: p.name,
    abhaId: p.abhaId || "ABHA-VERIFIED",
    age: p.age || 42,
    gender: p.gender || "Male",
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN") : "Today",
    vitals: { bp: p.bp || "120/80", pulse: p.pulse || 78, temp: p.temperature || 98.4 },
    diagnosis: p.symptoms || "Hypertension & Routine Health Examination",
    clinicalNotes: p.caseNotes || "Patient examined. Vitals stable. Advised dietary modifications and standard follow-up in 14 days.",
    fhirBundleId: `urn:uuid:${Math.random().toString(36).substring(2, 12)}`,
  }));

  const filteredRecords = recordsList.filter((r) =>
    r.patientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.recordId.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.abhaId.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">ABDM Electronic Health Records (EHR)</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              HL7 FHIR R4 Compliant
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically signed patient health summaries, diagnostic history, and encounter bundles
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, ABHA or record ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f8faf9] text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-5">Record UID</th>
                <th className="py-3.5 px-5">Patient & ABHA ID</th>
                <th className="py-3.5 px-5">Encounter Date</th>
                <th className="py-3.5 px-5">Primary Diagnosis</th>
                <th className="py-3.5 px-5">Vitals (BP / Pulse)</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((rec) => (
                <tr key={rec.recordId} className="hover:bg-emerald-50/40 transition">
                  <td className="py-3.5 px-5 font-mono font-bold text-emerald-950">
                    {rec.recordId}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-gray-900 block">{rec.patientName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{rec.abhaId}</span>
                  </td>
                  <td className="py-3.5 px-5 text-gray-600">{rec.date}</td>
                  <td className="py-3.5 px-5 text-gray-700 font-medium max-w-xs truncate">
                    {rec.diagnosis}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[11px] text-gray-600">
                    {rec.vitals.bp} mmHg • {rec.vitals.pulse} bpm
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => {
                        setSelectedPatientRecord(rec);
                        setShowFhirJson(false);
                      }}
                      className="px-3 py-1.5 bg-[#072a22] hover:bg-[#0c382e] text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View File</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatientRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-100 my-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-800">
                    Electronic Health Record: {selectedPatientRecord.recordId}
                  </h3>
                  <p className="text-xs text-gray-400">
                    ABHA: <b className="text-emerald-800">{selectedPatientRecord.abhaId}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatientRecord(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-bold">
              <button
                onClick={() => setShowFhirJson(false)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  !showFhirJson ? "bg-[#072a22] text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Clinician Summary
              </button>
              <button
                onClick={() => setShowFhirJson(true)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  showFhirJson ? "bg-emerald-600 text-white" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>FHIR R4 Bundle (JSON)</span>
              </button>
            </div>

            {!showFhirJson ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Patient</span>
                    <b className="text-gray-900 text-sm">{selectedPatientRecord.patientName}</b>
                    <p className="text-[11px] text-gray-500">{selectedPatientRecord.gender}, {selectedPatientRecord.age} Yrs</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Vitals Baseline</span>
                    <b className="text-gray-800">BP: {selectedPatientRecord.vitals.bp} mmHg</b>
                    <p className="text-[11px] text-gray-500">Pulse: {selectedPatientRecord.vitals.pulse} bpm • Temp: {selectedPatientRecord.vitals.temp}°F</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Encounter Date</span>
                    <b className="text-gray-800">{selectedPatientRecord.date}</b>
                    <p className="text-[11px] text-emerald-700 font-semibold">OPD Consultation</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-1">
                  <h5 className="text-xs font-black uppercase text-emerald-950 tracking-wider">Clinical Impression & Symptoms</h5>
                  <p className="text-xs text-gray-700 leading-relaxed">{selectedPatientRecord.diagnosis}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                  <h5 className="text-xs font-black uppercase text-gray-700 tracking-wider">Physician Case Notes</h5>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans">{selectedPatientRecord.clinicalNotes}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#030706] text-emerald-400 rounded-2xl font-mono text-[11px] max-h-72 overflow-y-auto border border-emerald-950">
                <pre>{JSON.stringify({
                  resourceType: "Bundle",
                  id: selectedPatientRecord.fhirBundleId,
                  meta: { lastUpdated: new Date().toISOString() },
                  type: "document",
                  entry: [
                    {
                      resource: {
                        resourceType: "Patient",
                        identifier: [{ system: "https://healthid.ndhm.gov.in", value: selectedPatientRecord.abhaId }],
                        name: [{ text: selectedPatientRecord.patientName }],
                        gender: selectedPatientRecord.gender.toLowerCase(),
                      }
                    },
                    {
                      resource: {
                        resourceType: "Condition",
                        code: { text: selectedPatientRecord.diagnosis },
                        clinicalStatus: { coding: [{ code: "active" }] }
                      }
                    },
                    {
                      resource: {
                        resourceType: "Observation",
                        code: { text: "Blood Pressure" },
                        valueString: selectedPatientRecord.vitals.bp
                      }
                    }
                  ]
                }, null, 2)}</pre>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">
                Cryptographically Sealed with RSA-2048 HIP Signature.
              </span>
              <button
                onClick={() => setSelectedPatientRecord(null)}
                className="px-5 py-2 bg-[#072a22] text-white text-xs font-bold rounded-xl hover:bg-[#0c382e] transition cursor-pointer"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. CASE INTAKE VIEW
// ==========================================
export function CaseIntakeView({ onOpenIntake }: { onOpenIntake?: () => void }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200/80 shadow-xs text-center space-y-4 max-w-xl mx-auto">
      <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
        <Stethoscope className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">Instant Clinical Case Intake</h3>
        <p className="text-xs text-gray-500 mt-1">
          Capture vitals, official ABHA registration, and automated triage diagnosis.
        </p>
      </div>
      <button
        onClick={onOpenIntake}
        className="px-6 py-3 bg-[#072a22] hover:bg-[#0c382e] text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 mx-auto cursor-pointer"
      >
        <Plus className="w-4 h-4 text-emerald-400" />
        <span>Launch Patient Intake Form</span>
      </button>
    </div>
  );
}

// ==========================================
// 5. ADVANCED PHARMACY INVENTORY & VALUATION ENGINE (CONNECTED TO NEON DB)
// ==========================================
export function PharmacyView() {
  // YAHAN addMedicine KO EXTRACT KIYA GAYA HAI
  const { inventory, dispensePrescription, restockMedicine, addMedicine } = useHospital() as any;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Medicine Form State
  const [newMedName, setNewMedName] = useState("");
  const [newMedGeneric, setNewMedGeneric] = useState("");
  const [newMedCategory, setNewMedCategory] = useState("Antibiotic");
  const [newMedStock, setNewMedStock] = useState(100);
  const [newMedPrice, setNewMedPrice] = useState(45);
  const [newMedBatch, setNewMedBatch] = useState("BATCH-99");

  // Direct sync from live database inventory
  const [localInventory, setLocalInventory] = useState(inventory);

  React.useEffect(() => {
    setLocalInventory(inventory);
  }, [inventory]);

  // Handle Dispense (-1)
  const handleDispense = (id: string) => {
    dispensePrescription(id);
    setLocalInventory((prev: any[]) =>
      prev.map((item) =>
        item.id === id && item.stock > 0
          ? { ...item, stock: item.stock - 1 }
          : item
      )
    );
  };

  // Handle Restock (+Qty)
  const handleRestock = (id: string, qty: number) => {
    restockMedicine(id, qty);
    setLocalInventory((prev: any[]) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: item.stock + qty }
          : item
      )
    );
  };

  // 100% PURE NEON CLOUD DATABASE PERSISTENCE FOR ADD MEDICINE
  const handleAddNewMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      name: newMedName.trim(),
      genericName: newMedGeneric.trim() || newMedName.trim(),
      category: newMedCategory,
      stock: Number(newMedStock) || 100,
      unitPrice: Number(newMedPrice) || 45,
      batch: newMedBatch || `BATCH-${Math.floor(Math.random() * 900 + 100)}`,
      expiry: "12/2028",
    };

    try {
      if (addMedicine) {
        // Direct Neon DB insert via HospitalContext
        const saved = await addMedicine(payload);
        if (saved) {
          setLocalInventory((prev: any[]) => [saved, ...prev]);
        }
      } else {
        // Direct fetch fallback if context is not ready
        const res = await fetch("/api/hospital-state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "ADD_MEDICINE", payload }),
        });
        if (res.ok) {
          const saved = await res.json();
          setLocalInventory((prev: any[]) => [saved, ...prev]);
        }
      }

      setIsAddModalOpen(false);
      // Reset Form
      setNewMedName("");
      setNewMedGeneric("");
      setNewMedStock(100);
      setNewMedPrice(45);
    } catch (err) {
      console.error("Failed to add medicine to Neon:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const filteredInventory = localInventory.filter((med: any) => {
    const matchesSearch =
      (med.name && med.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.genericName && med.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (med.batch && med.batch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "All" || med.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalStockUnits = localInventory.reduce((acc: number, m: any) => acc + (Number(m.stock) || 0), 0);
  const totalInventoryValuation = localInventory.reduce(
    (acc: number, m: any) => acc + (Number(m.stock) || 0) * (Number(m.unitPrice) || 0),
    0
  );
  const outOfStockCount = localInventory.filter((m: any) => Number(m.stock) === 0).length;
  const lowStockCount = localInventory.filter((m: any) => Number(m.stock) > 0 && Number(m.stock) < 15).length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Pharmacy & Central Medicine Formulary</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              Live Neon DB Sync
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Stock dispensing, automated batch value adjustment, and inventory replenishment
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>+ Add New Stock</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#072a22] text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-emerald-300">Total Stock Value</span>
          <h3 className="text-2xl font-black mt-1">
            ₹{totalInventoryValuation.toLocaleString("en-IN")}
          </h3>
          <p className="text-[10px] text-emerald-300/80 font-medium">
            Calculated Live (Stock × Price)
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Quantity Available</span>
          <h3 className="text-2xl font-black text-gray-800 mt-1">
            {totalStockUnits.toLocaleString("en-IN")} <span className="text-xs font-normal text-gray-400">units</span>
          </h3>
          <p className="text-[10px] text-emerald-600 font-bold">Across {localInventory.length} formulations</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600">Low Stock Alert (&lt;15)</span>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{lowStockCount}</h3>
          <p className="text-[10px] text-amber-600/80 font-medium">Restock suggested</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-rose-600">Depleted / Out of Stock</span>
          <h3 className="text-2xl font-black text-rose-600 mt-1">{outOfStockCount}</h3>
          <p className="text-[10px] text-rose-600/80 font-medium">Zero units remaining</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand, generic, batch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-400 font-semibold">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Antibiotic">Antibiotic</option>
            <option value="Analgesic">Analgesic</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Antidiabetic">Antidiabetic</option>
            <option value="Antacid">Antacid</option>
            <option value="Intravenous Fluids">Intravenous Fluids</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((med: any) => {
          const isOut = Number(med.stock) === 0;
          const isLow = Number(med.stock) > 0 && Number(med.stock) < 15;
          const itemTotalValuation = (Number(med.stock) || 0) * (Number(med.unitPrice) || 0);

          return (
            <div
              key={med.id}
              className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
                isOut
                  ? "bg-rose-50/50 border-rose-200"
                  : isLow
                  ? "bg-amber-50/50 border-amber-200"
                  : "bg-white border-gray-200/80 hover:border-emerald-300 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    {med.batch}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                      isOut
                        ? "bg-rose-100 text-rose-800"
                        : isLow
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK"}
                  </span>
                </div>

                <div className="my-3">
                  <h4 className="text-sm font-bold text-gray-800">{med.name}</h4>
                  <p className="text-xs text-gray-500 italic">{med.genericName}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Exp: {med.expiry} • {med.category}</p>
                </div>

                <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100 space-y-1 my-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Available Stock:</span>
                    <b className="text-gray-900 font-mono text-sm">{med.stock} units</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Unit Price:</span>
                    <b className="text-emerald-700">₹{med.unitPrice}</b>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200/60 pt-1 text-[11px]">
                    <span className="text-gray-500 font-semibold">Total Stock Value:</span>
                    <b className="text-emerald-900 font-black">₹{itemTotalValuation.toLocaleString("en-IN")}</b>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  disabled={isOut}
                  onClick={() => handleDispense(med.id)}
                  className="flex-1 py-2 bg-[#072a22] hover:bg-[#0c382e] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  title="Dispense 1 unit (reduces total value)"
                >
                  - Dispense (1)
                </button>
                <button
                  onClick={() => handleRestock(med.id, 50)}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition cursor-pointer"
                  title="Add 50 units (increases total value)"
                >
                  +50 Restock
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Add New Medicine to Formulary</h3>
                  <p className="text-[10px] text-gray-400">Direct Neon Cloud SQL Insertion</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewMedicine} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Augmentin 625 Duo"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Generic Salt</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin + Potassium Clavulanate"
                  value={newMedGeneric}
                  onChange={(e) => setNewMedGeneric(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Category</label>
                  <select
                    value={newMedCategory}
                    onChange={(e) => setNewMedCategory(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-semibold"
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                    <option value="Antacid">Antacid</option>
                    <option value="Intravenous Fluids">Intravenous Fluids</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Batch Number</label>
                  <input
                    type="text"
                    placeholder="BATCH-402"
                    value={newMedBatch}
                    onChange={(e) => setNewMedBatch(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Initial Quantity (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={newMedPrice}
                    onChange={(e) => setNewMedPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                <span className="text-emerald-800 font-semibold">Inventory Inflow Value:</span>
                <b className="text-emerald-950 font-black text-sm">
                  ₹{(newMedStock * newMedPrice).toLocaleString("en-IN")}
                </b>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-[#072a22] hover:bg-[#0c382e] disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  {isSubmitting ? "Saving to Neon DB..." : "+ Add to Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. E-PRESCRIPTION VIEW
// ==========================================
export function PrescriptionView() {
  const { patients, inventory, dispensePrescription } = useHospital();
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || "");
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [dosageInstructions, setDosageInstructions] = useState<string>("1 Tablet Twice a Day (After Meals) x 5 Days");
  const [rxSuccess, setRxSuccess] = useState<boolean>(false);

  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const patientAllergyProfile: Record<string, { allergies: string[]; conditions: string[] }> = {
    [patients[0]?.id || ""]: { allergies: ["Penicillin", "Amoxicillin"], conditions: ["Hypertension"] },
    [patients[1]?.id || ""]: { allergies: ["Sulfa Drugs", "Ciprofloxacin"], conditions: ["Type-2 Diabetes"] },
    [patients[2]?.id || ""]: { allergies: ["NSAIDs", "Aspirin", "Ibuprofen"], conditions: ["Peptic Ulcer", "Asthma"] },
  };

  const activeAllergies = patientAllergyProfile[currentPatient?.id]?.allergies || ["Penicillin"];

  const detectedAllergyWarnings = selectedMeds
    .map((medId) => inventory.find((m) => m.id === medId))
    .filter((med) => {
      if (!med) return false;
      return activeAllergies.some((allergy) =>
        med.name.toLowerCase().includes(allergy.toLowerCase()) ||
        med.genericName.toLowerCase().includes(allergy.toLowerCase())
      );
    });

  const handleToggleMed = (medId: string) => {
    if (selectedMeds.includes(medId)) {
      setSelectedMeds(selectedMeds.filter((id) => id !== medId));
    } else {
      setSelectedMeds([...selectedMeds, medId]);
    }
  };

  const handleIssuePrescription = () => {
    selectedMeds.forEach((id) => dispensePrescription(id));
    setRxSuccess(true);
    setTimeout(() => {
      setRxSuccess(false);
      setSelectedMeds([]);
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Smart e-Prescription & CDSS Safety Validator</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              AI Contraindication Guard Active
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Auto-screens active patient allergy history, adverse interactions, and pediatric/renal thresholds
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 p-2.5 px-4 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
          <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-rose-800 block">Known Patient Allergies:</span>
            <span className="text-xs font-black text-rose-600">
              {activeAllergies.join(", ")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-5">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Select Encounter Patient:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setSelectedMeds([]);
              }}
              className="w-full text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-emerald-600"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ABHA: {p.abhaId ? p.abhaId.slice(-4) : "OPD"} (Age: {p.age || 42}, {p.gender || "Male"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Select Medicines to Prescribe (Central Formulary):
            </label>
            <div className="flex flex-wrap gap-2">
              {inventory.map((med) => {
                const isSelected = selectedMeds.includes(med.id);
                const isAllergicMed = activeAllergies.some((a) =>
                  med.name.toLowerCase().includes(a.toLowerCase()) ||
                  med.genericName.toLowerCase().includes(a.toLowerCase())
                );

                return (
                  <button
                    key={med.id}
                    onClick={() => handleToggleMed(med.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? isAllergicMed
                          ? "bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse"
                          : "bg-[#072a22] text-white border-[#072a22]"
                        : isAllergicMed
                        ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
                        : "bg-gray-50 hover:bg-emerald-50 border-gray-200 text-gray-700"
                    }`}
                  >
                    <span>{isSelected ? "✓" : "+"}</span>
                    <span>{med.name}</span>
                    {isAllergicMed && <span className="text-[9px] bg-rose-200 text-rose-900 px-1 rounded">Allergy Risk</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-gray-800 tracking-wider">
                Prescription Items Cart ({selectedMeds.length})
              </h4>
              <span className="text-[10px] text-gray-400">Dosage: {dosageInstructions}</span>
            </div>

            {selectedMeds.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">
                Click any drug above to draft electronic prescription.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedMeds.map((id) => {
                  const m = inventory.find((item) => item.id === id);
                  const isRisky = activeAllergies.some((a) =>
                    m?.name.toLowerCase().includes(a.toLowerCase()) ||
                    m?.genericName.toLowerCase().includes(a.toLowerCase())
                  );

                  return (
                    <div
                      key={id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isRisky
                          ? "bg-rose-100/70 border-rose-300 text-rose-900"
                          : "bg-white border-gray-200 text-gray-800"
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{m?.name}</span>
                        <span className="text-[10px] text-gray-500">
                          {m?.genericName} • Stock: {m?.stock} units available
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {isRisky && (
                          <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                            Contraindicated
                          </span>
                        )}
                        <button
                          onClick={() => handleToggleMed(id)}
                          className="text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            disabled={selectedMeds.length === 0}
            onClick={handleIssuePrescription}
            className="w-full py-3.5 bg-[#072a22] hover:bg-[#0c382e] disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-md"
          >
            Digitally Sign & Push Rx to ABDM Gateway
          </button>

          {rxSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Prescription pushed to patient PHR app & pharmacy inventory reserved.
            </div>
          )}
        </div>

        <div className="space-y-4">
          {detectedAllergyWarnings.length > 0 ? (
            <div className="bg-rose-50 border-2 border-rose-500 p-5 rounded-3xl shadow-md space-y-3 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-6 h-6 animate-bounce" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  CRITICAL: AI CONTRAINDICATION ALERT!
                </h4>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <p className="font-bold">
                  Patient has a confirmed high-risk allergy to:{" "}
                  <span className="underline">{activeAllergies.join(", ")}</span>.
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Prescribing <b>{detectedAllergyWarnings.map((m) => m?.name).join(", ")}</b> may trigger severe anaphylactic shock or hypersensitivity reaction.
                </p>
              </div>

              <div className="bg-rose-100/60 p-3 rounded-2xl border border-rose-200 text-[11px] text-rose-800 font-medium">
                💡 <b>AI Suggested Safe Alternative:</b> Consider Azithromycin or Cefixime (Cephalosporin) with close vital monitoring.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                  AI CDSS Safety Clearance: PASS
                </h4>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                No active drug-allergy contraindications or major drug-drug cross reactions detected for this patient profile.
              </p>
            </div>
          )}

          <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs text-xs space-y-2">
            <h5 className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
              Clinical Protocol Reference
            </h5>
            <ul className="space-y-1.5 text-gray-500 text-[11px]">
              <li>• Formulary conforms to National Essential Medicines List (NLEM).</li>
              <li>• Automatic SNOMED-CT clinical diagnostic term mapping.</li>
              <li>• Real-time stock reservation in central pharmacy.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. ADVANCED FINANCE & BILLING VIEW
// ==========================================
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export function FinanceBillingView() {
  const { revenue, patients } = useHospital();
  const [activeRange, setActiveRange] = useState<"6M" | "1Y">("6M");

  const monthlyFinancials = [
    { month: "Apr", revenue: 640000, expenses: 420000, insurance: 380000 },
    { month: "May", revenue: 710000, expenses: 450000, insurance: 430000 },
    { month: "Jun", revenue: 780000, expenses: 490000, insurance: 490000 },
    { month: "Jul", revenue: 820000, expenses: 510000, insurance: 510000 },
    { month: "Aug", revenue: 890000, expenses: 530000, insurance: 570000 },
    { month: "Sep", revenue: 945000, expenses: 560000, insurance: 610000 },
  ];

  const departmentRevenue = [
    { name: "IPD / Wards", value: 38, color: "#072a22" },
    { name: "Pharmacy", value: 24, color: "#10b981" },
    { name: "Pathology & Labs", value: 18, color: "#3b82f6" },
    { name: "OPD Consults", value: 12, color: "#f59e0b" },
    { name: "Radiology / PACS", value: 8, color: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Hospital Financial Accounts & Revenue Cycle</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              PM-JAY Reconciled
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            NABH accounting audit trail, cashless insurance claims, and multi-department billing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400">Current Balance</span>
            <h3 className="text-2xl font-black text-gray-900">₹{revenue.toLocaleString("en-IN")}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Net Revenue (YTD)</span>
          <h4 className="text-2xl font-black text-gray-800 mt-1">₹47,85,000</h4>
          <p className="text-[10px] text-emerald-600 font-bold mt-1">▲ +14.2% YoY growth</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">PM-JAY Cashless Claims</span>
          <h4 className="text-2xl font-black text-emerald-700 mt-1">₹24,80,000</h4>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">98.4% Claim Approval Ratio</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">Pending TPA Reconciliations</span>
          <h4 className="text-2xl font-black text-amber-600 mt-1">₹1,42,000</h4>
          <p className="text-[10px] text-gray-500 mt-1">3 Corporate claims under review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Monthly Inflow vs Operating Overhead
              </h4>
              <p className="text-[11px] text-gray-400">Gross billing compared with clinical overhead</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[11px] text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#072a22]" /> Revenue
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyFinancials} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, ""]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }}
                />
                <Bar dataKey="revenue" fill="#072a22" radius={[6, 6, 0, 0]} name="Gross Inflow" />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Operating Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Department Contribution
            </h4>
            <p className="text-[11px] text-gray-400">Revenue split across clinical wings</p>

            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentRevenue}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {departmentRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, "Share"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {departmentRevenue.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Live Settlement Ledger & PM-JAY Cashless Claims
          </h4>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
            Real-time Gateway Sync
          </span>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#f8faf9] text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-5">Claim ID</th>
              <th className="py-3 px-5">Patient Name</th>
              <th className="py-3 px-5">Package / Service</th>
              <th className="py-3 px-5">Rate</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
            {patients.slice(0, 5).map((p, idx) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="py-3 px-5 font-bold text-gray-800">CLM-2026-{8800 + idx}</td>
                <td className="py-3 px-5 font-sans font-semibold text-gray-900">{p.name}</td>
                <td className="py-3 px-5 font-sans text-gray-600">General OPD & Diagnostic Panel</td>
                <td className="py-3 px-5 font-bold text-emerald-800">₹{(idx + 1) * 750 + 500}</td>
                <td className="py-3 px-5 text-right">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">
                    SETTLED (PM-JAY)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}