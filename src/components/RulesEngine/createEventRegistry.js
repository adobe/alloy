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
  generateEventHash,
} from "./utils/index.js";
import { EVENT_TYPE_TRUE } from "../../constants/eventType.js";
import { ADOBE_JOURNEY_OPTIMIZER } from "../../constants/decisionProvider.js";
import {
  EVENT_HISTORY_STORAGE_KEY,
  EVENT_HISTORY_MAX_LENGTH,
} from "./constants/index.js";

export default ({ storage, logger }) => {
  let currentStorage = storage;
  let restore;
  let save;
  let events;
  let size;

  const setStorage = (newStorage) => {
    currentStorage = newStorage;

    restore = createRestoreStorage(currentStorage, EVENT_HISTORY_STORAGE_KEY);
    save = createSaveStorage(currentStorage, EVENT_HISTORY_STORAGE_KEY);
    [events, size] = restore({});

    if (size > EVENT_HISTORY_MAX_LENGTH) {
      const eventPruner = createEventPruner();
      events = eventPruner(events);
      save(events);
    }
  };

  setStorage(storage);

  const addEvent = (o = {}) => {
    const { eventType, eventId } = o;

    if (!eventType || !eventId) {
      return undefined;
    }

    const timestamp = new Date().getTime();
    const eventHash = generateEventHash(o);

    if (!events[eventHash] || !Array.isArray(events[eventHash].timestamps)) {
      events[eventHash] = {
        timestamps: [],
      };
    }

    events[eventHash].timestamps.push(timestamp);
    events[eventHash].timestamps.sort();

    logger.info(
      "[Event History] Added event for",
      o,
      "with hash",
      eventHash,
      "and timestamp",
      timestamp,
    );

    save(events);

    return events[eventHash];
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
            eventId: getActivityId(proposition),
            eventType,
            action,
          });
        });
      });
  };

  const getEvent = (eventType, eventId) => {
    const h = generateEventHash({ eventType, eventId });

    if (!events[h]) {
      return undefined;
    }

    return events[h];
  };

  return {
    addExperienceEdgeEvent,
    addEvent,
    getEvent,
    toJSON: () => events,
    setStorage,
  };
};
