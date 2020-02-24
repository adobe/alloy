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

import createPrivacyComponent from "../../../../../src/components/Privacy/index";
import { IN } from "../../../../../src/constants/consentStatus";
import { GENERAL } from "../../../../../src/constants/consentPurpose";

describe("Privacy::index", () => {
  let setConsentPromise;
  let consent;
  let privacy;

  beforeEach(() => {
    consent = jasmine.createSpyObj("consent", {
      setConsent: setConsentPromise,
      requestComplete: undefined,
      consentRequestComplete: undefined
    });
    privacy = createPrivacyComponent({ consent });
  });

  describe("setConsent", () => {
    it("notifies consent of consent preferences", () => {
      const promise = privacy.commands.setConsent({
        [GENERAL]: IN
      });

      expect(consent.setConsent).toHaveBeenCalledWith({
        [GENERAL]: IN
      });
      expect(promise).toBe(setConsentPromise);
    });
  });

  describe("lifecycle", () => {
    describe("onResponse", () => {
      it("notifies consent of a completed non-consent request", () => {
        const response = {
          getPayloadsByType() {
            return [];
          }
        };

        privacy.lifecycle.onResponse({ response });

        expect(consent.requestComplete).toHaveBeenCalled();
        expect(consent.consentRequestComplete).not.toHaveBeenCalled();
      });

      it("notifies consent of a completed consent request", () => {
        const response = {
          getPayloadsByType(type) {
            return type === "privacy:consent" ? [{}] : [];
          }
        };

        privacy.lifecycle.onResponse({ response });

        expect(consent.requestComplete).toHaveBeenCalled();
        expect(consent.consentRequestComplete).toHaveBeenCalled();
      });
    });

    describe("onRequestFailure", () => {
      it("notifies consent of a completed non-consent request", () => {
        const response = {
          getPayloadsByType() {
            return [];
          }
        };

        privacy.lifecycle.onResponse({ response });

        expect(consent.requestComplete).toHaveBeenCalled();
        expect(consent.consentRequestComplete).not.toHaveBeenCalled();
      });

      it("notifies consent of a completed consent request", () => {
        const response = {
          getPayloadsByType(type) {
            return type === "privacy:consent" ? [{}] : [];
          }
        };

        privacy.lifecycle.onResponse({ response });

        expect(consent.requestComplete).toHaveBeenCalled();
        expect(consent.consentRequestComplete).toHaveBeenCalled();
      });
    });
  });
});
