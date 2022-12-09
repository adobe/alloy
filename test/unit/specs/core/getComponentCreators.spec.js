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

import getComponentCreators from "../../../../src/core/getComponentCreators";
import {
  allComponents,
  LIBRARY_INFO
} from "../../../../src/constants/componentNames";

describe("getComponentImporters", () => {
  it("returns an array of Promises that resolve to component creators", async () => {
    const componentCreators = getComponentCreators();
    expect(componentCreators).toEqual(jasmine.any(Array));
    expect(componentCreators.length).toBe(allComponents.length);
    await Promise.all(
      componentCreators.map(async creatorPromise => {
        expect(creatorPromise).toBeInstanceOf(Promise);
        const componentCreator = await creatorPromise;
        expect(componentCreator).toEqual(jasmine.any(Function));
        expect(componentCreator.namespace).toEqual(jasmine.any(String));

        if (componentCreator.configValidators) {
          expect(componentCreator.configValidators).toEqual(
            jasmine.any(Object)
          );
        }
      })
    );
  });

  it("includes only the requested components", async () => {
    const componentCreators = getComponentCreators([LIBRARY_INFO]);
    expect(componentCreators.length).toBe(1);
    const libraryInfoComponent = await componentCreators[0];
    expect(libraryInfoComponent).toEqual(jasmine.any(Function));
    expect(libraryInfoComponent.namespace).toEqual(jasmine.any(String));

    if (libraryInfoComponent.configValidators) {
      expect(libraryInfoComponent.configValidators).toEqual(
        jasmine.any(Object)
      );
    }
  });
});
