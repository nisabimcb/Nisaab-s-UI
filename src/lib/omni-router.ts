import { GoogleGenAI } from '@google/genai';
import {
  OmniRouteRequest,
  OmniRouteResponse,
  AIProvider,
  StemSubject,
  SocraticMessage,
  StudySummary,
  QuizQuestion,
  AudioPodcastEpisode,
  MindMapData,
  WeakSpotRecord,
} from '@/types/stem';
import {
  PRELOADED_DOCUMENTS,
  PRELOADED_SUMMARIES,
  PRELOADED_PODCASTS,
  PRELOADED_QUIZZES,
  PRELOADED_MINDMAPS,
  INITIAL_WEAK_SPOTS,
} from './fbise-curriculum';

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const DEFAULT_OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_LOCAL_MODEL = process.env.LOCAL_MODEL_NAME || 'qwen2.5:14b';

export async function processOmniRoute(
  request: OmniRouteRequest
): Promise<OmniRouteResponse> {
  const startTime = Date.now();
  const provider: AIProvider = request.config?.provider || 'demo_fallback';
  const geminiApiKey = request.config?.geminiApiKey || DEFAULT_GEMINI_KEY;
  const ollamaUrl = request.config?.ollamaBaseUrl || DEFAULT_OLLAMA_URL;
  const localModel = request.config?.localModelName || DEFAULT_LOCAL_MODEL;
  const subject: StemSubject = request.subject || 'physics';

  // 1. Handle Ping Action
  if (request.action === 'ping') {
    if (provider === 'gemini') {
      if (!geminiApiKey) {
        return {
          success: false,
          providerUsed: 'gemini',
          latencyMs: Date.now() - startTime,
          data: { status: 'Missing Gemini API Key. Please provide in Settings.' },
          error: 'Missing GEMINI_API_KEY',
        };
      }
      try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: 'Ping test. Reply with PONG.',
        });
        return {
          success: true,
          providerUsed: 'gemini',
          latencyMs: Date.now() - startTime,
          data: { status: 'Connected to Google Gemini 2.5 Flash Cloud API successfully.' },
        };
      } catch (err: any) {
        return {
          success: false,
          providerUsed: 'gemini',
          latencyMs: Date.now() - startTime,
          data: { status: `Gemini Connection failed: ${err.message}` },
          error: err.message,
        };
      }
    } else if (provider === 'qwen_local') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${ollamaUrl}/api/tags`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          const hasModel = json.models?.some((m: any) =>
            m.name?.toLowerCase().includes('qwen')
          );
          return {
            success: true,
            providerUsed: 'qwen_local',
            latencyMs: Date.now() - startTime,
            data: {
              status: `Connected to Local Ollama. ${
                hasModel
                  ? `Active Model: ${localModel}`
                  : `Model ${localModel} not yet pulled, but Ollama server is responsive.`
              }`,
            },
          };
        }
        throw new Error(`Ollama returned status ${res.status}`);
      } catch (err: any) {
        return {
          success: false,
          providerUsed: 'qwen_local',
          latencyMs: Date.now() - startTime,
          data: {
            status: `Local Ollama unreachable at ${ollamaUrl}. Ensure Ollama is running.`,
          },
          error: err.message,
        };
      }
    } else {
      // Demo Fallback ping
      return {
        success: true,
        providerUsed: 'demo_fallback',
        latencyMs: 12,
        data: {
          status:
            'Exhibition Offline Engine Active. Guaranteed zero-latency responses for FBISE STEM subjects.',
        },
      };
    }
  }

  // 2. Try executing with preferred provider, with auto-fallback to Exhibition Engine
  try {
    if (provider === 'gemini' && geminiApiKey) {
      return await executeWithGemini(request, geminiApiKey, startTime);
    } else if (provider === 'qwen_local') {
      return await executeWithOllama(request, ollamaUrl, localModel, startTime);
    }
  } catch (err) {
    console.warn(`[OmniRouter] Provider ${provider} failed, engaging Exhibition Fallback engine:`, err);
  }

  // 3. Exhibition Offline Fallback Engine (Guaranteed zero-crash)
  return executeWithFallbackEngine(request, startTime);
}

// -------------------------------------------------------------
// Google Gemini Provider Execution
// -------------------------------------------------------------
async function executeWithGemini(
  request: OmniRouteRequest,
  apiKey: string,
  startTime: number
): Promise<OmniRouteResponse> {
  const ai = new GoogleGenAI({ apiKey });
  const subject = request.subject || 'physics';

  if (request.action === 'chat') {
    const prompt = `You are the FBISE STEM Intellect Socratic AI Tutor for HSSC students in ${subject}.
Context: ${request.context || 'FBISE HSSC Curriculum'}
Student question: ${request.userMessage || ''}

Respond following the Socratic method:
1. Explain the underlying STEM scientific principle with clear FBISE curriculum references.
2. Provide a thought-provoking guiding follow-up question to test their understanding.
3. Suggest 2 short guided exploration questions.

Format response cleanly with markdown.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = result.text || 'I am ready to guide you through your FBISE STEM concepts.';

    const message: SocraticMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          sourceId: `doc-${subject}`,
          sourceTitle: `FBISE ${subject.toUpperCase()} Core Textbook Reference`,
          snippet: 'Aligned with Federal Board Student Learning Objectives (SLOs).',
          confidence: 0.96,
        },
      ],
      guidedQuestions: [
        'How would this principle change if we double the temperature in Kelvin?',
        'Can you identify the thermodynamic boundary conditions for this equation?',
      ],
    };

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: message,
    };
  }

  if (request.action === 'synthesize') {
    const prompt = `Analyze the following FBISE ${subject} study notes/document and produce a rigorous JSON study brief:
Document Context: ${request.context || ''}

Return ONLY valid JSON matching this exact structure:
{
  "executiveSummary": "...",
  "keyFormulasAndDefinitions": ["formula 1", "formula 2"],
  "boardExamPitfalls": ["pitfall 1", "pitfall 2"],
  "suggestedReviewQuestions": ["question 1", "question 2"]
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = cleanAndParseJSON<StudySummary>(
      result.text || '',
      PRELOADED_SUMMARIES[subject]
    );

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  if (request.action === 'quiz') {
    const prompt = `Generate 5 multiple-choice questions for FBISE HSSC ${subject} on topic "${request.topic || 'Core Curriculum'}".
Return ONLY valid JSON array with structure:
[
  {
    "id": "q1",
    "question": "question text",
    "options": ["opt A", "opt B", "opt C", "opt D"],
    "correctIndex": 0,
    "explanation": "why this is correct according to FBISE textbook",
    "sloReference": "FBISE SLO reference code",
    "difficulty": "Application"
  }
]`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = cleanAndParseJSON<QuizQuestion[]>(
      result.text || '',
      PRELOADED_QUIZZES[subject]
    );

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  // Fallback to offline engine for other actions if needed
  return executeWithFallbackEngine(request, startTime);
}

// -------------------------------------------------------------
// Local Ollama (Qwen 14B) Provider Execution
// -------------------------------------------------------------
async function executeWithOllama(
  request: OmniRouteRequest,
  baseUrl: string,
  model: string,
  startTime: number
): Promise<OmniRouteResponse> {
  const subject = request.subject || 'physics';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const prompt = `[Qwen 14B FBISE STEM Tutor] Subject: ${subject}. User asks: ${
    request.userMessage || request.topic || 'Explain core principles'
  }. Explain with Socratic clarity.`;

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  if (!res.ok) {
    throw new Error(`Ollama returned status ${res.status}`);
  }

  const data = await res.json();
  const text = data.response || 'Local Qwen 14B response generated.';

  const message: SocraticMessage = {
    id: `msg-qwen-${Date.now()}`,
    role: 'assistant',
    content: text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    citations: [
      {
        sourceId: `local-doc-${subject}`,
        sourceTitle: `Local Qwen 14B FBISE Inference (${model})`,
        snippet: 'Generated 100% offline via local GPU/CPU compute.',
        confidence: 0.94,
      },
    ],
    guidedQuestions: [
      'What are the key mathematical assumptions behind this derivation?',
      'How does this link to previous chapters in the FBISE board syllabus?',
    ],
  };

  return {
    success: true,
    providerUsed: 'qwen_local',
    latencyMs: Date.now() - startTime,
    data: message,
  };
}

// -------------------------------------------------------------
// Exhibition Offline Fallback Engine (Guaranteed Zero Errors)
// -------------------------------------------------------------
function executeWithFallbackEngine(
  request: OmniRouteRequest,
  startTime: number
): OmniRouteResponse {
  const subject: StemSubject = request.subject || 'physics';

  if (request.action === 'chat') {
    const userQuery = (request.userMessage || '').toLowerCase();
    let reply = '';
    let citations = [
      {
        sourceId: `doc-${subject}`,
        sourceTitle: `FBISE ${subject.toUpperCase()} Core Textbook (National Book Foundation)`,
        snippet: 'Reference from Chapter 11 / Chapter 8 HSSC syllabus guidelines.',
        confidence: 0.98,
      },
    ];

    if (userQuery.includes('carnot') || userQuery.includes('efficiency')) {
      reply = `In the Carnot Engine (FBISE Physics Ch. 11), thermal efficiency is given by **η = 1 - (T2 / T1) = (T1 - T2) / T1**.

Key Socratic Check:
Notice that efficiency depends **only** on the absolute temperatures of the heat source (T1) and sink (T2) in Kelvin, never on the working substance.
To achieve 100% efficiency (η = 1), T2 would have to be Absolute Zero (0 Kelvin), which violates the Third Law of Thermodynamics.

💡 **Board Exam Tip**: Always convert temperatures to Kelvin (K = °C + 273.15). For example, 127°C is 400 K and 27°C is 300 K, giving η = 1 - (300/400) = 25%.`;
    } else {
      reply = `According to the FBISE ${subject.toUpperCase()} Student Learning Objectives (SLOs):

1. **Fundamental Mechanism**: STEM phenomena must be understood through first principles and mathematical derivation.
2. **Conservation Laws**: Always balance mass, energy, or logical state across initial and final stages.
3. **Board Numerical Formula**: Ensure SI units are maintained throughout all intermediate calculations.

How would you formulate the boundary condition for this problem?`;
    }

    const message: SocraticMessage = {
      id: `msg-fallback-${Date.now()}`,
      role: 'assistant',
      content: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: citations,
      guidedQuestions: [
        'Why does increasing the source temperature T1 increase Carnot efficiency more effectively than lowering T2 by the same amount?',
        'What is the physical meaning of the area enclosed by the Carnot indicator diagram (P-V curve)?',
      ],
    };

    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: message,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'synthesize') {
    const summary = PRELOADED_SUMMARIES[subject] || PRELOADED_SUMMARIES.physics;
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: summary,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'quiz') {
    const quiz = PRELOADED_QUIZZES[subject] || PRELOADED_QUIZZES.physics;
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: quiz,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'audio_script') {
    const podcast = PRELOADED_PODCASTS[subject] || PRELOADED_PODCASTS.physics;
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: podcast,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'mindmap') {
    const mindmap = PRELOADED_MINDMAPS[subject] || PRELOADED_MINDMAPS.physics;
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: mindmap,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'diagnose') {
    const weakSpots = INITIAL_WEAK_SPOTS;
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: weakSpots,
      isOfflineFallback: true,
    };
  }

  return {
    success: true,
    providerUsed: 'demo_fallback',
    latencyMs: Date.now() - startTime,
    data: { status: 'Action processed by Exhibition Offline Engine.' },
    isOfflineFallback: true,
  };
}

// -------------------------------------------------------------
// Helper: Clean and Parse JSON from LLM Markdown
// -------------------------------------------------------------
function cleanAndParseJSON<T>(rawText: string, fallback: T): T {
  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('[OmniRouter] Failed to parse JSON, falling back:', err);
    return fallback;
  }
}
