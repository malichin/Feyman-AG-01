// Vista Profilo: dati salvati, valori calcolati, fonti scientifiche.
var Profile = (function () {
  function sourcesHtml() {
    return (
      '<ul class="sources-list">' +
      Program.scientificSources
        .map(function (s) {
          return '<li><strong>' + s.topic + '</strong> — ' + s.source + '<div class="muted small">' + s.note + '</div></li>';
        })
        .join('') +
      '</ul>'
    );
  }

  function render(container, onEdit) {
    var profile = Store.get().profile;
    var targets = Utils.calcTargets(profile);
    var bmiValue = Utils.bmi(profile);

    container.innerHTML =
      '<div class="card">' +
      '<h2>Il tuo profilo</h2>' +
      '<ul>' +
      '<li>Età: ' + profile.age + '</li>' +
      '<li>Sesso: ' + (profile.gender === 'female' ? 'Donna' : 'Uomo') + '</li>' +
      '<li>Altezza: ' + profile.heightCm + ' cm</li>' +
      '<li>Peso: ' + profile.weightKg + ' kg</li>' +
      '<li>Livello attività: ' + Utils.ACTIVITY_LABELS[profile.activityLevel] + '</li>' +
      '<li>Obiettivo: ' + Utils.GOAL_LABELS[profile.goal] + '</li>' +
      '<li>Dolore/fastidio articolare in corso: ' + (profile.hasJointPain ? 'Sì' : 'No') + '</li>' +
      '<li>Sport praticati: ' + ((profile.sportsActivities || []).join(', ') || '—') + '</li>' +
      '</ul>' +
      '<button id="edit-profile" class="btn-secondary">Modifica profilo</button>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Valori calcolati</h3>' +
      '<ul>' +
      '<li>BMR (metabolismo basale): ' + targets.bmr + ' kcal</li>' +
      '<li>TDEE (fabbisogno totale): ' + targets.tdee + ' kcal</li>' +
      '<li>Target giornaliero: ' + targets.calories + ' kcal (P ' + targets.proteinG + 'g / C ' + targets.carbsG + 'g / G ' + targets.fatG + 'g)</li>' +
      '<li>BMI: ' + bmiValue + ' (' + Utils.bmiCategory(bmiValue) + ')</li>' +
      '</ul>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Fonti scientifiche</h3>' +
      '<p class="muted small">Ogni consiglio nutrizionale, di allenamento o sulle abitudini in questa app è riconducibile a una di queste fonti.</p>' +
      sourcesHtml() +
      '</div>';

    container.querySelector('#edit-profile').addEventListener('click', function () {
      if (onEdit) onEdit();
    });
  }

  return { render: render };
})();
