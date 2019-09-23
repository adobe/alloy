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

import initializeComponentsFactory from "../../../../src/core/initializeComponentsFactory";

describe("initializeComponentsFactory", () => {
  let spawnedLoggerByPrefix;
  let componentNamespacedCookieJarByAbbreviation;
  let logger;
  let cookieProxy;
  let createCookieProxy;
  let createComponentNamespacedCookieJar;
  let lifecycle;
  let componentRegistry;
  let network;
  let createNetwork;
  let optIn;
  let componentByNamespace;
  let componentCreators;
  let initializeComponents;
  let config;

  beforeEach(() => {
    spawnedLoggerByPrefix = {};
    componentNamespacedCookieJarByAbbreviation = {};
    logger = {
      spawn: jasmine.createSpy().and.callFake(prefix => {
        const spawnedLogger = {};
        spawnedLoggerByPrefix[prefix] = spawnedLogger;
        return spawnedLogger;
      })
    };
    cookieProxy = {
      get() {},
      set() {}
    };
    createCookieProxy = jasmine.createSpy().and.returnValue(cookieProxy);
    createComponentNamespacedCookieJar = jasmine
      .createSpy()
      .and.callFake((_cookieProxy, abbreviation) => {
        const componentNamespacedCookieJar = {
          get() {},
          set() {},
          remove() {}
        };
        componentNamespacedCookieJarByAbbreviation[
          abbreviation
        ] = componentNamespacedCookieJar;
        return componentNamespacedCookieJar;
      });
    lifecycle = {
      onComponentsRegistered: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve())
    };
    componentRegistry = {
      register: jasmine.createSpy()
    };
    network = {};
    createNetwork = jasmine.createSpy().and.returnValue(network);
    optIn = {
      enable() {}
    };
    componentByNamespace = {
      Comp1: {},
      Comp2: {}
    };
    const componentCreator1 = jasmine
      .createSpy()
      .and.returnValue(componentByNamespace.Comp1);
    componentCreator1.namespace = "Comp1";
    componentCreator1.abbreviation = "c1";
    const componentCreator2 = jasmine
      .createSpy()
      .and.returnValue(componentByNamespace.Comp2);
    componentCreator2.namespace = "Comp2";
    componentCreator2.abbreviation = "c2";
    componentCreators = [componentCreator1, componentCreator2];
    initializeComponents = initializeComponentsFactory({
      componentCreators,
      logger,
      createCookieProxy,
      createComponentNamespacedCookieJar,
      lifecycle,
      componentRegistry,
      createNetwork,
      optIn
    });
    config = {
      imsOrgId: "ORG1"
    };
  });

  it("creates and registers components", () => {
    const initializeComponentsPromise = initializeComponents(config);

    expect(createNetwork).toHaveBeenCalledWith(config, logger, lifecycle);
    expect(createCookieProxy).toHaveBeenCalledWith(
      `adobe_alloy_ORG1`,
      180,
      jasmine.any(String)
    );
    componentCreators.forEach(componentCreator => {
      const { namespace, abbreviation } = componentCreator;
      const spawnedLoggerPrefix = `[${namespace}]`;
      expect(logger.spawn).toHaveBeenCalledWith(spawnedLoggerPrefix);
      expect(createComponentNamespacedCookieJar).toHaveBeenCalledWith(
        cookieProxy,
        abbreviation
      );
      expect(componentCreator).toHaveBeenCalledWith({
        logger: spawnedLoggerByPrefix[spawnedLoggerPrefix],
        cookieJar: componentNamespacedCookieJarByAbbreviation[abbreviation],
        config,
        enableOptIn: optIn.enable
      });
      expect(componentRegistry.register).toHaveBeenCalledWith(
        namespace,
        componentByNamespace[namespace]
      );
    });
    expect(lifecycle.onComponentsRegistered).toHaveBeenCalledWith({
      componentRegistry,
      lifecycle,
      network,
      optIn
    });

    return initializeComponentsPromise.then(result => {
      expect(result).toBe(componentRegistry);
    });
  });

  it("throws error if component throws error during creation", () => {
    componentCreators[1].and.throwError("thrownError");

    expect(() => {
      initializeComponents(config);
    }).toThrowError(/\[Comp2\] An error occurred during component creation./);
  });

  it("uses cookieDomain for cookie proxy if provided in config", () => {
    config.cookieDomain = "example.com";

    initializeComponents(config);

    expect(createCookieProxy).toHaveBeenCalledWith(
      `adobe_alloy_ORG1`,
      180,
      "example.com"
    );
  });
});
