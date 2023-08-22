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
import { createProposition } from "../../../../../src/components/Personalization/handlers/proposition";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Personalization::createFetchDataHandler", () => {
  let prehidingStyle;
  let hideContainers;
  let mergeQuery;
  let collect;
  let render;

  let cacheUpdate;
  let personalizationDetails;
  let event;
  let onResponse;

  let response;

  beforeEach(() => {
    prehidingStyle = "myprehidingstyle";
    hideContainers = jasmine.createSpy("hideContainers");
    mergeQuery = jasmine.createSpy("mergeQuery");
    collect = jasmine.createSpy("collect");
    render = jasmine.createSpy("render");
    cacheUpdate = jasmine.createSpyObj("cacheUpdate", ["update"]);
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "createQueryDetails",
      "getViewName"
    ]);
    personalizationDetails.createQueryDetails.and.returnValue("myquerydetails");
    event = "myevent";
    onResponse = jasmine.createSpy();
    response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
  });

  const run = () => {
    const fetchDataHandler = createFetchDataHandler({
      prehidingStyle,
      hideContainers,
      mergeQuery,
      collect,
      render
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
    const result = returnResponse();
    expect(result).toEqual({
      propositions: [],
      decisions: []
    });
  });

  it("should render decisions", async () => {
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("myviewname");
    render = propositions => {
      propositions[0].addRenderer(0, () => {});
      propositions[0].includeInDisplayNotification();
      const decisionsMeta = [];
      propositions[0].addToNotifications(decisionsMeta);
      return Promise.resolve(decisionsMeta);
    };
    run();
    response.getPayloadsByType.and.returnValue([
      { id: "handle1" },
      { id: "handle2" }
    ]);
    cacheUpdate.update.and.returnValue([
      createProposition({ id: "handle1", items: ["item1"] })
    ]);
    const result = returnResponse();
    expect(result).toEqual({
      propositions: [
        { id: "handle1", items: ["item1"], renderAttempted: true }
      ],
      decisions: []
    });
    await flushPromiseChains();
    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: [
        { id: "handle1", scope: undefined, scopeDetails: undefined }
      ],
      viewName: "myviewname"
    });
  });

  // TODO - test the rest of the functionality
});
