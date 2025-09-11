/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createGetPageLocation from "../../utils/dom/createGetPageLocation.js";
import { buildPageSurface } from "../../utils/surfaceUtils.js";
import { sanitizeOrgIdForCookieName } from "../../utils/index.js";
import COOKIE_NAME_PREFIX from "../../constants/cookieNamePrefix.js";
import { BC_SESSION_COOKIE_NAME } from "./constants.js";

export const getPageSurface = () => {
  const pageLocation = createGetPageLocation({ window: window });
  return buildPageSurface(pageLocation);
};

const getPromise = (url, script) => {
  return new Promise((resolve, reject) => {
    script.onload = () => {
      resolve(script);
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };
  });
};
export const executeRemoteScript = (url, id) => {
  if (!id) {
    return;
  }
  // Check if a script with the same ID already exists
  const existingScript = document.getElementById(id);
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  script.id = id;
  if (existingScript) {
    const promise = getPromise(url, script);
    return promise;
  }
  const promise = getPromise(url, script);
  document.head.appendChild(script);
  return promise;
};
export const getConciergeSessionCookieName = (config) => {
  const sanitizedOrgId = sanitizeOrgIdForCookieName(config.orgId);
  return `${COOKIE_NAME_PREFIX}_${sanitizedOrgId}_${BC_SESSION_COOKIE_NAME}`;
};
export const getConciergeSessionCookie = ({ loggingCookieJar, config }) => {
  const cookieName = getConciergeSessionCookieName(config);
  return loggingCookieJar.get(cookieName);
};
