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

/*
 * this can be used when a delay is necessary to ensure an event is
 * registered, but not block on waiting for consent promise to resolve
 */
const sendEventWithDelay = ClientFunction((data, delay) => {
  return new Promise(resolve => {
    window.alloy("event", data);
    setTimeout(() => {
      resolve();
    }, delay || 100);
  });
});

test("C2660 - Context data is captured before user consents.", async () => {
  await configureAlloyInstance("alloy", {
    defaultConsent: { general: "pending" },
    ...environmentContextConfig
  });

  // capture original viewport
  const originalViewport = await viewportHelper.getViewportSize();

  const newViewport = {
    width: 640,
    height: 480
  };

  const eventData = {
    xdm: {
      web: {
        webPageDetails: {
          URL: "https://alloyio.com/functional-test/alloyTestPage.html"
        }
      }
    }
  };

  // send first event
  await sendEventWithDelay(eventData, 100);

  // resize the viewport
  await t.resizeWindow(newViewport.width, newViewport.height);

  // send the second event
  await sendEventWithDelay(eventData, 100);

  // apply user consent
  await setConsentIn();

  /*
    // reset to original size
    NOTE: the height is resized to slightly less than the original size
    due to a yet undetermined sequence or timing issue that occurs when
    running the whole suite on certain machines, browser, or display
    settings
  */
  await t.resizeWindow(originalViewport.width, originalViewport.height - 100);

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
