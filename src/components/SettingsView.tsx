"use client";

import React, { useState } from "react";
import { Save, RotateCcw, Trash2, Database, Sliders } from "lucide-react";

interface SettingsViewProps {
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onSavePreferences: () => void;
}

export default function SettingsView({
  onResetSampleData,
  onClearAllData,
  onSavePreferences,
}: SettingsViewProps) {
  const [academyName, setAcademyName] = useState("Apex Academic Academy");
  const [academicTerm, setAcademicTerm] = useState("Fall 2026 / Semester 1");
  const [gradingScale, setGradingScale] = useState("Standard Letter (A, B, C, D, F)");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-white">
          System Settings
        </h2>
        <p className="text-xs text-slate-400">
          Configure portal preferences and local storage workspace
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Portal Preferences Card */}
        <div className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Sliders className="w-4 h-4" />
            <span>Portal Preferences</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Institution / Academy Name
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
              Current Academic Term
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
              Default Grading Scale
            </label>
            <select
              value={gradingScale}
              onChange={(e) => setGradingScale(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#060c16] border border-blue-500/20 text-white text-xs outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="Standard Letter (A, B, C, D, F)">Standard Letter (A, B, C, D, F)</option>
              <option value="Percentage (0 - 100%)">Percentage (0 - 100%)</option>
              <option value="4.0 GPA Scale">4.0 GPA Scale</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onSavePreferences}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-[0_2px_10px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

        {/* Local Storage & Records Card */}
        <div className="p-5 rounded-2xl glass-card border border-blue-500/20 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Database className="w-4 h-4" />
            <span>Data Storage & Records</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            All student roster records and user session preferences are stored directly in your browser&apos;s local storage.
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
              <span>Clear All Student Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
