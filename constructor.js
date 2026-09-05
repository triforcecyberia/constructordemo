/* ═══════════════════════════════════════
   КОНСТРУКТОР ТЕМЫ — логика
   Меняет CSS-переменные на :root в реальном времени.
   Настройки сохраняются в localStorage конкретного браузера,
   чтобы посетитель мог освежить страницу и не потерять свой выбор.
   ═══════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE_KEY = 'demo_theme_ctor_v1';
  var HINT_SEEN_KEY = 'demo_ctor_hint_seen';

  /* ── пресеты цветовой палитры ── */
  var PRESETS = [
    { id: 'gold',    name: 'Золото',      black:'#080808', dark:'#101010', card:'#141414', card2:'#1a1a1a', border:'rgba(255,255,255,0.07)', gold:'#FFC812', gold2:'#e8c96a', white:'#f0f0eb', gray:'#777777', lgray:'#aaaaaa' },
    { id: 'emerald', name: 'Изумруд',     black:'#07100d', dark:'#0d1713', card:'#101d18', card2:'#15251f', border:'rgba(255,255,255,0.07)', gold:'#34D399', gold2:'#6ee7b7', white:'#eef7f2', gray:'#7a8c85', lgray:'#a9bdb4' },
    { id: 'crimson', name: 'Багрянец',    black:'#0c0808', dark:'#151010', card:'#1a1313', card2:'#211818', border:'rgba(255,255,255,0.07)', gold:'#e6465e', gold2:'#f2818f', white:'#f3ecec', gray:'#8a7676', lgray:'#c2a7a7' },
    { id: 'ice',     name: 'Лёд',         black:'#06090d', dark:'#0d1420', card:'#101a29', card2:'#152235', border:'rgba(255,255,255,0.08)', gold:'#38BDF8', gold2:'#7dd3fc', white:'#eef4fb', gray:'#748296', lgray:'#a6b6cc' },
    { id: 'copper',  name: 'Медь',        black:'#0a0806', dark:'#14100c', card:'#1a1410', card2:'#221a14', border:'rgba(255,255,255,0.07)', gold:'#E0A96D', gold2:'#eec293', white:'#f4efe8', gray:'#8a7c6c', lgray:'#c2b09a' },
    { id: 'daylight',name: 'Дневной',     black:'#f5f2ec', dark:'#eee9df', card:'#ffffff', card2:'#f6f3ec', border:'rgba(20,20,20,0.12)', gold:'#B8860B', gold2:'#c99a2e', white:'#181614', gray:'#847c6f', lgray:'#5a544a' }
  ];

  var FONT_PAIRS = [
    { id: 'classic', name: 'Классика', display: "'Unbounded', sans-serif", body: "'Manrope', sans-serif", sample: 'Aa' },
    { id: 'modern',  name: 'Модерн',   display: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", sample: 'Aa' },
    { id: 'lux',     name: 'Люкс',     display: "'Playfair Display', serif", body: "'Jost', sans-serif", sample: 'Aa' }
  ];

  var BTN_SHAPES = [
    { id: 'auto',   name: 'Как есть', value: null },
    { id: 'sharp',  name: 'Острые',   value: '2px' },
    { id: 'pill',   name: 'Пилюли',   value: '100px' }
  ];

  var DEFAULT_STATE = {
    preset: 'gold',
    customAccent: null,
    font: 'classic',
    btnShape: 'auto',
    radius: 1,
    space: 1,
    speed: 1
  };

  var root = document.documentElement;
  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE);
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  /* ── вспомогательное: осветлить hex-цвет для hover-состояния ── */
  function lighten(hex, amt) {
    var c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(function (x) { return x + x; }).join('');
    var num = parseInt(c, 16);
    var r = Math.min(255, (num >> 16) + amt);
    var g = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    var b = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
  }

  function applyPalette(preset, customAccent) {
    root.style.setProperty('--black', preset.black);
    root.style.setProperty('--dark', preset.dark);
    root.style.setProperty('--card', preset.card);
    root.style.setProperty('--card2', preset.card2);
    root.style.setProperty('--border', preset.border);
    root.style.setProperty('--white', preset.white);
    root.style.setProperty('--gray', preset.gray);
    root.style.setProperty('--lgray', preset.lgray);
    var accent = customAccent || preset.gold;
    var accent2 = customAccent ? lighten(customAccent, 40) : preset.gold2;
    root.style.setProperty('--gold', accent);
    root.style.setProperty('--gold2', accent2);
    root.style.setProperty('--ctor-accent', accent);
  }

  function applyFont(id) {
    var f = FONT_PAIRS.find(function (x) { return x.id === id; }) || FONT_PAIRS[0];
    root.style.setProperty('--font-display', f.display);
    root.style.setProperty('--font-body', f.body);
  }

  function applyBtnShape(id) {
    var shape = BTN_SHAPES.find(function (x) { return x.id === id; }) || BTN_SHAPES[0];
    if (shape.value) root.style.setProperty('--btn-radius-override', shape.value);
    else root.style.removeProperty('--btn-radius-override');
  }

  function applyAll() {
    var preset = PRESETS.find(function (p) { return p.id === state.preset; }) || PRESETS[0];
    applyPalette(preset, state.customAccent);
    applyFont(state.font);
    applyBtnShape(state.btnShape);
    root.style.setProperty('--radius-mult', state.radius);
    root.style.setProperty('--space-mult', state.space);
    root.style.setProperty('--dur-mult', Math.max(state.speed, 0.05));
  }

  /* ══════════════════ UI ══════════════════ */

  function buildUI() {
    var wrap = document.createElement('div');
    wrap.id = 'ctor-root';
    wrap.innerHTML =
      '<div class="ctor-badge" id="ctorBadge">Демо-шаблон</div>' +
      '<div class="ctor-hint" id="ctorHint"><button class="ctor-hint-close" id="ctorHintClose" aria-label="Закрыть">×</button>' +
        '<b>Это шаблон-конструктор.</b> Понажимайте на цвета, шрифты и ползунки — так вы увидите, что можно сделать под ваш бренд.</div>' +
      '<button class="ctor-fab" id="ctorFab" aria-label="Открыть конструктор темы"><span class="ctor-fab-ring"></span>' +
        '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-.9.7-1.5 1.5-1.5H16a4 4 0 0 0 4-4c0-4.4-3.6-8-8-8Z" stroke="currentColor" stroke-width="1.6"/><circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/><circle cx="11" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="8.5" r="1.2" fill="currentColor"/></svg></button>' +
      '<div class="ctor-scrim" id="ctorScrim"></div>' +
      '<aside class="ctor-panel" id="ctorPanel" aria-hidden="true">' +
        '<div class="ctor-panel-head">' +
          '<div><h2>Конструктор темы</h2><p>Это не готовый сайт под копирку — двигайте настройки и оцените, что я могу сделать под ваш бренд. Все тексты и фото здесь демонстрационные.</p></div>' +
          '<button class="ctor-panel-close" id="ctorClose" aria-label="Закрыть">×</button>' +
        '</div>' +
        '<div class="ctor-panel-body">' +

          '<div class="ctor-group">' +
            '<div class="ctor-group-title">Цветовая палитра</div>' +
            '<div class="ctor-swatches" id="ctorSwatches"></div>' +
            '<div class="ctor-custom-row">' +
              '<label for="ctorAccent">Свой акцентный цвет</label>' +
              '<input type="color" id="ctorAccent" class="ctor-color-input" value="#FFC812">' +
            '</div>' +
          '</div>' +

          '<div class="ctor-group">' +
            '<div class="ctor-group-title">Типографика</div>' +
            '<div class="ctor-fonts" id="ctorFonts"></div>' +
          '</div>' +

          '<div class="ctor-group">' +
            '<div class="ctor-group-title">Форма кнопок</div>' +
            '<div class="ctor-seg" id="ctorBtnShape"></div>' +
          '</div>' +

          '<div class="ctor-group">' +
            '<div class="ctor-group-title">Геометрия и ритм</div>' +
            '<div class="ctor-slider-row">' +
              '<div class="ctor-slider-label"><span>Скругления углов</span><span id="ctorRadiusVal"></span></div>' +
              '<input type="range" class="ctor-slider" id="ctorRadius" min="0" max="2" step="0.1">' +
              '<div class="ctor-slider-ticks"><span>Острые</span><span>Круглые</span></div>' +
            '</div>' +
            '<div class="ctor-slider-row">' +
              '<div class="ctor-slider-label"><span>Плотность секций</span><span id="ctorSpaceVal"></span></div>' +
              '<input type="range" class="ctor-slider" id="ctorSpace" min="0.7" max="1.4" step="0.05">' +
              '<div class="ctor-slider-ticks"><span>Компактно</span><span>Просторно</span></div>' +
            '</div>' +
            '<div class="ctor-slider-row">' +
              '<div class="ctor-slider-label"><span>Скорость анимаций</span><span id="ctorSpeedVal"></span></div>' +
              '<input type="range" class="ctor-slider" id="ctorSpeed" min="0" max="2" step="0.1">' +
              '<div class="ctor-slider-ticks"><span>Выкл</span><span>Плавно</span></div>' +
            '</div>' +
          '</div>' +

        '</div>' +
        '<div class="ctor-panel-foot">' +
          '<button class="ctor-reset" id="ctorReset">Сбросить настройки</button>' +
          '<a class="ctor-cta" href="#contacts" id="ctorCta">Хочу такой сайт себе →</a>' +
        '</div>' +
      '</aside>';
    document.body.appendChild(wrap);
  }

  function renderSwatches() {
    var box = document.getElementById('ctorSwatches');
    box.innerHTML = PRESETS.map(function (p) {
      return '<button type="button" class="ctor-swatch" data-preset="' + p.id + '">' +
        '<span class="ctor-swatch-dot" style="background:' + p.gold + '"></span><span>' + p.name + '</span></button>';
    }).join('');
  }

  function renderFonts() {
    var box = document.getElementById('ctorFonts');
    box.innerHTML = FONT_PAIRS.map(function (f) {
      return '<button type="button" class="ctor-font-chip" data-font="' + f.id + '" style="font-family:' + f.display + '">' +
        '<span class="ctor-font-name" style="font-family:' + f.body + '">' + f.name + '</span>' +
        '<span class="ctor-font-sample">' + f.sample + '</span></button>';
    }).join('');
  }

  function renderBtnShapes() {
    var box = document.getElementById('ctorBtnShape');
    box.innerHTML = BTN_SHAPES.map(function (s) {
      return '<button type="button" data-shape="' + s.id + '">' + s.name + '</button>';
    }).join('');
  }

  function syncUI() {
    document.querySelectorAll('.ctor-swatch').forEach(function (el) {
      el.classList.toggle('active', el.dataset.preset === state.preset && !state.customAccent);
    });
    document.querySelectorAll('.ctor-font-chip').forEach(function (el) {
      el.classList.toggle('active', el.dataset.font === state.font);
    });
    document.querySelectorAll('#ctorBtnShape button').forEach(function (el) {
      el.classList.toggle('active', el.dataset.shape === state.btnShape);
    });
    document.getElementById('ctorRadius').value = state.radius;
    document.getElementById('ctorSpace').value = state.space;
    document.getElementById('ctorSpeed').value = state.speed;
    document.getElementById('ctorRadiusVal').textContent = state.radius.toFixed(1) + '×';
    document.getElementById('ctorSpaceVal').textContent = Math.round(state.space * 100) + '%';
    document.getElementById('ctorSpeedVal').textContent = state.speed === 0 ? 'выкл' : state.speed.toFixed(1) + '×';
    if (state.customAccent) document.getElementById('ctorAccent').value = state.customAccent;
  }

  function openPanel() {
    document.getElementById('ctorPanel').classList.add('open');
    document.getElementById('ctorPanel').setAttribute('aria-hidden', 'false');
    document.getElementById('ctorScrim').classList.add('open');
    hideHint(true);
  }
  function closePanel() {
    document.getElementById('ctorPanel').classList.remove('open');
    document.getElementById('ctorPanel').setAttribute('aria-hidden', 'true');
    document.getElementById('ctorScrim').classList.remove('open');
  }

  function showHintIfNeeded() {
    if (sessionStorage.getItem(HINT_SEEN_KEY)) return;
    setTimeout(function () {
      document.getElementById('ctorHint').classList.add('show');
    }, 1600);
    setTimeout(hideHint, 9000);
  }
  function hideHint(seen) {
    var hint = document.getElementById('ctorHint');
    if (hint) hint.classList.remove('show');
    if (seen) try { sessionStorage.setItem(HINT_SEEN_KEY, '1'); } catch (e) {}
  }

  function bindEvents() {
    document.getElementById('ctorFab').addEventListener('click', openPanel);
    document.getElementById('ctorClose').addEventListener('click', closePanel);
    document.getElementById('ctorScrim').addEventListener('click', closePanel);
    document.getElementById('ctorHintClose').addEventListener('click', function (e) {
      e.stopPropagation(); hideHint(true);
    });
    document.getElementById('ctorHint').addEventListener('click', function () {
      openPanel();
    });

    document.getElementById('ctorSwatches').addEventListener('click', function (e) {
      var btn = e.target.closest('.ctor-swatch');
      if (!btn) return;
      state.preset = btn.dataset.preset;
      state.customAccent = null;
      applyAll(); syncUI(); saveState();
    });

    document.getElementById('ctorAccent').addEventListener('input', function (e) {
      state.customAccent = e.target.value;
      applyAll(); syncUI(); saveState();
    });

    document.getElementById('ctorFonts').addEventListener('click', function (e) {
      var btn = e.target.closest('.ctor-font-chip');
      if (!btn) return;
      state.font = btn.dataset.font;
      applyAll(); syncUI(); saveState();
    });

    document.getElementById('ctorBtnShape').addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      state.btnShape = btn.dataset.shape;
      applyAll(); syncUI(); saveState();
    });

    document.getElementById('ctorRadius').addEventListener('input', function (e) {
      state.radius = parseFloat(e.target.value);
      applyAll(); syncUI(); saveState();
    });
    document.getElementById('ctorSpace').addEventListener('input', function (e) {
      state.space = parseFloat(e.target.value);
      applyAll(); syncUI(); saveState();
    });
    document.getElementById('ctorSpeed').addEventListener('input', function (e) {
      state.speed = parseFloat(e.target.value);
      applyAll(); syncUI(); saveState();
    });

    document.getElementById('ctorReset').addEventListener('click', function () {
      state = Object.assign({}, DEFAULT_STATE);
      applyAll(); syncUI(); saveState();
    });

    document.getElementById('ctorCta').addEventListener('click', closePanel);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePanel();
    });
  }

  function init() {
    buildUI();
    renderSwatches();
    renderFonts();
    renderBtnShapes();
    bindEvents();
    applyAll();
    syncUI();
    showHintIfNeeded();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
