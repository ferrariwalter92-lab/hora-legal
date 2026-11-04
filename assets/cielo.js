/* Hora · tutta la pagina segue l'ora di chi guarda (cielo, fondi, testo: vedi hora.css).
   Senza JavaScript resta l'ora blu (19:41). Nessun dato esce dal telefono. */
(function () {
  var root = document.documentElement;
  var en = root.lang === 'en';
  // tramonto e alba a Milano, ora locale, mese per mese (approssimati)
  var TRAMONTO = [16*60+55, 17*60+35, 18*60+15, 20*60, 20*60+35, 21*60+10, 21*60+5, 20*60+30, 19*60+35, 18*60+40, 16*60+55, 16*60+45];
  var ALBA = [8*60, 7*60+35, 6*60+50, 6*60+45, 6*60, 5*60+35, 5*60+50, 6*60+25, 7*60, 7*60+35, 7*60+20, 7*60+55];
  var NOMI = en
    ? { giorno: 'day', tramonto: 'sunset', orablu: 'blue hour', notte: 'night' }
    : { giorno: 'giorno', tramonto: 'tramonto', orablu: 'ora blu', notte: 'notte' };
  var GIORNI = en
    ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    : ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  function cielo(d) {
    var m = d.getHours() * 60 + d.getMinutes();
    var t = TRAMONTO[d.getMonth()], a = ALBA[d.getMonth()];
    if (m < a - 40) return 'notte';
    if (m < a) return 'orablu';
    if (m < t - 40) return 'giorno';
    if (m < t + 10) return 'tramonto';
    if (m < t + 50) return 'orablu';
    return 'notte';
  }
  var FONDO = { giorno: '#F3F7FB', tramonto: '#2A2C70', orablu: '#13297A', notte: '#07102E' };
  function due(n) { return (n < 10 ? '0' : '') + n; }

  function aggiorna() {
    var d = new Date();
    var c = cielo(d);
    if (root.getAttribute('data-cielo') !== c) {
      root.setAttribute('data-cielo', c);
      var tema = document.querySelector('meta[name="theme-color"]');
      if (tema) tema.setAttribute('content', FONDO[c]);
    }
    var ora = due(d.getHours()) + ':' + due(d.getMinutes());
    var el = document.querySelectorAll('[data-ora]');
    for (var i = 0; i < el.length; i++) {
      var tipo = el[i].getAttribute('data-ora');
      el[i].textContent = tipo === 'giorno'
        ? GIORNI[d.getDay()] + ' · ' + ora + ' · ' + NOMI[c]
        : ora;
      if (el[i].tagName === 'TIME') el[i].setAttribute('datetime', ora);
    }
  }
  // gira in <head>: il colore dell'ora è giusto già al primo disegno, poi si scrive l'ora nel testo
  aggiorna();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aggiorna);
  setInterval(aggiorna, 20000);
})();
