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
import { createRequestParams } from "../../../../../src/utils/request/index.js";

describe("createRequestParams", () => {
  let payload;
  let globalConfigOverrides;
  let localConfigOverrides;
  beforeEach(() => {
    payload = jasmine.createSpyObj("payload", ["mergeConfigOverride"]);
  });

  it("returns the payload and datastreamIdOverride", () => {
    const result = createRequestParams({
      payload,
      localConfigOverrides: {
        datastreamId: "123",
      },
    });
    expect(result).toEqual({
      payload,
      datastreamIdOverride: "123",
    });
  });

  it("works fine without overrides", () => {
    const result = createRequestParams({
      payload,
    });
    expect(result).toEqual({
      payload,
    });
  });

  it("merges the global and local config overrides", () => {
    globalConfigOverrides = {
      a: "b",
      c: "d",
    };
    localConfigOverrides = {
      a: "e",
    };
    createRequestParams({
      payload,
      globalConfigOverrides,
      localConfigOverrides,
    });
    expect(payload.mergeConfigOverride).toHaveBeenCalledWith({
      a: "b",
      c: "d",
    });
    expect(payload.mergeConfigOverride).toHaveBeenCalledWith({
      a: "e",
    });
  });
});
