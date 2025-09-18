# CSS Packages

Each file in this folder is a self-contained module that mirrors a section of the provided stylesheet. Reference only the modules you need inside Webflow so that edits stay isolated.

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
```

Replace `USERNAME`, `REPO`, and `TAG` with your GitHub username, repository name, and release tag or branch (e.g. `@main`). Clear the Webflow published site cache if you update a file so jsDelivr serves the latest version.
