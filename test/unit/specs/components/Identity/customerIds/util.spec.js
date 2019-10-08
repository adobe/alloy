import {
  validateCustomerIds,
  normalizeCustomerIds
} from "../../../../../../src/components/Identity/customerIds/util";
import { AUTH_STATES } from "../../../../../../src/components/Identity/constants";

describe("Identity::identityUtil", () => {
  describe("validateCustomerIds", () => {
    it("should throw an error when input is not an object", () => {
      const idToTest = "email=qwerty@asdf.com";
      expect(() => {
        validateCustomerIds(idToTest);
      }).toThrow(
        new Error(
          "Invalid customer ID format. Each namespace should be an object."
        )
      );
    });
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

    it("should throw an error when primary is not a boolean", () => {
      const objToTest = {
        email: {
          id: "tester",
          primary: "wrong type"
        }
      };
      expect(() => {
        validateCustomerIds(objToTest);
      }).toThrow();
    });

    it("should not throw an error when primary is a boolean", () => {
      const objToTest = {
        email: {
          id: "tester",
          primary: true
        }
      };
      expect(() => {
        validateCustomerIds(objToTest);
      }).not.toThrow();
    });
  });

  describe("normalizeCustomerIds", () => {
    it("should add an authenticatedState if missing", () => {
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
          authenticatedState: AUTH_STATES.AMBIGUOUS
        },
        crm: {
          id: "1234",
          authenticatedState: AUTH_STATES.AMBIGUOUS
        }
      };
      expect(normalizeCustomerIds(objToTest)).toEqual(normalizedObj);
    });

    it("should add a valid authState if invalid authState is given", () => {
      const objToTest = {
        email: {
          id: "tester",
          authenticatedState: "login"
        },
        crm: {
          id: "1234",
          authenticatedState: "logout"
        }
      };
      const normalizedObj = {
        email: {
          id: "tester",
          authenticatedState: AUTH_STATES.AMBIGUOUS
        },
        crm: {
          id: "1234",
          authenticatedState: AUTH_STATES.AMBIGUOUS
        }
      };
      expect(normalizeCustomerIds(objToTest)).toEqual(normalizedObj);
    });

    it("should pass through the primary prop", () => {
      const objToTest = {
        email: {
          id: "tester",
          authenticatedState: AUTH_STATES.LOGGEDOUT,
          primary: true
        },
        crm: {
          id: "1234",
          authenticatedState: AUTH_STATES.AMBIGUOUS
        },
        custom: {
          id: "abc",
          primary: false
        }
      };

      const normalizedObj = {
        email: {
          id: "tester",
          authenticatedState: AUTH_STATES.LOGGEDOUT,
          primary: true
        },
        crm: {
          id: "1234",
          authenticatedState: AUTH_STATES.AMBIGUOUS
        },
        custom: {
          id: "abc",
          primary: false,
          authenticatedState: AUTH_STATES.AMBIGUOUS
        }
      };
      expect(normalizeCustomerIds(objToTest)).toEqual(normalizedObj);
    });
  });
});
