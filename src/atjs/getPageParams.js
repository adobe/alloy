import { includes } from "../utils";

const SUPPORTED_PARAMS = ["profile"];

const supportedParamsOnly = params => {
  return Object.keys(params).reduce((tot, key) => {
    if (includes(SUPPORTED_PARAMS, key)) {
      tot[key] = params[key];
    }
    return tot;
  }, {});
};

export default (win = window) => {
  const { targetPageParamsAll = () => {}, targetPageParams = () => {} } = win;

  return {
    all: supportedParamsOnly(targetPageParamsAll()),
    pageLoad: supportedParamsOnly(targetPageParams())
  };
};
