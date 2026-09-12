"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  FileSignature,
  CalendarCheck,
  Stethoscope,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Cross,
  Pill,
  FlaskConical,
  BedDouble,
  Droplets,
  Scan,
} from "lucide-react";

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  activeTab = "dashboard",
  setActiveTab,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "patients", label: "Patient Cases", icon: Users },
    { id: "prescription", label: "e-Prescription (Rx)", icon: FileSignature },
    { id: "wards", label: "Wards & Beds", icon: BedDouble },
    { id: "bloodbank", label: "Blood Bank", icon: Droplets },
    { id: "imaging", label: "Imaging PACS", icon: Scan },
    { id: "appointments", label: "Appointments", icon: CalendarCheck },
    { id: "intake", label: "Case Intake", icon: Stethoscope },
    { id: "pharmacy", label: "Medicine Stock", icon: Pill },
    { id: "lab", label: "Lab Reports", icon: FlaskConical },
    { id: "records", label: "Medical Records", icon: FileText },
    { id: "billing", label: "Finance & Bills", icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-[#072a22] text-white flex flex-col justify-between h-full border-r border-[#0d3f34] shrink-0 select-none">
      <div>
        <div className="px-6 py-6 border-b border-[#0d3f34]/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center shadow-lg shadow-emerald-900/40">
            <Cross className="w-5 h-5 text-[#072a22] fill-current" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-white">MedCare EHR</h2>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">
              SIH ABHA System
            </p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-emerald-300/60 uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab && setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-emerald-500 text-[#072a22] font-bold shadow-md shadow-emerald-500/20"
                    : "text-emerald-100/70 hover:bg-[#0c382e] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#072a22]" : "text-emerald-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[#0d3f34]/80 space-y-1.5">
        <button
          onClick={() => setActiveTab && setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
            activeTab === "settings"
              ? "bg-emerald-500 text-[#072a22] font-bold"
              : "text-emerald-200/70 hover:bg-[#0c382e] hover:text-white"
          }`}
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab("support")}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
            activeTab === "support"
              ? "bg-emerald-500 text-[#072a22] font-bold"
              : "text-emerald-200/70 hover:bg-[#0c382e] hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <span>Support & Guide</span>
        </button>

        {/* Doctor Profile Strip: Dr. Morgan */}
        <div className="pt-2">
          <div className="p-3 bg-[#0c382e] rounded-2xl flex items-center justify-between border border-[#144f42] shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=120&q=80"
                  alt="Dr. Morgan"
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-emerald-400/40 shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border border-[#0c382e] rounded-full" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-tight">Dr. Morgan</p>
                <p className="text-[10px] text-emerald-300/80 font-medium">Chief Medical Officer</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout Session"
              className="p-1.5 hover:bg-rose-500/20 rounded-lg text-emerald-400/70 hover:text-rose-400 cursor-pointer transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function SettingsView() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-gray-800">ABDM Facility & System Settings</h2>
        <p className="text-xs text-gray-500">Configure health facility registry & clinical defaults</p>
      </div>
    </div>
  );
}

export function SupportGuideView() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-gray-800">Hospital EHR & ABDM Helpdesk</h2>
        <p className="text-xs text-gray-500">Quick clinical reference and milestone compliance guide</p>
      </div>
    </div>
  );
}