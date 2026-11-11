// Zero-dependency static server for local preview and tests.
// It serves ./public and applies the same headers, clean URLs and 404 page as vercel.json,
// so tests run against the real Content Security Policy.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));
const port = Number(process.env.PORT ?? 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

// vercel.json "source" patterns used here are path-to-regexp style: /(.*) and /prefix/(.*)
const headerRules = (config.headers ?? []).map(({ source, headers }) => ({
  test: new RegExp(`^${source.replace(/\(\.\*\)/g, ".*")}$`),
  headers,
}));

async function findFile(pathname) {
  const candidates = pathname.endsWith("/")
    ? [join(pathname, "index.html")]
    : [pathname, `${pathname}.html`, join(pathname, "index.html")];
  for (const candidate of candidates) {
    const full = normalize(join(root, candidate));
    if (full !== root && !full.startsWith(root + sep)) continue;
    try {
      if ((await stat(full)).isFile()) return full;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  for (const rule of headerRules) {
    if (rule.test.test(pathname)) {
      for (const { key, value } of rule.headers) res.setHeader(key, value);
    }
  }
  const file = await findFile(decodeURIComponent(pathname));
  const status = file ? 200 : 404;
  const path = file ?? join(root, "404.html");
  res.writeHead(status, { "Content-Type": types[extname(path)] ?? "application/octet-stream" });
  res.end(await readFile(path));
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`);
});
