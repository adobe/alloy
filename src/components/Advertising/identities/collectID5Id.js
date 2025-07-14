/**
 * ID5 identity fetch implementation
 * Loads the ID5 script and retrieves the ID5 user ID
 */

let id5Id = "";
let inProgressId5Promise = null; // Store the in-progress promise

const getScriptElement = function getScriptElement(url) {
  const scriptTag = document.createElement("script");
  scriptTag.language = "Javascript";
  scriptTag.type = "text/javascript";
  scriptTag.src = url;
  return scriptTag;
};

const loadScript = function loadScript(script, handleId5, logger) {
  return new Promise((resolve, reject) => {
    const appendScript = () => {
      try {
        if (document.head) {
          logger.info("Appending script to head");
          document.head.appendChild(script);
        } else if (document.body) {
          logger.info("Appending script to body");
          document.body.appendChild(script);
        } else {
          logger.error("Neither head nor body available for script insertion");
          reject(new Error("DOM not ready for script insertion"));
        }
      } catch (error) {
        logger.error("Error appending script", error);
        reject(error);
      }
    };

    if (script.addEventListener) {
      logger.info("Adding modern event listener for script load");
      script.addEventListener(
        "load",
        () => {
          logger.info("ID5 script loaded successfully");
          if (typeof window.ID5 === "undefined") {
            logger.warn("Script loaded but ID5 object not initialized");
          }
          handleId5();
          resolve();
        },
        false,
      );
      script.addEventListener("error", (error) => {
        logger.error("Failed to load ID5 script", error);
        reject(new Error("Failed to load ID5 script"));
      });
    } else {
      logger.info("Adding legacy event handler for script load");
      script.attachEvent("onload", () => {
        logger.info("ID5 script loaded successfully (legacy)");
        handleId5();
        resolve();
      });
      script.attachEvent("onerror", (error) => {
        logger.error("Failed to load ID5 script (legacy)", error);
        reject(new Error("Failed to load ID5 script"));
      });
    }

    if (document.readyState === "loading") {
      logger.info("DOM not ready, waiting for DOMContentLoaded");
      document.addEventListener("DOMContentLoaded", appendScript);
    } else {
      logger.info("DOM ready, appending script immediately");
      appendScript();
    }
  });
};

const initiateID5Call = function initiateID5Call(partnerId, logger) {
  partnerId = Math.floor(Number(partnerId));
  logger.info("Initiating ID5 call", { partnerId });

  if (inProgressId5Promise) {
    logger.info("Returning existing in-progress ID5 promise");
    return inProgressId5Promise;
  }

  inProgressId5Promise = new Promise((resolve, reject) => {
    if (!partnerId) {
      logger.error("Missing partner ID");
      inProgressId5Promise = null;
      reject(new Error("ID5 partner ID is required"));
      return;
    }

    const handleId5 = function handleId5() {
      logger.info("Handling ID5 initialization");
      try {
        logger.info("Initializing ID5 instance", { partnerId });
        const id5Instance = window.ID5.init({ partnerId });
        id5Id = id5Instance.getUserId();
        logger.info("Got initial ID5 user ID", { id5Id });

        if (id5Id !== undefined && id5Id !== "") {
          logger.info("Valid ID5 ID received immediately", { id5Id });
          resolve(id5Id);
          inProgressId5Promise = null;
        } else {
          logger.info("No immediate ID5 ID, starting retry process");
          window.ID5.init({ partnerId }).onAvailable(function firstRetry(
            retryStatus,
          ) {
            logger.info("First retry attempt");
            id5Id = retryStatus.getUserId();
            logger.info("First retry ID5 result", { id5Id });

            if (id5Id !== undefined && id5Id !== "") {
              logger.info("Valid ID5 ID received on first retry", { id5Id });
              resolve(id5Id);
              inProgressId5Promise = null;
            } else {
              logger.info("No ID5 ID on first retry, attempting second retry");
              window.ID5.init({ partnerId }).onAvailable(function secondRetry(
                secondRetryStatus,
              ) {
                logger.info("Second retry attempt");
                id5Id = secondRetryStatus.getUserId();
                logger.info("Second retry ID5 result", { id5Id });

                if (id5Id !== undefined && id5Id !== "") {
                  logger.info("Valid ID5 ID received on second retry", {
                    id5Id,
                  });
                  resolve(id5Id);
                } else {
                  logger.info(
                    "No ID5 ID on Second retry, attempting third retry",
                  );
                  window.ID5.init({ partnerId }).onAvailable(
                    function thirdRetry(thirdRetryStatus) {
                      logger.info("Thrid retry attempt");
                      id5Id = thirdRetryStatus.getUserId();
                      logger.info("Third retry ID5 result", { id5Id });

                      if (id5Id !== undefined && id5Id !== "") {
                        logger.info("Valid ID5 ID received on third retry", {
                          id5Id,
                        });
                        resolve(id5Id);
                      } else {
                        logger.error("Failed to get ID5 ID after all retries");
                      }
                      inProgressId5Promise = null;
                    },
                    2000,
                  );
                }
                inProgressId5Promise = null;
              }, 2000);
            }
          }, 2000);
        }
      } catch (error) {
        logger.error("Error during ID5 initialization", error);
        reject(error);
        inProgressId5Promise = null;
      }
    };

    if (typeof window.ID5 !== "undefined") {
      logger.info("ID5 script already loaded");
      handleId5();
    } else {
      logger.info("Loading ID5 script");
      const script = getScriptElement(
        "https://www.everestjs.net/static/id5-api.js",
      );

      loadScript(script, handleId5, logger).catch((error) => {
        logger.error("Script loading failed", error);
        inProgressId5Promise = null;
        reject(error);
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
  logger.info("getID5Id called", { partnerId });

  if (id5Id && id5Id !== "") {
    logger.info("Returning cached ID5 ID", { id5Id });
    return Promise.resolve(id5Id);
  }
  if (!resolveId5IfNotAvailable) {
    logger.info("Not resolving ID5 ID, returning empty promise");
    return Promise.resolve(null);
  }
  return initiateID5Call(partnerId, logger)
    .then((resolvedId) => {
      logger.info("Successfully resolved ID5 ID", { resolvedId });
      return resolvedId;
    })
    .catch((error) => {
      logger.error("Failed to get ID5 ID", error);
      throw error;
    });
};

export { getID5Id, initiateID5Call };
