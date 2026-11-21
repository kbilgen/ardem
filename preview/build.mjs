#!/usr/bin/env node
/**
 * Portable static build — no Next.js runtime required.
 *
 *   node preview/build.mjs            → out-preview/
 *
 * Renders every route of src/app with the same React components (server-side,
 * then hydrated in the browser), compiles globals.css with Tailwind, and writes
 * a static site whose links and assets are all relative to the page they sit
 * on, so it runs from any folder or static host (no <base> tag needed). `next build` remains the production path;
 * this exists for previews, QA and hosts that only serve files.
 */
import { build } from "esbuild";
import { compile } from "tailwindcss";
import { readFile, writeFile, mkdir, rm, cp, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out-preview");
const CACHE = path.join(ROOT, ".preview-cache");
const require = createRequire(import.meta.url);
const t0 = Date.now();

const shared = {
  bundle: true,
  jsx: "automatic",
  tsconfig: path.join(ROOT, "tsconfig.json"),
  absWorkingDir: ROOT,
  define: {
    "process.env.NEXT_PUBLIC_RELATIVE_PATHS": '"1"',
    "process.env.NODE_ENV": '"production"',
  },
  alias: {
    "next/link": "./preview/shims/link.tsx",
    "next/navigation": "./preview/shims/navigation.ts",
  },
  logLevel: "warning",
  logOverride: { "unsupported-directive": "silent" },
  legalComments: "none",
};

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|mjs)$/.test(e.name)) out.push(p);
  }
  return out;
}

async function css() {
  const entry = path.join(ROOT, "src/app/globals.css");
  const source = await readFile(entry, "utf8");
  const compiler = await compile(source, {
    base: path.dirname(entry),
    from: entry,
    loadStylesheet: async (id, base) => {
      const file = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : path.resolve(base, id);
      return { path: file, base: path.dirname(file), content: await readFile(file, "utf8") };
    },
  });
  const candidates = new Set();
  for (const f of [...(await walk(path.join(ROOT, "src"))), ...(await walk(path.join(ROOT, "preview")))]) {
    for (const tok of (await readFile(f, "utf8")).match(/[^\s"'`]+/g) ?? []) candidates.add(tok);
  }
  let out = compiler.build([...candidates]);
  // Assets referenced from CSS are relative to /assets/app.css
  out = out.replaceAll('url("/fonts/', 'url("../fonts/').replaceAll('url("/images/', 'url("../images/');
  await writeFile(path.join(OUT, "assets/app.css"), out);
  return out.length;
}

function html(page, body, base) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const routeJson = JSON.stringify(page.route).replace(/</g, "\\u003c");
  return `<!DOCTYPE html>
<html lang="en" data-tone="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="theme-color" content="#0b0b0d">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${base}og.jpg">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${base}fonts/cormorant-garamond-latin-300-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${base}fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${base}assets/app.css">
<script>${BOOT}</script>
</head>
<body>
<div id="root">${body}</div>
<script>window.__ARDEM_ROUTE__=${routeJson};window.__ARDEM_PREFIX__=${JSON.stringify(base)};</script>
<script src="${base}assets/app.js" defer></script>
</body>
</html>
`;
}

let BOOT = "";

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(path.join(OUT, "assets"), { recursive: true });
  await mkdir(CACHE, { recursive: true });
  await cp(path.join(ROOT, "public"), OUT, { recursive: true });

  const cssBytes = await css();

  await build({
    ...shared,
    entryPoints: ["preview/client.tsx"],
    outfile: path.join(OUT, "assets/app.js"),
    format: "iife",
    platform: "browser",
    target: ["es2020", "safari15"],
    minify: true,
  });

  const serverFile = path.join(CACHE, "server.mjs");
  await build({
    ...shared,
    entryPoints: ["preview/server.tsx"],
    outfile: serverFile,
    format: "esm",
    platform: "node",
    target: "node20",
    external: ["react", "react/*", "react-dom", "react-dom/*"],
  });
  const bootFile = path.join(CACHE, "boot.mjs");
  await build({ ...shared, entryPoints: ["src/lib/boot.ts"], outfile: bootFile, format: "esm", platform: "node" });
  BOOT = (await import(pathToFileURL(bootFile).href + `?t=${Date.now()}`)).BOOT_SCRIPT;

  const server = await import(pathToFileURL(serverFile).href + `?t=${Date.now()}`);
  const list = server.pages();
  for (const page of list) {
    const depth = page.file.split("/").length - 1;
    const prefix = "../".repeat(depth);
    const body = server.render(page.route, prefix);
    const file = path.join(OUT, page.file);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html(page, body, prefix));
  }
  const js = (await readFile(path.join(OUT, "assets/app.js"))).length;
  console.log(`preview: ${list.length} pages, app.js ${(js / 1024).toFixed(0)} KB, app.css ${(cssBytes / 1024).toFixed(0)} KB in ${Date.now() - t0} ms → ${path.relative(ROOT, OUT)}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
