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

// TODO: Can/Should we use the value exported from src/constants/namespace.js
// for our key prefix?
const KEY_PREFIX = "___alloy";
const KEY_DETECT_PREFIX = `${KEY_PREFIX}-detect`;

function hash(string) {
  let result = 0;
  const { length } = string;

  for (let i = 0; i < length; i += 1) {
    /* eslint-disable */
    result = ((result << 5) - result + string.charCodeAt(i)) & 0xffffffff;
    /* eslint-enable */
  }

  return result;
}

function buildKey(prefix, selector) {
  return `${prefix}-${hash(selector)}`;
}

function createStyleTag(className, content) {
  const style = document.createElement("style");
  style.className = className;
  style.innerHTML = content;

  return style;
}

function appendTo(parent, element) {
  parent.appendChild(element);
}

function removeFrom(parent, element) {
  parent.removeChild(element);
}

function setupElementDetection(key, selector, callback) {
  const content = `
    @keyframes ${key} {  
      from { opacity: 0.99; }
      to { opacity: 1; }  
    }

    ${selector} {
      animation-duration: 0.001s;
      animation-name: ${key};
    }
    `;

  document.addEventListener("animationstart", callback, false);
  appendTo(document.head, createStyleTag(key, content));
}

function hideElement(selector) {
  const key = buildKey(KEY_PREFIX, selector);
  const content = `${selector} { visibility: hidden }`;

  appendTo(document.head, createStyleTag(key, content));
}

function showElement(selector) {
  const key = buildKey(KEY_PREFIX, selector);
  const elements = document.querySelectorAll(`.${key}`);

  elements.forEach(e => removeFrom(document.head, e));
}

function render(cache, event, logger) {
  const { animationName } = event;

  if (animationName.indexOf(KEY_DETECT_PREFIX) === -1) {
    return;
  }

  const option = cache[animationName];

  if (!option) {
    logger.log("Element with key:", animationName, "not in cache");
    return;
  }

  const { type, selector, content } = option;

  switch (type) {
    case "setHtml":
      /* eslint-disable */
      event.target.innerHTML = content;
      /* eslint-enable */

      showElement(selector);
      break;
    default:
      logger.log(type, "rendering is not supported");
      break;
  }
}

const createPersonalization = ({ logger }) => {
  const storage = {};
  let componentRegistry;

  const collect = offerInfo => {
    componentRegistry.getCommand("event")(offerInfo);
  };

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        ({ componentRegistry } = tools);
      },
      onBeforeEvent(event, isViewStart) {
        if (isViewStart) {
          console.log("Personalization:::onBeforeEvent");
          event.mergeQuery({
            personalization: {
              prefetch: {
                views: true
              },
              execute: {
                pageLoad: true
              }
            }
          });
        }
      },
      onBeforeRequest(payload) {
        payload.mergeMeta({
          personalization: {
            client: "demo12",
            sessionID: "12344566"
          }
        });
      },
      // TODO: pull personalization data from response fragments, which requires
      //  Jon's network gateway work

      onResponse(response) {
        // eslint-disable-next-line no-unreachable
        console.log("Personalization:::onResponse");
        const personalization =
          response.getPayloadByType("personalization:run") || [];

        // Caution!!! Here comes Target black magic

        personalization.forEach(option => {
          const { selector, eventToken } = option;
          const key = buildKey(KEY_DETECT_PREFIX, selector);
          storage[key] = option;

          hideElement(selector);
          setupElementDetection(key, selector, event => {
            render(storage, event, logger);
            collect({ data: { offerInfo: eventToken } });
          });
        });
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

export default createPersonalization;
