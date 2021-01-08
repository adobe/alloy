(function() {
  window._satellite = window._satellite || {};
  window._satellite.container = {
  "buildInfo": {
    "buildDate": "2020-11-05T04:05:50Z",
    "environment": "development",
    "turbineBuildDate": "2020-08-10T20:14:17Z",
    "turbineVersion": "27.0.0"
  },
  "dataElements": {
  },
  "extensions": {
    "adobe-alloy": {
      "displayName": "AEP Web SDK",
      "modules": {
        "adobe-alloy/dist/lib/actions/sendEvent/index.js": {
          "name": "send-event",
          "displayName": "Send Event",
          "script": function(module, exports, require, turbine) {
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
var createSendEvent = require("./createSendEvent");

var instanceManager = require("../../instanceManager/index");

var decisionsCallbackStorage = require("../../decisionsCallbackStorage");

module.exports = createSendEvent({
  instanceManager: instanceManager,
  turbine: turbine,
  decisionsCallbackStorage: decisionsCallbackStorage
});
          }

        },
        "adobe-alloy/dist/lib/instanceManager/index.js": {
          "script": function(module, exports, require, turbine) {
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
var runAlloy = require("../runAlloy");

var createInstanceManager = require("./createInstanceManager");

module.exports = createInstanceManager({
  turbine: turbine,
  window: window,
  runAlloy: runAlloy,
  orgId: _satellite.company.orgId
});
          }

        },
        "adobe-alloy/dist/lib/actions/sendEvent/createSendEvent.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
var clone = require("../../utils/clone");

module.exports = function (_ref) {
  var instanceManager = _ref.instanceManager,
      decisionsCallbackStorage = _ref.decisionsCallbackStorage;
  return function (settings) {
    var instanceName = settings.instanceName,
        otherSettings = _objectWithoutProperties(settings, ["instanceName"]);

    var instance = instanceManager.getInstance(instanceName);

    if (!instance) {
      throw new Error("Failed to send event for instance \"".concat(instanceName, "\". No matching instance was configured with this name."));
    } // If the customer modifies the xdm object (or anything nested in the object) after this action runs, we want to
    // make sure those modifications are not reflected in the data sent to the server. By cloning the object here,
    // we ensure we use a snapshot that will remain unchanged during the time period between when sendEvent
    // is called and the network request is made.


    if (otherSettings.xdm) {
      otherSettings.xdm = clone(otherSettings.xdm);
    }

    return instance("sendEvent", otherSettings).then(function (result) {
      if (result.decisions) {
        decisionsCallbackStorage.triggerEvent({
          decisions: result.decisions
        });
      }
    });
  };
};
          }

        },
        "adobe-alloy/dist/lib/decisionsCallbackStorage.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

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
var decisionsReceivedEventTriggers = [];
module.exports = {
  add: function add(trigger) {
    decisionsReceivedEventTriggers.push(trigger);
  },
  triggerEvent: function triggerEvent(decisions) {
    decisionsReceivedEventTriggers.forEach(function (trigger) {
      trigger(decisions);
    });
  }
};
          }

        },
        "adobe-alloy/dist/lib/utils/clone.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

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
 * Clones a value by serializing then deserializing the value.
 * @param {*} value
 * @returns {any}
 */
module.exports = function (value) {
  return JSON.parse(JSON.stringify(value));
};
          }

        },
        "adobe-alloy/dist/lib/runAlloy.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

function _typeof2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
module.exports = function (instanceNames) {
  /////////////////////////////
  // BASE CODE
  /////////////////////////////
  !function (n, o) {
    o.forEach(function (o) {
      n[o] || ((n.__alloyNS = n.__alloyNS || []).push(o), n[o] = function () {
        var u = arguments;
        return new Promise(function (i, l) {
          n[o].q.push([i, l, u]);
        });
      }, n[o].q = []);
    });
  }(window, instanceNames); /////////////////////////////////
  // LIBRARY CODE
  /////////////////////////////////

  /**
   * Copyright 2019 Adobe. All rights reserved.
   * This file is licensed to you under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License. You may obtain a copy
   * of the License at http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software distributed under
   * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
   * OF ANY KIND, either express or implied. See the License for the specific language
   * governing permissions and limitations under the License.
   */

  'use strict';

  if (document.documentMode && document.documentMode < 11) {
    console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');
  } else {
    (function () {
      var assign = require('@adobe/reactor-object-assign');

      var cookie = require('@adobe/reactor-cookie');

      var queryString = require('@adobe/reactor-query-string');

      var loadScript = require('@adobe/reactor-load-script');

      function _interopDefaultLegacy(e) {
        return e && _typeof2(e) === 'object' && 'default' in e ? e : {
          'default': e
        };
      }

      var assign__default = /*#__PURE__*/_interopDefaultLegacy(assign);

      var cookie__default = /*#__PURE__*/_interopDefaultLegacy(cookie);

      var queryString__default = /*#__PURE__*/_interopDefaultLegacy(queryString);

      var loadScript__default = /*#__PURE__*/_interopDefaultLegacy(loadScript);
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */


      var createInstance = function createInstance(executeCommand) {
        return function (args) {
          // Would use destructuring, but destructuring doesn't work on IE
          // without polyfilling Symbol.
          // https://github.com/babel/babel/issues/7597
          var resolve = args[0];
          var reject = args[1];
          var userProvidedArgs = args[2];
          var commandName = userProvidedArgs[0];
          var options = userProvidedArgs[1];
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


      var CHROME = "Chrome";
      var EDGE = "Edge";
      var EDGE_CHROMIUM = "EdgeChromium";
      var FIREFOX = "Firefox";
      var IE = "IE";
      var SAFARI = "Safari";
      var UNKNOWN = "Unknown";
      /*
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

      var includes = function includes(arr, item) {
        return arr.indexOf(item) !== -1;
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
      // we don't know. We also assume "unknown" browsers support third-party cookies,
      // though we don't really know that either. We're making best guesses.


      var browsersSupportingThirdPartyCookie = [CHROME, EDGE, EDGE_CHROMIUM, IE, UNKNOWN];

      var areThirdPartyCookiesSupportedByDefault = function areThirdPartyCookiesSupportedByDefault(browser) {
        return includes(browsersSupportingThirdPartyCookie, browser);
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
       * Clones a value by serializing then deserializing the value.
       * @param {*} value
       * @returns {any}
       */


      var clone = function clone(value) {
        return JSON.parse(JSON.stringify(value));
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


      var MILLISECOND = 1;
      var SECOND = MILLISECOND * 1000;
      var MINUTE = SECOND * 60;
      var HOUR = MINUTE * 60;
      var DAY = HOUR * 24;

      var convertTimes = function convertTimes(fromUnit, toUnit, amount) {
        return fromUnit * amount / toUnit;
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
       * Returns true whether the value is null or undefined.
       * @param {*} value
       * @returns {boolean}
       */


      var isNil = function isNil(value) {
        return value == null;
      };

      function _typeof(obj) {
        if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
          _typeof = function _typeof(obj) {
            return _typeof2(obj);
          };
        } else {
          _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
          };
        }

        return _typeof(obj);
      }

      function _defineProperty(obj, key, value) {
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }

        return obj;
      }

      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);

        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          if (enumerableOnly) symbols = symbols.filter(function (sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          });
          keys.push.apply(keys, symbols);
        }

        return keys;
      }

      function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i] != null ? arguments[i] : {};

          if (i % 2) {
            ownKeys(source, true).forEach(function (key) {
              _defineProperty(target, key, source[key]);
            });
          } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
          } else {
            ownKeys(source).forEach(function (key) {
              Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
          }
        }

        return target;
      }

      function _objectWithoutPropertiesLoose(source, excluded) {
        if (source == null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;

        for (i = 0; i < sourceKeys.length; i++) {
          key = sourceKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          target[key] = source[key];
        }

        return target;
      }

      function _objectWithoutProperties(source, excluded) {
        if (source == null) return {};

        var target = _objectWithoutPropertiesLoose(source, excluded);

        var key, i;

        if (Object.getOwnPropertySymbols) {
          var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

          for (i = 0; i < sourceSymbolKeys.length; i++) {
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
          }
        }

        return target;
      }

      function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
      }

      function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
      }

      function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) {
          for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
          }

          return arr2;
        }
      }

      function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
      }

      function _iterableToArray(iter) {
        if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
      }

      function _iterableToArrayLimit(arr, i) {
        if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
          return;
        }

        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
          for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
            _arr.push(_s.value);

            if (i && _arr.length === i) break;
          }
        } catch (err) {
          _d = true;
          _e = err;
        } finally {
          try {
            if (!_n && _i["return"] != null) _i["return"]();
          } finally {
            if (_d) throw _e;
          }
        }

        return _arr;
      }

      function _nonIterableSpread() {
        throw new TypeError("Invalid attempt to spread non-iterable instance");
      }

      function _nonIterableRest() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
      /**
       * Returns whether the value is an object.
       * @param {*} value
       * @returns {boolean}
       */


      var isObject = function isObject(value) {
        return !isNil(value) && !Array.isArray(value) && _typeof(value) === "object";
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


      var deepAssignObject = function deepAssignObject(target, source) {
        Object.keys(source).forEach(function (key) {
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


      var deepAssign = function deepAssign(target) {
        if (isNil(target)) {
          throw new TypeError('deepAssign "target" cannot be null or undefined');
        }

        var result = Object(target);

        for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          sources[_key - 1] = arguments[_key];
        }

        sources.forEach(function (source) {
          return deepAssignObject(result, Object(source));
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

      /**
       * Creates a function that, when passed an object of updates, will merge
       * the updates onto the current value of a payload property.
       * @param {Object} content The base object to modify
       * @param {String } key The property to merge updates into. This
       * can be a dot-notation property path.
       * @returns {Function}
       */


      var createMerger = function createMerger(content, key) {
        return function (updates) {
          var propertyPath = key.split(".");
          var hostObjectForUpdates = propertyPath.reduce(function (obj, propertyName) {
            obj[propertyName] = obj[propertyName] || {};
            return obj[propertyName];
          }, content);
          deepAssign(hostObjectForUpdates, updates);
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
       * Allows callbacks to be registered and then later called. When the
       * callbacks are called, their responses are combined into a single promise.
       */


      var createCallbackAggregator = function createCallbackAggregator() {
        var callbacks = [];
        return {
          add: function add(callback) {
            callbacks.push(callback);
          },
          call: function call() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            } // While this utility doesn't necessarily need to be doing the
            // Promise.all, it's currently useful everywhere this is used and
            // reduces repetitive code. We can factor it out later if we want
            // to make this utility more "pure".


            return Promise.all(callbacks.map(function (callback) {
              return callback.apply(void 0, args);
            }));
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

      /**
       * Sequences tasks.
       */


      var createTaskQueue = function createTaskQueue() {
        var queueLength = 0;
        var lastPromiseInQueue = Promise.resolve();
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
          addTask: function addTask(task) {
            queueLength += 1;

            var lastPromiseFulfilledHandler = function lastPromiseFulfilledHandler() {
              return task()["finally"](function () {
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


      var defer = function defer() {
        var deferred = {};
        deferred.promise = new Promise(function (resolve, reject) {
          deferred.resolve = resolve;
          deferred.reject = reject;
        });
        return deferred;
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
       * Whether a string ends with the characters of a specified string
       * @param {String} str The string to search within.
       * @param {String} suffix The string to search for.
       * @returns {boolean}
       */


      var endsWith = function endsWith(str, suffix) {
        return str.substr(-suffix.length) === suffix;
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
       * Returns the first item in the array that satisfies the provided testing function.
       * @param {Array} arr The array to search.
       * @param {Function} predicate Function that will be called for each item. Arguments
       * will be the item, the item index, then the array itself.
       * @returns {*}
       */


      var find = function find(arr, predicate) {
        for (var i = 0; i < arr.length; i += 1) {
          var item = arr[i];

          if (predicate(item, i, arr)) {
            return item;
          }
        }

        return undefined;
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


      var appendNode = function appendNode(parent, node) {
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


      var populateElementProperties = function populateElementProperties(element, props) {
        Object.keys(props).forEach(function (key) {
          // The following is to support setting style properties to avoid CSP errors.
          if (key === "style" && isObject(props[key])) {
            var styleProps = props[key];
            Object.keys(styleProps).forEach(function (styleKey) {
              element.style[styleKey] = styleProps[styleKey];
            });
          } else {
            element[key] = props[key];
          }
        });
      };

      var createNode = function createNode(tag) {
        var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var children = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
        var doc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : document;
        var result = doc.createElement(tag);
        Object.keys(attrs).forEach(function (key) {
          // TODO: To highlight CSP problems consider throwing a descriptive error
          //       if nonce is available and key is style.
          result.setAttribute(key, attrs[key]);
        });
        populateElementProperties(result, props);
        children.forEach(function (child) {
          return appendNode(result, child);
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


      var BODY = "BODY";
      var IFRAME = "IFRAME";
      var IMG = "IMG";
      var DIV = "DIV";
      var STYLE = "STYLE";
      var SCRIPT = "SCRIPT";
      var SRC = "src";
      /*
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

      var fireImage = function fireImage(_ref) {
        var src = _ref.src,
            _ref$currentDocument = _ref.currentDocument,
            currentDocument = _ref$currentDocument === void 0 ? document : _ref$currentDocument;
        return new Promise(function (resolve, reject) {
          var attrs = {
            src: src
          };
          var props = {
            onload: resolve,
            onerror: reject,
            onabort: reject
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


      var isFunction = function isFunction(value) {
        return typeof value === "function";
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
       * Returns whether the value is a non-empty array.
       * @param {*} value
       * @returns {boolean}
       */


      var isNonEmptyArray = function isNonEmptyArray(value) {
        return Array.isArray(value) && value.length > 0;
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


      var toArray = function toArray(value) {
        if (Array.isArray(value)) {
          return value;
        }

        if (value == null) {
          return [];
        }

        return [].slice.call(value);
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
       * @param {String} selector
       * @param {Node} [context=document] defaults to document
       * @returns {Array} an array of DOM nodes
       */


      var selectNodes = function selectNodes(selector) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
        return toArray(context.querySelectorAll(selector));
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


      var MUTATION_OBSERVER = "MutationObserver";
      var RAF = "requestAnimationFrame";
      var MUTATION_OBSERVER_CONFIG = {
        childList: true,
        subtree: true
      };
      var VISIBILITY_STATE = "visibilityState";
      var VISIBLE = "visible";
      var DELAY = 100;
      var MAX_POLLING_TIMEOUT = 5000;

      var createError = function createError(selector) {
        return new Error("Could not find: " + selector);
      };

      var createPromise = function createPromise(executor) {
        return new Promise(executor);
      };

      var canUseMutationObserver = function canUseMutationObserver(win) {
        return isFunction(win[MUTATION_OBSERVER]);
      };

      var awaitUsingMutationObserver = function awaitUsingMutationObserver(win, doc, selector, timeout, selectFunc) {
        return createPromise(function (resolve, reject) {
          var mutationObserver = new win[MUTATION_OBSERVER](function () {
            var nodes = selectFunc(selector);

            if (isNonEmptyArray(nodes)) {
              mutationObserver.disconnect();
              resolve(nodes);
            }
          });
          setTimeout(function () {
            mutationObserver.disconnect();
            reject(createError(selector));
          }, timeout);
          mutationObserver.observe(doc, MUTATION_OBSERVER_CONFIG);
        });
      };

      var canUseRequestAnimationFrame = function canUseRequestAnimationFrame(doc) {
        return doc[VISIBILITY_STATE] === VISIBLE;
      };

      var awaitUsingRequestAnimation = function awaitUsingRequestAnimation(win, selector, timeout, selectFunc) {
        return createPromise(function (resolve, reject) {
          var execute = function execute() {
            var nodes = selectFunc(selector);

            if (isNonEmptyArray(nodes)) {
              resolve(nodes);
              return;
            }

            win[RAF](execute);
          };

          execute();
          setTimeout(function () {
            reject(createError(selector));
          }, timeout);
        });
      };

      var awaitUsingTimer = function awaitUsingTimer(selector, timeout, selectFunc) {
        return createPromise(function (resolve, reject) {
          var execute = function execute() {
            var nodes = selectFunc(selector);

            if (isNonEmptyArray(nodes)) {
              resolve(nodes);
              return;
            }

            setTimeout(execute, DELAY);
          };

          execute();
          setTimeout(function () {
            reject(createError(selector));
          }, timeout);
        });
      };

      var awaitSelector = function awaitSelector(selector) {
        var selectFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : selectNodes;
        var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : MAX_POLLING_TIMEOUT;
        var win = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : window;
        var doc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : document;
        var nodes = selectFunc(selector);

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


      var matchesSelector = function matchesSelector(selector, element) {
        if (element.matches) {
          return element.matches(selector);
        } // Making IE 11 happy


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


      var removeNode = function removeNode(node) {
        var parent = node.parentNode;

        if (parent) {
          return parent.removeChild(node);
        }

        return null;
      };

      var fireOnPage = fireImage;
      var IFRAME_ATTRS = {
        name: "Adobe Alloy"
      };
      var IFRAME_PROPS = {
        style: {
          display: "none",
          width: 0,
          height: 0
        }
      };

      var fireReferrerHideableImage = function fireReferrerHideableImage(request) {
        var createIframe = function createIframe() {
          return awaitSelector(BODY).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 1),
                body = _ref2[0];

            var iframe = createNode(IFRAME, IFRAME_ATTRS, IFRAME_PROPS);
            return appendNode(body, iframe);
          });
        };

        var fireInIframe = function fireInIframe(_ref3) {
          var src = _ref3.src;
          return createIframe().then(function (iframe) {
            var currentDocument = iframe.contentWindow.document;
            return fireImage({
              src: src,
              currentDocument: currentDocument
            }).then(function () {
              removeNode(iframe);
            });
          });
        };

        var hideReferrer = request.hideReferrer,
            url = request.url;
        return hideReferrer ? fireInIframe({
          src: url
        }) : fireOnPage({
          src: url
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


      var flatMap = function flatMap(array, mapFunction) {
        return Array.prototype.concat.apply([], array.map(mapFunction));
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

      var getLastArrayItems = function getLastArrayItems(arr, itemCount) {
        return arr.slice(-itemCount);
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


      var cookieName = baseNamespace + "getTld";
      /**
       * Of the current web page's hostname, this is the top-most domain that is
       * not a "public suffix" as outlined in https://publicsuffix.org/. In other
       * words, this is top-most domain that is able to accept cookies.
       * @param {Object} window
       * @param {Object} cookieJar
       * @returns {string}
       */

      var getApexDomain = function getApexDomain(window, cookieJar) {
        var topLevelCookieDomain = ""; // If hostParts.length === 1, we may be on localhost.

        var hostParts = window.location.hostname.toLowerCase().split(".");
        var i = 1;

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

      var sanitizeOrgIdForCookieName = function sanitizeOrgIdForCookieName(orgId) {
        return orgId.replace("@", "_");
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


      var getNamespacedCookieName = function getNamespacedCookieName(orgId, key) {
        return COOKIE_NAME_PREFIX + "_" + sanitizeOrgIdForCookieName(orgId) + "_" + key;
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


      var intersection = function intersection(a, b) {
        return a.filter(function (x) {
          return includes(b, x);
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
       * Returns whether the value is a boolean.
       * @param {*} value
       * @returns {boolean}
       */


      var isBoolean = function isBoolean(value) {
        return typeof value === "boolean";
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


      var isEmptyObject = function isEmptyObject(value) {
        return isObject(value) && Object.keys(value).length === 0;
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
       * Returns whether the value is a number.
       * @param {*} value
       * @returns {boolean}
       */
      // eslint-disable-next-line no-restricted-globals


      var isNumber = function isNumber(value) {
        return typeof value === "number" && !isNaN(value);
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
       * Returns whether the value is an integer.
       * @param {*} value
       * @returns {boolean}
       */


      var isInteger = function isInteger(value) {
        var parsed = parseInt(value, 10);
        return isNumber(parsed) && value === parsed;
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


      var isNamespacedCookieName = function isNamespacedCookieName(orgId, name) {
        return name.indexOf(COOKIE_NAME_PREFIX + "_" + sanitizeOrgIdForCookieName(orgId) + "_") === 0;
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
       * Returns whether the value is a string.
       * @param {*} value
       * @returns {boolean}
       */


      var isString = function isString(value) {
        return typeof value === "string";
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
       * Returns whether the value is a populated string.
       * @param {*} value
       * @returns {boolean}
       */


      var isNonEmptyString = function isNonEmptyString(value) {
        return isString(value) && value.length > 0;
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
       * Creates a function that memoizes the result of `fn`. If `keyResolver` is
       * provided, it determines the cache key for storing the result based on the
       * arguments provided to the memoized function. By default, the first argument
       * provided to the memoized function is used as the map cache key.
       *
       * @param {Function} fn The function to have its output memoized.
       * @param {Function} [keyResolver] The function to resolve the cache key.
       * @returns {Function} The new memoized function.
       */


      var memoize = function memoize(fn, keyResolver) {
        var map = new Map();
        return function () {
          var key = keyResolver ? keyResolver.apply(void 0, arguments) : arguments.length <= 0 ? undefined : arguments[0];

          if (map.has(key)) {
            return map.get(key);
          }

          var result = fn.apply(void 0, arguments);
          map.set(key, result);
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

      /**
       * A function that performs no operations.
       */


      var noop = function noop() {};
      /*
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


      var padStart = function padStart(string, targetLength, padString) {
        var originalString = String(string);
        var repeatedPadString = String(padString);

        if (originalString.length >= targetLength || repeatedPadString.length === 0) {
          return originalString;
        }

        var lengthToAdd = targetLength - originalString.length;

        while (lengthToAdd > repeatedPadString.length) {
          repeatedPadString += repeatedPadString;
        }

        return repeatedPadString.slice(0, lengthToAdd) + originalString;
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
       * Creates and returns a new error using the provided value as a message.
       * If the provided value is already an Error, it will be returned unmodified.
       * @param {*} value
       * @returns {Error}
       */


      var toError = function toError(value) {
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


      var updateErrorMessage = function updateErrorMessage(_ref) {
        var error = _ref.error,
            message = _ref.message;

        try {
          error.message = message;
        } catch (e) {// We'll set a new message when we can, but some errors, like DOMException,
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
       * @param {String} message The message to be added to the error.
       * @param {*} error Optimally, this is an instance of Error. If it is not,
       * this is used as the basis for the message of a newly created Error instance.
       * @returns {*}
       */


      var stackError = function stackError(_ref) {
        var error = _ref.error,
            message = _ref.message;
        var errorToStack = toError(error);
        var newMessage = message + "\nCaused by: " + errorToStack.message;
        updateErrorMessage({
          error: errorToStack,
          message: newMessage
        });
        return errorToStack;
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


      var getStorageByType = function getStorageByType(context, storageType, namespace) {
        // When storage is disabled on Safari, the mere act of referencing
        // window.localStorage or window.sessionStorage throws an error.
        // For this reason, we wrap in a try-catch.
        return {
          /**
           * Reads a value from storage.
           * @param {string} name The name of the item to be read.
           * @returns {string}
           */
          getItem: function getItem(name) {
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
          setItem: function setItem(name, value) {
            try {
              context[storageType].setItem(namespace + name, value);
              return true;
            } catch (e) {
              return false;
            }
          }
        };
      };

      var injectStorage = function injectStorage(context) {
        return function (additionalNamespace) {
          var finalNamespace = baseNamespace + additionalNamespace;
          return {
            session: getStorageByType(context, "sessionStorage", finalNamespace),
            persistent: getStorageByType(context, "localStorage", finalNamespace)
          };
        };
      };

      var stringToBoolean = function stringToBoolean(str) {
        return isString(str) && str.toLowerCase() === "true";
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
       * Formats the date into an ISO date-time string in the local timezone
       * @param {Date} date
       * @returns {string}
       */


      var toISOStringLocal = function toISOStringLocal(date) {
        var YYYY = date.getFullYear();
        var MM = padStart(date.getMonth() + 1, 2, "0");
        var DD = padStart(date.getDate(), 2, "0");
        var hh = padStart(date.getHours(), 2, "0");
        var mm = padStart(date.getMinutes(), 2, "0");
        var ss = padStart(date.getSeconds(), 2, "0");
        var mmm = padStart(date.getMilliseconds(), 3, "0"); // The time-zone offset is the difference, in minutes, from local time to UTC. Note that this
        // means that the offset is positive if the local timezone is behind UTC and negative if it is
        // ahead. For example, for time zone UTC+10:00, -600 will be returned.

        var timezoneOffset = date.getTimezoneOffset();
        var ts = timezoneOffset > 0 ? "-" : "+";
        var th = padStart(Math.floor(Math.abs(timezoneOffset) / 60), 2, "0");
        var tm = padStart(Math.abs(timezoneOffset) % 60, 2, "0");
        return YYYY + "-" + MM + "-" + DD + "T" + hh + ":" + mm + ":" + ss + "." + mmm + ts + th + ":" + tm;
      };

      var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

      function createCommonjsModule(fn, module) {
        return module = {
          exports: {}
        }, fn(module, module.exports), module.exports;
      }

      var rngBrowser = createCommonjsModule(function (module) {
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

          module.exports = function whatwgRNG() {
            getRandomValues(rnds8);
            return rnds8;
          };
        } else {
          // Math.random()-based (RNG)
          //
          // If all else fails, use Math.random().  It's fast, but is of unspecified
          // quality.
          var rnds = new Array(16);

          module.exports = function mathRNG() {
            for (var i = 0, r; i < 16; i++) {
              if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
              rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
            }

            return rnds;
          };
        }
      });
      /**
       * Convert array of 16 byte values to UUID string format of the form:
       * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
       */

      var byteToHex = [];

      for (var i = 0; i < 256; ++i) {
        byteToHex[i] = (i + 0x100).toString(16).substr(1);
      }

      function bytesToUuid(buf, offset) {
        var i = offset || 0;
        var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

        return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
      }

      var bytesToUuid_1 = bytesToUuid;

      function v4(options, buf, offset) {
        var i = buf && offset || 0;

        if (typeof options == 'string') {
          buf = options === 'binary' ? new Array(16) : null;
          options = null;
        }

        options = options || {};
        var rnds = options.random || (options.rng || rngBrowser)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

        rnds[6] = rnds[6] & 0x0f | 0x40;
        rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

        if (buf) {
          for (var ii = 0; ii < 16; ++ii) {
            buf[i + ii] = rnds[ii];
          }
        }

        return buf || bytesToUuid_1(rnds);
      }

      var v4_1 = v4;
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
       * Chains two validators together.
       *
       * Validators are functions of two parameters (value and path) that return the computed value if
       * the input is valid, or throw an exception if the input is invalid. In most cases the returned
       * value is the same as the input value; however, reference createDefaultValidator.js
       * to see an example where the computed value is different from the input. Additionally, if we ever
       * wanted to coerce types (i.e. parse string values into integers) as part of the validation process
       * we could use the computed value to accomplish that.
       *
       * The path parameter is used to generate informative error messages. It is created by the objectOf, and
       * arrayOf validators so that any error message can describe which key within the object or array is
       * invalid.
       *
       * The validators also have methods to chain additional validation logic. For example, when you call
       * `string()` to start a validator chain, it returns a validator function but it also has methods
       * like `required` and `nonEmpty`. In index.js you can see that these methods are actually calling `chain`.
       * Specifically in this function, the leftValidator is called first and then the return value of that is
       * sent to the rightValidator. For example, when calling `string().nonEmpty().required()` the following
       * chain is built up:
       * ```
       *              *
       *            /   \
       *          *     required
       *        /   \
       *      *     nonEmpty
       *    /   \
       * base   string
       * ```
       * Where every * is a call to chain where the two are combined. The individual validators are called from
       * left to right in the above tree. The base validator is simply the identity function `value => value`,
       * representing an optional value.
       *
       * After combining the validators, the new validator function is then augmented with the methods from the
       * leftValidator and from the additionalMethods parameter. For example, when the string() function is called
       * it chains to the base validator, but also adds additional methods like (`regexp`, `domain`, `nonEmpty`,
       * and `unique`). When `nonEmpty` is called, which calls chain again, the additional methods are carried
       * forward because they are already defined on the leftValidator.
       *
       * The base validator also contains the two methods `required` and `default`, so these can be used anywhere
       * after any of the exposed validator functions are called.
       */

      var chain = function chain(leftValidator, rightValidator) {
        var additionalMethods = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}; // combine the two validators, calling left first and then right.
        // pass the return value from left into right.

        var combinedValidator = function combinedValidator(value, path) {
          return rightValidator(leftValidator(value, path), path);
        }; // add the methods already defined on the left validator, and the additionalMethods
        // to the new combined validator function.


        assign__default['default'](combinedValidator, leftValidator, additionalMethods);
        return combinedValidator;
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
       * This augments `chain` with a null check done before running the rightValidator.
       * See chain for more info.
       *
       * For most validators, we want the validation to be optional (i.e. allow null or
       * undefined values). To accomplish this, the validator needs to have a check
       * at the begining of the function, short circuiting the validation logic and
       * returning value if value is null or undefined. `default` and `required` do not
       * want this null check though. Indeed, `default` should return the default value
       * if value is null, and `required` should throw an error if value is null.
       *
       * So to keep from having to have a null check in front of most validators, this
       * function allows you to chain a rightValidator that needs to have a null check.
       */


      var nullSafeChain = function nullSafeChain(leftValidator, rightValidator, additionalMethods) {
        var rightValidatorWithNullCheck = function rightValidatorWithNullCheck(value, path) {
          return value == null ? value : rightValidator(value, path);
        };

        return chain(leftValidator, rightValidatorWithNullCheck, additionalMethods);
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


      var assertValid = function assertValid(isValid, value, path, message) {
        if (!isValid) {
          throw new Error("'" + path + "': Expected " + message + ", but got " + JSON.stringify(value) + ".");
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


      var booleanValidator = function booleanValidator(value, path) {
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


      var callbackValidator = function callbackValidator(value, path) {
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


      var createArrayOfValidator = function createArrayOfValidator(elementValidator) {
        return function (value, path) {
          assertValid(Array.isArray(value), value, path, "an array");
          var errors = [];
          var validatedArray = value.map(function (subValue, i) {
            try {
              return elementValidator(subValue, path + "[" + i + "]");
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


      var createDefaultValidator = function createDefaultValidator(defaultValue) {
        return function (value) {
          if (value == null) {
            return defaultValue;
          }

          return value;
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


      var createLiteralValidator = function createLiteralValidator(literalValue) {
        return function (value, path) {
          assertValid(value === literalValue, value, path, "" + literalValue);
          return value;
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


      var createMapOfValuesValidator = function createMapOfValuesValidator(valueValidator) {
        return function (value, path) {
          assertValid(isObject(value), value, path, "an object");
          var errors = [];
          var validatedObject = {};
          Object.keys(value).forEach(function (subKey) {
            var subValue = value[subKey];
            var subPath = path ? path + "." + subKey : subKey;

            try {
              var validatedValue = valueValidator(subValue, subPath);

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


      var createMinimumValidator = function createMinimumValidator(typeName, minimum) {
        return function (value, path) {
          assertValid(value >= minimum, value, path, typeName + " greater than or equal to " + minimum);
          return value;
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


      var createNoUnknownFieldsValidator = function createNoUnknownFieldsValidator(schema) {
        return function (value, path) {
          var errors = [];
          Object.keys(value).forEach(function (subKey) {
            if (!schema[subKey]) {
              var subPath = path ? path + "." + subKey : subKey;
              errors.push("'" + subPath + "': Unknown field.");
            }
          });

          if (errors.length) {
            throw new Error(errors.join("\n"));
          }

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


      var createNonEmptyValidator = function createNonEmptyValidator(message) {
        return function (value, path) {
          if (isObject(value)) {
            assertValid(!isEmptyObject(value), value, path, message);
          } else {
            assertValid(value.length > 0, value, path, message);
          }

          return value;
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


      var createObjectOfValidator = function createObjectOfValidator(schema) {
        return function (value, path) {
          assertValid(isObject(value), value, path, "an object");
          var errors = [];
          var validatedObject = {};
          Object.keys(schema).forEach(function (subKey) {
            var subValue = value[subKey];
            var subSchema = schema[subKey];
            var subPath = path ? path + "." + subKey : subKey;

            try {
              var validatedValue = subSchema(subValue, subPath);

              if (validatedValue !== undefined) {
                validatedObject[subKey] = validatedValue;
              }
            } catch (e) {
              errors.push(e.message);
            }
          }); // copy over unknown properties

          Object.keys(value).forEach(function (subKey) {
            if (!Object.prototype.hasOwnProperty.call(validatedObject, subKey)) {
              validatedObject[subKey] = value[subKey];
            }
          });

          if (errors.length) {
            throw new Error(errors.join("\n"));
          }

          return validatedObject;
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


      var createAnyOfValidator = function createAnyOfValidator(validators, message) {
        return function (value, path) {
          var valid = find(validators, function (validator) {
            try {
              validator(value, path);
              return true;
            } catch (e) {
              return false;
            }
          });
          assertValid(valid, value, path, message);
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


      var createUniqueValidator = function createUniqueValidator() {
        var values = [];
        return function (value, path) {
          assertValid(values.indexOf(value) === -1, value, path, "a unique value across instances");
          values.push(value);
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


      var DOMAIN_REGEX = /^[a-z0-9.-]{1,}$/i;

      var domainValidator = function domainValidator(value, path) {
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


      var integerValidator = function integerValidator(value, path) {
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


      var numberValidator = function numberValidator(value, path) {
        assertValid(isNumber(value), value, path, "a number");
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


      var isValidRegExp = function isValidRegExp(value) {
        try {
          return new RegExp(value) !== null;
        } catch (e) {
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


      var regexpValidator = function regexpValidator(value, path) {
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


      var requiredValidator = function requiredValidator(value, path) {
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


      var stringValidator = function stringValidator(value, path) {
        assertValid(isString(value), value, path, "a string");
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


      var base = function base(value) {
        return value;
      }; // The 'default' and 'required' methods are available after any data-type method
      // Don't use the nullSafeChain because they need to handle the null or undefined case


      base["default"] = function _default(defaultValue) {
        return chain(this, createDefaultValidator(defaultValue));
      };

      base.required = function required() {
        return chain(this, requiredValidator);
      }; // helper validators


      var domain = function domain() {
        return nullSafeChain(this, domainValidator);
      };

      var minimumInteger = function minimumInteger(minValue) {
        return nullSafeChain(this, createMinimumValidator("an integer", minValue));
      };

      var minimumNumber = function minimumNumber(minValue) {
        return nullSafeChain(this, createMinimumValidator("a number", minValue));
      };

      var integer = function integer() {
        return nullSafeChain(this, integerValidator, {
          minimum: minimumInteger
        });
      };

      var nonEmptyString = function nonEmptyString() {
        return nullSafeChain(this, createNonEmptyValidator("a non-empty string"));
      };

      var nonEmptyArray = function nonEmptyArray() {
        return nullSafeChain(this, createNonEmptyValidator("a non-empty array"));
      };

      var nonEmptyObject = function nonEmptyObject() {
        return nullSafeChain(this, createNonEmptyValidator("a non-empty object"));
      };

      var regexp = function regexp() {
        return nullSafeChain(this, regexpValidator);
      };

      var unique = function createUnique() {
        return nullSafeChain(this, createUniqueValidator());
      }; // top-level validators.  These are the first functions that are called to create a validator.


      var anyOf = function anyOf(validators, message) {
        // use chain here because we don't want to accept null or undefined unless at least
        // one of the validators accept null or undefined.
        return chain(this, createAnyOfValidator(validators, message));
      };

      var anything = function anything() {
        return nullSafeChain(this, base);
      };

      var arrayOf = function arrayOf(elementValidator) {
        return nullSafeChain(this, createArrayOfValidator(elementValidator), {
          nonEmpty: nonEmptyArray
        });
      };

      var _boolean = function _boolean2() {
        return nullSafeChain(this, booleanValidator);
      };

      var callback = function callback() {
        return nullSafeChain(this, callbackValidator);
      };

      var literal = function literal(literalValue) {
        return nullSafeChain(this, createLiteralValidator(literalValue));
      };

      var number = function number() {
        return nullSafeChain(this, numberValidator, {
          minimum: minimumNumber,
          integer: integer,
          unique: unique
        });
      };

      var mapOfValues = function mapOfValues(valuesValidator) {
        return nullSafeChain(this, createMapOfValuesValidator(valuesValidator), {
          nonEmpty: nonEmptyObject
        });
      };

      var objectOf = function objectOf(schema) {
        var noUnknownFields = function noUnknownFields() {
          return nullSafeChain(this, createNoUnknownFieldsValidator(schema));
        };

        return nullSafeChain(this, createObjectOfValidator(schema), {
          noUnknownFields: noUnknownFields,
          nonEmpty: nonEmptyObject
        });
      };

      var string = function string() {
        return nullSafeChain(this, stringValidator, {
          regexp: regexp,
          domain: domain,
          nonEmpty: nonEmptyString,
          unique: unique
        });
      };

      var boundAnyOf = anyOf.bind(base);
      var boundAnything = anything.bind(base);
      var boundArrayOf = arrayOf.bind(base);

      var boundBoolean = _boolean.bind(base);

      var boundCallback = callback.bind(base);
      var boundLiteral = literal.bind(base);
      var boundNumber = number.bind(base);
      var boundMapOfValues = mapOfValues.bind(base);
      var boundObjectOf = objectOf.bind(base);
      var boundString = string.bind(base); // compound validators

      var boundEnumOf = function boundEnumOf() {
        for (var _len = arguments.length, values = new Array(_len), _key = 0; _key < _len; _key++) {
          values[_key] = arguments[_key];
        }

        return boundAnyOf(values.map(boundLiteral), "one of these values: [" + JSON.stringify(values) + "]");
      };

      var AMBIGUOUS = "ambiguous";
      var AUTHENTICATED = "authenticated";
      var LOGGED_OUT = "loggedOut";
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
      })).required());
      /*
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

      var values = function values(obj) {
        return Object.keys(obj).map(function (key) {
          return obj[key];
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

      var createLogController = function createLogController(_ref) {
        var console = _ref.console,
            locationSearch = _ref.locationSearch,
            createLogger = _ref.createLogger,
            instanceName = _ref.instanceName,
            createNamespacedStorage = _ref.createNamespacedStorage,
            getMonitors = _ref.getMonitors;
        var parsedQueryString = queryString__default['default'].parse(locationSearch);
        var storage = createNamespacedStorage("instance." + instanceName + ".");
        var debugSessionValue = storage.session.getItem("debug");
        var debugEnabled = debugSessionValue === "true";
        var debugEnabledWritableFromConfig = debugSessionValue === null;

        var getDebugEnabled = function getDebugEnabled() {
          return debugEnabled;
        };

        var setDebugEnabled = function setDebugEnabled(value, _ref2) {
          var fromConfig = _ref2.fromConfig;

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
          setDebugEnabled: setDebugEnabled,
          logger: createLogger({
            getDebugEnabled: getDebugEnabled,
            context: {
              instanceName: instanceName
            },
            getMonitors: getMonitors,
            console: console
          }),
          createComponentLogger: function createComponentLogger(componentName) {
            return createLogger({
              getDebugEnabled: getDebugEnabled,
              context: {
                instanceName: instanceName,
                componentName: componentName
              },
              getMonitors: getMonitors,
              console: console
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
      // TO-DOCUMENT: Lifecycle hooks and their params.


      var hookNames = [// Called after all components have been registered.
      "onComponentsRegistered", // Called before an event is sent on a data collection request
      "onBeforeEvent", // Called before each data collection request
      // (`interact` or `collect` endpoints)
      "onBeforeDataCollectionRequest", // Called before each request is made to the edge.
      "onBeforeRequest", // Called after each response is returned from the edge with a successful
      // status code
      "onResponse", // Called after a network request to the edge fails. Either the request
      // didn't make it to the edge, didn't make it to Konductor, or Konductor
      // failed to return a regularly-structured response. (In this case { error }
      // is passed as the parameter)
      // Also called when the respone returns a 400 or 500 error. (In this case
      // { response } is passed as the parameter)
      "onRequestFailure", // A user clicked on an element.
      "onClick"];

      var createHook = function createHook(componentRegistry, hookName) {
        return function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return Promise.all(componentRegistry.getLifecycleCallbacks(hookName).map(function (callback) {
            return new Promise(function (resolve) {
              resolve(callback.apply(void 0, args));
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


      var guardHook = function guardHook(fn) {
        return function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return Promise.resolve().then(function () {
            return fn.apply(void 0, args);
          });
        };
      };

      var createLifecycle = function createLifecycle(componentRegistry) {
        return hookNames.reduce(function (memo, hookName) {
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


      var wrapForErrorHandling = function wrapForErrorHandling(fn, stackMessage) {
        return function () {
          var result;

          try {
            result = fn.apply(void 0, arguments);
          } catch (error) {
            throw stackError({
              error: error,
              message: stackMessage
            });
          }

          if (result instanceof Promise) {
            result = result["catch"](function (error) {
              throw stackError({
                error: error,
                message: stackMessage
              });
            });
          }

          return result;
        };
      }; // TO-DOCUMENT: All public commands and their signatures.


      var createComponentRegistry = function createComponentRegistry() {
        var commandsByName = {};
        var lifecycleCallbacksByName = {};

        var registerComponentCommands = function registerComponentCommands(namespace) {
          var componentCommandsByName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var conflictingCommandNames = intersection(Object.keys(commandsByName), Object.keys(componentCommandsByName));

          if (conflictingCommandNames.length) {
            throw new Error("[ComponentRegistry] Could not register " + namespace + " " + ("because it has existing command(s): " + conflictingCommandNames.join(",")));
          }

          Object.keys(componentCommandsByName).forEach(function (commandName) {
            var command = componentCommandsByName[commandName];
            command.commandName = commandName;
            command.run = wrapForErrorHandling(command.run, "[" + namespace + "] An error occurred while executing the " + commandName + " command.");
            commandsByName[commandName] = command;
          });
        };

        var registerLifecycleCallbacks = function registerLifecycleCallbacks(namespace) {
          var componentLifecycleCallbacksByName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          Object.keys(componentLifecycleCallbacksByName).forEach(function (hookName) {
            lifecycleCallbacksByName[hookName] = lifecycleCallbacksByName[hookName] || [];
            lifecycleCallbacksByName[hookName].push(wrapForErrorHandling(componentLifecycleCallbacksByName[hookName], "[" + namespace + "] An error occurred while executing the " + hookName + " lifecycle hook."));
          });
        };

        return {
          register: function register(namespace, component) {
            var commands = component.commands,
                lifecycle = component.lifecycle;
            registerComponentCommands(namespace, commands);
            registerLifecycleCallbacks(namespace, lifecycle);
          },
          getCommand: function getCommand(commandName) {
            return commandsByName[commandName];
          },
          getCommandNames: function getCommandNames() {
            return Object.keys(commandsByName);
          },
          getLifecycleCallbacks: function getLifecycleCallbacks(hookName) {
            return lifecycleCallbacksByName[hookName] || [];
          }
        };
      };

      var injectSendNetworkRequest = function injectSendNetworkRequest(_ref) {
        var logger = _ref.logger,
            networkStrategy = _ref.networkStrategy,
            isRetryableHttpStatusCode = _ref.isRetryableHttpStatusCode;
        /**
         * Send a network request and returns details about the response.
         *
         * @param {Object} payload This will be JSON stringified and sent as the post body.
         * @param {String} url The URL to which the request should be sent.
         * @param {String} requestID A unique ID for the request.
         */

        return function (_ref2) {
          var payload = _ref2.payload,
              url = _ref2.url,
              requestId = _ref2.requestId;
          var stringifiedPayload = JSON.stringify(payload); // We want to log raw payload and event data rather than
          // our fancy wrapper objects. Calling payload.toJSON() is
          // insufficient to get all the nested raw data, because it's
          // not recursive (it doesn't call toJSON() on the event objects).
          // Parsing the result of JSON.stringify(), however, gives the
          // fully recursive raw data.
          // JSON.parse is expensive so we short circuit if logging is disabled.

          if (logger.enabled) {
            logger.logOnBeforeNetworkRequest({
              url: url,
              requestId: requestId,
              payload: JSON.parse(stringifiedPayload)
            });
          }

          var executeRequest = function executeRequest() {
            var retriesAttempted = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            return networkStrategy({
              url: url,
              body: stringifiedPayload,
              documentMayUnload: payload.getDocumentMayUnload()
            }).then(function (response) {
              if (isRetryableHttpStatusCode(response.status) && retriesAttempted < 3) {
                return executeRequest(retriesAttempted + 1);
              }

              var parsedBody;

              try {
                parsedBody = JSON.parse(response.body);
              } catch (e) {// Non-JSON. Something went wrong.
              }

              logger.logOnNetworkResponse(_objectSpread2({
                requestId: requestId,
                url: url,
                payload: JSON.parse(stringifiedPayload)
              }, response, {
                parsedBody: parsedBody,
                retriesAttempted: retriesAttempted
              }));
              return {
                statusCode: response.status,
                body: response.body,
                parsedBody: parsedBody
              };
            });
          };

          return executeRequest()["catch"](function (error) {
            logger.logOnNetworkError({
              requestId: requestId,
              url: url,
              payload: JSON.parse(stringifiedPayload),
              error: error
            });
            throw stackError({
              error: error,
              message: "Network request failed."
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


      var DECLINED_CONSENT = "The user declined consent.";
      var DECLINED_CONSENT_ERROR_CODE = "declinedConsent";

      var createDeclinedConsentError = function createDeclinedConsentError() {
        var error = new Error(DECLINED_CONSENT);
        error.code = DECLINED_CONSENT_ERROR_CODE;
        return error;
      };

      var createConsentStateMachine = function createConsentStateMachine() {
        var deferreds = [];

        var runAll = function runAll() {
          while (deferreds.length) {
            deferreds.shift().resolve();
          }
        };

        var discardAll = function discardAll() {
          while (deferreds.length) {
            deferreds.shift().reject(createDeclinedConsentError());
          }
        };

        var awaitIn = function awaitIn() {
          return Promise.resolve();
        };

        var awaitOut = function awaitOut() {
          return Promise.reject(createDeclinedConsentError());
        };

        var awaitPending = function awaitPending() {
          var deferred = defer();
          deferreds.push(deferred);
          return deferred.promise;
        };

        return {
          "in": function _in() {
            runAll();
            this.awaitConsent = awaitIn;
          },
          out: function out() {
            discardAll();
            this.awaitConsent = awaitOut;
          },
          pending: function pending() {
            this.awaitConsent = awaitPending;
          },
          awaitConsent: awaitPending
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


      var IN = "in";
      var OUT = "out";
      var PENDING = "pending";
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
      // eslint-disable-next-line import/prefer-default-export

      var GENERAL = "general";
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

      var createConsent = function createConsent(_ref) {
        var generalConsentState = _ref.generalConsentState,
            logger = _ref.logger;
        return {
          setConsent: function setConsent(consentByPurpose) {
            switch (consentByPurpose[GENERAL]) {
              case IN:
                generalConsentState["in"]();
                break;

              case OUT:
                logger.warn("Some commands may fail. " + DECLINED_CONSENT);
                generalConsentState.out();
                break;

              case PENDING:
                logger.warn("Some commands may be delayed until the user consents.");
                generalConsentState.pending();
                break;

              default:
                logger.warn("Unknown consent value: " + consentByPurpose[GENERAL]);
                break;
            }
          },
          suspend: function suspend() {
            generalConsentState.pending();
          },
          awaitConsent: function awaitConsent() {
            return generalConsentState.awaitConsent();
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


      var createEvent = function createEvent() {
        var content = {};
        var userXdm;
        var userData;
        var _documentMayUnload = false;
        var lastChanceCallback;
        var event = {
          setUserXdm: function setUserXdm(value) {
            userXdm = value;
          },
          setUserData: function setUserData(value) {
            userData = value;
          },
          mergeXdm: createMerger(content, "xdm"),
          mergeMeta: createMerger(content, "meta"),
          mergeQuery: createMerger(content, "query"),
          documentMayUnload: function documentMayUnload() {
            _documentMayUnload = true;
          },
          getDocumentMayUnload: function getDocumentMayUnload() {
            return _documentMayUnload;
          },
          isEmpty: function isEmpty() {
            return isEmptyObject(content) && (!userXdm || isEmptyObject(userXdm)) && (!userData || isEmptyObject(userData));
          },
          setLastChanceCallback: function setLastChanceCallback(value) {
            lastChanceCallback = value;
          },
          getViewName: function getViewName() {
            if (!userXdm || !userXdm.web || !userXdm.web.webPageDetails) {
              return undefined;
            }

            return userXdm.web.webPageDetails.viewName;
          },
          toJSON: function toJSON() {
            if (userXdm) {
              event.mergeXdm(userXdm);
            }

            if (userData) {
              content.data = userData;
            }

            if (lastChanceCallback) {
              // We clone these because if lastChanceCallback throws an error, we don't
              // want any modifications lastChanceCallback made to actually be applied.
              var xdm = clone(content.xdm || {});
              var data = clone(content.data || {});

              try {
                lastChanceCallback({
                  xdm: xdm,
                  data: data
                }); // If onBeforeEventSend throws an exception,
                // we don't want to apply the changes it made
                // so setting content.xdm and content.data is inside this try
                // We only set content.xdm if content.xdm was already set or
                // if content.xdm was empty and the lastChanceCallback added items to it.

                if (content.xdm || !isEmptyObject(xdm)) {
                  content.xdm = xdm;
                }

                if (content.data || !isEmptyObject(data)) {
                  content.data = data;
                }
              } catch (e) {// the callback should have already logged the exception
              }
            }

            return content;
          }
        };
        return event;
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
       * Creates a representation of a gateway response with the addition of
       * helper methods.
       * @returns Response
       */


      var createResponse = function createResponse() {
        var content = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var _content$handle = content.handle,
            handle = _content$handle === void 0 ? [] : _content$handle,
            _content$errors = content.errors,
            errors = _content$errors === void 0 ? [] : _content$errors,
            _content$warnings = content.warnings,
            warnings = _content$warnings === void 0 ? [] : _content$warnings;
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
          getPayloadsByType: function getPayloadsByType(type) {
            return flatMap(handle.filter(function (fragment) {
              return fragment.type === type;
            }), function (fragment) {
              return fragment.payload;
            });
          },

          /**
           * Returns all errors.
           */
          getErrors: function getErrors() {
            return errors;
          },

          /**
           * Returns all warnings.
           */
          getWarnings: function getWarnings() {
            return warnings;
          },
          toJSON: function toJSON() {
            return content;
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


      var coreCommands = {
        CONFIGURE: "configure",
        SET_DEBUG: "setDebug"
      };

      var injectExecuteCommand = function injectExecuteCommand(_ref) {
        var logger = _ref.logger,
            configureCommand = _ref.configureCommand,
            setDebugCommand = _ref.setDebugCommand,
            handleError = _ref.handleError,
            validateCommandOptions = _ref.validateCommandOptions;
        var configurePromise;

        var getExecutor = function getExecutor(commandName, options) {
          var executor;

          if (commandName === coreCommands.CONFIGURE) {
            if (configurePromise) {
              throw new Error("The library has already been configured and may only be configured once.");
            }

            executor = function executor() {
              configurePromise = configureCommand(options);
              return configurePromise;
            };
          } else {
            if (!configurePromise) {
              throw new Error("The library must be configured first. Please do so by executing the configure command.");
            }

            if (commandName === coreCommands.SET_DEBUG) {
              executor = function executor() {
                return setDebugCommand(options);
              };
            } else {
              executor = function executor() {
                return configurePromise.then(function (componentRegistry) {
                  var command = componentRegistry.getCommand(commandName);

                  if (!command || !isFunction(command.run)) {
                    var commandNames = values(coreCommands).concat(componentRegistry.getCommandNames()).join(", ");
                    throw new Error("The " + commandName + " command does not exist. List of available commands: " + commandNames + ".");
                  }

                  var validatedOptions = validateCommandOptions({
                    command: command,
                    options: options
                  });
                  return command.run(validatedOptions);
                }, function () {
                  logger.warn("An error during configuration is preventing the " + commandName + " command from executing."); // If configuration failed, we prevent the configuration
                  // error from bubbling here because we don't want the
                  // configuration error to be reported in the console every
                  // time any command is executed. Only having it bubble
                  // once when the configure command runs is sufficient.
                  // Instead, for this command, we'll just return a promise
                  // that never gets resolved.

                  return new Promise(function () {});
                });
              };
            }
          }

          return executor;
        };

        return function (commandName) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return new Promise(function (resolve) {
            // We have to wrap the getExecutor() call in the promise so the promise
            // will be rejected if getExecutor() throws errors.
            var executor = getExecutor(commandName, options);
            logger.logOnBeforeCommand({
              commandName: commandName,
              options: options
            });
            resolve(executor());
          }).then(function (result) {
            // We should always be returning an object from every command.
            return isObject(result) ? result : {};
          })["catch"](function (error) {
            return handleError(error, commandName + " command");
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


      var COMMAND_DOC_URI = "https://adobe.ly/2UH0qO7";

      var validateCommandOptions = function validateCommandOptions(_ref) {
        var command = _ref.command,
            options = _ref.options;
        var commandName = command.commandName,
            _command$documentatio = command.documentationUri,
            documentationUri = _command$documentatio === void 0 ? COMMAND_DOC_URI : _command$documentatio,
            optionsValidator = command.optionsValidator;
        var validatedOptions = options;

        if (optionsValidator) {
          try {
            validatedOptions = optionsValidator(options);
          } catch (validationError) {
            var invalidOptionsMessage = "Invalid " + commandName + " command options:\n\t - " + validationError + " For command documentation see: " + documentationUri;
            throw new Error(invalidOptionsMessage);
          }
        }

        return validatedOptions;
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
       * @param {*} logger
       * @returns {*} Validated options
       */


      var validateUserEventOptions = function validateUserEventOptions(_ref) {
        var options = _ref.options,
            logger = _ref.logger;
        var eventOptionsValidator = boundObjectOf({
          type: boundString(),
          xdm: boundObjectOf({
            eventType: boundString(),
            identityMap: validateIdentityMap
          }),
          data: boundObjectOf({}),
          renderDecisions: boundBoolean(),
          decisionScopes: boundArrayOf(boundString()),
          datasetId: boundString()
        }).required();
        var validatedOptions = eventOptionsValidator(options);
        var type = validatedOptions.type,
            xdm = validatedOptions.xdm;

        if (xdm && !xdm.eventType && !type) {
          logger.warn("No type or xdm.eventType specified.");
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


      var createDataCollector = function createDataCollector(_ref) {
        var eventManager = _ref.eventManager,
            logger = _ref.logger;
        return {
          commands: {
            sendEvent: {
              documentationUri: "https://adobe.ly/2r0uUjh",
              optionsValidator: function optionsValidator(options) {
                return validateUserEventOptions({
                  options: options,
                  logger: logger
                });
              },
              run: function run(options) {
                var xdm = options.xdm,
                    data = options.data,
                    _options$documentUnlo = options.documentUnloading,
                    documentUnloading = _options$documentUnlo === void 0 ? false : _options$documentUnlo,
                    type = options.type,
                    mergeId = options.mergeId,
                    _options$renderDecisi = options.renderDecisions,
                    renderDecisions = _options$renderDecisi === void 0 ? false : _options$renderDecisi,
                    _options$decisionScop = options.decisionScopes,
                    decisionScopes = _options$decisionScop === void 0 ? [] : _options$decisionScop,
                    datasetId = options.datasetId;
                var event = eventManager.createEvent();

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

                if (datasetId) {
                  event.mergeMeta({
                    collect: {
                      datasetId: datasetId
                    }
                  });
                }

                return eventManager.sendEvent(event, {
                  renderDecisions: renderDecisions,
                  decisionScopes: decisionScopes
                });
              }
            }
          }
        };
      };

      createDataCollector.namespace = "DataCollector";
      createDataCollector.configValidators = {};
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var createClickHandler = function createClickHandler(_ref) {
        var eventManager = _ref.eventManager,
            lifecycle = _ref.lifecycle,
            handleError = _ref.handleError;
        return function (clickEvent) {
          // TODO: Consider safeguarding from the same object being clicked multiple times in rapid succession?
          var clickedElement = clickEvent.target;
          var event = eventManager.createEvent();
          return lifecycle.onClick({
            event: event,
            clickedElement: clickedElement
          }).then(function () {
            if (event.isEmpty()) {
              return Promise.resolve();
            }

            return eventManager.sendEvent(event);
          }) // eventManager.sendEvent() will return a promise resolved to an
          // object and we want to avoid returning any value to the customer
          .then(noop)["catch"](function (error) {
            handleError(error, "click collection");
          });
        };
      };

      var attachClickActivityCollector = function attachClickActivityCollector(_ref2) {
        var config = _ref2.config,
            eventManager = _ref2.eventManager,
            lifecycle = _ref2.lifecycle,
            handleError = _ref2.handleError;
        var enabled = config.clickCollectionEnabled;

        if (!enabled) {
          return;
        }

        var clickHandler = createClickHandler({
          eventManager: eventManager,
          lifecycle: lifecycle,
          handleError: handleError
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


      var configValidators = {
        clickCollectionEnabled: boundBoolean()["default"](true),
        downloadLinkQualifier: boundString().regexp()["default"]("\\.(exe|zip|wav|mp3|mov|mpg|avi|wmv|pdf|doc|docx|xls|xlsx|ppt|pptx)$")
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

      var urlStartsWithScheme = function urlStartsWithScheme(url) {
        return url && /^[a-z0-9]+:\/\//i.test(url);
      };

      var getAbsoluteUrlFromAnchorElement = function getAbsoluteUrlFromAnchorElement(window, element) {
        var loc = window.location;
        var url = element.href ? element.href : "";
        var protocol = element.protocol,
            host = element.host;

        if (!urlStartsWithScheme(url)) {
          if (!protocol) {
            protocol = loc.protocol ? loc.protocol : "";
          }

          protocol = protocol ? protocol + "//" : "";

          if (!host) {
            host = loc.host ? loc.host : "";
          }

          var path = "";

          if (url.substring(0, 1) !== "/") {
            var indx = loc.pathname.lastIndexOf("/");
            indx = indx < 0 ? 0 : indx;
            path = loc.pathname.substring(0, indx);
          }

          url = "" + protocol + host + path + "/" + url;
        }

        return url;
      };

      var isSupportedAnchorElement = function isSupportedAnchorElement(element) {
        if (element.href && (element.tagName === "A" || element.tagName === "AREA") && (!element.onclick || !element.protocol || element.protocol.toLowerCase().indexOf("javascript") < 0)) {
          return true;
        }

        return false;
      };

      var isDownloadLink = function isDownloadLink(downloadLinkQualifier, linkUrl, clickedObj) {
        var re = new RegExp(downloadLinkQualifier);
        return clickedObj.download ? true : re.test(linkUrl.toLowerCase());
      };

      var isExitLink = function isExitLink(window, linkUrl) {
        var currentHostname = window.location.hostname.toLowerCase();

        if (linkUrl.toLowerCase().indexOf(currentHostname) >= 0) {
          return false;
        }

        return true;
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


      var determineLinkType = function determineLinkType(window, config, linkUrl, clickedObj) {
        var linkType = "other";

        if (isDownloadLink(config.downloadLinkQualifier, linkUrl, clickedObj)) {
          linkType = "download";
        } else if (isExitLink(window, linkUrl)) {
          linkType = "exit";
        }

        return linkType;
      };

      var findSupportedAnchorElement = function findSupportedAnchorElement(targetElement) {
        var node = targetElement;

        while (node) {
          if (isSupportedAnchorElement(node)) {
            return node;
          }

          node = node.parentNode;
        }

        return null;
      };

      var createLinkClick = function createLinkClick(window, config) {
        return function (event, targetElement) {
          // Search parent elements for an anchor element
          // TODO: Replace with generic DOM tool that can fetch configured properties
          var anchorElement = findSupportedAnchorElement(targetElement);

          if (!anchorElement) {
            return;
          }

          var linkUrl = getAbsoluteUrlFromAnchorElement(window, anchorElement);

          if (!linkUrl) {
            return;
          }

          var linkType = determineLinkType(window, config, linkUrl, anchorElement); // TODO: Update link name from the clicked element context

          var linkName = "Link Click";
          event.documentMayUnload();
          event.mergeXdm({
            eventType: "web.webinteraction.linkClicks",
            web: {
              webInteraction: {
                name: linkName,
                type: linkType,
                URL: linkUrl,
                linkClicks: {
                  value: 1
                }
              }
            }
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


      var createActivityCollector = function createActivityCollector(_ref) {
        var config = _ref.config,
            eventManager = _ref.eventManager,
            handleError = _ref.handleError;
        var linkClick = createLinkClick(window, config);
        return {
          lifecycle: {
            onComponentsRegistered: function onComponentsRegistered(tools) {
              var lifecycle = tools.lifecycle;
              attachClickActivityCollector({
                config: config,
                eventManager: eventManager,
                lifecycle: lifecycle,
                handleError: handleError
              }); // TODO: createScrollActivityCollector ...
            },
            onClick: function onClick(_ref2) {
              var event = _ref2.event,
                  clickedElement = _ref2.clickedElement;
              linkClick(event, clickedElement);
            }
          }
        };
      };

      createActivityCollector.namespace = "ActivityCollector";
      createActivityCollector.configValidators = configValidators;
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var createResultLogMessage = function createResultLogMessage(idSync, success) {
        return "ID sync " + (success ? "succeeded" : "failed") + ": " + idSync.spec.url;
      };

      var injectProcessIdSyncs = function injectProcessIdSyncs(_ref) {
        var fireReferrerHideableImage = _ref.fireReferrerHideableImage,
            logger = _ref.logger;
        return function (idSyncs) {
          var urlIdSyncs = idSyncs.filter(function (idSync) {
            return idSync.type === "url";
          });

          if (!urlIdSyncs.length) {
            return Promise.resolve();
          }

          return Promise.all(urlIdSyncs.map(function (idSync) {
            return fireReferrerHideableImage(idSync.spec).then(function () {
              logger.log(createResultLogMessage(idSync, true));
            })["catch"](function () {
              // We intentionally do not throw an error if id syncs fail. We
              // consider it a non-critical failure and therefore do not want it to
              // reject the promise handed back to the customer.
              logger.error(createResultLogMessage(idSync, false));
            });
          })).then(noop);
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


      var configValidators$1 = {
        thirdPartyCookiesEnabled: boundBoolean()["default"](true),
        idMigrationEnabled: boundBoolean()["default"](true)
      }; // Not much need to validate since we are our own consumer.

      configValidators$1.reactorRegisterGetEcid = boundCallback()["default"](function () {});
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

      var getIdentityOptionsValidator = function getIdentityOptionsValidator(options) {
        var getIdentityOptionsValidator = boundObjectOf({
          namespaces: boundArrayOf(boundLiteral("ECID")).nonEmpty()
        }).noUnknownFields();
        getIdentityOptionsValidator(options); // Return default options for now
        // To-Do: Accept namespace from given options

        return {
          namespaces: ["ECID"]
        };
      };

      var createComponent = function createComponent(_ref) {
        var addEcidQueryToPayload = _ref.addEcidQueryToPayload,
            ensureSingleIdentity = _ref.ensureSingleIdentity,
            setLegacyEcid = _ref.setLegacyEcid,
            handleResponseForIdSyncs = _ref.handleResponseForIdSyncs,
            getEcidFromResponse = _ref.getEcidFromResponse,
            getIdentity = _ref.getIdentity,
            consent = _ref.consent;
        var ecid;
        return {
          lifecycle: {
            onBeforeRequest: function onBeforeRequest(_ref2) {
              var payload = _ref2.payload,
                  onResponse = _ref2.onResponse,
                  onRequestFailure = _ref2.onRequestFailure; // Querying the ECID on every request to be able to set the legacy cookie, and make it
              // available for the `getIdentity` command.

              addEcidQueryToPayload(payload);
              return ensureSingleIdentity({
                payload: payload,
                onResponse: onResponse,
                onRequestFailure: onRequestFailure
              });
            },
            onResponse: function onResponse(_ref3) {
              var response = _ref3.response;

              if (!ecid) {
                ecid = getEcidFromResponse(response); // Only data collection calls will have an ECID in the response.
                // https://jira.corp.adobe.com/browse/EXEG-1234

                if (ecid) {
                  setLegacyEcid(ecid);
                }
              }

              return handleResponseForIdSyncs(response);
            }
          },
          commands: {
            getIdentity: {
              optionsValidator: getIdentityOptionsValidator,
              run: function run(options) {
                return consent.awaitConsent().then(function () {
                  return ecid ? undefined : getIdentity(options.namespaces);
                }).then(function () {
                  return {
                    identity: {
                      ECID: ecid
                    }
                  };
                });
              }
            }
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
      // Maybe default the domain in the cookieJar to apex while allowing overrides.


      var apexDomain = getApexDomain(window, cookie__default['default']);
      /**
       * Handles migration of ECID to and from Visitor.js.
       */

      var createLegacyIdentity = function createLegacyIdentity(_ref) {
        var config = _ref.config,
            getEcidFromVisitor = _ref.getEcidFromVisitor;
        var idMigrationEnabled = config.idMigrationEnabled,
            orgId = config.orgId;
        var amcvCookieName = "AMCV_" + orgId;

        var getEcidFromLegacyCookies = function getEcidFromLegacyCookies() {
          var ecid = null;
          var secidCookieName = "s_ecid";
          var legacyEcidCookieValue = cookie__default['default'].get(secidCookieName) || cookie__default['default'].get(amcvCookieName);

          if (legacyEcidCookieValue) {
            var reg = /(^|\|)MCMID\|(\d+)($|\|)/;
            var matches = legacyEcidCookieValue.match(reg);

            if (matches) {
              // Destructuring arrays breaks in IE
              ecid = matches[2];
            }
          }

          return ecid;
        };

        return {
          getEcid: function getEcid() {
            if (idMigrationEnabled) {
              var ecid = getEcidFromLegacyCookies();

              if (ecid) {
                return Promise.resolve(ecid);
              }

              return getEcidFromVisitor();
            }

            return Promise.resolve();
          },
          setEcid: function setEcid(ecid) {
            if (idMigrationEnabled && !cookie__default['default'].get(amcvCookieName)) {
              cookie__default['default'].set(amcvCookieName, "MCMID|" + ecid, {
                domain: apexDomain,
                // Without `expires` this will be a session cookie.
                expires: 390 // days, or 13 months.

              });
            }
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


      var awaitVisitorOptIn = function awaitVisitorOptIn(_ref) {
        var logger = _ref.logger;
        return new Promise(function (resolve, reject) {
          if (isObject(window.adobe) && isObject(window.adobe.optIn)) {
            var optInOld = window.adobe.optIn;
            logger.log("Delaying request while waiting for legacy opt-in to let Visitor retrieve ECID from server.");
            optInOld.fetchPermissions(function () {
              if (optInOld.isApproved([optInOld.Categories.ECID])) {
                logger.log("Received legacy opt-in approval to let Visitor retrieve ECID from server.");
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


      var getVisitor = function getVisitor(window) {
        var Visitor = window.Visitor;
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


      var injectGetEcidFromVisitor = function injectGetEcidFromVisitor(_ref) {
        var logger = _ref.logger,
            orgId = _ref.orgId,
            awaitVisitorOptIn = _ref.awaitVisitorOptIn;
        var Visitor = getVisitor(window);
        return function () {
          if (Visitor) {
            // Need to explicitly wait for optIn because visitor will call callback
            // with invalid values prior to optIn being approved
            return awaitVisitorOptIn({
              logger: logger
            }).then(function () {
              logger.log("Delaying request while using Visitor to retrieve ECID from server.");
              return new Promise(function (resolve) {
                var visitor = Visitor.getInstance(orgId, {});
                visitor.getMarketingCloudVisitorID(function (ecid) {
                  logger.log("Resuming previously delayed request that was waiting for ECID from Visitor.");
                  resolve(ecid);
                }, true);
              });
            })["catch"](function (error) {
              // If consent was denied, get the ECID from experience edge. OptIn and AEP Web SDK
              // consent should operate independently, but during id migration AEP Web SDK needs
              // to wait for optIn object consent resolution so that only one ECID is generated.
              if (error) {
                logger.log(error.message + ", retrieving ECID from experience edge");
              } else {
                logger.log("An error occurred while obtaining the ECID from Visitor.");
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


      var injectHandleResponseForIdSyncs = function injectHandleResponseForIdSyncs(_ref) {
        var processIdSyncs = _ref.processIdSyncs;
        return function (response) {
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


      var injectEnsureSingleIdentity = function injectEnsureSingleIdentity(_ref) {
        var doesIdentityCookieExist = _ref.doesIdentityCookieExist,
            setDomainForInitialIdentityPayload = _ref.setDomainForInitialIdentityPayload,
            addLegacyEcidToPayload = _ref.addLegacyEcidToPayload,
            awaitIdentityCookie = _ref.awaitIdentityCookie,
            logger = _ref.logger;
        var obtainedIdentityPromise;

        var allowRequestToGoWithoutIdentity = function allowRequestToGoWithoutIdentity(payload) {
          setDomainForInitialIdentityPayload(payload);
          return addLegacyEcidToPayload(payload);
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


        return function (_ref2) {
          var payload = _ref2.payload,
              onResponse = _ref2.onResponse,
              onRequestFailure = _ref2.onRequestFailure;

          if (doesIdentityCookieExist()) {
            return Promise.resolve();
          }

          if (obtainedIdentityPromise) {
            // We don't have an identity cookie, but at least one request has
            // been sent to get it. Konductor may set the identity cookie in the
            // response. We will hold up this request until the last request
            // requiring identity returns and awaitIdentityCookie confirms the
            // identity was set.
            logger.log("Delaying request while retrieving ECID from server.");
            var previousObtainedIdentityPromise = obtainedIdentityPromise; // This promise resolves when we have an identity cookie. Additional
            // requests are chained together so that only one is sent at a time
            // until we have the identity cookie.

            obtainedIdentityPromise = previousObtainedIdentityPromise["catch"](function () {
              return awaitIdentityCookie({
                onResponse: onResponse,
                onRequestFailure: onRequestFailure
              });
            }); // When this returned promise resolves, the request will go out.

            return previousObtainedIdentityPromise.then(function () {
              logger.log("Resuming previously delayed request.");
            }) // If Konductor did not set the identity cookie on the previous
            // request, then awaitIdentityCookie will reject its promise.
            // Catch the rejection here and allow this request to go out.
            ["catch"](function () {
              return allowRequestToGoWithoutIdentity(payload);
            });
          } // For Alloy+Konductor communication to be as robust as possible and
          // to ensure we don't mint new ECIDs for requests that would otherwise
          // be sent in parallel, we'll let this request go out to fetch the
          // cookie


          obtainedIdentityPromise = awaitIdentityCookie({
            onResponse: onResponse,
            onRequestFailure: onRequestFailure
          });
          return allowRequestToGoWithoutIdentity(payload);
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

      var addEcidQueryToPayload = function addEcidQueryToPayload(payload) {
        payload.mergeQuery({
          identity: {
            fetch: [ecidNamespace]
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


      var IDENTITY = "identity";
      var CONSENT = "consent";
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

      var injectDoesIdentityCookieExist = function injectDoesIdentityCookieExist(_ref) {
        var orgId = _ref.orgId;
        var identityCookieName = getNamespacedCookieName(orgId, IDENTITY);
        /**
         * Returns whether the identity cookie exists.
         */

        return function () {
          return Boolean(cookie__default['default'].get(identityCookieName));
        };
      };

      var matchUserAgent = function matchUserAgent(regexs) {
        return function (userAgent) {
          var keys = Object.keys(regexs);

          for (var i = 0; i < keys.length; i += 1) {
            var key = keys[i];
            var regex = regexs[key];

            if (regex.test(userAgent)) {
              return key;
            }
          }

          return UNKNOWN;
        };
      };

      var getBrowser = memoize(function (window) {
        var _matchUserAgent;

        return matchUserAgent((_matchUserAgent = {}, _defineProperty(_matchUserAgent, EDGE, /Edge\/([0-9\._]+)/), _defineProperty(_matchUserAgent, EDGE_CHROMIUM, /Edg\/([0-9\.]+)/), _defineProperty(_matchUserAgent, CHROME, /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/), _defineProperty(_matchUserAgent, FIREFOX, /Firefox\/([0-9\.]+)(?:\s|$)/), _defineProperty(_matchUserAgent, IE, /Trident\/7\.0.*rv\:([0-9\.]+).*\).*Gecko$/), _defineProperty(_matchUserAgent, SAFARI, /Version\/([0-9\._]+).*Safari/), _matchUserAgent))(window.navigator.userAgent);
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

      var injectSetDomainForInitialIdentityPayload = function injectSetDomainForInitialIdentityPayload(_ref) {
        var thirdPartyCookiesEnabled = _ref.thirdPartyCookiesEnabled,
            areThirdPartyCookiesSupportedByDefault = _ref.areThirdPartyCookiesSupportedByDefault;
        return function (payload) {
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
            payload.useIdThirdPartyDomain();
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


      var injectAddLegacyEcidToPayload = function injectAddLegacyEcidToPayload(_ref) {
        var getLegacyEcid = _ref.getLegacyEcid,
            addEcidToPayload = _ref.addEcidToPayload;
        return function (payload) {
          return getLegacyEcid().then(function (ecidToMigrate) {
            if (ecidToMigrate) {
              addEcidToPayload(payload, ecidToMigrate);
            }
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


      var addEcidToPayload = function addEcidToPayload(payload, ecid) {
        payload.addIdentity(ecidNamespace, {
          id: ecid
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


      var injectAwaitIdentityCookie = function injectAwaitIdentityCookie(_ref) {
        var orgId = _ref.orgId,
            doesIdentityCookieExist = _ref.doesIdentityCookieExist;
        /**
         * Returns a promise that will be resolved once an identity cookie exists.
         * If an identity cookie doesn't already exist, it should always exist after
         * the first response.
         */

        return function (_ref2) {
          var onResponse = _ref2.onResponse,
              onRequestFailure = _ref2.onRequestFailure;
          return new Promise(function (resolve, reject) {
            onResponse(function () {
              if (doesIdentityCookieExist()) {
                resolve();
              } else {
                // This logic assumes that the code setting the cookie is working as expected and that
                // the cookie was missing from the response.
                var noIdentityCookieError = new Error("An identity was not set properly. Please verify that the org ID " + orgId + " configured in Alloy matches the org ID specified in the edge configuration."); // Rejecting the promise will reject commands that were queued
                // by the Identity component while waiting on the response to
                // the initial request.

                reject(noIdentityCookieError); // Throwing an error will reject the event command that initiated
                // the request.

                throw noIdentityCookieError;
              }
            });
            onRequestFailure(function () {
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


      var getEcidFromResponse = function getEcidFromResponse(response) {
        var identityResultPayloads = response.getPayloadsByType("identity:result");
        var ecidPayload = find(identityResultPayloads, function (payload) {
          return payload.namespace && payload.namespace.code === ecidNamespace;
        });
        return ecidPayload ? ecidPayload.id : undefined;
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


      var createGetIdentity = function createGetIdentity(_ref) {
        var sendEdgeNetworkRequest = _ref.sendEdgeNetworkRequest,
            createIdentityPayload = _ref.createIdentityPayload;
        return function (namespaces) {
          return sendEdgeNetworkRequest({
            payload: createIdentityPayload(namespaces),
            action: "identity/acquire"
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
       * Creates a payload object that extends a base payload object. This is not
       * intended to be used from any modules other than "extending" payload modules.
       * @param {Function} construct A function that which will receive the content object
       * that the "subclass" can modify. The content object will be serialized when toJSON()
       * is called. The construct method should return an object whose methods will be merged on
       * on top of the methods of the base payload object.
       * @returns {Object} The extended payload object.
       */


      var createRequestPayload = function createRequestPayload(construct) {
        var content = {};
        var _useIdThirdPartyDomain = false;
        var basePayload = {
          mergeConfigOverrides: createMerger(content, "meta.configOverrides"),
          mergeState: createMerger(content, "meta.state"),
          mergeQuery: createMerger(content, "query"),
          useIdThirdPartyDomain: function useIdThirdPartyDomain() {
            _useIdThirdPartyDomain = true;
          },
          getUseIdThirdPartyDomain: function getUseIdThirdPartyDomain() {
            return _useIdThirdPartyDomain;
          },
          addIdentity: function addIdentity() {},
          getDocumentMayUnload: function getDocumentMayUnload() {
            return false;
          },
          toJSON: function toJSON() {
            return content;
          }
        };
        var extendedPayload = construct(content);
        return assign__default['default']({}, basePayload, extendedPayload);
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


      var createAddIdentity = function createAddIdentity(content) {
        return function (namespaceCode, identity) {
          content.xdm = content.xdm || {};
          content.xdm.identityMap = content.xdm.identityMap || {};
          content.xdm.identityMap[namespaceCode] = content.xdm.identityMap[namespaceCode] || [];
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


      var createIdentityPayload = function createIdentityPayload(namespaces) {
        return createRequestPayload(function (content) {
          content.query = content.query || {};
          content.query.identity = {
            fetch: namespaces
          };
          return {
            addIdentity: createAddIdentity(content)
          };
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


      var createIdentity = function createIdentity(_ref) {
        var config = _ref.config,
            logger = _ref.logger,
            consent = _ref.consent,
            sendEdgeNetworkRequest = _ref.sendEdgeNetworkRequest;
        var orgId = config.orgId,
            thirdPartyCookiesEnabled = config.thirdPartyCookiesEnabled;
        var getEcidFromVisitor = injectGetEcidFromVisitor({
          logger: logger,
          orgId: orgId,
          awaitVisitorOptIn: awaitVisitorOptIn
        });
        var legacyIdentity = createLegacyIdentity({
          config: config,
          getEcidFromVisitor: getEcidFromVisitor
        });
        var doesIdentityCookieExist = injectDoesIdentityCookieExist({
          orgId: orgId
        });
        var getIdentity = createGetIdentity({
          sendEdgeNetworkRequest: sendEdgeNetworkRequest,
          createIdentityPayload: createIdentityPayload
        });
        var setDomainForInitialIdentityPayload = injectSetDomainForInitialIdentityPayload({
          thirdPartyCookiesEnabled: thirdPartyCookiesEnabled,
          areThirdPartyCookiesSupportedByDefault: areThirdPartyCookiesSupportedByDefault
        });
        var addLegacyEcidToPayload = injectAddLegacyEcidToPayload({
          getLegacyEcid: legacyIdentity.getEcid,
          addEcidToPayload: addEcidToPayload
        });
        var awaitIdentityCookie = injectAwaitIdentityCookie({
          orgId: orgId,
          doesIdentityCookieExist: doesIdentityCookieExist
        });
        var ensureSingleIdentity = injectEnsureSingleIdentity({
          doesIdentityCookieExist: doesIdentityCookieExist,
          setDomainForInitialIdentityPayload: setDomainForInitialIdentityPayload,
          addLegacyEcidToPayload: addLegacyEcidToPayload,
          awaitIdentityCookie: awaitIdentityCookie,
          logger: logger
        });
        var processIdSyncs = injectProcessIdSyncs({
          fireReferrerHideableImage: fireReferrerHideableImage,
          logger: logger
        });
        var handleResponseForIdSyncs = injectHandleResponseForIdSyncs({
          processIdSyncs: processIdSyncs
        });
        return createComponent({
          ensureSingleIdentity: ensureSingleIdentity,
          addEcidQueryToPayload: addEcidQueryToPayload,
          setLegacyEcid: legacyIdentity.setEcid,
          handleResponseForIdSyncs: handleResponseForIdSyncs,
          getEcidFromResponse: getEcidFromResponse,
          getIdentity: getIdentity,
          consent: consent
        });
      };

      createIdentity.namespace = "Identity";
      createIdentity.configValidators = configValidators$1;
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var createResultLogMessage$1 = function createResultLogMessage(urlDestination, success) {
        return "URL destination " + (success ? "succeeded" : "failed") + ": " + urlDestination.spec.url;
      };

      var processUrls = function processUrls(fireReferrerHideableImage, logger, destinations) {
        var urlDestinations = destinations.filter(function (dest) {
          return dest.type === "url";
        });
        return Promise.all(urlDestinations.map(function (urlDestination) {
          return fireReferrerHideableImage(urlDestination.spec).then(function () {
            logger.log(createResultLogMessage$1(urlDestination, true));
          })["catch"](function () {
            // We intentionally do not throw an error if destinations fail. We
            // consider it a non-critical failure and therefore do not want it to
            // reject the promise handed back to the customer.
            logger.error(createResultLogMessage$1(urlDestination, false));
          });
        })).then(noop);
      };

      var processCookies = function processCookies(destinations) {
        var cookieDestinations = destinations.filter(function (dest) {
          return dest.type === "cookie";
        });
        cookieDestinations.forEach(function (dest) {
          var _dest$spec = dest.spec,
              name = _dest$spec.name,
              value = _dest$spec.value,
              domain = _dest$spec.domain,
              ttlDays = _dest$spec.ttlDays;
          cookie__default['default'].set(name, value || "", {
            domain: domain || "",
            expires: ttlDays || 10 // days

          });
        });
      };

      var injectProcessDestinations = function injectProcessDestinations(_ref) {
        var fireReferrerHideableImage = _ref.fireReferrerHideableImage,
            logger = _ref.logger;
        return function (destinations) {
          processCookies(destinations);
          return processUrls(fireReferrerHideableImage, logger, destinations);
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


      var createAudiences = function createAudiences(_ref) {
        var logger = _ref.logger;
        var processDestinations = injectProcessDestinations({
          fireReferrerHideableImage: fireReferrerHideableImage,
          logger: logger
        });

        var processDestinationsFromResponse = function processDestinationsFromResponse(_ref2) {
          var response = _ref2.response;

          if (!response) {
            return undefined;
          }

          var destinations = response.getPayloadsByType("activation:push");
          return processDestinations(destinations);
        };

        return {
          lifecycle: {
            onResponse: processDestinationsFromResponse,
            onRequestFailure: processDestinationsFromResponse
          },
          commands: {}
        };
      };

      createAudiences.namespace = "Audiences";
      createAudiences.configValidators = {};
      /*
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

      var DOM_ACTION = "https://ns.adobe.com/personalization/dom-action";
      var HTML_CONTENT_ITEM = "https://ns.adobe.com/personalization/html-content-item";
      var JSON_CONTENT_ITEM = "https://ns.adobe.com/personalization/json-content-item";
      var REDIRECT_ITEM = "https://ns.adobe.com/personalization/redirect-item";

      var createPersonalizationDetails = function createPersonalizationDetails(_ref) {
        var renderDecisions = _ref.renderDecisions,
            decisionScopes = _ref.decisionScopes,
            event = _ref.event,
            viewCache = _ref.viewCache;
        var viewName = event.getViewName();
        return {
          isRenderDecisions: function isRenderDecisions() {
            return renderDecisions;
          },
          getViewName: function getViewName() {
            return viewName;
          },
          hasScopes: function hasScopes() {
            return decisionScopes.length > 0;
          },
          hasViewName: function hasViewName() {
            return viewName !== undefined;
          },
          createQueryDetails: function createQueryDetails() {
            var scopes = _toConsumableArray(decisionScopes);

            if (!this.isCacheInitialized() && !includes(scopes, PAGE_WIDE_SCOPE)) {
              scopes.push(PAGE_WIDE_SCOPE);
            }

            var schemas = [HTML_CONTENT_ITEM, JSON_CONTENT_ITEM, REDIRECT_ITEM];

            if (includes(scopes, PAGE_WIDE_SCOPE)) {
              schemas.push(DOM_ACTION);
            }

            return {
              schemas: schemas,
              decisionScopes: scopes
            };
          },
          isCacheInitialized: function isCacheInitialized() {
            return viewCache.isInitialized();
          },
          shouldFetchData: function shouldFetchData() {
            return this.hasScopes() || !this.isCacheInitialized();
          },
          shouldUseCachedData: function shouldUseCachedData() {
            return this.hasViewName() && this.isCacheInitialized();
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


      var createComponent$1 = function createComponent$1(_ref) {
        var logger = _ref.logger,
            fetchDataHandler = _ref.fetchDataHandler,
            viewChangeHandler = _ref.viewChangeHandler,
            onClickHandler = _ref.onClickHandler,
            isAuthoringModeEnabled = _ref.isAuthoringModeEnabled,
            mergeQuery = _ref.mergeQuery,
            viewCache = _ref.viewCache;
        return {
          lifecycle: {
            onBeforeEvent: function onBeforeEvent(_ref2) {
              var event = _ref2.event,
                  renderDecisions = _ref2.renderDecisions,
                  _ref2$decisionScopes = _ref2.decisionScopes,
                  decisionScopes = _ref2$decisionScopes === void 0 ? [] : _ref2$decisionScopes,
                  _ref2$onResponse = _ref2.onResponse,
                  onResponse = _ref2$onResponse === void 0 ? noop : _ref2$onResponse,
                  _ref2$onRequestFailur = _ref2.onRequestFailure,
                  onRequestFailure = _ref2$onRequestFailur === void 0 ? noop : _ref2$onRequestFailur;

              if (isAuthoringModeEnabled()) {
                logger.warn("Rendering is disabled, authoring mode."); // If we are in authoring mode we disable personalization

                mergeQuery(event, {
                  enabled: false
                });
                return;
              }

              var personalizationDetails = createPersonalizationDetails({
                renderDecisions: renderDecisions,
                decisionScopes: decisionScopes,
                event: event,
                viewCache: viewCache
              });

              if (personalizationDetails.shouldFetchData()) {
                var decisionsDeferred = defer();
                viewCache.storeViews(decisionsDeferred.promise);
                fetchDataHandler({
                  decisionsDeferred: decisionsDeferred,
                  personalizationDetails: personalizationDetails,
                  event: event,
                  onResponse: onResponse,
                  onRequestFailure: onRequestFailure
                });
                return;
              }

              if (personalizationDetails.shouldUseCachedData()) {
                viewChangeHandler({
                  personalizationDetails: personalizationDetails,
                  onResponse: onResponse,
                  onRequestFailure: onRequestFailure
                });
              }
            },
            onClick: function onClick(_ref3) {
              var event = _ref3.event,
                  clickedElement = _ref3.clickedElement;
              onClickHandler({
                event: event,
                clickedElement: clickedElement
              });
            }
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


      var createFragment = function createFragment(content) {
        return createNode(DIV, {}, {
          innerHTML: content
        });
      };

      var css_escape = createCommonjsModule(function (module, exports) {
        (function (root, factory) {
          // https://github.com/umdjs/umd/blob/master/returnExports.js
          {
            // For Node.js.
            module.exports = factory(root);
          }
        })(typeof commonjsGlobal != 'undefined' ? commonjsGlobal : commonjsGlobal, function (root) {
          if (root.CSS && root.CSS.escape) {
            return root.CSS.escape;
          } // https://drafts.csswg.org/cssom/#serialize-an-identifier


          var cssEscape = function cssEscape(value) {
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
              codeUnit = string.charCodeAt(index); // Note: there’s no need to special-case astral symbols, surrogate
              // pairs, or lone surrogates.
              // If the character is NULL (U+0000), then the REPLACEMENT CHARACTER
              // (U+FFFD).

              if (codeUnit == 0x0000) {
                result += "\uFFFD";
                continue;
              }

              if ( // If the character is in the range [\1-\1F] (U+0001 to U+001F) or is
              // U+007F, […]
              codeUnit >= 0x0001 && codeUnit <= 0x001F || codeUnit == 0x007F || // If the character is the first character and is in the range [0-9]
              // (U+0030 to U+0039), […]
              index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039 || // If the character is the second character and is in the range [0-9]
              // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
              index == 1 && codeUnit >= 0x0030 && codeUnit <= 0x0039 && firstCodeUnit == 0x002D) {
                // https://drafts.csswg.org/cssom/#escape-a-character-as-code-point
                result += '\\' + codeUnit.toString(16) + ' ';
                continue;
              }

              if ( // If the character is the first character and is a `-` (U+002D), and
              // there is no second character, […]
              index == 0 && length == 1 && codeUnit == 0x002D) {
                result += '\\' + string.charAt(index);
                continue;
              } // If the character is not handled by one of the above rules and is
              // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
              // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
              // U+005A), or [a-z] (U+0061 to U+007A), […]


              if (codeUnit >= 0x0080 || codeUnit == 0x002D || codeUnit == 0x005F || codeUnit >= 0x0030 && codeUnit <= 0x0039 || codeUnit >= 0x0041 && codeUnit <= 0x005A || codeUnit >= 0x0061 && codeUnit <= 0x007A) {
                // the character itself
                result += string.charAt(index);
                continue;
              } // Otherwise, the escaped character.
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

      var EQ_START = ":eq(";
      var EQ_PATTERN = /:eq\((\d+)\)/g;

      var isNotEqSelector = function isNotEqSelector(str) {
        return str.indexOf(EQ_START) === -1;
      };

      var splitWithEq = function splitWithEq(selector) {
        return selector.split(EQ_PATTERN).filter(isNonEmptyString);
      };

      var CSS_IDENTIFIER_PATTERN = /(#|\.)(-?\w+)/g; // This is required to remove leading " > " from parsed pieces

      var SIBLING_PATTERN = /^\s*>?\s*/;

      var cleanUp = function cleanUp(str) {
        return str.replace(SIBLING_PATTERN, "").trim();
      }; // Here we use CSS.escape() to make sure we get
      // correct values for ID and CSS class
      // Please check:  https://www.w3.org/TR/css-syntax-3/#escaping
      // CSS.escape() polyfill can be found here: https://github.com/mathiasbynens/CSS.escape


      var replaceIdentifier = function replaceIdentifier(_, $1, $2) {
        return "" + $1 + css_escape($2);
      };

      var escapeIdentifiersInSelector = function escapeIdentifiersInSelector(selector) {
        return selector.replace(CSS_IDENTIFIER_PATTERN, replaceIdentifier);
      };

      var parseSelector = function parseSelector(rawSelector) {
        var result = [];
        var selector = escapeIdentifiersInSelector(rawSelector.trim());
        var parts = splitWithEq(selector);
        var length = parts.length;
        var i = 0;

        while (i < length) {
          var sel = cleanUp(parts[i]);
          var eq = parts[i + 1];

          if (eq) {
            result.push({
              sel: sel,
              eq: Number(eq)
            });
          } else {
            result.push({
              sel: sel
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


      var selectNodesWithEq = function selectNodesWithEq(selector) {
        var doc = document;

        if (isNotEqSelector(selector)) {
          return selectNodes(selector, doc);
        }

        var parts = parseSelector(selector);
        var length = parts.length;
        var result = [];
        var context = doc;
        var i = 0;

        while (i < length) {
          var _parts$i = parts[i],
              sel = _parts$i.sel,
              eq = _parts$i.eq;
          var nodes = selectNodes(sel, context);
          var nodesCount = nodes.length;

          if (nodesCount === 0) {
            break;
          }

          if (eq != null && eq > nodesCount - 1) {
            break;
          }

          if (i < length - 1) {
            if (eq == null) {
              var _nodes = _slicedToArray(nodes, 1);

              context = _nodes[0];
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


      var getElementById = function getElementById(id) {
        var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
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


      var setAttribute = function setAttribute(element, name, value) {
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


      var getAttribute = function getAttribute(element, name) {
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


      var removeAttribute = function removeAttribute(element, name) {
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


      var setStyle = function setStyle(element, name, value, priority) {
        var css;

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


      var getParent = function getParent(element) {
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


      var getNextSibling = function getNextSibling(element) {
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


      var insertAfter = function insertAfter(container, element) {
        if (!container) {
          return;
        }

        var parent = getParent(container);

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


      var insertBefore = function insertBefore(container, element) {
        if (!container) {
          return;
        }

        var parent = getParent(container);

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


      var getChildren = function getChildren(element) {
        var children = element.children;

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


      var getChildNodes = function getChildNodes(element) {
        var childNodes = element.childNodes;

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


      var getFirstChild = function getFirstChild(element) {
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


      var nonce;
      /**
       * Returns the nonce if available.
       * @param {Node} [context=document] defaults to document
       * @returns {(String|undefined)} the nonce or undefined if not available
       */

      var getNonce = function getNonce() {
        var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

        if (nonce === undefined) {
          var n = context.querySelector("[nonce]"); // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
          //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946

          nonce = n && (n.nonce || n.getAttribute("nonce"));
        }

        return nonce;
      }; // This function is only used for testing and removed when library is built (tree-shaking)


      var PREHIDING_ID = "alloy-prehiding";
      var HIDING_STYLE_DEFINITION = "{ visibility: hidden }"; // Using global is OK since we have a single DOM
      // so storing nodes even for multiple Alloy instances is fine

      var styleNodes = {};

      var hideElements = function hideElements(prehidingSelector) {
        // if we have different events with the same
        // prehiding selector we don't want to recreate
        // the style tag
        if (styleNodes[prehidingSelector]) {
          return;
        }

        var nonce = getNonce();

        var attrs = _objectSpread2({}, nonce && {
          nonce: nonce
        });

        var props = {
          textContent: prehidingSelector + " " + HIDING_STYLE_DEFINITION
        };
        var node = createNode(STYLE, attrs, props);
        appendNode(document.head, node);
        styleNodes[prehidingSelector] = node;
      };

      var showElements = function showElements(prehidingSelector) {
        var node = styleNodes[prehidingSelector];

        if (node) {
          removeNode(node);
          delete styleNodes[prehidingSelector];
        }
      };

      var hideContainers = function hideContainers(prehidingStyle) {
        if (!prehidingStyle) {
          return;
        } // If containers prehiding style has been added
        // by customer's prehiding snippet we don't
        // want to add the same node


        var node = getElementById(PREHIDING_ID);

        if (node) {
          return;
        }

        var nonce = getNonce();

        var attrs = _objectSpread2({
          id: PREHIDING_ID
        }, nonce && {
          nonce: nonce
        });

        var props = {
          textContent: prehidingStyle
        };
        var styleNode = createNode(STYLE, attrs, props);
        appendNode(document.head, styleNode);
      };

      var showContainers = function showContainers() {
        // If containers prehiding style exists
        // we will remove it
        var node = getElementById(PREHIDING_ID);

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


      var setText = function setText(container, text) {
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


      var isImage = function isImage(element) {
        return element.tagName === IMG;
      };

      var loadImage = function loadImage(url) {
        return createNode(IMG, {
          src: url
        });
      };

      var loadImages = function loadImages(fragment) {
        var images = selectNodes(IMG, fragment);
        images.forEach(function (image) {
          var url = getAttribute(image, SRC);

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


      var is = function is(element, tagName) {
        return element.tagName === tagName;
      };

      var isInlineStyleElement = function isInlineStyleElement(element) {
        return is(element, STYLE) && !getAttribute(element, SRC);
      };

      var addNonceToInlineStyleElements = function addNonceToInlineStyleElements(fragment) {
        var styleNodes = selectNodes(STYLE, fragment);
        var length = styleNodes.length;
        var nonce = getNonce();

        if (!nonce) {
          return;
        }
        /* eslint-disable no-continue */


        for (var i = 0; i < length; i += 1) {
          var element = styleNodes[i];

          if (!isInlineStyleElement(element)) {
            continue;
          }

          element.nonce = nonce;
        }
      };

      var is$1 = function is(element, tagName) {
        return element.tagName === tagName;
      };

      var isInlineScript = function isInlineScript(element) {
        return is$1(element, SCRIPT) && !getAttribute(element, SRC);
      };

      var isRemoteScript = function isRemoteScript(element) {
        return is$1(element, SCRIPT) && getAttribute(element, SRC);
      };

      var getInlineScripts = function getInlineScripts(fragment) {
        var scripts = selectNodes(SCRIPT, fragment);
        var result = [];
        var length = scripts.length;
        var nonce = getNonce();

        var attributes = _objectSpread2({}, nonce && {
          nonce: nonce
        });
        /* eslint-disable no-continue */


        for (var i = 0; i < length; i += 1) {
          var element = scripts[i];

          if (!isInlineScript(element)) {
            continue;
          }

          var textContent = element.textContent;

          if (!textContent) {
            continue;
          }

          result.push(createNode(SCRIPT, attributes, {
            textContent: textContent
          }));
        }
        /* eslint-enable no-continue */


        return result;
      };

      var getRemoteScriptsUrls = function getRemoteScriptsUrls(fragment) {
        var scripts = selectNodes(SCRIPT, fragment);
        var result = [];
        var length = scripts.length;
        /* eslint-disable no-continue */

        for (var i = 0; i < length; i += 1) {
          var element = scripts[i];

          if (!isRemoteScript(element)) {
            continue;
          }

          var url = getAttribute(element, SRC);

          if (!url) {
            continue;
          }

          result.push(url);
        }
        /* eslint-enable no-continue */


        return result;
      };

      var executeInlineScripts = function executeInlineScripts(container, scripts, func) {
        scripts.forEach(function (script) {
          return func(container, script);
        });
      };

      var executeRemoteScripts = function executeRemoteScripts(urls) {
        return Promise.all(urls.map(loadScript__default['default']));
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


      var appendHtml = function appendHtml(container, html) {
        var fragment = createFragment(html);
        addNonceToInlineStyleElements(fragment);
        var elements = getChildNodes(fragment);
        var scripts = getInlineScripts(fragment);
        var scriptsUrls = getRemoteScriptsUrls(fragment);
        loadImages(fragment);
        elements.forEach(function (element) {
          appendNode(container, element);
        });
        executeInlineScripts(container, scripts, appendNode);
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


      var clear = function clear(container) {
        // We want to remove ALL nodes, text, comments etc
        var childNodes = getChildNodes(container);
        childNodes.forEach(removeNode);
      };

      var setHtml = function setHtml(container, html) {
        clear(container);
        appendHtml(container, html);
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


      var prependHtml = function prependHtml(container, html) {
        var fragment = createFragment(html);
        addNonceToInlineStyleElements(fragment);
        var elements = getChildNodes(fragment);
        var scripts = getInlineScripts(fragment);
        var scriptsUrls = getRemoteScriptsUrls(fragment);
        var length = elements.length;
        var i = length - 1; // We have to proactively load images to avoid flicker

        loadImages(fragment); // We are inserting elements in reverse order

        while (i >= 0) {
          var element = elements[i];
          var firstChild = getFirstChild(container);

          if (firstChild) {
            insertBefore(firstChild, element);
          } else {
            appendNode(container, element);
          }

          i -= 1;
        }

        executeInlineScripts(container, scripts, appendNode);
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


      var insertHtmlBefore = function insertHtmlBefore(container, html) {
        var fragment = createFragment(html);
        addNonceToInlineStyleElements(fragment);
        var elements = getChildNodes(fragment);
        var scripts = getInlineScripts(fragment);
        var scriptsUrls = getRemoteScriptsUrls(fragment);
        loadImages(fragment);
        elements.forEach(function (element) {
          insertBefore(container, element);
        });
        executeInlineScripts(container, scripts, insertBefore);
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


      var replaceHtml = function replaceHtml(container, html) {
        insertHtmlBefore(container, html);
        removeNode(container);
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


      var insertHtmlAfter = function insertHtmlAfter(container, html) {
        var fragment = createFragment(html);
        addNonceToInlineStyleElements(fragment);
        var elements = getChildNodes(fragment);
        var scripts = getInlineScripts(fragment);
        var scriptsUrls = getRemoteScriptsUrls(fragment);
        loadImages(fragment);
        elements.forEach(function (element) {
          insertAfter(container, element);
        });
        executeInlineScripts(container, scripts, insertAfter);
        return executeRemoteScripts(scriptsUrls);
      };

      var setStyles = function setStyles(container, styles) {
        var priority = styles.priority,
            style = _objectWithoutProperties(styles, ["priority"]);

        Object.keys(style).forEach(function (key) {
          setStyle(container, key, style[key], priority);
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


      var setAttributes = function setAttributes(container, attributes) {
        Object.keys(attributes).forEach(function (key) {
          setAttribute(container, key, attributes[key]);
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


      var swapImage = function swapImage(container, url) {
        if (!isImage(container)) {
          return;
        } // Start downloading the image


        loadImage(url); // Remove "src" so there is no flicker

        removeAttribute(container, SRC); // Replace the image "src"

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


      var rearrangeChildren = function rearrangeChildren(container, _ref) {
        var from = _ref.from,
            to = _ref.to;
        var children = getChildren(container);
        var elementFrom = children[from];
        var elementTo = children[to];

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


      var _click = function _click(settings, store) {
        var selector = settings.selector,
            meta = settings.meta;
        store({
          selector: selector,
          meta: meta
        });
        return Promise.resolve();
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


      var renderContent = function renderContent(elements, content, renderFunc) {
        var executions = elements.map(function (element) {
          return renderFunc(element, content);
        });
        return Promise.all(executions);
      };

      var createAction = function createAction(renderFunc) {
        return function (settings) {
          var selector = settings.selector,
              prehidingSelector = settings.prehidingSelector,
              content = settings.content,
              meta = settings.meta;
          hideElements(prehidingSelector);
          return awaitSelector(selector, selectNodesWithEq).then(function (elements) {
            return renderContent(elements, content, renderFunc);
          }).then(function () {
            // if everything is OK, show elements
            showElements(prehidingSelector);
            return {
              meta: meta
            };
          }, function (error) {
            // in case of awaiting timing or error, we need to remove the style tag
            // hence showing the pre-hidden elements
            showElements(prehidingSelector);
            return {
              meta: meta,
              error: error
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


      var initDomActionsModules = function initDomActionsModules(store) {
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
          appendHtml: createAction(appendHtml),
          click: function click(settings) {
            return _click(settings, store);
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


      var logActionError = function logActionError(logger, action, error) {
        if (logger.enabled) {
          var details = JSON.stringify(action);
          var message = error.message,
              stack = error.stack;
          var errorMessage = "Failed to execute action " + details + ". " + message + " " + (stack ? "\n " + stack : "");
          logger.error(errorMessage);
        }
      };

      var logActionCompleted = function logActionCompleted(logger, action) {
        if (logger.enabled) {
          var details = JSON.stringify(action);
          logger.log("Action " + details + " executed.");
        }
      };

      var executeAction = function executeAction(logger, modules, type, args) {
        var execute = modules[type];

        if (!execute) {
          var error = new Error("DOM action \"" + type + "\" not found");
          logActionError(logger, args[0], error);
          throw error;
        }

        return execute.apply(void 0, _toConsumableArray(args));
      };

      var executeActions = function executeActions(actions, modules, logger) {
        var actionPromises = actions.map(function (action) {
          var type = action.type;
          return executeAction(logger, modules, type, [action]).then(function (result) {
            logActionCompleted(logger, action);
            return result;
          })["catch"](function (error) {
            logActionError(logger, action, error);
            throw error;
          });
        });
        return Promise.all(actionPromises);
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


      var createCollect = function createCollect(_ref) {
        var eventManager = _ref.eventManager,
            mergeMeta = _ref.mergeMeta;
        return function (_ref2) {
          var meta = _ref2.meta;
          var event = eventManager.createEvent();
          event.mergeXdm({
            eventType: "display"
          });
          mergeMeta(event, meta);
          return eventManager.sendEvent(event);
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


      var createViewCollect = function createViewCollect(_ref) {
        var eventManager = _ref.eventManager,
            mergeMeta = _ref.mergeMeta;
        return function (_ref2) {
          var meta = _ref2.meta,
              _ref2$xdm = _ref2.xdm,
              xdm = _ref2$xdm === void 0 ? {} : _ref2$xdm;
          var _meta$decisions = meta.decisions,
              decisions = _meta$decisions === void 0 ? [] : _meta$decisions;
          var data = {
            eventType: "display"
          };
          var event = eventManager.createEvent();

          if (isNonEmptyArray(decisions)) {
            var viewName = decisions[0].scope;
            data.web = {
              webPageDetails: {
                viewName: viewName
              }
            };
            mergeMeta(event, meta);
          }

          event.mergeXdm(data);
          event.mergeXdm(xdm);
          return eventManager.sendEvent(event);
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


      var identity = function identity(item) {
        return item;
      };

      var buildActions = function buildActions(decision) {
        var meta = {
          id: decision.id,
          scope: decision.scope
        };
        return decision.items.map(function (item) {
          return assign__default['default']({}, item.data, {
            meta: meta
          });
        });
      };

      var processMetas = function processMetas(collect, logger, actionResults) {
        var results = flatMap(actionResults, identity);
        var finalMetas = [];
        var set = new Set();
        results.forEach(function (item) {
          // for click actions we don't return an item
          if (!item) {
            return;
          }

          if (item.error) {
            logger.warn(item);
            return;
          }

          var meta = item.meta;

          if (set.has(meta.id)) {
            return;
          }

          set.add(meta.id);
          finalMetas.push(meta);
        });

        if (isNonEmptyArray(finalMetas)) {
          collect({
            meta: {
              decisions: finalMetas
            }
          });
        }
      };

      var createExecuteDecisions = function createExecuteDecisions(_ref) {
        var modules = _ref.modules,
            logger = _ref.logger,
            executeActions = _ref.executeActions,
            collect = _ref.collect;
        return function (decisions) {
          var actionResultsPromises = decisions.map(function (decision) {
            var actions = buildActions(decision);
            return executeActions(actions, modules, logger);
          });
          return Promise.all(actionResultsPromises).then(function (results) {
            return processMetas(collect, logger, results);
          })["catch"](function (error) {
            logger.error(error);
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


      var createFetchDataHandler = function createFetchDataHandler(_ref) {
        var config = _ref.config,
            responseHandler = _ref.responseHandler,
            showContainers = _ref.showContainers,
            hideContainers = _ref.hideContainers,
            mergeQuery = _ref.mergeQuery;
        return function (_ref2) {
          var decisionsDeferred = _ref2.decisionsDeferred,
              personalizationDetails = _ref2.personalizationDetails,
              event = _ref2.event,
              onResponse = _ref2.onResponse,
              onRequestFailure = _ref2.onRequestFailure;
          var prehidingStyle = config.prehidingStyle;

          if (personalizationDetails.isRenderDecisions()) {
            hideContainers(prehidingStyle);
          }

          mergeQuery(event, personalizationDetails.createQueryDetails());
          onResponse(function (_ref3) {
            var response = _ref3.response;
            return responseHandler({
              decisionsDeferred: decisionsDeferred,
              personalizationDetails: personalizationDetails,
              response: response
            });
          });
          onRequestFailure(function () {
            decisionsDeferred.reject();
            showContainers();
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


      var matchesSelectorWithEq = function matchesSelectorWithEq(selector, element) {
        if (isNotEqSelector(selector)) {
          return matchesSelector(selector, element);
        } // Using node selection vs matches selector, because of :eq()
        // Find all nodes using document as context


        var nodes = selectNodesWithEq(selector);
        var result = false; // Iterate through all the identified elements
        // and reference compare with element

        for (var i = 0; i < nodes.length; i += 1) {
          if (nodes[i] === element) {
            result = true;
            break;
          }
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


      var getMetaIfMatches = function getMetaIfMatches(clickedElement, value) {
        var _document = document,
            documentElement = _document.documentElement;
        var selector = value.selector,
            meta = value.meta;
        var element = clickedElement;

        while (element && element !== documentElement) {
          if (matchesSelectorWithEq(selector, element)) {
            return meta;
          }

          element = element.parentNode;
        }

        return null;
      };

      var collectClicks = function collectClicks(clickedElement, values) {
        if (values.length === 0) {
          return [];
        }

        var result = [];

        for (var i = 0; i < values.length; i += 1) {
          var meta = getMetaIfMatches(clickedElement, values[i]);

          if (meta) {
            result.push(meta);
          }
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


      var isAuthoringModeEnabled = function isAuthoringModeEnabled() {
        var doc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
        return doc.location.href.indexOf("mboxEdit") !== -1;
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


      var mergeMeta = function mergeMeta(event, meta) {
        event.mergeMeta({
          personalization: _objectSpread2({}, meta)
        });
      };

      var mergeQuery = function mergeQuery(event, details) {
        event.mergeQuery({
          personalization: _objectSpread2({}, details)
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


      var createOnClickHandler = function createOnClickHandler(_ref) {
        var mergeMeta = _ref.mergeMeta,
            collectClicks = _ref.collectClicks,
            clickStorage = _ref.clickStorage;
        return function (_ref2) {
          var event = _ref2.event,
              clickedElement = _ref2.clickedElement;
          var clickMetas = collectClicks(clickedElement, clickStorage);

          if (isNonEmptyArray(clickMetas)) {
            event.mergeXdm({
              eventType: "click"
            });
            mergeMeta(event, {
              decisions: clickMetas
            });
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


      var createExecuteCachedViewDecisions = function createExecuteCachedViewDecisions(_ref) {
        var viewCache = _ref.viewCache,
            executeViewDecisions = _ref.executeViewDecisions,
            collect = _ref.collect;
        return function (_ref2) {
          var viewName = _ref2.viewName;
          viewCache.getView(viewName).then(function (viewDecisions) {
            if (isNonEmptyArray(viewDecisions)) {
              executeViewDecisions(viewDecisions);
              return;
            }

            var xdm = {
              web: {
                webPageDetails: {
                  viewName: viewName
                }
              }
            };
            collect({
              meta: {},
              xdm: xdm
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


      var createViewCacheManager = function createViewCacheManager() {
        var viewStorage;
        var viewStorageDeferred = defer();

        var storeViews = function storeViews(decisionsPromise) {
          decisionsPromise.then(function (decisions) {
            if (viewStorage === undefined) {
              viewStorage = {};
            }

            assign__default['default'](viewStorage, decisions);
            viewStorageDeferred.resolve();
          });
        };

        var getView = function getView(viewName) {
          return viewStorageDeferred.promise.then(function () {
            return viewStorage[viewName];
          });
        };

        var isInitialized = function isInitialized() {
          return !(viewStorage === undefined);
        };

        return {
          storeViews: storeViews,
          getView: getView,
          isInitialized: isInitialized
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


      var createViewChangeHandler = function createViewChangeHandler(_ref) {
        var executeCachedViewDecisions = _ref.executeCachedViewDecisions,
            viewCache = _ref.viewCache,
            showContainers = _ref.showContainers;
        return function (_ref2) {
          var personalizationDetails = _ref2.personalizationDetails,
              onResponse = _ref2.onResponse,
              onRequestFailure = _ref2.onRequestFailure;
          var viewName = personalizationDetails.getViewName();

          if (personalizationDetails.isRenderDecisions()) {
            executeCachedViewDecisions({
              viewName: viewName
            });
            return;
          }

          onResponse(function () {
            return viewCache.getView(viewName).then(function (decisions) {
              return {
                decisions: decisions
              };
            });
          });
          onRequestFailure(function () {
            showContainers();
          });
        };
      };

      var splitItems = function splitItems(items, schema) {
        var matched = [];
        var nonMatched = [];
        items.forEach(function (item) {
          if (item.schema === schema) {
            matched.push(item);
          } else {
            nonMatched.push(item);
          }
        });
        return [matched, nonMatched];
      };

      var createDecision = function createDecision(decision, items) {
        return {
          id: decision.id,
          scope: decision.scope,
          items: items
        };
      };

      var splitDecisions = function splitDecisions(decisions, schema) {
        var domActionDecisions = [];
        var nonDomActionDecisions = [];
        decisions.forEach(function (decision) {
          var _decision$items = decision.items,
              items = _decision$items === void 0 ? [] : _decision$items;

          var _splitItems = splitItems(items, schema),
              _splitItems2 = _slicedToArray(_splitItems, 2),
              matchedItems = _splitItems2[0],
              nonMatchedItems = _splitItems2[1];

          if (isNonEmptyArray(matchedItems)) {
            domActionDecisions.push(createDecision(decision, matchedItems));
          }

          if (isNonEmptyArray(nonMatchedItems)) {
            nonDomActionDecisions.push(createDecision(decision, nonMatchedItems));
          }
        });
        return {
          domActionDecisions: domActionDecisions,
          nonDomActionDecisions: nonDomActionDecisions
        };
      };

      var extractDecisionsByScope = function extractDecisionsByScope(decisions, scope) {
        var pageWideScopeDecisions = [];
        var nonPageWideScopeDecisions = {};

        if (isNonEmptyArray(decisions)) {
          decisions.forEach(function (decision) {
            if (decision.scope === scope) {
              pageWideScopeDecisions.push(decision);
            } else {
              if (!nonPageWideScopeDecisions[decision.scope]) {
                nonPageWideScopeDecisions[decision.scope] = [];
              }

              nonPageWideScopeDecisions[decision.scope].push(decision);
            }
          });
        }

        return {
          pageWideScopeDecisions: pageWideScopeDecisions,
          nonPageWideScopeDecisions: nonPageWideScopeDecisions
        };
      };

      var decisionsExtractor = {
        groupDecisionsBySchema: function groupDecisionsBySchema(_ref) {
          var decisions = _ref.decisions,
              schema = _ref.schema;
          return splitDecisions(decisions, schema);
        },
        groupDecisionsByScope: function groupDecisionsByScope(_ref2) {
          var decisions = _ref2.decisions,
              scope = _ref2.scope;
          return extractDecisionsByScope(decisions, scope);
        }
      };
      var DECISIONS_HANDLE = "personalization:decisions";

      var createOnResponseHandler = function createOnResponseHandler(_ref) {
        var decisionsExtractor = _ref.decisionsExtractor,
            executeDecisions = _ref.executeDecisions,
            executeCachedViewDecisions = _ref.executeCachedViewDecisions,
            showContainers = _ref.showContainers;
        return function (_ref2) {
          var decisionsDeferred = _ref2.decisionsDeferred,
              personalizationDetails = _ref2.personalizationDetails,
              response = _ref2.response;
          var unprocessedDecisions = response.getPayloadsByType(DECISIONS_HANDLE);
          var viewName = personalizationDetails.getViewName();

          if (unprocessedDecisions.length === 0) {
            showContainers();
            decisionsDeferred.resolve({});
            return {
              decisions: []
            };
          }

          var _decisionsExtractor$g = decisionsExtractor.groupDecisionsBySchema({
            decisions: unprocessedDecisions,
            schema: DOM_ACTION
          }),
              domActionDecisions = _decisionsExtractor$g.domActionDecisions,
              nonDomActionDecisions = _decisionsExtractor$g.nonDomActionDecisions;

          var _decisionsExtractor$g2 = decisionsExtractor.groupDecisionsByScope({
            decisions: domActionDecisions,
            scope: PAGE_WIDE_SCOPE
          }),
              pageWideScopeDecisions = _decisionsExtractor$g2.pageWideScopeDecisions,
              nonPageWideScopeDecisions = _decisionsExtractor$g2.nonPageWideScopeDecisions;

          if (isEmptyObject(nonPageWideScopeDecisions)) {
            decisionsDeferred.resolve({});
          } else {
            decisionsDeferred.resolve(nonPageWideScopeDecisions);
          }

          if (personalizationDetails.isRenderDecisions()) {
            executeDecisions(pageWideScopeDecisions);

            if (viewName) {
              executeCachedViewDecisions({
                viewName: viewName
              });
            }

            showContainers();
            return {
              decisions: nonDomActionDecisions
            };
          }

          var decisionsToBeReturned = [].concat(_toConsumableArray(pageWideScopeDecisions), _toConsumableArray(nonDomActionDecisions));

          if (viewName && nonPageWideScopeDecisions[viewName]) {
            decisionsToBeReturned.push.apply(decisionsToBeReturned, _toConsumableArray(nonPageWideScopeDecisions[viewName]));
          }

          return {
            decisions: decisionsToBeReturned
          };
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


      var createPersonalization = function createPersonalization(_ref) {
        var config = _ref.config,
            logger = _ref.logger,
            eventManager = _ref.eventManager;
        var collect = createCollect({
          eventManager: eventManager,
          mergeMeta: mergeMeta
        });
        var viewCollect = createViewCollect({
          eventManager: eventManager,
          mergeMeta: mergeMeta
        });
        var clickStorage = [];
        var viewCache = createViewCacheManager();

        var store = function store(value) {
          return clickStorage.push(value);
        };

        var modules = initDomActionsModules(store);
        var executeDecisions = createExecuteDecisions({
          modules: modules,
          logger: logger,
          executeActions: executeActions,
          collect: collect
        });
        var executeViewDecisions = createExecuteDecisions({
          modules: modules,
          logger: logger,
          executeActions: executeActions,
          collect: viewCollect
        });
        var executeCachedViewDecisions = createExecuteCachedViewDecisions({
          viewCache: viewCache,
          executeViewDecisions: executeViewDecisions,
          collect: viewCollect
        });
        var responseHandler = createOnResponseHandler({
          decisionsExtractor: decisionsExtractor,
          executeDecisions: executeDecisions,
          executeCachedViewDecisions: executeCachedViewDecisions,
          showContainers: showContainers
        });
        var fetchDataHandler = createFetchDataHandler({
          config: config,
          responseHandler: responseHandler,
          showContainers: showContainers,
          hideContainers: hideContainers,
          mergeQuery: mergeQuery
        });
        var onClickHandler = createOnClickHandler({
          mergeMeta: mergeMeta,
          collectClicks: collectClicks,
          clickStorage: clickStorage
        });
        var viewChangeHandler = createViewChangeHandler({
          executeCachedViewDecisions: executeCachedViewDecisions,
          viewCache: viewCache,
          showContainers: showContainers
        });
        return createComponent$1({
          logger: logger,
          fetchDataHandler: fetchDataHandler,
          viewChangeHandler: viewChangeHandler,
          onClickHandler: onClickHandler,
          isAuthoringModeEnabled: isAuthoringModeEnabled,
          mergeQuery: mergeQuery,
          viewCache: viewCache
        });
      };

      createPersonalization.namespace = "Personalization";
      createPersonalization.configValidators = {
        prehidingStyle: boundString().nonEmpty()
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

      var injectWeb = function injectWeb(window) {
        return function (xdm) {
          var web = {
            webPageDetails: {
              URL: window.location.href || window.location
            },
            webReferrer: {
              URL: window.document.referrer
            }
          };
          deepAssign(xdm, {
            web: web
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


      var getScreenOrientationViaProperty = function getScreenOrientationViaProperty(window) {
        var orientation = window.screen.orientation;

        if (orientation == null || orientation.type == null) {
          return null;
        }

        var parts = orientation.type.split("-");

        if (parts.length === 0) {
          return null;
        }

        if (parts[0] !== "portrait" && parts[0] !== "landscape") {
          return null;
        }

        return parts[0];
      };

      var getScreenOrientationViaMediaQuery = function getScreenOrientationViaMediaQuery(window) {
        if (window.matchMedia("(orientation: portrait)").matches) {
          return "portrait";
        }

        if (window.matchMedia("(orientation: landscape)").matches) {
          return "landscape";
        }

        return null;
      };

      var injectDevice = function injectDevice(window) {
        return function (xdm) {
          var _window$screen = window.screen,
              width = _window$screen.width,
              height = _window$screen.height;
          var device = {
            screenHeight: height,
            screenWidth: width
          };
          var orientation = getScreenOrientationViaProperty(window) || getScreenOrientationViaMediaQuery(window);

          if (orientation) {
            device.screenOrientation = orientation;
          }

          deepAssign(xdm, {
            device: device
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


      var injectEnvironment = function injectEnvironment(window) {
        return function (xdm) {
          var innerWidth = window.innerWidth,
              innerHeight = window.innerHeight;
          var environment = {
            type: "browser",
            browserDetails: {
              viewportWidth: innerWidth,
              viewportHeight: innerHeight
            }
          };
          deepAssign(xdm, {
            environment: environment
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


      var injectPlaceContext = function injectPlaceContext(dateProvider) {
        return function (xdm) {
          var date = dateProvider();
          var placeContext = {
            localTime: toISOStringLocal(date),
            localTimezoneOffset: date.getTimezoneOffset()
          };
          deepAssign(xdm, {
            placeContext: placeContext
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


      var injectTimestamp = function injectTimestamp(dateProvider) {
        return function (xdm) {
          var timestamp = dateProvider().toISOString();
          deepAssign(xdm, {
            timestamp: timestamp
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


      var injectImplementationDetails = function injectImplementationDetails(implementationDetails) {
        return function (xdm) {
          deepAssign(xdm, {
            implementationDetails: implementationDetails
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
      // The __VERSION__ keyword will be replace at alloy build time with the package.json version.
      // The __EXTENSION_VERSION__ keyword will be replaced at extension build time with the
      // launch extension's package.json version.
      // see babel-plugin-version


      var alloyVersion = "2.3.0";
      var extensionVersion = "2.2.0";
      var libraryVersion = alloyVersion + "+" + extensionVersion;
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

      var libraryName = "https://ns.adobe.com/experience/alloy/reactor";
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var createComponent$2 = function createComponent$2(config, logger, availableContexts, requiredContexts) {
        var configuredContexts = config.context;
        var contexts = flatMap(configuredContexts, function (context, i) {
          if (availableContexts[context]) {
            return [availableContexts[context]];
          }

          logger.warn("Invalid context[" + i + "]: '" + context + "' is not available.");
          return [];
        }).concat(requiredContexts);
        return {
          namespace: "Context",
          lifecycle: {
            onBeforeEvent: function onBeforeEvent(_ref) {
              var event = _ref.event;
              var xdm = {};
              contexts.forEach(function (context) {
                return context(xdm);
              });
              event.mergeXdm(xdm);
            }
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


      var web = injectWeb(window);
      var device = injectDevice(window);
      var environment = injectEnvironment(window);
      var placeContext = injectPlaceContext(function () {
        return new Date();
      });
      var timestamp = injectTimestamp(function () {
        return new Date();
      });
      var implementationDetails = injectImplementationDetails({
        name: libraryName,
        version: libraryVersion,
        environment: "browser"
      });
      var optionalContexts = {
        web: web,
        device: device,
        environment: environment,
        placeContext: placeContext
      };
      var requiredContexts = [timestamp, implementationDetails];

      var createContext = function createContext(_ref) {
        var config = _ref.config,
            logger = _ref.logger;
        return createComponent$2(config, logger, optionalContexts, requiredContexts);
      };

      createContext.namespace = "Context";
      createContext.configValidators = {
        context: boundArrayOf(boundString())["default"](Object.keys(optionalContexts))
      };

      var createComponent$3 = function createComponent$3(_ref) {
        var readStoredConsent = _ref.readStoredConsent,
            taskQueue = _ref.taskQueue,
            defaultConsent = _ref.defaultConsent,
            consent = _ref.consent,
            sendSetConsentRequest = _ref.sendSetConsentRequest,
            validateSetConsentOptions = _ref.validateSetConsentOptions;
        var consentByPurpose = assign__default['default'](_defineProperty({}, GENERAL, defaultConsent), readStoredConsent());
        consent.setConsent(consentByPurpose);

        var readCookieIfQueueEmpty = function readCookieIfQueueEmpty() {
          if (taskQueue.length === 0) {
            var storedConsent = readStoredConsent(); // Only read cookies when there are no outstanding setConsent
            // requests. This helps with race conditions.

            if (storedConsent) {
              consent.setConsent(storedConsent);
            }
          }
        };

        return {
          commands: {
            setConsent: {
              optionsValidator: validateSetConsentOptions,
              run: function run(_ref2) {
                var consentOptions = _ref2.consent,
                    identityMap = _ref2.identityMap;
                consent.suspend();
                return taskQueue.addTask(function () {
                  return sendSetConsentRequest({
                    consentOptions: consentOptions,
                    identityMap: identityMap
                  });
                })["catch"](function (error) {
                  readCookieIfQueueEmpty();
                  throw error;
                }).then(readCookieIfQueueEmpty);
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


      var createConsentRequestPayload = function createConsentRequestPayload() {
        return createRequestPayload(function (content) {
          return {
            addIdentity: function addIdentity(namespaceCode, identity) {
              content.identityMap = content.identityMap || {};
              content.identityMap[namespaceCode] = content.identityMap[namespaceCode] || [];
              content.identityMap[namespaceCode].push(identity);
            },
            setConsent: function setConsent(consent) {
              content.consent = consent;
            }
          };
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


      var injectReadStoredConsent = function injectReadStoredConsent(_ref) {
        var parseConsentCookie = _ref.parseConsentCookie,
            orgId = _ref.orgId,
            cookieJar = _ref.cookieJar;
        var consentCookieName = getNamespacedCookieName(orgId, CONSENT);
        return function () {
          var cookieValue = cookieJar.get(consentCookieName);
          return cookieValue ? parseConsentCookie(cookieValue) : undefined;
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


      var injectSendSetConsentRequest = function injectSendSetConsentRequest(_ref) {
        var createConsentRequestPayload = _ref.createConsentRequestPayload,
            sendEdgeNetworkRequest = _ref.sendEdgeNetworkRequest;
        return function (_ref2) {
          var consentOptions = _ref2.consentOptions,
              identityMap = _ref2.identityMap;
          var payload = createConsentRequestPayload();
          payload.setConsent(consentOptions);

          if (isObject(identityMap)) {
            Object.keys(identityMap).forEach(function (key) {
              identityMap[key].forEach(function (identity) {
                payload.addIdentity(key, identity);
              });
            });
          }

          return sendEdgeNetworkRequest({
            payload: payload,
            action: "privacy/set-consent"
          }).then(function () {// Don't let response data disseminate beyond this
            // point unless necessary.
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
       * Parses a consent cookie.
       * @param {string} cookieValue Must be in the format a=b;c=d
       * @returns {Object} An object where the keys are purpose names and the values
       * are the consent status for the purpose.
       */


      var parseConsentCookie = function parseConsentCookie(cookieValue) {
        var categoryPairs = cookieValue.split(";");
        return categoryPairs.reduce(function (consentByPurpose, categoryPair) {
          var _categoryPair$split = categoryPair.split("="),
              _categoryPair$split2 = _slicedToArray(_categoryPair$split, 2),
              name = _categoryPair$split2[0],
              value = _categoryPair$split2[1];

          consentByPurpose[name] = value;
          return consentByPurpose;
        }, {});
      };

      var validateSetConsentOptions = boundObjectOf({
        consent: boundArrayOf(boundAnything()).required().nonEmpty(),
        identityMap: validateIdentityMap
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

      var createPrivacy = function createPrivacy(_ref) {
        var config = _ref.config,
            consent = _ref.consent,
            sendEdgeNetworkRequest = _ref.sendEdgeNetworkRequest;
        var orgId = config.orgId,
            defaultConsent = config.defaultConsent;
        var readStoredConsent = injectReadStoredConsent({
          parseConsentCookie: parseConsentCookie,
          orgId: orgId,
          cookieJar: cookie__default['default']
        });
        var taskQueue = createTaskQueue();
        var sendSetConsentRequest = injectSendSetConsentRequest({
          createConsentRequestPayload: createConsentRequestPayload,
          sendEdgeNetworkRequest: sendEdgeNetworkRequest
        });
        return createComponent$3({
          readStoredConsent: readStoredConsent,
          taskQueue: taskQueue,
          defaultConsent: defaultConsent,
          consent: consent,
          sendSetConsentRequest: sendSetConsentRequest,
          validateSetConsentOptions: validateSetConsentOptions
        });
      };

      createPrivacy.namespace = "Privacy";
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var generateEventMergeIdResult = function generateEventMergeIdResult() {
        return {
          eventMergeId: v4_1()
        };
      };

      var createEventMerge = function createEventMerge(_ref) {
        var config = _ref.config; // This is a way for the Event Merge ID data element in the Reactor extension
        // to get an event merge ID synchronously since data elements are required
        // to be synchronous.

        config.reactorRegisterCreateEventMergeId(generateEventMergeIdResult);
        return {
          commands: {
            createEventMergeId: {
              run: generateEventMergeIdResult
            }
          }
        };
      };

      createEventMerge.namespace = "EventMerge";
      createEventMerge.configValidators = {}; // Not much need to validate since we are our own consumer.

      createEventMerge.configValidators.reactorRegisterCreateEventMergeId = boundCallback()["default"](function () {});
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var createLibraryInfo = function createLibraryInfo() {
        return {
          commands: {
            getLibraryInfo: {
              run: function run() {
                return {
                  libraryInfo: {
                    version: libraryVersion
                  }
                };
              }
            }
          }
        };
      };

      createLibraryInfo.namespace = "LibraryInfo";
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */
      // TODO: Figure out how sub-components will be made available/registered

      var componentCreators = [createDataCollector, createActivityCollector, createIdentity, createAudiences, createPersonalization, createContext, createPrivacy, createEventMerge, createLibraryInfo];
      /*
      Copyright 2019 Adobe. All rights reserved.
      This file is licensed to you under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License. You may obtain a copy
      of the License at http://www.apache.org/licenses/LICENSE-2.0
      Unless required by applicable law or agreed to in writing, software distributed under
      the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
      OF ANY KIND, either express or implied. See the License for the specific language
      governing permissions and limitations under the License.
      */

      var CONFIG_DOC_URI = "https://adobe.ly/2M4ErNE";

      var buildSchema = function buildSchema(coreConfigValidators, componentCreators) {
        var schema = {};
        assign__default['default'](schema, coreConfigValidators);
        componentCreators.forEach(function (createComponent) {
          var configValidators = createComponent.configValidators;
          assign__default['default'](schema, configValidators);
        });
        return schema;
      };

      var transformOptions = function transformOptions(schema, options) {
        try {
          var validator = boundObjectOf(schema).noUnknownFields().required();
          return validator(options);
        } catch (e) {
          throw new Error("Resolve these configuration problems:\n\t - " + e.message.split("\n").join("\n\t - ") + "\nFor configuration documentation see: " + CONFIG_DOC_URI);
        }
      };

      var buildAndValidateConfig = function buildAndValidateConfig(_ref) {
        var options = _ref.options,
            componentCreators = _ref.componentCreators,
            coreConfigValidators = _ref.coreConfigValidators,
            createConfig = _ref.createConfig,
            logger = _ref.logger,
            setDebugEnabled = _ref.setDebugEnabled;
        var schema = buildSchema(coreConfigValidators, componentCreators);
        var config = createConfig(transformOptions(schema, options));
        setDebugEnabled(config.debugEnabled, {
          fromConfig: true
        });
        logger.logOnInstanceConfigured({
          config: config
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


      var initializeComponents = function initializeComponents(_ref) {
        var componentCreators = _ref.componentCreators,
            lifecycle = _ref.lifecycle,
            componentRegistry = _ref.componentRegistry,
            getImmediatelyAvailableTools = _ref.getImmediatelyAvailableTools;
        componentCreators.forEach(function (createComponent) {
          var namespace = createComponent.namespace; // TO-DOCUMENT: Helpers that we inject into factories.

          var tools = getImmediatelyAvailableTools(namespace);
          var component;

          try {
            component = createComponent(tools);
          } catch (error) {
            throw stackError({
              error: error,
              message: "[" + namespace + "] An error occurred during component creation."
            });
          }

          componentRegistry.register(namespace, component);
        });
        return lifecycle.onComponentsRegistered({
          lifecycle: lifecycle
        }).then(function () {
          return componentRegistry;
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


      var createConfig = function createConfig(options) {
        return assign__default['default']({}, options);
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


      var EDGE$1 = "edge.adobedc.net";
      var ID_THIRD_PARTY = "adobedc.demdex.net";
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

      var createCoreConfigs = function createCoreConfigs() {
        return {
          debugEnabled: boundBoolean()["default"](false),
          defaultConsent: boundEnumOf(IN, PENDING)["default"](IN),
          edgeConfigId: boundString().unique().required(),
          edgeDomain: boundString().domain()["default"](EDGE$1),
          edgeBasePath: boundString().nonEmpty()["default"](EDGE_BASE_PATH),
          orgId: boundString().unique().required(),
          onBeforeEventSend: boundCallback()["default"](noop)
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


      var injectHandleError = function injectHandleError(_ref) {
        var errorPrefix = _ref.errorPrefix,
            logger = _ref.logger;
        return function (error, operation) {
          var err = toError(error); // In the case of declined consent, we've opted to not reject the promise
          // returned to the customer, but instead resolve the promise with an
          // empty result object.

          if (err.code === DECLINED_CONSENT_ERROR_CODE) {
            logger.warn("The " + operation + " could not fully complete because the user declined consent.");
            return {};
          }

          updateErrorMessage({
            error: err,
            message: errorPrefix + " " + err.message
          });
          throw err;
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


      var injectSendXhrRequest = function injectSendXhrRequest(XMLHttpRequest) {
        return function (url, body) {
          return new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest();

            request.onreadystatechange = function () {
              if (request.readyState === 4) {
                if (request.status === 0) {
                  reject(new Error("Request aborted."));
                } else {
                  resolve({
                    status: request.status,
                    body: request.responseText
                  });
                }
              }
            };

            request.onloadstart = function () {
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


      var injectFetch = function injectFetch(fetch) {
        return function (url, body) {
          return fetch(url, {
            method: "POST",
            cache: "no-cache",
            credentials: "include",
            // To set the cookie header in the request.
            headers: {
              "Content-Type": "text/plain; charset=UTF-8"
            },
            referrer: "client",
            body: body
          }).then(function (response) {
            return response.text().then(function (responseBody) {
              return {
                status: response.status,
                body: responseBody
              };
            });
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


      var injectSendBeacon = function injectSendBeacon(navigator, fetch, logger) {
        return function (url, body) {
          var blob = new Blob([body], {
            type: "text/plain; charset=UTF-8"
          });

          if (!navigator.sendBeacon(url, blob)) {
            logger.log("The `beacon` call has failed; falling back to `fetch`");
            return fetch(url, body);
          } // Using sendBeacon, we technically don't get a response back from
          // the server, but we'll resolve the promise with an object to maintain
          // consistency with other network strategies.


          return Promise.resolve({
            status: 204,
            body: ""
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


      var injectNetworkStrategy = function injectNetworkStrategy(_ref) {
        var window = _ref.window,
            logger = _ref.logger;
        var fetch = isFunction(window.fetch) ? injectFetch(window.fetch) : injectSendXhrRequest(window.XMLHttpRequest);
        var sendBeacon = window.navigator && isFunction(window.navigator.sendBeacon) ? injectSendBeacon(window.navigator, fetch, logger) : fetch;
        return function (_ref2) {
          var url = _ref2.url,
              body = _ref2.body,
              documentMayUnload = _ref2.documentMayUnload;
          var method = documentMayUnload ? sendBeacon : fetch;
          return method(url, body);
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


      var createLogger = function createLogger(_ref) {
        var getDebugEnabled = _ref.getDebugEnabled,
            console = _ref.console,
            getMonitors = _ref.getMonitors,
            context = _ref.context;
        var prefix = "[" + context.instanceName + "]";

        if (context.componentName) {
          prefix += " [" + context.componentName + "]";
        }

        var notifyMonitors = function notifyMonitors(method, data) {
          var monitors = getMonitors();

          if (monitors.length > 0) {
            var dataWithContext = assign__default['default']({}, context, data);
            monitors.forEach(function (monitor) {
              if (monitor[method]) {
                monitor[method](dataWithContext);
              }
            });
          }
        };

        var log = function log(level) {
          for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            rest[_key - 1] = arguments[_key];
          }

          notifyMonitors("onBeforeLog", {
            level: level,
            arguments: rest
          });

          if (getDebugEnabled()) {
            console[level].apply(console, [prefix].concat(rest));
          }
        };

        return {
          get enabled() {
            return getMonitors().length > 0 || getDebugEnabled();
          },

          logOnInstanceCreated: function logOnInstanceCreated(data) {
            notifyMonitors("onInstanceCreated", data);
            log("info", "Instance initialized.");
          },
          logOnInstanceConfigured: function logOnInstanceConfigured(data) {
            notifyMonitors("onInstanceConfigured", data);
            log("info", "Instance configured. Computed configuration:", data.config);
          },
          logOnBeforeCommand: function logOnBeforeCommand(data) {
            notifyMonitors("onBeforeCommand", data);
            log("info", "Executing " + data.commandName + " command. Options:", data.options);
          },
          logOnBeforeNetworkRequest: function logOnBeforeNetworkRequest(data) {
            notifyMonitors("onBeforeNetworkRequest", data);
            log("info", "Request " + data.requestId + ": Sending request.", data.payload);
          },
          logOnNetworkResponse: function logOnNetworkResponse(data) {
            notifyMonitors("onNetworkResponse", data);
            var messagesSuffix = data.parsedBody || data.body ? "response body:" : "no response body.";
            log("info", "Request " + data.requestId + ": Received response with status code " + data.status + " and " + messagesSuffix, data.parsedBody || data.body);
          },
          logOnNetworkError: function logOnNetworkError(data) {
            notifyMonitors("onNetworkError", data);
            log("error", "Request " + data.requestId + ": Network request failed.", data.error);
          },

          /**
           * Outputs a message to the web console.
           * @param {...*} arg Any argument to be logged.
           */
          log: log.bind(null, "log"),

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


      var createEventManager = function createEventManager(_ref) {
        var config = _ref.config,
            logger = _ref.logger,
            lifecycle = _ref.lifecycle,
            consent = _ref.consent,
            createEvent = _ref.createEvent,
            createDataCollectionRequestPayload = _ref.createDataCollectionRequestPayload,
            sendEdgeNetworkRequest = _ref.sendEdgeNetworkRequest;
        var onBeforeEventSend = config.onBeforeEventSend;

        var onBeforeEventSendWithLoggedExceptions = function onBeforeEventSendWithLoggedExceptions() {
          try {
            onBeforeEventSend.apply(void 0, arguments);
          } catch (e) {
            logger.error(e);
            throw e;
          }
        };

        return {
          createEvent: createEvent,

          /**
           * Sends an event. This includes running the event and payload through
           * the appropriate lifecycle hooks, sending the request to the server,
           * and handling the response.
           * @param {Object} event This will be JSON stringified and used inside
           * the request payload.
           * @param {Object} [options]
           * @param {boolean} [options.renderDecisions=false]
           * @param {Array} [options.decisionScopes]
           * This will be passed to components
           * so they can take appropriate action.
           * @returns {*}
           */
          sendEvent: function sendEvent(event) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            event.setLastChanceCallback(onBeforeEventSendWithLoggedExceptions);
            var _options$renderDecisi = options.renderDecisions,
                renderDecisions = _options$renderDecisi === void 0 ? false : _options$renderDecisi,
                decisionScopes = options.decisionScopes;
            var payload = createDataCollectionRequestPayload();
            var onResponseCallbackAggregator = createCallbackAggregator();
            var onRequestFailureCallbackAggregator = createCallbackAggregator();
            return lifecycle.onBeforeEvent({
              event: event,
              renderDecisions: renderDecisions,
              decisionScopes: decisionScopes,
              payload: payload,
              onResponse: onResponseCallbackAggregator.add,
              onRequestFailure: onRequestFailureCallbackAggregator.add
            }).then(function () {
              // it's important to add the event here because the payload object will call toJSON
              // which applies the userData, userXdm, and lastChanceCallback
              payload.addEvent(event);
              return consent.awaitConsent();
            }).then(function () {
              return lifecycle.onBeforeDataCollectionRequest({
                payload: payload,
                onResponse: onResponseCallbackAggregator.add,
                onRequestFailure: onRequestFailureCallbackAggregator.add
              });
            }).then(function () {
              var documentMayUnload = event.getDocumentMayUnload();
              var action = documentMayUnload ? "collect" : "interact";
              return sendEdgeNetworkRequest({
                payload: payload,
                action: action,
                runOnResponseCallbacks: onResponseCallbackAggregator.call,
                runOnRequestFailureCallbacks: onRequestFailureCallbackAggregator.call
              });
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


      var STATE_STORE_HANDLE_TYPE = "state:store";

      var createCookieTransfer = function createCookieTransfer(_ref) {
        var cookieJar = _ref.cookieJar,
            orgId = _ref.orgId,
            apexDomain = _ref.apexDomain;
        return {
          /**
           * When sending to a third-party endpoint, the endpoint won't be able to
           * access first-party cookies, therefore we transfer cookies into
           * the request body so they can be read by the server.
           */
          cookiesToPayload: function cookiesToPayload(payload, endpointDomain) {
            var isEndpointFirstParty = endsWith(endpointDomain, apexDomain);
            var state = {
              domain: apexDomain,
              cookiesEnabled: true
            }; // If the endpoint is first-party, there's no need to transfer cookies
            // to the payload since they'll be automatically passed through cookie
            // headers.

            if (!isEndpointFirstParty) {
              var cookies = cookieJar.get();
              var entries = Object.keys(cookies).filter(function (name) {
                // We have a contract with the server that we will pass
                // all cookies whose names are namespaced according to the
                // logic in isNamespacedCookieName as well as any legacy
                // cookie names (so that the server can handle migrating
                // identities on websites previously using Visitor.js)
                return isNamespacedCookieName(orgId, name);
              }).map(function (qualifyingCookieName) {
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
          responseToCookies: function responseToCookies(response) {
            response.getPayloadsByType(STATE_STORE_HANDLE_TYPE).forEach(function (stateItem) {
              var options = {
                domain: apexDomain
              };

              if (stateItem.maxAge !== undefined) {
                // cookieJar expects "expires" in days
                options.expires = convertTimes(SECOND, DAY, stateItem.maxAge);
              }

              cookieJar.set(stateItem.key, stateItem.value, options);
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


      var createDataCollectionRequestPayload = function createDataCollectionRequestPayload() {
        return createRequestPayload(function (content) {
          return {
            addIdentity: createAddIdentity(content),
            addEvent: function addEvent(event) {
              content.events = content.events || [];
              content.events.push(event);
            },
            getDocumentMayUnload: function getDocumentMayUnload() {
              return (content.events || []).some(function (event) {
                return event.getDocumentMayUnload();
              });
            }
          };
        });
      };

      var apiVersion = "v1";

      var injectSendEdgeNetworkRequest = function injectSendEdgeNetworkRequest(_ref) {
        var config = _ref.config,
            lifecycle = _ref.lifecycle,
            cookieTransfer = _ref.cookieTransfer,
            sendNetworkRequest = _ref.sendNetworkRequest,
            createResponse = _ref.createResponse,
            processWarningsAndErrors = _ref.processWarningsAndErrors,
            validateNetworkResponseIsWellFormed = _ref.validateNetworkResponseIsWellFormed;
        var edgeDomain = config.edgeDomain,
            edgeBasePath = config.edgeBasePath,
            edgeConfigId = config.edgeConfigId;
        /**
         * Sends a network request that is aware of payload interfaces,
         * lifecycle methods, configured edge domains, response structures, etc.
         */

        return function (_ref2) {
          var payload = _ref2.payload,
              action = _ref2.action,
              _ref2$runOnResponseCa = _ref2.runOnResponseCallbacks,
              runOnResponseCallbacks = _ref2$runOnResponseCa === void 0 ? noop : _ref2$runOnResponseCa,
              _ref2$runOnRequestFai = _ref2.runOnRequestFailureCallbacks,
              runOnRequestFailureCallbacks = _ref2$runOnRequestFai === void 0 ? noop : _ref2$runOnRequestFai;
          var onResponseCallbackAggregator = createCallbackAggregator();
          onResponseCallbackAggregator.add(lifecycle.onResponse);
          onResponseCallbackAggregator.add(runOnResponseCallbacks);
          var onRequestFailureCallbackAggregator = createCallbackAggregator();
          onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
          onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);
          return lifecycle.onBeforeRequest({
            payload: payload,
            onResponse: onResponseCallbackAggregator.add,
            onRequestFailure: onRequestFailureCallbackAggregator.add
          }).then(function () {
            var endpointDomain = payload.getUseIdThirdPartyDomain() ? ID_THIRD_PARTY : edgeDomain;
            var requestId = v4_1();
            var url = "https://" + endpointDomain + "/" + edgeBasePath + "/" + apiVersion + "/" + action + "?configId=" + edgeConfigId + "&requestId=" + requestId;
            cookieTransfer.cookiesToPayload(payload, endpointDomain);
            return sendNetworkRequest({
              payload: payload,
              url: url,
              requestId: requestId
            });
          }).then(function (networkResponse) {
            // Will throw an error if malformed.
            validateNetworkResponseIsWellFormed(networkResponse);
            return networkResponse;
          })["catch"](function (error) {
            // Catch errors that came from sendNetworkRequest (like if there's
            // no internet connection) or the error we throw above due to no
            // parsed body, because we handle them the same way.
            var throwError = function throwError() {
              throw error;
            };

            return onRequestFailureCallbackAggregator.call({
              error: error
            }).then(throwError, throwError);
          }).then(function (_ref3) {
            var parsedBody = _ref3.parsedBody,
                statusCode = _ref3.statusCode; // Note that networkResponse.parsedBody may be undefined if it was a
            // 204 No Content response. That's fine.

            var response = createResponse(parsedBody);
            cookieTransfer.responseToCookies(response);

            if (statusCode >= 400) {
              var throwError = function throwError() {
                return processWarningsAndErrors(response);
              };

              return onRequestFailureCallbackAggregator.call({
                response: response
              }).then(throwError, throwError);
            }

            return onResponseCallbackAggregator.call({
              response: response
            }).then(function (returnValues) {
              // This line's location is very important.
              // As long as we received a properly structured response,
              // we consider the response sucessful enough to call lifecycle
              // onResponse methods. However, a structured response from the
              // server may ALSO containing errors. Because of this, we make
              // sure we call lifecycle onResponse methods, then later
              // process the warnings and errors.
              // If there are errors in the response body, an error will
              // be thrown here which should ultimately reject the promise that
              // was returned to the customer for the command they executed.
              processWarningsAndErrors(response); // Merges all returned objects from all `onResponse` callbacks into
              // a single object that can later be returned to the customer.

              var lifecycleOnResponseReturnValues = returnValues.shift() || [];
              var consumerOnResponseReturnValues = returnValues.shift() || [];
              var lifecycleOnBeforeRequestReturnValues = returnValues;
              return assign__default['default'].apply(void 0, [{}].concat(_toConsumableArray(lifecycleOnResponseReturnValues), _toConsumableArray(consumerOnResponseReturnValues), _toConsumableArray(lifecycleOnBeforeRequestReturnValues)));
            });
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


      var injectProcessWarningsAndErrors = function injectProcessWarningsAndErrors(_ref) {
        var logger = _ref.logger;
        /**
         * Processes warnings and errors from a response object. If warnings are found,
         * they will be logged. If errors are found, an error will be thrown with information
         * about the errors received from the server.
         * @param {Object} response
         * @param {Object} logger
         */

        return function (response) {
          // Regardless of whether the response had a successful status code,
          // the response payload may have warnings and errors we still
          // want to process.
          var warnings = response.getWarnings();
          var errors = response.getErrors();
          warnings.forEach(function (warning) {
            logger.warn("Warning received from server: [Code " + warning.code + "] " + warning.message);
          });

          if (errors.length) {
            var errorMessage = errors.reduce(function (memo, error) {
              return memo + "\n\u2022 [Code " + error.code + "] " + error.message;
            }, "The server responded with the following errors:");
            throw new Error(errorMessage);
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


      var NO_CONTENT = 204;
      var TOO_MANY_REQUESTS = 429;
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
       * Ensures that the edge network response is well-formed, or in other words,
       * something that we expect in a successful round-trip to the edge.
       */

      var validateNetworkResponseIsWellFormed = function validateNetworkResponseIsWellFormed(networkResponse) {
        var statusCode = networkResponse.statusCode,
            body = networkResponse.body,
            parsedBody = networkResponse.parsedBody;

        if (!parsedBody && statusCode !== NO_CONTENT || parsedBody && !Array.isArray(parsedBody.handle)) {
          var messageSuffix = body ? "response body: " + body : "no response body.";
          throw new Error("Unexpected server response with status code " + statusCode + " and " + messageSuffix);
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


      var isRetryableHttpStatusCode = function isRetryableHttpStatusCode(statusCode) {
        return statusCode === TOO_MANY_REQUESTS || statusCode >= 500 && statusCode < 600;
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


      var instanceNames = window.__alloyNS;
      var createNamespacedStorage = injectStorage(window);
      var _window = window,
          console = _window.console; // set this up as a function so that monitors can be added at anytime
      // eslint-disable-next-line no-underscore-dangle

      var getMonitors = function getMonitors() {
        return window.__alloyMonitors || [];
      };

      var coreConfigValidators = createCoreConfigs();
      var apexDomain$1 = getApexDomain(window, cookie__default['default']);

      if (instanceNames) {
        instanceNames.forEach(function (instanceName) {
          var _createLogController = createLogController({
            console: console,
            locationSearch: window.location.search,
            createLogger: createLogger,
            instanceName: instanceName,
            createNamespacedStorage: createNamespacedStorage,
            getMonitors: getMonitors
          }),
              setDebugEnabled = _createLogController.setDebugEnabled,
              logger = _createLogController.logger,
              createComponentLogger = _createLogController.createComponentLogger;

          var componentRegistry = createComponentRegistry();
          var lifecycle = createLifecycle(componentRegistry);
          var networkStrategy = injectNetworkStrategy({
            window: window,
            logger: logger
          });

          var setDebugCommand = function setDebugCommand(options) {
            setDebugEnabled(options.enabled, {
              fromConfig: false
            });
          };

          var configureCommand = function configureCommand(options) {
            var config = buildAndValidateConfig({
              options: options,
              componentCreators: componentCreators,
              coreConfigValidators: coreConfigValidators,
              createConfig: createConfig,
              logger: logger,
              setDebugEnabled: setDebugEnabled
            });
            var cookieTransfer = createCookieTransfer({
              cookieJar: cookie__default['default'],
              orgId: config.orgId,
              apexDomain: apexDomain$1
            });
            var sendNetworkRequest = injectSendNetworkRequest({
              logger: logger,
              networkStrategy: networkStrategy,
              isRetryableHttpStatusCode: isRetryableHttpStatusCode
            });
            var processWarningsAndErrors = injectProcessWarningsAndErrors({
              logger: logger
            });
            var sendEdgeNetworkRequest = injectSendEdgeNetworkRequest({
              config: config,
              lifecycle: lifecycle,
              cookieTransfer: cookieTransfer,
              sendNetworkRequest: sendNetworkRequest,
              createResponse: createResponse,
              processWarningsAndErrors: processWarningsAndErrors,
              validateNetworkResponseIsWellFormed: validateNetworkResponseIsWellFormed
            });
            var generalConsentState = createConsentStateMachine();
            var consent = createConsent({
              generalConsentState: generalConsentState,
              logger: logger
            });
            var eventManager = createEventManager({
              config: config,
              logger: logger,
              lifecycle: lifecycle,
              consent: consent,
              createEvent: createEvent,
              createDataCollectionRequestPayload: createDataCollectionRequestPayload,
              sendEdgeNetworkRequest: sendEdgeNetworkRequest
            });
            return initializeComponents({
              componentCreators: componentCreators,
              lifecycle: lifecycle,
              componentRegistry: componentRegistry,
              getImmediatelyAvailableTools: function getImmediatelyAvailableTools(componentName) {
                var componentLogger = createComponentLogger(componentName);
                return {
                  config: config,
                  consent: consent,
                  eventManager: eventManager,
                  logger: componentLogger,
                  lifecycle: lifecycle,
                  sendEdgeNetworkRequest: sendEdgeNetworkRequest,
                  handleError: injectHandleError({
                    errorPrefix: "[" + instanceName + "] [" + componentName + "]",
                    logger: componentLogger
                  })
                };
              }
            });
          };

          var handleError = injectHandleError({
            errorPrefix: "[" + instanceName + "]",
            logger: logger
          });
          var executeCommand = injectExecuteCommand({
            logger: logger,
            configureCommand: configureCommand,
            setDebugCommand: setDebugCommand,
            handleError: handleError,
            validateCommandOptions: validateCommandOptions
          });
          var instance = createInstance(executeCommand);
          var queue = window[instanceName].q;
          queue.push = instance;
          logger.logOnInstanceCreated({
            instance: instance
          });
          queue.forEach(instance);
        });
      }
    })();
  } /////////////////////////////
  // END OF LIBRARY CODE
  /////////////////////////////

};
          }

        },
        "adobe-alloy/dist/lib/instanceManager/createInstanceManager.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
module.exports = function (_ref) {
  var turbine = _ref.turbine,
      window = _ref.window,
      runAlloy = _ref.runAlloy,
      orgId = _ref.orgId;

  var _turbine$getExtension = turbine.getExtensionSettings(),
      instancesSettings = _turbine$getExtension.instances;

  var instanceNames = instancesSettings.map(function (instanceSettings) {
    return instanceSettings.name;
  });
  var instanceByName = {};

  var _createEventMergeId2;

  runAlloy(instanceNames);
  instancesSettings.forEach(function (_ref2) {
    var name = _ref2.name,
        edgeConfigId = _ref2.edgeConfigId,
        stagingEdgeConfigId = _ref2.stagingEdgeConfigId,
        developmentEdgeConfigId = _ref2.developmentEdgeConfigId,
        options = _objectWithoutProperties(_ref2, ["name", "edgeConfigId", "stagingEdgeConfigId", "developmentEdgeConfigId"]);

    var computedEdgeConfigId = turbine.buildInfo.environment === "development" && developmentEdgeConfigId || turbine.buildInfo.environment === "staging" && stagingEdgeConfigId || edgeConfigId;
    var instance = window[name];
    instanceByName[name] = instance;
    instance("configure", _objectSpread({}, options, {
      edgeConfigId: computedEdgeConfigId,
      debugEnabled: turbine.debugEnabled,
      orgId: options.orgId || orgId,
      // The Alloy build we're using for this extension
      // provides a backdoor to perform certain operations
      // synchronously, because Reactor requires that data
      // elements be resolved synchronously for now.
      // In this case, the function exposed from Alloy for
      // creating an event merge ID is not instance-specific,
      // so there's no need to segregate it by instance.
      // This actually makes things a bit simpler, because
      // when a user is creating an event merge ID data element,
      // we don't need/want the user to have to bother with
      // selecting a specific instance.
      reactorRegisterCreateEventMergeId: function reactorRegisterCreateEventMergeId(_createEventMergeId) {
        _createEventMergeId2 = _createEventMergeId;
      }
    }));
    turbine.onDebugChanged(function (enabled) {
      instance("setDebug", {
        enabled: enabled
      });
    });
  });
  return {
    /**
     * Returns an instance by name.
     * @param name
     * @returns {Function}
     */
    getInstance: function getInstance(name) {
      return instanceByName[name];
    },

    /**
     * Synchronously creates an event merge ID.
     * @returns {string}
     */
    createEventMergeId: function createEventMergeId() {
      return _createEventMergeId2();
    }
  };
};
          }

        }
      },
      "settings": {
        "instances": [
          {
            "name": "alloy",
            "edgeDomain": "firstparty.alloyio.com",
            "edgeConfigId": "1b86778b-cdba-4684-9903-750e52912ad1",
            "stagingEdgeConfigId": "1b86778b-cdba-4684-9903-750e52912ad1:stage",
            "developmentEdgeConfigId": "1b86778b-cdba-4684-9903-750e52912ad1:dev"
          }
        ]
      },
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/52f9f604c48e/b62bae94dde2/hostedLibFiles/EP4426249d34fd41a594efc0decc99e6cb/"
    },
    "core": {
      "displayName": "Core",
      "modules": {
        "core/src/lib/events/libraryLoaded.js": {
          "name": "library-loaded",
          "displayName": "Library Loaded (Page Top)",
          "script": function(module, exports, require, turbine) {
/***************************************************************************************
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

var pageLifecycleEvents = require('./helpers/pageLifecycleEvents');

/**
 * Library loaded event. This event occurs as soon as the runtime library is loaded.
 * @param {Object} settings The event settings object.
 * @param {ruleTrigger} trigger The trigger callback.
 */
module.exports = function(settings, trigger) {
  pageLifecycleEvents.registerLibraryLoadedTrigger(trigger);
};

          }

        },
        "core/src/lib/events/helpers/pageLifecycleEvents.js": {
          "script": function(module, exports, require, turbine) {
/***************************************************************************************
 * (c) 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

'use strict';

// We need to be able to fire the rules in a specific order, no matter if the library is loaded
// sync or async. The rules are fired in the following order:
// Library loaded rules -> Page bottom rules -> Dom Ready rules -> Window load rules.

var window = require('@adobe/reactor-window');
var document = require('@adobe/reactor-document');

var isIE10 = window.navigator.appVersion.indexOf('MSIE 10') !== -1;
var WINDOW_LOADED = 'WINDOW_LOADED';
var DOM_READY = 'DOM_READY';
var PAGE_BOTTOM = 'PAGE_BOTTOM';

var lifecycleEventsOrder = [PAGE_BOTTOM, DOM_READY, WINDOW_LOADED];

var createSyntheticEvent = function(element, nativeEvent) {
  return {
    element: element,
    target: element,
    nativeEvent: nativeEvent
  };
};

var registry = {};
lifecycleEventsOrder.forEach(function(event) {
  registry[event] = [];
});

var processRegistry = function(lifecycleEvent, nativeEvent) {
  lifecycleEventsOrder
    .slice(0, getLifecycleEventIndex(lifecycleEvent) + 1)
    .forEach(function(lifecycleEvent) {
      processTriggers(nativeEvent, lifecycleEvent);
    });
};

var detectLifecycleEvent = function() {
  if (document.readyState === 'complete') {
    return WINDOW_LOADED;
  } else if (document.readyState === 'interactive') {
    return !isIE10 ? DOM_READY : null;
  }
};

var getLifecycleEventIndex = function(event) {
  return lifecycleEventsOrder.indexOf(event);
};

var processTriggers = function(nativeEvent, lifecycleEvent) {
  registry[lifecycleEvent].forEach(function(triggerData) {
    processTrigger(nativeEvent, triggerData);
  });
  registry[lifecycleEvent] = [];
};

var processTrigger = function(nativeEvent, triggerData) {
  var trigger = triggerData.trigger;
  var syntheticEventFn = triggerData.syntheticEventFn;

  trigger(syntheticEventFn ? syntheticEventFn(nativeEvent) : null);
};

window._satellite = window._satellite || {};
window._satellite.pageBottom = processRegistry.bind(null, PAGE_BOTTOM);

document.addEventListener(
  'DOMContentLoaded',
  processRegistry.bind(null, DOM_READY),
  true
);
window.addEventListener(
  'load',
  processRegistry.bind(null, WINDOW_LOADED),
  true
);

// Depending on the way the Launch library was loaded, none of the registered listeners that
// execute `processRegistry` may fire . We need to execute the `processRegistry` method at
// least once. If this timeout fires before any of the registered listeners, we auto-detect the
// current lifecycle event and fire all the registered triggers in order. We don't care if the
// `processRegistry` is called multiple times for the same lifecycle event. We fire the registered
// triggers for a lifecycle event only once. We used a `setTimeout` here to make sure all the rules
// using Library Loaded are registered and executed synchronously and before rules using any of the
// other lifecycle event types.
window.setTimeout(function() {
  var lifecycleEvent = detectLifecycleEvent();
  if (lifecycleEvent) {
    processRegistry(lifecycleEvent);
  }
}, 0);

module.exports = {
  registerLibraryLoadedTrigger: function(trigger) {
    trigger();
  },
  registerPageBottomTrigger: function(trigger) {
    registry[PAGE_BOTTOM].push({
      trigger: trigger
    });
  },
  registerDomReadyTrigger: function(trigger) {
    registry[DOM_READY].push({
      trigger: trigger,
      syntheticEventFn: createSyntheticEvent.bind(null, document)
    });
  },
  registerWindowLoadedTrigger: function(trigger) {
    registry[WINDOW_LOADED].push({
      trigger: trigger,
      syntheticEventFn: createSyntheticEvent.bind(null, window)
    });
  }
};

          }

        }
      },
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/52f9f604c48e/b62bae94dde2/hostedLibFiles/EP2e2f86ba46954a2b8a2b3bb72276b9f8/"
    }
  },
  "company": {
    "orgId": "97D1F3F459CE0AD80A495CBE@AdobeOrg"
  },
  "property": {
    "name": "Benchmark: Analytics w/ Alloy",
    "settings": {
      "domains": [
        "alloyio.com"
      ],
      "undefinedVarsReturnEmpty": false,
      "ruleComponentSequencingEnabled": true
    }
  },
  "rules": [
    {
      "id": "RL35595ab53b844c98a1664e543cee633d",
      "name": "Send Beacon",
      "events": [
        {
          "modulePath": "core/src/lib/events/libraryLoaded.js",
          "settings": {
          },
          "ruleOrder": 50.0
        }
      ],
      "conditions": [

      ],
      "actions": [
        {
          "modulePath": "adobe-alloy/dist/lib/actions/sendEvent/index.js",
          "settings": {
            "instanceName": "alloy"
          },
          "timeout": 2000,
          "delayNext": true
        }
      ]
    }
  ]
}
})();

var _satellite = (function () {
  'use strict';

  if (!window.atob) { console.warn('Adobe Launch is unsupported in IE 9 and below.'); return; }

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

  /**
   * Rules can be ordered by users at the event type level. For example, assume both Rule A and Rule B
   * use the Library Loaded and Window Loaded event types. Rule A can be ordered to come before Rule B
   * on Library Loaded but after Rule B on Window Loaded.
   *
   * Order values are integers and act more as a priority. In other words, multiple rules can have the
   * same order value. If they have the same order value, their order of execution should be
   * considered nondetermistic.
   *
   * @param {Array} rules
   * @returns {Array} An ordered array of rule-event pair objects.
   */
  var buildRuleExecutionOrder = function (rules) {
    var ruleEventPairs = [];

    rules.forEach(function (rule) {
      if (rule.events) {
        rule.events.forEach(function (event) {
          ruleEventPairs.push({
            rule: rule,
            event: event
          });
        });
      }
    });

    return ruleEventPairs.sort(function (ruleEventPairA, ruleEventPairB) {
      return ruleEventPairA.event.ruleOrder - ruleEventPairB.event.ruleOrder;
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
  var DEBUG_LOCAL_STORAGE_NAME = 'debug';

  var createDebugController = function (localStorage, logger) {
    var getPersistedDebugEnabled = function () {
      return localStorage.getItem(DEBUG_LOCAL_STORAGE_NAME) === 'true';
    };

    var setPersistedDebugEnabled = function (enabled) {
      localStorage.setItem(DEBUG_LOCAL_STORAGE_NAME, enabled);
    };

    var debugChangedCallbacks = [];
    var onDebugChanged = function (callback) {
      debugChangedCallbacks.push(callback);
    };

    logger.outputEnabled = getPersistedDebugEnabled();

    return {
      onDebugChanged: onDebugChanged,
      getDebugEnabled: getPersistedDebugEnabled,
      setDebugEnabled: function (enabled) {
        if (getPersistedDebugEnabled() !== enabled) {
          setPersistedDebugEnabled(enabled);
          logger.outputEnabled = enabled;
          debugChangedCallbacks.forEach(function (callback) {
            callback(enabled);
          });
        }
      }
    };
  };

  /***************************************************************************************
   * (c) 2018 Adobe. All rights reserved.
   * This file is licensed to you under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License. You may obtain a copy
   * of the License at http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software distributed under
   * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
   * OF ANY KIND, either express or implied. See the License for the specific language
   * governing permissions and limitations under the License.
   ****************************************************************************************/

  var MODULE_NOT_FUNCTION_ERROR = 'Module did not export a function.';

  var createExecuteDelegateModule = function (moduleProvider, replaceTokens) {
    return function (moduleDescriptor, syntheticEvent, moduleCallParameters) {
      moduleCallParameters = moduleCallParameters || [];
      var moduleExports = moduleProvider.getModuleExports(
        moduleDescriptor.modulePath
      );

      if (typeof moduleExports !== 'function') {
        throw new Error(MODULE_NOT_FUNCTION_ERROR);
      }

      var settings = replaceTokens(
        moduleDescriptor.settings || {},
        syntheticEvent
      );
      return moduleExports.bind(null, settings).apply(null, moduleCallParameters);
    };
  };

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

  /**
   * "Cleans" text by trimming the string and removing spaces and newlines.
   * @param {string} str The string to clean.
   * @returns {string}
   */
  var cleanText = function (str) {
    return typeof str === 'string' ? str.replace(/\s+/g, ' ').trim() : str;
  };

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

  /**
   * Log levels.
   * @readonly
   * @enum {string}
   * @private
   */
  var levels = {
    LOG: 'log',
    INFO: 'info',
    DEBUG: 'debug',
    WARN: 'warn',
    ERROR: 'error'
  };

  /**
   * Rocket unicode surrogate pair.
   * @type {string}
   */
  var ROCKET = '\uD83D\uDE80';

  /**
   * The user's internet explorer version. If they're not running internet explorer, then it should
   * be NaN.
   * @type {Number}
   */
  var ieVersion = parseInt(
    (/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]
  );

  /**
   * Prefix to use on all messages. The rocket unicode doesn't work on IE 10.
   * @type {string}
   */
  var launchPrefix = ieVersion === 10 ? '[Launch]' : ROCKET;

  /**
   * Whether logged messages should be output to the console.
   * @type {boolean}
   */
  var outputEnabled = false;

  /**
   * Processes a log message.
   * @param {string} level The level of message to log.
   * @param {...*} arg Any argument to be logged.
   * @private
   */
  var process = function (level) {
    if (outputEnabled && window.console) {
      var logArguments = Array.prototype.slice.call(arguments, 1);
      logArguments.unshift(launchPrefix);
      // window.debug is unsupported in IE 10
      if (level === levels.DEBUG && !window.console[level]) {
        level = levels.INFO;
      }
      window.console[level].apply(window.console, logArguments);
    }
  };

  /**
   * Outputs a message to the web console.
   * @param {...*} arg Any argument to be logged.
   */
  var log = process.bind(null, levels.LOG);

  /**
   * Outputs informational message to the web console. In some browsers a small "i" icon is
   * displayed next to these items in the web console's log.
   * @param {...*} arg Any argument to be logged.
   */
  var info = process.bind(null, levels.INFO);

  /**
   * Outputs debug message to the web console. In browsers that do not support
   * console.debug, console.info is used instead.
   * @param {...*} arg Any argument to be logged.
   */
  var debug = process.bind(null, levels.DEBUG);

  /**
   * Outputs a warning message to the web console.
   * @param {...*} arg Any argument to be logged.
   */
  var warn = process.bind(null, levels.WARN);

  /**
   * Outputs an error message to the web console.
   * @param {...*} arg Any argument to be logged.
   */
  var error = process.bind(null, levels.ERROR);

  var logger = {
    log: log,
    info: info,
    debug: debug,
    warn: warn,
    error: error,
    /**
     * Whether logged messages should be output to the console.
     * @type {boolean}
     */
    get outputEnabled() {
      return outputEnabled;
    },
    set outputEnabled(value) {
      outputEnabled = value;
    },
    /**
     * Creates a logging utility that only exposes logging functionality and prefixes all messages
     * with an identifier.
     */
    createPrefixedLogger: function (identifier) {
      var loggerSpecificPrefix = '[' + identifier + ']';

      return {
        log: log.bind(null, loggerSpecificPrefix),
        info: info.bind(null, loggerSpecificPrefix),
        debug: debug.bind(null, loggerSpecificPrefix),
        warn: warn.bind(null, loggerSpecificPrefix),
        error: error.bind(null, loggerSpecificPrefix)
      };
    }
  };

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var js_cookie = createCommonjsModule(function (module, exports) {
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
  }(function () {
  	function extend () {
  		var i = 0;
  		var result = {};
  		for (; i < arguments.length; i++) {
  			var attributes = arguments[ i ];
  			for (var key in attributes) {
  				result[key] = attributes[key];
  			}
  		}
  		return result;
  	}

  	function decode (s) {
  		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
  	}

  	function init (converter) {
  		function api() {}

  		function set (key, value, attributes) {
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

  			value = converter.write ?
  				converter.write(value, key) :
  				encodeURIComponent(String(value))
  					.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

  			key = encodeURIComponent(String(key))
  				.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
  				.replace(/[\(\)]/g, escape);

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

  			return (document.cookie = key + '=' + value + stringifiedAttributes);
  		}

  		function get (key, json) {
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
  					cookie = (converter.read || converter)(cookie, name) ||
  						decode(cookie);

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
  }));
  });

  // js-cookie has other methods that we haven't exposed here. By limiting the exposed API,
  // we have a little more flexibility to change the underlying implementation later. If clear
  // use cases come up for needing the other methods js-cookie exposes, we can re-evaluate whether
  // we want to expose them here.
  var reactorCookie = {
    get: js_cookie.get,
    set: js_cookie.set,
    remove: js_cookie.remove
  };

  var reactorWindow = window;

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


  var NAMESPACE = 'com.adobe.reactor.';

  var getNamespacedStorage = function (storageType, additionalNamespace) {
    var finalNamespace = NAMESPACE + (additionalNamespace || '');

    // When storage is disabled on Safari, the mere act of referencing window.localStorage
    // or window.sessionStorage throws an error. For this reason, we wrap in a try-catch.
    return {
      /**
       * Reads a value from storage.
       * @param {string} name The name of the item to be read.
       * @returns {string}
       */
      getItem: function (name) {
        try {
          return reactorWindow[storageType].getItem(finalNamespace + name);
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
      setItem: function (name, value) {
        try {
          reactorWindow[storageType].setItem(finalNamespace + name, value);
          return true;
        } catch (e) {
          return false;
        }
      }
    };
  };

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




  var COOKIE_PREFIX = '_sdsat_';

  var DATA_ELEMENTS_NAMESPACE = 'dataElements.';
  var MIGRATED_KEY = 'dataElementCookiesMigrated';

  var reactorLocalStorage = getNamespacedStorage('localStorage');
  var dataElementSessionStorage = getNamespacedStorage(
    'sessionStorage',
    DATA_ELEMENTS_NAMESPACE
  );
  var dataElementLocalStorage = getNamespacedStorage(
    'localStorage',
    DATA_ELEMENTS_NAMESPACE
  );

  var storageDurations = {
    PAGEVIEW: 'pageview',
    SESSION: 'session',
    VISITOR: 'visitor'
  };

  var pageviewCache = {};

  var serialize = function (value) {
    var serialized;

    try {
      // On some browsers, with some objects, errors will be thrown during serialization. For example,
      // in Chrome with the window object, it will throw "TypeError: Converting circular structure
      // to JSON"
      serialized = JSON.stringify(value);
    } catch (e) {}

    return serialized;
  };

  var setValue = function (key, storageDuration, value) {
    var serializedValue;

    switch (storageDuration) {
      case storageDurations.PAGEVIEW:
        pageviewCache[key] = value;
        return;
      case storageDurations.SESSION:
        serializedValue = serialize(value);
        if (serializedValue) {
          dataElementSessionStorage.setItem(key, serializedValue);
        }
        return;
      case storageDurations.VISITOR:
        serializedValue = serialize(value);
        if (serializedValue) {
          dataElementLocalStorage.setItem(key, serializedValue);
        }
        return;
    }
  };

  var getValue = function (key, storageDuration) {
    var value;

    // It should consistently return the same value if no stored item was found. We chose null,
    // though undefined could be a reasonable value as well.
    switch (storageDuration) {
      case storageDurations.PAGEVIEW:
        return pageviewCache.hasOwnProperty(key) ? pageviewCache[key] : null;
      case storageDurations.SESSION:
        value = dataElementSessionStorage.getItem(key);
        return value === null ? value : JSON.parse(value);
      case storageDurations.VISITOR:
        value = dataElementLocalStorage.getItem(key);
        return value === null ? value : JSON.parse(value);
    }
  };

  // Remove when migration period has ended. We intentionally leave cookies as they are so that if
  // DTM is running on the same domain it can still use the persisted values. Our migration strategy
  // is essentially copying data from cookies and then diverging the storage mechanism between
  // DTM and Launch (DTM uses cookies and Launch uses session and local storage).
  var migrateDataElement = function (dataElementName, storageDuration) {
    var storedValue = reactorCookie.get(COOKIE_PREFIX + dataElementName);

    if (storedValue !== undefined) {
      setValue(dataElementName, storageDuration, storedValue);
    }
  };

  var migrateCookieData = function (dataElements) {
    if (!reactorLocalStorage.getItem(MIGRATED_KEY)) {
      Object.keys(dataElements).forEach(function (dataElementName) {
        migrateDataElement(
          dataElementName,
          dataElements[dataElementName].storageDuration
        );
      });

      reactorLocalStorage.setItem(MIGRATED_KEY, true);
    }
  };

  var dataElementSafe = {
    setValue: setValue,
    getValue: getValue,
    migrateCookieData: migrateCookieData
  };

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





  var getErrorMessage = function (
    dataDef,
    dataElementName,
    errorMessage,
    errorStack
  ) {
    return (
      'Failed to execute data element module ' +
      dataDef.modulePath +
      ' for data element ' +
      dataElementName +
      '. ' +
      errorMessage +
      (errorStack ? '\n' + errorStack : '')
    );
  };

  var createGetDataElementValue = function (
    moduleProvider,
    getDataElementDefinition,
    replaceTokens,
    undefinedVarsReturnEmpty
  ) {
    return function (name, syntheticEvent) {
      var dataDef = getDataElementDefinition(name);

      if (!dataDef) {
        return undefinedVarsReturnEmpty ? '' : undefined;
      }

      var storageDuration = dataDef.storageDuration;
      var moduleExports;

      try {
        moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);
      } catch (e) {
        logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
        return;
      }

      if (typeof moduleExports !== 'function') {
        logger.error(
          getErrorMessage(dataDef, name, 'Module did not export a function.')
        );
        return;
      }

      var value;

      try {
        value = moduleExports(
          replaceTokens(dataDef.settings, syntheticEvent),
          syntheticEvent
        );
      } catch (e) {
        logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
        return;
      }

      if (storageDuration) {
        if (value != null) {
          dataElementSafe.setValue(name, storageDuration, value);
        } else {
          value = dataElementSafe.getValue(name, storageDuration);
        }
      }

      if (value == null && dataDef.defaultValue != null) {
        value = dataDef.defaultValue;
      }

      if (typeof value === 'string') {
        if (dataDef.cleanText) {
          value = cleanText(value);
        }

        if (dataDef.forceLowerCase) {
          value = value.toLowerCase();
        }
      }

      return value;
    };
  };

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



  var specialPropertyAccessors = {
    text: function (obj) {
      return obj.textContent;
    },
    cleanText: function (obj) {
      return cleanText(obj.textContent);
    }
  };

  /**
   * This returns the value of a property at a given path. For example, a <code>path<code> of
   * <code>foo.bar</code> will return the value of <code>obj.foo.bar</code>.
   *
   * In addition, if <code>path</code> is <code>foo.bar.getAttribute(unicorn)</code> and
   * <code>obj.foo.bar</code> has a method named <code>getAttribute</code>, the method will be
   * called with a value of <code>"unicorn"</code> and the value will be returned.
   *
   * Also, if <code>path</code> is <code>foo.bar.@text</code> or other supported properties
   * beginning with <code>@</code>, a special accessor will be used.
   *
   * @param host
   * @param path
   * @param supportSpecial
   * @returns {*}
   */
  var getObjectProperty = function (host, propChain, supportSpecial) {
    var value = host;
    var attrMatch;
    for (var i = 0, len = propChain.length; i < len; i++) {
      if (value == null) {
        return undefined;
      }
      var prop = propChain[i];
      if (supportSpecial && prop.charAt(0) === '@') {
        var specialProp = prop.slice(1);
        value = specialPropertyAccessors[specialProp](value);
        continue;
      }
      if (
        value.getAttribute &&
        (attrMatch = prop.match(/^getAttribute\((.+)\)$/))
      ) {
        var attr = attrMatch[1];
        value = value.getAttribute(attr);
        continue;
      }
      value = value[prop];
    }
    return value;
  };

  /**
   * Returns the value of a variable.
   * @param {string} variable
   * @param {Object} [syntheticEvent] A synthetic event. Only required when using %event... %this...
   * or %target...
   * @returns {*}
   */
  var createGetVar = function (
    customVars,
    getDataElementDefinition,
    getDataElementValue
  ) {
    return function (variable, syntheticEvent) {
      var value;

      if (getDataElementDefinition(variable)) {
        // Accessing nested properties of a data element using dot-notation is unsupported because
        // users can currently create data elements with periods in the name.
        value = getDataElementValue(variable, syntheticEvent);
      } else {
        var propChain = variable.split('.');
        var variableHostName = propChain.shift();

        if (variableHostName === 'this') {
          if (syntheticEvent) {
            // I don't know why this is the only one that supports special properties, but that's the
            // way it was in Satellite.
            value = getObjectProperty(syntheticEvent.element, propChain, true);
          }
        } else if (variableHostName === 'event') {
          if (syntheticEvent) {
            value = getObjectProperty(syntheticEvent, propChain);
          }
        } else if (variableHostName === 'target') {
          if (syntheticEvent) {
            value = getObjectProperty(syntheticEvent.target, propChain);
          }
        } else {
          value = getObjectProperty(customVars[variableHostName], propChain);
        }
      }

      return value;
    };
  };

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

  /**
   * Determines if the provided name is a valid variable, where the variable
   * can be a data element, element, event, target, or custom var.
   * @param variableName
   * @returns {boolean}
   */
  var createIsVar = function (customVars, getDataElementDefinition) {
    return function (variableName) {
      var nameBeforeDot = variableName.split('.')[0];

      return Boolean(
        getDataElementDefinition(variableName) ||
          nameBeforeDot === 'this' ||
          nameBeforeDot === 'event' ||
          nameBeforeDot === 'target' ||
          customVars.hasOwnProperty(nameBeforeDot)
      );
    };
  };

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

  var extractModuleExports = function (script, require, turbine) {
    var module = {
      exports: {}
    };

    script.call(module.exports, module, module.exports, require, turbine);

    return module.exports;
  };

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




  var createModuleProvider = function () {
    var moduleByReferencePath = {};

    var getModule = function (referencePath) {
      var module = moduleByReferencePath[referencePath];

      if (!module) {
        throw new Error('Module ' + referencePath + ' not found.');
      }

      return module;
    };

    var registerModule = function (
      referencePath,
      moduleDefinition,
      extensionName,
      require,
      turbine
    ) {
      var module = {
        definition: moduleDefinition,
        extensionName: extensionName,
        require: require,
        turbine: turbine
      };
      module.require = require;
      moduleByReferencePath[referencePath] = module;
    };

    var hydrateCache = function () {
      Object.keys(moduleByReferencePath).forEach(function (referencePath) {
        try {
          getModuleExports(referencePath);
        } catch (e) {
          var errorMessage =
            'Error initializing module ' +
            referencePath +
            '. ' +
            e.message +
            (e.stack ? '\n' + e.stack : '');
          logger.error(errorMessage);
        }
      });
    };

    var getModuleExports = function (referencePath) {
      var module = getModule(referencePath);

      // Using hasOwnProperty instead of a falsey check because the module could export undefined
      // in which case we don't want to execute the module each time the exports is requested.
      if (!module.hasOwnProperty('exports')) {
        module.exports = extractModuleExports(
          module.definition.script,
          module.require,
          module.turbine
        );
      }

      return module.exports;
    };

    var getModuleDefinition = function (referencePath) {
      return getModule(referencePath).definition;
    };

    var getModuleExtensionName = function (referencePath) {
      return getModule(referencePath).extensionName;
    };

    return {
      registerModule: registerModule,
      hydrateCache: hydrateCache,
      getModuleExports: getModuleExports,
      getModuleDefinition: getModuleDefinition,
      getModuleExtensionName: getModuleExtensionName
    };
  };

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


  var warningLogged = false;

  var createNotifyMonitors = function (_satellite) {
    return function (type, event) {
      var monitors = _satellite._monitors;

      if (monitors) {
        if (!warningLogged) {
          logger.warn(
            'The _satellite._monitors API may change at any time and should only ' +
              'be used for debugging.'
          );
          warningLogged = true;
        }

        monitors.forEach(function (monitor) {
          if (monitor[type]) {
            monitor[type](event);
          }
        });
      }
    };
  };

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



  /**
   * Replacing any variable tokens (%myDataElement%, %this.foo%, etc.) with their associated values.
   * A new string, object, or array will be created; the thing being processed will never be
   * modified.
   * @param {*} thing Thing potentially containing variable tokens. Objects and arrays will be
   * deeply processed.
   * @param {HTMLElement} [element] Associated HTML element. Used for special tokens
   * (%this.something%).
   * @param {Object} [event] Associated event. Used for special tokens (%event.something%,
   * %target.something%)
   * @returns {*} A processed value.
   */
  var createReplaceTokens = function (isVar, getVar, undefinedVarsReturnEmpty) {
    var replaceTokensInString;
    var replaceTokensInObject;
    var replaceTokensInArray;
    var replaceTokens;
    var variablesBeingRetrieved = [];

    var getVarValue = function (token, variableName, syntheticEvent) {
      if (!isVar(variableName)) {
        return token;
      }

      variablesBeingRetrieved.push(variableName);
      var val = getVar(variableName, syntheticEvent);
      variablesBeingRetrieved.pop();
      return val == null && undefinedVarsReturnEmpty ? '' : val;
    };

    /**
     * Perform variable substitutions to a string where tokens are specified in the form %foo%.
     * If the only content of the string is a single data element token, then the raw data element
     * value will be returned instead.
     *
     * @param str {string} The string potentially containing data element tokens.
     * @param element {HTMLElement} The element to use for tokens in the form of %this.property%.
     * @param event {Object} The event object to use for tokens in the form of %target.property%.
     * @returns {*}
     */
    replaceTokensInString = function (str, syntheticEvent) {
      // Is the string a single data element token and nothing else?
      var result = /^%([^%]+)%$/.exec(str);

      if (result) {
        return getVarValue(str, result[1], syntheticEvent);
      } else {
        return str.replace(/%(.+?)%/g, function (token, variableName) {
          return getVarValue(token, variableName, syntheticEvent);
        });
      }
    };

    replaceTokensInObject = function (obj, syntheticEvent) {
      var ret = {};
      var keys = Object.keys(obj);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = obj[key];
        ret[key] = replaceTokens(value, syntheticEvent);
      }
      return ret;
    };

    replaceTokensInArray = function (arr, syntheticEvent) {
      var ret = [];
      for (var i = 0, len = arr.length; i < len; i++) {
        ret.push(replaceTokens(arr[i], syntheticEvent));
      }
      return ret;
    };

    replaceTokens = function (thing, syntheticEvent) {
      if (typeof thing === 'string') {
        return replaceTokensInString(thing, syntheticEvent);
      } else if (Array.isArray(thing)) {
        return replaceTokensInArray(thing, syntheticEvent);
      } else if (typeof thing === 'object' && thing !== null) {
        return replaceTokensInObject(thing, syntheticEvent);
      }

      return thing;
    };

    return function (thing, syntheticEvent) {
      // It's possible for a data element to reference another data element. Because of this,
      // we need to prevent circular dependencies from causing an infinite loop.
      if (variablesBeingRetrieved.length > 10) {
        logger.error(
          'Data element circular reference detected: ' +
            variablesBeingRetrieved.join(' -> ')
        );
        return thing;
      }

      return replaceTokens(thing, syntheticEvent);
    };
  };

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

  var createSetCustomVar = function (customVars) {
    return function () {
      if (typeof arguments[0] === 'string') {
        customVars[arguments[0]] = arguments[1];
      } else if (arguments[0]) {
        // assume an object literal
        var mapping = arguments[0];
        for (var key in mapping) {
          customVars[key] = mapping[key];
        }
      }
    };
  };

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(
      function(value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          return value;
        });
      },
      function(reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function() {
          // @ts-ignore
          return constructor.reject(reason);
        });
      }
    );
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
    return function() {
      fn.apply(thisArg, arguments);
    };
  }

  /**
   * @constructor
   * @param {Function} fn
   */
  function Promise(fn) {
    if (!(this instanceof Promise))
      throw new TypeError('Promises must be constructed via new');
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
    Promise._immediateFn(function() {
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
      if (newValue === self)
        throw new TypeError('A promise cannot be resolved with itself.');
      if (
        newValue &&
        (typeof newValue === 'object' || typeof newValue === 'function')
      ) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
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
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
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
      fn(
        function(value) {
          if (done) return;
          done = true;
          resolve(self, value);
        },
        function(reason) {
          if (done) return;
          done = true;
          reject(self, reason);
        }
      );
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function(onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function(onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.prototype['finally'] = finallyConstructor;

  Promise.all = function(arr) {
    return new Promise(function(resolve, reject) {
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
              then.call(
                val,
                function(val) {
                  res(i, val);
                },
                reject
              );
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

  Promise.resolve = function(value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function(resolve) {
      resolve(value);
    });
  };

  Promise.reject = function(value) {
    return new Promise(function(resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function(arr) {
    return new Promise(function(resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise.resolve(arr[i]).then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn =
    // @ts-ignore
    (typeof setImmediate === 'function' &&
      function(fn) {
        // @ts-ignore
        setImmediate(fn);
      }) ||
    function(fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  // For building Turbine we are using Rollup. For running the turbine tests we are using
  // Karma + Webpack. You need to specify the default import when using promise-polyfill`
  // with Webpack 2+. We need `require('promise-polyfill').default` for running the tests
  // and `require('promise-polyfill')` for building Turbine.
  var reactorPromise =
    window.Promise ||
    Promise.default ||
    Promise;

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



  var createAddActionToQueue = function (
    executeDelegateModule,
    normalizeRuleComponentError,
    logActionError
  ) {
    return function (action, rule, syntheticEvent, lastPromiseInQueue) {
      return lastPromiseInQueue.then(function () {
        // This module is used when ruleComponentSequencing is enabled.
        // action.timeout is always supplied to this module as >= 0 when delayNext is true.

        var delayNextAction = action.delayNext;
        var actionTimeoutId;

        return new reactorPromise(function (resolve, reject) {
          var moduleResult = executeDelegateModule(action, syntheticEvent, [
            syntheticEvent
          ]);

          if (!delayNextAction) {
            return resolve();
          }

          var promiseTimeoutMs = action.timeout;
          var timeoutPromise = new reactorPromise(function (resolve, reject) {
            actionTimeoutId = setTimeout(function () {
              reject(
                new Error(
                  'A timeout occurred because the action took longer than ' +
                    promiseTimeoutMs / 1000 +
                    ' seconds to complete. '
                )
              );
            }, promiseTimeoutMs);
          });

          reactorPromise.race([moduleResult, timeoutPromise]).then(resolve, reject);
        })
          .catch(function (e) {
            clearTimeout(actionTimeoutId);
            e = normalizeRuleComponentError(e);
            logActionError(action, rule, e);
            return reactorPromise.reject(e);
          })
          .then(function () {
            clearTimeout(actionTimeoutId);
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



  var createAddConditionToQueue = function (
    executeDelegateModule,
    normalizeRuleComponentError,
    isConditionMet,
    logConditionError,
    logConditionNotMet
  ) {
    return function (condition, rule, syntheticEvent, lastPromiseInQueue) {
      return lastPromiseInQueue.then(function () {
        // This module is used when ruleComponentSequencing is enabled.
        // condition.timeout is always supplied to this module as >= 0.
        // Conditions always assume delayNext = true because we have to know the
        // condition result before moving on.
        var conditionTimeoutId;

        return new reactorPromise(function (resolve, reject) {
          var moduleResult = executeDelegateModule(condition, syntheticEvent, [
            syntheticEvent
          ]);

          var promiseTimeoutMs = condition.timeout;
          var timeoutPromise = new reactorPromise(function (resolve, reject) {
            conditionTimeoutId = setTimeout(function () {
              reject(
                new Error(
                  'A timeout occurred because the condition took longer than ' +
                    promiseTimeoutMs / 1000 +
                    ' seconds to complete. '
                )
              );
            }, promiseTimeoutMs);
          });

          reactorPromise.race([moduleResult, timeoutPromise]).then(resolve, reject);
        })
          .catch(function (e) {
            clearTimeout(conditionTimeoutId);
            e = normalizeRuleComponentError(e);
            logConditionError(condition, rule, e);
            return reactorPromise.reject(e);
          })
          .then(function (result) {
            clearTimeout(conditionTimeoutId);
            if (!isConditionMet(condition, result)) {
              logConditionNotMet(condition, rule);
              return reactorPromise.reject();
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


  var lastPromiseInQueue = reactorPromise.resolve();

  var createAddRuleToQueue = function (
    addConditionToQueue,
    addActionToQueue,
    logRuleCompleted
  ) {
    return function (rule, syntheticEvent) {
      if (rule.conditions) {
        rule.conditions.forEach(function (condition) {
          lastPromiseInQueue = addConditionToQueue(
            condition,
            rule,
            syntheticEvent,
            lastPromiseInQueue
          );
        });
      }

      if (rule.actions) {
        rule.actions.forEach(function (action) {
          lastPromiseInQueue = addActionToQueue(
            action,
            rule,
            syntheticEvent,
            lastPromiseInQueue
          );
        });
      }

      lastPromiseInQueue = lastPromiseInQueue.then(function () {
        logRuleCompleted(rule);
      });

      // Allows later rules to keep running when an error occurs within this rule.
      lastPromiseInQueue = lastPromiseInQueue.catch(function () {});

      return lastPromiseInQueue;
    };
  };

  var isPromiseLike = function (value) {
    return Boolean(
      value && typeof value === 'object' && typeof value.then === 'function'
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



  var createEvaluateConditions = function (
    executeDelegateModule,
    isConditionMet,
    logConditionNotMet,
    logConditionError
  ) {
    return function (rule, syntheticEvent) {
      var condition;

      if (rule.conditions) {
        for (var i = 0; i < rule.conditions.length; i++) {
          condition = rule.conditions[i];

          try {
            var result = executeDelegateModule(condition, syntheticEvent, [
              syntheticEvent
            ]);

            // If the result is promise-like, the extension needs to do something asynchronously,
            // but the customer does not have rule component sequencing enabled on the property.
            // If we didn't do this, the condition would always pass because the promise is
            // considered "truthy".
            if (isPromiseLike(result)) {
              throw new Error(
                'Rule component sequencing must be enabled on the property ' +
                  'for this condition to function properly.'
              );
            }

            if (!isConditionMet(condition, result)) {
              logConditionNotMet(condition, rule);
              return false;
            }
          } catch (e) {
            logConditionError(condition, rule, e);
            return false;
          }
        }
      }

      return true;
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

  var createExecuteRule = function (evaluateConditions, runActions) {
    return function (rule, normalizedSyntheticEvent) {
      if (evaluateConditions(rule, normalizedSyntheticEvent)) {
        runActions(rule, normalizedSyntheticEvent);
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

  var createGetModuleDisplayNameByRuleComponent = function (moduleProvider) {
    return function (ruleComponent) {
      var moduleDefinition = moduleProvider.getModuleDefinition(
        ruleComponent.modulePath
      );
      return (
        (moduleDefinition && moduleDefinition.displayName) ||
        ruleComponent.modulePath
      );
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

  var createGetSyntheticEventMeta = function (moduleProvider) {
    return function (ruleEventPair) {
      var rule = ruleEventPair.rule;
      var event = ruleEventPair.event;

      var moduleName = moduleProvider.getModuleDefinition(event.modulePath).name;
      var extensionName = moduleProvider.getModuleExtensionName(event.modulePath);

      return {
        $type: extensionName + '.' + moduleName,
        $rule: {
          id: rule.id,
          name: rule.name
        }
      };
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

  var createInitEventModule = function (
    triggerRule,
    executeDelegateModule,
    normalizeSyntheticEvent,
    getErrorMessage,
    getSyntheticEventMeta,
    logger
  ) {
    return function (guardUntilAllInitialized, ruleEventPair) {
      var rule = ruleEventPair.rule;
      var event = ruleEventPair.event;
      event.settings = event.settings || {};

      try {
        var syntheticEventMeta = getSyntheticEventMeta(ruleEventPair);

        executeDelegateModule(event, null, [
          /**
           * This is the callback that executes a particular rule when an event has occurred.
           * @param {Object} [syntheticEvent] An object that contains detail regarding the event
           * that occurred.
           */
          function trigger(syntheticEvent) {
            // DTM-11871
            // If we're still in the process of initializing event modules,
            // we need to queue up any calls to trigger, otherwise if the triggered
            // rule does something that triggers a different rule whose event module
            // has not been initialized, that secondary rule will never get executed.
            // This can be removed if we decide to always use the rule queue, since
            // conditions and actions will be processed asynchronously, which
            // would give time for all event modules to be initialized.

            var normalizedSyntheticEvent = normalizeSyntheticEvent(
              syntheticEventMeta,
              syntheticEvent
            );

            guardUntilAllInitialized(function () {
              triggerRule(normalizedSyntheticEvent, rule);
            });
          }
        ]);
      } catch (e) {
        logger.error(getErrorMessage(event, rule, e));
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

  var createLogActionError = function (
    getRuleComponentErrorMessage,
    getModuleDisplayNameByRuleComponent,
    logger,
    notifyMonitors
  ) {
    return function (action, rule, e) {
      var actionDisplayName = getModuleDisplayNameByRuleComponent(action);

      logger.error(getRuleComponentErrorMessage(actionDisplayName, rule.name, e));

      notifyMonitors('ruleActionFailed', {
        rule: rule,
        action: action
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

  var createLogConditionError = function (
    getRuleComponentErrorMessage,
    getModuleDisplayNameByRuleComponent,
    logger,
    notifyMonitors
  ) {
    return function (condition, rule, e) {
      var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

      logger.error(
        getRuleComponentErrorMessage(conditionDisplayName, rule.name, e)
      );

      notifyMonitors('ruleConditionFailed', {
        rule: rule,
        condition: condition
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

  var createLogConditionNotMet = function (
    getModuleDisplayNameByRuleComponent,
    logger,
    notifyMonitors
  ) {
    return function (condition, rule) {
      var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

      logger.log(
        'Condition "' +
          conditionDisplayName +
          '" for rule "' +
          rule.name +
          '" was not met.'
      );

      notifyMonitors('ruleConditionFailed', {
        rule: rule,
        condition: condition
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

  var createLogRuleCompleted = function (logger, notifyMonitors) {
    return function (rule) {
      logger.log('Rule "' + rule.name + '" fired.');
      notifyMonitors('ruleCompleted', {
        rule: rule
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

  var createRunActions = function (
    executeDelegateModule,
    logActionError,
    logRuleCompleted
  ) {
    return function (rule, syntheticEvent) {
      var action;

      if (rule.actions) {
        for (var i = 0; i < rule.actions.length; i++) {
          action = rule.actions[i];
          try {
            executeDelegateModule(action, syntheticEvent, [syntheticEvent]);
          } catch (e) {
            logActionError(action, rule, e);
            return;
          }
        }
      }

      logRuleCompleted(rule);
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

  var createTriggerRule = function (
    ruleComponentSequencingEnabled,
    executeRule,
    addRuleToQueue,
    notifyMonitors
  ) {
    return function (normalizedSyntheticEvent, rule) {
      notifyMonitors('ruleTriggered', {
        rule: rule
      });

      if (ruleComponentSequencingEnabled) {
        addRuleToQueue(rule, normalizedSyntheticEvent);
      } else {
        executeRule(rule, normalizedSyntheticEvent);
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

  var getRuleComponentErrorMessage = function (ruleComponentName, ruleName, error) {
    return (
      'Failed to execute "' +
      ruleComponentName +
      '" for "' +
      ruleName +
      '" rule. ' +
      error.message +
      (error.stack ? '\n' + error.stack : '')
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

  var isConditionMet = function (condition, result) {
    return (result && !condition.negate) || (!result && condition.negate);
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

  var triggerCallQueue = [];
  var eventModulesInitialized = false;

  var guardUntilAllInitialized = function (callback) {
    if (!eventModulesInitialized) {
      triggerCallQueue.push(callback);
    } else {
      callback();
    }
  };

  var initRules = function (buildRuleExecutionOrder, rules, initEventModule) {
    buildRuleExecutionOrder(rules).forEach(function (ruleEventPair) {
      initEventModule(guardUntilAllInitialized, ruleEventPair);
    });

    eventModulesInitialized = true;
    triggerCallQueue.forEach(function (triggerCall) {
      triggerCall();
    });

    triggerCallQueue = [];
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

  var normalizeRuleComponentError = function (e) {
    if (!e) {
      e = new Error(
        'The extension triggered an error, but no error information was provided.'
      );
    }

    if (!(e instanceof Error)) {
      var stringifiedError =
        typeof e === 'object' ? JSON.stringify(e) : String(e);
      e = new Error(stringifiedError);
    }

    return e;
  };

  /*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  */
  /* eslint-disable no-unused-vars */
  var getOwnPropertySymbols = Object.getOwnPropertySymbols;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
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
  		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
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
  		if (Object.keys(Object.assign({}, test3)).join('') !==
  				'abcdefghijklmnopqrst') {
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
  			if (hasOwnProperty.call(from, key)) {
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




  /**
   * Normalizes a synthetic event so that it exists and has at least meta.
   * @param {Object} syntheticEventMeta
   * @param {Object} [syntheticEvent]
   * @returns {Object}
   */
  var normalizeSyntheticEvent = function (syntheticEventMeta, syntheticEvent) {
    syntheticEvent = syntheticEvent || {};
    reactorObjectAssign(syntheticEvent, syntheticEventMeta);

    // Remove after some arbitrary time period when we think users have had sufficient chance
    // to move away from event.type
    if (!syntheticEvent.hasOwnProperty('type')) {
      Object.defineProperty(syntheticEvent, 'type', {
        get: function () {
          logger.warn(
            'Accessing event.type in Adobe Launch has been deprecated and will be ' +
              'removed soon. Please use event.$type instead.'
          );
          return syntheticEvent.$type;
        }
      });
    }

    return syntheticEvent;
  };

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

  /**
   * Creates a function that, when called with an extension name and module name, will return the
   * exports of the respective shared module.
   *
   * @param {Object} extensions
   * @param {Object} moduleProvider
   * @returns {Function}
   */
  var createGetSharedModuleExports = function (extensions, moduleProvider) {
    return function (extensionName, moduleName) {
      var extension = extensions[extensionName];

      if (extension) {
        var modules = extension.modules;
        if (modules) {
          var referencePaths = Object.keys(modules);
          for (var i = 0; i < referencePaths.length; i++) {
            var referencePath = referencePaths[i];
            var module = modules[referencePath];
            if (module.shared && module.name === moduleName) {
              return moduleProvider.getModuleExports(referencePath);
            }
          }
        }
      }
    };
  };

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

  /**
   * Creates a function that, when called, will return a configuration object with data element
   * tokens replaced.
   *
   * @param {Object} settings
   * @returns {Function}
   */
  var createGetExtensionSettings = function (replaceTokens, settings) {
    return function () {
      return settings ? replaceTokens(settings) : {};
    };
  };

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

  /**
   * Creates a function that, when called, will return the full hosted lib file URL.
   *
   * @param {string} hostedLibFilesBaseUrl
   * @returns {Function}
   */

  var createGetHostedLibFileUrl = function (hostedLibFilesBaseUrl, minified) {
    return function (file) {
      if (minified) {
        var fileParts = file.split('.');
        fileParts.splice(fileParts.length - 1 || 1, 0, 'min');
        file = fileParts.join('.');
      }

      return hostedLibFilesBaseUrl + file;
    };
  };

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

  var JS_EXTENSION = '.js';

  /**
   * @private
   * Returns the directory of a path. A limited version of path.dirname in nodejs.
   *
   * To keep it simple, it makes the following assumptions:
   * path has a least one slash
   * path does not end with a slash
   * path does not have empty segments (e.g., /src/lib//foo.bar)
   *
   * @param {string} path
   * @returns {string}
   */
  var dirname = function (path) {
    return path.substr(0, path.lastIndexOf('/'));
  };

  /**
   * Determines if a string ends with a certain string.
   * @param {string} str The string to test.
   * @param {string} suffix The suffix to look for at the end of str.
   * @returns {boolean} Whether str ends in suffix.
   */
  var endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  /**
   * Given a starting path and a path relative to the starting path, returns the final path. A
   * limited version of path.resolve in nodejs.
   *
   * To keep it simple, it makes the following assumptions:
   * fromPath has at least one slash
   * fromPath does not end with a slash.
   * fromPath does not have empty segments (e.g., /src/lib//foo.bar)
   * relativePath starts with ./ or ../
   *
   * @param {string} fromPath
   * @param {string} relativePath
   * @returns {string}
   */
  var resolveRelativePath = function (fromPath, relativePath) {
    // Handle the case where the relative path does not end in the .js extension. We auto-append it.
    if (!endsWith(relativePath, JS_EXTENSION)) {
      relativePath = relativePath + JS_EXTENSION;
    }

    var relativePathSegments = relativePath.split('/');
    var resolvedPathSegments = dirname(fromPath).split('/');

    relativePathSegments.forEach(function (relativePathSegment) {
      if (!relativePathSegment || relativePathSegment === '.') {
        return;
      } else if (relativePathSegment === '..') {
        if (resolvedPathSegments.length) {
          resolvedPathSegments.pop();
        }
      } else {
        resolvedPathSegments.push(relativePathSegment);
      }
    });

    return resolvedPathSegments.join('/');
  };

  var reactorDocument = document;

  var getPromise = function(url, script) {
    return new reactorPromise(function(resolve, reject) {
      script.onload = function() {
        resolve(script);
      };

      script.onerror = function() {
        reject(new Error('Failed to load script ' + url));
      };
    });
  };

  var reactorLoadScript = function(url) {
    var script = document.createElement('script');
    script.src = url;
    script.async = true;

    var promise = getPromise(url, script);

    document.getElementsByTagName('head')[0].appendChild(script);
    return promise;
  };

  // Copyright Joyent, Inc. and other Node contributors.

  // If obj.hasOwnProperty has been overridden, then calling
  // obj.hasOwnProperty(prop) will break.
  // See: https://github.com/joyent/node/issues/1707
  function hasOwnProperty$1(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  var decode = function(qs, sep, eq, options) {
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
          kstr, vstr, k, v;

      if (idx >= 0) {
        kstr = x.substr(0, idx);
        vstr = x.substr(idx + 1);
      } else {
        kstr = x;
        vstr = '';
      }

      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);

      if (!hasOwnProperty$1(obj, k)) {
        obj[k] = v;
      } else if (Array.isArray(obj[k])) {
        obj[k].push(v);
      } else {
        obj[k] = [obj[k], v];
      }
    }

    return obj;
  };

  // Copyright Joyent, Inc. and other Node contributors.

  var stringifyPrimitive = function(v) {
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

  var encode = function(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
      obj = undefined;
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).map(function(k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
        }
      }).join(sep);

    }

    if (!name) return '';
    return encodeURIComponent(stringifyPrimitive(name)) + eq +
           encodeURIComponent(stringifyPrimitive(obj));
  };

  var querystring = createCommonjsModule(function (module, exports) {

  exports.decode = exports.parse = decode;
  exports.encode = exports.stringify = encode;
  });
  var querystring_1 = querystring.decode;
  var querystring_2 = querystring.parse;
  var querystring_3 = querystring.encode;
  var querystring_4 = querystring.stringify;

  // We proxy the underlying querystring module so we can limit the API we expose.
  // This allows us to more easily make changes to the underlying implementation later without
  // having to worry about breaking extensions. If extensions demand additional functionality, we
  // can make adjustments as needed.
  var reactorQueryString = {
    parse: function(string) {
      //
      if (typeof string === 'string') {
        // Remove leading ?, #, & for some leniency so you can pass in location.search or
        // location.hash directly.
        string = string.trim().replace(/^[?#&]/, '');
      }
      return querystring.parse(string);
    },
    stringify: function(object) {
      return querystring.stringify(object);
    }
  };

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

  var CORE_MODULE_PREFIX = '@adobe/reactor-';

  var modules = {
    cookie: reactorCookie,
    document: reactorDocument,
    'load-script': reactorLoadScript,
    'object-assign': reactorObjectAssign,
    promise: reactorPromise,
    'query-string': reactorQueryString,
    window: reactorWindow
  };

  /**
   * Creates a function which can be passed as a "require" function to extension modules.
   *
   * @param {Function} getModuleExportsByRelativePath
   * @returns {Function}
   */
  var createPublicRequire = function (getModuleExportsByRelativePath) {
    return function (key) {
      if (key.indexOf(CORE_MODULE_PREFIX) === 0) {
        var keyWithoutScope = key.substr(CORE_MODULE_PREFIX.length);
        var module = modules[keyWithoutScope];

        if (module) {
          return module;
        }
      }

      if (key.indexOf('./') === 0 || key.indexOf('../') === 0) {
        return getModuleExportsByRelativePath(key);
      }

      throw new Error('Cannot resolve module "' + key + '".');
    };
  };

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








  var hydrateModuleProvider = function (
    container,
    moduleProvider,
    debugController,
    replaceTokens,
    getDataElementValue
  ) {
    var extensions = container.extensions;
    var buildInfo = container.buildInfo;
    var propertySettings = container.property.settings;

    if (extensions) {
      var getSharedModuleExports = createGetSharedModuleExports(
        extensions,
        moduleProvider
      );

      Object.keys(extensions).forEach(function (extensionName) {
        var extension = extensions[extensionName];
        var getExtensionSettings = createGetExtensionSettings(
          replaceTokens,
          extension.settings
        );

        if (extension.modules) {
          var prefixedLogger = logger.createPrefixedLogger(extension.displayName);
          var getHostedLibFileUrl = createGetHostedLibFileUrl(
            extension.hostedLibFilesBaseUrl,
            buildInfo.minified
          );
          var turbine = {
            buildInfo: buildInfo,
            getDataElementValue: getDataElementValue,
            getExtensionSettings: getExtensionSettings,
            getHostedLibFileUrl: getHostedLibFileUrl,
            getSharedModule: getSharedModuleExports,
            logger: prefixedLogger,
            propertySettings: propertySettings,
            replaceTokens: replaceTokens,
            onDebugChanged: debugController.onDebugChanged,
            get debugEnabled() {
              return debugController.getDebugEnabled();
            }
          };

          Object.keys(extension.modules).forEach(function (referencePath) {
            var module = extension.modules[referencePath];
            var getModuleExportsByRelativePath = function (relativePath) {
              var resolvedReferencePath = resolveRelativePath(
                referencePath,
                relativePath
              );
              return moduleProvider.getModuleExports(resolvedReferencePath);
            };
            var publicRequire = createPublicRequire(
              getModuleExportsByRelativePath
            );

            moduleProvider.registerModule(
              referencePath,
              module,
              extensionName,
              publicRequire,
              turbine
            );
          });
        }
      });

      // We want to extract the module exports immediately to allow the modules
      // to run some logic immediately.
      // We need to do the extraction here in order for the moduleProvider to
      // have all the modules previously registered. (eg. when moduleA needs moduleB, both modules
      // must exist inside moduleProvider).
      moduleProvider.hydrateCache();
    }
    return moduleProvider;
  };

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




  var hydrateSatelliteObject = function (
    _satellite,
    container,
    setDebugEnabled,
    getVar,
    setCustomVar
  ) {
    var customScriptPrefixedLogger = logger.createPrefixedLogger('Custom Script');

    // Will get replaced by the directCall event delegate from the Core extension. Exists here in
    // case there are no direct call rules (and therefore the directCall event delegate won't get
    // included) and our customers are still calling the method. In this case, we don't want an error
    // to be thrown. This method existed before Reactor.
    _satellite.track = function (identifier) {
      logger.log(
        '"' + identifier + '" does not match any direct call identifiers.'
      );
    };

    // Will get replaced by the Marketing Cloud ID extension if installed. Exists here in case
    // the extension is not installed and our customers are still calling the method. In this case,
    // we don't want an error to be thrown. This method existed before Reactor.
    _satellite.getVisitorId = function () {
      return null;
    };

    // container.property also has property settings, but it shouldn't concern the user.
    // By limiting our API exposure to necessities, we provide more flexibility in the future.
    _satellite.property = {
      name: container.property.name
    };

    _satellite.company = container.company;

    _satellite.buildInfo = container.buildInfo;

    _satellite.logger = customScriptPrefixedLogger;

    /**
     * Log a message. We keep this due to legacy baggage.
     * @param {string} message The message to log.
     * @param {number} [level] A number that represents the level of logging.
     * 3=info, 4=warn, 5=error, anything else=log
     */
    _satellite.notify = function (message, level) {
      logger.warn(
        '_satellite.notify is deprecated. Please use the `_satellite.logger` API.'
      );

      switch (level) {
        case 3:
          customScriptPrefixedLogger.info(message);
          break;
        case 4:
          customScriptPrefixedLogger.warn(message);
          break;
        case 5:
          customScriptPrefixedLogger.error(message);
          break;
        default:
          customScriptPrefixedLogger.log(message);
      }
    };

    _satellite.getVar = getVar;
    _satellite.setVar = setCustomVar;

    /**
     * Writes a cookie.
     * @param {string} name The name of the cookie to save.
     * @param {string} value The value of the cookie to save.
     * @param {number} [days] The number of days to store the cookie. If not specified, the cookie
     * will be stored for the session only.
     */
    _satellite.setCookie = function (name, value, days) {
      var optionsStr = '';
      var options = {};

      if (days) {
        optionsStr = ', { expires: ' + days + ' }';
        options.expires = days;
      }

      var msg =
        '_satellite.setCookie is deprecated. Please use ' +
        '_satellite.cookie.set("' +
        name +
        '", "' +
        value +
        '"' +
        optionsStr +
        ').';

      logger.warn(msg);
      reactorCookie.set(name, value, options);
    };

    /**
     * Reads a cookie value.
     * @param {string} name The name of the cookie to read.
     * @returns {string}
     */
    _satellite.readCookie = function (name) {
      logger.warn(
        '_satellite.readCookie is deprecated. ' +
          'Please use _satellite.cookie.get("' +
          name +
          '").'
      );
      return reactorCookie.get(name);
    };

    /**
     * Removes a cookie value.
     * @param name
     */
    _satellite.removeCookie = function (name) {
      logger.warn(
        '_satellite.removeCookie is deprecated. ' +
          'Please use _satellite.cookie.remove("' +
          name +
          '").'
      );
      reactorCookie.remove(name);
    };

    _satellite.cookie = reactorCookie;

    // Will get replaced by the pageBottom event delegate from the Core extension. Exists here in
    // case the customers are not using core (and therefore the pageBottom event delegate won't get
    // included) and they are still calling the method. In this case, we don't want an error
    // to be thrown. This method existed before Reactor.
    _satellite.pageBottom = function () {};

    _satellite.setDebug = setDebugEnabled;

    var warningLogged = false;

    Object.defineProperty(_satellite, '_container', {
      get: function () {
        if (!warningLogged) {
          logger.warn(
            '_satellite._container may change at any time and should only ' +
              'be used for debugging.'
          );
          warningLogged = true;
        }

        return container;
      }
    });
  };

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










































  var _satellite = window._satellite;

  if (_satellite && !window.__satelliteLoaded) {
    // If a consumer loads the library multiple times, make sure only the first time is effective.
    window.__satelliteLoaded = true;

    var container = _satellite.container;

    // Remove container in public scope ASAP so it can't be manipulated by extension or user code.
    delete _satellite.container;

    var undefinedVarsReturnEmpty =
      container.property.settings.undefinedVarsReturnEmpty;
    var ruleComponentSequencingEnabled =
      container.property.settings.ruleComponentSequencingEnabled;

    var dataElements = container.dataElements || {};

    // Remove when migration period has ended.
    dataElementSafe.migrateCookieData(dataElements);

    var getDataElementDefinition = function (name) {
      return dataElements[name];
    };

    var moduleProvider = createModuleProvider();

    var replaceTokens;

    // We support data elements referencing other data elements. In order to be able to retrieve a
    // data element value, we need to be able to replace data element tokens inside its settings
    // object (which is what replaceTokens is for). In order to be able to replace data element
    // tokens inside a settings object, we need to be able to retrieve data element
    // values (which is what getDataElementValue is for). This proxy replaceTokens function solves the
    // chicken-or-the-egg problem by allowing us to provide a replaceTokens function to
    // getDataElementValue that will stand in place of the real replaceTokens function until it
    // can be created. This also means that createDataElementValue should not call the proxy
    // replaceTokens function until after the real replaceTokens has been created.
    var proxyReplaceTokens = function () {
      return replaceTokens.apply(null, arguments);
    };

    var getDataElementValue = createGetDataElementValue(
      moduleProvider,
      getDataElementDefinition,
      proxyReplaceTokens,
      undefinedVarsReturnEmpty
    );

    var customVars = {};
    var setCustomVar = createSetCustomVar(customVars);

    var isVar = createIsVar(customVars, getDataElementDefinition);

    var getVar = createGetVar(
      customVars,
      getDataElementDefinition,
      getDataElementValue
    );

    replaceTokens = createReplaceTokens(isVar, getVar, undefinedVarsReturnEmpty);

    var localStorage = getNamespacedStorage('localStorage');
    var debugController = createDebugController(localStorage, logger);

    // Important to hydrate satellite object before we hydrate the module provider or init rules.
    // When we hydrate module provider, we also execute extension code which may be
    // accessing _satellite.
    hydrateSatelliteObject(
      _satellite,
      container,
      debugController.setDebugEnabled,
      getVar,
      setCustomVar
    );

    hydrateModuleProvider(
      container,
      moduleProvider,
      debugController,
      replaceTokens,
      getDataElementValue
    );

    var notifyMonitors = createNotifyMonitors(_satellite);
    var executeDelegateModule = createExecuteDelegateModule(
      moduleProvider,
      replaceTokens
    );

    var getModuleDisplayNameByRuleComponent = createGetModuleDisplayNameByRuleComponent(
      moduleProvider
    );
    var logConditionNotMet = createLogConditionNotMet(
      getModuleDisplayNameByRuleComponent,
      logger,
      notifyMonitors
    );
    var logConditionError = createLogConditionError(
      getRuleComponentErrorMessage,
      getModuleDisplayNameByRuleComponent,
      logger,
      notifyMonitors
    );
    var logActionError = createLogActionError(
      getRuleComponentErrorMessage,
      getModuleDisplayNameByRuleComponent,
      logger,
      notifyMonitors
    );
    var logRuleCompleted = createLogRuleCompleted(logger, notifyMonitors);

    var evaluateConditions = createEvaluateConditions(
      executeDelegateModule,
      isConditionMet,
      logConditionNotMet,
      logConditionError
    );
    var runActions = createRunActions(
      executeDelegateModule,
      logActionError,
      logRuleCompleted
    );
    var executeRule = createExecuteRule(evaluateConditions, runActions);

    var addConditionToQueue = createAddConditionToQueue(
      executeDelegateModule,
      normalizeRuleComponentError,
      isConditionMet,
      logConditionError,
      logConditionNotMet
    );
    var addActionToQueue = createAddActionToQueue(
      executeDelegateModule,
      normalizeRuleComponentError,
      logActionError
    );
    var addRuleToQueue = createAddRuleToQueue(
      addConditionToQueue,
      addActionToQueue,
      logRuleCompleted
    );

    var triggerRule = createTriggerRule(
      ruleComponentSequencingEnabled,
      executeRule,
      addRuleToQueue,
      notifyMonitors
    );

    var getSyntheticEventMeta = createGetSyntheticEventMeta(moduleProvider);

    var initEventModule = createInitEventModule(
      triggerRule,
      executeDelegateModule,
      normalizeSyntheticEvent,
      getRuleComponentErrorMessage,
      getSyntheticEventMeta,
      logger
    );

    initRules(buildRuleExecutionOrder, container.rules || [], initEventModule);
  }

  // Rollup's iife option always sets a global with whatever is exported, so we'll set the
  // _satellite global with the same object it already is (we've only modified it).
  var src = _satellite;

  return src;

}());


