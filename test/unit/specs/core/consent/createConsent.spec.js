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
  let generalConsentState;
  let consent;

  beforeEach(() => {
    generalConsentState = jasmine.createSpyObj("generalConsentState", [
      "awaitConsent",
      "withConsent"
    ]);
    generalConsentState.awaitConsent.and.returnValue("a");
    generalConsentState.withConsent.and.returnValue("b");
    consent = createConsent();
  });

  it("calls awaitConsent", () => {
    consent.initializeConsent(generalConsentState);
    return consent.awaitConsent().then(returnValue => {
      expect(returnValue).toEqual("a");
      expect(generalConsentState.awaitConsent).toHaveBeenCalled();
    });
  });

  it("calls withConsent", () => {
    consent.initializeConsent(generalConsentState);
    return consent.withConsent().then(returnValue => {
      expect(returnValue).toEqual("b");
      expect(generalConsentState.withConsent).toHaveBeenCalled();
    });
  });

  it("can call await consent out of order", () => {
    const promise = consent.awaitConsent().then(returnValue => {
      expect(returnValue).toEqual("a");
      expect(generalConsentState.awaitConsent).toHaveBeenCalled();
    });
    consent.initializeConsent(generalConsentState);
    return promise;
  });

  it("can call with consent out of order", () => {
    const promise = consent.withConsent().then(returnValue => {
      expect(returnValue).toEqual("b");
      expect(generalConsentState.withConsent).toHaveBeenCalled();
    });
    consent.initializeConsent(generalConsentState);
    return promise;
  });
});
