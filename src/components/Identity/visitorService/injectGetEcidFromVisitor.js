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

import getVisitor from "./getVisitor";

export default ({ logger, orgId, awaitVisitorOptIn }) => {
  const Visitor = getVisitor(window);
  return () => {
    if (Visitor) {
      // Need to explicitly wait for optIn because visitor will call callback
      // with invalid values prior to optIn being approved
      return awaitVisitorOptIn({ logger })
        .then(() => {
          logger.info(
            "Delaying request while using Visitor to retrieve ECID from server."
          );

          return new Promise(resolve => {
            const visitor = Visitor.getInstance(orgId, {});
            visitor.getMarketingCloudVisitorID(ecid => {
              logger.info(
                "Resuming previously delayed request that was waiting for ECID from Visitor."
              );
              resolve(ecid);
            }, true);
          });
        })
        .catch(error => {
          // If consent was denied, get the ECID from experience edge. OptIn and AEP Web SDK
          // consent should operate independently, but during id migration AEP Web SDK needs
          // to wait for optIn object consent resolution so that only one ECID is generated.
          if (error) {
            logger.info(
              `${error.message}, retrieving ECID from experience edge`
            );
          } else {
            logger.info(
              "An error occurred while obtaining the ECID from Visitor."
            );
          }
        });
    }
    return Promise.resolve();
  };
};
