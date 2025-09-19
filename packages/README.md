# CSS Packages

Each file in this folder is a self-contained module that mirrors a section of the provided stylesheet. Reference only the modules you need inside Webflow so that edits stay isolated.

If you prefer to load a single stylesheet, use `bundle.css`. It contains every module in this directory and is compatible with the Webflow head snippet below that fetches `packages/bundle.css` through jsDelivr.

- `vars-anchor.css` – Global CSS variables for the navigation component and anchor offset behavior.
- `cad-grid.css` – CAD grid background helper classes and layering rules.
- `cad-grid.js` – Interactive CAD grid animation controller for `.section-cadgrid` blocks.
- `reveal.css` – Scroll reveal animation utilities and reduced motion fallback.
- `wipe-heading.css` – Word-by-word wipe animation for headings.
- `nav.css` – Navigation pill layout, link styling, responsive tweaks, and JS-fallback states.
- `bg-nonlinear.css` – Fixed soft grey background with animated drift.
- `button-eclipse.css` – Eclipse hover effect for buttons and anchor buttons.

## Using the modules in Webflow

Add one `<link>` tag per module inside **Project Settings → Custom Code → Head**. This keeps the modules independent so you can deploy surgical updates without touching the others.

When you use the navigation module, add a `.no-js` class to the root element so the fallback styles only apply when scripting is unavailable. Remove the class in the very first inline script block so JavaScript-driven entrance animations can take over immediately after the HTML loads.

```html
<html class="no-js">
  <head>
    <script>
      document.documentElement.classList.remove('no-js');
    </script>
    <!-- link tags continue here -->
  </head>
  <body>
    <!-- page markup -->
  </body>
</html>
```

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

### CAD grid animation script

To enable the animated CAD background, load the standalone script and make sure the target wrapper carries the `.section-cadgrid` class (it works on any block-level element, not just `<section>` tags).

```html
<script defer src="https://cdn.jsdelivr.net/gh/USERNAME/REPO@TAG/packages/cad-grid.js"></script>
```

The script auto-initialises on `DOMContentLoaded`, so no inline bootstrapping code is required.

### Maintaining the bundle build stamp

Run the bundler script whenever you merge CSS changes. It inlines every module into `packages/bundle.css` so you can either serve it from jsDelivr **or** copy/paste the full stylesheet into Webflow while iterating.

```bash
# Generate a new build stamp automatically (001 + YYYYMMDDHHMM in CET/CEST)
node scripts/build-bundle.js auto

# …or provide an explicit stamp if you prefer to control it manually
node scripts/build-bundle.js 001202510231145
```

The script updates both the header comment and the `--sq-build` custom property so the live bundle always advertises the exact build you just generated. By default it uses SweQuant’s local time zone (CET/CEST) and prefixes the stamp with `001`, but you can override the prefix by exporting `SQ_BUILD_PREFIX=XYZ` before running the command.

To rebuild the bundle automatically after every `git merge`, link the helper hook that ships with the repository:

```bash
chmod +x scripts/git-hooks/post-merge
ln -sf ../../scripts/git-hooks/post-merge .git/hooks/post-merge
```

The hook simply calls `node scripts/build-bundle.js auto`, so every merge updates `packages/bundle.css` with a fresh stamp ready for publishing.

### Recommended Webflow head snippet

If you rely on jsDelivr, keep a single `<link>` tag in **Project Settings → Custom Code → Head** and update the query string with the same timestamp you used when running the bundler script.

```html
<!-- Load the stamped bundle.css from jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/SweQuant/site@main/packages/bundle.css?v=202509181456" />
```

After publishing, open the live site in a private window and verify that the network request for `bundle.css` uses the timestamped `?v=` value you expect. If you prefer to bypass the CDN entirely while prototyping, copy the contents of `packages/bundle.css` directly into Webflow’s custom code area.

Replace `USERNAME`, `REPO`, and `TAG` with your GitHub username, repository name, and release tag or branch (e.g. `@main`). Clear the Webflow published site cache after updating a file so jsDelivr serves the latest version immediately.
