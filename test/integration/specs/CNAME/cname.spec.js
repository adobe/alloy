import alloyConfig from "../../helpers/alloy/config.js";
import { describe, test, expect } from "../../helpers/testsSetup/extend.js";
import deleteCookies from "../../helpers/deleteCookies.js";
import createResponse from "../../helpers/responses/createResponse.js";
import { FIRST_PARTY_DOMAIN } from "../../helpers/constants/domains.js";
import { MAIN_IDENTITY_COOKIE_NAME } from "../../../functional/helpers/constants/cookies.js";
import {
  demdexHandler,
  firstPartyAlloyHandler,
} from "../../helpers/mswjs/handlers.js";

const demdexUrlRegex = /\.demdex\.net/;
const getIdentityCookie = (call) => {
  const response = createResponse({
    content: call.response.body,
  });

  const handle = response.getPayloadsByType("state:store");
  const identityCookie = handle.find((h) =>
    h.key.includes(MAIN_IDENTITY_COOKIE_NAME),
  );

  return identityCookie;
};

describe("Setting edgeDomain to CNAME", () => {
  test("results in server calls made to this CNAME", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    await deleteCookies();

    await worker.use(...[demdexHandler, firstPartyAlloyHandler]);

    alloy("configure", { ...alloyConfig, edgeDomain: FIRST_PARTY_DOMAIN });

    await alloy("sendEvent");

    const demdexCall = await networkRecorder.findCall(demdexUrlRegex);
    expect(getIdentityCookie(demdexCall)).toBeDefined();

    networkRecorder.reset();

    await alloy("sendEvent");

    expect(await networkRecorder.findCall(FIRST_PARTY_DOMAIN)).toBeDefined();
    expect(networkRecorder.calls.length).toBe(1);
  });
});
