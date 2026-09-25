"use client";

import React, { useState } from "react";
import {
  Save,
  RotateCcw,
  Trash2,
  Database,
  Sliders,
  Cpu,
  Sparkles,
  Server,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
} from "lucide-react";
import { OmniRouteConfig, AIProvider } from "@/types/stem";

interface SettingsViewProps {
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onSavePreferences: () => void;
  omniConfig: OmniRouteConfig;
  onUpdateOmniConfig: (newConfig: OmniRouteConfig) => void;
}

export default function SettingsView({
  onResetSampleData,
  onClearAllData,
  onSavePreferences,
  omniConfig,
  onUpdateOmniConfig,
}: SettingsViewProps) {
  const [academyName, setAcademyName] = useState("Islamabad Model College / FBISE Division");
  const [academicTerm, setAcademicTerm] = useState("Academic Year 2026-2027 (HSSC)");
  const [gradingScale, setGradingScale] = useState("FBISE Standard Letter (A+, A, B, C, D, E)");

  // Local state for AI config
  const [provider, setProvider] = useState<AIProvider>(omniConfig.provider);
  const [geminiKey, setGeminiKey] = useState<string>(omniConfig.geminiApiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [ollamaUrl, setOllamaUrl] = useState<string>(omniConfig.ollamaBaseUrl);
  const [localModel, setLocalModel] = useState<string>(omniConfig.localModelName);

  // Ping Test State
  const [isTesting, setIsTesting] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    status: string;
  } | null>(null);

  const handleSaveAIConfig = () => {
    const updated: OmniRouteConfig = {
      provider,
      geminiApiKey: geminiKey,
      ollamaBaseUrl: ollamaUrl,
      localModelName: localModel,
    };
    onUpdateOmniConfig(updated);
    try {
      localStorage.setItem("sm_omni_config", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setPingResult(null);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ping",
          config: {
            provider,
            geminiApiKey: geminiKey,
            ollamaBaseUrl: ollamaUrl,
            localModelName: localModel,
          },
        }),
      });
      const data = await res.json();
      setPingResult({
        success: data.success,
        latencyMs: data.latencyMs,
        status: data.data?.status || (data.success ? "Connection operational" : "Connection failed"),
      });
    } catch (err: any) {
      setPingResult({
        success: false,
        latencyMs: 0,
        status: `Network error: ${err.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
          System & AI Engine Settings
        </h2>
        <p className="text-xs text-slate-400">
          Configure Omni-Route AI models, local offline inference, and student database
        </p>
      </div>

      {/* 1. Omni-Route AI Engine Configuration (Spotlight for Competition) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1a36] to-[#070e1c] border border-cyan-500/30 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
          <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Omni-Route AI Model Selector</span>
          </div>
          <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            Current: {provider.toUpperCase()}
          </span>
        </div>

        {/* Provider Radio Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option A: Gemini */}
          <div
            onClick={() => setProvider("gemini")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              provider === "gemini"
                ? "bg-blue-600/25 border-cyan-400 text-white shadow-lg shadow-blue-500/15"
                : "bg-[#060b16]/70 border-blue-500/15 text-slate-400 hover:border-blue-400/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Google Gemini
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300">
                Cloud Speed
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Gemini 2.5 Flash / 1.5 Pro. High-speed reasoning, 1M+ token context, multimodal textbook RAG.
            </p>
          </div>

          {/* Option B: Local Qwen 14B */}
          <div
            onClick={() => setProvider("qwen_local")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              provider === "qwen_local"
                ? "bg-purple-600/25 border-purple-400 text-white shadow-lg shadow-purple-500/15"
                : "bg-[#060b16]/70 border-blue-500/15 text-slate-400 hover:border-purple-400/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Server className="w-4 h-4 text-purple-400" />
                Local Qwen 14B
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                100% Offline
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Ollama / LM Studio on localhost. Air-gapped, zero cloud dependencies, private inference.
            </p>
          </div>

          {/* Option C: Exhibition Demo Engine */}
          <div
            onClick={() => setProvider("demo_fallback")}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              provider === "demo_fallback"
                ? "bg-emerald-600/25 border-emerald-400 text-white shadow-lg shadow-emerald-500/15"
                : "bg-[#060b16]/70 border-blue-500/15 text-slate-400 hover:border-emerald-400/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Exhibition Engine
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Zero Failures
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Instant pre-indexed FBISE STEM dataset. Guaranteed 12ms response for judges with zero Wi-Fi required.
            </p>
          </div>
        </div>

        {/* Detailed Provider Settings */}
        <div className="p-4 rounded-xl bg-[#060b14] border border-blue-500/20 space-y-3">
          {provider === "gemini" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Google Gemini API Key</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                >
                  {showKey ? "Hide Key" : "Show Key"}
                </button>
              </div>
              <input
                type={showKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Leave blank to use environment default or fallback)"
                className="w-full px-3 py-2 text-xs rounded-xl bg-[#070e1c] border border-blue-500/30 text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          )}

          {provider === "qwen_local" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Local Ollama Base URL
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#070e1c] border border-blue-500/30 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Local Model Identifier
                </label>
                <input
                  type="text"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="qwen2.5:14b"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#070e1c] border border-blue-500/30 text-white focus:outline-none focus:border-purple-400 font-mono"
                />
              </div>
            </div>
          )}

          {provider === "demo_fallback" && (
            <p className="text-xs text-emerald-300/90 leading-relaxed">
              ✓ Exhibition Mode requires no API keys or local server installations. It operates out-of-the-box using the pre-compiled National Book Foundation FBISE curriculum repository.
            </p>
          )}

          {/* Test & Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Testing Connection...</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span>Test Connection Latency</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                handleSaveAIConfig();
                onSavePreferences();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply AI Configuration</span>
            </button>
          </div>

          {/* Ping Diagnostic Feedback */}
          {pingResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 mt-2 ${
                pingResult.success
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/30 border-red-500/30 text-red-300"
              }`}
            >
              {pingResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span>{pingResult.success ? "Status: Operational" : "Status: Attention Needed"}</span>
                  <span className="font-mono text-[10px]">{pingResult.latencyMs}ms latency</span>
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">{pingResult.status}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Standard Portal Preferences & Data Storage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>Academic Portal Preferences</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Institution / College Name
            </label>
            <input
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Academic Session
            </label>
            <input
              type="text"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Grading Standard
            </label>
            <select
              value={gradingScale}
              onChange={(e) => setGradingScale(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="FBISE Standard Letter (A+, A, B, C, D, E)">
                FBISE Standard Letter (A+, A, B, C, D, E)
              </option>
              <option value="Percentage (0 - 100%)">Percentage (0 - 100%)</option>
              <option value="4.0 GPA Scale">4.0 GPA Scale</option>
            </select>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#070e1c] border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>Exhibition Data Reset</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Quickly reset the system to clean factory demonstration state before presenting to new evaluators.
          </p>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={onResetSampleData}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 text-blue-200 border border-blue-500/25 text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Default Sample Records</span>
            </button>

            <button
              type="button"
              onClick={onClearAllData}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
