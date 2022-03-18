/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import injectAddQueryStringIdentityToPayload from "../../../../../src/components/Identity/injectAddQueryStringIdentityToPayload";

describe("Identity::injectAddQueryStringIdentityToPayload", () => {
  let locationSearch;
  let dateProvider;
  let orgId;
  let date;
  let payload;

  beforeEach(() => {
    payload = jasmine.createSpyObj("payload", ["addIdentity", "hasIdentity"]);
    payload.hasIdentity.and.returnValue(false);
    dateProvider = () => date;
    locationSearch =
      "?foo=bar&adobe_mc=TS%3D1641432103%7CMCMID%3D77094828402023918047117570965393734545%7CMCORGID%3DFAF554945B90342F0A495E2C%40AdobeOrg&a=b";
    date = new Date(1641432103 * 1000);
    orgId = "FAF554945B90342F0A495E2C@AdobeOrg";
  });

  const run = () => {
    injectAddQueryStringIdentityToPayload({
      locationSearch,
      dateProvider,
      orgId
    })(payload);
  };

  it("adds the identity", () => {
    run();
    expect(payload.addIdentity).toHaveBeenCalledOnceWith("ECID", {
      id: "77094828402023918047117570965393734545"
    });
  });

  it("doesn't overwrite an existing identity in the identityMap", () => {
    payload.hasIdentity.and.returnValue(true);
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  it("doesn't do anything when there is no query string", () => {
    locationSearch = "";
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  it("doesn't do anything when there is no TS parameter", () => {
    locationSearch = `?adobe_mc=${encodeURIComponent(
      "MCMID=myid|MCORG=myorg"
    )}`;
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  it("doesn't do anything when there is no MCMID parameter", () => {
    locationSearch = `?adobe_mc=${encodeURIComponent("TS=1000|MCORG=myorg")}`;
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  it("doesn't do anything when there is no MCORG parameter", () => {
    locationSearch = `?adobe_mc=${encodeURIComponent("TS=1000|MCMID=myid")}`;
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  it("doesn't do anything with an expired link", () => {
    date = new Date((1641432103 + 301) * 1000);
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  it("add the identity for an exactly 5 minute old link", () => {
    date = new Date((1641432103 + 300) * 1000);
    run();
    expect(payload.addIdentity).toHaveBeenCalled();
  });

  it("doesn't do anything when the orgs don't match", () => {
    orgId = "myotherorg";
    run();
    expect(payload.addIdentity).not.toHaveBeenCalled();
  });

  ["adobe_mc=", "adobe_mc=a", "adobe_mc=a%3Db", "adobe_mc=%7C%7C"].forEach(
    value => {
      it(`handles garbage parameter value: ${value}`);
    }
  );
});
