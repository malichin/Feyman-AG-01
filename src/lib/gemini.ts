import { SYSTEM_PROMPT } from './systemPrompt';

const BARE_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=`;

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

export interface GeminiMessage {
  role: string;
  parts: { text: string }[];
}

export async function sendMessage(messages: GeminiMessage[]): Promise<string> {
  if (!API_KEY) {
    return 'Per usare FEYMAN AG01, aggiungi la tua chiave API Gemini nel file .env.local come NEXT_PUBLIC_GEMINI_API_KEY=la_tua_chiave';
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = (errorData as { error?: { message?: string } })?.error?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Errore nella risposta';
  } catch (error) {
    if (error instanceof Error) {
      return `Errore: ${error.message}`;
    }
    return 'Errore sconosciuto nella richiesta';
  }
}

async function rawGenerate(prompt: string): Promise<string> {
  if (!API_KEY) return '';
  try {
    const response = await fetch(`${BARE_URL}${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) return '';
    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {
    return '';
  }
}

export interface Flashcard { front: string; back: string }
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}
export interface TrueFalseQuestion { statement: string; answer: boolean; explanation: string }

export async function generateFlashcards(topic: string, count = 8): Promise<Flashcard[]> {
  const prompt = `Genera esattamente ${count} flashcard su "${topic}" in italiano.
Rispondi SOLO con un array JSON valido, nessun testo aggiuntivo, nessun markdown, nessun backtick.
Formato: [{"front":"domanda","back":"risposta"}]`;
  const raw = await rawGenerate(prompt);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as Flashcard[];
  } catch {
    return [];
  }
}

export async function generateMultipleChoice(topic: string, count = 6): Promise<QuizQuestion[]> {
  const prompt = `Genera esattamente ${count} domande a scelta multipla su "${topic}" in italiano.
Rispondi SOLO con un array JSON valido, nessun testo extra, nessun markdown, nessun backtick.
Formato: [{"question":"...","options":["A","B","C","D"],"correct":0}]
Il campo "correct" è l'indice (0-3) dell'opzione giusta.`;
  const raw = await rawGenerate(prompt);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as QuizQuestion[];
  } catch {
    return [];
  }
}

export async function generateTrueFalse(topic: string, count = 8): Promise<TrueFalseQuestion[]> {
  const prompt = `Genera esattamente ${count} affermazioni vero/falso su "${topic}" in italiano.
Rispondi SOLO con un array JSON valido, nessun testo extra, nessun markdown, nessun backtick.
Formato: [{"statement":"...","answer":true,"explanation":"breve spiegazione"}]`;
  const raw = await rawGenerate(prompt);
  try {
    const clean = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(clean) as TrueFalseQuestion[];
  } catch {
    return [];
  }
}
