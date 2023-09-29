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

  const replaceDotsWithUnderscores = record => {
    const updatedRecord = {};
    Object.keys(record).forEach(key => {
      updatedRecord[key.replace(/\./g, "_")] = record[key];
    });
    return updatedRecord;
  };

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
        objectStore.createIndex(
          "ajo_id_ajo_eventType_index",
          ["ajo_id", "ajo_eventType"],
          { unique: false }
        );
      };

      request.onsuccess = event => {
        db = event.target.result;
        resolve(true);
      };
    });
  };

  const addEvent = records => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("events", "readwrite");
      const objectStore = transaction.objectStore("events");

      console.log("CreateHistoricalRegistry.addRecordToIndexedDB start");
      console.log("Records: ", records);

      records.forEach(record => {
        const updatedRecord = replaceDotsWithUnderscores(record);
        objectStore.add(updatedRecord);
      });

      transaction.onerror = event => {
        const dbRequest = event.target;
        reject(dbRequest.error);
      };

      transaction.onsuccess = () => {
        // const updatedRecord = replaceDotsWithUnderscores(records[0]);
        // objectStore.add(updatedRecord);
        resolve(true);
      };
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

  // const getEvent = (eventType, eventId) => {
  //   // if (!events[eventType]) {
  //   //   return undefined;
  //   // }
  //   //
  //   // return events[eventType][eventId];
  // };

  setupIndexedDB()
    .then(() => {
      console.log("IndexedDB setup complete.");
    })
    .catch(error => {
      console.error(error);
    });

  return {
    setupIndexedDB,
    addEvent,
    clearIndexedDB,
    getIndexDB: () => db
  };
};
