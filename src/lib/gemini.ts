import { SYSTEM_PROMPT } from './systemPrompt';

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.1-8b-instruct:free';

// OpenRouter message format (OpenAI-compatible)
export interface GeminiMessage {
  role: string;
  parts: { text: string }[];
}

interface ORMessage { role: string; content: string }

function toOR(messages: GeminiMessage[]): ORMessage[] {
  return messages.map((m) => ({
    role: m.role === 'model' ? 'assistant' : m.role,
    content: m.parts.map((p) => p.text).join(''),
  }));
}

async function orFetch(messages: ORMessage[]): Promise<string> {
  if (!API_KEY) return '';
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      'HTTP-Referer': 'https://feyman-ag01.netlify.app',
      'X-Title': 'FEYMAN AG01',
    },
    body: JSON.stringify({ model: MODEL, messages }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || '';
}

export async function sendMessage(messages: GeminiMessage[]): Promise<string> {
  if (!API_KEY) {
    return 'Chiave API mancante. Aggiungi NEXT_PUBLIC_OPENROUTER_API_KEY nelle variabili di Netlify.';
  }
  try {
    const orMessages: ORMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...toOR(messages),
    ];
    return await orFetch(orMessages) || 'Nessuna risposta ricevuta.';
  } catch (error) {
    return `Errore: ${error instanceof Error ? error.message : 'sconosciuto'}`;
  }
}

async function rawGenerate(prompt: string): Promise<string> {
  if (!API_KEY) return '';
  try {
    return await orFetch([{ role: 'user', content: prompt }]);
  } catch {
    return '';
  }
}

export interface Flashcard { front: string; back: string }
export interface QuizQuestion { question: string; options: string[]; correct: number }
export interface TrueFalseQuestion { statement: string; answer: boolean; explanation: string }

export async function generateFlashcards(topic: string, count = 8): Promise<Flashcard[]> {
  const prompt = `Genera esattamente ${count} flashcard su "${topic}" in italiano.
Rispondi SOLO con un array JSON valido, nessun testo aggiuntivo, nessun markdown, nessun backtick.
Formato: [{"front":"domanda","back":"risposta"}]`;
  const raw = await rawGenerate(prompt);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) as Flashcard[]; } catch { return []; }
}

export async function generateMultipleChoice(topic: string, count = 6): Promise<QuizQuestion[]> {
  const prompt = `Genera esattamente ${count} domande a scelta multipla su "${topic}" in italiano.
Rispondi SOLO con un array JSON valido, nessun testo extra, nessun markdown, nessun backtick.
Formato: [{"question":"...","options":["A","B","C","D"],"correct":0}]`;
  const raw = await rawGenerate(prompt);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) as QuizQuestion[]; } catch { return []; }
}

export async function generateTrueFalse(topic: string, count = 8): Promise<TrueFalseQuestion[]> {
  const prompt = `Genera esattamente ${count} affermazioni vero/falso su "${topic}" in italiano.
Rispondi SOLO con un array JSON valido, nessun testo extra, nessun markdown, nessun backtick.
Formato: [{"statement":"...","answer":true,"explanation":"breve spiegazione"}]`;
  const raw = await rawGenerate(prompt);
  try { return JSON.parse(raw.replace(/```json|```/g, '').trim()) as TrueFalseQuestion[]; } catch { return []; }
}
