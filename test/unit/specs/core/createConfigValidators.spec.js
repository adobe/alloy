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

import createConfigValidators from "../../../../src/core/createConfigValidators";
import createConfig from "../../../../src/core/createConfig";

describe("configValidators", () => {
  const baseConfig = { configId: "1234", imsOrgId: "org1" };

  describe("errorsEnabled", () => {
    it("validates errorsEnabled=undefined", () => {
      const config = createConfig(baseConfig);
      config.addValidators(createConfigValidators());
      config.validate();
      expect(config.get("errorsEnabled")).toBe(true);
    });

    it("validates errorsEnabled=true", () => {
      const config = createConfig({ errorsEnabled: true, ...baseConfig });
      config.addValidators(createConfigValidators());
      config.validate();
      expect(config.get("errorsEnabled")).toBe(true);
    });

    it("validates errorsEnabled=false", () => {
      const config = createConfig({ errorsEnabled: false, ...baseConfig });
      config.addValidators(createConfigValidators());
      config.validate();
      expect(config.get("errorsEnabled")).toBe(false);
    });

    it("validates errorsEnabled=123", () => {
      const config = createConfig({ errorsEnabled: 123, ...baseConfig });
      config.addValidators(createConfigValidators());
      expect(() => {
        config.validate();
      }).toThrowError();
    });
  });

  describe("logEnabled", () => {
    it("validates logEnabled=undefined", () => {
      const config = createConfig(baseConfig);
      config.addValidators(createConfigValidators());
      config.validate();
      expect(config.get("logEnabled")).toBe(false);
    });

    it("validates logEnabled=true", () => {
      const config = createConfig({ logEnabled: true, ...baseConfig });
      config.addValidators(createConfigValidators());
      config.validate();
      expect(config.get("logEnabled")).toBe(true);
    });

    it("validates logEnabled=false", () => {
      const config = createConfig({ logEnabled: false, ...baseConfig });
      config.addValidators(createConfigValidators());
      config.validate();
      expect(config.get("logEnabled")).toBe(false);
    });

    it("validates logEnabled=123", () => {
      const config = createConfig({ logEnabled: 123, ...baseConfig });
      config.addValidators(createConfigValidators());
      expect(() => {
        config.validate();
      }).toThrowError();
    });
  });

  [
    { configId: "", imsOrgId: "" },
    {
      configId: "myproperty1",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "stats.firstparty.com",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARY.COM",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      configId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARY.COM",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    }
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      configObj.addValidators(createConfigValidators());
      configObj.validate();
    });
  });

  [
    {},
    { configId: "myproperty1", edgeDomain: "" },
    { configId: "myproperty1", edgeDomain: "stats firstparty.com" },
    {
      configId: "myproperty1",
      edgeDomain: "stats firstparty.com"
    }
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      configObj.addValidators(createConfigValidators());
      expect(() => configObj.validate()).toThrowError();
    });
  });

  it("invalidates duplicate configIds", () => {
    const validators = createConfigValidators();
    const config1 = createConfig({ configId: "property1", imsOrgId: "ims1" });
    const config2 = createConfig({ configId: "property2", imsOrgId: "ims2" });
    const config3 = createConfig({ configId: "property1", imsOrgId: "ims3" });
    config1.addValidators(validators);
    config2.addValidators(validators);
    config3.addValidators(validators);
    config1.validate();
    config2.validate();
    expect(() => config3.validate()).toThrowError();
  });

  it("invalidates duplicate imsOrgIds", () => {
    const validators = createConfigValidators();
    const config1 = createConfig({ configId: "a", imsOrgId: "a" });
    const config2 = createConfig({ configId: "b", imsOrgId: "b" });
    const config3 = createConfig({ configId: "c", imsOrgId: "a" });
    config1.addValidators(validators);
    config2.addValidators(validators);
    config3.addValidators(validators);
    config1.validate();
    config2.validate();
    expect(() => config3.validate()).toThrowError();
  });
});
