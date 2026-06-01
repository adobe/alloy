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

import { describe, it, expect } from "vitest";
import { createGetAssuranceValidationTokenParams } from "../../../../../src/utils/request/index.js";
import uuidV4Regex from "../../../constants/uuidV4Regex.js";

let currentSearch = "";
const getLocationSearch = () => currentSearch;

describe("createGetAssuranceValidationTokenParams", () => {
  it("returns empty string when no session ID in query", () => {
    currentSearch = "";
    const fn = createGetAssuranceValidationTokenParams({ getLocationSearch });
    expect(fn()).toEqual("");
  });

  it("returns empty string when session ID param is empty", () => {
    currentSearch = "?adb_validation_sessionid=";
    const fn = createGetAssuranceValidationTokenParams({ getLocationSearch });
    expect(fn()).toEqual("");
  });

  it("returns validation token with UUID client ID when session ID present", () => {
    currentSearch = "?adb_validation_sessionid=abc-123";
    const fn = createGetAssuranceValidationTokenParams({ getLocationSearch });
    const result = fn();
    const [token, clientId] = result.split("%7C");
    expect(token).toEqual("&adobeAepValidationToken=abc-123");
    expect(uuidV4Regex.test(clientId)).toBe(true);
  });

  it("uses the same client ID across multiple calls on the same instance", () => {
    currentSearch = "?adb_validation_sessionid=abc-123";
    const fn = createGetAssuranceValidationTokenParams({ getLocationSearch });
    const [, firstClientId] = fn().split("%7C");
    currentSearch = "?adb_validation_sessionid=abc-456";
    const [, secondClientId] = fn().split("%7C");
    expect(firstClientId).toEqual(secondClientId);
  });

  it("works with session ID among other query params", () => {
    currentSearch =
      "?lang=en&sort=relevancy&f:el_product=[Data%20Collection]&adb_validation_sessionid=abc-123";
    const fn = createGetAssuranceValidationTokenParams({ getLocationSearch });
    const [token] = fn().split("%7C");
    expect(token).toEqual("&adobeAepValidationToken=abc-123");
  });
});
