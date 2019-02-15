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
