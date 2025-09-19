(function () {
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NAV_SELECTOR = '[data-nav-expand]';

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  const parseTimeValue = (value) => {
    if (!value && value !== 0) {
      return null;
    }

    const str = String(value).trim();
    if (!str) {
      return null;
    }

    if (/ms$/i.test(str)) {
      const amount = Number.parseFloat(str.replace(/ms$/i, ''));
      return Number.isFinite(amount) ? amount : null;
    }

    if (/s$/i.test(str)) {
      const amount = Number.parseFloat(str.replace(/s$/i, ''));
      return Number.isFinite(amount) ? amount * 1000 : null;
    }

    const amount = Number.parseFloat(str);
    return Number.isFinite(amount) ? amount : null;
  };

  const formatMs = (value) => {
    const parsed = parseTimeValue(value);
    return parsed == null ? null : `${parsed}ms`;
  };

  const activateNav = (element) => {
    element.classList.add('in');
    element.classList.remove('is-animating');
  };

  const init = () => {
    const navs = Array.from(document.querySelectorAll(NAV_SELECTOR));
    if (!navs.length) {
      return;
    }

    navs.forEach((nav, index) => {
      const delayAttr = nav.getAttribute('data-nav-delay');
      const durationAttr = nav.getAttribute('data-nav-duration');
      const introDelayAttr = nav.getAttribute('data-nav-intro-delay');

      const delayValue = formatMs(delayAttr);
      if (delayValue !== null) {
        nav.style.setProperty('--delay', delayValue);
      }

      const durationValue = formatMs(durationAttr);
      if (durationValue !== null) {
        nav.style.setProperty('--dur', durationValue);
      }

      if (PREFERS_REDUCED) {
        activateNav(nav);
        return;
      }

      const introDelay = parseTimeValue(introDelayAttr);
      const startDelay = Number.isFinite(introDelay) ? introDelay : 0;
      const show = () => activateNav(nav);

      if (startDelay > 0) {
        window.setTimeout(show, startDelay);
        return;
      }

      if (index === 0) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(show);
        });
      } else {
        window.requestAnimationFrame(show);
      }
    });
  };

  onReady(init);
})();
