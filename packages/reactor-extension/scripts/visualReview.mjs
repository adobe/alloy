#!/usr/bin/env node

/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Local visual review for the Spectrum 2 migration. Builds the real view pages
// for two or three git refs, screenshots every view with a stub extension
// bridge, compares saved settings, and writes an HTML report. Temporary: it is
// deleted at the end of the Spectrum 2 migration stack.
//
// Usage (from packages/reactor-extension):
//   pnpm review:visual --base <parent ref> --head <ref> [--v3 <ref>] [--views a,b] [--out dir] [--open]

import { execFileSync } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { parseArgs } from "util";
import { chromium } from "playwright";

const { values: args } = parseArgs({
  options: {
    base: { type: "string" },
    head: { type: "string" },
    v3: { type: "string", default: "origin/main" },
    views: { type: "string" },
    out: { type: "string" },
    open: { type: "boolean", default: false },
  },
});
if (!args.base || !args.head) {
  console.error(
    "Usage: pnpm review:visual --base <parent ref> --head <ref> [--v3 <ref>] [--views a,b] [--out dir] [--open]",
  );
  process.exit(2);
}

const repo = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const cacheDir = path.join(os.tmpdir(), "alloy-visual-review");
const git = (...gitArgs) =>
  execFileSync("git", gitArgs, { cwd: repo, encoding: "utf8" }).trim();
const run = (cmd, cmdArgs, cwd) =>
  execFileSync(cmd, cmdArgs, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true", CI: "" },
    maxBuffer: 64 * 1024 * 1024,
  });

// Check out a ref into a cached worktree and build its view pages once.
const prepareRef = (ref) => {
  const sha = git("rev-parse", `${ref}^{commit}`);
  const dir = path.join(cacheDir, "worktrees", sha);
  const extensionDir = path.join(dir, "packages/reactor-extension");
  const viewDir = path.join(extensionDir, "dist/view");
  const label = `${ref} (${sha.slice(0, 9)})`;
  if (fs.existsSync(path.join(viewDir, ".built"))) {
    console.log(`✓ ${label} cached`);
    return { ref, sha, viewDir };
  }
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    git("worktree", "add", "--detach", "--quiet", dir, sha);
  }
  console.log(`… ${label} installing`);
  run("pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], dir);
  console.log(`… ${label} building views`);
  run("pnpm", ["run", "build:extensionManifest"], extensionDir);
  run("pnpm", ["run", "build:views"], extensionDir);
  fs.writeFileSync(path.join(viewDir, ".built"), new Date().toISOString());
  console.log(`✓ ${label} built`);
  return { ref, sha, viewDir };
};

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};
const serve = (root) =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const file = path.join(
        root,
        decodeURIComponent(new URL(req.url, "http://localhost").pathname),
      );
      if (
        !file.startsWith(root) ||
        !fs.existsSync(file) ||
        fs.statSync(file).isDirectory()
      ) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, {
        "content-type":
          mimeTypes[path.extname(file)] || "application/octet-stream",
      });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

const components = Object.fromEntries(
  [
    "activityCollector",
    "advertising",
    "audiences",
    "brandConcierge",
    "consent",
    "eventMerge",
    "mediaAnalyticsBridge",
    "personalization",
    "pushNotifications",
    "rulesEngine",
    "streamingMedia",
  ].map((name) => [name, true]),
);
const initInfo = {
  company: { orgId: "1234@AdobeOrg" },
  tokens: { imsAccess: "IMS_ACCESS" },
  propertySettings: { id: "PR1234" },
  extensionSettings: {
    instances: [{ name: "alloy", edgeConfigId: "PR123" }],
    components,
  },
};
const states = [
  { name: "new", validate: false },
  { name: "validated", validate: true },
];

// Stub of the Launch extension bridge, installed before any page script runs.
const installBridge = () => {
  window.visualReviewRegistration = new Promise((resolve) => {
    window.extensionBridge = {
      register: resolve,
      openCodeEditor: async ({ code }) => code,
      openDataElementSelector: async ({ tokenize }) =>
        tokenize ? "%data element%" : "data element",
      openRegexTester: async () => "regex",
    };
  });
  window.visualReviewRendered = new Promise((resolve) => {
    window.addEventListener("extension-reactor-alloy:rendered", resolve, {
      once: true,
    });
  });
  const style = document.createElement("style");
  style.textContent =
    "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}";
  document.addEventListener("DOMContentLoaded", () =>
    document.head.appendChild(style),
  );
};

const fileKey = (key) => key.replace(/[/#]/g, "__");

const captureView = async (browser, origin, viewPath, state, file) => {
  const context = await browser.newContext({
    viewport: { width: 1100, height: 800 },
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  // Answer API calls with empty data so views render offline.
  await page.route("**/*", (route) => {
    const request = route.request();
    if (
      request.url().startsWith(origin) ||
      !["fetch", "xhr"].includes(request.resourceType())
    ) {
      return route.continue();
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [], meta: { pagination: {} } }),
    });
  });
  await page.addInitScript(installBridge);
  const entry = { errors: [] };
  page.on("pageerror", (error) => entry.errors.push(String(error.message)));
  try {
    await page.goto(`${origin}/${viewPath}`, { waitUntil: "load" });
    await page.evaluate(async (info) => {
      const registration = await window.visualReviewRegistration;
      await registration.init(info);
      await Promise.race([
        window.visualReviewRendered,
        new Promise((resolve) => {
          setTimeout(resolve, 5000);
        }),
      ]);
    }, initInfo);
    if (state.validate) {
      entry.valid = await page.evaluate(async () =>
        (await window.visualReviewRegistration).validate(),
      );
    }
    entry.settings = await page.evaluate(async () => {
      try {
        return await (await window.visualReviewRegistration).getSettings();
      } catch (error) {
        return { error: String(error) };
      }
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await page.screenshot({ path: file, fullPage: true });
    entry.file = file;
  } catch (error) {
    entry.errors.push(String(error.message));
  }
  await context.close();
  return entry;
};

const capture = async (browser, built, pages, outDir) => {
  const server = await serve(built.viewDir);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const results = {};
  for (const viewPath of pages) {
    for (const state of states) {
      const key = `${viewPath}#${state.name}`;
      const file = path.join(
        outDir,
        built.sha.slice(0, 9),
        `${fileKey(key)}.png`,
      );
      // eslint-disable-next-line no-await-in-loop
      results[key] = await captureView(browser, origin, viewPath, state, file);
      process.stdout.write(".");
    }
  }
  server.close();
  process.stdout.write("\n");
  return results;
};

// Compare two screenshots in a canvas. Returns the changed-pixel ratio and
// writes an image that marks changed pixels in red over a faded copy of head.
const createDiffer = async (browser) => {
  const page = await browser.newPage();
  return async (baseFile, headFile, outFile) => {
    if (!baseFile || !headFile) {
      return null;
    }
    const toDataUrl = (file) =>
      `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
    const result = await page.evaluate(
      async ([baseUrl, headUrl]) => {
        const load = (src) =>
          new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
          });
        const [base, head] = await Promise.all([load(baseUrl), load(headUrl)]);
        const width = Math.max(base.width, head.width);
        const height = Math.max(base.height, head.height);
        const pixels = (image) => {
          const canvas = new OffscreenCanvas(width, height);
          const context = canvas.getContext("2d");
          context.fillStyle = "#fff";
          context.fillRect(0, 0, width, height);
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, width, height).data;
        };
        const a = pixels(base);
        const b = pixels(head);
        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext("2d");
        const out = context.createImageData(width, height);
        let changed = 0;
        for (let i = 0; i < a.length; i += 4) {
          const delta =
            Math.abs(a[i] - b[i]) +
            Math.abs(a[i + 1] - b[i + 1]) +
            Math.abs(a[i + 2] - b[i + 2]);
          if (delta > 24) {
            changed += 1;
            out.data.set([230, 30, 60, 255], i);
          } else {
            const gray = (b[i] + b[i + 1] + b[i + 2]) / 3;
            const faded = 255 - Math.round((255 - gray) * 0.25);
            out.data.set([faded, faded, faded, 255], i);
          }
        }
        context.putImageData(out, 0, 0);
        const blob = await canvas.convertToBlob({ type: "image/png" });
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 1) {
          binary += String.fromCharCode(bytes[i]);
        }
        return {
          ratio: changed / (width * height),
          sizeChanged: base.width !== head.width || base.height !== head.height,
          png: btoa(binary),
        };
      },
      [toDataUrl(baseFile), toDataUrl(headFile)],
    );
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, Buffer.from(result.png, "base64"));
    return { ratio: result.ratio, sizeChanged: result.sizeChanged };
  };
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
// Generated IDs (for example eventMergeId's cacheId) differ on every run.
const normalizeSettings = (settings) =>
  JSON.stringify(settings)?.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    "<uuid>",
  );
const changeThreshold = 0.0005;

const writeReport = async (browser, outDir, refs, keys, shots) => {
  const { v3, base, head } = refs;
  const diff = await createDiffer(browser);
  const rows = [];
  for (const key of keys) {
    const b = shots.base[key] || { errors: [] };
    const h = shots.head[key] || { errors: [] };
    const v = shots.v3?.[key] || { errors: [] };
    const diffFile = path.join(outDir, "diff", `${fileKey(key)}.png`);
    // eslint-disable-next-line no-await-in-loop
    const change = await diff(b.file, h.file, diffFile);
    rows.push({
      key,
      b,
      h,
      v,
      change,
      diffFile: change ? diffFile : null,
      settingsSame:
        normalizeSettings(b.settings) === normalizeSettings(h.settings),
      v3SettingsSame:
        v.settings === undefined ||
        normalizeSettings(v.settings) === normalizeSettings(h.settings),
    });
  }
  rows.sort((x, y) => (y.change?.ratio ?? 1) - (x.change?.ratio ?? 1));

  const rel = (file) => path.relative(outDir, file);
  const figure = (file, label) =>
    file
      ? `<figure><figcaption>${label}</figcaption><a href="${rel(file)}"><img src="${rel(file)}" loading="lazy"></a></figure>`
      : `<figure><figcaption>${label}</figcaption><div class="missing">no screenshot</div></figure>`;
  const flip = (r) =>
    r.b.file && r.h.file
      ? `<figure><figcaption>hover to see base, leave to see head</figcaption><div class="flip"><img src="${rel(r.b.file)}" loading="lazy"><img class="top" src="${rel(r.h.file)}" loading="lazy"></div></figure>`
      : "";
  const isChanged = (r) => !r.change || r.change.ratio > changeThreshold;
  const card = (r) => {
    const errors = [...r.b.errors, ...r.h.errors];
    const badges = [
      r.change
        ? `<span class="badge ${isChanged(r) ? "warn" : "ok"}">${(r.change.ratio * 100).toFixed(2)}% pixels changed${r.change.sizeChanged ? ", size changed" : ""}</span>`
        : `<span class="badge bad">missing screenshot</span>`,
      r.settingsSame
        ? `<span class="badge ok">saved settings unchanged</span>`
        : `<span class="badge bad">saved settings changed</span>`,
      r.v3SettingsSame
        ? ""
        : `<span class="badge bad">saved settings differ from v3</span>`,
      errors.length
        ? `<span class="badge bad" title="${escapeHtml(errors.join("\n"))}">${errors.length} page error(s)</span>`
        : "",
    ].join(" ");
    const settings = r.settingsSame
      ? ""
      : `<details><summary>saved settings (base, head)</summary><div class="pair"><pre>${escapeHtml(JSON.stringify(r.b.settings, null, 2))}</pre><pre>${escapeHtml(JSON.stringify(r.h.settings, null, 2))}</pre></div></details>`;
    return `<section><h3>${escapeHtml(r.key)}</h3><p>${badges}</p><div class="cols">${
      v3 ? figure(r.v.file, `v3 · ${escapeHtml(v3.ref)}`) : ""
    }${figure(r.b.file, `base · ${escapeHtml(base.ref)}`)}${figure(r.h.file, `head · ${escapeHtml(head.ref)}`)}${flip(r)}${figure(r.diffFile, "changed pixels (base → head)")}</div>${settings}</section>`;
  };
  const changed = rows.filter(isChanged);
  const unchanged = rows.filter((r) => !isChanged(r));
  const settingsChanged = rows.filter((r) => !r.settingsSame);
  const columns = v3 ? 5 : 4;
  const html = `<!doctype html><meta charset="utf-8">
<title>Visual review: ${escapeHtml(base.ref)} → ${escapeHtml(head.ref)}</title>
<style>
body{font:14px/1.4 system-ui,sans-serif;margin:24px;color:#222}
h1{font-size:20px}h2{margin-top:32px}h3{margin:0 0 6px;font-size:15px}
section{border:1px solid #ddd;border-radius:8px;padding:12px;margin:12px 0}
.cols{display:grid;grid-template-columns:repeat(${columns},1fr);gap:8px;align-items:start}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}
figure{margin:0}figcaption{font-size:12px;color:#666;margin-bottom:4px}
img{width:100%;border:1px solid #eee;display:block}
.flip{display:grid}.flip img{grid-area:1/1}.flip:hover .top{opacity:0}
.badge{display:inline-block;border-radius:10px;padding:1px 8px;font-size:12px;background:#eee}
.ok{background:#e3f6e8;color:#1b6b34}.warn{background:#fff3d6;color:#7a5200}.bad{background:#fde2e2;color:#9b1c1c}
.missing{border:1px dashed #ccc;padding:40px;text-align:center;color:#999}
pre{background:#f7f7f7;padding:8px;overflow:auto;font-size:12px;max-height:300px}
</style>
<h1>Visual review: ${escapeHtml(base.ref)} → ${escapeHtml(head.ref)}</h1>
<p>${v3 ? `v3 reference <code>${escapeHtml(v3.ref)}</code> (${v3.sha.slice(0, 9)}) · ` : ""}base <code>${base.sha.slice(0, 9)}</code> · head <code>${head.sha.slice(0, 9)}</code> · generated ${new Date().toLocaleString()}</p>
<p><b>${changed.length}</b> of ${rows.length} view states changed · <b>${settingsChanged.length}</b> with changed saved settings · ${unchanged.length} unchanged (collapsed below)</p>
<h2>Changed</h2>${changed.map(card).join("") || "<p>None.</p>"}
<h2>Unchanged</h2><details><summary>${unchanged.length} view states with no visible change</summary>${unchanged.map(card).join("")}</details>`;
  const file = path.join(outDir, "index.html");
  fs.writeFileSync(file, html);
  return {
    file,
    changed: changed.length,
    total: rows.length,
    settingsChanged: settingsChanged.length,
  };
};

const listPages = (viewDir) =>
  ["actions", "dataElements", "configuration"].flatMap((folder) => {
    const dir = path.join(viewDir, folder);
    return fs.existsSync(dir)
      ? fs
          .readdirSync(dir)
          .filter((name) => name.endsWith(".html"))
          .map((name) => `${folder}/${name}`)
      : [];
  });

const main = async () => {
  const refs = { base: prepareRef(args.base), head: prepareRef(args.head) };
  if (args.v3) {
    refs.v3 = prepareRef(args.v3);
  }
  let pages = [
    ...new Set([
      ...listPages(refs.base.viewDir),
      ...listPages(refs.head.viewDir),
    ]),
  ].sort();
  if (args.views) {
    const wanted = args.views.split(",");
    pages = pages.filter((page) => wanted.some((name) => page.includes(name)));
  }
  const outDir = path.resolve(
    args.out ||
      path.join(
        cacheDir,
        "reports",
        `${refs.base.sha.slice(0, 9)}..${refs.head.sha.slice(0, 9)}`,
      ),
  );
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const shots = {};
  for (const [name, built] of Object.entries(refs)) {
    console.log(
      `Capturing ${pages.length} views × ${states.length} states for ${name} (${built.ref})`,
    );
    // eslint-disable-next-line no-await-in-loop
    shots[name] = await capture(browser, built, pages, outDir);
  }
  const keys = pages.flatMap((page) =>
    states.map((state) => `${page}#${state.name}`),
  );
  const summary = await writeReport(browser, outDir, refs, keys, shots);
  await browser.close();
  console.log(
    `\n${summary.changed}/${summary.total} view states changed, ${summary.settingsChanged} with changed saved settings`,
  );
  console.log(`Report: ${summary.file}`);
  if (args.open) {
    execFileSync(process.platform === "darwin" ? "open" : "xdg-open", [
      summary.file,
    ]);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
