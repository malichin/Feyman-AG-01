'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { sendMessage, GeminiMessage } from '@/lib/gemini';

const WELCOME_MESSAGE = `Come vuoi lavorare?

1 — Capire un argomento da zero
2 — Studiare meglio qualcosa che sto già leggendo
3 — Chiarire una parte che non mi è chiara
4 — Memorizzare quello che ho già capito`;

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';

  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-5">
        <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-[#f0f4f8] text-[#0d1b2a] text-sm leading-relaxed">
          {formatContent(content)}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-5">
      <div className="max-w-[85%]">
        <div className="text-sm text-[#0d1b2a] leading-relaxed prose-feyman">
          {formatContent(content)}
        </div>
      </div>
    </div>
  );
}

export default function ChatView() {
  const { currentSession, addMessage } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = currentSession?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue('');
    addMessage({ role: 'user', content: text });
    setIsLoading(true);

    try {
      // Build conversation history for Gemini
      const history: GeminiMessage[] = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      history.push({ role: 'user', parts: [{ text }] });

      const response = await sendMessage(history);
      addMessage({ role: 'assistant', content: response });
    } catch {
      addMessage({
        role: 'assistant',
        content: 'Si è verificato un errore. Riprova tra poco.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          {isEmpty ? (
            /* Welcome menu */
            <div className="py-8">
              <div className="mb-6">
                <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">
                  FEYMAN AG01
                </p>
                <h2 className="text-xl font-medium text-[#0d1b2a]">Come vuoi lavorare?</h2>
              </div>
              <div className="space-y-2">
                {[
                  { num: '1', text: 'Capire un argomento da zero' },
                  { num: '2', text: 'Studiare meglio qualcosa che sto già leggendo' },
                  { num: '3', text: 'Chiarire una parte che non mi è chiara' },
                  { num: '4', text: 'Memorizzare quello che ho già capito' },
                ].map((item) => (
                  <button
                    key={item.num}
                    onClick={() => {
                      setInputValue(item.num);
                    }}
                    className="w-full flex items-start gap-4 px-4 py-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] transition-all text-left group"
                  >
                    <span className="text-sm font-semibold text-[#2e86ab] min-w-[20px]">
                      {item.num}
                    </span>
                    <span className="text-sm text-[#0d1b2a] group-hover:text-[#2e86ab] transition-colors">
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <>
              {/* Show welcome as first assistant message context */}
              <div className="mb-5">
                <div className="text-sm text-[#0d1b2a] leading-relaxed prose-feyman">
                  {WELCOME_MESSAGE.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < WELCOME_MESSAGE.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {messages.map((message) => (
                <MessageBubble key={message.id} role={message.role} content={message.content} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-5">
                  <TypingIndicator />
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-[#e2e8f0] px-4 md:px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative border border-[#e2e8f0] rounded-2xl bg-white hover:border-[#2e86ab] focus-within:border-[#2e86ab] transition-colors">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi un messaggio… (Invio per inviare, Shift+Invio per andare a capo)"
              rows={1}
              disabled={isLoading}
              className="w-full px-4 py-3.5 pr-12 text-[#0d1b2a] placeholder-[#94a3b8] resize-none bg-transparent text-sm outline-none rounded-2xl leading-relaxed disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2e86ab] hover:bg-[#256f90] text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowUp size={15} />
            </button>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-2 text-center">
            FEYMAN AG01 può fare errori. Verifica sempre le informazioni importanti.
          </p>
        </div>
      </div>
    </div>
  );
}
