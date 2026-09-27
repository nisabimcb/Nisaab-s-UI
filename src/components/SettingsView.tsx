"use client";

import React, { useState } from "react";
import {
  Save,
  RotateCcw,
  Trash2,
  Database,
  Sliders,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Radio,
  ExternalLink,
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

  // Local state for AI config
  const [provider, setProvider] = useState<AIProvider>(omniConfig.provider || "gemini");
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
          },
        }),
      });
      const data = await res.json();
      setPingResult({
        success: data.success,
        latencyMs: data.latencyMs || 0,
        status: data.message || (data.success ? "Connection operational" : "Check API credentials"),
      });
    } catch (e: any) {
      setPingResult({
        success: false,
        latencyMs: 0,
        status: e.message || "Failed to reach backend",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-100 overflow-y-auto p-4 md:p-6 space-y-4 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="pb-3 border-b border-zinc-800/70 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium text-zinc-200">
            Settings
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Configure Google Gemini, OmniRoute, and application preferences
          </p>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono uppercase">
          Active: {provider}
        </span>
      </div>

      {/* 1. OmniRoute & AI Engine Configuration Card */}
      <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-3.5">
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
          <Cpu className="w-3.5 h-3.5 text-zinc-400" />
          <span>AI Engine &amp; Gateway Provider</span>
        </div>

        {/* 5 Provider Selection Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Google Gemini */}
          <div
            onClick={() => setProvider("gemini")}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "gemini"
                ? "bg-zinc-800/90 border-zinc-600 text-zinc-100"
                : "bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-medium text-zinc-200">Gemini API</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Recommended</div>
          </div>

          {/* Dual-Model Pipeline */}
          <div
            onClick={() => setProvider("dual_model")}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "dual_model"
                ? "bg-zinc-800/90 border-zinc-600 text-zinc-100"
                : "bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-medium text-zinc-200">Dual-Model</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Gemini + Omni</div>
          </div>

          {/* DeepSeek Direct */}
          <div
            onClick={() => setProvider("deepseek")}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "deepseek"
                ? "bg-zinc-800/90 border-zinc-600 text-zinc-100"
                : "bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-medium text-zinc-200">DeepSeek</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Direct API</div>
          </div>

          {/* OmniRoute Gateway */}
          <div
            onClick={() => setProvider("omniroute")}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "omniroute"
                ? "bg-zinc-800/90 border-zinc-600 text-zinc-100"
                : "bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-medium text-zinc-200">OmniRoute</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Local Gateway</div>
          </div>

          {/* Offline Fallback */}
          <div
            onClick={() => setProvider("demo_fallback")}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer text-left ${
              provider === "demo_fallback"
                ? "bg-zinc-800/90 border-zinc-600 text-zinc-100"
                : "bg-[#09090b] border-zinc-800/80 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            <div className="text-xs font-medium text-zinc-200">Offline</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">Air-gapped</div>
          </div>
        </div>

        {/* Selected Provider Configuration */}
        <div className="p-3.5 rounded-lg bg-[#09090b] border border-zinc-800 space-y-3">
          {/* Gemini Config */}
          {provider === "gemini" && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (or uses GEMINI_API_KEY environment var)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="webSearchToggle"
                  checked={enableWebSearch}
                  onChange={(e) => setEnableWebSearch(e.target.checked)}
                  className="w-3.5 h-3.5 accent-zinc-500 rounded cursor-pointer"
                />
                <label htmlFor="webSearchToggle" className="text-xs text-zinc-300 cursor-pointer">
                  Enable Google Search Grounding for live research
                </label>
              </div>
            </div>
          )}

          {/* Dual-Model Cooperative Pipeline Config */}
          {provider === "dual_model" && (
            <div className="space-y-3">
              <div className="p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed">
                Gemini acts as the <strong>Generator &amp; Researcher</strong> with live web search grounding. OmniRoute acts as the <strong>Executor</strong> for structured quiz, card, and mind-map output.
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  1. Generator: Google Gemini API Key
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (or uses GEMINI_API_KEY env var)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-zinc-800/80">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    2. Executor: OmniRoute URL
                  </label>
                  <input
                    type="text"
                    value={omniRouteUrl}
                    onChange={(e) => setOmniRouteUrl(e.target.value)}
                    placeholder="http://localhost:20128/v1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    OmniRoute Model Name
                  </label>
                  <input
                    type="text"
                    value={omniRouteModel}
                    onChange={(e) => setOmniRouteModel(e.target.value)}
                    placeholder="deepseek-chat"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* OmniRoute Gateway Config */}
          {provider === "omniroute" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300">
                  OmniRoute AI Gateway
                </span>
                <a
                  href="https://github.com/diegosouzapw/OmniRoute"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                >
                  <span>OmniRoute Repo</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    OmniRoute Base URL
                  </label>
                  <input
                    type="text"
                    value={omniRouteUrl}
                    onChange={(e) => setOmniRouteUrl(e.target.value)}
                    placeholder="http://localhost:20128/v1"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={omniRouteModel}
                    onChange={(e) => setOmniRouteModel(e.target.value)}
                    placeholder="deepseek-chat or gemini-2.5-flash"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  API Key / Token (Optional)
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={omniRouteApiKey}
                  onChange={(e) => setOmniRouteApiKey(e.target.value)}
                  placeholder="Optional token if configured in OmniRoute"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}

          {/* DeepSeek Direct Config */}
          {provider === "deepseek" && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  DeepSeek API Key
                </label>
                <input
                  type={showKeys ? "text" : "password"}
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="sk-... (or uses DEEPSEEK_API_KEY environment var)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 font-mono focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  Model Variant
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeepseekModel("deepseek-chat")}
                    className={`p-2 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                      deepseekModel === "deepseek-chat"
                        ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                        : "bg-[#121215] border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <div className="font-medium text-zinc-200">deepseek-chat (V3)</div>
                    <div className="text-[10px] text-zinc-500">Fast general tutor</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeepseekModel("deepseek-reasoner")}
                    className={`p-2 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                      deepseekModel === "deepseek-reasoner"
                        ? "bg-zinc-800 text-zinc-100 border-zinc-600"
                        : "bg-[#121215] border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <div className="font-medium text-zinc-200">deepseek-reasoner (R1)</div>
                    <div className="text-[10px] text-zinc-500">Chain-of-thought</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Offline Mode */}
          {provider === "demo_fallback" && (
            <p className="text-xs text-zinc-400 leading-relaxed">
              Offline mode runs without external API keys or network connection.
            </p>
          )}

          {/* Test & Save Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Test Latency</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
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
              className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>

          {/* Ping Diagnostic Feedback */}
          {pingResult && (
            <div className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-xs flex items-start gap-2">
              {pingResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1">
                <div className="font-medium text-zinc-200 flex items-center justify-between">
                  <span>{pingResult.success ? "Operational" : "Failed"}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{pingResult.latencyMs}ms</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{pingResult.status}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Preferences & Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Preferences</span>
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 mb-1">
              Institution Name
            </label>
            <input
              type="text"
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 mb-1">
              Academic Term
            </label>
            <input
              type="text"
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 text-xs focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-200">
            <Database className="w-3.5 h-3.5 text-zinc-400" />
            <span>Data Storage</span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Manage your persistent local notebook records, flashcards, and study memos.
          </p>

          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={onResetSampleData}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Records</span>
            </button>

            <button
              type="button"
              onClick={onClearAllData}
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs transition-colors cursor-pointer"
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
