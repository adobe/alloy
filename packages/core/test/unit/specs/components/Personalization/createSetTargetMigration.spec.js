/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import createSetTargetMigration from "../../../../../src/components/Personalization/createSetTargetMigration.js";

describe("Personalization::createSetTargetMigration", () => {
  let request;
  let payload;
  beforeEach(() => {
    request = {
      getPayload: vi.fn(),
    };
    payload = {
      mergeMeta: vi.fn(),
    };
    request.getPayload.mockReturnValue(payload);
  });
  it("adds to request meta if targetMigrationEnabled=true is configured", () => {
    const setTargetMigration = createSetTargetMigration({
      targetMigrationEnabled: true,
    });
    setTargetMigration(request);
    expect(payload.mergeMeta).toHaveBeenNthCalledWith(1, {
      target: {
        migration: true,
      },
    });
  });
  it("does not add to request meta if targetMigrationEnabled is not configured", () => {
    const setTargetMigration = createSetTargetMigration({
      targetMigrationEnabled: false,
    });
    setTargetMigration(request);
    expect(payload.mergeMeta).not.toHaveBeenCalled();
  });
});
