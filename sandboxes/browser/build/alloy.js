/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
(function () {
  "use strict";

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

  var createInstanceFunction = (executeCommand) => {
    return ([resolve, reject, [commandName, options]]) => {
      executeCommand(commandName, options).then(resolve, reject);
    };
  };

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

  /**
   * Returns true when the value is null.
   * @param {*} value
   * @returns {boolean}
   */
  var isNil = (value) => value == null;

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

  /**
   * Returns whether the value is an object.
   * @param {*} value
   * @returns {boolean}
   */
  var isObject = (value) =>
    !isNil(value) && !Array.isArray(value) && typeof value === "object";

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
  var assignConcatArrayValues = (...values) => {
    if (values.length < 2) {
      // if the number of args is 0 or 1, just use the default behavior from Object.assign
      return Object.assign(...values);
    }
    return values.reduce((accumulator, currentValue) => {
      if (isObject(currentValue)) {
        Object.keys(currentValue).forEach((key) => {
          if (Array.isArray(currentValue[key])) {
            if (Array.isArray(accumulator[key])) {
              accumulator[key].push(...currentValue[key]);
            } else {
              // clone the array so the original isn't modified.
              accumulator[key] = [...currentValue[key]];
            }
          } else {
            accumulator[key] = currentValue[key];
          }
        });
      }
      return accumulator;
    }); // no default value to pass into reduce because we want to skip the first value
  };

  /*! js-cookie v3.0.5 | MIT */
  /* eslint-disable no-var */
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        target[key] = source[key];
      }
    }
    return target;
  }
  /* eslint-enable no-var */

  /* eslint-disable no-var */
  var defaultConverter = {
    read: function (value) {
      if (value[0] === '"') {
        value = value.slice(1, -1);
      }
      return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function (value) {
      return encodeURIComponent(value).replace(
        /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
        decodeURIComponent,
      );
    },
  };
  /* eslint-enable no-var */

  /* eslint-disable no-var */

  function init(converter, defaultAttributes) {
    function set(name, value, attributes) {
      if (typeof document === "undefined") {
        return;
      }
      attributes = assign({}, defaultAttributes, attributes);
      if (typeof attributes.expires === "number") {
        attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
      }
      if (attributes.expires) {
        attributes.expires = attributes.expires.toUTCString();
      }
      name = encodeURIComponent(name)
        .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
        .replace(/[()]/g, escape);
      var stringifiedAttributes = "";
      for (var attributeName in attributes) {
        if (!attributes[attributeName]) {
          continue;
        }
        stringifiedAttributes += "; " + attributeName;
        if (attributes[attributeName] === true) {
          continue;
        }

        // Considers RFC 6265 section 5.2:
        // ...
        // 3.  If the remaining unparsed-attributes contains a %x3B (";")
        //     character:
        // Consume the characters of the unparsed-attributes up to,
        // not including, the first %x3B (";") character.
        // ...
        stringifiedAttributes += "=" + attributes[attributeName].split(";")[0];
      }
      return (document.cookie =
        name + "=" + converter.write(value, name) + stringifiedAttributes);
    }
    function get(name) {
      if (typeof document === "undefined" || (arguments.length && !name)) {
        return;
      }

      // To prevent the for loop in the first place assign an empty array
      // in case there are no cookies at all.
      var cookies = document.cookie ? document.cookie.split("; ") : [];
      var jar = {};
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split("=");
        var value = parts.slice(1).join("=");
        try {
          var found = decodeURIComponent(parts[0]);
          jar[found] = converter.read(value, found);
          if (name === found) {
            break;
          }
        } catch (e) {}
      }
      return name ? jar[name] : jar;
    }
    return Object.create(
      {
        set,
        get,
        remove: function (name, attributes) {
          set(
            name,
            "",
            assign({}, attributes, {
              expires: -1,
            }),
          );
        },
        withAttributes: function (attributes) {
          return init(this.converter, assign({}, this.attributes, attributes));
        },
        withConverter: function (converter) {
          return init(assign({}, this.converter, converter), this.attributes);
        },
      },
      {
        attributes: {
          value: Object.freeze(defaultAttributes),
        },
        converter: {
          value: Object.freeze(converter),
        },
      },
    );
  }
  var api = init(defaultConverter, {
    path: "/",
  });

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

  var cookieJar = {
    get: api.get.bind(api),
    set: api.set.bind(api),
    remove: api.remove.bind(api),
    withConverter: api.withConverter.bind(api),
  };

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

  const deepAssignObject = (target, source) => {
    Object.keys(source).forEach((key) => {
      if (isObject(target[key]) && isObject(source[key])) {
        deepAssignObject(target[key], source[key]);
        return;
      }
      target[key] = source[key];
    });
  };

  /**
   * Recursively copy the values of all enumerable own properties from a source item to a target item if the both items are objects
   * @param {Object} target - a target object
   * @param {...Object} source - an array of source objects
   * @example
   * deepAssign({ a: 'a', b: 'b' }, { b: 'B', c: 'c' });
   * // { a: 'a', b: 'B', c: 'c' }
   */
  var deepAssign = (target, ...sources) => {
    if (isNil(target)) {
      throw new TypeError('deepAssign "target" cannot be null or undefined');
    }
    const result = Object(target);
    sources.forEach((source) => deepAssignObject(result, Object(source)));
    return result;
  };

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

  /**
   * Creates a function that, when passed an object of updates, will merge
   * the updates onto the current value of a payload property.
   * @param {Object} content The base object to modify
   * @param {String } key The property to merge updates into. This
   * can be a dot-notation property path.
   * @returns {Function}
   */
  var createMerger = (content, key) => (updates) => {
    const propertyPath = key.split(".");
    const hostObjectForUpdates = propertyPath.reduce((obj, propertyName) => {
      obj[propertyName] = obj[propertyName] || {};
      return obj[propertyName];
    }, content);
    deepAssign(hostObjectForUpdates, updates);
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Allows callbacks to be registered and then later called. When the
   * callbacks are called, their responses are combined into a single promise.
   */
  var createCallbackAggregator = () => {
    const callbacks = [];
    return {
      add(callback) {
        callbacks.push(callback);
      },
      call(...args) {
        // While this utility doesn't necessarily need to be doing the
        // Promise.all, it's currently useful everywhere this is used and
        // reduces repetitive code. We can factor it out later if we want
        // to make this utility more "pure".
        return Promise.all(callbacks.map((callback) => callback(...args)));
      },
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createLoggingCookieJar = ({ logger, cookieJar }) => {
    return {
      ...cookieJar,
      set(key, value, options) {
        logger.info("Setting cookie", {
          name: key,
          value,
          ...options,
        });
        cookieJar.set(key, value, options);
      },
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Sequences tasks.
   */
  var createTaskQueue = () => {
    let queueLength = 0;
    let lastPromiseInQueue = Promise.resolve();
    return {
      /**
       * Add a task to the queue. If no task is currenty running,
       * the task will begin immediately.
       * @param {Function} task A function that will be called when
       * the task should be run. If the task it asynchronous, it should
       * return a promise.
       * @returns {Promise} A promise that will be resolved or rejected
       * with whatever value the task resolved or rejects its promise.
       */
      addTask(task) {
        queueLength += 1;
        const lastPromiseFulfilledHandler = () => {
          return task().finally(() => {
            queueLength -= 1;
          });
        };
        lastPromiseInQueue = lastPromiseInQueue.then(
          lastPromiseFulfilledHandler,
          lastPromiseFulfilledHandler,
        );
        return lastPromiseInQueue;
      },
      /**
       * How many tasks are in the queue. This includes the task
       * that's currently running.
       * @returns {number}
       */
      get length() {
        return queueLength;
      },
    };
  };

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

  /**
   * A simple utility for managing a promise's state outside of
   * the promise's "executor" (the function passed into the constructor).
   */
  var defer = () => {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
  };

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
  const REFERENCE_EQUALITY = (a, b) => a === b;
  const findIndex = (array, item, isEqual) => {
    for (let i = 0; i < array.length; i += 1) {
      if (isEqual(array[i], item)) {
        return i;
      }
    }
    return -1;
  };
  var deduplicateArray = (array, isEqual = REFERENCE_EQUALITY) => {
    return array.filter(
      (item, index) => findIndex(array, item, isEqual) === index,
    );
  };

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

  var appendNode = (parent, node) => {
    return parent.appendChild(node);
  };

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

  const populateElementProperties = (element, props) => {
    Object.keys(props).forEach((key) => {
      // The following is to support setting style properties to avoid CSP errors.
      if (key === "style" && isObject(props[key])) {
        const styleProps = props[key];
        Object.keys(styleProps).forEach((styleKey) => {
          element.style[styleKey] = styleProps[styleKey];
        });
      } else {
        element[key] = props[key];
      }
    });
  };
  var createNode = (
    tag,
    attrs = {},
    props = {},
    children = [],
    doc = document,
  ) => {
    const result = doc.createElement(tag);
    Object.keys(attrs).forEach((key) => {
      // TODO: To highlight CSP problems consider throwing a descriptive error
      //       if nonce is available and key is style.
      result.setAttribute(key, attrs[key]);
    });
    populateElementProperties(result, props);
    children.forEach((child) => appendNode(result, child));
    return result;
  };

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

  const BODY = "BODY";
  const IFRAME = "IFRAME";
  const IMG = "IMG";
  const DIV = "DIV";
  const STYLE = "STYLE";
  const SCRIPT = "SCRIPT";
  const HEAD = "HEAD";

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

  /**
   * Fires an image pixel from the current document's window.
   * @param {object} currentDocument
   * @param {string} src
   * @returns {Promise}
   */
  var fireImageInDocument = ({ src, currentDocument = document }) => {
    return new Promise((resolve, reject) => {
      const attrs = {
        src,
      };
      const props = {
        onload: resolve,
        onerror: reject,
        onabort: reject,
      };
      createNode(IMG, attrs, props, [], currentDocument);
    });
  };

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

  /**
   * Returns whether the value is a function.
   * @param {*} value
   * @returns {boolean}
   */
  var isFunction = (value) => typeof value === "function";

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

  /**
   * Returns whether the value is a non-empty array.
   * @param {*} value
   * @returns {boolean}
   */
  var isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

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

  var toArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value == null) {
      return [];
    }
    return [].slice.call(value);
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const SIBLING_PATTERN = /^\s*>/;
  var querySelectorAll = (context, selector) => {
    if (!SIBLING_PATTERN.test(selector)) {
      return toArray(context.querySelectorAll(selector));
    }
    return toArray(context.querySelectorAll(":scope " + selector));
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var SHADOW_SEPARATOR = ":shadow";

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const splitWithShadow = (selector) => {
    return selector.split(SHADOW_SEPARATOR);
  };
  const transformPrefix = (parent, selector) => {
    const result = selector;
    const hasChildCombinatorPrefix = result.startsWith(">");
    if (!hasChildCombinatorPrefix) {
      return result;
    }
    const prefix =
      parent instanceof Element || parent instanceof Document
        ? ":scope"
        : ":host"; // see https://bugs.webkit.org/show_bug.cgi?id=233380

    return prefix + " " + result;
  };
  var selectNodesWithShadow = (context, selector) => {
    const parts = splitWithShadow(selector);
    if (parts.length < 2) {
      return querySelectorAll(context, selector);
    }

    // split the selector into parts separated by :shadow pseudo-selectors
    // find each subselector element based on the previously selected node's shadowRoot
    let parent = context;
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i].trim();
      // if part is empty, it means there's a chained :eq:shadow selector
      if (part === "" && parent.shadowRoot) {
        parent = parent.shadowRoot;
        continue;
      }
      const prefixed = transformPrefix(parent, part);
      const partNode = querySelectorAll(parent, prefixed);
      if (partNode.length === 0 || !partNode[0] || !partNode[0].shadowRoot) {
        return partNode;
      }
      parent = partNode[0].shadowRoot;
    }
    return undefined;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isShadowSelector = (str) => str.indexOf(SHADOW_SEPARATOR) !== -1;

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

  /**
   * Returns an array of matched DOM nodes.
   * @param {String} selector
   * @param {Node} [context=document] defaults to document
   * @returns {Array} an array of DOM nodes
   */
  var selectNodes = (selector, context = document) => {
    if (!isShadowSelector(selector)) {
      return querySelectorAll(context, selector);
    }
    return selectNodesWithShadow(context, selector);
  };

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

  const MUTATION_OBSERVER = "MutationObserver";
  const RAF = "requestAnimationFrame";
  const MUTATION_OBSERVER_CONFIG = {
    childList: true,
    subtree: true,
  };
  const VISIBILITY_STATE = "visibilityState";
  const VISIBLE = "visible";
  const DELAY = 100;
  const MAX_POLLING_TIMEOUT = 5000;
  const createError = (selector) => {
    return new Error("Could not find: " + selector);
  };
  const createPromise = (executor) => {
    return new Promise(executor);
  };
  const canUseMutationObserver = (win) => {
    return isFunction(win[MUTATION_OBSERVER]);
  };
  const awaitUsingMutationObserver = (
    win,
    doc,
    selector,
    timeout,
    selectFunc,
  ) => {
    return createPromise((resolve, reject) => {
      let timer;
      const mutationObserver = new win[MUTATION_OBSERVER](() => {
        const nodes = selectFunc(selector);
        if (isNonEmptyArray(nodes)) {
          mutationObserver.disconnect();
          if (timer) {
            clearTimeout(timer);
          }
          resolve(nodes);
        }
      });
      timer = setTimeout(() => {
        mutationObserver.disconnect();
        reject(createError(selector));
      }, timeout);
      mutationObserver.observe(doc, MUTATION_OBSERVER_CONFIG);
    });
  };
  const canUseRequestAnimationFrame = (doc) => {
    return doc[VISIBILITY_STATE] === VISIBLE;
  };
  const awaitUsingRequestAnimation = (win, selector, timeout, selectFunc) => {
    return createPromise((resolve, reject) => {
      const execute = () => {
        const nodes = selectFunc(selector);
        if (isNonEmptyArray(nodes)) {
          resolve(nodes);
          return;
        }
        win[RAF](execute);
      };
      execute();
      setTimeout(() => {
        reject(createError(selector));
      }, timeout);
    });
  };
  const awaitUsingTimer = (selector, timeout, selectFunc) => {
    return createPromise((resolve, reject) => {
      const execute = () => {
        const nodes = selectFunc(selector);
        if (isNonEmptyArray(nodes)) {
          resolve(nodes);
          return;
        }
        setTimeout(execute, DELAY);
      };
      execute();
      setTimeout(() => {
        reject(createError(selector));
      }, timeout);
    });
  };
  var awaitSelector = (
    selector,
    selectFunc = selectNodes,
    timeout = MAX_POLLING_TIMEOUT,
    win = window,
    doc = document,
  ) => {
    const nodes = selectFunc(selector);
    if (isNonEmptyArray(nodes)) {
      return Promise.resolve(nodes);
    }
    if (canUseMutationObserver(win)) {
      return awaitUsingMutationObserver(
        win,
        doc,
        selector,
        timeout,
        selectFunc,
      );
    }
    if (canUseRequestAnimationFrame(doc)) {
      return awaitUsingRequestAnimation(win, selector, timeout, selectFunc);
    }
    return awaitUsingTimer(selector, timeout, selectFunc);
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  let nonce$1;

  /**
   * Returns the nonce if available.
   * @param {Node} [context=document] defaults to document
   * @returns {(String|undefined)} the nonce or undefined if not available
   */
  const getNonce$1 = (context = document) => {
    if (nonce$1 === undefined) {
      const n = context.querySelector("[nonce]");
      // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
      //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946
      nonce$1 = n && (n.nonce || n.getAttribute("nonce"));
    }
    return nonce$1;
  };

  /**
   * Loads an external JavaScript file using Alloy's DOM utilities.
   * Enhanced version that supports additional script attributes.
   * @param {string} url The URL of the script to load.
   * @param {Object} options Additional options for script loading
   * @param {Object} options.attributes Additional attributes to set on script element
   * @param {Function} options.onLoad Optional callback when script loads successfully
   * @param {Function} options.onError Optional callback when script fails to load
   * @returns {Promise<void>} A promise that resolves when the script is loaded or rejects on error.
   */
  const loadScript$1 = (url, options = {}) => {
    // Check if script already exists
    if (document.querySelector('script[src="' + url + '"]')) {
      if (options.onLoad) options.onLoad();
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const { attributes = {}, onLoad, onError } = options;
      const script = createNode(
        "script",
        {
          type: "text/javascript",
          src: url,
          async: true,
          ...(getNonce$1() && {
            nonce: getNonce$1(),
          }),
          ...attributes, // Allow additional attributes like crossorigin
        },
        {
          onload: () => {
            if (onLoad) onLoad();
            resolve();
          },
          onerror: () => {
            const error = new Error("Failed to load script: " + url);
            if (onError) onError(error);
            reject(error);
          },
        },
      );
      const appendToDOM = () => {
        const parent = document.head || document.body;
        if (parent) {
          appendNode(parent, script);
        } else {
          const error = new Error(
            "Neither <head> nor <body> available for script insertion.",
          );
          if (onError) onError(error);
          reject(error);
        }
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", appendToDOM);
      } else {
        appendToDOM();
      }
    });
  };

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

  /**
   * Returns true if element matches the selector.
   * @param {String} selector
   * @param {Node} [element]
   * @returns {Boolean}
   */
  var matchesSelector = (selector, element) => {
    if (element.matches) {
      return element.matches(selector);
    }

    // Making IE 11 happy
    return element.msMatchesSelector(selector);
  };

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

  var removeNode = (node) => {
    const parent = node.parentNode;
    if (parent) {
      return parent.removeChild(node);
    }
    return null;
  };

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

  const IFRAME_ATTRS = {
    name: "Adobe Alloy",
  };
  const IFRAME_PROPS = {
    style: {
      display: "none",
      width: 0,
      height: 0,
    },
  };
  var injectFireReferrerHideableImage = ({
    appendNode: appendNode$1 = appendNode,
    awaitSelector: awaitSelector$1 = awaitSelector,
    createNode: createNode$1 = createNode,
    fireImage = fireImageInDocument,
  } = {}) => {
    const fireOnPage = fireImage;
    let hiddenIframe;
    const createIframe = () => {
      return awaitSelector$1(BODY).then(([body]) => {
        if (hiddenIframe) {
          return hiddenIframe;
        }
        hiddenIframe = createNode$1(IFRAME, IFRAME_ATTRS, IFRAME_PROPS);
        return appendNode$1(body, hiddenIframe);
      });
    };
    const fireInIframe = ({ src }) => {
      return createIframe().then((iframe) => {
        const currentDocument = iframe.contentWindow.document;
        return fireImage({
          src,
          currentDocument,
        });
      });
    };
    return (request) => {
      const { hideReferrer, url } = request;
      return hideReferrer
        ? fireInIframe({
            src: url,
          })
        : fireOnPage({
            src: url,
          });
    };
  };

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

  /**
   * Returns whether the value is an empty object.
   * @param {*} value
   * @returns {boolean}
   */
  var isEmptyObject = (value) =>
    isObject(value) && Object.keys(value).length === 0;

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Given an object and a function that takes a value and returns a predicate, filter out
   * all non-object deeply nested values that do not pass the predicate.
   *
   * Example: filterObject({ a: 2, b: { c: 6 } }, (val) => val > 5) returns { b { c: 6 } }
   *
   * @param {*} obj
   * @param {* => boolean} predicate a function that takes a value and return a boolean,
   * representing if it should be included in the result object or not.
   * @returns A copy of the original object with the values that fail the predicate, filtered out.
   */
  const filterObject = (obj, predicate) => {
    if (isNil(obj) || !isObject(obj)) {
      return obj;
    }
    return Object.keys(obj).reduce((result, key) => {
      const value = obj[key];
      if (isObject(value)) {
        // value is object, go deeper
        const filteredValue = filterObject(value, predicate);
        if (isEmptyObject(filteredValue)) {
          return result;
        }
        return {
          ...result,
          [key]: filteredValue,
        };
      }
      // value is not an object, test predicate
      if (predicate(value)) {
        return {
          ...result,
          [key]: value,
        };
      }
      return result;
    }, {});
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /* eslint-disable no-bitwise */

  /**
   * Generates an FNV1A32 hash for the given input string.
   * @param {string} str - The string to hash
   * @returns {number} - The 32-bit FNV1A hash as a number
   */
  const fnv1a32 = (str) => {
    // FNV_offset_basis for 32-bit hash
    let hash = 0x811c9dc5;

    // FNV_prime for 32-bit hash
    const prime = 0x01000193;

    // Convert the string to a properly encoded UTF-8 byte array
    const utf8Encoder = new TextEncoder();
    const bytes = utf8Encoder.encode(str);

    // Process each byte in the UTF-8 encoded array
    for (let i = 0; i < bytes.length; i += 1) {
      // XOR the hash with the byte value, then multiply by prime
      hash ^= bytes[i];
      hash = Math.imul(hash, prime);
    }

    // Return the final hash value (unsigned 32-bit integer)
    return hash >>> 0;
  };

  /**
   * Generates an FNV1A32 hash and returns it as a hexadecimal string.
   * @param {string} str - The string to hash
   * @returns {string} - The 32-bit FNV1A hash as a hexadecimal string
   */
  const fnv1a32Hex = (str) => fnv1a32(str).toString(16).padStart(8, "0");

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

  var baseNamespace = "com.adobe.alloy.";

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

  /**
   * Returns the last N number of items from an array.
   * @param {Array} arr
   * @param {number} itemCount
   * @returns {Array}
   */
  var getLastArrayItems = (arr, itemCount) => arr.slice(-itemCount);

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

  const cookieName = baseNamespace + "getTld";

  /**
   * Of the current web page's hostname, this is the top-most domain that is
   * not a "public suffix" as outlined in https://publicsuffix.org/. In other
   * words, this is top-most domain that is able to accept cookies.
   * @param {Object} window
   * @param {Object} cookieJar
   * @returns {string}
   */
  var getApexDomain = (window, cookieJar) => {
    let topLevelCookieDomain = "";

    // If hostParts.length === 1, we may be on localhost.
    const hostParts = window.location.hostname.toLowerCase().split(".");
    let i = 1;
    while (i < hostParts.length && !cookieJar.get(cookieName)) {
      i += 1;
      topLevelCookieDomain = getLastArrayItems(hostParts, i).join(".");
      cookieJar.set(cookieName, cookieName, {
        domain: topLevelCookieDomain,
      });
    }
    cookieJar.remove(cookieName, {
      domain: topLevelCookieDomain,
    });
    return topLevelCookieDomain;
  };

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

  // Remember to also incorporate the org ID wherever cookies are read or written.
  var COOKIE_NAME_PREFIX = "kndctr";

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

  var sanitizeOrgIdForCookieName = (orgId) => orgId.replace("@", "_");

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

  var getNamespacedCookieName = (orgId, key) =>
    COOKIE_NAME_PREFIX + "_" + sanitizeOrgIdForCookieName(orgId) + "_" + key;

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

  /**
   * Group an array by a key getter provided
   * @param {Array} arr Array to iterate over.
   * @param {Function} keyGetter The key getter by which to group.
   * @returns {Object}
   */
  var groupBy = (arr, keyGetter) => {
    const result = {};
    arr.forEach((item) => {
      const key = keyGetter(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    });
    return result;
  };

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

  const CHROME = "Chrome";
  const EDGE$1 = "Edge";
  const EDGE_CHROMIUM = "EdgeChromium";
  const FIREFOX = "Firefox";
  const IE = "IE";
  const SAFARI = "Safari";
  const UNKNOWN = "Unknown";

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var lazy = (fn) => {
    let called = false;
    let result;
    return () => {
      if (!called) {
        called = true;
        result = fn();
      }
      return result;
    };
  };

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

  // Users could have also disabled third-party cookies within these browsers, but
  // we don't know. We also assume "unknown" browsers support third-party cookies,
  // though we don't really know that either. We're making best guesses.
  const browsersSupportingThirdPartyCookie = [
    CHROME,
    EDGE$1,
    EDGE_CHROMIUM,
    IE,
    UNKNOWN,
  ];
  var injectAreThirdPartyCookiesSupportedByDefault = ({ getBrowser }) =>
    lazy(() => browsersSupportingThirdPartyCookie.includes(getBrowser()));

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

  const IDENTITY = "identity";
  const CONSENT = "consent";
  const CLUSTER = "cluster";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectDoesIdentityCookieExist = ({ orgId }) => {
    const identityCookieName = getNamespacedCookieName(orgId, IDENTITY);
    /**
     * Returns whether the identity cookie exists.
     */
    return () => Boolean(cookieJar.get(identityCookieName));
  };

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

  const matchUserAgent = (regexs, userAgent) => {
    const keys = Object.keys(regexs);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const regex = regexs[key];
      if (regex.test(userAgent)) {
        return key;
      }
    }
    return UNKNOWN;
  };
  var injectGetBrowser = ({ userAgent }) => {
    return lazy(() =>
      matchUserAgent(
        {
          /*
      The MIT License (MIT)
      Copyright (c) 2019 Damon Oehlman damon.oehlman@gmail.com
      Permission is hereby granted, free of charge, to any person obtaining a copy
      of this software and associated documentation files (the "Software"), to
      deal in the Software without restriction, including without limitation the
      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
      sell copies of the Software, and to permit persons to whom the Software is
      furnished to do so, subject to the following conditions:
      The above copyright notice and this permission notice shall be included in
      all copies or substantial portions of the Software.
      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
      DEALINGS IN THE SOFTWARE.
      */
          // Regular expression patterns were copied from
          // https://github.com/DamonOehlman/detect-browser
          // These are only the browsers that Alloy officially supports.
          /* eslint-disable */
          [EDGE$1]: /Edge\/([0-9\._]+)/,
          // Edge Chromium can dynamically change its user agent string based
          // on the host site:
          // https://winaero.com/blog/microsoft-edge-chromium-dynamically-changes-its-user-agent/
          [EDGE_CHROMIUM]: /Edg\/([0-9\.]+)/,
          [CHROME]: /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/,
          [FIREFOX]: /Firefox\/([0-9\.]+)(?:\s|$)/,
          // This only covers version 11 of IE, but that's all we support.
          [IE]: /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/,
          [SAFARI]: /Version\/([0-9\._]+).*Safari/,
          /* eslint-enable */
        },
        userAgent,
      ),
    );
  };

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

  const getStorageByType = (context, storageType, namespace) => {
    // When storage is disabled on Safari, the mere act of referencing
    // window.localStorage or window.sessionStorage throws an error.
    // For this reason, we wrap in a try-catch.
    return {
      /**
       * Reads a value from storage.
       * @param {string} name The name of the item to be read.
       * @returns {string}
       */
      getItem(name) {
        try {
          return context[storageType].getItem(namespace + name);
        } catch {
          return null;
        }
      },
      /**
       * Saves a value to storage.
       * @param {string} name The name of the item to be saved.
       * @param {string} value The value of the item to be saved.
       * @returns {boolean} Whether the item was successfully saved to storage.
       */
      setItem(name, value) {
        try {
          context[storageType].setItem(namespace + name, value);
          return true;
        } catch {
          return false;
        }
      },
      /**
       * Clear all values in storage that match the namespace.
       */
      clear() {
        try {
          Object.keys(context[storageType]).forEach((key) => {
            if (key.startsWith(namespace)) {
              context[storageType].removeItem(key);
            }
          });
          return true;
        } catch {
          return false;
        }
      },
    };
  };
  var injectStorage = (context) => (additionalNamespace) => {
    const finalNamespace = baseNamespace + additionalNamespace;
    return {
      session: getStorageByType(context, "sessionStorage", finalNamespace),
      persistent: getStorageByType(context, "localStorage", finalNamespace),
    };
  };

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
  /**
   * Returns items that are found within both arrays.
   * @param {Array} a
   * @param {Array} b
   * @returns {Array}
   */
  var intersection = (a, b) => a.filter((x) => b.includes(x));

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

  /**
   * Returns whether the value is a boolean.
   * @param {*} value
   * @returns {boolean}
   */
  var isBoolean = (value) => typeof value === "boolean";

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

  /**
   * Returns whether the value is a number.
   * @param {*} value
   * @returns {boolean}
   */
  var isNumber$1 = (value) => typeof value === "number" && !Number.isNaN(value);

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

  /**
   * Returns whether the value is an integer.
   * @param {*} value
   * @returns {boolean}
   */
  var isInteger = (value) => {
    const parsed = parseInt(value, 10);
    return isNumber$1(parsed) && value === parsed;
  };

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

  /**
   * Determines whether a cookie name is namespaced according to the contract
   * defined by the server.
   * @param {String} orgId The org ID configured for the Alloy instance.
   * @param {String} name The cookie name.
   * @returns {boolean}
   */
  var isNamespacedCookieName = (orgId, name) =>
    name.indexOf(
      COOKIE_NAME_PREFIX + "_" + sanitizeOrgIdForCookieName(orgId) + "_",
    ) === 0;

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

  /**
   * Returns whether the value is a string.
   * @param {*} value
   * @returns {boolean}
   */
  var isString = (value) => typeof value === "string";

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

  /**
   * Returns whether the value is a populated string.
   * @param {*} value
   * @returns {boolean}
   */
  var isNonEmptyString = (value) => isString(value) && value.length > 0;

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

  /**
   * A function that performs no operations.
   */
  var noop = () => {};

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
  const parseDomainBasic = (host) => {
    const result = {};
    const domainParts = host.split(".");
    switch (domainParts.length) {
      case 1:
        result.subdomain = "";
        result.domain = host;
        result.topLevelDomain = "";
        break;
      case 2:
        result.subdomain = "";
        result.domain = host;
        result.topLevelDomain = domainParts[1];
        break;
      case 3:
        result.subdomain = domainParts[0] === "www" ? "" : domainParts[0];
        result.domain = host;
        result.topLevelDomain = domainParts[2];
        break;
      case 4:
        result.subdomain = domainParts[0] === "www" ? "" : domainParts[0];
        result.domain = host;
        result.topLevelDomain = domainParts[2] + "." + domainParts[3];
        break;
    }
    return result;
  };

  /**
   * @typedef {Object} ParseUriResult
   * @property {string} host
   * @property {string} path
   * @property {string} query
   * @property {string} anchor
   *
   * @param {string} url
   * @returns {ParseUriResult}
   */
  const parseUri = (url) => {
    try {
      const parsed = new URL(url);
      let path = parsed.pathname;
      if (!url.endsWith("/") && path === "/") {
        path = "";
      }
      return {
        host: parsed.hostname,
        path,
        query: parsed.search.replace(/^\?/, ""),
        anchor: parsed.hash.replace(/^#/, ""),
      };
    } catch {
      return {
        host: "",
        path: "",
        query: "",
        anchor: "",
      };
    }
  };
  const parseUrl = (url, parseDomain = parseDomainBasic) => {
    if (!isString(url)) {
      url = "";
    }
    const parsed = parseUri(url);
    const { host, path, query, anchor } = parsed;
    return {
      path,
      query,
      fragment: anchor,
      ...parseDomain(host),
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // We want to avoid mapping between specific keys because we want Konductor
  // to be able to add overrides in the future without us needing to make
  // any changes to the Web SDK
  var prepareConfigOverridesForEdge = (configuration) => {
    if (isNil(configuration) || typeof configuration !== "object") {
      return null;
    }
    // remove entries that are empty strings or arrays
    const configOverrides = filterObject(configuration, (value) => {
      if (isNil(value)) {
        return false;
      }
      if (isBoolean(value)) {
        return true;
      }
      if (isNumber$1(value)) {
        return true;
      }
      if (isNonEmptyString(value)) {
        return true;
      }
      if (isNonEmptyArray(value)) {
        return true;
      }
      return false;
    });
    if (isEmptyObject(configOverrides)) {
      return null;
    }
    return configOverrides;
  };

  function getDefaultExportFromCjs(x) {
    return x &&
      x.__esModule &&
      Object.prototype.hasOwnProperty.call(x, "default")
      ? x["default"]
      : x;
  }

  /***************************************************************************************
   * (c) 2017 Adobe. All rights reserved.
   * This file is licensed to you under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License. You may obtain a copy
   * of the License at http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software distributed under
   * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
   * OF ANY KIND, either express or implied. See the License for the specific language
   * governing permissions and limitations under the License.
   ****************************************************************************************/
  var reactorQueryString;
  var hasRequiredReactorQueryString;
  function requireReactorQueryString() {
    if (hasRequiredReactorQueryString) return reactorQueryString;
    hasRequiredReactorQueryString = 1;

    /**
     * Parse a query string into an object. Leading `?` or `#` are ignored, so you
     * can pass `location.search` or `location.hash` directly.
     *
     * URL components are decoded with decode-uri-component.
     *
     * Parse arrays with elements using duplicate keys, e.g. ?a=1&a=2 becomes
     * {a: ['1', '2']}.
     *
     * Query keys are sorted alphabetically.
     *
     * Numbers and booleans are NOT parsed; they are left as strings.
     * @param {string} query the query part of a url
     * @returns {{ [key: string]: string | string[] | undefined }} the parsed query string
     */
    var parseQueryString = function (query) {
      /** @type {{[key: string]: string | string[] | undefined }} */
      var result = {};
      if (!query || typeof query !== "string") {
        return result;
      }
      var cleanQuery = query.trim().replace(/^[?#&]/, "");
      var params = new URLSearchParams(cleanQuery);
      var iter = params.keys();
      do {
        var v = iter.next();
        var key = v.value;
        if (key) {
          var values = params.getAll(key);
          if (values.length === 1) {
            result[key] = values[0];
          } else {
            result[key] = values;
          }
        }
      } while (v.done === false);
      return result;
    };

    /**
     * Transform an object into a query string.
     *
     * Keys having object values are ignored.
     *
     * @param {object} the object to transform into a query string
     * @returns {string} the parsed query string
     */

    var stringifyObject = function (object) {
      var spaceToken = "{{space}}";
      var params = new URLSearchParams();
      Object.keys(object).forEach(function (key) {
        var value = object[key];
        if (typeof object[key] === "string") {
          value = value.replace(/ /g, spaceToken);
        } else if (
          ["object", "undefined"].includes(typeof value) &&
          !Array.isArray(value)
        ) {
          value = "";
        }
        if (Array.isArray(value)) {
          value.forEach(function (arrayValue) {
            params.append(key, arrayValue);
          });
        } else {
          params.append(key, value);
        }
      });
      return params
        .toString()
        .replace(new RegExp(encodeURIComponent(spaceToken), "g"), "%20");
    };

    // We proxy the underlying querystring module so we can limit the API we expose.
    // This allows us to more easily make changes to the underlying implementation later without
    // having to worry about breaking extensions. If extensions demand additional functionality, we
    // can make adjustments as needed.
    reactorQueryString = {
      parse: function (string) {
        return parseQueryString(string);
      },
      stringify: function (object) {
        return stringifyObject(object);
      },
    };
    return reactorQueryString;
  }

  var reactorQueryStringExports = requireReactorQueryString();
  var queryString = /*@__PURE__*/ getDefaultExportFromCjs(
    reactorQueryStringExports,
  );

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Recursively sorts the properties of all objects within the provided data structure.
   * @param {Object|Array} data - The data structure to serialize. It can be an object or an array.
   * @returns {Object|Array} - A new object or array with allo the container object having properties sorted.
   */
  const sortObjectPropertiesDeep = (data) => {
    if (Array.isArray(data)) {
      return data.map((value) => sortObjectPropertiesDeep(value));
    }
    if (typeof data === "object" && data !== null) {
      return Object.keys(data)
        .sort()
        .reduce((memo, key) => {
          memo[key] = sortObjectPropertiesDeep(data[key]);
          return memo;
        }, {});
    }
    return data;
  };

  /**
   * This utility helps create consistent serialized representations of objects
   * by eliminating variations caused by property order. This is useful for creating
   * reliable hashes or checksums containing these objects.
   * @param {Object|Array} data - The data structure to serialize. It can be an object or an array.
   * @returns {Object|Array} - A new object or array with allo the container object having properties sorted.
   */
  var sortObjectKeysRecursively = (data) => sortObjectPropertiesDeep(data);

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

  /**
   * Creates and returns a new error using the provided value as a message.
   * If the provided value is already an Error, it will be returned unmodified.
   * @param {*} value
   * @returns {Error}
   */
  var toError = (value) => {
    return value instanceof Error ? value : new Error(value);
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var updateErrorMessage = ({ error, message }) => {
    try {
      error.message = message;
    } catch {
      // We'll set a new message when we can, but some errors, like DOMException,
      // have a read-only message property, which limits our options.
    }
  };

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

  /**
   * Augments an error's message with additional context as it bubbles up the call stack.
   * @param {Object} options
   * @param {String} options.message The message to be added to the error.
   * @param {Error} options.error Optimally, this is an instance of Error. If it is not,
   * this is used as the basis for the message of a newly created Error instance.
   * @returns {*}
   */
  var stackError = ({ error, message }) => {
    const errorToStack = toError(error);
    const newMessage = message + "\nCaused by: " + errorToStack.message;
    updateErrorMessage({
      error: errorToStack,
      message: newMessage,
    });
    return errorToStack;
  };

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
  var stringToBoolean = (str) => {
    return isString(str) && str.toLowerCase() === "true";
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /*
   * coerce `value` to a number or return `defaultValue` if it cannot be.
   *
   * The coersion is attempted if value is a number or string.
   */
  var toInteger = (value, defaultValue) => {
    if (isNumber$1(value) || isString(value)) {
      const n = Math.round(Number(value));
      if (!Number.isNaN(n)) {
        return n;
      }
    }
    return defaultValue;
  };

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

  /**
   * Add padString to the start of the string until it reaches the target length
   *
   * Different from String.prototype.padStart because this function coerces the
   * input to a string before padding.
   * @param {any} string
   * @param {number} targetLength
   * @param {string} padString
   * @returns {string}
   */
  const padStart = (string, targetLength, padString) => {
    return ("" + string).padStart(targetLength, padString);
  };

  /**
   * Formats the date into an ISO date-time string in the local timezone
   * @param {Date} date
   * @returns {string}
   */
  var toISOStringLocal = (date) => {
    const YYYY = date.getFullYear();
    const MM = padStart(date.getMonth() + 1, 2, "0");
    const DD = padStart(date.getDate(), 2, "0");
    const hh = padStart(date.getHours(), 2, "0");
    const mm = padStart(date.getMinutes(), 2, "0");
    const ss = padStart(date.getSeconds(), 2, "0");
    const mmm = padStart(date.getMilliseconds(), 3, "0");

    // The time-zone offset is the difference, in minutes, from local time to UTC. Note that this
    // means that the offset is positive if the local timezone is behind UTC and negative if it is
    // ahead. For example, for time zone UTC+10:00, -600 will be returned.
    const timezoneOffset = toInteger(date.getTimezoneOffset(), 0);
    const ts = timezoneOffset > 0 ? "-" : "+";
    const th = padStart(Math.floor(Math.abs(timezoneOffset) / 60), 2, "0");
    const tm = padStart(Math.abs(timezoneOffset) % 60, 2, "0");
    return (
      YYYY +
      "-" +
      MM +
      "-" +
      DD +
      "T" +
      hh +
      ":" +
      mm +
      ":" +
      ss +
      "." +
      mmm +
      ts +
      th +
      ":" +
      tm
    );
  };

  const byteToHex = [];
  for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (
      byteToHex[arr[offset + 0]] +
      byteToHex[arr[offset + 1]] +
      byteToHex[arr[offset + 2]] +
      byteToHex[arr[offset + 3]] +
      "-" +
      byteToHex[arr[offset + 4]] +
      byteToHex[arr[offset + 5]] +
      "-" +
      byteToHex[arr[offset + 6]] +
      byteToHex[arr[offset + 7]] +
      "-" +
      byteToHex[arr[offset + 8]] +
      byteToHex[arr[offset + 9]] +
      "-" +
      byteToHex[arr[offset + 10]] +
      byteToHex[arr[offset + 11]] +
      byteToHex[arr[offset + 12]] +
      byteToHex[arr[offset + 13]] +
      byteToHex[arr[offset + 14]] +
      byteToHex[arr[offset + 15]]
    ).toLowerCase();
  }

  let getRandomValues;
  const rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      if (typeof crypto === "undefined" || !crypto.getRandomValues) {
        throw new Error(
          "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported",
        );
      }
      getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
  }

  const randomUUID =
    typeof crypto !== "undefined" &&
    crypto.randomUUID &&
    crypto.randomUUID.bind(crypto);
  var native = {
    randomUUID,
  };

  function v4(options, buf, offset) {
    if (native.randomUUID && !buf && !options) {
      return native.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
      offset = offset || 0;
      if (offset < 0 || offset + 16 > buf.length) {
        throw new RangeError(
          "UUID byte range " +
            offset +
            ":" +
            (offset + 15) +
            " is out of buffer bounds",
        );
      }
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }

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

  /**
   * Wraps a validator returning the value if it is null or undefined, otherwise
   * it will call the original validator and return the result.
   *
   * @param {function} validator - the validator to call if the value is not null
   */
  const skipIfNull = (validator) =>
    function skipIfNullValidator(value, path) {
      return value == null ? value : validator.call(this, value, path);
    };

  /**
   * Returns a new validator that calls the first validator and then calls the second
   * validator with the result of the first validator. The result of the second validator
   * is returned.
   *
   * @param {function} firstValidator - validator to call first
   * @param {function} secondValidator - validator to call second
   * @returns {function} - a new validator that calls the first and second validators
   */
  const callSequentially = (firstValidator, secondValidator) =>
    function callSequentiallyValidator(value, path) {
      return secondValidator.call(
        this,
        firstValidator.call(this, value, path),
        path,
      );
    };

  /**
   * Just like callSequentially, but if either validator throws an error, the errors
   * are collected and thrown at the end.
   *
   * @param {function} firstValidator
   * @param {function} secondValidator
   * @returns {function}
   */
  const callSequentiallyJoinErrors = (firstValidator, secondValidator) =>
    function callSequentiallyJoinErrorsValidator(value, path) {
      const errors = [];
      const newValue = [firstValidator, secondValidator].reduce(
        (memo, validator) => {
          try {
            return validator.call(this, memo, path);
          } catch (e) {
            errors.push(e);
            return memo;
          }
        },
        value,
      );
      if (errors.length) {
        throw new Error(errors.join("\n"));
      }
      return newValue;
    };

  /**
   * Chains two validators together. In addition to calling the validators in
   * sequence, this will also copy over methods from the base validator to the
   * resulting validator and include any additional methods.
   *
   * @param {function} baseValidator - This validator will be called first, and its
   * methods will be copied over to the returned validator.
   * @param {function} newValidator - This validator will be called second.
   * @param {object} additionalMethods - Additional methods to include on the returned
   * validator.
   * @returns {function}
   */
  const chain = (baseValidator, newValidator, additionalMethods) => {
    return Object.assign(
      callSequentially(baseValidator, newValidator),
      baseValidator,
      additionalMethods,
    );
  };

  /**
   * Chains two validators together, but skips the second validator if the value
   * is null. In addition to calling the validators in sequence, this will also
   * copy over methods from the base validator to the resulting validator and
   * include any additional methods.
   *
   * @param {function} baseValidator - This validator will be called first, and its
   * methods will be copied over to the returned validator.
   * @param {function} newValidator - This validator will be called second. If the value
   * is null after the first validator is called, this validator will not be
   * called.
   * @param {object} additionalMethods - Additional methods to include on the returned
   * validator.
   * @returns {function}
   */
  const nullSafeChain = (baseValidator, newValidator, additionalMethods) => {
    return Object.assign(
      callSequentially(baseValidator, skipIfNull(newValidator)),
      baseValidator,
      additionalMethods,
    );
  };

  /**
   * Same as nullSafeChain, but calls the new validator first.
   *
   * @param {function} baseValidator - This validator will be called second, and its
   * methods will be copied over to the returned validator.
   * @param {function} newValidator - This validator will be called first. If the value
   * is null, this validator will not be called.
   * @param {function} additionalMethods - Additional methods to include on the returned
   * validator.
   * @returns {function}
   */
  const reverseNullSafeChainJoinErrors = (
    baseValidator,
    newValidator,
    additionalMethods,
  ) => {
    return Object.assign(
      callSequentiallyJoinErrors(skipIfNull(newValidator), baseValidator),
      baseValidator,
      additionalMethods,
    );
  };

  /**
   * Throws an error if the value is not valid.
   *
   * @param {boolean} isValid - Whether or not the value is valid.
   * @param {*} value - The value to validate.
   * @param {string} path - The path to the value.
   * @param {string} message - The expected part of the error message.
   * @throws {Error} - Throws an error if the value is not valid.
   * @returns {void}
   */
  const assertValid = (isValid, value, path, message) => {
    if (!isValid) {
      throw new Error(
        "'" +
          path +
          "': Expected " +
          message +
          ", but got " +
          JSON.stringify(value) +
          ".",
      );
    }
  };

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

  var booleanValidator = (value, path) => {
    assertValid(isBoolean(value), value, path, "true or false");
    return value;
  };

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
  var callbackValidator = (value, path) => {
    assertValid(isFunction(value), value, path, "a function");
    return value;
  };

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
  var createAnyOfValidator = (validators, message) =>
    function anyOf(value, path) {
      let newValue;
      const valid = validators.find((validator) => {
        try {
          newValue = validator.call(this, value, path);
          return true;
        } catch {
          return false;
        }
      });
      assertValid(valid, value, path, message);
      return newValue;
    };

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
  var createArrayOfValidator = (elementValidator) =>
    function arrayOf(value, path) {
      assertValid(Array.isArray(value), value, path, "an array");
      const errors = [];
      const validatedArray = value.map((subValue, i) => {
        try {
          return elementValidator.call(
            this,
            subValue,
            path + "[" + i + "]",
            value,
          );
        } catch (e) {
          errors.push(e.message);
          return undefined;
        }
      });
      if (errors.length) {
        throw new Error(errors.join("\n"));
      }
      return validatedArray;
    };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createDefaultValidator = (defaultValue) => (value) => {
    if (value == null) {
      return defaultValue;
    }
    return value;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createDeprecatedValidator = (
    warning = "This field has been deprecated",
  ) =>
    function deprecated(value, path) {
      let message = warning;
      if (value !== undefined) {
        if (path) {
          message = "'" + path + "': " + message;
        }
        if (this && this.logger) {
          this.logger.warn(message);
        }
      }
      return value;
    };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createLiteralValidator = (literalValue) => (value, path) => {
    assertValid(value === literalValue, value, path, "" + literalValue);
    return value;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createMapOfValuesValidator = (valueValidator) =>
    function mapOfValues(value, path) {
      assertValid(isObject(value), value, path, "an object");
      const errors = [];
      const validatedObject = {};
      Object.keys(value).forEach((subKey) => {
        const subValue = value[subKey];
        const subPath = path ? path + "." + subKey : subKey;
        try {
          const validatedValue = valueValidator.call(this, subValue, subPath);
          if (validatedValue !== undefined) {
            validatedObject[subKey] = validatedValue;
          }
        } catch (e) {
          errors.push(e.message);
        }
      });
      if (errors.length) {
        throw new Error(errors.join("\n"));
      }
      return validatedObject;
    };

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
  var createMinimumValidator = (typeName, minimum) => (value, path) => {
    assertValid(
      value >= minimum,
      value,
      path,
      typeName + " greater than or equal to " + minimum,
    );
    return value;
  };

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
  var createMaximumValidator = (typeName, maximum) => (value, path) => {
    assertValid(
      value <= maximum,
      value,
      path,
      typeName + " less than or equal to " + maximum,
    );
    return value;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createNoUnknownFieldsValidator = (schema) => (value, path) => {
    const errors = [];
    Object.keys(value).forEach((subKey) => {
      if (!schema[subKey]) {
        const subPath = path ? path + "." + subKey : subKey;
        errors.push("'" + subPath + "': Unknown field.");
      }
    });
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    return value;
  };

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

  var createNonEmptyValidator = (message) => (value, path) => {
    if (isObject(value)) {
      assertValid(!isEmptyObject(value), value, path, message);
    } else {
      assertValid(value.length > 0, value, path, message);
    }
    return value;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createObjectOfValidator = (schema) =>
    function objectOf(value, path) {
      assertValid(isObject(value), value, path, "an object");
      const errors = [];
      const validatedObject = {};
      Object.keys(schema).forEach((subKey) => {
        const subValue = value[subKey];
        const subSchema = schema[subKey];
        const subPath = path ? path + "." + subKey : subKey;
        try {
          const validatedValue = subSchema.call(this, subValue, subPath);
          if (validatedValue !== undefined) {
            validatedObject[subKey] = validatedValue;
          }
        } catch (e) {
          errors.push(e.message);
        }
      });

      // copy over unknown properties
      Object.keys(value).forEach((subKey) => {
        if (!Object.prototype.hasOwnProperty.call(validatedObject, subKey)) {
          validatedObject[subKey] = value[subKey];
        }
      });
      if (errors.length) {
        throw new Error(errors.join("\n"));
      }
      return validatedObject;
    };

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
  var createRenamedValidator = (oldField, oldSchema, newField) =>
    function deprecated(value, path) {
      assertValid(isObject(value), value, path, "an object");
      const {
        [oldField]: oldValue,
        [newField]: newValue,
        ...otherValues
      } = value;
      const validatedOldValue = oldSchema(oldValue, path);
      if (validatedOldValue !== undefined) {
        let message =
          "The field '" +
          oldField +
          "' is deprecated. Use '" +
          newField +
          "' instead.";
        if (path) {
          message = "'" + path + "': " + message;
        }
        if (newValue !== undefined && newValue !== validatedOldValue) {
          throw new Error(message);
        } else if (this && this.logger) {
          this.logger.warn(message);
        }
      }
      return {
        [newField]: newValue || validatedOldValue,
        ...otherValues,
      };
    };

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

  var createUniqueValidator = () => {
    const values = [];
    return (value, path) => {
      assertValid(
        values.indexOf(value) === -1,
        value,
        path,
        "a unique value across instances",
      );
      values.push(value);
      return value;
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  /**
   * Returns whether an array contains unique values.
   * @param {*} value
   * @returns {boolean}
   */
  var isUnique = (values) => {
    const storedVals = Object.create(null);
    for (let i = 0; i < values.length; i += 1) {
      const item = values[i];
      if (item in storedVals) {
        return false;
      }
      storedVals[item] = true;
    }
    return true;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createUniqueItemsValidator = () => {
    return (value, path) => {
      assertValid(isUnique(value), value, path, "array values to be unique");
      return value;
    };
  };

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
  const DOMAIN_REGEX = /^[a-z0-9.-]{1,}$/i;
  var domainValidator = (value, path) => {
    assertValid(DOMAIN_REGEX.test(value), value, path, "a valid domain");
    return value;
  };

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

  var integerValidator = (value, path) => {
    assertValid(isInteger(value), value, path, "an integer");
    return value;
  };

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

  var numberValidator = (value, path) => {
    assertValid(isNumber$1(value), value, path, "a number");
    return value;
  };

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

  /**
   * Determines whether the value is a valid regular expression.
   * @param {*} value
   * @returns {boolean}
   */
  var isValidRegExp = (value) => {
    try {
      return RegExp(value) !== null;
    } catch {
      return false;
    }
  };

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

  var regexpValidator = (value, path) => {
    assertValid(isValidRegExp(value), value, path, "a regular expression");
    return value;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var requiredValidator = (value, path) => {
    if (value == null) {
      throw new Error("'" + path + "' is a required option");
    }
    return value;
  };

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
  var stringValidator = (value, path) => {
    assertValid(isString(value), value, path, "a string");
    return value;
  };

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

  var matchesRegexpValidator = (regexp) => (value, path) => {
    assertValid(
      regexp.test(value),
      value,
      path,
      "does not match the " + regexp.toString(),
    );
    return value;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // The base validator does no validation and just returns the value unchanged
  const base = (value) => value;

  // The 'default', 'required', and 'deprecated' methods are available after any
  // data-type method. Don't use the nullSafeChain on 'default' or 'required'
  // because they need to handle the null or undefined case
  base.default = function _default(defaultValue) {
    return chain(this, createDefaultValidator(defaultValue));
  };
  base.required = function required() {
    return chain(this, requiredValidator);
  };
  base.deprecated = function deprecated(message) {
    return chain(this, createDeprecatedValidator(message));
  };

  // helper validators
  const domain = function domain() {
    return nullSafeChain(this, domainValidator);
  };
  const minimumInteger = function minimumInteger(minValue) {
    return nullSafeChain(this, createMinimumValidator("an integer", minValue));
  };
  const minimumNumber = function minimumNumber(minValue) {
    return nullSafeChain(this, createMinimumValidator("a number", minValue));
  };
  const maximumNumber = function maximumNumber(maxValue) {
    return nullSafeChain(this, createMaximumValidator("a number", maxValue));
  };
  const integer = function integer() {
    return nullSafeChain(this, integerValidator, {
      minimum: minimumInteger,
    });
  };
  const nonEmptyString = function nonEmptyString() {
    return nullSafeChain(this, createNonEmptyValidator("a non-empty string"));
  };
  const nonEmptyArray = function nonEmptyArray() {
    return nullSafeChain(this, createNonEmptyValidator("a non-empty array"));
  };
  const nonEmptyObject = function nonEmptyObject() {
    return nullSafeChain(this, createNonEmptyValidator("a non-empty object"));
  };
  const regexp = function regexp() {
    return nullSafeChain(this, regexpValidator);
  };
  const matches = function matches(regexpPattern) {
    return nullSafeChain(this, matchesRegexpValidator(regexpPattern));
  };
  const unique = function createUnique() {
    return nullSafeChain(this, createUniqueValidator());
  };
  const uniqueItems = function createUniqueItems() {
    return nullSafeChain(this, createUniqueItemsValidator());
  };

  // top-level validators.  These are the first functions that are called to create a validator.
  const anyOf = function anyOf(validators, message) {
    // use chain here because we don't want to accept null or undefined unless at least
    // one of the validators accept null or undefined.
    return chain(this, createAnyOfValidator(validators, message));
  };
  const anything = function anything() {
    return this;
  };
  const arrayOf = function arrayOf(elementValidator) {
    return nullSafeChain(this, createArrayOfValidator(elementValidator), {
      nonEmpty: nonEmptyArray,
      uniqueItems,
    });
  };
  const boolean = function boolean() {
    return nullSafeChain(this, booleanValidator);
  };
  const callback = function callback() {
    return nullSafeChain(this, callbackValidator);
  };
  const literal = function literal(literalValue) {
    return nullSafeChain(this, createLiteralValidator(literalValue));
  };
  const number = function number() {
    return nullSafeChain(this, numberValidator, {
      minimum: minimumNumber,
      maximum: maximumNumber,
      integer,
      unique,
    });
  };
  const mapOfValues = function mapOfValues(valuesValidator) {
    return nullSafeChain(this, createMapOfValuesValidator(valuesValidator), {
      nonEmpty: nonEmptyObject,
    });
  };
  const createObjectOfAdditionalProperties = (schema) => ({
    noUnknownFields: function noUnknownFields() {
      return nullSafeChain(this, createNoUnknownFieldsValidator(schema));
    },
    nonEmpty: nonEmptyObject,
    concat: function concat(otherObjectOfValidator) {
      // combine the schema so that noUnknownFields, and concat have the combined schema
      const newSchema = {
        ...schema,
        ...otherObjectOfValidator.schema,
      };
      return nullSafeChain(
        this,
        otherObjectOfValidator,
        createObjectOfAdditionalProperties(newSchema),
      );
    },
    renamed: function renamed(oldField, oldSchema, newField) {
      // Run the deprecated validator first so that the deprecated field is removed
      // before the objectOf validator runs.
      return reverseNullSafeChainJoinErrors(
        this,
        createRenamedValidator(oldField, oldSchema, newField),
      );
    },
    schema,
  });
  const objectOf = function objectOf(schema) {
    return nullSafeChain(
      this,
      createObjectOfValidator(schema),
      createObjectOfAdditionalProperties(schema),
    );
  };
  const string = function string() {
    return nullSafeChain(this, stringValidator, {
      regexp,
      domain,
      nonEmpty: nonEmptyString,
      unique,
      matches,
    });
  };
  const boundAnyOf = anyOf.bind(base);
  const boundAnything = anything.bind(base);
  const boundArrayOf = arrayOf.bind(base);
  const boundBoolean = boolean.bind(base);
  const boundCallback = callback.bind(base);
  const boundLiteral = literal.bind(base);
  const boundNumber = number.bind(base);
  const boundMapOfValues = mapOfValues.bind(base);
  const boundObjectOf = objectOf.bind(base);
  const boundString = string.bind(base);

  // compound validators
  const boundEnumOf = function boundEnumOf(...values) {
    return boundAnyOf(
      values.map(boundLiteral),
      "one of these values: " + JSON.stringify(values),
    );
  };

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
  const AMBIGUOUS = "ambiguous";
  const AUTHENTICATED = "authenticated";
  const LOGGED_OUT = "loggedOut";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var validateIdentityMap = boundMapOfValues(
    boundArrayOf(
      boundObjectOf({
        authenticatedState: boundEnumOf(AMBIGUOUS, AUTHENTICATED, LOGGED_OUT),
        id: boundString(),
        namespace: boundObjectOf({
          code: boundString(),
        }).noUnknownFields(),
        primary: boundBoolean(),
        xid: boundString(),
      }).noUnknownFields(),
    ).required(),
  );

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var validateConfigOverride = boundObjectOf({});

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

  var debugQueryParam = "alloy_debug";

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

  var createLogController = ({
    console,
    locationSearch,
    createLogger,
    instanceName,
    createNamespacedStorage,
    getMonitors,
  }) => {
    const parsedQueryString = queryString.parse(locationSearch);
    const storage = createNamespacedStorage("instance." + instanceName + ".");
    const debugSessionValue = storage.session.getItem("debug");
    let debugEnabled = debugSessionValue === "true";
    let debugEnabledWritableFromConfig = debugSessionValue === null;
    const getDebugEnabled = () => debugEnabled;
    const setDebugEnabled = (value, { fromConfig }) => {
      if (!fromConfig || debugEnabledWritableFromConfig) {
        debugEnabled = value;
      }
      if (!fromConfig) {
        // Web storage only allows strings, so we explicitly convert to string.
        storage.session.setItem("debug", value.toString());
        debugEnabledWritableFromConfig = false;
      }
    };
    if (parsedQueryString[debugQueryParam] !== undefined) {
      setDebugEnabled(stringToBoolean(parsedQueryString[debugQueryParam]), {
        fromConfig: false,
      });
    }
    return {
      setDebugEnabled,
      logger: createLogger({
        getDebugEnabled,
        context: {
          instanceName,
        },
        getMonitors,
        console,
      }),
      createComponentLogger(componentName) {
        return createLogger({
          getDebugEnabled,
          context: {
            instanceName,
            componentName,
          },
          getMonitors,
          console,
        });
      },
    };
  };

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

  // TO-DOCUMENT: Lifecycle hooks and their params.
  const hookNames = [
    // Called after all components have been registered.
    "onComponentsRegistered",
    // Called before an event is sent on a data collection request
    "onBeforeEvent",
    // Called before each request is made to the edge.
    "onBeforeRequest",
    // Called after each response is returned from the edge with a successful
    // status code
    "onResponse",
    // Called after a network request to the edge fails. Either the request
    // didn't make it to the edge, didn't make it to Konductor, or Konductor
    // failed to return a regularly-structured response. (In this case { error }
    // is passed as the parameter)
    // Also called when the respone returns a 400 or 500 error. (In this case
    // { response } is passed as the parameter)
    "onRequestFailure",
    // A user clicked on an element.
    "onClick",
    // Called by RulesEngine when a ruleset is satisfied with a list of
    // propositions
    "onDecision",
  ];
  const createHook = (componentRegistry, hookName) => {
    return (...args) => {
      return Promise.all(
        componentRegistry.getLifecycleCallbacks(hookName).map((callback) => {
          return new Promise((resolve) => {
            resolve(callback(...args));
          });
        }),
      );
    };
  };

  /**
   * This ensures that if a component's lifecycle method X
   * attempts to execute lifecycle method Y, that all X methods on all components
   * will have been called before any of their Y methods are called. It does
   * this by kicking the call to the Y method to the next JavaScript tick.
   * @returns {function}
   */
  const guardHook = (fn) => {
    return (...args) => {
      return Promise.resolve().then(() => {
        return fn(...args);
      });
    };
  };
  var createLifecycle = (componentRegistry) => {
    return hookNames.reduce((memo, hookName) => {
      memo[hookName] = guardHook(createHook(componentRegistry, hookName));
      return memo;
    }, {});
  };

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

  const wrapForErrorHandling = (fn, stackMessage) => {
    return (...args) => {
      let result;
      try {
        result = fn(...args);
      } catch (error) {
        throw stackError({
          error,
          message: stackMessage,
        });
      }
      if (result instanceof Promise) {
        result = result.catch((error) => {
          throw stackError({
            error,
            message: stackMessage,
          });
        });
      }
      return result;
    };
  };

  // TO-DOCUMENT: All public commands and their signatures.
  var createComponentRegistry = () => {
    const componentsByNamespace = {};
    const commandsByName = {};
    const lifecycleCallbacksByName = {};
    const registerComponentCommands = (
      namespace,
      componentCommandsByName = {},
    ) => {
      const conflictingCommandNames = intersection(
        Object.keys(commandsByName),
        Object.keys(componentCommandsByName),
      );
      if (conflictingCommandNames.length) {
        throw new Error(
          "[ComponentRegistry] Could not register " +
            namespace +
            " " +
            ("because it has existing command(s): " +
              conflictingCommandNames.join(",")),
        );
      }
      Object.keys(componentCommandsByName).forEach((commandName) => {
        const command = componentCommandsByName[commandName];
        command.commandName = commandName;
        command.run = wrapForErrorHandling(
          command.run,
          "[" +
            namespace +
            "] An error occurred while executing the " +
            commandName +
            " command.",
        );
        commandsByName[commandName] = command;
      });
    };
    const registerLifecycleCallbacks = (
      namespace,
      componentLifecycleCallbacksByName = {},
    ) => {
      Object.keys(componentLifecycleCallbacksByName).forEach((hookName) => {
        lifecycleCallbacksByName[hookName] =
          lifecycleCallbacksByName[hookName] || [];
        lifecycleCallbacksByName[hookName].push(
          wrapForErrorHandling(
            componentLifecycleCallbacksByName[hookName],
            "[" +
              namespace +
              "] An error occurred while executing the " +
              hookName +
              " lifecycle hook.",
          ),
        );
      });
    };
    return {
      register(namespace, component) {
        const { commands, lifecycle } = component;
        registerComponentCommands(namespace, commands);
        registerLifecycleCallbacks(namespace, lifecycle);
        componentsByNamespace[namespace] = component;
      },
      getCommand(commandName) {
        return commandsByName[commandName];
      },
      getCommandNames() {
        return Object.keys(commandsByName);
      },
      getLifecycleCallbacks(hookName) {
        return lifecycleCallbacksByName[hookName] || [];
      },
      getComponentNames() {
        return Object.keys(componentsByNamespace);
      },
    };
  };

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

  var injectSendNetworkRequest = ({
    logger,
    sendFetchRequest,
    sendBeaconRequest,
    isRequestRetryable,
    getRequestRetryDelay,
  }) => {
    /**
     * Send a network request and returns details about the response.
     */
    return ({ requestId, url, payload, useSendBeacon }) => {
      // We want to log raw payload and event data rather than
      // our fancy wrapper objects. Calling payload.toJSON() is
      // insufficient to get all the nested raw data, because it's
      // not recursive (it doesn't call toJSON() on the event objects).
      // Parsing the result of JSON.stringify(), however, gives the
      // fully recursive raw data.
      const stringifiedPayload = JSON.stringify(payload);
      const parsedPayload = JSON.parse(stringifiedPayload);
      logger.logOnBeforeNetworkRequest({
        url,
        requestId,
        payload: parsedPayload,
      });
      const executeRequest = (retriesAttempted = 0) => {
        const requestMethod = useSendBeacon
          ? sendBeaconRequest
          : sendFetchRequest;
        return requestMethod(url, stringifiedPayload).then((response) => {
          const requestIsRetryable = isRequestRetryable({
            response,
            retriesAttempted,
          });
          if (requestIsRetryable) {
            const requestRetryDelay = getRequestRetryDelay({
              response,
              retriesAttempted,
            });
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(executeRequest(retriesAttempted + 1));
              }, requestRetryDelay);
            });
          }
          let parsedBody;
          try {
            parsedBody = JSON.parse(response.body);
          } catch {
            // Non-JSON. Something went wrong.
          }
          logger.logOnNetworkResponse({
            requestId,
            url,
            payload: parsedPayload,
            ...response,
            parsedBody,
            retriesAttempted,
          });
          return {
            statusCode: response.statusCode,
            body: response.body,
            parsedBody,
            getHeader: response.getHeader,
          };
        });
      };
      return executeRequest().catch((error) => {
        logger.logOnNetworkError({
          requestId,
          url,
          payload: parsedPayload,
          error,
        });
        throw stackError({
          error,
          message: "Network request failed.",
        });
      });
    };
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectExtractEdgeInfo =
    ({ logger }) =>
    (adobeEdgeHeader) => {
      if (adobeEdgeHeader) {
        const headerParts = adobeEdgeHeader.split(";");
        if (headerParts.length >= 2 && headerParts[1].length > 0) {
          try {
            const regionId = parseInt(headerParts[1], 10);
            if (!Number.isNaN(regionId)) {
              return {
                regionId,
              };
            }
          } catch {
            // No need to do anything. The log statement below will log an error
          }
        }
        logger.warn('Invalid adobe edge: "' + adobeEdgeHeader + '"');
      }
      return {};
    };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const IN = "in";
  const OUT = "out";
  const PENDING = "pending";
  const DISABLED = "disabled";
  const WAIT = "wait";
  const AUTO = "auto";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const GENERAL = "general";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const DECLINED_CONSENT_ERROR_CODE = "declinedConsent";
  const CONSENT_SOURCE_DEFAULT = "default";
  const CONSENT_SOURCE_INITIAL = "initial";
  const CONSENT_SOURCE_NEW = "new";
  const createDeclinedConsentError = (errorMessage) => {
    const error = new Error(errorMessage);
    error.code = DECLINED_CONSENT_ERROR_CODE;
    error.message = errorMessage;
    return error;
  };
  var createConsentStateMachine = ({ logger }) => {
    const deferreds = [];
    const runAll = () => {
      while (deferreds.length) {
        deferreds.shift().resolve();
      }
    };
    const discardAll = () => {
      while (deferreds.length) {
        deferreds
          .shift()
          .reject(createDeclinedConsentError("The user declined consent."));
      }
    };
    const awaitInitial = () => Promise.resolve();
    const awaitInDefault = () => Promise.resolve();
    const awaitIn = () => Promise.resolve();
    const awaitOutDefault = () =>
      Promise.reject(
        createDeclinedConsentError("No consent preferences have been set."),
      );
    const awaitOut = () =>
      Promise.reject(createDeclinedConsentError("The user declined consent."));
    const awaitPending = (returnImmediately) => {
      if (returnImmediately) {
        return Promise.reject(new Error("Consent is pending."));
      }
      const deferred = defer();
      deferreds.push(deferred);
      return deferred.promise;
    };
    return {
      in(source) {
        if (source === CONSENT_SOURCE_DEFAULT) {
          this.awaitConsent = awaitInDefault;
        } else {
          if (source === CONSENT_SOURCE_INITIAL) {
            logger.info(
              "Loaded user consent preferences. The user previously consented.",
            );
          } else if (
            source === CONSENT_SOURCE_NEW &&
            this.awaitConsent !== awaitIn
          ) {
            logger.info("User consented.");
          }
          runAll();
          this.awaitConsent = awaitIn;
        }
      },
      out(source) {
        if (source === CONSENT_SOURCE_DEFAULT) {
          logger.warn(
            "User consent preferences not found. Default consent of out will be used.",
          );
          this.awaitConsent = awaitOutDefault;
        } else {
          if (source === CONSENT_SOURCE_INITIAL) {
            logger.warn(
              "Loaded user consent preferences. The user previously declined consent.",
            );
          } else if (
            source === CONSENT_SOURCE_NEW &&
            this.awaitConsent !== awaitOut
          ) {
            logger.warn("User declined consent.");
          }
          discardAll();
          this.awaitConsent = awaitOut;
        }
      },
      pending(source) {
        if (source === CONSENT_SOURCE_DEFAULT) {
          logger.info(
            "User consent preferences not found. Default consent of pending will be used. Some commands may be delayed.",
          );
        }
        this.awaitConsent = awaitPending;
      },
      awaitConsent: awaitInitial,
      withConsent() {
        return this.awaitConsent(true);
      },
      current() {
        switch (this.awaitConsent) {
          case awaitInDefault:
            return {
              state: "in",
              wasSet: false,
            };
          case awaitIn:
            return {
              state: "in",
              wasSet: true,
            };
          case awaitOutDefault:
            return {
              state: "out",
              wasSet: false,
            };
          case awaitOut:
            return {
              state: "out",
              wasSet: true,
            };
          case awaitPending:
            return {
              state: "pending",
              wasSet: false,
            };
          default:
            return {
              state: "in",
              wasSet: false,
            };
        }
      },
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createConsent$1 = ({ generalConsentState, logger }) => {
    const setConsent = (consentByPurpose, source) => {
      switch (consentByPurpose[GENERAL]) {
        case IN:
          generalConsentState.in(source);
          break;
        case OUT:
          generalConsentState.out(source);
          break;
        case PENDING:
          generalConsentState.pending(source);
          break;
        default:
          logger.warn("Unknown consent value: " + consentByPurpose[GENERAL]);
          break;
      }
    };
    return {
      initializeConsent(defaultConsentByPurpose, storedConsentByPurpose) {
        if (storedConsentByPurpose[GENERAL]) {
          setConsent(storedConsentByPurpose, CONSENT_SOURCE_INITIAL);
        } else {
          setConsent(defaultConsentByPurpose, CONSENT_SOURCE_DEFAULT);
        }
      },
      setConsent(consentByPurpose) {
        setConsent(consentByPurpose, CONSENT_SOURCE_NEW);
      },
      suspend() {
        generalConsentState.pending();
      },
      awaitConsent() {
        return generalConsentState.awaitConsent();
      },
      withConsent() {
        return generalConsentState.withConsent();
      },
      current() {
        return generalConsentState.current();
      },
    };
  };

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

  const getXdmPropositions = (xdm) => {
    return xdm &&
      // eslint-disable-next-line no-underscore-dangle
      xdm._experience &&
      // eslint-disable-next-line no-underscore-dangle
      xdm._experience.decisioning &&
      // eslint-disable-next-line no-underscore-dangle
      isNonEmptyArray(xdm._experience.decisioning.propositions)
      ? // eslint-disable-next-line no-underscore-dangle
        xdm._experience.decisioning.propositions
      : [];
  };
  var createEvent = () => {
    const content = {};
    let userXdm;
    let userData;
    let documentMayUnload = false;
    let isFinalized = false;
    let shouldSendEvent = true;
    const throwIfEventFinalized = (methodName) => {
      if (isFinalized) {
        throw new Error(
          methodName + " cannot be called after event is finalized.",
        );
      }
    };
    const event = {
      hasQuery() {
        return Object.prototype.hasOwnProperty.call(this.getContent(), "query");
      },
      getContent() {
        const currentContent = JSON.parse(JSON.stringify(content));
        if (userXdm) {
          deepAssign(currentContent, {
            xdm: userXdm,
          });
        }
        if (userData) {
          deepAssign(currentContent, {
            data: userData,
          });
        }
        return currentContent;
      },
      setUserXdm(value) {
        throwIfEventFinalized("setUserXdm");
        userXdm = value;
      },
      setUserData(value) {
        throwIfEventFinalized("setUserData");
        userData = value;
      },
      mergeXdm(xdm) {
        throwIfEventFinalized("mergeXdm");
        if (xdm) {
          deepAssign(content, {
            xdm,
          });
        }
      },
      mergeData(data) {
        throwIfEventFinalized("mergeData");
        if (data) {
          deepAssign(content, {
            data,
          });
        }
      },
      mergeMeta(meta) {
        throwIfEventFinalized("mergeMeta");
        if (meta) {
          deepAssign(content, {
            meta,
          });
        }
      },
      mergeQuery(query) {
        throwIfEventFinalized("mergeQuery");
        if (query) {
          deepAssign(content, {
            query,
          });
        }
      },
      documentMayUnload() {
        documentMayUnload = true;
      },
      finalize(onBeforeEventSend) {
        if (isFinalized) {
          return;
        }
        const newPropositions = deduplicateArray(
          [...getXdmPropositions(userXdm), ...getXdmPropositions(content.xdm)],
          (a, b) =>
            a === b ||
            (a.id &&
              b.id &&
              a.id === b.id &&
              a.scope &&
              b.scope &&
              a.scope === b.scope),
        );
        if (userXdm) {
          this.mergeXdm(userXdm);
        }
        if (newPropositions.length > 0) {
          // eslint-disable-next-line no-underscore-dangle
          content.xdm._experience.decisioning.propositions = newPropositions;
        }
        if (userData) {
          event.mergeData(userData);
        }

        // the event should already be considered finalized in case onBeforeEventSend throws an error
        isFinalized = true;
        if (onBeforeEventSend) {
          // assume that the onBeforeEventSend callback will fail (in-case of an error)
          shouldSendEvent = false;

          // this allows the user to replace the xdm and data properties
          // on the object passed to the callback
          const tempContent = {
            xdm: content.xdm || {},
            data: content.data || {},
          };
          const result = onBeforeEventSend(tempContent);
          shouldSendEvent = result !== false;
          content.xdm = tempContent.xdm || {};
          content.data = tempContent.data || {};
          if (isEmptyObject(content.xdm)) {
            delete content.xdm;
          }
          if (isEmptyObject(content.data)) {
            delete content.data;
          }
        }
      },
      getDocumentMayUnload() {
        return documentMayUnload;
      },
      isEmpty() {
        return (
          isEmptyObject(content) &&
          (!userXdm || isEmptyObject(userXdm)) &&
          (!userData || isEmptyObject(userData))
        );
      },
      shouldSend() {
        return shouldSendEvent;
      },
      getViewName() {
        if (!userXdm || !userXdm.web || !userXdm.web.webPageDetails) {
          return undefined;
        }
        return userXdm.web.webPageDetails.viewName;
      },
      toJSON() {
        if (!isFinalized) {
          throw new Error("toJSON called before finalize");
        }
        return content;
      },
    };
    return event;
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const RETRY_AFTER = "Retry-After";
  const ADOBE_EDGE = "x-adobe-edge";

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

  /**
   * Creates a representation of a gateway response with the addition of
   * helper methods.
   * @returns Response
   */
  var injectCreateResponse =
    ({ extractEdgeInfo }) =>
    ({ content = {}, getHeader }) => {
      const { handle = [], errors = [], warnings = [] } = content;

      /**
       * Response object.
       * @typedef {Object} Response
       */
      return {
        /**
         * Returns matching fragments of the response by type.
         * @param {String} type A string with the current format: <namespace:action>
         *
         * @example
         * getPayloadsByType("identity:persist")
         */
        getPayloadsByType(type) {
          return handle
            .filter((fragment) => fragment.type === type)
            .flatMap((fragment) => fragment.payload);
        },
        /**
         * Returns all errors.
         */
        getErrors() {
          return errors;
        },
        /**
         * Returns all warnings.
         */
        getWarnings() {
          return warnings;
        },
        /**
         * Returns an object containing the regionId from the x-adobe-edge header
         */
        getEdge() {
          return extractEdgeInfo(getHeader(ADOBE_EDGE));
        },
        toJSON() {
          return content;
        },
      };
    };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const CONFIGURE = "configure";
  const SET_DEBUG = "setDebug";

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

  var injectExecuteCommand = ({
    logger,
    configureCommand,
    setDebugCommand,
    handleError,
    validateCommandOptions,
  }) => {
    let configurePromise;
    const getExecutor = (commandName, options) => {
      let executor;
      if (commandName === CONFIGURE) {
        if (configurePromise) {
          throw new Error(
            "The library has already been configured and may only be configured once.",
          );
        }
        executor = () => {
          configurePromise = configureCommand(options);
          return configurePromise.then(() => {
            // Don't expose internals to the user.
          });
        };
      } else {
        if (!configurePromise) {
          throw new Error(
            "The library must be configured first. Please do so by executing the configure command.",
          );
        }
        if (commandName === SET_DEBUG) {
          executor = () => {
            const optionsValidator = boundObjectOf({
              enabled: boundBoolean().required(),
            }).noUnknownFields();
            const validatedOptions = validateCommandOptions({
              command: {
                commandName: SET_DEBUG,
                optionsValidator,
              },
              options,
            });
            setDebugCommand(validatedOptions);
          };
        } else {
          executor = () => {
            return configurePromise.then(
              (componentRegistry) => {
                const command = componentRegistry.getCommand(commandName);
                if (!command || !isFunction(command.run)) {
                  const commandNames = [CONFIGURE, SET_DEBUG]
                    .concat(componentRegistry.getCommandNames())
                    .join(", ");
                  throw new Error(
                    "The " +
                      commandName +
                      " command does not exist. List of available commands: " +
                      commandNames +
                      ".",
                  );
                }
                const validatedOptions = validateCommandOptions({
                  command,
                  options,
                });
                return command.run(validatedOptions);
              },
              () => {
                logger.warn(
                  "An error during configuration is preventing the " +
                    commandName +
                    " command from executing.",
                );
                // If configuration failed, we prevent the configuration
                // error from bubbling here because we don't want the
                // configuration error to be reported in the console every
                // time any command is executed. Only having it bubble
                // once when the configure command runs is sufficient.
                // Instead, for this command, we'll just return a promise
                // that never gets resolved.
                return new Promise(() => {});
              },
            );
          };
        }
      }
      return executor;
    };
    return (commandName, options = {}) => {
      return new Promise((resolve) => {
        // We have to wrap the getExecutor() call in the promise so the promise
        // will be rejected if getExecutor() throws errors.
        const executor = getExecutor(commandName, options);
        logger.logOnBeforeCommand({
          commandName,
          options,
        });
        resolve(executor());
      })
        .catch((error) => {
          return handleError(error, commandName + " command");
        })
        .catch((error) => {
          logger.logOnCommandRejected({
            commandName,
            options,
            error,
          });
          throw error;
        })
        .then((rawResult) => {
          // We should always be returning an object from every command.
          const result = isObject(rawResult) ? rawResult : {};
          logger.logOnCommandResolved({
            commandName,
            options,
            result,
          });
          return result;
        });
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const COMMAND_DOC_URI = "https://adobe.ly/3sHgQHb";
  var validateCommandOptions = ({ command, options }) => {
    const {
      commandName,
      documentationUri = COMMAND_DOC_URI,
      optionsValidator,
    } = command;
    let validatedOptions = options;
    if (optionsValidator) {
      try {
        validatedOptions = optionsValidator(options);
      } catch (validationError) {
        const invalidOptionsMessage =
          "Invalid " +
          commandName +
          " command options:\n\t - " +
          validationError +
          " For command documentation see: " +
          documentationUri;
        throw new Error(invalidOptionsMessage);
      }
    }
    return validatedOptions;
  };

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

  const CONFIG_DOC_URI = "https://adobe.ly/3sHh553";
  const transformOptions = ({ combinedConfigValidator, options, logger }) => {
    try {
      const validator = combinedConfigValidator.noUnknownFields().required();
      return validator.call(
        {
          logger,
        },
        options,
      );
    } catch (e) {
      throw new Error(
        "Resolve these configuration problems:\n\t - " +
          e.message.split("\n").join("\n\t - ") +
          "\nFor configuration documentation see: " +
          CONFIG_DOC_URI,
      );
    }
  };
  const buildAllOnInstanceConfiguredExtraParams = (
    config,
    logger,
    componentCreators,
  ) => {
    return componentCreators.reduce(
      (memo, { buildOnInstanceConfiguredExtraParams }) => {
        if (buildOnInstanceConfiguredExtraParams) {
          memo = {
            ...memo,
            ...buildOnInstanceConfiguredExtraParams({
              config,
              logger,
            }),
          };
        }
        return memo;
      },
      {},
    );
  };
  const wrapLoggerInQueue = (logger) => {
    const queue = [];
    const queuedLogger = {
      get enabled() {
        return logger.enabled;
      },
      flush() {
        queue.forEach(({ method, args }) => logger[method](...args));
      },
    };
    Object.keys(logger)
      .filter((key) => typeof logger[key] === "function")
      .forEach((method) => {
        queuedLogger[method] = (...args) => {
          queue.push({
            method,
            args,
          });
        };
      });
    return queuedLogger;
  };
  var buildAndValidateConfig = ({
    options,
    componentCreators,
    coreConfigValidators,
    createConfig,
    logger,
    setDebugEnabled,
  }) => {
    // We wrap the logger in a queue in case debugEnabled is set in the config
    // but we need to log something before the config is created.
    const queuedLogger = wrapLoggerInQueue(logger);
    const combinedConfigValidator = componentCreators
      .map(({ configValidators }) => configValidators)
      .filter((configValidators) => configValidators)
      .reduce(
        (validator, configValidators) => validator.concat(configValidators),
        coreConfigValidators,
      );
    const config = createConfig(
      transformOptions({
        combinedConfigValidator,
        options,
        logger: queuedLogger,
      }),
    );
    setDebugEnabled(config.debugEnabled, {
      fromConfig: true,
    });
    queuedLogger.flush();
    const extraParams = buildAllOnInstanceConfiguredExtraParams(
      config,
      logger,
      componentCreators,
    );
    logger.logOnInstanceConfigured({
      ...extraParams,
      config,
    });
    return config;
  };

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

  var initializeComponents = ({
    componentCreators,
    lifecycle,
    componentRegistry,
    getImmediatelyAvailableTools,
  }) => {
    componentCreators.forEach((createComponent) => {
      const { namespace } = createComponent;
      // TO-DOCUMENT: Helpers that we inject into factories.
      const tools = getImmediatelyAvailableTools(namespace);
      let component;
      try {
        component = createComponent(tools);
      } catch (error) {
        throw stackError({
          error,
          message:
            "[" + namespace + "] An error occurred during component creation.",
        });
      }
      componentRegistry.register(namespace, component);
    });
    return lifecycle
      .onComponentsRegistered({
        lifecycle,
      })
      .then(() => componentRegistry);
  };

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

  const createConfig = (options) => {
    return {
      ...options,
    };
  };

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

  const EDGE = "edge.adobedc.net";
  const ID_THIRD_PARTY = "adobedc.demdex.net";

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
  var EDGE_BASE_PATH = "ee";

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

  var createCoreConfigs = () =>
    boundObjectOf({
      debugEnabled: boundBoolean().default(false),
      datastreamId: boundString().unique().required(),
      edgeDomain: boundString().domain().default(EDGE),
      edgeBasePath: boundString().nonEmpty().default(EDGE_BASE_PATH),
      orgId: boundString().unique().required(),
      onBeforeEventSend: boundCallback().default(noop),
      edgeConfigOverrides: validateConfigOverride,
    }).renamed("edgeConfigId", boundString().unique(), "datastreamId");

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

  var injectHandleError =
    ({ errorPrefix, logger }) =>
    (error, operation) => {
      const err = toError(error);

      // In the case of declined consent, we've opted to not reject the promise
      // returned to the customer, but instead resolve the promise with an
      // empty result object.
      if (err.code === DECLINED_CONSENT_ERROR_CODE) {
        logger.warn(
          "The " + operation + " could not fully complete. " + err.message,
        );
        return {};
      }
      updateErrorMessage({
        error: err,
        message: errorPrefix + " " + err.message,
      });
      throw err;
    };

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

  var injectSendFetchRequest = ({ fetch }) => {
    return (url, body) => {
      return fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "include",
        // To set the cookie header in the request.
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
        },
        referrerPolicy: "no-referrer-when-downgrade",
        body,
      }).then((response) => {
        return response.text().then((responseBody) => ({
          statusCode: response.status,
          // We expose headers through a function instead of creating an object
          // with all the headers up front largely because the native
          // request.getResponseHeader method is case-insensitive.
          getHeader(name) {
            return response.headers.get(name);
          },
          body: responseBody,
        }));
      });
    };
  };

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

  var injectSendBeaconRequest = ({ sendBeacon, sendFetchRequest, logger }) => {
    return (url, body) => {
      const blob = new Blob([body], {
        type: "text/plain; charset=UTF-8",
      });
      if (!sendBeacon(url, blob)) {
        logger.info("Unable to use `sendBeacon`; falling back to `fetch`.");
        return sendFetchRequest(url, body);
      }

      // Using sendBeacon, we technically don't get a response back from
      // the server, but we'll resolve the promise with an object to maintain
      // consistency with other network strategies.
      return Promise.resolve({
        statusCode: 204,
        getHeader() {
          return null;
        },
        body: "",
      });
    };
  };

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

  var createLogger = ({ getDebugEnabled, console, getMonitors, context }) => {
    let prefix = "[" + context.instanceName + "]";
    if (context.componentName) {
      prefix += " [" + context.componentName + "]";
    }
    const notifyMonitors = (method, data) => {
      const monitors = getMonitors();
      if (monitors.length > 0) {
        const dataWithContext = {
          ...context,
          ...data,
        };
        monitors.forEach((monitor) => {
          if (monitor[method]) {
            monitor[method](dataWithContext);
          }
        });
      }
    };
    const log = (level, ...rest) => {
      notifyMonitors("onBeforeLog", {
        level,
        arguments: rest,
      });
      if (getDebugEnabled()) {
        console[level](prefix, ...rest);
      }
    };
    return {
      get enabled() {
        return getMonitors().length > 0 || getDebugEnabled();
      },
      logOnInstanceCreated(data) {
        notifyMonitors("onInstanceCreated", data);
        log("info", "Instance initialized.");
      },
      logOnInstanceConfigured(data) {
        notifyMonitors("onInstanceConfigured", data);
        log(
          "info",
          "Instance configured. Computed configuration:",
          data.config,
        );
      },
      logOnBeforeCommand(data) {
        notifyMonitors("onBeforeCommand", data);
        log(
          "info",
          "Executing " + data.commandName + " command. Options:",
          data.options,
        );
      },
      logOnCommandResolved(data) {
        notifyMonitors("onCommandResolved", data);
        log(
          "info",
          data.commandName + " command resolved. Result:",
          data.result,
        );
      },
      logOnCommandRejected(data) {
        notifyMonitors("onCommandRejected", data);
        log(
          "error",
          data.commandName + " command was rejected. Error:",
          data.error,
        );
      },
      logOnBeforeNetworkRequest(data) {
        notifyMonitors("onBeforeNetworkRequest", data);
        log(
          "info",
          "Request " + data.requestId + ": Sending request.",
          data.payload,
        );
      },
      logOnNetworkResponse(data) {
        notifyMonitors("onNetworkResponse", data);
        const messagesSuffix =
          data.parsedBody || data.body ? "response body:" : "no response body.";
        log(
          "info",
          "Request " +
            data.requestId +
            ": Received response with status code " +
            data.statusCode +
            " and " +
            messagesSuffix,
          data.parsedBody || data.body,
        );
      },
      logOnNetworkError(data) {
        notifyMonitors("onNetworkError", data);
        log(
          "error",
          "Request " + data.requestId + ": Network request failed.",
          data.error,
        );
      },
      logOnContentHiding(data) {
        notifyMonitors("onContentHiding", {
          status: data.status,
        });
        log(data.logLevel, data.message);
      },
      logOnContentRendering(data) {
        notifyMonitors("onContentRendering", {
          status: data.status,
          payload: data.detail,
        });
        log(data.logLevel, data.message);
      },
      /**
       * Outputs informational message to the web console. In some
       * browsers a small "i" icon is displayed next to these items
       * in the web console's log.
       * @param {...*} arg Any argument to be logged.
       */
      info: log.bind(null, "info"),
      /**
       * Outputs a warning message to the web console.
       * @param {...*} arg Any argument to be logged.
       */
      warn: log.bind(null, "warn"),
      /**
       * Outputs an error message to the web console.
       * @param {...*} arg Any argument to be logged.
       */
      error: log.bind(null, "error"),
    };
  };

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

  var PAGE_WIDE_SCOPE = "__view__";

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
  var createAddIdentity = (content) => {
    return (namespaceCode, identity) => {
      content.xdm = content.xdm || {};
      content.xdm.identityMap = content.xdm.identityMap || {};
      content.xdm.identityMap[namespaceCode] =
        content.xdm.identityMap[namespaceCode] || [];
      content.xdm.identityMap[namespaceCode].push(identity);
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // This provides the base functionality that all types of requests share.
  var createRequest = (options) => {
    const {
      payload,
      getAction,
      getUseSendBeacon,
      datastreamIdOverride,
      edgeSubPath,
    } = options;
    const id = v4();
    let shouldUseThirdPartyDomain = false;
    let isIdentityEstablished = false;
    return {
      getId() {
        return id;
      },
      getPayload() {
        return payload;
      },
      getAction() {
        return getAction({
          isIdentityEstablished,
        });
      },
      getDatastreamIdOverride() {
        return datastreamIdOverride;
      },
      getUseSendBeacon() {
        return getUseSendBeacon({
          isIdentityEstablished,
        });
      },
      getEdgeSubPath() {
        if (edgeSubPath) {
          return edgeSubPath;
        }
        return "";
      },
      getUseIdThirdPartyDomain() {
        return shouldUseThirdPartyDomain;
      },
      setUseIdThirdPartyDomain() {
        shouldUseThirdPartyDomain = true;
      },
      setIsIdentityEstablished() {
        isIdentityEstablished = true;
      },
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createDataCollectionRequest = ({
    payload: dataCollectionRequestPayload,
    datastreamIdOverride,
  }) => {
    const getUseSendBeacon = ({ isIdentityEstablished }) => {
      // When the document may be unloading, we still hit the interact endpoint
      // using fetch if an identity has not been established. If we were instead
      // to hit the collect endpoint using sendBeacon in this case, one of three
      // things would occur:
      //
      // 1. The document ultimately isn't unloaded and Alloy receives an empty
      // response back from the collect endpoint, resulting in an error being
      // thrown by Alloy because we weren't able to establish an identity.
      // This is bad.
      // 2. The document is unloaded, but Alloy receives the empty
      // response back from the collect endpoint before navigation is completed,
      // resulting in an error being thrown by Alloy because we weren't able to
      // establish an identity. This is bad.
      // 3. The document is unloaded and Alloy does not receive the empty response
      // back from the collect endpoint before navigation is completed. No error
      // will be thrown, but no identity was established either. This is okay,
      // though no identity was established.
      //
      // By hitting the interact endpoint using fetch, one of the three things
      // would occur:
      //
      // 1. The document ultimately isn't unloaded and Alloy receives a
      // response with an identity back from the interact endpoint. No
      // error will be thrown and an identity is established. This is good.
      // 2. The document is unloaded and Alloy receives a response with an
      // identity back from the interact endpoint before navigation is completed.
      // No error will be thrown and an identity is established. This is good.
      // 3. The document is unloaded and Alloy does not receive the empty response
      // back from the collect endpoint before navigation is completed. In this
      // case, no error is thrown, but no identity was established and it's
      // more likely that the request never makes it to the server because we're
      // using fetch instead of sendBeacon.
      //
      // The second approach seemed preferable.
      return (
        dataCollectionRequestPayload.getDocumentMayUnload() &&
        isIdentityEstablished
      );
    };
    return createRequest({
      payload: dataCollectionRequestPayload,
      getAction({ isIdentityEstablished }) {
        return getUseSendBeacon({
          isIdentityEstablished,
        })
          ? "collect"
          : "interact";
      },
      getUseSendBeacon,
      datastreamIdOverride,
    });
  };

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

  // This provides the base functionality that all types of
  // request payloads share.
  var createRequestPayload = (options) => {
    const { content, addIdentity, hasIdentity } = options;
    const mergeConfigOverride = createMerger(content, "meta.configOverrides");
    return {
      mergeMeta: createMerger(content, "meta"),
      mergeState: createMerger(content, "meta.state"),
      mergeQuery: createMerger(content, "query"),
      mergeConfigOverride: (updates) =>
        mergeConfigOverride(prepareConfigOverridesForEdge(updates)),
      addIdentity,
      hasIdentity,
      toJSON() {
        return content;
      },
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createHasIdentity = (content) => (namespaceCode) => {
    return (
      (content.xdm &&
        content.xdm.identityMap &&
        content.xdm.identityMap[namespaceCode]) !== undefined
    );
  };

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
  var createDataCollectionRequestPayload = () => {
    const content = {};
    const payload = createRequestPayload({
      content,
      addIdentity: createAddIdentity(content),
      hasIdentity: createHasIdentity(content),
    });
    payload.addEvent = (event) => {
      content.events = content.events || [];
      content.events.push(event);
    };
    payload.getDocumentMayUnload = () => {
      return (content.events || []).some((event) =>
        event.getDocumentMayUnload(),
      );
    };
    return payload;
  };

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

  /**
   * @typedef {{ datastreamId: string, [k: string]: Object }} Override
   * @typedef {Object} RequestPayload
   * @property {function(Override): void} mergeConfigOverride
   * @param {Object} params
   * @param {Override} params.localConfigOverrides
   * @param {Override} params.globalConfigOverrides
   * @param {RequestPayload} params.payload
   * @returns {{ payload: RequestPayload, datastreamIdOverride: string }}
   */
  var createRequestParams = ({
    localConfigOverrides,
    globalConfigOverrides,
    payload,
  }) => {
    const requestParams = {
      payload,
    };
    const { datastreamId, ...localConfigOverridesWithoutDatastreamId } =
      localConfigOverrides || {};
    if (datastreamId) {
      requestParams.datastreamIdOverride = datastreamId;
    }
    if (globalConfigOverrides && !isEmptyObject(globalConfigOverrides)) {
      payload.mergeConfigOverride(globalConfigOverrides);
    }
    if (
      localConfigOverridesWithoutDatastreamId &&
      !isEmptyObject(localConfigOverridesWithoutDatastreamId)
    ) {
      payload.mergeConfigOverride(localConfigOverridesWithoutDatastreamId);
    }
    return requestParams;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const ASSURANCE_VALIDATION_SESSION_URL_PARAM = "adb_validation_sessionid";
  const ASSURANCE_VALIDATION_NAMESPACE = "validation.";
  const CLIENT_ID = "clientId";
  const getOrCreateAssuranceClientId = (storage) => {
    let clientId = storage.persistent.getItem(CLIENT_ID);
    if (!clientId) {
      clientId = v4();
      storage.persistent.setItem(CLIENT_ID, clientId);
    }
    return clientId;
  };
  var createGetAssuranceValidationTokenParams = ({
    window,
    createNamespacedStorage,
  }) => {
    const storage = createNamespacedStorage(ASSURANCE_VALIDATION_NAMESPACE);
    return () => {
      const parsedQuery = queryString.parse(window.location.search);
      const validationSessionId =
        parsedQuery[ASSURANCE_VALIDATION_SESSION_URL_PARAM];
      if (!validationSessionId) {
        return "";
      }
      const clientId = getOrCreateAssuranceClientId(storage);
      const validationToken = validationSessionId + "|" + clientId;
      return (
        "&" +
        queryString.stringify({
          adobeAepValidationToken: validationToken,
        })
      );
    };
  };

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

  const EVENT_CANCELLATION_MESSAGE =
    "Event was canceled because the onBeforeEventSend callback returned false.";
  var createEventManager = ({
    config,
    logger,
    lifecycle,
    consent,
    createEvent,
    createDataCollectionRequestPayload,
    createDataCollectionRequest,
    sendEdgeNetworkRequest,
    applyResponse,
  }) => {
    const { onBeforeEventSend, edgeConfigOverrides: globalConfigOverrides } =
      config;
    return {
      createEvent,
      /**
       * Sends an event. This includes running the event and payload through the
       * appropriate lifecycle hooks, sending the request to the server, and
       * handling the response.
       * @param {Object} event This will be JSON stringified and used inside the
       * request payload.
       * @param {Object} [options] Options to pass on to the onBeforeEvent
       * lifecycle method
       * @param {Object} [options.edgeConfigOverrides] Settings that take
       * precedence over the global datastream configuration, including which
       * datastream to use.
       * @returns {*}
       */
      sendEvent(event, options = {}) {
        const { edgeConfigOverrides: localConfigOverrides, ...otherOptions } =
          options;
        const requestParams = createRequestParams({
          payload: createDataCollectionRequestPayload(),
          localConfigOverrides,
          globalConfigOverrides,
        });
        const request = createDataCollectionRequest(requestParams);
        const onResponseCallbackAggregator = createCallbackAggregator();
        const onRequestFailureCallbackAggregator = createCallbackAggregator();
        return lifecycle
          .onBeforeEvent({
            ...otherOptions,
            event,
            onResponse: onResponseCallbackAggregator.add,
            onRequestFailure: onRequestFailureCallbackAggregator.add,
          })
          .then(() => {
            requestParams.payload.addEvent(event);
            return consent.awaitConsent();
          })
          .then(() => {
            try {
              // NOTE: this calls onBeforeEventSend callback (if configured)
              event.finalize(onBeforeEventSend);
            } catch (error) {
              const throwError = () => {
                throw error;
              };
              onRequestFailureCallbackAggregator.add(
                lifecycle.onRequestFailure,
              );
              return onRequestFailureCallbackAggregator
                .call({
                  error,
                })
                .then(throwError, throwError);
            }

            // if the callback returns false, the event should not be sent
            if (!event.shouldSend()) {
              onRequestFailureCallbackAggregator.add(
                lifecycle.onRequestFailure,
              );
              logger.info(EVENT_CANCELLATION_MESSAGE);
              const error = new Error(EVENT_CANCELLATION_MESSAGE);
              return onRequestFailureCallbackAggregator
                .call({
                  error,
                })
                .then(() => {
                  // Ensure the promise gets resolved with undefined instead
                  // of an array of return values from the callbacks.
                });
            }
            return sendEdgeNetworkRequest({
              request,
              runOnResponseCallbacks: onResponseCallbackAggregator.call,
              runOnRequestFailureCallbacks:
                onRequestFailureCallbackAggregator.call,
            });
          });
      },
      applyResponse(event, options = {}) {
        const {
          renderDecisions = false,
          decisionContext = {},
          responseHeaders = {},
          responseBody = {
            handle: [],
          },
          personalization,
        } = options;
        const payload = createDataCollectionRequestPayload();
        const request = createDataCollectionRequest({
          payload,
        });
        const onResponseCallbackAggregator = createCallbackAggregator();
        return lifecycle
          .onBeforeEvent({
            event,
            renderDecisions,
            decisionContext,
            decisionScopes: [PAGE_WIDE_SCOPE],
            personalization,
            onResponse: onResponseCallbackAggregator.add,
            onRequestFailure: noop,
          })
          .then(() => {
            payload.addEvent(event);
            return applyResponse({
              request,
              responseHeaders,
              responseBody,
              runOnResponseCallbacks: onResponseCallbackAggregator.call,
            });
          });
      },
    };
  };

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
  const STATE_STORE_HANDLE_TYPE = "state:store";
  var createCookieTransfer = ({
    cookieJar,
    shouldTransferCookie,
    apexDomain,
    dateProvider,
  }) => {
    return {
      /**
       * When sending to a third-party endpoint, the endpoint won't be able to
       * access first-party cookies, therefore we transfer cookies into
       * the request body so they can be read by the server.
       */
      cookiesToPayload(payload, endpointDomain) {
        // localhost is a special case where the apexDomain is ""
        // We want to treat localhost as a third-party domain.
        const isEndpointFirstParty =
          apexDomain !== "" && endpointDomain.endsWith(apexDomain);
        const state = {
          domain: apexDomain,
          cookiesEnabled: true,
        };

        // If the endpoint is first-party, there's no need to transfer cookies
        // to the payload since they'll be automatically passed through cookie
        // headers.
        if (!isEndpointFirstParty) {
          const cookies = cookieJar.get();
          const entries = Object.keys(cookies)
            .filter(shouldTransferCookie)
            .map((qualifyingCookieName) => {
              return {
                key: qualifyingCookieName,
                value: cookies[qualifyingCookieName],
              };
            });
          if (entries.length) {
            state.entries = entries;
          }
        }
        payload.mergeState(state);
      },
      /**
       * When receiving from a third-party endpoint, the endpoint won't be able to
       * write first-party cookies, therefore we write first-party cookies
       * as directed in the response body.
       */
      responseToCookies(response) {
        response
          .getPayloadsByType(STATE_STORE_HANDLE_TYPE)
          .forEach((stateItem) => {
            const options = {
              domain: apexDomain,
            };
            const sameSite =
              stateItem.attrs &&
              stateItem.attrs.SameSite &&
              stateItem.attrs.SameSite.toLowerCase();
            if (stateItem.maxAge !== undefined) {
              // cookieJar expects "expires" as a date object
              options.expires = new Date(
                dateProvider().getTime() + stateItem.maxAge * 1000,
              );
            }
            if (sameSite !== undefined) {
              options.sameSite = sameSite;
            }
            // When sameSite is set to none, the secure flag must be set.
            // Experience edge will not set the secure flag in these cases.
            if (sameSite === "none") {
              options.secure = true;
            }
            cookieJar.set(stateItem.key, stateItem.value, options);
          });
      },
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const MBOX_EDGE_CLUSTER = "mboxEdgeCluster";
  const AT_QA_MODE = "at_qa_mode";
  const MBOX = "mbox";

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectShouldTransferCookie =
    ({ orgId, targetMigrationEnabled }) =>
    (name) => {
      // We have a contract with the server that we will pass
      // all cookies whose names are namespaced according to the
      // logic in isNamespacedCookieName as well as any legacy
      // cookie names (so that the server can handle migrating
      // identities on websites previously using Visitor.js)
      return (
        isNamespacedCookieName(orgId, name) ||
        name === AT_QA_MODE ||
        (targetMigrationEnabled && name === MBOX)
      );
    };

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
  var apiVersion = "v1";

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const TYPE_ERROR = "TypeError";
  const NETWORK_ERROR = "NetworkError";

  /**
   * Checks if the error is a network-related error
   * @param {Error} error The error to check
   * @returns {boolean} True if the error is network-related
   */
  const isNetworkError = (error) => {
    return (
      error.name === TYPE_ERROR ||
      error.name === NETWORK_ERROR ||
      error.status === 0
    );
  };

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

  var mergeLifecycleResponses = (returnValues) => {
    // Merges all returned objects from all `onResponse` callbacks into
    // a single object that can later be returned to the customer.
    const lifecycleOnResponseReturnValues = returnValues.shift() || [];
    const consumerOnResponseReturnValues = returnValues.shift() || [];
    const lifecycleOnBeforeRequestReturnValues = returnValues;
    return assignConcatArrayValues(
      {},
      ...lifecycleOnResponseReturnValues,
      ...consumerOnResponseReturnValues,
      ...lifecycleOnBeforeRequestReturnValues,
    );
  };

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
  var handleRequestFailure = (onRequestFailureCallbackAggregator) => {
    return (error) => {
      // Regardless of whether the network call failed, an unexpected status
      // code was returned, or the response body was malformed, we want to call
      // the onRequestFailure callbacks, but still throw the exception.
      const throwError = () => {
        throw error;
      };
      return onRequestFailureCallbackAggregator
        .call({
          error,
        })
        .then(throwError, throwError);
    };
  };

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

  const isDemdexBlockedError = (error, request) => {
    return request.getUseIdThirdPartyDomain() && isNetworkError(error);
  };
  var injectSendEdgeNetworkRequest = ({
    config,
    lifecycle,
    cookieTransfer,
    sendNetworkRequest,
    createResponse,
    processWarningsAndErrors,
    getLocationHint,
    getAssuranceValidationTokenParams,
  }) => {
    const { edgeDomain, edgeBasePath, datastreamId } = config;
    let hasDemdexFailed = false;
    const buildEndpointUrl = (endpointDomain, request) => {
      const locationHint = getLocationHint();
      const edgeBasePathWithLocationHint = locationHint
        ? edgeBasePath + "/" + locationHint + request.getEdgeSubPath()
        : "" + edgeBasePath + request.getEdgeSubPath();
      const configId = request.getDatastreamIdOverride() || datastreamId;
      if (configId !== datastreamId) {
        request.getPayload().mergeMeta({
          sdkConfig: {
            datastream: {
              original: datastreamId,
            },
          },
        });
      }
      return (
        "https://" +
        endpointDomain +
        "/" +
        edgeBasePathWithLocationHint +
        "/" +
        apiVersion +
        "/" +
        request.getAction() +
        "?configId=" +
        configId +
        "&requestId=" +
        request.getId() +
        getAssuranceValidationTokenParams()
      );
    };

    /**
     * Sends a network request that is aware of payload interfaces,
     * lifecycle methods, configured edge domains, response structures, etc.
     */
    return ({
      request,
      runOnResponseCallbacks = noop,
      runOnRequestFailureCallbacks = noop,
    }) => {
      const onResponseCallbackAggregator = createCallbackAggregator();
      onResponseCallbackAggregator.add(lifecycle.onResponse);
      onResponseCallbackAggregator.add(runOnResponseCallbacks);
      const onRequestFailureCallbackAggregator = createCallbackAggregator();
      onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
      onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);
      return lifecycle
        .onBeforeRequest({
          request,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: onRequestFailureCallbackAggregator.add,
        })
        .then(() => {
          const endpointDomain =
            hasDemdexFailed || !request.getUseIdThirdPartyDomain()
              ? edgeDomain
              : ID_THIRD_PARTY;
          const url = buildEndpointUrl(endpointDomain, request);
          const payload = request.getPayload();
          cookieTransfer.cookiesToPayload(payload, endpointDomain);
          return sendNetworkRequest({
            requestId: request.getId(),
            url,
            payload,
            useSendBeacon: request.getUseSendBeacon(),
          });
        })
        .then((networkResponse) => {
          processWarningsAndErrors(networkResponse);
          return networkResponse;
        })
        .catch((error) => {
          if (isDemdexBlockedError(error, request)) {
            hasDemdexFailed = true;
            request.setUseIdThirdPartyDomain(false);
            const url = buildEndpointUrl(edgeDomain, request);
            const payload = request.getPayload();
            cookieTransfer.cookiesToPayload(payload, edgeDomain);
            return sendNetworkRequest({
              requestId: request.getId(),
              url,
              payload,
              useSendBeacon: request.getUseSendBeacon(),
            });
          }
          return handleRequestFailure(onRequestFailureCallbackAggregator)(
            error,
          );
        })
        .then(({ parsedBody, getHeader }) => {
          // Note that networkResponse.parsedBody may be undefined if it was a
          // 204 No Content response. That's fine.
          const response = createResponse({
            content: parsedBody,
            getHeader,
          });
          cookieTransfer.responseToCookies(response);

          // Notice we're calling the onResponse lifecycle method even if there are errors
          // inside the response body. This is because the full request didn't actually fail--
          // only portions of it that are considered non-fatal (a specific, non-critical
          // Konductor plugin, for example).
          return onResponseCallbackAggregator
            .call({
              response,
            })
            .then(mergeLifecycleResponses);
        });
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const NO_CONTENT = 204;
  const TOO_MANY_REQUESTS = 429;
  const BAD_GATEWAY = 502;
  const SERVICE_UNAVAILABLE = 503;
  const GATEWAY_TIMEOUT = 504;

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

  const MESSAGE_PREFIX = "The server responded with a";
  var injectProcessWarningsAndErrors = ({ logger }) => {
    return (networkResponse) => {
      const { statusCode, body, parsedBody } = networkResponse;
      if (
        statusCode < 200 ||
        statusCode >= 300 ||
        (!parsedBody && statusCode !== NO_CONTENT) ||
        (parsedBody && !Array.isArray(parsedBody.handle))
      ) {
        const bodyToLog = parsedBody
          ? JSON.stringify(parsedBody, null, 2)
          : body;
        const messageSuffix = bodyToLog
          ? "response body:\n" + bodyToLog
          : "no response body.";
        throw new Error(
          MESSAGE_PREFIX +
            " status code " +
            statusCode +
            " and " +
            messageSuffix,
        );
      }
      if (parsedBody) {
        const { warnings = [], errors = [] } = parsedBody;
        warnings.forEach((warning) => {
          logger.warn(MESSAGE_PREFIX + " warning:", warning);
        });
        errors.forEach((error) => {
          logger.error(MESSAGE_PREFIX + " non-fatal error:", error);
        });
      }
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectGetLocationHint = ({ orgId, cookieJar }) => {
    const clusterCookieName = getNamespacedCookieName(orgId, CLUSTER);
    const fromClusterCookie = () => cookieJar.get(clusterCookieName);
    const fromTarget = () => {
      const mboxEdgeCluster = cookieJar.get(MBOX_EDGE_CLUSTER);
      if (mboxEdgeCluster) {
        return "t" + mboxEdgeCluster;
      }
      return undefined;
    };
    return () => {
      return fromClusterCookie() || fromTarget();
    };
  };

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

  const MAX_RETRIES = 3;
  const RETRYABLE_STATUS_CODES = [
    TOO_MANY_REQUESTS,
    SERVICE_UNAVAILABLE,
    BAD_GATEWAY,
    GATEWAY_TIMEOUT,
  ];

  // These rules are in accordance with
  // https://git.corp.adobe.com/pages/experience-edge/konductor/#/apis/errors?id=handling-4xx-and-5xx-responses
  var isRequestRetryable = ({ response, retriesAttempted }) => {
    return (
      retriesAttempted < MAX_RETRIES &&
      RETRYABLE_STATUS_CODES.includes(response.statusCode)
    );
  };

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

  // The retry gets incrementally (but not exponentially) longer for each retry.
  const FIRST_DELAY_MILLIS = 1000;
  const INCREMENTAL_DELAY_MILLIS = 1000;

  // When the target delay is randomized, make it within the range of this percentage above or below the target delay.
  const MAX_RANDOM_VARIANCE_PERCENTAGE = 0.3;
  const calculateRetryDelay = (retriesAttempted) => {
    const targetDelay =
      FIRST_DELAY_MILLIS + retriesAttempted * INCREMENTAL_DELAY_MILLIS;
    const maxVariance = targetDelay * MAX_RANDOM_VARIANCE_PERCENTAGE;
    const minDelay = targetDelay - maxVariance;
    const maxDelay = targetDelay + maxVariance;
    const randomizedDelayWithinRange = Math.round(
      minDelay + Math.random() * (maxDelay - minDelay),
    );
    return randomizedDelayWithinRange;
  };
  const getDelayFromHeader = (response) => {
    // According to the HTTP spec, if the header is defined, its value will be a string that
    // represents either:
    //  * An integer indicating the number of seconds to delay.
    //  * A date after which a retry may occur. The date would be in HTTP-date
    //    format (https://tools.ietf.org/html/rfc7231#section-7.1.1.1). When debugging, it can
    //    be helpful to know that this is the same format that a JavaScript date's
    //    toGMTString() returns.
    const headerValue = response.getHeader(RETRY_AFTER);
    let delayInMillis;
    if (headerValue) {
      const headerValueInt = parseInt(headerValue, 10);
      if (isInteger(headerValueInt)) {
        delayInMillis = headerValueInt * 1000;
      } else {
        delayInMillis = Math.max(
          0,
          new Date(headerValue).getTime() - new Date().getTime(),
        );
      }
    }
    return delayInMillis;
  };

  // These rules are in accordance with
  // https://git.corp.adobe.com/pages/experience-edge/konductor/#/apis/errors?id=handling-4xx-and-5xx-responses
  // For retry delays that don't come from a Retry-After response header, we try to stick with the following best
  // practices outlined in https://docs.microsoft.com/en-us/azure/architecture/best-practices/transient-faults:
  //  * Incremental retry
  //  * Random interval
  var getRequestRetryDelay = ({ response, retriesAttempted }) => {
    // Technically, only 429 or 503 responses should have a Retry-After header, but we'll respect the
    // header if we find it on any response.
    let delayInMillis = getDelayFromHeader(response);

    // Note that the value of delay may be 0 at this point, which would be a valid delay we want to use
    // and not override, which is why we don't do:
    // if (!delay) { ... }
    if (delayInMillis === undefined) {
      delayInMillis = calculateRetryDelay(retriesAttempted);
    }
    return delayInMillis;
  };

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
  const HTTP_STATUS_OK = 200;
  var injectApplyResponse = ({
    cookieTransfer,
    lifecycle,
    createResponse,
    processWarningsAndErrors,
  }) => {
    return ({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks = noop,
      runOnRequestFailureCallbacks = noop,
    }) => {
      const onResponseCallbackAggregator = createCallbackAggregator();
      onResponseCallbackAggregator.add(lifecycle.onResponse);
      onResponseCallbackAggregator.add(runOnResponseCallbacks);
      const onRequestFailureCallbackAggregator = createCallbackAggregator();
      onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
      onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);
      const getHeader = (key) => responseHeaders[key];
      return lifecycle
        .onBeforeRequest({
          request,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: onRequestFailureCallbackAggregator.add,
        })
        .then(() =>
          processWarningsAndErrors({
            statusCode: HTTP_STATUS_OK,
            getHeader,
            body: JSON.stringify(responseBody),
            parsedBody: responseBody,
          }),
        )
        .catch(handleRequestFailure(onRequestFailureCallbackAggregator))
        .then(() => {
          const response = createResponse({
            content: responseBody,
            getHeader,
          });

          // This will clobber any cookies set via HTTP from the server.  So care should be given to remove any state:store handles if that is not desirable
          cookieTransfer.responseToCookies(response);
          return onResponseCallbackAggregator
            .call({
              response,
            })
            .then(mergeLifecycleResponses);
        });
    };
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /* eslint-disable dot-notation */

  /** @import { AlloyMonitor } from './types.js' */

  /**
   * This factory function creates a getter that combines both provided monitors
   * and any monitors found in the global window.__alloyMonitors array.
   *
   * @param {Array<AlloyMonitor>} [monitors] - Optional array of monitor objects to append to the current one
   * @returns {Function} A function that when called, returns all available monitors
   */
  var getMonitors = (monitors) => {
    /** @type {Array<AlloyMonitor>} */
    let alloyMonitors = window["__alloyMonitors"] || [];
    if (monitors) {
      alloyMonitors = alloyMonitors.concat(monitors);
    }
    return alloyMonitors;
  };

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

  var injectWeb = (window) => {
    return (xdm) => {
      const web = {
        webPageDetails: {
          URL: window.location.href || window.location,
        },
        webReferrer: {
          URL: window.document.referrer,
        },
      };
      deepAssign(xdm, {
        web,
      });
    };
  };

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

  const getScreenOrientationViaProperty = (window) => {
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
  const getScreenOrientationViaMediaQuery = (window) => {
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
  var injectDevice = (window) => {
    return (xdm) => {
      const {
        screen: { width, height },
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
        deepAssign(xdm, {
          device,
        });
      }
    };
  };

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

  var injectEnvironment = (window) => {
    return (xdm) => {
      const {
        document: { documentElement: { clientWidth, clientHeight } = {} },
      } = window;
      const environment = {
        type: "browser",
      };
      const viewportWidth = toInteger(clientWidth);
      if (viewportWidth >= 0) {
        environment.browserDetails = {
          viewportWidth,
        };
      }
      const viewportHeight = toInteger(clientHeight);
      if (viewportHeight >= 0) {
        environment.browserDetails = environment.browserDetails || {};
        environment.browserDetails.viewportHeight = viewportHeight;
      }
      deepAssign(xdm, {
        environment,
      });
    };
  };

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
  var injectPlaceContext = (dateProvider) => {
    return (xdm) => {
      const date = dateProvider();
      const placeContext = {};
      const localTimezoneOffset = toInteger(date.getTimezoneOffset());
      if (localTimezoneOffset !== undefined) {
        placeContext.localTimezoneOffset = localTimezoneOffset;
      }
      // make sure the timezone offset only uses two digits
      if (
        localTimezoneOffset === undefined ||
        Math.abs(localTimezoneOffset) < 6000
      ) {
        placeContext.localTime = toISOStringLocal(date);
      }
      deepAssign(xdm, {
        placeContext,
      });
    };
  };

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

  var injectTimestamp = (dateProvider) => {
    return (xdm) => {
      const timestamp = dateProvider().toISOString();
      deepAssign(xdm, {
        timestamp,
      });
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var libraryName = "https://ns.adobe.com/experience/alloy";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // The __VERSION__ keyword will be replace at alloy build time with the package.json version.
  // see babel-plugin-version

  var libraryVersion = "2.29.0-beta.1";

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
  var implementationDetails = (xdm) => {
    const implementationDetails = {
      name: libraryName,
      version: libraryVersion,
      environment: "browser",
    };
    deepAssign(xdm, {
      implementationDetails,
    });
  };

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
  var createComponent$5 = (
    config,
    logger,
    optionalContexts,
    requiredContexts,
  ) => {
    const configuredContexts = config.context;
    const contexts = configuredContexts
      .flatMap((context, i) => {
        if (optionalContexts[context]) {
          return [optionalContexts[context]];
        }
        logger.warn(
          "Invalid context[" + i + "]: '" + context + "' is not available.",
        );
        return [];
      })
      .concat(requiredContexts);
    return {
      namespace: "Context",
      lifecycle: {
        onBeforeEvent({ event }) {
          const xdm = {};
          return Promise.all(
            contexts.map((context) => Promise.resolve(context(xdm, logger))),
          ).then(() => event.mergeXdm(xdm));
        },
      },
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var highEntropyUserAgentHints$1 = [
    ["architecture", "string"],
    ["bitness", "string"],
    ["model", "string"],
    ["platformVersion", "string"],
    ["wow64", "boolean"],
  ];

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const browserSupportsUserAgentClientHints = (navigator) => {
    return "userAgentData" in navigator;
  };
  var injectHighEntropyUserAgentHints = (navigator) => {
    if (!browserSupportsUserAgentClientHints(navigator)) {
      return noop;
    }
    return (xdm, logger) => {
      try {
        // eslint-disable-next-line compat/compat -- userAgentData support is checked before calling
        return navigator.userAgentData
          .getHighEntropyValues(
            highEntropyUserAgentHints$1.map((hint) => hint[0]),
          )
          .then((hints) => {
            const userAgentClientHints = {};
            highEntropyUserAgentHints$1.forEach(([hintName, hintType]) => {
              if (
                Object.prototype.hasOwnProperty.call(
                  hints,
                  hintName,
                ) /* eslint-disable-next-line valid-typeof */ &&
                typeof hints[hintName] === hintType
              ) {
                userAgentClientHints[hintName] = hints[hintName];
              }
            });
            deepAssign(xdm, {
              environment: {
                browserDetails: {
                  userAgentClientHints,
                },
              },
            });
          });
      } catch (error) {
        logger.warn(
          "Unable to collect user-agent client hints. " + error.message,
        );
        return noop;
      }
    };
  };

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

  const web = injectWeb(window);
  const device = injectDevice(window);
  const environment = injectEnvironment(window);
  const placeContext = injectPlaceContext(() => new Date());
  const timestamp = injectTimestamp(() => new Date());
  const highEntropyUserAgentHints = injectHighEntropyUserAgentHints(navigator);
  const defaultEnabledContexts = {
    web,
    device,
    environment,
    placeContext,
  };
  const defaultDisabledContexts = {
    highEntropyUserAgentHints,
  };
  const optionalContexts = {
    ...defaultEnabledContexts,
    ...defaultDisabledContexts,
  };
  const requiredContexts = [timestamp, implementationDetails];
  const createContext$1 = ({ config, logger }) => {
    return createComponent$5(
      config,
      logger,
      optionalContexts,
      requiredContexts,
    );
  };
  createContext$1.namespace = "Context";
  createContext$1.configValidators = boundObjectOf({
    context: boundArrayOf(boundString()).default(
      Object.keys(defaultEnabledContexts),
    ),
  });

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Verifies user provided event options.
   * @param {*} options The user event options to validate
   * @returns {*} Validated options
   */
  var validateUserEventOptions = ({ options }) => {
    const eventOptionsValidator = boundObjectOf({
      type: boundString(),
      xdm: boundObjectOf({
        eventType: boundString(),
        identityMap: validateIdentityMap,
      }),
      data: boundObjectOf({}),
      documentUnloading: boundBoolean(),
      renderDecisions: boundBoolean(),
      decisionScopes: boundArrayOf(boundString()).uniqueItems(),
      personalization: boundObjectOf({
        decisionScopes: boundArrayOf(boundString()).uniqueItems(),
        surfaces: boundArrayOf(boundString()).uniqueItems(),
        sendDisplayEvent: boundBoolean().default(true),
        includeRenderedPropositions: boundBoolean().default(false),
        defaultPersonalizationEnabled: boundBoolean(),
        decisionContext: boundObjectOf({}),
      }).default({
        sendDisplayEvent: true,
      }),
      datasetId: boundString(),
      mergeId: boundString(),
      edgeConfigOverrides: validateConfigOverride,
      advertising: boundObjectOf({
        handleAdvertisingData: boundEnumOf(DISABLED, WAIT, AUTO).default(
          DISABLED,
        ),
      }),
    })
      .required()
      .noUnknownFields();
    return eventOptionsValidator(options);
  };

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
  var validateApplyResponse = ({ options }) => {
    const validator = boundObjectOf({
      renderDecisions: boundBoolean(),
      responseHeaders: boundMapOfValues(boundString().required()),
      responseBody: boundObjectOf({
        handle: boundArrayOf(
          boundObjectOf({
            type: boundString().required(),
            payload: boundAnything().required(),
          }),
        ).required(),
      }).required(),
      personalization: boundObjectOf({
        sendDisplayEvent: boundBoolean().default(true),
        decisionContext: boundObjectOf({}),
      }).default({
        sendDisplayEvent: true,
      }),
    }).noUnknownFields();
    return validator(options);
  };

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

  const createDataCollector = ({ eventManager, logger }) => {
    return {
      commands: {
        sendEvent: {
          documentationUri: "https://adobe.ly/3GQ3Q7t",
          optionsValidator: (options) => {
            return validateUserEventOptions({
              options,
            });
          },
          run: (options) => {
            const {
              xdm,
              data,
              documentUnloading,
              type,
              mergeId,
              datasetId,
              edgeConfigOverrides,
              ...eventManagerOptions
            } = options;
            const event = eventManager.createEvent();
            if (documentUnloading) {
              event.documentMayUnload();
            }
            event.setUserXdm(xdm);
            event.setUserData(data);
            if (type) {
              event.mergeXdm({
                eventType: type,
              });
            }
            if (mergeId) {
              event.mergeXdm({
                eventMergeId: mergeId,
              });
            }
            if (edgeConfigOverrides) {
              eventManagerOptions.edgeConfigOverrides = edgeConfigOverrides;
            }
            if (datasetId) {
              logger.warn(
                "The 'datasetId' option has been deprecated. Please use 'edgeConfigOverrides.com_adobe_experience_platform.datasets.event.datasetId' instead.",
              );
              eventManagerOptions.edgeConfigOverrides =
                edgeConfigOverrides || {};
              deepAssign(eventManagerOptions.edgeConfigOverrides, {
                com_adobe_experience_platform: {
                  datasets: {
                    event: {
                      datasetId,
                    },
                  },
                },
              });
            }
            return eventManager.sendEvent(event, eventManagerOptions);
          },
        },
        applyResponse: {
          documentationUri: "",
          optionsValidator: (options) => {
            return validateApplyResponse({
              options,
            });
          },
          run: (options) => {
            const {
              renderDecisions = false,
              decisionContext = {},
              responseHeaders = {},
              responseBody = {
                handle: [],
              },
              personalization,
            } = options;
            const event = eventManager.createEvent();
            return eventManager.applyResponse(event, {
              renderDecisions,
              decisionContext,
              responseHeaders,
              responseBody,
              personalization,
            });
          },
        },
      },
    };
  };
  createDataCollector.namespace = "DataCollector";

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
  const createResultLogMessage$1 = (idSync, success) => {
    return (
      "ID sync " + (success ? "succeeded" : "failed") + ": " + idSync.spec.url
    );
  };
  var injectProcessIdSyncs =
    ({ fireReferrerHideableImage, logger }) =>
    (idSyncs) => {
      const urlIdSyncs = idSyncs.filter((idSync) => idSync.type === "url");
      if (!urlIdSyncs.length) {
        return Promise.resolve();
      }
      return Promise.all(
        urlIdSyncs.map((idSync) => {
          return fireReferrerHideableImage(idSync.spec)
            .then(() => {
              logger.info(createResultLogMessage$1(idSync, true));
            })
            .catch(() => {
              // We intentionally do not throw an error if id syncs fail. We
              // consider it a non-critical failure and therefore do not want it to
              // reject the promise handed back to the customer.
              logger.error(createResultLogMessage$1(idSync, false));
            });
        }),
      ).then(noop);
    };

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

  const configValidators$3 = boundObjectOf({
    thirdPartyCookiesEnabled: boundBoolean().default(true),
    idMigrationEnabled: boundBoolean().default(true),
  });

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Verifies user provided event options.
   * @param {*} options The user event options to validate
   * @returns {*} Validated options
   */
  var appendIdentityToUrlOptionsValidator = boundObjectOf({
    url: boundString().required().nonEmpty(),
    edgeConfigOverrides: validateConfigOverride,
  })
    .required()
    .noUnknownFields();

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

  var ecidNamespace = "ECID";

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
  var createComponent$4 = ({
    addEcidQueryToPayload,
    addQueryStringIdentityToPayload,
    ensureSingleIdentity,
    setLegacyEcid,
    handleResponseForIdSyncs,
    getNamespacesFromResponse,
    getIdentity,
    consent,
    appendIdentityToUrl,
    logger,
    getIdentityOptionsValidator,
    decodeKndctrCookie,
  }) => {
    let namespaces;
    let edge = {};
    return {
      lifecycle: {
        onBeforeRequest({ request, onResponse, onRequestFailure }) {
          // Querying the ECID on every request to be able to set the legacy cookie, and make it
          // available for the `getIdentity` command.
          addEcidQueryToPayload(request.getPayload());
          addQueryStringIdentityToPayload(request.getPayload());
          return ensureSingleIdentity({
            request,
            onResponse,
            onRequestFailure,
          });
        },
        onResponse({ response }) {
          const newNamespaces = getNamespacesFromResponse(response);
          if (
            (!namespaces || !namespaces[ecidNamespace]) &&
            newNamespaces &&
            newNamespaces[ecidNamespace]
          ) {
            // Only data collection calls will have an ECID in the response.
            // https://jira.corp.adobe.com/browse/EXEG-1234
            setLegacyEcid(newNamespaces[ecidNamespace]);
          }
          if (newNamespaces && Object.keys(newNamespaces).length > 0) {
            namespaces = {
              ...namespaces,
              ...newNamespaces,
            };
          }
          // For sendBeacon requests, getEdge() will return {}, so we are using assign here
          // so that sendBeacon requests don't override the edge info from before.
          edge = {
            ...edge,
            ...response.getEdge(),
          };
          return handleResponseForIdSyncs(response);
        },
      },
      commands: {
        getIdentity: {
          optionsValidator: getIdentityOptionsValidator,
          run: (options) => {
            const { namespaces: requestedNamespaces } = options;
            return consent
              .awaitConsent()
              .then(() => {
                if (namespaces) {
                  return undefined;
                }
                const ecidFromCookie = decodeKndctrCookie();
                if (
                  ecidFromCookie &&
                  requestedNamespaces.includes(ecidNamespace)
                ) {
                  if (!namespaces) {
                    namespaces = {};
                  }
                  namespaces[ecidNamespace] = ecidFromCookie;
                  if (requestedNamespaces.length === 1) {
                    // If only ECID is requested, we don't need to make an acquire request
                    // and can return immediately
                    return undefined;
                  }
                }
                return getIdentity(options);
              })
              .then(() => {
                return {
                  identity: requestedNamespaces.reduce((acc, namespace) => {
                    acc[namespace] = namespaces[namespace] || null;
                    return acc;
                  }, {}),
                  edge,
                };
              });
          },
        },
        appendIdentityToUrl: {
          optionsValidator: appendIdentityToUrlOptionsValidator,
          run: (options) => {
            return consent
              .withConsent()
              .then(() => {
                if (namespaces) {
                  return undefined;
                }
                const ecidFromCookie = decodeKndctrCookie();
                if (ecidFromCookie) {
                  if (!namespaces) {
                    namespaces = {};
                  }
                  namespaces[ecidNamespace] = ecidFromCookie;
                  return undefined;
                }
                return getIdentity(options);
              })
              .then(() => {
                return {
                  url: appendIdentityToUrl(
                    namespaces[ecidNamespace],
                    options.url,
                  ),
                };
              })
              .catch((error) => {
                logger.warn(
                  "Unable to append identity to url. " + error.message,
                );
                return options;
              });
          },
        },
      },
    };
  };

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

  /**
   * Handles migration of ECID to and from Visitor.js.
   */
  var createLegacyIdentity = ({
    config,
    getEcidFromVisitor,
    apexDomain,
    isPageSsl,
    cookieJar,
  }) => {
    const { idMigrationEnabled, orgId } = config;
    const amcvCookieName = "AMCV_" + orgId;
    const getEcidFromLegacyCookies = () => {
      let ecid = null;
      const secidCookieName = "s_ecid";
      const legacyEcidCookieValue =
        cookieJar.get(secidCookieName) || cookieJar.get(amcvCookieName);
      if (legacyEcidCookieValue) {
        const reg = /(^|\|)MCMID\|(\d+)($|\|)/;
        const matches = legacyEcidCookieValue.match(reg);
        if (matches) {
          // Destructuring arrays breaks in IE
          ecid = matches[2];
        }
      }
      return ecid;
    };
    return {
      getEcid() {
        if (idMigrationEnabled) {
          const ecid = getEcidFromLegacyCookies();
          if (ecid) {
            return Promise.resolve(ecid);
          }
          return getEcidFromVisitor();
        }
        return Promise.resolve();
      },
      setEcid(ecid) {
        if (idMigrationEnabled && getEcidFromLegacyCookies() !== ecid) {
          const extraOptions = isPageSsl
            ? {
                sameSite: "none",
                secure: true,
              }
            : {};
          cookieJar.set(amcvCookieName, "MCMID|" + ecid, {
            domain: apexDomain,
            // Without `expires` this will be a session cookie.
            expires: 390,
            // days, or 13 months.
            ...extraOptions,
          });
        }
      },
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var awaitVisitorOptIn = ({ logger }) => {
    return new Promise((resolve, reject) => {
      if (isObject(window.adobe) && isObject(window.adobe.optIn)) {
        const optInOld = window.adobe.optIn;
        logger.info(
          "Delaying request while waiting for legacy opt-in to let Visitor retrieve ECID from server.",
        );
        optInOld.fetchPermissions(() => {
          if (optInOld.isApproved([optInOld.Categories.ECID])) {
            logger.info(
              "Received legacy opt-in approval to let Visitor retrieve ECID from server.",
            );
            resolve();
          } else {
            reject(new Error("Legacy opt-in was declined."));
          }
        }, true);
      } else {
        resolve();
      }
    });
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var getVisitor = (window) => {
    const Visitor = window.Visitor;
    return isFunction(Visitor) && isFunction(Visitor.getInstance) && Visitor;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectGetEcidFromVisitor = ({ logger, orgId, awaitVisitorOptIn }) => {
    return () => {
      const Visitor = getVisitor(window);
      if (Visitor) {
        // Need to explicitly wait for optIn because visitor will call callback
        // with invalid values prior to optIn being approved
        return awaitVisitorOptIn({
          logger,
        })
          .then(() => {
            logger.info(
              "Delaying request while using Visitor to retrieve ECID from server.",
            );
            return new Promise((resolve) => {
              const visitor = Visitor.getInstance(orgId, {});
              visitor.getMarketingCloudVisitorID((ecid) => {
                logger.info(
                  "Resuming previously delayed request that was waiting for ECID from Visitor.",
                );
                resolve(ecid);
              }, true);
            });
          })
          .catch((error) => {
            // If consent was denied, get the ECID from experience edge. OptIn and AEP Web SDK
            // consent should operate independently, but during id migration AEP Web SDK needs
            // to wait for optIn object consent resolution so that only one ECID is generated.
            if (error) {
              logger.info(
                error.message + ", retrieving ECID from experience edge",
              );
            } else {
              logger.info(
                "An error occurred while obtaining the ECID from Visitor.",
              );
            }
          });
      }
      return Promise.resolve();
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectHandleResponseForIdSyncs = ({ processIdSyncs }) => {
    return (response) => {
      return processIdSyncs(response.getPayloadsByType("identity:exchange"));
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // TO-DOCUMENT: We queue subsequent requests until we have an identity cookie.
  var injectEnsureSingleIdentity = ({
    doesIdentityCookieExist,
    setDomainForInitialIdentityPayload,
    addLegacyEcidToPayload,
    awaitIdentityCookie,
    logger,
  }) => {
    let obtainedIdentityPromise;
    const allowRequestToGoWithoutIdentity = (request) => {
      setDomainForInitialIdentityPayload(request);
      return addLegacyEcidToPayload(request.getPayload());
    };

    /**
     * Ensures that if no identity cookie exists, we only let one request at a
     * time without an identity until its response returns. In the meantime,
     * we queue all other requests, otherwise the requests could result in
     * multiple ECIDs being minted for the user. Once we get an identity
     * cookie, we can let the queued requests be sent all at once, since they
     * will have the newly minted ECID.
     *
     * Konductor should make every effort to return an identity, but in
     * certain scenarios it may not. For example, in cases where the
     * request does not match what Konductor is expecting (ie 400s).
     * In cases where Konductor does not set an identity, there should be
     * no events recorded so we don't need to worry about multiple ECIDs
     * being minted for each user.
     *
     * The reason we allow for multiple sequential requests to be sent without
     * an identity is to prevent a single malformed request causing all other
     * requests to never send.
     */
    return ({ request, onResponse, onRequestFailure }) => {
      if (doesIdentityCookieExist()) {
        request.setIsIdentityEstablished();
        return Promise.resolve();
      }
      if (obtainedIdentityPromise) {
        // We don't have an identity cookie, but at least one request has
        // been sent to get it. Konductor may set the identity cookie in the
        // response. We will hold up this request until the previous request
        // returns and awaitIdentityCookie confirms the identity was set.
        logger.info("Delaying request while retrieving ECID from server.");
        const previousObtainedIdentityPromise = obtainedIdentityPromise;

        // This promise resolves when we have an identity cookie. Additional
        // requests are chained together so that only one is sent at a time
        // until we have the identity cookie.
        obtainedIdentityPromise = previousObtainedIdentityPromise.catch(() => {
          return awaitIdentityCookie({
            onResponse,
            onRequestFailure,
          });
        });
        // This prevents an un-caught promise in the console when the identity isn't set.
        obtainedIdentityPromise.catch(() => {});

        // When this returned promise resolves, the request will go out.
        return (
          previousObtainedIdentityPromise
            .then(() => {
              logger.info("Resuming previously delayed request.");
              request.setIsIdentityEstablished();
            })
            // If Konductor did not set the identity cookie on the previous
            // request, then awaitIdentityCookie will reject its promise.
            // Catch the rejection here and allow this request to go out.
            .catch(() => {
              return allowRequestToGoWithoutIdentity(request);
            })
        );
      }

      // For Alloy+Konductor communication to be as robust as possible and
      // to ensure we don't mint new ECIDs for requests that would otherwise
      // be sent in parallel, we'll let this request go out to fetch the
      // cookie
      obtainedIdentityPromise = awaitIdentityCookie({
        onResponse,
        onRequestFailure,
      });
      // This prevents an un-caught promise in the console when the identity isn't set.
      obtainedIdentityPromise.catch(() => {});
      return allowRequestToGoWithoutIdentity(request);
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var coreNamespace = "CORE";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectAddEcidQueryToPayload = ({
    thirdPartyCookiesEnabled,
    areThirdPartyCookiesSupportedByDefault,
  }) => {
    const query = {
      identity: {
        fetch: [ecidNamespace],
      },
    };
    if (thirdPartyCookiesEnabled && areThirdPartyCookiesSupportedByDefault()) {
      query.identity.fetch.push(coreNamespace);
    }
    return (payload) => {
      payload.mergeQuery(query);
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectSetDomainForInitialIdentityPayload = ({
    thirdPartyCookiesEnabled,
    areThirdPartyCookiesSupportedByDefault,
  }) => {
    return (request) => {
      if (
        thirdPartyCookiesEnabled &&
        areThirdPartyCookiesSupportedByDefault()
      ) {
        // If third-party cookies are enabled by the customer and
        // supported by the browser, we will send the request to a
        // a third-party identification domain that allows for more accurate
        // identification of the user through use of a third-party cookie.
        // If we have an identity to migrate, we still want to hit the
        // third-party identification domain because the third-party identification
        // domain will use our ECID to set the third-party cookie if the third-party
        // cookie isn't already set, which provides for better cross-domain
        // identification for future requests.
        request.setUseIdThirdPartyDomain();
      }
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectAddLegacyEcidToPayload = ({ getLegacyEcid, addEcidToPayload }) => {
    return (payload) => {
      if (payload.hasIdentity(ecidNamespace)) {
        // don't get the legacy identity if we already have the query string identity or if
        // the user specified it in the identity map
        return Promise.resolve();
      }
      return getLegacyEcid().then((ecidToMigrate) => {
        if (ecidToMigrate) {
          addEcidToPayload(payload, ecidToMigrate);
        }
      });
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var queryStringIdentityParam = "adobe_mc";

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var decodeUriComponentSafely = (v) => {
    try {
      return decodeURIComponent(v);
    } catch {
      return "";
    }
  };

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
  // Example: adobe_mc=TS%3D1641432103%7CMCMID%3D77094828402023918047117570965393734545%7CMCORGID%3DFAF554945B90342F0A495E2C%40AdobeOrg
  // Decoded: adobe_mc=TS=1641432103|MCMID=77094828402023918047117570965393734545|MCORGID=FAF554945B90342F0A495E2C@AdobeOrg

  const LINK_TTL_SECONDS = 300; // 5 minute link time to live

  var injectAddQueryStringIdentityToPayload =
    ({ locationSearch, dateProvider, orgId, logger }) =>
    (payload) => {
      if (payload.hasIdentity(ecidNamespace)) {
        // don't overwrite a user provided ecid identity
        return;
      }
      const parsedQueryString = queryString.parse(locationSearch);
      let queryStringValue = parsedQueryString[queryStringIdentityParam];
      if (queryStringValue === undefined) {
        return;
      }
      if (Array.isArray(queryStringValue)) {
        logger.warn(
          "Found multiple adobe_mc query string paramters, only using the last one.",
        );
        queryStringValue = queryStringValue[queryStringValue.length - 1];
      }
      const properties = queryStringValue
        .split("|")
        .reduce((memo, keyValue) => {
          const [key, value] = keyValue.split("=");
          memo[key] = decodeUriComponentSafely(value);
          memo[key] = memo[key].replace(/[^a-zA-Z0-9@.]/g, ""); // sanitization
          return memo;
        }, {});
      // We are using MCMID and MCORGID to be compatible with Visitor.
      const ts = parseInt(properties.TS, 10);
      const mcmid = properties.MCMID;
      const mcorgid = decodeUriComponentSafely(properties.MCORGID);
      if (
        // When TS is not specified or not a number, the following inequality returns false.
        // All inequalities with NaN variables are false.
        dateProvider().getTime() / 1000 <= ts + LINK_TTL_SECONDS &&
        mcorgid === orgId &&
        mcmid
      ) {
        logger.info(
          "Found valid ECID identity " +
            mcmid +
            " from the adobe_mc query string parameter.",
        );
        payload.addIdentity(ecidNamespace, {
          id: mcmid,
        });
      } else {
        logger.info(
          "Detected invalid or expired adobe_mc query string parameter.",
        );
      }
    };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var addEcidToPayload = (payload, ecid) => {
    payload.addIdentity(ecidNamespace, {
      id: ecid,
    });
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectAwaitIdentityCookie = ({
    doesIdentityCookieExist,
    orgId,
    logger,
  }) => {
    /**
     * Returns a promise that will be resolved once an identity cookie exists.
     * If an identity cookie doesn't already exist, it should always exist after
     * the first response.
     */
    return ({ onResponse, onRequestFailure }) => {
      return new Promise((resolve, reject) => {
        onResponse(() => {
          if (doesIdentityCookieExist()) {
            resolve();
          } else {
            // This logic assumes that the code setting the cookie is working as expected and that
            // the cookie was missing from the response.
            logger.warn(
              "Identity cookie not found. This could be caused by any of the following issues:\n" +
                ("\t* The org ID " +
                  orgId +
                  " configured in Alloy doesn't match the org ID specified in the edge configuration.\n") +
                "\t* Experience edge was not able to set the identity cookie due to domain or cookie restrictions.\n" +
                "\t* The request was canceled by the browser and not fully processed.",
            );

            // Rejecting the promise will tell queued events to still go out
            // one at a time.
            reject(new Error("Identity cookie not found."));
          }
        });
        onRequestFailure(() => {
          if (doesIdentityCookieExist()) {
            resolve();
          } else {
            // The error from the request failure will be logged separately. Rejecting this here
            // will tell ensureSingleIdentity to send the next request without identity
            reject(new Error("Identity cookie not found."));
          }
        });
      });
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var getNamespacesFromResponse = (response) => {
    const identityResultPayloads =
      response.getPayloadsByType("identity:result");
    return identityResultPayloads.reduce((acc, payload) => {
      if (payload.namespace && payload.namespace.code) {
        acc[payload.namespace.code] = payload.id;
      }
      return acc;
    }, {});
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createGetIdentity = ({
    sendEdgeNetworkRequest,
    createIdentityRequestPayload,
    createIdentityRequest,
    globalConfigOverrides,
  }) => {
    return ({ namespaces, edgeConfigOverrides: localConfigOverrides } = {}) => {
      const requestParams = createRequestParams({
        payload: createIdentityRequestPayload(namespaces),
        globalConfigOverrides,
        localConfigOverrides,
      });
      const request = createIdentityRequest(requestParams);
      return sendEdgeNetworkRequest({
        request,
      });
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createIdentityRequest = ({ payload, datastreamIdOverride }) => {
    return createRequest({
      payload,
      datastreamIdOverride,
      getAction() {
        return "identity/acquire";
      },
      getUseSendBeacon() {
        return false;
      },
    });
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createIdentityRequestPayload = (namespaces) => {
    const content = {
      query: {
        identity: {
          fetch: namespaces,
        },
      },
    };
    return createRequestPayload({
      content,
      addIdentity: createAddIdentity(content),
      hasIdentity: createHasIdentity(content),
    });
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const URL_REGEX = /^([^?#]*)(\??[^#]*)(#?.*)$/;
  const getSeparator = (queryString) => {
    if (queryString === "") {
      return "?";
    }
    if (queryString === "?") {
      return "";
    }
    return "&";
  };
  var injectAppendIdentityToUrl =
    ({ dateProvider, orgId }) =>
    (ecid, url) => {
      const ts = Math.round(dateProvider().getTime() / 1000);
      const adobemc = encodeURIComponent(
        "TS=" + ts + "|MCMID=" + ecid + "|MCORGID=" + encodeURIComponent(orgId),
      );
      const [, location, queryString, fragment] = url.match(URL_REGEX);
      const separator = getSeparator(queryString);
      return (
        "" +
        location +
        queryString +
        separator +
        "adobe_mc=" +
        adobemc +
        fragment
      );
    };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Verifies user provided event options.
   * @param {*} options The user event options to validate
   * @returns {*} Validated options
   */

  const validator = boundObjectOf({
    namespaces: boundArrayOf(boundEnumOf(ecidNamespace, coreNamespace))
      .nonEmpty()
      .uniqueItems()
      .default([ecidNamespace]),
    edgeConfigOverrides: validateConfigOverride,
  })
    .noUnknownFields()
    .default({
      namespaces: [ecidNamespace],
    });
  var createGetIdentityOptionsValidator = ({ thirdPartyCookiesEnabled }) => {
    return (options) => {
      const validatedOptions = validator(options);
      if (
        !thirdPartyCookiesEnabled &&
        validatedOptions.namespaces.includes(coreNamespace)
      ) {
        throw new Error(
          "namespaces: The " +
            coreNamespace +
            " namespace cannot be requested when third-party cookies are disabled.",
        );
      }
      return validatedOptions;
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  /* eslint-disable no-bitwise */

  // #region decode protobuf

  /** Decoding bytes is not something commonly done in vanilla JavaScript work, and as such
   * this file will strive to explain each step of decoding a protobuf in detail.
   * It leans heavily on the protobuf documentation https://protobuf.dev/programming-guides/encoding/,
   * often quoting directly from it without citation.
   */

  /**
   * The kndctr cookie protobuf format
   * From https://git.corp.adobe.com/pages/experience-edge/konductor/#/api/identifying-visitors?id=device-identifiers
   * and https://git.corp.adobe.com/experience-edge/konductor/blob/master/feature-identity/src/main/kotlin/com/adobe/edge/features/identity/data/StoredIdentity.kt#L16

   * syntax = "proto3";
   *
   * // Device-level identity for Experience Edge
   * message Identity {
   *   // The Experience Cloud ID value
   *   string ecid = 1;
   *
   *   IdentityMetadata metadata = 10;
   *
   *   // Used only in the 3rd party domain context.
   *   // It stores the UNIX timestamp and some metadata about the last identity sync triggered by Experience Edge.
   *   int64 last_sync = 20;
   *   int64 sync_hash = 21;
   *   int32 id_sync_container_id = 22;
   *
   *   // UNIX timestamp when the Identity was last returned in a `state:store` instruction.
   *   // The Identity is written at most once every 24h with a large TTL, to ensure it does not expire.
   *   int64 write_time = 30;
   * }
   *
   * message IdentityMetadata {
   *   // UNIX timestamp when this identity was minted.
   *   int64 created_at = 1;
   *
   *   // Whether or not the identity is random (new) or based on an existing seed.
   *   bool is_new = 2;
   *
   *   // Type of device for which the identity was generated.
   *   // 0 = UNKNOWN, 1 = BROWSER, 2 = MOBILE
   *   int32 device_type = 3;
   *
   *   // The Experience Edge region in which the identity was minted.
   *   string region = 5;
   *
   *   // More details on the source of the ECID identity.
   *   // Invariant: when `is_new` = true, the source must be set to `RANDOM`.
   *   // 0 = RANDOM, 1 = THIRD_PARTY_ID, 2 = FIRST_PARTY_ID, 3 = RECEIVED_IN_REQUEST
   *   int32 source = 6;
   * }
   */

  const ECID_FIELD_NUMBER = 1;

  /**
   * Decodes a varint from a buffer starting at the given offset.
   *
   * Variable-width integers, or varints, are at the core of the wire format. They
   * allow encoding unsigned 64-bit integers using anywhere between one and ten
   * bytes, with small values using fewer bytes.
   *
   * Each byte in the varint has a continuation bit that indicates if the byte
   * that follows it is part of the varint. This is the most significant bit (MSB)
   * of the byte (sometimes also called the sign bit). The lower 7 bits are a
   * payload; the resulting integer is built by appending together the 7-bit
   * payloads of its constituent bytes.
   *
   * 10010110 00000001        // Original inputs.
   *  0010110  0000001        // Drop continuation bits.
   *  0000001  0010110        // Convert to big-endian.
   *    00000010010110        // Concatenate.
   *  128 + 16 + 4 + 2 = 150  // Interpret as an unsigned 64-bit integer.
   *
   * @example decodeVarint(new Uint8Array([0b0, 0b1]), 0) // { value: 1, length: 2 }
   * @example decodeVarint(new Uint8Array([0b10010110, 0b00000001], 0) // { value: 150, length: 2 })
   * @param {Uint8Array} buffer
   * @param {number} offset
   * @returns {{ value: number, length: number }} The value of the varint and the
   * number of bytes it takes up.
   */
  const decodeVarint = (buffer, offset) => {
    let value = 0;
    let length = 0;
    let byte;
    do {
      if (offset < 0 || offset + length >= buffer.length) {
        throw new Error("Invalid varint: buffer ended unexpectedly");
      }
      byte = buffer[offset + length];
      // Drop the continuation bit (the most significant bit), convert it from
      // little endian to big endian, and add it to the accumulator `value`.
      value |= (byte & 0b01111111) << (7 * length);
      // Increase the length of the varint by one byte.
      length += 1;
      // A varint can be at most 10 bytes long for a 64-bit integer.
      if (length > 10) {
        throw new Error("Invalid varint: too long");
      }
    } while (byte & 0b10000000);
    return {
      value,
      length,
    };
  };

  /**
   * | ID | Name   | Used for                                                 |
   * |----|--------|----------------------------------------------------------|
   * | 0  | varint | int32, int64, uint32, uint64, sint32, sint64, bool, enum |
   * | 1  | I64    | fixed64, sfixed64, double                                |
   * | 2  | LEN    | string, bytes                                            |
   * | 3  | SGROUP | group start (deprecated)                                 |
   * | 4  | EGROUP | group end (deprecated)                                   |
   * | 5  | I32    | fixed32, sfixed32, float                                 |
   */
  const WIRE_TYPES = Object.freeze({
    VARINT: 0,
    I64: 1,
    LEN: 2,
    SGROUP: 3,
    EGROUP: 4,
    I32: 5,
  });

  /**
   * Given a protobuf as a Uint8Array and based on the protobuf definition for the
   * kndctr cookie provided at https://git.corp.adobe.com/pages/experience-edge/konductor/#/api/identifying-visitors?id=device-identifiers,
   * this function should return the ECID as a string.
   * The decoding of the protobuf is hand-crafted in order to save on size
   * compared to the full protobuf.js library.
   * @param {Uint8Array} buffer
   * @returns {string}
   */
  const decodeKndctrProtobuf = (buffer) => {
    let offset = 0;
    let ecid = null;
    while (offset < buffer.length && !ecid) {
      // A protobuf message is a series of records. Each record is a tag, the length,
      // and the value.
      // A record always starts with the tag. The “tag” of a record is encoded as
      // a varint formed from the field number and the wire type via the formula
      // `(field_number << 3) | wire_type`. In other words, after decoding the
      // varint representing a field, the low 3 bits tell us the wire type, and the rest of the integer tells us the field number.
      // So the first step is to decode the varint
      const { value: tag, length: tagLength } = decodeVarint(buffer, offset);
      offset += tagLength;
      // Next, we get the wire type and the field number.
      // You take the last three bits to get the wire type and then right-shift by
      // three to get the field number.
      const wireType = tag & 0b111;
      const fieldNumber = tag >> 3;
      // We only care about the ECID field, so we will skip any other fields until
      // we find it.
      if (fieldNumber === ECID_FIELD_NUMBER) {
        // The wire type for the ECID field is 2, which means it is a length-delimited field.
        if (wireType === WIRE_TYPES.LEN) {
          // The next varint will tell us the length of the ECID.
          const fieldValueLength = decodeVarint(buffer, offset);
          offset += fieldValueLength.length;
          // The ECID is a UTF-8 encoded string, so we will decode it as such.
          ecid = new TextDecoder().decode(
            buffer.slice(offset, offset + fieldValueLength.value),
          );
          offset += fieldValueLength.value;
          return ecid;
        }
      } else {
        // If we don't care about the field, we skip it.
        // The wire type tells us how to skip the field.
        switch (wireType) {
          case WIRE_TYPES.VARINT:
            // Skip the varint
            offset += decodeVarint(buffer, offset).length;
            break;
          case WIRE_TYPES.I64:
            // Skip the 64-bit integer
            offset += 8;
            break;
          case WIRE_TYPES.LEN: {
            // Find the value that represents the length of the vield
            const fieldValueLength = decodeVarint(buffer, offset);
            offset += fieldValueLength.length + fieldValueLength.value;
            break;
          }
          case WIRE_TYPES.SGROUP:
            // Skip the start group
            break;
          case WIRE_TYPES.EGROUP:
            // Skip the end group
            break;
          case WIRE_TYPES.I32:
            // Skip the 32-bit integer
            offset += 4;
            break;
          default:
            throw new Error(
              "Malformed kndctr cookie. Unknown wire type: " + wireType,
            );
        }
      }
    }

    // No ECID was found. Maybe the cookie is malformed, maybe the format was changed.
    throw new Error("No ECID found in cookie.");
  };

  /**
   * takes a base64 string of bytes and returns a Uint8Array
   * @param {string} base64
   * @returns {Uint8Array}
   */
  const base64ToBytes = (base64) => {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
  };
  // #endregion

  // #region decode cookie
  var createGetEcidFromCookie = ({ orgId, cookieJar, logger }) => {
    const kndctrCookieName = getNamespacedCookieName(orgId, "identity");
    /**
     * Returns the ECID from the kndctr cookie.
     * @returns {string|null}
     */
    return () => {
      const cookie = cookieJar.get(kndctrCookieName);
      if (!cookie) {
        return null;
      }
      try {
        const decodedCookie = decodeURIComponent(cookie)
          .replace(/_/g, "/")
          .replace(/-/g, "+");
        // cookie is a base64 encoded byte representation of a Identity protobuf message
        // and we need to get it to a Uint8Array in order to decode it

        const cookieBytes = base64ToBytes(decodedCookie);
        return decodeKndctrProtobuf(cookieBytes);
      } catch (error) {
        logger.warn(
          "Unable to decode ECID from " + kndctrCookieName + " cookie",
          error,
        );
        return null;
      }
    };
  };
  // #endregion

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

  const createIdentity = ({
    config,
    logger,
    consent,
    fireReferrerHideableImage,
    sendEdgeNetworkRequest,
    apexDomain,
    getBrowser,
  }) => {
    const {
      orgId,
      thirdPartyCookiesEnabled,
      edgeConfigOverrides: globalConfigOverrides,
    } = config;
    const getEcidFromVisitor = injectGetEcidFromVisitor({
      logger,
      orgId,
      awaitVisitorOptIn,
    });
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar,
    });
    const legacyIdentity = createLegacyIdentity({
      config,
      getEcidFromVisitor,
      apexDomain,
      cookieJar: loggingCookieJar,
      isPageSsl: window.location.protocol === "https:",
    });
    const doesIdentityCookieExist = injectDoesIdentityCookieExist({
      orgId,
    });
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
      globalConfigOverrides,
    });
    const areThirdPartyCookiesSupportedByDefault =
      injectAreThirdPartyCookiesSupportedByDefault({
        getBrowser,
      });
    const setDomainForInitialIdentityPayload =
      injectSetDomainForInitialIdentityPayload({
        thirdPartyCookiesEnabled,
        areThirdPartyCookiesSupportedByDefault,
      });
    const addLegacyEcidToPayload = injectAddLegacyEcidToPayload({
      getLegacyEcid: legacyIdentity.getEcid,
      addEcidToPayload,
    });
    const addQueryStringIdentityToPayload =
      injectAddQueryStringIdentityToPayload({
        locationSearch: window.document.location.search,
        dateProvider: () => new Date(),
        orgId,
        logger,
      });
    const awaitIdentityCookie = injectAwaitIdentityCookie({
      doesIdentityCookieExist,
      orgId,
      logger,
    });
    const ensureSingleIdentity = injectEnsureSingleIdentity({
      doesIdentityCookieExist,
      setDomainForInitialIdentityPayload,
      addLegacyEcidToPayload,
      awaitIdentityCookie,
      logger,
    });
    const processIdSyncs = injectProcessIdSyncs({
      fireReferrerHideableImage,
      logger,
    });
    const handleResponseForIdSyncs = injectHandleResponseForIdSyncs({
      processIdSyncs,
    });
    const appendIdentityToUrl = injectAppendIdentityToUrl({
      dateProvider: () => new Date(),
      orgId,
    });
    const getIdentityOptionsValidator = createGetIdentityOptionsValidator({
      thirdPartyCookiesEnabled,
    });
    const addEcidQueryToPayload = injectAddEcidQueryToPayload({
      thirdPartyCookiesEnabled,
      areThirdPartyCookiesSupportedByDefault,
    });
    const decodeKndctrCookie = createGetEcidFromCookie({
      orgId,
      cookieJar: loggingCookieJar,
      logger,
    });
    return createComponent$4({
      addEcidQueryToPayload,
      addQueryStringIdentityToPayload,
      ensureSingleIdentity,
      setLegacyEcid: legacyIdentity.setEcid,
      handleResponseForIdSyncs,
      getNamespacesFromResponse,
      getIdentity,
      consent,
      appendIdentityToUrl,
      logger,
      getIdentityOptionsValidator,
      decodeKndctrCookie,
    });
  };
  createIdentity.namespace = "Identity";
  createIdentity.configValidators = configValidators$3;

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

  const prepareLibraryInfo = ({ config, componentRegistry }) => {
    const allCommands = [
      ...componentRegistry.getCommandNames(),
      CONFIGURE,
      SET_DEBUG,
    ].sort();
    const resultConfig = {
      ...config,
    };
    Object.keys(config).forEach((key) => {
      const value = config[key];
      if (typeof value !== "function") {
        return;
      }
      resultConfig[key] = value.toString();
    });
    const components = componentRegistry.getComponentNames();
    return {
      version: libraryVersion,
      configs: resultConfig,
      commands: allCommands,
      components,
    };
  };
  const createLibraryInfo = ({ config, componentRegistry }) => {
    return {
      commands: {
        getLibraryInfo: {
          run: () => {
            return {
              libraryInfo: prepareLibraryInfo({
                config,
                componentRegistry,
              }),
            };
          },
        },
      },
    };
  };
  createLibraryInfo.namespace = "LibraryInfo";

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

  var requiredComponents = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    context: createContext$1,
    dataCollector: createDataCollector,
    identity: createIdentity,
    libraryInfo: createLibraryInfo,
  });

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

  const createNamespacedStorage = injectStorage(window);
  const { console, fetch, navigator: navigator$1 } = window;
  const coreConfigValidators = createCoreConfigs();
  const apexDomain = getApexDomain(window, cookieJar);
  const sendFetchRequest = injectSendFetchRequest({
    fetch,
  });
  const fireReferrerHideableImage = injectFireReferrerHideableImage();
  const getAssuranceValidationTokenParams =
    createGetAssuranceValidationTokenParams({
      window,
      createNamespacedStorage,
    });
  const getBrowser = injectGetBrowser({
    userAgent: window.navigator.userAgent,
  });
  const createExecuteCommand = ({
    instanceName,
    logController: { setDebugEnabled, logger, createComponentLogger },
    components,
  }) => {
    const componentRegistry = createComponentRegistry();
    const lifecycle = createLifecycle(componentRegistry);
    const componentCreators = components.concat(
      Object.values(requiredComponents),
    );
    const setDebugCommand = (options) => {
      setDebugEnabled(options.enabled, {
        fromConfig: false,
      });
    };
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar,
    });
    const configureCommand = (options) => {
      const config = buildAndValidateConfig({
        options,
        componentCreators,
        coreConfigValidators,
        createConfig,
        logger,
        setDebugEnabled,
      });
      const { orgId, targetMigrationEnabled } = config;
      const shouldTransferCookie = injectShouldTransferCookie({
        orgId,
        targetMigrationEnabled,
      });
      const cookieTransfer = createCookieTransfer({
        cookieJar: loggingCookieJar,
        shouldTransferCookie,
        apexDomain,
        dateProvider: () => new Date(),
      });
      const sendBeaconRequest = isFunction(navigator$1.sendBeacon)
        ? injectSendBeaconRequest({
            // Without the bind(), the browser will complain about an
            // illegal invocation.
            sendBeacon: navigator$1.sendBeacon.bind(navigator$1),
            sendFetchRequest,
            logger,
          })
        : sendFetchRequest;
      const sendNetworkRequest = injectSendNetworkRequest({
        logger,
        sendFetchRequest,
        sendBeaconRequest,
        isRequestRetryable,
        getRequestRetryDelay,
      });
      const processWarningsAndErrors = injectProcessWarningsAndErrors({
        logger,
      });
      const extractEdgeInfo = injectExtractEdgeInfo({
        logger,
      });
      const createResponse = injectCreateResponse({
        extractEdgeInfo,
      });
      const getLocationHint = injectGetLocationHint({
        orgId,
        cookieJar,
      });
      const sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
        config,
        lifecycle,
        cookieTransfer,
        sendNetworkRequest,
        createResponse,
        processWarningsAndErrors,
        getLocationHint,
        getAssuranceValidationTokenParams,
      });
      const applyResponse = injectApplyResponse({
        lifecycle,
        cookieTransfer,
        createResponse,
        processWarningsAndErrors,
      });
      const generalConsentState = createConsentStateMachine({
        logger,
      });
      const consent = createConsent$1({
        generalConsentState,
        logger,
      });
      const eventManager = createEventManager({
        config,
        logger,
        lifecycle,
        consent,
        createEvent,
        createDataCollectionRequestPayload,
        createDataCollectionRequest,
        sendEdgeNetworkRequest,
        applyResponse,
      });
      return initializeComponents({
        componentCreators,
        lifecycle,
        componentRegistry,
        getImmediatelyAvailableTools(componentName) {
          const componentLogger = createComponentLogger(componentName);
          return {
            config,
            componentRegistry,
            consent,
            eventManager,
            fireReferrerHideableImage,
            logger: componentLogger,
            lifecycle,
            sendEdgeNetworkRequest,
            handleError: injectHandleError({
              errorPrefix: "[" + instanceName + "] [" + componentName + "]",
              logger: componentLogger,
            }),
            createNamespacedStorage,
            apexDomain,
            getBrowser,
          };
        },
      });
    };
    const handleError = injectHandleError({
      errorPrefix: "[" + instanceName + "]",
      logger,
    });
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      setDebugCommand,
      handleError,
      validateCommandOptions,
    });
    return executeCommand;
  };
  var core = ({ components }) => {
    // eslint-disable-next-line no-underscore-dangle
    const instanceNames = window.__alloyNS;
    if (instanceNames) {
      instanceNames.forEach((instanceName) => {
        const logController = createLogController({
          console,
          locationSearch: window.location.search,
          createLogger,
          instanceName,
          createNamespacedStorage,
          getMonitors,
        });
        const executeCommand = createExecuteCommand({
          instanceName,
          logController,
          components,
        });
        const instance = createInstanceFunction(executeCommand);
        const queue = window[instanceName].q;
        queue.push = instance;
        logController.logger.logOnInstanceCreated({
          instance,
        });
        queue.forEach(instance);
      });
    }
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const createClickHandler = ({ eventManager, lifecycle, handleError }) => {
    return (clickEvent) => {
      // Ignore repropagated clicks from AppMeasurement
      if (clickEvent.s_fe) {
        return Promise.resolve();
      }
      // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
      const clickedElement =
        "composedPath" in clickEvent && clickEvent.composedPath().length > 0
          ? clickEvent.composedPath()[0]
          : clickEvent.target;
      const event = eventManager.createEvent();
      // this is to make sure a exit link personalization metric use send beacon
      event.documentMayUnload();
      return (
        lifecycle
          .onClick({
            event,
            clickedElement,
          })
          .then(() => {
            if (event.isEmpty()) {
              return Promise.resolve();
            }
            return eventManager.sendEvent(event);
          })
          // eventManager.sendEvent() will return a promise resolved to an
          // object and we want to avoid returning any value to the customer
          .then(noop)
          .catch((error) => {
            handleError(error, "click collection");
          })
      );
    };
  };
  var attachClickActivityCollector = ({
    eventManager,
    lifecycle,
    handleError,
  }) => {
    const clickHandler = createClickHandler({
      eventManager,
      lifecycle,
      handleError,
    });
    document.addEventListener("click", clickHandler, true);
  };

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

  const DEFAULT_DOWNLOAD_QUALIFIER =
    "\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$";
  const downloadLinkQualifier = boundString()
    .regexp()
    .default(DEFAULT_DOWNLOAD_QUALIFIER);
  const validators = boundObjectOf({
    clickCollectionEnabled: boundBoolean().default(true),
    clickCollection: boundObjectOf({
      internalLinkEnabled: boundBoolean().default(true),
      externalLinkEnabled: boundBoolean().default(true),
      downloadLinkEnabled: boundBoolean().default(true),
      // TODO: Consider moving downloadLinkQualifier here.
      sessionStorageEnabled: boundBoolean().default(false),
      eventGroupingEnabled: boundBoolean().default(false),
      filterClickProperties: boundCallback(),
    }).default({
      internalLinkEnabled: true,
      externalLinkEnabled: true,
      downloadLinkEnabled: true,
      sessionStorageEnabled: false,
      eventGroupingEnabled: false,
    }),
    downloadLinkQualifier,
    onBeforeLinkClickSend: boundCallback().deprecated(
      'The field "onBeforeLinkClickSend" has been deprecated. Use "clickCollection.filterClickDetails" instead.',
    ),
  });

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const ACTIVITY_MAP_EXTENSION_ID = "cppXYctnr";
  var activityMapExtensionEnabled = (context = document) =>
    context.getElementById(ACTIVITY_MAP_EXTENSION_ID) !== null;

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var extractDomain = (uri) => {
    let fullUrl = uri;
    if (!/^https?:\/\//i.test(fullUrl)) {
      fullUrl = window.location.protocol + "//" + uri;
    }
    const url = new URL(fullUrl);
    return url.hostname;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isDifferentDomains = (uri1, uri2) => {
    const domain1 = extractDomain(uri1);
    const domain2 = extractDomain(uri2);
    return domain1 !== domain2;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const isDissallowedLinkType = (clickCollection, linkType) => {
    return (
      linkType &&
      ((linkType === "download" && !clickCollection.downloadLinkEnabled) ||
        (linkType === "exit" && !clickCollection.externalLinkEnabled) ||
        (linkType === "other" && !clickCollection.internalLinkEnabled))
    );
  };
  var createInjectClickedElementProperties = ({
    config,
    logger,
    getClickedElementProperties,
    clickActivityStorage,
  }) => {
    const { clickCollectionEnabled, clickCollection } = config;
    if (!clickCollectionEnabled) {
      return () => undefined;
    }
    return ({ event, clickedElement }) => {
      const elementProperties = getClickedElementProperties({
        clickActivityStorage,
        clickedElement,
        config,
        logger,
      });
      const linkType = elementProperties.linkType;
      // Avoid clicks to be collected for the ActivityMap interface
      if (activityMapExtensionEnabled()) {
        return;
      }
      if (
        elementProperties.isValidLink() &&
        isDissallowedLinkType(clickCollection, linkType)
      ) {
        logger.info(
          "Cancelling link click event due to clickCollection." +
            linkType +
            "LinkEnabled = false.",
        );
      } else if (
        // Determine if element properties should be sent with event now, or be saved
        // and grouped with a future page view event.
        // Event grouping is not supported for the deprecated onBeforeLinkClickSend callback
        // because only click properties is saved and not XDM and DATA (which could have been modified).
        // However, if the filterClickDetails callback is available we group events because it takes
        // priority over onBeforeLinkClickSend and only supports processing click properties.
        elementProperties.isInternalLink() &&
        clickCollection.eventGroupingEnabled &&
        (!config.onBeforeLinkClickSend || clickCollection.filterClickDetails) &&
        !isDifferentDomains(window.location.hostname, elementProperties.linkUrl)
      ) {
        clickActivityStorage.save(elementProperties.properties);
      } else if (elementProperties.isValidLink()) {
        // Event will be sent
        event.mergeXdm(elementProperties.xdm);
        event.mergeData(elementProperties.data);
        clickActivityStorage.save({
          pageName: elementProperties.pageName,
          pageIDType: elementProperties.pageIDType,
        });
      } else if (elementProperties.isValidActivityMapData()) {
        clickActivityStorage.save(elementProperties.properties);
      }
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const buildXdmFromClickedElementProperties = (props) => {
    return {
      eventType: "web.webinteraction.linkClicks",
      web: {
        webInteraction: {
          name: props.linkName,
          region: props.linkRegion,
          type: props.linkType,
          URL: props.linkUrl,
          linkClicks: {
            value: 1,
          },
        },
      },
    };
  };
  const buildDataFromClickedElementProperties = (props) => {
    return {
      __adobe: {
        analytics: {
          contextData: {
            a: {
              activitymap: {
                page: props.pageName,
                link: props.linkName,
                region: props.linkRegion,
                pageIDType: props.pageIDType,
              },
            },
          },
        },
      },
    };
  };
  const populateClickedElementPropertiesFromOptions = (options, props) => {
    const { xdm, data, clickedElement } = options;
    props.clickedElement = clickedElement;
    if (xdm && xdm.web && xdm.web.webInteraction) {
      const { name, region, type, URL } = xdm.web.webInteraction;
      props.linkName = name;
      props.linkRegion = region;
      props.linkType = type;
      props.linkUrl = URL;
    }
    // DATA has priority over XDM
    /* eslint no-underscore-dangle: 0 */
    if (data && data.__adobe && data.__adobe.analytics) {
      const { contextData } = data.__adobe.analytics;
      if (contextData && contextData.a && contextData.a.activitymap) {
        // Set the properties if they exists
        const { page, link, region, pageIDType } = contextData.a.activitymap;
        props.pageName = page || props.pageName;
        props.linkName = link || props.linkName;
        props.linkRegion = region || props.linkRegion;
        if (pageIDType !== undefined) {
          props.pageIDType = pageIDType;
        }
      }
    }
  };
  var createClickedElementProperties = ({ properties, logger } = {}) => {
    let props = properties || {};
    const clickedElementProperties = {
      get pageName() {
        return props.pageName;
      },
      set pageName(value) {
        props.pageName = value;
      },
      get linkName() {
        return props.linkName;
      },
      set linkName(value) {
        props.linkName = value;
      },
      get linkRegion() {
        return props.linkRegion;
      },
      set linkRegion(value) {
        props.linkRegion = value;
      },
      get linkType() {
        return props.linkType;
      },
      set linkType(value) {
        props.linkType = value;
      },
      get linkUrl() {
        return props.linkUrl;
      },
      set linkUrl(value) {
        props.linkUrl = value;
      },
      get pageIDType() {
        return props.pageIDType;
      },
      set pageIDType(value) {
        props.pageIDType = value;
      },
      get clickedElement() {
        return props.clickedElement;
      },
      set clickedElement(value) {
        props.clickedElement = value;
      },
      get properties() {
        return {
          pageName: props.pageName,
          linkName: props.linkName,
          linkRegion: props.linkRegion,
          linkType: props.linkType,
          linkUrl: props.linkUrl,
          pageIDType: props.pageIDType,
        };
      },
      isValidLink() {
        return (
          !!props.linkUrl &&
          !!props.linkType &&
          !!props.linkName &&
          !!props.linkRegion
        );
      },
      isInternalLink() {
        return this.isValidLink() && props.linkType === "other";
      },
      isValidActivityMapData() {
        return (
          !!props.pageName &&
          !!props.linkName &&
          !!props.linkRegion &&
          props.pageIDType !== undefined
        );
      },
      get xdm() {
        if (props.filteredXdm) {
          return props.filteredXdm;
        }
        return buildXdmFromClickedElementProperties(this);
      },
      get data() {
        if (props.filteredData) {
          return props.filteredData;
        }
        return buildDataFromClickedElementProperties(this);
      },
      applyPropertyFilter(filter) {
        if (filter && filter(props) === false) {
          if (logger) {
            logger.info(
              "Clicked element properties were rejected by filter function: " +
                JSON.stringify(this.properties, null, 2),
            );
          }
          props = {};
        }
      },
      applyOptionsFilter(filter) {
        const opts = this.options;
        if (opts && opts.clickedElement && (opts.xdm || opts.data)) {
          // Properties are rejected if filter is explicitly false.
          if (filter && filter(opts) === false) {
            if (logger) {
              logger.info(
                "Clicked element properties were rejected by filter function: " +
                  JSON.stringify(this.properties, null, 2),
              );
            }
            this.options = undefined;
            return;
          }
          this.options = opts;
          // This is just to ensure that any fields outside clicked element properties
          // set by the user filter persists.
          props.filteredXdm = opts.xdm;
          props.filteredData = opts.data;
        }
      },
      get options() {
        const opts = {};
        if (this.isValidLink()) {
          opts.xdm = this.xdm;
        }
        if (this.isValidActivityMapData()) {
          opts.data = this.data;
        }
        if (this.clickedElement) {
          opts.clickedElement = this.clickedElement;
        }
        if (!opts.xdm && !opts.data) {
          return undefined;
        }
        return opts;
      },
      set options(value) {
        props = {};
        if (value) {
          populateClickedElementPropertiesFromOptions(value, props);
        }
      },
    };
    return clickedElementProperties;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createRecallAndInjectClickedElementProperties = ({
    clickActivityStorage,
  }) => {
    return (event) => {
      // Avoid clicks to be collected for the ActivityMap interface
      if (activityMapExtensionEnabled()) {
        return;
      }
      const properties = clickActivityStorage.load();
      const elementProperties = createClickedElementProperties({
        properties,
      });
      if (
        elementProperties.isValidLink() ||
        elementProperties.isValidActivityMapData()
      ) {
        if (elementProperties.isValidLink()) {
          const xdm = elementProperties.xdm;
          // Have to delete the eventType not to override the page view
          delete xdm.eventType;
          event.mergeXdm(xdm);
        }
        if (elementProperties.isValidActivityMapData()) {
          event.mergeData(elementProperties.data);
        }
        // NOTE: We can't clear out all the storage here because we might still need to
        // keep a page-name for multiple link-clicks (e.g. downloads) on the same page.
        clickActivityStorage.save({
          pageName: elementProperties.pageName,
          pageIDType: elementProperties.pageIDType,
        });
      }
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createGetClickedElementProperties = ({
    window,
    getLinkName,
    getLinkRegion,
    getAbsoluteUrlFromAnchorElement,
    findClickableElement,
    determineLinkType,
  }) => {
    return ({ clickedElement, config, logger, clickActivityStorage }) => {
      const {
        onBeforeLinkClickSend: optionsFilter,
        // Deprecated
        clickCollection,
      } = config;
      const { filterClickDetails: propertyFilter } = clickCollection;
      const elementProperties = createClickedElementProperties({
        logger,
      });
      if (clickedElement) {
        const clickableElement = findClickableElement(clickedElement);
        if (clickableElement) {
          elementProperties.clickedElement = clickedElement;
          elementProperties.linkUrl = getAbsoluteUrlFromAnchorElement(
            window,
            clickableElement,
          );
          elementProperties.linkType = determineLinkType(
            window,
            config,
            elementProperties.linkUrl,
            clickableElement,
          );
          elementProperties.linkRegion = getLinkRegion(clickableElement);
          elementProperties.linkName = getLinkName(clickableElement);
          elementProperties.pageIDType = 0;
          elementProperties.pageName = window.location.href;
          // Check if we have a page-name stored from an earlier page view event
          const storedLinkData = clickActivityStorage.load();
          if (storedLinkData && storedLinkData.pageName) {
            elementProperties.pageName = storedLinkData.pageName;
            // Perhaps pageIDType should be established after customer filter is applied
            // Like if pageName starts with "http" then pageIDType = 0
            elementProperties.pageIDType = 1;
          }
          // If defined, run user provided filter function
          if (propertyFilter) {
            // clickCollection.filterClickDetails
            elementProperties.applyPropertyFilter(propertyFilter);
          } else if (optionsFilter) {
            // onBeforeLinkClickSend
            elementProperties.applyOptionsFilter(optionsFilter);
          }
        }
      }
      return elementProperties;
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const CLICK_ACTIVITY_DATA = "clickData";

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createClickActivityStorage = ({ storage }) => {
    return {
      save: (data) => {
        const jsonData = JSON.stringify(data);
        storage.setItem(CLICK_ACTIVITY_DATA, jsonData);
      },
      load: () => {
        let jsonData = null;
        const data = storage.getItem(CLICK_ACTIVITY_DATA);
        if (data) {
          jsonData = JSON.parse(data);
        }
        return jsonData;
      },
      remove: () => {
        storage.removeItem(CLICK_ACTIVITY_DATA);
      },
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createStorePageViewProperties = ({ clickActivityStorage }) => {
    return (event) => {
      clickActivityStorage.save({
        pageName: event.getContent().xdm.web.webPageDetails.name,
        pageIDType: 1, // 1 = name, 0 = URL
      });
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  // src/components/ActivityCollector/validateClickCollectionConfig.js
  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var validateClickCollectionConfig = (config, logger) => {
    const {
      clickCollectionEnabled,
      onBeforeLinkClickSend,
      downloadLinkQualifier: dlq,
    } = config;
    if (clickCollectionEnabled === false) {
      if (onBeforeLinkClickSend) {
        logger.warn(
          "The 'onBeforeLinkClickSend' configuration was provided but will be ignored because clickCollectionEnabled is false.",
        );
      }
      if (dlq && dlq !== DEFAULT_DOWNLOAD_QUALIFIER) {
        logger.warn(
          "The 'downloadLinkQualifier' configuration was provided but will be ignored because clickCollectionEnabled is false.",
        );
      }
    }
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Reduces repeated whitespace within a string. Whitespace surrounding the string
   * is trimmed and any occurrence of whitespace within the string is replaced with
   * a single space.
   * @param {string} str String to be formatted.
   * @returns {string} Formatted string.
   */
  var truncateWhiteSpace = (str) => {
    return str && str.replace(/\s+/g, " ").trim();
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const unsupportedNodeNames =
    /^(SCRIPT|STYLE|LINK|CANVAS|NOSCRIPT|#COMMENT)$/i;

  /**
   * Determines if a node qualifies as a supported link text node.
   * @param {*} node Node to determine support for.
   * @returns {boolean}
   */
  var isSupportedTextNode = (node) => {
    if (node && node.nodeName) {
      if (node.nodeName.match(unsupportedNodeNames)) {
        return false;
      }
    }
    return true;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Orders and returns specified node and its child nodes in arrays of supported
   * and unsupported nodes.
   * @param {*} node The node to extract supported and unsupported nodes from.
   * @returns {{supportedNodes: Array, includesUnsupportedNodes: boolean}} Node support object.
   */
  const extractSupportedNodes = (node) => {
    let supportedNodes = [];
    let includesUnsupportedNodes = false;
    if (isSupportedTextNode(node)) {
      supportedNodes.push(node);
      if (node.childNodes) {
        const childNodes = Array.prototype.slice.call(node.childNodes);
        childNodes.forEach((childNode) => {
          const nodes = extractSupportedNodes(childNode);
          supportedNodes = supportedNodes.concat(nodes.supportedNodes);
          includesUnsupportedNodes =
            includesUnsupportedNodes || nodes.includesUnsupportedNodes;
        });
      }
    } else {
      includesUnsupportedNodes = true;
    }
    return {
      supportedNodes,
      includesUnsupportedNodes,
    };
  };

  /**
   * Returns the value of a node attribute.
   * @param {*} node The node holding the attribute.
   * @param {string} attributeName The name of the attribute.
   * @param {string} nodeName Optional node name constraint.
   * @returns {string} Attribute value or undefined.
   */
  const getNodeAttributeValue = (node, attributeName, nodeName) => {
    let attributeValue;
    if (!nodeName || nodeName === node.nodeName.toUpperCase()) {
      attributeValue = node.getAttribute(attributeName);
    }
    return attributeValue;
  };

  /**
   * Extracts the children supported nodes attributes map
   * @param {*} nodes The nodes array holding the children nodes.
   * The returned map contains the supported not empty children attributes values.
   * */
  const getChildrenAttributes = (nodes) => {
    const attributes = {
      texts: [],
    };
    nodes.supportedNodes.forEach((supportedNode) => {
      if (supportedNode.getAttribute) {
        if (!attributes.alt) {
          attributes.alt = truncateWhiteSpace(
            supportedNode.getAttribute("alt"),
          );
        }
        if (!attributes.title) {
          attributes.title = truncateWhiteSpace(
            supportedNode.getAttribute("title"),
          );
        }
        if (!attributes.inputValue) {
          attributes.inputValue = truncateWhiteSpace(
            getNodeAttributeValue(supportedNode, "value", "INPUT"),
          );
        }
        if (!attributes.imgSrc) {
          attributes.imgSrc = truncateWhiteSpace(
            getNodeAttributeValue(supportedNode, "src", "IMG"),
          );
        }
      }
      if (supportedNode.nodeValue) {
        attributes.texts.push(supportedNode.nodeValue);
      }
    });
    return attributes;
  };

  /**
   * Extracts a link-name from a given node.
   *
   * The returned link-name is set to one of the following (in order of priority):
   *
   * 1. Clicked node innerText
   * 2. Clicked node textContent
   * 3. Clicked node and its child nodes nodeValue appended together.
   * 4. Clicked node alt attribute or node descendant alt attribute.
   *    Whichever is found first.
   * 5. Clicked node text attribute or node descendant text attribute.
   *    Whichever is found first.
   * 6. Clicked node INPUT descendant value attribute.
   *    Whichever is found first.
   * 7. Clicked node IMG descendant src attribute.
   *    Whichever is found first.
   *
   * @param {*} node The node to find link text for.
   * @returns {string} link-name or an empty string if not link-name is found.
   */
  var getLinkName = (node) => {
    let nodeText = truncateWhiteSpace(node.innerText || node.textContent);
    const nodes = extractSupportedNodes(node);
    // if contains unsupported nodes we want children node attributes
    if (!nodeText || nodes.includesUnsupportedNodes) {
      const attributesMap = getChildrenAttributes(nodes);
      nodeText = truncateWhiteSpace(attributesMap.texts.join(""));
      if (!nodeText) {
        nodeText =
          attributesMap.alt ||
          attributesMap.title ||
          attributesMap.inputValue ||
          attributesMap.imgSrc;
      }
    }
    return nodeText || "";
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const semanticElements = /^(HEADER|MAIN|FOOTER|NAV)$/i;
  const getAriaRegionLabel = (node) => {
    let regionLabel;
    if (node.role === "region" && isNonEmptyString(node["aria-label"])) {
      regionLabel = node["aria-label"];
    }
    return regionLabel;
  };
  const getSectionNodeName = (node) => {
    let nodeName;
    if (node && node.nodeName) {
      if (node.nodeName.match(semanticElements)) {
        nodeName = node.nodeName;
      }
    }
    return nodeName;
  };

  /**
   * Extracts a node link-region.
   *
   * The link-region is determined by traversing up the DOM
   * looking for a region that is determined in order of priority:
   *
   * 1. element.id
   * 2. Aria region label
   * 3. Semantic element name
   * 4. BODY (if no other link-region is found).
   *
   * @param {*} node The node to find link region for.
   * @returns {string} link-region.
   */
  var getLinkRegion = (node) => {
    let linkParentNode = node.parentNode;
    let regionName;
    while (linkParentNode) {
      regionName = truncateWhiteSpace(
        linkParentNode.id ||
          getAriaRegionLabel(linkParentNode) ||
          getSectionNodeName(linkParentNode),
      );
      if (regionName) {
        return regionName;
      }
      linkParentNode = linkParentNode.parentNode;
    }
    return "BODY";
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var getAbsoluteUrlFromAnchorElement = (window, element) => {
    const base = window.location.href;
    let href = element.href || "";
    // Some objects (like SVG animations) can contain a href object instead of a string
    if (typeof href !== "string") {
      href = "";
    }
    try {
      return new URL(href, base).href;
    } catch {
      return base;
    }
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isSupportedAnchorElement = (element) => {
    if (
      element.href &&
      (element.tagName === "A" || element.tagName === "AREA") &&
      (!element.onclick ||
        !element.protocol ||
        element.protocol.toLowerCase().indexOf("javascript") < 0)
    ) {
      return true;
    }
    return false;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var elementHasClickHandler = (element) => {
    return !element ? false : !!element.onclick;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isInputSubmitElement = (element) => {
    if (element.tagName === "INPUT") {
      const type = element.getAttribute("type");
      if (type === "submit") {
        return true;
      }
      // Image type input elements are considered submit elements.
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/image
      if (type === "image" && element.src) {
        return true;
      }
    }
    return false;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isButtonSubmitElement = (element) => {
    return element.tagName === "BUTTON" && element.type === "submit";
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var findClickableElement = (element) => {
    let node = element;
    while (node) {
      if (
        isSupportedAnchorElement(node) ||
        elementHasClickHandler(node) ||
        isInputSubmitElement(node) ||
        isButtonSubmitElement(node)
      ) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Trims the query from the URL.
   * @param {string} url
   * @returns {string}
   */
  var trimQueryFromUrl = (url) => {
    const questionMarkIndex = url.indexOf("?");
    const hashIndex = url.indexOf("#");
    if (
      questionMarkIndex >= 0 &&
      (questionMarkIndex < hashIndex || hashIndex < 0)
    ) {
      return url.substring(0, questionMarkIndex);
    }
    if (hashIndex >= 0) {
      return url.substring(0, hashIndex);
    }
    return url;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isDownloadLink = (downloadLinkQualifier, linkUrl, clickedObj) => {
    let result = false;
    if (linkUrl) {
      if (clickedObj && clickedObj.download) {
        result = true;
      } else if (downloadLinkQualifier) {
        const re = new RegExp(downloadLinkQualifier);
        const trimmedLinkUrl = trimQueryFromUrl(linkUrl).toLowerCase();
        result = re.test(trimmedLinkUrl);
      }
    }
    return result;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var isExitLink = (window, linkUrl) => {
    let result = false;
    // window.location.hostname should always be defined, but checking just in case
    if (linkUrl && window.location.hostname) {
      const currentHostname = window.location.hostname.toLowerCase();
      const trimmedLinkUrl = trimQueryFromUrl(linkUrl).toLowerCase();
      result = trimmedLinkUrl.indexOf(currentHostname) < 0;
    }
    return result;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var determineLinkType = (window, config, linkUrl, clickedObj) => {
    let linkType = "other";
    if (isNonEmptyString(linkUrl)) {
      if (isDownloadLink(config.downloadLinkQualifier, linkUrl, clickedObj)) {
        linkType = "download";
      } else if (isExitLink(window, linkUrl)) {
        linkType = "exit";
      }
    }
    return linkType;
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var hasPageName = (event) => {
    const content = event.getContent();
    return (
      content.xdm !== undefined &&
      // NOTE: A page view event should "ideally" include the pageViews type
      // && event.xdm.eventType === "web.webpagedetails.pageViews"
      content.xdm.web !== undefined &&
      content.xdm.web.webPageDetails !== undefined &&
      content.xdm.web.webPageDetails.name !== undefined
    );
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createTransientStorage = () => {
    const storage = {};
    return {
      getItem: (key) => {
        return storage[key];
      },
      setItem: (key, value) => {
        storage[key] = value;
      },
      removeItem: (key) => {
        delete storage[key];
      },
    };
  };

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

  const getClickedElementProperties = createGetClickedElementProperties({
    window,
    getLinkName,
    getLinkRegion,
    getAbsoluteUrlFromAnchorElement,
    findClickableElement,
    determineLinkType,
  });
  let clickActivityStorage;
  const initClickActivityStorage = (config) => {
    if (!clickActivityStorage) {
      const createNamespacedStorage = injectStorage(window);
      const nameSpacedStorage = createNamespacedStorage(config.orgId || "");
      // Use transient in-memory if sessionStorage is disabled
      const transientStorage = createTransientStorage();
      const storage = config.clickCollection.sessionStorageEnabled
        ? nameSpacedStorage.session
        : transientStorage;
      clickActivityStorage = createClickActivityStorage({
        storage,
      });
    }
  };
  const createActivityCollector = ({
    config,
    eventManager,
    handleError,
    logger,
  }) => {
    validateClickCollectionConfig(config, logger);
    const clickCollection = config.clickCollection;
    if (!clickActivityStorage) {
      initClickActivityStorage(config);
    }
    const injectClickedElementProperties = createInjectClickedElementProperties(
      {
        config,
        logger,
        clickActivityStorage,
        getClickedElementProperties,
      },
    );
    const recallAndInjectClickedElementProperties =
      createRecallAndInjectClickedElementProperties({
        clickActivityStorage,
      });
    const storePageViewProperties = createStorePageViewProperties({
      clickActivityStorage,
    });
    return {
      lifecycle: {
        onComponentsRegistered(tools) {
          const { lifecycle } = tools;
          attachClickActivityCollector({
            eventManager,
            lifecycle,
            handleError,
          });
          // TODO: createScrollActivityCollector ...
        },
        onClick({ event, clickedElement }) {
          injectClickedElementProperties({
            event,
            clickedElement,
          });
        },
        onBeforeEvent({ event }) {
          if (hasPageName(event)) {
            if (clickCollection.eventGroupingEnabled) {
              recallAndInjectClickedElementProperties(event);
            }
            storePageViewProperties(event, logger, clickActivityStorage);
          }
        },
      },
    };
  };
  createActivityCollector.namespace = "ActivityCollector";
  createActivityCollector.configValidators = validators;
  createActivityCollector.buildOnInstanceConfiguredExtraParams = ({
    config,
    logger,
  }) => {
    if (!clickActivityStorage) {
      initClickActivityStorage(config);
    }
    return {
      getLinkDetails: (targetElement) => {
        return getClickedElementProperties({
          clickActivityStorage,
          clickedElement: targetElement,
          config,
          logger,
        }).properties;
      },
    };
  };

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

  const createResultLogMessage = (urlDestination, success) => {
    return "URL destination " + "succeeded" + ": " + urlDestination.spec.url;
  };
  var injectProcessDestinations = ({
    fireReferrerHideableImage,
    logger,
    cookieJar,
    isPageSsl,
  }) => {
    const extraCookieOptions = isPageSsl
      ? {
          sameSite: "none",
          secure: true,
        }
      : {};
    const processCookies = (destinations) => {
      const cookieDestinations = destinations.filter(
        (dest) => dest.type === "cookie",
      );
      cookieDestinations.forEach((dest) => {
        const { name, value, domain, ttlDays } = dest.spec;
        cookieJar.set(name, value || "", {
          domain: domain || "",
          expires: ttlDays || 10,
          // days
          ...extraCookieOptions,
        });
      });
    };
    const processUrls = (destinations) => {
      const urlDestinations = destinations.filter(
        (dest) => dest.type === "url",
      );
      return Promise.all(
        urlDestinations.map((urlDestination) => {
          return fireReferrerHideableImage(urlDestination.spec)
            .then(() => {
              logger.info(createResultLogMessage(urlDestination));
            })
            .catch(() => {
              // We intentionally do not throw an error if destinations fail. We
              // consider it a non-critical failure and therefore do not want it to
              // reject the promise handed back to the customer.
            });
        }),
      ).then(noop);
    };
    return (destinations) => {
      processCookies(destinations);
      return processUrls(destinations);
    };
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectProcessResponse = ({ processDestinations }) => {
    const processPushDestinations = ({ response }) => {
      const destinations = response.getPayloadsByType("activation:push");
      return processDestinations(destinations);
    };
    const retrievePullDestinations = ({ response }) => {
      return {
        destinations: response.getPayloadsByType("activation:pull"),
      };
    };
    return ({ response }) => {
      return processPushDestinations({
        response,
      }).then(() =>
        retrievePullDestinations({
          response,
        }),
      );
    };
  };

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

  const createAudiences = ({ logger, fireReferrerHideableImage }) => {
    // we override the js-cookie converter to encode the cookie value similar on how it is in DIL (PDCL-10238)
    const cookieJarWithEncoding = cookieJar.withConverter({
      write: (value) => {
        return encodeURIComponent(value);
      },
    });
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar: cookieJarWithEncoding,
    });
    const processDestinations = injectProcessDestinations({
      fireReferrerHideableImage,
      logger,
      cookieJar: loggingCookieJar,
      isPageSsl: window.location.protocol === "https:",
    });
    const processResponse = injectProcessResponse({
      processDestinations,
    });
    return {
      lifecycle: {
        onResponse: processResponse,
      },
      commands: {},
    };
  };
  createAudiences.namespace = "Audiences";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createComponent$3 = ({
    storedConsent,
    taskQueue,
    defaultConsent,
    consent,
    sendSetConsentRequest,
    validateSetConsentOptions,
    consentHashStore,
    doesIdentityCookieExist,
  }) => {
    const defaultConsentByPurpose = {
      [GENERAL]: defaultConsent,
    };
    let storedConsentByPurpose = storedConsent.read();
    const identityCookieExists = doesIdentityCookieExist();
    const consentCookieExists = storedConsentByPurpose[GENERAL] !== undefined;
    if (!identityCookieExists || !consentCookieExists) {
      consentHashStore.clear();
    }
    // If the identity cookie is gone, remove the consent cookie because the
    // consent info is tied to the identity.
    if (!identityCookieExists) {
      storedConsent.clear();
      storedConsentByPurpose = {};
    }
    consent.initializeConsent(defaultConsentByPurpose, storedConsentByPurpose);
    const readCookieIfQueueEmpty = () => {
      if (taskQueue.length === 0) {
        const storedConsentObject = storedConsent.read();
        // Only read cookies when there are no outstanding setConsent
        // requests. This helps with race conditions.
        if (storedConsentObject[GENERAL] !== undefined) {
          consent.setConsent(storedConsentObject);
        }
      }
    };
    return {
      commands: {
        setConsent: {
          optionsValidator: validateSetConsentOptions,
          run: ({
            consent: consentOptions,
            identityMap,
            edgeConfigOverrides,
          }) => {
            consent.suspend();
            const consentHashes = consentHashStore.lookup(consentOptions);
            return taskQueue
              .addTask(() => {
                if (consentHashes.isNew()) {
                  return sendSetConsentRequest({
                    consentOptions,
                    identityMap,
                    edgeConfigOverrides,
                  });
                }
                return Promise.resolve();
              })
              .then(() => consentHashes.save())
              .finally(readCookieIfQueueEmpty);
          },
        },
      },
      lifecycle: {
        // Read the cookie here too because the consent cookie may change on any request
        onResponse: readCookieIfQueueEmpty,
        // Even when we get a failure HTTP status code, the consent cookie can
        // still get updated. This could happen, for example, if the user is
        // opted out in AudienceManager, but no consent cookie exists on the
        // client. The request will be sent and the server will respond with a
        // 403 Forbidden and a consent cookie.
        onRequestFailure: readCookieIfQueueEmpty,
      },
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var computeConsentHash = (obj) =>
    fnv1a32Hex(JSON.stringify(sortObjectKeysRecursively(obj)));

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
  const getKey = ({ standard, version }) => {
    return standard + "." + version;
  };
  var createConsentHashStore = ({ storage }) => {
    return {
      clear() {
        storage.clear();
      },
      lookup(consentObjects) {
        const currentHashes = {};
        const getCurrentHash = (consentObject) => {
          const key = getKey(consentObject);
          const { standard, version, ...rest } = consentObject;
          if (!currentHashes[key]) {
            currentHashes[key] = computeConsentHash(rest).toString();
          }
          return currentHashes[key];
        };
        return {
          isNew() {
            return consentObjects.some((consentObject) => {
              const key = getKey(consentObject);
              const previousHash = storage.getItem(key);
              return (
                previousHash === null ||
                previousHash !== getCurrentHash(consentObject)
              );
            });
          },
          save() {
            consentObjects.forEach((consentObject) => {
              const key = getKey(consentObject);
              storage.setItem(key, getCurrentHash(consentObject));
            });
          },
        };
      },
    };
  };

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

  var createConsentRequestPayload = () => {
    const content = {};
    const payload = createRequestPayload({
      content,
      addIdentity: (namespaceCode, identity) => {
        content.identityMap = content.identityMap || {};
        content.identityMap[namespaceCode] =
          content.identityMap[namespaceCode] || [];
        content.identityMap[namespaceCode].push(identity);
      },
      hasIdentity: (namespaceCode) => {
        return (
          (content.identityMap && content.identityMap[namespaceCode]) !==
          undefined
        );
      },
    });
    payload.setConsent = (consent) => {
      content.consent = consent;
    };
    return payload;
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createConsentRequest = ({ payload, datastreamIdOverride }) => {
    return createRequest({
      payload,
      datastreamIdOverride,
      getAction() {
        return "privacy/set-consent";
      },
      getUseSendBeacon() {
        return false;
      },
    });
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createStoredConsent = ({ parseConsentCookie, orgId, cookieJar }) => {
    const consentCookieName = getNamespacedCookieName(orgId, CONSENT);
    return {
      read() {
        const cookieValue = cookieJar.get(consentCookieName);
        return cookieValue ? parseConsentCookie(cookieValue) : {};
      },
      clear() {
        cookieJar.remove(consentCookieName);
      },
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var injectSendSetConsentRequest =
    ({
      createConsentRequestPayload,
      createConsentRequest,
      sendEdgeNetworkRequest,
      edgeConfigOverrides: globalConfigOverrides,
    }) =>
    ({
      consentOptions,
      identityMap,
      edgeConfigOverrides: localConfigOverrides,
    }) => {
      const requestParams = createRequestParams({
        payload: createConsentRequestPayload(),
        globalConfigOverrides,
        localConfigOverrides,
      });
      requestParams.payload.setConsent(consentOptions);
      if (isObject(identityMap)) {
        Object.keys(identityMap).forEach((key) => {
          identityMap[key].forEach((identity) => {
            requestParams.payload.addIdentity(key, identity);
          });
        });
      }
      const request = createConsentRequest(requestParams);
      return sendEdgeNetworkRequest({
        request,
      }).then(() => {
        // Don't let response data disseminate beyond this
        // point unless necessary.
      });
    };

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

  /**
   * Parses a consent cookie.
   * @param {string} cookieValue Must be in the format a=b;c=d
   * @returns {Object} An object where the keys are purpose names and the values
   * are the consent status for the purpose.
   */
  var parseConsentCookie = (cookieValue) => {
    const categoryPairs = cookieValue.split(";");
    return categoryPairs.reduce((consentByPurpose, categoryPair) => {
      const [name, value] = categoryPair.split("=");
      consentByPurpose[name] = value;
      return consentByPurpose;
    }, {});
  };

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
  var validateSetConsentOptions = boundObjectOf({
    consent: boundArrayOf(boundAnything()).required().nonEmpty(),
    identityMap: validateIdentityMap,
    edgeConfigOverrides: validateConfigOverride,
  })
    .noUnknownFields()
    .required();

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var configValidators$2 = boundObjectOf({
    defaultConsent: boundEnumOf(IN, OUT, PENDING).default(IN),
  });

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

  const createConsent = ({
    config,
    consent,
    sendEdgeNetworkRequest,
    createNamespacedStorage,
  }) => {
    const { orgId, defaultConsent } = config;
    const storedConsent = createStoredConsent({
      parseConsentCookie,
      orgId,
      cookieJar,
    });
    const taskQueue = createTaskQueue();
    const sendSetConsentRequest = injectSendSetConsentRequest({
      createConsentRequestPayload,
      createConsentRequest,
      sendEdgeNetworkRequest,
      edgeConfigOverrides: config.edgeConfigOverrides,
    });
    const storage = createNamespacedStorage(
      sanitizeOrgIdForCookieName(orgId) + ".consentHashes.",
    );
    const consentHashStore = createConsentHashStore({
      storage: storage.persistent,
    });
    const doesIdentityCookieExist = injectDoesIdentityCookieExist({
      orgId,
    });
    return createComponent$3({
      storedConsent,
      taskQueue,
      defaultConsent,
      consent,
      sendSetConsentRequest,
      validateSetConsentOptions,
      consentHashStore,
      doesIdentityCookieExist,
    });
  };
  createConsent.namespace = "Consent";
  createConsent.configValidators = configValidators$2;

  /*
  Copyright 20219 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createEventMergeId = () => {
    return {
      eventMergeId: v4(),
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createComponent$2 = ({ createEventMergeId }) => {
    return {
      commands: {
        createEventMergeId: {
          run: createEventMergeId,
        },
      },
    };
  };

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

  const createEventMerge = () => {
    return createComponent$2({
      createEventMergeId,
    });
  };
  createEventMerge.namespace = "EventMerge";

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
  var EventTypes = {
    PAUSE: "media.pauseStart",
    PLAY: "media.play",
    BUFFER_START: "media.bufferStart",
    AD_START: "media.adStart",
    Ad_BREAK_START: "media.adBreakStart",
    SESSION_END: "media.sessionEnd",
    SESSION_START: "media.sessionStart",
    SESSION_COMPLETE: "media.sessionComplete",
    PING: "media.ping",
    AD_BREAK_COMPLETE: "media.adBreakComplete",
    AD_COMPLETE: "media.adComplete",
    AD_SKIP: "media.adSkip",
    BITRATE_CHANGE: "media.bitrateChange",
    CHAPTER_COMPLETE: "media.chapterComplete",
    CHAPTER_SKIP: "media.chapterSkip",
    CHAPTER_START: "media.chapterStart",
    ERROR: "media.error",
    STATES_UPDATE: "media.statesUpdate",
  };

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

  var createMediaRequest = ({ mediaRequestPayload, action }) => {
    return createRequest({
      payload: mediaRequestPayload,
      edgeSubPath: "/va",
      getAction() {
        return action;
      },
      getUseSendBeacon() {
        return false;
      },
    });
  };

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
  var createMediaEventManager = ({
    config,
    eventManager,
    consent,
    sendEdgeNetworkRequest,
    setTimestamp,
  }) => {
    return {
      createMediaEvent({ options }) {
        const event = eventManager.createEvent();
        const { xdm } = options;
        setTimestamp(xdm);
        event.setUserXdm(xdm);
        if (xdm.eventType === EventTypes.AD_START) {
          const { advertisingDetails } = options.xdm.mediaCollection;
          event.mergeXdm({
            mediaCollection: {
              advertisingDetails: {
                playerName:
                  advertisingDetails.playerName ||
                  config.streamingMedia.playerName,
              },
            },
          });
        }
        return event;
      },
      createMediaSession(options) {
        const { playerName, channel, appVersion } = config.streamingMedia;
        const event = eventManager.createEvent();
        const { sessionDetails } = options.xdm.mediaCollection;
        event.setUserXdm(options.xdm);
        event.mergeXdm({
          eventType: EventTypes.SESSION_START,
          mediaCollection: {
            sessionDetails: {
              playerName: sessionDetails.playerName || playerName,
              channel: sessionDetails.channel || channel,
              appVersion: sessionDetails.appVersion || appVersion,
            },
          },
        });
        return event;
      },
      augmentMediaEvent({ event, playerId, getPlayerDetails, sessionID }) {
        if (!playerId || !getPlayerDetails) {
          return event;
        }
        const { playhead, qoeDataDetails } = getPlayerDetails({
          playerId,
        });
        event.mergeXdm({
          mediaCollection: {
            playhead: toInteger(playhead),
            qoeDataDetails,
            sessionID,
          },
        });
        return event;
      },
      trackMediaSession({ event, mediaOptions, edgeConfigOverrides }) {
        const sendEventOptions = {
          mediaOptions,
          edgeConfigOverrides,
        };
        return eventManager.sendEvent(event, sendEventOptions);
      },
      trackMediaEvent({ event, action }) {
        const mediaRequestPayload = createDataCollectionRequestPayload();
        const request = createMediaRequest({
          mediaRequestPayload,
          action,
        });
        mediaRequestPayload.addEvent(event);
        event.finalize();
        return consent.awaitConsent().then(() => {
          return sendEdgeNetworkRequest({
            request,
          }).then(() => {
            return {};
          });
        });
      },
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var PlaybackState = {
    MAIN: "main",
    COMPLETED: "completed",
  };

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

  var createMediaSessionCacheManager = () => {
    let mediaSessionCache;
    const getSession = (playerId) => {
      return mediaSessionCache[playerId] || {};
    };
    const savePing = ({ playerId, pingId, playbackState }) => {
      if (!mediaSessionCache[playerId]) {
        return;
      }
      if (mediaSessionCache[playerId].pingId) {
        clearTimeout(mediaSessionCache[playerId].pingId);
      }
      mediaSessionCache[playerId].pingId = pingId;
      mediaSessionCache[playerId].playbackState = playbackState;
    };
    const stopPing = ({ playerId }) => {
      const sessionDetails = mediaSessionCache[playerId];
      if (!sessionDetails) {
        return;
      }
      clearTimeout(sessionDetails.pingId);
      sessionDetails.pingId = null;
      sessionDetails.playbackState = PlaybackState.COMPLETED;
    };
    const storeSession = ({ playerId, sessionDetails }) => {
      if (mediaSessionCache === undefined) {
        mediaSessionCache = {};
      }
      mediaSessionCache[playerId] = sessionDetails;
    };
    return {
      getSession,
      storeSession,
      stopPing,
      savePing,
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const getContentState = (eventType, sessionContentState) => {
    if (
      eventType === EventTypes.AD_START ||
      eventType === EventTypes.Ad_BREAK_START ||
      eventType === EventTypes.AD_SKIP ||
      eventType === EventTypes.AD_COMPLETE
    ) {
      return "ad";
    }
    if (
      eventType === EventTypes.AD_BREAK_COMPLETE ||
      eventType === EventTypes.CHAPTER_COMPLETE ||
      eventType === EventTypes.CHAPTER_START ||
      eventType === EventTypes.CHAPTER_SKIP ||
      eventType === EventTypes.SESSION_START
    ) {
      return "main";
    }
    if (
      eventType === EventTypes.SESSION_END ||
      eventType === EventTypes.SESSION_COMPLETE
    ) {
      return "completed";
    }
    return sessionContentState;
  };
  var createTrackMediaEvent = ({
    mediaEventManager,
    mediaSessionCacheManager,
    config,
  }) => {
    const sendMediaEvent = (options) => {
      const event = mediaEventManager.createMediaEvent({
        options,
      });
      const { playerId, xdm } = options;
      const { eventType } = xdm;
      const action = eventType.split(".")[1];
      const { getPlayerDetails, sessionPromise, playbackState } =
        mediaSessionCacheManager.getSession(playerId);
      return sessionPromise.then((result) => {
        if (!result.sessionId) {
          return Promise.reject(
            new Error(
              "Failed to trigger media event: " +
                eventType +
                ". Session ID is not available for playerId: " +
                playerId +
                ".",
            ),
          );
        }
        mediaEventManager.augmentMediaEvent({
          event,
          eventType,
          playerId,
          getPlayerDetails,
          sessionID: result.sessionId,
        });
        return mediaEventManager
          .trackMediaEvent({
            event,
            action,
          })
          .then(() => {
            if (playerId) {
              if (
                eventType === EventTypes.SESSION_COMPLETE ||
                eventType === EventTypes.SESSION_END
              ) {
                mediaSessionCacheManager.stopPing({
                  playerId,
                });
              } else {
                const sessionPlaybackState = getContentState(
                  eventType,
                  playbackState,
                );
                if (sessionPlaybackState === "completed") {
                  return;
                }
                const interval =
                  sessionPlaybackState === "ad"
                    ? config.streamingMedia.adPingInterval
                    : config.streamingMedia.mainPingInterval;
                const pingId = setTimeout(() => {
                  const pingOptions = {
                    playerId,
                    xdm: {
                      eventType: EventTypes.PING,
                    },
                  };
                  sendMediaEvent(pingOptions);
                }, interval * 1000);
                mediaSessionCacheManager.savePing({
                  playerId,
                  pingId,
                  playbackState: sessionPlaybackState,
                });
              }
            }
          });
      });
    };
    return (options) => sendMediaEvent(options);
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createTrackMediaSession = ({
    config,
    mediaEventManager,
    mediaSessionCacheManager,
    legacy = false,
  }) => {
    return (options) => {
      if (!config.streamingMedia) {
        return Promise.reject(new Error("Streaming media is not configured."));
      }
      const { playerId, getPlayerDetails, edgeConfigOverrides } = options;
      const event = mediaEventManager.createMediaSession(options);
      mediaEventManager.augmentMediaEvent({
        event,
        playerId,
        getPlayerDetails,
      });
      const sessionPromise = mediaEventManager.trackMediaSession({
        event,
        mediaOptions: {
          playerId,
          getPlayerDetails,
          legacy,
        },
        edgeConfigOverrides,
      });
      mediaSessionCacheManager.storeSession({
        playerId,
        sessionDetails: {
          sessionPromise,
          getPlayerDetails,
          playbackState: PlaybackState.MAIN,
        },
      });
      return sessionPromise;
    };
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Returns whether a string value is blank. Also returns true if the value is not a string.
   * @param {*} value
   * @returns {boolean}
   */
  var isBlankString = (value) => (isString(value) ? !value.trim() : true);

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createMediaResponseHandler = ({
    mediaSessionCacheManager,
    config,
    trackMediaEvent,
  }) => {
    return ({ response, playerId, getPlayerDetails }) => {
      const mediaPayload = response.getPayloadsByType(
        "media-analytics:new-session",
      );
      if (isNonEmptyArray(mediaPayload)) {
        const { sessionId } = mediaPayload[0];
        if (isBlankString(sessionId)) {
          return {};
        }
        if (!playerId || !getPlayerDetails) {
          return {
            sessionId,
          };
        }
        const pingId = setTimeout(() => {
          trackMediaEvent({
            playerId,
            xdm: {
              eventType: EventTypes.PING,
            },
          });
        }, config.streamingMedia.mainPingInterval * 1000);
        mediaSessionCacheManager.savePing({
          playerId,
          pingId,
          playbackState: PlaybackState.MAIN,
        });
        return {
          sessionId,
        };
      }
      return {};
    };
  };

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

  const MEDIA_TYPE = {
    Video: "video",
    Audio: "audio",
  };
  const STREAM_TYPE = {
    VOD: "vod",
    Live: "live",
    Linear: "linear",
    Podcast: "podcast",
    Audiobook: "audiobook",
    AOD: "aod",
  };
  const PLAYER_STATE = {
    FullScreen: "fullScreen",
    ClosedCaption: "closedCaptioning",
    Mute: "mute",
    PictureInPicture: "pictureInPicture",
    InFocus: "inFocus",
  };
  const EVENT = {
    /**
     * Constant defining event type for AdBreak start
     */
    AdBreakStart: "adBreakStart",
    /**
     * Constant defining event type for AdBreak complete
     */
    AdBreakComplete: "adBreakComplete",
    /**
     * Constant defining event type for Ad start
     */
    AdStart: "adStart",
    /**
     * Constant defining event type for Ad complete
     */
    AdComplete: "adComplete",
    /**
     * Constant defining event type for Ad skip
     */
    AdSkip: "adSkip",
    /**
     * Constant defining event type for Chapter start
     */
    ChapterStart: "chapterStart",
    /**
     * Constant defining event type for Chapter complete
     */
    ChapterComplete: "chapterComplete",
    /**
     * Constant defining event type for Chapter skip
     */
    ChapterSkip: "chapterSkip",
    /**
     * Constant defining event type for Seek start
     */
    SeekStart: "seekStart",
    /**
     * Constant defining event type for Seek complete
     */
    SeekComplete: "seekComplete",
    /**
     * Constant defining event type for Buffer start
     */
    BufferStart: "bufferStart",
    /**
     * Constant defining event type for Buffer complete
     */
    BufferComplete: "bufferComplete",
    /**
     * Constant defining event type for change in Bitrate
     */
    BitrateChange: "bitrateChange",
    /**
     * Constant defining event type for Custom State Start
     */
    StateStart: "stateStart",
    /**
     * Constant defining event type for Custom State End
     */
    StateEnd: "stateEnd",
  };
  const MEDIA_EVENTS_INTERNAL = {
    SessionStart: "sessionStart",
    SessionEnd: "sessionEnd",
    SessionComplete: "sessionComplete",
    Play: "play",
    Pause: "pauseStart",
    Error: "error",
    StateUpdate: "statesUpdate",
  };
  const MEDIA_OBJECT_KEYS = {
    MediaResumed: "media.resumed",
    GranularAdTracking: "media.granularadtracking",
  };
  const VIDEO_METADATA_KEYS = {
    Show: "a.media.show",
    Season: "a.media.season",
    Episode: "a.media.episode",
    AssetId: "a.media.asset",
    Genre: "a.media.genre",
    FirstAirDate: "a.media.airDate",
    FirstDigitalDate: "a.media.digitalDate",
    Rating: "a.media.rating",
    Originator: "a.media.originator",
    Network: "a.media.network",
    ShowType: "a.media.type",
    AdLoad: "a.media.adLoad",
    MVPD: "a.media.pass.mvpd",
    Authorized: "a.media.pass.auth",
    DayPart: "a.media.dayPart",
    Feed: "a.media.feed",
    StreamFormat: "a.media.format",
  };
  const AUDIO_METADATA_KEYS = {
    Artist: "a.media.artist",
    Album: "a.media.album",
    Label: "a.media.label",
    Author: "a.media.author",
    Station: "a.media.station",
    Publisher: "a.media.publisher",
  };
  const AD_METADATA_KEYS = {
    Advertiser: "a.media.ad.advertiser",
    CampaignId: "a.media.ad.campaign",
    CreativeId: "a.media.ad.creative",
    PlacementId: "a.media.ad.placement",
    SiteId: "a.media.ad.site",
    CreativeUrl: "a.media.ad.creativeURL",
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createMediaAnalyticsBridgeComponent = ({
    trackMediaEvent,
    trackMediaSession,
    mediaResponseHandler,
    logger,
    createMediaHelper,
    createGetInstance,
    config,
  }) => {
    return {
      lifecycle: {
        onBeforeEvent({ mediaOptions, onResponse = noop }) {
          if (!mediaOptions) {
            return;
          }
          const { legacy, playerId, getPlayerDetails } = mediaOptions;
          if (!legacy) {
            return;
          }
          onResponse(({ response }) => {
            return mediaResponseHandler({
              playerId,
              getPlayerDetails,
              response,
            });
          });
        },
      },
      commands: {
        getMediaAnalyticsTracker: {
          run: () => {
            if (!config.streamingMedia) {
              return Promise.reject(
                new Error("Streaming media is not configured."),
              );
            }
            logger.info("Streaming media is configured in legacy mode.");
            const mediaAnalyticsHelper = createMediaHelper({
              logger,
            });
            return Promise.resolve({
              getInstance: () => {
                return createGetInstance({
                  logger,
                  trackMediaEvent,
                  trackMediaSession,
                  uuid: v4,
                });
              },
              Event: EVENT,
              MediaType: MEDIA_TYPE,
              PlayerState: PLAYER_STATE,
              StreamType: STREAM_TYPE,
              MediaObjectKey: MEDIA_OBJECT_KEYS,
              VideoMetadataKeys: VIDEO_METADATA_KEYS,
              AudioMetadataKeys: AUDIO_METADATA_KEYS,
              AdMetadataKeys: AD_METADATA_KEYS,
              ...mediaAnalyticsHelper,
            });
          },
        },
      },
    };
  };

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

  var createMediaHelper = ({ logger }) => {
    const createMediaObject = (
      friendlyName,
      name,
      length,
      contentType,
      streamType,
    ) => {
      const mediaObject = {
        friendlyName,
        name,
        length,
        streamType,
        contentType,
      };
      const validate = boundObjectOf({
        friendlyName: boundString().nonEmpty(),
        name: boundString().nonEmpty(),
        length: boundNumber().required(),
        streamType: boundString().nonEmpty(),
        contentType: boundString().nonEmpty(),
      });
      try {
        const result = validate(mediaObject);
        const sessionDetails = {
          name: result.name,
          friendlyName: result.friendlyName,
          length: Math.round(result.length),
          streamType: result.streamType,
          contentType: result.contentType,
        };
        return {
          sessionDetails,
        };
      } catch (error) {
        logger.warn(
          "An error occurred while creating the Media Object.",
          error,
        );
        return {};
      }
    };
    const createAdBreakObject = (name, position, startTime) => {
      const adBreakObject = {
        friendlyName: name,
        offset: position,
        index: startTime,
      };
      const validator = boundObjectOf({
        friendlyName: boundString().nonEmpty(),
        offset: boundNumber(),
        index: boundNumber(),
      });
      try {
        const result = validator(adBreakObject);
        const advertisingPodDetails = {
          friendlyName: result.friendlyName,
          offset: result.offset,
          index: result.index,
        };
        return {
          advertisingPodDetails,
        };
      } catch (error) {
        logger.warn(
          "An error occurred while creating the Ad Break Object.",
          error,
        );
        return {};
      }
    };
    const createAdObject = (name, id, position, length) => {
      const adObject = {
        friendlyName: name,
        name: id,
        podPosition: position,
        length,
      };
      const validator = boundObjectOf({
        friendlyName: boundString().nonEmpty(),
        name: boundString().nonEmpty(),
        podPosition: boundNumber(),
        length: boundNumber(),
      });
      try {
        const result = validator(adObject);
        const advertisingDetails = {
          friendlyName: result.friendlyName,
          name: result.name,
          podPosition: result.podPosition,
          length: result.length,
        };
        return {
          advertisingDetails,
        };
      } catch (error) {
        logger.warn(
          "An error occurred while creating the Advertising Object.",
          error,
        );
        return {};
      }
    };
    const createChapterObject = (name, position, length, startTime) => {
      const chapterDetailsObject = {
        friendlyName: name,
        offset: position,
        length,
        index: startTime,
      };
      const validator = boundObjectOf({
        friendlyName: boundString().nonEmpty(),
        offset: boundNumber(),
        length: boundNumber(),
        index: boundNumber(),
      });
      try {
        const result = validator(chapterDetailsObject);
        const chapterDetails = {
          friendlyName: result.friendlyName,
          offset: result.offset,
          index: result.index,
          length: result.length,
        };
        return {
          chapterDetails,
        };
      } catch (error) {
        logger.warn(
          "An error occurred while creating the Chapter Object.",
          error,
        );
        return {};
      }
    };
    const createStateObject = (stateName) => {
      const STATE_NAME_REGEX = /^[a-zA-Z0-9_]{1,64}$/;
      const validator = boundString().matches(
        STATE_NAME_REGEX,
        "This is not a valid state name.",
      );
      try {
        const result = validator(stateName);
        return {
          name: result,
        };
      } catch (error) {
        logger.warn(
          "An error occurred while creating the State Object.",
          error,
        );
        return {};
      }
    };
    const createQoEObject = (bitrate, droppedFrames, fps, startupTime) => {
      const qoeObject = {
        bitrate,
        droppedFrames,
        fps,
        startupTime,
      };
      const validator = boundObjectOf({
        bitrate: boundNumber(),
        droppedFrames: boundNumber(),
        fps: boundNumber(),
        startupTime: boundNumber(),
      });
      try {
        const result = validator(qoeObject);
        return {
          bitrate: result.bitrate,
          droppedFrames: result.droppedFrames,
          framesPerSecond: result.fps,
          timeToStart: result.startupTime,
        };
      } catch (error) {
        logger.warn("An error occurred while creating the QOE Object.", error);
        return {};
      }
    };
    return {
      createMediaObject,
      createAdBreakObject,
      createAdObject,
      createChapterObject,
      createStateObject,
      createQoEObject,
    };
  };

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

  const mediaToXdmKeys = {
    "a.media.show": "show",
    "a.media.season": "season",
    "a.media.episode": "episode",
    "a.media.asset": "assetID",
    "a.media.genre": "genre",
    "a.media.airDate": "firstAirDate",
    "a.media.digitalDate": "firstDigitalDate",
    "a.media.rating": "rating",
    "a.media.originator": "originator",
    "a.media.network": "network",
    "a.media.type": "showType",
    "a.media.adLoad": "adLoad",
    "a.media.pass.mvpd": "mvpd",
    "a.media.pass.auth": "authorized",
    "a.media.dayPart": "dayPart",
    "a.media.feed": "feed",
    "a.media.format": "streamFormat",
    "a.media.artist": "artist",
    "a.media.album": "album",
    "a.media.label": "label",
    "a.media.author": "author",
    "a.media.station": "station",
    "a.media.publisher": "publisher",
    "media.resumed": "hasResume",
  };
  const adsToXdmKeys = {
    "a.media.ad.advertiser": "advertiser",
    "a.media.ad.campaign": "campaignID",
    "a.media.ad.creative": "creativeID",
    "a.media.ad.placement": "placementID",
    "a.media.ad.site": "siteID",
    "a.media.ad.creativeURL": "creativeURL",
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createGetInstance = ({
    logger,
    trackMediaSession,
    trackMediaEvent,
    uuid,
  }) => {
    let trackerState = null;
    const instantiateTracker = () => {
      trackerState = {
        qoe: null,
        lastPlayhead: 0,
        playerId: uuid(),
      };
    };
    const getEventType = ({ eventType }) => {
      if (
        eventType === EVENT.BufferComplete ||
        eventType === EVENT.SeekComplete
      ) {
        return MEDIA_EVENTS_INTERNAL.Play;
      }
      if (eventType === EVENT.StateStart || eventType === EVENT.StateEnd) {
        return MEDIA_EVENTS_INTERNAL.StateUpdate;
      }
      if (eventType === EVENT.SeekStart) {
        return MEDIA_EVENTS_INTERNAL.Pause;
      }
      return eventType;
    };
    const createXdmObject = ({
      eventType,
      mediaDetails = {},
      contextData = [],
    }) => {
      const action = getEventType({
        eventType,
      });
      if (eventType === EVENT.StateStart) {
        const xdm = {
          eventType: "media." + action,
          mediaCollection: {
            statesStart: [mediaDetails],
          },
        };
        return xdm;
      }
      if (eventType === EVENT.StateEnd) {
        const xdm = {
          eventType: "media." + action,
          mediaCollection: {
            statesEnd: [mediaDetails],
          },
        };
        return xdm;
      }
      const xdm = {
        eventType: "media." + action,
        mediaCollection: {
          ...mediaDetails,
        },
      };
      const customMetadata = [];
      Object.keys(contextData).forEach((key) => {
        if (mediaToXdmKeys[key]) {
          xdm.mediaCollection.sessionDetails[mediaToXdmKeys[key]] =
            contextData[key];
        } else if (adsToXdmKeys[key]) {
          xdm.mediaCollection.advertisingDetails[adsToXdmKeys[key]] =
            contextData[key];
        } else {
          customMetadata.push({
            name: key,
            value: contextData[key],
          });
        }
      });
      if (isNonEmptyArray(customMetadata)) {
        xdm.mediaCollection.customMetadata = customMetadata;
      }
      return xdm;
    };
    return {
      trackSessionStart: (mediaObject, contextData = {}) => {
        if (isNil(mediaObject) || isEmptyObject(mediaObject)) {
          logger.warn("Invalid media object");
          return {};
        }
        if (trackerState === null) {
          logger.warn(
            "The Media Session was completed. Restarting a new session.",
          );
          instantiateTracker();
        }
        const xdm = createXdmObject({
          eventType: MEDIA_EVENTS_INTERNAL.SessionStart,
          mediaDetails: mediaObject,
          contextData,
        });
        return trackMediaSession({
          playerId: trackerState.playerId,
          getPlayerDetails: () => {
            return {
              playhead: trackerState.lastPlayhead,
              qoeDataDetails: trackerState.qoe,
            };
          },
          xdm,
        });
      },
      trackPlay: () => {
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return {};
        }
        const xdm = createXdmObject({
          eventType: MEDIA_EVENTS_INTERNAL.Play,
        });
        return trackMediaEvent({
          playerId: trackerState.playerId,
          xdm,
        });
      },
      trackPause: () => {
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return {};
        }
        const xdm = createXdmObject({
          eventType: MEDIA_EVENTS_INTERNAL.Pause,
        });
        return trackMediaEvent({
          playerId: trackerState.playerId,
          xdm,
        });
      },
      trackSessionEnd: () => {
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return {};
        }
        const xdm = createXdmObject({
          eventType: MEDIA_EVENTS_INTERNAL.SessionEnd,
        });
        return trackMediaEvent({
          playerId: trackerState.playerId,
          xdm,
        });
      },
      trackComplete: () => {
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return {};
        }
        const xdm = createXdmObject({
          eventType: MEDIA_EVENTS_INTERNAL.SessionComplete,
        });
        return trackMediaEvent({
          playerId: trackerState.playerId,
          xdm,
        });
      },
      trackError: (errorId) => {
        logger.warn("trackError(" + errorId + ")");
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return {};
        }
        const errorDetails = {
          name: errorId,
          source: "player",
        };
        const xdm = createXdmObject({
          eventType: MEDIA_EVENTS_INTERNAL.Error,
          mediaDetails: {
            errorDetails,
          },
        });
        return trackMediaEvent({
          playerId: trackerState.playerId,
          xdm,
        });
      },
      trackEvent: (eventType, info, context) => {
        if (isEmptyObject(info)) {
          logger.warn("Invalid media object.");
          return {};
        }
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return {};
        }
        if (!Object.values(EVENT).includes(eventType)) {
          logger.warn("Invalid event type");
          return {};
        }
        const xdm = createXdmObject({
          eventType,
          mediaDetails: info,
          contextData: context,
        });
        return trackMediaEvent({
          playerId: trackerState.playerId,
          xdm,
        });
      },
      updatePlayhead: (time) => {
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return;
        }
        if (isNumber$1(time)) {
          trackerState.lastPlayhead = parseInt(time, 10);
        }
      },
      updateQoEObject: (qoeObject) => {
        if (trackerState === null) {
          logger.warn("The Media Session was completed.");
          return;
        }
        if (!qoeObject) {
          return;
        }
        trackerState.qoe = qoeObject;
      },
      destroy: () => {
        logger.warn("Destroy called, destroying the tracker.");
        trackerState = null;
      },
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  /* eslint-disable import/no-restricted-paths */

  const createMediaAnalyticsBridge = ({
    eventManager,
    sendEdgeNetworkRequest,
    config,
    logger,
    consent,
  }) => {
    const mediaSessionCacheManager = createMediaSessionCacheManager();
    const mediaEventManager = createMediaEventManager({
      sendEdgeNetworkRequest,
      config,
      consent,
      eventManager,
      setTimestamp: injectTimestamp(() => new Date()),
    });
    const trackMediaEvent = createTrackMediaEvent({
      mediaSessionCacheManager,
      mediaEventManager,
      config,
    });
    const trackMediaSession = createTrackMediaSession({
      config,
      mediaEventManager,
      mediaSessionCacheManager,
      legacy: true,
    });
    const mediaResponseHandler = createMediaResponseHandler({
      mediaSessionCacheManager,
      config,
      trackMediaEvent,
    });
    return createMediaAnalyticsBridgeComponent({
      mediaResponseHandler,
      trackMediaSession,
      trackMediaEvent,
      createMediaHelper,
      createGetInstance,
      logger,
      config,
    });
  };
  createMediaAnalyticsBridge.namespace = "Legacy Media Analytics";

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const WEB = "web";
  const WEBAPP = "webapp";
  const SURFACE_TYPE_DELIMITER = "://";
  const FRAGMENT_DELIMITER = "#";

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const SURFACE_REGEX = /^(\w+):\/\/([^/#]+)(\/[^#]*)?(#.*)?$/;
  const AUTHORITY_REGEX =
    /^(?:.*@)?(?:[a-z\d\u00a1-\uffff.-]+|\[[a-f\d:]+])(?::\d+)?$/;
  const PATH_REGEX = /^\/(?:[/\w\u00a1-\uffff-.~]|%[a-fA-F\d]{2})*$/;
  const FRAGMENT_REGEX = /^#(?:[/\w\u00a1-\uffff-.~]|%[a-fA-F\d]{2})+$/;
  const normalizePath = (path = "/") => {
    let end = path.length;
    while (end > 0 && "/".indexOf(path.charAt(end - 1)) !== -1) {
      end -= 1;
    }
    return path.substring(0, end) || "/";
  };
  const getSurfaceType = (surfaceTypeMatch) =>
    isNonEmptyString(surfaceTypeMatch) ? surfaceTypeMatch.toLowerCase() : "";
  const getAuthority = (authorityMatch) =>
    isNonEmptyString(authorityMatch) ? authorityMatch.toLowerCase() : "";
  const getPath = (pathMatch) =>
    isNonEmptyString(pathMatch) ? normalizePath(pathMatch) : "/";
  const parseSurface = (surfaceString) => {
    const matched = surfaceString.match(SURFACE_REGEX);
    return matched
      ? {
          surfaceType: getSurfaceType(matched[1]),
          authority: getAuthority(matched[2]),
          path: getPath(matched[3]),
          fragment: matched[4],
        }
      : null;
  };
  const stringifySurface = (surface) =>
    "" +
    surface.surfaceType +
    SURFACE_TYPE_DELIMITER +
    surface.authority +
    (surface.path || "") +
    (surface.fragment || "");
  const buildPageSurface = (getPageLocation) => {
    const location = getPageLocation();
    const host = location.host.toLowerCase();
    const path = location.pathname;
    return WEB + SURFACE_TYPE_DELIMITER + host + normalizePath(path);
  };
  const expandFragmentSurface = (surface, getPageLocation) =>
    surface.startsWith(FRAGMENT_DELIMITER)
      ? buildPageSurface(getPageLocation) + surface
      : surface;
  const validateSurface = (surface, getPageLocation, logger) => {
    const invalidateSurface = (validationError) => {
      logger.warn(validationError);
      return null;
    };
    if (!isNonEmptyString(surface)) {
      return invalidateSurface("Invalid surface: " + surface);
    }
    const expanded = expandFragmentSurface(surface, getPageLocation);
    const parsed = parseSurface(expanded);
    if (parsed === null) {
      return invalidateSurface("Invalid surface: " + surface);
    }
    if (![WEB, WEBAPP].includes(parsed.surfaceType)) {
      return invalidateSurface(
        "Unsupported surface type " +
          parsed.surfaceType +
          " in surface: " +
          surface,
      );
    }
    if (!parsed.authority || !AUTHORITY_REGEX.test(parsed.authority)) {
      return invalidateSurface(
        "Invalid authority " + parsed.authority + " in surface: " + surface,
      );
    }
    if (parsed.path && !PATH_REGEX.test(parsed.path)) {
      return invalidateSurface(
        "Invalid path " + parsed.path + " in surface: " + surface,
      );
    }
    if (parsed.fragment && !FRAGMENT_REGEX.test(parsed.fragment)) {
      return invalidateSurface(
        "Invalid fragment " + parsed.fragment + " in surface: " + surface,
      );
    }
    return parsed;
  };
  const isPageWideSurface = (scope) =>
    !!scope &&
    scope.indexOf(WEB + SURFACE_TYPE_DELIMITER) === 0 &&
    scope.indexOf(FRAGMENT_DELIMITER) === -1;

  // eslint-disable-next-line default-param-last
  const normalizeSurfaces = (surfaces = [], getPageLocation, logger) =>
    surfaces
      .map((surface) => validateSurface(surface, getPageLocation, logger))
      .filter((surface) => !isNil(surface))
      .map(stringifySurface);

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

  const DEFAULT_CONTENT_ITEM =
    "https://ns.adobe.com/personalization/default-content-item";
  const DOM_ACTION = "https://ns.adobe.com/personalization/dom-action";
  const HTML_CONTENT_ITEM =
    "https://ns.adobe.com/personalization/html-content-item";
  const JSON_CONTENT_ITEM =
    "https://ns.adobe.com/personalization/json-content-item";
  const RULESET_ITEM = "https://ns.adobe.com/personalization/ruleset-item";
  const REDIRECT_ITEM = "https://ns.adobe.com/personalization/redirect-item";
  const MESSAGE_IN_APP = "https://ns.adobe.com/personalization/message/in-app";
  const MESSAGE_CONTENT_CARD =
    "https://ns.adobe.com/personalization/message/content-card";
  const EVENT_HISTORY_OPERATION =
    "https://ns.adobe.com/personalization/eventHistoryOperation";

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const addPageWideScope = (scopes) => {
    if (!scopes.includes(PAGE_WIDE_SCOPE)) {
      scopes.push(PAGE_WIDE_SCOPE);
    }
  };
  const addPageSurface = (surfaces, getPageLocation) => {
    const pageSurface = buildPageSurface(getPageLocation);
    if (!surfaces.includes(pageSurface)) {
      surfaces.push(pageSurface);
    }
  };
  const dedupe = (array) =>
    array.filter((item, pos) => array.indexOf(item) === pos);
  var createPersonalizationDetails = ({
    getPageLocation,
    renderDecisions,
    decisionScopes,
    personalization,
    event,
    isCacheInitialized,
    logger,
  }) => {
    const viewName = event.getViewName();
    return {
      isRenderDecisions() {
        return renderDecisions;
      },
      isSendDisplayEvent() {
        return !!personalization.sendDisplayEvent;
      },
      shouldIncludeRenderedPropositions() {
        return !!personalization.includeRenderedPropositions;
      },
      getViewName() {
        return viewName;
      },
      hasScopes() {
        return (
          decisionScopes.length > 0 ||
          isNonEmptyArray(personalization.decisionScopes)
        );
      },
      hasSurfaces() {
        return isNonEmptyArray(personalization.surfaces);
      },
      hasViewName() {
        return isNonEmptyString(viewName);
      },
      createQueryDetails() {
        const scopes = [...decisionScopes];
        if (isNonEmptyArray(personalization.decisionScopes)) {
          scopes.push(...personalization.decisionScopes);
        }
        const eventSurfaces = normalizeSurfaces(
          personalization.surfaces,
          getPageLocation,
          logger,
        );
        if (this.shouldRequestDefaultPersonalization()) {
          addPageWideScope(scopes);
          addPageSurface(eventSurfaces, getPageLocation);
        }
        const schemas = [
          DEFAULT_CONTENT_ITEM,
          HTML_CONTENT_ITEM,
          JSON_CONTENT_ITEM,
          REDIRECT_ITEM,
          RULESET_ITEM,
          MESSAGE_IN_APP,
          MESSAGE_CONTENT_CARD,
        ];
        if (scopes.includes(PAGE_WIDE_SCOPE)) {
          schemas.push(DOM_ACTION);
        }
        return {
          schemas,
          decisionScopes: dedupe(scopes),
          surfaces: dedupe(eventSurfaces),
        };
      },
      isCacheInitialized() {
        return isCacheInitialized;
      },
      shouldFetchData() {
        return (
          this.hasScopes() ||
          this.hasSurfaces() ||
          this.shouldRequestDefaultPersonalization()
        );
      },
      shouldUseCachedData() {
        return this.hasViewName() && !this.shouldFetchData();
      },
      shouldRequestDefaultPersonalization() {
        return (
          personalization.defaultPersonalizationEnabled ||
          (!this.isCacheInitialized() &&
            personalization.defaultPersonalizationEnabled !== false)
        );
      },
    };
  };

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
  const AUTHORING_ENABLED = "Rendering is disabled for authoring mode.";

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const DISPLAY = "decisioning.propositionDisplay";
  const INTERACT = "decisioning.propositionInteract";
  const TRIGGER = "decisioning.propositionTrigger";
  const DISMISS = "decisioning.propositionDismiss";
  const SUPPRESS = "decisioning.propositionSuppressDisplay";
  const EVENT_TYPE_TRUE = 1;

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const PropositionEventType = {
    DISPLAY: "display",
    INTERACT: "interact",
    TRIGGER: "trigger",
    DISMISS: "dismiss",
    SUPPRESS: "suppressDisplay",
  };
  const eventTypeToPropositionEventTypeMapping = {
    [DISPLAY]: PropositionEventType.DISPLAY,
    [INTERACT]: PropositionEventType.INTERACT,
    [TRIGGER]: PropositionEventType.TRIGGER,
    [DISMISS]: PropositionEventType.DISMISS,
    [SUPPRESS]: PropositionEventType.SUPPRESS,
  };
  const propositionEventTypeToEventTypeMapping = {
    [PropositionEventType.DISPLAY]: DISPLAY,
    [PropositionEventType.INTERACT]: INTERACT,
    [PropositionEventType.TRIGGER]: TRIGGER,
    [PropositionEventType.DISMISS]: DISMISS,
    [PropositionEventType.SUPPRESS]: SUPPRESS,
  };
  const getPropositionEventType = (eventType) =>
    eventTypeToPropositionEventTypeMapping[eventType];
  const getEventType = (propositionEventType) =>
    propositionEventTypeToEventTypeMapping[propositionEventType];

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
  const EMPTY_PROPOSITIONS = {
    propositions: [],
  };
  var validateApplyPropositionsOptions = ({ logger, options }) => {
    const applyPropositionsOptionsValidator = boundObjectOf({
      propositions: boundArrayOf(
        boundObjectOf({
          id: boundString().required(),
          scope: boundString().required(),
          scopeDetails: boundObjectOf({
            decisionProvider: boundString().required(),
          }).required(),
          items: boundArrayOf(
            boundObjectOf({
              id: boundString().required(),
              schema: boundString().required(),
              data: boundObjectOf(boundAnything()),
            }),
          )
            .nonEmpty()
            .required(),
        }).required(),
      )
        .nonEmpty()
        .required(),
      metadata: boundObjectOf(boundAnything()),
      viewName: boundString(),
    }).required();
    try {
      return applyPropositionsOptionsValidator(options);
    } catch (e) {
      logger.warn(
        "Invalid options for applyPropositions. No propositions will be applied.",
        e,
      );
      return EMPTY_PROPOSITIONS;
    }
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createComponent$1 = ({
    getPageLocation,
    logger,
    fetchDataHandler,
    viewChangeHandler,
    onClickHandler,
    isAuthoringModeEnabled,
    mergeQuery,
    viewCache,
    showContainers,
    applyPropositions,
    setTargetMigration,
    mergeDecisionsMeta,
    renderedPropositions,
    onDecisionHandler,
    handleConsentFlicker,
  }) => {
    return {
      lifecycle: {
        onComponentsRegistered() {
          handleConsentFlicker();
        },
        onDecision: onDecisionHandler,
        onBeforeRequest({ request }) {
          setTargetMigration(request);
          return Promise.resolve();
        },
        onBeforeEvent({
          event,
          renderDecisions,
          decisionScopes = [],
          personalization = {},
          onResponse = noop,
          onRequestFailure = noop,
        }) {
          // Include propositions on all responses, overridden with data as needed
          onResponse(() => ({
            propositions: [],
          }));
          onRequestFailure(() => showContainers());
          if (isAuthoringModeEnabled()) {
            logger.warn(AUTHORING_ENABLED);

            // If we are in authoring mode we disable personalization
            mergeQuery(event, {
              enabled: false,
            });
            return Promise.resolve();
          }
          const personalizationDetails = createPersonalizationDetails({
            getPageLocation,
            renderDecisions,
            decisionScopes,
            personalization,
            event,
            isCacheInitialized: viewCache.isInitialized(),
            logger,
          });
          const decisionsMetaPromises = [];
          if (personalizationDetails.shouldIncludeRenderedPropositions()) {
            decisionsMetaPromises.push(renderedPropositions.clear());
          }
          if (personalizationDetails.shouldFetchData()) {
            const cacheUpdate = viewCache.createCacheUpdate(
              personalizationDetails.getViewName(),
            );
            onRequestFailure(() => cacheUpdate.cancel());
            fetchDataHandler({
              cacheUpdate,
              personalizationDetails,
              event,
              onResponse,
            });
          } else if (personalizationDetails.shouldUseCachedData()) {
            decisionsMetaPromises.push(
              viewChangeHandler({
                personalizationDetails,
                event,
                onResponse,
                onRequestFailure,
              }),
            );
          }

          // This promise.all waits for both the pending display notifications to be resolved
          // (i.e. the top of page call to finish rendering) and the view change handler to
          // finish rendering anything for this view.
          return Promise.all(decisionsMetaPromises).then((decisionsMetas) => {
            // We only want to call mergeDecisionsMeta once, but we can get the propositions
            // from two places: the pending display notifications and the view change handler.
            const decisionsMeta = decisionsMetas.flatMap((dms) => dms);
            if (isNonEmptyArray(decisionsMeta)) {
              mergeDecisionsMeta(event, decisionsMeta, [
                PropositionEventType.DISPLAY,
              ]);
            }
          });
        },
        onClick({ event, clickedElement }) {
          onClickHandler({
            event,
            clickedElement,
          });
        },
      },
      commands: {
        applyPropositions: {
          optionsValidator: (options) =>
            validateApplyPropositionsOptions({
              logger,
              options,
            }),
          run: applyPropositions,
        },
      },
    };
  };

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

  var createFragment = (content = "undefined") => {
    return createNode(
      DIV,
      {},
      {
        innerHTML: content,
      },
    );
  };

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

  const EQ_START = ":eq(";
  const EQ_PATTERN = /:eq\((\d+)\)/g;
  const isNotEqSelector = (str) => str.indexOf(EQ_START) === -1;
  const splitWithEq = (selector) => {
    return selector.split(EQ_PATTERN).filter(isNonEmptyString);
  };

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

  // Trying to match ID or CSS class
  const CSS_IDENTIFIER_PATTERN = /(#|\.)(-?\w+)/g;
  // Here we use CSS.escape() to make sure we get
  // correct values for ID and CSS class
  // Please check:  https://www.w3.org/TR/css-syntax-3/#escaping
  const replaceIdentifier = (_, $1, $2) => "" + $1 + CSS.escape($2);
  const escapeIdentifiersInSelector = (selector) => {
    return selector.replace(CSS_IDENTIFIER_PATTERN, replaceIdentifier);
  };
  const parseSelector = (rawSelector) => {
    const result = [];
    const selector = escapeIdentifiersInSelector(rawSelector.trim());
    const parts = splitWithEq(selector);
    const { length } = parts;
    let i = 0;
    while (i < length) {
      const sel = parts[i];
      const eq = parts[i + 1];
      if (eq) {
        result.push({
          sel,
          eq: Number(eq),
        });
      } else {
        result.push({
          sel,
        });
      }
      i += 2;
    }
    return result;
  };

  /**
   * Returns an array of matched DOM nodes.
   * @param {String} selector that contains Sizzle "eq(...)" pseudo selector
   * @returns {Array} an array of DOM nodes
   */
  const selectNodesWithEq = (selector) => {
    const doc = document;
    if (isNotEqSelector(selector)) {
      return selectNodes(selector, doc);
    }
    const parts = parseSelector(selector);
    const { length } = parts;
    let result = [];
    let context = doc;
    let i = 0;
    while (i < length) {
      const { sel, eq } = parts[i];
      const nodes = selectNodes(sel, context);
      const { length: nodesCount } = nodes;
      if (nodesCount === 0) {
        break;
      }
      if (eq != null && eq > nodesCount - 1) {
        break;
      }
      if (i < length - 1) {
        if (eq == null) {
          [context] = nodes;
        } else {
          context = nodes[eq];
        }
      }
      if (i === length - 1) {
        if (eq == null) {
          result = nodes;
        } else {
          result = [nodes[eq]];
        }
      }
      i += 1;
    }
    return result;
  };

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

  /**
   * Returns an array of matched DOM nodes.
   * @param {String} id
   * @param {Node} [context=document] defaults to document
   * @returns {HTMLElement} an element of null
   */
  var getElementById = (id, context = document) => {
    return context.getElementById(id);
  };

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

  var setAttribute = (element, name, value) => {
    element.setAttribute(name, value);
  };

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

  var getAttribute = (element, name) => {
    return element.getAttribute(name);
  };

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

  var removeAttribute = (element, name) => {
    element.removeAttribute(name);
  };

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

  var setStyle = (element, name, value, priority) => {
    let css;
    if (priority) {
      css = name + ":" + value + " !" + priority + ";";
    } else {
      css = name + ":" + value + ";";
    }
    element.style.cssText += ";" + css;
  };

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

  var getParent = (element) => {
    return element.parentNode;
  };

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

  var getNextSibling = (element) => {
    return element.nextElementSibling;
  };

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

  var insertAfter = (container, element) => {
    if (!container) {
      return;
    }
    const parent = getParent(container);
    if (parent) {
      parent.insertBefore(element, getNextSibling(container));
    }
  };

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

  var insertBefore = (container, element) => {
    if (!container) {
      return;
    }
    const parent = getParent(container);
    if (parent) {
      parent.insertBefore(element, container);
    }
  };

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

  var getChildren = (element) => {
    const { children } = element;
    if (children) {
      return toArray(children);
    }
    return [];
  };

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

  var getChildNodes = (element) => {
    const { childNodes } = element;
    if (childNodes) {
      return toArray(childNodes);
    }
    return [];
  };

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

  var getFirstChild = (element) => {
    return element.firstElementChild;
  };

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

  let nonce;

  /**
   * Returns the nonce if available.
   * @param {Node} [context=document] defaults to document
   * @returns {(String|undefined)} the nonce or undefined if not available
   */
  var getNonce = (context = document) => {
    if (nonce === undefined) {
      const n = context.querySelector("[nonce]");
      // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
      //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946
      nonce = n && (n.nonce || n.getAttribute("nonce"));
    }
    return nonce;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const SRC = "src";

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

  const isImage = (element) => element.tagName === IMG;
  const loadImage = (url) => {
    return createNode(IMG, {
      src: url,
    });
  };
  const loadImages = (fragment) => {
    const images = selectNodes(IMG, fragment);
    images.forEach((image) => {
      const url = getAttribute(image, SRC);
      if (url) {
        loadImage(url);
      }
    });
  };

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

  const is$1 = (element, tagName) => element.tagName === tagName;
  const isInlineStyleElement = (element) =>
    is$1(element, STYLE) && !getAttribute(element, SRC);
  var addNonceToInlineStyleElements = (fragment) => {
    const styleNodes = selectNodes(STYLE, fragment);
    const { length } = styleNodes;
    const nonce = getNonce();
    if (!nonce) {
      return;
    }
    for (let i = 0; i < length; i += 1) {
      const element = styleNodes[i];
      if (!isInlineStyleElement(element)) {
        continue;
      }
      element.nonce = nonce;
    }
  };

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
  const getPromise = (url, script) => {
    return new Promise((resolve, reject) => {
      script.onload = () => {
        resolve(script);
      };
      script.onerror = () => {
        reject(new Error("Failed to load script: " + url));
      };
    });
  };
  const loadScript = (url) => {
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    const promise = getPromise(url, script);
    document.head.appendChild(script);
    return promise;
  };
  const is = (element, tagName) => !!element && element.tagName === tagName;
  const isInlineScript = (element) =>
    is(element, SCRIPT) && !getAttribute(element, SRC);
  const isRemoteScript = (element) =>
    is(element, SCRIPT) && getAttribute(element, SRC);
  const getInlineScripts = (fragment) => {
    const scripts = selectNodes(SCRIPT, fragment);
    const result = [];
    const { length } = scripts;
    const nonce = getNonce();
    const attributes = {
      ...(nonce && {
        nonce,
      }),
    };
    for (let i = 0; i < length; i += 1) {
      const element = scripts[i];
      if (!isInlineScript(element)) {
        continue;
      }
      const { textContent } = element;
      if (!textContent) {
        continue;
      }
      result.push(
        createNode(SCRIPT, attributes, {
          textContent,
        }),
      );
    }
    return result;
  };
  const getRemoteScriptsUrls = (fragment) => {
    const scripts = selectNodes(SCRIPT, fragment);
    const result = [];
    const { length } = scripts;
    for (let i = 0; i < length; i += 1) {
      const element = scripts[i];
      if (!isRemoteScript(element)) {
        continue;
      }
      const url = getAttribute(element, SRC);
      if (!url) {
        continue;
      }
      result.push(url);
    }
    return result;
  };
  const executeInlineScripts = (parent, scripts) => {
    scripts.forEach((script) => {
      parent.appendChild(script);
      parent.removeChild(script);
    });
  };
  const executeRemoteScripts = (urls) => {
    return Promise.all(urls.map(loadScript));
  };

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

  var appendHtml = (container, html, decorateProposition) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    loadImages(fragment);
    elements.forEach((element) => {
      appendNode(container, element);
    });
    decorateProposition(container);
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
  };

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

  const clear = (container) => {
    // We want to remove ALL nodes, text, comments etc
    const childNodes = getChildNodes(container);
    childNodes.forEach(removeNode);
  };
  var setHtml = (container, html, decorateProposition) => {
    clear(container);
    return appendHtml(container, html, decorateProposition);
  };

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

  var prependHtml = (container, html, decorateProposition) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    const { length } = elements;
    let i = length - 1;

    // We have to proactively load images to avoid flicker
    loadImages(fragment);

    // We are inserting elements in reverse order
    while (i >= 0) {
      const element = elements[i];
      decorateProposition(element);
      const firstChild = getFirstChild(container);
      if (firstChild) {
        insertBefore(firstChild, element);
      } else {
        appendNode(container, element);
      }
      i -= 1;
    }
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
  };

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

  const PREHIDING_ID = "alloy-prehiding";
  const HIDING_STYLE_DEFINITION = "{ visibility: hidden }";

  // Using global is OK since we have a single DOM
  // so storing nodes even for multiple Alloy instances is fine
  const styleNodes = {};
  const hideElements = (prehidingSelector) => {
    // if we have different events with the same
    // prehiding selector we don't want to recreate
    // the style tag
    if (styleNodes[prehidingSelector]) {
      return;
    }
    const nonce = getNonce();
    const attrs = {
      ...(nonce && {
        nonce,
      }),
    };
    const props = {
      textContent: prehidingSelector + " " + HIDING_STYLE_DEFINITION,
    };
    const node = createNode(STYLE, attrs, props);
    appendNode(document.head, node);
    styleNodes[prehidingSelector] = node;
  };
  const showElements = (prehidingSelector) => {
    const node = styleNodes[prehidingSelector];
    if (node) {
      removeNode(node);
      delete styleNodes[prehidingSelector];
    }
  };
  const createHideContainers = (logger) => {
    return (prehidingStyle) => {
      if (!prehidingStyle) {
        return;
      }

      // If containers prehiding style has been added
      // by customer's prehiding snippet we don't
      // want to add the same node
      const node = getElementById(PREHIDING_ID);
      if (node) {
        return;
      }
      const nonce = getNonce();
      const attrs = {
        id: PREHIDING_ID,
        ...(nonce && {
          nonce,
        }),
      };
      const props = {
        textContent: prehidingStyle,
      };
      const styleNode = createNode(STYLE, attrs, props);
      logger.logOnContentHiding({
        status: "hide-containers",
        message: "Prehiding style applied to hide containers.",
        logLevel: "info",
      });
      appendNode(document.head, styleNode);
    };
  };
  const createShowContainers = (logger) => {
    return () => {
      // If containers prehiding style exists
      // we will remove it
      const node = getElementById(PREHIDING_ID);
      if (!node) {
        return;
      }
      logger.logOnContentHiding({
        status: "show-containers",
        message: "Prehiding style removed to show containers.",
        logLevel: "info",
      });
      removeNode(node);
    };
  };

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

  var setText = (container, text, decorateProposition) => {
    decorateProposition(container);
    container.textContent = text;
  };

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

  var insertHtmlBefore = (container, html, decorateProposition) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    loadImages(fragment);
    elements.forEach((element) => {
      decorateProposition(element);
      insertBefore(container, element);
    });
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
  };

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

  var replaceHtml = (container, html, decorateProposition) => {
    return insertHtmlBefore(container, html, decorateProposition).then(() => {
      removeNode(container);
    });
  };

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

  var insertHtmlAfter = (container, html, decorateProposition) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    loadImages(fragment);
    let insertionPoint = container;
    elements.forEach((element) => {
      decorateProposition(element);
      insertAfter(insertionPoint, element);
      insertionPoint = element;
    });
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
  };

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

  var setStyles = (container, styles, decorateProposition) => {
    const { priority, ...style } = styles;
    Object.keys(style).forEach((key) => {
      setStyle(container, key, style[key], priority);
    });
    decorateProposition(container);
  };

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

  var setAttributes = (container, attributes, decorateProposition) => {
    Object.keys(attributes).forEach((key) => {
      setAttribute(container, key, attributes[key]);
    });
    decorateProposition(container);
  };

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

  var swapImage = (container, url, decorateProposition) => {
    if (!isImage(container)) {
      return;
    }

    // Start downloading the image
    loadImage(url);
    decorateProposition(container);

    // Remove "src" so there is no flicker
    removeAttribute(container, SRC);

    // Replace the image "src"
    setAttribute(container, SRC, url);
  };

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

  var rearrangeChildren = (container, { from, to }, decorateProposition) => {
    const children = getChildren(container);
    const elementFrom = children[from];
    const elementTo = children[to];
    if (!elementFrom || !elementTo) {
      // TODO: We will need to add logging
      // to ease troubleshooting
      return;
    }
    if (from < to) {
      insertAfter(elementTo, elementFrom);
    } else {
      insertBefore(elementTo, elementFrom);
    }
    decorateProposition(elementTo);
    decorateProposition(elementFrom);
  };

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

  /**
   * Renders content into a container element.
   *
   * @param {Object} params
   * @param {Element[]} params.containers
   * @param {string} params.content
   * @param {(element: Element) => void} params.decorateProposition
   * @param {(container: Element, content: string, decorateProposition: (element: Element) => void) => Promise<void>} params.renderFunc
   * @returns {Promise<void>} A promise that resolves when the content is rendered.
   */
  const renderContent = ({
    containers,
    content,
    decorateProposition,
    renderFunc,
    renderStatusHandler,
  }) => {
    const executions = containers
      .filter(renderStatusHandler.shouldRender)
      .map(async (container) => {
        await renderFunc(container, content, decorateProposition);
        renderStatusHandler.markAsRendered(container);
      });
    return Promise.all(executions);
  };

  /**
   * Creates an action function that renders content into a container element.
   *
   * @param {Function} renderFunc - The function that performs the rendering.
   */
  const createAction = (renderFunc) => {
    /**
     * Renders content into a container element.
     *
     * @param {{ selector: string, prehidingSelector: string, content: string }} itemData - The item data containing the container selector and prehiding selector.
     * @param {(element: Element) => void} createDecorateProposition
     * @param {{ shouldRender: (element: Element) => boolean, markAsRendered: (element: Element) => void }} renderStatusHandler
     */
    return async (itemData, decorateProposition, renderStatusHandler) => {
      const {
        selector: containerSelector,
        prehidingSelector,
        content,
      } = itemData;
      hideElements(prehidingSelector);
      try {
        const containers = await awaitSelector(
          containerSelector,
          selectNodesWithEq,
        );
        renderContent({
          containers,
          content,
          decorateProposition,
          renderFunc,
          renderStatusHandler,
        });
      } finally {
        showElements(prehidingSelector);
      }
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const addPxIfMissing = (value) => {
    const hasPx = ("" + value).endsWith("px");
    return hasPx ? value : value + "px";
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var move = (container, styles, decorateProposition) => {
    const { priority, ...style } = styles;
    Object.keys(style).forEach((key) => {
      let value = style[key];
      if (key === "left" || key === "top") {
        value = addPxIfMissing(value);
      }
      setStyle(container, key, value, priority);
    });
    decorateProposition(container);
  };

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

  var collectInteractions$1 = (container, content, decorateProposition) => {
    decorateProposition(container);
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var resize = (container, styles, decorateProposition) => {
    const { priority, ...style } = styles;
    Object.keys(style).forEach((key) => {
      let value = style[key];
      if (key === "width" || key === "height") {
        value = addPxIfMissing(value);
      }
      setStyle(container, key, value, priority);
    });
    decorateProposition(container);
  };

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

  const DOM_ACTION_SET_HTML = "setHtml";
  const DOM_ACTION_CUSTOM_CODE = "customCode";
  const DOM_ACTION_SET_TEXT = "setText";
  const DOM_ACTION_SET_ATTRIBUTE = "setAttribute";
  const DOM_ACTION_SET_IMAGE_SOURCE = "setImageSource";
  const DOM_ACTION_SET_STYLE = "setStyle";
  const DOM_ACTION_MOVE = "move";
  const DOM_ACTION_RESIZE = "resize";
  const DOM_ACTION_REARRANGE = "rearrange";
  const DOM_ACTION_REMOVE = "remove";
  const DOM_ACTION_INSERT_AFTER = "insertAfter";
  const DOM_ACTION_INSERT_BEFORE = "insertBefore";
  const DOM_ACTION_REPLACE_HTML = "replaceHtml";
  const DOM_ACTION_PREPEND_HTML = "prependHtml";
  const DOM_ACTION_APPEND_HTML = "appendHtml";
  const DOM_ACTION_CLICK = "click";
  const DOM_ACTION_COLLECT_INTERACTIONS = "collectInteractions";
  var initDomActionsModules = () => {
    return {
      [DOM_ACTION_SET_HTML]: createAction(setHtml),
      [DOM_ACTION_CUSTOM_CODE]: createAction(prependHtml),
      [DOM_ACTION_SET_TEXT]: createAction(setText),
      [DOM_ACTION_SET_ATTRIBUTE]: createAction(setAttributes),
      [DOM_ACTION_SET_IMAGE_SOURCE]: createAction(swapImage),
      [DOM_ACTION_SET_STYLE]: createAction(setStyles),
      [DOM_ACTION_MOVE]: createAction(move),
      [DOM_ACTION_RESIZE]: createAction(resize),
      [DOM_ACTION_REARRANGE]: createAction(rearrangeChildren),
      [DOM_ACTION_REMOVE]: createAction(removeNode),
      [DOM_ACTION_INSERT_AFTER]: createAction(insertHtmlAfter),
      [DOM_ACTION_INSERT_BEFORE]: createAction(insertHtmlBefore),
      [DOM_ACTION_REPLACE_HTML]: createAction(replaceHtml),
      [DOM_ACTION_PREPEND_HTML]: createAction(prependHtml),
      [DOM_ACTION_APPEND_HTML]: createAction(appendHtml),
      [DOM_ACTION_COLLECT_INTERACTIONS]: createAction(collectInteractions$1),
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createCollect = ({ eventManager, mergeDecisionsMeta }) => {
    // Called when a decision is auto-rendered for the __view__ scope or a SPA view(display and empty display notification)
    return ({
      decisionsMeta = [],
      propositionAction,
      documentMayUnload = false,
      eventType = DISPLAY,
      propositionEventTypes = [getPropositionEventType(eventType)],
      viewName,
    }) => {
      const event = eventManager.createEvent();
      const data = {
        eventType,
      };
      if (viewName) {
        data.web = {
          webPageDetails: {
            viewName,
          },
        };
      }
      if (isNonEmptyArray(decisionsMeta)) {
        mergeDecisionsMeta(
          event,
          decisionsMeta,
          propositionEventTypes,
          propositionAction,
        );
      }
      event.mergeXdm(data);
      if (documentMayUnload) {
        event.documentMayUnload();
      }
      return eventManager.sendEvent(event);
    };
  };

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
  const DECISIONS_HANDLE = "personalization:decisions";
  var createFetchDataHandler = ({
    logger,
    prehidingStyle,
    showContainers,
    hideContainers,
    mergeQuery,
    processPropositions,
    createProposition,
    notificationHandler,
    consent,
  }) => {
    return ({ cacheUpdate, personalizationDetails, event, onResponse }) => {
      const { state, wasSet } = consent.current();
      if (!(state === "out" && wasSet)) {
        if (personalizationDetails.isRenderDecisions()) {
          hideContainers(prehidingStyle);
        } else {
          showContainers();
        }
      }
      mergeQuery(event, personalizationDetails.createQueryDetails());

      // This needs to be called before the response so that future sendEvent calls
      // can know to wait until this request is complete for pending display notifications.
      const handleNotifications = notificationHandler(
        personalizationDetails.isRenderDecisions(),
        personalizationDetails.isSendDisplayEvent(),
        personalizationDetails.getViewName(),
      );
      onResponse(({ response }) => {
        const handles = response.getPayloadsByType(DECISIONS_HANDLE);
        if (!isNonEmptyArray(handles)) {
          logger.logOnContentRendering({
            status: "no-offers",
            message: "No offers were returned.",
            logLevel: "info",
            detail: {
              query: personalizationDetails.createQueryDetails(),
            },
          });
        }
        const propositions = handles.map((handle) => createProposition(handle));
        const {
          page: pagePropositions = [],
          view: viewPropositions = [],
          proposition: nonRenderedPropositions = [],
        } = groupBy(propositions, (p) => p.getScopeType());
        const currentViewPropositions = cacheUpdate.update(viewPropositions);
        let render;
        let returnedPropositions;
        let returnedDecisions;
        if (personalizationDetails.isRenderDecisions()) {
          ({ render, returnedPropositions, returnedDecisions } =
            processPropositions(
              [...pagePropositions, ...currentViewPropositions],
              nonRenderedPropositions,
            ));
          if (isNonEmptyArray(pagePropositions)) {
            logger.logOnContentRendering({
              status: "rendering-started",
              message: "Started rendering propositions for page-wide scope.",
              logLevel: "info",
              detail: {
                scope: PAGE_WIDE_SCOPE,
                propositions: pagePropositions.map((proposition) =>
                  proposition.toJSON(),
                ),
              },
            });
          }
          if (isNonEmptyArray(currentViewPropositions)) {
            logger.logOnContentRendering({
              status: "rendering-started",
              message:
                "Rendering propositions started for view scope - " +
                personalizationDetails.getViewName() +
                ".",
              logLevel: "info",
              detail: {
                scope: personalizationDetails.getViewName(),
                propositions: currentViewPropositions.map((proposition) =>
                  proposition.toJSON(),
                ),
              },
            });
          }
          render().then(handleNotifications);

          // Render could take a long time especially if one of the renders
          // is waiting for html to appear on the page. We show the containers
          // immediately, and whatever renders quickly will not have flicker.
          showContainers();
        } else {
          ({ returnedPropositions, returnedDecisions } = processPropositions(
            [],
            [
              ...pagePropositions,
              ...currentViewPropositions,
              ...nonRenderedPropositions,
            ],
          ));
        }
        return {
          propositions: returnedPropositions,
          decisions: returnedDecisions,
        };
      });
    };
  };

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

  var matchesSelectorWithEq = (selector, element) => {
    if (isNotEqSelector(selector)) {
      return matchesSelector(selector, element);
    }

    // Using node selection vs matches selector, because of :eq()
    // Find all nodes using document as context
    const nodes = selectNodesWithEq(selector);
    let result = false;

    // Iterate through all the identified elements
    // and reference compare with element
    for (let i = 0; i < nodes.length; i += 1) {
      if (nodes[i] === element) {
        result = true;
        break;
      }
    }
    return result;
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const VIEW_SCOPE_TYPE = "view";
  const PAGE_SCOPE_TYPE = "page";
  const PROPOSITION_SCOPE_TYPE = "proposition";

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const cleanMetas = (metas) =>
    metas.map((meta) => {
      const { trackingLabel, scopeType, ...rest } = meta;
      return rest;
    });
  const dedupeMetas = (metas) =>
    metas.filter((meta, index) => {
      const stringifiedMeta = JSON.stringify(meta);
      return (
        index ===
        metas.findIndex(
          (innerMeta) => JSON.stringify(innerMeta) === stringifiedMeta,
        )
      );
    });

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

  const getMetasIfMatches = (clickedElement, selector, getClickMetas) => {
    const { documentElement } = document;
    let element = clickedElement;
    let i = 0;
    while (element && element !== documentElement) {
      if (matchesSelectorWithEq(selector, element)) {
        const matchedMetas = getClickMetas(selector);
        const returnValue = {
          metas: matchedMetas,
        };
        const foundMetaWithLabel = matchedMetas.find(
          (meta) => meta.trackingLabel,
        );
        if (foundMetaWithLabel) {
          returnValue.label = foundMetaWithLabel.trackingLabel;
          returnValue.weight = i;
        }
        const foundMetaWithScopeTypeView = matchedMetas.find(
          (meta) => meta.scopeType === VIEW_SCOPE_TYPE,
        );
        if (foundMetaWithScopeTypeView) {
          returnValue.viewName = foundMetaWithScopeTypeView.scope;
          returnValue.weight = i;
        }
        return returnValue;
      }
      element = element.parentNode;
      i += 1;
    }
    return {
      metas: null,
    };
  };
  var collectClicks = (clickedElement, selectors, getClickMetas) => {
    const result = [];
    let resultLabel = "";
    let resultLabelWeight = Number.MAX_SAFE_INTEGER;
    let resultViewName;
    let resultViewNameWeight = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < selectors.length; i += 1) {
      const { metas, label, weight, viewName } = getMetasIfMatches(
        clickedElement,
        selectors[i],
        getClickMetas,
      );
      if (!metas) {
        continue;
      }
      if (label && weight <= resultLabelWeight) {
        resultLabel = label;
        resultLabelWeight = weight;
      }
      if (viewName && weight <= resultViewNameWeight) {
        resultViewName = viewName;
        resultViewNameWeight = weight;
      }
      result.push(...cleanMetas(metas));
    }
    return {
      decisionsMeta: dedupeMetas(result),
      propositionActionLabel: resultLabel,
      propositionActionToken: undefined,
      viewName: resultViewName,
    };
  };

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

  var isAuthoringModeEnabled = (doc = document) => {
    return doc.location.href.indexOf("adobe_authoring_enabled") !== -1;
  };

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

  /* eslint-disable no-underscore-dangle */
  const mergeDecisionsMeta = (
    event,
    decisionsMeta,
    propositionEventTypes,
    propositionAction,
  ) => {
    // Do not send a display notification with no decisions. Even empty view changes
    // should include a proposition.
    if (decisionsMeta.length === 0) {
      return;
    }
    const propositionEventType = {};
    propositionEventTypes.forEach((type) => {
      propositionEventType[type] = EVENT_TYPE_TRUE;
    });
    const xdm = {
      _experience: {
        decisioning: {
          propositions: decisionsMeta,
          propositionEventType,
        },
      },
    };
    if (propositionAction) {
      xdm._experience.decisioning.propositionAction = propositionAction;
    }
    event.mergeXdm(xdm);
  };
  const mergeQuery = (event, details) => {
    event.mergeQuery({
      personalization: {
        ...details,
      },
    });
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const createPropositionAction = (clickLabel, clickToken) => {
    if (!clickToken && !clickLabel) {
      return undefined;
    }
    const propositionAction = {};
    if (clickLabel) {
      propositionAction.label = clickLabel;
    }
    if (clickToken) {
      propositionAction.tokens = [clickToken];
    }
    return propositionAction;
  };
  var createOnClickHandler = ({
    mergeDecisionsMeta,
    collectInteractions,
    collectClicks,
    getInteractionMetas,
    getClickMetas,
    getClickSelectors,
    autoCollectPropositionInteractions,
  }) => {
    // Called when an element qualifying for conversion within an offer is clicked.
    return ({ event, clickedElement }) => {
      const decisionsMeta = [];
      let propositionActionLabel;
      let propositionActionToken;
      let viewName;
      [
        collectInteractions(
          clickedElement,
          getInteractionMetas,
          autoCollectPropositionInteractions,
        ),
        collectClicks(clickedElement, getClickSelectors(), getClickMetas),
      ].forEach(
        ({
          decisionsMeta: curDecisionsMeta,
          propositionActionLabel: curPropositionActionLabel,
          propositionActionToken: curPropositionActionToken,
          viewName: curViewName,
        }) => {
          Array.prototype.push.apply(decisionsMeta, curDecisionsMeta);
          if (!propositionActionLabel && curPropositionActionLabel) {
            propositionActionLabel = curPropositionActionLabel;
          }
          if (!propositionActionToken && curPropositionActionToken) {
            propositionActionToken = curPropositionActionToken;
          }
          if (!viewName && curViewName) {
            viewName = curViewName;
          }
        },
      );
      if (isNonEmptyArray(decisionsMeta)) {
        const xdm = {
          eventType: INTERACT,
        };
        if (viewName) {
          xdm.web = {
            webPageDetails: {
              viewName,
            },
          };
        }
        event.mergeXdm(xdm);
        mergeDecisionsMeta(
          event,
          decisionsMeta,
          [PropositionEventType.INTERACT],
          createPropositionAction(
            propositionActionLabel,
            propositionActionToken,
          ),
        );
      }
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createViewCacheManager = ({ createProposition }) => {
    let cacheUpdateCreatedAtLeastOnce = false;
    let viewStoragePromise = Promise.resolve({});
    const getViewPropositions = (viewStorage, viewName) => {
      const viewPropositions = viewStorage[viewName.toLowerCase()];
      if (viewPropositions && viewPropositions.length > 0) {
        return viewPropositions;
      }
      const emptyViewProposition = createProposition(
        {
          scope: viewName,
          scopeDetails: {
            characteristics: {
              scopeType: VIEW_SCOPE_TYPE,
            },
          },
          items: [
            {
              schema: DEFAULT_CONTENT_ITEM,
            },
          ],
        },
        false,
      );
      return [emptyViewProposition];
    };

    // This should be called before making the request to experience edge.
    const createCacheUpdate = (viewName) => {
      const updateCacheDeferred = defer();
      cacheUpdateCreatedAtLeastOnce = true;

      // Additional updates will merge the new view propositions with the old.
      // i.e. if there are new "cart" view propositions they will overwrite the
      // old "cart" view propositions, but if there are no new "cart" view
      // propositions the old "cart" view propositions will remain.
      viewStoragePromise = viewStoragePromise.then((oldViewStorage) => {
        return updateCacheDeferred.promise
          .then((newViewStorage) => {
            return {
              ...oldViewStorage,
              ...newViewStorage,
            };
          })
          .catch(() => oldViewStorage);
      });
      return {
        update(viewPropositions) {
          const viewPropositionsWithScope = viewPropositions.filter(
            (proposition) => proposition.getScope(),
          );
          const newViewStorage = groupBy(
            viewPropositionsWithScope,
            (proposition) => proposition.getScope().toLowerCase(),
          );
          updateCacheDeferred.resolve(newViewStorage);
          if (viewName) {
            return getViewPropositions(newViewStorage, viewName);
          }
          return [];
        },
        cancel() {
          updateCacheDeferred.reject();
        },
      };
    };
    const getView = (viewName) => {
      return viewStoragePromise.then((viewStorage) =>
        getViewPropositions(viewStorage, viewName),
      );
    };
    const isInitialized = () => {
      return cacheUpdateCreatedAtLeastOnce;
    };
    return {
      createCacheUpdate,
      getView,
      isInitialized,
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createViewChangeHandler = ({
    processPropositions,
    viewCache,
    logger,
  }) => {
    return ({ personalizationDetails, onResponse }) => {
      let returnedPropositions;
      let returnedDecisions;
      const viewName = personalizationDetails.getViewName();
      onResponse(() => {
        return {
          propositions: returnedPropositions,
          decisions: returnedDecisions,
        };
      });
      return viewCache.getView(viewName).then((propositions) => {
        let render;
        if (personalizationDetails.isRenderDecisions()) {
          ({ render, returnedPropositions, returnedDecisions } =
            processPropositions(propositions));
          logger.logOnContentRendering({
            status: "rendering-started",
            message:
              "Started rendering propositions for view scope - " +
              viewName +
              ".",
            logLevel: "info",
            detail: {
              scope: viewName,
              propositions: propositions.map((proposition) =>
                proposition.toJSON(),
              ),
            },
          });
          return render();
        }
        ({ returnedPropositions, returnedDecisions } = processPropositions(
          [],
          propositions,
        ));
        return [];
      });
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const metasToArray = (metas) => {
    return Object.keys(metas).map((key) => {
      return {
        id: key,
        ...metas[key],
      };
    });
  };
  var createClickStorage = () => {
    const clickStorage = {};
    const storeClickMeta = ({
      selector,
      meta: { id, scope, scopeDetails, trackingLabel, scopeType },
    }) => {
      if (!clickStorage[selector]) {
        clickStorage[selector] = {};
      }
      clickStorage[selector][id] = {
        scope,
        scopeDetails,
        trackingLabel,
        scopeType,
      };
    };
    const getClickSelectors = () => {
      return Object.keys(clickStorage);
    };
    const getClickMetas = (selector) => {
      const metas = clickStorage[selector];
      if (!metas) {
        return {};
      }
      return metasToArray(clickStorage[selector]);
    };
    return {
      storeClickMeta,
      getClickSelectors,
      getClickMetas,
    };
  };

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createInteractionStorage = () => {
    const clickMetaStorage = {};
    /*
          clickMetaStorage example.
          `abc' and 'def' are proposition IDs.  1 is an interact id.  The object with an id, scope and scopeDetails
          is the notification.
             {
              1: {
                "abc": { "id": "abc", "scope": "proposition", "scopeDetails": {} },
                "def": { "id": "def", "scope": "proposition", "scopeDetails": {} }
              }
            }
    */

    const clickItemStorage = {};
    /*
          clickItemStorage example.
          `abc' and 'def' are proposition IDs.  1 is an interact id.  The sets contain proposition-item IDs which
          are used in notifications that are sent.
             {
              1: {
                abc: new Set(["itemAAA", "itemCCC"]),
                def: new Set(["itemEEE", "itemFFF"]),
              },
            }
    */

    const storeInteractionMeta = (
      propositionId,
      itemId,
      scopeType,
      notification,
      interactId,
    ) => {
      interactId = parseInt(interactId, 10);
      if (!clickMetaStorage[interactId]) {
        clickMetaStorage[interactId] = {};
        clickItemStorage[interactId] = {};
      }
      if (!clickItemStorage[interactId][propositionId]) {
        clickItemStorage[interactId][propositionId] = new Set();
      }
      clickItemStorage[interactId][propositionId].add(itemId);
      clickMetaStorage[interactId][propositionId] = {
        ...notification,
        scopeType,
      };
    };
    const getInteractionMetas = (interactIds) => {
      if (!Array.isArray(interactIds) || interactIds.length === 0) {
        return [];
      }
      return Object.values(
        interactIds
          .map((value) => parseInt(value, 10))
          .reduce((metaMap, interactId) => {
            Object.keys(clickMetaStorage[interactId] || {}).forEach(
              (propositionId) => {
                if (!metaMap[propositionId]) {
                  metaMap[propositionId] = {
                    proposition: clickMetaStorage[interactId][propositionId],
                    items: new Set(),
                  };
                }
                metaMap[propositionId].items = new Set([
                  ...metaMap[propositionId].items,
                  ...clickItemStorage[interactId][propositionId],
                ]);
              },
            );
            return metaMap;
          }, {}),
      ).map(({ proposition, items }) => ({
        ...proposition,
        items: Array.from(items).map((id) => ({
          id,
        })),
      }));
    };
    return {
      storeInteractionMeta,
      getInteractionMetas,
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const isInteractionTrackingItem = (schema, actionType) =>
    schema === JSON_CONTENT_ITEM &&
    actionType === DOM_ACTION_COLLECT_INTERACTIONS;
  const SUPPORTED_SCHEMAS = {
    [DOM_ACTION]: () => true,
    [HTML_CONTENT_ITEM]: () => true,
    [JSON_CONTENT_ITEM]: isInteractionTrackingItem,
    [MESSAGE_IN_APP]: () => true,
    [DEFAULT_CONTENT_ITEM]: () => true,
  };
  const filterItemsPredicate = (schema, actionType) =>
    typeof SUPPORTED_SCHEMAS[schema] === "function" &&
    SUPPORTED_SCHEMAS[schema](schema, actionType);
  var createApplyPropositions = ({
    processPropositions,
    createProposition,
    renderedPropositions,
    viewCache,
  }) => {
    const updatePropositionItems = ({ items, metadataForScope = {} }) => {
      const { actionType, selector } = metadataForScope;
      return items
        .filter((item) => filterItemsPredicate(item.schema, actionType))
        .map((item) => {
          const { schema } = item;
          if (
            schema !== HTML_CONTENT_ITEM &&
            !isInteractionTrackingItem(schema, actionType)
          ) {
            return {
              ...item,
            };
          }
          if (!isEmptyObject(metadataForScope)) {
            return {
              ...item,
              schema: isInteractionTrackingItem(schema, actionType)
                ? DOM_ACTION
                : schema,
              data: {
                ...item.data,
                selector,
                type: actionType,
              },
            };
          }
          return undefined;
        })
        .filter((item) => item);
    };
    const filterPropositionsPredicate = (proposition) => {
      return !(
        proposition.scope === PAGE_WIDE_SCOPE && proposition.renderAttempted
      );
    };
    const preparePropositions = ({ propositions, metadata }) => {
      return propositions
        .filter(filterPropositionsPredicate)
        .map((proposition) => {
          if (isNonEmptyArray(proposition.items)) {
            const { id, scope, scopeDetails } = proposition;
            return {
              id,
              scope,
              scopeDetails,
              items: updatePropositionItems({
                items: proposition.items,
                metadataForScope: metadata[proposition.scope],
              }),
            };
          }
          return proposition;
        })
        .filter((proposition) => isNonEmptyArray(proposition.items));
    };
    return ({ propositions = [], metadata = {}, viewName }) => {
      // We need to immediately call concat so that subsequent sendEvent
      // calls will wait for applyPropositions to complete before executing.
      const renderedPropositionsDeferred = defer();
      renderedPropositions.concat(renderedPropositionsDeferred.promise);
      const propositionsToExecute = preparePropositions({
        propositions,
        metadata,
      }).map((proposition) => createProposition(proposition));
      return Promise.resolve()
        .then(() => {
          if (viewName) {
            return viewCache.getView(viewName);
          }
          return [];
        })
        .then((additionalPropositions) => {
          const { render, returnedPropositions } = processPropositions([
            ...propositionsToExecute,
            ...additionalPropositions,
          ]);
          render().then(renderedPropositionsDeferred.resolve);
          return {
            propositions: returnedPropositions,
          };
        });
    };
  };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createGetPageLocation =
    ({ window }) =>
    () => {
      return window.location;
    };

  /*
  Copyright 2022 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createSetTargetMigration = ({ targetMigrationEnabled }) => {
    if (targetMigrationEnabled) {
      return (request) => {
        request.getPayload().mergeMeta({
          target: {
            migration: true,
          },
        });
      };
    }
    return noop;
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const TARGET_BODY_SELECTOR = "BODY > *:eq(0)";
  var remapCustomCodeOffers = (action) => {
    const { selector, type } = action;
    if (type !== DOM_ACTION_CUSTOM_CODE) {
      return action;
    }
    if (selector !== TARGET_BODY_SELECTOR) {
      return action;
    }
    return {
      ...action,
      ...{
        selector: "BODY",
      },
    };
  };

  /*
  Copyright 2021 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const HEAD_TAGS_SELECTOR = "SCRIPT,LINK,STYLE";
  const filterHeadContent = (content) => {
    const container = createFragment(content);
    const headNodes = selectNodes(HEAD_TAGS_SELECTOR, container);
    return headNodes.map((node) => node.outerHTML).join("");
  };
  var remapHeadOffers = (action) => {
    const result = {
      ...action,
    };
    const { content, selector } = result;
    if (isBlankString(content)) {
      return result;
    }
    if (selector == null) {
      return result;
    }
    const container = selectNodesWithEq(selector);
    if (!is(container[0], HEAD)) {
      return result;
    }
    result.type = DOM_ACTION_APPEND_HTML;
    result.content = filterHeadContent(content);
    return result;
  };

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

  var createPreprocess = (preprocessors) => (action) => {
    if (!action) {
      return action;
    }
    return preprocessors.reduce(
      (processed, fn) => ({
        ...processed,
        ...fn(processed),
      }),
      action,
    );
  };

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

  var injectCreateProposition = ({ preprocess, isPageWideSurface }) => {
    const createItem = (item, proposition) => {
      const {
        id,
        schema,
        data,
        characteristics: { trackingLabel } = {},
      } = item;
      const schemaType = data ? data.type : undefined;
      const processedData = preprocess(data);
      return {
        getId() {
          return id;
        },
        getSchema() {
          return schema;
        },
        getSchemaType() {
          return schemaType;
        },
        getData() {
          return processedData;
        },
        getProposition() {
          return proposition;
        },
        getTrackingLabel() {
          return trackingLabel;
        },
        getOriginalItem() {
          return item;
        },
        toString() {
          return JSON.stringify(item);
        },
        toJSON() {
          return item;
        },
      };
    };
    return (
      payload,
      visibleInReturnedItems = true,
      shouldSuppressDisplay = false,
    ) => {
      const { id, scope, scopeDetails, items = [] } = payload;
      const { characteristics: { scopeType } = {} } = scopeDetails || {};
      return {
        getScope() {
          return scope;
        },
        getScopeType() {
          if (scope === PAGE_WIDE_SCOPE || isPageWideSurface(scope)) {
            return PAGE_SCOPE_TYPE;
          }
          if (scopeType === VIEW_SCOPE_TYPE) {
            return VIEW_SCOPE_TYPE;
          }
          return PROPOSITION_SCOPE_TYPE;
        },
        getItems() {
          return items.map((item) => createItem(item, this));
        },
        getNotification() {
          return {
            id,
            scope,
            scopeDetails,
          };
        },
        getId() {
          return id;
        },
        toJSON() {
          return payload;
        },
        shouldSuppressDisplay() {
          return shouldSuppressDisplay;
        },
        addToReturnValues(
          propositions,
          decisions,
          includedItems,
          renderAttempted,
        ) {
          if (visibleInReturnedItems) {
            propositions.push({
              ...payload,
              items: includedItems.map((i) => i.getOriginalItem()),
              renderAttempted,
            });
            if (!renderAttempted) {
              decisions.push({
                ...payload,
                items: includedItems.map((i) => i.getOriginalItem()),
              });
            }
          }
        },
      };
    };
  };

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
  var createAsyncArray = () => {
    let latest = Promise.resolve([]);
    return {
      concat(promise) {
        latest = latest.then((existingPropositions) => {
          return promise
            .then((newPropositions) => {
              return existingPropositions.concat(newPropositions);
            })
            .catch(() => {
              return existingPropositions;
            });
        });
      },
      /**
       * Clears the saved propositions, waiting until the next propositions are resolved and available.
       *
       * @returns {Promise<Array>} A promise that resolves to the latest propositions.
       */
      clear() {
        const oldLatest = latest;
        latest = Promise.resolve([]);
        return oldLatest;
      },
    };
  };

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
  var processDefaultContent = () => {
    return {
      render: noop,
      setRenderAttempted: true,
      includeInNotification: true,
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const ALWAYS = "always";
  const NEVER = "never";
  const DECORATED_ELEMENTS_ONLY = "decoratedElementsOnly";
  const PROPOSITION_INTERACTION_TYPES = [
    ALWAYS,
    NEVER,
    DECORATED_ELEMENTS_ONLY,
  ];

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const INTERACT_ID_DATA_ATTRIBUTE = "data-aep-interact-id";
  const CLICK_LABEL_DATA_ATTRIBUTE = "data-aep-click-label";
  const CLICK_TOKEN_DATA_ATTRIBUTE = "data-aep-click-token";
  let lastInteractId = 0;
  const getInteractId = (propositionId, existingInteractId) => {
    if (existingInteractId) {
      return parseInt(existingInteractId, 10);
    }
    return ++lastInteractId;
  };
  const interactionTrackingSupported = (
    autoCollectPropositionInteractions,
    decisionProvider,
  ) => {
    if (!autoCollectPropositionInteractions) {
      return false;
    }
    if (!autoCollectPropositionInteractions[decisionProvider]) {
      return false;
    }
    return [ALWAYS, DECORATED_ELEMENTS_ONLY].includes(
      autoCollectPropositionInteractions[decisionProvider],
    );
  };
  const createDecorateProposition = (
    autoCollectPropositionInteractions,
    type,
    propositionId,
    itemId,
    trackingLabel,
    scopeType,
    notification,
    storeInteractionMeta,
  ) => {
    const { scopeDetails = {} } = notification;
    const { decisionProvider } = scopeDetails;
    if (
      !interactionTrackingSupported(
        autoCollectPropositionInteractions,
        decisionProvider,
      ) &&
      type !== DOM_ACTION_CLICK
    ) {
      return noop;
    }
    return (element) => {
      if (!element.tagName) {
        return;
      }
      const interactId = getInteractId(
        propositionId,
        getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE),
      );
      storeInteractionMeta(
        propositionId,
        itemId,
        scopeType,
        notification,
        interactId,
      );
      setAttribute(element, INTERACT_ID_DATA_ATTRIBUTE, interactId);
      if (trackingLabel && !getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)) {
        setAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE, trackingLabel);
      }
    };
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Creates a handler to manage the rendering status of elements in personalization
   *
   * @param {string} scopeType - The type of scope (e.g. 'view', 'page')
   * @param {string} itemId - The unique identifier for the item being rendered
   */
  var createRenderStatusHandler = (scopeType, itemId) => {
    // We only care about tracking renders for view scope
    if (scopeType !== VIEW_SCOPE_TYPE) {
      return {
        shouldRender: () => true,
        markAsRendered: () => {},
      };
    }
    return {
      /**
       * Determines if an element should be rendered based on scopeType and previous render status
       *
       * @param {Element|null} propositionContainer - The DOM element to check
       * @returns {boolean} True if the element should be rendered, false otherwise
       */
      shouldRender: (propositionContainer) => {
        if (!propositionContainer) {
          return true;
        }
        const previouslyRendered = (
          propositionContainer.dataset.adobePropositionIds ?? ""
        ).split(",");
        return !previouslyRendered.includes(itemId);
      },
      /**
       * Marks an element as rendered by setting a data attribute
       *
       * @param {Element} propositionContainer - The DOM element to mark as rendered
       * @returns {void}
       */
      markAsRendered: (propositionContainer) => {
        const previouslyRendered = (
          propositionContainer.dataset.adobePropositionIds ?? ""
        ).split(",");
        if (!previouslyRendered.includes(itemId)) {
          previouslyRendered.push(itemId);
        }
        propositionContainer.dataset.adobePropositionIds = previouslyRendered
          .sort()
          .join(",");
      },
    };
  };

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

  var createProcessDomAction =
    ({
      modules,
      logger,
      storeInteractionMeta,
      storeClickMeta,
      autoCollectPropositionInteractions,
    }) =>
    (item) => {
      const { type, selector } = item.getData() || {};
      if (!type) {
        logger.warn("Invalid DOM action data: missing type.", item.getData());
        return {
          setRenderAttempted: false,
          includeInNotification: false,
        };
      }
      if (type === DOM_ACTION_CLICK) {
        if (!selector) {
          logger.warn(
            "Invalid DOM action data: missing selector.",
            item.getData(),
          );
          return {
            setRenderAttempted: false,
            includeInNotification: false,
          };
        }
        storeClickMeta({
          selector,
          meta: {
            ...item.getProposition().getNotification(),
            trackingLabel: item.getTrackingLabel(),
            scopeType: item.getProposition().getScopeType(),
          },
        });
        return {
          setRenderAttempted: true,
          includeInNotification: false,
        };
      }
      if (!modules[type]) {
        logger.warn("Invalid DOM action data: unknown type.", item.getData());
        return {
          setRenderAttempted: false,
          includeInNotification: false,
        };
      }
      const renderStatusHandler = createRenderStatusHandler(
        item.getProposition().getScopeType(),
        item.getId(),
      );
      const decorateProposition = createDecorateProposition(
        autoCollectPropositionInteractions,
        type,
        item.getProposition().getId(),
        item.getId(),
        item.getTrackingLabel(),
        item.getProposition().getScopeType(),
        item.getProposition().getNotification(),
        storeInteractionMeta,
      );
      return {
        render: () =>
          modules[type](
            item.getData(),
            decorateProposition,
            renderStatusHandler,
          ),
        setRenderAttempted: true,
        includeInNotification: true,
      };
    };

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
  var createProcessHtmlContent =
    ({
      modules,
      logger,
      storeInteractionMeta,
      autoCollectPropositionInteractions,
    }) =>
    (item) => {
      const { type, selector } = item.getData() || {};
      if (!selector || !type) {
        return {
          setRenderAttempted: false,
          includeInNotification: false,
        };
      }
      if (!modules[type]) {
        logger.warn("Invalid HTML content data", item.getData());
        return {
          setRenderAttempted: false,
          includeInNotification: false,
        };
      }
      const decorateProposition = createDecorateProposition(
        autoCollectPropositionInteractions,
        type,
        item.getProposition().getId(),
        item.getId(),
        item.getTrackingLabel(),
        item.getProposition().getScopeType(),
        item.getProposition().getNotification(),
        storeInteractionMeta,
      );
      const renderStatusHandler = createRenderStatusHandler(
        item.getProposition().getScopeType(),
        item.getId(),
      );
      return {
        render: () => {
          return modules[type](
            item.getData(),
            decorateProposition,
            renderStatusHandler,
          );
        },
        setRenderAttempted: true,
        includeInNotification: true,
      };
    };

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
  const REDIRECT_HIDING_ELEMENT = "BODY";
  var createProcessRedirect =
    ({ logger, executeRedirect, collect }) =>
    (item) => {
      const { content } = item.getData() || {};
      if (!content) {
        logger.warn("Invalid Redirect data", item.getData());
        return {};
      }
      const render = () => {
        hideElements(REDIRECT_HIDING_ELEMENT);
        return collect({
          decisionsMeta: [item.getProposition().getNotification()],
          documentMayUnload: true,
        })
          .then(() => {
            logger.logOnContentRendering({
              status: "rendering-redirect",
              detail: {
                propositionDetails: item.getProposition().getNotification(),
                redirect: content,
              },
              message: "Redirect action " + item.toString() + " executed.",
              logLevel: "info",
            });
            return executeRedirect(content);
            // Execute redirect will never resolve. If there are bottom of page events that are waiting
            // for display notifications from this request, they will never run because this promise will
            // not resolve. This is intentional because we don't want to run bottom of page events if
            // there is a redirect.
          })
          .catch((error) => {
            showElements(REDIRECT_HIDING_ELEMENT);
            throw error;
          });
      };
      return {
        render,
        setRenderAttempted: true,
        onlyRenderThis: true,
      };
    };

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

  var createProcessPropositions = ({ schemaProcessors, logger }) => {
    const wrapRenderWithLogging = (render, item) => () => {
      return Promise.resolve()
        .then(render)
        .then(() => {
          if (logger.enabled) {
            logger.info("Action " + item.toString() + " executed.");
          }
          return item.toJSON();
        })
        .catch((error) => {
          const { message, stack } = error;
          const warning =
            "Failed to execute action " +
            item.toString() +
            ". " +
            message +
            " " +
            stack;
          logger.logOnContentRendering({
            status: "rendering-failed",
            detail: {
              propositionDetails: item.getProposition().getNotification(),
              item: item.toJSON(),
            },
            error,
            message: warning,
            logLevel: "warn",
          });
          return undefined;
        });
    };
    const renderItems = async (renderers, meta) => {
      const results = await Promise.allSettled(
        renderers.map((renderer) => renderer()),
      );
      const successes = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      // as long as at least one renderer succeeds, we want to add the notification
      // to the display notifications
      if (meta && isNonEmptyArray(successes)) {
        return {
          ...meta,
          items: successes,
        };
      }
      return undefined;
    };
    const processItem = (item) => {
      const processor = schemaProcessors[item.getSchema()];
      if (!processor) {
        return {};
      }
      return processor(item);
    };
    const processItems = ({
      renderers: existingRenderers,
      returnedPropositions: existingReturnedPropositions,
      returnedDecisions: existingReturnedDecisions,
      items,
      proposition,
    }) => {
      let renderers = [...existingRenderers];
      let returnedPropositions = [...existingReturnedPropositions];
      let returnedDecisions = [...existingReturnedDecisions];
      let renderedItems = [];
      let nonRenderedItems = [];
      let itemRenderers = [];
      let atLeastOneWithNotification = false;
      let render;
      let setRenderAttempted;
      let includeInNotification;
      let onlyRenderThis = false;
      let i = 0;
      let item;
      while (items.length > i) {
        item = items[i];
        ({ render, setRenderAttempted, includeInNotification, onlyRenderThis } =
          processItem(item));
        if (onlyRenderThis) {
          returnedPropositions = [];
          returnedDecisions = [];
          if (setRenderAttempted) {
            renderedItems = [item];
            nonRenderedItems = [];
          } else {
            renderedItems = [];
            nonRenderedItems = [item];
          }
          renderers = [];
          itemRenderers = [render];
          atLeastOneWithNotification = includeInNotification;
          break;
        }
        if (render) {
          itemRenderers.push(wrapRenderWithLogging(render, item));
        }
        if (includeInNotification) {
          atLeastOneWithNotification = true;
        }
        if (setRenderAttempted) {
          renderedItems.push(item);
        } else {
          nonRenderedItems.push(item);
        }
        i += 1;
      }
      if (itemRenderers.length > 0) {
        const meta = atLeastOneWithNotification
          ? proposition.getNotification()
          : undefined;
        renderers.push(() => renderItems(itemRenderers, meta));
      } else if (atLeastOneWithNotification) {
        renderers.push(() => Promise.resolve(proposition.getNotification()));
      }
      if (renderedItems.length > 0) {
        proposition.addToReturnValues(
          returnedPropositions,
          returnedDecisions,
          renderedItems,
          true,
        );
      }
      if (nonRenderedItems.length > 0) {
        proposition.addToReturnValues(
          returnedPropositions,
          returnedDecisions,
          nonRenderedItems,
          false,
        );
      }
      return {
        renderers,
        returnedPropositions,
        returnedDecisions,
        onlyRenderThis,
      };
    };
    return (renderPropositions, nonRenderPropositions = []) => {
      let renderers = [];
      let returnedPropositions = [];
      let returnedDecisions = [];
      let onlyRenderThis;
      let i = 0;
      let proposition;
      let items;
      while (renderPropositions.length > i) {
        proposition = renderPropositions[i];
        items = proposition.getItems();
        ({
          renderers,
          returnedPropositions,
          returnedDecisions,
          onlyRenderThis,
        } = processItems({
          renderers,
          returnedPropositions,
          returnedDecisions,
          items,
          proposition,
        }));
        if (onlyRenderThis) {
          break;
        }
        i += 1;
      }
      if (onlyRenderThis) {
        // if onlyRenderThis is true, that means returnedPropositions and returnedDecisions
        // only contains the proposition that triggered only rendering this. We need to
        // add the other propositions to the returnedPropositions and returnedDecisions.
        renderPropositions.forEach((p, index) => {
          if (index !== i) {
            p.addToReturnValues(
              returnedPropositions,
              returnedDecisions,
              p.getItems(),
              false,
            );
          }
        });
      }
      nonRenderPropositions.forEach((p) => {
        p.addToReturnValues(
          returnedPropositions,
          returnedDecisions,
          p.getItems(),
          false,
        );
      });
      const render = () => {
        return Promise.all(renderers.map((renderer) => renderer())).then(
          (metas) => {
            const propositions = metas.filter((meta) => meta);
            const renderedPropositions = propositions.map((prop) => {
              const { id, scope, scopeDetails } = prop;
              return {
                id,
                scope,
                scopeDetails,
              };
            });
            if (isNonEmptyArray(propositions)) {
              const propsByScope = groupBy(propositions, (p) => p.scope);
              logger.logOnContentRendering({
                status: "rendering-succeeded",
                detail: {
                  ...propsByScope,
                },
                message:
                  "Scopes: " +
                  JSON.stringify(propsByScope) +
                  " successfully executed.",
                logLevel: "info",
              });
            }
            return renderedPropositions;
          },
        );
      };
      return {
        returnedPropositions,
        returnedDecisions,
        render,
      };
    };
  };

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

  // When multiple In-App messages propositions are returned, we need to show only one
  // of them (the one with lowest rank). This function keep track of the number of
  // times it was called. It returns false for the first proposition that contains
  // In-App messages items, true afterwards.
  const createShouldSuppressDisplay = () => {
    let count = 0;
    return (proposition) => {
      const { items = [] } = proposition;
      if (!items.some((item) => item.schema === MESSAGE_IN_APP)) {
        return false;
      }
      count += 1;
      return count > 1;
    };
  };
  var createOnDecisionHandler = ({
    processPropositions,
    createProposition,
    notificationHandler,
  }) => {
    return ({ renderDecisions, propositions, event, personalization = {} }) => {
      if (!renderDecisions) {
        return Promise.resolve();
      }
      const { sendDisplayEvent = true } = personalization;
      const viewName = event ? event.getViewName() : undefined;
      const shouldSuppressDisplay = createShouldSuppressDisplay();
      const propositionsToExecute = propositions.map((proposition) =>
        createProposition(
          proposition,
          true,
          shouldSuppressDisplay(proposition),
        ),
      );
      const { render, returnedPropositions } = processPropositions(
        propositionsToExecute,
      );
      const handleNotifications = notificationHandler(
        renderDecisions,
        sendDisplayEvent,
        viewName,
      );
      const propositionsById = propositionsToExecute.reduce(
        (tot, proposition) => {
          tot[proposition.getId()] = proposition;
          return tot;
        },
        {},
      );
      render().then((decisionsMeta) => {
        const decisionsMetaDisplay = decisionsMeta.filter(
          (meta) => !propositionsById[meta.id].shouldSuppressDisplay(),
        );
        const decisionsMetaSuppressed = decisionsMeta.filter((meta) =>
          propositionsById[meta.id].shouldSuppressDisplay(),
        );
        handleNotifications(decisionsMetaDisplay, decisionsMetaSuppressed);
      });
      return Promise.resolve({
        propositions: returnedPropositions,
      });
    };
  };

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
  const TEXT_HTML = "text/html";
  const APPLICATION_JSON = "application/json";

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
  const DEFAULT_CONTENT = "defaultContent";
  const expectedProps = ["content", "contentType"];
  const expectedContentProps = ["mobileParameters", "webParameters", "html"];
  const isValidInAppMessage = (data, logger) => {
    for (let i = 0; i < expectedProps.length; i += 1) {
      const prop = expectedProps[i];
      if (!Object.prototype.hasOwnProperty.call(data, prop)) {
        logger.warn(
          "Invalid in-app message data: missing property '" + prop + "'.",
          data,
        );
        return false;
      }
    }
    const { content, contentType } = data;
    if (contentType === APPLICATION_JSON) {
      for (let i = 0; i < expectedContentProps.length; i += 1) {
        const prop = expectedContentProps[i];
        if (!Object.prototype.hasOwnProperty.call(content, prop)) {
          logger.warn(
            "Invalid in-app message data.content: missing property '" +
              prop +
              "'.",
            data,
          );
          return false;
        }
      }
    }
    return true;
  };
  var createProcessInAppMessage = ({ modules, logger }) => {
    return (item) => {
      const data = item.getData();
      const proposition = item.getProposition();
      const meta = {
        ...proposition.getNotification(),
      };
      const shouldSuppressDisplay = proposition.shouldSuppressDisplay();
      if (!data) {
        logger.warn("Invalid in-app message data: undefined.", data);
        return {};
      }
      const { type = DEFAULT_CONTENT } = data;
      if (!modules[type]) {
        logger.warn("Invalid in-app message data: unknown type.", data);
        return {};
      }
      if (!isValidInAppMessage(data, logger)) {
        return {};
      }
      if (!meta) {
        logger.warn("Invalid in-app message meta: undefined.", meta);
        return {};
      }
      return {
        render: () => {
          return shouldSuppressDisplay
            ? null
            : modules[type]({
                ...data,
                meta,
              });
        },
        setRenderAttempted: true,
        includeInNotification: true,
      };
    };
  };

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
  const removeElementById = (id) => {
    const element = selectNodes("#" + id, document);
    if (element && element.length > 0) {
      removeNode(element[0]);
    }
  };
  const parseAnchor = (anchor) => {
    const nothing = {};
    if (!anchor || anchor.tagName.toLowerCase() !== "a") {
      return nothing;
    }
    const { href } = anchor;
    if (!href || !href.startsWith("adbinapp://")) {
      return nothing;
    }
    const hrefParts = href.split("?");
    const action = hrefParts[0].split("://")[1];
    const label = anchor.innerText;
    const uuid = anchor.getAttribute("data-uuid") || "";
    let interaction;
    let link;
    if (isNonEmptyArray(hrefParts)) {
      const queryParams = queryString.parse(hrefParts[1]);
      interaction = queryParams.interaction || "";
      link = decodeUriComponentSafely(queryParams.link || "");
    }
    return {
      action,
      interaction,
      link,
      label,
      uuid,
    };
  };

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

  var createRedirect =
    (window) =>
    (url, preserveHistory = false) => {
      if (preserveHistory) {
        window.location.href = url;
      } else {
        window.location.replace(url);
      }
      // Return a promise that never resolves because redirects never complete
      // within the current page.
      return new Promise(() => {});
    };

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

  const MESSAGING_CONTAINER_ID = "alloy-messaging-container";
  const OVERLAY_CONTAINER_ID = "alloy-overlay-container";
  const IFRAME_ID = "alloy-content-iframe";
  const dismissMessage = () =>
    [MESSAGING_CONTAINER_ID, OVERLAY_CONTAINER_ID].forEach(removeElementById);
  const createIframeClickHandler = (
    interact,
    navigateToUrl = createRedirect(window),
  ) => {
    return (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const { target } = event;
      const anchor =
        target.tagName.toLowerCase() === "a" ? target : target.closest("a");
      if (!anchor) {
        return;
      }
      const { action, interaction, link, label, uuid } = parseAnchor(anchor);
      interact(action, {
        label,
        id: interaction,
        uuid,
        link,
      });
      if (action === "dismiss") {
        dismissMessage();
      }
      if (isNonEmptyString(link) && link.length > 0) {
        navigateToUrl(link, true);
      }
    };
  };
  const createIframe = (htmlContent, clickHandler) => {
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlContent, TEXT_HTML);
    const scriptTag = htmlDocument.querySelector("script");
    if (scriptTag) {
      scriptTag.setAttribute("nonce", getNonce());
    }
    const element = createNode("iframe", {
      src: URL.createObjectURL(
        new Blob([htmlDocument.documentElement.outerHTML], {
          type: "text/html",
        }),
      ),
      id: IFRAME_ID,
    });
    element.addEventListener("load", () => {
      const { addEventListener } =
        element.contentDocument || element.contentWindow.document;
      addEventListener("click", clickHandler);
    });
    return element;
  };
  const renderMessage = (iframe, webParameters, container, overlay) => {
    [
      {
        id: OVERLAY_CONTAINER_ID,
        element: overlay,
      },
      {
        id: MESSAGING_CONTAINER_ID,
        element: container,
      },
      {
        id: IFRAME_ID,
        element: iframe,
      },
    ].forEach(({ id, element }) => {
      const { style = {}, params = {} } = webParameters[id];
      Object.assign(element.style, style);
      const {
        parentElement = "body",
        insertionMethod = "appendChild",
        enabled = true,
      } = params;
      const parent = document.querySelector(parentElement);
      if (enabled && parent && typeof parent[insertionMethod] === "function") {
        parent[insertionMethod](element);
      }
    });
  };
  const buildStyleFromMobileParameters = (mobileParameters) => {
    const {
      verticalAlign,
      width,
      horizontalAlign,
      backdropColor,
      height,
      cornerRadius,
      horizontalInset,
      verticalInset,
      uiTakeover = false,
    } = mobileParameters;
    const style = {
      width: width ? width + "%" : "100%",
      backgroundColor: backdropColor || "rgba(0, 0, 0, 0.5)",
      borderRadius: cornerRadius ? cornerRadius + "px" : "0px",
      border: "none",
      position: uiTakeover ? "fixed" : "relative",
      overflow: "hidden",
    };
    if (horizontalAlign === "left") {
      style.left = horizontalInset ? horizontalInset + "%" : "0";
    } else if (horizontalAlign === "right") {
      style.right = horizontalInset ? horizontalInset + "%" : "0";
    } else if (horizontalAlign === "center") {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    }
    if (verticalAlign === "top") {
      style.top = verticalInset ? verticalInset + "%" : "0";
    } else if (verticalAlign === "bottom") {
      style.position = "fixed";
      style.bottom = verticalInset ? verticalInset + "%" : "0";
    } else if (verticalAlign === "center") {
      style.top = "50%";
      style.transform =
        (horizontalAlign === "center" ? style.transform + " " : "") +
        "translateY(-50%)";
      style.display = "flex";
      style.alignItems = "center";
      style.justifyContent = "center";
    }
    if (height) {
      style.height = height + "vh";
    } else {
      style.height = "100%";
    }
    return style;
  };
  const mobileOverlay = (mobileParameters) => {
    const { backdropOpacity, backdropColor } = mobileParameters;
    const opacity = backdropOpacity || 0.5;
    const color = backdropColor || "#FFFFFF";
    const style = {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "transparent",
      opacity,
      backgroundColor: color,
    };
    return style;
  };
  const REQUIRED_PARAMS = ["enabled", "parentElement", "insertionMethod"];
  const isValidWebParameters = (webParameters) => {
    if (!webParameters) {
      return false;
    }
    const ids = Object.keys(webParameters);
    if (!ids.includes(MESSAGING_CONTAINER_ID)) {
      return false;
    }
    if (!ids.includes(OVERLAY_CONTAINER_ID)) {
      return false;
    }
    const valuesArray = Object.values(webParameters);
    for (let i = 0; i < valuesArray.length; i += 1) {
      if (!boundObjectOf(valuesArray[i], "style")) {
        return false;
      }
      if (!boundObjectOf(valuesArray[i], "params")) {
        return false;
      }
      for (let j = 0; j < REQUIRED_PARAMS.length; j += 1) {
        if (!boundObjectOf(valuesArray[i].params, REQUIRED_PARAMS[j])) {
          return false;
        }
      }
    }
    return true;
  };
  const generateWebParameters = (mobileParameters) => {
    if (!mobileParameters) {
      return undefined;
    }
    const { uiTakeover = false } = mobileParameters;
    return {
      [IFRAME_ID]: {
        style: {
          border: "none",
          width: "100%",
          height: "100%",
        },
        params: {
          enabled: true,
          parentElement: "#alloy-messaging-container",
          insertionMethod: "appendChild",
        },
      },
      [MESSAGING_CONTAINER_ID]: {
        style: buildStyleFromMobileParameters(mobileParameters),
        params: {
          enabled: true,
          parentElement: "body",
          insertionMethod: "appendChild",
        },
      },
      [OVERLAY_CONTAINER_ID]: {
        style: mobileOverlay(mobileParameters),
        params: {
          enabled: uiTakeover === true,
          parentElement: "body",
          insertionMethod: "appendChild",
        },
      },
    };
  };

  // eslint-disable-next-line default-param-last
  const displayHTMLContentInIframe = (settings = {}, interact) => {
    dismissMessage();
    const { content, contentType, mobileParameters } = settings;
    let { webParameters } = settings;
    if (contentType !== TEXT_HTML) {
      return;
    }
    const container = createNode("div", {
      id: MESSAGING_CONTAINER_ID,
    });
    const iframe = createIframe(content, createIframeClickHandler(interact));
    const overlay = createNode("div", {
      id: OVERLAY_CONTAINER_ID,
    });
    if (!isValidWebParameters(webParameters)) {
      webParameters = generateWebParameters(mobileParameters);
    }
    if (!webParameters) {
      return;
    }
    renderMessage(iframe, webParameters, container, overlay);
  };
  var displayIframeContent = (settings, collect) => {
    return new Promise((resolve) => {
      const { meta } = settings;
      displayHTMLContentInIframe(settings, (action, propositionAction) => {
        const propositionEventTypes = {};
        propositionEventTypes[PropositionEventType.INTERACT] = EVENT_TYPE_TRUE;
        if (Object.values(PropositionEventType).indexOf(action) !== -1) {
          propositionEventTypes[action] = EVENT_TYPE_TRUE;
        }
        collect({
          decisionsMeta: [meta],
          propositionAction,
          eventType: INTERACT,
          propositionEventTypes: Object.keys(propositionEventTypes),
        });
      });
      resolve({
        meta,
      });
    });
  };

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
  var initInAppMessageActionsModules = (collect) => {
    return {
      defaultContent: (settings) => displayIframeContent(settings, collect),
    };
  };

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
  var createNotificationHandler = (collect, renderedPropositions) => {
    return (isRenderDecisions, isSendDisplayEvent, viewName) => {
      if (!isRenderDecisions) {
        // If we aren't rendering anything, then we don't need to sendDisplayEvents.
        return () => undefined;
      }
      if (!isSendDisplayEvent) {
        const renderedPropositionsDeferred = defer();
        renderedPropositions.concat(renderedPropositionsDeferred.promise);
        return renderedPropositionsDeferred.resolve;
      }
      return (decisionsMetaDisplay = [], decisionsMetaSuppressed = []) => {
        if (isNonEmptyArray(decisionsMetaDisplay)) {
          collect({
            decisionsMeta: decisionsMetaDisplay,
            viewName,
          });
        }
        if (isNonEmptyArray(decisionsMetaSuppressed)) {
          collect({
            decisionsMeta: decisionsMetaSuppressed,
            eventType: SUPPRESS,
            propositionAction: {
              reason: "Conflict",
            },
            viewName,
          });
        }
      };
    };
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createHandleConsentFlicker =
    ({ showContainers, consent }) =>
    () => {
      const { state, wasSet } = consent.current();
      if (state === OUT && wasSet) {
        showContainers();
      } else {
        consent.awaitConsent().catch(showContainers);
      }
    };

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

  const getInteractionDetail = (clickedElement) => {
    const { documentElement } = document;
    let element = clickedElement;
    const interactIds = new Set();
    let clickLabel;
    let clickToken;
    while (
      element &&
      element !== documentElement &&
      !(element instanceof ShadowRoot)
    ) {
      const interactId = getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE);
      if (interactId) {
        interactIds.add(interactId);
      }
      clickLabel =
        clickLabel || getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE);
      clickToken =
        clickToken || getAttribute(element, CLICK_TOKEN_DATA_ATTRIBUTE);
      element = element.parentNode;
    }
    return {
      interactIds: [...interactIds],
      clickLabel,
      clickToken,
    };
  };
  const extractViewName = (metas) => {
    const foundMetaWithScopeTypeView = metas.find(
      (meta) => meta.scopeType === VIEW_SCOPE_TYPE,
    );
    return foundMetaWithScopeTypeView
      ? foundMetaWithScopeTypeView.scope
      : undefined;
  };
  const createMetaFilter =
    (autoCollectPropositionInteractions, clickLabel, clickToken) => (meta) => {
      const { scopeDetails = {} } = meta;
      const { decisionProvider } = scopeDetails;
      if (autoCollectPropositionInteractions[decisionProvider] === ALWAYS) {
        return true;
      }
      return (
        autoCollectPropositionInteractions[decisionProvider] ===
          DECORATED_ELEMENTS_ONLY &&
        (clickLabel || clickToken)
      );
    };
  var collectInteractions = (
    clickedElement,
    getInteractionMetas,
    autoCollectPropositionInteractions,
  ) => {
    const {
      interactIds,
      clickLabel = "",
      clickToken,
    } = getInteractionDetail(clickedElement);
    const metasMatchingConfigurationOptions = createMetaFilter(
      autoCollectPropositionInteractions,
      clickLabel,
      clickToken,
    );
    if (interactIds.length === 0) {
      return {};
    }
    const metas = getInteractionMetas(interactIds).filter(
      metasMatchingConfigurationOptions,
    );
    return {
      decisionsMeta: cleanMetas(metas),
      propositionActionLabel: clickLabel,
      propositionActionToken: clickToken,
      viewName: extractViewName(metas),
    };
  };

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
  const PERSONALIZATION_DECISIONS_HANDLE = "personalization:decisions";
  const ADOBE_JOURNEY_OPTIMIZER = "AJO";
  const ADOBE_TARGET = "TGT";

  /*
  Copyright 2019 Adobe. Ackll rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const createPersonalization = ({ config, logger, eventManager, consent }) => {
    const {
      targetMigrationEnabled,
      prehidingStyle,
      autoCollectPropositionInteractions,
    } = config;
    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta,
    });
    const showContainers = createShowContainers(logger);
    const hideContainers = createHideContainers(logger);
    const { storeInteractionMeta, getInteractionMetas } =
      createInteractionStorage();
    const { storeClickMeta, getClickSelectors, getClickMetas } =
      createClickStorage();
    const getPageLocation = createGetPageLocation({
      window,
    });
    const domActionsModules = initDomActionsModules();
    const preprocess = createPreprocess([
      remapHeadOffers,
      remapCustomCodeOffers,
    ]);
    const createProposition = injectCreateProposition({
      preprocess,
      isPageWideSurface,
    });
    const viewCache = createViewCacheManager({
      createProposition,
    });
    const executeRedirect = createRedirect(window);
    const schemaProcessors = {
      [DEFAULT_CONTENT_ITEM]: processDefaultContent,
      [DOM_ACTION]: createProcessDomAction({
        modules: domActionsModules,
        logger,
        storeInteractionMeta,
        storeClickMeta,
        autoCollectPropositionInteractions,
      }),
      [HTML_CONTENT_ITEM]: createProcessHtmlContent({
        modules: domActionsModules,
        logger,
        storeInteractionMeta,
        autoCollectPropositionInteractions,
      }),
      [REDIRECT_ITEM]: createProcessRedirect({
        logger,
        executeRedirect,
        collect,
      }),
      [MESSAGE_IN_APP]: createProcessInAppMessage({
        modules: initInAppMessageActionsModules(collect),
        logger,
      }),
    };
    const processPropositions = createProcessPropositions({
      schemaProcessors,
      logger,
    });
    const renderedPropositions = createAsyncArray();
    const notificationHandler = createNotificationHandler(
      collect,
      renderedPropositions,
    );
    const fetchDataHandler = createFetchDataHandler({
      prehidingStyle,
      showContainers,
      hideContainers,
      mergeQuery,
      processPropositions,
      createProposition,
      notificationHandler,
      consent,
      logger,
    });
    const onClickHandler = createOnClickHandler({
      mergeDecisionsMeta,
      collectInteractions,
      collectClicks,
      getInteractionMetas,
      getClickMetas,
      getClickSelectors,
      autoCollectPropositionInteractions,
    });
    const viewChangeHandler = createViewChangeHandler({
      processPropositions,
      viewCache,
      logger,
    });
    const applyPropositions = createApplyPropositions({
      processPropositions,
      createProposition,
      renderedPropositions,
      viewCache,
    });
    const setTargetMigration = createSetTargetMigration({
      targetMigrationEnabled,
    });
    const onDecisionHandler = createOnDecisionHandler({
      processPropositions,
      createProposition,
      notificationHandler,
    });
    const handleConsentFlicker = createHandleConsentFlicker({
      showContainers,
      consent,
    });
    return createComponent$1({
      getPageLocation,
      logger,
      fetchDataHandler,
      viewChangeHandler,
      onClickHandler,
      isAuthoringModeEnabled,
      mergeQuery,
      viewCache,
      showContainers,
      applyPropositions,
      setTargetMigration,
      mergeDecisionsMeta,
      renderedPropositions,
      onDecisionHandler,
      handleConsentFlicker,
    });
  };
  createPersonalization.namespace = "Personalization";
  const interactionConfigOptions = PROPOSITION_INTERACTION_TYPES.map(
    (propositionInteractionType) => boundLiteral(propositionInteractionType),
  );
  createPersonalization.configValidators = boundObjectOf({
    prehidingStyle: boundString().nonEmpty(),
    targetMigrationEnabled: boundBoolean().default(false),
    autoCollectPropositionInteractions: boundObjectOf({
      [ADOBE_JOURNEY_OPTIMIZER]: boundAnyOf(interactionConfigOptions).default(
        ALWAYS,
      ),
      [ADOBE_TARGET]: boundAnyOf(interactionConfigOptions).default(NEVER),
    })
      .default({
        [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
        [ADOBE_TARGET]: NEVER,
      })
      .noUnknownFields(),
  });

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
  const isPlainObject = (obj) =>
    obj !== null &&
    typeof obj === "object" &&
    Object.getPrototypeOf(obj) === Object.prototype;
  const flattenObject = (obj, result = {}, keys = []) => {
    Object.keys(obj).forEach((key) => {
      if (isPlainObject(obj[key]) || Array.isArray(obj[key])) {
        flattenObject(obj[key], result, [...keys, key]);
      } else {
        result[[...keys, key].join(".")] = obj[key];
      }
    });
    return result;
  };
  var flattenObject$1 = (obj) => {
    if (!isPlainObject(obj)) {
      return obj;
    }
    return flattenObject(obj);
  };

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

  var createOnResponseHandler = ({
    renderDecisions,
    decisionProvider,
    applyResponse,
    event,
    personalization,
    decisionContext,
  }) => {
    const context = {
      ...flattenObject$1(event.getContent()),
      ...decisionContext,
    };
    return ({ response }) => {
      decisionProvider.addPayloads(
        response.getPayloadsByType(PERSONALIZATION_DECISIONS_HANDLE),
      );

      // only evaluate events that include a personalization query
      if (!event.hasQuery()) {
        return {
          propositions: [],
        };
      }
      const propositions = decisionProvider.evaluate(context);
      return applyResponse({
        renderDecisions,
        propositions,
        event,
        personalization,
      });
    };
  };

  const ConditionType = {
    MATCHER: "matcher",
    GROUP: "group",
    HISTORICAL: "historical",
  };
  const MatcherType = {
    EQUALS: "eq",
    NOT_EQUALS: "ne",
    EXISTS: "ex",
    NOT_EXISTS: "nx",
    GREATER_THAN: "gt",
    GREATER_THAN_OR_EQUAL_TO: "ge",
    LESS_THAN: "lt",
    LESS_THAN_OR_EQUAL_TO: "le",
    CONTAINS: "co",
    NOT_CONTAINS: "nc",
    STARTS_WITH: "sw",
    ENDS_WITH: "ew",
  };
  const LogicType = {
    AND: "and",
    OR: "or",
  };
  const SearchType = {
    ORDERED: "ordered",
    MOST_RECENT: "mostRecent",
  };
  function isObjectOrUndefined(value) {
    return typeof value === "object" || typeof value === "undefined";
  }
  function createEquals() {
    return {
      matches: (context, key, values = []) => {
        if (isObjectOrUndefined(context[key])) {
          return false;
        }
        const contextValue = String(context[key]).toLowerCase();
        for (let i = 0; i < values.length; i += 1) {
          if (
            !isObjectOrUndefined(values[i]) &&
            contextValue === String(values[i]).toLowerCase()
          ) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createNotEquals() {
    return {
      matches: (context, key, values = []) => {
        if (isObjectOrUndefined(context[key])) {
          return false;
        }
        const contextValue = String(context[key]).toLowerCase();
        for (let i = 0; i < values.length; i += 1) {
          if (
            !isObjectOrUndefined(values[i]) &&
            contextValue === String(values[i]).toLowerCase()
          ) {
            return false;
          }
        }
        return true;
      },
    };
  }
  function createExists() {
    return {
      matches: (context, key) => {
        return typeof context[key] !== "undefined" && context[key] !== null;
      },
    };
  }
  function createNotExists() {
    return {
      matches: (context, key) => {
        return typeof context[key] === "undefined" || context[key] === null;
      },
    };
  }
  function isNumber(value) {
    return typeof value === "number";
  }
  function createGreaterThan() {
    return {
      matches: (context, key, values = []) => {
        const needle = context[key];
        if (!isNumber(needle)) {
          return false;
        }
        for (let i = 0; i < values.length; i += 1) {
          if (isNumber(values[i]) && needle > values[i]) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createGreaterThanEquals() {
    return {
      matches: (context, key, values = []) => {
        const needle = context[key];
        if (!isNumber(needle)) {
          return false;
        }
        for (let i = 0; i < values.length; i += 1) {
          if (isNumber(values[i]) && needle >= values[i]) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createLessThan() {
    return {
      matches: (context, key, values = []) => {
        const needle = context[key];
        if (!isNumber(needle)) {
          return false;
        }
        for (let i = 0; i < values.length; i += 1) {
          if (isNumber(values[i]) && needle < values[i]) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createLessThanEquals() {
    return {
      matches: (context, key, values = []) => {
        const needle = context[key];
        if (!isNumber(needle)) {
          return false;
        }
        for (let i = 0; i < values.length; i += 1) {
          if (isNumber(values[i]) && needle <= values[i]) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createContains() {
    return {
      matches: (context, key, values = []) => {
        if (isObjectOrUndefined(context[key])) {
          return false;
        }
        const contextValue = String(context[key]).toLowerCase();
        for (let i = 0; i < values.length; i += 1) {
          if (
            !isObjectOrUndefined(values[i]) &&
            contextValue.indexOf(String(values[i]).toLowerCase()) !== -1
          ) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createNotContains() {
    return {
      matches: (context, key, values = []) => {
        if (isObjectOrUndefined(context[key])) {
          return false;
        }
        const contextValue = String(context[key]).toLowerCase();
        for (let i = 0; i < values.length; i += 1) {
          if (
            !isObjectOrUndefined(values[i]) &&
            contextValue.indexOf(String(values[i]).toLowerCase()) !== -1
          ) {
            return false;
          }
        }
        return true;
      },
    };
  }
  function createStartsWith() {
    return {
      matches: (context, key, values = []) => {
        if (isObjectOrUndefined(context[key])) {
          return false;
        }
        const contextValue = String(context[key]).toLowerCase();
        for (let i = 0; i < values.length; i += 1) {
          if (
            !isObjectOrUndefined(values[i]) &&
            contextValue.startsWith(String(values[i]).toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      },
    };
  }
  function createEndsWith() {
    return {
      matches: (context, key, values = []) => {
        if (isObjectOrUndefined(context[key])) {
          return false;
        }
        const contextValue = String(context[key]).toLowerCase();
        for (let i = 0; i < values.length; i += 1) {
          if (
            !isObjectOrUndefined(values[i]) &&
            contextValue.endsWith(values[i].toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      },
    };
  }
  const MATCHERS = {
    [MatcherType.EQUALS]: createEquals(),
    [MatcherType.NOT_EQUALS]: createNotEquals(),
    [MatcherType.EXISTS]: createExists(),
    [MatcherType.NOT_EXISTS]: createNotExists(),
    [MatcherType.GREATER_THAN]: createGreaterThan(),
    [MatcherType.GREATER_THAN_OR_EQUAL_TO]: createGreaterThanEquals(),
    [MatcherType.LESS_THAN]: createLessThan(),
    [MatcherType.LESS_THAN_OR_EQUAL_TO]: createLessThanEquals(),
    [MatcherType.CONTAINS]: createContains(),
    [MatcherType.NOT_CONTAINS]: createNotContains(),
    [MatcherType.STARTS_WITH]: createStartsWith(),
    [MatcherType.ENDS_WITH]: createEndsWith(),
  };
  function getMatcher(key) {
    return MATCHERS[key];
  }
  function isUndefined(value) {
    return typeof value === "undefined";
  }
  const IAM_ID = "iam.id";
  const EVENT_ID = "eventId";
  const ID = "id";
  const IAM_EVENT_TYPE = "iam.eventType";
  const EVENT_TYPE = "eventType";
  const TYPE = "type";
  const VALID_EVENT_TYPES = [IAM_EVENT_TYPE, EVENT_TYPE, TYPE];
  const VALID_EVENT_IDS = [IAM_ID, ID];
  const checkForHistoricalMatcher = (eventCount, matcherKey, value) => {
    switch (matcherKey) {
      case MatcherType.GREATER_THAN:
        return eventCount > value;
      case MatcherType.GREATER_THAN_OR_EQUAL_TO:
        return eventCount >= value;
      case MatcherType.LESS_THAN:
        return eventCount < value;
      case MatcherType.LESS_THAN_OR_EQUAL_TO:
        return eventCount <= value;
      case MatcherType.EQUALS:
        return eventCount === value;
      case MatcherType.NOT_EQUALS:
        return eventCount !== value;
      default:
        return false;
    }
  };
  const detectKeyName = (context, properties) => {
    for (let i = 0; i < properties.length; i += 1) {
      if (!isUndefined(context[properties[i]])) {
        return properties[i];
      }
    }
    throw new Error("The event does not match the expected schema.");
  };
  const normalizeEvent = (originalEvent) => {
    const event = structuredClone(originalEvent);
    [
      [detectKeyName(event, VALID_EVENT_TYPES), EVENT_TYPE],
      [detectKeyName(event, VALID_EVENT_IDS), EVENT_ID],
    ].forEach(([keyName, normalizedKeyName]) => {
      if (keyName === normalizedKeyName) {
        return;
      }
      event[normalizedKeyName] = event[keyName];
      delete event[keyName];
    });
    return event;
  };
  function queryAndCountAnyEvent(
    events,
    context,
    options,
    from = 0,
    to = Infinity,
  ) {
    return events.reduce((countTotal, event) => {
      try {
        const eventHash = options.generateEventHash(normalizeEvent(event));
        const contextEvent = context.events[eventHash];
        if (!contextEvent) {
          return countTotal;
        }
        const { timestamps = [] } = contextEvent;
        return (
          countTotal + timestamps.filter((t) => t >= from && t <= to).length
        );
      } catch {
        return countTotal;
      }
    }, 0);
  }
  function queryAndCountOrderedEvent(
    events,
    context,
    options,
    from = 0,
    to = Infinity,
  ) {
    try {
      let previousEventTimestamp = from;
      const sameSequence = events.every((event) => {
        const eventHash = options.generateEventHash(normalizeEvent(event));
        const contextEvent = context.events[eventHash];
        if (!contextEvent) {
          return false;
        }
        const contextEventFirstTimestamp = contextEvent.timestamps[0];
        const isOrdered =
          contextEventFirstTimestamp >= previousEventTimestamp &&
          contextEventFirstTimestamp <= to;
        previousEventTimestamp = contextEventFirstTimestamp;
        return isOrdered;
      });
      return Number(sameSequence);
    } catch {
      return 0;
    }
  }
  function queryAndCountMostRecentEvent(
    events,
    context,
    options,
    from = 0,
    to = Infinity,
  ) {
    try {
      return events.reduce(
        (mostRecent, event, index) => {
          const eventHash = options.generateEventHash(normalizeEvent(event));
          const contextEvent = context.events[eventHash];
          if (!contextEvent) {
            return mostRecent;
          }
          const mostRecentTimestamp = contextEvent.timestamps
            .filter((t) => t >= from && t <= to)
            .pop();
          return mostRecentTimestamp &&
            mostRecentTimestamp > mostRecent.timestamp
            ? {
                index,
                timestamp: mostRecentTimestamp,
              }
            : mostRecent;
        },
        {
          index: -1,
          timestamp: 0,
        },
      ).index;
    } catch {
      return -1;
    }
  }
  function evaluateAnd(context, conditions, options) {
    let result = true;
    for (let i = 0; i < conditions.length; i += 1) {
      result = result && conditions[i].evaluate(context, options);
    }
    return result;
  }
  function evaluateOr(context, conditions, options) {
    let result = false;
    for (let i = 0; i < conditions.length; i += 1) {
      result = result || conditions[i].evaluate(context, options);
      if (result) {
        return true;
      }
    }
    return false;
  }
  function createRules(version, rules, metadata) {
    return {
      version,
      rules,
      metadata,
    };
  }
  function createRule(condition, consequences, key) {
    return {
      key,
      execute: (context, options) => {
        if (condition.evaluate(context, options)) {
          return consequences;
        }
        return [];
      },
      toString: () => {
        return (
          "Rule{condition=" + condition + ", consequences=" + consequences + "}"
        );
      },
    };
  }
  function createCondition(type, definition) {
    return {
      evaluate: (context, options) => {
        return definition.evaluate(context, options);
      },
      toString() {
        return "Condition{type=" + type + ", definition=" + definition + "}";
      },
    };
  }
  function createConsequence(id, type, detail) {
    return {
      id,
      type,
      detail,
    };
  }
  function createGroupDefinition(logic, conditions) {
    return {
      evaluate: (context, options) => {
        if (LogicType.AND === logic) {
          return evaluateAnd(context, conditions, options);
        }
        if (LogicType.OR === logic) {
          return evaluateOr(context, conditions, options);
        }
        return false;
      },
    };
  }
  function createMatcherDefinition(key, matcherKey, values) {
    return {
      evaluate: (context) => {
        const matcher = getMatcher(matcherKey);
        if (!matcher) {
          return false;
        }
        return matcher.matches(context, key, values);
      },
    };
  }
  function createHistoricalDefinition(
    events,
    matcherKey,
    value,
    from,
    to,
    searchType,
  ) {
    return {
      evaluate: (context, options) => {
        let eventCount;
        if (SearchType.MOST_RECENT === searchType) {
          eventCount = queryAndCountMostRecentEvent(
            events,
            context,
            options,
            from,
            to,
          );
        } else if (SearchType.ORDERED === searchType) {
          eventCount = queryAndCountOrderedEvent(
            events,
            context,
            options,
            from,
            to,
          );
        } else {
          eventCount = queryAndCountAnyEvent(
            events,
            context,
            options,
            from,
            to,
          );
        }
        return checkForHistoricalMatcher(eventCount, matcherKey, value);
      },
    };
  }
  function parseMatcherDefinition(definition) {
    const { key, matcher, values } = definition;
    return createMatcherDefinition(key, matcher, values);
  }
  function parseGroupDefinition(definition) {
    const { logic, conditions } = definition;
    return createGroupDefinition(logic, conditions.map(parseCondition));
  }
  function parseHistoricalDefinition(definition) {
    const { events, from, to, matcher, value, searchType } = definition;
    return createHistoricalDefinition(
      events,
      matcher,
      value,
      from,
      to,
      searchType,
    );
  }
  function parseCondition(condition) {
    const { type, definition } = condition;
    if (ConditionType.MATCHER === type) {
      const matchers = parseMatcherDefinition(definition);
      return createCondition(type, matchers);
    }
    if (ConditionType.GROUP === type) {
      const definitions = parseGroupDefinition(definition);
      return createCondition(type, definitions);
    }
    if (ConditionType.HISTORICAL === type) {
      const definitions = parseHistoricalDefinition(definition);
      return createCondition(type, definitions);
    }
    throw new Error("Can not parse condition");
  }
  function parseConsequence(consequence) {
    const { id, type, detail } = consequence;
    return createConsequence(id, type, detail);
  }
  function parseRule(rule) {
    const { condition, consequences, key } = rule;
    const parsedCondition = parseCondition(condition);
    const parsedConsequences = consequences.map(parseConsequence);
    return createRule(parsedCondition, parsedConsequences, key);
  }
  function parseMetadata(metadata) {
    if (!metadata) {
      return undefined;
    }
    const result = {
      provider: metadata.provider,
      providerData: Object.assign({}, metadata.providerData),
    };
    return result;
  }
  function parseRules(ruleset) {
    const { version, rules, metadata } = ruleset;
    const parsedRules = rules.map(parseRule);
    const parsedMetadata = parseMetadata(metadata);
    return createRules(version, parsedRules, parsedMetadata);
  }
  const TARGET_PROVIDER = "TGT";
  const DEFAULT_PROVIDER = "DEFAULT";
  function createDefaultRulesExecutor(rules, options) {
    return {
      provider: DEFAULT_PROVIDER,
      execute: (context) =>
        rules
          .map((rule) => rule.execute(context, options))
          .filter((arr) => arr.length > 0),
    };
  }
  function validateMetadata(metadata) {
    const { providerData } = metadata;
    if (!providerData) {
      throw new Error("Provider data is missing in metadata");
    }
    const { identityTemplate, buckets } = providerData;
    if (!identityTemplate) {
      throw new Error("Identity template is missing in provider data");
    }
    if (!buckets) {
      throw new Error("Buckets is missing in provider data");
    }
  }
  const NAMESPACE = "ECID";
  function extractIdentity(context) {
    const { xdm } = context;
    if (!xdm) {
      throw new Error("XDM object is missing in the context");
    }
    const { identityMap } = xdm;
    if (!identityMap) {
      throw new Error("Identity map is missing in the XDM object");
    }
    const identities = identityMap[NAMESPACE];
    if (!identities) {
      throw new Error("ECID identity namespace is missing in the identity map");
    }
    if (!Array.isArray(identities) || identities.length === 0) {
      throw new Error("ECID identities array is empty or not an array");
    }
    const result = identities[0].id;
    if (!result) {
      throw new Error("ECID identity is missing in the identities array");
    }
    return result;
  }
  const KEY_PATTERN = "<key>";
  const IDENTITY_PATTERN = "<identity>";
  function createId(identity, key, metadata) {
    const { providerData } = metadata;
    const { identityTemplate } = providerData;
    return identityTemplate
      .replace(KEY_PATTERN, key)
      .replace(IDENTITY_PATTERN, identity);
  }
  function isDefined(value) {
    return !isUndefined(value);
  }
  function memoize(func, keyResolverFunc = (arr) => arr[0]) {
    const memoizedValues = {};
    return function memoized(...funcArgs) {
      const key = keyResolverFunc(funcArgs);
      if (!isDefined(memoizedValues[key])) {
        memoizedValues[key] = func(...funcArgs);
      }
      return memoizedValues[key];
    };
  }
  function mul32(m, n) {
    const nlo = n & 0xffff;
    const nhi = n - nlo;
    return (((nhi * m) | 0) + ((nlo * m) | 0)) | 0;
  }
  function hashUnencodedCharsRaw(stringValue, seed = 0) {
    let k1;
    const len = stringValue.length;
    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;
    let h1 = seed;
    const roundedEnd = len & -2;
    for (let i = 0; i < roundedEnd; i += 2) {
      k1 = stringValue.charCodeAt(i) | (stringValue.charCodeAt(i + 1) << 16);
      k1 = mul32(k1, c1);
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);
      k1 = mul32(k1, c2);
      h1 ^= k1;
      h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19);
      h1 = (h1 * 5 + 0xe6546b64) | 0;
    }
    if (len % 2 === 1) {
      k1 = stringValue.charCodeAt(roundedEnd);
      k1 = mul32(k1, c1);
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);
      k1 = mul32(k1, c2);
      h1 ^= k1;
    }
    h1 ^= len << 1;
    h1 ^= h1 >>> 16;
    h1 = mul32(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = mul32(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;
    return h1;
  }
  const hashUnencodedChars = memoize(hashUnencodedCharsRaw, (arr) =>
    arr.join("-"),
  );
  const MAX_PERCENTAGE = 100;
  function createAllocation(id, buckets) {
    const signedNumericHashValue = hashUnencodedChars(id);
    const hashFixedBucket = Math.abs(signedNumericHashValue) % buckets;
    const allocationValue = (hashFixedBucket / buckets) * MAX_PERCENTAGE;
    return Math.round(allocationValue * MAX_PERCENTAGE) / MAX_PERCENTAGE;
  }
  const createAllocationMemoized = memoize(createAllocation);
  function createContext(id, buckets, context) {
    const allocation = createAllocationMemoized(id, buckets);
    return {
      allocation,
      ...context,
    };
  }
  function groupRules(rules) {
    const result = {};
    for (let i = 0; i < rules.length; i += 1) {
      const rule = rules[i];
      if (!rule.key) {
        continue;
      }
      if (!result[rule.key]) {
        result[rule.key] = [];
      }
      result[rule.key].push(rule);
    }
    return result;
  }
  function evaluateRules(context, rules) {
    return rules
      .map((rule) => rule.execute(context))
      .filter((arr) => arr.length > 0);
  }
  function createTargetRulesExecutor(rules, metadata) {
    validateMetadata(metadata);
    const rulesNoKey = rules.filter((rule) => !rule.key);
    const rulesWithKeys = groupRules(rules);
    const { buckets } = metadata.providerData;
    return {
      provider: TARGET_PROVIDER,
      execute: (context) => {
        const identity = extractIdentity(context);
        const consequencesNoKey = evaluateRules(context, rulesNoKey);
        const rulesKeys = Object.keys(rulesWithKeys);
        const consequencesWithKeys = [];
        for (let i = 0; i < rulesKeys.length; i += 1) {
          const key = rulesKeys[i];
          const rulesForKey = rulesWithKeys[key];
          const id = createId(identity, key, metadata);
          const contextForKey = createContext(id, buckets, context);
          const consequences = evaluateRules(contextForKey, rulesForKey);
          consequencesWithKeys.push(...consequences);
        }
        return [...consequencesNoKey, ...consequencesWithKeys];
      },
    };
  }
  function createExecutor(rules, metadata, options) {
    const { provider } = metadata;
    if (provider === TARGET_PROVIDER) {
      return createTargetRulesExecutor(rules, metadata);
    }
    return createDefaultRulesExecutor(rules, options);
  }
  function RulesEngine(
    ruleset,
    options = {
      generateEventHash: () => {
        throw new Error("No hash function provided");
      },
    },
  ) {
    const { rules, metadata = {} } = parseRules(ruleset);
    return createExecutor(rules, metadata, options);
  }

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Generates an event history hash from an object by removing keys with empty values, sorting the keys,
   * converting the object to a string, and hashing the string.
   * @param {Object} o - The object to process.
   * @returns {string} - The hash of the processed object.
   */
  var generateEventHash = (o) => {
    const obj = structuredClone(o);
    const objectString = Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        const value = obj[key];

        // eslint-disable-next-line eqeqeq
        if (value == undefined || value === "") {
          return result;
        }
        result += key + ":" + value;
        return result;
      }, "");
    return fnv1a32Hex(objectString);
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var getExpirationDate = (retentionPeriod) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - retentionPeriod);
    return expirationDate;
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  const EVENT_HISTORY_MAX_RECORDS = 1000;
  const EVENT_HISTORY_RETENTION_PERIOD = 30; // 30 days
  const EVENT_HISTORY_STORAGE_KEY = "events";
  const EVENT_HISTORY_MAX_LENGTH = 2 * 1024 * 1024; // 2MB

  const CONTEXT_KEY = {
    TYPE: "~type",
    SOURCE: "~source",
  };
  const CONTEXT_EVENT_TYPE = {
    EDGE: "com.adobe.eventType.edge",
    RULES_ENGINE: "com.adobe.eventType.rulesEngine",
  };
  const CONTEXT_EVENT_SOURCE = {
    REQUEST: "com.adobe.eventSource.requestContent",
  };
  const CJM_IN_APP_MESSAGE_TYPE = "cjmiam";
  const SCHEMA = "schema";
  const INSERT_OPERATION = "insert";
  const INSERT_IF_NOT_EXISTS_OPERATION = "insertIfNotExists";

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Creates an event pruner function that filters events based on retention period and maximum count
   *
   * @param {number} [retentionPeriod=EVENT_HISTORY_RETENTION_PERIOD] - The retention period in days
   * @param {number} [limit=EVENT_HISTORY_MAX_RECORDS] - Maximum number of events to keep
   * @returns {Function} A function that takes an events object and returns a pruned version of it
   * @param {Object} events - Object containing events with timestamps
   * @returns {Object} Pruned events object with events filtered by retention period and limited to max count
   */
  var createEventPruner =
    (
      retentionPeriod = EVENT_HISTORY_RETENTION_PERIOD,
      limit = EVENT_HISTORY_MAX_RECORDS,
    ) =>
    (events) => {
      let eventsWithHash = Object.entries(events).reduce(
        (accumulator, [key, { timestamps = [] }]) => {
          timestamps.forEach((timestamp) => {
            accumulator.push({
              key,
              timestamp,
            });
          });
          return accumulator;
        },
        [],
      );
      const expirationDate = getExpirationDate(retentionPeriod);
      eventsWithHash = eventsWithHash.filter(
        ({ timestamp }) => timestamp >= expirationDate,
      );
      eventsWithHash.sort((a, b) => a.timestamp - b.timestamp);
      eventsWithHash = eventsWithHash.slice(-limit);
      return eventsWithHash.reduce((accumulator, { key, timestamp }) => {
        if (!accumulator[key]) {
          accumulator[key] = {
            timestamps: [],
          };
        }
        accumulator[key].timestamps.push(timestamp);
        return accumulator;
      }, {});
    };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var hasExperienceData = (xdm) => {
    const { _experience } = xdm || {};
    return !!_experience && typeof _experience === "object";
  };

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

  const getActivityId = (proposition) =>
    proposition?.scopeDetails?.activity?.id;
  const getDecisionProvider = (proposition) =>
    proposition?.scopeDetails?.decisionProvider;

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const createRestoreStorage = (storage, storageKey) => {
    return (defaultValue) => {
      try {
        const stored = storage.getItem(storageKey);
        const s = JSON.parse(stored);
        return [s, stored.length];
        // eslint-disable-next-line no-empty
      } catch {}
      return [defaultValue, 0];
    };
  };
  const createSaveStorage = (storage, storageKey) => (value) => {
    storage.setItem(storageKey, JSON.stringify(value));
  };
  const createInMemoryStorage = () => {
    const inMemoryStorage = {};
    return {
      getItem: (key) => {
        return key in inMemoryStorage ? inMemoryStorage[key] : null;
      },
      setItem: (key, value) => {
        inMemoryStorage[key] = value;
      },
    };
  };
  const clearLocalStorage = (storage) => {
    storage.clear();
  };

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

  var flattenArray = (arr = []) =>
    Array.isArray(arr) ? arr.flat(Infinity) : arr;

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
  var inAppMessageConsequenceAdapter = (id, type, detail) => {
    const { html, mobileParameters } = detail;
    const webParameters = {};
    return {
      schema: MESSAGE_IN_APP,
      data: {
        mobileParameters,
        webParameters,
        content: html,
        contentType: TEXT_HTML,
      },
      id,
    };
  };

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

  var schemaTypeConsequenceAdapter = (id, type, detail) => {
    const { schema, data, id: detailId } = detail;
    return {
      schema,
      data,
      id: detailId || id,
    };
  };

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
  const adapters = {
    [CJM_IN_APP_MESSAGE_TYPE]: inAppMessageConsequenceAdapter,
    [SCHEMA]: schemaTypeConsequenceAdapter,
  };
  var createConsequenceAdapter = () => {
    return (consequence) => {
      const { id, type, detail } = consequence;
      return typeof adapters[type] === "function"
        ? adapters[type](id, type, detail)
        : detail;
    };
  };

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
  const isRulesetItem = (item) => {
    const { schema, data } = item;
    if (schema === RULESET_ITEM) {
      return true;
    }
    if (schema !== JSON_CONTENT_ITEM) {
      return false;
    }
    try {
      const content =
        typeof data.content === "string"
          ? JSON.parse(data.content)
          : data.content;
      return (
        content &&
        Object.prototype.hasOwnProperty.call(content, "version") &&
        Object.prototype.hasOwnProperty.call(content, "rules")
      );
    } catch {
      return false;
    }
  };
  var createEvaluableRulesetPayload = (payload, eventRegistry) => {
    const consequenceAdapter = createConsequenceAdapter();
    const activityId = getActivityId(payload);
    const items = [];
    const addItem = (item) => {
      const { data = {}, schema } = item;
      const content = schema === RULESET_ITEM ? data : data.content;
      if (!content) {
        return;
      }
      items.push(
        RulesEngine(
          typeof content === "string" ? JSON.parse(content) : content,
          {
            generateEventHash,
          },
        ),
      );
    };
    const evaluate = (context) => {
      const displayEvent = eventRegistry.getEvent(DISPLAY, activityId);
      const displayedDate = displayEvent?.timestamps[0];
      const qualifyingItems = flattenArray(
        items.map((item) => item.execute(context)),
      )
        .map(consequenceAdapter)
        .map((item) => {
          const event = eventRegistry.addEvent({
            eventType: PropositionEventType.TRIGGER,
            eventId: activityId,
          });
          const qualifiedDate = event.timestamps[0];
          return {
            ...item,
            data: {
              ...item.data,
              qualifiedDate,
              displayedDate,
            },
          };
        });
      return {
        ...payload,
        items: qualifyingItems,
      };
    };
    if (Array.isArray(payload.items)) {
      payload.items.filter(isRulesetItem).forEach(addItem);
    }
    return {
      rank: payload?.scopeDetails?.rank || Infinity,
      evaluate,
      isEvaluable: items.length > 0,
    };
  };

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
  var createDecisionProvider = ({ eventRegistry }) => {
    const payloadsBasedOnActivityId = {};
    const addPayload = (payload) => {
      const activityId = getActivityId(payload);
      if (!activityId) {
        return;
      }
      const evaluableRulesetPayload = createEvaluableRulesetPayload(
        payload,
        eventRegistry,
      );
      if (evaluableRulesetPayload.isEvaluable) {
        payloadsBasedOnActivityId[activityId] = evaluableRulesetPayload;
      }
    };
    const evaluate = (context = {}) => {
      const sortedPayloadsBasedOnActivityId = Object.values(
        payloadsBasedOnActivityId,
      ).sort(({ rank: rankA }, { rank: rankB }) => rankA - rankB);
      return sortedPayloadsBasedOnActivityId
        .map((payload) => payload.evaluate(context))
        .filter((payload) => payload.items.length > 0);
    };
    const addPayloads = (personalizationPayloads) => {
      personalizationPayloads.forEach(addPayload);
    };
    return {
      addPayload,
      addPayloads,
      evaluate,
    };
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  /**
   * Extracts event history operations from a proposition list and filters them out.
   *
   * This function processes the provided proposition list by:
   * 1. Identifying items with the EVENT_HISTORY_OPERATION schema
   * 2. Converting these items into event payloads and tie them with the operation
   * 3. Removing these items from the original propositions
   * 4. Returning an array of the extracted event payloads
   *
   * @param {PropositionList} propositionList - The list of propositions to process
   * @returns {Array<EventPayload>} Array of extracted event payloads with operation
   */
  var extractPayloadsFromEventHistoryOperations = (propositionList) => {
    const result = [];
    propositionList.forEach((proposition) => {
      const filteredItems = [];
      proposition.items.forEach((item) => {
        if (item.schema === EVENT_HISTORY_OPERATION) {
          result.push({
            operation: item.data.operation,
            event: {
              eventId: item.data.content["iam.id"],
              eventType: item.data.content["iam.eventType"],
            },
          });
        } else {
          filteredItems.push(item);
        }
      });
      proposition.items = filteredItems;
    });
    return result;
  };

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

  var createApplyResponse = ({ lifecycle, eventRegistry }) => {
    return ({
      renderDecisions = false,
      propositions = [],
      event,
      personalization,
    }) => {
      if (lifecycle) {
        // Some propositions may contains event history operations.
        // We extract them and add the events to the event registry.
        const eventPayloads =
          extractPayloadsFromEventHistoryOperations(propositions);
        eventRegistry.addEventPayloads(eventPayloads);
        lifecycle.onDecision({
          renderDecisions,
          propositions,
          event,
          personalization,
        });
      }
      return {
        propositions,
      };
    };
  };

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

  /**
   * Creates an event registry to track and manage events
   * @param {Object} options - The options object
   * @param {Object} options.storage - The storage object used to persist events
   * @param {Object} options.logger - The logger object used for logging
   * @returns {Object} The event registry interface
   */
  var createEventRegistry = ({ storage, logger }) => {
    let currentStorage = storage;
    let save;

    /** @type {EventRegistry} */
    let eventRegistry;

    /** @type {number} */
    let eventRegistrySize;

    /**
     * Sets a new storage object for the event registry
     * @param {Object} newStorage
     */
    const setStorage = (newStorage) => {
      currentStorage = newStorage;
      const restore = createRestoreStorage(
        currentStorage,
        EVENT_HISTORY_STORAGE_KEY,
      );
      save = createSaveStorage(currentStorage, EVENT_HISTORY_STORAGE_KEY);
      [eventRegistry, eventRegistrySize] = restore({});
      if (eventRegistrySize > EVENT_HISTORY_MAX_LENGTH) {
        const eventPruner = createEventPruner();
        eventRegistry = eventPruner(eventRegistry);
        save(eventRegistry);
      }
    };
    setStorage(storage);

    /**
     * Adds a single event to the event registry
     * @param {EventData} event
     * @param {string} operation
     * @returns {EventRecord|undefined}
     */
    const addEvent = (
      event = {
        eventType: null,
        eventId: null,
      },
      operation = INSERT_OPERATION,
    ) => {
      const { eventType, eventId } = event;
      if (!eventType || !eventId) {
        return undefined;
      }
      const eventHash = generateEventHash(event);
      if (
        operation === INSERT_IF_NOT_EXISTS_OPERATION &&
        eventRegistry[eventHash]
      ) {
        return undefined;
      }
      if (
        !eventRegistry[eventHash] ||
        !Array.isArray(eventRegistry[eventHash].timestamps)
      ) {
        eventRegistry[eventHash] = {
          timestamps: [],
        };
      }
      const timestamp = new Date().getTime();
      eventRegistry[eventHash].timestamps.push(timestamp);
      eventRegistry[eventHash].timestamps.sort();
      logger.info(
        "[Event History] Added event for",
        event,
        "with hash",
        eventHash,
        "and timestamp",
        timestamp,
      );
      save(eventRegistry);
      return eventRegistry[eventHash];
    };

    /**
     * Adds multiple events to the event registry
     * @param {Array<EventPayload>} eventPayloads
     * @returns {Array<EventRecord>}
     */
    const addEventPayloads = (eventPayloads = []) =>
      eventPayloads.map(({ operation, event }) => addEvent(event, operation));

    /**
     * Processes and adds Experience Edge events to the registry
     * @param {Object} event - The Experience Edge event object
     * @returns {void}
     */
    const addExperienceEdgeEvent = (event) => {
      const { xdm } = event.getContent();
      if (!hasExperienceData(xdm)) {
        return;
      }
      const {
        _experience: {
          decisioning: {
            propositionEventType = {},
            propositionAction: { id: action } = {},
            propositions = [],
          } = {},
        },
      } = xdm;
      Object.keys(propositionEventType)
        .filter(
          (eventType) => propositionEventType[eventType] === EVENT_TYPE_TRUE,
        )
        .forEach((eventType) => {
          propositions.forEach((proposition) => {
            if (getDecisionProvider(proposition) !== ADOBE_JOURNEY_OPTIMIZER) {
              return;
            }
            addEvent({
              eventId: getActivityId(proposition),
              eventType,
              action,
            });
          });
        });
    };

    /**
     * Retrieves an event from the registry based on type and ID
     * @param {string} eventType - The type of the event to retrieve
     * @param {string} eventId - The ID of the event to retrieve
     * @returns {EventRecord|undefined} The event object if found, otherwise undefined
     */
    const getEvent = (eventType, eventId) => {
      const h = generateEventHash({
        eventType,
        eventId,
      });
      if (!eventRegistry[h]) {
        return undefined;
      }
      return eventRegistry[h];
    };
    return {
      addExperienceEdgeEvent,
      addEvent,
      addEventPayloads,
      getEvent,
      toJSON: () => eventRegistry,
      setStorage,
    };
  };

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
  var createContextProvider = ({ eventRegistry, window, getBrowser }) => {
    const pageLoadTimestamp = new Date().getTime();
    const getBrowserContext = () => {
      return {
        name: getBrowser(),
      };
    };
    const getPageContext = () => {
      return {
        title: window.title,
        url: window.url,
        ...parseUrl(window.url),
      };
    };
    const getReferrerContext = () => {
      return {
        url: window.referrer,
        ...parseUrl(window.referrer),
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
        "~state.com.adobe.module.lifecycle/lifecyclecontextdata.hourofday":
          now.getHours(),
        currentMinute: now.getMinutes(),
        currentMonth: now.getMonth(),
        currentYear: now.getFullYear(),
        pageVisitDuration: currentTimestamp - pageLoadTimestamp,
        "~timestampu": currentTimestamp / 1000,
        "~timestampz": now.toISOString(),
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
        scrollX,
      };
    };
    const coreGlobalContext = {
      browser: getBrowserContext(),
      page: getPageContext(),
      referringPage: getReferrerContext(),
    };
    const getGlobalContext = () => {
      return {
        ...coreGlobalContext,
        ...getTimeContext(),
        window: getWindowContext(),
        "~sdkver": libraryVersion,
      };
    };
    const getContext = (addedContext = {}) => {
      const context = {
        ...getGlobalContext(),
        ...addedContext,
      };
      return {
        ...flattenObject$1(context),
        events: eventRegistry.toJSON(),
      };
    };
    return {
      getContext,
    };
  };

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

  const defaultPreprocessor = (params, ...args) => {
    return args;
  };

  // eslint-disable-next-line no-unused-vars
  const defaultEmissionCondition = (params, ...args) => true;
  const createSubscription = () => {
    let preprocessor = defaultPreprocessor;
    let emissionCondition = defaultEmissionCondition;
    let counter = 0;
    const subscriptions = {};
    const createUnsubscribe = (id) => {
      return () => {
        delete subscriptions[id];
      };
    };
    const add = (callback, params = undefined) => {
      if (typeof callback !== "function") {
        return () => undefined;
      }
      counter += 1;
      subscriptions[counter] = {
        callback,
        params,
      };
      return {
        id: counter,
        unsubscribe: createUnsubscribe(counter),
      };
    };
    const setEmissionPreprocessor = (value) => {
      if (typeof value === "function") {
        preprocessor = value;
      }
    };
    const setEmissionCondition = (value) => {
      if (typeof value === "function") {
        emissionCondition = value;
      }
    };
    const emit = (...args) => {
      Object.values(subscriptions).forEach(({ callback, params }) => {
        const result = preprocessor(params, ...args);
        if (emissionCondition(params, ...result)) {
          callback(...result);
        }
      });
    };
    const emitOne = (subscriptionId, ...args) => {
      if (!subscriptionId || !subscriptions[subscriptionId]) {
        return;
      }
      const { callback, params } = subscriptions[subscriptionId];
      const result = preprocessor(params, ...args);
      if (emissionCondition(params, ...result)) {
        callback(...result);
      }
    };
    const hasSubscriptions = () => Object.keys(subscriptions).length > 0;
    return {
      add,
      emit,
      emitOne,
      hasSubscriptions,
      setEmissionPreprocessor,
      setEmissionCondition,
    };
  };

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
  const validateOptions$1 = ({ options }) => {
    const validator = boundObjectOf({
      surfaces: boundArrayOf(boundString()).uniqueItems(),
      schemas: boundArrayOf(boundString()).uniqueItems(),
      callback: boundCallback().required(),
    }).noUnknownFields();
    return validator(options);
  };
  const getAnalyticsDetail = (proposition) => {
    const { id, scope, scopeDetails } = proposition;
    return {
      id,
      scope,
      scopeDetails,
    };
  };
  var createSubscribeRulesetItems = ({ collect }) => {
    let emitPropositions = () => undefined;
    const collectedEventsThisSession = new Set();
    const shouldAlwaysCollect = (propositionEventType) =>
      [PropositionEventType.INTERACT, PropositionEventType.DISMISS].includes(
        propositionEventType,
      );
    const shouldCollect = (
      propositionEventType,
      analyticsMetaId,
      collectedEventsThisRequest,
    ) => {
      const eventId = [propositionEventType, analyticsMetaId].join("-");
      const result =
        !collectedEventsThisRequest.has(eventId) &&
        (shouldAlwaysCollect(propositionEventType) ||
          !collectedEventsThisSession.has(eventId));
      collectedEventsThisRequest.add(eventId);
      collectedEventsThisSession.add(eventId);
      return result;
    };
    const collectEvent = (propositionEventType, propositions = []) => {
      if (!(propositions instanceof Array)) {
        return Promise.resolve();
      }
      if (!Object.values(PropositionEventType).includes(propositionEventType)) {
        return Promise.resolve();
      }
      const decisionsMeta = [];
      const collectedEventsThisRequest = new Set();
      propositions.forEach((proposition) => {
        const analyticsMeta = getAnalyticsDetail(proposition);
        if (
          !shouldCollect(
            propositionEventType,
            analyticsMeta.id,
            collectedEventsThisRequest,
          )
        ) {
          return;
        }
        decisionsMeta.push(analyticsMeta);
      });
      return decisionsMeta.length > 0
        ? collect({
            decisionsMeta,
            eventType: getEventType(propositionEventType),
            documentMayUnload: true,
          })
        : Promise.resolve();
    };
    const subscriptions = createSubscription();
    const emissionPreprocessor = (params, propositions) => {
      const { surfacesFilter, schemasFilter } = params;
      const result = {
        propositions: propositions
          .filter((payload) =>
            surfacesFilter ? surfacesFilter.includes(payload.scope) : true,
          )
          .map((payload) => {
            const { items = [] } = payload;
            return {
              ...payload,
              items: items.filter((item) =>
                schemasFilter ? schemasFilter.includes(item.schema) : true,
              ),
            };
          })
          .filter((payload) => payload.items.length > 0),
      };
      return [result, collectEvent];
    };
    subscriptions.setEmissionPreprocessor(emissionPreprocessor);
    const run = ({ surfaces, schemas, callback }) => {
      const { id, unsubscribe } = subscriptions.add(callback, {
        surfacesFilter: surfaces instanceof Array ? surfaces : undefined,
        schemasFilter: schemas instanceof Array ? schemas : undefined,
      });
      emitPropositions(id);
      return Promise.resolve({
        unsubscribe,
      });
    };
    const optionsValidator = (options) =>
      validateOptions$1({
        options,
      });
    const refresh = (propositions) => {
      emitPropositions = (subscriptionId) => {
        if (subscriptionId) {
          subscriptions.emitOne(subscriptionId, propositions);
          return;
        }
        subscriptions.emit(propositions);
      };
      emitPropositions();
    };
    return {
      refresh,
      command: {
        optionsValidator,
        run,
      },
    };
  };

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
  const validateOptions = ({ options }) => {
    const validator = boundObjectOf({
      renderDecisions: boundBoolean(),
      personalization: boundObjectOf({
        decisionContext: boundObjectOf({}),
      }),
    }).noUnknownFields();
    return validator(options);
  };
  var createEvaluateRulesetsCommand = ({
    contextProvider,
    decisionProvider,
  }) => {
    const run = ({ renderDecisions, decisionContext, applyResponse }) => {
      return applyResponse({
        renderDecisions,
        propositions: decisionProvider.evaluate(
          contextProvider.getContext(decisionContext),
        ),
      });
    };
    const optionsValidator = (options) =>
      validateOptions({
        options,
      });
    return {
      optionsValidator,
      run,
    };
  };

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
  const createRulesEngine = ({
    config,
    eventManager,
    createNamespacedStorage,
    consent,
    getBrowser,
    logger,
  }) => {
    const { orgId, personalizationStorageEnabled } = config;
    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta,
    });
    const storage = createNamespacedStorage(
      sanitizeOrgIdForCookieName(orgId) + ".decisioning.",
    );
    if (!personalizationStorageEnabled) {
      clearLocalStorage(storage.persistent);
    }
    const eventRegistry = createEventRegistry({
      storage: createInMemoryStorage(),
      logger,
    });
    const decisionProvider = createDecisionProvider({
      eventRegistry,
    });
    const contextProvider = createContextProvider({
      eventRegistry,
      window,
      getBrowser,
    });
    const evaluateRulesetsCommand = createEvaluateRulesetsCommand({
      contextProvider,
      decisionProvider,
    });
    const subscribeRulesetItems = createSubscribeRulesetItems({
      collect,
    });
    let applyResponse;
    return {
      lifecycle: {
        onDecision({ propositions }) {
          subscribeRulesetItems.refresh(propositions);
        },
        onComponentsRegistered(tools) {
          applyResponse = createApplyResponse({
            lifecycle: tools.lifecycle,
            eventRegistry,
          });
          if (personalizationStorageEnabled) {
            consent
              .awaitConsent()
              .then(() => {
                eventRegistry.setStorage(storage.persistent);
              })
              .catch(() => {
                if (storage) {
                  clearLocalStorage(storage.persistent);
                }
              });
          }
        },
        onBeforeEvent({
          event,
          renderDecisions,
          personalization = {},
          onResponse = noop,
        }) {
          const { decisionContext = {} } = personalization;
          onResponse(
            createOnResponseHandler({
              renderDecisions,
              decisionProvider,
              applyResponse,
              event,
              personalization,
              decisionContext: contextProvider.getContext({
                [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.EDGE,
                [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
                ...decisionContext,
              }),
            }),
          );
        },
        onBeforeRequest({ request }) {
          const payload = request.getPayload().toJSON();
          const { events = [] } = payload;
          if (events.length === 0) {
            return;
          }
          events.forEach((event) =>
            eventRegistry.addExperienceEdgeEvent(event),
          );
        },
      },
      commands: {
        evaluateRulesets: {
          run: ({ renderDecisions, personalization = {} }) => {
            const { decisionContext = {} } = personalization;
            return evaluateRulesetsCommand.run({
              renderDecisions,
              decisionContext: {
                [CONTEXT_KEY.TYPE]: CONTEXT_EVENT_TYPE.RULES_ENGINE,
                [CONTEXT_KEY.SOURCE]: CONTEXT_EVENT_SOURCE.REQUEST,
                ...decisionContext,
              },
              applyResponse,
            });
          },
          optionsValidator: evaluateRulesetsCommand.optionsValidator,
        },
        subscribeRulesetItems: subscribeRulesetItems.command,
      },
    };
  };
  createRulesEngine.namespace = "RulesEngine";
  createRulesEngine.configValidators = boundObjectOf({
    personalizationStorageEnabled: boundBoolean().default(false),
  });

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var configValidators$1 = boundObjectOf({
    streamingMedia: boundObjectOf({
      channel: boundString().nonEmpty().required(),
      playerName: boundString().nonEmpty().required(),
      appVersion: boundString(),
      mainPingInterval: boundNumber().minimum(10).maximum(50).default(10),
      adPingInterval: boundNumber().minimum(1).maximum(10).default(10),
    }).noUnknownFields(),
  });

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

  var validateSessionOptions = ({ options }) => {
    const sessionValidator = boundAnyOf(
      [
        boundObjectOf({
          playerId: boundString().required(),
          getPlayerDetails: boundCallback().required(),
          xdm: boundObjectOf({
            mediaCollection: boundObjectOf({
              sessionDetails: boundObjectOf(boundAnything()).required(),
            }),
          }),
          edgeConfigOverrides: validateConfigOverride,
        }).required(),
        boundObjectOf({
          xdm: boundObjectOf({
            mediaCollection: boundObjectOf({
              playhead: boundNumber().required(),
              sessionDetails: boundObjectOf(boundAnything()).required(),
            }),
          }),
          edgeConfigOverrides: validateConfigOverride,
        }).required(),
      ],
      "an object with playerId, getPlayerDetails and xdm.mediaCollection.sessionDetails, or an object with xdm.mediaCollection.playhead and xdm.mediaCollection.sessionDetails",
    );
    return sessionValidator(options);
  };

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
  var validateMediaEventOptions = ({ options }) => {
    const validator = boundAnyOf(
      [
        boundObjectOf({
          playerId: boundString().required(),
          xdm: boundObjectOf({
            eventType: boundEnumOf(...Object.values(EventTypes)).required(),
            mediaCollection: boundObjectOf(boundAnything()),
          }).required(),
        }).required(),
        boundObjectOf({
          xdm: boundObjectOf({
            eventType: boundEnumOf(...Object.values(EventTypes)).required(),
            mediaCollection: boundObjectOf({
              playhead: boundNumber().integer().required(),
              sessionID: boundString().required(),
            }).required(),
          }).required(),
        }).required(),
      ],
      "Error validating the sendMediaEvent command options.",
    );
    return validator(options);
  };

  /*
  Copyright 2024 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createStreamingMediaComponent = ({
    config,
    trackMediaEvent,
    trackMediaSession,
    mediaResponseHandler,
  }) => {
    return {
      lifecycle: {
        onBeforeEvent({ mediaOptions, onResponse = noop }) {
          if (!mediaOptions) {
            return;
          }
          const { legacy, playerId, getPlayerDetails } = mediaOptions;
          if (legacy) {
            return;
          }
          onResponse(({ response }) => {
            return mediaResponseHandler({
              playerId,
              getPlayerDetails,
              response,
            });
          });
        },
      },
      commands: {
        createMediaSession: {
          optionsValidator: (options) =>
            validateSessionOptions({
              options,
            }),
          run: trackMediaSession,
        },
        sendMediaEvent: {
          optionsValidator: (options) =>
            validateMediaEventOptions({
              options,
            }),
          run: (options) => {
            if (!config.streamingMedia) {
              return Promise.reject(
                new Error("Streaming media is not configured."),
              );
            }
            return trackMediaEvent(options);
          },
        },
      },
    };
  };

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
  /* eslint-disable import/no-restricted-paths */
  const createStreamingMedia = ({
    config,
    logger,
    eventManager,
    sendEdgeNetworkRequest,
    consent,
  }) => {
    const mediaSessionCacheManager = createMediaSessionCacheManager();
    const mediaEventManager = createMediaEventManager({
      config,
      eventManager,
      consent,
      sendEdgeNetworkRequest,
      setTimestamp: injectTimestamp(() => new Date()),
    });
    const trackMediaEvent = createTrackMediaEvent({
      mediaSessionCacheManager,
      mediaEventManager,
      config,
    });
    const trackMediaSession = createTrackMediaSession({
      config,
      mediaEventManager,
      mediaSessionCacheManager,
    });
    const mediaResponseHandler = createMediaResponseHandler({
      mediaSessionCacheManager,
      config,
      trackMediaEvent,
    });
    return createStreamingMediaComponent({
      config,
      trackMediaEvent,
      mediaResponseHandler,
      trackMediaSession,
    });
  };
  createStreamingMedia.namespace = "Streaming media";
  createStreamingMedia.configValidators = configValidators$1;

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // Cookie Keys
  const ADVERTISING_COOKIE_KEY = "advertising";
  const LAST_CLICK_COOKIE_KEY = "_les_lsc";
  const LAST_CONVERSION_TIME_KEY = "lastConversionTime";
  const DISPLAY_CLICK_COOKIE_KEY_EXPIRES = "displayClickCookieExpires";
  const RAMP_ID_EXPIRES = "rampIdExpires";
  const LAST_CONVERSION_TIME_KEY_EXPIRES = "lastConversionTimeExpires";
  // URL Parameters
  const SKWCID_PARAM = "s_kwcid";
  const EFID_PARAM = "ef_id";

  // Identity Types
  const SURFER_ID = "surferId";
  const RAMP_ID = "rampId";
  const ID5_ID = "id5Id";

  // Default Values
  const UNKNOWN_ADVERTISER = "";
  const DEFAULT_THROTTLE_MINUTES = 30;
  const DEFAULT_COOKIE_EXPIRATION_MINUTES = 527040; // 365 days

  // Event Types
  const AD_CONVERSION_CLICK_EVENT_TYPE = "advertising.enrichment_ct";
  const AD_CONVERSION_VIEW_EVENT_TYPE = "advertising.enrichment";
  const TRACKING_CODE = "trackingCode";
  const TRACKING_IDENTITIES = "trackingIdentities";

  // Script URLs
  const ID5_SCRIPT_URL = "https://www.everestjs.net/static/id5-api.js";

  // Surfer ID Configuration
  const SURFER_PIXEL_HOST = "pixel.everesttech.net";
  const SURFER_USER_ID = "1";
  const SURFER_TIMEOUT_MS = 5000;
  const SURFER_TRUSTED_ORIGIN = "www.everestjs.net";
  const SURFER_PARAM_KEY = "gsurfer";

  // Log Messages
  const LOG_AD_CONVERSION_START = "Processing ad conversion";
  const LOG_ERROR_RESOLVING_ID = "Unable to obtain ad identity";
  const LOG_ID_CONVERSION_SUCCESS = "Ad conversion submitted successfully";
  const LOG_AD_CONVERSION_FAILED = "Ad conversion submission failed";
  const DISPLAY_CLICK_COOKIE_KEY = "ev_lcc";

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

  /**
   * Handles click-through ad conversions
   * @param {Object} params - All required parameters
   * @param {Object} params.eventManager - Event manager for creating events
   * @param {Object} params.cookieManager - Session manager for cookie operations
   * @param {Object} params.adConversionHandler - Handler for sending ad conversion events
   * @param {Object} params.logger - Logger instance
   * @param {string} params.skwcid - Search keyword click ID
   * @param {string} params.efid - EF ID parameter
   * @param {Object} params.optionsFromCommand - Additional options from command
   * @returns {Promise} Result of the ad conversion tracking
   */
  async function handleClickThrough({
    eventManager,
    cookieManager,
    adConversionHandler,
    logger,
    skwcid,
    efid,
  }) {
    logger.info(LOG_AD_CONVERSION_START, {
      skwcid,
      efid,
    });
    const event = eventManager.createEvent();
    if (
      typeof skwcid !== "undefined" &&
      typeof efid !== "undefined" &&
      skwcid.startsWith("AL!")
    ) {
      const clickData = {
        click_time: Date.now(),
        ...(typeof skwcid !== "undefined" && {
          skwcid,
        }),
        ...(typeof efid !== "undefined" && {
          efid,
        }),
      };
      cookieManager.setValue(LAST_CLICK_COOKIE_KEY, clickData);
    }
    const xdm = {
      _experience: {
        adcloud: {
          conversionDetails: {
            ...(typeof skwcid !== "undefined" && {
              [TRACKING_CODE]: skwcid,
            }),
            ...(typeof efid !== "undefined" && {
              [TRACKING_IDENTITIES]: efid,
            }),
          },
        },
      },
      eventType: AD_CONVERSION_CLICK_EVENT_TYPE,
    };
    event.setUserXdm(xdm);
    cookieManager.setValue(LAST_CONVERSION_TIME_KEY);
    cookieManager.setValue(
      LAST_CONVERSION_TIME_KEY_EXPIRES,
      Date.now() + 91 * 24 * 60 * 60 * 1000,
    ); //expires in 91 days

    try {
      return await adConversionHandler.trackAdConversion({
        event,
      });
    } catch (error) {
      logger.error(LOG_AD_CONVERSION_FAILED, error);
      throw error;
    }
  }

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed under the Apache License, Version 2.0.
  */

  let surferId = "";
  let displayClickCookie = "";
  let inProgressSurferPromise = null;
  const addToDom = (element) => {
    if (document.body) {
      document.body.appendChild(element);
    } else {
      window.addEventListener(
        "load",
        () => {
          document.body.appendChild(element);
        },
        false,
      );
    }
  };
  const getInvisibleIframeElement = (url) =>
    createNode(
      "iframe",
      {
        src: url,
      },
      {
        height: 0,
        width: 0,
        frameBorder: 0,
        style: {
          display: "none",
        },
      },
      [],
    );
  const addListener = (fn) => window.addEventListener("message", fn, false);
  const removeListener = (fn) =>
    window.removeEventListener("message", fn, false);
  const initiateAdvertisingIdentityCall = () => {
    if (inProgressSurferPromise) {
      return inProgressSurferPromise;
    }
    inProgressSurferPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const scheme =
          document.location.protocol === "https:" ? "https:" : "http:";
        const nestedParams = new URLSearchParams({
          google: "__EFGCK__",
          gsurfer: "__EFGSURFER__",
          imsId: "__EFIMSORGID__",
          is_fb_cookie_synced: "__EFFB__",
          optout: "__EFOPTOUT__",
          throttleCookie: "__EFSYNC__",
          time: "__EFTIME__",
          ev_lcc: "__LCC__",
        });
        const nestedUrl =
          scheme +
          "//www.everestjs.net/static/pixel_details.html#" +
          nestedParams.toString();
        const mainParams = new URLSearchParams({
          ev_gb: "0",
          url: nestedUrl,
        });
        const pixelDetailsUrl =
          scheme +
          "//" +
          SURFER_PIXEL_HOST +
          "/" +
          SURFER_USER_ID +
          "/gr?" +
          mainParams.toString();
        const iframeElement = getInvisibleIframeElement(pixelDetailsUrl);
        addToDom(iframeElement);
        const pixelDetailsReceiver = function pixelDetailsReceiver(message) {
          if (!message.origin.includes(SURFER_TRUSTED_ORIGIN)) {
            return;
          }
          try {
            const pixelRedirectUri = message.data;
            const hashIndex = pixelRedirectUri.indexOf("#");
            if (hashIndex === -1) {
              resolve({
                surferId: null,
                displayClickCookie: null,
              });
              return;
            }
            const hashParams = new URLSearchParams(
              pixelRedirectUri.substring(hashIndex + 1),
            );
            let resolvedSurferId;
            let resolvedDisplayClickCookie;
            const surferValue = hashParams.get(SURFER_PARAM_KEY);
            if (surferValue) {
              resolvedSurferId = surferValue;
            }
            const displayClickValue = hashParams.get(DISPLAY_CLICK_COOKIE_KEY);
            if (displayClickValue && displayClickValue !== "__LCC__") {
              resolvedDisplayClickCookie = displayClickValue;
            }
            removeListener(pixelDetailsReceiver);
            if (resolvedSurferId) {
              surferId = resolvedSurferId;
              displayClickCookie = resolvedDisplayClickCookie;
              resolve({
                surferId,
                displayClickCookie,
              });
            } else {
              resolve({
                surferId: null,
                displayClickCookie: null,
              });
            }
          } catch (err) {
            reject(err);
          } finally {
            inProgressSurferPromise = null;
          }
        };
        addListener(pixelDetailsReceiver);
      }, SURFER_TIMEOUT_MS);
    });
    return inProgressSurferPromise;
  };
  const collectSurferId = function collectSurferId(
    cookieManager,
    getBrowser,
    resolveSurferIdIfNotAvailable = true,
  ) {
    if (getBrowser) {
      const areThirdPartyCookiesSupportedByDefault =
        injectAreThirdPartyCookiesSupportedByDefault({
          getBrowser,
        });
      if (!areThirdPartyCookiesSupportedByDefault()) {
        return Promise.resolve(null);
      }
    }
    if (surferId && surferId !== "") {
      return Promise.resolve(surferId);
    }
    if (cookieManager) {
      const cookieSurferId = cookieManager.getValue(SURFER_ID);
      if (cookieSurferId) {
        surferId = cookieSurferId;
        return Promise.resolve(cookieSurferId);
      }
    }
    if (resolveSurferIdIfNotAvailable) {
      return initiateAdvertisingIdentityCall().then((resolvedId) => {
        if (cookieManager && resolvedId) {
          if (resolvedId.surferId) {
            cookieManager.setValue(SURFER_ID, resolvedId.surferId);
          }
          if (resolvedId.displayClickCookie) {
            cookieManager.setValue(
              DISPLAY_CLICK_COOKIE_KEY,
              resolvedId.displayClickCookie,
            );
            cookieManager.setValue(
              DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
              Date.now() + 15 * 60 * 1000,
            );
          }
        }
        return resolvedId.surferId;
      });
    }
    return Promise.resolve(null);
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const RETRY_CONFIG = {
    MAX_COUNT: 15,
    MAX_TIME_MS: 30000,
    DELAY_BASE_MS: 500,
    MAX_DELAY_MS: 5000,
    SHORT_TIMEOUT_MS: 5000,
  };
  const state = {
    rampIdEnv: undefined,
    rampIdCallInitiated: false,
    inProgressRampIdPromise: null,
    envelopeRetrievalInProgress: false,
  };
  const processEnvelope = (envelope, resolve, cookieManager, logger) => {
    let parsedEnvelope;
    try {
      parsedEnvelope = JSON.parse(envelope).envelope;
    } catch {
      parsedEnvelope = envelope;
    }
    if (parsedEnvelope && !state.rampIdCallInitiated) {
      state.rampIdCallInitiated = true;
      state.rampIdEnv = parsedEnvelope;
      state.envelopeRetrievalInProgress = false;
      state.inProgressRampIdPromise = null;
      cookieManager.setValue(RAMP_ID, state.rampIdEnv);
      cookieManager.setValue(RAMP_ID_EXPIRES, Date.now() + 48 * 60 * 60 * 1000); //expires in 48 hours
      resolve(state.rampIdEnv);
    } else {
      logger.warn("Invalid RampID envelope received", {
        envelope: parsedEnvelope,
      });
      state.envelopeRetrievalInProgress = false;
    }
  };
  const retrieveEnvelopeWithRetries = (
    resolve,
    reject,
    cookieManager,
    logger,
  ) => {
    let retryCount = RETRY_CONFIG.MAX_COUNT;
    let timerMultiplier = 1;
    let totalElapsedTime = 0;
    const tryToRetrieve = () => {
      if (state.rampIdEnv) return;
      if (totalElapsedTime > RETRY_CONFIG.MAX_TIME_MS) {
        logger.error("Maximum retry time exceeded");
        state.envelopeRetrievalInProgress = false;
        reject(new Error("Failed to retrieve RampID - timeout"));
        state.inProgressRampIdPromise = null;
        return;
      }
      if (retryCount === 0) {
        logger.error("Maximum retries exceeded");
        state.envelopeRetrievalInProgress = false;
        reject(new Error("Failed to retrieve RampID after maximum retries"));
        state.inProgressRampIdPromise = null;
        return;
      }
      const delay = Math.min(
        RETRY_CONFIG.DELAY_BASE_MS * timerMultiplier,
        RETRY_CONFIG.MAX_DELAY_MS,
      );
      setTimeout(() => {
        totalElapsedTime += delay;
        retryCount -= 1;
        timerMultiplier += 1;
        if (
          typeof window.ats !== "undefined" &&
          window.ats !== null &&
          !state.rampIdEnv &&
          !state.envelopeRetrievalInProgress
        ) {
          state.envelopeRetrievalInProgress = true;
          window.ats.retrieveEnvelope().then(
            (rampIdResponse) => {
              processEnvelope(rampIdResponse, resolve, cookieManager, logger);
              if (!state.rampIdEnv) tryToRetrieve();
            },
            () => {
              logger.warn("Failed to retrieve envelope");
              state.envelopeRetrievalInProgress = false;
              tryToRetrieve();
            },
          );
        } else {
          tryToRetrieve();
        }
      }, delay);
    };
    tryToRetrieve();
  };
  const initiateRampIDCall = (
    rampIdScriptPath,
    cookieManager,
    logger,
    useShortTimeout = false,
  ) => {
    if (state.inProgressRampIdPromise) {
      return state.inProgressRampIdPromise;
    }
    const timeoutMs = useShortTimeout
      ? RETRY_CONFIG.SHORT_TIMEOUT_MS
      : RETRY_CONFIG.MAX_TIME_MS;
    let timedOut = false;
    const mainPromise = new Promise((resolve, reject) => {
      loadScript$1(rampIdScriptPath, {
        onLoad: () => {
          if (
            typeof window.ats !== "undefined" &&
            !state.envelopeRetrievalInProgress
          ) {
            state.envelopeRetrievalInProgress = true;
            window.ats
              .retrieveEnvelope()
              .then((envelopeResponse) => {
                if (envelopeResponse) {
                  if (!timedOut) {
                    processEnvelope(
                      envelopeResponse,
                      resolve,
                      cookieManager,
                      logger,
                    );
                  }
                } else {
                  state.envelopeRetrievalInProgress = false;
                  window.addEventListener("lrEnvelopePresent", () => {
                    if (state.envelopeRetrievalInProgress || timedOut) return;
                    state.envelopeRetrievalInProgress = true;
                    window.ats.retrieveEnvelope().then(
                      (envelopeResult) => {
                        if (!timedOut) {
                          processEnvelope(
                            envelopeResult,
                            resolve,
                            cookieManager,
                            logger,
                          );
                        }
                      },
                      (error) => {
                        if (!timedOut) {
                          logger.error(
                            "Failed to retrieve envelope after event",
                            error,
                          );
                          state.envelopeRetrievalInProgress = false;
                          reject(error);
                          state.inProgressRampIdPromise = null;
                        }
                      },
                    );
                  });
                }
              })
              .catch((error) => {
                if (!timedOut) {
                  logger.error("Error retrieving envelope", error);
                  state.envelopeRetrievalInProgress = false;
                  reject(error);
                  state.inProgressRampIdPromise = null;
                }
              });
          }
          retrieveEnvelopeWithRetries(
            (val) => {
              if (!timedOut) resolve(val);
            },
            (err) => {
              if (!timedOut) reject(err);
            },
            cookieManager,
            logger,
          );
        },
        onError: (error) => {
          if (!timedOut) {
            reject(error);
          }
          state.inProgressRampIdPromise = null;
        },
      });
    });
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        timedOut = true;
        resolve(null);
      }, timeoutMs);
    });
    state.inProgressRampIdPromise = Promise.race([
      mainPromise,
      timeoutPromise,
    ]).finally(() => {
      state.inProgressRampIdPromise = null;
    });
    return state.inProgressRampIdPromise;
  };
  const getRampId = (
    logger,
    rampIdScriptPath,
    cookieManager,
    resolveRampIdIfNotAvailable = true,
    useShortTimeout = false,
  ) => {
    if (state.rampIdEnv) {
      return Promise.resolve(state.rampIdEnv);
    }
    if (cookieManager) {
      const rampIdFromCookie = cookieManager.getValue(RAMP_ID);
      const rampIdExpires = cookieManager.getValue(RAMP_ID_EXPIRES);
      if (rampIdFromCookie && rampIdExpires && rampIdExpires > Date.now()) {
        state.rampIdEnv = rampIdFromCookie;
        return Promise.resolve(rampIdFromCookie);
      }
    }
    if (!resolveRampIdIfNotAvailable || rampIdScriptPath == null) {
      return Promise.resolve(null);
    }
    return initiateRampIDCall(
      rampIdScriptPath,
      cookieManager,
      logger,
      useShortTimeout,
    );
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  let id5Id = "";
  let inProgressId5Promise = null;
  const SHORT_TIMEOUT_MS = 5000;
  const DEFAULT_TIMEOUT_MS = 30000;
  const initiateID5Call = (partnerId, useShortTimeout, logger) => {
    partnerId = Math.floor(Number(partnerId));
    if (inProgressId5Promise) {
      return inProgressId5Promise;
    }
    const timeoutMs = useShortTimeout ? SHORT_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
    let iD5TimedOut = false;
    const id5ResolutionPromise = new Promise((resolve, reject) => {
      if (!partnerId) {
        logger.error("Missing partner ID");
        reject(new Error("ID5 partner ID is required"));
        return;
      }
      const handleId5 = () => {
        try {
          if (typeof window.ID5 === "undefined") {
            reject(new Error("ID5 object not available after script load"));
            return;
          }
          const id5Instance = window.ID5.init({
            partnerId,
          });
          id5Id = id5Instance.getUserId();
          const safeResolve = (val) => {
            if (!iD5TimedOut) resolve(val);
          };
          if (!id5Id) {
            window.ID5.init({
              partnerId,
            }).onAvailable(function firstRetry(retryStatus) {
              id5Id = retryStatus.getUserId();
              if (id5Id) {
                safeResolve(id5Id);
              } else {
                window.ID5.init({
                  partnerId,
                }).onAvailable(function secondRetry(secondRetryStatus) {
                  id5Id = secondRetryStatus.getUserId();
                  if (id5Id) {
                    safeResolve(id5Id);
                  } else {
                    logger.error("Failed to get ID5 ID after all retries");
                    safeResolve(null);
                  }
                });
              }
            }, 1000);
          } else {
            safeResolve(id5Id);
          }
        } catch (error) {
          logger.error("Error during ID5 initialization", error);
          reject(error);
        }
      };
      if (typeof window.ID5 !== "undefined") {
        handleId5();
      } else {
        loadScript$1(ID5_SCRIPT_URL, {
          onLoad: handleId5,
          onError: (error) => {
            logger.error("Script loading failed", error);
            reject(error);
          },
        });
      }
    });
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        iD5TimedOut = true;
        resolve(null);
      }, timeoutMs);
    });
    inProgressId5Promise = Promise.race([
      id5ResolutionPromise,
      timeoutPromise,
    ]).finally(() => {
      inProgressId5Promise = null;
    });
    return inProgressId5Promise;
  };
  const getID5Id = function getID5Id(
    logger,
    partnerId,
    resolveId5IfNotAvailable = true,
    useShortTimeout = false,
  ) {
    if (id5Id && id5Id !== "") {
      return Promise.resolve(id5Id);
    }
    if (!resolveId5IfNotAvailable) {
      return Promise.resolve(null);
    }
    return initiateID5Call(partnerId, useShortTimeout, logger)
      .then((resolvedId) => resolvedId)
      .catch((error) => {
        logger.error("Failed to get ID5 ID", error);
        throw error;
      });
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const getUrlParams = () => {
    const parsedParams = queryString.parse(window.location.search);
    return {
      skwcid: parsedParams[SKWCID_PARAM],
      // "s_kwcid"
      efid: parsedParams[EFID_PARAM], // "ef_id"
    };
  };

  /**
   * Normalizes advertiser settings - extracts enabled advertiser IDs
   * @param {Object[]} advertiserSettings - Array of advertiserSettings objects with advertiserId and enabled properties
   * @returns {string} Comma-separated string of enabled advertiser IDs
   */
  const normalizeAdvertiser = (advertiserSettings) => {
    if (!advertiserSettings || !Array.isArray(advertiserSettings)) {
      return UNKNOWN_ADVERTISER;
    }
    return advertiserSettings
      .filter((item) => item && item.enabled === true && item.advertiserId)
      .map((item) => item.advertiserId)
      .join(", ");
  };
  const appendAdvertisingIdQueryToEvent = (
    idsToInclude,
    event,
    cookieManager,
    componentConfig,
    addEventType = false,
  ) => {
    const searchClickData = cookieManager.getValue(LAST_CLICK_COOKIE_KEY);
    let displayClickCookie = null;
    const displayClickCookieExpires = cookieManager.getValue(
      DISPLAY_CLICK_COOKIE_KEY_EXPIRES,
    );
    if (displayClickCookieExpires && displayClickCookieExpires > Date.now()) {
      displayClickCookie = cookieManager.getValue(DISPLAY_CLICK_COOKIE_KEY);
    }
    const query = {
      advertising: {
        ...(searchClickData?.click_time && {
          lastSearchClick: searchClickData.click_time,
        }),
        ...(displayClickCookie && {
          lastDisplayClick: displayClickCookie,
        }),
        stitchIds: {
          ...(idsToInclude[SURFER_ID] && {
            surferId: idsToInclude[SURFER_ID],
          }),
          ...(idsToInclude[ID5_ID] && {
            id5: idsToInclude[ID5_ID],
          }),
          ...(idsToInclude[RAMP_ID] && {
            rampIdEnv: idsToInclude[RAMP_ID],
          }),
          ipAddress: "DUMMY_IP_ADDRESS",
        },
        advIds: normalizeAdvertiser(componentConfig.advertiserSettings),
        ...(addEventType && {
          eventType: AD_CONVERSION_VIEW_EVENT_TYPE,
        }),
      },
    };
    event.mergeQuery(query);
    return event;
  };
  const isAnyIdUnused = (availableIds, conversionCalled) => {
    return Object.entries(availableIds).some(([idType]) => {
      return !conversionCalled[idType];
    });
  };
  const markIdsAsConverted = (
    idTypes,
    conversionCalled,
    cookieManager,
    logger,
  ) => {
    const now = Date.now();
    idTypes.forEach((idType) => {
      conversionCalled[idType] = true;
      cookieManager.setValue(idType + "_last_conversion", now);
      logger.info(LOG_ID_CONVERSION_SUCCESS.replace("{0}", idType));
    });
    cookieManager.setValue(LAST_CONVERSION_TIME_KEY, now);
  };
  const isThrottled = (idType, cookieManager) => {
    const now = Date.now();
    const THROTTLE_WINDOW = 30 * 60 * 1000; // 30 minutes
    const lastSuccessfulConversion = cookieManager.getValue(
      idType + "_last_conversion",
    );
    return Boolean(
      lastSuccessfulConversion &&
        now - lastSuccessfulConversion < THROTTLE_WINDOW,
    );
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  const collectAllIdentities = (
    logger,
    componentConfig,
    cookieManager,
    getBrowser,
  ) => {
    const promises = {};
    if (!isThrottled(SURFER_ID, cookieManager)) {
      promises.surferId = collectSurferId(
        cookieManager,
        getBrowser,
        true,
      ).catch(() => null);
    }
    if (
      componentConfig.id5PartnerId &&
      componentConfig.dspEnabled &&
      !isThrottled(ID5_ID, cookieManager)
    ) {
      promises.id5Id = getID5Id(logger, componentConfig.id5PartnerId).catch(
        () => null,
      );
    }
    if (
      componentConfig.rampIdJSPath &&
      componentConfig.dspEnabled &&
      !isThrottled(RAMP_ID, cookieManager)
    ) {
      promises.rampId = getRampId(
        logger,
        componentConfig.rampIdJSPath,
        cookieManager,
        true,
      ).catch(() => null);
    }
    return promises;
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  Licensed under the Apache License, Version 2.0.
  http://www.apache.org/licenses/LICENSE-2.0
  */

  async function handleViewThrough({
    eventManager,
    cookieManager,
    logger,
    componentConfig,
    adConversionHandler,
    getBrowser,
  }) {
    const resolvedIds = {};
    const usedIdTracker = {};
    const triggerConversion = async () => {
      if (!isAnyIdUnused(resolvedIds, usedIdTracker)) return null;
      const idTypesToUse = Object.keys(resolvedIds);
      try {
        const event = appendAdvertisingIdQueryToEvent(
          resolvedIds,
          eventManager.createEvent(),
          cookieManager,
          componentConfig,
          true,
        );
        const xdm = {
          eventType: AD_CONVERSION_VIEW_EVENT_TYPE,
        };
        event.setUserXdm(xdm);
        const result = await adConversionHandler.trackAdConversion({
          event,
        });
        markIdsAsConverted(idTypesToUse, usedIdTracker, cookieManager, logger);
        return result;
      } catch (error) {
        logger.error(LOG_AD_CONVERSION_FAILED, error);
        return null;
      }
    };
    const identityPromisesMap = collectAllIdentities(
      logger,
      componentConfig,
      cookieManager,
      getBrowser,
    );
    if (Object.keys(identityPromisesMap).length === 0) {
      return [];
    }
    const identityPromises = Object.entries(identityPromisesMap).map(
      ([idType, idPromise]) =>
        idPromise
          .then((idValue) => {
            if (idValue) {
              resolvedIds[idType] = idValue;
              return triggerConversion(); // Return the promise directly
            }
          })
          .catch((error) => {
            logger.error(LOG_ERROR_RESOLVING_ID.replace("{0}", idType), error);
            return null;
          }),
    );
    return Promise.allSettled(identityPromises); // Remove the separate conversionTasks handling
  }

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

  /**
   * Creates a handler for sending ad conversions.
   * Handles both click-through and view-through conversions.
   * This is a workaround to avoid the full lifecycle of the eventManager.sendEvent
   */
  var createSendAdConversion = ({
    eventManager,
    cookieManager,
    adConversionHandler,
    logger,
    componentConfig,
    getBrowser,
  }) => {
    const activeAdvertiserIds = componentConfig?.advertiserSettings
      ? normalizeAdvertiser(componentConfig.advertiserSettings)
      : "";
    return async () => {
      const { skwcid, efid } = getUrlParams();
      const isClickThru = !!(skwcid && efid);
      try {
        let result = null;
        if (isClickThru) {
          result = await handleClickThrough({
            eventManager,
            cookieManager,
            adConversionHandler,
            logger,
            skwcid,
            efid,
          });
          return result;
        } else if (activeAdvertiserIds) {
          result = await handleViewThrough({
            eventManager,
            cookieManager,
            logger,
            componentConfig,
            adConversionHandler,
            getBrowser,
          });
          return result;
        }
        return null;
      } catch (error) {
        logger.error("Error in sendAdConversion:", error);
      }
    };
  };

  /*
  Copyright 2023 Adobe. All rights reserved.
  Licensed under the Apache License, Version 2.0.
  http://www.apache.org/licenses/LICENSE-2.0
  */

  const isAdvertisingDisabled = (advertising) => {
    return ![AUTO, WAIT].includes(advertising?.handleAdvertisingData);
  };
  const waitForAdvertisingId = (advertising) => {
    return advertising?.handleAdvertisingData === WAIT;
  };

  /**
   * Appends advertising identity IDs to AEP event query if not already added.
   * @param {Object} params
   * @param {Object} params.cookieManager
   * @param {Object} params.logger
   * @param {Object} params.state
   * @param {Object} params.event
   * @param {Object} params.componentConfig
   * @param {Object} params.advertising
   * @param {Function} params.getBrowser
   */
  async function handleOnBeforeSendEvent({
    cookieManager,
    logger,
    event,
    componentConfig,
    advertising,
    getBrowser,
  }) {
    const { skwcid, efid } = getUrlParams();
    const isClickThru = !!(skwcid && efid);
    if (
      isAdvertisingDisabled(advertising) ||
      isClickThru ||
      (isThrottled(SURFER_ID, cookieManager) &&
        isThrottled(ID5_ID, cookieManager) &&
        isThrottled(RAMP_ID, cookieManager))
    )
      return;
    try {
      const useShortTimeout = waitForAdvertisingId(advertising);
      const [surferIdResult, id5IdResult, rampIdResult] =
        await Promise.allSettled([
          collectSurferId(cookieManager, getBrowser, useShortTimeout),
          getID5Id(
            logger,
            componentConfig.id5PartnerId,
            useShortTimeout,
            useShortTimeout,
          ),
          getRampId(
            logger,
            componentConfig.rampIdJSPath,
            cookieManager,
            useShortTimeout,
            useShortTimeout,
          ),
        ]);
      const availableIds = {};
      if (
        surferIdResult.status === "fulfilled" &&
        surferIdResult.value &&
        !isThrottled(SURFER_ID, cookieManager)
      ) {
        availableIds.surferId = surferIdResult.value;
      }
      if (
        id5IdResult.status === "fulfilled" &&
        id5IdResult.value &&
        !isThrottled(ID5_ID, cookieManager)
      ) {
        availableIds.id5Id = id5IdResult.value;
      }
      if (
        rampIdResult.status === "fulfilled" &&
        rampIdResult.value &&
        !isThrottled(RAMP_ID, cookieManager)
      ) {
        availableIds.rampId = rampIdResult.value;
      }
      // If no IDs are available and any ID is throttled, return , because we dont have new info to send
      if (
        Object.keys(availableIds).length === 0 &&
        (isThrottled(SURFER_ID, cookieManager) ||
          isThrottled(ID5_ID, cookieManager) ||
          isThrottled(RAMP_ID, cookieManager))
      ) {
        return;
      }
      appendAdvertisingIdQueryToEvent(
        availableIds,
        event,
        cookieManager,
        componentConfig,
      );
    } catch (error) {
      logger.error("Error in onBeforeSendEvent hook:", error);
    }
  }

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

  var createComponent = ({
    logger,
    config,
    eventManager,
    cookieManager,
    adConversionHandler,
    getBrowser,
  }) => {
    const componentConfig = config.advertising;
    const sharedState = {
      processedAdvertisingIds: false,
    };
    const sendAdConversionHandler = createSendAdConversion({
      eventManager,
      cookieManager,
      adConversionHandler,
      logger,
      componentConfig,
      getBrowser,
    });
    return {
      lifecycle: {
        onComponentsRegistered() {
          sendAdConversionHandler(sharedState);
        },
        onBeforeEvent: ({ event, advertising = {} }) => {
          return handleOnBeforeSendEvent({
            cookieManager,
            logger,
            event,
            componentConfig,
            advertising,
            getBrowser,
          });
        },
      },
    };
  };

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

  var configValidators = boundObjectOf({
    advertising: boundObjectOf({
      id5PartnerId: boundString(),
      rampIdJSPath: boundString(),
      dspEnabled: boundBoolean(),
      advertiserSettings: boundArrayOf(
        boundObjectOf({
          advertiserId: boundString().required(),
          enabled: boundBoolean().required(),
        }).noUnknownFields(),
      ),
    }).noUnknownFields(),
  });

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

  /**
   * Creates a specialized handler for ad conversion events.
   * This follows a similar pattern to the media event handling in the StreamingMedia component.
   */
  var createAdConversionHandler = ({
    sendEdgeNetworkRequest,
    consent,
    createDataCollectionRequest,
    createDataCollectionRequestPayload,
    logger,
  }) => {
    /**
     * Tracks an ad conversion event by sending it directly to the Edge Network
     */
    const trackAdConversion = ({ event }) => {
      const dataCollectionRequestPayload = createDataCollectionRequestPayload();
      dataCollectionRequestPayload.addEvent(event);
      event.finalize();
      const request = createDataCollectionRequest({
        payload: dataCollectionRequestPayload,
      });
      return consent.awaitConsent().then(() => {
        return sendEdgeNetworkRequest({
          request,
        })
          .then(() => {
            return {
              success: true,
            };
          })
          .catch((error) => {
            logger.error("Failed to send ad conversion event", error);
            throw error;
          });
      });
    };
    return {
      trackAdConversion,
    };
  };

  /*
  Copyright 2025 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  var createCookieManager = ({ orgId, logger }) => {
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar,
    });
    const getCookieName = (key, useNamespace = true) =>
      useNamespace ? getNamespacedCookieName(orgId, key) : key;
    const getDefaultExpiration = (minutes = DEFAULT_THROTTLE_MINUTES) =>
      new Date(Date.now() + minutes * 60 * 1000);
    const safeJsonParse = (value) => {
      try {
        if (value?.startsWith("%7B") || value?.startsWith("{")) {
          return JSON.parse(decodeURIComponent(value));
        }
      } catch {
        // pass
      }
      return value;
    };
    const safeJsonStringify = (value) =>
      typeof value === "object" && value !== null
        ? encodeURIComponent(JSON.stringify(value))
        : value;
    const readCookie = (key, useNamespace = true) => {
      try {
        const name = getCookieName(key, useNamespace);
        const value = loggingCookieJar.get(name);
        return value ? safeJsonParse(value) : null;
      } catch (error) {
        logger.error("Error reading cookie: " + key, error);
        return null;
      }
    };
    const writeCookie = (key, value, options = {}, useNamespace = true) => {
      try {
        const name = getCookieName(key, useNamespace);
        const storedValue = safeJsonStringify(value);
        loggingCookieJar.set(name, storedValue, options);
        return true;
      } catch (error) {
        logger.error("Error writing cookie: " + key, error);
        return false;
      }
    };
    const setValue = (key, value, options = {}) => {
      const existing = readCookie(ADVERTISING_COOKIE_KEY) || {};
      const updated = {
        ...existing,
        [key]: value,
      };
      return writeCookie(ADVERTISING_COOKIE_KEY, updated, {
        expires: getDefaultExpiration(DEFAULT_COOKIE_EXPIRATION_MINUTES),
        ...options,
      });
    };
    const getValue = (key) => {
      const data = readCookie(ADVERTISING_COOKIE_KEY) || {};
      return data[key];
    };
    return {
      setValue,
      getValue,
    };
  };

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

  const createAdvertising = ({
    logger,
    config,
    eventManager,
    sendEdgeNetworkRequest,
    consent,
    getBrowser,
  }) => {
    const cookieManager = createCookieManager({
      orgId: config.orgId,
      logger,
    });
    const adConversionHandler = createAdConversionHandler({
      sendEdgeNetworkRequest,
      consent,
      createDataCollectionRequest,
      createDataCollectionRequestPayload,
      logger,
    });
    return createComponent({
      logger,
      config,
      eventManager,
      cookieManager,
      adConversionHandler,
      getBrowser,
    });
  };
  createAdvertising.namespace = "Advertising";
  createAdvertising.configValidators = configValidators;

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

  var components = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    activityCollector: createActivityCollector,
    advertising: createAdvertising,
    audiences: createAudiences,
    consent: createConsent,
    eventMerge: createEventMerge,
    mediaAnalyticsBridge: createMediaAnalyticsBridge,
    personalization: createPersonalization,
    rulesEngine: createRulesEngine,
    streamingMedia: createStreamingMedia,
  });

  /*
  Copyright 2020 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */

  // If you change this line, check if the custom build script is still working.
  // You might need to change the babel plugin in scripts/helpers/entryPointGeneratorBabelPlugin.js.
  core({
    components: Object.values(components),
  });
})();
//# sourceMappingURL=alloy.js.map
