/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createViewCacheManager from "../../../../../src/components/Personalization/createViewCacheManager";

xdescribe("Personalization::createCacheManager", () => {
  const viewHandles = [
    {
      id: "foo1",
      scope: "home",
      scopeDetails: {
        characteristics: {
          scopeType: "view"
        }
      }
    },
    {
      id: "foo2",
      scope: "home",
      scopeDetails: {
        characteristics: {
          scopeType: "view"
        }
      }
    },
    {
      id: "foo3",
      scope: "cart",
      scopeDetails: {
        characteristics: {
          scopeType: "view"
        }
      }
    },
    {
      id: "foo4",
      scope: "other"
    }
  ];

  let createProposition;

  beforeEach(() => {
    createProposition = viewHandle => {
      const proposition = jasmine.createSpyObj("proposition", [
        "includeInDisplayNotification",
        "excludeInReturnedPropositions",
        "getHandle"
      ]);
      proposition.getHandle.and.returnValue(viewHandle);
      return proposition;
    };
  });

  it("stores and gets the decisions based on a viewName", async () => {
    const viewCacheManager = createViewCacheManager({ createProposition });

    const cacheUpdate = viewCacheManager.createCacheUpdate("home");
    const resultingHandles = cacheUpdate.update(viewHandles);
    expect(resultingHandles.map(h => h.getHandle())).toEqual([
      viewHandles[0],
      viewHandles[1],
      viewHandles[3]
    ]);

    const homeViews = await viewCacheManager.getView("home");
    expect(homeViews.map(h => h.getHandle())).toEqual([
      viewHandles[0],
      viewHandles[1]
    ]);

    const cartViews = await viewCacheManager.getView("cart");
    expect(cartViews.map(h => h.getHandle())).toEqual([viewHandles[2]]);

    const otherViews = await viewCacheManager.getView("other");
    expect(otherViews.map(h => h.getHandle())).toEqual([
      {
        scope: "other",
        scopeDetails: {
          characteristics: {
            scopeType: "view"
          }
        }
      }
    ]);
  });

  it("should be no views when decisions deferred is rejected", async () => {
    const viewCacheManager = createViewCacheManager({ createProposition });
    const cacheUpdate = viewCacheManager.createCacheUpdate("home");
    cacheUpdate.cancel();

    const homeViews = await viewCacheManager.getView("home");
    expect(homeViews.map(h => h.getHandle())).toEqual([
      {
        scope: "home",
        scopeDetails: {
          characteristics: {
            scopeType: "view"
          }
        }
      }
    ]);
  });

  it("should not be initialized when first created", () => {
    const viewCacheManager = createViewCacheManager({ createProposition });
    expect(viewCacheManager.isInitialized()).toBe(false);
  });

  it("should be initialized when first cache update is created", () => {
    const viewCacheManager = createViewCacheManager({ createProposition });
    viewCacheManager.createCacheUpdate("home");
    expect(viewCacheManager.isInitialized()).toBe(true);
  });
});
