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

import injectEnsureRequestHasIdentity from "../../../../../src/components/Identity/injectEnsureRequestHasIdentity";
// By using the real injectAwaitIdentityCookie, this isn't a true unit test. The interactions between these
// functions are so tightly coupled that it was much easier to understand the tests if I just included the
// real one.
import injectAwaitIdentityCookie from "../../../../../src/components/Identity/injectAwaitIdentityCookie";
import { createCallbackAggregator } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Identity::injectEnsureRequestHasIdentity", () => {
  let doesIdentityCookieExist;
  let setDomainForInitialIdentityPayload;
  let addLegacyEcidToPayload;
  let awaitIdentityCookie;
  let logger;
  let ensureRequestHasIdentity;

  let sentIndex;
  let recievedIndex;
  let payloads;
  let requestsSentYet;
  let onResponseCallbackAggregators;
  let doesIdentityCookieExistBoolean;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["log"]);

    sentIndex = 0;
    recievedIndex = 0;
    payloads = [];
    requestsSentYet = [];
    onResponseCallbackAggregators = [];
    doesIdentityCookieExistBoolean = false;

    doesIdentityCookieExist = () => doesIdentityCookieExistBoolean;
    setDomainForInitialIdentityPayload = payload => {
      payload.domain = "initialIdentityDomain";
    };
    addLegacyEcidToPayload = payload => {
      payload.legacyId = "legacyId";
      return Promise.resolve();
    };
    awaitIdentityCookie = injectAwaitIdentityCookie({
      orgId: "myorg",
      doesIdentityCookieExist
    });
    ensureRequestHasIdentity = injectEnsureRequestHasIdentity({
      doesIdentityCookieExist,
      setDomainForInitialIdentityPayload,
      addLegacyEcidToPayload,
      awaitIdentityCookie,
      logger
    });
  });

  const sendRequest = () => {
    const payload = { id: sentIndex };
    payloads.push(payload);
    const onResponseCallbackAggregator = createCallbackAggregator();
    onResponseCallbackAggregators.push(onResponseCallbackAggregator);

    const i = sentIndex;
    requestsSentYet.push(false);
    ensureRequestHasIdentity({
      payload,
      onResponse: onResponseCallbackAggregator.add
    }).then(() => {
      requestsSentYet[i] = true;
    });

    sentIndex += 1;
  };
  const simulateResponseWithIdentity = () => {
    doesIdentityCookieExistBoolean = true;
    onResponseCallbackAggregators[recievedIndex].call();
    recievedIndex += 1;
  };
  const simulateResponseWithoutIdentity = () => {
    doesIdentityCookieExistBoolean = false;
    try {
      onResponseCallbackAggregators[recievedIndex].call();
    } catch (e) {
      // expected
    }
    recievedIndex += 1;
  };

  it("allows first request to proceed and pauses subsequent requests until identity cookie exists", () => {
    return Promise.resolve()
      .then(() => {
        sendRequest();
        sendRequest();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestsSentYet).toEqual([true, false, false]);
        simulateResponseWithIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestsSentYet).toEqual([true, true, true]);
        expect(payloads).toEqual([
          { id: 0, domain: "initialIdentityDomain", legacyId: "legacyId" },
          { id: 1 },
          { id: 2 }
        ]);
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(payloads[3]).toEqual({ id: 3 });
        expect(requestsSentYet[3]).toEqual(true);
      });
  });

  it("allows the second request to be called if the first doesn't set the cookie, but still holds up the third", () => {
    return Promise.resolve()
      .then(() => {
        sendRequest();
        sendRequest();
        sendRequest();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestsSentYet).toEqual([true, false, false, false]);
        simulateResponseWithoutIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestsSentYet).toEqual([true, true, false, false]);
        simulateResponseWithIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestsSentYet).toEqual([true, true, true, true]);
        expect(payloads).toEqual([
          { id: 0, domain: "initialIdentityDomain", legacyId: "legacyId" },
          { id: 1, domain: "initialIdentityDomain", legacyId: "legacyId" },
          { id: 2 },
          { id: 3 }
        ]);
      });
  });

  it("logs messages", () => {
    return Promise.resolve()
      .then(() => {
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.log).not.toHaveBeenCalled();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.log).toHaveBeenCalledWith(
          "Delaying request while retrieving ECID from server."
        );
        simulateResponseWithIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.log).toHaveBeenCalledWith(
          "Resuming previously delayed request."
        );
      });
  });

  it("sends a message if we have an identity cookie", () => {
    doesIdentityCookieExistBoolean = true;
    return Promise.resolve()
      .then(() => {
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestsSentYet).toEqual([true]);
        expect(payloads).toEqual([{ id: 0 }]);
      });
  });
});
