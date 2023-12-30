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

import createMediaRequest from "../../../../../src/components/MediaCollection/createMediaRequest";

describe("createMediaRequest", () => {
  it("should call createRequest with correct parameters", () => {
    const mediaRequestPayload = {}; // replace with valid payload
    const action = "testAction";
    const edgeSubPath = "/va";
    const result = createMediaRequest({ mediaRequestPayload, action });

    expect(result.getAction()).toEqual(action);
    expect(result.getEdgeSubPath()).toEqual(edgeSubPath);
    expect(result.getUseSendBeacon()).toEqual(false);
  });
});
