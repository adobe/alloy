/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { getSurferId } from "./collectSurferId.js";
import { getRampId } from "./collectRampId.js";
import { getID5Id } from "./collectID5Id.js";

// Made synchronous to return map of id promises directly
const collectAlldentities = (sessionManager, options = {}) => {
  // Ensure options has a logger, default to console if not provided
  const { id5PartnerId, rampIdScriptPath, logger = console } = options;

  logger.info(
    "collectAlldentities: Starting new fetch for all ID promises (synchronous).",
  );

  const idPromisesMap = {};

  // Fetch Surfer ID
  logger.info("collectAlldentities: Initiating Surfer ID fetch.");
  idPromisesMap.surfer_id = getSurferId(sessionManager)
    .then((id) => {
      if (id) {
        logger.info("collectAlldentities: Surfer ID fetched successfully.", {
          surfer_id: id,
        });
      } else {
        logger.warn("collectAlldentities: Surfer ID fetch returned no value.");
      }
      return id;
    })
    .catch((err) => {
      logger.warn("collectAlldentities: Failed to fetch surfer_id:", err);
      return null; // Ensure promise resolves, even with null
    });

  // Fetch ID5 ID (if partnerId is provided)
  if (id5PartnerId) {
    logger.info("collectAlldentities: Initiating ID5 ID fetch.", {
      id5PartnerId,
    });
    idPromisesMap.id5_id = getID5Id(id5PartnerId, sessionManager)
      .then((id) => {
        if (id) {
          logger.info("collectAlldentities: ID5 ID fetched successfully.", {
            id5_id: id,
          });
        } else {
          logger.warn(
            "collectAlldentities: ID5 ID fetch returned no value for partner.",
            { id5PartnerId },
          );
        }
        return id;
      })
      .catch((err) => {
        logger.warn(
          `collectAlldentities: Failed to fetch id5_id for partner ${id5PartnerId}:`,
          err,
        );
        return null;
      });
  } else {
    logger.info(
      "collectAlldentities: No id5PartnerId provided, skipping ID5 ID fetch.",
    );
  }

  // Fetch RampID (if script path is provided)
  if (rampIdScriptPath) {
    logger.info("collectAlldentities: Initiating Ramp ID fetch.", {
      rampIdScriptPath,
    });
    idPromisesMap.ramp_id = getRampId(rampIdScriptPath, sessionManager)
      .then((id) => {
        if (id) {
          logger.info("collectAlldentities: Ramp ID fetched successfully.", {
            ramp_id: id,
          });
        } else {
          logger.warn(
            "collectAlldentities: Ramp ID fetch returned no value from script.",
            { rampIdScriptPath },
          );
        }
        return id;
      })
      .catch((err) => {
        logger.warn(
          `collectAlldentities: Failed to fetch ramp_id from ${rampIdScriptPath}:`,
          err,
        );
        return null;
      });
  } else {
    logger.info(
      "collectAlldentities: No rampIdScriptPath provided, skipping Ramp ID fetch.",
    );
  }

  logger.info(
    "collectAlldentities: Returning map of ID promises synchronously.",
  );
  return idPromisesMap;
};

export default collectAlldentities;
