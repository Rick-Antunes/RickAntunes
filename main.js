/* ════════════════════════════════════════════════
   PORTFOLIO — main.js
   Axios (modern) · Open-Meteo API · FastAPI backend
   ════════════════════════════════════════════════ */

/* ── 1. TEMA (Dark/Light) ────────────────────────── */
(function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

document.getElementById('themeToggle').addEventListener('click', () => {
  const html  = document.documentElement;
  const next  = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* ── 2. VISITANTES (FastAPI + SQLite) ───────────── */
const BACKEND = 'https://portfolio-backend-dzn5.onrender.com';

async function registerAndCountVisit() {
  try {
    const res = await axios.post(`${BACKEND}/api/visit`, null, { timeout: 4000 });
    animateCounter(res.data.count);
  } catch {
    document.getElementById('visitorCount').textContent = '—';
  }
}

function animateCounter(target) {
  const el  = document.getElementById('visitorCount');
  const dur = 1200, step = 16;
  const inc = target / (dur / step);
  let   cur = 0;
  const t = setInterval(() => {
    cur += inc;
    if (cur >= target) { cur = target; clearInterval(t); }
    el.textContent = Math.floor(cur).toLocaleString('pt-BR');
  }, step);
}

registerAndCountVisit();

/* ── 3. CLIMA (Open-Meteo — sem API key) ─────────── */
const weatherIcons = {
  clear: '☀', cloudy: '☁', fog: '🌫', drizzle: '🌦',
  rain: '🌧', snow: '❄', thunder: '⛈', default: '🌡',
};

function wmoToCategory(code) {
  if (code === 0)                                   return 'clear';
  if ([1,2,3].includes(code))                       return 'cloudy';
  if ([45,48].includes(code))                       return 'fog';
  if ([51,53,55,56,57].includes(code))              return 'drizzle';
  if ([61,63,65,66,67,80,81,82].includes(code))     return 'rain';
  if ([71,73,75,77,85,86].includes(code))           return 'snow';
  if ([95,96,99].includes(code))                    return 'thunder';
  return 'default';
}

const wmoLabels = {
  0:'Céu limpo',1:'Pouco nublado',2:'Parcialmente nublado',3:'Nublado',
  45:'Neblina',48:'Neblina c/ gelo',51:'Garoa leve',53:'Garoa',
  55:'Garoa intensa',61:'Chuva leve',63:'Chuva moderada',65:'Chuva forte',
  71:'Nevada leve',73:'Nevada',75:'Nevada intensa',80:'Pancadas',
  81:'Pancadas mod.',82:'Pancadas fortes',95:'Trovoada',99:'Trovoada c/ granizo',
};

async function loadWeather() {
  const iconEl = document.getElementById('weatherIcon');
  const tempEl = document.getElementById('weatherTemp');
  const descEl = document.getElementById('weatherDesc');

  iconEl.textContent = '🌡';
  tempEl.textContent = '';
  descEl.textContent = '...';

  try {
    const pos = await new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error('no-geo'));
      const timer = setTimeout(() => rej(new Error('timeout')), 5000);
      navigator.geolocation.getCurrentPosition(
        p  => { clearTimeout(timer); res(p); },
        () => { clearTimeout(timer); rej(new Error('denied')); },
        { timeout: 5000, maximumAge: 300000 }
      );
    });

    const { latitude: lat, longitude: lon } = pos.coords;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
      + `&current=temperature_2m,weathercode&wind_speed_unit=ms&timezone=auto`;

    const { data } = await axios.get(url, { timeout: 5000 });
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;

    iconEl.textContent = weatherIcons[wmoToCategory(code)];
    tempEl.textContent = `${temp}°`;
    descEl.textContent = wmoLabels[code] || 'Tempo atual';

  } catch {
    iconEl.textContent = '📍';
    tempEl.textContent = '';
    descEl.textContent = 'Habilite localização';
  }
}

loadWeather();

/* ── 4. CARROSSEL GENÉRICO ───────────────────────── */
function isMobile() { return window.innerWidth <= 768; }

function makeCarousel({ trackId, prevId, nextId, itemsPerView }) {
  const track    = document.getElementById(trackId);
  const viewport = track?.parentElement;
  const prevBtn  = document.getElementById(prevId);
  const nextBtn  = document.getElementById(nextId);
  if (!track) return;

  let index = 0;
  const cards    = () => Array.from(track.children);
  const maxIndex = () => Math.max(0, cards().length - itemsPerView);

  function go(i) {
    if (isMobile()) {
      // Mobile: usa scroll nativo com snap
      const card = cards()[Math.max(0, Math.min(i, cards().length - 1))];
      card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      index = Math.max(0, Math.min(i, cards().length - 1));
      return;
    }
    index = Math.max(0, Math.min(i, maxIndex()));
    const card = cards()[0];
    if (!card) return;
    const gap    = 20;
    const offset = (card.offsetWidth + gap) * index;
    track.style.transform = `translateX(-${offset}px)`;
  }

  prevBtn?.addEventListener('click', () => go(index - 1));
  nextBtn?.addEventListener('click', () => go(index + 1));

  // Drag no desktop
  let startX = 0, dragging = false;
  viewport.addEventListener('mousedown', e => { startX = e.clientX; dragging = true; });
  window.addEventListener('mouseup', e => {
    if (!dragging) return; dragging = false;
    if (isMobile()) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 60) go(dx < 0 ? index + 1 : index - 1);
  });

  // Recalcula ao redimensionar
  window.addEventListener('resize', () => {
    if (!isMobile()) go(index);
  });
}

makeCarousel({ trackId: 'projectTrack', prevId: 'projectPrev', nextId: 'projectNext', itemsPerView: 3 });
makeCarousel({ trackId: 'skillTrack',   prevId: 'skillPrev',   nextId: 'skillNext',   itemsPerView: 5 });

/* ── 5. CLIQUE E FOCO EM PROJETOS ────────────────── */
const focusEl     = document.getElementById('projectFocusText');
const DEFAULT_MSG = 'Passe o mouse sobre um projeto para ver mais detalhes.';

focusEl.textContent = DEFAULT_MSG;

let activeCard = null; // rastreia qual card está ativo

document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    const link = card.dataset.link;
    if (link && link.startsWith('http')) window.open(link, '_blank', 'noopener');
  });

  card.addEventListener('mouseenter', () => {
    activeCard = card;

    const shortDesc = card.querySelector('.card-desc')?.textContent?.trim() || '';
    const fullDesc  = card.querySelector('.card-title')?.dataset.fullDesc?.trim() || shortDesc;

    focusEl.style.transition = 'none';
    focusEl.style.opacity    = '1';
    focusEl.textContent      = fullDesc || shortDesc || DEFAULT_MSG;
  });

  card.addEventListener('mouseleave', () => {
    activeCard = null;

    // Só reseta se nenhum outro card recebeu o foco
    setTimeout(() => {
      if (activeCard === null) {
        focusEl.style.transition = 'opacity 0.25s';
        focusEl.style.opacity    = '0';
        setTimeout(() => {
          if (activeCard === null) {
            focusEl.textContent      = DEFAULT_MSG;
            focusEl.style.opacity    = '1';
            focusEl.style.transition = 'none';
          }
        }, 260);
      }
    }, 50);
  });
});

/* ── 6. ANO NO FOOTER ────────────────────────────── */
document.getElementById('footerYear').textContent = new Date().getFullYear();