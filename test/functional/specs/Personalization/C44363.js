import { t } from "testcafe";
import createFixture from "../../helpers/createFixture";
import createAlloyProxy from "../../helpers/createAlloyProxy";
import { compose, debugEnabled } from "../../helpers/constants/configParts";
import getBaseConfig from "../../helpers/getBaseConfig";

createFixture({
  title: "C44363: Proposition based on QA Mode"
});

const config = compose(
  getBaseConfig(
    "6FC947105BB267B70A495EE9@AdobeOrg",
    "e05e7d28-e293-454a-82f8-4c808cd973a8"
  ),
  debugEnabled
);

test("Test C44363: Return proposition when QA mode set up with token of experience A", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await t.setCookies({
    name: "at_qa_mode",
    value:
      "{%22token%22:%22g3PFzsGla-P0L3BEgkx-3ZQUkS6jIDyBvQrMH-va-2c%22%2C%22listedActivitiesOnly%22:true%2C%22previewIndexes%22:[{%22activityIndex%22:1%2C%22experienceIndex%22:1}]}"
  });

  const result = await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: ["Happy-mbox"]
  });
  const EXPERIENCE_A =
    "<p>Geckos are a group of usually small, usually nocturnal lizards. They are found on every continent except Australia.</p>\n \n<p>Some species live in houses where they hunt insects attracted by artificial light.</p>";
  await t
    .expect(result.propositions[0].items[0].data.content)
    .eql(EXPERIENCE_A);
});

test("Test C44363: Return proposition  when QA mode set up with token of experience B", async () => {
  const alloy = createAlloyProxy();
  await alloy.configure(config);
  await t.setCookies({
    name: "at_qa_mode",
    value:
      "{%22token%22:%22g3PFzsGla-P0L3BEgkx-3ZQUkS6jIDyBvQrMH-va-2c%22%2C%22listedActivitiesOnly%22:true%2C%22previewIndexes%22:[{%22activityIndex%22:1%2C%22experienceIndex%22:2}]}"
  });
  const result = await alloy.sendEvent({
    renderDecisions: true,
    decisionScopes: ["Happy-mbox"]
  });
  const EXPERIENCE_B =
    "<p>Apollo astronauts:</p>\n\n<ul>\n    <li>Neil Armstrong</li>\n    <li>Alan Bean</li>\n    <li>Peter Conrad</li>\n    <li>Edgar Mitchell</li>\n    <li>Alan Shepard</li>\n</ul>";
  await t
    .expect(result.propositions[0].items[0].data.content)
    .eql(EXPERIENCE_B);
});
