'use client';

import React, { useState } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

type FilterStep = 'scope' | 'subject' | 'technique';
type Scope = '1' | '2' | '3';

const SUBJECTS = ['Matematica', 'Storia', 'Scienze', 'Lingue', 'Arte', 'Altro'];

const TECHNIQUES = [
  {
    id: 'feynman',
    label: 'Metodo Feynman',
    description:
      'Spiega il concetto come se lo insegnassi a qualcuno che non sa nulla. Identifica i buchi nella tua comprensione e torna a studiarli.',
    steps: [
      'Scegli il concetto da studiare',
      'Spiegalo con parole semplici, come a un bambino',
      'Identifica dove ti inceppi',
      'Rivedi il materiale su quei punti',
      'Rispiega, semplificando ancora',
    ],
  },
  {
    id: 'spaced',
    label: 'Ripetizione spaziata',
    description:
      'Ripassa il materiale a intervalli crescenti: dopo 1 giorno, poi 3, poi 7, poi 14, poi 30 giorni. Il dimenticare parziale rafforza la memoria.',
    steps: [
      'Studia il materiale una prima volta',
      'Rivedi dopo 1 giorno',
      'Rivedi dopo 3 giorni',
      'Rivedi dopo 1 settimana',
      'Rivedi dopo 2 settimane, poi 1 mese',
    ],
  },
  {
    id: 'active',
    label: 'Richiamo attivo',
    description:
      'Invece di rileggere, chiudi il libro e cerca di ricordare tutto. L\'atto di recuperare l\'informazione la consolida molto più della rilettura.',
    steps: [
      'Leggi o studia il materiale',
      'Chiudi tutto',
      'Scrivi o dì ad alta voce tutto quello che ricordi',
      'Controlla cosa mancava',
      'Ripeti',
    ],
  },
  {
    id: 'mindmap',
    label: 'Mappa mentale',
    description:
      'Disegna il concetto centrale e ramifica le idee correlate. Visivo e spaziale aiuta a capire le connessioni.',
    steps: [
      'Scrivi il concetto principale al centro',
      'Aggiungi rami principali per ogni sotto-argomento',
      'Da ogni ramo, aggiungi dettagli e esempi',
      'Usa colori e simboli per distinguere',
      'Ricrea la mappa a memoria dopo qualche ora',
    ],
  },
  {
    id: 'storytelling',
    label: 'Storytelling',
    description:
      'Trasforma le informazioni da memorizzare in una storia con personaggi e trama. Le storie si ricordano molto più facilmente dei fatti isolati.',
    steps: [
      'Identifica i punti chiave da ricordare',
      'Crea personaggi che rappresentino i concetti',
      'Costruisci una trama logica',
      'Aggiungi dettagli vividi e assurdi',
      'Racconta la storia ad alta voce',
    ],
  },
  {
    id: 'chunking',
    label: 'Chunking',
    description:
      'Raggruppa le informazioni in blocchi significativi. Il cervello gestisce meglio 4-7 elementi per blocco che decine di elementi separati.',
    steps: [
      'Elenca tutte le informazioni da ricordare',
      'Trovare pattern o categorie comuni',
      'Raggruppa in blocchi di 5-7 elementi',
      'Dai un nome a ogni blocco',
      'Memorizza i nomi dei blocchi, poi i dettagli',
    ],
  },
  {
    id: 'loci',
    label: 'Palazzo della Memoria (Loci)',
    description:
      'Associa ogni informazione a un luogo fisico che conosci bene (casa, scuola). Quando vuoi ricordare, fai un tour mentale del luogo.',
    steps: [
      'Scegli un luogo familiare',
      'Definisci un percorso con stazioni fisse',
      'Associa ogni informazione a una stazione',
      'Rendi l\'associazione vivida e strana',
      'Rivivi mentalmente il percorso per ricordare',
    ],
  },
  {
    id: 'acronyms',
    label: 'Acronimi e Acrostici',
    description:
      'Crea parole o frasi usando le iniziali delle cose da ricordare. "OGNI BUON RE DOVREBBE AVERE FANTASIA" per l\'ordine delle note musicali.',
    steps: [
      'Elenca i concetti nell\'ordine giusto',
      'Prendi la prima lettera di ognuno',
      'Forma una parola o frase memorabile',
      'Assicurati che sia strana o divertente',
      'Ripetila ad alta voce più volte',
    ],
  },
  {
    id: 'pomodoro',
    label: 'Tecnica Pomodoro',
    description:
      'Lavora in sessioni concentrate di 25 minuti seguite da 5 minuti di pausa. Dopo 4 pomodori, fai una pausa lunga di 15-30 minuti.',
    steps: [
      'Scegli un compito da completare',
      'Imposta un timer a 25 minuti',
      'Lavora senza interruzioni',
      'Prendi 5 minuti di pausa',
      'Ogni 4 cicli: pausa lunga di 15-30 minuti',
    ],
  },
];

function TechniqueDetail({ technique }: { technique: typeof TECHNIQUES[0]; onBack: () => void }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#0d1b2a]">{technique.label}</h2>
        <p className="text-sm text-[#64748b] mt-2 leading-relaxed">{technique.description}</p>
      </div>

      <div>
        <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider mb-3">
          Come si applica
        </p>
        <div className="space-y-2">
          {technique.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <span className="w-6 h-6 rounded-full bg-[#f0f8ff] border border-[#2e86ab]/20 flex items-center justify-center text-xs font-semibold text-[#2e86ab] flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-[#0d1b2a] leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MemoryView() {
  const [step, setStep] = useState<FilterStep>('scope');
  const [scope, setScope] = useState<Scope | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<typeof TECHNIQUES[0] | null>(null);

  const handleScopeSelect = (s: Scope) => {
    setScope(s);
    if (s === '1') {
      setStep('subject');
    } else {
      setStep('technique');
    }
  };

  const handleSubjectSelect = (subj: string) => {
    setSelectedSubject(subj);
    setStep('technique');
  };

  const reset = () => {
    setStep('scope');
    setScope(null);
    setSelectedSubject(null);
    setSelectedTechnique(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-[#0d1b2a]">Memoria</h1>
          <p className="text-sm text-[#64748b] mt-1">Tecniche per ricordare meglio e più a lungo.</p>
        </div>

        {step === 'scope' && (
          <div>
            <p className="text-sm text-[#64748b] mb-4">Stai studiando:</p>
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

        {step === 'technique' && !selectedTechnique && (
          <div>
            <button
              onClick={() => setStep(scope === '1' ? 'subject' : 'scope')}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] mb-4 transition-colors"
            >
              <ArrowLeft size={15} />
              Indietro
            </button>
            {selectedSubject && (
              <p className="text-sm text-[#64748b] mb-4">Materia: <span className="font-medium text-[#0d1b2a]">{selectedSubject}</span></p>
            )}
            <p className="text-sm text-[#64748b] mb-4">Scegli una tecnica:</p>
            <div className="space-y-2">
              {TECHNIQUES.map((tech) => (
                <button
                  key={tech.id}
                  onClick={() => setSelectedTechnique(tech)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl border border-[#e2e8f0] hover:border-[#2e86ab] hover:bg-[#f0f8ff] transition-all text-left group"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0d1b2a]">{tech.label}</p>
                    <p className="text-xs text-[#64748b] mt-0.5 line-clamp-1">{tech.description.slice(0, 60)}…</p>
                  </div>
                  <ChevronRight size={16} className="text-[#64748b] group-hover:text-[#2e86ab] transition-colors flex-shrink-0 ml-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'technique' && selectedTechnique && (
          <div>
            <button
              onClick={() => setSelectedTechnique(null)}
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0d1b2a] mb-6 transition-colors"
            >
              <ArrowLeft size={15} />
              Tutte le tecniche
            </button>
            <TechniqueDetail
              technique={selectedTechnique}
              onBack={() => setSelectedTechnique(null)}
            />
            <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
              <button
                onClick={reset}
                className="text-sm text-[#64748b] hover:text-[#0d1b2a] transition-colors"
              >
                Ricomincia da capo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
