'use client';

import React, { useState } from 'react';
import { Camera, FileText, Link, PenLine, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const inputTypes = [
  { icon: <Camera size={20} />, label: 'Foto', description: 'Carica un\'immagine' },
  { icon: <FileText size={20} />, label: 'PDF', description: 'Carica un documento' },
  { icon: <Link size={20} />, label: 'Link', description: 'Incolla un URL' },
  { icon: <PenLine size={20} />, label: 'Testo', description: 'Scrivi direttamente' },
];

export default function HomeScreen() {
  const { startNewSession } = useApp();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startNewSession();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startNewSession();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16">
      {/* Title */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-light text-[#0d1b2a] tracking-tight mb-2">
          Ciao, sono <span className="font-semibold text-[#2e86ab]">FEYMAN</span>
        </h1>
        <p className="text-[#64748b] text-base">Il tuo tutor personale basato sul metodo Feynman</p>
      </div>

      {/* Main input */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative border border-[#e2e8f0] rounded-2xl bg-white hover:border-[#2e86ab] transition-colors focus-within:border-[#2e86ab]">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Da dove partiamo oggi?"
            rows={3}
            className="w-full px-5 py-4 pr-14 text-[#0d1b2a] placeholder-[#94a3b8] resize-none bg-transparent text-base outline-none rounded-2xl"
          />
          <button
            type="submit"
            className="absolute right-3 bottom-3 w-9 h-9 flex items-center justify-center rounded-xl bg-[#2e86ab] hover:bg-[#256f90] text-white transition-colors"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </form>

      {/* Input type icons */}
      <div className="flex gap-6 mt-8">
        {inputTypes.map((type) => (
          <button
            key={type.label}
            onClick={startNewSession}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-11 h-11 flex items-center justify-center rounded-xl border border-[#e2e8f0] text-[#64748b] group-hover:border-[#2e86ab] group-hover:text-[#2e86ab] transition-colors bg-white">
              {type.icon}
            </div>
            <span className="text-xs text-[#64748b] group-hover:text-[#2e86ab] transition-colors">
              {type.label}
            </span>
          </button>
        ))}
      </div>

      {/* Subtitle hint */}
      <p className="mt-12 text-xs text-[#94a3b8] text-center max-w-sm leading-relaxed">
        Puoi condividere un argomento, caricare un testo o chiedere di spiegarti qualcosa da zero.
      </p>
    </div>
  );
}
