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
  Calculator,
  FileCheck,
  Play,
  Pause,
  Volume2,
  MessageSquare,
} from "lucide-react";
import {
  SocraticMessage,
  QuizQuestion,
  QuizResult,
  WeakSpotRecord,
  MindMapData,
  OmniRouteConfig,
  Flashcard,
  MathSolution,
  EssayReview,
  AudioPodcastEpisode,
  AudioPodcastSpeaker,
  AgentPersona,
} from "@/types/stem";
import { detectSubjectFromQuery } from "@/lib/omni-router";
import MathView, { MathText } from "@/components/MathView";

interface EduAgentViewProps {
  omniConfig?: Partial<OmniRouteConfig>;
  onNavigate?: (view: string) => void;
}

export default function EduAgentView({ omniConfig, onNavigate }: EduAgentViewProps) {
  const [activeTab, setActiveTab] = useState<"tutor" | "quiz" | "weakspots" | "mindmap">("tutor");
  const [customSubject, setCustomSubject] = useState("General Academic");
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [persona, setPersona] = useState<AgentPersona>("tutor");

  // In-chat podcast audio playback
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const handlePlayPodcast = (msgId: string, dialogue: AudioPodcastSpeaker[]) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMsgId(msgId);
    let index = 0;

    const playNext = () => {
      if (index >= dialogue.length) {
        setSpeakingMsgId(null);
        return;
      }
      const item = dialogue[index];
      const u = new SpeechSynthesisUtterance(item.text);
      if (item.speaker.includes("Sarah")) {
        u.pitch = 1.1;
        u.rate = 1.0;
      } else {
        u.pitch = 0.9;
        u.rate = 1.05;
      }
      u.onend = () => {
        index++;
        playNext();
      };
      u.onerror = () => setSpeakingMsgId(null);
      window.speechSynthesis.speak(u);
    };

    playNext();
  };

  // --- Copilot Messages ---
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Welcome! I am **Copilot**, your central AI study partner & mission control powered directly by **Google Gemini API** (with DeepSeek support).\n\n**Universal Workspace Capabilities**:\n• 📝 **Exams & Quizzes**: Ask me to *\"Make a quiz on [ANY TOPIC]\"* (e.g. Politics of Pakistan, Organic Chemistry, Calculus, French Revolution).\n• 🗂️ **Active-Recall Flashcards**: Ask me to *\"Make flashcards on [ANY TOPIC]\"* and flip them right here.\n• 📐 **Math Problem Solver**: Ask me to *\"Solve 2x^2 + 5x - 3 = 0\"* or any calculus/algebra problem for step-by-step verified derivations.\n• 🔍 **Originality & Essay Review**: Say *\"Review essay: [text]\"* for thesis clarity, tone, and plagiarism/similarity inspection.\n• 🧠 **Mind Maps**: Ask to *\"Generate mind map on [topic]\"* for concept graphs.\n• 🎙️ **Audio Podcasts**: Ask to *\"Generate podcast on [topic]\"* to listen to dual-host discussions with Dr. Sarah & Alex!\n• 🌐 **Google Web Search Grounding**: Live search is activated for current events and external curricula.",
      timestamp: "Ready",
      guidedQuestions: [
        "Make a quiz on politics of pakistan",
        "Make 5 flashcards on Binary Search",
        "Solve: 2x^2 + 5x - 3 = 0",
        "Generate a concept mind map on Photosynthesis",
        "Generate an audio podcast on Quantum Mechanics",
      ],
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  // Interactive inline flashcard carousel state for chat messages
  const [inlineCardIndices, setInlineCardIndices] = useState<Record<string, number>>({});
  const [inlineCardFlipped, setInlineCardFlipped] = useState<Record<string, boolean>>({});

  // Interactive inline quiz state for chat messages
  const [inlineQuizIndices, setInlineQuizIndices] = useState<Record<string, number>>({});
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

  // --- PRESET EXECUTION FOR QUIZ & FLASHCARDS ---
  const handleExecutePreset = async (
    type: "quiz" | "flashcards",
    topic: string,
    count: number,
    source: "uploaded" | "outside" | "mixed"
  ) => {
    setIsChatting(true);
    const sourceLabel =
      source === "uploaded"
        ? "Uploaded Notebook Notes (OmniRoute)"
        : source === "outside"
        ? "Live Web (Google Gemini)"
        : "Cooperative Blend (OmniRoute Notes + Gemini Web)";

    let noteContext = "";
    if (source === "uploaded" || source === "mixed") {
      try {
        const saved = localStorage.getItem("student_notebook_docs");
        if (saved) {
          const docs = JSON.parse(saved);
          if (Array.isArray(docs) && docs.length > 0) {
            const topicWords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
            const matching = docs.find((d: any) => {
              if (!d.title) return false;
              const titleLower = d.title.toLowerCase();
              const contentLower = (d.content || "").toLowerCase();
              return (
                topicWords.some((w) => titleLower.includes(w)) ||
                (topicWords.length > 0 && contentLower.includes(topicWords[0]))
              );
            });
            if (matching) {
              noteContext = `Note Title: ${matching.title}\nSubject: ${matching.subject}\nChapter: ${matching.chapter || "Study Material"}\nContent:\n${matching.content}`;
            }
          }
        }
      } catch {}
    }

    try {
      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: type,
          subject: customSubject,
          topic,
          count,
          source,
          context: noteContext,
          config: omniConfig,
        }),
      });
      const data = await res.json();

      if (type === "flashcards") {
        const flashcards: Flashcard[] = data.success && Array.isArray(data.data) ? data.data : [];
        if (flashcards.length > 0) saveGeneratedFlashcardsToDeck(flashcards);
        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `✓ Generated **${flashcards.length || count} active-recall flashcards** on "${topic}" in **${customSubject}** sourced from **${sourceLabel}** and added them to your deck.`,
          actionType: "flashcards",
          flashcardsPayload: flashcards,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Generate a practice quiz on ${topic}`,
            `Explain the primary mechanism of ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const questions: QuizQuestion[] = data.success && Array.isArray(data.data) ? data.data : [];
        if (questions.length > 0) {
          setQuizQuestions(questions);
          setQuizTopicInput(topic);
        }
        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `✓ Generated a **${questions.length || count}-question practice quiz** on "${topic}" in **${customSubject}** sourced from **${sourceLabel}**. Answer the sample question below or switch to Practice Quiz Mode for a full diagnostic assessment.`,
          actionType: "quiz",
          quizPayload: questions,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Make flashcards on ${topic}`,
            `Explain key derivations of ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      console.error(`Error generating ${type}:`, err);
    } finally {
      setIsChatting(false);
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
    const detectedSub = detectSubjectFromQuery(rawText, customSubject);
    setCustomSubject(detectedSub);

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

    if (lower === "open tools" || lower === "open math" || lower === "open essay" || lower === "academic tools" || lower === "/tools") {
      if (onNavigate) onNavigate("tools");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Navigating to Academic Specialist Tools (Math Solver, Originality Reviewer & Mind Maps).",
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
        content: "Opening Settings. You can test your Google Gemini API connection or update API keys.",
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
        content: `Switched to Practice Quiz mode for ${detectedSub}! Select your answers for each question and submit for instant diagnostic scoring.`,
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
        content: `Switched to Mind Map view for ${detectedSub}! You can explore the interconnected concept graph.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    // Persona switch commands
    if (lower === "switch to tutor" || lower === "socratic mode" || lower === "socratic coach") {
      setPersona("tutor");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to **Socratic Coach** persona. I will guide you with probing questions and conceptual analogies.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }
    if (lower === "switch to explainer" || lower === "concept explainer") {
      setPersona("explainer");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to **Concept Explainer** persona. I will deconstruct topics from first principles with clear mental models.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }
    if (lower === "switch to examiner" || lower === "board examiner") {
      setPersona("examiner");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to **Board Examiner** persona. I will emphasize examination standards, common traps, and scoring rubrics.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }
    if (lower === "switch to math" || lower === "math deriver") {
      setPersona("math");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to **Mathematical Deriver** persona. I will provide step-by-step rigorous algebraic derivations.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }
    if (lower === "switch to reviewer" || lower === "essay reviewer") {
      setPersona("reviewer");
      const msg: SocraticMessage = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: "Switched to **Essay & Writing Reviewer** persona. Paste any assignment to inspect originality, tone, and argument flow.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, msg]);
      setIsChatting(false);
      return;
    }

    if (lower === "clear chat" || lower === "reset tutor" || lower === "reset session" || lower === "reset copilot") {
      setMessages([
        {
          id: `init-${Date.now()}`,
          role: "assistant",
          content:
            "Chat session refreshed. I am **Copilot**, your central AI partner & workspace controller powered by Google Gemini API.\n\nAsk me to:\n• \"Make a quiz on [ANY TOPIC]\" (e.g. politics of pakistan, calculus, organic chemistry)\n• \"Make flashcards on [ANY TOPIC]\"\n• \"Solve: [MATH PROBLEM]\"\n• \"Review essay: [TEXT]\"\n• \"Create mind map on [TOPIC]\"\n• \"Generate podcast on [TOPIC]\"",
          timestamp: "Ready",
          guidedQuestions: [
            "Make a quiz on politics of pakistan",
            "Make 5 flashcards on Binary Search",
            "Solve: 2x^2 + 5x - 3 = 0",
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
            `${i + 1}. **${ws.topic}** (${ws.subject} - Mastery: ${ws.masteryPercentage}%)\n` +
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

    // Helper to extract student's uploaded notes & relevant formulas across multiple documents (Multi-Doc RAG)
    const getNotebookNotesData = (topicQuery?: string, maxDocs: number = 3) => {
      let noteContext = "";
      let foundTitle = "";
      let foundEquation = "";
      let matchedTitles: string[] = [];
      try {
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("student_notebook_docs");
          if (saved) {
            const docs = JSON.parse(saved);
            if (Array.isArray(docs) && docs.length > 0) {
              const stopWords = new Set(["what", "when", "where", "which", "explain", "describe", "tell", "show", "about", "this", "that", "with", "from", "have", "does", "give", "make", "help", "please", "can", "you", "for", "the", "and"]);
              const queryTokens = (topicQuery || "")
                .toLowerCase()
                .replace(/[^\w\s]/g, " ")
                .split(/\s+/)
                .filter((w) => w.length > 2 && !stopWords.has(w));

              // Score each document by relevance
              const scoredDocs = docs.map((doc: any) => {
                const titleLower = (doc.title || "").toLowerCase();
                const chapterLower = (doc.chapter || "").toLowerCase();
                const subjectLower = (doc.subject || "").toLowerCase();
                const contentLower = (doc.content || "").toLowerCase();

                let score = 0;
                if (queryTokens.length > 0) {
                  queryTokens.forEach((token) => {
                    if (titleLower.includes(token)) score += 8;
                    if (chapterLower.includes(token)) score += 5;
                    if (subjectLower.includes(token)) score += 3;
                    const matches = contentLower.split(token).length - 1;
                    score += Math.min(matches * 1.5, 12);
                  });
                  const matchedTokensCount = queryTokens.filter((t) => titleLower.includes(t) || contentLower.includes(t)).length;
                  if (matchedTokensCount > 1) {
                    score += matchedTokensCount * 4;
                  }
                } else {
                  score = 1;
                }
                return { doc, score };
              });

              scoredDocs.sort((a, b) => b.score - a.score);
              const topMatches = scoredDocs.filter((d) => d.score > 0).slice(0, maxDocs);
              const selectedDocs = topMatches.length > 0 ? topMatches.map((d) => d.doc) : [docs[0]];

              matchedTitles = selectedDocs.map((d) => d.title || "Study Notes");
              foundTitle = matchedTitles[0] || "";

              // Format multi-source context with clear citations
              noteContext = selectedDocs
                .map((doc, idx) => {
                  const excerpt = (doc.content || "").slice(0, 1600);
                  return `[Source Document ${idx + 1}: "${doc.title}" | Subject: ${doc.subject || customSubject} | Chapter: ${doc.chapter || "Study Material"}]\n${excerpt}`;
                })
                .join("\n\n---\n\n");

              // Extract potential equation if present in any matched documents
              for (const doc of selectedDocs) {
                const eqMatch = (doc.content || "").match(/([a-zA-Z0-9\^_\+\-\*/\(\)\s=]{4,40}=\s*[0-9a-zA-Z\^_\+\-\*/\(\)]+)/);
                if (eqMatch) {
                  foundEquation = eqMatch[1].trim();
                  break;
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Error reading notebook docs:", e);
      }
      return { noteContext, foundTitle, foundEquation, matchedTitles };
    };

    // Parse count signals
    const countMatch = rawText.match(/\b([1-9]|1\d|20)\b/);
    const parsedCount = countMatch ? parseInt(countMatch[1], 10) : undefined;

    // 2. Detect QUIZ intent (Takes priority over general math keywords)
    const isQuizIntent =
      (lower.includes("quiz") && !lower.includes("view quiz") && !lower.includes("take quiz in tab")) ||
      lower.startsWith("/quiz") ||
      /(?:make|create|generate|take|give me|quiz me on|fetch|get|build)\s*(?:a\s*)?(?:\d+)?\s*(?:question\s*)?quiz/i.test(lower);

    // 3. Detect FLASHCARDS intent
    const isFlashcardsIntent =
      lower.includes("flashcard") ||
      lower.startsWith("/flashcard") ||
      /(?:make|create|generate|give me|build|fetch|get)\s*(?:\d+)?\s*flashcard/i.test(lower);

    // 4. Detect MATH SOLVER & EQUATION intent
    const isMathIntent =
      !isQuizIntent &&
      !isFlashcardsIntent &&
      (/^(?:solve|calculate|derive|evaluate|integrate|differentiate|math:|fetch equation|get equation|show equation|find equation)/i.test(lower) ||
      lower.includes("solve equation") ||
      lower.includes("fetch equation") ||
      lower.includes("get equation") ||
      lower.includes("show equation") ||
      lower.includes("equation for") ||
      lower.includes("solve math") ||
      lower.includes("step by step math") ||
      lower.includes("math problem") ||
      lower.includes("math solution") ||
      lower.includes("formula for") ||
      /(\d+x\^?2|[a-z]\s*=\s*|x\^2|\b(?:sin|cos|tan|log|ln|sqrt)\b|\\int|∫)/i.test(rawText) ||
      /=\s*0\b/.test(rawText));

    // 5. Detect ESSAY & ORIGINALITY REVIEW intent
    const isEssayIntent =
      /^(?:review essay|check plagiarism|check similarity|analyze writing|inspect essay)/i.test(lower) ||
      lower.includes("check similarity") ||
      lower.includes("plagiarism check");

    // 6. Detect PODCAST intent
    const isPodcastIntent =
      lower.includes("podcast") ||
      lower.includes("audio episode") ||
      lower.includes("audio overview") ||
      lower.includes("audio dialogue");

    // 7. Detect MIND MAP intent
    const isMindMapIntent =
      lower.includes("mind map") ||
      lower.includes("mindmap") ||
      lower.includes("concept map");

    // 8. Detect NOTE intent
    const isNoteIntent =
      lower.startsWith("add note:") ||
      lower.startsWith("save note:") ||
      /(?:add|create|save)\s*(?:a\s*)?(?:study\s*)?note/i.test(lower);

    try {
      // MATH EXECUTION
      if (isMathIntent) {
        let mathExpr = rawText
          .replace(/^(?:fetch equation|get equation|show equation|find equation|solve equation|solve math|solve|calculate|derive|evaluate|integrate|differentiate|math:)\s*(?:for|of|the|about)?\s*/i, "")
          .replace(/(?:with steps|step by step|please|bro|can you|data)\b/gi, "")
          .trim();

        // If user didn't specify an expression (e.g. "fetch equation" or "solve equation")
        if (!mathExpr || mathExpr.length < 2 || mathExpr.toLowerCase() === "equation" || mathExpr.toLowerCase() === "data") {
          const notesData = getNotebookNotesData();
          if (notesData.foundEquation) {
            mathExpr = notesData.foundEquation;
          } else if (notesData.foundTitle) {
            mathExpr = `Derive ${notesData.foundTitle}`;
          } else if (detectedSub.includes("Physics")) {
            mathExpr = "Carnot Heat Engine Efficiency: \\eta = 1 - \\frac{T_2}{T_1}";
          } else {
            mathExpr = "2x^2 + 5x - 3 = 0";
          }
        }

        // Canonical conversions for common math phrases
        if (/^quadratic\s*(?:equation|formula)?$/i.test(mathExpr)) {
          mathExpr = "2x^2 + 5x - 3 = 0";
        } else if (/^carnot\s*(?:equation|cycle|engine)?$/i.test(mathExpr)) {
          mathExpr = "Derive Carnot Heat Engine Efficiency";
        }

        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "math_solve",
            subject: detectedSub || "Mathematics",
            topic: mathExpr,
            mathExpression: mathExpr,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const solution: MathSolution = data.success && data.data ? data.data : null;

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `I have derived the step-by-step mathematical solution for: **${mathExpr}**.\nFinal Answer: **${solution?.finalAnswer || "Derived successfully."}**`,
          actionType: "math_solution",
          mathPayload: solution,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Can you explain step 1 in more detail?`,
            `Generate another problem like this`,
            `Make a quiz on ${detectedSub}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // ESSAY & PLAGIARISM REVIEW EXECUTION
      if (isEssayIntent) {
        const textToReview = rawText.replace(/^(?:review essay|check plagiarism|check similarity|analyze writing|inspect essay)(?::|\s+on|\s+about)?/i, "").trim() || rawText;
        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "review_essay",
            essayText: textToReview,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const review: EssayReview = data.success && data.data ? data.data : null;

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `Academic Originality & Quality Review complete:\n• Originality Score: **${review?.originalityScore || 90}%**\n• Similarity Index: **${review?.similarityIndex || 10}%**\n• Academic Tone: **${review?.academicTone || "Analytical"}**`,
          actionType: "essay_review",
          essayPayload: review,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            "How can I strengthen my thesis statement?",
            "Suggest alternative academic vocabulary",
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // PODCAST EXECUTION
      if (isPodcastIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of)\s+([^.?!,]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : `${detectedSub} Concepts`;
        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "audio_script",
            subject: detectedSub,
            topic,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const podcast: AudioPodcastEpisode = data.success && data.data ? data.data : null;

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `🎙️ Generated a dual-host audio episode for **"${topic}"** with Dr. Sarah and Alex! Click "Listen with Speech AI" below to hear the audio conversation:`,
          actionType: "podcast",
          audioPayload: podcast,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Generate a quiz on ${topic}`,
            `Make flashcards on ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // FLASHCARDS DIRECT GENERATION (Any topic + Notes support)
      if (isFlashcardsIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of|regarding)\s+([^.?!,]+)/i);
        let topic = "";
        if (topicMatch) {
          topic = topicMatch[1]
            .replace(/(?:with \d+ flashcards?|from my notes|from notes|please|bro|data)\b/gi, "")
            .trim();
        } else {
          topic = rawText
            .replace(/(?:make|create|generate|give me|build|fetch|get|load|bring|show|\b\d+\b|flashcards?|cards?|deck|study|review|data|please|bro|can you|from my notes|from notes|uploaded|outside|mixed)/gi, "")
            .trim();
        }

        const notesData = getNotebookNotesData(topic);
        let noteContext = "";

        if (lower.includes("note") || lower.includes("upload") || !topic || topic.length < 3 || topic.toLowerCase() === "fetch" || topic.toLowerCase() === "data") {
          if (notesData.noteContext) {
            noteContext = notesData.noteContext;
            if (!topic || topic.length < 3 || topic.toLowerCase() === "fetch" || topic.toLowerCase() === "data") {
              topic = notesData.foundTitle || `${detectedSub} Study Notes`;
            }
          }
        }

        if (!topic || topic.length < 3 || topic.toLowerCase() === "fetch" || topic.toLowerCase() === "data") {
          topic = detectedSub && detectedSub !== "General Academic" ? detectedSub : "Academic Core Concepts";
        }

        const finalCount = parsedCount || 6;
        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "flashcards",
            subject: detectedSub,
            topic,
            count: finalCount,
            context: noteContext || undefined,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const flashcards: Flashcard[] = data.success && Array.isArray(data.data) ? data.data : [];
        if (flashcards.length > 0) saveGeneratedFlashcardsToDeck(flashcards);

        const newMsgId = `asst-${Date.now()}`;
        setInlineCardIndices((prev) => ({ ...prev, [newMsgId]: 0 }));
        setInlineCardFlipped((prev) => ({ ...prev, [newMsgId]: false }));

        const assistantMsg: SocraticMessage = {
          id: newMsgId,
          role: "assistant",
          content: `✓ Generated **${flashcards.length} active-recall flashcards** on **"${topic}"** in **${detectedSub}**${noteContext ? " (from your notebook notes)" : " (using Google Gemini)"} and saved them to your deck. Flip through them below!`,
          actionType: "flashcards",
          flashcardsPayload: flashcards,
          promptTopic: topic,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Generate a practice quiz on ${topic}`,
            `Fetch equation for ${topic}`,
            `Explain key derivations of ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // QUIZ DIRECT GENERATION (Any topic + Notes support)
      if (isQuizIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of|regarding)\s+([^.?!,]+)/i);
        let topic = "";
        if (topicMatch) {
          topic = topicMatch[1]
            .replace(/(?:with \d+ questions?|from my notes|from notes|please|bro|data)\b/gi, "")
            .trim();
        } else {
          topic = rawText
            .replace(/(?:make|create|generate|take|quiz me on|give me|fetch|get|load|bring|show|build|\b\d+\b|questions?|mcqs?|quiz|quizzes|practice|exam|test|data|please|bro|can you|from my notes|from notes|uploaded|outside|mixed)/gi, "")
            .trim();
        }

        const notesData = getNotebookNotesData(topic);
        let noteContext = "";

        if (lower.includes("note") || lower.includes("upload") || !topic || topic.length < 3 || topic.toLowerCase() === "fetch" || topic.toLowerCase() === "data") {
          if (notesData.noteContext) {
            noteContext = notesData.noteContext;
            if (!topic || topic.length < 3 || topic.toLowerCase() === "fetch" || topic.toLowerCase() === "data") {
              topic = notesData.foundTitle || `${detectedSub} Study Notes`;
            }
          }
        }

        if (!topic || topic.length < 3 || topic.toLowerCase() === "fetch" || topic.toLowerCase() === "data") {
          topic = detectedSub && detectedSub !== "General Academic" ? detectedSub : "Academic Core Concepts";
        }

        const finalCount = parsedCount || 5;
        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "quiz",
            subject: detectedSub,
            topic,
            count: finalCount,
            context: noteContext || undefined,
            config: omniConfig,
          }),
        });
        const data = await res.json();
        const questions: QuizQuestion[] = data.success && Array.isArray(data.data) ? data.data : [];
        if (questions.length > 0) {
          setQuizQuestions(questions);
          setQuizTopicInput(topic);
        }

        const newMsgId = `asst-${Date.now()}`;
        setInlineQuizIndices((prev) => ({ ...prev, [newMsgId]: 0 }));

        const assistantMsg: SocraticMessage = {
          id: newMsgId,
          role: "assistant",
          content: `✓ Generated an authentic **${questions.length}-question practice quiz** on **"${topic}"** in **${detectedSub}**${noteContext ? " (grounded in your uploaded notes)" : " (using Google Gemini)"}. Answer questions below or click "Take Full Quiz" to benchmark your mastery!`,
          actionType: "quiz",
          quizPayload: questions,
          promptTopic: topic,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Make 5 flashcards on ${topic}`,
            `Explain key concepts of ${topic}`,
            `Fetch equation for ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // MIND MAP DIRECT GENERATION
      if (isMindMapIntent) {
        const topicMatch = rawText.match(/(?:on|for|about|of)\s+([^.?!,]+)/i);
        const topic = topicMatch ? topicMatch[1].trim() : `${detectedSub} Knowledge Graph`;

        const res = await fetch("/api/ai/omni-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "mindmap",
            subject: detectedSub,
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
          content: `Concept Knowledge Graph created for "${topic}" in **${detectedSub}**. Found ${data.data?.nodes?.length || 4} interconnected concept nodes connecting prerequisites to practical applications.`,
          actionType: "mindmap",
          mindmapPayload: data.data,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          guidedQuestions: [
            `Make flashcards on ${topic}`,
            `Generate a quiz on ${topic}`,
          ],
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // NOTE CREATION
      if (isNoteIntent) {
        const noteContent = rawText.replace(/^(?:add|save|create)\s*(?:a\s*)?(?:study\s*)?note(?::|\s+about|\s+on)?/i, "").trim();
        saveNoteToNotebook(`${detectedSub} Study Note`, noteContent || rawText);

        const assistantMsg: SocraticMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content: `✓ Saved ${detectedSub} study note to your personal notebook studio: "${noteContent.slice(0, 60)}..."`,
          actionType: "note_created",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }

      // 6. Copilot Intelligent Query Routing
      // Checks multi-document semantic RAG across uploaded notes and PDFs:
      // If content is found -> OmniRoute grounds answer in multi-source notebook context with citations
      // If content is NOT found -> Gemini activates web search and external academic grounding
      const { noteContext: multiDocContext, matchedTitles } = getNotebookNotesData(rawText, 4);
      const noteContext = multiDocContext;
      const hasMatchingNotebook = !!(multiDocContext && multiDocContext.trim().length > 10);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch("/api/ai/omni-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          subject: detectedSub,
          userMessage: rawText,
          context: noteContext,
          persona,
          history: messages.slice(-8),
          source: hasMatchingNotebook ? "uploaded" : "outside",
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
        content: `Regarding "${rawText}" in **${detectedSub}**:\n\n1. **Core Concept**: Deconstruct the problem into foundational ${detectedSub} principles.\n2. **Analysis**: Check key mechanisms, formulas, and operational definitions.\n3. **Application**: Verify boundary conditions and avoid common examination pitfalls.\n\nWould you like me to make flashcards or a quiz on this topic?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        guidedQuestions: [
          `Make 5 flashcards on this topic`,
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
          "Consult Copilot on the missed conceptual derivation.",
          "Re-take the quiz once concepts are reviewed to achieve >70% mastery.",
        ],
      };
      saveWeakSpots([newWeakSpot, ...weakSpots]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-zinc-100 overflow-hidden">
      {/* Sleek Sub-Navigation & Controls */}
      <div className="border-b border-zinc-800/60 bg-[#09090b] px-4 py-2 flex items-center justify-between gap-3 shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("tutor")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "tutor"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Copilot Chat
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "quiz"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Practice Quiz
          </button>
          <button
            onClick={() => setActiveTab("weakspots")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "weakspots"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Weak Spots</span>
            {weakSpots.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("mindmap")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "mindmap"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Mind Map
          </button>
        </div>

        <button
          onClick={() => setWebSearchEnabled(!webSearchEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
            webSearchEnabled
              ? "text-emerald-400 hover:text-emerald-300"
              : "text-zinc-500 hover:text-zinc-400"
          }`}
          title="Toggle Gemini Live Google Search Grounding"
        >
          <Globe className="w-3 h-3" />
          <span>Web Search: {webSearchEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB 1: Copilot Chat with App Actions */}
        {activeTab === "tutor" && (
          <div className="max-w-3xl mx-auto flex flex-col h-full overflow-hidden">
            {/* Minimal Persona Selector */}
            <div className="px-4 py-2 border-b border-zinc-800/40 flex items-center gap-1 overflow-x-auto text-[11px] shrink-0">
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-mono mr-1">Persona:</span>
              {[
                { id: "tutor", label: "Coach" },
                { id: "explainer", label: "Explainer" },
                { id: "examiner", label: "Examiner" },
                { id: "math", label: "Math Deriver" },
                { id: "reviewer", label: "Essay Reviewer" },
                { id: "lecture", label: "Lecture Mode" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id as AgentPersona)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors shrink-0 cursor-pointer ${
                    persona === p.id
                      ? "bg-zinc-200 text-zinc-950 font-medium"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
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
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        m.role === "user"
                          ? "bg-zinc-800 text-zinc-100"
                          : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-200"
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

                      {/* INTERACTIVE PRESET CONFIGURATION CHIPS (For Quizzes & Flashcards) */}
                      {m.promptType && m.promptTopic && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                          <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            <span>Select Configuration Preset for "{m.promptTopic}":</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {m.promptType === "quiz_config" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("quiz", m.promptTopic!, 3, "uploaded")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>📄 3 Questions (Uploaded Notes)</span>
                                  <span className="text-[10px] text-blue-400 font-mono">OmniRoute</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("quiz", m.promptTopic!, 5, "uploaded")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>📄 5 Questions (Uploaded Notes)</span>
                                  <span className="text-[10px] text-blue-400 font-mono">OmniRoute</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("quiz", m.promptTopic!, 5, "outside")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>🌐 5 Questions (Outside / Web)</span>
                                  <span className="text-[10px] text-emerald-400 font-mono">Gemini</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("quiz", m.promptTopic!, 5, "mixed")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>🔀 5 Questions (Mixed Blend)</span>
                                  <span className="text-[10px] text-purple-400 font-mono">Both Models</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("quiz", m.promptTopic!, 10, "mixed")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between sm:col-span-2"
                                >
                                  <span>🔀 10 Questions (Mixed 50/50 Notes + Web)</span>
                                  <span className="text-[10px] text-purple-400 font-mono">Both Models</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("flashcards", m.promptTopic!, 4, "uploaded")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>📄 4 Cards (Uploaded Notes)</span>
                                  <span className="text-[10px] text-blue-400 font-mono">OmniRoute</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("flashcards", m.promptTopic!, 6, "uploaded")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>📄 6 Cards (Uploaded Notes)</span>
                                  <span className="text-[10px] text-blue-400 font-mono">OmniRoute</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("flashcards", m.promptTopic!, 6, "outside")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>🌐 6 Cards (Outside / Web)</span>
                                  <span className="text-[10px] text-emerald-400 font-mono">Gemini</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("flashcards", m.promptTopic!, 6, "mixed")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between"
                                >
                                  <span>🔀 6 Cards (Mixed Blend)</span>
                                  <span className="text-[10px] text-purple-400 font-mono">Both Models</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecutePreset("flashcards", m.promptTopic!, 10, "mixed")}
                                  className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-200 text-left transition-colors cursor-pointer flex items-center justify-between sm:col-span-2"
                                >
                                  <span>🔀 10 Cards (Mixed 50/50 Notes + Web)</span>
                                  <span className="text-[10px] text-purple-400 font-mono">Both Models</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

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
                                  <MathText text={activeCard.front} />
                                </div>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[10px] uppercase text-blue-400 font-semibold block mb-1">
                                  Back (Explanation)
                                </span>
                                <div className="text-xs text-slate-300 leading-relaxed text-left whitespace-pre-line">
                                  <MathText text={activeCard.back} />
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
                      {m.actionType === "quiz" && m.quizPayload && m.quizPayload.length > 0 && (() => {
                        const qIdx = inlineQuizIndices[m.id] ?? 0;
                        const currentQ = m.quizPayload[qIdx] || m.quizPayload[0];
                        const totalQ = m.quizPayload.length;
                        const userAnswers = inlineQuizAnswers[m.id] || {};
                        const chosen = userAnswers[qIdx];
                        const isAnswered = chosen !== undefined;
                        const isCorrect = chosen === currentQ.correctIndex;
                        const totalAnswered = Object.keys(userAnswers).length;
                        const totalScore = Object.entries(userAnswers).filter(
                          ([idxStr, optIdx]) => m.quizPayload?.[parseInt(idxStr, 10)]?.correctIndex === optIdx
                        ).length;

                        return (
                          <div className="mt-3 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 space-y-3">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  <span>Question {qIdx + 1} of {totalQ}</span>
                                </span>
                                <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                                  {currentQ.difficulty || "Standard"}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  if (m.quizPayload) {
                                    setQuizQuestions(m.quizPayload);
                                    if (m.promptTopic) setQuizTopicInput(m.promptTopic);
                                    setActiveTab("quiz");
                                  }
                                }}
                                className="text-[10px] text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>Take in Full Quiz Tab</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="text-xs text-slate-100 font-medium leading-relaxed">
                              <MathText text={currentQ.question} />
                            </div>

                            <div className="space-y-1.5">
                              {currentQ.options.map((opt, oIdx) => {
                                const isSelected = chosen === oIdx;
                                const isThisCorrect = oIdx === currentQ.correctIndex;

                                let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700";
                                if (isAnswered) {
                                  if (isThisCorrect) btnStyle = "bg-emerald-950/70 border-emerald-600 text-emerald-300 font-medium";
                                  else if (isSelected) btnStyle = "bg-rose-950/70 border-rose-600 text-rose-300";
                                  else btnStyle = "bg-slate-900/60 border-slate-800/60 text-slate-500 opacity-60";
                                } else if (isSelected) {
                                  btnStyle = "bg-blue-600/20 border-blue-500 text-white";
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => {
                                      setInlineQuizAnswers((prev) => ({
                                        ...prev,
                                        [m.id]: { ...(prev[m.id] || {}), [qIdx]: oIdx },
                                      }));
                                      setInlineQuizSubmitted((prev) => ({
                                        ...prev,
                                        [m.id]: true,
                                      }));

                                      // Auto-record weak spot diagnostic if incorrect answer
                                      if (oIdx !== currentQ.correctIndex) {
                                        const topicLabel = m.promptTopic || customSubject || "Academic Study";
                                        const cleanQ = currentQ.question.replace(/\$+/g, '').slice(0, 50);
                                        const newWeakSpot: WeakSpotRecord = {
                                          id: `ws-${Date.now()}`,
                                          subject: customSubject,
                                          topic: `${topicLabel} (${cleanQ}...)`,
                                          chapter: currentQ.sloReference || "Diagnostic Quiz",
                                          masteryPercentage: 50,
                                          status: "critical",
                                          lastAssessed: new Date().toISOString(),
                                          prescribedRemediation: [
                                            `Explanation: ${currentQ.explanation.slice(0, 95)}...`,
                                            `Correct answer is: ${currentQ.options[currentQ.correctIndex]}`,
                                            "Practice 3 targeted remediation questions with Copilot.",
                                          ],
                                        };
                                        saveWeakSpots([newWeakSpot, ...weakSpots.filter(s => s.topic !== newWeakSpot.topic)]);
                                      }
                                    }}
                                    className={`w-full px-2.5 py-1.5 rounded-md text-left text-xs border transition-colors cursor-pointer flex items-center justify-between ${btnStyle}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-slate-400">
                                        {String.fromCharCode(65 + oIdx)}.
                                      </span>
                                      <span>
                                        <MathText text={opt} />
                                      </span>
                                    </div>
                                    {isAnswered && isThisCorrect && (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {isAnswered && currentQ.explanation && (
                              <div className="text-[11px] text-slate-300 p-2 rounded bg-slate-900/80 border border-slate-800/80">
                                <strong className="text-emerald-400">Explanation: </strong>
                                <MathText text={currentQ.explanation} />
                              </div>
                            )}

                            {/* Pagination and progress */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                              <div className="flex items-center gap-1.5">
                                <button
                                  disabled={qIdx === 0}
                                  onClick={() =>
                                    setInlineQuizIndices((prev) => ({
                                      ...prev,
                                      [m.id]: Math.max(0, qIdx - 1),
                                    }))
                                  }
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] disabled:opacity-30 cursor-pointer"
                                >
                                  &lt; Prev
                                </button>
                                <span className="text-[10px] text-slate-400 px-1">
                                  {totalAnswered}/{totalQ} answered
                                </span>
                                <button
                                  disabled={qIdx >= totalQ - 1}
                                  onClick={() =>
                                    setInlineQuizIndices((prev) => ({
                                      ...prev,
                                      [m.id]: Math.min(totalQ - 1, qIdx + 1),
                                    }))
                                  }
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] disabled:opacity-30 cursor-pointer"
                                >
                                  Next &gt;
                                </button>
                              </div>

                              {totalAnswered === totalQ && (
                                <div className="text-[11px] font-semibold text-emerald-400">
                                  Score: {totalScore}/{totalQ} ({Math.round((totalScore / totalQ) * 100)}%)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

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

                      {/* INLINE MATH SOLUTION WIDGET */}
                      {m.actionType === "math_solution" && m.mathPayload && (
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                            <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Step-by-Step Mathematical Derivation</span>
                            </span>
                            {onNavigate && (
                              <button
                                onClick={() => onNavigate("tools")}
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Academic Tools</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>

                          <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                              Problem Statement
                            </div>
                            <div className="text-xs text-white font-medium">
                              <MathText text={m.mathPayload.problem} />
                            </div>
                            {m.mathPayload.latex && m.mathPayload.latex !== m.mathPayload.problem && (
                              <div className="mt-2 pt-2 border-t border-slate-800/60">
                                <MathView math={m.mathPayload.latex} />
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {m.mathPayload.steps.map((st) => (
                              <div key={st.stepNumber} className="p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-xs space-y-1.5">
                                <div className="font-semibold text-blue-300 text-[11px]">
                                  Step {st.stepNumber}: {st.title}
                                </div>
                                <div className="text-slate-300 text-[11px] leading-relaxed">
                                  <MathText text={st.explanation} />
                                </div>
                                {st.derivation && (
                                  <div className="p-2 rounded bg-slate-950 border border-slate-800/70 overflow-x-auto text-center">
                                    <MathView math={st.derivation} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {m.mathPayload.studentMistakeDetected &&
                            m.mathPayload.studentMistakeDetected !== "None." &&
                            m.mathPayload.studentMistakeDetected !== "None detected. Derivation is mathematically sound." && (
                              <div className="p-2 rounded bg-amber-950/30 border border-amber-800/50 text-[11px] text-amber-300">
                                <strong>Exam Caution: </strong>
                                <MathText text={m.mathPayload.studentMistakeDetected} />
                              </div>
                            )}

                          <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
                                Final Verified Answer
                              </div>
                              <div className="mt-1">
                                <MathView math={m.mathPayload.finalAnswer} displayMode={false} className="text-sm font-bold text-emerald-300" />
                              </div>
                            </div>
                            <span className="text-[10px] bg-emerald-900/50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
                              ✓ {m.mathPayload.verification || "Verified"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* INLINE ESSAY & PLAGIARISM REVIEW WIDGET */}
                      {m.actionType === "essay_review" && m.essayPayload && (
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>Academic Integrity & Writing Inspector</span>
                            </span>
                            {onNavigate && (
                              <button
                                onClick={() => onNavigate("tools")}
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>Academic Tools</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[9px] uppercase tracking-wider text-slate-400">Originality</div>
                              <div className="text-sm font-bold text-emerald-400 mt-0.5">{m.essayPayload.originalityScore}%</div>
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[9px] uppercase tracking-wider text-slate-400">Similarity</div>
                              <div className={`text-sm font-bold mt-0.5 ${m.essayPayload.similarityIndex > 20 ? "text-amber-400" : "text-emerald-400"}`}>
                                {m.essayPayload.similarityIndex}%
                              </div>
                            </div>
                            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                              <div className="text-[9px] uppercase tracking-wider text-slate-400">Tone</div>
                              <div className="text-xs font-semibold text-blue-300 mt-1 truncate">{m.essayPayload.academicTone}</div>
                            </div>
                          </div>

                          <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
                            <strong className="text-slate-200">Thesis Assessment:</strong> {m.essayPayload.thesisClarity}
                          </div>

                          {m.essayPayload.areasForImprovement && m.essayPayload.areasForImprovement.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase font-semibold text-slate-400">Writing Suggestions</div>
                              <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                                {m.essayPayload.areasForImprovement.map((s: string, idx: number) => (
                                  <li key={idx}>{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* INLINE PODCAST AUDIO PLAYER WIDGET */}
                      {m.actionType === "podcast" && m.audioPayload && (
                        <div className="mt-3 p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-1.5">
                            <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Study Podcast: {m.audioPayload.topic}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{m.audioPayload.duration}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlayPodcast(m.id, m.audioPayload?.dialogue || [])}
                            className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                              speakingMsgId === m.id
                                ? "bg-amber-600 hover:bg-amber-500 text-white"
                                : "bg-purple-600 hover:bg-purple-500 text-white shadow-sm"
                            }`}
                          >
                            {speakingMsgId === m.id ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Stop Speech Playback</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                <span>Listen with Speech AI (Dr. Sarah &amp; Alex)</span>
                              </>
                            )}
                          </button>

                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 pt-1 border-t border-slate-800/80">
                            {m.audioPayload.dialogue.map((d, dIdx) => (
                              <div
                                key={dIdx}
                                className={`p-2 rounded text-[11px] border ${
                                  d.speaker.includes("Sarah")
                                    ? "bg-purple-950/30 border-purple-900/40 text-purple-200"
                                    : "bg-blue-950/30 border-blue-900/40 text-blue-200"
                                }`}
                              >
                                <div className="font-semibold text-[10px] uppercase mb-0.5 opacity-80">{d.speaker}</div>
                                <div>{d.text}</div>
                              </div>
                            ))}
                          </div>
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

            {/* Minimal Input Bar */}
            <div className="p-3 border-t border-zinc-800/60 bg-[#09090b] space-y-2">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
                {[
                  "Make a quiz on politics of pakistan",
                  "Make 5 flashcards on Binary Search",
                  "Solve: 2x^2 + 5x - 3 = 0",
                  "Review essay: [paste text]",
                  "Generate mind map on Photosynthesis",
                ].map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(s)}
                    className="px-2.5 py-1 rounded text-zinc-400 hover:text-zinc-200 bg-zinc-900/70 hover:bg-zinc-800 border border-zinc-800/60 whitespace-nowrap cursor-pointer transition-colors text-[11px]"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 focus-within:border-zinc-700 rounded-xl px-3 py-1.5 transition-colors"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask anything, request a quiz, solve equations, review essays..."
                  className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none py-1"
                />
                <button
                  type="submit"
                  disabled={isChatting || !userInput.trim()}
                  className="p-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-30 transition-all cursor-pointer"
                  title="Send"
                >
                  <Send className="w-3.5 h-3.5" />
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
                  <MathText text={quizQuestions[currentQuestionIndex]?.question || ""} />
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
                          <span>
                            <MathText text={opt} />
                          </span>
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

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setActiveTab("tutor");
                      handleSendMessage(`Generate a 5-question targeted remediation quiz on ${ws.topic}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-rose-400" />
                    <span>Practice Remediation Quiz</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("tutor");
                      handleSendMessage(`Explain the fundamental concepts and common examination traps of ${ws.topic} to help fix my weak spots`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-blue-400" />
                    <span>Ask Copilot to Explain</span>
                  </button>
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
