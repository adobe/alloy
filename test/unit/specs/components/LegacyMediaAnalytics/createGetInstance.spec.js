const createGetInstance = require("../../../../../src/components/LegacyMediaAnalytics/createGetInstance.js");

describe("createGetInstance", () => {
  const logger = {
    warn: jasmine.createSpy(),
  };
  let trackMediaSession;
  let trackMediaEvent;
  let uuid;

  beforeEach(() => {
    trackMediaSession = jasmine.createSpy();
    trackMediaEvent = jasmine.createSpy();
    uuid = jasmine.createSpy().and.returnValue("1234-5678-9101-1121");
  });

  it("should return an object", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    expect(typeof result).toBe("object");
    expect(typeof result.trackSessionStart).toBe("function");
    expect(typeof result.trackPlay).toBe("function");
    expect(typeof result.trackComplete).toBe("function");
    expect(typeof result.trackPause).toBe("function");
    expect(typeof result.trackError).toBe("function");
    expect(typeof result.trackEvent).toBe("function");
    expect(typeof result.trackSessionEnd).toBe("function");
    expect(typeof result.updatePlayhead).toBe("function");
    expect(typeof result.updateQoEObject).toBe("function");
    expect(typeof result.destroy).toBe("function");
  });

  it("when play is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackPlay();

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: { eventType: "media.play", mediaCollection: {} },
    });
  });
  it("when pause is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackPause();

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: { eventType: "media.pauseStart", mediaCollection: {} },
    });
  });

  it("when sessionStart is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const sessionDetails = {
      name: "test",
      friendlyName: "test1",
      length: "test2",
      streamType: "vod",
      contentType: "video/mp4",
    };

    const meta = {
      isUserLoggedIn: "false",
      tvStation: "Sample TV station",
      programmer: "Sample programmer",
      assetID: "/uri-reference",
      "a.media.episode": "episode1",
    };
    result.trackSessionStart({ sessionDetails }, meta);
    expect(trackMediaSession).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      getPlayerDetails: jasmine.any(Function),
      xdm: {
        eventType: "media.sessionStart",
        mediaCollection: {
          sessionDetails: {
            name: "test",
            friendlyName: "test1",
            length: "test2",
            streamType: "vod",
            contentType: "video/mp4",
            episode: "episode1",
          },
          customMetadata: [
            { name: "isUserLoggedIn", value: "false" },
            { name: "tvStation", value: "Sample TV station" },
            { name: "programmer", value: "Sample programmer" },
            { name: "assetID", value: "/uri-reference" },
          ],
        },
      },
    });
  });

  it("when trackError is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackError("error");

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.error",
        mediaCollection: {
          errorDetails: { name: "error", source: "player" },
        },
      },
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it("when trackComplete is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackComplete();

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.sessionComplete",
        mediaCollection: {},
      },
    });
  });
  it("when trackSessionEnd is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    result.trackSessionEnd();

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.sessionEnd",
        mediaCollection: {},
      },
    });
  });
  it("when state update is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const state = {
      name: "muted",
    };
    result.trackEvent("stateStart", state);

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.statesUpdate",
        mediaCollection: {
          statesStart: [{ name: "muted" }],
        },
      },
    });
  });
  it("when state update is called", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const state = {
      name: "muted",
    };
    result.trackEvent("stateEnd", state);

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.statesUpdate",
        mediaCollection: {
          statesEnd: [{ name: "muted" }],
        },
      },
    });
  });
  it("when track adds is called add get's converted correctly", () => {
    const result = createGetInstance({
      logger,
      trackMediaSession,
      trackMediaEvent,
      uuid,
    });
    const advertisingDetails = {
      friendlyName: "test",
      name: "trst1",
      podPosition: 2,
      length: 100,
    };

    const adContextData = {
      affiliate: "Sample affiliate 2",
      campaign: "Sample ad campaign 2",
      "a.media.ad.advertiser": "Sample Advertiser 2",
      "a.media.ad.campaign": "csmpaign2",
    };

    result.trackEvent("adStart", { advertisingDetails }, adContextData);

    expect(trackMediaEvent).toHaveBeenCalledWith({
      playerId: "1234-5678-9101-1121",
      xdm: {
        eventType: "media.adStart",
        mediaCollection: {
          advertisingDetails: {
            friendlyName: "test",
            name: "trst1",
            podPosition: 2,
            length: 100,
            advertiser: "Sample Advertiser 2",
            campaignID: "csmpaign2",
          },
          customMetadata: [
            { name: "affiliate", value: "Sample affiliate 2" },
            { name: "campaign", value: "Sample ad campaign 2" },
          ],
        },
      },
    });
  });
});
