#!/usr/bin/env node

/*
Copyright 2024 Adobe. All rights reserved.
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
import { spawn } from "child_process";
import run from "./helpers/run.mjs";
import { watch, inputDir, outputDir } from "./helpers/options.mjs";

// Runtime tests need a .sandbox directory to run
const sandboxDir = path.join(outputDir, "../.sandbox");
if (!fs.existsSync(sandboxDir)) {
  fs.mkdirSync(sandboxDir);
}

const libInDir = path.join(inputDir, "lib");
const libOutDir = path.join(outputDir, "lib");
const alloyInFile = path.join(libInDir, "alloy.js");
const extensionVersionInFile = path.join(
  libInDir,
  "constants/extensionVersion.js",
);
const ignoredFiles = `${alloyInFile},${extensionVersionInFile}`;

const writeExtensionVersionModule = () => {
  const { version } = JSON.parse(
    fs.readFileSync(path.join(inputDir, "../package.json"), "utf8"),
  );
  const outFile = path.join(libOutDir, "constants/extensionVersion.js");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(
    outFile,
    `/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

module.exports = ${JSON.stringify(version)};
`,
  );
};

// ignore alloy.js because it will be built separately in buildAlloy.js, and
// extensionVersion.js because we emit a static literal version module below.
try {
  await run("babel", [
    libInDir,
    "--out-dir",
    libOutDir,
    "--ignore",
    ignoredFiles,
    "--presets=@babel/preset-env",
  ]);
  writeExtensionVersionModule();
} catch (error) {
  console.error(error);
  process.exit(1);
}

if (watch) {
  const babelWatchSubprocess = spawn(
    "babel",
    [
      libInDir,
      "--out-dir",
      libOutDir,
      "--watch",
      "--skip-initial-build",
      "--ignore",
      ignoredFiles,
      "--presets=@babel/preset-env",
    ],
    { stdio: "inherit" },
  );
  // cleanup this process on ctrl-c
  process.on("exit", () => {
    babelWatchSubprocess.kill();
  });
}
