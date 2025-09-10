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
  enumOf,
  number,
  objectOf,
  string,
} from "../../utils/validation/index.js";
import EventTypes from "./constants/eventTypes.js";

export default ({ options }) => {
  const validator = anyOf(
    [
      objectOf({
        playerId: string().required(),
        xdm: objectOf({
          eventType: enumOf(...Object.values(EventTypes)).required(),
          mediaCollection: objectOf(anything()),
        }).required(),
      }).required(),

      objectOf({
        xdm: objectOf({
          eventType: enumOf(...Object.values(EventTypes)).required(),
          mediaCollection: objectOf({
            playhead: number().integer().required(),
            sessionID: string().required(),
          }).required(),
        }).required(),
      }).required(),
    ],

    "Error validating the sendMediaEvent command options.",
  );

  return validator(options);
};
