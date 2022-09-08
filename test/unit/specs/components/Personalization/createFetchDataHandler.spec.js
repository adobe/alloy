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
  let hideContainers;
  let mergeQuery;
  let personalizationDetails;
  let decisionsDeferred;
  const config = {
    prehidingStyle: "body {opacity:0;}"
  };
  let onResponse = jasmine.createSpy();
  const event = {};
  let response;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    responseHandler = jasmine.createSpy();
    mergeQuery = jasmine.createSpy();
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "createQueryDetails"
    ]);
    hideContainers = jasmine.createSpy("hideContainers");
    decisionsDeferred = jasmine.createSpyObj("decisionsDeferred", ["reject"]);
  });

  it("should hide containers if renderDecisions is true", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(true);

    fetchDataHandler({
      decisionsDeferred,
      personalizationDetails,
      event,
      onResponse
    });
    expect(hideContainers).toHaveBeenCalled();
  });
  it("shouldn't hide containers if renderDecisions is false", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    fetchDataHandler({
      decisionsDeferred,
      personalizationDetails,
      event,
      onResponse
    });

    expect(hideContainers).not.toHaveBeenCalled();
  });

  it("should trigger responseHandler at onResponse", () => {
    const fetchDataHandler = createFetchDataHandler({
      config,
      responseHandler,
      hideContainers,
      mergeQuery
    });
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    onResponse = callback => {
      callback(response);
    };
    fetchDataHandler({
      decisionsDeferred,
      personalizationDetails,
      event,
      onResponse
    });

    expect(hideContainers).not.toHaveBeenCalled();
    expect(responseHandler).toHaveBeenCalled();
  });
});
