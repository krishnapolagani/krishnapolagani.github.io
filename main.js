document.addEventListener('DOMContentLoaded', () => {
  /* -------- Footer year -------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* -------- Reveal-on-scroll -------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('reveal-visible'));
  }

  /* -------- Theme toggle (dark / light) -------- */
  const body = document.body;
  const toggleBtn = document.getElementById('themeToggle');
  const faviconLink = document.getElementById('favicon');

  const LIGHT_ICON = '☾';
  const DARK_ICON  = '☀️';

  const LIGHT_FAVICON = 'images/favicon-rk-logo.png';
  const DARK_FAVICON  = 'images/favicon-rk-logo-dark.png';

  const THEME_KEY = 'rk-theme';

  function applyTheme(isDark, persist = true) {
    if (isDark) {
      body.classList.add('dark-mode');
      if (toggleBtn) toggleBtn.textContent = DARK_ICON;
      if (faviconLink) faviconLink.href = DARK_FAVICON;
      if (persist) localStorage.setItem(THEME_KEY, 'dark');
    } else {
      body.classList.remove('dark-mode');
      if (toggleBtn) toggleBtn.textContent = LIGHT_ICON;
      if (faviconLink) faviconLink.href = LIGHT_FAVICON;
      if (persist) localStorage.setItem(THEME_KEY, 'light');
    }
  }

  if (toggleBtn) {
    (function initTheme() {
      const saved = localStorage.getItem(THEME_KEY);

      if (saved === 'dark') {
        applyTheme(true, false);
        return;
      }

      if (saved === 'light') {
        applyTheme(false, false);
        return;
      }

      // No saved preference: respect system preference, fallback to dark
      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      applyTheme(prefersDark || true, false);
    })();

    toggleBtn.addEventListener('click', () => {
      const currentlyDark = body.classList.contains('dark-mode');
      applyTheme(!currentlyDark);
    });
  }

  /* -------- Back to top + Parallax -------- */
  const backToTopBtn = document.getElementById('backToTop');

  function handleScroll() {
    // Back to top visibility
    if (backToTopBtn) {
      if (window.scrollY > 280) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    }

    // Parallax glow on header background
    const offset = window.scrollY * 0.18;
    document.documentElement.style.setProperty('--hero-parallax', `${-offset}px`);
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // initial position

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
