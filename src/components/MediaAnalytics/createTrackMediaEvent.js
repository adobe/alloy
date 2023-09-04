import createMediaRequestPayload from "../LegacyMediaAnalytics/createMediaRequestPayload";
import createMediaRequest from "./createMediaRequest";
import injectTimestamp from "../Context/injectTimestamp";

const getActionFromEventType = eventType => {
  return eventType.split(".")[1];
};

export default ({
  sendEdgeNetworkRequest,
  handleMediaEventAutomatically,
  config,
  logger
}) => {
  return options => {
    if (!config.mediaAnalytics) {
      logger.info("Media Analytics was not configured.");
      return Promise.reject(new Error("Media Analytics was not configured."));
    }
    const { xdm, playerId } = options;
    const mediaRequestPayload = createMediaRequestPayload();
    const action = getActionFromEventType(xdm.eventType);
    const request = createMediaRequest({
      mediaRequestPayload,
      action
    });

    if (playerId && handleMediaEventAutomatically) {
      return handleMediaEventAutomatically({
        xdm,
        playerId,
        request,
        mediaRequestPayload
      });
    }

    const event = { xdm };
    const timestamp = injectTimestamp(() => new Date());
    timestamp(event.xdm);
    mediaRequestPayload.addEvent(event);

    return sendEdgeNetworkRequest({ request }).then(() => {
      return {};
    });
  };
};
