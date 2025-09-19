(function () {
  const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OBSERVER_MARGIN = '0px 0px -12% 0px';
  const OBSERVER_THRESHOLD = [0, 0.15, 0.35, 0.55, 0.75, 0.95];
  const DATA_REVEAL = 'data-reveal';

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

  const resolveTargets = (element) => {
    const selector = element.getAttribute('data-reveal-targets') || element.getAttribute('data-reveal-target');
    if (selector) {
      return Array.from(element.querySelectorAll(selector));
    }

    if (element.hasAttribute('data-wipe-words')) {
      return Array.from(element.querySelectorAll('.wipe-word'));
    }

    return [element];
  };

  const applyStagger = (element, targets) => {
    const baseDelay = parseTimeValue(element.getAttribute('data-reveal-delay'));
    const step = parseTimeValue(element.getAttribute('data-reveal-step'));

    const lead = formatMs(element.getAttribute('data-reveal-lead'));
    if (lead !== null) {
      element.style.setProperty('--lead', lead);
    }

    const stepValue = formatMs(element.getAttribute('data-reveal-step'));
    if (stepValue !== null) {
      element.style.setProperty('--step', stepValue);
    }

    const durationValue = formatMs(element.getAttribute('data-reveal-duration'));
    if (durationValue !== null) {
      element.style.setProperty('--dur', durationValue);
    }

    targets.forEach((target, index) => {
      if (baseDelay != null || step != null) {
        const delayMs = (baseDelay ?? 0) + (step ?? 0) * index;
        target.style.setProperty('--d', `${delayMs}ms`);
      }
    });
  };

  const revealTargets = (element) => {
    const targets = resolveTargets(element);
    applyStagger(element, targets);

    const extraSelector = element.getAttribute('data-reveal-activate');
    if (extraSelector) {
      document.querySelectorAll(extraSelector).forEach((node) => {
        node.classList.add('in');
      });
    }

    if (element.hasAttribute('data-wipe-words')) {
      element.classList.add('in');
    }

    targets.forEach((target) => {
      target.classList.add('in');
    });
  };

  const init = () => {
    const candidates = Array.from(document.querySelectorAll('.reveal, .reveal-btn, [data-wipe-words], [' + DATA_REVEAL + ']'));
    if (!candidates.length) {
      return;
    }

    if (PREFERS_REDUCED) {
      candidates.forEach((element) => {
        revealTargets(element);
      });
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          const element = entry.target;
          if (element.dataset.revealState === 'in') {
            obs.unobserve(element);
            return;
          }

          element.dataset.revealState = 'in';
          revealTargets(element);
          obs.unobserve(element);
        }
      });
    }, {
      rootMargin: OBSERVER_MARGIN,
      threshold: OBSERVER_THRESHOLD
    });

    candidates.forEach((element) => {
      observer.observe(element);
    });
  };

  onReady(init);
})();
