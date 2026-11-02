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

import { describe, expect, test } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// yargs <16.2.2 / <17.7.3 ship `yargs/yargs` as an extensionless CommonJS file
// inside a "type": "module" package, which Node 26 loads as ESM and crashes
// the Reactor CLIs (https://github.com/adobe/alloy/actions/runs/41498062586).
describe("Reactor CLI yargs entry points", () => {
  test.each([
    "@adobe/reactor-uploader/package.json",
    "@adobe/reactor-releaser/package.json",
    "@adobe/reactor-packager/package.json",
  ])("%s resolves yargs/yargs to a .cjs file", (cliPackageJson) => {
    const cliRequire = createRequire(require.resolve(cliPackageJson));
    expect(cliRequire.resolve("yargs/yargs")).toMatch(/\.cjs$/);
  });
});
