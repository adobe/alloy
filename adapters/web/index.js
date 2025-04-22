import createInstance from "../../src/core/createInstance.js";
import cookieJar from "./utils/cookieJar.js";
import createGetAssuranceToken from "./core/createGetAssuranceToken.js";
import injectStorage from "./utils/injectStorage.js";
import createLoggingCookieJar from "../../src/utils/createLoggingCookieJar.js";

const getMonitors = () => window.__alloyMonitors || [];
const apexDomain = getApexDomain(window, cookieJar);
const createNamespacedStorage = injectStorage(window);
const getAssuranceToken = createGetAssuranceToken({ window, createNamespacedStorage });
const sendRequest = injectSendRequest({ fetch, sendBeacon: navigator.sendBeacon, logger: console });
const loggingCookieJar = createLoggingCookieJar({ logger: console, cookieJar });
const dateProvider = () => new Date();

const getState = (endpointDomain, shouldTransferCookie) => {
  // This tells experience edge that 1st party cookies are acceptable in the response headers
  const state = {
    domain: apexDomain,
    cookiesEnabled: true,
  };
  const isEndpointFirstParty = apexDomain !== "" && endpointDomain.endsWith(apexDomain);

  // If the endpoint is first-party, there's no need to transfer cookies
  // to the payload since they'll be automatically passed through cookie
  // headers.
  if (!isEndpointFirstParty) {
    const cookies = cookieJar.get();

    const entries = Object.keys(cookies)
      .filter(shouldTransferCookie)
      .map((qualifyingCookieName) => {
        return {
          key: qualifyingCookieName,
          value: cookies[qualifyingCookieName],
        };
      });

    if (entries.length) {
      state.entries = entries;
    }
  }
  return state;
};

const updateState = (entries) => {
  entries.forEach(({ key, value }) => {
    const sameSite =
      stateItem.attrs &&
      stateItem.attrs.SameSite &&
      stateItem.attrs.SameSite.toLowerCase();

    if (stateItem.maxAge !== undefined) {
      // cookieJar expects "expires" as a date object
      options.expires = new Date(
        dateProvider().getTime() + stateItem.maxAge * 1000,
      );
    }
    if (sameSite !== undefined) {
      options.sameSite = sameSite;
    }
    // When sameSite is set to none, the secure flag must be set.
    // Experience edge will not set the secure flag in these cases.
    if (sameSite === "none") {
      options.secure = true;
    }

    loggingCookieJar.set(key, value, options);
  });
};

const getStateEntry = (key) => {
  return loggingCookieJar.get(key);
};

// Entry point when there is no page snippet
export const createWebInstance = ({ components, instanceName }) => {

  return createInstance({
    components,
    instanceName,
    getMonitors,
    getAssuranceToken,
    sendRequest,
    getState,
    updateState,
    getStateEntry,
  });
}

const addMonitor = (monitor) => {
  window.__alloyMonitors = window.__alloyMonitors || [];
  window.__alloyMonitors.push(monitor);
};

export const debug = createWebDebug({ addMonitor, storage: createNamespacedStorage("instance.") });

