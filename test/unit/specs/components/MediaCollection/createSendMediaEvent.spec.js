import createSendMediaEvent from "../../../../../src/components/MediaCollection/createSendMediaEvent";
import MediaEvents from "../../../../../src/components/MediaCollection/constants/eventTypes";

describe("createSendMediaEvent", () => {
  let sendMediaEvent;
  let mediaEventManager;
  let mediaSessionCacheManager;
  let config;

  beforeEach(() => {
    mediaEventManager = {
      createMediaEvent: jasmine.createSpy(),
      augmentMediaEvent: jasmine.createSpy(),
      trackMediaEvent: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    mediaSessionCacheManager = {
      getSession: jasmine.createSpy().and.returnValue({
        getPlayerDetails: jasmine.createSpy(),
        sessionPromise: Promise.resolve({ sessionId: "123" })
      }),
      stopHeartbeat: jasmine.createSpy(),
      saveHeartbeat: jasmine.createSpy()
    };
    config = {
      mediaCollection: {
        adPingInterval: 5,
        mainPingInterval: 10
      }
    };
    sendMediaEvent = createSendMediaEvent({
      mediaEventManager,
      mediaSessionCacheManager,
      config
    });
  });

  it("should send a media event", async () => {
    const options = {
      playerId: "player1",
      xdm: {
        eventType: "media.play"
      }
    };

    await sendMediaEvent(options);

    expect(mediaEventManager.createMediaEvent).toHaveBeenCalledWith({
      options
    });
    expect(mediaSessionCacheManager.getSession).toHaveBeenCalledWith(
      options.playerId
    );
    expect(mediaEventManager.augmentMediaEvent).toHaveBeenCalled();
    expect(mediaEventManager.trackMediaEvent).toHaveBeenCalled();
  });

  it("should stop the heartbeat for session complete event", async () => {
    const options = {
      playerId: "player1",
      xdm: {
        eventType: MediaEvents.SESSION_COMPLETE
      }
    };

    await sendMediaEvent(options);

    expect(mediaSessionCacheManager.stopHeartbeat).toHaveBeenCalledWith({
      playerId: options.playerId
    });
  });

  it("should save the heartbeat for non-session complete event", async () => {
    const options = {
      playerId: "player1",
      xdm: {
        eventType: "media.play"
      }
    };

    await sendMediaEvent(options);

    expect(mediaSessionCacheManager.saveHeartbeat).toHaveBeenCalled();
  });
});
