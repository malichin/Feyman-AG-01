import { SYSTEM_PROMPT } from './systemPrompt';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

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
