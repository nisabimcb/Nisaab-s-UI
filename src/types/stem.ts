export type StemSubject = 'physics' | 'chemistry' | 'biology' | 'computer_science' | 'mathematics';

export interface StemSubjectInfo {
  id: StemSubject;
  name: string;
  code: string;
  grade?: string;
  totalChapters?: number;
  icon: string;
  color: string;
}

export interface NotebookDocument {
  id: string;
  subject: string;
  title: string;
  chapter: string;
  content: string;
  sourceType: 'textbook' | 'notes' | 'past_paper' | 'web_search';
  uploadedAt: string;
}

export interface Citation {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
  confidence: number;
  uri?: string;
}

export interface WebSearchSource {
  title: string;
  uri: string;
}

export interface StudySummary {
  executiveSummary: string;
  keyFormulasAndDefinitions: string[];
  boardExamPitfalls: string[];
  suggestedReviewQuestions: string[];
  webReferences?: WebSearchSource[];
}

export interface AudioPodcastSpeaker {
  speaker: 'Dr. Sarah (Concept Lead)' | 'Alex (Student Fellow)';
  text: string;
  timestamp: string;
}

export interface AudioPodcastEpisode {
  id: string;
  topic: string;
  subject: string;
  duration: string;
  dialogue: AudioPodcastSpeaker[];
}

export type AgentPersona = 'tutor' | 'explainer' | 'examiner' | 'math' | 'reviewer' | 'lecture';

export interface MathStep {
  stepNumber: number;
  title: string;
  derivation: string;
  explanation: string;
}

export interface MathSolution {
  problem: string;
  topic: string;
  subject: string;
  latex?: string;
  steps: MathStep[];
  finalAnswer: string;
  keyFormulas?: string[];
  verification?: string;
  studentMistakeDetected?: string;
}

export interface EssayReview {
  title: string;
  originalityScore: number; // 0 to 100
  similarityIndex: number; // 0 to 100
  wordCount: number;
  thesisClarity: string;
  academicTone: string;
  strengths: string[];
  areasForImprovement: string[];
  potentialMatches: {
    snippet: string;
    potentialSource: string;
    reason: string;
  }[];
}

export interface StudyMemo {
  id: string;
  content: string;
  tag: string;
  timestamp: string;
  date: string;
}

export interface SocraticMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoningContent?: string;
  citations?: Citation[];
  webSources?: WebSearchSource[];
  timestamp: string;
  guidedQuestions?: string[];
  actionType?: 'flashcards' | 'quiz' | 'mindmap' | 'note_created' | 'weakspots' | 'math_solution' | 'essay_review' | 'podcast';
  flashcardsPayload?: Flashcard[];
  quizPayload?: QuizQuestion[];
  mathPayload?: MathSolution;
  essayPayload?: EssayReview;
  audioPayload?: AudioPodcastEpisode;
  mindmapPayload?: MindMapData;
  promptType?: 'quiz_config' | 'flashcards_config' | 'math_prompt' | 'essay_prompt';
  promptTopic?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sloReference: string;
  difficulty: 'Conceptual' | 'Application' | 'Analytical';
}

export interface QuizResult {
  quizId: string;
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  missedQuestions: {
    question: string;
    studentAnswer: string;
    correctAnswer: string;
    remediationTip: string;
  }[];
}

export interface WeakSpotRecord {
  id: string;
  subject: string;
  topic: string;
  chapter: string;
  masteryPercentage: number;
  status: 'critical' | 'recovering' | 'mastered';
  lastAssessed: string;
  prescribedRemediation: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  category: 'core' | 'prerequisite' | 'application' | 'exam_focus';
  description: string;
}

export interface MindMapLink {
  source: string;
  target: string;
  relation: string;
}

export interface MindMapData {
  topic: string;
  subject: string;
  nodes: MindMapNode[];
  links: MindMapLink[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  subject: string;
  status: 'new' | 'learning' | 'mastered';
  // FSRS / Spaced Repetition (Nibomo inspiration)
  intervalDays?: number;
  easeFactor?: number;
  reviewCount?: number;
  nextReviewDate?: string;
}

export type AIProvider = 'gemini' | 'deepseek' | 'omniroute' | 'dual_model' | 'demo_fallback' | 'python_sympy' | 'python_vision_sympy' | 'python_backend';

export interface OmniRouteConfig {
  provider: AIProvider;

  // Direct Provider Keys (Gemini Primary, DeepSeek Alternate)
  geminiApiKey: string;
  deepseekApiKey: string;
  deepseekModel: 'deepseek-chat' | 'deepseek-reasoner';

  // OmniRoute Gateway (optional local proxy)
  omniRouteUrl: string; // e.g. "http://localhost:20128/v1"
  omniRouteApiKey?: string;
  omniRouteModel: string;

  enableWebSearch: boolean;
}

export interface VisionMathResult {
  transcribedExpression: string;
  latex: string;
  problemType: string;
  steps: MathStep[];
  finalAnswer: string;
  explanation: string;
  studentMistakeDetected?: string;
  confidence: number;
}

export interface OmniRouteRequest {
  action:
    | 'chat'
    | 'synthesize'
    | 'quiz'
    | 'audio_script'
    | 'mindmap'
    | 'diagnose'
    | 'flashcards'
    | 'ping'
    | 'math_solve'
    | 'review_essay'
    | 'lecture_notes'
    | 'md2anki'
    | 'vision_solve'
    | 'parse_pdf';
  subject?: string;
  topic?: string;
  context?: string;
  userMessage?: string;
  history?: SocraticMessage[];
  quizAnswers?: { questionId: string; selectedIndex: number }[];
  config?: Partial<OmniRouteConfig>;
  source?: 'uploaded' | 'outside' | 'mixed';
  count?: number;
  persona?: AgentPersona;
  mathExpression?: string;
  essayText?: string;
  markdownNotes?: string;
  imageData?: string;
  imageMimeType?: string;
  pdfData?: string;
  pdfFileName?: string;
}

export interface OmniRouteResponse {
  success: boolean;
  providerUsed: AIProvider;
  latencyMs: number;
  data: any;
  error?: string;
  isOfflineFallback?: boolean;
  webSources?: WebSearchSource[];
  route?: string;
}

