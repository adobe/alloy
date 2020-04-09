import createRequestPayload from "../../../core/edgeNetwork/requestPayloads/createRequestPayload";
import createAddIdentity from "../../../core/edgeNetwork/requestPayloads/contentModifiers/createAddIdentity";

export default () => {
  return createRequestPayload(content => {
    content.query = content.query || {};
    content.query.identity = { fetch: ["ECID"] };
    return {
      addIdentity: createAddIdentity(content)
    };
  });
};
