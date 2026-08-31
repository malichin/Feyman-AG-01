// Vista Alimentazione: diario pasti, confronto con i target, suggerimenti dal frigo.
var Nutrition = (function () {
  function mealsHtml(day) {
    if (day.meals.length === 0) return '<p class="muted">Nessun pasto registrato oggi.</p>';
    return (
      '<ul class="meal-list">' +
      day.meals
        .map(function (m) {
          return (
            '<li>' +
            '<span>' + m.name + ' — ' + m.kcal + ' kcal (P ' + m.proteinG + 'g / C ' + m.carbsG + 'g / G ' + m.fatG + 'g)</span>' +
            ' <button class="link-btn" data-remove="' + m.id + '">rimuovi</button>' +
            '</li>'
          );
        })
        .join('') +
      '</ul>'
    );
  }

  function totals(day) {
    return day.meals.reduce(
      function (acc, m) {
        acc.kcal += m.kcal;
        acc.proteinG += m.proteinG;
        acc.carbsG += m.carbsG;
        acc.fatG += m.fatG;
        return acc;
      },
      { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }
    );
  }

  function tipsHtml() {
    return '<ul>' + Program.nutritionTips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
  }

  function recipeCardHtml(r) {
    var tagLabel = r.tags.indexOf('lightDinner') !== -1 ? '<span class="tag">cena leggera</span>' : '';
    tagLabel += r.tags.indexOf('highProtein') !== -1 ? '<span class="tag">ricco di proteine</span>' : '';
    return (
      '<li class="recipe-card">' +
      '<div class="recipe-icon"><img src="' + r.image + '" alt="' + r.name + '"></div>' +
      '<div>' +
      '<strong>' + r.name + '</strong> ' + tagLabel +
      '<div class="muted small">' + r.kcal + ' kcal — P ' + r.proteinG + 'g / C ' + r.carbsG + 'g / G ' + r.fatG + 'g</div>' +
      '<div class="muted small">Ingredienti: ' + r.ingredients.join(', ') + '</div>' +
      '</div>' +
      '</li>'
    );
  }

  function render(container) {
    var profile = Store.get().profile;
    var targets = Utils.calcTargets(profile);
    var today = Utils.todayISO();
    var day = Store.getNutritionDay(today);
    var sum = totals(day);
    var remainingKcal = Utils.round(targets.calories - sum.kcal);
    var remainingProtein = Utils.round(targets.proteinG - sum.proteinG);

    container.innerHTML =
      '<div class="card">' +
      '<h2>Alimentazione di oggi</h2>' +
      '<p>Target: <strong>' + targets.calories + ' kcal</strong> (P ' + targets.proteinG + 'g / C ' + targets.carbsG + 'g / G ' + targets.fatG + 'g)</p>' +
      '<p>Consumate finora: <strong>' + sum.kcal + ' kcal</strong> (P ' + sum.proteinG + 'g / C ' + sum.carbsG + 'g / G ' + sum.fatG + 'g)</p>' +
      '<p class="muted">Rimangono circa ' + remainingKcal + ' kcal e ' + remainingProtein + 'g di proteine per oggi.</p>' +
      mealsHtml(day) +
      '<h3>Aggiungi da un alimento comune</h3>' +
      '<p class="muted small">Non sai le calorie? Scegli un alimento e scrivi i grammi: le calcolo io.</p>' +
      '<form id="quick-food-form" class="inline-form">' +
      '<input type="text" name="foodName" list="food-options" placeholder="es. Pesca" required>' +
      '<datalist id="food-options">' +
      FoodDb.all().map(function (f) { return '<option value="' + f.name + '">'; }).join('') +
      '</datalist>' +
      '<input type="number" name="grams" placeholder="grammi" min="1" value="100" required>' +
      '<button type="submit" class="btn-secondary">Aggiungi</button>' +
      '</form>' +
      '<h3>Oppure inserisci un pasto manualmente</h3>' +
      '<form id="meal-form" class="inline-form">' +
      '<input type="text" name="name" placeholder="Pasto" required>' +
      '<input type="number" name="kcal" placeholder="kcal" required min="0">' +
      '<input type="number" name="proteinG" placeholder="proteine g" min="0" value="0">' +
      '<input type="number" name="carbsG" placeholder="carbo g" min="0" value="0">' +
      '<input type="number" name="fatG" placeholder="grassi g" min="0" value="0">' +
      '<button type="submit" class="btn-secondary">Aggiungi pasto</button>' +
      '</form>' +
      '</div>' +
      '<div class="card">' +
      '<h3>Consigli</h3>' +
      tipsHtml() +
      '</div>' +
      '<div class="card">' +
      '<h3>Cosa hai in frigo?</h3>' +
      '<p class="muted small">Scrivi gli ingredienti separati da virgola, es: "uova, spinaci, avocado".</p>' +
      '<form id="fridge-form" class="inline-form">' +
      '<input type="text" name="ingredients" placeholder="uova, spinaci, avocado...">' +
      '<button type="submit" class="btn-secondary">Suggerisci pasti</button>' +
      '</form>' +
      '<ul id="fridge-results" class="recipe-list"></ul>' +
      '</div>';

    container.querySelector('#quick-food-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var food = FoodDb.find(fd.get('foodName'));
      if (!food) {
        alert('Alimento non trovato nell\'elenco. Usa il modulo manuale qui sotto per aggiungerlo con i suoi valori.');
        return;
      }
      var grams = Number(fd.get('grams')) || 0;
      var factor = grams / 100;
      Store.addNutritionEntry(today, {
        id: Utils.uid(),
        name: food.name + ' (' + grams + 'g)',
        kcal: Utils.round(food.kcal100 * factor),
        proteinG: Utils.round(food.proteinG100 * factor, 1),
        carbsG: Utils.round(food.carbsG100 * factor, 1),
        fatG: Utils.round(food.fatG100 * factor, 1)
      });
      render(container);
    });

    container.querySelector('#meal-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      Store.addNutritionEntry(today, {
        id: Utils.uid(),
        name: (fd.get('name') || '').trim(),
        kcal: Number(fd.get('kcal')) || 0,
        proteinG: Number(fd.get('proteinG')) || 0,
        carbsG: Number(fd.get('carbsG')) || 0,
        fatG: Number(fd.get('fatG')) || 0
      });
      render(container);
    });

    container.querySelectorAll('[data-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Store.removeNutritionEntry(today, btn.getAttribute('data-remove'));
        render(container);
      });
    });

    container.querySelector('#fridge-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var results = Recipes.suggestFromIngredients(fd.get('ingredients') || '');
      var resultsEl = container.querySelector('#fridge-results');
      if (results.length === 0) {
        resultsEl.innerHTML = '<p class="muted">Nessun pasto trovato con questi ingredienti. Prova con altri termini.</p>';
      } else {
        resultsEl.innerHTML = results.slice(0, 6).map(recipeCardHtml).join('');
      }
    });
  }

  return { render: render };
})();
