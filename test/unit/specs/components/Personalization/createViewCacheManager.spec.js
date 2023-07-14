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
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Personalization::createCacheManager", () => {
  const cartView = "cart";
  const homeView = "home";
  const productsView = "products";
  const viewDecisions = {
    home: [
      {
        id: "foo1",
        items: [],
        scope: "home"
      },
      {
        id: "foo2",
        items: [],
        scope: "home"
      }
    ],
    cart: [
      {
        id: "foo3",
        items: [],
        scope: "cart"
      }
    ]
  };

  it("stores and gets the decisions based on a viewName", () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred = defer();

    viewCacheManager.storeViews(decisionsDeferred.promise);
    decisionsDeferred.resolve(viewDecisions);

    return Promise.all([
      expectAsync(viewCacheManager.getView(cartView)).toBeResolvedTo(
        viewDecisions[cartView]
      ),
      expectAsync(viewCacheManager.getView(homeView)).toBeResolvedTo(
        viewDecisions[homeView]
      )
    ]);
  });

  it("gets an empty array if there is no decisions for a specific view", () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred = defer();

    viewCacheManager.storeViews(decisionsDeferred.promise);
    decisionsDeferred.resolve(viewDecisions);

    return Promise.all([
      expectAsync(viewCacheManager.getView(productsView)).toBeResolvedTo([])
    ]);
  });

  it("should be no views when decisions deferred is rejected", () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred = defer();

    viewCacheManager.storeViews(decisionsDeferred.promise);
    decisionsDeferred.reject();

    return expectAsync(viewCacheManager.getView("cart"))
      .toBeResolvedTo([])
      .then(() => {
        expect(viewCacheManager.isInitialized()).toBeTrue();
      });
  });

  it("allows you to store the views multiple times", async () => {
    const viewCacheManager = createViewCacheManager();

    const decisionsDeferred1 = defer();
    viewCacheManager.storeViews(decisionsDeferred1.promise);
    decisionsDeferred1.resolve(viewDecisions);

    await expectAsync(viewCacheManager.getView(cartView)).toBeResolvedTo(
      viewDecisions[cartView]
    );

    const decisionsDeferred2 = defer();
    viewCacheManager.storeViews(decisionsDeferred2.promise);
    const cartViewPromise = viewCacheManager.getView(cartView);
    await flushPromiseChains();
    await expectAsync(cartViewPromise).toBePending();
    decisionsDeferred2.resolve({
      about: [
        {
          id: "foo4",
          items: [],
          scope: "about"
        }
      ]
    });

    await expectAsync(viewCacheManager.getView(cartView)).toBeResolvedTo(
      viewDecisions[cartView]
    );
    await expectAsync(viewCacheManager.getView("about")).toBeResolvedTo([
      {
        id: "foo4",
        items: [],
        scope: "about"
      }
    ]);
  });

  it("is initialized after the first storeViews call", () => {
    const viewCacheManager = createViewCacheManager();

    const decisionsDeferred1 = defer();
    viewCacheManager.storeViews(decisionsDeferred1.promise);

    expect(viewCacheManager.isInitialized()).toBeTrue();
  });

  it("is initialized even after a failure", async () => {
    const viewCacheManager = createViewCacheManager();
    const decisionsDeferred1 = defer();
    viewCacheManager.storeViews(decisionsDeferred1.promise);
    decisionsDeferred1.reject();
    await flushPromiseChains();

    expect(viewCacheManager.isInitialized()).toBeTrue();
  });

  it("applies the decisions in the order they were requested", async () => {
    const viewCacheManager = createViewCacheManager();

    const decisionsDeferred1 = defer();
    const decisionsDeferred2 = defer();
    viewCacheManager.storeViews(decisionsDeferred1.promise);
    const viewPromise1 = viewCacheManager.getView(cartView);
    viewCacheManager.storeViews(decisionsDeferred2.promise);
    const viewPromise2 = viewCacheManager.getView(cartView);

    decisionsDeferred2.resolve({
      cart: [
        {
          id: "foo4",
          items: [],
          scope: "cart"
        }
      ]
    });
    decisionsDeferred1.resolve(viewDecisions);

    await expectAsync(viewPromise2).toBeResolvedTo([
      {
        id: "foo4",
        items: [],
        scope: "cart"
      }
    ]);
    await expectAsync(viewPromise1).toBeResolvedTo(viewDecisions[cartView]);
    await expectAsync(viewCacheManager.getView(cartView)).toBeResolvedTo([
      {
        id: "foo4",
        items: [],
        scope: "cart"
      }
    ]);
  });
});
