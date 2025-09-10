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

import {
  anyOf,
  anything,
  callback,
  number,
  objectOf,
  string,
} from "../../utils/validation/index";
import { validateConfigOverride } from "../../utils/index";

export default ({ options }) => {
  const sessionValidator = anyOf(
    [
      objectOf({
        playerId: string().required(),
        getPlayerDetails: callback().required(),
        xdm: objectOf({
          mediaCollection: objectOf({
            sessionDetails: objectOf(anything()).required(),
          }),
        }),
        edgeConfigOverrides: validateConfigOverride,
      }).required(),

      objectOf({
        xdm: objectOf({
          mediaCollection: objectOf({
            playhead: number().required(),
            sessionDetails: objectOf(anything()).required(),
          }),
        }),
        edgeConfigOverrides: validateConfigOverride,
      }).required(),
    ],

    "an object with playerId, getPlayerDetails and xdm.mediaCollection.sessionDetails, or an object with xdm.mediaCollection.playhead and xdm.mediaCollection.sessionDetails",
  );

  return sessionValidator(options);
};
