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

import isAuthoringModeEnabled from "../../../../../../src/components/Personalization/utils/isAuthoringModeEnabled";

describe("Personalization::isAuthoringModeEnabled", () => {
  it("returns true if authoring mode is enabled", () => {
    const doc = {
      location: {
        href: "http://foo.com?mboxEdit=1"
      }
    };
    expect(isAuthoringModeEnabled(doc)).toEqual(true);
  });

  it("returns false if authoring mode is disabled", () => {
    const doc = {
      location: {
        href: "http://foo.com"
      }
    };
    expect(isAuthoringModeEnabled(doc)).toEqual(false);
  });
});
