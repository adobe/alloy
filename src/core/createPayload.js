/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* TODO: Remove.

  Current Request Schema:

  https://git.corp.adobe.com/experience-edge/ue-gateway/
  blob/b946662d672950898248daf346ff6adea4d41de4/resources/request.json

  Top-Level nodes:

  {
    query: {},
    "context": {
      "identityMap": {},
      "environment": {},
      "webreferrer": {}
    },
    "events": [{ // Might contain meta per event.
      "timestamp": 1550574782,
      "eventId": "test",
      "correlationID": "something",
      "type": "::page:load",
      "data": {}
    }],
    "meta": {}
  }

*/

import { assign } from "../utils";

const append = (content, key) => (obj = {}) => {
  // TODO Validate.
  console.warn(`[Payload:appendTo${key}] To Implement!`);
  assign(content[key], obj);
  return content;
};

export default ({
  events = [],
  query = {},
  metadata = {},
  context = {}
} = {}) => {
  const content = { events, query, metadata, context };

  return {
    addEvent(ev) {
      content.events.push(ev);
    },
    addQuery: append(content, "query"),
    addMetadata: append(content, "metadata"),
    addContext: append(content, "context"),
    toJson() {
      return JSON.stringify(content);
    }
  };
};
