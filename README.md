# 97N8 — Exploring What's Next for Gardner

A complete, mobile-first exploratory website for Nathan R. (Nate) Boudreau, developed from the original Red Sky Associates campaign material and visual language.

**Nate is considering both Mayor and City Council in Gardner. Neither office is selected. This is not a candidacy announcement.**

## Design

- Red Sky campaign visual cues: navy/red/white, bold NATE BOUDREAU mark, Montserrat typography, original portrait, and direct language.
- Original material about Gardner roots, five terms representing Ward 3, municipal management experience, and the phrase "Answers that show up in budgets, not speeches."
- Updated for a possible return to Gardner municipal government, not a 2026 state legislative run.
- Full sections: intro, story, public-service record, local issue questions, two equal exploratory paths, contact, and FAQ.
- Responsive layout, accessible mobile navigation, semantic content, reduced-motion CSS, no third-party JavaScript, no data collection, and no donation integration.

## Local preview

Open index.html in a browser or run:

    python3 -m http.server 8000

## Deploy

Import PublicLogic/97N8 into Vercel, select the Other framework preset with repository root at . and no build command. The app is plain HTML/CSS/JS and requires no environment variables.

## Before public promotion

- Confirm that nate@boudreauforrep.org remains the right contact address.
- Review OCPF reporting and any campaign-communication identification requirements for municipal office. Exploratory language on a website does not create a separate formal OCPF exploratory committee category.
- Confirm office eligibility if a candidacy is ultimately chosen.
- Proofread the record and dates against the earlier campaign material.
- The site is not affiliated with the City of Gardner. It requests no donations or volunteer commitments.

## Files

- index.html: all content and page structure
- assets/site.css: complete responsive styling
- assets/site.js: accessible mobile menu behavior
- assets/portrait.jpg: original campaign portrait
- assets/favicon.svg: small N monogram
- vercel.json, robots.txt: static-host configuration
