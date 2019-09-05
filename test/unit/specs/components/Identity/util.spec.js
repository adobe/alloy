import {
  validateCustomerIds,
  normalizeCustomerIds,
  updateCustomerIdState
} from "../../../../../src/components/Identity/util";
import { AUTH_STATES } from "../../../../../src/components/Identity/constants";

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

  describe("update customerIdState", () => {
    it("should return a new state", () => {
      const state = {
        email: {
          id: "me@gmail.com",
          authState: 0
        }
      };
      const newState = updateCustomerIdState({}, state);
      expect(newState).not.toBe(state);
      expect(newState).toEqual(state);
    });
  });
  it("should append values to an existing state", () => {
    const state = {
      email: {
        id: "me@gmail.com",
        authState: 0
      }
    };
    const newState = {
      email: {
        id: "me@gmail.com",
        authState: 1
      },
      crm: {
        id: "1234"
      }
    };
    const expectedState = {
      email: {
        id: "me@gmail.com",
        authState: 1
      },
      crm: {
        id: "1234"
      }
    };
    const updatedState = updateCustomerIdState(state, newState);
    expect(updatedState).not.toBe(state);
    expect(updatedState).not.toBe(newState);

    expect(updatedState).toEqual(expectedState);
  });
});
