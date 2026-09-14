"use client";

import React, { useState, useEffect, useMemo } from "react";
import Sidebar, { SettingsView, SupportGuideView } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PatientChart from "@/components/dashboard/PatientChart";
import ClinicalAppointmentsWidget from "@/components/dashboard/ClinicalAppointmentsWidget";
import CaseTakingModal from "@/components/case-taking/CaseTakingModal";
import PatientProfileView from "@/components/dashboard/PatientProfileView";
import VitalsCard from "@/components/VitalsCard";
import type { PatientData } from "@/components/dashboard/PatientProfileView";
import PatientTableView from "@/components/dashboard/PatientTableView";
import WardsView from "@/components/dashboard/WardsView";
import BloodBankView from "@/components/dashboard/BloodBankView";
import PrescriptionView from "@/components/dashboard/PrescriptionView";
import DicomViewer from "@/components/dashboard/DicomViewer";
import LoginView from "@/components/auth/LoginView";
import EmergencyModal from "@/components/dashboard/EmergencyModal";
import PatientPortalView from "@/components/dashboard/PatientPortalView";
import TeleConsultModal from "@/components/dashboard/TeleConsultModal";
import { useHospital } from "@/context/HospitalContext";
import type { AppointmentItem } from "@/context/HospitalContext";
import {
  AppointmentsView,
  CaseIntakeView,
  MedicalRecordsView,
  FinanceBillingView,
  PharmacyView,
  LabReportsView,
} from "@/components/dashboard/ModuleViews";
import {
  CalendarDays,
  PhoneCall,
  Activity,
  Users,
  TrendingUp,
  Clock,
  BedDouble,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Plus,
  RefreshCw,
  Siren,
  X,
  Droplets,
  Stethoscope,
  Volume2,
  History,
  Sparkles,
} from "lucide-react";

interface ScheduleAppointment extends AppointmentItem {
  day: string;
  dateNum: number;
  tokenNo: string;
  priority: "High" | "Normal" | "Routine";
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentRole, setCurrentRole] = useState<"doctor" | "patient">("doctor");
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isTeleModalOpen, setIsTeleModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);

  const [selectedDayNum, setSelectedDayNum] = useState<number>(12);
  const [scheduleFilter, setScheduleFilter] = useState<"all" | "completed" | "upcoming">("all");
  const [tokenAnnounced, setTokenAnnounced] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  const {
    patients,
    appointments,
    beds,
    revenue,
    bloodStock,
    loading,
    activeEmergency,
    dismissEmergency,
    refreshPatients,
  } = useHospital();

  useEffect(() => {
    const session = localStorage.getItem("medcare_auth");
    if (session === "true") {
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem("medcare_auth", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("medcare_auth");
    setIsAuthenticated(false);
  };

  const handleOpenPatient = (patient: PatientData) => {
    setSelectedPatient(patient);
    setIsProfileModalOpen(true);
  };

  const calendarDays = [
    { day: "Mon", dateNum: 7, isPast: true },
    { day: "Tue", dateNum: 8, isPast: true },
    { day: "Wed", dateNum: 9, isPast: true },
    { day: "Thu", dateNum: 10, isPast: true },
    { day: "Fri", dateNum: 11, isPast: true },
    { day: "Sat", dateNum: 12, isToday: true },
    { day: "Sun", dateNum: 13, isFuture: true },
  ];

  const fullScheduleDatabase: ScheduleAppointment[] = useMemo(() => [
    { id: "APT-101", tokenNo: "T-01", patient: "Aarav Sharma", doctor: "Dr. Morgan", time: "10:30 AM", type: "General OPD", status: "In Progress", day: "Sat", dateNum: 12, priority: "Normal" },
    { id: "APT-102", tokenNo: "T-02", patient: "Priya Mukherjee", doctor: "Dr. Anjali Rao", time: "11:15 AM", type: "Follow-up", status: "Confirmed", day: "Sat", dateNum: 12, priority: "High" },
    { id: "APT-103", tokenNo: "T-03", patient: "Rajeshwar Singh", doctor: "Dr. Morgan", time: "12:00 PM", type: "Cardiology Consult", status: "Confirmed", day: "Sat", dateNum: 12, priority: "High" },
    { id: "APT-104", tokenNo: "T-04", patient: "Sunita Devi", doctor: "Dr. Verma", time: "02:30 PM", type: "Pathology Review", status: "Pending", day: "Sat", dateNum: 12, priority: "Routine" },
    { id: "APT-105", tokenNo: "T-05", patient: "Vikram Malhotra", doctor: "Dr. Morgan", time: "04:00 PM", type: "Pulmonology", status: "Confirmed", day: "Sat", dateNum: 12, priority: "Normal" },
    { id: "APT-091", tokenNo: "T-14", patient: "Meenakshi Sundaram", doctor: "Dr. Morgan", time: "09:30 AM", type: "Hypertension Review", status: "Completed", day: "Fri", dateNum: 11, priority: "Normal" },
    { id: "APT-092", tokenNo: "T-15", patient: "Kavita Krishnan", doctor: "Dr. Morgan", time: "11:00 AM", type: "Post-Operative Dressing", status: "Completed", day: "Fri", dateNum: 11, priority: "High" },
    { id: "APT-093", tokenNo: "T-16", patient: "Mohammad Farooq", doctor: "Dr. Anjali", time: "02:15 PM", type: "Diabetic Retinopathy", status: "Completed", day: "Fri", dateNum: 11, priority: "Routine" },
    { id: "APT-081", tokenNo: "T-09", patient: "Devendra Patel", doctor: "Dr. Morgan", time: "10:00 AM", type: "Orthopedic Cast Check", status: "Completed", day: "Thu", dateNum: 10, priority: "Normal" },
    { id: "APT-071", tokenNo: "T-06", patient: "Gaurav Sen", doctor: "Dr. Morgan", time: "11:30 AM", type: "Gastroenteritis Rx", status: "Completed", day: "Wed", dateNum: 9, priority: "Normal" },
    { id: "APT-061", tokenNo: "T-03", patient: "Deepa Narayan", doctor: "Dr. Morgan", time: "10:15 AM", type: "Antenatal Checkup (ANC)", status: "Completed", day: "Tue", dateNum: 8, priority: "High" },
    { id: "APT-051", tokenNo: "T-01", patient: "Bhupinder Gill", doctor: "Dr. Morgan", time: "09:00 AM", type: "Cardiac Stress Test", status: "Completed", day: "Mon", dateNum: 7, priority: "High" },
    { id: "APT-111", tokenNo: "T-01", patient: "Ananya Deshmukh", doctor: "Dr. Morgan", time: "10:00 AM", type: "Pediatric Wellness", status: "Confirmed", day: "Sun", dateNum: 13, priority: "Routine" },
  ], []);

  const displayedSchedules = useMemo(() => {
    return fullScheduleDatabase.filter((s) => {
      if (s.dateNum !== selectedDayNum) return false;
      if (scheduleFilter === "completed") return s.status === "Completed";
      if (scheduleFilter === "upcoming") return s.status === "Confirmed" || s.status === "Pending" || s.status === "In Progress";
      return true;
    });
  }, [fullScheduleDatabase, selectedDayNum, scheduleFilter]);

  const handleCallToken = (token: string, name: string) => {
    setTokenAnnounced(`Token ${token}: ${name}`);
    setTimeout(() => setTokenAnnounced(null), 3500);
  };

  if (authChecking) {
    return (
      <div className="h-screen w-screen bg-[#f4f7f6] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const availableBedsCount = beds ? beds.filter((b) => b.status === "Available").length : 0;
  const occupiedBedsCount = beds ? beds.filter((b) => b.status === "Occupied").length : 0;
  const totalBloodUnits = bloodStock ? bloodStock.reduce((acc, b) => acc + b.unitsAvailable, 0) : 0;

  return (
    <div className="flex h-screen w-screen bg-[#f4f7f6] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <Header
          onAddPatient={() => setIsCaseModalOpen(true)}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          currentRole={currentRole}
          onToggleRole={(role) => setCurrentRole(role)}
        />

        {activeEmergency && (
          <div className="bg-rose-600 text-white px-8 py-3 flex items-center justify-between animate-pulse shadow-md">
            <div className="flex items-center gap-3">
              <Siren className="w-5 h-5 text-white animate-spin" />
              <div>
                <span className="font-black text-xs tracking-wider uppercase block">
                  🚨 ACTIVE CODE RED: TRAUMA RESUSCITATION IN PROGRESS
                </span>
                <span className="text-[10px] text-rose-100">
                  Emergency Bed reserved • STAT ABG, Crossmatch & Troponin dispatched to Pathology
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentRole("doctor");
                  setActiveTab("wards");
                }}
                className="px-3 py-1 bg-white text-rose-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-rose-50 transition"
              >
                View ER Bed →
              </button>
              <button
                onClick={dismissEmergency}
                className="p-1 hover:bg-rose-700 rounded-lg cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="p-8 space-y-6 max-w-7xl mx-auto w-full">
          {currentRole === "patient" ? (
            <PatientPortalView />
          ) : (
            <>
              {activeTab === "patients" && (
                <PatientTableView
                  patients={patients}
                  onSelectPatient={handleOpenPatient}
                  onOpenModal={() => setIsCaseModalOpen(true)}
                />
              )}

              {activeTab === "prescription" && <PrescriptionView />}
              {activeTab === "wards" && <WardsView />}
              {activeTab === "bloodbank" && <BloodBankView />}
              {activeTab === "imaging" && <DicomViewer />}
              {activeTab === "appointments" && (
                <AppointmentsView onNewIntake={() => setIsCaseModalOpen(true)} />
              )}
              {activeTab === "intake" && (
                <CaseIntakeView onOpenIntake={() => setIsCaseModalOpen(true)} />
              )}
              {activeTab === "pharmacy" && <PharmacyView />}
              {activeTab === "lab" && <LabReportsView />}
              {activeTab === "records" && (
                <MedicalRecordsView onOpenIntake={() => setIsCaseModalOpen(true)} />
              )}
              {activeTab === "billing" && <FinanceBillingView />}
              {activeTab === "settings" && <SettingsView />}
              {activeTab === "support" && <SupportGuideView />}

              {activeTab === "dashboard" && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=240&q=80"
                          alt="Dr. Morgan"
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs flex items-center justify-center">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-xl font-black text-gray-900 tracking-tight">
                            Hello, Dr. Morgan <span>👋</span>
                          </h1>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                            On Duty • Unit 3A
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Chief Medical Officer • Central Clinical Command & ABDM Desk
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-2 bg-emerald-50/80 text-emerald-800 px-3.5 py-2 rounded-2xl text-xs font-bold border border-emerald-200/90 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>ABHA / ABDM Protocol Active</span>
                      </div>

                      {tokenAnnounced && (
                        <div className="flex items-center gap-2 bg-[#072a22] text-white px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md animate-bounce">
                          <Volume2 className="w-4 h-4 text-emerald-400" />
                          <span>📢 Calling: {tokenAnnounced} to Room 102</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div
                      onClick={() => {
                        if (appointments.length > 0) {
                          setSelectedAppointment(appointments[0]);
                        } else {
                          setActiveTab("appointments");
                        }
                      }}
                      className="bg-gradient-to-br from-[#072a22] to-[#0d3f34] text-white p-5 rounded-3xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-lg hover:shadow-emerald-950/20 transition duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-emerald-400/20 group-hover:bg-emerald-400/30 rounded-2xl text-emerald-300 transition shadow-inner">
                            <CalendarDays className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-emerald-100">Appointments</span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                          Click to View
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-black">{1250 + appointments.length}</h3>
                        <p className="text-[11px] text-emerald-300 flex items-center gap-1 mt-1 font-medium">
                          <TrendingUp className="w-3 h-3" /> View active patient schedule →
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setIsTeleModalOpen(true)}
                      className="bg-white p-5 rounded-3xl shadow-xs border border-gray-200/80 flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:shadow-md transition duration-200 group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 group-hover:scale-105 transition">
                            <PhoneCall className="w-5 h-5 fill-white/20" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-700 block">Call Consultancy</span>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> eSanjeevani Tele-Room
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Connect
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-black text-gray-800">1,002</h3>
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                          <TrendingUp className="w-3 h-3" /> Click to launch Tele-Consult
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab("bloodbank")}
                      className="bg-white p-5 rounded-3xl shadow-xs border border-gray-200/80 flex flex-col justify-between cursor-pointer hover:border-rose-400 hover:shadow-md transition group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 group-hover:scale-105 transition">
                            <Droplets className="w-5 h-5 fill-white/30" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-700 block">Blood Reserve</span>
                            <span className="text-[10px] text-rose-600 font-semibold">Cold Storage Active</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                          8 Groups
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-black text-gray-800">{totalBloodUnits} Units</h3>
                        <p className="text-[11px] text-rose-600 flex items-center gap-1 mt-1 font-medium">
                          <TrendingUp className="w-3 h-3" /> Universal O-: {bloodStock?.find((b) => b.group === "O-")?.unitsAvailable || 0} Units
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab("patients")}
                      className="bg-white p-5 rounded-3xl shadow-xs border border-gray-200/80 flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:shadow-md transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-700">Total Patients</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-black text-gray-800">
                          {1835 + patients.length}
                        </h3>
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
                          <TrendingUp className="w-3 h-3" /> Live DB Connected
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Automated Vitals Calculation Card */}
                  <div className="w-full">
                    <VitalsCard />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <PatientChart />
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                              <CalendarDays className="w-4 h-4 text-emerald-700" /> Clinic Appointments
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {selectedDayNum === 12
                                ? "Today (Saturday, 12 Sep)"
                                : selectedDayNum < 12
                                ? `Past Session (${selectedDayNum} Sep)`
                                : `Upcoming Session (${selectedDayNum} Sep)`}
                            </p>
                          </div>

                          <button
                            onClick={() => setIsCaseModalOpen(true)}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition cursor-pointer"
                            title="Schedule Patient"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-3 bg-gray-50/80 p-1.5 rounded-2xl border border-gray-100">
                          {calendarDays.map((item) => {
                            const isSelected = selectedDayNum === item.dateNum;
                            return (
                              <button
                                key={item.dateNum}
                                onClick={() => setSelectedDayNum(item.dateNum)}
                                className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center cursor-pointer transition relative ${
                                  isSelected
                                    ? "bg-[#072a22] text-white font-bold shadow-xs"
                                    : item.isToday
                                    ? "bg-emerald-100 text-emerald-900 font-bold"
                                    : item.isPast
                                    ? "text-gray-500 hover:bg-gray-200/60"
                                    : "text-emerald-700 hover:bg-gray-200/60"
                                }`}
                              >
                                <span className="text-[10px] opacity-80">{item.day}</span>
                                <span className="font-black text-sm">{item.dateNum}</span>
                                {item.isToday && !isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between mb-3 text-[11px] font-semibold border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setScheduleFilter("all")}
                              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                scheduleFilter === "all"
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              All ({fullScheduleDatabase.filter((s) => s.dateNum === selectedDayNum).length})
                            </button>
                            <button
                              onClick={() => setScheduleFilter("completed")}
                              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                scheduleFilter === "completed"
                                  ? "bg-emerald-700 text-white"
                                  : "text-gray-500 hover:text-emerald-700"
                              }`}
                            >
                              Done
                            </button>
                            <button
                              onClick={() => setScheduleFilter("upcoming")}
                              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                                scheduleFilter === "upcoming"
                                  ? "bg-[#072a22] text-white"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              Active
                            </button>
                          </div>

                          <span className="text-[10px] text-gray-400 font-mono">
                            {selectedDayNum < 12 ? (
                              <span className="flex items-center gap-1 text-amber-600 font-medium">
                                <History className="w-3 h-3" /> Archived
                              </span>
                            ) : (
                              "Live Queue"
                            )}
                          </span>
                        </div>

                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {displayedSchedules.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <CalendarDays className="w-6 h-6 mx-auto mb-1 opacity-40" />
                              No appointments scheduled for this filter.
                            </div>
                          ) : (
                            displayedSchedules.map((apt) => {
                              const isCompleted = apt.status === "Completed";
                              const isInProgress = apt.status === "In Progress";

                              return (
                                <div
                                  key={apt.id}
                                  className={`p-3 rounded-2xl border transition flex items-center justify-between ${
                                    isCompleted
                                      ? "bg-gray-50/70 border-gray-200 opacity-80"
                                      : isInProgress
                                      ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30"
                                      : "bg-white border-gray-200/80 hover:border-emerald-300 hover:shadow-2xs"
                                  }`}
                                >
                                  <div
                                    onClick={() => setSelectedAppointment(apt)}
                                    className="flex items-center gap-3 cursor-pointer flex-1"
                                  >
                                    <div
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                        isCompleted
                                          ? "bg-gray-200 text-gray-600"
                                          : isInProgress
                                          ? "bg-emerald-600 text-white animate-pulse"
                                          : "bg-[#072a22] text-emerald-300"
                                      }`}
                                    >
                                      {apt.tokenNo}
                                    </div>

                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">
                                          {apt.patient}
                                        </h4>
                                        {apt.priority === "High" && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="High Priority" />
                                        )}
                                      </div>
                                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Clock className="w-3 h-3 text-gray-400" /> {apt.time} • {apt.type}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {!isCompleted && (
                                      <button
                                        onClick={() => handleCallToken(apt.tokenNo, apt.patient)}
                                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition cursor-pointer"
                                        title="Broadcast Call Token"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                        isCompleted
                                          ? "bg-gray-200 text-gray-700"
                                          : isInProgress
                                          ? "bg-emerald-100 text-emerald-800"
                                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      }`}
                                    >
                                      {apt.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDayNum(12)}
                        className="w-full py-2 bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-xl text-xs font-semibold transition border border-gray-200 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Jump Back to Today (12 Sep)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Financial Revenue</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-4 my-2">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-full border-4 border-emerald-500 border-t-transparent">
                          <span className="text-xs font-extrabold text-gray-800">92%</span>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400">Total Revenue</p>
                          <h3
                            className="text-lg font-bold text-gray-800"
                            suppressHydrationWarning
                          >
                            ₹{revenue.toLocaleString("en-IN")}
                          </h3>
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-gray-50 pt-2 text-[11px] text-gray-500">
                        <span>
                          Active Invoices: <b className="text-gray-700">{patients.length}</b>
                        </span>
                        <span>
                          Live Claims: <b className="text-emerald-700">Settled</b>
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">Bed Occupancy</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          +{availableBedsCount} Clean
                        </span>
                      </div>
                      <div className="my-1">
                        <h3 className="text-3xl font-extrabold text-gray-800">{availableBedsCount}</h3>
                        <p className="text-[11px] text-gray-400">
                          Available capacity ({beds?.length || 0} Total Beds)
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs font-medium text-gray-600 border-t border-gray-50 pt-2">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" /> Occupied: {occupiedBedsCount}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="w-3.5 h-3.5 text-gray-400" /> Available: {availableBedsCount}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-gray-200/70 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700">
                          Database Records ({patients.length})
                        </span>
                        <button
                          onClick={refreshPatients}
                          className="text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        </button>
                      </div>

                      <div className="space-y-2 my-2 max-h-36 overflow-y-auto">
                        {patients.length === 0 ? (
                          <p className="text-xs text-gray-400 py-3 text-center">
                            No patients saved yet.
                          </p>
                        ) : (
                          patients.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleOpenPatient(p)}
                              className="p-2.5 bg-gray-50 hover:bg-emerald-50/70 rounded-xl flex items-center justify-between cursor-pointer border border-transparent hover:border-emerald-200 transition"
                            >
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <div>
                                  <p className="text-xs font-semibold text-gray-800">{p.name}</p>
                                  <p className="text-[10px] text-gray-400">ABHA: {p.abhaId}</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-700 font-bold">View →</span>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-700 font-medium">
                        Synced with SQLite (Prisma ORM).
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      <CaseTakingModal
      isOpen={isCaseModalOpen}
      onClose={() => setIsCaseModalOpen(false)}
      />
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      <TeleConsultModal
        isOpen={isTeleModalOpen}
        onClose={() => setIsTeleModalOpen(false)}
      />

      <PatientProfileView
        isOpen={isProfileModalOpen}
        patient={selectedPatient}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedPatient(null);
        }}
      />

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Appointment: {selectedAppointment.id}
                  </h3>
                  <p className="text-[10px] text-gray-400">Encounter Details & Clinical Action</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/70 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Patient Name:</span>
                <b className="text-gray-800">{selectedAppointment.patient}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Assigned Doctor:</span>
                <b className="text-emerald-800">{selectedAppointment.doctor}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Scheduled Time:</span>
                <b className="text-gray-800">{selectedAppointment.time}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Consultation Type:</span>
                <b className="text-gray-800">{selectedAppointment.type}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Current Status:</span>
                <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                  {selectedAppointment.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsTeleModalOpen(true);
                }}
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Start Tele-Consult
              </button>

              <button
                onClick={() => {
                  setSelectedAppointment(null);
                  setIsCaseModalOpen(true);
                }}
                className="py-2.5 px-3 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" /> Open OPD Intake
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;