(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.atag = factory());
}(this, function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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
        if (_typeof(this) !== 'object') throw new TypeError('Promises must be constructed via new');
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

          if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
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
              if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
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
        if (value && _typeof(value) === 'object' && value.constructor === Promise) {
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

  // - This dude acts as a Components repo.
  // - It also implements all of the Core's lifecycle hooks.
  // Let's start the first version with an explicit Hook interface,
  // and not a random pub/sub model. Meaning each Component will have 
  // to implement the hook it's interested in as a method on its prototype.
  // We will have a Plop helper that generates Components and populate all the
  // hooks as Template methods.
  // TODO: Finalize the first set of Lifecycle hooks.
  // TODO: Support Async hooks. (Or maybe default them as Async)
  // TODO: Hooks might have to publish events so the outside world can hooks in as well.
  // TODO Maybe rename this to `registry`.
  var CoreComponents =
  /*#__PURE__*/
  function () {
    function CoreComponents(listOfComponents) {
      _classCallCheck(this, CoreComponents);

      this._list = listOfComponents;
    }

    _createClass(CoreComponents, [{
      key: "add",
      value: function add(component) {
        // TODO: Validate the interface...
        this._list.push(component);
      }
    }, {
      key: "hasComponent",
      value: function hasComponent(namespace) {}
    }, {
      key: "getComponent",
      value: function getComponent(namespace) {
        return this._list.find(function (component) {
          return component.namespace === namespace;
        });
      } // ALL THE LIFECYCLE HOOKS GO HERE!

    }, {
      key: "onComponentsRegistered",
      value: function onComponentsRegistered(core) {
        // MAYBE: If a Component has a hard dependency, or maybe CORE can do this:
        //if (core.hasComponent('Personalization')) {
        // new Error() or core.missingRequirement('I require Personalization');
        //}
        return this._invokeHook("onComponentsRegistered", core);
      }
    }, {
      key: "onBeforeInteract",
      value: function onBeforeInteract(payload) {
        return this._invokeHook("onBeforeInteract", payload);
      }
    }, {
      key: "onInteractResponse",
      value: function onInteractResponse(response) {
        return this._invokeHook("onInteractResponse", response);
      }
    }, {
      key: "onBeforeCollect",
      value: function onBeforeCollect(payload) {
        return this._invokeHook("onBeforeCollect", payload);
      }
    }, {
      key: "onCollectResponse",
      value: function onCollectResponse(response) {
        return this._invokeHook("onCollectResponse", response);
      }
    }, {
      key: "_invokeHook",
      value: function _invokeHook(hook) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        return this._list.map(function (component) {
          if (typeof component[hook] === "function") {
            return component[hook].apply(component, args);
          }
        });
      }
    }]);

    return CoreComponents;
  }();

  var makeEmitter = function makeEmitter(target) {
    var events = {};

    target.on = function (eventName, callback, context) {
      if (!callback || typeof callback !== "function") {
        throw new Error("[ON] Callback should be a function.");
      }

      if (!events.hasOwnProperty(eventName)) {
        events[eventName] = [];
      }

      var subscriptionIndex = events[eventName].push({
        callback: callback,
        context: context
      }) - 1;
      return function () {
        events[eventName].splice(subscriptionIndex, 1);

        if (!events[eventName].length) {
          delete events[eventName];
        }
      };
    };

    target.publish = function (eventName) {
      if (!events.hasOwnProperty(eventName)) {
        return;
      }

      var data = [].slice.call(arguments, 1); // Note: We clone the callbacks array because a callback might unsubscribe,
      // which will change the length of the array and break this for loop.

      events[eventName].slice(0).forEach(function (eventMetadata) {
        eventMetadata.callback.apply(eventMetadata.context, data);
      });
    };

    return target.publish;
  };

  function EventBus() {
    this.publish = makeEmitter(this);
  }

  var registry = [];

  var Core =
  /*#__PURE__*/
  function () {
    function Core(configs) {
      _classCallCheck(this, Core);

      for (var _len = arguments.length, components = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        components[_key - 1] = arguments[_key];
      }

      this._components = new CoreComponents(registry.concat(components));
      this._configs = configs;
      this.interact = this.interact.bind(this);
      this.collect = this.collect.bind(this);
      this._events = new EventBus();

      this._components.onComponentsRegistered(this);

      this.tracker = this._components.getComponent("Tracker");
    }

    _createClass(Core, [{
      key: "interact",
      // Testing how we will expose Components' APIs to main.js and the outside world.
      value: function interact(data, callback) {
        this.tracker.interact(data, callback);
      }
    }, {
      key: "collect",
      value: function collect(data, callback) {
        this.tracker.collect(data, callback);
      }
    }, {
      key: "configs",
      get: function get() {
        return this._configs;
      }
    }, {
      key: "events",
      get: function get() {
        return this._events;
      }
    }, {
      key: "components",
      get: function get() {
        return this._components;
      }
    }], [{
      key: "makeLogger",
      value: function makeLogger(prefix) {
        return {};
      }
    }, {
      key: "registerComponent",
      value: function registerComponent(component) {
        registry.push(component);
      } // TODO: Define a plugin system.

    }, {
      key: "registerPlugin",
      value: function registerPlugin(plugin) {
      }
    }]);

    return Core;
  }();

  // data should be an array to support sending multiple events.
  function Payload() {
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

    var append = function append(key) {
      return function () {
        var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // TODO Validate...
        console.warn("[Payload:appendTo".concat(key, "] To Implement!"));
        Object.assign(payload[key], obj);
        return payload;
      };
    };

    this.appendToData = function (obj) {
      return payload.data.push(obj);
    };

    this.appendToQuery = append("query");
    this.appendToMetadata = append("metadata");
    this.appendToContext = append("context");

    this.toJson = function () {
      return JSON.stringify(payload);
    };
  }

  function setMetadata(payload, core) {
    // MAYBE: Not sure how the cross components communication will happen yet.
    var identity = core.components.getComponent("Identity"); // Append metadata to the payload.

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
        "js_enabled": true,
        "js_version": "1.8.5",
        "cookies_enabled": true,
        "browser_height": 900,
        "screen_orientation": "landscape",
        "webgl_renderer": "AMD Radeon Pro 460 OpenGL Engine"
      },
      view: {
        "url": "www.test.com",
        "referrer": "www.adobe.com"
      }
    });
  }

  function Request(core) {
    var createPayload = function createPayload(data, beforeHook) {
      // Populate the request's body with payload, data and metadata.
      var payload = new Payload({
        data: data
      }); // TODO: Make those hook calls Async?

      beforeHook(payload);
      setContext(payload);
      setMetadata(payload, core);
      return Promise.resolve(payload.toJson());
    }; // TODO: Extract this stuff into a core helper.


    var callServer = function callServer(endpoint) {
      return function (payload) {
        return fetch(core.configs.collectionUrl + "/" + endpoint, {
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

    this.send = function (data, endpoint, beforeHook, afterHook, callback) {
      createPayload(data, beforeHook).then(callServer(endpoint)) // Freeze the response before handing it to all the components.
      .then(function (response) {
        return Object.freeze(response.json());
      }).then(function (respJson) {
        return afterHook(respJson);
      }).then(function () {
        return callback("Request has been fired!");
      });
    };
  }

  function Tracker() {
    var core;
    Object.defineProperty(this, "namespace", {
      get: function get() {
        return "Tracker";
      }
    });

    this.onComponentsRegistered = function (coreInstance) {
      return core = coreInstance;
    };

    var makeServerCall = function makeServerCall(endpoint, beforeHook, afterHook) {
      return function (data, callback) {
        var request = new Request(core);
        return request.send(data, endpoint, beforeHook, afterHook, callback);
      };
    };

    var beforeInteractHook = function beforeInteractHook(payload) {
      return core.components.onBeforeInteract(payload);
    };

    var onInteractResponse = function onInteractResponse(response) {
      return core.components.onInteractResponse(response);
    };

    var onBeforeCollect = function onBeforeCollect(payload) {
      return core.components.onBeforeCollect(payload);
    };

    var onCollectResponse = function onCollectResponse(payload) {
      return core.components.onCollectResponse(payload);
    };

    this.interact = makeServerCall("interact", beforeInteractHook, onInteractResponse);
    this.collect = makeServerCall("collect", onBeforeCollect, onCollectResponse);
  }

  function register() {
    var tracker = new Tracker();
    Core.registerComponent(tracker);
    return tracker;
  }

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

  function Identity() {
    var hasIdSyncsExpired = true;
    Object.defineProperty(this, "namespace", {
      get: function get() {
        return "Identity";
      }
    });

    this.getEcid = function () {
      return reactorCookie.get("ecid");
    };

    this.onBeforeCollect = function (payload) {
      console.log("Identity:::onBeforeCollect");

      if (hasIdSyncsExpired) {
        payload.appendToQuery({
          identity: {
            "idSyncs": true,
            "container_id": 7
          }
        });
        hasIdSyncsExpired = false;
      }
    };

    this.onInteractResponse = function (_ref) {
      var ecid = _ref.ids.ecid;
      console.log("Identity:::onInteractResponse");
      reactorCookie.set('ecid', ecid, {
        expires: 7
      });
    };
  }

  // The register.js modules can be instead part of the build system

  function register$1() {
    var identity = new Identity();
    Core.registerComponent(identity);
    return identity;
  }

  function Destinations() {
    var hasDestinationExpired = true;
    Object.defineProperty(this, "namespace", {
      get: function get() {
        return "Destinations";
      }
    });

    this.onBeforeInteract = function (payload) {
      console.log("Destinations:::onBeforeInteract");

      if (hasDestinationExpired) {
        payload.appendToQuery({
          destinations: true
        });
        hasDestinationExpired = false;
      }
    };

    this.onInteractResponse = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$destinations = _ref.destinations,
          destinations = _ref$destinations === void 0 ? [] : _ref$destinations;

      console.log("Destinations:::onInteractResponse");
      destinations.forEach(function (dest) {
        return console.log(dest.url);
      });
    };
  }

  // The register.js modules can be instead part of the build system

  function register$2() {
    var destinations = new Destinations();
    Core.registerComponent(destinations);
    return destinations;
  }

  function Personalization() {
    Object.defineProperty(this, "namespace", {
      get: function get() {
        return "Personalization";
      }
    }); // IMPLEMENT THE HOOKS YOU ARE INTERESTED IN.

    this.onBeforeInteract = function (payload) {
      console.log("Personalization:::onBeforeInteract");
      payload.appendToQuery({
        personalization: {
          sessionId: "1234235"
        }
      });
    };

    this.onInteractResponse = function () {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$resources$person = _ref.resources.personalization,
          personalization = _ref$resources$person === void 0 ? [] : _ref$resources$person;

      console.log("Personalization:::onInteractResponse");
      document.addEventListener("DOMContentLoaded", function (event) {
        personalization.forEach(function (offer) {
          var el = document.querySelector(offer.offerMboxSelector);

          if (el) {
            el.innerHTML = offer.offerHtmlPayload;
          }
        });
      });
    };
  }

  // The register.js modules can be instead part of the build system

  function register$3() {
    var personalization = new Personalization();
    Core.registerComponent(personalization);
    return personalization;
  }

  var noop = function noop() {}; // TODO: Support multiple cores maybe per ORG ID.
  // cores: [{ orgId, instance }...]


  var core = null; // TODO: Look for existing atag (OR adbe) object on the page first.

  function atag() {
    var command = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "collect";

    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$params = _ref.params,
        params = _ref$params === void 0 ? {} : _ref$params,
        _ref$callback = _ref.callback,
        callback = _ref$callback === void 0 ? noop : _ref$callback;

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
      // TODO: Maybe pass Core in.
      register();
      register$1();
      register$2();
      register$3();
      core = new Core(configs); // TODO: Move this guy out of here.. This is just a quick test for the initial call. We might not even need that.

      if (!configs.disableStartupCall) {
        core.interact({
          event: "page View",
          pageName: "home"
        }, callback);
      }
    }

    function subscribe(params, callback) {}

    var commands = {
      collect: collect,
      configure: configure,
      subscribe: subscribe
    };
    commands[command](params, callback);
  }

  var namespace = window.__adobeNamespace;

  if (window[namespace]) {
    var queue = window[namespace].q;
    queue.forEach(function (queuedArguments) {
      atag.apply(void 0, _toConsumableArray(queuedArguments));
    });
  }

  window[namespace] = atag;

  return atag;

}));
