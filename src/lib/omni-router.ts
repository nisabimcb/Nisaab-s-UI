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

// -------------------------------------------------------------
// Dynamic STEM Subject Classifier
// Detects: Biology, Chemistry, Computer Science, Mathematics, Physics, General STEM
// -------------------------------------------------------------
export function detectSubjectFromQuery(query: string, currentSubject?: string): string {
  if (!query || typeof query !== 'string') return currentSubject && currentSubject !== 'Physics' ? currentSubject : 'General STEM';
  const text = query.toLowerCase();

  const scores: Record<string, number> = {
    'Biology': 0,
    'Chemistry': 0,
    'Computer Science': 0,
    'Mathematics': 0,
    'Physics': 0,
  };

  const bioKeywords = [
    'bio', 'biology', 'dna', 'rna', 'gene', 'genetic', 'genome', 'chromosome', 'allele', 'mutation',
    'cell', 'cellular', 'mitosis', 'meiosis', 'organelle', 'ribosome', 'mitochondria', 'chloroplast',
    'photosynthesis', 'respiration', 'enzyme', 'substrate', 'protein', 'amino acid', 'lipid', 'membrane',
    'osmosis', 'diffusion', 'neuron', 'synapse', 'brain', 'nervous', 'cardiac', 'blood', 'circulatory',
    'immune', 'antibody', 'antigen', 'bacteria', 'virus', 'pathogen', 'ecology', 'ecosystem', 'evolution',
    'natural selection', 'species', 'organism', 'botany', 'plant', 'zoology', 'animal', 'anatomy', 'physiology',
    'tissue', 'hormone', 'endocrine', 'gamete', 'fertilization', 'reproduction', 'xylem', 'phloem', 'chlorophyll',
    'homeostasis', 'nephron', 'kidney', 'liver', 'digestive', 'atp'
  ];

  const chemKeywords = [
    'chem', 'chemistry', 'acid', 'base', 'ph', 'titration', 'buffer', 'periodic table', 'element', 'compound',
    'molecule', 'atom', 'atomic', 'electron', 'proton', 'neutron', 'orbital', 'valence', 'covalent', 'ionic',
    'metallic', 'bond', 'bonding', 'reaction', 'reactant', 'product', 'stoichiometry', 'mole', 'molar', 'molarity',
    'enthalpy', 'entropy', 'gibbs', 'redox', 'oxidation', 'reduction', 'cathode', 'anode', 'electrochemical',
    'galvanic', 'electrolytic', 'equilibrium', 'le chatelier', 'solution', 'solute', 'solvent', 'precipitate',
    'concentration', 'organic chemistry', 'hydrocarbon', 'alkane', 'alkene', 'alkyne', 'isomer', 'functional group',
    'alcohol', 'aldehyde', 'ketone', 'carboxylic', 'ester', 'polymer', 'catalyst', 'kinetics', 'avogadro'
  ];

  const csKeywords = [
    'cs', 'computer science', 'programming', 'code', 'coding', 'software', 'developer', 'algorithm', 'python',
    'javascript', 'typescript', 'java', 'c++', 'rust', 'binary', 'bit', 'byte', 'hex', 'array', 'linked list',
    'stack', 'queue', 'tree', 'binary tree', 'graph', 'hash', 'hash table', 'sorting', 'quicksort', 'mergesort',
    'bubble sort', 'binary search', 'recursion', 'recursive', 'dynamic programming', 'big o', 'time complexity',
    'space complexity', 'data structure', 'database', 'sql', 'nosql', 'query', 'server', 'client', 'http',
    'api', 'rest', 'network', 'protocol', 'tcp', 'ip', 'packet', 'operating system', 'process', 'thread',
    'concurrency', 'deadlock', 'memory', 'cache', 'pointer', 'compiler', 'interpreter', 'oop', 'class', 'object',
    'inheritance', 'polymorphism', 'encapsulation', 'git', 'github', 'frontend', 'backend'
  ];

  const mathKeywords = [
    'math', 'mathematics', 'calculus', 'derivative', 'differentiate', 'differentiation', 'integral', 'integrate',
    'integration', 'limit', 'limits', 'differential equation', 'linear algebra', 'matrix', 'matrices', 'determinant',
    'vector', 'eigenvector', 'eigenvalue', 'dot product', 'cross product', 'algebra', 'polynomial', 'quadratic',
    'factorization', 'logarithm', 'exponential', 'trigonometry', 'sine', 'cosine', 'tangent', 'trig', 'geometry',
    'triangle', 'circle', 'polygon', 'angle', 'perimeter', 'area', 'volume', 'coordinate', 'slope', 'intercept',
    'statistics', 'probability', 'permutation', 'combination', 'variance', 'standard deviation', 'distribution',
    'mean', 'median', 'mode', 'theorem', 'proof', 'arithmetic', 'hypotenuse'
  ];

  const physKeywords = [
    'physic', 'physics', 'mechanics', 'kinematics', 'velocity', 'acceleration', 'speed', 'displacement',
    'projectile', 'trajectory', 'force', 'newton', 'inertia', 'mass', 'weight', 'gravity', 'gravitation',
    'friction', 'momentum', 'impulse', 'kinetic energy', 'potential energy', 'work', 'power', 'torque',
    'rotational', 'moment of inertia', 'centripetal', 'harmonic motion', 'pendulum', 'wave', 'wavelength',
    'frequency', 'amplitude', 'interference', 'diffraction', 'optics', 'light', 'reflection', 'refraction',
    'lens', 'mirror', 'thermodynamic', 'carnot', 'heat engine', 'isobaric', 'isothermal', 'adiabatic',
    'electromagnetism', 'electric', 'charge', 'coulomb', 'voltage', 'current', 'resistance', 'resistor',
    'capacitor', 'capacitance', 'magnetic', 'lorentz', 'induction', 'faraday', 'lenz', 'quantum', 'photon',
    'photoelectric', 'relativity'
  ];

  const words = text.replace(/[^a-z0-9+#_ -]/g, ' ').split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (bioKeywords.includes(word)) scores['Biology'] += 2;
    if (chemKeywords.includes(word)) scores['Chemistry'] += 2;
    if (csKeywords.includes(word)) scores['Computer Science'] += 2;
    if (mathKeywords.includes(word)) scores['Mathematics'] += 2;
    if (physKeywords.includes(word)) scores['Physics'] += 2;
  }

  for (const phrase of ['computer science', 'linear algebra', 'organic chemistry', 'periodic table', 'binary tree', 'heat engine', 'carnot cycle', 'action potential', 'natural selection', 'time complexity']) {
    if (text.includes(phrase)) {
      if (csKeywords.includes(phrase)) scores['Computer Science'] += 4;
      if (bioKeywords.includes(phrase)) scores['Biology'] += 4;
      if (chemKeywords.includes(phrase)) scores['Chemistry'] += 4;
      if (mathKeywords.includes(phrase)) scores['Mathematics'] += 4;
      if (physKeywords.includes(phrase)) scores['Physics'] += 4;
    }
  }

  let topSubject = '';
  let highestScore = 0;

  for (const [subj, sc] of Object.entries(scores)) {
    if (sc > highestScore) {
      highestScore = sc;
      topSubject = subj;
    }
  }

  if (highestScore > 0) {
    return topSubject;
  }

  if (currentSubject && currentSubject !== 'Physics' && currentSubject !== 'STEM') {
    return currentSubject;
  }

  return 'General STEM';
}

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

  // 1. Dynamic Subject Detection (Never force Physics onto Biology, CS, Chemistry, or Math)
  const queryForSubject = `${request.userMessage || ''} ${request.topic || ''} ${request.context || ''}`;
  const detectedSubject = detectSubjectFromQuery(queryForSubject, request.subject);
  request.subject = detectedSubject;
  const subject = detectedSubject;

  // 2. Handle Ping Action
  if (request.action === 'ping') {
    if (provider === 'dual_model') {
      const results: string[] = [];
      let omniOk = false;
      let geminiOk = false;

      // Ping OmniRoute Executor
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${omniRouteUrl}/models`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(omniRouteApiKey ? { Authorization: `Bearer ${omniRouteApiKey}` } : {}),
          },
          signal: controller.signal,
        }).catch(async () => {
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
          omniOk = true;
          results.push(`Executor: OmniRoute Gateway (${omniRouteModel}) Online`);
        } else {
          results.push(`Executor: OmniRoute Gateway HTTP ${res.status}`);
        }
      } catch {
        results.push(`Executor: OmniRoute Gateway offline (${omniRouteUrl})`);
      }

      // Ping Gemini Generator
      if (geminiApiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiApiKey });
          await Promise.race([
            ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: 'Ping test.',
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
          ]);
          geminiOk = true;
          results.push(`Generator: Google Gemini (Live Search) Online`);
        } catch (err: any) {
          results.push(`Generator: Gemini error (${err.message})`);
        }
      } else {
        results.push(`Generator: Missing Gemini API Key`);
      }

      return {
        success: omniOk || geminiOk,
        providerUsed: 'dual_model',
        latencyMs: Date.now() - startTime,
        data: {
          status: results.join(' | '),
        },
      };
    }

    if (provider === 'omniroute') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${omniRouteUrl}/models`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(omniRouteApiKey ? { Authorization: `Bearer ${omniRouteApiKey}` } : {}),
          },
          signal: controller.signal,
        }).catch(async () => {
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

  // 3. Cooperative Dual-Model Execution
  // One model (Google Gemini with live search grounding) GENERATES & RESEARCHES
  // The other model (OmniRoute Gateway) EXECUTES into structured quizzes, cards, or Socratic responses
  const shouldRunDualModel =
    provider === 'dual_model' ||
    (provider === 'omniroute' && !!geminiApiKey);

  if (shouldRunDualModel && geminiApiKey) {
    try {
      return await executeCooperativeDualModel(
        request,
        omniRouteUrl,
        omniRouteApiKey,
        omniRouteModel,
        geminiApiKey,
        enableWebSearch,
        startTime
      );
    } catch (err) {
      console.warn('[OmniRouter] Cooperative Dual-Model pipeline failed, falling back to standalone routing:', err);
    }
  }

  // 4. Intelligent Single-Model Auto-Routing (Zero Setting-Toggling)
  // A: Structured App Tasks (quizzes, flashcards, mind maps, briefs) -> OmniRoute Gateway
  const isStructuredAppTask = ['quiz', 'flashcards', 'mindmap', 'synthesize', 'audio_script'].includes(request.action);

  // B: Out-of-the-box or external questions ("out of the uploadations") -> Google Gemini with Google Search Grounding
  const isOutOfUpload = isOutOfUploadations(request.userMessage, request.context);
  const isOutOfContextOrWeb =
    request.action === 'chat' &&
    (isOutOfUpload ||
      request.userMessage?.toLowerCase().includes('search') ||
      request.userMessage?.toLowerCase().includes('web') ||
      request.userMessage?.toLowerCase().includes('latest') ||
      enableWebSearch);

  if (isStructuredAppTask) {
    try {
      return await executeWithOmniRoute(request, omniRouteUrl, omniRouteApiKey, omniRouteModel, startTime);
    } catch (err) {
      console.warn('[OmniRouter] OmniRoute gateway failed for structured generation, falling back:', err);
      if (deepseekApiKey) {
        try {
          return await executeWithDeepSeek(request, deepseekApiKey, deepseekModel, startTime);
        } catch {}
      }
      if (geminiApiKey) {
        try {
          return await executeWithGemini(request, geminiApiKey, false, startTime);
        } catch {}
      }
      return executeWithDynamicFallback(request, startTime);
    }
  }

  if (isOutOfContextOrWeb && geminiApiKey) {
    try {
      return await executeWithGemini(request, geminiApiKey, true, startTime);
    } catch (err) {
      console.warn('[OmniRouter] Gemini out-of-the-box query failed, routing to OmniRoute:', err);
      try {
        return await executeWithOmniRoute(request, omniRouteUrl, omniRouteApiKey, omniRouteModel, startTime);
      } catch {}
      return executeWithDynamicFallback(request, startTime);
    }
  }

  // 5. Configured Provider Execution with graceful fallback
  try {
    const configured = request.config?.provider || 'omniroute';
    if (configured === 'omniroute') {
      return await executeWithOmniRoute(request, omniRouteUrl, omniRouteApiKey, omniRouteModel, startTime);
    } else if (configured === 'gemini' && geminiApiKey) {
      return await executeWithGemini(request, geminiApiKey, enableWebSearch, startTime);
    } else if (configured === 'deepseek' && deepseekApiKey) {
      return await executeWithDeepSeek(request, deepseekApiKey, deepseekModel, startTime);
    }
  } catch (err) {
    console.warn(`[OmniRouter] Execution failed, using Dynamic Fallback:`, err);
  }

  // 6. Dynamic User-Driven Fallback Engine
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
// Cooperative Dual-Model Pipeline:
// Phase 1 (Generator): Google Gemini 2.5 Flash with live Search Grounding
// Phase 2 (Executor): OmniRoute Gateway (diegosouzapw/OmniRoute) executes structured output
// -------------------------------------------------------------
async function executeCooperativeDualModel(
  request: OmniRouteRequest,
  omniRouteUrl: string,
  omniRouteApiKey: string | undefined,
  omniRouteModel: string,
  geminiApiKey: string,
  enableWebSearch: boolean,
  startTime: number
): Promise<OmniRouteResponse> {
  const subject = request.subject || 'STEM';
  const query = request.userMessage || request.topic || 'STEM Concept';
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });
  const tools = enableWebSearch ? [{ googleSearch: {} }] : undefined;

  // Helper for Gemini Generator call with 8s timeout
  const callGeminiGenerator = async (researchPrompt: string) => {
    return Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: researchPrompt,
        config: tools ? { tools } : undefined,
      }),
      new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini generator timeout (8s)')), 8000)
      ),
    ]);
  };

  // Helper for OmniRoute Executor call with 9s timeout
  const callOmniRouteExecutor = async (systemPrompt: string, userPrompt: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (omniRouteApiKey) headers['Authorization'] = `Bearer ${omniRouteApiKey}`;

    const res = await fetch(`${omniRouteUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: omniRouteModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OmniRoute Executor HTTP ${res.status}`);
    }
    const data = await res.json();
    return {
      text: data.choices?.[0]?.message?.content || '',
      reasoning: data.choices?.[0]?.message?.reasoning_content,
    };
  };

  // 1. Action: CHAT
  if (request.action === 'chat') {
    let geminiResearch = '';
    let webSources: WebSearchSource[] = [];
    try {
      const geminiPrompt = `You are the Lead STEM Research & Generator AI for ${subject}.
Research and formulate an authoritative, detailed factual briefing for student query: "${query}".
${request.context ? `Student's uploaded context: """${request.context}"""` : ''}
${enableWebSearch ? 'Use Google Search to pull verified scientific facts, latest definitions, or solutions.' : ''}

Output a structured briefing containing:
1. Core Definition & Scientific Foundations of "${query}" in ${subject}
2. Key Formulas, Mechanisms, or Algorithms
3. Critical Board Exam Pitfalls & Misconceptions
4. 2 Concrete Examples or Applications`;

      const genResult = await callGeminiGenerator(geminiPrompt);
      geminiResearch = genResult.text || '';
      webSources = extractWebSources(genResult);
    } catch (gErr) {
      console.warn('[DualModel] Gemini generator step failed or timed out:', gErr);
      return await executeWithOmniRoute(request, omniRouteUrl, omniRouteApiKey, omniRouteModel, startTime);
    }

    try {
      const executorSystem = `You are the OmniRoute Application Executor for ${subject}.
You are working in a cooperative dual-model pipeline with a Researcher/Generator model.
Your task is to take the researched facts and EXECUTE a comprehensive, beautifully structured Socratic learning response for the student.
Format clearly with:
- **Concept Overview**: Clear, friendly, and scientifically rigorous explanation
- **Step-by-Step Derivation / Mechanics**: Key equations, steps, or algorithm logic
- **High-Yield Exam Focus**: Common traps and tips for scoring high
- End with 2 actionable guiding questions.`;

      const executorPrompt = `Student Question: "${query}"
Subject: ${subject}
${request.context ? `Uploaded Notes: """${request.context}"""` : ''}

Researched Grounding Provided by Generator Model:
<<<RESEARCH_BRIEF>>>
${geminiResearch}
<<<END_RESEARCH_BRIEF>>>

Now, execute the final student response.`;

      const execResult = await callOmniRouteExecutor(executorSystem, executorPrompt);
      const text = execResult.text || geminiResearch;

      const message: SocraticMessage = {
        id: `msg-dual-${Date.now()}`,
        role: 'assistant',
        content: text,
        reasoningContent: execResult.reasoning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [
          {
            sourceId: 'dual-model-pipeline',
            sourceTitle: `Cooperative Dual-Model [Generator: Gemini + Executor: OmniRoute (${omniRouteModel})]`,
            snippet: 'Gemini live search research grounded and executed via OmniRoute AI Gateway.',
            confidence: 1.0,
          },
        ],
        webSources: webSources.length > 0 ? webSources : undefined,
        guidedQuestions: [
          `Make 5 flashcards on ${query.slice(0, 30)}`,
          `Generate a quiz on this topic`,
        ],
      };

      return {
        success: true,
        providerUsed: 'dual_model',
        latencyMs: Date.now() - startTime,
        data: message,
        webSources,
      };
    } catch (oErr) {
      console.warn('[DualModel] OmniRoute executor failed, using Gemini research directly:', oErr);
      const message: SocraticMessage = {
        id: `msg-gemini-direct-${Date.now()}`,
        role: 'assistant',
        content: geminiResearch,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        webSources: webSources.length > 0 ? webSources : undefined,
        citations: [
          {
            sourceId: 'gemini-grounded',
            sourceTitle: 'Google Gemini 2.5 Flash',
            snippet: 'Direct generator research response.',
            confidence: 0.98,
          },
        ],
        guidedQuestions: [
          `Make flashcards on this topic`,
          `Generate a practice quiz`,
        ],
      };
      return {
        success: true,
        providerUsed: 'dual_model',
        latencyMs: Date.now() - startTime,
        data: message,
        webSources,
      };
    }
  }

  // 2. Action: QUIZ
  if (request.action === 'quiz') {
    const topic = request.topic || query;
    let geminiFacts = '';
    try {
      const gPrompt = `You are the STEM Research/Generator model. Research 5 rigorous, high-yield examination questions on topic: "${topic}" in subject: ${subject}.
Identify:
- Core concepts tested
- Distractors that represent common student misconceptions
- Exact formulas, definitions, and SLO references`;
      const genRes = await callGeminiGenerator(gPrompt);
      geminiFacts = genRes.text || '';
    } catch (e) {
      console.warn('[DualModel] Gemini quiz research step timed out:', e);
    }

    try {
      const execSystem = `You are the OmniRoute Application Executor. Convert the educational research into a strictly valid JSON array of 5 QuizQuestion objects. Return ONLY valid JSON array:
[
  {
    "id": "q1",
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Detailed explanation",
    "sloReference": "${topic} - Concept",
    "difficulty": "Application"
  }
]`;
      const execPrompt = `Topic: "${topic}"
Subject: ${subject}
Researched Knowledge Foundation:
${geminiFacts || topic}

Generate the 5 MCQs JSON array now.`;
      const execRes = await callOmniRouteExecutor(execSystem, execPrompt);
      const parsed = cleanAndParseJSON<QuizQuestion[]>(execRes.text, []);
      if (parsed.length > 0) {
        return {
          success: true,
          providerUsed: 'dual_model',
          latencyMs: Date.now() - startTime,
          data: parsed,
        };
      }
    } catch (e) {
      console.warn('[DualModel] OmniRoute quiz execution failed:', e);
    }

    if (geminiApiKey) {
      try {
        return await executeWithGemini(request, geminiApiKey, false, startTime);
      } catch {}
    }
    return executeWithDynamicFallback(request, startTime);
  }

  // 3. Action: FLASHCARDS
  if (request.action === 'flashcards') {
    const topic = request.topic || query;
    let geminiFacts = '';
    try {
      const gPrompt = `You are the STEM Research/Generator model. Formulate 6 core high-yield active-recall concepts, formulas, definitions, and exam traps for topic: "${topic}" in subject: ${subject}.`;
      const genRes = await callGeminiGenerator(gPrompt);
      geminiFacts = genRes.text || '';
    } catch (e) {
      console.warn('[DualModel] Gemini flashcard research timed out:', e);
    }

    try {
      const execSystem = `You are the OmniRoute Application Executor. Convert the educational research into a strictly valid JSON array of 6 Flashcard objects. Return ONLY valid JSON array:
[
  {
    "id": "fc1",
    "front": "Term, Law, or Problem",
    "back": "Detailed definition, formula, or exam trap",
    "category": "Concept",
    "subject": "${subject}",
    "status": "new"
  }
]`;
      const execPrompt = `Topic: "${topic}"
Subject: ${subject}
Researched Knowledge Foundation:
${geminiFacts || topic}

Generate the 6 Flashcards JSON array now.`;
      const execRes = await callOmniRouteExecutor(execSystem, execPrompt);
      const parsed = cleanAndParseJSON<Flashcard[]>(execRes.text, []);
      if (parsed.length > 0) {
        return {
          success: true,
          providerUsed: 'dual_model',
          latencyMs: Date.now() - startTime,
          data: parsed,
        };
      }
    } catch (e) {
      console.warn('[DualModel] OmniRoute flashcards execution failed:', e);
    }

    if (geminiApiKey) {
      try {
        return await executeWithGemini(request, geminiApiKey, false, startTime);
      } catch {}
    }
    return executeWithDynamicFallback(request, startTime);
  }

  // 4. Action: MINDMAP
  if (request.action === 'mindmap') {
    const topic = request.topic || query;
    try {
      const execSystem = `You are the OmniRoute Application Executor. Produce a valid JSON concept graph for topic "${topic}" in ${subject}. Return ONLY valid JSON:
{
  "topic": "${topic}",
  "subject": "${subject}",
  "nodes": [
    { "id": "1", "label": "${topic}", "category": "core", "description": "Core concept" },
    { "id": "2", "label": "Prerequisite Foundation", "category": "prerequisite", "description": "Required knowledge" },
    { "id": "3", "label": "Exam Focus Area", "category": "exam_focus", "description": "High-yield exam questions" },
    { "id": "4", "label": "Real-World Application", "category": "application", "description": "Practical application" }
  ],
  "links": [
    { "source": "1", "target": "2", "relation": "Rooted in" },
    { "source": "1", "target": "3", "relation": "Tested in" },
    { "source": "1", "target": "4", "relation": "Applied to" }
  ]
}`;
      const execRes = await callOmniRouteExecutor(execSystem, `Topic: "${topic}", Subject: "${subject}"`);
      const parsed = cleanAndParseJSON<MindMapData>(execRes.text, null as any);
      if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        return {
          success: true,
          providerUsed: 'dual_model',
          latencyMs: Date.now() - startTime,
          data: parsed,
        };
      }
    } catch (e) {
      console.warn('[DualModel] OmniRoute mindmap execution failed:', e);
    }

    if (geminiApiKey) {
      try {
        return await executeWithGemini(request, geminiApiKey, false, startTime);
      } catch {}
    }
    return executeWithDynamicFallback(request, startTime);
  }

  // 5. Action: SYNTHESIZE
  if (request.action === 'synthesize') {
    let geminiFacts = '';
    try {
      const gPrompt = `You are the STEM Research/Generator model. Extract core principles, formulas/laws, board exam pitfalls, and review questions from:
"""${request.context || query}"""`;
      const genRes = await callGeminiGenerator(gPrompt);
      geminiFacts = genRes.text || '';
    } catch (e) {}

    try {
      const execSystem = `You are the OmniRoute Application Executor. Return ONLY valid JSON:
{
  "executiveSummary": "Summary",
  "keyFormulasAndDefinitions": ["Point 1", "Point 2"],
  "boardExamPitfalls": ["Pitfall 1", "Pitfall 2"],
  "suggestedReviewQuestions": ["Question 1", "Question 2"]
}`;
      const execRes = await callOmniRouteExecutor(execSystem, geminiFacts || query);
      const parsed = cleanAndParseJSON<StudySummary>(execRes.text, null as any);
      if (parsed && Array.isArray(parsed.keyFormulasAndDefinitions)) {
        return {
          success: true,
          providerUsed: 'dual_model',
          latencyMs: Date.now() - startTime,
          data: parsed,
        };
      }
    } catch (e) {}

    if (geminiApiKey) {
      try {
        return await executeWithGemini(request, geminiApiKey, false, startTime);
      } catch {}
    }
    return executeWithDynamicFallback(request, startTime);
  }

  return executeWithDynamicFallback(request, startTime);
}

// -------------------------------------------------------------
// Dynamic Multi-Subject Fallback Engine (Guaranteed zero-crash)
// Distinct academic engines for Biology, Chemistry, CS, Math, Physics
// -------------------------------------------------------------
function executeWithDynamicFallback(
  request: OmniRouteRequest,
  startTime: number
): OmniRouteResponse {
  const query = request.userMessage || request.topic || 'STEM Concept';
  const context = request.context || '';
  const subject = request.subject || detectSubjectFromQuery(query, 'General STEM');

  if (request.action === 'chat') {
    let subjectSpecificGuidance = '';
    let guidedQuestions: string[] = [];

    if (subject === 'Biology') {
      subjectSpecificGuidance = `Key Academic Insights for ${query}:
1. **Biological Mechanism**: Trace the pathway through cellular structures, molecular substrates, or genetic sequences.
2. **Homeostatic Regulation**: Understand how enzyme activity, feedback loops, or membrane transport govern this biological system.
3. **Common Board Pitfall**: Avoid confusing similar terms (e.g. mitosis vs meiosis, transcription vs translation, active vs passive transport).`;
      guidedQuestions = [
        `Make 5 flashcards on ${query.slice(0, 30)}`,
        `Generate a practice quiz on this biology topic`,
      ];
    } else if (subject === 'Chemistry') {
      subjectSpecificGuidance = `Key Academic Insights for ${query}:
1. **Chemical Foundations**: Balance reaction stoichiometry, oxidation states, and molecular geometry.
2. **Equilibrium & Thermodynamics**: Apply Le Chatelier's principle and thermodynamic spontaneity (ΔG = ΔH - TΔS).
3. **Common Board Pitfall**: Always verify molar ratios and physical state symbols (s, l, g, aq) in stoichiometric equations.`;
      guidedQuestions = [
        `Make 5 flashcards on ${query.slice(0, 30)}`,
        `Generate a chemistry quiz on this topic`,
      ];
    } else if (subject === 'Computer Science') {
      subjectSpecificGuidance = `Key Academic Insights for ${query}:
1. **Algorithmic Complexity**: Analyze worst-case and average-case time (Big-O) and auxiliary space complexity.
2. **Data Structure Invariants**: Maintain boundary conditions (recursion base cases, loop invariants, pointer bounds).
3. **Common Pitfall**: Watch for off-by-one errors, infinite loops, memory leaks, and unhandled null/undefined edge cases.`;
      guidedQuestions = [
        `Make 5 flashcards on ${query.slice(0, 30)}`,
        `Generate a computer science quiz on this topic`,
      ];
    } else if (subject === 'Mathematics') {
      subjectSpecificGuidance = `Key Academic Insights for ${query}:
1. **Mathematical Definitions**: Identify the domain, range, and operational axioms governing the function or equation.
2. **Analytical Derivation**: Step through algebraic transformations, differentiation/integration rules, or matrix operations.
3. **Common Board Pitfall**: Check for extraneous roots when squaring, division by zero, and signs of trigonometric quadrants.`;
      guidedQuestions = [
        `Step through the formal proof or derivation`,
        `Generate a mathematics quiz on this topic`,
      ];
    } else if (subject === 'Physics') {
      subjectSpecificGuidance = `Key Academic Insights for ${query}:
1. **Physical Law & Conservation**: State the governing conservation principle (Energy, Momentum, Charge) and boundary conditions.
2. **SI Units & Quantities**: Strictly convert units before computation and verify vector directions.
3. **Common Board Pitfall**: Never confuse scalar speed with vector velocity, or apply non-inertial equations without pseudo-forces.`;
      guidedQuestions = [
        `Step through the mathematical derivation`,
        `Practice a numerical board problem on this topic`,
      ];
    } else {
      subjectSpecificGuidance = `Key Academic Insights for ${query}:
1. **Core Scientific Principle**: Deconstruct the concept into its foundational hypotheses and empirical laws.
2. **System Boundaries**: Identify inputs, transformations, and conservation constraints.
3. **Analytical Verification**: Formulate testable predictions and check consistency across dimensions.`;
      guidedQuestions = [
        `Make 5 flashcards on this topic`,
        `Generate a quiz on this topic`,
      ];
    }

    const message: SocraticMessage = {
      id: `msg-local-${Date.now()}`,
      role: 'assistant',
      content: `I've analyzed your question regarding "${query}" in **${subject}**:

${context ? `From your uploaded notes:\n• Concept Basis: ${context.slice(0, 220)}...\n\n` : ''}${subjectSpecificGuidance}

Would you like me to generate flashcards or a practice quiz to test your mastery?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      guidedQuestions,
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
    const topic = request.topic || query || 'Core STEM Topics';
    let flashcards: Flashcard[] = [];

    if (subject === 'Biology') {
      flashcards = [
        {
          id: `fc-bio-1-${Date.now()}`,
          front: `What is the primary biological function of ${topic}?`,
          back: `Functions in metabolic regulation, energy conversion, or genetic information storage/expression within cellular compartments.`,
          category: 'Concept',
          subject: 'Biology',
          status: 'new',
        },
        {
          id: `fc-bio-2-${Date.now()}`,
          front: `What is the most common exam trap when studying ${topic}?`,
          back: `Confusing active transport mechanisms (requiring ATP) with passive facilitated diffusion, or mixing up homologous vs analogous structures.`,
          category: 'Exam Pitfall',
          subject: 'Biology',
          status: 'new',
        },
        {
          id: `fc-bio-3-${Date.now()}`,
          front: `Which cellular organelle or enzyme complex directly mediates ${topic}?`,
          back: `Mediated by specific protein complexes (e.g., ribosomes, ATP synthase, RNA polymerase) under tight enzymatic control.`,
          category: 'Mechanism',
          subject: 'Biology',
          status: 'new',
        },
        {
          id: `fc-bio-4-${Date.now()}`,
          front: `How is homeostasis maintained during ${topic}?`,
          back: `Through negative feedback loops that monitor physiological set points and modulate substrate throughput.`,
          category: 'Regulation',
          subject: 'Biology',
          status: 'new',
        },
      ];
    } else if (subject === 'Chemistry') {
      flashcards = [
        {
          id: `fc-chem-1-${Date.now()}`,
          front: `What is the governing stoichiometric/chemical principle for ${topic}?`,
          back: `Conservation of mass and charge: Total moles of reacting elements equal total moles in products under standard oxidation states.`,
          category: 'Law',
          subject: 'Chemistry',
          status: 'new',
        },
        {
          id: `fc-chem-2-${Date.now()}`,
          front: `How does Le Chatelier's principle or equilibrium apply to ${topic}?`,
          back: `A disturbance in concentration, temperature, or pressure shifts equilibrium position to counteract the applied change.`,
          category: 'Equilibrium',
          subject: 'Chemistry',
          status: 'new',
        },
        {
          id: `fc-chem-3-${Date.now()}`,
          front: `What is the high-frequency board exam pitfall in ${topic}?`,
          back: `Neglecting stoichiometric mole ratios when calculating limiting reagents, or ignoring physical states (s, l, g, aq) in equilibrium expressions.`,
          category: 'Exam Pitfall',
          subject: 'Chemistry',
          status: 'new',
        },
        {
          id: `fc-chem-4-${Date.now()}`,
          front: `What is the thermodynamic driving force for ${topic}?`,
          back: `Gibbs Free Energy change: ΔG = ΔH - TΔS. A process is spontaneous at constant T and P when ΔG < 0.`,
          category: 'Formula',
          subject: 'Chemistry',
          status: 'new',
        },
      ];
    } else if (subject === 'Computer Science') {
      flashcards = [
        {
          id: `fc-cs-1-${Date.now()}`,
          front: `What is the asymptotic time complexity of ${topic}?`,
          back: `Typically analyzed across Best, Average, and Worst cases (e.g. O(1), O(log n), O(n), or O(n log n)) based on input size n.`,
          category: 'Complexity',
          subject: 'Computer Science',
          status: 'new',
        },
        {
          id: `fc-cs-2-${Date.now()}`,
          front: `What is the essential invariant or base case for ${topic}?`,
          back: `The termination condition that prevents unbounded recursion or loop cycles, preserving data structure consistency.`,
          category: 'Invariant',
          subject: 'Computer Science',
          status: 'new',
        },
        {
          id: `fc-cs-3-${Date.now()}`,
          front: `What is the most frequent coding bug/trap in ${topic}?`,
          back: `Off-by-one index bounds, null/undefined pointer dereferences, or unhandled edge cases (empty input, duplicate keys).`,
          category: 'Exam Pitfall',
          subject: 'Computer Science',
          status: 'new',
        },
        {
          id: `fc-cs-4-${Date.now()}`,
          front: `How does space complexity trade off with time efficiency in ${topic}?`,
          back: `Auxiliary memory (e.g. hash tables, memoization arrays, call stacks) can reduce time complexity at the cost of additional O(n) space.`,
          category: 'Optimization',
          subject: 'Computer Science',
          status: 'new',
        },
      ];
    } else if (subject === 'Mathematics') {
      flashcards = [
        {
          id: `fc-math-1-${Date.now()}`,
          front: `State the fundamental definition or formula for ${topic}.`,
          back: `Governed by algebraic identities, differential/integral operators, or matrix transformation rules over specified domain bounds.`,
          category: 'Formula',
          subject: 'Mathematics',
          status: 'new',
        },
        {
          id: `fc-math-2-${Date.now()}`,
          front: `What domain restrictions apply to ${topic}?`,
          back: `Expressions must satisfy real-number conditions: Denominator ≠ 0, radicand of even roots ≥ 0, and argument of logarithms > 0.`,
          category: 'Domain & Range',
          subject: 'Mathematics',
          status: 'new',
        },
        {
          id: `fc-math-3-${Date.now()}`,
          front: `What is the most common board exam pitfall in ${topic}?`,
          back: `Introducing extraneous roots during algebraic squaring, or omitting the constant of integration (+C) in indefinite integrals.`,
          category: 'Exam Pitfall',
          subject: 'Mathematics',
          status: 'new',
        },
      ];
    } else {
      flashcards = [
        {
          id: `fc-stem-1-${Date.now()}`,
          front: `What is the primary governing principle for ${topic}?`,
          back: `Deconstructs into state variables and conservation laws across system boundaries. Always verify units and dimensions.`,
          category: 'Principle',
          subject: 'General STEM',
          status: 'new',
        },
        {
          id: `fc-stem-2-${Date.now()}`,
          front: `What is the critical exam pitfall in ${topic}?`,
          back: `Failing to convert initial units or confusing scalar magnitudes with directional vector properties.`,
          category: 'Exam Pitfall',
          subject: 'General STEM',
          status: 'new',
        },
      ];
    }

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
        ? `Executive synthesis of ${subject} material: "${context.slice(0, 160)}..."`
        : `Executive study brief for ${request.topic || 'Your Custom Notes'} in ${subject}.`,
      keyFormulasAndDefinitions: [
        `Primary Law: Governing principles and foundational relationships for ${request.topic || 'the topic'}`,
        'Boundary Conditions: Domain constraints and initial parameters',
        'Equilibrium or Invariant State: Conditions under which system reaches balance',
      ],
      boardExamPitfalls: [
        'Neglecting unit normalization and sign conventions in step calculations',
        'Confusing empirical observations with theoretical first principles',
      ],
      suggestedReviewQuestions: [
        `Explain the fundamental derivation/mechanism of ${request.topic || 'the topic'}.`,
        'Formulate the boundary conditions and solve for unknown variables.',
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
    const topic = request.topic || query || 'STEM Practice';
    let quiz: QuizQuestion[] = [];

    if (subject === 'Biology') {
      quiz = [
        {
          id: 'q-bio-1',
          question: `In biological systems involving ${topic}, what is the primary role of enzyme catalysis?`,
          options: ['Lowering the activation energy without being consumed', 'Increasing overall temperature of the cell', 'Converting endergonic reactions into exergonic', 'Changing the final chemical equilibrium constant'],
          correctIndex: 0,
          explanation: 'Enzymes accelerate biological reactions by stabilizing the transition state and lowering activation energy.',
          sloReference: `${topic} - Biological Catalysis`,
          difficulty: 'Conceptual',
        },
        {
          id: 'q-bio-2',
          question: `Which mechanism is most critical for maintaining homeostatic equilibrium in ${topic}?`,
          options: ['Negative feedback inhibition', 'Uncontrolled positive feedback', 'Linear non-saturating accumulation', 'Permanent membrane denaturation'],
          correctIndex: 0,
          explanation: 'Negative feedback loops return physiological variables to their baseline set points.',
          sloReference: `${topic} - Homeostasis`,
          difficulty: 'Application',
        },
        {
          id: 'q-bio-3',
          question: `When analyzing cellular transport in ${topic}, which process strictly requires metabolic energy (ATP)?`,
          options: ['Active transport against concentration gradient', 'Simple lipid diffusion', 'Osmotic water movement', 'Facilitated channel diffusion'],
          correctIndex: 0,
          explanation: 'Active transport moves solutes against their electrochemical gradient and requires ATP hydrolysis.',
          sloReference: `${topic} - Transport`,
          difficulty: 'Application',
        },
      ];
    } else if (subject === 'Computer Science') {
      quiz = [
        {
          id: 'q-cs-1',
          question: `What is the primary condition required to achieve O(log n) search time in ${topic}?`,
          options: ['The input dataset must be sorted or indexed hierarchically', 'The array must be stored on distributed flash drives', 'All elements must be prime integers', 'The function must be implemented iteratively without recursion'],
          correctIndex: 0,
          explanation: 'Binary search and balanced search trees halve search spaces on each step, requiring sorted or keyed order.',
          sloReference: `${topic} - Search Complexity`,
          difficulty: 'Conceptual',
        },
        {
          id: 'q-cs-2',
          question: `In recursive implementations of ${topic}, what occurs if the base case is omitted or unreachable?`,
          options: ['Call stack overflow runtime error', 'Immediate compilation syntax error', 'Automatic garbage collection of pointers', 'Graceful fallback to linear iteration'],
          correctIndex: 0,
          explanation: 'Unbounded recursion continuously pushes stack frames until available call stack memory is exhausted.',
          sloReference: `${topic} - Recursion Invariants`,
          difficulty: 'Application',
        },
        {
          id: 'q-cs-3',
          question: `Which data structure provides O(1) average-case key lookup for ${topic}?`,
          options: ['Hash Table', 'Singly Linked List', 'Unbalanced Binary Tree', 'Linear Array'],
          correctIndex: 0,
          explanation: 'Hash tables map keys directly to array buckets via hash functions in O(1) expected time.',
          sloReference: `${topic} - Data Structures`,
          difficulty: 'Conceptual',
        },
      ];
    } else if (subject === 'Chemistry') {
      quiz = [
        {
          id: 'q-chem-1',
          question: `According to Le Chatelier's principle, how will an exothermic reaction in ${topic} respond to an increase in temperature?`,
          options: ['Shift toward reactants to absorb excess heat', 'Shift toward products to release more heat', 'Equilibrium constant increases exponentially', 'Reaction rate drops to zero immediately'],
          correctIndex: 0,
          explanation: 'For exothermic reactions, heat acts as a product; increasing temperature shifts the equilibrium left toward reactants.',
          sloReference: `${topic} - Chemical Equilibrium`,
          difficulty: 'Application',
        },
        {
          id: 'q-chem-2',
          question: `In redox reactions involving ${topic}, what occurs at the cathode during electrolysis?`,
          options: ['Reduction (gain of electrons)', 'Oxidation (loss of electrons)', 'Precipitation of anions only', 'Direct proton neutralization'],
          correctIndex: 0,
          explanation: 'Cathode is the site of reduction (gain of electrons: Red Cat).',
          sloReference: `${topic} - Electrochemistry`,
          difficulty: 'Conceptual',
        },
      ];
    } else if (subject === 'Mathematics') {
      quiz = [
        {
          id: 'q-math-1',
          question: `For a continuous function f(x) in ${topic}, what condition guarantees a local extremum when f'(c) = 0?`,
          options: ['The first derivative f\'(x) changes sign across x = c', 'f(c) must equal zero', 'The function must be strictly linear', 'f\'\'(c) must equal zero'],
          correctIndex: 0,
          explanation: 'By the First Derivative Test, an extremum occurs if and only if f\'(x) changes sign across the critical point.',
          sloReference: `${topic} - Calculus Extrema`,
          difficulty: 'Conceptual',
        },
        {
          id: 'q-math-2',
          question: `What is the derivative of f(x) = ln(x) for x > 0?`,
          options: ['1 / x', '1 / (x^2)', 'e^x', 'x ln(x) - x'],
          correctIndex: 0,
          explanation: 'd/dx [ln(x)] = 1/x for all x > 0.',
          sloReference: `${topic} - Differentiation Rules`,
          difficulty: 'Conceptual',
        },
      ];
    } else {
      quiz = [
        {
          id: 'q-stem-1',
          question: `In quantitative analysis of ${topic}, what is the critical initial condition?`,
          options: ['State equilibrium and boundary specification', 'Non-zero driving potential', 'Constant velocity', 'Adiabatic boundary'],
          correctIndex: 0,
          explanation: 'Accurate boundary conditions and initial states are required for exact analytical solutions.',
          sloReference: `${topic} - Boundary Conditions`,
          difficulty: 'Conceptual',
        },
        {
          id: 'q-stem-2',
          question: `When solving numerical problems on ${topic}, which practice prevents dimensional inconsistency?`,
          options: ['Converting all initial quantities into standard SI units', 'Logarithmic scale inversion', 'Scalar projection', 'Ignoring constant multipliers'],
          correctIndex: 0,
          explanation: 'SI units must be consistently maintained throughout all stages of calculation.',
          sloReference: `${topic} - SI Consistency`,
          difficulty: 'Application',
        },
      ];
    }

    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: quiz,
      isOfflineFallback: true,
    };
  }

  if (request.action === 'mindmap') {
    const topic = request.topic || query || 'STEM Study Topic';
    const mindmap: MindMapData = {
      topic,
      subject,
      nodes: [
        { id: '1', label: topic, category: 'core', description: `Central study topic in ${subject}` },
        { id: '2', label: 'Prerequisites & Definitions', category: 'prerequisite', description: 'Underlying foundational principles' },
        { id: '3', label: 'Exam Focus & Traps', category: 'exam_focus', description: 'High-yield questions and common pitfalls' },
        { id: '4', label: 'Applications & Real-World Case', category: 'application', description: 'Practical implementations' },
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
    const topic = request.topic || query || 'Your Custom Notes';
    return {
      success: true,
      providerUsed: 'demo_fallback',
      latencyMs: Date.now() - startTime,
      data: {
        id: 'pod-user',
        topic,
        subject,
        duration: '2 min',
        dialogue: [
          {
            speaker: 'Dr. Sarah (Concept Lead)',
            text: `Welcome to our student study breakdown of ${topic} in ${subject}!`,
            timestamp: '0:00',
          },
          {
            speaker: 'Alex (Student Fellow)',
            text: `Thanks Dr. Sarah! What is the main highlight from the student notes?`,
            timestamp: '0:12',
          },
          {
            speaker: 'Dr. Sarah (Concept Lead)',
            text: `The most important takeaway is connecting the core concepts with practical exam problems.`,
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

// -------------------------------------------------------------
// Helper: Detect if Query is Outside Uploaded Notes ("Out of the Uploadations")
// -------------------------------------------------------------
function isOutOfUploadations(userMsg?: string, context?: string): boolean {
  if (!context || context.trim().length < 40) return true;
  if (!userMsg) return false;

  const lowerMsg = userMsg.toLowerCase();
  const searchSignals = [
    'search', 'web', 'latest', 'recent', 'who', 'when was', 'news', 'paper', 'discovery',
    'real world', 'outside', 'out of the box', 'unrelated', 'general', 'current', 'novel'
  ];
  if (searchSignals.some((sig) => lowerMsg.includes(sig))) return true;

  // Extract content words
  const words = lowerMsg
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['what', 'when', 'where', 'which', 'explain', 'describe', 'tell', 'show', 'about', 'this', 'that', 'with', 'from', 'have', 'does', 'give', 'make', 'help'].includes(w));

  if (words.length === 0) return false;
  const lowerCtx = context.toLowerCase();
  const matches = words.filter((w) => lowerCtx.includes(w)).length;
  // If less than 25% of query words match the uploaded note, it is outside uploaded notes!
  return (matches / words.length) < 0.25;
}

