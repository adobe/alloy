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

import createConsentStateMachine from "../../../../../src/core/consent/createConsentStateMachine";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

const DECLINED_CONSENT_ERROR_CODE = "declinedConsent";

describe("createConsentStateMachine", () => {
  let logger;
  let subject;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["info", "warn"]);
    subject = createConsentStateMachine({ logger });
  });

  it("does not resolve promise if consent is pending", () => {
    subject.pending();
    const onFulfilled = jasmine.createSpy("onFulfilled");
    subject.awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).not.toHaveBeenCalled();
    });
  });

  it("resolves promise if user consented to all purposes", () => {
    subject.in();
    const onFulfilled = jasmine.createSpy("onFulfilled");
    subject.awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).toHaveBeenCalled();
    });
  });

  [
    ["default", "No consent preferences have been set."],
    ["initial", "The user declined consent."],
    ["new", "The user declined consent."]
  ].forEach(([source, expectedMessage]) => {
    it("rejects promise if user consented to no purposes", () => {
      subject.out(source);
      const onRejected = jasmine.createSpy("onRejected");
      subject.awaitConsent().catch(onRejected);

      return flushPromiseChains().then(() => {
        const error = onRejected.calls.argsFor(0)[0];
        expect(error.code).toBe(DECLINED_CONSENT_ERROR_CODE);
        expect(error.message).toBe(expectedMessage);
      });
    });
  });

  it("resolves queued promises when consent set to in", () => {
    subject.pending();
    const onFulfilled = jasmine.createSpy("onFulfilled");
    subject.awaitConsent().then(onFulfilled);

    return flushPromiseChains()
      .then(() => {
        expect(onFulfilled).not.toHaveBeenCalled();
        subject.in();
        return flushPromiseChains();
      })
      .then(() => {
        expect(onFulfilled).toHaveBeenCalled();
      });
  });

  it("rejects queued promises when consent set to out", () => {
    subject.pending();
    const onRejected = jasmine.createSpy("onRejected");
    subject.awaitConsent().catch(onRejected);

    return flushPromiseChains()
      .then(() => {
        expect(onRejected).not.toHaveBeenCalled();
        subject.out();
        return flushPromiseChains();
      })
      .then(() => {
        const error = onRejected.calls.argsFor(0)[0];
        expect(error.code).toBe(DECLINED_CONSENT_ERROR_CODE);
        expect(error.message).toBe("The user declined consent.");
      });
  });

  it("rejects promises when it is not initialized", () => {
    const onRejected = jasmine.createSpy("onRejected");
    return subject
      .awaitConsent()
      .catch(onRejected)
      .then(() => {
        expect(onRejected).toHaveBeenCalled();
      });
  });

  [
    ["in", "default"],
    ["in", "initial", "Loaded user consent preferences.", "info"],
    ["in", "new", "User consented.", "info"],
    [
      "out",
      "default",
      "No saved user consent preferences. Some commands may fail."
    ],
    [
      "out",
      "initial",
      "Loaded user consent preferences. Some commands may fail."
    ],
    ["out", "new", "User declined consent. Some commands may fail."],
    [
      "pending",
      "default",
      "No saved user consent preferences. Some commands may be delayed.",
      "info"
    ],
    ["pending", "initial"],
    ["pending", "new"]
  ].forEach(([action, source, expectedMessage, logLevel = "warn"]) => {
    it(`logs the correct messages when ${action} is called with source ${source}`, () => {
      subject[action](source);
      if (expectedMessage) {
        expect(logger[logLevel]).toHaveBeenCalledWith(expectedMessage);
      } else {
        expect(logger.warn).not.toHaveBeenCalled();
      }
    });
  });

  [
    ["in", "User consented.", "info"],
    ["out", "User declined consent. Some commands may fail.", "warn"]
  ].forEach(([action, expectedMessage, logLevel]) => {
    ["in", "out", "pending"].forEach(defaultConsent => {
      it(`logs a message when first setting consent (${defaultConsent} => ${action}) using setConsent`, () => {
        subject[defaultConsent]("default");
        subject.pending();
        subject[action]("new");
        expect(logger[logLevel]).toHaveBeenCalledWith(expectedMessage);
      });
      it(`logs a message when first setting consent (${defaultConsent} => ${action}) using sendEvent`, () => {
        subject[defaultConsent]("default");
        subject[action]("new");
        expect(logger[logLevel]).toHaveBeenCalledWith(expectedMessage);
      });
    });
    it(`doesn't log a message when a request returns or fails. (${action})`, () => {
      subject[action]("initial");
      logger.info.calls.reset();
      logger.warn.calls.reset();
      subject[action]("new");
      subject[action]("new");
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });
});
