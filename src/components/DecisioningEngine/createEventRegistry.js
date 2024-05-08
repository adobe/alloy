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
  getActivityId,
  hasExperienceData,
  getDecisionProvider
} from "./utils";
import { EVENT_TYPE_TRUE } from "../../constants/eventType.js";
import { ADOBE_JOURNEY_OPTIMIZER } from "../../constants/decisionProvider.js";

const STORAGE_KEY = "events";
const MAX_EVENT_RECORDS = 1000;
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
          pruned[eventType][entry.event[prefixed("id")]] = entry;
        });
    });
    return pruned;
  };
};

export default ({ storage }) => {
  let currentStorage = storage;
  let restore;
  let save;
  let events;
  const setStorage = newStorage => {
    currentStorage = newStorage;

    restore = createRestoreStorage(currentStorage, STORAGE_KEY);
    save = createSaveStorage(
      currentStorage,
      STORAGE_KEY,
      createEventPruner(MAX_EVENT_RECORDS, RETENTION_PERIOD)
    );
    events = restore({});
  };

  setStorage(storage);

  const addEvent = (event, eventType, eventId, action) => {
    if (!eventType || !eventId) {
      return undefined;
    }

    if (!events[eventType]) {
      events[eventType] = {};
    }
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

    save(events);

    return events[eventType][eventId];
  };

  const addExperienceEdgeEvent = event => {
    const { xdm = {} } = event.getContent();
    const { _experience } = xdm;

    if (!hasExperienceData(xdm)) {
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

    const validPropositionEventType = propositionEventType =>
      propositionEventTypeObj[propositionEventType] === EVENT_TYPE_TRUE;

    const { id: action } = propositionAction;

    propositionEventTypesList
      .filter(validPropositionEventType)
      .forEach(propositionEventType => {
        propositions.forEach(proposition => {
          if (getDecisionProvider(proposition) !== ADOBE_JOURNEY_OPTIMIZER) {
            return;
          }
          addEvent(
            {},
            propositionEventType,
            getActivityId(proposition),
            action
          );
        });
      });
  };
  const getEvent = (eventType, eventId) => {
    if (!events[eventType]) {
      return undefined;
    }

    return events[eventType][eventId];
  };

  return {
    addExperienceEdgeEvent,
    addEvent,
    getEvent,
    toJSON: () => events,
    setStorage
  };
};
