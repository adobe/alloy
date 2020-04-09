import createRequestPayload from "../../../core/edgeNetwork/requestPayloads/createRequestPayload";
import createAddIdenity from "../../../core/edgeNetwork/requestPayloads/contentModifiers/createAddIdenity";

export default () => {
  return createRequestPayload(content => {
    content.query = content.query || {};
    content.query.identity = { fetch: ["ECID"] };
    return {
      addIdentity: createAddIdenity(content)
    };
  });
};
