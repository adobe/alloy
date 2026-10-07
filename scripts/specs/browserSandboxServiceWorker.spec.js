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

import { afterAll, beforeAll, expect, test } from "vitest";
import { chromium } from "playwright";
import { createRequire } from "node:module";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(
  new URL("../../sandboxes/browser/", import.meta.url),
);
const require = createRequire(path.join(root, "package.json"));
const { build, createServer, preview } = await import(
  pathToFileURL(require.resolve("vite")).href
);
const configFile = path.join(root, "vite.config.mjs");
let browser;
let devServer;
let previewServer;
let outDir;

beforeAll(async () => {
  outDir = await mkdtemp(path.join(os.tmpdir(), "alloy-sandbox-worker-"));
  browser = await chromium.launch();
  devServer = await createServer({
    root,
    configFile,
    server: { port: 0, open: false },
  });
  await devServer.listen();
  await build({ root, configFile, build: { outDir } });
  previewServer = await preview({
    root,
    configFile,
    build: { outDir },
    preview: { port: 0, open: false },
  });
}, 30_000);

afterAll(async () => {
  await browser?.close();
  await devServer?.close();
  if (previewServer) {
    await new Promise((resolve, reject) => {
      previewServer.httpServer.close((error) =>
        error ? reject(error) : resolve(),
      );
    });
  }
  if (outDir) await rm(outDir, { recursive: true, force: true });
});

test.each(["development", "production"])(
  "%s sandbox delivers its worker and registers only on button click",
  async (mode) => {
    const server = mode === "development" ? devServer : previewServer;
    const origin = server.resolvedUrls.local[0];
    const context = await browser.newContext();
    try {
      await context.route("**/*", (route) =>
        new URL(route.request().url()).origin === new URL(origin).origin
          ? route.continue()
          : route.abort(),
      );
      const page = await context.newPage();
      await page.goto(origin);

      const response = await page.request.get(`${origin}alloyServiceWorker.js`);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toMatch(/javascript/);
      expect(await response.text()).not.toContain("<!doctype html>");

      expect(
        await page.evaluate(
          async () => (await navigator.serviceWorker.getRegistrations()).length,
        ),
      ).toBe(0);

      await page.goto(`${origin}pushNotifications`);
      const registerButton = page.getByRole("button", {
        name: "Register Service Worker",
        exact: true,
      });
      await registerButton.waitFor();
      expect(
        await page.evaluate(
          async () => (await navigator.serviceWorker.getRegistrations()).length,
        ),
      ).toBe(0);
      await registerButton.click();

      await page.waitForFunction(
        () => navigator.serviceWorker.controller?.state === "activated",
        null,
        { timeout: 10_000 },
      );
      const registration = await page.evaluate(async () => {
        const worker = await navigator.serviceWorker.getRegistration();
        return {
          scope: worker.scope,
          scriptURL: worker.active.scriptURL,
          controller: navigator.serviceWorker.controller.scriptURL,
        };
      });
      expect(registration).toEqual({
        scope: origin,
        scriptURL: `${origin}alloyServiceWorker.js`,
        controller: `${origin}alloyServiceWorker.js`,
      });

      await page
        .getByRole("button", { name: "Unregister Service Worker", exact: true })
        .click();
      await registerButton.waitFor();
      expect(
        await page.evaluate(
          async () => (await navigator.serviceWorker.getRegistrations()).length,
        ),
      ).toBe(0);
    } finally {
      await context.close();
    }
  },
  30_000,
);
