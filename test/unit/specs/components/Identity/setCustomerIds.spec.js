import setCustomerIds from "../../../../../src/components/Identity/setCustomerIds";
import { COOKIE_NAMES } from "../../../../../src/components/Identity/constants";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

const idsWithHash = {
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

describe("Identity::setCustomerIds", () => {
  let lifecycle;
  let network;
  let optIn;
  let payload;
  let cookieJar;
  beforeEach(() => {
    cookieJar = {
      get: jasmine.createSpy(),
      set: jasmine.createSpy()
    };
    lifecycle = {
      onBeforeEvent: () => Promise.resolve(),
      onBeforeDataCollection: () => Promise.resolve()
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
  it("should create a payload and add an event", () => {
    setCustomerIds(idsWithHash, cookieJar, lifecycle, network, optIn);
    expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
    expect(cookieJar.set).toHaveBeenCalled();
    expect(network.createPayload).toHaveBeenCalled();
    expect(payload.addEvent).toHaveBeenCalled();
  });
  it("should not set the cookie if the customerIds have not changed", () => {
    cookieJar.get = jasmine.createSpy().and.returnValue("807ct1");
    setCustomerIds(idsWithHash, cookieJar, lifecycle, network, optIn);
    expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
    expect(cookieJar.set).not.toHaveBeenCalled();
  });

  it("should call onBeforeDataCollection with payload and customerIds", () => {
    const normalizedAndHashedIds = {
      Email_LC_SHA256: {
        id: "81d1a7135b9722577fb4f094a2004296d6230512d37b68e64b73f050b919f7c4",
        authState: 0
      },
      crm: {
        id: "1234",
        authState: 0
      }
    };
    const test = setCustomerIds(
      idsWithHash,
      cookieJar,
      lifecycle,
      network,
      optIn
    );
    test.then(() => {
      expect(lifecycle.onBeforeEvent).toHaveBeenCalledWith();
      expect(lifecycle.onBeforeDataCollection).toHaveBeenCalledWith(payload, {
        normalizedAndHashedIds,
        customerIdChanged: true
      });
    });
  });
  it("should send a network request", () => {
    const test = setCustomerIds(
      idsWithHash,
      cookieJar,
      lifecycle,
      network,
      optIn
    );
    test.then(() => {
      expect(network.sendRequest).toHaveBeenCalled();
    });
  });
});
