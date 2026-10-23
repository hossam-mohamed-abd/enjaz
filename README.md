# Enjaz World — Standalone Static Website

An English-first, Arabic-RTL-ready concept for a premium travel experience across Türkiye.

## Open the website — no setup required

Double-click the ready-made **`index.html`** in the repository root.

It is one self-contained static file with the CSS, JavaScript, fonts, images, and Three.js scene embedded inside it. It works over `file://` without npm, a development server, an internet connection, or any accompanying asset folders.

Only outbound destinations such as WhatsApp, Instagram, email, and the Pexels credit link require an internet connection. WebGL support depends on the browser; a static visual fallback is included.

> `app/index.html` is the editable source template. Open the root `index.html`, not the source template.

## Edit and rebuild

The generated root `index.html` should not be edited manually. Edit `app/index.html` or the files in `app/src/`, then run:

```bash
npm install
npm run build
```

The build updates both:

- `index.html` — the ready-to-open standalone file.
- `dist/index.html` — an identical artifact for GitHub Actions deployment.

For development with automatic reload:

```bash
npm run dev
```

## GitHub Pages

The standalone root `index.html` works when Pages uses **Deploy from a branch → main / (root)**, so no framework-specific Pages configuration is required.

The included `.github/workflows/deploy.yml` also supports **GitHub Actions** as the Pages source. It runs `npm run build` and uploads the generated `dist` directory.

## Included

- Responsive editorial landing page
- Procedural Three.js travel diorama with a static fallback
- English default and functional Arabic RTL preview
- Destination filters and sample itinerary dialogs
- Interactive three-step custom-trip UI (no submission or storage)
- Mobile navigation, FAQ accordion, stay preferences, and reduced-motion support
- Embedded imagery, fonts, styles, and scripts for offline use

All packages and planning content are illustrative. There is no backend, inventory, payment, or live booking integration.

Image credits are available inside the page footer. Source files and the original credit notice remain in `public/images/credits.txt`. Destination and boutique-stay visuals are AI-generated for this concept; the VIP van photograph is from Pexels.
