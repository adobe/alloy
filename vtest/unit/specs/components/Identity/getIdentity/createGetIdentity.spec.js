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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createGetIdentity from "../../../../../../src/components/Identity/getIdentity/createGetIdentity.js";

describe("Identity::createGetIdentity", () => {
  let sendEdgeNetworkRequest;
  let createIdentityRequestPayload;
  let createIdentityRequest;
  let requestPayload;
  let request;
  beforeEach(() => {
    sendEdgeNetworkRequest = vi.fn();
    requestPayload = {
      mergeConfigOverride: vi.fn(),
      type: vi.fn().mockReturnValue("payload"),
    };
    createIdentityRequestPayload = vi.fn().mockReturnValue(requestPayload);
    request = {
      getPayload() {
        return requestPayload;
      },
    };
    createIdentityRequest = vi.fn().mockReturnValue(request);
  });
  it("should return a function which calls sendEdgeNetworkRequest", () => {
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
    });
    getIdentity();
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request,
    });
  });
  it("each getIdentity call should create new payloads and requests", () => {
    const payload1 = {
      mergeConfigOverride: vi.fn(),
      type: vi.fn().mockReturnValue("payload1"),
    };
    const payload2 = {
      mergeConfigOverride: vi.fn(),
      type: vi.fn().mockReturnValue("payload2"),
    };
    const request1 = {
      type: "request1",
    };
    const request2 = {
      type: "request2",
    };
    createIdentityRequestPayload
      .mockReturnValueOnce(payload1)
      .mockReturnValueOnce(payload2);
    createIdentityRequest
      .mockReturnValueOnce(request1)
      .mockReturnValueOnce(request2);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
    });
    getIdentity({
      namespaces: ["namespace1", "namespace2"],
    });
    expect(createIdentityRequestPayload).toHaveBeenCalledWith([
      "namespace1",
      "namespace2",
    ]);
    expect(createIdentityRequest).toHaveBeenCalledWith({
      payload: payload1,
    });
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1,
    });
    getIdentity();
    expect(createIdentityRequest).toHaveBeenCalledWith({
      payload: payload2,
    });
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request2,
    });
  });
  it("send override configuration, when provided", () => {
    const request1 = {
      type: "request1",
    };
    createIdentityRequestPayload.mockReturnValueOnce(requestPayload);
    createIdentityRequest.mockReturnValueOnce(request1);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
    });
    const configuration = {
      com_adobe_identity: {
        idSyncContainerId: "123",
      },
    };
    getIdentity({
      namespaces: ["namespace1"],
      edgeConfigOverrides: configuration,
    });
    expect(createIdentityRequestPayload).toHaveBeenCalledWith(["namespace1"]);
    expect(createIdentityRequest).toHaveBeenCalledWith({
      payload: requestPayload,
    });
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1,
    });
    expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
      com_adobe_identity: {
        idSyncContainerId: configuration.com_adobe_identity.idSyncContainerId,
      },
    });
  });
  it("send global override configuration, when provided", () => {
    const request1 = {
      type: "request1",
    };
    createIdentityRequestPayload.mockReturnValueOnce(requestPayload);
    createIdentityRequest.mockReturnValueOnce(request1);
    const configuration = {
      com_adobe_identity: {
        idSyncContainerId: "123",
      },
    };
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
      globalConfigOverrides: configuration,
    });
    getIdentity({
      namespaces: ["namespace1"],
    });
    expect(createIdentityRequestPayload).toHaveBeenCalledWith(["namespace1"]);
    expect(createIdentityRequest).toHaveBeenCalledWith({
      payload: requestPayload,
    });
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1,
    });
    expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
      com_adobe_identity: {
        idSyncContainerId: configuration.com_adobe_identity.idSyncContainerId,
      },
    });
  });
  it("send edge config id override, when provided", () => {
    const request1 = {
      type: "request1",
    };
    createIdentityRequestPayload.mockReturnValueOnce(requestPayload);
    createIdentityRequest.mockReturnValueOnce(request1);
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
    });
    getIdentity({
      namespaces: ["namespace1"],
      edgeConfigOverrides: {
        datastreamId: "123",
      },
    });
    expect(createIdentityRequestPayload).toHaveBeenCalledWith(["namespace1"]);
    expect(createIdentityRequest).toHaveBeenCalledWith({
      payload: requestPayload,
      datastreamIdOverride: "123",
    });
    expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
      request: request1,
    });
  });
});
