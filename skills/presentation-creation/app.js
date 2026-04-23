/*
 * Bundled with the `presentation-creation` skill.
 *
 * Derived from presentation/app.js — same state machine, same transitions,
 * same hash routing. The ONLY behavioural change: chapter count, slide
 * counts, and the chapters lookup are discovered from the DOM at init time
 * instead of being hardcoded. This lets the same script power decks with
 * any chapter count from 1 to N.
 *
 * Discovery contract:
 *   - Chapters are <div id="chapter-N" class="chapter"> for N = 1..K (contiguous).
 *   - Each chapter contains zero-or-more <section class="slide">.
 *   - Landing is <div id="landing">, final is <div id="final-slide">.
 *   - Part cards on the landing carry data-part="N" matching their chapter.
 */
(function () {
  'use strict';

  const State = { LANDING: 'LANDING', IN_CHAPTER: 'IN_CHAPTER', FINAL: 'FINAL' };

  const app = {
    state: State.LANDING, activePart: null,
    slideIndices: {},
    subSteps: {},
    transitioning: false, kbHelpVisible: false,
    reducedMotion: false, devMode: false,
  };

  let slideCounts = {};
  let chapterCount = 0;
  let landing, chapters, slides, wipeShape, kbHelp, progressBar, finalSlide;

  function init() {
    app.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    app.devMode = new URLSearchParams(window.location.search).has('dev');
    if (app.devMode) document.body.classList.add('dev-mode');

    landing = document.getElementById('landing');
    finalSlide = document.getElementById('final-slide');
    wipeShape = document.querySelector('.wipe-shape');
    kbHelp = document.querySelector('.kb-help');
    progressBar = document.querySelector('.progress-bar');

    // Discover chapters in id-numeric order. We intentionally walk
    // chapter-1, chapter-2, ... until we miss one — gaps would make
    // keyboard part-jump (1/2/3) break in confusing ways.
    chapters = {};
    slides = {};
    for (let n = 1; ; n++) {
      const el = document.getElementById('chapter-' + n);
      if (!el) break;
      chapters[n] = el;
      slides[n] = Array.from(el.querySelectorAll('.slide'));
      slideCounts[n] = slides[n].length;
      app.slideIndices[n] = 0;
    }
    chapterCount = Object.keys(chapters).length;

    setupKeyboard();
    setupPartCards();
    setupTocTiles();
    setupCodeTabs();
    setupIdeMockTabs();
    setupCavemanSpeedButton();
    setupDemoPromptCopy();
    parseHash();
    if (app.state === State.LANDING) showLanding();
  }

  function updateHash() {
    let h = '#/landing';
    if (app.state === State.IN_CHAPTER) h = '#/part-' + app.activePart + '/' + app.slideIndices[app.activePart];
    else if (app.state === State.FINAL) h = '#/final';
    if (window.location.hash !== h) history.replaceState(null, '', h);
  }

  function parseHash() {
    const h = window.location.hash;
    if (!h || h === '#/landing') return;
    if (h === '#/final') { goFinal(); return; }
    const cm = h.match(/^#\/part-(\d+)\/(\d+)$/);
    if (cm) {
      const p = +cm[1], i = +cm[2];
      if (chapters[p] && i < slideCounts[p]) {
        app.activePart = p; app.slideIndices[p] = i;
        showChapter(p);
      }
    }
  }

  function hideAll() {
    if (landing) landing.classList.remove('active');
    Object.values(chapters).forEach(c => c.classList.remove('active'));
    if (finalSlide) finalSlide.classList.remove('active');
  }

  function showLanding() {
    app.state = State.LANDING; app.activePart = null;
    hideAll(); if (landing) landing.classList.add('active');
    syncVideoPlayback(null);
    updateHash(); updateProgress();
  }

  function showChapter(part) {
    app.state = State.IN_CHAPTER; app.activePart = part;
    hideAll(); chapters[part].classList.add('active');
    showSlide(part, app.slideIndices[part]);
    updateHash(); updateProgress();
  }

  function showSlide(part, idx) {
    const sl = slides[part]; if (!sl || idx < 0 || idx >= sl.length) return;
    sl.forEach(s => s.classList.remove('active'));
    sl[idx].classList.add('active');
    app.slideIndices[part] = idx;

    const slide = sl[idx];
    const totalSteps = getSlideSteps(slide);
    if (totalSteps > 1) {
      setSubStep(slide, 0);
    } else {
      clearStepClasses(slide);
    }

    syncVideoPlayback(slide);
    updateHash(); updateProgress();
  }

  function getSlideSteps(slide) {
    const s = slide.getAttribute('data-steps');
    return s ? parseInt(s, 10) : 1;
  }

  function getCurrentSubStep(slide) {
    const key = slide.getAttribute('data-slide');
    return app.subSteps[key] || 0;
  }

  function setSubStep(slide, step) {
    const key = slide.getAttribute('data-slide');
    app.subSteps[key] = step;

    clearStepClasses(slide);
    for (let i = 1; i <= step; i++) {
      slide.classList.add('step-ge-' + i);
    }

    const dots = slide.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === step);
    });
  }

  function clearStepClasses(slide) {
    for (let i = 0; i <= 15; i++) slide.classList.remove('step-ge-' + i);
  }

  // Videos marked with [data-play-on-active] only play while their slide is active.
  // On every navigation we pause-and-reset them everywhere, then start the ones
  // inside the newly active slide from frame 0 (always a fresh loop).
  // playbackRate is also reset to 1 so slide re-entry always starts at normal speed,
  // regardless of whether the x2 button was toggled on a previous visit.
  function syncVideoPlayback(activeSlide) {
    document.querySelectorAll('video[data-play-on-active]').forEach(v => {
      v.pause();
      try { v.currentTime = 0; } catch (_) { /* metadata not yet loaded */ }
      v.playbackRate = 1;
    });
    if (!activeSlide) return;
    activeSlide.querySelectorAll('video[data-play-on-active]').forEach(v => {
      try { v.currentTime = 0; } catch (_) {}
      v.playbackRate = 1;
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => { /* autoplay blocked; user can press play */ });
    });
    const speedBtn = activeSlide.querySelector('[data-caveman-speed]');
    if (speedBtn) {
      speedBtn.classList.remove('is-fast');
      const lbl = speedBtn.querySelector('.caveman-speed-label');
      if (lbl) lbl.textContent = 'x1';
    }
  }

  // x2 toggle for video slides. Generic handler: flips playbackRate on every
  // [data-play-on-active] video inside the button's own slide. Label reflects
  // the CURRENT speed ('x1' at 1x, 'x2' at 2x); .is-fast paints the button
  // yellow when engaged. querySelectorAll is load-bearing — querySelector
  // would only wire up the first button in the DOM and silently drop the rest.
  function setupCavemanSpeedButton() {
    document.querySelectorAll('[data-caveman-speed]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slide = btn.closest('.slide');
        if (!slide) return;
        const videos = slide.querySelectorAll('video[data-play-on-active]');
        if (videos.length === 0) return;
        const currentRate = videos[0].playbackRate || 1;
        const nextRate = Math.abs(currentRate - 2) < 0.01 ? 1 : 2;
        videos.forEach(v => { v.playbackRate = nextRate; });
        const isFast = nextRate === 2;
        btn.classList.toggle('is-fast', isFast);
        const lbl = btn.querySelector('.caveman-speed-label');
        if (lbl) lbl.textContent = isFast ? 'x2' : 'x1';
      });
    });
  }

  // Copy-to-clipboard for the chevron button on demo slides. Grabs the prompt
  // text from the same slide via .demo-prompt-text, copies it as plain text
  // (innerText preserves the <br> as a \n so the layout survives the paste),
  // and flashes a checkmark + green tint for ~1.5s. navigator.clipboard requires
  // a secure context; localhost qualifies.
  function setupDemoPromptCopy() {
    document.querySelectorAll('[data-demo-copy]').forEach(btn => {
      let resetTimer = null;
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const slide = btn.closest('.slide');
        if (!slide) return;
        const textEl = slide.querySelector('.demo-prompt-text');
        if (!textEl) return;
        const text = (textEl.innerText || textEl.textContent || '').trim();
        try {
          await navigator.clipboard.writeText(text);
          btn.classList.add('is-copied');
          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => { btn.classList.remove('is-copied'); resetTimer = null; }, 1500);
        } catch (err) {
          console.warn('Demo prompt copy failed:', err);
        }
      });
    });
  }

  function goFinal() {
    if (app.transitioning) return;
    app.transitioning = true; app.state = State.FINAL; app.activePart = null;
    hideAll(); if (finalSlide) finalSlide.classList.add('active');
    syncVideoPlayback(null);
    updateHash();
    setTimeout(() => { app.transitioning = false; }, 600);
  }

  function doWipe(dir, cb) {
    if (app.reducedMotion) { cb(); return; }
    app.transitioning = true;
    wipeShape.className = 'wipe-shape'; void wipeShape.offsetWidth;
    wipeShape.classList.add(dir === 1 ? 'wiping-forward' : 'wiping-backward');
    setTimeout(() => { cb(); setTimeout(() => { wipeShape.className = 'wipe-shape'; app.transitioning = false; }, 100); }, 160);
  }

  // Theater-curtain transition used when the user presses arrow-right at the
  // end of a chapter that is NOT the last chapter. Twin slabs close from
  // top/bottom, the landing swap happens behind them, then the slabs retract.
  // Total ~880ms.
  function doCurtainsExit(cb) {
    if (app.reducedMotion) { cb(); return; }
    const top = document.querySelector('.chapter-curtain-top');
    const bottom = document.querySelector('.chapter-curtain-bottom');
    if (!top || !bottom) { cb(); return; }
    app.transitioning = true;
    top.classList.add('closing');
    bottom.classList.add('closing');
    setTimeout(() => {
      cb();
      requestAnimationFrame(() => {
        setTimeout(() => {
          top.classList.remove('closing');
          bottom.classList.remove('closing');
          setTimeout(() => { app.transitioning = false; }, 420);
        }, 80);
      });
    }, 380);
  }

  function enterChapter(part) {
    if (app.transitioning) return;
    if (!chapters[part]) return;
    app.transitioning = true;
    app.slideIndices[part] = 0;
    const card = document.querySelector('.part-card[data-part="' + part + '"]');
    if (card && !app.reducedMotion) {
      card.style.transform = 'scale(1.06)'; card.style.zIndex = '20';
      document.querySelectorAll('.part-card').forEach(c => {
        if (c !== card) { c.style.opacity = '0'; c.style.transform = 'translateX(' + (+c.dataset.part < part ? '-60px' : '60px') + ')'; }
      });
      setTimeout(() => {
        showChapter(part);
        card.style.transform = ''; card.style.zIndex = '';
        document.querySelectorAll('.part-card').forEach(c => { c.style.opacity = ''; c.style.transform = ''; });
        app.transitioning = false;
      }, 600);
    } else { showChapter(part); app.transitioning = false; }
  }

  function exitChapter() {
    if (app.transitioning) return;
    app.transitioning = true; hideAll();
    setTimeout(() => { showLanding(); app.transitioning = false; }, app.reducedMotion ? 120 : 350);
  }

  function setupKeyboard() {
    document.addEventListener('keydown', function (e) {
      if (app.transitioning) return;
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); app.kbHelpVisible = !app.kbHelpVisible; kbHelp.classList.toggle('visible', app.kbHelpVisible); return; }
      if (app.kbHelpVisible && e.key === 'Escape') { app.kbHelpVisible = false; kbHelp.classList.remove('visible'); return; }
      if (e.target.closest('.code-tabs')) return;
      switch (app.state) {
        case State.LANDING: keyLanding(e); break;
        case State.IN_CHAPTER: keyChapter(e); break;
        case State.FINAL: keyFinal(e); break;
      }
    });
  }

  function keyLanding(e) {
    // Number keys 1..9 jump straight to that chapter, but only if it exists.
    // Bounded by chapterCount (no upper-bound assumption of 3).
    if (/^[1-9]$/.test(e.key)) {
      const n = +e.key;
      if (n >= 1 && n <= chapterCount) { e.preventDefault(); enterChapter(n); return; }
    }
    if (e.key === 'Enter') { const f = document.activeElement; if (f && f.classList.contains('part-card')) { e.preventDefault(); enterChapter(+f.dataset.part); } }
    else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); cycleFocus(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); cycleFocus(-1); }
  }

  function keyChapter(e) {
    const part = app.activePart, idx = app.slideIndices[part];
    const slide = slides[part][idx];
    const totalSteps = getSlideSteps(slide);
    const currentStep = getCurrentSubStep(slide);

    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (totalSteps > 1 && currentStep < totalSteps - 1) {
        setSubStep(slide, currentStep + 1);
      } else if (idx < slideCounts[part] - 1) {
        doWipe(1, () => showSlide(part, idx + 1));
      } else if (part === chapterCount) {
        // Last slide of last chapter — go to final.
        goFinal();
      } else {
        // Last slide of a non-final chapter — return to landing via curtain.
        doCurtainsExit(() => showLanding());
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (totalSteps > 1 && currentStep > 0) {
        setSubStep(slide, currentStep - 1);
      } else if (idx > 0) {
        doWipe(-1, () => showSlide(part, idx - 1));
      }
    } else if (e.key === 'Escape') { e.preventDefault(); exitChapter(); }
    else if (e.key === 'Home') { e.preventDefault(); doWipe(-1, () => showSlide(part, 0)); }
  }

  function keyFinal(e) {
    if (e.key === 'Escape' || e.key === 'ArrowLeft') { e.preventDefault(); hideAll(); showLanding(); }
  }

  function cycleFocus(dir) {
    const cards = Array.from(document.querySelectorAll('.part-card'));
    if (cards.length === 0) return;
    const idx = cards.indexOf(document.activeElement);
    cards[(idx + dir + cards.length) % cards.length].focus();
  }

  function setupPartCards() {
    document.querySelectorAll('.part-card').forEach(c => c.addEventListener('click', () => enterChapter(+c.dataset.part)));
  }

  function setupTocTiles() {
    document.querySelectorAll('.toc-tile[data-target], .cmd-card[data-target]').forEach(tile => {
      tile.addEventListener('click', function () {
        const idx = +this.dataset.target;
        if (app.state === State.IN_CHAPTER && !isNaN(idx)) {
          doWipe(1, () => showSlide(app.activePart, idx));
        }
      });
    });
  }

  function setupCodeTabs() {
    document.querySelectorAll('.code-container').forEach(container => {
      const tabs = container.querySelectorAll('.code-tab'), panels = container.querySelectorAll('.code-panel'), indicator = container.querySelector('.code-tab-indicator');
      if (tabs.length < 2) { const strip = container.querySelector('.code-tabs'); if (strip) strip.style.display = 'none'; return; }
      function activate(i) {
        tabs.forEach((t, j) => t.classList.toggle('active', j === i));
        panels.forEach((p, j) => p.classList.toggle('active', j === i));
        if (indicator) { indicator.style.width = tabs[i].offsetWidth + 'px'; indicator.style.transform = 'translateX(' + tabs[i].offsetLeft + 'px)'; }
      }
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => activate(i));
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); activate((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); activate((i - 1 + tabs.length) % tabs.length); tabs[(i - 1 + tabs.length) % tabs.length].focus(); }
        });
      });
      activate(0);
    });
  }

  // Simpler tabbed ide-mock (Playwright vs charlotte etc). Reuses .ide-tab styling.
  function setupIdeMockTabs() {
    document.querySelectorAll('.ide-mock-tabbed').forEach(mock => {
      const tabs = mock.querySelectorAll('.ide-tab');
      const panels = mock.querySelectorAll('.ide-editor-tab');
      if (tabs.length < 2 || panels.length !== tabs.length) return;
      function activate(i) {
        tabs.forEach((t, j) => t.classList.toggle('active', j === i));
        panels.forEach((p, j) => p.classList.toggle('active', j === i));
      }
      tabs.forEach((tab, i) => {
        tab.tabIndex = 0;
        tab.addEventListener('click', (e) => { e.stopPropagation(); activate(i); });
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); const n = (i + 1) % tabs.length; activate(n); tabs[n].focus(); }
          else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); const n = (i - 1 + tabs.length) % tabs.length; activate(n); tabs[n].focus(); }
          else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); activate(i); }
        });
      });
      activate(0);
    });
  }

  function updateProgress() {
    if (!progressBar) return;
    if (app.state === State.LANDING) { progressBar.style.width = '0%'; return; }
    if (app.state === State.FINAL) { progressBar.style.width = '100%'; return; }
    const total = slideCounts[app.activePart], current = app.slideIndices[app.activePart];
    progressBar.style.width = (total > 1 ? (current / (total - 1)) * 100 : 0) + '%';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
