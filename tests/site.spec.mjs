import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];
const WIDTHS = [320, 390, 768, 1280];

async function axe(page, label) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
  );
  expect(summary, `axe violations ${label}`).toEqual([]);
}

// Collect console errors, uncaught errors and Content Security Policy violations.
async function watchForErrors(page) {
  const problems = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return problems;
}

test.describe("accessibility (axe, WCAG 2.2 AA)", () => {
  for (const width of WIDTHS) {
    test(`home page has no violations at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await axe(page, `at ${width}px`);
    });
  }

  test("open mobile menu has no violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await axe(page, "with menu open");
  });

  test("email writer error and result states have no violations", async ({ page }) => {
    await page.goto("/#talk");
    await page.getByRole("button", { name: "Write my email" }).click();
    await axe(page, "with form errors");
    await page.getByLabel("Your name").fill("Test Resident");
    await page
      .getByLabel("What should Gardner's next leaders take on first?")
      .fill("Pave Pleasant Street.");
    await page.getByRole("button", { name: "Write my email" }).click();
    await axe(page, "with email ready");
  });

  test("404 page has no violations", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("That page isn't here.");
    await axe(page, "on 404");
  });
});

test.describe("structure", () => {
  test("has one h1, no skipped heading levels, and a lang attribute", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveCount(1);
    const levels = await page.$$eval("h1, h2, h3, h4, h5, h6", (els) =>
      els.map((el) => Number(el.tagName[1])),
    );
    for (let i = 1; i < levels.length; i++) {
      expect(
        levels[i] - levels[i - 1],
        `heading ${i} jumps from h${levels[i - 1]} to h${levels[i]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test("every in-page link and footnote points at something that exists", async ({ page }) => {
    await page.goto("/");
    const missing = await page.$$eval('a[href^="#"]', (links) =>
      links
        .map((a) => a.getAttribute("href").slice(1))
        .filter((id) => id && !document.getElementById(id)),
    );
    expect(missing).toEqual([]);
    const footnotesOutsideSources = await page.$$eval(".fn", (fns) =>
      fns.map((a) => a.getAttribute("href")).filter((href) => !/^#src-\d+$/.test(href)),
    );
    expect(footnotesOutsideSources).toEqual([]);
  });

  test("every image has alt text", async ({ page }) => {
    await page.goto("/");
    const missingAlt = await page.$$eval(
      "img",
      (imgs) => imgs.filter((img) => !img.hasAttribute("alt")).length,
    );
    expect(missingAlt).toBe(0);
  });
});

test.describe("security and privacy", () => {
  test("loads nothing from other sites and logs no errors or CSP violations", async ({
    page,
    baseURL,
  }) => {
    const problems = await watchForErrors(page);
    const foreign = [];
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (!["data:", "blob:"].includes(url.protocol) && url.origin !== new URL(baseURL).origin) {
        foreign.push(req.url());
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(foreign).toEqual([]);
    expect(problems).toEqual([]);
  });

  test("sends the security headers from vercel.json", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });
});

test.describe("layout", () => {
  test("reflows at 320px with no sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("dollar figures never split across lines on small phones", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 700 });
      await page.goto("/");
      const split = await page.$$eval(".ledger td.num", (cells) =>
        cells
          .filter((td) => {
            const range = document.createRange();
            range.selectNodeContents(td);
            return range.getClientRects().length > 1;
          })
          .map((td) => td.textContent),
      );
      expect(split, `at ${width}px`).toEqual([]);
    }
  });

  test("interactive targets are at least 24 by 24 pixels", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    // Links inside running text are exempt under WCAG 2.5.8; these are the standalone controls.
    const selectors = [
      ".fn",
      ".button",
      ".menu-button",
      ".contact__direct a",
      ".site-footer__bottom a",
      ".brand",
      "summary",
    ];
    const small = await page.$$eval(selectors.join(","), (els) =>
      els
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ el: el.className || el.tagName, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.width < 24 || box.height < 24)
        .map(({ el, box }) => `${el}: ${Math.round(box.width)}x${Math.round(box.height)}`),
    );
    expect(small).toEqual([]);
  });

  test("turns smooth scrolling off for people who reduce motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe("auto");
  });
});

test.describe("text spacing (WCAG 1.4.12)", () => {
  // The test injects the WCAG text-spacing overrides as a stylesheet, which the site's CSP
  // would otherwise block. Real readers apply these through browser extensions, which CSP allows.
  test.use({ bypassCSP: true });

  test("survives WCAG text-spacing overrides without sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.addStyleTag({
      content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
                p { margin-bottom: 2em !important; }`,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("keyboard", () => {
  test("skip link is the first stop and moves focus to the main content", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Safari skips links in tab order unless 'Press Tab to highlight each item' is on",
    );
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("mobile menu opens, closes with Escape, and returns focus to its button", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const button = page.getByRole("button", { name: "Menu" });
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(nav.getByRole("link", { name: "Record" })).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("link", { name: "Record" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("choosing a menu link closes the menu", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Numbers" })
      .click();
    await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(page).toHaveURL(/#numbers$/);
  });
});

test.describe("email writer", () => {
  test("flags empty required fields, then builds a ready-to-send email", async ({ page }) => {
    await page.goto("/#talk");
    const name = page.getByLabel("Your name");
    const message = page.getByLabel("What should Gardner's next leaders take on first?");

    await page.getByRole("button", { name: "Write my email" }).click();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(message).toHaveAttribute("aria-invalid", "true");
    await expect(name).toBeFocused();
    await expect(name).toHaveAccessibleDescription(/Enter your name/);

    await name.fill("Test Resident");
    await page.getByLabel(/Your ward or street/).fill("Ward 3");
    await message.fill("Pave Pleasant Street.");
    await page.getByRole("button", { name: "Write my email" }).click();

    await expect(name).not.toHaveAttribute("aria-invalid", "true");
    const result = page.locator("#email-result");
    await expect(result).toBeVisible();
    await expect(result).toBeFocused();
    await expect(page.locator("#email-preview")).toHaveText(
      /Pave Pleasant Street\.\s+Test Resident\s+Ward 3/,
    );
    const href = await page
      .getByRole("link", { name: "Open in my email app" })
      .getAttribute("href");
    expect(href).toMatch(
      /^mailto:nate@boudreauforrep\.org\?subject=Thoughts%20about%20Gardner&body=/,
    );
    expect(decodeURIComponent(href)).toContain("Pave Pleasant Street.");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("navigation and contact details still work", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link", { name: "Record" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Menu" })).toBeHidden();
    await expect(page.locator("#email-writer")).toBeHidden();
    await expect(page.getByRole("link", { name: "nate@boudreauforrep.org" }).first()).toBeVisible();
    // axe needs JavaScript to run, so this state is covered by the markup checks above.
  });
});
