"use client";

import { useState } from "react";
import { calculateBMI, calculateMAP } from "@/lib/vitals";

export default function VitalsCalculator() {
  const [vitals, setVitals] = useState({
    weight: 72,
    height: 175,
    systolic: 120,
    diastolic: 80,
  });

  const bmiData = calculateBMI(vitals.weight, vitals.height);
  const mapData = calculateMAP(vitals.systolic, vitals.diastolic);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-4">
        Patient Vitals & Auto-Calculated Metrics
      </h3>

      {/* Input Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-xs text-slate-500 font-medium">Height (cm)</label>
          <input
            type="number"
            value={vitals.height}
            onChange={(e) => setVitals({ ...vitals, height: +e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm text-slate-800"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Weight (kg)</label>
          <input
            type="number"
            value={vitals.weight}
            onChange={(e) => setVitals({ ...vitals, weight: +e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm text-slate-800"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Systolic (mmHg)</label>
          <input
            type="number"
            value={vitals.systolic}
            onChange={(e) => setVitals({ ...vitals, systolic: +e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm text-slate-800"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium">Diastolic (mmHg)</label>
          <input
            type="number"
            value={vitals.diastolic}
            onChange={(e) => setVitals({ ...vitals, diastolic: +e.target.value })}
            className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm text-slate-800"
          />
        </div>
      </div>

      {/* Automated Metrics Display */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* BMI Box */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">BMI</span>
            {bmiData && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${bmiData.color}`}>
                {bmiData.category}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {bmiData ? bmiData.value : "--"} <span className="text-sm font-normal text-slate-500">kg/m²</span>
          </p>
        </div>

        {/* MAP Box */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">MAP (Arterial Pressure)</span>
            {mapData && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${mapData.color}`}>
                {mapData.status}
              </span>
            )}
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {mapData ? mapData.value : "--"} <span className="text-sm font-normal text-slate-500">mmHg</span>
          </p>
        </div>
      </div>
    </div>
  );
}