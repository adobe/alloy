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

import createFetchDataHandler from "../../../../../src/components/Personalization/createFetchDataHandler";

describe("Personalization::createFetchDataHandler", () => {
  let responseHandler;
  let showContainers;
  let hideContainers;
  let mergeQuery;
  let personalizationDetails;
  const config = {
    prehidingStyle: "body {opacity:0;}"
  };
  let onResponse = jasmine.createSpy();
  let onRequestFailure = jasmine.createSpy();
  const event = {};

  beforeEach(() => {
    responseHandler = jasmine.createSpy();
    mergeQuery = jasmine.createSpy();
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "createQueryDetails"
    ]);
    hideContainers = jasmine.createSpy("hideContainers");
    showContainers = jasmine.createSpy("showContainers");
  });

  it("should hide containers if renderDecisions is true", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(true);

    fetchDataHandler({
      personalizationDetails,
      event,
      onResponse,
      onRequestFailure
    });
    expect(hideContainers).toHaveBeenCalled();
  });
  it("shouldn't hide containers if renderDecisions is false", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    fetchDataHandler({
      personalizationDetails,
      event,
      onResponse,
      onRequestFailure
    });

    expect(hideContainers).not.toHaveBeenCalled();
  });

  it("should trigger responseHandler at onResponse", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    onResponse = callback => {
      callback(responseHandler);
    };
    fetchDataHandler({
      personalizationDetails,
      event,
      onResponse,
      onRequestFailure
    });

    expect(hideContainers).not.toHaveBeenCalled();
    expect(responseHandler).toHaveBeenCalled();
  });
  it("should trigger showContainers at onRequestFailure", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      showContainers,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    onRequestFailure = callback => {
      callback(showContainers);
    };
    fetchDataHandler({
      personalizationDetails,
      event,
      onResponse,
      onRequestFailure
    });

    expect(hideContainers).not.toHaveBeenCalled();
    expect(showContainers).toHaveBeenCalled();
  });
});
