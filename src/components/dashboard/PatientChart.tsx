"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Users, Calendar, Activity } from "lucide-react";

export default function PatientChart() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Weekly Dataset (Monday - Sunday)
  const weeklyData = [
    { name: "Mon", opd: 48, teleConsult: 22, emergency: 12 },
    { name: "Tue", opd: 55, teleConsult: 28, emergency: 8 },
    { name: "Wed", opd: 68, teleConsult: 38, emergency: 15 },
    { name: "Thu", opd: 62, teleConsult: 34, emergency: 10 },
    { name: "Fri", opd: 76, teleConsult: 44, emergency: 18 },
    { name: "Sat", opd: 84, teleConsult: 52, emergency: 22 },
    { name: "Sun", opd: 40, teleConsult: 26, emergency: 14 },
  ];

  // 2. Monthly Dataset (Jan - Sep)
  const monthlyData = [
    { name: "Jan", opd: 340, teleConsult: 180, emergency: 65 },
    { name: "Feb", opd: 410, teleConsult: 210, emergency: 72 },
    { name: "Mar", opd: 490, teleConsult: 280, emergency: 85 },
    { name: "Apr", opd: 530, teleConsult: 320, emergency: 90 },
    { name: "May", opd: 620, teleConsult: 390, emergency: 110 },
    { name: "Jun", opd: 710, teleConsult: 430, emergency: 125 },
    { name: "Jul", opd: 760, teleConsult: 470, emergency: 135 },
    { name: "Aug", opd: 830, teleConsult: 520, emergency: 145 },
    { name: "Sep", opd: 890, teleConsult: 580, emergency: 160 },
  ];

  // 3. Yearly Dataset (2022 - 2026)
  const yearlyData = [
    { name: "2022", opd: 3600, teleConsult: 1400, emergency: 650 },
    { name: "2023", opd: 5400, teleConsult: 2600, emergency: 920 },
    { name: "2024", opd: 7600, teleConsult: 4300, emergency: 1200 },
    { name: "2025", opd: 10200, teleConsult: 6600, emergency: 1480 },
    { name: "2026 (YTD)", opd: 12800, teleConsult: 8400, emergency: 1920 },
  ];

  const currentData =
    timeframe === "weekly"
      ? weeklyData
      : timeframe === "monthly"
      ? monthlyData
      : yearlyData;

  const totalOpd = currentData.reduce((acc, item) => acc + item.opd, 0);
  const totalTele = currentData.reduce((acc, item) => acc + item.teleConsult, 0);
  const totalEmergency = currentData.reduce((acc, item) => acc + item.emergency, 0);
  const grandTotal = totalOpd + totalTele + totalEmergency;

  const timeframeLabels = {
    weekly: "This Week",
    monthly: "This Year (Monthly Trend)",
    yearly: "5-Year Comparison",
  };

  const growthRates = {
    weekly: "+12.4%",
    monthly: "+24.8%",
    yearly: "+38.2%",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
      {/* Header Section with Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800">Patient Inflow & Clinical Statistics</h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600 animate-pulse" /> Live Telemetry Synced
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Viewing: <b className="text-gray-700">{timeframeLabels[timeframe]}</b> • Total Patients:{" "}
            <b className="text-emerald-800 font-bold">{grandTotal.toLocaleString("en-IN")}</b>
          </p>
        </div>

        {/* Dynamic Buttons: Weekly / Monthly / Yearly */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200/80 text-xs font-bold self-start sm:self-auto">
          {(["weekly", "monthly", "yearly"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer capitalize ${
                timeframe === t
                  ? "bg-[#072a22] text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#072a22]" /> OPD Consults
            </span>
            <span className="text-[10px] font-semibold text-emerald-600">{growthRates[timeframe]}</span>
          </div>
          <p className="text-base font-black text-gray-800 mt-1">{totalOpd.toLocaleString("en-IN")}</p>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tele-Consults
            </span>
            <span className="text-[10px] font-semibold text-emerald-600">Active</span>
          </div>
          <p className="text-base font-black text-emerald-700 mt-1">{totalTele.toLocaleString("en-IN")}</p>
        </div>

        <div className="p-3 rounded-2xl bg-gray-50/80 border border-gray-100">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[10px] uppercase font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> ER / Trauma
            </span>
            <span className="text-[10px] font-semibold text-rose-600">STAT</span>
          </div>
          <p className="text-base font-black text-rose-700 mt-1">{totalEmergency.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* Responsive Recharts Graph Area */}
      <div className="h-64 w-full pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartColorOpd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#072a22" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#072a22" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="chartColorTele" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              />

              <Area
                type="monotone"
                dataKey="opd"
                stroke="#072a22"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartColorOpd)"
                name="OPD In-Clinic"
              />
              <Area
                type="monotone"
                dataKey="teleConsult"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartColorTele)"
                name="Tele-Consultancy"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
            Loading analytics graph...
          </div>
        )}
      </div>
    </div>
  );
}