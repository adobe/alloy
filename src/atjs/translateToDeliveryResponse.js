import PAGE_WIDE_SCOPE from "../constants/pageWideScope";
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
      const { scope } = proposition;

      const mbox = createMbox(proposition);

      if (scope === PAGE_WIDE_SCOPE) {
        executeMboxes.push(mbox);
      } else {
        prefetchMboxes.push(mbox);
      }
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
