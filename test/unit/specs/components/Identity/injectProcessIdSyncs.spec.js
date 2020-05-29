import injectProcessIdSyncs from "../../../../../src/components/Identity/injectProcessIdSyncs";

describe("Identity::injectProcessIdSyncs", () => {
  let fireReferrerHideableImage;
  let logger;
  let processIdSyncs;

  beforeEach(() => {
    fireReferrerHideableImage = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["log", "error"]);
    processIdSyncs = injectProcessIdSyncs({
      fireReferrerHideableImage,
      logger
    });
  });

  it("handles no ID syncs", () => {
    return processIdSyncs([]).then(() => {
      expect(fireReferrerHideableImage).not.toHaveBeenCalled();
    });
  });

  it("calls fireReferrerHideableImage for all ID syncs of type URL, and logs results", () => {
    fireReferrerHideableImage.and.callFake(({ url }) => {
      return url === "http://test.zyx" ? Promise.resolve() : Promise.reject();
    });

    const identities = [
      {
        type: "url",
        id: 2097728,
        spec: {
          url: "http://test.abc",
          hideReferrer: true
        }
      },
      {
        type: "cookie",
        spec: {
          name: "testCookieIdSync",
          value: "id\u003ds2",
          domain: "",
          ttl: 30
        }
      },
      {
        type: "url",
        id: 2097729,
        spec: {
          url: "http://test.zyx",
          hideReferrer: false
        }
      }
    ];

    return processIdSyncs(identities).then(() => {
      expect(fireReferrerHideableImage).toHaveBeenCalledWith({
        url: "http://test.abc",
        hideReferrer: true
      });
      expect(fireReferrerHideableImage).toHaveBeenCalledWith({
        url: "http://test.zyx",
        hideReferrer: false
      });
      expect(logger.log).toHaveBeenCalledWith(
        "ID sync succeeded: http://test.zyx"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "ID sync failed: http://test.abc"
      );
    });
  });
});
