/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/** @import { LegacyService } from "@adobe/alloy-core/services" */

import { isFunction, isObject } from "@adobe/alloy-core/utils/index.js";

/**
 * Returns the legacy Visitor constructor when present on the page, or `false`
 * otherwise.
 */
const getVisitor = () => {
  const { Visitor } = window;
  return isFunction(Visitor) && isFunction(Visitor.getInstance) && Visitor;
};

/**
 * Resolves once legacy `adobe.optIn` has approved ECID retrieval. Resolves
 * immediately when no legacy opt-in object is present. Mirrors the historical
 * `awaitVisitorOptIn` behavior in core.
 *
 * @param {{ logger: import('@adobe/alloy-core/core/types.js').Logger }} params
 * @returns {Promise<void>}
 */
const awaitVisitorOptIn = ({ logger }) =>
  new Promise((resolve, reject) => {
    if (isObject(window.adobe) && isObject(window.adobe.optIn)) {
      const optInOld = window.adobe.optIn;
      logger.info(
        "Delaying request while waiting for legacy opt-in to let Visitor retrieve ECID from server.",
      );
      optInOld.fetchPermissions(() => {
        if (optInOld.isApproved([optInOld.Categories.ECID])) {
          logger.info(
            "Received legacy opt-in approval to let Visitor retrieve ECID from server.",
          );
          resolve();
        } else {
          reject(new Error("Legacy opt-in was declined."));
        }
      }, true);
    } else {
      resolve();
    }
  });

/**
 * Resolves an ECID from the legacy Visitor service, or `undefined` if Visitor
 * isn't loaded on the page. Mirrors the historical `injectGetEcidFromVisitor`
 * behavior in core.
 *
 * @param {{ orgId: string, logger: import('@adobe/alloy-core/core/types.js').Logger }} params
 * @returns {Promise<string | undefined>}
 */
const getEcidFromVisitor = ({ orgId, logger }) => {
  const Visitor = getVisitor();
  if (!Visitor) {
    return Promise.resolve(undefined);
  }
  return awaitVisitorOptIn({ logger })
    .then(
      () =>
        new Promise((resolve) => {
          logger.info(
            "Delaying request while using Visitor to retrieve ECID from server.",
          );
          const visitor = Visitor.getInstance(orgId, {});
          visitor.getMarketingCloudVisitorID((ecid) => {
            logger.info(
              "Resuming previously delayed request that was waiting for ECID from Visitor.",
            );
            resolve(ecid);
          }, true);
        }),
    )
    .catch((error) => {
      // If consent was denied, fall back to retrieving the ECID from the
      // experience edge. OptIn and AEP Web SDK consent should operate
      // independently, but during ID migration AEP Web SDK needs to wait for
      // optIn so that only one ECID is generated.
      if (error) {
        logger.info(`${error.message}, retrieving ECID from experience edge`);
      } else {
        logger.info("An error occurred while obtaining the ECID from Visitor.");
      }
      return undefined;
    });
};

/**
 * Browser implementation of {@link LegacyService}. Bridges to Adobe's legacy
 * Visitor library and `adobe.optIn` global when they are present on the page.
 *
 * @returns {LegacyService}
 */
const createBrowserLegacyService = () => ({
  getEcidFromVisitor,
  awaitVisitorOptIn,
});

export default createBrowserLegacyService;
