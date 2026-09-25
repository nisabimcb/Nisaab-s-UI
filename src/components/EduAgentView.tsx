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
  Globe,
  ExternalLink,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  SocraticMessage,
  QuizQuestion,
  QuizResult,
  WeakSpotRecord,
  MindMapData,
  OmniRouteConfig,
  Flashcard,
} from "@/types/stem";

interface EduAgentViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
  onNavigate?: (view: string) => void;
}

export default function EduAgentView({ omniConfig, onNavigate }: EduAgentViewProps) {
  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "weakspots" | "mindmap">("tutor");
  const [customSubject, setCustomSubject] = useState("Physics");
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);

  // --- Socratic Tutor Messages ---
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Welcome! I am your Socratic AI STEM Tutor & App Controller.\n\nI can answer questions, guide derivations, or directly control your workspace:\n• Ask me: \"Make 5 flashcards on Carnot cycle\"\n• Ask me: \"Generate a quiz on thermodynamics\"\n• Ask me: \"Create a mind map on electromagnetic induction\"\n• Ask any out-of-the-box STEM question (Google Gemini will search the live web automatically).",
      timestamp: "Ready",
      guidedQuestions: [
        "Make 5 flashcards on Carnot cycle",
        "Generate a quiz on thermodynamics",
        "Explain Carnot efficiency from first principles",
      ],
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // Interactive inline flashcard carousel state for chat messages
  const [inlineCardIndices, setInlineCardIndices] = useState<Record<string, number>>({});
  const [inlineCardFlipped, setInlineCardFlipped] = useState<Record<string, boolean>>({});

  // Interactive inline quiz state for chat messages
  const [inlineQuizAnswers, setInlineQuizAnswers] = useState<Record<string, Record<number, number>>>({});
  const [inlineQuizSubmitted, setInlineQuizSubmitted] = useState<Record<string, boolean>>({});

  // --- Quiz Tab State ---
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

  // Initial default diagnostic record
  const DEFAULT_WEAK_SPOTS: WeakSpotRecord[] = [
    {
      id: "ws-1",
      subject: "Physics",
      topic: "Carnot Engine Numerical Temperature Conversion",
      chapter: "Thermodynamics",
      masteryPercentage: 55,
      status: "critical",
      lastAssessed: "2026-09-25T00:00:00.000Z",
      prescribedRemediation: [
        "Convert Celsius to Kelvin (K = °C + 273.15) before computing η = 1 - (T2/T1).",
        "Review First Law sign convention: Work done by gas is positive.",
        "Practice 3 numerical exam questions on efficiency.",
      ],
    },
  ];

  const [weakSpots, setWeakSpots] = useState<WeakSpotRecord[]>(DEFAULT_WEAK_SPOTS);

  // Load weak spots on client mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("student_weak_spots");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWeakSpots(parsed);
        }
      }
    } catch {}
  }, []);

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

  // Save flashcards directly to persistent deck
  const saveGeneratedFlashcardsToDeck = (newCards: Flashcard[]) => {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("student_flashcards_deck");
      const currentCards: Flashcard[] = existing ? JSON.parse(existing) : [];
      const updated = [...newCards, ...currentCards];
      localStorage.setItem("student_flashcards_deck", JSON.stringify(updated));
    } catch (e) {
      console.error("Save flashcards error:", e);
    }
  };

  // Save note directly to persistent notes
  const saveNoteToNotebook = (title: string, content: string) => {
    if (typeof window === "undefined") return;
    try {
      const existing = localStorage.getItem("student_notebook_docs");
      const currentNotes = existing ? JSON.parse(existing) : [];
      const newNote = {
        id: `doc-${Date.now()}`,
        subject: customSubject,
        title,
        chapter: "Tutor Saved Material",
        content,
        sourceType: "notes",
        uploadedAt: new Date().toISOString(),
      };
      localStorage.setItem("student_notebook_docs", JSON.stringify([newNote, ...currentNotes]));
    } catch (e) {
      console.error("Save note error:", e);
    }
  };

  // --- AGENTIC CHAT DISPATCHER ---
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || userInput).trim();
    if (!rawText) return;

    setUserInput("");
    const userMsg: SocraticMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatting(true);

    const lower = rawText.toLowerCase();

    // 0. Direct Workspace Navigation & Control Commands
    if (lower === "open flashcards" || lower === "go to flashcards" || lower === "flashcards studio" || lower === "/flashcards") {
      if (onNavigate) onNavigate("flashcards");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Navigating to Flashcards Studio. You can review your active recall cards and test spaced-repetition ratings.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    if (lower === "open notebook" || lower === "go to notebook" || lower === "my notes" || lower === "open notes") {
      if (onNavigate) onNavigate("notebook");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Navigating to My Notebooks. Your uploaded documents and notes are ready.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    if (lower === "open settings" || lower === "go to settings" || lower === "configure omniroute") {
      if (onNavigate) onNavigate("settings");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Opening Settings. You can test your OmniRoute Gateway connection or update API keys.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    if (lower === "start quiz" || lower === "take quiz" || lower === "practice quiz") {
      setActiveTab("quiz");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to Practice Quiz mode! Select your answers for each question and submit for instant diagnostic scoring.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    if (lower === "show mind map" || lower === "open mind map" || lower === "view mind map") {
      setActiveTab("mindmap");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to Mind Map view! You can explore the interconnected concept graph.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    if (lower === "clear chat" || lower === "reset tutor" || lower === "reset session") {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: "assistant",
          content:
            "Chat session refreshed. I am your Socratic AI STEM Tutor & App Controller.\n\nAsk me to:\n• \"Make 5 flashcards on ...\"\n• \"Generate a quiz on ...\"\n• \"Create a mind map on ...\"\n• Or ask any out-of-the-box STEM question (Google Gemini will search the live web automatically).",
          timestamp: "Ready",
          guidedQuestions: [
            "Make 5 flashcards on Carnot cycle",
            "Generate a quiz on thermodynamics",
            "Check my weak spots",
          ],
        },
      ]);
      setIsChatting(false);
      return;
    }

    // 1. Detect WEAK SPOTS intent
    const isWeakSpotsIntent =
      lower.includes("weak spot") ||
      lower.includes("weak area") ||
      lower.includes("diagnostic") ||
      lower.includes("my score") ||
      lower.includes("my performance");

    if (isWeakSpotsIntent) {
      if (weakSpots.length === 0) {
        const msg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: "Great news! You currently have no identified weak spots (<70% mastery). Keep taking practice quizzes to benchmark your understanding.",
          actionType: "weakspots",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            "Generate a quiz on thermodynamics",
            "Make flashcards on Carnot cycle",
          ],
        };
        setMessages((prev) => [...prev, msg]);
        setIsChatting(false);
        return;
      }

      const summaryList = weakSpots
        .map(
          (ws, i) =>
            `${i + 1}. **${ws.topic}** (Mastery: ${ws.masteryPercentage}%)\n` +
            `   • Status: ${ws.status.toUpperCase()}\n` +
            `   • Remediation: ${ws.prescribedRemediation[0] || "Review core concept"}`
        )
        .join("\n\n");

      const assistantMsg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: `Here are your current academic diagnostic weak spots (<70% mastery rule):\n\n${summaryList}\n\nWould you like me to generate a practice quiz or flashcards to remediate any of these?`,
        actionType: "weakspots",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        guidedQuestions: [
          `Generate a quiz on ${weakSpots[0]?.topic || "Weak Concepts"}`,
          `Make flashcards on ${weakSpots[0]?.topic || "Weak Concepts"}`,
        ],
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsChatting(false);
      return;
    }

    // 2. Detect FLASHCARDS intent
    const isFlashcardsIntent =
      lower.includes("flashcard") ||
      lower.startsWith("/flashcard") ||
      /(?:make|create|generate|give me|build)\s*(?:\d+)?\s*flashcard/i.test(lower);

    // 3. Detect QUIZ intent
    const isQuizIntent =
      (lower.includes("quiz") && !lower.includes("view quiz")) ||
      lower.startsWith("/quiz") ||
      /(?:make|create|generate|take|give me|quiz me on)\s*(?:a\s*)?quiz/i.test(lower);

    // 4. Detect MIND MAP intent
    const isMindMapIntent =
      lower.includes("mind map") ||
      lower.includes("mindmap") ||
      lower.includes("concept map");

    // 5. Detect NOTE intent
    const isNoteIntent =
      lower.startsWith("add note:") ||
      lower.startsWith("save note:") ||
      /(?:add|create|save)\s*(?:a\s*)?(?:study\s*)?note/i.test(lower);

    try {
      if (isFlashcardsIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of)\s+([^.?!,]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : rawText.replace(/flashcards?/gi, "").trim() || "STEM Concept";

        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "flashcards",
            subject: customSubject,
            topic,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const flashcards: Flashcard[] = data.success && Array.isArray(data.data) ? data.data : [];

        if (flashcards.length > 0) {
          saveGeneratedFlashcardsToDeck(flashcards);
        }

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `I've generated ${flashcards.length || 5} study flashcards for "${topic}" using OmniRoute models and saved them to your deck. You can review them below or open the full Flashcards Studio.`,
          actionType: "flashcards",
          flashcardsPayload: flashcards,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Generate a quiz on ${topic}`,
            `Explain the primary derivation of ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      if (isQuizIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of)\s+([^.?!,]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : rawText.replace(/quiz/gi, "").trim() || "STEM Topic";

        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "quiz",
            subject: customSubject,
            topic,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const questions: QuizQuestion[] = data.success && Array.isArray(data.data) ? data.data : [];

        if (questions.length > 0) {
          setQuizQuestions(questions);
          setQuizTopicInput(topic);
        }

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `I've generated a 5-question practice quiz on "${topic}" using OmniRoute models. Test your knowledge below or switch to Practice Quiz Mode for a full diagnostic assessment.`,
          actionType: "quiz",
          quizPayload: questions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Make flashcards on ${topic}`,
            "Show detailed derivation",
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      if (isMindMapIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of)\s+([^.?!,]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : "STEM Knowledge Graph";

        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "mindmap",
            subject: customSubject,
            topic,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.nodes) {
          setMindMap(data.data);
          setMindMapTopicInput(topic);
        }

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `Concept Knowledge Graph created for "${topic}" using OmniRoute. Found ${data.data?.nodes?.length || 4} interconnected concept nodes connecting prerequisites to board numericals.`,
          actionType: "mindmap",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Make flashcards on ${topic}`,
            `Generate a quiz on ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      if (isNoteIntent) {
        const noteContent = rawText.replace(/^(?:add|save|create)\s*(?:a\s*)?(?:study\s*)?note(?::|\s+about|\s+on)?/i, "").trim();
        saveNoteToNotebook("Tutor Study Note", noteContent || rawText);

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `✓ Saved study note to your personal notebook studio: "${noteContent.slice(0, 60)}..."`,
          actionType: "note_created",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // 6. Socratic Chat & Out-of-the-Box Inquiries (Auto-Routed to Gemini with Google Search Grounding)
      let noteContext = "";
      try {
        const saved = localStorage.getItem("student_notebook_docs");
        if (saved) {
          const docs = JSON.parse(saved);
          if (Array.isArray(docs) && docs.length > 0) {
            const matching =
              docs.find(
                (d: any) =>
                  rawText.toLowerCase().includes(d.title?.toLowerCase() || "") ||
                  d.subject?.toLowerCase() === customSubject.toLowerCase()
              ) || docs[0];
            if (matching) {
              noteContext = `Note Title: ${matching.title}\nChapter: ${matching.chapter || "Study Material"}\nContent:\n${matching.content}`;
            }
          }
        }
      } catch {}

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          subject: customSubject,
          userMessage: rawText,
          context: noteContext,
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
      console.warn("Tutor dispatch fallback:", err);
      const fallbackMsg: SocraticMessage = {
        id: `assistant-local-${Date.now()}`,
        role: "assistant",
        content: `Regarding "${rawText}":\n\n1. **Core Concept**: Break the problem down into fundamental physical principles and governing equations.\n2. **Mathematical Formulation**: State boundary conditions and verify standard SI units.\n3. **Application**: Check sign conventions and common board exam pitfalls.\n\nWould you like me to make flashcards or a quiz on this topic?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        guidedQuestions: [
          `Make flashcards on this topic`,
          `Generate a quiz on this topic`,
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatting(false);
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
              Edu-Agent: AI Tutor &amp; Workspace Controller
            </h1>
            <p className="text-[11px] text-slate-400">
              Conversational app control, instant flashcards, quizzes, and Gemini web research
            </p>
          </div>
        </div>

        {/* Search Grounding status */}
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

      {/* Sub Navigation Tabs */}
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
          <span>Socratic Chat</span>
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
        {/* TAB 1: Socratic AI Tutor with App Actions */}
        {activeTab === "tutor" && (
          <div className="max-w-3xl mx-auto flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium text-slate-300">
                AI Tutor &amp; Workspace Controller
              </span>
              <span className="text-[11px] text-slate-500">
                OmniRoute: Quizzes &amp; Flashcards • Gemini: Live Search
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const cardIndex = inlineCardIndices[m.id] || 0;
                const isCardFlipped = inlineCardFlipped[m.id] || false;
                const activeCard = m.flashcardsPayload?.[cardIndex];

                return (
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

                      {/* INLINE FLASHCARD CAROUSEL (Created via chat) */}
                      {m.actionType === "flashcards" && m.flashcardsPayload && m.flashcardsPayload.length > 0 && activeCard && (
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                            <span className="font-semibold text-blue-400 flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              <span>Card {cardIndex + 1} of {m.flashcardsPayload.length}</span>
                            </span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                              {activeCard.category || "Concept"}
                            </span>
                          </div>

                          <div
                            onClick={() =>
                              setInlineCardFlipped((prev) => ({
                                ...prev,
                                [m.id]: !isCardFlipped,
                              }))
                            }
                            className="p-3 rounded-md bg-slate-900 border border-slate-800/80 cursor-pointer min-h-[90px] flex flex-col justify-center text-center transition-colors hover:border-slate-700"
                          >
                            {!isCardFlipped ? (
                              <div>
                                <span className="text-[10px] uppercase text-slate-500 font-semibold block mb-1">
                                  Front (Click to Flip)
                                </span>
                                <div className="text-xs font-medium text-slate-200">
                                  {activeCard.front}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] uppercase text-blue-400 font-semibold block mb-1">
                                  Back (Explanation)
                                </span>
                                <div className="text-xs text-slate-300 leading-relaxed text-left whitespace-pre-line">
                                  {activeCard.back}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setInlineCardFlipped((p) => ({ ...p, [m.id]: false }));
                                  setInlineCardIndices((p) => ({
                                    ...p,
                                    [m.id]: (cardIndex - 1 + (m.flashcardsPayload?.length || 1)) % (m.flashcardsPayload?.length || 1),
                                  }));
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                              >
                                &lt; Prev
                              </button>
                              <button
                                onClick={() => {
                                  setInlineCardFlipped((p) => ({ ...p, [m.id]: false }));
                                  setInlineCardIndices((p) => ({
                                    ...p,
                                    [m.id]: (cardIndex + 1) % (m.flashcardsPayload?.length || 1),
                                  }));
                                }}
                                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] cursor-pointer"
                              >
                                Next &gt;
                              </button>
                            </div>

                            {onNavigate && (
                              <button
                                onClick={() => onNavigate("flashcards")}
                                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Open in Flashcards</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* INLINE QUIZ WIDGET (Created via chat) */}
                      {m.actionType === "quiz" && m.quizPayload && m.quizPayload.length > 0 && (
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
                            <span className="font-semibold text-emerald-400 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              <span>Sample Quiz Question</span>
                            </span>
                            {onNavigate && (
                              <button
                                onClick={() => setActiveTab("quiz")}
                                className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                              >
                                Take Full Quiz &gt;
                              </button>
                            )}
                          </div>

                          <div className="text-xs text-slate-200 font-medium">
                            {m.quizPayload[0]?.question}
                          </div>

                          <div className="space-y-1.5">
                            {m.quizPayload[0]?.options.map((opt, oIdx) => {
                              const chosen = inlineQuizAnswers[m.id]?.[0];
                              const isSelected = chosen === oIdx;
                              const isSubmitted = inlineQuizSubmitted[m.id];
                              const isCorrect = oIdx === m.quizPayload?.[0]?.correctIndex;

                              let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700";
                              if (isSubmitted) {
                                if (isCorrect) btnStyle = "bg-emerald-950/60 border-emerald-700 text-emerald-300";
                                else if (isSelected) btnStyle = "bg-rose-950/60 border-rose-700 text-rose-300";
                              } else if (isSelected) {
                                btnStyle = "bg-blue-600/20 border-blue-500 text-white";
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => {
                                    setInlineQuizAnswers((prev) => ({
                                      ...prev,
                                      [m.id]: { ...(prev[m.id] || {}), 0: oIdx },
                                    }));
                                    setInlineQuizSubmitted((prev) => ({
                                      ...prev,
                                      [m.id]: true,
                                    }));
                                  }}
                                  className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs border transition-colors cursor-pointer flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                  {isSubmitted && isCorrect && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                                </button>
                              );
                            })}
                          </div>

                          {inlineQuizSubmitted[m.id] && m.quizPayload[0]?.explanation && (
                            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                              <strong>Explanation:</strong> {m.quizPayload[0].explanation}
                            </p>
                          )}
                        </div>
                      )}

                      {/* INLINE ACTION BUTTONS for Note, MindMap, and Diagnostics */}
                      {m.actionType === "note_created" && onNavigate && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Note added to your study records</span>
                          <button
                            onClick={() => onNavigate("notebook")}
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open in My Notebooks</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {m.actionType === "mindmap" && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Knowledge graph generated</span>
                          <button
                            onClick={() => setActiveTab("mindmap")}
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Full Mind Map</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {m.actionType === "weakspots" && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">Targeted diagnostic analysis</span>
                          <button
                            onClick={() => setActiveTab("weakspots")}
                            className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Open Weak Spots Tab</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}

                      {/* Web Sources Chips if used */}
                      {m.webSources && m.webSources.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-800">
                          <div className="text-[10px] font-medium text-blue-400 flex items-center gap-1 mb-1">
                            <Globe className="w-3 h-3" />
                            <span>Live Web Sources (Gemini Search Grounding):</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            {m.webSources.slice(0, 3).map((s, idx) => (
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
                );
              })}

              {isChatting && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Processing workspace command...</span>
                </div>
              )}
            </div>

            {/* Quick Action Chips & Input Bar */}
            <div className="p-3 border-t border-slate-800 bg-[#0e131f] space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSendMessage("Make 5 flashcards on Carnot cycle")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  ⚡ Make Flashcards
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Generate a quiz on thermodynamics")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  📝 Generate Quiz
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("Create a mind map on electromagnetic induction")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  🧠 Mind Map
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage("What are the latest cryogenic heat engine breakthroughs?")}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer"
                >
                  🌐 Web Search
                </button>
              </div>

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
                  placeholder="Ask a question or type 'Make flashcards on...', 'Generate a quiz on...'..."
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

        {/* TAB 2: Practice Quiz */}
        {activeTab === "quiz" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-3.5 rounded-xl bg-[#111622] border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Generated via <strong>OmniRoute AI Gateway</strong>
              </span>
              <span className="text-slate-500">Topic: {quizTopicInput}</span>
            </div>

            {!isQuizSubmitted ? (
              <div className="p-5 rounded-xl bg-[#111622] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-xs font-semibold text-white">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </h2>
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
                        className={`w-full p-2.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
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
              <div className="p-5 rounded-xl bg-[#111622] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white">Quiz Score</h3>
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
                      ⚠️ Score is under 70%. Saved to your Weak Spots tab for review.
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
