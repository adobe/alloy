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

// Packs @adobe/alloy-core and @adobe/alloy-node as `npm publish` would and
// exercises the real Node consumer entry point without workspace source
// conditions.
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import semver from "semver";
import { fileURLToPath } from "url";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
// eslint-disable-next-line import/no-relative-packages
import withBuildLock from "../../../../scripts/helpers/withBuildLock.js";

const nodePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const cachePath = path.join(nodePath, "node_modules/.cache");

describe("@adobe/alloy-node npm package", () => {
  let workPath;
  let manifest;
  let result;

  beforeAll(async () => {
    fs.mkdirSync(cachePath, { recursive: true });
    workPath = fs.mkdtempSync(path.join(cachePath, "package-test-"));

    await withBuildLock(() => {
      for (const packageDir of ["core", "node"]) {
        const sourcePath = path.resolve(nodePath, "..", packageDir);
        // Skip core's prepack when dist/ is already built (core/package tests
        // core's prepack directly, and CI runs `pnpm run build` beforehand).
        const skipPrepack =
          packageDir === "core" && fs.existsSync(path.join(sourcePath, "dist"));
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
          packageDir === "core" ? "@adobe/alloy-core" : "@adobe/alloy-node";
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
        // Reuse installed third-party dependencies, never workspace SDK sources.
        for (const name of Object.keys(packageManifest.dependencies ?? {})) {
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
    });

    manifest = JSON.parse(
      fs.readFileSync(
        path.join(workPath, "node_modules/@adobe/alloy-node/package.json"),
        "utf8",
      ),
    );

    const script = `
      const { createInstance, createCustomInstance } = await import("@adobe/alloy-node");

      const fakeNetwork = () => ({
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
      });

      const exerciseInstance = async (name, createFn) => {
        let topLevelDetails;
        const alloy = createFn({
          name,
          platformServices: { network: fakeNetwork },
        });
        await alloy.configure({
          orgId: name + "@AdobeOrg",
          datastreamId: name + "-datastream",
          edgeCredentials: {
            clientId: "test-client",
            clientSecret: "test-secret",
            scopes: ["openid"],
          },
          onBeforeEventSend({ xdm }) {
            topLevelDetails = xdm.implementationDetails;
            return false;
          },
        });
        await alloy.sendEvent();
        const { libraryInfo: topLevelLibraryInfo } = await alloy.getLibraryInfo();

        const reqAlloy = alloy.forRequest({
          request: { headers: { referer: "https://example.com/" } },
        });
        const { libraryInfo: forRequestLibraryInfo } = await reqAlloy.getLibraryInfo();
        let forRequestDetails;
        await reqAlloy.sendEvent({
          // Override nothing; configure's onBeforeEventSend captures xdm
          // before returning false.
        });
        forRequestDetails = topLevelDetails;

        return {
          topLevel: {
            implementationDetails: topLevelDetails,
            libraryVersion: topLevelLibraryInfo.version,
          },
          forRequest: {
            implementationDetails: forRequestDetails,
            libraryVersion: forRequestLibraryInfo.version,
          },
        };
      };

      console.log(JSON.stringify({
        createInstance: await exerciseInstance("nodeInstance", createInstance),
        createCustomInstance: await exerciseInstance("nodeCustom", createCustomInstance),
      }));
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

  test("has a valid semver package version", () => {
    expect(semver.valid(manifest.version)).toBe(manifest.version);
  });

  describe.each(["createInstance", "createCustomInstance"])("%s", (name) => {
    describe.each(["topLevel", "forRequest"])("%s", (mode) => {
      test("uses the node package version in XDM implementationDetails", () => {
        expect(result[name][mode].implementationDetails).toEqual({
          name: "https://ns.adobe.com/experience/alloy-node",
          version: manifest.version,
          environment: "server",
        });
      });

      test("reports the node package version in getLibraryInfo", () => {
        expect(result[name][mode].libraryVersion).toBe(manifest.version);
      });
    });
  });
});
