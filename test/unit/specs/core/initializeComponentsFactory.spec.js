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
  let lifecycle;
  let componentRegistry;
  let optIn;
  let componentByNamespace;
  let componentCreators;
  let tools;
  let initializeComponents;
  let config;

  beforeEach(() => {
    lifecycle = {
      onComponentsRegistered: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve())
    };
    componentRegistry = {
      register: jasmine.createSpy()
    };
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

    tools = {
      tool1(_config) {
        return componentCreator => {
          return { name: "tool1", config: _config, componentCreator };
        };
      },
      tool2(_config) {
        return componentCreator => {
          return { name: "tool2", config: _config, componentCreator };
        };
      }
    };

    initializeComponents = initializeComponentsFactory({
      componentCreators,
      lifecycle,
      componentRegistry,
      tools,
      optIn
    });
    config = {
      imsOrgId: "ORG1"
    };
  });

  it("creates and registers components", () => {
    const initializeComponentsPromise = initializeComponents(config);

    componentCreators.forEach(componentCreator => {
      const { namespace } = componentCreator;
      expect(componentCreator).toHaveBeenCalledWith({
        tool1: {
          name: "tool1",
          config,
          componentCreator
        },
        tool2: {
          name: "tool2",
          config,
          componentCreator
        }
      });
      expect(componentRegistry.register).toHaveBeenCalledWith(
        namespace,
        componentByNamespace[namespace]
      );
    });
    expect(lifecycle.onComponentsRegistered).toHaveBeenCalledWith({
      componentRegistry,
      lifecycle,
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
});
