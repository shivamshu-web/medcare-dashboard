"use client";

import React, { useState } from "react";
import { Cross, ShieldCheck, Lock, User, Stethoscope, ArrowRight } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; role: string; mciNumber: string }) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [doctorId, setDoctorId] = useState("DR-SOURAV-981");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      onLoginSuccess({
        name: "Dr. Sourav",
        role: "Duty Medical Officer",
        mciNumber: "MCI-84920",
      });
      setLoading(false);
    }, 600);
  };

  const handleQuickDemo = () => {
    onLoginSuccess({
      name: "Dr. Sourav",
      role: "Duty Medical Officer",
      mciNumber: "MCI-84920",
    });
  };

  return (
    <div className="min-h-screen w-screen bg-[#f4f7f6] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden">
        
        {/* Top Medical Facility Branding */}
        <div className="bg-[#072a22] text-white p-8 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40 mb-3">
            <Cross className="w-6 h-6 text-[#072a22] fill-current" />
          </div>
          <h2 className="text-xl font-black tracking-tight">MedCare Clinical EHR</h2>
          <p className="text-[11px] text-emerald-300/80 mt-1 font-medium">
            National Health Authority • ABDM Integrated Node
          </p>
          <div className="inline-flex items-center gap-1 mt-3 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/20">
            <ShieldCheck className="w-3 h-3" /> Encrypted Session Gateway
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Doctor ID / HPR Registry ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">
              Security Token / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? "Authenticating Session..." : "Secure Duty Sign In"}
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Quick Demo Access for Presentation */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Instant Doctor Quick Login (Demo)
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}