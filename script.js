/* ═══════════════════════════════
   TRAFWE — script.js
═══════════════════════════════ */

'use strict';

// ── Helpers ─────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── NAV ─────────────────────────
const header  = $('header');
const burger  = $('#burger');
const mobileNav = $('#mobile-nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
  // hide hero scroll hint
  const hint = $('#hero-scroll-hint');
  if (hint && window.scrollY > 80) hint.classList.add('gone');
}, { passive: true });

burger?.addEventListener('click', () => {
  burger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

$$('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    burger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── REVEAL ON SCROLL ────────────
const revealEls = $$('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ── VIDEO SCROLL ─────────────────
(() => {
  const section = $('#video-scroll');
  if (!section) return;

  const FRAMES_DIR  = './assets/frames/';
  const TOTAL       = parseInt(section.dataset.total || '0', 10);
  const NATIVE_W    = parseInt(section.dataset.w || '1080', 10);
  const NATIVE_H    = parseInt(section.dataset.h || '1920', 10);

  const canvas  = section.querySelector('canvas');
  const ctx     = canvas?.getContext('2d', { alpha: false });
  const fill    = $('#loader-fill');
  const pct     = $('#loader-pct');
  const loader  = $('#loader');
  const hint    = $('.vscroll-hint', section);
  const captions = $$('.vcap', section);

  if (!canvas || !ctx || TOTAL === 0) {
    // no frames — show video fallback, hide loader
    section.classList.add('frames-failed');
    loader?.classList.add('hidden');
    return;
  }

  // canvas sizing
  let dpr, vpW, vpH;
  function sizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    vpW = rect.width; vpH = rect.height;
    canvas.style.width  = vpW + 'px';
    canvas.style.height = vpH + 'px';
    canvas.width  = Math.round(vpW * dpr);
    canvas.height = Math.round(vpH * dpr);
    ctx.scale(dpr, dpr);
  }
  sizeCanvas();

  function drawCover(img) {
    if (!img?.naturalWidth) return;
    const ia = NATIVE_W / NATIVE_H;
    const ca = vpW / vpH;
    let sx, sy, sw, sh;
    if (ca > ia) {
      sw = NATIVE_W; sh = NATIVE_W / ca;
      sx = 0; sy = (NATIVE_H - sh) / 2;
    } else {
      sh = NATIVE_H; sw = NATIVE_H * ca;
      sy = 0; sx = (NATIVE_W - sw) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, vpW, vpH);
  }

  const pad = n => String(n).padStart(4, '0');
  const frames = new Array(TOTAL);
  let loaded = 0;

  function preload() {
    return new Promise(resolve => {
      for (let i = 0; i < TOTAL; i++) {
        const img = new Image();
        img.onload = img.onerror = () => {
          loaded++;
          const p = Math.round((loaded / TOTAL) * 100);
          if (fill) fill.style.width = p + '%';
          if (pct)  pct.textContent  = p + '%';
          if (loaded === TOTAL) resolve();
        };
        img.src = FRAMES_DIR + 'frame_' + pad(i + 1) + '.jpg';
        frames[i] = img;
      }
    });
  }

  let sectionTop = 0, scrollRange = 0;
  function updateMetrics() {
    sectionTop  = section.offsetTop;
    scrollRange = section.offsetHeight - window.innerHeight;
  }

  let curIdx = -1;
  function draw(idx) {
    if (idx === curIdx) return;
    curIdx = idx;
    drawCover(frames[idx]);
    // captions
    const progress = idx / (TOTAL - 1);
    captions.forEach((cap, i) => {
      const start = i / captions.length;
      const end   = (i + 1) / captions.length;
      cap.classList.toggle('active', progress >= start && progress < end);
    });
  }

  let rafPending = false, nextIdx = 0;
  function onScroll() {
    const scrolled = window.scrollY - sectionTop;
    const progress = Math.max(0, Math.min(1, scrolled / scrollRange));
    nextIdx = Math.min(TOTAL - 1, Math.floor(progress * TOTAL));
    if (scrolled > 30 && hint) hint.classList.add('gone');
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => { draw(nextIdx); rafPending = false; });
    }
  }

  window.addEventListener('resize', () => {
    sizeCanvas(); updateMetrics();
    const saved = curIdx < 0 ? 0 : curIdx;
    curIdx = -1; draw(saved);
  }, { passive: true });

  preload().then(() => {
    updateMetrics(); curIdx = -1; draw(0);
    loader?.classList.add('hidden');
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();

// ── Loader fallback (si no hay frames, ocultar loader de todas formas) ──
window.addEventListener('load', () => {
  const loader = $('#loader');
  // Si después de cargar la página el loader sigue, lo ocultamos
  setTimeout(() => {
    if (loader && !loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
    }
  }, 3000);
});
