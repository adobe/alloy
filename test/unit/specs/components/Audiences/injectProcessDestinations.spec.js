import injectProcessDestinations from "../../../../../src/components/Audiences/injectProcessDestinations";

describe("Audiences::injectProcessDestinations", () => {
  let fireReferrerHideableImage;
  let cookieJar;
  let logger;
  let isPageSsl;
  let processDestinations;

  beforeEach(() => {
    fireReferrerHideableImage = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["info", "error"]);
    cookieJar = jasmine.createSpyObj("cookieJar", ["set"]);
    isPageSsl = true;
  });

  const inject = () => {
    processDestinations = injectProcessDestinations({
      fireReferrerHideableImage,
      logger,
      cookieJar,
      isPageSsl
    });
  };

  const SAMPLE_DESTINATIONS1 = [
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
        name: "audlabcookie",
        value: "dgtest\u003ddevicegraphtestdestination1"
      }
    },
    {
      type: "cookie",
      spec: {
        name: "testCookieDestination",
        value: "destination\u003ds2",
        domain: "adobe.com",
        ttlDays: 30
      }
    }
  ];

  it("sets cookie destinations", () => {
    inject();
    return processDestinations(SAMPLE_DESTINATIONS1).then(() => {
      expect(cookieJar.set).toHaveBeenCalledWith(
        "audlabcookie",
        "dgtest\u003ddevicegraphtestdestination1",
        {
          domain: "",
          expires: 10,
          sameSite: "none",
          secure: true
        }
      );
      expect(cookieJar.set).toHaveBeenCalledWith(
        "testCookieDestination",
        "destination\u003ds2",
        {
          domain: "adobe.com",
          expires: 30,
          sameSite: "none",
          secure: true
        }
      );
    });
  });

  it("sets cookie destinations without sameSite flag", () => {
    isPageSsl = false;
    inject();
    return processDestinations(SAMPLE_DESTINATIONS1).then(() => {
      expect(cookieJar.set).toHaveBeenCalledWith(
        "audlabcookie",
        "dgtest\u003ddevicegraphtestdestination1",
        {
          domain: "",
          expires: 10
        }
      );
      expect(cookieJar.set).toHaveBeenCalledWith(
        "testCookieDestination",
        "destination\u003ds2",
        {
          domain: "adobe.com",
          expires: 30
        }
      );
    });
  });

  it("calls fireReferrerHideableImage for all destinations of type URL and logs results", () => {
    inject();
    fireReferrerHideableImage.and.callFake(({ url }) => {
      return url === "http://test.zyx" ? Promise.resolve() : Promise.reject();
    });
    return processDestinations([
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
          name: "testCookieDestination",
          value: "destination\u003ds2",
          domain: "",
          ttlDays: 30
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
      expect(logger.info).toHaveBeenCalledWith(
        "URL destination succeeded: http://test.zyx"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "URL destination failed: http://test.abc"
      );
    });
  });
  it("doesn't return a value", () => {
    inject();
    const destinations = [
      {
        type: "url",
        id: 2097728,
        spec: {
          url: "http://test.abc",
          hideReferrer: true
        }
      }
    ];
    return expectAsync(processDestinations(destinations)).toBeResolvedTo(
      undefined
    );
  });
});
