// ══════════════════════════════════════
// NAV INIT — anchor scroll + non-home solid nav
// (hamburger is handled by catalog.js)
// ══════════════════════════════════════
(function() {
  // On non-home pages, force nav to solid immediately
  const nav  = document.getElementById('mainNav');
  const hero = document.querySelector('.hero-video-container');
  if (nav && !hero) {
    nav.classList.add('solid');
  }

  // Handle #anchor on page load (e.g. index.html#contact-section)
  if (window.location.hash) {
    setTimeout(() => {
      const el = document.querySelector(window.location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  // Smooth scroll for in-page anchor links
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      e.preventDefault();
      const t = document.querySelector(a.getAttribute('href'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
