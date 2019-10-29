import createCustomerIds from "../../../../../../src/components/Identity/customerIds/createCustomerIds";
import { CUSTOMER_ID_HASH } from "../../../../../../src/components/Identity/constants/cookieNames";

describe("Identity::createCustomerIds", () => {
  let lifecycle;
  let network;
  let optIn;
  let payload;
  let cookieJar;
  let idsWithHash;
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
    lifecycle = {
      onBeforeEvent: jasmine.createSpy().and.returnValue(Promise.resolve()),
      onBeforeDataCollection: jasmine
        .createSpy()
        .and.returnValue(Promise.resolve())
    };
    payload = {
      addEvent: jasmine.createSpy(),
      addIdentity: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy(),
      expectsResponse: false
    };
    network = {
      createPayload: jasmine.createSpy().and.returnValue(payload),
      sendRequest: jasmine.createSpy().and.returnValue(Promise.resolve({}))
    };
    optIn = {
      whenOptedIn: () => Promise.resolve()
    };
  });
  it("should have addToPayload and sync methods", () => {
    const customerIds = createCustomerIds(cookieJar, lifecycle, network, optIn);
    expect(customerIds.addToPayload).toBeDefined();
    expect(customerIds.sync).toBeDefined();
  });
  describe("sync", () => {
    it("should get and set checksum for a new session", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      customerIds.sync(idsWithHash);
      expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
      expect(cookieJar.set).toHaveBeenCalledWith(CUSTOMER_ID_HASH, "donhwg");
    });
    it("should not update checksum if the same ID passed twice", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      cookieJar.get = jasmine.createSpy().and.returnValue("donhwg");
      customerIds.sync(idsWithHash);
      expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
      expect(cookieJar.set).not.toHaveBeenCalled();
    });
    it("should trigger lifecycle hook onBeforeDataCollection", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      return customerIds.sync(idsWithHash).then(() => {
        // Normally we would test that the event passed to onBeforeEvent
        // was the event created by createEvent(), but createEvent() is
        // imported directly from the DataCollector component so we can't
        // mock it. This should probably all change once Konductor opens
        // up an endpoint specific to setting customer IDs.
        expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith(
          jasmine.any(Object)
        );
        expect(lifecycle.onBeforeDataCollection).toHaveBeenCalledWith({
          payload
        });
      });
    });
    it("should create a network payload and trigger sendRequest", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      return customerIds.sync(idsWithHash).then(() => {
        expect(network.sendRequest).toHaveBeenCalledWith(payload, {
          expectsResponse: false
        });
      });
    });
  });
  describe("addToPayload", () => {
    it("should add identity to payload", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
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

      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      return customerIds.sync(idsWithHash).then(() => {
        customerIds.addToPayload(payload);
        expect(payload.mergeMeta).toHaveBeenCalledWith({
          identity: { customerIdChanged: false }
        });
      });
    });
  });
});
