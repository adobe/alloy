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

import type { Logger } from "@adobe/alloy-core/core/types.js";
import { loadScript } from "@adobe/alloy-core/utils/dom";
import { ID5_SCRIPT_URL } from "../constants/index.js";

let id5Id: string | null | undefined = "";
let inProgressId5Promise: Promise<string | null> | null = null;
const SHORT_TIMEOUT_MS = 2000;
const DEFAULT_TIMEOUT_MS = 30000;

const initiateID5Call = (
  rawPartnerId: string | number,
  useShortTimeout: boolean,
  logger: Logger,
): Promise<string | null> => {
  const partnerId = Math.floor(Number(rawPartnerId));

  if (inProgressId5Promise) {
    return inProgressId5Promise;
  }

  const timeoutMs = useShortTimeout ? SHORT_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;

  let iD5TimedOut = false;

  const id5ResolutionPromise = new Promise<string | null>((resolve, reject) => {
    if (!partnerId) {
      logger.error("Missing partner ID");
      reject(new Error("ID5 partner ID is required"));
      return;
    }

    const handleId5 = () => {
      try {
        const { ID5 } = window;
        if (typeof ID5 === "undefined") {
          reject(new Error("ID5 object not available after script load"));
          return;
        }

        const id5Instance = ID5.init({ partnerId });
        id5Id = id5Instance.getUserId();

        const safeResolve = (val: string | null) => {
          if (!iD5TimedOut) resolve(val);
        };

        if (!id5Id) {
          ID5.init({ partnerId }).onAvailable(function firstRetry(retryStatus) {
            id5Id = retryStatus.getUserId();
            if (id5Id) {
              safeResolve(id5Id);
            } else {
              ID5.init({ partnerId }).onAvailable(
                function secondRetry(secondRetryStatus) {
                  id5Id = secondRetryStatus.getUserId();
                  if (id5Id) {
                    safeResolve(id5Id);
                  } else {
                    logger.error("Failed to get ID5 ID after all retries");
                    safeResolve(null);
                  }
                },
              );
            }
          }, 1000);
        } else {
          safeResolve(id5Id);
        }
      } catch (error) {
        logger.error("Error during ID5 initialization", error);
        reject(error);
      }
    };

    if (typeof window.ID5 !== "undefined") {
      handleId5();
    } else {
      loadScript(ID5_SCRIPT_URL, {
        onLoad: handleId5,
        onError: (error: Error) => {
          logger.error("Script loading failed", error);
          reject(error);
        },
      });
    }
  });

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => {
      iD5TimedOut = true;
      resolve(null);
    }, timeoutMs);
  });

  inProgressId5Promise = Promise.race([
    id5ResolutionPromise,
    timeoutPromise,
  ]).finally(() => {
    inProgressId5Promise = null;
  });

  return inProgressId5Promise;
};

const getID5Id = function getID5Id(
  logger: Logger,
  partnerId: string | number,
  resolveId5IfNotAvailable = true,
  useShortTimeout = false,
): Promise<string | null> {
  if (id5Id && id5Id !== "") {
    return Promise.resolve(id5Id);
  }
  if (!resolveId5IfNotAvailable) {
    return Promise.resolve(null);
  }

  return initiateID5Call(partnerId, useShortTimeout, logger)
    .then((resolvedId) => resolvedId)
    .catch((error: unknown) => {
      logger.error("Failed to get ID5 ID", error);
      throw error;
    });
};

export { getID5Id, initiateID5Call };
