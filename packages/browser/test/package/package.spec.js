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

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";
import semver from "semver";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
// eslint-disable-next-line import/no-relative-packages
import withBuildLock from "../../../../scripts/helpers/withBuildLock.js";

const browserPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const cachePath = path.join(browserPath, "node_modules/.cache");

describe("@adobe/alloy npm package", () => {
  let workPath;
  let manifest;
  let result;

  beforeAll(async () => {
    fs.mkdirSync(cachePath, { recursive: true });
    workPath = fs.mkdtempSync(path.join(cachePath, "package-test-"));

    await withBuildLock(() => {
      const bundleSizePath = path.join(browserPath, "bundlesize.json");
      const bundleSize = fs.readFileSync(bundleSizePath);
      try {
        for (const packageDir of ["core", "browser"]) {
          const sourcePath = path.resolve(browserPath, "..", packageDir);
          // Skip core's prepack when dist/ is already built (core/package tests
          // core's prepack directly, and CI runs `pnpm run build` beforehand).
          const skipPrepack =
            packageDir === "core" &&
            fs.existsSync(path.join(sourcePath, "dist"));
          const packArgs = [
            "pack",
            "--json",
            "--pack-destination",
            workPath,
            ...(skipPrepack ? ["--config.ignore-scripts=true"] : []),
          ];
          const output = execFileSync("pnpm", packArgs, {
            cwd: sourcePath,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          });
          const { filename } = JSON.parse(output.slice(output.indexOf("{")));
          const packageName =
            packageDir === "core" ? "@adobe/alloy-core" : "@adobe/alloy";
          const packagePath = path.join(workPath, "node_modules", packageName);
          fs.mkdirSync(packagePath, { recursive: true });
          execFileSync("tar", [
            "-xzf",
            path.resolve(workPath, filename),
            "-C",
            packagePath,
            "--strip-components=1",
          ]);
          const packageManifest = JSON.parse(
            fs.readFileSync(path.join(packagePath, "package.json"), "utf8"),
          );
          // Reuse installed third-party dependencies, but never workspace SDK sources.
          for (const name of Object.keys(packageManifest.dependencies)) {
            const dependencyPath = path.join(workPath, "node_modules", name);
            if (!fs.existsSync(dependencyPath)) {
              fs.mkdirSync(path.dirname(dependencyPath), { recursive: true });
              fs.symlinkSync(
                fs.realpathSync(path.join(sourcePath, "node_modules", name)),
                dependencyPath,
                "dir",
              );
            }
          }
        }
      } finally {
        // Packing regenerates this tracked report, but package tests must not change it.
        fs.writeFileSync(bundleSizePath, bundleSize);
      }
    });

    manifest = JSON.parse(
      fs.readFileSync(
        path.join(workPath, "node_modules/@adobe/alloy/package.json"),
        "utf8",
      ),
    );
    // A consumer has neither the alloy-source condition nor our version-replacement plugin.
    const script = `
      import fs from "fs";
      import path from "path";
      import { Window } from "happy-dom";

      const collectVersionInfo = async (alloy, name, { includeOptional = true } = {}) => {
        let implementationDetails;
        await alloy("configure", {
          orgId: name + "@AdobeOrg",
          datastreamId: name + "-datastream",
          context: [],
          ...(includeOptional ? {
            streamingMedia: { channel: "test", playerName: "test" },
          } : {}),
          onBeforeEventSend({ xdm }) {
            implementationDetails = xdm.implementationDetails;
            return false;
          },
        });
        await alloy("sendEvent");
        const { libraryInfo } = await alloy("getLibraryInfo");
        const entry = { implementationDetails, libraryInfo };
        if (includeOptional) {
          const tracker = await alloy("getMediaAnalyticsTracker");
          entry.mediaVersion = tracker.version;
          const rulesets = [
            ["sdk-version-match", ${JSON.stringify(manifest.version)}],
            ["sdk-version-other", "0.0.0-mismatch"],
          ].map(([id, version]) => ({
            id,
            scope: "web://example.com",
            scopeDetails: { activity: { id } },
            items: [{
              id: id + "-ruleset",
              schema: "https://ns.adobe.com/personalization/ruleset-item",
              data: {
                version: 1,
                rules: [{
                  condition: {
                    type: "matcher",
                    definition: { key: "~sdkver", matcher: "eq", values: [version] },
                  },
                  consequences: [{
                    id: id + "-consequence",
                    type: "schema",
                    detail: {
                      schema: "https://ns.adobe.com/personalization/json-content-item",
                      data: { content: { id } },
                    },
                  }],
                }],
              },
            }],
          }));
          await alloy("applyResponse", {
            renderDecisions: false,
            responseBody: {
              handle: [{ type: "personalization:decisions", payload: rulesets }],
            },
          });
          const { propositions } = await alloy("evaluateRulesets");
          entry.rulesetPropositionIds = propositions.map(({ id }) => id);
        }
        return entry;
      };

      const window = new Window({ url: "https://example.com" });
      globalThis.window = window;
      globalThis.document = window.document;
      Object.defineProperty(globalThis, "navigator", { value: window.navigator, configurable: true });

      const { createInstance, createCustomInstance } = await import("@adobe/alloy");
      const { default: setupBaseCode } = await import("@adobe/alloy/baseCode.js");
      setupBaseCode(window, ["standalone"]);
      await import("@adobe/alloy/standalone.js");

      const results = {
        createInstance: await collectVersionInfo(createInstance(), "createInstance"),
        createCustomInstance: await collectVersionInfo(
          createCustomInstance(),
          "createCustomInstance",
          { includeOptional: false },
        ),
        standalone: await collectVersionInfo(window.standalone, "standalone"),
      };
      await window.happyDOM.close();

      // Also execute the built CDN IIFE bundles (unminified and minified).
      const alloyDistDir = path.join(process.cwd(), "node_modules/@adobe/alloy/dist");
      for (const [key, filename] of [
        ["cdn", "alloy.js"],
        ["cdnMin", "alloy.min.js"],
      ]) {
        const cdnWindow = new Window({ url: "https://example.com" });
        cdnWindow.structuredClone = globalThis.structuredClone;
        setupBaseCode(cdnWindow, [key]);
        cdnWindow.eval(fs.readFileSync(path.join(alloyDistDir, filename), "utf8"));
        results[key] = await collectVersionInfo(cdnWindow[key], key);
        await cdnWindow.happyDOM.close();
      }

      console.log(JSON.stringify(results));
    `;
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", script],
      { cwd: workPath, encoding: "utf8" },
    );
    result = JSON.parse(output);
  }, 120_000);

  afterAll(() => {
    if (workPath) {
      fs.rmSync(workPath, { recursive: true, force: true });
    }
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
    const packagePath = path.join(workPath, "node_modules/@adobe/alloy");
    const targets = Object.values(manifest.exports).flatMap((value) =>
      typeof value === "string" ? [value] : Object.values(value),
    );
    const missing = targets.filter(
      (target) => !fs.existsSync(path.join(packagePath, target)),
    );
    expect(missing).toEqual([]);
  });

  describe("compiles a strict TypeScript consumer", () => {
    let consumerPath;

    beforeAll(() => {
      consumerPath = path.join(workPath, "consumer");
      fs.cpSync(
        path.join(path.dirname(fileURLToPath(import.meta.url)), "consumer"),
        consumerPath,
        { recursive: true },
      );
      fs.writeFileSync(
        path.join(consumerPath, "package.json"),
        JSON.stringify({ type: "module" }),
      );
    });

    test.each([
      ["Bundler", { module: "ESNext", moduleResolution: "Bundler" }],
      ["NodeNext", { module: "NodeNext", moduleResolution: "NodeNext" }],
      [
        "Bundler with the alloy-source condition",
        {
          module: "ESNext",
          moduleResolution: "Bundler",
          customConditions: ["alloy-source"],
        },
      ],
    ])("with %s resolution", (name, resolutionOptions) => {
      const tsconfigPath = path.join(
        consumerPath,
        `tsconfig.${name.replace(/\W+/g, "-")}.json`,
      );
      fs.writeFileSync(
        tsconfigPath,
        JSON.stringify({
          compilerOptions: {
            ...resolutionOptions,
            strict: true,
            skipLibCheck: false,
            noEmit: true,
            target: "ES2022",
            lib: ["ES2022", "DOM", "DOM.Iterable"],
            types: [],
          },
          include: ["*.ts"],
        }),
      );
      const result = (() => {
        try {
          execFileSync("pnpm", ["exec", "tsc", "-p", tsconfigPath], {
            cwd: browserPath,
            encoding: "utf8",
            stdio: "pipe",
          });
          return "";
        } catch (error) {
          return `${error.stdout}${error.stderr}`;
        }
      })();
      expect(result).toBe("");
    });
  });

  test("has a valid semver package version", () => {
    expect(semver.valid(manifest.version)).toBe(manifest.version);
  });

  test("bundles with plain Rollup without @rollup/plugin-json", async () => {
    const entryPath = path.join(workPath, "rollup-consumer-entry.js");
    fs.writeFileSync(
      entryPath,
      [
        'export { createInstance, createCustomInstance } from "@adobe/alloy";',
        'import "@adobe/alloy/standalone.js";',
      ].join("\n"),
    );
    const bundle = await rollup({
      input: entryPath,
      plugins: [
        resolve({
          browser: true,
          mainFields: ["module", "main", "browser"],
          rootDir: workPath,
        }),
        commonjs(),
      ],
    });
    try {
      const { output } = await bundle.generate({ format: "es" });
      expect(output[0].code).toContain(manifest.version);
    } finally {
      await bundle.close();
    }
  });

  describe.each([
    "createInstance",
    "createCustomInstance",
    "standalone",
    "cdn",
    "cdnMin",
  ])("%s", (name) => {
    test("uses the browser package version in XDM implementationDetails", () => {
      expect(result[name].implementationDetails).toEqual({
        name: "https://ns.adobe.com/experience/alloy",
        version: manifest.version,
        environment: "browser",
      });
    });

    test("reports the browser package version in getLibraryInfo", () => {
      expect(result[name].libraryInfo.version).toBe(manifest.version);
    });

    if (name !== "createCustomInstance") {
      test("uses the browser package version in the media tracker", () => {
        expect(result[name].mediaVersion).toBe(`WEBSDK ${manifest.version}`);
      });

      test("uses the browser package version for RulesEngine ~sdkver", () => {
        expect(result[name].rulesetPropositionIds).toEqual([
          "sdk-version-match",
        ]);
      });
    }
  });
});
