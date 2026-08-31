// Database locale di alimenti comuni: valori indicativi per 100g
// (tabelle di composizione standard tipo USDA/CREA). Nessun dato utente qui.
var FoodDb = (function () {
  var list = [
    { name: 'Pesca', kcal100: 39, proteinG100: 0.9, carbsG100: 9.5, fatG100: 0.25 },
    { name: 'Mela', kcal100: 52, proteinG100: 0.3, carbsG100: 14, fatG100: 0.2 },
    { name: 'Banana', kcal100: 89, proteinG100: 1.1, carbsG100: 23, fatG100: 0.3 },
    { name: 'Arancia', kcal100: 47, proteinG100: 0.9, carbsG100: 12, fatG100: 0.1 },
    { name: 'Fragole', kcal100: 32, proteinG100: 0.7, carbsG100: 7.7, fatG100: 0.3 },
    { name: 'Uva', kcal100: 69, proteinG100: 0.7, carbsG100: 18, fatG100: 0.2 },
    { name: 'Kiwi', kcal100: 61, proteinG100: 1.1, carbsG100: 15, fatG100: 0.5 },
    { name: 'Anguria', kcal100: 30, proteinG100: 0.6, carbsG100: 7.6, fatG100: 0.2 },
    { name: 'Pane integrale', kcal100: 247, proteinG100: 10, carbsG100: 41, fatG100: 3.4 },
    { name: 'Pane bianco', kcal100: 265, proteinG100: 9, carbsG100: 49, fatG100: 3.2 },
    { name: 'Riso cotto', kcal100: 130, proteinG100: 2.7, carbsG100: 28, fatG100: 0.3 },
    { name: 'Pasta cotta', kcal100: 158, proteinG100: 5.8, carbsG100: 31, fatG100: 0.9 },
    { name: 'Patate lesse', kcal100: 87, proteinG100: 1.9, carbsG100: 20, fatG100: 0.1 },
    { name: 'Petto di pollo', kcal100: 165, proteinG100: 31, carbsG100: 0, fatG100: 3.6 },
    { name: 'Petto di tacchino', kcal100: 135, proteinG100: 30, carbsG100: 0, fatG100: 1 },
    { name: 'Manzo magro', kcal100: 187, proteinG100: 27, carbsG100: 0, fatG100: 8 },
    { name: 'Salmone', kcal100: 208, proteinG100: 20, carbsG100: 0, fatG100: 13 },
    { name: 'Tonno in scatola (sgocciolato)', kcal100: 128, proteinG100: 26, carbsG100: 0, fatG100: 2.5 },
    { name: 'Merluzzo', kcal100: 82, proteinG100: 18, carbsG100: 0, fatG100: 0.7 },
    { name: 'Uova', kcal100: 155, proteinG100: 13, carbsG100: 1.1, fatG100: 11 },
    { name: 'Albume d\'uovo', kcal100: 52, proteinG100: 11, carbsG100: 0.7, fatG100: 0.2 },
    { name: 'Latte parzialmente scremato', kcal100: 46, proteinG100: 3.3, carbsG100: 4.8, fatG100: 1.6 },
    { name: 'Yogurt greco', kcal100: 59, proteinG100: 10, carbsG100: 3.6, fatG100: 0.4 },
    { name: 'Yogurt bianco intero', kcal100: 61, proteinG100: 3.5, carbsG100: 4.7, fatG100: 3.3 },
    { name: 'Grana/Parmigiano', kcal100: 392, proteinG100: 33, carbsG100: 0, fatG100: 28 },
    { name: 'Mozzarella', kcal100: 253, proteinG100: 18, carbsG100: 2.2, fatG100: 19 },
    { name: 'Ceci cotti', kcal100: 164, proteinG100: 8.9, carbsG100: 27, fatG100: 2.6 },
    { name: 'Lenticchie cotte', kcal100: 116, proteinG100: 9, carbsG100: 20, fatG100: 0.4 },
    { name: 'Fagioli cotti', kcal100: 127, proteinG100: 8.7, carbsG100: 23, fatG100: 0.5 },
    { name: 'Avena (fiocchi)', kcal100: 389, proteinG100: 17, carbsG100: 66, fatG100: 7 },
    { name: 'Mandorle', kcal100: 579, proteinG100: 21, carbsG100: 22, fatG100: 50 },
    { name: 'Noci', kcal100: 654, proteinG100: 15, carbsG100: 14, fatG100: 65 },
    { name: 'Olio d\'oliva', kcal100: 884, proteinG100: 0, carbsG100: 0, fatG100: 100 },
    { name: 'Avocado', kcal100: 160, proteinG100: 2, carbsG100: 8.5, fatG100: 15 },
    { name: 'Spinaci', kcal100: 23, proteinG100: 2.9, carbsG100: 3.6, fatG100: 0.4 },
    { name: 'Broccoli', kcal100: 34, proteinG100: 2.8, carbsG100: 7, fatG100: 0.4 },
    { name: 'Zucchine', kcal100: 17, proteinG100: 1.2, carbsG100: 3.1, fatG100: 0.3 },
    { name: 'Pomodori', kcal100: 18, proteinG100: 0.9, carbsG100: 3.9, fatG100: 0.2 },
    { name: 'Carote', kcal100: 41, proteinG100: 0.9, carbsG100: 10, fatG100: 0.2 },
    { name: 'Insalata/lattuga', kcal100: 15, proteinG100: 1.4, carbsG100: 2.9, fatG100: 0.2 },
    { name: 'Prosciutto cotto', kcal100: 145, proteinG100: 18, carbsG100: 1.5, fatG100: 7 },
    { name: 'Bresaola', kcal100: 151, proteinG100: 32, carbsG100: 0.5, fatG100: 2.5 },
    { name: 'Cioccolato fondente', kcal100: 546, proteinG100: 7.8, carbsG100: 46, fatG100: 31 },
    { name: 'Miele', kcal100: 304, proteinG100: 0.3, carbsG100: 82, fatG100: 0 },
    { name: 'Quinoa cotta', kcal100: 120, proteinG100: 4.4, carbsG100: 21, fatG100: 1.9 }
  ];

  function all() {
    return list;
  }

  function find(name) {
    var n = (name || '').trim().toLowerCase();
    return list.filter(function (f) { return f.name.toLowerCase() === n; })[0] || null;
  }

  return { all: all, find: find };
})();
