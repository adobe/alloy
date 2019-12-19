import createCustomerIds from "../../../../../../src/components/Identity/customerIds/createCustomerIds";

describe("Identity::createCustomerIds", () => {
  let payload;
  let idsWithHash;
  let event;
  let eventManager;
  let logger;
  beforeEach(() => {
    idsWithHash = {
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
    payload = {
      addEvent: jasmine.createSpy(),
      addIdentity: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy(),
      expectsResponse: false
    };
    event = { type: "event" };
    eventManager = {
      createEvent: () => event,
      sendEvent: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);
  });
  it("should have addToPayload and sync methods", () => {
    const customerIds = createCustomerIds({ eventManager, logger });
    expect(customerIds.addToPayload).toBeDefined();
    expect(customerIds.sync).toBeDefined();
  });
  describe("sync", () => {
    it("should send an event", () => {
      const customerIds = createCustomerIds({ eventManager, logger });
      return customerIds.sync(idsWithHash).then(() => {
        expect(eventManager.sendEvent).toHaveBeenCalledWith(event);
      });
    });
  });
  describe("addToPayload", () => {
    it("should add identity to payload", () => {
      const customerIds = createCustomerIds({ eventManager, logger });
      return customerIds.sync(idsWithHash).then(() => {
        customerIds.addToPayload(payload);

        expect(payload.addIdentity.calls.count()).toBe(2);
        expect(payload.addIdentity).toHaveBeenCalledWith("Email_LC_SHA256", {
          id:
            "81d1a7135b9722577fb4f094a2004296d6230512d37b68e64b73f050b919f7c4",
          authenticatedState: "ambiguous"
        });
        expect(payload.addIdentity).toHaveBeenCalledWith("crm", {
          id: "1234",
          authenticatedState: "ambiguous"
        });
      });
    });
  });
});
