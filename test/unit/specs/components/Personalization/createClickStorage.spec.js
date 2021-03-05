import createClickStorage from "../../../../../src/components/Personalization/createClickStorage";

describe("Personalization::createClickStorage", () => {
  let clickStorage;

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

  /*  this is how the clickStorage map should look like
  const expectedClicksInStorage = {
    "div:123:h1": {
      "AT:123": "consent"
    },
    "div:123:h2": {
      "AT:123": "consent",
      "AT:234": "consent"
    }
  }; */
  beforeEach(() => {
    clickStorage = createClickStorage();
  });

  it("returns empty array if empty storage", () => {
    expect(clickStorage.getClickSelectors()).toEqual([]);
  });

  it("returns empty object when no metadata for this selector", () => {
    expect(clickStorage.getClickMetasBySelector("123")).toEqual({});
  });

  it("stores clicks as a map in the click storage and returns the selectors and metadata", () => {
    clickStorage.storeClickMetrics(FIRST_CLICK);
    clickStorage.storeClickMetrics(SECOND_CLICK);
    clickStorage.storeClickMetrics(THIRD_CLICK);
    clickStorage.storeClickMetrics(FORTH_CLICK);

    expect(clickStorage.getClickSelectors().length).toEqual(2);
    expect(clickStorage.getClickMetasBySelector("div:123:h2").length).toEqual(
      2
    );
  });
});
