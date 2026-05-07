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

/**
 * End-to-end test of the reactor-extension packaging pipeline. Calls
 * createExtensionPackage() to produce the real zip, extracts it into a temp
 * dir, runs `npm install` (the same step forge runs after unzipping), and
 * exercises buildAlloy.mjs against the result. The zip ships @adobe/alloy
 * (and its workspace dep @adobe/alloy-core) as bundled tarballs, so this
 * runs identically to forge with no in-test patching.
 */

import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import AdmZip from "adm-zip";
import { describe, expect, test as baseTest } from "vitest";

import {
  createExtensionPackage,
  getPackageJson,
} from "./createExtensionPackage.mjs";

const execAsync = promisify(exec);

/**
 * Run buildAlloy.mjs inside the staged forge dir and return the bundle source.
 * @param {string} forgeDir - Staged forge directory.
 * @param {object} [options]
 * @param {Record<string, string>} [options.env] - Extra environment variables.
 * @param {string} [options.flags] - Additional CLI flags appended to the command.
 * @param {AbortSignal} [options.signal] - Signal to abort the build process.
 * @returns {Promise<string>} The contents of the generated alloy.js bundle.
 */
const buildAndRead = async (forgeDir, { env, flags = "", signal } = {}) => {
  const cmd = flags ? `npm run build -- ${flags}` : "npm run build";
  await execAsync(cmd, {
    cwd: forgeDir,
    signal,
    ...(env && { env: { ...process.env, ...env } }),
  });
  return fs.readFileSync(path.join(forgeDir, "dist/lib/alloy.js"), "utf8");
};

const test = baseTest
  // eslint-disable-next-line no-empty-pattern
  .extend("extensionPackage", { scope: "file" }, async ({}, { onCleanup }) => {
    const extensionPackage = await createExtensionPackage({ verbose: false });
    onCleanup(() => fs.rmSync(extensionPackage, { force: true }));
    return extensionPackage;
  })
  .extend(
    "forgeDir",
    { scope: "file" },
    async ({ extensionPackage, signal }, { onCleanup }) => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "forge-build-test-"),
      );
      onCleanup(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

      new AdmZip(extensionPackage).extractAllTo(tmpDir, true);
      fs.mkdirSync(path.join(tmpDir, "dist/lib"), { recursive: true });

      const cacheDir = path.join(os.tmpdir(), "forge-npm-cache");
      await execAsync(`npm install --ignore-scripts --cache ${cacheDir}`, {
        cwd: tmpDir,
        signal,
      });
      return tmpDir;
    },
  )
  .extend(
    "buildAlloy",
    { scope: "file" },
    async ({ forgeDir, signal }) =>
      (opts = {}) =>
        buildAndRead(forgeDir, { ...opts, signal }),
  )
  .extend("defaultBundle", { scope: "file" }, async ({ buildAlloy }) => {
    return await buildAlloy();
  });

describe(
  "Extension build (forge builder simulation)",
  { timeout: 180_000 },
  () => {
    describe("getPackageJson()", () => {
      test("rewrites vendored deps to file: paths", () => {
        const pkg = getPackageJson([
          { name: "@adobe/alloy", tgzName: "adobe-alloy-1.2.3.tgz" },
          {
            name: "@adobe/alloy-core",
            tgzName: "adobe-alloy-core-4.5.6.tgz",
          },
        ]);
        expect(pkg.dependencies["@adobe/alloy"]).toBe(
          "file:vendor/adobe-alloy-1.2.3.tgz",
        );
        expect(pkg.dependencies["@adobe/alloy-core"]).toBe(
          "file:vendor/adobe-alloy-core-4.5.6.tgz",
        );
      });
    });

    describe("createExtensionPackage()", () => {
      test("produces a zip containing package.json and package-lock.json", ({
        forgeDir,
      }) => {
        for (const f of [
          "package.json",
          "package-lock.json",
          "alloy.js",
          "scripts/buildAlloy.mjs",
        ]) {
          expect(fs.existsSync(path.join(forgeDir, f))).toBe(true);
        }
      });

      test("zipped package.json has no workspace: protocol values", ({
        forgeDir,
      }) => {
        const pkg = JSON.parse(
          fs.readFileSync(path.join(forgeDir, "package.json"), "utf8"),
        );
        const offenders = Object.entries(pkg.dependencies).filter(([, v]) =>
          String(v).startsWith("workspace:"),
        );
        expect(offenders).toEqual([]);
      });

      test("bundles @adobe/alloy and @adobe/alloy-core tarballs", ({
        forgeDir,
      }) => {
        const vendorEntries = fs.readdirSync(path.join(forgeDir, "vendor"));
        expect(
          vendorEntries.some((name) => /^adobe-alloy-[^/]+\.tgz$/.test(name)),
        ).toBe(true);
        expect(
          vendorEntries.some((name) =>
            /^adobe-alloy-core-[^/]+\.tgz$/.test(name),
          ),
        ).toBe(true);
      });
    });

    describe("buildAlloy.mjs (standard build)", () => {
      test("produces a bundle with all default components", async ({
        defaultBundle,
      }) => {
        expect(defaultBundle).toContain("ActivityCollector");
      });

      test("replaces the alloy version placeholder", async ({
        defaultBundle,
      }) => {
        expect(defaultBundle).not.toContain("__VERSION__");
      });

      test("can exclude activityCollector", async ({ buildAlloy }) => {
        const bundle = await buildAlloy({
          flags: "--activityCollector false",
        });
        expect(bundle).not.toContain("ActivityCollector");
      });

      test("can exclude activityCollector via env var", async ({
        buildAlloy,
      }) => {
        const bundle = await buildAlloy({
          env: { ALLOY_ACTIVITYCOLLECTOR: "false" },
        });
        expect(bundle).not.toContain("ActivityCollector");
      });
    });

    describe("buildAlloyPreinstalled.mjs", () => {
      test("produces a preinstalled bundle", async ({ forgeDir, signal }) => {
        await execAsync(
          "node scripts/buildAlloyPreinstalled.mjs -i ./alloyPreinstalled.js -o ./dist/lib",
          { cwd: forgeDir, signal },
        );
        const bundle = fs.readFileSync(
          path.join(forgeDir, "dist/lib/alloy.js"),
          "utf8",
        );
        expect(bundle).toContain("createCustomInstance");
      });
    });
  },
);
