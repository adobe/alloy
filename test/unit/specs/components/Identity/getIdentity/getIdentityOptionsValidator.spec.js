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
import getIdentityOptionsValidator from "../../../../../../src/components/Identity/getIdentity/getIdentityOptionsValidator.js";

describe("Identity::getIdentityOptionsValidator", () => {
  it("should throw an error when invalid options are passed", () => {
    expect(() => {
      getIdentityOptionsValidator({ key: ["item1", "item2"] });
    }).toThrow(new Error("'key': Unknown field."));

    expect(() => {
      getIdentityOptionsValidator({
        key1: ["item1", "item2"],
        key2: ["item1", "item2"],
      });
    }).toThrow(new Error("'key1': Unknown field.\n'key2': Unknown field."));

    expect(() => {
      getIdentityOptionsValidator({ namespaces: [] });
    }).toThrow(
      new Error("'namespaces': Expected a non-empty array, but got []."),
    );

    expect(() => {
      getIdentityOptionsValidator({ namespaces: ["ECID", "ECID"] });
    }).toThrow(
      new Error(
        `'namespaces': Expected array values to be unique, but got ["ECID","ECID"].`,
      ),
    );

    expect(() => {
      getIdentityOptionsValidator({ namespaces: ["ACD"] });
    }).toThrow(new Error(`'namespaces[0]': Expected ECID, but got "ACD".`));
  });

  it("should return valid options when no options are passed", () => {
    expect(() => {
      getIdentityOptionsValidator();
    }).not.toThrow();
    const validatedIdentityOptions = getIdentityOptionsValidator();
    expect(validatedIdentityOptions).toEqual({ namespaces: ["ECID"] });
  });

  it("should not throw when supported namespace options are passed", () => {
    const ECID = "ECID";
    expect(() => {
      getIdentityOptionsValidator({ namespaces: [ECID] });
    }).not.toThrow();
  });

  it("should return valid options when configuration is passed", () => {
    expect(() => {
      getIdentityOptionsValidator({
        edgeConfigOverrides: { identity: { idSyncContainerId: "123" } },
      });
    }).not.toThrow();
  });

  it("should return valid options when an empty configuration is passed", () => {
    expect(() => {
      getIdentityOptionsValidator({
        edgeConfigOverrides: {},
      });
    }).not.toThrow();
  });
});
