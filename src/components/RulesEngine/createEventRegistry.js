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

/** @import { EventData, EventPayload, EventRecord, EventRegistry } from './types.js' */

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
  INSERT_OPERATION,
  INSERT_IF_NOT_EXISTS_OPERATION,
} from "./constants/index.js";

/**
 * Creates an event registry to track and manage events
 * @param {Object} options - The options object
 * @param {Object} options.storage - The storage object used to persist events
 * @param {Object} options.logger - The logger object used for logging
 * @returns {Object} The event registry interface
 */
export default ({ storage, logger }) => {
  let currentStorage = storage;
  let save;

  /** @type {EventRegistry} */
  let eventRegistry;

  /** @type {number} */
  let eventRegistrySize;

  /**
   * Sets a new storage object for the event registry
   * @param {Object} newStorage
   */
  const setStorage = (newStorage) => {
    currentStorage = newStorage;

    const restore = createRestoreStorage(
      currentStorage,
      EVENT_HISTORY_STORAGE_KEY,
    );

    save = createSaveStorage(currentStorage, EVENT_HISTORY_STORAGE_KEY);

    [eventRegistry, eventRegistrySize] = restore({});

    if (eventRegistrySize > EVENT_HISTORY_MAX_LENGTH) {
      const eventPruner = createEventPruner();
      eventRegistry = eventPruner(eventRegistry);
      save(eventRegistry);
    }
  };

  setStorage(storage);

  /**
   * Adds a single event to the event registry
   * @param {EventData} event
   * @param {string} operation
   * @returns {EventRecord|undefined}
   */
  const addEvent = (
    event = { eventType: null, eventId: null },
    operation = INSERT_OPERATION,
  ) => {
    const { eventType, eventId } = event;

    if (!eventType || !eventId) {
      return undefined;
    }

    const eventHash = generateEventHash(event);

    if (
      operation === INSERT_IF_NOT_EXISTS_OPERATION &&
      eventRegistry[eventHash]
    ) {
      return undefined;
    }

    if (
      !eventRegistry[eventHash] ||
      !Array.isArray(eventRegistry[eventHash].timestamps)
    ) {
      eventRegistry[eventHash] = {
        timestamps: [],
      };
    }

    const timestamp = new Date().getTime();

    eventRegistry[eventHash].timestamps.push(timestamp);
    eventRegistry[eventHash].timestamps.sort();

    logger.info(
      "[Event History] Added event for",
      event,
      "with hash",
      eventHash,
      "and timestamp",
      timestamp,
    );

    save(eventRegistry);

    return eventRegistry[eventHash];
  };

  /**
   * Adds multiple events to the event registry
   * @param {Array<EventPayload>} eventPayloads
   * @returns {Array<EventRecord>}
   */
  const addEventPayloads = (eventPayloads = []) =>
    eventPayloads.map(({ operation, event }) => addEvent(event, operation));

  /**
   * Processes and adds Experience Edge events to the registry
   * @param {Object} event - The Experience Edge event object
   * @returns {void}
   */
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

  /**
   * Retrieves an event from the registry based on type and ID
   * @param {string} eventType - The type of the event to retrieve
   * @param {string} eventId - The ID of the event to retrieve
   * @returns {EventRecord|undefined} The event object if found, otherwise undefined
   */
  const getEvent = (eventType, eventId) => {
    const h = generateEventHash({ eventType, eventId });

    if (!eventRegistry[h]) {
      return undefined;
    }

    return eventRegistry[h];
  };

  return {
    addExperienceEdgeEvent,
    addEvent,
    addEventPayloads,
    getEvent,
    toJSON: () => eventRegistry,
    setStorage,
  };
};
