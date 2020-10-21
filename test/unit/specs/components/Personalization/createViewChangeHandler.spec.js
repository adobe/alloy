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

import createViewChangeHandler from "../../../../../src/components/Personalization/createViewChangeHandler";

describe("Personalization::createViewChangeHandler", () => {
  let personalization;
  let viewCache;
  let onResponse = jasmine.createSpy();
  const onRequestFailure = jasmine.createSpy();
  const executeCachedViewDecisions = jasmine.createSpy();
  const showContainers = jasmine.createSpy("showContainers");

  beforeEach(() => {
    personalization = jasmine.createSpyObj("personalization", [
      "isRenderDecisions",
      "getViewName"
    ]);
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
  });

  it("should trigger executeCachedViewDecisions if renderDecisions is true", () => {
    const viewChangeHandler = createViewChangeHandler({
      executeCachedViewDecisions,
      viewCache,
      showContainers
    });
    personalization.isRenderDecisions.and.returnValue(true);
    personalization.getViewName.and.returnValue("cart");

    viewChangeHandler({
      personalization,
      onResponse,
      onRequestFailure
    });
    expect(executeCachedViewDecisions).toHaveBeenCalledWith({
      viewName: "cart"
    });
  });

  it("should return cached views if renderDecisions is false", () => {
    const viewChangeHandler = createViewChangeHandler({
      executeCachedViewDecisions,
      viewCache,
      showContainers
    });
    personalization.isRenderDecisions.and.returnValue(false);
    personalization.getViewName.and.returnValue("cart");

    onResponse = callback => {
      callback();
    };

    viewChangeHandler({
      personalization,
      onResponse,
      onRequestFailure
    });
    expect(viewCache.getView).toHaveBeenCalledWith("cart");
  });
});
