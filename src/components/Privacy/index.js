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

import { boolean } from "../../utils/schema";
import { isString } from "../../utils";

const throwInvalidPurposesError = purposes => {
  throw new Error(
    `Opt-in purposes must be "all" or "none". Received: ${purposes}`
  );
};

const createPrivacy = ({ config, logger, optIn }) => {
  return {
    commands: {
      optIn({ purposes }) {
        if (config.optInEnabled) {
          if (isString(purposes)) {
            const lowerCasePurposes = purposes.toLowerCase();

            if (
              lowerCasePurposes === optIn.ALL ||
              lowerCasePurposes === optIn.NONE
            ) {
              optIn.setPurposes(purposes);
            } else {
              throwInvalidPurposesError(purposes);
            }
          } else {
            throwInvalidPurposesError(purposes);
          }
        } else {
          logger.warn(
            "optInEnabled must be set to true before using the optIn command."
          );
        }
      }
    }
  };
};

createPrivacy.namespace = "Privacy";

createPrivacy.configValidators = {
  optInEnabled: boolean().default(false)
};

export default createPrivacy;
