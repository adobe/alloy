import {
  createHash,
  validateCustomerIds,
  normalizeCustomerIds,
  bufferToHex
} from "../../../../src/components/Identity/util";
import { AUTH_STATES } from "../../../../src/components/Identity/constants";

describe("Identity::identityUtil", () => {
  describe("createHash", () => {
    it("should return 0 if the string is empty", () => {
      const stringToHash = "";
      createHash(stringToHash).then(val => expect(bufferToHex(val).toBe(0)));
    });
    it("should generate same hash for same string", () => {
      const stringOneToHash = "12345sadnksdc";
      const stringTwoToHash = "12345sadnksdc";
      createHash(stringOneToHash).then(result => {
        expect(bufferToHex(result)).toBe(
          "bea2016e1e7828a0525b16dc6d921bc3ae8d25f13479c3241b59ad0fa8f92d86"
        );
      });
      createHash(stringTwoToHash).then(result => {
        expect(bufferToHex(result)).toBe(
          "bea2016e1e7828a0525b16dc6d921bc3ae8d25f13479c3241b59ad0fa8f92d86"
        );
      });
    });
    it("should generate different hash for strings with same chars in different order", () => {
      const stringOneToHash = "qwertyuhj|kj";
      const stringTwoToHash = "qwertyuhj|jk";
      createHash(stringOneToHash).then(resultOne => {
        createHash(stringTwoToHash).then(resultTwo => {
          expect(bufferToHex(resultOne)).not.toBe(bufferToHex(resultTwo));
        });
      });
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
          "Invalid customer ID format. Each namespace should be an object."
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
          "Invalid customer ID format. Each namespace object should have an ID."
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

  describe("normalizeCustomerIds and createHash", () => {
    it("should create same hash if the customer IDs are in different order", () => {
      const customerIdOne = {
        email: {
          id: "tester",
          authState: "login"
        },
        crm: {
          id: "1234",
          authState: "logout"
        }
      };
      const customerIdTwo = {
        crm: {
          id: "1234",
          authState: "logout"
        },
        email: {
          id: "tester",
          authState: "login"
        }
      };
      expect(customerIdOne).not.toBe(customerIdTwo);
      expect(customerIdOne).toEqual(customerIdTwo);
      const stringifiedNormalizedOne = JSON.stringify(
        normalizeCustomerIds(customerIdOne)
      );
      const stringifiedNormalizedTwo = JSON.stringify(
        normalizeCustomerIds(customerIdTwo)
      );
      expect(stringifiedNormalizedOne).toBe(stringifiedNormalizedTwo);

      createHash(stringifiedNormalizedOne).then(resultOne => {
        createHash(stringifiedNormalizedTwo).then(resultTwo => {
          expect(bufferToHex(resultOne)).toBe(bufferToHex(resultTwo));
        });
      });
    });
  });
});
