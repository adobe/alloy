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

import createCoreConfigs from "../../../../../src/core/config/createCoreConfigs.js";
import {
  IN,
  OUT,
  PENDING,
} from "../../../../../src/constants/consentStatus.js";

describe("createCoreConfigs", () => {
  let validator;
  const baseConfig = { datastreamId: "1234", orgId: "org1" };

  beforeEach(() => {
    validator = createCoreConfigs();
  });

  describe("debugEnabled", () => {
    it("validates debugEnabled=undefined", () => {
      const config = validator(baseConfig);
      expect(config.debugEnabled).toBe(false);
    });

    it("validates debugEnabled=true", () => {
      const config = validator({
        debugEnabled: true,
        ...baseConfig,
      });
      expect(config.debugEnabled).toBe(true);
    });
    it("validates debugEnabled=false", () => {
      const config = validator({
        debugEnabled: false,
        ...baseConfig,
      });
      expect(config.debugEnabled).toBe(false);
    });

    it("validates debugEnabled=123", () => {
      expect(() => {
        validator({ debugEnabled: 123, ...baseConfig });
      }).toThrowError();
    });
  });

  describe("defaultConsent", () => {
    it("validates defaultConsent=undefined", () => {
      const config = validator(baseConfig);
      expect(config.defaultConsent).toEqual(IN);
    });
    it("validates defaultConsent={}", () => {
      expect(() => {
        validator({
          defaultConsent: {},
          ...baseConfig,
        });
      }).toThrowError();
    });
    it("validates defaultConsent='in'", () => {
      const config = validator({
        defaultConsent: IN,
        ...baseConfig,
      });
      expect(config.defaultConsent).toEqual(IN);
    });
    it("validates defaultConsent='pending'", () => {
      const config = validator({
        defaultConsent: PENDING,
        ...baseConfig,
      });
      expect(config.defaultConsent).toEqual(PENDING);
    });
    it("validates defaultConsent=123", () => {
      expect(() => {
        validator({ defaultConsent: 123, ...baseConfig });
      }).toThrowError();
    });
    it("validates defaultConsent='out'", () => {
      const config = validator({
        defaultConsent: OUT,
        ...baseConfig,
      });
      expect(config.defaultConsent).toEqual(OUT);
    });
  });

  [
    { datastreamId: "asdfasdf", orgId: "" },
    { datastreamId: "asdfasdf", orgId: "" },
    {
      datastreamId: "myproperty1",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    },
    {
      datastreamId: "myproperty1",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    },
    {
      datastreamId: "myproperty1",
      edgeDomain: "stats.firstparty.com",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    },
    {
      datastreamId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    },
    {
      datastreamId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
    },
    {
      datastreamId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
      configurationOverrides: {
        experience_platform: {
          datasets: {
            event: "werewr",
            profile: "www",
          },
        },
      },
    },
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      validator(cfg);
    });
  });

  [
    {},
    { datastreamId: "myproperty1", edgeDomain: "" },
    { datastreamId: "myproperty1", edgeDomain: "stats firstparty.com" },
    {
      datastreamId: "myproperty1",
      edgeDomain: "stats firstparty.com",
      prehidingStyle: "",
    },
    {
      datastreamId: "myproperty1",
      edgeBasePath: 123,
    },
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      expect(() => validator(cfg)).toThrowError();
    });
  });

  it("invalidates duplicate configIds", () => {
    const config1 = { datastreamId: "property1", orgId: "ims1" };
    const config2 = { datastreamId: "property2", orgId: "ims2" };
    const config3 = { datastreamId: "property1", orgId: "ims3" };

    validator(config1);
    validator(config2);
    expect(() => validator("", config3)).toThrowError();
  });

  it("invalidates duplicate orgIds", () => {
    const config1 = { datastreamId: "a", orgId: "a" };
    const config2 = { datastreamId: "b", orgId: "b" };
    const config3 = { datastreamId: "c", orgId: "a" };

    validator(config1);
    validator(config2);
    expect(() => validator("", config3)).toThrowError();
  });
});
