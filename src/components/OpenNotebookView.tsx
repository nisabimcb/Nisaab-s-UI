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
  MessageSquare,
  Mic,
} from "lucide-react";
import {
  NotebookDocument,
  StudySummary,
  AudioPodcastEpisode,
  Citation,
  OmniRouteConfig,
  WebSearchSource,
  StudyMemo,
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
  const [activeTab, setActiveTab] = useState<"text" | "summary" | "podcast" | "memos" | "lecture">("text");

  // Study Memos State
  const [memos, setMemos] = useState<StudyMemo[]>([
    {
      id: "memo-1",
      content: "Always check Kelvin temperature conversion for Carnot numericals: K = °C + 273.15.",
      tag: "#formula",
      timestamp: "10:30 AM",
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
    },
    {
      id: "memo-2",
      content: "Third law of thermodynamics states Absolute Zero is unattainable, which prevents 100% engine efficiency.",
      tag: "#concept",
      timestamp: "11:15 AM",
      date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
    },
  ]);
  const [newMemoText, setNewMemoText] = useState("");
  const [newMemoTag, setNewMemoTag] = useState("#concept");
  const [memoFilter, setMemoFilter] = useState("all");

  // Lecture Mode State
  const [lectureTranscript, setLectureTranscript] = useState("");
  const [lectureTitle, setLectureTitle] = useState("");
  const [isProcessingLecture, setIsProcessingLecture] = useState(false);
  const [lectureResult, setLectureResult] = useState<StudySummary | null>(null);

  // Load from localStorage on mount
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
      const savedMemos = localStorage.getItem("student_study_memos");
      if (savedMemos) {
        const parsedM = JSON.parse(savedMemos);
        if (Array.isArray(parsedM) && parsedM.length > 0) {
          setMemos(parsedM);
        }
      }
    } catch {}
  }, []);

  // Save memos whenever updated
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("student_study_memos", JSON.stringify(memos));
    } catch {}
  }, [memos, isMounted]);

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
        "Ready to research. Ask questions grounded in your notes or with live Google web research.",
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

  // Save documents to localStorage
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
          content: `Regarding "${query}":\n\n• Analysis: According to your study material on "${activeDoc?.title || "STEM"}", review the primary equations and boundary principles.\n• Key Exam Tip: Always confirm SI units and state assumptions clearly.`,
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  // PDF Upload State
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

  const handlePdfUpload = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please select a valid PDF document (.pdf).");
      return;
    }

    setIsUploadingPdf(true);
    setPdfUploadError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });
      reader.readAsDataURL(file);
      const dataUrl = await base64Promise;

      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "parse_pdf",
          pdfData: dataUrl,
          pdfFileName: file.name,
          config: omniConfig,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const parsed = data.data;
        const newDoc: NotebookDocument = {
          id: `doc-pdf-${Date.now()}`,
          subject: parsed.subject || "Academic Study",
          title: parsed.title || file.name.replace(/\.pdf$/i, ""),
          chapter: parsed.chapter || "Uploaded PDF Chapter",
          content: parsed.content || "Content extracted from uploaded PDF.",
          sourceType: "textbook",
          uploadedAt: new Date().toISOString(),
        };

        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedDocId(newDoc.id);
        setActiveTab("text");
        setIsAddModalOpen(false);
      } else {
        throw new Error(data.error || "Could not parse PDF content");
      }
    } catch (err: any) {
      console.error("PDF upload error:", err);
      setPdfUploadError(err.message || "Failed to process PDF");
    } finally {
      setIsUploadingPdf(false);
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
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Top Header - Slim Minimal Bar */}
      <div className="border-b border-zinc-800/70 bg-[#09090b] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-200">
            Notebooks
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            {documents.length} notes
          </span>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              webSearchEnabled
                ? "bg-zinc-800 border-zinc-700 text-zinc-200"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
            title="Toggle Gemini Live Google Search Grounding"
          >
            <Globe className="w-3 h-3 text-zinc-400" />
            <span>Search Grounding: {webSearchEnabled ? "ON" : "OFF"}</span>
          </button>

          <label
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition-colors cursor-pointer ${
              isUploadingPdf ? "opacity-60 pointer-events-none" : ""
            }`}
            title="Upload textbook chapter, past paper, or lecture notes PDF"
          >
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handlePdfUpload(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
            {isUploadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Ingesting PDF...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload PDF</span>
              </>
            )}
          </label>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Note</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Column 1: Materials List (Col 1-3) */}
        <div className="col-span-3 border-r border-zinc-800/70 bg-[#09090b] p-3 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-2 px-1">
              Documents
            </div>

            {documents.length === 0 ? (
              <div className="p-4 text-center rounded-lg bg-[#121215] border border-zinc-800">
                <FileText className="w-5 h-5 mx-auto text-zinc-500 mb-1.5" />
                <p className="text-xs font-medium text-zinc-300">No notes</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-2 px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-200 text-xs font-medium"
                >
                  Create note
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {documents.map((doc) => {
                  const isSelected = doc.id === activeDoc?.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-2.5 rounded-lg border transition-colors cursor-pointer relative group ${
                        isSelected
                          ? "bg-zinc-800/90 border-zinc-700 text-zinc-100"
                          : "bg-[#121215] border-zinc-800/80 text-zinc-300 hover:border-zinc-700/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          {doc.subject}
                        </span>
                        <button
                          onClick={(e) => handleDeleteDoc(doc.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition-opacity"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xs font-medium mt-1 line-clamp-1">
                        {doc.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
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
            <div className="mt-3 pt-2.5 border-t border-zinc-800/70 space-y-1.5">
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Synthesize Guide</span>
                  </>
                )}
              </button>

              <button
                onClick={handleGeneratePodcast}
                disabled={isGeneratingPodcast}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {isGeneratingPodcast ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Audio...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Audio Podcast</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Column 2: Live Document Reader & Workspace (Col 4-8) */}
        <div className="col-span-5 border-r border-zinc-800/70 p-4 flex flex-col overflow-y-auto bg-[#0c0c0e]">
          {/* Minimal Sub-Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2.5 mb-3.5">
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { id: "text", label: "Note Content" },
                { id: "summary", label: "Study Brief" },
                { id: "podcast", label: "Audio Podcast" },
                { id: "memos", label: "Memos" },
                { id: "lecture", label: "Lecture Mode" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
              {activeDoc?.subject || "STEM"}
            </span>
          </div>

          {/* Tab 1: Source Document Text */}
          {activeTab === "text" && (
            <div className="space-y-3">
              {activeDoc ? (
                <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-300">
                      {activeDoc.chapter}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {activeDoc.content.split(" ").length} words
                    </span>
                  </div>
                  <h2 className="text-sm font-medium text-zinc-100 mb-2.5">
                    {activeDoc.title}
                  </h2>
                  <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                    {activeDoc.content}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  No note selected. Click &quot;Note&quot; to begin.
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Executive Study Brief */}
          {activeTab === "summary" && (
            <div className="space-y-3">
              {summary ? (
                <>
                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200 mb-2">
                      <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Concept Summary</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {summary.executiveSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
                    <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                      Key Formulas &amp; Definitions
                    </h3>
                    <ul className="space-y-1.5">
                      {summary.keyFormulasAndDefinitions.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400/90 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Exam Pitfalls</span>
                    </div>
                    <ul className="space-y-1.5">
                      {summary.boardExamPitfalls.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 mt-1.5 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80">
                    <h3 className="text-xs font-medium text-zinc-300 uppercase tracking-wider mb-2">
                      Suggested Review Questions
                    </h3>
                    <ul className="space-y-2">
                      {summary.suggestedReviewQuestions.map((q, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-zinc-500 font-mono">Q{i + 1}.</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Click &quot;Synthesize Guide&quot; in the left sidebar to generate a concept brief.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Audio Podcast */}
          {activeTab === "podcast" && (
            <div className="space-y-3">
              {podcast ? (
                <>
                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono text-zinc-400">
                        Educational Dialogue
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">
                        {podcast.duration}
                      </span>
                    </div>

                    <h3 className="text-xs font-medium text-zinc-200 mb-2">
                      {podcast.topic}
                    </h3>

                    {/* Player Controls */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#09090b] border border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={playPodcastAudio}
                          className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {isPlayingAudio ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="text-xs font-medium text-zinc-200">
                            {isPlayingAudio ? "Playing" : "Paused"}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {podcast.dialogue[activeSpeakerIndex]?.speaker}
                          </div>
                        </div>
                      </div>

                      {/* Speed Selector */}
                      <div className="flex items-center gap-1">
                        {[1, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => setAudioSpeed(spd)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                              audioSpeed === spd
                                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                                : "text-zinc-500 hover:text-zinc-300"
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
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border transition-colors ${
                            isCurrent
                              ? "bg-zinc-800/80 border-zinc-700"
                              : "bg-[#121215] border-zinc-800/70"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-zinc-400">
                              {line.speaker}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {line.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {line.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  Click &quot;Audio Podcast&quot; in the left sidebar to produce an educational dialogue.
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Study Memos Timeline */}
          {activeTab === "memos" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Quick Memos</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {memos.length} logged
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={newMemoText}
                    onChange={(e) => setNewMemoText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMemoText.trim()) {
                        const newMemo: StudyMemo = {
                          id: `memo-${Date.now()}`,
                          content: newMemoText.trim(),
                          tag: newMemoTag,
                          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                          date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
                        };
                        setMemos([newMemo, ...memos]);
                        setNewMemoText("");
                      }
                    }}
                    placeholder="Capture a quick thought or reminder..."
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  />
                  <select
                    value={newMemoTag}
                    onChange={(e) => setNewMemoTag(e.target.value)}
                    className="px-2 py-1 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-300"
                  >
                    <option value="#concept">#concept</option>
                    <option value="#formula">#formula</option>
                    <option value="#exam_tip">#exam_tip</option>
                    <option value="#log">#log</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newMemoText.trim()) return;
                      const newMemo: StudyMemo = {
                        id: `memo-${Date.now()}`,
                        content: newMemoText.trim(),
                        tag: newMemoTag,
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
                      };
                      setMemos([newMemo, ...memos]);
                      setNewMemoText("");
                    }}
                    className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 cursor-pointer"
                  >
                    Post
                  </button>
                </div>

                <div className="flex items-center gap-1 pt-0.5">
                  {["all", "#concept", "#formula", "#exam_tip", "#log"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setMemoFilter(t)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                        memoFilter === t
                          ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memo Timeline */}
              <div className="space-y-2">
                {memos
                  .filter((m) => memoFilter === "all" || m.tag === memoFilter)
                  .map((memo) => (
                    <div
                      key={memo.id}
                      className="p-3 rounded-lg bg-[#121215] border border-zinc-800/80 hover:border-zinc-700 transition-colors relative group"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-[10px] font-mono text-zinc-400">
                          {memo.tag}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                          <span>{memo.date} · {memo.timestamp}</span>
                          <button
                            onClick={() => setMemos(memos.filter((m) => m.id !== memo.id))}
                            className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-200 leading-relaxed">{memo.content}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tab 5: Lecture Mode */}
          {activeTab === "lecture" && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                    <Mic className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Lecture Synthesizer</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Paste transcript or audio notes
                  </span>
                </div>

                <input
                  type="text"
                  value={lectureTitle}
                  onChange={(e) => setLectureTitle(e.target.value)}
                  placeholder="Lecture Topic (e.g. Thermodynamics Carnot Cycle)"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />

                <textarea
                  rows={5}
                  value={lectureTranscript}
                  onChange={(e) => setLectureTranscript(e.target.value)}
                  placeholder="Paste lecture audio transcript, professor speech notes, or bullet points here..."
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Gemini API
                  </span>
                  <button
                    type="button"
                    disabled={isProcessingLecture || !lectureTranscript.trim()}
                    onClick={async () => {
                      setIsProcessingLecture(true);
                      try {
                        const res = await fetch("/api/ai/omni-route", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "lecture_notes",
                            subject: activeDoc?.subject || "Academic",
                            topic: lectureTitle || "University Lecture",
                            transcript: lectureTranscript,
                            config: omniConfig,
                          }),
                        });
                        const data = await res.json();
                        if (data.success && data.data) {
                          setLectureResult(data.data);
                        }
                      } catch (err) {
                        console.error("Lecture processing error:", err);
                      } finally {
                        setIsProcessingLecture(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessingLecture ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Extract Notes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {lectureResult && (
                <div className="space-y-2.5">
                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-200">Synthesized Lecture Overview</span>
                      <button
                        onClick={() => {
                          const newDoc: NotebookDocument = {
                            id: `doc-${Date.now()}`,
                            subject: activeDoc?.subject || "Physics",
                            title: lectureTitle || "Synthesized Lecture Notes",
                            chapter: "Lecture Notes",
                            content: `${lectureResult.executiveSummary}\n\nKey Formulas:\n${lectureResult.keyFormulasAndDefinitions.join("\n")}`,
                            sourceType: "notes",
                            uploadedAt: new Date().toISOString(),
                          };
                          setDocuments([newDoc, ...documents]);
                          setSelectedDocId(newDoc.id);
                          setActiveTab("text");
                        }}
                        className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Save to Documents</span>
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">{lectureResult.executiveSummary}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800/80 space-y-1.5">
                    <h4 className="text-xs font-medium text-zinc-300">Key Points</h4>
                    <ul className="space-y-1">
                      {lectureResult.keyFormulasAndDefinitions.map((f, idx) => (
                        <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                          <span className="text-zinc-500 mt-1">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Column 3: Q&A with Live Web Search (Col 9-12) */}
        <div className="col-span-4 p-3.5 flex flex-col justify-between overflow-hidden bg-[#09090b]">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800/70 pb-2 mb-2.5">
              <span className="text-xs font-medium text-zinc-200">
                Research Chat
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {webSearchEnabled ? "Live Web" : "Notes Only"}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-170px)] pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-zinc-800 text-zinc-100 ml-4"
                      : "bg-[#121215] border border-zinc-800/80 text-zinc-200 mr-2"
                  }`}
                >
                  <div className="text-[10px] text-zinc-400 mb-1">
                    {msg.role === "user" ? "You" : "Copilot"}
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Web Sources Chips */}
                  {msg.webSources && msg.webSources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-800/60">
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-1">
                        <Globe className="w-3 h-3" />
                        <span>Sources:</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.webSources.slice(0, 3).map((src, sIdx) => (
                          <a
                            key={sIdx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md bg-[#09090b] hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center justify-between transition-colors"
                          >
                            <span className="truncate max-w-[200px]">
                              {src.title}
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-1 opacity-50" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isQuerying && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#121215] border border-zinc-800 text-xs text-zinc-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {webSearchEnabled
                      ? "Searching Google &amp; notes..."
                      : "Analyzing note..."}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ask Input */}
          <form
            onSubmit={handleAskQuestion}
            className="mt-2 pt-2 border-t border-zinc-800/70 flex gap-1.5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
            <button
              type="submit"
              disabled={isQuerying || !inputQuery.trim()}
              className="px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Add Custom Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#121215] border border-zinc-800 p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-medium text-zinc-200">
                New Study Material
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick PDF Import Zone */}
            <div className="p-3 rounded-lg border border-dashed border-zinc-700/80 bg-zinc-950/60 text-center space-y-2">
              <div className="text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span>Upload PDF Document</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Upload textbook chapters, past paper questions, or lecture notes (.pdf). Gemini automatically parses and extracts study sections.
              </p>
              <label
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 transition-colors cursor-pointer ${
                  isUploadingPdf ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePdfUpload(e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />
                {isUploadingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting PDF Content...</span>
                  </>
                ) : (
                  <>
                    <span>Choose PDF File</span>
                  </>
                )}
              </label>
              {pdfUploadError && (
                <div className="text-[10px] text-rose-400">{pdfUploadError}</div>
              )}
            </div>

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] text-zinc-500 uppercase font-mono">or enter manually</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Physics, CS"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">
                    Chapter / Unit
                  </label>
                  <input
                    type="text"
                    value={newChapter}
                    onChange={(e) => setNewChapter(e.target.value)}
                    placeholder="e.g. Chapter 4: Motion"
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Newton Laws and Momentum"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">
                  Content
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste your study content, definitions, formulas, or notes here..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
