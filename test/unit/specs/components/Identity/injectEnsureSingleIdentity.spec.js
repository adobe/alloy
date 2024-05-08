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

import injectEnsureSingleIdentity from "../../../../../src/components/Identity/injectEnsureSingleIdentity.js";
import { defer } from "../../../../../src/utils/index.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("Identity::injectEnsureSingleIdentity", () => {
  let doesIdentityCookieExist;
  let setDomainForInitialIdentityPayload;
  let addLegacyEcidToPayload;
  let awaitIdentityCookie;
  let logger;
  let ensureSingleIdentity;

  let sentIndex;
  let receivedIndex;
  let requests;
  let requestSentStatusByIndex;
  let awaitIdentityDeferreds;
  let onResponse;
  let onRequestFailure;
  let doesIdentityCookieExistBoolean;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["info"]);

    sentIndex = 0;
    receivedIndex = 0;
    requests = [];
    requestSentStatusByIndex = [];
    awaitIdentityDeferreds = [];
    doesIdentityCookieExistBoolean = false;

    setDomainForInitialIdentityPayload = request => {
      request.setUseIdThirdPartyDomain();
    };
    addLegacyEcidToPayload = payload => {
      payload.addIdentity("ECID", { id: "ABC123" });
      return Promise.resolve();
    };
    awaitIdentityCookie = () => {
      const deferred = defer();
      awaitIdentityDeferreds.push(deferred);
      return deferred.promise;
    };
    doesIdentityCookieExist = () => doesIdentityCookieExistBoolean;
  });

  const setup = () => {
    ensureSingleIdentity = injectEnsureSingleIdentity({
      doesIdentityCookieExist,
      setDomainForInitialIdentityPayload,
      addLegacyEcidToPayload,
      awaitIdentityCookie,
      logger
    });
  };

  const sendRequest = () => {
    const requestPayload = jasmine.createSpyObj("requestPayload", [
      "addIdentity"
    ]);
    const request = jasmine.createSpyObj("request", {
      getPayload: requestPayload,
      setIsIdentityEstablished: undefined,
      setUseIdThirdPartyDomain: undefined
    });
    requests.push(request);
    onResponse = jasmine.createSpy("onResponse");
    onRequestFailure = jasmine.createSpy("onRequestFailure");
    const i = sentIndex;
    requestSentStatusByIndex.push(false);
    ensureSingleIdentity({
      request,
      onResponse,
      onRequestFailure
    }).then(() => {
      requestSentStatusByIndex[i] = true;
    });

    sentIndex += 1;
  };
  const simulateResponseWithIdentity = () => {
    doesIdentityCookieExist = true;
    awaitIdentityDeferreds[receivedIndex].resolve();
    receivedIndex += 1;
  };
  const simulateResponseWithoutIdentity = () => {
    awaitIdentityDeferreds[receivedIndex].reject();
    receivedIndex += 1;
  };

  it("allows first request to proceed and pauses subsequent requests until identity cookie exists", () => {
    setup();
    return Promise.resolve()
      .then(() => {
        sendRequest();
        sendRequest();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestSentStatusByIndex).toEqual([true, false, false]);
        simulateResponseWithIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestSentStatusByIndex).toEqual([true, true, true]);
        expect(requests[0].setUseIdThirdPartyDomain).toHaveBeenCalled();
        expect(requests[1].setUseIdThirdPartyDomain).not.toHaveBeenCalled();
        expect(requests[2].setUseIdThirdPartyDomain).not.toHaveBeenCalled();
        expect(requests[0].getPayload().addIdentity).toHaveBeenCalled();
        expect(requests[1].getPayload().addIdentity).not.toHaveBeenCalled();
        expect(requests[2].getPayload().addIdentity).not.toHaveBeenCalled();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requests[3].setUseIdThirdPartyDomain).not.toHaveBeenCalled();
        expect(requests[3].getPayload().addIdentity).not.toHaveBeenCalled();
        expect(requestSentStatusByIndex[3]).toEqual(true);
      });
  });

  it("allows the second request to be called if the first doesn't set the cookie, but still holds up the third", () => {
    setup();
    return Promise.resolve()
      .then(() => {
        sendRequest();
        sendRequest();
        sendRequest();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestSentStatusByIndex).toEqual([true, false, false, false]);
        simulateResponseWithoutIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestSentStatusByIndex).toEqual([true, true, false, false]);
        simulateResponseWithIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestSentStatusByIndex).toEqual([true, true, true, true]);
        expect(requests[0].setUseIdThirdPartyDomain).toHaveBeenCalled();
        expect(requests[1].setUseIdThirdPartyDomain).toHaveBeenCalled();
        expect(requests[2].setUseIdThirdPartyDomain).not.toHaveBeenCalled();
        expect(requests[3].setUseIdThirdPartyDomain).not.toHaveBeenCalled();
        expect(requests[0].getPayload().addIdentity).toHaveBeenCalled();
        expect(requests[1].getPayload().addIdentity).toHaveBeenCalled();
        expect(requests[2].getPayload().addIdentity).not.toHaveBeenCalled();
        expect(requests[3].getPayload().addIdentity).not.toHaveBeenCalled();
      });
  });

  it("logs messages", () => {
    setup();
    return Promise.resolve()
      .then(() => {
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.info).not.toHaveBeenCalled();
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.info).toHaveBeenCalledWith(
          "Delaying request while retrieving ECID from server."
        );
        simulateResponseWithIdentity();
        return flushPromiseChains();
      })
      .then(() => {
        expect(logger.info).toHaveBeenCalledWith(
          "Resuming previously delayed request."
        );
      });
  });

  it("sends a request without third-party domain or legacy ECID if we have an identity cookie", () => {
    doesIdentityCookieExistBoolean = true;
    setup();
    return Promise.resolve()
      .then(() => {
        sendRequest();
        return flushPromiseChains();
      })
      .then(() => {
        expect(requestSentStatusByIndex).toEqual([true]);
        expect(requests[0].setUseIdThirdPartyDomain).not.toHaveBeenCalled();
        expect(requests[0].getPayload().addIdentity).not.toHaveBeenCalled();
      });
  });

  it("calls awaitIdentityCookie with the correct parameters", () => {
    awaitIdentityCookie = jasmine.createSpy("awaitIdentityCookie");
    awaitIdentityCookie.and.returnValue(Promise.resolve());
    setup();
    sendRequest();
    expect(awaitIdentityCookie).toHaveBeenCalledWith({
      onResponse,
      onRequestFailure
    });
  });
});
