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
import { extractBrowserDetails } from "../../utils/extractBrowserDetails";

export default ({ eventRegistry }) => {
  const { browserName, browserVersion } = extractBrowserDetails();
  const timestamp = new Date();
  const globalContext = {
    timePageLoaded: timestamp.getTime(),
    datePageLoaded: timestamp.getDate(),
    dayPageLoaded: timestamp.getDay(),
    currentDate: timestamp.getDate(),
    currentTime: timestamp.getTime(),
    currentDay: timestamp.getDay(),
    scrollPosition: window.scrollY,
    browserDetails: {
      browserName,
      browserVersion
    },
    pageContext: {
      pageName: document.title,
      pageURL: window.location.href,
      pageReferrer: document.referrer,
      pageHeight: window.innerHeight,
      pageWidth: window.innerWidth
    }
  };

  setInterval(() => {
    const currentTimestamp = new Date();
    globalContext.currentTime = currentTimestamp.getTime();
    globalContext.currentDate = currentTimestamp.getDate();
    globalContext.currentDay = currentTimestamp.getDay();
  }, 1000);

  const getContext = addedContext => {
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
