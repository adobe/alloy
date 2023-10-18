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
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition";
import flushPromiseChains from "../../../helpers/flushPromiseChains";
import defer from "../../../../../src/utils/defer";

describe("Personalization::createFetchDataHandler", () => {
  let prehidingStyle;
  let showContainers;
  let hideContainers;
  let mergeQuery;
  let collect;
  let processPropositions;
  let createProposition;
  let pendingDisplayNotifications;

  let cacheUpdate;
  let personalizationDetails;
  let event;
  let onResponse;

  let response;

  beforeEach(() => {
    prehidingStyle = "myprehidingstyle";
    showContainers = jasmine.createSpy("showContainers");
    hideContainers = jasmine.createSpy("hideContainers");
    mergeQuery = jasmine.createSpy("mergeQuery");
    collect = jasmine.createSpy("collect");
    processPropositions = jasmine.createSpy("processPropositions");
    createProposition = injectCreateProposition({
      preprocess: data => data,
      isPageWideSurface: () => false
    });
    pendingDisplayNotifications = jasmine.createSpyObj(
      "pendingDisplayNotifications",
      ["concat"]
    );

    cacheUpdate = jasmine.createSpyObj("cacheUpdate", ["update"]);
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "createQueryDetails",
      "getViewName",
      "isSendDisplayNotifications"
    ]);
    personalizationDetails.createQueryDetails.and.returnValue("myquerydetails");
    personalizationDetails.isSendDisplayNotifications.and.returnValue(true);
    event = "myevent";
    onResponse = jasmine.createSpy();
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
  });

  const run = () => {
    const fetchDataHandler = createFetchDataHandler({
      prehidingStyle,
      showContainers,
      hideContainers,
      mergeQuery,
      collect,
      processPropositions,
      createProposition,
      pendingDisplayNotifications
    });
    fetchDataHandler({
      cacheUpdate,
      personalizationDetails,
      event,
      onResponse
    });
  };

  const returnResponse = () => {
    expect(onResponse).toHaveBeenCalledTimes(1);
    const callback = onResponse.calls.argsFor(0)[0];
    return callback({ response });
  };

  it("should hide containers if renderDecisions is true", () => {
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    run();
    expect(hideContainers).toHaveBeenCalled();
  });

  it("shouldn't hide containers if renderDecisions is false", () => {
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    run();
    expect(hideContainers).not.toHaveBeenCalled();
  });

  it("should trigger responseHandler at onResponse", () => {
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    run();
    response.getPayloadsByType.and.returnValue([]);
    cacheUpdate.update.and.returnValue([]);
    processPropositions.and.returnValue({
      returnedPropositions: [],
      returnedDecisions: []
    });
    const result = returnResponse();
    expect(result).toEqual({
      propositions: [],
      decisions: []
    });
  });

  it("should render decisions", async () => {
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("myviewname");
    processPropositions = () => {
      return {
        render: () => Promise.resolve([{ id: "handle1" }]),
        returnedPropositions: [
          { id: "handle1", items: ["item1"], renderAttempted: true }
        ],
        returnedDecisions: []
      };
    };
    run();
    response.getPayloadsByType.and.returnValue([
      {
        id: "handle1",
        scopeDetails: { characteristics: { scopeType: "view" } }
      },
      { id: "handle2" }
    ]);
    cacheUpdate.update.and.returnValue([createProposition({ id: "handle1" })]);
    const result = returnResponse();
    expect(result).toEqual({
      propositions: [
        { id: "handle1", items: ["item1"], renderAttempted: true }
      ],
      decisions: []
    });
    await flushPromiseChains();
    expect(showContainers).toHaveBeenCalled();
    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [{ id: "handle1" }],
      viewName: "myviewname"
    });
  });

  it("should show containers immediately", async () => {
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    const renderDeferred = defer();
    processPropositions = () => {
      return {
        render: () => renderDeferred.promise,
        returnedPropositions: [
          {
            id: "handle2",
            scope: "__view__",
            items: ["item1"],
            renderAttempted: true
          }
        ],
        returnedDecisions: []
      };
    };
    run();
    response.getPayloadsByType.and.returnValue([
      {
        id: "handle2",
        scope: "__view__",
        items: ["item1"]
      }
    ]);
    cacheUpdate.update.and.returnValue([]);
    expect(showContainers).not.toHaveBeenCalled();
    returnResponse();
    expect(showContainers).toHaveBeenCalled();
    expect(collect).not.toHaveBeenCalled();
    renderDeferred.resolve([{ id: "handle2" }]);
    await flushPromiseChains();
    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [{ id: "handle2" }],
      viewName: undefined
    });
  });
});
