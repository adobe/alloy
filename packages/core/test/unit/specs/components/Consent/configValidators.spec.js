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

import { describe, it, expect } from "vitest";
import configValidators from "../../../../../src/components/Consent/configValidators.js";

describe("defaultConsent", () => {
  it("validates defaultConsent=undefined", () => {
    const config = configValidators({});
    expect(config.defaultConsent).toEqual("in");
  });
  it("validates defaultConsent={}", () => {
    expect(() => {
      configValidators({
        defaultConsent: {},
      });
    }).toThrowError();
  });
  it("validates defaultConsent='in'", () => {
    const config = configValidators({
      defaultConsent: "in",
    });
    expect(config.defaultConsent).toEqual("in");
  });
  it("validates defaultConsent='pending'", () => {
    const config = configValidators({
      defaultConsent: "pending",
    });
    expect(config.defaultConsent).toEqual("pending");
  });
  it("validates defaultConsent=123", () => {
    expect(() => {
      configValidators({
        defaultConsent: 123,
      });
    }).toThrowError();
  });
  it("validates defaultConsent='out'", () => {
    const config = configValidators({
      defaultConsent: "out",
    });
    expect(config.defaultConsent).toEqual("out");
  });
});
