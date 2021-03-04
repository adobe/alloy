import createClickStorage from "../../../../../src/components/Personalization/createClickStorage";

describe("Personalization::createClickStorage", () => {
  let clickStorageManager;

  const FIRST_CLICK = {
    selector: "div:123:h2",
    meta: {
      id: "AT:123",
      scope: "__view__"
    }
  };
  const SECOND_CLICK = {
    selector: "div:123:h2",
    meta: {
      id: "AT:123",
      scope: "consent"
    }
  };
  const THIRD_CLICK = {
    selector: "div:123:h2",
    meta: {
      id: "AT:234",
      scope: "consent"
    }
  };
  const FORTH_CLICK = {
    selector: "div:123:h1",
    meta: {
      id: "AT:123",
      scope: "consent"
    }
  };

  const expectedClicksInStorage = {
    "div:123:h1": {
      "AT:123": "consent"
    },
    "div:123:h2": {
      "AT:123": "consent",
      "AT:234": "consent"
    }
  };
  beforeEach(() => {
    clickStorageManager = createClickStorage();
  });

  it("initializes the clickStorage with an empty object", () => {
    expect(clickStorageManager.clickStorage).toEqual({});
  });

  it("stores clicks as a map in the click storage", () => {
    clickStorageManager.store(FIRST_CLICK);
    clickStorageManager.store(SECOND_CLICK);
    clickStorageManager.store(THIRD_CLICK);
    clickStorageManager.store(FORTH_CLICK);

    expect(clickStorageManager.clickStorage).toEqual(expectedClicksInStorage);
  });
});
