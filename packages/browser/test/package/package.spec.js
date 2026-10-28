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

// Packs @adobe/alloy exactly as `npm publish` would and checks the tarball.
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
// The monorepo root isn't a dependency of browser, so it can't be imported by name.
// eslint-disable-next-line import/no-relative-packages
import withBuildLock from "../../../../scripts/helpers/withBuildLock.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const browserPath = path.resolve(dirname, "../..");
const workPath = path.join(browserPath, "node_modules/.cache/package-test");
const packagePath = path.join(workPath, "package");

describe("@adobe/alloy npm package", () => {
  let manifest;

  beforeAll(async () => {
    fs.rmSync(workPath, { recursive: true, force: true });
    fs.mkdirSync(packagePath, { recursive: true });
    // `pnpm pack` runs `prepack`, which builds dist/ from the shared core dist/.
    const tarball = await withBuildLock(() =>
      execFileSync("pnpm", ["pack", "--json", "--pack-destination", workPath], {
        cwd: browserPath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }),
    );
    const { filename } = JSON.parse(tarball.slice(tarball.indexOf("{")));
    execFileSync("tar", [
      "-xzf",
      path.resolve(workPath, filename),
      "-C",
      packagePath,
      "--strip-components=1",
    ]);
    manifest = JSON.parse(
      fs.readFileSync(path.join(packagePath, "package.json"), "utf8"),
    );
  }, 300_000);

  afterAll(() => {
    fs.rmSync(workPath, { recursive: true, force: true });
  });

  test("gives every JavaScript export alloy-source, types and default", () => {
    const entries = Object.entries(manifest.exports).filter(
      ([key]) => !key.endsWith(".json"),
    );
    expect(entries.length).toBeGreaterThan(0);
    entries.forEach(([, value]) => {
      expect(Object.keys(value)).toEqual(["alloy-source", "types", "default"]);
      expect(value.types).toMatch(/^\.\/dist\/.*\.d\.ts$/);
      expect(value.default).toMatch(/^\.\/dist\/.*\.js$/);
    });
  });

  test("contains every file the exports map points to", () => {
    const targets = Object.values(manifest.exports).flatMap((value) =>
      typeof value === "string" ? [value] : Object.values(value),
    );
    const missing = targets.filter(
      (target) => !fs.existsSync(path.join(packagePath, target)),
    );
    expect(missing).toEqual([]);
  });
});
