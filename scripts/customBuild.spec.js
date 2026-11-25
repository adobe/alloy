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
import { Window } from "happy-dom";
import { tmpdir } from "os";
import path from "path";
import semver from "semver";
import { describe, expect, test as baseTest } from "vitest";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "../");
const browserPackageJson = JSON.parse(
  fs.readFileSync(path.join(root, "packages/browser/package.json"), "utf8"),
);
const expectedVersion = browserPackageJson.version;

const setupBaseCode = (window, instanceName) => {
  window.__alloyNS = [instanceName];
  window[instanceName] = (...args) =>
    new Promise((resolve, reject) => {
      window[instanceName].q.push([resolve, reject, args]);
    });
  window[instanceName].q = [];
};

const collectBundleVersionInfo = async (bundleCode, instanceName) => {
  const window = new Window({ url: "https://example.com" });
  window.structuredClone = globalThis.structuredClone;
  try {
    setupBaseCode(window, instanceName);
    window.eval(bundleCode);
    const alloy = window[instanceName];

    let implementationDetails;
    await alloy("configure", {
      orgId: `${instanceName}@AdobeOrg`,
      datastreamId: `${instanceName}-datastream`,
      context: [],
      streamingMedia: { channel: "test", playerName: "test" },
      onBeforeEventSend({ xdm }) {
        implementationDetails = xdm.implementationDetails;
        return false;
      },
    });
    await alloy("sendEvent");
    const { libraryInfo } = await alloy("getLibraryInfo");
    const tracker = await alloy("getMediaAnalyticsTracker");
    const rulesets = [
      ["sdk-version-match", expectedVersion],
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
    await window.happyDOM.close();
  }
};
// Run against @adobe/alloy-core's source; see registerTsFromJsHook.js.
const buildCmd =
  "node --conditions=alloy-source --import ./scripts/helpers/registerTsFromJsHook.js packages/browser/scripts/alloyBuilder.js build";

/**
 * Run a custom alloy build and return the bundle source.
 * @param {string} outDir - Directory to write build output into (must exist).
 * @param {object} [options]
 * @param {string[]} [options.excludes] - Component names to exclude from the build.
 * @param {boolean} [options.minify] - Whether to minify the output bundle.
 * @param {AbortSignal} [options.signal] - Signal to abort the build process.
 * @returns {Promise<string>} The contents of the generated alloy.js bundle.
 */
const buildAndRead = (outDir, { excludes = [], minify = false, signal } = {}) =>
  new Promise((resolve, reject) => {
    const excludeFlag =
      excludes.length > 0 ? ` --exclude ${excludes.join(" ")}` : "";
    const minifyFlag = minify ? "" : " --no-minify";
    exec(
      `${buildCmd}${minifyFlag} -o ${outDir}${excludeFlag}`,
      { cwd: root, signal },
      (err) => {
        if (err) return reject(err);
        const fileName = minify ? "alloy.min.js" : "alloy.js";
        resolve(fs.readFileSync(path.join(outDir, fileName), "utf8"));
      },
    );
  });

const test = baseTest
  .extend(
    "buildAlloy",
    { scope: "file" },
    async ({ signal }, { onCleanup }) => {
      const outDir = fs.mkdtempSync(path.join(tmpdir(), "alloy-build-"));
      onCleanup(() => fs.rmSync(outDir, { recursive: true, force: true }));
      return ({ excludes, minify } = {}) =>
        buildAndRead(outDir, { excludes, minify, signal });
    },
  )
  .extend("defaultBundle", { scope: "file" }, async ({ buildAlloy }) => {
    return await buildAlloy({});
  })
  .extend("minifiedBundle", { scope: "file" }, async ({ buildAlloy }) => {
    return await buildAlloy({ minify: true });
  });

describe("Custom build", { timeout: 60_000 }, () => {
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
      const bundle = await buildAlloy({ excludes: ["activityCollector"] });
      expect(bundle).toBeTruthy();
      expect(bundle).not.toContain("ActivityCollector");
      expect(bundle.length).toBeLessThan(defaultBundle.length);
    });
  });

  test("produces a minified bundle", async ({
    minifiedBundle,
    defaultBundle,
  }) => {
    expect(minifiedBundle).toBeTruthy();
    expect(minifiedBundle.length).toBeLessThan(defaultBundle.length);
  });

  test("reports the real browser package version in unminified and minified custom builds", async ({
    minifiedBundle,
    defaultBundle,
  }) => {
    expect(semver.valid(expectedVersion)).toBe(expectedVersion);

    const results = await Promise.all([
      collectBundleVersionInfo(defaultBundle, "customUnminified"),
      collectBundleVersionInfo(minifiedBundle, "customMinified"),
    ]);
    results.forEach((info) => {
      expect(info).toEqual({
        implementationDetails: {
          name: "https://ns.adobe.com/experience/alloy",
          version: expectedVersion,
          environment: "browser",
        },
        libraryVersion: expectedVersion,
        mediaVersion: `WEBSDK ${expectedVersion}`,
        rulesetPropositionIds: ["sdk-version-match"],
      });
    });
  });
});

describe("Custom service worker build", { timeout: 20_000 }, () => {
  test.each([
    [false, "alloyServiceWorker.js"],
    [true, "alloyServiceWorker.min.js"],
  ])("minify=%s writes %s", async (minify, fileName) => {
    const outDir = fs.mkdtempSync(path.join(tmpdir(), "alloy-sw-build-"));
    try {
      await new Promise((resolve, reject) => {
        exec(
          `${buildCmd}-sw${minify ? " --minify" : ""} -o ${outDir}`,
          { cwd: root },
          (err) => (err ? reject(err) : resolve()),
        );
      });
      const bundle = fs.readFileSync(path.join(outDir, fileName), "utf8");
      expect(bundle).toContain("notificationclick");
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });
});
