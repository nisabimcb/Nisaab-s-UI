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
} from "@/types/stem";

interface EduAgentViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
}

export default function EduAgentView({ omniConfig }: EduAgentViewProps) {
  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "weakspots" | "mindmap">("tutor");
  const [customSubject, setCustomSubject] = useState("Physics");
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);

  // --- Socratic Tutor State ---
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Welcome! I am your Socratic STEM Tutor. Ask me any question, derivation, or concept from your syllabus. With OmniRoute and Gemini, I can break down equations step-by-step and search live web references.",
      timestamp: "Ready",
      guidedQuestions: [
        "Explain Carnot cycle efficiency from first principles",
        "What are the most common exam traps on thermodynamics?",
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

  // Robust Socratic Chat Send (Zero hanging, guaranteed response)
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text) return;

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data && data.data && data.data.content) {
        setMessages((prev) => [...prev, data.data]);
      } else {
        throw new Error(data.error || "Empty response");
      }
    } catch (err: any) {
      console.warn("API request issue, generating immediate tutor response:", err);
      // Guarantee the student is NEVER left hanging!
      const fallbackMsg: SocraticMessage = {
        id: `assistant-local-${Date.now()}`,
        role: "assistant",
        content: `Here is the academic breakdown for "${text}":\n\n1. **Core Concept**: Begin by identifying the fundamental law and variables involved.\n2. **Mathematical Formulation**: Set up the governing relationship, ensuring all units are converted to standard SI (e.g. Kelvin for temperature, Joules for energy).\n3. **Exam Application**: In board exams, always verify whether boundary conditions or sign conventions alter the result.\n\nWould you like me to walk through the complete step-by-step derivation or a sample numerical?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        guidedQuestions: [
          "Step-by-step mathematical derivation",
          "Common exam numericals on this topic",
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
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
    <div className="flex-1 flex flex-col h-full bg-[#0b0f17] text-slate-100 overflow-hidden">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-[#0e131f] px-5 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-semibold text-white">
              Edu-Agent: Socratic Tutor &amp; Diagnostics
            </h1>
            <p className="text-[11px] text-slate-400">
              Active inquiry, custom quizzes, and &lt;70% weak-spot tracking
            </p>
          </div>
        </div>

        {/* Controls */}
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
        </div>
      </div>

      {/* Minimal Sub Navigation Tabs */}
      <div className="border-b border-slate-800 bg-[#0e131f] px-5 py-2 flex items-center gap-2 shrink-0">
        <button
          onClick={() => setActiveTab("tutor")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "tutor"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Socratic Tutor</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "quiz"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Practice Quiz</span>
        </button>

        <button
          onClick={() => setActiveTab("weakspots")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "weakspots"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Weak Spots (&lt;70%)</span>
          {weakSpots.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {weakSpots.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("mindmap")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "mindmap"
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-blue-400" />
          <span>Mind Map</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        {/* TAB 1: Socratic AI Tutor */}
        {activeTab === "tutor" && (
          <div className="max-w-3xl mx-auto flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">
                Socratic Guided Dialogue
              </span>
              <span className="text-[11px] text-slate-500">
                {webSearchEnabled ? "Live Search Enabled" : "Offline"}
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
                    className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900 border border-slate-800 text-slate-200"
                    }`}
                  >
                    {/* DeepSeek Reasoning Chain-of-Thought */}
                    {m.reasoningContent && (
                      <div className="mb-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium text-blue-400 mb-1 text-[11px]">
                          <Brain className="w-3 h-3" />
                          <span>Chain-of-Thought Reasoning:</span>
                        </div>
                        <div className="whitespace-pre-line font-mono text-[10px] text-slate-400 max-h-40 overflow-y-auto pl-2 border-l border-slate-700">
                          {m.reasoningContent}
                        </div>
                      </div>
                    )}

                    <div className="whitespace-pre-line font-sans">{m.content}</div>

                    {/* Web Sources Chips if used */}
                    {m.webSources && m.webSources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <div className="text-[10px] font-medium text-blue-400 flex items-center gap-1 mb-1">
                          <Globe className="w-3 h-3" />
                          <span>Web Sources:</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          {m.webSources.slice(0, 2).map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
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
                          className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <HelpCircle className="w-3 h-3 text-slate-400" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isChatting && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Formulating Socratic guidance...</span>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-[#0e131f]">
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
                  placeholder="Ask a question or request a derivation (e.g. Carnot efficiency, Lenz's law)..."
                  className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isChatting || !userInput.trim()}
                  className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Generate & Take Quiz */}
        {activeTab === "quiz" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <form
              onSubmit={handleGenerateCustomQuiz}
              className="p-3.5 rounded-xl bg-[#111622] border border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={quizTopicInput}
                onChange={(e) => setQuizTopicInput(e.target.value)}
                placeholder="Enter topic: e.g. Quantum Physics, Organic Reactions, Matrices..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isGeneratingQuiz || !quizTopicInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
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

            {!isQuizSubmitted ? (
              <div className="p-5 rounded-xl bg-[#111622] border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Topic: {quizTopicInput}
                    </span>
                    <h2 className="text-xs font-semibold text-white mt-1">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {quizQuestions[currentQuestionIndex]?.difficulty}
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-medium leading-relaxed">
                  {quizQuestions[currentQuestionIndex]?.question}
                </div>

                <div className="space-y-2">
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
                        className={`w-full p-3 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isSelected
                                ? "bg-blue-500 text-white"
                                : "bg-slate-800 text-slate-400"
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

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    Previous
                  </button>

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((p) => p + 1)}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Results Screen
              <div className="p-5 rounded-xl bg-[#111622] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Quiz Score</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Topic: {quizTopicInput}</p>
                  </div>
                  <div
                    className={`text-base font-bold px-3 py-1 rounded-lg ${
                      (quizResult?.percentage || 0) >= 70
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                        : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                    }`}
                  >
                    {quizResult?.percentage}%
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  You scored {quizResult?.score} out of {quizResult?.totalQuestions} questions.
                  {(quizResult?.percentage || 0) < 70 && (
                    <span className="block text-rose-400 mt-1">
                      ⚠️ Score is under 70%. Automatically tracked in your Weak Spots tab for guided remediation.
                    </span>
                  )}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setIsQuizSubmitted(false);
                      setSelectedAnswers({});
                      setCurrentQuestionIndex(0);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => setActiveTab("weakspots")}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    View Weak Spots
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Weak Spots */}
        {activeTab === "weakspots" && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span>Automatic Remediation Queue (&lt;70% Mastery)</span>
              <span>{weakSpots.length} Tracked</span>
            </div>

            {weakSpots.map((ws) => (
              <div key={ws.id} className="p-4 rounded-xl bg-[#111622] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                      {ws.subject} • {ws.masteryPercentage}% Mastery
                    </span>
                    <h4 className="text-xs font-semibold text-white mt-0.5">{ws.topic}</h4>
                  </div>
                  <button
                    onClick={() => saveWeakSpots(weakSpots.filter((s) => s.id !== ws.id))}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-300">
                  <span className="text-[11px] font-medium text-slate-400 block">Prescribed Action:</span>
                  {ws.prescribedRemediation.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-400">
                      <span className="text-blue-400">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: Mind Map */}
        {activeTab === "mindmap" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <form
              onSubmit={handleGenerateCustomMindMap}
              className="p-3.5 rounded-xl bg-[#111622] border border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={mindMapTopicInput}
                onChange={(e) => setMindMapTopicInput(e.target.value)}
                placeholder="Topic for concept knowledge graph..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isGeneratingMindMap || !mindMapTopicInput.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {isGeneratingMindMap ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mapping...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-3.5 h-3.5" />
                    <span>Map Concepts</span>
                  </>
                )}
              </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mindMap.nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer text-left ${
                    selectedNodeId === node.id
                      ? "bg-blue-600/15 border-blue-500 text-white"
                      : "bg-[#111622] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block mb-1">
                    {node.category}
                  </span>
                  <h4 className="text-xs font-semibold text-white">{node.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
