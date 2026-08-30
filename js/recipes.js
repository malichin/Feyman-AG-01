// Database locale di pasti semplici. Valori kcal/macro indicativi
// (basati su tabelle di composizione standard tipo USDA), nessun dato utente.
var Recipes = (function () {
  var list = [
    { id: 'r1', name: 'Uova strapazzate con spinaci', ingredients: ['uova', 'spinaci', 'olio d\'oliva'], kcal: 280, proteinG: 20, carbsG: 3, fatG: 20, tags: ['highProtein'], image: 'assets/recipes/eggs-spinach.svg' },
    { id: 'r2', name: 'Yogurt greco con noci e frutti di bosco', ingredients: ['yogurt greco', 'noci', 'frutti di bosco'], kcal: 260, proteinG: 22, carbsG: 15, fatG: 12, tags: ['highProtein'], image: 'assets/recipes/yogurt-berries.svg' },
    { id: 'r3', name: 'Toast integrale con avocado e uovo', ingredients: ['pane integrale', 'avocado', 'uova'], kcal: 350, proteinG: 16, carbsG: 30, fatG: 18, tags: ['highProtein'], image: 'assets/recipes/toast-avocado-egg.svg' },
    { id: 'r4', name: 'Insalata di ceci, tonno e verdure', ingredients: ['ceci', 'tonno', 'pomodori', 'olio d\'oliva'], kcal: 420, proteinG: 30, carbsG: 35, fatG: 16, tags: ['highProtein'], image: 'assets/recipes/chickpea-tuna-salad.svg' },
    { id: 'r5', name: 'Petto di pollo con verdure grigliate', ingredients: ['pollo', 'zucchine', 'peperoni', 'olio d\'oliva'], kcal: 380, proteinG: 35, carbsG: 12, fatG: 18, tags: ['highProtein', 'lightDinner'], image: 'assets/recipes/chicken-veg.svg' },
    { id: 'r6', name: 'Frittata di albumi con verdure', ingredients: ['albumi', 'zucchine', 'cipolla'], kcal: 220, proteinG: 24, carbsG: 8, fatG: 8, tags: ['highProtein', 'lightDinner'], image: 'assets/recipes/egg-white-frittata.svg' },
    { id: 'r7', name: 'Salmone al forno con broccoli', ingredients: ['salmone', 'broccoli', 'limone'], kcal: 390, proteinG: 32, carbsG: 8, fatG: 22, tags: ['highProtein', 'lightDinner'], image: 'assets/recipes/salmon-broccoli.svg' },
    { id: 'r8', name: 'Zuppa di lenticchie e verdure', ingredients: ['lenticchie', 'carote', 'sedano', 'cipolla'], kcal: 260, proteinG: 16, carbsG: 38, fatG: 4, tags: ['lightDinner'], image: 'assets/recipes/lentil-soup.svg' },
    { id: 'r9', name: 'Insalatona con uova sode e tonno', ingredients: ['lattuga', 'uova', 'tonno', 'pomodori'], kcal: 300, proteinG: 28, carbsG: 8, fatG: 16, tags: ['highProtein', 'lightDinner'], image: 'assets/recipes/salad-eggs-tuna.svg' },
    { id: 'r10', name: 'Crema di zucchine leggera', ingredients: ['zucchine', 'patate', 'cipolla'], kcal: 180, proteinG: 5, carbsG: 28, fatG: 6, tags: ['lightDinner'], image: 'assets/recipes/zucchini-cream.svg' },
    { id: 'r11', name: 'Yogurt greco e mandorle (spuntino serale leggero)', ingredients: ['yogurt greco', 'mandorle'], kcal: 190, proteinG: 15, carbsG: 8, fatG: 11, tags: ['lightDinner', 'highProtein'], image: 'assets/recipes/yogurt-almonds.svg' },
    { id: 'r12', name: 'Merluzzo al vapore con verdure', ingredients: ['merluzzo', 'zucchine', 'carote'], kcal: 260, proteinG: 30, carbsG: 10, fatG: 8, tags: ['highProtein', 'lightDinner'], image: 'assets/recipes/cod-veg.svg' },
    { id: 'r13', name: 'Porridge di avena con frutta', ingredients: ['avena', 'latte', 'banana'], kcal: 340, proteinG: 12, carbsG: 55, fatG: 8, tags: [], image: 'assets/recipes/oat-porridge.svg' },
    { id: 'r14', name: 'Pasta integrale con legumi', ingredients: ['pasta integrale', 'ceci', 'pomodori'], kcal: 480, proteinG: 18, carbsG: 75, fatG: 10, tags: [], image: 'assets/recipes/pasta-legumes.svg' },
    { id: 'r15', name: 'Hummus di ceci con verdure crude', ingredients: ['ceci', 'tahin', 'carote', 'sedano'], kcal: 250, proteinG: 9, carbsG: 26, fatG: 12, tags: ['lightDinner'], image: 'assets/recipes/hummus-veg.svg' },
    { id: 'r16', name: 'Bowl di quinoa, avocado e uova', ingredients: ['quinoa', 'avocado', 'uova', 'pomodori'], kcal: 420, proteinG: 20, carbsG: 35, fatG: 20, tags: ['highProtein'], image: 'assets/recipes/quinoa-bowl.svg' }
  ];

  function normalize(text) {
    return text.toLowerCase().trim();
  }

  // Restituisce le ricette ordinate per numero di ingredienti in comune con quelli disponibili.
  function suggestFromIngredients(availableText, filterTag) {
    var available = availableText
      .split(',')
      .map(normalize)
      .filter(function (s) { return s.length > 0; });

    if (available.length === 0) return [];

    var scored = list
      .filter(function (r) { return !filterTag || r.tags.indexOf(filterTag) !== -1; })
      .map(function (r) {
        var matches = r.ingredients.filter(function (ing) {
          return available.some(function (a) { return normalize(ing).indexOf(a) !== -1 || a.indexOf(normalize(ing)) !== -1; });
        }).length;
        return { recipe: r, matches: matches };
      })
      .filter(function (s) { return s.matches > 0; })
      .sort(function (a, b) { return b.matches - a.matches; });

    return scored.map(function (s) { return s.recipe; });
  }

  function all() {
    return list;
  }

  return {
    all: all,
    suggestFromIngredients: suggestFromIngredients
  };
})();
