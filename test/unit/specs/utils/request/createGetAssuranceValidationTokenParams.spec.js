/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createGetAssuranceValidationTokenParams } from "../../../../../src/utils/request";
import { injectStorage } from "../../../../../src/utils";

import uuidV4Regex from "../../../constants/uuidV4Regex";

const win = {
  location: {
    search: ""
  },
  localStorage: window.localStorage
};

describe("createGetAssuranceValidationTokenParams", () => {
  it("gets validation token params", () => {
    let result;
    let token;
    let firstClientId;
    let clientId;
    const getAssuranceValidationTokenParams = createGetAssuranceValidationTokenParams(
      {
        window: win,
        createNamespacedStorage: injectStorage(win)
      }
    );
    expect(getAssuranceValidationTokenParams()).toEqual("");

    win.location.search = "?adb_validation_sessionid=abc-123";
    result = getAssuranceValidationTokenParams();
    // eslint-disable-next-line prefer-const
    [token, firstClientId] = result.split("%7C");
    expect(token).toEqual("&adobeAepValidationToken=abc-123");
    expect(uuidV4Regex.test(firstClientId)).toBeTrue();
    expect(
      win.localStorage.getItem("com.adobe.alloy.validation.clientId")
    ).toEqual(firstClientId);

    win.location.search = "?adb_validation_sessionid=abc-123%20fgh";
    result = getAssuranceValidationTokenParams();
    [token, clientId] = result.split("%7C");
    expect(token).toEqual("&adobeAepValidationToken=abc-123%20fgh");
    expect(clientId).toEqual(firstClientId);

    win.location.search =
      "?lang=en&sort=relevancy&f:el_product=[Data%20Collection]&adb_validation_sessionid=abc-123";
    result = getAssuranceValidationTokenParams();
    [token, clientId] = result.split("%7C");
    expect(token).toEqual("&adobeAepValidationToken=abc-123");
    expect(clientId).toEqual(firstClientId);

    win.location.search =
      "?lang=en&sort=relevancy&f:el_product=[Data%20Collection]";
    expect(getAssuranceValidationTokenParams()).toEqual("");

    win.location.search = "?adb_validation_sessionid=";
    expect(getAssuranceValidationTokenParams()).toEqual("");
  });
});
