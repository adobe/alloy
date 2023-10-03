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
import getBrowser from "../../utils/getBrowser";
import parseUrl from "../../utils/parseUrl";
import flattenObject from "../../utils/flattenObject";

export default ({ eventRegistry, window }) => {
  const pageLoadTimestamp = new Date().getTime();
  const getBrowserContext = () => {
    return {
      name: getBrowser(window)
    };
  };
  const getPageContext = () => {
    return {
      title: window.title,
      url: window.url,
      ...parseUrl(window.url)
    };
  };

  const getReferrerContext = () => {
    return {
      url: window.referrer,
      ...parseUrl(window.referrer)
    };
  };
  const getTimeContext = () => {
    const now = new Date();
    const currentTimestamp = now.getTime();

    return {
      pageLoadTimestamp,
      currentTimestamp,
      currentDate: now.getDate(),
      // Day of the week starts on Monday as is practiced in ISO 8601, but we want it to start on Sunday to match the authoring UI rule
      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.dayofweek":
        now.getDay() + 1,
      "~state.com.adobe.module.lifecycle/lifecyclecontextdata.hourofday": now.getHours(),
      currentMinute: now.getMinutes(),
      currentMonth: now.getMonth(),
      currentYear: now.getFullYear(),
      pageVisitDuration: currentTimestamp - pageLoadTimestamp
    };
  };

  const getWindowContext = () => {
    const height = window.height;
    const width = window.width;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    return {
      height,
      width,
      scrollY,
      scrollX
    };
  };

  const coreGlobalContext = {
    browser: getBrowserContext(),
    page: getPageContext(),
    referringPage: getReferrerContext()
  };

  const getGlobalContext = () => {
    return {
      ...coreGlobalContext,
      ...getTimeContext(),
      window: getWindowContext()
    };
  };

  const getContext = (addedContext = {}) => {
    const context = {
      ...getGlobalContext(),
      ...addedContext
    };

    return {
      ...flattenObject(context),
      events: eventRegistry.getIndexDB()
    };
  };
  return {
    getContext
  };
};
