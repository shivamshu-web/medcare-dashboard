"use client";

import React, { useState, useMemo } from "react";
import { useHospital } from "@/context/HospitalContext";
import { Calendar, Clock, User, CheckCircle2 } from "lucide-react";

const DEFAULT_WEEKLY_SCHEDULE = [
  { id: "APT-101", patient: "Rajesh Kumar", tokenNo: "01", time: "09:30 AM", doctor: "Dr. Arvind Rao", day: "Mon", status: "Confirmed", type: "Cardiology OPD" },
  { id: "APT-102", patient: "Pooja Hegde", tokenNo: "02", time: "10:15 AM", doctor: "Dr. Ananya Roy", day: "Mon", status: "In Progress", type: "General Health" },
  { id: "APT-103", patient: "Amitabh Verma", tokenNo: "03", time: "11:00 AM", doctor: "Dr. Arvind Rao", day: "Tue", status: "Confirmed", type: "ECG Review" },
  { id: "APT-104", patient: "Sneha Patil", tokenNo: "04", time: "02:00 PM", doctor: "Dr. Suresh Menon", day: "Tue", status: "Confirmed", type: "Ortho Consult" },
  { id: "APT-105", patient: "Mohammed Ali", tokenNo: "05", time: "10:00 AM", doctor: "Dr. Ananya Roy", day: "Wed", status: "Confirmed", type: "Diabetes Follow-up" },
  { id: "APT-106", patient: "Kavita Rao", tokenNo: "06", time: "11:30 AM", doctor: "Dr. Arvind Rao", day: "Thu", status: "Confirmed", type: "Hypertension Check" },
  { id: "APT-107", patient: "Deepak Joshi", tokenNo: "07", time: "04:00 PM", doctor: "Dr. Suresh Menon", day: "Fri", status: "Confirmed", type: "Post-op Follow-up" },
  { id: "APT-108", patient: "Meena Sharma", tokenNo: "08", time: "10:30 AM", doctor: "Dr. Ananya Roy", day: "Sat", status: "Confirmed", type: "Pediatric Consult" },
];

export default function ClinicalAppointmentsWidget() {
  const { appointments, setAppointments } = useHospital() as any;
  const [selectedDay, setSelectedDay] = useState<string>("Mon");

  const weekDays = [
    { day: "Mon", label: "M", date: 14 },
    { day: "Tue", label: "T", date: 15 },
    { day: "Wed", label: "W", date: 16 },
    { day: "Thu", label: "T", date: 17 },
    { day: "Fri", label: "F", date: 18 },
    { day: "Sat", label: "S", date: 19 },
    { day: "Sun", label: "S", date: 20 },
  ];

  const activeList = useMemo(() => {
    const list = appointments && appointments.length > 0 ? appointments : DEFAULT_WEEKLY_SCHEDULE;
    return list.filter((apt: any) => !apt.day || apt.day.toLowerCase() === selectedDay.toLowerCase());
  }, [appointments, selectedDay]);

  const handleToggleStatus = (aptId: string) => {
    if (!setAppointments) return;

    setAppointments((prev: any[]) => {
      const source = prev && prev.length > 0 ? prev : DEFAULT_WEEKLY_SCHEDULE;
      return source.map((apt: any) => {
        if (apt.id === aptId) {
          const next =
            apt.status === "Confirmed"
              ? "In Progress"
              : apt.status === "In Progress"
              ? "Completed"
              : "Confirmed";
          return { ...apt, status: next };
        }
        return apt;
      });
    });
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Clinical Appointments
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              Weekly OPD Tokens & Consult Roster
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          {activeList.length} Slotted
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-100 text-center">
        {weekDays.map((item) => {
          const isSelected = selectedDay === item.day;
          return (
            <button
              key={item.day}
              type="button"
              onClick={() => setSelectedDay(item.day)}
              className={`py-2 rounded-xl transition cursor-pointer flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-emerald-900 text-white font-bold shadow-sm"
                  : "text-gray-500 hover:bg-white hover:text-gray-900"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold">{item.day}</span>
              <span className={`text-xs font-black ${isSelected ? "text-emerald-300" : "text-gray-800"}`}>
                {item.date}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {activeList.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-medium">
            No clinic appointments booked for {selectedDay}.
          </div>
        ) : (
          activeList.map((apt: any) => {
            const isCompleted = apt.status === "Completed";
            const isInProgress = apt.status === "In Progress";

            return (
              <div
                key={apt.id}
                onClick={() => handleToggleStatus(apt.id)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isCompleted
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : isInProgress
                    ? "bg-amber-50 border-amber-300"
                    : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
                }`}
                title="Click to toggle status: Confirmed -> In Progress -> Completed"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      isCompleted
                        ? "bg-gray-200 text-gray-600"
                        : isInProgress
                        ? "bg-amber-500 text-white animate-pulse"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    {apt.tokenNo || "OPD"}
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-900 leading-tight">
                      {apt.patient}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                      <span className="font-mono text-gray-600 font-semibold">{apt.time}</span>
                      <span>•</span>
                      <span>{apt.doctor}</span>
                      {apt.type && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-medium">{apt.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    isCompleted
                      ? "bg-gray-200 text-gray-700"
                      : isInProgress
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {apt.status || "Confirmed"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}