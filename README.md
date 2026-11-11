# Nate Boudreau — Gardner

This repository is the source for Nate Boudreau's personal exploratory website about a possible return to elected service in Gardner, Massachusetts. He is **considering both Mayor and City Council**, but **has not chosen either office or announced a candidacy**.

## Site structure

This is a **real five-page website**, not a one-page campaign landing page:

- `/` — Home and a note about why Nate is considering a return
- `/about/` — Background and personal story
- `/record/` — Gardner City Council and municipal administration record
- `/issues/` — Substantive municipal issues and views
- `/contact/` — Contact information and an honest description of current status

All pages have independent titles, content, URL routes and navigation.

## Design and editorial sources

The visual style and the substance are drawn from the prior Red Sky Associates campaign site and accompanying archived writing. This retains the navy, red, bold Boudreau wordmark, Montserrat, the original portrait, the earlier campaign motto "Courage to Change. Experience to Lead.", and the line "Answers that show up in budgets, not speeches."

The copy focuses on verified public-service experience and issues; it is not a declaration for Mayor or City Council. The old state legislative campaign's endorsements, election dates, fundraising CTAs, volunteer recruitment and campaign-specific promises were intentionally not brought forward.

## Preview

The site is static HTML/CSS/JS with no package install or build process. It can run on Vercel as a static site or locally from a static server:

```sh
python3 -m http.server 8000
```

See `index.html`, `about/index.html`, `record/index.html`, `issues/index.html`, and `contact/index.html`. The shared styles and responsive navigation are in `assets/`.

## Editorial and campaign checks before public launch

- Confirm that `nate@boudreauforrep.org` is still the preferred public email.
- Verify public service dates and descriptions.
- Review the appropriate OCPF communication requirements before a public campaign release.
- Do not confuse the current exploratory status with an official candidacy or a separate state-recognized exploratory committee.
- This website is not affiliated with the City of Gardner.

There are no donation links, volunteer collection forms, mailing-list forms, analytics, or fabricated testimonials.
