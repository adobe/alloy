import { t } from "testcafe";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";
import cookies from "../../helpers/cookies";

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const extractCluster = hostname => {
  const values = hostname.split(".");
  return values[0];
};

export const injectAlloyAndSendEvent = async config => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(config);
  await alloy.getLibraryInfoAsync();
  const logger = await createConsoleLogger();
  await injectAlloyDuringTest();
  await logger.info.expectMessageMatching(/Executing getLibraryInfo command/);
  await alloy.sendEvent();
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
