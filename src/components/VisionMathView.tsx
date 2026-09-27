"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Eye,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  BookOpen,
  Layers,
  Check,
} from "lucide-react";
import { OmniRouteConfig, VisionMathResult } from "@/types/stem";
import { MathView, MathText } from "@/components/MathView";

interface VisionMathViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
  onNavigateToCopilot?: (initialPrompt: string) => void;
  onNavigateToFlashcards?: () => void;
  onSaveToNotebook?: (title: string, content: string) => void;
}

// Built-in handwritten SVG data URLs for instant 1-click test presets
const HANDWRITTEN_PRESETS = [
  {
    id: "preset-calculus",
    title: "Handwritten Calculus: ∫ x·sin(x) dx",
    category: "Calculus",
    mathPrompt: "\\int x \\sin(x) dx",
    svgContent: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 180" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#18181b"/>
        <!-- Ruled notebook lines -->
        <line x1="20" y1="50" x2="480" y2="50" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="100" x2="480" y2="100" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="150" x2="480" y2="150" stroke="#27272a" stroke-width="1"/>
        <!-- Handwritten integral sign and math -->
        <path d="M 60 130 C 50 115 52 80 65 60 C 75 45 68 35 55 40" stroke="#e4e4e7" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <text x="85" y="98" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="38" fill="#e4e4e7">x · sin(x) dx = ?</text>
        <text x="85" y="142" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="22" fill="#a1a1aa">Let u = x, dv = sin(x)dx ...</text>
      </svg>
    `,
  },
  {
    id: "preset-physics",
    title: "Handwritten Physics: Carnot Efficiency",
    category: "Thermodynamics",
    mathPrompt: "\\eta = 1 - \\frac{T_2}{T_1} = \\frac{T_1 - T_2}{T_1}",
    svgContent: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 180" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#18181b"/>
        <line x1="20" y1="50" x2="480" y2="50" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="100" x2="480" y2="100" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="150" x2="480" y2="150" stroke="#27272a" stroke-width="1"/>
        <text x="50" y="95" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="36" fill="#e4e4e7">η = 1 - (T₂ / T₁) ; T in Kelvin</text>
        <text x="50" y="140" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="22" fill="#a1a1aa">Why is η < 100%? (Third Law limits)</text>
      </svg>
    `,
  },
  {
    id: "preset-algebra",
    title: "Handwritten Algebra: 2x² + 5x - 3 = 0",
    category: "Algebra",
    mathPrompt: "2x^2 + 5x - 3 = 0",
    svgContent: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 180" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#18181b"/>
        <line x1="20" y1="50" x2="480" y2="50" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="100" x2="480" y2="100" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="150" x2="480" y2="150" stroke="#27272a" stroke-width="1"/>
        <text x="50" y="95" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="36" fill="#e4e4e7">2x² + 5x - 3 = 0</text>
        <text x="50" y="140" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="22" fill="#a1a1aa">Solve by factoring & quadratic formula</text>
      </svg>
    `,
  },
  {
    id: "preset-electromagnetism",
    title: "Handwritten Ampere's Law: ∮ B·dl",
    category: "Electromagnetism",
    mathPrompt: "\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}}",
    svgContent: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 180" width="100%" height="100%">
        <rect width="100%" height="100%" fill="#18181b"/>
        <line x1="20" y1="50" x2="480" y2="50" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="100" x2="480" y2="100" stroke="#27272a" stroke-width="1"/>
        <line x1="20" y1="150" x2="480" y2="150" stroke="#27272a" stroke-width="1"/>
        <text x="50" y="95" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="34" fill="#e4e4e7">∮ B · dl = μ₀ I_enc (Cylinder radius R)</text>
        <text x="50" y="140" font-family="Caveat, 'Segoe Script', cursive, sans-serif" font-size="22" fill="#a1a1aa">Find B field at r < R and r > R</text>
      </svg>
    `,
  },
];

export default function VisionMathView({
  omniConfig,
  onNavigateToCopilot,
  onNavigateToFlashcards,
  onSaveToNotebook,
}: VisionMathViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [activePresetTitle, setActivePresetTitle] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionMathResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLatex, setCopiedLatex] = useState(false);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load default preset on initial mount
  useEffect(() => {
    loadSvgPreset(HANDWRITTEN_PRESETS[0]);
  }, []);

  const loadSvgPreset = (preset: typeof HANDWRITTEN_PRESETS[0]) => {
    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(preset.svgContent.trim())}`;
    setSelectedImage(encoded);
    setImageMimeType("image/svg+xml");
    setActivePresetTitle(preset.title);
    setErrorMessage(null);
  };

  // Handle local image file upload
  const handleImageFileSelect = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setImageMimeType(file.type);
      setActivePresetTitle(file.name);
      setVisionResult(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Webcam live capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setIsCameraActive(false);
      setErrorMessage("Could not open camera. Please grant camera permissions or upload an image file.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setSelectedImage(dataUrl);
      setImageMimeType("image/jpeg");
      setActivePresetTitle("Camera Snapshot");
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Execute Vision Analysis
  const handleAnalyzeHandwriting = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vision_solve",
          imageData: selectedImage,
          imageMimeType: imageMimeType,
          mathExpression: activePresetTitle || "Handwritten equation",
          config: omniConfig,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setVisionResult(data.data);
      } else {
        throw new Error(data.error || "Could not decipher handwritten equation");
      }
    } catch (err: any) {
      console.error("Vision solver error:", err);
      setErrorMessage(err.message || "Failed to analyze handwritten image");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyLatex = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-100 overflow-y-auto p-4 md:p-6 space-y-4 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800/70 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-zinc-400" />
            <span>Computer Vision: Handwritten Math &amp; Notes Solver</span>
          </h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Powered by Python SymPy Engine &amp; Google Gemini Multimodal Vision · Transcribe handwritten equations, detect errors, and derive blackboard solutions
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (isCameraActive) stopCamera();
              else startCamera();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isCameraActive
                ? "bg-rose-950/60 border-rose-800 text-rose-300"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isCameraActive ? "Close Camera" : "Use Camera"}</span>
          </button>
        </div>
      </div>

      {/* Camera Live Stream (if active) */}
      {isCameraActive && (
        <div className="p-3 rounded-xl bg-[#121215] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Live Camera Feed · Point at notebook or whiteboard</span>
            <span className="text-[10px] text-emerald-400 font-mono">Stream Active</span>
          </div>
          <div className="relative rounded-lg overflow-hidden bg-black aspect-video max-h-72 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-900 text-xs font-medium transition-colors cursor-pointer"
            >
              Snap &amp; Insert
            </button>
          </div>
        </div>
      )}

      {/* Preset Buttons Strip */}
      <div className="space-y-1.5">
        <span className="text-[10px] uppercase font-mono text-zinc-400">
          Instant Test Presets (1-Click Handwritten Notes):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {HANDWRITTEN_PRESETS.map((preset) => {
            const isSelected = activePresetTitle === preset.title;
            return (
              <button
                key={preset.id}
                onClick={() => loadSvgPreset(preset)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                    : "bg-[#121215] border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="text-[10px] font-mono text-zinc-400 uppercase">
                  {preset.category}
                </div>
                <div className="text-xs font-medium text-zinc-200 mt-0.5 truncate">
                  {preset.title.replace("Handwritten ", "")}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Image Drop / Preview Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Image Container */}
        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Handwritten Image / Document</span>
            <label className="text-[11px] text-zinc-300 hover:text-zinc-100 underline cursor-pointer">
              <span>Choose local photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFileSelect(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>

          {/* Image Display */}
          <div className="min-h-[220px] rounded-lg border border-zinc-800 bg-[#09090b] flex items-center justify-center p-2 relative overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Handwritten note preview"
                className="max-h-56 max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Upload className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400">
                  Select a test preset above or upload a photo of your notebook
                </p>
              </div>
            )}
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleAnalyzeHandwriting}
            disabled={isAnalyzing || !selectedImage}
            className="w-full py-2 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reading Handwriting &amp; Solving Equation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span>Analyze &amp; Solve with Vision AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Quick Instructions & Status */}
        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono text-zinc-400">
              Vision Capabilities:
            </span>
            <ul className="text-xs text-zinc-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-0.5">•</span>
                <span><strong>Mathematical Transcription</strong>: Converts cursive and scratchpad handwriting into formal LaTeX code.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-0.5">•</span>
                <span><strong>Step-by-Step Blackboard Derivation</strong>: Formulates the complete mathematical solution from first principles.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400 mt-0.5">•</span>
                <span><strong>Student Error Detection</strong>: Identifies sign flips, arithmetic slips, or forgotten integration constants in your work.</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed">
            Tip: You can snap whiteboard photos during class or paste screenshots directly (Ctrl+V) from your digital stylus tablet.
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-zinc-900 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Vision Result Workspace */}
      {visionResult && (
        <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-4">
          {/* Header & Transcription Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800/70">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {visionResult.problemType}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {visionResult.confidence}% confidence
                </span>
              </div>
              <h2 className="text-sm font-medium text-zinc-100 mt-1">
                Deciphered Handwriting
              </h2>
            </div>

            <button
              onClick={() => copyLatex(visionResult.latex || visionResult.transcribedExpression)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
            >
              {copiedLatex ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied LaTeX</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy LaTeX</span>
                </>
              )}
            </button>
          </div>

          {/* Deciphered Mathematical Notation */}
          <div className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800/90 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-zinc-400">
              Deciphered Mathematical Notation:
            </span>
            <div className="py-1 px-2 rounded bg-zinc-950/70 border border-zinc-900 overflow-x-auto text-zinc-100">
              <MathView math={visionResult.latex || visionResult.transcribedExpression} displayMode={true} />
            </div>
          </div>

          {/* Student Mistake Detection Feedback */}
          {visionResult.studentMistakeDetected && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                visionResult.studentMistakeDetected.toLowerCase().includes("none")
                  ? "bg-zinc-900/60 border-zinc-800 text-zinc-300"
                  : "bg-zinc-900 border-amber-800/50 text-amber-200"
              }`}
            >
              {visionResult.studentMistakeDetected.toLowerCase().includes("none") ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div>
                <div className="font-medium text-zinc-200">Student Calculation Check</div>
                <div className="text-[11px] mt-0.5 leading-relaxed opacity-90">
                  <MathText text={visionResult.studentMistakeDetected} />
                </div>
              </div>
            </div>
          )}

          {/* Step-by-Step Blackboard Derivation */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-zinc-200">
              Step-by-Step Derivation &amp; Solution:
            </div>
            {visionResult.steps?.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                  <span className="text-zinc-500 font-mono text-[11px]">{step.stepNumber}.</span>
                  <MathText text={step.title} />
                </div>
                {/* Rendered Mathematical Blackboard Equation */}
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-x-auto text-center">
                  <MathView math={step.derivation} displayMode={true} className="text-sm sm:text-base text-zinc-100" />
                </div>
                <div className="text-xs text-zinc-400 leading-relaxed px-0.5">
                  <MathText text={step.explanation} />
                </div>
              </div>
            ))}
          </div>

          {/* Final Evaluated Result */}
          <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4">
            <div className="flex-1 overflow-x-auto">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">
                Final Evaluated Answer
              </div>
              <div className="mt-1 text-emerald-400 font-medium text-sm sm:text-base">
                <MathView math={visionResult.finalAnswer} displayMode={false} />
              </div>
            </div>
            <button
              onClick={() => copyLatex(visionResult.finalAnswer)}
              className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
              title="Copy Answer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/70 text-xs">
            <div className="text-[11px] text-zinc-400">
              {visionResult.explanation}
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToCopilot && (
                <button
                  onClick={() =>
                    onNavigateToCopilot(
                      `I photographed this handwritten problem: "${visionResult.transcribedExpression}". The solution derived is "${visionResult.finalAnswer}". Can you explain the intuition behind this derivation?`
                    )
                  }
                  className="flex items-center gap-1 text-zinc-300 hover:text-zinc-100 cursor-pointer"
                >
                  <span>Ask Copilot</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
