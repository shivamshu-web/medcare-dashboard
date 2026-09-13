"use client";

import React, { useState } from "react";
import {
  Siren,
  BedDouble,
  FlaskConical,
  CheckCircle2,
  X,
  Send,
  Flame,
  Car,
  HeartCrack,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_PRESETS = [
  {
    id: "cardiac",
    name: "Cardiac Arrest / STEMI",
    icon: HeartCrack,
    defaultWard: "ICU",
    statLab: ["STAT 12-Lead ECG", "Troponin-I (High Sens)", "Serum Electrolytes", "ABG"],
    severity: "Crash / Level 1",
  },
  {
    id: "road_accident",
    name: "Road Accident (Polytrauma)",
    icon: Car,
    defaultWard: "Emergency",
    statLab: ["Crossmatch & 4U PRBC", "Whole Body CT", "eFAST USG", "Coagulation PT/INR"],
    severity: "Stat Resuscitation",
  },
  {
    id: "acid_burn",
    name: "Acid Burn / Severe Chemical Burn",
    icon: Flame,
    defaultWard: "Burn",
    statLab: ["Lactate & Anion Gap", "Saline Decontamination", "ABG Carbon Monoxide", "Renal Panel"],
    severity: "Immediate Critical Care",
  },
];

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  const { beds, setBeds, refreshPatients, patients } = useHospital() as any;

  const [selectedCase, setSelectedCase] = useState(EMERGENCY_PRESETS[0]);
  
  // Detailed Clinical Intake Fields
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState<number | "">(35);
  const [patientGender, setPatientGender] = useState<"Male" | "Female" | "Other">("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [contactNo, setContactNo] = useState("9876543210");
  const [initialVitals, setInitialVitals] = useState("BP 80/50, SpO2 88%, Pulse 130");

  // Filter available beds from real hospital context
  const availableBeds = beds?.filter((b: any) => b.status === "Available") || [];
  const [selectedBedId, setSelectedBedId] = useState<string>("");

  const [selectedLabs, setSelectedLabs] = useState<string[]>(EMERGENCY_PRESETS[0].statLab);
  const [isDispatched, setIsDispatched] = useState(false);

  // Sync initial bed selection
  React.useEffect(() => {
    if (availableBeds.length > 0 && !selectedBedId) {
      setSelectedBedId(availableBeds[0].id || availableBeds[0].bedNumber);
    }
  }, [availableBeds, selectedBedId]);

  if (!isOpen) return null;

  const handleSelectCase = (preset: typeof EMERGENCY_PRESETS[0]) => {
    setSelectedCase(preset);
    setSelectedLabs(preset.statLab);
  };

  const toggleLab = (lab: string) => {
    setSelectedLabs((prev) =>
      prev.includes(lab) ? prev.filter((item) => item !== lab) : [...prev, lab]
    );
  };
  const handleDispatch = async () => {
    const finalName =
      patientName.trim() || `ER Patient (${selectedCase.name.split("/")[0]})`;
    const finalAge = typeof patientAge === "number" ? patientAge : 35;
    const emergencyAbha = `ABHA-ER-${Math.floor(1000 + Math.random() * 9000)}`;

    // Target bed dhundhna (safe property check)
    const targetBed =
      beds?.find(
        (b: any) =>
          b.id === selectedBedId ||
          b.bedNumber === selectedBedId ||
          b.number === selectedBedId
      ) || availableBeds[0];

    const targetBedLabel = targetBed
      ? (targetBed as any).bedNumber ||
        (targetBed as any).number ||
        targetBed.id
      : selectedBedId || "ER-BED-01";

    const newPatientPayload = {
      name: finalName,
      age: finalAge,
      gender: patientGender,
      contact: contactNo,
      bloodGroup: bloodGroup,
      abhaId: emergencyAbha,
      complaint: `[CODE RED ER] ${selectedCase.name}`,
      diagnosis: selectedCase.name,
      vitals: initialVitals,
      treatment: `STAT: ${selectedLabs.join(", ")}`,
      bedNumber: targetBedLabel,
      status: "Admitted",
    };

    // 1. API Call: SQLite Database mein patient save karein
    try {
      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPatientPayload),
      });
    } catch (err) {
      console.warn("DB persistence warning:", err);
    }

    // 2. HospitalContext Occupy Bed (Direct state update bina TS error ke)
    if (setBeds) {
      setBeds((prevBeds: any[]) =>
        prevBeds.map((b: any) => {
          const isMatch =
            b.id === targetBed?.id ||
            b.id === selectedBedId ||
            (b as any).bedNumber === targetBedLabel ||
            (b as any).number === targetBedLabel;

          if (isMatch) {
            return {
              ...b,
              status: "Occupied",
              patientName: finalName,
              patient: finalName,
              diagnosis: selectedCase.name,
              condition: "Critical (Code Red)",
            };
          }
          return b;
        })
      );
    }

    // 3. Fallback Storage Sync: WardsView ke instant refresh ke liye
    try {
      const allocatedBedData = {
        bedNumber: targetBedLabel,
        patientName: finalName,
        condition: "Critical (Code Red)",
        diagnosis: selectedCase.name,
        status: "Occupied",
        allocatedAt: new Date().toLocaleTimeString(),
      };
      const existing = JSON.parse(
        localStorage.getItem("emergency_allocated_beds") || "[]"
      );
      localStorage.setItem(
        "emergency_allocated_beds",
        JSON.stringify([allocatedBedData, ...existing])
      );
      window.dispatchEvent(new Event("emergency_bed_update"));
    } catch (e) {
      console.error(e);
    }

    // 4. Patient table refresh trigger
    if (refreshPatients) {
      refreshPatients();
    }

    // 5. Success UI state & auto close
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 2000);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-rose-300 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl animate-pulse">
              <Siren className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight uppercase">
                  Code Red: Clinical Emergency Intake
                </h2>
                <span className="bg-rose-950/50 text-rose-200 border border-rose-300/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  Direct Ward Sync
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-0.5">
                Detailed Emergency Record & Real-time Bed Allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition cursor-pointer text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDispatched ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              Emergency Case Admitted & Bed Locked!
            </h3>
            <div className="text-xs text-gray-600 max-w-md space-y-1.5 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-left">
              <p><b>Patient:</b> {patientName || `Emergency Patient (${selectedCase.name})`}</p>
              <p><b>Age / Gender:</b> {patientAge} Yrs • {patientGender} • ({bloodGroup})</p>
              <p><b>Assigned Bed:</b> <span className="text-emerald-700 font-bold">{selectedBedId} (Occupied)</span></p>
              <p><b>Condition:</b> {selectedCase.name}</p>
              <p><b>STAT Labs:</b> {selectedLabs.join(", ")}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* 1. Condition Selector */}
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                1. Select Emergency Case Condition
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EMERGENCY_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedCase.id === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectCase(preset)}
                      className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-rose-600 bg-rose-50/70 text-rose-950 font-bold ring-2 ring-rose-400/30"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-rose-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold leading-tight">{preset.name}</span>
                      </div>
                      <span className="text-[10px] text-rose-600 font-semibold">{preset.severity}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Detailed Patient Intake Form */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <label className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-rose-600" /> 2. Clinical Intake Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <span className="text-[11px] font-bold text-gray-600 block mb-1">Patient Full Name</span>
                  <input
                    type="text"
                    placeholder="e.g. Acid Trauma Intake / Jane Doe"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1">Age (Numeric)</span>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    placeholder="Years"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1">Gender</span>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1">Blood Group</span>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-gray-600 block mb-1">Emergency Contact</span>
                  <input
                    type="text"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-600 block mb-1">Initial Resuscitation Vitals</span>
                <input
                  type="text"
                  value={initialVitals}
                  onChange={(e) => setInitialVitals(e.target.value)}
                  placeholder="e.g. BP 90/60, SpO2 91%, Pulse 118"
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* 3. Real Wards Bed Allocation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-emerald-600" /> 3. Select Ward Bed to Allocate (Real Inventory)
                </label>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {availableBeds.length} Beds Free
                </span>
              </div>

              {availableBeds.length === 0 ? (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> No empty beds in inventory. Emergency spillover bed will be assigned.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {availableBeds.map((bed: any) => {
                    const bedIdentifier = bed.bedNumber || bed.id;
                    const isSelected = selectedBedId === bedIdentifier || selectedBedId === bed.id;
                    return (
                      <button
                        key={bed.id}
                        type="button"
                        onClick={() => setSelectedBedId(bed.id || bed.bedNumber)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/30"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-xs font-bold">{bedIdentifier}</span>
                        <span className="text-[10px] text-gray-400">{bed.ward || "General/ICU Ward"}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. STAT Labs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                  <FlaskConical className="w-4 h-4 text-purple-600" /> 4. STAT Diagnostics Orders
                </label>
                <span className="text-[10px] text-gray-400">Toggle as needed</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {selectedCase.statLab.map((lab) => {
                  const active = selectedLabs.includes(lab);
                  return (
                    <button
                      key={lab}
                      type="button"
                      onClick={() => toggleLab(lab)}
                      className={`p-2 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${
                        active
                          ? "border-purple-500 bg-purple-50 text-purple-950 font-bold"
                          : "border-gray-200 bg-gray-50 text-gray-400"
                      }`}
                    >
                      <span className="truncate">{lab}</span>
                      <span className="text-[8px] px-1 py-0.5 rounded font-bold uppercase bg-purple-200 text-purple-800 shrink-0">
                        STAT
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDispatch}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Send className="w-4 h-4" /> Save Patient Case & Occupy Selected Bed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}