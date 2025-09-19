(function () {
  const ACTIVE_CLASS = 'active';
  const LINK_SELECTOR = '.nav-links a[href^="#"]';

  const onReady = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  const parseHash = (href) => {
    if (!href) {
      return null;
    }

    try {
      const url = new URL(href, window.location.href);
      return url.hash ? decodeURIComponent(url.hash.slice(1)) : null;
    } catch (error) {
      if (href.startsWith('#')) {
        return decodeURIComponent(href.slice(1));
      }
    }

    return null;
  };

  const readPxVar = (styles, name) => {
    const value = styles.getPropertyValue(name);
    if (!value) {
      return 0;
    }

    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : 0;
  };

  const getNavOffset = () => {
    const styles = getComputedStyle(document.documentElement);
    const top = readPxVar(styles, '--nav-top');
    const height = readPxVar(styles, '--nav-h');
    const gap = 8;
    return top + height + gap;
  };

  const escapeSelector = (value) => {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }

    return value.replace(/([\0-\x1F\x7F-\x9F!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~ ])/g, '\\$1');
  };

  const init = () => {
    const links = Array.from(document.querySelectorAll(LINK_SELECTOR));
    if (!links.length) {
      return;
    }

    const pairs = links.map((link) => {
      const id = parseHash(link.getAttribute('href'));
      if (!id) {
        return null;
      }

      const target = document.getElementById(id) || document.querySelector(`[data-nav-section="${escapeSelector(id)}"]`);
      if (!target) {
        return null;
      }

      return { link, target };
    }).filter(Boolean);

    if (!pairs.length) {
      return;
    }

    let activeLink = null;
    const setActive = (next) => {
      if (next === activeLink) {
        return;
      }

      if (activeLink) {
        activeLink.classList.remove(ACTIVE_CLASS);
      }

      activeLink = next;
      if (activeLink) {
        activeLink.classList.add(ACTIVE_CLASS);
      }
    };

    const selectByScroll = () => {
      const offset = getNavOffset();
      const scrollY = window.scrollY;
      const viewportBottom = scrollY + window.innerHeight;
      const nearBottom = viewportBottom >= document.documentElement.scrollHeight - 2;
      let chosen = null;

      for (const { link, target } of pairs) {
        const rect = target.getBoundingClientRect();
        const top = rect.top + scrollY;
        if (nearBottom) {
          if (!chosen || top >= (chosen.target.getBoundingClientRect().top + scrollY)) {
            chosen = { link, target };
          }
          continue;
        }

        if (scrollY + offset >= top) {
          if (!chosen || top >= (chosen.target.getBoundingClientRect().top + scrollY)) {
            chosen = { link, target };
          }
        }
      }

      if (!chosen) {
        chosen = pairs[0];
      }

      setActive(chosen.link);
    };

    let ticking = false;
    const handleScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(() => {
        selectByScroll();
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    window.addEventListener('load', handleScroll);

    links.forEach((link) => {
      link.addEventListener('click', () => {
        setActive(link);
      });
    });

    selectByScroll();
  };

  onReady(init);
})();
