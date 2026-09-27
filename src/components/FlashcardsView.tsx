"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Shuffle,
  Loader2,
  BookOpen,
  Download,
  FileText,
  Calendar,
} from "lucide-react";
import { Flashcard, OmniRouteConfig } from "@/types/stem";

interface FlashcardsViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-init-1",
    front: "What is the formula for Carnot Engine Thermal Efficiency?",
    back: "η = 1 - (T2 / T1) = (T1 - T2) / T1\n\nWhere T1 = Temperature of Hot Reservoir (Source) in Kelvin\nT2 = Temperature of Cold Reservoir (Sink) in Kelvin.\n\nExam Tip: Always convert °C to Kelvin by adding 273.15.",
    category: "Formula",
    subject: "Physics",
    status: "new",
  },
  {
    id: "fc-init-2",
    front: "Why is 100% thermal efficiency impossible for any heat engine?",
    back: "By η = 1 - (T2/T1), achieving 100% efficiency requires T2 = 0 Kelvin (Absolute Zero).\n\nAccording to the Third Law of Thermodynamics, Absolute Zero is unattainable in a finite number of thermodynamic steps. Hence, some heat must always be exhausted to the sink.",
    category: "Concept",
    subject: "Physics",
    status: "new",
  },
  {
    id: "fc-init-3",
    front: "State the First Law of Thermodynamics and its sign conventions.",
    back: "ΔQ = ΔU + W = ΔU + P·ΔV\n\nSign Conventions:\n• Heat added to system: ΔQ > 0\n• Work done by system (expansion): W > 0\n• Increase in internal energy: ΔU > 0",
    category: "Law",
    subject: "Physics",
    status: "learning",
  },
  {
    id: "fc-init-4",
    front: "What is the Photoelectric Equation formulated by Albert Einstein?",
    back: "hf = Φ + KE_max = Φ + ½ m v_max²\n\nWhere:\n• h = Planck's constant (6.63 × 10⁻³⁴ J·s)\n• f = Frequency of incident photon\n• Φ = Work function of metal (minimum energy required to liberate electron)\n• KE_max = Maximum kinetic energy of photoelectron",
    category: "Formula",
    subject: "Physics",
    status: "new",
  },
  {
    id: "fc-init-5",
    front: "What are the 4 successive strokes of the ideal Carnot Cycle?",
    back: "1. Isothermal Expansion (at constant high temperature T1)\n2. Adiabatic Expansion (gas cools from T1 to T2, Q = 0)\n3. Isothermal Compression (at constant low temperature T2)\n4. Adiabatic Compression (gas heats up from T2 back to T1, Q = 0)",
    category: "Derivation",
    subject: "Physics",
    status: "mastered",
  },
];

export default function FlashcardsView({ omniConfig }: FlashcardsViewProps) {
  const [cards, setCards] = useState<Flashcard[]>(DEFAULT_FLASHCARDS);
  const [isMounted, setIsMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Load persistent cards on client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("student_flashcards_deck");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCards(parsed);
        }
      }
    } catch {}
  }, []);

  // AI Flashcard Generation
  const [generateTopic, setGenerateTopic] = useState("Carnot Heat Engine & Thermodynamics");
  const [isGenerating, setIsGenerating] = useState(false);

  // New Card Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState("Formula");
  const [newSubject, setNewSubject] = useState("Physics");

  // Save to localStorage after mount
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("student_flashcards_deck", JSON.stringify(cards));
    } catch {}
  }, [cards, isMounted]);

  // md2anki state
  const [isMd2AnkiOpen, setIsMd2AnkiOpen] = useState(false);
  const [markdownNotes, setMarkdownNotes] = useState("");
  const [isParsingMarkdown, setIsParsingMarkdown] = useState(false);

  // Filter cards by subject
  const filteredCards = cards.filter(
    (c) => selectedSubject === "All" || c.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  // FSRS Spaced Repetition Grading (Again, Hard, Good, Easy)
  const handleFSRSRating = (grade: "again" | "hard" | "good" | "easy") => {
    if (!activeCard) return;
    const currentEase = activeCard.easeFactor || 2.5;
    const currentInterval = activeCard.intervalDays || 1;
    const reviewCount = (activeCard.reviewCount || 0) + 1;

    let newInterval = 1;
    let newEase = currentEase;
    let newStatus: "new" | "learning" | "mastered" = "learning";

    if (grade === "again") {
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.2);
      newStatus = "new";
    } else if (grade === "hard") {
      newInterval = 1;
      newEase = Math.max(1.3, currentEase - 0.15);
      newStatus = "learning";
    } else if (grade === "good") {
      newInterval = Math.max(2, Math.round(currentInterval * currentEase));
      newStatus = "learning";
    } else if (grade === "easy") {
      newInterval = Math.max(4, Math.round(currentInterval * currentEase * 1.3));
      newEase = currentEase + 0.15;
      newStatus = "mastered";
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    setCards((prev) =>
      prev.map((c) =>
        c.id === activeCard.id
          ? {
              ...c,
              intervalDays: newInterval,
              easeFactor: Number(newEase.toFixed(2)),
              reviewCount,
              nextReviewDate: nextDate.toISOString(),
              status: newStatus,
            }
          : c
      )
    );
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  // Export to Anki (.txt / TSV)
  const handleExportAnki = () => {
    if (cards.length === 0) return;
    const header = "#separator:tab\n#html:false\n#tags column:3\n";
    const rows = cards
      .map((c) => {
        const cleanFront = c.front.replace(/\t/g, " ").replace(/\n/g, "<br>");
        const cleanBack = c.back.replace(/\t/g, " ").replace(/\n/g, "<br>");
        const tag = `${c.subject}_${c.category || "General"}`.replace(/\s+/g, "_");
        return `${cleanFront}\t${cleanBack}\t${tag}`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Anki_STEM_Deck_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // md2anki Markdown Parser
  const handleParseMarkdownToAnki = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markdownNotes.trim()) return;

    setIsParsingMarkdown(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "md2anki",
          markdown: markdownNotes,
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setCards((prev) => [...data.data, ...prev]);
        setMarkdownNotes("");
        setIsMd2AnkiOpen(false);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("md2anki error:", err);
    } finally {
      setIsParsingMarkdown(false);
    }
  };

  // Generate with Gemini / AI
  const handleAIGenerateCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateTopic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "flashcards",
          topic: generateTopic,
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setCards((prev) => [...data.data, ...prev]);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error("Generate flashcards error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add custom manual card
  const handleAddCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      category: newCategory,
      subject: newSubject,
      status: "new",
    };

    setCards([newCard, ...cards]);
    setNewFront("");
    setNewBack("");
    setIsAddModalOpen(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleDeleteActiveCard = () => {
    if (!activeCard) return;
    setCards((prev) => prev.filter((c) => c.id !== activeCard.id));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Stats
  const totalCount = cards.length;
  const masteredCount = cards.filter((c) => c.status === "mastered").length;
  const learningCount = cards.filter((c) => c.status === "learning").length;
  const masteryPercentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-100 overflow-y-auto p-4 md:p-6">
      <div className="max-w-3xl mx-auto w-full space-y-4">
        {/* Minimal Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/70">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm font-medium text-zinc-200">
              Flashcards
            </h1>
            <span className="text-[11px] text-zinc-400 font-mono">
              {cards.length} cards · {masteryPercentage}% mastered
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMd2AnkiOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
              title="Parse raw Markdown study notes into Anki cards (md2anki)"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>md2anki</span>
            </button>
            <button
              onClick={handleExportAnki}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
              title="Export deck to Anki (.txt)"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={handleShuffle}
              className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
              title="Shuffle Cards"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimal AI Generator Bar */}
        <form onSubmit={handleAIGenerateCards} className="flex items-center gap-2">
          <input
            type="text"
            value={generateTopic}
            onChange={(e) => setGenerateTopic(e.target.value)}
            placeholder="Generate cards for any topic (e.g. Carnot engine, Kirchhoff's laws)..."
            className="flex-1 px-3 py-1.5 text-xs rounded-md bg-[#121215] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
          />
          <button
            type="submit"
            disabled={isGenerating || !generateTopic.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>Generate</span>
              </>
            )}
          </button>
        </form>

        {/* Minimal Subject Filter Strip */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {["All", "Physics", "Chemistry", "Biology", "Mathematics", "CS"].map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedSubject.toLowerCase() === sub.toLowerCase()
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-zinc-400 shrink-0">
            Card {currentIndex + 1} of {filteredCards.length}
          </div>
        </div>

        {/* Minimal Flashcard Body */}
        {filteredCards.length > 0 && activeCard ? (
          <div className="space-y-3">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[260px] p-6 rounded-xl bg-[#121215] border border-zinc-800/80 hover:border-zinc-700/80 transition-all cursor-pointer flex flex-col justify-between relative select-none"
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                    {activeCard.subject}
                  </span>
                  {activeCard.category && (
                    <span className="text-[10px] text-zinc-400">
                      {activeCard.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span>{activeCard.status}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeCard.status === "mastered"
                        ? "bg-emerald-500"
                        : activeCard.status === "learning"
                        ? "bg-amber-500"
                        : "bg-zinc-600"
                    }`}
                  />
                </div>
              </div>

              {/* Card Content (Front or Back) */}
              <div className="py-6 flex flex-col items-center justify-center text-center">
                {!isFlipped ? (
                  <div className="space-y-2 max-w-lg">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                      Question
                    </span>
                    <h2 className="text-base sm:text-lg font-medium text-zinc-100 leading-snug">
                      {activeCard.front}
                    </h2>
                    <p className="text-[11px] text-zinc-400 pt-3">
                      Click to reveal answer
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-xl text-left w-full">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">
                      Answer &amp; Derivation
                    </span>
                    <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                      {activeCard.back}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                <span>{isFlipped ? "Answer Side" : "Prompt Side"}</span>
                <span>Click card or button below to flip</span>
              </div>
            </div>

            {/* FSRS Spaced Repetition Buttons */}
            {isFlipped && (
              <div className="p-3 rounded-lg bg-[#121215] border border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>FSRS Rating</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Ease {activeCard.easeFactor || 2.5}x · Interval {activeCard.intervalDays || 1}d
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFSRSRating("again");
                    }}
                    className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-medium text-zinc-200 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500/80" />
                      <span>Again</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">&lt; 1d</div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFSRSRating("hard");
                    }}
                    className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-medium text-zinc-200 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                      <span>Hard</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">1d</div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFSRSRating("good");
                    }}
                    className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-medium text-zinc-200 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
                      <span>Good</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {Math.max(2, Math.round((activeCard.intervalDays || 1) * (activeCard.easeFactor || 2.5)))}d
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFSRSRating("easy");
                    }}
                    className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-center transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-medium text-zinc-200 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                      <span>Easy</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {Math.max(4, Math.round((activeCard.intervalDays || 1) * (activeCard.easeFactor || 2.5) * 1.3))}d
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Strip */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
                >
                  {isFlipped ? "Flip to Front" : "Flip to Back"}
                </button>

                <button
                  onClick={handleDeleteActiveCard}
                  className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-[#121215] border border-zinc-800/80 text-center space-y-2">
            <BookOpen className="w-5 h-5 text-zinc-500 mx-auto" />
            <h3 className="text-xs font-medium text-zinc-300">
              No flashcards in this subject
            </h3>
            <p className="text-[11px] text-zinc-500">
              Generate cards on any topic with the AI input above or create custom cards manually.
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-xs font-medium text-zinc-200">New Flashcard</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomCard} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200"
                  >
                    <option value="Formula">Formula</option>
                    <option value="Concept">Concept</option>
                    <option value="Law">Law</option>
                    <option value="Derivation">Derivation</option>
                    <option value="Exam Pitfall">Exam Pitfall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Front (Prompt / Term)</label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. State Lenz's Law of Electromagnetic Induction"
                  className="w-full px-3 py-2 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Back (Answer / Derivation)</label>
                <textarea
                  rows={4}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. The induced current always opposes the change in magnetic flux..."
                  className="w-full px-3 py-2 text-xs rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                  required
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
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* md2anki Markdown Parser Modal */}
      {isMd2AnkiOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121215] border border-zinc-800 rounded-xl p-5 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <h3 className="text-xs font-medium text-zinc-200">md2anki Parser</h3>
              </div>
              <button
                onClick={() => setIsMd2AnkiOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste Markdown study notes. Gemini extracts key definitions and formulas directly into cards.
            </p>

            <form onSubmit={handleParseMarkdownToAnki} className="space-y-3">
              <div>
                <textarea
                  rows={8}
                  value={markdownNotes}
                  onChange={(e) => setMarkdownNotes(e.target.value)}
                  placeholder={`# Chapter 11: Thermodynamics\n- **Carnot Cycle**: Ideal reversible cycle with 4 stages.\n- **First Law**: dQ = dU + dW.\n- **Efficiency**: η = 1 - (T2/T1).`}
                  className="w-full px-3 py-2 text-xs font-mono rounded-md bg-[#09090b] border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-zinc-400 font-mono">
                  Gemini API
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMd2AnkiOpen(false)}
                    className="px-3 py-1.5 rounded-md text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isParsingMarkdown || !markdownNotes.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium border border-zinc-700 cursor-pointer disabled:opacity-50"
                  >
                    {isParsingMarkdown ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Parsing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Convert to Cards</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
