/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
export const extractBrowserDetails = () => {
  const userAgent = navigator.userAgent;
  let browserName;
  let browserVersion;

  if (userAgent.indexOf("Firefox") !== -1) {
    browserName = "Firefox";
    browserVersion = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
  } else if (userAgent.indexOf("Edg") !== -1) {
    browserName = "Microsoft Edge";
    browserVersion = userAgent.match(/Edge\/(\d+\.\d+)/)[1];
  } else if (userAgent.indexOf("Chrome") !== -1) {
    browserName = "Google Chrome";
    browserVersion = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
  } else if (userAgent.indexOf("Safari") !== -1) {
    browserName = "Safari";
    browserVersion = userAgent.match(/Version\/(\d+\.\d+)/)[1];
  } else if (
    userAgent.indexOf("MSIE") !== -1 ||
    userAgent.indexOf("Trident/") !== -1
  ) {
    browserName = "Internet Explorer";
    browserVersion = userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+\.\d+)/)[1];
  } else {
    browserName = "Unknown";
    browserVersion = "Unknown";
  }
  return {
    browserName,
    browserVersion
  };
};
