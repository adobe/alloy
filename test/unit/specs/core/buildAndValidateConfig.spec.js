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

import buildAndValidateConfig from "../../../../src/core/buildAndValidateConfig";

describe("buildAndValidateConfig", () => {
  let options;
  let componentCreators;
  let config;
  let createConfig;
  let coreConfigValidators;
  let logger;
  let setLogEnabled;
  let setErrorsEnabled;

  beforeEach(() => {
    options = {};
    const componentCreator = () => {};
    componentCreator.configValidators = {
      idSyncEnabled: {
        defaultValue: true,
        validate() {
          return "";
        }
      }
    };
    componentCreators = [componentCreator];
    config = {
      addValidators: jasmine.createSpy(),
      validate: jasmine.createSpy().and.returnValue(true)
    };
    createConfig = jasmine.createSpy().and.returnValue(config);
    coreConfigValidators = {
      errorsEnabled: {
        validate() {
          return "";
        },
        defaultValue: true
      }
    };
    logger = {
      enabled: false,
      log: jasmine.createSpy()
    };
    setLogEnabled = jasmine.createSpy();
    setErrorsEnabled = jasmine.createSpy();
  });

  it("adds validators and validates options", () => {
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      coreConfigValidators,
      logger,
      setLogEnabled,
      setErrorsEnabled
    });
    expect(createConfig).toHaveBeenCalledWith(options);
    expect(config.addValidators).toHaveBeenCalledWith(coreConfigValidators);
    expect(config.addValidators).toHaveBeenCalledWith(
      componentCreators[0].configValidators
    );
    expect(config.validate).toHaveBeenCalled();
  });

  it("sets errors enabled based on config", () => {
    config.errorsEnabled = true;
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      configValidators: coreConfigValidators,
      logger,
      setLogEnabled,
      setErrorsEnabled
    });
    expect(setErrorsEnabled).toHaveBeenCalledWith(true);
  });

  it("calls log command based on config", () => {
    config.logEnabled = true;
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      configValidators: coreConfigValidators,
      logger,
      setLogEnabled,
      setErrorsEnabled
    });
    expect(setLogEnabled).toHaveBeenCalledWith(true, {
      persist: false,
      highPriority: false
    });
  });

  it("logs and returns computed configuration", () => {
    logger.enabled = true;
    config.toJSON = () => ({ foo: "bar" });
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      configValidators: coreConfigValidators,
      logger,
      setLogEnabled,
      setErrorsEnabled
    });
    expect(logger.log).toHaveBeenCalledWith("Computed configuration:", {
      foo: "bar"
    });
  });

  it("returns config", () => {
    const result = buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      configValidators: coreConfigValidators,
      logger,
      setLogEnabled,
      setErrorsEnabled
    });
    expect(result).toBe(config);
  });
});
