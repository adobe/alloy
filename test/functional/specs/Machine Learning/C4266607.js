import { t } from "testcafe";
import { orgMainConfigMain } from "../../helpers/constants/configParts";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import createFixture from "../../helpers/createFixture";

createFixture({
  title: "C4266607 sendEvent command returns an `inferences` key in the result"
});

test.meta({
  ID: "C4266607",
  SEVERITY: "P0",
  TEST_RUN: "Regression"
});

test("C4266607 sendEvent command returns an `inferences` key in the result", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(orgMainConfigMain);
  const result = await alloy.sendEvent();

  await t.expect(result.inferences).eql([]);
});
