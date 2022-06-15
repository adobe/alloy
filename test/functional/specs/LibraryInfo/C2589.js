import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";

import {
  compose,
  orgMainConfigMain,
  debugEnabled
} from "../../helpers/constants/configParts";

import createAlloyProxy from "../../helpers/createAlloyProxy";

const debugEnabledConfig = compose(orgMainConfigMain, debugEnabled);

createFixture({
  title: "C2589: getLibraryInfo command returns library information"
});

test.meta({
  ID: "C2589",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2589: getLibraryInfo command returns library information.", async () => {
  const currentVersion = process.env.npm_package_version;
  const currentCommand = [
    "appendIdentityToUrl",
    "applyPropositions",
    "configure",
    "createEventMergeId",
    "getIdentity",
    "sendEvent",
    "setConsent",
    "setDebug"
  ];
  const currentConfigs = {
    clickCollectionEnabled: true,
    context: ["web", "device", "environment", "placeContext"],
    debugEnabled: true,
    defaultConsent: "in",
    downloadLinkQualifier:
      "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$",
    edgeConfigId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
    edgeDomain: "edge.adobedc.net",
    idMigrationEnabled: true,
    onBeforeEventSend: undefined,
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
    thirdPartyCookiesEnabled: true
  };

  const alloy = createAlloyProxy();
  await alloy.configure(debugEnabledConfig);
  const libraryInfo = await alloy.getLibraryInfo();
  delete libraryInfo.libraryInfo.configs.edgeBasePath;
  await t.expect(libraryInfo.libraryInfo.version).eql(currentVersion);
  await t.expect(libraryInfo.libraryInfo.commands).eql(currentCommand);
  await t.expect(libraryInfo.libraryInfo.configs).eql(currentConfigs);
});
