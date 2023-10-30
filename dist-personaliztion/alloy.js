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
(function () {
  'use strict';

  if (document.documentMode && document.documentMode < 11) {
    console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');
    return;
  }


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

  var createInstanceFunction = (executeCommand => {
    return args => {
      // Would use destructuring, but destructuring doesn't work on IE
      // without polyfilling Symbol.
      // https://github.com/babel/babel/issues/7597
      const resolve = args[0];
      const reject = args[1];
      const userProvidedArgs = args[2];
      const commandName = userProvidedArgs[0];
      const options = userProvidedArgs[1];
      executeCommand(commandName, options).then(resolve, reject);
    };
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

  const CHROME = "Chrome";
  const EDGE$1 = "Edge";
  const EDGE_CHROMIUM = "EdgeChromium";
  const FIREFOX = "Firefox";
  const IE = "IE";
  const SAFARI = "Safari";
  const UNKNOWN = "Unknown";

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
   * Determines whether an array includes a certain value.
   * @param {Array} arr Array to search.
   * @param {*} item The item for which to search.
   * @returns {boolean}
   */
  var includes = ((arr, item) => {
    return arr.indexOf(item) !== -1;
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

  // Users could have also disabled third-party cookies within these browsers, but
  // we don't know. We also assume "unknown" browsers support third-party cookies,
  // though we don't really know that either. We're making best guesses.
  const browsersSupportingThirdPartyCookie = [CHROME, EDGE$1, EDGE_CHROMIUM, IE, UNKNOWN];
  var areThirdPartyCookiesSupportedByDefault = (browser => includes(browsersSupportingThirdPartyCookie, browser));

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function getAugmentedNamespace(n) {
    if (n.__esModule) return n;
    var f = n.default;
  	if (typeof f == "function") {
  		var a = function a () {
  			if (this instanceof a) {
          return Reflect.construct(f, arguments, this.constructor);
  			}
  			return f.apply(this, arguments);
  		};
  		a.prototype = f.prototype;
    } else a = {};
    Object.defineProperty(a, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var propIsEnumerable = Object.prototype.propertyIsEnumerable;
  function toObject(val) {
    if (val === null || val === undefined) {
      throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    return Object(val);
  }
  function shouldUseNative() {
    try {
      if (!Object.assign) {
        return false;
      }

      // Detect buggy property enumeration order in older V8 versions.

      // https://bugs.chromium.org/p/v8/issues/detail?id=4118
      var test1 = new String('abc'); // eslint-disable-line no-new-wrappers
      test1[5] = 'de';
      if (Object.getOwnPropertyNames(test1)[0] === '5') {
        return false;
      }

      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test2 = {};
      for (var i = 0; i < 10; i++) {
        test2['_' + String.fromCharCode(i)] = i;
      }
      var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
        return test2[n];
      });
      if (order2.join('') !== '0123456789') {
        return false;
      }

      // https://bugs.chromium.org/p/v8/issues/detail?id=3056
      var test3 = {};
      'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
        test3[letter] = letter;
      });
      if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
        return false;
      }
      return true;
    } catch (err) {
      // We don't expect any of the above to throw, but better to be safe.
      return false;
    }
  }
  var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
    var from;
    var to = toObject(target);
    var symbols;
    for (var s = 1; s < arguments.length; s++) {
      from = Object(arguments[s]);
      for (var key in from) {
        if (hasOwnProperty$1.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnPropertySymbols) {
        symbols = getOwnPropertySymbols(from);
        for (var i = 0; i < symbols.length; i++) {
          if (propIsEnumerable.call(from, symbols[i])) {
            to[symbols[i]] = from[symbols[i]];
          }
        }
      }
    }
    return to;
  };

  var reactorObjectAssign = objectAssign;
  var assign = /*@__PURE__*/getDefaultExportFromCjs(reactorObjectAssign);

  var js_cookie = {exports: {}};

  /*!
   * JavaScript Cookie v2.2.1
   * https://github.com/js-cookie/js-cookie
   *
   * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
   * Released under the MIT license
   */
  js_cookie.exports;
  (function (module, exports) {
    (function (factory) {
      var registeredInModuleLoader;
      {
        module.exports = factory();
        registeredInModuleLoader = true;
      }
      if (!registeredInModuleLoader) {
        var OldCookies = window.Cookies;
        var api = window.Cookies = factory();
        api.noConflict = function () {
          window.Cookies = OldCookies;
          return api;
        };
      }
    })(function () {
      function extend() {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
          var attributes = arguments[i];
          for (var key in attributes) {
            result[key] = attributes[key];
          }
        }
        return result;
      }
      function decode(s) {
        return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
      }
      function init(converter) {
        function api() {}
        function set(key, value, attributes) {
          if (typeof document === 'undefined') {
            return;
          }
          attributes = extend({
            path: '/'
          }, api.defaults, attributes);
          if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
          }

          // We're using "expires" because "max-age" is not supported by IE
          attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';
          try {
            var result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
              value = result;
            }
          } catch (e) {}
          value = converter.write ? converter.write(value, key) : encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
          key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);
          var stringifiedAttributes = '';
          for (var attributeName in attributes) {
            if (!attributes[attributeName]) {
              continue;
            }
            stringifiedAttributes += '; ' + attributeName;
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
            stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
          }
          return document.cookie = key + '=' + value + stringifiedAttributes;
        }
        function get(key, json) {
          if (typeof document === 'undefined') {
            return;
          }
          var jar = {};
          // To prevent the for loop in the first place assign an empty array
          // in case there are no cookies at all.
          var cookies = document.cookie ? document.cookie.split('; ') : [];
          var i = 0;
          for (; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            var cookie = parts.slice(1).join('=');
            if (!json && cookie.charAt(0) === '"') {
              cookie = cookie.slice(1, -1);
            }
            try {
              var name = decode(parts[0]);
              cookie = (converter.read || converter)(cookie, name) || decode(cookie);
              if (json) {
                try {
                  cookie = JSON.parse(cookie);
                } catch (e) {}
              }
              jar[name] = cookie;
              if (key === name) {
                break;
              }
            } catch (e) {}
          }
          return key ? jar[key] : jar;
        }
        api.set = set;
        api.get = function (key) {
          return get(key, false /* read as raw */);
        };

        api.getJSON = function (key) {
          return get(key, true /* read as json */);
        };

        api.remove = function (key, attributes) {
          set(key, '', extend(attributes, {
            expires: -1
          }));
        };
        api.defaults = {};
        api.withConverter = init;
        return api;
      }
      return init(function () {});
    });
  })(js_cookie, js_cookie.exports);
  var js_cookieExports = js_cookie.exports;
  var cookie = /*@__PURE__*/getDefaultExportFromCjs(js_cookieExports);

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
    get: cookie.get,
    set: cookie.set,
    remove: cookie.remove,
    withConverter: cookie.withConverter
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
  var isNil = (value => value == null);

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
  var isObject = (value => !isNil(value) && !Array.isArray(value) && typeof value === "object");

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
    Object.keys(source).forEach(key => {
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
  var deepAssign = ((target, ...sources) => {
    if (isNil(target)) {
      throw new TypeError('deepAssign "target" cannot be null or undefined');
    }
    const result = Object(target);
    sources.forEach(source => deepAssignObject(result, Object(source)));
    return result;
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

  /**
   * Creates a function that, when passed an object of updates, will merge
   * the updates onto the current value of a payload property.
   * @param {Object} content The base object to modify
   * @param {String } key The property to merge updates into. This
   * can be a dot-notation property path.
   * @returns {Function}
   */
  var createMerger = ((content, key) => updates => {
    const propertyPath = key.split(".");
    const hostObjectForUpdates = propertyPath.reduce((obj, propertyName) => {
      obj[propertyName] = obj[propertyName] || {};
      return obj[propertyName];
    }, content);
    deepAssign(hostObjectForUpdates, updates);
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
   * Allows callbacks to be registered and then later called. When the
   * callbacks are called, their responses are combined into a single promise.
   */
  var createCallbackAggregator = (() => {
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
        return Promise.all(callbacks.map(callback => callback(...args)));
      }
    };
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

  var createLoggingCookieJar = (({
    logger,
    cookieJar
  }) => {
    return {
      ...cookieJar,
      set(key, value, options) {
        logger.info("Setting cookie", {
          name: key,
          value,
          ...options
        });
        cookieJar.set(key, value, options);
      }
    };
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
   * Sequences tasks.
   */
  var createTaskQueue = (() => {
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
        lastPromiseInQueue = lastPromiseInQueue.then(lastPromiseFulfilledHandler, lastPromiseFulfilledHandler);
        return lastPromiseInQueue;
      },
      /**
       * How many tasks are in the queue. This includes the task
       * that's currently running.
       * @returns {number}
       */
      get length() {
        return queueLength;
      }
    };
  });

  /* eslint-disable */

  /*
  crc32 · JavaScript Function to Calculate CRC32 of a String
  Description
    Below is a JavaScript function to calculate CRC32 of a string. 
    The string can be either ASCII or Unicode. 
    Unicode strings will be encoded in UTF-8. 
    The polynomial used in calculation is 0xedb88320. 
    This polynomial is used in Ethernet, Gzip, PNG, SATA and many other technologies.
  */
  const crc32 = (() => {
    const table = [];
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1;
      }
      table.push(c);
    }
    return function (str, crc) {
      str = unescape(encodeURIComponent(str));
      if (!crc) crc = 0;
      crc = crc ^ -1;
      for (let i = 0; i < str.length; i++) {
        const y = (crc ^ str.charCodeAt(i)) & 0xff;
        crc = crc >>> 8 ^ table[y];
      }
      crc = crc ^ -1;
      return crc >>> 0;
    };
  })();

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
  var defer = (() => {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
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
  const REFERENCE_EQUALITY = (a, b) => a === b;
  const findIndex = (array, item, isEqual) => {
    for (let i = 0; i < array.length; i += 1) {
      if (isEqual(array[i], item)) {
        return i;
      }
    }
    return -1;
  };
  var deduplicateArray = ((array, isEqual = REFERENCE_EQUALITY) => {
    return array.filter((item, index) => findIndex(array, item, isEqual) === index);
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

  /**
   * Whether a string ends with the characters of a specified string
   * @param {String} str The string to search within.
   * @param {String} suffix The string to search for.
   * @returns {boolean}
   */
  var endsWith = ((str, suffix) => str.substr(-suffix.length) === suffix);

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
   * Returns the first item in the array that satisfies the provided testing function.
   * @param {Array} arr The array to search.
   * @param {Function} predicate Function that will be called for each item. Arguments
   * will be the item, the item index, then the array itself.
   * @returns {*}
   */
  var find = ((arr, predicate) => {
    for (let i = 0; i < arr.length; i += 1) {
      const item = arr[i];
      if (predicate(item, i, arr)) {
        return item;
      }
    }
    return undefined;
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

  var appendNode = ((parent, node) => {
    return parent.appendChild(node);
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
  const populateElementProperties = (element, props) => {
    Object.keys(props).forEach(key => {
      // The following is to support setting style properties to avoid CSP errors.
      if (key === "style" && isObject(props[key])) {
        const styleProps = props[key];
        Object.keys(styleProps).forEach(styleKey => {
          element.style[styleKey] = styleProps[styleKey];
        });
      } else {
        element[key] = props[key];
      }
    });
  };
  var createNode = ((tag, attrs = {}, props = {}, children = [], doc = document) => {
    const result = doc.createElement(tag);
    Object.keys(attrs).forEach(key => {
      // TODO: To highlight CSP problems consider throwing a descriptive error
      //       if nonce is available and key is style.
      result.setAttribute(key, attrs[key]);
    });
    populateElementProperties(result, props);
    children.forEach(child => appendNode(result, child));
    return result;
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
  var fireImageInDocument = (({
    src,
    currentDocument = document
  }) => {
    return new Promise((resolve, reject) => {
      const attrs = {
        src
      };
      const props = {
        onload: resolve,
        onerror: reject,
        onabort: reject
      };
      createNode(IMG, attrs, props, [], currentDocument);
    });
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

  /**
   * Returns whether the value is a function.
   * @param {*} value
   * @returns {boolean}
   */
  var isFunction = (value => typeof value === "function");

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
  var isNonEmptyArray = (value => Array.isArray(value) && value.length > 0);

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

  var toArray = (value => {
    if (Array.isArray(value)) {
      return value;
    }
    if (value == null) {
      return [];
    }
    return [].slice.call(value);
  });

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
  var querySelectorAll = ((context, selector) => {
    if (!SIBLING_PATTERN.test(selector)) {
      return toArray(context.querySelectorAll(selector));
    }
    const tag = `alloy-${Date.now()}`;

    // We could use a :scope selector here, but we want to be IE compliant
    // so we add a dummy css class to be able to select the children
    try {
      context.classList.add(tag);
      return toArray(context.querySelectorAll(`.${tag} ${selector}`));
    } finally {
      context.classList.remove(tag);
    }
  });

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
   * Whether a string starts with the characters of a specified string
   * @param {String} str The string to search within.
   * @param {String} prefix The string to search for.
   * @returns {boolean}
   */
  var startsWith = ((str, prefix) => str.substr(0, prefix.length) === prefix);

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
  const splitWithShadow = selector => {
    return selector.split(SHADOW_SEPARATOR);
  };
  const transformPrefix = (parent, selector) => {
    const result = selector;
    const hasChildCombinatorPrefix = startsWith(result, ">");
    if (!hasChildCombinatorPrefix) {
      return result;
    }

    // IE doesn't support :scope
    if (window.document.documentMode) {
      return result.substring(1).trim();
    }
    const prefix = parent instanceof Element || parent instanceof HTMLDocument ? ":scope" : ":host"; // see https://bugs.webkit.org/show_bug.cgi?id=233380

    return `${prefix} ${result}`;
  };
  var selectNodesWithShadow = ((context, selector) => {
    // Shadow DOM should be supported
    if (!window.document.documentElement.attachShadow) {
      return querySelectorAll(context, selector.replace(SHADOW_SEPARATOR, ""));
    }
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
        // eslint-disable-next-line no-continue
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
  var isShadowSelector = (str => str.indexOf(SHADOW_SEPARATOR) !== -1);

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
  var selectNodes = ((selector, context = document) => {
    if (!isShadowSelector(selector)) {
      return querySelectorAll(context, selector);
    }
    return selectNodesWithShadow(context, selector);
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
  const MUTATION_OBSERVER = "MutationObserver";
  const RAF = "requestAnimationFrame";
  const MUTATION_OBSERVER_CONFIG = {
    childList: true,
    subtree: true
  };
  const VISIBILITY_STATE = "visibilityState";
  const VISIBLE = "visible";
  const DELAY = 100;
  const MAX_POLLING_TIMEOUT = 5000;
  const createError = selector => {
    return new Error(`Could not find: ${selector}`);
  };
  const createPromise = executor => {
    return new Promise(executor);
  };
  const canUseMutationObserver = win => {
    return isFunction(win[MUTATION_OBSERVER]);
  };
  const awaitUsingMutationObserver = (win, doc, selector, timeout, selectFunc) => {
    return createPromise((resolve, reject) => {
      const mutationObserver = new win[MUTATION_OBSERVER](() => {
        const nodes = selectFunc(selector);
        if (isNonEmptyArray(nodes)) {
          mutationObserver.disconnect();
          resolve(nodes);
        }
      });
      setTimeout(() => {
        mutationObserver.disconnect();
        reject(createError(selector));
      }, timeout);
      mutationObserver.observe(doc, MUTATION_OBSERVER_CONFIG);
    });
  };
  const canUseRequestAnimationFrame = doc => {
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
  var awaitSelector = ((selector, selectFunc = selectNodes, timeout = MAX_POLLING_TIMEOUT, win = window, doc = document) => {
    const nodes = selectFunc(selector);
    if (isNonEmptyArray(nodes)) {
      return Promise.resolve(nodes);
    }
    if (canUseMutationObserver(win)) {
      return awaitUsingMutationObserver(win, doc, selector, timeout, selectFunc);
    }
    if (canUseRequestAnimationFrame(doc)) {
      return awaitUsingRequestAnimation(win, selector, timeout, selectFunc);
    }
    return awaitUsingTimer(selector, timeout, selectFunc);
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

  /**
   * Returns true if element matches the selector.
   * @param {String} selector
   * @param {Node} [element]
   * @returns {Boolean}
   */
  var matchesSelector = ((selector, element) => {
    if (element.matches) {
      return element.matches(selector);
    }

    // Making IE 11 happy
    return element.msMatchesSelector(selector);
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

  var removeNode = (node => {
    const parent = node.parentNode;
    if (parent) {
      return parent.removeChild(node);
    }
    return null;
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
  const IFRAME_ATTRS = {
    name: "Adobe Alloy"
  };
  const IFRAME_PROPS = {
    style: {
      display: "none",
      width: 0,
      height: 0
    }
  };
  var injectFireReferrerHideableImage = (({
    appendNode: appendNode$1 = appendNode,
    awaitSelector: awaitSelector$1 = awaitSelector,
    createNode: createNode$1 = createNode,
    fireImage = fireImageInDocument
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
    const fireInIframe = ({
      src
    }) => {
      return createIframe().then(iframe => {
        const currentDocument = iframe.contentWindow.document;
        return fireImage({
          src,
          currentDocument
        });
      });
    };
    return request => {
      const {
        hideReferrer,
        url
      } = request;
      return hideReferrer ? fireInIframe({
        src: url
      }) : fireOnPage({
        src: url
      });
    };
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

  /**
   * Returns whether the value is an empty object.
   * @param {*} value
   * @returns {boolean}
   */
  var isEmptyObject = (value => isObject(value) && Object.keys(value).length === 0);

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
          [key]: filteredValue
        };
      }
      // value is not an object, test predicate
      if (predicate(value)) {
        return {
          ...result,
          [key]: value
        };
      }
      return result;
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
  var flatMap = ((array, mapFunction) => {
    return Array.prototype.concat.apply([], array.map(mapFunction));
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
  var getLastArrayItems = ((arr, itemCount) => arr.slice(-itemCount));

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
  const cookieName = `${baseNamespace}getTld`;

  /**
   * Of the current web page's hostname, this is the top-most domain that is
   * not a "public suffix" as outlined in https://publicsuffix.org/. In other
   * words, this is top-most domain that is able to accept cookies.
   * @param {Object} window
   * @param {Object} cookieJar
   * @returns {string}
   */
  var getApexDomain = ((window, cookieJar) => {
    let topLevelCookieDomain = "";

    // If hostParts.length === 1, we may be on localhost.
    const hostParts = window.location.hostname.toLowerCase().split(".");
    let i = 1;
    while (i < hostParts.length && !cookieJar.get(cookieName)) {
      i += 1;
      topLevelCookieDomain = getLastArrayItems(hostParts, i).join(".");
      cookieJar.set(cookieName, cookieName, {
        domain: topLevelCookieDomain
      });
    }
    cookieJar.remove(cookieName, {
      domain: topLevelCookieDomain
    });
    return topLevelCookieDomain;
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

  var sanitizeOrgIdForCookieName = (orgId => orgId.replace("@", "_"));

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
  var getNamespacedCookieName = ((orgId, key) => `${COOKIE_NAME_PREFIX}_${sanitizeOrgIdForCookieName(orgId)}_${key}`);

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
  var groupBy = ((arr, keyGetter) => {
    const result = {};
    arr.forEach(item => {
      const key = keyGetter(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    });
    return result;
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
  var injectDoesIdentityCookieExist = (({
    orgId
  }) => {
    const identityCookieName = getNamespacedCookieName(orgId, IDENTITY);
    /**
     * Returns whether the identity cookie exists.
     */
    return () => Boolean(cookieJar.get(identityCookieName));
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
        } catch (e) {
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
        } catch (e) {
          return false;
        }
      },
      /**
       * Clear all values in storage that match the namespace.
       */
      clear() {
        try {
          Object.keys(context[storageType]).forEach(key => {
            if (startsWith(key, namespace)) {
              context[storageType].removeItem(key);
            }
          });
          return true;
        } catch (e) {
          return false;
        }
      }
    };
  };
  var injectStorage = (context => additionalNamespace => {
    const finalNamespace = baseNamespace + additionalNamespace;
    return {
      session: getStorageByType(context, "sessionStorage", finalNamespace),
      persistent: getStorageByType(context, "localStorage", finalNamespace)
    };
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

  /**
   * Returns items that are found within both arrays.
   * @param {Array} a
   * @param {Array} b
   * @returns {Array}
   */
  var intersection = ((a, b) => a.filter(x => includes(b, x)));

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
  var isBoolean = (value => typeof value === "boolean");

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
  // eslint-disable-next-line no-restricted-globals
  var isNumber = (value => typeof value === "number" && !isNaN(value));

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
  var isInteger = (value => {
    const parsed = parseInt(value, 10);
    return isNumber(parsed) && value === parsed;
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

  /**
   * Determines whether a cookie name is namespaced according to the contract
   * defined by the server.
   * @param {String} orgId The org ID configured for the Alloy instance.
   * @param {String} name The cookie name.
   * @returns {boolean}
   */
  var isNamespacedCookieName = ((orgId, name) => name.indexOf(`${COOKIE_NAME_PREFIX}_${sanitizeOrgIdForCookieName(orgId)}_`) === 0);

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
  var isString = (value => typeof value === "string");

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
  var isNonEmptyString = (value => isString(value) && value.length > 0);

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
   * Creates a function that memoizes the result of `fn`. If `keyResolver` is
   * provided, it determines the cache key for storing the result based on the
   * arguments provided to the memoized function. By default, the first argument
   * provided to the memoized function is used as the map cache key.
   *
   * @param {Function} fn The function to have its output memoized.
   * @param {Function} [keyResolver] The function to resolve the cache key.
   * @returns {Function} The new memoized function.
   */
  var memoize = ((fn, keyResolver) => {
    const map = new Map();
    return (...args) => {
      const key = keyResolver ? keyResolver(...args) : args[0];
      if (map.has(key)) {
        return map.get(key);
      }
      const result = fn(...args);
      map.set(key, result);
      return result;
    };
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

  /**
   * A function that performs no operations.
   */
  var noop$1 = (() => {});

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

  // adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
  var padStart = ((string, targetLength, padString) => {
    const originalString = String(string);
    let repeatedPadString = String(padString);
    if (originalString.length >= targetLength || repeatedPadString.length === 0) {
      return originalString;
    }
    const lengthToAdd = targetLength - originalString.length;
    while (lengthToAdd > repeatedPadString.length) {
      repeatedPadString += repeatedPadString;
    }
    return repeatedPadString.slice(0, lengthToAdd) + originalString;
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

  // We want to avoid mapping between specific keys because we want Konductor
  // to be able to add overrides in the future without us needing to make
  // any changes to the Web SDK
  var prepareConfigOverridesForEdge = (configuration => {
    if (isNil(configuration) || typeof configuration !== "object") {
      return null;
    }
    // remove entries that are empty strings or arrays
    const configOverrides = filterObject(configuration, value => {
      if (isNil(value)) {
        return false;
      }
      if (isBoolean(value)) {
        return true;
      }
      if (isNumber(value)) {
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
  });

  var querystring$1 = {};

  // If obj.hasOwnProperty has been overridden, then calling
  // obj.hasOwnProperty(prop) will break.
  // See: https://github.com/joyent/node/issues/1707
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  var decode = function (qs, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
    var regexp = /\+/g;
    qs = qs.split(sep);
    var maxKeys = 1000;
    if (options && typeof options.maxKeys === 'number') {
      maxKeys = options.maxKeys;
    }
    var len = qs.length;
    // maxKeys <= 0 means that we should not limit keys count
    if (maxKeys > 0 && len > maxKeys) {
      len = maxKeys;
    }
    for (var i = 0; i < len; ++i) {
      var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr,
        vstr,
        k,
        v;
      if (idx >= 0) {
        kstr = x.substr(0, idx);
        vstr = x.substr(idx + 1);
      } else {
        kstr = x;
        vstr = '';
      }
      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);
      if (!hasOwnProperty(obj, k)) {
        obj[k] = v;
      } else if (Array.isArray(obj[k])) {
        obj[k].push(v);
      } else {
        obj[k] = [obj[k], v];
      }
    }
    return obj;
  };

  var stringifyPrimitive = function (v) {
    switch (typeof v) {
      case 'string':
        return v;
      case 'boolean':
        return v ? 'true' : 'false';
      case 'number':
        return isFinite(v) ? v : '';
      default:
        return '';
    }
  };
  var encode = function (obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
      obj = undefined;
    }
    if (typeof obj === 'object') {
      return Object.keys(obj).map(function (k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map(function (v) {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
        }
      }).join(sep);
    }
    if (!name) return '';
    return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
  };

  querystring$1.decode = querystring$1.parse = decode;
  querystring$1.encode = querystring$1.stringify = encode;

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
  var querystring = querystring$1;

  // We proxy the underlying querystring module so we can limit the API we expose.
  // This allows us to more easily make changes to the underlying implementation later without
  // having to worry about breaking extensions. If extensions demand additional functionality, we
  // can make adjustments as needed.
  var reactorQueryString = {
    parse: function (string) {
      //
      if (typeof string === 'string') {
        // Remove leading ?, #, & for some leniency so you can pass in location.search or
        // location.hash directly.
        string = string.trim().replace(/^[?#&]/, '');
      }
      return querystring.parse(string);
    },
    stringify: function (object) {
      return querystring.stringify(object);
    }
  };
  var queryString = /*@__PURE__*/getDefaultExportFromCjs(reactorQueryString);

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
  var toError = (value => {
    return value instanceof Error ? value : new Error(value);
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

  var updateErrorMessage = (({
    error,
    message
  }) => {
    try {
      error.message = message;
    } catch (e) {
      // We'll set a new message when we can, but some errors, like DOMException,
      // have a read-only message property, which limits our options.
    }
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

  /**
   * Augments an error's message with additional context as it bubbles up the call stack.
   * @param {String} message The message to be added to the error.
   * @param {*} error Optimally, this is an instance of Error. If it is not,
   * this is used as the basis for the message of a newly created Error instance.
   * @returns {*}
   */
  var stackError = (({
    error,
    message
  }) => {
    const errorToStack = toError(error);
    const newMessage = `${message}\nCaused by: ${errorToStack.message}`;
    updateErrorMessage({
      error: errorToStack,
      message: newMessage
    });
    return errorToStack;
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
  var stringToBoolean = (str => {
    return isString(str) && str.toLowerCase() === "true";
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

  /*
   * coerce `value` to a number or return `defaultValue` if it cannot be.
   *
   * The coersion is attempted if value is a number or string.
   */
  var toInteger = ((value, defaultValue) => {
    if (isNumber(value) || isString(value)) {
      const n = Math.round(Number(value));
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(n)) {
        return n;
      }
    }
    return defaultValue;
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

  /**
   * Formats the date into an ISO date-time string in the local timezone
   * @param {Date} date
   * @returns {string}
   */
  var toISOStringLocal = (date => {
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
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${mmm}${ts}${th}:${tm}`;
  });

  var rngBrowser = {exports: {}};

  // Unique ID creation requires a high quality random # generator.  In the
  // browser this is a little complicated due to unknown quality of Math.random()
  // and inconsistent support for the `crypto` API.  We do the best we can via
  // feature-detection

  // getRandomValues needs to be invoked in a context where "this" is a Crypto
  // implementation. Also, find the complete implementation of crypto on IE11.
  var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);
  if (getRandomValues) {
    // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
    var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

    rngBrowser.exports = function whatwgRNG() {
      getRandomValues(rnds8);
      return rnds8;
    };
  } else {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var rnds = new Array(16);
    rngBrowser.exports = function mathRNG() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }
      return rnds;
    };
  }
  var rngBrowserExports = rngBrowser.exports;

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */
  var byteToHex = [];
  for (var i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }
  function bytesToUuid$1(buf, offset) {
    var i = offset || 0;
    var bth = byteToHex;
    // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
    return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
  }
  var bytesToUuid_1 = bytesToUuid$1;

  var rng = rngBrowserExports;
  var bytesToUuid = bytesToUuid_1;
  function v4(options, buf, offset) {
    var i = buf && offset || 0;
    if (typeof options == 'string') {
      buf = options === 'binary' ? new Array(16) : null;
      options = null;
    }
    options = options || {};
    var rnds = options.random || (options.rng || rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }
    return buf || bytesToUuid(rnds);
  }
  var v4_1 = v4;
  var uuid = /*@__PURE__*/getDefaultExportFromCjs(v4_1);

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
  const skipIfNull = validator => function skipIfNullValidator(value, path) {
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
  const callSequentially = (firstValidator, secondValidator) => function callSequentiallyValidator(value, path) {
    return secondValidator.call(this, firstValidator.call(this, value, path), path);
  };

  /**
   * Just like callSequentially, but if either validator throws an error, the errors
   * are collected and thrown at the end.
   *
   * @param {function} firstValidator
   * @param {function} secondValidator
   * @returns {function}
   */
  const callSequentiallyJoinErrors = (firstValidator, secondValidator) => function callSequentiallyJoinErrorsValidator(value, path) {
    const errors = [];
    const newValue = [firstValidator, secondValidator].reduce((memo, validator) => {
      try {
        return validator.call(this, memo, path);
      } catch (e) {
        errors.push(e);
        return memo;
      }
    }, value);
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
    return assign(callSequentially(baseValidator, newValidator), baseValidator, additionalMethods);
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
    return assign(callSequentially(baseValidator, skipIfNull(newValidator)), baseValidator, additionalMethods);
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
  const reverseNullSafeChainJoinErrors = (baseValidator, newValidator, additionalMethods) => {
    return assign(callSequentiallyJoinErrors(skipIfNull(newValidator), baseValidator), baseValidator, additionalMethods);
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
      throw new Error(`'${path}': Expected ${message}, but got ${JSON.stringify(value)}.`);
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
  var booleanValidator = ((value, path) => {
    assertValid(isBoolean(value), value, path, "true or false");
    return value;
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
  var callbackValidator = ((value, path) => {
    assertValid(isFunction(value), value, path, "a function");
    return value;
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
  var createArrayOfValidator = (elementValidator => function arrayOf(value, path) {
    assertValid(Array.isArray(value), value, path, "an array");
    const errors = [];
    const validatedArray = value.map((subValue, i) => {
      try {
        return elementValidator.call(this, subValue, `${path}[${i}]`, value);
      } catch (e) {
        errors.push(e.message);
        return undefined;
      }
    });
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    return validatedArray;
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

  var createDefaultValidator = (defaultValue => value => {
    if (value == null) {
      return defaultValue;
    }
    return value;
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
  var createDeprecatedValidator = ((oldField, oldSchema, newField) => function deprecated(value, path) {
    assertValid(isObject(value), value, path, "an object");
    const {
      [oldField]: oldValue,
      [newField]: newValue,
      ...otherValues
    } = value;
    const validatedOldValue = oldSchema(oldValue, path);
    if (validatedOldValue !== undefined) {
      let message = `The field '${oldField}' is deprecated. Use '${newField}' instead.`;
      if (path) {
        message = `'${path}': ${message}`;
      }
      if (newValue !== undefined && newValue !== validatedOldValue) {
        throw new Error(message);
      } else if (this && this.logger) {
        this.logger.warn(message);
      }
    }
    return {
      [newField]: newValue || validatedOldValue,
      ...otherValues
    };
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
  var createLiteralValidator = (literalValue => (value, path) => {
    assertValid(value === literalValue, value, path, `${literalValue}`);
    return value;
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
  var createMapOfValuesValidator = (valueValidator => function mapOfValues(value, path) {
    assertValid(isObject(value), value, path, "an object");
    const errors = [];
    const validatedObject = {};
    Object.keys(value).forEach(subKey => {
      const subValue = value[subKey];
      const subPath = path ? `${path}.${subKey}` : subKey;
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
  var createMinimumValidator = ((typeName, minimum) => (value, path) => {
    assertValid(value >= minimum, value, path, `${typeName} greater than or equal to ${minimum}`);
    return value;
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

  var createNoUnknownFieldsValidator = (schema => (value, path) => {
    const errors = [];
    Object.keys(value).forEach(subKey => {
      if (!schema[subKey]) {
        const subPath = path ? `${path}.${subKey}` : subKey;
        errors.push(`'${subPath}': Unknown field.`);
      }
    });
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    return value;
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
  var createNonEmptyValidator = (message => (value, path) => {
    if (isObject(value)) {
      assertValid(!isEmptyObject(value), value, path, message);
    } else {
      assertValid(value.length > 0, value, path, message);
    }
    return value;
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
  var createObjectOfValidator = (schema => function objectOf(value, path) {
    assertValid(isObject(value), value, path, "an object");
    const errors = [];
    const validatedObject = {};
    Object.keys(schema).forEach(subKey => {
      const subValue = value[subKey];
      const subSchema = schema[subKey];
      const subPath = path ? `${path}.${subKey}` : subKey;
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
    Object.keys(value).forEach(subKey => {
      if (!Object.prototype.hasOwnProperty.call(validatedObject, subKey)) {
        validatedObject[subKey] = value[subKey];
      }
    });
    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
    return validatedObject;
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
  var createAnyOfValidator = ((validators, message) => function anyOf(value, path) {
    let newValue;
    const valid = find(validators, validator => {
      try {
        newValue = validator.call(this, value, path);
        return true;
      } catch (e) {
        return false;
      }
    });
    assertValid(valid, value, path, message);
    return newValue;
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
  var createUniqueValidator = (() => {
    const values = [];
    return (value, path) => {
      assertValid(values.indexOf(value) === -1, value, path, "a unique value across instances");
      values.push(value);
      return value;
    };
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
   * Returns whether an array contains unique values.
   * @param {*} value
   * @returns {boolean}
   */
  var isUnique = (values => {
    const storedVals = Object.create(null);
    for (let i = 0; i < values.length; i += 1) {
      const item = values[i];
      if (item in storedVals) {
        return false;
      }
      storedVals[item] = true;
    }
    return true;
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
  var createUniqueItemsValidator = (() => {
    return (value, path) => {
      assertValid(isUnique(value), value, path, "array values to be unique");
    };
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
  const DOMAIN_REGEX = /^[a-z0-9.-]{1,}$/i;
  var domainValidator = ((value, path) => {
    assertValid(DOMAIN_REGEX.test(value), value, path, "a valid domain");
    return value;
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
  var integerValidator = ((value, path) => {
    assertValid(isInteger(value), value, path, "an integer");
    return value;
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
  var numberValidator = ((value, path) => {
    assertValid(isNumber(value), value, path, "a number");
    return value;
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

  /**
   * Determines whether the value is a valid regular expression.
   * @param {*} value
   * @returns {boolean}
   */
  var isValidRegExp = (value => {
    try {
      return new RegExp(value) !== null;
    } catch (e) {
      return false;
    }
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
  var regexpValidator = ((value, path) => {
    assertValid(isValidRegExp(value), value, path, "a regular expression");
    return value;
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

  var requiredValidator = ((value, path) => {
    if (value == null) {
      throw new Error(`'${path}' is a required option`);
    }
    return value;
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
  var stringValidator = ((value, path) => {
    assertValid(isString(value), value, path, "a string");
    return value;
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

  // The base validator does no validation and just returns the value unchanged
  const base = value => value;

  // The 'default', 'required', and 'deprecated' methods are available after any
  // data-type method. Don't use the nullSafeChain on 'default' or 'required'
  // because they need to handle the null or undefined case
  base.default = function _default(defaultValue) {
    return chain(this, createDefaultValidator(defaultValue));
  };
  base.required = function required() {
    return chain(this, requiredValidator);
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
  const integer = function integer() {
    return nullSafeChain(this, integerValidator, {
      minimum: minimumInteger
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
      uniqueItems
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
      integer,
      unique
    });
  };
  const mapOfValues = function mapOfValues(valuesValidator) {
    return nullSafeChain(this, createMapOfValuesValidator(valuesValidator), {
      nonEmpty: nonEmptyObject
    });
  };
  const createObjectOfAdditionalProperties = schema => ({
    noUnknownFields: function noUnknownFields() {
      return nullSafeChain(this, createNoUnknownFieldsValidator(schema));
    },
    nonEmpty: nonEmptyObject,
    concat: function concat(otherObjectOfValidator) {
      // combine the schema so that noUnknownFields, and concat have the combined schema
      const newSchema = {
        ...schema,
        ...otherObjectOfValidator.schema
      };
      return nullSafeChain(this, otherObjectOfValidator, createObjectOfAdditionalProperties(newSchema));
    },
    deprecated: function deprecated(oldField, oldSchema, newField) {
      // Run the deprecated validator first so that the deprecated field is removed
      // before the objectOf validator runs.
      return reverseNullSafeChainJoinErrors(this, createDeprecatedValidator(oldField, oldSchema, newField));
    },
    schema
  });
  const objectOf = function objectOf(schema) {
    return nullSafeChain(this, createObjectOfValidator(schema), createObjectOfAdditionalProperties(schema));
  };
  const string = function string() {
    return nullSafeChain(this, stringValidator, {
      regexp,
      domain,
      nonEmpty: nonEmptyString,
      unique
    });
  };
  const boundAnyOf = anyOf.bind(base);
  const boundAnything = anything.bind(base);
  const boundArrayOf = arrayOf.bind(base);
  const boundBoolean = boolean.bind(base);
  const boundCallback = callback.bind(base);
  const boundLiteral = literal.bind(base);
  number.bind(base);
  const boundMapOfValues = mapOfValues.bind(base);
  const boundObjectOf = objectOf.bind(base);
  const boundString = string.bind(base);

  // compound validators
  const boundEnumOf = function boundEnumOf(...values) {
    return boundAnyOf(values.map(boundLiteral), `one of these values: [${JSON.stringify(values)}]`);
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
  var validateIdentityMap = boundMapOfValues(boundArrayOf(boundObjectOf({
    authenticatedState: boundEnumOf(AMBIGUOUS, AUTHENTICATED, LOGGED_OUT),
    id: boundString(),
    namespace: boundObjectOf({
      code: boundString()
    }).noUnknownFields(),
    primary: boundBoolean(),
    xid: boundString()
  }).noUnknownFields()).required());

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

  /**
   * Returns an array whose items are the provided object's own enumerable
   * property values.
   * @param {Object} obj
   * @returns {Array}
   */
  var values = (obj => {
    return Object.keys(obj).map(key => obj[key]);
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
  var createLogController = (({
    console,
    locationSearch,
    createLogger,
    instanceName,
    createNamespacedStorage,
    getMonitors
  }) => {
    const parsedQueryString = queryString.parse(locationSearch);
    const storage = createNamespacedStorage(`instance.${instanceName}.`);
    const debugSessionValue = storage.session.getItem("debug");
    let debugEnabled = debugSessionValue === "true";
    let debugEnabledWritableFromConfig = debugSessionValue === null;
    const getDebugEnabled = () => debugEnabled;
    const setDebugEnabled = (value, {
      fromConfig
    }) => {
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
        fromConfig: false
      });
    }
    return {
      setDebugEnabled,
      logger: createLogger({
        getDebugEnabled,
        context: {
          instanceName
        },
        getMonitors,
        console
      }),
      createComponentLogger(componentName) {
        return createLogger({
          getDebugEnabled,
          context: {
            instanceName,
            componentName
          },
          getMonitors,
          console
        });
      }
    };
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
  // Called by DecisioningEngine when a ruleset is satisfied with a list of
  // propositions
  "onDecision"];
  const createHook = (componentRegistry, hookName) => {
    return (...args) => {
      return Promise.all(componentRegistry.getLifecycleCallbacks(hookName).map(callback => {
        return new Promise(resolve => {
          resolve(callback(...args));
        });
      }));
    };
  };

  /**
   * This ensures that if a component's lifecycle method X
   * attempts to execute lifecycle method Y, that all X methods on all components
   * will have been called before any of their Y methods are called. It does
   * this by kicking the call to the Y method to the next JavaScript tick.
   * @returns {function}
   */
  const guardHook = fn => {
    return (...args) => {
      return Promise.resolve().then(() => {
        return fn(...args);
      });
    };
  };
  var createLifecycle = (componentRegistry => {
    return hookNames.reduce((memo, hookName) => {
      memo[hookName] = guardHook(createHook(componentRegistry, hookName));
      return memo;
    }, {});
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
  const wrapForErrorHandling = (fn, stackMessage) => {
    return (...args) => {
      let result;
      try {
        result = fn(...args);
      } catch (error) {
        throw stackError({
          error,
          message: stackMessage
        });
      }
      if (result instanceof Promise) {
        result = result.catch(error => {
          throw stackError({
            error,
            message: stackMessage
          });
        });
      }
      return result;
    };
  };

  // TO-DOCUMENT: All public commands and their signatures.
  var createComponentRegistry = (() => {
    const commandsByName = {};
    const lifecycleCallbacksByName = {};
    const registerComponentCommands = (namespace, componentCommandsByName = {}) => {
      const conflictingCommandNames = intersection(Object.keys(commandsByName), Object.keys(componentCommandsByName));
      if (conflictingCommandNames.length) {
        throw new Error(`[ComponentRegistry] Could not register ${namespace} ` + `because it has existing command(s): ${conflictingCommandNames.join(",")}`);
      }
      Object.keys(componentCommandsByName).forEach(commandName => {
        const command = componentCommandsByName[commandName];
        command.commandName = commandName;
        command.run = wrapForErrorHandling(command.run, `[${namespace}] An error occurred while executing the ${commandName} command.`);
        commandsByName[commandName] = command;
      });
    };
    const registerLifecycleCallbacks = (namespace, componentLifecycleCallbacksByName = {}) => {
      Object.keys(componentLifecycleCallbacksByName).forEach(hookName => {
        lifecycleCallbacksByName[hookName] = lifecycleCallbacksByName[hookName] || [];
        lifecycleCallbacksByName[hookName].push(wrapForErrorHandling(componentLifecycleCallbacksByName[hookName], `[${namespace}] An error occurred while executing the ${hookName} lifecycle hook.`));
      });
    };
    return {
      register(namespace, component) {
        const {
          commands,
          lifecycle
        } = component;
        registerComponentCommands(namespace, commands);
        registerLifecycleCallbacks(namespace, lifecycle);
      },
      getCommand(commandName) {
        return commandsByName[commandName];
      },
      getCommandNames() {
        return Object.keys(commandsByName);
      },
      getLifecycleCallbacks(hookName) {
        return lifecycleCallbacksByName[hookName] || [];
      }
    };
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
  var injectSendNetworkRequest = (({
    logger,
    sendFetchRequest,
    sendBeaconRequest,
    isRequestRetryable,
    getRequestRetryDelay
  }) => {
    /**
     * Send a network request and returns details about the response.
     */
    return ({
      requestId,
      url,
      payload,
      useSendBeacon
    }) => {
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
        payload: parsedPayload
      });
      const executeRequest = (retriesAttempted = 0) => {
        const requestMethod = useSendBeacon ? sendBeaconRequest : sendFetchRequest;
        return requestMethod(url, stringifiedPayload).then(response => {
          const requestIsRetryable = isRequestRetryable({
            response,
            retriesAttempted
          });
          if (requestIsRetryable) {
            const requestRetryDelay = getRequestRetryDelay({
              response,
              retriesAttempted
            });
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(executeRequest(retriesAttempted + 1));
              }, requestRetryDelay);
            });
          }
          let parsedBody;
          try {
            parsedBody = JSON.parse(response.body);
          } catch (e) {
            // Non-JSON. Something went wrong.
          }
          logger.logOnNetworkResponse({
            requestId,
            url,
            payload: parsedPayload,
            ...response,
            parsedBody,
            retriesAttempted
          });
          return {
            statusCode: response.statusCode,
            body: response.body,
            parsedBody,
            getHeader: response.getHeader
          };
        });
      };
      return executeRequest().catch(error => {
        logger.logOnNetworkError({
          requestId,
          url,
          payload: parsedPayload,
          error
        });
        throw stackError({
          error,
          message: "Network request failed."
        });
      });
    };
  });

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

  var injectExtractEdgeInfo = (({
    logger
  }) => adobeEdgeHeader => {
    if (adobeEdgeHeader) {
      const headerParts = adobeEdgeHeader.split(";");
      if (headerParts.length >= 2 && headerParts[1].length > 0) {
        try {
          const regionId = parseInt(headerParts[1], 10);
          // eslint recommends using Number.isNaN instead, but this function is
          // not available in Internet Explorer. Number.isNaN is more robust to
          // non-numeric parameters. Since we already know regionId will be an
          // integer, using isNaN is okay.
          // https://github.com/airbnb/javascript#standard-library--isnan
          // eslint-disable-next-line no-restricted-globals
          if (!isNaN(regionId)) {
            return {
              regionId
            };
          }
        } catch (e) {
          // No need to do anything. The log statement below will log an error
        }
      }
      logger.warn(`Invalid adobe edge: "${adobeEdgeHeader}"`);
    }
    return {};
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

  const IN = "in";
  const OUT = "out";
  const PENDING = "pending";

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
  const createDeclinedConsentError = errorMessage => {
    const error = new Error(errorMessage);
    error.code = DECLINED_CONSENT_ERROR_CODE;
    error.message = errorMessage;
    return error;
  };
  var createConsentStateMachine = (({
    logger
  }) => {
    const deferreds = [];
    const runAll = () => {
      while (deferreds.length) {
        deferreds.shift().resolve();
      }
    };
    const discardAll = () => {
      while (deferreds.length) {
        deferreds.shift().reject(createDeclinedConsentError("The user declined consent."));
      }
    };
    const awaitInitial = () => Promise.reject(new Error("Consent has not been initialized."));
    const awaitInDefault = () => Promise.resolve();
    const awaitIn = () => Promise.resolve();
    const awaitOutDefault = () => Promise.reject(createDeclinedConsentError("No consent preferences have been set."));
    const awaitOut = () => Promise.reject(createDeclinedConsentError("The user declined consent."));
    const awaitPending = returnImmediately => {
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
            logger.info("Loaded user consent preferences. The user previously consented.");
          } else if (source === CONSENT_SOURCE_NEW && this.awaitConsent !== awaitIn) {
            logger.info("User consented.");
          }
          runAll();
          this.awaitConsent = awaitIn;
        }
      },
      out(source) {
        if (source === CONSENT_SOURCE_DEFAULT) {
          logger.warn("User consent preferences not found. Default consent of out will be used.");
          this.awaitConsent = awaitOutDefault;
        } else {
          if (source === CONSENT_SOURCE_INITIAL) {
            logger.warn("Loaded user consent preferences. The user previously declined consent.");
          } else if (source === CONSENT_SOURCE_NEW && this.awaitConsent !== awaitOut) {
            logger.warn("User declined consent.");
          }
          discardAll();
          this.awaitConsent = awaitOut;
        }
      },
      pending(source) {
        if (source === CONSENT_SOURCE_DEFAULT) {
          logger.info("User consent preferences not found. Default consent of pending will be used. Some commands may be delayed.");
        }
        this.awaitConsent = awaitPending;
      },
      awaitConsent: awaitInitial,
      withConsent() {
        return this.awaitConsent(true);
      }
    };
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
  var createConsent = (({
    generalConsentState,
    logger
  }) => {
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
          logger.warn(`Unknown consent value: ${consentByPurpose[GENERAL]}`);
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
      }
    };
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
  const getXdmPropositions = xdm => {
    return xdm &&
    // eslint-disable-next-line no-underscore-dangle
    xdm._experience &&
    // eslint-disable-next-line no-underscore-dangle
    xdm._experience.decisioning &&
    // eslint-disable-next-line no-underscore-dangle
    isNonEmptyArray(xdm._experience.decisioning.propositions) ?
    // eslint-disable-next-line no-underscore-dangle
    xdm._experience.decisioning.propositions : [];
  };
  var createEvent = (() => {
    const content = {};
    let userXdm;
    let userData;
    let documentMayUnload = false;
    let isFinalized = false;
    let shouldSendEvent = true;
    const throwIfEventFinalized = methodName => {
      if (isFinalized) {
        throw new Error(`${methodName} cannot be called after event is finalized.`);
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
            xdm: userXdm
          });
        }
        if (userData) {
          deepAssign(currentContent, {
            data: userData
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
            xdm
          });
        }
      },
      mergeData(data) {
        throwIfEventFinalized("mergeData");
        if (data) {
          deepAssign(content, {
            data
          });
        }
      },
      mergeMeta(meta) {
        throwIfEventFinalized("mergeMeta");
        if (meta) {
          deepAssign(content, {
            meta
          });
        }
      },
      mergeQuery(query) {
        throwIfEventFinalized("mergeQuery");
        if (query) {
          deepAssign(content, {
            query
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
        const newPropositions = deduplicateArray([...getXdmPropositions(userXdm), ...getXdmPropositions(content.xdm)], (a, b) => a === b || a.id && b.id && a.id === b.id && a.scope && b.scope && a.scope === b.scope);
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
            data: content.data || {}
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
        return isEmptyObject(content) && (!userXdm || isEmptyObject(userXdm)) && (!userData || isEmptyObject(userData));
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
      }
    };
    return event;
  });

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
  var injectCreateResponse = (({
    extractEdgeInfo
  }) => ({
    content = {},
    getHeader
  }) => {
    const {
      handle = [],
      errors = [],
      warnings = []
    } = content;

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
        return flatMap(handle.filter(fragment => fragment.type === type), fragment => fragment.payload);
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
      }
    };
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
  var injectExecuteCommand = (({
    logger,
    configureCommand,
    setDebugCommand,
    handleError,
    validateCommandOptions
  }) => {
    let configurePromise;
    const getExecutor = (commandName, options) => {
      let executor;
      if (commandName === CONFIGURE) {
        if (configurePromise) {
          throw new Error("The library has already been configured and may only be configured once.");
        }
        executor = () => {
          configurePromise = configureCommand(options);
          return configurePromise.then(() => {
            // Don't expose internals to the user.
          });
        };
      } else {
        if (!configurePromise) {
          throw new Error(`The library must be configured first. Please do so by executing the configure command.`);
        }
        if (commandName === SET_DEBUG) {
          executor = () => setDebugCommand(options);
        } else {
          executor = () => {
            return configurePromise.then(componentRegistry => {
              const command = componentRegistry.getCommand(commandName);
              if (!command || !isFunction(command.run)) {
                const commandNames = [CONFIGURE, SET_DEBUG].concat(componentRegistry.getCommandNames()).join(", ");
                throw new Error(`The ${commandName} command does not exist. List of available commands: ${commandNames}.`);
              }
              const validatedOptions = validateCommandOptions({
                command,
                options
              });
              return command.run(validatedOptions);
            }, () => {
              logger.warn(`An error during configuration is preventing the ${commandName} command from executing.`);
              // If configuration failed, we prevent the configuration
              // error from bubbling here because we don't want the
              // configuration error to be reported in the console every
              // time any command is executed. Only having it bubble
              // once when the configure command runs is sufficient.
              // Instead, for this command, we'll just return a promise
              // that never gets resolved.
              return new Promise(() => {});
            });
          };
        }
      }
      return executor;
    };
    return (commandName, options = {}) => {
      return new Promise(resolve => {
        // We have to wrap the getExecutor() call in the promise so the promise
        // will be rejected if getExecutor() throws errors.
        const executor = getExecutor(commandName, options);
        logger.logOnBeforeCommand({
          commandName,
          options
        });
        resolve(executor());
      }).catch(error => {
        return handleError(error, `${commandName} command`);
      }).catch(error => {
        logger.logOnCommandRejected({
          commandName,
          options,
          error
        });
        throw error;
      }).then(rawResult => {
        // We should always be returning an object from every command.
        const result = isObject(rawResult) ? rawResult : {};
        logger.logOnCommandResolved({
          commandName,
          options,
          result
        });
        return result;
      });
    };
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

  const COMMAND_DOC_URI = "https://adobe.ly/3sHgQHb";
  var validateCommandOptions = (({
    command,
    options
  }) => {
    const {
      commandName,
      documentationUri = COMMAND_DOC_URI,
      optionsValidator
    } = command;
    let validatedOptions = options;
    if (optionsValidator) {
      try {
        validatedOptions = optionsValidator(options);
      } catch (validationError) {
        const invalidOptionsMessage = `Invalid ${commandName} command options:\n\t - ${validationError} For command documentation see: ${documentationUri}`;
        throw new Error(invalidOptionsMessage);
      }
    }
    return validatedOptions;
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
  var validateUserEventOptions = (({
    options
  }) => {
    const eventOptionsValidator = boundObjectOf({
      type: boundString(),
      xdm: boundObjectOf({
        eventType: boundString(),
        identityMap: validateIdentityMap
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
        decisionContext: boundObjectOf({})
      }).default({
        sendDisplayEvent: true
      }),
      datasetId: boundString(),
      mergeId: boundString(),
      edgeConfigOverrides: validateConfigOverride,
      initializePersonalization: boundBoolean()
    }).required().noUnknownFields();
    return eventOptionsValidator(options);
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
  var validateApplyResponse = (({
    options
  }) => {
    const validator = boundObjectOf({
      renderDecisions: boundBoolean(),
      responseHeaders: boundMapOfValues(boundString().required()),
      responseBody: boundObjectOf({
        handle: boundArrayOf(boundObjectOf({
          type: boundString().required(),
          payload: boundAnything().required()
        })).required()
      }).required(),
      personalization: boundObjectOf({
        sendDisplayEvent: boundBoolean().default(true),
        decisionContext: boundObjectOf({})
      }).default({
        sendDisplayEvent: true
      })
    }).noUnknownFields();
    return validator(options);
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
  const createDataCollector = ({
    eventManager,
    logger
  }) => {
    return {
      commands: {
        sendEvent: {
          documentationUri: "https://adobe.ly/3GQ3Q7t",
          optionsValidator: options => {
            return validateUserEventOptions({
              options
            });
          },
          run: options => {
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
                eventType: type
              });
            }
            if (mergeId) {
              event.mergeXdm({
                eventMergeId: mergeId
              });
            }
            if (edgeConfigOverrides) {
              eventManagerOptions.edgeConfigOverrides = edgeConfigOverrides;
            }
            if (datasetId) {
              logger.warn("The 'datasetId' option has been deprecated. Please use 'edgeConfigOverrides.com_adobe_experience_platform.datasets.event.datasetId' instead.");
              eventManagerOptions.edgeConfigOverrides = edgeConfigOverrides || {};
              deepAssign(eventManagerOptions.edgeConfigOverrides, {
                com_adobe_experience_platform: {
                  datasets: {
                    event: {
                      datasetId
                    }
                  }
                }
              });
            }
            return eventManager.sendEvent(event, eventManagerOptions);
          }
        },
        applyResponse: {
          documentationUri: "",
          optionsValidator: options => {
            return validateApplyResponse({
              options
            });
          },
          run: options => {
            const {
              renderDecisions = false,
              decisionContext = {},
              responseHeaders = {},
              responseBody = {
                handle: []
              },
              personalization
            } = options;
            const event = eventManager.createEvent();
            return eventManager.applyResponse(event, {
              renderDecisions,
              decisionContext,
              responseHeaders,
              responseBody,
              personalization
            });
          }
        }
      }
    };
  };
  createDataCollector.namespace = "DataCollector";

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
  const createClickHandler = ({
    eventManager,
    lifecycle,
    handleError
  }) => {
    return clickEvent => {
      // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
      const clickedElement = clickEvent.target;
      const event = eventManager.createEvent();
      // this is to make sure a exit link personalization metric use send beacon
      event.documentMayUnload();
      return lifecycle.onClick({
        event,
        clickedElement
      }).then(() => {
        if (event.isEmpty()) {
          return Promise.resolve();
        }
        return eventManager.sendEvent(event);
      })
      // eventManager.sendEvent() will return a promise resolved to an
      // object and we want to avoid returning any value to the customer
      .then(noop$1).catch(error => {
        handleError(error, "click collection");
      });
    };
  };
  var attachClickActivityCollector = (({
    eventManager,
    lifecycle,
    handleError
  }) => {
    const clickHandler = createClickHandler({
      eventManager,
      lifecycle,
      handleError
    });
    document.addEventListener("click", clickHandler, true);
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
  const downloadLinkQualifier = boundString().regexp().default("\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$");
  var configValidators$1 = boundObjectOf({
    clickCollectionEnabled: boundBoolean().default(true),
    onBeforeLinkClickSend: boundCallback(),
    downloadLinkQualifier
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
  var createLinkClick = (({
    getLinkDetails,
    config,
    logger
  }) => {
    const {
      clickCollectionEnabled
    } = config;
    if (!clickCollectionEnabled) {
      return () => undefined;
    }
    return ({
      targetElement,
      event
    }) => {
      const linkDetails = getLinkDetails({
        targetElement,
        config,
        logger
      });
      if (linkDetails) {
        event.mergeXdm(linkDetails.xdm);
        event.setUserData(linkDetails.data);
      }
    };
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

  var createGetLinkDetails = (({
    window,
    getLinkName,
    getLinkRegion,
    getAbsoluteUrlFromAnchorElement,
    findSupportedAnchorElement,
    determineLinkType
  }) => {
    return ({
      targetElement,
      config,
      logger
    }) => {
      const anchorElement = findSupportedAnchorElement(targetElement);
      if (!anchorElement) {
        logger.info("This link click event is not triggered because the HTML element is not an anchor.");
        return undefined;
      }
      const linkUrl = getAbsoluteUrlFromAnchorElement(window, anchorElement);
      if (!linkUrl) {
        logger.info("This link click event is not triggered because the HTML element doesn't have an URL.");
        return undefined;
      }
      const linkType = determineLinkType(window, config, linkUrl, anchorElement);
      const linkRegion = getLinkRegion(anchorElement);
      const linkName = getLinkName(anchorElement);
      const {
        onBeforeLinkClickSend
      } = config;
      const options = {
        xdm: {
          eventType: "web.webinteraction.linkClicks",
          web: {
            webInteraction: {
              name: linkName,
              region: linkRegion,
              type: linkType,
              URL: linkUrl,
              linkClicks: {
                value: 1
              }
            }
          }
        },
        data: {},
        clickedElement: targetElement
      };
      if (!onBeforeLinkClickSend) {
        return options;
      }
      const shouldEventBeTracked = onBeforeLinkClickSend(options);
      if (shouldEventBeTracked !== false) {
        return options;
      }
      logger.info("This link click event is not triggered because it was canceled in onBeforeLinkClickSend.");
      return undefined;
    };
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

  const urlStartsWithScheme = url => {
    return url && /^[a-z0-9]+:\/\//i.test(url);
  };
  const getAbsoluteUrlFromAnchorElement = (window, element) => {
    const loc = window.location;
    let url = element.href ? element.href : "";
    let {
      protocol,
      host
    } = element;
    if (!urlStartsWithScheme(url)) {
      if (!protocol) {
        protocol = loc.protocol ? loc.protocol : "";
      }
      protocol = protocol ? `${protocol}//` : "";
      if (!host) {
        host = loc.host ? loc.host : "";
      }
      let path = "";
      if (url.substring(0, 1) !== "/") {
        let indx = loc.pathname.lastIndexOf("/");
        indx = indx < 0 ? 0 : indx;
        path = loc.pathname.substring(0, indx);
      }
      url = `${protocol}${host}${path}/${url}`;
    }
    return url;
  };
  const isSupportedAnchorElement = element => {
    if (element.href && (element.tagName === "A" || element.tagName === "AREA") && (!element.onclick || !element.protocol || element.protocol.toLowerCase().indexOf("javascript") < 0)) {
      return true;
    }
    return false;
  };
  const trimQueryFromUrl = url => {
    const questionMarkIndex = url.indexOf("?");
    const hashIndex = url.indexOf("#");
    if (questionMarkIndex >= 0 && (questionMarkIndex < hashIndex || hashIndex < 0)) {
      return url.substring(0, questionMarkIndex);
    }
    if (hashIndex >= 0) {
      return url.substring(0, hashIndex);
    }
    return url;
  };
  const isDownloadLink = (downloadLinkQualifier, linkUrl, clickedObj) => {
    const re = new RegExp(downloadLinkQualifier);
    const trimmedLinkUrl = trimQueryFromUrl(linkUrl).toLowerCase();
    return clickedObj.download ? true : re.test(trimmedLinkUrl);
  };
  const isExitLink = (window, linkUrl) => {
    const currentHostname = window.location.hostname.toLowerCase();
    const trimmedLinkUrl = trimQueryFromUrl(linkUrl).toLowerCase();
    if (trimmedLinkUrl.indexOf(currentHostname) >= 0) {
      return false;
    }
    return true;
  };

  /**
   * Reduces repeated whitespace within a string. Whitespace surrounding the string
   * is trimmed and any occurrence of whitespace within the string is replaced with
   * a single space.
   * @param {string} str String to be formatted.
   * @returns {string} Formatted string.
   */
  const truncateWhiteSpace = str => {
    return str && str.replace(/\s+/g, " ").trim();
  };
  const determineLinkType = (window, config, linkUrl, clickedObj) => {
    let linkType = "other";
    if (isDownloadLink(config.downloadLinkQualifier, linkUrl, clickedObj)) {
      linkType = "download";
    } else if (isExitLink(window, linkUrl)) {
      linkType = "exit";
    }
    return linkType;
  };
  const findSupportedAnchorElement = targetElement => {
    let node = targetElement;
    while (node) {
      if (isSupportedAnchorElement(node)) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
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
  const unsupportedNodeNames = /^(SCRIPT|STYLE|LINK|CANVAS|NOSCRIPT|#COMMENT)$/i;

  /**
   * Determines if a node qualifies as a supported link text node.
   * @param {*} node Node to determine support for.
   * @returns {boolean}
   */
  const isSupportedTextNode = node => {
    if (node && node.nodeName) {
      if (node.nodeName.match(unsupportedNodeNames)) {
        return false;
      }
    }
    return true;
  };

  /**
   * Orders and returns specified node and its child nodes in arrays of supported
   * and unsupported nodes.
   * @param {*} node The node to extract supported and unsupported nodes from.
   * @returns {{supportedNodes: Array, includesUnsupportedNodes: boolean}} Node support object.
   */
  const extractSupportedNodes = node => {
    let supportedNodes = [];
    let includesUnsupportedNodes = false;
    if (isSupportedTextNode(node)) {
      supportedNodes.push(node);
      if (node.childNodes) {
        const childNodes = Array.prototype.slice.call(node.childNodes);
        childNodes.forEach(childNode => {
          const nodes = extractSupportedNodes(childNode);
          supportedNodes = supportedNodes.concat(nodes.supportedNodes);
          includesUnsupportedNodes = includesUnsupportedNodes || nodes.includesUnsupportedNodes;
        });
      }
    } else {
      includesUnsupportedNodes = true;
    }
    return {
      supportedNodes,
      includesUnsupportedNodes
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
  const getChildrenAttributes = nodes => {
    const attributes = {
      texts: []
    };
    nodes.supportedNodes.forEach(supportedNode => {
      if (supportedNode.getAttribute) {
        if (!attributes.alt) {
          attributes.alt = truncateWhiteSpace(supportedNode.getAttribute("alt"));
        }
        if (!attributes.title) {
          attributes.title = truncateWhiteSpace(supportedNode.getAttribute("title"));
        }
        if (!attributes.inputValue) {
          attributes.inputValue = truncateWhiteSpace(getNodeAttributeValue(supportedNode, "value", "INPUT"));
        }
        if (!attributes.imgSrc) {
          attributes.imgSrc = truncateWhiteSpace(getNodeAttributeValue(supportedNode, "src", "IMG"));
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
  var getLinkName = (node => {
    let nodeText = truncateWhiteSpace(node.innerText || node.textContent);
    const nodes = extractSupportedNodes(node);
    // if contains unsupported nodes we want children node attributes
    if (!nodeText || nodes.includesUnsupportedNodes) {
      const attributesMap = getChildrenAttributes(nodes);
      nodeText = truncateWhiteSpace(attributesMap.texts.join(""));
      if (!nodeText) {
        nodeText = attributesMap.alt || attributesMap.title || attributesMap.inputValue || attributesMap.imgSrc;
      }
    }
    return nodeText || "";
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
  const semanticElements = /^(HEADER|MAIN|FOOTER|NAV)$/i;
  const getAriaRegionLabel = node => {
    let regionLabel;
    if (node.role === "region" && isNonEmptyString(node["aria-label"])) {
      regionLabel = node["aria-label"];
    }
    return regionLabel;
  };
  const getSectionNodeName = node => {
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
  var getLinkRegion = (node => {
    let linkParentNode = node.parentNode;
    let regionName;
    while (linkParentNode) {
      regionName = truncateWhiteSpace(linkParentNode.id || getAriaRegionLabel(linkParentNode) || getSectionNodeName(linkParentNode));
      if (regionName) {
        return regionName;
      }
      linkParentNode = linkParentNode.parentNode;
    }
    return "BODY";
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
  const getLinkDetails = createGetLinkDetails({
    window,
    getLinkName,
    getLinkRegion,
    getAbsoluteUrlFromAnchorElement,
    findSupportedAnchorElement,
    determineLinkType
  });
  const createActivityCollector = ({
    config,
    eventManager,
    handleError,
    logger
  }) => {
    const linkClick = createLinkClick({
      getLinkDetails,
      config,
      logger
    });
    return {
      lifecycle: {
        onComponentsRegistered(tools) {
          const {
            lifecycle
          } = tools;
          attachClickActivityCollector({
            eventManager,
            lifecycle,
            handleError
          });
          // TODO: createScrollActivityCollector ...
        },

        onClick({
          event,
          clickedElement
        }) {
          linkClick({
            targetElement: clickedElement,
            event
          });
        }
      }
    };
  };
  createActivityCollector.namespace = "ActivityCollector";
  createActivityCollector.configValidators = configValidators$1;
  createActivityCollector.buildOnInstanceConfiguredExtraParams = ({
    config,
    logger
  }) => {
    return {
      getLinkDetails: targetElement => {
        return getLinkDetails({
          targetElement,
          config,
          logger
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
  const createResultLogMessage$1 = (idSync, success) => {
    return `ID sync ${success ? "succeeded" : "failed"}: ${idSync.spec.url}`;
  };
  var injectProcessIdSyncs = (({
    fireReferrerHideableImage,
    logger
  }) => idSyncs => {
    const urlIdSyncs = idSyncs.filter(idSync => idSync.type === "url");
    if (!urlIdSyncs.length) {
      return Promise.resolve();
    }
    return Promise.all(urlIdSyncs.map(idSync => {
      return fireReferrerHideableImage(idSync.spec).then(() => {
        logger.info(createResultLogMessage$1(idSync, true));
      }).catch(() => {
        // We intentionally do not throw an error if id syncs fail. We
        // consider it a non-critical failure and therefore do not want it to
        // reject the promise handed back to the customer.
        logger.error(createResultLogMessage$1(idSync, false));
      });
    })).then(noop$1);
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
  const configValidators = boundObjectOf({
    thirdPartyCookiesEnabled: boundBoolean().default(true),
    idMigrationEnabled: boundBoolean().default(true)
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
  var getIdentityOptionsValidator = boundObjectOf({
    namespaces: boundArrayOf(boundLiteral("ECID")).nonEmpty().uniqueItems().default(["ECID"]),
    edgeConfigOverrides: validateConfigOverride
  }).noUnknownFields().default({
    namespaces: ["ECID"]
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
    edgeConfigOverrides: validateConfigOverride
  }).required().noUnknownFields();

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
  var createComponent$4 = (({
    addEcidQueryToPayload,
    addQueryStringIdentityToPayload,
    ensureSingleIdentity,
    setLegacyEcid,
    handleResponseForIdSyncs,
    getEcidFromResponse,
    getIdentity,
    consent,
    appendIdentityToUrl,
    logger
  }) => {
    let ecid;
    let edge = {};
    return {
      lifecycle: {
        onBeforeRequest({
          request,
          onResponse,
          onRequestFailure
        }) {
          // Querying the ECID on every request to be able to set the legacy cookie, and make it
          // available for the `getIdentity` command.
          addEcidQueryToPayload(request.getPayload());
          addQueryStringIdentityToPayload(request.getPayload());
          return ensureSingleIdentity({
            request,
            onResponse,
            onRequestFailure
          });
        },
        onResponse({
          response
        }) {
          if (!ecid) {
            ecid = getEcidFromResponse(response);

            // Only data collection calls will have an ECID in the response.
            // https://jira.corp.adobe.com/browse/EXEG-1234
            if (ecid) {
              setLegacyEcid(ecid);
            }
          }
          // For sendBeacon requests, getEdge() will return {}, so we are using assign here
          // so that sendBeacon requests don't override the edge info from before.
          edge = assign(edge, response.getEdge());
          return handleResponseForIdSyncs(response);
        }
      },
      commands: {
        getIdentity: {
          optionsValidator: getIdentityOptionsValidator,
          run: options => {
            return consent.awaitConsent().then(() => {
              return ecid ? undefined : getIdentity(options);
            }).then(() => {
              return {
                identity: {
                  ECID: ecid
                },
                edge
              };
            });
          }
        },
        appendIdentityToUrl: {
          optionsValidator: appendIdentityToUrlOptionsValidator,
          run: options => {
            return consent.withConsent().then(() => {
              return ecid ? undefined : getIdentity(options);
            }).then(() => {
              return {
                url: appendIdentityToUrl(ecid, options.url)
              };
            }).catch(error => {
              logger.warn(`Unable to append identity to url. ${error.message}`);
              return options;
            });
          }
        }
      }
    };
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

  /**
   * Handles migration of ECID to and from Visitor.js.
   */
  var createLegacyIdentity = (({
    config,
    getEcidFromVisitor,
    apexDomain,
    isPageSsl,
    cookieJar
  }) => {
    const {
      idMigrationEnabled,
      orgId
    } = config;
    const amcvCookieName = `AMCV_${orgId}`;
    const getEcidFromLegacyCookies = () => {
      let ecid = null;
      const secidCookieName = "s_ecid";
      const legacyEcidCookieValue = cookieJar.get(secidCookieName) || cookieJar.get(amcvCookieName);
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
          const extraOptions = isPageSsl ? {
            sameSite: "none",
            secure: true
          } : {};
          cookieJar.set(amcvCookieName, `MCMID|${ecid}`, {
            domain: apexDomain,
            // Without `expires` this will be a session cookie.
            expires: 390,
            // days, or 13 months.
            ...extraOptions
          });
        }
      }
    };
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
  var awaitVisitorOptIn = (({
    logger
  }) => {
    return new Promise((resolve, reject) => {
      if (isObject(window.adobe) && isObject(window.adobe.optIn)) {
        const optInOld = window.adobe.optIn;
        logger.info("Delaying request while waiting for legacy opt-in to let Visitor retrieve ECID from server.");
        optInOld.fetchPermissions(() => {
          if (optInOld.isApproved([optInOld.Categories.ECID])) {
            logger.info("Received legacy opt-in approval to let Visitor retrieve ECID from server.");
            resolve();
          } else {
            reject(new Error("Legacy opt-in was declined."));
          }
        }, true);
      } else {
        resolve();
      }
    });
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
  var getVisitor = (window => {
    const Visitor = window.Visitor;
    return isFunction(Visitor) && isFunction(Visitor.getInstance) && Visitor;
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
  var injectGetEcidFromVisitor = (({
    logger,
    orgId,
    awaitVisitorOptIn
  }) => {
    return () => {
      const Visitor = getVisitor(window);
      if (Visitor) {
        // Need to explicitly wait for optIn because visitor will call callback
        // with invalid values prior to optIn being approved
        return awaitVisitorOptIn({
          logger
        }).then(() => {
          logger.info("Delaying request while using Visitor to retrieve ECID from server.");
          return new Promise(resolve => {
            const visitor = Visitor.getInstance(orgId, {});
            visitor.getMarketingCloudVisitorID(ecid => {
              logger.info("Resuming previously delayed request that was waiting for ECID from Visitor.");
              resolve(ecid);
            }, true);
          });
        }).catch(error => {
          // If consent was denied, get the ECID from experience edge. OptIn and AEP Web SDK
          // consent should operate independently, but during id migration AEP Web SDK needs
          // to wait for optIn object consent resolution so that only one ECID is generated.
          if (error) {
            logger.info(`${error.message}, retrieving ECID from experience edge`);
          } else {
            logger.info("An error occurred while obtaining the ECID from Visitor.");
          }
        });
      }
      return Promise.resolve();
    };
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

  var injectHandleResponseForIdSyncs = (({
    processIdSyncs
  }) => {
    return response => {
      return processIdSyncs(response.getPayloadsByType("identity:exchange"));
    };
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

  // TO-DOCUMENT: We queue subsequent requests until we have an identity cookie.
  var injectEnsureSingleIdentity = (({
    doesIdentityCookieExist,
    setDomainForInitialIdentityPayload,
    addLegacyEcidToPayload,
    awaitIdentityCookie,
    logger
  }) => {
    let obtainedIdentityPromise;
    const allowRequestToGoWithoutIdentity = request => {
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
    return ({
      request,
      onResponse,
      onRequestFailure
    }) => {
      if (doesIdentityCookieExist()) {
        request.setIsIdentityEstablished();
        return Promise.resolve();
      }
      if (obtainedIdentityPromise) {
        // We don't have an identity cookie, but at least one request has
        // been sent to get it. Konductor may set the identity cookie in the
        // response. We will hold up this request until the last request
        // requiring identity returns and awaitIdentityCookie confirms the
        // identity was set.
        logger.info("Delaying request while retrieving ECID from server.");
        const previousObtainedIdentityPromise = obtainedIdentityPromise;

        // This promise resolves when we have an identity cookie. Additional
        // requests are chained together so that only one is sent at a time
        // until we have the identity cookie.
        obtainedIdentityPromise = previousObtainedIdentityPromise.catch(() => {
          return awaitIdentityCookie({
            onResponse,
            onRequestFailure
          });
        });

        // When this returned promise resolves, the request will go out.
        return previousObtainedIdentityPromise.then(() => {
          logger.info("Resuming previously delayed request.");
          request.setIsIdentityEstablished();
        })
        // If Konductor did not set the identity cookie on the previous
        // request, then awaitIdentityCookie will reject its promise.
        // Catch the rejection here and allow this request to go out.
        .catch(() => {
          return allowRequestToGoWithoutIdentity(request);
        });
      }

      // For Alloy+Konductor communication to be as robust as possible and
      // to ensure we don't mint new ECIDs for requests that would otherwise
      // be sent in parallel, we'll let this request go out to fetch the
      // cookie
      obtainedIdentityPromise = awaitIdentityCookie({
        onResponse,
        onRequestFailure
      });
      return allowRequestToGoWithoutIdentity(request);
    };
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

  var ecidNamespace = "ECID";

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
  var addEcidQueryToPayload = (payload => {
    payload.mergeQuery({
      identity: {
        fetch: [ecidNamespace]
      }
    });
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
  const matchUserAgent = regexs => {
    return userAgent => {
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
  };
  var getBrowser = memoize(window => {
    return matchUserAgent({
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
      [SAFARI]: /Version\/([0-9\._]+).*Safari/
      /* eslint-enable */
    })(window.navigator.userAgent);
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
  var injectSetDomainForInitialIdentityPayload = (({
    thirdPartyCookiesEnabled,
    areThirdPartyCookiesSupportedByDefault
  }) => {
    return request => {
      if (thirdPartyCookiesEnabled && areThirdPartyCookiesSupportedByDefault(getBrowser(window))) {
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
  var injectAddLegacyEcidToPayload = (({
    getLegacyEcid,
    addEcidToPayload
  }) => {
    return payload => {
      if (payload.hasIdentity(ecidNamespace)) {
        // don't get the legacy identity if we already have the query string identity or if
        // the user specified it in the identity map
        return Promise.resolve();
      }
      return getLegacyEcid().then(ecidToMigrate => {
        if (ecidToMigrate) {
          addEcidToPayload(payload, ecidToMigrate);
        }
      });
    };
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

  var queryStringIdentityParam = "adobe_mc";

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
  const LINK_TTL_SECONDS = 300; // 5 minute link time to live

  var injectAddQueryStringIdentityToPayload = (({
    locationSearch,
    dateProvider,
    orgId,
    logger
  }) => payload => {
    if (payload.hasIdentity(ecidNamespace)) {
      // don't overwrite a user provided ecid identity
      return;
    }
    const parsedQueryString = queryString.parse(locationSearch);
    const queryStringValue = parsedQueryString[queryStringIdentityParam];
    if (queryStringValue === undefined) {
      return;
    }
    const properties = queryStringValue.split("|").reduce((memo, keyValue) => {
      const [key, value] = keyValue.split("=");
      memo[key] = value;
      return memo;
    }, {});
    // We are using MCMID and MCORGID to be compatible with Visitor.
    const ts = parseInt(properties.TS, 10);
    const mcmid = properties.MCMID;
    const mcorgid = decodeURIComponent(properties.MCORGID);
    if (
    // When TS is not specified or not a number, the following inequality returns false.
    // All inequalities with NaN variables are false.
    dateProvider().getTime() / 1000 <= ts + LINK_TTL_SECONDS && mcorgid === orgId && mcmid) {
      logger.info(`Found valid ECID identity ${mcmid} from the adobe_mc query string parameter.`);
      payload.addIdentity(ecidNamespace, {
        id: mcmid
      });
    } else {
      logger.info("Detected invalid or expired adobe_mc query string parameter.");
    }
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
  var addEcidToPayload = ((payload, ecid) => {
    payload.addIdentity(ecidNamespace, {
      id: ecid
    });
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

  var injectAwaitIdentityCookie = (({
    doesIdentityCookieExist,
    orgId
  }) => {
    /**
     * Returns a promise that will be resolved once an identity cookie exists.
     * If an identity cookie doesn't already exist, it should always exist after
     * the first response.
     */
    return ({
      onResponse,
      onRequestFailure
    }) => {
      return new Promise((resolve, reject) => {
        onResponse(() => {
          if (doesIdentityCookieExist()) {
            resolve();
          } else {
            // This logic assumes that the code setting the cookie is working as expected and that
            // the cookie was missing from the response.
            const noIdentityCookieError = new Error(`An identity was not set properly. Please verify that the org ID ${orgId} configured in Alloy matches the org ID specified in the edge configuration.`);

            // Rejecting the promise will reject commands that were queued
            // by the Identity component while waiting on the response to
            // the initial request.
            reject(noIdentityCookieError);

            // Throwing an error will reject the event command that initiated
            // the request.
            throw noIdentityCookieError;
          }
        });
        onRequestFailure(() => {
          if (doesIdentityCookieExist()) {
            resolve();
          } else {
            // The error from the request failure will be logged separately. Rejecting this here
            // will tell ensureSingleIdentity to send the next request without identity
            reject(new Error("No identity was set on response."));
          }
        });
      });
    };
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
  var getEcidFromResponse = (response => {
    const identityResultPayloads = response.getPayloadsByType("identity:result");
    const ecidPayload = find(identityResultPayloads, payload => payload.namespace && payload.namespace.code === ecidNamespace);
    return ecidPayload ? ecidPayload.id : undefined;
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
  var createAddIdentity = (content => {
    return (namespaceCode, identity) => {
      content.xdm = content.xdm || {};
      content.xdm.identityMap = content.xdm.identityMap || {};
      content.xdm.identityMap[namespaceCode] = content.xdm.identityMap[namespaceCode] || [];
      content.xdm.identityMap[namespaceCode].push(identity);
    };
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

  // This provides the base functionality that all types of requests share.
  var createRequest = (options => {
    const {
      payload,
      getAction,
      getUseSendBeacon,
      datastreamIdOverride
    } = options;
    const id = uuid();
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
          isIdentityEstablished
        });
      },
      getDatastreamIdOverride() {
        return datastreamIdOverride;
      },
      getUseSendBeacon() {
        return getUseSendBeacon({
          isIdentityEstablished
        });
      },
      getUseIdThirdPartyDomain() {
        return shouldUseThirdPartyDomain;
      },
      setUseIdThirdPartyDomain() {
        shouldUseThirdPartyDomain = true;
      },
      setIsIdentityEstablished() {
        isIdentityEstablished = true;
      }
    };
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
  var createDataCollectionRequest = (({
    payload: dataCollectionRequestPayload,
    datastreamIdOverride
  }) => {
    const getUseSendBeacon = ({
      isIdentityEstablished
    }) => {
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
      return dataCollectionRequestPayload.getDocumentMayUnload() && isIdentityEstablished;
    };
    return createRequest({
      payload: dataCollectionRequestPayload,
      getAction({
        isIdentityEstablished
      }) {
        return getUseSendBeacon({
          isIdentityEstablished
        }) ? "collect" : "interact";
      },
      getUseSendBeacon,
      datastreamIdOverride
    });
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

  // This provides the base functionality that all types of
  // request payloads share.
  var createRequestPayload = (options => {
    const {
      content,
      addIdentity,
      hasIdentity
    } = options;
    const mergeConfigOverride = createMerger(content, "meta.configOverrides");
    return {
      mergeMeta: createMerger(content, "meta"),
      mergeState: createMerger(content, "meta.state"),
      mergeQuery: createMerger(content, "query"),
      mergeConfigOverride: updates => mergeConfigOverride(prepareConfigOverridesForEdge(updates)),
      addIdentity,
      hasIdentity,
      toJSON() {
        return content;
      }
    };
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

  var createHasIdentity = (content => namespaceCode => {
    return (content.xdm && content.xdm.identityMap && content.xdm.identityMap[namespaceCode]) !== undefined;
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
  var createDataCollectionRequestPayload = (() => {
    const content = {};
    const payload = createRequestPayload({
      content,
      addIdentity: createAddIdentity(content),
      hasIdentity: createHasIdentity(content)
    });
    payload.addEvent = event => {
      content.events = content.events || [];
      content.events.push(event);
    };
    payload.getDocumentMayUnload = () => {
      return (content.events || []).some(event => event.getDocumentMayUnload());
    };
    return payload;
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
   * @typedef {{ datastreamId: string, [k: string]: Object }} Override
   * @typedef {Object} RequestPayload
   * @property {function(Override): void} mergeConfigOverride
   * @param {Object} params
   * @param {Override} params.localConfigOverrides
   * @param {Override} params.globalConfigOverrides
   * @param {RequestPayload} params.payload
   * @returns {{ payload: RequestPayload, datastreamIdOverride: string }}
   */
  var createRequestParams = (({
    localConfigOverrides,
    globalConfigOverrides,
    payload
  }) => {
    const requestParams = {
      payload
    };
    const {
      datastreamId,
      ...localConfigOverridesWithoutDatastreamId
    } = localConfigOverrides || {};
    if (datastreamId) {
      requestParams.datastreamIdOverride = datastreamId;
    }
    payload.mergeConfigOverride(globalConfigOverrides);
    payload.mergeConfigOverride(localConfigOverridesWithoutDatastreamId);
    return requestParams;
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
  const ASSURANCE_VALIDATION_SESSION_URL_PARAM = "adb_validation_sessionid";
  const ASSURANCE_VALIDATION_NAMESPACE = "validation.";
  const CLIENT_ID = "clientId";
  const getOrCreateAssuranceClientId = storage => {
    let clientId = storage.persistent.getItem(CLIENT_ID);
    if (!clientId) {
      clientId = uuid();
      storage.persistent.setItem(CLIENT_ID, clientId);
    }
    return clientId;
  };
  var createGetAssuranceValidationTokenParams = (({
    window,
    createNamespacedStorage
  }) => {
    const storage = createNamespacedStorage(ASSURANCE_VALIDATION_NAMESPACE);
    return () => {
      const parsedQuery = queryString.parse(window.location.search);
      const validationSessionId = parsedQuery[ASSURANCE_VALIDATION_SESSION_URL_PARAM];
      if (!validationSessionId) {
        return "";
      }
      const clientId = getOrCreateAssuranceClientId(storage);
      const validationToken = `${validationSessionId}|${clientId}`;
      return `&${queryString.stringify({
      adobeAepValidationToken: validationToken
    })}`;
    };
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
  var createGetIdentity = (({
    sendEdgeNetworkRequest,
    createIdentityRequestPayload,
    createIdentityRequest,
    globalConfigOverrides
  }) => {
    return ({
      namespaces,
      edgeConfigOverrides: localConfigOverrides
    } = {}) => {
      const requestParams = createRequestParams({
        payload: createIdentityRequestPayload(namespaces),
        globalConfigOverrides,
        localConfigOverrides
      });
      const request = createIdentityRequest(requestParams);
      return sendEdgeNetworkRequest({
        request
      });
    };
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
  var createIdentityRequest = (({
    payload,
    datastreamIdOverride
  }) => {
    return createRequest({
      payload,
      datastreamIdOverride,
      getAction() {
        return "identity/acquire";
      },
      getUseSendBeacon() {
        return false;
      }
    });
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
  var createIdentityRequestPayload = (namespaces => {
    const content = {
      query: {
        identity: {
          fetch: namespaces
        }
      }
    };
    return createRequestPayload({
      content,
      addIdentity: createAddIdentity(content),
      hasIdentity: createHasIdentity(content)
    });
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
  const URL_REGEX = /^([^?#]*)(\??[^#]*)(#?.*)$/;
  const getSeparator = queryString => {
    if (queryString === "") {
      return "?";
    }
    if (queryString === "?") {
      return "";
    }
    return "&";
  };
  var injectAppendIdentityToUrl = (({
    dateProvider,
    orgId
  }) => (ecid, url) => {
    const ts = Math.round(dateProvider().getTime() / 1000);
    const adobemc = encodeURIComponent(`TS=${ts}|MCMID=${ecid}|MCORGID=${encodeURIComponent(orgId)}`);
    const [, location, queryString, fragment] = url.match(URL_REGEX);
    const separator = getSeparator(queryString);
    return `${location}${queryString}${separator}adobe_mc=${adobemc}${fragment}`;
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
  const createIdentity = ({
    config,
    logger,
    consent,
    fireReferrerHideableImage,
    sendEdgeNetworkRequest,
    apexDomain
  }) => {
    const {
      orgId,
      thirdPartyCookiesEnabled,
      edgeConfigOverrides: globalConfigOverrides
    } = config;
    const getEcidFromVisitor = injectGetEcidFromVisitor({
      logger,
      orgId,
      awaitVisitorOptIn
    });
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar
    });
    const legacyIdentity = createLegacyIdentity({
      config,
      getEcidFromVisitor,
      apexDomain,
      cookieJar: loggingCookieJar,
      isPageSsl: window.location.protocol === "https:"
    });
    const doesIdentityCookieExist = injectDoesIdentityCookieExist({
      orgId
    });
    const getIdentity = createGetIdentity({
      sendEdgeNetworkRequest,
      createIdentityRequestPayload,
      createIdentityRequest,
      globalConfigOverrides
    });
    const setDomainForInitialIdentityPayload = injectSetDomainForInitialIdentityPayload({
      thirdPartyCookiesEnabled,
      areThirdPartyCookiesSupportedByDefault
    });
    const addLegacyEcidToPayload = injectAddLegacyEcidToPayload({
      getLegacyEcid: legacyIdentity.getEcid,
      addEcidToPayload
    });
    const addQueryStringIdentityToPayload = injectAddQueryStringIdentityToPayload({
      locationSearch: window.document.location.search,
      dateProvider: () => new Date(),
      orgId,
      logger
    });
    const awaitIdentityCookie = injectAwaitIdentityCookie({
      doesIdentityCookieExist,
      orgId
    });
    const ensureSingleIdentity = injectEnsureSingleIdentity({
      doesIdentityCookieExist,
      setDomainForInitialIdentityPayload,
      addLegacyEcidToPayload,
      awaitIdentityCookie,
      logger
    });
    const processIdSyncs = injectProcessIdSyncs({
      fireReferrerHideableImage,
      logger
    });
    const handleResponseForIdSyncs = injectHandleResponseForIdSyncs({
      processIdSyncs
    });
    const appendIdentityToUrl = injectAppendIdentityToUrl({
      dateProvider: () => new Date(),
      orgId,
      globalConfigOverrides
    });
    return createComponent$4({
      addEcidQueryToPayload,
      addQueryStringIdentityToPayload,
      ensureSingleIdentity,
      setLegacyEcid: legacyIdentity.setEcid,
      handleResponseForIdSyncs,
      getEcidFromResponse,
      getIdentity,
      consent,
      appendIdentityToUrl,
      logger,
      config
    });
  };
  createIdentity.namespace = "Identity";
  createIdentity.configValidators = configValidators;

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
    return `URL destination ${success ? "succeeded" : "failed"}: ${urlDestination.spec.url}`;
  };
  var injectProcessDestinations = (({
    fireReferrerHideableImage,
    logger,
    cookieJar,
    isPageSsl
  }) => {
    const extraCookieOptions = isPageSsl ? {
      sameSite: "none",
      secure: true
    } : {};
    const processCookies = destinations => {
      const cookieDestinations = destinations.filter(dest => dest.type === "cookie");
      cookieDestinations.forEach(dest => {
        const {
          name,
          value,
          domain,
          ttlDays
        } = dest.spec;
        cookieJar.set(name, value || "", {
          domain: domain || "",
          expires: ttlDays || 10,
          // days
          ...extraCookieOptions
        });
      });
    };
    const processUrls = destinations => {
      const urlDestinations = destinations.filter(dest => dest.type === "url");
      return Promise.all(urlDestinations.map(urlDestination => {
        return fireReferrerHideableImage(urlDestination.spec).then(() => {
          logger.info(createResultLogMessage(urlDestination, true));
        }).catch(() => {
          // We intentionally do not throw an error if destinations fail. We
          // consider it a non-critical failure and therefore do not want it to
          // reject the promise handed back to the customer.
        });
      })).then(noop$1);
    };
    return destinations => {
      processCookies(destinations);
      return processUrls(destinations);
    };
  });

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

  var injectProcessResponse = (({
    processDestinations
  }) => {
    const processPushDestinations = ({
      response
    }) => {
      const destinations = response.getPayloadsByType("activation:push");
      return processDestinations(destinations);
    };
    const retrievePullDestinations = ({
      response
    }) => {
      return {
        destinations: response.getPayloadsByType("activation:pull")
      };
    };
    return ({
      response
    }) => {
      return processPushDestinations({
        response
      }).then(() => retrievePullDestinations({
        response
      }));
    };
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
  const createAudiences = ({
    logger,
    fireReferrerHideableImage
  }) => {
    // we override the js-cookie converter to encode the cookie value similar on how it is in DIL (PDCL-10238)
    const cookieJarWithEncoding = cookieJar.withConverter({
      write: value => {
        return encodeURIComponent(value);
      }
    });
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar: cookieJarWithEncoding
    });
    const processDestinations = injectProcessDestinations({
      fireReferrerHideableImage,
      logger,
      cookieJar: loggingCookieJar,
      isPageSsl: window.location.protocol === "https:"
    });
    const processResponse = injectProcessResponse({
      processDestinations
    });
    return {
      lifecycle: {
        onResponse: processResponse
      },
      commands: {}
    };
  };
  createAudiences.namespace = "Audiences";

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
  const AUTHORITY_REGEX = /^(?:.*@)?(?:[a-z\d\u00a1-\uffff.-]+|\[[a-f\d:]+])(?::\d+)?$/;
  const PATH_REGEX = /^\/(?:[/\w\u00a1-\uffff-.~]|%[a-fA-F\d]{2})*$/;
  const FRAGMENT_REGEX = /^#(?:[/\w\u00a1-\uffff-.~]|%[a-fA-F\d]{2})+$/;
  const normalizePath = (path = "/") => {
    let end = path.length;
    while (end > 0 && "/".indexOf(path.charAt(end - 1)) !== -1) {
      end -= 1;
    }
    return path.substring(0, end) || "/";
  };
  const getSurfaceType = surfaceTypeMatch => isNonEmptyString(surfaceTypeMatch) ? surfaceTypeMatch.toLowerCase() : "";
  const getAuthority = authorityMatch => isNonEmptyString(authorityMatch) ? authorityMatch.toLowerCase() : "";
  const getPath = pathMatch => isNonEmptyString(pathMatch) ? normalizePath(pathMatch) : "/";
  const parseSurface = surfaceString => {
    const matched = surfaceString.match(SURFACE_REGEX);
    return matched ? {
      surfaceType: getSurfaceType(matched[1]),
      authority: getAuthority(matched[2]),
      path: getPath(matched[3]),
      fragment: matched[4]
    } : null;
  };
  const stringifySurface = surface => `${surface.surfaceType}${SURFACE_TYPE_DELIMITER}${surface.authority}${surface.path || ""}${surface.fragment || ""}`;
  const buildPageSurface = getPageLocation => {
    const location = getPageLocation();
    const host = location.host.toLowerCase();
    const path = location.pathname;
    return WEB + SURFACE_TYPE_DELIMITER + host + normalizePath(path);
  };
  const expandFragmentSurface = (surface, getPageLocation) => startsWith(surface, FRAGMENT_DELIMITER) ? buildPageSurface(getPageLocation) + surface : surface;
  const validateSurface = (surface, getPageLocation, logger) => {
    const invalidateSurface = validationError => {
      logger.warn(validationError);
      return null;
    };
    if (!isNonEmptyString(surface)) {
      return invalidateSurface(`Invalid surface: ${surface}`);
    }
    const expanded = expandFragmentSurface(surface, getPageLocation);
    const parsed = parseSurface(expanded);
    if (parsed === null) {
      return invalidateSurface(`Invalid surface: ${surface}`);
    }
    if (!includes([WEB, WEBAPP], parsed.surfaceType)) {
      return invalidateSurface(`Unsupported surface type ${parsed.surfaceType} in surface: ${surface}`);
    }
    if (!parsed.authority || !AUTHORITY_REGEX.test(parsed.authority)) {
      return invalidateSurface(`Invalid authority ${parsed.authority} in surface: ${surface}`);
    }
    if (parsed.path && !PATH_REGEX.test(parsed.path)) {
      return invalidateSurface(`Invalid path ${parsed.path} in surface: ${surface}`);
    }
    if (parsed.fragment && !FRAGMENT_REGEX.test(parsed.fragment)) {
      return invalidateSurface(`Invalid fragment ${parsed.fragment} in surface: ${surface}`);
    }
    return parsed;
  };
  const isPageWideSurface = scope => !!scope && scope.indexOf(WEB + SURFACE_TYPE_DELIMITER) === 0 && scope.indexOf(FRAGMENT_DELIMITER) === -1;
  const normalizeSurfaces = (surfaces = [], getPageLocation, logger) => surfaces.map(surface => validateSurface(surface, getPageLocation, logger)).filter(surface => !isNil(surface)).map(stringifySurface);

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

  const DEFAULT_CONTENT_ITEM = "https://ns.adobe.com/personalization/default-content-item";
  const DOM_ACTION = "https://ns.adobe.com/personalization/dom-action";
  const HTML_CONTENT_ITEM = "https://ns.adobe.com/personalization/html-content-item";
  const JSON_CONTENT_ITEM = "https://ns.adobe.com/personalization/json-content-item";
  const RULESET_ITEM = "https://ns.adobe.com/personalization/ruleset-item";
  const REDIRECT_ITEM = "https://ns.adobe.com/personalization/redirect-item";
  const MESSAGE_IN_APP = "https://ns.adobe.com/personalization/message/in-app";
  const MESSAGE_FEED_ITEM = "https://ns.adobe.com/personalization/message/feed-item";

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
  const addPageWideScope = scopes => {
    if (!includes(scopes, PAGE_WIDE_SCOPE)) {
      scopes.push(PAGE_WIDE_SCOPE);
    }
  };
  const addPageSurface = (surfaces, getPageLocation) => {
    const pageSurface = buildPageSurface(getPageLocation);
    if (!includes(surfaces, pageSurface)) {
      surfaces.push(pageSurface);
    }
  };
  const dedupe = array => array.filter((item, pos) => array.indexOf(item) === pos);
  var createPersonalizationDetails = (({
    getPageLocation,
    renderDecisions,
    decisionScopes,
    personalization,
    event,
    isCacheInitialized,
    logger
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
        return decisionScopes.length > 0 || isNonEmptyArray(personalization.decisionScopes);
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
        const eventSurfaces = normalizeSurfaces(personalization.surfaces, getPageLocation, logger);
        if (this.shouldRequestDefaultPersonalization()) {
          addPageWideScope(scopes);
          addPageSurface(eventSurfaces, getPageLocation);
        }
        const schemas = [DEFAULT_CONTENT_ITEM, HTML_CONTENT_ITEM, JSON_CONTENT_ITEM, REDIRECT_ITEM, RULESET_ITEM, MESSAGE_IN_APP, MESSAGE_FEED_ITEM];
        if (includes(scopes, PAGE_WIDE_SCOPE)) {
          schemas.push(DOM_ACTION);
        }
        return {
          schemas,
          decisionScopes: dedupe(scopes),
          surfaces: dedupe(eventSurfaces)
        };
      },
      isCacheInitialized() {
        return isCacheInitialized;
      },
      shouldFetchData() {
        return this.hasScopes() || this.hasSurfaces() || this.shouldRequestDefaultPersonalization();
      },
      shouldUseCachedData() {
        return this.hasViewName() && !this.shouldFetchData();
      },
      shouldRequestDefaultPersonalization() {
        return personalization.defaultPersonalizationEnabled || !this.isCacheInitialized() && personalization.defaultPersonalizationEnabled !== false;
      }
    };
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
    DISMISS: "dismiss"
  };
  const eventTypeToPropositionEventTypeMapping = {
    [DISPLAY]: PropositionEventType.DISPLAY,
    [INTERACT]: PropositionEventType.INTERACT,
    [TRIGGER]: PropositionEventType.TRIGGER,
    [DISMISS]: PropositionEventType.DISMISS
  };
  ({
    [PropositionEventType.DISPLAY]: DISPLAY,
    [PropositionEventType.INTERACT]: INTERACT,
    [PropositionEventType.TRIGGER]: TRIGGER,
    [PropositionEventType.DISMISS]: DISMISS
  });
  const getPropositionEventType = eventType => eventTypeToPropositionEventTypeMapping[eventType];

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
    propositions: []
  };
  var validateApplyPropositionsOptions = (({
    logger,
    options
  }) => {
    const applyPropositionsOptionsValidator = boundObjectOf({
      propositions: boundArrayOf(boundObjectOf(boundAnything())),
      metadata: boundObjectOf(boundAnything()),
      viewName: boundString()
    }).required();
    try {
      return applyPropositionsOptionsValidator(options);
    } catch (e) {
      logger.warn("Invalid options for applyPropositions. No propositions will be applied.", e);
      return EMPTY_PROPOSITIONS;
    }
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
  var createComponent$3 = (({
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
    onDecisionHandler
  }) => {
    return {
      lifecycle: {
        onDecision: onDecisionHandler,
        onBeforeRequest({
          request
        }) {
          setTargetMigration(request);
          return Promise.resolve();
        },
        onBeforeEvent({
          event,
          renderDecisions,
          decisionScopes = [],
          personalization = {},
          onResponse = noop$1,
          onRequestFailure = noop$1
        }) {
          // Include propositions on all responses, overridden with data as needed
          onResponse(() => ({
            propositions: []
          }));
          onRequestFailure(() => showContainers());
          if (isAuthoringModeEnabled()) {
            logger.warn(AUTHORING_ENABLED);

            // If we are in authoring mode we disable personalization
            mergeQuery(event, {
              enabled: false
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
            logger
          });
          const decisionsMetaPromises = [];
          if (personalizationDetails.shouldIncludeRenderedPropositions()) {
            decisionsMetaPromises.push(renderedPropositions.clear());
          }
          if (personalizationDetails.shouldFetchData()) {
            const cacheUpdate = viewCache.createCacheUpdate(personalizationDetails.getViewName());
            onRequestFailure(() => cacheUpdate.cancel());
            fetchDataHandler({
              cacheUpdate,
              personalizationDetails,
              event,
              onResponse
            });
          } else if (personalizationDetails.shouldUseCachedData()) {
            // eslint-disable-next-line consistent-return
            decisionsMetaPromises.push(viewChangeHandler({
              personalizationDetails,
              event,
              onResponse,
              onRequestFailure
            }));
          }

          // This promise.all waits for both the pending display notifications to be resolved
          // (i.e. the top of page call to finish rendering) and the view change handler to
          // finish rendering anything for this view.
          return Promise.all(decisionsMetaPromises).then(decisionsMetas => {
            // We only want to call mergeDecisionsMeta once, but we can get the propositions
            // from two places: the pending display notifications and the view change handler.
            const decisionsMeta = flatMap(decisionsMetas, dms => dms);
            if (isNonEmptyArray(decisionsMeta)) {
              mergeDecisionsMeta(event, decisionsMeta, [PropositionEventType.DISPLAY]);
            }
          });
        },
        onClick({
          event,
          clickedElement
        }) {
          onClickHandler({
            event,
            clickedElement
          });
        }
      },
      commands: {
        applyPropositions: {
          optionsValidator: options => validateApplyPropositionsOptions({
            logger,
            options
          }),
          run: applyPropositions
        }
      }
    };
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
  var createFragment = (content => {
    return createNode(DIV, {}, {
      innerHTML: content
    });
  });

  var css_escape = {exports: {}};

  /*! https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
  css_escape.exports;
  (function (module, exports) {
    (function (root, factory) {
      // https://github.com/umdjs/umd/blob/master/returnExports.js
      {
        // For Node.js.
        module.exports = factory(root);
      }
    })(typeof commonjsGlobal != 'undefined' ? commonjsGlobal : commonjsGlobal, function (root) {
      if (root.CSS && root.CSS.escape) {
        return root.CSS.escape;
      }

      // https://drafts.csswg.org/cssom/#serialize-an-identifier
      var cssEscape = function (value) {
        if (arguments.length == 0) {
          throw new TypeError('`CSS.escape` requires an argument.');
        }
        var string = String(value);
        var length = string.length;
        var index = -1;
        var codeUnit;
        var result = '';
        var firstCodeUnit = string.charCodeAt(0);
        while (++index < length) {
          codeUnit = string.charCodeAt(index);
          // Note: there’s no need to special-case astral symbols, surrogate
          // pairs, or lone surrogates.

          // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
          // (U+FFFD).
          if (codeUnit == 0x0000) {
            result += '\uFFFD';
            continue;
          }
          if (
          // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
          // U+007F, […]
          codeUnit >= 0x0001 && codeUnit <= 0x001F || codeUnit == 0x007F ||
          // If the character is the first character and is in the range [0-9]
          // (U+0030 to U+0039), […]
          index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039 ||
          // If the character is the second character and is in the range [0-9]
          // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]

          index == 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit == 0x002D) {
            // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
            result += '\\' + codeUnit.toString(16) + ' ';
            continue;
          }
          if (
          // If the character is the first character and is a `-` (U+002D), and
          // there is no second character, […]
          index == 0 && length == 1 && codeUnit == 0x002D) {
            result += '\\' + string.charAt(index);
            continue;
          }

          // If the character is not handled by one of the above rules and is
          // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
          // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
          // U+005A), or [a-z] (U+0061 to U+007A), […]
          if (codeUnit >= 0x0080 || codeUnit == 0x002D || codeUnit == 0x005F || codeUnit >= 0x0030 && codeUnit <= 0x0039 || codeUnit >= 0x0041 && codeUnit <= 0x005A || codeUnit >= 0x0061 && codeUnit <= 0x007A) {
            // the character itself
            result += string.charAt(index);
            continue;
          }

          // Otherwise, the escaped character.
          // https://drafts.csswg.org/cssom/#escape-a-character
          result += '\\' + string.charAt(index);
        }
        return result;
      };
      if (!root.CSS) {
        root.CSS = {};
      }
      root.CSS.escape = cssEscape;
      return cssEscape;
    });
  })(css_escape, css_escape.exports);
  var css_escapeExports = css_escape.exports;
  var escape$1 = /*@__PURE__*/getDefaultExportFromCjs(css_escapeExports);

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
  const isNotEqSelector = str => str.indexOf(EQ_START) === -1;
  const splitWithEq = selector => {
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
  // CSS.escape() polyfill can be found here: https://github.com/mathiasbynens/CSS.escape
  const replaceIdentifier = (_, $1, $2) => `${$1}${escape$1($2)}`;
  const escapeIdentifiersInSelector = selector => {
    return selector.replace(CSS_IDENTIFIER_PATTERN, replaceIdentifier);
  };
  const parseSelector = rawSelector => {
    const result = [];
    const selector = escapeIdentifiersInSelector(rawSelector.trim());
    const parts = splitWithEq(selector);
    const {
      length
    } = parts;
    let i = 0;
    while (i < length) {
      const sel = parts[i];
      const eq = parts[i + 1];
      if (eq) {
        result.push({
          sel,
          eq: Number(eq)
        });
      } else {
        result.push({
          sel
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
  const selectNodesWithEq = selector => {
    const doc = document;
    if (isNotEqSelector(selector)) {
      return selectNodes(selector, doc);
    }
    const parts = parseSelector(selector);
    const {
      length
    } = parts;
    let result = [];
    let context = doc;
    let i = 0;
    while (i < length) {
      const {
        sel,
        eq
      } = parts[i];
      const nodes = selectNodes(sel, context);
      const {
        length: nodesCount
      } = nodes;
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
  var getElementById = ((id, context = document) => {
    return context.getElementById(id);
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

  var setAttribute = ((element, name, value) => {
    element.setAttribute(name, value);
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

  var getAttribute = ((element, name) => {
    return element.getAttribute(name);
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

  var removeAttribute = ((element, name) => {
    element.removeAttribute(name);
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

  var setStyle = ((element, name, value, priority) => {
    let css;
    if (priority) {
      css = `${name}:${value} !${priority};`;
    } else {
      css = `${name}:${value};`;
    }
    element.style.cssText += `;${css}`;
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

  var getParent = (element => {
    return element.parentNode;
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

  var getNextSibling = (element => {
    return element.nextElementSibling;
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
  var insertAfter = ((container, element) => {
    if (!container) {
      return;
    }
    const parent = getParent(container);
    if (parent) {
      parent.insertBefore(element, getNextSibling(container));
    }
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
  var insertBefore = ((container, element) => {
    if (!container) {
      return;
    }
    const parent = getParent(container);
    if (parent) {
      parent.insertBefore(element, container);
    }
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
  var getChildren = (element => {
    const {
      children
    } = element;
    if (children) {
      return toArray(children);
    }
    return [];
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
  var getChildNodes = (element => {
    const {
      childNodes
    } = element;
    if (childNodes) {
      return toArray(childNodes);
    }
    return [];
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

  var getFirstChild = (element => {
    return element.firstElementChild;
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

  let nonce;

  /**
   * Returns the nonce if available.
   * @param {Node} [context=document] defaults to document
   * @returns {(String|undefined)} the nonce or undefined if not available
   */
  var getNonce = ((context = document) => {
    if (nonce === undefined) {
      const n = context.querySelector("[nonce]");
      // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
      //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946
      nonce = n && (n.nonce || n.getAttribute("nonce"));
    }
    return nonce;
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
  const PREHIDING_ID = "alloy-prehiding";
  const HIDING_STYLE_DEFINITION = "{ visibility: hidden }";

  // Using global is OK since we have a single DOM
  // so storing nodes even for multiple Alloy instances is fine
  const styleNodes = {};
  const hideElements = prehidingSelector => {
    // if we have different events with the same
    // prehiding selector we don't want to recreate
    // the style tag
    if (styleNodes[prehidingSelector]) {
      return;
    }
    const nonce = getNonce();
    const attrs = {
      ...(nonce && {
        nonce
      })
    };
    const props = {
      textContent: `${prehidingSelector} ${HIDING_STYLE_DEFINITION}`
    };
    const node = createNode(STYLE, attrs, props);
    appendNode(document.head, node);
    styleNodes[prehidingSelector] = node;
  };
  const showElements = prehidingSelector => {
    const node = styleNodes[prehidingSelector];
    if (node) {
      removeNode(node);
      delete styleNodes[prehidingSelector];
    }
  };
  const hideContainers = prehidingStyle => {
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
        nonce
      })
    };
    const props = {
      textContent: prehidingStyle
    };
    const styleNode = createNode(STYLE, attrs, props);
    appendNode(document.head, styleNode);
  };
  const showContainers = () => {
    // If containers prehiding style exists
    // we will remove it
    const node = getElementById(PREHIDING_ID);
    if (!node) {
      return;
    }
    removeNode(node);
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

  var setText = ((container, text) => {
    container.textContent = text;
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
  const isImage = element => element.tagName === IMG;
  const loadImage = url => {
    return createNode(IMG, {
      src: url
    });
  };
  const loadImages = fragment => {
    const images = selectNodes(IMG, fragment);
    images.forEach(image => {
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
  const isInlineStyleElement = element => is$1(element, STYLE) && !getAttribute(element, SRC);
  var addNonceToInlineStyleElements = (fragment => {
    const styleNodes = selectNodes(STYLE, fragment);
    const {
      length
    } = styleNodes;
    const nonce = getNonce();
    if (!nonce) {
      return;
    }
    /* eslint-disable no-continue */
    for (let i = 0; i < length; i += 1) {
      const element = styleNodes[i];
      if (!isInlineStyleElement(element)) {
        continue;
      }
      element.nonce = nonce;
    }
  });

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(function (value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function () {
        return value;
      });
    }, function (reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function () {
        // @ts-ignore
        return constructor.reject(reason);
      });
    });
  }

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;
  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }
  function noop() {}

  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  /**
   * @constructor
   * @param {Function} fn
   */
  function Promise$2(fn) {
    if (!(this instanceof Promise$2)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    /** @type {!number} */
    this._state = 0;
    /** @type {!boolean} */
    this._handled = false;
    /** @type {Promise|undefined} */
    this._value = undefined;
    /** @type {!Array<!Function>} */
    this._deferreds = [];
    doResolve(fn, this);
  }
  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise$2._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }
  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise$2) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }
  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }
  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise$2._immediateFn(function () {
        if (!self._handled) {
          Promise$2._unhandledRejectionFn(self._value);
        }
      });
    }
    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  /**
   * @constructor
   */
  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }
  Promise$2.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };
  Promise$2.prototype.then = function (onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);
    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };
  Promise$2.prototype['finally'] = finallyConstructor;
  Promise$2.all = function (arr) {
    return new Promise$2(function (resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }
      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;
      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }
      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };
  Promise$2.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise$2) {
      return value;
    }
    return new Promise$2(function (resolve) {
      resolve(value);
    });
  };
  Promise$2.reject = function (value) {
    return new Promise$2(function (resolve, reject) {
      reject(value);
    });
  };
  Promise$2.race = function (arr) {
    return new Promise$2(function (resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }
      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$2.resolve(arr[i]).then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise$2._immediateFn =
  // @ts-ignore
  typeof setImmediate === 'function' && function (fn) {
    // @ts-ignore
    setImmediate(fn);
  } || function (fn) {
    setTimeoutFunc(fn, 0);
  };
  Promise$2._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  var src = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Promise$2
  });

  var require$$0 = /*@__PURE__*/getAugmentedNamespace(src);

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

  // For building Turbine we are using Rollup. For running the turbine tests we are using
  // Karma + Webpack. You need to specify the default import when using promise-polyfill`
  // with Webpack 2+. We need `require('promise-polyfill').default` for running the tests
  // and `require('promise-polyfill')` for building Turbine.
  var reactorPromise = typeof window !== 'undefined' && window.Promise || typeof commonjsGlobal !== 'undefined' && commonjsGlobal.Promise || require$$0.default || require$$0;

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
  var Promise$1 = reactorPromise;
  var getPromise = function (url, script) {
    return new Promise$1(function (resolve, reject) {
      script.onload = function () {
        resolve(script);
      };
      script.onerror = function () {
        reject(new Error('Failed to load script ' + url));
      };
    });
  };
  var reactorLoadScript = function (url) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true;
    var promise = getPromise(url, script);
    document.getElementsByTagName('head')[0].appendChild(script);
    return promise;
  };
  var loadScript = /*@__PURE__*/getDefaultExportFromCjs(reactorLoadScript);

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
  const is = (element, tagName) => !!element && element.tagName === tagName;
  const isInlineScript = element => is(element, SCRIPT) && !getAttribute(element, SRC);
  const isRemoteScript = element => is(element, SCRIPT) && getAttribute(element, SRC);
  const getInlineScripts = fragment => {
    const scripts = selectNodes(SCRIPT, fragment);
    const result = [];
    const {
      length
    } = scripts;
    const nonce = getNonce();
    const attributes = {
      ...(nonce && {
        nonce
      })
    };

    /* eslint-disable no-continue */
    for (let i = 0; i < length; i += 1) {
      const element = scripts[i];
      if (!isInlineScript(element)) {
        continue;
      }
      const {
        textContent
      } = element;
      if (!textContent) {
        continue;
      }
      result.push(createNode(SCRIPT, attributes, {
        textContent
      }));
    }
    /* eslint-enable no-continue */

    return result;
  };
  const getRemoteScriptsUrls = fragment => {
    const scripts = selectNodes(SCRIPT, fragment);
    const result = [];
    const {
      length
    } = scripts;

    /* eslint-disable no-continue */
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
    /* eslint-enable no-continue */

    return result;
  };
  const executeInlineScripts = (parent, scripts) => {
    scripts.forEach(script => {
      parent.appendChild(script);
      parent.removeChild(script);
    });
  };
  const executeRemoteScripts = urls => {
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
  var appendHtml = ((container, html) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    loadImages(fragment);
    elements.forEach(element => {
      appendNode(container, element);
    });
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
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
  const clear = container => {
    // We want to remove ALL nodes, text, comments etc
    const childNodes = getChildNodes(container);
    childNodes.forEach(removeNode);
  };
  var setHtml = ((container, html) => {
    clear(container);
    appendHtml(container, html);
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
  var prependHtml = ((container, html) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    const {
      length
    } = elements;
    let i = length - 1;

    // We have to proactively load images to avoid flicker
    loadImages(fragment);

    // We are inserting elements in reverse order
    while (i >= 0) {
      const element = elements[i];
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
  var insertHtmlBefore = ((container, html) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    loadImages(fragment);
    elements.forEach(element => {
      insertBefore(container, element);
    });
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
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
  var replaceHtml = ((container, html) => {
    insertHtmlBefore(container, html);
    removeNode(container);
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
  var insertHtmlAfter = ((container, html) => {
    const fragment = createFragment(html);
    addNonceToInlineStyleElements(fragment);
    const elements = getChildNodes(fragment);
    const scripts = getInlineScripts(fragment);
    const scriptsUrls = getRemoteScriptsUrls(fragment);
    loadImages(fragment);
    elements.forEach(element => {
      insertAfter(container, element);
    });
    executeInlineScripts(container, scripts);
    return executeRemoteScripts(scriptsUrls);
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
  var setStyles = ((container, styles) => {
    const {
      priority,
      ...style
    } = styles;
    Object.keys(style).forEach(key => {
      setStyle(container, key, style[key], priority);
    });
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
  var setAttributes = ((container, attributes) => {
    Object.keys(attributes).forEach(key => {
      setAttribute(container, key, attributes[key]);
    });
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
  var swapImage = ((container, url) => {
    if (!isImage(container)) {
      return;
    }

    // Start downloading the image
    loadImage(url);

    // Remove "src" so there is no flicker
    removeAttribute(container, SRC);

    // Replace the image "src"
    setAttribute(container, SRC, url);
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
  var rearrangeChildren = ((container, {
    from,
    to
  }) => {
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
  const renderContent = (elements, content, renderFunc) => {
    const executions = elements.map(element => renderFunc(element, content));
    return Promise.all(executions);
  };
  const createAction = renderFunc => {
    return itemData => {
      const {
        selector,
        prehidingSelector,
        content
      } = itemData;
      hideElements(prehidingSelector);
      return awaitSelector(selector, selectNodesWithEq).then(elements => renderContent(elements, content, renderFunc)).then(() => {
        // if everything is OK, show elements
        showElements(prehidingSelector);
      }, error => {
        // in case of awaiting timing or error, we need to remove the style tag
        // hence showing the pre-hidden elements
        showElements(prehidingSelector);
        throw error;
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
  var initDomActionsModules = (() => {
    return {
      setHtml: createAction(setHtml),
      customCode: createAction(prependHtml),
      setText: createAction(setText),
      setAttribute: createAction(setAttributes),
      setImageSource: createAction(swapImage),
      setStyle: createAction(setStyles),
      move: createAction(setStyles),
      resize: createAction(setStyles),
      rearrange: createAction(rearrangeChildren),
      remove: createAction(removeNode),
      insertAfter: createAction(insertHtmlAfter),
      insertBefore: createAction(insertHtmlBefore),
      replaceHtml: createAction(replaceHtml),
      prependHtml: createAction(prependHtml),
      appendHtml: createAction(appendHtml)
    };
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
  var createCollect = (({
    eventManager,
    mergeDecisionsMeta
  }) => {
    // Called when a decision is auto-rendered for the __view__ scope or a SPA view(display and empty display notification)
    return ({
      decisionsMeta = [],
      propositionAction,
      documentMayUnload = false,
      eventType = DISPLAY,
      propositionEventTypes = [getPropositionEventType(eventType)],
      viewName
    }) => {
      const event = eventManager.createEvent();
      const data = {
        eventType
      };
      if (viewName) {
        data.web = {
          webPageDetails: {
            viewName
          }
        };
      }
      if (isNonEmptyArray(decisionsMeta)) {
        mergeDecisionsMeta(event, decisionsMeta, propositionEventTypes, propositionAction);
      }
      event.mergeXdm(data);
      if (documentMayUnload) {
        event.documentMayUnload();
      }
      return eventManager.sendEvent(event);
    };
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
  const DECISIONS_HANDLE = "personalization:decisions";
  var createFetchDataHandler = (({
    prehidingStyle,
    showContainers,
    hideContainers,
    mergeQuery,
    collect,
    processPropositions,
    createProposition,
    renderedPropositions
  }) => {
    return ({
      cacheUpdate,
      personalizationDetails,
      event,
      onResponse
    }) => {
      if (personalizationDetails.isRenderDecisions()) {
        hideContainers(prehidingStyle);
      } else {
        showContainers();
      }
      mergeQuery(event, personalizationDetails.createQueryDetails());
      let handleNotifications;
      if (personalizationDetails.isSendDisplayEvent()) {
        handleNotifications = decisionsMeta => {
          if (decisionsMeta.length > 0) {
            collect({
              decisionsMeta,
              viewName: personalizationDetails.getViewName()
            });
          }
        };
      } else {
        const renderedPropositionsDeferred = defer();
        renderedPropositions.concat(renderedPropositionsDeferred.promise);
        handleNotifications = renderedPropositionsDeferred.resolve;
      }
      onResponse(({
        response
      }) => {
        const handles = response.getPayloadsByType(DECISIONS_HANDLE);
        const propositions = handles.map(handle => createProposition(handle));
        const {
          page: pagePropositions = [],
          view: viewPropositions = [],
          proposition: nonRenderedPropositions = []
        } = groupBy(propositions, p => p.getScopeType());
        const currentViewPropositions = cacheUpdate.update(viewPropositions);
        let render;
        let returnedPropositions;
        let returnedDecisions;
        if (personalizationDetails.isRenderDecisions()) {
          ({
            render,
            returnedPropositions,
            returnedDecisions
          } = processPropositions([...pagePropositions, ...currentViewPropositions], nonRenderedPropositions));
          render().then(handleNotifications);

          // Render could take a long time especially if one of the renders
          // is waiting for html to appear on the page. We show the containers
          // immediately, and whatever renders quickly will not have flicker.
          showContainers();
        } else {
          ({
            returnedPropositions,
            returnedDecisions
          } = processPropositions([], [...pagePropositions, ...currentViewPropositions, ...nonRenderedPropositions]));
        }
        return {
          propositions: returnedPropositions,
          decisions: returnedDecisions
        };
      });
    };
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
  var matchesSelectorWithEq = ((selector, element) => {
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

  const VIEW_SCOPE_TYPE = "view";
  const PAGE_SCOPE_TYPE = "page";
  const PROPOSITION_SCOPE_TYPE = "proposition";

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
  const getMetasIfMatches = (clickedElement, selector, getClickMetasBySelector) => {
    const {
      documentElement
    } = document;
    let element = clickedElement;
    let i = 0;
    while (element && element !== documentElement) {
      if (matchesSelectorWithEq(selector, element)) {
        const matchedMetas = getClickMetasBySelector(selector);
        const returnValue = {
          metas: matchedMetas
        };
        const foundMetaWithLabel = matchedMetas.find(meta => meta.trackingLabel);
        if (foundMetaWithLabel) {
          returnValue.label = foundMetaWithLabel.trackingLabel;
          returnValue.weight = i;
        }
        const foundMetaWithScopeTypeView = matchedMetas.find(meta => meta.scopeType === VIEW_SCOPE_TYPE);
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
      metas: null
    };
  };
  const cleanMetas = metas => metas.map(meta => {
    const {
      trackingLabel,
      scopeType,
      ...rest
    } = meta;
    return rest;
  });
  const dedupMetas = metas => metas.filter((meta, index) => {
    const stringifiedMeta = JSON.stringify(meta);
    return index === metas.findIndex(innerMeta => JSON.stringify(innerMeta) === stringifiedMeta);
  });
  var collectClicks = ((clickedElement, selectors, getClickMetasBySelector) => {
    const result = [];
    let resultLabel = "";
    let resultLabelWeight = Number.MAX_SAFE_INTEGER;
    let resultViewName;
    let resultViewNameWeight = Number.MAX_SAFE_INTEGER;

    /* eslint-disable no-continue */
    for (let i = 0; i < selectors.length; i += 1) {
      const {
        metas,
        label,
        weight,
        viewName
      } = getMetasIfMatches(clickedElement, selectors[i], getClickMetasBySelector);
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
      decisionsMeta: dedupMetas(result),
      eventLabel: resultLabel,
      viewName: resultViewName
    };
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

  var isAuthoringModeEnabled = ((doc = document) => {
    return doc.location.href.indexOf("adobe_authoring_enabled") !== -1;
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

  /* eslint-disable no-underscore-dangle */
  const mergeDecisionsMeta = (event, decisionsMeta, propositionEventTypes, propositionAction) => {
    // Do not send a display notification with no decisions. Even empty view changes
    // should include a proposition.
    if (decisionsMeta.length === 0) {
      return;
    }
    const propositionEventType = {};
    propositionEventTypes.forEach(type => {
      propositionEventType[type] = EVENT_TYPE_TRUE;
    });
    const xdm = {
      _experience: {
        decisioning: {
          propositions: decisionsMeta,
          propositionEventType
        }
      }
    };
    if (propositionAction) {
      xdm._experience.decisioning.propositionAction = propositionAction;
    }
    event.mergeXdm(xdm);
  };
  const mergeQuery = (event, details) => {
    event.mergeQuery({
      personalization: {
        ...details
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
  var createOnClickHandler = (({
    mergeDecisionsMeta,
    collectClicks,
    getClickSelectors,
    getClickMetasBySelector
  }) => {
    // Called when an element qualifying for conversion within an offer is clicked.
    return ({
      event,
      clickedElement
    }) => {
      const selectors = getClickSelectors();
      if (isNonEmptyArray(selectors)) {
        const {
          decisionsMeta,
          eventLabel,
          viewName
        } = collectClicks(clickedElement, selectors, getClickMetasBySelector);
        if (isNonEmptyArray(decisionsMeta)) {
          const xdm = {
            eventType: INTERACT
          };
          if (viewName) {
            xdm.web = {
              webPageDetails: {
                viewName
              }
            };
          }
          event.mergeXdm(xdm);
          mergeDecisionsMeta(event, decisionsMeta, [PropositionEventType.INTERACT], eventLabel ? {
            label: eventLabel
          } : undefined);
        }
      }
    };
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
  var createViewCacheManager = (({
    createProposition
  }) => {
    let cacheUpdateCreatedAtLeastOnce = false;
    let viewStoragePromise = Promise.resolve({});
    const getViewPropositions = (viewStorage, viewName) => {
      const viewPropositions = viewStorage[viewName.toLowerCase()];
      if (viewPropositions && viewPropositions.length > 0) {
        return viewPropositions;
      }
      const emptyViewProposition = createProposition({
        scope: viewName,
        scopeDetails: {
          characteristics: {
            scopeType: VIEW_SCOPE_TYPE
          }
        },
        items: [{
          schema: DEFAULT_CONTENT_ITEM
        }]
      }, false);
      return [emptyViewProposition];
    };

    // This should be called before making the request to experience edge.
    const createCacheUpdate = viewName => {
      const updateCacheDeferred = defer();
      cacheUpdateCreatedAtLeastOnce = true;

      // Additional updates will merge the new view propositions with the old.
      // i.e. if there are new "cart" view propositions they will overwrite the
      // old "cart" view propositions, but if there are no new "cart" view
      // propositions the old "cart" view propositions will remain.
      viewStoragePromise = viewStoragePromise.then(oldViewStorage => {
        return updateCacheDeferred.promise.then(newViewStorage => {
          return assign({}, oldViewStorage, newViewStorage);
        }).catch(() => oldViewStorage);
      });
      return {
        update(viewPropositions) {
          const viewPropositionsWithScope = viewPropositions.filter(proposition => proposition.getScope());
          const newViewStorage = groupBy(viewPropositionsWithScope, proposition => proposition.getScope().toLowerCase());
          updateCacheDeferred.resolve(newViewStorage);
          if (viewName) {
            return getViewPropositions(newViewStorage, viewName);
          }
          return [];
        },
        cancel() {
          updateCacheDeferred.reject();
        }
      };
    };
    const getView = viewName => {
      return viewStoragePromise.then(viewStorage => getViewPropositions(viewStorage, viewName));
    };
    const isInitialized = () => {
      return cacheUpdateCreatedAtLeastOnce;
    };
    return {
      createCacheUpdate,
      getView,
      isInitialized
    };
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

  var createViewChangeHandler = (({
    processPropositions,
    viewCache
  }) => {
    return ({
      personalizationDetails,
      onResponse
    }) => {
      let returnedPropositions;
      let returnedDecisions;
      const viewName = personalizationDetails.getViewName();
      onResponse(() => {
        return {
          propositions: returnedPropositions,
          decisions: returnedDecisions
        };
      });
      return viewCache.getView(viewName).then(propositions => {
        let render;
        if (personalizationDetails.isRenderDecisions()) {
          ({
            render,
            returnedPropositions,
            returnedDecisions
          } = processPropositions(propositions));
          return render();
        }
        ({
          returnedPropositions,
          returnedDecisions
        } = processPropositions([], propositions));
        return [];
      });
    };
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

  const metasToArray = metas => {
    return Object.keys(metas).map(key => {
      return {
        id: key,
        ...metas[key]
      };
    });
  };
  var createClickStorage = (() => {
    const clickStorage = {};
    const storeClickMetrics = ({
      selector,
      meta: {
        id,
        scope,
        scopeDetails,
        trackingLabel,
        scopeType
      }
    }) => {
      if (!clickStorage[selector]) {
        clickStorage[selector] = {};
      }
      clickStorage[selector][id] = {
        scope,
        scopeDetails,
        trackingLabel,
        scopeType
      };
    };
    const getClickSelectors = () => {
      return Object.keys(clickStorage);
    };
    const getClickMetasBySelector = selector => {
      const metas = clickStorage[selector];
      if (!metas) {
        return {};
      }
      return metasToArray(clickStorage[selector]);
    };
    return {
      storeClickMetrics,
      getClickSelectors,
      getClickMetasBySelector
    };
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
  const SUPPORTED_SCHEMAS = [DOM_ACTION, HTML_CONTENT_ITEM, MESSAGE_IN_APP];
  var createApplyPropositions = (({
    processPropositions,
    createProposition,
    renderedPropositions,
    viewCache
  }) => {
    const filterItemsPredicate = item => SUPPORTED_SCHEMAS.indexOf(item.schema) > -1;
    const updatePropositionItems = ({
      items,
      metadataForScope
    }) => {
      return items.filter(filterItemsPredicate).map(item => {
        if (item.schema !== HTML_CONTENT_ITEM) {
          return {
            ...item
          };
        }
        if (isObject(metadataForScope)) {
          return {
            ...item,
            data: {
              ...item.data,
              selector: metadataForScope.selector,
              type: metadataForScope.actionType
            }
          };
        }
        return undefined;
      }).filter(item => item);
    };
    const filterPropositionsPredicate = proposition => {
      return !(proposition.scope === PAGE_WIDE_SCOPE && proposition.renderAttempted);
    };
    const preparePropositions = ({
      propositions,
      metadata
    }) => {
      return propositions.filter(filterPropositionsPredicate).map(proposition => {
        if (isNonEmptyArray(proposition.items)) {
          const {
            id,
            scope,
            scopeDetails
          } = proposition;
          return {
            id,
            scope,
            scopeDetails,
            items: updatePropositionItems({
              items: proposition.items,
              metadataForScope: metadata[proposition.scope]
            })
          };
        }
        return proposition;
      }).filter(proposition => isNonEmptyArray(proposition.items));
    };
    return ({
      propositions = [],
      metadata = {},
      viewName
    }) => {
      // We need to immediately call concat so that subsequent sendEvent
      // calls will wait for applyPropositions to complete before executing.
      const renderedPropositionsDeferred = defer();
      renderedPropositions.concat(renderedPropositionsDeferred.promise);
      const propositionsToExecute = preparePropositions({
        propositions,
        metadata
      }).map(proposition => createProposition(proposition));
      return Promise.resolve().then(() => {
        if (viewName) {
          return viewCache.getView(viewName);
        }
        return [];
      }).then(additionalPropositions => {
        const {
          render,
          returnedPropositions
        } = processPropositions([...propositionsToExecute, ...additionalPropositions]);
        render().then(renderedPropositionsDeferred.resolve);
        return {
          propositions: returnedPropositions
        };
      });
    };
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

  var createGetPageLocation = (({
    window
  }) => () => {
    return window.location;
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
  var createSetTargetMigration = (({
    targetMigrationEnabled
  }) => {
    if (targetMigrationEnabled) {
      return request => {
        request.getPayload().mergeMeta({
          target: {
            migration: true
          }
        });
      };
    }
    return noop$1;
  });

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
  const ACTION_CUSTOM_CODE = "customCode";
  const TARGET_BODY_SELECTOR = "BODY > *:eq(0)";
  var remapCustomCodeOffers = (action => {
    const {
      selector,
      type
    } = action;
    if (type !== ACTION_CUSTOM_CODE) {
      return action;
    }
    if (selector !== TARGET_BODY_SELECTOR) {
      return action;
    }
    return assign({}, action, {
      selector: "BODY"
    });
  });

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
  var isBlankString = (value => isString(value) ? !value.trim() : true);

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
  const APPEND_HTML = "appendHtml";
  const HEAD_TAGS_SELECTOR = "SCRIPT,LINK,STYLE";
  const filterHeadContent = content => {
    const container = createFragment(content);
    const headNodes = selectNodes(HEAD_TAGS_SELECTOR, container);
    return headNodes.map(node => node.outerHTML).join("");
  };
  var remapHeadOffers = (action => {
    const result = assign({}, action);
    const {
      content,
      selector
    } = result;
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
    result.type = APPEND_HTML;
    result.content = filterHeadContent(content);
    return result;
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
  var createPreprocess = (preprocessors => action => {
    if (!action) {
      return action;
    }
    return preprocessors.reduce((processed, fn) => assign(processed, fn(processed)), action);
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
  var injectCreateProposition = (({
    preprocess,
    isPageWideSurface
  }) => {
    const createItem = (item, proposition) => {
      const {
        schema,
        data,
        characteristics: {
          trackingLabel
        } = {}
      } = item;
      const processedData = preprocess(data);
      return {
        getSchema() {
          return schema;
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
        }
      };
    };
    return (payload, visibleInReturnedItems = true) => {
      const {
        id,
        scope,
        scopeDetails,
        items = []
      } = payload;
      const {
        characteristics: {
          scopeType
        } = {}
      } = scopeDetails || {};
      return {
        getScope() {
          if (!scope) {
            return scope;
          }
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
          return items.map(item => createItem(item, this));
        },
        getNotification() {
          return {
            id,
            scope,
            scopeDetails
          };
        },
        toJSON() {
          return payload;
        },
        addToReturnValues(propositions, decisions, includedItems, renderAttempted) {
          if (visibleInReturnedItems) {
            propositions.push({
              ...payload,
              items: includedItems.map(i => i.getOriginalItem()),
              renderAttempted
            });
            if (!renderAttempted) {
              decisions.push({
                ...payload,
                items: includedItems.map(i => i.getOriginalItem())
              });
            }
          }
        }
      };
    };
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
  var createAsyncArray = (() => {
    let latest = Promise.resolve([]);
    return {
      concat(promise) {
        latest = latest.then(existingPropositions => {
          return promise.then(newPropositions => {
            return existingPropositions.concat(newPropositions);
          }).catch(() => {
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
      }
    };
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
  var processDefaultContent = (() => {
    return {
      setRenderAttempted: true,
      includeInNotification: true
    };
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
  var createProcessDomAction = (({
    modules,
    logger,
    storeClickMetrics
  }) => item => {
    const {
      type,
      selector
    } = item.getData() || {};
    if (!type) {
      logger.warn("Invalid DOM action data: missing type.", item.getData());
      return {
        setRenderAttempted: false,
        includeInNotification: false
      };
    }
    if (type === "click") {
      if (!selector) {
        logger.warn("Invalid DOM action data: missing selector.", item.getData());
        return {
          setRenderAttempted: false,
          includeInNotification: false
        };
      }
      storeClickMetrics({
        selector,
        meta: {
          ...item.getProposition().getNotification(),
          trackingLabel: item.getTrackingLabel(),
          scopeType: item.getProposition().getScopeType()
        }
      });
      return {
        setRenderAttempted: true,
        includeInNotification: false
      };
    }
    if (!modules[type]) {
      logger.warn("Invalid DOM action data: unknown type.", item.getData());
      return {
        setRenderAttempted: false,
        includeInNotification: false
      };
    }
    return {
      render: () => modules[type](item.getData()),
      setRenderAttempted: true,
      includeInNotification: true
    };
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
  var createProcessHtmlContent = (({
    modules,
    logger
  }) => item => {
    const {
      type,
      selector
    } = item.getData() || {};
    if (!selector || !type) {
      return {
        setRenderAttempted: false,
        includeInNotification: false
      };
    }
    if (!modules[type]) {
      logger.warn("Invalid HTML content data", item.getData());
      return {
        setRenderAttempted: false,
        includeInNotification: false
      };
    }
    return {
      render: () => {
        modules[type](item.getData());
      },
      setRenderAttempted: true,
      includeInNotification: true
    };
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
  var createProcessRedirect = (({
    logger,
    executeRedirect,
    collect
  }) => item => {
    const {
      content
    } = item.getData() || {};
    if (!content) {
      logger.warn("Invalid Redirect data", item.getData());
      return {};
    }
    const render = () => {
      return collect({
        decisionsMeta: [item.getProposition().getNotification()],
        documentMayUnload: true
      }).then(() => {
        return executeRedirect(content);
        // Execute redirect will never resolve. If there are bottom of page events that are waiting
        // for display notifications from this request, they will never run because this promise will
        // not resolve. This is intentional because we don't want to run bottom of page events if
        // there is a redirect.
      });
    };

    return {
      render,
      setRenderAttempted: true,
      onlyRenderThis: true
    };
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

  var createProcessPropositions = (({
    schemaProcessors,
    logger
  }) => {
    const wrapRenderWithLogging = (render, item) => () => {
      return Promise.resolve().then(render).then(() => {
        if (logger.enabled) {
          logger.info(`Action ${item.toString()} executed.`);
        }
        return true;
      }).catch(error => {
        if (logger.enabled) {
          const {
            message,
            stack
          } = error;
          const warning = `Failed to execute action ${item.toString()}. ${message} ${stack}`;
          logger.warn(warning);
        }
        return false;
      });
    };
    const renderItems = (renderers, meta) => Promise.all(renderers.map(renderer => renderer())).then(successes => {
      // as long as at least one renderer succeeds, we want to add the notification
      // to the display notifications
      if (!successes.includes(true)) {
        return undefined;
      }
      return meta;
    });
    const processItem = item => {
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
      proposition
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
        ({
          render,
          setRenderAttempted,
          includeInNotification,
          onlyRenderThis
        } = processItem(item));
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
        const meta = atLeastOneWithNotification ? proposition.getNotification() : undefined;
        renderers.push(() => renderItems(itemRenderers, meta));
      } else if (atLeastOneWithNotification) {
        renderers.push(() => proposition.getNotification());
      }
      if (renderedItems.length > 0) {
        proposition.addToReturnValues(returnedPropositions, returnedDecisions, renderedItems, true);
      }
      if (nonRenderedItems.length > 0) {
        proposition.addToReturnValues(returnedPropositions, returnedDecisions, nonRenderedItems, false);
      }
      return {
        renderers,
        returnedPropositions,
        returnedDecisions,
        onlyRenderThis
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
          onlyRenderThis
        } = processItems({
          renderers,
          returnedPropositions,
          returnedDecisions,
          items,
          proposition
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
            p.addToReturnValues(returnedPropositions, returnedDecisions, p.getItems(), false);
          }
        });
      }
      nonRenderPropositions.forEach(p => {
        p.addToReturnValues(returnedPropositions, returnedDecisions, p.getItems(), false);
      });
      const render = () => {
        return Promise.all(renderers.map(renderer => renderer())).then(metas => metas.filter(meta => meta));
      };
      return {
        returnedPropositions,
        returnedDecisions,
        render
      };
    };
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

  var createOnDecisionHandler = (({
    processPropositions,
    createProposition,
    collect
  }) => {
    return ({
      viewName,
      renderDecisions,
      propositions
    }) => {
      if (!renderDecisions) {
        return Promise.resolve();
      }
      const propositionsToExecute = propositions.map(proposition => createProposition(proposition, true));
      const {
        render,
        returnedPropositions
      } = processPropositions(propositionsToExecute);
      render().then(decisionsMeta => {
        if (decisionsMeta.length > 0) {
          collect({
            decisionsMeta,
            viewName
          });
        }
      });
      return Promise.resolve({
        propositions: returnedPropositions
      });
    };
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
        logger.warn(`Invalid in-app message data: missing property '${prop}'.`, data);
        return false;
      }
    }
    const {
      content,
      contentType
    } = data;
    if (contentType === APPLICATION_JSON) {
      for (let i = 0; i < expectedContentProps.length; i += 1) {
        const prop = expectedContentProps[i];
        if (!Object.prototype.hasOwnProperty.call(content, prop)) {
          logger.warn(`Invalid in-app message data.content: missing property '${prop}'.`, data);
          return false;
        }
      }
    }
    return true;
  };
  var createProcessInAppMessage = (({
    modules,
    logger
  }) => {
    return item => {
      const data = item.getData();
      const meta = {
        ...item.getProposition().getNotification()
      };
      if (!data) {
        logger.warn("Invalid in-app message data: undefined.", data);
        return {};
      }
      const {
        type = DEFAULT_CONTENT
      } = data;
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
          return modules[type]({
            ...data,
            meta
          });
        },
        setRenderAttempted: true,
        includeInNotification: true
      };
    };
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
  const removeElementById = id => {
    const element = selectNodes(`#${id}`, document);
    if (element && element.length > 0) {
      removeNode(element[0]);
    }
  };
  const parseAnchor = anchor => {
    const nothing = {};
    if (!anchor || anchor.tagName.toLowerCase() !== "a") {
      return nothing;
    }
    const {
      href
    } = anchor;
    if (!href || !startsWith(href, "adbinapp://")) {
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
      link = decodeURIComponent(queryParams.link || "");
    }
    return {
      action,
      interaction,
      link,
      label,
      uuid
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

  var createRedirect = (window => url => {
    window.location.replace(url);
    // Return a promise that never resolves because redirects never complete
    // within the current page.
    return new Promise(() => undefined);
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
  const MESSAGING_CONTAINER_ID = "alloy-messaging-container";
  const OVERLAY_CONTAINER_ID = "alloy-overlay-container";
  const IFRAME_ID = "alloy-content-iframe";
  const dismissMessage = () => [MESSAGING_CONTAINER_ID, OVERLAY_CONTAINER_ID].forEach(removeElementById);
  const createIframeClickHandler = (interact, navigateToUrl = createRedirect(window)) => {
    return event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const {
        target
      } = event;
      const anchor = target.tagName.toLowerCase() === "a" ? target : target.closest("a");
      if (!anchor) {
        return;
      }
      const {
        action,
        interaction,
        link,
        label,
        uuid
      } = parseAnchor(anchor);
      interact(action, {
        label,
        id: interaction,
        uuid,
        link
      });
      if (action === "dismiss") {
        dismissMessage();
      }
      if (isNonEmptyString(link) && link.length > 0) {
        navigateToUrl(link);
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
      src: URL.createObjectURL(new Blob([htmlDocument.documentElement.outerHTML], {
        type: "text/html"
      })),
      id: IFRAME_ID
    });
    element.addEventListener("load", () => {
      const {
        addEventListener
      } = element.contentDocument || element.contentWindow.document;
      addEventListener("click", clickHandler);
    });
    return element;
  };
  const renderMessage = (iframe, webParameters, container, overlay) => {
    [{
      id: OVERLAY_CONTAINER_ID,
      element: overlay
    }, {
      id: MESSAGING_CONTAINER_ID,
      element: container
    }, {
      id: IFRAME_ID,
      element: iframe
    }].forEach(({
      id,
      element
    }) => {
      const {
        style = {},
        params = {}
      } = webParameters[id];
      assign(element.style, style);
      const {
        parentElement = "body",
        insertionMethod = "appendChild",
        enabled = true
      } = params;
      const parent = document.querySelector(parentElement);
      if (enabled && parent && typeof parent[insertionMethod] === "function") {
        parent[insertionMethod](element);
      }
    });
  };
  const buildStyleFromMobileParameters = mobileParameters => {
    const {
      verticalAlign,
      width,
      horizontalAlign,
      backdropColor,
      height,
      cornerRadius,
      horizontalInset,
      verticalInset,
      uiTakeover = false
    } = mobileParameters;
    const style = {
      width: width ? `${width}%` : "100%",
      backgroundColor: backdropColor || "rgba(0, 0, 0, 0.5)",
      borderRadius: cornerRadius ? `${cornerRadius}px` : "0px",
      border: "none",
      position: uiTakeover ? "fixed" : "relative",
      overflow: "hidden"
    };
    if (horizontalAlign === "left") {
      style.left = horizontalInset ? `${horizontalInset}%` : "0";
    } else if (horizontalAlign === "right") {
      style.right = horizontalInset ? `${horizontalInset}%` : "0";
    } else if (horizontalAlign === "center") {
      style.left = "50%";
      style.transform = "translateX(-50%)";
    }
    if (verticalAlign === "top") {
      style.top = verticalInset ? `${verticalInset}%` : "0";
    } else if (verticalAlign === "bottom") {
      style.position = "fixed";
      style.bottom = verticalInset ? `${verticalInset}%` : "0";
    } else if (verticalAlign === "center") {
      style.top = "50%";
      style.transform = `${horizontalAlign === "center" ? `${style.transform} ` : ""}translateY(-50%)`;
      style.display = "flex";
      style.alignItems = "center";
      style.justifyContent = "center";
    }
    if (height) {
      style.height = `${height}vh`;
    } else {
      style.height = "100%";
    }
    return style;
  };
  const mobileOverlay = mobileParameters => {
    const {
      backdropOpacity,
      backdropColor
    } = mobileParameters;
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
      backgroundColor: color
    };
    return style;
  };
  const REQUIRED_PARAMS = ["enabled", "parentElement", "insertionMethod"];
  const isValidWebParameters = webParameters => {
    if (!webParameters) {
      return false;
    }
    const ids = Object.keys(webParameters);
    if (!includes(ids, MESSAGING_CONTAINER_ID)) {
      return false;
    }
    if (!includes(ids, OVERLAY_CONTAINER_ID)) {
      return false;
    }
    const valuesArray = values(webParameters);
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
  const generateWebParameters = mobileParameters => {
    if (!mobileParameters) {
      return undefined;
    }
    const {
      uiTakeover = false
    } = mobileParameters;
    return {
      [IFRAME_ID]: {
        style: {
          border: "none",
          width: "100%",
          height: "100%"
        },
        params: {
          enabled: true,
          parentElement: "#alloy-messaging-container",
          insertionMethod: "appendChild"
        }
      },
      [MESSAGING_CONTAINER_ID]: {
        style: buildStyleFromMobileParameters(mobileParameters),
        params: {
          enabled: true,
          parentElement: "body",
          insertionMethod: "appendChild"
        }
      },
      [OVERLAY_CONTAINER_ID]: {
        style: mobileOverlay(mobileParameters),
        params: {
          enabled: uiTakeover === true,
          parentElement: "body",
          insertionMethod: "appendChild"
        }
      }
    };
  };
  const displayHTMLContentInIframe = (settings = {}, interact) => {
    dismissMessage();
    const {
      content,
      contentType,
      mobileParameters
    } = settings;
    let {
      webParameters
    } = settings;
    if (contentType !== TEXT_HTML) {
      return;
    }
    const container = createNode("div", {
      id: MESSAGING_CONTAINER_ID
    });
    const iframe = createIframe(content, createIframeClickHandler(interact));
    const overlay = createNode("div", {
      id: OVERLAY_CONTAINER_ID
    });
    if (!isValidWebParameters(webParameters)) {
      webParameters = generateWebParameters(mobileParameters);
    }
    if (!webParameters) {
      return;
    }
    renderMessage(iframe, webParameters, container, overlay);
  };
  var displayIframeContent = ((settings, collect) => {
    return new Promise(resolve => {
      const {
        meta
      } = settings;
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
          propositionEventTypes: Object.keys(propositionEventTypes)
        });
      });
      resolve({
        meta
      });
    });
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
  var initInAppMessageActionsModules = (collect => {
    return {
      defaultContent: settings => displayIframeContent(settings, collect)
    };
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
  const createPersonalization = ({
    config,
    logger,
    eventManager
  }) => {
    const {
      targetMigrationEnabled,
      prehidingStyle
    } = config;
    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta
    });
    const {
      getClickMetasBySelector,
      getClickSelectors,
      storeClickMetrics
    } = createClickStorage();
    const getPageLocation = createGetPageLocation({
      window
    });
    const domActionsModules = initDomActionsModules();
    const preprocess = createPreprocess([remapHeadOffers, remapCustomCodeOffers]);
    const createProposition = injectCreateProposition({
      preprocess,
      isPageWideSurface
    });
    const viewCache = createViewCacheManager({
      createProposition
    });
    const executeRedirect = createRedirect(window);
    const schemaProcessors = {
      [DEFAULT_CONTENT_ITEM]: processDefaultContent,
      [DOM_ACTION]: createProcessDomAction({
        modules: domActionsModules,
        logger,
        storeClickMetrics
      }),
      [HTML_CONTENT_ITEM]: createProcessHtmlContent({
        modules: domActionsModules,
        logger
      }),
      [REDIRECT_ITEM]: createProcessRedirect({
        logger,
        executeRedirect,
        collect
      }),
      [MESSAGE_IN_APP]: createProcessInAppMessage({
        modules: initInAppMessageActionsModules(collect),
        logger
      })
    };
    const processPropositions = createProcessPropositions({
      schemaProcessors,
      logger
    });
    const renderedPropositions = createAsyncArray();
    const fetchDataHandler = createFetchDataHandler({
      prehidingStyle,
      showContainers,
      hideContainers,
      mergeQuery,
      collect,
      processPropositions,
      createProposition,
      renderedPropositions
    });
    const onClickHandler = createOnClickHandler({
      mergeDecisionsMeta,
      collectClicks,
      getClickSelectors,
      getClickMetasBySelector
    });
    const viewChangeHandler = createViewChangeHandler({
      processPropositions,
      viewCache
    });
    const applyPropositions = createApplyPropositions({
      processPropositions,
      createProposition,
      renderedPropositions,
      viewCache
    });
    const setTargetMigration = createSetTargetMigration({
      targetMigrationEnabled
    });
    const onDecisionHandler = createOnDecisionHandler({
      processPropositions,
      createProposition,
      collect
    });
    return createComponent$3({
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
      onDecisionHandler
    });
  };
  createPersonalization.namespace = "Personalization";
  createPersonalization.configValidators = boundObjectOf({
    prehidingStyle: boundString().nonEmpty(),
    targetMigrationEnabled: boundBoolean().default(false)
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
  var injectWeb = (window => {
    return xdm => {
      const web = {
        webPageDetails: {
          URL: window.location.href || window.location
        },
        webReferrer: {
          URL: window.document.referrer
        }
      };
      deepAssign(xdm, {
        web
      });
    };
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
  const getScreenOrientationViaProperty = window => {
    const {
      screen: {
        orientation
      }
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
  var injectDevice = (window => {
    return xdm => {
      const {
        screen: {
          width,
          height
        }
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
      const orientation = getScreenOrientationViaProperty(window) || getScreenOrientationViaMediaQuery(window);
      if (orientation) {
        device.screenOrientation = orientation;
      }
      if (Object.keys(device).length > 0) {
        deepAssign(xdm, {
          device
        });
      }
    };
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
  var injectEnvironment = (window => {
    return xdm => {
      const {
        document: {
          documentElement: {
            clientWidth,
            clientHeight
          } = {}
        }
      } = window;
      const environment = {
        type: "browser"
      };
      const viewportWidth = toInteger(clientWidth);
      if (viewportWidth >= 0) {
        environment.browserDetails = {
          viewportWidth
        };
      }
      const viewportHeight = toInteger(clientHeight);
      if (viewportHeight >= 0) {
        environment.browserDetails = environment.browserDetails || {};
        environment.browserDetails.viewportHeight = viewportHeight;
      }
      deepAssign(xdm, {
        environment
      });
    };
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
  var injectPlaceContext = (dateProvider => {
    return xdm => {
      const date = dateProvider();
      const placeContext = {};
      const localTimezoneOffset = toInteger(date.getTimezoneOffset());
      if (localTimezoneOffset !== undefined) {
        placeContext.localTimezoneOffset = localTimezoneOffset;
      }
      // make sure the timezone offset only uses two digits
      if (localTimezoneOffset === undefined || Math.abs(localTimezoneOffset) < 6000) {
        placeContext.localTime = toISOStringLocal(date);
      }
      deepAssign(xdm, {
        placeContext
      });
    };
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
  var injectTimestamp = (dateProvider => {
    return xdm => {
      const timestamp = dateProvider().toISOString();
      deepAssign(xdm, {
        timestamp
      });
    };
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

  var libraryVersion = "__VERSION__";

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
  var implementationDetails = (xdm => {
    const implementationDetails = {
      name: libraryName,
      version: libraryVersion,
      environment: "browser"
    };
    deepAssign(xdm, {
      implementationDetails
    });
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
  var createComponent$2 = ((config, logger, optionalContexts, requiredContexts) => {
    const configuredContexts = config.context;
    const contexts = flatMap(configuredContexts, (context, i) => {
      if (optionalContexts[context]) {
        return [optionalContexts[context]];
      }
      logger.warn(`Invalid context[${i}]: '${context}' is not available.`);
      return [];
    }).concat(requiredContexts);
    return {
      namespace: "Context",
      lifecycle: {
        onBeforeEvent({
          event
        }) {
          const xdm = {};
          return Promise.all(contexts.map(context => Promise.resolve(context(xdm, logger)))).then(() => event.mergeXdm(xdm));
        }
      }
    };
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

  var highEntropyUserAgentHints$1 = [["architecture", "string"], ["bitness", "string"], ["model", "string"], ["platformVersion", "string"], ["wow64", "boolean"]];

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
  const browserSupportsUserAgentClientHints = navigator => {
    return typeof navigator.userAgentData !== "undefined";
  };
  var injectHighEntropyUserAgentHints = (navigator => {
    if (!browserSupportsUserAgentClientHints(navigator)) {
      return noop$1;
    }
    return (xdm, logger) => {
      try {
        return navigator.userAgentData.getHighEntropyValues(highEntropyUserAgentHints$1.map(hint => hint[0])).then(hints => {
          const userAgentClientHints = {};
          highEntropyUserAgentHints$1.forEach(([hintName, hintType]) => {
            if (Object.prototype.hasOwnProperty.call(hints, hintName) && /* eslint-disable-next-line valid-typeof */
            typeof hints[hintName] === hintType) {
              userAgentClientHints[hintName] = hints[hintName];
            }
          });
          deepAssign(xdm, {
            environment: {
              browserDetails: {
                userAgentClientHints
              }
            }
          });
        });
      } catch (error) {
        logger.warn(`Unable to collect user-agent client hints. ${error.message}`);
        return noop$1;
      }
    };
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
    placeContext
  };
  const defaultDisabledContexts = {
    highEntropyUserAgentHints
  };
  const optionalContexts = {
    ...defaultEnabledContexts,
    ...defaultDisabledContexts
  };
  const requiredContexts = [timestamp, implementationDetails];
  const createContext = ({
    config,
    logger
  }) => {
    return createComponent$2(config, logger, optionalContexts, requiredContexts);
  };
  createContext.namespace = "Context";
  createContext.configValidators = boundObjectOf({
    context: boundArrayOf(boundString()).default(Object.keys(defaultEnabledContexts))
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
  var createComponent$1 = (({
    storedConsent,
    taskQueue,
    defaultConsent,
    consent,
    sendSetConsentRequest,
    validateSetConsentOptions,
    consentHashStore,
    doesIdentityCookieExist
  }) => {
    const defaultConsentByPurpose = {
      [GENERAL]: defaultConsent
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
            edgeConfigOverrides
          }) => {
            consent.suspend();
            const consentHashes = consentHashStore.lookup(consentOptions);
            return taskQueue.addTask(() => {
              if (consentHashes.isNew()) {
                return sendSetConsentRequest({
                  consentOptions,
                  identityMap,
                  edgeConfigOverrides
                });
              }
              return Promise.resolve();
            }).then(() => consentHashes.save()).finally(readCookieIfQueueEmpty);
          }
        }
      },
      lifecycle: {
        // Read the cookie here too because the consent cookie may change on any request
        onResponse: readCookieIfQueueEmpty,
        // Even when we get a failure HTTP status code, the consent cookie can
        // still get updated. This could happen, for example, if the user is
        // opted out in AudienceManager, but no consent cookie exists on the
        // client. The request will be sent and the server will respond with a
        // 403 Forbidden and a consent cookie.
        onRequestFailure: readCookieIfQueueEmpty
      }
    };
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

  // serialize an object with a consistent ordering
  const serialize = obj => {
    if (Array.isArray(obj)) {
      return obj.map(i => serialize(i));
    }
    if (typeof obj === "object" && obj !== null) {
      return Object.keys(obj).sort().reduce((memo, key) => {
        memo[key] = serialize(obj[key]);
        return memo;
      }, {});
    }
    return obj;
  };
  var computeConsentHash = (obj => {
    return crc32(JSON.stringify(serialize(obj)));
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
  const getKey = ({
    standard,
    version
  }) => {
    return `${standard}.${version}`;
  };
  var createConsentHashStore = (({
    storage
  }) => {
    return {
      clear() {
        storage.clear();
      },
      lookup(consentObjects) {
        const currentHashes = {};
        const getCurrentHash = consentObject => {
          const key = getKey(consentObject);
          const {
            standard,
            version,
            ...rest
          } = consentObject;
          if (!currentHashes[key]) {
            currentHashes[key] = computeConsentHash(rest).toString();
          }
          return currentHashes[key];
        };
        return {
          isNew() {
            return consentObjects.some(consentObject => {
              const key = getKey(consentObject);
              const previousHash = storage.getItem(key);
              return previousHash === null || previousHash !== getCurrentHash(consentObject);
            });
          },
          save() {
            consentObjects.forEach(consentObject => {
              const key = getKey(consentObject);
              storage.setItem(key, getCurrentHash(consentObject));
            });
          }
        };
      }
    };
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
  var createConsentRequestPayload = (() => {
    const content = {};
    const payload = createRequestPayload({
      content,
      addIdentity: (namespaceCode, identity) => {
        content.identityMap = content.identityMap || {};
        content.identityMap[namespaceCode] = content.identityMap[namespaceCode] || [];
        content.identityMap[namespaceCode].push(identity);
      },
      hasIdentity: namespaceCode => {
        return (content.identityMap && content.identityMap[namespaceCode]) !== undefined;
      }
    });
    payload.setConsent = consent => {
      content.consent = consent;
    };
    return payload;
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
  var createConsentRequest = (({
    payload,
    datastreamIdOverride
  }) => {
    return createRequest({
      payload,
      datastreamIdOverride,
      getAction() {
        return "privacy/set-consent";
      },
      getUseSendBeacon() {
        return false;
      }
    });
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
  var createStoredConsent = (({
    parseConsentCookie,
    orgId,
    cookieJar
  }) => {
    const consentCookieName = getNamespacedCookieName(orgId, CONSENT);
    return {
      read() {
        const cookieValue = cookieJar.get(consentCookieName);
        return cookieValue ? parseConsentCookie(cookieValue) : {};
      },
      clear() {
        cookieJar.remove(consentCookieName);
      }
    };
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
  var injectSendSetConsentRequest = (({
    createConsentRequestPayload,
    createConsentRequest,
    sendEdgeNetworkRequest,
    edgeConfigOverrides: globalConfigOverrides
  }) => ({
    consentOptions,
    identityMap,
    edgeConfigOverrides: localConfigOverrides
  }) => {
    const requestParams = createRequestParams({
      payload: createConsentRequestPayload(),
      globalConfigOverrides,
      localConfigOverrides
    });
    requestParams.payload.setConsent(consentOptions);
    if (isObject(identityMap)) {
      Object.keys(identityMap).forEach(key => {
        identityMap[key].forEach(identity => {
          requestParams.payload.addIdentity(key, identity);
        });
      });
    }
    const request = createConsentRequest(requestParams);
    return sendEdgeNetworkRequest({
      request
    }).then(() => {
      // Don't let response data disseminate beyond this
      // point unless necessary.
    });
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

  /**
   * Parses a consent cookie.
   * @param {string} cookieValue Must be in the format a=b;c=d
   * @returns {Object} An object where the keys are purpose names and the values
   * are the consent status for the purpose.
   */
  var parseConsentCookie = (cookieValue => {
    const categoryPairs = cookieValue.split(";");
    return categoryPairs.reduce((consentByPurpose, categoryPair) => {
      const [name, value] = categoryPair.split("=");
      consentByPurpose[name] = value;
      return consentByPurpose;
    }, {});
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
  var validateSetConsentOptions = boundObjectOf({
    consent: boundArrayOf(boundAnything()).required().nonEmpty(),
    identityMap: validateIdentityMap,
    edgeConfigOverrides: validateConfigOverride
  }).noUnknownFields().required();

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
  const createPrivacy = ({
    config,
    consent,
    sendEdgeNetworkRequest,
    createNamespacedStorage
  }) => {
    const {
      orgId,
      defaultConsent
    } = config;
    const storedConsent = createStoredConsent({
      parseConsentCookie,
      orgId,
      cookieJar
    });
    const taskQueue = createTaskQueue();
    const sendSetConsentRequest = injectSendSetConsentRequest({
      createConsentRequestPayload,
      createConsentRequest,
      sendEdgeNetworkRequest,
      edgeConfigOverrides: config.edgeConfigOverrides
    });
    const storage = createNamespacedStorage(`${sanitizeOrgIdForCookieName(orgId)}.consentHashes.`);
    const consentHashStore = createConsentHashStore({
      storage: storage.persistent
    });
    const doesIdentityCookieExist = injectDoesIdentityCookieExist({
      orgId
    });
    return createComponent$1({
      storedConsent,
      taskQueue,
      defaultConsent,
      consent,
      sendSetConsentRequest,
      validateSetConsentOptions,
      consentHashStore,
      doesIdentityCookieExist
    });
  };
  createPrivacy.namespace = "Privacy";

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
  var createEventMergeId = (() => {
    return {
      eventMergeId: uuid()
    };
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

  var createComponent = (({
    createEventMergeId
  }) => {
    return {
      commands: {
        createEventMergeId: {
          run: createEventMergeId
        }
      }
    };
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
  const createEventMerge = () => {
    return createComponent({
      createEventMergeId
    });
  };
  createEventMerge.namespace = "EventMerge";

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
  const prepareLibraryInfo = ({
    config,
    componentRegistry
  }) => {
    const allCommands = [...componentRegistry.getCommandNames(), CONFIGURE, SET_DEBUG].sort();
    const resultConfig = {
      ...config
    };
    Object.keys(config).forEach(key => {
      const value = config[key];
      if (typeof value !== "function") {
        return;
      }
      resultConfig[key] = value.toString();
    });
    return {
      version: libraryVersion,
      configs: resultConfig,
      commands: allCommands
    };
  };
  const createLibraryInfo = ({
    config,
    componentRegistry
  }) => {
    const libraryInfo = prepareLibraryInfo({
      config,
      componentRegistry
    });
    return {
      commands: {
        getLibraryInfo: {
          run: () => {
            return {
              libraryInfo
            };
          }
        }
      }
    };
  };
  createLibraryInfo.namespace = "LibraryInfo";

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

  var processResponse = (({
    response
  }) => {
    return {
      inferences: response.getPayloadsByType("rtml:inferences")
    };
  });

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
  const createMachineLearning = () => {
    return {
      lifecycle: {
        onResponse: processResponse
      },
      commands: {}
    };
  };
  createMachineLearning.namespace = "MachineLearning";

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

  // TODO: Register the Components here statically for now. They might be registered differently.
  // TODO: Figure out how sub-components will be made available/registered
  var componentCreators = [createDataCollector, createActivityCollector, createIdentity, createAudiences, createPersonalization, createContext, createPrivacy, createEventMerge, createLibraryInfo, createMachineLearning].filter(module => typeof module !== "undefined");

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
  const transformOptions = ({
    combinedConfigValidator,
    options,
    logger
  }) => {
    try {
      const validator = combinedConfigValidator.noUnknownFields().required();
      return validator.call({
        logger
      }, options);
    } catch (e) {
      throw new Error(`Resolve these configuration problems:\n\t - ${e.message.split("\n").join("\n\t - ")}\nFor configuration documentation see: ${CONFIG_DOC_URI}`);
    }
  };
  const buildAllOnInstanceConfiguredExtraParams = (config, logger, componentCreators) => {
    return componentCreators.reduce((memo, {
      buildOnInstanceConfiguredExtraParams
    }) => {
      if (buildOnInstanceConfiguredExtraParams) {
        assign(memo, buildOnInstanceConfiguredExtraParams({
          config,
          logger
        }));
      }
      return memo;
    }, {});
  };
  const wrapLoggerInQueue = logger => {
    const queue = [];
    const queuedLogger = {
      get enabled() {
        return logger.enabled;
      },
      flush() {
        queue.forEach(({
          method,
          args
        }) => logger[method](...args));
      }
    };
    Object.keys(logger).filter(key => typeof logger[key] === "function").forEach(method => {
      queuedLogger[method] = (...args) => {
        queue.push({
          method,
          args
        });
      };
    });
    return queuedLogger;
  };
  var buildAndValidateConfig = (({
    options,
    componentCreators,
    coreConfigValidators,
    createConfig,
    logger,
    setDebugEnabled
  }) => {
    // We wrap the logger in a queue in case debugEnabled is set in the config
    // but we need to log something before the config is created.
    const queuedLogger = wrapLoggerInQueue(logger);
    const combinedConfigValidator = componentCreators.map(({
      configValidators
    }) => configValidators).filter(configValidators => configValidators).reduce((validator, configValidators) => validator.concat(configValidators), coreConfigValidators);
    const config = createConfig(transformOptions({
      combinedConfigValidator,
      options,
      logger: queuedLogger
    }));
    setDebugEnabled(config.debugEnabled, {
      fromConfig: true
    });
    queuedLogger.flush();
    // eslint-disable-next-line no-underscore-dangle
    const extraParams = buildAllOnInstanceConfiguredExtraParams(config, logger, componentCreators);
    logger.logOnInstanceConfigured({
      ...extraParams,
      config
    });
    return config;
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
  var initializeComponents = (({
    componentCreators,
    lifecycle,
    componentRegistry,
    getImmediatelyAvailableTools
  }) => {
    componentCreators.forEach(createComponent => {
      const {
        namespace
      } = createComponent;
      // TO-DOCUMENT: Helpers that we inject into factories.
      const tools = getImmediatelyAvailableTools(namespace);
      let component;
      try {
        component = createComponent(tools);
      } catch (error) {
        throw stackError({
          error,
          message: `[${namespace}] An error occurred during component creation.`
        });
      }
      componentRegistry.register(namespace, component);
    });
    return lifecycle.onComponentsRegistered({
      lifecycle
    }).then(() => componentRegistry);
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
  const createConfig = options => {
    return assign({}, options);
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
  var createCoreConfigs = (() => boundObjectOf({
    debugEnabled: boundBoolean().default(false),
    defaultConsent: boundEnumOf(IN, OUT, PENDING).default(IN),
    datastreamId: boundString().unique().required(),
    edgeDomain: boundString().domain().default(EDGE),
    edgeBasePath: boundString().nonEmpty().default(EDGE_BASE_PATH),
    orgId: boundString().unique().required(),
    personalizationStorageEnabled: boundBoolean().default(true),
    onBeforeEventSend: boundCallback().default(noop$1),
    edgeConfigOverrides: validateConfigOverride
  }).deprecated("edgeConfigId", boundString().unique(), "datastreamId"));

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
  var injectHandleError = (({
    errorPrefix,
    logger
  }) => (error, operation) => {
    const err = toError(error);

    // In the case of declined consent, we've opted to not reject the promise
    // returned to the customer, but instead resolve the promise with an
    // empty result object.
    if (err.code === DECLINED_CONSENT_ERROR_CODE) {
      logger.warn(`The ${operation} could not fully complete. ${err.message}`);
      return {};
    }
    updateErrorMessage({
      error: err,
      message: `${errorPrefix} ${err.message}`
    });
    throw err;
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

  var injectSendFetchRequest = (({
    fetch
  }) => {
    return (url, body) => {
      return fetch(url, {
        method: "POST",
        cache: "no-cache",
        credentials: "include",
        // To set the cookie header in the request.
        headers: {
          "Content-Type": "text/plain; charset=UTF-8"
        },
        referrerPolicy: "no-referrer-when-downgrade",
        body
      }).then(response => {
        return response.text().then(responseBody => ({
          statusCode: response.status,
          // We expose headers through a function instead of creating an object
          // with all the headers up front largely because the native
          // request.getResponseHeader method is case-insensitive but also because it prevents
          // us from having to add header parsing logic when using XHR to make requests.
          getHeader(name) {
            return response.headers.get(name);
          },
          body: responseBody
        }));
      });
    };
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

  var injectSendXhrRequest = (({
    XMLHttpRequest
  }) => {
    return (url, body) => {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.onreadystatechange = () => {
          if (request.readyState === 4) {
            if (request.status === 0) {
              reject(new Error("Request aborted."));
            } else {
              resolve({
                statusCode: request.status,
                // We expose headers through a function instead of creating an object
                // with all the headers up front because:
                // 1. It avoids having to add header parsing code to get all headers.
                // 2. The native request.getResponseHeader method is case-insensitive.
                getHeader(name) {
                  return request.getResponseHeader(name);
                },
                body: request.responseText
              });
            }
          }
        };
        request.onloadstart = () => {
          request.responseType = "text";
        };
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
        request.withCredentials = true;
        request.onerror = reject;
        request.onabort = reject;
        request.send(body);
      });
    };
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

  var injectSendBeaconRequest = (({
    sendBeacon,
    sendFetchRequest,
    logger
  }) => {
    return (url, body) => {
      const blob = new Blob([body], {
        type: "text/plain; charset=UTF-8"
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
        body: ""
      });
    };
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
  var createLogger = (({
    getDebugEnabled,
    console,
    getMonitors,
    context
  }) => {
    let prefix = `[${context.instanceName}]`;
    if (context.componentName) {
      prefix += ` [${context.componentName}]`;
    }
    const notifyMonitors = (method, data) => {
      const monitors = getMonitors();
      if (monitors.length > 0) {
        const dataWithContext = assign({}, context, data);
        monitors.forEach(monitor => {
          if (monitor[method]) {
            monitor[method](dataWithContext);
          }
        });
      }
    };
    const log = (level, ...rest) => {
      notifyMonitors("onBeforeLog", {
        level,
        arguments: rest
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
        log("info", "Instance configured. Computed configuration:", data.config);
      },
      logOnBeforeCommand(data) {
        notifyMonitors("onBeforeCommand", data);
        log("info", `Executing ${data.commandName} command. Options:`, data.options);
      },
      logOnCommandResolved(data) {
        notifyMonitors("onCommandResolved", data);
        log("info", `${data.commandName} command resolved. Result:`, data.result);
      },
      logOnCommandRejected(data) {
        notifyMonitors("onCommandRejected", data);
        log("error", `${data.commandName} command was rejected. Error:`, data.error);
      },
      logOnBeforeNetworkRequest(data) {
        notifyMonitors("onBeforeNetworkRequest", data);
        log("info", `Request ${data.requestId}: Sending request.`, data.payload);
      },
      logOnNetworkResponse(data) {
        notifyMonitors("onNetworkResponse", data);
        const messagesSuffix = data.parsedBody || data.body ? `response body:` : `no response body.`;
        log("info", `Request ${data.requestId}: Received response with status code ${data.statusCode} and ${messagesSuffix}`, data.parsedBody || data.body);
      },
      logOnNetworkError(data) {
        notifyMonitors("onNetworkError", data);
        log("error", `Request ${data.requestId}: Network request failed.`, data.error);
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
      error: log.bind(null, "error")
    };
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
  const EVENT_CANCELLATION_MESSAGE = "Event was canceled because the onBeforeEventSend callback returned false.";
  var createEventManager = (({
    config,
    logger,
    lifecycle,
    consent,
    createEvent,
    createDataCollectionRequestPayload,
    createDataCollectionRequest,
    sendEdgeNetworkRequest,
    applyResponse
  }) => {
    const {
      onBeforeEventSend,
      edgeConfigOverrides: globalConfigOverrides
    } = config;
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
        const {
          edgeConfigOverrides: localConfigOverrides,
          ...otherOptions
        } = options;
        const requestParams = createRequestParams({
          payload: createDataCollectionRequestPayload(),
          localConfigOverrides,
          globalConfigOverrides
        });
        const request = createDataCollectionRequest(requestParams);
        const onResponseCallbackAggregator = createCallbackAggregator();
        const onRequestFailureCallbackAggregator = createCallbackAggregator();
        return lifecycle.onBeforeEvent({
          ...otherOptions,
          event,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: onRequestFailureCallbackAggregator.add
        }).then(() => {
          requestParams.payload.addEvent(event);
          return consent.awaitConsent();
        }).then(() => {
          try {
            // NOTE: this calls onBeforeEventSend callback (if configured)
            event.finalize(onBeforeEventSend);
          } catch (error) {
            const throwError = () => {
              throw error;
            };
            onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
            return onRequestFailureCallbackAggregator.call({
              error
            }).then(throwError, throwError);
          }

          // if the callback returns false, the event should not be sent
          if (!event.shouldSend()) {
            onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
            logger.info(EVENT_CANCELLATION_MESSAGE);
            const error = new Error(EVENT_CANCELLATION_MESSAGE);
            return onRequestFailureCallbackAggregator.call({
              error
            }).then(() => {
              // Ensure the promise gets resolved with undefined instead
              // of an array of return values from the callbacks.
            });
          }
          return sendEdgeNetworkRequest({
            request,
            runOnResponseCallbacks: onResponseCallbackAggregator.call,
            runOnRequestFailureCallbacks: onRequestFailureCallbackAggregator.call
          });
        });
      },
      applyResponse(event, options = {}) {
        const {
          renderDecisions = false,
          decisionContext = {},
          responseHeaders = {},
          responseBody = {
            handle: []
          },
          personalization
        } = options;
        const payload = createDataCollectionRequestPayload();
        const request = createDataCollectionRequest({
          payload
        });
        const onResponseCallbackAggregator = createCallbackAggregator();
        return lifecycle.onBeforeEvent({
          event,
          renderDecisions,
          decisionContext,
          decisionScopes: [PAGE_WIDE_SCOPE],
          personalization,
          onResponse: onResponseCallbackAggregator.add,
          onRequestFailure: noop$1
        }).then(() => {
          payload.addEvent(event);
          return applyResponse({
            request,
            responseHeaders,
            responseBody,
            runOnResponseCallbacks: onResponseCallbackAggregator.call
          });
        });
      }
    };
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
  const STATE_STORE_HANDLE_TYPE = "state:store";
  var createCookieTransfer = (({
    cookieJar,
    shouldTransferCookie,
    apexDomain,
    dateProvider
  }) => {
    return {
      /**
       * When sending to a third-party endpoint, the endpoint won't be able to
       * access first-party cookies, therefore we transfer cookies into
       * the request body so they can be read by the server.
       */
      cookiesToPayload(payload, endpointDomain) {
        const isEndpointFirstParty = endsWith(endpointDomain, apexDomain);
        const state = {
          domain: apexDomain,
          cookiesEnabled: true
        };

        // If the endpoint is first-party, there's no need to transfer cookies
        // to the payload since they'll be automatically passed through cookie
        // headers.
        if (!isEndpointFirstParty) {
          const cookies = cookieJar.get();
          const entries = Object.keys(cookies).filter(shouldTransferCookie).map(qualifyingCookieName => {
            return {
              key: qualifyingCookieName,
              value: cookies[qualifyingCookieName]
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
        response.getPayloadsByType(STATE_STORE_HANDLE_TYPE).forEach(stateItem => {
          const options = {
            domain: apexDomain
          };
          const sameSite = stateItem.attrs && stateItem.attrs.SameSite && stateItem.attrs.SameSite.toLowerCase();
          if (stateItem.maxAge !== undefined) {
            // cookieJar expects "expires" as a date object
            options.expires = new Date(dateProvider().getTime() + stateItem.maxAge * 1000);
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
      }
    };
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
  var injectShouldTransferCookie = (({
    orgId,
    targetMigrationEnabled
  }) => name => {
    // We have a contract with the server that we will pass
    // all cookies whose names are namespaced according to the
    // logic in isNamespacedCookieName as well as any legacy
    // cookie names (so that the server can handle migrating
    // identities on websites previously using Visitor.js)
    return isNamespacedCookieName(orgId, name) || name === AT_QA_MODE || targetMigrationEnabled && name === MBOX;
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
  var apiVersion = "v1";

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
  var mergeLifecycleResponses = (returnValues => {
    // Merges all returned objects from all `onResponse` callbacks into
    // a single object that can later be returned to the customer.
    const lifecycleOnResponseReturnValues = returnValues.shift() || [];
    const consumerOnResponseReturnValues = returnValues.shift() || [];
    const lifecycleOnBeforeRequestReturnValues = returnValues;
    return assign({}, ...lifecycleOnResponseReturnValues, ...consumerOnResponseReturnValues, ...lifecycleOnBeforeRequestReturnValues);
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
  var handleRequestFailure = (onRequestFailureCallbackAggregator => {
    return error => {
      // Regardless of whether the network call failed, an unexpected status
      // code was returned, or the response body was malformed, we want to call
      // the onRequestFailure callbacks, but still throw the exception.
      const throwError = () => {
        throw error;
      };
      return onRequestFailureCallbackAggregator.call({
        error
      }).then(throwError, throwError);
    };
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
  var injectSendEdgeNetworkRequest = (({
    config,
    lifecycle,
    cookieTransfer,
    sendNetworkRequest,
    createResponse,
    processWarningsAndErrors,
    getLocationHint,
    getAssuranceValidationTokenParams
  }) => {
    const {
      edgeDomain,
      edgeBasePath,
      datastreamId
    } = config;

    /**
     * Sends a network request that is aware of payload interfaces,
     * lifecycle methods, configured edge domains, response structures, etc.
     */
    return ({
      request,
      runOnResponseCallbacks = noop$1,
      runOnRequestFailureCallbacks = noop$1
    }) => {
      const onResponseCallbackAggregator = createCallbackAggregator();
      onResponseCallbackAggregator.add(lifecycle.onResponse);
      onResponseCallbackAggregator.add(runOnResponseCallbacks);
      const onRequestFailureCallbackAggregator = createCallbackAggregator();
      onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
      onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);
      return lifecycle.onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add
      }).then(() => {
        const endpointDomain = request.getUseIdThirdPartyDomain() ? ID_THIRD_PARTY : edgeDomain;
        const locationHint = getLocationHint();
        const edgeBasePathWithLocationHint = locationHint ? `${edgeBasePath}/${locationHint}` : edgeBasePath;
        const configId = request.getDatastreamIdOverride() || datastreamId;
        const payload = request.getPayload();
        if (configId !== datastreamId) {
          payload.mergeMeta({
            sdkConfig: {
              datastream: {
                original: datastreamId
              }
            }
          });
        }
        const url = `https://${endpointDomain}/${edgeBasePathWithLocationHint}/${apiVersion}/${request.getAction()}?configId=${configId}&requestId=${request.getId()}${getAssuranceValidationTokenParams()}`;
        cookieTransfer.cookiesToPayload(payload, endpointDomain);
        return sendNetworkRequest({
          requestId: request.getId(),
          url,
          payload,
          useSendBeacon: request.getUseSendBeacon()
        });
      }).then(networkResponse => {
        processWarningsAndErrors(networkResponse);
        return networkResponse;
      }).catch(handleRequestFailure(onRequestFailureCallbackAggregator)).then(({
        parsedBody,
        getHeader
      }) => {
        // Note that networkResponse.parsedBody may be undefined if it was a
        // 204 No Content response. That's fine.
        const response = createResponse({
          content: parsedBody,
          getHeader
        });
        cookieTransfer.responseToCookies(response);

        // Notice we're calling the onResponse lifecycle method even if there are errors
        // inside the response body. This is because the full request didn't actually fail--
        // only portions of it that are considered non-fatal (a specific, non-critical
        // Konductor plugin, for example).
        return onResponseCallbackAggregator.call({
          response
        }).then(mergeLifecycleResponses);
      });
    };
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
  var injectProcessWarningsAndErrors = (({
    logger
  }) => {
    return networkResponse => {
      const {
        statusCode,
        body,
        parsedBody
      } = networkResponse;
      if (statusCode < 200 || statusCode >= 300 || !parsedBody && statusCode !== NO_CONTENT || parsedBody && !Array.isArray(parsedBody.handle)) {
        const bodyToLog = parsedBody ? JSON.stringify(parsedBody, null, 2) : body;
        const messageSuffix = bodyToLog ? `response body:\n${bodyToLog}` : `no response body.`;
        throw new Error(`${MESSAGE_PREFIX} status code ${statusCode} and ${messageSuffix}`);
      }
      if (parsedBody) {
        const {
          warnings = [],
          errors = []
        } = parsedBody;
        warnings.forEach(warning => {
          logger.warn(`${MESSAGE_PREFIX} warning:`, warning);
        });
        errors.forEach(error => {
          logger.error(`${MESSAGE_PREFIX} non-fatal error:`, error);
        });
      }
    };
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
  var injectGetLocationHint = (({
    orgId,
    cookieJar
  }) => {
    const clusterCookieName = getNamespacedCookieName(orgId, CLUSTER);
    const fromClusterCookie = () => cookieJar.get(clusterCookieName);
    const fromTarget = () => {
      const mboxEdgeCluster = cookieJar.get(MBOX_EDGE_CLUSTER);
      if (mboxEdgeCluster) {
        return `t${mboxEdgeCluster}`;
      }
      return undefined;
    };
    return () => {
      return fromClusterCookie() || fromTarget();
    };
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
  const MAX_RETRIES = 3;
  const RETRYABLE_STATUS_CODES = [TOO_MANY_REQUESTS, SERVICE_UNAVAILABLE, BAD_GATEWAY, GATEWAY_TIMEOUT];

  // These rules are in accordance with
  // https://git.corp.adobe.com/pages/experience-edge/konductor/#/apis/errors?id=handling-4xx-and-5xx-responses
  var isRequestRetryable = (({
    response,
    retriesAttempted
  }) => {
    return retriesAttempted < MAX_RETRIES && includes(RETRYABLE_STATUS_CODES, response.statusCode);
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

  // The retry gets incrementally (but not exponentially) longer for each retry.
  const FIRST_DELAY_MILLIS = 1000;
  const INCREMENTAL_DELAY_MILLIS = 1000;

  // When the target delay is randomized, make it within the range of this percentage above or below the target delay.
  const MAX_RANDOM_VARIANCE_PERCENTAGE = 0.3;
  const calculateRetryDelay = retriesAttempted => {
    const targetDelay = FIRST_DELAY_MILLIS + retriesAttempted * INCREMENTAL_DELAY_MILLIS;
    const maxVariance = targetDelay * MAX_RANDOM_VARIANCE_PERCENTAGE;
    const minDelay = targetDelay - maxVariance;
    const maxDelay = targetDelay + maxVariance;
    const randomizedDelayWithinRange = Math.round(minDelay + Math.random() * (maxDelay - minDelay));
    return randomizedDelayWithinRange;
  };
  const getDelayFromHeader = response => {
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
        delayInMillis = Math.max(0, new Date(headerValue).getTime() - new Date().getTime());
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
  var getRequestRetryDelay = (({
    response,
    retriesAttempted
  }) => {
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
  const HTTP_STATUS_OK = 200;
  var injectApplyResponse = (({
    cookieTransfer,
    lifecycle,
    createResponse,
    processWarningsAndErrors
  }) => {
    return ({
      request,
      responseHeaders,
      responseBody,
      runOnResponseCallbacks = noop$1,
      runOnRequestFailureCallbacks = noop$1
    }) => {
      const onResponseCallbackAggregator = createCallbackAggregator();
      onResponseCallbackAggregator.add(lifecycle.onResponse);
      onResponseCallbackAggregator.add(runOnResponseCallbacks);
      const onRequestFailureCallbackAggregator = createCallbackAggregator();
      onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
      onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);
      const getHeader = key => responseHeaders[key];
      return lifecycle.onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add
      }).then(() => processWarningsAndErrors({
        statusCode: HTTP_STATUS_OK,
        getHeader,
        body: JSON.stringify(responseBody),
        parsedBody: responseBody
      })).catch(handleRequestFailure(onRequestFailureCallbackAggregator)).then(() => {
        const response = createResponse({
          content: responseBody,
          getHeader
        });

        // This will clobber any cookies set via HTTP from the server.  So care should be given to remove any state:store handles if that is not desirable
        cookieTransfer.responseToCookies(response);
        return onResponseCallbackAggregator.call({
          response
        }).then(mergeLifecycleResponses);
      });
    };
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
  const {
    console: console$1,
    fetch,
    navigator: navigator$1,
    XMLHttpRequest
  } = window;

  // set this up as a function so that monitors can be added at anytime
  // eslint-disable-next-line no-underscore-dangle
  const getMonitors = () => window.__alloyMonitors || [];
  const coreConfigValidators = createCoreConfigs();
  const apexDomain = getApexDomain(window, cookieJar);
  const sendFetchRequest = isFunction(fetch) ? injectSendFetchRequest({
    fetch
  }) : injectSendXhrRequest({
    XMLHttpRequest
  });
  const fireReferrerHideableImage = injectFireReferrerHideableImage();
  const getAssuranceValidationTokenParams = createGetAssuranceValidationTokenParams({
    window,
    createNamespacedStorage
  });
  const createExecuteCommand = ({
    instanceName,
    logController: {
      setDebugEnabled,
      logger,
      createComponentLogger
    }
  }) => {
    const componentRegistry = createComponentRegistry();
    const lifecycle = createLifecycle(componentRegistry);
    const setDebugCommand = options => {
      setDebugEnabled(options.enabled, {
        fromConfig: false
      });
    };
    const loggingCookieJar = createLoggingCookieJar({
      logger,
      cookieJar
    });
    const configureCommand = options => {
      const config = buildAndValidateConfig({
        options,
        componentCreators,
        coreConfigValidators,
        createConfig,
        logger,
        setDebugEnabled
      });
      const {
        orgId,
        targetMigrationEnabled
      } = config;
      const shouldTransferCookie = injectShouldTransferCookie({
        orgId,
        targetMigrationEnabled
      });
      const cookieTransfer = createCookieTransfer({
        cookieJar: loggingCookieJar,
        shouldTransferCookie,
        apexDomain,
        dateProvider: () => new Date()
      });
      const sendBeaconRequest = isFunction(navigator$1.sendBeacon) ? injectSendBeaconRequest({
        // Without the bind(), the browser will complain about an
        // illegal invocation.
        sendBeacon: navigator$1.sendBeacon.bind(navigator$1),
        sendFetchRequest,
        logger
      }) : sendFetchRequest;
      const sendNetworkRequest = injectSendNetworkRequest({
        logger,
        sendFetchRequest,
        sendBeaconRequest,
        isRequestRetryable,
        getRequestRetryDelay
      });
      const processWarningsAndErrors = injectProcessWarningsAndErrors({
        logger
      });
      const extractEdgeInfo = injectExtractEdgeInfo({
        logger
      });
      const createResponse = injectCreateResponse({
        extractEdgeInfo
      });
      const getLocationHint = injectGetLocationHint({
        orgId,
        cookieJar
      });
      const sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
        config,
        lifecycle,
        cookieTransfer,
        sendNetworkRequest,
        createResponse,
        processWarningsAndErrors,
        getLocationHint,
        getAssuranceValidationTokenParams
      });
      const applyResponse = injectApplyResponse({
        lifecycle,
        cookieTransfer,
        createResponse,
        processWarningsAndErrors
      });
      const generalConsentState = createConsentStateMachine({
        logger
      });
      const consent = createConsent({
        generalConsentState,
        logger
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
        applyResponse
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
              errorPrefix: `[${instanceName}] [${componentName}]`,
              logger: componentLogger
            }),
            createNamespacedStorage,
            apexDomain
          };
        }
      });
    };
    const handleError = injectHandleError({
      errorPrefix: `[${instanceName}]`,
      logger
    });
    const executeCommand = injectExecuteCommand({
      logger,
      configureCommand,
      setDebugCommand,
      handleError,
      validateCommandOptions
    });
    return executeCommand;
  };
  var core = (() => {
    // eslint-disable-next-line no-underscore-dangle
    const instanceNames = window.__alloyNS;
    if (instanceNames) {
      instanceNames.forEach(instanceName => {
        const logController = createLogController({
          console: console$1,
          locationSearch: window.location.search,
          createLogger,
          instanceName,
          createNamespacedStorage,
          getMonitors
        });
        const executeCommand = createExecuteCommand({
          instanceName,
          logController
        });
        const instance = createInstanceFunction(executeCommand);
        const queue = window[instanceName].q;
        queue.push = instance;
        logController.logger.logOnInstanceCreated({
          instance
        });
        queue.forEach(instance);
      });
    }
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
  core();

})();
