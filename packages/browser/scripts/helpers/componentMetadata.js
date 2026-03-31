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

import {
  optionalComponentNames as coreOptional,
  requiredComponentNames,
} from "@adobe/alloy-core/componentMetadata.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const browserSrcDir = path.resolve(dirname, "../../src");

const readComponentNames = (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");
  const exportRegex = /export\s+\{\s*default\s+as\s+([\w$]+)\s*\}/g;
  const names = [];
  let match;
  while ((match = exportRegex.exec(code)) !== null) names.push(match[1]);
  return Object.freeze(names);
};

const browserOptional = readComponentNames(
  path.resolve(browserSrcDir, "components/componentCreators.js"),
);
export const optionalComponentNames = Object.freeze([
  ...coreOptional,
  ...browserOptional,
]);
export { requiredComponentNames };
