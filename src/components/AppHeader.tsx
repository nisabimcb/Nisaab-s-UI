"use client";

import React from "react";
import { GraduationCap, Settings, Globe } from "lucide-react";

interface AppHeaderProps {
  currentView?: string;
  onOpenSettings: () => void;
  omniProvider?: string;
  webSearchActive?: boolean;
}

export default function AppHeader({
  onOpenSettings,
  omniProvider = "omniroute",
  webSearchActive = true,
}: AppHeaderProps) {
  const getProviderLabel = (p: string) => {
    if (p === "omniroute") return "OmniRoute Gateway";
    if (p === "deepseek") return "DeepSeek AI";
    if (p === "gemini") return "Google Gemini";
    return "Offline Engine";
  };

  return (
    <header className="h-14 px-5 flex items-center justify-between border-b border-slate-800 bg-[#0e131f] shrink-0 sticky top-0 z-40 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div>
          <span className="block font-semibold text-xs text-slate-100 leading-tight">
            STEM Intellect
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Student Study Workstation
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Web Search Grounding Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-slate-800/70 border border-slate-700/70 text-slate-300">
          <Globe className={`w-3 h-3 ${webSearchActive ? "text-blue-400" : "text-slate-500"}`} />
          <span>Web Search:</span>
          <span className={`font-semibold ${webSearchActive ? "text-blue-400" : "text-slate-500"}`}>
            {webSearchActive ? "Active" : "Off"}
          </span>
        </div>

        {/* OmniRoute AI Model Badge */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          title="Configure AI Models & OmniRoute in Settings"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{getProviderLabel(omniProvider)}</span>
        </button>

        {/* Quick Settings Icon */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-md bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 border border-slate-700/70 transition-colors cursor-pointer"
          title="Settings & OmniRoute Config"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
