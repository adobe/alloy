/* eslint-disable no-underscore-dangle */

import PAGE_WIDE_SCOPE from "../constants/pageWideScope";
import getPageParams from "./getPageParams";
import flattenObject from "../utils/flattenObject";
import { DISPLAY } from "../constants/eventType";
import { uuid } from "../utils";
import { PropositionEventType } from "../constants/propositionEventType";

const addNotifications = (xdm, notifications, propositionCache) => {
  if (!(notifications instanceof Array) || notifications.length === 0) {
    return;
  }

  xdm.eventType = DISPLAY;

  if (!xdm._experience) {
    xdm._experience = {};
  }

  if (!xdm._experience.decisioning) {
    xdm._experience.decisioning = {};
  }
  if (!xdm._experience.decisioning.propositionEventType) {
    xdm._experience.decisioning.propositionEventType = {};
  }

  xdm._experience.decisioning.propositionEventType[
    PropositionEventType.DISPLAY
  ] = 1;

  xdm._experience.decisioning.propositions = notifications
    .map(notification => {
      const { id = uuid(), mbox = {}, tokens = [] } = notification;
      const { name: scope, state: stateToken } = mbox;

      const eventToken = tokens.length > 0 ? tokens[0] : undefined;

      if (!eventToken) {
        return undefined;
      }

      const cachedProposition = propositionCache.getProposition(
        scope,
        eventToken
      );

      const { scopeDetails = {} } = cachedProposition;
      const { characteristics = {} } = scopeDetails;

      scopeDetails.characteristics = {
        ...characteristics,
        stateToken
      };

      return {
        id,
        scope,
        scopeDetails
      };
    })
    .filter(proposition => typeof proposition !== "undefined");
};

const addProfileParams = (data, win = window) => {
  // eslint-disable-next-line no-unused-vars
  const { all, pageLoad } = getPageParams(win);

  const pageParamsAll = flattenObject(all);
  // const pageParamsPageLoad = flattenObject(pageLoad);

  if (Object.keys(pageParamsAll).length === 0) {
    return;
  }

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

export default (options, propositionCache, win = window) => {
  const { xdm = {}, data = {} } = options;

  const { request = {} } = options;
  const { execute, prefetch, notifications = [] } = request;

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
  addNotifications(xdm, notifications, propositionCache);

  return {
    renderDecisions: true,
    decisionScopes,
    xdm,
    data
  };
};
