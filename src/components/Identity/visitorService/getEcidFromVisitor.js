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
  if (Visitor) {
    return awaitVisitorOptIn({ logger }).then(() => {
      logger.log(
        "Delaying request while using Visitor to retrieve ECID from server."
      );

      return new Promise(resolve => {
        const visitor = Visitor.getInstance(orgId, {});
        visitor.getMarketingCloudVisitorID(ecid => {
          logger.log(
            "Resuming previously delayed request that was waiting for ECID from Visitor."
          );
          resolve(ecid);
        }, true);
      });
    });
  }

  return Promise.resolve();
};
