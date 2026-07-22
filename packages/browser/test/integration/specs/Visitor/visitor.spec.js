/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  test,
  describe,
  expect,
  afterEach,
  vi,
} from "../../helpers/testsSetup/extend.js";
import { http, HttpResponse } from "msw";
import alloyConfig from "../../helpers/alloy/config.js";
import { setConsentHandler } from "../../helpers/mswjs/handlers.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";
import getVisitorEcid from "../../helpers/visitorService/getVisitorEcid.js";
import loadVisitor from "../../helpers/visitorService/loadVisitor.js";

const EDGE_ECID = "41861666193140161934276845651148876988";
const VISITOR_ECID = "12345678901234567890123456789012345678";

const acquireHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/identity\/acquire/,
  async ({ request }) => {
    const body = await request.json();
    const ecid = body.xdm?.identityMap?.ECID?.[0]?.id || EDGE_ECID;

    return HttpResponse.json({
      requestId: "acquire-request-id",
      handle: [
        {
          type: "identity:result",
          payload: [{ id: ecid, namespace: { code: "ECID" } }],
        },
      ],
    });
  },
);

const createVisitorApiHandler = ({ deferred = false } = {}) => {
  let releaseResponse;
  let markRequestStarted;
  const requestStarted = new Promise((resolve) => {
    markRequestStarted = resolve;
  });

  const handler = http.get("https://dpm.demdex.net/id", async () => {
    markRequestStarted();
    if (deferred) {
      await new Promise((resolve) => {
        releaseResponse = resolve;
      });
    }

    return HttpResponse.json(
      { mid: VISITOR_ECID },
      {
        headers: {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Origin": window.location.origin,
        },
      },
    );
  });

  return {
    handler,
    requestStarted,
    release: () => releaseResponse(),
  };
};

const setUpOptIn = (approved) => {
  const optIn = {
    fetchPermissions: vi.fn((callback) => callback()),
    isApproved: vi.fn(() => approved),
    Categories: { ECID: "ecid" },
  };
  window.adobe.optIn = optIn;
  return optIn;
};

afterEach(() => {
  window.s_c_il = [];
  window.s_c_in = 0;
  window.adobe.optIn = {
    fetchPermissions: (callback) => callback(),
    isApproved: () => true,
    Categories: { ECID: "ecid" },
  };
});

describe("Visitor ID migration", () => {
  test("C35448 - ID migration enabled: Alloy waits for Visitor to get ECID and uses that value", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const visitorApi = createVisitorApiHandler({ deferred: true });
    worker.use(visitorApi.handler, acquireHandler);
    await alloy("configure", { ...alloyConfig, idMigrationEnabled: true });
    await loadVisitor();

    let settled = false;
    const identityPromise = alloy("getIdentity").then((result) => {
      settled = true;
      return result;
    });

    await visitorApi.requestStarted;
    expect(settled).toBe(false);

    visitorApi.release();
    const identityResult = await identityPromise;
    const { request } = await networkRecorder.findCall(/v1\/identity\/acquire/);

    expect(request.body.xdm.identityMap.ECID[0].id).toBe(VISITOR_ECID);
    expect(identityResult.identity).toEqual({ ECID: VISITOR_ECID });
  });

  test("C35450 - ID migration + consent pending: when consent is given to both, Alloy waits for Visitor ECID", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    const visitorApi = createVisitorApiHandler();
    worker.use(visitorApi.handler, setConsentHandler, acquireHandler);
    await loadVisitor();
    const optIn = setUpOptIn(true);
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_IN);
    const visitorEcidPromise = getVisitorEcid(alloyConfig.orgId);
    const identityResult = await alloy("getIdentity");
    const visitorEcid = await visitorEcidPromise;
    const { request } = await networkRecorder.findCall(/v1\/identity\/acquire/);

    expect(optIn.fetchPermissions).toHaveBeenCalled();
    expect(request.body.xdm.identityMap.ECID[0].id).toBe(visitorEcid);
    expect(identityResult.identity).toEqual({ ECID: visitorEcid });
  });

  test("C36908 - ID migration + consent pending: Visitor denied, Alloy approved — Alloy ECID matches Visitor ECID", async ({
    alloy,
    worker,
  }) => {
    const visitorApi = createVisitorApiHandler();
    worker.use(visitorApi.handler, setConsentHandler, acquireHandler);
    await loadVisitor();
    const optIn = setUpOptIn(false);
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_IN);
    const alloyIdentity = await alloy("getIdentity");

    expect(optIn.isApproved).toHaveBeenCalled();

    setUpOptIn(true);
    const visitorEcid = await getVisitorEcid(alloyConfig.orgId);

    expect(alloyIdentity.identity).toEqual({ ECID: visitorEcid });
  });

  test("C36909 - ID migration disabled + consent pending: Visitor denied, Alloy approved — Alloy gets its own ECID", async ({
    alloy,
    worker,
  }) => {
    const visitorApi = createVisitorApiHandler();
    worker.use(visitorApi.handler, setConsentHandler, acquireHandler);
    await loadVisitor();
    setUpOptIn(false);
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: false,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_IN);
    const alloyIdentity = await alloy("getIdentity");
    const visitorEcid = await getVisitorEcid(alloyConfig.orgId);

    expect(alloyIdentity.identity.ECID).toBe(EDGE_ECID);
    expect(alloyIdentity.identity.ECID).not.toBe(visitorEcid);
  });
});
