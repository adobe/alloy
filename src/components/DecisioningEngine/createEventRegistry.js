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
import {
  createRestoreStorage,
  createSaveStorage,
  getExpirationDate,
  getActivityId
} from "./utils";
import { EVENT_TYPE_TRUE } from "../Personalization/event";

const STORAGE_KEY = "events";
const MAX_EVENT_RECORDS = 1000;
const DEFAULT_SAVE_DELAY = 500;
const RETENTION_PERIOD = 30;

const prefixed = key => `iam.${key}`;
export const createEventPruner = (
  limit = MAX_EVENT_RECORDS,
  retentionPeriod = RETENTION_PERIOD
) => {
  return events => {
    const pruned = {};
    Object.keys(events).forEach(eventType => {
      pruned[eventType] = {};
      Object.values(events[eventType])
        .filter(
          entry =>
            new Date(entry.firstTimestamp) >= getExpirationDate(retentionPeriod)
        )
        .sort((a, b) => a.firstTimestamp - b.firstTimestamp)
        .slice(-1 * limit)
        .forEach(entry => {
          pruned[eventType][entry.event.id] = entry;
        });
    });
    return pruned;
  };
};

export default ({ storage, saveDelay = DEFAULT_SAVE_DELAY }) => {
  const restore = createRestoreStorage(storage, STORAGE_KEY);
  const save = createSaveStorage(
    storage,
    STORAGE_KEY,
    saveDelay,
    createEventPruner(MAX_EVENT_RECORDS, RETENTION_PERIOD)
  );

  const events = restore({});
  const addEvent = (event, eventType, eventId, action) => {
    if (!events[eventType]) {
      events[eventType] = {};
    }
    console.log("what is this events", events);
    console.log("events before adding", events[eventType][eventId]);
    const existingEvent = events[eventType][eventId];

    const count = existingEvent ? existingEvent.count : 0;
    const timestamp = new Date().getTime();
    const firstTimestamp = existingEvent
      ? existingEvent.firstTimestamp || existingEvent.timestamp
      : timestamp;

    events[eventType][eventId] = {
      event: {
        ...event,
        [prefixed("id")]: eventId,
        [prefixed("eventType")]: eventType,
        [prefixed("action")]: action
      },
      firstTimestamp,
      timestamp,
      count: count + 1
    };

    console.log("events being saved is", events);

    save(events);

    return events[eventType][eventId];
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
  const getEvent = (eventType, eventId) => {
    if (!events[eventType]) {
      return undefined;
    }

    return events[eventType][eventId];
  };

  return { addExperienceEdgeEvent, addEvent, getEvent, toJSON: () => events };
};
