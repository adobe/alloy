/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import { http, HttpResponse } from "msw";
import alloyConfig from "../../helpers/alloy/config.js";

const bcConfig = { ...alloyConfig, conversation: {} };

const brandConciergeStreamingHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/brand-concierge\/conversations/,
  () => {
    const ssePayload = 'data: {"requestId":"test-req","handle":[]}\n\n';
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(ssePayload));
        controller.close();
      },
    });

    return new HttpResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  },
);

const brandConciergeNoStreamHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/brand-concierge\/conversations/,
  () => new HttpResponse(null, { status: 204 }),
);

describe("BrandConcierge - sendConversationEvent", () => {
  test("BC1/C2590433 - Send conversational event with message only", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(brandConciergeStreamingHandler);
    await alloy("configure", bcConfig);

    let streamResponseCallCount = 0;
    await alloy("sendConversationEvent", {
      message: "Hello, I need help with my order",
      onStreamResponse: () => {
        streamResponseCallCount += 1;
      },
    });

    const calls = await networkRecorder.findCalls(
      /brand-concierge\/conversations/,
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect([200, 207]).toContain(calls[0].response.status);

    const body = calls[0].request.body;
    const conversationQuery = body.events[0].query.conversation;

    expect(conversationQuery.message).toBe("Hello, I need help with my order");
    expect(Array.isArray(conversationQuery.surfaces)).toBe(true);
    expect(conversationQuery.surfaces.length).toBeGreaterThanOrEqual(1);

    const eventXdm = body.events[0].xdm;
    expect(eventXdm.identityMap.ECID).toBeTruthy();
    expect(eventXdm.identityMap.ECID.length).toBeGreaterThanOrEqual(1);

    await expect.poll(() => streamResponseCallCount).toBeGreaterThanOrEqual(1);
  });

  test("BC2/C2590434 - Send conversational event with data object", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(brandConciergeStreamingHandler);
    await alloy("configure", bcConfig);

    await alloy("sendConversationEvent", {
      data: {
        type: "feedback",
        payload: {
          rating: 5,
          comment: "Great service!",
        },
      },
      onStreamResponse: () => {},
    });

    const calls = await networkRecorder.findCalls(
      /brand-concierge\/conversations/,
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect([200, 207]).toContain(calls[0].response.status);

    const body = calls[0].request.body;
    const conversationQuery = body.events[0].query.conversation;

    expect(conversationQuery.data.type).toBe("feedback");
    expect(conversationQuery.data.payload.rating).toBe(5);
    expect(conversationQuery.data.payload.comment).toBe("Great service!");
    expect(Array.isArray(conversationQuery.surfaces)).toBe(true);
    expect(conversationQuery.surfaces.length).toBeGreaterThanOrEqual(1);

    const eventXdm = body.events[0].xdm;
    expect(eventXdm.identityMap.ECID).toBeTruthy();
    expect(eventXdm.identityMap.ECID.length).toBeGreaterThanOrEqual(1);
  });

  test("BC3/C2590435 - Send conversational event with feedback in XDM", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(brandConciergeStreamingHandler);
    await alloy("configure", bcConfig);

    await alloy("sendConversationEvent", {
      xdm: {
        interactionId: "test-interaction-123",
        conversationId: "test-conversation-456",
        conversation: {
          feedback: {
            rating: 4,
            comment: "Good bot response",
          },
        },
      },
      onStreamResponse: () => {},
    });

    const calls = await networkRecorder.findCalls(
      /brand-concierge\/conversations/,
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect([200, 207]).toContain(calls[0].response.status);

    const eventXdm = calls[0].request.body.events[0].xdm;
    expect(eventXdm.interactionId).toBe("test-interaction-123");
    expect(eventXdm.conversationId).toBe("test-conversation-456");
    expect(eventXdm.conversation.feedback.rating).toBe(4);
    expect(eventXdm.conversation.feedback.comment).toBe("Good bot response");

    expect(eventXdm.identityMap.ECID).toBeTruthy();
    expect(eventXdm.identityMap.ECID.length).toBeGreaterThanOrEqual(1);
  });

  test("BC4/C2590436 - sendConversationEvent with only onStreamResponse does not throw (permissive anyOf validator)", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(brandConciergeNoStreamHandler);
    await alloy("configure", bcConfig);

    await alloy("sendConversationEvent", {
      onStreamResponse: () => {},
    });

    const calls = await networkRecorder.findCalls(
      /brand-concierge\/conversations/,
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].response.status).toBe(204);
    expect(calls[0].request.body.events[0].xdm.identityMap.ECID).toHaveLength(
      1,
    );
  });

  test("BC5/C2590437 - sendConversationEvent with data missing type does not throw (permissive anyOf validator)", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(brandConciergeNoStreamHandler);
    await alloy("configure", bcConfig);

    await alloy("sendConversationEvent", {
      data: {
        payload: {
          rating: 5,
        },
      },
      onStreamResponse: () => {},
    });

    const calls = await networkRecorder.findCalls(
      /brand-concierge\/conversations/,
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].response.status).toBe(204);
    expect(calls[0].request.body.events[0].query.conversation.data).toEqual({
      payload: {
        rating: 5,
      },
    });
  });
});
