"use client";

import React, { useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Award,
  BookOpen,
  ArrowRight,
  Globe,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import {
  SocraticMessage,
  QuizQuestion,
  QuizResult,
  WeakSpotRecord,
  MindMapData,
  OmniRouteConfig,
  WebSearchSource,
} from "@/types/stem";

interface EduAgentViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
}

export default function EduAgentView({ omniConfig }: EduAgentViewProps) {
  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "weakspots" | "mindmap">("tutor");
  const [customSubject, setCustomSubject] = useState("Physics");

  // Web Search Grounding toggle
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);

  // --- Socratic Tutor State ---
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Greetings! I am Edu-Agent, your Socratic AI STEM Mentor. Ask me any question, derivation, or problem from your syllabus. With Google Search enabled, I can also look up live board papers, recent scientific advances, and reference solutions.",
      timestamp: "Ready",
      guidedQuestions: [
        "Explain Carnot cycle efficiency from first principles",
        "What are the most common exam questions on this topic?",
      ],
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // --- Custom Quiz Generator State ---
  const [quizTopicInput, setQuizTopicInput] = useState("Carnot Heat Engine & Thermodynamics");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: "q1",
      question:
        "An ideal heat engine absorbs 1000 J of heat from a reservoir at 400 K and exhausts heat to a sink at 300 K. What is the efficiency?",
      options: ["20%", "25%", "33.3%", "75%"],
      correctIndex: 1,
      explanation: "η = 1 - (T2 / T1) = 1 - (300 / 400) = 0.25 = 25%.",
      sloReference: "Thermodynamics - Heat Engine Efficiency",
      difficulty: "Application",
    },
    {
      id: "q2",
      question:
        "Why is it impossible for any heat engine to achieve 100% thermal efficiency in practical operation?",
      options: [
        "Friction cannot be fully eliminated in mechanical parts",
        "100% efficiency requires the cold sink to be at 0 Kelvin (Absolute Zero), which is unattainable",
        "Gases condense into liquids at high pressures",
        "Specific heat capacity varies with volume",
      ],
      correctIndex: 1,
      explanation:
        "By η = 1 - (T2/T1), 100% requires T2 = 0 K, which violates the Third Law of Thermodynamics.",
      sloReference: "Thermodynamics - Second Law Limits",
      difficulty: "Conceptual",
    },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // --- Weak Spots State ---
  const [weakSpots, setWeakSpots] = useState<WeakSpotRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("student_weak_spots");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: "ws-1",
        subject: "Physics",
        topic: "Carnot Engine Numerical Temperature Conversion",
        chapter: "Thermodynamics",
        masteryPercentage: 55,
        status: "critical",
        lastAssessed: new Date().toISOString(),
        prescribedRemediation: [
          "Convert Celsius to Kelvin (K = °C + 273.15) before computing η = 1 - (T2/T1).",
          "Review First Law sign convention: Work done by gas is positive.",
          "Practice 3 numerical exam questions on efficiency.",
        ],
      },
    ];
  });

  // Save weak spots
  const saveWeakSpots = (spots: WeakSpotRecord[]) => {
    setWeakSpots(spots);
    try {
      localStorage.setItem("student_weak_spots", JSON.stringify(spots));
    } catch {}
  };

  // --- Mind Map State ---
  const [mindMapTopicInput, setMindMapTopicInput] = useState("Thermodynamics & Heat Engines");
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState(false);
  const [mindMap, setMindMap] = useState<MindMapData>({
    topic: "Thermodynamics & Heat Engines",
    subject: "Physics",
    nodes: [
      { id: "1", label: "Thermodynamics", category: "core", description: "Transformation of thermal energy into mechanical work" },
      { id: "2", label: "First Law: Conservation", category: "prerequisite", description: "ΔQ = ΔU + W (Energy cannot be created or destroyed)" },
      { id: "3", label: "Carnot Engine Cycle", category: "exam_focus", description: "Ideal reversible heat engine cycle" },
      { id: "4", label: "Second Law & Absolute Zero", category: "application", description: "Efficiency ceiling η = 1 - (T2/T1)" },
    ],
    links: [
      { source: "1", target: "2", relation: "Governed by" },
      { source: "2", target: "3", relation: "Applies to" },
      { source: "3", target: "4", relation: "Constrained by" },
    ],
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string>("3");

  // Socratic Chat Send
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim()) return;

    setUserInput("");
    const userMsg: SocraticMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatting(true);

    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          subject: customSubject,
          userMessage: text,
          config: {
            ...omniConfig,
            enableWebSearch: webSearchEnabled,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsChatting(false);
    }
  };

  // Generate Custom Quiz on student's topic
  const handleGenerateCustomQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopicInput.trim()) return;

    setIsGeneratingQuiz(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          subject: customSubject,
          topic: quizTopicInput,
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setQuizQuestions(data.data);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setIsQuizSubmitted(false);
        setQuizResult(null);
      }
    } catch (err) {
      console.error("Generate quiz error:", err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // Submit Quiz & Trigger Weak-Spot Diagnostic (<70% Rule)
  const handleSubmitQuiz = () => {
    let score = 0;
    const missed: any[] = [];

    quizQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen === q.correctIndex) {
        score++;
      } else {
        missed.push({
          question: q.question,
          studentAnswer: chosen !== undefined ? q.options[chosen] : "Not Answered",
          correctAnswer: q.options[q.correctIndex],
          remediationTip: q.explanation,
        });
      }
    });

    const percentage = Math.round((score / quizQuestions.length) * 100);
    const result: QuizResult = {
      quizId: `quiz-${Date.now()}`,
      subject: customSubject,
      topic: quizTopicInput,
      score,
      totalQuestions: quizQuestions.length,
      percentage,
      completedAt: new Date().toISOString(),
      missedQuestions: missed,
    };

    setQuizResult(result);
    setIsQuizSubmitted(true);

    // If score < 70%, automatically record as Weak Spot!
    if (percentage < 70) {
      const newWeakSpot: WeakSpotRecord = {
        id: `ws-${Date.now()}`,
        subject: customSubject,
        topic: `${quizTopicInput} (${percentage}% mastery)`,
        chapter: `Diagnostic on ${new Date().toLocaleDateString()}`,
        masteryPercentage: percentage,
        status: "critical",
        lastAssessed: new Date().toISOString(),
        prescribedRemediation: [
          `Review core theory of: ${missed[0]?.question.slice(0, 60) || quizTopicInput}...`,
          "Consult Socratic AI Tutor on the missed conceptual derivation.",
          "Re-take the quiz once concepts are reviewed to achieve >70% mastery.",
        ],
      };
      saveWeakSpots([newWeakSpot, ...weakSpots]);
    }
  };

  // Generate Custom Mind Map
  const handleGenerateCustomMindMap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mindMapTopicInput.trim()) return;

    setIsGeneratingMindMap(true);
    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mindmap",
          subject: customSubject,
          topic: mindMapTopicInput,
          config: omniConfig,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.nodes) {
        setMindMap(data.data);
        setSelectedNodeId(data.data.nodes[0]?.id || "1");
      }
    } catch (err) {
      console.error("Generate mindmap error:", err);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  const selectedNode = mindMap.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#060b14] text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-blue-500/20 bg-[#070e1c]/90 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-heading)]">
              Edu-Agent: Personal Student Tutor &amp; Diagnostics
            </h1>
            <p className="text-[11px] text-slate-400">
              Socratic guidance, on-demand quizzes, weak-spot recovery, and live web research
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Web Search Toggle */}
          <button
            onClick={() => setWebSearchEnabled(!webSearchEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              webSearchEnabled
                ? "bg-purple-500/20 border-purple-400/40 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                : "bg-slate-800/40 border-slate-700 text-slate-400"
            }`}
            title="Toggle Gemini Live Google Search Grounding"
          >
            <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? "text-purple-400 animate-spin" : ""}`} />
            <span>Web Search: {webSearchEnabled ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="border-b border-blue-500/20 bg-[#060b16]/70 px-6 py-2.5 flex items-center gap-3 shrink-0">
        <button
          onClick={() => setActiveTab("tutor")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "tutor"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Socratic AI Tutor</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "quiz"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Generate &amp; Take Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab("weakspots")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
            activeTab === "weakspots"
              ? "bg-red-600/80 text-white shadow-md shadow-red-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>My Weak Spots (&lt;70%)</span>
          {weakSpots.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {weakSpots.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("mindmap")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === "mindmap"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>Concept Mind Map</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: Socratic AI Tutor */}
        {activeTab === "tutor" && (
          <div className="max-w-4xl mx-auto flex flex-col h-full bg-[#070e1c]/80 rounded-2xl border border-blue-500/20 shadow-xl overflow-hidden">
            <div className="p-3.5 bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-blue-950/40 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Socratic Dialogue Mode — Guided Active Recall</span>
              </div>
              <span className="text-[10px] text-purple-300 font-mono">
                {webSearchEnabled ? "Live Google Search Enabled" : "Self-Contained"}
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none shadow-md"
                        : "bg-[#091122]/95 border border-blue-500/25 text-slate-200 rounded-bl-none shadow-md"
                    }`}
                  >
                    {/* DeepSeek Reasoning Chain-of-Thought (R1 Reasoner) */}
                    {m.reasoningContent && (
                      <div className="mb-3 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
                        <div className="flex items-center gap-1.5 font-bold text-purple-300 mb-1.5 text-xs">
                          <Brain className="w-3.5 h-3.5 text-purple-400" />
                          <span>DeepSeek Chain-of-Thought Reasoning:</span>
                        </div>
                        <div className="whitespace-pre-line font-mono text-[10px] text-purple-200/90 max-h-48 overflow-y-auto pl-2 border-l-2 border-purple-400/40 leading-relaxed">
                          {m.reasoningContent}
                        </div>
                      </div>
                    )}

                    <div className="whitespace-pre-line font-sans">{m.content}</div>

                    {/* Web Sources Chips if used */}
                    {m.webSources && m.webSources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-blue-500/20">
                        <div className="text-[10px] font-bold text-cyan-400 flex items-center gap-1 mb-1">
                          <Globe className="w-3 h-3" />
                          <span>Referenced Web Sources:</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {m.webSources.slice(0, 2).map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1"
                            >
                              <span>• {s.title}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {m.guidedQuestions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.guidedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 text-[11px] text-blue-300 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <HelpCircle className="w-3 h-3" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isChatting && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#091122]/90 border border-blue-500/20 text-xs text-blue-300 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {webSearchEnabled
                      ? "Consulting Google and reasoning Socratically..."
                      : "Edu-Agent is formulating Socratic guidance..."}
                  </span>
                </div>
              )}
            </div>

            <div className="p-3.5 border-t border-blue-500/20 bg-[#060b16]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question or request a derivation (e.g. Carnot efficiency, Organic mechanisms)..."
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#070e1c] border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="submit"
                  disabled={isChatting || !userInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Generate & Take Quiz */}
        {activeTab === "quiz" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Custom Quiz Generator Bar */}
            <form
              onSubmit={handleGenerateCustomQuiz}
              className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/30 flex items-center gap-3 shadow-lg"
            >
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Generate Quiz On Any Topic / Chapter
                </label>
                <input
                  type="text"
                  value={quizTopicInput}
                  onChange={(e) => setQuizTopicInput(e.target.value)}
                  placeholder="Enter topic: e.g. Quantum Physics, Organic Reactions, Calculus, Python Trees..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                disabled={isGeneratingQuiz || !quizTopicInput.trim()}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isGeneratingQuiz ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </form>

            {/* Quiz Flow */}
            {!isQuizSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#070e1c] border border-blue-500/30 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300">
                      Topic: {quizTopicInput}
                    </span>
                    <h2 className="text-sm font-bold text-white mt-1.5">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    {quizQuestions[currentQuestionIndex]?.difficulty}
                  </span>
                </div>

                <div className="text-sm text-slate-100 font-semibold leading-relaxed">
                  {quizQuestions[currentQuestionIndex]?.question}
                </div>

                <div className="space-y-2.5">
                  {quizQuestions[currentQuestionIndex]?.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [currentQuestionIndex]: oIdx,
                          }))
                        }
                        className={`w-full p-3.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-600/30 border-cyan-400 text-white shadow-md shadow-blue-500/10"
                            : "bg-[#091122]/80 border-blue-500/20 text-slate-300 hover:border-blue-400/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? "bg-cyan-500 text-slate-950"
                                : "bg-blue-950/60 text-slate-400"
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-blue-500/20">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((p) => p - 1)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((p) => p + 1)}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      Submit &amp; Score Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Results Screen
              <div className="p-6 rounded-2xl bg-[#070e1c] border border-blue-500/30 shadow-xl space-y-6">
                <div className="text-center space-y-2">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      quizResult!.percentage >= 70
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white">Quiz Evaluation</h3>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">
                    {quizResult?.score} / {quizResult?.totalQuestions} ({quizResult?.percentage}%)
                  </div>
                  <p className="text-xs text-slate-300">
                    {quizResult!.percentage >= 70
                      ? "Great job! You achieved above the 70% mastery threshold."
                      : "Mastery below 70%! Edu-Agent has recorded this topic into your Weak-Spot Recovery list."}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsQuizSubmitted(false);
                      setCurrentQuestionIndex(0);
                      setSelectedAnswers({});
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  {quizResult!.percentage < 70 && (
                    <button
                      onClick={() => setActiveTab("weakspots")}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold cursor-pointer"
                    >
                      <span>View Remedial Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: My Weak Spots (<70% Rule) */}
        {activeTab === "weakspots" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-[#070e1c] to-amber-950/30 border border-red-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The &lt;70% Mastery Diagnostic Standard</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Any quiz scoring below 70% automatically logs here with a personalized 3-step remediation prescription.
                </p>
              </div>
              <span className="text-xs font-bold text-red-300 font-mono px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                {weakSpots.length} Critical Areas
              </span>
            </div>

            {weakSpots.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#070e1c] border border-blue-500/20 text-slate-400 text-xs">
                No weak spots logged! Take a quiz in the &quot;Generate &amp; Take Quiz&quot; tab to test your mastery.
              </div>
            ) : (
              <div className="space-y-4">
                {weakSpots.map((ws) => (
                  <div
                    key={ws.id}
                    className="p-5 rounded-2xl bg-[#070e1c] border border-red-500/30 shadow-lg space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                        {ws.masteryPercentage}% Mastery
                      </span>
                      <button
                        onClick={() => saveWeakSpots(weakSpots.filter((s) => s.id !== ws.id))}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity p-1"
                        title="Dismiss weak spot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-white">{ws.topic}</h4>

                    <div className="p-3.5 rounded-xl bg-[#060b14] border border-blue-500/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-2">
                        Prescribed 3-Step Remedial Action Plan
                      </span>
                      <ul className="space-y-2">
                        {ws.prescribedRemediation.map((rem, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                            <span>{rem}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setActiveTab("tutor");
                          handleSendMessage(
                            `Help me resolve my weak spot in: ${ws.topic}. What are the primary stumbling blocks?`
                          );
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer transition-all"
                      >
                        Launch Socratic Coaching on this Topic
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Concept Mind Map */}
        {activeTab === "mindmap" && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Custom Mind Map Generator */}
            <form
              onSubmit={handleGenerateCustomMindMap}
              className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/30 flex items-center gap-3 shadow-lg"
            >
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Generate Prerequisite Knowledge Graph On Any Topic
                </label>
                <input
                  type="text"
                  value={mindMapTopicInput}
                  onChange={(e) => setMindMapTopicInput(e.target.value)}
                  placeholder="Enter topic: e.g. Quantum Computing, Thermodynamics, Cell Division, Calculus..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#060b14] border border-blue-500/30 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <button
                type="submit"
                disabled={isGeneratingMindMap || !mindMapTopicInput.trim()}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isGeneratingMindMap ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mapping...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    <span>Build Graph</span>
                  </>
                )}
              </button>
            </form>

            {/* Mind Map Nodes Grid */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#091122] to-[#060b14] border border-blue-500/25 shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mindMap.nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20 scale-[1.02]"
                          : "bg-[#070e1c]/80 border-blue-500/20 text-slate-300 hover:border-blue-400/30"
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 block w-fit mb-2">
                        {node.category.replace("_", " ")}
                      </span>
                      <div className="text-xs font-bold mb-1">{node.label}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {node.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedNode && (
                <div className="mt-6 p-4 rounded-xl bg-[#060b14] border border-purple-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-300">
                      Node Details: {selectedNode.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Category: {selectedNode.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {selectedNode.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-blue-500/15">
                    <div className="text-[10px] text-slate-400">
                      Prerequisite Connections:{" "}
                      {mindMap.links
                        .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                        .map((l) => `${l.relation} Node #${l.source === selectedNode.id ? l.target : l.source}`)
                        .join(" • ") || "Primary Concept Root"}
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("tutor");
                        handleSendMessage(
                          `Explain the concept '${selectedNode.label}' and how it connects to the broader topic.`
                        );
                      }}
                      className="px-3 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-400/30 text-xs font-semibold cursor-pointer transition-all"
                    >
                      Inquire with Tutor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
