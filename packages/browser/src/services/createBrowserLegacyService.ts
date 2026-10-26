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

import type { LegacyService } from "@adobe/alloy-core/services/index.js";
import type { Logger } from "@adobe/alloy-core/core/types.js";
import type { LegacyVisitorApi } from "../types.js";
import { isFunction, isObject } from "@adobe/alloy-core/utils/index.js";

const getVisitor = (): LegacyVisitorApi | undefined => {
  const { Visitor } = window;
  return isFunction(Visitor) && isFunction(Visitor.getInstance)
    ? Visitor
    : undefined;
};

const awaitVisitorOptIn = ({ logger }: { logger: Logger }): Promise<void> =>
  new Promise<void>((resolve, reject) => {
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

const getEcidFromVisitor = async ({
  orgId,
  logger,
}: {
  orgId: string;
  logger: Logger;
}): Promise<string | undefined> => {
  const Visitor = getVisitor();
  if (!Visitor) {
    return undefined;
  }
  try {
    await awaitVisitorOptIn({ logger });
    logger.info(
      "Delaying request while using Visitor to retrieve ECID from server.",
    );
    return await new Promise<string>((resolve) => {
      const visitor = Visitor.getInstance(orgId, {});
      visitor.getMarketingCloudVisitorID((ecid) => {
        logger.info(
          "Resuming previously delayed request that was waiting for ECID from Visitor.",
        );
        resolve(ecid);
      }, true);
    });
  } catch (error) {
    // If consent was denied, fall back to retrieving the ECID from the
    // experience edge. OptIn and AEP Web SDK consent should operate
    // independently, but during ID migration AEP Web SDK needs to wait for
    // optIn so that only one ECID is generated.
    if (error) {
      logger.info(
        `${(error as Error).message}, retrieving ECID from experience edge`,
      );
    } else {
      logger.info("An error occurred while obtaining the ECID from Visitor.");
    }
    return undefined;
  }
};

const createBrowserLegacyService = (): LegacyService => ({
  getEcidFromVisitor,
  awaitVisitorOptIn,
});

export default createBrowserLegacyService;
