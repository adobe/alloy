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
import alloyConfig from "../../helpers/alloy/config.js";
import {
  acquireHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import { CONSENT_IN } from "../../helpers/constants/consent.js";

const EDGE_ECID = "41861666193140161934276845651148876988";

const setUpVisitor = ({
  ecid = EDGE_ECID,
  approved = true,
  deferred = false,
} = {}) => {
  let release;
  let isApproved = approved;
  const getMarketingCloudVisitorID = vi.fn((callback) => {
    if (deferred) {
      release = () => callback(ecid);
    } else {
      callback(ecid);
    }
  });
  const visitor = { getMarketingCloudVisitorID };
  const Visitor = function Visitor() {};
  Visitor.getInstance = vi.fn(() => visitor);
  window.Visitor = Visitor;

  const optIn = {
    fetchPermissions: vi.fn((callback) => callback()),
    isApproved: vi.fn(() => isApproved),
    Categories: { ECID: "ecid" },
  };
  window.adobe = { optIn };

  return {
    Visitor,
    getMarketingCloudVisitorID,
    optIn,
    approve: () => {
      isApproved = true;
    },
    release: () => release(),
  };
};

const getVisitorEcid = () =>
  new Promise((resolve) => {
    window.Visitor.getInstance(
      alloyConfig.orgId,
      {},
    ).getMarketingCloudVisitorID(resolve, true);
  });

afterEach(() => {
  delete window.Visitor;
  delete window.adobe;
});

describe("Visitor ID migration", () => {
  test("C35448 - ID migration enabled: Alloy waits for Visitor to get ECID and uses that value", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(acquireHandler);
    await alloy("configure", { ...alloyConfig, idMigrationEnabled: true });
    const visitor = setUpVisitor({ deferred: true });

    let settled = false;
    const identityPromise = alloy("getIdentity").then((result) => {
      settled = true;
      return result;
    });

    await vi.waitFor(() => {
      expect(visitor.getMarketingCloudVisitorID).toHaveBeenCalledOnce();
    });
    expect(settled).toBe(false);

    visitor.release();
    const identityResult = await identityPromise;
    const { request } = await networkRecorder.findCall(/v1\/identity\/acquire/);

    expect(request.body.xdm.identityMap.ECID[0].id).toBe(EDGE_ECID);
    expect(identityResult.identity).toEqual({ ECID: EDGE_ECID });
  });

  test("C35450 - ID migration + consent pending: when consent is given to both, Alloy waits for Visitor ECID", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(setConsentHandler, acquireHandler);
    const visitor = setUpVisitor();
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_IN);
    const identityResult = await alloy("getIdentity");
    const { request } = await networkRecorder.findCall(/v1\/identity\/acquire/);

    expect(visitor.optIn.fetchPermissions).toHaveBeenCalled();
    expect(visitor.getMarketingCloudVisitorID).toHaveBeenCalled();
    expect(request.body.xdm.identityMap.ECID[0].id).toBe(EDGE_ECID);
    expect(identityResult.identity).toEqual({ ECID: EDGE_ECID });
  });

  test("C36908 - ID migration + consent pending: Visitor denied, Alloy approved — Alloy ECID matches Visitor ECID", async ({
    alloy,
    worker,
  }) => {
    worker.use(setConsentHandler, acquireHandler);
    const visitor = setUpVisitor({ approved: false });
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: true,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_IN);
    const alloyIdentity = await alloy("getIdentity");

    expect(visitor.optIn.isApproved).toHaveBeenCalled();
    expect(visitor.getMarketingCloudVisitorID).not.toHaveBeenCalled();

    visitor.approve();
    const visitorEcid = await getVisitorEcid();

    expect(alloyIdentity.identity).toEqual({ ECID: visitorEcid });
  });

  test("C36909 - ID migration disabled + consent pending: Visitor denied, Alloy approved — Alloy gets its own ECID", async ({
    alloy,
    worker,
  }) => {
    worker.use(setConsentHandler, acquireHandler);
    const visitor = setUpVisitor({
      ecid: "12345678901234567890123456789012345678",
      approved: false,
    });
    await alloy("configure", {
      ...alloyConfig,
      idMigrationEnabled: false,
      defaultConsent: "pending",
    });

    await alloy("setConsent", CONSENT_IN);
    const alloyIdentity = await alloy("getIdentity");

    expect(visitor.optIn.fetchPermissions).not.toHaveBeenCalled();
    expect(visitor.getMarketingCloudVisitorID).not.toHaveBeenCalled();
    expect(alloyIdentity.identity.ECID).toBe(EDGE_ECID);
  });
});
