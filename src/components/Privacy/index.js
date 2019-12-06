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

import { boolean } from "../../utils/configValidators";
import { isString } from "../../utils";

const ALL = "all";
const NONE = "none";

const throwInvalidOptInPurposesError = purposes => {
  throw new Error(
    `Opt-in purposes must be "all" or "none". Received: ${purposes}`
  );
};

const throwInvalidOptOutPurposesError = purposes => {
  throw new Error(`Opt-out purposes must be "all". Received: ${purposes}`);
};

const createPrivacy = ({ config, consent }) => {
  return {
    commands: {
      optIn({ purposes }) {
        if (!config.optInEnabled) {
          throw new Error(
            "optInEnabled must be set to true before using the optIn command."
          );
        }

        if (!isString(purposes)) {
          throwInvalidOptInPurposesError(purposes);
        }

        const lowerCasePurposes = purposes.toLowerCase();

        if (lowerCasePurposes !== ALL && lowerCasePurposes !== NONE) {
          throwInvalidOptInPurposesError(purposes);
        }

        return consent.setOptInPurposes({
          GENERAL: lowerCasePurposes === ALL
        });
      },
      optOut({ purposes }) {
        if (!isString(purposes)) {
          throwInvalidOptOutPurposesError(purposes);
        }

        const lowerCasePurposes = purposes.toLowerCase();

        if (lowerCasePurposes !== ALL) {
          throwInvalidOptOutPurposesError(purposes);
        }

        return consent.setOptOutPurposes({
          GENERAL: true
        });
      }
    }
  };
};

createPrivacy.namespace = "Privacy";

createPrivacy.configValidators = {
  optInEnabled: {
    defaultValue: false,
    validate: boolean()
  }
};

export default createPrivacy;
