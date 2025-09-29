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

import { vi, beforeEach, describe, it, expect } from "vitest";
import createFetchDataHandler from "../../../../../src/components/Personalization/createFetchDataHandler.js";
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";
import defer from "../../../../../src/utils/defer.js";
import createNotificationHandler from "../../../../../src/components/Personalization/createNotificationHandler.js";

describe("Personalization::createFetchDataHandler", () => {
  let prehidingStyle;
  let showContainers;
  let hideContainers;
  let mergeQuery;
  let collect;
  let processPropositions;
  let createProposition;
  let renderedPropositions;
  let notificationHandler;
  let consent;
  let logger;
  let cacheUpdate;
  let personalizationDetails;
  let event;
  let onResponse;
  let response;
  beforeEach(() => {
    logger = {
      logOnContentRendering: vi.fn(),
    };
    prehidingStyle = "myprehidingstyle";
    showContainers = vi.fn();
    hideContainers = vi.fn();
    mergeQuery = vi.fn();
    collect = vi.fn();
    processPropositions = vi.fn();
    createProposition = injectCreateProposition({
      preprocess: (data) => data,
      isPageWideSurface: () => false,
    });
    renderedPropositions = {
      concat: vi.fn(),
    };
    notificationHandler = createNotificationHandler(
      collect,
      renderedPropositions,
    );
    consent = {
      current: vi.fn(),
    };
    consent.current.mockReturnValue({
      state: "in",
      wasSet: false,
    });
    cacheUpdate = {
      update: vi.fn(),
    };
    personalizationDetails = {
      isRenderDecisions: vi.fn(),
      createQueryDetails: vi.fn(),
      getViewName: vi.fn(),
      isSendDisplayEvent: vi.fn(),
    };
    personalizationDetails.createQueryDetails.mockReturnValue("myquerydetails");
    personalizationDetails.isSendDisplayEvent.mockReturnValue(true);
    event = "myevent";
    onResponse = vi.fn();
    response = {
      getPayloadsByType: vi.fn(),
    };
  });
  const run = () => {
    const fetchDataHandler = createFetchDataHandler({
      prehidingStyle,
      showContainers,
      hideContainers,
      mergeQuery,
      processPropositions,
      createProposition,
      notificationHandler,
      consent,
      logger,
    });
    fetchDataHandler({
      cacheUpdate,
      personalizationDetails,
      event,
      onResponse,
    });
  };
  const returnResponse = () => {
    expect(onResponse).toHaveBeenCalledTimes(1);
    const callback = onResponse.mock.calls[0][0];
    return callback({
      response,
    });
  };
  it("should hide containers if renderDecisions is true", () => {
    personalizationDetails.isRenderDecisions.mockReturnValue(true);
    run();
    expect(hideContainers).toHaveBeenCalled();
  });
  it("shouldn't hide containers if renderDecisions is false", () => {
    personalizationDetails.isRenderDecisions.mockReturnValue(false);
    run();
    expect(hideContainers).not.toHaveBeenCalled();
  });
  it("shouldn't hide containers if we have out consent cookie", () => {
    consent.current.mockReturnValue({
      state: "out",
      wasSet: true,
    });
    personalizationDetails.isRenderDecisions.mockReturnValue(true);
    run();
    expect(hideContainers).not.toHaveBeenCalled();
  });
  it("should trigger responseHandler at onResponse", () => {
    personalizationDetails.isRenderDecisions.mockReturnValue(false);
    run();
    response.getPayloadsByType.mockReturnValue([]);
    cacheUpdate.update.mockReturnValue([]);
    processPropositions.mockReturnValue({
      returnedPropositions: [],
      returnedDecisions: [],
    });
    const result = returnResponse();
    expect(result).toEqual({
      propositions: [],
      decisions: [],
    });
  });
  it("should render decisions", async () => {
    personalizationDetails.isRenderDecisions.mockReturnValue(true);
    personalizationDetails.getViewName.mockReturnValue("myviewname");
    processPropositions = () => {
      return {
        render: () =>
          Promise.resolve([
            {
              id: "handle1",
            },
          ]),
        returnedPropositions: [
          {
            id: "handle1",
            items: ["item1"],
            renderAttempted: true,
          },
        ],
        returnedDecisions: [],
      };
    };
    run();
    response.getPayloadsByType.mockReturnValue([
      {
        id: "handle1",
        scopeDetails: {
          characteristics: {
            scopeType: "view",
          },
        },
      },
      {
        id: "handle2",
      },
    ]);
    cacheUpdate.update.mockReturnValue([
      createProposition({
        id: "handle1",
      }),
    ]);
    const result = returnResponse();
    expect(result).toEqual({
      propositions: [
        {
          id: "handle1",
          items: ["item1"],
          renderAttempted: true,
        },
      ],
      decisions: [],
    });
    await flushPromiseChains();
    expect(showContainers).toHaveBeenCalled();
    expect(collect).toHaveBeenNthCalledWith(1, {
      decisionsMeta: [
        {
          id: "handle1",
        },
      ],
      viewName: "myviewname",
    });
  });
  it("should show containers immediately", async () => {
    personalizationDetails.isRenderDecisions.mockReturnValue(true);
    const renderDeferred = defer();
    processPropositions = () => {
      return {
        render: () => renderDeferred.promise,
        returnedPropositions: [
          {
            id: "handle2",
            scope: "__view__",
            items: ["item1"],
            renderAttempted: true,
          },
        ],
        returnedDecisions: [],
      };
    };
    run();
    response.getPayloadsByType.mockReturnValue([
      {
        id: "handle2",
        scope: "__view__",
        items: ["item1"],
      },
    ]);
    cacheUpdate.update.mockReturnValue([]);
    expect(showContainers).not.toHaveBeenCalled();
    returnResponse();
    expect(showContainers).toHaveBeenCalled();
    expect(collect).not.toHaveBeenCalled();
    renderDeferred.resolve([
      {
        id: "handle2",
      },
    ]);
    await flushPromiseChains();
    expect(collect).toHaveBeenNthCalledWith(1, {
      decisionsMeta: [
        {
          id: "handle2",
        },
      ],
      viewName: undefined,
    });
  });
});
