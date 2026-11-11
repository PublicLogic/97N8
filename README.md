# Nate Boudreau: Exploring What's Next for Gardner

Static, mobile-first site for Nate Boudreau's exploration of a run for Mayor or City Council in
Gardner, Massachusetts. Plain HTML, CSS and JavaScript with no build step and no third-party
requests.

## Accessibility

The site targets **WCAG 2.2 AA**, and the automated tests enforce it on every push:

- axe-core scans (WCAG 2.0/2.1/2.2 A and AA plus best practices) at 320, 390, 768 and 1280px,
  with the mobile menu open, with form errors showing, with the email ready, and on the 404 page
- No sideways scrolling at 320px, and none with the WCAG 1.4.12 text-spacing overrides applied
- Dollar figures never split across lines on small phones
- Standalone controls are at least 24×24px (WCAG 2.5.8)
- Skip link, mobile menu (Escape closes it and returns focus) and form errors work by keyboard
- Headings never skip a level, every image has alt text, every in-page link has a target
- Reduced motion turns off smooth scrolling

Things the tests can't fully prove, handled by design:

- Every text color meets 4.5:1 contrast on its background, including navy
- A two-tone focus ring stays visible on white, cream and navy
- Windows High Contrast (forced colors) and print each have their own styles
- At high zoom or on short screens the header stops being sticky, so it doesn't cover content
- **Works without JavaScript.** The menu shows as a plain row of links, and the email and phone
  number are always on the page. JavaScript only adds the collapsible menu and the email writer.

## Privacy and security

- No analytics, trackers, cookies, third-party scripts or third-party fonts (Montserrat is
  self-hosted under the SIL Open Font License; see `public/assets/fonts/OFL.txt`)
- The email writer builds a message for the visitor to send from their own account. Nothing is
  stored or sent from the page.
- `vercel.json` sets a strict Content Security Policy (this site's own files only), HSTS,
  Permissions-Policy, frame blocking and related headers. The tests check that the page loads
  nothing from other sites and triggers no CSP violations.

## Project layout

```
public/              Everything that gets deployed
  index.html         All page content
  404.html           Not-found page
  assets/css/        site.css (tokens, components, modes)
  assets/js/         flag.js (marks JS as available before first paint), main.js (menu, email writer)
  assets/fonts/      Montserrat 400/700/900, woff2
scripts/serve.mjs    Local server that applies vercel.json headers, clean URLs and the 404 page
tests/site.spec.mjs  Playwright + axe tests
vercel.json          Deploy settings and security headers
```

## Working on it

Requires Node 20 or newer.

```
npm install
npm start            # http://localhost:4173, with the production headers
npm run lint         # HTML validation (html-validate), CSS lint (stylelint), formatting (Prettier)
npx playwright install chromium firefox webkit
npm test             # accessibility, keyboard, layout and security tests in all three engines
npm run check        # everything
```

To run the tests against an installed Chrome instead of Playwright's browsers:
`CHROME_PATH=/path/to/chrome npm test`.

GitHub Actions runs lint and the full test suite on every push to `main` and every pull request.

## Deploy

Vercel reads `vercel.json`: no install, no build, output directory `public`.

## Updating the numbers

The budget and state-aid figures are a dated snapshot ("Pulled November 11, 2026" in the
Numbers section). When you change a figure, update its row, its footnote, the source in the
footer list and the date together.

## Once a custom domain is attached

Change the `og:image` meta tag in `public/index.html` to the full address (for example
`https://example.com/assets/og-image.jpg`). Facebook and text-message previews need the full URL.
