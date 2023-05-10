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

export default ({ eventRegistry }, currentWindow) => {
  const initialTimeStamp = new Date();
  const getPageLoadTime = () => {
    const pageLoadTime = initialTimeStamp.getTime();
    return {
      pageLoadTime
    };
  };
  const getBrowserContext = () => {
    return {
      name: getBrowser(currentWindow)
    };
  };
  const getPageContext = () => {
    return {
      title: currentWindow.title,
      url: currentWindow.url,
      ...parseUrl(currentWindow.url)
    };
  };

  const getReferrerContext = () => {
    return {
      url: currentWindow.referrer,
      ...parseUrl(currentWindow.referrer)
    };
  };
  const getTimeContext = () => {
    const newTimeStamp = new Date();
    return {
      currentTimestamp: newTimeStamp.getTime(),
      currentDate: newTimeStamp.getDate(),
      currentDay: newTimeStamp.getDay(),
      currentHour: newTimeStamp.getHours(),
      currentMinute: newTimeStamp.getMinutes(),
      currentMonth: newTimeStamp.getMonth(),
      currentYear: newTimeStamp.getFullYear(),
      pageVisitDuration: newTimeStamp.getTime() - getPageLoadTime().pageLoadTime
    };
  };

  const getWindowContext = () => {
    const height = currentWindow.height;
    const width = currentWindow.width;
    const scrollY = currentWindow.scrollY;
    const scrollX = currentWindow.scrollX;
    return {
      height,
      width,
      scrollY,
      scrollX
    };
  };

  const getContext = addedContext => {
    getTimeContext();
    getWindowContext();
    return {
      ...addedContext,
      ...getTimeContext(),
      ...getPageLoadTime(),
      browser: getBrowserContext(),
      page: getPageContext(),
      referringPage: getReferrerContext(),
      window: getWindowContext(),
      events: eventRegistry.toJSON()
    };
  };
  return {
    getContext
  };
};
