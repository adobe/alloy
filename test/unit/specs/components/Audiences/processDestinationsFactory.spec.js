import processDestinationsFactory from "../../../../../src/components/Audiences/processDestinationsFactory";
import { cookieJar } from "../../../../../src/utils";

describe("Audiences::processDestinationsFactory", () => {
  let logger;
  let fireReferrerHideableImage;
  let processDestinations;

  beforeEach(() => {
    fireReferrerHideableImage = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["log", "error"]);
    processDestinations = processDestinationsFactory({
      fireReferrerHideableImage,
      logger
    });
  });

  it("sets cookie destinations", () => {
    const destinations = [
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
          domain: "",
          ttl: 30
        }
      }
    ];

    return processDestinations(destinations).then(() => {
      expect(cookieJar.get("audlabcookie")).toEqual(
        "dgtest\u003ddevicegraphtestdestination1"
      );
      expect(cookieJar.get("testCookieDestination")).toEqual(
        "destination\u003ds2"
      );
    });
  });

  it("calls fireReferrerHideableImage for all destinations of type URL and logs results", () => {
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
        "URL destination succeeded: http://test.zyx"
      );
      expect(logger.error).toHaveBeenCalledWith(
        "URL destination failed: http://test.abc"
      );
    });
  });
  it("doesn't return a value", () => {
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
