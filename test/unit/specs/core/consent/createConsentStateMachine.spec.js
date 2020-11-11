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

describe("createConsentStateMachine", () => {
  let events;
  let promises;
  let subject;

  const RESOLVED = "resolved";
  const PENDING = "pending";
  const REJECTED = "rejected";
  const promisesAre = expected => {
    const state = promises.map((promise, i) => {
      promise.then(
        () => {
          state[i] = RESOLVED;
        },
        () => {
          state[i] = REJECTED;
        }
      );
      return PENDING;
    });
    return flushPromiseChains().then(() => {
      expect(state).toEqual(expected);
    });
  };

  const createEvent = i => {
    let hash;
    return {
      getConsent() {
        if (i === undefined) {
          return undefined;
        }
        return { index: i };
      },
      mergeMeta({ consentHash }) {
        hash = consentHash;
      },
      getHash() {
        return hash;
      }
    };
  };

  const setIn = hash => subject.in(hash);
  const setOut = hash => subject.out(hash);
  const eventWithNoConsent = () => {
    const event = createEvent();
    events.push(event);
    promises.push(subject.awaitConsent(event));
  };
  const eventWithConsent = i => {
    const event = createEvent(i);
    events.push(event);
    promises.push(subject.awaitConsent(event));
  };

  beforeEach(() => {
    events = [];
    promises = [];
    subject = createConsentStateMachine();
  });

  it("sends an event when defaultConsent is in and request doesn't have consent", () => {
    setIn();
    eventWithNoConsent();
    expect(events[0].getHash()).toBeUndefined();
    return promisesAre([RESOLVED]);
  });

  it("sends an event when defaultConsent is in and request has consent", () => {
    setIn();
    eventWithConsent(1);
    expect(events[0].getHash()).toBeDefined();
    return promisesAre([RESOLVED]);
  });

  it("sends an event when defaultConsent is out and request has consent", () => {
    setOut();
    eventWithConsent(1);
    expect(events[0].getHash()).toBeDefined();
    return promisesAre([RESOLVED]);
  });

  it("sends an event when defaultConsent is out and request has consent", () => {
    setOut();
    eventWithNoConsent();
    expect(events[0].getHash()).toBeUndefined();
    return promisesAre([REJECTED]);
  });

  it("waits for a cookie before resuming requests", () => {
    setIn();
    eventWithConsent(1);
    eventWithConsent(1);
    return promisesAre([RESOLVED, PENDING]);
  });

  it("resumes requests", () => {
    setIn();
    eventWithConsent(1);
    eventWithConsent(1);
    setIn(events[0].getHash());
    return promisesAre([RESOLVED, RESOLVED]);
  });

  it("doesn't wait when consent is the same", () => {
    setIn();
    eventWithConsent(1);
    setIn(events[0].getHash());
    eventWithConsent(1);
    eventWithConsent(1);
    return promisesAre([RESOLVED, RESOLVED, RESOLVED]);
  });

  it("doesn't send requests when the consent is the same or undefined", () => {
    setOut();
    eventWithConsent(1);
    eventWithConsent(1);
    eventWithConsent();
    setOut(events[0].getHash());
    eventWithConsent(1);
    eventWithConsent();
    return promisesAre([RESOLVED, REJECTED, REJECTED, REJECTED, REJECTED]);
  });

  it("sends a request when the consent is different", () => {
    setOut();
    eventWithConsent(1);
    setOut(events[0].getHash());
    eventWithConsent(2);
    eventWithConsent();
    return promisesAre([RESOLVED, RESOLVED, PENDING]);
  });

  it("sends a request when the consent is different and event is queued", () => {
    setOut();
    eventWithConsent(1);
    eventWithConsent(2);
    eventWithConsent();
    setOut(events[0].getHash());
    return promisesAre([RESOLVED, RESOLVED, PENDING]);
  });
});
