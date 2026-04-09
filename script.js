/**
 * GENESIS ERP — Main JavaScript
 * Tab navigation, interactions, and UI logic
 * Version: 3.1 — 10 Modules Edition
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     TAB NAVIGATION
  ═══════════════════════════════════════════════════════ */

  const navItems    = document.querySelectorAll('.nav-item');
  const tabSections = document.querySelectorAll('.tab-section');
  const validTabs   = ['home', 'about', 'features', 'download', 'contact'];

  function switchTab(tabName) {
    if (!validTabs.includes(tabName)) return;
    const target = document.getElementById('tab-' + tabName);
    if (!target) return;

    navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tabName));
    tabSections.forEach(s => s.classList.remove('active', 'fade-in'));

    window.scrollTo({ top: 0, behavior: 'smooth' });

    requestAnimationFrame(() => {
      target.classList.add('active');
      requestAnimationFrame(() => target.classList.add('fade-in'));
    });

    closeMobileMenu();
    history.replaceState(null, '', '#' + tabName);
  }

  // Nav item clicks
  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      switchTab(this.dataset.tab);
    });
  });

  // Any [data-tab] element (buttons, CTAs, logo)
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-tab]');
    if (trigger && !trigger.classList.contains('nav-item')) {
      e.preventDefault();
      switchTab(trigger.dataset.tab);
    }
  });

  // Hash routing on load
  (function () {
    const hash = window.location.hash.replace('#', '');
    if (hash && validTabs.includes(hash)) {
      switchTab(hash);
    } else {
      const home = document.getElementById('tab-home');
      if (home) { home.classList.add('active', 'fade-in'); }
    }
  })();


  /* ═══════════════════════════════════════════════════════
     MOBILE HAMBURGER MENU
  ═══════════════════════════════════════════════════════ */

  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  function closeMobileMenu() {
    if (navLinks) navLinks.classList.remove('open');
    if (hamburger) {
      const spans = hamburger.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks && navLinks.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        navLinks.classList.add('open');
        const spans = hamburger.querySelectorAll('span');
        if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        if (spans[1]) spans[1].style.opacity   = '0';
        if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      }
    });
  }

  document.addEventListener('click', function (e) {
    if (navLinks && navLinks.classList.contains('open') &&
        !navLinks.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });


  /* ═══════════════════════════════════════════════════════
     NAVBAR SCROLL SHADOW
  ═══════════════════════════════════════════════════════ */

  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });


  /* ═══════════════════════════════════════════════════════
     CONTACT FORM
  ═══════════════════════════════════════════════════════ */

  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const btnSpan = btn ? btn.querySelector('span') : null;

      if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
      if (btnSpan) btnSpan.textContent = 'Sending…';

      setTimeout(function () {
        contactForm.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';

        setTimeout(function () {
          contactForm.reset();
          contactForm.style.display = 'flex';
          if (formSuccess) formSuccess.style.display = 'none';
          if (btn) { btn.disabled = false; btn.style.opacity = ''; }
          if (btnSpan) btnSpan.textContent = 'Send Message';
        }, 5000);
      }, 1400);
    });
  }


  /* ═══════════════════════════════════════════════════════
     MODULE CARDS — click to features tab
  ═══════════════════════════════════════════════════════ */

  document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => switchTab('features'));
    card.setAttribute('title', 'View all features');
  });


  /* ═══════════════════════════════════════════════════════
     INTERSECTION OBSERVER — staggered card entry
  ═══════════════════════════════════════════════════════ */

  const animatables = document.querySelectorAll(
    '.feature-card, .support-card, .platform-card, .sysreq-card, .identity-card, .workflow-stage'
  );

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          // Slight stagger based on sibling index
          const siblings = Array.from(entry.target.parentElement.children);
          const i = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = (i * 0.06) + 's';
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animatables.forEach(el => io.observe(el));
  } else {
    animatables.forEach(el => el.classList.add('is-visible'));
  }


  /* ═══════════════════════════════════════════════════════
     DOWNLOAD BUTTON FEEDBACK
  ═══════════════════════════════════════════════════════ */

  document.querySelectorAll('.btn-download-main, .btn-download').forEach(btn => {
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
     KEYBOARD SHORTCUTS
  ═══════════════════════════════════════════════════════ */

  document.addEventListener('keydown', function (e) {
    if (e.altKey && !isNaN(parseInt(e.key))) {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < validTabs.length) { e.preventDefault(); switchTab(validTabs[idx]); }
    }
    if (e.key === 'Escape') closeMobileMenu();
  });

})();
