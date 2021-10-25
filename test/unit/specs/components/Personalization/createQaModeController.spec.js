import createQaModeController, {
  QA_MODE_STORAGE_NAME
} from "../../../../../src/components/Personalization/createQaModeController";

const mockStorage = (storeValues = {}) => {
  let store = storeValues;
  return {
    session: {
      setItem: (key, value) => {
        store[key] = value;
      },
      getItem: key => {
        return store[key];
      },
      clear: key => {
        delete store[key];
      }
    },
    clearAll: () => {
      store = {};
    }
  };
};

describe("Personalization::createQaModeController", () => {
  const storage = mockStorage();

  beforeEach(() => {
    storage.clearAll();
  });

  it("parses qa mode from url params", () => {
    const qaModeController = createQaModeController({
      storage,
      locationSearch:
        "?at_preview_token=g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs&at_preview_index=1_2&at_preview_listed_activities_only=true&at_preview_evaluate_as_true_audience_ids=12_14&at_preview_evaluate_as_false_audience_ids=13_15"
    });

    expect(qaModeController.getQaMode()).toEqual({
      token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
      listedActivitiesOnly: true,
      previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }],
      evaluateAsTrueAudienceIds: [12, 14],
      evaluateAsFalseAudienceIds: [13, 15]
    });
  });

  it("stores qa mode from url params", () => {
    const qaModeController = createQaModeController({
      storage,
      locationSearch:
        "?at_preview_token=g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs&at_preview_index=1_2&at_preview_listed_activities_only=true"
    });

    let storedQaMode = storage.session.getItem(QA_MODE_STORAGE_NAME);
    expect(storedQaMode).toBeUndefined();

    qaModeController.getQaMode();

    storedQaMode = storage.session.getItem(QA_MODE_STORAGE_NAME);

    expect(JSON.parse(storedQaMode)).toEqual({
      token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
      listedActivitiesOnly: true,
      previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }]
    });
  });

  it("returns undefined if insufficient params", () => {
    const qaModeController = createQaModeController({
      storage,
      locationSearch: ""
    });

    expect(qaModeController.getQaMode()).toBeUndefined();
  });

  it("reads from storage if available and missing sufficient params", () => {
    const qaModeController = createQaModeController({
      storage,
      locationSearch: ""
    });

    storage.session.setItem(
      QA_MODE_STORAGE_NAME,
      JSON.stringify({
        token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
        listedActivitiesOnly: true,
        previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }]
      })
    );

    expect(qaModeController.getQaMode()).toEqual({
      token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
      listedActivitiesOnly: true,
      previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }]
    });
  });
});
