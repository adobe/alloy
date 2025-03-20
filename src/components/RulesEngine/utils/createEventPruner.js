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
import getPrefixedKey from "./getPrefixedKey.js";

export default (
  limit = EVENT_HISTORY_MAX_RECORDS,
  retentionPeriod = EVENT_HISTORY_RETENTION_PERIOD,
) => {
  return (events) => {
    const pruned = {};
    Object.keys(events).forEach((eventType) => {
      pruned[eventType] = {};
      Object.values(events[eventType])
        .filter(
          (entry) =>
            new Date(entry.firstTimestamp) >=
            getExpirationDate(retentionPeriod),
        )
        .sort((a, b) => a.firstTimestamp - b.firstTimestamp)
        .slice(-1 * limit)
        .forEach((entry) => {
          pruned[eventType][entry.event[getPrefixedKey("id")]] = entry;
        });
    });
    return pruned;
  };
};
