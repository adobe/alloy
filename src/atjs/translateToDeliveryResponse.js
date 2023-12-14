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
import { JSON_CONTENT_ITEM } from "../constants/schema";

const schemaTypeMapping = {
  [JSON_CONTENT_ITEM]: "json"
};

const getType = schema => schemaTypeMapping[schema];

const createMboxOptions = (items, eventToken) => {
  return items.map(item => {
    const { meta: responseTokens = {}, data = {}, schema } = item;
    const { content = {} } = data;

    return {
      content,
      type: getType(schema),
      eventToken,
      sourceType: "target",
      responseTokens
    };
  });
};

const createMbox = proposition => {
  const { scope: name, scopeDetails = {}, items = [] } = proposition;
  const { characteristics = {} } = scopeDetails;
  const { stateToken: state, eventToken } = characteristics;

  const options = createMboxOptions(items, eventToken);

  return {
    name,
    state,
    options
  };
};

export default aepResponse => {
  const prefetchMboxes = [];
  const executeMboxes = [];

  const { propositions = [] } = aepResponse;

  propositions
    .filter(proposition => proposition.scopeDetails.decisionProvider === "TGT")
    .forEach(proposition => {
      // const { scope } = proposition;

      const mbox = createMbox(proposition);

      // if (scope === PAGE_WIDE_SCOPE) {
      // for now, everything is execute.  but supposedly mboxes will go to prefetch by default in jan 2024.  propositionFetch can be used to force prefetch
      executeMboxes.push(mbox);
      // } else {
      //   prefetchMboxes.push(mbox);
      // }
    });

  const deliveryResponse = {
    meta: { decisioningMethod: "server-side" }
  };

  if (prefetchMboxes.length > 0) {
    deliveryResponse.prefetch = { mboxes: prefetchMboxes };
  }

  if (executeMboxes.length > 0) {
    deliveryResponse.execute = { mboxes: executeMboxes };
  }

  return deliveryResponse;
};
