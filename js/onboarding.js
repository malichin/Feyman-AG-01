// Form iniziale: raccoglie il profilo e lo salva in Store.
var Onboarding = (function () {
  function activityOptions(selected) {
    return Object.keys(Utils.ACTIVITY_LABELS)
      .map(function (key) {
        var sel = key === selected ? ' selected' : '';
        return '<option value="' + key + '"' + sel + '>' + Utils.ACTIVITY_LABELS[key] + '</option>';
      })
      .join('');
  }

  function goalOptions(selected) {
    return Object.keys(Utils.GOAL_LABELS)
      .map(function (key) {
        var sel = key === selected ? ' selected' : '';
        return '<option value="' + key + '"' + sel + '>' + Utils.GOAL_LABELS[key] + '</option>';
      })
      .join('');
  }

  function render(container, onDone) {
    var p = Store.get().profile || {};
    container.innerHTML =
      '<div class="card onboarding">' +
      '<h2>Il tuo profilo</h2>' +
      '<p class="muted">Servono per calcolare il tuo fabbisogno calorico e adattare il programma. Restano solo sul tuo browser.</p>' +
      '<form id="onboarding-form">' +
      '<label>Nome<input type="text" name="name" value="' + (p.name || '') + '"></label>' +
      '<label>Età<input type="number" name="age" min="14" max="100" required value="' + (p.age || '') + '"></label>' +
      '<label>Sesso<select name="gender">' +
      '<option value="male"' + (p.gender !== 'female' ? ' selected' : '') + '>Uomo</option>' +
      '<option value="female"' + (p.gender === 'female' ? ' selected' : '') + '>Donna</option>' +
      '</select></label>' +
      '<label>Altezza (cm)<input type="number" name="heightCm" min="120" max="230" required value="' + (p.heightCm || '') + '"></label>' +
      '<label>Peso (kg)<input type="number" step="0.1" name="weightKg" min="30" max="250" required value="' + (p.weightKg || '') + '"></label>' +
      '<label>Livello di attività<select name="activityLevel">' + activityOptions(p.activityLevel) + '</select></label>' +
      '<label>Obiettivo<select name="goal">' + goalOptions(p.goal) + '</select></label>' +
      '<label class="checkbox"><input type="checkbox" name="hasJointPain"' + (p.hasJointPain ? ' checked' : '') + '> Ho dolore/fastidio in corso a ginocchio o tendini</label>' +
      '<fieldset><legend>Sport che pratichi</legend>' +
      '<label class="checkbox"><input type="checkbox" name="sport_calcio"' + (hasSport(p, 'calcio') ? ' checked' : '') + '> Calcio</label>' +
      '<label class="checkbox"><input type="checkbox" name="sport_padel"' + (hasSport(p, 'padel') ? ' checked' : '') + '> Padel</label>' +
      '<label>Altro sport (opzionale)<input type="text" name="sport_altro" value="' + (getOtherSport(p) || '') + '"></label>' +
      '</fieldset>' +
      '<button type="submit" class="btn-primary">Salva e continua</button>' +
      '</form>' +
      '</div>';

    container.querySelector('#onboarding-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var sports = [];
      if (fd.get('sport_calcio')) sports.push('calcio');
      if (fd.get('sport_padel')) sports.push('padel');
      var altro = (fd.get('sport_altro') || '').trim();
      if (altro) sports.push(altro);

      var profile = {
        name: (fd.get('name') || '').trim(),
        age: Number(fd.get('age')),
        gender: fd.get('gender'),
        heightCm: Number(fd.get('heightCm')),
        weightKg: Number(fd.get('weightKg')),
        activityLevel: fd.get('activityLevel'),
        goal: fd.get('goal'),
        hasJointPain: !!fd.get('hasJointPain'),
        sportsActivities: sports,
        createdAt: p.createdAt || Utils.todayISO()
      };

      Store.setProfile(profile);
      if (onDone) onDone();
    });
  }

  function hasSport(p, name) {
    return p.sportsActivities && p.sportsActivities.indexOf(name) !== -1;
  }

  function getOtherSport(p) {
    if (!p.sportsActivities) return '';
    return p.sportsActivities.filter(function (s) { return s !== 'calcio' && s !== 'padel'; }).join(', ');
  }

  return { render: render };
})();
