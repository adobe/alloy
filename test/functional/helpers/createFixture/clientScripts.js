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

const localPromisePolyfillPath = path.join(
  __dirname,
  "../promisePolyfill/promise-polyfill.min.js"
);
const remotePromisePolyfillPath =
  "https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js";
const remoteVisitorLibraryUrl =
  "https://github.com/Adobe-Marketing-Cloud/id-service/releases/latest/download/visitorapi.min.js";
const baseCodePath = path.join(__dirname, "../../../../src/baseCode/index.js");
const localAlloyLibraryPath = path.join(
  __dirname,
  "../../../../dist/standalone/alloy.js"
);
const remoteAlloyLibraryUrl =
  "https://cdn1.adoberesources.net/alloy/latest/alloy.js";

let localAlloyCode;

// We're only testing against the alloy code found in /dist when alloyEnv
// is "int". Otherwise, we're testing against the prod alloy that's on the CDN
// and in those cases alloy code may not even exist in /dist. This is why
// we only try to load the file from the file system if alloyEnv is int.
if (alloyEnv === "int") {
  localAlloyCode = fs.readFileSync(localAlloyLibraryPath, "utf8");
}

const baseCodeWithCustomInstances = fs
  .readFileSync(baseCodePath, "utf8")
  .replace('["alloy"]', '["alloy","instance2"]');

const addRemoteUrlClientScript = ({ clientScripts, url, async = false }) => {
  // TestCafe client scripts don't "natively" support loading a script
  // from a remote URL, so we have to make our local script add another script
  // element that loads Visitor from the remote server.
  clientScripts.push({
    content: `document.write('<script src="${url}"${
      async ? " async" : ""
    }></script>')`
  });
};

/**
 * Produces an array of scripts that TestCafe should inject into the <head>
 * when testing Alloy int.
 */
const getFixtureClientScriptsForInt = options => {
  const clientScripts = [];

  // We load a promise polyfill because promises aren't supported in IE
  // and that's what customers supporting IE will need to do as part
  // of installing Alloy.
  // We could load the Promise polyfill from a CDN, but it would slow down
  // our tests a bit since we would have to go over the wire to load it.
  clientScripts.push({
    path: localPromisePolyfillPath
  });

  // Useful for testing Alloy + Visitor interaction.
  if (options.includeVisitorLibrary) {
    addRemoteUrlClientScript({
      clientScripts,
      url: remoteVisitorLibraryUrl
    });
  }

  clientScripts.push({
    content: baseCodeWithCustomInstances
  });

  // Typically the Alloy library should be loaded in head. For some tests,
  // like testing command queuing, we need greater control and will
  // load the Alloy library later during the test using injectAlloyDuringTest.
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

/**
 * Produces an array of scripts that TestCafe should inject into the <head>
 * when testing Alloy prod.
 */
const getFixtureClientScriptsForProd = options => {
  const clientScripts = [];
  addRemoteUrlClientScript({
    clientScripts,
    url: remotePromisePolyfillPath
  });

  // Useful for testing Alloy + Visitor interaction.
  if (options.includeVisitorLibrary) {
    addRemoteUrlClientScript({
      clientScripts,
      url: remoteVisitorLibraryUrl
    });
  }

  clientScripts.push({
    content: baseCodeWithCustomInstances
  });

  // Typically the Alloy library should be loaded in head. For some tests,
  // like testing command queuing, we need greater control and will
  // load the Alloy library later during the test using injectAlloyDuringTest.
  if (options.includeAlloyLibrary) {
    addRemoteUrlClientScript({
      clientScripts,
      url: remoteAlloyLibraryUrl,
      async: true
    });
  }

  return clientScripts;
};

const getFixtureClientScriptsByEnvironment = {
  int: getFixtureClientScriptsForInt,
  prod: getFixtureClientScriptsForProd
};

/**
 * Injects Alloy into the page while running a test against Alloy int.
 */
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

/**
 * Injects Alloy into the page while running a test against Alloy prod.
 */
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
