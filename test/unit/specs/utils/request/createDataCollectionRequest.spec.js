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

import { createDataCollectionRequest } from "../../../../../src/utils/request/index.js";
import describeRequest from "../../../helpers/describeRequest.js";

describe("createDataCollectionRequest", () => {
  describeRequest(createDataCollectionRequest);

  it("uses collect with sendBeacon if document may unload and identity is established", () => {
    const payload = {
      getDocumentMayUnload() {
        return true;
      },
    };
    const request = createDataCollectionRequest({ payload });
    request.setIsIdentityEstablished();
    expect(request.getAction()).toBe("collect");
    expect(request.getUseSendBeacon()).toBeTrue();
  });

  it("uses interact without sendBeacon if document may unload but identity has not been established", () => {
    const payload = {
      getDocumentMayUnload() {
        return true;
      },
    };
    const request = createDataCollectionRequest({ payload });
    expect(request.getAction()).toBe("interact");
    expect(request.getUseSendBeacon()).toBeFalse();
  });

  it("uses interact without sendBeacon if identity has been established but document will not unload", () => {
    const payload = {
      getDocumentMayUnload() {
        return false;
      },
    };
    const request = createDataCollectionRequest({ payload });
    request.setIsIdentityEstablished();
    expect(request.getAction()).toBe("interact");
    expect(request.getUseSendBeacon()).toBeFalse();
  });

  it("uses interact without sendBeacon if document will not unload and identity has not been established", () => {
    const payload = {
      getDocumentMayUnload() {
        return false;
      },
    };
    const request = createDataCollectionRequest({ payload });
    expect(request.getAction()).toBe("interact");
    expect(request.getUseSendBeacon()).toBeFalse();
  });

  it("passes the datastreamIdOverride to the request", () => {
    const payload = {};
    const datastreamIdOverride = "my-edge-config-id-override";
    const request = createDataCollectionRequest({
      payload,
      datastreamIdOverride,
    });
    expect(request.getDatastreamIdOverride()).toBe(datastreamIdOverride);
  });
});
