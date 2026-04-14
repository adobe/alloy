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

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, test } from "vitest";

const dirname = path.dirname(fileURLToPath(import.meta.url));
// createRequire is used here because Node's ESM resolver does not support
// JSON import attributes through workspace package exports maps.
const require = createRequire(import.meta.url);
const coreManifest = require("../packages/core/components.json");
const browserManifest = require("../packages/browser/components.json");

/**
 * Reads the named re-exports from an ESM barrel file of the form:
 *   export { default as name } from "...";
 * Returns the export names sorted.
 */
const readBarrelExports = (relPath) => {
  const code = fs.readFileSync(path.resolve(dirname, relPath), "utf8");
  const regex = /export\s+\{\s*default\s+as\s+([\w$]+)\s*\}/g;
  const names = [];
  let match;

  while ((match = regex.exec(code)) !== null) {
    names.push(match[1]);
  }
  return names.sort();
};

describe("components.json manifest drift detection", () => {
  describe("packages/core/components.json", () => {
    test("optional entries match core/componentCreators.js exports", () => {
      const manifestNames = coreManifest.optional.map((c) => c.name).sort();
      const barrelNames = readBarrelExports(
        "../packages/core/src/core/componentCreators.js",
      );
      expect(manifestNames).toEqual(barrelNames);
    });

    test("required entries match core/requiredComponentCreators.js exports", () => {
      const manifestNames = coreManifest.required.map((c) => c.name).sort();
      const barrelNames = readBarrelExports(
        "../packages/core/src/core/requiredComponentCreators.js",
      );
      expect(manifestNames).toEqual(barrelNames);
    });
  });

  describe("packages/browser/components.json", () => {
    test("optional entries match browser/components/componentCreators.js exports", () => {
      const manifestNames = browserManifest.optional.map((c) => c.name).sort();
      const barrelNames = readBarrelExports(
        "../packages/browser/src/components/componentCreators.js",
      );
      expect(manifestNames).toEqual(barrelNames);
    });
  });
});
