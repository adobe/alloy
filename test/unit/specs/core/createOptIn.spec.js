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
import flushPromises from "../../helpers/flushPromises";

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
    let cookie;

    beforeEach(() => {
      cookie = jasmine.createSpyObj("cookie", ["get", "set"]);
      cookie.get.and.returnValue(null);
    });

    it("considers the user opted in if cookie is set to 'all'", () => {
      cookie.get.and.returnValue("all");
      optIn.enable(cookie);

      expect(optIn.isOptedIn()).toBe(true);
      return optIn.whenOptedIn();
    });

    it("considers the user opted out if cookie is set to 'none'", done => {
      cookie.get.and.returnValue("none");
      optIn.enable(cookie);

      expect(optIn.isOptedIn()).toBe(false);
      optIn.whenOptedIn().catch(error => {
        expect(error).toBeDefined();
        done();
      });
    });

    it("considers the user pending opt in if cookie is not set", () => {
      const optedInSpy = jasmine.createSpy();
      optIn.enable(cookie);

      expect(optIn.isOptedIn()).toBe(false);
      optIn.whenOptedIn().then(optedInSpy);
      return flushPromises().then(() => {
        expect(optedInSpy).not.toHaveBeenCalled();
      });
    });

    it("considers the user opted in after the user opts in", () => {
      const optedInSpy = jasmine.createSpy();
      optIn.enable(cookie);
      optIn.whenOptedIn().then(optedInSpy);
      optIn.setPurposes("all");

      expect(cookie.set).toHaveBeenCalledWith("optIn", "all");
      expect(optIn.isOptedIn()).toBe(true);
      return flushPromises().then(() => {
        expect(optedInSpy).toHaveBeenCalled();
      });
    });

    it("considers the user opted out after the user opts out", () => {
      const optedOutSpy = jasmine.createSpy();
      optIn.enable(cookie);
      optIn.whenOptedIn().catch(optedOutSpy);
      optIn.setPurposes("none");

      expect(cookie.set).toHaveBeenCalledWith("optIn", "none");
      expect(optIn.isOptedIn()).toBe(false);
      return flushPromises().then(() => {
        expect(optedOutSpy).toHaveBeenCalledWith(jasmine.any(Error));
      });
    });

    it("considers the user opted in after the user opts out then opts in", () => {
      const optedInSpy = jasmine.createSpy();
      optIn.enable(cookie);
      optIn.setPurposes("none");
      optIn.setPurposes("all");
      optIn.whenOptedIn().then(optedInSpy);

      expect(cookie.set).toHaveBeenCalledWith("optIn", "all");
      expect(optIn.isOptedIn()).toBe(true);
      return flushPromises().then(() => {
        expect(optedInSpy).toHaveBeenCalled();
      });
    });

    it("considers the user opted out after the user opts in then opts out", () => {
      const optedOutSpy = jasmine.createSpy();
      optIn.enable(cookie);
      optIn.setPurposes("all");
      optIn.setPurposes("none");
      optIn.whenOptedIn().catch(optedOutSpy);

      expect(cookie.set).toHaveBeenCalledWith("optIn", "none");
      expect(optIn.isOptedIn()).toBe(false);
      return flushPromises().then(() => {
        expect(optedOutSpy).toHaveBeenCalledWith(jasmine.any(Error));
      });
    });

    it("resolves nested whenOptedIn calls", () => {
      const optedInSpy = jasmine.createSpy();
      optIn.enable(cookie);
      optIn
        .whenOptedIn()
        .then(() => optIn.whenOptedIn())
        .then(optedInSpy);
      optIn.setPurposes("all");

      return flushPromises().then(() => {
        expect(optedInSpy).toHaveBeenCalled();
      });
    });
  });
});
