/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { t } from "testcafe";
import createNetworkLogger from "../../helpers/networkLogger/index.js";
import { responseStatus } from "../../helpers/assertions/index.js";
import createFixture from "../../helpers/createFixture/index.js";
import { compose } from "../../helpers/constants/configParts/index.js";
import { TEST_PAGE as TEST_PAGE_URL } from "../../helpers/constants/url.js";
import createAlloyProxy from "../../helpers/createAlloyProxy.js";
import orgMainConfigMain from "../../helpers/constants/configParts/orgMainConfigMain.js";

const networkLogger = createNetworkLogger();
const config = compose(
  orgMainConfigMain,
  {
    stickyConversationSession: false,
  },
);

createFixture({
  title: "BrandConcierge - sendConversationEvent",
  url: TEST_PAGE_URL,
  requestHooks: [networkLogger.edgeEndpointLogs],
});

test.meta({
  ID: "BC1",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test 1: C2590433 - Send conversational event with message only", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  
  let streamResponseCalled = false;
  let capturedResponse = null;
  
  await alloy.sendConversationEvent({
    message: "Hello, I need help with my order",
    onStreamResponse: (response) => {
      streamResponseCalled = true;
    },
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);

  // Verify message is in the query parameter
  await t.expect(requestBody.query.conversation.message).eql("Hello, I need help with my order");
  await t.expect(requestBody.query.conversation.surfaces).ok();
  
  // Verify event has ECID in identityMap
  await t.expect(requestBody.events[0].xdm.identityMap.ECID).ok();
  await t.expect(requestBody.events[0].xdm.identityMap.ECID.length).gte(1);
  
  // Verify onStreamResponse was called with data
  await t.expect(streamResponseCalled).ok("onStreamResponse callback should be called");
});

test.meta({
  ID: "BC2",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test 2: C2590434 - Send conversational event with data object", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.sendConversationEvent({
    data: {
      type: "feedback",
      payload: {
        rating: 5,
        comment: "Great service!",
      },
    },
    onStreamResponse: () => {},
  });

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);

  // Verify data is in the query parameter
  await t.expect(requestBody.query.conversation.data.type).eql("feedback");
  await t.expect(requestBody.query.conversation.data.payload.rating).eql(5);
  await t.expect(requestBody.query.conversation.data.payload.comment).eql("Great service!");
  await t.expect(requestBody.query.conversation.surfaces).ok();
  
  // Verify event has ECID in identityMap
  await t.expect(requestBody.events[0].xdm.identityMap.ECID).ok();
  await t.expect(requestBody.events[0].xdm.identityMap.ECID.length).gte(1);
});

test.meta({
  ID: "BC3",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test 3: C2590435 - Send conversational event with feedback in XDM", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  await alloy.sendConversationEvent({
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

  await responseStatus(networkLogger.edgeEndpointLogs.requests, [200, 207]);
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).gte(1);

  const request = networkLogger.edgeEndpointLogs.requests[0];
  const requestBody = JSON.parse(request.request.body);

  // Verify XDM data is properly merged
  await t.expect(requestBody.events[0].xdm.interactionId).eql("test-interaction-123");
  await t.expect(requestBody.events[0].xdm.conversationId).eql("test-conversation-456");
  await t.expect(requestBody.events[0].xdm.conversation.feedback.rating).eql(4);
  await t.expect(requestBody.events[0].xdm.conversation.feedback.comment).eql("Good bot response");
  
  // Verify event has ECID in identityMap
  await t.expect(requestBody.events[0].xdm.identityMap.ECID).ok();
  await t.expect(requestBody.events[0].xdm.identityMap.ECID.length).gte(1);
});

test.meta({
  ID: "BC4",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test 4: C2590436 - Send conversational event with invalid options should throw error", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Try to send with empty options (no message, data, or xdm)
  let errorThrown = false;
  let errorMessage = null;

  try {
    await alloy.sendConversationEvent({
      onStreamResponse: () => {},
    });
  } catch (error) {
    errorThrown = true;
    errorMessage = error.message;
  }

  // Verify that an error was thrown
  await t.expect(errorThrown).ok("Should throw error for invalid options");
  await t.expect(errorMessage).contains("", "Error message should be present");
});

test.meta({
  ID: "BC5",
  SEVERITY: "P0",
  TEST_RUN: "Regression",
});

test("Test 5: C2590437 - Send conversational event with missing required data fields should throw error", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);

  // Try to send data object without required 'type' field
  let errorThrown = false;
  let errorMessage = null;

  try {
    await alloy.sendConversationEvent({
      data: {
        payload: {
          rating: 5,
        },
      },
      onStreamResponse: () => {},
    });
  } catch (error) {
    errorThrown = true;
    errorMessage = error.message;
  }

  // Verify that an error was thrown
  await t.expect(errorThrown).ok("Should throw error for missing required data.type field");
  await t.expect(errorMessage).contains("", "Error message should be present");
});
