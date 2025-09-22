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

/**
 * @param {string} dbName
 * @param {number} dbVersion
 * @param {Function} [upgradeCallback] - Optional callback function to handle database upgrades.
 *   Called with the database instance when the database is being upgraded.
 * @returns {Promise<IDBDatabase>}
 */
const openIndexedDb = (dbName, dbVersion, upgradeCallback) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = /** @type {IDBOpenDBRequest} */ (event.target).result;
      if (upgradeCallback) {
        upgradeCallback(db);
      }
    };
  });
};

/**
 * @param {IDBDatabase} db
 * @param {string} storeName
 * @param {string|number|Date|ArrayBuffer|Array} key
 *
 * @returns {Promise<any>}
 */
const getFromIndexedDbStore = (db, storeName, key) => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

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

const DB_NAME = "alloyPushNotifications";
const DB_VERSION = 1;
const STORE_NAME = "config";
const INDEX_KEY = "alloyConfig";

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

/**
 * @param {ServiceWorkerLogger} logger
 * @returns {Promise<Object|undefined>}
 * @throws {Error}
 */
var readFromIndexedDb = async (logger) => {
  try {
    const db = await openIndexedDb(
      DB_NAME,
      DB_VERSION,
      (/** @type {IDBDatabase} */ db) => {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    );

    const existingConfigData = await getFromIndexedDbStore(
      db,
      STORE_NAME,
      INDEX_KEY,
    );

    db.close();

    return existingConfigData;
  } catch (error) {
    logger.error("Failed to read data from IndexedDB", { error });
  }
};

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (
    byteToHex[arr[offset + 0]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    "-" +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    "-" +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    "-" +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    "-" +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}

let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    if (typeof crypto === "undefined" || !crypto.getRandomValues) {
      throw new Error(
        "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported",
      );
    }
    getRandomValues = crypto.getRandomValues.bind(crypto);
  }
  return getRandomValues(rnds8);
}

const randomUUID =
  typeof crypto !== "undefined" &&
  crypto.randomUUID &&
  crypto.randomUUID.bind(crypto);
var native = { randomUUID };

function v4(options, buf, offset) {
  if (native.randomUUID && true && !options) {
    return native.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  return unsafeStringify(rnds);
}

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

/**
 * @async
 * @function
 * @param {Object} options
 * @param {Object} options.xdm
 * @param {string} [options.actionLabel]
 * @param {number} [options.applicationLaunches=0]
 * @param {Object} utils
 * @param {ServiceWorkerLogger} utils.logger
 * @param {Function} utils.fetch
 *
 * @returns {Promise<boolean>}
 * @throws {Error}
 */
var makeSendServiceWorkerTrackingData = async (
  { xdm, actionLabel, applicationLaunches = 0 },
  { logger, fetch },
) => {
  const configData = await readFromIndexedDb(logger);
  const { browser, ecid, edgeDomain, edgeBasePath, datastreamId, datasetId } =
    configData || {};
  let customActionData = {};

  if (actionLabel) {
    customActionData = {
      customAction: { actionID: actionLabel },
    };
  }

  const requiredFields = [
    { name: "browser", errorField: "Browser" },
    { name: "ecid", errorField: "ECID" },
    {
      name: "edgeDomain",
      errorField: "Edge domain",
    },
    {
      name: "edgeBasePath",
      errorField: "Edge base path",
    },
    {
      name: "datastreamId",
      errorField: "Datastream ID",
    },
    {
      name: "datasetId",
      errorField: "Dataset ID",
    },
  ];

  try {
    for (const field of requiredFields) {
      if (!configData[field.name]) {
        throw new Error(
          `Cannot send tracking call. ${field.errorField} is missing.`,
        );
      }
    }

    const url = `https://${edgeDomain}/${edgeBasePath}/v1/interact?configId=${datastreamId}`;

    /** @type {TrackingDataPayload} */
    const payload = {
      events: [
        {
          xdm: {
            identityMap: {
              ECID: [{ id: ecid }],
            },
            timestamp: new Date().toISOString(),
            pushNotificationTracking: {
              ...customActionData,
              pushProviderMessageID: v4(),
              pushProvider: browser.toLowerCase(),
            },
            application: {
              launches: {
                value: applicationLaunches,
              },
            },
            eventType: actionLabel
              ? "pushTracking.customAction"
              : "pushTracking.applicationOpened",
            _experience: {
              ...xdm._experience,
              customerJourneyManagement: {
                ...xdm._experience.customerJourneyManagement,
                pushChannelContext: {
                  platform: "web",
                },
                messageProfile: {
                  channel: {
                    _id: "https://ns.adobe.com/xdm/channels/push",
                  },
                },
              },
            },
          },
          meta: {
            collect: {
              datasetId,
            },
          },
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "text/plain; charset=UTF-8",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error(
        "Tracking call failed: ",
        response.status,
        response.statusText,
      );
      return false;
    }

    return true;
  } catch (error) {
    logger.error("Error sending tracking call:", error);
    return false;
  }
};

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

/**
 * @param {string} type
 * @returns {boolean}
 */
const canHandleUrl = (type) => ["DEEPLINK", "WEBURL"].includes(type);

/**
 * @function
 *
 * @param {Object} options
 * @param {ServiceWorkerGlobalScope} options.sw
 * @param {NotificationEvent} options.event
 * @param {Function} options.fetch
 * @param {ServiceWorkerLogger} options.logger
 */
var serviceWorkerNotificationClickListener = ({ event, sw, logger, fetch }) => {
  event.notification.close();

  const data = event.notification.data;
  let targetUrl = null;
  let actionLabel = null;

  if (event.action) {
    const actionIndex = parseInt(event.action.replace("action_", ""), 10);
    if (data?.actions?.buttons[actionIndex]) {
      const button = data.actions.buttons[actionIndex];
      actionLabel = button.label;
      if (canHandleUrl(button.type) && button.uri) {
        targetUrl = button.uri;
      }
    }
  } else if (canHandleUrl(data?.interaction?.type) && data?.interaction?.uri) {
    targetUrl = data.interaction.uri;
  }

  makeSendServiceWorkerTrackingData(
    {
      // eslint-disable-next-line no-underscore-dangle
      xdm: data._xdm.mixins,
      actionLabel,
      applicationLaunches: 1,
    },
    {
      logger,
      fetch,
    },
  ).catch((error) => {
    logger.error("Failed to send tracking call:", error);
  });

  if (targetUrl) {
    event.waitUntil(
      sw.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(targetUrl);
        }
      }),
    );
  }
};

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

// @ts-check
/// <reference lib="webworker" />

/** @import {  PushNotificationData  } from '../types.js' */
/** @import { ServiceWorkerLogger } from '../types.js' */

/**
 * @async
 * @function
 *
 * @param {Object} options
 * @param {ServiceWorkerGlobalScope} options.sw
 * @param {PushEvent} options.event
 * @param {ServiceWorkerLogger} options.logger
 * @returns {Promise<void>}
 */
var serviceWorkerPushListener = async ({ sw, event, logger }) => {
  if (!event.data) {
    return;
  }

  /** @type {PushNotificationData} */
  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (error) {
    logger.error("Error decoding notification JSON data:", error);
    return;
  }

  const webData = notificationData.web;
  if (!webData?.title) {
    return;
  }

  const notificationOptions = {
    body: webData.body,
    icon: webData.media,
    image: webData.media,
    data: webData,
    actions: [],
  };

  Object.keys(notificationOptions).forEach((k) => {
    if (notificationOptions[k] == null) {
      delete notificationOptions[k];
    }
  });

  if (webData.actions && webData.actions.buttons) {
    notificationOptions.actions = webData.actions.buttons.map(
      (button, index) => ({
        action: `action_${index}`,
        title: button.label,
      }),
    );
  }

  return sw.registration.showNotification(webData.title, notificationOptions);
};

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

/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope} */
// @ts-ignore
const sw = self;

/**
 * @type {ServiceWorkerLogger}
 */
const logger = {
  namespace: "[alloy][pushNotificationWorker]",
  info: (...args) => console.log(logger.namespace, ...args),
  error: (...args) => console.error(logger.namespace, ...args),
};

/**
 * @listens install
 */
sw.addEventListener("install", () => {
  sw.skipWaiting();
});

/**
 * @listens activate
 * @param {ExtendableEvent} event
 */
sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});

/**
 * @listens push
 * @param {PushEvent} event
 * @returns {Promise<void>}
 */
sw.addEventListener("push", (event) =>
  serviceWorkerPushListener({ event, logger, sw }),
);

/**
 * @listens notificationclick
 * @param {NotificationEvent} event
 */
sw.addEventListener("notificationclick", (event) =>
  serviceWorkerNotificationClickListener({ event, sw, logger, fetch }),
);

/**
 * @listens notificationclose
 * @param {NotificationEvent} event
 */
sw.addEventListener("notificationclose", (event) => {
  const data = event.notification.data;

  makeSendServiceWorkerTrackingData(
    {
      xdm: data._xdm.mixins,
      actionLabel: "Dismiss",
    },
    {
      logger,
      fetch,
    },
  ).catch((error) => {
    logger.error("Failed to send tracking call:", error);
  });
});
