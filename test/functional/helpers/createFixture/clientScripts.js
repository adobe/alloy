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
import readCache from "read-cache";
import { ClientFunction } from "testcafe";
import { INTEGRATION, PRODUCTION } from "../constants/alloyEnvironment.js";
import REMOTE_VISITOR_LIBRARY_URL from "../constants/remoteVisitorLibraryUrl.js";

const alloyEnv = process.env.ALLOY_ENV || INTEGRATION;
const alloyProdVersion = process.env.ALLOY_PROD_VERSION;
// eslint-disable-next-line no-console
console.log(`ALLOY ENV: ${alloyEnv}`);

if (alloyEnv === PRODUCTION) {
  if (alloyProdVersion) {
    // eslint-disable-next-line no-console
    console.log(`ALLOY PROD VERSION: ${alloyProdVersion}`);
  } else {
    throw new Error(
      "The ALLOY_PROD_VERSION environment variable must be provided when running against the production environment.",
    );
  }
}

const baseCodePath = path.join(__dirname, "../../../../dist/baseCode.js");
const localAlloyLibraryPath = path.join(
  __dirname,
  "../../../../dist/alloy.standalone.js",
);
const localNpmLibraryPath = path.join(__dirname, "../../../../dist/alloy.cjs");
const prodNpmLibraryPath = localNpmLibraryPath;
const remoteAlloyLibraryUrl = `https://cdn1.adoberesources.net/alloy/${alloyProdVersion}/alloy.js`;

// We use this getter for retrieving the library code instead of just loading
// the library code a single time up-front, because we want every run to be
// using the latest library code. This is important when developing in watch
// mode and making changes to source files.
const getLocalAlloyCode = () =>
  // readCache caches file content until the file is modified, at which
  // point it will retrieve fresh file content, cache it, and return it.
  readCache.sync(localAlloyLibraryPath, "utf8");
// This is the javascript built from src/index.js which does not include the
// baseCode, but exposes a createInstance function.
const getLocalNpmLibraryCode = () =>
  readCache.sync(localNpmLibraryPath, "utf8");
// This is the javascript built from the production @adobe/alloy npm Library
const getProdNpmLibraryCode = () => readCache.sync(prodNpmLibraryPath, "utf8");

export const injectInlineScript = ClientFunction((code) => {
  const scriptElement = document.createElement("script");

  scriptElement.innerHTML = code;
  document.getElementsByTagName("head")[0].appendChild(scriptElement);
});

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
    }></script>')`,
  });
};

/**
 * Produces an array of scripts that TestCafe should inject into the <head>
 * when testing Alloy int.
 */
const getFixtureClientScriptsForInt = (options) => {
  const clientScripts = [];

  if (options.monitoringHooksScript) {
    clientScripts.push({
      content: options.monitoringHooksScript,
    });
  }

  // Useful for testing Alloy + Visitor interaction.
  if (options.includeVisitorLibrary) {
    addRemoteUrlClientScript({
      clientScripts,
      url: REMOTE_VISITOR_LIBRARY_URL,
    });
  }

  clientScripts.push({
    content: baseCodeWithCustomInstances,
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
      content: `setTimeout(function() {\n${getLocalAlloyCode()}\n}, 10);`,
    });
  }

  if (options.includeNpmLibrary) {
    clientScripts.push({
      content: getLocalNpmLibraryCode(),
    });
  }
  return clientScripts;
};

/**
 * Produces an array of scripts that TestCafe should inject into the <head>
 * when testing Alloy prod.
 */
const getFixtureClientScriptsForProd = (options) => {
  const clientScripts = [];

  if (options.monitoringHooksScript) {
    clientScripts.push({
      content: options.monitoringHooksScript,
    });
  }

  // Useful for testing Alloy + Visitor interaction.
  if (options.includeVisitorLibrary) {
    addRemoteUrlClientScript({
      clientScripts,
      url: REMOTE_VISITOR_LIBRARY_URL,
    });
  }

  clientScripts.push({
    content: baseCodeWithCustomInstances,
  });

  // Typically the Alloy library should be loaded in head. For some tests,
  // like testing command queuing, we need greater control and will
  // load the Alloy library later during the test using injectAlloyDuringTest.
  if (options.includeAlloyLibrary) {
    addRemoteUrlClientScript({
      clientScripts,
      url: remoteAlloyLibraryUrl,
      async: true,
    });
  }

  if (options.includeNpmLibrary) {
    clientScripts.push({
      content: getProdNpmLibraryCode(),
    });
  }
  return clientScripts;
};

const getFixtureClientScriptsByEnvironment = {
  int: getFixtureClientScriptsForInt,
  prod: getFixtureClientScriptsForProd,
};

/**
 * Injects Alloy into the page while running a test against Alloy int.
 */
const injectAlloyDuringTestForInt = () =>
  injectInlineScript(getLocalAlloyCode());

/**
 * Injects Alloy into the page while running a test against Alloy prod.
 */
const injectAlloyDuringTestForProd = ClientFunction(
  () =>
    new Promise((resolve) => {
      const scriptElement = document.createElement("script");
      scriptElement.src = remoteAlloyLibraryUrl;
      scriptElement.addEventListener("load", () => {
        resolve();
      });
      document.getElementsByTagName("head")[0].appendChild(scriptElement);
    }),
  {
    dependencies: {
      remoteAlloyLibraryUrl,
    },
  },
);

const injectAlloyDuringTestByEnvironment = {
  [INTEGRATION]: injectAlloyDuringTestForInt,
  [PRODUCTION]: injectAlloyDuringTestForProd,
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
