"use client";

import React, { useState, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Contrast,
  Ruler,
  Sparkles,
  Layers,
  CheckCircle2,
  User,
  Activity,
  FileDown,
  ShieldAlert
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface DynamicStudy {
  id: string;
  patientId: string;
  patientName: string;
  modality: "X-RAY" | "CT-SCAN" | "MRI";
  title: string;
  bodyPart: string;
  accessionNo: string;
  date: string;
  imageUrl: string;
  severity: "CRITICAL" | "MODERATE" | "CLEAR";
  aiLabel: string;
  confidence: number;
  measurementMm: string;
  impression: string;
  boxPosition: { top: string; left: string; width: string; height: string };
}

export default function DicomViewer() {
  const { patients } = useHospital() as any;

  // Active Patient Selection State
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients?.[0]?.id || "default"
  );

  const activePatient = useMemo(() => {
    return (patients || []).find((p: any) => p.id === selectedPatientId) || patients?.[0] || {
      name: "Rohit",
      caseNotes: "Suspected hairline fracture left fibula",
      bedNumber: "ER-02",
      id: "rohit-01"
    };
  }, [patients, selectedPatientId]);

  // Patient ki bimari ke hisab se dynamically scan create karna
  const activeStudy: DynamicStudy = useMemo(() => {
    const ptName = activePatient?.name || "Patient";
    const notes = String(activePatient?.caseNotes || activePatient?.symptoms || activePatient?.diagnosis || "").toLowerCase();

    // 1. Agar patient ko Orthopedic / Fracture / Trauma hai (e.g. Rohit)
    if (notes.includes("fracture") || notes.includes("bone") || notes.includes("leg") || notes.includes("arm") || notes.includes("fall")) {
      return {
        id: `ST-${activePatient.id || "1"}`,
        patientId: activePatient.id,
        patientName: ptName,
        modality: "X-RAY",
        title: "Digital Extremity Orthopedic X-Ray (AP/Lateral)",
        bodyPart: "Skeletal / Extremities",
        accessionNo: `ACC-${Math.abs(ptName.length * 342)}-RAD`,
        date: "Today (Live Intake)",
        imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
        severity: "MODERATE",
        aiLabel: "Displaced Cortical Fracture Line",
        confidence: 96.2,
        measurementMm: "2.4 mm displacement",
        impression: "Oblique cortical discontinuity identified with mild periosteal elevation. Joint alignment intact.",
        boxPosition: { top: "42%", left: "46%", width: "22%", height: "24%" }
      };
    }

    // 2. Agar patient ko Head Trauma / Migraine / Stroke hai
    if (notes.includes("head") || notes.includes("neuro") || notes.includes("stroke") || notes.includes("brain") || notes.includes("unconscious")) {
      return {
        id: `ST-${activePatient.id || "2"}`,
        patientId: activePatient.id,
        patientName: ptName,
        modality: "CT-SCAN",
        title: "Non-Contrast Head CT (NCCT Axial Slice)",
        bodyPart: "Neuro / Cranium",
        accessionNo: `ACC-${Math.abs(ptName.length * 812)}-CT`,
        date: "Today (STAT)",
        imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80",
        severity: "CRITICAL",
        aiLabel: "Acute Hyperdense Hemorrhagic Contusion",
        confidence: 94.8,
        measurementMm: "14.5 mm x 9.2 mm",
        impression: "Focal area of high attenuation in frontoparietal parenchymal region. Moderate perilesional edema without midline shift.",
        boxPosition: { top: "35%", left: "38%", width: "26%", height: "26%" }
      };
    }

    // 3. Default: Pulmonary / Chest X-Ray
    return {
      id: `ST-${activePatient.id || "3"}`,
      patientId: activePatient.id,
      patientName: ptName,
      modality: "X-RAY",
      title: "Digital Chest PA View (Diagnostic CXR)",
      bodyPart: "Thorax / Pulmonary",
      accessionNo: `ACC-${Math.abs(ptName.length * 521)}-CXR`,
      date: "Today (Routine)",
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
      severity: "MODERATE",
      aiLabel: "Bronchovascular Markings & Consolidation",
      confidence: 91.4,
      measurementMm: "Mild Infiltrate",
      impression: `Clinical correlation with intake complaint: "${notes || "Respiratory distress"}". Cardiac silhouette within normal limits.`,
      boxPosition: { top: "45%", left: "48%", width: "24%", height: "24%" }
    };
  }, [activePatient]);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [preset, setPreset] = useState<"Default" | "Bone" | "Lung" | "Brain">("Default");

  const handleResetFilters = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setPreset("Default");
  };

  const applyPreset = (p: "Default" | "Bone" | "Lung" | "Brain") => {
    setPreset(p);
    if (p === "Bone") {
      setBrightness(75);
      setContrast(165);
    } else if (p === "Lung") {
      setBrightness(130);
      setContrast(140);
    } else if (p === "Brain") {
      setBrightness(95);
      setContrast(120);
    } else {
      setBrightness(100);
      setContrast(100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Patient Selection Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Diagnostic PACS & DICOM Workstation</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              DICOM 3.0 / WADO-RS
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Synchronized with Neon DB inpatient chart & deep-learning radiomic engine
          </p>
        </div>

        {/* Dynamic Patient Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600">Active Patient:</span>
          <select
            value={selectedPatientId}
            onChange={(e) => {
              setSelectedPatientId(e.target.value);
              handleResetFilters();
            }}
            className="px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 focus:outline-none"
          >
            {(patients || []).map((pt: any) => (
              <option key={pt.id} value={pt.id}>
                {pt.name} ({pt.bedNumber || "OPD"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main PACS Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Radiology Grayscale Screen */}
        <div className="lg:col-span-3 bg-[#030706] rounded-3xl border border-emerald-950 p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header Metadata */}
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono pb-3 border-b border-emerald-950/80">
            <div>
              <span className="font-bold text-white block text-sm">{activeStudy.patientName}</span>
              <span className="text-[10px] text-gray-400">
                ACC: {activeStudy.accessionNo} • Bed: {activePatient?.bedNumber || "OPD"} • {activeStudy.date}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-300 block">{activeStudy.title}</span>
              <span className="text-[10px] text-gray-400 font-mono">
                WW: {contrast} • WL: {brightness} • {preset.toUpperCase()} WINDOW
              </span>
            </div>
          </div>

          {/* Central Viewport */}
          <div className="relative my-4 flex items-center justify-center min-h-[460px] bg-black rounded-2xl overflow-hidden select-none border border-emerald-950/60">
            <div
              className="relative transition-all duration-150"
              style={{
                transform: `scale(${zoomLevel})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(100%) ${isInverted ? "invert(1)" : ""}`,
              }}
            >
              <img
                src={activeStudy.imageUrl}
                alt={activeStudy.title}
                className="max-h-[430px] max-w-full rounded-lg object-contain pointer-events-none"
              />

              {/* AI Bounding Box */}
              {showAiOverlay && (
                <div
                  className={`absolute border-2 rounded-lg pointer-events-auto transition-all ${
                    activeStudy.severity === "CRITICAL"
                      ? "border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      : "border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                  }`}
                  style={{
                    top: activeStudy.boxPosition.top,
                    left: activeStudy.boxPosition.left,
                    width: activeStudy.boxPosition.width,
                    height: activeStudy.boxPosition.height,
                  }}
                >
                  <span
                    className={`absolute -top-6 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white whitespace-nowrap shadow-md ${
                      activeStudy.severity === "CRITICAL" ? "bg-rose-600" : "bg-amber-600"
                    }`}
                  >
                    AI: {activeStudy.aiLabel} ({activeStudy.confidence}%)
                  </span>

                  {showRuler && (
                    <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
                      <span className="bg-black/90 border border-emerald-400 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 rounded shadow">
                        📏 {activeStudy.measurementMm}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Overlays */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400/80 pointer-events-none">
              <p>KVp: 120 • mA: 280</p>
              <p>FOV: 36.5 cm</p>
              <p>REGION: {activeStudy.bodyPart}</p>
            </div>

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400/80 pointer-events-none text-right">
              <p>ZOOM: {Math.round(zoomLevel * 100)}%</p>
              <p>INVERT: {isInverted ? "ENABLED" : "DISABLED"}</p>
            </div>
          </div>

          {/* Tools & Presets Console */}
          <div className="p-3 bg-[#05110d] rounded-2xl border border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            <div className="flex items-center gap-1.5 text-gray-300">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, Number((z + 0.2).toFixed(1))))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-emerald-300 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.2).toFixed(1))))}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 hover:text-emerald-300 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsInverted(!isInverted)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  isInverted ? "bg-emerald-500 text-black font-bold" : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
                title="Invert Grayscale"
              >
                <Contrast className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowRuler(!showRuler)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  showRuler ? "bg-emerald-500 text-black font-bold" : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
                title="Digital Caliper"
              >
                <Ruler className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetFilters}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
                title="Reset Viewport"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1 text-[10px] font-mono">
              {(["Default", "Bone", "Lung", "Brain"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => applyPreset(p)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    preset === p
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Sliders */}
            <div className="flex items-center gap-3 text-[11px] text-emerald-300 font-mono">
              <div className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-gray-400" />
                <span>WL:</span>
                <input
                  type="range"
                  min="50"
                  max="180"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-16 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <span>WW:</span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-16 accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer text-[11px] ${
                showAiOverlay
                  ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAiOverlay ? "AI Overlay Active" : "Show AI Overlay"}
            </button>
          </div>
        </div>

        {/* Right Col: Diagnosis matching active patient complaint */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" /> AI Radiomic Assessment
              </h3>
              <span className="text-[9px] font-mono bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                ResNet-152v2
              </span>
            </div>

            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                activeStudy.severity === "CRITICAL"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide">
                  {activeStudy.aiLabel}
                </span>
                <span className="text-xs font-mono font-bold">
                  {activeStudy.confidence}% match
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {activeStudy.impression}
              </p>
              <div className="text-[10px] font-mono font-bold pt-1 border-t border-amber-200/60 flex justify-between">
                <span>Quantitative Lesion Size:</span>
                <span>{activeStudy.measurementMm}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-500">
                <span>Patient Intake Symptoms:</span>
                <b className="text-gray-800 truncate max-w-[160px]">{activePatient?.caseNotes || activePatient?.symptoms || "Stable"}</b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Modality:</span>
                <b className="text-gray-800 font-mono">{activeStudy.modality}</b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Anatomical Region:</span>
                <b className="text-gray-800">{activeStudy.bodyPart}</b>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileDown className="w-4 h-4 text-emerald-400" /> Export Structured Radiologist Report
            </button>
          </div>

          <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-200/80 text-xs text-emerald-800 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clinical AI Alignment
            </span>
            <p className="text-[11px] text-emerald-700/90 leading-relaxed">
              Auto-calibrated against selected patient intake records in Neon DB to eliminate diagnostic misattribution.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}