(function (globalScope) {
  'use strict';

  const PASSWORD = '260921';
  const START_TIME_ISO = '2026-09-21T01:25:00+08:00';
  const LOADING_DURATION_MS = 3600;
  const FRAME_INTERVAL_MS = 300;

  const ERROR_MESSAGES = [
    '好像不太对哦。',
    '你应该不是“我叫有理控”吧。',
    '别再乱猜啦，这地方不是给路人开的。',
  ];

  const FEATURE_TITLES = {
    fortune: '今日签正在开发中',
    emergency: '应急按钮正在开发中',
    capsule: '时间胶囊正在开发中',
  };

  function getErrorMessage(attempt) {
    const index = Math.min(Math.max(Number(attempt) || 1, 1), ERROR_MESSAGES.length) - 1;
    return ERROR_MESSAGES[index];
  }

  function getFeatureTitle(featureId) {
    return FEATURE_TITLES[featureId] || '该功能正在开发中';
  }

  function splitElapsedTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  }

  const FRAME_PATHS = [
    './assets/P2_CH_loading_f01.png',
    './assets/P2_CH_loading_f02.png',
    './assets/P2_CH_loading_f03.png',
    './assets/P2_CH_loading_f04.png',
  ];

  const PRELOAD_PATHS = [
    ...FRAME_PATHS,
    './assets/P3_BG_main_scene.webp',
    './assets/P3_CH_bench_duo.png',
    './assets/P4_BG_dev_scene.webp',
    './assets/P4_CH_yishuo_builder.png',
  ];

  const LOADING_MESSAGES = [
    { timeMs: 0, text: '正在确认身份……' },
    { timeMs: 900, text: '找到我们第一次见面的那一天……' },
    { timeMs: 1800, text: '正在整理一些乱七八糟的回忆……' },
    { timeMs: 2900, text: '欢迎回来。' },
  ];

  function getLoadingMessage(elapsedMs) {
    let current = LOADING_MESSAGES[0].text;
    for (const item of LOADING_MESSAGES) {
      if (elapsedMs >= item.timeMs) current = item.text;
    }
    return current;
  }

  function preloadAssets() {
    if (typeof Image === 'undefined') return;
    PRELOAD_PATHS.forEach((source) => {
      const image = new Image();
      image.src = source;
    });
  }

  function initBrowserApp(doc) {
    const views = [...doc.querySelectorAll('.view')];
    const passwordForm = doc.querySelector('#password-form');
    const passwordCard = doc.querySelector('.password-card');
    const passwordInput = doc.querySelector('#password-input');
    const enterButton = doc.querySelector('#enter-button');
    const feedback = doc.querySelector('#password-feedback');
    const loadingCharacter = doc.querySelector('#loading-character');
    const loadingMessage = doc.querySelector('#loading-message');
    const progressBar = doc.querySelector('.progress-track');
    const progressFill = doc.querySelector('#loading-progress');
    const progressPercent = doc.querySelector('#loading-percent');
    const featureButtons = [...doc.querySelectorAll('[data-feature]')];
    const devTitle = doc.querySelector('#dev-title');
    const backButton = doc.querySelector('#back-button');
    const startTime = new Date(START_TIME_ISO).getTime();
    let wrongAttempts = 0;
    let activeViewId = 'view-password';
    let clockTimer = null;

    function showView(nextId) {
      activeViewId = nextId;
      for (const view of views) {
        const isActive = view.id === nextId;
        view.hidden = !isActive;
        view.classList.toggle('is-active', isActive);
        view.setAttribute('aria-hidden', String(!isActive));
      }
    }

    function updateClock() {
      const elapsed = splitElapsedTime(Date.now() - startTime);
      doc.querySelector('#days').textContent = String(elapsed.days);
      doc.querySelector('#hours').textContent = String(elapsed.hours).padStart(2, '0');
      doc.querySelector('#minutes').textContent = String(elapsed.minutes).padStart(2, '0');
      doc.querySelector('#seconds').textContent = String(elapsed.seconds).padStart(2, '0');
    }

    function startClock() {
      updateClock();
      if (clockTimer === null) clockTimer = globalScope.setInterval(updateClock, 1000);
    }

    function startLoading() {
      showView('view-loading');
      const startedAt = globalScope.performance.now();
      let lastFrameIndex = -1;
      let lastMessage = '';

      function renderLoadingFrame(now) {
        const elapsed = Math.min(now - startedAt, LOADING_DURATION_MS);
        const frameIndex = Math.floor(elapsed / FRAME_INTERVAL_MS) % FRAME_PATHS.length;
        const message = getLoadingMessage(elapsed);
        const progress = elapsed / LOADING_DURATION_MS;
        const roundedProgress = Math.min(100, Math.round(progress * 100));

        if (frameIndex !== lastFrameIndex) {
          loadingCharacter.src = FRAME_PATHS[frameIndex];
          lastFrameIndex = frameIndex;
        }
        if (message !== lastMessage) {
          loadingMessage.textContent = message;
          lastMessage = message;
        }
        progressFill.style.transform = `scaleX(${progress})`;
        progressBar.setAttribute('aria-valuenow', String(roundedProgress));
        progressPercent.textContent = `${roundedProgress}%`;

        if (elapsed < LOADING_DURATION_MS) {
          globalScope.requestAnimationFrame(renderLoadingFrame);
        } else {
          showView('view-main');
          startClock();
        }
      }

      globalScope.requestAnimationFrame(renderLoadingFrame);
    }

    passwordForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (passwordInput.value === PASSWORD) {
        enterButton.disabled = true;
        enterButton.textContent = '已确认';
        feedback.textContent = '\u00a0';
        passwordCard.classList.add('is-leaving');
        globalScope.setTimeout(startLoading, 500);
        return;
      }

      wrongAttempts += 1;
      feedback.textContent = getErrorMessage(wrongAttempts);
      passwordInput.classList.remove('is-shaking');
      void passwordInput.offsetWidth;
      passwordInput.classList.add('is-shaking');
      passwordInput.select();
    });

    passwordInput.addEventListener('animationend', () => {
      passwordInput.classList.remove('is-shaking');
    });

    for (const button of featureButtons) {
      button.addEventListener('click', () => {
        const feature = button.dataset.feature;
        button.classList.add('is-swinging');
        globalScope.setTimeout(() => {
          devTitle.textContent = getFeatureTitle(feature);
          button.classList.remove('is-swinging');
          showView('view-dev');
          backButton.focus({ preventScroll: true });
        }, 330);
      });
    }

    backButton.addEventListener('click', () => {
      showView('view-main');
      const returnTarget = featureButtons.find((button) => button.dataset.feature);
      if (returnTarget) returnTarget.focus({ preventScroll: true });
    });

    doc.addEventListener('visibilitychange', () => {
      if (!doc.hidden && activeViewId === 'view-main') updateClock();
    });

    preloadAssets();
    passwordInput.focus({ preventScroll: true });
  }

  const api = {
    PASSWORD,
    START_TIME_ISO,
    LOADING_DURATION_MS,
    FRAME_INTERVAL_MS,
    getErrorMessage,
    getFeatureTitle,
    splitElapsedTime,
    getLoadingMessage,
    initBrowserApp,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  globalScope.YishuoApp = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => initBrowserApp(document), { once: true });
    } else {
      initBrowserApp(document);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
