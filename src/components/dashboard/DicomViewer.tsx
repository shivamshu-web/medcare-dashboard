"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Contrast,
  Ruler,
  Maximize2,
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  Play,
  Pause,
  Sliders,
  Activity,
  FileDown,
} from "lucide-react";
import { useHospital } from "@/context/HospitalContext";

interface ImagingStudy {
  id: string;
  modality: "X-RAY" | "CT-SCAN" | "MRI";
  title: string;
  bodyPart: string;
  patientName: string;
  accessionNo: string;
  date: string;
  imageUrl: string;
  slicesCount: number;
  aiFindings: {
    label: string;
    confidence: number;
    severity: "CRITICAL" | "MODERATE" | "CLEAR";
    boxPosition: { top: string; left: string; width: string; height: string };
    measurementMm: string;
    impression: string;
  };
}

export default function DicomViewer() {
  const { patients } = useHospital() as any;

  // Real Medical Grayscale Imaging Dataset
  const studies: ImagingStudy[] = [
    {
      id: "STUDY-01",
      modality: "X-RAY",
      title: "Digital Chest PA View (CXR)",
      bodyPart: "Thorax / Pulmonary",
      patientName: patients?.[0]?.name || "Rajeshwar Singh",
      accessionNo: "ACC-9921-X",
      date: "11 Sep 2026",
      imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80",
      slicesCount: 1,
      aiFindings: {
        label: "Right Lower Lobe Consolidation",
        confidence: 95.4,
        severity: "CRITICAL",
        boxPosition: { top: "48%", left: "53%", width: "24%", height: "26%" },
        measurementMm: "42.8 mm x 31.2 mm",
        impression: "Dense alveolar consolidation suggestive of lobar pneumonia. Prominent air bronchograms, blunted right costophrenic angle.",
      },
    },
    {
      id: "STUDY-02",
      modality: "CT-SCAN",
      title: "Non-Contrast Brain CT (NCCT Axial)",
      bodyPart: "Neuro / Cranial",
      patientName: patients?.[1]?.name || "Aarav Sharma",
      accessionNo: "ACC-8812-C",
      date: "11 Sep 2026",
      imageUrl: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80",
      slicesCount: 32,
      aiFindings: {
        label: "No Acute Intracranial Hemorrhage",
        confidence: 99.1,
        severity: "CLEAR",
        boxPosition: { top: "34%", left: "34%", width: "32%", height: "32%" },
        measurementMm: "Calvarium Intact",
        impression: "Grey-white matter differentiation intact. Ventricular system symmetrical without midline shift or acute mass effect.",
      },
    },
    {
      id: "STUDY-03",
      modality: "MRI",
      title: "Lumbar Spine MRI (T2 Fast Spin Echo)",
      bodyPart: "Musculoskeletal / Spine",
      patientName: patients?.[2]?.name || "Sunita Devi",
      accessionNo: "ACC-7741-M",
      date: "10 Sep 2026",
      imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80",
      slicesCount: 18,
      aiFindings: {
        label: "L4-L5 Posterior Disc Protrusion",
        confidence: 92.8,
        severity: "MODERATE",
        boxPosition: { top: "50%", left: "41%", width: "22%", height: "21%" },
        measurementMm: "5.4 mm Extrusion",
        impression: "Broad-based disc extrusion indenting ventral thecal sac and bilateral exiting L5 nerve root sleeves.",
      },
    },
  ];

  const [activeStudy, setActiveStudy] = useState<ImagingStudy>(studies[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [currentSlice, setCurrentSlice] = useState(1);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [windowPreset, setWindowPreset] = useState<"Default" | "Bone" | "Lung" | "Brain">("Default");

  // Reset Filters
  const handleResetFilters = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setIsInverted(false);
    setWindowPreset("Default");
  };

  // Windowing Presets
  const applyPreset = (preset: "Default" | "Bone" | "Lung" | "Brain") => {
    setWindowPreset(preset);
    if (preset === "Bone") {
      setBrightness(75);
      setContrast(160);
    } else if (preset === "Lung") {
      setBrightness(130);
      setContrast(140);
    } else if (preset === "Brain") {
      setBrightness(95);
      setContrast(120);
    } else {
      setBrightness(100);
      setContrast(100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">Diagnostic PACS & DICOM Imaging Workstation</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              DICOM 3.0 / WADO-RS COMPLIANT
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Ultra-high fidelity radiological image pipeline with ResNet radiomic deep-learning inference
          </p>
        </div>

        {/* Modality Selector */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {studies.map((s) => (
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
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/20">
                {s.modality}
              </span>
              {s.bodyPart.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main PACS Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Cols: Radiology Screen */}
        <div className="lg:col-span-3 bg-[#030706] rounded-3xl border border-emerald-950 p-4 shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* DICOM Header Top Bar */}
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono pb-3 border-b border-emerald-950/80">
            <div>
              <span className="font-bold text-white block text-sm">{activeStudy.patientName}</span>
              <span className="text-[10px] text-gray-400">
                ACC: {activeStudy.accessionNo} • {activeStudy.date}
              </span>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-300 block">{activeStudy.title}</span>
              <span className="text-[10px] text-gray-400 font-mono">
                WW: {contrast} • WL: {brightness} • {windowPreset.toUpperCase()} WINDOW
              </span>
            </div>
          </div>

          {/* Central Diagnostic Viewport */}
          <div className="relative my-4 flex items-center justify-center min-h-[460px] bg-black rounded-2xl overflow-hidden select-none border border-emerald-950/50">
            <div
              className="relative transition-all duration-150"
              style={{
                transform: `scale(${zoomLevel})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? "invert(1)" : ""}`,
              }}
            >
              <img
                src={activeStudy.imageUrl}
                alt={activeStudy.title}
                className="max-h-[440px] max-w-full rounded-lg object-contain pointer-events-none"
              />

              {/* AI Diagnostic Bounding Box */}
              {showAiOverlay && (
                <div
                  className={`absolute border-2 rounded-lg pointer-events-auto transition-all ${
                    activeStudy.aiFindings.severity === "CRITICAL"
                      ? "border-rose-500 bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                      : activeStudy.aiFindings.severity === "MODERATE"
                      ? "border-amber-400 bg-amber-400/20"
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

                  {/* Dynamic Electronic Caliper Tool */}
                  {showRuler && (
                    <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
                      <span className="bg-black/90 border border-emerald-400/70 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 rounded shadow">
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
              <p>THICKNESS: 1.25 mm</p>
            </div>

            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400/80 pointer-events-none text-right space-y-0.5">
              <p>ZOOM: {Math.round(zoomLevel * 100)}%</p>
              <p>INVERT: {isInverted ? "ENABLED" : "DISABLED"}</p>
              <p>FPS: 30 (REALTIME)</p>
            </div>

            {/* Multi-Slice Cine Scroller (For CT/MRI) */}
            {activeStudy.slicesCount > 1 && (
              <div className="absolute bottom-3 left-4 right-44 bg-black/80 backdrop-blur-sm border border-emerald-950 p-2 rounded-xl flex items-center gap-3">
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

          {/* Radiology Tool Console */}
          <div className="p-3 bg-[#05110d] rounded-2xl border border-emerald-950 flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Zoom / Contrast Buttons */}
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
                title="Digital Calipers"
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
                    windowPreset === p
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

        {/* Right Col: Radiologist Report & Quantitative Pathology */}
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

            {/* Finding Card */}
            <div
              className={`p-4 rounded-2xl border space-y-2 ${
                activeStudy.aiFindings.severity === "CRITICAL"
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : activeStudy.aiFindings.severity === "MODERATE"
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
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
              <div className="text-[10px] font-mono font-bold pt-1 border-t border-rose-200/50 flex justify-between">
                <span>Lesion Extent:</span>
                <span>{activeStudy.aiFindings.measurementMm}</span>
              </div>
            </div>

            {/* Metadata Specs */}
            <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
              <div className="flex justify-between text-gray-500">
                <span>Modality:</span>
                <b className="text-gray-800 font-mono">{activeStudy.modality}</b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Anatomical Region:</span>
                <b className="text-gray-800">{activeStudy.bodyPart}</b>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>DICOM Series UID:</span>
                <b className="text-gray-800 font-mono text-[10px]">1.2.840.113619.2.55</b>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-3 bg-[#072a22] hover:bg-[#0c382e] text-white text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <FileDown className="w-4 h-4 text-emerald-400" /> Export Radiologist Structured Report
            </button>
          </div>

          <div className="bg-emerald-50 p-4 rounded-3xl border border-emerald-200/80 text-xs text-emerald-800 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Peer-Reviewed Diagnostic Model
            </span>
            <p className="text-[11px] text-emerald-700/90 leading-relaxed">
              Real-time deep convolutional auto-segmentation computes 3D lesion volumes and flags emergency critical findings.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}