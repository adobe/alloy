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
import defer from "../../../src/view/utils/defer";

const READY_EVENT = "extension-reactor-alloy:rendered";

export default function createBridge() {
  const deferredRegistration = defer();

  const bridge = {
    register: (options) => {
      deferredRegistration.resolve(options);
    },
    openCodeEditor: (...args) => bridge.openCodeEditorMock(...args),
    openCodeEditorMock: async ({ code }) => {
      return Promise.resolve(`${code} + modified code`);
    },
    openDataElementSelector: (...args) =>
      bridge.openDataElementSelectorMock(...args),
    openDataElementSelectorMock: async ({ tokenize }) => {
      return Promise.resolve(
        tokenize ? "%data element name%" : "data element name",
      );
    },
    openRegexTester: (...args) => bridge.openRegexTesterMock(...args),
    openRegexTesterMock: async () => {
      return Promise.resolve(
        `Edited Regex ${Math.round(Math.random() * 10000)}`,
      );
    },
    ready: new Promise((resolve) => {
      const handler = () => {
        window.removeEventListener(READY_EVENT, handler);
        resolve();
      };
      window.addEventListener(READY_EVENT, handler);
    }),
    registration: deferredRegistration.promise,
  };
  return bridge;
}
