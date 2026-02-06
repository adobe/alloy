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

import fs from "fs";
import path from "path";
import recursive from "recursive-readdir";
import { Minimatch } from "minimatch";
import { globSync } from "glob";
import { fileURLToPath } from "url";
import { safePathJoin } from "./helpers/path.js";

const ignorePatterns = [
  "**/.*",
  "**/constants/**",
  "**/index.js",
  "baseCode.js",
  "standalone.js",
];

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const baseDir = safePathJoin(dirname, "../");
const packagesRoot = safePathJoin(dirname, "../packages");
const specExtension = ".spec.js";

const ignoreMinimatches = ignorePatterns.map((ignorePattern) => {
  return new Minimatch(ignorePattern);
});

const srcDirMatcher = new Minimatch(path.join("packages", "*", "src"));
const testDirMatcher = new Minimatch(
  path.join("packages", "*", "test", "unit", "specs"),
);

const directoryGlobOptions = {
  onlyDirectories: true,
  absolute: true,
  ignore: ["**/node_modules/**"],
};

const allPackageDirs = fs.existsSync(packagesRoot)
  ? globSync(path.join(packagesRoot, "**"), directoryGlobOptions)
  : [];

const srcDirs = allPackageDirs.filter((dir) =>
  srcDirMatcher.match(path.relative(baseDir, dir)),
);

const testDirsByPackage = new Map(
  allPackageDirs
    .filter((dir) => testDirMatcher.match(path.relative(baseDir, dir)))
    .map((dir) => {
      const relativeToPackages = path.relative(packagesRoot, dir);
      const [packageName] = relativeToPackages.split(path.sep);
      return [packageName, dir];
    }),
);

const legacySrcDir = safePathJoin(dirname, "../src");
if (fs.existsSync(legacySrcDir)) {
  srcDirs.push(legacySrcDir);
}

const legacyTestDir = safePathJoin(dirname, "../test/unit/specs");
if (fs.existsSync(legacyTestDir)) {
  testDirsByPackage.set("__legacy__", legacyTestDir);
}

const uniqueSrcDirs = [...new Set(srcDirs)];

const createShouldFileBeIgnored = (srcRoot) => (file) => {
  return ignoreMinimatches.some((minimatch) => {
    return minimatch.match(path.relative(srcRoot, file));
  });
};

const findTestDirForSrc = (srcRoot) => {
  if (srcRoot.startsWith(packagesRoot)) {
    const relativeToPackages = path.relative(packagesRoot, srcRoot);
    const [packageName] = relativeToPackages.split(path.sep);
    return (
      testDirsByPackage.get(packageName) ||
      path.join(packagesRoot, packageName, "test", "unit", "specs")
    );
  }

  return testDirsByPackage.get("__legacy__") || legacyTestDir;
};

const missingTestFiles = new Set();

const processSrcDir = async (srcRoot) => {
  const shouldIgnore = createShouldFileBeIgnored(srcRoot);
  const srcFiles = await recursive(srcRoot, [shouldIgnore]);
  const testRoot = findTestDirForSrc(srcRoot);

  srcFiles.forEach((srcFile) => {
    const pathRelativeToSrcDir = path.relative(srcRoot, srcFile);
    const pathRelativeToTestDir = path.join(
      path.dirname(pathRelativeToSrcDir),
      `${path.basename(
        pathRelativeToSrcDir,
        path.extname(pathRelativeToSrcDir),
      )}${specExtension}`,
    );
    const testFile = safePathJoin(testRoot, pathRelativeToTestDir);

    if (!fs.existsSync(testFile)) {
      missingTestFiles.add(testFile);
    }
  });
};

Promise.all(uniqueSrcDirs.map((srcRoot) => processSrcDir(srcRoot)))
  .then(() => {
    if (missingTestFiles.size) {
      console.error(
        "Test files are missing for their respective source files:",
      );
      Array.from(missingTestFiles)
        .sort()
        .forEach((missingTestFile) => {
          const pathRelativeToBaseDir = path.relative(baseDir, missingTestFile);
          console.error(`- ${pathRelativeToBaseDir}`);
        });
      process.exitCode = 1;
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
