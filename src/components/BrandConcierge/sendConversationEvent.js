import {createDataCollectionRequestPayload} from "../../utils/request/index.js";
import createConversationServiceRequest from "./createConversationServiceRequest.js";

const sendConversationServiceEvent = (options) => {
  //const sessionId = getConciergeSessionCookie({loggingCookieJar, config}) || uuid();

  const { message, streamResponseCallback, feedback } = options;
  const payload = createDataCollectionRequestPayload();
  const request = createConversationServiceRequest({
    payload, sessionId
  });

  const event = eventManager.createEvent();

  const pageSurface = getPageSurface(getPageLocation);
  const conversation = {
    surfaces: [pageSurface]
  };
  if(message) {
    conversation.message = message;
  }
  if(feedback) {
    conversation.feedback = feedback;
  }

  event.mergeQuery({conversation});

  const ecid = decodeKndctrCookie();

  event.mergeXdm({
    identityMap: {
      ECID: [{
        id: ecid
      }]
    },
    web: {
      webPageDetails: {
        URL: window.location.href || window.location,
      },
      webReferrer: {
        URL: window.document.referrer,
      },
    }
  });

  event.finalize();
  payload.addEvent(event);

  if(streamResponseCallback) {
    streamRequest(message,[pageSurface], sessionId, config.datastreamId, streamResponseCallback, ecid);
    return;
  }

  return sendEdgeNetworkRequest({ request }).then((response) => {
    return response;
  });
};
