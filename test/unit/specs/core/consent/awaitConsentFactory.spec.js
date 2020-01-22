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

import awaitConsentFactory from "../../../../../src/core/consent/awaitConsentFactory";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("awaitConsentFactory", () => {
  let config;
  let consentState;
  let logger;

  const triggerConsentStateChange = () => {
    consentState.onChange.calls.allArgs().forEach(callArgs => {
      const callback = callArgs[0];
      callback();
    });
  };

  beforeEach(() => {
    config = {
      consentEnabled: true
    };
    consentState = jasmine.createSpyObj("consentState", {
      isPending: true,
      hasConsentedToAllPurposes: false,
      onChange: undefined
    });
    logger = jasmine.createSpyObj("logger", ["warn"]);
  });

  it("does not resolve promise if consent is enabled and consent is pending", () => {
    config.consentEnabled = true;
    consentState.isPending.and.returnValue(true);
    const awaitConsent = awaitConsentFactory({
      config,
      consentState,
      logger
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "Some commands may be delayed until the user consents."
    );

    const onFulfilled = jasmine.createSpy("onFulfilled");
    awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).not.toHaveBeenCalled();
    });
  });

  it("resolves promise if consent is not enabled", () => {
    config.consentEnabled = false;
    const awaitConsent = awaitConsentFactory({
      config,
      consentState,
      logger
    });

    const onFulfilled = jasmine.createSpy("onFulfilled");
    awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).toHaveBeenCalled();
    });
  });

  it("resolves promise if consent is enabled and user consented to all purposes", () => {
    config.consentEnabled = true;
    consentState.isPending.and.returnValue(false);
    consentState.hasConsentedToAllPurposes.and.returnValue(true);
    const awaitConsent = awaitConsentFactory({
      config,
      consentState,
      logger
    });

    const onFulfilled = jasmine.createSpy("onFulfilled");
    awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).toHaveBeenCalled();
    });
  });

  it("rejects promise if consent is enabled and user consented to no purposes", () => {
    config.consentEnabled = true;
    consentState.isPending.and.returnValue(false);
    consentState.hasConsentedToAllPurposes.and.returnValue(false);
    const awaitConsent = awaitConsentFactory({
      config,
      consentState,
      logger
    });

    const onRejected = jasmine.createSpy("onRejected");
    awaitConsent().catch(onRejected);

    return flushPromiseChains().then(() => {
      expect(onRejected).toHaveBeenCalled();
    });
  });

  it("processes consent when consent state changes", () => {
    consentState.isPending.and.returnValue(true);
    const awaitConsent = awaitConsentFactory({
      config,
      consentState,
      logger
    });

    const onFulfilled = jasmine.createSpy("onFulfilled");
    awaitConsent().then(onFulfilled);

    return flushPromiseChains()
      .then(() => {
        expect(onFulfilled).not.toHaveBeenCalled();
        consentState.isPending.and.returnValue(false);
        consentState.hasConsentedToAllPurposes.and.returnValue(true);
        triggerConsentStateChange();
        return flushPromiseChains();
      })
      .then(() => {
        expect(onFulfilled).toHaveBeenCalled();
      });
  });

  it("logs a warning if consent is pending", () => {
    consentState.isPending.and.returnValue(true);
    awaitConsentFactory({
      config,
      consentState,
      logger
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Some commands may be delayed until the user consents."
    );
  });

  it("logs a warning if user consented to no purposes", () => {
    consentState.isPending.and.returnValue(false);
    consentState.hasConsentedToAllPurposes.and.returnValue(false);
    awaitConsentFactory({
      config,
      consentState,
      logger
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Some commands may fail. The user declined consent."
    );
  });
});
