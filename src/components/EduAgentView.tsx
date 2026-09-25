"use client";

import React, { useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  HelpCircle,
  RefreshCw,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Atom,
  FlaskConical,
  Binary,
  Dna,
  Sigma,
} from "lucide-react";
import {
  StemSubject,
  SocraticMessage,
  QuizQuestion,
  QuizResult,
  WeakSpotRecord,
  MindMapData,
  OmniRouteConfig,
} from "@/types/stem";
import {
  STEM_SUBJECTS,
  PRELOADED_QUIZZES,
  INITIAL_WEAK_SPOTS,
  PRELOADED_MINDMAPS,
} from "@/lib/fbise-curriculum";

interface EduAgentViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
}

export default function EduAgentView({ omniConfig }: EduAgentViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<StemSubject>("physics");
  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "weakspots" | "mindmap">("tutor");

  // --- Socratic Tutor State ---
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Greetings! I am Edu-Agent, your Socratic AI STEM Mentor for FBISE HSSC. Rather than just giving answers, I will help you reason through derivations and conceptual board problems from first principles. What topic shall we explore today?",
      timestamp: "10:00 AM",
      guidedQuestions: [
        "Why is Carnot efficiency independent of the working fluid?",
        "How do isothermal and adiabatic P-V curve slopes compare?",
      ],
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // --- SLO Quiz State ---
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    PRELOADED_QUIZZES.physics
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // --- Weak Spots State ---
  const [weakSpots, setWeakSpots] = useState<WeakSpotRecord[]>(INITIAL_WEAK_SPOTS);

  // --- Mind Map State ---
  const [mindMap, setMindMap] = useState<MindMapData>(PRELOADED_MINDMAPS.physics);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("5");

  // Handle Subject Change
  const handleSubjectChange = (sub: StemSubject) => {
    setSelectedSubject(sub);
    setQuizQuestions(PRELOADED_QUIZZES[sub] || PRELOADED_QUIZZES.physics);
    setMindMap(PRELOADED_MINDMAPS[sub] || PRELOADED_MINDMAPS.physics);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsQuizSubmitted(false);
    setQuizResult(null);
  };

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
          subject: selectedSubject,
          userMessage: text,
          config: omniConfig,
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

  // Submit Quiz & Evaluate Weak Spots (<70% Rule)
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
      subject: selectedSubject,
      topic: `${selectedSubject.toUpperCase()} Assessment`,
      score,
      totalQuestions: quizQuestions.length,
      percentage,
      completedAt: new Date().toISOString(),
      missedQuestions: missed,
    };

    setQuizResult(result);
    setIsQuizSubmitted(true);

    // If score < 70%, trigger Weak-Spot Diagnostic automatically!
    if (percentage < 70) {
      const newWeakSpot: WeakSpotRecord = {
        id: `ws-${Date.now()}`,
        subject: selectedSubject,
        topic: `${selectedSubject.toUpperCase()} Mastery Gap (${percentage}%)`,
        chapter: `Chapter Evaluation`,
        masteryPercentage: percentage,
        status: "critical",
        lastAssessed: new Date().toISOString(),
        prescribedRemediation: [
          `Targeted SLO Review: Strengthen comprehension of ${missed[0]?.question.slice(0, 50)}...`,
          "Review textbook derivations and re-take conceptual quiz after 24 hours.",
          "Consult Socratic AI Tutor on identified misconceptions.",
        ],
      };
      setWeakSpots((prev) => [newWeakSpot, ...prev]);
    }
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
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide font-[family-name:var(--font-heading)]">
                Edu-Agent: Adaptive Socratic STEM Tutor
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                LangGraph Inspired
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Socratic learning agent, &lt;70% weak-spot diagnostic engine & mind maps
            </p>
          </div>
        </div>

        {/* Subject Switcher */}
        <div className="flex items-center gap-1.5 bg-[#060b16] p-1 rounded-xl border border-blue-500/20">
          {STEM_SUBJECTS.map((sub) => {
            const isSelected = selectedSubject === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubjectChange(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "text-slate-400 hover:text-white hover:bg-purple-600/10"
                }`}
              >
                {getSubjectIcon(sub.id)}
                <span>{sub.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Sub-Navigation */}
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
          <span>SLO Quiz Engine</span>
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
          <span>Weak-Spot Diagnostic (&lt;70%)</span>
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

      {/* Main Tab Views */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* TAB 1: Socratic AI Tutor */}
        {activeTab === "tutor" && (
          <div className="max-w-4xl mx-auto flex flex-col h-full bg-[#070e1c]/80 rounded-2xl border border-blue-500/20 shadow-xl overflow-hidden">
            {/* Socratic Banner */}
            <div className="p-3.5 bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-blue-950/40 border-b border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-blue-200">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Active Mode: Socratic Guiding Dialogue (Self-Discovered Mastery)</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                FBISE {selectedSubject.toUpperCase()}
              </span>
            </div>

            {/* Chat Flow */}
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
                        ? "bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20"
                        : "bg-[#091122]/95 border border-blue-500/25 text-slate-200 rounded-bl-none shadow-md"
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{m.content}</div>

                    {/* Citations */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-blue-500/20 text-[10px]">
                        <span className="font-bold text-cyan-400">Curriculum Grounding: </span>
                        <span className="text-slate-300">{m.citations[0].sourceTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Guided Follow-Up Chips */}
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
                  <span>Edu-Agent is formulating Socratic guidance...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
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
                  placeholder={`Ask a question in FBISE ${selectedSubject} (e.g. Carnot efficiency derivation)...`}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-[#070e1c] border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={isChatting || !userInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: SLO Quiz Engine */}
        {activeTab === "quiz" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {!isQuizSubmitted ? (
              <div className="p-6 rounded-2xl bg-[#070e1c] border border-blue-500/30 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-blue-500/20 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      FBISE SLO Assessment
                    </span>
                    <h2 className="text-sm font-bold text-white mt-1.5">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-purple-400 font-mono">
                    Difficulty: {quizQuestions[currentQuestionIndex]?.difficulty}
                  </span>
                </div>

                {/* Question */}
                <div className="text-sm text-slate-100 font-semibold leading-relaxed">
                  {quizQuestions[currentQuestionIndex]?.question}
                </div>

                {/* Options */}
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
                            ? "bg-blue-600/30 border-blue-400 text-white shadow-md shadow-blue-500/10"
                            : "bg-[#091122]/80 border-blue-500/20 text-slate-300 hover:border-blue-400/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected
                                ? "bg-blue-500 text-white"
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

                {/* SLO Tag */}
                <div className="p-2.5 rounded-xl bg-[#060b14] border border-blue-500/15 text-[11px] text-slate-400">
                  <span className="text-blue-400 font-bold">SLO Standard: </span>
                  {quizQuestions[currentQuestionIndex]?.sloReference}
                </div>

                {/* Navigation Buttons */}
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
                      Submit & Score Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Quiz Results View
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
                  <h3 className="text-base font-bold text-white">Assessment Complete</h3>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400">
                    {quizResult?.score} / {quizResult?.totalQuestions} ({quizResult?.percentage}%)
                  </div>
                  <p className="text-xs text-slate-400">
                    {quizResult!.percentage >= 70
                      ? "Mastery threshold achieved! Great job retaining core FBISE competencies."
                      : "Mastery below 70%! Edu-Agent has recorded this topic as a High-Priority Weak Spot."}
                  </p>
                </div>

                {/* Retake or Switch */}
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
                      <span>View Remedial Prescription</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Weak-Spot Diagnostic (<70% Mastery Rule) */}
        {activeTab === "weakspots" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-[#070e1c] to-amber-950/30 border border-red-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>The &lt;70% Mastery Diagnostic Standard</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Edu-Agent continuously monitors assessment accuracy. Any chapter falling below 70% automatically triggers targeted remedial micro-plans.
                </p>
              </div>
              <span className="text-xs font-bold text-red-300 font-mono px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                {weakSpots.length} Critical Areas
              </span>
            </div>

            <div className="space-y-4">
              {weakSpots.map((ws) => (
                <div
                  key={ws.id}
                  className="p-5 rounded-2xl bg-[#070e1c] border border-red-500/30 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                      {ws.status} gap ({ws.masteryPercentage}% mastery)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Last Assessed: {new Date(ws.lastAssessed).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{ws.topic}</h4>
                    <p className="text-xs text-slate-400">{ws.chapter}</p>
                  </div>

                  {/* Prescribed Remediation */}
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

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveTab("tutor");
                        handleSendMessage(
                          `Help me resolve my weak spot in ${ws.topic}. Where do students usually get confused?`
                        );
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold cursor-pointer transition-all"
                    >
                      Start Socratic Coaching on this Topic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Concept Mind Map */}
        {activeTab === "mindmap" && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="p-4 rounded-xl bg-[#070e1c] border border-blue-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-purple-300 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Interactive Concept Knowledge Graph</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visual prerequisite map for FBISE {selectedSubject.toUpperCase()}: {mindMap.topic}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Click any node to inspect curriculum connections
              </span>
            </div>

            {/* Mind Map Canvas / Node Grid */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#091122] to-[#060b14] border border-blue-500/25 shadow-xl">
              <div className="grid grid-cols-3 gap-4">
                {mindMap.nodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  const isExamFocus = node.category === "exam_focus";
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-600/30 border-purple-400 text-white shadow-lg shadow-purple-500/20 scale-[1.02]"
                          : isExamFocus
                          ? "bg-blue-600/20 border-cyan-400/50 text-slate-200 hover:border-cyan-300"
                          : "bg-[#070e1c]/80 border-blue-500/20 text-slate-300 hover:border-blue-400/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isExamFocus
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                              : "bg-blue-500/15 text-blue-300"
                          }`}
                        >
                          {node.category.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: #{node.id}
                        </span>
                      </div>
                      <div className="text-xs font-bold mb-1">{node.label}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {node.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inspector Drawer */}
              {selectedNode && (
                <div className="mt-6 p-4 rounded-xl bg-[#060b14] border border-purple-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-300">
                      Concept Node Inspector: {selectedNode.label}
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
                      Connected to:{" "}
                      {mindMap.links
                        .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                        .map((l) => `Node #${l.source === selectedNode.id ? l.target : l.source} (${l.relation})`)
                        .join(" • ") || "Primary Root"}
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("tutor");
                        handleSendMessage(
                          `Explain the concept node '${selectedNode.label}' and its FBISE exam applications.`
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
