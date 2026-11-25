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
import semver from "semver";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
// The monorepo root isn't a dependency of core, so it can't be imported by name.
// eslint-disable-next-line import/no-relative-packages
import withBuildLock from "../../../../scripts/helpers/withBuildLock.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const corePath = path.resolve(dirname, "../..");
// Inside core's node_modules so the unpacked package resolves its dependencies.
// Unique per run so concurrent test runs don't delete each other's files.
const cachePath = path.join(corePath, "node_modules/.cache");
let workPath;
let packagePath;

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

  beforeAll(async () => {
    fs.mkdirSync(cachePath, { recursive: true });
    workPath = fs.mkdtempSync(path.join(cachePath, "package-test-"));
    packagePath = path.join(workPath, "node_modules/@adobe/alloy-core");
    fs.mkdirSync(packagePath, { recursive: true });
    // `pnpm pack` runs `prepack`, which rebuilds the shared dist/.
    const tarball = await withBuildLock(() =>
      execFileSync("pnpm", ["pack", "--json", "--pack-destination", workPath], {
        cwd: corePath,
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
    // Reuse installed third-party dependencies so runtime consumer tests work.
    for (const name of Object.keys(manifest.dependencies ?? {})) {
      const dependencyPath = path.join(workPath, "node_modules", name);
      if (!fs.existsSync(dependencyPath)) {
        fs.mkdirSync(path.dirname(dependencyPath), { recursive: true });
        fs.symlinkSync(
          fs.realpathSync(path.join(corePath, "node_modules", name)),
          dependencyPath,
          "dir",
        );
      }
    }
  }, 120_000);

  afterAll(() => {
    if (workPath) {
      fs.rmSync(workPath, { recursive: true, force: true });
    }
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

  test("has a valid semver package version", () => {
    expect(semver.valid(manifest.version)).toBe(manifest.version);
  });

  test("emits a static version module without JSON imports", () => {
    const builtVersionModule = fs.readFileSync(
      path.join(packagePath, "dist/constants/libraryVersion.js"),
      "utf8",
    );
    expect(builtVersionModule).toContain(
      `export default ${JSON.stringify(manifest.version)};`,
    );
    expect(builtVersionModule).not.toContain(".json");
  });

  test("reports real version numbers from the built package", () => {
    const script = `
      const { createInstance } = await import("@adobe/alloy-core");
      const { default: defaultLibraryVersion } = await import(
        "@adobe/alloy-core/constants/libraryVersion.js"
      );

      const createMemoryStorage = () => {
        const store = new Map();
        return {
          getItem: async (k) => store.get(k) ?? null,
          setItem: async (k, v) => { store.set(k, v); return true; },
          removeItem: async (k) => store.delete(k),
          clear: async () => { store.clear(); return true; },
        };
      };

      const createMinimalPlatformServices = (libraryVersion) => {
        const cookies = new Map();
        const cookieService = {
          get: (name) => cookies.get(name),
          getAll: () => Object.fromEntries(cookies),
          set: (name, value) => { cookies.set(name, value); return value; },
          remove: (name) => { cookies.delete(name); },
          withConverter: () => cookieService,
        };
        return {
          ...(libraryVersion !== undefined ? { libraryVersion } : {}),
          createNetworkService: () => ({
            sendFetchRequest: async () => ({
              statusCode: 200,
              body: "{}",
              getHeader: () => null,
            }),
            sendBeaconRequest: async () => ({
              statusCode: 200,
              body: "{}",
              getHeader: () => null,
            }),
          }),
          storage: {
            createNamespacedStorage: () => ({
              session: createMemoryStorage(),
              persistent: createMemoryStorage(),
            }),
          },
          cookie: cookieService,
          runtime: {
            setTimeout: globalThis.setTimeout.bind(globalThis),
            clearTimeout: globalThis.clearTimeout.bind(globalThis),
            atob: globalThis.atob.bind(globalThis),
            btoa: globalThis.btoa.bind(globalThis),
            TextEncoder: globalThis.TextEncoder,
            TextDecoder: globalThis.TextDecoder,
            now: () => Date.now(),
          },
          legacy: {
            getEcidFromVisitor: async () => undefined,
            awaitVisitorOptIn: async () => undefined,
          },
          globals: {
            getInstanceNames: () => [],
            getInstanceQueue: () => [],
            getMonitors: () => [],
            getLocationSearch: () => "",
            getLocationHash: () => "",
            getUserAgent: () => "Mozilla/5.0",
            getHostname: () => "example.com",
            getPageLocation: () => ({ host: "example.com", pathname: "/" }),
            isPageSsl: () => true,
            fireReferrerHideableImage: async () => undefined,
            getWindowContext: () => ({
              title: "Test",
              url: "https://example.com/",
              referrer: "",
              height: 800,
              width: 1200,
              scrollY: 0,
              scrollX: 0,
            }),
          },
        };
      };

      const checkVersion = async (name, expectedVersion, overrideVersion) => {
        const alloy = createInstance(
          { name },
          () => createMinimalPlatformServices(overrideVersion),
        );
        await alloy("configure", {
          orgId: name + "@AdobeOrg",
          datastreamId: name + "-datastream",
          streamingMedia: { channel: "test", playerName: "test" },
        });
        const { libraryInfo } = await alloy("getLibraryInfo");
        const tracker = await alloy("getMediaAnalyticsTracker");
        const rulesets = [
          ["sdk-version-match", expectedVersion],
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
        return {
          libraryVersion: libraryInfo.version,
          mediaVersion: tracker.version,
          rulesetPropositionIds: propositions.map(({ id }) => id),
        };
      };

      console.log(JSON.stringify({
        defaultLibraryVersion,
        defaultInstance: await checkVersion("coreDefault", ${JSON.stringify(manifest.version)}),
        customInstance: await checkVersion("coreOverride", "9.8.7", "9.8.7"),
      }));
    `;
    const output = execFileSync(
      process.execPath,
      ["--input-type=module", "--eval", script],
      { cwd: workPath, encoding: "utf8" },
    );
    const result = JSON.parse(output);

    expect(result.defaultLibraryVersion).toBe(manifest.version);
    expect(result.defaultInstance).toEqual({
      libraryVersion: manifest.version,
      mediaVersion: `WEBSDK ${manifest.version}`,
      rulesetPropositionIds: ["sdk-version-match"],
    });
    expect(result.customInstance).toEqual({
      libraryVersion: "9.8.7",
      mediaVersion: "WEBSDK 9.8.7",
      rulesetPropositionIds: ["sdk-version-match"],
    });
  });
});
