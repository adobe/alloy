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

import configureCommandFactory from "../../../../src/core/configureCommandFactory";

describe("configureCommandFactory", () => {
  let componentCreators;
  let config;
  let createConfig;
  let configValidators;
  let logCommand;
  let logger;
  let initializeComponents;
  let setErrorsEnabled;
  let window;
  let configureCommand;

  beforeEach(() => {
    const componentCreator = () => {};
    componentCreator.configValidators = {};
    componentCreators = [componentCreator];
    config = {
      addValidators: jasmine.createSpy(),
      validate: jasmine.createSpy().and.returnValue(true)
    };
    createConfig = jasmine.createSpy().and.returnValue(config);
    configValidators = {};
    logCommand = jasmine.createSpy();
    logger = {
      enabled: false,
      log: jasmine.createSpy()
    };
    initializeComponents = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve("initializeComponentsResult"));
    setErrorsEnabled = jasmine.createSpy();
    window = {
      location: {
        search: ""
      }
    };
    configureCommand = configureCommandFactory({
      componentCreators,
      createConfig,
      configValidators,
      logCommand,
      logger,
      initializeComponents,
      setErrorsEnabled,
      window
    });
  });

  it("adds validators and validates options", () => {
    const options = {};
    configureCommand(options);
    expect(createConfig).toHaveBeenCalledWith(options);
    expect(config.addValidators).toHaveBeenCalledWith(configValidators);
    expect(config.addValidators).toHaveBeenCalledWith(
      componentCreators[0].configValidators
    );
    expect(config.validate).toHaveBeenCalled();
  });

  it("sets errors enabled based on config", () => {
    config.errorsEnabled = true;
    configureCommand({});
    expect(setErrorsEnabled).toHaveBeenCalledWith(true);
  });

  it("calls log command based on config", () => {
    config.logEnabled = true;
    configureCommand({});
    expect(logCommand).toHaveBeenCalledWith({
      enabled: true
    });
  });

  it("calls log command based on querystring (and takes priority over config)", () => {
    config.logEnabled = false;
    window.location.search = "?alloy_log=true";
    configureCommand({});
    expect(logCommand).toHaveBeenCalledWith({
      enabled: true
    });
  });

  it("logs computed configuration", () => {
    logger.enabled = true;
    config.toJSON = () => ({ foo: "bar" });
    configureCommand({});
    expect(logger.log).toHaveBeenCalledWith("Computed configuration:", {
      foo: "bar"
    });
  });

  it("initializes components", () => {
    return configureCommand({}).then(result => {
      expect(initializeComponents).toHaveBeenCalledWith(config);
      expect(result).toBe("initializeComponentsResult");
    });
  });
});
