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

import createConsent from "../../../../../src/core/consent/createConsent";

describe("createConsent", () => {
  let state;
  let subject;
  let logger;

  beforeEach(() => {
    state = jasmine.createSpyObj("state", [
      "in",
      "out",
      "pending",
      "awaitConsent"
    ]);
    logger = jasmine.createSpyObj("logger", ["warn"]);
    subject = createConsent({ generalConsentState: state, logger });
  });

  it("sets consent to in", () => {
    subject.setConsent({ general: "in" });
    expect(state.in).toHaveBeenCalled();
    expect(state.out).not.toHaveBeenCalled();
    expect(state.pending).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });
  it("sets consent to out", () => {
    subject.setConsent({ general: "out" });
    expect(state.in).not.toHaveBeenCalled();
    expect(state.out).toHaveBeenCalled();
    expect(state.pending).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });
  it("sets consent to pending", () => {
    subject.setConsent({ general: "pending" });
    expect(state.in).not.toHaveBeenCalled();
    expect(state.out).not.toHaveBeenCalled();
    expect(state.pending).toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });
  [{}, { unknownPurpose: "in" }, { general: "unknownValue" }].forEach(value => {
    it(`setting consent to ${JSON.stringify(value)} does nothing`, () => {
      subject.setConsent(value);
      expect(state.in).not.toHaveBeenCalled();
      expect(state.out).not.toHaveBeenCalled();
      expect(state.pending).not.toHaveBeenCalled();
    });
  });
  it("sets consent to pending", () => {
    subject.suspend();
    expect(state.in).not.toHaveBeenCalled();
    expect(state.out).not.toHaveBeenCalled();
    expect(state.pending).toHaveBeenCalled();
  });
  it("calls await consent", () => {
    state.awaitConsent.and.returnValue("mypromise");
    expect(subject.awaitConsent()).toEqual("mypromise");
  });
});
