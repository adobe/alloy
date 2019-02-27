(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.atag = factory());
}(this, function () { 'use strict';

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

  var reactorWindow = window;

  //      
  // An event handler can take an optional event argument
  // and should not return a value
  // An array of all currently registered event handlers for a type
  // A map of event types and their corresponding event handlers.

  /** Mitt: Tiny (~200b) functional event emitter / pubsub.
   *  @name mitt
   *  @returns {Mitt}
   */
  function mitt(all) {
    all = all || Object.create(null);
    return {
      /**
       * Register an event handler for the given type.
       *
       * @param  {String} type	Type of event to listen for, or `"*"` for all events
       * @param  {Function} handler Function to call in response to given event
       * @memberOf mitt
       */
      on: function on(type, handler) {
        (all[type] || (all[type] = [])).push(handler);
      },

      /**
       * Remove an event handler for the given type.
       *
       * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
       * @param  {Function} handler Handler function to remove
       * @memberOf mitt
       */
      off: function off(type, handler) {
        if (all[type]) {
          all[type].splice(all[type].indexOf(handler) >>> 0, 1);
        }
      },

      /**
       * Invoke all handlers for the given type.
       * If present, `"*"` handlers are invoked after type-matched handlers.
       *
       * @param {String} type  The event type to invoke
       * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
       * @memberOf mitt
       */
      emit: function emit(type, evt) {
        (all[type] || []).slice().map(function (handler) {
          handler(evt);
        });
        (all['*'] || []).slice().map(function (handler) {
          handler(type, evt);
        });
      }
    };
  }

  // - This dude acts as a Components repo.
  // - It also implements all of the Core's lifecycle hooks.
  // Let's start the first version with an explicit Hook interface,
  // and not a random pub/sub model. Meaning each Component will have
  // to implement the hook it's interested in as a method on its prototype.
  // We will have a Plop helper that generates Components and populate all the
  // hooks as Template methods.
  // TODO: Finalize the first set of Lifecycle hooks. (DONE)
  // TODO: Support Async hooks. (Or maybe default them as Async)
  // TODO: Hooks might have to publish events so the outside world can hooks in as well.
  // MAYBE: If a Component has a hard dependency, or maybe CORE can do this:
  // if (core.hasComponent('Personalization')) {
  //  new Error() or core.missingRequirement('I require Personalization');
  // }
  function invokeHook(components, hook) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return components.map(function (component) {
      var _component$lifecycle;

      // TODO Maybe add a smarter check here to help Components' developers
      // know that their hooks should be organized under `lifecycle`.
      // Maybe check if hook exist directly on the instance, throw.
      return component.lifecycle && typeof component.lifecycle[hook] === "function" ? (_component$lifecycle = component.lifecycle)[hook].apply(_component$lifecycle, args) : undefined;
    });
  }

  var createLifecycle = (function (componentRegistry) {
    var components = componentRegistry.getAll();
    return {
      onComponentsRegistered: function onComponentsRegistered(core) {
        return invokeHook(components, "onComponentsRegistered", core);
      },
      onBeforeViewStart: function onBeforeViewStart(payload) {
        return invokeHook(components, "onBeforeViewStart", payload);
      },
      onViewStartResponse: function onViewStartResponse(response) {
        return invokeHook(components, "onViewStartResponse", response);
      },
      onBeforeEvent: function onBeforeEvent(payload) {
        return invokeHook(componentRegistry.getAll(), "onBeforeEvent", payload);
      },
      onEventResponse: function onEventResponse(response) {
        return invokeHook(components, "onEventResponse", response);
      },
      onBeforeUnload: function onBeforeUnload() {
        return invokeHook(components, "onBeforeUnload");
      },
      onOptInChanged: function onOptInChanged(permissions) {
        return invokeHook(components, "onOptInChanged", permissions);
      } // TODO: We might need an `onError(error)` hook.

    };
  });

  // This is the Core Component of the A-Tag.
  var createCore = (function (configs, componentRegistry) {
    // TODO: Might need to make this guy a smart object, not a simple array.
    var events = mitt();
    var tracker = componentRegistry.getByNamespace("Tracker");
    var lifecycle = createLifecycle(componentRegistry);
    var core = {
      get events() {
        return events;
      },

      get configs() {
        return configs;
      },

      get components() {
        return componentRegistry;
      },

      get lifecycle() {
        return lifecycle;
      },

      interact: function interact(data, callback) {
        tracker.interact(data, callback);
      },
      collect: function collect(data, callback) {
        tracker.collect(data, callback);
      },
      makeLogger: function makeLogger(prefix) {
        console.log(prefix);
      }
    };
    lifecycle.onComponentsRegistered(core);
    return core;
  });

  var append = function append(payload, key) {
    return function () {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      // TODO Validate...
      console.warn("[Payload:appendTo".concat(key, "] To Implement!"));
      Object.assign(payload[key], obj);
      return payload;
    };
  }; // data should be an array to support sending multiple events.


  var createPayload = (function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        data = _ref.data,
        _ref$query = _ref.query,
        query = _ref$query === void 0 ? {} : _ref$query,
        _ref$metadata = _ref.metadata,
        metadata = _ref$metadata === void 0 ? {} : _ref$metadata,
        _ref$context = _ref.context,
        context = _ref$context === void 0 ? {} : _ref$context;

    var payload = {
      data: [],
      query: query,
      metadata: metadata,
      context: context
    }; // TODO Validate...

    if (data) {
      payload.data.push(data);
    }

    return {
      appendToData: function appendToData(obj) {
        payload.data.push(obj);
      },
      appendToQuery: append(payload, "query"),
      appendToMetadata: append(payload, "metadata"),
      appendToContext: append(payload, "context"),
      toJson: function toJson() {
        return JSON.stringify(payload);
      }
    };
  });

  function setMetadata(payload, core) {
    // MAYBE: Not sure how the cross components communication will happen yet.
    var identity = core.components.getByNamespace("Identity"); // Append metadata to the payload.

    payload.appendToMetadata({
      ecid: identity.getEcid() || null,
      enableStore: core.configs.shouldStoreCollectedData,
      device: core.configs.device || "UNKNOWN-DEVICE"
    });
  }

  function setContext(payload) {
    // Append Context data; basically data we can infer from the environment.
    // TODO: take this stuff out of here, and have some helper component do that.
    payload.appendToContext({
      env: {
        js_enabled: true,
        js_version: "1.8.5",
        cookies_enabled: true,
        browser_height: 900,
        screen_orientation: "landscape",
        webgl_renderer: "AMD Radeon Pro 460 OpenGL Engine"
      },
      view: {
        url: "www.test.com",
        referrer: "www.adobe.com"
      }
    });
  }

  var initalizePayload = function initalizePayload(core, data, beforeHook) {
    // Populate the request's body with payload, data and metadata.
    var payload = createPayload({
      data: data
    }); // TODO: Make those hook calls Async?

    beforeHook(payload);
    setContext(payload);
    setMetadata(payload, core);
    return Promise.resolve(payload.toJson());
  }; // TODO: Extract this stuff into a core helper.


  var callServer = function callServer(core, endpoint) {
    return function (payload) {
      return fetch("".concat(core.configs.collectionUrl, "/").concat(endpoint), {
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

  var createRequest = (function (core) {
    return {
      send: function send(data, endpoint, beforeHook, afterHook, callback) {
        initalizePayload(core, data, beforeHook).then(callServer(core, endpoint)) // Freeze the response before handing it to all the components.
        .then(function (response) {
          return Object.freeze(response.json());
        }).then(afterHook).then(function () {
          return callback("Request has been fired!");
        });
      }
    };
  });

  var noop = function noop() {};

  var createTracker = (function () {
    var core;

    var makeServerCall = function makeServerCall(endpoint, beforeHook, afterHook) {
      return function (data) {
        var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
        var request = createRequest(core);
        return request.send(data, endpoint, beforeHook, afterHook, callback);
      };
    };

    var makeHookCall = function makeHookCall(hook) {
      return function () {
        var _core$lifecycle;

        return (_core$lifecycle = core.lifecycle)[hook].apply(_core$lifecycle, arguments);
      };
    };

    return {
      namespace: "Tracker",
      lifecycle: {
        onComponentsRegistered: function onComponentsRegistered(_core) {
          core = _core;
        }
      },
      interact: makeServerCall("interact", makeHookCall("onBeforeViewStart"), makeHookCall("onViewStartResponse")),
      collect: makeServerCall("collect", makeHookCall("onBeforeEvent"), makeHookCall("onEventResponse"))
    };
  });

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

  var createIdentity = (function () {
    var hasIdSyncsExpired = true;
    return {
      namespace: "Identity",
      getEcid: function getEcid() {
        return reactorCookie.get("ecid");
      },
      lifecycle: {
        onBeforeEvent: function onBeforeEvent(payload) {
          console.log("Identity:::onBeforeEvent");

          if (hasIdSyncsExpired) {
            payload.appendToQuery({
              identity: {
                idSyncs: true,
                container_id: 7
              }
            });
            hasIdSyncsExpired = false;
          }
        },
        onViewStartResponse: function onViewStartResponse(_ref) {
          var ecid = _ref.ids.ecid;
          console.log("Identity:::onViewStartResponse");
          reactorCookie.set("ecid", ecid, {
            expires: 7
          });
        }
      }
    };
  });

  var createAudiences = (function () {
    var hasDestinationExpired = true;
    return {
      namespace: "Audiences",
      lifecycle: {
        onBeforeViewStart: function onBeforeViewStart(payload) {
          console.log("Audiences:::onBeforeViewStart");

          if (hasDestinationExpired) {
            payload.appendToQuery({
              destinations: true
            });
            hasDestinationExpired = false;
          }
        },
        onViewStartResponse: function onViewStartResponse() {
          var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref$destinations = _ref.destinations,
              destinations = _ref$destinations === void 0 ? [] : _ref$destinations;

          console.log("Audiences:::onViewStartResponse");
          destinations.forEach(function (dest) {
            return console.log(dest.url);
          });
        }
      }
    };
  });

  var createPersonalization = (function () {
    var core;

    var collect = function collect(offerInfo) {
      var tracker = core.components.getByNamespace("Tracker");
      tracker.collect(offerInfo);
    };

    return {
      namespace: "Personalization",
      lifecycle: {
        onComponentsRegistered: function onComponentsRegistered(_core) {
          core = _core;
        },
        onBeforeViewStart: function onBeforeViewStart(payload) {
          console.log("Personalization:::onBeforeViewStart");
          payload.appendToQuery({
            personalization: {
              sessionId: "1234235"
            }
          });
        },
        onViewStartResponse: function onViewStartResponse() {
          var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
              _ref$resources$person = _ref.resources.personalization,
              personalization = _ref$resources$person === void 0 ? [] : _ref$resources$person;

          console.log("Personalization:::onViewStartResponse");
          document.addEventListener("DOMContentLoaded", function () {
            personalization.forEach(function (offer) {
              var el = document.querySelector(offer.offerMboxSelector);

              if (el) {
                el.innerHTML = offer.offerHtmlPayload;
                collect(_objectSpread({
                  event: "offer-rendered"
                }, offer));
              }
            });
          });
        }
      }
    };
  });

  var createComponentRegistry = (function () {
    var components = [];
    return {
      register: function register(component) {
        components.push(component);
      },
      getByNamespace: function getByNamespace(namespace) {
        return components.find(function (component) {
          return component.namespace === namespace;
        });
      },
      getAll: function getAll() {
        // Slice so it's a copy of the original lest components
        // try to manipulate it. Maybe not that important.
        return components.slice();
      }
    };
  });

  // cores: [{ orgId, instance }...]

  var core = null; // TODO: Look for existing atag (OR adbe) object on the page first.

  function collect() {
    var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var callback = arguments.length > 1 ? arguments[1] : undefined;
    // TODO Decide on a final format for all Components' APIs: Maybe (requiredParam, { optional params }), or maybe { ALL PARAMS }.
    return core.collect(payload, callback);
  } // MAYBE: Since we don't have a data layer yet, should we support a `configs.data`?


  function configure(configs) {
    // For now we are instantiating Core when configure is called.
    // TODO: Maybe pass those configs to a CoreConfig object that validates and wrap the raw configs.
    // TODO: Register the Components here statically for now. They might be registered differently.
    var componentRegistry = createComponentRegistry(); // TODO: Maybe pass Core in.

    componentRegistry.register(createTracker());
    componentRegistry.register(createIdentity());
    componentRegistry.register(createAudiences());
    componentRegistry.register(createPersonalization());
    core = createCore(configs, componentRegistry); // TODO: Move this guy out of here.. This is just a quick test for the initial call. We might not even need that.

    if (!configs.disableStartupCall) {
      core.interact({
        event: "page View",
        pageName: "home"
      });
    }
  }

  function subscribe(params, callback) {
    console.log(params, callback);
  }

  var commands = {
    collect: collect,
    configure: configure,
    subscribe: subscribe
  };

  function atag() {
    var command = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "collect";

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$params = _ref.params,
        params = _ref$params === void 0 ? {} : _ref$params,
        callback = _ref.callback;

    commands[command](params, callback);
  } // eslint-disable-next-line no-underscore-dangle


  var namespace = reactorWindow.__adobeNamespace;

  if (namespace) {
    var queue = reactorWindow[namespace].q;
    queue.push = atag;
    queue.forEach(function (queuedArguments) {
      atag.apply(void 0, _toConsumableArray(queuedArguments));
    });
  } else {
    // TODO: Improve error message once we give a name to this library.
    console.error("Incorrectly configured.");
  }

  return atag;

}));
