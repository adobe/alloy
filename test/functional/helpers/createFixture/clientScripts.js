/*
Copyright 2020 Adobe. All rights reserved.
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
import { ClientFunction } from "testcafe";

const alloyEnv = process.env.ALLOY_ENV || "int";

// eslint-disable-next-line no-console
console.log("ALLOY ENV:", alloyEnv);

const localAlloyLibraryPath = path.join(
  __dirname,
  "../../../../dist/standalone/alloy.js"
);

let localAlloyCode;

/**
 * We're only testing against the alloy code found in /dist when alloyEnv
 * is "int". Otherwise, we're testing against the alloy that's on the CDN
 * and alloy code may not exist in /dist. This is why we don't always try to
 * load the file from the file system.
 */
if (alloyEnv === "int") {
  localAlloyCode = fs.readFileSync(localAlloyLibraryPath, "utf8");
}

const remoteAlloyLibraryUrl =
  "https://cdn1.adoberesources.net/alloy/latest/alloy.js";

const addVisitorLibraryClientScript = clientScripts => {
  clientScripts.push({
    content:
      "document.write('<script src=\"https://github.com/Adobe-Marketing-Cloud/id-service/releases/latest/download/visitorapi.min.js\"></script>')"
  });
};

const getFixtureClientScriptsForInt = options => {
  const clientScripts = [];
  const promisePolyfillPath = path.join(
    __dirname,
    "../promisePolyfill/promise-polyfill.min.js"
  );
  clientScripts.push({
    path: promisePolyfillPath
  });

  if (options.includeVisitorLibrary) {
    addVisitorLibraryClientScript(clientScripts);
  }

  const pageSnippetPath = path.join(__dirname, "../alloyPageSnippet/index.js");
  clientScripts.push({
    path: pageSnippetPath
  });

  if (options.includeAlloyLibrary) {
    // When providing client scripts to TestCafe during the fixture
    // configuration process, TestCafe doesn't currently support loading scripts
    // asynchronously (https://github.com/DevExpress/testcafe/issues/5612), but
    // by default our customers are loading Alloy asynchronously and we would
    // like to simulate that. To do so, we'll wrap our Alloy code in a
    // setTimeout with a small arbitrary delay.
    clientScripts.push({
      content: `setTimeout(() => {\n${localAlloyCode}\n}, 10);`
    });
  }

  return clientScripts;
};

const getFixtureClientScriptsForProd = options => {
  const clientScripts = [];
  clientScripts.push({
    content:
      "document.write('<script src=\"https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js\"></script>')"
  });

  if (options.includeVisitorLibrary) {
    addVisitorLibraryClientScript(clientScripts);
  }

  clientScripts.push({
    content:
      "!function(n,o){o.forEach(function(o){n[o]||((n.__alloyNS=n.__alloyNS||" +
      "[]).push(o),n[o]=function(){var u=arguments;return new Promise(" +
      "function(i,l){n[o].q.push([i,l,u])})},n[o].q=[])})}" +
      '(window,["alloy", "instance2"]);'
  });

  if (options.includeAlloyLibrary) {
    clientScripts.push({
      content: `document.write('<script src="${remoteAlloyLibraryUrl}" async></script>')`
    });
  }

  return clientScripts;
};

const getFixtureClientScriptsByEnvironment = {
  int: getFixtureClientScriptsForInt,
  prod: getFixtureClientScriptsForProd
};

const injectAlloyDuringTestForInt = ClientFunction(
  () => {
    const scriptElement = document.createElement("script");
    // eslint-disable-next-line no-undef
    scriptElement.innerHTML = localAlloyCode;
    document.getElementsByTagName("head")[0].appendChild(scriptElement);
  },
  {
    dependencies: {
      localAlloyCode
    }
  }
);

const injectAlloyDuringTestForProd = ClientFunction(
  () => {
    const scriptElement = document.createElement("script");
    scriptElement.src = remoteAlloyLibraryUrl;
    document.getElementsByTagName("head")[0].appendChild(scriptElement);
  },
  {
    dependencies: {
      remoteAlloyLibraryUrl
    }
  }
);

const injectAlloyDuringTestByEnvironment = {
  int: injectAlloyDuringTestForInt,
  prod: injectAlloyDuringTestForProd
};

/**
 * Retrieves a clientScripts array that can be provided to a TestCafe fixture,
 * which will inject script tags into the <head> of the test page.
 */
export const getFixtureClientScripts =
  getFixtureClientScriptsByEnvironment[alloyEnv];

/**
 * Injects the Alloy library while a test is running. This is useful if you
 * want to test what happens when, for example, commands are queued before
 * the Alloy library finishes loading. If you use this, you'll want to set
 * includeAlloyLibrary to false when configuring client scripts for the
 * fixture so that Alloy isn't injected into <head>.
 */
export const injectAlloyDuringTest =
  injectAlloyDuringTestByEnvironment[alloyEnv];
