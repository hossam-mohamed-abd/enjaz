# Enjaz World — Static UI Concept

An English-first, Arabic-RTL-ready concept for a premium travel experience across Türkiye.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

The production build uses relative asset URLs, so it works from the repository subpath at `https://hossam-mohamed-abd.github.io/enjaz/`.

A deployment workflow is included at `.github/workflows/deploy.yml`:

1. Open **Repository Settings → Pages**.
2. Set **Source** to **GitHub Actions**.
3. Merge these changes into `main`, or run the **Deploy website to GitHub Pages** workflow manually.

Do not publish the repository source root directly. GitHub Pages must serve the generated `dist` output created by `npm run build`; the workflow handles this automatically.

## Included

- Responsive editorial landing page
- Procedural Three.js travel diorama with a static fallback
- English default and functional Arabic RTL preview
- Destination filters and sample itinerary dialogs
- Interactive three-step custom-trip UI (no submission or storage)
- Mobile navigation, FAQ accordion, stay preferences, and reduced-motion support

All packages and planning content are illustrative. There is no backend, inventory, payment, or live booking integration.

Image sources are listed in `public/images/credits.txt`. Destination and boutique-stay visuals are AI-generated for this concept; the VIP van photograph is from Pexels.
