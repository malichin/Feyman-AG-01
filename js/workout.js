// Vista Allenamento: sessione del giorno dal programma + log attività esterne (calcio/padel).
var Workout = (function () {
  function getTodayProgramDay() {
    var jsDay = new Date().getDay(); // 0=Dom..6=Sab
    var mondayIndex = (jsDay + 6) % 7; // 0=Lun..6=Dom
    var progIndex = mondayIndex % Program.schedule.length;
    return Program.schedule[progIndex];
  }

  function exerciseListHtml(day) {
    return day.exercises
      .map(function (ex, i) {
        return (
          '<li class="exercise">' +
          '<div class="exercise-icon"><img src="' + ex.image + '" alt="' + ex.name + '"></div>' +
          '<div class="exercise-body">' +
          '<label class="checkbox"><input type="checkbox" data-ex="' + i + '"> <strong>' + ex.name + '</strong> — ' + ex.target + '</label>' +
          '<div class="muted small">' + ex.note + '</div>' +
          '</div>' +
          '</li>'
        );
      })
      .join('');
  }

  function historyHtml() {
    var log = Store.get().workoutLog.slice().reverse().slice(0, 10);
    if (log.length === 0) return '<p class="muted">Nessuna sessione registrata ancora.</p>';
    return (
      '<ul class="history-list">' +
      log
        .map(function (s) {
          var label = s.type === 'esterno' ? s.name : 'Programma: ' + s.focus;
          return '<li>' + Utils.formatDateShort(s.date) + ' — ' + label + '</li>';
        })
        .join('') +
      '</ul>'
    );
  }

  function render(container) {
    var day = getTodayProgramDay();

    container.innerHTML =
      '<div class="card">' +
      '<h2>Allenamento di oggi — Giorno ' + day.day + ': ' + day.focus + '</h2>' +
      '<p class="muted">Circa ' + day.durationMin + ' minuti, corpo libero.</p>' +
      '<div class="alert">' + Program.safetyDisclaimer + '</div>' +
      '<ul class="exercise-list">' + exerciseListHtml(day) + '</ul>' +
      '<button id="complete-session" class="btn-primary">Sessione completata</button>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Rituale pre-partita</h3>' +
      '<p><strong>' + Program.prematchRitual.recipe + '</strong></p>' +
      '<p class="muted small">' + Program.prematchRitual.timing + ' — ' + Program.prematchRitual.caution + '</p>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Registra un\'attività esterna (calcio, padel...)</h3>' +
      '<form id="external-form">' +
      '<label>Attività<input type="text" name="name" placeholder="es. Partita di calcio" required></label>' +
      '<button type="submit" class="btn-secondary">Registra</button>' +
      '</form>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Storico recente</h3>' +
      historyHtml() +
      '</div>';

    container.querySelector('#complete-session').addEventListener('click', function () {
      Store.addWorkoutSession({
        id: Utils.uid(),
        date: Utils.todayISO(),
        type: 'programma',
        day: day.day,
        focus: day.focus
      });
      render(container);
    });

    container.querySelector('#external-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      Store.addWorkoutSession({
        id: Utils.uid(),
        date: Utils.todayISO(),
        type: 'esterno',
        name: (fd.get('name') || '').trim()
      });
      render(container);
    });
  }

  return { render: render, getTodayProgramDay: getTodayProgramDay };
})();
