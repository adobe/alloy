import createOnBeforeMediaEvent from "../../../../../src/components/MediaCollection/createOnBeforeMediaEvent";

describe("onBeforeMediaEvent", () => {
  let trackMediaEvent;
  let mediaSessionCacheManager;
  let config;
  let logger;
  let onBeforeMediaEvent;
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
      stopHeartbeat: jasmine.createSpy(),
      saveHeartbeat: jasmine.createSpy()
    };
    config = {
      mediaCollection: {
        adPingInterval: 5,
        mainPingInterval: 10
      }
    };
    logger = {
      info: jasmine.createSpy()
    };
    trackMediaEvent = jasmine.createSpy();
    onBeforeMediaEvent = createOnBeforeMediaEvent({
      mediaSessionCacheManager,
      logger,
      config,
      trackMediaEvent
    });
  });

  it("should return empty object when no media payload", async () => {
    response.getPayloadsByType.and.returnValue([]);

    const result = await onBeforeMediaEvent({
      response,
      playerId: "player1",
      getPlayerDetails
    });
    await expect(result).toEqual({});
    await expect(mediaSessionCacheManager.saveHeartbeat).not.toHaveBeenCalled();
  });

  it("should return session id", async () => {
    response.getPayloadsByType.and.returnValue([{ sessionId: "123" }]);

    const result = await onBeforeMediaEvent({
      response,
      playerId: "player1",
      getPlayerDetails
    });
    await expect(result).toEqual({ sessionId: "123" });
    await expect(mediaSessionCacheManager.saveHeartbeat).toHaveBeenCalled();
  });

  it("should return sessionId when no player or getPlayerDetails function", async () => {
    response.getPayloadsByType.and.returnValue([{ sessionId: "123" }]);

    const result = await onBeforeMediaEvent({
      response
    });
    await expect(result).toEqual({ sessionId: "123" });
    await expect(mediaSessionCacheManager.saveHeartbeat).not.toHaveBeenCalled();
  });
});
