import { t, ClientFunction } from "testcafe";
import createNetworkLogger from "../helpers/networkLogger";
import fixtureFactory from "../helpers/fixtureFactory";
import environmentContextConfig from "../helpers/constants/environmentContextConfig";
import viewportHelper from "../helpers/window/viewport";
import configureAlloyInstance from "../helpers/configureAlloyInstance";

const networkLogger = createNetworkLogger();

fixtureFactory({
  title: "C2660 - Context data is captured before user consents.",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C2660",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

const setConsentIn = ClientFunction(() => {
  return window.alloy("setConsent", { general: "in" });
});

// triggers an alloy event (note this can block with 'await' if consent is not yet provided)
const triggerAlloyEvent = ClientFunction(() => {
  return window.alloy("event", {
    xdm: {
      web: {
        webPageDetails: {
          URL: "https://alloyio.com/functional-test/alloyTestPage.html"
        }
      }
    }
  });
});

// queues an alloy event and tries to flush the promise chain
const queueAlloyEvent = ClientFunction(() => {
  window.alloy("event", {
    xdm: {
      web: {
        webPageDetails: {
          URL: "https://alloyio.com/functional-test/alloyTestPage.html"
        }
      }
    }
  });

  let promise;

  for (let i = 0; i < 10; i += 1) {
    promise = promise
      ? promise.then(() => Promise.resolve())
      : Promise.resolve();
  }

  return promise;
});

test("C2660 - Context data is captured before user consents.", async () => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...environmentContextConfig
  });

  // capture original viewport
  const originalViewport = await viewportHelper.getViewportSize();

  // queue first event
  await queueAlloyEvent();

  // resize window viewport
  const newViewport = {
    width: 640,
    height: 480
  };
  await t.resizeWindow(newViewport.width, newViewport.height);

  // trigger second event
  const promise = triggerAlloyEvent();

  // apply user consent
  await setConsentIn();

  // wait for second event to complete
  await promise;

  // reset to original size
  await t.resizeWindow(originalViewport.width, originalViewport.height);

  // expect that we made two requests
  await t.expect(networkLogger.edgeEndpointLogs.requests.length).eql(2);

  // test both requests
  const jsonResponses = [];
  await Promise.all(
    networkLogger.edgeEndpointLogs.requests.map(async request => {
      await t.expect(request.response.statusCode).eql(204);
      const stringifyRequest = JSON.parse(request.request.body);
      jsonResponses.push(stringifyRequest);
      await t.expect(stringifyRequest.events[0].xdm.environment).ok();
      await t.expect(stringifyRequest.events[0].xdm.web.webPageDetails).ok();
      await t.expect(stringifyRequest.events[0].xdm.device).notOk();
      await t.expect(stringifyRequest.events[0].xdm.placeContext).notOk();
    })
  );

  // test that the first event reflects the original viewport size
  await viewportHelper.testRequestExpectedViewport(
    jsonResponses[0],
    originalViewport
  );

  // test that the second event reflects the modified viewport size
  await viewportHelper.testRequestExpectedViewport(
    jsonResponses[1],
    newViewport
  );
});
