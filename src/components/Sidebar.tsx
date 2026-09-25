"use client";

import React, { useEffect, useState } from "react";
import { Settings, BookOpen, Bot, Layers } from "lucide-react";

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
    { id: "tutor", label: "Socratic Tutor", icon: Bot },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "settings", label: "OmniRoute & Settings", icon: Settings },
  ];

  return (
    <aside className="w-52 border-r border-slate-800 bg-[#0e131f] flex flex-col justify-between p-3 shrink-0 select-none">
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5 mb-1.5">
          Workspace
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Minimal Footer */}
      <div className="px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-left">
        <div className="text-xs font-medium text-slate-300">
          {time || "12:00"}
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          {date || "Session 2026"}
        </div>
      </div>
    </aside>
  );
}
