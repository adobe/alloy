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
import { EVENT_TYPE_TRUE } from "../Personalization/event";
import { getActivityId } from "./utils";

const dbName = HISTORICAL_DATA_STORE;
const PREFIX_TO_SUPPORT_INDEX_DB = key => `iam_${key}`;

export default () => {
  let db;

  const replaceUnderscoreWithDot = record => {
    const updatedRecord = {};
    Object.keys(record).forEach(key => {
      updatedRecord[key.replace("/_/g", ".")] = record[key];
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
      };

      request.onsuccess = event => {
        db = event.target.result;
        console.log("IndexedDB setup complete");
        resolve(true);
      };
    });
  };

  const addEvent = (event, eventType, eventId, action) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("events", "readwrite");
      const objectStore = transaction.objectStore("events");
      const record = {
        [PREFIX_TO_SUPPORT_INDEX_DB("id")]: eventId,
        [PREFIX_TO_SUPPORT_INDEX_DB("eventType")]: eventType,
        action,
        timestamp: new Date().getTime()
      };

      const objectStoreRequest = objectStore.add(record);

      objectStoreRequest.onerror = txEvent => {
        const dbRequest = txEvent.target;
        reject(dbRequest.error);
      };

      objectStoreRequest.onsuccess = () => {
        resolve(true);
      };
    });
  };

  const addExperienceEdgeEvent = event => {
    const { xdm = {} } = event.getContent();
    const { eventType = "", _experience } = xdm;

    if (
      !eventType ||
      !_experience ||
      typeof _experience !== "object" ||
      eventType === ""
    ) {
      return;
    }

    const { decisioning = {} } = _experience;
    const {
      propositionEventType: propositionEventTypeObj = {},
      propositionAction = {},
      propositions = []
    } = decisioning;

    const propositionEventTypesList = Object.keys(propositionEventTypeObj);

    // https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=CJM&title=Proposition+Event+Types
    if (propositionEventTypesList.length === 0) {
      return;
    }

    const { id: action } = propositionAction;

    propositionEventTypesList.forEach(propositionEventType => {
      if (propositionEventTypeObj[propositionEventType] === EVENT_TYPE_TRUE) {
        propositions.forEach(proposition => {
          addEvent(
            {},
            propositionEventType,
            getActivityId(proposition),
            action
          );
        });
      }
    });
  };

  const getEvents = (eventType, eventId) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("events", "readonly");
      const objectStore = transaction.objectStore("events");
      const index = objectStore.index("iam_id_iam_eventType_index");

      const request = index.getAll([eventId, eventType]);

      request.onsuccess = eventObjStore => {
        const dbRequest = eventObjStore.target;
        const data = dbRequest
          ? dbRequest.result.map(record => replaceUnderscoreWithDot(record))
          : [];
        resolve(data);
      };

      request.onerror = eventObjStore => {
        const dbRequest = eventObjStore.target;
        reject(dbRequest.error);
      };
    });
  };

  const getEventsFirstTimestamp = (eventType, eventId) => {
    return new Promise(resolve => {
      getEvents(eventType, eventId).then(events => {
        if (!events || events.length === 0) {
          resolve(undefined);
          return;
        }

        resolve(
          events.reduce(
            (earliestTimestamp, currentEvent) =>
              earliestTimestamp < currentEvent.timestamp
                ? earliestTimestamp
                : currentEvent.timestamp,
            events[0].timestamp
          )
        );
      });
    });
  };

  setupIndexedDB()
    .then(() => {})
    .catch(error => {
      console.error("error message: ", error.message);
    });

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
    addEvent,
    addExperienceEdgeEvent,
    clearIndexedDB,
    getEvents,
    getEventsFirstTimestamp,
    getIndexDB: () => db
  };
};
