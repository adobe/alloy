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

const append = (payload, key) => (obj = {}) => {
  // TODO Validate...
  console.warn(`[Payload:appendTo${key}] To Implement!`);
  Object.assign(payload[key], obj);
  return payload;
};

// data should be an array to support sending multiple events.
export default ({ data, query = {}, metadata = {}, context = {} } = {}) => {
  const payload = { data: [], query, metadata, context };

  // TODO Validate...
  if (data) {
    payload.data.push(data);
  }

  return {
    appendToData(obj) {
      payload.data.push(obj);
    },
    appendToQuery: append(payload, "query"),
    appendToMetadata: append(payload, "metadata"),
    appendToContext: append(payload, "context"),
    toJson() {
      return JSON.stringify(payload);
    }
  };
};
