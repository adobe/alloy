import { ClientFunction, t } from "testcafe";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createConsoleLogger from "../../helpers/consoleLogger";
import { injectAlloyDuringTest } from "../../helpers/createFixture/clientScripts";
import cookies from "../../helpers/cookies";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const getAtjsVersion = ClientFunction(() => {
  const target = window.adobe.target;

  return target.VERSION;
});

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

const injectAtjsScript = ClientFunction(remoteUrl => {
  const scriptElement = document.createElement("script");
  // eslint-disable-next-line no-undef
  scriptElement.src = remoteUrl;
  document.getElementsByTagName("head")[0].appendChild(scriptElement);
});

export const injectAtjsOnThePage = async (libraryPath, libraryVersion) => {
  await injectAtjsScript(libraryPath);
  await sleep(2000);

  const version = await getAtjsVersion();
  await t.expect(version).eql(libraryVersion);
  // we need this to make sure at.js had enough time to trigger the delivery request
  await sleep(1000);
};
