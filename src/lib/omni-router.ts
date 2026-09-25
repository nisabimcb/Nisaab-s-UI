import { GoogleGenAI } from '@google/genai';
import {
  OmniRouteRequest,
  OmniRouteResponse,
  AIProvider,
  SocraticMessage,
  StudySummary,
  QuizQuestion,
  MindMapData,
  WeakSpotRecord,
  WebSearchSource,
} from '@/types/stem';

const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const DEFAULT_OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const DEFAULT_LOCAL_MODEL = process.env.LOCAL_MODEL_NAME || 'qwen2.5:14b';

export async function processOmniRoute(
  request: OmniRouteRequest
): Promise<OmniRouteResponse> {
  const startTime = Date.now();
  const provider: AIProvider = request.config?.provider || (DEFAULT_GEMINI_KEY ? 'gemini' : 'demo_fallback');
  const geminiApiKey = request.config?.geminiApiKey || DEFAULT_GEMINI_KEY;
  const ollamaUrl = request.config?.ollamaBaseUrl || DEFAULT_OLLAMA_URL;
  const localModel = request.config?.localModelName || DEFAULT_LOCAL_MODEL;
  const enableWebSearch = request.config?.enableWebSearch ?? true;
  const subject = request.subject || 'STEM';

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
          data: { status: 'Connected to Google Gemini (Web Search Grounding Supported).' },
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
      return {
        success: true,
        providerUsed: 'demo_fallback',
        latencyMs: 10,
        data: {
          status: 'Local Student Engine Active. Fast response on any custom topic or note.',
        },
      };
    }
  }

  // 2. Try executing with selected provider
  try {
    if (provider === 'gemini' && geminiApiKey) {
      return await executeWithGemini(request, geminiApiKey, enableWebSearch, startTime);
    } else if (provider === 'qwen_local') {
      return await executeWithOllama(request, ollamaUrl, localModel, startTime);
    }
  } catch (err) {
    console.warn(`[OmniRouter] Provider ${provider} failed, using Student Fallback:`, err);
  }

  // 3. Dynamic User-Driven Fallback Engine
  return executeWithDynamicFallback(request, startTime);
}

// -------------------------------------------------------------
// Google Gemini with Web Search Grounding
// -------------------------------------------------------------
async function executeWithGemini(
  request: OmniRouteRequest,
  apiKey: string,
  enableWebSearch: boolean,
  startTime: number
): Promise<OmniRouteResponse> {
  const ai = new GoogleGenAI({ apiKey });
  const subject = request.subject || 'STEM';
  const tools = enableWebSearch ? [{ googleSearch: {} }] : undefined;

  if (request.action === 'chat') {
    const prompt = `You are a high-level Student AI Assistant & Socratic Mentor for ${subject}.
${enableWebSearch ? 'You have access to Google Search to look up the latest live information, scientific research, board past papers, and solutions.' : ''}
Student's study material/notes context:
"""${request.context || 'No specific document attached. Use general STEM knowledge and live web search.'}"""

Student message: "${request.userMessage || 'Explain this topic'}"

Instructions:
1. Provide a comprehensive, crystal-clear explanation grounded in the user's material and live web sources.
2. If web search was used, mention key findings with direct relevance.
3. Suggest 2 interactive follow-up questions to test understanding.`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: tools ? { tools } : undefined,
    });

    const text = result.text || 'I analyzed your request and notes.';
    const webSources: WebSearchSource[] = extractWebSources(result);

    const message: SocraticMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      webSources: webSources.length > 0 ? webSources : undefined,
      guidedQuestions: [
        'How would you apply this in an exam numerical or real-world problem?',
        'What is the core prerequisite principle underlying this concept?',
      ],
    };

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: message,
      webSources: webSources,
    };
  }

  if (request.action === 'synthesize') {
    const prompt = `You are an expert academic research synthesizer.
Analyze this study material uploaded by the student:
"""${request.context || request.topic || 'General notes'}"""

Generate an in-depth study brief. Return ONLY valid JSON with this exact schema:
{
  "executiveSummary": "Concise high-impact summary of the material",
  "keyFormulasAndDefinitions": ["key concept 1", "key concept 2", "key formula 3"],
  "boardExamPitfalls": ["common mistake students make in exams 1", "misconception 2"],
  "suggestedReviewQuestions": ["practice question 1", "practice question 2"]
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: tools ? { tools } : undefined,
    });

    const parsed = cleanAndParseJSON<StudySummary>(result.text || '', {
      executiveSummary: 'Synthesized study brief based on your custom notes.',
      keyFormulasAndDefinitions: ['Key principle extracted from your material'],
      boardExamPitfalls: ['Ensure units and sign conventions are carefully checked.'],
      suggestedReviewQuestions: ['Derive the primary relationship from first principles.'],
    });

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  if (request.action === 'quiz') {
    const prompt = `Generate 5 interactive multiple-choice quiz questions based on the following student material or topic:
Topic: "${request.topic || subject}"
Notes context: """${request.context || ''}"""

Return ONLY a valid JSON array of 5 questions with this exact structure:
[
  {
    "id": "q1",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Clear explanation of why this answer is correct",
    "sloReference": "Standard Learning Objective",
    "difficulty": "Application"
  }
]`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = cleanAndParseJSON<QuizQuestion[]>(result.text || '', [
      {
        id: 'q1',
        question: `What is the primary governing principle of ${request.topic || subject}?`,
        options: ['Conservation of energy', 'Thermodynamic equilibrium', 'Linear transformation', 'Entropy maximization'],
        correctIndex: 0,
        explanation: 'Fundamental laws require energy conservation across isolated systems.',
        sloReference: `${subject.toUpperCase()} Core Standard`,
        difficulty: 'Conceptual',
      },
    ]);

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  if (request.action === 'mindmap') {
    const prompt = `Generate a concept mind map (nodes and links) for student study on topic: "${request.topic || subject}".
Material: """${request.context || ''}"""

Return ONLY valid JSON with this exact structure:
{
  "topic": "${request.topic || subject}",
  "subject": "${subject}",
  "nodes": [
    { "id": "1", "label": "Main Topic", "category": "core", "description": "Core foundation" },
    { "id": "2", "label": "Prerequisite Concept", "category": "prerequisite", "description": "Required background" },
    { "id": "3", "label": "Exam Focus Area", "category": "exam_focus", "description": "High-yield exam topic" },
    { "id": "4", "label": "Practical Application", "category": "application", "description": "Real world use" }
  ],
  "links": [
    { "source": "1", "target": "2", "relation": "Builds on" },
    { "source": "1", "target": "3", "relation": "Assessed in" },
    { "source": "1", "target": "4", "relation": "Applies to" }
  ]
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = cleanAndParseJSON<MindMapData>(result.text || '', {
      topic: request.topic || subject,
      subject: subject,
      nodes: [
        { id: '1', label: request.topic || subject, category: 'core', description: 'Core subject node' },
        { id: '2', label: 'Fundamental Theories', category: 'prerequisite', description: 'Underlying principles' },
        { id: '3', label: 'Board Exam Problems', category: 'exam_focus', description: 'Numerical and derivation focus' },
      ],
      links: [
        { source: '1', target: '2', relation: 'Founded upon' },
        { source: '1', target: '3', relation: 'Tested via' },
      ],
    });

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  if (request.action === 'audio_script') {
    const prompt = `Create a lively, educational 2-person dialogue (Dr. Sarah and Alex) breaking down this student's topic: "${request.topic || subject}".
Notes: """${request.context || ''}"""

Return ONLY valid JSON:
{
  "id": "pod-custom",
  "topic": "${request.topic || subject}",
  "subject": "${subject}",
  "duration": "2 min",
  "dialogue": [
    { "speaker": "Dr. Sarah (Concept Lead)", "text": "Welcome to our study overview. Today Alex and I are diving into...", "timestamp": "0:00" },
    { "speaker": "Alex (Student Fellow)", "text": "Thanks Dr. Sarah! What is the most critical concept students need to master here?", "timestamp": "0:15" },
    { "speaker": "Dr. Sarah (Concept Lead)", "text": "The key is understanding...", "timestamp": "0:30" }
  ]
}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = cleanAndParseJSON(result.text || '', {
      id: 'pod-custom',
      topic: request.topic || subject,
      subject: subject,
      duration: '2 min',
      dialogue: [
        {
          speaker: 'Dr. Sarah (Concept Lead)',
          text: `Welcome! Let's explore ${request.topic || subject} together.`,
          timestamp: '0:00',
        },
        {
          speaker: 'Alex (Student Fellow)',
          text: 'What are the main insights from these study notes?',
          timestamp: '0:15',
        },
        {
          speaker: 'Dr. Sarah (Concept Lead)',
          text: 'Pay close attention to first principles and key equations.',
          timestamp: '0:30',
        },
      ],
    });

    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  return executeWithDynamicFallback(request, startTime);
}

// -------------------------------------------------------------
// Local Ollama Execution
// -------------------------------------------------------------
async function executeWithOllama(
  request: OmniRouteRequest,
  baseUrl: string,
  model: string,
  startTime: number
): Promise<OmniRouteResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  const prompt = `[Local Qwen Tutor] User asks: ${
    request.userMessage || request.topic || 'Explain core principles'
  }. Context: ${request.context || ''}`;

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
        sourceId: 'local-qwen',
        sourceTitle: `Local Qwen 14B (${model})`,
        snippet: 'Generated 100% offline on your device.',
        confidence: 0.95,
      },
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
// Dynamic User-Driven Fallback Engine
// -------------------------------------------------------------
function executeWithDynamicFallback(
  request: OmniRouteRequest,
  startTime: number
): OmniRouteResponse {
  const query = request.userMessage || request.topic || 'STEM Concept';
  const context = request.context || '';

  if (request.action === 'chat') {
    const message: SocraticMessage = {
      id: `msg-local-${Date.now()}`,
      role: 'assistant',
      content: `I've analyzed your question regarding "${query}":

${context ? `From your uploaded notes:\n• Key Concept: ${context.slice(0, 200)}...\n` : ''}
Key Academic Insights:
1. **Core Mechanism**: Break the concept down into initial state, transformation rules, and boundary conditions.
2. **Formula Application**: Verify all units match standard SI dimensions before computing numerical values.
3. **Common Board Pitfall**: Avoid mixing up sign conventions or failing to convert units (e.g. Celsius to Kelvin).

What specific step would you like to derive next?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      guidedQuestions: [
        'How would you verify this result with an alternative method?',
        'Can you formulate the boundary condition for this case?',
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
    const summary: StudySummary = {
      executiveSummary: context
        ? `Executive synthesis of: "${context.slice(0, 160)}..."`
        : `Executive study brief for ${request.topic || 'Your Custom Notes'}.`,
      keyFormulasAndDefinitions: [
        'Conservation of State: Total input matches total output across closed boundaries',
        'Rate Law: dx/dt is directly proportional to driving potential',
        'Equilibrium Threshold: ΔG = 0 or net force = 0',
      ],
      boardExamPitfalls: [
        'Neglecting unit conversions in numerical calculations',
        'Confusing empirical rate orders with theoretical molecularity',
      ],
      suggestedReviewQuestions: [
        `Explain the fundamental derivation of ${request.topic || 'the topic'}.`,
        'Solve for unknown variables using standard boundary equations.',
      ],
    };

    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: summary,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'quiz') {
    const topic = request.topic || 'STEM Practice';
    const quiz: QuizQuestion[] = [
      {
        id: 'q1',
        question: `In the study of ${topic}, what is the critical initial condition?`,
        options: ['State equilibrium', 'Non-zero driving potential', 'Constant velocity', 'Adiabatic boundary'],
        correctIndex: 1,
        explanation: 'A non-zero driving potential is required to initiate dynamic transformation.',
        sloReference: `${topic} - SLO 1`,
        difficulty: 'Conceptual',
      },
      {
        id: 'q2',
        question: `When solving numerical problems on ${topic}, which conversion is most commonly required?`,
        options: ['Standard SI unit normalization', 'Logarithmic scale inversion', 'Scalar to vector projection', 'Dimensional parity check'],
        correctIndex: 0,
        explanation: 'SI units must be consistently maintained throughout all calculation stages.',
        sloReference: `${topic} - SLO 2`,
        difficulty: 'Application',
      },
      {
        id: 'q3',
        question: `Which factor directly increases the efficiency of ${topic}?`,
        options: ['Minimizing parasitic resistance/heat loss', 'Increasing ambient entropy', 'Lowering source potential', 'Adding uncalibrated mass'],
        correctIndex: 0,
        explanation: 'Minimizing irreversibility directly improves system efficiency.',
        sloReference: `${topic} - SLO 3`,
        difficulty: 'Analytical',
      },
    ];

    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: quiz,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'mindmap') {
    const topic = request.topic || 'STEM Study Topic';
    const mindmap: MindMapData = {
      topic: topic,
      subject: request.subject || 'STEM',
      nodes: [
        { id: '1', label: topic, category: 'core', description: 'Central student study topic' },
        { id: '2', label: 'Prerequisites & Definitions', category: 'prerequisite', description: 'Required fundamental principles' },
        { id: '3', label: 'Board Exam Numerical Focus', category: 'exam_focus', description: 'Key formulas and derivations' },
        { id: '4', label: 'Real-World Applications', category: 'application', description: 'Practical implementations' },
      ],
      links: [
        { source: '1', target: '2', relation: 'Derived from' },
        { source: '1', target: '3', relation: 'Examined through' },
        { source: '1', target: '4', relation: 'Applied in' },
      ],
    };

    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: mindmap,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'audio_script') {
    const topic = request.topic || 'Your Custom Notes';
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: {
        id: 'pod-user',
        topic: topic,
        subject: request.subject || 'STEM',
        duration: '2 min',
        dialogue: [
          {
            speaker: 'Dr. Sarah (Concept Lead)',
            text: `Welcome to our student study breakdown of ${topic}!`,
            timestamp: '0:00',
          },
          {
            speaker: 'Alex (Student Fellow)',
            text: `Thanks Dr. Sarah! What is the main highlight from the student notes?`,
            timestamp: '0:12',
          },
          {
            speaker: 'Dr. Sarah (Concept Lead)',
            text: `The most important takeaway is connecting the core derivation with practical exam problems.`,
            timestamp: '0:26',
          },
        ],
      },
      isOfflineFallback: true,
    };
  }

  return {
    success: true,
    providerUsed: 'demo_fallback',
    latencyMs: Date.now() - startTime,
    data: { status: 'Processed safely.' },
    isOfflineFallback: true,
  };
}

// -------------------------------------------------------------
// Helper: Extract Web Sources from Gemini GroundingMetadata
// -------------------------------------------------------------
function extractWebSources(result: any): WebSearchSource[] {
  const sources: WebSearchSource[] = [];
  try {
    const candidate = result.candidates?.[0];
    const metadata = candidate?.groundingMetadata;
    if (metadata?.groundingChunks) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      }
    }
  } catch (e) {
    // Ignore extraction errors
  }
  return sources;
}

// -------------------------------------------------------------
// Helper: Parse JSON safely
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
  } catch {
    return fallback;
  }
}
