"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { PatientData } from "@/components/dashboard/PatientProfileView";

export interface LabItem {
  token: string;
  test: string;
  patient: string;
  doctor: string;
  status: string;
  tat: string;
}

export interface AppointmentItem {
  id: string;
  patient: string;
  doctor: string;
  time: string;
  type: string;
  status: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  genericName: string;
  category: "Tablet" | "Capsule" | "Syrup" | "Injection" | "IV Fluid" | "Sachet";
  batch: string;
  stock: number;
  unitPrice: number;
  expiry: string;
}

export interface BedItem {
  id: string;
  ward: "ICU" | "General" | "Emergency" | "Private";
  number: string;
  status: "Available" | "Occupied" | "Cleaning";
  patientName?: string;
  abhaId?: string;
  admitTime?: string;
}

export interface BloodUnitItem {
  group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  unitsAvailable: number;
  criticalThreshold: number;
  lastTested: string;
}

interface HospitalContextType {
  patients: PatientData[];
  appointments: AppointmentItem[];
  labQueue: LabItem[];
  inventory: MedicineItem[];
  beds: BedItem[];
  bloodStock: BloodUnitItem[];
  revenue: number;
  loading: boolean;
  activeEmergency: boolean;
  dismissEmergency: () => void;
  refreshPatients: () => Promise<void>;
  addPatient: (newPt: PatientData) => Promise<boolean>;
  registerNewPatient: (newPt: PatientData) => Promise<boolean>;
  registerNewPatientWorkflow: (newPt: PatientData) => void;
  triggerEmergencyTriage: (traumaType: string, age: number, gender: string, notes: string) => void;
  dispensePrescription: (medId: string) => void;
  restockMedicine: (medId: string, qty?: number) => void;
  updateLabStatus: (token: string, newStatus: string) => void;
  admitPatientToBed: (bedId: string, patientName: string, abhaId: string) => void;
  dischargeBed: (bedId: string) => void;
  sanitizeBed: (bedId: string) => void;
  requestBloodCrossmatch: (patientName: string, bloodGroup: string, units: number) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
  // Safe Persistent Patient State
  const [patients, setPatients] = useState<PatientData[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("medcare_clinical_patients");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [
      {
        id: "PAT-1001",
        name: "Aarav Sharma",
        age: 28,
        gender: "Male",
        abhaId: "91-0021-3941-8910",
        bp: "120/80",
        pulse: 74,
        temperature: "98.4",
        symptoms: "Mild fever and sore throat",
        caseNotes: "Prescribed basic antipyretic. Rest advised.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "PAT-1002",
        name: "Sunita Devi",
        age: 52,
        gender: "Female",
        abhaId: "91-4451-2291-7782",
        bp: "140/90",
        pulse: 82,
        temperature: "98.6",
        symptoms: "Chronic joint stiffness and mild hypertension",
        caseNotes: "Advised regular BP monitoring and salt restriction.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "PAT-1003",
        name: "Rajeshwar Singh",
        age: 61,
        gender: "Male",
        abhaId: "91-8842-1092-4411",
        bp: "150/95",
        pulse: 88,
        temperature: "99.1",
        symptoms: "Chest heaviness and dyspnea on exertion",
        caseNotes: "Advised ECG, lipid panel, and cardiology consultation.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "PAT-1004",
        name: "Vikram Malhotra",
        age: 44,
        gender: "Male",
        abhaId: "91-9981-6652-3310",
        bp: "125/82",
        pulse: 76,
        temperature: "98.6",
        symptoms: "Productive cough and mild wheezing",
        caseNotes: "Chest clear. Prescribed bronchodilator syrup and steam.",
        createdAt: new Date().toISOString(),
      }
    ];
  });

  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(842500);
  const [activeEmergency, setActiveEmergency] = useState(false);

  // Original Complete Appointments List
  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    { id: "APT-101", patient: "Aarav Sharma", doctor: "Dr. Sourav", time: "10:30 AM", type: "General OPD", status: "Confirmed" },
    { id: "APT-102", patient: "Priya Mukherjee", doctor: "Dr. Anjali Rao", time: "11:15 AM", type: "Follow-up", status: "In Progress" },
    { id: "APT-103", patient: "Rajeshwar Singh", doctor: "Dr. Sourav", time: "12:00 PM", type: "Cardiology Consult", status: "Confirmed" },
    { id: "APT-104", patient: "Sunita Devi", doctor: "Dr. Verma", time: "02:30 PM", type: "Pathology Review", status: "Pending" },
    { id: "APT-105", patient: "Vikram Malhotra", doctor: "Dr. Sourav", time: "04:00 PM", type: "Pulmonology", status: "Confirmed" },
  ]);

  // Original Complete Lab Queue
  const [labQueue, setLabQueue] = useState<LabItem[]>([
    { token: "LAB-401", test: "Complete Blood Count (CBC)", patient: "Sunita Devi", doctor: "Dr. Sourav", status: "Sample Collected", tat: "45 mins" },
    { token: "LAB-402", test: "Lipid Profile & Serum Creatinine", patient: "Rajeshwar Singh", doctor: "Dr. Sourav", status: "Analysis Complete", tat: "Ready" },
    { token: "LAB-403", test: "Dengue NS1 Antigen Assay", patient: "Aarav Sharma", doctor: "Dr. Anjali", status: "Processing", tat: "1.5 hrs" },
  ]);

  // 20 Complete Pharmacy Inventory Medicines
  const [inventory, setInventory] = useState<MedicineItem[]>([
    { id: "M-01", name: "Dolo 650mg", genericName: "Paracetamol", category: "Tablet", batch: "BATCH-891", stock: 320, unitPrice: 32, expiry: "12/2027" },
    { id: "M-02", name: "Augmentin 625 Duo", genericName: "Amoxicillin + Clavulanate", category: "Tablet", batch: "BATCH-442", stock: 18, unitPrice: 195, expiry: "08/2026" },
    { id: "M-03", name: "Azithral 500mg", genericName: "Azithromycin", category: "Tablet", batch: "BATCH-501", stock: 42, unitPrice: 120, expiry: "11/2026" },
    { id: "M-04", name: "Pan 40mg Injection", genericName: "Pantoprazole Sodium", category: "Injection", batch: "BATCH-331", stock: 24, unitPrice: 55, expiry: "09/2027" },
    { id: "M-05", name: "Allegra 120mg", genericName: "Fexofenadine HCl", category: "Tablet", batch: "BATCH-119", stock: 180, unitPrice: 185, expiry: "04/2028" },
    { id: "M-06", name: "Ascoril-D Cough Syrup", genericName: "Dextromethorphan + Phenylephrine", category: "Syrup", batch: "BATCH-703", stock: 65, unitPrice: 140, expiry: "01/2027" },
    { id: "M-07", name: "Normal Saline (0.9% NS)", genericName: "Sodium Chloride IV", category: "IV Fluid", batch: "BATCH-108", stock: 85, unitPrice: 60, expiry: "10/2028" },
    { id: "M-08", name: "Electral Energy Sachet", genericName: "WHO Oral Rehydration Salts", category: "Sachet", batch: "BATCH-902", stock: 520, unitPrice: 22, expiry: "05/2028" },
    { id: "M-09", name: "Monocef 1g IV/IM", genericName: "Ceftriaxone Injection", category: "Injection", batch: "BATCH-612", stock: 32, unitPrice: 78, expiry: "07/2027" },
    { id: "M-10", name: "Metrogyl 400mg", genericName: "Metronidazole", category: "Tablet", batch: "BATCH-215", stock: 240, unitPrice: 24, expiry: "03/2028" },
    { id: "M-11", name: "Ringer Lactate (RL 500ml)", genericName: "Compound Sodium Lactate IV", category: "IV Fluid", batch: "BATCH-504", stock: 75, unitPrice: 72, expiry: "06/2028" },
    { id: "M-12", name: "Dynapar AQ 75mg", genericName: "Diclofenac Sodium 1ml", category: "Injection", batch: "BATCH-774", stock: 50, unitPrice: 38, expiry: "11/2027" },
    { id: "M-13", name: "Emeset 4mg", genericName: "Ondansetron Injection", category: "Injection", batch: "BATCH-542", stock: 65, unitPrice: 28, expiry: "05/2027" },
    { id: "M-14", name: "Deriphyllin Injection", genericName: "Theophylline + Etofylline 2ml", category: "Injection", batch: "BATCH-334", stock: 40, unitPrice: 22, expiry: "08/2027" },
    { id: "M-15", name: "Tramadol 50mg/ml", genericName: "Tramadol HCl STAT Ampoule", category: "Injection", batch: "BATCH-902", stock: 28, unitPrice: 65, expiry: "03/2027" },
    { id: "M-16", name: "Glycomet-GP 1 Forte", genericName: "Metformin 1000mg + Glimepiride", category: "Tablet", batch: "BATCH-677", stock: 190, unitPrice: 145, expiry: "09/2028" },
    { id: "M-17", name: "Telma 40", genericName: "Telmisartan 40mg", category: "Tablet", batch: "BATCH-431", stock: 210, unitPrice: 110, expiry: "12/2027" },
    { id: "M-18", name: "Atorva 20mg", genericName: "Atorvastatin Calcium", category: "Tablet", batch: "BATCH-229", stock: 135, unitPrice: 175, expiry: "10/2027" },
    { id: "M-19", name: "Combiflam", genericName: "Ibuprofen + Paracetamol", category: "Tablet", batch: "BATCH-890", stock: 260, unitPrice: 42, expiry: "02/2028" },
    { id: "M-20", name: "Adrenaline 1:1000", genericName: "Epinephrine 1mg STAT Ampoule", category: "Injection", batch: "BATCH-007", stock: 16, unitPrice: 45, expiry: "04/2027" },
  ]);

  // Original Complete 9 Beds Across 4 Wards
  const [beds, setBeds] = useState<BedItem[]>([
    { id: "B-101", ward: "Emergency", number: "ER-01", status: "Occupied", patientName: "Aarav Sharma", abhaId: "91-0021-3941-8910", admitTime: "08:15 AM" },
    { id: "B-102", ward: "Emergency", number: "ER-02", status: "Available" },
    { id: "B-103", ward: "ICU", number: "ICU-01", status: "Occupied", patientName: "Rajeshwar Singh", abhaId: "91-8842-1092-4411", admitTime: "04:30 AM" },
    { id: "B-104", ward: "ICU", number: "ICU-02", status: "Cleaning" },
    { id: "B-105", ward: "General", number: "GEN-01", status: "Occupied", patientName: "Sunita Devi", abhaId: "91-4451-2291-7782", admitTime: "Yesterday" },
    { id: "B-106", ward: "General", number: "GEN-02", status: "Available" },
    { id: "B-107", ward: "General", number: "GEN-03", status: "Available" },
    { id: "B-108", ward: "Private", number: "PVT-101", status: "Occupied", patientName: "Vikram Malhotra", abhaId: "91-9981-6652-3310", admitTime: "09:45 AM" },
    { id: "B-109", ward: "Private", number: "PVT-102", status: "Available" },
  ]);

  // Original Complete 8 Blood Groups
  const [bloodStock, setBloodStock] = useState<BloodUnitItem[]>([
    { group: "A+", unitsAvailable: 14, criticalThreshold: 5, lastTested: "Today 06:00 AM" },
    { group: "A-", unitsAvailable: 3, criticalThreshold: 4, lastTested: "Yesterday" },
    { group: "B+", unitsAvailable: 18, criticalThreshold: 5, lastTested: "Today 08:30 AM" },
    { group: "B-", unitsAvailable: 2, criticalThreshold: 3, lastTested: "Yesterday" },
    { group: "AB+", unitsAvailable: 9, criticalThreshold: 3, lastTested: "Today 09:15 AM" },
    { group: "AB-", unitsAvailable: 1, criticalThreshold: 2, lastTested: "10 Sep" },
    { group: "O+", unitsAvailable: 22, criticalThreshold: 8, lastTested: "Today 07:00 AM" },
    { group: "O-", unitsAvailable: 4, criticalThreshold: 5, lastTested: "Today 04:00 AM" },
  ]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPatients(data);
          try {
            localStorage.setItem("medcare_clinical_patients", JSON.stringify(data));
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("API fallback to local persistence");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Central Fix: Direct Save to Patients State + Storage + API + OPD Workflow
  const addPatient = async (newPt: PatientData): Promise<boolean> => {
    // 1. Direct State Insertion (Dashboard table me turant sabse upar dikhega)
    setPatients((prev) => {
      const updated = [newPt, ...prev.filter((p) => p.id !== newPt.id)];
      try {
        localStorage.setItem("medcare_clinical_patients", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // 2. Automated OPD Appointment Entry
    const newApt: AppointmentItem = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      patient: newPt.name,
      doctor: "Dr. Sourav",
      time: "Just Now",
      type: "OPD Intake",
      status: "In Progress",
    };
    setAppointments((prev) => [newApt, ...prev]);

    // 3. Automated Lab Triage
    const sym = (newPt.symptoms || "").toLowerCase();
    let assignedTest = "Complete Diagnostic Panel";
    if (sym.includes("fever") || sym.includes("pyrexia")) assignedTest = "CBC & Viral Serology Screen";
    else if (sym.includes("chest") || sym.includes("heart") || sym.includes("bp")) assignedTest = "Cardiac Biomarkers & ECG";
    else if (sym.includes("cough")) assignedTest = "Sputum & CRP Inflammatory Index";

    const newLab: LabItem = {
      token: `LAB-${Math.floor(400 + Math.random() * 500)}`,
      test: assignedTest,
      patient: newPt.name,
      doctor: "Dr. Sourav",
      status: "Processing",
      tat: "30 mins",
    };
    setLabQueue((prev) => [newLab, ...prev]);
    setRevenue((prev) => prev + 500);

    // 4. Background Database Commit (/api/patients)
    try {
      await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPt),
      });
    } catch (err) {
      console.warn("Database post non-blocking warning:", err);
    }

    return true;
  };

  const registerNewPatientWorkflow = (newPt: PatientData) => {
    addPatient(newPt);
  };

  const triggerEmergencyTriage = (traumaType: string, age: number, gender: string, notes: string) => {
    const traumaId = `TRAUMA-${Math.floor(1000 + Math.random() * 9000)}`;
    const patientIdentifier = `RED-CODE (${traumaType})`;

    const emergencyPt: PatientData = {
      id: traumaId,
      name: `${patientIdentifier} [${gender.charAt(0)}/${age}Y]`,
      abhaId: "EMERGENCY-FAST-TRACK",
      age,
      gender,
      bp: "Unstable (STAT)",
      pulse: 135,
      temperature: 99.1,
      symptoms: `ACUTE RED CODE: ${traumaType}. ${notes}`,
      caseNotes: `STAT PROTOCOL ACTIVATED: Immediate resuscitation line established. Priority Level 1 Triage.`,
      createdAt: new Date().toISOString(),
    };

    addPatient(emergencyPt);

    setBeds((prev) => {
      let bedAssigned = false;
      return prev.map((b) => {
        if (!bedAssigned && b.ward === "Emergency" && b.status === "Available") {
          bedAssigned = true;
          return {
            ...b,
            status: "Occupied",
            patientName: patientIdentifier,
            abhaId: traumaId,
            admitTime: "STAT NOW",
          };
        }
        return b;
      });
    });

    const statLab: LabItem = {
      token: `STAT-${Math.floor(800 + Math.random() * 199)}`,
      test: "STAT Trauma Panel: ABG, Crossmatch & Troponin-I",
      patient: patientIdentifier,
      doctor: "ER Resus Team",
      status: "CRITICAL PRIORITY",
      tat: "10 mins STAT",
    };
    setLabQueue((prev) => [statLab, ...prev]);

    setActiveEmergency(true);
    setRevenue((prev) => prev + 2500);
  };

  const dismissEmergency = () => {
    setActiveEmergency(false);
  };

  const dispensePrescription = (medId: string) => {
    const target = inventory.find((m) => m.id === medId);
    if (!target || target.stock <= 0) return;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === medId ? { ...item, stock: item.stock - 1 } : item
      )
    );
    setRevenue((prev) => prev + target.unitPrice);
  };

  const restockMedicine = (medId: string, qty = 50) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === medId ? { ...item, stock: item.stock + qty } : item
      )
    );
  };

  const updateLabStatus = (token: string, newStatus: string) => {
    setLabQueue((prev) =>
      prev.map((l) => (l.token === token ? { ...l, status: newStatus } : l))
    );
  };

  const admitPatientToBed = (bedId: string, patientName: string, abhaId: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: "Occupied",
              patientName,
              abhaId,
              admitTime: "Just Now",
            }
          : b
      )
    );
    setRevenue((prev) => prev + 1500);
  };

  const dischargeBed = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: "Cleaning",
              patientName: undefined,
              abhaId: undefined,
              admitTime: undefined,
            }
          : b
      )
    );
  };

  const sanitizeBed = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: "Available" } : b))
    );
  };

  const requestBloodCrossmatch = (patientName: string, bloodGroup: string, units: number) => {
    setBloodStock((prev) =>
      prev.map((b) =>
        b.group === bloodGroup
          ? { ...b, unitsAvailable: Math.max(0, b.unitsAvailable - units) }
          : b
      )
    );

    const crossmatchLab: LabItem = {
      token: `XM-${Math.floor(700 + Math.random() * 200)}`,
      test: `STAT Crossmatch & Coombs (${bloodGroup} - ${units} Unit)`,
      patient: patientName,
      doctor: "Transfusion Medicine",
      status: "Processing",
      tat: "15 mins STAT",
    };
    setLabQueue((prev) => [crossmatchLab, ...prev]);
    setRevenue((prev) => prev + units * 1200);
  };

  return (
    <HospitalContext.Provider
      value={{
        patients,
        appointments,
        labQueue,
        inventory,
        beds,
        bloodStock,
        revenue,
        loading,
        activeEmergency,
        dismissEmergency,
        refreshPatients: fetchPatients,
        addPatient,
        registerNewPatient: addPatient,
        registerNewPatientWorkflow,
        triggerEmergencyTriage,
        dispensePrescription,
        restockMedicine,
        updateLabStatus,
        admitPatientToBed,
        dischargeBed,
        sanitizeBed,
        requestBloodCrossmatch,
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}

export function useHospital() {
  const context = useContext(HospitalContext);
  if (!context) throw new Error("useHospital must be used inside HospitalProvider");
  return context;
}