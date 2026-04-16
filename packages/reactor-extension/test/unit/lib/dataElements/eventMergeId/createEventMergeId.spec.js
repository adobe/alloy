/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, beforeEach, vi } from "vitest";
import createEventMergeId from "../../../../../src/lib/dataElements/eventMergeId/createEventMergeId";

describe("Event Merge ID", () => {
  let eventMergeIdCache;
  let instanceManager;
  let dataElement;

  beforeEach(() => {
    instanceManager = {
      createEventMergeId: vi
        .fn()
        .mockReturnValue({ eventMergeId: "randomEventMergeId" }),
    };
    eventMergeIdCache = {
      getByCacheId: vi.fn(),
      set: vi.fn(),
    };
    dataElement = createEventMergeId({
      instanceManager,
      eventMergeIdCache,
    });
  });

  it("produces and caches event merge ID based on cache ID", () => {
    instanceManager.createEventMergeId
      .mockReturnValueOnce({ eventMergeId: "eventMergeId1" })
      .mockReturnValueOnce({ eventMergeId: "eventMergeId2" });

    eventMergeIdCache.getByCacheId
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce("eventMergeId1")
      // Simulate the event merge ID having being reset through the Reset Event Merge ID action.
      .mockReturnValueOnce("eventMergeId2Reset");

    const result1 = dataElement({
      instanceName: "myinstance",
      cacheId: "cacheId1",
    });
    const result2 = dataElement({
      instanceName: "myinstance",
      cacheId: "cacheId2",
    });
    const result3 = dataElement({
      instanceName: "myinstance",
      cacheId: "cacheId1",
    });
    const result4 = dataElement({
      instanceName: "myinstance",
      cacheId: "cacheId2",
    });

    expect(eventMergeIdCache.set).toHaveBeenCalledWith(
      "cacheId1",
      "eventMergeId1",
    );
    expect(eventMergeIdCache.set).toHaveBeenCalledWith(
      "cacheId2",
      "eventMergeId2",
    );
    expect(eventMergeIdCache.set).toHaveBeenCalledTimes(2);
    expect(result1).toBe("eventMergeId1");
    expect(result2).toBe("eventMergeId2");
    expect(result3).toBe("eventMergeId1");
    expect(result4).toBe("eventMergeId2Reset");
  });
});
