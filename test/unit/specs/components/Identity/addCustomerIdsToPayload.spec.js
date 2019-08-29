import addCustomerIdsToPayload from "../../../../../src/components/Identity/addCustomerIdsToPayload";
import { COOKIE_NAMES } from "../../../../../src/components/Identity/constants";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

describe("Identity::addCustomerIdsToPayload", () => {
  it("should call validate customerIds", () => {
    const idsWithHash = {
      Email_LC_SHA256: {
        id: "me@gmail.com",
        authState: 0,
        hash: true // TODO: document customer ID hashing syntax
      },
      crm: {
        id: "1234",
        authState: 0
      }
    };

    const cookieJar = {
      get: jasmine.createSpy(),
      set: jasmine.createSpy()
    };

    const payload = {
      addIdentity: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy()
    };

    const test = addCustomerIdsToPayload(idsWithHash, cookieJar, payload);
    test.then(() => {
      expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
      expect(cookieJar.set).toHaveBeenCalledWith(CUSTOMER_ID_HASH, "807ct1");
      expect(payload.addIdentity).toHaveBeenCalled();
      expect(payload.addIdentity.calls.count()).toBe(2);
      expect(payload.addIdentity).toHaveBeenCalledWith("Email_LC_SHA256", {
        id: "81d1a7135b9722577fb4f094a2004296d6230512d37b68e64b73f050b919f7c4",
        authState: 0
      });
      expect(payload.addIdentity).toHaveBeenCalledWith("crm", {
        id: "1234",
        authState: 0
      });
      expect(payload.mergeMeta).toHaveBeenCalled();
      expect(payload.mergeMeta).toHaveBeenCalledWith({
        identity: { customerIdChanged: true }
      });
    });
  });

  it("should set CUSTOMER_ID_HASH cookie and payload meta when same ids are passed again", () => {
    const idsWithoutHash = {
      Email_LC_SHA256: {
        id: "me@gmail.com",
        authState: 0
      },
      crm: {
        id: "1234",
        authState: 0
      }
    };
    const payload = {
      addIdentity: jasmine.createSpy(),
      mergeMeta: jasmine.createSpy()
    };
    const cookieJar = {
      get: jasmine.createSpy().and.returnValue("807ct1"),
      set: jasmine.createSpy()
    };

    const test = addCustomerIdsToPayload(idsWithoutHash, cookieJar, payload);
    test.then(() => {
      expect(cookieJar.get).toHaveBeenCalledWith(CUSTOMER_ID_HASH);
      expect(cookieJar.set).not.toHaveBeenCalled();
      expect(payload.addIdentity).toHaveBeenCalled();
      expect(payload.addIdentity.calls.count()).toBe(2);
      expect(payload.addIdentity).toHaveBeenCalledWith("Email_LC_SHA256", {
        id: "me@gmail.com",
        authState: 0
      });
      expect(payload.addIdentity).toHaveBeenCalledWith("crm", {
        id: "1234",
        authState: 0
      });
      expect(payload.mergeMeta).toHaveBeenCalled();
      expect(payload.mergeMeta).toHaveBeenCalledWith({
        identity: { customerIdChanged: false }
      });
    });
  });
});
