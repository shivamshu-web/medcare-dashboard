"use client";

import React, { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Siren,
  Stethoscope,
  UserCheck,
  ShieldCheck,
  X,
  AlertTriangle,
  Clock,
  FileText,
} from "lucide-react";
import AbdmComplianceModal from "@/components/dashboard/AbdmComplianceModal";

interface HeaderProps {
  onAddPatient?: () => void;
  onOpenEmergency?: () => void;
  currentRole?: "doctor" | "patient";
  onToggleRole?: (role: "doctor" | "patient") => void;
}

export default function Header({
  onAddPatient,
  onOpenEmergency,
  currentRole = "doctor",
  onToggleRole,
}: HeaderProps) {
  const [isAbdmModalOpen, setIsAbdmModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      type: "emergency",
      title: "ER Bed Allocation Alert",
      desc: "Trauma Bed ER-01 occupied by Code Red Protocol.",
      time: "2m ago",
      read: false,
    },
    {
      id: "notif-2",
      type: "abdm",
      title: "ABDM Consent Approved",
      desc: "Patient Rajeshwar Singh approved HIU health record fetch.",
      time: "15m ago",
      read: false,
    },
    {
      id: "notif-3",
      type: "lab",
      title: "STAT Lab Report Ready",
      desc: "Token LAB-402 Lipid & Creatinine is ready for review.",
      time: "32m ago",
      read: false,
    },
    {
      id: "notif-4",
      type: "pharmacy",
      title: "Low Stock: Normal Saline (NS)",
      desc: "Inventory depleted to 0 units in Central Store.",
      time: "1h ago",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between shrink-0 relative z-30">
      {/* Search Bar & Compliance Badge */}
      <div className="flex items-center gap-3">
        <div className="relative w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Patient or ABHA..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200/80 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 transition"
          />
        </div>

        <button
          onClick={() => setIsAbdmModalOpen(true)}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          title="Click to view NHA M1, M2, M3 Compliance & Audit Logs"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ABDM M1•M2•M3</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* DUAL-VIEW ROLE SWITCHER PILL */}
      <div className="bg-gray-100 p-1 rounded-2xl flex items-center border border-gray-200/80 shadow-2xs">
        <button
          onClick={() => onToggleRole && onToggleRole("doctor")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentRole === "doctor"
              ? "bg-[#072a22] text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
          <span>Doctor Desk</span>
        </button>

        <button
          onClick={() => onToggleRole && onToggleRole("patient")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            currentRole === "patient"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
          <span>Patient Portal</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenEmergency}
          className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/30 transition flex items-center gap-2 cursor-pointer animate-pulse"
        >
          <Siren className="w-4 h-4 text-white" />
          <span>🚨 CODE RED (ER)</span>
        </button>

        <button
          onClick={onAddPatient}
          className="px-4 py-2 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Intake</span>
        </button>

        {/* REALISTIC 3D GOLDEN BELL BADGE */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative shadow-xs border ${
              isNotificationsOpen
                ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/40"
                : "bg-gradient-to-b from-white to-gray-50 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50"
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 text-amber-500 fill-amber-400 filter drop-shadow-[0_2px_4px_rgba(245,158,11,0.35)]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-md shadow-rose-600/50 animate-bounce ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          {/* NOTIFICATION FLYOUT */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-[#072a22] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  </div>
                  <h4 className="text-xs font-bold">Clinical Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-extrabold">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
                  >
                    Mark read
                  </button>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-gray-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 transition flex items-start gap-3 hover:bg-gray-50 ${
                      !item.read ? "bg-emerald-50/40" : "bg-white"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        item.type === "emergency"
                          ? "bg-rose-100 text-rose-600"
                          : item.type === "abdm"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.type === "lab"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.type === "emergency" ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : item.type === "abdm" ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : item.type === "lab" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-gray-800">{item.title}</h5>
                        <span className="text-[10px] text-gray-400 font-mono">{item.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-gray-50 text-center border-t border-gray-100">
                <span className="text-[10px] text-gray-400 font-medium">
                  Live ABDM & Hospital Socket Connected • 0s Latency
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <AbdmComplianceModal
        isOpen={isAbdmModalOpen}
        onClose={() => setIsAbdmModalOpen(false)}
      />
    </header>
  );
}