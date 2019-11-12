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
  let validator;
  let createConfigValidator;
  let coreConfigValidators;
  let logger;
  let setDebugEnabled;
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
    validator = {
      addValidators: jasmine.createSpy(),
      validate: jasmine.createSpy().and.returnValue(true)
    };
    config = options;
    createConfig = jasmine.createSpy().and.returnValue(config);
    createConfigValidator = jasmine.createSpy().and.returnValue(validator);
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
    setDebugEnabled = jasmine.createSpy();
    setErrorsEnabled = jasmine.createSpy();
  });

  it("adds validators and validates options", () => {
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      createConfigValidator,
      coreConfigValidators,
      logger,
      setDebugEnabled,
      setErrorsEnabled
    });
    expect(createConfig).toHaveBeenCalledWith(options);
    expect(validator.addValidators).toHaveBeenCalledWith(coreConfigValidators);
    expect(validator.addValidators).toHaveBeenCalledWith(
      componentCreators[0].configValidators
    );
    expect(validator.validate).toHaveBeenCalled();
  });

  it("sets errors enabled based on config", () => {
    config.errorsEnabled = true;
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      createConfigValidator,
      configValidators: coreConfigValidators,
      logger,
      setDebugEnabled,
      setErrorsEnabled
    });
    expect(setErrorsEnabled).toHaveBeenCalledWith(true);
  });

  it("sets debug enabled based on config", () => {
    config.debugEnabled = true;
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      createConfigValidator,
      configValidators: coreConfigValidators,
      logger,
      setDebugEnabled,
      setErrorsEnabled
    });
    expect(setDebugEnabled).toHaveBeenCalledWith(true, { fromConfig: true });
  });

  it("logs and returns computed configuration", () => {
    logger.enabled = true;
    config.foo = "bar";
    buildAndValidateConfig({
      options,
      componentCreators,
      createConfig,
      createConfigValidator,
      configValidators: coreConfigValidators,
      logger,
      setDebugEnabled,
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
      createConfigValidator,
      configValidators: coreConfigValidators,
      logger,
      setDebugEnabled,
      setErrorsEnabled
    });
    expect(result).toEqual(config);
  });
});
