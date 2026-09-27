"use client";

import React, { useEffect, useState } from "react";
import { Settings, BookOpen, Bot, Layers, Calculator, Eye } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
}: SidebarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: "notebook", label: "My Notebooks", icon: BookOpen },
    { id: "tutor", label: "Copilot", icon: Bot },
    { id: "vision", label: "Vision Math & Notes", icon: Eye },
    { id: "flashcards", label: "Flashcards & FSRS", icon: Layers },
    { id: "tools", label: "Academic Tools", icon: Calculator },
    { id: "settings", label: "AI Engines & Settings", icon: Settings },
  ];

  return (
    <aside className="w-48 border-r border-zinc-800/70 bg-[#09090b] flex flex-col justify-between p-2.5 shrink-0 select-none">
      <div>
        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-2 py-1.5 mb-1">
          Menu
        </div>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-zinc-100" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Minimal Status Footer */}
      <div className="px-2 py-2 text-[10px] text-zinc-400 flex items-center justify-between border-t border-zinc-800/50">
        <span>{time || "12:00"}</span>
        <span className="text-zinc-400 font-mono">Gemini AI</span>
      </div>
    </aside>
  );
}
