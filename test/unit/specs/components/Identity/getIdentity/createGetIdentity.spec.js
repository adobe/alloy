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
import createGetIdentity from "../../../../../../src/components/Identity/getIdentity/createGetIdentity";

describe("Identity::createGetIdentity", () => {
  let sendEdgeNetworkRequest;
  let createIdentityRequestPayload;
  let createIdentityRequest;
  let request;

  beforeEach(() => {
    sendEdgeNetworkRequest = jasmine.createSpy("sendEdgeNetworkRequest");
    const requestPayload = {
      type: "payload"
    };
    createIdentityRequestPayload = jasmine
      .createSpy("createIdentityRequestPayload")
      .and.returnValue(requestPayload);
    request = {
      getPayload() {
        return requestPayload;
      }
    };
    createIdentityRequest = jasmine
      .createSpy("createIdentityRequest")
      .and.returnValue(request);
  });

  it("should return a function which calls sendEdgeNetworkRequest", () => {
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest
    });
    getIdentity();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request
    });
  });

  it("each getIdentity call should create new payloads and requests", () => {
    const payload1 = { type: "payload1" };
    const payload2 = { type: "payload2" };
    const request1 = { type: "request1" };
    const request2 = { type: "request2" };
    createIdentityRequestPayload.and.returnValues(payload1, payload2);
    createIdentityRequest.and.returnValues(request1, request2);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest
    });
    getIdentity(["namespace1", "namespace2"]);
    expect(createIdentityRequestPayload).toHaveBeenCalledWith([
      "namespace1",
      "namespace2"
    ]);
    expect(createIdentityRequest).toHaveBeenCalledWith(payload1);
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1
    });
    getIdentity();
    expect(createIdentityRequest).toHaveBeenCalledWith(payload2);
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request2
    });
  });
});
