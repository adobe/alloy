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

export {
  urlStartsWithScheme,
  getAbsoluteUrlFromAnchorElement,
  isSupportedAnchorElement
};
