// Vista Abitudini: log giornaliero, routine mattutina, diario serale, statistiche locali.
var Habits = (function () {
  var weightChart = null;

  function last7Days() {
    var days = [];
    for (var i = 6; i >= 0; i--) days.push(Utils.daysAgo(i));
    return days;
  }

  function avg(values) {
    var v = values.filter(function (x) { return typeof x === 'number' && !isNaN(x); });
    if (v.length === 0) return null;
    return Utils.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length, 1);
  }

  function weeklyStats() {
    var days = last7Days();
    var state = Store.get();
    var entries = days.map(function (d) { return state.habitsLog[d] || {}; });
    return {
      mood: avg(entries.map(function (e) { return e.mood; })),
      energy: avg(entries.map(function (e) { return e.energy; })),
      sleepQuality: avg(entries.map(function (e) { return e.sleepQuality; })),
      eveningHunger: avg(entries.map(function (e) { return e.eveningHunger; })),
      journalDays: entries.filter(function (e) { return e.journalText; }).length,
      waterAvgMl: avg(entries.map(function (e) { return e.waterMl; }))
    };
  }

  function weightHistory() {
    var state = Store.get();
    return Object.keys(state.habitsLog)
      .map(function (d) { return { date: d, weightKg: state.habitsLog[d].weightKg }; })
      .filter(function (e) { return typeof e.weightKg === 'number'; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; })
      .slice(-30);
  }

  function renderWeightChart(canvas, data) {
    if (typeof Chart === 'undefined' || data.length === 0) return;
    if (weightChart) weightChart.destroy();
    weightChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.map(function (d) { return Utils.formatDateShort(d.date); }),
        datasets: [{ label: 'Peso (kg)', data: data.map(function (d) { return d.weightKg; }), borderColor: '#2f7d5f', tension: 0.2 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });
  }

  function buildWeeklySummaryText(stats) {
    return (
      'Riepilogo settimanale (' + Utils.todayISO() + ')\n' +
      '- Umore medio: ' + (stats.mood || 'n/d') + '/5\n' +
      '- Energia media: ' + (stats.energy || 'n/d') + '/5\n' +
      '- Qualità sonno media: ' + (stats.sleepQuality || 'n/d') + '/5\n' +
      '- Fame serale media: ' + (stats.eveningHunger || 'n/d') + '/5\n' +
      '- Giorni con diario compilato: ' + stats.journalDays + '/7\n' +
      '- Acqua media: ' + (stats.waterAvgMl || 'n/d') + ' ml\n\n' +
      'Puoi incollare questo testo in chat con Claude per un\'analisi più approfondita.'
    );
  }

  function render(container) {
    var today = Utils.todayISO();
    var h = Store.getHabitDay(today);
    var stats = weeklyStats();
    var wHistory = weightHistory();

    container.innerHTML =
      '<div class="card">' +
      '<h2>Abitudini di oggi</h2>' +
      '<form id="habits-form">' +
      '<label>Acqua bevuta (ml)<input type="number" name="waterMl" min="0" step="100" value="' + (h.waterMl != null ? h.waterMl : '') + '"></label>' +
      '<label>Ore di sonno<input type="number" name="sleepHours" min="0" max="14" step="0.5" value="' + (h.sleepHours != null ? h.sleepHours : '') + '"></label>' +
      '<label>Passi<input type="number" name="steps" min="0" value="' + (h.steps != null ? h.steps : '') + '"></label>' +
      '<label>Peso oggi (kg, opzionale)<input type="number" name="weightKg" step="0.1" value="' + (h.weightKg != null ? h.weightKg : '') + '"></label>' +
      '<label class="checkbox"><input type="checkbox" name="morningRoutineDone"' + (h.morningRoutineDone ? ' checked' : '') + '> Routine mattutina fatta (esercizio + meditazione)</label>' +
      '<button type="submit" class="btn-primary">Salva</button>' +
      '</form>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Diario serale</h3>' +
      '<form id="journal-form">' +
      '<label>Come è andata oggi?<textarea name="journalText" rows="3">' + (h.journalText || '') + '</textarea></label>' +
      '<label>Energia (1-5)<input type="range" name="energy" min="1" max="5" value="' + (h.energy || 3) + '"></label>' +
      '<label>Umore (1-5)<input type="range" name="mood" min="1" max="5" value="' + (h.mood || 3) + '"></label>' +
      '<label>Fame serale (1-5)<input type="range" name="eveningHunger" min="1" max="5" value="' + (h.eveningHunger || 3) + '"></label>' +
      '<label>Qualità sonno percepita (1-5)<input type="range" name="sleepQuality" min="1" max="5" value="' + (h.sleepQuality || 3) + '"></label>' +
      '<button type="submit" class="btn-primary">Salva diario</button>' +
      '</form>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Andamento settimanale (statistica locale, non AI)</h3>' +
      '<ul>' +
      '<li>Umore medio: ' + (stats.mood != null ? stats.mood + '/5' : 'n/d') + '</li>' +
      '<li>Energia media: ' + (stats.energy != null ? stats.energy + '/5' : 'n/d') + '</li>' +
      '<li>Qualità sonno media: ' + (stats.sleepQuality != null ? stats.sleepQuality + '/5' : 'n/d') + '</li>' +
      '<li>Fame serale media: ' + (stats.eveningHunger != null ? stats.eveningHunger + '/5' : 'n/d') + '</li>' +
      '<li>Giorni con diario compilato: ' + stats.journalDays + '/7</li>' +
      '</ul>' +
      '<button id="copy-summary" class="btn-secondary">Copia riepilogo settimanale</button>' +
      '<p class="muted small">Incollalo in chat con Claude per un\'analisi qualitativa più approfondita del diario: l\'app calcola solo statistiche semplici in locale.</p>' +
      '<textarea id="summary-text" class="hidden-textarea" readonly></textarea>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Andamento peso</h3>' +
      '<canvas id="weight-chart" height="150"></canvas>' +
      '</div>';

    container.querySelector('#habits-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var patch = { morningRoutineDone: !!fd.get('morningRoutineDone') };
      ['waterMl', 'sleepHours', 'steps', 'weightKg'].forEach(function (key) {
        var v = fd.get(key);
        if (v !== '' && v !== null) patch[key] = Number(v);
      });
      Store.upsertHabitDay(today, patch);
      render(container);
    });

    container.querySelector('#journal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      Store.upsertHabitDay(today, {
        journalText: fd.get('journalText') || '',
        energy: Number(fd.get('energy')),
        mood: Number(fd.get('mood')),
        eveningHunger: Number(fd.get('eveningHunger')),
        sleepQuality: Number(fd.get('sleepQuality'))
      });
      render(container);
    });

    container.querySelector('#copy-summary').addEventListener('click', function () {
      var text = buildWeeklySummaryText(stats);
      var textarea = container.querySelector('#summary-text');
      textarea.value = text;
      textarea.classList.remove('hidden-textarea');
      textarea.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () {});
      }
    });

    renderWeightChart(container.querySelector('#weight-chart'), wHistory);
  }

  return { render: render };
})();
