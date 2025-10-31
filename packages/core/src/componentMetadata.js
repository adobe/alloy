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
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const readComponentNames = (relativePath) => {
  const absolutePath = path.resolve(dirname, relativePath);
  const code = fs.readFileSync(absolutePath, "utf8");
  const exportRegex = /export\s+\{\s*default\s+as\s+([\w$]+)\s*\}/g;
  const names = [];
  let match;
  while ((match = exportRegex.exec(code)) !== null) {
    names.push(match[1]);
  }
  return Object.freeze(names);
};

export const optionalComponentNames = readComponentNames(
  "./core/componentCreators.js",
);

export const requiredComponentNames = readComponentNames(
  "./core/requiredComponentCreators.js",
);

export const getComponentMetadata = () => ({
  optional: optionalComponentNames,
  required: requiredComponentNames,
});
