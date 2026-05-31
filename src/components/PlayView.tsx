'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckSquare,
  List,
  MessageSquare,
  Shuffle,
  ChevronRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  generateFlashcards,
  generateMultipleChoice,
  generateTrueFalse,
  Flashcard,
  QuizQuestion,
  TrueFalseQuestion,
} from '@/lib/gemini';

type Step = 'topic' | 'mode' | 'playing';
type Mode = 'flashcard' | 'truefalse' | 'multiplechoice' | 'openanswer' | 'mixed';

const MODES: { id: Mode; label: string; description: string; icon: React.ReactNode }[] = [
  { id: 'flashcard', label: 'Flashcard', description: 'Domanda e risposta, gira la carta', icon: <CreditCard size={18} /> },
  { id: 'truefalse', label: 'Vero o Falso', description: "Decidi se un'affermazione è vera o falsa", icon: <CheckSquare size={18} /> },
  { id: 'multiplechoice', label: 'Scelta multipla', description: 'Scegli la risposta corretta', icon: <List size={18} /> },
  { id: 'openanswer', label: 'Risposta aperta', description: 'Scrivi la risposta con parole tue', icon: <MessageSquare size={18} /> },
  { id: 'mixed', label: 'Sfida mista', description: 'Tutti i tipi mescolati insieme', icon: <Shuffle size={18} /> },
];

// ── Flashcard game ─────────────────────────────────────────────────────────────

function FlashcardGame({ topic, onEnd }: { topic: string; onEnd: (score: number, total: number) => void }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    generateFlashcards(topic).then((result) => {
      if (result.length === 0) setError('Impossibile generare le flashcard. Controlla la connessione.');
      else setCards(result);
      setLoading(false);
    });
  }, [topic]);

  if (loading) return <LoadingScreen text="Creo le flashcard…" />;
  if (error) return <ErrorScreen message={error} />;

  const card = cards[index];

  const next = (knew: boolean) => {
    const newScore = knew ? score + 1 : score;
    if (index + 1 >= cards.length) {
      onEnd(newScore, cards.length);
    } else {
      setScore(newScore);
      setIndex(index + 1);
      setFlipped(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <p className="text-xs text-[#94a3b8]">{index + 1} / {cards.length}</p>

      <button
        onClick={() => setFlipped(!flipped)}
        className="w-full max-w-sm min-h-44 border border-[#e2e8f0] rounded-2xl flex items-center justify-center cursor-pointer hover:border-[#2e86ab] transition-colors p-6 text-center"
        style={{ background: flipped ? '#f0f8ff' : '#ffffff' }}
      >
        <div>
          <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-3">
            {flipped ? 'Risposta' : 'Domanda'}
          </p>
          <p className="text-base text-[#0d1b2a]">{flipped ? card.back : card.front}</p>
          {!flipped && <p className="text-xs text-[#94a3b8] mt-4">Tocca per girare</p>}
        </div>
      </button>

      {flipped && (
        <div className="flex gap-3 w-full max-w-sm">
          <button
            onClick={() => next(false)}
            className="flex-1 py-2.5 text-sm border border-[#e2e8f0] rounded-xl hover:bg-[#f8fafc] text-[#64748b] transition-colors"
          >
            Non lo sapevo
          </button>
          <button
            onClick={() => next(true)}
            className="flex-1 py-2.5 text-sm bg-[#52b788] text-white rounded-xl hover:bg-[#3da674] transition-colors"
          >
            Lo sapevo
          </button>
        </div>
      )}
    </div>
  );
}

// ── True / False game ──────────────────────────────────────────────────────────

function TrueFalseGame({ topic, onEnd }: { topic: string; onEnd: (score: number, total: number) => void }) {
  const [questions, setQuestions] = useState<TrueFalseQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    generateTrueFalse(topic).then((result) => {
      if (result.length === 0) setError('Impossibile generare le domande.');
      else setQuestions(result);
      setLoading(false);
    });
  }, [topic]);

  if (loading) return <LoadingScreen text="Creo le domande…" />;
  if (error) return <ErrorScreen message={error} />;

  const q = questions[index];
  const isCorrect = chosen === q.answer;

  const next = () => {
    const newScore = isCorrect ? score + 1 : score;
    if (index + 1 >= questions.length) onEnd(newScore, questions.length);
    else { setScore(newScore); setIndex(index + 1); setChosen(null); }
  };

  return (
    <div className="flex flex-col gap-6 py-6">
      <p className="text-xs text-[#94a3b8] text-center">{index + 1} / {questions.length}</p>

      <div className="border border-[#e2e8f0] rounded-2xl p-6">
        <p className="text-sm font-medium text-[#0d1b2a] leading-relaxed">{q.statement}</p>
      </div>

      {chosen === null ? (
        <div className="flex gap-3">
          <button
            onClick={() => setChosen(true)}
            className="flex-1 py-3 text-sm border border-[#e2e8f0] rounded-xl hover:border-[#52b788] hover:bg-[#f0fdf4] text-[#0d1b2a] transition-all"
          >
            Vero
          </button>
          <button
            onClick={() => setChosen(false)}
            className="flex-1 py-3 text-sm border border-[#e2e8f0] rounded-xl hover:border-[#ef4444] hover:bg-[#fef2f2] text-[#0d1b2a] transition-all"
          >
            Falso
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl ${isCorrect ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#dc2626]'}`}>
            {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
            <span className="text-sm font-medium">{isCorrect ? 'Corretto!' : `Sbagliato — era ${q.answer ? 'Vero' : 'Falso'}`}</span>
          </div>
          <p className="text-xs text-[#64748b] px-1">{q.explanation}</p>
          <button
            onClick={next}
            className="py-2.5 text-sm bg-[#2e86ab] text-white rounded-xl hover:bg-[#256f90] transition-colors"
          >
            Prossima →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Multiple choice game ───────────────────────────────────────────────────────

function MultipleChoiceGame({ topic, onEnd }: { topic: string; onEnd: (score: number, total: number) => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    generateMultipleChoice(topic).then((result) => {
      if (result.length === 0) setError('Impossibile generare le domande.');
      else setQuestions(result);
      setLoading(false);
    });
  }, [topic]);

  if (loading) return <LoadingScreen text="Creo le domande…" />;
  if (error) return <ErrorScreen message={error} />;

  const q = questions[index];
  const isCorrect = chosen === q.correct;

  const next = () => {
    const newScore = isCorrect ? score + 1 : score;
    if (index + 1 >= questions.length) onEnd(newScore, questions.length);
    else { setScore(newScore); setIndex(index + 1); setChosen(null); }
  };

  return (
    <div className="flex flex-col gap-5 py-6">
      <p className="text-xs text-[#94a3b8] text-center">{index + 1} / {questions.length}</p>

      <div className="border border-[#e2e8f0] rounded-2xl p-5">
        <p className="text-sm font-medium text-[#0d1b2a] leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ';
          if (chosen === null) {
            cls += 'border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] text-[#0d1b2a]';
          } else if (i === q.correct) {
            cls += 'border-[#52b788] bg-[#f0fdf4] text-[#15803d] font-medium';
          } else if (i === chosen) {
            cls += 'border-[#ef4444] bg-[#fef2f2] text-[#dc2626]';
          } else {
            cls += 'border-[#e2e8f0] text-[#94a3b8]';
          }
          return (
            <button key={i} className={cls} onClick={() => chosen === null && setChosen(i)} disabled={chosen !== null}>
              <span className="font-semibold mr-2 text-[#94a3b8]">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {chosen !== null && (
        <button onClick={next} className="py-2.5 text-sm bg-[#2e86ab] text-white rounded-xl hover:bg-[#256f90] transition-colors">
          Prossima →
        </button>
      )}
    </div>
  );
}

// ── Open answer game ───────────────────────────────────────────────────────────

function OpenAnswerGame({ topic, onEnd }: { topic: string; onEnd: (score: number, total: number) => void }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    generateFlashcards(topic, 6).then((result) => {
      if (result.length === 0) setError('Impossibile generare le domande.');
      else setCards(result);
      setLoading(false);
    });
  }, [topic]);

  if (loading) return <LoadingScreen text="Creo le domande…" />;
  if (error) return <ErrorScreen message={error} />;

  const card = cards[index];

  const next = (knew: boolean) => {
    const newScore = knew ? score + 1 : score;
    if (index + 1 >= cards.length) onEnd(newScore, cards.length);
    else { setScore(newScore); setIndex(index + 1); setAnswer(''); setRevealed(false); }
  };

  return (
    <div className="flex flex-col gap-5 py-6">
      <p className="text-xs text-[#94a3b8] text-center">{index + 1} / {cards.length}</p>

      <div className="border border-[#e2e8f0] rounded-2xl p-5">
        <p className="text-sm font-medium text-[#0d1b2a]">{card.front}</p>
      </div>

      {!revealed ? (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Scrivi la tua risposta…"
            rows={4}
            className="w-full border border-[#e2e8f0] rounded-xl p-3 text-sm text-[#0d1b2a] outline-none focus:border-[#2e86ab] resize-none"
          />
          <button
            onClick={() => setRevealed(true)}
            disabled={!answer.trim()}
            className="py-2.5 text-sm bg-[#2e86ab] text-white rounded-xl hover:bg-[#256f90] disabled:opacity-40 transition-colors"
          >
            Vedi risposta
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">La tua risposta</p>
            <p className="text-sm text-[#0d1b2a] bg-[#f8fafc] rounded-xl p-3">{answer}</p>
          </div>
          <div>
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Risposta corretta</p>
            <p className="text-sm text-[#0d1b2a] bg-[#f0f8ff] rounded-xl p-3">{card.back}</p>
          </div>
          <p className="text-xs text-[#64748b]">Quanto eri vicino?</p>
          <div className="flex gap-3">
            <button onClick={() => next(false)} className="flex-1 py-2.5 text-sm border border-[#e2e8f0] rounded-xl hover:bg-[#f8fafc] text-[#64748b] transition-colors">
              Lontano
            </button>
            <button onClick={() => next(true)} className="flex-1 py-2.5 text-sm bg-[#52b788] text-white rounded-xl hover:bg-[#3da674] transition-colors">
              Giusto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score screen ───────────────────────────────────────────────────────────────

function ScoreScreen({ score, total, onRestart, onBack }: { score: number; total: number; onRestart: () => void; onBack: () => void }) {
  const pct = Math.round((score / total) * 100);
  const label = pct >= 80 ? 'Ottimo!' : pct >= 50 ? 'Bene!' : 'Continua a studiare.';
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="w-20 h-20 rounded-full border-2 border-[#2e86ab] flex items-center justify-center">
        <span className="text-2xl font-bold text-[#2e86ab]">{pct}%</span>
      </div>
      <div>
        <p className="text-lg font-semibold text-[#0d1b2a]">{label}</p>
        <p className="text-sm text-[#64748b] mt-1">{score} risposte corrette su {total}</p>
      </div>
      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onRestart} className="flex-1 py-2.5 text-sm border border-[#e2e8f0] rounded-xl hover:bg-[#f8fafc] text-[#64748b] transition-colors">
          Riprova
        </button>
        <button onClick={onBack} className="flex-1 py-2.5 text-sm bg-[#2e86ab] text-white rounded-xl hover:bg-[#256f90] transition-colors">
          Fine
        </button>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#64748b]">
      <Loader2 size={24} className="animate-spin text-[#2e86ab]" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <XCircle size={24} className="text-[#ef4444]" />
      <p className="text-sm text-[#64748b]">{message}</p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function PlayView() {
  const [step, setStep] = useState<Step>('topic');
  const [topicInput, setTopicInput] = useState('');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<Mode | null>(null);
  const [gameKey, setGameKey] = useState(0);
  const [score, setScore] = useState<{ score: number; total: number } | null>(null);

  const handleTopicSubmit = () => {
    const t = topicInput.trim();
    if (!t) return;
    setTopic(t);
    setStep('mode');
  };

  const handleModeSelect = (m: Mode) => {
    setMode(m);
    setScore(null);
    setGameKey((k) => k + 1);
    setStep('playing');
  };

  const handleEnd = (s: number, total: number) => setScore({ score: s, total });

  const reset = () => {
    setStep('topic');
    setTopicInput('');
    setTopic('');
    setMode(null);
    setScore(null);
  };

  if (step === 'topic') {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#0d1b2a]">Play</h1>
            <p className="text-sm text-[#64748b] mt-1">Metti alla prova quello che sai.</p>
          </div>
          <p className="text-sm text-[#64748b] mb-3">Su quale argomento vuoi allenarti?</p>
          <input
            autoFocus
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTopicSubmit()}
            placeholder="Es. La Rivoluzione Francese, Le frazioni, Il corpo umano…"
            className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#0d1b2a] outline-none focus:border-[#2e86ab] bg-white"
          />
          <button
            onClick={handleTopicSubmit}
            disabled={!topicInput.trim()}
            className="mt-3 w-full py-3 text-sm bg-[#2e86ab] text-white rounded-xl hover:bg-[#256f90] disabled:opacity-40 transition-colors"
          >
            Continua →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'mode') {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setStep('topic')} className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] mb-6 transition-colors">
            <ArrowLeft size={15} /> Indietro
          </button>
          <div className="mb-6">
            <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Argomento</p>
            <h2 className="text-lg font-semibold text-[#0d1b2a]">{topic}</h2>
          </div>
          <p className="text-sm text-[#64748b] mb-4">Scegli la modalità:</p>
          <div className="space-y-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeSelect(m.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] transition-all text-left group"
              >
                <span className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors flex-shrink-0">{m.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#0d1b2a]">{m.label}</p>
                  <p className="text-xs text-[#64748b] mt-0.5">{m.description}</p>
                </div>
                <ChevronRight size={15} className="ml-auto text-[#64748b] group-hover:text-[#2e86ab]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // playing
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setStep('mode')} className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] transition-colors">
            <ArrowLeft size={15} /> Cambia modalità
          </button>
        </div>
        <div className="mb-2">
          <p className="text-xs text-[#94a3b8] uppercase tracking-wider">{MODES.find((m) => m.id === mode)?.label}</p>
          <h2 className="text-base font-semibold text-[#0d1b2a]">{topic}</h2>
        </div>

        {score ? (
          <ScoreScreen
            score={score.score}
            total={score.total}
            onRestart={() => { setScore(null); setGameKey((k) => k + 1); }}
            onBack={reset}
          />
        ) : (
          <>
            {mode === 'flashcard' && <FlashcardGame key={gameKey} topic={topic} onEnd={handleEnd} />}
            {mode === 'truefalse' && <TrueFalseGame key={gameKey} topic={topic} onEnd={handleEnd} />}
            {mode === 'multiplechoice' && <MultipleChoiceGame key={gameKey} topic={topic} onEnd={handleEnd} />}
            {mode === 'openanswer' && <OpenAnswerGame key={gameKey} topic={topic} onEnd={handleEnd} />}
            {mode === 'mixed' && <FlashcardGame key={gameKey} topic={topic} onEnd={handleEnd} />}
          </>
        )}
      </div>
    </div>
  );
}
