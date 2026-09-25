"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { PatientData } from "@/components/dashboard/PatientProfileView";

export interface LabItem {
  id?: string;
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
  ward: "ICU" | "General" | "Emergency" | "Private" | string;
  number: string;
  status: "Available" | "Occupied" | "Cleaning" | string;
  patientName?: string | null;
  abhaId?: string | null;
  admitTime?: string | null;
}

export interface BloodUnitItem {
  id?: string;
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
  addPatient: (newPt: any) => Promise<any>;
  registerNewPatient: (newPt: any) => Promise<any>;
  registerNewPatientWorkflow: (newPt: any) => Promise<any>;
  triggerEmergencyTriage: (traumaTypeOrData: any, age?: number, gender?: string, notes?: string) => Promise<any>;
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
  // Pure dynamic states directly connected to Neon Cloud DB
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [labQueue, setLabQueue] = useState<LabItem[]>([]);
  const [inventory, setInventory] = useState<MedicineItem[]>([]);
  const [beds, setBeds] = useState<BedItem[]>([]);
  const [bloodStock, setBloodStock] = useState<BloodUnitItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(842500);
  const [activeEmergency, setActiveEmergency] = useState(false);

  // 1. Neon Cloud Database Fetch Function
  const syncHospitalState = useCallback(async () => {
    try {
      const res = await fetch("/api/patients", {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setPatients(data);
      }
    } catch (err) {
      console.warn("Neon SQL Polling Sync Error:", err);
    }
  }, []);

  // 2. Real-time background sync loop (Har 4 seconds me live fetch)
  useEffect(() => {
    syncHospitalState();
    const interval = setInterval(syncHospitalState, 4000);
    return () => clearInterval(interval);
  }, [syncHospitalState]);

  // 3. Direct Neon Cloud SQL Patient Insert (Zero localStorage)
  const addPatient = async (patientData: any): Promise<any> => {
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      if (res.ok) {
        const savedPatient = await res.json();
        setPatients((prev: any[]) => [savedPatient, ...prev.filter((p: any) => p.id !== savedPatient.id)]);
        return savedPatient;
      } else {
        const errData = await res.json();
        console.error("Neon DB Insert Error:", errData);
        return null;
      }
    } catch (err) {
      console.error("Network error persisting patient to Neon:", err);
      return null;
    }
  };

  const registerNewPatientWorkflow = async (data: any) => {
    return await addPatient(data);
  };

  const triggerEmergencyTriage = async (traumaTypeOrData: any, age?: number, gender?: string, notes?: string) => {
    let payload: any;

    if (typeof traumaTypeOrData === "object" && traumaTypeOrData !== null) {
      payload = {
        ...traumaTypeOrData,
        name: traumaTypeOrData.name || "CODE RED STAT RESUS",
        status: "Critical Resus",
        bedNumber: "TRAUMA-RESUS-01",
      };
    } else {
      const traumaType = String(traumaTypeOrData || "Critical Trauma");
      payload = {
        name: `RED-CODE (${traumaType}) [${(gender || "M").charAt(0)}/${age || 30}Y]`,
        abhaId: `91-RED-${Date.now().toString().slice(-6)}`,
        age: age || 30,
        gender: gender || "Male",
        bp: "Unstable (STAT)",
        pulse: 135,
        temperature: "99.1",
        symptoms: `ACUTE RED CODE: ${traumaType}. ${notes || ""}`,
        caseNotes: `STAT PROTOCOL ACTIVATED: Immediate resuscitation line established. Priority Level 1 Triage.`,
        status: "Critical Resus",
        bedNumber: "TRAUMA-RESUS-01",
      };
    }

    setActiveEmergency(true);
    setRevenue((prev) => prev + 2500);
    return await addPatient(payload);
  };

  const dismissEmergency = () => {
    setActiveEmergency(false);
  };

  const dispensePrescription = async (medId: string) => {
    const target = inventory.find((m) => m.id === medId);
    if (!target || target.stock <= 0) return;

    const newStock = target.stock - 1;
    setInventory((prev) =>
      prev.map((item) => (item.id === medId ? { ...item, stock: newStock } : item))
    );
    setRevenue((prev) => prev + target.unitPrice);

    await fetch("/api/hospital-state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "UPDATE_STOCK", payload: { id: medId, stock: newStock } }),
    });
  };

  const restockMedicine = async (medId: string, qty = 50) => {
    const target = inventory.find((m) => m.id === medId);
    if (!target) return;

    const newStock = target.stock + qty;
    setInventory((prev) =>
      prev.map((item) => (item.id === medId ? { ...item, stock: newStock } : item))
    );

    await fetch("/api/hospital-state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "UPDATE_STOCK", payload: { id: medId, stock: newStock } }),
    });
  };

  const updateLabStatus = async (token: string, newStatus: string) => {
    setLabQueue((prev) =>
      prev.map((l) => (l.token === token ? { ...l, status: newStatus } : l))
    );

    await fetch("/api/hospital-state", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "UPDATE_LAB", payload: { token, status: newStatus } }),
    });
  };

  const admitPatientToBed = async (bedId: string, patientName: string, abhaId: string) => {
    const dataUpdate: Partial<BedItem> = {
      status: "Occupied",
      patientName,
      abhaId,
      admitTime: "Just Now",
    };

    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, ...dataUpdate } : b))
    );
    setRevenue((prev) => prev + 1500);

    try {
      await fetch("/api/hospital-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "UPDATE_BED", payload: { id: bedId, data: dataUpdate } }),
      });
    } catch (e) {
      console.warn("Failed to sync bed status to API:", e);
    }
  };

  const dischargeBed = async (bedId: string) => {
    const dataUpdate: Partial<BedItem> = {
      status: "Cleaning",
      patientName: null,
      abhaId: null,
      admitTime: null,
    };

    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, ...dataUpdate } : b))
    );

    try {
      await fetch("/api/hospital-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "UPDATE_BED", payload: { id: bedId, data: dataUpdate } }),
      });
    } catch (e) {
      console.warn("Failed to sync bed discharge to API:", e);
    }
  };

  const sanitizeBed = async (bedId: string) => {
    const dataUpdate: Partial<BedItem> = {
      status: "Available",
      patientName: null,
      abhaId: null,
      admitTime: null,
    };

    setBeds((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, ...dataUpdate } : b))
    );

    try {
      await fetch("/api/hospital-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "UPDATE_BED", payload: { id: bedId, data: dataUpdate } }),
      });
    } catch (e) {
      console.warn("Failed to sync bed sanitization to API:", e);
    }
  };

  const requestBloodCrossmatch = (patientName: string, bloodGroup: string, units: number) => {
    setBloodStock((prev) =>
      prev.map((b) =>
        b.group === bloodGroup
          ? { ...b, unitsAvailable: Math.max(0, b.unitsAvailable - units) }
          : b
      )
    );
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
        refreshPatients: syncHospitalState,
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