/* ═══════════════════════════════
   TRAFWE — script.js
═══════════════════════════════ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

// ── NAV ─────────────────────────────────────────────────
const headerEl  = $('header');
const burger    = $('#burger');
const mobileNav = $('#mobile-nav');

window.addEventListener('scroll', () => {
  headerEl.classList.toggle('scrolled', window.scrollY > 60);
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

// ── REVEAL ON SCROLL ────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

$$('.reveal').forEach(el => revealObserver.observe(el));

// ── LOADER: ocultar tras carga ───────────────────────────
const loader = $('#loader');
function hideLoader() {
  if (loader) loader.classList.add('hidden');
}
window.addEventListener('load', () => {
  // Si no hay lógica de frames que lo oculte, lo cerramos en load
  setTimeout(hideLoader, 400);
});

// ── VIDEO SCROLL — currentTime ───────────────────────────
(() => {
  const section = $('#video-scroll');
  const video   = $('#scroll-video');
  const hint    = $('#vscroll-hint');
  const captions = $$('.vcap', section);

  if (!section || !video) return;

  let duration    = 0;
  let sectionTop  = 0;
  let scrollRange = 0;
  let rafPending  = false;
  let targetTime  = 0;
  let currentTime = 0;

  // Esperar a que el video tenga metadata (duration)
  function init() {
    duration = video.duration;
    if (!duration || isNaN(duration)) return;

    updateMetrics();
    onScroll(); // set initial state

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { updateMetrics(); onScroll(); }, { passive: true });

    // Ocultar loader una vez que el video está listo
    hideLoader();
  }

  video.addEventListener('loadedmetadata', init);
  video.addEventListener('canplay', () => {
    if (!duration) init();
  });

  // Fallback: si ya está cargado
  if (video.readyState >= 1 && video.duration) {
    init();
  }

  function updateMetrics() {
    sectionTop  = section.offsetTop;
    scrollRange = section.offsetHeight - window.innerHeight;
  }

  function onScroll() {
    if (!duration) return;

    const scrolled = window.scrollY - sectionTop;
    const progress = Math.max(0, Math.min(1, scrolled / scrollRange));

    targetTime = progress * duration;

    // Ocultar hint al primer scroll real
    if (scrolled > 30 && hint) hint.classList.add('gone');

    // Actualizar captions
    captions.forEach(cap => {
      const from = parseFloat(cap.dataset.from);
      const to   = parseFloat(cap.dataset.to);
      cap.classList.toggle('active', progress >= from && progress < to);
    });

    // Programar el seek via RAF para no bloquear
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(seekVideo);
    }
  }

  function seekVideo() {
    rafPending = false;

    // Solo hacer seek si hay diferencia significativa (evita thrashing)
    if (Math.abs(video.currentTime - targetTime) > 0.016) {
      video.currentTime = targetTime;
    }
  }
})();
