// Contenuto statico del programma: nessun dato utente qui.
// Ogni voce è riconducibile a una fonte in scientificSources.
var Program = (function () {
  var safetyDisclaimer =
    'Questo programma si basa su linee guida scientifiche generali, non è un ' +
    'consulto medico personalizzato. Dato il dolore/fastidio a ginocchio e ' +
    'tendini che hai riferito: se un esercizio provoca dolore acuto (diverso ' +
    'dal normale affaticamento muscolare), fermati. Indipendentemente dal ' +
    'giorno del programma, se quel giorno il ginocchio/tendine fa più male del ' +
    'solito, salta o alleggerisci gli esercizi su quella zona: la rotazione ' +
    'fissa non sa se hai già giocato a calcio o padel. Se il fastidio persiste ' +
    'o peggiora nel tempo, consulta un fisioterapista o un ortopedico.';

  var schedule = [
    {
      day: 1,
      focus: 'Core + Schiena',
      durationMin: 12,
      exercises: [
        { name: 'Plank', target: '3 x 30-45s', note: 'Schiena dritta, non far cadere i fianchi.', image: 'assets/exercises/forearm-plank.png' },
        { name: 'Bird-dog', target: '3 x 8 per lato', note: 'Movimento lento e controllato.', image: 'assets/exercises/bird-dog.png' },
        { name: 'Superman hold', target: '3 x 20-30s', note: 'Solleva braccia e gambe di poco, senza forzare la zona lombare.', image: 'assets/exercises/superman.png' },
        { name: 'Dead bug', target: '3 x 10 per lato', note: 'Schiena sempre appoggiata a terra.', image: 'assets/exercises/dead-bug.png' }
      ]
    },
    {
      day: 2,
      focus: 'Ginocchio / Tendini + Polpacci',
      durationMin: 13,
      exercises: [
        { name: 'Spanish squat o Wall sit isometrico', target: '3 x 30-45s', note: 'Isometria: nessun movimento, solo tenuta. Fonte: Cook & Rio, Lim et al. 2018.', image: 'assets/exercises/wall-sit.png' },
        { name: 'Eccentric calf raise (heel drop)', target: '3 x 12-15', note: 'Fase di discesa lenta (3-4s). Protocollo Alfredson per il tendine d\'Achille.', image: 'assets/exercises/calf-raise.png' },
        { name: 'Glute bridge', target: '3 x 12', note: 'Spinge con i talloni, contrai i glutei in alto.', image: 'assets/exercises/glute-bridge.png' },
        { name: 'Clamshell', target: '2 x 12 per lato', note: 'Rinforza l\'anca per ridurre lo stress sul ginocchio.', image: 'assets/exercises/clamshell.png' }
      ]
    },
    {
      day: 3,
      focus: 'Spalle + Core',
      durationMin: 11,
      exercises: [
        { name: 'Wall slides', target: '2 x 10', note: 'Schiena e braccia a contatto col muro per tutto il movimento.', image: 'assets/exercises/wall-slides.png' },
        { name: 'Prone Y-T-W raises', target: '2 x 10 per lettera', note: 'A pancia in giù, senza elastico, movimenti piccoli e controllati.', image: 'assets/exercises/y-t-w.png' },
        { name: 'Plank shoulder taps', target: '3 x 20 tocchi', note: 'Bacino fermo, non ruotare i fianchi.', image: 'assets/exercises/plank.png' },
        { name: 'Side plank', target: '2 x 20-30s per lato', note: 'Corpo in linea retta.', image: 'assets/exercises/side-plank.png' }
      ]
    },
    {
      day: 4,
      focus: 'Cosce (quad/hamstring) + stabilità ginocchio',
      durationMin: 13,
      exercises: [
        { name: 'Squat a corpo libero', target: '3 x 10', note: 'Solo nel range di movimento indolore.', image: 'assets/exercises/squat.png' },
        { name: 'Step-up basso', target: '2 x 8 per lato', note: 'Gradino basso, salita controllata, niente slancio.', image: 'assets/exercises/step-up.png' },
        { name: 'Hamstring bridge', target: '3 x 12', note: 'Talloni appoggiati, spinta con i femorali.', image: 'assets/exercises/glute-bridge.png' },
        { name: 'Terminal knee extension isometrica', target: '2 x 8 (tenute da 15s)', note: 'Piccola estensione finale del ginocchio, utile per la stabilità.', image: 'assets/exercises/terminal-knee-extension.png' }
      ]
    },
    {
      day: 5,
      focus: 'Circuito metabolico a basso impatto',
      durationMin: 12,
      exercises: [
        { name: 'Squat lenti', target: '4 giri x 30-40s lavoro / 20s recupero', note: 'Nessun salto: nessun impatto extra su ginocchio/tendini.', image: 'assets/exercises/squat.png' },
        { name: 'Mountain climber lento', target: 'incluso nel circuito', note: 'Ritmo controllato, non esplosivo.', image: 'assets/exercises/mountain-climber.png' },
        { name: 'Marcia alta sul posto', target: 'incluso nel circuito', note: 'Ginocchia alte ma appoggio morbido.', image: 'assets/exercises/marching.png' },
        { name: 'Plank-to-push-up', target: 'incluso nel circuito', note: 'Movimento lento, core stabile.', image: 'assets/exercises/plank-pushup.png' }
      ]
    }
  ];

  var morningRoutine = {
    steps: [
      'Appena sveglio: qualche minuto vicino a una finestra o all\'aperto per la luce naturale (aiuta il ritmo del sonno la sera dopo).',
      'Allenamento del giorno dal programma (10-13 min).',
      'Meditazione/respirazione guidata 5-10 min: siediti comodo, 4 secondi di inspirazione, 6 di espirazione, ripeti focalizzandoti solo sul respiro.'
    ],
    note: 'Orario di sveglia il più possibile costante: aiuta l\'effetto della luce mattutina sul sonno notturno.'
  };

  var prematchRitual = {
    title: 'Rituale pre-partita (calcio/padel)',
    recipe: '1L di acqua + un cucchiaio abbondante di bicarbonato (~15-20g) + succo di limone, a volte + zenzero/curcuma.',
    timing: 'Da bere 60-180 minuti prima dello sforzo intenso, non a ridosso della partita.',
    caution: 'Dose già in linea con la letteratura sportiva. Presta attenzione a eventuali disturbi di stomaco; è pensato per sforzi intensi occasionali, non come abitudine multi-quotidiana (carico di sodio nel lungo periodo).',
    note: 'Il limone è solo per il gusto. Zenzero/curcuma qui danno un contributo minore rispetto a estratti standardizzati (vedi nutritionTips), ma non fanno male.'
  };

  var nutritionTips = [
    'Deficit calorico moderato (circa 500 kcal/giorno sotto il tuo fabbisogno): fa perdere peso senza intaccare troppo massa magra e metabolismo.',
    'Se dopo 2 settimane il peso non scende, riduci altre 150-200 kcal; se scende più di ~1%/settimana, aggiungine 150.',
    'Non saltare colazione e pranzo per "risparmiare" calorie per la sera: è associato a più fame e sovralimentazione serale, l\'opposto di quello che vuoi ottenere con la cena leggera.',
    'Metti una fonte proteica (uova, yogurt greco, legumi, carne/pesce) anche a colazione e pranzo: a 50 anni servono circa 30-40g di proteine per pasto per stimolare bene la sintesi muscolare, non tutte concentrate a cena.',
    'Grassi insaturi (olio d\'oliva, noci, avocado) al posto dei grassi saturi, e fibra (verdura, legumi, cereali integrali): aiutano colesterolo LDL, fegato e regolarità intestinale.',
    'Il deficit calorico + più fibra/grassi insaturi + l\'allenamento che già fai lavorano insieme su colesterolo e fegato grasso: non serve nessun prodotto "detox" o "pulizia del colon" aggiuntivo, non hanno evidenza scientifica di beneficio.',
    'Zenzero e curcuma (estratto standardizzato, ~1000mg/die di curcumina) hanno evidenza da studi randomizzati per ridurre il dolore articolare da osteoartrosi: utile aggiunta per il tuo ginocchio, ma non sostituisce cure mediche.',
    'Idratati durante il giorno, non solo nel rituale pre-partita.'
  ];

  var metabolismTips = [
    'Cammina di più durante il giorno (NEAT), non solo nella sessione mattutina.',
    'Le sessioni brevi e intense del mattino aiutano soprattutto costanza e composizione corporea: evita di aspettarti un "boost" magico del metabolismo da un singolo trucco.',
    'Dormi a sufficienza: il sonno scarso peggiora il controllo dell\'appetito e il recupero.',
    'Non scendere mai sotto il tuo BMR calcolato, nemmeno nei giorni "no".'
  ];

  var motivationTips = {
    method: 'Implementation intentions ("SE...ALLORA...")',
    description:
      'Pianifica gli obiettivi nel formato "SE [situazione] ALLORA [azione]" invece di contare sulla motivazione del momento: ' +
      'es. "SE sono le 6:30 del mattino ALLORA faccio la routine di 15 minuti". Funziona anche quando non hai voglia, perché lega ' +
      'l\'azione a un innesco preciso invece che allo stato d\'animo.',
    examples: [
      'SE mi sveglio ALLORA vado subito alla finestra per la luce naturale, prima del telefono.',
      'SE è ora di pranzo ALLORA mangio comunque qualcosa con proteine, anche veloce, per non arrivare affamato a cena.',
      'SE ho giocato a calcio/padel e sento le gambe pesanti ALLORA alleggerisco gli esercizi su ginocchio quel giorno.'
    ]
  };

  var scientificSources = [
    { topic: 'Metabolismo basale (BMR)', source: 'Mifflin-St Jeor (1990), Academy of Nutrition and Dietetics', note: 'Formula usata in Utils.calcBMR.' },
    { topic: 'Fabbisogno calorico totale (TDEE)', source: 'Metodo dei fattori di attività (stile ACSM)', note: 'Usato in Utils.calcTDEE.' },
    { topic: 'Deficit calorico moderato', source: 'NIH — ricerca sull\'adattamento metabolico', note: 'Motiva perché non fare deficit troppo aggressivi.' },
    { topic: 'Quota proteica', source: 'ISSN Position Stand on Protein and Exercise (Jäger et al., 2017)', note: '1.6-2.2 g/kg usati in Utils.calcTargets.' },
    { topic: 'Nutrizione generale', source: 'American Society for Nutrition', note: 'Idratazione, fibre, principi generali.' },
    { topic: 'Tendine d\'Achille', source: 'H. Alfredson (1998)', note: 'Base dell\'eccentric calf raise.' },
    { topic: 'Carico isometrico e tendinopatia', source: 'J. Cook & E. Rio', note: 'Base di Spanish squat/wall sit.' },
    { topic: 'Tendinopatia rotulea', source: 'Lim et al. (2018), Physiotherapy Research International', note: 'Isometrie grado A, eccentriche/HSR grado B.' },
    { topic: 'Bicarbonato e performance sportiva', source: 'ISSN Position Stand su sodium bicarbonate (2021)', note: 'Base del rituale pre-partita.' },
    { topic: 'Ritmo dei pasti', source: 'Scoping review Nordic Nutrition Recommendations 2023; letteratura su chrono-nutrition', note: 'Motiva "non saltare colazione/pranzo".' },
    { topic: 'Proteine e sarcopenia', source: 'Studi su distribuzione proteica in adulti anziani', note: '30-40g di proteine per pasto.' },
    { topic: 'Luce mattutina e sonno', source: 'Letteratura su light exposure e ritmo circadiano', note: 'Base del primo passo della routine mattutina.' },
    { topic: 'Meditazione breve e sonno/stress', source: 'RCT e meta-analisi su mindfulness standalone', note: 'Base dei 5-10 min di meditazione.' },
    { topic: 'Curcuma/zenzero e dolore articolare', source: 'RCT su curcumina (~1000mg/die) e zenzero', note: 'Supporto articolare nei nutritionTips.' },
    { topic: '"Pulizia del colon" / detox', source: 'Mayo Clinic, CMS (USA), FDA/FTC', note: 'Nessuna evidenza di beneficio: non raccomandata nell\'app.' },
    { topic: 'Fegato grasso e colesterolo', source: 'Linee guida cliniche EASL-EASD-EASO', note: 'Dieta mediterranea, perdita di peso 5-7%, fibra e grassi insaturi.' },
    { topic: 'Anti-procrastinazione', source: 'P. Gollwitzer — Implementation Intentions (1999) e studi successivi', note: 'Base del metodo SE/ALLORA.' }
  ];

  return {
    safetyDisclaimer: safetyDisclaimer,
    schedule: schedule,
    morningRoutine: morningRoutine,
    prematchRitual: prematchRitual,
    nutritionTips: nutritionTips,
    metabolismTips: metabolismTips,
    motivationTips: motivationTips,
    scientificSources: scientificSources
  };
})();
