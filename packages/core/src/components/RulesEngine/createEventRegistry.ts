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
  INSERT_OPERATION,
  INSERT_IF_NOT_EXISTS_OPERATION,
} from "./constants/index.js";
import type { Event, Logger } from "../../core/types.js";
import type { EventStorage } from "./utils/storage.js";
import type {
  EventData,
  EventPayload,
  EventRecord,
  EventRegistry,
  Proposition,
} from "./types.js";

export interface CreateEventRegistryOptions {
  /** The storage used to persist events. */
  storage: EventStorage;
  logger: Logger;
}

export interface EventRegistryApi {
  addExperienceEdgeEvent: (event: Pick<Event, "getContent">) => void;
  addEvent: (event?: EventData, operation?: string) => EventRecord | undefined;
  addEventPayloads: (
    eventPayloads?: EventPayload[],
  ) => (EventRecord | undefined)[];
  getEvent: (
    eventType: string,
    eventId: string | undefined,
  ) => EventRecord | undefined;
  toJSON: () => EventRegistry;
  setStorage: (newStorage: EventStorage) => Promise<void>;
}

/** The `_experience.decisioning` fields the registry reads from XDM. */
interface ExperienceXdm {
  _experience: {
    decisioning?: {
      propositionEventType?: Record<string, unknown>;
      propositionAction?: { id?: string };
      propositions?: Proposition[];
    };
  };
}

/**
 * Creates an event registry to track and manage events
 */
export default ({
  storage,
  logger,
}: CreateEventRegistryOptions): EventRegistryApi => {
  let currentStorage = storage;

  // Initialized to safe defaults so the registry is usable immediately;
  // setStorage updates them asynchronously when switching to persistent storage.
  let eventRegistry: EventRegistry = {};

  let eventRegistrySize = 0;

  let save = createSaveStorage(storage, EVENT_HISTORY_STORAGE_KEY);

  /**
   * Sets a new storage object for the event registry
   */
  const setStorage = async (newStorage: EventStorage) => {
    currentStorage = newStorage;

    const restore = createRestoreStorage(
      currentStorage,
      EVENT_HISTORY_STORAGE_KEY,
    );

    [eventRegistry, eventRegistrySize] = await restore<EventRegistry>({});

    save = createSaveStorage(currentStorage, EVENT_HISTORY_STORAGE_KEY);

    if (eventRegistrySize > EVENT_HISTORY_MAX_LENGTH) {
      const eventPruner = createEventPruner();
      eventRegistry = eventPruner(eventRegistry);
      save(eventRegistry);
    }
  };

  setStorage(storage);

  /**
   * Adds a single event to the event registry
   */
  const addEvent = (
    event: EventData = { eventType: null, eventId: null },
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
   */
  const addEventPayloads = (eventPayloads: EventPayload[] = []) =>
    eventPayloads.map(({ operation, event }) => addEvent(event, operation));

  /**
   * Processes and adds Experience Edge events to the registry
   */
  const addExperienceEdgeEvent = (event: Pick<Event, "getContent">) => {
    // getContent is untyped; an event keeps its XDM under `xdm`.
    const { xdm } = event.getContent() as { xdm?: Record<string, unknown> };

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
      // hasExperienceData checked that `_experience` is an object.
    } = xdm as unknown as ExperienceXdm;

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
   * @returns The event object if found, otherwise undefined
   */
  const getEvent = (eventType: string, eventId: string | undefined) => {
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
