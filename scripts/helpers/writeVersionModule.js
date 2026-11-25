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

const LICENSE_HEADER = `/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/`;

/**
 * Emits a static JS module exporting the version from `packageJsonPath` as a
 * plain string literal so published `dist/` files never require JSON import
 * plugins in downstream bundlers.
 *
 * @param {object} options
 * @param {string} options.packageJsonPath
 * @param {string} options.outputPath
 * @param {"esm" | "cjs"} [options.format="esm"]
 */
export const writeVersionModule = ({
  packageJsonPath,
  outputPath,
  format = "esm",
}) => {
  const { version } = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const statement =
    format === "cjs"
      ? `module.exports = ${JSON.stringify(version)};`
      : `export default ${JSON.stringify(version)};`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${LICENSE_HEADER}\n\n${statement}\n`);
};

const invokedAsCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsCli) {
  const args = process.argv.slice(2);
  const formatFlag = args.find((arg) => arg.startsWith("--format="));
  const format = formatFlag ? formatFlag.slice("--format=".length) : "esm";
  const outputArg = args.find((arg) => !arg.startsWith("--"));

  if (!outputArg || (format !== "esm" && format !== "cjs")) {
    throw new Error(
      "Usage: writeVersionModule.js <outputPath> [--format=esm|cjs]",
    );
  }

  writeVersionModule({
    packageJsonPath: path.resolve(process.cwd(), "package.json"),
    outputPath: path.resolve(process.cwd(), outputArg),
    format,
  });
}
