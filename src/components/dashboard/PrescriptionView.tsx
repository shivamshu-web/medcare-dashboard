"use client";

import React, { useState, useMemo } from "react";
import { useHospital } from "@/context/HospitalContext";
import {
  Activity,
  FileText,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  Pill,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  Building2,
  ShieldAlert,
  ShieldCheck,
  Info,
} from "lucide-react";

interface PrescribedDrug {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function PrescriptionView() {
  const { patients, inventory, dispensePrescription } = useHospital();

  // Selected Patient
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || ""
  );

  // Active Patient Demographics
  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Prescribed Drugs Basket
  const [prescriptionList, setPrescriptionList] = useState<PrescribedDrug[]>([
    {
      id: "M-01",
      name: "Dolo 650mg",
      genericName: "Paracetamol",
      dosage: "1 Tablet",
      frequency: "1-0-1 (Twice Daily)",
      duration: "5 Days",
      instructions: "After Food",
    },
  ]);

  // Form State
  const [rxNumber] = useState(`RX-${Math.floor(100000 + Math.random() * 900000)}`);
  const [clinicalDiagnosis, setClinicalDiagnosis] = useState(
    "Acute Upper Respiratory Tract Infection with High Pyrexia"
  );
  const [physicianAdvice, setPhysicianAdvice] = useState(
    "Adequate oral hydration. Avoid cold exposure. Review in OPD after 5 days if fever persists."
  );

  // Patient Documented Known Allergies
  const [patientAllergies, setPatientAllergies] = useState<string>(
    "Penicillin / Beta-Lactams, NSAIDs (Aspirin/Diclofenac)"
  );

  // Medicine Selection State
  const [selectedMedId, setSelectedMedId] = useState(inventory[0]?.id || "");
  const [dosage, setDosage] = useState("1 Tablet");
  const [frequency, setFrequency] = useState("1-0-1 (Twice Daily)");
  const [duration, setDuration] = useState("5 Days");
  const [instructions, setInstructions] = useState("After Food");
  const [isSaved, setIsSaved] = useState(false);

  // ==========================================
  // REAL-TIME AI CDS SAFETY GUARD ENGINE
  // ==========================================
  const aiSafetyAlerts = useMemo(() => {
    const alerts: {
      type: "ALLERGY_HAZARD" | "DRUG_INTERACTION" | "OVERDOSE_WARNING";
      severity: "CRITICAL" | "MODERATE" | "INFO";
      title: string;
      message: string;
      drugName: string;
    }[] = [];

    const lowerAllergies = (patientAllergies || "").toLowerCase();
    const currentMeds = prescriptionList.map((d) => d.name.toLowerCase());
    const currentGenerics = prescriptionList.map((d) => d.genericName.toLowerCase());

    prescriptionList.forEach((drug) => {
      const gName = drug.genericName.toLowerCase();
      const dName = drug.name.toLowerCase();

      // 1. ALLERGY CONTRAINDICATION AUDIT
      if (
        (lowerAllergies.includes("penicillin") || lowerAllergies.includes("beta-lactam")) &&
        (gName.includes("amoxicillin") || gName.includes("clavulanate") || dName.includes("augmentin") || gName.includes("ceftriaxone") || dName.includes("monocef"))
      ) {
        alerts.push({
          type: "ALLERGY_HAZARD",
          severity: "CRITICAL",
          title: "FATAL ALLERGY HAZARD: Beta-Lactam Anaphylaxis Risk",
          drugName: drug.name,
          message: `Patient has documented allergy to "${patientAllergies}". Prescribing ${drug.name} (${drug.genericName}) can trigger severe anaphylactic shock.`,
        });
      }

      if (
        lowerAllergies.includes("nsaid") &&
        (gName.includes("ibuprofen") || gName.includes("diclofenac") || dName.includes("combiflam") || dName.includes("dynapar"))
      ) {
        alerts.push({
          type: "ALLERGY_HAZARD",
          severity: "CRITICAL",
          title: "ALLERGY CONTRAINDICATION: NSAID Hypersensitivity",
          drugName: drug.name,
          message: `Patient has reported NSAID intolerance. ${drug.name} can cause acute bronchospasm or severe urticaria.`,
        });
      }

      // 2. DRUG-DRUG INTERACTIONS (DDI)
      if (
        (dName.includes("combiflam") || gName.includes("ibuprofen")) &&
        currentMeds.some((m) => m.includes("dolo") || m.includes("paracetamol"))
      ) {
        alerts.push({
          type: "DRUG_INTERACTION",
          severity: "MODERATE",
          title: "DUPLICATE PARACETAMOL TOXICITY",
          drugName: drug.name,
          message: `Concurrent prescription of ${drug.name} with Dolo 650mg exceeds the safe 4000mg/day hepatic threshold.`,
        });
      }

      if (
        (gName.includes("tramadol") || dName.includes("tramadol")) &&
        currentMeds.some((m) => m.includes("deriphyllin") || m.includes("theophylline"))
      ) {
        alerts.push({
          type: "DRUG_INTERACTION",
          severity: "MODERATE",
          title: "SEIZURE THRESHOLD INTERACTION",
          drugName: drug.name,
          message: `Combining Tramadol with Xanthines (Deriphyllin) significantly lowers the seizure threshold.`,
        });
      }
    });

    return alerts;
  }, [prescriptionList, patientAllergies]);

  const hasCriticalHazard = aiSafetyAlerts.some((a) => a.severity === "CRITICAL");

  const handleAddMedicine = () => {
    const med = inventory.find((m) => m.id === selectedMedId);
    if (!med) return;

    const newDrug: PrescribedDrug = {
      id: `${med.id}-${Date.now()}`,
      name: med.name,
      genericName: med.genericName,
      dosage,
      frequency,
      duration,
      instructions,
    };

    setPrescriptionList((prev) => [...prev, newDrug]);
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptionList((prev) => prev.filter((d) => d.id !== id));
  };

  const handleCommitPrescription = () => {
    if (hasCriticalHazard) {
      const confirmOverride = window.confirm(
        "CRITICAL CLINICAL ALERT: AI Safety Guard has detected a severe allergy or interaction hazard! Are you sure you want to clinically override this warning?"
      );
      if (!confirmOverride) return;
    }

    prescriptionList.forEach((drug) => {
      const baseMedId = drug.id.split("-")[0];
      dispensePrescription(baseMedId);
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#072a22] text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-800">
                  Digital E-Prescription Portal (ABDM M2)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-emerald-700" /> AI CDS Guard Active
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Real-Time Drug-Allergy & DDI Interaction Engine • NABH Compliant
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => window.print()}
            type="button"
            className="flex-1 md:flex-none px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            <span>Print Rx Slip</span>
          </button>
          <button
            onClick={handleCommitPrescription}
            type="button"
            className={`flex-1 md:flex-none px-5 py-2 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
              hasCriticalHazard
                ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                : "bg-[#072a22] hover:bg-emerald-950 text-emerald-300"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{hasCriticalHazard ? "Override & Dispense" : "Authorize & Dispense"}</span>
          </button>
        </div>
      </div>

      {/* AI CDS SAFETY GUARD INTERACTIVE ALERT FEED */}
      {aiSafetyAlerts.length > 0 ? (
        <div className="space-y-2">
          {aiSafetyAlerts.map((alert, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs animate-in slide-in-from-top duration-200 ${
                alert.severity === "CRITICAL"
                  ? "bg-rose-50/90 border-rose-300 text-rose-900"
                  : "bg-amber-50/90 border-amber-300 text-amber-900"
              }`}
            >
              <div
                className={`p-2 rounded-xl mt-0.5 ${
                  alert.severity === "CRITICAL"
                    ? "bg-rose-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-black tracking-tight uppercase text-[11px]">
                    {alert.title} — [{alert.drugName}]
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      alert.severity === "CRITICAL"
                        ? "bg-rose-200 text-rose-900"
                        : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {alert.severity} SAFETY VIOLATION
                  </span>
                </div>
                <p className="mt-1 font-medium leading-relaxed">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AI Clinical Safety Guard: No adverse drug interactions or allergy cross-sensitivities detected.</span>
          </div>
          <span className="text-[10px] text-emerald-700 uppercase font-mono">Status: Safe Rx</span>
        </div>
      )}

      {isSaved && (
        <div className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl flex items-center gap-3 border border-emerald-500/40 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-xs">
            Prescription successfully authorized! Drugs reserved and deducted from Central Pharmacy stock.
          </span>
        </div>
      )}

      {/* Main Grid: Left Builder & Right Print-Ready Slip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Drug Builder Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              1. Patient & Allergy Profile
            </h3>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Active In-Patient / OPD Case
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800"
              >
                {patients.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} ({pt.age}Y • {pt.gender}) - {pt.abhaId || pt.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-500" /> Documented Patient Allergies
                </label>
                <span className="text-[9px] text-gray-400">Audited by AI</span>
              </div>
              <input
                type="text"
                value={patientAllergies}
                onChange={(e) => setPatientAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa drugs, Aspirin"
                className="w-full p-2 bg-rose-50/50 border border-rose-200 rounded-xl text-xs font-bold text-rose-900"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Provisional Clinical Diagnosis
              </label>
              <input
                type="text"
                value={clinicalDiagnosis}
                onChange={(e) => setClinicalDiagnosis(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Add Drug Block */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" />
              2. Add Medication from Formulary
            </h3>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                Select Medicine (Pharmacy Live Stock)
              </label>
              <select
                value={selectedMedId}
                onChange={(e) => setSelectedMedId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
              >
                {inventory.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.genericName}) — Stock: {m.stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  <option value="1-0-1 (Twice Daily)">1-0-1 (Twice Daily)</option>
                  <option value="1-1-1 (Thrice Daily)">1-1-1 (Thrice Daily)</option>
                  <option value="1-0-0 (Morning Only)">1-0-0 (Morning Only)</option>
                  <option value="0-0-1 (Night Bedtime)">0-0-1 (Night Bedtime)</option>
                  <option value="STAT (Emergency Immediately)">STAT (Immediate)</option>
                  <option value="SOS (As needed when pain)">SOS (As Needed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  <option value="3 Days">3 Days</option>
                  <option value="5 Days">5 Days</option>
                  <option value="7 Days">7 Days</option>
                  <option value="14 Days">14 Days</option>
                  <option value="30 Days (Chronic)">30 Days (Chronic)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  Timing
                </label>
                <select
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  <option value="After Food">After Food</option>
                  <option value="Before Food (Empty Stomach)">Before Food</option>
                  <option value="With Warm Milk">With Warm Milk</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddMedicine}
              className="w-full mt-2 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Add to Rx Slip & Run AI Audit</span>
            </button>
          </div>

          {/* Advice */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase block">
              Doctor Dietary & Lifestyle Advice
            </label>
            <textarea
              rows={2}
              value={physicianAdvice}
              onChange={(e) => setPhysicianAdvice(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Official Hospital Prescription Slip (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 border border-gray-200/90 shadow-lg space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none">
            {/* Watermark */}
            <div className="absolute right-4 top-24 opacity-[0.03] pointer-events-none select-none">
              <Activity className="w-96 h-96 text-emerald-950" />
            </div>

            {/* Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-emerald-900/20 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-emerald-800" />
                  <h1 className="text-xl font-black text-gray-900 tracking-tight">
                    MEDCARE MULTISPECIALTY HOSPITAL
                  </h1>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  NABH Accredited • Ayushman Bharat Digital Mission (ABDM) Partner
                </p>
                <p className="text-[10px] text-gray-400">
                  Apollo Circle, Sector 12, Medical Corridor • 24/7 Helpline: 1800-419-8080
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <span className="font-mono font-black text-xs text-emerald-900 block">
                  {rxNumber}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  Date: {new Date().toLocaleDateString("en-IN")}
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> ABDM M2 Verified
                </span>
              </div>
            </div>

            {/* Patient Demographic Bar */}
            {currentPatient && (
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Patient Name</span>
                  <span className="font-bold text-gray-900">{currentPatient.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Age / Gender</span>
                  <span className="font-semibold text-gray-800">{currentPatient.age} Yrs / {currentPatient.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">ABHA ID</span>
                  <span className="font-mono font-bold text-emerald-900 text-[11px]">{currentPatient.abhaId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Vitals (BP/Pulse)</span>
                  <span className="font-mono text-gray-800 font-semibold">{currentPatient.bp || "120/80"} • {currentPatient.pulse || 72}bpm</span>
                </div>
              </div>
            )}

            {/* Diagnosis Line */}
            <div className="text-xs">
              <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block mb-0.5">
                Provisional Diagnosis:
              </span>
              <p className="font-bold text-gray-900 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                {clinicalDiagnosis}
              </p>
            </div>

            {/* Rx Medicine Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-[#072a22] font-serif">℞ (Prescription)</span>
                <span className="text-[11px] text-gray-400 font-semibold">
                  {prescriptionList.length} Items Prescribed
                </span>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Drug / Molecule</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                      <th className="py-2.5 px-2 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {prescriptionList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                          No medicines added.
                        </td>
                      </tr>
                    ) : (
                      prescriptionList.map((drug, idx) => (
                        <tr key={drug.id} className="hover:bg-emerald-50/20">
                          <td className="py-3 px-3 font-mono font-bold text-gray-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-black text-gray-900 text-xs">{drug.name}</div>
                            <div className="text-[10px] text-gray-400 italic">{drug.genericName}</div>
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-700">{drug.dosage}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-bold text-[10px] border border-emerald-100">
                              {drug.frequency}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-700">{drug.duration}</td>
                          <td className="py-3 px-3 text-[11px] text-gray-500 italic">{drug.instructions}</td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleRemoveMedicine(drug.id)}
                              className="p-1 text-gray-300 hover:text-rose-600 rounded transition cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Advice */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Dietary & General Instructions
              </span>
              <p className="text-xs text-gray-700 bg-gray-50/80 p-3 rounded-xl border border-gray-100 italic">
                {physicianAdvice}
              </p>
            </div>

            {/* Sign-off */}
            <div className="pt-6 border-t border-gray-200 flex items-end justify-between">
              <div className="space-y-1 text-[10px] text-gray-400">
                <p>• Emergency Revisit: 24/7 Casualty Wing</p>
                <p>• Refill Authorization Valid for 30 Days</p>
                <p className="font-mono text-emerald-800">Hash: 8a9f-33bc-medcare-rx</p>
              </div>

              <div className="text-right space-y-1">
                <div className="w-32 border-b border-gray-400 ml-auto pb-1 text-center font-serif text-xs italic text-gray-700">
                  Dr. Sourav Sharma
                </div>
                <p className="text-xs font-black text-gray-900">Dr. Sourav Sharma, MD</p>
                <p className="text-[10px] text-gray-500">Reg. No: MCI-2018-84291</p>
                <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded font-bold text-[9px]">
                  NMC Certified Digital Scribe
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}