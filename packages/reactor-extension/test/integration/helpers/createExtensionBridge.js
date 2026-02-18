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

export default ({ openCodeEditor } = {}) => {
  let registeredOptions;

  return {
    register(options) {
      registeredOptions = options;
    },

    init(initInfo) {
      initInfo = {
        company: { orgId: "1234@AdobeOrg" },
        tokens: { imsAccess: "IMS_ACCESS" },
        propertySettings: { id: "PR1234" },
        ...initInfo,
      };

      registeredOptions.init.apply(this, [initInfo]);
    },

    async validate(...args) {
      const validationResult = await registeredOptions.validate.apply(
        this,
        args,
      );

      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      return validationResult;
    },

    getSettings(...args) {
      return registeredOptions.getSettings.apply(this, args);
    },

    openCodeEditor({ code }) {
      if (openCodeEditor) {
        return openCodeEditor({ code });
      }

      return Promise.resolve(`${code} + modified code`);
    },

    openRegexTester() {
      return `Edited Regex ${Math.round(Math.random() * 10000)}`;
    },

    openDataElementSelector({ tokenize }) {
      return Promise.resolve(
        tokenize ? "%data element name%" : "data element name",
      );
    },
  };
};
