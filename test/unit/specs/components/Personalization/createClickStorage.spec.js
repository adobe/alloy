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
import createClickStorage from "../../../../../src/components/Personalization/createClickStorage.js";

describe("Personalization::createClickStorage", () => {
  let clickStorage;

  const FIRST_CLICK = {
    selector: "div:123:h2",
    meta: {
      id: "AT:123",
      scope: "__view__",
      scopeDetails: {
        test: "blah1"
      },
      trackingLabel: "mylabel",
      scopeType: "myscopetype"
    }
  };
  const SECOND_CLICK = {
    selector: "div:123:h2",
    meta: {
      id: "AT:123",
      scope: "consent",
      scopeDetails: {
        test: "blah3"
      }
    }
  };
  const THIRD_CLICK = {
    selector: "div:123:h2",
    meta: {
      id: "AT:234",
      scope: "consent",
      scopeDetails: {
        test: "blah4"
      }
    }
  };
  const FORTH_CLICK = {
    selector: "div:123:h1",
    meta: {
      id: "AT:123",
      scope: "consent",
      scopeDetails: {
        test: "blah5"
      }
    }
  };

  /*  this is how the clickStorage map should look like
  const expectedClicksInStorage = {
    "div:123:h1": {
      "AT:123": {
        scope: "consent",
        scopeDetails: {
          blah: "blah"
        }
      }
    },
    "div:123:h2": {
      "AT:123": {
        scope: "consent",
        scopeDetails: {
          blah: "blah"
          },
        },
      "AT:234": {
        scope: "consent",
        scopeDetails: {
          blah: "blah"
          }
        }
    }
  }; */
  beforeEach(() => {
    clickStorage = createClickStorage();
  });

  it("returns empty array if empty storage", () => {
    expect(clickStorage.getClickSelectors()).toEqual([]);
  });

  it("returns empty object when no metadata for this selector", () => {
    expect(clickStorage.getClickMetasBySelector("123")).toEqual({});
  });

  it("stores clicks as a map in the click storage and returns the selectors and metadata", () => {
    clickStorage.storeClickMetrics(FIRST_CLICK);
    clickStorage.storeClickMetrics(SECOND_CLICK);
    clickStorage.storeClickMetrics(THIRD_CLICK);
    clickStorage.storeClickMetrics(FORTH_CLICK);

    expect(clickStorage.getClickSelectors().length).toEqual(2);
    expect(clickStorage.getClickMetasBySelector("div:123:h2").length).toEqual(
      2
    );
  });

  it("getClickMetasBySelector returns the id, scopeDetails, scope, trackingLabel, and scopeType", () => {
    clickStorage.storeClickMetrics(FIRST_CLICK);

    const meta = clickStorage.getClickMetasBySelector("div:123:h2");

    expect(clickStorage.getClickSelectors().length).toEqual(1);
    expect(meta.length).toEqual(1);
    expect(meta[0]).toEqual({
      id: "AT:123",
      scope: "__view__",
      scopeDetails: { test: "blah1" },
      trackingLabel: "mylabel",
      scopeType: "myscopetype"
    });
  });
});
