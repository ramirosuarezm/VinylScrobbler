/* VinylScrobbler — Discogs → Last.fm. Vanilla JS, sin dependencias. */
(() => {
'use strict';

/* ==================================================================
   MD5 (necesario para firmar la API de Last.fm; Web Crypto no lo trae)
   Algoritmo estándar RFC 1321, sobre los bytes UTF-8 del texto.
   ================================================================== */
const md5 = (() => {
  const add = (x, y) => { const l = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff); };
  const rol = (n, c) => (n << c) | (n >>> (32 - c));
  const cmn = (q, a, b, x, s, t) => add(rol(add(add(a, q), add(x, t)), s), b);
  const FF = (a, b, c, d, x, s, t) => cmn((b & c) | (~b & d), a, b, x, s, t);
  const GG = (a, b, c, d, x, s, t) => cmn((b & d) | (c & ~d), a, b, x, s, t);
  const HH = (a, b, c, d, x, s, t) => cmn(b ^ c ^ d, a, b, x, s, t);
  const II = (a, b, c, d, x, s, t) => cmn(c ^ (b | ~d), a, b, x, s, t);
  const enc = new TextEncoder();

  return function md5(str) {
    const bytes = enc.encode(str);
    const blocks = ((bytes.length + 8) >> 6) + 1;
    const x = new Int32Array(blocks * 16);
    for (let i = 0; i < bytes.length; i++) x[i >> 2] |= bytes[i] << ((i % 4) * 8);
    x[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
    x[blocks * 16 - 2] = bytes.length * 8;

    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
    for (let i = 0; i < x.length; i += 16) {
      const oa = a, ob = b, oc = c, od = d;
      a = FF(a, b, c, d, x[i], 7, -680876936);      d = FF(d, a, b, c, x[i + 1], 12, -389564586);
      c = FF(c, d, a, b, x[i + 2], 17, 606105819);  b = FF(b, c, d, a, x[i + 3], 22, -1044525330);
      a = FF(a, b, c, d, x[i + 4], 7, -176418897);  d = FF(d, a, b, c, x[i + 5], 12, 1200080426);
      c = FF(c, d, a, b, x[i + 6], 17, -1473231341);b = FF(b, c, d, a, x[i + 7], 22, -45705983);
      a = FF(a, b, c, d, x[i + 8], 7, 1770035416);  d = FF(d, a, b, c, x[i + 9], 12, -1958414417);
      c = FF(c, d, a, b, x[i + 10], 17, -42063);    b = FF(b, c, d, a, x[i + 11], 22, -1990404162);
      a = FF(a, b, c, d, x[i + 12], 7, 1804603682); d = FF(d, a, b, c, x[i + 13], 12, -40341101);
      c = FF(c, d, a, b, x[i + 14], 17, -1502002290);b = FF(b, c, d, a, x[i + 15], 22, 1236535329);

      a = GG(a, b, c, d, x[i + 1], 5, -165796510);  d = GG(d, a, b, c, x[i + 6], 9, -1069501632);
      c = GG(c, d, a, b, x[i + 11], 14, 643717713); b = GG(b, c, d, a, x[i], 20, -373897302);
      a = GG(a, b, c, d, x[i + 5], 5, -701558691);  d = GG(d, a, b, c, x[i + 10], 9, 38016083);
      c = GG(c, d, a, b, x[i + 15], 14, -660478335);b = GG(b, c, d, a, x[i + 4], 20, -405537848);
      a = GG(a, b, c, d, x[i + 9], 5, 568446438);   d = GG(d, a, b, c, x[i + 14], 9, -1019803690);
      c = GG(c, d, a, b, x[i + 3], 14, -187363961); b = GG(b, c, d, a, x[i + 8], 20, 1163531501);
      a = GG(a, b, c, d, x[i + 13], 5, -1444681467);d = GG(d, a, b, c, x[i + 2], 9, -51403784);
      c = GG(c, d, a, b, x[i + 7], 14, 1735328473); b = GG(b, c, d, a, x[i + 12], 20, -1926607734);

      a = HH(a, b, c, d, x[i + 5], 4, -378558);     d = HH(d, a, b, c, x[i + 8], 11, -2022574463);
      c = HH(c, d, a, b, x[i + 11], 16, 1839030562);b = HH(b, c, d, a, x[i + 14], 23, -35309556);
      a = HH(a, b, c, d, x[i + 1], 4, -1530992060); d = HH(d, a, b, c, x[i + 4], 11, 1272893353);
      c = HH(c, d, a, b, x[i + 7], 16, -155497632); b = HH(b, c, d, a, x[i + 10], 23, -1094730640);
      a = HH(a, b, c, d, x[i + 13], 4, 681279174);  d = HH(d, a, b, c, x[i], 11, -358537222);
      c = HH(c, d, a, b, x[i + 3], 16, -722521979); b = HH(b, c, d, a, x[i + 6], 23, 76029189);
      a = HH(a, b, c, d, x[i + 9], 4, -640364487);  d = HH(d, a, b, c, x[i + 12], 11, -421815835);
      c = HH(c, d, a, b, x[i + 15], 16, 530742520); b = HH(b, c, d, a, x[i + 2], 23, -995338651);

      a = II(a, b, c, d, x[i], 6, -198630844);      d = II(d, a, b, c, x[i + 7], 10, 1126891415);
      c = II(c, d, a, b, x[i + 14], 15, -1416354905);b = II(b, c, d, a, x[i + 5], 21, -57434055);
      a = II(a, b, c, d, x[i + 12], 6, 1700485571); d = II(d, a, b, c, x[i + 3], 10, -1894986606);
      c = II(c, d, a, b, x[i + 10], 15, -1051523);  b = II(b, c, d, a, x[i + 1], 21, -2054922799);
      a = II(a, b, c, d, x[i + 8], 6, 1873313359);  d = II(d, a, b, c, x[i + 15], 10, -30611744);
      c = II(c, d, a, b, x[i + 6], 15, -1560198380);b = II(b, c, d, a, x[i + 13], 21, 1309151649);
      a = II(a, b, c, d, x[i + 4], 6, -145523070);  d = II(d, a, b, c, x[i + 11], 10, -1120210379);
      c = II(c, d, a, b, x[i + 2], 15, 718787259);  b = II(b, c, d, a, x[i + 9], 21, -343485551);

      a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
    }
    const hex = w => { let s = ''; for (let i = 0; i < 4; i++) s += ((w >>> (i * 8)) & 0xff).toString(16).padStart(2, '0'); return s; };
    return hex(a) + hex(b) + hex(c) + hex(d);
  };
})();

/* ==================== utilidades ==================== */
const $ = (s, r = document) => r.querySelector(s);
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
/* Rango de marcas diacríticas combinantes (U+0300–U+036F): "Bohème" → "boheme". */
const DIACRITICS = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g');
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(DIACRITICS, '');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clean = n => String(n ?? '').replace(/\s*\(\d+\)$/, '').trim();   // "Wire (2)" → "Wire"
const isPlaceholder = u => !u || u.includes('spacer.gif');

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k) { try { localStorage.removeItem(k); } catch {} }
};

/* ==================== estado ==================== */
const DEFAULT_CFG = { dUser: '', dToken: '', lKey: '', lSecret: '', lUser: '', lSK: '' };
const COLLECTION_TTL = 12 * 60 * 60 * 1000;   // refresco automático en segundo plano
const MAX_HIST = 60;
const MAX_REL_CACHE = 60;

let cfg = { ...DEFAULT_CFG, ...store.get('cfg', {}) };
let records = [];          // colección normalizada
let shown = [];            // resultado del filtro/orden actual
let hist = store.get('hist', []);
let queue = store.get('queue', []);   // scrobbles pendientes por falta de red
let relCache = store.get('relCache', {});
let current = null;        // { rec, tracks }
let loadAbort = null;      // carga de colección en curso
let isDark = document.documentElement.dataset.theme === 'dark';

/* ==================== HTTP ==================== */
class ApiError extends Error {
  constructor(msg, status) { super(msg); this.status = status; }
}

async function fetchJSON(url, opts = {}, retries = 3) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, opts);
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      if (attempt >= retries) throw new ApiError('offline', 0);
      await sleep(400 * 2 ** attempt);
      continue;
    }
    // 429 = límite de la API de Discogs (60 req/min). Esperamos y reintentamos.
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const wait = Number(res.headers.get('Retry-After')) * 1000 || 1200 * 2 ** attempt;
      await sleep(wait);
      continue;
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.message || `HTTP ${res.status}`, res.status);
    return data;
  }
}

const discogs = (path, opts = {}) => fetchJSON('https://api.discogs.com' + path, {
  ...opts,
  headers: { Authorization: `Discogs token=${cfg.dToken}`, Accept: 'application/json', ...opts.headers }
});

/* Ejecuta tareas con concurrencia limitada (Discogs corta a ~60 req/min). */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx], idx); }
  }));
  return out;
}

/* ==================== Last.fm ==================== */
function apiSig(params, secret) {
  const keys = Object.keys(params).filter(k => k !== 'format' && k !== 'callback').sort();
  return md5(keys.map(k => k + params[k]).join('') + secret);
}

async function lastfm(params, secret) {
  const p = { ...params };
  p.api_sig = apiSig(p, secret);
  p.format = 'json';
  const res = await fetch('https://ws.audioscrobbler.com/2.0/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(p)
  }).catch(() => { throw new ApiError('offline', 0); });
  const data = await res.json().catch(() => null);
  if (!data) throw new ApiError('Respuesta inválida', res.status);
  if (data.error) throw new ApiError(data.message || `Error ${data.error}`, data.error);
  return data;
}

async function getSession(key, secret, user, pass) {
  const d = await lastfm({ method: 'auth.getMobileSession', api_key: key, username: user, password: pass }, secret);
  return d.session?.key || null;
}

/* La session key de Last.fm no expira: se pide una vez y se reutiliza. */
async function ensureSession() {
  if (cfg.lSK) return cfg.lSK;
  const pass = $('#lPass').value;
  if (!cfg.lKey || !cfg.lSecret || !cfg.lUser || !pass) return null;
  cfg.lSK = await getSession(cfg.lKey, cfg.lSecret, cfg.lUser, pass);
  if (cfg.lSK) saveCfg();
  return cfg.lSK;
}

/* ==================== colección ==================== */
function compact(r) {
  const i = r.basic_information || {};
  const cover = !isPlaceholder(i.cover_image) ? i.cover_image : (i.thumb || '');
  const artist = (i.artists || []).map(a => clean(a.name)).join(', ');
  return {
    k: r.instance_id ?? r.id,
    r: i.id ?? r.id,
    t: i.title || '',
    a: artist,
    y: i.year || 0,
    c: cover,
    th: i.thumb || cover,
    d: r.date_added || ''
  };
}
const withIndex = rec => (rec.s = norm(rec.a + ' ' + rec.t), rec);

async function loadCollection({ silent = false } = {}) {
  if (!cfg.dUser || !cfg.dToken) return;
  loadAbort?.abort();                      // una carga nueva cancela la anterior
  const ac = new AbortController();
  loadAbort = ac;
  const { signal } = ac;
  const btn = $('#reloadBtn');
  btn.dataset.busy = '1';
  if (!silent && !records.length) renderSkeleton();

  try {
    const base = `/users/${encodeURIComponent(cfg.dUser)}/collection/folders/0/releases?per_page=100&sort=artist`;
    const first = await discogs(`${base}&page=1`, { signal });
    if (!Array.isArray(first.releases)) throw new ApiError('Respuesta inesperada de Discogs', first.status);
    const pages = first.pagination?.pages || 1;
    const total = first.pagination?.items ?? first.releases.length;
    const byPage = [first.releases];
    setCount(`${byPage[0].length} de ${total}`);

    if (pages > 1) {
      const rest = Array.from({ length: pages - 1 }, (_, n) => n + 2);
      let done = first.releases.length;
      // 4 páginas en paralelo en vez de una tras otra: colecciones grandes cargan mucho más rápido.
      const results = await mapLimit(rest, 4, async page => {
        const d = await discogs(`${base}&page=${page}`, { signal });
        done += d.releases.length;
        setCount(`${done} de ${total}`);
        return d.releases;
      });
      results.forEach((rel, n) => { byPage[n + 1] = rel; });
    }

    records = byPage.flat().map(r => withIndex(compact(r)));
    store.set('collection', { ts: Date.now(), items: records.map(({ s, ...r }) => r) });
    applyFilters();
    toastIf(silent, `Colección actualizada · ${plural(records.length, 'disco')}`);
  } catch (e) {
    if (e.name === 'AbortError') return;
    if (records.length) {
      toast(e.status === 0 ? 'Sin conexión: mostrando la copia guardada' : `Discogs: ${e.message}`);
    } else if (e.status === 401 || e.status === 403) {
      showEmpty('#colContent', 'Credenciales inválidas', 'Revisá tu usuario y token de Discogs en Ajustes.', 'settings');
    } else if (e.status === 404) {
      showEmpty('#colContent', 'Usuario no encontrado', `Discogs no conoce a "${cfg.dUser}".`, 'settings');
    } else {
      showEmpty('#colContent', e.status === 0 ? 'Sin conexión' : 'Error al cargar', e.status === 0 ? 'No se pudo contactar a Discogs.' : e.message);
    }
  } finally {
    if (loadAbort === ac) {                // no pisamos el estado de una carga más nueva
      loadAbort = null;
      delete btn.dataset.busy;
      updateCount();
    }
  }
}

/* ==================== filtro y orden ==================== */
const SORTERS = {
  artist: (a, b) => a.a.localeCompare(b.a, 'es') || a.t.localeCompare(b.t, 'es'),
  title: (a, b) => a.t.localeCompare(b.t, 'es'),
  year: (a, b) => (b.y || 0) - (a.y || 0) || a.a.localeCompare(b.a, 'es'),
  added: (a, b) => String(b.d).localeCompare(String(a.d))
};

function applyFilters() {
  const q = norm($('#srchInput').value.trim());
  const terms = q ? q.split(/\s+/) : [];
  shown = terms.length ? records.filter(r => terms.every(t => r.s.includes(t))) : records.slice();
  shown.sort(SORTERS[$('#sortSel').value] || SORTERS.artist);
  renderGrid();
  updateCount();
}

/* ==================== render ==================== */
function renderSkeleton() {
  $('#colContent').innerHTML = `<div class="grid loading">${'<div class="skel-card"><i></i><b></b><b></b></div>'.repeat(8)}</div>`;
}

function renderGrid() {
  const el = $('#colContent');
  if (!records.length) {
    showEmpty('#colContent', 'Colección vacía',
      cfg.dToken && cfg.dUser ? 'No encontramos discos en tu colección de Discogs.' : 'Configurá tus credenciales de Discogs en Ajustes.',
      cfg.dToken && cfg.dUser ? null : 'settings');
    return;
  }
  if (!shown.length) { showEmpty('#colContent', 'Sin resultados', 'Probá con otra búsqueda.'); return; }
  el.innerHTML = `<div class="grid">${shown.map(cardHTML).join('')}</div>`;
}

function cardHTML(r) {
  const img = r.c
    ? `<img src="${esc(r.c)}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
    : `<span class="vcard-noimg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg></span>`;
  return `<button class="vcard" type="button" data-k="${esc(r.k)}">
    <span class="vcard-img">${img}</span>
    <span class="vcard-info">
      <span class="vcard-title">${esc(r.t)}</span>
      <span class="vcard-artist">${esc(r.a)}</span>
      ${r.y ? `<span class="vcard-year">${r.y}</span>` : ''}
    </span>
  </button>`;
}

function showEmpty(sel, title, body, gotoPage) {
  $(sel).innerHTML = `<div class="empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/></svg>
    <h3>${esc(title)}</h3><p>${esc(body)}</p>
    ${gotoPage ? `<button class="btn btn-red" data-page="${gotoPage}">Ir a Ajustes</button>` : ''}
  </div>`;
}

const setCount = txt => { $('#countPill').textContent = txt; };
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
function updateCount() {
  if (!records.length) return setCount('— discos');
  setCount(shown.length === records.length ? plural(records.length, 'disco') : `${shown.length} / ${records.length}`);
}

/* ==================== detalle del disco ==================== */
async function openRelease(key) {
  const rec = records.find(r => String(r.k) === String(key));
  if (!rec) return;
  current = { rec, tracks: [] };

  $('#shCover').src = rec.c || '';
  $('#shTitle').textContent = rec.t;
  $('#shArtist').textContent = rec.a;
  $('#shYear').textContent = rec.y || '';
  $('#scrobbleBtn').disabled = true;
  $('#selCount').textContent = '';
  openSheet();

  const cached = relCache[rec.r];
  if (cached) {
    current.tracks = cached.tracks.map(t => ({ ...t }));
    if (cached.cover) $('#shCover').src = cached.cover;
    renderTracks();
    $('#scrobbleBtn').disabled = false;
    return;
  }

  $('#trackList').innerHTML = '<div class="spin-wrap"><div class="spinner"></div></div>';
  try {
    const d = await discogs(`/releases/${rec.r}`);
    const primary = (d.images || []).find(im => im.type === 'primary') || (d.images || [])[0];
    const cover = primary && !isPlaceholder(primary.uri) ? primary.uri : rec.c;
    if (cover) $('#shCover').src = cover;

    current.tracks = parseTracklist(d.tracklist || [], rec.a);
    if (!current.tracks.length) {
      $('#trackList').innerHTML = msgHTML('Este lanzamiento no tiene tracklist en Discogs.');
      return;
    }
    cacheRelease(rec.r, { cover, tracks: current.tracks });
    renderTracks();
    $('#scrobbleBtn').disabled = false;
  } catch (e) {
    $('#trackList').innerHTML = msgHTML(e.status === 0 ? 'Sin conexión: no se pudo cargar el tracklist.' : 'No se pudo cargar el tracklist.');
  }
}

const msgHTML = t => `<p style="text-align:center;color:var(--txt2);padding:24px;font-size:13px">${esc(t)}</p>`;

function parseTracklist(list, albumArtist) {
  return list
    .filter(t => t.type_ !== 'heading' && t.title)
    .map((t, idx) => {
      const artist = t.artists?.length ? t.artists.map(a => clean(a.name)).join(', ') : albumArtist;
      const feat = (t.extraartists || [])
        .filter(a => /feat|with|guest|vocal/i.test(a.role || ''))
        .map(a => clean(a.name));
      return {
        pos: t.position || String(idx + 1),
        title: t.title,
        artist,
        feat,
        dur: t.duration || '',
        secs: parseDur(t.duration),
        on: true
      };
    });
}

function parseDur(s) {
  const p = String(s || '').split(':').map(Number);
  if (p.some(isNaN)) return 180;
  if (p.length === 2) return p[0] * 60 + p[1] || 180;
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2] || 180;
  return 180;
}

function cacheRelease(id, data) {
  relCache[id] = data;
  const keys = Object.keys(relCache);
  if (keys.length > MAX_REL_CACHE) keys.slice(0, keys.length - MAX_REL_CACHE).forEach(k => delete relCache[k]);
  store.set('relCache', relCache);
}

function renderTracks() {
  const albumArtist = current.rec.a;
  $('#trackList').innerHTML = current.tracks.map((t, i) => `
    <label class="trow">
      <input type="checkbox" data-i="${i}"${t.on ? ' checked' : ''}>
      <span class="tcheck"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
      <span class="tpos">${esc(t.pos)}</span>
      <span class="tname-wrap">
        <span class="tname">${esc(t.title)}</span>
        ${t.feat.length ? `<span class="tsub">feat. ${esc(t.feat.join(', '))}</span>` : ''}
        ${t.artist !== albumArtist ? `<span class="tsub alt">${esc(t.artist)}</span>` : ''}
      </span>
      <span class="tdur">${esc(t.dur)}</span>
    </label>`).join('');
  updateSelection();
}

/* Solo actualiza los contadores: no re-renderiza la lista en cada toque. */
function updateSelection() {
  const sel = current.tracks.filter(t => t.on);
  const total = sel.reduce((s, t) => s + t.secs, 0);
  $('#selAllBtn').textContent = sel.length === current.tracks.length ? 'Deseleccionar todo' : 'Seleccionar todo';
  $('#scrobbleBtn').disabled = !sel.length;
  if (!sel.length) { $('#selCount').textContent = 'Ningún track seleccionado'; return; }
  const start = new Date(Date.now() - total * 1000);
  const hhmm = d => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
  $('#selCount').innerHTML =
    `<b>${sel.length}</b> de ${plural(current.tracks.length, 'track')} · ${fmtMin(total)} · ${esc(hhmm(start))}–${esc(hhmm(new Date()))}`;
}
const fmtMin = s => `${Math.round(s / 60)} min`;

/* ==================== scrobble ==================== */
async function doScrobble() {
  const sel = current?.tracks.filter(t => t.on) || [];
  if (!sel.length) return;
  if (!cfg.lKey || !cfg.lSecret || !cfg.lUser) { toast('Configurá Last.fm en Ajustes'); goPage('settings'); return; }

  const btn = $('#scrobbleBtn');
  const label = btn.textContent;
  btn.textContent = 'Enviando…';
  btn.disabled = true;

  // Timestamps hacia atrás desde ahora: el disco terminó de sonar recién.
  let ts = Math.floor(Date.now() / 1000);
  const tracks = [...sel].reverse().map(t => { ts -= t.secs; return { ...t, ts }; }).reverse();
  const job = { album: current.rec.t, albumArtist: current.rec.a, thumb: current.rec.th, tracks };

  try {
    const n = await sendScrobble(job);
    addHistory({ ...job, n, ts: Date.now(), ok: true });
    toast(`✓ ${n} track${n === 1 ? '' : 's'} en Last.fm`);
    closeSheet();
  } catch (e) {
    if (e.status === 0) {
      queue.push(job); store.set('queue', queue);
      addHistory({ ...job, n: tracks.length, ts: Date.now(), ok: false });
      toast('Sin conexión: se enviará cuando vuelva');
      closeSheet();
    } else if (e.status === 9 || e.status === 4) {   // sesión inválida / auth
      cfg.lSK = ''; saveCfg();
      toast('Sesión de Last.fm vencida: reingresá tu contraseña en Ajustes');
      goPage('settings');
    } else {
      toast(`Last.fm: ${e.message}`);
    }
  } finally {
    btn.textContent = label;
    btn.disabled = false;
  }
}

/* Envía en tandas de 50 (máximo que acepta track.scrobble). */
async function sendScrobble(job) {
  const sk = await ensureSession();
  if (!sk) { const e = new ApiError('Falta autenticación', 9); throw e; }
  let accepted = 0;
  for (let i = 0; i < job.tracks.length; i += 50) {
    const batch = job.tracks.slice(i, i + 50);
    const p = { method: 'track.scrobble', api_key: cfg.lKey, sk };
    batch.forEach((t, idx) => {
      const artist = t.feat.length && t.artist === job.albumArtist
        ? `${t.artist} feat. ${t.feat.join(', ')}`
        : t.artist || job.albumArtist;
      p[`artist[${idx}]`] = artist;
      p[`track[${idx}]`] = t.title;
      p[`album[${idx}]`] = job.album;
      p[`albumArtist[${idx}]`] = job.albumArtist;
      p[`timestamp[${idx}]`] = String(t.ts);
      p[`duration[${idx}]`] = String(t.secs);
    });
    const d = await lastfm(p, cfg.lSecret);
    accepted += Number(d.scrobbles?.['@attr']?.accepted ?? batch.length);
  }
  return accepted;
}

async function flushQueue() {
  if (!queue.length || !navigator.onLine || !cfg.lSK) return;
  const pending = queue.slice();
  for (const job of pending) {
    try {
      const n = await sendScrobble(job);
      queue = queue.filter(j => j !== job);
      store.set('queue', queue);
      const h = hist.find(x => !x.ok && x.title === job.album && x.artist === job.albumArtist);
      if (h) { h.ok = true; h.n = n; }
      store.set('hist', hist);
      toast(`✓ ${n} tracks pendientes enviados`);
    } catch (e) {
      if (e.status === 0) break;                       // sigue sin red: reintentamos después
      queue = queue.filter(j => j !== job);            // error permanente: lo descartamos
      store.set('queue', queue);
    }
  }
  renderHist();
}

/* ==================== historial ==================== */
function addHistory(entry) {
  hist.unshift({ title: entry.album, artist: entry.albumArtist, thumb: entry.thumb, n: entry.n, ts: entry.ts, ok: entry.ok });
  hist = hist.slice(0, MAX_HIST);
  store.set('hist', hist);
  renderHist();
}

function renderHist() {
  const el = $('#histContent');
  $('#clearHistBtn').hidden = !hist.length;
  if (!hist.length) {
    el.innerHTML = `<div class="empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <h3>Sin historial</h3><p>Los álbumes que scrobblees van a aparecer acá.</p></div>`;
    return;
  }
  el.innerHTML = hist.map(h => {
    const d = new Date(h.ts);
    const when = `${d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
    const thumb = h.thumb
      ? `<img src="${esc(h.thumb)}" alt="" loading="lazy" decoding="async">`
      : `<span class="noimg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg></span>`;
    return `<div class="hcard${h.ok === false ? ' pending' : ''}">
      <div class="hthumb">${thumb}</div>
      <div class="hinfo">
        <div class="htitle">${esc(h.title)}</div>
        <div class="hartist">${esc(h.artist)}</div>
        <div class="hmeta">${h.ok === false ? '⏳ pendiente · ' : ''}${h.n} tracks · ${esc(when)}</div>
      </div></div>`;
  }).join('');
}

/* ==================== ajustes ==================== */
function fillForm() {
  ['dUser', 'dToken', 'lKey', 'lSecret', 'lUser'].forEach(id => { $('#' + id).value = cfg[id] || ''; });
  updateCacheInfo();
}
const saveCfg = () => store.set('cfg', cfg);

function readForm() {
  return {
    dUser: $('#dUser').value.trim(), dToken: $('#dToken').value.trim(),
    lKey: $('#lKey').value.trim(), lSecret: $('#lSecret').value.trim(),
    lUser: $('#lUser').value.trim(), pass: $('#lPass').value
  };
}

async function saveSettings() {
  const f = readForm();
  const userChanged = f.dUser !== cfg.dUser || f.dToken !== cfg.dToken;
  const lastfmChanged = f.lKey !== cfg.lKey || f.lSecret !== cfg.lSecret || f.lUser !== cfg.lUser;
  Object.assign(cfg, { dUser: f.dUser, dToken: f.dToken, lKey: f.lKey, lSecret: f.lSecret, lUser: f.lUser });
  if (lastfmChanged) cfg.lSK = '';

  if (!cfg.lSK && f.lKey && f.lSecret && f.lUser && f.pass) {
    setStatus('l', null, 'Autenticando…');
    try {
      cfg.lSK = await getSession(f.lKey, f.lSecret, f.lUser, f.pass);
      setStatus('l', true, `Conectado como ${f.lUser}`);
      $('#lPass').value = '';                 // la contraseña nunca se guarda
    } catch (e) {
      setStatus('l', false, e.status === 0 ? 'Sin conexión' : e.message);
    }
  }

  saveCfg();
  toast('✓ Configuración guardada');
  updateCacheInfo();
  if (cfg.dUser && cfg.dToken && (userChanged || !records.length)) {
    store.del('collection'); records = [];
    goPage('collection');
    loadCollection();
  }
  flushQueue();
}

async function testDiscogs() {
  const { dUser, dToken } = readForm();
  if (!dUser || !dToken) return toast('Completá usuario y token de Discogs');
  setStatus('d', null, 'Verificando…');
  const prev = cfg.dToken; cfg.dToken = dToken;
  try {
    const d = await discogs(`/users/${encodeURIComponent(dUser)}/collection/folders`);
    const n = d.folders?.find(f => f.id === 0)?.count;
    setStatus('d', true, n != null ? `Conectado · ${plural(n, 'disco')}` : 'Conectado correctamente');
  } catch (e) {
    setStatus('d', false, e.status === 0 ? 'Sin conexión' : e.message);
  } finally { cfg.dToken = prev; }
}

async function testLastfm() {
  const f = readForm();
  if (!f.lKey || !f.lSecret || !f.lUser) return toast('Completá los campos de Last.fm');
  if (!f.pass && cfg.lSK) return setStatus('l', true, `Sesión activa como ${cfg.lUser}`);
  if (!f.pass) return toast('Ingresá tu contraseña de Last.fm');
  setStatus('l', null, 'Verificando…');
  try {
    const sk = await getSession(f.lKey, f.lSecret, f.lUser, f.pass);
    setStatus('l', !!sk, sk ? `Conectado como ${f.lUser}` : 'Credenciales inválidas');
  } catch (e) {
    setStatus('l', false, e.status === 0 ? 'Sin conexión' : e.message);
  }
}

function setStatus(id, ok, msg) {
  const row = $('#' + id + 'Status');
  row.className = 'st-row show' + (ok === true ? ' st-ok' : ok === false ? ' st-err' : '');
  $('#' + id + 'Msg').textContent = msg;
}

function updateCacheInfo() {
  const c = store.get('collection');
  const parts = [];
  parts.push(c ? `${plural(c.items.length, 'disco')} en caché (${new Date(c.ts).toLocaleDateString('es-AR')})` : 'Sin colección guardada');
  if (queue.length) parts.push(`${plural(queue.length, 'scrobble')} pendiente${queue.length === 1 ? '' : 's'} de envío`);
  $('#cacheInfo').textContent = parts.join(' · ');
}

/* ==================== navegación y UI ==================== */
function goPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + name));
  document.querySelectorAll('nav button').forEach(b => {
    if (b.dataset.page === name) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  if (name === 'settings') updateCacheInfo();
}

function setTheme(dark, persist) {
  isDark = dark;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('#themeBtn').textContent = dark ? '☀️' : '🌙';
  if (persist) store.set('theme', dark ? 'dark' : 'light');
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
const toastIf = (silent, msg) => { if (!silent) toast(msg); };

/* ---- bottom sheet (dialog nativo: Esc, foco y backdrop gratis) ---- */
function openSheet() {
  const s = $('#sheet');
  if (!s.open) s.showModal();
  void s.offsetHeight;          // fija el estado inicial para que la transición corra
  s.classList.add('in');
}
function closeSheet() {
  const s = $('#sheet');
  if (!s.open) return;
  s.classList.remove('in');
  setTimeout(() => s.open && s.close(), 260);
}

function initSheet() {
  const s = $('#sheet');
  s.addEventListener('cancel', e => { e.preventDefault(); closeSheet(); });
  s.addEventListener('click', e => { if (e.target === s) closeSheet(); });   // click en el backdrop
  s.addEventListener('change', e => {
    const i = e.target.dataset?.i;
    if (i == null) return;
    current.tracks[i].on = e.target.checked;
    updateSelection();
  });
  // Arrastrar la barra superior hacia abajo para cerrar
  const bar = s.querySelector('.sh-topbar');
  let y0 = null, t0 = 0;
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    y0 = e.clientY; t0 = Date.now();
  });
  bar.addEventListener('pointerup', e => {
    if (y0 === null) return;
    const dy = e.clientY - y0, dt = Date.now() - t0;
    y0 = null;
    if (dy > 80 || (dy > 30 && dt < 250)) closeSheet();
  });
}

/* ==================== eventos ==================== */
const ACTIONS = {
  theme: () => setTheme(!isDark, true),
  reload: () => loadCollection(),
  save: saveSettings,
  'test-discogs': testDiscogs,
  'test-lastfm': testLastfm,
  'close-sheet': closeSheet,
  scrobble: doScrobble,
  'toggle-all': () => {
    const all = current.tracks.every(t => t.on);
    current.tracks.forEach(t => { t.on = !all; });
    document.querySelectorAll('#trackList input').forEach(i => { i.checked = !all; });
    updateSelection();
  },
  'clear-hist': () => {
    if (!confirm('¿Borrar el historial local?')) return;
    hist = []; store.del('hist'); renderHist();
  },
  'clear-cache': () => {
    store.del('collection'); store.del('relCache'); relCache = {};
    records = []; shown = [];
    toast('Caché vaciada');
    updateCacheInfo();
    loadCollection();
  },
  logout: () => {
    if (!confirm('¿Borrar credenciales y datos guardados?')) return;
    ['cfg', 'collection', 'relCache', 'queue'].forEach(store.del);
    cfg = { ...DEFAULT_CFG }; records = []; shown = []; queue = [];
    fillForm(); renderGrid(); updateCount();
    toast('Credenciales borradas');
  }
};

function initEvents() {
  document.addEventListener('click', e => {
    const page = e.target.closest('[data-page]');
    if (page) return goPage(page.dataset.page);
    const act = e.target.closest('[data-act]');
    if (act) return ACTIONS[act.dataset.act]?.();
    const card = e.target.closest('.vcard');
    if (card) return openRelease(card.dataset.k);
  });

  let searchTimer;
  $('#srchInput').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 120);
  });
  $('#sortSel').addEventListener('change', () => { store.set('sort', $('#sortSel').value); applyFilters(); });

  // Si el usuario nunca eligió tema, seguimos al sistema.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!store.get('theme')) setTheme(e.matches, false);
  });

  const netStatus = () => {
    document.body.classList.toggle('is-offline', !navigator.onLine);
    if (navigator.onLine) flushQueue();
  };
  addEventListener('online', netStatus);
  addEventListener('offline', netStatus);
  netStatus();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') flushQueue();
  });
}

/* ==================== arranque ==================== */
function init() {
  setTheme(isDark, false);
  $('#sortSel').value = store.get('sort', 'artist');
  fillForm();
  renderHist();
  initSheet();
  initEvents();

  // Migración: versiones viejas guardaban la contraseña en localStorage.
  const legacy = store.get('cfg', {});
  if (legacy.lPass) {
    $('#lPass').value = legacy.lPass;
    delete cfg.lPass;
    saveCfg();
    if (!cfg.lSK) ensureSession().finally(() => { $('#lPass').value = ''; });
  }

  // Pinta la copia guardada al instante y refresca en segundo plano si está vieja.
  const cached = store.get('collection');
  if (cached?.items?.length) {
    records = cached.items.map(withIndex);
    applyFilters();
    if (Date.now() - cached.ts > COLLECTION_TTL) loadCollection({ silent: true });
  } else if (cfg.dUser && cfg.dToken) {
    loadCollection();
  } else {
    renderGrid();
  }

  flushQueue();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
}

init();
})();
