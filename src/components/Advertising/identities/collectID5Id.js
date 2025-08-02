/**
 * ID5 identity fetch implementation
 * Loads the ID5 script and retrieves the ID5 user ID
 */

import { loadScript } from "../../../utils/dom/index.js";
import { ID5_SCRIPT_URL } from "../constants/index.js";

let id5Id = "";
let inProgressId5Promise = null;

const initiateID5Call = (partnerId, logger) => {
  partnerId = Math.floor(Number(partnerId));

  if (inProgressId5Promise) {
    return inProgressId5Promise;
  }

  inProgressId5Promise = new Promise((resolve, reject) => {
    if (!partnerId) {
      logger.error("Missing partner ID");
      inProgressId5Promise = null;
      reject(new Error("ID5 partner ID is required"));
      return;
    }

    const handleId5 = () => {
      try {
        if (typeof window.ID5 === "undefined") {
          reject(new Error("ID5 object not available after script load"));
          return;
        }

        const id5Instance = window.ID5.init({ partnerId });
        id5Id = id5Instance.getUserId();

        if (id5Id === undefined || id5Id === "") {
          // First retry with 1000ms delay
          window.ID5.init({ partnerId }).onAvailable(function firstRetry(
            retryStatus,
          ) {
            id5Id = retryStatus.getUserId();
            if (id5Id) {
              resolve(id5Id);
              inProgressId5Promise = null;
            } else {
              // Second retry will complete without timeout.
              window.ID5.init({ partnerId }).onAvailable(
                function secondRetry(secondRetryStatus) {
                  id5Id = secondRetryStatus.getUserId();
                  if (id5Id !== undefined && id5Id !== "") {
                    resolve(id5Id);
                  } else {
                    logger.error("Failed to get ID5 ID after all retries");
                  }
                  inProgressId5Promise = null;
                },
              );
            }
          }, 1000);
        } else {
          resolve(id5Id);
          inProgressId5Promise = null;
        }
      } catch (error) {
        logger.error("Error during ID5 initialization", error);
        reject(error);
        inProgressId5Promise = null;
      }
    };

    if (typeof window.ID5 !== "undefined") {
      handleId5();
    } else {
      // Use centralized loadScript function
      loadScript(ID5_SCRIPT_URL, {
        onLoad: handleId5,
        onError: (error) => {
          logger.error("Script loading failed", error);
          inProgressId5Promise = null;
          reject(error);
        },
      });
    }
  });

  return inProgressId5Promise;
};

const getID5Id = function getID5Id(
  logger,
  partnerId,
  resolveId5IfNotAvailable = true,
) {
  if (id5Id && id5Id !== "") {
    return Promise.resolve(id5Id);
  }
  if (!resolveId5IfNotAvailable) {
    return Promise.resolve(null);
  }
  return initiateID5Call(partnerId, logger)
    .then((resolvedId) => resolvedId)
    .catch((error) => {
      logger.error("Failed to get ID5 ID", error);
      throw error;
    });
};

export { getID5Id, initiateID5Call };
