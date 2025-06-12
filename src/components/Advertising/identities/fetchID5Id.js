/**
 * ID5 identity fetch implementation
 * Loads the ID5 script and retrieves the ID5 user ID
 */

let id5Id = "";
let inProgressPromise = null; // Store the in-progress promise

const getScriptElement = function getScriptElement(url) {
  const scriptTag = document.createElement("script");
  scriptTag.language = "Javascript";
  scriptTag.type = "text/javascript";
  scriptTag.src = url;
  return scriptTag;
};

const initiateID5Call = function initiateID5Call(partnerId) {
  partnerId = Math.floor(Number(partnerId));
  // If there's already a fetch in progress, return that promise
  if (inProgressPromise) {
    return inProgressPromise;
  }

  // Create a new promise and store it
  inProgressPromise = new Promise((resolve, reject) => {
    if (!partnerId) {
      inProgressPromise = null; // Clear stored promise on failure
      reject(new Error("ID5 partner ID is required"));
      return;
    }

    // Function to handle ID5 initialization once script is loaded
    const handleId5 = function handleId5() {
      try {
        const id5Instance = window.ID5.init({ partnerId });
        id5Id = id5Instance.getUserId();

        if (id5Id !== undefined && id5Id !== "") {
          resolve(id5Id);
          inProgressPromise = null; // Clear stored promise on success
        } else {
          // First retry with timeout
          window.ID5.init({ partnerId }).onAvailable(function firstRetry(
            retryStatus,
          ) {
            id5Id = retryStatus.getUserId();
            if (id5Id !== undefined && id5Id !== "") {
              resolve(id5Id);
              inProgressPromise = null; // Clear stored promise on success
            } else {
              // Second retry with additional timeout
              window.ID5.init({ partnerId }).onAvailable(function secondRetry(
                secondRetryStatus,
              ) {
                id5Id = secondRetryStatus.getUserId();
                if (id5Id !== undefined && id5Id !== "") {
                  resolve(id5Id);
                } else {
                  reject(
                    new Error("Failed to get ID5 ID after multiple attempts"),
                  );
                }
                inProgressPromise = null; // Clear stored promise regardless of outcome
              }, 1000); // 1 second timeout
            }
          }, 1000); // 1 second timeout
        }
      } catch (error) {
        reject(error);
        inProgressPromise = null; // Clear stored promise on error
      }
    };

    // Load the ID5 script if not already loaded
    if (typeof window.ID5 !== "undefined") {
      handleId5();
    } else {
      const script = getScriptElement(
        "https://www.everestjs.net/static/id5-api.js",
      );

      if (script.addEventListener) {
        script.addEventListener("load", handleId5, false);
      } else {
        script.attachEvent("onload", handleId5);
      }

      script.onerror = function scriptError() {
        reject(new Error("Failed to load ID5 script"));
        inProgressPromise = null; // Clear stored promise on error
      };

      if (document.body !== undefined) {
        document.body.appendChild(script);
      } else {
        document.head.appendChild(script);
      }
    }
  });

  return inProgressPromise;
};

// Store id5Id in cookie using sessionManager
const storeID5InCookie = function storeID5InCookie(sessionManager, id5IdValue) {
  if (sessionManager && id5IdValue) {
    try {
      sessionManager.setValue("id5_id", id5IdValue);
      return true;
    } catch {
      // Handle error silently for production
      return false;
    }
  }
  return false;
};

// Expose function to get the current id5Id
const getID5Id = function getID5Id(
  partnerId,
  sessionManager,
  resolveID5IfNotAvailable = true,
) {
  // Check if ID5 ID is already initialized in memory
  if (id5Id && id5Id !== "") {
    return Promise.resolve(id5Id);
  }

  // If not in memory, check if available in cookie using sessionManager
  if (sessionManager) {
    try {
      const cookieID5Id = sessionManager.getValue("id5_id");
      if (cookieID5Id) {
        // Update in-memory value
        id5Id = cookieID5Id;
        return Promise.resolve(cookieID5Id);
      }
    } catch {
      // Handle error silently for production
    }
  }
  if (resolveID5IfNotAvailable) {
    // If not in memory or cookie, initialize and store in cookie
    return initiateID5Call(partnerId).then((resolvedId) => {
      if (sessionManager) {
        storeID5InCookie(sessionManager, resolvedId);
      }
      return resolvedId;
    });
  }
  return Promise.resolve(null);
};

// Export the functions for use in other modules
export { getID5Id, initiateID5Call };
