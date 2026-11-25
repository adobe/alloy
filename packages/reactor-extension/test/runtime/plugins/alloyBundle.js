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

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rollup } from "rollup";
import rollupConfigs from "../../../rollup.config.mjs";

const ALLOY_BUNDLE_ID = "virtual:alloy-bundle";
const TURBINE_ENGINE_ID = "virtual:reactor-turbine-engine";
const resolved = (id) => `\0${id}`;
const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

// The old TestCafe specs ran the engine that @adobe/reactor-sandbox bundles
// into its library (its own @adobe/reactor-turbine dependency), which is not
// necessarily the copy the extension lists as a devDependency.
const readSandboxTurbine = () => {
  const requireFromPackage = createRequire(path.join(packageRoot, "_"));
  const requireFromSandbox = createRequire(
    requireFromPackage.resolve("@adobe/reactor-sandbox/package.json"),
  );
  const { version } = requireFromSandbox("@adobe/reactor-turbine/package.json");
  const engine = fs.readFileSync(
    requireFromSandbox.resolve("@adobe/reactor-turbine/dist/engine.js"),
    "utf8",
  );
  return { version, engine };
};

// Same rollup pipeline as `build:alloy`, minus the babel step and written to
// memory. Bundling keeps Alloy's module-level state (e.g. the unique
// datastreamId/orgId registry) inside one script, so evaluating the bundle
// again gives a pristine Alloy, like a new page load would.
const buildAlloyBundle = async () => {
  const [{ input, plugins, external }] = rollupConfigs;
  const bundle = await rollup({
    input: path.resolve(packageRoot, input),
    plugins,
    external,
  });
  try {
    const { output } = await bundle.generate({
      format: "cjs",
      exports: "named",
    });
    return { code: output[0].code, watchFiles: bundle.watchFiles };
  } finally {
    await bundle.close();
  }
};

/**
 * Vite plugin exposing:
 * - `virtual:alloy-bundle`: CommonJS source of src/lib/alloy.js bundled with
 *   its @adobe/alloy dependencies.
 * - `virtual:reactor-turbine-engine`: the Turbine engine source and version
 *   used by @adobe/reactor-sandbox.
 */
export default () => {
  let bundle;
  let watchedFiles = new Set();

  const getBundle = () => {
    if (!bundle) {
      const pending = buildAlloyBundle();
      bundle = pending;
      // Don't keep a failed build cached.
      pending.catch(() => {
        if (bundle === pending) {
          bundle = undefined;
        }
      });
    }
    return bundle;
  };

  return {
    name: "reactor-extension-runtime",
    resolveId(id) {
      return id === ALLOY_BUNDLE_ID || id === TURBINE_ENGINE_ID
        ? resolved(id)
        : undefined;
    },
    async load(id) {
      if (id === resolved(ALLOY_BUNDLE_ID)) {
        const { code, watchFiles } = await getBundle();
        watchedFiles = new Set(watchFiles);
        watchFiles.forEach((file) => this.addWatchFile(file));
        return `export default ${JSON.stringify(code)};`;
      }
      if (id === resolved(TURBINE_ENGINE_ID)) {
        const { version, engine } = readSandboxTurbine();
        return `export const version = ${JSON.stringify(version)};\nexport default ${JSON.stringify(engine)};`;
      }
      return undefined;
    },
    // Watch mode: the browser and project Vite servers run without a file
    // watcher (Vitest owns it), so neither re-runs `load` nor sees `watchChange`
    // hooks. Listen on Vitest's watcher instead, drop the cached bundle and
    // invalidate the virtual module so the next run rebuilds it. A new source
    // file can change how an import resolves, so `add` also invalidates.
    configureVitest({ vitest, project }) {
      const invalidate = () => {
        bundle = undefined;
        [project.vite, project.browser?.vite].forEach((server) => {
          const module = server?.moduleGraph.getModuleById(
            resolved(ALLOY_BUNDLE_ID),
          );
          if (module) {
            server.moduleGraph.invalidateModule(module);
          }
        });
      };
      const { watcher } = vitest.vite;
      ["change", "unlink"].forEach((event) => {
        watcher.on(event, (file) => {
          if (watchedFiles.has(file)) {
            invalidate();
          }
        });
      });
      watcher.on("add", (file) => {
        if (/\.[cm]?[jt]sx?$/.test(file) && !file.includes("/node_modules/")) {
          invalidate();
        }
      });
    },
  };
};
