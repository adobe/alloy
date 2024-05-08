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

import { deepAssign, isFunction, toInteger } from "../../utils/index.js";

const getScreenOrientationViaProperty = window => {
  const {
    screen: { orientation }
  } = window;

  if (orientation == null || orientation.type == null) {
    return null;
  }

  const parts = orientation.type.split("-");

  if (parts.length === 0) {
    return null;
  }

  if (parts[0] !== "portrait" && parts[0] !== "landscape") {
    return null;
  }

  return parts[0];
};

const getScreenOrientationViaMediaQuery = window => {
  if (isFunction(window.matchMedia)) {
    if (window.matchMedia("(orientation: portrait)").matches) {
      return "portrait";
    }
    if (window.matchMedia("(orientation: landscape)").matches) {
      return "landscape";
    }
  }

  return null;
};

export default window => {
  return xdm => {
    const {
      screen: { width, height }
    } = window;
    const device = {};

    const screenHeight = toInteger(height);
    if (screenHeight >= 0) {
      device.screenHeight = screenHeight;
    }

    const screenWidth = toInteger(width);
    if (screenWidth >= 0) {
      device.screenWidth = screenWidth;
    }

    const orientation =
      getScreenOrientationViaProperty(window) ||
      getScreenOrientationViaMediaQuery(window);
    if (orientation) {
      device.screenOrientation = orientation;
    }
    if (Object.keys(device).length > 0) {
      deepAssign(xdm, { device });
    }
  };
};
