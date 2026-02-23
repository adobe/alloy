/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t } from "testcafe";

import credentials from "./adobeIOClientCredentials.mjs";
import getAdobeIOAccessToken from "./getAdobeIOAccessToken.mjs";

const getSettings = async () => {
  return t.eval(() => {
    return window.initializeExtensionViewPromise.then((extensionView) => {
      return extensionView.getSettings();
    });
  });
};

const validate = async () => {
  return t.eval(() => {
    return window.initializeExtensionViewPromise.then((extensionView) => {
      // Reactor calls getSettings in a couple scenarios that may not be
      // obvious:
      //
      // 1. The user attempts to navigate away from editing the
      // resource without saving. In this case, Reactor retrieves the
      // settings to compare them with the previously persisted settings
      // in order to determine if the view is dirty or not. If the settings
      // are different, Reactor will ask the user if they want to discard
      // their changes before navigating. In this case, validate is not
      // called--only getSettings.
      // 2. The user attempts to save the resource. In this case, validate
      // is called and then getSettings is called, regardless of what
      // is returned from validate. This is actually a bug in Reactor,
      // since calling getSettings is unnecessary if validate returns
      // false. https://jira.corp.adobe.com/browse/DTM-16223
      //
      // By calling getSettings every time we call validate, we can
      // be more certain getSettings is properly handling scenarios
      // where the view is in an invalid state.
      return extensionView.validate().then((isValid) => {
        return extensionView.getSettings().then(() => {
          return isValid;
        });
      });
    });
  });
};

export default {
  async init(additionalInitInfo = {}, sharedViewMethodMocks = {}) {
    const accessToken = await getAdobeIOAccessToken(credentials);
    const initInfo = {
      settings: null,
      extensionSettings: {},
      company: {
        orgId: credentials.orgId,
      },
      tokens: { imsAccess: accessToken },
      ...additionalInitInfo,
    };
    return t.eval(
      () => {
        window.initializeExtensionViewPromise = window.initializeExtensionView({
          initInfo,
          sharedViewMethodMocks,
        });
        // This promise will resolve when the extension view is rendered.
        return window.initializeExtensionViewPromise;
      },
      {
        dependencies: {
          initInfo,
          sharedViewMethodMocks,
        },
      },
    );
  },
  getSettings,
  validate,
  async expectIsValid() {
    const valid = await validate();
    await t
      .expect(valid)
      .ok("Expected settings to be valid when they were not valid");
  },
  async expectIsNotValid() {
    const valid = await validate();
    await t
      .expect(valid)
      .notOk("Expected settings to not be valid when they were valid");
  },
  async expectSettings(expectedSettings) {
    const actualSettings = await getSettings();
    await t.expect(actualSettings).eql(expectedSettings);
  },
  async expectSettingsToContain(expectedSettings) {
    const actualSettings = await getSettings();
    await t.expect(actualSettings).contains(expectedSettings);
  },
};
