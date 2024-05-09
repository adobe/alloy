/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import {
  WEB,
  WEBAPP,
  SURFACE_TYPE_DELIMITER,
  FRAGMENT_DELIMITER,
} from "../constants/surface";
import {
  startsWith,
  isNil,
  isNonEmptyString,
  includes,
} from "../../../utils/index.js";

const SURFACE_REGEX = /^(\w+):\/\/([^/#]+)(\/[^#]*)?(#.*)?$/;
const AUTHORITY_REGEX =
  /^(?:.*@)?(?:[a-z\d\u00a1-\uffff.-]+|\[[a-f\d:]+])(?::\d+)?$/;
const PATH_REGEX = /^\/(?:[/\w\u00a1-\uffff-.~]|%[a-fA-F\d]{2})*$/;
const FRAGMENT_REGEX = /^#(?:[/\w\u00a1-\uffff-.~]|%[a-fA-F\d]{2})+$/;

const normalizePath = (path = "/") => {
  let end = path.length;
  while (end > 0 && "/".indexOf(path.charAt(end - 1)) !== -1) {
    end -= 1;
  }
  return path.substring(0, end) || "/";
};

const getSurfaceType = (surfaceTypeMatch) =>
  isNonEmptyString(surfaceTypeMatch) ? surfaceTypeMatch.toLowerCase() : "";

const getAuthority = (authorityMatch) =>
  isNonEmptyString(authorityMatch) ? authorityMatch.toLowerCase() : "";

const getPath = (pathMatch) =>
  isNonEmptyString(pathMatch) ? normalizePath(pathMatch) : "/";

const parseSurface = (surfaceString) => {
  const matched = surfaceString.match(SURFACE_REGEX);
  return matched
    ? {
        surfaceType: getSurfaceType(matched[1]),
        authority: getAuthority(matched[2]),
        path: getPath(matched[3]),
        fragment: matched[4],
      }
    : null;
};

const stringifySurface = (surface) =>
  `${surface.surfaceType}${SURFACE_TYPE_DELIMITER}${
    surface.authority
  }${surface.path || ""}${surface.fragment || ""}`;

export const buildPageSurface = (getPageLocation) => {
  const location = getPageLocation();
  const host = location.host.toLowerCase();
  const path = location.pathname;
  return WEB + SURFACE_TYPE_DELIMITER + host + normalizePath(path);
};

const expandFragmentSurface = (surface, getPageLocation) =>
  startsWith(surface, FRAGMENT_DELIMITER)
    ? buildPageSurface(getPageLocation) + surface
    : surface;

const validateSurface = (surface, getPageLocation, logger) => {
  const invalidateSurface = (validationError) => {
    logger.warn(validationError);
    return null;
  };

  if (!isNonEmptyString(surface)) {
    return invalidateSurface(`Invalid surface: ${surface}`);
  }
  const expanded = expandFragmentSurface(surface, getPageLocation);
  const parsed = parseSurface(expanded);
  if (parsed === null) {
    return invalidateSurface(`Invalid surface: ${surface}`);
  }
  if (!includes([WEB, WEBAPP], parsed.surfaceType)) {
    return invalidateSurface(
      `Unsupported surface type ${parsed.surfaceType} in surface: ${surface}`,
    );
  }
  if (!parsed.authority || !AUTHORITY_REGEX.test(parsed.authority)) {
    return invalidateSurface(
      `Invalid authority ${parsed.authority} in surface: ${surface}`,
    );
  }
  if (parsed.path && !PATH_REGEX.test(parsed.path)) {
    return invalidateSurface(
      `Invalid path ${parsed.path} in surface: ${surface}`,
    );
  }
  if (parsed.fragment && !FRAGMENT_REGEX.test(parsed.fragment)) {
    return invalidateSurface(
      `Invalid fragment ${parsed.fragment} in surface: ${surface}`,
    );
  }
  return parsed;
};

export const isPageWideSurface = (scope) =>
  !!scope &&
  scope.indexOf(WEB + SURFACE_TYPE_DELIMITER) === 0 &&
  scope.indexOf(FRAGMENT_DELIMITER) === -1;

export const normalizeSurfaces = (surfaces = [], getPageLocation, logger) =>
  surfaces
    .map((surface) => validateSurface(surface, getPageLocation, logger))
    .filter((surface) => !isNil(surface))
    .map(stringifySurface);
