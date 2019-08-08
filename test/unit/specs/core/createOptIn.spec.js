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
import flushPromiseChains from "../../helpers/flushPromiseChains";

describe("createOptIn", () => {
  let optIn;

  beforeEach(() => {
    optIn = createOptIn();
  });

  describe("when disabled", () => {
    it("considers the user opted in", () => {
      expect(optIn.isOptedIn()).toBe(true);
      return optIn.whenOptedIn();
    });
  });

  describe("when enabled", () => {
    let logger;
    let cookieJar;

    beforeEach(() => {
      logger = jasmine.createSpyObj("logger", ["warn"]);
      cookieJar = jasmine.createSpyObj("cookieJar", ["get", "set"]);
      cookieJar.get.and.returnValue(null);
    });

    it("considers the user opted in if cookie is set to 'all'", () => {
      cookieJar.get.and.returnValue("all");
      optIn.enable(logger, cookieJar);

      expect(optIn.isOptedIn()).toBe(true);
      return optIn.whenOptedIn();
    });

    it("considers the user opted out if cookie is set to 'none'", () => {
      cookieJar.get.and.returnValue("none");
      optIn.enable(logger, cookieJar);

      expect(optIn.isOptedIn()).toBe(false);
      return expectAsync(optIn.whenOptedIn()).toBeRejectedWith(
        jasmine.any(Error)
      );
    });

    it("considers the user pending opt in if cookie is not set", () => {
      const optedInSpy = jasmine.createSpy();
      optIn.enable(logger, cookieJar);

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
      optIn.enable(logger, cookieJar);
      const whenOptedInPromise = optIn.whenOptedIn();
      optIn.setPurposes("all");

      expect(cookieJar.set).toHaveBeenCalledWith("optIn", "all");
      expect(optIn.isOptedIn()).toBe(true);
      return expectAsync(whenOptedInPromise).toBeResolved();
    });

    it("considers the user opted out after the user opts out", () => {
      optIn.enable(logger, cookieJar);
      const whenOptedInPromise = optIn.whenOptedIn();
      optIn.setPurposes("none");

      expect(cookieJar.set).toHaveBeenCalledWith("optIn", "none");
      expect(optIn.isOptedIn()).toBe(false);
      return expectAsync(whenOptedInPromise).toBeRejectedWith(
        jasmine.any(Error)
      );
    });

    it("considers the user opted in after the user opts out then opts in", () => {
      optIn.enable(logger, cookieJar);
      optIn.setPurposes("none");
      optIn.setPurposes("all");
      const whenOptedInPromise = optIn.whenOptedIn();

      expect(cookieJar.set).toHaveBeenCalledWith("optIn", "all");
      expect(optIn.isOptedIn()).toBe(true);
      return expectAsync(whenOptedInPromise).toBeResolved();
    });

    it("considers the user opted out after the user opts in then opts out", () => {
      optIn.enable(logger, cookieJar);
      optIn.setPurposes("all");
      optIn.setPurposes("none");
      const whenOptedInPromise = optIn.whenOptedIn();

      expect(cookieJar.set).toHaveBeenCalledWith("optIn", "none");
      expect(optIn.isOptedIn()).toBe(false);
      return expectAsync(whenOptedInPromise).toBeRejectedWith(
        jasmine.any(Error)
      );
    });

    it("resolves nested whenOptedIn calls", () => {
      optIn.enable(logger, cookieJar);
      const whenOptedInPromise = optIn
        .whenOptedIn()
        .then(() => optIn.whenOptedIn());
      optIn.setPurposes("all");
      return expectAsync(whenOptedInPromise).toBeResolved();
    });
  });
});
