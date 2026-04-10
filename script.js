/**
 * GENESIS ERP — script.js  v3.3
 *
 * Key fixes in this version:
 * ─────────────────────────────────────────────────────────────
 * FERRIS WHEEL (home page):
 *   • rAF loop increments `angle` each frame.
 *   • Each .mw-item is placed on the orbit circle using
 *     trigonometry (cos/sin). The item's position moves,
 *     but its CSS transform is ALWAYS "none" — cards never
 *     rotate, text is always upright. Guaranteed.
 *   • Hover pauses the animation.
 *
 * ECO-RING (about page):
 *   • CSS @keyframes rotates the .eco-ring container.
 *   • JS reads elapsed time to compute the ring's current angle.
 *   • Each .eco-node gets transform:rotate(-Xdeg) applied every
 *     rAF frame to exactly cancel the ring's rotation.
 *     Result: nodes orbit, text stays horizontal. Guaranteed.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     1 · TAB NAVIGATION
  ══════════════════════════════════════════════════════ */
  const TABS      = ['home','about','features','download','contact'];
  const navItems  = document.querySelectorAll('.nav-item');
  const sections  = document.querySelectorAll('.tab-section');

  function switchTab(name) {
    if (!TABS.includes(name)) return;
    const target = document.getElementById('tab-' + name);
    if (!target) return;

    navItems.forEach(el => el.classList.toggle('active', el.dataset.tab === name));
    sections.forEach(s  => s.classList.remove('active','fade-in'));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    requestAnimationFrame(() => {
      target.classList.add('active');
      requestAnimationFrame(() => target.classList.add('fade-in'));
    });
    closeMobileMenu();
    history.replaceState(null, '', '#' + name);
  }

  navItems.forEach(el => el.addEventListener('click', function(e){
    e.preventDefault(); switchTab(this.dataset.tab);
  }));

  document.addEventListener('click', function(e){
    const t = e.target.closest('[data-tab]');
    if (t && !t.classList.contains('nav-item')) { e.preventDefault(); switchTab(t.dataset.tab); }
  });

  // Hash routing
  (function(){
    const h = location.hash.replace('#','');
    if (TABS.includes(h)) { switchTab(h); }
    else {
      const home = document.getElementById('tab-home');
      home && home.classList.add('active','fade-in');
    }
  })();


  /* ══════════════════════════════════════════════════════
     2 · HAMBURGER
  ══════════════════════════════════════════════════════ */
  const burger   = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  function closeMobileMenu() {
    navLinks && navLinks.classList.remove('open');
    if (burger) {
      const s = burger.querySelectorAll('span');
      s.forEach(x => { x.style.transform = ''; x.style.opacity = ''; });
    }
  }

  burger && burger.addEventListener('click', function(){
    if (!navLinks) return;
    const open = navLinks.classList.toggle('open');
    const [s0,s1,s2] = burger.querySelectorAll('span');
    if (open) {
      s0 && (s0.style.transform = 'rotate(45deg) translate(5px,5px)');
      s1 && (s1.style.opacity   = '0');
      s2 && (s2.style.transform = 'rotate(-45deg) translate(5px,-5px)');
    } else { closeMobileMenu(); }
  });

  document.addEventListener('click', function(e){
    if (navLinks && navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) && burger && !burger.contains(e.target))
      closeMobileMenu();
  });


  /* ══════════════════════════════════════════════════════
     3 · NAVBAR SCROLL SHADOW
  ══════════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () =>
    navbar && navbar.classList.toggle('scrolled', scrollY > 10),
  { passive: true });


  /* ══════════════════════════════════════════════════════
     4 · FERRIS WHEEL — guaranteed upright text
  ══════════════════════════════════════════════════════ */
  (function initWheel() {
    const wrap  = document.getElementById('wheelWrap');
    const items = document.querySelectorAll('#modulesWheel .mw-item');
    if (!wrap || !items.length) return;

    const N       = items.length;          // 11
    const SPEED   = 0.22;                  // deg / frame  (~13 rpm at 60 fps)
    const RADIUS  = 238;                   // px from center to card center
    // Card dimensions (CSS: width 114px, estimate height ~96px)
    const CW = 57, CH = 48;               // half-width, half-height

    let angle  = 0;
    let paused = false;
    let raf    = null;

    function layout() {
      const hw = wrap.offsetWidth  / 2;
      const hh = wrap.offsetHeight / 2;
      const rad = angle * Math.PI / 180;
      const step = (2 * Math.PI) / N;

      items.forEach(function(item, i) {
        const a = rad + i * step - Math.PI / 2;   // start at top
        const x = hw + RADIUS * Math.cos(a) - CW;
        const y = hh + RADIUS * Math.sin(a) - CH;
        item.style.left       = x + 'px';
        item.style.top        = y + 'px';
        item.style.transform  = 'none';  // NEVER rotate — text stays upright
      });
    }

    function tick() {
      if (!paused) angle = (angle + SPEED) % 360;
      layout();
      raf = requestAnimationFrame(tick);
    }

    layout();
    raf = requestAnimationFrame(tick);

    wrap.addEventListener('mouseenter', () => { paused = true;  });
    wrap.addEventListener('mouseleave', () => { paused = false; });
  })();


  /* ══════════════════════════════════════════════════════
     5 · ECO-RING — counter-rotation keeps text upright
  ══════════════════════════════════════════════════════ */
  (function initEcoRing() {
    const ring  = document.getElementById('ecoRing');
    const nodes = document.querySelectorAll('#ecoRing .eco-node');
    if (!ring || !nodes.length) return;

    const N        = nodes.length;       // 11
    const RADIUS   = 155;                // px  (ecosystem-visual is 380px → half = 190, minus card half)
    const CENTER   = 190;               // px  (half of 380px visual)
    const NODE_W   = 45;                // half node width  (~90px/2)
    const NODE_H   = 13;                // half node height (~26px/2)

    // Static (x,y) for each node on the circle
    const positions = Array.from({ length: N }, (_, i) => {
      const a = (i * 360 / N) * Math.PI / 180;
      return {
        x: CENTER + RADIUS * Math.sin(a) - NODE_W,
        y: CENTER - RADIUS * Math.cos(a) - NODE_H,
      };
    });

    nodes.forEach((node, i) => {
      node.style.left = positions[i].x + 'px';
      node.style.top  = positions[i].y + 'px';
    });

    // CSS animation duration matches @keyframes ring-spin (28s)
    const DURATION_MS = 28000;
    let   start       = null;

    function counterRotate(ts) {
      if (!start) start = ts;
      const elapsed = (ts - start) % DURATION_MS;
      // ring has rotated this many degrees:
      const ringAngle = (elapsed / DURATION_MS) * 360;
      // counter-rotate each node by the same amount (negated)
      nodes.forEach(node => {
        node.style.transform = 'rotate(' + (-ringAngle).toFixed(4) + 'deg)';
      });
      requestAnimationFrame(counterRotate);
    }

    requestAnimationFrame(counterRotate);
  })();


  /* ══════════════════════════════════════════════════════
     6 · INTERSECTION OBSERVER — staggered card fade-in
  ══════════════════════════════════════════════════════ */
  const animEls = document.querySelectorAll(
    '.feature-card,.support-card,.platform-card,.sysreq-card,.identity-card,.workflow-stage'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const idx = Array.from(entry.target.parentElement.children).indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.06) + 's';
        entry.target.classList.add('vis');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    animEls.forEach(el => io.observe(el));
  } else {
    animEls.forEach(el => el.classList.add('vis'));
  }


  /* ══════════════════════════════════════════════════════
     7 · MODULE GRID CARDS → features tab
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.module-card').forEach(c => {
    c.addEventListener('click', () => switchTab('features'));
    c.setAttribute('title', 'View all features');
  });


  /* ══════════════════════════════════════════════════════
     8 · CONTACT FORM
  ══════════════════════════════════════════════════════ */
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  form && form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    const span = btn && btn.querySelector('span');
    btn  && (btn.disabled = true, btn.style.opacity = '.7');
    span && (span.textContent = 'Sending…');

    setTimeout(() => {
      form.style.display = 'none';
      success && (success.style.display = 'block');
      setTimeout(() => {
        form.reset();
        form.style.display = 'flex';
        success && (success.style.display = 'none');
        btn  && (btn.disabled = false, btn.style.opacity = '');
        span && (span.textContent = 'Send Message');
      }, 5000);
    }, 1400);
  });


  /* ══════════════════════════════════════════════════════
     9 · DOWNLOAD BUTTON FEEDBACK
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.btn-download-main,.btn-download').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const orig = this.innerHTML;
      this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg> Preparing…';
      this.style.pointerEvents = 'none'; this.style.opacity = '.75';
      setTimeout(() => { this.innerHTML = orig; this.style.pointerEvents = ''; this.style.opacity = ''; }, 2500);
    });
  });


  /* ══════════════════════════════════════════════════════
     10 · KEYBOARD SHORTCUTS  Alt+1–5
  ══════════════════════════════════════════════════════ */
  document.addEventListener('keydown', e => {
    if (e.altKey && !isNaN(+e.key)) {
      const i = +e.key - 1;
      if (i >= 0 && i < TABS.length) { e.preventDefault(); switchTab(TABS[i]); }
    }
    if (e.key === 'Escape') closeMobileMenu();
  });

})();
