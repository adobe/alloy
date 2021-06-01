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

import { isObject } from "../../../utils";

export default ({ logger }) => {
  return new Promise((resolve, reject) => {
    if (isObject(window.adobe) && isObject(window.adobe.optIn)) {
      const optInOld = window.adobe.optIn;
      logger.info(
        "Delaying request while waiting for legacy opt-in to let Visitor retrieve ECID from server."
      );
      optInOld.fetchPermissions(() => {
        if (optInOld.isApproved([optInOld.Categories.ECID])) {
          logger.info(
            "Received legacy opt-in approval to let Visitor retrieve ECID from server."
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
};
