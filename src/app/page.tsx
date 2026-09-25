"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import OpenNotebookView from "@/components/OpenNotebookView";
import EduAgentView from "@/components/EduAgentView";
import SettingsView from "@/components/SettingsView";
import ToastContainer from "@/components/ToastContainer";
import { ToastMessage } from "@/types/student";
import { OmniRouteConfig } from "@/types/stem";

export default function Home() {
  const [currentView, setCurrentView] = useState<string>("notebook");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [omniConfig, setOmniConfig] = useState<OmniRouteConfig>({
    provider: "gemini",
    geminiApiKey: "",
    deepseekApiKey: "",
    deepseekModel: "deepseek-chat",
    enableWebSearch: true,
  });

  const showToast = useCallback(
    (message: string, type: "success" | "danger" | "info" = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load persistent AI configuration
  useEffect(() => {
    try {
      const savedOmni = localStorage.getItem("sm_omni_config");
      if (savedOmni) {
        setOmniConfig(JSON.parse(savedOmni));
      }
      if (typeof window !== "undefined") {
        if (window.location.search.includes("view=tutor")) {
          setCurrentView("tutor");
        } else if (window.location.search.includes("view=settings")) {
          setCurrentView("settings");
        }
      }
    } catch {
      // Fallback gracefully
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative z-10 bg-[#060b14] text-slate-100">
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Student App Header */}
        <AppHeader
          currentView={currentView}
          onOpenSettings={() => setCurrentView("settings")}
          omniProvider={omniConfig.provider}
          webSearchActive={omniConfig.enableWebSearch}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Student Sidebar */}
          <Sidebar
            currentView={currentView}
            onViewChange={setCurrentView}
          />

          {/* Main Workstation Body */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {currentView === "notebook" && (
              <OpenNotebookView omniConfig={omniConfig} />
            )}

            {currentView === "tutor" && (
              <EduAgentView omniConfig={omniConfig} />
            )}

            {currentView === "settings" && (
              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <SettingsView
                  onResetSampleData={() =>
                    showToast("Workspace records refreshed.", "success")
                  }
                  onClearAllData={() =>
                    showToast("Custom study records cleared.", "info")
                  }
                  onSavePreferences={() =>
                    showToast("Student preferences saved successfully!", "success")
                  }
                  omniConfig={omniConfig}
                  onUpdateOmniConfig={(newConf) => {
                    setOmniConfig(newConf);
                    showToast(
                      `AI Engine switched to ${newConf.provider.toUpperCase()}`,
                      "success"
                    );
                  }}
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
