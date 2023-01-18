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

import createComponent from "../../../../../src/components/Privacy/createComponent";
import { createTaskQueue, defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

const createConsent = generalConsent => ({
  consent: [
    {
      standard: "Adobe",
      version: "1.0",
      value: {
        general: generalConsent
      }
    }
  ]
});
const CONSENT_IN = createConsent("in");
const CONSENT_OUT = createConsent("out");

describe("privacy:createComponent", () => {
  let storedConsent;
  let taskQueue;
  let defaultConsent;
  let consent;
  let sendSetConsentRequest;
  let validateSetConsentOptions;
  let consentHashStore;
  let consentHashes;
  let doesIdentityCookieExist;
  let requestFailureError;
  let component;

  const setIdentityCookie = () => {
    doesIdentityCookieExist.and.returnValue(true);
  };

  const clearIdentityCookie = () => {
    doesIdentityCookieExist.and.returnValue(false);
  };

  beforeEach(() => {
    storedConsent = jasmine.createSpyObj("storedConsent", ["read", "clear"]);
    taskQueue = createTaskQueue();
    defaultConsent = "in";
    consent = jasmine.createSpyObj("consent", [
      "initializeConsent",
      "setConsent",
      "suspend"
    ]);
    sendSetConsentRequest = jasmine.createSpy("sendSetConsentRequest");
    validateSetConsentOptions = jasmine
      .createSpy("validateSetConsentOptions")
      .and.callFake(options => options);
    consentHashStore = jasmine.createSpyObj("consentHashStore", [
      "clear",
      "lookup"
    ]);
    consentHashes = jasmine.createSpyObj("consentHashes", ["isNew", "save"]);
    doesIdentityCookieExist = jasmine.createSpy("doesIdentityCookieExist");
    consentHashStore.lookup.and.returnValue(consentHashes);
    setIdentityCookie();
    consentHashes.isNew.and.returnValue(true);
    requestFailureError = new Error("Request for setting test consent failed.");
  });

  const build = () => {
    component = createComponent({
      storedConsent,
      taskQueue,
      defaultConsent,
      consent,
      sendSetConsentRequest,
      validateSetConsentOptions,
      consentHashStore,
      doesIdentityCookieExist
    });
  };

  const clearConsentCookie = function clearConsentCookie() {
    storedConsent.read.and.returnValue({});
  };

  const setConsentCookieIn = function setConsentCookieIn() {
    storedConsent.read.and.returnValue({ general: "in" });
  };

  const setConsentCookieOut = function setConsentCookieOut() {
    storedConsent.read.and.returnValue({ general: "out" });
  };

  const mockSetConsent = () => {
    const deferred = defer();
    sendSetConsentRequest.and.returnValue(deferred.promise);
    // ensure that there will be no uncaught promise rejections
    deferred.promise.catch(() => {});
    return {
      respondWithIn() {
        setConsentCookieIn();
        deferred.resolve();
      },
      respondWithOut() {
        setConsentCookieOut();
        deferred.resolve();
      },
      respondWithNoCookie() {
        deferred.resolve();
      },
      respondWithError() {
        deferred.reject(requestFailureError);
      }
    };
  };

  it("initializes consent", () => {
    defaultConsent = "mydefaultconsent";
    storedConsent.read.and.returnValue({ general: "myinitialconsent" });
    build();
    expect(consent.initializeConsent).toHaveBeenCalledWith(
      { general: "mydefaultconsent" },
      { general: "myinitialconsent" }
    );
  });

  it("handles the setConsent command", () => {
    defaultConsent = "pending";
    clearConsentCookie();
    build();
    const setConsentMock = mockSetConsent();
    const onResolved = jasmine.createSpy("onResolved");
    component.commands.setConsent
      .run({ identityMap: { my: "map" }, ...CONSENT_IN })
      .then(onResolved);
    expect(consent.suspend).toHaveBeenCalled();
    setConsentMock.respondWithIn();
    return flushPromiseChains().then(() => {
      expect(sendSetConsentRequest).toHaveBeenCalledWith({
        consentOptions: CONSENT_IN.consent,
        identityMap: { my: "map" }
      });
      expect(consent.setConsent).toHaveBeenCalledWith({ general: "in" });
      expect(onResolved).toHaveBeenCalledWith(undefined);
    });
  });

  it("updates the consent object even after a request failure", () => {
    defaultConsent = "pending";
    clearConsentCookie();
    build();
    const setConsentMock = mockSetConsent();
    const onRejected = jasmine.createSpy("onRejected");
    component.commands.setConsent.run(CONSENT_IN).catch(onRejected);
    setConsentCookieIn();
    setConsentMock.respondWithError();
    return flushPromiseChains().then(() => {
      expect(consent.setConsent).toHaveBeenCalledWith({ general: "in" });
      expect(onRejected).toHaveBeenCalledWith(requestFailureError);
    });
  });

  it("only updates the consent object after the response returns", () => {
    defaultConsent = "pending";
    clearConsentCookie();
    build();
    const setConsentMock = mockSetConsent();
    component.commands.setConsent.run(CONSENT_IN);
    return flushPromiseChains()
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({
          consentOptions: CONSENT_IN.consent,
          identityMap: undefined
        });
        expect(consent.setConsent).not.toHaveBeenCalledWith({ general: "in" });
        setConsentMock.respondWithIn();
        return flushPromiseChains();
      })
      .then(() => {
        expect(consent.setConsent).toHaveBeenCalledWith({ general: "in" });
      });
  });

  it("only calls setConsent once with multiple consent requests", () => {
    defaultConsent = "pending";
    clearConsentCookie();
    consentHashes.isNew.and.returnValue(true);
    build();
    const setConsentMock1 = mockSetConsent();
    let setConsentMock2;
    component.commands.setConsent.run(CONSENT_IN);
    return flushPromiseChains()
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({
          consentOptions: CONSENT_IN.consent,
          identityMap: undefined
        });
        setConsentMock2 = mockSetConsent();
        component.commands.setConsent.run(CONSENT_OUT);
        setConsentMock1.respondWithIn();
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({
          consentOptions: CONSENT_OUT.consent,
          identityMap: undefined
        });
        setConsentMock2.respondWithOut();
        return flushPromiseChains();
      })
      .then(() => {
        expect(consent.setConsent).not.toHaveBeenCalledWith({ general: "in" });
        expect(consent.setConsent).toHaveBeenCalledTimes(1);
        expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
      });
  });

  it("checks the cookie after an event", () => {
    clearConsentCookie();
    build();
    setConsentCookieOut();
    component.lifecycle.onResponse();
    expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
  });

  it("checks the cookie after an error response", () => {
    clearConsentCookie();
    build();
    setConsentCookieOut();
    component.lifecycle.onRequestFailure();
    expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
  });

  it("clears storage when the identity cookie is missing", () => {
    setConsentCookieIn();
    clearIdentityCookie();
    build();
    expect(consentHashStore.clear).toHaveBeenCalled();
    expect(storedConsent.clear).toHaveBeenCalled();
    expect(consent.initializeConsent).toHaveBeenCalledWith(
      { general: "in" },
      {}
    );
  });

  it("clears storage when the consent cookie is missing", () => {
    clearConsentCookie();
    setIdentityCookie();
    build();
    expect(consentHashStore.clear).toHaveBeenCalled();
    expect(storedConsent.clear).not.toHaveBeenCalled();
  });

  it("doesn't call setConsent when there is no cookie after onResponse", () => {
    clearConsentCookie();
    build();
    component.lifecycle.onResponse();
    expect(consent.setConsent).not.toHaveBeenCalled();
  });

  it("doesn't call setConsent when there is no cookie after onRequestFailure", () => {
    clearConsentCookie();
    build();
    component.lifecycle.onRequestFailure();
    expect(consent.setConsent).not.toHaveBeenCalled();
  });
});
