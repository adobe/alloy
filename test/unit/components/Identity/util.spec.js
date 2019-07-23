import {
  serializeCustomerIds,
  createHashFromString,
  validateCustomerIds,
  normalizeCustomerIds
} from "../../../../src/components/Identity/util";
import { AUTH_STATES } from "../../../../src/components/Identity/constants";

describe("Identity::identityUtil", () => {
  describe("serializeCustomerIds", () => {
    it("should return empty string if array is empty", () => {
      const customerIds = {};
      expect(serializeCustomerIds(customerIds)).toBe("");
    });

    it("should serialize an object with keys separated by pipe characters", () => {
      const customerIds = {
        email: {
          id: "me@abc.com",
          authState: 1
        },
        crm: {
          id: "qwerty",
          authState: 0
        }
      };
      const serilaizedCustomerIds = "email|me@abc.com1|crm|qwerty0";
      expect(serializeCustomerIds(customerIds)).toBe(serilaizedCustomerIds);
    });
  });
  describe("createHashFromString", () => {
    it("should return 0 if the string is empty", () => {
      const stringToHash = "";
      expect(createHashFromString(stringToHash)).toBe(0);
    });
    it("should generate same hash for same string", () => {
      const stringOneToHash = "123";
      const stringTwoToHash = "123";
      expect(createHashFromString(stringOneToHash)).toBe(
        createHashFromString(stringTwoToHash)
      );
    });
    it("should generate different hash for strings with same chars in different order", () => {
      const stringOneToHash = "qwertyuhj|kj";
      const stringTwoToHash = "qwertyuhj|jk";
      expect(createHashFromString(stringOneToHash)).not.toBe(
        createHashFromString(stringTwoToHash)
      );
    });
  });
  describe("validateCustomerIds", () => {
    it("should throw an error when each key is not an object", () => {
      const objToTest = {
        email: "qwerty@asdf.com",
        authState: 0
      };
      expect(() => {
        validateCustomerIds(objToTest);
      }).toThrow(
        new Error(
          "Invalid customer Id format. Each namespace should be an object."
        )
      );
    });

    it("should throw an error when any of teh namespace doesn't have an id parameter", () => {
      const objToTest = {
        email: {
          name: "tester"
        },
        crm: {
          id: "1234"
        }
      };
      expect(() => {
        validateCustomerIds(objToTest);
      }).toThrow(
        new Error(
          "Invalid customer Id format. Each namespace object should have an id."
        )
      );
    });

    it("should not throw when a valid object is given", () => {
      const objToTest = {
        email: {
          id: "tester"
        },
        crm: {
          id: "1234"
        }
      };
      expect(() => {
        validateCustomerIds(objToTest);
      }).not.toThrow();
    });
  });

  describe("normalizeCustomerIds", () => {
    it("should add an authState if missing", () => {
      const objToTest = {
        email: {
          id: "tester"
        },
        crm: {
          id: "1234"
        }
      };
      const normalizedObj = {
        email: {
          id: "tester",
          authState: AUTH_STATES.UNKNOWN
        },
        crm: {
          id: "1234",
          authState: AUTH_STATES.UNKNOWN
        }
      };
      expect(normalizeCustomerIds(objToTest)).toEqual(normalizedObj);
    });
    it("should add a valid authState if invalid authState is given", () => {
      const objToTest = {
        email: {
          id: "tester",
          authState: "login"
        },
        crm: {
          id: "1234",
          authState: "logout"
        }
      };
      const normalizedObj = {
        email: {
          id: "tester",
          authState: AUTH_STATES.UNKNOWN
        },
        crm: {
          id: "1234",
          authState: AUTH_STATES.UNKNOWN
        }
      };
      expect(normalizeCustomerIds(objToTest)).toEqual(normalizedObj);
    });
  });
});
