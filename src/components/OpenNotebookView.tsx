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
  // Default seed note
  const DEFAULT_NOTE: NotebookDocument = {
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
    uploadedAt: "2026-09-25T00:00:00.000Z",
  };

  const [documents, setDocuments] = useState<NotebookDocument[]>([DEFAULT_NOTE]);
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-my-first-note");
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "summary" | "podcast">("text");

  // Load from localStorage on mount (prevents hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("student_notebook_docs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed);
          setSelectedDocId(parsed[0].id);
        }
      }
    } catch {}
  }, []);

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

  // Save documents to localStorage whenever updated after mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("student_notebook_docs", JSON.stringify(documents));
    } catch {}
  }, [documents, isMounted]);

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
      } else {
        throw new Error(data.error || "No response received");
      }
    } catch (err) {
      console.warn("RAG Query fallback:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Regarding "${query}":\n\n• Analysis: According to your study material on "${activeDoc?.title || "STEM"}", review the primary equations and boundary principles.\n• Key Exam Tip: Always confirm SI units and state assumptions clearly.\n\nWhat other aspect would you like to explore?`,
        },
      ]);
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
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-[#0e131f] px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white">
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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              webSearchEnabled
                ? "bg-slate-800 border-blue-500/30 text-blue-400"
                : "bg-slate-900 border-slate-800 text-slate-500"
            }`}
            title="Toggle Gemini Live Google Search Grounding"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Search Grounding: {webSearchEnabled ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Study Material</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: My Notebook Materials (Col 1-3) */}
        <div className="col-span-3 border-r border-slate-800 bg-[#0e131f]/70 p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                My Materials ({documents.length})
              </span>
            </div>

            {documents.length === 0 ? (
              <div className="p-5 text-center rounded-xl bg-slate-900 border border-slate-800">
                <FileText className="w-6 h-6 mx-auto text-slate-500 mb-2" />
                <p className="text-xs font-medium text-slate-300">No notes yet</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Paste your textbook chapter, lecture notes, or past papers.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium"
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
                      className={`p-3 rounded-lg border transition-colors cursor-pointer relative group ${
                        isSelected
                          ? "bg-slate-800 border-blue-500 text-white"
                          : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          {doc.subject}
                        </span>
                        <button
                          onClick={(e) => handleDeleteDoc(doc.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-400 transition-opacity"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-xs font-medium mt-1 line-clamp-1">
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
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>Synthesize Study Guide</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGeneratePodcast}
                disabled={isGeneratingPodcast}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPodcast ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Audio...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Generate Audio Podcast</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Center Column: Live Document Reader & Study Brief (Col 4-8) */}
        <div className="col-span-5 border-r border-slate-800 p-5 flex flex-col overflow-y-auto bg-[#0e131f]">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab("text")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "text"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Note Content
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "summary"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Study Brief
              </button>
              <button
                onClick={() => setActiveTab("podcast")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === "podcast"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Podcast</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              {activeDoc?.subject || "STEM Note"}
            </span>
          </div>

          {/* Tab 1: Source Document Text */}
          {activeTab === "text" && (
            <div className="space-y-4">
              {activeDoc ? (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-blue-400">
                      {activeDoc.chapter}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {activeDoc.content.split(" ").length} words
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-white mb-3">
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
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Executive Concept Summary</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {summary.executiveSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                      Key Formulas &amp; Definitions
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

                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
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

                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                      Suggested Review Questions
                    </h3>
                    <ul className="space-y-2">
                      {summary.suggestedReviewQuestions.map((q, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-semibold font-mono">Q{i + 1}.</span>
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
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Interactive Podcast Overview (2 Speakers)
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {podcast.duration}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-white mb-2">
                      {podcast.topic}
                    </h3>

                    {/* Player Controls */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={playPodcastAudio}
                          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-4 h-4 fill-white" />
                          ) : (
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="text-xs font-medium text-white">
                            {isPlayingAudio ? "Now Playing" : "Paused"}
                          </div>
                          <div className="text-[10px] text-slate-400">
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
                            className={`px-2 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                              audioSpeed === spd
                                ? "bg-slate-800 text-blue-400 border border-slate-700"
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
                  <div className="space-y-2">
                    {podcast.dialogue.map((line, idx) => {
                      const isCurrent = isPlayingAudio && activeSpeakerIndex === idx;
                      const isSarah = line.speaker.includes("Sarah");
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-colors ${
                            isCurrent
                              ? "bg-slate-800/90 border-blue-500/50"
                              : "bg-slate-900/60 border-slate-800"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[10px] font-semibold ${
                                isSarah ? "text-blue-400" : "text-emerald-400"
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
        <div className="col-span-4 p-4 flex flex-col justify-between overflow-hidden bg-[#0b0f17]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-white">
                  RAG &amp; Live Web Research
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
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
                      ? "bg-blue-600 text-white ml-4"
                      : "bg-slate-900 border border-slate-800 text-slate-200 mr-2"
                  }`}
                >
                  <div className="text-[10px] font-semibold text-slate-400 mb-1">
                    {msg.role === "user" ? "You" : "Study Assistant (Gemini / OmniRoute)"}
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Web Sources Chips */}
                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800">
                      <div className="text-[10px] font-semibold text-blue-400 flex items-center gap-1 mb-1.5">
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
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-blue-400 flex items-center justify-between transition-colors"
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
                <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>
                    {webSearchEnabled
                      ? "Searching Google &amp; grounding with notes..."
                      : "Analyzing document..."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ask Input */}
          <form
            onSubmit={handleAskQuestion}
            className="mt-3 pt-3 border-t border-slate-800 flex gap-2"
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
              className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isQuerying || !inputQuery.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Add Custom Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0e131f] border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white mb-1">
              Add New Study Material / Note
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Paste textbook text, notes, equations, or past paper questions.
            </p>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Physics, Chemistry, CS"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-300 block mb-1">
                    Chapter / Unit
                  </label>
                  <input
                    type="text"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    placeholder="e.g. Chapter 4: Motion"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Newton Laws and Momentum Conservation"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Content (Paste Text)
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste your study content, definitions, formulas, or past questions here..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
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
