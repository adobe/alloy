import createTrackMediaSession from "../../../../../src/components/StreamingMedia/createTrackMediaSession";
import PlaybackState from "../../../../../src/components/StreamingMedia/constants/playbackState";

describe("createTrackMediaEvent", () => {
  let trackMediaSession;
  let mediaEventManager;
  let mediaSessionCacheManager;
  let config;
  let logger;

  beforeEach(() => {
    logger = {
      warn: jasmine.createSpy()
    };
    mediaEventManager = {
      createMediaSession: jasmine.createSpy(),
      augmentMediaEvent: jasmine.createSpy(),
      trackMediaSession: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    mediaSessionCacheManager = {
      storeSession: jasmine.createSpy()
    };
    config = {
      streamingMedia: {
        playerName: "testPlayerName",
        channel: "testChannel",
        adPingInterval: 5,
        mainPingInterval: 10
      }
    };
    trackMediaSession = createTrackMediaSession({
      config,
      logger,
      mediaEventManager,
      mediaSessionCacheManager
    });
  });
  it("should track a session", async () => {
    const sessionPromise = Promise.resolve("123");
    const playerId = "testPlayerId";
    const playerName = "testPlayerName";
    const eventType = "media.sessionStart";
    const event = { eventType };
    const getPlayerDetails = () => {};

    const options = {
      playerId,
      getPlayerDetails,
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName
          }
        }
      }
    };
    mediaEventManager.createMediaSession.and.returnValue({ eventType });
    mediaEventManager.augmentMediaEvent.and.returnValue({
      eventType,
      xdm: {
        mediaCollection: {
          sessionDetails: {
            playerName
          },
          playhead: 0
        }
      }
    });
    mediaEventManager.trackMediaSession.and.returnValue(sessionPromise);

    await trackMediaSession(options);

    expect(mediaEventManager.createMediaSession).toHaveBeenCalledWith(options);

    expect(mediaEventManager.augmentMediaEvent).toHaveBeenCalledWith({
      event,
      playerId,
      getPlayerDetails
    });

    expect(mediaEventManager.trackMediaSession).toHaveBeenCalledWith({
      event,
      mediaOptions: {
        playerId,
        getPlayerDetails,
        legacy: false
      }
    });

    expect(mediaSessionCacheManager.storeSession).toHaveBeenCalledWith({
      playerId,
      sessionDetails: {
        sessionPromise,
        getPlayerDetails,
        playbackState: PlaybackState.MAIN
      }
    });
  });
  it("should not track session when no valid configs", async () => {
    config = {};
    trackMediaSession = createTrackMediaSession({
      config,
      mediaEventManager,
      mediaSessionCacheManager
    });
    const options = {
      playerId: "player1",
      xdm: {
        eventType: "media.sessionStart"
      },
      getPlayerDetails: ""
    };
    return expectAsync(trackMediaSession(options)).toBeRejected();
  });
});
