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

import setMigrationEnabled from "../../../../../../src/components/Personalization/migration/setMigrationEnabled";

describe("Personalization::setMigrationEnabled", () => {
  it("adds to request meta if targetMigrationEnabled=true is configured", () => {
    const request = {
      getPayload: jasmine
        .createSpy("getPayload")
        .and.returnValue(jasmine.createSpyObj("getPayloadObj", ["mergeMeta"]))
    };
    const config = {
      targetMigrationEnabled: true
    };

    setMigrationEnabled(config, request);

    expect(request.getPayload).toHaveBeenCalled();
  });

  it("does not add to request meta if targetMigrationEnabled is not configured", () => {
    const request = {
      getPayload: jasmine.createSpy("getPayload")
    };
    const config = {};

    setMigrationEnabled(config, request);

    expect(request.getPayload).not.toHaveBeenCalled();
  });
});
