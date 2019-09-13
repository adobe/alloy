import createCustomerIds from "../../../../../../src/components/Identity/customerIds/createCustomerIds";
import { COOKIE_NAMES } from "../../../../../../src/components/Identity/constants";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

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
        authState: 0,
        hash: true
      },
      crm: {
        id: "1234",
        authState: 0
      }
    };
    cookieJar = {
      get: jasmine.createSpy(),
      set: jasmine.createSpy()
    };
    lifecycle = {
      onBeforeEvent: jasmine
        .createSpy()
        .and.returnValue(() => Promise.resolve()),
      onBeforeDataCollection: jasmine
        .createSpy()
        .and.returnValue(() => Promise.resolve())
    };
    payload = {
      addEvent: jasmine.createSpy(),
      addIdentity: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy()
    };
    network = {
      createPayload: jasmine.createSpy().and.returnValue(payload),
      sendRequest: () => Promise.resolve({})
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
      expect(cookieJar.set).toHaveBeenCalledWith(CUSTOMER_ID_HASH, "807ct1");
    });
    it("should not update checksum if teh same ID passed twice", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      cookieJar.get = jasmine.createSpy().and.returnValue("807ct1");
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
      const test = customerIds.sync(idsWithHash);
      test.then(() => {
        expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith();
        expect(lifecycle.onBeforeDataCollection).toHaveBeenCalledWith(payload);
      });
    });
    it("should create a network payload and trigger sendRequest", () => {
      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      const test = customerIds.sync(idsWithHash);
      expect(network.createPayload).toHaveBeenCalled();
      test.then(() => {
        expect(network.sendRequest).toHaveBeenCalled();
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
      const test = customerIds.sync(idsWithHash);
      test.then(() => {
        customerIds.addToPayload(payload);

        expect(payload.addIdentity.calls.count()).toBe(2);
        expect(payload.addIdentity).toHaveBeenCalledWith("Email_LC_SHA256", {
          id:
            "81d1a7135b9722577fb4f094a2004296d6230512d37b68e64b73f050b919f7c4",
          authState: 0
        });
        expect(payload.addIdentity).toHaveBeenCalledWith("crm", {
          id: "1234",
          authState: 0
        });
        expect(payload.mergeMeta).toHaveBeenCalledWith({
          identity: { customerIdChanged: true }
        });
      });
    });
    it("should set right value for customerIdChanged ", () => {
      cookieJar.get = jasmine.createSpy().and.returnValue("807ct1");

      const customerIds = createCustomerIds(
        cookieJar,
        lifecycle,
        network,
        optIn
      );
      const test = customerIds.sync(idsWithHash);
      test.then(() => {
        customerIds.addToPayload(payload);
        expect(payload.mergeMeta).toHaveBeenCalledWith({
          identity: { customerIdChanged: false }
        });
      });
    });
  });
});
