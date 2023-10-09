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
import { HISTORICAL_DATA_STORE } from "./constants";

const dbName = HISTORICAL_DATA_STORE;

export default () => {
  let db;
  const DB_INITIALIZATION_TIMEOUT = 200;

  const setupIndexedDB = () => {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("This browser doesn't support IndexedDB."));
      }

      const request = indexedDB.open(dbName, 1);

      request.onerror = event => {
        const dbRequest = event.target;
        reject(dbRequest.error);
      };

      request.onupgradeneeded = event => {
        db = event.target.result;

        const objectStore = db.createObjectStore("events", {
          keyPath: "id",
          autoIncrement: true
        });
        objectStore.createIndex(
          "iam_id_iam_eventType_index",
          ["iam_id", "iam_eventType"],
          { unique: false }
        );
      };

      request.onsuccess = event => {
        db = event.target.result;
        resolve(true);
      };
    });
  };

  const waitForDBInitialization = fn => {
    // Wait for db to be ready.
    if (db) {
      fn();
    } else {
      setTimeout(() => {
        waitForDBInitialization(fn);
      }, DB_INITIALIZATION_TIMEOUT);
    }
  };

  const addRecord = record => {
    return new Promise((resolve, reject) => {
      waitForDBInitialization(() => {
        const transaction = db.transaction("events", "readwrite");
        const objectStore = transaction.objectStore("events");
        const objectStoreRequest = objectStore.add(record);

        objectStoreRequest.onerror = txEvent => {
          const dbRequest = txEvent.target;
          reject(dbRequest.error);
        };

        objectStoreRequest.onsuccess = () => {
          resolve(true);
        };
      });
    });
  };

  const getRecords = (eventType, eventId) => {
    return new Promise((resolve, reject) => {
      waitForDBInitialization(() => {
        const transaction = db.transaction("events", "readonly");
        const objectStore = transaction.objectStore("events");
        const index = objectStore.index("iam_id_iam_eventType_index");
        const request = index.getAll([eventId, eventType]);

        request.onsuccess = eventObjStore => {
          const dbRequest = eventObjStore.target;
          resolve(dbRequest ? dbRequest.result : []);
        };

        request.onerror = eventObjStore => {
          const dbRequest = eventObjStore.target;
          reject(dbRequest.error);
        };
      });
    });
  };

  const clearIndexedDB = () => {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction("events", "readwrite");
        const objectStore = transaction.objectStore("events");
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve(true);
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  return {
    setupIndexedDB,
    addRecord,
    clearIndexedDB,
    getRecords,
    getIndexDB: () => db
  };
};
