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

import createCoreConfigs from "../../../../../src/core/config/createCoreConfigs";
import { objectOf } from "../../../../../src/utils/validation";
import { IN, OUT, PENDING } from "../../../../../src/constants/consentStatus";

describe("createCoreConfigs", () => {
  const baseConfig = { edgeConfigId: "1234", orgId: "org1" };

  describe("debugEnabled", () => {
    it("validates debugEnabled=undefined", () => {
      const config = objectOf(createCoreConfigs())(baseConfig);
      expect(config.debugEnabled).toBe(false);
    });

    it("validates debugEnabled=true", () => {
      const config = objectOf(createCoreConfigs())({
        debugEnabled: true,
        ...baseConfig
      });
      expect(config.debugEnabled).toBe(true);
    });
    it("validates debugEnabled=false", () => {
      const config = objectOf(createCoreConfigs())({
        debugEnabled: false,
        ...baseConfig
      });
      expect(config.debugEnabled).toBe(false);
    });

    it("validates debugEnabled=123", () => {
      expect(() => {
        objectOf(createCoreConfigs())({ debugEnabled: 123, ...baseConfig });
      }).toThrowError();
    });
  });

  describe("defaultConsent", () => {
    it("validates defaultConsent=undefined", () => {
      const config = objectOf(createCoreConfigs())(baseConfig);
      expect(config.defaultConsent).toEqual(IN);
    });
    it("validates defaultConsent={}", () => {
      expect(() => {
        objectOf(createCoreConfigs())({
          defaultConsent: {},
          ...baseConfig
        });
      }).toThrowError();
    });
    it("validates defaultConsent='in'", () => {
      const config = objectOf(createCoreConfigs())({
        defaultConsent: IN,
        ...baseConfig
      });
      expect(config.defaultConsent).toEqual(IN);
    });
    it("validates defaultConsent='pending'", () => {
      const config = objectOf(createCoreConfigs())({
        defaultConsent: PENDING,
        ...baseConfig
      });
      expect(config.defaultConsent).toEqual(PENDING);
    });
    it("validates defaultConsent=123", () => {
      expect(() => {
        objectOf(createCoreConfigs())({ defaultConsent: 123, ...baseConfig });
      }).toThrowError();
    });
    it("validates defaultConsent='out'", () => {
      const config = objectOf(createCoreConfigs())({
        defaultConsent: OUT,
        ...baseConfig
      });
      expect(config.defaultConsent).toEqual(OUT);
    });
  });

  [
    { edgeConfigId: "", orgId: "" },
    {
      edgeConfigId: "myproperty1",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      edgeConfigId: "myproperty1",
      edgeDomain: "stats.firstparty.com",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      edgeConfigId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      edgeConfigId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      edgeConfigId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg",
      configurationOverrides: {
        experience_platform: {
          datasets: {
            event: "werewr",
            profile: "www"
          }
        }
      }
    }
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      objectOf(createCoreConfigs())(cfg);
    });
  });

  [
    {},
    { edgeConfigId: "myproperty1", edgeDomain: "" },
    { edgeConfigId: "myproperty1", edgeDomain: "stats firstparty.com" },
    {
      edgeConfigId: "myproperty1",
      edgeDomain: "stats firstparty.com",
      prehidingStyle: ""
    },
    {
      edgeConfigId: "myproperty1",
      edgeBasePath: 123
    }
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      expect(() => objectOf(createCoreConfigs())(cfg)).toThrowError();
    });
  });

  it("invalidates duplicate configIds", () => {
    const validator = objectOf(createCoreConfigs());
    const config1 = { edgeConfigId: "property1", orgId: "ims1" };
    const config2 = { edgeConfigId: "property2", orgId: "ims2" };
    const config3 = { edgeConfigId: "property1", orgId: "ims3" };

    validator(config1);
    validator(config2);
    expect(() => validator("", config3)).toThrowError();
  });

  it("invalidates duplicate orgIds", () => {
    const validator = objectOf(createCoreConfigs());
    const config1 = { edgeConfigId: "a", orgId: "a" };
    const config2 = { edgeConfigId: "b", orgId: "b" };
    const config3 = { edgeConfigId: "c", orgId: "a" };

    validator(config1);
    validator(config2);
    expect(() => validator("", config3)).toThrowError();
  });
});
