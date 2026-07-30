/* ==========================================================================
   PANEL DE ADMINISTRACIÓN — Eternal Beat Radio Chile
   --------------------------------------------------------------------------
   Este panel edita directamente los archivos del repositorio de GitHub
   usando la API de Contents. No requiere servidor propio: los cambios se
   guardan como commits y GitHub Pages vuelve a publicar el sitio solo.

   El token NUNCA se sube al repositorio: se guarda solo en este navegador
   (localStorage o sessionStorage, según elija el usuario).
   ========================================================================== */

(function () {
  'use strict';

  /* ----------------------------- CONFIGURACIÓN ----------------------------- */

  const REPO_OWNER = 'radioeternalbeat-prog';
  const REPO_NAME = 'WEB-RADIO-ETERNAL-BEAT';
  const BRANCH = 'main';
  const API = 'https://api.github.com';

  const SETTINGS_PATH = 'data/settings.json';
  const NEWS_PATH = 'data/news.json';
  const BG_PATH = 'assets/bg-hero.jpg';

  const BANNERS = [
    { key: 'top', label: 'Banner superior', path: 'assets/ads/banner-top.jpg' },
    { key: 'strip', label: 'Banner intermedio 1', path: 'assets/ads/banner-strip.jpg' },
    { key: 'strip2', label: 'Banner intermedio 2', path: 'assets/ads/banner-strip-2.jpg' },
    { key: 'bottom', label: 'Banner inferior', path: 'assets/ads/banner-bottom.jpg' },
  ];

  const TOKEN_KEY = 'ebr_admin_token';

  /* ----------------------------- ESTADO ----------------------------- */

  let token = '';
  let settings = {};
  let news = [];
  const shaCache = {};

  /* ----------------------------- UTILIDADES ----------------------------- */

  const $ = (id) => document.getElementById(id);

  function toast(msg, type) {
    const el = $('toast');
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.className = 'toast' + (type ? ' ' + type : ''); }, 4000);
  }

  // Codifica texto UTF-8 a base64 (soporta acentos y emojis correctamente)
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach((b) => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  // Decodifica base64 a texto UTF-8
  function base64ToUtf8(b64) {
    const bin = atob(b64.replace(/\s/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // Convierte un File a base64 puro (sin el prefijo data:)
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result);
        resolve(result.slice(result.indexOf(',') + 1));
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  /* ----------------------------- API DE GITHUB ----------------------------- */

  async function ghRequest(path, options = {}) {
    const res = await fetch(`${API}${path}`, Object.assign({}, options, {
      headers: Object.assign({
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      }, options.headers || {}),
    }));

    if (res.status === 401) throw new Error('Token inválido o expirado. Vuelve a ingresar.');
    if (res.status === 403) throw new Error('El token no tiene permisos suficientes (necesita Contents: Read and write).');
    if (res.status === 404 && options.method !== 'PUT') return null;

    if (!res.ok) {
      let detail = '';
      try { const j = await res.json(); detail = j.message || ''; } catch (e) { /* ignore */ }
      throw new Error(`Error de GitHub (${res.status}) ${detail}`);
    }
    return res.status === 204 ? null : res.json();
  }

  // Lee un archivo del repo. Devuelve { content, sha } o null si no existe.
  async function getFile(filePath) {
    const data = await ghRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}&t=${Date.now()}`
    );
    if (!data) return null;
    shaCache[filePath] = data.sha;
    return { content: data.content ? base64ToUtf8(data.content) : '', sha: data.sha };
  }

  // Obtiene solo el sha actual de un archivo (necesario para actualizarlo)
  async function getSha(filePath) {
    try {
      const data = await ghRequest(
        `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}&t=${Date.now()}`
      );
      return data ? data.sha : null;
    } catch (e) {
      return null;
    }
  }

  // Crea o actualiza un archivo en el repo
  async function putFile(filePath, base64Content, message) {
    const sha = shaCache[filePath] || await getSha(filePath);
    const body = {
      message: message,
      content: base64Content,
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    const result = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
    if (result && result.content) shaCache[filePath] = result.content.sha;
    return result;
  }

  /* ----------------------------- ACCESO ----------------------------- */

  async function tryLogin(tk, remember) {
    token = tk;
    const status = $('loginStatus');
    status.textContent = 'Verificando acceso...';
    status.className = 'login-status';

    try {
      const repo = await ghRequest(`/repos/${REPO_OWNER}/${REPO_NAME}`);
      if (!repo) throw new Error('No se encontró el repositorio con este token.');
      if (!repo.permissions || !repo.permissions.push) {
        throw new Error('Este token no tiene permiso de escritura en el repositorio.');
      }

      if (remember) {
        localStorage.setItem(TOKEN_KEY, tk);
      } else {
        sessionStorage.setItem(TOKEN_KEY, tk);
      }

      $('repoLabel').textContent = `${repo.full_name} · rama ${BRANCH}`;
      status.textContent = 'Acceso correcto. Cargando datos...';
      status.className = 'login-status ok';

      await loadAllData();

      $('loginScreen').classList.add('hidden');
      $('adminWrap').classList.remove('hidden');
    } catch (err) {
      token = '';
      status.textContent = err.message;
      status.className = 'login-status err';
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    token = '';
    $('adminWrap').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    $('tokenInput').value = '';
    $('loginStatus').textContent = '';
    $('loginStatus').className = 'login-status';
  }

  /* ----------------------------- CARGA DE DATOS ----------------------------- */

  async function loadAllData() {
    // Configuración
    const sFile = await getFile(SETTINGS_PATH);
    settings = sFile && sFile.content ? JSON.parse(sFile.content) : {};
    fillSettingsForm();

    // Noticias
    const nFile = await getFile(NEWS_PATH);
    try {
      news = nFile && nFile.content ? JSON.parse(nFile.content) : [];
    } catch (e) {
      news = [];
    }
    if (!Array.isArray(news)) news = [];
    renderNews();

    // Banners (para saber cuáles existen)
    renderBanners();
  }

  function fillSettingsForm() {
    const st = settings.station || {};
    $('stationName').value = st.name || '';
    $('stationSlogan').value = st.slogan || '';
    $('stationCountry').value = st.country || '';

    $('streamUrl').value = settings.streamUrl || '';
    $('metadataUrl').value = settings.metadataUrl || '';
    $('metadataRefresh').value = settings.metadataRefreshSeconds || 15;

    const v = settings.video || {};
    $('videoProvider').value = v.provider || 'youtube';
    $('ytChannelId').value = v.youtubeChannelId || '';
    $('ytVideoId').value = v.youtubeVideoId || '';
    $('twitchChannel').value = v.twitchChannel || '';
    updateProviderFields();

    const c = settings.chat || {};
    $('chatEnabled').checked = !!c.enabled;
    $('chatangoGroup').value = c.chatangoGroupId || '';

    const s = settings.social || {};
    $('socialFacebook').value = s.facebook || '';
    $('socialInstagram').value = s.instagram || '';
    $('socialTiktok').value = s.tiktok || '';
    $('socialWhatsapp').value = s.whatsapp || '';
    $('socialYoutube').value = s.youtube || '';
    $('socialEmail').value = s.email || '';

    const bg = settings.background || {};
    const op = bg.overlayOpacity !== undefined ? bg.overlayOpacity : 0.88;
    $('bgOpacity').value = op;
    $('bgOpacityVal').textContent = op;
  }

  function collectSettings() {
    return {
      streamUrl: $('streamUrl').value.trim(),
      metadataUrl: $('metadataUrl').value.trim(),
      metadataRefreshSeconds: Number($('metadataRefresh').value) || 15,
      video: {
        provider: $('videoProvider').value,
        youtubeChannelId: $('ytChannelId').value.trim(),
        youtubeVideoId: $('ytVideoId').value.trim(),
        twitchChannel: $('twitchChannel').value.trim(),
      },
      chat: {
        enabled: $('chatEnabled').checked,
        chatangoGroupId: $('chatangoGroup').value.trim(),
      },
      social: {
        facebook: $('socialFacebook').value.trim(),
        instagram: $('socialInstagram').value.trim(),
        tiktok: $('socialTiktok').value.trim(),
        whatsapp: $('socialWhatsapp').value.trim(),
        youtube: $('socialYoutube').value.trim(),
        email: $('socialEmail').value.trim(),
      },
      station: {
        name: $('stationName').value.trim(),
        slogan: $('stationSlogan').value.trim(),
        country: $('stationCountry').value.trim(),
      },
      background: {
        overlayOpacity: Number($('bgOpacity').value),
      },
    };
  }

  async function saveSettings(successMsg) {
    const btns = document.querySelectorAll('[data-save="settings"], #saveBgBtn');
    btns.forEach(b => { b.disabled = true; });
    try {
      settings = collectSettings();
      const json = JSON.stringify(settings, null, 2) + '\n';
      await putFile(SETTINGS_PATH, utf8ToBase64(json), 'Actualiza configuración desde el panel de administración');
      toast(successMsg || 'Configuración guardada. El sitio se actualizará en 1-2 minutos.', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      btns.forEach(b => { b.disabled = false; });
    }
  }

  /* ----------------------------- FONDO ----------------------------- */

  async function saveBackground() {
    const btn = $('saveBgBtn');
    const file = $('bgFile').files[0];
    btn.disabled = true;
    try {
      if (file) {
        if (file.size > 4 * 1024 * 1024) {
          throw new Error('La imagen es muy pesada (máximo 4 MB). Reduce su tamaño e intenta de nuevo.');
        }
        const b64 = await fileToBase64(file);
        await putFile(BG_PATH, b64, 'Actualiza imagen de fondo desde el panel de administración');
        $('bgFile').value = '';
      }
      // Guardamos también la opacidad
      settings = collectSettings();
      const json = JSON.stringify(settings, null, 2) + '\n';
      await putFile(SETTINGS_PATH, utf8ToBase64(json), 'Actualiza ajustes de fondo desde el panel de administración');
      toast('Fondo guardado. El sitio se actualizará en 1-2 minutos.', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      btn.disabled = false;
    }
  }

  /* ----------------------------- BANNERS ----------------------------- */

  function renderBanners() {
    const grid = $('bannerGrid');
    grid.innerHTML = BANNERS.map((b) => `
      <div class="banner-item" data-key="${b.key}">
        <h3>${b.label}</h3>
        <p class="banner-path">${b.path}</p>
        <img class="banner-thumb" src="../${b.path}?t=${Date.now()}" alt=""
             onerror="this.outerHTML='<div class=\\'banner-empty\\'>Sin imagen — se muestra \\'Espacio disponible\\'</div>'">
        <div class="banner-actions">
          <input type="file" accept="image/jpeg,image/png,image/webp" data-banner-file="${b.key}">
          <button class="btn-ghost" data-banner-upload="${b.key}">Subir</button>
        </div>
      </div>
    `).join('');

    BANNERS.forEach((b) => {
      grid.querySelector(`[data-banner-upload="${b.key}"]`)
        .addEventListener('click', () => uploadBanner(b));
    });
  }

  async function uploadBanner(banner) {
    const input = document.querySelector(`[data-banner-file="${banner.key}"]`);
    const btn = document.querySelector(`[data-banner-upload="${banner.key}"]`);
    const file = input.files[0];
    if (!file) {
      toast('Primero elige una imagen para ' + banner.label, 'err');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast('La imagen es muy pesada (máximo 3 MB).', 'err');
      return;
    }
    btn.disabled = true;
    try {
      const b64 = await fileToBase64(file);
      await putFile(banner.path, b64, `Actualiza ${banner.label} desde el panel de administración`);
      input.value = '';
      toast(banner.label + ' actualizado. El sitio se actualizará en 1-2 minutos.', 'ok');
      setTimeout(renderBanners, 1500);
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      btn.disabled = false;
    }
  }

  /* ----------------------------- NOTICIAS ----------------------------- */

  function renderNews() {
    const list = $('newsAdminList');
    if (!news.length) {
      list.innerHTML = '<p class="news-empty-msg">Aún no hay noticias. Usa el botón de arriba para agregar la primera.</p>';
      return;
    }
    list.innerHTML = news.map((item, i) => `
      <div class="news-admin-item" data-index="${i}">
        <div class="news-item-head">
          <strong>Noticia ${i + 1}</strong>
          <button class="btn-danger" data-del-news="${i}">Eliminar</button>
        </div>
        <div class="field">
          <label>Título</label>
          <input type="text" data-news-field="title" value="${escapeAttr(item.title || '')}" placeholder="Título de la noticia">
        </div>
        <div class="field">
          <label>Resumen</label>
          <textarea data-news-field="summary" placeholder="Breve descripción">${escapeHtml(item.summary || '')}</textarea>
        </div>
        <div class="row2">
          <div class="field">
            <label>Fecha</label>
            <input type="date" data-news-field="date" value="${escapeAttr((item.date || '').slice(0, 10))}">
          </div>
          <div class="field">
            <label>Enlace (opcional)</label>
            <input type="text" data-news-field="link" value="${escapeAttr(item.link || '')}" placeholder="https://...">
          </div>
        </div>
        <div class="field">
          <label>URL de imagen (opcional)</label>
          <input type="text" data-news-field="image" value="${escapeAttr(item.image || '')}" placeholder="assets/noticia1.jpg o https://...">
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-del-news]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.getAttribute('data-del-news'));
        if (confirm('¿Eliminar esta noticia?')) {
          collectNewsFromForm();
          news.splice(idx, 1);
          renderNews();
        }
      });
    });
  }

  function collectNewsFromForm() {
    const items = document.querySelectorAll('.news-admin-item');
    const result = [];
    items.forEach((el) => {
      const get = (f) => {
        const input = el.querySelector(`[data-news-field="${f}"]`);
        return input ? input.value.trim() : '';
      };
      const title = get('title');
      if (!title) return; // ignoramos noticias sin título
      result.push({
        title: title,
        summary: get('summary'),
        date: get('date') || new Date().toISOString().slice(0, 10),
        link: get('link'),
        image: get('image'),
      });
    });
    news = result;
  }

  async function saveNews() {
    const btn = $('saveNewsBtn');
    btn.disabled = true;
    try {
      collectNewsFromForm();
      const json = JSON.stringify(news, null, 2) + '\n';
      await putFile(NEWS_PATH, utf8ToBase64(json), 'Actualiza noticias desde el panel de administración');
      toast('Noticias guardadas. El sitio se actualizará en 1-2 minutos.', 'ok');
      renderNews();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      btn.disabled = false;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ----------------------------- PRUEBAS DE STREAM ----------------------------- */

  function testStream() {
    const url = $('streamUrl').value.trim();
    const out = $('testResult');
    if (!url) { out.textContent = 'Escribe primero la URL del stream.'; out.className = 'test-result err'; return; }
    out.textContent = 'Probando...';
    out.className = 'test-result';

    const a = new Audio();
    a.src = url;
    let done = false;
    const finish = (ok, msg) => {
      if (done) return;
      done = true;
      a.pause();
      a.src = '';
      out.textContent = msg;
      out.className = 'test-result ' + (ok ? 'ok' : 'err');
    };
    a.addEventListener('canplay', () => finish(true, 'El stream responde correctamente.'));
    a.addEventListener('playing', () => finish(true, 'El stream responde correctamente.'));
    a.addEventListener('error', () => finish(false, 'No se pudo conectar al stream. Revisa la URL.'));
    a.play().catch(() => { /* autoplay puede bloquearse, esperamos los eventos */ });
    setTimeout(() => finish(false, 'El stream no respondió (tiempo agotado).'), 10000);
  }

  async function testMetadata() {
    const url = $('metadataUrl').value.trim();
    const out = $('testResult');
    if (!url) { out.textContent = 'Escribe primero la URL de metadatos.'; out.className = 'test-result err'; return; }
    out.textContent = 'Probando...';
    out.className = 'test-result';
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const found = data.icestats || data.songtitle || data.currentsong || (Array.isArray(data.sources) && data.sources[0]);
      out.textContent = found
        ? 'Metadatos detectados correctamente.'
        : 'La URL responde, pero no se reconoció el formato de metadatos.';
      out.className = 'test-result ' + (found ? 'ok' : 'err');
    } catch (err) {
      out.textContent = 'No se pudieron leer los metadatos (puede ser bloqueo CORS del servidor).';
      out.className = 'test-result err';
    }
  }

  /* ----------------------------- NAVEGACIÓN / EVENTOS ----------------------------- */

  function updateProviderFields() {
    const provider = $('videoProvider').value;
    document.querySelectorAll('[data-provider]').forEach((el) => {
      el.style.display = el.getAttribute('data-provider') === provider ? '' : 'none';
    });
  }

  function initEvents() {
    // Acceso
    $('loginBtn').addEventListener('click', () => {
      const tk = $('tokenInput').value.trim();
      if (!tk) {
        $('loginStatus').textContent = 'Ingresa tu token para continuar.';
        $('loginStatus').className = 'login-status err';
        return;
      }
      tryLogin(tk, $('rememberToken').checked);
    });
    $('tokenInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') $('loginBtn').click();
    });
    $('logoutBtn').addEventListener('click', logout);

    // Pestañas
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const name = tab.getAttribute('data-tab');
        const panelId = name === 'social' ? 'panel-social' : 'panel-' + name;
        const panel = $(panelId) || $('panel-' + name);
        if (panel) panel.classList.add('active');
      });
    });

    // Guardar configuración (varios botones)
    document.querySelectorAll('[data-save="settings"]').forEach((btn) => {
      btn.addEventListener('click', () => saveSettings());
    });

    // Video: mostrar campos según plataforma
    $('videoProvider').addEventListener('change', updateProviderFields);

    // Fondo
    $('bgOpacity').addEventListener('input', (e) => {
      $('bgOpacityVal').textContent = e.target.value;
    });
    $('bgFile').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const img = $('bgPreview');
        img.src = url;
        img.style.display = 'block';
      }
    });
    $('saveBgBtn').addEventListener('click', saveBackground);

    // Noticias
    $('addNewsBtn').addEventListener('click', () => {
      collectNewsFromForm();
      news.unshift({
        title: 'Nueva noticia',
        summary: '',
        date: new Date().toISOString().slice(0, 10),
        link: '',
        image: '',
      });
      renderNews();
    });
    $('saveNewsBtn').addEventListener('click', saveNews);

    // Pruebas
    $('testStreamBtn').addEventListener('click', testStream);
    $('testMetaBtn').addEventListener('click', testMetadata);
  }

  /* ----------------------------- ARRANQUE ----------------------------- */

  initEvents();

  // Si hay un token guardado, intentamos entrar automáticamente
  const saved = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  if (saved) {
    $('tokenInput').value = saved;
    tryLogin(saved, !!localStorage.getItem(TOKEN_KEY));
  }

})();
