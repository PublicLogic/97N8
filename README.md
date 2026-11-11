# Nate Boudreau: Exploring What's Next for Gardner

Static, mobile-first site for Nate Boudreau's exploration of a run for Mayor or City Council in Gardner, Massachusetts.

## What's here

- `index.html`: all page content
- `assets/site.css`: styles
- `assets/site.js`: mobile menu and the email writer on the contact form (nothing is stored or sent from the page)
- `assets/fonts/`: Montserrat 400, 700 and 900, self-hosted (SIL Open Font License, see `OFL.txt`)
- `assets/portrait.jpg`, `assets/og-image.jpg` (1200×630 link preview), `assets/favicon.svg`
- `vercel.json`: security headers, including a Content Security Policy that allows only this site's own files

No third-party scripts, fonts, trackers or analytics. No build step.

## Preview locally

    python3 -m http.server 8000

## Deploy

Vercel, "Other" framework preset, root directory `.`, no build command, no environment variables.

## Updating the numbers

The budget and state-aid figures are a dated snapshot ("Pulled November 11, 2026" in the Numbers section). When you update a figure, update its row, its footnote, the source in the footer list and the date pill together.

## Once a custom domain is attached

Change the `og:image` meta tag in `index.html` to the full address (for example `https://example.com/assets/og-image.jpg`). Facebook and text-message previews need the full URL.
