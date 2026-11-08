// Install-to-home-screen helper for the Ping PWAs.
//
// Chromium fires `beforeinstallprompt` exactly once and throws the event away
// if nobody calls preventDefault() on it. That's why the browser's own install
// banner feels like pure luck. Catching it here, from a plain <script> in
// <head>, runs before the Flutter bootstrap and parks the event on
// `window.pingPwaInstall` so a real button can fire it on demand.
//
// The event does NOT arrive at page load — Chrome only fires it once the
// service worker has registered and taken control, typically a few seconds in.
// The bar below is therefore a small state machine: it is shown immediately so
// the user can act, but a press that lands before the event arrives is
// remembered and replayed the instant it does, rather than being treated as
// "this browser can't install".
//
// The Dart side of this bridge is
// packages/ping_shared/lib/src/core/services/pwa_install_interop_web.dart —
// keep the two in sync. A copy of this file lives in each app's web/ dir.
(function () {
  'use strict';

  var deferredPrompt = null;
  var listeners = [];

  function notify() {
    for (var i = 0; i < listeners.length; i++) {
      try {
        listeners[i]();
      } catch (e) {
        // One bad listener must not stop the others.
      }
    }
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    // Suppresses Chrome's mini-infobar and keeps the event usable later.
    event.preventDefault();
    deferredPrompt = event;
    notify();
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    notify();
  });

  function isInstalled() {
    var modes = [
      'standalone',
      'fullscreen',
      'minimal-ui',
      'window-controls-overlay',
    ];
    if (window.matchMedia) {
      for (var i = 0; i < modes.length; i++) {
        if (window.matchMedia('(display-mode: ' + modes[i] + ')').matches) {
          return true;
        }
      }
    }
    // iOS Safari predates display-mode and reports standalone this way.
    return window.navigator.standalone === true;
  }

  // Which manual "add to home screen" instructions to show when the browser
  // gives us no promptable event (iOS and Safari never do).
  function platformHint() {
    var ua = window.navigator.userAgent || '';
    var isIos =
      /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ claims to be a Mac; the touch points give it away.
      (window.navigator.platform === 'MacIntel' &&
        window.navigator.maxTouchPoints > 1);
    if (isIos) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Firefox\//.test(ua)) return 'firefox';
    if (/Edg\//.test(ua) || /Chrome\//.test(ua) || /Chromium\//.test(ua)) {
      return 'desktopChromium';
    }
    if (/Safari\//.test(ua)) return 'desktopSafari';
    return 'other';
  }

  // Browsers that implement beforeinstallprompt at all. Everything else can
  // only ever be given manual instructions, so there is no point waiting.
  function supportsNativePrompt() {
    if (!('onbeforeinstallprompt' in window)) return false;
    var hint = platformHint();
    return hint === 'android' || hint === 'desktopChromium';
  }

  window.pingPwaInstall = {
    isInstalled: isInstalled,
    canPrompt: function () {
      return deferredPrompt !== null;
    },
    supportsNativePrompt: supportsNativePrompt,
    platformHint: platformHint,
    onChange: function (callback) {
      listeners.push(callback);
    },
    // Resolves to 'accepted', 'dismissed', 'unavailable' or 'needsGesture'.
    prompt: function () {
      var event = deferredPrompt;
      if (event === null) return Promise.resolve('unavailable');
      try {
        return Promise.resolve(event.prompt())
          .then(function () {
            return event.userChoice;
          })
          .then(function (choice) {
            // An event may only be prompted once; it is spent either way.
            deferredPrompt = null;
            notify();
            return choice && choice.outcome === 'accepted'
              ? 'accepted'
              : 'dismissed';
          })
          .catch(function (error) {
            // Chrome rejects prompt() outside a user gesture. The event is not
            // consumed in that case, so keep it — pressing again works.
            if (isGestureError(error)) return 'needsGesture';
            deferredPrompt = null;
            notify();
            return 'dismissed';
          });
      } catch (error) {
        if (isGestureError(error)) return Promise.resolve('needsGesture');
        deferredPrompt = null;
        notify();
        return Promise.resolve('dismissed');
      }
    },
    // Why an install is or isn't on offer. Handy from the devtools console.
    debug: function () {
      var sw = window.navigator.serviceWorker;
      return {
        secureContext: window.isSecureContext,
        origin: window.location.origin,
        hasServiceWorkerApi: !!sw,
        serviceWorkerControlling: !!(sw && sw.controller),
        manifestLinked: !!document.querySelector('link[rel="manifest"]'),
        supportsNativePrompt: supportsNativePrompt(),
        eventCaptured: deferredPrompt !== null,
        isInstalled: isInstalled(),
        platform: platformHint(),
      };
    },
  };

  function isGestureError(error) {
    return !!error && /gesture|activation/i.test(String(error.message || error));
  }

  // ---------------------------------------------------------------------------
  // Install bar
  //
  // Built as plain DOM rather than as a Flutter widget on purpose. The login
  // screen is a Descope HTML web component, i.e. a Flutter platform view, and
  // DOM platform views swallow pointer events from Flutter content painted
  // above them — a Flutter-drawn bar is visible on that screen but clicks fall
  // through to the login form underneath. A real DOM element stacks above
  // everything and always receives its own clicks. It also appears before
  // Flutter has booted.
  // ---------------------------------------------------------------------------

  var DISMISS_KEY = 'ping-pwa-install-dismissed';
  var BAR_ID = 'ping-pwa-install-bar';
  // How long to wait for beforeinstallprompt after the user asks to install
  // before admitting the browser is not going to offer it.
  var PROMPT_WAIT_MS = 15000;
  var he = /^he\b/i.test(window.navigator.language || '');

  function t(hebrew, english) {
    return he ? hebrew : english;
  }

  function manualSteps() {
    switch (platformHint()) {
      case 'ios':
        return t(
          'הקישו על כפתור השיתוף בסרגל הכלים ובחרו "הוספה למסך הבית".',
          'Tap the Share button in the browser toolbar, then choose “Add to Home Screen”.',
        );
      case 'android':
        return t(
          'פתחו את תפריט הדפדפן (⋮) ובחרו "התקנת אפליקציה".',
          'Open the browser menu (⋮) and choose “Install app”.',
        );
      case 'desktopChromium':
        return t(
          'לחצו על סמל ההתקנה בשורת הכתובת, או פתחו את תפריט הדפדפן (⋮) ובחרו "התקנה…".',
          'Click the install icon in the address bar, or open the browser menu (⋮) → “Install…”.',
        );
      case 'desktopSafari':
        return t(
          'פתחו את תפריט File ובחרו "Add to Dock".',
          'Open the File menu and choose “Add to Dock”.',
        );
      default:
        return t(
          'פתחו את תפריט הדפדפן וחפשו "התקנת אפליקציה" או "הוספה למסך הבית".',
          'Open your browser’s menu and look for “Install app” or “Add to Home screen”.',
        );
    }
  }

  function removeBar() {
    var bar = document.getElementById(BAR_ID);
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
  }

  function buildBar() {
    if (document.getElementById(BAR_ID)) return;
    if (isInstalled()) return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) return;
    } catch (e) {
      // Private mode can throw on storage access; showing the bar is fine.
    }

    var bar = document.createElement('div');
    bar.id = BAR_ID;
    bar.setAttribute('dir', 'auto');
    bar.style.cssText = [
      'position:fixed',
      'left:12px',
      'right:12px',
      'bottom:12px',
      'z-index:2147483647',
      'display:flex',
      'align-items:center',
      'gap:10px',
      'flex-wrap:wrap',
      'padding:10px 12px',
      'border-radius:12px',
      'background:#ffffff',
      'color:#0f2b31',
      'box-shadow:0 4px 20px rgba(0,0,0,.22)',
      'font:500 14px/1.35 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    ].join(';');

    var label = document.createElement('span');
    label.style.cssText = 'flex:1 1 160px';
    label.textContent = t(
      'התקינו את האפליקציה במכשיר שלכם',
      'Install this app on your device',
    );

    var install = document.createElement('button');
    install.type = 'button';
    // Don't promise a dialog we can't open. iOS exposes no install API at all,
    // and an insecure origin can't install either — on those the button can
    // only ever explain, so label it that way.
    var canReallyInstall = supportsNativePrompt();
    install.textContent = canReallyInstall
      ? t('התקנה', 'Install')
      : t('איך להתקין', 'How to install');
    install.style.cssText =
      'flex:0 0 auto;border:0;border-radius:8px;padding:9px 16px;' +
      'background:#1B4A54;color:#fff;cursor:pointer;' +
      'font:600 14px system-ui,-apple-system,sans-serif';

    var close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', t('לא עכשיו', 'Not now'));
    close.textContent = '✕';
    close.style.cssText =
      'flex:0 0 auto;border:0;background:transparent;color:inherit;' +
      'font-size:18px;line-height:1;padding:6px 8px;cursor:pointer';

    // Only filled in when the browser gives us no promptable event.
    var steps = document.createElement('div');
    steps.style.cssText =
      'flex:1 1 100%;display:none;font-weight:400;opacity:.85;font-size:13px';

    var waiting = false;
    var waitTimer = null;

    function showSteps() {
      steps.textContent = manualSteps();
      steps.style.display = 'block';
    }

    function resetButton() {
      waiting = false;
      if (waitTimer !== null) {
        window.clearTimeout(waitTimer);
        waitTimer = null;
      }
      install.disabled = false;
      install.style.opacity = '1';
      install.textContent = canReallyInstall
        ? t('התקנה', 'Install')
        : t('איך להתקין', 'How to install');
    }

    function handleOutcome(outcome) {
      if (outcome === 'accepted') {
        removeBar();
        return;
      }
      if (outcome === 'dismissed') {
        // The user saw the real dialog and said no. Nothing more to explain.
        resetButton();
        return;
      }
      if (outcome === 'needsGesture') {
        resetButton();
        steps.textContent = t(
          'הקישו שוב על "התקנה" כדי לאשר.',
          'Press “Install” once more to confirm.',
        );
        steps.style.display = 'block';
        return;
      }
      // 'unavailable' — no event yet.
      if (!supportsNativePrompt()) {
        resetButton();
        showSteps();
        return;
      }
      startWaiting();
    }

    // Chrome fires beforeinstallprompt seconds after load, so a press can land
    // before the event exists. Hold the intent and replay it on arrival
    // instead of pretending the browser cannot install.
    function startWaiting() {
      if (waiting) return;
      waiting = true;
      install.disabled = true;
      install.style.opacity = '.6';
      install.textContent = t('מכינים…', 'Preparing…');
      waitTimer = window.setTimeout(function () {
        resetButton();
        showSteps();
      }, PROMPT_WAIT_MS);
    }

    install.addEventListener('click', function () {
      steps.style.display = 'none';
      window.pingPwaInstall.prompt().then(handleOutcome);
    });

    close.addEventListener('click', function () {
      try {
        window.sessionStorage.setItem(DISMISS_KEY, '1');
      } catch (e) {
        // Not being able to remember the dismissal is not worth failing over.
      }
      removeBar();
    });

    listeners.push(function () {
      if (isInstalled()) {
        removeBar();
        return;
      }
      // The event the user was waiting for just landed.
      if (waiting && deferredPrompt !== null) {
        resetButton();
        window.pingPwaInstall.prompt().then(handleOutcome);
      }
    });

    bar.appendChild(label);
    bar.appendChild(install);
    bar.appendChild(close);
    bar.appendChild(steps);
    document.body.appendChild(bar);
  }

  // Drop the bar the moment the app gets installed.
  listeners.push(function () {
    if (isInstalled()) removeBar();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildBar);
  } else {
    buildBar();
  }
})();
