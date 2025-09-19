<script>
/*! SweQuant footer-bundle.js | build: 001202509200123 */

// === wipe-heading.js ===
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

// === reveal-controller.js ===
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

// === nav-entrance.js ===
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

// === nav-active-link.js ===
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

// === cad-grid.js ===
(function () {
  const MOTION_QUERY = matchMedia('(prefers-reduced-motion: reduce)');
  let PREFERS_REDUCED = MOTION_QUERY.matches;

  // ===== CONFIG (elegant & stable) =====
  const CONFIG = {
    spacing: 28,
    plusLen: 5,
    lineWidth: 1,
    baseColor: null,
    driftSpeedX: 0.003,
    hoverSpeedBoost: 1.08,

    // Halo — gentle
    lightRadius: 110,
    lightBoostAlpha: 0.08,
    lightBoostWidth: 0.22,
    lightGlowAlpha: 0.12,

    // Intro cascade
    rain: { enabled: true, distance: 110, durationMs: 700, staggerMax: 380, overshoot: 0.08 },

    // Bursts (quasiparticles) — randomized per-burst
    bursts: {
      delayMs: [1100, 2000],
      chance: 0.55,
      countRange: [0, 2],
      maxActive: 12,

      // NEW: lifetime range (short “pops” to long “lingers”)
      lifetimeRangeMs: [1600, 4200],   // <— replaces fixed lifetime
      // NEW: per-burst speed/decay ranges (smaller/shorter move slower and fade faster)
      baseSpeedRange: [0.08, 0.16],
      speedDecayRange: [0.45, 0.65],
      // NEW: per-burst alpha half-life (how long influence lingers)
      halfLifeRangeMs: [900, 1400],

      wavesMin: 2,
      wavesMax: 4,
      waveGap: 32,
      sigma: 9,
      waveFalloff: 0.6,

      aspectMin: 0.6,
      aspectMax: 1.4,
      rotationJitter: true,

      // Controlled punch
      coreSigma: 12,
      coreAlpha: 0.30,
      coreWidth: 0.22,
      ampAlpha: 0.58,
      ampWidth: 0.36,

      jetsPerBurst: [0, 1],
      jetThickness: 8,
      jetAlpha: 0.12,
      jetWidth: 0.16,
      // NEW: jets inherit a fraction of burst lifetime instead of a fixed value
      jetLifetimeFrac: [0.28, 0.42],
      jetSpeed: 0.15,

      coloredFraction: 0.55,
      midlifeFlip: true
    },

    // Glyphs (fade-out)
    glyphs: {
      chancePerHit: 0.24,
      set: [
        '#','*','%','§','Δ','Ω','Ψ','φ','π','λ','μ','ν','ξ','ϵ','η','κ',
        '⊕','⊗','⊥','⟂','χ','τ','ρ','σ','γ','β','α','+','∑','∞','≈','∫','∇','ℏ','ψ'
      ],
      color: 'rgba(28,32,58,0.90)',
      colorDark: 'rgba(255,255,255,0.92)',
      lifeMs: 1600   // linger slightly longer
    },

    // Subtle vertical wave
    wave: { amp: 3.5, speed: 0.0012, phase: 0.5 },

    // Colour floor for coloured strokes (keeps them present)
    minColorAlpha: 0.60,

    // Fade behaviour back to base (no flash)
    decay: {
      colorLerp: 0.10,     // slower blend to keep colour lingering
      alphaLerp: 0.14,     // slower fade back to grid alpha
      holdMs: 180,         // small hold before decay starts (linger)
    },

    darkSelector: '.is-dark',
    forceDebugColors: false
  };

  const ALPHA_CAP = 0.96;
  const WIDTH_CAP = 2.0;

  // ===== utils =====
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const easeOutCubic=t=>1-Math.pow(1-t,3);
  const easeOutBack=(t,s=1.70158)=>{t=clamp(t,0,1);return 1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2);};
  const readVar=(el,name)=>getComputedStyle(el).getPropertyValue(name).trim();
  const parseRGBA=str=>{const m=str&&str.match&&str.match(/rgba?\(([^)]+)\)/i);if(!m)return{r:0,g:0,b:0,a:.16};const [r,g,b,a=1]=m[1].split(/\s*,\s*/).map(Number);return{r,g,b,a:isNaN(a)?1:a}};
  const keyRC=(r,c)=>r+','+c;
  const randInt=(min,max)=>Math.floor(min+Math.random()*(max-min+1));
  const rand=(min,max)=>min+Math.random()*(max-min);
  const TAU=Math.PI*2;
  const gaussian=(x,mu,s)=>Math.exp(-0.5*Math.pow((x-mu)/s,2));
  const halfLife=(age,hl)=>Math.pow(0.5, age/hl);
  const snap=v=>Math.round(v);
  const lerp=(a,b,t)=>a+(b-a)*t;
  function hexToRgb(hex){hex=hex.trim(); if(hex.startsWith('rgb')){const m=hex.match(/rgba?\(([^)]+)\)/); if(m){const [r,g,b]=m[1].split(',').map(v=>+v); return {r,g,b};} } const m=hex.replace('#',''); const n=parseInt(m.length===3?m.split('').map(x=>x+x).join(''):m,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function rgbStr(o){return `rgb(${o.r|0}, ${o.g|0}, ${o.b|0})`;}
  function mix(a,b,t){return {r:lerp(a.r,b.r,t), g:lerp(a.g,b.g,t), b:lerp(a.b,b.b,t)};}

  function ellipseDistance(dx,dy,theta,aspect){
    const cos=Math.cos(theta), sin=Math.sin(theta);
    const x= dx*cos + dy*sin;
    const y=-dx*sin + dy*cos;
    return Math.sqrt(x*x + (y/aspect)*(y/aspect));
  }

  function makeCanvas(section){
    const c=document.createElement('canvas');
    c.className='cad-canvas';
    c.style.pointerEvents='none';
    section.prepend(c);
    return c;
  }

  function controller(section){
    const canvas=makeCanvas(section);
    const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});

    // Base colour
    let cssColor=getComputedStyle(section).getPropertyValue('--sq-grid-color').trim()||'rgba(0,0,0,.16)';
    if(section.matches(CONFIG.darkSelector)) cssColor='rgba(255,255,255,.18)';
    if(CONFIG.baseColor) cssColor=CONFIG.baseColor;
    const base=parseRGBA(cssColor);
    const baseStrokeRGB={r:base.r,g:base.g,b:base.b};
    const baseAlpha=base.a;

    // Brand palette
    const root=document.documentElement;
    const names=['--Gold','--Light Gold','--Dark Gold','--Blue','--Blue Light','--Blue Darks','--brand-gold','--brand-blue','--gold','--blue'];
    const fallback={ '--Gold':'#ffd265','--Light Gold':'#fcdb8c','--Dark Gold':'#e6b84f','--Blue':'#001f64','--Blue Light':'#001447','--Blue Darks':'#1641b1','--brand-gold':'#ffd265','--brand-blue':'#001f64','--gold':'#ffd265','--blue':'#001f64' };
    const palSet=new Set();
    for(const n of names){ const v=readVar(root,n)||readVar(section,n)||fallback[n]||''; if(v && /^#|rgb/.test(v)) palSet.add(v.trim()); }
    if(palSet.size===0){ palSet.add('#ffd265'); palSet.add('#001f64'); }
    const PALETTE=[...palSet];
    const PALETTE_RGB = PALETTE.map(hexToRgb);
    const pick = arr => arr[Math.floor(Math.random()*arr.length)];

    const glyphBase = section.matches(CONFIG.darkSelector) ? CONFIG.glyphs.colorDark : CONFIG.glyphs.color;

    // ----- state
    let rect=null,dpr=1,W=0,H=0,cols=0,rows=0;
    let driftCycle=0; // [0..1)
    let lastT=performance.now(), boost=1;
    let cx=null,cy=null;

    let rafId=null;
    let isActive=false;
    let isVisible=false;

    // intro rain
    let fallStart=[],fallDur=[],rainDone=false;

    // per-cell state
    const cellState=new Map();

    // glyphs that fade out
    const glyphs=new Map();

    // bursts
    let bursts=[];
    let nextSpawnAt=0;

    function scheduleNextSpawn(now){ const [a,b]=CONFIG.bursts.delayMs; nextSpawnAt = now + (a + Math.random()*(b-a)); }

    function resize(){
      rect=canvas.getBoundingClientRect();
      dpr=Math.max(1,window.devicePixelRatio||1);
      const w=Math.max(1,Math.floor(rect.width*dpr));
      const h=Math.max(1,Math.floor(rect.height*dpr));
      if(canvas.width!==w) canvas.width=w;
      if(canvas.height!==h) canvas.height=h;
      canvas.style.width=rect.width+'px';
      canvas.style.height=rect.height+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.imageSmoothingEnabled=false;

      W=rect.width; H=rect.height;
      cols=Math.ceil(W/CONFIG.spacing)+2;
      rows=Math.ceil(H/CONFIG.spacing)+2;

      const now=performance.now();
      fallStart=Array.from({length:rows},()=>Array.from({length:cols},()=>now+(CONFIG.rain.enabled?Math.random()*CONFIG.rain.staggerMax:0)));
      fallDur  =Array.from({length:rows},()=>Array.from({length:cols},()=>CONFIG.rain.durationMs*(0.9+Math.random()*0.25)));
      rainDone=!CONFIG.rain.enabled;

      if(!isActive){
        render();
      }
    }

    function newBurst(x, y){
      // randomized knobs for this burst
      const life = rand(CONFIG.bursts.lifetimeRangeMs[0], CONFIG.bursts.lifetimeRangeMs[1]);
      const baseSpeed = rand(CONFIG.bursts.baseSpeedRange[0], CONFIG.bursts.baseSpeedRange[1]);
      const speedDecay = rand(CONFIG.bursts.speedDecayRange[0], CONFIG.bursts.speedDecayRange[1]);
      const halfLifeMs = rand(CONFIG.bursts.halfLifeRangeMs[0], CONFIG.bursts.halfLifeRangeMs[1]);

      // colour selection
      const colouredPick = CONFIG.forceDebugColors ? true : (Math.random() < CONFIG.bursts.coloredFraction);
      let c1=baseStrokeRGB, c2=baseStrokeRGB;
      if (colouredPick){
        c1 = pick(PALETTE_RGB);
        c2 = CONFIG.bursts.midlifeFlip && PALETTE_RGB.length>1
          ? pick(PALETTE_RGB.filter(x=>x!==c1))
          : c1;
      }

      // geometry
      const aspect = CONFIG.bursts.aspectMin + Math.random()*(CONFIG.bursts.aspectMax - CONFIG.bursts.aspectMin);
      const theta  = CONFIG.bursts.rotationJitter ? Math.random()*TAU : 0;
      const waves  = randInt(CONFIG.bursts.wavesMin, CONFIG.bursts.wavesMax);

      // jets inherit fraction of life
      const jetLife = life * rand(CONFIG.bursts.jetLifetimeFrac[0], CONFIG.bursts.jetLifetimeFrac[1]);

      return {
        cx:x, cy:y, t0: performance.now(),
        life, baseSpeed, speedDecay, halfLifeMs,
        c1, c2, colored: colouredPick, waves, theta, aspect,
        jets: [],
        jetLife
      };
    }

    function spawn(){
      if(PREFERS_REDUCED) return;
      if (bursts.length >= CONFIG.bursts.maxActive) return;
      const b = newBurst(Math.random()*W, Math.random()*H);
      bursts.push(b);
    }
    function spawnAt(x,y){
      if(PREFERS_REDUCED) return;
      if (bursts.length >= CONFIG.bursts.maxActive) bursts.shift();
      const b = newBurst(x,y);
      bursts.push(b);
    }

    function drawPlus(x,y,a,w,colorStr){
      ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle=colorStr; ctx.lineWidth=Math.min(w, WIDTH_CAP);
      const s=CONFIG.plusLen, h=s/2; ctx.beginPath();
      ctx.moveTo(x, y-h); ctx.lineTo(x, y+h); ctx.moveTo(x-h, y); ctx.lineTo(x+h, y); ctx.stroke(); ctx.restore();
    }
    function drawHalo(x,y,a,colorStr){
      ctx.save(); ctx.globalAlpha=a; ctx.strokeStyle=colorStr; ctx.lineWidth=1;
      const s=CONFIG.plusLen+2, h=s/2; ctx.beginPath();
      ctx.moveTo(x, y-h); ctx.lineTo(x, y+h); ctx.moveTo(x-h, y); ctx.lineTo(x+h, y); ctx.stroke(); ctx.restore();
    }

    function render(ts){
      const now = ts==null ? performance.now() : ts;
      if(ts==null) ts = now;
      const dt=Math.min(50, Math.max(0, now - lastT));
      lastT=now;

      // bounded drift
      driftCycle = (driftCycle + (CONFIG.driftSpeedX*dt*boost)/CONFIG.spacing) % 1;

      // spawner
      if(isActive && !PREFERS_REDUCED && now>=nextSpawnAt){
        if(Math.random()<CONFIG.bursts.chance){
          const n=randInt(CONFIG.bursts.countRange[0], CONFIG.bursts.countRange[1]);
          for(let i=0;i<n;i++) spawn();
        }
        scheduleNextSpawn(now);
      }

      ctx.clearRect(0,0,W,H);

      const offX = -CONFIG.spacing + driftCycle*CONFIG.spacing;
      const offY = -CONFIG.spacing;

      // purge bursts by their own life
      bursts = bursts.filter(b => now - b.t0 < b.life);

      // fade glyphs
      for(const [k,g] of glyphs){
        const age = now - g.born;
        if(age > g.lifeMs){ glyphs.delete(k); }
      }

      let allSettled=true;

      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const x0 = offX + c*CONFIG.spacing;
          const yWave = Math.sin( (ts*CONFIG.wave.speed) + (c*CONFIG.wave.phase) + (r*0.12) ) * CONFIG.wave.amp;
          const y0 = offY + r*CONFIG.spacing + yWave;

          // intro fall
          let yOff=0, aMul=1;
          if(!rainDone){
            const k=(ts - fallStart[r][c]) / fallDur[r][c];
            if(k<=0){ yOff=-CONFIG.rain.distance; aMul=0; allSettled=false; }
            else if(k<1){ const e=easeOutBack(k,1.70158*CONFIG.rain.overshoot);
              yOff=-CONFIG.rain.distance*(1-e); aMul=easeOutCubic(k); allSettled=false; }
          }

          const xs=snap(x0), ys=snap(y0+yOff);
          const cellK = keyRC(r,c);

          // current state (with defaults)
          let st = cellState.get(cellK);
          if(!st){
            st = {
              rgb: {...baseStrokeRGB},
              alpha: baseAlpha*aMul,
              targetRgb: {...baseStrokeRGB},
              targetAlpha: baseAlpha*aMul,
              lastInfluenced: -1
            };
            cellState.set(cellK, st);
          } else {
            // ensure base alpha applied when not influenced
            st.targetAlpha = baseAlpha*aMul;
            st.targetRgb   = baseStrokeRGB;
          }

          // influence accumulation
          let influenced = false;
          let influenceEnergy = 0;
          let width = CONFIG.lineWidth;
          let drawColor = baseStrokeRGB;

          for(const b of bursts){
            const age=now-b.t0, life=b.life;
            if(age<0) continue;

            const env=halfLife(age, b.halfLifeMs); // uses per-burst HL
            const v=b.baseSpeed * (1 - b.speedDecay*(age/life)); // per-burst speed/decay
            const dx=xs-b.cx, dy=ys-b.cy;

            const dist = ellipseDistance(dx,dy,b.theta,b.aspect);
            const tn = clamp(age/life,0,1);
            const colNow = b.colored ? (CONFIG.bursts.midlifeFlip ? (tn<0.5? b.c1 : b.c2) : b.c1) : baseStrokeRGB;

            // core
            const coreK = gaussian(dist, 0, CONFIG.bursts.coreSigma) * env;
            if(coreK>0.012){
              influenced = true;
              influenceEnergy = Math.max(influenceEnergy, coreK);
              drawColor = colNow;
              width = Math.max(width, CONFIG.lineWidth*(1+CONFIG.bursts.coreWidth*coreK));
              st.targetAlpha = Math.max(st.targetAlpha, clamp(st.alpha + CONFIG.bursts.coreAlpha*coreK, CONFIG.minColorAlpha, ALPHA_CAP));
            }

            // rings
            for(let wv=0; wv<b.waves; wv++){
              const R = age*v - wv*CONFIG.bursts.waveGap;
              if(R <= -CONFIG.bursts.waveGap) continue;
              const k = gaussian(dist, Math.max(0,R), CONFIG.bursts.sigma) * env * Math.pow(CONFIG.bursts.waveFalloff, wv);
              if(k>0.012){
                influenced = true;
                influenceEnergy = Math.max(influenceEnergy, k);
                drawColor = colNow;
                width = Math.max(width, CONFIG.lineWidth*(1+CONFIG.bursts.ampWidth*k));
                st.targetAlpha = Math.max(st.targetAlpha, clamp(st.alpha + CONFIG.bursts.ampAlpha*k, CONFIG.minColorAlpha, ALPHA_CAP));
              }
            }

            // jets (subtle)
            if(b.jets && b.jets.length){
              for(const jt of b.jets){
                const jAge=Math.min(age, b.jetLife);
                const jFront=jAge * CONFIG.bursts.jetSpeed;
                const proj = dx*Math.cos(jt.angle)+dy*Math.sin(jt.angle);
                if(proj>0 && proj<jFront){
                  const px = dx - proj*Math.cos(jt.angle);
                  const py = dy - proj*Math.sin(jt.angle);
                  const dLine=Math.hypot(px,py);
                  if(dLine<CONFIG.bursts.jetThickness){
                    const kk=(1-dLine/CONFIG.bursts.jetThickness)*env;
                    if(kk>0){
                      influenced = true;
                      influenceEnergy = Math.max(influenceEnergy, kk*0.6);
                      drawColor = colNow;
                      width = Math.max(width, CONFIG.lineWidth*(1+CONFIG.bursts.jetWidth*kk));
                      st.targetAlpha = Math.max(st.targetAlpha, clamp(st.alpha + CONFIG.bursts.jetAlpha*kk, CONFIG.minColorAlpha, ALPHA_CAP));
                    }
                  }
                }
              }
            }
          }

          // if influenced, set colour target and mark time
          if(influenced){
            st.targetRgb = drawColor;
            st.lastInfluenced = now;
            // occasionally plant a glyph when energy is strong
            if(influenceEnergy > 0.18 && Math.random() < CONFIG.glyphs.chancePerHit){
              if(!glyphs.has(cellK)){
                const char = CONFIG.glyphs.set[Math.floor(Math.random()*CONFIG.glyphs.set.length)];
                glyphs.set(cellK, {char, rgb: drawColor, born: now, lifeMs: CONFIG.glyphs.lifeMs});
              }
            }
          } else {
            // not influenced: after a short hold, decay targets back to base
            if(st.lastInfluenced > 0 && now - st.lastInfluenced > CONFIG.decay.holdMs){
              st.targetRgb = baseStrokeRGB;
              st.targetAlpha = baseAlpha*aMul;
            }
          }

          // smooth blend current -> target (prevents flashing)
          st.rgb   = mix(st.rgb, st.targetRgb, CONFIG.decay.colorLerp);
          st.alpha = lerp(st.alpha, st.targetAlpha, CONFIG.decay.alphaLerp);

          // halo (gentle)
          const colorStr = rgbStr(st.rgb);
          if(cx!=null && cy!=null){
            const d=Math.hypot(xs-cx, ys-cy);
            if(d<CONFIG.lightRadius){
              const k=1 - d/CONFIG.lightRadius, k2=k*k;
              drawHalo(xs, ys, CONFIG.lightGlowAlpha*k, colorStr);
              st.alpha = clamp(st.alpha + CONFIG.lightBoostAlpha*k2, 0, ALPHA_CAP);
              width = Math.max(width, CONFIG.lineWidth*(1+CONFIG.lightBoostWidth*k2));
            }
          }

          // cap width and draw
          const w = Math.min(width, WIDTH_CAP);
          const g=glyphs.get(cellK);
          if(g){
            const age = now - g.born;
            const gAlpha = clamp(1 - (age / g.lifeMs), 0, 1);
            const glyphCol = g.rgb ? rgbStr(g.rgb) : glyphBase;
            ctx.save();
            ctx.globalAlpha = st.alpha * gAlpha;
            ctx.fillStyle = glyphCol;
            ctx.font='600 12px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
            ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillText(g.char, xs, ys);
            ctx.restore();
          } else {
            drawPlus(xs, ys, st.alpha, w, colorStr);
          }
        }
      }

      if(!rainDone && allSettled) rainDone=true;
    }

    function loop(ts){
      rafId=null;
      render(ts);
      if(isActive){
        rafId=requestAnimationFrame(loop);
      }
    }

    function startLoop(){
      if(PREFERS_REDUCED){
        render();
        return;
      }
      if(isActive) return;
      isActive=true;
      lastT=performance.now();
      scheduleNextSpawn(lastT);
      rafId=requestAnimationFrame(loop);
    }

    function stopLoop(){
      if(rafId!=null){
        cancelAnimationFrame(rafId);
        rafId=null;
      }
      if(!isActive){
        cx=null;
        cy=null;
        boost=1;
        render();
        return;
      }
      isActive=false;
      cx=null;
      cy=null;
      boost=1;
      render();
    }

    function renderStatic(){ render(); }

    function updateVisibility(visible){
      isVisible=visible;
      if(PREFERS_REDUCED){
        stopLoop();
        return;
      }
      if(visible){
        startLoop();
      } else {
        stopLoop();
      }
    }

    function handleMotionPreferenceChange(prefersReduced){
      if(prefersReduced){
        bursts=[];
        glyphs.clear();
        stopLoop();
      } else if(isVisible){
        startLoop();
      } else {
        stopLoop();
      }
    }

    // interactions
    function onEnter(){ boost=CONFIG.hoverSpeedBoost; }
    function onLeave(){ boost=1; cx=cy=null; }
    function onMove(e){ if(!rect) rect=canvas.getBoundingClientRect(); cx=e.clientX-rect.left; cy=e.clientY-rect.top; }
    function onClick(e){ if(!rect) rect=canvas.getBoundingClientRect(); spawnAt(e.clientX-rect.left, e.clientY-rect.top); }

    // init
    resize();
    window.addEventListener('resize', resize, {passive:true});
    section.addEventListener('mouseenter', onEnter, {passive:true});
    section.addEventListener('mouseleave', onLeave,  {passive:true});
    section.addEventListener('mousemove',  onMove,   {passive:true});
    section.addEventListener('click',      onClick,  {passive:true});

    scheduleNextSpawn(performance.now());
    render();

    return {
      section,
      startLoop,
      stopLoop,
      renderStatic,
      setVisibility: updateVisibility,
      handleMotionPreferenceChange
    };
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const controllers = new Map();
    const supportsIO = typeof IntersectionObserver !== 'undefined';
    const observer = supportsIO ? new IntersectionObserver(entries => {
      for(const entry of entries){
        const ctrl = controllers.get(entry.target);
        if(!ctrl) continue;
        const visible = entry.isIntersecting && entry.intersectionRatio > 0;
        ctrl.setVisibility(visible);
      }
    }, { threshold: [0, 0.01] }) : null;

    document.querySelectorAll('.section-cadgrid').forEach(section => {
      const ctrl = controller(section);
      controllers.set(section, ctrl);
      if(observer){
        observer.observe(section);
      } else {
        ctrl.setVisibility(true);
      }
    });

    const handleMotionChange = e => {
      PREFERS_REDUCED = e.matches;
      controllers.forEach(ctrl => ctrl.handleMotionPreferenceChange(PREFERS_REDUCED));
    };

    if(MOTION_QUERY.addEventListener){
      MOTION_QUERY.addEventListener('change', handleMotionChange);
    } else if(MOTION_QUERY.addListener){
      MOTION_QUERY.addListener(handleMotionChange);
    }
  });
})();

</script>
