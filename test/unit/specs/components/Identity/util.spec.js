import {
  validateCustomerIds,
  normalizeCustomerIds
} from "../../../../../src/components/Identity/util";
import { AUTH_STATES } from "../../../../../src/components/Identity/constants";

describe("Identity::identityUtil", () => {
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

    it("should throw an error when any of the namespace doesn't have an id parameter", () => {
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
});
