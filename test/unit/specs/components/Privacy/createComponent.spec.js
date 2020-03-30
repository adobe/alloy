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

describe("privacy:createComponent", () => {
  let readStoredConsent;
  let taskQueue;
  let defaultConsent;
  let consent;
  let sendSetConsentRequest;
  let validateSetConsentOptions;
  let component;

  beforeEach(() => {
    readStoredConsent = jasmine.createSpy("readStoredConsent");
    taskQueue = createTaskQueue();
    defaultConsent = { general: "in" };
    consent = jasmine.createSpyObj("consent", ["setConsent", "suspend"]);
    sendSetConsentRequest = jasmine.createSpy("sendSetConsentRequest");
    validateSetConsentOptions = jasmine
      .createSpy("validateSetConsentOptions")
      .and.callFake(options => options);
  });

  const build = () => {
    component = createComponent({
      readStoredConsent,
      taskQueue,
      defaultConsent,
      consent,
      sendSetConsentRequest,
      validateSetConsentOptions
    });
  };

  it("uses the default consent", () => {
    defaultConsent = { general: "pending" };
    readStoredConsent.and.returnValue({});
    build();
    expect(consent.setConsent).toHaveBeenCalledWith({ general: "pending" });
  });

  it("uses the stored consent", () => {
    readStoredConsent.and.returnValue({ general: "out" });
    build();
    expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
  });

  it("handles the setConsent command", () => {
    defaultConsent = { general: "pending" };
    readStoredConsent.and.returnValues({}, { general: "in" });
    build();
    validateSetConsentOptions.and.returnValue({ general: "in" });
    sendSetConsentRequest.and.returnValue(Promise.resolve());
    component.commands.setConsent("unvalidated");
    expect(validateSetConsentOptions).toHaveBeenCalledWith("unvalidated");
    expect(consent.suspend).toHaveBeenCalled();
    return flushPromiseChains().then(() => {
      expect(sendSetConsentRequest).toHaveBeenCalledWith({ general: "in" });
      expect(consent.setConsent).toHaveBeenCalledWith({ general: "in" });
    });
  });

  it("updates the consent object even after a request failure", () => {
    defaultConsent = { general: "pending" };
    readStoredConsent.and.returnValues({}, { general: "in" });
    build();
    sendSetConsentRequest.and.returnValue(Promise.reject());
    component.commands.setConsent({ general: "in" });
    return flushPromiseChains().then(() => {
      expect(consent.setConsent).toHaveBeenCalledWith({ general: "in" });
    });
  });

  it("only updates the consent object after the response returns", () => {
    defaultConsent = { general: "pending" };
    readStoredConsent.and.returnValues({}, { general: "in" });
    build();
    const deferredConsentRequest = defer();
    sendSetConsentRequest.and.returnValue(deferredConsentRequest.promise);
    component.commands.setConsent({ general: "in" });
    return flushPromiseChains()
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({ general: "in" });
        expect(consent.setConsent).not.toHaveBeenCalledWith({ general: "in" });
        deferredConsentRequest.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(consent.setConsent).toHaveBeenCalledWith({ general: "in" });
      });
  });

  it("only calls setConsent once with multiple consent requests", () => {
    defaultConsent = { general: "pending" };
    readStoredConsent.and.returnValues({}, { general: "out" });
    build();
    const deferredConsentRequest1 = defer();
    const deferredConsentRequest2 = defer();
    sendSetConsentRequest.and.returnValues(
      deferredConsentRequest1.promise,
      deferredConsentRequest2.promise
    );
    component.commands.setConsent({ general: "in" });
    return flushPromiseChains()
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({ general: "in" });
        component.commands.setConsent({ general: "out" });
        deferredConsentRequest1.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(sendSetConsentRequest).toHaveBeenCalledWith({ general: "out" });
        deferredConsentRequest2.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(consent.setConsent).not.toHaveBeenCalledWith({ general: "in" });
        expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
      });
  });

  it("checks the cookie after an event", () => {
    readStoredConsent.and.returnValues({}, { general: "out" });
    build();
    component.lifecycle.onResponse();
    expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
  });

  it("checks the cookie after an error response", () => {
    readStoredConsent.and.returnValues({}, { general: "out" });
    build();
    component.lifecycle.onRequestFailure();
    expect(consent.setConsent).toHaveBeenCalledWith({ general: "out" });
  });
});
