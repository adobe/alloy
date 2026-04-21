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

const WEB = "web";
const WEBAPP = "webapp";
const SURFACE_TYPE_DELIMITER = "://";
const FRAGMENT_DELIMITER = "#";

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

const isNonEmptyString = (value) =>
  typeof value === "string" && value.length > 0;
const startsWith = (str, prefix) => str.substr(0, prefix.length) === prefix;
const includes = (arr, item) => arr.indexOf(item) !== -1;

const parseSurface = (surfaceString) => {
  const matched = surfaceString.match(SURFACE_REGEX);
  return matched
    ? {
        surfaceType: isNonEmptyString(matched[1])
          ? matched[1].toLowerCase()
          : "",
        authority: isNonEmptyString(matched[2]) ? matched[2].toLowerCase() : "",
        path: isNonEmptyString(matched[3]) ? normalizePath(matched[3]) : "/",
        fragment: matched[4],
      }
    : null;
};

export const buildPageSurface = (location) => {
  const host = location.host.toLowerCase();
  const path = location.pathname;
  return WEB + SURFACE_TYPE_DELIMITER + host + normalizePath(path);
};

const expandFragmentSurface = (surface, location) =>
  startsWith(surface, FRAGMENT_DELIMITER)
    ? buildPageSurface(location) + surface
    : surface;

export const validateSurface = (surface) => {
  const location = window.location;
  if (!surface) {
    return false;
  }
  const expanded = expandFragmentSurface(surface, location);
  const parsed = parseSurface(expanded);
  if (parsed === null) {
    return `Invalid surface`;
  }
  if (!includes([WEB, WEBAPP], parsed.surfaceType)) {
    return `Unsupported surface type ${parsed.surfaceType}`;
  }
  if (!parsed.authority || !AUTHORITY_REGEX.test(parsed.authority)) {
    return `Invalid authority ${parsed.authority}`;
  }
  if (parsed.path && !PATH_REGEX.test(parsed.path)) {
    return `Invalid path ${parsed.path}`;
  }
  if (parsed.fragment && !FRAGMENT_REGEX.test(parsed.fragment)) {
    return `Invalid fragment ${parsed.fragment}`;
  }
  return false;
};
