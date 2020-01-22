/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createConsent from "../../../../../src/core/consent/createConsent";
import { IN } from "../../../../../src/constants/consentStatus";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("createConsent", () => {
  let lifecycle;
  let payload;
  let createConsentRequestPayload;
  let sendEdgeNetworkRequest;
  let consentState;
  let awaitConsent;
  let consent;

  beforeEach(() => {
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeConsentRequest: Promise.resolve()
    });

    payload = jasmine.createSpyObj("payload", ["setConsentLevel"]);
    createConsentRequestPayload = jasmine.createSpy().and.returnValue(payload);
    sendEdgeNetworkRequest = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    consentState = jasmine.createSpyObj("consentState", {
      isPending: true,
      hasConsentedToAllPurposes: false,
      suspend: undefined,
      unsuspend: undefined,
      updateFromCookies: undefined
    });
    awaitConsent = jasmine.createSpy();
    consent = createConsent({
      lifecycle,
      createConsentRequestPayload,
      sendEdgeNetworkRequest,
      consentState,
      awaitConsent
    });
  });

  it("exposes awaitConsent", () => {
    expect(consent.awaitConsent).toBe(awaitConsent);
  });

  it("exposes consentRequestComplete", () => {
    expect(consent.consentRequestComplete).toBe(consentState.unsuspend);
  });

  it("exposes requestComplete", () => {
    expect(consent.requestComplete).toBe(consentState.updateFromCookies);
  });

  it("prevents setting consent if the user already consented to no purposes", () => {
    consentState.isPending.and.returnValue(false);
    consentState.hasConsentedToAllPurposes.and.returnValue(false);

    return expectAsync(
      consent.setConsent({
        general: IN
      })
    ).toBeRejectedWithError(
      "The user previously declined consent, which cannot be changed."
    );
  });

  it("suspends consent state until request completes", () => {
    const requestDeferred = defer();

    sendEdgeNetworkRequest.and.callFake(() => {
      return requestDeferred.promise;
    });
    consent.setConsent({
      general: IN
    });

    return flushPromiseChains().then(() => {
      expect(consentState.suspend).toHaveBeenCalled();
      expect(consentState.unsuspend).not.toHaveBeenCalled();
      consent.consentRequestComplete();
      expect(consentState.unsuspend).toHaveBeenCalled();
    });
  });

  it("waits for onBeforeConsentRequest, sets consent level, then sends request", () => {
    const onBeforeConsentRequestDeferred = defer();
    lifecycle.onBeforeConsentRequest.and.returnValue(
      onBeforeConsentRequestDeferred.promise
    );

    const sendEdgeNetworkRequestDeferred = defer();
    sendEdgeNetworkRequest.and.returnValue(
      sendEdgeNetworkRequestDeferred.promise
    );

    const consentByPurpose = {
      general: IN
    };

    consent.setConsent(consentByPurpose);

    return flushPromiseChains()
      .then(() => {
        expect(lifecycle.onBeforeConsentRequest).toHaveBeenCalled();
        expect(sendEdgeNetworkRequest).not.toHaveBeenCalled();
        expect(payload.setConsentLevel).not.toHaveBeenCalled();
        onBeforeConsentRequestDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(payload.setConsentLevel).toHaveBeenCalledWith(consentByPurpose);
        expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
          payload,
          action: "privacy/set-consent"
        });
      });
  });

  it("resolves promise if request succeeds", () => {
    return expectAsync(
      consent.setConsent({
        general: IN
      })
    ).toBeResolvedTo(undefined);
  });

  it("rejects promise if request fails", () => {
    sendEdgeNetworkRequest.and.returnValue(
      Promise.reject(new Error("Error occurred."))
    );
    return expectAsync(
      consent.setConsent({
        general: IN
      })
    ).toBeRejectedWithError("Error occurred.");
  });
});
