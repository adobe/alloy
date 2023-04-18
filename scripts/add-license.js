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
const fs = require("fs");
const path = require("path");
const stagedGitFiles = require("staged-git-files");
const Handlebars = require("handlebars");

const PROJECT_ROOT = path.resolve(__dirname, "../");
const SOURCE_TEMPLATE = "source-header.handlebars";

const GIT_DELETED = "Deleted";
const SOURCE_FILE_EXTENSIONS = ["js", "ts", "cjs", "mjs"];
const IGNORE_PATTERNS = [
  /\/sandbox\//gi,
  /\/scripts\//gi,
  /launch.+\.js/gi,
  /at\.js/gi,
  /\.min\.js/gi,
  /AppMeasurement/gi
];

const walk = async (dir, matchesFilter) => {
  let files = fs.readdirSync(dir);
  files = await Promise.all(
    files
      .filter(file => matchesFilter(file, dir))
      .map(async file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          return walk(filePath, matchesFilter);
        }
        return filePath;
      })
  );

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
};

const getStagedGitFiles = async () => {
  return (await stagedGitFiles())
    .filter(detail => {
      const parts = detail.filename.split(".");
      return (
        detail.status !== GIT_DELETED &&
        parts.length > 1 &&
        SOURCE_FILE_EXTENSIONS.indexOf(parts[1]) > -1
      );
    })
    .map(detail => path.join(PROJECT_ROOT, detail.filename));
};

const getAllSourceFiles = async () => {
  const IGNORED = ["node_modules", ".git", "dist"];
  return walk(PROJECT_ROOT, (file, dir) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    for (let i = 0; i < IGNORED.length; i += 1) {
      if (filePath.includes(IGNORED[i])) {
        return false;
      }
    }

    if (stats.isDirectory()) {
      return true;
    }

    if (stats.isFile()) {
      for (let i = 0; i < SOURCE_FILE_EXTENSIONS.length; i += 1) {
        if (file.endsWith(SOURCE_FILE_EXTENSIONS[i])) {
          return true;
        }
      }
    }

    return false;
  });
};

const run = async () => {
  const stagedOnly = typeof process.env.STAGED_ONLY !== "undefined";

  const template = fs.readFileSync(
    path.resolve(__dirname, SOURCE_TEMPLATE),
    "utf-8"
  );

  const renderTemplate = Handlebars.compile(template);

  const templateText = renderTemplate({
    year: new Date().getFullYear()
  });

  const sourceFiles = stagedOnly
    ? await getStagedGitFiles()
    : await getAllSourceFiles();

  sourceFiles
    .filter(file => IGNORE_PATTERNS.every(pattern => !file.match(pattern)))
    .forEach(file => {
      const contents = fs.readFileSync(path.resolve(file), "utf-8");
      if (templateText.slice(0, 2) !== contents.slice(0, 2)) {
        fs.writeFileSync(path.resolve(file), `${templateText}${contents}`);
      }
    });
};

run();
