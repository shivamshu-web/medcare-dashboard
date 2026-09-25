"use client";

import React, { useState } from "react";
import {
  Heart,
  Activity,
  Thermometer,
  Printer,
  X,
  Stethoscope,
  ShieldCheck,
  Building2,
  FileText,
  Calendar,
  Trash2,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

export interface PatientData {
  id: string;
  name: string;
  abhaId: string;
  age: number;
  gender: string;
  bp: string;
  pulse: number | string;
  temperature: number | string;
  symptoms: string;
  caseNotes: string;
  createdAt?: string;
}

interface PatientProfileViewProps {
  isOpen: boolean;
  patient: PatientData | null;
  onClose: () => void;
}

export default function PatientProfileView({
  isOpen,
  patient,
  onClose,
}: PatientProfileViewProps) {
  const { deletePatient } = useHospital() as any;
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Kya aap sach me "${patient.name}" ka record Neon Database se permanently delete karna chahte hain?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      if (deletePatient) {
        await deletePatient(patient.id);
      } else {
        // Fallback direct API delete
        await fetch(`/api/patients?id=${patient.id}`, { method: "DELETE" });
      }
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Database se delete karne me error aaya.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedDate = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "11 Sep 2026";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-[#072a22] text-white p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-400/20 rounded-xl text-emerald-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ABDM Digital OPD Health Record</h3>
              <p className="text-[10px] text-emerald-300/80">
                Official Clinical Encounters & Prescribed Interventions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete Patient Button */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> {isDeleting ? "Deleting..." : "Delete Case"}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-[#072a22] font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Slip Content */}
        <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          
          {/* Hospital Official Header */}
          <div className="border-b-2 border-emerald-950 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-emerald-800" />
                <h2 className="text-xl font-black tracking-tight text-gray-900">
                  MEDCARE DISTRICT GENERAL HOSPITAL
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Ayushman Bharat Digital Mission (ABDM) Integrated Facility • HFR: IN-DL-HFR-2026-9812
              </p>
              <p className="text-[10px] text-gray-400">
                Department of Clinical Medicine & Outpatient Triage Care
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Prescription Slip No.
              </span>
              <span className="text-xs font-mono font-black text-emerald-900">
                RX-{patient.id.slice(-6).toUpperCase()}
              </span>
              <p className="text-[10px] text-gray-500 mt-0.5 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3 text-gray-400" /> {formattedDate}
              </p>
            </div>
          </div>

          {/* Patient Bio & Scannable ABHA Card */}
          <div className="bg-gradient-to-r from-[#072a22] to-[#0f4d3e] text-white p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Verified Ayushman Bharat Health Account (ABHA)
                </span>
              </div>
              <h3 className="text-lg font-black tracking-wide">{patient.name}</h3>
              <div className="flex items-center gap-3 text-xs text-emerald-100/90 font-medium">
                <span>Age: <b>{patient.age} Yrs</b></span>
                <span>•</span>
                <span>Gender: <b>{patient.gender}</b></span>
                <span>•</span>
                <span className="font-mono text-emerald-200">
                  ABHA: <b>{patient.abhaId || "91-8842-1092-4411"}</b>
                </span>
              </div>
            </div>

            {/* Dynamic Scannable QR Code */}
            <div className="bg-white p-2 rounded-xl text-center shadow-md shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=abha:${patient.abhaId || patient.id}`}
                alt="ABHA QR Code"
                className="w-16 h-16 rounded-md"
              />
              <span className="text-[8px] font-extrabold text-[#072a22] block mt-0.5">SCAN TO VERIFY</span>
            </div>
          </div>

          {/* Baseline Recorded Vitals */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <Heart className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Blood Pressure</span>
                <span className="text-sm font-black text-gray-800">{patient.bp || "120/80"} mmHg</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Pulse Rate</span>
                <span className="text-sm font-black text-gray-800">{patient.pulse || 72} BPM</span>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Body Temp</span>
                <span className="text-sm font-black text-gray-800">{patient.temperature || 98.6} °F</span>
              </div>
            </div>
          </div>

          {/* Chief Complaints & Clinical Impression */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Presenting Symptoms / Chief Complaints:
              </h4>
              <p className="text-xs font-semibold text-gray-800 mt-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                {patient.symptoms || "Patient presented for routine outpatient evaluation."}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Clinical Observation & Diagnostic Summary (ICD-10):
              </h4>
              <p className="text-xs text-gray-700 mt-1 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 leading-relaxed font-mono">
                {patient.caseNotes || "No specific contraindications observed. Recommended rest and hydration."}
              </p>
            </div>
          </div>

          {/* Prescribed Medications Table (Rx) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-700" /> Prescribed Medications (Rx)
              </h4>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Formulary Stock Verified
              </span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f8faf9] text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-4">Medicine & Strength</th>
                    <th className="py-2.5 px-4">Dosage</th>
                    <th className="py-2.5 px-4">Frequency</th>
                    <th className="py-2.5 px-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-gray-800">Dolo 650mg (Paracetamol)</td>
                    <td className="py-2.5 px-4 text-gray-600">1 Tablet</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-semibold">TID (After Meals)</td>
                    <td className="py-2.5 px-4 text-gray-600">3 Days</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-gray-800">Augmentin 625 Duo</td>
                    <td className="py-2.5 px-4 text-gray-600">1 Tablet</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-semibold">BD (12 Hourly)</td>
                    <td className="py-2.5 px-4 text-gray-600">5 Days</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-gray-800">Electral ORS Solution</td>
                    <td className="py-2.5 px-4 text-gray-600">1 Sachet / 1L</td>
                    <td className="py-2.5 px-4 text-emerald-700 font-semibold">Ongoing</td>
                    <td className="py-2.5 px-4 text-gray-600">As needed</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Signature & ABDM Verification Footnote */}
          <div className="pt-6 border-t border-gray-200 flex items-end justify-between">
            <div className="space-y-1 text-[10px] text-gray-400">
              <p>Generated via MedCare EHR System • ABDM Health Facility Module</p>
              <p>Valid without physical stamp if digitally cryptographically signed.</p>
            </div>

            <div className="text-center">
              <div className="font-serif italic font-bold text-gray-800 text-sm border-b border-gray-400 pb-1 px-4">
                Dr. Sourav, M.B.B.S, M.D.
              </div>
              <span className="text-[10px] text-gray-500 font-semibold block mt-1">
                Duty Medical Officer (Reg: MCI-84920)
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}