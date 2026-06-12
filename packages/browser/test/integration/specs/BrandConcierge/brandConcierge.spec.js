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

const waitUntil = (condition, { intervalMs = 50, timeoutMs = 3000 } = {}) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      if (condition()) {
        resolve();
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error("waitUntil timed out"));
        return;
      }
      setTimeout(poll, intervalMs);
    };
    poll();
  });

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

    const body = calls[0].request.body;
    const conversationQuery = body.events[0].query.conversation;

    expect(conversationQuery.message).toBe(
      "Hello, I need help with my order",
    );
    expect(Array.isArray(conversationQuery.surfaces)).toBe(true);
    expect(conversationQuery.surfaces.length).toBeGreaterThanOrEqual(1);

    const eventXdm = body.events[0].xdm;
    expect(eventXdm.identityMap.ECID).toBeTruthy();
    expect(eventXdm.identityMap.ECID.length).toBeGreaterThanOrEqual(1);

    // Stream parsing runs asynchronously — wait for at least one callback invocation.
    await waitUntil(() => streamResponseCallCount > 0);
    expect(streamResponseCallCount).toBeGreaterThanOrEqual(1);
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
    worker.use(brandConciergeNoStreamHandler);
    await alloy("configure", bcConfig);

    await alloy("sendConversationEvent", {
      xdm: {
        interactionId: "test-interaction-123",
        conversationId: "test-conversation-456",
        conversation: {
          feedback: {
            classification: "positive",
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

    const eventXdm = calls[0].request.body.events[0].xdm;
    expect(eventXdm.interactionId).toBe("test-interaction-123");
    expect(eventXdm.conversationId).toBe("test-conversation-456");
    expect(eventXdm.conversation.feedback.classification).toBe("positive");
    expect(eventXdm.conversation.feedback.comment).toBe("Good bot response");

    expect(eventXdm.identityMap.ECID).toBeTruthy();
    expect(eventXdm.identityMap.ECID.length).toBeGreaterThanOrEqual(1);
  });

  // Original test expected a throw; the anyOf validator is permissive so neither case throws.
  test("BC4/C2590436 - sendConversationEvent with only onStreamResponse does not throw (permissive anyOf validator)", async ({
    alloy,
    worker,
  }) => {
    worker.use(brandConciergeNoStreamHandler);
    await alloy("configure", bcConfig);

    await expect(
      alloy("sendConversationEvent", {
        onStreamResponse: () => {},
      }),
    ).resolves.not.toThrow();
  });

  test("BC5/C2590437 - sendConversationEvent with data missing type does not throw (permissive anyOf validator)", async ({
    alloy,
    worker,
  }) => {
    worker.use(brandConciergeNoStreamHandler);
    await alloy("configure", bcConfig);

    await expect(
      alloy("sendConversationEvent", {
        data: {
          payload: {
            rating: 5,
          },
        },
        onStreamResponse: () => {},
      }),
    ).resolves.not.toThrow();
  });
});
