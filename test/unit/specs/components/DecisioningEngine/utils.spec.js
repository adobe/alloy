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
import {
  createRestoreStorage,
  createSaveStorage,
  getExpirationDate
} from "../../../../../src/components/DecisioningEngine/utils";

describe("DecisioningEngine:utils", () => {
  let storage;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
  });

  it("restores from storage", () => {
    storage.getItem.and.returnValue(
      '{ "something": true, "color": "orange", "person": { "height": 5.83 } }'
    );
    const restore = createRestoreStorage(storage, "zoink");

    expect(restore({ good: true })).toEqual({
      something: true,
      color: "orange",
      person: { height: 5.83 }
    });

    expect(storage.getItem).toHaveBeenCalledWith("zoink");
  });

  it("uses default value if storage unavailable", () => {
    storage.getItem.and.returnValue(undefined);
    const restore = createRestoreStorage(storage, "zoink");

    expect(restore({ good: true })).toEqual({ good: true });

    expect(storage.getItem).toHaveBeenCalledWith("zoink");
  });

  it("saves to storage", done => {
    storage.getItem.and.returnValue(
      '{ "something": true, "color": "orange", "person": { "height": 5.83 } }'
    );
    const save = createSaveStorage(storage, "zoink", 10);

    save({
      something: true,
      color: "orange",
      person: { height: 5.83 }
    });

    setTimeout(() => {
      expect(storage.setItem).toHaveBeenCalledWith(
        "zoink",
        '{"something":true,"color":"orange","person":{"height":5.83}}'
      );

      done();
    }, 20);
  });
  it("should return the date of expiration", () => {
    const mockedTimestamp = new Date(Date.UTC(2023, 8, 2, 13, 34, 56));
    jasmine.clock().install();
    jasmine.clock().mockDate(mockedTimestamp);
    const retentionPeriod = 10;
    const expectedDate = new Date(mockedTimestamp);
    expectedDate.setDate(expectedDate.getDate() - retentionPeriod);
    const result = getExpirationDate(retentionPeriod);
    expect(result).toEqual(expectedDate);
    jasmine.clock().uninstall();
  });
});
