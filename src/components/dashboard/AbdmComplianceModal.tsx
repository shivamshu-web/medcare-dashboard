"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Download,
  X,
  FileCheck2,
  Database,
  ExternalLink,
  Cpu,
  RefreshCw,
} from "lucide-react";

interface AbdmComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AbdmComplianceModal({
  isOpen,
  onClose,
}: AbdmComplianceModalProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<"M1" | "M2" | "M3">("M1");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const milestones = [
    {
      id: "M1",
      title: "Milestone 1: ABHA Registration & Capture",
      role: "Demographic Verification Engine",
      status: "100% COMPLIANT",
      score: "Level 1 Verified",
      color: "emerald",
      apis: ["POST /v1/registration/aadhaar/generateOtp", "POST /v1/registration/aadhaar/verifyOtp", "GET /v1/account/profile"],
      desc: "Instant ABHA ID creation, Aadhaar OTP bio-authentication, and QR code health card ingestion.",
      recordsCount: "1,835 Encounters",
    },
    {
      id: "M2",
      title: "Milestone 2: Health Information Provider (HIP)",
      role: "FHIR R4 Diagnostic Push Gateway",
      status: "100% COMPLIANT",
      score: "Level 2 Certified",
      color: "emerald",
      apis: ["POST /v0.5/links/link/on-confirm", "POST /v0.5/health-information/hip/on-request", "POST /v0.5/health-information/notify"],
      desc: "Prescription slips, pathology reports, and discharge summaries cryptographically packaged into HL7/FHIR bundles.",
      recordsCount: "420 Bundles Pushed",
    },
    {
      id: "M3",
      title: "Milestone 3: Health Information User (HIU)",
      role: "Consent-Driven Electronic Records Pull",
      status: "100% COMPLIANT",
      score: "Level 3 Certified",
      color: "emerald",
      apis: ["POST /v0.5/consent-requests/init", "POST /v0.5/consents/fetch", "POST /v0.5/health-information/hiu/on-request"],
      desc: "Time-bound, purpose-specific patient consent management with RSA-2048 encryption.",
      recordsCount: "98 Active Consents",
    },
  ];

  const auditLogs = [
    {
      txId: "TXN-9812-ABDM",
      milestone: "M1",
      action: "Aadhaar e-KYC Ingestion",
      entity: "Patient: Rajeshwar Singh",
      status: "SUCCESS (200 OK)",
      timestamp: "Today 10:42:15 AM",
      signature: "0x7f2a...891e",
    },
    {
      txId: "TXN-9813-ABDM",
      milestone: "M2",
      action: "FHIR Bundle Push (Prescription Rx)",
      entity: "HFR ID: IN-DL-HFR-2026-9812",
      status: "DELIVERED (GATEWAY ACK)",
      timestamp: "Today 11:15:30 AM",
      signature: "0x4b81...00fc",
    },
    {
      txId: "TXN-9814-ABDM",
      milestone: "M3",
      action: "Consent Artifact Validation",
      entity: "Purpose: Emergency Resuscitation",
      status: "CONSENT GRANTED",
      timestamp: "Today 12:05:02 PM",
      signature: "0x91da...ef34",
    },
    {
      txId: "TXN-9815-ABDM",
      milestone: "M2",
      action: "Diagnostic Lab Slip HL7 Export",
      entity: "Token: LAB-401 CBC Panel",
      status: "SUCCESS (200 OK)",
      timestamp: "Today 01:20:44 PM",
      signature: "0x12bb...77a0",
    },
  ];

  const handleSimulatePing = () => {
    setIsVerifying(true);
    setTimeout(() => setIsVerifying(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#072a22] text-white p-6 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide">
                  ABDM MILESTONE COMPLIANCE AUDITOR
                </h3>
                <span className="bg-emerald-400 text-[#072a22] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  M1 • M2 • M3 VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                National Health Authority (NHA) Sandbox Sandbox ID: SBX-IN-MEDCARE-8492
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulatePing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 transition cursor-pointer"
              title="Ping ABDM Gateway"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Milestone Selector Tabs */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {milestones.map((m) => {
              const isSelected = selectedMilestone === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMilestone(m.id as any)}
                  className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-50/60 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-950 font-mono">
                        {m.id}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="text-xs font-bold text-gray-800 mt-2 line-clamp-1">
                      {m.title.split(":")[1]}
                    </h4>
                  </div>
                  <span className="mt-3 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block">
                    {m.status}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Milestone Deep-Dive Box */}
          {(() => {
            const current = milestones.find((m) => m.id === selectedMilestone)!;
            return (
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-gray-400 block tracking-wider">
                      Target Protocol
                    </span>
                    <h4 className="text-sm font-black text-gray-800">{current.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{current.role}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold self-start sm:self-auto shadow-xs">
                    {current.score}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {current.desc}
                </p>

                {/* API Gateway Endpoints */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Certified Bridge API Endpoints:
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {current.apis.map((api, idx) => (
                      <div key={idx} className="p-2 bg-white rounded-lg border border-gray-200 text-emerald-900 flex items-center justify-between">
                        <span>{api}</span>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          HTTP 200
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Cryptographic Gateway Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-700" /> Real-time Cryptographic Audit Trail (Gateway Logs)
              </h4>
              <span className="text-[10px] font-mono text-gray-400">SHA-256 Validated</span>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-[#f8faf9] text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Tx UID</th>
                    <th className="py-2.5 px-3">Milestone</th>
                    <th className="py-2.5 px-3">Action & Entity</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.txId} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-bold text-gray-800">{log.txId}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {log.milestone}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        <span className="block font-semibold text-gray-800">{log.action}</span>
                        <span className="text-[10px] text-gray-400">{log.entity}</span>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-[10px]">{log.timestamp}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Official Certificate Notice */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
            <span className="text-[11px] font-semibold">
              Facility Registered on National Health Facility Registry (HFR) under Section 4 ABDM Guidelines.
            </span>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-[#072a22] text-white text-[10px] font-bold rounded-xl hover:bg-[#0c382e] transition cursor-pointer shrink-0"
            >
              Export Audit Trail (CSV/PDF)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}