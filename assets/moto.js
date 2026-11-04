/* Hora · movimento. Solo se <html> ha «anima» (vedi lo script in <head>):
   chi chiede meno movimento, o non ha JavaScript, vede la pagina ferma e completa.
   Niente librerie, niente richieste esterne. */
(function () {
  var root = document.documentElement;
  window.horaMoto = true;
  if (!root.classList.contains('anima') || !('IntersectionObserver' in window)) {
    root.classList.remove('anima');
    return;
  }

  // ---------- comparse allo scorrimento ----------
  var SEL = '.chiusura, .sezione .occhiello, .sezione h2, .sezione .attacco, .passo .numero, ' +
    '.passo h3, .passo > p, .non-e li, .punti-dati li, .sezione .freccia';
  var coda = 0, codaT = 0;
  var io = new IntersectionObserver(function (voci) {
    var ora = performance.now();
    if (ora - codaT > 120) coda = 0;
    codaT = ora;
    voci.forEach(function (v) {
      if (!v.isIntersecting) return;
      var el = v.target;
      // chi entra insieme parte a scalare, come luci che si accendono una dopo l'altra
      if (!el.classList.contains('passo')) el.style.setProperty('--r', Math.min(coda++, 6) * 90 + 'ms');
      el.classList.add('visto');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
  var tutti = document.querySelectorAll(SEL);
  for (var i = 0; i < tutti.length; i++) io.observe(tutti[i]);
  // i tre telefoni: partono quando se ne vede più di metà; su schermo largo uno dopo l'altro
  var ioTel = new IntersectionObserver(function (voci) {
    voci.forEach(function (v) {
      if (!v.isIntersecting) return;
      v.target.parentNode.classList.add('visto');
      ioTel.unobserve(v.target);
    });
  }, { threshold: 0.5 });
  var passi = document.querySelectorAll('.passo');
  for (var p = 0; p < passi.length; p++) {
    passi[p].style.setProperty('--i', p);
    ioTel.observe(passi[p].querySelector('.tel'));
  }

  // ---------- le luci dell'apertura: persone che si accendono ----------
  var luci = document.querySelector('.luci');
  if (!luci) return;
  var punti = [].slice.call(luci.children);
  // un numero che sembra a caso ma è sempre lo stesso: niente salti fra una visita e l'altra
  var seme = 7;
  function caso() { seme = (seme * 16807) % 2147483647; return (seme - 1) / 2147483646; }
  punti.forEach(function (s, k) {
    s.style.setProperty('--d0', (0.25 + caso() * 1.3).toFixed(2) + 's');
    s.style.setProperty('--b', (3.2 + caso() * 2.6).toFixed(2) + 's');
    s.style.setProperty('--bd', (-caso() * 5).toFixed(2) + 's');
  });
  var prime = punti.filter(function (s) { return s.classList.contains('on'); });
  // ordine delle prime accensioni: mescolato, non da sinistra a destra
  prime.sort(function () { return caso() - 0.5; });
  prime.forEach(function (s, k) {
    setTimeout(function () { s.classList.add('accesa'); }, 1300 + k * 650 + caso() * 250);
  });

  // poi il cielo vive: ogni tanto qualcuno arriva, qualcun altro si spegne
  var visibile = true;
  new IntersectionObserver(function (v) { visibile = v[0].isIntersecting; }).observe(luci);
  function vita() {
    setTimeout(function () {
      if (visibile && !document.hidden) {
        var accese = punti.filter(function (s) { return s.classList.contains('accesa'); });
        var spente = punti.filter(function (s) { return !s.classList.contains('accesa'); });
        var accendi = accese.length < 4 || (accese.length < 8 && caso() < 0.6);
        var lista = accendi ? spente : accese;
        var s = lista[Math.floor(caso() * lista.length)];
        if (s) s.classList.toggle('accesa', accendi);
      }
      vita();
    }, 2400 + caso() * 2800);
  }
  setTimeout(vita, 1300 + prime.length * 650 + 1500);

  // le luci restano un po' indietro quando scorri: profondità, senza 3D
  var tel = document.querySelector('.eroe-tel');
  var attesa = false;
  function scorri() {
    attesa = false;
    var y = Math.min(window.scrollY, window.innerHeight);
    luci.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
    if (tel) tel.style.setProperty('--py', (y * -0.08).toFixed(1) + 'px');
  }
  window.addEventListener('scroll', function () {
    if (!attesa && visibile) { attesa = true; requestAnimationFrame(scorri); }
  }, { passive: true });
})();
