'use client';

import React, { useState } from 'react';
import { X, Key, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { validateKey } from '@/lib/gemini';
import { saveApiKey, clearApiKey, getApiKey } from '@/lib/storage';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const currentKey = getApiKey();
  const maskedKey = currentKey ? `${currentKey.slice(0, 6)}${'•'.repeat(20)}` : '';

  const [newKey, setNewKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'saved'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    const key = newKey.trim();
    if (!key) return;
    setStatus('loading');
    setErrorMsg('');
    const valid = await validateKey(key);
    if (valid) {
      saveApiKey(key);
      setStatus('saved');
      setNewKey('');
      setTimeout(() => setStatus('idle'), 2000);
    } else {
      setStatus('error');
      setErrorMsg('Chiave non valida. Controlla e riprova.');
    }
  };

  const handleRemove = () => {
    clearApiKey();
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[#2e86ab]" />
            <span className="text-sm font-medium text-[#0d1b2a]">Impostazioni API</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f8fafc] text-[#64748b] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Current key */}
          {currentKey && (
            <div>
              <p className="text-xs text-[#64748b] mb-1.5 font-medium uppercase tracking-wider">Chiave attiva</p>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <span className="text-sm text-[#0d1b2a] flex-1 font-mono">{maskedKey}</span>
                <button
                  onClick={handleRemove}
                  className="text-[#94a3b8] hover:text-[#ef4444] transition-colors"
                  title="Rimuovi chiave"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Change key */}
          <div>
            <p className="text-xs text-[#64748b] mb-1.5 font-medium uppercase tracking-wider">
              {currentKey ? 'Cambia chiave' : 'Inserisci chiave'}
            </p>
            <input
              type="password"
              value={newKey}
              onChange={(e) => {
                setNewKey(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="AIza..."
              className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition-colors bg-white text-[#0d1b2a] placeholder-[#94a3b8] ${
                status === 'error'
                  ? 'border-[#ef4444]'
                  : 'border-[#e2e8f0] focus:border-[#2e86ab]'
              }`}
            />
            {status === 'error' && (
              <p className="text-xs text-[#ef4444] mt-1.5">{errorMsg}</p>
            )}
            {status === 'saved' && (
              <p className="text-xs text-[#52b788] mt-1.5">Chiave salvata!</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!newKey.trim() || status === 'loading'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2e86ab] hover:bg-[#256f90] text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Verifica…
              </>
            ) : (
              <>
                <CheckCircle size={15} />
                Salva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
