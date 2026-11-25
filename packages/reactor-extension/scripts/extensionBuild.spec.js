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
import { Window } from "happy-dom";
import { createRequire } from "module";
import os from "os";
import path from "path";
import semver from "semver";
import { fileURLToPath } from "url";
import { promisify } from "util";
import vm from "vm";
import AdmZip from "adm-zip";
import { describe, expect, test as baseTest } from "vitest";

import {
  createExtensionPackage,
  getPackageJson,
} from "./createExtensionPackage.mjs";

const execAsync = promisify(exec);
const dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPackageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, "../package.json"), "utf8"),
);
const browserPackageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, "../../browser/package.json"), "utf8"),
);
const expectedExtensionVersion = extensionPackageJson.version;
const expectedAlloyVersion = browserPackageJson.version;

/**
 * Load the packaged CommonJS `dist/lib/instanceManager/index.js` together with
 * a specific `alloy.js` bundle inside a happy-dom browser realm (mirroring how
 * Adobe Tags / Turbine executes extension delegates) and inspect the versions
 * reported across getLibraryInfo, implementationDetails, media tracker, and
 * RulesEngine.
 *
 * @param {string} forgeDir - Extracted extension directory.
 * @param {string} alloyBundleCode - Contents of `dist/lib/alloy.js` to load.
 * @param {string} instanceName - Alloy instance name to configure.
 */
const collectExtensionVersionInfo = async (
  forgeDir,
  alloyBundleCode,
  instanceName,
) => {
  const window = new Window({ url: "https://example.com" });
  try {
    let implementationDetails;
    const turbine = {
      getExtensionSettings: () => ({
        instances: [
          {
            name: instanceName,
            edgeConfigId: `${instanceName}-datastream`,
            orgId: `${instanceName}@AdobeOrg`,
            context: [],
            streamingMedia: { channel: "test", playerName: "test" },
            onBeforeEventSend({ xdm }) {
              implementationDetails = xdm.implementationDetails;
              return false;
            },
          },
        ],
      }),
      environment: { stage: "production" },
      debugEnabled: false,
      onDebugChanged: () => {},
    };

    const libDir = path.join(forgeDir, "dist/lib");
    const forgeRequire = createRequire(path.join(forgeDir, "package.json"));
    const moduleCache = new Map();
    const resolveCjsPath = (fromDir, request) => {
      const base = path.resolve(fromDir, request);
      if (fs.existsSync(base) && fs.statSync(base).isFile()) {
        return base;
      }
      if (fs.existsSync(`${base}.js`)) {
        return `${base}.js`;
      }
      if (fs.existsSync(path.join(base, "index.js"))) {
        return path.join(base, "index.js");
      }
      throw new Error(`Cannot resolve ${request} from ${fromDir}`);
    };

    const loadCjs = (filePath, codeOverride) => {
      const normalized = path.resolve(filePath);
      if (moduleCache.has(normalized)) {
        return moduleCache.get(normalized).exports;
      }
      const mod = { exports: {} };
      moduleCache.set(normalized, mod);
      const code = codeOverride ?? fs.readFileSync(normalized, "utf8");
      const localDir = path.dirname(normalized);
      const localRequire = (req) => {
        if (!req.startsWith(".")) {
          return forgeRequire(req);
        }
        const resolved = resolveCjsPath(localDir, req);
        if (resolved === path.join(libDir, "alloy.js")) {
          return loadCjs(resolved, alloyBundleCode);
        }
        return loadCjs(resolved);
      };
      const wrapper = vm.runInThisContext(
        `(function(exports, require, module, window, document, navigator, turbine, _satellite) {\n${code}\n})`,
        { filename: normalized },
      );
      wrapper(
        mod.exports,
        localRequire,
        mod,
        window,
        window.document,
        window.navigator,
        turbine,
        { company: { orgId: `${instanceName}@AdobeOrg` } },
      );
      return mod.exports;
    };

    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    const previousNavigator = Object.getOwnPropertyDescriptor(
      globalThis,
      "navigator",
    );
    globalThis.window = window;
    globalThis.document = window.document;
    Object.defineProperty(globalThis, "navigator", {
      value: window.navigator,
      configurable: true,
    });
    try {
      const instanceManager = loadCjs(
        path.join(libDir, "instanceManager/index.js"),
      );
      const alloy = instanceManager.getInstance(instanceName);
      await alloy("sendEvent");
      const { libraryInfo } = await alloy("getLibraryInfo");
      const tracker = await alloy("getMediaAnalyticsTracker");
      const rulesets = [
        ["sdk-version-match", expectedAlloyVersion],
        ["sdk-version-other", "0.0.0-mismatch"],
      ].map(([id, version]) => ({
        id,
        scope: "web://example.com",
        scopeDetails: { activity: { id } },
        items: [
          {
            id: `${id}-ruleset`,
            schema: "https://ns.adobe.com/personalization/ruleset-item",
            data: {
              version: 1,
              rules: [
                {
                  condition: {
                    type: "matcher",
                    definition: {
                      key: "~sdkver",
                      matcher: "eq",
                      values: [version],
                    },
                  },
                  consequences: [
                    {
                      id: `${id}-consequence`,
                      type: "schema",
                      detail: {
                        schema:
                          "https://ns.adobe.com/personalization/json-content-item",
                        data: { content: { id } },
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      }));
      await alloy("applyResponse", {
        renderDecisions: false,
        responseBody: {
          handle: [{ type: "personalization:decisions", payload: rulesets }],
        },
      });
      const { propositions } = await alloy("evaluateRulesets");

      return {
        implementationDetails,
        libraryVersion: libraryInfo.version,
        mediaVersion: tracker.version,
        rulesetPropositionIds: propositions.map(({ id }) => id),
      };
    } finally {
      globalThis.window = previousWindow;
      globalThis.document = previousDocument;
      if (previousNavigator) {
        Object.defineProperty(globalThis, "navigator", previousNavigator);
      }
    }
  } finally {
    await window.happyDOM.close();
  }
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
    // Own output dir so a concurrent run can't overwrite the zip mid-read.
    const outputDir = fs.mkdtempSync(
      path.join(os.tmpdir(), "extension-package-"),
    );
    onCleanup(() => fs.rmSync(outputDir, { recursive: true, force: true }));
    return createExtensionPackage({ outputDir });
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
  .extend("prebuiltBundle", { scope: "file" }, async ({ extensionPackage }) => {
    const zip = new AdmZip(extensionPackage);
    return zip.readAsText("dist/lib/alloy.js");
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

      test("no package.json in the installed forge tree uses the workspace: protocol", ({
        forgeDir,
      }) => {
        // npm installs the root package's devDependencies but never a nested
        // dependency's, so a nested workspace:* devDependency can't break forge.
        const ROOT_FIELDS = [
          "dependencies",
          "devDependencies",
          "optionalDependencies",
          "peerDependencies",
        ];
        const NESTED_FIELDS = [
          "dependencies",
          "optionalDependencies",
          "peerDependencies",
        ];

        const collectManifests = (dir, found = []) => {
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (entry.isDirectory()) {
              collectManifests(path.join(dir, entry.name), found);
            } else if (entry.name === "package.json") {
              found.push(path.join(dir, entry.name));
            }
          }
          return found;
        };

        const offenders = [];
        for (const file of collectManifests(forgeDir)) {
          const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
          const fields =
            path.dirname(file) === forgeDir ? ROOT_FIELDS : NESTED_FIELDS;
          for (const field of fields) {
            for (const [name, range] of Object.entries(pkg[field] ?? {})) {
              if (String(range).startsWith("workspace:")) {
                offenders.push(
                  `${path.relative(forgeDir, file)} (${field}.${name})`,
                );
              }
            }
          }
        }

        expect(offenders).toEqual([]);
      });

      test("sets a valid semver version in extension.json matching package.json", ({
        forgeDir,
      }) => {
        expect(semver.valid(expectedExtensionVersion)).toBe(
          expectedExtensionVersion,
        );
        expect(semver.valid(expectedAlloyVersion)).toBe(expectedAlloyVersion);
        const manifest = JSON.parse(
          fs.readFileSync(path.join(forgeDir, "extension.json"), "utf8"),
        );
        expect(manifest.version).toBe(expectedExtensionVersion);
      });

      test("reports real Alloy and extension versions from the prebuilt zip bundle", async ({
        forgeDir,
        prebuiltBundle,
      }) => {
        const info = await collectExtensionVersionInfo(
          forgeDir,
          prebuiltBundle,
          "extensionPrebuilt",
        );
        expect(info).toEqual({
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy/reactor",
            version: `${expectedAlloyVersion}+${expectedExtensionVersion}`,
            environment: "browser",
          },
          libraryVersion: expectedAlloyVersion,
          mediaVersion: `WEBSDK ${expectedAlloyVersion}`,
          rulesetPropositionIds: ["sdk-version-match"],
        });
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

      test("reports real Alloy and extension versions in the Forge-rebuilt bundle", async ({
        forgeDir,
        defaultBundle,
      }) => {
        const info = await collectExtensionVersionInfo(
          forgeDir,
          defaultBundle,
          "extensionForge",
        );
        expect(info).toEqual({
          implementationDetails: {
            name: "https://ns.adobe.com/experience/alloy/reactor",
            version: `${expectedAlloyVersion}+${expectedExtensionVersion}`,
            environment: "browser",
          },
          libraryVersion: expectedAlloyVersion,
          mediaVersion: `WEBSDK ${expectedAlloyVersion}`,
          rulesetPropositionIds: ["sdk-version-match"],
        });
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
