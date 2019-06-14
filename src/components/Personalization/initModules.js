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

import createSetHtml from "./actions/setHtml";
import elementExists from "./events/elementExists";

const EXTENSION = "alloy";
const COMPONENT = `${EXTENSION}/personalization`;
const ACTIONS_PREFIX = `${COMPONENT}/src/lib/actions`;
const EVENTS_PREFIX = `${COMPONENT}/src/lib/events`;

export default componentRegistry => {
  const setHtml = createSetHtml(componentRegistry);

  return {
    [`${ACTIONS_PREFIX}/setHtml.js`]: {
      name: "setHtml",
      extensionName: EXTENSION,
      script: module => {
        /* eslint-disable no-param-reassign */
        module.exports = (settings, event) => {
          setHtml(settings, event);
        };
        /* eslint-enable no-param-reassign */
      }
    },
    [`${EVENTS_PREFIX}/elementExists.js`]: {
      name: "elementExists",
      extensionName: EXTENSION,
      script: module => {
        /* eslint-disable no-param-reassign */
        module.exports = (settings, trigger) => {
          elementExists(settings, trigger);
        };
        /* eslint-enable no-param-reassign */
      }
    }
  };
};
