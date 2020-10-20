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

import createPageLoadHandler from "../../../../../src/components/Personalization/createPageLoadHandler";

describe("Personalization::createPageLoadHandler", () => {
  let responseHandler;
  let showContainers;
  let hideContainers;
  let mergeQuery;
  let personalization;
  const config = {
    prehidingStyle: "body {opacity:0;}"
  };
  let onResponse = jasmine.createSpy();
  let onRequestFailure = jasmine.createSpy();
  const event = {};

  beforeEach(() => {
    responseHandler = jasmine.createSpy();
    mergeQuery = jasmine.createSpy();
    personalization = jasmine.createSpyObj("personalization", [
      "isRenderDecisions",
      "createQueryDetails"
    ]);
    hideContainers = jasmine.createSpy("hideContainers");
    showContainers = jasmine.createSpy("showContainers");
  });

  it("should hide containers if renderDecisions is true", () => {
    const onPageLoad = createPageLoadHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalization.isRenderDecisions.and.returnValue(true);

    onPageLoad({
      personalization,
      event,
      onResponse,
      onRequestFailure
    });
    expect(hideContainers).toHaveBeenCalled();
  });
  it("shouldn't hide containers if renderDecisions is false", () => {
    const onPageLoad = createPageLoadHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalization.isRenderDecisions.and.returnValue(false);
    onPageLoad({
      personalization,
      event,
      onResponse,
      onRequestFailure
    });

    expect(hideContainers).not.toHaveBeenCalled();
  });

  it("should trigger responseHandler at onResponse", () => {
    const onPageLoad = createPageLoadHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalization.isRenderDecisions.and.returnValue(false);
    onResponse = callback => {
      callback(responseHandler);
    };
    onPageLoad({
      personalization,
      event,
      onResponse,
      onRequestFailure
    });

    expect(hideContainers).not.toHaveBeenCalled();
    expect(responseHandler).toHaveBeenCalled();
  });
  it("should trigger showContainers at onRequestFailure", () => {
    const onPageLoad = createPageLoadHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalization.isRenderDecisions.and.returnValue(false);
    onRequestFailure = callback => {
      callback(showContainers);
    };
    onPageLoad({
      personalization,
      event,
      onResponse,
      onRequestFailure
    });

    expect(hideContainers).not.toHaveBeenCalled();
    expect(showContainers).toHaveBeenCalled();
  });
});
