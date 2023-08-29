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
import createConfig from "../../../../src/core/config/createConfig";
import { boolean, objectOf } from "../../../../src/utils/validation";

describe("buildAndValidateConfig", () => {
  let options;
  let componentCreators;
  let coreConfigValidators;
  let logger;
  let setDebugEnabled;

  beforeEach(() => {
    options = {};
    const componentCreator = () => {};
    componentCreator.configValidators = objectOf({
      idSyncEnabled: boolean().default(true)
    });
    componentCreators = [componentCreator];
    coreConfigValidators = objectOf({
      debugEnabled: boolean().default(false),
      errorsEnabled: boolean()
    })
      .noUnknownFields()
      .required();
    logger = {
      enabled: false,
      info: jasmine.createSpy(),
      logOnBeforeCommand: jasmine.createSpy(),
      logOnInstanceConfigured: jasmine.createSpy()
    };
    setDebugEnabled = jasmine.createSpy();
  });

  it("adds validators and validates options", () => {
    expect(() => {
      buildAndValidateConfig({
        options: { idSyncEnabled: "invalid value" },
        componentCreators,
        coreConfigValidators,
        createConfig,
        logger,
        setDebugEnabled
      });
    }).toThrowError();
  });

  it("sets debug enabled based on config", () => {
    options.debugEnabled = true;
    buildAndValidateConfig({
      options,
      componentCreators,
      coreConfigValidators,
      createConfig,
      logger,
      setDebugEnabled
    });
    expect(setDebugEnabled).toHaveBeenCalledWith(true, { fromConfig: true });
  });

  it("logs and returns computed configuration", () => {
    logger.enabled = true;
    buildAndValidateConfig({
      options,
      componentCreators,
      coreConfigValidators,
      createConfig,
      logger,
      setDebugEnabled
    });
    expect(logger.logOnInstanceConfigured).toHaveBeenCalledWith({
      config: {
        debugEnabled: false,
        idSyncEnabled: true
      }
    });
  });

  it("throws an error for unknown fields", () => {
    logger.enabled = true;
    options.foo = "bar";
    expect(() =>
      buildAndValidateConfig({
        options,
        componentCreators,
        coreConfigValidators,
        createConfig,
        logger,
        setDebugEnabled
      })
    ).toThrowError();
  });

  it("returns config", () => {
    const result = buildAndValidateConfig({
      options,
      componentCreators,
      coreConfigValidators,
      createConfig,
      logger,
      setDebugEnabled
    });
    expect(result).toEqual({ idSyncEnabled: true, debugEnabled: false });
  });
});
