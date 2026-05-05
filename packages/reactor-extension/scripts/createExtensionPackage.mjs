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

/* eslint-disable no-console */

import { spawnSync } from "child_process";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import archiver from "archiver";
import { Command } from "commander";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = path.join(__dirname, "..");
const monorepoRoot = path.resolve(cwd, "../..");

// @adobe/alloy depends on @adobe/alloy-core via workspace:^. Both must be
// vendored as tarballs so `npm install` succeeds inside the unzipped
// extension regardless of whether either is published yet.
const VENDORED_PACKAGES = [
  { name: "@adobe/alloy", dir: path.join(monorepoRoot, "packages/browser") },
  {
    name: "@adobe/alloy-core",
    dir: path.join(monorepoRoot, "packages/core"),
  },
];
const VENDOR_DIR = "vendor";

/** @typedef {{ name: string, tgzName: string }} VendorEntry */
/** @typedef {VendorEntry & { tgz: Buffer }} VendorEntryWithBuffer */

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ verbose?: boolean } & import('child_process').SpawnSyncOptions} [options]
 * @returns {void}
 */
const execute = (
  command,
  args,
  { verbose, ...options } = { verbose: false },
) => {
  const r = spawnSync(
    command,
    args,
    Object.assign(options, verbose ? { stdio: "inherit" } : {}),
  );

  if (r.status !== 0) {
    if (r.stderr) {
      const error = r.stderr.toString().trim();
      throw new Error(error);
    } else {
      throw new Error(
        `An error occurred while executing the command: ${command}.`,
      );
    }
  }
};

/** @returns {Record<string, unknown>} */
const getExtensionJson = () => {
  const extensonJsonContent = fs.readFileSync(
    path.join(cwd, "extension.json"),
    "utf8",
  );
  return JSON.parse(extensonJsonContent);
};

/**
 * @param {{ name: string, version: string }} extensionDescriptor
 * @returns {string}
 */
const getExtensionPath = (extensionDescriptor) =>
  path.join(
    cwd,
    `package-${extensionDescriptor.name}-${extensionDescriptor.version}.zip`,
  );

/**
 * Build the manifest that ships in the extension zip.
 * @param {VendorEntry[]} [vendor] - Workspace packages bundled in the zip;
 *   their deps are rewritten to `file:vendor/<tgz>` so `npm install` resolves
 *   them locally rather than from the registry.
 * @returns {Record<string, unknown>}
 */
export const getPackageJson = (vendor = []) => {
  console.log("Generating the package.json file...");
  const alloyPackageJson = JSON.parse(
    fs.readFileSync(path.join(cwd, "package.json"), "utf8"),
  );

  const registryDependencies = {
    ...alloyPackageJson.dependencies,
    ...alloyPackageJson.devDependencies,
  };

  const dependencyNames = [
    "@adobe/alloy",
    "@babel/core",
    "@babel/preset-env",
    "@rollup/plugin-commonjs",
    "@rollup/plugin-node-resolve",
    "commander",
    "rollup",
  ];

  const dependencies = {};
  for (const name of dependencyNames) {
    dependencies[name] = registryDependencies[name];
  }
  for (const { name, tgzName } of vendor) {
    dependencies[name] = `file:${VENDOR_DIR}/${tgzName}`;
  }

  return {
    name: "reactor-extension-alloy",
    version: "1.0.0",
    author: {
      name: "Adobe",
      url: "http://adobe.com",
      email: "reactor@adobe.com",
    },
    scripts: {
      build:
        '[ "$ALLOY_LIBRARY_TYPE" = "\\"preinstalled\\"" ] && node ./scripts/buildAlloyPreinstalled.mjs -i ./alloyPreinstalled.js -o ./dist/lib || node ./scripts/buildAlloy.mjs -i ./alloy.js -o ./dist/lib',
    },
    license: "Apache-2.0",
    description: "Tool for generating custom alloy build based on user input.",
    dependencies,
  };
};

/**
 * Run `pnpm pack` on each VENDORED_PACKAGES entry and stage the tarballs in
 * `<destDir>/vendor/`.
 * @param {string} destDir
 * @returns {VendorEntry[]}
 */
const packVendoredWorkspacePackages = (destDir) => {
  const vendorDir = path.join(destDir, VENDOR_DIR);
  fs.mkdirSync(vendorDir, { recursive: true });
  return VENDORED_PACKAGES.map(({ name, dir }) => {
    console.log(`Packing ${name}...`);
    execute("pnpm", ["pack", "--pack-destination", vendorDir], { cwd: dir });
    const pkg = JSON.parse(
      fs.readFileSync(path.join(dir, "package.json"), "utf8"),
    );
    const tgzName = `${name.replace(/^@/, "").replace("/", "-")}-${pkg.version}.tgz`;
    if (!fs.existsSync(path.join(vendorDir, tgzName))) {
      throw new Error(`Expected packed tarball at ${vendorDir}/${tgzName}`);
    }
    return { name, tgzName };
  });
};

/**
 * Run `npm install` in a temp directory laid out the same way as the final
 * zip (manifest + vendored tarballs in ./vendor) so the generated lockfile
 * matches what forge will resolve at install time.
 * @returns {{ packageJson: string, packageLockJson: Buffer, vendor: VendorEntryWithBuffer[] }}
 */
const stageInstallable = () => {
  const tempDir = path.join(cwd, "temp");
  fs.rmSync(tempDir, { recursive: true, force: true });
  fs.mkdirSync(tempDir);

  try {
    const vendor = packVendoredWorkspacePackages(tempDir);
    const packageJson = JSON.stringify(getPackageJson(vendor), null, 2);
    fs.writeFileSync(path.join(tempDir, "package.json"), packageJson);

    console.log("Generating the package-lock.json file (`npm i`)...");
    execute("npm", ["i"], { cwd: tempDir });

    const packageLockJson = fs.readFileSync(
      path.join(tempDir, "package-lock.json"),
    );
    const vendorWithBuffers = vendor.map((v) => ({
      ...v,
      tgz: fs.readFileSync(path.join(tempDir, VENDOR_DIR, v.tgzName)),
    }));

    return { packageJson, packageLockJson, vendor: vendorWithBuffers };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

/**
 * Files appended on top of reactor-packager's manifest-derived file list. None
 * of these are reachable from extension.json's delegate libPaths, so they
 * would not be picked up otherwise.
 */
const EXTRA_FILES = [
  ["alloy.js", "src/lib/alloy.js"],
  ["alloyPreinstalled.js", "src/lib/alloyPreinstalled.js"],
  ["rollup.config.mjs", "rollup.config.mjs"],
  [".browserslistrc", ".browserslistrc"],
  ["scripts/buildAlloy.mjs", "scripts/buildAlloy.mjs"],
  ["scripts/buildAlloyPreinstalled.mjs", "scripts/buildAlloyPreinstalled.mjs"],
  ["src/view/utils/alloyComponents.mjs", "src/view/utils/alloyComponents.mjs"],
];

/**
 * Run reactor-packager's getPackagePaths helper in a child process so its
 * glob/fs reads happen with cwd set to the extension dir. We can't chdir
 * in-process because vitest workers disallow it.
 * @returns {string[]}
 */
const getManifestFilepaths = () => {
  const r = spawnSync(
    process.execPath,
    [
      "-e",
      `
      const fs = require('fs');
      const getPaths = require('@adobe/reactor-packager/tasks/helpers/getPackagePaths.js');
      const descriptor = JSON.parse(fs.readFileSync('extension.json', 'utf8'));
      console.log(JSON.stringify(getPaths(descriptor)));
      `,
    ],
    { cwd, encoding: "utf8" },
  );
  if (r.status !== 0) {
    throw new Error(`getPackagePaths failed: ${r.stderr || r.stdout}`);
  }
  return JSON.parse(r.stdout);
};

/**
 * @param {{ packagePath: string, packageJson: string, packageLockJson: Buffer, vendor: VendorEntryWithBuffer[] }} options
 * @returns {Promise<void>}
 */
const buildExtensionZip = async ({
  packagePath,
  packageJson,
  packageLockJson,
  vendor,
}) => {
  const manifestFilepaths = getManifestFilepaths();

  const output = fs.createWriteStream(packagePath);
  const archive = archiver("zip");
  const done = new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
  });
  archive.pipe(output);

  for (const fp of manifestFilepaths) {
    archive.file(path.join(cwd, fp), { name: fp });
  }
  archive.append(packageJson, { name: "package.json" });
  archive.append(packageLockJson, { name: "package-lock.json" });
  for (const { tgzName, tgz } of vendor) {
    archive.append(tgz, { name: `${VENDOR_DIR}/${tgzName}` });
  }
  for (const [name, src] of EXTRA_FILES) {
    archive.file(path.join(cwd, src), { name });
  }

  await archive.finalize();
  await done;
};

/**
 * @param {{ verbose?: boolean }} [options]
 * @returns {Promise<string>} Absolute path to the produced zip file.
 */
export const createExtensionPackage = async ({ verbose } = {}) => {
  console.log("Running the clean process (`pnpm run clean`)...");
  execute("pnpm", ["run", "clean"], { cwd, verbose });

  console.log("Running the build process (`pnpm run build`)...");
  execute("pnpm", ["run", "build"], { cwd, verbose });

  const packagePath = getExtensionPath(getExtensionJson());

  const { packageJson, packageLockJson, vendor } = stageInstallable();

  console.log("Building the extension zip...");
  await buildExtensionZip({
    packagePath,
    packageJson,
    packageLockJson,
    vendor,
  });
  console.log("Done");
  return packagePath;
};

const invokedAsCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsCli) {
  const program = new Command();

  program
    .name("createExtensionPackage")
    .description("Tool for generating the alloy extension package for Tags.");

  program.option("-v, --verbose", "verbose mode", false);

  program.action(createExtensionPackage);

  await program.parseAsync();
}
