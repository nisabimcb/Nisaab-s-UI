"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { ToastMessage } from "@/types/student";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all animate-bounceIn ${
            t.type === "success"
              ? "bg-[#09152b]/95 border-emerald-500/40 text-emerald-300"
              : t.type === "danger"
              ? "bg-[#180e1b]/95 border-rose-500/40 text-rose-300"
              : "bg-[#0a1428]/95 border-blue-500/40 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === "danger" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === "info" && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="text-xs font-medium text-slate-100">{t.message}</span>
          </div>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
