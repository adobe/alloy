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

import path from "path";
import process from "process";
import { fileURLToPath } from "url";

export const getFilename = (root = import.meta.url) => fileURLToPath(root);
export const getDirname = (root = import.meta.url) =>
  path.dirname(getFilename(root));
export const getProjectRoot = () => {
  if (process.env.npm_config_cwd) {
    return process.env.npm_config_cwd;
  }
  const dirname = getDirname(import.meta.url);
  return path.resolve(dirname, "../..");
};

export const safePathJoin = (...args) => {
  const joined = path.normalize(path.join(...args));
  const absolute = path.resolve(joined);
  if (!absolute.startsWith(getProjectRoot())) {
    throw new Error(`Path must be within project root: ${absolute}`);
  }
  return absolute;
};
