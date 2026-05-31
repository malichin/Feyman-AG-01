'use client';

import React, { useState } from 'react';
import { CreditCard, CheckSquare, List, MessageSquare, Shuffle, ChevronRight, ArrowLeft } from 'lucide-react';

type FilterStep = 'scope' | 'subject' | 'mode';
type Scope = '1' | '2' | '3';
type Mode = 'flashcard' | 'truefalse' | 'multiplechoice' | 'openanswer' | 'mixed';

const SUBJECTS = ['Matematica', 'Storia', 'Scienze', 'Lingue', 'Arte', 'Altro'];

const MODES: { id: Mode; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'flashcard',
    label: 'Flashcard',
    description: 'Domanda e risposta, girare la carta',
    icon: <CreditCard size={18} />,
  },
  {
    id: 'truefalse',
    label: 'Vero o Falso',
    description: 'Decidi se un\'affermazione è vera o falsa',
    icon: <CheckSquare size={18} />,
  },
  {
    id: 'multiplechoice',
    label: 'Scelta multipla',
    description: 'Scegli la risposta corretta tra quattro opzioni',
    icon: <List size={18} />,
  },
  {
    id: 'openanswer',
    label: 'Risposta aperta',
    description: 'Scrivi la risposta con parole tue',
    icon: <MessageSquare size={18} />,
  },
  {
    id: 'mixed',
    label: 'Sfida generale mista',
    description: 'Tutti i tipi di domande mischiate insieme',
    icon: <Shuffle size={18} />,
  },
];

function FlashcardDemo() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-sm text-[#64748b]">Esempio di flashcard</p>
      <button
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-sm h-48 border border-[#e2e8f0] rounded-2xl flex items-center justify-center cursor-pointer hover:border-[#2e86ab] transition-colors p-6 text-center"
        style={{
          background: flipped ? '#f0f8ff' : '#ffffff',
        }}
      >
        <div>
          <p className="text-xs text-[#64748b] mb-3 uppercase tracking-wider">
            {flipped ? 'Risposta' : 'Domanda'}
          </p>
          <p className="text-base text-[#0d1b2a] font-medium">
            {flipped
              ? 'La divisione di un polinomio per un binomio della forma (x − a), che dà zero come resto quando x = a'
              : 'Cos\'è il Teorema di Ruffini?'}
          </p>
          {!flipped && (
            <p className="text-xs text-[#94a3b8] mt-4">Clicca per vedere la risposta</p>
          )}
        </div>
      </button>
      <div className="flex gap-3">
        <button className="px-4 py-2 text-sm border border-[#e2e8f0] rounded-xl hover:bg-[#f8fafc] text-[#64748b] transition-colors">
          Non lo sapevo
        </button>
        <button className="px-4 py-2 text-sm bg-[#52b788] text-white rounded-xl hover:bg-[#3da674] transition-colors">
          Lo sapevo
        </button>
      </div>
    </div>
  );
}

function ComingSoon({ mode }: { mode: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl border border-[#e2e8f0] flex items-center justify-center mb-4 text-[#64748b]">
        <Shuffle size={20} />
      </div>
      <p className="text-sm font-medium text-[#0d1b2a] mb-1">{mode}</p>
      <p className="text-xs text-[#64748b] max-w-xs">
        Questa modalità sarà disponibile quando avrai creato dei contenuti nei tuoi Progetti.
      </p>
    </div>
  );
}

export default function PlayView() {
  const [step, setStep] = useState<FilterStep>('scope');
  const [scope, setScope] = useState<Scope | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [started, setStarted] = useState(false);

  const handleScopeSelect = (s: Scope) => {
    setScope(s);
    if (s === '1') {
      setStep('subject');
    } else {
      setStep('mode');
    }
  };

  const handleSubjectSelect = (subj: string) => {
    setSelectedSubject(subj);
    setStep('mode');
  };

  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode);
    setStarted(true);
  };

  const reset = () => {
    setStep('scope');
    setScope(null);
    setSelectedSubject(null);
    setSelectedMode(null);
    setStarted(false);
  };

  if (started && selectedMode) {
    const modeLabel = MODES.find((m) => m.id === selectedMode)?.label || selectedMode;
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] transition-colors"
            >
              <ArrowLeft size={15} />
              Cambia modalità
            </button>
          </div>
          <div className="mb-2">
            <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Modalità</p>
            <h2 className="text-xl font-semibold text-[#0d1b2a]">{modeLabel}</h2>
            {selectedSubject && (
              <p className="text-sm text-[#64748b] mt-0.5">{selectedSubject}</p>
            )}
          </div>
          {selectedMode === 'flashcard' ? (
            <FlashcardDemo />
          ) : (
            <ComingSoon mode={modeLabel} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#0d1b2a]">Play</h1>
          <p className="text-sm text-[#64748b] mt-1">Metti alla prova quello che hai imparato.</p>
        </div>

        {step === 'scope' && (
          <div>
            <p className="text-sm text-[#64748b] mb-4">Vuoi allenarti su:</p>
            <div className="space-y-2">
              {[
                { id: '1' as Scope, label: 'Un argomento specifico' },
                { id: '2' as Scope, label: 'Una materia intera' },
                { id: '3' as Scope, label: 'Tutte le materie insieme' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScopeSelect(item.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#2e86ab]">{item.id}</span>
                    <span className="text-sm text-[#0d1b2a]">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'subject' && (
          <div>
            <button
              onClick={() => setStep('scope')}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] mb-4 transition-colors"
            >
              <ArrowLeft size={15} />
              Indietro
            </button>
            <p className="text-sm text-[#64748b] mb-4">Scegli la materia:</p>
            <div className="space-y-2">
              {SUBJECTS.map((subj) => (
                <button
                  key={subj}
                  onClick={() => handleSubjectSelect(subj)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] transition-all text-left group"
                >
                  <span className="text-sm text-[#0d1b2a]">{subj}</span>
                  <ChevronRight size={16} className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'mode' && (
          <div>
            <button
              onClick={() => setStep(scope === '1' ? 'subject' : 'scope')}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] mb-4 transition-colors"
            >
              <ArrowLeft size={15} />
              Indietro
            </button>
            <p className="text-sm text-[#64748b] mb-4">Scegli la modalità:</p>
            <div className="space-y-2">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] transition-all text-left group"
                >
                  <span className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors flex-shrink-0">
                    {mode.icon}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#0d1b2a]">{mode.label}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{mode.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
