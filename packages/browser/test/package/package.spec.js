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
          const output = execFileSync(
            "pnpm",
            ["pack", "--json", "--pack-destination", workPath],
            {
              cwd: sourcePath,
              encoding: "utf8",
              stdio: ["ignore", "pipe", "pipe"],
            },
          );
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
      import { Window } from "happy-dom";
      const window = new Window({ url: "https://example.com" });
      globalThis.window = window;
      globalThis.document = window.document;
      Object.defineProperty(globalThis, "navigator", { value: window.navigator });

      const { createInstance, createCustomInstance } = await import("@adobe/alloy");
      const { default: setupBaseCode } = await import("@adobe/alloy/baseCode.js");
      setupBaseCode(window, ["standalone"]);
      await import("@adobe/alloy/standalone.js");

      const instances = {
        createInstance: createInstance(),
        createCustomInstance: createCustomInstance(),
        standalone: window.standalone,
      };
      const results = {};
      for (const [name, alloy] of Object.entries(instances)) {
        let implementationDetails;
        await alloy("configure", {
          orgId: name + "@AdobeOrg",
          datastreamId: name + "-datastream",
          context: [],
          ...(name === "createCustomInstance" ? {} : {
            streamingMedia: { channel: "test", playerName: "test" },
          }),
          onBeforeEventSend({ xdm }) {
            implementationDetails = xdm.implementationDetails;
            return false;
          },
        });
        await alloy("sendEvent");
        const { libraryInfo } = await alloy("getLibraryInfo");
        results[name] = { implementationDetails, libraryInfo };
        if (name !== "createCustomInstance") {
          const tracker = await alloy("getMediaAnalyticsTracker");
          results[name].mediaVersion = tracker.version;
        }
      }
      console.log(JSON.stringify(results));
      await window.happyDOM.close();
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

  describe.each(["createInstance", "createCustomInstance", "standalone"])(
    "%s",
    (name) => {
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
      }
    },
  );
});
