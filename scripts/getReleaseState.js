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

import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export const getReleaseState = (rootDir = process.cwd()) => {
  const changesetDir = path.join(rootDir, ".changeset");
  const prePath = path.join(changesetDir, "pre.json");
  const pre = fs.existsSync(prePath)
    ? JSON.parse(fs.readFileSync(prePath, "utf8"))
    : undefined;

  if (pre && !["pre", "exit"].includes(pre.mode)) {
    throw new Error(`Unexpected prerelease mode: ${pre.mode}`);
  }

  const hasQueuedChangesets = fs
    .readdirSync(changesetDir, { withFileTypes: true })
    .some(
      (file) =>
        file.isFile() &&
        !file.name.startsWith(".") &&
        file.name.endsWith(".md") &&
        !/^readme\.md$/i.test(file.name) &&
        !["AGENTS.md", "CLAUDE.md", "GEMINI.md"].includes(file.name),
    );

  return {
    proceed: hasQueuedChangesets || pre?.mode === "exit",
    environment: pre?.mode === "pre" ? "Beta" : "Production",
  };
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  for (const [name, value] of Object.entries(getReleaseState())) {
    console.log(`${name}=${value}`);
  }
}
