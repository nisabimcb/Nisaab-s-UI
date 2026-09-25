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
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  ExternalLink,
  Globe,
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
  const [provider, setProvider] = useState<AIProvider>(omniConfig.provider || "omniroute");
  const [omniRouteUrl, setOmniRouteUrl] = useState<string>(
    omniConfig.omniRouteUrl || "http://localhost:20128/v1"
  );
  const [omniRouteApiKey, setOmniRouteApiKey] = useState<string>(
    omniConfig.omniRouteApiKey || ""
  );
  const [omniRouteModel, setOmniRouteModel] = useState<string>(
    omniConfig.omniRouteModel || "deepseek-chat"
  );

  const [geminiKey, setGeminiKey] = useState<string>(omniConfig.geminiApiKey || "");
  const [deepseekKey, setDeepseekKey] = useState<string>(omniConfig.deepseekApiKey || "");
  const [deepseekModel, setDeepseekModel] = useState<"deepseek-chat" | "deepseek-reasoner">(
    omniConfig.deepseekModel || "deepseek-chat"
  );
  const [showKeys, setShowKeys] = useState(false);
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(
    omniConfig.enableWebSearch ?? true
  );

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
      omniRouteUrl,
      omniRouteApiKey,
      omniRouteModel,
      geminiApiKey: geminiKey,
      deepseekApiKey: deepseekKey,
      deepseekModel,
      enableWebSearch,
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
            omniRouteUrl,
            omniRouteApiKey,
            omniRouteModel,
            geminiApiKey: geminiKey,
            deepseekApiKey: deepseekKey,
            deepseekModel,
            enableWebSearch,
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
    <div className="space-y-5 max-w-4xl mx-auto text-slate-200">
      <div>
        <h2 className="text-base font-semibold text-white">
          System &amp; AI Engine Settings
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure OmniRoute Gateway, Google Gemini, DeepSeek, and study portal preferences
        </p>
      </div>

      {/* 1. OmniRoute & AI Engine Configuration Card */}
      <div className="p-5 rounded-xl bg-[#111622] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>AI Gateway &amp; Provider Selection</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
            Active: {provider}
          </span>
        </div>

        {/* 5 Provider Radio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {/* Dual-Model Cooperative Pipeline */}
          <div
            onClick={() => setProvider("dual_model")}
            className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "dual_model"
                ? "bg-blue-600/15 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">Dual-Model</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                Cooperative
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Gemini Generates/Researches → OmniRoute Executes structured tasks.
            </p>
          </div>

          {/* OmniRoute Gateway */}
          <div
            onClick={() => setProvider("omniroute")}
            className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "omniroute"
                ? "bg-blue-600/15 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">OmniRoute</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">
                Gateway
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Connect to diegosouzapw/OmniRoute local or hosted AI gateway.
            </p>
          </div>

          {/* Google Gemini */}
          <div
            onClick={() => setProvider("gemini")}
            className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "gemini"
                ? "bg-blue-600/15 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">Gemini</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                Search
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Gemini 2.5 Flash with live Google Search Grounding citations.
            </p>
          </div>

          {/* DeepSeek */}
          <div
            onClick={() => setProvider("deepseek")}
            className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "deepseek"
                ? "bg-blue-600/15 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">DeepSeek</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                Direct
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              DeepSeek-V3 or DeepSeek-R1 for mathematical reasoning.
            </p>
          </div>

          {/* Offline Fallback */}
          <div
            onClick={() => setProvider("demo_fallback")}
            className={`p-3 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "demo_fallback"
                ? "bg-blue-600/15 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-white">Offline</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">
                Local
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              100% air-gapped fallback for competition exhibitions.
            </p>
          </div>
        </div>

        {/* Selected Provider Configuration */}
        <div className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
          {/* Dual-Model Cooperative Pipeline Config */}
          {provider === "dual_model" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">
                  Dual-Model Cooperative Pipeline Setup
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Generator: Gemini 2.5 Flash + Executor: OmniRoute Gateway
                </span>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40 text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-indigo-300">How the models collaborate:</strong> Google Gemini acts as the <strong>Generator &amp; Researcher</strong>, analyzing the query and performing live Google Search Grounding to assemble verified scientific facts. OmniRoute Gateway then acts as the <strong>Executor</strong>, compiling that research into structured quizzes, active-recall flashcards, knowledge graphs, or step-by-step tutoring guidance.
              </div>

              {/* Generator: Gemini */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400">
                    1. Generator Model (Google Gemini 2.5 Flash)
                  </span>
                  <span className="text-[10px] text-slate-400">Researches &amp; grounds queries</span>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Google Gemini API Key
                  </label>
                  <input
                    type={showKeys ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy... (or uses GEMINI_API_KEY env var)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="dualWebSearchToggle"
                    checked={enableWebSearch}
                    onChange={(e) => setEnableWebSearch(e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="dualWebSearchToggle" className="text-xs text-slate-300 cursor-pointer">
                    Enable Google Search Grounding for live research
                  </label>
                </div>
              </div>

              {/* Executor: OmniRoute Gateway */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-blue-400">
                    2. Executor Model (OmniRoute Gateway)
                  </span>
                  <span className="text-[10px] text-slate-400">Executes structured tasks</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      OmniRoute Base URL
                    </label>
                    <input
                      type="text"
                      value={omniRouteUrl}
                      onChange={(e) => setOmniRouteUrl(e.target.value)}
                      placeholder="http://localhost:20128/v1"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      OmniRoute Model Name
                    </label>
                    <input
                      type="text"
                      value={omniRouteModel}
                      onChange={(e) => setOmniRouteModel(e.target.value)}
                      placeholder="deepseek-chat or gemini-2.5-flash"
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    OmniRoute API Key / Bearer Token (Optional)
                  </label>
                  <input
                    type={showKeys ? "text" : "password"}
                    value={omniRouteApiKey}
                    onChange={(e) => setOmniRouteApiKey(e.target.value)}
                    placeholder="Optional token if configured in OmniRoute"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OmniRoute Gateway Config */}
          {provider === "omniroute" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  OmniRoute AI Gateway Connection
                </span>
                <a
                  href="https://github.com/diegosouzapw/OmniRoute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>OmniRoute GitHub</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    OmniRoute Base URL
                  </label>
                  <input
                    type="text"
                    value={omniRouteUrl}
                    onChange={(e) => setOmniRouteUrl(e.target.value)}
                    placeholder="http://localhost:20128/v1"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Default port for diegosouzapw/OmniRoute is 20128
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Model Routing Identifier
                  </label>
                  <input
                    type="text"
                    value={omniRouteModel}
                    onChange={(e) => setOmniRouteModel(e.target.value)}
                    placeholder="deepseek-chat or gemini-2.5-flash"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Matches model names configured in your OmniRoute proxy
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  OmniRoute API Key / Bearer Token (Optional)
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={omniRouteApiKey}
                  onChange={(e) => setOmniRouteApiKey(e.target.value)}
                  placeholder="Optional token if configured in OmniRoute"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Gemini Config */}
          {provider === "gemini" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (Leave blank to use GEMINI_API_KEY environment var)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="webSearchToggle"
                  checked={enableWebSearch}
                  onChange={(e) => setEnableWebSearch(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="webSearchToggle" className="text-xs text-slate-300 cursor-pointer">
                  Enable Google Search Grounding for live web citations
                </label>
              </div>
            </div>
          )}

          {/* DeepSeek Direct Config */}
          {provider === "deepseek" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  DeepSeek API Key
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="sk-... (Leave blank to use DEEPSEEK_API_KEY environment var)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1.5">
                  Model Variant
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeepseekModel("deepseek-chat")}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      deepseekModel === "deepseek-chat"
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-slate-200">deepseek-chat (V3)</div>
                    <div className="text-[10px] text-slate-500">Fast tutor &amp; quiz generation</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeepseekModel("deepseek-reasoner")}
                    className={`p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      deepseekModel === "deepseek-reasoner"
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-slate-200">deepseek-reasoner (R1)</div>
                    <div className="text-[10px] text-slate-500">Chain-of-thought derivations</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Offline Engine */}
          {provider === "demo_fallback" && (
            <p className="text-xs text-slate-400 leading-relaxed">
              ✓ Offline Mode requires no API keys or local server installations. It operates out-of-the-box using the dynamic student reasoning engine on whatever notes or topics you supply.
            </p>
          )}

          {/* Test & Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-blue-400" />
                    <span>Test Latency</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showKeys ? "Hide Keys" : "Show Keys"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSaveAIConfig();
                onSavePreferences();
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save AI Configuration</span>
            </button>
          </div>

          {/* Ping Diagnostic Feedback */}
          {pingResult && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                pingResult.success
                  ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800/40 text-rose-300"
              }`}
            >
              {pingResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-semibold flex items-center justify-between">
                  <span>{pingResult.success ? "Connection Operational" : "Attention Needed"}</span>
                  <span className="font-mono text-[10px]">{pingResult.latencyMs}ms</span>
                </div>
                <div className="text-[11px] mt-0.5 opacity-90">{pingResult.status}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Preferences & Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#111622] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Academic Preferences</span>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Institution / College Name
            </label>
            <input
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Academic Term
            </label>
            <input
              type="text"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#111622] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Database className="w-4 h-4 text-slate-400" />
            <span>Data Management</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Manage your persistent local notebook records, flashcard decks, and quiz scores.
          </p>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={onResetSampleData}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Default Starter Records</span>
            </button>

            <button
              type="button"
              onClick={onClearAllData}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Stored Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
