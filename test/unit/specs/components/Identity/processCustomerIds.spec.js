import processCustomerIds from "../../../../../src/components/Identity/processCustomerIds";
import { normalizeCustomerIds } from "../../../../../src/components/Identity/util";

import createCookieProxy from "../../../../../src/core/createCookieProxy";
import createComponentNamespacedCookieJar from "../../../../../src/core/createComponentNamespacedCookieJar";
import { COOKIE_NAMES } from "../../../../../src/components/Identity/constants";
import { crc32 } from "../../../../../src/utils";

const { CUSTOMER_ID_HASH } = COOKIE_NAMES;

const cookieProxy = createCookieProxy("identity", 180);
const cookieJar = createComponentNamespacedCookieJar(
  cookieProxy,
  "component_name"
);

describe("Identity::processCustomerIds", () => {
  beforeEach(() => {
    cookieJar.remove(CUSTOMER_ID_HASH);
  });

  it("should return an object with 3 methods", () => {
    const ids = {
      id1: {
        id: "hello"
      },
      id2: {
        id: "world"
      }
    };
    const idSyncProcess = processCustomerIds(ids);
    expect(idSyncProcess.detectCustomerIdChange).toBeDefined();
    expect(idSyncProcess.updateChecksum).toBeDefined();
    expect(idSyncProcess.getNormalizedAndHashedIds).toBeDefined();
  });

  describe("detectCustomerIdChange", () => {
    it("should return true for 1st id sync", () => {
      const ids = {
        id1: {
          id: "hello"
        },
        id2: {
          id: "world"
        }
      };
      const idSyncProcess = processCustomerIds(ids);
      expect(idSyncProcess.detectCustomerIdChange(cookieJar)).toBe(true);
      idSyncProcess.updateChecksum(cookieJar);
      const idSyncProcessAgain = processCustomerIds(ids);
      expect(idSyncProcessAgain.detectCustomerIdChange(cookieJar)).toBe(false);
    });

    it("should detect if the same object passed in different order", () => {
      const idsOne = {
        id1: {
          id: "hello"
        },
        id2: {
          id: "world!"
        }
      };

      const idSyncProcess = processCustomerIds(idsOne);
      expect(idSyncProcess.detectCustomerIdChange(cookieJar)).toBe(true);
      idSyncProcess.updateChecksum(cookieJar);

      const idsTwo = {
        id2: {
          id: "hello"
        },
        id1: {
          id: "world!"
        }
      };
      const secondIdSyncProcess = processCustomerIds(idsTwo);
      expect(secondIdSyncProcess.detectCustomerIdChange(cookieJar)).toBe(true);
      secondIdSyncProcess.updateChecksum(cookieJar);

      const idsThree = {
        id1: {
          id: "world!"
        },
        id2: {
          id: "hello"
        }
      };
      const thirdIdSyncProcess = processCustomerIds(idsThree);
      expect(thirdIdSyncProcess.detectCustomerIdChange(cookieJar)).toBe(false);
    });
  });
  describe("updateChecksum", () => {
    it("should update checksum to cookie", () => {
      const ids = {
        id1: {
          id: "hello"
        },
        id2: {
          id: "world!"
        }
      };

      const normalizedIds = JSON.stringify(normalizeCustomerIds(ids));
      const idSyncProcess = processCustomerIds(ids);
      idSyncProcess.updateChecksum(cookieJar);
      const testChecksum = crc32(normalizedIds).toString(36);
      expect(cookieJar.get(CUSTOMER_ID_HASH)).toBe(testChecksum);
    });
  });
  describe("getNormalizedAndHashedIds", () => {
    it("should return an object with normalized ids if no has is mentioned", () => {
      const ids = {
        id1: {
          id: "hello"
        },
        id2: {
          id: "world!"
        }
      };

      const normalizedIds = normalizeCustomerIds(ids);
      const idSyncProcess = processCustomerIds(ids);
      idSyncProcess.getNormalizedAndHashedIds().then(normalized => {
        expect(normalized).toEqual(normalizedIds);
      });
    });
    it("should hash Ids with hash property set to true", () => {
      const ids = {
        id1: {
          id: "hello",
          hash: true
        },
        id2: {
          id: "world!"
        }
      };

      const expectedNormalizedAndHashedObj = {
        id1: {
          id:
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
          authState: 0
        },
        id2: {
          id: "world!",
          authState: 0
        }
      };
      const idSyncProcess = processCustomerIds(ids);
      idSyncProcess.getNormalizedAndHashedIds().then(normalized => {
        expect(normalized).toEqual(expectedNormalizedAndHashedObj);
      });
    });
  });
});
