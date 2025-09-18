# Webflow head snippet

Use the following markup in **Project Settings → Custom Code → Head** to always load the newest bundle produced by the GitHub Action. The snippet preloads the last-known good version, then swaps to the true latest once `version.txt` is fetched (which the workflow refreshes alongside `bundle.css`).

```html
<!-- Always-load-latest bundle.css from GitHub via jsDelivr -->
<script>
(function () {
  var base = "https://cdn.jsdelivr.net/gh/SweQuant/site@main/packages/bundle.css";
  var vUrl = "https://cdn.jsdelivr.net/gh/SweQuant/site@main/version.txt";

  // OPTIONAL: set your last-known good stamp to avoid any flash
  var lastKnown = "202509181241"; // update once now; Action will supersede it

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

<!-- No-JS fallback -->
<noscript>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SweQuant/site@main/packages/bundle.css?v=noscript" />
</noscript>
```

## Where the values come from
- **`bundle.css`** receives a fresh UTC stamp (`YYYY-MM-DD-HHMM`) in both the header comment and the `:root { --sq-build: ... }` custom property.
- **`version.txt`** stores the same moment in a compact form (`YYYYMMDDHHMM`) that is ideal for cache-busting query strings.
- The Action purges both CDN URLs after every push to `main`, so the snippet above will see the new files immediately.

## Verifying the live version
1. Open the site in your browser.
2. Inspect any element → switch to the **Computed** panel.
3. Select `:root` in the styles pane and read the `--sq-build` variable — it matches the header stamp in `bundle.css`.

## Quick copy links
- Latest bundle (auto-updated): `https://cdn.jsdelivr.net/gh/SweQuant/site@main/packages/bundle.css`
- Cache-busting query token (plain text): `https://cdn.jsdelivr.net/gh/SweQuant/site@main/version.txt`
- Direct download of this snippet: `https://cdn.jsdelivr.net/gh/SweQuant/site@main/WEBFLOW.md`
