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

import createConsentHashStore from "../../../../../src/components/Privacy/createConsentHashStore";

const CONSENT_IN = {
  standard: "Adobe",
  version: "1.0",
  value: { general: "in" }
};

const CONSENT_OUT = {
  standard: "Adobe",
  version: "1.0",
  value: { general: "out" }
};

describe("createConsentHashStore", () => {
  let storage;
  let subject;
  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    subject = createConsentHashStore({ storage });
  });

  it("clears", () => {
    subject.clear();
    expect(storage.clear).toHaveBeenCalled();
  });

  it("is new when storage is empty", () => {
    storage.getItem.and.returnValue(null);
    const consentHashes = subject.lookup([CONSENT_IN]);
    expect(consentHashes.isNew()).toBe(true);
  });

  it("saves the hash", () => {
    const consentHashes = subject.lookup([CONSENT_IN]);
    consentHashes.save();
    expect(storage.setItem).toHaveBeenCalledWith("Adobe.1.0", "2112854754");
  });

  it("is not new when lookup is the same", () => {
    storage.getItem.and.returnValue("2112854754");
    const consentHashes = subject.lookup([CONSENT_IN]);
    expect(consentHashes.isNew()).toBe(false);
    expect(storage.getItem).toHaveBeenCalledWith("Adobe.1.0");
  });

  it("is new when lookup is different", () => {
    storage.getItem.and.returnValue("2112854754");
    const consentHashes = subject.lookup([CONSENT_OUT]);
    expect(consentHashes.isNew()).toBe(true);
    expect(storage.getItem).toHaveBeenCalledWith("Adobe.1.0");
  });
});
