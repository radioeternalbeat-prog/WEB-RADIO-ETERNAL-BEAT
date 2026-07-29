/* ==========================================================================
   ETERNAL BEAT RADIO CHILE — LÓGICA PRINCIPAL DEL SITIO
   ========================================================================== */

(function () {
  'use strict';

  const CFG = window.RADIO_CONFIG || {};
  const audio = document.getElementById('radioAudio');
  const playBtn = document.getElementById('playBtn');
  const footerPlayBtn = document.getElementById('footerPlayBtn');
  const iconPlay = document.getElementById('iconPlay');
  const iconPause = document.getElementById('iconPause');
  const npTitle = document.getElementById('npTitle');
  const npListeners = document.getElementById('npListeners');
  const volumeSlider = document.getElementById('volumeSlider');
  const historyList = document.getElementById('historyList');

  let isPlaying = false;
  let lastTrack = '';
  const historyMax = 15;
  const historyItems = [];

  /* ------------------------- REPRODUCTOR DE AUDIO ------------------------- */

  function setPlayIcon(playing) {
    iconPlay.style.display = playing ? 'none' : 'block';
    iconPause.style.display = playing ? 'block' : 'none';
    playBtn.classList.toggle('playing', playing);
  }

  function togglePlay() {
    if (!CFG.streamUrl) {
      alert('Configura la URL del stream en config.js');
      return;
    }
    if (!isPlaying) {
      if (!audio.src) {
        audio.src = CFG.streamUrl;
      }
      audio.play().then(() => {
        isPlaying = true;
        setPlayIcon(true);
      }).catch((err) => {
        console.error('No se pudo reproducir el stream:', err);
        npTitle.textContent = 'No se pudo conectar al stream';
      });
    } else {
      audio.pause();
      isPlaying = false;
      setPlayIcon(false);
    }
  }

  playBtn.addEventListener('click', togglePlay);
  if (footerPlayBtn) {
    footerPlayBtn.addEventListener('click', () => {
      togglePlay();
      document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
    });
  }

  volumeSlider.addEventListener('input', (e) => {
    audio.volume = Number(e.target.value) / 100;
  });
  audio.volume = Number(volumeSlider.value) / 100;

  audio.addEventListener('waiting', () => { npTitle.textContent = 'Conectando...'; });
  audio.addEventListener('error', () => { npTitle.textContent = 'Stream no disponible por el momento'; });

  /* ------------------------- METADATOS (NOW PLAYING) ------------------------- */
  // Intenta leer metadatos en formatos comunes de Icecast / Shoutcast / Centova Cast.
  // Si el formato de tu servidor es distinto, ajusta la función parseMetadata().

  function parseMetadata(data) {
    // Formato Icecast status-json.xsl
    try {
      if (data.icestats) {
        const source = Array.isArray(data.icestats.source) ? data.icestats.source[0] : data.icestats.source;
        if (source) {
          return {
            title: source.title || source.yp_currently_playing || '',
            listeners: source.listeners ?? null,
          };
        }
      }
      // Formato Shoutcast v2 / Centova (stats?json=1)
      if (data.songtitle || data.currentsong) {
        return {
          title: data.songtitle || data.currentsong || '',
          listeners: data.currentlisteners ?? data.listeners ?? null,
        };
      }
      // Formato genérico con array "sources"
      if (Array.isArray(data.sources) && data.sources[0]) {
        const s = data.sources[0];
        return { title: s.title || s.track || '', listeners: s.listeners ?? null };
      }
    } catch (e) { /* silencioso */ }
    return null;
  }

  function updateHistory(title) {
    if (!title || title === lastTrack) return;
    lastTrack = title;
    const time = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    historyItems.unshift({ title, time });
    if (historyItems.length > historyMax) historyItems.pop();
    renderHistory();
  }

  function renderHistory() {
    if (!historyItems.length) return;
    historyList.innerHTML = historyItems
      .map(item => `<li><span class="history-title">${escapeHtml(item.title)}</span><span class="history-time">${item.time}</span></li>`)
      .join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function fetchMetadata() {
    if (!CFG.metadataUrl) return;
    try {
      const res = await fetch(CFG.metadataUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const meta = parseMetadata(data);
      if (meta && meta.title) {
        npTitle.textContent = meta.title;
        updateHistory(meta.title);
      }
      if (meta && meta.listeners !== null && meta.listeners !== undefined) {
        npListeners.textContent = `${meta.listeners} oyentes conectados`;
      }
    } catch (err) {
      // No rompemos la UI si los metadatos fallan; el audio sigue funcionando.
      console.warn('No se pudieron obtener metadatos:', err.message);
    }
  }

  fetchMetadata();
  setInterval(fetchMetadata, (CFG.metadataRefreshSeconds || 15) * 1000);

  /* ------------------------- VIDEO EN VIVO ------------------------- */

  function initVideo() {
    const frame = document.getElementById('videoFrame');
    const v = CFG.video || {};
    const currentDomain = window.location.hostname || 'localhost';

    if (v.provider === 'youtube' && (v.youtubeChannelId || v.youtubeVideoId)) {
      let src = '';
      if (v.youtubeChannelId) {
        src = `https://www.youtube.com/embed/live_stream?channel=${v.youtubeChannelId}&autoplay=0`;
      } else {
        src = `https://www.youtube.com/embed/${v.youtubeVideoId}?autoplay=0`;
      }
      frame.innerHTML = `<iframe src="${src}" title="Transmisión en vivo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    } else if (v.provider === 'twitch' && v.twitchChannel) {
      const src = `https://player.twitch.tv/?channel=${encodeURIComponent(v.twitchChannel)}&parent=${currentDomain}&autoplay=false`;
      frame.innerHTML = `<iframe src="${src}" title="Transmisión en vivo" allowfullscreen></iframe>`;
    }
    // Si provider es 'none' o falta configuración, se mantiene el placeholder del HTML.
  }

  /* ------------------------- CHAT EN VIVO (Chatango) ------------------------- */

  function initChat() {
    const chatCfg = CFG.chat || {};
    const frame = document.getElementById('chatFrame');
    if (!chatCfg.enabled || !chatCfg.chatangoGroupId) return;

    frame.innerHTML = '<div id="chatango-embed" style="width:100%;height:100%;"></div>';
    const holder = document.getElementById('chatango-embed');

    window.CHATANGO_CONFIG = {
      handle: chatCfg.chatangoGroupId,
      arch: 'js',
      styles: {
        a: 100, b: 0, c: '000000', d: 0, k: 'FF8000', l: 'FF8000',
        m: 'FF8000', n: 'FFFFFF', p: '10', q: 'FFFFFF', r: 100,
        t: 0, usricon: 0, fwtickm: 1
      }
    };
    const script = document.createElement('script');
    script.src = 'https://st.chatango.com/js/gz/emb.js';
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    holder.appendChild(script);
    // Nota: Chatango requiere que el embed script se ejecute en la página final;
    // en entornos de desarrollo local puede no cargar por CORS/dominio no verificado.
  }

  /* ------------------------- NOTICIAS ------------------------- */

  async function loadNews() {
    const grid = document.getElementById('newsGrid');
    try {
      const res = await fetch('data/news.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('No se encontró data/news.json');
      const news = await res.json();
      if (!Array.isArray(news) || news.length === 0) {
        grid.innerHTML = '<p class="news-empty">Aún no hay noticias publicadas.</p>';
        return;
      }
      grid.innerHTML = news
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(item => `
          <article class="news-card">
            ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" onerror="this.style.display='none'">` : ''}
            <div class="news-card-body">
              <span class="news-date">${formatDate(item.date)}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.summary || '')}</p>
              ${item.link ? `<a class="news-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Leer más →</a>` : ''}
            </div>
          </article>
        `).join('');
    } catch (err) {
      grid.innerHTML = '<p class="news-empty">No se pudieron cargar las noticias.</p>';
      console.warn(err.message);
    }
  }

  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return dateStr; }
  }

  /* ------------------------- REDES SOCIALES / FOOTER ------------------------- */

  function initSocial() {
    const s = CFG.social || {};
    const container = document.getElementById('socialLinks');
    const icons = {
      facebook: '📘', instagram: '📷', tiktok: '🎵', whatsapp: '💬', youtube: '▶️',
    };
    const links = Object.entries(s).filter(([key, val]) => key !== 'email' && val);
    if (links.length) {
      container.innerHTML = links.map(([key, val]) =>
        `<a href="${escapeHtml(val)}" target="_blank" rel="noopener" title="${key}">${icons[key] || '🔗'}</a>`
      ).join('');
    }
    const emailEl = document.getElementById('footerEmail');
    if (s.email) emailEl.textContent = `✉️ ${s.email}`;
  }

  /* ------------------------- INFO GENERAL / NAV MÓVIL ------------------------- */

  function initStationInfo() {
    const station = CFG.station || {};
    if (station.slogan) document.getElementById('stationSlogan').textContent = station.slogan;
    document.title = `${station.name || 'Eternal Beat Radio Chile'} | En Vivo`;
  }

  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  /* ------------------------- CAST HINT ------------------------- */

  document.getElementById('castHint').addEventListener('click', () => {
    alert('Para transmitir a Chromecast:\n\n1. Abre el menú de tu navegador Chrome (⋮).\n2. Selecciona "Transmitir".\n3. Elige tu dispositivo Chromecast.\n\n¡Y disfruta la radio en tu TV!');
  });

  /* ------------------------- INIT ------------------------- */

  document.getElementById('year').textContent = new Date().getFullYear();
  initStationInfo();
  initMobileNav();
  initVideo();
  initChat();
  initSocial();
  loadNews();

})();
