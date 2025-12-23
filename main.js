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

      // NOTE: keeping your behavior (default dark) exactly as-is:
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

  /* =========================================================
     TOP BAR SEGMENT SYNC (prevents | | and hides empty blocks)
     Requires updated HTML:
       - #torontoMeta container
       - .segment elements with data-seg="time|weather|metals"
     ========================================================= */
  function syncTorontoMetaSegments() {
    const meta = document.getElementById("torontoMeta");
    if (!meta) return;

    const segments = meta.querySelectorAll(".segment[data-seg]");
    segments.forEach((seg) => {
      const key = seg.dataset.seg;

      // time should always show
      if (key === "time") {
        seg.hidden = false;
        return;
      }

      const hasImg = !!seg.querySelector("img");
      const hasText = (seg.textContent || "").trim().length > 0;

      // hide if empty (prevents separators from appearing)
      seg.hidden = !(hasImg || hasText);
    });
  }

  /* -------- Toronto Weather (OpenWeatherMap) -------- */

  // Your API key
  const OPENWEATHER_API_KEY = "2ab143c2b961e5d504d3ee9a46173d58";

  const torontoTimeEl = document.getElementById("toronto-time");
  const torontoWeatherEl = document.getElementById("toronto-weather");

  // small helper: fetch JSON and fail fast on non-200
  async function fetchJsonOrThrow(url) {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) ? `: ${data.message || data.error}` : "";
      throw new Error(`HTTP ${res.status}${msg}`);
    }
    return data;
  }

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

    // keep separators correct as time updates
    syncTorontoMetaSegments();
  }

  if (torontoTimeEl) {
    updateTorontoTime();
    setInterval(updateTorontoTime, 1000);
  }

  /* ---- Toronto Weather ---- */
  async function loadTorontoWeather() {
    if (!torontoWeatherEl) return;

    // Start: keep it hidden until we have content
    torontoWeatherEl.innerHTML = "";
    torontoWeatherEl.hidden = true;
    syncTorontoMetaSegments();

    const url = `https://api.openweathermap.org/data/2.5/weather?id=6167865&units=metric&appid=${OPENWEATHER_API_KEY}`;

    try {
      const data = await fetchJsonOrThrow(url);

      if (!data || !data.main || !data.weather || !data.weather.length) {
        throw new Error("Unexpected weather payload");
      }

      const temp = Math.round(data.main.temp);
      const desc = data.weather[0].description;
      const icon = data.weather[0].icon;

      torontoWeatherEl.innerHTML = `
        <span class="weather-pill">
          <span class="toronto-weather-temp">${temp}°C</span>
          <span class="toronto-weather-icon">
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
          </span>
          <span class="toronto-weather-desc">${desc}</span>
        </span>
      `;

      torontoWeatherEl.hidden = false;
      syncTorontoMetaSegments();

    } catch (err) {
      console.error("Weather error", err);

      // Keep it hidden if unavailable (cleaner than "Weather N/A" in header)
      torontoWeatherEl.innerHTML = "";
      torontoWeatherEl.hidden = true;
      syncTorontoMetaSegments();
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

    // Keep your existing "Loading…" behavior but ensure it always resolves
    metalsInlineEl.textContent = "Loading…";

    try {
      const [goldData, silverData, fxData] = await Promise.all([
        fetchJsonOrThrow("https://api.gold-api.com/price/XAU"),
        fetchJsonOrThrow("https://api.gold-api.com/price/XAG"),
        fetchJsonOrThrow("https://open.er-api.com/v6/latest/USD") // USD -> CAD (no key)
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

      // ✅ Pills output (matches your CSS)
      metalsInlineEl.innerHTML = `
        <span class="metals-pill"><strong>Gold</strong> C$${goldCad.toFixed(0)}/oz</span>
        <span class="metals-pill"><strong>Silver</strong> C$${silverCad.toFixed(2)}/oz</span>
      `;

      syncTorontoMetaSegments();

    } catch (err) {
      console.error("Metals error:", err);

      // Always resolve to a stable state (never stuck "Loading…")
      metalsInlineEl.textContent = "N/A";
      syncTorontoMetaSegments();
    }
  }

  if (metalsInlineEl) {
    loadMetalsCAD();
    setInterval(loadMetalsCAD, 5 * 60 * 1000);
  }

});
