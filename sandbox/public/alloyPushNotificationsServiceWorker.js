import { v4 } from "uuid";

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

const openIndexedDb = (dbName, dbVersion, upgradeCallback) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (upgradeCallback) {
        upgradeCallback(db);
      }
    };
  });
};

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

const loggerNamespace = "[alloy][pushNotificationWorker]";
const logger = {
  info: (...args) => console.log(loggerNamespace, ...args),
  error: (...args) => console.error(loggerNamespace, ...args),
};
const canHandleUrl = (type) => ["DEEPLINK", "WEBURL"].includes(type);

const getDataFromIndexedDb = async () => {
  try {
    const db = await openIndexedDb(DB_NAME, DB_VERSION, (db) => {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    });

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

const sendTrackingCall = async ({ xdm, applicationOpened }) => {
  const configData = await getDataFromIndexedDb();
  const { ecid, edgeDomain, edgeBasePath, datastreamId, datasetId } =
    configData || {};

  const requiredFields = [
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

    xdm._experience.customerJourneyManagement = {
      ...xdm._experience.customerJourneyManagement,
      pushChannelContext: {
        platform: "web",
      },
      messageProfile: {
        channel: {
          _id: "https://ns.adobe.com/xdm/channels/push",
        },
      },
    };

    const payload = {
      events: [
        {
          xdm: {
            identityMap: {
              ECID: [{ id: ecid }],
            },
            timestamp: new Date().toISOString(),
            pushNotificationTracking: {
              pushProviderMessageID: v4(),
              pushProvider: "chrome",
            },
            application: {
              launches: {
                value: applicationOpened ? 1 : 0,
              },
            },
            eventType: "pushTracking.applicationOpened",
            ...xdm,
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

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", async (event) => {
  logger.info("push", event); // TODO: remove

  if (!event.data) {
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
    logger.info("notificationData", notificationData); // TODO: remove
  } catch {
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

  return self.registration.showNotification(webData.title, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;
  let targetUrl = null;

  if (event.action) {
    const actionIndex = parseInt(event.action.replace("action_", ""), 10);
    if (data?.actions?.buttons[actionIndex]) {
      const button = data.actions.buttons[actionIndex];
      if (canHandleUrl(button.type) && button.uri) {
        targetUrl = button.uri;
      }
    }
  } else if (canHandleUrl(data?.interaction?.type) && data?.interaction?.uri) {
    targetUrl = data.interaction.uri;
  }

  sendTrackingCall({
    xdm: data._xdm.mixins,
    applicationOpened: true,
  }).catch((error) => {
    logger.error("Failed to send tracking call:", error);
  });

  if (targetUrl) {
    return event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      }),
    );
  }
});

self.addEventListener("notificationclose", (event) => {
  logger.info("Notification close", event); // TODO: remove
  // TODO: add tracking here
});

self.addEventListener("message", (message) => {
  self.registration.showNotification(
    "Notification from message data",
    message.data.data,
  );
});
