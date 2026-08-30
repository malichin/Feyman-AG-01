// Gestione dello stato persistente in localStorage
var Store = (function () {
  var KEY = 'feyman_health_v1';

  function defaultState() {
    return {
      profile: null,
      workoutLog: [],
      nutritionLog: [],
      habitsLog: {},
      challenge: { active: false, startDate: null },
      weeklyGoal: null,
      settings: { waterGoalMl: 2000, workoutsPerWeekGoal: 3 }
    };
  }

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      var parsed = JSON.parse(raw);
      var d = defaultState();
      return Object.assign(d, parsed, {
        settings: Object.assign(d.settings, parsed.settings || {})
      });
    } catch (e) {
      console.error('Errore nel caricamento dati, riparto da zero.', e);
      return defaultState();
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function get() {
    return state;
  }

  function setProfile(profile) {
    state.profile = profile;
    save();
  }

  function addWorkoutSession(session) {
    state.workoutLog.push(session);
    save();
  }

  function removeWorkoutSession(id) {
    state.workoutLog = state.workoutLog.filter(function (s) { return s.id !== id; });
    save();
  }

  function addNutritionEntry(dateISO, meal) {
    var day = state.nutritionLog.find(function (d) { return d.date === dateISO; });
    if (!day) {
      day = { date: dateISO, meals: [] };
      state.nutritionLog.push(day);
    }
    day.meals.push(meal);
    save();
  }

  function removeNutritionEntry(dateISO, mealId) {
    var day = state.nutritionLog.find(function (d) { return d.date === dateISO; });
    if (!day) return;
    day.meals = day.meals.filter(function (m) { return m.id !== mealId; });
    save();
  }

  function getNutritionDay(dateISO) {
    return state.nutritionLog.find(function (d) { return d.date === dateISO; }) || { date: dateISO, meals: [] };
  }

  function upsertHabitDay(dateISO, patch) {
    var day = state.habitsLog[dateISO] || { date: dateISO };
    Object.assign(day, patch);
    state.habitsLog[dateISO] = day;
    save();
  }

  function getHabitDay(dateISO) {
    return state.habitsLog[dateISO] || { date: dateISO };
  }

  function resetAll() {
    state = defaultState();
    save();
  }

  function startChallenge() {
    state.challenge = { active: true, startDate: Utils.todayISO() };
    save();
  }

  function stopChallenge() {
    state.challenge = { active: false, startDate: null };
    save();
  }

  function getChallenge() {
    return state.challenge;
  }

  function getChallengeDay() {
    if (!state.challenge || !state.challenge.active || !state.challenge.startDate) return null;
    var start = new Date(state.challenge.startDate + 'T00:00:00');
    var today = new Date(Utils.todayISO() + 'T00:00:00');
    var diffDays = Math.round((today - start) / 86400000) + 1;
    return Utils.clamp(diffDays, 1, 30);
  }

  function setWeeklyGoal(trigger, action) {
    state.weeklyGoal = { trigger: trigger, action: action, weekStart: Utils.todayISO() };
    save();
  }

  function getWeeklyGoal() {
    return state.weeklyGoal;
  }

  return {
    get: get,
    setProfile: setProfile,
    addWorkoutSession: addWorkoutSession,
    removeWorkoutSession: removeWorkoutSession,
    addNutritionEntry: addNutritionEntry,
    removeNutritionEntry: removeNutritionEntry,
    getNutritionDay: getNutritionDay,
    upsertHabitDay: upsertHabitDay,
    getHabitDay: getHabitDay,
    resetAll: resetAll,
    startChallenge: startChallenge,
    stopChallenge: stopChallenge,
    getChallenge: getChallenge,
    getChallengeDay: getChallengeDay,
    setWeeklyGoal: setWeeklyGoal,
    getWeeklyGoal: getWeeklyGoal,
    save: save
  };
})();
