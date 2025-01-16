/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import createGetIdentityOptionsValidator from "../../../../../../src/components/Identity/getIdentity/createGetIdentityOptionsValidator.js";

describe("Identity::getIdentityOptionsValidator", () => {
  const thirdPartyValidator = createGetIdentityOptionsValidator({
    thirdPartyCookiesEnabled: true,
  });
  const firstPartyValidator = createGetIdentityOptionsValidator({
    thirdPartyCookiesEnabled: false,
  });
  it("should throw an error when invalid options are passed", () => {
    expect(() => {
      thirdPartyValidator({
        key: ["item1", "item2"],
      });
    }).toThrow(new Error("'key': Unknown field."));
    expect(() => {
      thirdPartyValidator({
        key1: ["item1", "item2"],
        key2: ["item1", "item2"],
      });
    }).toThrow(new Error("'key1': Unknown field.\n'key2': Unknown field."));
    expect(() => {
      thirdPartyValidator({
        namespaces: [],
      });
    }).toThrow(
      new Error("'namespaces': Expected a non-empty array, but got []."),
    );
    expect(() => {
      thirdPartyValidator({
        namespaces: ["ECID", "ECID"],
      });
    }).toThrow(
      new Error(
        `'namespaces': Expected array values to be unique, but got ["ECID","ECID"].`,
      ),
    );
    expect(() => {
      thirdPartyValidator({
        namespaces: ["ACD"],
      });
    }).toThrow(
      new Error(
        `'namespaces[0]': Expected one of these values: ["ECID","CORE"], but got "ACD".`,
      ),
    );
  });
  it("should return valid options when no options are passed", () => {
    expect(() => {
      thirdPartyValidator();
    }).not.toThrow();
    const validatedIdentityOptions = thirdPartyValidator();
    expect(validatedIdentityOptions).toEqual({
      namespaces: ["ECID"],
    });
  });
  it("should not throw when supported namespace options are passed", () => {
    const ECID = "ECID";
    expect(() => {
      thirdPartyValidator({
        namespaces: [ECID],
      });
    }).not.toThrow();
  });
  it("should return valid options when configuration is passed", () => {
    expect(() => {
      thirdPartyValidator({
        edgeConfigOverrides: {
          identity: {
            idSyncContainerId: "123",
          },
        },
      });
    }).not.toThrow();
  });
  it("should return valid options when an empty configuration is passed", () => {
    expect(() => {
      thirdPartyValidator({
        edgeConfigOverrides: {},
      });
    }).not.toThrow();
  });
  it("should throw an error when CORE is passed with third party cookies disabled", () => {
    expect(() => {
      firstPartyValidator({
        namespaces: ["CORE"],
      });
    }).toThrow(
      new Error(
        `namespaces: The CORE namespace cannot be requested when third-party cookies are disabled.`,
      ),
    );
  });
  it("should not throw when CORE is passed with third party cookies enabled", () => {
    expect(() => {
      thirdPartyValidator({
        namespaces: ["CORE"],
      });
    }).not.toThrow();
  });
});
