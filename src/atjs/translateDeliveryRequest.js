/* eslint-disable no-underscore-dangle */

import PAGE_WIDE_SCOPE from "../constants/pageWideScope";
import getPageParams from "./getPageParams";
import flattenObject from "../utils/flattenObject";

const addProfileParams = (data, win = window) => {
  // eslint-disable-next-line no-unused-vars
  const { all, pageLoad } = getPageParams(win);

  const pageParamsAll = flattenObject(all);
  // const pageParamsPageLoad = flattenObject(pageLoad);

  if (!data.__adobe) {
    data.__adobe = {};
  }

  if (!data.__adobe.target) {
    data.__adobe.target = {};
  }

  if (Object.keys(pageParamsAll).length > 0) {
    data.__adobe.target = { ...data.__adobe.target, ...pageParamsAll };
  }
};

export default (options, win = window) => {
  const { xdm = {}, data = {} } = options;

  const { request = {} } = options;
  const { execute, prefetch } = request;

  const decisionScopes = [execute, prefetch]
    .filter(item => typeof item !== "undefined")
    .reduce((tot, cur) => {
      const { mboxes = [] } = cur;
      return [...tot, ...mboxes.map(mbox => mbox.name)];
    }, []);

  if (execute && execute.pageLoad) {
    decisionScopes.push(PAGE_WIDE_SCOPE);
  }

  addProfileParams(data, win);

  return {
    renderDecisions: true,
    decisionScopes,
    xdm,
    data
  };
};
