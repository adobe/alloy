/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  EVENT_HISTORY_MAX_RECORDS,
  EVENT_HISTORY_RETENTION_PERIOD,
} from "../constants/index.js";
import getExpirationDate from "./getExpirationDate.js";
import type { EventRegistry } from "../types.js";

/**
 * Creates an event pruner function that filters events based on retention period and maximum count
 *
 * @param retentionPeriod - The retention period in days
 * @param limit - Maximum number of events to keep
 * @returns A function that takes an events object and returns a pruned version of it,
 * filtered by retention period and limited to max count
 */
export default (
    retentionPeriod = EVENT_HISTORY_RETENTION_PERIOD,
    limit = EVENT_HISTORY_MAX_RECORDS,
  ) =>
  (events: EventRegistry) => {
    let eventsWithHash = Object.entries(events).reduce<
      { key: string; timestamp: number }[]
    >((accumulator, [key, { timestamps = [] }]) => {
      timestamps.forEach((timestamp) => {
        accumulator.push({
          key,
          timestamp,
        });
      });

      return accumulator;
    }, []);

    const expirationDate = getExpirationDate(retentionPeriod);

    eventsWithHash = eventsWithHash.filter(
      // The comparison coerces the Date to its epoch milliseconds.
      ({ timestamp }) => timestamp >= (expirationDate as unknown as number),
    );

    eventsWithHash.sort((a, b) => a.timestamp - b.timestamp);
    eventsWithHash = eventsWithHash.slice(-limit);

    return eventsWithHash.reduce<EventRegistry>(
      (accumulator, { key, timestamp }) => {
        if (!accumulator[key]) {
          accumulator[key] = {
            timestamps: [],
          };
        }

        accumulator[key].timestamps.push(timestamp);
        return accumulator;
      },
      {},
    );
  };
