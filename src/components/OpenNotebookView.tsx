"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Plus,
  FileText,
  AlertTriangle,
  Lightbulb,
  Send,
  Loader2,
  Globe,
  ExternalLink,
  Trash2,
  Upload,
} from "lucide-react";
import {
  NotebookDocument,
  StudySummary,
  AudioPodcastEpisode,
  Citation,
  OmniRouteConfig,
  WebSearchSource,
} from "@/types/stem";

interface OpenNotebookViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
}

export default function OpenNotebookView({ omniConfig }: OpenNotebookViewProps) {
  // User's own notebooks & documents
  const [documents, setDocuments] = useState<NotebookDocument[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("student_notebook_docs");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: "doc-my-first-note",
        subject: "Physics",
        title: "Carnot Engine & Thermodynamic Limits",
        chapter: "Chapter 11: Thermodynamics",
        content: `First Law of Thermodynamics: ΔQ = ΔU + W, where W = P·ΔV.
Carnot Engine operates between Hot Reservoir (T1) and Cold Reservoir (T2) in Kelvin.
The 4 strokes: 1) Isothermal expansion, 2) Adiabatic expansion, 3) Isothermal compression, 4) Adiabatic compression.
Carnot Efficiency formula: η = 1 - (T2 / T1) = (T1 - T2) / T1.
100% efficiency is impossible because T2 would have to be 0 Kelvin (Absolute Zero).
Warning for exams: Always convert Celsius to Kelvin (K = °C + 273.15).`,
        sourceType: "notes",
        uploadedAt: new Date().toISOString(),
      },
    ];
  });

  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents[0]?.id || "doc-my-first-note"
  );
  const [activeTab, setActiveTab] = useState<"text" | "summary" | "podcast">("text");

  // New Note Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Physics");
  const [newChapter, setNewChapter] = useState("");
  const [newContent, setNewContent] = useState("");

  // Web Search Grounding Toggle
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);

  // Synthesis State
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // RAG / Chat State
  const [chatMessages, setChatMessages] = useState<
    {
      role: "user" | "assistant";
      content: string;
      citations?: Citation[];
      webSources?: WebSearchSource[];
    }[]
  >([
    {
      role: "assistant",
      content:
        "Welcome to your personal Study Notebook! I am grounded in whatever notes and textbooks you add, and I can search the live web with Google Gemini to pull the latest papers, solutions, and explanations.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  // Audio Podcast Player State
  const [podcast, setPodcast] = useState<AudioPodcastEpisode | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [isGeneratingPodcast, setIsGeneratingPodcast] = useState(false);

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // Save documents to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem("student_notebook_docs", JSON.stringify(documents));
    } catch {}
  }, [documents]);

  // Synthesize Document
  const handleSynthesize = async () => {
    if (!activeDoc) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "synthesize",
          subject: activeDoc.subject,
          topic: activeDoc.title,
          context: activeDoc.content,
          config: {
            ...omniConfig,
            enableWebSearch: webSearchEnabled,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSummary(data.data);
        setActiveTab("summary");
      }
    } catch (e) {
      console.error("Synthesize error:", e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Generate Audio Podcast
  const handleGeneratePodcast = async () => {
    if (!activeDoc) return;
    setIsGeneratingPodcast(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "audio_script",
          subject: activeDoc.subject,
          topic: activeDoc.title,
          context: activeDoc.content,
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPodcast(data.data);
        setActiveTab("podcast");
      }
    } catch (e) {
      console.error("Podcast error:", e);
    } finally {
      setIsGeneratingPodcast(false);
    }
  };

  // RAG / Web Search Question
  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const query = inputQuery;
    setInputQuery("");
    setChatMessages((prev) => [...prev, { role: "user", content: query }]);
    setIsQuerying(true);

    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          subject: activeDoc?.subject || "STEM",
          userMessage: query,
          context: activeDoc?.content || "",
          config: {
            ...omniConfig,
            enableWebSearch: webSearchEnabled,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.data.content,
            citations: data.data.citations,
            webSources: data.webSources || data.data.webSources,
          },
        ]);
      }
    } catch (err) {
      console.error("RAG Query error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  // Add Custom User Document
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDoc: NotebookDocument = {
      id: `doc-${Date.now()}`,
      subject: newSubject || "General STEM",
      title: newTitle,
      chapter: newChapter || "Custom Study Material",
      content: newContent,
      sourceType: "notes",
      uploadedAt: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewChapter("");
    setNewContent("");
    setSummary(null);
    setPodcast(null);
  };

  // Delete Document
  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    if (selectedDocId === id && updated.length > 0) {
      setSelectedDocId(updated[0].id);
    }
  };

  // Speech Synthesis Audio Player
  const playPodcastAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !podcast) {
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsPlayingAudio(true);
    let index = 0;

    const speakNext = () => {
      if (index >= podcast.dialogue.length) {
        setIsPlayingAudio(false);
        setActiveSpeakerIndex(0);
        return;
      }

      setActiveSpeakerIndex(index);
      const line = podcast.dialogue[index];
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.rate = audioSpeed;

      if (line.speaker.includes("Sarah")) {
        utterance.pitch = 1.15;
      } else {
        utterance.pitch = 0.95;
      }

      utterance.onend = () => {
        index++;
        speakNext();
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060b14] text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-blue-500/20 bg-[#070e1c]/90 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-heading)]">
              My STEM Study Notebooks
            </h1>
            <p className="text-[11px] text-slate-400">
              Personalized document grounding, Google web research, and audio overviews
            </p>
          </div>
        </div>

        {/* Web Search Grounding Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              webSearchEnabled
                ? "bg-cyan-500/20 border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                : "bg-slate-800/40 border-slate-700 text-slate-400"
            }`}
            title="Toggle Gemini Live Google Search Grounding"
          >
            <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? "text-cyan-400 animate-spin" : ""}`} />
            <span>Web Search: {webSearchEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Material</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: My Notebook Materials (Col 1-3) */}
        <div className="col-span-3 border-r border-blue-500/20 bg-[#070e1c]/50 p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                My Materials ({documents.length})
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#091122]/60 border border-blue-500/15">
                <FileText className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                <p className="text-xs font-semibold text-slate-300">No notes yet</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Paste your textbook chapter, lecture notes, or past papers.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold"
                >
                  Create First Note
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => {
                  const isSelected = doc.id === activeDoc?.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? "bg-blue-600/25 border-cyan-400/50 text-white shadow-md shadow-blue-500/15"
                          : "bg-[#091122]/70 border-blue-500/15 text-slate-300 hover:border-blue-400/30 hover:bg-[#0b162c]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-cyan-300">
                          {doc.subject}
                        </span>
                        <button
                          onClick={(e) => handleDeleteDoc(doc.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-semibold mt-1.5 line-clamp-1">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {doc.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {activeDoc && (
            <div className="mt-4 pt-3 border-t border-blue-500/20 space-y-2">
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>AI Synthesize Study Guide</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGeneratePodcast}
                disabled={isGeneratingPodcast}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPodcast ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Audio Script...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Generate Audio Podcast</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Center Column: Live Document Reader & Study Brief (Col 4-8) */}
        <div className="col-span-5 border-r border-blue-500/20 p-5 flex flex-col overflow-y-auto bg-[#060b14]/70">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("text")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "text"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Note Content
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Executive Study Brief
              </button>
              <button
                onClick={() => setActiveTab("podcast")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "podcast"
                    ? "bg-cyan-600/30 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Podcast</span>
              </button>
            </div>

            <span className="text-[11px] text-cyan-400 font-mono">
              {activeDoc?.subject || "STEM Note"}
            </span>
          </div>

          {/* Tab 1: Source Document Text */}
          {activeTab === "text" && (
            <div className="space-y-4">
              {activeDoc ? (
                <div className="p-4 rounded-xl bg-[#091122]/80 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-blue-300">
                      {activeDoc.chapter}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {activeDoc.content.split(" ").length} words
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white mb-3">
                    {activeDoc.title}
                  </h2>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                    {activeDoc.content}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No note selected. Click &quot;Add Study Material&quot; to begin.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Executive Study Brief */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              {summary ? (
                <>
                  <div className="p-4 rounded-xl bg-[#091122]/90 border border-blue-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Executive Concept Summary</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {summary.executiveSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#091122]/90 border border-blue-500/30">
                    <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
                      Key Formulas & Definitions
                    </h3>
                    <ul className="space-y-1.5">
                      {summary.keyFormulasAndDefinitions.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Exam Pitfalls to Avoid</span>
                    </div>
                    <ul className="space-y-1.5">
                      {summary.boardExamPitfalls.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-amber-200/90">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#091122]/90 border border-blue-500/30">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      Suggested Review Questions
                    </h3>
                    <ul className="space-y-2">
                      {summary.suggestedReviewQuestions.map((q, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold font-mono">Q{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Click &quot;AI Synthesize Study Guide&quot; in the left sidebar to generate an executive concept brief from your note.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: NotebookLM Style Audio Podcast */}
          {activeTab === "podcast" && (
            <div className="space-y-4">
              {podcast ? (
                <>
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a36] to-[#070e1c] border border-cyan-500/30 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        Interactive Podcast Overview (2 Speakers)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {podcast.duration}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2">
                      {podcast.topic}
                    </h3>

                    {/* Player Controls */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#060b14]/80 border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={playPodcastAudio}
                          className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-5 h-5 fill-slate-950" />
                          ) : (
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {isPlayingAudio ? "Now Playing" : "Paused"}
                          </div>
                          <div className="text-[10px] text-cyan-300">
                            Speaker: {podcast.dialogue[activeSpeakerIndex]?.speaker}
                          </div>
                        </div>
                      </div>

                      {/* Speed Selector */}
                      <div className="flex items-center gap-1">
                        {[1, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setAudioSpeed(spd)}
                            className={`px-2 py-1 rounded text-[10px] font-bold font-mono transition-all cursor-pointer ${
                              audioSpeed === spd
                                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/40"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="space-y-2.5">
                    {podcast.dialogue.map((line, idx) => {
                      const isCurrent = isPlayingAudio && activeSpeakerIndex === idx;
                      const isSarah = line.speaker.includes("Sarah");
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all ${
                            isCurrent
                              ? "bg-cyan-950/40 border-cyan-400/50 shadow-md shadow-cyan-500/10"
                              : "bg-[#091122]/70 border-blue-500/15"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[10px] font-bold ${
                                isSarah ? "text-cyan-400" : "text-purple-400"
                              }`}
                            >
                              {line.speaker}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {line.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {line.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Click &quot;Generate Audio Podcast&quot; in the left sidebar to produce an educational podcast dialogue from your note.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Q&A with Live Web Search (Col 9-12) */}
        <div className="col-span-4 p-4 flex flex-col justify-between overflow-hidden bg-[#070e1c]/40">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white">
                  RAG &amp; Live Web Research
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">
                {webSearchEnabled ? "Google Search Active" : "Note Grounded"}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600/30 border border-blue-500/30 text-white ml-4"
                      : "bg-[#091122]/90 border border-blue-500/20 text-slate-200 mr-2"
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400 mb-1">
                    {msg.role === "user" ? "You" : "Study Assistant (Gemini)"}
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Web Sources Chips */}
                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-blue-500/20">
                      <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 mb-1.5">
                        <Globe className="w-3 h-3" />
                        <span>Google Search Grounding Sources:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.webSources.slice(0, 3).map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#060b14] hover:bg-cyan-950/40 border border-cyan-500/20 text-[10px] text-cyan-300 flex items-center justify-between transition-colors"
                          >
                            <span className="truncate max-w-[240px] font-medium">
                              {src.title}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isQuerying && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-xs text-cyan-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {webSearchEnabled
                      ? "Searching Google & grounding with notes..."
                      : "Analyzing document..."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ask Input */}
          <form
            onSubmit={handleAskQuestion}
            className="mt-3 pt-3 border-t border-blue-500/20 flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                webSearchEnabled
                  ? "Ask anything (searches live Google web & notes)..."
                  : "Ask about this note..."
              }
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isQuerying || !inputQuery.trim()}
              className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Add Custom Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#070e1c] border border-blue-500/30 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              Add New Study Material / Note
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste textbook text, notes, equations, or past paper questions.
            </p>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Physics, Chemistry, CS"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Chapter / Unit
                  </label>
                  <input
                    type="text"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    placeholder="e.g. Chapter 4: Motion"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Newton Laws and Momentum Conservation"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Content (Paste Text)
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste your study content, definitions, formulas, or past questions here..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Save &amp; Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
