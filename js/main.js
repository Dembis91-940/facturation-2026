/* ============================================================
   FACTURATION 2026 — motion principal (index + check)
   Stack : Lenis (smooth scroll) + GSAP ScrollTrigger.
   Toutes les animations sont coupées sous prefers-reduced-motion.
   Le contenu reste lisible sans JavaScript (états posés par GSAP
   uniquement, jamais par le CSS).
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  function initLenis() {
    if (reduceMotion || typeof Lenis === 'undefined') return null;
    var lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  /* Ancre douce (menu + boutons) — passe par Lenis quand actif */
  function initAncres(lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(function (lien) {
      lien.addEventListener('click', function (e) {
        var cible = document.querySelector(lien.getAttribute('href'));
        if (!cible) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(cible, { offset: -70, duration: 1.4 });
        } else {
          var y = cible.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      });
    });
  }

  /* Hero : lignes du h1 (déjà découpées dans le markup en .ligne-masque) */
  function initHeroLignes() {
    var h1 = document.querySelector('[data-lignes-hero]');
    if (!h1) return;
    var interieurs = h1.querySelectorAll('.ligne-masque > span');
    gsap.fromTo(interieurs,
      { yPercent: 115 },
      { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.1, delay: 0.15 }
    );
  }

  function initRevelations() {
    if (reduceMotion || typeof gsap === 'undefined') return;

    /* Hero : lignes du h1 */
    initHeroLignes();

    /* Entrée douce des éléments marqués [data-reveal] */
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true } }
      );
    });

    /* Sections storytelling : titre + intro ensemble */
    gsap.utils.toArray('[data-story]').forEach(function (sec) {
      var cibles = sec.querySelectorAll('[data-story-titre], [data-story-texte], [data-story-cta]');
      gsap.fromTo(cibles,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: sec, start: 'top 78%', once: true } }
      );
    });

    /* Tampons : effet « impression » quand ils entrent à l'écran */
    gsap.utils.toArray('.tampon[data-tampon-scroll]').forEach(function (tampon) {
      gsap.fromTo(tampon,
        { scale: 2.1, autoAlpha: 0, rotate: '8deg' },
        { scale: 1, autoAlpha: 0.95, rotate: '-3deg', duration: 0.5, ease: 'back.out(2.4)',
          scrollTrigger: { trigger: tampon, start: 'top 88%', once: true } }
      );
    });

    /* Timeline : la ligne se trace au scroll, les jalons s'éclairent */
    var fil = document.querySelector('[data-timeline-fil]');
    if (fil) {
      gsap.fromTo(fil,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: fil, start: 'top 75%', end: 'bottom 60%', scrub: 0.6 } }
      );
    }
    gsap.utils.toArray('[data-jalon]').forEach(function (jalon) {
      gsap.fromTo(jalon,
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: jalon, start: 'top 82%', once: true } }
      );
    });

    /* Les 3 situations : scènes successives racontées au scroll.
       Sur grand écran : pin léger de la scène pour laisser le texte se poser.
       Sur mobile : on ne pine pas (confort de lecture). */
    var mq = window.matchMedia('(min-width: 861px)');
    if (mq.matches) {
      gsap.utils.toArray('[data-scene-pin]').forEach(function (scene) {
        var cibles = scene.querySelectorAll('[data-scene-texte], [data-scene-panneau]');
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: scene,
            start: 'top 70%',
            end: '+=70%',
            scrub: 0.7
          }
        });
        tl.fromTo(cibles, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, stagger: 0.12, ease: 'none' });
      });
    }
  }

  /* Compte à rebours réel vers le 01/09/2027 (émission obligatoire) */
  function initCompteRebond() {
    var dates = document.querySelectorAll('[data-compte-jours]');
    if (!dates.length) return;
    var cible = new Date('2027-09-01T00:00:00+02:00');
    function maj() {
      var maintenant = new Date();
      var jours = Math.max(0, Math.ceil((cible - maintenant) / 86400000));
      dates.forEach(function (el) { el.textContent = 'J-' + jours; });
    }
    maj();
    setInterval(maj, 60000);
  }

  function init() {
    var lenis = initLenis();
    initAncres(lenis);
    initRevelations();
    initCompteRebond();
    if (typeof ScrollTrigger !== 'undefined') {
      window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
