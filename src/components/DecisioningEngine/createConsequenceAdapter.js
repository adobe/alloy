import inAppMessageConsequenceAdapter from "./consequenceAdapters/inAppMessageConsequenceAdapter";

const CJM_IN_APP_MESSAGE_TYPE = "cjmiam";

const adapters = {
  [CJM_IN_APP_MESSAGE_TYPE]: inAppMessageConsequenceAdapter
};

export default () => {
  return consequence => {
    const { id, type, detail } = consequence;

    return typeof adapters[type] === "function"
      ? adapters[type](id, type, detail)
      : detail;
  };
};
