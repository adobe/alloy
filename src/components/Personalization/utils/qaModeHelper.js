import { cookieJar, getApexDomain, queryString } from "../../../utils";

export const QA_MODE_COOKIE_NAME = "at_qa_mode";
const COOKIE_LIFETIME = 1.86e6; // 31 minutes

const UNDERSCORE_DELIMITER = "_";

const QA_MODE_URL_PARAM_PREFIX = "at_preview_";
const URL_PARAM_PREVIEW_TOKEN = "at_preview_token";
const URL_PARAM_PREVIEW_INDEX = "at_preview_index";
const URL_PARAM_ACTIVITIES_ONLY = "at_preview_listed_activities_only";
const URL_PARAM_TRUE_AUDIENCE_IDS = "at_preview_evaluate_as_true_audience_ids";
const URL_PARAM_FALSE_AUDIENCE_IDS =
  "at_preview_evaluate_as_false_audience_ids";

const COOKIE_PROPERTY_PREVIEW_TOKEN = "token";
const COOKIE_PROPERTY_PREVIEW_INDEX = "previewIndexes";
const COOKIE_PROPERTY_ACTIVITIES_ONLY = "listedActivitiesOnly";
const COOKIE_PROPERTY_TRUE_AUDIENCE_IDS = "evaluateAsTrueAudienceIds";
const COOKIE_PROPERTY_FALSE_AUDIENCE_IDS = "evaluateAsFalseAudienceIds";

const COOKIE_PROPERTIES_REQUIRED = [
  COOKIE_PROPERTY_PREVIEW_TOKEN,
  COOKIE_PROPERTY_PREVIEW_INDEX,
  COOKIE_PROPERTY_ACTIVITIES_ONLY
];

const apexDomain = getApexDomain(window, cookieJar);

const intValue = value => parseInt(value, 10);

const isValidQaModeCookie = qaMode => {
  if (!qaMode) {
    return false;
  }

  if (typeof qaMode !== "object") {
    return false;
  }

  for (let i = 0; i < COOKIE_PROPERTIES_REQUIRED.length; i += 1) {
    if (
      !Object.prototype.hasOwnProperty.call(
        qaMode,
        COOKIE_PROPERTIES_REQUIRED[i]
      )
    ) {
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

const qaModeObjectFromQueryString = locationSearch => {
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

  qaMode[COOKIE_PROPERTY_PREVIEW_TOKEN] =
    parsedQueryString[URL_PARAM_PREVIEW_TOKEN];

  qaMode[COOKIE_PROPERTY_ACTIVITIES_ONLY] =
    parsedQueryString[URL_PARAM_ACTIVITIES_ONLY] === "true";

  qaMode[COOKIE_PROPERTY_PREVIEW_INDEX] = getPreviewIndexesFromString(
    parsedQueryString[URL_PARAM_PREVIEW_INDEX]
  );

  [
    [URL_PARAM_TRUE_AUDIENCE_IDS, COOKIE_PROPERTY_TRUE_AUDIENCE_IDS],
    [URL_PARAM_FALSE_AUDIENCE_IDS, COOKIE_PROPERTY_FALSE_AUDIENCE_IDS]
  ].forEach(([paramName, qaObjectProperty]) => {
    if (paramNames.includes(paramName)) {
      qaMode[qaObjectProperty] = parsedQueryString[paramName]
        .split(UNDERSCORE_DELIMITER)
        .map(intValue);
    }
  });

  return qaMode;
};

const setQaModeCookie = qaMode => {
  if (!isValidQaModeCookie(qaMode)) {
    return;
  }
  cookieJar.set(QA_MODE_COOKIE_NAME, JSON.stringify(qaMode), {
    domain: apexDomain,
    expires: new Date(Date.now() + COOKIE_LIFETIME)
  });
};

const getQaModeCookie = () => {
  const cookieString = cookieJar.get(QA_MODE_COOKIE_NAME);
  return cookieString ? JSON.parse(cookieString) : undefined;
};

export default {
  getQaMode(locationSearch) {
    const qaMode = qaModeObjectFromQueryString(locationSearch);

    if (qaMode) {
      setQaModeCookie(qaMode);
      return qaMode;
    }

    return getQaModeCookie();
  }
};
