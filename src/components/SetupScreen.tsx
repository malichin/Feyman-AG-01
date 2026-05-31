'use client';

import React, { useState } from 'react';
import { Key, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { validateKey } from '@/lib/gemini';
import { saveApiKey } from '@/lib/storage';

export default function SetupScreen({ onDone }: { onDone: () => void }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirm = async () => {
    const key = apiKey.trim();
    if (!key) return;
    setStatus('loading');
    setErrorMsg('');
    const valid = await validateKey(key);
    if (valid) {
      saveApiKey(key);
      onDone();
    } else {
      setStatus('error');
      setErrorMsg('Chiave non valida o API non raggiungibile. Riprova.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 bg-white">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#f0f8ff] flex items-center justify-center">
            <Key size={28} className="text-[#2e86ab]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-[#0d1b2a] text-center mb-2">
          Configura la tua chiave API
        </h1>
        <p className="text-sm text-[#64748b] text-center mb-8 leading-relaxed">
          FEYMAN AG01 usa Gemini gratuitamente. Basta creare una chiave personale — ci vogliono 2 minuti.
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          <Step n={1}>
            Vai su{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2e86ab] font-medium inline-flex items-center gap-1"
            >
              aistudio.google.com/apikey
              <ExternalLink size={12} />
            </a>
          </Step>
          <Step n={2}>Accedi con il tuo account Google</Step>
          <Step n={3}>Clicca <strong>Crea chiave API</strong></Step>
          <Step n={4}>Copia la chiave e incollala qui sotto</Step>
        </div>

        {/* Input */}
        <div className="mb-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
            placeholder="AIza..."
            className={`w-full px-4 py-3.5 text-sm rounded-xl border outline-none transition-colors bg-white text-[#0d1b2a] placeholder-[#94a3b8] ${
              status === 'error'
                ? 'border-[#ef4444] focus:border-[#ef4444]'
                : 'border-[#e2e8f0] focus:border-[#2e86ab]'
            }`}
          />
          {status === 'error' && (
            <p className="text-xs text-[#ef4444] mt-2">{errorMsg}</p>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleConfirm}
          disabled={!apiKey.trim() || status === 'loading'}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#2e86ab] hover:bg-[#256f90] text-white text-sm font-medium transition-colors disabled:opacity-40"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Verifica in corso…
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Verifica e salva
            </>
          )}
        </button>

        <p className="text-[11px] text-[#94a3b8] mt-5 text-center leading-relaxed">
          La chiave viene salvata solo sul tuo dispositivo e non viene mai inviata ai nostri server.
        </p>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f0f8ff] text-[#2e86ab] text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-sm text-[#0d1b2a] leading-relaxed">{children}</span>
    </div>
  );
}
