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
 * exercises buildAlloy.mjs against the result. The only deviation from
 * production is swapping @adobe/alloy to a local file: dependency so the
 * test does not depend on the in-development version being published.
 */

import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";
import { describe, expect, test as baseTest } from "vitest";

import {
  createExtensionPackage,
  getPackageJson,
} from "./createExtensionPackage.mjs";

const execAsync = promisify(exec);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(dirname, "..");
const alloyRoot = path.resolve(extensionRoot, "../..");

/**
 * Patch the unzipped manifest so npm install resolves @adobe/alloy from the
 * local workspace rather than the registry. The lockfile referenced the
 * registry version; remove it so npm regenerates one against the file: dep.
 * @param {string} forgeDir - Directory containing the unzipped extension.
 */
const pointAlloyAtLocalWorkspace = (forgeDir) => {
  const pkgPath = path.join(forgeDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.dependencies["@adobe/alloy"] =
    `file:${path.join(alloyRoot, "packages/browser")}`;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  fs.rmSync(path.join(forgeDir, "package-lock.json"), { force: true });
};

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
  await execAsync(
    `node scripts/buildAlloy.mjs -i ./alloy.js -o ./dist/lib ${flags}`.trim(),
    { cwd: forgeDir, signal, ...(env && { env: { ...process.env, ...env } }) },
  );
  return fs.readFileSync(path.join(forgeDir, "dist/lib/alloy.js"), "utf8");
};

const test = baseTest
  // eslint-disable-next-line no-empty-pattern
  .extend("zipPath", { scope: "file" }, async ({}, { onCleanup }) => {
    const zipPath = createExtensionPackage({ verbose: false });
    onCleanup(() => fs.rmSync(zipPath, { force: true }));
    return zipPath;
  })
  .extend(
    "forgeDir",
    { scope: "file" },
    async ({ zipPath, signal }, { onCleanup }) => {
      const tmpDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "forge-build-test-"),
      );
      onCleanup(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

      // The createExtensionPackage zip mixes entries from reactor-packager
      // with ones AdmZip appended; AdmZip's own extractor chokes on the
      // resulting data-descriptor mismatch, so shell out to unzip instead.
      await execAsync(`unzip -q "${zipPath}" -d "${tmpDir}"`, { signal });
      fs.mkdirSync(path.join(tmpDir, "dist/lib"), { recursive: true });
      pointAlloyAtLocalWorkspace(tmpDir);

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
      test("emits no workspace: protocol values", () => {
        const pkg = getPackageJson();
        const offenders = Object.entries(pkg.dependencies).filter(([, v]) =>
          String(v).startsWith("workspace:"),
        );
        expect(offenders).toEqual([]);
      });
    });

    describe("createExtensionPackage()", () => {
      test("produces a zip containing package.json and package-lock.json", ({
        zipPath,
      }) => {
        expect(fs.existsSync(zipPath)).toBe(true);
        const entries = new AdmZip(zipPath)
          .getEntries()
          .map((e) => e.entryName);
        expect(entries).toContain("package.json");
        expect(entries).toContain("package-lock.json");
        expect(entries).toContain("alloy.js");
        expect(entries).toContain("scripts/buildAlloy.mjs");
      });

      test("zipped package.json has no workspace: protocol values", ({
        zipPath,
      }) => {
        const pkg = JSON.parse(new AdmZip(zipPath).readAsText("package.json"));
        const offenders = Object.entries(pkg.dependencies).filter(([, v]) =>
          String(v).startsWith("workspace:"),
        );
        expect(offenders).toEqual([]);
      });
    });

    describe("buildAlloy.mjs (standard build)", () => {
      test("produces a bundle with all default components", async ({
        defaultBundle,
      }) => {
        expect(defaultBundle).toContain("ActivityCollector");
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
