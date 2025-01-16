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
import injectSendSetConsentRequest from "../../../../../src/components/Consent/injectSendSetConsentRequest.js";

describe("Consent:injectSendSetConsentRequest", () => {
  let sendEdgeNetworkRequest;
  let requestPayload;
  let request;
  let createConsentRequestPayload;
  let createConsentRequest;
  let sendSetConsentRequest;
  let globalEdgeConfigOverrides;
  beforeEach(() => {
    sendEdgeNetworkRequest = vi.fn();
    requestPayload = {
      setConsent: vi.fn(),
      addIdentity: vi.fn(),
      mergeConfigOverride: vi.fn(),
    };
    createConsentRequestPayload = vi.fn().mockReturnValue(requestPayload);
    request = {
      getPayload() {
        return requestPayload;
      },
    };
    createConsentRequest = vi.fn().mockReturnValue(request);
    globalEdgeConfigOverrides = {};
    sendSetConsentRequest = injectSendSetConsentRequest({
      createConsentRequestPayload,
      createConsentRequest,
      sendEdgeNetworkRequest,
      edgeConfigOverrides: globalEdgeConfigOverrides,
    });
  });
  it("sets consent level and on requestPayload and sends the request", () => {
    sendEdgeNetworkRequest.mockReturnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [
          {
            id: "1",
          },
          {
            id: "2",
          },
        ],
        b: [
          {
            id: "3",
          },
        ],
      },
    }).then((resolvedValue) => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(sendEdgeNetworkRequest).toHaveBeenCalledWith({
        request,
      });
      expect(resolvedValue).toBeUndefined();
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("a", {
        id: "1",
      });
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("a", {
        id: "2",
      });
      expect(requestPayload.addIdentity).toHaveBeenCalledWith("b", {
        id: "3",
      });
    });
  });
  it("sets the configuration overrides on the payload, if provided", () => {
    sendEdgeNetworkRequest.mockReturnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [
          {
            id: "1",
          },
          {
            id: "2",
          },
        ],
        b: [
          {
            id: "3",
          },
        ],
      },
      edgeConfigOverrides: {
        com_adobe_identity: {
          idSyncContainerId: "123",
        },
      },
    }).then(() => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
        com_adobe_identity: {
          idSyncContainerId: "123",
        },
      });
    });
  });
  it("sets the configuration overrides on the payload, if provided, from the global config", () => {
    sendEdgeNetworkRequest.mockReturnValue(Promise.resolve());
    globalEdgeConfigOverrides.com_adobe_identity = {
      idSyncContainerId: "123",
    };
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [
          {
            id: "1",
          },
          {
            id: "2",
          },
        ],
        b: [
          {
            id: "3",
          },
        ],
      },
    }).then(() => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(requestPayload.mergeConfigOverride).toHaveBeenCalledWith({
        com_adobe_identity: {
          idSyncContainerId: "123",
        },
      });
    });
  });
  it("sets the override for the datastreamId, if provided", () => {
    sendEdgeNetworkRequest.mockReturnValue(Promise.resolve());
    return sendSetConsentRequest({
      consentOptions: "anything",
      identityMap: {
        a: [
          {
            id: "1",
          },
          {
            id: "2",
          },
        ],
        b: [
          {
            id: "3",
          },
        ],
      },
      edgeConfigOverrides: {
        datastreamId: "123",
      },
    }).then(() => {
      expect(requestPayload.setConsent).toHaveBeenCalledWith("anything");
      expect(createConsentRequest).toHaveBeenCalledWith({
        payload: expect.any(Object),
        datastreamIdOverride: "123",
      });
    });
  });
});
