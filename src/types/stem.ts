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

export interface SocraticMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoningContent?: string;
  citations?: Citation[];
  webSources?: WebSearchSource[];
  timestamp: string;
  guidedQuestions?: string[];
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

export type AIProvider = 'gemini' | 'deepseek' | 'demo_fallback';

export interface OmniRouteConfig {
  provider: AIProvider;
  geminiApiKey: string;
  deepseekApiKey: string;
  deepseekModel: 'deepseek-chat' | 'deepseek-reasoner';
  enableWebSearch: boolean;
}

export interface OmniRouteRequest {
  action: 'chat' | 'synthesize' | 'quiz' | 'audio_script' | 'mindmap' | 'diagnose' | 'ping';
  subject?: string;
  topic?: string;
  context?: string;
  userMessage?: string;
  history?: SocraticMessage[];
  quizAnswers?: { questionId: string; selectedIndex: number }[];
  config?: Partial<OmniRouteConfig>;
}

export interface OmniRouteResponse {
  success: boolean;
  providerUsed: AIProvider;
  latencyMs: number;
  data: any;
  error?: string;
  isOfflineFallback?: boolean;
  webSources?: WebSearchSource[];
}
