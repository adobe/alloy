import {
  serializeCustomerIDs,
  createHashFromString,
  validateCustomerIDs,
  normalizeCustomerIDs
} from "../../../../src/components/Identity/identityUtil";
import { AUTH_STATES } from "../../../../src/components/Identity/constants";

describe("Identity::identityUtil", () => {
  describe("serializeCustomerIDs", () => {
    it("should return empty string if array is empty", () => {
      const customerIDs = {};
      expect(serializeCustomerIDs(customerIDs)).toBe("");
    });

    it("should serialize an object with keys separated by pipe characters", () => {
      const customerIDs = {
        email: {
          id: "me@abc.com",
          authState: 1
        },
        crm: {
          id: "qwerty",
          authState: 0
        }
      };
      const serilaizedCustomerIDs = "email|me@abc.com1|crm|qwerty0";
      expect(serializeCustomerIDs(customerIDs)).toBe(serilaizedCustomerIDs);
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
  describe("validateCustomerIDs", () => {
    it("should throw an error when each key is not an object", () => {
      const objToTest = {
        email: "qwerty@asdf.com",
        authState: 0
      };
      expect(() => {
        validateCustomerIDs(objToTest);
      }).toThrow(
        new Error(
          "Invalid customer ID format. Each namespace should be an object"
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
        validateCustomerIDs(objToTest);
      }).toThrow(
        new Error(
          "Invalid customer ID format. Each namespace object should have an id"
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
        validateCustomerIDs(objToTest);
      }).not.toThrow();
    });
  });

  describe("normalizeCustomerIDs", () => {
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
      expect(normalizeCustomerIDs(objToTest)).toEqual(normalizedObj);
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
      expect(normalizeCustomerIDs(objToTest)).toEqual(normalizedObj);
    });
  });
});
