"use client";

import React from "react";
import { GraduationCap, Settings, Globe, Sparkles } from "lucide-react";

interface AppHeaderProps {
  currentView?: string;
  onOpenSettings: () => void;
  omniProvider?: string;
  webSearchActive?: boolean;
}

export default function AppHeader({
  onOpenSettings,
  omniProvider = "gemini",
  webSearchActive = true,
}: AppHeaderProps) {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-blue-500/20 bg-[#091122]/90 backdrop-blur-md z-40 shrink-0 sticky top-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-600 to-purple-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <GraduationCap className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block font-bold text-sm tracking-tight text-white font-[family-name:var(--font-heading)] leading-none">
            STEM Intellect
          </span>
          <span className="text-[10px] font-semibold text-cyan-400 tracking-wider uppercase">
            Personal Student AI Workstation
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Web Search Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            webSearchActive
              ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300"
              : "bg-slate-800/40 border-slate-700 text-slate-400"
          }`}
        >
          <Globe className={`w-3.5 h-3.5 ${webSearchActive ? "text-cyan-400" : ""}`} />
          <span className="hidden sm:inline">Google Search Grounding:</span>
          <span className="font-bold">{webSearchActive ? "Active" : "Off"}</span>
        </div>

        {/* Omni-Route AI Model Status Badge */}
        {omniProvider && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/15 hover:bg-blue-600/25 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-all cursor-pointer shadow-sm"
            title="Configure AI Model & Keys in Settings"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <span className="capitalize">{omniProvider.replace("_", " ")}</span>
          </button>
        )}

        {/* Quick Settings Icon */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 text-slate-300 hover:text-white border border-blue-500/20 transition-all cursor-pointer"
          title="Open Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
