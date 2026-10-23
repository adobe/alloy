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

// Packs @adobe/alloy-core exactly as `npm publish` would and checks the
// tarball, so a broken build never reaches npm.
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.resolve(dirname, "../..");
// Inside core's node_modules so the unpacked package resolves its dependencies.
const workPath = path.join(corePath, "node_modules/.cache/package-test");
const packagePath = path.join(workPath, "node_modules/@adobe/alloy-core");

// Files with no imports or exports compile to scripts, which tsc prefixes
// with "use strict".
const LICENSE_HEADER =
  /^(?:"use strict";\n)?\/\*\nCopyright \d{4} Adobe\. All rights reserved\./;

const listFiles = (dir) =>
  fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(dir, path.join(entry.parentPath, entry.name)),
    );

const sourceModules = () =>
  listFiles(path.join(corePath, "src"))
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".d.ts"))
    .map((file) => file.slice(0, -3));

describe("@adobe/alloy-core npm package", () => {
  let manifest;

  beforeAll(() => {
    fs.rmSync(workPath, { recursive: true, force: true });
    fs.mkdirSync(packagePath, { recursive: true });
    // `pnpm pack` runs `prepack`, which builds dist/.
    const tarball = execFileSync(
      "pnpm",
      ["pack", "--json", "--pack-destination", workPath],
      { cwd: corePath, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
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
  }, 120_000);

  afterAll(() => {
    fs.rmSync(workPath, { recursive: true, force: true });
  });

  test("contains every file the exports map points to", () => {
    const targets = Object.values(manifest.exports)
      .flatMap((value) =>
        typeof value === "string" ? [value] : Object.values(value),
      )
      .filter((target) => !target.includes("*"));

    const missing = targets.filter(
      (target) => !fs.existsSync(path.join(packagePath, target)),
    );
    expect(missing).toEqual([]);
  });

  test("contains JavaScript and declarations for every source module", () => {
    const missing = sourceModules()
      .flatMap((name) => [`dist/${name}.js`, `dist/${name}.d.ts`])
      .filter((file) => !fs.existsSync(path.join(packagePath, file)));
    expect(missing).toEqual([]);
  });

  test("loads every public entry point in Node from the built output", () => {
    const entryPoints = Object.keys(manifest.exports)
      .filter((key) => !key.includes("*") && !key.endsWith(".json"))
      .map((key) => path.posix.join("@adobe/alloy-core", key));
    const script = `
      const entryPoints = ${JSON.stringify(entryPoints)};
      const result = {};
      for (const entryPoint of entryPoints) {
        const url = import.meta.resolve(entryPoint);
        const module = await import(entryPoint);
        result[entryPoint] = { url, exports: Object.keys(module).length };
      }
      console.log(JSON.stringify(result));
    `;
    // A separate process without the alloy-source condition, like a consumer.
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", script],
      { cwd: workPath, encoding: "utf8" },
    );
    const result = JSON.parse(output);

    for (const entryPoint of entryPoints) {
      expect(result[entryPoint].url).toContain("/alloy-core/dist/");
      expect(result[entryPoint].exports).toBeGreaterThan(0);
    }
  });

  // tsc keeps a header only when a blank line separates it from the first
  // statement. It never keeps headers in declaration files.
  test("keeps the license header at the top of every built JavaScript file", () => {
    const distPath = path.join(packagePath, "dist");
    const withoutHeader = listFiles(distPath).filter(
      (file) =>
        file.endsWith(".js") &&
        !LICENSE_HEADER.test(
          fs.readFileSync(path.join(distPath, file), "utf8"),
        ),
    );
    expect(withoutHeader).toEqual([]);
  });
});
