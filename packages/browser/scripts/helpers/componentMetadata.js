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

import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  optionalComponentNames as coreOptional,
  requiredComponentNames,
} from "@adobe/alloy-core/componentMetadata.js";

const browserManifest = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../components.json"),
    "utf8",
  ),
);

const browserOptional = browserManifest.optional.map((c) => c.name);

export const optionalComponentNames = Object.freeze([
  ...new Set([...coreOptional, ...browserOptional]),
]);

export { requiredComponentNames };
