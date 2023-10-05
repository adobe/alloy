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
import { EVENT_TYPE_TRUE } from "../Personalization/event";
import { getActivityId } from "./utils";

const PREFIX_TO_SUPPORT_INDEX_DB = key => `iam_${key}`;

export default ({ indexedDB }) => {
  const replaceUnderscoreWithDot = record => {
    const updatedRecord = {};
    Object.keys(record).forEach(key => {
      updatedRecord[key.replace("/_/g", ".")] = record[key];
    });
    return updatedRecord;
  };

  const addEvent = (event, eventType, eventId, action) => {
    const record = {
      [PREFIX_TO_SUPPORT_INDEX_DB("id")]: eventId,
      [PREFIX_TO_SUPPORT_INDEX_DB("eventType")]: eventType,
      action,
      timestamp: new Date().getTime()
    };
    return indexedDB.addRecord(record);
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
    return new Promise(resolve => {
      indexedDB.getRecords(eventType, eventId).then(events => {
        resolve(
          events && events.length > 0
            ? events.map(record => replaceUnderscoreWithDot(record))
            : []
        );
      });
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

  return {
    addEvent,
    addExperienceEdgeEvent,
    getEvents,
    getEventsFirstTimestamp,
    getIndexDB: () => indexedDB.getIndexDB()
  };
};
