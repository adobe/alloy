/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * This mocks the Reactor extension bridge. Doing so allows us to mock calls
 * from Reactor within our functional tests.
 */
(() => {
  // Wrapped in an IIFE so we limit pollution of the global scope.
  const sharedViewMethodMocks = {
    openCodeEditor() {
      return Promise.resolve(
        `Edited Code ${Math.round(Math.random() * 10000)}`,
      );
    },
    openRegexTester() {
      return Promise.resolve(
        `Edited Regex ${Math.round(Math.random() * 10000)}`,
      );
    },
    openDataElementSelector(options = {}) {
      let value = `dataElement${Math.round(Math.random() * 10000)}`;
      // Tokenize by default. The tokenize option must be set explicitly to false to disable it.
      if (options.tokenize !== false) {
        value = `%${value}%`;
      }
      return value;
    },
  };

  const registeredExtensionMethodsPromise = new Promise((resolve) => {
    window.extensionBridge = {
      register: resolve,
      openCodeEditor(...args) {
        return sharedViewMethodMocks.openCodeEditor(...args);
      },
      openRegexTester(...args) {
        return sharedViewMethodMocks.openRegexTester(...args);
      },
      openDataElementSelector(...args) {
        return sharedViewMethodMocks.openDataElementSelector(...args);
      },
    };
  });

  /**
   * Initialize an extension view.
   * @param {Object} initInfo
   * @param {Object} sharedViewMethodMocks An object containing methods that are typically provided
   * by Reactor to open a code editor, regex tester, or data element selector. If mocks aren't
   * explicitly specified, default mocks will be provided.
   * @param {Function} [sharedViewMethodMocks.openCodeEditor] Mock for opening a code editor.
   * @param {Function} [sharedViewMethodMocks.openRegexTester] Mock for opening a regular expression tester.
   * @param {Function} [sharedViewMethodMocks.openDataElementSelector] Mock for opening a data element selector.
   * @returns {Promise<{getSettings, validate}>}
   */
  window.initializeExtensionView = async ({
    initInfo,
    sharedViewMethodMocks: _sharedViewMethodMocks,
  }) => {
    Object.assign(sharedViewMethodMocks, _sharedViewMethodMocks);
    const registeredExtensionMethods = await registeredExtensionMethodsPromise;
    await registeredExtensionMethods.init(initInfo);

    return new Promise((resolve) => {
      const listener = () => {
        window.removeEventListener(
          "extension-reactor-alloy:rendered",
          listener,
        );
        resolve({
          getSettings: registeredExtensionMethods.getSettings,
          validate: registeredExtensionMethods.validate,
        });
      };

      window.addEventListener("extension-reactor-alloy:rendered", listener);
    });
  };
})();
