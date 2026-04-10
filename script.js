/**
 * GENESIS ERP — script.js  v3.2
 * - Tab navigation
 * - JS-driven Ferris wheel (upright text guaranteed)
 * - Eco-ring counter-rotation
 * - Intersection observer card animations
 * - Contact form, hamburger, scroll shadow, keyboard nav
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     1. TAB NAVIGATION
  ═══════════════════════════════════════════════════════ */
  const validTabs   = ['home', 'about', 'features', 'download', 'contact'];
  const navItems    = document.querySelectorAll('.nav-item');
  const tabSections = document.querySelectorAll('.tab-section');

  function switchTab(tabName) {
    if (!validTabs.includes(tabName)) return;
    const target = document.getElementById('tab-' + tabName);
    if (!target) return;

    navItems.forEach(el => el.classList.toggle('active', el.dataset.tab === tabName));
    tabSections.forEach(s => s.classList.remove('active', 'fade-in'));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    requestAnimationFrame(() => {
      target.classList.add('active');
      requestAnimationFrame(() => target.classList.add('fade-in'));
    });

    closeMobileMenu();
    history.replaceState(null, '', '#' + tabName);
  }

  navItems.forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      switchTab(this.dataset.tab);
    });
  });

  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-tab]');
    if (trigger && !trigger.classList.contains('nav-item')) {
      e.preventDefault();
      switchTab(trigger.dataset.tab);
    }
  });

  // Hash routing on load
  (function () {
    const hash = location.hash.replace('#', '');
    if (hash && validTabs.includes(hash)) {
      switchTab(hash);
    } else {
      const home = document.getElementById('tab-home');
      if (home) { home.classList.add('active', 'fade-in'); }
    }
  })();


  /* ═══════════════════════════════════════════════════════
     2. HAMBURGER MENU
  ═══════════════════════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  function closeMobileMenu() {
    navLinks && navLinks.classList.remove('open');
    if (hamburger) {
      const [s0, s1, s2] = hamburger.querySelectorAll('span');
      if (s0) s0.style.transform = '';
      if (s1) s1.style.opacity   = '';
      if (s2) s2.style.transform = '';
    }
  }

  hamburger && hamburger.addEventListener('click', function () {
    if (!navLinks) return;
    const open = navLinks.classList.toggle('open');
    const [s0, s1, s2] = hamburger.querySelectorAll('span');
    if (open) {
      if (s0) s0.style.transform = 'rotate(45deg) translate(5px,5px)';
      if (s1) s1.style.opacity   = '0';
      if (s2) s2.style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      closeMobileMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (navLinks && navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });


  /* ═══════════════════════════════════════════════════════
     3. NAVBAR SCROLL SHADOW
  ═══════════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar && navbar.classList.toggle('scrolled', scrollY > 10);
  }, { passive: true });


  /* ═══════════════════════════════════════════════════════
     4. FERRIS WHEEL — JS-driven, text always upright
     ─────────────────────────────────────────────────────
     HOW IT WORKS:
     • The .modules-wheel container rotates via rAF (wheelAngle += speed).
     • Each .mw-item is absolutely positioned on a circle of `radius` px.
       Its (left, top) is recomputed each frame so it orbits correctly.
     • The .mw-item itself has NO rotation applied — it always stays at 0deg.
       This is the key guarantee that text remains upright.
     • Pause on hover (wheel wrapper hover).
  ═══════════════════════════════════════════════════════ */
  (function initWheel() {
    const wrap  = document.getElementById('wheelWrap');
    const items = document.querySelectorAll('#modulesWheel .mw-item');
    if (!wrap || !items.length) return;

    const N      = items.length;          // 11
    const SPEED  = 0.25;                  // deg per frame
    const RADIUS = 240;                   // px from center to card center

    let angle    = 0;                     // current rotation in degrees
    let paused   = false;
    let rafId    = null;

    // Cache center of wrap (half its dimension)
    const halfW  = wrap.offsetWidth  / 2;
    const halfH  = wrap.offsetHeight / 2;

    // Card half-dimensions (from CSS: width 112px, estimate height ~100px)
    const cardHalfW = 56;
    const cardHalfH = 50;

    function positionItems(deg) {
      const baseRad = (deg * Math.PI) / 180;
      items.forEach(function (item, i) {
        const itemAngle = baseRad + (i * 2 * Math.PI) / N;
        const x = halfW + RADIUS * Math.cos(itemAngle - Math.PI / 2) - cardHalfW;
        const y = halfH + RADIUS * Math.sin(itemAngle - Math.PI / 2) - cardHalfH;
        item.style.left      = x + 'px';
        item.style.top       = y + 'px';
        item.style.transform = 'none';   // NEVER rotate the card — text stays upright
      });
    }

    function tick() {
      if (!paused) {
        angle = (angle + SPEED) % 360;
      }
      positionItems(angle);
      rafId = requestAnimationFrame(tick);
    }

    // Initial placement before first frame
    positionItems(angle);
    rafId = requestAnimationFrame(tick);

    // Pause on hover
    wrap.addEventListener('mouseenter', () => { paused = true; });
    wrap.addEventListener('mouseleave', () => { paused = false; });
  })();


  /* ═══════════════════════════════════════════════════════
     5. ECO-RING (About page) — CSS rotates ring,
        JS counter-rotates each node so text stays upright
  ═══════════════════════════════════════════════════════ */
  (function initEcoRing() {
    const ring  = document.getElementById('ecoRing');
    const nodes = document.querySelectorAll('#ecoRing .eco-node');
    if (!ring || !nodes.length) return;

    const N      = nodes.length;   // 11
    const RADIUS = 145;            // px — same as visual ring radius
    const center = 180;            // half of .ecosystem-visual (360px)

    // Static position of each node on the ring
    nodes.forEach(function (node, i) {
      const angleDeg = (i * 360) / N;
      const angleRad = (angleDeg * Math.PI) / 180;
      const x = center + RADIUS * Math.sin(angleRad)  - 43; // 43 = half node width
      const y = center - RADIUS * Math.cos(angleRad)  - 13; // 13 = half node height
      node.style.left = x + 'px';
      node.style.top  = y + 'px';
    });

    // Read the computed animation duration from CSS (28s)
    const DURATION_MS = 28000;
    let   startTime   = null;

    function updateCounterRotation(ts) {
      if (!startTime) startTime = ts;
      const elapsed = (ts - startTime) % DURATION_MS;
      const deg     = (elapsed / DURATION_MS) * 360;

      nodes.forEach(function (node) {
        // Counter-rotate each node by the same angle the ring has rotated
        node.style.transform = 'rotate(' + (-deg) + 'deg)';
      });

      requestAnimationFrame(updateCounterRotation);
    }

    requestAnimationFrame(updateCounterRotation);
  })();


  /* ═══════════════════════════════════════════════════════
     6. INTERSECTION OBSERVER — staggered card entry
  ═══════════════════════════════════════════════════════ */
  const animatables = document.querySelectorAll(
    '.feature-card,.support-card,.platform-card,.sysreq-card,.identity-card,.workflow-stage'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement.children);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 0.06) + 's';
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animatables.forEach(el => io.observe(el));
  } else {
    animatables.forEach(el => el.classList.add('is-visible'));
  }


  /* ═══════════════════════════════════════════════════════
     7. MODULE GRID CARDS → features tab
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => switchTab('features'));
    card.setAttribute('title', 'View all features');
  });


  /* ═══════════════════════════════════════════════════════
     8. CONTACT FORM
  ═══════════════════════════════════════════════════════ */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm && contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const btn  = contactForm.querySelector('button[type="submit"]');
    const span = btn && btn.querySelector('span');
    if (btn)  { btn.disabled = true; btn.style.opacity = '.7'; }
    if (span) { span.textContent = 'Sending…'; }

    setTimeout(function () {
      contactForm.style.display = 'none';
      formSuccess && (formSuccess.style.display = 'block');

      setTimeout(function () {
        contactForm.reset();
        contactForm.style.display = 'flex';
        formSuccess && (formSuccess.style.display = 'none');
        if (btn)  { btn.disabled = false; btn.style.opacity = ''; }
        if (span) { span.textContent = 'Send Message'; }
      }, 5000);
    }, 1400);
  });


  /* ═══════════════════════════════════════════════════════
     9. DOWNLOAD BUTTON FEEDBACK
  ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('.btn-download-main,.btn-download').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const orig = this.innerHTML;
      this.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg> Preparing…';
      this.style.pointerEvents = 'none'; this.style.opacity = '.75';
      setTimeout(() => {
        this.innerHTML = orig; this.style.pointerEvents = ''; this.style.opacity = '';
      }, 2500);
    });
  });


  /* ═══════════════════════════════════════════════════════
     10. KEYBOARD SHORTCUTS — Alt+1–5
  ═══════════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.altKey && !isNaN(parseInt(e.key))) {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < validTabs.length) { e.preventDefault(); switchTab(validTabs[idx]); }
    }
    if (e.key === 'Escape') closeMobileMenu();
  });

})();
