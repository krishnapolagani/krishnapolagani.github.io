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

      if (saved === 'dark') return applyTheme(true, false);
      if (saved === 'light') return applyTheme(false, false);

      const prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;

      applyTheme(prefersDark || true, false);
    })();

    toggleBtn.addEventListener('click', () => {
      applyTheme(!body.classList.contains('dark-mode'));
    });
  }

  /* -------- Back to top + Parallax -------- */
  const backToTopBtn = document.getElementById('backToTop');

  function handleScroll() {
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('show', window.scrollY > 280);
    }

    const offset = window.scrollY * 0.18;
    document.documentElement.style.setProperty('--hero-parallax', `${-offset}px`);
  }

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* -------- Toronto Weather (OpenWeatherMap) -------- */

  // Your API key
  const OPENWEATHER_API_KEY = "2ab143c2b961e5d504d3ee9a46173d58";

  const torontoTimeEl = document.getElementById("toronto-time");
  const torontoWeatherEl = document.getElementById("toronto-weather");

  /* ---- Toronto Time ---- */
  function updateTorontoTime() {
    if (!torontoTimeEl) return;

    const options = {
      timeZone: "America/Toronto",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };

    const formatter = new Intl.DateTimeFormat([], options);
    let formatted = formatter.format(new Date());
    formatted = formatted.replace(" a.m.", " AM").replace(" p.m.", " PM");

    torontoTimeEl.textContent = formatted;
  }

  if (torontoTimeEl) {
    updateTorontoTime();
    setInterval(updateTorontoTime, 1000);
  }

  /* ---- Toronto Weather ---- */
  async function loadTorontoWeather() {
    if (!torontoWeatherEl) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?id=6167865&units=metric&appid=${OPENWEATHER_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log("Weather response:", res.status, data);

      if (!res.ok || !data || !data.main || !data.weather || !data.weather.length) {
        torontoWeatherEl.textContent = "Weather N/A";
        return;
      }

      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const icon = data.weather[0].icon;

      torontoWeatherEl.innerHTML = `
        <span class="toronto-weather-temp">${temp}°C</span>
        <span class="toronto-weather-icon">
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
        </span>
        <span class="toronto-weather-desc">${desc}</span>
      `;
    } catch (err) {
      console.error("Weather error", err);
      torontoWeatherEl.textContent = "Weather N/A";
    }
  }

  if (torontoWeatherEl) {
    loadTorontoWeather();
    setInterval(loadTorontoWeather, 10 * 60 * 1000);
  }

  /* -------- Precious Metals (Gold/Silver) in CAD -------- */
  const metalsInlineEl = document.getElementById("metals-inline");

  async function loadMetalsCAD() {
    if (!metalsInlineEl) return;

    try {
      const [goldRes, silverRes, fxRes] = await Promise.all([
        fetch("https://api.gold-api.com/price/XAU"),
        fetch("https://api.gold-api.com/price/XAG"),
        fetch("https://open.er-api.com/v6/latest/USD") // USD -> CAD (no key)
      ]);

      const [goldData, silverData, fxData] = await Promise.all([
        goldRes.json(),
        silverRes.json(),
        fxRes.json()
      ]);

      const usdToCad = fxData?.rates?.CAD;
      const goldUsd = goldData?.price;
      const silverUsd = silverData?.price;

      if (!usdToCad || !goldUsd || !silverUsd) {
        console.log("Metals debug:", { goldData, silverData, fxData });
        throw new Error("Unexpected API response for metals/FX");
      }

      const goldCad = goldUsd * usdToCad;
      const silverCad = silverUsd * usdToCad;

      // ✅ Pills output (matches your updated CSS)
      metalsInlineEl.innerHTML = `
        <span class="metals-pill"><strong>Gold</strong> C$${goldCad.toFixed(0)}/oz</span>
        <span class="metals-pill"><strong>Silver</strong> C$${silverCad.toFixed(2)}/oz</span>
      `;
    } catch (err) {
      console.error("Metals error:", err);
      metalsInlineEl.textContent = "N/A";
    }
  }

  if (metalsInlineEl) {
    loadMetalsCAD();
    setInterval(loadMetalsCAD, 5 * 60 * 1000);
  }

});
