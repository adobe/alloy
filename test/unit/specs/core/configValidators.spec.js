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

import configValidators from "../../../../src/core/configValidators";
import createConfig from "../../../../src/core/createConfig";

describe("configValidators", () => {
  describe("errorsEnabled", () => {
    it("validates errorsEnabled=undefined", () => {
      const config = createConfig({});
      config.addValidators(configValidators);
      config.validate();
      expect(config.get("errorsEnabled")).toBe(true);
    });

    it("validates errorsEnabled=true", () => {
      const config = createConfig({ errorsEnabled: true });
      config.addValidators(configValidators);
      config.validate();
      expect(config.get("errorsEnabled")).toBe(true);
    });

    it("validates errorsEnabled=false", () => {
      const config = createConfig({ errorsEnabled: false });
      config.addValidators(configValidators);
      config.validate();
      expect(config.get("errorsEnabled")).toBe(false);
    });

    it("validates errorsEnabled=123", () => {
      const config = createConfig({ errorsEnabled: 123 });
      config.addValidators(configValidators);
      expect(() => {
        config.validate();
      }).toThrowError();
    });
  });

  describe("logEnabled", () => {
    it("validates logEnabled=undefined", () => {
      const config = createConfig({});
      config.addValidators(configValidators);
      config.validate();
      expect(config.get("logEnabled")).toBe(false);
    });

    it("validates logEnabled=true", () => {
      const config = createConfig({ logEnabled: true });
      config.addValidators(configValidators);
      config.validate();
      expect(config.get("logEnabled")).toBe(true);
    });

    it("validates logEnabled=false", () => {
      const config = createConfig({ logEnabled: false });
      config.addValidators(configValidators);
      config.validate();
      expect(config.get("logEnabled")).toBe(false);
    });

    it("validates logEnabled=123", () => {
      const config = createConfig({ logEnabled: 123 });
      config.addValidators(configValidators);
      expect(() => {
        config.validate();
      }).toThrowError();
    });
  });
});
