"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Send,
  Loader2,
  Atom,
  FlaskConical,
  Binary,
  Dna,
  Sigma,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import {
  StemSubject,
  NotebookDocument,
  StudySummary,
  AudioPodcastEpisode,
  Citation,
  OmniRouteConfig,
} from "@/types/stem";
import {
  STEM_SUBJECTS,
  PRELOADED_DOCUMENTS,
  PRELOADED_SUMMARIES,
  PRELOADED_PODCASTS,
} from "@/lib/fbise-curriculum";

interface OpenNotebookViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
}

export default function OpenNotebookView({ omniConfig }: OpenNotebookViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<StemSubject>("physics");
  const [documents, setDocuments] = useState<NotebookDocument[]>(PRELOADED_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>("doc-phy-11");
  const [activeTab, setActiveTab] = useState<"text" | "summary" | "podcast">("text");

  // Custom Note Creation State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [newContent, setNewContent] = useState("");

  // Synthesis State
  const [summary, setSummary] = useState<StudySummary>(PRELOADED_SUMMARIES.physics);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // RAG Chat State
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; content: string; citations?: Citation[] }[]
  >([
    {
      role: "assistant",
      content:
        "Welcome to the Open-Notebook Research Workspace. I am grounded in your FBISE textbook materials. Ask me to explain derivations, solve numericals, or generate study notes with source citations!",
      citations: [
        {
          sourceId: "doc-phy-11",
          sourceTitle: "FBISE Physics Ch. 11 Thermodynamics",
          snippet: "Carnot Engine Theorem & Second Law of Thermodynamics",
          confidence: 0.98,
        },
      ],
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  // Audio Podcast Player State
  const [podcast, setPodcast] = useState<AudioPodcastEpisode>(PRELOADED_PODCASTS.physics);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeSpeakerIndex, setActiveSpeakerIndex] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [audioAvailable, setAudioAvailable] = useState(true);

  // Filter docs for current subject
  const currentDocs = documents.filter((d) => d.subject === selectedSubject);
  const activeDoc =
    currentDocs.find((d) => d.id === selectedDocId) ||
    currentDocs[0] ||
    PRELOADED_DOCUMENTS[0];

  // Update summary & podcast when subject changes
  useEffect(() => {
    const doc = documents.find((d) => d.subject === selectedSubject);
    if (doc) setSelectedDocId(doc.id);
    setSummary(PRELOADED_SUMMARIES[selectedSubject] || PRELOADED_SUMMARIES.physics);
    setPodcast(PRELOADED_PODCASTS[selectedSubject] || PRELOADED_PODCASTS.physics);
    // Stop any ongoing speech
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [selectedSubject, documents]);

  // Handle Synthesis Request
  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "synthesize",
          subject: selectedSubject,
          context: activeDoc.content,
          config: omniConfig,
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

  // Handle RAG Ask Question
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
          subject: selectedSubject,
          userMessage: query,
          context: activeDoc.content,
          config: omniConfig,
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
          },
        ]);
      }
    } catch (err) {
      console.error("RAG Query error:", err);
    } finally {
      setIsQuerying(false);
    }
  };

  // Add Custom Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDoc: NotebookDocument = {
      id: `doc-custom-${Date.now()}`,
      subject: selectedSubject,
      title: newTitle,
      chapter: newChapter || "Student Uploaded Note",
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
  };

  // Speech Synthesis Audio Player implementation
  const playPodcastAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioAvailable(false);
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

      // Differentiate voices slightly
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

  const getSubjectIcon = (sub: StemSubject) => {
    switch (sub) {
      case "physics":
        return <Atom className="w-4 h-4 text-blue-400" />;
      case "chemistry":
        return <FlaskConical className="w-4 h-4 text-cyan-400" />;
      case "computer_science":
        return <Binary className="w-4 h-4 text-purple-400" />;
      case "biology":
        return <Dna className="w-4 h-4 text-emerald-400" />;
      case "mathematics":
        return <Sigma className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060b14] text-slate-100 overflow-hidden">
      {/* Top Bar / Subject Selector */}
      <div className="border-b border-blue-500/20 bg-[#070e1c]/90 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-heading)]">
              Open-Notebook Research Hub
            </h1>
            <p className="text-[11px] text-slate-400">
              Multi-source FBISE HSSC RAG grounding, study briefs & audio overviews
            </p>
          </div>
        </div>

        {/* Subjects Switcher */}
        <div className="flex items-center gap-1.5 bg-[#060b16] p-1 rounded-xl border border-blue-500/20">
          {STEM_SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-400 hover:text-white hover:bg-blue-600/10"
                }`}
              >
                {getSubjectIcon(sub.id)}
                <span>{sub.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Studio Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left Column: Documents Library & Notes (Col 1-3) */}
        <div className="col-span-3 border-r border-blue-500/20 bg-[#070e1c]/50 p-4 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Source Library ({currentDocs.length})
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            <div className="space-y-2">
              {currentDocs.map((doc) => {
                const isSelected = doc.id === activeDoc?.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/20 border-blue-400/40 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                        : "bg-[#091122]/70 border-blue-500/15 text-slate-300 hover:border-blue-400/30 hover:bg-[#0b162c]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                        {doc.sourceType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {doc.chapter.split(":")[0]}
                      </span>
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
          </div>

          {/* Quick Action Button */}
          <div className="mt-4 pt-3 border-t border-blue-500/20">
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>AI Synthesize Study Guide</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center Column: Document Reader & Synthesis View (Col 4-8) */}
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
                Grounded Text
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

            <span className="text-[11px] text-blue-400 font-mono">
              FBISE SLO Aligned
            </span>
          </div>

          {/* Tab 1: Source Document Text */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#091122]/80 border border-blue-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-blue-300">
                    {activeDoc?.chapter}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeDoc?.content.split(" ").length} words
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mb-3">
                  {activeDoc?.title}
                </h2>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {activeDoc?.content}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Executive Study Brief */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#091122]/90 border border-blue-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
                  <Lightbulb className="w-4 h-4" />
                  <span>Executive Concept Summary</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {summary.executiveSummary}
                </p>
              </div>

              {/* Formulas & Definitions */}
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

              {/* Board Exam Pitfalls */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>FBISE Board Exam Pitfalls (Avoid Mark Deductions)</span>
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

              {/* Review Questions */}
              <div className="p-4 rounded-xl bg-[#091122]/90 border border-blue-500/30">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  Suggested Board Review Questions
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
            </div>
          )}

          {/* Tab 3: NotebookLM Style Audio Podcast */}
          {activeTab === "podcast" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a36] to-[#070e1c] border border-cyan-500/30 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Deep Dive Study Podcast (2 Hosts)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {podcast.duration}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">
                  {podcast.topic}
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Listen to Dr. Sarah and Alex breakdown complex FBISE concepts through lively academic dialogue.
                </p>

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

                {/* Animated Wave Indicator */}
                {isPlayingAudio && (
                  <div className="flex items-center justify-center gap-1.5 mt-3 py-1">
                    <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full" />
                    <span className="w-1 h-6 bg-cyan-400 animate-bounce rounded-full" />
                    <span className="w-1 h-4 bg-cyan-400 animate-pulse rounded-full" />
                    <span className="w-1 h-7 bg-cyan-400 animate-bounce rounded-full" />
                    <span className="w-1 h-3 bg-cyan-400 animate-pulse rounded-full" />
                  </div>
                )}
              </div>

              {/* Dialogue Transcript */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Live Dialogue Script
                </span>
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
            </div>
          )}
        </div>

        {/* Right Column: Citation-Grounded RAG Chat (Col 9-12) */}
        <div className="col-span-4 p-4 flex flex-col justify-between overflow-hidden bg-[#070e1c]/40">
          <div>
            <div className="flex items-center justify-between border-b border-blue-500/20 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">
                  Citation-Grounded Q&A
                </span>
              </div>
              <span className="text-[10px] text-slate-400">RAG Context: Active Note</span>
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
                    {msg.role === "user" ? "You" : "NotebookLM Scribe"}
                  </div>
                  <div className="whitespace-pre-line">{msg.content}</div>

                  {/* Citations Preview */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-blue-500/20">
                      <div className="text-[10px] font-bold text-cyan-400 mb-1">
                        Source Citations:
                      </div>
                      {msg.citations.map((c, ci) => (
                        <div
                          key={ci}
                          className="p-1.5 rounded-lg bg-[#060b14] border border-cyan-500/20 text-[10px] text-slate-300"
                        >
                          <span className="font-semibold text-cyan-300">
                            [{ci + 1}] {c.sourceTitle}:
                          </span>{" "}
                          &quot;{c.snippet}&quot;
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isQuerying && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-xs text-blue-300">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching document and synthesizing answer...</span>
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
              placeholder="Ask about this document..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={isQuerying || !inputQuery.trim()}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Add Custom Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#070e1c] border border-blue-500/30 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">
              Add New Study Material / Note
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload textbook excerpts, lecture notes, or past papers for FBISE {selectedSubject.toUpperCase()}.
            </p>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Newton Laws & Applications"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Chapter Reference / SLO
                </label>
                <input
                  type="text"
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  placeholder="e.g. Chapter 4: Motion and Force"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Content (Paste Text / Notes)
                </label>
                <textarea
                  rows={6}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste textbook text, equations, or teacher notes here..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-blue-400 font-sans"
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
                  Save & Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
