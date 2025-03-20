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
  getActivityId,
  hasExperienceData,
  getDecisionProvider,
  createRestoreStorage,
  createSaveStorage,
  createEventPruner,
  getPrefixedKey,
} from "./utils/index.js";
import { EVENT_TYPE_TRUE } from "../../constants/eventType.js";
import { ADOBE_JOURNEY_OPTIMIZER } from "../../constants/decisionProvider.js";
import { EVENT_HISTORY_STORAGE_KEY } from "./constants/index.js";

export default ({ storage }) => {
  let currentStorage = storage;
  let restore;
  let save;
  let events;
  const setStorage = (newStorage) => {
    currentStorage = newStorage;

    restore = createRestoreStorage(currentStorage, EVENT_HISTORY_STORAGE_KEY);
    save = createSaveStorage(
      currentStorage,
      EVENT_HISTORY_STORAGE_KEY,
      createEventPruner(),
    );
    events = restore({});
  };

  setStorage(storage);

  const addEvent = ({ eventType, eventId, action } = {}) => {
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
        [getPrefixedKey("id")]: eventId,
        [getPrefixedKey("eventType")]: eventType,
        [getPrefixedKey("action")]: action,
      },
      firstTimestamp,
      timestamp,
      count: count + 1,
    };

    save(events);

    return events[eventType][eventId];
  };

  const addExperienceEdgeEvent = (event) => {
    const { xdm } = event.getContent();

    if (!hasExperienceData(xdm)) {
      return;
    }

    const {
      _experience: {
        decisioning: {
          propositionEventType = {},
          propositionAction: { id: action } = {},
          propositions = [],
        } = {},
      },
    } = xdm;

    Object.keys(propositionEventType)
      .filter(
        (eventType) => propositionEventType[eventType] === EVENT_TYPE_TRUE,
      )
      .forEach((eventType) => {
        propositions.forEach((proposition) => {
          if (getDecisionProvider(proposition) !== ADOBE_JOURNEY_OPTIMIZER) {
            return;
          }

          addEvent({
            eventType,
            eventId: getActivityId(proposition),
            action,
          });
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
    setStorage,
  };
};
