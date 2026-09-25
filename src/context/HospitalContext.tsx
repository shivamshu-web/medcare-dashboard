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
  category: "Tablet" | "Capsule" | "Syrup" | "Injection" | "IV Fluid" | "Sachet" | string;
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
  group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | string;
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
  deletePatient: (id: string) => Promise<boolean>;
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

  // 1. Neon Cloud Database Fetch Function (FIXED: Calls both endpoints properly)
  const syncHospitalState = useCallback(async () => {
    try {
      // 1. Fetch Patients from /api/patients
      const pRes = await fetch("/api/patients", {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData)) {
          setPatients(pData);
        } else if (pData && Array.isArray(pData.patients)) {
          setPatients(pData.patients);
        }
      }

      // 2. Fetch Beds, Inventory, Blood, Appointments, Lab from /api/hospital-state
      const stateRes = await fetch("/api/hospital-state", {
        cache: "no-store",
        headers: { "Pragma": "no-cache", "Cache-Control": "no-cache" },
      });
      if (stateRes.ok) {
        const sData = await stateRes.json();
        if (Array.isArray(sData.beds)) setBeds(sData.beds);
        if (Array.isArray(sData.inventory)) setInventory(sData.inventory);
        if (Array.isArray(sData.bloodStock)) setBloodStock(sData.bloodStock);
        if (Array.isArray(sData.appointments)) setAppointments(sData.appointments);
        if (Array.isArray(sData.labQueue)) setLabQueue(sData.labQueue);
      }
    } catch (err) {
      console.warn("Neon SQL Polling Sync Error:", err);
    }
  }, []);

  // 2. Real-time background sync loop (Har 3 seconds me live fetch)
  useEffect(() => {
    syncHospitalState();
    const interval = setInterval(syncHospitalState, 3000);
    return () => clearInterval(interval);
  }, [syncHospitalState]);

  // 3. Direct Neon Cloud SQL Patient Insert
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
        // Turant background sync trigger
        syncHospitalState();
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

  const deletePatient = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/patients?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // Screen aur local state se turant remove karein
        setPatients((prev: any[]) => prev.filter((p: any) => p.id !== id));
        syncHospitalState();
        console.log("✅ Patient deleted from Neon DB:", id);
        return true;
      } else {
        const err = await res.json();
        console.error("❌ Neon DB delete error:", err);
        return false;
      }
    } catch (err) {
      console.error("❌ Network error deleting patient:", err);
      return false;
    }
  };

  const registerNewPatientWorkflow = async (data: any) => {
    return await addPatient(data);
  };

  const triggerEmergencyTriage = async (traumaTypeOrData: any, age?: number, gender?: string, notes?: string) => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const generatedAbha = `91-RED-${randomSuffix}`;

    let payload: any;

    if (typeof traumaTypeOrData === "object" && traumaTypeOrData !== null) {
      payload = {
        name: traumaTypeOrData.name || `RED-CODE STAT RESUS`,
        age: Number(traumaTypeOrData.age) || 35,
        gender: traumaTypeOrData.gender || "Male",
        contact: traumaTypeOrData.contact || "+91 99999 00000",
        bloodGroup: traumaTypeOrData.bloodGroup || "O+",
        abhaId: traumaTypeOrData.abhaId || generatedAbha,
        symptoms: traumaTypeOrData.symptoms || traumaTypeOrData.complaint || "CRITICAL EMERGENCY: Immediate Trauma Care",
        caseNotes: traumaTypeOrData.caseNotes || traumaTypeOrData.diagnosis || "STAT PROTOCOL ACTIVATED: Resuscitation Line Open",
        bp: traumaTypeOrData.bp || "80/50 (Critical)",
        pulse: Number(traumaTypeOrData.pulse) || 140,
        temperature: String(traumaTypeOrData.temperature || "99.0"),
        status: "Critical Resus",
        bedNumber: traumaTypeOrData.bedNumber || "TRAUMA-RESUS-01",
      };
    } else {
      const traumaType = String(traumaTypeOrData || "Severe Trauma / Shock");
      payload = {
        name: `RED-CODE (${traumaType}) [${(gender || "M").charAt(0)}/${age || 35}Y]`,
        age: Number(age) || 35,
        gender: gender || "Male",
        contact: "+91 99999 00000",
        bloodGroup: "O+",
        abhaId: generatedAbha,
        symptoms: `ACUTE RED CODE: ${traumaType}. ${notes || ""}`,
        caseNotes: `STAT PROTOCOL ACTIVATED: Immediate resuscitation line established. Priority Level 1 Triage.`,
        bp: "80/50 (Critical)",
        pulse: 140,
        temperature: "99.0",
        status: "Critical Resus",
        bedNumber: "TRAUMA-RESUS-01",
      };
    }

    setActiveEmergency(true);
    setRevenue((prev) => prev + 2500);

    const saved = await addPatient(payload);
    return saved;
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
      prev.map((b) => (b.id === bedId || b.number === bedId ? { ...b, ...dataUpdate } : b))
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
      prev.map((b) => (b.id === bedId || b.number === bedId ? { ...b, ...dataUpdate } : b))
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
      prev.map((b) => (b.id === bedId || b.number === bedId ? { ...b, ...dataUpdate } : b))
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

  const requestBloodCrossmatch = async (patientName: string, bloodGroup: string, units: number) => {
    let currentUnits = 0;
    setBloodStock((prev) =>
      prev.map((b) => {
        if (b.group === bloodGroup) {
          currentUnits = Math.max(0, b.unitsAvailable - units);
          return { ...b, unitsAvailable: currentUnits };
        }
        return b;
      })
    );
    setRevenue((prev) => prev + units * 1200);

    try {
      await fetch("/api/hospital-state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "UPDATE_BLOOD",
          payload: { group: bloodGroup, unitsAvailable: currentUnits },
        }),
      });
    } catch (e) {
      console.warn("Failed to sync blood units to API:", e);
    }
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
        deletePatient,
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