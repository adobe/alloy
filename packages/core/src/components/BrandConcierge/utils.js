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
import {
  getNamespacedCookieName,
  createGetPageLocation,
} from "../../utils/index.js";
import { buildPageSurface } from "../../utils/surfaceUtils.js";
import { BC_SESSION_COOKIE_NAME } from "./constants.js";

export const getPageSurface = () => {
  const pageLocation = createGetPageLocation({ window: window });
  return buildPageSurface(pageLocation);
};

export const getConciergeSessionCookie = ({ loggingCookieJar, config }) => {
  const cookieName = getNamespacedCookieName(
    config.orgId,
    BC_SESSION_COOKIE_NAME,
  );
  return loggingCookieJar.get(cookieName);
};
