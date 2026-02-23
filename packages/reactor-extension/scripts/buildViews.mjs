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
import { Parcel } from "@parcel/core";
import { watch, inputDir, outputDir } from "./helpers/options.mjs";

const viewEntries = path.join(inputDir, "view/**/*.html");
const viewOutDir = path.join(outputDir, "view");

const isProd = process.env.NODE_ENV === "production";

const bundler = new Parcel({
  entries: viewEntries,
  defaultConfig: "@parcel/config-default",
  mode: isProd ? "production" : "development",
  // By default, Parcel updates script tags on HTML files to reference post-processed JavaScript files
  // by using an absolute directory. We can't use absolute directories, because our extension's view files
  // are deployed by Launch to Akamai under a deep subdirectory. We use publicUrl to ensure we use a relative
  // path for loading JavaScript files.
  defaultTargetOptions: {
    publicUrl: "../",
    distDir: viewOutDir,
    sourceMaps: !isProd,
    shouldOptimize: isProd,
    shouldScopeHoist: false,
  },
  shouldDisableCache: true,
  additionalReporters: [
    {
      packageName: "@parcel/reporter-cli",
      resolveFrom: viewOutDir,
    },
  ],
});
if (watch) {
  new Promise((resolve) => {
    const subscription = bundler.watch(() => {
      resolve();
    });
    process.on("exit", () => {
      // stop watching when the main process exits
      if (typeof subscription?.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    });
  });
} else {
  bundler.run();
}
