import { ClientFunction, t } from "testcafe";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";
import cookies from "../../helpers/cookies";

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const extractCluster = hostname => {
  const values = hostname.split(".");
  return values[0];
};

export const injectAlloyAndSendEvent = async (config, options = {}) => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(config);
  await alloy.getLibraryInfoAsync();
  const logger = await createConsoleLogger();
  await injectAlloyDuringTest();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
  await alloy.sendEvent(options);
};

export const assertTargetMigrationEnabledIsSent = async requestBody => {
  await t.expect(requestBody.meta.target).eql({ migration: true });
};

export const assertKonductorReturnsCookieAndCookieIsSet = async (
  cookieKey,
  stateStorePayload
) => {
  const responseContainsCookie = stateStorePayload.find(entry => {
    return entry.key.includes(cookieKey);
  });
  await t.expect(responseContainsCookie).ok();
  // Check that cookie is set
  const cookieValue = await cookies.get(cookieKey);
  await t.expect(cookieValue).ok();

  return cookieValue;
};

export const fetchMboxOffer = ClientFunction(() => {
  window.adobe.target.getOffer({
    mbox: "nina1234",
    success(response) {
      console.log("response", response);
    },
    error: console.error
  });
});
export const getEcid = identityPayload => {
  return identityPayload.filter(obj => obj.namespace.code === "ECID");
};
export const getPropositionCustomContent = personalizationPayload => {
  const decisionScopeProposition = personalizationPayload.filter(
    proposition => proposition.scope === "nina1234"
  );

  return decisionScopeProposition[0].items[0].data.content;
};
export const fetchMboxOfferWithParam = ClientFunction(color => {
  return window.adobe.target.getOffer({
    mbox: "target-global-mbox",
    params: {
      "profile.favoriteColor": color
    },
    success(response) {
      console.log("response", response);
    },
    error: console.error
  });
});
