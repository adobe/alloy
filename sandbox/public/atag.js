(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.atag = factory());
}(this, function () { 'use strict';

  if (document.documentMode && document.documentMode < 10) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 9 and below.'); return; }

  var reactorWindow = window;

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

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
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

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var promise = createCommonjsModule(function (module) {
    (function (root) {
      // Store setTimeout reference so promise-polyfill will be unaffected by
      // other code modifying setTimeout (like sinon.useFakeTimers())
      var setTimeoutFunc = setTimeout;

      function noop() {} // Polyfill for Function.prototype.bind


      function bind(fn, thisArg) {
        return function () {
          fn.apply(thisArg, arguments);
        };
      }

      function Promise(fn) {
        if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
        if (typeof fn !== 'function') throw new TypeError('not a function');
        this._state = 0;
        this._handled = false;
        this._value = undefined;
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

        Promise._immediateFn(function () {
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
          Promise._immediateFn(function () {
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

      Promise.prototype['catch'] = function (onRejected) {
        return this.then(null, onRejected);
      };

      Promise.prototype.then = function (onFulfilled, onRejected) {
        var prom = new this.constructor(noop);
        handle(this, new Handler(onFulfilled, onRejected, prom));
        return prom;
      };

      Promise.all = function (arr) {
        var args = Array.prototype.slice.call(arr);
        return new Promise(function (resolve, reject) {
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

      Promise.resolve = function (value) {
        if (value && typeof value === 'object' && value.constructor === Promise) {
          return value;
        }

        return new Promise(function (resolve) {
          resolve(value);
        });
      };

      Promise.reject = function (value) {
        return new Promise(function (resolve, reject) {
          reject(value);
        });
      };

      Promise.race = function (values) {
        return new Promise(function (resolve, reject) {
          for (var i = 0, len = values.length; i < len; i++) {
            values[i].then(resolve, reject);
          }
        });
      }; // Use polyfill for setImmediate for performance gains


      Promise._immediateFn = typeof setImmediate === 'function' && function (fn) {
        setImmediate(fn);
      } || function (fn) {
        setTimeoutFunc(fn, 0);
      };

      Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
        if (typeof console !== 'undefined' && console) {
          console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
        }
      };
      /**
       * Set the immediate function to execute callbacks
       * @param fn {function} Function to execute
       * @deprecated
       */


      Promise._setImmediateFn = function _setImmediateFn(fn) {
        Promise._immediateFn = fn;
      };
      /**
       * Change the function to execute on unhandled rejection
       * @param {function} fn Function to execute on unhandled rejection
       * @deprecated
       */


      Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
        Promise._unhandledRejectionFn = fn;
      };

      if (module.exports) {
        module.exports = Promise;
      } else if (!root.Promise) {
        root.Promise = Promise;
      }
    })(commonjsGlobal);
  });

  var reactorPromise = window.Promise || promise;

  /**
   * Turns a function into a node-style async function, where the result
   * is passed to a provided callback.
   * @param {Function} fn The underlying function that would be called when the
   * node-style async function is called.
   * @returns {Function} A function that receives a callback as the
   * last argument.
   */

  var nodeStyleCallbackify = (function (fn) {
    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var callback = args.pop();

      if (!callback || typeof callback !== "function") {
        throw new Error("The last argument must be a callback function.");
      } // We have to wrap the function call in "new Promise()" instead of just
      // a "Promise.resolve()" so that the promise can capture any synchronous
      // errors that occur during the underlying function call.


      new reactorPromise(function (resolve) {
        resolve(fn.apply(void 0, args));
      }).then(function (data) {
        callback(null, data);
      }, function (error) {
        // TODO: Do we want to log the error here?
        // Only when debugging is enabled? If we don't log it at all,
        // and the user doesn't provide a callback, the error is essentially
        // swallowed.
        console.error(error);
        callback(error);
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
  var intersection = function intersection(a, b) {
    return a.filter(function (x) {
      return b.includes(x);
    });
  };

  var createComponentRegistry = (function () {
    var componentsByNamespace = {};
    var commandsByName = {};
    return {
      register: function register(namespace, component) {
        var _component$commands = component.commands,
            componentCommandsByName = _component$commands === void 0 ? {} : _component$commands;
        var conflictingCommandNames = intersection(Object.keys(commandsByName), Object.keys(componentCommandsByName));

        if (conflictingCommandNames.length) {
          throw new Error("[ComponentRegistry] Could not register ".concat(namespace, " ") + "because it has existing command(s): ".concat(conflictingCommandNames.join(",")));
        }

        Object.assign(commandsByName, componentCommandsByName);
        componentsByNamespace[namespace] = component;
      },
      getByNamespace: function getByNamespace(namespace) {
        return componentsByNamespace[namespace];
      },
      getAll: function getAll() {
        return Object.values(componentsByNamespace);
      },
      getCommand: function getCommand(name) {
        return commandsByName[name];
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
   * Prefix to use on all messages.
   * @type {string}
   */

  var SDK_PREFIX = "[AEP]";
  var createLogger = (function (debugController, namespace) {
    var namespacePrefix = "[".concat(namespace, "]");

    var process = function process(level) {
      if (debugController.debugEnabled) {
        var _window$console;

        for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          rest[_key - 1] = arguments[_key];
        }

        (_window$console = reactorWindow.console)[level].apply(_window$console, [SDK_PREFIX, namespacePrefix].concat(rest));
      }
    };

    return {
      /**
       * Outputs a message to the web console.
       * @param {...*} arg Any argument to be logged.
       */
      log: process.bind(null, "log"),

      /**
       * Outputs informational message to the web console. In some
       * browsers a small "i" icon is displayed next to these items
       * in the web console's log.
       * @param {...*} arg Any argument to be logged.
       */
      info: process.bind(null, "info"),

      /**
       * Outputs a warning message to the web console.
       * @param {...*} arg Any argument to be logged.
       */
      warn: process.bind(null, "warn"),

      /**
       * Outputs an error message to the web console.
       * @param {...*} arg Any argument to be logged.
       */
      error: process.bind(null, "error")
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

  /* TODO: Remove.

    Current Request Schema:

    https://git.corp.adobe.com/experience-edge/ue-gateway/
    blob/b946662d672950898248daf346ff6adea4d41de4/resources/request.json

    Top-Level nodes:

    {
      query: {},
      "context": {
        "identityMap": {},
        "environment": {},
        "webreferrer": {}
      },
      "events": [{ // Might contain meta per event.
        "timestamp": 1550574782,
        "eventId": "test",
        "correlationID": "something",
        "type": "::page:load",
        "data": {}
      }],
      "meta": {}
    }

  */
  var append = function append(content, key) {
    return function () {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // TODO Validate.
      console.warn("[Payload:appendTo".concat(key, "] To Implement!"));
      Object.assign(content[key], obj);
      return content;
    };
  };

  var createPayload = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$events = _ref.events,
        events = _ref$events === void 0 ? [] : _ref$events,
        _ref$query = _ref.query,
        query = _ref$query === void 0 ? {} : _ref$query,
        _ref$metadata = _ref.metadata,
        metadata = _ref$metadata === void 0 ? {} : _ref$metadata,
        _ref$context = _ref.context,
        context = _ref$context === void 0 ? {} : _ref$context;

    var content = {
      events: events,
      query: query,
      metadata: metadata,
      context: context
    };
    return {
      addEvent: function addEvent(ev) {
        content.events.push(ev);
      },
      addQuery: append(content, "query"),
      addMetadata: append(content, "metadata"),
      addContext: append(content, "context"),
      toJson: function toJson() {
        return JSON.stringify(content);
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

  function setMetadata(payload, config) {
    // Append metadata to the payload.
    payload.addMetadata({
      enableStore: config.shouldStoreCollectedData,
      device: config.device || "UNKNOWN-DEVICE"
    });
  }

  var initalizePayload = function initalizePayload(config, event, beforeHook) {
    // Populate the request's body with payload, data and metadata.
    var payload = createPayload({
      events: [event]
    });
    return beforeHook(payload).then(function () {
      setMetadata(payload, config);
      return payload.toJson();
    });
  }; // TODO: Extract this stuff into a core helper.


  var callServer = function callServer(config, endpoint) {
    return function (payload) {
      return fetch("".concat(config.collectionUrl, "/").concat(endpoint), {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        referrer: "client",
        body: payload
      });
    };
  };

  var createRequest = (function (config) {
    return {
      send: function send(events, endpoint, beforeHook, afterHook) {
        return initalizePayload(config, events, beforeHook).then(callServer(config, endpoint)) // Freeze the response before handing it to all the components.
        .then(function (response) {
          return Object.freeze(response.json());
        }).then(afterHook).then(function () {}) // Makes sure the promise is resolved with no value.
        ;
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

  var createTracker = function createTracker(_ref) {
    var config = _ref.config;
    var lifecycle;

    var makeServerCall = function makeServerCall(endpoint, beforeHook, afterHook) {
      return function (_ref2) {
        var data = _ref2.data;
        var request = createRequest(config);
        return request.send(data, endpoint, beforeHook, afterHook);
      };
    };

    var makeHookCall = function makeHookCall(hook) {
      return function () {
        var _lifecycle;

        return (_lifecycle = lifecycle)[hook].apply(_lifecycle, arguments);
      };
    };

    return {
      lifecycle: {
        onComponentsRegistered: function onComponentsRegistered(tools) {
          lifecycle = tools.lifecycle;
        }
      },
      commands: {
        interact: makeServerCall("interact", makeHookCall("onBeforeViewStart"), makeHookCall("onViewStartResponse")),
        collect: makeServerCall("collect", makeHookCall("onBeforeEvent"), makeHookCall("onEventResponse"))
      }
    };
  };

  createTracker.namespace = "DataCollector";

  var js_cookie = createCommonjsModule(function (module, exports) {

    (function (factory) {
      var registeredInModuleLoader = false;

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

      function init(converter) {
        function api(key, value, attributes) {
          var result;

          if (typeof document === 'undefined') {
            return;
          } // Write


          if (arguments.length > 1) {
            attributes = extend({
              path: '/'
            }, api.defaults, attributes);

            if (typeof attributes.expires === 'number') {
              var expires = new Date();
              expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
              attributes.expires = expires;
            } // We're using "expires" because "max-age" is not supported by IE


            attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

            try {
              result = JSON.stringify(value);

              if (/^[\{\[]/.test(result)) {
                value = result;
              }
            } catch (e) {}

            if (!converter.write) {
              value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
            } else {
              value = converter.write(value, key);
            }

            key = encodeURIComponent(String(key));
            key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
            key = key.replace(/[\(\)]/g, escape);
            var stringifiedAttributes = '';

            for (var attributeName in attributes) {
              if (!attributes[attributeName]) {
                continue;
              }

              stringifiedAttributes += '; ' + attributeName;

              if (attributes[attributeName] === true) {
                continue;
              }

              stringifiedAttributes += '=' + attributes[attributeName];
            }

            return document.cookie = key + '=' + value + stringifiedAttributes;
          } // Read


          if (!key) {
            result = {};
          } // To prevent the for loop in the first place assign an empty array
          // in case there are no cookies at all. Also prevents odd result when
          // calling "get()"


          var cookies = document.cookie ? document.cookie.split('; ') : [];
          var rdecode = /(%[0-9A-Z]{2})+/g;
          var i = 0;

          for (; i < cookies.length; i++) {
            var parts = cookies[i].split('=');
            var cookie = parts.slice(1).join('=');

            if (cookie.charAt(0) === '"') {
              cookie = cookie.slice(1, -1);
            }

            try {
              var name = parts[0].replace(rdecode, decodeURIComponent);
              cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

              if (this.json) {
                try {
                  cookie = JSON.parse(cookie);
                } catch (e) {}
              }

              if (key === name) {
                result = cookie;
                break;
              }

              if (!key) {
                result[name] = cookie;
              }
            } catch (e) {}
          }

          return result;
        }

        api.set = api;

        api.get = function (key) {
          return api.call(api, key);
        };

        api.getJSON = function () {
          return api.apply({
            json: true
          }, [].slice.call(arguments));
        };

        api.defaults = {};

        api.remove = function (key, attributes) {
          api(key, '', extend(attributes, {
            expires: -1
          }));
        };

        api.withConverter = init;
        return api;
      }

      return init(function () {});
    });
  });

  // we have a little more flexibility to change the underlying implementation later. If clear
  // use cases come up for needing the other methods js-cookie exposes, we can re-evaluate whether
  // we want to expose them here.


  var reactorCookie = {
    get: js_cookie.get,
    set: js_cookie.set,
    remove: js_cookie.remove
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

  var defer = (function () {
    var deferred = {};
    deferred.promise = new reactorPromise(function (resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    return deferred;
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
  var ECID_NAMESPACE = "ECID";

  var addIdsContext = function addIdsContext(payload, ecid) {
    // TODO: Add customer ids.
    // TODO: Add sugar APIs to payload to support adding
    // specific contexts: payload.addIdentityContext
    var identityMap = {};
    identityMap[ECID_NAMESPACE] = [{
      id: ecid
    }];
    payload.addContext({
      identityMap: identityMap
    });
  }; // TODO: Namespace the cookie to be specific to the org.


  var getEcid = function getEcid() {
    return reactorCookie.get("ecid");
  };

  var createIdentity = function createIdentity() {
    var ecid = getEcid();
    var deferredForEcid;

    var onBeforeRequest = function onBeforeRequest(payload) {
      var promise;

      if (ecid) {
        addIdsContext(payload, ecid);
      } else if (deferredForEcid) {
        // We don't have an ECID, but the first request has gone out to
        // fetch it. We must wait for the response to come back with the
        // ECID before we can apply it to this payload.
        promise = deferredForEcid.promise.then(function () {
          addIdsContext(payload, ecid);
        });
      } else {
        // We don't have an ECID and no request has gone out to fetch it.
        // We won't apply the ECID to this request, but we'll set up a
        // promise so that future requests can know when the ECID has returned.
        deferredForEcid = defer();
      }

      return promise;
    };

    var onResponse = function onResponse(response) {
      var ecidPayload = response.getPayloadByType("identity:persist");

      if (ecidPayload) {
        ecid = ecidPayload.id;
        reactorCookie.set("ecid", ecid, {
          expires: 7
        });

        if (deferredForEcid) {
          deferredForEcid.resolve();
        }
      }
    };

    return {
      lifecycle: {
        onBeforeEvent: onBeforeRequest,
        onBeforeViewStart: function onBeforeViewStart(payload) {
          // TODO: Store `lastSyncTS` client side and pass it
          // for server to decide if we receive ID Syncs.
          payload.addMetadata({
            identity: {
              lastSyncTS: 1222,
              containerId: 1
            }
          });
          return onBeforeRequest(payload);
        },
        onEventResponse: onResponse,
        onViewStartResponse: onResponse
      },
      commands: {
        getEcid: getEcid
      }
    };
  };

  createIdentity.namespace = "Identity";

  /*
  Copyright 2019 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var createAudiences = function createAudiences() {
    return {
      lifecycle: {
        onBeforeViewStart: function onBeforeViewStart(payload) {
          console.log("Audiences:::onBeforeViewStart"); // TODO: Remove; We won't need to request destinations explicitely.
          // This is just for demo currently.

          payload.addQuery({
            urlDestinations: true
          });
        },
        onViewStartResponse: function onViewStartResponse(response) {
          console.log("Audiences:::onViewStartResponse");
          var destinations = response.getPayloadByType("activation:push") || [];
          destinations.forEach(function (dest) {
            return console.log(dest.url);
          });
        }
      },
      commands: {}
    };
  };

  createAudiences.namespace = "Audiences";

  var reactorDocument = document;

  /*
  Copyright 2019 Adobe. All rights reserved.
  This file is licensed to you under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License. You may obtain a copy
  of the License at http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software distributed under
  the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
  OF ANY KIND, either express or implied. See the License for the specific language
  governing permissions and limitations under the License.
  */
  var KEY_PREFIX = "___adbe";
  var KEY_DETECT_PREFIX = "".concat(KEY_PREFIX, "-detect");

  function hash(string) {
    var result = 0;
    var length = string.length;

    for (var i = 0; i < length; i += 1) {
      /* eslint-disable */
      result = (result << 5) - result + string.charCodeAt(i) & 0xffffffff;
      /* eslint-enable */
    }

    return result;
  }

  function buildKey(prefix, selector) {
    return "".concat(prefix, "-").concat(hash(selector));
  }

  function createStyleTag(className, content) {
    var style = reactorDocument.createElement("style");
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
    var content = "\n    @keyframes ".concat(key, " {  \n      from { opacity: 0.99; }\n      to { opacity: 1; }  \n    }\n\n    ").concat(selector, " {\n      animation-duration: 0.001s;\n      animation-name: ").concat(key, ";\n    }\n    ");
    reactorDocument.addEventListener("animationstart", callback, false);
    appendTo(reactorDocument.head, createStyleTag(key, content));
  }

  function hideElement(selector) {
    var key = buildKey(KEY_PREFIX, selector);
    var content = "".concat(selector, " { visibility: hidden }");
    appendTo(reactorDocument.head, createStyleTag(key, content));
  }

  function showElement(selector) {
    var key = buildKey(KEY_PREFIX, selector);
    var elements = reactorDocument.querySelectorAll(".".concat(key));
    elements.forEach(function (e) {
      return removeFrom(reactorDocument.head, e);
    });
  }

  function render(cache, event, logger) {
    var animationName = event.animationName;

    if (animationName.indexOf(KEY_DETECT_PREFIX) === -1) {
      return;
    }

    var option = cache[animationName];

    if (!option) {
      logger.log("Element with key:", animationName, "not in cache");
      return;
    }

    var type = option.type,
        selector = option.selector,
        content = option.content;

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

  var createPersonalization = function createPersonalization(_ref) {
    var logger = _ref.logger;
    var storage = {};
    var componentRegistry;

    var collect = function collect(offerInfo) {
      var tracker = componentRegistry.getByNamespace("DataCollector");
      tracker.commands.collect(offerInfo);
    };

    return {
      lifecycle: {
        onComponentsRegistered: function onComponentsRegistered(tools) {
          componentRegistry = tools.componentRegistry;
        },
        onBeforeViewStart: function onBeforeViewStart(payload) {
          console.log("Personalization:::onBeforeViewStart");
          payload.addQuery({
            personalization: true
          });
          payload.addMetadata({
            personalization: {
              client: "demo12",
              sessionID: "12344566"
            }
          });
        },
        onViewStartResponse: function onViewStartResponse(response) {
          console.log("Personalization:::onViewStartResponse");
          var personalization = response.getPayloadByType("personalization:run") || []; // Caution!!! Here comes Target black magic

          personalization.forEach(function (option) {
            var selector = option.selector,
                eventToken = option.eventToken;
            var key = buildKey(KEY_DETECT_PREFIX, selector);
            storage[key] = option;
            hideElement(selector);
            setupElementDetection(key, selector, function (event) {
              render(storage, event, logger);
              collect({
                data: eventToken
              });
            });
          });
        }
      }
    };
  };

  createPersonalization.namespace = "Personalization";

  var webFactory = (function (window, topFrameSetProvider) {
    var topFrameSet;
    return function () {
      topFrameSet = topFrameSet || topFrameSetProvider(); // TODO: check "adobe_mc_ref" query string parameter for the referrer and use that if it's set

      return {
        web: {
          webPageDetails: {
            URL: window.location.href || window.location
          },
          webReferrer: {
            URL: topFrameSet.document.referrer
          }
        }
      };
    };
  });

  var environmentFactory = (function (window, dateProvider) {
    return function () {
      var date = dateProvider();
      var innerWidth = window.innerWidth,
          innerHeight = window.innerHeight,
          effectiveType = window.navigator.connection.effectiveType;
      return {
        environment: {
          browserDetails: {
            viewportWidth: innerWidth,
            viewportHeight: innerHeight
          },
          connectionType: effectiveType,
          placeContext: {
            localTime: date.toISOString(),
            localTimezoneOffset: date.getTimezoneOffset()
          }
        }
      };
    };
  });

  var getScreenOrientation = function getScreenOrientation(window) {
    var screen = window.screen;
    var orientation = screen.orientation,
        width = screen.width,
        height = screen.height;

    if (orientation == null) {
      return width > height ? "landscape" : "portrait";
    }

    if (orientation.type == null) {
      return null;
    }

    var parts = orientation.type.split("-");

    if (parts.length === 0) {
      return null;
    }

    return parts[0] || null;
  };

  var deviceFactory = (function (window) {
    return function () {
      var _window$screen = window.screen,
          width = _window$screen.width,
          height = _window$screen.height;
      var orientation = getScreenOrientation(window);
      return {
        device: {
          screenHeight: height,
          screenWidth: width,
          screenOrientation: orientation
        }
      };
    };
  });

  var topFrameSetFactory = (function (window) {
    return function () {
      var topFrameSet = window;
      var _topFrameSet = topFrameSet,
          location = _topFrameSet.location;

      try {
        var _topFrameSet2 = topFrameSet,
            parent = _topFrameSet2.parent;

        while (parent && parent.location && location && String(parent.location) !== String(location) && topFrameSet.location && String(parent.location) !== String(topFrameSet.location) && parent.location.host === location.host) {
          topFrameSet = parent;
          var _topFrameSet3 = topFrameSet;
          parent = _topFrameSet3.parent;
        }
      } catch (e) {// default to whatever topFrameSet is set
      }

      return topFrameSet;
    };
  });

  var createComponent = (function (config, logger, availableContexts, defaultContexts) {
    var configuredContexts = {};

    var onBeforeRequest = function onBeforeRequest(payload) {
      var context = Object.keys(configuredContexts).reduce(function (memo, key) {
        memo = _objectSpread({}, memo, configuredContexts[key]()); // eslint-disable-line no-param-reassign

        return memo;
      }, {});
      payload.addContext(context);
    };

    return {
      namespace: "Context",
      lifecycle: {
        onComponentsRegistered: function onComponentsRegistered() {
          if (!config.context) {
            logger.log("No configured context.  Using default context.");
            configuredContexts = defaultContexts;
            return;
          }

          if (!Array.isArray(config.context)) {
            logger.warn("Invalid configured context.  Please specify an array of strings.");
            configuredContexts = {};
            return;
          }

          configuredContexts = config.context.reduce(function (memo, context) {
            if (availableContexts[context]) {
              memo[context] = availableContexts[context]; // eslint-disable-line no-param-reassign
            } else {
              logger.warn("Configured context ".concat(context, " is not available."));
            }

            return memo;
          }, {});
        },
        onBeforeEvent: onBeforeRequest,
        onBeforeViewStart: onBeforeRequest
      }
    };
  });

  var topFrameSetProvider = topFrameSetFactory(window);
  var web = webFactory(window, topFrameSetProvider);
  var environment = environmentFactory(window, function () {
    return new Date();
  });
  var device = deviceFactory(window);

  var createContext = function createContext(_ref) {
    var config = _ref.config,
        logger = _ref.logger;
    return createComponent(config, logger, {
      web: web,
      device: device,
      environment: environment
    }, {
      web: web,
      device: device,
      environment: environment
    });
  };

  createContext.namespace = "Context";

  /*
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
   * Represents a gateway response with the addition to helper methods.
   *
   * @param {Object} respDto The raw JSON response from the edge gateway
   *  - Current schema:
   * {
   *      requestId: {String},
   *      handle: [
   *          { type, payload }
   *      ]
   * }
   *
   * @returns {Object<Response>} A Response object containing:
   *  - All the properties of the raw response, frozen
   *  - `getPayloadByType`: returns a fragment of the response by type
   *      - @param {String} type: A string with the current format: <namespace:action>
   *          example: "identity:persist"
   */
  var createResponse = (function () {
    var respDto = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      handle: []
    };
    var response = Object.assign(Object.create(null), respDto); // TODO: Should we freeze the response to prevent change by Components?
    // Object.freeze(response.handle.map(h => Object.freeze(h)));

    response.getPayloadByType = function (type) {
      var fragment = respDto.handle.find(function (content) {
        return content.type === type;
      });
      return fragment ? fragment.payload : null;
    }; // TODO: Maybe consider the following API as well?
    // - getPayloadsByAction


    return response;
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

  function invokeHook(components, hook) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return reactorPromise.all(components.map(function (component) {
      // TODO Maybe add a smarter check here to help Components' developers
      // know that their hooks should be organized under `lifecycle`.
      // Maybe check if hook exist directly on the instance, throw.
      var promise;

      if (component.lifecycle && typeof component.lifecycle[hook] === "function") {
        promise = new reactorPromise(function (resolve) {
          var _component$lifecycle;

          resolve((_component$lifecycle = component.lifecycle)[hook].apply(_component$lifecycle, args));
        });
      }

      return promise;
    }));
  }
  /**
   * This ensures that if a component's lifecycle method X
   * attempts to execute lifecycle method Y, that all X methods on all components
   * will have been called before any of their Y methods are called.
   * @returns {function}
   */


  var guardLifecycleMethod = function guardLifecycleMethod(fn) {
    return function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return new reactorPromise(function (resolve) {
        setTimeout(function () {
          resolve(fn.apply(void 0, args));
        });
      });
    };
  };

  var createLifecycle = (function (componentRegistry) {
    var components;
    return {
      // We intentionally don't guard onComponentsRegistered. When the user
      // configures the SDK, we need onComponentsRegistered on each component
      // to be executed synchronously (they would be run asynchronously if
      // this method were guarded due to how the guard works) so that if the
      // user immediately executes a command right after configuration,
      // all the components will have already had their onComponentsRegistered
      // called and be ready to handle the command. At the moment, commands
      // are always executed synchronously.
      onComponentsRegistered: function onComponentsRegistered(tools) {
        components = componentRegistry.getAll();
        return invokeHook(components, "onComponentsRegistered", tools);
      },
      onBeforeViewStart: guardLifecycleMethod(function (payload) {
        return invokeHook(components, "onBeforeViewStart", payload);
      }),
      onViewStartResponse: guardLifecycleMethod(function (response) {
        return invokeHook(components, "onViewStartResponse", createResponse(response));
      }),
      onBeforeEvent: guardLifecycleMethod(function (payload) {
        return invokeHook(components, "onBeforeEvent", payload);
      }),
      onEventResponse: guardLifecycleMethod(function (response) {
        return invokeHook(components, "onEventResponse", createResponse(response));
      }),
      onBeforeUnload: guardLifecycleMethod(function () {
        return invokeHook(components, "onBeforeUnload");
      }),
      onOptInChanged: guardLifecycleMethod(function (permissions) {
        return invokeHook(components, "onOptInChanged", permissions);
      }) // TODO: We might need an `onError(error)` hook.

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

  var componentCreators = [createTracker, createIdentity, createAudiences, createPersonalization, createContext];
  var initializeComponents = (function (config, debugController) {
    var componentRegistry = createComponentRegistry();
    componentCreators.forEach(function (createComponent) {
      var namespace = createComponent.namespace;
      var logger = createLogger(debugController, namespace);
      var component = createComponent({
        logger: logger,
        config: config
      });
      componentRegistry.register(namespace, component);
    });
    var lifecycle = createLifecycle(componentRegistry);
    lifecycle.onComponentsRegistered({
      componentRegistry: componentRegistry,
      lifecycle: lifecycle
    });
    return componentRegistry;
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

  var NAMESPACE = "com.adobe.aep.";
  var getNamespacedStorage = (function (storageType, additionalNamespace) {
    var finalNamespace = NAMESPACE + (additionalNamespace || ""); // When storage is disabled on Safari, the mere act of referencing
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
      setItem: function setItem(name, value) {
        try {
          reactorWindow[storageType].setItem(finalNamespace + name, value);
          return true;
        } catch (e) {
          return false;
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
  var createDebugController = (function (instanceNamespace) {
    // Segregate whether debugging is enabled by the SDK instance name.
    // This way consumers can debug one instance at a time.
    // TODO: Figure out how this plays out with segregating Web Storage
    // in the rest of the SDK. Is it segregated by Org ID or Property ID
    // in the rest of the SDK?
    var localStorage = getNamespacedStorage("localStorage", "instance.".concat(instanceNamespace, "."));
    var debugEnabled = localStorage.getItem("debug") === "true";
    return {
      get debugEnabled() {
        return debugEnabled;
      },

      set debugEnabled(value) {
        localStorage.setItem("debug", value);
        debugEnabled = value;
      }

    };
  });

  var isFunction = function isFunction(arg) {
    return typeof arg === "function";
  };

  var noop = function noop() {};

  var createInstance = (function (namespace) {
    var debugController = createDebugController(namespace);
    var componentRegistry;

    var debugCommand = function debugCommand(_ref) {
      var enabled = _ref.enabled;
      debugController.debugEnabled = enabled;
    };

    function executeCommand(commandName) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var command;

      if (commandName === "configure") {
        if (componentRegistry) {
          throw new Error("".concat(namespace, ": The library has already been configured and may only be configured once."));
        }

        command = function command(config) {
          componentRegistry = initializeComponents(config, debugController);
        };
      } else {
        if (!componentRegistry) {
          throw new Error("".concat(namespace, ": Please configure the library by calling ").concat(namespace, "(\"configure\", {...})."));
        }

        if (commandName === "debug") {
          command = debugCommand;
        } else {
          command = componentRegistry.getCommand(commandName);
        }
      }

      if (isFunction(command)) {
        var _options$callback = options.callback,
            callback = _options$callback === void 0 ? noop : _options$callback,
            otherOptions = _objectWithoutProperties(options, ["callback"]);

        nodeStyleCallbackify(command)(otherOptions, callback);
      } else {
        throw new Error("".concat(namespace, ": The command ").concat(commandName, " does not exist!"));
      }
    }

    return function (args) {
      return executeCommand.apply(void 0, _toConsumableArray(args));
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

  var namespaces = reactorWindow.__adobeNS;

  if (namespaces) {
    namespaces.forEach(function (namespace) {
      var instance = createInstance(namespace);
      var queue = reactorWindow[namespace].q;
      queue.push = instance;
      queue.forEach(instance);
    });
  } // TODO: Is this something we want to support? Would it have a different API?
  // Allows a consumer using the npm package to build an instance without
  // any base code.


  var main = (function (namespace) {
    return createInstance(namespace);
  });

  return main;

}));
