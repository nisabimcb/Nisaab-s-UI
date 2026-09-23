"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Initializing secure workspace...");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(55);
      setStatusText("Synchronizing academic rosters...");
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText("Loading interface components...");
    }, 650);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText("Ready!");
    }, 1000);

    const t4 = setTimeout(() => {
      setIsFading(true);
    }, 1250);

    const t5 = setTimeout(() => {
      onComplete();
    }, 1650);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#060b14] transition-all duration-500 ease-out ${
        isFading ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      <div className="w-[380px] p-8 text-center rounded-2xl glass-card border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.25)] relative overflow-hidden">
        {/* Animated glow aura */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        
        {/* Animated spinner ring and icon */}
        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-3 border-blue-500/20 border-t-blue-400 border-r-cyan-400 animate-spin" />
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600/30 to-cyan-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <GraduationCap className="w-7 h-7 stroke-[2.2]" />
          </div>
        </div>

        <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white tracking-tight mb-1">
          Student Manager
        </h2>
        <p className="text-xs text-blue-300/80 mb-6 font-medium tracking-wide">
          ACADEMIC PORTAL &bull; LOCALHOST
        </p>

        <p className="text-sm text-slate-400 mb-4 h-5 transition-all">
          {statusText}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(56,189,248,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
