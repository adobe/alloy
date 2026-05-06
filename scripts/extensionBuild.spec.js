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
 * This file tests the reactor-extension custom build process (packages/reactor-extension).
 * It simulates the createExtensionPackage.mjs script in the extension package.
 */

import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { describe, expect, test as baseTest } from "vitest";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const alloyRoot = path.resolve(dirname, "..");
const extensionRoot = path.resolve(alloyRoot, "packages/reactor-extension");

/** @type {[source: string, dest: string][]} Files to copy from reactor-extension-alloy into the staged forge directory. */
const filesToCopy = [
  ["scripts/buildAlloy.mjs", "scripts/buildAlloy.mjs"],
  ["scripts/buildAlloyPreinstalled.mjs", "scripts/buildAlloyPreinstalled.mjs"],
  ["src/lib/alloy.js", "alloy.js"],
  ["src/lib/alloyPreinstalled.js", "alloyPreinstalled.js"],
  ["rollup.config.mjs", "rollup.config.mjs"],
  [".browserslistrc", ".browserslistrc"],
  ["src/view/utils/alloyComponents.mjs", "src/view/utils/alloyComponents.mjs"],
];

/**
 * Stage a temp directory that mimics the forge builder environment after
 * unzipping the extension package and running npm install. The package.json
 * points @adobe/alloy at the local packages/browser via a file: dependency
 * so we test the in-development code rather than the published version.
 * @param {string} tmpDir - Empty directory to populate.
 */
const stageForgeDir = (tmpDir) => {
  for (const [src, dest] of filesToCopy) {
    fs.mkdirSync(path.dirname(path.join(tmpDir, dest)), { recursive: true });
    fs.copyFileSync(path.join(extensionRoot, src), path.join(tmpDir, dest));
  }

  fs.mkdirSync(path.join(tmpDir, "dist/lib"), { recursive: true });

  const extPkg = JSON.parse(
    fs.readFileSync(path.join(extensionRoot, "package.json"), "utf8"),
  );
  const allDeps = { ...extPkg.dependencies, ...extPkg.devDependencies };

  const pkg = {
    name: "forge-build-test",
    version: "0.0.0",
    type: "module",
    dependencies: {
      "@adobe/alloy": `file:${path.join(alloyRoot, "packages/browser")}`,
      "@babel/core": allDeps["@babel/core"] || "^7.28.0",
      "@babel/preset-env": allDeps["@babel/preset-env"] || "^7.28.0",
      "@rollup/plugin-commonjs":
        allDeps["@rollup/plugin-commonjs"] || "^29.0.0",
      "@rollup/plugin-node-resolve":
        allDeps["@rollup/plugin-node-resolve"] || "^16.0.0",
      commander: allDeps.commander || "^14.0.0",
      rollup: allDeps.rollup || "^4.52.0",
    },
  };

  fs.writeFileSync(
    path.join(tmpDir, "package.json"),
    JSON.stringify(pkg, null, 2),
  );
};

/**
 * Run a forge buildAlloy.mjs build and return the bundle source.
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
  .extend("forgeDir", { scope: "file" }, async ({ signal }, { onCleanup }) => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "forge-build-test-"));
    onCleanup(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    stageForgeDir(tmpDir);
    const cacheDir = path.join(os.tmpdir(), "forge-npm-cache");
    await execAsync(`npm install --ignore-scripts --cache ${cacheDir}`, {
      cwd: tmpDir,
      signal,
    });

    return tmpDir;
  })
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
  { timeout: 60_000 },
  () => {
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
