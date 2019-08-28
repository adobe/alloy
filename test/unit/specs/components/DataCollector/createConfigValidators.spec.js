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

import createConfigValidators from "../../../../../src/components/DataCollector/createConfigValidators";
import createConfig from "../../../../../src/core/createConfig";

describe("DataCollector::createConfigValidators", () => {
  [
    { propertyId: "", imsOrgId: "" },
    {
      propertyId: "myproperty1",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      propertyId: "myproperty1",
      edgeDomain: "stats.firstparty.com",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      propertyId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARY.COM",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    },
    {
      propertyId: "myproperty1",
      edgeDomain: "STATS.FIRSTPARY.COM",
      prehidingStyle: "#foo",
      imsOrgId: "53A16ACB5CC1D3760A495C99@AdobeOrg"
    }
  ].forEach((cfg, i) => {
    it(`validates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      configObj.addValidators(createConfigValidators([], []));
      configObj.validate();
    });
  });

  [
    {},
    { propertyId: "myproperty1", edgeDomain: "" },
    { propertyId: "myproperty1", edgeDomain: "stats firstparty.com" },
    {
      propertyId: "myproperty1",
      edgeDomain: "stats firstparty.com",
      prehidingStyle: ""
    }
  ].forEach((cfg, i) => {
    it(`invalidates configuration (${i})`, () => {
      const configObj = createConfig(cfg);
      configObj.addValidators(createConfigValidators([], []));
      expect(() => configObj.validate()).toThrowError();
    });
  });

  it("invalidates duplicate propertyIds", () => {
    const validators = createConfigValidators([], []);
    const config1 = createConfig({ propertyId: "property1", imsOrgId: "ims1" });
    const config2 = createConfig({ propertyId: "property2", imsOrgId: "ims2" });
    const config3 = createConfig({ propertyId: "property1", imsOrgId: "ims3" });
    config1.addValidators(validators);
    config2.addValidators(validators);
    config3.addValidators(validators);
    config1.validate();
    config2.validate();
    expect(() => config3.validate()).toThrowError();
  });

  it("invalidates duplicate imsOrgIds", () => {
    const validators = createConfigValidators([], []);
    const config1 = createConfig({ propertyId: "a", imsOrgId: "a" });
    const config2 = createConfig({ propertyId: "b", imsOrgId: "b" });
    const config3 = createConfig({ propertyId: "c", imsOrgId: "a" });
    config1.addValidators(validators);
    config2.addValidators(validators);
    config3.addValidators(validators);
    config1.validate();
    config2.validate();
    expect(() => config3.validate()).toThrowError();
  });
});
