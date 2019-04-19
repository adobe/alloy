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
  meta = {},
  identityMap = {},
  web = {},
  device = {},
  environment = {},
  placeContext = {}
} = {}) => {
  const content = {
    events,
    query,
    meta,
    identityMap,
    web,
    device,
    environment,
    placeContext
  };

  return {
    addEvent(ev) {
      content.events.push(ev);
    },
    addQuery: append(content, "query"),
    addMeta: append(content, "meta"),
    addIdentityMap: append(content, "identityMap"),
    addWeb: append(content, "web"),
    addDevice: append(content, "device"),
    addEnvironment: append(content, "environment"),
    addPlaceContext: append(content, "placeContext"),
    toJson() {
      return JSON.stringify(content);
    }
  };
};
