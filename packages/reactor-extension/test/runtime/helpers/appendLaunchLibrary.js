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

/* eslint-disable import/no-unresolved -- Virtual modules provided by plugins/alloyBundle.js. */
import alloyBundleSource from "virtual:alloy-bundle";
import engineSource, {
  version as turbineVersion,
} from "virtual:reactor-turbine-engine";
/* eslint-enable import/no-unresolved */
import { isDefaultComponent } from "../../../src/view/utils/alloyComponents.mjs";
import { monitor } from "./commandMonitor.js";

// Raw CommonJS sources of the extension's runtime modules. Node's sandbox build
// reads the babel output in dist/lib; Chromium runs these files unchanged, so
// no build step is needed.
const libSources = import.meta.glob("../../../src/lib/**/*.js", {
  query: "?raw",
  import: "default",
  eager: true,
});

const SRC_PREFIX = "../../../src/lib/";
const REFERENCE_PREFIX = "adobe-alloy/dist/lib/";
const ALLOY_ENTRY = "alloy.js";

// Same modules the sandbox adds so rules can use "sandbox/..." module paths.
const sandboxModules = {
  "sandbox/pageTop.js": {
    script(module) {
      module.exports = (settings, trigger) => {
        trigger();
      };
    },
  },
  "sandbox/click.js": {
    script(module) {
      module.exports = (settings, trigger) => {
        document.addEventListener("click", (event) => {
          trigger({ nativeEvent: event });
        });
      };
    },
  },
  // The sandbox click event only passes nativeEvent. Core's click event also
  // passes the matched element, which redirectWithIdentity requires.
  "sandbox/coreClick.js": {
    script(module) {
      module.exports = (settings, trigger) => {
        document.addEventListener("click", (event) => {
          trigger({
            nativeEvent: event,
            element: event.target.closest(settings.elementSelector || "*"),
          });
        });
      };
    },
  },
  "sandbox/javascriptVariable.js": {
    script(module) {
      module.exports = (settings) => {
        let value = window;
        for (const key of settings.path.split(".")) {
          if (value == null) {
            return undefined;
          }
          value = value[key];
        }
        return value;
      };
    },
  },
};

// Evaluated once per container, so every library gets its own Alloy realm.
// buildAlloy.mjs rewrites `components` into an array of the selected optional
// components; the bundle exports the full object. Select the default set, as a
// build without component overrides does.
const evaluateAlloyBundle = (module, exports, require) => {
  const bundle = { exports: {} };
  new Function("module", "exports", "require", alloyBundleSource)(
    bundle,
    bundle.exports,
    require,
  );
  module.exports = {
    ...bundle.exports,
    components: Object.entries(bundle.exports.components)
      .filter(([name]) => isDefaultComponent(name))
      .map(([, component]) => component),
  };
};

const extensionSources = {};
Object.entries(libSources).forEach(([path, source]) => {
  const relativePath = path.slice(SRC_PREFIX.length);
  if (relativePath !== ALLOY_ENTRY) {
    extensionSources[`${REFERENCE_PREFIX}${relativePath}`] = source;
  }
});

const collectModulePaths = (value, found = new Set()) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectModulePaths(item, found));
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      if (key === "modulePath") {
        found.add(child);
      } else {
        collectModulePaths(child, found);
      }
    });
  }
  return found;
};

const resolveReference = (fromPath, relativePath) => {
  const segments = fromPath.split("/").slice(0, -1);
  const withExtension = relativePath.endsWith(".js")
    ? relativePath
    : `${relativePath}.js`;
  withExtension.split("/").forEach((segment) => {
    if (segment === "..") {
      segments.pop();
    } else if (segment !== "." && segment !== "") {
      segments.push(segment);
    }
  });
  return segments.join("/");
};

const addModule = (modules, referencePath) => {
  if (modules[referencePath]) {
    return;
  }
  if (referencePath === `${REFERENCE_PREFIX}${ALLOY_ENTRY}`) {
    modules[referencePath] = { script: evaluateAlloyBundle };
    return;
  }
  const source = extensionSources[referencePath];
  if (source === undefined) {
    throw new Error(`Module ${referencePath} not found in src/lib.`);
  }

  modules[referencePath] = {
    script: new Function("module", "exports", "require", "turbine", source),
  };
  for (const [, required] of source.matchAll(
    /require\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g,
  )) {
    addModule(modules, resolveReference(referencePath, required));
  }
};

const buildContainer = (container) => {
  const built = structuredClone(container);
  const extensionModules = {};
  const sandbox = { displayName: "Extension Sandbox", modules: {} };

  collectModulePaths(built).forEach((modulePath) => {
    if (sandboxModules[modulePath]) {
      sandbox.modules[modulePath] = sandboxModules[modulePath];
    } else {
      addModule(extensionModules, modulePath);
    }
  });

  built.extensions["adobe-alloy"].modules = extensionModules;
  built.extensions.sandbox = sandbox;
  built.buildInfo = {
    turbineVersion,
    turbineBuildDate: new Date().toISOString(),
    buildDate: new Date().toISOString(),
  };
  built.environment = {
    id: "EN00000000000000000000000000000000",
    stage: "development",
  };
  return built;
};

/**
 * Builds a Tags runtime library in the browser from a container definition and
 * evaluates it in the page, mirroring the TestCafe appendLaunchLibrary helper.
 * The container may use the same `adobe-alloy/dist/lib/...` module paths the
 * sandbox build does; they resolve to the matching files under src/lib.
 */
export default (container) => {
  window.__alloyMonitors = [...(window.__alloyMonitors || []), monitor];
  window._satellite = { container: buildContainer(container) };
  const script = document.createElement("script");
  script.dataset.testLaunchLibrary = "";
  script.textContent = engineSource;
  document.body.appendChild(script);
};
