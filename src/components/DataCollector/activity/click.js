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

const isValidObject = clickObj => {
  if (clickObj) {
    if (clickObj.tagName || clickObj.parentElement || clickObj.parentNode) {
      return true;
    }
  }
  return false;
};

const isSupportedHrefObject = obj => {
  if (
    obj.href &&
    (obj.tagName === "A" || obj.tagName === "AREA") &&
    (!obj.onclick ||
      !obj.protocol ||
      obj.protocol.toLowerCase().indexOf("javascript") < 0)
  ) {
    return true;
  }
  return false;
};

const getObjectHref = obj => {
  const loc = window.location;
  let href = obj.href ? obj.href : "";
  let { protocol, host } = obj;
  let i = href.indexOf(":");
  const j = href.indexOf("?");
  const k = href.indexOf("/");
  if (href && (i < 0 || (j >= 0 && i > j) || (k >= 0 && i > k))) {
    if (!(protocol && protocol.length > 1)) {
      protocol = loc.protocol ? loc.protocol : "";
    }
    protocol = protocol ? `{$protocol}//` : "";
    if (!host) {
      host = loc.host ? loc.host : "";
    }
    i = loc.pathname.lastIndexOf("/");
    href =
      protocol +
      host +
      (href.substring(0, 1) !== "/"
        ? `$loc.pathname.substring(0, i < 0 ? 0 : i)/`
        : "") +
      href;
  }
  return href;
};

const createClickHandler = (config, logger, collect) => {
  return event => {
    // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
    let clickObject = event.target;
    if (!isValidObject(clickObject)) {
      return;
    }

    let objectHref = getObjectHref(clickObject);
    // Iterate through parent objects to obtain valid href
    // TODO: Replace this with generic DOM tool that fetch all configured object properties
    while (clickObject && clickObject.tagName !== "BODY" && !objectHref) {
      clickObject = clickObject.parentElement
        ? clickObject.parentElement
        : clickObject.parentNode;
      if (clickObject) {
        objectHref = getObjectHref(clickObject);
      }
    }
    if (objectHref && isSupportedHrefObject(clickObject)) {
      // TODO: Update name (link name) and type (exit, other, download) to be collected
      collect({
        data: {
          eventType: "web.webinteraction",
          name: "Link Click",
          type: "other",
          URL: objectHref,
          linkClicks: {
            value: 1
          }
        }
      });
    }
  };
};

export default (config, logger, collect) => {
  const enabled = config.get("dataCollector.clickActivity.enabled", true);
  if (!enabled) {
    logger.log("The click activity collector is disabled");
    return;
  }
  const clickHandler = createClickHandler(config, logger, collect);
  if (document && document.addEventListener) {
    document.addEventListener("click", clickHandler, true);
  }
};
