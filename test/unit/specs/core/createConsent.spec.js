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

import createConsent from "../../../../src/core/createConsent";
import createConsentRequestPayload from "../../../../src/core/edgeNetwork/requestPayloads/createConsentRequestPayload";
import createConfig from "../../../../src/core/config/createConfig";
import flushPromiseChains from "../../helpers/flushPromiseChains";
import { cookieJar } from "../../../../src/utils";

describe("createConsent", () => {
  const optInCookieName = "kndctr_ABC_Adobe_optin";
  const optOutCookieName = "kndctr_ABC_Adobe_optout";

  let config;
  let logger;
  let lifecycle;
  let sendEdgeNetworkRequest;

  beforeEach(() => {
    cookieJar.remove(optInCookieName);
    cookieJar.remove(optOutCookieName);
    config = createConfig({
      orgId: "ABC@Adobe"
    });
    logger = jasmine.createSpyObj("logger", ["warn"]);
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onBeforeConsentRequest: Promise.resolve()
    });
    sendEdgeNetworkRequest = jasmine
      .createSpy("sendEdgeNetworkRequest")
      .and.callFake(({ payload, action }) => {
        const preferencesByPurpose = payload.toJSON().purposes;
        const purposeNames = Object.keys(preferencesByPurpose);
        const cookieName =
          action === "opt-in" ? optInCookieName : optOutCookieName;
        const cookieValue = purposeNames.reduce((memo, purposeName, index) => {
          const delimiter = index === purposeNames.length - 1 ? "" : ";";
          return `${memo}${purposeName}=${preferencesByPurpose[purposeName]}${delimiter}`;
        }, "");
        cookieJar.set(cookieName, cookieValue);
        return Promise.resolve();
      });
  });

  describe("with opt-in disabled", () => {
    beforeEach(() => {
      config.optInEnabled = false;
    });

    it("considers the user consented by default", () => {
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });
      return consent.whenConsented();
    });

    it("considers the user consented if opt-out cookie shows the user has opted out of no purposes", () => {
      cookieJar.set(optOutCookieName, "general=false");
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });
      return consent.whenConsented();
    });

    it("considers the user not consented if opt-out cookie shows the user has opted out of any purpose", () => {
      cookieJar.set(optOutCookieName, "general=true");
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });
      return expectAsync(consent.whenConsented()).toBeRejectedWithError(
        "The user opted out of all purposes."
      );
    });

    it("considers the user consented after the user opts out of no purposes", () => {
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      consent.setOptOutPurposes({
        GENERAL: false
      });

      return consent.whenConsented();
    });

    it("considers the user not consented after the user opts out of any purpose", () => {
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      consent.setOptOutPurposes({
        GENERAL: true
      });

      return expectAsync(consent.whenConsented()).toBeRejectedWithError(
        "The user opted out of all purposes."
      );
    });

    it("allows response cookie to trump user-provided opt-out preferences", () => {
      sendEdgeNetworkRequest.and.callFake(() => {
        cookieJar.set(optOutCookieName, "GENERAL=false");
        return Promise.resolve();
      });

      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      // We optimistically use the preferences the user provided right away,
      // but if the server doesn't agree and sends back a cookie value that
      // conflicts, we adopt whatever the server said since that ultimately
      // is what will be used if the user refreshes the page.
      return consent
        .setOptOutPurposes({
          GENERAL: true
        })
        .then(() => {
          return consent.whenConsented();
        });
    });
  });

  describe("with opt-in enabled", () => {
    beforeEach(() => {
      config.optInEnabled = true;
    });
    it("considers the user consented if opt-in cookie shows the user has opted into all purposes", () => {
      cookieJar.set(optInCookieName, "general=true");
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      return consent.whenConsented();
    });

    it("considers the user not consented if opt-in cookie shows the user opted into no purposes", () => {
      cookieJar.set(optInCookieName, "general=false");
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      return expectAsync(consent.whenConsented()).toBeRejectedWithError();
    });

    it("considers the user pending consent if opt-in cookie is not set", () => {
      const consentedSpy = jasmine.createSpy();
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      expect(logger.warn).toHaveBeenCalledWith(
        "Some commands may be delayed until the user opts in."
      );
      consent.whenConsented().then(consentedSpy);
      return flushPromiseChains().then(() => {
        expect(consentedSpy).not.toHaveBeenCalled();
      });
    });

    it("considers the user consented after the user opts into all purposes", () => {
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });
      consent.setOptInPurposes({ general: true });
      return consent.whenConsented();
    });

    it("considers the user not consented after the user opts into no purposes", () => {
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });
      consent.setOptInPurposes({ general: false });
      return expectAsync(consent.whenConsented()).toBeRejectedWithError(
        "The user opted into no purposes."
      );
    });

    it("doesn't allow modification of opt-in preferences if user is opted out", () => {
      cookieJar.set(optOutCookieName, "general=true");
      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });
      return expectAsync(
        consent.setOptInPurposes({ general: false })
      ).toBeRejectedWithError("The user opted out of all purposes.");
    });

    it("allows response cookie to trump user-provided opt-in preferences", () => {
      sendEdgeNetworkRequest.and.callFake(() => {
        cookieJar.set(optInCookieName, "GENERAL=true");
        return Promise.resolve();
      });

      const consent = createConsent({
        config,
        logger,
        lifecycle,
        createConsentRequestPayload,
        sendEdgeNetworkRequest
      });

      // We optimistically use the preferences the user provided right away,
      // but if the server doesn't agree and sends back a cookie value that
      // conflicts, we adopt whatever the server said since that ultimately
      // is what will be used if the user refreshes the page.
      return consent
        .setOptInPurposes({
          GENERAL: false
        })
        .then(() => {
          return consent.whenConsented();
        });
    });
  });
});
