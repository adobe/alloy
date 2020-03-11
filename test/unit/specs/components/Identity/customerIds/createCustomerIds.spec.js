import createCustomerIds from "../../../../../../src/components/Identity/customerIds/createCustomerIds";
import { defer } from "../../../../../../src/utils";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";

describe("Identity::createCustomerIds", () => {
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
    const customerIds = createCustomerIds({ eventManager, consent, logger });
    expect(customerIds.addToPayload).toBeDefined();
    expect(customerIds.sync).toBeDefined();
  });

  it("waits for consent before sending an event", () => {
    const customerIds = createCustomerIds({ eventManager, consent, logger });

    // We can't use a hashEnabled identity in this test case due to the
    // async nature of convertStringToSha256Buffer unless we were to mock
    // convertStringToSha256Buffer.
    customerIds.sync({
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

  it("rejects returned promise when sending an event if consent denied", () => {
    const customerIds = createCustomerIds({ eventManager, consent, logger });

    consentDeferred.reject(new Error("Consent rejected."));

    // We can't use a hashEnabled identity in this test case due to the
    // async nature of convertStringToSha256Buffer unless we were to mock
    // convertStringToSha256Buffer.
    return expectAsync(
      customerIds.sync({
        crm: {
          id: "1234",
          authState: "ambiguous"
        }
      })
    ).toBeRejectedWithError("Consent rejected.");
  });

  it("hashes identities as necessary and adds them to a payload when requested", () => {
    const ids = {
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
    const customerIds = createCustomerIds({ eventManager, consent, logger });
    return customerIds.sync(ids).then(() => {
      customerIds.addToPayload(payload);

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
