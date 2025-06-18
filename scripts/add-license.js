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
import stagedGitFiles from "staged-git-files";
import { getDirname, getProjectRoot, safePathJoin } from "./helpers/path.js";

const dirname = getDirname(import.meta.url);

const PROJECT_ROOT = getProjectRoot();


const GIT_DELETED = "Deleted";
const SOURCE_FILE_EXTENSIONS = ["js", "ts", "cjs", "mjs"];
const IGNORE_PATTERNS = [
  /\/sandbox\//gi,
  /\/scripts\//gi,
  /launch.+\.js/gi,
  /at\.js/gi,
  /\.min\.js/gi,
  /AppMeasurement/gi,
];

const walk = async (dir, matchesFilter) => {
  let files = fs.readdirSync(dir);
  files = await Promise.all(
    files
      .filter((file) => matchesFilter(file, dir))
      .map(async (file) => {
        const filePath = safePathJoin(dir, file);
        const stats = fs.statSync(filePath);
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
        SOURCE_FILE_EXTENSIONS.indexOf(parts[1]) > -1
      );
    })
    .map((detail) => safePathJoin(PROJECT_ROOT, detail.filename));
};

const getAllSourceFiles = async () => {
  const IGNORED = ["node_modules", ".git", "dist"];
  return walk(PROJECT_ROOT, (file, dir) => {
    const filePath = safePathJoin(dir, file);
    const stats = fs.statSync(filePath);

    if (IGNORE_PATTERNS.some((pattern) => filePath.match(pattern))) {
      return false;
    }

    if (stats.isDirectory()) {
      return true;
    }

    if (stats.isFile() && SOURCE_FILE_EXTENSIONS.some((extension) => file.endsWith(extension))) {
      return true;
    }

    return false;
  });
};

const run = async () => {
  const stagedOnly = typeof process.env.STAGED_ONLY !== "undefined";

  const template = `/*${fs.readFileSync(
    safePathJoin(dirname, "..", "LICENSE_BANNER"),
    "utf-8",
  )}*/`;
  console.log("✅ Retreived license banner.")

  const sourceFiles = stagedOnly
    ? await getStagedGitFiles()
    : await getAllSourceFiles();

  console.log(`✅ Retreived ${sourceFiles.length} source files.`)

  sourceFiles
    .filter((file) => IGNORE_PATTERNS.every((pattern) => !file.match(pattern)))
    .forEach((file) => {
      const contents = fs.readFileSync(safePathJoin(file), "utf-8");

      if (template.slice(0, 2) !== contents.slice(0, 2)) {
        console.log(`✏️ [${file}] Added license banner.`)
        fs.writeFileSync(safePathJoin(file), `${template}${contents}`);
      } else {
        console.log(`✅ [${file}] License banner already exists.`)
      }
    });

  console.log("✅ Added license banner to source files.")
};

run();
