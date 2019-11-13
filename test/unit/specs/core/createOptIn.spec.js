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

import createOptIn from "../../../../src/core/createOptIn";
import createConfig from "../../../../src/core/config/createConfig";
import flushPromiseChains from "../../helpers/flushPromiseChains";

describe("createOptIn", () => {
  let config;
  let logger;
  let cookieJar;
  let createOrgNamespacedCookieName;

  beforeEach(() => {
    config = createConfig({
      optInEnabled: true,
      imsOrgId: "ABC@Adobe"
    });
    logger = jasmine.createSpyObj("logger", ["warn"]);
    cookieJar = {
      get: jasmine.createSpy().and.returnValue(null),
      set: jasmine.createSpy()
    };
    createOrgNamespacedCookieName = () => "orgNamespacedCookieName";
  });

  describe("when disabled", () => {
    it("considers the user opted in", () => {
      config.optInEnabled = false;
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      expect(optIn.isOptedIn()).toBe(true);
      return optIn.whenOptedIn();
    });
  });

  describe("when enabled", () => {
    it("considers the user opted in if cookie is set to 'all'", () => {
      cookieJar.get.and.returnValue("all");
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });

      expect(optIn.isOptedIn()).toBe(true);
      return optIn.whenOptedIn();
    });

    it("considers the user opted out if cookie is set to 'none'", () => {
      cookieJar.get.and.returnValue("none");
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });

      expect(optIn.isOptedIn()).toBe(false);
      return expectAsync(optIn.whenOptedIn()).toBeRejectedWith(
        jasmine.any(Error)
      );
    });

    it("considers the user pending opt in if cookie is not set", () => {
      const optedInSpy = jasmine.createSpy();
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });

      expect(logger.warn).toHaveBeenCalledWith(
        "Some commands may be delayed until the user opts in."
      );
      expect(optIn.isOptedIn()).toBe(false);
      optIn.whenOptedIn().then(optedInSpy);
      return flushPromiseChains().then(() => {
        expect(optedInSpy).not.toHaveBeenCalled();
      });
    });

    it("considers the user opted in after the user opts in", () => {
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      const whenOptedInPromise = optIn.whenOptedIn();
      optIn.setPurposes("all");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "orgNamespacedCookieName",
        "all"
      );
      expect(optIn.isOptedIn()).toBe(true);
      return expectAsync(whenOptedInPromise).toBeResolved();
    });

    it("considers the user opted out after the user opts out", () => {
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      const whenOptedInPromise = optIn.whenOptedIn();
      optIn.setPurposes("none");

      expect(cookieJar.set).toHaveBeenCalledWith(
        "orgNamespacedCookieName",
        "none"
      );
      expect(optIn.isOptedIn()).toBe(false);
      return expectAsync(whenOptedInPromise).toBeRejectedWith(
        jasmine.any(Error)
      );
    });

    it("considers the user opted in after the user opts out then opts in", () => {
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      optIn.setPurposes("none");
      optIn.setPurposes("all");
      const whenOptedInPromise = optIn.whenOptedIn();

      expect(cookieJar.set).toHaveBeenCalledWith(
        "orgNamespacedCookieName",
        "all"
      );
      expect(optIn.isOptedIn()).toBe(true);
      return expectAsync(whenOptedInPromise).toBeResolved();
    });

    it("considers the user opted out after the user opts in then opts out", () => {
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      optIn.setPurposes("all");
      optIn.setPurposes("none");
      const whenOptedInPromise = optIn.whenOptedIn();

      expect(cookieJar.set).toHaveBeenCalledWith(
        "orgNamespacedCookieName",
        "none"
      );
      expect(optIn.isOptedIn()).toBe(false);
      return expectAsync(whenOptedInPromise).toBeRejectedWith(
        jasmine.any(Error)
      );
    });

    it("resolves nested whenOptedIn calls", () => {
      const optIn = createOptIn({
        config,
        logger,
        cookieJar,
        createOrgNamespacedCookieName
      });
      const whenOptedInPromise = optIn
        .whenOptedIn()
        .then(() => optIn.whenOptedIn());
      optIn.setPurposes("all");
      return expectAsync(whenOptedInPromise).toBeResolved();
    });
  });
});
