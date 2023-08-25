/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const urlStartsWithScheme = url => {
  return url && /^[a-z0-9]+:\/\//i.test(url);
};

const getAbsoluteUrlFromAnchorElement = (window, element) => {
  const loc = window.location;
  let url = element.href ? element.href : "";
  let { protocol, host } = element;
  if (!urlStartsWithScheme(url)) {
    if (!protocol) {
      protocol = loc.protocol ? loc.protocol : "";
    }
    protocol = protocol ? `${protocol}//` : "";
    if (!host) {
      host = loc.host ? loc.host : "";
    }
    let path = "";
    if (url.substring(0, 1) !== "/") {
      let indx = loc.pathname.lastIndexOf("/");
      indx = indx < 0 ? 0 : indx;
      path = loc.pathname.substring(0, indx);
    }
    url = `${protocol}${host}${path}/${url}`;
  }
  return url;
};

const isSupportedAnchorElement = element => {
  if (
    element.href &&
    (element.tagName === "A" || element.tagName === "AREA") &&
    (!element.onclick ||
      !element.protocol ||
      element.protocol.toLowerCase().indexOf("javascript") < 0)
  ) {
    return true;
  }
  return false;
};

const trimQueryFromUrl = url => {
  const questionMarkIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");

  if (
    questionMarkIndex >= 0 &&
    (questionMarkIndex < hashIndex || hashIndex < 0)
  ) {
    return url.substring(0, questionMarkIndex);
  }
  if (hashIndex >= 0) {
    return url.substring(0, hashIndex);
  }

  return url;
};

const isDownloadLink = (downloadLinkQualifier, linkUrl, clickedObj) => {
  const re = new RegExp(downloadLinkQualifier);
  const trimmedLinkUrl = trimQueryFromUrl(linkUrl).toLowerCase();
  return clickedObj.download ? true : re.test(trimmedLinkUrl);
};

const isExitLink = (window, linkUrl) => {
  const currentHostname = window.location.hostname.toLowerCase();
  const trimmedLinkUrl = trimQueryFromUrl(linkUrl).toLowerCase();
  if (trimmedLinkUrl.indexOf(currentHostname) >= 0) {
    return false;
  }
  return true;
};

/**
 * Reduces repeated whitespace within a string. Whitespace surrounding the string
 * is trimmed and any occurrence of whitespace within the string is replaced with
 * a single space.
 * @param {string} str String to be formatted.
 * @returns {string} Formatted string.
 */
const truncateWhiteSpace = str => {
  return str && str.replace(/\s+/g, " ").trim();
};

const isEmptyString = str => {
  return !str || str.length === 0;
};
const determineLinkType = (window, config, linkUrl, clickedObj) => {
  let linkType = "other";
  if (isDownloadLink(config.downloadLinkQualifier, linkUrl, clickedObj)) {
    linkType = "download";
  } else if (isExitLink(window, linkUrl)) {
    linkType = "exit";
  }
  return linkType;
};

const findSupportedAnchorElement = targetElement => {
  let node = targetElement;
  while (node) {
    if (isSupportedAnchorElement(node)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
};

export {
  urlStartsWithScheme,
  getAbsoluteUrlFromAnchorElement,
  isSupportedAnchorElement,
  isDownloadLink,
  isEmptyString,
  isExitLink,
  trimQueryFromUrl,
  truncateWhiteSpace,
  findSupportedAnchorElement,
  determineLinkType
};
