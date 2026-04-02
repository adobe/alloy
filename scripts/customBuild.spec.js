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

import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, test as baseTest } from "vitest";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "../");
const buildCmd = "node packages/browser/scripts/alloyBuilder.js build";

/**
 * Run a custom alloy build and return the bundle source.
 * @param {string} outDir - Directory to write build output into (must exist).
 * @param {object} [options]
 * @param {string[]} [options.excludes] - Component names to exclude from the build.
 * @param {AbortSignal} [options.signal] - Signal to abort the build process.
 * @returns {Promise<string>} The contents of the generated alloy.js bundle.
 */
const buildAndRead = (outDir, { excludes = [], signal } = {}) =>
  new Promise((resolve, reject) => {
    const excludeFlag =
      excludes.length > 0 ? ` --exclude ${excludes.join(" ")}` : "";
    exec(
      `${buildCmd} --no-minify -o ${outDir}${excludeFlag}`,
      { cwd: root, signal },
      (err) => {
        if (err) return reject(err);
        resolve(fs.readFileSync(path.join(outDir, "alloy.js"), "utf8"));
      },
    );
  });

const test = baseTest
  .extend(
    "buildAlloy",
    { scope: "file" },
    async ({ signal }, { onCleanup }) => {
      const outDir = path.join(os.tmpdir(), `alloy-build-${Date.now()}`);
      fs.mkdirSync(outDir, { recursive: true });
      onCleanup(() => fs.rmSync(outDir, { recursive: true, force: true }));
      return (excludes) => buildAndRead(outDir, { excludes, signal });
    },
  )
  .extend("defaultBundle", { scope: "file" }, async ({ buildAlloy }) => {
    return await buildAlloy();
  });

describe("Custom build", () => {
  test("produces a bundle", async ({ defaultBundle }) => {
    expect(defaultBundle).toBeTruthy();
  });

  describe("ActivityCollector", () => {
    test("is included in the default build", async ({ defaultBundle }) => {
      expect(defaultBundle).toContain("ActivityCollector");
    });

    test("is excluded when --exclude activityCollector is passed", async ({
      buildAlloy,
      defaultBundle,
    }) => {
      const bundle = await buildAlloy(["activityCollector"]);
      expect(bundle).toBeTruthy();
      expect(bundle).not.toContain("ActivityCollector");
      expect(bundle.length).toBeLessThan(defaultBundle.length);
    }, 20000);
  });
});
