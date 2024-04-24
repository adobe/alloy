import createTrackMediaEvent from "../../../../../src/components/StreamingMedia/createTrackMediaEvent";
import MediaEvents from "../../../../../src/components/StreamingMedia/constants/eventTypes";

describe("createTrackMediaEvent", () => {
  let trackMediaEvent;
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
      streamingMedia: {
        adPingInterval: 5,
        mainPingInterval: 10
      }
    };
    trackMediaEvent = createTrackMediaEvent({
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

    await trackMediaEvent(options);

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

    await trackMediaEvent(options);

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

    await trackMediaEvent(options);

    expect(mediaSessionCacheManager.saveHeartbeat).toHaveBeenCalled();
  });
});
