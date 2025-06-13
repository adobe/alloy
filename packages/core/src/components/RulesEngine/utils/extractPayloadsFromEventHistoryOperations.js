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

/** @import { PropositionList,  EventPayload } from '../types.js' */
import { EVENT_HISTORY_OPERATION } from "../../../constants/schema.js";

/**
 * Extracts event history operations from a proposition list and filters them out.
 *
 * This function processes the provided proposition list by:
 * 1. Identifying items with the EVENT_HISTORY_OPERATION schema
 * 2. Converting these items into event payloads and tie them with the operation
 * 3. Removing these items from the original propositions
 * 4. Returning an array of the extracted event payloads
 *
 * @param {PropositionList} propositionList - The list of propositions to process
 * @returns {Array<EventPayload>} Array of extracted event payloads with operation
 */
export default (propositionList) => {
  const result = [];

  propositionList.forEach((proposition) => {
    const filteredItems = [];
    proposition.items.forEach((item) => {
      if (item.schema === EVENT_HISTORY_OPERATION) {
        result.push({
          operation: item.data.operation,
          event: {
            eventId: item.data.content["iam.id"],
            eventType: item.data.content["iam.eventType"],
          },
        });
      } else {
        filteredItems.push(item);
      }
    });

    proposition.items = filteredItems;
  });

  return result;
};
