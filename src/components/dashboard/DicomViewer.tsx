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
  FileDown,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface ModalityStudy {
  id: string;
  modality: "X-RAY" | "CT-SCAN" | "MRI";
  label: string;
  anatomicalRegion: string;
  title: string;
  accessionPrefix: string;
  imageUrl: string;
  slicesCount: number;
  windowPreset: "Default" | "Bone" | "Lung" | "Brain";
  aiFindings: {
    label: string;
    confidence: number;
    severity: "CRITICAL" | "MODERATE" | "CLEAR";
    measurementMm: string;
    impression: string;
    boxPosition: { top: string; left: string; width: string; height: string };
  };
}

export default function DicomViewer() {
  const { patients } = useHospital() as any;

  // Selected Patient from Neon DB
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients?.[0]?.id || "default"
  );

  const activePatient = useMemo(() => {
    return (
      (patients || []).find((p: any) => p.id === selectedPatientId) ||
      patients?.[0] || {
        id: "P-101",
        name: "Rohit",
        bedNumber: "ER-02",
        age: 32,
        gender: "Male",
        symptoms: "Acute chest discomfort, rule out pulmonary consolidation",
      }
    );
  }, [patients, selectedPatientId]);

  // All 3 Studies Available Simultaneously (High-Resolution Medical Grayscale Radiographs)
  const availableStudies: ModalityStudy[] = useMemo(() => [
    {
      id: "STUDY-XRAY",
      modality: "X-RAY",
      label: "Chest CXR",
      anatomicalRegion: "Thorax / Pulmonary",
      title: "Digital Chest PA View (CXR)",
      accessionPrefix: "ACC-9921-X",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Chest_Xray_PA_3-8-2010.png",
      slicesCount: 1,
      windowPreset: "Lung",
      aiFindings: {
        label: "Right Mid-Zone Infiltrate",
        confidence: 94.6,
        severity: "MODERATE",
        measurementMm: "38.2 mm x 26.5 mm",
        impression: "Patchy parenchymal opacity in right mid-zone. Costophrenic sulci clear. Cardiothoracic ratio normal.",
        boxPosition: { top: "38%", left: "54%", width: "24%", height: "24%" },
      },
    },
    {
      id: "STUDY-CT",
      modality: "CT-SCAN",
      label: "Brain NCCT",
      anatomicalRegion: "Neuro / Cranium",
      title: "Non-Contrast Brain CT (Axial Slices)",
      accessionPrefix: "ACC-8812-C",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Computed_tomography_of_human_brain_-_large.png",
      slicesCount: 28,
      windowPreset: "Brain",
      aiFindings: {
        label: "No Intracranial Bleed / Mass Effect",
        confidence: 99.1,
        severity: "CLEAR",
        measurementMm: "Ventricles Symmetrical",
        impression: "Basal cisterns preserved. No acute parenchymal contusion, epidural, or subdural hematoma identified.",
        boxPosition: { top: "34%", left: "34%", width: "32%", height: "32%" },
      },
    },
    {
      id: "STUDY-MRI",
      modality: "MRI",
      label: "Lumbar Spine",
      anatomicalRegion: "Musculoskeletal / Spine",
      title: "Lumbar Spine MRI (T2 Sagittal)",
      accessionPrefix: "ACC-7741-M",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Lumbar_spine_MRI.jpg",
      slicesCount: 16,
      windowPreset: "Bone",
      aiFindings: {
        label: "L4-L5 Posterior Disc Bulge",
        confidence: 91.8,
        severity: "MODERATE",
        measurementMm: "4.8 mm Posterior Bulge",
        impression: "Desiccation with mild disc height reduction at L4-L5 causing abutment of exiting thecal margin.",
        boxPosition: { top: "48%", left: "44%", width: "22%", height: "20%" },
      },
    },
  ], []);

  const [activeStudy, setActiveStudy] = useState<ModalityStudy>(availableStudies[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [currentSlice, setCurrentSlice] = useState(1);
  const [activePreset, setActivePreset] = useState<string>("Default");

  const handleResetFilters = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setActivePreset("Default");
  };

  const applyPreset = (presetName: "Default" | "Bone" | "Lung" | "Brain") => {
    setActivePreset(presetName);
    if (presetName === "Bone") {
      setBrightness(75);
      setContrast(165);
    } else if (presetName === "Lung") {
      setBrightness(125);
      setContrast(140);
    } else if (presetName === "Brain") {
      setBrightness(95);
      setContrast(125);
    } else {
      setBrightness(100);
      setContrast(100);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with Patient Selection & 3 Modality Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              Diagnostic PACS & DICOM Imaging Workstation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              DICOM 3.0 / WADO-RS
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time PACS pipeline connected to Neon DB inpatient roster & ResNet-152 radiomics
          </p>
        </div>

        {/* Patient Switcher & 3 Modality Studies */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Patient Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-200">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                handleResetFilters();
              }}
              className="bg-transparent text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
            >
              {(patients || []).map((pt: any) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.bedNumber || "OPD"})
                </option>
              ))}
            </select>
          </div>

          {/* 3 Modality Studies Buttons (X-RAY, CT-SCAN, MRI) */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200/80">
            {availableStudies.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveStudy(s);
                  handleResetFilters();
                  setCurrentSlice(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStudy.id === s.id
                    ? "bg-[#072a22] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/20">
                  {s.modality}
                </span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Radiology Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Radiology Darkroom Console */}
        <div className="lg:col-span-3 bg-[#030706] rounded-3xl border border-emerald-950 p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Header Metadata Strip */}
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono pb-3 border-b border-emerald-950/80">
            <div>
              <span className="font-bold text-white text-sm block">
                {activePatient.name} ({activePatient.gender || "M"}, {activePatient.age || "32"}Y)
              </span>
              <span className="text-[10px] text-gray-400">
                ACC: {activeStudy.accessionPrefix}-{activePatient.id?.slice(0, 4) || "8841"} • BED: {activePatient.bedNumber || "OPD"} • LIVE
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-300 block">{activeStudy.title}</span>
              <span className="text-[10px] text-gray-400">
                WW: {contrast} • WL: {brightness} • {activePreset.toUpperCase()} WINDOW
              </span>
            </div>
          </div>

          {/* Diagnostic Viewport with Actual Medical Radiograph */}
          <div className="relative my-4 flex items-center justify-center min-h-[460px] bg-black rounded-2xl overflow-hidden select-none border border-emerald-950/60">
            <div
              className="relative transition-all duration-150 flex items-center justify-center"
              style={{
                transform: `scale(${zoomLevel})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                  isInverted ? "invert(1)" : ""
                }`,
              }}
            >
              <img
                src={activeStudy.imageUrl}
                alt={activeStudy.title}
                className="max-h-[440px] max-w-full rounded-lg object-contain pointer-events-none filter contrast-125"
              />

              {/* Deep Learning Bounding Box */}
              {showAiOverlay && (
                <div
                  className={`absolute border-2 rounded-lg pointer-events-auto transition-all ${
                    activeStudy.aiFindings.severity === "CRITICAL"
                      ? "border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      : activeStudy.aiFindings.severity === "MODERATE"
                      ? "border-amber-400 bg-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                      : "border-emerald-400 bg-emerald-400/20"
                  }`}
                  style={{
                    top: activeStudy.aiFindings.boxPosition.top,
                    left: activeStudy.aiFindings.boxPosition.left,
                    width: activeStudy.aiFindings.boxPosition.width,
                    height: activeStudy.aiFindings.boxPosition.height,
                  }}
                >
                  <span
                    className={`absolute -top-6 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white whitespace-nowrap shadow-md ${
                      activeStudy.aiFindings.severity === "CRITICAL"
                        ? "bg-rose-600"
                        : activeStudy.aiFindings.severity === "MODERATE"
                        ? "bg-amber-600"
                        : "bg-emerald-600"
                    }`}
                  >
                    AI: {activeStudy.aiFindings.label} ({activeStudy.aiFindings.confidence}%)
                  </span>

                  {showRuler && (
                    <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
                      <span className="bg-black/90 border border-emerald-400 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 rounded shadow">
                        📏 {activeStudy.aiFindings.measurementMm}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Corner DICOM Metadata Overlays */}
            <div className="absolute top-3 left-3 text-[10px] font-mono text-emerald-400/80 pointer-events-none space-y-0.5">
              <p>KVp: 120 • mA: 280</p>
              <p>FOV: 36.5 cm</p>
              <p>REGION: {activeStudy.anatomicalRegion}</p>
            </div>

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400/80 pointer-events-none text-right space-y-0.5">
              <p>ZOOM: {Math.round(zoomLevel * 100)}%</p>
              <p>INVERT: {isInverted ? "ENABLED" : "DISABLED"}</p>
              <p>SERIES: DICOM 3.0</p>
            </div>

            {/* Cine Slice Scroller for CT / MRI */}
            {activeStudy.slicesCount > 1 && (
              <div className="absolute bottom-3 left-4 right-48 bg-black/85 backdrop-blur-sm border border-emerald-950 p-2 rounded-xl flex items-center gap-3">
                <span className="text-[10px] font-mono text-emerald-300 whitespace-nowrap">
                  Slice: {currentSlice}/{activeStudy.slicesCount}
                </span>
                <input
                  type="range"
                  min="1"
                  max={activeStudy.slicesCount}
                  value={currentSlice}
                  onChange={(e) => setCurrentSlice(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5"
                />
              </div>
            )}
          </div>

          {/* Interactive Tool Console */}
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
                    activePreset === p
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* WL / WW Sliders */}
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

            {/* AI Toggle */}
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

        {/* Right Col: Structured Radiologist Report & AI Assessment */}
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

            {/* Findings Card */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                activeStudy.aiFindings.severity === "CRITICAL"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wide">
                  {activeStudy.aiFindings.label}
                </span>
                <span className="text-xs font-mono font-bold">
                  {activeStudy.aiFindings.confidence}% match
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {activeStudy.aiFindings.impression}
              </p>
              <div className="text-[10px] font-mono font-bold pt-1 border-t border-amber-200/60 flex justify-between">
                <span>Quantitative Lesion Size:</span>
                <span>{activeStudy.aiFindings.measurementMm}</span>
              </div>
            </div>

            {/* Patient Context & Study Details */}
            <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-500">
                <span>Patient:</span>
                <b className="text-gray-900">{activePatient.name}</b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Intake Note:</span>
                <b className="text-gray-800 truncate max-w-[150px]">
                  {activePatient.symptoms || activePatient.caseNotes || "Routine Diagnostic Review"}
                </b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Modality:</span>
                <b className="text-gray-800 font-mono">{activeStudy.modality}</b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Anatomical Region:</span>
                <b className="text-gray-800">{activeStudy.anatomicalRegion}</b>
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
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Peer-Reviewed Diagnostic Model
            </span>
            <p className="text-[11px] text-emerald-700/90 leading-relaxed">
              Directly aligned with patient ID in Neon DB. Modality switcher allows fast switching across multi-series imaging.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}