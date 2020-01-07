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

describe("createCoreConfigs", () => {
  const baseConfig = { configId: "1234", orgId: "org1" };

  describe("errorsEnabled", () => {
    it("validates errorsEnabled=undefined", () => {
      const config = objectOf(createCoreConfigs())(baseConfig);
      expect(config.errorsEnabled).toBe(true);
    });

    it("validates errorsEnabled=true", () => {
      const config = objectOf(createCoreConfigs())({
        errorsEnabled: true,
        ...baseConfig
      });
      expect(config.errorsEnabled).toBe(true);
    });

    it("validates errorsEnabled=false", () => {
      const config = objectOf(createCoreConfigs())({
        errorsEnabled: false,
        ...baseConfig
      });
      expect(config.errorsEnabled).toBe(false);
    });

    it("validates errorsEnabled=123", () => {
      expect(() => {
        objectOf(createCoreConfigs())({
          errorsEnabled: 123,
          ...baseConfig
        });
      }).toThrowError();
    });
  });

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

  [
    { configId: "", orgId: "" },
    {
      configId: "myproperty1",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "stats.firstparty.com",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARTY.COM",
      orgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    }
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      objectOf(createCoreConfigs())(cfg);
    });
  });

  [
    {},
    { configId: "myproperty1", edgeDomain: "" },
    { configId: "myproperty1", edgeDomain: "stats firstparty.com" },
    {
      configId: "myproperty1",
      edgeDomain: "stats firstparty.com",
      prehidingStyle: ""
    },
    {
      configId: "myproperty1",
      edgeBasePath: 123
    }
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      expect(() => objectOf(createCoreConfigs())(cfg)).toThrowError();
    });
  });

  it("invalidates duplicate configIds", () => {
    const validator = objectOf(createCoreConfigs());
    const config1 = { configId: "property1", orgId: "ims1" };
    const config2 = { configId: "property2", orgId: "ims2" };
    const config3 = { configId: "property1", orgId: "ims3" };

    validator(config1);
    validator(config2);
    expect(() => validator("", config3)).toThrowError();
  });

  it("invalidates duplicate orgIds", () => {
    const validator = objectOf(createCoreConfigs());
    const config1 = { configId: "a", orgId: "a" };
    const config2 = { configId: "b", orgId: "b" };
    const config3 = { configId: "c", orgId: "a" };

    validator(config1);
    validator(config2);
    expect(() => validator("", config3)).toThrowError();
  });
});
