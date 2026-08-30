// Funzioni di utilità generiche condivise da tutta l'app
var Utils = (function () {
  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatDateShort(iso) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function round(n, decimals) {
    var f = Math.pow(10, decimals || 0);
    return Math.round(n * f) / f;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // Mifflin-St Jeor
  function calcBMR(profile) {
    var s = profile.gender === 'female' ? -161 : 5;
    return 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + s;
  }

  var ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };

  var ACTIVITY_LABELS = {
    sedentary: 'Sedentario (poco o nessun esercizio)',
    light: 'Leggero (1-3 giorni/sett.)',
    moderate: 'Moderato (3-5 giorni/sett.)',
    active: 'Attivo (6-7 giorni/sett.)',
    very_active: 'Molto attivo (lavoro fisico + sport)'
  };

  var GOAL_LABELS = {
    lose: 'Perdere peso / dimagrire',
    maintain: 'Mantenere la forma',
    gain: 'Aumentare massa muscolare'
  };

  function calcTDEE(profile) {
    var bmr = calcBMR(profile);
    var mult = ACTIVITY_MULTIPLIERS[profile.activityLevel] || 1.2;
    return bmr * mult;
  }

  function calcTargets(profile) {
    var bmr = calcBMR(profile);
    var tdee = calcTDEE(profile);
    var calories;
    if (profile.goal === 'lose') {
      calories = Math.max(tdee - 500, bmr * 1.1);
    } else if (profile.goal === 'gain') {
      calories = tdee + 300;
    } else {
      calories = tdee;
    }
    var proteinPerKg = profile.goal === 'maintain' ? 1.6 : 1.8;
    var proteinG = proteinPerKg * profile.weightKg;
    var fatCalories = calories * 0.25;
    var fatG = fatCalories / 9;
    var proteinCalories = proteinG * 4;
    var carbsCalories = Math.max(calories - proteinCalories - fatCalories, 0);
    var carbsG = carbsCalories / 4;
    return {
      bmr: round(bmr),
      tdee: round(tdee),
      calories: round(calories),
      proteinG: round(proteinG),
      fatG: round(fatG),
      carbsG: round(carbsG)
    };
  }

  function bmi(profile) {
    var h = profile.heightCm / 100;
    return round(profile.weightKg / (h * h), 1);
  }

  function bmiCategory(v) {
    if (v < 18.5) return 'Sottopeso';
    if (v < 25) return 'Normopeso';
    if (v < 30) return 'Sovrappeso';
    return 'Obesità';
  }

  return {
    todayISO: todayISO,
    formatDate: formatDate,
    formatDateShort: formatDateShort,
    daysAgo: daysAgo,
    uid: uid,
    round: round,
    clamp: clamp,
    calcBMR: calcBMR,
    calcTDEE: calcTDEE,
    calcTargets: calcTargets,
    bmi: bmi,
    bmiCategory: bmiCategory,
    ACTIVITY_MULTIPLIERS: ACTIVITY_MULTIPLIERS,
    ACTIVITY_LABELS: ACTIVITY_LABELS,
    GOAL_LABELS: GOAL_LABELS
  };
})();
