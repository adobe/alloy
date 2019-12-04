import processIdSyncsFactory from "../../../../../src/components/Identity/processIdSyncsFactory";

describe("Identity::processIdSyncsFactory", () => {
  let fireReferrerHideableImage;
  let logger;
  let processIdSyncs;

  beforeEach(() => {
    fireReferrerHideableImage = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["log", "error"]);
    processIdSyncs = processIdSyncsFactory({
      fireReferrerHideableImage,
      logger
    });
  });

  it("calls fireReferrerHideableImage for all ID syncs of type URL and logs results", () => {
    fireReferrerHideableImage.and.callFake(({ url }) => {
      return url === "http://test.zyx" ? Promise.resolve() : Promise.reject();
    });
    return processIdSyncs([
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
    ]).then(() => {
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
