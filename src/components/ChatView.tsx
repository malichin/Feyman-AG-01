'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { sendMessage, GeminiMessage } from '@/lib/gemini';

// Detect numbered options in AI responses: "1 — text", "2. text", "S — text"
function parseOptions(content: string): { text: string; options: { key: string; label: string }[] } {
  const lines = content.split('\n');
  const options: { key: string; label: string }[] = [];
  const textLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^([1-9]|S)\s*[—\-.]\s*(.+)/i);
    if (match) {
      options.push({ key: match[1], label: match[2].trim() });
    } else {
      textLines.push(line);
    }
  }

  // Strip trailing blank lines from text
  while (textLines.length && !textLines[textLines.length - 1].trim()) textLines.pop();

  return { text: textLines.join('\n'), options };
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

function AssistantMessage({
  content,
  isLast,
  onOption,
}: {
  content: string;
  isLast: boolean;
  onOption: (key: string, label: string) => void;
}) {
  const { text, options } = parseOptions(content);

  const renderText = (t: string) =>
    t.split('\n').map((line, i, arr) => (
      <React.Fragment key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </React.Fragment>
    ));

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[90%] w-full">
        {text && (
          <div className="text-sm text-[#0d1b2a] leading-relaxed mb-3">
            {renderText(text)}
          </div>
        )}
        {options.length > 0 && (
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt.key}
                onClick={() => isLast && onOption(opt.key, opt.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isLast
                    ? 'border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] active:bg-[#e0f0ff] cursor-pointer'
                    : 'border-[#f1f5f9] text-[#94a3b8] cursor-default'
                }`}
              >
                <span
                  className={`text-xs font-bold min-w-[20px] ${
                    isLast ? 'text-[#2e86ab]' : 'text-[#cbd5e1]'
                  }`}
                >
                  {opt.key}
                </span>
                <span className={`text-sm ${isLast ? 'text-[#0d1b2a]' : 'text-[#94a3b8]'}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end mb-6">
      <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-[#f0f4f8] text-[#0d1b2a] text-sm leading-relaxed">
        {content.split('\n').map((line, i, arr) => (
          <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </React.Fragment>
        ))}
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

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInputValue('');
    addMessage({ role: 'user', content: text });
    setIsLoading(true);

    try {
      const history: GeminiMessage[] = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      history.push({ role: 'user', parts: [{ text }] });

      const response = await sendMessage(history);
      addMessage({ role: 'assistant', content: response });
    } catch {
      addMessage({ role: 'assistant', content: 'Si è verificato un errore. Riprova tra poco.' });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, addMessage]);

  const handleOptionTap = useCallback(
    (key: string, label: string) => {
      handleSend(`${key} — ${label}`);
    },
    [handleSend]
  );

  const isEmpty = messages.length === 0;

  const WELCOME_OPTIONS = [
    { key: '1', label: 'Capire un argomento da zero' },
    { key: '2', label: 'Studiare meglio qualcosa che sto già leggendo' },
    { key: '3', label: 'Chiarire una parte che non mi è chiara' },
    { key: '4', label: 'Memorizzare quello che ho già capito' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">

          {isEmpty ? (
            /* Welcome — fully touch: tap to start */
            <div className="py-8">
              <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-1">FEYMAN AG01</p>
              <h2 className="text-xl font-medium text-[#0d1b2a] mb-6">Come vuoi lavorare?</h2>
              <div className="space-y-2">
                {WELCOME_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => handleSend(`${opt.key} — ${opt.label}`)}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] active:bg-[#e0f0ff] transition-all text-left"
                  >
                    <span className="text-sm font-bold text-[#2e86ab] min-w-[20px]">{opt.key}</span>
                    <span className="text-sm text-[#0d1b2a]">{opt.label}</span>
                  </button>
                ))}
              </div>
              {/* Or type freely */}
              <p className="text-xs text-[#94a3b8] mt-6 text-center">oppure scrivi direttamente qui sotto</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) =>
                message.role === 'user' ? (
                  <UserMessage key={message.id} content={message.content} />
                ) : (
                  <AssistantMessage
                    key={message.id}
                    content={message.content}
                    isLast={index === messages.length - 1 && !isLoading}
                    onOption={handleOptionTap}
                  />
                )
              )}
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

      {/* Input */}
      <div className="border-t border-[#e2e8f0] px-4 md:px-8 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="relative border border-[#e2e8f0] rounded-2xl bg-white hover:border-[#2e86ab] focus-within:border-[#2e86ab] transition-colors">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(inputValue);
                }
              }}
              placeholder="Scrivi qui…"
              rows={1}
              disabled={isLoading}
              className="w-full px-4 py-3.5 pr-12 text-[#0d1b2a] placeholder-[#94a3b8] resize-none bg-transparent text-sm outline-none rounded-2xl leading-relaxed disabled:opacity-50"
              style={{ minHeight: '48px', maxHeight: '160px' }}
            />
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2.5 bottom-2.5 w-8 h-8 flex items-center justify-center rounded-lg bg-[#2e86ab] hover:bg-[#256f90] text-white transition-colors disabled:opacity-40"
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
