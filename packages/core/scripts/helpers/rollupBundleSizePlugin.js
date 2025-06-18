/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import path from "path";
import { gzip, brotliCompress as br, constants as zlibConstants } from "zlib";
import { promisify } from "util";
import { readFile, writeFile } from "fs/promises";

/**
 * @param {Object} options
 * @param {string} [options.outputFile] Filepath to output the bundle size report.
 * @param {boolean} [options.reportToConsole] Whether to log the bundle size report to the console in addition to writing it to a file.
 * @param {number} [options.gzipCompressionLevel] The compression level to use when gzipping the bundle.
 * @param {number} [options.brotliCompressionLevel] The compression level to use when brotli-compressing the bundle.
 * @returns {Partial<import("rollup").PluginHooks>}
 */
const bundleSizePlugin = (_options = {}) => {
  const defaultOptions = {
    outputFile: "bundlesize.json",
    reportToConsole: false,
    gzipCompressionLevel: zlibConstants.Z_DEFAULT_COMPRESSION,
    brotliCompressionLevel: zlibConstants.BROTLI_DEFAULT_QUALITY,
  };
  const options = { ...defaultOptions, ..._options };
  const gzipCompress = promisify(gzip);
  const brotliCompress = promisify(br);
  /**
   * @param {import("node:zlib").InputType} source the source code to compress
   * @param {import("node:zlib").ZlibOptions={}} options
   * @returns {number} size in bytes
   */
  const getGzippedSize = async (source, opts = {}) => {
    const compressed = await gzipCompress(source, opts);
    const byteSize = Number.parseInt(compressed.byteLength, 10);
    return byteSize;
  };
  /**
   * @param {import("node:zlib").InputType} source the source code to compress
   * @param {import("node:zlib").BrotliOptions={}} options
   * @returns {number} size in bytes
   */
  const getBrotiliSize = async (source, opts = {}) => {
    const compressed = await brotliCompress(source, opts);
    const byteSize = Number.parseInt(compressed.byteLength, 10);
    return byteSize;
  };
  return {
    name: "bundle-size",
    generateBundle: {
      order: "post",
      /**
       * @param {import("rollup").NormalizedOutputOptions} rollupOptions
       * @param {import("rollup").OutputBundle} bundle
       * @returns {Promise<void>}
       */
      async handler(rollupOptions, bundle) {
        // keep sizes in bytes until displaying them
        const sizes = await Promise.all(
          Object.values(bundle)
            .filter((outputFile) => outputFile.type === "chunk")
            .map(async (chunk) => {
              return {
                fileName:
                  rollupOptions.file ??
                  path.join(rollupOptions.dir, chunk.fileName),
                uncompressedSize: Buffer.from(chunk.code).byteLength,
                gzippedSize: await getGzippedSize(chunk.code, {
                  level: options.gzipCompressionLevel,
                }),
                brotiliSize: await getBrotiliSize(chunk.code, {
                  params: {
                    [zlibConstants.BROTLI_PARAM_QUALITY]:
                      options.brotliCompressionLevel,
                  },
                }),
              };
            }),
        );
        if (options.reportToConsole) {
          console.table(sizes);
        }
        // check if the output file exists, create it if it does not exist
        let report = {};
        try {
          const outputFile = readFile(path.resolve(options.outputFile));
          report = JSON.parse(await outputFile);
        } catch {
          // ignore errors. They are probably due to the file not existing
        }
        // update the report with the new sizes
        sizes
          // stable sort the report by filename
          .sort(({ fileName: a }, { fileName: b }) => a.localeCompare(b))
          .forEach((size) => {
            const { fileName } = size;
            delete size.fileName;
            report[fileName] = size;
          });
        // write the report to the file
        await writeFile(
          path.resolve(options.outputFile),
          JSON.stringify(report, null, 2),
        );
      },
    },
  };
};
export default bundleSizePlugin;
