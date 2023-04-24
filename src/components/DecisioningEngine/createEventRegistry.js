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
export default () => {
  const events = {};
  const rememberEvent = event => {
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
    const { propositions = [] } = decisioning;

    propositions.forEach(proposition => {
      let count = 0;
      const existingEvent = events[proposition.id];
      if (existingEvent) {
        count = existingEvent.count;
      }

      events[proposition.id] = {
        event: { id: proposition.id, type: eventType },
        timestamp: new Date().getTime(),
        count: count + 1
      };
    });
  };

  const getEvent = eventId => events[eventId];

  return { rememberEvent, getEvent, toJSON: () => events };
};
