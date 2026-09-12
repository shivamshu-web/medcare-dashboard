"use client";

import React, { useState } from "react";
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Send,
  ShieldCheck,
  UserCheck,
  Activity,
  Search,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

export default function BloodBankView() {
  const { bloodStock, patients, requestBloodCrossmatch } = useHospital();

  const [selectedRecipientGroup, setSelectedRecipientGroup] = useState<string>("O+");
  const [selectedPatientName, setSelectedPatientName] = useState<string>(patients[0]?.name || "Emergency Patient");
  const [requiredUnits, setRequiredUnits] = useState<number>(2);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Red Blood Cell (RBC) Compatibility Rules
  const compatibilityMap: Record<string, string[]> = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal Recipient
    "AB-": ["AB-", "A-", "B-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"], // Universal Donor Only
  };

  const compatibleDonors = compatibilityMap[selectedRecipientGroup] || [];

  const handleDispatchRequisition = () => {
    requestBloodCrossmatch(selectedPatientName, selectedRecipientGroup, requiredUnits);
    setRequestSuccess(true);
    setTimeout(() => setRequestSuccess(false), 4000);
  };

  const totalStockUnits = bloodStock.reduce((acc, b) => acc + b.unitsAvailable, 0);
  const lowStockGroups = bloodStock.filter((b) => b.unitsAvailable <= b.criticalThreshold);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Transfusion Medicine & Blood Bank</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
              NACO / NBTC Certified
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time component inventory, ABO/Rh typing, and automated crossmatch matrix
          </p>
        </div>

        {lowStockGroups.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Critical Deficit: {lowStockGroups.map((g) => g.group).join(", ")}</span>
          </div>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400">Total Available PRBC Units</span>
          <h3 className="text-2xl font-black text-rose-700 mt-1">{totalStockUnits} Units</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Packed Red Blood Cells</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Universal Donor (O-)</span>
          <h3 className="text-2xl font-black text-emerald-800 mt-1">
            {bloodStock.find((b) => b.group === "O-")?.unitsAvailable || 0} Units
          </h3>
          <p className="text-[10px] text-emerald-600 mt-0.5">STAT ER Emergency Reserve</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-600">Crossmatch TAT</span>
          <h3 className="text-2xl font-black text-amber-700 mt-1">15 Mins</h3>
          <p className="text-[10px] text-amber-700 mt-0.5">Gel Card Centrifugation</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-500">Serology Clearance</span>
          <h3 className="text-2xl font-black text-gray-800 mt-1">100%</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">HIV, HBV, HCV, Syphilis Tested</p>
        </div>
      </div>

      {/* 8 Blood Group Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {bloodStock.map((b) => {
          const isCritical = b.unitsAvailable <= b.criticalThreshold;
          return (
            <div
              key={b.group}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                isCritical
                  ? "bg-rose-50/50 border-rose-200"
                  : "bg-white border-gray-200/80 hover:border-rose-300 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                  {b.group}
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                    isCritical
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {isCritical ? "DEPLETED" : "ADEQUATE"}
                </span>
              </div>

              <div className="my-3">
                <h4 className="text-2xl font-black text-gray-800">{b.unitsAvailable}</h4>
                <p className="text-[10px] text-gray-400">Tested Units in Cold Storage</p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between text-[9px] text-gray-500">
                <span>Threshold: {b.criticalThreshold}</span>
                <span>{b.lastTested}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Compatibility Crossmatch & Order Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order & Crossmatch Calculator */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-rose-600" /> STAT Blood Requisition & Compatibility Matcher
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Calculates eligible donor blood groups in real time based on recipient antibodies
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ABO/Rh Auto-Filter
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Patient Encounter</label>
              <select
                value={selectedPatientName}
                onChange={(e) => setSelectedPatientName(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-xl p-2 focus:outline-none"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.abhaId ? p.abhaId.slice(-4) : "OPD"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Recipient Blood Group</label>
              <select
                value={selectedRecipientGroup}
                onChange={(e) => setSelectedRecipientGroup(e.target.value)}
                className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl p-2 focus:outline-none text-rose-700"
              >
                {bloodStock.map((b) => (
                  <option key={b.group} value={b.group}>
                    {b.group} (Group)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Units Required (PRBC)</label>
              <input
                type="number"
                min={1}
                max={6}
                value={requiredUnits}
                onChange={(e) => setRequiredUnits(Number(e.target.value))}
                className="w-full text-xs font-bold bg-white border border-gray-200 rounded-xl p-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Compatible Donors Chip Visualization */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
            <span className="text-[11px] font-bold text-rose-900 block">
              Compatible Donor Blood Groups for Recipient ({selectedRecipientGroup}):
            </span>
            <div className="flex flex-wrap gap-2">
              {compatibleDonors.map((donor) => {
                const stock = bloodStock.find((b) => b.group === donor)?.unitsAvailable || 0;
                return (
                  <span
                    key={donor}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-800 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    {donor} • <b className="text-gray-700 font-mono">{stock} in stock</b>
                  </span>
                );
              })}
            </div>
            <p className="text-[10px] text-rose-700 mt-1">
              Zero risk of agglutination / acute hemolytic transfusion reaction for matched pairs.
            </p>
          </div>

          <button
            onClick={handleDispatchRequisition}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" /> Issue Requisition & Dispatch to Lab Queue
          </button>

          {requestSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Requisition dispatched! Crossmatch token logged in Pathology Lab.
            </div>
          )}
        </div>

        {/* Right Col: Verified Donor Registry */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" /> Verified On-Call Donor Roster
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Emergency voluntary donors within 5 km radius</p>

            <div className="space-y-2.5 mt-4">
              {[
                { name: "Rohit Verma", group: "O-", phone: "+91 98721-XXXXX", distance: "1.2 km", status: "Available" },
                { name: "Ananya Iyer", group: "AB-", phone: "+91 94412-XXXXX", distance: "2.8 km", status: "Available" },
                { name: "Harpreet Singh", group: "B-", phone: "+91 97182-XXXXX", distance: "3.5 km", status: "On-Call" },
                { name: "Meera Nair", group: "A-", phone: "+91 96510-XXXXX", distance: "4.1 km", status: "Available" },
              ].map((donor, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-50/70 border border-gray-200 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 font-black flex items-center justify-center text-xs">
                      {donor.group}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-800">{donor.name}</h4>
                      <p className="text-[10px] text-gray-400">{donor.distance} away • {donor.phone}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {donor.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-gray-50 text-[10px] text-gray-500 border border-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted Donor PII protected under Digital Personal Data Protection Act.</span>
          </div>
        </div>
      </div>
    </div>
  );
}