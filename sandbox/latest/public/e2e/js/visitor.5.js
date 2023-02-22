/**
 * @license
 * Adobe Visitor API for JavaScript version: 5.0.0
 * Copyright 2020 Adobe, Inc. All Rights Reserved
 * More info available at https://marketing.adobe.com/resources/help/en_US/mcvid/
 */
var VISITOR_DEBUG = false;

var Visitor = (function() {
  "use strict";

  var commonjsGlobal =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : typeof self !== "undefined"
      ? self
      : {};

  function createCommonjsModule(fn, module) {
    return (
      (module = { exports: {} }), fn(module, module.exports), module.exports
    );
  }

  // https://cdn.polyfill.io/v2/polyfill.js?features=Object.assign&flags=gated&ua=ie/9
  Object.assign =
    Object.assign ||
    function assign(target) {
      for (var index = 1, key, src; index < arguments.length; ++index) {
        src = arguments[index];

        for (key in src) {
          if (Object.prototype.hasOwnProperty.call(src, key)) {
            target[key] = src[key];
          }
        }
      }

      return target;
    };

  var MESSAGES = {
    HANDSHAKE: "HANDSHAKE",
    GETSTATE: "GETSTATE",
    PARENTSTATE: "PARENTSTATE"
  };
  var STATE_KEYS_MAP = {
    MCMID: "MCMID",
    MCAID: "MCAID",
    MCAAMB: "MCAAMB",
    MCAAMLH: "MCAAMLH",
    MCOPTOUT: "MCOPTOUT",
    CUSTOMERIDS: "CUSTOMERIDS"
  };
  var ASYNC_API_MAP = {
    MCMID: "getMarketingCloudVisitorID",
    MCAID: "getAnalyticsVisitorID",
    MCAAMB: "getAudienceManagerBlob",
    MCAAMLH: "getAudienceManagerLocationHint",
    MCOPTOUT: "isOptedOut",
    ALLFIELDS: "getVisitorValues"
  };
  var SYNC_API_MAP = {
    CUSTOMERIDS: "getCustomerIDs"
  };
  var ALL_APIS = {
    MCMID: "getMarketingCloudVisitorID",
    MCAAMB: "getAudienceManagerBlob",
    MCAAMLH: "getAudienceManagerLocationHint",
    MCOPTOUT: "isOptedOut",
    MCAID: "getAnalyticsVisitorID",
    CUSTOMERIDS: "getCustomerIDs",
    ALLFIELDS: "getVisitorValues"
  }; // Filedgroups in Visitor are using MC, A and AAM to annotate the requests, instead of MCMID..
  // So the loading calls are keyed by MC, A and AAM. We use this map to convert back and forth.

  var FIELDGROUP_TO_FIELD = {
    MC: "MCMID",
    A: "MCAID",
    AAM: "MCAAMB"
  };
  var FIELDS = {
    MCMID: "MCMID",
    MCOPTOUT: "MCOPTOUT",
    MCAID: "MCAID",
    MCAAMLH: "MCAAMLH",
    MCAAMB: "MCAAMB"
  };
  var AUTH_STATE = {
    UNKNOWN: 0,
    AUTHENTICATED: 1,
    LOGGED_OUT: 2
  };
  var OPT_OUT = {
    GLOBAL: "global"
  };
  var enums = {
    MESSAGES: MESSAGES,
    STATE_KEYS_MAP: STATE_KEYS_MAP,
    ASYNC_API_MAP: ASYNC_API_MAP,
    SYNC_API_MAP: SYNC_API_MAP,
    ALL_APIS: ALL_APIS,
    FIELDGROUP_TO_FIELD: FIELDGROUP_TO_FIELD,
    FIELDS: FIELDS,
    AUTH_STATE: AUTH_STATE,
    OPT_OUT: OPT_OUT
  };

  var STATE_KEYS_MAP$1 = enums.STATE_KEYS_MAP; // 1. If value is in state, return it and call callback.
  // 2. If not in state, create random ID, add it to state and call callback.

  var LocalVisitor = function LocalVisitor(generateRandomID) {
    function noop() {}

    function makeFallback(key, callback) {
      var localVisitor = this;
      return function() {
        var randomMid = generateRandomID(0, key);
        var state = {};
        state[key] = randomMid;
        localVisitor.setStateAndPublish(state);
        callback(randomMid);
        return randomMid;
      };
    }

    this.getMarketingCloudVisitorID = function(callback) {
      callback = callback || noop;
      var fieldValue = this.findField(STATE_KEYS_MAP$1.MCMID, callback);
      var fallbackToRandomID = makeFallback.call(
        this,
        STATE_KEYS_MAP$1.MCMID,
        callback
      );
      return typeof fieldValue !== "undefined"
        ? fieldValue
        : fallbackToRandomID();
    }; // Since we can only generate MIDs in LocalVisitor strategy, return an object
    // that contains the MID only.

    this.getVisitorValues = function(callback) {
      this.getMarketingCloudVisitorID(function(mid) {
        callback({
          MCMID: mid
        });
      });
    };
  };

  var MESSAGES$1 = enums.MESSAGES;
  var ASYNC_API_MAP$1 = enums.ASYNC_API_MAP;
  var SYNC_API_MAP$1 = enums.SYNC_API_MAP; // 1. If value is in state, return it and call callback.
  // 2. If not in state, message parent and register callback.
  // 3. Once the message is back from parent, update state and excecute all callbacks!

  var ProxyVisitor = function ProxyVisitor() {
    function noop() {}

    function makeFallback(key, callback) {
      var proxyVisitor = this;
      return function() {
        proxyVisitor.callbackRegistry.add(key, callback);
        proxyVisitor.messageParent(MESSAGES$1.GETSTATE);
        return "";
      };
    }

    function generateAsyncAPI(apiKey) {
      var methodName = ASYNC_API_MAP$1[apiKey];

      this[methodName] = function(callback) {
        callback = callback || noop;
        var fieldValue = this.findField(apiKey, callback);
        var fallbackToParent = makeFallback.call(this, apiKey, callback);
        return typeof fieldValue !== "undefined"
          ? fieldValue
          : fallbackToParent();
      };
    }

    function generateSyncAPI(apiKey) {
      var methodName = SYNC_API_MAP$1[apiKey]; // getCustomerIDs is an async api. So if we don't have a value for it, we just return {}.

      this[methodName] = function() {
        var fieldValue = this.findField(apiKey, noop);
        return fieldValue || {};
      };
    }

    Object.keys(ASYNC_API_MAP$1).forEach(generateAsyncAPI, this);
    Object.keys(SYNC_API_MAP$1).forEach(generateSyncAPI, this);
  };

  var ASYNC_API_MAP$2 = enums.ASYNC_API_MAP; // This will only be called if we are still waiting for the handshake to fail or succeed.
  // Add calls into callback registry; they'll get called when the handshake call resolves.

  var PlaceholderVisitor = function PlaceholderVisitor() {
    Object.keys(ASYNC_API_MAP$2).forEach(function(key) {
      var methodName = ASYNC_API_MAP$2[key];

      this[methodName] = function(callback) {
        this.callbackRegistry.add(key, callback);
      };
    }, this);
  };

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function(obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
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

  var utils = createCommonjsModule(function(module, exports) {
    exports.isObjectEmpty = function(obj) {
      return obj === Object(obj) && Object.keys(obj).length === 0;
    }; // Empty string or empty object.

    exports.isValueEmpty = function isValueEmpty(value) {
      return value === "" || exports.isObjectEmpty(value);
    };

    var isInternetExplorer = function isInternetExplorer() {
      var appName = navigator.appName;
      var userAgent = navigator.userAgent;

      if (
        appName === "Microsoft Internet Explorer" ||
        userAgent.indexOf("MSIE ") >= 0 ||
        (userAgent.indexOf("Trident/") >= 0 &&
          userAgent.indexOf("Windows NT 6") >= 0)
      ) {
        return true;
      }

      return false;
    }; // Checks if the browsers if IE, and return the version.

    exports.getIeVersion = function() {
      // IE 8+ supports documentMode
      if (document.documentMode) {
        return document.documentMode;
      } else if (isInternetExplorer()) {
        // Instead of using unsafe detection of unsupported IE browsers we return a low version
        return 7;
      } // Not IE.

      return null;
    };
    /*********************************************************************
     * Function encodeAndBuildRequest(arr, character): Take an array, encode it and join it on a character
     *     array = array to encode and join
     *     character = character join with
     * Returns:
     *     string representing the sanitized values
     * Example:
     *     encodeAndBuildRequest(['a=2', 'b=2'], '&'); // 'a%3D2&b%3D2'
     *********************************************************************/

    exports.encodeAndBuildRequest = function(arr, character) {
      return arr.map(encodeURIComponent).join(character);
    };
    /*********************************************************************
     * Function isObject(arg): Take one Argument and checks if it is an Object
     *     arg = any type of input
     * Returns:
     *     boolean representing if the passed arg is an Object
     * Example:
     *     isObject({}); // true
     *********************************************************************/

    exports.isObject = function(arg) {
      return (
        arg !== null &&
        _typeof(arg) === "object" &&
        Array.isArray(arg) === false
      );
    }; // Looks for an `adobe` object globally. If found, return it otherwise define a new `global.adobe` object.

    exports.defineGlobalNamespace = function() {
      window.adobe = exports.isObject(window.adobe) ? window.adobe : {};
      return window.adobe;
    };

    exports.pluck = function(obj, props) {
      return props.reduce(function(result, field) {
        if (obj[field]) {
          result[field] = obj[field];
        }

        return result;
      }, Object.create(null));
    };

    exports.parseOptOut = function(data, optOut, NONE) {
      if (!optOut) {
        optOut = NONE; // We always need a value even if it's none

        if (data["d_optout"] && data["d_optout"] instanceof Array) {
          optOut = data["d_optout"].join(",");
        }
      }

      var d_ottl = parseInt(data["d_ottl"], 10);

      if (isNaN(d_ottl)) {
        d_ottl = 7200; // 2 hours
      }

      return {
        optOut: optOut,
        d_ottl: d_ottl
      };
    };

    exports.normalizeBoolean = function(value) {
      var normalized = value;

      if (value === "true") {
        normalized = true;
      } else if (value === "false") {
        normalized = false;
      }

      return normalized;
    };
  });
  var utils_1 = utils.isObjectEmpty;
  var utils_2 = utils.isValueEmpty;
  var utils_3 = utils.getIeVersion;
  var utils_4 = utils.encodeAndBuildRequest;
  var utils_5 = utils.isObject;
  var utils_6 = utils.defineGlobalNamespace;
  var utils_7 = utils.pluck;
  var utils_8 = utils.parseOptOut;
  var utils_9 = utils.normalizeBoolean;

  function callbackRegistryFactory() {
    return {
      callbacks: {},
      add: function add(key, callback) {
        this.callbacks[key] = this.callbacks[key] || [];
        var index = this.callbacks[key].push(callback) - 1;

        var _instance = this;

        return function() {
          _instance.callbacks[key].splice(index, 1);
        };
      },
      execute: function execute(key, args) {
        if (this.callbacks[key]) {
          args = typeof args === "undefined" ? [] : args;
          args = args instanceof Array ? args : [args];

          try {
            while (this.callbacks[key].length) {
              var callback = this.callbacks[key].shift();

              if (typeof callback === "function") {
                callback.apply(null, args);
              } else if (callback instanceof Array) {
                callback[1].apply(callback[0], args);
              } // TODO: Throw an error if the callback is neither, or don't add it in the first place.
            }

            delete this.callbacks[key];
          } catch (ex) {
            // Fail gracefully and silently.
          }
        }
      },
      executeAll: function executeAll(valuesMap, forceExecute) {
        if (!forceExecute && (!valuesMap || utils.isObjectEmpty(valuesMap))) {
          return;
        }

        Object.keys(this.callbacks).forEach(function(key) {
          var value = valuesMap[key] !== undefined ? valuesMap[key] : "";
          this.execute(key, value);
        }, this);
      },
      hasCallbacks: function hasCallbacks() {
        return Boolean(Object.keys(this.callbacks).length);
      }
    };
  }

  var callbackRegistryFactory_1 = callbackRegistryFactory;

  var MESSAGES$2 = enums.MESSAGES;
  var MESSAGE_KEYS_MAP = {
    0: "prefix",
    1: "orgID",
    2: "state"
  }; // dtoMessage.data format: prefix|orgID|state.
  // Example: HANDSHAKE|1234@AdobeOrg|{MCMID:1234}
  // state is an optional stringified JSON.

  var Message = function Message(orgID, targetOrigin) {
    this.parse = function(dtoMessage) {
      try {
        var messageObj = {};
        var tokens = dtoMessage.data.split("|");
        tokens.forEach(function(token, index) {
          if (token !== undefined) {
            var propName = MESSAGE_KEYS_MAP[index];
            messageObj[propName] = index !== 2 ? token : JSON.parse(token);
          }
        });
        return messageObj;
      } catch (ex) {
        // Fail gracefully and silently.
      }
    };

    this.isInvalid = function(dtoMessage) {
      var msg = this.parse(dtoMessage);

      if (!msg || Object.keys(msg).length < 2) {
        // Either missing the Prefix key or the ORG ID.
        return true;
      }

      var isOrgIDInvalid = orgID !== msg.orgID;
      var isOriginInvalid = !targetOrigin || dtoMessage.origin !== targetOrigin; // TODO Find a cleaner way to do this. Maybe add a `type` to message.

      var isMsgPrefixInvalid =
        Object.keys(MESSAGES$2).indexOf(msg.prefix) === -1;
      return isOrgIDInvalid || isOriginInvalid || isMsgPrefixInvalid;
    };

    this.send = function(target, prefix, state) {
      var messageToSend = prefix + "|" + orgID;

      if (state && state === Object(state)) {
        messageToSend += "|" + JSON.stringify(state);
      }

      try {
        target.postMessage(messageToSend, targetOrigin);
      } catch (ex) {
        // Fail gracefully and silently.
      }
    };
  };

  /*

	WORKFLOW: (USE CASE 1 Parent Visitor exists - returning visitor)
	----------------------------------------------------------------

	1. Child sends a handshake to parent and waits 50ms
	2. Parent checks for AMCV cookie. If exists, then it's a returning visitor OR call getMarketingCloudID 
	   and make sure the returning value is empty string?
	3. Parent respond with the following: "HAND_SHAKE_SUCCESSFUL{MCMID:123,MCAAMB:12huyg312b,MCAAMLH:9,MCAID:124}"
	4. Populate Child state
	5. Execute all registered callbacks
	6. In Parent Visitor, decorate `setCustomerIDs` to push messages to Child when it's called. The message is the return
	   from calling `getCustomerIDs`.
	7. In Child, receive message from parent about customer IDs and add them to the state.
	8. In Child, overwite `getCustomerIDs` to return that value from the state.


	WORKFLOW: (USE CASE 1 - new visitor) (SOLUTION 1)
	-------------------------------------------------

	1. Child sends a handshake to parent
	2. Parent responds with: "HAND_SHAKE_SUCCESSFUL", and send whatever existing state: MCMID, MCAID..
	3. In Child, if we still have callbacks waiting for values, message back the parent and ask for the state.
	3. In Parent, if we find loading calls, add a callback for those calls waiting for the result to come, and call
	   back the child Visitor with those values.


	DECISIONS for V. 1:
	-------------------

	1. Don't send SDID info down from parent, but generate them on the Child. (Inherit the API)
	2. NO ID SYNCS in Child.
	3. No support for setCustomerIDs.


	TODO: 

	- What should we do with getLocationHint???
	- Debug hooks
	- Child visitor will attach the event listener on the visitor instance, instead of baking the code in Visitor.
	- Look for a Visitor object, if exists, find the instance in s_c_il and call instance.setChildListener.
	- ChildVisitor.js should contain an override to the Visitor.getInstance factory function. (IN FUTURE WHEN LAUNCH is released)

	*/

  var MESSAGES$3 = enums.MESSAGES;

  var ChildVisitor = function ChildVisitor(
    orgID,
    config,
    visitor,
    parentWindow
  ) {
    var childVisitor = this;
    var whitelistParentDomain = config.whitelistParentDomain;
    childVisitor.state = {
      ALLFIELDS: {}
    };
    childVisitor.version = visitor.version;
    childVisitor.marketingCloudOrgID = orgID;
    childVisitor.cookieDomain = visitor.cookieDomain || "";
    childVisitor._instanceType = "child";
    var isMessagePending = false;
    var message = new Message(orgID, whitelistParentDomain);
    childVisitor.callbackRegistry = callbackRegistryFactory_1();

    function setStrategyVisitor(strategy) {
      Object.assign(childVisitor, strategy); // childVisitor.__strategy = strategy.constructor.name;
    }

    function setStateAndPublish(state) {
      Object.assign(childVisitor.state, state);
      Object.assign(childVisitor.state["ALLFIELDS"], state);
      childVisitor.callbackRegistry.executeAll(childVisitor.state);
    }

    function onMessageFromParent(messageEvent) {
      if (message.isInvalid(messageEvent)) {
        return;
      }

      isMessagePending = false;
      var parsedMessage = message.parse(messageEvent);
      childVisitor.setStateAndPublish(parsedMessage.state);
    }

    function messageParent(msgPrefix) {
      if (!isMessagePending && whitelistParentDomain) {
        isMessagePending = true;
        message.send(parentWindow, msgPrefix);
      }
    }

    function onHandShakeFailure() {
      var forceExecuteAllCallbacks = true;
      setStrategyVisitor(new LocalVisitor(visitor._generateID));
      childVisitor.getMarketingCloudVisitorID(); // Populate the state with the only field we can support locally.

      childVisitor.callbackRegistry.executeAll(
        childVisitor.state,
        forceExecuteAllCallbacks
      );
      commonjsGlobal.removeEventListener("message", openConnectionWithParent);
    }

    function openConnectionWithParent(messageEvent) {
      if (message.isInvalid(messageEvent)) {
        return;
      }

      var parsedMessage = message.parse(messageEvent);
      isMessagePending = false;
      commonjsGlobal.clearTimeout(childVisitor._handshakeTimeout);
      commonjsGlobal.removeEventListener("message", openConnectionWithParent);
      setStrategyVisitor(new ProxyVisitor(childVisitor));
      commonjsGlobal.addEventListener("message", onMessageFromParent);
      childVisitor.setStateAndPublish(parsedMessage.state);

      if (childVisitor.callbackRegistry.hasCallbacks()) {
        // Get state from parent, because parent didn't send full state on handshake.
        messageParent(MESSAGES$3.GETSTATE);
      }
    }

    function triggerHandshake() {
      var HANDSHAKE_EXPIRY = 250; // Increased to 250 because ad blockers slow down PostMessage communication.

      if (whitelistParentDomain && postMessage) {
        commonjsGlobal.addEventListener("message", openConnectionWithParent);
        messageParent(MESSAGES$3.HANDSHAKE);
        childVisitor._handshakeTimeout = setTimeout(
          onHandShakeFailure,
          HANDSHAKE_EXPIRY
        );
      } else {
        onHandShakeFailure();
      }
    }

    function memoizeInstance() {
      if (!commonjsGlobal.s_c_in) {
        commonjsGlobal.s_c_il = [];
        commonjsGlobal.s_c_in = 0;
      }

      childVisitor._c = "Visitor";
      childVisitor._il = commonjsGlobal.s_c_il;
      childVisitor._in = commonjsGlobal.s_c_in;
      childVisitor._il[childVisitor._in] = childVisitor;
      commonjsGlobal.s_c_in++;
    }

    function implementAPI() {
      function setPublicApiToNoop(apiName) {
        if (
          apiName.indexOf("_") !== 0 &&
          typeof visitor[apiName] === "function"
        ) {
          childVisitor[apiName] = function() {};
        }
      } // Set all APIs on Child Visitor as noop.

      Object.keys(visitor).forEach(setPublicApiToNoop); // Add overrides here. For example, `getSupplementalDataID`.

      childVisitor.getSupplementalDataID = visitor.getSupplementalDataID; // isAllowed is always true in a Child Visitor since it can't create cookies already.

      childVisitor.isAllowed = function() {
        return true;
      };
    }

    childVisitor.init = function() {
      memoizeInstance(); // Store instance in `s_c_il`.

      implementAPI(); // Implement the Visitor public APIs as noop for now.

      setStrategyVisitor(new PlaceholderVisitor(childVisitor)); // Start off as a visitor that registers callbacks.

      triggerHandshake(); // Check if there's a Visitor on parent page.
    };

    childVisitor.findField = function(key, callback) {
      if (childVisitor.state[key] !== undefined) {
        callback(childVisitor.state[key]);
        return childVisitor.state[key];
      }
    };

    childVisitor.messageParent = messageParent;
    childVisitor.setStateAndPublish = setStateAndPublish;
  };

  var MESSAGES$4 = enums.MESSAGES;
  var ALL_APIS$1 = enums.ALL_APIS;
  var ASYNC_API_MAP$3 = enums.ASYNC_API_MAP;
  var FIELDGROUP_TO_FIELD$1 = enums.FIELDGROUP_TO_FIELD;

  var makeChildMessageListener = function makeChildMessageListener(
    visitor,
    message
  ) {
    function getNonEmptyFields() {
      var state = {};
      Object.keys(ALL_APIS$1).forEach(function(key) {
        var methodName = ALL_APIS$1[key];
        var value = visitor[methodName]();

        if (!utils.isValueEmpty(value)) {
          state[key] = value;
        }
      });
      return state;
    }

    function getPendingCalls() {
      var pendingCalls = [];

      if (visitor._loading) {
        Object.keys(visitor._loading).forEach(function(fieldGroup) {
          if (visitor._loading[fieldGroup]) {
            // fieldGroup: MC, A or AAM.
            var fieldKey = FIELDGROUP_TO_FIELD$1[fieldGroup];
            pendingCalls.push(fieldKey);
          }
        });
      }

      return pendingCalls.length ? pendingCalls : null;
    }

    function makePendingCallsChecker(onCallsResolved) {
      return function checkForPendingCalls(value) {
        var pendingCalls = getPendingCalls();

        if (pendingCalls) {
          var methodName = ASYNC_API_MAP$3[pendingCalls[0]]; // Wait for those calls one at a time.

          visitor[methodName](checkForPendingCalls, true); // Check again everytime a call comes back.
        } else {
          onCallsResolved();
        }
      };
    }

    function replyMessage(target, prefix) {
      var state = getNonEmptyFields();
      message.send(target, prefix, state);
    }

    function onHandshake(target) {
      observeSetCustomerIDs(target);
      replyMessage(target, MESSAGES$4.HANDSHAKE);
    }

    function onStateRequest(target) {
      var checkForPendingCalls = makePendingCallsChecker(
        function onCallsResolved() {
          replyMessage(target, MESSAGES$4.PARENTSTATE);
        }
      );
      checkForPendingCalls(); // Once all pending calls have resolved, get state and Post it to Child. (onCallsResolved)
    }

    function observeSetCustomerIDs(target) {
      var originalSetCustomerIDs = visitor.setCustomerIDs;

      function setCustomerIDs(customerIDs) {
        originalSetCustomerIDs.call(visitor, customerIDs);
        message.send(target, MESSAGES$4.PARENTSTATE, {
          CUSTOMERIDS: visitor.getCustomerIDs()
        });
      }

      visitor.setCustomerIDs = setCustomerIDs;
    }

    return function onMessageFromChild(messageEvent) {
      if (message.isInvalid(messageEvent)) {
        return;
      }

      var prefix = message.parse(messageEvent).prefix;
      var action =
        prefix === MESSAGES$4.HANDSHAKE ? onHandshake : onStateRequest;
      action(messageEvent.source);
    };
  };

  var asyncParallelApply = function asyncParallelApply(
    asyncFnsMetadata,
    finalCallback
  ) {
    var results = {};
    var responses = 0;
    var numberOfAsyncFns = Object.keys(asyncFnsMetadata).length;

    function makeCallback(prefix) {
      return function(result) {
        results[prefix] = result;
        responses++;
        var isLastFn = responses === numberOfAsyncFns;

        if (isLastFn) {
          finalCallback(results);
        }
      };
    }

    Object.keys(asyncFnsMetadata).forEach(function(key) {
      var metadata = asyncFnsMetadata[key];

      if (metadata.fn) {
        var args = metadata.args || [];
        args.unshift(makeCallback(key));
        metadata.fn.apply(metadata.context || null, args);
      }
    });
  };

  // NOTE: This module is just a placeholder until we switch to `reactor-cookie`.
  // This is the first step to try to match the `reactor-cookie` interface.
  // TODO: abstract out the lifetime logic into Visitor.cookieWrite.
  function safeGet(obj, prop, defaultValue) {
    var result = obj == null ? undefined : obj[prop]; // eslint-disable-line eqeqeq

    return result === undefined ? defaultValue : result;
  }

  var cookies = {
    get: function get(name) {
      name = encodeURIComponent(name);
      var c = (";" + document.cookie).split(" ").join(";");
      var i = c.indexOf(";" + name + "=");
      var e = i < 0 ? i : c.indexOf(";", i + 1);
      return i < 0
        ? ""
        : decodeURIComponent(
            c.substring(i + 2 + name.length, e < 0 ? c.length : e)
          );
    },
    set: function set(name, value, options) {
      var lifetime = safeGet(options, "cookieLifetime");
      var expires = safeGet(options, "expires");
      var domain = safeGet(options, "domain");
      var secure = safeGet(options, "secure");
      var secureString = secure ? "Secure" : "";

      if (expires && lifetime !== "SESSION" && lifetime !== "NONE") {
        var t = value !== "" ? parseInt(lifetime ? lifetime : 0, 10) : -60;

        if (t) {
          expires = new Date();
          expires.setTime(expires.getTime() + t * 1000);
        } else if (expires === 1) {
          expires = new Date();
          var y = expires.getYear();
          expires.setYear(y + 2 + (y < 1900 ? 1900 : 0));
        }
      } else {
        expires = 0;
      }

      if (name && lifetime !== "NONE") {
        document.cookie =
          encodeURIComponent(name) +
          "=" +
          encodeURIComponent(value) +
          "; path=/;" +
          (expires ? " expires=" + expires.toGMTString() + ";" : "") +
          (domain ? " domain=" + domain + ";" : "") +
          secureString;
        return this.get(name) === value;
      }

      return 0;
    },
    remove: function remove(name, options) {
      var domain = safeGet(options, "domain");
      domain = domain ? " domain=" + domain + ";" : "";
      document.cookie =
        encodeURIComponent(name) +
        "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;" +
        domain;
    }
  };

  /*********************************************************************
   * Function _getDomain(hostname): Get domain from hostname
   *     hostname = Optional hostname to build the domain from.
   *                Defaults to global.location.hostname
   * Returns:
   *     Domain
   *********************************************************************/

  var getDomain = function getDomain(hostname) {
    var domain;

    if (!hostname && commonjsGlobal.location) {
      hostname = commonjsGlobal.location.hostname;
    }

    domain = hostname;
    var i,
      cookieName = "test",
      domainParts = domain.split("."),
      topLevelDomain = "";

    for (i = domainParts.length - 2; i >= 0; i--) {
      domain = domainParts.slice(i).join(".");

      if (
        cookies.set(cookieName, "cookie", {
          domain: domain
        })
      ) {
        cookies.remove(cookieName, {
          domain: domain
        });
        return domain;
      }
    }

    return topLevelDomain;
  };

  function validateListOfInts(digits) {
    var POSITIVE_INT_REGEX = /^\d+$/;

    for (var i = 0, l = digits.length; i < l; i++) {
      if (!POSITIVE_INT_REGEX.test(digits[i])) {
        return false;
      }
    }

    return true;
  } // Append 0s to the shorter list to make them same length.

  function extendWithZeros(listA, listB) {
    while (listA.length < listB.length) {
      listA.push("0");
    }

    while (listB.length < listA.length) {
      listB.push("0");
    }
  }

  function listOfIntsComparator(listA, listB) {
    for (var i = 0; i < listA.length; i++) {
      var tokenA = parseInt(listA[i], 10);
      var tokenB = parseInt(listB[i], 10);

      if (tokenA > tokenB) {
        return 1;
      }

      if (tokenB > tokenA) {
        return -1;
      }
    }

    return 0;
  }
  /*********************************************************************
	 * Function _compareVersions(v1, v2) - compares 2 numerical versions
	 *
	 * v1, v2: numerical versions e.g. '1.3', '1.4.5', '1.5.7'
	 * If a version contains a non numeric value, _compareVersions will return NaN
	 *
	 * Returns:
	 *   -1 if v1 < v2
	 *    0 if v1 === v2
	      1 if v1 > v2
	 *    NaN if v1 or v2 contains non numeric values e.g. '1.4a', '1.2-alpha.3'
	 *
	 *********************************************************************/

  function compareVersions(a, b) {
    if (a === b) {
      return 0;
    }

    var aTokens = a.toString().split(".");
    var bTokens = b.toString().split(".");

    if (!validateListOfInts(aTokens.concat(bTokens))) {
      return NaN;
    }

    extendWithZeros(aTokens, bTokens);
    return listOfIntsComparator(aTokens, bTokens);
  }

  var version = {
    compare: compareVersions,
    isLessThan: function isLessThan(v1, v2) {
      return compareVersions(v1, v2) < 0;
    },
    areVersionsDifferent: function areVersionsDifferent(v1, v2) {
      return compareVersions(v1, v2) !== 0;
    },
    isGreaterThan: function isGreaterThan(v1, v2) {
      return compareVersions(v1, v2) > 0;
    },
    isEqual: function isEqual(v1, v2) {
      return compareVersions(v1, v2) === 0;
    }
  };

  /*
   * a backwards compatible implementation of postMessage
   * by Josh Fraser (joshfraser.com)
   * released under the Apache 2.0 license.
   *
   * this code was adapted from Ben Alman's jQuery postMessage code found at:
   * http://benalman.com/projects/jquery-postmessage-plugin/
   *
   * other inspiration was taken from Luke Shepard's code for Facebook Connect:
   * http://github.com/facebook/connect-js/blob/master/src/core/xd.js
   *
   * the goal of this project was to make a backwards compatable version of postMessage
   * without having any dependency on jQuery or the FB Connect libraries
   *
   * my goal was to keep this as terse as possible since my own purpose was to use this
   * as part of a distributed widget where filesize could be sensative.
   *
   */

  var IS_POST_MESSAGE_ENABLED = !!commonjsGlobal.postMessage;
  var crossDomain = {
    /*********************************************************************
     * Function postMessage(message, target_url, target): Post message to iframe
     *     message = specially formatted data
     *     target_url = iframe src
     *     target = iframe.contentWindow
     * Returns:
     *     Nothing
     *********************************************************************/
    postMessage: function postMessage(message, target_url, target) {
      var cache_bust = 1;

      if (!target_url) {
        return;
      }

      if (IS_POST_MESSAGE_ENABLED) {
        // the browser supports window.postMessage, so call it with a targetOrigin
        // set appropriately, based on the target_url parameter.
        target.postMessage(
          message,
          target_url.replace(/([^:]+:\/\/[^\/]+).*/, "$1")
        );
      } else if (target_url) {
        // the browser does not support window.postMessage, so set the location
        // of the target to target_url#message. A bit ugly, but it works! A cache
        // bust parameter is added to ensure that repeat messages trigger the callback.
        target.location =
          target_url.replace(/#.*$/, "") +
          "#" +
          +new Date() +
          cache_bust++ +
          "&" +
          message;
      }
    },

    /*********************************************************************
     * Function receiveMessage(callback, source_origin): receive message from iframe
     *     callback = function
     *     source_origin = iframe hostname
     * Returns:
     *     Nothing
     *********************************************************************/
    receiveMessage: function receiveMessage(callback, source_origin) {
      var attached_callback;

      try {
        // browser supports window.postMessage
        if (IS_POST_MESSAGE_ENABLED) {
          // bind the callback to the actual event associated with window.postMessage
          if (callback) {
            attached_callback = function attached_callback(e) {
              if (
                (typeof source_origin === "string" &&
                  e.origin !== source_origin) ||
                (Object.prototype.toString.call(source_origin) ===
                  "[object Function]" &&
                  source_origin(e.origin) === !1)
              ) {
                return !1;
              }

              callback(e);
            };
          }

          if (commonjsGlobal.addEventListener) {
            commonjsGlobal[
              callback ? "addEventListener" : "removeEventListener"
            ]("message", attached_callback);
          } else {
            commonjsGlobal[callback ? "attachEvent" : "detachEvent"](
              "onmessage",
              attached_callback
            );
          }
        }
      } catch (__Error__) {
        // Fail silently.
      }
    }
  };

  var generateRandomID = function(b) {
    var c = "0123456789",
      d = "",
      e = "",
      f,
      g,
      h = 8,
      i = 10,
      j = 10; /* The first nibble can't have the left-most bit set because we are deailing with signed 64bit numbers. */ // TODO Extract this portion into a separate function.
    if (1 == b) {
      for (c += "ABCDEF", f = 0; 16 > f; f++)
        (g = Math.floor(Math.random() * h)),
          (d += c.substring(g, g + 1)),
          (g = Math.floor(Math.random() * h)),
          (e += c.substring(g, g + 1)),
          (h = 16);
      return d + "-" + e;
    }
    /*
     * We're dealing with 2 signed, but positive, 64bit numbers so the max for high and low is:
     * 9222372036854775807
     *    ^---------------- The 4th digit could actually be a 3 if we wanted to add more max checks
     *                      but we set the max to 2 to avoid them
     */ for (f = 0; 19 > f; f++)
      (g = Math.floor(Math.random() * i)),
        (d += c.substring(g, g + 1)),
        0 === f && 9 == g
          ? (i = 3)
          : (1 == f || 2 == f) && 10 != i && 2 > g
          ? (i = 10)
          : 2 < f && (i = 10),
        (g = Math.floor(Math.random() * j)),
        (e += c.substring(g, g + 1)),
        0 === f && 9 == g
          ? (j = 3)
          : (1 == f || 2 == f) && 10 != j && 2 > g
          ? (j = 10)
          : 2 < f && (j = 10);
    return d + e;
  };

  /*global VISITOR_DEBUG*/

  var makeCorsRequest = function makeCorsRequest(visitor, timeoutMetrics) {
    return {
      // CORS is for cross-domain AJAX in browsers that support it
      // 'withCredentials' needs to be a supported property for cookies to be enabled
      corsMetadata: (function() {
        var corsType = "none",
          corsCookiesEnabled = true;

        if (
          typeof XMLHttpRequest !== "undefined" &&
          XMLHttpRequest === Object(XMLHttpRequest)
        ) {
          if ("withCredentials" in new XMLHttpRequest()) {
            // Standard feature detection
            // NOTE: This will return true in IE 10 as well! (MCID-206)
            corsType = "XMLHttpRequest";
          } else if (
            typeof XDomainRequest !== "undefined" &&
            XDomainRequest === Object(XDomainRequest)
          ) {
            // IE8/9 - XDomainRequest will not be used
            corsCookiesEnabled = false;
          } // Safari

          if (
            Object.prototype.toString
              .call(commonjsGlobal.HTMLElement)
              .indexOf("Constructor") > 0
          ) {
            corsCookiesEnabled = false;
          }
        }

        return {
          corsType: corsType,
          corsCookiesEnabled: corsCookiesEnabled
        };
      })(),

      /*********************************************************************
       * Function getCORSInstance()
       * Returns:
       *     A valid CORS instance or null
       *********************************************************************/
      getCORSInstance: function getCORSInstance() {
        return this.corsMetadata.corsType === "none"
          ? null
          : new commonjsGlobal[this.corsMetadata.corsType]();
      },

      /*********************************************************************
       * Function fireCors(corsData): send CORS POST and pass response to callback
       * Returns:
       *     Nothing
       *********************************************************************/
      fireCORS: function fireCORS(corsData, loadErrorHandler, fieldGroup) {
        var self = this;

        if (loadErrorHandler) {
          corsData.loadErrorHandler = loadErrorHandler;
        }

        function handleCORSResponse(responseText) {
          var json; // JSON.parse is supported by all CORS-enabled browsers except iOS Safari 3.2, which has 0% market share (see http://caniuse.com/#search=json.parse and http://caniuse.com/#search=cors)

          try {
            json = JSON.parse(responseText);

            if (json !== Object(json)) {
              self.handleCORSError(corsData, null, "Response is not JSON");
              return;
            }
          } catch (error) {
            // Possible source of error: a pixel is returned from a 302 redirect
            self.handleCORSError(
              corsData,
              error,
              "Error parsing response as JSON"
            );
            return;
          }

          try {
            var callback = corsData.callback,
              callbackFn = commonjsGlobal;

            for (var i = 0; i < callback.length; i++) {
              callbackFn = callbackFn[callback[i]];
            }

            callbackFn(json);
          } catch (error) {
            self.handleCORSError(
              corsData,
              error,
              "Error forming callback function"
            );
          }
        }

        try {
          var corsInstance = this.getCORSInstance();
          corsInstance.open(
            "get",
            corsData.corsUrl + "&ts=" + new Date().getTime(),
            true
          );

          if (this.corsMetadata.corsType === "XMLHttpRequest") {
            // This line has to come after corsInstance.open() to work in IE10/11 and Safari 5 (see http://stackoverflow.com/questions/19666809/cors-withcredentials-support-limited)
            corsInstance.withCredentials = true; // This line has to come after corsInstance.open() to work in IE10/11

            corsInstance.timeout = visitor.loadTimeout; // Set content type

            corsInstance.setRequestHeader(
              "Content-Type",
              "application/x-www-form-urlencoded"
            );

            corsInstance.onreadystatechange = function() {
              if (this.readyState === 4) {
                if (this.status === 200) {
                  handleCORSResponse(this.responseText);
                }
              }
            };
          }

          corsInstance.onerror = function(error) {
            // One possible error is if the proper CORS response headers are not returned
            self.handleCORSError(corsData, error, "onerror");
          };

          corsInstance.ontimeout = function(error) {
            self.handleCORSError(corsData, error, "ontimeout");
          };

          corsInstance.send();

          if (VISITOR_DEBUG) {
            timeoutMetrics.fieldGroupObj[fieldGroup] = {
              requestStart: timeoutMetrics.millis(),
              url: corsData.corsUrl,
              d_visid_stg_timeout_captured: corsInstance.timeout,
              d_settimeout_overriden: timeoutMetrics.getSetTimeoutOverriden(),
              d_visid_cors: 1
            };
          } // Log the request

          visitor._log.requests.push(corsData.corsUrl);
        } catch (error) {
          // One possible error is 'Access Denied' in IE10/11 due to http://devmohd.blogspot.com/2013/09/cross-domain.html
          this.handleCORSError(corsData, error, "try-catch");
        }
      },

      /*********************************************************************
       * Function handleCORSError(corsData, error, description): put CORS error info into visitor.CORSErrors array
       * Returns:
       *     Nothing
       *********************************************************************/
      handleCORSError: function handleCORSError(corsData, error, description) {
        visitor.CORSErrors.push({
          corsData: corsData,
          error: error,
          description: description
        });

        if (corsData.loadErrorHandler) {
          if (description === "ontimeout") {
            corsData.loadErrorHandler(true);
          } else {
            corsData.loadErrorHandler(false);
          }
        }
      }
    };
  };

  var constants = {
    POST_MESSAGE_ENABLED: !!commonjsGlobal.postMessage,
    DAYS_BETWEEN_SYNC_ID_CALLS: 1,
    MILLIS_PER_DAY: 24 * 60 * 60 * 1000,
    ADOBE_MC: "adobe_mc",
    ADOBE_MC_SDID: "adobe_mc_sdid",
    VALID_VISITOR_ID_REGEX: /^[0-9a-fA-F\-]+$/,
    ADOBE_MC_TTL_IN_MIN: 5,
    VERSION_REGEX: /vVersion\|((\d+\.)?(\d+\.)?(\*|\d+))(?=$|\|)/,
    FIRST_PARTY_SERVER_COOKIE: "s_ecid"
  };

  var MCSYNCSOP = "MCSYNCSOP"; // fieldMarketingCloudSyncsOnPage

  var MCSYNCS = "MCSYNCS"; // fieldMarketingCloudSyncs

  var MCAAMLH = "MCAAMLH"; // fieldAudienceManagerLocationHint

  /* Destination publishing for id syncs */

  var makeDestinationPublishing = function makeDestinationPublishing(
    visitor,
    thisClass
  ) {
    var d = commonjsGlobal.document;
    return {
      THROTTLE_START: 30000,
      MAX_SYNCS_LENGTH: 649,
      throttleTimerSet: false,
      id: null,
      onPagePixels: [],
      iframeHost: null,

      /*********************************************************************
       * Function getIframeHost(url): get hostname of iframe src
       *     url = iframe src
       * Returns:
       *     hostname
       * Example:
       *     getIframeHost('http://fast.demofirst.demdex.net/dest5.html') // http://fast.demofirst.demdex.net
       *********************************************************************/
      getIframeHost: function getIframeHost(url) {
        if (typeof url === "string") {
          var split = url.split("/");
          return split[0] + "//" + split[2];
        }
      },
      subdomain: null,
      url: null,

      /*********************************************************************
       * Function getUrl(): get iframe src
       * Returns:
       *     iframe src
       *********************************************************************/
      getUrl: function getUrl() {
        var prefix = "http://fast.",
          suffix =
            "?d_nsid=" +
            visitor.idSyncContainerID +
            "#" +
            encodeURIComponent(d.location.origin),
          url;

        if (!this.subdomain) {
          this.subdomain = "nosubdomainreturned";
        }

        if (visitor.loadSSL) {
          if (visitor.idSyncSSLUseAkamai) {
            prefix = "https://fast.";
          } else {
            prefix = "https://";
          }
        }

        url = prefix + this.subdomain + ".demdex.net/dest5.html" + suffix;
        this.iframeHost = this.getIframeHost(url);
        this.id =
          "destination_publishing_iframe_" +
          this.subdomain +
          "_" +
          visitor.idSyncContainerID;
        return url;
      },

      /*********************************************************************
       * Function checkDPIframeSrc(): get iframe src from visitor.dpIframeSrc if it exists
       * Returns:
       *     iframe src
       *********************************************************************/
      checkDPIframeSrc: function checkDPIframeSrc() {
        var suffix =
          "?d_nsid=" +
          visitor.idSyncContainerID +
          "#" +
          encodeURIComponent(d.location.href);

        if (
          typeof visitor.dpIframeSrc === "string" &&
          visitor.dpIframeSrc.length
        ) {
          this.id =
            "destination_publishing_iframe_" +
            (visitor._subdomain || this.subdomain || new Date().getTime()) +
            "_" +
            visitor.idSyncContainerID;
          this.iframeHost = this.getIframeHost(visitor.dpIframeSrc);
          this.url = visitor.dpIframeSrc + suffix;
        }
      },
      idCallNotProcesssed: null,
      doAttachIframe: false,
      startedAttachingIframe: false,
      iframeHasLoaded: null,
      iframeIdChanged: null,
      newIframeCreated: null,
      originalIframeHasLoadedAlready: null,
      iframeLoadedCallbacks: [],
      regionChanged: false,
      timesRegionChanged: 0,
      sendingMessages: false,
      messages: [],
      messagesPosted: [],
      messagesReceived: [],
      messageSendingInterval: constants.POST_MESSAGE_ENABLED ? null : 100,
      // 100 ms for IE6/7, not used for all other major modern browsers
      onPageDestinationsFired: [],
      jsonForComparison: [],
      jsonDuplicates: [],
      jsonWaiting: [],
      jsonProcessed: [],
      canSetThirdPartyCookies: true,
      receivedThirdPartyCookiesNotification: false,
      readyToAttachIframePreliminary: function readyToAttachIframePreliminary() {
        return (
          !visitor.idSyncDisableSyncs &&
          !visitor.disableIdSyncs &&
          !visitor.idSyncDisable3rdPartySyncing &&
          !visitor.disableThirdPartyCookies &&
          !visitor.disableThirdPartyCalls
        );
      },

      /*********************************************************************
       * Function readyToAttachIframe(): check if iframe is ready to be attached
       * Returns:
       *     Nothing
       *********************************************************************/
      readyToAttachIframe: function readyToAttachIframe() {
        return (
          this.readyToAttachIframePreliminary() &&
          (this.doAttachIframe || visitor._doAttachIframe) &&
          ((this.subdomain && this.subdomain !== "nosubdomainreturned") ||
            visitor._subdomain) &&
          this.url &&
          !this.startedAttachingIframe
        );
      },

      /*********************************************************************
       * Function attachIframe(): attach iframe
       * Returns:
       *     Nothing
       *********************************************************************/
      attachIframe: function attachIframe() {
        this.startedAttachingIframe = true;
        var self = this,
          iframe = d.getElementById(this.id);

        if (!iframe) {
          createNewIframe();
        } else if (iframe.nodeName !== "IFRAME") {
          this.id += "_2";
          this.iframeIdChanged = true;
          createNewIframe();
        } else {
          this.newIframeCreated = false; // This class name is set by Visitor API

          if (iframe.className !== "aamIframeLoaded") {
            this.originalIframeHasLoadedAlready = false;
            addLoadListener(
              "The destination publishing iframe already exists from a different library, but hadn't loaded yet."
            );
          } else {
            this.originalIframeHasLoadedAlready = true;
            this.iframeHasLoaded = true;
            this.iframe = iframe;
            this.fireIframeLoadedCallbacks(
              "The destination publishing iframe already exists from a different library, and had loaded alresady."
            );
            this.requestToProcess();
          }
        }

        function createNewIframe() {
          iframe = d.createElement("iframe");
          iframe["sandbox"] = "allow-scripts allow-same-origin";
          iframe.title = "Adobe ID Syncing iFrame";
          iframe.id = self.id;
          iframe.name = self.id + "_name";
          iframe.style.cssText = "display: none; width: 0; height: 0;";
          iframe.src = self.url;
          self.newIframeCreated = true;
          addLoadListener();
          d.body.appendChild(iframe);
        }

        function addLoadListener(message) {
          iframe.addEventListener("load", function() {
            iframe.className = "aamIframeLoaded";
            self.iframeHasLoaded = true;
            self.fireIframeLoadedCallbacks(message);
            self.requestToProcess();
          });
        }

        this.iframe = iframe;
      },
      fireIframeLoadedCallbacks: function fireIframeLoadedCallbacks(message) {
        this.iframeLoadedCallbacks.forEach(function(callback) {
          if (typeof callback === "function") {
            callback({
              message:
                message ||
                "The destination publishing iframe was attached and loaded successfully."
            });
          }
        });
        this.iframeLoadedCallbacks = [];
      },

      /*********************************************************************
       * Function requestToProcess(json): queues json, then processes the queue when conditions are met
       *     json = id sync json
       * Returns:
       *     Nothing
       *********************************************************************/
      requestToProcess: function requestToProcess(json) {
        var self = this,
          ibsString;

        function acceptJSON() {
          self.jsonForComparison.push(json);
          self.jsonWaiting.push(json);
          self.processSyncOnPage(json);
        }

        if (json === Object(json) && json.ibs) {
          ibsString = JSON.stringify(json.ibs || []);

          if (!this.jsonForComparison.length) {
            acceptJSON();
          } else {
            var hasMatch = false,
              i,
              l,
              jsn;

            for (i = 0, l = this.jsonForComparison.length; i < l; i++) {
              jsn = this.jsonForComparison[i];

              if (ibsString === JSON.stringify(jsn.ibs || [])) {
                hasMatch = true;
                break;
              }
            }

            if (hasMatch) {
              this.jsonDuplicates.push(json);
            } else {
              acceptJSON();
            }
          }
        } // IE6/7 will not receive ThirdPartyCookiesNotification

        if (
          (this.receivedThirdPartyCookiesNotification ||
            !constants.POST_MESSAGE_ENABLED ||
            this.iframeHasLoaded) &&
          this.jsonWaiting.length
        ) {
          var data = this.jsonWaiting.shift();
          this.process(data);
          this.requestToProcess();
        }

        if (
          !visitor.idSyncDisableSyncs &&
          !visitor.disableIdSyncs &&
          this.iframeHasLoaded &&
          this.messages.length &&
          !this.sendingMessages
        ) {
          // TODO Deprecate idSyncDisableSyncs.
          if (!this.throttleTimerSet) {
            this.throttleTimerSet = true;
            setTimeout(function() {
              self.messageSendingInterval = constants.POST_MESSAGE_ENABLED
                ? null
                : 150; // 150 ms for IE6/7, not used for all other major modern browsers
            }, this.THROTTLE_START);
          }

          this.sendingMessages = true;
          this.sendMessages();
        }
      },
      getRegionAndCheckIfChanged: function getRegionAndCheckIfChanged(
        data,
        ttl
      ) {
        var aamLH = visitor._getField(MCAAMLH);

        var responseRegion = data.d_region || data.dcs_region;

        if (!aamLH) {
          aamLH = responseRegion;

          if (aamLH) {
            visitor._setFieldExpire(MCAAMLH, ttl);

            visitor._setField(MCAAMLH, aamLH);
          }
        } else {
          if (responseRegion) {
            visitor._setFieldExpire(MCAAMLH, ttl);

            visitor._setField(MCAAMLH, responseRegion);

            if (parseInt(aamLH, 10) !== responseRegion) {
              this.regionChanged = true;
              this.timesRegionChanged++;

              visitor._setField(MCSYNCSOP, "");

              visitor._setField(MCSYNCS, "");

              aamLH = responseRegion;
            }
          }
        }

        if (!aamLH) {
          aamLH = "";
        }

        return aamLH;
      },

      /*********************************************************************
       * Function processSyncOnPage(json): processes json for sending id syncs on page
       *     json = id sync json
       * Returns:
       *     Nothing
       *********************************************************************/
      processSyncOnPage: function processSyncOnPage(json) {
        var key, l, i, k;

        if ((key = json["ibs"]) && key instanceof Array && (l = key.length)) {
          for (i = 0; i < l; i++) {
            k = key[i];

            if (k["syncOnPage"]) {
              this.checkFirstPartyCookie(k, "", "syncOnPage");
            }
          }
        }
      },

      /*********************************************************************
       * Function process(json): processes json for sending to iframe
       *     json = id sync json
       * Returns:
       *     Nothing
       *********************************************************************/
      process: function process(json) {
        var f = encodeURIComponent,
          declaredIdString = "",
          dataPresent = false,
          key,
          l,
          i,
          k,
          a;

        if ((key = json["ibs"]) && key instanceof Array && (l = key.length)) {
          dataPresent = true;

          for (i = 0; i < l; i++) {
            k = key[i];
            a = [
              f("ibs"),
              f(k["id"] || ""),
              f(k["tag"] || ""),
              utils.encodeAndBuildRequest(k["url"] || [], ","),
              f(k["ttl"] || ""),
              "",
              declaredIdString,
              k["fireURLSync"] ? "true" : "false"
            ];

            if (k["syncOnPage"]) {
              // This is handled in processSyncOnPage()
              continue;
            } else if (this.canSetThirdPartyCookies) {
              this.addMessage(a.join("|"));
            } else if (k["fireURLSync"]) {
              this.checkFirstPartyCookie(k, a.join("|"));
            }
          }
        }

        if (dataPresent) {
          this.jsonProcessed.push(json);
        }
      },

      /*********************************************************************
       * Function checkFirstPartyCookie(config, message): checks if id sync should be fired, and sets control cookie
       *     config = id sync config
       *     message = id sync message
       * Returns:
       *     Nothing
       *********************************************************************/
      checkFirstPartyCookie: function checkFirstPartyCookie(
        config,
        message,
        idSyncType
      ) {
        var onPage = idSyncType === "syncOnPage" ? true : false,
          field = onPage ? MCSYNCSOP : MCSYNCS;

        visitor._readVisitor();

        var syncs = visitor._getField(field),
          dataPresent = false,
          dataValid = false,
          now = Math.ceil(new Date().getTime() / constants.MILLIS_PER_DAY),
          data,
          pruneResult;

        if (syncs) {
          data = syncs.split("*");
          pruneResult = this.pruneSyncData(data, config["id"], now);
          dataPresent = pruneResult.dataPresent;
          dataValid = pruneResult.dataValid;

          if (!dataPresent || !dataValid) {
            this.fireSync(onPage, config, message, data, field, now);
          }
        } else {
          data = [];
          this.fireSync(onPage, config, message, data, field, now);
        }
      },

      /*********************************************************************
       * Function pruneSyncData(data, id, now): removes expired id syncs and returns status of current id sync tracker
       *     data = array of id sync trackers
       *     id = data provider id
       *     now = current date in days since epoch
       * Returns:
       *     {
       *         dataPresent: <boolean>,
       *         dataValid: <boolean>
       *     }
       *********************************************************************/
      pruneSyncData: function pruneSyncData(data, id, now) {
        var dataPresent = false,
          dataValid = false,
          tinfo,
          i,
          tstamp;

        for (i = 0; i < data.length; i++) {
          tinfo = data[i];
          tstamp = parseInt(tinfo.split("-")[1], 10);

          if (tinfo.match("^" + id + "-")) {
            dataPresent = true;

            if (now < tstamp) {
              dataValid = true;
            } else {
              data.splice(i, 1);
              i--;
            }
          } else {
            if (now >= tstamp) {
              data.splice(i, 1);
              i--;
            }
          }
        }

        return {
          dataPresent: dataPresent,
          dataValid: dataValid
        };
      },

      /*********************************************************************
       * Function manageSyncsSize(data): replaces id sync trackers that are soonest to expire until size is within limit
       *     data = array of id sync trackers
       * Returns:
       *     Nothing
       *********************************************************************/
      manageSyncsSize: function manageSyncsSize(data) {
        if (data.join("*").length > this.MAX_SYNCS_LENGTH) {
          data.sort(function(a, b) {
            return (
              parseInt(a.split("-")[1], 10) - parseInt(b.split("-")[1], 10)
            );
          });

          while (data.join("*").length > this.MAX_SYNCS_LENGTH) {
            data.shift();
          }
        }
      },

      /*********************************************************************
       * Function fireSync(onPage, config, message, data, field, now): sends id sync on page or in iframe
       *     onPage - fire on page
       *     config - id sync data
       *     message - id sync for iframe
       *     data - id sync cookie data
       *     field - cookie field
       *     now - snapshot of date in days since epoch
       * Returns:
       *     Nothing
       *********************************************************************/
      fireSync: function fireSync(onPage, config, message, data, field, now) {
        var self = this;

        if (onPage) {
          if (config["tag"] === "img") {
            var urls = config["url"],
              protocol = visitor.loadSSL ? "https:" : "http:",
              i,
              l,
              url,
              protocolIsPrependable;

            for (i = 0, l = urls.length; i < l; i++) {
              url = urls[i];
              protocolIsPrependable = /^\/\//.test(url);
              var img = new Image();
              img.addEventListener(
                "load",
                (function(index, syncConfig, syncField, syncNow) {
                  return function() {
                    self.onPagePixels[index] = null;

                    visitor._readVisitor();

                    var syncs = visitor._getField(field),
                      syncsData = [],
                      tempData;

                    if (syncs) {
                      tempData = syncs.split("*");
                      var i, l, tinfo;

                      for (i = 0, l = tempData.length; i < l; i++) {
                        tinfo = tempData[i];

                        if (!tinfo.match("^" + syncConfig["id"] + "-")) {
                          syncsData.push(tinfo);
                        }
                      }
                    }

                    self.setSyncTrackingData(
                      syncsData,
                      syncConfig,
                      syncField,
                      syncNow
                    );
                  };
                })(this.onPagePixels.length, config, field, now)
              );
              img.src = (protocolIsPrependable ? protocol : "") + url;
              this.onPagePixels.push(img);
            }
          }
        } else {
          this.addMessage(message);
          this.setSyncTrackingData(data, config, field, now);
        }
      },

      /*********************************************************************
       * Function addMessage(m): adds prefix to message, then queues for sending
       *     m = id sync message
       * Returns:
       *     Nothing
       *********************************************************************/
      addMessage: function addMessage(m) {
        var f = encodeURIComponent,
          identifier = visitor._enableErrorReporting
            ? f("---destpub-debug---")
            : f("---destpub---");
        this.messages.push(
          (constants.POST_MESSAGE_ENABLED ? "" : identifier) + m
        );
      },

      /*********************************************************************
       * Function setSyncTrackingData(data, config, field, now) - write id sync conntrol data to cookie field
       *     data - id sync cookie data
       *     config - id sync data
       *     field - cookie field
       *     now - snapshot of date in days since epoch
       * Returns:
       *     Nothing
       *********************************************************************/
      setSyncTrackingData: function setSyncTrackingData(
        data,
        config,
        field,
        now
      ) {
        data.push(
          config["id"] + "-" + (now + Math.ceil(config["ttl"] / 60 / 24))
        );
        this.manageSyncsSize(data);

        visitor._setField(field, data.join("*"));
      },

      /*********************************************************************
       * Function sendMessages(): sends messages to iframe
       * Returns:
       *     Nothing
       *********************************************************************/
      sendMessages: function sendMessages() {
        var self = this,
          prefix = "",
          f = encodeURIComponent,
          message;

        if (this.regionChanged) {
          prefix = f("---destpub-clear-dextp---");
          this.regionChanged = false;
        }

        if (this.messages.length) {
          if (constants.POST_MESSAGE_ENABLED) {
            message =
              prefix + f("---destpub-combined---") + this.messages.join("%01");
            this.postMessage(message);
            this.messages = [];
            this.sendingMessages = false;
          } else {
            message = this.messages.shift();
            this.postMessage(prefix + message);
            setTimeout(function() {
              self.sendMessages();
            }, this.messageSendingInterval);
          }
        } else {
          this.sendingMessages = false;
        }
      },
      postMessage: function postMessage(message) {
        crossDomain.postMessage(message, this.url, this.iframe.contentWindow);
        this.messagesPosted.push(message);
      },

      /*********************************************************************
       * Function receiveMessage(message): receives messages from iframe
       *     message = message from iframe
       * Returns:
       *     Nothing
       *********************************************************************/
      receiveMessage: function receiveMessage(message) {
        var prefix = /^---destpub-to-parent---/,
          split;

        if (typeof message === "string" && prefix.test(message)) {
          split = message.replace(prefix, "").split("|");

          if (split[0] === "canSetThirdPartyCookies") {
            this.canSetThirdPartyCookies = split[1] === "true" ? true : false;
            this.receivedThirdPartyCookiesNotification = true;
            this.requestToProcess();
          }

          this.messagesReceived.push(message);
        }
      },

      /*********************************************************************
       * Function processIDCallData(json): processes id sync data from /id call response
       *     json = id sync data from /id call response
       * Returns:
       *     Nothing
       *********************************************************************/
      processIDCallData: function processIDCallData(json) {
        if (
          this.url == null ||
          (json["subdomain"] && this.subdomain === "nosubdomainreturned")
        ) {
          // eslint-disable-line eqeqeq
          if (
            typeof visitor._subdomain === "string" &&
            visitor._subdomain.length
          ) {
            this.subdomain = visitor._subdomain;
          } else {
            this.subdomain = json["subdomain"] || "";
          }

          this.url = this.getUrl();
        }

        if (json["ibs"] instanceof Array && json["ibs"].length) {
          this.doAttachIframe = true;
        }

        if (this.readyToAttachIframe()) {
          if (!visitor.idSyncAttachIframeOnWindowLoad) {
            this.attachIframeASAP();
          } else if (
            thisClass.windowLoaded ||
            d.readyState === "complete" ||
            d.readyState === "loaded"
          ) {
            this.attachIframe();
          }
        }

        if (typeof visitor.idSyncIDCallResult === "function") {
          visitor.idSyncIDCallResult(json);
        } else {
          this.requestToProcess(json);
        }

        if (typeof visitor.idSyncAfterIDCallResult === "function") {
          visitor.idSyncAfterIDCallResult(json);
        }
      },

      /*********************************************************************
       * Function canMakeSyncIDCall(idTS, nowTS): checks if /id call specific to id syncs should be made
       *     idTS = timestamp of wait expiration
       *     nowTS = current date in days since epoch
       * Returns:
       *     boolean
       *********************************************************************/
      canMakeSyncIDCall: function canMakeSyncIDCall(idTS, nowTS) {
        return (
          visitor._forceSyncIDCall ||
          !idTS ||
          nowTS - idTS > constants.DAYS_BETWEEN_SYNC_ID_CALLS
        );
      },

      /*********************************************************************
       * Function attachIframeASAP(): attach iframe as soon as d.body is reached
       * Returns:
       *     Nothing
       *********************************************************************/
      attachIframeASAP: function attachIframeASAP() {
        var self = this;

        function tryToAttachIframe() {
          if (!self.startedAttachingIframe) {
            if (d.body) {
              self.attachIframe();
            } else {
              setTimeout(tryToAttachIframe, 30);
            }
          }
        }

        tryToAttachIframe();
      }
    };
  };

  // TODO: Consider adding a config validator to make sure a config is in this list before using it.
  var configs = {
    audienceManagerServer: {},
    audienceManagerServerSecure: {},
    cookieDomain: {},
    cookieLifetime: {},
    cookieName: {},
    doesOptInApply: {},
    disableThirdPartyCalls: {},
    discardTrackingServerECID: {},
    idSyncAfterIDCallResult: {},
    idSyncAttachIframeOnWindowLoad: {},
    idSyncContainerID: {},
    idSyncDisable3rdPartySyncing: {},
    disableThirdPartyCookies: {},
    idSyncDisableSyncs: {},
    disableIdSyncs: {},
    idSyncIDCallResult: {},
    idSyncSSLUseAkamai: {},
    isCoopSafe: {},
    isIabContext: {},
    isOptInStorageEnabled: {},
    loadSSL: {},
    loadTimeout: {},
    marketingCloudServer: {},
    marketingCloudServerSecure: {},
    optInCookieDomain: {},
    optInStorageExpiry: {},
    overwriteCrossDomainMCIDAndAID: {},
    preOptInApprovals: {},
    previousPermissions: {},
    resetBeforeVersion: {},
    sdidParamExpiry: {},
    serverState: {},
    sessionCookieName: {},
    secureCookie: {},
    takeTimeoutMetrics: {},
    trackingServer: {},
    trackingServerSecure: {},
    whitelistIframeDomains: {},
    whitelistParentDomain: {}
  };
  var visitorConfig = {
    getConfigNames: function getConfigNames() {
      return Object.keys(configs);
    },
    getConfigs: function getConfigs() {
      return configs;
    },
    normalizeConfig: function normalizeConfig(config) {
      return typeof config !== "function" ? config : config();
    }
  };

  var makeEmitter = function makeEmitter(target) {
    var events = {};

    target.on = function(eventName, callback, context) {
      if (!callback || typeof callback !== "function") {
        throw new Error("[ON] Callback should be a function.");
      }

      if (!events.hasOwnProperty(eventName)) {
        events[eventName] = [];
      }

      var subscriptionIndex =
        events[eventName].push({
          callback: callback,
          context: context
        }) - 1;
      return function() {
        events[eventName].splice(subscriptionIndex, 1);

        if (!events[eventName].length) {
          delete events[eventName];
        }
      };
    };

    target.off = function(eventName, callback) {
      if (events.hasOwnProperty(eventName)) {
        events[eventName] = events[eventName].filter(function(eventMetadata) {
          if (eventMetadata.callback !== callback) {
            return eventMetadata;
          }
        });
      }
    };

    target.publish = function(eventName) {
      if (!events.hasOwnProperty(eventName)) {
        return;
      }

      var data = [].slice.call(arguments, 1); // Note: We clone the callbacks array because a callback might unsubscribe,
      // which will change the length of the array and break this for loop.

      events[eventName].slice(0).forEach(function(eventMetadata) {
        eventMetadata.callback.apply(eventMetadata.context, data);
      });
    };

    return target.publish;
  };

  var _VENDOR_IDS, _CATEGORY_PURPOSES;

  // TODO Move this helper to utils and inject CATEGORIES_VALUES into areValidCategories
  // on demand. We currently have a circular dependency if we import utils here.
  var getValues = function getValues(obj) {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
  };

  var STATUS = {
    PENDING: "pending",
    CHANGED: "changed",
    COMPLETE: "complete"
  }; // TODO Convert the values to objects to be able to be more
  // granular when choosing categories.
  // e.g: ANALYTICS: { name: "analytics", useEcid: false }

  var CATEGORIES = {
    AAM: "aam",
    ADCLOUD: "adcloud",
    ANALYTICS: "aa",
    CAMPAIGN: "campaign",
    ECID: "ecid",
    LIVEFYRE: "livefyre",
    TARGET: "target",
    MEDIA_ANALYTICS: "mediaaa"
  };
  var VENDOR_IDS =
    ((_VENDOR_IDS = {}),
    _defineProperty(_VENDOR_IDS, CATEGORIES.AAM, 565),
    _defineProperty(_VENDOR_IDS, CATEGORIES.ECID, 565),
    _VENDOR_IDS);
  var CATEGORY_PURPOSES =
    ((_CATEGORY_PURPOSES = {}),
    _defineProperty(_CATEGORY_PURPOSES, CATEGORIES.AAM, [1, 10]),
    _defineProperty(_CATEGORY_PURPOSES, CATEGORIES.ECID, [1, 10]),
    _CATEGORY_PURPOSES);
  var MAGIC_CATEGORIES = ["videoaa", "iabConsentHash"];
  var CATEGORIES_VALUES = getValues(CATEGORIES);

  function isObjectEmpty(obj) {
    return obj === Object(obj) && Object.keys(obj).length === 0;
  }

  function isCallbackValid(callback) {
    return (
      typeof callback === "function" ||
      (callback instanceof Array && callback.length)
    );
  }

  var callbackRegistryFactory$1 = function callbackRegistryFactory() {
    var registry = {};
    registry.callbacks = Object.create(null);

    registry.add = function(key, callback) {
      if (!isCallbackValid(callback)) {
        throw new Error(
          "[callbackRegistryFactory] Make sure callback is a function or an array of functions."
        );
      }

      registry.callbacks[key] = registry.callbacks[key] || [];
      var index = registry.callbacks[key].push(callback) - 1;
      return function() {
        registry.callbacks[key].splice(index, 1);
      };
    };

    registry.execute = function(key, args) {
      if (registry.callbacks[key]) {
        args = typeof args === "undefined" ? [] : args;
        args = args instanceof Array ? args : [args];

        try {
          while (registry.callbacks[key].length) {
            var callback = registry.callbacks[key].shift();

            if (typeof callback === "function") {
              callback.apply(null, args);
            } else if (callback instanceof Array) {
              callback[1].apply(callback[0], args);
            } // TODO: Throw an error if the callback is neither, or don't add it in the first place.
          }

          delete registry.callbacks[key];
        } catch (ex) {
          // Fail gracefully and silently.
        }
      }
    };

    registry.executeAll = function(paramsMap, forceExecute) {
      if (!forceExecute && (!paramsMap || isObjectEmpty(paramsMap))) {
        return;
      }

      Object.keys(registry.callbacks).forEach(function(key) {
        var value = paramsMap[key] !== undefined ? paramsMap[key] : "";
        registry.execute(key, value);
      }, registry);
    };

    registry.hasCallbacks = function() {
      return Boolean(Object.keys(registry.callbacks).length);
    };

    return registry;
  };

  var noop = function noop() {};

  var isConsoleAvailable = function isConsoleAvailable(action) {
    var _window = window,
      console = _window.console;
    return !!console && typeof console[action] === "function";
  };

  var makeAction = function makeAction(action, prefix, predicate) {
    return predicate()
      ? function() {
          if (isConsoleAvailable(action)) {
            for (
              var _len = arguments.length, args = new Array(_len), _key = 0;
              _key < _len;
              _key++
            ) {
              args[_key] = arguments[_key];
            }

            console[action].apply(console, [prefix].concat(args)); // eslint-disable-line
          }
        }
      : noop;
  };

  function Logger() {
    var prefix =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var predicate =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : function() {
            return true;
          };
    this.log = makeAction("log", prefix, predicate);
    this.warn = makeAction("warn", prefix, predicate);
    this.error = makeAction("error", prefix, predicate);
  }

  var logger = Logger;

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
  var crc32 = (function() {
    var table = [];

    for (var i = 0; i < 256; i++) {
      var c = i;

      for (var j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }

      table.push(c);
    }

    return function(str, crc) {
      str = unescape(encodeURIComponent(str));
      if (!crc) crc = 0;
      crc = crc ^ -1;

      for (var _i = 0; _i < str.length; _i++) {
        var y = (crc ^ str.charCodeAt(_i)) & 0xff;
        crc = (crc >>> 8) ^ table[y];
      }

      crc = crc ^ -1;
      return crc >>> 0;
    };
  })();

  var logger$1 = new logger("[ADOBE OPT-IN]");

  var is = function is(el, type) {
    return _typeof(el) === type;
  };

  var toArray = function toArray(arg, fallback) {
    if (arg instanceof Array) {
      return arg;
    } else if (is(arg, "string")) {
      return [arg];
    }

    return fallback || [];
  };

  var areAllValuesTrue = function areAllValuesTrue(obj) {
    var keys = Object.keys(obj);
    return !keys.length
      ? false
      : keys.every(function(key) {
          return obj[key] === true;
        });
  };

  var areValidCategories = function areValidCategories(catKeys) {
    var allowExceptions =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    // `every` will return `true` if empty array, so we guard against here
    if (!catKeys || isEmptyArray(catKeys)) {
      return false;
    } //**Hacky McHackFace for backwards compatability and to allow storing the consent hash in the cookie.**
    //The "magic categories" are okay if exceptions are allowed, even though they aren't real categories

    return toArray(catKeys).every(function(cat) {
      return (
        CATEGORIES_VALUES.indexOf(cat) > -1 ||
        (allowExceptions && MAGIC_CATEGORIES.indexOf(cat) > -1)
      );
    });
  };

  var toObject = function toObject(list, value) {
    return list.reduce(function(result, item) {
      result[item] = value;
      return result;
    }, {});
  };

  var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  var isEmptyArray = function isEmptyArray(arg) {
    return (
      Object.prototype.toString.call(arg) === "[object Array]" && !arg.length
    );
  };

  var parse = function parse(jsonString) {
    if (isObject(jsonString)) {
      return jsonString;
    }

    try {
      return JSON.parse(jsonString);
    } catch (ex) {
      return {};
    }
  };

  var areValidPermissions = function areValidPermissions(str) {
    if (str === undefined) {
      // `existingPermissions` is an optional arg!
      return true;
    }

    return isObject(str)
      ? areValidCategories(Object.keys(str), true)
      : isStringifiedJsonCategories(str);
  };

  var isStringifiedJsonCategories = function isStringifiedJsonCategories(str) {
    try {
      var parsedStr = JSON.parse(str);
      return (
        !!str &&
        is(str, "string") &&
        areValidCategories(Object.keys(parsedStr), true)
      );
    } catch (ex) {
      return false;
    }
  };

  var isObject = function isObject(arg) {
    return arg !== null && is(arg, "object") && Array.isArray(arg) === false;
  };

  var noop$1 = function noop() {};

  var normalize = function normalize(param) {
    return is(param, "function") ? param() : param;
  };

  var handleInvalidPermissions = function handleInvalidPermissions(
    permissions,
    errorMsg
  ) {
    if (!areValidPermissions(permissions)) {
      logger$1.error("".concat(errorMsg));
    }
  };

  var getValues$1 = function getValues(obj) {
    return Object.keys(obj).map(function(key) {
      return obj[key];
    });
  };

  var getUniqueValues = function getUniqueValues(obj) {
    return getValues$1(obj).filter(function(v, i, arr) {
      return arr.indexOf(v) === i;
    });
  };

  function makeStorage() {
    var _ref =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      cookieName = _ref.cookieName;

    var _ref2 =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      cookies = _ref2.cookies;

    if (!cookieName || !cookies) {
      return {
        get: noop$1,
        set: noop$1,
        remove: noop$1
      };
    }

    var storage = {
      remove: function remove() {
        cookies.remove(cookieName);
      },
      get: function get() {
        var cookieValue = cookies.get(cookieName);
        var approvalsObj = {};

        try {
          // TODO Validate cookie content.
          approvalsObj = JSON.parse(cookieValue);
        } catch (ex) {
          // Fail gracefully and silently.
          approvalsObj = {};
        }

        return approvalsObj;
      },
      set: function set(value, config) {
        // Serialize approvals.
        config = config || {};
        var cookieContent = storage.get();
        var newCookieContent = Object.assign(cookieContent, value);
        cookies.set(cookieName, JSON.stringify(newCookieContent), {
          domain: config.optInCookieDomain || "",
          cookieLifetime: config.optInStorageExpiry || 34190000,
          // Default is 13 months in seconds
          expires: true
        });
      }
    };
    return storage;
  }

  // command: "pluginName.apiName"
  // We abstract the access to the plugins in case of API or design changes,
  // clients don't have to change their implementations, or update their Launch extensions.

  var makeCommand = function makeCommand(plugins) {
    return function() {
      var _ref =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : {},
        command = _ref.command,
        _ref$params = _ref.params,
        params = _ref$params === void 0 ? {} : _ref$params,
        _ref$callback = _ref.callback,
        callback = _ref$callback === void 0 ? noop$1 : _ref$callback;

      if (!command || command.indexOf(".") === -1) {
        throw new Error("[OptIn.execute] Please provide a valid command.");
      }

      try {
        var parts = command.split(".");
        var plugin = plugins[parts[0]];
        var apiName = parts[1];

        if (!plugin || typeof plugin[apiName] !== "function") {
          throw new Error("Make sure the plugin and API name exist.");
        }

        var args = Object.assign(params, {
          callback: callback
        });
        plugin[apiName].call(plugin, args);
      } catch (ex) {
        logger$1.error("[execute] Something went wrong: " + ex.message);
      }
    };
  };

  function TimeoutError(message) {
    this.name = this.constructor.name;
    this.message = message; // This will print TimeoutError in the stack, and not Error.

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }

  TimeoutError.prototype = Object.create(Error.prototype);
  TimeoutError.prototype.constructor = TimeoutError;

  var REGISTRY_KEY = "fetchPermissions";
  var REGISTER_ERROR = "[OptIn#registerPlugin] Plugin is invalid.";

  function OptIn() {
    var _ref =
        arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      doesOptInApply = _ref.doesOptInApply,
      previousPermissions = _ref.previousPermissions,
      preOptInApprovals = _ref.preOptInApprovals,
      isOptInStorageEnabled = _ref.isOptInStorageEnabled,
      optInCookieDomain = _ref.optInCookieDomain,
      optInStorageExpiry = _ref.optInStorageExpiry,
      isIabContext = _ref.isIabContext;

    var _ref2 =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      cookies = _ref2.cookies;

    var previousPermissionsValue = normalize(previousPermissions); // TODO Rethink this whole validation then parsing. Maybe they should be one step.

    handleInvalidPermissions(
      previousPermissionsValue,
      "Invalid `previousPermissions`!"
    );
    handleInvalidPermissions(preOptInApprovals, "Invalid `preOptInApprovals`!");
    var storage = makeStorage(
      {
        cookieName: "adobeujs-optin"
      },
      {
        cookies: cookies
      }
    );
    var self = this;
    var publish = makeEmitter(self);
    var registry = callbackRegistryFactory$1();
    var previousPermissionsObj = parse(previousPermissionsValue);
    var preOptInApprovalsObj = parse(preOptInApprovals);
    var cookieApprovalsObj = isOptInStorageEnabled ? storage.get() : {};
    var plugins = {};
    var status = initializeStatus(previousPermissionsObj, cookieApprovalsObj); // Format: { [category value]: boolean }

    var permissions = initializePermissions(
      preOptInApprovalsObj,
      previousPermissionsObj,
      cookieApprovalsObj
    ); // preCompletePermissions: Used as intermediary permissions between pending and complete statuses.

    var preCompletePermissions = clone(permissions);

    var setStatus = function setStatus(newStatus) {
      return (status = newStatus);
    };

    var setPermissions = function setPermissions(newPermissions) {
      return (permissions = newPermissions);
    };

    self.deny = updatePermissions(false);
    self.approve = updatePermissions(true);
    self.denyAll = self.deny.bind(self, CATEGORIES_VALUES);
    self.approveAll = self.approve.bind(self, CATEGORIES_VALUES);

    self.isApproved = function(categories) {
      return checkForApproval(categories, self.permissions);
    };

    self.isPreApproved = function(categories) {
      return checkForApproval(categories, preOptInApprovalsObj);
    }; // Returns a function:
    // - 'shouldAutoSubscribe' = false: noop
    // - 'shouldAutoSubscribe' = true: optIn.off (To unsubscribe)

    self.fetchPermissions = function(callback) {
      var shouldAutoSubscribe =
        arguments.length > 1 && arguments[1] !== undefined
          ? arguments[1]
          : false;
      var result = shouldAutoSubscribe
        ? self.on(STATUS.COMPLETE, callback)
        : noop$1;
      var hasPermissions =
        !doesOptInApply ||
        (doesOptInApply && self.isComplete) ||
        !!preOptInApprovals; // Call the callback if `preOptInApprovals`, even if status `pending`.

      if (hasPermissions) {
        callback(self.permissions);
      } else if (!shouldAutoSubscribe) {
        registry.add(REGISTRY_KEY, function() {
          return callback(self.permissions);
        });
      }

      return result;
    };

    self.complete = function() {
      if (self.status === STATUS.CHANGED) {
        completeAndPublish();
      }
    };

    self.registerPlugin = function(plugin) {
      if (!plugin || !plugin.name || typeof plugin.onRegister !== "function") {
        throw new Error(REGISTER_ERROR);
      }

      if (plugins[plugin.name]) {
        return;
      }

      plugins[plugin.name] = plugin;
      plugin.onRegister.call(plugin, self);
    };

    self.execute = makeCommand(plugins);

    self.memoizeContent = function(content) {
      if (isObject(content)) {
        storage.set(content, {
          optInCookieDomain: optInCookieDomain,
          optInStorageExpiry: optInStorageExpiry
        });
      }
    };

    self.getMemoizedContent = function(key) {
      var cookieContent = storage.get();

      if (cookieContent) {
        return cookieContent[key];
      }
    };

    Object.defineProperties(self, {
      permissions: {
        get: function get() {
          return permissions;
        }
      },
      status: {
        get: function get() {
          return status;
        }
      },
      Categories: {
        get: function get() {
          return CATEGORIES;
        }
      },
      doesOptInApply: {
        get: function get() {
          return !!doesOptInApply;
        }
      },
      isPending: {
        get: function get() {
          return self.status === STATUS.PENDING;
        }
      },
      isComplete: {
        get: function get() {
          return self.status === STATUS.COMPLETE;
        }
      },
      __plugins: {
        get: function get() {
          return Object.keys(plugins);
        }
      },
      isIabContext: {
        get: function get() {
          return isIabContext;
        }
      }
    });

    function checkForApproval(categories, permissionsSource) {
      var categoryList = toArray(categories);
      return !categoryList.length
        ? areAllValuesTrue(permissionsSource)
        : categoryList.every(function(category) {
            return !!permissionsSource[category];
          });
    }

    function initializeStatus(previousPermissionsObj, cookieApprovalsObj) {
      return areValidPermissions(previousPermissionsObj) ||
        (!!cookieApprovalsObj && areValidPermissions(cookieApprovalsObj))
        ? STATUS.COMPLETE
        : STATUS.PENDING;
    } // NOTE: previousPermissions will overrwrite pre-opt in an default permissions.

    function initializePermissions(
      preOptInApprovalsObj,
      previousPermissionsObj,
      cookieApprovalsObj
    ) {
      // If `doesOptInApply` is true, default all permissions to false; otherwise default to true.
      var defaultPermissions = toObject(CATEGORIES_VALUES, !doesOptInApply); // If `doesOptInApply` is false, always return default permissions. Otherwise assign in priority order

      return !doesOptInApply
        ? defaultPermissions
        : Object.assign(
            {},
            defaultPermissions,
            preOptInApprovalsObj,
            previousPermissionsObj,
            cookieApprovalsObj
          );
    }

    function completeAndPublish() {
      setPermissions(preCompletePermissions);
      setStatus(STATUS.COMPLETE);
      publish(self.status, self.permissions); // TODO Consider publishing a `change` event always.

      if (isOptInStorageEnabled) {
        storage.set(self.permissions, {
          optInCookieDomain: optInCookieDomain,
          optInStorageExpiry: optInStorageExpiry
        });
      }

      registry.execute(REGISTRY_KEY);
    }

    function updatePermissions(isApproved) {
      return function(categories, shouldWaitForComplete) {
        if (!areValidCategories(categories)) {
          throw new Error(
            "[OptIn] Invalid category(-ies). Please use the `OptIn.Categories` enum."
          );
        }

        setStatus(STATUS.CHANGED);
        Object.assign(
          preCompletePermissions,
          toObject(toArray(categories), isApproved)
        );

        if (!shouldWaitForComplete) {
          // Complete flow.
          completeAndPublish();
        }

        return self;
      };
    }
  } // TODO: Document this enum!

  OptIn.Categories = CATEGORIES;
  OptIn.TimeoutError = TimeoutError;

  function makeTimedCallback(originalCallback, timeout) {
    if (typeof timeout === "undefined") {
      return originalCallback;
    }

    var timer = setTimeout(onTimeout, timeout);

    function onTimeout() {
      timer = null;
      originalCallback.call(
        originalCallback,
        new TimeoutError("The call took longer than you wanted!")
      );
    }

    function callbackWithTimer() {
      if (timer) {
        clearTimeout(timer);
        originalCallback.apply(originalCallback, arguments);
      }
    }

    return callbackWithTimer;
  }

  function getTcfApi() {
    //if __cmp exists, return it and we are done
    if (window.__tcfapi) return window.__tcfapi;
    var ERROR_MSG = "__tcfapi not found"; //if __cmp doesn't exist, perhaps we are in an iFrame
    //the __cmp should create an iFrame called __cmpLocator so
    //check each parent up to the top level to find that iFrame

    var f = window; //if we aren't in an iframe we don't want to make a stub

    if (f === window.top) {
      logger$1.error(ERROR_MSG);
      return;
    }

    var cmpFrame;

    while (!cmpFrame) {
      f = f.parent;

      try {
        if (f.frames["__tcfapiLocator"]) cmpFrame = f;
      } catch (e) {
        //empty
      }

      if (f === window.top) break;
    } //if we can't find the cmpLocator frame, don't make the stub

    if (!cmpFrame) {
      logger$1.error(ERROR_MSG);
      return;
    } //If the cmp locator is found in a parent frame, we make
    //a __cmp stub that posts messages to the frame containing
    //the real cmp and listens for responses

    var cmpCallbacks = {};

    window.__tcfapi = function(cmd, version, callback, arg) {
      var callId = Math.random() + "";
      var msg = {
        __tcfapiCall: {
          command: cmd,
          parameter: arg,
          version: version,
          callId: callId
        }
      };
      cmpCallbacks[callId] = callback;
      cmpFrame.postMessage(msg, "*");
    };

    window.addEventListener(
      "message",
      function(event) {
        var json = event.data;

        if (typeof json === "string") {
          try {
            json = JSON.parse(event.data);
          } catch (e) {
            //empty
          }
        }

        if (json.__tcfapiReturn) {
          var i = json.__tcfapiReturn;

          if (typeof cmpCallbacks[i.callId] === "function") {
            cmpCallbacks[i.callId](i.returnValue, i.success);
            delete cmpCallbacks[i.callId];
          }
        }
      },
      false
    );
    return window.__tcfapi;
  }

  function isCategoryApproved(tcData, vendorId) {
    var purposes =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var isVendorApproved = tcData["vendor"]["consents"][vendorId] === true;
    var arePurposesApproved = purposes.every(function(purpose) {
      return tcData["purpose"]["consents"][purpose] === true;
    });
    return isVendorApproved && arePurposesApproved;
  }

  function IAB() {
    var self = this;
    self.name = "iabPlugin";
    self.version = "0.0.2";
    var localOptIn;
    var FETCH_CONSENT_KEY = "FETCH_CONSENT_DATA";
    var TCF_VERSION = 2;
    var registry = callbackRegistryFactory$1();
    var state = {
      transparencyAndConsentData: null //TCData array returned from call to __tcfapi
    };

    var setState = function setState(key) {
      var value =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return (state[key] = value);
    };

    self.fetchConsentData = function(_ref) {
      var callback = _ref.callback,
        timeout = _ref.timeout;
      var callbackWithTimer = makeTimedCallback(callback, timeout);
      fetchConsentData({
        callback: callbackWithTimer
      });
    };

    self.isApproved = function(_ref2) {
      var callback = _ref2.callback,
        category = _ref2.category,
        timeout = _ref2.timeout;

      if (state.transparencyAndConsentData) {
        return callback(
          null,
          isCategoryApproved(
            state.transparencyAndConsentData,
            VENDOR_IDS[category],
            CATEGORY_PURPOSES[category]
          )
        );
      }

      var callbackWithTimer = makeTimedCallback(function(error, tcData) {
        callback(
          error,
          isCategoryApproved(
            tcData,
            VENDOR_IDS[category],
            CATEGORY_PURPOSES[category]
          )
        );
      }, timeout);
      fetchConsentData({
        category: category,
        callback: callbackWithTimer
      });
    };

    self.onRegister = function(optIn) {
      localOptIn = optIn; // On register, retrieve IAB vendor consents for all current vendors with IDs.
      // If consent was found, set that approval status for those vendors in OptIn.

      var allCategories = Object.keys(VENDOR_IDS);

      var callback = function callback(error, tcData) {
        if (!error && tcData) {
          allCategories.forEach(function(category) {
            var isVendorApproved = isCategoryApproved(
              tcData,
              VENDOR_IDS[category],
              CATEGORY_PURPOSES[category]
            );
            var action = isVendorApproved ? "approve" : "deny";
            optIn[action](category, true);
          });
          optIn.complete(); //TODO Register a listener with the tcfapi to response to future consent changes.
        }
      };

      self.fetchConsentData({
        callback: callback
      });
    };

    var fetchConsentData = function fetchConsentData(_ref3) {
      var callback = _ref3.callback;

      if (state.transparencyAndConsentData) {
        return callback(null, state.transparencyAndConsentData);
      }

      registry.add(FETCH_CONSENT_KEY, callback);

      var tcDataCallback = function tcDataCallback(tcData, success) {
        if (success) {
          // Check if the new consent string matches the one we memoized.
          var clonedTcData = clone(tcData);
          var memoizedIabConsentHash = localOptIn.getMemoizedContent(
            "iabConsentHash"
          );
          var currentIabConsentHash = crc32(clonedTcData["tcString"]).toString(
            32
          ); // Adding the `consentString` property so we won't break the contracts with
          // existing libraries like DIL and AppMeasurement.
          // It basically clones the full object returns by the IAB framework 2.0, and adds
          // the original Consent String needed by the libraries: `consentString`.

          clonedTcData.consentString = tcData["tcString"];
          clonedTcData.hasConsentChangedSinceLastCmpPull =
            memoizedIabConsentHash !== currentIabConsentHash;
          setState("transparencyAndConsentData", clonedTcData); // Memoize the consent string for future changes checks.

          localOptIn.memoizeContent({
            iabConsentHash: currentIabConsentHash
          });
        }

        registry.execute(FETCH_CONSENT_KEY, [
          null,
          state.transparencyAndConsentData
        ]);
      };

      getTCData(tcDataCallback);
    };

    var getTCData = function getTCData(callback) {
      // NOTE: vendorID should be an array. For now, we are supporting one vendorId at a time.
      // FOR NOW, we are passing ALL the Adobe Vendor IDs.
      // TODO: Rethink filtering that by a category param.
      var vendorIds = getUniqueValues(VENDOR_IDS);
      var tcf = getTcfApi();
      typeof tcf === "function" &&
        tcf("getTCData", TCF_VERSION, callback, vendorIds);
    };
  }

  var optIn = /*#__PURE__*/ Object.freeze({
    OptIn: OptIn,
    IabPlugin: IAB
  });

  var makePublishDestinations = function makePublishDestinations(
    visitor,
    destinationPublishing
  ) {
    var MCMID = "MCMID"; // fieldMarketingCloudVisitorID

    visitor.publishDestinations = function(subdomain) {
      var messages = arguments[1],
        callback = arguments[2];

      try {
        // subdomain is an object in publishDestinations v2
        callback =
          typeof callback === "function" ? callback : subdomain.callback;
      } catch (e) {
        // Default to noop
        callback = function callback() {};
      }

      var dp = destinationPublishing;

      if (!dp.readyToAttachIframePreliminary()) {
        callback({
          error:
            "The destination publishing iframe is disabled in the Visitor library."
        });
        return;
      }

      if (typeof subdomain === "string") {
        // publishDestinations v1
        if (!subdomain.length) {
          callback({
            error: "subdomain is not a populated string."
          });
          return;
        }

        if (!(messages instanceof Array && messages.length)) {
          callback({
            error: "messages is not a populated array."
          });
          return;
        }

        var addedAtLeastOneMessage = false;
        messages.forEach(function(msg) {
          if (typeof msg === "string" && msg.length) {
            dp.addMessage(msg);
            addedAtLeastOneMessage = true;
          }
        });

        if (!addedAtLeastOneMessage) {
          callback({
            error: "None of the messages are populated strings."
          });
          return;
        }
      } else if (utils.isObject(subdomain)) {
        // publishDestinations v2
        var config = subdomain;
        subdomain = config.subdomain;

        if (!(typeof subdomain === "string" && subdomain.length)) {
          callback({
            error: "config.subdomain is not a populated string."
          });
          return;
        }

        var destinations = config.urlDestinations;

        if (!(destinations instanceof Array && destinations.length)) {
          callback({
            error: "config.urlDestinations is not a populated array."
          });
          return;
        }

        var onPageDestinations = [];
        destinations.forEach(function(destination) {
          if (utils.isObject(destination)) {
            if (destination.hideReferrer) {
              // Send to iframe
              if (destination.message) {
                dp.addMessage(destination.message);
              }
            } else {
              onPageDestinations.push(destination);
            }
          }
        });

        var processOnPageDestinations = function processOnPageDestinations() {
          if (onPageDestinations.length) {
            setTimeout(function() {
              var img = new Image(),
                destination = onPageDestinations.shift();
              img.src = destination.url;
              dp.onPageDestinationsFired.push(destination);
              processOnPageDestinations();
            }, 100);
          }
        };

        processOnPageDestinations();
      } else {
        callback({
          error: "Invalid parameters passed."
        });
        return;
      }

      if (dp.iframe) {
        callback({
          message:
            "The destination publishing iframe is already attached and loaded."
        });
        dp.requestToProcess();
      } else {
        if (!visitor.subdomain && visitor._getField(MCMID)) {
          // This means no dpm.demdex.net/id calls were made
          dp.subdomain = subdomain;
          dp.doAttachIframe = true;
          dp.url = dp.getUrl();

          if (dp.readyToAttachIframe()) {
            dp.iframeLoadedCallbacks.push(function(data) {
              callback({
                message:
                  "Attempted to attach and load the destination publishing iframe through this API call. Result: " +
                  (data.message || "no result")
              });
            });
            dp.attachIframe();
          } else {
            callback({
              error:
                "Encountered a problem in attempting to attach and load the destination publishing iframe through this API call."
            });
          }
        } else {
          dp.iframeLoadedCallbacks.push(function(data) {
            callback({
              message:
                "Attempted to attach and load the destination publishing iframe through normal Visitor API processing. Result: " +
                (data.message || "no result")
            });
          });
        }
      }
    };
  };

  /*
   * A small SHA-256 implementation for JavaScript by Geraint Luff
   *
   * this code can be found at: https://github.com/geraintluff/sha256
   *
   * the goal of this project was:
   * small size - the minified version is only 849 bytes
   * readability - the unminified code should be relatively easy to understand/review
   *
   * my goal was to keep this as terse as possible since my own purpose was to use this
   * as part of a distributed widget where filesize could be sensative.
   */
  var sha256 = function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var i, j; // Used as a counter across the whole file

    var result = "";
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8; //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)

    var hash = (sha256.h = sha256.h || []); // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes

    var k = (sha256.k = sha256.k || []);
    var primeCounter = k[lengthProperty];
    /*/
	  var hash = [], k = [];
	  var primeCounter = 0;
	  //*/

    var isComposite = {};

    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }

        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += "\x80"; // Append Ƈ' bit (plus zero padding)

    while ((ascii[lengthProperty] % 64) - 56) {
      ascii += "\x00";
    } // More zero padding

    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return; // ASCII check: only accept characters in range 0-255

      words[i >> 2] |= j << (((3 - i) % 4) * 8);
    }

    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength; // process each chunk

    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration

      var oldHash = hash; // This is now the undefinedworking hash", often labelled as variables a...g
      // (we have to truncate as well, otherwise extra entries at the end accumulate

      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        // var i2 = i + j;
        // Expand the message into 64 words
        // Used below if
        var w15 = w[i - 15],
          w2 = w[i - 2]; // Iterate

        var a = hash[0],
          e = hash[4];
        var temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
          ((e & hash[5]) ^ (~e & hash[6])) + // ch
          k[i] + // Expand the message schedule if needed
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
                0); // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble

        var temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

        hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()

        hash[4] = (hash[4] + temp1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? 0 : "") + b.toString(16);
      }
    }

    return result;
  };

  /*********************************************************************
   * Function hashUtil(data, hashType):
   *     data     = value to be hashed, only supports ASCII
   *     hashType = Support different hashing algorithms, so far only supports SHA256
   * Returns:
   *     Hashed data if input data is ASCII
   *     undefined if input is not ASCII
   *********************************************************************/

  var hashUtil = function hashUtil(data, hashType) {
    if (
      hashType === "SHA-256" ||
      hashType === "SHA256" ||
      hashType === "sha256" ||
      hashType === "sha-256"
    ) {
      data = sha256(data);
    }

    return data;
  };

  /*********************************************************************
   * Function trimAndLowercase(data): normalize string data by trim of whitespaces at begin and end, and convert to lower case
   *     data = data to be normalized
   * Returns:
   *     normalized data
   *********************************************************************/
  var trimAndLowercase = function trimAndLowercase(data) {
    return String(data)
      .trim()
      .toLowerCase();
  };

  /*global VISITOR_DEBUG*/

  var OptIn$1 = optIn.OptIn;
  /*********************************************************************
   * Class Visitor(marketingCloudOrgID,initConfig): Shared functionality across products
   *     marketingCloudOrgID = Marketing Cloud Organization ID to use
   *     initConfig          = Optional initial config object allowing the constructor to fire
   *                           off requests immediately instead of lazily
   *
   * @constructor
   * @noalias
   *********************************************************************/

  utils.defineGlobalNamespace();
  window.adobe.OptInCategories = OptIn$1.Categories;

  var Visitor = function Visitor(
    marketingCloudOrgID,
    initConfig,
    instantiationKey
  ) {
    if (
      !instantiationKey ||
      instantiationKey
        .split("")
        .reverse()
        .join("") !== marketingCloudOrgID
    ) {
      throw new Error(
        "Please use `Visitor.getInstance` to instantiate Visitor."
      );
    }

    var visitor = this;
    var adobe = window.adobe;
    var CONSENT_STRING = "";
    var CONSENT_FLAG = 0;
    var IAB_ACTION_COMPLETE = false;
    var validMCMIDUrl = false;
    visitor.version = "5.0.0";
    var w = commonjsGlobal;
    var thisClass = w.Visitor;
    thisClass.version = visitor.version;
    thisClass.AuthState = enums.AUTH_STATE;
    thisClass.OptOut = enums.OPT_OUT;

    if (!w.s_c_in) {
      w.s_c_il = [];
      w.s_c_in = 0;
    }

    visitor._c = "Visitor";
    visitor._il = w.s_c_il;
    visitor._in = w.s_c_in;
    visitor._il[visitor._in] = visitor;
    w.s_c_in++;
    visitor._instanceType = "regular";
    visitor._log = {
      requests: []
    }; // Set Defaults to public properties.
    // TODO Extract this stuff into a meaningful function.

    visitor.marketingCloudOrgID = marketingCloudOrgID;
    visitor.cookieName = "AMCV_" + marketingCloudOrgID;
    visitor.sessionCookieName = "AMCVS_" + marketingCloudOrgID;
    visitor.cookieDomain = getDomain();
    visitor.loadSSL = true;
    visitor.loadTimeout = 30000;
    visitor.CORSErrors = [];
    visitor.marketingCloudServer = visitor.audienceManagerServer =
      "dpm.demdex.net";
    visitor.sdidParamExpiry = 30; // seconds
    // END Defaults.

    /* LOCAL VARIABLES: */

    var isCoopSafe = null; // TODO Replace those variables with real enums.
    // Marketing Cloud

    var MC = "MC"; // fieldGroupMarketingCloud

    var MCMID = "MCMID"; // fieldMarketingCloudVisitorID

    var MCORGID = "MCORGID"; // fieldMarketingCloudOrgID

    var MCCIDH = "MCCIDH"; // fieldMarketingCloudCustomerIDHash

    var MCSYNCSOP = "MCSYNCSOP"; // fieldMarketingCloudSyncsOnPage

    var MCIDTS = "MCIDTS"; // fieldMarketingCloudIDCallTimeStamp

    var MCOPTOUT = "MCOPTOUT"; // fieldMarketingCloudOptOut
    // Analytics

    var A = "A"; // fieldGroupAnalytics

    var MCAID = "MCAID"; // fieldAnalyticsVisitorID
    // Audience Manager

    var AAM = "AAM"; // fieldGroupAudienceManager

    var MCAAMLH = "MCAAMLH"; // fieldAudienceManagerLocationHint

    var MCAAMB = "MCAAMB"; // fieldAudienceManagerBlob

    var NONE = "NONE"; // fieldValueNONE

    /*********************************************************************
     * Function _isNOP(m): Test to see if a member is NOT part of the Object.prototype
     *     m = Member
     * Returns:
     *     True if m is NOT part of Object.prototype otherwise False
     *********************************************************************/

    var _isNOP = function _isNOP(m) {
      return !Object.prototype[m];
    }; // CORS request object.

    var requestProcs = makeCorsRequest(visitor, _timeoutMetrics);
    /* PUBLIC PROPERTIES/METHODS: */
    // Enum exposed to be used with `getVisitorValues`. Add more as we start supporting more APIs.

    visitor.FIELDS = enums.FIELDS;
    /*********************************************************************
     * Function cookieRead(k): Read, URL-decode, and return value of k in cookies
     *     k = key to read value for out of cookies
     * Returns:
     *     Value of k in cookies if found, blank if not
     *********************************************************************/

    visitor.cookieRead = function(k) {
      return cookies.get(k);
    };
    /*********************************************************************
     * Function cookieWrite(k,v,e): Write value v as key k in cookies with
     *                              optional expiration e and domain automaticly
     *                              generated by getCookieDomain()
     *     k = key to write value for in cookies
     *     v = value to write to cookies
     *     e = optional expiration Date object or 1 to use default expiration
     * Returns:
     *     True if value was successfuly written and false if it was not
     *********************************************************************/

    visitor.cookieWrite = function(k, v, e) {
      var lifetime = visitor.cookieLifetime
        ? ("" + visitor.cookieLifetime).toUpperCase()
        : "";
      var secure = false;

      if (
        visitor.configs &&
        visitor.configs.secureCookie &&
        location.protocol === "https:"
      ) {
        secure = true;
      }

      return cookies.set(k, "" + v, {
        expires: e,
        domain: visitor.cookieDomain,
        cookieLifetime: lifetime,
        secure: secure
      });
    };
    /*********************************************************************
     * Function resetState(serverState):
     *     Merge server state with local instance POST instantiation, or reset the SDID info if no state provided.
     *     Use case(s):
     *        - Reset with no state: This is useful when customers want to reset the SDIDs state because of A4T in SPA situation.
     *        - Reset w State: Useful when customer implements Target server side, and make an AJAX call to update a portion of the page
     *          and receives a new SDID from the server side Vistior.
     *
     *     serverState  = Server state organized by Org ID
     *           type: Stringified JSON or JSON object
     *
     * Returns: Nothing
     *********************************************************************/

    visitor.resetState = function(serverState) {
      if (serverState) {
        // Reset SDID and set new customer IDs if exists.
        visitor._mergeServerState(serverState);
      } else {
        mergeSupplementalDataID(); // Calling mergeSupplementalDataID with no state will reset SDID information.
      }
    };
    /*********************************************************************
     * Function isAllowed(): Test to see if the visitor class functionality
     *                       is allowed which currently means the ability
     *                       to set a cookie
     * Returns:
     *     true if allowed or false if not
     *********************************************************************/

    visitor._isAllowedDone = false;
    visitor._isAllowedFlag = false;

    visitor.isAllowed = function() {
      if (!visitor._isAllowedDone) {
        visitor._isAllowedDone = true;

        if (
          visitor.cookieRead(visitor.cookieName) ||
          visitor.cookieWrite(visitor.cookieName, "T", 1)
        ) {
          visitor._isAllowedFlag = true;
        }
      }

      if (visitor.cookieRead(visitor.cookieName) === "T") {
        visitor._helpers.removeCookie(visitor.cookieName);
      }

      return visitor._isAllowedFlag;
    };
    /*********************************************************************
     * Function setMarketingCloudVisitorID(marketingCloudVisitorID): Set the Marketing Cloud Visitor ID
     *     marketingCloudVisitorID = Marketing Cloud Visitor ID
     * Returns:
     *     Nothing
     * Notes:
     *     See _setMarketingCloudFields
     *********************************************************************/

    visitor.setMarketingCloudVisitorID = function(marketingCloudVisitorID) {
      visitor._setMarketingCloudFields(marketingCloudVisitorID);
    };
    /*********************************************************************
     * Function getMarketingCloudVisitorID(callback,forceCallCallback): Get the Marketing Cloud Visitor ID
     *     callback          = Optional callback to register if visitor ID isn't
     *                         ready yet
     *     forceCallCallback = Option flag to force calling callback because
     *                         the return will not be checked
     * Returns:
     *     Blank visitor ID if not allowed or not ready
     *     Visitor ID if ready
     * Notes:
     *     See _getRemoteField
     *********************************************************************/

    visitor._use1stPartyMarketingCloudServer = false;

    visitor.getMarketingCloudVisitorID = function(callback, forceCallCallback) {
      if (
        visitor.marketingCloudServer &&
        visitor.marketingCloudServer.indexOf(".demdex.net") < 0
      ) {
        visitor._use1stPartyMarketingCloudServer = true;
      }

      var corsData = visitor._getAudienceManagerURLData(
          "_setMarketingCloudFields"
        ),
        url = corsData.url;

      return visitor._getRemoteField(
        MCMID,
        url,
        callback,
        forceCallCallback,
        corsData
      );
    };

    var getVisitorValuesSooner = function getVisitorValuesSooner(
      callback,
      fields
    ) {
      var ret = {};
      visitor.getMarketingCloudVisitorID(function() {
        fields.forEach(function(field) {
          ret[field] = visitor._getField(field, true);
        });

        if (fields.indexOf(MCOPTOUT) !== -1) {
          visitor.isOptedOut(
            function(value) {
              ret[MCOPTOUT] = value;
              callback(ret);
            },
            null,
            true
          );
        } else {
          callback(ret);
        }
      }, true);
    };
    /*********************************************************************
	  * Function getVisitorValues(callback, fields): Async API that returns an object with the following props: MCMID, MCAID, OPTOUT, MCAAMLH and MCAAMB.
	  *   This method should replace the code in other libraries that waits for all those values to be available by
	  *   by calling separate APIs.
	  *
	  *   callback: The callback that will recieve the return value.
	  *   fieldNames (OPTIONAL): Array of fields to retrieve frpm async methods, usinf the Visitor.FIELDS enums.
	          If no fieldsNames provided, it will return all the fields: MCMID, MCAID, OPTOUT, MCAAMLH and MCAAMB
	  *       Example: getVisitorValues(callback, [visitor.FIELDS.MCMID, visitor.FIELDS.MCAID])
	  *********************************************************************/

    visitor.getVisitorValues = function(callback, fields) {
      var defaultMetadata = {
        MCMID: {
          fn: visitor.getMarketingCloudVisitorID,
          args: [true],
          context: visitor
        },
        MCOPTOUT: {
          fn: visitor.isOptedOut,
          args: [undefined, true],
          context: visitor
        },
        MCAID: {
          fn: visitor.getAnalyticsVisitorID,
          args: [true],
          context: visitor
        },
        MCAAMLH: {
          fn: visitor.getAudienceManagerLocationHint,
          args: [true],
          context: visitor
        },
        MCAAMB: {
          fn: visitor.getAudienceManagerBlob,
          args: [true],
          context: visitor
        }
      };
      var metadata =
        !fields || !fields.length
          ? defaultMetadata
          : utils.pluck(defaultMetadata, fields);

      if (fields && fields.indexOf("MCAID") === -1) {
        getVisitorValuesSooner(callback, fields);
      } else {
        asyncParallelApply(metadata, callback);
      }
    };
    /*********************************************************************
     * Function setCustomerIDs(customerIDs, hashType): Set the map of Customer IDs
     *     customerIDs = A map of customerIDType = customerID pairs
     *     hashType    = Optional support for hashing IDs
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._currentCustomerIDs = {};
    visitor._customerIDsHashChanged = false;
    visitor._newCustomerIDsHash = "";

    visitor.setCustomerIDs = function(customerIDs, hashType) {
      // If opted out, won't set customer IDs
      if (visitor.isOptedOut()) {
        return;
      }

      function resetCustomerHashFlag() {
        visitor._customerIDsHashChanged = false;
      } // Make sure we can actually support this

      if (customerIDs) {
        if (!utils.isObject(customerIDs) || utils.isObjectEmpty(customerIDs)) {
          return false;
        } // Get the current value and see if we already have what we need

        visitor._readVisitor(); // Update the current customer IDs and authState enum

        var cidt, cid, hashedId;

        for (cidt in customerIDs) {
          if (_isNOP(cidt)) {
            cid = customerIDs[cidt];
            hashType = cid.hasOwnProperty("hashType")
              ? cid["hashType"]
              : hashType;

            if (cid) {
              if (_typeof(cid) === "object") {
                var ccid = {};

                if (cid["id"]) {
                  if (hashType) {
                    hashedId = hashUtil(trimAndLowercase(cid["id"]), hashType); // If hashedId is undefined, won't set customer IDs

                    if (!hashedId) {
                      return;
                    }

                    cid["id"] = hashedId;
                    ccid["hashType"] = hashType;
                  }

                  ccid["id"] = cid["id"];
                }

                if (cid["authState"] != undefined) {
                  // eslint-disable-line eqeqeq
                  ccid["authState"] = cid["authState"];
                }

                visitor._currentCustomerIDs[cidt] = ccid;
              } else {
                if (hashType) {
                  hashedId = hashUtil(trimAndLowercase(cid), hashType); // If hashedId is undefined, won't set customer IDs

                  if (!hashedId) {
                    return;
                  }

                  visitor._currentCustomerIDs[cidt] = {
                    id: hashedId,
                    hashType: hashType
                  };
                } else {
                  visitor._currentCustomerIDs[cidt] = {
                    id: cid
                  };
                }
              }
            }
          }
        }

        var customerIDsWithAuthState = visitor.getCustomerIDs(),
          customerIDsHash = visitor._getField(MCCIDH),
          customerIDsSerialized = "";

        if (!customerIDsHash) {
          customerIDsHash = 0;
        }

        for (cidt in customerIDsWithAuthState) {
          if (_isNOP(cidt)) {
            cid = customerIDsWithAuthState[cidt];
            customerIDsSerialized +=
              (customerIDsSerialized ? "|" : "") +
              cidt +
              "|" +
              (cid["id"] ? cid["id"] : "") +
              (cid["authState"] ? cid["authState"] : "");
          }
        }

        visitor._newCustomerIDsHash = String(
          visitor._hash(customerIDsSerialized)
        );

        if (visitor._newCustomerIDsHash !== customerIDsHash) {
          visitor._customerIDsHashChanged = true; // Sync with mapping services

          visitor._mapCustomerIDs(resetCustomerHashFlag);
        }
      }
    };
    /*********************************************************************
     * Function getCustomerIDs(): Get Customer IDs set by setCustomerIDs,
     *                            the auth-state for each customer ID type
     *                            and hash-type if applicable
     * Returns:
     *     Customer IDs, auth-states and hash-types
     *     {
     *          [customerIDType1]:{
     *               "id":[customerID1],
     *               "authState":[authState1],
     *               "hashType":[hashType1]
     *          },
     *          [customerIDType2]:{
     *               "id":[customerID2],
     *               "authState":[authState2],
     *               "hashType":[hashType2]
     *          }
     *          ...
     *     }
     *********************************************************************/

    visitor.getCustomerIDs = function() {
      visitor._readVisitor();

      var customerIDs = {},
        cidt,
        cid; // Pull in the currently provided customer IDs and authenticated states

      for (cidt in visitor._currentCustomerIDs) {
        if (_isNOP(cidt)) {
          cid = visitor._currentCustomerIDs[cidt];

          if (cid["id"]) {
            if (!customerIDs[cidt]) {
              customerIDs[cidt] = {};
            }

            customerIDs[cidt]["id"] = cid["id"];

            if (cid["authState"] != undefined) {
              // eslint-disable-line eqeqeq
              customerIDs[cidt]["authState"] = cid["authState"];
            } else {
              customerIDs[cidt]["authState"] = thisClass.AuthState["UNKNOWN"];
            }

            if (cid["hashType"]) {
              customerIDs[cidt]["hashType"] = cid["hashType"];
            }
          }
        }
      }

      return customerIDs;
    };
    /*********************************************************************
     * Function setAnalyticsVisitorID(analyticsVisitorID): Set the analytics visitor ID
     *     analyticsVisitorID = Analytics visitor ID
     * Returns:
     *     Nothing
     * Notes:
     *     See _setAnalyticsFields
     *********************************************************************/

    visitor.setAnalyticsVisitorID = function(analyticsVisitorID) {
      visitor._setAnalyticsFields(analyticsVisitorID);
    };
    /*********************************************************************
     * Function getAnalyticsVisitorID(callback,forceCallCallback,gettingMarketingCloudVisitorID): Get the analytics visitor ID
     *     callback                       = Optional callback to register if visitor ID isn't ready yet
     *     forceCallCallback              = Option flag to force calling callback because the return will not be checked
     *     gettingMarketingCloudVisitorID = Option flag to also get the Marketing Cloud Visitor ID from the Analytics /id service
     * Returns:
     *     Blank visitor ID if not allowed or not ready
     *     Visitor ID if ready
     * Notes:
     *     See _getRemoteField
     *********************************************************************/

    visitor.getAnalyticsVisitorID = function(
      callback,
      forceCallCallback,
      gettingMarketingCloudVisitorID
    ) {
      // Short-circuit if no tracking server - https://jira.corp.adobe.com/browse/MCID-237
      // Add && !gettingMarketingCloudVisitorID so we don't break using using 1st party data collection server to
      // generate MID when 3rd party cookies are blocked.
      if (
        !helpers.isTrackingServerPopulated() &&
        !gettingMarketingCloudVisitorID
      ) {
        visitor._callCallback(callback, [""]);

        return "";
      }

      var marketingCloudVisitorID = "";

      if (!gettingMarketingCloudVisitorID) {
        marketingCloudVisitorID = visitor.getMarketingCloudVisitorID(function(
          newMarketingCloudVisitorID
        ) {
          visitor.getAnalyticsVisitorID(callback, true);
        });
      }

      if (marketingCloudVisitorID || gettingMarketingCloudVisitorID) {
        var server = gettingMarketingCloudVisitorID
            ? visitor.marketingCloudServer
            : visitor.trackingServer,
          url = "";

        if (visitor.loadSSL) {
          if (gettingMarketingCloudVisitorID) {
            if (visitor.marketingCloudServerSecure) {
              server = visitor.marketingCloudServerSecure;
            }
          } else if (visitor.trackingServerSecure) {
            server = visitor.trackingServerSecure;
          }
        }

        var corsData = {};

        if (server) {
          var baseUrl =
            "http" + (visitor.loadSSL ? "s" : "") + "://" + server + "/id";
          var queryData =
            "d_visid_ver=" +
            visitor.version +
            "&mcorgid=" +
            encodeURIComponent(visitor.marketingCloudOrgID) +
            (marketingCloudVisitorID
              ? "&mid=" + encodeURIComponent(marketingCloudVisitorID)
              : "") +
            (visitor.idSyncDisable3rdPartySyncing ||
            visitor.disableThirdPartyCookies
              ? "&d_coppa=true"
              : ""); // TODO Deprecate idSyncDisable3rdPartySyncing.
          var callbackInfo = [
            "s_c_il",
            visitor._in,
            "_set" +
              (gettingMarketingCloudVisitorID
                ? "MarketingCloud"
                : "Analytics") +
              "Fields"
          ];
          url =
            baseUrl +
            "?" +
            queryData +
            "&callback=s_c_il%5B" +
            visitor._in +
            "%5D._set" +
            (gettingMarketingCloudVisitorID ? "MarketingCloud" : "Analytics") +
            "Fields";
          corsData.corsUrl = baseUrl + "?" + queryData;
          corsData.callback = callbackInfo;
        }

        corsData.url = url;
        return visitor._getRemoteField(
          gettingMarketingCloudVisitorID ? MCMID : MCAID,
          url,
          callback,
          forceCallCallback,
          corsData
        );
      }

      return "";
    };
    /*********************************************************************
     * Function getAudienceManagerLocationHint(callback,forceCallCallback): Get the AudienceManager Location Hint
     *     callback          = Optional callback to register if location hint isn't ready
     *     forceCallCallback = Option flag to force calling callback because
     *                         the return will not be checked
     * Returns:
     *     Blank location hint if not allowed or not ready
     *     Location hint if ready
     * Notes:
     *     See _getRemoteField
     *********************************************************************/

    visitor.getAudienceManagerLocationHint = function(
      callback,
      forceCallCallback
    ) {
      var marketingCloudVisitorID = visitor.getMarketingCloudVisitorID(function(
        newMarketingCloudVisitorID
      ) {
        visitor.getAudienceManagerLocationHint(callback, true);
      });

      if (marketingCloudVisitorID) {
        var analyticsVisitorID = visitor._getField(MCAID);

        if (!analyticsVisitorID && helpers.isTrackingServerPopulated()) {
          analyticsVisitorID = visitor.getAnalyticsVisitorID(function(
            newAnalyticsVisitorID
          ) {
            visitor.getAudienceManagerLocationHint(callback, true);
          });
        }

        if (analyticsVisitorID || !helpers.isTrackingServerPopulated()) {
          var corsData = visitor._getAudienceManagerURLData(),
            url = corsData.url;

          return visitor._getRemoteField(
            MCAAMLH,
            url,
            callback,
            forceCallCallback,
            corsData
          );
        }
      }

      return "";
    };
    /*********************************************************************
     * Function getLocationHint(callback,forceCallCallback): Proxy of getAudienceManagerLocationHint
     *********************************************************************/

    visitor.getLocationHint = visitor.getAudienceManagerLocationHint;
    /*********************************************************************
     * Function getAudienceManagerBlob(callback,forceCallCallback): Get the AudienceManager blob
     *     callback          = Optional callback to register if blob isn't ready
     *     forceCallCallback = Option flag to force calling callback because
     *                         the return will not be checked
     * Returns:
     *     Blank blob if not allowed or not ready
     *     Blob if ready
     * Notes:
     *     See _getRemoteField
     *********************************************************************/

    visitor.getAudienceManagerBlob = function(callback, forceCallCallback) {
      var marketingCloudVisitorID = visitor.getMarketingCloudVisitorID(function(
        newMarketingCloudVisitorID
      ) {
        visitor.getAudienceManagerBlob(callback, true);
      });

      if (marketingCloudVisitorID) {
        var analyticsVisitorID = visitor._getField(MCAID);

        if (!analyticsVisitorID && helpers.isTrackingServerPopulated()) {
          analyticsVisitorID = visitor.getAnalyticsVisitorID(function(
            newAnalyticsVisitorID
          ) {
            visitor.getAudienceManagerBlob(callback, true);
          });
        }

        if (analyticsVisitorID || !helpers.isTrackingServerPopulated()) {
          var corsData = visitor._getAudienceManagerURLData(),
            url = corsData.url;

          if (visitor._customerIDsHashChanged) {
            visitor._setFieldExpire(MCAAMB, -1);
          }

          return visitor._getRemoteField(
            MCAAMB,
            url,
            callback,
            forceCallCallback,
            corsData
          );
        }
      }

      return "";
    };
    /*********************************************************************
     * Function getSupplementalDataID(consumerID,noGenerate): Get a supplemental-data ID for the consumer
     *     consumerID = Consumer ID requesting supplemental-data ID (AppMeasurement instance number, client-code+mbox ID, etc...)
     *     noGenerate = Optional flag to not generate a new supplemental-data ID if there isn't a current one
     * Returns:
     *     Hit-stitching ID to use for a single event
     *********************************************************************/

    visitor._supplementalDataIDCurrent = "";
    visitor._supplementalDataIDCurrentConsumed = {};
    visitor._supplementalDataIDLast = "";
    visitor._supplementalDataIDLastConsumed = {};

    visitor.getSupplementalDataID = function(consumerID, noGenerate) {
      // If we don't have a current supplemental-data ID generate one if needed
      if (!visitor._supplementalDataIDCurrent && !noGenerate) {
        visitor._supplementalDataIDCurrent = visitor._generateID(1);
      } // Default to using the current supplemental-data ID

      var supplementalDataID = visitor._supplementalDataIDCurrent; // If we have the last supplemental-data ID that has not been consumed by this consumer...

      if (
        visitor._supplementalDataIDLast &&
        !visitor._supplementalDataIDLastConsumed[consumerID]
      ) {
        // Use the last supplemental-data ID
        supplementalDataID = visitor._supplementalDataIDLast; // Mark the last supplemental-data ID as consumed for this consumer

        visitor._supplementalDataIDLastConsumed[consumerID] = true; // If we are using te current supplemental-data ID at this point and we have a supplemental-data ID...
      } else if (supplementalDataID) {
        // If the current supplemental-data ID has already been consumed by this consumer..
        if (visitor._supplementalDataIDCurrentConsumed[consumerID]) {
          // Move the current supplemental-data ID to the last including the current consumed list
          visitor._supplementalDataIDLast = visitor._supplementalDataIDCurrent;
          visitor._supplementalDataIDLastConsumed =
            visitor._supplementalDataIDCurrentConsumed; // Generate a new current supplemental-data ID if needed, use it, and clear the current consumed list

          visitor._supplementalDataIDCurrent = supplementalDataID = !noGenerate
            ? visitor._generateID(1)
            : "";
          visitor._supplementalDataIDCurrentConsumed = {};
        } // If we still have a supplemental-data ID mark the current supplemental-data ID as consumed by this consumer

        if (supplementalDataID) {
          visitor._supplementalDataIDCurrentConsumed[consumerID] = true;
        }
      } // Return the supplemental-data ID to use

      return supplementalDataID;
    };

    var isGettingLiberatedOptOut = false;
    visitor._liberatedOptOut = null;
    /*
	       Returns:
	       'global' - global opt-out
	       'NONE' - no opt-out
	       '' - unknown and you need to wait for the callback to be called
	  */

    visitor.getOptOut = function(callback, forceCallCallback) {
      var corsData = visitor._getAudienceManagerURLData(
          "_setMarketingCloudFields"
        ),
        url = corsData.url;

      if (!isOptInSafe()) {
        visitor._registerCallback("liberatedOptOut", callback);

        if (visitor._liberatedOptOut !== null) {
          visitor._callAllCallbacks("liberatedOptOut", [
            visitor._liberatedOptOut
          ]);

          isGettingLiberatedOptOut = false;
          return visitor._liberatedOptOut;
        }

        if (isGettingLiberatedOptOut) {
          return null;
        } else {
          isGettingLiberatedOptOut = true;
        }

        var cb = "liberatedGetOptOut";
        corsData.corsUrl = corsData.corsUrl.replace(
          /\.demdex\.net\/id\?/,
          ".demdex.net/optOutStatus?"
        );
        corsData.callback = [cb];

        commonjsGlobal[cb] = function(data) {
          // Handle opt out
          if (data === Object(data)) {
            var optOut, d_ottl;
            var parsed = utils.parseOptOut(data, optOut, NONE);
            optOut = parsed.optOut;
            d_ottl = parsed.d_ottl * 1000; // in seconds

            visitor._liberatedOptOut = optOut;
            setTimeout(function() {
              visitor._liberatedOptOut = null;
            }, d_ottl);
          }

          visitor._callAllCallbacks("liberatedOptOut", [optOut]);

          isGettingLiberatedOptOut = false;
        };

        requestProcs.fireCORS(corsData);
        return null;
      } else {
        return visitor._getRemoteField(
          MCOPTOUT,
          url,
          callback,
          forceCallCallback,
          corsData
        );
      }
    };
    /*
	   Returns:
	   true - opted-out
	   false - not opted-out
	   null - unknown and you need to wait for the callback to be called
	   */

    visitor.isOptedOut = function(callback, optOutType, forceCallCallback) {
      // Default to optOutType global
      if (!optOutType) {
        optOutType = thisClass["OptOut"]["GLOBAL"];
      }

      var optOut = visitor.getOptOut(function(optOut) {
        var isOptedOut =
          optOut === thisClass["OptOut"]["GLOBAL"] ||
          optOut.indexOf(optOutType) >= 0;

        visitor._callCallback(callback, [isOptedOut]);
      }, forceCallCallback);

      if (optOut) {
        return (
          optOut === thisClass["OptOut"]["GLOBAL"] ||
          optOut.indexOf(optOutType) >= 0
        );
      }

      return null;
    };
    /* PRIVATE PROPERTIES/METHODS: */

    visitor._fields = null;
    visitor._fieldsExpired = null;
    /*********************************************************************
     * Function _hash(str): Generate hash of string
     *     str = String to generate hash from
     * Returns:
     *     Hash
     *********************************************************************/

    visitor._hash = function(str) {
      var hash = 0,
        pos,
        ch;

      if (str) {
        for (pos = 0; pos < str.length; pos++) {
          ch = str.charCodeAt(pos);
          hash = (hash << 5) - hash + ch;
          hash = hash & hash; // Convert to 32bit integer
        }
      }

      return hash;
    };
    /*********************************************************************
     * Function _generateID(method): Generate a random 128bit ID
     *     method = Optional ID generation method
     *              0 = Decimal 2 63bit numbers
     *              1 = Hex 2 63bit numbers
     * Returns:
     *     Random 128bit ID as a string
     *********************************************************************/

    visitor._generateID = generateRandomID; // Wrap generate ID for MIDs because we want to track it in the state.

    visitor._generateLocalMID = function() {
      var mid = visitor._generateID(0);

      _callStateTracker.isClientSideMarketingCloudVisitorID = true;
      return mid;
    };
    /*********************************************************************
     * Function _callCallback(callback,args): Call a callback
     *     callback = If this is a function it will just be called.
     *                Otherwise it needs to be an array with two elements
     *                containing the object at index 0 and a function to
     *                call on the object at index 1.
     *     args     = Array of arguments
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._callbackList = null;

    visitor._callCallback = function(callback, args) {
      try {
        if (typeof callback === "function") {
          callback.apply(w, args);
        } else {
          callback[1].apply(callback[0], args);
        }
      } catch (e) {
        // Fail gracefully and silently.
      }
    };
    /*********************************************************************
     * Function _registerCallback(field,callback): Register callback for field
     *     field    = Field to link callback to
     *     callback = (see _callCallback)
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._registerCallback = function(field, callback) {
      if (callback) {
        if (visitor._callbackList == null) {
          // eslint-disable-line eqeqeq
          visitor._callbackList = {};
        }

        if (visitor._callbackList[field] == undefined) {
          // eslint-disable-line eqeqeq
          visitor._callbackList[field] = [];
        }

        visitor._callbackList[field].push(callback);
      }
    };
    /*********************************************************************
     * Function _callAllCallbacks(field,args): CAll all callbacks registered to field
     *     field = Field callbacks are linked to
     *     args  = Array of arguments
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._callAllCallbacks = function(field, args) {
      if (visitor._callbackList != null) {
        // eslint-disable-line eqeqeq
        // Call all of the callbacks
        var callbackList = visitor._callbackList[field];

        if (callbackList) {
          while (callbackList.length > 0) {
            visitor._callCallback(callbackList.shift(), args);
          }
        }
      }
    };
    /*********************************************************************
     * Function _addQuerystringParam(url, key, value, location): Adds a param to the querystring
     *                            optionally at a specific location
     *     url      = URL to add the param to
     *     key      = querystring parameter key to add to url
     *     value    = querystring parameter value to add to url
     *     location = optional location index, defaults to end of array
     * Returns:
     *     url with param added to querystring
     *********************************************************************/

    visitor._addQuerystringParam = function(url, key, value, location) {
      var param = encodeURIComponent(key) + "=" + encodeURIComponent(value); // Preserve any existing hashes.

      var hash = helpers.parseHash(url);
      var urlWithoutHash = helpers.hashlessUrl(url);
      var hasNoQuerystring = urlWithoutHash.indexOf("?") === -1;

      if (hasNoQuerystring) {
        return urlWithoutHash + "?" + param + hash;
      }

      var urlParts = urlWithoutHash.split("?");
      var host = urlParts[0] + "?";
      var querystring = urlParts[1];
      var params = helpers.addQueryParamAtLocation(
        querystring,
        param,
        location
      );
      return host + params + hash;
    };
    /*********************************************************************
     * Function _extractParamFromUri(url, paramName): Extracts a query parameter value from a URL.
     *
     *     url        = The URI from which to extract the parameter.
     *     paramName  = The name of the query paramater to extract.
     * Returns:
     *     URL Decoded value of the query paramater. undefined if not found.
     *********************************************************************/

    visitor._extractParamFromUri = function(url, paramName) {
      var re = new RegExp("[\\?&#]" + paramName + "=([^&#]*)");
      var results = re.exec(url);

      if (results && results.length) {
        return decodeURIComponent(results[1]);
      }
    };
    /*********************************************************************
     * Function _parseAdobeMcFromUrl(url): Parse the adobe mc param from the URL into an object set on visitor.
     *
     *     url        = The URI from which to extract the parameter. Default to window.location.search.
     * Returns:
     *     visitor_adobePayload: simple object literal containing the k/v pairs.
     *         example: { MCMID: "12345", MCAID: "5678" }
     *********************************************************************/

    function parseParamFromUrl(paramArg) {
      // NOTE: This is necessary because on IE8, the closure function won't have access to the param
      // being passed in to the parent function. So no access to `paramArg`. :(
      var param = paramArg;
      return function(url) {
        var querystring = url || w.location.href;

        try {
          var paramValue = visitor._extractParamFromUri(querystring, param);

          if (paramValue) {
            return helpers.parsePipeDelimetedKeyValues(paramValue);
          }
        } catch (ex) {
          // Fail silently.
        }
      };
    }

    visitor._parseAdobeMcFromUrl = parseParamFromUrl(constants.ADOBE_MC);
    visitor._parseAdobeMcSdidFromUrl = parseParamFromUrl(
      constants.ADOBE_MC_SDID
    );
    /*
     * '_attemptToPopulateSdidFromUrl' will get called before the initConfig instantiation,
     * basically before any calls have been made.
     *
     * Look for an 'adobe_mc_sdid' param in the URL. If found, parse it and look for SDID and CONSUMER,
     * and try to set those IDs manually as supplemental Data IDs. MCID-285.
     *
     * This will be overwritten by any `serverState` configs passed in!
     */

    visitor._attemptToPopulateSdidFromUrl = function(url) {
      var sdidParam = visitor._parseAdobeMcSdidFromUrl(url);

      var secondsElapsed = 1000000000; // expired

      if (sdidParam && sdidParam["TS"]) {
        secondsElapsed = helpers.getTimestampInSeconds() - sdidParam["TS"];
      }

      if (
        sdidParam &&
        sdidParam["SDID"] &&
        sdidParam[MCORGID] === marketingCloudOrgID &&
        secondsElapsed < visitor.sdidParamExpiry
      ) {
        visitor._supplementalDataIDCurrent = sdidParam["SDID"];
        visitor._supplementalDataIDCurrentConsumed["SDID_URL_PARAM"] = true;
      }
    };
    /*
     * '_attemptToPopulateIdsFromUrl' will get called before the initConfig instantiation,
     * basically before any calls have been made.
     *
     * Look for an 'adobe_mc' param in the URL. If found, parse it and look for MCMID or MCAID, and try to set those
     * IDs manually.
     */

    function populateIdsFrom(adobeMcParam) {
      function setIdIfValid(id, setter, idType) {
        if (id && id.match(constants.VALID_VISITOR_ID_REGEX)) {
          if (idType === MCMID) {
            validMCMIDUrl = true;
          }

          setter(id);
        }
      } // Those expressions need to stay in this order!

      setIdIfValid(
        adobeMcParam[MCMID],
        visitor.setMarketingCloudVisitorID,
        MCMID
      );

      visitor._setFieldExpire(MCAAMB, -1);

      setIdIfValid(adobeMcParam[MCAID], visitor.setAnalyticsVisitorID);
    }

    visitor._attemptToPopulateIdsFromUrl = function() {
      var adobeMcParam = visitor._parseAdobeMcFromUrl();

      if (adobeMcParam && adobeMcParam["TS"]) {
        var nowInSeconds = helpers.getTimestampInSeconds(); // TS should be in seconds starting VAPI v2.0.0. This will be backward compatible
        // with VAPI 1.10.0 where TS was introduced in ms: the diff will be negative and in turn
        // it will be smaller than the TTL and will allow setting the IDs.

        var diffInSeconds = nowInSeconds - adobeMcParam["TS"];
        var adobeMcParamAgeInMin = Math.floor(diffInSeconds / 60);

        if (
          adobeMcParamAgeInMin > constants.ADOBE_MC_TTL_IN_MIN ||
          adobeMcParam[MCORGID] !== marketingCloudOrgID
        ) {
          return;
        }

        populateIdsFrom(adobeMcParam);
      }
    };

    function mergeSupplementalDataID(sdidState) {
      sdidState = sdidState || {};
      visitor._supplementalDataIDCurrent =
        sdidState["supplementalDataIDCurrent"] || "";
      visitor._supplementalDataIDCurrentConsumed =
        sdidState["supplementalDataIDCurrentConsumed"] || {};
      visitor._supplementalDataIDLast =
        sdidState["supplementalDataIDLast"] || "";
      visitor._supplementalDataIDLastConsumed =
        sdidState["supplementalDataIDLastConsumed"] || {};
    }
    /*********************************************************************
     * Function _mergeServerState(serverState): Merge server state with local instance.
     *
     *     serverState  = Server state organized by Org ID
     *           type: Stringified JSON or JSON object
     *
     * Returns: Nothing
     *********************************************************************/

    visitor._mergeServerState = function(serverState) {
      if (!serverState) {
        return;
      }

      function mergeCustomerIDs(ids) {
        helpers.isObject(ids) && visitor.setCustomerIDs(ids);
      }

      function parse(serverState) {
        return helpers.isObject(serverState)
          ? serverState
          : JSON.parse(serverState);
      }

      try {
        serverState = parse(serverState);

        if (serverState[visitor.marketingCloudOrgID]) {
          var stateByOrgID = serverState[visitor.marketingCloudOrgID];
          mergeCustomerIDs(stateByOrgID["customerIDs"]);
          mergeSupplementalDataID(stateByOrgID["sdid"]);
        }
      } catch (ex) {
        throw new Error("`serverState` has an invalid format.");
      }
    };
    /*********************************************************************
     * Function _loadData(fieldGroup,url,loadErrorHandler,corsData): Load a set of data
     *                            via CORS or JSONP
     *     fieldGroup  = Field group to link the loading/timeout to
     *     url         = URL to make the JSONP call to
     *     loadErrorHandler = Timeout function to call
     *     corsData    = CORS-specific data
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._timeout = null;

    visitor._loadData = function(fieldGroup, url, loadErrorHandler, corsData) {
      var fieldGroupParamKey = "d_fieldgroup";
      url = visitor._addQuerystringParam(
        url,
        fieldGroupParamKey,
        fieldGroup,
        1
      );
      corsData.url = visitor._addQuerystringParam(
        corsData.url,
        fieldGroupParamKey,
        fieldGroup,
        1
      );
      corsData.corsUrl = visitor._addQuerystringParam(
        corsData.corsUrl,
        fieldGroupParamKey,
        fieldGroup,
        1
      );
      _callStateTracker.fieldGroupObj[fieldGroup] = true;

      if (
        corsData === Object(corsData) &&
        corsData.corsUrl &&
        requestProcs.corsMetadata.corsType === "XMLHttpRequest"
      ) {
        requestProcs.fireCORS(corsData, loadErrorHandler, fieldGroup);
      }
    };
    /*********************************************************************
     * Function _clearTimeout(fieldGroup): Clear a timeout tied to a field group
     *     fieldGroup = Field group timeout is linked to
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._clearTimeout = function(fieldGroup) {
      // Clear timeout
      if (
        visitor._timeout != null && // eslint-disable-line eqeqeq
        visitor._timeout[fieldGroup]
      ) {
        clearTimeout(visitor._timeout[fieldGroup]);
        visitor._timeout[fieldGroup] = 0;
      }
    };
    /*********************************************************************
     * Function _getSettingsDigest(): Generate the settings digest for this instace
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._settingsDigest = 0;

    visitor._getSettingsDigest = function() {
      if (!visitor._settingsDigest) {
        var settings = visitor.version;

        if (visitor.audienceManagerServer) {
          settings += "|" + visitor.audienceManagerServer;
        }

        if (visitor.audienceManagerServerSecure) {
          settings += "|" + visitor.audienceManagerServerSecure;
        }

        visitor._settingsDigest = visitor._hash(settings);
      }

      return visitor._settingsDigest;
    };
    /*********************************************************************
     * Function _readVisitor(): Read the visitor cookie into instance
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._readVisitorDone = false;

    visitor._readVisitor = function() {
      if (!visitor._readVisitorDone) {
        visitor._readVisitorDone = true;

        var settingsDigest = visitor._getSettingsDigest(),
          settingsDigestChanged = false,
          data = visitor.cookieRead(visitor.cookieName),
          pos,
          parts,
          field,
          value,
          expire,
          expireOnSession,
          now = new Date();
        /* Reading the Visitor values from the first party server cookie if AMCV cookie is empty.
	          Added because Safari is changing the expiry of cookies set with document.cookie */

        if (!data && !validMCMIDUrl && !visitor.discardTrackingServerECID) {
          data = visitor.cookieRead(constants.FIRST_PARTY_SERVER_COOKIE);
        }

        if (visitor._fields == null) {
          // eslint-disable-line eqeqeq
          visitor._fields = {};
        } // If this is a valid cookie value parse and go through each key|value pair

        if (data && data !== "T") {
          data = data.split("|"); // If the cookie starts out with a settings digest

          if (data[0].match(/^[\-0-9]+$/)) {
            if (parseInt(data[0], 10) !== settingsDigest) {
              settingsDigestChanged = true;
            }

            data.shift();
          }

          if (data.length % 2 === 1) {
            data.pop();
          }

          for (pos = 0; pos < data.length; pos += 2) {
            parts = data[pos].split("-");
            field = parts[0];
            value = data[pos + 1];

            if (parts.length > 1) {
              expire = parseInt(parts[1], 10);
              expireOnSession = parts[1].indexOf("s") > 0;
            } else {
              expire = 0;
              expireOnSession = false;
            }

            if (settingsDigestChanged) {
              // If the settings digest has changed clear out the Customer ID hash forcing resyncs
              if (field === MCCIDH) {
                value = "";
              } // If the settings digest has changed expire all expiring fields now

              if (expire > 0) {
                expire = now.getTime() / 1000 - 60;
              }
            }

            if (field && value) {
              visitor._setField(field, value, 1);

              if (expire > 0) {
                visitor._fields["expire" + field] =
                  expire + (expireOnSession ? "s" : "");

                if (
                  now.getTime() >= expire * 1000 ||
                  (expireOnSession &&
                    !visitor.cookieRead(visitor.sessionCookieName))
                ) {
                  if (!visitor._fieldsExpired) {
                    visitor._fieldsExpired = {};
                  }

                  visitor._fieldsExpired[field] = true;
                }
              }
            }
          }
        } // If we still don't have the analytics visitor ID look for the Mod-Stats created s_vi because we may be on first party data collection where the s_vi cookie is availible

        if (!visitor._getField(MCAID) && helpers.isTrackingServerPopulated()) {
          /* s_vi=[CS]v1|28B7854A85160711-40000182A01D8F44[CE]; */
          data = visitor.cookieRead("s_vi");

          if (data) {
            data = data.split("|");

            if (data.length > 1 && data[0].indexOf("v1") >= 0) {
              value = data[1];
              pos = value.indexOf("[");

              if (pos >= 0) {
                value = value.substring(0, pos);
              }

              if (value && value.match(constants.VALID_VISITOR_ID_REGEX)) {
                visitor._setField(MCAID, value);
              }
            }
          }
        }
      }
    };
    /*********************************************************************
     * Function _writeVisitor(): Write visitor fields out to cookie
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._appendVersionTo = function(amcvData) {
      var versionKeyValue = "vVersion|" + visitor.version;
      var versionInAmcvData = amcvData
        ? visitor._getCookieVersion(amcvData)
        : null;

      if (!versionInAmcvData) {
        amcvData += (amcvData ? "|" : "") + versionKeyValue;
      } else if (
        version.areVersionsDifferent(versionInAmcvData, visitor.version)
      ) {
        amcvData = amcvData.replace(constants.VERSION_REGEX, versionKeyValue);
      }

      return amcvData;
    };

    visitor._writeVisitor = function() {
      var data = visitor._getSettingsDigest(),
        // The first thing in the cookie is the settings digest
        field,
        value;

      for (field in visitor._fields) {
        if (
          _isNOP(field) &&
          visitor._fields[field] &&
          field.substring(0, 6) !== "expire"
        ) {
          value = visitor._fields[field];
          data +=
            (data ? "|" : "") +
            field +
            (visitor._fields["expire" + field]
              ? "-" + visitor._fields["expire" + field]
              : "") +
            "|" +
            value;
        }
      } // Add the visitor version to the cookie. Will be used when resetting cookies by version. (MCID-236)

      data = visitor._appendVersionTo(data);
      visitor.cookieWrite(visitor.cookieName, data, 1);
    };
    /*********************************************************************
     * Function _getField(field,getExpired): Get value for field
     *     field      = Field to get value for
     *     getExpired = Optional flag to get expired field values
     * Returns:
     *     Field value
     *********************************************************************/

    visitor._getField = function(field, getExpired) {
      if (
        visitor._fields != null &&
        (getExpired ||
          !visitor._fieldsExpired ||
          !visitor._fieldsExpired[field])
      ) {
        // eslint-disable-line eqeqeq
        return visitor._fields[field];
      }

      return null;
    };
    /*********************************************************************
     * Function _setField(field,value,noSave): Set value for field
     *     field  = Field to set value for
     *     value  = Value to set field to
     *     noSave = (option) Don't save the visitor
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._setField = function(field, value, noSave) {
      if (visitor._fields == null) {
        // eslint-disable-line eqeqeq
        visitor._fields = {};
      }

      visitor._fields[field] = value;

      if (!noSave) {
        visitor._writeVisitor();
      }
    };
    /*********************************************************************
     * Function _getFieldList(field,getExpired): Get list value for field
     *     field      = Field to get list value for
     *     getExpired = Optional flag to get expired field values
     * Returns:
     *     Field list value
     *********************************************************************/

    visitor._getFieldList = function(field, getExpired) {
      var value = visitor._getField(field, getExpired);

      if (value) {
        return value.split("*");
      }

      return null;
    };
    /*********************************************************************
     * Function _setFieldList(field,listValue,noSave): Set list value for field
     *     field     = Field to set list value for
     *     listValue = List value to set field to
     *     noSave    = (option) Don't save the visitor
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._setFieldList = function(field, listValue, noSave) {
      visitor._setField(field, listValue ? listValue.join("*") : "", noSave);
    };
    /*********************************************************************
     * Function _getFieldMap(field,getExpired): Get map value for field
     *     field      = Field to get map value for
     *     getExpired = Optional flag to get expired field values
     * Returns:
     *     Field list value
     *********************************************************************/

    visitor._getFieldMap = function(field, getExpired) {
      var listValue = visitor._getFieldList(field, getExpired);

      if (listValue) {
        var mapValue = {},
          i;

        for (i = 0; i < listValue.length; i += 2) {
          mapValue[listValue[i]] = listValue[i + 1];
        }

        return mapValue;
      }

      return null;
    };
    /*********************************************************************
     * Function _setFieldMap(field,mapValue,noSave): Set map value for field
     *     field    = Field to set map value for
     *     mapValue = Map value to set field to
     *     noSave   = (option) Don't save the visitor
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._setFieldMap = function(field, mapValue, noSave) {
      var listValue = null,
        m;

      if (mapValue) {
        listValue = [];

        for (m in mapValue) {
          if (_isNOP(m)) {
            listValue.push(m);
            listValue.push(mapValue[m]);
          }
        }
      }

      visitor._setFieldList(field, listValue, noSave);
    };
    /*********************************************************************
	  * Function _setFieldExpire(field,ttl): Set a field to expire
	  *     field = Field to set value for
	  *     ttl   = Field TTL in seconds
	  `  *     expireOnSession = (optional)
	  * Returns:
	  *     Nothing
	  *********************************************************************/

    visitor._setFieldExpire = function(field, ttl, expireOnSession) {
      var now = new Date();
      now.setTime(now.getTime() + ttl * 1000);

      if (visitor._fields == null) {
        // eslint-disable-line eqeqeq
        visitor._fields = {};
      }

      visitor._fields["expire" + field] =
        Math.floor(now.getTime() / 1000) + (expireOnSession ? "s" : "");

      if (ttl < 0) {
        if (!visitor._fieldsExpired) {
          visitor._fieldsExpired = {};
        }

        visitor._fieldsExpired[field] = true;
      } else if (visitor._fieldsExpired) {
        visitor._fieldsExpired[field] = false;
      }

      if (expireOnSession) {
        if (!visitor.cookieRead(visitor.sessionCookieName)) {
          visitor.cookieWrite(visitor.sessionCookieName, "1");
        }
      }
    };
    /*********************************************************************
     * Function _findVisitorID(visitorID): Find a visitor ID in an object
     *     visitorID = Visitor ID or object containing visitorID
     * Returns:
     *     Visitor ID
     *********************************************************************/

    visitor._findVisitorID = function(visitorID) {
      if (visitorID) {
        // Get the visitor ID
        if (_typeof(visitorID) === "object") {
          if (visitorID["d_mid"]) {
            visitorID = visitorID["d_mid"];
          } else if (visitorID["visitorID"]) {
            visitorID = visitorID["visitorID"];
          } else if (visitorID["id"]) {
            visitorID = visitorID["id"];
          } else if (visitorID["uuid"]) {
            visitorID = visitorID["uuid"];
          } else {
            visitorID = "" + visitorID;
            /* Call toString() method of object */
          }
        } // Handle special visitorID values

        if (visitorID) {
          visitorID = visitorID.toUpperCase();

          if (visitorID === "NOTARGET") {
            visitorID = NONE;
          }
        } // If the visitorID is not valid clear it out

        if (
          !visitorID ||
          (visitorID !== NONE &&
            !visitorID.match(constants.VALID_VISITOR_ID_REGEX))
        ) {
          visitorID = "";
        }
      }

      return visitorID;
    };
    /*********************************************************************
     * Function _setFields(field,data): Set fields for fieldGroup
     *     fieldGroup = Field group
     *     data       = Data for fields
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._setFields = function(fieldGroup, data) {
      // Clear the timeout and loading flag
      visitor._clearTimeout(fieldGroup);

      if (visitor._loading != null) {
        // eslint-disable-line eqeqeq
        visitor._loading[fieldGroup] = false;
      }

      if (VISITOR_DEBUG) {
        if (_timeoutMetrics.fieldGroupObj[fieldGroup]) {
          _timeoutMetrics.fieldGroupObj[
            fieldGroup
          ].requestEnd = _timeoutMetrics.millis();

          _timeoutMetrics.process(fieldGroup);
        }
      }

      if (_callStateTracker.fieldGroupObj[fieldGroup]) {
        _callStateTracker.setState(fieldGroup, false);
      } // Marketing Cloud

      if (fieldGroup === MC) {
        if (_callStateTracker.isClientSideMarketingCloudVisitorID !== true) {
          _callStateTracker.isClientSideMarketingCloudVisitorID = false;
        } // Marketing Cloud Visitor ID

        var marketingCloudVisitorID = visitor._getField(MCMID);

        if (
          !marketingCloudVisitorID ||
          visitor.overwriteCrossDomainMCIDAndAID
        ) {
          if (_typeof(data) === "object" && data["mid"]) {
            marketingCloudVisitorID = data["mid"];
          } else {
            marketingCloudVisitorID = visitor._findVisitorID(data);
          }
          /***********************************************************************
           * If we don't have a Marketing Cloud ID at this point
           * 1. If there is a 1st party s.marketingCloudServer fire off an Analytics server call to generate a Marketing Cloud Visitor ID
           * 2. If there is not a 1st party s.marketingCloudServer just generate a Marketing Cloud Visitor ID
           ***********************************************************************/
          // We always have to have a Marketing Cloud Visitor ID so if one was not passed in generate one

          if (!marketingCloudVisitorID) {
            if (
              visitor._use1stPartyMarketingCloudServer &&
              !visitor.tried1stPartyMarketingCloudServer
            ) {
              visitor.tried1stPartyMarketingCloudServer = true;
              visitor.getAnalyticsVisitorID(null, false, true);
              return;
            }

            marketingCloudVisitorID = visitor._generateLocalMID();
          }

          visitor._setField(MCMID, marketingCloudVisitorID);
        }

        if (!marketingCloudVisitorID || marketingCloudVisitorID === NONE) {
          marketingCloudVisitorID = "";
        } // Look for other Audience Manager or Analytics data that may have come back from the call to get the Marketing Cloud data

        if (_typeof(data) === "object") {
          if (
            data["d_region"] ||
            data["dcs_region"] ||
            data["d_blob"] ||
            data["blob"]
          ) {
            visitor._setFields(AAM, data);
          }

          if (visitor._use1stPartyMarketingCloudServer && data["mid"]) {
            visitor._setFields(A, {
              id: data["id"]
            });
          }
        } // Call any Marketing Cloud Visitor ID Callbacks

        visitor._callAllCallbacks(MCMID, [marketingCloudVisitorID]);
      } // Audience Manager

      if (fieldGroup === AAM && _typeof(data) === "object") {
        // Get TTL for AAM fields
        var ttl = 604800; // One week

        if (data["id_sync_ttl"] != undefined && data["id_sync_ttl"]) {
          // eslint-disable-line eqeqeq
          ttl = parseInt(data["id_sync_ttl"], 10);
        } // AAM Location Hint

        var aamLH = destinationPublishing.getRegionAndCheckIfChanged(data, ttl); // Call any Audience Manager Location Hint callbacks

        visitor._callAllCallbacks(MCAAMLH, [aamLH]); // AAM Blob

        var aamBlob = visitor._getField(MCAAMB);

        if (data["d_blob"] || data["blob"]) {
          aamBlob = data["d_blob"];

          if (!aamBlob) {
            aamBlob = data["blob"];
          }

          visitor._setFieldExpire(MCAAMB, ttl);

          visitor._setField(MCAAMB, aamBlob);
        }

        if (!aamBlob) {
          aamBlob = "";
        } // Call any Audience Manager Blob callbacks

        visitor._callAllCallbacks(MCAAMB, [aamBlob]);
        /*
         * We are using the Audience Manager /id service as the Customer ID mapping service so if we recieve a response from
         * Audience Manager without an error we should apply the _newCustomerIDsHash marking the mapping as successful
         */

        if (!data["error_msg"] && visitor._newCustomerIDsHash) {
          visitor._setField(MCCIDH, visitor._newCustomerIDsHash);
        }
      } // Analytics

      if (fieldGroup === A) {
        // Analytics Visitor ID
        var analyticsVisitorID = visitor._getField(MCAID);

        if (!analyticsVisitorID || visitor.overwriteCrossDomainMCIDAndAID) {
          analyticsVisitorID = visitor._findVisitorID(data); // If we don't have an Analytics visitor ID store the special NONE value so we don't keep trying to request it

          if (!analyticsVisitorID) {
            analyticsVisitorID = NONE;
          } else if (analyticsVisitorID !== NONE) {
            visitor._setFieldExpire(MCAAMB, -1);
          }

          visitor._setField(MCAID, analyticsVisitorID);
        }

        if (!analyticsVisitorID || analyticsVisitorID === NONE) {
          analyticsVisitorID = "";
        } // Call any Analytics Visitor ID callbacks

        visitor._callAllCallbacks(MCAID, [analyticsVisitorID]);
      } // Handle ID Syncs

      if (!visitor.idSyncDisableSyncs && !visitor.disableIdSyncs) {
        // TODO Deprecate idSyncDisableSyncs.
        destinationPublishing.idCallNotProcesssed = false;
        var json = {};
        json["ibs"] = data["ibs"];
        json["subdomain"] = data["subdomain"];
        destinationPublishing.processIDCallData(json);
      } else {
        destinationPublishing.idCallNotProcesssed = true;
      } // Handle opt out

      if (data === Object(data)) {
        var optOut, d_ottl;

        if (isOptInSafe() && visitor.isAllowed()) {
          // Check if the cookie has been set already
          optOut = visitor._getField(MCOPTOUT);
        }

        var parsed = utils.parseOptOut(data, optOut, NONE);
        optOut = parsed.optOut;
        d_ottl = parsed.d_ottl;

        visitor._setFieldExpire(
          MCOPTOUT,
          d_ottl,
          true
          /* expireOnSession */
        );

        visitor._setField(MCOPTOUT, optOut);

        visitor._callAllCallbacks(MCOPTOUT, [optOut]);
      }
    };
    /*********************************************************************
     * Function _getRemoteField(field,url,callback): Get a remote field
     *     field             = Field
     *     url               = URL to load field from
     *     callback          = Optional callback to call if field isn't ready yet
     *                         available yet.  (See _callCallback)
     *     forceCallCallback = Optional flag to call the callback
     * Returns:
     *     Blank field value if not allowed or not ready
     *     Field value if ready
     *********************************************************************/

    visitor._loading = null;

    visitor._getRemoteField = function(
      field,
      url,
      callback,
      forceCallCallback,
      corsData
    ) {
      var fieldValue = "",
        fieldGroup,
        isFirstPartyAnalyticsVisitorIDCall = helpers.isFirstPartyAnalyticsVisitorIDCall(
          field
        );
      var fieldsNonBlockingExpiration = {
        MCAAMLH: true,
        MCAAMB: true
      }; // Make sure we can actually support this

      if (isOptInSafe() && visitor.isAllowed()) {
        // Get the current value and see if we already have what we need
        visitor._readVisitor(); // Get even if expired if it's a non-blocking expiration field

        fieldValue = visitor._getField(
          field,
          fieldsNonBlockingExpiration[field] === true
        );

        var shouldCallServer = function shouldCallServer() {
          return (
            (!fieldValue ||
              (visitor._fieldsExpired && visitor._fieldsExpired[field])) &&
            (!visitor.disableThirdPartyCalls ||
              isFirstPartyAnalyticsVisitorIDCall)
          );
        };

        if (shouldCallServer()) {
          // Generate field group
          if (field === MCMID || field === MCOPTOUT) {
            fieldGroup = MC;
          } else if (field === MCAAMLH || field === MCAAMB) {
            fieldGroup = AAM;
          } else if (field === MCAID) {
            fieldGroup = A;
          } // Make sure we have a known field group

          if (fieldGroup) {
            // Make sure we have a url only do this once
            if (
              url &&
              (visitor._loading == null || !visitor._loading[fieldGroup])
            ) {
              // eslint-disable-line eqeqeq
              if (visitor._loading == null) {
                // eslint-disable-line eqeqeq
                visitor._loading = {};
              }

              visitor._loading[fieldGroup] = true;

              visitor._loadData(
                fieldGroup,
                url,
                function(isActualTimeout) {
                  if (!visitor._getField(field)) {
                    if (VISITOR_DEBUG) {
                      if (_timeoutMetrics.fieldGroupObj[fieldGroup]) {
                        _timeoutMetrics.fieldGroupObj[
                          fieldGroup
                        ].timeout = _timeoutMetrics.millis();
                        _timeoutMetrics.fieldGroupObj[
                          fieldGroup
                        ].isActualTimeout = !!isActualTimeout;

                        _timeoutMetrics.process(fieldGroup);
                      }
                    }

                    if (isActualTimeout) {
                      _callStateTracker.setState(fieldGroup, true);
                    }

                    var fallbackValue = "";

                    if (field === MCMID) {
                      fallbackValue = visitor._generateLocalMID();
                    } else if (fieldGroup === AAM) {
                      // IMPORTANT: For the AAM group the value must always be an object and we include a timeout error so we will try again on the next page
                      fallbackValue = {
                        error_msg: "timeout"
                      };
                    }

                    visitor._setFields(fieldGroup, fallbackValue);
                  }
                },
                corsData
              );
            }

            visitor._registerCallback(field, callback);

            if (fieldValue) {
              return fieldValue;
            } // If we don't have a url set the fields to a default so all callbacks will be wrapped up

            if (!url) {
              visitor._setFields(fieldGroup, {
                id: NONE
              });
            }

            return "";
          }
        } else if (!fieldValue) {
          if (field === MCMID) {
            visitor._registerCallback(field, callback);

            fieldValue = visitor._generateLocalMID();
            visitor.setMarketingCloudVisitorID(fieldValue);
          } else if (field === MCAID) {
            visitor._registerCallback(field, callback);

            fieldValue = "";
            visitor.setAnalyticsVisitorID(fieldValue);
          } else {
            fieldValue = "";
            forceCallCallback = true;
          }
        }
      } // If the field value is a visitor ID and it's the special NONE value clear out the return and force the callback to be called

      if ((field === MCMID || field === MCAID) && fieldValue === NONE) {
        fieldValue = "";
        forceCallCallback = true;
      }

      if (callback && forceCallCallback) {
        visitor._callCallback(callback, [fieldValue]);
      }

      return fieldValue;
    };
    /*********************************************************************
     * Function _setMarketingCloudFields(marketingCloudData): Set Marketing Cloud fields
     *      marketingCloudData = Marketing Cloud Data
     * Returns:
     *     Nothing
     * Notes:
     *     See _setFields
     *********************************************************************/

    visitor._setMarketingCloudFields = function(marketingCloudData) {
      visitor._readVisitor();

      visitor._setFields(MC, marketingCloudData);
    };
    /*********************************************************************
     * Function _mapCustomerIDs(): Fire off mapping call for Customer IDs
     * Returns:
     *     Nothing
     *********************************************************************/

    visitor._mapCustomerIDs = function(callback) {
      /*
       * We using the Audience Manager /id service for the Customer ID mapping and the AAM blob isd
       * already tied to the Customer ID hash changing so mapping is triggered by simply asking for
       * the AAM blob again. _setFields will apply the _newCustomerIDsHash if there wasn't an error.
       */
      visitor.getAudienceManagerBlob(callback, true);
    };
    /*********************************************************************
     * Function _setAnalyticsFields(analyticsData): Set the Analytics fields
     *     analyticsData = Analytics data
     * Returns:
     *     Nothing
     * Notes:
     *     See _setFields
     *********************************************************************/

    visitor._setAnalyticsFields = function(analyticsData) {
      visitor._readVisitor();

      visitor._setFields(A, analyticsData);
    };
    /*********************************************************************
     * Function _setAudienceManagerFields(audienceManagerData): Set the AudienceManager fields
     *     audienceManagerData = AudienceManager data
     * Returns:
     *     Nothing
     * Notes:
     *     See _setFields
     *********************************************************************/

    visitor._setAudienceManagerFields = function(audienceManagerData) {
      visitor._readVisitor();

      visitor._setFields(AAM, audienceManagerData);
    };
    /*********************************************************************
     * Function _getAudienceManagerURLData(jsonpCallback): Generate AAM request URL data
     *     jsonpCallback = Optional JSONP callback function name
     * Returns:
     *     AAM Request URL Data
     *********************************************************************/

    visitor._getAudienceManagerURLData = function(jsonpCallback) {
      var server = visitor.audienceManagerServer,
        url = "",
        marketingCloudVisitorID = visitor._getField(MCMID),
        blob = visitor._getField(MCAAMB, true),
        analyticsVisitorID = visitor._getField(MCAID),
        customerIDs =
          analyticsVisitorID && analyticsVisitorID !== NONE
            ? "&d_cid_ic=AVID%01" + encodeURIComponent(analyticsVisitorID)
            : "";

      if (visitor.loadSSL && visitor.audienceManagerServerSecure) {
        server = visitor.audienceManagerServerSecure;
      }

      if (server) {
        var customerIDsWithAuthState = visitor.getCustomerIDs(),
          cidt,
          cid;

        if (customerIDsWithAuthState) {
          for (cidt in customerIDsWithAuthState) {
            if (_isNOP(cidt)) {
              cid = customerIDsWithAuthState[cidt];
              customerIDs +=
                "&d_cid_ic=" +
                encodeURIComponent(cidt) +
                "%01" +
                encodeURIComponent(cid["id"] ? cid["id"] : "") +
                (cid["authState"] ? "%01" + cid["authState"] : "");
            }
          }
        }

        if (!jsonpCallback) {
          jsonpCallback = "_setAudienceManagerFields";
        }

        var baseUrl =
          "http" + (visitor.loadSSL ? "s" : "") + "://" + server + "/id";
        var queryData =
          "d_visid_ver=" +
          visitor.version +
          (CONSENT_STRING && baseUrl.indexOf("demdex.net") !== -1
            ? "&gdpr=1&gdpr_consent=" + CONSENT_STRING
            : "") +
          (CONSENT_FLAG && baseUrl.indexOf("demdex.net") !== -1
            ? "&d_cf=" + CONSENT_FLAG
            : "") +
          "&d_rtbd=json" +
          "&d_ver=2" +
          (!marketingCloudVisitorID && visitor._use1stPartyMarketingCloudServer
            ? "&d_verify=1"
            : "") +
          "&d_orgid=" +
          encodeURIComponent(visitor.marketingCloudOrgID) +
          "&d_nsid=" +
          (visitor.idSyncContainerID || 0) +
          (marketingCloudVisitorID
            ? "&d_mid=" + encodeURIComponent(marketingCloudVisitorID)
            : "") +
          (visitor.idSyncDisable3rdPartySyncing ||
          visitor.disableThirdPartyCookies
            ? "&d_coppa=true"
            : "") + // TODO Deprecate idSyncDisable3rdPartySyncing.
          (isCoopSafe === true
            ? "&d_coop_safe=1"
            : isCoopSafe === false
            ? "&d_coop_unsafe=1"
            : "") +
          (blob ? "&d_blob=" + encodeURIComponent(blob) : "") +
          customerIDs;
        CONSENT_FLAG = 0;
        var callbackInfo = ["s_c_il", visitor._in, jsonpCallback];
        url =
          baseUrl +
          "?" +
          queryData +
          "&d_cb=s_c_il%5B" +
          visitor._in +
          "%5D." +
          jsonpCallback;
        return {
          url: url,
          corsUrl: baseUrl + "?" + queryData,
          callback: callbackInfo
        };
      }

      return {
        url: url
      };
    };

    function generateAdobeMcParam(fields) {
      // fields: array of tuples.
      function appendToMcParam(key, value, mcParam) {
        mcParam = mcParam ? (mcParam += "|") : mcParam;
        mcParam += key + "=" + encodeURIComponent(value);
        return mcParam;
      }

      function appendCreationTimestamp(mcParam) {
        var ts = helpers.getTimestampInSeconds(); // Timestamp in seconds.

        mcParam = mcParam ? (mcParam += "|") : mcParam;
        mcParam += "TS=" + ts;
        return mcParam;
      }

      function generateMcParam(mcParam, fieldTokens) {
        var key = fieldTokens[0];
        var value = fieldTokens[1];

        if (value != null && value !== NONE) {
          // eslint-disable-line eqeqeq
          mcParam = appendToMcParam(key, value, mcParam);
        }

        return mcParam;
      }

      var mcParam = fields.reduce(generateMcParam, "");
      return appendCreationTimestamp(mcParam);
    }
    /*********************************************************************
     * Function appendVisitorIDsTo(url): Adds an 'adobe_mc' query param to a url for cross domain support.
     *     url                   = URL to add the query param to.
     *     adobe_mc format  = encodeURIComponent(MCMID=encodeURIComponent(value1)|MCAID=...)
     *     adobe_mc content = MCMID, MCAID, MCORGID
     *
     * Returns:
     *     URL with `adobe_mc` param added to it if the IDs were found, otherwise url as is.
     *********************************************************************/

    visitor.appendVisitorIDsTo = function(url) {
      try {
        var fields = [
          [MCMID, visitor._getField(MCMID)],
          [MCAID, visitor._getField(MCAID)],
          [MCORGID, visitor.marketingCloudOrgID]
        ];
        return visitor._addQuerystringParam(
          url,
          constants.ADOBE_MC,
          generateAdobeMcParam(fields)
        );
      } catch (ex) {
        return url;
      }
    };
    /*********************************************************************
     * Function appendSupplementalDataIDTo(url, sdid): Adds an 'adobe_mc_sdid' query param to a url.
     *     url                   = URL to add the query param to.
     *     adobe_mc_sdid format  = encodeURIComponent(SDID=encodeURIComponent(sdid)...)
     *     adobe_mc_sdid content = SDID only for now
     *
     * Returns:
     *     URL with `adobe_mc` param added to it if the IDs were found, otherwise url as is.
     *********************************************************************/

    visitor.appendSupplementalDataIDTo = function(url, sdid) {
      sdid =
        sdid ||
        visitor.getSupplementalDataID(helpers.generateRandomString(), true);

      if (!sdid) {
        return url;
      }

      try {
        var adobeMcSdidValue = generateAdobeMcParam([
          ["SDID", sdid],
          [MCORGID, visitor.marketingCloudOrgID]
        ]);
        return visitor._addQuerystringParam(
          url,
          constants.ADOBE_MC_SDID,
          adobeMcSdidValue
        );
      } catch (ex) {
        return url;
      }
    };
    /* Helpers */

    var helpers = {
      parseHash: function parseHash(url) {
        var hashIndex = url.indexOf("#");
        return hashIndex > 0 ? url.substr(hashIndex) : "";
      },
      hashlessUrl: function hashlessUrl(url) {
        var hashIndex = url.indexOf("#");
        return hashIndex > 0 ? url.substr(0, hashIndex) : url;
      },
      addQueryParamAtLocation: function addQueryParamAtLocation(
        querystring,
        param,
        location
      ) {
        var params = querystring.split("&");
        location = location != null ? location : params.length; // eslint-disable-line eqeqeq

        params.splice(location, 0, param);
        return params.join("&");
      },

      /*********************************************************************
       * Function isFirstPartyAnalyticsVisitorIDCall(field, trackingServer, trackingServerSecure)
       *     all params are optional except field
       * Returns:
       *     boolean - is Analytics Visitor ID field and server is considered first party
       *********************************************************************/
      isFirstPartyAnalyticsVisitorIDCall: function isFirstPartyAnalyticsVisitorIDCall(
        field,
        trackingServer,
        trackingServerSecure
      ) {
        if (field !== MCAID) {
          return false;
        }

        var server;

        if (!trackingServer) {
          trackingServer = visitor.trackingServer;
        }

        if (!trackingServerSecure) {
          trackingServerSecure = visitor.trackingServerSecure;
        }

        if (visitor.loadSSL) {
          server = trackingServerSecure;
        } else {
          server = trackingServer;
        }

        if (typeof server === "string" && server.length) {
          return (
            server.indexOf("2o7.net") < 0 && server.indexOf("omtrdc.net") < 0
          );
        }

        return false;
      },
      isObject: function isObject(val) {
        return Boolean(val && val === Object(val));
      },
      removeCookie: function removeCookie(name) {
        cookies.remove(name, {
          domain: visitor.cookieDomain
        });
      },
      isTrackingServerPopulated: function isTrackingServerPopulated() {
        return !!visitor.trackingServer || !!visitor.trackingServerSecure;
      },
      getTimestampInSeconds: function getTimestampInSeconds() {
        return Math.round(new Date().getTime() / 1000);
      },
      parsePipeDelimetedKeyValues: function parsePipeDelimetedKeyValues(piped) {
        // Parse '|' delimited k=v pairs into an object.
        var keyValuePairs = piped.split("|");
        return keyValuePairs.reduce(function(obj, keyValue) {
          var tokens = keyValue.split("=");
          obj[tokens[0]] = decodeURIComponent(tokens[1]);
          return obj;
        }, {});
      },
      generateRandomString: function generateRandomString(length) {
        // Default to length 5.
        length = length || 5;
        var text = "";
        var chars = "abcdefghijklmnopqrstuvwxyz0123456789";

        while (length--) {
          text += chars[Math.floor(Math.random() * chars.length)];
        }

        return text;
      },
      normalizeBoolean: function normalizeBoolean(value) {
        if (value === "true") {
          return true;
        } else if (value === "false") {
          return false;
        } else {
          return value;
        }
      },
      parseBoolean: function parseBoolean(value) {
        if (value === "true") {
          return true;
        } else if (value === "false") {
          return false;
        } else {
          return null;
        }
      },
      replaceMethodsWithFunction: function replaceMethodsWithFunction(obj, fn) {
        for (var apiName in obj) {
          if (
            obj.hasOwnProperty(apiName) &&
            typeof obj[apiName] === "function"
          ) {
            obj[apiName] = fn;
          }
        }

        return obj;
      }
    };
    visitor._helpers = helpers;
    var destinationPublishing = makeDestinationPublishing(visitor, thisClass);
    visitor._destinationPublishing = destinationPublishing;
    visitor.timeoutMetricsLog = [];

    if (VISITOR_DEBUG) {
      var _timeoutMetrics = {
        d_timingapi: w.performance && w.performance.timing ? 1 : 0,
        performanceTiming:
          w.performance && w.performance.timing ? w.performance.timing : null,
        windowLoad: null,
        d_winload: null,
        fieldGroupObj: {},
        metricsQueue: [],
        send: function send(metrics) {
          if (!visitor.takeTimeoutMetrics) {
            return;
          }

          if (metrics === Object(metrics)) {
            var qsArray = [],
              f = encodeURIComponent,
              key,
              url;

            for (key in metrics) {
              if (metrics.hasOwnProperty(key)) {
                qsArray.push(f(key) + "=" + f(metrics[key]));
              }
            }

            url =
              "http" +
              (visitor.loadSSL ? "s" : "") +
              "://" +
              "dpm.demdex.net" +
              "/event?" +
              "d_visid_ver=" +
              visitor.version +
              "&d_visid_stg_timeout=" +
              visitor.loadTimeout +
              "&" +
              qsArray.join("&") +
              "&d_orgid=" +
              f(visitor.marketingCloudOrgID) +
              "&d_timingapi=" +
              this.d_timingapi +
              "&d_winload=" +
              this.getWinLoad() +
              "&d_ld=" +
              this.millis();
            new Image().src = url;
            visitor.timeoutMetricsLog.push(url);
          }
        },
        getWinLoad: function getWinLoad() {
          if (this.d_winload == null) {
            // eslint-disable-line eqeqeq
            if (this.performanceTiming) {
              this.d_winload =
                this.windowLoad - this.performanceTiming.navigationStart;
            } else {
              this.d_winload = this.windowLoad - thisClass.codeLoadEnd;
            }
          }

          return this.d_winload;
        },
        millis: function millis() {
          return new Date().getTime();
        },
        process: function process(fieldGroup) {
          var fgo = this.fieldGroupObj[fieldGroup],
            metrics = {};
          metrics["d_visid_stg_timeout_captured"] =
            fgo.d_visid_stg_timeout_captured;
          metrics["d_visid_cors"] = fgo.d_visid_cors;
          metrics["d_fieldgroup"] = fieldGroup;
          metrics["d_settimeout_overriden"] = fgo.d_settimeout_overriden;

          if (fgo.timeout) {
            if (fgo.isActualTimeout) {
              metrics["d_visid_timedout"] = 1;
              metrics["d_visid_timeout"] = fgo.timeout - fgo.requestStart;
              metrics["d_visid_response"] = -1;
            } else {
              metrics["d_visid_timedout"] = "n/a";
              metrics["d_visid_timeout"] = "n/a";
              metrics["d_visid_response"] = "n/a";
            }
          } else {
            metrics["d_visid_timedout"] = 0;
            metrics["d_visid_timeout"] = -1;
            metrics["d_visid_response"] = fgo.requestEnd - fgo.requestStart;
          }

          metrics["d_visid_url"] = fgo.url;

          if (!thisClass.windowLoaded) {
            this.metricsQueue.push(metrics);
          } else {
            this.send(metrics);
          }

          delete this.fieldGroupObj[fieldGroup];
        },
        releaseMetricsQueue: function releaseMetricsQueue() {
          for (var i = 0, l = this.metricsQueue.length; i < l; i++) {
            this.send(this.metricsQueue[i]);
          }
        },
        getSetTimeoutOverriden: function getSetTimeoutOverriden() {
          if (typeof setTimeout.toString === "function") {
            if (setTimeout.toString().indexOf("[native code]") > -1) {
              return 0;
            } else {
              return 1;
            }
          }

          return -1;
        }
      };
      visitor._timeoutMetrics = _timeoutMetrics;
    }

    var _callStateTracker = {
      isClientSideMarketingCloudVisitorID: null,
      MCIDCallTimedOut: null,
      AnalyticsIDCallTimedOut: null,
      AAMIDCallTimedOut: null,
      fieldGroupObj: {},
      setState: function setState(fieldGroup, setToValue) {
        switch (fieldGroup) {
          case MC:
            if (setToValue === false) {
              if (this.MCIDCallTimedOut !== true) {
                this.MCIDCallTimedOut = false;
              }
            } else {
              this.MCIDCallTimedOut = setToValue;
            }

            break;

          case A:
            if (setToValue === false) {
              if (this.AnalyticsIDCallTimedOut !== true) {
                this.AnalyticsIDCallTimedOut = false;
              }
            } else {
              this.AnalyticsIDCallTimedOut = setToValue;
            }

            break;

          case AAM:
            if (setToValue === false) {
              if (this.AAMIDCallTimedOut !== true) {
                this.AAMIDCallTimedOut = false;
              }
            } else {
              this.AAMIDCallTimedOut = setToValue;
            }

            break;
        }
      }
    };
    /*********************************************************************
     * Function isClientSideMarketingCloudVisitorID()
     * Returns:
     *     boolean or null if the MC /id call hasn't been made yet
     *********************************************************************/

    visitor.isClientSideMarketingCloudVisitorID = function() {
      return _callStateTracker.isClientSideMarketingCloudVisitorID;
    };
    /*********************************************************************
     * Function MCIDCallTimedOut()
     * Returns:
     *     boolean or null if the call hasn't been made yet
     *********************************************************************/

    visitor.MCIDCallTimedOut = function() {
      return _callStateTracker.MCIDCallTimedOut;
    };
    /*********************************************************************
     * Function AnalyticsIDCallTimedOut()
     * Returns:
     *     boolean or null if the call hasn't been made yet
     *********************************************************************/

    visitor.AnalyticsIDCallTimedOut = function() {
      return _callStateTracker.AnalyticsIDCallTimedOut;
    };
    /*********************************************************************
     * Function AAMIDCallTimedOut()
     * Returns:
     *     boolean or null if the call hasn't been made yet
     *********************************************************************/

    visitor.AAMIDCallTimedOut = function() {
      return _callStateTracker.AAMIDCallTimedOut;
    };
    /*********************************************************************
     * Function idSyncGetOnPageSyncInfo() - get controller info for on page id syncs
     * Returns:
     *     string
     *********************************************************************/

    visitor.idSyncGetOnPageSyncInfo = function() {
      visitor._readVisitor();

      return visitor._getField(MCSYNCSOP);
    };
    /*********************************************************************
     * Function idSyncByURL(config) - manually fire an id sync with a custom url
     *
     * config.dpid - data provider id
     * config.url - custom url
     * config.minutesToLive - time until id sync is fired again
     *
     * Returns:
     *     string
     *********************************************************************/

    visitor.idSyncByURL = function(config) {
      // If opted out, won't fire id sync
      if (visitor.isOptedOut()) {
        return;
      }

      var validation = validateIdSyncByURL(config || {});

      if (validation.error) {
        return validation.error;
      }

      var url = config["url"],
        f = encodeURIComponent,
        dp = destinationPublishing,
        declaredIdString,
        a;
      url = url.replace(/^https:/, "").replace(/^http:/, ""); // First array element used to be declaredId.uuid

      declaredIdString = utils.encodeAndBuildRequest(
        ["", config["dpid"], config["dpuuid"] || ""],
        ","
      );
      a = [
        "ibs",
        f(config["dpid"]),
        "img",
        f(url),
        validation["ttl"],
        "",
        declaredIdString
      ];
      dp.addMessage(a.join("|"));
      dp.requestToProcess();
      return "Successfully queued";
    };

    function validateIdSyncByURL(config) {
      var DEFAULT_TTL = 20160,
        // 20160 minutes = 14 days
        ttl = config["minutesToLive"],
        error = "";

      if (visitor.idSyncDisableSyncs || visitor.disableIdSyncs) {
        // TODO Deprecate idSyncDisableSyncs.
        error = error ? error : "Error: id syncs have been disabled";
      }

      if (typeof config["dpid"] !== "string" || !config["dpid"].length) {
        error = error ? error : "Error: config.dpid is empty";
      }

      if (typeof config["url"] !== "string" || !config["url"].length) {
        error = error ? error : "Error: config.url is empty";
      }

      if (typeof ttl === "undefined") {
        ttl = DEFAULT_TTL;
      } else {
        ttl = parseInt(ttl, 10);

        if (isNaN(ttl) || ttl <= 0) {
          error = error
            ? error
            : "Error: config.minutesToLive needs to be a positive number";
        }
      }

      return {
        error: error,
        ttl: ttl
      };
    }
    /*********************************************************************
     * Function idSyncByDataSource(config) - manually fire an id sync with standard AAM url
     *
     * config.dpid - data provider id
     * config.dpuuid - data provider id for user
     * config.minutesToLive - time until id sync is fired again
     *
     * Returns:
     *     string
     *********************************************************************/

    visitor.idSyncByDataSource = function(config) {
      // If opted out, won't fire id sync
      if (visitor.isOptedOut()) {
        return;
      }

      if (
        config !== Object(config) ||
        typeof config["dpuuid"] !== "string" ||
        !config["dpuuid"].length
      ) {
        return "Error: config or config.dpuuid is empty";
      }

      config["url"] =
        "//dpm.demdex.net/ibs:dpid=" +
        config["dpid"] +
        "&dpuuid=" +
        config["dpuuid"];
      return visitor.idSyncByURL(config);
    };

    makePublishDestinations(visitor, destinationPublishing);

    visitor._getCookieVersion = function(amcvCookie) {
      amcvCookie = amcvCookie || visitor.cookieRead(visitor.cookieName);
      var versionMatches = constants.VERSION_REGEX.exec(amcvCookie);
      var vVersion =
        versionMatches && versionMatches.length > 1 ? versionMatches[1] : null;
      return vVersion;
    };

    visitor._resetAmcvCookie = function(beforeVersion) {
      var vVersion = visitor._getCookieVersion();

      if (!vVersion || version.isLessThan(vVersion, beforeVersion)) {
        helpers.removeCookie(visitor.cookieName);
      }
    };

    visitor.setAsCoopSafe = function() {
      isCoopSafe = true;
    };

    visitor.setAsCoopUnsafe = function() {
      isCoopSafe = false;
    };

    function shouldWaitForOptIn() {
      return visitor.configs.doesOptInApply
        ? !(adobe.optIn.isComplete && isOptInSafe())
        : false;
    }

    function isOptInSafe() {
      if (visitor.configs.doesOptInApply && visitor.configs.isIabContext) {
        return (
          adobe.optIn.isApproved(adobe.optIn.Categories.ECID) &&
          IAB_ACTION_COMPLETE
        );
      }

      return adobe.optIn.isApproved(adobe.optIn.Categories.ECID);
    }

    function applyInitConfig() {
      visitor.configs = Object.create(null);

      if (helpers.isObject(initConfig)) {
        for (var config in initConfig) {
          if (_isNOP(config)) {
            visitor[config] = initConfig[config]; // TODO Stop doing that eventually!

            visitor.configs[config] = initConfig[config]; // Organize all the configs for easier debugging.
          }
        }
      }
    } // Make sure we can create cookies, opt in has been approved...

    function guardApis() {
      // Tuple format: [apiName, returnValue ?]
      [
        ["getMarketingCloudVisitorID"],
        ["setCustomerIDs", undefined],
        ["getAnalyticsVisitorID"],
        ["getAudienceManagerLocationHint"],
        ["getLocationHint"],
        ["getAudienceManagerBlob"]
      ].forEach(function(tuple) {
        var apiName = tuple[0];
        var valueToReturn = tuple.length === 2 ? tuple[1] : "";
        var originalApi = visitor[apiName];

        visitor[apiName] = function(callback) {
          if (!isOptInSafe() || !visitor.isAllowed()) {
            if (typeof callback === "function") {
              visitor._callCallback(callback, [valueToReturn]);
            }

            return valueToReturn;
          }

          return originalApi.apply(visitor, arguments);
        };
      });
    }

    function triggerDCSCall() {
      var corsData = visitor._getAudienceManagerURLData(),
        url = corsData.url;

      return visitor._loadData(MC, url, null, corsData);
    }

    function fetchRejectedConsentCallback(error, consent) {
      IAB_ACTION_COMPLETE = true;

      if (error) {
        throw new Error("[IAB plugin] : " + error);
      } else if (consent && consent.gdprApplies) {
        CONSENT_STRING = consent.consentString;
        CONSENT_FLAG = consent.hasConsentChangedSinceLastCmpPull ? 1 : 0;
      }

      triggerDCSCall();
      unsubscribe();
    }

    function fetchConsentCallback(error, consent) {
      IAB_ACTION_COMPLETE = true;

      if (error) {
        throw new Error("[IAB plugin] : " + error);
      } else if (consent.gdprApplies) {
        CONSENT_STRING = consent.consentString;
        CONSENT_FLAG = consent.hasConsentChangedSinceLastCmpPull ? 1 : 0;
      }

      visitor.init();
      unsubscribe();
    }

    function fetchPermissionsCallback() {
      if (adobe.optIn.isComplete) {
        if (adobe.optIn.isApproved(adobe.optIn.Categories.ECID)) {
          if (visitor.configs.isIabContext) {
            // Retrieve `gdpr` and `gdpr_consent` from plugin:
            adobe.optIn.execute({
              command: "iabPlugin.fetchConsentData",
              callback: fetchConsentCallback
            });
          } else {
            visitor.init();
            unsubscribe();
          }
        } else if (visitor.configs.isIabContext) {
          // Retrieve `gdpr` and `gdpr_consent` from plugin:
          adobe.optIn.execute({
            command: "iabPlugin.fetchConsentData",
            callback: fetchRejectedConsentCallback
          });
        } else {
          guardApis();
          unsubscribe();
        }
      }
    }

    function unsubscribe() {
      adobe.optIn.off("complete", fetchPermissionsCallback);
    }

    applyInitConfig();
    guardApis();
    /* variable to make sure we run configs only once in an instance 
	    in case of opt-in pre approval */

    var ranConfig;
    /* Init */

    visitor.init = function() {
      // Short circuit if need to wait for OptIn:
      if (shouldWaitForOptIn()) {
        adobe.optIn.fetchPermissions(fetchPermissionsCallback, true);

        if (!adobe.optIn.isApproved(adobe.optIn.Categories.ECID)) {
          return;
        }
      }

      if (!ranConfig) {
        ranConfig = true;
        processConfigs();
        processIdSyncs();
        hookupChildListener();
      }

      function processConfigs() {
        if (helpers.isObject(initConfig)) {
          visitor.idSyncContainerID = visitor.idSyncContainerID || 0;
          isCoopSafe =
            typeof visitor.isCoopSafe === "boolean"
              ? visitor.isCoopSafe
              : helpers.parseBoolean(visitor.isCoopSafe); // Look for `initConfig.resetBeforeVersion` first thing. (MCID-236)

          if (visitor.resetBeforeVersion) {
            visitor._resetAmcvCookie(visitor.resetBeforeVersion);
          } // Internal initConfig options
          // _subdomain, _enableErrorReporting, _forceSyncIDCall, _doAttachIframe

          visitor._attemptToPopulateIdsFromUrl();

          visitor._attemptToPopulateSdidFromUrl();

          visitor._readVisitor();

          var idTS = visitor._getField(MCIDTS),
            nowTS = Math.ceil(new Date().getTime() / constants.MILLIS_PER_DAY);

          if (
            !visitor.idSyncDisableSyncs &&
            !visitor.disableIdSyncs &&
            destinationPublishing.canMakeSyncIDCall(idTS, nowTS)
          ) {
            // TODO Deprecate idSyncDisableSyncs.
            visitor._setFieldExpire(MCAAMB, -1);

            visitor._setField(MCIDTS, nowTS);
          }

          visitor.getMarketingCloudVisitorID();
          visitor.getAudienceManagerLocationHint();
          visitor.getAudienceManagerBlob();

          visitor._mergeServerState(visitor.serverState);
        } else {
          visitor._attemptToPopulateIdsFromUrl();

          visitor._attemptToPopulateSdidFromUrl();
        }
      }

      function processIdSyncs() {
        if (!visitor.idSyncDisableSyncs && !visitor.disableIdSyncs) {
          // TODO Deprecate idSyncDisableSyncs.
          destinationPublishing.checkDPIframeSrc();

          var attachIframeIfReady = function attachIframeIfReady() {
            var dp = destinationPublishing;

            if (dp.readyToAttachIframe()) {
              dp.attachIframe();
            }
          };

          w.addEventListener("load", function() {
            thisClass.windowLoaded = true;

            if (VISITOR_DEBUG) {
              _timeoutMetrics.windowLoad = _timeoutMetrics.millis();

              _timeoutMetrics.releaseMetricsQueue();
            }

            attachIframeIfReady();
          });

          try {
            crossDomain.receiveMessage(function(message) {
              destinationPublishing.receiveMessage(message.data);
            }, destinationPublishing.iframeHost);
          } catch (__Error__) {
            // Fail silently.
          }
        }
      }

      function hookupChildListener() {
        // Listen to messages from child Visitors living in iFrames:
        // TODO Get that child message listener off of the ChildVistior (Maybe a static method), this way
        // we can decouple Visitor and ChildVisitor fully, and place ChildVisitor in a separate Reactor extension.
        // When ChildVisitor is available, that means the extension has been installed and we can use the handler off of it.
        if (visitor.whitelistIframeDomains && constants.POST_MESSAGE_ENABLED) {
          visitor.whitelistIframeDomains =
            visitor.whitelistIframeDomains instanceof Array
              ? visitor.whitelistIframeDomains
              : [visitor.whitelistIframeDomains]; // We can use forEach since PostMessage is supported over here.

          visitor.whitelistIframeDomains.forEach(function(domain) {
            var message = new Message(marketingCloudOrgID, domain);
            var onMessageFromParent = makeChildMessageListener(
              visitor,
              message
            );
            crossDomain.receiveMessage(onMessageFromParent, domain);
          });
        }
      }
    };
  }; // Add static property config to visitor

  Visitor.config = visitorConfig; // Expose Visitor globally.

  commonjsGlobal.Visitor = Visitor;
  var Visitor_1 = Visitor;

  var normalizeInitConfig = function normalizeInitConfig(initConfig) {
    if (!utils.isObject(initConfig)) {
      return;
    }

    return Object.keys(initConfig)
      .filter(function(key) {
        return initConfig[key] !== "";
      })
      .reduce(function(configs, key) {
        // TODO: Clean this up by adding a normalize to configs items in visitorConfig.
        var normalized = visitorConfig.normalizeConfig(initConfig[key]);
        var normalizeForBoolean = utils.normalizeBoolean(normalized);
        configs[key] = normalizeForBoolean;
        return configs;
      }, Object.create(null));
  };

  var OptIn$2 = optIn.OptIn;
  var IabPlugin = optIn.IabPlugin;
  /*********************************************************************
   * Function getInstance(marketingCloudOrgID,initConfig): Finds instance for a marketingCloudOrgID
   *     marketingCloudOrgID = Marketing Cloud Organization ID to use
   *     initConfig          = Optional initial config object allowing the constructor to fire
   *                           off requests immediately instead of lazily
   * Returns:
   *     Instance
   *********************************************************************/

  Visitor_1.getInstance = function(marketingCloudOrgID, initConfig) {
    if (!marketingCloudOrgID) {
      throw new Error("Visitor requires Adobe Marketing Cloud Org ID.");
    }

    if (marketingCloudOrgID.indexOf("@") < 0) {
      marketingCloudOrgID += "@AdobeOrg";
    }

    function findInstance() {
      var instanceList = commonjsGlobal.s_c_il;

      if (instanceList) {
        for (
          var instanceNum = 0;
          instanceNum < instanceList.length;
          instanceNum++
        ) {
          var visitor = instanceList[instanceNum];

          if (
            visitor &&
            visitor._c === "Visitor" &&
            visitor.marketingCloudOrgID === marketingCloudOrgID
          ) {
            return visitor;
          }
        }
      }
    }

    function isChildFrame() {
      try {
        return commonjsGlobal.self !== commonjsGlobal.parent;
      } catch (ex) {
        // In some browsers, trying to access parent window will throw an exception.
        return true;
      }
    }

    function clearInstanceList() {
      // Remove the added Visitor instance that was used to test cookie creation,
      // And decrement the number of instances.
      commonjsGlobal.s_c_il.splice(--commonjsGlobal.s_c_in, 1);
    }

    function canCreateCookies(visitor) {
      var testCookieName = "TEST_AMCV_COOKIE";
      visitor.cookieWrite(testCookieName, "T", 1);

      if (visitor.cookieRead(testCookieName) === "T") {
        visitor._helpers.removeCookie(testCookieName);

        return true;
      }

      return false;
    } // Short circuit if we already have an instance for that ORG ID:

    var existingInstance = findInstance();

    if (existingInstance) {
      return existingInstance;
    } // Initialize Opt In.

    function setupOptIn(configs) {
      function instantiateOptIn() {
        var optInConfig = utils.pluck(configs, [
          "doesOptInApply",
          "previousPermissions",
          "preOptInApprovals",
          "isOptInStorageEnabled",
          "optInStorageExpiry",
          "isIabContext"
        ]);
        var optInCookieDomain =
          configs.optInCookieDomain || configs.cookieDomain;
        optInCookieDomain = optInCookieDomain || getDomain();
        optInCookieDomain =
          optInCookieDomain === window.location.hostname
            ? ""
            : optInCookieDomain;
        optInConfig.optInCookieDomain = optInCookieDomain;
        var optIn$$1 = new OptIn$2(optInConfig, {
          cookies: cookies
        });

        if (optInConfig.isIabContext && optInConfig.doesOptInApply) {
          var iabPlugin = new IabPlugin();
          optIn$$1.registerPlugin(iabPlugin);
        }

        return optIn$$1;
      }

      commonjsGlobal.adobe.optIn =
        commonjsGlobal.adobe.optIn || instantiateOptIn();
    }

    var normalizedInitConfig = normalizeInitConfig(initConfig);
    setupOptIn(normalizedInitConfig || {});
    var originalMarketingCloudOrgID = marketingCloudOrgID;
    var reversedOrgId = originalMarketingCloudOrgID
      .split("")
      .reverse()
      .join("");
    var tempVisitor = new Visitor_1(marketingCloudOrgID, null, reversedOrgId);

    if (
      utils.isObject(normalizedInitConfig) &&
      normalizedInitConfig.cookieDomain
    ) {
      tempVisitor.cookieDomain = normalizedInitConfig.cookieDomain;
    }

    clearInstanceList(); // 1. If IE 6, 7, 8, or 9, replace all APIs in tempVisitor with noop and return that.
    // 2. If in a cross domain iFrame, return a child visitor.
    // 3. Else, return a full version of visitor.

    var ieVersion = utils.getIeVersion();
    var isIeLessThanTen = typeof ieVersion === "number" && ieVersion < 10;

    if (isIeLessThanTen) {
      // Short circuit because we don't support IE 6, 7, 8, 9, Quirks Mode. Don't init Visitor.
      return tempVisitor._helpers.replaceMethodsWithFunction(
        tempVisitor,
        function() {}
      );
    }

    var visitor =
      isChildFrame() && !canCreateCookies(tempVisitor) && commonjsGlobal.parent
        ? new ChildVisitor(
            marketingCloudOrgID,
            normalizedInitConfig,
            tempVisitor,
            commonjsGlobal.parent
          )
        : new Visitor_1(
            marketingCloudOrgID,
            normalizedInitConfig,
            reversedOrgId
          );
    tempVisitor = null;
    visitor.init();
    return visitor;
  };

  function setLoadTime() {
    function loadCallback() {
      Visitor_1.windowLoaded = true;
    }

    if (commonjsGlobal.addEventListener) {
      commonjsGlobal.addEventListener("load", loadCallback);
    } else if (commonjsGlobal.attachEvent) {
      commonjsGlobal.attachEvent("onload", loadCallback);
    }

    Visitor_1.codeLoadEnd = new Date().getTime();
  }

  setLoadTime();
  var bootstrap = Visitor_1;

  return bootstrap;
})();
