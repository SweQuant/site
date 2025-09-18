# CSS Packages

Each file in this folder is a self-contained module that mirrors a section of the provided stylesheet. Reference only the modules you need inside Webflow so that edits stay isolated.

If you prefer to load a single stylesheet, use `bundle.css`. It imports every module in this directory and is compatible with the Webflow head snippet below that fetches `packages/bundle.css` through jsDelivr.

- `vars-anchor.css` – Global CSS variables for the navigation component and anchor offset behavior.
- `cad-grid.css` – CAD grid background helper classes and layering rules.
- `reveal.css` – Scroll reveal animation utilities and reduced motion fallback.
- `wipe-heading.css` – Word-by-word wipe animation for headings.
- `nav.css` – Navigation pill layout, link styling, responsive tweaks, and JS-fallback states.
- `bg-nonlinear.css` – Fixed soft grey background with animated drift.
- `button-eclipse.css` – Eclipse hover effect for buttons and anchor buttons.

## Using the modules in Webflow

Add one `<link>` tag per module inside **Project Settings → Custom Code → Head**. This keeps the modules independent so you can deploy surgical updates without touching the others.

```html
<!-- Required shared variables -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/vars-anchor.css" />

<!-- Optional modules (add/remove as needed) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/nav.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/cad-grid.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/bg-nonlinear.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/reveal.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/wipe-heading.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/button-eclipse.css" />

<!-- Or load everything at once -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/bundle.css" />
```

### Recommended Webflow head snippet

Paste this into **Project Settings → Custom Code → Head** to automatically load the newest bundle while keeping a flash-free fallback. Update the `lastKnown` stamp with the most recently published value from `version.txt`.

```html
<!-- Always-load-latest bundle.css from GitHub via jsDelivr -->
<script>
(function () {
  var base = "https://cdn.jsdelivr.net/gh/SweQuant/site@main/packages/bundle.css";
  var vUrl = "https://cdn.jsdelivr.net/gh/SweQuant/site@main/version.txt";

  // OPTIONAL: set your last-known good stamp to avoid any flash
  var lastKnown = "001202409271400"; // update alongside version.txt; Actions will replace it after publish

  // Preload with last-known (so there is no FOUC)
  var preload = document.createElement('link');
  preload.rel = 'stylesheet';
  preload.href = base + "?v=" + encodeURIComponent(lastKnown);
  document.head.appendChild(preload);

  // Swap to truly-latest as soon as version.txt is fetched
  fetch(vUrl, { cache: 'no-store' })
    .then(function (r) { return r.text(); })
    .then(function (v) {
      v = (v || "").trim();
      if (!v || v === lastKnown) return; // already fine
      preload.href = base + "?v=" + encodeURIComponent(v);
    })
    .catch(function () {
      // leave the lastKnown link in place
    });
})();
</script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SweQuant/site@main/packages/bundle.css?v=noscript" />
```

### Tracking the deployed version

`version.txt` uses a sortable numeric stamp prefixed with `001` (e.g. `001YYYYMMDDHHMM`). Whenever you update any CSS module or the bundle, bump this value and update the `lastKnown` constant above so Webflow preloads the same build you just deployed.

On the published Webflow site, open the page source (or Network tab) and inspect any `cdn.jsdelivr.net` stylesheet URL. The trailing `?v=` query parameter shows which version is currently live, making it easy to confirm that Webflow is serving the latest bundle.

Replace `USERNAME`, `REPO`, and `TAG` with your GitHub username, repository name, and release tag or branch (e.g. `@main`). Clear the Webflow published site cache after updating a file so jsDelivr serves the latest version immediately.
