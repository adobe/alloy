import {
  validateIdentities,
  normalizeIdentities
} from "../../../../../../src/components/Identity/identities/util";
import {
  AMBIGUOUS,
  LOGGED_OUT
} from "../../../../../../src/components/Identity/constants/authStates";

describe("Identity::identityUtil", () => {
  describe("validateIdentities", () => {
    it("should throw an error when input is not an object", () => {
      const idToTest = "email=qwerty@asdf.com";
      expect(() => {
        validateIdentities(idToTest);
      }).toThrow(
        new Error(
          "Invalid identity format. Each namespace should be an object."
        )
      );
    });
    it("should throw an error when each key is not an object", () => {
      const objToTest = {
        email: "qwerty@asdf.com",
        authState: 0
      };
      expect(() => {
        validateIdentities(objToTest);
      }).toThrow(
        new Error(
          "Invalid identity format. Each namespace should be an object."
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
        validateIdentities(objToTest);
      }).toThrow(
        new Error(
          "Invalid identity format. Each namespace object should have an ID."
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
        validateIdentities(objToTest);
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
        validateIdentities(objToTest);
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
        validateIdentities(objToTest);
      }).not.toThrow();
    });
  });

  describe("normalizeIdentities", () => {
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
          authenticatedState: AMBIGUOUS
        },
        crm: {
          id: "1234",
          authenticatedState: AMBIGUOUS
        }
      };
      expect(normalizeIdentities(objToTest)).toEqual(normalizedObj);
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
          authenticatedState: AMBIGUOUS
        },
        crm: {
          id: "1234",
          authenticatedState: AMBIGUOUS
        }
      };
      expect(normalizeIdentities(objToTest)).toEqual(normalizedObj);
    });

    it("should pass through the primary prop", () => {
      const objToTest = {
        email: {
          id: "tester",
          authenticatedState: LOGGED_OUT,
          primary: true
        },
        crm: {
          id: "1234",
          authenticatedState: AMBIGUOUS
        },
        custom: {
          id: "abc",
          primary: false
        }
      };

      const normalizedObj = {
        email: {
          id: "tester",
          authenticatedState: LOGGED_OUT,
          primary: true
        },
        crm: {
          id: "1234",
          authenticatedState: AMBIGUOUS
        },
        custom: {
          id: "abc",
          primary: false,
          authenticatedState: AMBIGUOUS
        }
      };
      expect(normalizeIdentities(objToTest)).toEqual(normalizedObj);
    });
  });
});
