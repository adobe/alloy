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

import getEcidFromVisitorFactory from "../../../../../../src/components/Identity/visitorService/getEcidFromVisitorFactory";

const logger = {
  log() {}
};

const Visitor = () => {};
Visitor.getInstance = () => {
  return {
    getMarketingCloudVisitorID(cb) {
      setTimeout(() => {
        cb("ecid123");
      }, 0);
    }
  };
};

const orgId = "456org";

describe("getEcidFromVisitor", () => {
  beforeEach(() => {
    window.Visitor = undefined;
  });

  afterAll(() => {
    window.Visitor = undefined;
  });

  describe("Visitor does not exist", () => {
    it("should return promise resolved with undefined", () => {
      const getEcidFromVisitor = getEcidFromVisitorFactory({ logger, orgId });
      return expectAsync(getEcidFromVisitor()).toBeResolvedTo(undefined);
    });
  });

  describe("Visitor exists; awaitVisitorOptIn resolves the promise", () => {
    it("should return promise resolved with ecid123", () => {
      window.Visitor = Visitor;
      const awaitVisitorOptIn = () => {
        return Promise.resolve();
      };

      const getEcidFromVisitor = getEcidFromVisitorFactory({
        logger,
        orgId,
        awaitVisitorOptIn
      });
      return expectAsync(getEcidFromVisitor()).toBeResolvedTo("ecid123");
    });
  });

  describe("Visitor exists; awaitVisitorOptIn rejects the promise", () => {
    it("should return promise rejected with undefined", () => {
      window.Visitor = Visitor;
      const awaitVisitorOptIn = () => {
        return Promise.reject();
      };

      const getEcidFromVisitor = getEcidFromVisitorFactory({
        logger,
        orgId,
        awaitVisitorOptIn
      });
      return expectAsync(getEcidFromVisitor()).toBeRejectedWith(undefined);
    });
  });
});
