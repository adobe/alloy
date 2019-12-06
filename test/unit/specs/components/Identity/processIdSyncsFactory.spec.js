import processIdSyncsFactory from "../../../../../src/components/Identity/processIdSyncsFactory";
import { defer } from "../../../../../src/utils";
import flushPromiseChains from "../../../helpers/flushPromiseChains";

describe("Identity::processIdSyncsFactory", () => {
  let fireReferrerHideableImage;
  let logger;
  let processIdSyncs;
  let consent;
  let consentDeferred;

  beforeEach(() => {
    fireReferrerHideableImage = jasmine
      .createSpy()
      .and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["log", "error"]);
    consentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      whenConsented: consentDeferred.promise
    });
    processIdSyncs = processIdSyncsFactory({
      fireReferrerHideableImage,
      logger,
      consent
    });
  });

  it("waits for consent, calls fireReferrerHideableImage for all ID syncs of type URL, and logs results", () => {
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

    processIdSyncs(identities);

    return flushPromiseChains()
      .then(() => {
        expect(fireReferrerHideableImage).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
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

  it("rejects returned promise if consent denied", () => {
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
      }
    ];

    consentDeferred.reject(new Error("Consent denied."));

    return expectAsync(processIdSyncs(identities)).toBeRejectedWithError(
      "Consent denied."
    );
  });
});
