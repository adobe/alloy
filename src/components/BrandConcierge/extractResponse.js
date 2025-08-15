export default (data) => {
    const parsedData = JSON.parse(data);
    const { handle = [] } = parsedData;

  if (handle.length === 0) {
      return null;
    }

    const { payload = [] } = handle[0];

    if (payload.length === 0) {
      return null;
    }

    const { response = {}, state = "", conversationId, interactionId } = payload[0];

    if (Object.keys(response).length === 0) {
      return null;
    }

    const { message = "", promptSuggestions = [], multimodalElements = [], sources } = response;

    return { message, multimodalElements, promptSuggestions, state, sources, conversationId, interactionId };
};