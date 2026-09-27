"use client";

import React from "react";
import { Settings, Sparkles, Globe } from "lucide-react";

interface AppHeaderProps {
  currentView?: string;
  onOpenSettings: () => void;
  omniProvider?: string;
  webSearchActive?: boolean;
}

export default function AppHeader({
  currentView,
  onOpenSettings,
  omniProvider = "gemini",
  webSearchActive = true,
}: AppHeaderProps) {
  const getProviderLabel = (p: string) => {
    if (p === "gemini") return "Gemini 2.5";
    if (p === "deepseek") return "DeepSeek";
    if (p === "dual_model") return "Dual Model";
    if (p === "omniroute") return "OmniRoute";
    return "Offline";
  };

  const getViewTitle = (v?: string) => {
    if (v === "tutor") return "Copilot";
    if (v === "flashcards") return "Flashcards";
    if (v === "tools") return "Academic Tools";
    if (v === "settings") return "Settings";
    return "Notebooks";
  };

  return (
    <header className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/70 bg-[#09090b] shrink-0 sticky top-0 z-40 select-none">
      {/* Brand & View */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-xs tracking-tight text-zinc-100">
            Copilot
          </span>
        </div>
        <span className="text-zinc-600 text-xs">/</span>
        <span className="text-xs text-zinc-400 font-medium">
          {getViewTitle(currentView)}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {webSearchActive && (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] text-zinc-400">
            <Globe className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-400">Search Grounding</span>
          </div>
        )}

        {/* Minimal Engine Pill */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
          title="Configure AI Engine"
        >
          <Sparkles className="w-3 h-3 text-zinc-400" />
          <span>{getProviderLabel(omniProvider)}</span>
        </button>

        {/* Settings Icon */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
