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
  title: "C2589: getLibraryInfo command returns library information",
  includeAlloyLibrary: false
});

test.meta({
  ID: "C2589",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C2589: getLibraryInfo command returns library information.", async () => {
  const alloy = createAlloyProxy();
  await alloy.configureAsync(debugEnabledConfig);
  const libraryInfo = await alloy.getLibraryInfoAsync();
  await t.expect(libraryInfo.version).eql(2);
});
