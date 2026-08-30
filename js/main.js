// Bootstrap dell'app: onboarding vs dashboard, navigazione a tab.
(function () {
  var TABS = [
    { id: 'dashboard', label: 'Dashboard', module: Dashboard },
    { id: 'workout', label: 'Allenamento', module: Workout },
    { id: 'nutrition', label: 'Alimentazione', module: Nutrition },
    { id: 'habits', label: 'Abitudini', module: Habits },
    { id: 'profile', label: 'Profilo', module: Profile }
  ];

  var activeTab = 'dashboard';

  function root() {
    return document.getElementById('app');
  }

  function showOnboarding() {
    var app = root();
    app.innerHTML = '<div id="onboarding-container"></div>';
    Onboarding.render(document.getElementById('onboarding-container'), showApp);
  }

  function showApp() {
    activeTab = 'dashboard';
    var app = root();
    app.innerHTML =
      '<nav class="tabs">' +
      TABS.map(function (t) {
        return '<button class="tab-btn" data-tab="' + t.id + '">' + t.label + '</button>';
      }).join('') +
      '</nav>' +
      '<div id="tab-content"></div>';

    app.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTab = btn.getAttribute('data-tab');
        renderActiveTab();
      });
    });

    renderActiveTab();
  }

  function renderActiveTab() {
    var app = root();
    app.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === activeTab);
    });
    var content = document.getElementById('tab-content');
    var tab = TABS.filter(function (t) { return t.id === activeTab; })[0];
    if (tab.id === 'profile') {
      tab.module.render(content, showOnboarding);
    } else {
      tab.module.render(content);
    }
  }

  function init() {
    if (Store.get().profile) {
      showApp();
    } else {
      showOnboarding();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
