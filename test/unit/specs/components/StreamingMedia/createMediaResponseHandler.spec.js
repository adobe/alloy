import createMediaResponseHandler from "../../../../../src/components/StreamingMedia/createMediaResponseHandler";

describe("createMediaResponseHandler", () => {
  let trackMediaEvent;
  let mediaSessionCacheManager;
  let config;
  let logger;
  let mediaResponseHandler;
  let response;
  const getPlayerDetails = () => {};

  beforeEach(() => {
    response = {
      getPayloadsByType: jasmine.createSpy()
    };
    mediaSessionCacheManager = {
      getSession: jasmine.createSpy().and.returnValue({
        getPlayerDetails: jasmine.createSpy(),
        sessionPromise: Promise.resolve({ sessionId: "123" })
      }),
      stopPing: jasmine.createSpy(),
      savePing: jasmine.createSpy()
    };
    config = {
      streamingMedia: {
        adPingInterval: 5,
        mainPingInterval: 10
      }
    };
    logger = {
      info: jasmine.createSpy()
    };
    trackMediaEvent = jasmine.createSpy();
    mediaResponseHandler = createMediaResponseHandler({
      mediaSessionCacheManager,
      logger,
      config,
      trackMediaEvent
    });
  });

  it("should return empty object when no media payload", async () => {
    response.getPayloadsByType.and.returnValue([]);

    const result = await mediaResponseHandler({
      response,
      playerId: "player1",
      getPlayerDetails
    });
    await expect(result).toEqual({});
    await expect(mediaSessionCacheManager.savePing).not.toHaveBeenCalled();
  });

  it("should return session id", async () => {
    response.getPayloadsByType.and.returnValue([{ sessionId: "123" }]);

    const result = await mediaResponseHandler({
      response,
      playerId: "player1",
      getPlayerDetails
    });
    await expect(result).toEqual({ sessionId: "123" });
    await expect(mediaSessionCacheManager.savePing).toHaveBeenCalled();
  });

  it("should return sessionId when no player or getPlayerDetails function", async () => {
    response.getPayloadsByType.and.returnValue([{ sessionId: "123" }]);

    const result = await mediaResponseHandler({
      response
    });
    await expect(result).toEqual({ sessionId: "123" });
    await expect(mediaSessionCacheManager.savePing).not.toHaveBeenCalled();
  });
});
