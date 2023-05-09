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

export default ({ eventRegistry }) => {
  const timestamp = new Date();
  const globalContext = {
    currentTimestamp: timestamp.getTime(),
    currentHour: timestamp.getHours(),
    currentMinute: timestamp.getMinutes(),
    currentYear: timestamp.getFullYear(),
    currentMonth: timestamp.getMonth(),
    currentDate: timestamp.getDate(),
    currentDay: timestamp.getDay(),
    pageLoadTime: timestamp.getTime(),
    pageVisitDuration: 0,
    browser: {
      name: getBrowser(window)
    },
    window: {
      height: window.innerHeight,
      width: window.innerWidth,
      scrollY: window.scrollY,
      scrollX: window.scrollX
    },
    page: {
      title: document.title,
      url: window.location.href,
      ...parseUrl(window.location.href)
    },
    referringPage: {
      url: window.document.referrer,
      ...parseUrl(window.document.referrer)
    }
  };

  const updateTimeWindowContext = () => {
    const newTimeStamp = new Date();
    globalContext.currentTimestamp = newTimeStamp.getTime();
    globalContext.currentDate = newTimeStamp.getDate();
    globalContext.currentDay = newTimeStamp.getDay();
    globalContext.currentHour = newTimeStamp.getHours();
    globalContext.currentMinute = newTimeStamp.getMinutes();
    globalContext.currentMonth = newTimeStamp.getMonth();
    globalContext.currentYear = newTimeStamp.getFullYear();
    globalContext.pageVisitDuration =
      newTimeStamp.getTime() - globalContext.pageLoadTime;
    globalContext.window = {
      height: window.innerHeight,
      width: window.innerWidth,
      scrollY: window.scrollY,
      scrollX: window.scrollX
    };
  };

  const getContext = addedContext => {
    updateTimeWindowContext();
    return {
      ...globalContext,
      ...addedContext,
      events: eventRegistry.toJSON()
    };
  };

  return {
    getContext
  };
};
