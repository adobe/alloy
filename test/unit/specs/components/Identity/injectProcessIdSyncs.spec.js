/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import injectProcessIdSyncs from "../../../../../src/components/Identity/injectProcessIdSyncs.js";

describe("Identity::injectProcessIdSyncs", () => {
  let fireReferrerHideableImage;
  let logger;
  let processIdSyncs;

  beforeEach(() => {
    fireReferrerHideableImage = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["info", "error"]);
    processIdSyncs = injectProcessIdSyncs({
      fireReferrerHideableImage,
      logger
    });
  });

  it("handles no ID syncs", () => {
    return processIdSyncs([]).then(() => {
      expect(fireReferrerHideableImage).not.toHaveBeenCalled();
    });
  });

  it("calls fireReferrerHideableImage for all ID syncs of type URL, and logs results", () => {
    fireReferrerHideableImage.and.callFake(({ url }) => {
      return url === "http://test.zyx" ? Promise.resolve() : Promise.reject();
    });

    const identities = [
      {
        type: "url",
        id: 2097728,
        spec: {
          url: "http://test.abc",
          hideReferrer: true
        }
      },
      {
        type: "cookie",
        spec: {
          name: "testCookieIdSync",
          value: "id\u003ds2",
          domain: "",
          ttl: 30
        }
      },
      {
        type: "url",
        id: 2097729,
        spec: {
          url: "http://test.zyx",
          hideReferrer: false
        }
      }
    ];

    return processIdSyncs(identities).then(() => {
      expect(fireReferrerHideableImage).toHaveBeenCalledWith({
        url: "http://test.abc",
        hideReferrer: true
      });
      expect(fireReferrerHideableImage).toHaveBeenCalledWith({
        url: "http://test.zyx",
        hideReferrer: false
      });
      expect(logger.info).toHaveBeenCalledWith(
        "ID sync succeeded: http://test.zyx"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "ID sync failed: http://test.abc"
      );
    });
  });
});
