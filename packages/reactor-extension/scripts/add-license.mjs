#!/usr/bin/env node

/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { performance } from "perf_hooks";
import stagedGitFiles from "staged-git-files";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../");
const COMPARISON_LENGTH = `/*
Copyright`.length;

const GIT_DELETED = "Deleted";
const SOURCE_FILE_EXTENSIONS = ["js", "jsx", "ts", "tsx", "cjs", "mjs"];
const IGNORE_PATTERNS = [
  /\/scripts\//gi,
  /\/\.parcel-cache\//gi,
  /\/\.sandbox\//gi,
  /\/componentFixtureDist\//gi,
];

const createLicenseText = (year) => `/*
Copyright ${year} Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
`;

const walk = async (dir, matchesFilter) => {
  let files = await fsPromises.readdir(dir);
  files = await Promise.all(
    files
      .filter((file) => matchesFilter(file, dir))
      .map(async (file) => {
        const filePath = path.join(dir, file);
        const stats = await fsPromises.stat(filePath);
        if (stats.isDirectory()) {
          return walk(filePath, matchesFilter);
        }
        return filePath;
      }),
  );

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
};

const getStagedGitFiles = async () => {
  return (await stagedGitFiles())
    .filter((detail) => {
      const parts = detail.filename.split(".");
      return (
        detail.status !== GIT_DELETED &&
        parts.length > 1 &&
        SOURCE_FILE_EXTENSIONS.includes(parts[1])
      );
    })
    .map((detail) => path.join(PROJECT_ROOT, detail.filename));
};

const getAllSourceFiles = () => {
  const IGNORED = ["node_modules", ".git", "dist"];
  return walk(PROJECT_ROOT, (file, dir) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (IGNORED.some((ignoredFile) => filePath.includes(ignoredFile))) {
      return false;
    }

    if (stats.isDirectory()) {
      return true;
    }

    if (
      stats.isFile() &&
      SOURCE_FILE_EXTENSIONS.some((ext) => file.endsWith(ext))
    ) {
      return true;
    }
    return false;
  });
};

const run = async () => {
  const startTime = performance.now();
  const stagedOnly = typeof process.env.STAGED_ONLY !== "undefined";

  const templateText = createLicenseText(new Date().getFullYear());

  const sourceFiles = stagedOnly
    ? await getStagedGitFiles()
    : await getAllSourceFiles();

  const filesInspected = await Promise.all(
    sourceFiles
      .filter((file) =>
        IGNORE_PATTERNS.every((pattern) => !file.match(pattern)),
      )
      .map(async (file) => {
        const contents = await fsPromises.readFile(path.resolve(file), "utf-8");
        if (
          templateText.slice(0, COMPARISON_LENGTH) !==
          contents.slice(0, COMPARISON_LENGTH)
        ) {
          await fsPromises.writeFile(
            path.resolve(file),
            `${templateText}${contents}`,
          );
          return true;
        }
        return false;
      }),
  );
  const alteredFileCount = filesInspected.filter(Boolean).length;

  const runTime = performance.now() - startTime;
  // eslint-disable-next-line no-console
  console.log(
    `✨ Added license to ${alteredFileCount} of ${filesInspected.length} ${
      stagedOnly ? "staged " : ""
    }files in ${runTime}ms.`,
  );
};

await run();
