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

  /* -------- Toronto Weather (OpenWeatherMap) -------- */

// 1. Put your API key here (inside quotes)
const OPENWEATHER_API_KEY = "2ab143c2b961e5d504d3ee9a46173d58";

// Toronto Time & Weather Elements
const torontoTimeEl = document.getElementById("toronto-time");
const torontoWeatherEl = document.getElementById("toronto-weather");

// ---- Toronto Time ----
function updateTorontoTime() {
  if (!torontoTimeEl) return;

  const options = {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat([], options);
  torontoTimeEl.textContent = formatter.format(new Date());
}

if (torontoTimeEl) {
  updateTorontoTime();
  setInterval(updateTorontoTime, 1000);
}

// ---- Toronto Weather ----
async function loadTorontoWeather() {
  if (!torontoWeatherEl) return;

  const url = `https://api.openweathermap.org/data/2.5/weather?id=6167865&units=metric&appid=${OPENWEATHER_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("Weather response:", res.status, data);

    // Error handling: missing data or invalid key
    if (!res.ok || !data || !data.main || !data.weather) {
      torontoWeatherEl.textContent = "Weather N/A";
      return;
    }

    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;

    torontoWeatherEl.textContent = `${temp}°C, ${desc}`;
  } catch (err) {
    console.error("Weather error", err);
    torontoWeatherEl.textContent = "Weather N/A";
  }
}

if (torontoWeatherEl) {
  loadTorontoWeather();
  setInterval(loadTorontoWeather, 10 * 60 * 1000); // update every 10 minutes
}
});
