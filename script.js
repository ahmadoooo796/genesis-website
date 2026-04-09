/**
 * GENESIS ERP — Main JavaScript
 * Tab navigation, interactions, and UI logic
 * Version: 3.0
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     TAB NAVIGATION
  ═══════════════════════════════════════════════════════ */

  const navItems    = document.querySelectorAll('.nav-item');
  const tabSections = document.querySelectorAll('.tab-section');

  /**
   * Switch to a given tab by name
   * @param {string} tabName - e.g. 'home', 'about', 'features'
   */
  function switchTab(tabName) {
    // Guard: ensure tab exists
    const target = document.getElementById('tab-' + tabName);
    if (!target) return;

    // Update nav active state
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Hide all sections
    tabSections.forEach(section => {
      section.classList.remove('active', 'fade-in');
    });

    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Show target section with animation
    requestAnimationFrame(() => {
      target.classList.add('active');
      requestAnimationFrame(() => {
        target.classList.add('fade-in');
      });
    });

    // Close mobile menu if open
    closeMobileMenu();

    // Update URL hash (without page jump)
    history.replaceState(null, '', '#' + tabName);
  }

  // Bind nav item clicks
  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      switchTab(this.dataset.tab);
    });
  });

  // Bind ALL elements with data-tab attribute (CTA buttons, etc.)
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-tab]');
    if (trigger && !trigger.classList.contains('nav-item')) {
      e.preventDefault();
      switchTab(trigger.dataset.tab);
    }
  });

  // Handle URL hash on load
  (function () {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['home', 'about', 'features', 'download', 'contact'];
    if (hash && validTabs.includes(hash)) {
      switchTab(hash);
    } else {
      // Default: show home
      const home = document.getElementById('tab-home');
      if (home) {
        home.classList.add('active', 'fade-in');
      }
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

  function openMobileMenu() {
    if (navLinks) navLinks.classList.add('open');
    if (hamburger) {
      const spans = hamburger.querySelectorAll('span');
      if (spans[0]) spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      if (spans[1]) spans[1].style.opacity   = '0';
      if (spans[2]) spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks && navLinks.classList.contains('open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
  }

  // Close on outside click
  document.addEventListener('click', function (e) {
    if (
      navLinks &&
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });


  /* ═══════════════════════════════════════════════════════
     NAVBAR SCROLL SHADOW
  ═══════════════════════════════════════════════════════ */

  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', function () {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }
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

      // Loading state
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.7';
        if (btnSpan) btnSpan.textContent = 'Sending…';
      }

      // Simulate API call delay
      setTimeout(function () {
        contactForm.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';

        // Reset after showing success (optional auto-reset)
        setTimeout(function () {
          contactForm.reset();
          contactForm.style.display = 'flex';
          if (formSuccess) formSuccess.style.display = 'none';
          if (btn) {
            btn.disabled = false;
            btn.style.opacity = '';
            if (btnSpan) btnSpan.textContent = 'Send Message';
          }
        }, 5000);

      }, 1400);
    });
  }


  /* ═══════════════════════════════════════════════════════
     MODULE CARDS — click to navigate to features
  ═══════════════════════════════════════════════════════ */

  const moduleCards = document.querySelectorAll('.module-card');
  moduleCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      switchTab('features');
    });
    card.setAttribute('title', 'View all features');
  });


  /* ═══════════════════════════════════════════════════════
     INTERSECTION OBSERVER — Staggered card animations
  ═══════════════════════════════════════════════════════ */

  const animatables = document.querySelectorAll(
    '.feature-card, .support-card, .platform-card, .sysreq-card, .identity-card, .workflow-stage'
  );

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    animatables.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all immediately
    animatables.forEach(el => el.classList.add('is-visible'));
  }


  /* ═══════════════════════════════════════════════════════
     DOWNLOAD BUTTON INTERACTIONS
  ═══════════════════════════════════════════════════════ */

  const downloadBtns = document.querySelectorAll('.btn-download-main, .btn-download');
  downloadBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const originalText = this.textContent.trim();
      const originalHTML = this.innerHTML;

      this.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="63" stroke-dashoffset="63"
            style="animation: stroke-fill 1.2s ease forwards"/>
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Preparing Download…
      `;
      this.style.pointerEvents = 'none';
      this.style.opacity = '0.75';

      setTimeout(() => {
        this.innerHTML = originalHTML;
        this.style.pointerEvents = '';
        this.style.opacity = '';
      }, 2500);
    });
  });


  /* ═══════════════════════════════════════════════════════
     LOGO CLICK — back to home
  ═══════════════════════════════════════════════════════ */

  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', function () {
      switchTab('home');
    });
  }


  /* ═══════════════════════════════════════════════════════
     KEYBOARD NAVIGATION
  ═══════════════════════════════════════════════════════ */

  document.addEventListener('keydown', function (e) {
    const tabs = ['home', 'about', 'features', 'download', 'contact'];

    // Alt + number to switch tabs
    if (e.altKey && !isNaN(parseInt(e.key))) {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < tabs.length) {
        e.preventDefault();
        switchTab(tabs[idx]);
      }
    }

    // Escape to close mobile menu
    if (e.key === 'Escape') closeMobileMenu();
  });


  /* ═══════════════════════════════════════════════════════
     TOOLTIP: keyboard shortcuts hint (dev helper)
  ═══════════════════════════════════════════════════════ */

  // console.info('GENESIS ERP — Alt+1…5 to switch tabs');

})();
