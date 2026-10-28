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

import type { Event } from "@adobe/alloy-core/core/types.js";
import { isFunction, toInteger } from "@adobe/alloy-core/utils";

const getScreenOrientationViaProperty = (window: Window) => {
  const {
    screen: { orientation },
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

const getScreenOrientationViaMediaQuery = (window: Window) => {
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

export default (window: Window) => {
  return (event: Event) => {
    const {
      screen: { width, height },
    } = window;
    const device: {
      screenHeight?: number;
      screenWidth?: number;
      screenOrientation?: string;
    } = {};

    const screenHeight = toInteger(height);
    if (screenHeight !== undefined && screenHeight >= 0) {
      device.screenHeight = screenHeight;
    }

    const screenWidth = toInteger(width);
    if (screenWidth !== undefined && screenWidth >= 0) {
      device.screenWidth = screenWidth;
    }

    const orientation =
      getScreenOrientationViaProperty(window) ||
      getScreenOrientationViaMediaQuery(window);
    if (orientation) {
      device.screenOrientation = orientation;
    }
    if (Object.keys(device).length > 0) {
      event.mergeXdm({ device });
    }
  };
};
