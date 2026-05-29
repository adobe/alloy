#!/usr/bin/env node
/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Restores the `@adobe/alloy` dependency to `workspace:*` after a version bump.
 *
 * `changeset version` (and `npm version`) rewrites workspace protocol references
 * to their resolved semver versions. Because reactor-extension is a private package
 * that is never published to npm, it must keep `@adobe/alloy` as `workspace:*` so
 * pnpm can resolve it locally. This script runs automatically via the `postversion`
 * lifecycle hook and undoes that rewrite.
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, "../package.json");

const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

if (pkg.dependencies?.["@adobe/alloy"]) {
  pkg.dependencies["@adobe/alloy"] = "workspace:*";
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("postversion: restored @adobe/alloy to workspace:*");
}
