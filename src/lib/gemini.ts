import { SYSTEM_PROMPT } from './systemPrompt';
import { getApiKey } from './storage';

const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=`;

function getKey(): string {
  return getApiKey() || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
}

export interface GeminiMessage {
  role: string;
  parts: { text: string }[];
}

export async function validateKey(key: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Ciao' }] }] }),
    });
    return response.ok;
  } catch { return false; }
}

export async function sendMessage(messages: GeminiMessage[]): Promise<string> {
  const key = getKey();
  if (!key) return 'Chiave API mancante. Configura la tua chiave nelle impostazioni.';
  try {
    const response = await fetch(`${BASE_URL}${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Nessuna risposta ricevuta.';
  } catch (error) {
    return `Errore: ${error instanceof Error ? error.message : 'sconosciuto'}`;
  }
}

async function rawGenerate(prompt: string): Promise<string> {
  const key = getKey();
  if (!key) return '';
  try {
    const response = await fetch(`${BASE_URL}${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) return '';
    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch { return ''; }
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
