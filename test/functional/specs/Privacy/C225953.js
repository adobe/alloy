import createFixture from "../../helpers/createFixture";
import configureAlloyInstance from "../../helpers/configureAlloyInstance";
import createNetworkLogger from "../../helpers/networkLogger";
import { responseStatus } from "../../helpers/assertions/index";

import {
  compose,
  orgMainConfigMain,
  consentPending,
  debugEnabled
} from "../../helpers/constants/configParts";

const { CONSENT_IN } = require("../../helpers/constants/consent");

const config = compose(
  orgMainConfigMain,
  consentPending,
  debugEnabled
);

const networkLogger = createNetworkLogger();

createFixture({
  title: "C225953: Identity map can be sent on a setConsent command",
  requestHooks: [networkLogger.edgeEndpointLogs]
});

test.meta({
  ID: "C225953",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("Test C225953: Identity map can be sent on a setConsent command", async t => {
  await configureAlloyInstance("alloy", config);
  await t.eval(
    () =>
      window.alloy("setConsent", {
        identityMap: {
          HYP: [
            {
              id: "id123"
            }
          ]
        },
        consent: CONSENT_IN.consent
      }),
    {
      dependencies: { CONSENT_IN }
    }
  );
  await t.eval(() => window.alloy("sendEvent"));

  await responseStatus(networkLogger.edgeEndpointLogs.requests, 200);
});
