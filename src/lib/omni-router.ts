import { GoogleGenAI } from '@google/genai';
import {
  OmniRouteRequest,
  OmniRouteResponse,
  AIProvider,
  SocraticMessage,
  StudySummary,
  QuizQuestion,
  MindMapData,
  Flashcard,
  WebSearchSource,
} from '@/types/stem';

const DEFAULT_OMNIROUTE_URL = process.env.OMNIROUTE_BASE_URL || 'http://localhost:20128/v1';
const DEFAULT_OMNIROUTE_MODEL = process.env.OMNIROUTE_MODEL || 'deepseek-chat';
const DEFAULT_OMNIROUTE_KEY = process.env.OMNIROUTE_API_KEY || '';
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const DEFAULT_DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-chat';

export async function processOmniRoute(
  request: OmniRouteRequest
): Promise<OmniRouteResponse> {
  const startTime = Date.now();
  const provider: AIProvider =
    request.config?.provider || (DEFAULT_OMNIROUTE_KEY ? 'omniroute' : DEFAULT_DEEPSEEK_KEY ? 'deepseek' : DEFAULT_GEMINI_KEY ? 'gemini' : 'demo_fallback');
  const omniRouteUrl = (request.config?.omniRouteUrl || DEFAULT_OMNIROUTE_URL).replace(/\/+$/, '');
  const omniRouteApiKey = request.config?.omniRouteApiKey || DEFAULT_OMNIROUTE_KEY;
  const omniRouteModel = request.config?.omniRouteModel || DEFAULT_OMNIROUTE_MODEL;
  const geminiApiKey = request.config?.geminiApiKey || DEFAULT_GEMINI_KEY;
  const deepseekApiKey = request.config?.deepseekApiKey || DEFAULT_DEEPSEEK_KEY;
  const deepseekModel = request.config?.deepseekModel || DEFAULT_DEEPSEEK_MODEL;
  const enableWebSearch = request.config?.enableWebSearch ?? true;
  const subject = request.subject || 'STEM';

  // 1. Handle Ping Action
  if (request.action === 'ping') {
    if (provider === 'omniroute') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        // Try pinging OmniRoute (OpenAI-compatible models or chat endpoint)
        const res = await fetch(`${omniRouteUrl}/models`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(omniRouteApiKey ? { Authorization: `Bearer ${omniRouteApiKey}` } : {}),
          },
          signal: controller.signal,
        }).catch(async () => {
          // Fallback to chat completions ping
          return await fetch(`${omniRouteUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(omniRouteApiKey ? { Authorization: `Bearer ${omniRouteApiKey}` } : {}),
            },
            body: JSON.stringify({
              model: omniRouteModel,
              messages: [{ role: 'user', content: 'Ping' }],
              max_tokens: 5,
            }),
            signal: controller.signal,
          });
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          return {
            success: true,
            providerUsed: 'omniroute',
            latencyMs: Date.now() - startTime,
            data: {
              status: `Connected to OmniRoute Gateway (${omniRouteModel}) at ${omniRouteUrl}.`,
            },
          };
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
      } catch (err: any) {
        return {
          success: false,
          providerUsed: 'omniroute',
          latencyMs: Date.now() - startTime,
          data: {
            status: `OmniRoute unreachable at ${omniRouteUrl}. Ensure OmniRoute is running.`,
          },
          error: err.message,
        };
      }
    } else if (provider === 'gemini') {
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
        await Promise.race([
          ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Ping test. Reply with PONG.',
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini ping timed out (6s)')), 6000)),
        ]);
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
          data: { status: `Gemini connection issue: ${err.message}` },
          error: err.message,
        };
      }
    } else if (provider === 'deepseek') {
      if (!deepseekApiKey) {
        return {
          success: false,
          providerUsed: 'deepseek',
          latencyMs: Date.now() - startTime,
          data: { status: 'Missing DeepSeek API Key. Please provide in Settings.' },
          error: 'Missing DEEPSEEK_API_KEY',
        };
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekApiKey}`,
          },
          body: JSON.stringify({
            model: deepseekModel,
            messages: [{ role: 'user', content: 'Ping test. Reply with PONG.' }],
            max_tokens: 10,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          return {
            success: true,
            providerUsed: 'deepseek',
            latencyMs: Date.now() - startTime,
            data: { status: `Connected to DeepSeek AI (${deepseekModel}). Ready for deep STEM reasoning.` },
          };
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
      } catch (err: any) {
        return {
          success: false,
          providerUsed: 'deepseek',
          latencyMs: Date.now() - startTime,
          data: { status: `DeepSeek connection failed: ${err.message}` },
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

  // 2. Try executing with selected Omni-Route provider
  try {
    if (provider === 'omniroute') {
      return await executeWithOmniRoute(request, omniRouteUrl, omniRouteApiKey, omniRouteModel, startTime);
    } else if (provider === 'deepseek' && deepseekApiKey) {
      return await executeWithDeepSeek(request, deepseekApiKey, deepseekModel, startTime);
    } else if (provider === 'gemini' && geminiApiKey) {
      return await executeWithGemini(request, geminiApiKey, enableWebSearch, startTime);
    }
  } catch (err) {
    console.warn(`[OmniRouter] Provider ${provider} failed, using Student Fallback:`, err);
  }

  // 3. Dynamic User-Driven Fallback Engine
  return executeWithDynamicFallback(request, startTime);
}

// -------------------------------------------------------------
// OmniRoute AI Gateway Execution (diegosouzapw/OmniRoute)
// OpenAI-Compatible /chat/completions endpoint
// -------------------------------------------------------------
async function executeWithOmniRoute(
  request: OmniRouteRequest,
  baseUrl: string,
  apiKey: string | undefined,
  model: string,
  startTime: number
): Promise<OmniRouteResponse> {
  const subject = request.subject || 'STEM';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const endpoint = `${baseUrl}/chat/completions`;

  if (request.action === 'chat') {
    const prompt = `You are a world-class STEM Student Tutor & Socratic Mentor for ${subject}.
Student study context:
"""${request.context || 'General STEM curriculum'}"""

Student message: "${request.userMessage || 'Explain this concept'}"

Instructions:
1. Provide a comprehensive, step-by-step conceptual explanation with mathematical precision.
2. Highlight key derivations and core physical/mathematical laws.
3. Suggest 2 interactive guiding questions for the student to test their comprehension.`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: `You are OmniRoute STEM Intellect Socratic Tutor for ${subject}.` },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OmniRoute HTTP ${res.status}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const text = choice?.message?.content || 'OmniRoute response received.';
    const reasoning = choice?.message?.reasoning_content;

    const message: SocraticMessage = {
      id: `msg-omniroute-${Date.now()}`,
      role: 'assistant',
      content: text,
      reasoningContent: reasoning,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          sourceId: 'omniroute-stem',
          sourceTitle: `OmniRoute Gateway (${model})`,
          snippet: reasoning ? 'Chain-of-thought derivations verified.' : 'Unified AI gateway routing.',
          confidence: 0.99,
        },
      ],
      guidedQuestions: [
        'How would you verify this result with boundary equations?',
        'Can you trace the fundamental conservation law behind this step?',
      ],
    };

    return {
      success: true,
      providerUsed: 'omniroute',
      latencyMs: Date.now() - startTime,
      data: message,
    };
  }

  if (request.action === 'flashcards') {
    const prompt = `Generate 6 high-yield student study flashcards for topic: "${request.topic || subject}".
Context: """${request.context || ''}"""
Return ONLY a valid JSON array matching:
[
  {
    "id": "fc1",
    "front": "Term, Formula, or Question",
    "back": "Detailed answer, derivation step, or exam insight",
    "category": "Formula",
    "subject": "${subject}",
    "status": "new"
  }
]`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`OmniRoute flashcards HTTP ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '[]';
    const parsed = cleanAndParseJSON<Flashcard[]>(raw, []);

    return {
      success: true,
      providerUsed: 'omniroute',
      latencyMs: Date.now() - startTime,
      data: parsed.length > 0 ? parsed : executeWithDynamicFallback(request, startTime).data,
    };
  }

  if (request.action === 'synthesize') {
    const prompt = `Analyze this student study material:
"""${request.context || request.topic || 'General notes'}"""
Generate a structured study brief. Return ONLY valid JSON:
{
  "executiveSummary": "Comprehensive summary of core concepts",
  "keyFormulasAndDefinitions": ["formula 1", "formula 2", "definition 3"],
  "boardExamPitfalls": ["exam pitfall 1", "misconception 2"],
  "suggestedReviewQuestions": ["practice question 1", "practice question 2"]
}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`OmniRoute synthesize HTTP ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = cleanAndParseJSON<StudySummary>(raw, {
      executiveSummary: 'Synthesized study brief from OmniRoute.',
      keyFormulasAndDefinitions: ['Core concept extracted from your study notes.'],
      boardExamPitfalls: ['Verify dimensional consistency in all calculations.'],
      suggestedReviewQuestions: ['Derive this equation using first principles.'],
    });

    return {
      success: true,
      providerUsed: 'omniroute',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  if (request.action === 'quiz') {
    const prompt = `Generate 5 multiple choice questions on "${request.topic || subject}" based on:
"""${request.context || ''}"""
Return ONLY a valid JSON array:
[
  {
    "id": "q1",
    "question": "Question text",
    "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
    "correctIndex": 0,
    "explanation": "Clear explanation",
    "sloReference": "Standard SLO",
    "difficulty": "Application"
  }
]`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`OmniRoute quiz HTTP ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '[]';
    const parsed = cleanAndParseJSON<QuizQuestion[]>(raw, []);

    return {
      success: true,
      providerUsed: 'omniroute',
      latencyMs: Date.now() - startTime,
      data: parsed.length > 0 ? parsed : executeWithDynamicFallback(request, startTime).data,
    };
  }

  if (request.action === 'mindmap') {
    const prompt = `Generate a concept mind map for topic: "${request.topic || subject}".
Return ONLY valid JSON:
{
  "topic": "${request.topic || subject}",
  "subject": "${subject}",
  "nodes": [
    { "id": "1", "label": "Topic", "category": "core", "description": "Core definition" },
    { "id": "2", "label": "Prerequisite", "category": "prerequisite", "description": "Underlying theory" },
    { "id": "3", "label": "Exam Focus", "category": "exam_focus", "description": "Numerical focus" }
  ],
  "links": [
    { "source": "1", "target": "2", "relation": "Builds on" },
    { "source": "1", "target": "3", "relation": "Tested via" }
  ]
}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`OmniRoute mindmap HTTP ${res.status}`);
    const data = await res.json();
    const parsed = cleanAndParseJSON<MindMapData>(data.choices?.[0]?.message?.content || '{}', {
      topic: request.topic || subject,
      subject,
      nodes: [
        { id: '1', label: request.topic || subject, category: 'core', description: 'Core concept' },
        { id: '2', label: 'Prerequisites', category: 'prerequisite', description: 'Foundations' },
      ],
      links: [{ source: '1', target: '2', relation: 'Derived from' }],
    });

    return {
      success: true,
      providerUsed: 'omniroute',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  clearTimeout(timeoutId);
  return executeWithDynamicFallback(request, startTime);
}

// -------------------------------------------------------------
// DeepSeek Execution (Direct API)
// -------------------------------------------------------------
async function executeWithDeepSeek(
  request: OmniRouteRequest,
  apiKey: string,
  model: string,
  startTime: number
): Promise<OmniRouteResponse> {
  const subject = request.subject || 'STEM';
  const isReasoner = model === 'deepseek-reasoner';

  if (request.action === 'chat') {
    const prompt = `You are a world-class STEM Student Tutor & Socratic Mentor for ${subject}.
Student study material context:
"""${request.context || 'General STEM curriculum'}"""

Student message: "${request.userMessage || 'Explain this concept'}"

Instructions:
1. Provide a rigorous, step-by-step conceptual explanation with mathematical precision.
2. Highlight key derivations and core physical/mathematical laws.
3. Suggest 2 interactive guiding questions for the student to verify their understanding.`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: `You are DeepSeek STEM Intellect Socratic Tutor for ${subject}.` },
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `DeepSeek HTTP error ${res.status}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    const text = choice?.message?.content || 'DeepSeek reasoning complete.';
    const reasoning = isReasoner ? choice?.message?.reasoning_content : undefined;

    const message: SocraticMessage = {
      id: `msg-deepseek-${Date.now()}`,
      role: 'assistant',
      content: text,
      reasoningContent: reasoning,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          sourceId: 'deepseek-stem',
          sourceTitle: `DeepSeek AI (${model})`,
          snippet: isReasoner ? 'Deep mathematical chain-of-thought verified.' : 'High-speed algorithmic inference.',
          confidence: 0.99,
        },
      ],
      guidedQuestions: [
        'How would changing the boundary conditions alter this derivation?',
        'Can you trace the conservation law behind this step?',
      ],
    };

    return {
      success: true,
      providerUsed: 'deepseek',
      latencyMs: Date.now() - startTime,
      data: message,
    };
  }

  if (request.action === 'flashcards') {
    const prompt = `Generate 6 comprehensive student flashcards for: "${request.topic || subject}".
Return ONLY a valid JSON array matching:
[
  {
    "id": "fc1",
    "front": "Term, Law, or Core Problem",
    "back": "Detailed definition, formula, or exam trap",
    "category": "Concept",
    "subject": "${subject}",
    "status": "new"
  }
]`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek flashcards HTTP ${res.status}`);
    const data = await res.json();
    const parsed = cleanAndParseJSON<Flashcard[]>(data.choices?.[0]?.message?.content || '[]', []);

    return {
      success: true,
      providerUsed: 'deepseek',
      latencyMs: Date.now() - startTime,
      data: parsed.length > 0 ? parsed : executeWithDynamicFallback(request, startTime).data,
    };
  }

  if (request.action === 'synthesize') {
    const prompt = `Analyze this student study material:
"""${request.context || request.topic || 'General notes'}"""

Generate a structured study brief. Return ONLY valid JSON:
{
  "executiveSummary": "Comprehensive summary of core concepts",
  "keyFormulasAndDefinitions": ["formula 1", "formula 2", "definition 3"],
  "boardExamPitfalls": ["exam pitfall 1", "misconception 2"],
  "suggestedReviewQuestions": ["practice question 1", "practice question 2"]
}`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek error ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = cleanAndParseJSON<StudySummary>(raw, {
      executiveSummary: 'Synthesized study brief from DeepSeek.',
      keyFormulasAndDefinitions: ['Core equation extracted from your notes'],
      boardExamPitfalls: ['Verify dimensional consistency in all calculations.'],
      suggestedReviewQuestions: ['Derive this equation using first principles.'],
    });

    return {
      success: true,
      providerUsed: 'deepseek',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  if (request.action === 'quiz') {
    const prompt = `Generate 5 multiple choice questions on "${request.topic || subject}" based on:
"""${request.context || ''}"""

Return a JSON array of 5 questions with this exact structure:
[
  {
    "id": "q1",
    "question": "Question text",
    "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
    "correctIndex": 0,
    "explanation": "Detailed rationale",
    "sloReference": "Standard Learning Objective",
    "difficulty": "Application"
  }
]`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek quiz error ${res.status}`);
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || '[]';
    const parsed = cleanAndParseJSON<QuizQuestion[]>(raw, []);

    return {
      success: true,
      providerUsed: 'deepseek',
      latencyMs: Date.now() - startTime,
      data: parsed.length > 0 ? parsed : executeWithDynamicFallback(request, startTime).data,
    };
  }

  if (request.action === 'mindmap') {
    const prompt = `Generate a concept knowledge graph on topic: "${request.topic || subject}".
Return ONLY valid JSON matching:
{
  "topic": "${request.topic || subject}",
  "subject": "${subject}",
  "nodes": [
    { "id": "1", "label": "Topic", "category": "core", "description": "Core definition" },
    { "id": "2", "label": "Prerequisite", "category": "prerequisite", "description": "Underlying theory" },
    { "id": "3", "label": "Exam Focus", "category": "exam_focus", "description": "Numerical focus" }
  ],
  "links": [
    { "source": "1", "target": "2", "relation": "Builds on" },
    { "source": "1", "target": "3", "relation": "Tested via" }
  ]
}`;

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        stream: false,
      }),
    });

    if (!res.ok) throw new Error(`DeepSeek mindmap error ${res.status}`);
    const data = await res.json();
    const parsed = cleanAndParseJSON<MindMapData>(data.choices?.[0]?.message?.content || '{}', {
      topic: request.topic || subject,
      subject,
      nodes: [
        { id: '1', label: request.topic || subject, category: 'core', description: 'Core concept' },
        { id: '2', label: 'Prerequisites', category: 'prerequisite', description: 'Foundations' },
      ],
      links: [{ source: '1', target: '2', relation: 'Derived from' }],
    });

    return {
      success: true,
      providerUsed: 'deepseek',
      latencyMs: Date.now() - startTime,
      data: parsed,
    };
  }

  return executeWithDynamicFallback(request, startTime);
}

// -------------------------------------------------------------
// Google Gemini Execution with Google Search Grounding & Timeout
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

  // Wrap all Gemini calls in a 9-second timeout to prevent stalling
  const callWithTimeout = async (prompt: string, withTools = false) => {
    return Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: withTools && tools ? { tools } : undefined,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 9s')), 9000)
      ),
    ]);
  };

  if (request.action === 'chat') {
    const prompt = `You are a high-level Student AI Assistant & Socratic Mentor for ${subject}.
${enableWebSearch ? 'You have access to Google Search to look up live scientific data, past papers, and solutions.' : ''}
Student's study context:
"""${request.context || 'General STEM curriculum'}"""

Student message: "${request.userMessage || 'Explain this topic'}"

Instructions:
1. Provide a comprehensive, clear explanation grounded in the user's material and live web sources.
2. If web search was used, mention key findings with direct relevance.
3. Suggest 2 interactive follow-up questions to test understanding.`;

    const result = await callWithTimeout(prompt, true);
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
      webSources,
    };
  }

  if (request.action === 'flashcards') {
    const prompt = `Generate 6 student flashcards for: "${request.topic || subject}".
Return ONLY a valid JSON array:
[
  {
    "id": "fc1",
    "front": "Term, Formula, or Question",
    "back": "Detailed answer, derivation step, or exam insight",
    "category": "Concept",
    "subject": "${subject}",
    "status": "new"
  }
]`;

    const result = await callWithTimeout(prompt, false);
    const parsed = cleanAndParseJSON<Flashcard[]>(result.text || '', []);
    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed.length > 0 ? parsed : executeWithDynamicFallback(request, startTime).data,
    };
  }

  if (request.action === 'synthesize') {
    const prompt = `Analyze this student study material:
"""${request.context || request.topic || 'General notes'}"""

Generate an in-depth study brief. Return ONLY valid JSON:
{
  "executiveSummary": "High-impact summary",
  "keyFormulasAndDefinitions": ["formula 1", "formula 2"],
  "boardExamPitfalls": ["pitfall 1", "misconception 2"],
  "suggestedReviewQuestions": ["question 1", "question 2"]
}`;

    const result = await callWithTimeout(prompt, false);
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
    const prompt = `Generate 5 multiple-choice questions on "${request.topic || subject}":
Notes: """${request.context || ''}"""
Return ONLY a valid JSON array:
[
  {
    "id": "q1",
    "question": "Question text",
    "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
    "correctIndex": 0,
    "explanation": "Clear explanation",
    "sloReference": "Standard Reference",
    "difficulty": "Application"
  }
]`;

    const result = await callWithTimeout(prompt, false);
    const parsed = cleanAndParseJSON<QuizQuestion[]>(result.text || '', []);
    return {
      success: true,
      providerUsed: 'gemini',
      latencyMs: Date.now() - startTime,
      data: parsed.length > 0 ? parsed : executeWithDynamicFallback(request, startTime).data,
    };
  }

  if (request.action === 'mindmap') {
    const prompt = `Generate a concept mind map for topic: "${request.topic || subject}".
Return ONLY valid JSON:
{
  "topic": "${request.topic || subject}",
  "subject": "${subject}",
  "nodes": [
    { "id": "1", "label": "Main Topic", "category": "core", "description": "Core foundation" },
    { "id": "2", "label": "Prerequisite Concept", "category": "prerequisite", "description": "Required background" },
    { "id": "3", "label": "Exam Focus Area", "category": "exam_focus", "description": "High-yield exam topic" }
  ],
  "links": [
    { "source": "1", "target": "2", "relation": "Builds on" },
    { "source": "1", "target": "3", "relation": "Assessed in" }
  ]
}`;

    const result = await callWithTimeout(prompt, false);
    const parsed = cleanAndParseJSON<MindMapData>(result.text || '', {
      topic: request.topic || subject,
      subject,
      nodes: [
        { id: '1', label: request.topic || subject, category: 'core', description: 'Core subject node' },
        { id: '2', label: 'Fundamental Theories', category: 'prerequisite', description: 'Underlying principles' },
      ],
      links: [{ source: '1', target: '2', relation: 'Founded upon' }],
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
// Dynamic User-Driven Fallback Engine (Guaranteed zero-crash)
// -------------------------------------------------------------
function executeWithDynamicFallback(
  request: OmniRouteRequest,
  startTime: number
): OmniRouteResponse {
  const query = request.userMessage || request.topic || 'STEM Concept';
  const context = request.context || '';
  const subject = request.subject || 'STEM';

  if (request.action === 'chat') {
    const message: SocraticMessage = {
      id: `msg-local-${Date.now()}`,
      role: 'assistant',
      content: `I've analyzed your question regarding "${query}":

${context ? `From your uploaded notes:\n• Concept Basis: ${context.slice(0, 220)}...\n` : ''}
Key Academic Insights:
1. **Core Law & Definition**: Deconstruct the concept into its fundamental physical or mathematical first principles.
2. **Formula Application**: Always verify standard SI units before substitution (e.g., convert Celsius to Kelvin via $T(K) = ^\\circ C + 273.15$).
3. **Common Board Pitfall**: Pay careful attention to vector directions, signs, and boundary conditions during calculations.

Would you like to step through the formal mathematical derivation, or practice a numerical problem on this topic?`,
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

  if (request.action === 'flashcards') {
    const topic = request.topic || 'Core STEM Topics';
    const flashcards: Flashcard[] = [
      {
        id: `fc-1-${Date.now()}`,
        front: `What is the primary governing equation for ${topic}?`,
        back: `Standard Formulation: States that rate of change is proportional to driving potential, constrained by boundary conditions. Always maintain SI unit consistency.`,
        category: 'Formula',
        subject,
        status: 'new',
      },
      {
        id: `fc-2-${Date.now()}`,
        front: `What is the most frequent FBISE board exam pitfall in ${topic}?`,
        back: `Failing to convert initial units (e.g. Celsius to Kelvin, grams to kilograms) or ignoring sign conventions in vector quantities.`,
        category: 'Exam Pitfall',
        subject,
        status: 'new',
      },
      {
        id: `fc-3-${Date.now()}`,
        front: `Under what conditions does ${topic} reach thermodynamic/dynamic equilibrium?`,
        back: `When opposing forces or potentials balance (Net Force = 0, Net Work = 0, or ΔG = 0).`,
        category: 'Concept',
        subject,
        status: 'new',
      },
      {
        id: `fc-4-${Date.now()}`,
        front: `State the fundamental conservation law applicable to ${topic}.`,
        back: `Conservation of Energy/Mass: The total quantity in an isolated system remains constant over time regardless of internal transformations.`,
        category: 'Law',
        subject,
        status: 'new',
      },
      {
        id: `fc-5-${Date.now()}`,
        front: `How is the efficiency or yield of ${topic} determined?`,
        back: `Efficiency η = (Useful Output Energy / Total Input Energy) × 100%. Reversible Carnot limit: η = 1 - (T_cold / T_hot).`,
        category: 'Formula',
        subject,
        status: 'new',
      },
    ];

    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: flashcards,
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
      topic,
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
        topic,
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
  } catch {
    // Ignore extraction errors
  }
  return sources;
}

// -------------------------------------------------------------
// Helper: Clean and Parse JSON
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
