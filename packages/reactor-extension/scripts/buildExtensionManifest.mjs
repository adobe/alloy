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
import { readFile, writeFile } from "fs/promises";
import Ajv from "ajv-draft-04";
import addAJVFormats from "ajv-formats";
import { join, resolve } from "path";
import { env } from "process";
import prettier from "prettier";
import createExtensionManifest from "./helpers/createExtensionManifest.mjs";

const extensionDescriptorSchema = JSON.parse(
  await readFile(
    new URL(
      "../node_modules/@adobe/reactor-turbine-schemas/schemas/extension-package-web.json",
      import.meta.url,
    ),
  ),
);

/**
 * Get the variable options for the manifest.
 * @param {Object} environment
 * @returns {import("./createExtensionManifest.mjs").ExtensionManifestConfiguration}
 */
const getOptions = (environment) => {
  // get version from environment
  return {
    version: environment.npm_package_version,
  };
};

/**
 * Validate the given manifest.
 * @param {ExtensionManifest} manifest
 * @returns {string | undefined} An error message if invalid, undefined if valid.
 */
const validate = (manifest) => {
  // This code is based on validateJsonStructure() in @adobe/reactor-validator.
  // We don't use that package directly because it also validates the files
  // mentioned in the extension manifest, which may not be present yet.

  const ajv = new Ajv({
    schemaId: "auto",
    strict: false,
  });
  addAJVFormats(ajv);
  if (!ajv.validate(extensionDescriptorSchema, manifest)) {
    return ajv.errorsText();
  }
  return undefined;
};

/**
 * Get the filepath of the extension.json
 * @param {string} repoRoot The root path of the repository.
 * @returns {string}
 */
const getDestination = (repoRoot) => {
  return resolve(join(repoRoot, "extension.json"));
};

/**
 * Stringify and format the object as JSON.
 * @param {Object} obj
 * @param {boolean=} prettyPrint Whether to pretty print the JSON.
 * @returns {Promise<string>}
 */
const stringify = async (obj, prettyPrint = true) => {
  const result = JSON.stringify(obj);
  if (!prettyPrint) {
    return result;
  }
  const prettierConfig = await prettier.resolveConfig();
  return prettier.format(result, {
    ...prettierConfig,
    parser: "json-stringify",
  });
};

/**
 * Write the given content tob the given path. Serializes the object if needed.
 * @param {string} path
 * @param {Object | string} content
 * @returns {Promise<void>}
 */
const write = async (path, content) => {
  const result =
    typeof content === "string" ? content : await stringify(content);
  await writeFile(path, result, "utf8");
};

/**
 * Builds the extension manifest by pulling the configuration from package.json
 * and writes it to the filesystem as extension.json in the root of the
 * repository.
 * @returns {Promise<string>} The path to the written file.
 */
const build = async () => {
  const options = await getOptions(env);
  const manifest = createExtensionManifest(options);
  const error = validate(manifest);
  if (error) {
    throw new Error(`Invalid extension manifest: ${error}`);
  }
  const writePath = getDestination(process.cwd());
  await write(writePath, manifest);

  // eslint-disable-next-line no-console
  console.log(
    "\x1b[32m%s\x1b[0m",
    `✅ Extension manifest written to ${writePath}`,
  );
  return writePath;
};

build();
