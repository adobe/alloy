import createRequestPayload from "../../../core/edgeNetwork/requestPayloads/createRequestPayload";

export default () => {
  return createRequestPayload(content => {
    return {
      addIdentity: (namespaceCode, identity) => {
        content.identityMap = content.identityMap || {};
        content.identityMap[namespaceCode] =
          content.identityMap[namespaceCode] || [];
        content.identityMap[namespaceCode].push(identity);
      },
      addQuery: () => {
        content.query = content.query || {};
        content.query.identity = { fetch: ["ECID"] };
      }
    };
  });
};
