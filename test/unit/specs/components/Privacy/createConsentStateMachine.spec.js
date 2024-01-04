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

import createConsentStateMachine from "../../../../../src/components/Privacy/createConsentStateMachine";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

const DECLINED_CONSENT_ERROR_CODE = "declinedConsent";

describe("createConsentStateMachine", () => {
  let logger;
  let subject;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["info", "warn"]);
  });

  const run = (defaultState, storedState) => {
    subject = createConsentStateMachine({ logger, defaultState, storedState });
  };

  const expectRejectedWith = (promise, message) => {
    const onRejected = jasmine.createSpy("onRejected");
    promise.catch(onRejected);

    return flushPromiseChains().then(() => {
      const error = onRejected.calls.argsFor(0)[0];
      expect(error.code).toBe(DECLINED_CONSENT_ERROR_CODE);
      expect(error.message).toBe(message);
    });
  };

  it("does not resolve promise if consent is pending", () => {
    run("pending");
    const onFulfilled = jasmine.createSpy("onFulfilled");
    subject.awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).not.toHaveBeenCalled();
    });
  });

  it("resolves promise if consent is in", () => {
    run("in");
    const onFulfilled = jasmine.createSpy("onFulfilled");
    subject.awaitConsent().then(onFulfilled);

    return flushPromiseChains().then(() => {
      expect(onFulfilled).toHaveBeenCalled();
    });
  });

  it("rejects promise if default is out", () => {
    run("out");
    return expectRejectedWith(
      subject.awaitConsent(),
      "No consent preferences have been set."
    );
  });

  it("rejects promise if stored is out", () => {
    run("pending", "out");
    return expectRejectedWith(
      subject.awaitConsent(),
      "The user declined consent."
    );
  });

  it("rejects promise if setConsent with OUT", () => {
    run("pending");
    subject.out();
    return expectRejectedWith(
      subject.awaitConsent(),
      "The user declined consent."
    );
  });

  it("resolves queued promises when consent set to in", () => {
    run("pending");
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
    run("pending");
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

  [
    ["in", "default"],
    [
      "in",
      "initial",
      "Loaded user consent preferences. The user previously consented.",
      "info"
    ],
    ["in", "new", "User consented.", "info"],
    [
      "out",
      "default",
      "User consent preferences not found. Default consent of out will be used."
    ],
    [
      "out",
      "initial",
      "Loaded user consent preferences. The user previously declined consent."
    ],
    ["out", "new", "User declined consent."],
    [
      "pending",
      "default",
      "User consent preferences not found. Default consent of pending will be used. Some commands may be delayed.",
      "info"
    ],
    ["pending", "initial", "Unknown stored consent value: pending.", "warn"],
    ["pending", "new"]
  ].forEach(([action, source, expectedMessage, logLevel = "warn"]) => {
    it(`logs the correct messages when ${action} is called with source ${source}`, () => {
      if (source === "initial") {
        run(undefined, action);
      }
      if (source === "default") {
        run(action, undefined);
      }
      if (source === "new") {
        run("in");
        subject[action]();
      }
      if (expectedMessage) {
        expect(logger[logLevel]).toHaveBeenCalledWith(expectedMessage);
      } else {
        expect(logger.warn).not.toHaveBeenCalled();
      }
    });
  });

  [
    ["in", "User consented.", "info"],
    ["out", "User declined consent.", "warn"]
  ].forEach(([action, expectedMessage, logLevel]) => {
    ["in", "out", "pending"].forEach(defaultConsent => {
      it(`logs a message when first setting consent (${defaultConsent} => ${action}) using setConsent`, () => {
        run(defaultConsent);
        subject.pending();
        subject[action]();
        expect(logger[logLevel]).toHaveBeenCalledWith(expectedMessage);
      });
      it(`logs a message when first setting consent (${defaultConsent} => ${action}) using sendEvent`, () => {
        run(defaultConsent);
        subject[action]();
        expect(logger[logLevel]).toHaveBeenCalledWith(expectedMessage);
      });
    });
    it(`doesn't log a message when a request returns or fails. (${action})`, () => {
      run(undefined, action);
      logger.info.calls.reset();
      logger.warn.calls.reset();
      subject[action]();
      subject[action]();
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  describe("withConsent", () => {
    it(`returns immediately when default consent is set to "in"`, () => {
      run("in");
      return expectAsync(subject.withConsent()).toBeResolvedTo();
    });
    it(`rejects when default consent is set to "out"`, () => {
      run("out");
      return expectAsync(subject.withConsent()).toBeRejected();
    });
    it(`rejects when default consent is set to "pending"`, () => {
      run("pending");
      return expectAsync(subject.withConsent()).toBeRejected();
    });
  });
});
