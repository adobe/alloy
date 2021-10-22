import qaModeHelper, {
  QA_MODE_COOKIE_NAME
} from "../../../../../../src/components/Personalization/utils/qaModeHelper";
import { cookieJar } from "../../../../../../src/utils";

describe("Personalization::qaModeHelper", () => {
  afterEach(() => {
    cookieJar.remove(QA_MODE_COOKIE_NAME);
  });
  it("parses qa mode from url params", () => {
    expect(
      qaModeHelper.getQaMode(
        "?at_preview_token=g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs&at_preview_index=1_2&at_preview_listed_activities_only=true&at_preview_evaluate_as_true_audience_ids=12_14&at_preview_evaluate_as_false_audience_ids=13_15"
      )
    ).toEqual({
      token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
      listedActivitiesOnly: true,
      previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }],
      evaluateAsTrueAudienceIds: [12, 14],
      evaluateAsFalseAudienceIds: [13, 15]
    });
  });

  it("sets a cookie with qa mode from url params", () => {
    let cookie = cookieJar.get(QA_MODE_COOKIE_NAME);
    expect(cookie).toBeUndefined();

    qaModeHelper.getQaMode(
      "?at_preview_token=g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs&at_preview_index=1_2&at_preview_listed_activities_only=true"
    );

    cookie = cookieJar.get(QA_MODE_COOKIE_NAME);

    expect(JSON.parse(cookie)).toEqual({
      token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
      listedActivitiesOnly: true,
      previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }]
    });
  });

  it("returns undefined if insufficient params", () => {
    expect(
      qaModeHelper.getQaMode(
        "?at_preview_token=g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs"
      )
    ).toBeUndefined();
  });

  it("reads cookie if available and missing sufficient params", () => {
    cookieJar.set(
      QA_MODE_COOKIE_NAME,
      JSON.stringify({
        token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
        listedActivitiesOnly: true,
        previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }]
      })
    );

    expect(qaModeHelper.getQaMode("")).toEqual({
      token: "g3PFzsGla-P0L3BEgkx-3awMH6U-J5MY5SqWCDuHAhs",
      listedActivitiesOnly: true,
      previewIndexes: [{ activityIndex: 1, experienceIndex: 2 }]
    });
  });
});
