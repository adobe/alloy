import addCustomerIdsToPayload from "../../../../../src/components/Identity/addCustomerIdsToPayload";

describe("Identity::addCustomerIdsToPayload", () => {
  it("should call validate customerIds", () => {
    const idsWithHash = {
      Email_LC_SHA256: {
        id: "81d1a7135b9722577fb4f094a2004296d6230512d37b68e64b73f050b919f7c4",
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

    addCustomerIdsToPayload(idsWithHash, true, payload);
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

  it("should set CUSTOMER_ID_HASH cookie and payload meta when same ids are passed again", () => {
    const idsWithoutHash = {
      email: {
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

    addCustomerIdsToPayload(idsWithoutHash, false, payload);
    expect(payload.addIdentity).toHaveBeenCalled();
    expect(payload.addIdentity.calls.count()).toBe(2);
    expect(payload.addIdentity).toHaveBeenCalledWith("email", {
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
