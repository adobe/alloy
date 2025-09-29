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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createHandleConsentFlicker from "../../../../../src/components/Personalization/createHandleConsentFlicker.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("Personalization::createHandleConsentFlicker", () => {
  let showContainers;
  let consent;
  let handleConsentFlicker;
  beforeEach(() => {
    showContainers = vi.fn();
    consent = {
      current: vi.fn(),
      awaitConsent: vi.fn(),
    };
    handleConsentFlicker = createHandleConsentFlicker({
      showContainers,
      consent,
    });
  });
  it("shows containers when consent is out and was set", () => {
    consent.current.mockReturnValue({
      state: "out",
      wasSet: true,
    });
    handleConsentFlicker();
    expect(showContainers).toHaveBeenCalled();
    return flushPromiseChains().then(() => {
      expect(consent.awaitConsent).not.toHaveBeenCalled();
    });
  });
  it("shows containers after consent is rejected", () => {
    consent.current.mockReturnValue({
      state: "out",
      wasSet: false,
    });
    consent.awaitConsent.mockReturnValue(Promise.reject());
    handleConsentFlicker();
    expect(consent.awaitConsent).toHaveBeenCalled();
    return flushPromiseChains().then(() => {
      expect(showContainers).toHaveBeenCalled();
    });
  });
  it("does not show containers after consent is given", () => {
    consent.current.mockReturnValue({
      state: "out",
      wasSet: false,
    });
    consent.awaitConsent.mockReturnValue(Promise.resolve());
    handleConsentFlicker();
    expect(consent.awaitConsent).toHaveBeenCalled();
    return flushPromiseChains().then(() => {
      expect(showContainers).not.toHaveBeenCalled();
    });
  });
});
