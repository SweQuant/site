(function(){
  const SELECTOR = '[data-wipe-words]';

  const splitIntoChunks = (token) => {
    const chunks = [];
    let index = 0;
    while (index < token.length) {
      const remaining = token.length - index;
      let size = remaining > 3 ? 3 : remaining;
      if (remaining === 4) {
        size = 2;
      }
      chunks.push(token.slice(index, index + size));
      index += size;
    }
    return chunks;
  };

  const processElement = (element) => {
    if (!element || element.dataset.wipeProcessed === 'true') {
      return;
    }

    const originalText = element.textContent || '';
    const readableLabel = originalText.replace(/\s+/g, ' ').trim();

    if (readableLabel) {
      element.setAttribute('aria-label', readableLabel);
    } else {
      element.removeAttribute('aria-label');
    }

    element.dataset.wipeProcessed = 'true';
    element.setAttribute('data-wipe-original', originalText);
    element.textContent = '';

    const tokens = originalText.split(/(\s+)/);
    let chunkIndex = 0;

    tokens.forEach((token) => {
      if (!token) {
        return;
      }

      if (/^\s+$/.test(token)) {
        element.appendChild(document.createTextNode(token));
        return;
      }

      const word = document.createElement('span');
      word.className = 'wipe-word';
      word.setAttribute('aria-hidden', 'true');

      const inner = document.createElement('span');
      inner.className = 'wipe-inner wipe-inner--chunked';

      splitIntoChunks(token).forEach((chunk) => {
        const chunkEl = document.createElement('span');
        chunkEl.className = 'wipe-chunk';
        chunkEl.textContent = chunk;
        chunkEl.style.setProperty('--i', String(chunkIndex));
        inner.appendChild(chunkEl);
        chunkIndex += 1;
      });

      word.classList.add('wipe-word--chunked');
      word.appendChild(inner);
      element.appendChild(word);
    });
  };

  const init = () => {
    document.querySelectorAll(SELECTOR).forEach(processElement);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
