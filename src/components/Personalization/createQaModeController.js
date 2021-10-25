import { queryString } from "../../utils";

export const QA_MODE_STORAGE_NAME = "qa_mode";

const UNDERSCORE_DELIMITER = "_";

const QA_MODE_URL_PARAM_PREFIX = "at_preview_";
const URL_PARAM_PREVIEW_TOKEN = "at_preview_token";
const URL_PARAM_PREVIEW_INDEX = "at_preview_index";
const URL_PARAM_ACTIVITIES_ONLY = "at_preview_listed_activities_only";
const URL_PARAM_TRUE_AUDIENCE_IDS = "at_preview_evaluate_as_true_audience_ids";
const URL_PARAM_FALSE_AUDIENCE_IDS =
  "at_preview_evaluate_as_false_audience_ids";

const PROPERTY_PREVIEW_TOKEN = "token";
const PROPERTY_PREVIEW_INDEX = "previewIndexes";
const PROPERTY_ACTIVITIES_ONLY = "listedActivitiesOnly";
const PROPERTY_TRUE_AUDIENCE_IDS = "evaluateAsTrueAudienceIds";
const PROPERTY_FALSE_AUDIENCE_IDS = "evaluateAsFalseAudienceIds";

const PROPERTIES_REQUIRED = [
  PROPERTY_PREVIEW_TOKEN,
  PROPERTY_PREVIEW_INDEX,
  PROPERTY_ACTIVITIES_ONLY
];

const intValue = value => parseInt(value, 10);

const isValidQaModeObject = qaMode => {
  if (!qaMode) {
    return false;
  }

  if (typeof qaMode !== "object") {
    return false;
  }

  for (let i = 0; i < PROPERTIES_REQUIRED.length; i += 1) {
    if (!Object.prototype.hasOwnProperty.call(qaMode, PROPERTIES_REQUIRED[i])) {
      return false;
    }
  }

  return true;
};

const getPreviewIndexesFromString = stringValue => {
  const [activityIndex, experienceIndex] = stringValue
    .split(UNDERSCORE_DELIMITER)
    .map(intValue);

  return [
    {
      activityIndex,
      experienceIndex
    }
  ];
};

const qaModeFromQueryString = locationSearch => {
  if (!locationSearch || typeof locationSearch !== "string") {
    return undefined;
  }

  const parsedQueryString = queryString.parse(locationSearch);

  const paramNames = Object.keys(parsedQueryString).filter(name =>
    name.startsWith(QA_MODE_URL_PARAM_PREFIX)
  );

  if (
    !paramNames.includes(URL_PARAM_PREVIEW_TOKEN) ||
    !paramNames.includes(URL_PARAM_PREVIEW_INDEX) ||
    !paramNames.includes(URL_PARAM_ACTIVITIES_ONLY)
  ) {
    return undefined;
  }

  const qaMode = {};

  qaMode[PROPERTY_PREVIEW_TOKEN] = parsedQueryString[URL_PARAM_PREVIEW_TOKEN];

  qaMode[PROPERTY_ACTIVITIES_ONLY] =
    parsedQueryString[URL_PARAM_ACTIVITIES_ONLY] === "true";

  qaMode[PROPERTY_PREVIEW_INDEX] = getPreviewIndexesFromString(
    parsedQueryString[URL_PARAM_PREVIEW_INDEX]
  );

  [
    [URL_PARAM_TRUE_AUDIENCE_IDS, PROPERTY_TRUE_AUDIENCE_IDS],
    [URL_PARAM_FALSE_AUDIENCE_IDS, PROPERTY_FALSE_AUDIENCE_IDS]
  ].forEach(([paramName, qaObjectProperty]) => {
    if (paramNames.includes(paramName)) {
      qaMode[qaObjectProperty] = parsedQueryString[paramName].split(
        UNDERSCORE_DELIMITER
      );
    }
  });

  return qaMode;
};

export default ({ storage, locationSearch }) => {
  const storeQaMode = qaMode => {
    if (!isValidQaModeObject(qaMode)) {
      return;
    }
    storage.session.setItem(QA_MODE_STORAGE_NAME, JSON.stringify(qaMode));
  };

  const getQaModeFromStorage = () => {
    const stringValue = storage.session.getItem(QA_MODE_STORAGE_NAME);
    return stringValue ? JSON.parse(stringValue) : undefined;
  };

  return {
    getQaMode() {
      const qaMode = qaModeFromQueryString(locationSearch);

      if (qaMode) {
        storeQaMode(qaMode);
        return qaMode;
      }

      return getQaModeFromStorage();
    }
  };
};
