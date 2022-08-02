/*
Copyright 2022 Adobe. All rights reserved.
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
const Handlebars = require("handlebars");

const SOURCE_TEMPLATE = "source-header.handlebars";

async function walk(dir, matchesFilter) {
  let files = fs.readdirSync(dir);
  files = await Promise.all(
    files
      .filter((file) => matchesFilter(file, dir))
      .map(async (file) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          return walk(filePath, matchesFilter);
        } else if (stats.isFile()) {
          return filePath;
        }
      })
  );

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

async function run() {
  const template = fs.readFileSync(
    path.resolve(__dirname, ".assets", SOURCE_TEMPLATE),
    "utf-8"
  );

  const renderTemplate = Handlebars.compile(template);

  const templateText = renderTemplate({
    year: new Date().getFullYear(),
  });

  const IGNORED = [
    "node_modules",
    ".git",
    "alloy.js",
    "alloy.min.js",
    "at.js",
    "at.min.js",
  ];
  const sourceFiles = await walk(path.resolve(__dirname), (file, dir) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    for (const ignoredString of IGNORED) {
      if (filePath.includes(ignoredString)) {
        return false;
      }
    }

    if (stats.isDirectory()) {
      return true;
    }

    if (stats.isFile()) {
      return file.endsWith(".js");
    }

    return false;
  });

  sourceFiles.forEach((file) => {
    const contents = fs.readFileSync(path.resolve(file), "utf-8");
    if (templateText.slice(0, 2) !== contents.slice(0, 2)) {
      fs.writeFileSync(path.resolve(file), `${templateText}${contents}`);
    }
  });
}

run();
