"use client";

import React, { useState } from "react";
import {
  Calculator,
  FileCheck,
  Brain,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Eye,
} from "lucide-react";
import { MathSolution, EssayReview, MindMapData, OmniRouteConfig } from "@/types/stem";
import VisionMathView from "@/components/VisionMathView";
import { MathView, MathText } from "@/components/MathView";

interface AcademicToolsViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
  onNavigate?: (view: string) => void;
  onNavigateToCopilot?: (initialPrompt?: string) => void;
  onNavigateToFlashcards?: () => void;
}

export default function AcademicToolsView({
  omniConfig,
  onNavigateToCopilot,
  onNavigateToFlashcards,
}: AcademicToolsViewProps) {
  const [activeTool, setActiveTool] = useState<"math" | "vision" | "essay" | "mindmap">("math");

  // --- MATH SOLVER STATE ---
  const [mathInput, setMathInput] = useState("Solve: 2x^2 + 5x - 3 = 0");
  const [mathSolution, setMathSolution] = useState<MathSolution | null>(null);
  const [isSolvingMath, setIsSolvingMath] = useState(false);
  const [mathError, setMathError] = useState<string | null>(null);

  // --- ESSAY REVIEWER STATE ---
  const [essayText, setEssayText] = useState(
    "The advent of artificial intelligence represents a pivotal transformation in modern higher education. By providing personalized feedback, adaptive problem sets, and immediate Socratic guidance, AI tutors empower students to bridge knowledge gaps autonomously. However, ethical considerations regarding academic integrity and critical thinking remain paramount."
  );
  const [essayReview, setEssayReview] = useState<EssayReview | null>(null);
  const [isReviewingEssay, setIsReviewingEssay] = useState(false);
  const [essayError, setEssayError] = useState<string | null>(null);

  // --- MIND MAP STATE ---
  const [mindMapTopic, setMindMapTopic] = useState("Cellular Respiration & ATP Synthesis");
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Execute Math Solver
  const handleSolveMath = async (overrideProblem?: string) => {
    const prob = (overrideProblem || mathInput).trim();
    if (!prob) return;
    setIsSolvingMath(true);
    setMathError(null);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "math_solve",
          mathExpression: prob,
          topic: prob,
          subject: "Mathematics",
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMathSolution(data.data);
      } else {
        throw new Error(data.error || "Could not solve mathematical expression");
      }
    } catch (err: any) {
      setMathError(err.message || "Failed to solve expression");
    } finally {
      setIsSolvingMath(false);
    }
  };

  // Execute Essay Review
  const handleReviewEssay = async () => {
    if (!essayText.trim()) return;
    setIsReviewingEssay(true);
    setEssayError(null);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review_essay",
          essayText: essayText.trim(),
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEssayReview(data.data);
      } else {
        throw new Error(data.error || "Could not review essay");
      }
    } catch (err: any) {
      setEssayError(err.message || "Failed to review essay");
    } finally {
      setIsReviewingEssay(false);
    }
  };

  // Execute Mind Map Generation
  const handleGenerateMindMap = async () => {
    if (!mindMapTopic.trim()) return;
    setIsGeneratingMindMap(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mind_map",
          topic: mindMapTopic.trim(),
          subject: "Academic",
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMindMapData(data.data);
        if (data.data.nodes?.length > 0) {
          setSelectedNodeId(data.data.nodes[0].id);
        }
      }
    } catch (err: any) {
      console.warn("Mind map generation error:", err);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#09090b] text-zinc-100">
      {/* Tools Navigation Bar - Slim Minimal Header */}
      <div className="border-b border-zinc-800/70 bg-[#09090b] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-200">Academic Tools</span>
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
            Math · Originality · Graphs
          </span>
        </div>

        {/* Minimal Tool Selector Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool("math")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTool === "math"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Math</span>
          </button>

          <button
            onClick={() => setActiveTool("vision")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTool === "vision"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vision Solver</span>
          </button>

          <button
            onClick={() => setActiveTool("essay")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTool === "essay"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Originality</span>
          </button>

          <button
            onClick={() => setActiveTool("mindmap")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTool === "mindmap"
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Mind Map</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* ========================================================================= */}
        {/* TOOL 1: MATH SOLVER */}
        {/* ========================================================================= */}
        {activeTool === "math" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3">
              <div>
                <h2 className="text-xs font-medium text-zinc-200">
                  Step-by-Step Math Problem Solver
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Enter equations, calculus derivations, or linear algebra queries (Powered by Python SymPy Computer Algebra System).
                </p>
              </div>

              {/* Input Area */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSolveMath()}
                  placeholder="e.g. Solve: 3x^2 - 12x + 9 = 0 or Integrate: x*sin(x) dx"
                  className="flex-1 px-3 py-1.5 rounded-md bg-[#09090b] border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600"
                />
                <button
                  onClick={() => handleSolveMath()}
                  disabled={isSolvingMath || !mathInput.trim()}
                  className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSolvingMath ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deriving...</span>
                    </>
                  ) : (
                    <>
                      <span>Derive</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-zinc-500">Presets:</span>
                {[
                  "Solve: 2x^2 + 5x - 3 = 0",
                  "Integrate: ∫ x·e^(2x) dx",
                  "Evaluate: lim(x→0) sin(3x)/x",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMathInput(sample);
                      handleSolveMath(sample);
                    }}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {mathError && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{mathError}</span>
              </div>
            )}

            {/* Solution Display */}
            {mathSolution && (
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">
                      Derivation
                    </span>
                    <h3 className="text-xs font-medium text-zinc-100 mt-0.5">
                      {mathSolution.problem}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] text-zinc-400 border border-zinc-800 bg-zinc-900 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Verified</span>
                  </span>
                </div>

                {/* Steps Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-300">Steps:</div>
                  {mathSolution.steps?.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800/80 space-y-2"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {step.stepNumber}.
                        </span>
                        <MathText text={step.title} />
                      </div>
                      {/* Rendered Mathematical Equation */}
                      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 overflow-x-auto text-center">
                        <MathView math={step.derivation} displayMode={true} className="text-sm sm:text-base text-zinc-100" />
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed px-0.5">
                        <MathText text={step.explanation} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Boxed Answer */}
                <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex-1 overflow-x-auto">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">
                      Final Result
                    </div>
                    <div className="mt-1 text-emerald-400 font-medium text-sm sm:text-base">
                      <MathView math={mathSolution.finalAnswer} displayMode={false} />
                    </div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(mathSolution.finalAnswer)}
                    className="p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="Copy Answer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Key Formulas & Verification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      Key Formulas
                    </span>
                    <ul className="text-xs text-zinc-300 mt-1 space-y-1 list-disc list-inside">
                      {mathSolution.keyFormulas?.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">
                      Verification
                    </span>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {mathSolution.verification}
                    </p>
                  </div>
                </div>

                {/* Action to Ask Copilot */}
                {onNavigateToCopilot && (
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() =>
                        onNavigateToCopilot(`I solved "${mathSolution.problem}". Can you explain why step 2 works conceptually?`)
                      }
                      className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ask Copilot about derivation</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOOL 1.5: COMPUTER VISION MATH & NOTE RECOGNITION */}
        {/* ========================================================================= */}
        {activeTool === "vision" && (
          <VisionMathView
            omniConfig={omniConfig}
            onNavigateToCopilot={onNavigateToCopilot}
            onNavigateToFlashcards={onNavigateToFlashcards}
          />
        )}

        {/* ========================================================================= */}
        {/* TOOL 2: ESSAY REVIEWER */}
        {/* ========================================================================= */}
        {activeTool === "essay" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3">
              <div>
                <h2 className="text-xs font-medium text-zinc-200">
                  Academic Originality & Quality Inspector
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Analyze essays and lab reports for voice, thesis clarity, and formulaic clichés.
                </p>
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <textarea
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  rows={5}
                  placeholder="Paste your essay or assignment draft here..."
                  className="w-full p-3 rounded-md bg-[#09090b] border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600 leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>
                    Word Count: {essayText.trim().split(/\s+/).filter(Boolean).length}
                  </span>
                  <button
                    onClick={() => handleReviewEssay()}
                    disabled={isReviewingEssay || !essayText.trim()}
                    className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isReviewingEssay ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>Inspect Essay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {essayError && (
              <div className="p-3 rounded-lg bg-zinc-900 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{essayError}</span>
              </div>
            )}

            {/* Review Results Display */}
            {essayReview && (
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3.5">
                <div className="border-b border-zinc-800/60 pb-2">
                  <span className="text-[10px] uppercase font-mono text-zinc-400">
                    Inspection Report
                  </span>
                  <h3 className="text-xs font-medium text-zinc-100 mt-0.5">
                    {essayReview.title}
                  </h3>
                </div>

                {/* Score Meters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800 text-center">
                    <div className="text-[10px] text-zinc-400">Originality</div>
                    <div className="text-xl font-medium text-zinc-100 mt-0.5">
                      {essayReview.originalityScore}%
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800 text-center">
                    <div className="text-[10px] text-zinc-400">Similarity</div>
                    <div className="text-xl font-medium text-zinc-100 mt-0.5">
                      {essayReview.similarityIndex}%
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800 text-center">
                    <div className="text-[10px] text-zinc-400">Academic Tone</div>
                    <div className="text-xs font-medium text-zinc-200 mt-1.5 truncate">
                      {essayReview.academicTone}
                    </div>
                  </div>
                </div>

                {/* Thesis Statement Assessment */}
                <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Thesis Assessment
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {essayReview.thesisClarity}
                  </p>
                </div>

                {/* Strengths & Improvement Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800 space-y-1.5">
                    <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Strengths</span>
                    </span>
                    <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                      {essayReview.strengths?.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800 space-y-1.5">
                    <span className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Revisions</span>
                    </span>
                    <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                      {essayReview.areasForImprovement?.map((a, idx) => (
                        <li key={idx}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TOOL 3: CONCEPT MIND MAP */}
        {/* ========================================================================= */}
        {activeTool === "mindmap" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3">
              <div>
                <h2 className="text-xs font-medium text-zinc-200">
                  AI Concept Mind Map &amp; Knowledge Graph
                </h2>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Visualize hierarchical relationships between core concepts and theories.
                </p>
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={mindMapTopic}
                  onChange={(e) => setMindMapTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateMindMap()}
                  placeholder="e.g. Cellular Respiration, Newton's Laws"
                  className="flex-1 px-3 py-1.5 rounded-md bg-[#09090b] border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600"
                />
                <button
                  onClick={() => handleGenerateMindMap()}
                  disabled={isGeneratingMindMap || !mindMapTopic.trim()}
                  className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isGeneratingMindMap ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mind Map Canvas / Node Display */}
            {mindMapData && (
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-zinc-400">
                      Knowledge Graph
                    </span>
                    <h3 className="text-xs font-medium text-zinc-100 mt-0.5">
                      {mindMapData.topic}
                    </h3>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {mindMapData.nodes?.length || 0} nodes
                  </div>
                </div>

                {/* Nodes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mindMapData.nodes?.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-zinc-800/90 border-zinc-600"
                            : "bg-[#09090b] border-zinc-800/80 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400">
                            {node.category.replace("_", " ")}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">#{node.id}</span>
                        </div>
                        <h4 className="text-xs font-medium text-zinc-100 mt-1.5">{node.label}</h4>
                        <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                          {node.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Link Connections Summary */}
                {mindMapData.links && mindMapData.links.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#09090b] border border-zinc-800">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">Dependencies</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1.5">
                      {mindMapData.links.map((link, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] text-zinc-400 flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded border border-zinc-800/60"
                        >
                          <span className="text-zinc-300 font-medium">{link.source}</span>
                          <span className="text-zinc-500 text-[10px]">→ [{link.relation}] →</span>
                          <span className="text-zinc-300 font-medium">{link.target}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
