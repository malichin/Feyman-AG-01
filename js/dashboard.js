// Vista Dashboard: riepilogo del giorno, sfida 30 giorni, obiettivo settimanale.
var Dashboard = (function () {
  function hasActivityOn(dateISO) {
    var state = Store.get();
    var hasWorkout = state.workoutLog.some(function (s) { return s.date === dateISO; });
    var hasNutrition = state.nutritionLog.some(function (d) { return d.date === dateISO && d.meals.length > 0; });
    var h = state.habitsLog[dateISO];
    var hasHabit = h && (h.waterMl != null || h.sleepHours != null || h.steps != null || h.journalText);
    return hasWorkout || hasNutrition || hasHabit;
  }

  function computeStreak() {
    var streak = 0;
    var i = 0;
    while (hasActivityOn(Utils.daysAgo(i)) && i < 365) {
      streak++;
      i++;
    }
    return streak;
  }

  function challengeHtml() {
    var challenge = Store.getChallenge();
    if (!challenge || !challenge.active) {
      return (
        '<h3>Sfida 30 giorni</h3>' +
        '<p class="muted">Inizia oggi una prova di 30 giorni: cena leggera, routine mattutina, diario serale.</p>' +
        '<button id="start-challenge" class="btn-primary">Inizia sfida 30 giorni</button>'
      );
    }
    var dayNum = Store.getChallengeDay();
    var pct = Math.round((dayNum / 30) * 100);
    return (
      '<h3>Sfida 30 giorni — Giorno ' + dayNum + ' di 30</h3>' +
      '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div>' +
      (dayNum >= 30 ? '<p class="muted">Sfida completata! Guarda i tuoi progressi in Abitudini.</p>' : '') +
      '<button id="stop-challenge" class="link-btn">Annulla sfida</button>'
    );
  }

  function weeklyGoalHtml() {
    var goal = Store.getWeeklyGoal();
    var example = Program.motivationTips.examples[0];
    return (
      '<h3>Obiettivo della settimana</h3>' +
      '<p class="muted small">' + Program.motivationTips.description + '</p>' +
      (goal
        ? '<p><strong>SE</strong> ' + goal.trigger + ' <strong>ALLORA</strong> ' + goal.action + '</p>'
        : '<p class="muted">Nessun obiettivo impostato.</p>') +
      '<form id="goal-form" class="inline-form">' +
      '<input type="text" name="trigger" placeholder="SE... (es. ' + example.split(' ALLORA ')[0].replace('SE ', '') + ')" required>' +
      '<input type="text" name="action" placeholder="ALLORA... (azione)" required>' +
      '<button type="submit" class="btn-secondary">Salva obiettivo</button>' +
      '</form>'
    );
  }

  function render(container) {
    var profile = Store.get().profile;
    var targets = Utils.calcTargets(profile);
    var today = Utils.todayISO();
    var nutritionDay = Store.getNutritionDay(today);
    var kcalToday = nutritionDay.meals.reduce(function (a, m) { return a + m.kcal; }, 0);
    var h = Store.getHabitDay(today);
    var waterGoal = Store.get().settings.waterGoalMl;
    var todayProgram = Workout.getTodayProgramDay();
    var streak = computeStreak();

    container.innerHTML =
      '<div class="card">' +
      '<h2>Ciao' + (profile.name ? ', ' + profile.name : '') + '</h2>' +
      '<div class="stat-row">' +
      '<div class="stat"><span class="stat-value">' + kcalToday + ' / ' + targets.calories + '</span><span class="stat-label">kcal oggi</span></div>' +
      '<div class="stat"><span class="stat-value">' + (h.waterMl || 0) + ' / ' + waterGoal + '</span><span class="stat-label">ml acqua</span></div>' +
      '<div class="stat"><span class="stat-value">' + streak + '</span><span class="stat-label">giorni di streak</span></div>' +
      '</div>' +
      '<p>Allenamento di oggi: <strong>' + todayProgram.focus + '</strong> (' + todayProgram.durationMin + ' min) — vai alla tab Allenamento.</p>' +
      '</div>' +
      '<div class="card alert">' + Program.safetyDisclaimer + '</div>' +
      '<div class="card">' +
      '<h3>Metabolismo e costanza</h3>' +
      '<ul>' + Program.metabolismTips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="card">' + challengeHtml() + '</div>' +
      '<div class="card">' + weeklyGoalHtml() + '</div>';

    var startBtn = container.querySelector('#start-challenge');
    if (startBtn) startBtn.addEventListener('click', function () { Store.startChallenge(); render(container); });

    var stopBtn = container.querySelector('#stop-challenge');
    if (stopBtn) stopBtn.addEventListener('click', function () { Store.stopChallenge(); render(container); });

    container.querySelector('#goal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      Store.setWeeklyGoal((fd.get('trigger') || '').trim(), (fd.get('action') || '').trim());
      render(container);
    });
  }

  return { render: render };
})();
