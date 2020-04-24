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

import getEcidFromVisitor from "../../../../../../src/components/Identity/visitorService/getEcidFromVisitor";

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
      return expectAsync(getEcidFromVisitor({ logger, orgId })).toBeResolvedTo(
        undefined
      );
    });
  });

  describe("Visitor exists; awaitVisitorOptIn resolves the promise", () => {
    it("should return promise resolved with ecid123", () => {
      window.Visitor = Visitor;
      const awaitVisitorOptIn = () => {
        return Promise.resolve();
      };

      return expectAsync(
        getEcidFromVisitor({ logger, orgId, awaitVisitorOptIn })
      ).toBeResolvedTo("ecid123");
    });
  });

  describe("Visitor exists; awaitVisitorOptIn rejects the promise", () => {
    it("should return promise rejected with undefined", () => {
      window.Visitor = Visitor;
      const awaitVisitorOptIn = () => {
        return Promise.reject();
      };

      return expectAsync(
        getEcidFromVisitor({ logger, orgId, awaitVisitorOptIn })
      ).toBeRejectedWith(undefined);
    });
  });
});
