import createIdentityManager from "../../../../../../src/components/Identity/identities/createIdentityManager";
import {
  defer,
  convertStringToSha256Buffer
} from "../../../../../../src/utils";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";

describe("Identity::createIdentityManager", () => {
  let payload;
  let event;
  let eventManager;
  let logger;
  let consentDeferred;
  let consent;
  beforeEach(() => {
    payload = jasmine.createSpyObj("payload", ["addIdentity"]);
    event = { type: "event" };
    logger = jasmine.createSpyObj("logger", ["warn"]);
    eventManager = jasmine.createSpyObj("eventManager", {
      createEvent: event,
      sendEvent: Promise.resolve()
    });
    consentDeferred = defer();
    consent = jasmine.createSpyObj("consent", {
      awaitConsent: consentDeferred.promise
    });
  });
  it("has addToPayload and sync methods", () => {
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger,
      convertStringToSha256Buffer
    });
    expect(identityManager.addToPayload).toBeDefined();
    expect(identityManager.sync).toBeDefined();
  });

  it("waits for consent before sending an event", () => {
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger,
      convertStringToSha256Buffer
    });
    identityManager.sync({
      crm: {
        id: "1234",
        authState: "ambiguous"
      }
    });

    return flushPromiseChains()
      .then(() => {
        expect(eventManager.sendEvent).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(eventManager.sendEvent).toHaveBeenCalledWith(event);
      });
  });

  it("logs a warning when browser doesn't support hashing", () => {
    const sha256Buffer = jasmine
      .createSpy("sha256Buffer")
      .and.returnValue(false);
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger,
      convertStringToSha256Buffer: sha256Buffer
    });
    identityManager.sync({
      crm: {
        id: "1234",
        authState: "ambiguous"
      },
      email_hash: {
        id: "test@email.com",
        hashEnabled: true
      }
    });

    return flushPromiseChains()
      .then(() => {
        expect(eventManager.sendEvent).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        expect(sha256Buffer).toHaveBeenCalledWith("test@email.com");
        expect(logger.warn).toHaveBeenCalledWith(
          `Unable to hash identity email_hash due to lack of browser support. Provided email_hash will not be sent to Adobe Experience Cloud.`
        );
        expect(eventManager.sendEvent).toHaveBeenCalledWith(event);
      });
  });

  it("should not send an event when hashing failed on all identities", () => {
    const sha256Buffer = jasmine
      .createSpy("sha256Buffer")
      .and.returnValue(false);
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger,
      convertStringToSha256Buffer: sha256Buffer
    });

    const identities = {
      crm: {
        id: "1234",
        authState: "ambiguous",
        hashEnabled: true
      },
      email_hash: {
        id: "test@email.com",
        hashEnabled: true
      }
    };
    identityManager.sync(identities);

    return flushPromiseChains()
      .then(() => {
        expect(eventManager.sendEvent).not.toHaveBeenCalled();
        consentDeferred.resolve();
        return flushPromiseChains();
      })
      .then(() => {
        Object.keys(identities).forEach(identity => {
          expect(sha256Buffer).toHaveBeenCalledWith(identities[identity].id);
          expect(logger.warn).toHaveBeenCalledWith(
            `Unable to hash identity ${identity} due to lack of browser support. Provided ${identity} will not be sent to Adobe Experience Cloud.`
          );
        });
        expect(eventManager.sendEvent).not.toHaveBeenCalled();
      });
  });

  it("rejects returned promise when sending an event if consent denied", () => {
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger
    });

    consentDeferred.reject(new Error("Consent rejected."));

    // We can't use a hashEnabled identity in this test case due to the
    // async nature of convertStringToSha256Buffer unless we were to mock
    // convertStringToSha256Buffer.
    return expectAsync(
      identityManager.sync({
        crm: {
          id: "1234",
          authState: "ambiguous"
        }
      })
    ).toBeRejectedWithError("Consent rejected.");
  });

  it("does not return values", () => {
    consentDeferred.resolve();
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger
    });

    return expectAsync(
      identityManager.sync({
        crm: {
          id: "1234",
          authState: "ambiguous"
        }
      })
    ).toBeResolvedTo(undefined);
  });

  it("hashes identities as necessary and adds them to a payload when requested", () => {
    const identities = {
      Email_LC_SHA256: {
        id: "me@gmail.com",
        authState: "ambiguous",
        hashEnabled: true
      },
      crm: {
        id: "1234",
        authState: "ambiguous"
      }
    };
    consentDeferred.resolve();
    const identityManager = createIdentityManager({
      eventManager,
      consent,
      logger,
      convertStringToSha256Buffer
    });
    return identityManager.sync(identities).then(() => {
      identityManager.addToPayload(payload);

      expect(payload.addIdentity.calls.count()).toBe(2);
      expect(payload.addIdentity).toHaveBeenCalledWith("Email_LC_SHA256", {
        id: "81d1a7135b9722577fb4f094a2004296d6230512d37b68e64b73f050b919f7c4",
        authenticatedState: "ambiguous"
      });
      expect(payload.addIdentity).toHaveBeenCalledWith("crm", {
        id: "1234",
        authenticatedState: "ambiguous"
      });
    });
  });
});
