/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import hasPageName from "../../../../../../src/components/ActivityCollector/utils/hasPageName";

describe("ActivityCollector::hasPageName", () => {
  it("should return true if event has page name", () => {
    const event = {
      getContent: () => ({
        xdm: {
          web: {
            webPageDetails: {
              name: "test"
            }
          }
        }
      })
    };
    expect(hasPageName(event)).toBe(true);
  });

  it("should return false if event does not have page name", () => {
    const event = {
      getContent: () => ({
        xdm: {
          web: {}
        }
      })
    };
    expect(hasPageName(event)).toBe(false);
  });
});
