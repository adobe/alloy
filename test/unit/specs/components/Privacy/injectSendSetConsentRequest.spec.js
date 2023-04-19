/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import injectSendSetConsentRequest from "../../../../../src/components/Privacy/injectSendSetConsentRequest";

describe("Privacy:injectSendSetConsentRequest", () => {
  let sendEdgeNetworkRequest;
  let requestPayload;
  let request;
  let createConsentRequestPayload;
  let createConsentRequest;
  let sendSetConsentRequest;

  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    requestPayload = jasmine.createSpyObj("requestPayload", [
      "setConsent",
      "addIdentity"
    ]);
    createConsentRequestPayload = jasmine
      .createSpy("createConsentRequestPayload")
      .and.returnValue(requestPayload);
    request = {
      getPayload() {
        return requestPayload;
      }
    };
    createConsentRequest = jasmine
      .createSpy("createConsentRequest")
      .and.returnValue(request);
    sendSetConsentRequest = injectSendSetConsentRequest({
      createConsentRequestPayload,
      createConsentRequest,
      sendEdgeNetworkRequest
    });
  });

  it("sets consent level and on requestPayload and sends the request", () => {
    sendEdgeNetworkRequest.and.returnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [{ id: "1" }, { id: "2" }],
        b: [{ id: "3" }]
      }
    }).then(resolvedValue => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
        request
      });
      expect(resolvedValue).toBeUndefined();
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("a", { id: "1" });
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("a", { id: "2" });
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("b", { id: "3" });
    });
  });
});
