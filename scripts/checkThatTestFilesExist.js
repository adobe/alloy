#!/usr/bin/env node

/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import path from "path";
import fs from "fs";
import recursive from "recursive-readdir";
import pkg from "minimatch";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// eslint-disable-next-line import/extensions
const ignorePatterns = require("../coverageignore.cjs");

const { Minimatch } = pkg;
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const baseDir = path.join(dirname, "../");
const srcDir = path.join(dirname, "../src");
const testDir = path.join(dirname, "../test/unit/specs");
const specExtension = ".spec.js";

const ignoreMinimatches = ignorePatterns.map((ignorePattern) => {
  return new Minimatch(ignorePattern);
});

const shouldFileBeIgnored = (file) => {
  return ignoreMinimatches.some((minimatch) => {
    return minimatch.match(path.relative(srcDir, file));
  });
};

/**
 * Ensures that for every source file there's an accompanying spec file.
 * If not, the missing spec files will be listed and the process will
 * exit with an exit code of 1.
 */
recursive(srcDir, [shouldFileBeIgnored]).then((srcFiles) => {
  const missingTestFiles = srcFiles
    .map((srcFile) => {
      const pathRelativeToSrcDir = path.relative(srcDir, srcFile);
      const pathRelativeToTestDir = path.join(
        path.dirname(pathRelativeToSrcDir),
        `${path.basename(
          pathRelativeToSrcDir,
          path.extname(pathRelativeToSrcDir),
        )}${specExtension}`,
      );
      return path.join(testDir, pathRelativeToTestDir);
    })
    .filter((testFile) => {
      return !fs.existsSync(testFile);
    });

  if (missingTestFiles.length) {
    console.error("Test files are missing for their respective source files:");
    missingTestFiles.forEach((missingTestFile) => {
      const pathRelativeToBaseDir = path.relative(baseDir, missingTestFile);
      console.error(`- ${pathRelativeToBaseDir}`);
    });
    process.exitCode = 1;
  }
});
