/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import injectAwaitIdentityCookie from "../../../../../src/components/Identity/injectAwaitIdentityCookie";

describe("Identity::injectAwaitIdentityCookie", () => {
  let edgeDomain;
  let apexDomain;
  let orgId;
  let doesIdentityCookieExist;
  let awaitIdentityCookie;
  let extractOrgIdsFromCookies;
  let runOnResponseCallbacks;
  let runOnRequestFailureCallbacks;
  let onResponse;
  let onRequestFailure;

  beforeEach(() => {
    doesIdentityCookieExist = jasmine
      .createSpy("doesIdentityCookieExist")
      .and.returnValue(true);
    edgeDomain = "adobe.com";
    apexDomain = "adobe.com";
    const onResponseCallbacks = [];
    runOnResponseCallbacks = () => {
      onResponseCallbacks.forEach(callback => {
        callback();
      });
    };
    onResponse = callback => onResponseCallbacks.push(callback);
    const onRequestFailureCallbacks = [];
    runOnRequestFailureCallbacks = () => {
      onRequestFailureCallbacks.forEach(callback => {
        callback();
      });
    };
    onRequestFailure = callback => onRequestFailureCallbacks.push(callback);
    orgId = "org@adobe";
    extractOrgIdsFromCookies = jasmine.createSpy().and.returnValue([orgId]);
    awaitIdentityCookie = injectAwaitIdentityCookie({
      orgId,
      doesIdentityCookieExist,
      extractOrgIdsFromCookies,
      edgeDomain,
      apexDomain
    });
  });

  it("resolves promise if identity cookie exists after response", () => {
    const promise = awaitIdentityCookie({ onResponse, onRequestFailure });
    runOnResponseCallbacks();
    return promise;
  });

  it("rejects promise if identity cookie does not exist after response and there are other org cookies on the page", () => {
    doesIdentityCookieExist.and.returnValue(false);
    extractOrgIdsFromCookies.and.returnValue(["org2@adobe"]);
    const promise = awaitIdentityCookie({ onResponse, onRequestFailure });
    const errorRegex = /Valid organizations on this page are: org2@adobe/;
    expect(() => {
      runOnResponseCallbacks();
    }).toThrowError(errorRegex);
    return expectAsync(promise).toBeRejectedWithError(errorRegex);
  });

  it("rejects promise if identity cookie does not exist after response and there are no other cookies from other organizations", () => {
    doesIdentityCookieExist.and.returnValue(false);
    const promise = awaitIdentityCookie({ onResponse, onRequestFailure });
    const errorRegex = /verify that cookies returned from/;
    expect(() => {
      runOnResponseCallbacks();
    }).toThrowError(errorRegex);
    return expectAsync(promise).toBeRejectedWithError(errorRegex);
  });

  it("rejects promise if identity cookie does not exist after response and the edge domain does not match the apex domain", () => {
    doesIdentityCookieExist.and.returnValue(false);
    edgeDomain = "analytics.example.com";
    apexDomain = "adobe.com";
    awaitIdentityCookie = injectAwaitIdentityCookie({
      orgId,
      doesIdentityCookieExist,
      extractOrgIdsFromCookies,
      edgeDomain,
      apexDomain
    });
    const promise = awaitIdentityCookie({ onResponse, onRequestFailure });
    const errorRegex = /does not match apex domain/;
    expect(() => {
      runOnResponseCallbacks();
    }).toThrowError(errorRegex);
    return expectAsync(promise).toBeRejectedWithError(errorRegex);
  });

  it("resolves promise if identity cookie exists after request failure", () => {
    const promise = awaitIdentityCookie({ onResponse, onRequestFailure });
    runOnRequestFailureCallbacks();
    return promise;
  });

  it("rejects promise if identity cookie does not exist after request failure", () => {
    doesIdentityCookieExist.and.returnValue(false);
    const promise = awaitIdentityCookie({ onResponse, onRequestFailure });
    runOnRequestFailureCallbacks();
    return expectAsync(promise).toBeRejected();
  });
});
