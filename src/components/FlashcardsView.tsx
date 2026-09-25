"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Shuffle,
  Loader2,
  BookOpen,
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
  const [cards, setCards] = useState<Flashcard[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("student_flashcards_deck");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_FLASHCARDS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // AI Flashcard Generation
  const [generateTopic, setGenerateTopic] = useState("Carnot Heat Engine & Thermodynamics");
  const [isGenerating, setIsGenerating] = useState(false);

  // New Card Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [newCategory, setNewCategory] = useState("Formula");
  const [newSubject, setNewSubject] = useState("Physics");

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("student_flashcards_deck", JSON.stringify(cards));
    } catch {}
  }, [cards]);

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

  const handleRateCard = (status: "learning" | "mastered" | "new") => {
    if (!activeCard) return;
    setCards((prev) =>
      prev.map((c) => (c.id === activeCard.id ? { ...c, status } : c))
    );
    handleNext();
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  };

  const handleResetProgress = () => {
    setCards((prev) => prev.map((c) => ({ ...c, status: "new" })));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Generate with OmniRoute / AI
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
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] text-slate-100 overflow-y-auto p-5 md:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h1 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Study Flashcards</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Active recall &amp; spaced repetition for STEM laws, formulas, and derivations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Card</span>
            </button>
            <button
              onClick={handleShuffle}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
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
            placeholder="Generate flashcards for any topic (e.g. Photoelectric effect, Newton's laws)..."
            className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isGenerating || !generateTopic.trim()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Generate</span>
              </>
            )}
          </button>
        </form>

        {/* Subject Filter Pills & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            {["All", "Physics", "Chemistry", "Biology", "Mathematics", "CS"].map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedSubject(sub);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  selectedSubject.toLowerCase() === sub.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>
              Mastered: <strong className="text-emerald-400">{masteredCount}</strong> / {totalCount} ({masteryPercentage}%)
            </span>
            <span>
              Learning: <strong className="text-amber-400">{learningCount}</strong>
            </span>
          </div>
        </div>

        {/* Main Flashcard Container */}
        {filteredCards.length > 0 && activeCard ? (
          <div className="space-y-4">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[280px] p-6 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between shadow-sm relative select-none"
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {activeCard.subject}
                  </span>
                  {activeCard.category && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-600/10 text-blue-400 border border-blue-500/20">
                      {activeCard.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span>
                    Card {currentIndex + 1} of {filteredCards.length}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeCard.status === "mastered"
                        ? "bg-emerald-400"
                        : activeCard.status === "learning"
                        ? "bg-amber-400"
                        : "bg-slate-500"
                    }`}
                    title={`Status: ${activeCard.status}`}
                  />
                </div>
              </div>

              {/* Card Content (Front or Back) */}
              <div className="py-6 flex flex-col items-center justify-center text-center">
                {!isFlipped ? (
                  <div className="space-y-2 max-w-lg">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Question / Concept
                    </span>
                    <h2 className="text-base sm:text-lg font-medium text-slate-100 leading-snug">
                      {activeCard.front}
                    </h2>
                    <p className="text-[11px] text-slate-500 pt-3">
                      Click to flip or reveal explanation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-w-xl text-left w-full">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                      Answer &amp; Derivation
                    </span>
                    <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {activeCard.back}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Meta Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                <span>{isFlipped ? "Showing Back" : "Showing Front"}</span>
                <span className="text-slate-400">Press Space or click to flip</span>
              </div>
            </div>

            {/* Recall Rating Buttons (When flipped) */}
            {isFlipped && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400 font-medium">
                  Rate your understanding:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateCard("new");
                    }}
                    className="px-3 py-1.5 rounded-md bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Needs Practice
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateCard("learning");
                    }}
                    className="px-3 py-1.5 rounded-md bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Reviewing
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRateCard("mastered");
                    }}
                    className="px-3 py-1.5 rounded-md bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Mastered
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Bar */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/25 text-blue-400 text-xs font-medium transition-colors cursor-pointer"
                >
                  {isFlipped ? "Flip to Front" : "Flip to Back"}
                </button>

                <button
                  onClick={handleDeleteActiveCard}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
            <BookOpen className="w-6 h-6 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">
              No flashcards in this subject
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generate cards on any topic with the AI input above or create custom cards manually.
            </p>
          </div>
        )}
      </div>

      {/* Add Custom Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-slate-800 rounded-xl p-5 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white">Create Custom Flashcard</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomCard} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
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
                <label className="text-[11px] text-slate-400 block mb-1">Front (Prompt / Term)</label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. State Lenz's Law of Electromagnetic Induction"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Back (Answer / Derivation)</label>
                <textarea
                  rows={4}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. The induced current always opposes the change in magnetic flux that produces it..."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
