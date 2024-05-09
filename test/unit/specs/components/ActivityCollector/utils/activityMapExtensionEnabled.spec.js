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

import activityMapExtensionEnabled from "../../../../../../src/components/ActivityCollector/utils/activityMapExtensionEnabled";

const ACTIVITY_MAP_EXTENSION_ID = "cppXYctnr";

describe("ActivityCollector::activityMapExtensionEnabled", () => {
  it("should return true if the activity map extension is enabled", () => {
    const context = {
      getElementById: jasmine.createSpy().and.returnValue({})
    };
    expect(activityMapExtensionEnabled(context)).toBeTrue();
    expect(context.getElementById).toHaveBeenCalledWith(
      ACTIVITY_MAP_EXTENSION_ID
    );
  });

  it("should return false if the activity map extension is not enabled", () => {
    const context = {
      getElementById: jasmine.createSpy().and.returnValue(null)
    };
    expect(activityMapExtensionEnabled(context)).toBeFalse();
    expect(context.getElementById).toHaveBeenCalledWith(
      ACTIVITY_MAP_EXTENSION_ID
    );
  });
});
