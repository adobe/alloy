import createCustomerIds from "../../../../../../src/components/Identity/customerIds/createCustomerIds";
import { CUSTOMER_ID_HASH } from "../../../../../../src/components/Identity/constants/cookieNames";

describe("Identity::createCustomerIds", () => {
  let payload;
  let cookieJar;
  let idsWithHash;
  let event;
  let eventManager;
  beforeEach(() => {
    idsWithHash = {
      Email_LC_SHA256: {
        id: "me@gmail.com",
        authState: "ambiguous",
        hash: true
      },
      crm: {
        id: "1234",
        authState: "ambiguous"
      }
    };
    cookieJar = {
      get: jasmine.createSpy(),
      set: jasmine.createSpy()
    };
    payload = {
      addEvent: jasmine.createSpy(),
      addIdentity: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy(),
      expectsResponse: false
    };
    eventManager = {
      createEvent: () => event,
      sendEvent: jasmine.createSpy().and.returnValue(Promise.resolve())
    };
  });
  it("should have addToPayload and sync methods", () => {
    const customerIds = createCustomerIds(cookieJar, eventManager);
    expect(customerIds.addToPayload).toBeDefined();
    expect(customerIds.sync).toBeDefined();
  });
  describe("sync", () => {
    it("should get and set checksum for a new session", () => {
      const customerIds = createCustomerIds(cookieJar, eventManager);
      customerIds.sync(idsWithHash);
      expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
      expect(cookieJar.set).toHaveBeenCalledWith(CUSTOMER_ID_HASH, "donhwg");
    });
    it("should not update checksum if the same ID passed twice", () => {
      const customerIds = createCustomerIds(cookieJar, eventManager);
      cookieJar.get = jasmine.createSpy().and.returnValue("donhwg");
      customerIds.sync(idsWithHash);
      expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
      expect(cookieJar.set).not.toHaveBeenCalled();
    });
    it("should send an event", () => {
      const customerIds = createCustomerIds(cookieJar, eventManager);
      return customerIds.sync(idsWithHash).then(() => {
        expect(eventManager.sendEvent).toHaveBeenCalledWith(event);
      });
    });
  });
  describe("addToPayload", () => {
    it("should add identity to payload", () => {
      const customerIds = createCustomerIds(cookieJar, eventManager);
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
        expect(payload.mergeMeta).toHaveBeenCalledWith({
          identity: { customerIdChanged: true }
        });
      });
    });
    it("should set right value for customerIdChanged ", () => {
      cookieJar.get = jasmine.createSpy().and.returnValue("donhwg");

      const customerIds = createCustomerIds(cookieJar, eventManager);
      return customerIds.sync(idsWithHash).then(() => {
        customerIds.addToPayload(payload);
        expect(payload.mergeMeta).toHaveBeenCalledWith({
          identity: { customerIdChanged: false }
        });
      });
    });
  });
});
