(function() {
  window._satellite = window._satellite || {};
  window._satellite.container = {
  "buildInfo": {
    "buildDate": "2020-09-25T16:12:13Z",
    "environment": "production",
    "turbineBuildDate": "2020-08-10T20:14:17Z",
    "turbineVersion": "27.0.0"
  },
  "dataElements": {
  },
  "extensions": {
    "adobe-target-v2": {
      "displayName": "Adobe Target v2",
      "modules": {
        "adobe-target-v2/lib/loadTarget.js": {
          "name": "load-target",
          "displayName": "Load Target",
          "script": function(module, exports, require, turbine) {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */
var win = require("@adobe/reactor-window");
var doc = require("@adobe/reactor-document");
var Promise = require("@adobe/reactor-promise");

var _require = require("./modules/load-target"),
    initLibrarySettings = _require.initLibrarySettings,
    overridePublicApi = _require.overridePublicApi;

var _require2 = require("./modules/event-util"),
    addEventListener = _require2.addEventListener,
    removeEventListener = _require2.removeEventListener;

var _require3 = require("./modules/optin"),
    shouldUseOptIn = _require3.shouldUseOptIn,
    isTargetApproved = _require3.isTargetApproved;

var _require4 = require("./targetSettings"),
    extensionSettings = _require4.extensionSettings;

var augmentTracker = turbine.getSharedModule("adobe-analytics", "augment-tracker");
var REQUEST_SUCCEEDED = "at-request-succeeded";
var REQUEST_FAILED = "at-request-failed";

function handleTracker(tracker, promise) {
  return new Promise(function (resolve) {
    if (!tracker) {
      resolve();
      return;
    }

    promise.then(function (abortPromise) {
      if (abortPromise) {
        tracker.abort = true;
      }
      resolve();
    });
  });
}

function requestHandler(func) {
  if (!func) {
    return;
  }

  var promise = new Promise(function (resolve) {
    var timerId = setTimeout(function () {
      resolve(false);
    }, extensionSettings.targetSettings.timeout);

    var requestSuccess = function requestSuccess(e) {
      if (e.detail && e.detail.redirect === true) {
        resolve(true);
      } else {
        resolve(false);
      }

      clearTimeout(timerId);
      removeEventListener(doc, e, requestSuccess);
    };
    var requestFail = function requestFail(e) {
      resolve(false);
      clearTimeout(timerId);
      removeEventListener(doc, e, requestFail);
    };

    addEventListener(doc, REQUEST_SUCCEEDED, requestSuccess);
    addEventListener(doc, REQUEST_FAILED, requestFail);
  });

  func(function (tracker) {
    return handleTracker(tracker, promise);
  });
}

module.exports = function () {
  var targetSettings = initLibrarySettings();

  if (!targetSettings) {
    overridePublicApi(win);
    return;
  }

  if (!targetSettings.enabled) {
    overridePublicApi(win);
    return;
  }

  var _require5 = require("./modules/libs/at-launch"),
      init = _require5.init; //eslint-disable-line

  init(win, doc, targetSettings);

  if (!shouldUseOptIn() || isTargetApproved()) {
    requestHandler(augmentTracker);
  }
};
          }

        },
        "adobe-target-v2/lib/firePageLoad.js": {
          "name": "fire-page-load",
          "displayName": "Fire Page Load Request",
          "script": function(module, exports, require, turbine) {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */
var win = require("@adobe/reactor-window");

var _require = require("./modules/libs/at-launch"),
    initConfig = _require.initConfig,
    initDelivery = _require.initDelivery;

var initPageLoadSettings = require("./modules/page-load");
var messages = require("./messages");

function isLibraryPresent() {
  return win.adobe && win.adobe.target && win.adobe.target.VERSION;
}

module.exports = function (settings) {
  var targetSettings = initPageLoadSettings(settings);

  if (!isLibraryPresent()) {
    if (win.console) {
      turbine.logger.warn(messages.NO_REQUEST);
    }

    return;
  }

  initConfig(targetSettings);
  initDelivery();
};
          }

        },
        "adobe-target-v2/lib/modules/load-target.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */
var win = require("@adobe/reactor-window");
var doc = require("@adobe/reactor-document");
var Promise = require("@adobe/reactor-promise");
var messages = require("../messages");

var _require = require("./params-store"),
    getParams = _require.getParams,
    getPageLoadParams = _require.getPageLoadParams;

var _require2 = require("../targetSettings"),
    targetSettings = _require2.targetSettings;

var overrideProps = require("./object-override");

var _require3 = require("../librarySettings"),
    TARGET_DEFAULT_SETTINGS = _require3.TARGET_DEFAULT_SETTINGS;

var OVERRIDABLE_SETTINGS = ["enabled", "clientCode", "imsOrgId", "serverDomain", "cookieDomain", "timeout", "defaultContentHiddenStyle", "defaultContentVisibleStyle", "bodyHiddenStyle", "bodyHidingEnabled", "selectorsPollingTimeout", "visitorApiTimeout", "overrideMboxEdgeServer", "overrideMboxEdgeServerTimeout", "optoutEnabled", "optinEnabled", "secureOnly", "supplementalDataIdParamTimeout", "authoringScriptUrl", "urlSizeLimit", "endpoint", "pageLoadEnabled", "viewsEnabled", "analyticsLogging", "serverState", "globalMboxName"];

function isStandardMode(document) {
  var compatMode = document.compatMode,
      documentMode = document.documentMode;

  var standardMode = compatMode && compatMode === "CSS1Compat";
  var ie9OrModernBrowser = documentMode ? documentMode >= 9 : true;

  return standardMode && ie9OrModernBrowser;
}

function overridePublicApi(window) {
  /* eslint-disable no-param-reassign */
  var noop = function noop() {};
  var noopPromise = function noopPromise() {
    return Promise.resolve();
  };
  window.adobe = window.adobe || {};
  window.adobe.target = {
    VERSION: "",
    event: {},
    getOffer: noop,
    getOffers: noopPromise,
    applyOffer: noop,
    applyOffers: noopPromise,
    sendNotifications: noop,
    trackEvent: noop,
    triggerView: noop,
    registerExtension: noop,
    init: noop
  };
  window.mboxCreate = noop;
  window.mboxDefine = noop;
  window.mboxUpdate = noop;
  /* eslint-disable no-param-reassign */
}

function isLibraryPresent() {
  return win.adobe && win.adobe.target && typeof win.adobe.target.getOffer !== "undefined";
}

function initLibrarySettings() {
  if (isLibraryPresent()) {
    turbine.logger.warn(messages.ALREADY_INITIALIZED);
    return null;
  }

  targetSettings.mboxParams = getParams();
  targetSettings.globalMboxParams = getPageLoadParams();

  overrideProps(targetSettings, win.targetGlobalSettings || {}, OVERRIDABLE_SETTINGS);
  overrideProps(targetSettings, TARGET_DEFAULT_SETTINGS || {}, ["version"]);

  if (!isStandardMode(doc)) {
    targetSettings.enabled = false;

    turbine.logger.warn(messages.DELIVERY_DISABLED);
  }

  return targetSettings;
}

module.exports = {
  initLibrarySettings: initLibrarySettings,
  overridePublicApi: overridePublicApi
};
          }

        },
        "adobe-target-v2/lib/modules/event-util.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

function addEventListener(elem, type, handler) {
  elem.addEventListener(type, handler);
}

function removeEventListener(elem, type, handler) {
  elem.removeEventListener(type, handler);
}

module.exports = {
  addEventListener: addEventListener,
  removeEventListener: removeEventListener
};
          }

        },
        "adobe-target-v2/lib/modules/optin.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* eslint-disable import/no-extraneous-dependencies */
var win = require("@adobe/reactor-window");

var ADOBE = win.adobe;
var IS_APPROVED = "isApproved";
var OPTIN_ENABLED = "optinEnabled";
var OPT_IN = "optIn";
var FETCH_PERMISSIONS = "fetchPermissions";
var CATEGORIES = "Categories";
var TARGET = "TARGET";

var _require = require("../targetSettings"),
    targetSettings = _require.targetSettings;

function isNil(value) {
  var type = typeof value === "undefined" ? "undefined" : _typeof(value);
  return type === "undefined" || value === null;
}
function isFunction(value) {
  var type = typeof value === "undefined" ? "undefined" : _typeof(value);
  return value !== null && (type === "object" || type === "function");
}

function isOptInAPIAvailable(optIn) {
  return isFunction(optIn[FETCH_PERMISSIONS]) && isFunction(optIn[IS_APPROVED]);
}

function optInEnabled(adobe, optedInEnabled) {
  if (!optedInEnabled) {
    return false;
  }
  if (isNil(adobe)) {
    return false;
  }
  if (isNil(adobe[OPT_IN])) {
    return false;
  }
  return isOptInAPIAvailable(adobe[OPT_IN]);
}

function isCategoryOptedIn(optInApi, category) {
  return optInApi[IS_APPROVED](category);
}

function isTargetApproved() {
  var optInApi = ADOBE[OPT_IN];
  var targetCategory = optInApi[CATEGORIES][TARGET];
  return isCategoryOptedIn(optInApi, targetCategory);
}

function shouldUseOptIn() {
  var optedInEnabled = targetSettings[OPTIN_ENABLED];
  return optInEnabled(ADOBE, optedInEnabled);
}

module.exports = {
  shouldUseOptIn: shouldUseOptIn,
  isTargetApproved: isTargetApproved
};
          }

        },
        "adobe-target-v2/lib/targetSettings.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

var extensionSettings = turbine.getExtensionSettings();
var targetSettings = extensionSettings.targetSettings || {};

module.exports = {
  extensionSettings: extensionSettings,
  targetSettings: targetSettings
};
          }

        },
        "adobe-target-v2/lib/modules/libs/at-launch.js": {
          "script": function(module, exports, require, turbine) {
/**
 * @license
 * at.js 2.3.2 | (c) Adobe Systems Incorporated | All rights reserved
 * zepto.js | (c) 2010-2016 Thomas Fuchs | zeptojs.com/license
 */
"use strict";

var define;

function _interopDefault(ex) {
  return ex && typeof ex === "object" && "default" in ex ? ex["default"] : ex;
}

var window$1 = require("@adobe/reactor-window");
var document$1 = require("@adobe/reactor-document");
var assign = _interopDefault(require("@adobe/reactor-object-assign"));
var cookie = _interopDefault(require("@adobe/reactor-cookie"));
var queryString = _interopDefault(require("@adobe/reactor-query-string"));
var Promise = _interopDefault(require("@adobe/reactor-promise"));
var loadScript = _interopDefault(require("@adobe/reactor-load-script"));

function delay(func) {
  var wait =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return setTimeout(func, Number(wait) || 0);
}
function cancelDelay(id) {
  clearTimeout(id);
}

function isNil(value) {
  return value == null;
}

var isArray = Array.isArray;

var objectProto = Object.prototype;
var nativeObjectToString = objectProto.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
function baseGetTag(value) {
  return objectToString(value);
}

function _typeof(obj) {
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

function isObject(value) {
  var type = _typeof(value);
  var notNull = value != null;
  return notNull && (type === "object" || type === "function");
}

var funcTag = "[object Function]";
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  return baseGetTag(value) === funcTag;
}

function identity(value) {
  return value;
}

function castFunction(value) {
  return isFunction(value) ? value : identity;
}

function keys(object) {
  if (isNil(object)) {
    return [];
  }
  return Object.keys(object);
}

var arrayEach = function arrayEach(iteratee, collection) {
  return collection.forEach(iteratee);
};

var baseEach = function baseEach(iteratee, collection) {
  arrayEach(function(key) {
    return iteratee(collection[key], key);
  }, keys(collection));
};

var arrayFilter = function arrayFilter(predicate, collection) {
  return collection.filter(predicate);
};
var baseFilter = function baseFilter(predicate, collection) {
  var result = {};
  baseEach(function(value, key) {
    if (predicate(value, key)) {
      result[key] = value;
    }
  }, collection);
  return result;
};
function filter(predicate, collection) {
  if (isNil(collection)) {
    return [];
  }
  var func = isArray(collection) ? arrayFilter : baseFilter;
  return func(castFunction(predicate), collection);
}

function first(array) {
  return array && array.length ? array[0] : undefined;
}

function flatten(array) {
  if (isNil(array)) {
    return [];
  }
  return [].concat.apply([], array);
}

function flow(funcs) {
  var _this = this;
  var length = funcs ? funcs.length : 0;
  var index = length;
  while ((index -= 1)) {
    if (!isFunction(funcs[index])) {
      throw new TypeError("Expected a function");
    }
  }
  return function() {
    var i = 0;
    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key];
    }
    var result = length ? funcs[i].apply(_this, args) : args[0];
    while ((i += 1) < length) {
      result = funcs[i].call(_this, result);
    }
    return result;
  };
}

function forEach(iteratee, collection) {
  if (isNil(collection)) {
    return;
  }
  var func = isArray(collection) ? arrayEach : baseEach;
  func(castFunction(iteratee), collection);
}

function isObjectLike(value) {
  var notNull = value != null;
  return notNull && _typeof(value) === "object";
}

var stringTag = "[object String]";
function isString(value) {
  return (
    typeof value === "string" ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) === stringTag)
  );
}

function hash(string) {
  if (!isString(string)) {
    return -1;
  }
  var result = 0;
  var length = string.length;
  for (var i = 0; i < length; i += 1) {
    result = ((result << 5) - result + string.charCodeAt(i)) & 0xffffffff;
  }
  return result;
}

var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return (
    typeof value === "number" &&
    value > -1 &&
    value % 1 === 0 &&
    value <= MAX_SAFE_INTEGER
  );
}

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

var arrayMap = function arrayMap(iteratee, collection) {
  return collection.map(iteratee);
};

function baseValues(props, object) {
  return arrayMap(function(key) {
    return object[key];
  }, props);
}
function copyArray(source) {
  var index = 0;
  var length = source.length;
  var array = Array(length);
  while (index < length) {
    array[index] = source[index];
    index += 1;
  }
  return array;
}
function stringToArray(str) {
  return str.split("");
}
function toArray(value) {
  if (isNil(value)) {
    return [];
  }
  if (isArrayLike(value)) {
    return isString(value) ? stringToArray(value) : copyArray(value);
  }
  return baseValues(keys(value), value);
}

var objectProto$1 = Object.prototype;
var hasOwnProperty = objectProto$1.hasOwnProperty;
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (
    isArrayLike(value) &&
    (isArray(value) || isString(value) || isFunction(value.splice))
  ) {
    return !value.length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

var stringProto = String.prototype;
var nativeStringTrim = stringProto.trim;
function trim(string) {
  return isNil(string) ? "" : nativeStringTrim.call(string);
}

function isBlank(value) {
  return isString(value) ? !trim(value) : isEmpty(value);
}

var objectTag = "[object Object]";
var funcProto = Function.prototype;
var objectProto$2 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function getPrototype(value) {
  return Object.getPrototypeOf(Object(value));
}
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$1.call(proto, "constructor") && proto.constructor;
  return (
    typeof Ctor === "function" &&
    Ctor instanceof Ctor &&
    funcToString.call(Ctor) === objectCtorString
  );
}

function isElement(value) {
  return isObjectLike(value) && value.nodeType === 1 && !isPlainObject(value);
}

var isNotBlank = function isNotBlank(value) {
  return !isBlank(value);
};

var numberTag = "[object Number]";
function isNumber(value) {
  return (
    typeof value === "number" ||
    (isObjectLike(value) && baseGetTag(value) === numberTag)
  );
}

function join(joiner, collection) {
  if (!isArray(collection)) {
    return "";
  }
  return collection.join(joiner || "");
}

var baseMap = function baseMap(iteratee, collection) {
  var result = {};
  baseEach(function(value, key) {
    result[key] = iteratee(value, key);
  }, collection);
  return result;
};
function map(iteratee, collection) {
  if (isNil(collection)) {
    return [];
  }
  var func = isArray(collection) ? arrayMap : baseMap;
  return func(castFunction(iteratee), collection);
}

function noop() {}

function now() {
  return new Date().getTime();
}

var arrayReduce = function arrayReduce(iteratee, accumulator, collection) {
  return collection.reduce(iteratee, accumulator);
};
var baseReduce = function baseReduce(iteratee, accumulator, collection) {
  var localAcc = accumulator;
  baseEach(function(value, key) {
    localAcc = iteratee(localAcc, value, key);
  }, collection);
  return localAcc;
};
function reduce(iteratee, accumulator, collection) {
  if (isNil(collection)) {
    return accumulator;
  }
  var func = isArray(collection) ? arrayReduce : baseReduce;
  return func(castFunction(iteratee), accumulator, collection);
}

var arrayProto = Array.prototype;
var nativeReverse = arrayProto.reverse;
function reverse(array) {
  return array == null ? array : nativeReverse.call(array);
}

function split(separator, string) {
  if (isBlank(string)) {
    return [];
  }
  return string.split(separator || "");
}

function random(lower, upper) {
  return lower + Math.floor(Math.random() * (upper - lower + 1));
}
function uuid() {
  var d = now();
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + random(0, 16)) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

var TYPE = "type";
var CONTENT = "content";
var HEIGHT = "height";
var WIDTH = "width";
var LEFT = "left";
var TOP = "top";
var FROM = "from";
var TO = "to";
var PRIORITY = "priority";
var SELECTOR = "selector";
var CSS_SELECTOR = "cssSelector";
var SET_HTML = "setHtml";
var SET_CONTENT = "setContent";
var SET_TEXT = "setText";
var SET_JSON = "setJson";
var SET_ATTRIBUTE = "setAttribute";
var SET_IMAGE_SOURCE = "setImageSource";
var SET_STYLE = "setStyle";
var REARRANGE = "rearrange";
var RESIZE = "resize";
var MOVE = "move";
var REMOVE = "remove";
var CUSTOM_CODE = "customCode";
var REDIRECT = "redirect";
var TRACK_CLICK = "trackClick";
var SIGNAL_CLICK = "signalClick";
var INSERT_BEFORE = "insertBefore";
var INSERT_AFTER = "insertAfter";
var APPEND_HTML = "appendHtml";
var APPEND_CONTENT = "appendContent";
var PREPEND_HTML = "prependHtml";
var PREPEND_CONTENT = "prependContent";
var REPLACE_HTML = "replaceHtml";
var REPLACE_CONTENT = "replaceContent";
var DEBUG = "mboxDebug";
var DISABLE = "mboxDisable";
var AUTHORING = "mboxEdit";
var CHECK = "at_check";
var TRUE = "true";
var MBOX_LENGTH = 250;
var DATA_SRC = "data-at-src";
var JSON$1 = "json";
var HTML = "html";
var DYNAMIC = "dynamic";
var SCRIPT = "script";
var SRC = "src";
var ID = "id";
var CLASS = "class";
var CLICK = "click";
var HEAD_TAG = "head";
var SCRIPT_TAG = "script";
var STYLE_TAG = "style";
var LINK_TAG = "link";
var IMAGE_TAG = "img";
var DIV_TAG = "div";
var DELIVERY_DISABLED =
  'Adobe Target content delivery is disabled. Ensure that you can save cookies to your current domain, there is no "mboxDisable" cookie and there is no "mboxDisable" parameter in query string.';
var ALREADY_INITIALIZED = "Adobe Target has already been initialized.";
var OPTIONS_REQUIRED = "options argument is required";
var REQUEST_REQUIRED = "request option is required";
var RESPONE_REQUIRED = "response option is required";
var EXECUTE_OR_PREFETCH_REQUIRED = "execute or prefetch is required";
var EXECUTE_OR_PREFETCH_NOT_ALLOWED = "execute or prefetch is not allowed";
var NOTIFICATIONS_REQUIRED = "notifications are required";
var MBOX_REQUIRED = "mbox option is required";
var MBOX_TOO_LONG = "mbox option is too long";
var SUCCESS_REQUIRED = "success option is required";
var ERROR_REQUIRED = "error option is required";
var OFFER_REQUIRED = "offer option is required";
var UNEXPECTED_ERROR = "Unexpected error";
var REQUEST_FAILED = "request failed";
var REQUEST_SUCCEEDED = "request succeeded";
var ACTION_RENDERED = "Action rendered successfully";
var ACTION_RENDERING = "Rendering action";
var EMPTY_CONTENT = "Action has no content";
var EMPTY_ATTRIBUTE = "Action has no attributes";
var EMPTY_PROPERTY = "Action has no CSS properties";
var EMPTY_SIZES = "Action has no height or width";
var EMPTY_COORDINATES = "Action has no left, top or position";
var EMPTY_REARRANGE = "Action has no from or to";
var EMPTY_URL = "Action has no url";
var EMPTY_IMAGE_URL = "Action has no image url";
var REARRANGE_MISSING = "Rearrange elements are missing";
var LOADING_IMAGE = "Loading image";
var TRACK_EVENT_SUCCESS = "Track event request succeeded";
var TRACK_EVENT_ERROR = "Track event request failed";
var NO_ACTIONS = "No actions to be rendered";
var REDIRECT_ACTION = "Redirect action";
var REMOTE_SCRIPT = "Script load";
var ERROR = "error";
var WARNING = "warning";
var UNKNOWN = "unknown";
var VALID = "valid";
var SUCCESS = "success";
var RENDER = "render";
var METRIC = "metric";
var MBOX = "mbox";
var OFFER = "offer";
var NAME = "name";
var STATUS = "status";
var PARAMS = "params";
var ACTIONS = "actions";
var RESPONSE_TOKENS = "responseTokens";
var DATA = "data";
var RESPONSE = "response";
var REQUEST = "request";
var PROVIDER = "provider";
var PAGE_LOAD = "pageLoad";
var FLICKER_CONTROL_CLASS = "at-flicker-control";
var MARKER_CSS_CLASS = "at-element-marker";
var CLICK_TRACKING_CSS_CLASS = "at-element-click-tracking";
var ENABLED = "enabled";
var CLIENT_CODE = "clientCode";
var IMS_ORG_ID = "imsOrgId";
var SERVER_DOMAIN = "serverDomain";
var TIMEOUT = "timeout";
var GLOBAL_MBOX_NAME = "globalMboxName";
var GLOBAL_MBOX_AUTO_CREATE = "globalMboxAutoCreate";
var VERSION = "version";
var DEFAULT_CONTENT_HIDDEN_STYLE = "defaultContentHiddenStyle";
var DEFAULT_CONTENT_VISIBLE_STYLE = "defaultContentVisibleStyle";
var BODY_HIDDEN_STYLE = "bodyHiddenStyle";
var BODY_HIDING_ENABLED = "bodyHidingEnabled";
var DEVICE_ID_LIFETIME = "deviceIdLifetime";
var SESSION_ID_LIFETIME = "sessionIdLifetime";
var SELECTORS_POLLING_TIMEOUT = "selectorsPollingTimeout";
var VISITOR_API_TIMEOUT = "visitorApiTimeout";
var OVERRIDE_MBOX_EDGE_SERVER = "overrideMboxEdgeServer";
var OVERRIDE_MBOX_EDGE_SERVER_TIMEOUT = "overrideMboxEdgeServerTimeout";
var OPTOUT_ENABLED = "optoutEnabled";
var SECURE_ONLY = "secureOnly";
var SUPPLEMENTAL_DATA_ID_PARAM_TIMEOUT = "supplementalDataIdParamTimeout";
var AUTHORING_SCRIPT_URL = "authoringScriptUrl";
var SCHEME = "scheme";
var COOKIE_DOMAIN = "cookieDomain";
var MBOX_PARAMS = "mboxParams";
var GLOBAL_MBOX_PARAMS = "globalMboxParams";
var URL_SIZE_LIMIT = "urlSizeLimit";
var SESSION_ID_PARAM = "mboxSession";
var DEVICE_ID_COOKIE = "PC";
var EDGE_CLUSTER_COOKIE = "mboxEdgeCluster";
var SESSION_ID_COOKIE = "session";
var TRACES_SUFFIX = "Traces";
var SETTINGS = "settings";
var CLIENT_TRACES = "client" + TRACES_SUFFIX;
var SERVER_TRACES = "server" + TRACES_SUFFIX;
var TRACES = "___target_traces";
var GLOBAL_SETTINGS = "targetGlobalSettings";
var DATA_PROVIDER = "dataProvider";
var DATA_PROVIDERS = DATA_PROVIDER + "s";
var ENDPOINT = "endpoint";
var VIEWS_ENABLED = "viewsEnabled";
var PAGE_LOAD_ENABLED = "pageLoadEnabled";
var AUTH_STATE = "authState";
var AUTHENTICATED_STATE = "authenticatedState";
var INTEGRATION_CODE = "integrationCode";
var PAGE = "page";
var VIEW = "view";
var VIEWS = "views";
var OPTIONS = "options";
var METRICS = "metrics";
var VIEW_NAME = "viewName";
var DISPLAY_EVENT = "display";
var CONTENT_TYPE = "Content-Type";
var TEXT_PLAIN = "text/plain";
var RENDERING_VIEW_FAILED = "View rendering failed";
var VIEW_DELIVERY_ERROR = "View delivery error";
var VIEW_NAME_ERROR = "View name should be a non-empty string";
var PAGE_LOAD_DISABLED = "Page load disabled";
var USING_SERVER_STATE = "Using server state";
var ADOBE = "adobe";
var OPTIN = "optIn";
var IS_APPROVED = "isApproved";
var FETCH_PERMISSIONS = "fetchPermissions";
var CATEGORIES = "Categories";
var TARGET = "TARGET";
var ANALYTICS = "ANALYTICS";
var OPTIN_ENABLED = "optinEnabled";
var ERROR_TARGET_NOT_OPTED_IN = "Adobe Target is not opted in";
var ANALYTICS_LOGGING = "analyticsLogging";
var SERVER_STATE = "serverState";
var CSP_SCRIPT_NONCE = "cspScriptNonce";
var CSP_STYLE_NONCE = "cspStyleNonce";
var CACHE_UPDATED_EVENT = "cache-updated-event";
var NO_OFFERS_EVENT = "no-offers-event";
var REDIRECT_OFFER_EVENT = "redirect-offer-event";

var FILE_PROTOCOL = "file:";
var IP_V4_REGEX = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
var STANDARD_DOMAIN_REGEX = /^(com|edu|gov|net|mil|org|nom|co|name|info|biz)$/i;
var config = {};
var OVERRIDABLE_SETTINGS = [
  ENABLED,
  CLIENT_CODE,
  IMS_ORG_ID,
  SERVER_DOMAIN,
  COOKIE_DOMAIN,
  TIMEOUT,
  MBOX_PARAMS,
  GLOBAL_MBOX_PARAMS,
  DEFAULT_CONTENT_HIDDEN_STYLE,
  DEFAULT_CONTENT_VISIBLE_STYLE,
  DEVICE_ID_LIFETIME,
  BODY_HIDDEN_STYLE,
  BODY_HIDING_ENABLED,
  SELECTORS_POLLING_TIMEOUT,
  VISITOR_API_TIMEOUT,
  OVERRIDE_MBOX_EDGE_SERVER,
  OVERRIDE_MBOX_EDGE_SERVER_TIMEOUT,
  OPTOUT_ENABLED,
  OPTIN_ENABLED,
  SECURE_ONLY,
  SUPPLEMENTAL_DATA_ID_PARAM_TIMEOUT,
  AUTHORING_SCRIPT_URL,
  URL_SIZE_LIMIT,
  ENDPOINT,
  PAGE_LOAD_ENABLED,
  VIEWS_ENABLED,
  ANALYTICS_LOGGING,
  SERVER_STATE,
  CSP_SCRIPT_NONCE,
  CSP_STYLE_NONCE,
  GLOBAL_MBOX_NAME
];
function overrideSettingsIfRequired(settings, globalSettings) {
  if (!settings[ENABLED]) {
    return;
  }
  if (!isNil(globalSettings[GLOBAL_MBOX_AUTO_CREATE])) {
    settings[PAGE_LOAD_ENABLED] = globalSettings[GLOBAL_MBOX_AUTO_CREATE];
  }
  forEach(function(field) {
    if (!isNil(globalSettings[field])) {
      settings[field] = globalSettings[field];
    }
  }, OVERRIDABLE_SETTINGS);
}
function isIE10OrModernBrowser(doc) {
  var documentMode = doc.documentMode;
  return documentMode ? documentMode >= 10 : true;
}
function isStandardMode(doc) {
  var compatMode = doc.compatMode;
  return compatMode && compatMode === "CSS1Compat";
}
function isIPv4(domain) {
  return IP_V4_REGEX.test(domain);
}
function getCookieDomain(domain) {
  if (isIPv4(domain)) {
    return domain;
  }
  var parts = reverse(split(".", domain));
  var len = parts.length;
  if (len >= 3) {
    if (STANDARD_DOMAIN_REGEX.test(parts[1])) {
      return parts[2] + "." + parts[1] + "." + parts[0];
    }
  }
  if (len === 1) {
    return parts[0];
  }
  return parts[1] + "." + parts[0];
}
function overrideFromGlobalSettings(win, doc, settings) {
  var fileProtocol = win.location.protocol === FILE_PROTOCOL;
  var cookieDomain = "";
  if (!fileProtocol) {
    cookieDomain = getCookieDomain(win.location.hostname);
  }
  settings[COOKIE_DOMAIN] = cookieDomain;
  settings[ENABLED] = isStandardMode(doc) && isIE10OrModernBrowser(doc);
  overrideSettingsIfRequired(settings, win[GLOBAL_SETTINGS] || {});
}
function initConfig(settings) {
  overrideFromGlobalSettings(window$1, document$1, settings);
  var fileProtocol = window$1.location.protocol === FILE_PROTOCOL;
  config = assign({}, settings);
  config[DEVICE_ID_LIFETIME] = settings[DEVICE_ID_LIFETIME] / 1000;
  config[SESSION_ID_LIFETIME] = settings[SESSION_ID_LIFETIME] / 1000;
  config[SCHEME] = config[SECURE_ONLY] || fileProtocol ? "https:" : "";
}
function getConfig() {
  return config;
}

var parseUri = function parseURI(str, opts) {
  opts = opts || {};
  var o = {
    key: [
      "source",
      "protocol",
      "authority",
      "userInfo",
      "user",
      "password",
      "host",
      "port",
      "relative",
      "path",
      "directory",
      "file",
      "query",
      "anchor"
    ],
    q: {
      name: "queryKey",
      parser: /(?:^|&)([^&=]*)=?([^&]*)/g
    },
    parser: {
      strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    }
  };
  var m = o.parser[opts.strictMode ? "strict" : "loose"].exec(str);
  var uri = {};
  var i = 14;
  while (i--) uri[o.key[i]] = m[i] || "";
  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });
  return uri;
};

var parse = queryString.parse,
  stringify = queryString.stringify;
var ANCHOR = document$1.createElement("a");
var CACHE = {};
function parseQueryString(value) {
  try {
    return parse(value);
  } catch (e) {
    return {};
  }
}
function stringifyQueryString(value) {
  try {
    return stringify(value);
  } catch (e) {
    return "";
  }
}
function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}
function encode(value) {
  try {
    return encodeURIComponent(value);
  } catch (e) {
    return value;
  }
}
function parseUri$1(url) {
  if (CACHE[url]) {
    return CACHE[url];
  }
  ANCHOR.href = url;
  var parsedUri = parseUri(ANCHOR.href);
  parsedUri.queryKey = parseQueryString(parsedUri.query);
  CACHE[url] = parsedUri;
  return CACHE[url];
}

var getCookie = cookie.get,
  setCookie = cookie.set,
  removeCookie = cookie.remove;
var MBOX_COOKIE = "mbox";
function createCookie(name, value, expires) {
  return {
    name: name,
    value: value,
    expires: expires
  };
}
function deserialize(str) {
  var parts = split("#", str);
  if (isEmpty(parts) || parts.length < 3) {
    return null;
  }
  if (isNaN(parseInt(parts[2], 10))) {
    return null;
  }
  return createCookie(decode(parts[0]), decode(parts[1]), Number(parts[2]));
}
function getInternalCookies(cookieValue) {
  if (isBlank(cookieValue)) {
    return [];
  }
  return split("|", cookieValue);
}
function readCookies() {
  var cookies = map(deserialize, getInternalCookies(getCookie(MBOX_COOKIE)));
  var nowInSeconds = Math.ceil(now() / 1000);
  var isExpired = function isExpired(val) {
    return isObject(val) && nowInSeconds <= val.expires;
  };
  return reduce(
    function(acc, val) {
      acc[val.name] = val;
      return acc;
    },
    {},
    filter(isExpired, cookies)
  );
}

function getTargetCookie(name) {
  var cookiesMap = readCookies();
  var cookie = cookiesMap[name];
  return isObject(cookie) ? cookie.value : "";
}
function serialize(cookie) {
  return join("#", [encode(cookie.name), encode(cookie.value), cookie.expires]);
}
function getExpires(cookie) {
  return cookie.expires;
}
function getMaxExpires(cookies) {
  var expires = map(getExpires, cookies);
  return Math.max.apply(null, expires);
}
function saveCookies(cookiesMap, domain) {
  var cookies = toArray(cookiesMap);
  var maxExpires = Math.abs(getMaxExpires(cookies) * 1000 - now());
  var serializedCookies = join("|", map(serialize, cookies));
  var expires = new Date(now() + maxExpires);
  setCookie(MBOX_COOKIE, serializedCookies, {
    domain: domain,
    expires: expires
  });
}
function setTargetCookie(options) {
  var name = options.name,
    value = options.value,
    expires = options.expires,
    domain = options.domain;
  var cookiesMap = readCookies();
  cookiesMap[name] = createCookie(
    name,
    value,
    Math.ceil(expires + now() / 1000)
  );
  saveCookies(cookiesMap, domain);
}

function isCookiePresent(name) {
  return isNotBlank(getCookie(name));
}
function isParamPresent(win, name) {
  var location = win.location;
  var search = location.search;
  var params = parseQueryString(search);
  return isNotBlank(params[name]);
}
function isRefParamPresent(doc, name) {
  var referrer = doc.referrer;
  var parsedUri = parseUri$1(referrer);
  var refParams = parsedUri.queryKey;
  return isNil(refParams) ? false : isNotBlank(refParams[name]);
}
function exists(win, doc, name) {
  return (
    isCookiePresent(name) ||
    isParamPresent(win, name) ||
    isRefParamPresent(doc, name)
  );
}

function isCookieEnabled() {
  var config = getConfig();
  var cookieDomain = config[COOKIE_DOMAIN];
  setCookie(CHECK, TRUE, {
    domain: cookieDomain
  });
  var result = getCookie(CHECK) === TRUE;
  removeCookie(CHECK);
  return result;
}
function isDeliveryDisabled() {
  return exists(window$1, document$1, DISABLE);
}
function isDeliveryEnabled() {
  var config = getConfig();
  var enabled = config[ENABLED];
  return enabled && isCookieEnabled() && !isDeliveryDisabled();
}
function isDebugEnabled() {
  return exists(window$1, document$1, DEBUG);
}
function isAuthoringEnabled() {
  return exists(window$1, document$1, AUTHORING);
}

var ADOBE_TARGET_PREFIX = "AT:";
function exists$1(win, method) {
  var console = win.console;
  return !isNil(console) && isFunction(console[method]);
}
function warn(win, args) {
  var console = win.console;
  if (!exists$1(win, "warn")) {
    return;
  }
  console.warn.apply(console, [ADOBE_TARGET_PREFIX].concat(args));
}
function debug(win, args) {
  var console = win.console;
  if (!exists$1(win, "debug")) {
    return;
  }
  if (isDebugEnabled()) {
    console.debug.apply(console, [ADOBE_TARGET_PREFIX].concat(args));
  }
}

function logWarn() {
  for (
    var _len = arguments.length, args = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    args[_key] = arguments[_key];
  }
  warn(window$1, args);
}
function logDebug() {
  for (
    var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
    _key2 < _len2;
    _key2++
  ) {
    args[_key2] = arguments[_key2];
  }
  debug(window$1, args);
}

var TRACES_FORMAT_VERSION = "1";
function getSettings(config) {
  return reduce(
    function(acc, key) {
      acc[key] = config[key];
      return acc;
    },
    {},
    OVERRIDABLE_SETTINGS
  );
}
function initialize(win, config, debugEnabled) {
  var result = win[TRACES] || [];
  win[TRACES] = result;
  if (!debugEnabled) {
    return;
  }
  var oldPush = result.push;
  result[VERSION] = TRACES_FORMAT_VERSION;
  result[SETTINGS] = getSettings(config);
  result[CLIENT_TRACES] = [];
  result[SERVER_TRACES] = [];
  result.push = function push(trace) {
    result[SERVER_TRACES].push(
      assign(
        {
          timestamp: now()
        },
        trace
      )
    );
    oldPush.call(this, trace);
  };
}
function saveTrace(win, namespace, trace, debugEnabled) {
  if (namespace === SERVER_TRACES) {
    win[TRACES].push(trace);
  }
  if (!debugEnabled) {
    return;
  }
  if (namespace !== SERVER_TRACES) {
    win[TRACES][namespace].push(
      assign(
        {
          timestamp: now()
        },
        trace
      )
    );
  }
}

function initTraces() {
  initialize(window$1, getConfig(), isDebugEnabled());
}
function addServerTrace(trace) {
  saveTrace(window$1, SERVER_TRACES, trace, isDebugEnabled());
}
function addClientTrace(trace) {
  saveTrace(window$1, CLIENT_TRACES, trace, isDebugEnabled());
}

var $ = (function(window) {
  var Zepto = (function() {
    var undefined$1,
      key,
      $,
      classList,
      emptyArray = [],
      _concat = emptyArray.concat,
      _filter = emptyArray.filter,
      _slice = emptyArray.slice,
      document = window.document,
      elementDisplay = {},
      classCache = {},
      cssNumber = {
        "column-count": 1,
        columns: 1,
        "font-weight": 1,
        "line-height": 1,
        opacity: 1,
        "z-index": 1,
        zoom: 1
      },
      fragmentRE = /^\s*<(\w+|!)[^>]*>/,
      singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
      rootNodeRE = /^(?:body|html)$/i,
      capitalRE = /([A-Z])/g,
      methodAttributes = [
        "val",
        "css",
        "html",
        "text",
        "data",
        "width",
        "height",
        "offset"
      ],
      adjacencyOperators = ["after", "prepend", "before", "append"],
      table = document.createElement("table"),
      tableRow = document.createElement("tr"),
      containers = {
        tr: document.createElement("tbody"),
        tbody: table,
        thead: table,
        tfoot: table,
        td: tableRow,
        th: tableRow,
        "*": document.createElement("div")
      },
      readyRE = /complete|loaded|interactive/,
      simpleSelectorRE = /^[\w-]*$/,
      class2type = {},
      toString = class2type.toString,
      zepto = {},
      camelize,
      uniq,
      tempParent = document.createElement("div"),
      propMap = {
        tabindex: "tabIndex",
        readonly: "readOnly",
        for: "htmlFor",
        class: "className",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        cellpadding: "cellPadding",
        rowspan: "rowSpan",
        colspan: "colSpan",
        usemap: "useMap",
        frameborder: "frameBorder",
        contenteditable: "contentEditable"
      },
      isArray =
        Array.isArray ||
        function(object) {
          return object instanceof Array;
        };
    zepto.matches = function(element, selector) {
      if (!selector || !element || element.nodeType !== 1) return false;
      var matchesSelector =
        element.matches ||
        element.webkitMatchesSelector ||
        element.mozMatchesSelector ||
        element.oMatchesSelector ||
        element.matchesSelector;
      if (matchesSelector) return matchesSelector.call(element, selector);
      var match,
        parent = element.parentNode,
        temp = !parent;
      if (temp) (parent = tempParent).appendChild(element);
      match = ~zepto.qsa(parent, selector).indexOf(element);
      temp && tempParent.removeChild(element);
      return match;
    };
    function type(obj) {
      return obj == null
        ? String(obj)
        : class2type[toString.call(obj)] || "object";
    }
    function isFunction(value) {
      return type(value) == "function";
    }
    function isWindow(obj) {
      return obj != null && obj == obj.window;
    }
    function isDocument(obj) {
      return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }
    function isObject(obj) {
      return type(obj) == "object";
    }
    function isPlainObject(obj) {
      return (
        isObject(obj) &&
        !isWindow(obj) &&
        Object.getPrototypeOf(obj) == Object.prototype
      );
    }
    function likeArray(obj) {
      var length = !!obj && "length" in obj && obj.length,
        type = $.type(obj);
      return (
        "function" != type &&
        !isWindow(obj) &&
        ("array" == type ||
          length === 0 ||
          (typeof length == "number" && length > 0 && length - 1 in obj))
      );
    }
    function compact(array) {
      return _filter.call(array, function(item) {
        return item != null;
      });
    }
    function flatten(array) {
      return array.length > 0 ? $.fn.concat.apply([], array) : array;
    }
    camelize = function camelize(str) {
      return str.replace(/-+(.)?/g, function(match, chr) {
        return chr ? chr.toUpperCase() : "";
      });
    };
    function dasherize(str) {
      return str
        .replace(/::/g, "/")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
        .replace(/([a-z\d])([A-Z])/g, "$1_$2")
        .replace(/_/g, "-")
        .toLowerCase();
    }
    uniq = function uniq(array) {
      return _filter.call(array, function(item, idx) {
        return array.indexOf(item) == idx;
      });
    };
    function classRE(name) {
      return name in classCache
        ? classCache[name]
        : (classCache[name] = new RegExp("(^|\\s)" + name + "(\\s|$)"));
    }
    function maybeAddPx(name, value) {
      return typeof value == "number" && !cssNumber[dasherize(name)]
        ? value + "px"
        : value;
    }
    function defaultDisplay(nodeName) {
      var element, display;
      if (!elementDisplay[nodeName]) {
        element = document.createElement(nodeName);
        document.body.appendChild(element);
        display = getComputedStyle(element, "").getPropertyValue("display");
        element.parentNode.removeChild(element);
        display == "none" && (display = "block");
        elementDisplay[nodeName] = display;
      }
      return elementDisplay[nodeName];
    }
    function _children(element) {
      return "children" in element
        ? _slice.call(element.children)
        : $.map(element.childNodes, function(node) {
            if (node.nodeType == 1) return node;
          });
    }
    function Z(dom, selector) {
      var i,
        len = dom ? dom.length : 0;
      for (i = 0; i < len; i++) {
        this[i] = dom[i];
      }
      this.length = len;
      this.selector = selector || "";
    }
    zepto.fragment = function(html, name, properties) {
      var dom, nodes, container;
      if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1));
      if (!dom) {
        if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
        if (name === undefined$1) name = fragmentRE.test(html) && RegExp.$1;
        if (!(name in containers)) name = "*";
        container = containers[name];
        container.innerHTML = "" + html;
        dom = $.each(_slice.call(container.childNodes), function() {
          container.removeChild(this);
        });
      }
      if (isPlainObject(properties)) {
        nodes = $(dom);
        $.each(properties, function(key, value) {
          if (methodAttributes.indexOf(key) > -1) nodes[key](value);
          else nodes.attr(key, value);
        });
      }
      return dom;
    };
    zepto.Z = function(dom, selector) {
      return new Z(dom, selector);
    };
    zepto.isZ = function(object) {
      return object instanceof zepto.Z;
    };
    zepto.init = function(selector, context) {
      var dom;
      if (!selector) return zepto.Z();
      else if (typeof selector == "string") {
        selector = selector.trim();
        if (selector[0] == "<" && fragmentRE.test(selector))
          (dom = zepto.fragment(selector, RegExp.$1, context)),
            (selector = null);
        else if (context !== undefined$1) return $(context).find(selector);
        else dom = zepto.qsa(document, selector);
      } else if (isFunction(selector)) return $(document).ready(selector);
      else if (zepto.isZ(selector)) return selector;
      else {
        if (isArray(selector)) dom = compact(selector);
        else if (isObject(selector)) (dom = [selector]), (selector = null);
        else if (fragmentRE.test(selector))
          (dom = zepto.fragment(selector.trim(), RegExp.$1, context)),
            (selector = null);
        else if (context !== undefined$1) return $(context).find(selector);
        else dom = zepto.qsa(document, selector);
      }
      return zepto.Z(dom, selector);
    };
    $ = function $(selector, context) {
      return zepto.init(selector, context);
    };
    function extend(target, source, deep) {
      for (key in source) {
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
          if (isPlainObject(source[key]) && !isPlainObject(target[key]))
            target[key] = {};
          if (isArray(source[key]) && !isArray(target[key])) target[key] = [];
          extend(target[key], source[key], deep);
        } else if (source[key] !== undefined$1) target[key] = source[key];
      }
    }
    $.extend = function(target) {
      var deep,
        args = _slice.call(arguments, 1);
      if (typeof target == "boolean") {
        deep = target;
        target = args.shift();
      }
      args.forEach(function(arg) {
        extend(target, arg, deep);
      });
      return target;
    };
    zepto.qsa = function(element, selector) {
      var found,
        maybeID = selector[0] == "#",
        maybeClass = !maybeID && selector[0] == ".",
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,
        isSimple = simpleSelectorRE.test(nameOnly);
      return element.getElementById && isSimple && maybeID
        ? (found = element.getElementById(nameOnly))
          ? [found]
          : []
        : element.nodeType !== 1 &&
          element.nodeType !== 9 &&
          element.nodeType !== 11
        ? []
        : _slice.call(
            isSimple && !maybeID && element.getElementsByClassName
              ? maybeClass
                ? element.getElementsByClassName(nameOnly)
                : element.getElementsByTagName(selector)
              : element.querySelectorAll(selector)
          );
    };
    function filtered(nodes, selector) {
      return selector == null ? $(nodes) : $(nodes).filter(selector);
    }
    $.contains = document.documentElement.contains
      ? function(parent, node) {
          return parent !== node && parent.contains(node);
        }
      : function(parent, node) {
          while (node && (node = node.parentNode)) {
            if (node === parent) return true;
          }
          return false;
        };
    function funcArg(context, arg, idx, payload) {
      return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }
    function setAttribute(node, name, value) {
      value == null
        ? node.removeAttribute(name)
        : node.setAttribute(name, value);
    }
    function className(node, value) {
      var klass = node.className || "",
        svg = klass && klass.baseVal !== undefined$1;
      if (value === undefined$1) return svg ? klass.baseVal : klass;
      svg ? (klass.baseVal = value) : (node.className = value);
    }
    function deserializeValue(value) {
      try {
        return value
          ? value == "true" ||
              (value == "false"
                ? false
                : value == "null"
                ? null
                : +value + "" == value
                ? +value
                : /^[\[\{]/.test(value)
                ? $.parseJSON(value)
                : value)
          : value;
      } catch (e) {
        return value;
      }
    }
    $.type = type;
    $.isFunction = isFunction;
    $.isWindow = isWindow;
    $.isArray = isArray;
    $.isPlainObject = isPlainObject;
    $.isEmptyObject = function(obj) {
      var name;
      for (name in obj) {
        return false;
      }
      return true;
    };
    $.isNumeric = function(val) {
      var num = Number(val),
        type = _typeof(val);
      return (
        (val != null &&
          type != "boolean" &&
          (type != "string" || val.length) &&
          !isNaN(num) &&
          isFinite(num)) ||
        false
      );
    };
    $.inArray = function(elem, array, i) {
      return emptyArray.indexOf.call(array, elem, i);
    };
    $.camelCase = camelize;
    $.trim = function(str) {
      return str == null ? "" : String.prototype.trim.call(str);
    };
    $.uuid = 0;
    $.support = {};
    $.expr = {};
    $.noop = function() {};
    $.map = function(elements, callback) {
      var value,
        values = [],
        i,
        key;
      if (likeArray(elements))
        for (i = 0; i < elements.length; i++) {
          value = callback(elements[i], i);
          if (value != null) values.push(value);
        }
      else
        for (key in elements) {
          value = callback(elements[key], key);
          if (value != null) values.push(value);
        }
      return flatten(values);
    };
    $.each = function(elements, callback) {
      var i, key;
      if (likeArray(elements)) {
        for (i = 0; i < elements.length; i++) {
          if (callback.call(elements[i], i, elements[i]) === false)
            return elements;
        }
      } else {
        for (key in elements) {
          if (callback.call(elements[key], key, elements[key]) === false)
            return elements;
        }
      }
      return elements;
    };
    $.grep = function(elements, callback) {
      return _filter.call(elements, callback);
    };
    if (window.JSON) $.parseJSON = JSON.parse;
    $.each(
      "Boolean Number String Function Array Date RegExp Object Error".split(
        " "
      ),
      function(i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
      }
    );
    $.fn = {
      constructor: zepto.Z,
      length: 0,
      forEach: emptyArray.forEach,
      reduce: emptyArray.reduce,
      push: emptyArray.push,
      sort: emptyArray.sort,
      splice: emptyArray.splice,
      indexOf: emptyArray.indexOf,
      concat: function concat() {
        var i,
          value,
          args = [];
        for (i = 0; i < arguments.length; i++) {
          value = arguments[i];
          args[i] = zepto.isZ(value) ? value.toArray() : value;
        }
        return _concat.apply(zepto.isZ(this) ? this.toArray() : this, args);
      },
      map: function map(fn) {
        return $(
          $.map(this, function(el, i) {
            return fn.call(el, i, el);
          })
        );
      },
      slice: function slice() {
        return $(_slice.apply(this, arguments));
      },
      ready: function ready(callback) {
        if (readyRE.test(document.readyState) && document.body) callback($);
        else
          document.addEventListener(
            "DOMContentLoaded",
            function() {
              callback($);
            },
            false
          );
        return this;
      },
      get: function get(idx) {
        return idx === undefined$1
          ? _slice.call(this)
          : this[idx >= 0 ? idx : idx + this.length];
      },
      toArray: function toArray() {
        return this.get();
      },
      size: function size() {
        return this.length;
      },
      remove: function remove() {
        return this.each(function() {
          if (this.parentNode != null) this.parentNode.removeChild(this);
        });
      },
      each: function each(callback) {
        var len = this.length,
          idx = 0,
          el;
        while (idx < len) {
          el = this[idx];
          if (callback.call(el, idx, el) === false) {
            break;
          }
          idx++;
        }
        return this;
      },
      filter: function filter(selector) {
        if (isFunction(selector)) return this.not(this.not(selector));
        return $(
          _filter.call(this, function(element) {
            return zepto.matches(element, selector);
          })
        );
      },
      add: function add(selector, context) {
        return $(uniq(this.concat($(selector, context))));
      },
      is: function is(selector) {
        return this.length > 0 && zepto.matches(this[0], selector);
      },
      not: function not(selector) {
        var nodes = [];
        if (isFunction(selector) && selector.call !== undefined$1)
          this.each(function(idx) {
            if (!selector.call(this, idx)) nodes.push(this);
          });
        else {
          var excludes =
            typeof selector == "string"
              ? this.filter(selector)
              : likeArray(selector) && isFunction(selector.item)
              ? _slice.call(selector)
              : $(selector);
          this.forEach(function(el) {
            if (excludes.indexOf(el) < 0) nodes.push(el);
          });
        }
        return $(nodes);
      },
      has: function has(selector) {
        return this.filter(function() {
          return isObject(selector)
            ? $.contains(this, selector)
            : $(this)
                .find(selector)
                .size();
        });
      },
      eq: function eq(idx) {
        return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
      },
      first: function first() {
        var el = this[0];
        return el && !isObject(el) ? el : $(el);
      },
      last: function last() {
        var el = this[this.length - 1];
        return el && !isObject(el) ? el : $(el);
      },
      find: function find(selector) {
        var result,
          $this = this;
        if (!selector) result = $();
        else if (_typeof(selector) == "object")
          result = $(selector).filter(function() {
            var node = this;
            return emptyArray.some.call($this, function(parent) {
              return $.contains(parent, node);
            });
          });
        else if (this.length == 1) result = $(zepto.qsa(this[0], selector));
        else
          result = this.map(function() {
            return zepto.qsa(this, selector);
          });
        return result;
      },
      closest: function closest(selector, context) {
        var nodes = [],
          collection = _typeof(selector) == "object" && $(selector);
        this.each(function(_, node) {
          while (
            node &&
            !(collection
              ? collection.indexOf(node) >= 0
              : zepto.matches(node, selector))
          ) {
            node = node !== context && !isDocument(node) && node.parentNode;
          }
          if (node && nodes.indexOf(node) < 0) nodes.push(node);
        });
        return $(nodes);
      },
      parents: function parents(selector) {
        var ancestors = [],
          nodes = this;
        while (nodes.length > 0) {
          nodes = $.map(nodes, function(node) {
            if (
              (node = node.parentNode) &&
              !isDocument(node) &&
              ancestors.indexOf(node) < 0
            ) {
              ancestors.push(node);
              return node;
            }
          });
        }
        return filtered(ancestors, selector);
      },
      parent: function parent(selector) {
        return filtered(uniq(this.pluck("parentNode")), selector);
      },
      children: function children(selector) {
        return filtered(
          this.map(function() {
            return _children(this);
          }),
          selector
        );
      },
      contents: function contents() {
        return this.map(function() {
          return this.contentDocument || _slice.call(this.childNodes);
        });
      },
      siblings: function siblings(selector) {
        return filtered(
          this.map(function(i, el) {
            return _filter.call(_children(el.parentNode), function(child) {
              return child !== el;
            });
          }),
          selector
        );
      },
      empty: function empty() {
        return this.each(function() {
          this.innerHTML = "";
        });
      },
      pluck: function pluck(property) {
        return $.map(this, function(el) {
          return el[property];
        });
      },
      show: function show() {
        return this.each(function() {
          this.style.display == "none" && (this.style.display = "");
          if (getComputedStyle(this, "").getPropertyValue("display") == "none")
            this.style.display = defaultDisplay(this.nodeName);
        });
      },
      replaceWith: function replaceWith(newContent) {
        return this.before(newContent).remove();
      },
      wrap: function wrap(structure) {
        var func = isFunction(structure);
        if (this[0] && !func)
          var dom = $(structure).get(0),
            clone = dom.parentNode || this.length > 1;
        return this.each(function(index) {
          $(this).wrapAll(
            func
              ? structure.call(this, index)
              : clone
              ? dom.cloneNode(true)
              : dom
          );
        });
      },
      wrapAll: function wrapAll(structure) {
        if (this[0]) {
          $(this[0]).before((structure = $(structure)));
          var children;
          while ((children = structure.children()).length) {
            structure = children.first();
          }
          $(structure).append(this);
        }
        return this;
      },
      wrapInner: function wrapInner(structure) {
        var func = isFunction(structure);
        return this.each(function(index) {
          var self = $(this),
            contents = self.contents(),
            dom = func ? structure.call(this, index) : structure;
          contents.length ? contents.wrapAll(dom) : self.append(dom);
        });
      },
      unwrap: function unwrap() {
        this.parent().each(function() {
          $(this).replaceWith($(this).children());
        });
        return this;
      },
      clone: function clone() {
        return this.map(function() {
          return this.cloneNode(true);
        });
      },
      hide: function hide() {
        return this.css("display", "none");
      },
      toggle: function toggle(setting) {
        return this.each(function() {
          var el = $(this);
          (setting === undefined$1
          ? el.css("display") == "none"
          : setting)
            ? el.show()
            : el.hide();
        });
      },
      prev: function prev(selector) {
        return $(this.pluck("previousElementSibling")).filter(selector || "*");
      },
      next: function next(selector) {
        return $(this.pluck("nextElementSibling")).filter(selector || "*");
      },
      html: function html(_html) {
        return 0 in arguments
          ? this.each(function(idx) {
              var originHtml = this.innerHTML;
              $(this)
                .empty()
                .append(funcArg(this, _html, idx, originHtml));
            })
          : 0 in this
          ? this[0].innerHTML
          : null;
      },
      text: function text(_text) {
        return 0 in arguments
          ? this.each(function(idx) {
              var newText = funcArg(this, _text, idx, this.textContent);
              this.textContent = newText == null ? "" : "" + newText;
            })
          : 0 in this
          ? this.pluck("textContent").join("")
          : null;
      },
      attr: function attr(name, value) {
        var result;
        return typeof name == "string" && !(1 in arguments)
          ? 0 in this &&
            this[0].nodeType == 1 &&
            (result = this[0].getAttribute(name)) != null
            ? result
            : undefined$1
          : this.each(function(idx) {
              if (this.nodeType !== 1) return;
              if (isObject(name))
                for (key in name) {
                  setAttribute(this, key, name[key]);
                }
              else
                setAttribute(
                  this,
                  name,
                  funcArg(this, value, idx, this.getAttribute(name))
                );
            });
      },
      removeAttr: function removeAttr(name) {
        return this.each(function() {
          this.nodeType === 1 &&
            name.split(" ").forEach(function(attribute) {
              setAttribute(this, attribute);
            }, this);
        });
      },
      prop: function prop(name, value) {
        name = propMap[name] || name;
        return 1 in arguments
          ? this.each(function(idx) {
              this[name] = funcArg(this, value, idx, this[name]);
            })
          : this[0] && this[0][name];
      },
      removeProp: function removeProp(name) {
        name = propMap[name] || name;
        return this.each(function() {
          delete this[name];
        });
      },
      data: function data(name, value) {
        var attrName = "data-" + name.replace(capitalRE, "-$1").toLowerCase();
        var data =
          1 in arguments ? this.attr(attrName, value) : this.attr(attrName);
        return data !== null ? deserializeValue(data) : undefined$1;
      },
      val: function val(value) {
        if (0 in arguments) {
          if (value == null) value = "";
          return this.each(function(idx) {
            this.value = funcArg(this, value, idx, this.value);
          });
        } else {
          return (
            this[0] &&
            (this[0].multiple
              ? $(this[0])
                  .find("option")
                  .filter(function() {
                    return this.selected;
                  })
                  .pluck("value")
              : this[0].value)
          );
        }
      },
      offset: function offset(coordinates) {
        if (coordinates)
          return this.each(function(index) {
            var $this = $(this),
              coords = funcArg(this, coordinates, index, $this.offset()),
              parentOffset = $this.offsetParent().offset(),
              props = {
                top: coords.top - parentOffset.top,
                left: coords.left - parentOffset.left
              };
            if ($this.css("position") == "static")
              props["position"] = "relative";
            $this.css(props);
          });
        if (!this.length) return null;
        if (
          document.documentElement !== this[0] &&
          !$.contains(document.documentElement, this[0])
        )
          return {
            top: 0,
            left: 0
          };
        var obj = this[0].getBoundingClientRect();
        return {
          left: obj.left + window.pageXOffset,
          top: obj.top + window.pageYOffset,
          width: Math.round(obj.width),
          height: Math.round(obj.height)
        };
      },
      css: function css(property, value) {
        if (arguments.length < 2) {
          var element = this[0];
          if (typeof property == "string") {
            if (!element) return;
            return (
              element.style[camelize(property)] ||
              getComputedStyle(element, "").getPropertyValue(property)
            );
          } else if (isArray(property)) {
            if (!element) return;
            var props = {};
            var computedStyle = getComputedStyle(element, "");
            $.each(property, function(_, prop) {
              props[prop] =
                element.style[camelize(prop)] ||
                computedStyle.getPropertyValue(prop);
            });
            return props;
          }
        }
        var css = "";
        if (type(property) == "string") {
          if (!value && value !== 0)
            this.each(function() {
              this.style.removeProperty(dasherize(property));
            });
          else css = dasherize(property) + ":" + maybeAddPx(property, value);
        } else {
          for (key in property) {
            if (!property[key] && property[key] !== 0)
              this.each(function() {
                this.style.removeProperty(dasherize(key));
              });
            else
              css +=
                dasherize(key) + ":" + maybeAddPx(key, property[key]) + ";";
          }
        }
        return this.each(function() {
          this.style.cssText += ";" + css;
        });
      },
      index: function index(element) {
        return element
          ? this.indexOf($(element)[0])
          : this.parent()
              .children()
              .indexOf(this[0]);
      },
      hasClass: function hasClass(name) {
        if (!name) return false;
        return emptyArray.some.call(
          this,
          function(el) {
            return this.test(className(el));
          },
          classRE(name)
        );
      },
      addClass: function addClass(name) {
        if (!name) return this;
        return this.each(function(idx) {
          if (!("className" in this)) return;
          classList = [];
          var cls = className(this),
            newName = funcArg(this, name, idx, cls);
          newName.split(/\s+/g).forEach(function(klass) {
            if (!$(this).hasClass(klass)) classList.push(klass);
          }, this);
          classList.length &&
            className(this, cls + (cls ? " " : "") + classList.join(" "));
        });
      },
      removeClass: function removeClass(name) {
        return this.each(function(idx) {
          if (!("className" in this)) return;
          if (name === undefined$1) return className(this, "");
          classList = className(this);
          funcArg(this, name, idx, classList)
            .split(/\s+/g)
            .forEach(function(klass) {
              classList = classList.replace(classRE(klass), " ");
            });
          className(this, classList.trim());
        });
      },
      toggleClass: function toggleClass(name, when) {
        if (!name) return this;
        return this.each(function(idx) {
          var $this = $(this),
            names = funcArg(this, name, idx, className(this));
          names.split(/\s+/g).forEach(function(klass) {
            (when === undefined$1
            ? !$this.hasClass(klass)
            : when)
              ? $this.addClass(klass)
              : $this.removeClass(klass);
          });
        });
      },
      scrollTop: function scrollTop(value) {
        if (!this.length) return;
        var hasScrollTop = "scrollTop" in this[0];
        if (value === undefined$1)
          return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;
        return this.each(
          hasScrollTop
            ? function() {
                this.scrollTop = value;
              }
            : function() {
                this.scrollTo(this.scrollX, value);
              }
        );
      },
      scrollLeft: function scrollLeft(value) {
        if (!this.length) return;
        var hasScrollLeft = "scrollLeft" in this[0];
        if (value === undefined$1)
          return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;
        return this.each(
          hasScrollLeft
            ? function() {
                this.scrollLeft = value;
              }
            : function() {
                this.scrollTo(value, this.scrollY);
              }
        );
      },
      position: function position() {
        if (!this.length) return;
        var elem = this[0],
          offsetParent = this.offsetParent(),
          offset = this.offset(),
          parentOffset = rootNodeRE.test(offsetParent[0].nodeName)
            ? {
                top: 0,
                left: 0
              }
            : offsetParent.offset();
        offset.top -= parseFloat($(elem).css("margin-top")) || 0;
        offset.left -= parseFloat($(elem).css("margin-left")) || 0;
        parentOffset.top +=
          parseFloat($(offsetParent[0]).css("border-top-width")) || 0;
        parentOffset.left +=
          parseFloat($(offsetParent[0]).css("border-left-width")) || 0;
        return {
          top: offset.top - parentOffset.top,
          left: offset.left - parentOffset.left
        };
      },
      offsetParent: function offsetParent() {
        return this.map(function() {
          var parent = this.offsetParent || document.body;
          while (
            parent &&
            !rootNodeRE.test(parent.nodeName) &&
            $(parent).css("position") == "static"
          ) {
            parent = parent.offsetParent;
          }
          return parent;
        });
      }
    };
    $.fn.detach = $.fn.remove;
    ["width", "height"].forEach(function(dimension) {
      var dimensionProperty = dimension.replace(/./, function(m) {
        return m[0].toUpperCase();
      });
      $.fn[dimension] = function(value) {
        var offset,
          el = this[0];
        if (value === undefined$1)
          return isWindow(el)
            ? el["inner" + dimensionProperty]
            : isDocument(el)
            ? el.documentElement["scroll" + dimensionProperty]
            : (offset = this.offset()) && offset[dimension];
        else
          return this.each(function(idx) {
            el = $(this);
            el.css(dimension, funcArg(this, value, idx, el[dimension]()));
          });
      };
    });
    function traverseNode(node, fun) {
      fun(node);
      for (var i = 0, len = node.childNodes.length; i < len; i++) {
        traverseNode(node.childNodes[i], fun);
      }
    }
    function executeScript(doc, content, nonce) {
      var nearestNode = doc.getElementsByTagName("script")[0];
      if (!nearestNode) {
        return;
      }
      var parentNode = nearestNode.parentNode;
      if (!parentNode) {
        return;
      }
      var script = doc.createElement("script");
      script.innerHTML = content;
      if (isNotBlank(nonce)) {
        script.setAttribute("nonce", nonce);
      }
      parentNode.appendChild(script);
      parentNode.removeChild(script);
    }
    adjacencyOperators.forEach(function(operator, operatorIndex) {
      var inside = operatorIndex % 2;
      $.fn[operator] = function() {
        var argType,
          nodes = $.map(arguments, function(arg) {
            var arr = [];
            argType = type(arg);
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined$1) return arr.push(el);
                else if ($.zepto.isZ(el)) return (arr = arr.concat(el.get()));
                arr = arr.concat(zepto.fragment(el));
              });
              return arr;
            }
            return argType == "object" || arg == null
              ? arg
              : zepto.fragment(arg);
          }),
          parent,
          copyByClone = this.length > 1;
        if (nodes.length < 1) return this;
        return this.each(function(_, target) {
          parent = inside ? target : target.parentNode;
          target =
            operatorIndex == 0
              ? target.nextSibling
              : operatorIndex == 1
              ? target.firstChild
              : operatorIndex == 2
              ? target
              : null;
          var parentInDocument = $.contains(document.documentElement, parent);
          var SCRIPT_TYPES = /^(text|application)\/(javascript|ecmascript)$/;
          var config = getConfig();
          var scriptNonce = config[CSP_SCRIPT_NONCE];
          var styleNonce = config[CSP_STYLE_NONCE];
          nodes.forEach(function(node) {
            if (copyByClone) node = node.cloneNode(true);
            else if (!parent) return $(node).remove();
            if (isNotBlank(scriptNonce) && node.tagName === "SCRIPT") {
              node.setAttribute("nonce", scriptNonce);
            }
            if (isNotBlank(styleNonce) && node.tagName === "STYLE") {
              node.setAttribute("nonce", styleNonce);
            }
            parent.insertBefore(node, target);
            if (parentInDocument)
              traverseNode(node, function(el) {
                if (
                  el.nodeName != null &&
                  el.nodeName.toUpperCase() === "SCRIPT" &&
                  (!el.type || SCRIPT_TYPES.test(el.type.toLowerCase())) &&
                  !el.src
                ) {
                  executeScript(document, el.innerHTML, el.nonce);
                }
              });
          });
        });
      };
      $.fn[
        inside
          ? operator + "To"
          : "insert" + (operatorIndex ? "Before" : "After")
      ] = function(html) {
        $(html)[operator](this);
        return this;
      };
    });
    zepto.Z.prototype = Z.prototype = $.fn;
    zepto.uniq = uniq;
    zepto.deserializeValue = deserializeValue;
    $.zepto = zepto;
    return $;
  })();
  (function($) {
    var _zid = 1,
      undefined$1,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function isString(obj) {
        return typeof obj == "string";
      },
      handlers = {},
      specialEvents = {},
      focusinSupported = "onfocusin" in window,
      focus = {
        focus: "focusin",
        blur: "focusout"
      },
      hover = {
        mouseenter: "mouseover",
        mouseleave: "mouseout"
      };
    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove =
      "MouseEvents";
    function zid(element) {
      return element._zid || (element._zid = _zid++);
    }
    function findHandlers(element, event, fn, selector) {
      event = parse(event);
      if (event.ns) var matcher = matcherFor(event.ns);
      return (handlers[zid(element)] || []).filter(function(handler) {
        return (
          handler &&
          (!event.e || handler.e == event.e) &&
          (!event.ns || matcher.test(handler.ns)) &&
          (!fn || zid(handler.fn) === zid(fn)) &&
          (!selector || handler.sel == selector)
        );
      });
    }
    function parse(event) {
      var parts = ("" + event).split(".");
      return {
        e: parts[0],
        ns: parts
          .slice(1)
          .sort()
          .join(" ")
      };
    }
    function matcherFor(ns) {
      return new RegExp("(?:^| )" + ns.replace(" ", " .* ?") + "(?: |$)");
    }
    function eventCapture(handler, captureSetting) {
      return (
        (handler.del && !focusinSupported && handler.e in focus) ||
        !!captureSetting
      );
    }
    function realEvent(type) {
      return hover[type] || (focusinSupported && focus[type]) || type;
    }
    function add(element, events, fn, data, selector, delegator, capture) {
      var id = zid(element),
        set = handlers[id] || (handlers[id] = []);
      events.split(/\s/).forEach(function(event) {
        if (event == "ready") return $(document).ready(fn);
        var handler = parse(event);
        handler.fn = fn;
        handler.sel = selector;
        if (handler.e in hover)
          fn = function fn(e) {
            var related = e.relatedTarget;
            if (!related || (related !== this && !$.contains(this, related)))
              return handler.fn.apply(this, arguments);
          };
        handler.del = delegator;
        var callback = delegator || fn;
        handler.proxy = function(e) {
          e = compatible(e);
          if (e.isImmediatePropagationStopped()) return;
          e.data = data;
          var result = callback.apply(
            element,
            e._args == undefined$1 ? [e] : [e].concat(e._args)
          );
          if (result === false) e.preventDefault(), e.stopPropagation();
          return result;
        };
        handler.i = set.length;
        set.push(handler);
        if ("addEventListener" in element)
          element.addEventListener(
            realEvent(handler.e),
            handler.proxy,
            eventCapture(handler, capture)
          );
      });
    }
    function remove(element, events, fn, selector, capture) {
      var id = zid(element);
      (events || "").split(/\s/).forEach(function(event) {
        findHandlers(element, event, fn, selector).forEach(function(handler) {
          delete handlers[id][handler.i];
          if ("removeEventListener" in element)
            element.removeEventListener(
              realEvent(handler.e),
              handler.proxy,
              eventCapture(handler, capture)
            );
        });
      });
    }
    $.event = {
      add: add,
      remove: remove
    };
    $.proxy = function(fn, context) {
      var args = 2 in arguments && slice.call(arguments, 2);
      if (isFunction(fn)) {
        var proxyFn = function proxyFn() {
          return fn.apply(
            context,
            args ? args.concat(slice.call(arguments)) : arguments
          );
        };
        proxyFn._zid = zid(fn);
        return proxyFn;
      } else if (isString(context)) {
        if (args) {
          args.unshift(fn[context], fn);
          return $.proxy.apply(null, args);
        } else {
          return $.proxy(fn[context], fn);
        }
      } else {
        throw new TypeError("expected function");
      }
    };
    $.fn.bind = function(event, data, callback) {
      return this.on(event, data, callback);
    };
    $.fn.unbind = function(event, callback) {
      return this.off(event, callback);
    };
    $.fn.one = function(event, selector, data, callback) {
      return this.on(event, selector, data, callback, 1);
    };
    var returnTrue = function returnTrue() {
        return true;
      },
      returnFalse = function returnFalse() {
        return false;
      },
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: "isDefaultPrevented",
        stopImmediatePropagation: "isImmediatePropagationStopped",
        stopPropagation: "isPropagationStopped"
      };
    function compatible(event, source) {
      if (source || !event.isDefaultPrevented) {
        source || (source = event);
        $.each(eventMethods, function(name, predicate) {
          var sourceMethod = source[name];
          event[name] = function() {
            this[predicate] = returnTrue;
            return sourceMethod && sourceMethod.apply(source, arguments);
          };
          event[predicate] = returnFalse;
        });
        try {
          event.timeStamp || (event.timeStamp = new Date().getTime());
        } catch (ignored) {}
        if (
          source.defaultPrevented !== undefined$1
            ? source.defaultPrevented
            : "returnValue" in source
            ? source.returnValue === false
            : source.getPreventDefault && source.getPreventDefault()
        )
          event.isDefaultPrevented = returnTrue;
      }
      return event;
    }
    function createProxy(event) {
      var key,
        proxy = {
          originalEvent: event
        };
      for (key in event) {
        if (!ignoreProperties.test(key) && event[key] !== undefined$1)
          proxy[key] = event[key];
      }
      return compatible(proxy, event);
    }
    $.fn.delegate = function(selector, event, callback) {
      return this.on(event, selector, callback);
    };
    $.fn.undelegate = function(selector, event, callback) {
      return this.off(event, selector, callback);
    };
    $.fn.live = function(event, callback) {
      $(document.body).delegate(this.selector, event, callback);
      return this;
    };
    $.fn.die = function(event, callback) {
      $(document.body).undelegate(this.selector, event, callback);
      return this;
    };
    $.fn.on = function(event, selector, data, callback, one) {
      var autoRemove,
        delegator,
        $this = this;
      if (event && !isString(event)) {
        $.each(event, function(type, fn) {
          $this.on(type, selector, data, fn, one);
        });
        return $this;
      }
      if (!isString(selector) && !isFunction(callback) && callback !== false)
        (callback = data), (data = selector), (selector = undefined$1);
      if (callback === undefined$1 || data === false)
        (callback = data), (data = undefined$1);
      if (callback === false) callback = returnFalse;
      return $this.each(function(_, element) {
        if (one)
          autoRemove = function autoRemove(e) {
            remove(element, e.type, callback);
            return callback.apply(this, arguments);
          };
        if (selector)
          delegator = function delegator(e) {
            var evt,
              match = $(e.target)
                .closest(selector, element)
                .get(0);
            if (match && match !== element) {
              evt = $.extend(createProxy(e), {
                currentTarget: match,
                liveFired: element
              });
              return (autoRemove || callback).apply(
                match,
                [evt].concat(slice.call(arguments, 1))
              );
            }
          };
        add(element, event, callback, data, selector, delegator || autoRemove);
      });
    };
    $.fn.off = function(event, selector, callback) {
      var $this = this;
      if (event && !isString(event)) {
        $.each(event, function(type, fn) {
          $this.off(type, selector, fn);
        });
        return $this;
      }
      if (!isString(selector) && !isFunction(callback) && callback !== false)
        (callback = selector), (selector = undefined$1);
      if (callback === false) callback = returnFalse;
      return $this.each(function() {
        remove(this, event, callback, selector);
      });
    };
    $.fn.trigger = function(event, args) {
      event =
        isString(event) || $.isPlainObject(event)
          ? $.Event(event)
          : compatible(event);
      event._args = args;
      return this.each(function() {
        if (event.type in focus && typeof this[event.type] == "function")
          this[event.type]();
        else if ("dispatchEvent" in this) this.dispatchEvent(event);
        else $(this).triggerHandler(event, args);
      });
    };
    $.fn.triggerHandler = function(event, args) {
      var e, result;
      this.each(function(i, element) {
        e = createProxy(isString(event) ? $.Event(event) : event);
        e._args = args;
        e.target = element;
        $.each(findHandlers(element, event.type || event), function(
          i,
          handler
        ) {
          result = handler.proxy(e);
          if (e.isImmediatePropagationStopped()) return false;
        });
      });
      return result;
    };
    (
      "focusin focusout focus blur load resize scroll unload click dblclick " +
      "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
      "change select keydown keypress keyup error"
    )
      .split(" ")
      .forEach(function(event) {
        $.fn[event] = function(callback) {
          return 0 in arguments
            ? this.bind(event, callback)
            : this.trigger(event);
        };
      });
    $.Event = function(type, props) {
      if (!isString(type)) (props = type), (type = props.type);
      var event = document.createEvent(specialEvents[type] || "Events"),
        bubbles = true;
      if (props)
        for (var name in props) {
          name == "bubbles"
            ? (bubbles = !!props[name])
            : (event[name] = props[name]);
        }
      event.initEvent(type, bubbles, true);
      return compatible(event);
    };
  })(Zepto);
  (function() {
    try {
      getComputedStyle(undefined);
    } catch (e) {
      var nativeGetComputedStyle = getComputedStyle;
      window.getComputedStyle = function(element, pseudoElement) {
        try {
          return nativeGetComputedStyle(element, pseudoElement);
        } catch (e) {
          return null;
        }
      };
    }
  })();
  (function($) {
    var zepto = $.zepto,
      oldQsa = zepto.qsa,
      childRe = /^\s*>/,
      classTag = "Zepto" + +new Date();
    zepto.qsa = function(node, selector) {
      var sel = selector,
        nodes,
        taggedParent;
      try {
        if (!sel) sel = "*";
        else if (childRe.test(sel))
          (taggedParent = $(node).addClass(classTag)),
            (sel = "." + classTag + " " + sel);
        nodes = oldQsa(node, sel);
      } catch (e) {
        throw e;
      } finally {
        if (taggedParent) taggedParent.removeClass(classTag);
      }
      return nodes;
    };
  })(Zepto);
  return Zepto;
})(window);

var MO_OBJECT = window$1.MutationObserver || window$1.WebkitMutationObserver;
function canUseMutationObserver() {
  return isFunction(MO_OBJECT);
}
function getMutationObserver(callback) {
  return new MO_OBJECT(callback);
}

var ARRAY_EXPECTED = "Expected an array of promises";
function getMoImmediateFn() {
  var textnode = document$1.createTextNode("");
  var twiddleNode = function twiddleNode() {
    textnode.textContent = textnode.textContent.length > 0 ? "" : "a";
  };
  var callbacks = [];
  var mo = getMutationObserver(function() {
    var len = callbacks.length;
    for (var i = 0; i < len; i += 1) {
      callbacks[i]();
    }
    callbacks.splice(0, len);
  });
  mo.observe(textnode, {
    characterData: true
  });
  return function(fn) {
    callbacks.push(fn);
    twiddleNode();
  };
}
function getOnReadyStateChangeImmediateFn() {
  return function(fn) {
    var scriptEl = $("<script>");
    scriptEl.on("readystatechange", function() {
      scriptEl.on("readystatechange", null);
      scriptEl.remove();
      scriptEl = null;
      fn();
    });
    $(document$1.documentElement).append(scriptEl);
  };
}
function setupPromiseImmediateFn() {
  if (canUseMutationObserver()) {
    Promise._setImmediateFn(getMoImmediateFn());
    return;
  }
  if (window$1.navigator.userAgent.indexOf("MSIE 10") !== -1) {
    Promise._setImmediateFn(getOnReadyStateChangeImmediateFn());
  }
}
if (Promise._setImmediateFn) {
  setupPromiseImmediateFn();
}
function create(func) {
  return new Promise(func);
}
function resolve(value) {
  return Promise.resolve(value);
}
function reject(value) {
  return Promise.reject(value);
}
function race(arr) {
  if (!isArray(arr)) {
    return reject(new TypeError(ARRAY_EXPECTED));
  }
  return Promise.race(arr);
}
function all(arr) {
  if (!isArray(arr)) {
    return reject(new TypeError(ARRAY_EXPECTED));
  }
  return Promise.all(arr);
}
function timeout(promise, time, message) {
  var id = -1;
  var delayedPromise = create(function(_, rej) {
    id = delay(function() {
      return rej(new Error(message));
    }, time);
  });
  return race([promise, delayedPromise]).then(
    function(val) {
      cancelDelay(id);
      return val;
    },
    function(err) {
      cancelDelay(id);
      throw err;
    }
  );
}

function isOptinAvailable(win) {
  if (isNil(win[ADOBE])) {
    return false;
  }
  var adobe = win[ADOBE];
  if (isNil(adobe[OPTIN])) {
    return false;
  }
  var optin = adobe[OPTIN];
  return isFunction(optin[FETCH_PERMISSIONS]) && isFunction(optin[IS_APPROVED]);
}
function isOptinEnabled(win, optinEnabled) {
  if (!optinEnabled) {
    return false;
  }
  return isOptinAvailable(win);
}
function isCategoryApproved(win, key) {
  if (!isOptinAvailable(win)) {
    return true;
  }
  var optIn = win[ADOBE][OPTIN];
  var categories = win[ADOBE][OPTIN][CATEGORIES] || {};
  var category = categories[key];
  return optIn[IS_APPROVED](category);
}
function fetchPermissions(win, key) {
  if (!isOptinAvailable(win)) {
    return resolve(true);
  }
  var optIn = win[ADOBE][OPTIN];
  var categories = win[ADOBE][OPTIN][CATEGORIES] || {};
  var category = categories[key];
  return create(function(res, rej) {
    optIn[FETCH_PERMISSIONS](function() {
      if (optIn[IS_APPROVED](category)) {
        res(true);
      } else {
        rej(ERROR_TARGET_NOT_OPTED_IN);
      }
    }, true);
  });
}

function shouldUseOptin() {
  var config = getConfig();
  var optinEnabled = config[OPTIN_ENABLED];
  return isOptinEnabled(window$1, optinEnabled);
}
function isTargetApproved() {
  return isCategoryApproved(window$1, TARGET);
}
function isAnalyticsApproved() {
  return isCategoryApproved(window$1, ANALYTICS);
}
function fetchOptinPermissions() {
  return fetchPermissions(window$1, TARGET);
}

var SESSION_ID = uuid();
function getSessionIdFromQuery() {
  var location = window$1.location;
  var search = location.search;
  var params = parseQueryString(search);
  return params[SESSION_ID_PARAM];
}
function saveSessionId(value, config) {
  setTargetCookie({
    name: SESSION_ID_COOKIE,
    value: value,
    expires: config[SESSION_ID_LIFETIME],
    domain: config[COOKIE_DOMAIN]
  });
}
function getSessionId() {
  if (shouldUseOptin() && !isTargetApproved()) {
    return SESSION_ID;
  }
  var config = getConfig();
  var sessionIdQuery = getSessionIdFromQuery();
  if (isNotBlank(sessionIdQuery)) {
    saveSessionId(sessionIdQuery, config);
    return getTargetCookie(SESSION_ID_COOKIE);
  }
  var sessionId = getTargetCookie(SESSION_ID_COOKIE);
  if (isBlank(sessionId)) {
    saveSessionId(SESSION_ID, config);
  }
  return getTargetCookie(SESSION_ID_COOKIE);
}

function setDeviceId(value) {
  var config = getConfig();
  setTargetCookie({
    name: DEVICE_ID_COOKIE,
    value: value,
    expires: config[DEVICE_ID_LIFETIME],
    domain: config[COOKIE_DOMAIN]
  });
}
function getDeviceId() {
  return getTargetCookie(DEVICE_ID_COOKIE);
}

var CLUSTER_ID_REGEX = /.*\.(\d+)_\d+/;
function extractCluster(id) {
  if (isBlank(id)) {
    return "";
  }
  var result = CLUSTER_ID_REGEX.exec(id);
  if (isEmpty(result) || result.length !== 2) {
    return "";
  }
  return result[1];
}
function getEdgeCluster() {
  var config = getConfig();
  if (!config[OVERRIDE_MBOX_EDGE_SERVER]) {
    return "";
  }
  var result = getCookie(EDGE_CLUSTER_COOKIE);
  return isBlank(result) ? "" : result;
}
function setEdgeCluster(id) {
  var config = getConfig();
  if (!config[OVERRIDE_MBOX_EDGE_SERVER]) {
    return;
  }
  var domain = config[COOKIE_DOMAIN];
  var expires = new Date(now() + config[OVERRIDE_MBOX_EDGE_SERVER_TIMEOUT]);
  var savedCluster = getCookie(EDGE_CLUSTER_COOKIE);
  var attrs = {
    domain: domain,
    expires: expires
  };
  if (isNotBlank(savedCluster)) {
    setCookie(EDGE_CLUSTER_COOKIE, savedCluster, attrs);
    return;
  }
  var cluster = extractCluster(id);
  if (isBlank(cluster)) {
    return;
  }
  setCookie(EDGE_CLUSTER_COOKIE, cluster, attrs);
}

function bootstrapNotify(win, doc) {
  if (isFunction(win.CustomEvent)) {
    return;
  }
  function CustomEvent(event, params) {
    var evt = doc.createEvent("CustomEvent");
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };
    evt.initCustomEvent(
      event,
      params.bubbles,
      params.cancelable,
      params.detail
    );
    return evt;
  }
  CustomEvent.prototype = win.Event.prototype;
  win.CustomEvent = CustomEvent;
}
function createTracking(getSessionId, getDeviceId) {
  var sessionId = getSessionId();
  var deviceId = getDeviceId();
  var result = {};
  result.sessionId = sessionId;
  if (isNotBlank(deviceId)) {
    result.deviceId = deviceId;
    return result;
  }
  return result;
}
function notify(win, doc, eventName, detail) {
  var event = new win.CustomEvent(eventName, {
    detail: detail
  });
  doc.dispatchEvent(event);
}

bootstrapNotify(window$1, document$1);
var LIBRARY_LOADED = "at-library-loaded";
var REQUEST_START = "at-request-start";
var REQUEST_SUCCEEDED$1 = "at-request-succeeded";
var REQUEST_FAILED$1 = "at-request-failed";
var CONTENT_RENDERING_START = "at-content-rendering-start";
var CONTENT_RENDERING_SUCCEEDED = "at-content-rendering-succeeded";
var CONTENT_RENDERING_FAILED = "at-content-rendering-failed";
var CONTENT_RENDERING_NO_OFFERS = "at-content-rendering-no-offers";
var CONTENT_RENDERING_REDIRECT = "at-content-rendering-redirect";
function buildPayload(type, detail) {
  var mbox = detail.mbox,
    error = detail.error,
    url = detail.url,
    analyticsDetails = detail.analyticsDetails,
    responseTokens = detail.responseTokens,
    execution = detail.execution;
  var tracking = createTracking(getSessionId, getDeviceId);
  var payload = {
    type: type,
    tracking: tracking
  };
  if (!isNil(mbox)) {
    payload.mbox = mbox;
  }
  if (!isNil(error)) {
    payload.error = error;
  }
  if (!isNil(url)) {
    payload.url = url;
  }
  if (!isEmpty(analyticsDetails)) {
    payload.analyticsDetails = analyticsDetails;
  }
  if (!isEmpty(responseTokens)) {
    payload.responseTokens = responseTokens;
  }
  if (!isEmpty(execution)) {
    payload.execution = execution;
  }
  return payload;
}
function notifyLibraryLoaded() {
  var payload = buildPayload(LIBRARY_LOADED, {});
  notify(window$1, document$1, LIBRARY_LOADED, payload);
}
function notifyRequestStart(detail) {
  var payload = buildPayload(REQUEST_START, detail);
  notify(window$1, document$1, REQUEST_START, payload);
}
function notifyRequestSucceeded(detail, redirect) {
  var payload = buildPayload(REQUEST_SUCCEEDED$1, detail);
  payload.redirect = redirect;
  notify(window$1, document$1, REQUEST_SUCCEEDED$1, payload);
}
function notifyRequestFailed(detail) {
  var payload = buildPayload(REQUEST_FAILED$1, detail);
  notify(window$1, document$1, REQUEST_FAILED$1, payload);
}
function notifyRenderingStart(detail) {
  var payload = buildPayload(CONTENT_RENDERING_START, detail);
  notify(window$1, document$1, CONTENT_RENDERING_START, payload);
}
function notifyRenderingSucceeded(detail) {
  var payload = buildPayload(CONTENT_RENDERING_SUCCEEDED, detail);
  notify(window$1, document$1, CONTENT_RENDERING_SUCCEEDED, payload);
}
function notifyRenderingFailed(detail) {
  var payload = buildPayload(CONTENT_RENDERING_FAILED, detail);
  notify(window$1, document$1, CONTENT_RENDERING_FAILED, payload);
}
function notifyRenderingNoOffers(detail) {
  var payload = buildPayload(CONTENT_RENDERING_NO_OFFERS, detail);
  notify(window$1, document$1, CONTENT_RENDERING_NO_OFFERS, payload);
}
function notifyRenderingRedirect(detail) {
  var payload = buildPayload(CONTENT_RENDERING_REDIRECT, detail);
  notify(window$1, document$1, CONTENT_RENDERING_REDIRECT, payload);
}

var EQ_START = ":eq(";
var EQ_END = ")";
var EQ_LENGTH = EQ_START.length;
var DIGIT_IN_SELECTOR_PATTERN = /((\.|#)(-)?\d{1})/g;
function createPair(match) {
  var first = match.charAt(0);
  var second = match.charAt(1);
  var third = match.charAt(2);
  var result = {
    key: match
  };
  if (second === "-") {
    result.val = "" + first + second + "\\3" + third + " ";
  } else {
    result.val = first + "\\3" + second + " ";
  }
  return result;
}
function escapeDigitsInSelector(selector) {
  var matches = selector.match(DIGIT_IN_SELECTOR_PATTERN);
  if (isEmpty(matches)) {
    return selector;
  }
  var pairs = map(createPair, matches);
  return reduce(
    function(acc, pair) {
      return acc.replace(pair.key, pair.val);
    },
    selector,
    pairs
  );
}
function parseSelector(selector) {
  var result = [];
  var sel = trim(selector);
  var currentIndex = sel.indexOf(EQ_START);
  var head;
  var tail;
  var eq;
  var index;
  while (currentIndex !== -1) {
    head = trim(sel.substring(0, currentIndex));
    tail = trim(sel.substring(currentIndex));
    index = tail.indexOf(EQ_END);
    eq = trim(tail.substring(EQ_LENGTH, index));
    sel = trim(tail.substring(index + 1));
    currentIndex = sel.indexOf(EQ_START);
    if (head && eq) {
      result.push({
        sel: head,
        eq: Number(eq)
      });
    }
  }
  if (sel) {
    result.push({
      sel: sel
    });
  }
  return result;
}
function select(selector) {
  if (isElement(selector)) {
    return $(selector);
  }
  if (!isString(selector)) {
    return $(selector);
  }
  var selectorAsString = escapeDigitsInSelector(selector);
  if (selectorAsString.indexOf(EQ_START) === -1) {
    return $(selectorAsString);
  }
  var parts = parseSelector(selectorAsString);
  return reduce(
    function(acc, part) {
      var sel = part.sel,
        eq = part.eq;
      acc = acc.find(sel);
      if (isNumber(eq)) {
        acc = acc.eq(eq);
      }
      return acc;
    },
    $(document$1),
    parts
  );
}
function exists$2(selector) {
  return select(selector).length > 0;
}
function fragment(content) {
  return $("<" + DIV_TAG + "/>").append(content);
}
function wrap(content) {
  return $(content);
}
function prev(selector) {
  return select(selector).prev();
}
function next(selector) {
  return select(selector).next();
}
function parent(selector) {
  return select(selector).parent();
}
function is(query, selector) {
  return select(selector).is(query);
}
function find(query, selector) {
  return select(selector).find(query);
}
function children(selector) {
  return select(selector).children();
}

var LOAD_ERROR = "Unable to load target-vec.js";
var LOAD_AUTHORING = "Loading target-vec.js";
var NAMESPACE = "_AT";
var EDITOR = "clickHandlerForExperienceEditor";
var CURRENT_VIEW = "currentView";
function initNamespace() {
  window$1[NAMESPACE] = window$1[NAMESPACE] || {};
  window$1[NAMESPACE].querySelectorAll = select;
}
function handleAuthoringTriggeredView(options) {
  if (!isAuthoringEnabled()) {
    return;
  }
  var viewName = options[VIEW_NAME];
  window$1[NAMESPACE][CURRENT_VIEW] = viewName;
}
function setupClickHandler() {
  document$1.addEventListener(
    CLICK,
    function(event) {
      if (isFunction(window$1[NAMESPACE][EDITOR])) {
        window$1[NAMESPACE][EDITOR](event);
      }
    },
    true
  );
}
function initAuthoringCode() {
  if (!isAuthoringEnabled()) {
    return;
  }
  initNamespace();
  var config = getConfig();
  var authoringScriptUrl = config[AUTHORING_SCRIPT_URL];
  var success = function success() {
    return setupClickHandler();
  };
  var error = function error() {
    return logWarn(LOAD_ERROR);
  };
  logDebug(LOAD_AUTHORING);
  loadScript(authoringScriptUrl)
    .then(success)
    ["catch"](error);
}

var QA_MODE_COOKIE = "at_qa_mode";
var PREVIEW_TOKEN = "at_preview_token";
var PREVIEW_INDEX = "at_preview_index";
var ACTIVITIES_ONLY = "at_preview_listed_activities_only";
var TRUE_AUDIENCE_IDS = "at_preview_evaluate_as_true_audience_ids";
var FALSE_AUDIENCE_IDS = "at_preview_evaluate_as_false_audience_ids";
var UNDERSCORE = "_";
var notNull = function notNull(v) {
  return !isNil(v);
};
function toNumber(value) {
  return parseInt(value, 10);
}
function getIndex(value) {
  var result = toNumber(value);
  return isNaN(result) ? null : result;
}
function extractAudienceIds(value) {
  return split(UNDERSCORE, value);
}
function parsePreviewIndex(value) {
  var pair = split(UNDERSCORE, value);
  var activityIndex = getIndex(pair[0]);
  if (isNil(activityIndex)) {
    return null;
  }
  var result = {};
  result.activityIndex = activityIndex;
  var experienceIndex = getIndex(pair[1]);
  if (!isNil(experienceIndex)) {
    result.experienceIndex = experienceIndex;
  }
  return result;
}
function parsePreviewIndexes(values) {
  return filter(notNull, map(parsePreviewIndex, values));
}
function extractPreviewIndexes(value) {
  if (isArray(value)) {
    return parsePreviewIndexes(value);
  }
  return parsePreviewIndexes([value]);
}
function extractQaMode(queryString) {
  var query = parseQueryString(queryString);
  var token = query[PREVIEW_TOKEN];
  if (isBlank(token)) {
    return null;
  }
  var result = {};
  result.token = token;
  var listedActivitiesOnly = query[ACTIVITIES_ONLY];
  if (isNotBlank(listedActivitiesOnly) && listedActivitiesOnly === TRUE) {
    result.listedActivitiesOnly = true;
  }
  var trueAudiences = query[TRUE_AUDIENCE_IDS];
  if (isNotBlank(trueAudiences)) {
    result.evaluateAsTrueAudienceIds = extractAudienceIds(trueAudiences);
  }
  var falseAudiences = query[FALSE_AUDIENCE_IDS];
  if (isNotBlank(falseAudiences)) {
    result.evaluateAsFalseAudienceIds = extractAudienceIds(falseAudiences);
  }
  var previewIndexes = query[PREVIEW_INDEX];
  if (isEmpty(previewIndexes)) {
    return result;
  }
  result.previewIndexes = extractPreviewIndexes(previewIndexes);
  return result;
}
function initQaMode(win) {
  var result = extractQaMode(win.location.search);
  if (isNil(result)) {
    return;
  }
  var expires = new Date(now() + 1.86e6);
  setCookie(QA_MODE_COOKIE, JSON.stringify(result), {
    expires: expires
  });
}
function getQaMode() {
  var result = getCookie(QA_MODE_COOKIE);
  if (isBlank(result)) {
    return {};
  }
  try {
    return JSON.parse(result);
  } catch (e) {
    return {};
  }
}

function remove(selector) {
  return select(selector)
    .empty()
    .remove();
}
function after(content, selector) {
  return select(selector).after(content);
}
function before(content, selector) {
  return select(selector).before(content);
}
function append(content, selector) {
  return select(selector).append(content);
}
function prepend(content, selector) {
  return select(selector).prepend(content);
}
function setHtml(content, selector) {
  return select(selector).html(content);
}
function getHtml(selector) {
  return select(selector).html();
}
function setText(content, selector) {
  return select(selector).text(content);
}

var STYLE_PREFIX = "at-";
var BODY_STYLE_ID = "at-body-style";
var BODY_STYLE_ID_SELECTOR = "#" + BODY_STYLE_ID;
var ALL_VIEWS_STYLE_ID = STYLE_PREFIX + "views";
function createStyleMarkup(id, content) {
  return (
    "<" +
    STYLE_TAG +
    " " +
    ID +
    '="' +
    id +
    '" ' +
    CLASS +
    '="' +
    FLICKER_CONTROL_CLASS +
    '">' +
    content +
    "</" +
    STYLE_TAG +
    ">"
  );
}
function createActionStyle(styleDef, selector) {
  var id = STYLE_PREFIX + hash(selector);
  var style = selector + " {" + styleDef + "}";
  return createStyleMarkup(id, style);
}
function createAllViewsStyle(styleDef, aggregateSelector) {
  var style = aggregateSelector + " {" + styleDef + "}";
  return createStyleMarkup(ALL_VIEWS_STYLE_ID, style);
}
function addHidingSnippet(config) {
  var bodyHidingEnabled = config[BODY_HIDING_ENABLED];
  if (bodyHidingEnabled !== true) {
    return;
  }
  if (exists$2(BODY_STYLE_ID_SELECTOR)) {
    return;
  }
  var bodyHiddenStyle = config[BODY_HIDDEN_STYLE];
  append(createStyleMarkup(BODY_STYLE_ID, bodyHiddenStyle), HEAD_TAG);
}
function removeHidingSnippet(config) {
  var bodyHidingEnabled = config[BODY_HIDING_ENABLED];
  if (bodyHidingEnabled !== true) {
    return;
  }
  if (!exists$2(BODY_STYLE_ID_SELECTOR)) {
    return;
  }
  remove(BODY_STYLE_ID_SELECTOR);
}
function addActionHidings(config, selectors) {
  if (isEmpty(selectors)) {
    return;
  }
  var alreadyHidden = function alreadyHidden(selector) {
    return !exists$2("#" + (STYLE_PREFIX + hash(selector)));
  };
  var selectorsToHide = filter(alreadyHidden, selectors);
  if (isEmpty(selectorsToHide)) {
    return;
  }
  var styleDef = config[DEFAULT_CONTENT_HIDDEN_STYLE];
  var buildStyle = function buildStyle(selector) {
    return createActionStyle(styleDef, selector);
  };
  var content = join("\n", map(buildStyle, selectorsToHide));
  append(content, HEAD_TAG);
}
function addAllViewsHidings(config, selectors) {
  if (isEmpty(selectors) || exists$2("#" + ALL_VIEWS_STYLE_ID)) {
    return;
  }
  var styleDef = config[DEFAULT_CONTENT_HIDDEN_STYLE];
  var aggregateSelector = join(", ", selectors);
  var content = createAllViewsStyle(styleDef, aggregateSelector);
  append(content, HEAD_TAG);
}

function injectHidingSnippetStyle() {
  addHidingSnippet(getConfig());
}
function removeHidingSnippetStyle() {
  removeHidingSnippet(getConfig());
}
function injectActionHidingStyles(selectors) {
  addActionHidings(getConfig(), selectors);
}
function injectAllViewsHidingStyle(selectors) {
  addAllViewsHidings(getConfig(), selectors);
}
function removeActionHidingStyle(selector) {
  var id = STYLE_PREFIX + hash(selector);
  remove("#" + id);
}
function removeAllViewsHidingStyle() {
  var hidingStyleSelector = "#" + ALL_VIEWS_STYLE_ID;
  if (exists$2(hidingStyleSelector)) {
    remove(hidingStyleSelector);
  }
}

var OPTOUT_MESSAGE = "Disabled due to optout";
var MCAAMB = "MCAAMB";
var MCAAMLH = "MCAAMLH";
var MCMID = "MCMID";
var MCOPTOUT = "MCOPTOUT";
var SDID_METHOD = "getSupplementalDataID";
var CIDS_METHOD = "getCustomerIDs";
var TRACK_SERVER_PROP = "trackingServer";
var TRACK_SERVER_SECURE_PROP = TRACK_SERVER_PROP + "Secure";
function hasId(value) {
  return !isNil(value[ID]);
}
function hasAuthState(value) {
  return !isNil(value[AUTH_STATE]);
}
function getAuthenticatedState(value) {
  switch (value) {
    case 0:
      return "unknown";
    case 1:
      return "authenticated";
    case 2:
      return "logged_out";
    default:
      return "unknown";
  }
}
function isCustomerId(value) {
  return hasId(value) || hasAuthState(value);
}
function getCustomerIds(visitor) {
  if (isNil(visitor)) {
    return [];
  }
  if (!isFunction(visitor[CIDS_METHOD])) {
    return [];
  }
  var customerIds = visitor[CIDS_METHOD]();
  if (!isObject(customerIds)) {
    return [];
  }
  return reduce(
    function(acc, value, key) {
      var item = {};
      item[INTEGRATION_CODE] = key;
      if (hasId(value)) {
        item[ID] = value[ID];
      }
      if (hasAuthState(value)) {
        item[AUTHENTICATED_STATE] = getAuthenticatedState(value[AUTH_STATE]);
      }
      acc.push(item);
      return acc;
    },
    [],
    filter(isCustomerId, customerIds)
  );
}
function getSdid(visitor, consumerId) {
  if (isNil(visitor)) {
    return null;
  }
  if (!isFunction(visitor[SDID_METHOD])) {
    return null;
  }
  return visitor[SDID_METHOD](consumerId);
}
function getInstanceProperty(visitor, property) {
  if (isNil(visitor)) {
    return null;
  }
  var result = visitor[property];
  if (isNil(result)) {
    return null;
  }
  return result;
}

var VISITOR = "Visitor";
var GET_INSTANCE_METHOD = "getInstance";
var IS_ALLOWED_METHOD = "isAllowed";
function getInstance(win, imsOrgId, sdidParamExpiry) {
  if (isBlank(imsOrgId)) {
    return null;
  }
  if (isNil(win[VISITOR])) {
    return null;
  }
  if (!isFunction(win[VISITOR][GET_INSTANCE_METHOD])) {
    return null;
  }
  var visitor = win[VISITOR][GET_INSTANCE_METHOD](imsOrgId, {
    sdidParamExpiry: sdidParamExpiry
  });
  if (
    isObject(visitor) &&
    isFunction(visitor[IS_ALLOWED_METHOD]) &&
    visitor[IS_ALLOWED_METHOD]()
  ) {
    return visitor;
  }
  return null;
}

var TIMEOUT_MESSAGE = "Visitor API requests timed out";
var ERROR_MESSAGE = "Visitor API requests error";
function getVisitorValuesAsync(visitor, optoutEnabled) {
  if (!isFunction(visitor.getVisitorValues)) {
    return resolve({});
  }
  var fields = [MCMID, MCAAMB, MCAAMLH];
  if (optoutEnabled) {
    fields.push(MCOPTOUT);
  }
  return create(function(res) {
    visitor.getVisitorValues(function(values) {
      return res(values);
    }, fields);
  });
}
function handleError(error) {
  logDebug(ERROR_MESSAGE, error);
  return {};
}
function getAsyncValues(visitor, visitorApiTimeout, optoutEnabled) {
  if (isNil(visitor)) {
    return resolve({});
  }
  var requests = getVisitorValuesAsync(visitor, optoutEnabled);
  return timeout(requests, visitorApiTimeout, TIMEOUT_MESSAGE)["catch"](
    handleError
  );
}

function getVisitorValues(visitor, optoutEnabled) {
  if (!isFunction(visitor.getVisitorValues)) {
    return {};
  }
  var fields = [MCMID, MCAAMB, MCAAMLH];
  if (optoutEnabled) {
    fields.push(MCOPTOUT);
  }
  var result = {};
  visitor.getVisitorValues(function(values) {
    return assign(result, values);
  }, fields);
  return result;
}
function getSyncValues(visitor, optoutEnabled) {
  if (isNil(visitor)) {
    return {};
  }
  return getVisitorValues(visitor, optoutEnabled);
}

function getVisitorInstance() {
  var config = getConfig();
  var imsOrgId = config[IMS_ORG_ID];
  var sdidParamExpiry = config[SUPPLEMENTAL_DATA_ID_PARAM_TIMEOUT];
  return getInstance(window$1, imsOrgId, sdidParamExpiry);
}
function getAsyncVisitorValues() {
  var visitor = getVisitorInstance();
  var config = getConfig();
  var visitorApiTimeout = config[VISITOR_API_TIMEOUT];
  var optoutEnabled = config[OPTOUT_ENABLED];
  return getAsyncValues(visitor, visitorApiTimeout, optoutEnabled);
}
function getSyncVisitorValues() {
  var visitor = getVisitorInstance();
  var config = getConfig();
  var optoutEnabled = config[OPTOUT_ENABLED];
  return getSyncValues(visitor, optoutEnabled);
}
function getCustomerIdsVisitorValues() {
  return getCustomerIds(getVisitorInstance());
}
function getSdidVisitorValue(consumerId) {
  return getSdid(getVisitorInstance(), consumerId);
}
function getVisitorProperty(property) {
  return getInstanceProperty(getVisitorInstance(), property);
}

var storage = {};
function setItem(key, value) {
  storage[key] = value;
}
function getItem(key) {
  return storage[key];
}

var LOG_PREFIX = "Data provider";
var TIMED_OUT = "timed out";
var MAX_TIMEOUT = 2000;
function areDataProvidersPresent(win) {
  var globalSettings = win[GLOBAL_SETTINGS];
  if (isNil(globalSettings)) {
    return false;
  }
  var dataProviders = globalSettings[DATA_PROVIDERS];
  if (!isArray(dataProviders) || isEmpty(dataProviders)) {
    return false;
  }
  return true;
}
function isValidDataProvider(dataProvider) {
  var name = dataProvider[NAME];
  if (!isString(name) || isEmpty(name)) {
    return false;
  }
  var version = dataProvider[VERSION];
  if (!isString(version) || isEmpty(version)) {
    return false;
  }
  var wait = dataProvider[TIMEOUT];
  if (!isNil(wait) && !isNumber(wait)) {
    return false;
  }
  var provider = dataProvider[PROVIDER];
  if (!isFunction(provider)) {
    return false;
  }
  return true;
}
function createPromise(provider) {
  return create(function(success, error) {
    provider(function(err, params) {
      if (!isNil(err)) {
        error(err);
        return;
      }
      success(params);
    });
  });
}
function createTrace(nameKey, name, versionKey, version, resKey, res) {
  var dataProviderTrace = {};
  dataProviderTrace[nameKey] = name;
  dataProviderTrace[versionKey] = version;
  dataProviderTrace[resKey] = res;
  var result = {};
  result[DATA_PROVIDER] = dataProviderTrace;
  return result;
}
function convertToPromise(dataProvider) {
  var name = dataProvider[NAME];
  var version = dataProvider[VERSION];
  var wait = dataProvider[TIMEOUT] || MAX_TIMEOUT;
  var provider = dataProvider[PROVIDER];
  var promise = createPromise(provider);
  return timeout(promise, wait, TIMED_OUT)
    .then(function(params) {
      var trace = createTrace(NAME, name, VERSION, version, PARAMS, params);
      logDebug(LOG_PREFIX, SUCCESS, trace);
      addClientTrace(trace);
      return params;
    })
    ["catch"](function(error) {
      var trace = createTrace(NAME, name, VERSION, version, ERROR, error);
      logDebug(LOG_PREFIX, ERROR, trace);
      addClientTrace(trace);
      return {};
    });
}
function collectParams(arr) {
  var result = reduce(
    function(acc, value) {
      return assign(acc, value);
    },
    {},
    arr
  );
  setItem(DATA_PROVIDERS, result);
  return result;
}
function executeAsyncDataProviders(win) {
  if (!areDataProvidersPresent(win)) {
    return resolve({});
  }
  var dataProviders = win[GLOBAL_SETTINGS][DATA_PROVIDERS];
  var validProviders = filter(isValidDataProvider, dataProviders);
  return all(map(convertToPromise, validProviders)).then(collectParams);
}
function executeSyncDataProviders() {
  var result = getItem(DATA_PROVIDERS);
  if (isNil(result)) {
    return {};
  }
  return result;
}

function getAsyncDataProvidersParameters() {
  return executeAsyncDataProviders(window$1);
}
function getSyncDataProvidersParameters() {
  return executeSyncDataProviders();
}

var TOKEN_PARAM = "authorization";
var TOKEN_COOKIE = "mboxDebugTools";
function getTokenFromQueryString(win) {
  var location = win.location;
  var search = location.search;
  var params = parseQueryString(search);
  var result = params[TOKEN_PARAM];
  if (isBlank(result)) {
    return null;
  }
  return result;
}
function getTokenFromCookie() {
  var result = getCookie(TOKEN_COOKIE);
  if (isBlank(result)) {
    return null;
  }
  return result;
}
function getTraceToken() {
  var param = getTokenFromQueryString(window$1);
  var cookie = getTokenFromCookie();
  return param || cookie;
}

function isPair(pair) {
  return !isEmpty(pair) && pair.length === 2 && isNotBlank(pair[0]);
}
function createPair$1(param) {
  var index = param.indexOf("=");
  if (index === -1) {
    return [];
  }
  return [param.substr(0, index), param.substr(index + 1)];
}
function objectToParamsInternal(obj, ks, result, keyFunc) {
  forEach(function(value, key) {
    if (isObject(value)) {
      ks.push(key);
      objectToParamsInternal(value, ks, result, keyFunc);
      ks.pop();
    } else if (isEmpty(ks)) {
      result[keyFunc(key)] = value;
    } else {
      result[keyFunc(join(".", ks.concat(key)))] = value;
    }
  }, obj);
}
function queryStringToParams(queryString) {
  return filter(function(value, key) {
    return isNotBlank(key);
  }, parseQueryString(queryString));
}
function arrayToParams(array) {
  var pairs = reduce(
    function(acc, param) {
      acc.push(createPair$1(param));
      return acc;
    },
    [],
    filter(isNotBlank, array)
  );
  return reduce(
    function(acc, pair) {
      acc[decode(trim(pair[0]))] = decode(trim(pair[1]));
      return acc;
    },
    {},
    filter(isPair, pairs)
  );
}
function objectToParams(object, keyFunc) {
  var result = {};
  if (isNil(keyFunc)) {
    objectToParamsInternal(object, [], result, identity);
  } else {
    objectToParamsInternal(object, [], result, keyFunc);
  }
  return result;
}
function functionToParams(func) {
  if (!isFunction(func)) {
    return {};
  }
  var params = null;
  try {
    params = func();
  } catch (_ignore) {
    return {};
  }
  if (isNil(params)) {
    return {};
  }
  if (isArray(params)) {
    return arrayToParams(params);
  }
  if (isString(params) && isNotBlank(params)) {
    return queryStringToParams(params);
  }
  if (isObject(params)) {
    return objectToParams(params);
  }
  return {};
}

function getParamsAll(mboxParams) {
  return assign({}, mboxParams, functionToParams(window$1.targetPageParamsAll));
}
function getParams(globalMboxParams) {
  return assign(
    {},
    globalMboxParams,
    functionToParams(window$1.targetPageParams)
  );
}
function getTargetPageParams(mbox) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var mboxParams = config[MBOX_PARAMS];
  var globalMboxParams = config[GLOBAL_MBOX_PARAMS];
  if (globalMbox !== mbox) {
    return getParamsAll(mboxParams || {});
  }
  return assign(
    getParamsAll(mboxParams || {}),
    getParams(globalMboxParams || {})
  );
}

function getWebGLRendererInternal() {
  var canvas = document$1.createElement("canvas");
  var gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (isNil(gl)) {
    return null;
  }
  var glInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (isNil(glInfo)) {
    return null;
  }
  var result = gl.getParameter(glInfo.UNMASKED_RENDERER_WEBGL);
  if (isNil(result)) {
    return null;
  }
  return result;
}
var WEB_GL_RENDERER_INTERNAL = getWebGLRendererInternal();
function getPixelRatio() {
  var ratio = window$1.devicePixelRatio;
  if (!isNil(ratio)) {
    return ratio;
  }
  ratio = 1;
  var screen = window$1.screen;
  var systemXDPI = screen.systemXDPI,
    logicalXDPI = screen.logicalXDPI;
  if (!isNil(systemXDPI) && !isNil(logicalXDPI) && systemXDPI > logicalXDPI) {
    ratio = systemXDPI / logicalXDPI;
  }
  return ratio;
}
function getScreenOrientation() {
  var screen = window$1.screen;
  var orientation = screen.orientation,
    width = screen.width,
    height = screen.height;
  if (isNil(orientation)) {
    return width > height ? "landscape" : "portrait";
  }
  if (isNil(orientation.type)) {
    return null;
  }
  var parts = split("-", orientation.type);
  if (isEmpty(parts)) {
    return null;
  }
  var result = parts[0];
  if (!isNil(result)) {
    return result;
  }
  return null;
}
function getWebGLRenderer() {
  return WEB_GL_RENDERER_INTERNAL;
}

var PROFILE_PREFIX = "profile.";
var THIRD_PARTY_ID = "mbox3rdPartyId";
var PROPERTY_TOKEN = "at_property";
var ORDER_ID = "orderId";
var ORDER_TOTAL = "orderTotal";
var PRODUCT_PURCHASED_ID = "productPurchasedId";
var PRODUCT_ID = "productId";
var CATEGORY_ID = "categoryId";
function isThirdPartyId(param) {
  return param === THIRD_PARTY_ID;
}
function isProfileParam(param) {
  return param.indexOf(PROFILE_PREFIX) !== -1;
}
function isPropertyToken(param) {
  return param === PROPERTY_TOKEN;
}
function isOrderId(param) {
  return param === ORDER_ID;
}
function isOrderTotal(param) {
  return param === ORDER_TOTAL;
}
function isProductPurchasedId(param) {
  return param === PRODUCT_PURCHASED_ID;
}
function isProductId(param) {
  return param === PRODUCT_ID;
}
function isCategoryId(param) {
  return param === CATEGORY_ID;
}
function isSpecialParam(param) {
  return (
    isProfileParam(param) ||
    isThirdPartyId(param) ||
    isPropertyToken(param) ||
    isOrderId(param) ||
    isOrderTotal(param) ||
    isProductPurchasedId(param) ||
    isProductId(param) ||
    isCategoryId(param)
  );
}
function extractProfileParam(param) {
  return param.substring(PROFILE_PREFIX.length);
}
function getThirdPartyId(parameters) {
  return parameters[THIRD_PARTY_ID];
}
function getPropertyToken(params) {
  return params[PROPERTY_TOKEN];
}
function getOrderId(params) {
  return params[ORDER_ID];
}
function getOrderTotal(params) {
  return params[ORDER_TOTAL];
}
function getPurchasedProductIds(params) {
  var value = params[PRODUCT_PURCHASED_ID];
  var result = map(trim, split(",", value));
  return filter(isNotBlank, result);
}
function getProductId(params) {
  return params[PRODUCT_ID];
}
function getCategoryId(params) {
  return params[CATEGORY_ID];
}
function getParams$1(params) {
  return reduce(
    function(acc, value, key) {
      if (isSpecialParam(key)) {
        return acc;
      }
      acc[key] = isNil(value) ? "" : value;
      return acc;
    },
    {},
    params
  );
}
function getProfileParams(params) {
  return reduce(
    function(acc, value, key) {
      if (!isProfileParam(key)) {
        return acc;
      }
      var profileKey = extractProfileParam(key);
      if (isBlank(profileKey)) {
        return acc;
      }
      acc[profileKey] = isNil(value) ? "" : value;
      return acc;
    },
    {},
    params
  );
}

var POST = "POST";
var NETWORK_ERROR = "Network request failed";
var REQUEST_TIMEOUT = "Request timed out";
var MALFORMED_RESPONSE = "Malformed response JSON";
function addOnload(xhr, resolve, reject) {
  xhr.onload = function() {
    var status = xhr.status === 1223 ? 204 : xhr.status;
    if (status < 100 || status > 599) {
      reject(new Error(NETWORK_ERROR));
      return;
    }
    var response;
    try {
      response = JSON.parse(xhr.responseText);
    } catch (e) {
      reject(new Error(MALFORMED_RESPONSE));
      return;
    }
    var headers = xhr.getAllResponseHeaders();
    resolve({
      status: status,
      headers: headers,
      response: response
    });
  };
  return xhr;
}
function addOnerror(xhr, reject) {
  xhr.onerror = function() {
    reject(new Error(NETWORK_ERROR));
  };
  return xhr;
}
function addOntimeout(xhr, timeout, reject) {
  xhr.timeout = timeout;
  xhr.ontimeout = function() {
    reject(new Error(REQUEST_TIMEOUT));
  };
  return xhr;
}
function addHeaders(xhr) {
  var headers =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  forEach(function(values, key) {
    if (!isArray(values)) {
      return;
    }
    forEach(function(value) {
      xhr.setRequestHeader(key, value);
    }, values);
  }, headers);
  return xhr;
}
function executeXhr(_ref) {
  var url = _ref.url,
    headers = _ref.headers,
    body = _ref.body,
    timeout = _ref.timeout,
    async = _ref.async;
  return create(function(resolve, reject) {
    var xhr = new window.XMLHttpRequest();
    xhr = addOnload(xhr, resolve, reject);
    xhr = addOnerror(xhr, reject);
    xhr.open(POST, url, async);
    xhr.withCredentials = true;
    xhr = addHeaders(xhr, headers);
    if (async) {
      xhr = addOntimeout(xhr, timeout, reject);
    }
    xhr.send(JSON.stringify(body));
  }).then(function(xhrResponse) {
    var response = xhrResponse.response;
    var status = response.status,
      message = response.message;
    if (!isNil(status) && !isNil(message)) {
      throw new Error(message);
    }
    return response;
  });
}

var WEB_CHANNEL = "web";
var EDGE_SERVER_PREFIX = "mboxedge";
var EDGE_SERVER_DOMAIN = ".tt.omtrdc.net";
var notEmpty = function notEmpty(val) {
  return !isEmpty(val);
};
function throwIfOptout(values) {
  var optout = values[MCOPTOUT];
  if (optout) {
    throw new Error(OPTOUT_MESSAGE);
  }
  return values;
}
function getAsyncThirdPartyData() {
  var visitorValues = getAsyncVisitorValues();
  var dataProvidersParams = getAsyncDataProvidersParameters();
  return all([visitorValues.then(throwIfOptout), dataProvidersParams]);
}
function getSyncThirdPartyData() {
  var visitorValues = getSyncVisitorValues();
  var dataProvidersParams = getSyncDataProvidersParameters();
  return [visitorValues, dataProvidersParams];
}
function getAllParams(providersParams) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  return assign({}, providersParams, getTargetPageParams(globalMbox));
}
function getTimeOffset() {
  return -new Date().getTimezoneOffset();
}
function createScreen() {
  var screen = window$1.screen;
  return {
    width: screen.width,
    height: screen.height,
    orientation: getScreenOrientation(),
    colorDepth: screen.colorDepth,
    pixelRatio: getPixelRatio()
  };
}
function createWindow() {
  var documentElement = document$1.documentElement;
  return {
    width: documentElement.clientWidth,
    height: documentElement.clientHeight
  };
}
function createBrowser() {
  var location = window$1.location;
  return {
    host: location.hostname,
    webGLRenderer: getWebGLRenderer()
  };
}
function createAddress() {
  var location = window$1.location;
  return {
    url: location.href,
    referringUrl: document$1.referrer
  };
}
function createContext(context) {
  if (!isNil(context) && context.channel === WEB_CHANNEL) {
    return context;
  }
  var validContext = context || {};
  var beacon = validContext.beacon;
  return {
    userAgent: window$1.navigator.userAgent,
    timeOffsetInMinutes: getTimeOffset(),
    channel: WEB_CHANNEL,
    screen: createScreen(),
    window: createWindow(),
    browser: createBrowser(),
    address: createAddress(),
    beacon: beacon
  };
}
function createAudienceManager(audienceManager, visitorValues) {
  if (!isNil(audienceManager)) {
    return audienceManager;
  }
  var result = {};
  if (isEmpty(visitorValues)) {
    return result;
  }
  var locationHint = visitorValues[MCAAMLH];
  var locationHintNumber = parseInt(locationHint, 10);
  if (!isNaN(locationHintNumber)) {
    result.locationHint = locationHintNumber;
  }
  var blob = visitorValues[MCAAMB];
  if (isNotBlank(blob)) {
    result.blob = blob;
  }
  return result;
}
function createCustomerId(data) {
  var id = data.id,
    integrationCode = data.integrationCode,
    authenticatedState = data.authenticatedState;
  var result = {};
  if (isNotBlank(id)) {
    result.id = id;
  }
  if (isNotBlank(integrationCode)) {
    result.integrationCode = integrationCode;
  }
  if (isNotBlank(authenticatedState)) {
    result.authenticatedState = authenticatedState;
  }
  return result;
}
function createCustomerIds(customerIdsValues) {
  return map(createCustomerId, customerIdsValues);
}
function createVisitorId(
  id,
  deviceId,
  thirdPartyId,
  visitorValues,
  customerIdsValues
) {
  var result = {};
  if (isNotBlank(deviceId)) {
    result.tntId = deviceId;
  }
  if (isNotBlank(thirdPartyId)) {
    result.thirdPartyId = thirdPartyId;
  }
  if (isNotBlank(id.thirdPartyId)) {
    result.thirdPartyId = id.thirdPartyId;
  }
  var mid = visitorValues[MCMID];
  if (isNotBlank(mid)) {
    result.marketingCloudVisitorId = mid;
  }
  if (isNotBlank(id.marketingCloudVisitorId)) {
    result.marketingCloudVisitorId = id.marketingCloudVisitorId;
  }
  if (!isEmpty(id.customerIds)) {
    result.customerIds = id.customerIds;
    return result;
  }
  if (!isEmpty(customerIdsValues)) {
    result.customerIds = createCustomerIds(customerIdsValues);
  }
  return result;
}
function createExperienceCloud(experienceCloud, visitorValues) {
  var result = {};
  var audienceManager = createAudienceManager(
    experienceCloud.audienceManager,
    visitorValues
  );
  if (!isEmpty(audienceManager)) {
    result.audienceManager = audienceManager;
  }
  if (!isEmpty(experienceCloud.analytics)) {
    result.analytics = experienceCloud.analytics;
  }
  return result;
}
function createProperty(property, allParams) {
  if (!isNil(property) && isNotBlank(property.token)) {
    return property;
  }
  var result = {};
  var token = getPropertyToken(allParams);
  if (isNotBlank(token)) {
    result.token = token;
  }
  return result;
}
function createTrace$1(trace) {
  if (!isNil(trace) && isNotBlank(trace.authorizationToken)) {
    return trace;
  }
  var result = {};
  var authorizationToken = getTraceToken();
  if (isNotBlank(authorizationToken)) {
    result.authorizationToken = authorizationToken;
  }
  return result;
}
function createQaMode(qaMode) {
  if (!isNil(qaMode)) {
    return qaMode;
  }
  return getQaMode();
}
function createOrder(params) {
  var result = {};
  var orderId = getOrderId(params);
  if (!isNil(orderId)) {
    result.id = orderId;
  }
  var orderTotal = getOrderTotal(params);
  var orderTotalNumber = parseFloat(orderTotal);
  if (!isNaN(orderTotalNumber)) {
    result.total = orderTotalNumber;
  }
  var purchasedProductIds = getPurchasedProductIds(params);
  if (!isEmpty(purchasedProductIds)) {
    result.purchasedProductIds = purchasedProductIds;
  }
  return result;
}
function createProduct(params) {
  var result = {};
  var productId = getProductId(params);
  if (!isNil(productId)) {
    result.id = productId;
  }
  var categoryId = getCategoryId(params);
  if (!isNil(categoryId)) {
    result.categoryId = categoryId;
  }
  return result;
}
function createRequestDetails(item, allParams) {
  var result = {};
  var params = assign({}, getParams$1(allParams), item.parameters || {});
  var profileParams = assign(
    {},
    getProfileParams(allParams),
    item.profileParameters || {}
  );
  var order = assign({}, createOrder(allParams), item.order || {});
  var product = assign({}, createProduct(allParams), item.product || {});
  if (!isEmpty(params)) {
    result.parameters = params;
  }
  if (!isEmpty(profileParams)) {
    result.profileParameters = profileParams;
  }
  if (!isEmpty(order)) {
    result.order = order;
  }
  if (!isEmpty(product)) {
    result.product = product;
  }
  return result;
}
function createMboxRequestDetails(item, allParams) {
  var index = item.index,
    name = item.name,
    address = item.address;
  var params = assign({}, allParams, getTargetPageParams(name));
  var result = createRequestDetails(item, params);
  if (!isNil(index)) {
    result.index = index;
  }
  if (isNotBlank(name)) {
    result.name = name;
  }
  if (!isEmpty(address)) {
    result.address = address;
  }
  return result;
}
function createViewRequestDetails(item, allParams) {
  var name = item.name,
    address = item.address;
  var result = createRequestDetails(item, allParams);
  if (isNotBlank(name)) {
    result.name = name;
  }
  if (!isEmpty(address)) {
    result.address = address;
  }
  return result;
}
function createExecute(request, allParams) {
  var _request$execute = request.execute,
    execute = _request$execute === void 0 ? {} : _request$execute;
  var result = {};
  if (isEmpty(execute)) {
    return result;
  }
  var pageLoad = execute.pageLoad;
  if (!isNil(pageLoad)) {
    result.pageLoad = createRequestDetails(pageLoad, allParams);
  }
  var mboxes = execute.mboxes;
  if (!isNil(mboxes) && isArray(mboxes) && !isEmpty(mboxes)) {
    var temp = filter(
      notEmpty,
      map(function(e) {
        return createMboxRequestDetails(e, allParams);
      }, mboxes)
    );
    if (!isEmpty(temp)) {
      result.mboxes = temp;
    }
  }
  return result;
}
function createPrefetch(request, allParams) {
  var _request$prefetch = request.prefetch,
    prefetch = _request$prefetch === void 0 ? {} : _request$prefetch;
  var result = {};
  if (isEmpty(prefetch)) {
    return result;
  }
  var mboxes = prefetch.mboxes;
  if (!isNil(mboxes) && isArray(mboxes) && !isEmpty(mboxes)) {
    result.mboxes = map(function(e) {
      return createMboxRequestDetails(e, allParams);
    }, mboxes);
  }
  var views = prefetch.views;
  if (!isNil(views) && isArray(views) && !isEmpty(views)) {
    result.views = map(function(e) {
      return createViewRequestDetails(e, allParams);
    }, views);
  }
  return result;
}
function createAnalytics(consumerId, request) {
  if (shouldUseOptin() && !isAnalyticsApproved()) {
    return null;
  }
  var config = getConfig();
  var sdid = getSdidVisitorValue(consumerId);
  var server = getVisitorProperty(TRACK_SERVER_PROP);
  var serverSecure = getVisitorProperty(TRACK_SERVER_SECURE_PROP);
  var _request$experienceCl = request.experienceCloud,
    experienceCloud =
      _request$experienceCl === void 0 ? {} : _request$experienceCl;
  var _experienceCloud$anal = experienceCloud.analytics,
    analytics = _experienceCloud$anal === void 0 ? {} : _experienceCloud$anal;
  var logging = analytics.logging,
    supplementalDataId = analytics.supplementalDataId,
    trackingServer = analytics.trackingServer,
    trackingServerSecure = analytics.trackingServerSecure;
  var result = {};
  if (!isNil(logging)) {
    result.logging = logging;
  } else {
    result.logging = config[ANALYTICS_LOGGING];
  }
  if (!isNil(supplementalDataId)) {
    result.supplementalDataId = supplementalDataId;
  }
  if (isNotBlank(sdid)) {
    result.supplementalDataId = sdid;
  }
  if (!isNil(trackingServer)) {
    result.trackingServer = trackingServer;
  }
  if (isNotBlank(server)) {
    result.trackingServer = server;
  }
  if (!isNil(trackingServerSecure)) {
    result.trackingServerSecure = trackingServerSecure;
  }
  if (isNotBlank(serverSecure)) {
    result.trackingServerSecure = serverSecure;
  }
  if (isEmpty(result)) {
    return null;
  }
  return result;
}
function createDeliveryRequest(request, visitorValues, providersParams) {
  var allParams = getAllParams(providersParams);
  var deviceId = getDeviceId();
  var thirdPartyId = getThirdPartyId(allParams);
  var customerIdsValues = getCustomerIdsVisitorValues();
  var visitorId = createVisitorId(
    request.id || {},
    deviceId,
    thirdPartyId,
    visitorValues,
    customerIdsValues
  );
  var property = createProperty(request.property, allParams);
  var experienceCloud = createExperienceCloud(
    request.experienceCloud || {},
    visitorValues
  );
  var trace = createTrace$1(request.trace);
  var qaMode = createQaMode(request.qaMode);
  var execute = createExecute(request, allParams);
  var prefetch = createPrefetch(request, allParams);
  var notifications = request.notifications;
  var result = {};
  result.requestId = uuid();
  result.context = createContext(request.context);
  if (!isEmpty(visitorId)) {
    result.id = visitorId;
  }
  if (!isEmpty(property)) {
    result.property = property;
  }
  if (!isEmpty(trace)) {
    result.trace = trace;
  }
  if (!isEmpty(experienceCloud)) {
    result.experienceCloud = experienceCloud;
  }
  if (!isEmpty(qaMode)) {
    result.qaMode = qaMode;
  }
  if (!isEmpty(execute)) {
    result.execute = execute;
  }
  if (!isEmpty(prefetch)) {
    result.prefetch = prefetch;
  }
  if (!isEmpty(notifications)) {
    result.notifications = notifications;
  }
  return result;
}
function buildRequest(request, params, data) {
  var visitorValues = data[0];
  var providersValues = data[1];
  var providersParams = assign({}, providersValues, params);
  return createDeliveryRequest(request, visitorValues, providersParams);
}
function createAsyncDeliveryRequest(request, params) {
  return getAsyncThirdPartyData().then(function(data) {
    return buildRequest(request, params, data);
  });
}
function createSyncDeliveryRequest(request, params) {
  var data = getSyncThirdPartyData();
  return buildRequest(request, params, data);
}
function getTimeout(config, timeout) {
  if (!isNumber(timeout)) {
    return config[TIMEOUT];
  }
  if (timeout < 0) {
    return config[TIMEOUT];
  }
  return timeout;
}
function getServerDomain(config) {
  var serverDomain = config[SERVER_DOMAIN];
  var overrideMboxEdgeServer = config[OVERRIDE_MBOX_EDGE_SERVER];
  if (!overrideMboxEdgeServer) {
    return serverDomain;
  }
  var cluster = getEdgeCluster();
  if (isBlank(cluster)) {
    return serverDomain;
  }
  return "" + EDGE_SERVER_PREFIX + cluster + EDGE_SERVER_DOMAIN;
}
function createRequestUrl(config) {
  var scheme = config[SCHEME];
  var host = getServerDomain(config);
  var path = config[ENDPOINT];
  var client = config[CLIENT_CODE];
  var sessionId = getSessionId();
  var version = config[VERSION];
  var queryString = stringifyQueryString({
    client: client,
    sessionId: sessionId,
    version: version
  });
  return scheme + "//" + host + path + "?" + queryString;
}
function executeRequest(request, requestTimeout) {
  var config = getConfig();
  var url = createRequestUrl(config);
  var headers = _defineProperty({}, CONTENT_TYPE, [TEXT_PLAIN]);
  var timeout = getTimeout(config, requestTimeout);
  var async = true;
  var options = {
    url: url,
    headers: headers,
    body: request,
    timeout: timeout,
    async: async
  };
  logDebug(REQUEST, request);
  addClientTrace({
    request: request
  });
  return executeXhr(options).then(function(response) {
    logDebug(RESPONSE, response);
    addClientTrace({
      response: response
    });
    return {
      request: request,
      response: response
    };
  });
}

var prop = function prop(key) {
  return function(obj) {
    return obj[key];
  };
};
var not = function not(pred) {
  return function(val) {
    return !pred(val);
  };
};
var notNil = not(isNil);
var filterBy = function filterBy(pred) {
  return function(coll) {
    return filter(pred, coll);
  };
};
var isError = function isError(val) {
  return val.status === ERROR;
};
var isActions = function isActions(val) {
  return val.type === ACTIONS;
};
var isRedirect = function isRedirect(val) {
  return val.type === REDIRECT;
};
var filterNotNil = filterBy(notNil);
var selectOptions = prop(OPTIONS);
var selectContent = prop(CONTENT);
var selectResponseTokens = prop(RESPONSE_TOKENS);
var hasName = function hasName(val) {
  return isNotBlank(val.name);
};
var hasIndex = function hasIndex(val) {
  return !isNil(val.index);
};
var isValidMbox = function isValidMbox(val) {
  return isObject(val) && hasName(val);
};
var isValidPrefetchMbox = function isValidPrefetchMbox(val) {
  return isObject(val) && hasName(val) && hasIndex(val);
};
var isValidView = function isValidView(val) {
  return isObject(val) && hasName(val);
};
var hasSelector = function hasSelector(val) {
  return isNotBlank(val.selector);
};
var selectData = prop(DATA);
var hasData = flow([selectData, notNil]);
function createSuccess(type, data) {
  return {
    status: SUCCESS,
    type: type,
    data: data
  };
}
function createError(type, data) {
  return {
    status: ERROR,
    type: type,
    data: data
  };
}
function isValidOption(option) {
  return isObject(option);
}
function isValidOptionEventToken(option) {
  if (!isValidOption(option)) {
    return false;
  }
  return isNotBlank(option.eventToken);
}
function isValidMetric(metric) {
  if (isEmpty(metric) || isBlank(metric.type)) {
    return false;
  }
  return isNotBlank(metric.eventToken);
}
function isValidSelectorMetric(metric) {
  if (!isValidMetric(metric)) {
    return false;
  }
  return isNotBlank(metric.selector);
}

function hasDeviceId(res) {
  var id = res.id;
  return isObject(id) && isNotBlank(id.tntId);
}
function handleDeviceId(context) {
  var response = context.response;
  if (hasDeviceId(response)) {
    setDeviceId(response.id.tntId);
  }
  return context;
}

function handleEdgeCluster(context) {
  var response = context.response;
  if (hasDeviceId(response)) {
    var id = response.id;
    var tntId = id.tntId;
    setEdgeCluster(tntId);
  }
  setEdgeCluster(null);
  return context;
}

function addTraceIfExists() {
  var item =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var trace = item.trace;
  if (!isEmpty(trace)) {
    addServerTrace(trace);
  }
}
function handleTraces(httpContext) {
  var response = httpContext.response;
  var _response$execute = response.execute,
    execute = _response$execute === void 0 ? {} : _response$execute,
    _response$prefetch = response.prefetch,
    prefetch = _response$prefetch === void 0 ? {} : _response$prefetch;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad,
    _execute$mboxes = execute.mboxes,
    mboxes = _execute$mboxes === void 0 ? [] : _execute$mboxes;
  var _prefetch$mboxes = prefetch.mboxes,
    prefetchMboxes = _prefetch$mboxes === void 0 ? [] : _prefetch$mboxes,
    _prefetch$views = prefetch.views,
    views = _prefetch$views === void 0 ? [] : _prefetch$views;
  addTraceIfExists(pageLoad);
  forEach(addTraceIfExists, mboxes);
  forEach(addTraceIfExists, prefetchMboxes);
  forEach(addTraceIfExists, views);
  return httpContext;
}

var SDID_PARAM = "adobe_mc_sdid";
function getRedirectUriParams(uri) {
  var result = uri.queryKey;
  var param = result[SDID_PARAM];
  if (!isString(param)) {
    return result;
  }
  if (isBlank(param)) {
    return result;
  }
  var nowInSeconds = Math.round(now() / 1000);
  result[SDID_PARAM] = param.replace(/\|TS=\d+/, "|TS=" + nowInSeconds);
  return result;
}
function getUriParams(uri) {
  return uri.queryKey;
}
function createUrlInternal(url, params, uriParamsFunc) {
  var parsedUri = parseUri$1(url);
  var protocol = parsedUri.protocol;
  var host = parsedUri.host;
  var path = parsedUri.path;
  var port = parsedUri.port === "" ? "" : ":" + parsedUri.port;
  var anchor = isBlank(parsedUri.anchor) ? "" : "#" + parsedUri.anchor;
  var uriParams = uriParamsFunc(parsedUri);
  var queryString = stringifyQueryString(assign({}, uriParams, params));
  var query = isBlank(queryString) ? "" : "?" + queryString;
  return protocol + "://" + host + port + path + query + anchor;
}
function createRedirectUrl(url, params) {
  return createUrlInternal(url, params, getRedirectUriParams);
}
function createUrl(url, params) {
  return createUrlInternal(url, params, getUriParams);
}

function createRedirectOption(option) {
  var url = option.content;
  if (isBlank(url)) {
    logDebug(EMPTY_URL, option);
    return null;
  }
  var result = assign({}, option);
  result.content = createRedirectUrl(url, {});
  return result;
}

var NETWORK_ERROR$1 = "Network request failed";
var REQUEST_TIMEOUT$1 = "Request timed out";
var URL_REQUIRED = "URL is required";
var GET = "GET";
var POST$1 = "POST";
var METHOD = "method";
var URL = "url";
var HEADERS = "headers";
var DATA$1 = "data";
var CREDENTIALS = "credentials";
var TIMEOUT$1 = "timeout";
var ASYNC = "async";
function throwError(message) {
  throw new Error(message);
}
function processOptions(options) {
  var method = options[METHOD] || GET;
  var url = options[URL] || throwError(URL_REQUIRED);
  var headers = options[HEADERS] || {};
  var data = options[DATA$1] || null;
  var credentials = options[CREDENTIALS] || false;
  var timeout = options[TIMEOUT$1] || 3000;
  var async = isNil(options[ASYNC]) ? true : options[ASYNC] === true;
  var result = {};
  result[METHOD] = method;
  result[URL] = url;
  result[HEADERS] = headers;
  result[DATA$1] = data;
  result[CREDENTIALS] = credentials;
  result[TIMEOUT$1] = timeout;
  result[ASYNC] = async;
  return result;
}
function addOnload$1(xhr, resolve, reject) {
  xhr.onload = function() {
    var status = xhr.status === 1223 ? 204 : xhr.status;
    if (status < 100 || status > 599) {
      reject(new Error(NETWORK_ERROR$1));
      return;
    }
    var response = xhr.responseText;
    var headers = xhr.getAllResponseHeaders();
    var result = {
      status: status,
      headers: headers,
      response: response
    };
    resolve(result);
  };
  return xhr;
}
function addOnerror$1(xhr, reject) {
  xhr.onerror = function() {
    reject(new Error(NETWORK_ERROR$1));
  };
  return xhr;
}
function addOntimeout$1(xhr, timeout, reject) {
  xhr.timeout = timeout;
  xhr.ontimeout = function() {
    reject(new Error(REQUEST_TIMEOUT$1));
  };
  return xhr;
}
function addCredentials(xhr, credentials) {
  if (credentials === true) {
    xhr.withCredentials = credentials;
  }
  return xhr;
}
function addHeaders$1(xhr, headers) {
  forEach(function(value, key) {
    forEach(function(v) {
      return xhr.setRequestHeader(key, v);
    }, value);
  }, headers);
  return xhr;
}
function createXhrPromise(win, opts) {
  var options = processOptions(opts);
  var method = options[METHOD];
  var url = options[URL];
  var headers = options[HEADERS];
  var data = options[DATA$1];
  var credentials = options[CREDENTIALS];
  var timeout = options[TIMEOUT$1];
  var async = options[ASYNC];
  return create(function(resolve, reject) {
    var xhr = new win.XMLHttpRequest();
    xhr = addOnload$1(xhr, resolve, reject);
    xhr = addOnerror$1(xhr, reject);
    xhr.open(method, url, async);
    xhr = addCredentials(xhr, credentials);
    xhr = addHeaders$1(xhr, headers);
    if (async) {
      xhr = addOntimeout$1(xhr, timeout, reject);
    }
    xhr.send(data);
  });
}

function xhr(options) {
  return createXhrPromise(window$1, options);
}

function createOptions(url, params, timeout) {
  var result = {};
  result[METHOD] = GET;
  result[URL] = createUrl(url, params);
  result[TIMEOUT$1] = timeout;
  return result;
}
function isSuccess(status) {
  return (status >= 200 && status < 300) || status === 304;
}
function createOption(res) {
  var status = res.status;
  if (!isSuccess(status)) {
    return null;
  }
  var content = res.response;
  if (isBlank(content)) {
    return null;
  }
  var result = {};
  result.type = HTML;
  result.content = content;
  return result;
}
function createHtmlOption(option) {
  var content = option.content;
  var config = getConfig();
  var timeout = config[TIMEOUT$1];
  return xhr(createOptions(content, {}, timeout))
    .then(createOption)
    ["catch"](function() {
      return null;
    });
}

var CLICK_TRACK_PATTERN = /CLKTRK#(\S+)/;
var CLICK_TRACK_REPLACE_PATTERN = /CLKTRK#(\S+)\s/;
function getClickTrackNodeId(action) {
  var selector = action[SELECTOR];
  if (isBlank(selector)) {
    return "";
  }
  var result = CLICK_TRACK_PATTERN.exec(selector);
  if (isEmpty(result) || result.length !== 2) {
    return "";
  }
  return result[1];
}
function getContent(id, content) {
  var div = document.createElement(DIV_TAG);
  div.innerHTML = content;
  var firstElement = div.firstElementChild;
  if (isNil(firstElement)) {
    return content;
  }
  firstElement.id = id;
  return firstElement.outerHTML;
}
function processClickTrackId(action) {
  var content = action[CONTENT];
  var nodeId = getClickTrackNodeId(action);
  if (isBlank(nodeId) || isBlank(content)) {
    return action;
  }
  var selector = action[SELECTOR];
  action[SELECTOR] = selector.replace(CLICK_TRACK_REPLACE_PATTERN, "");
  action[CONTENT] = getContent(nodeId, content);
  return action;
}

var notNull$1 = function notNull(val) {
  return !isNil(val);
};
function hasSelector$1(action) {
  var selector = action.selector;
  return !isNil(selector);
}
function setHtml$1(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function setText$1(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function appendHtml(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function prependHtml(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function replaceHtml(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function insertBefore(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function insertAfter(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var result = processClickTrackId(action);
  var content = result[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, result);
    return null;
  }
  return result;
}
function customCode(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_CONTENT, action);
    return null;
  }
  return action;
}
function setAttribute(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isObject(content)) {
    logDebug(EMPTY_ATTRIBUTE, action);
    return null;
  }
  return action;
}
function setImageSource(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isString(content)) {
    logDebug(EMPTY_IMAGE_URL, action);
    return null;
  }
  return action;
}
function setStyle(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isObject(content)) {
    logDebug(EMPTY_PROPERTY, action);
    return null;
  }
  return action;
}
function resize(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isObject(content)) {
    logDebug(EMPTY_SIZES, action);
    return null;
  }
  return action;
}
function move(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isObject(content)) {
    logDebug(EMPTY_COORDINATES, action);
    return null;
  }
  return action;
}
function remove$1(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  return action;
}
function rearrange(action) {
  if (!hasSelector$1(action)) {
    return null;
  }
  var content = action[CONTENT];
  if (!isObject(content)) {
    logDebug(EMPTY_REARRANGE, action);
    return null;
  }
  return action;
}
function redirect(action) {
  var content = action.content;
  if (isBlank(content)) {
    logDebug(EMPTY_URL, action);
    return null;
  }
  action.content = createRedirectUrl(content, {});
  return action;
}
function processAction(action) {
  var type = action[TYPE];
  if (isBlank(type)) {
    return null;
  }
  switch (type) {
    case SET_HTML:
      return setHtml$1(action);
    case SET_TEXT:
      return setText$1(action);
    case APPEND_HTML:
      return appendHtml(action);
    case PREPEND_HTML:
      return prependHtml(action);
    case REPLACE_HTML:
      return replaceHtml(action);
    case INSERT_BEFORE:
      return insertBefore(action);
    case INSERT_AFTER:
      return insertAfter(action);
    case CUSTOM_CODE:
      return customCode(action);
    case SET_ATTRIBUTE:
      return setAttribute(action);
    case SET_IMAGE_SOURCE:
      return setImageSource(action);
    case SET_STYLE:
      return setStyle(action);
    case RESIZE:
      return resize(action);
    case MOVE:
      return move(action);
    case REMOVE:
      return remove$1(action);
    case REARRANGE:
      return rearrange(action);
    case REDIRECT:
      return redirect(action);
    default:
      return null;
  }
}
function createActionsOption(option) {
  var actions = option[CONTENT];
  if (!isArray(actions)) {
    return null;
  }
  if (isEmpty(actions)) {
    return null;
  }
  var processedActions = filter(notNull$1, map(processAction, actions));
  if (isEmpty(processedActions)) {
    return null;
  }
  var result = assign({}, option);
  result.content = processedActions;
  return result;
}

function getTokens() {
  var value =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var options = value.options;
  if (!isArray(options)) {
    return [];
  }
  if (isEmpty(options)) {
    return [];
  }
  return filterNotNil(map(selectResponseTokens, options));
}
function getResponseTokens() {
  var response =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _response$execute = response.execute,
    execute = _response$execute === void 0 ? {} : _response$execute,
    _response$prefetch = response.prefetch,
    prefetch = _response$prefetch === void 0 ? {} : _response$prefetch;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad,
    _execute$mboxes = execute.mboxes,
    mboxes = _execute$mboxes === void 0 ? [] : _execute$mboxes;
  var _prefetch$mboxes = prefetch.mboxes,
    prefetchMboxes = _prefetch$mboxes === void 0 ? [] : _prefetch$mboxes,
    _prefetch$views = prefetch.views,
    views = _prefetch$views === void 0 ? [] : _prefetch$views;
  var pageLoadTokens = getTokens(pageLoad);
  var mboxesTokens = flatten(map(getTokens, mboxes));
  var prefetchMboxesTokens = flatten(map(getTokens, prefetchMboxes));
  var viewsTokens = flatten(map(getTokens, views));
  return flatten([
    pageLoadTokens,
    mboxesTokens,
    prefetchMboxesTokens,
    viewsTokens
  ]);
}

function getRedirect() {
  var response =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _response$execute = response.execute,
    execute = _response$execute === void 0 ? {} : _response$execute;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad,
    _execute$mboxes = execute.mboxes,
    mboxes = _execute$mboxes === void 0 ? [] : _execute$mboxes;
  var pageLoadOpts = selectOptions(pageLoad) || [];
  var mboxesOpts = flatten(filterNotNil(map(selectOptions, mboxes)));
  var options = flatten([pageLoadOpts, mboxesOpts]);
  var actions = flatten(map(selectContent, filter(isActions, options)));
  var redirectOptions = filter(isRedirect, options);
  var redirectActions = filter(isRedirect, actions);
  var redirects = redirectOptions.concat(redirectActions);
  var result = {};
  if (isEmpty(redirects)) {
    return result;
  }
  var redirect = redirects[0];
  var url = redirect.content;
  if (isBlank(url)) {
    return result;
  }
  result.url = url;
  return result;
}

function getAnalytics() {
  var item =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var analytics = item.analytics;
  return isEmpty(analytics) ? [] : [analytics];
}
function getAnalyticsDetails() {
  var response =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _response$execute = response.execute,
    execute = _response$execute === void 0 ? {} : _response$execute,
    _response$prefetch = response.prefetch,
    prefetch = _response$prefetch === void 0 ? {} : _response$prefetch;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad,
    _execute$mboxes = execute.mboxes,
    mboxes = _execute$mboxes === void 0 ? [] : _execute$mboxes;
  var _prefetch$mboxes = prefetch.mboxes,
    prefetchMboxes = _prefetch$mboxes === void 0 ? [] : _prefetch$mboxes,
    _prefetch$views = prefetch.views,
    views = _prefetch$views === void 0 ? [] : _prefetch$views;
  var pageLoadDetails = getAnalytics(pageLoad);
  var mboxesDetails = flatten(map(getAnalytics, mboxes));
  var prefetchMboxesDetails = flatten(map(getAnalytics, prefetchMboxes));
  var viewsDetails = flatten(map(getAnalytics, views));
  return flatten([
    pageLoadDetails,
    mboxesDetails,
    prefetchMboxesDetails,
    viewsDetails
  ]);
}

function addContextDetails(to, from) {
  to.parameters = from.parameters;
  to.profileParameters = from.profileParameters;
  to.order = from.order;
  to.product = from.product;
}
function addOptionsAndMetrics(result, arr) {
  var options = arr[0];
  var metrics = arr[1];
  var hasOptions = !isEmpty(options);
  var hasMetrics = !isEmpty(metrics);
  if (!hasOptions && !hasMetrics) {
    return result;
  }
  if (hasOptions) {
    result.options = options;
  }
  if (hasMetrics) {
    result.metrics = metrics;
  }
  return result;
}
function processOption(option) {
  var type = option.type;
  switch (type) {
    case REDIRECT:
      return resolve(createRedirectOption(option));
    case DYNAMIC:
      return createHtmlOption(option);
    case ACTIONS:
      return resolve(createActionsOption(option));
    default:
      return resolve(option);
  }
}
function processOptions$1(options, predicate) {
  if (!isArray(options)) {
    return resolve([]);
  }
  if (isEmpty(options)) {
    return resolve([]);
  }
  var validOptions = filter(predicate, options);
  if (isEmpty(validOptions)) {
    return resolve([]);
  }
  var optionsPromises = map(function(opt) {
    return processOption(opt);
  }, validOptions);
  return all(optionsPromises).then(filterNotNil);
}
function processMetrics(metrics, predicate) {
  if (!isArray(metrics)) {
    return resolve([]);
  }
  if (isEmpty(metrics)) {
    return resolve([]);
  }
  return resolve(filter(predicate, metrics));
}
function processPageLoad(httpContext) {
  var response = httpContext.response;
  var execute = response.execute;
  if (!isObject(execute)) {
    return resolve(null);
  }
  var pageLoad = execute.pageLoad;
  if (!isObject(pageLoad)) {
    return resolve(null);
  }
  var analytics = pageLoad.analytics,
    options = pageLoad.options,
    metrics = pageLoad.metrics;
  var result = {
    analytics: analytics
  };
  return all([
    processOptions$1(options, isValidOption),
    processMetrics(metrics, isValidSelectorMetric)
  ]).then(function(arr) {
    return addOptionsAndMetrics(result, arr);
  });
}
function processExecuteMbox(item) {
  var name = item.name,
    analytics = item.analytics,
    options = item.options,
    metrics = item.metrics;
  var result = {
    name: name,
    analytics: analytics
  };
  return all([
    processOptions$1(options, isValidOption),
    processMetrics(metrics, isValidMetric)
  ]).then(function(arr) {
    return addOptionsAndMetrics(result, arr);
  });
}
function processExecuteMboxes(httpContext) {
  var response = httpContext.response;
  var execute = response.execute;
  if (!isObject(execute)) {
    return resolve([]);
  }
  var mboxes = execute.mboxes;
  if (!isArray(mboxes) || isEmpty(mboxes)) {
    return resolve([]);
  }
  var validMboxes = filter(isValidMbox, mboxes);
  return all(map(processExecuteMbox, validMboxes)).then(filterNotNil);
}
function sameMbox(mbox, index, name) {
  return mbox.index === index && mbox.name === name;
}
function getRequestMbox(request, index, name) {
  var _request$prefetch = request.prefetch,
    prefetch = _request$prefetch === void 0 ? {} : _request$prefetch;
  var _prefetch$mboxes = prefetch.mboxes,
    mboxes = _prefetch$mboxes === void 0 ? [] : _prefetch$mboxes;
  if (isEmpty(mboxes)) {
    return null;
  }
  return first(
    filter(function(item) {
      return sameMbox(item, index, name);
    }, mboxes)
  );
}
function processPrefetchMbox(request, item) {
  var index = item.index,
    name = item.name,
    state = item.state,
    analytics = item.analytics,
    options = item.options,
    metrics = item.metrics;
  var requestMbox = getRequestMbox(request, index, name);
  var result = {
    name: name,
    state: state,
    analytics: analytics
  };
  if (!isNil(requestMbox)) {
    addContextDetails(result, requestMbox);
  }
  return all([
    processOptions$1(options, isValidOptionEventToken),
    processMetrics(metrics, isValidMetric)
  ]).then(function(arr) {
    return addOptionsAndMetrics(result, arr);
  });
}
function processPrefetchMboxes(httpContext) {
  var request = httpContext.request,
    response = httpContext.response;
  var prefetch = response.prefetch;
  if (!isObject(prefetch)) {
    return resolve([]);
  }
  var mboxes = prefetch.mboxes;
  if (!isArray(mboxes) || isEmpty(mboxes)) {
    return resolve([]);
  }
  var validMboxes = filter(isValidPrefetchMbox, mboxes);
  var process = function process(item) {
    return processPrefetchMbox(request, item);
  };
  return all(map(process, validMboxes)).then(filterNotNil);
}
function getRequestView(request) {
  var _request$prefetch2 = request.prefetch,
    prefetch = _request$prefetch2 === void 0 ? {} : _request$prefetch2;
  var _prefetch$views = prefetch.views,
    views = _prefetch$views === void 0 ? [] : _prefetch$views;
  if (isEmpty(views)) {
    return null;
  }
  return views[0];
}
function processView(request, view) {
  var name = view.name,
    state = view.state,
    analytics = view.analytics,
    options = view.options,
    metrics = view.metrics;
  var requestView = getRequestView(request);
  var result = {
    name: name.toLowerCase(),
    state: state,
    analytics: analytics
  };
  if (!isNil(requestView)) {
    addContextDetails(result, requestView);
  }
  return all([
    processOptions$1(options, isValidOptionEventToken),
    processMetrics(metrics, isValidSelectorMetric)
  ]).then(function(arr) {
    return addOptionsAndMetrics(result, arr);
  });
}
function processPrefetchViews(httpContext) {
  var request = httpContext.request,
    response = httpContext.response;
  var prefetch = response.prefetch;
  if (!isObject(prefetch)) {
    return resolve([]);
  }
  var views = prefetch.views;
  if (!isArray(views) || isEmpty(views)) {
    return resolve([]);
  }
  var validViews = filter(isValidView, views);
  var process = function process(view) {
    return processView(request, view);
  };
  return all(map(process, validViews)).then(filterNotNil);
}
function processPrefetchMetrics(httpContext) {
  var response = httpContext.response;
  var prefetch = response.prefetch;
  if (!isObject(prefetch)) {
    return resolve([]);
  }
  var metrics = prefetch.metrics;
  return processMetrics(metrics, isValidSelectorMetric);
}
function createResponseContext(arr) {
  var pageLoad = arr[0];
  var mboxes = arr[1];
  var prefetchMboxes = arr[2];
  var views = arr[3];
  var prefetchMetrics = arr[4];
  var result = {};
  var execute = {};
  if (isObject(pageLoad)) {
    execute.pageLoad = pageLoad;
  }
  if (!isEmpty(mboxes)) {
    execute.mboxes = mboxes;
  }
  var prefetch = {};
  if (!isEmpty(prefetchMboxes)) {
    prefetch.mboxes = prefetchMboxes;
  }
  if (!isEmpty(views)) {
    prefetch.views = views;
  }
  if (!isEmpty(prefetchMetrics)) {
    prefetch.metrics = prefetchMetrics;
  }
  if (!isEmpty(execute)) {
    result.execute = execute;
  }
  if (!isEmpty(prefetch)) {
    result.prefetch = prefetch;
  }
  return result;
}
function processResponse(httpContext) {
  var handlers = [handleTraces, handleDeviceId, handleEdgeCluster];
  var context = flow(handlers)(httpContext);
  var pageLoad = processPageLoad(context);
  var mboxes = processExecuteMboxes(context);
  var prefetchMboxes = processPrefetchMboxes(context);
  var views = processPrefetchViews(context);
  var prefetchMetrics = processPrefetchMetrics(context);
  var promises = [pageLoad, mboxes, prefetchMboxes, views, prefetchMetrics];
  return all(promises).then(createResponseContext);
}

function hasRedirect(response) {
  var redirect = getRedirect(response);
  return !isEmpty(redirect);
}
function createEventPayload(response) {
  var responseTokens = getResponseTokens(response);
  var payload = {};
  if (!isEmpty(responseTokens)) {
    payload.responseTokens = responseTokens;
  }
  return payload;
}

function handleRequestSuccess(response) {
  var payload = createEventPayload(response);
  var analyticsDetails = getAnalyticsDetails(response);
  if (!isEmpty(analyticsDetails)) {
    payload.analyticsDetails = analyticsDetails;
  }
  logDebug(REQUEST_SUCCEEDED, response);
  notifyRequestSucceeded(payload, hasRedirect(response));
  return resolve(response);
}
function handleMboxRequestSuccess(mbox, response) {
  var payload = createEventPayload(response);
  payload.mbox = mbox;
  logDebug(REQUEST_SUCCEEDED, response);
  notifyRequestSucceeded(payload, hasRedirect(response));
  return resolve(response);
}
function handleRequestError(error) {
  logWarn(REQUEST_FAILED, error);
  notifyRequestFailed({
    error: error
  });
  return reject(error);
}
function handleMboxRequestError(mbox, error) {
  logWarn(REQUEST_FAILED, error);
  notifyRequestFailed({
    mbox: mbox,
    error: error
  });
  return reject(error);
}
function executeGetOffer(options) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var mbox = options.mbox,
    timeout = options.timeout;
  var params = isObject(options.params) ? options.params : {};
  var successFunc = function successFunc(response) {
    return handleMboxRequestSuccess(mbox, response);
  };
  var errorFunc = function errorFunc(error) {
    return handleMboxRequestError(mbox, error);
  };
  var payload = {};
  var execute = {};
  if (mbox === globalMbox) {
    execute.pageLoad = {};
  } else {
    execute.mboxes = [
      {
        index: 0,
        name: mbox
      }
    ];
  }
  payload.execute = execute;
  var analytics = createAnalytics(mbox, payload);
  if (!isEmpty(analytics)) {
    var experienceCloud = {};
    experienceCloud.analytics = analytics;
    payload.experienceCloud = experienceCloud;
  }
  notifyRequestStart({
    mbox: mbox
  });
  return createAsyncDeliveryRequest(payload, params)
    .then(function(request) {
      return executeRequest(request, timeout);
    })
    .then(processResponse)
    .then(successFunc)
    ["catch"](errorFunc);
}
function executeGetOffers(options) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var _options$consumerId = options.consumerId,
    consumerId =
      _options$consumerId === void 0 ? globalMbox : _options$consumerId,
    request = options.request,
    timeout = options.timeout;
  var analytics = createAnalytics(consumerId, request);
  var successFunc = function successFunc(response) {
    return handleRequestSuccess(response);
  };
  var errorFunc = function errorFunc(error) {
    return handleRequestError(error);
  };
  if (!isEmpty(analytics)) {
    var experienceCloud = request.experienceCloud || {};
    experienceCloud.analytics = analytics;
    request.experienceCloud = experienceCloud;
  }
  notifyRequestStart({});
  return createAsyncDeliveryRequest(request, {})
    .then(function(deliveryRequest) {
      return executeRequest(deliveryRequest, timeout);
    })
    .then(processResponse)
    .then(successFunc)
    ["catch"](errorFunc);
}

function addClass(cssClass, selector) {
  return select(selector).addClass(cssClass);
}
function setCss(style, selector) {
  return select(selector).css(style);
}

function getAttr(name, selector) {
  return select(selector).attr(name);
}
function setAttr(name, value, selector) {
  return select(selector).attr(name, value);
}
function removeAttr(name, selector) {
  return select(selector).removeAttr(name);
}
function copyAttr(from, to, selector) {
  var value = getAttr(from, selector);
  if (isNotBlank(value)) {
    removeAttr(from, selector);
    setAttr(to, value, selector);
  }
}
function hasAttr(name, selector) {
  return isNotBlank(getAttr(name, selector));
}

var VISIBILITY_STATE = "visibilityState";
var VISIBLE = "visible";
var DELAY = 100;
function createError$1(selector) {
  return new Error("Could not find: " + selector);
}
function awaitUsingMutationObserver(selector, timeout, queryFunc) {
  return create(function(res, rej) {
    var mo = getMutationObserver(function() {
      var elems = queryFunc(selector);
      if (!isEmpty(elems)) {
        mo.disconnect();
        res(elems);
      }
    });
    delay(function() {
      mo.disconnect();
      rej(createError$1(selector));
    }, timeout);
    mo.observe(document$1, {
      childList: true,
      subtree: true
    });
  });
}
function canUseRequestAnimation() {
  return document$1[VISIBILITY_STATE] === VISIBLE;
}
function awaitUsingRequestAnimation(selector, timeout, queryFunc) {
  return create(function(res, rej) {
    function execute() {
      var elems = queryFunc(selector);
      if (!isEmpty(elems)) {
        res(elems);
        return;
      }
      window$1.requestAnimationFrame(execute);
    }
    execute();
    delay(function() {
      rej(createError$1(selector));
    }, timeout);
  });
}
function awaitUsingTimer(selector, timeout, queryFunc) {
  return create(function(res, rej) {
    function execute() {
      var elems = queryFunc(selector);
      if (!isEmpty(elems)) {
        res(elems);
        return;
      }
      delay(execute, DELAY);
    }
    execute();
    delay(function() {
      rej(createError$1(selector));
    }, timeout);
  });
}
function awaitSelector(selector) {
  var timeout =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : getConfig()[SELECTORS_POLLING_TIMEOUT];
  var queryFunc =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : select;
  var elems = queryFunc(selector);
  if (!isEmpty(elems)) {
    return resolve(elems);
  }
  if (canUseMutationObserver()) {
    return awaitUsingMutationObserver(selector, timeout, queryFunc);
  }
  if (canUseRequestAnimation()) {
    return awaitUsingRequestAnimation(selector, timeout, queryFunc);
  }
  return awaitUsingTimer(selector, timeout, queryFunc);
}

function getDataSrc(item) {
  return getAttr(DATA_SRC, item);
}
function hasDataSrc(item) {
  return hasAttr(DATA_SRC, item);
}
function disableImages(html) {
  forEach(function(item) {
    return copyAttr(SRC, DATA_SRC, item);
  }, toArray(find(IMAGE_TAG, html)));
  return html;
}
function enableImages(html) {
  forEach(function(item) {
    return copyAttr(DATA_SRC, SRC, item);
  }, toArray(find(IMAGE_TAG, html)));
  return html;
}
function loadImage(src) {
  logDebug(LOADING_IMAGE, src);
  return getAttr(SRC, setAttr(SRC, src, wrap("<" + IMAGE_TAG + "/>")));
}
function loadImages(html) {
  var elements = filter(hasDataSrc, toArray(find(IMAGE_TAG, html)));
  if (isEmpty(elements)) {
    return html;
  }
  forEach(loadImage, map(getDataSrc, elements));
  return html;
}
function renderImages(html) {
  return flow([disableImages, loadImages, enableImages])(html);
}

function getUrl(item) {
  var src = getAttr(SRC, item);
  return isNotBlank(src) ? src : null;
}
function getScriptsUrls(html) {
  return filter(isNotBlank, map(getUrl, toArray(find(SCRIPT, html))));
}
function loadScripts(urls) {
  return reduce(
    function(acc, url) {
      return acc.then(function() {
        logDebug(REMOTE_SCRIPT, url);
        addClientTrace({
          remoteScript: url
        });
        return loadScript(url);
      });
    },
    resolve(),
    urls
  );
}

function handleRenderingSuccess(action) {
  return action;
}
function handleRenderingError(action, error) {
  logWarn(UNEXPECTED_ERROR, error);
  addClientTrace({
    action: action,
    error: error
  });
  return action;
}
function renderHtml(renderFunc, action) {
  var container = select(action[SELECTOR]);
  var html = renderImages(fragment(action[CONTENT]));
  var urls = getScriptsUrls(html);
  var result;
  try {
    result = resolve(renderFunc(container, html));
  } catch (err) {
    return reject(handleRenderingError(action, err));
  }
  if (isEmpty(urls)) {
    return result
      .then(function() {
        return handleRenderingSuccess(action);
      })
      ["catch"](function(error) {
        return handleRenderingError(action, error);
      });
  }
  return result
    .then(function() {
      return loadScripts(urls);
    })
    .then(function() {
      return handleRenderingSuccess(action);
    })
    ["catch"](function(error) {
      return handleRenderingError(action, error);
    });
}

var HEAD_TAGS_SELECTOR = SCRIPT_TAG + "," + LINK_TAG + "," + STYLE_TAG;
function getHeadContent(content) {
  var container = fragment(content);
  var result = reduce(
    function(acc, elem) {
      acc.push(getHtml(fragment(elem)));
      return acc;
    },
    [],
    toArray(find(HEAD_TAGS_SELECTOR, container))
  );
  return join("", result);
}
function preprocessAction(action) {
  var result = assign({}, action);
  var content = result[CONTENT];
  if (isBlank(content)) {
    return result;
  }
  var container = select(result[SELECTOR]);
  if (!is(HEAD_TAG, container)) {
    return result;
  }
  result[TYPE] = APPEND_HTML;
  result[CONTENT] = getHeadContent(content);
  return result;
}
function addPxIfRequired(value) {
  var hasPx = value.indexOf("px") === value.length - 2;
  return hasPx ? value : value + "px";
}
function setHtmlRenderFunc(container, html) {
  return setHtml(getHtml(html), container);
}
function setHtml$2(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(setHtmlRenderFunc, action);
}
function setText$2(action) {
  var container = select(action[SELECTOR]);
  var content = action[CONTENT];
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  setText(content, container);
  return resolve(action);
}
function appendHtmlRenderFunc(container, html) {
  return append(getHtml(html), container);
}
function appendHtml$1(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(appendHtmlRenderFunc, action);
}
function prependHtmlRenderFunc(container, html) {
  return prepend(getHtml(html), container);
}
function prependHtml$1(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(prependHtmlRenderFunc, action);
}
function replaceHtmlRenderFunc(container, html) {
  var parentContainer = parent(container);
  remove(before(getHtml(html), container));
  return parentContainer;
}
function replaceHtml$1(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(replaceHtmlRenderFunc, action);
}
function insertBeforeRenderFunc(container, html) {
  return prev(before(getHtml(html), container));
}
function insertBefore$1(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(insertBeforeRenderFunc, action);
}
function insertAfterRenderFunc(container, html) {
  return next(after(getHtml(html), container));
}
function insertAfter$1(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(insertAfterRenderFunc, action);
}
function customCodeRenderFunc(container, html) {
  return parent(before(getHtml(html), container));
}
function customCode$1(action) {
  logDebug(ACTION_RENDERING, action);
  return renderHtml(customCodeRenderFunc, action);
}
function setImageSource$1(action) {
  var content = action[CONTENT];
  var container = select(action[SELECTOR]);
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  removeAttr(SRC, container);
  setAttr(SRC, loadImage(content), container);
  return resolve(action);
}
function setAttribute$1(action) {
  var content = action[CONTENT];
  var container = select(action[SELECTOR]);
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  forEach(function(value, key) {
    return setAttr(key, value, container);
  }, content);
  return resolve(action);
}
function setCssWithPriority(container, style, priority) {
  forEach(function(elem) {
    forEach(function(value, key) {
      return elem.style.setProperty(key, value, priority);
    }, style);
  }, toArray(container));
}
function setStyle$1(action) {
  var container = select(action[SELECTOR]);
  var content = action[CONTENT];
  var priority = content[PRIORITY];
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  if (isBlank(priority)) {
    setCss(content, container);
  } else {
    setCssWithPriority(container, content, priority);
  }
  return resolve(action);
}
function resize$1(action) {
  var container = select(action[SELECTOR]);
  var content = action[CONTENT];
  content[WIDTH] = addPxIfRequired(content[WIDTH]);
  content[HEIGHT] = addPxIfRequired(content[HEIGHT]);
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  setCss(content, container);
  return resolve(action);
}
function move$1(action) {
  var container = select(action[SELECTOR]);
  var content = action[CONTENT];
  content[LEFT] = addPxIfRequired(content[LEFT]);
  content[TOP] = addPxIfRequired(content[TOP]);
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  setCss(content, container);
  return resolve(action);
}
function remove$2(action) {
  var container = select(action[SELECTOR]);
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  remove(container);
  return resolve(action);
}
function rearrange$1(action) {
  var container = select(action[SELECTOR]);
  var content = action[CONTENT];
  var from = content[FROM];
  var to = content[TO];
  var elements = toArray(children(container));
  var elemFrom = elements[from];
  var elemTo = elements[to];
  if (!exists$2(elemFrom) || !exists$2(elemTo)) {
    logDebug(REARRANGE_MISSING, action);
    return reject(action);
  }
  logDebug(ACTION_RENDERING, action);
  addClientTrace({
    action: action
  });
  if (from < to) {
    after(elemFrom, elemTo);
  } else {
    before(elemFrom, elemTo);
  }
  return resolve(action);
}
function executeRenderAction(action) {
  var processedAction = preprocessAction(action);
  var type = processedAction[TYPE];
  switch (type) {
    case SET_HTML:
      return setHtml$2(processedAction);
    case SET_TEXT:
      return setText$2(processedAction);
    case APPEND_HTML:
      return appendHtml$1(processedAction);
    case PREPEND_HTML:
      return prependHtml$1(processedAction);
    case REPLACE_HTML:
      return replaceHtml$1(processedAction);
    case INSERT_BEFORE:
      return insertBefore$1(processedAction);
    case INSERT_AFTER:
      return insertAfter$1(processedAction);
    case CUSTOM_CODE:
      return customCode$1(processedAction);
    case SET_ATTRIBUTE:
      return setAttribute$1(processedAction);
    case SET_IMAGE_SOURCE:
      return setImageSource$1(processedAction);
    case SET_STYLE:
      return setStyle$1(processedAction);
    case RESIZE:
      return resize$1(processedAction);
    case MOVE:
      return move$1(processedAction);
    case REMOVE:
      return remove$2(processedAction);
    case REARRANGE:
      return rearrange$1(processedAction);
    default:
      return resolve(processedAction);
  }
}

var ACTION_KEY_ATTR = "at-action-key";
function isClickTracking(action) {
  return action[TYPE] === TRACK_CLICK || action[TYPE] === SIGNAL_CLICK;
}
function hasValidSelector(action) {
  var selector = action[SELECTOR];
  return isNotBlank(selector) || isElement(selector);
}
function markAsRendered(action) {
  var key = action.key;
  if (isBlank(key)) {
    return;
  }
  if (!hasValidSelector(action)) {
    return;
  }
  var selector = action[SELECTOR];
  setAttr(ACTION_KEY_ATTR, key, selector);
}
function removeActionCssHiding(action) {
  var cssSelector = action[CSS_SELECTOR];
  if (isBlank(cssSelector)) {
    return;
  }
  removeActionHidingStyle(cssSelector);
}
function displayAction(action) {
  if (!hasValidSelector(action)) {
    removeActionCssHiding(action);
    return;
  }
  var selector = action[SELECTOR];
  if (isClickTracking(action)) {
    addClass(CLICK_TRACKING_CSS_CLASS, selector);
    return;
  }
  addClass(MARKER_CSS_CLASS, selector);
  removeActionCssHiding(action);
}
function displayActions(actions) {
  forEach(displayAction, actions);
}
function shouldRender(action) {
  var key = action.key;
  if (isBlank(key)) {
    return true;
  }
  var type = action[TYPE];
  if (type === CUSTOM_CODE) {
    return action[PAGE];
  }
  var selector = action[SELECTOR];
  var currentKey = getAttr(ACTION_KEY_ATTR, selector);
  if (currentKey !== key) {
    return true;
  }
  if (currentKey === key) {
    return !action[PAGE];
  }
  return false;
}
function renderAwaitedAction(action) {
  if (!shouldRender(action)) {
    displayAction(action);
    return action;
  }
  return executeRenderAction(action)
    .then(function() {
      logDebug(ACTION_RENDERED, action);
      addClientTrace({
        action: action
      });
      markAsRendered(action);
      displayAction(action);
      return action;
    })
    ["catch"](function(error) {
      logWarn(UNEXPECTED_ERROR, error);
      addClientTrace({
        action: action,
        error: error
      });
      displayAction(action);
      var result = assign({}, action);
      result[ERROR] = true;
      return result;
    });
}
function postProcess(actions) {
  var errorActions = filter(function(e) {
    return e[ERROR] === true;
  }, actions);
  if (isEmpty(errorActions)) {
    return resolve();
  }
  displayActions(errorActions);
  return reject(actions);
}
function awaitAction(action) {
  var selector = action[SELECTOR];
  return awaitSelector(selector)
    .then(function() {
      return action;
    })
    ["catch"](function() {
      var result = assign({}, action);
      result[ERROR] = true;
      return result;
    });
}
function awaitAndRenderAction(action) {
  return awaitAction(action).then(renderAwaitedAction);
}
function executeRenderActions(actions) {
  var promises = map(awaitAndRenderAction, actions);
  return all(promises).then(postProcess);
}

function addEventListener(type, func, selector) {
  return select(selector).on(type, func);
}
function removeEventListener(type, func, selector) {
  return select(selector).off(type, func);
}

var METRIC_ELEMENT_NOT_FOUND = "metric element not found";
function executeMetric(metric) {
  var selector = metric[SELECTOR];
  return awaitSelector(selector)
    .then(function() {
      addClientTrace({
        metric: metric
      });
      var foundMetric = assign(
        {
          found: true
        },
        metric
      );
      return foundMetric;
    })
    ["catch"](function() {
      logWarn(METRIC_ELEMENT_NOT_FOUND, metric);
      addClientTrace({
        metric: metric,
        message: METRIC_ELEMENT_NOT_FOUND
      });
      return metric;
    });
}

var NAVIGATOR = "navigator";
var SEND_BEACON = "sendBeacon";
function executeSendBeacon(win, url, data) {
  return win[NAVIGATOR][SEND_BEACON](url, data);
}
function executeSyncXhr(http, url, data) {
  var headers = {};
  headers[CONTENT_TYPE] = [TEXT_PLAIN];
  var options = {};
  options[METHOD] = POST$1;
  options[URL] = url;
  options[DATA$1] = data;
  options[CREDENTIALS] = true;
  options[ASYNC] = false;
  options[HEADERS] = headers;
  try {
    http(options);
  } catch (error) {
    return false;
  }
  return true;
}
function isBeaconSupported(win) {
  return NAVIGATOR in win && SEND_BEACON in win[NAVIGATOR];
}
function sendBeacon(url, data) {
  if (isBeaconSupported(window$1)) {
    return executeSendBeacon(window$1, url, data);
  }
  return executeSyncXhr(xhr, url, data);
}

function saveView(view) {
  var key = view.name;
  var views = getItem(VIEWS) || {};
  views[key] = view;
  setItem(VIEWS, views);
}
function findView(key) {
  var options =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$page = options.page,
    page = _options$page === void 0 ? true : _options$page;
  var views = getItem(VIEWS) || {};
  var result = views[key];
  if (isNil(result)) {
    return result;
  }
  var impressionId = options.impressionId;
  if (isNil(impressionId)) {
    return result;
  }
  return assign(
    {
      page: page,
      impressionId: impressionId
    },
    result
  );
}
function persistViews(views) {
  forEach(saveView, views);
}

var SEND_BEACON_SUCCESS = "Beacon data sent";
var SEND_BEACON_ERROR = "Beacon data sent failed";
var VIEW_TRIGGERED = "View triggered notification";
var VIEW_RENDERED = "View rendered notification";
var MBOXES_RENDERED = "Mboxes rendered notification";
var EVENT_HANDLER = "Event handler notification";
var MBOX_EVENT_HANDLER = "Mbox event handler notification";
var VIEW_EVENT_HANDLER = "View event handler notification";
var PREFETCH_MBOXES = "prefetchMboxes";
var RENDERED = "rendered";
var TRIGGERED = "triggered";
function createRequest(consumerId) {
  var analytics = createAnalytics(consumerId, {});
  var request = {
    context: {
      beacon: true
    }
  };
  if (!isEmpty(analytics)) {
    var experienceCloud = {};
    experienceCloud.analytics = analytics;
    request.experienceCloud = experienceCloud;
  }
  return request;
}
function createSyncNotificationRequest(consumerId, params, notifications) {
  var request = createRequest(consumerId);
  var result = createSyncDeliveryRequest(request, params);
  result.notifications = notifications;
  return result;
}
function createAsyncNotificationRequest(consumerId, params, notifications) {
  var request = createRequest(consumerId);
  return createAsyncDeliveryRequest(request, params).then(function(result) {
    result.notifications = notifications;
    return result;
  });
}
function createNotification(item, type, tokens) {
  var id = uuid();
  var timestamp = now();
  var parameters = item.parameters,
    profileParameters = item.profileParameters,
    order = item.order,
    product = item.product;
  var result = {
    id: id,
    type: type,
    timestamp: timestamp,
    parameters: parameters,
    profileParameters: profileParameters,
    order: order,
    product: product
  };
  if (isEmpty(tokens)) {
    return result;
  }
  result.tokens = tokens;
  return result;
}
function createMboxNotification(mbox, type, tokens) {
  var name = mbox.name,
    state = mbox.state;
  var notification = createNotification(mbox, type, tokens);
  notification.mbox = {
    name: name,
    state: state
  };
  return notification;
}
function createViewNotification(view, type, tokens) {
  var name = view.name,
    state = view.state;
  var notification = createNotification(view, type, tokens);
  notification.view = {
    name: name,
    state: state
  };
  return notification;
}
function executeBeaconNotification(request) {
  var config = getConfig();
  var url = createRequestUrl(config);
  var data = JSON.stringify(request);
  if (sendBeacon(url, data)) {
    logDebug(SEND_BEACON_SUCCESS, url, request);
    return true;
  }
  logWarn(SEND_BEACON_ERROR, url, request);
  return false;
}
function sendEventNotification(source, type, token) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var params = getTargetPageParams(globalMbox);
  var requestDetails = createRequestDetails({}, params);
  var notification = createNotification(requestDetails, type, [token]);
  var request = createSyncNotificationRequest(uuid(), params, [notification]);
  logDebug(EVENT_HANDLER, source, notification);
  addClientTrace({
    source: source,
    event: type,
    request: request
  });
  executeBeaconNotification(request);
}
function sendMboxEventNotification(name, type, token) {
  var params = getTargetPageParams(name);
  var requestDetails = createRequestDetails({}, params);
  var notification = createNotification(requestDetails, type, [token]);
  notification.mbox = {
    name: name
  };
  var request = createSyncNotificationRequest(name, params, [notification]);
  logDebug(MBOX_EVENT_HANDLER, name, notification);
  addClientTrace({
    mbox: name,
    event: type,
    request: request
  });
  executeBeaconNotification(request);
}
function sendMboxesRenderedNotifications(items) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var notifications = [];
  var type = DISPLAY_EVENT;
  forEach(function(item) {
    var mbox = item.mbox,
      data = item.data;
    if (isNil(data)) {
      return;
    }
    var _data$eventTokens = data.eventTokens,
      eventTokens = _data$eventTokens === void 0 ? [] : _data$eventTokens;
    if (isEmpty(eventTokens)) {
      return;
    }
    notifications.push(createMboxNotification(mbox, type, eventTokens));
  }, items);
  if (isEmpty(notifications)) {
    return;
  }
  var request = createSyncNotificationRequest(globalMbox, {}, notifications);
  logDebug(MBOXES_RENDERED, notifications);
  addClientTrace({
    source: PREFETCH_MBOXES,
    event: RENDERED,
    request: request
  });
  executeBeaconNotification(request);
}
function sendViewEventNotification(name, type, token) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var params = getTargetPageParams(globalMbox);
  var requestDetails = createRequestDetails({}, params);
  var notification = createNotification(requestDetails, type, [token]);
  notification.view = {
    name: name
  };
  var request = createSyncNotificationRequest(uuid(), params, [notification]);
  logDebug(VIEW_EVENT_HANDLER, name, notification);
  addClientTrace({
    view: name,
    event: type,
    request: request
  });
  executeBeaconNotification(request);
}
function sendViewTriggeredNotifications(options) {
  var name = options.viewName,
    impressionId = options.impressionId;
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var params = getTargetPageParams(globalMbox);
  var requestDetails = createRequestDetails({}, params);
  var notification = createNotification(requestDetails, DISPLAY_EVENT, []);
  notification.view = {
    name: name
  };
  logDebug(VIEW_TRIGGERED, name);
  createAsyncNotificationRequest(name, params, [notification]).then(function(
    request
  ) {
    request.impressionId = impressionId;
    addClientTrace({
      view: name,
      event: TRIGGERED,
      request: request
    });
    executeBeaconNotification(request);
  });
}
function sendViewRenderedNotifications(item) {
  if (isNil(item)) {
    return;
  }
  var view = item.view,
    _item$data = item.data,
    data = _item$data === void 0 ? {} : _item$data;
  var _data$eventTokens2 = data.eventTokens,
    eventTokens = _data$eventTokens2 === void 0 ? [] : _data$eventTokens2;
  if (isEmpty(eventTokens)) {
    return;
  }
  var name = view.name,
    impressionId = view.impressionId;
  var persistedView = findView(name);
  if (isNil(persistedView)) {
    return;
  }
  var notification = createViewNotification(
    persistedView,
    DISPLAY_EVENT,
    eventTokens
  );
  var request = createSyncNotificationRequest(name, {}, [notification]);
  request.impressionId = impressionId;
  logDebug(VIEW_RENDERED, name, eventTokens);
  addClientTrace({
    view: name,
    event: RENDERED,
    request: request
  });
  executeBeaconNotification(request);
}

var CACHE$1 = {};
var PAGE_LOAD$1 = "pageLoadMetrics";
var PREFETCH = "prefetchMetrics";
var selectMetrics = prop(METRICS);
var createMetricSuccess = function createMetricSuccess() {
  return createSuccess(METRIC);
};
var createMetricError = function createMetricError(error) {
  return createError(METRIC, error);
};
function decorateElementIfRequired(type, selector) {
  if (type !== CLICK) {
    return;
  }
  addClass(CLICK_TRACKING_CSS_CLASS, selector);
}
function isHandlerCached(name, key) {
  return !isNil(CACHE$1[name]) && !isNil(CACHE$1[name][key]);
}
function removePreviousHandlersFromCache(currentViewName, type, selector) {
  if (!isNil(CACHE$1[currentViewName])) {
    return;
  }
  var viewNames = keys(CACHE$1);
  if (isEmpty(viewNames)) {
    return;
  }
  forEach(function(viewName) {
    var handlerNames = keys(CACHE$1[viewName]);
    forEach(function(handlerName) {
      var func = CACHE$1[viewName][handlerName];
      removeEventListener(type, func, selector);
    }, handlerNames);
    delete CACHE$1[viewName];
  }, viewNames);
}
function addHandlerToCache(name, key, handler) {
  CACHE$1[name] = CACHE$1[name] || {};
  CACHE$1[name][key] = handler;
}
function attachEventHandler(name, fromView, metric, notifyFunc) {
  var type = metric.type,
    selector = metric.selector,
    eventToken = metric.eventToken;
  var key = hash(type + ":" + selector + ":" + eventToken);
  var handler = function handler() {
    return notifyFunc(name, type, eventToken);
  };
  decorateElementIfRequired(type, selector);
  if (!fromView) {
    addEventListener(type, handler, selector);
    return;
  }
  if (isHandlerCached(name, key)) {
    return;
  }
  removePreviousHandlersFromCache(name, type, selector);
  addHandlerToCache(name, key, handler);
  addEventListener(type, handler, selector);
}
function attachMetricEventHandlers(name, fromView, metrics, notifyFunc) {
  return all(map(executeMetric, metrics))
    .then(function(arr) {
      forEach(
        function(metric) {
          return attachEventHandler(name, fromView, metric, notifyFunc);
        },
        filter(function(metric) {
          return metric.found;
        }, arr)
      );
      return createMetricSuccess();
    })
    ["catch"](createMetricError);
}
function executeMboxMetrics(mbox) {
  var name = mbox.name;
  return attachMetricEventHandlers(
    name,
    false,
    selectMetrics(mbox),
    sendMboxEventNotification
  );
}
function executeViewMetrics(view) {
  var name = view.name;
  return attachMetricEventHandlers(
    name,
    true,
    selectMetrics(view),
    sendViewEventNotification
  );
}
function executePageLoadMetrics(pageLoad) {
  return attachMetricEventHandlers(
    PAGE_LOAD$1,
    false,
    selectMetrics(pageLoad),
    sendEventNotification
  );
}
function executePrefetchMetrics(prefetch) {
  return attachMetricEventHandlers(
    PREFETCH,
    false,
    selectMetrics(prefetch),
    sendEventNotification
  );
}

var selectContent$1 = prop(CONTENT);
var selectCssSelector = prop(CSS_SELECTOR);
var createRenderSuccess = function createRenderSuccess(eventToken) {
  return createSuccess(RENDER, eventToken);
};
var createRenderError = function createRenderError(error) {
  return createError(RENDER, error);
};
var hasNonErrorData = function hasNonErrorData(val) {
  return not(isError)(val) && hasData(val);
};
function hideActions(actions) {
  var items = map(selectCssSelector, actions);
  injectActionHidingStyles(filterNotNil(items));
}
function hideAllViewsActions(actions) {
  var items = map(selectCssSelector, actions);
  injectAllViewsHidingStyle(filterNotNil(items));
}
function extractActions(item) {
  var options = filter(isActions, selectOptions(item));
  return flatten(map(selectContent$1, options));
}
function isValidAction(action) {
  return isObject(action) && action.type !== SET_JSON;
}
function decorateActions(actions, key, page) {
  return map(function(e) {
    return assign(
      {
        key: key,
        page: page
      },
      e
    );
  }, filter(isValidAction, actions));
}
function executeRendering(option, key, page) {
  var eventToken = option.eventToken,
    content = option.content;
  var actions = decorateActions(content, key, page);
  return executeRenderActions(actions)
    .then(function() {
      return createRenderSuccess(eventToken);
    })
    ["catch"](createRenderError);
}
function isValidOption$1(option) {
  return isObject(option) && option.type !== JSON$1;
}
function renderOptions(func, item) {
  return map(func, filter(isValidOption$1, selectOptions(item)));
}
function postExecuteRendering(key, item, values) {
  var result = _defineProperty(
    {
      status: SUCCESS
    },
    key,
    item
  );
  var errors = map(selectData, filter(isError, values));
  var data = {};
  if (!isEmpty(errors)) {
    result.status = ERROR;
    data.errors = errors;
  }
  if (!isEmpty(data)) {
    result.data = data;
  }
  return result;
}
function postPrefetchRendering(key, item, values) {
  var result = _defineProperty(
    {
      status: SUCCESS
    },
    key,
    item
  );
  var errors = map(selectData, filter(isError, values));
  var eventTokens = map(selectData, filter(hasNonErrorData, values));
  var data = {};
  if (!isEmpty(errors)) {
    result.status = ERROR;
    data.errors = errors;
  }
  if (!isEmpty(eventTokens)) {
    data.eventTokens = eventTokens;
  }
  if (!isEmpty(data)) {
    result.data = data;
  }
  return result;
}
function renderExecuteItem(item, postRenderingFunc, metricsFunc) {
  var render = function render(opt) {
    return executeRendering(opt, true);
  };
  var options = renderOptions(render, item);
  return all(options)
    .then(postRenderingFunc)
    .then(function(result) {
      metricsFunc(item);
      return result;
    });
}
function renderPrefetchItem(key, item, page, metricsFunc) {
  var name = item.name;
  var render = function render(opt) {
    return executeRendering(opt, name, page);
  };
  var options = renderOptions(render, item);
  return all(options)
    .then(function(arr) {
      return postPrefetchRendering(key, item, arr);
    })
    .then(function(result) {
      metricsFunc(item);
      return result;
    });
}
function renderMbox(mbox) {
  var postRenderingFunc = function postRenderingFunc(arr) {
    return postExecuteRendering(MBOX, mbox, arr);
  };
  return renderExecuteItem(mbox, postRenderingFunc, executeMboxMetrics);
}
function renderPrefetchMbox(mbox) {
  return renderPrefetchItem(MBOX, mbox, true, executeMboxMetrics);
}
function hideOptions(item) {
  var actions = extractActions(item);
  hideActions(actions);
}
function hidePageLoadOptions(context) {
  var skipPrehiding =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (skipPrehiding) {
    return;
  }
  var _context$execute = context.execute,
    execute = _context$execute === void 0 ? {} : _context$execute;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad;
  if (!isEmpty(pageLoad)) {
    hideOptions(pageLoad);
  }
}
function hideAllViews(context) {
  var _context$prefetch = context.prefetch,
    prefetch = _context$prefetch === void 0 ? {} : _context$prefetch;
  var _prefetch$views = prefetch.views,
    views = _prefetch$views === void 0 ? [] : _prefetch$views;
  if (isEmpty(views)) {
    return;
  }
  var actions = flatten(map(extractActions, views));
  hideAllViewsActions(actions);
}
function hideViewOptions(view) {
  var actions = extractActions(view);
  hideActions(actions);
  removeAllViewsHidingStyle();
}
function renderPageLoad(pageLoad) {
  var postRenderingFunc = function postRenderingFunc(arr) {
    return postExecuteRendering(PAGE_LOAD, pageLoad, arr);
  };
  return renderExecuteItem(pageLoad, postRenderingFunc, executePageLoadMetrics);
}
function renderMboxes(mboxes) {
  return all(map(renderMbox, mboxes));
}
function renderPrefetchMboxes(mboxes) {
  return all(map(renderPrefetchMbox, mboxes));
}
function renderPrefetchMetrics(prefetch) {
  var metrics = [executePrefetchMetrics(prefetch)];
  return all(metrics).then(postExecuteRendering);
}
function renderView(view) {
  var page = view.page;
  return renderPrefetchItem(VIEW, view, page, executeViewMetrics);
}

function E() {}
E.prototype = {
  on: function(name, callback, ctx) {
    var e = this.e || (this.e = {});
    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });
    return this;
  },
  once: function(name, callback, ctx) {
    var self = this;
    function listener() {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    }
    listener._ = callback;
    return this.on(name, listener, ctx);
  },
  emit: function(name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    return this;
  },
  off: function(name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];
    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }
    liveEvents.length ? (e[name] = liveEvents) : delete e[name];
    return this;
  }
};
var tinyEmitter = E;
var TinyEmitter = E;
tinyEmitter.TinyEmitter = TinyEmitter;

function create$1() {
  return new tinyEmitter();
}
function publishOn(eventBus, name, args) {
  eventBus.emit(name, args);
}
function subscribeTo(eventBus, name, func) {
  eventBus.on(name, func);
}

var EVENT_BUS = create$1();
function publish(name, args) {
  publishOn(EVENT_BUS, name, args);
}
function subscribe(name, func) {
  subscribeTo(EVENT_BUS, name, func);
}

function redirect$1(option) {
  return {
    type: REDIRECT,
    content: option.url
  };
}
function setContent(action) {
  var result = {};
  result.type = SET_HTML;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function setText$3(action) {
  var result = {};
  result.type = SET_TEXT;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function appendContent(action) {
  var result = {};
  result.type = APPEND_HTML;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function prependContent(action) {
  var result = {};
  result.type = PREPEND_HTML;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function replaceContent(action) {
  var result = {};
  result.type = REPLACE_HTML;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function insertBefore$2(action) {
  var result = {};
  result.type = INSERT_BEFORE;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function insertAfter$2(action) {
  var result = {};
  result.type = INSERT_AFTER;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function customCode$2(action) {
  var result = {};
  result.type = CUSTOM_CODE;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function setAttribute$2(action) {
  var result = {};
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  if (action.attribute === SRC) {
    result.type = SET_IMAGE_SOURCE;
    result.content = action.value;
    return result;
  }
  result.type = SET_ATTRIBUTE;
  var content = {};
  content[action.attribute] = action.value;
  result.content = content;
  return result;
}
function setStyle$2(action) {
  var _action$style = action.style,
    style = _action$style === void 0 ? {} : _action$style;
  var result = {};
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  if (!isNil(style.left) && !isNil(style.top)) {
    result.type = MOVE;
    result.content = style;
    return result;
  }
  if (!isNil(style.width) && !isNil(style.height)) {
    result.type = RESIZE;
    result.content = style;
    return result;
  }
  result.type = SET_STYLE;
  result.content = style;
  return result;
}
function remove$3(action) {
  var result = {};
  result.type = REMOVE;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function rearrange$2(action) {
  var content = {};
  content.from = action.from;
  content.to = action.to;
  var result = {};
  result.type = REARRANGE;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  result.content = content;
  return result;
}
function hasSelectors(action) {
  return isNotBlank(action.selector) && isNotBlank(action.cssSelector);
}
function createPageLoad(items) {
  var result = {};
  if (isEmpty(items)) {
    return result;
  }
  var options = [];
  var metrics = [];
  var actions = [];
  forEach(function(item) {
    var type = item.action;
    switch (type) {
      case SET_CONTENT:
        if (hasSelectors(item)) {
          actions.push(setContent(item));
        } else {
          options.push({
            type: HTML,
            content: item.content
          });
        }
        break;
      case SET_JSON:
        if (!isEmpty(item.content)) {
          forEach(function(e) {
            return options.push({
              type: JSON$1,
              content: e
            });
          }, item.content);
        }
        break;
      case SET_TEXT:
        actions.push(setText$3(item));
        break;
      case APPEND_CONTENT:
        actions.push(appendContent(item));
        break;
      case PREPEND_CONTENT:
        actions.push(prependContent(item));
        break;
      case REPLACE_CONTENT:
        actions.push(replaceContent(item));
        break;
      case INSERT_BEFORE:
        actions.push(insertBefore$2(item));
        break;
      case INSERT_AFTER:
        actions.push(insertAfter$2(item));
        break;
      case CUSTOM_CODE:
        actions.push(customCode$2(item));
        break;
      case SET_ATTRIBUTE:
        actions.push(setAttribute$2(item));
        break;
      case SET_STYLE:
        actions.push(setStyle$2(item));
        break;
      case REMOVE:
        actions.push(remove$3(item));
        break;
      case REARRANGE:
        actions.push(rearrange$2(item));
        break;
      case REDIRECT:
        options.push(redirect$1(item));
        break;
      case TRACK_CLICK:
        metrics.push({
          type: CLICK,
          selector: item.selector,
          eventToken: item.clickTrackId
        });
        break;
      default:
        break;
    }
  }, items);
  var pageLoad = {};
  var hasActions = !isEmpty(actions);
  if (hasActions) {
    options.push({
      type: ACTIONS,
      content: actions
    });
  }
  var hasOptions = !isEmpty(options);
  if (hasOptions) {
    pageLoad.options = options;
  }
  var hasMetrics = !isEmpty(metrics);
  if (hasMetrics) {
    pageLoad.metrics = metrics;
  }
  if (isEmpty(pageLoad)) {
    return result;
  }
  var execute = {};
  execute.pageLoad = pageLoad;
  result.execute = execute;
  return result;
}
function createMboxes(name, items) {
  var result = {};
  if (isEmpty(items)) {
    return result;
  }
  var options = [];
  var metrics = [];
  forEach(function(item) {
    var type = item.action;
    switch (type) {
      case SET_CONTENT:
        options.push({
          type: HTML,
          content: item.content
        });
        break;
      case SET_JSON:
        if (!isEmpty(item.content)) {
          forEach(function(e) {
            return options.push({
              type: JSON$1,
              content: e
            });
          }, item.content);
        }
        break;
      case REDIRECT:
        options.push(redirect$1(item));
        break;
      case SIGNAL_CLICK:
        metrics.push({
          type: CLICK,
          eventToken: item.clickTrackId
        });
        break;
      default:
        break;
    }
  }, items);
  var mbox = {
    name: name
  };
  var hasOptions = !isEmpty(options);
  if (hasOptions) {
    mbox.options = options;
  }
  var hasMetrics = !isEmpty(metrics);
  if (hasMetrics) {
    mbox.metrics = metrics;
  }
  if (isEmpty(mbox)) {
    return result;
  }
  var execute = {};
  var mboxes = [mbox];
  execute.mboxes = mboxes;
  result.execute = execute;
  return result;
}
function convertToContext(mbox, items, pageLoadEnabled) {
  if (pageLoadEnabled) {
    return createPageLoad(items);
  }
  return createMboxes(mbox, items);
}

var PAGE_LOAD_RENDERING_FAILED = "Page load rendering failed";
var MBOXES_RENDERING_FAILED = "Mboxes rendering failed";
var VIEW_RENDERING_FAILED = "View rendering failed";
var PREFETCH_RENDERING_FAILED = "Prefetch rendering failed";
var hasErrors = function hasErrors(items) {
  return !isEmpty(filter(isError, items));
};
function getPageLoadData(pageLoad) {
  var status = pageLoad.status,
    data = pageLoad.data;
  var result = {
    status: status,
    pageLoad: true
  };
  if (!isNil(data)) {
    result.data = data;
  }
  return result;
}
function getMboxData(item) {
  var status = item.status,
    mbox = item.mbox,
    data = item.data;
  var name = mbox.name;
  var result = {
    status: status,
    mbox: name
  };
  if (!isNil(data)) {
    result.data = data;
  }
  return result;
}
function getViewData(item) {
  var status = item.status,
    view = item.view,
    data = item.data;
  var name = view.name;
  var result = {
    status: status,
    view: name
  };
  if (!isNil(data)) {
    result.data = data;
  }
  return result;
}
function getPrefetchMetricsData(prefetchMetrics) {
  var status = prefetchMetrics.status,
    data = prefetchMetrics.data;
  var result = {
    status: status,
    prefetchMetrics: true
  };
  if (!isNil(data)) {
    result.data = data;
  }
  return result;
}
function handlePageLoad(pageLoad) {
  if (isNil(pageLoad)) {
    return [null];
  }
  var result = map(getPageLoadData, [pageLoad]);
  if (hasErrors(result)) {
    logWarn(PAGE_LOAD_RENDERING_FAILED, pageLoad);
  }
  return result;
}
function handleMboxes(mboxes) {
  if (isNil(mboxes)) {
    return [null];
  }
  var result = map(getMboxData, mboxes);
  if (hasErrors(result)) {
    logWarn(MBOXES_RENDERING_FAILED, mboxes);
  }
  return result;
}
function handlePrefetchMboxes(mboxes) {
  var func =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : sendMboxesRenderedNotifications;
  if (isNil(mboxes)) {
    return [null];
  }
  var result = map(getMboxData, mboxes);
  if (hasErrors(result)) {
    logWarn(MBOXES_RENDERING_FAILED, mboxes);
  }
  func(mboxes);
  return result;
}
function handleView(item) {
  var func =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : sendViewRenderedNotifications;
  if (isNil(item)) {
    return [null];
  }
  var result = map(getViewData, [item]);
  if (hasErrors(result)) {
    logWarn(VIEW_RENDERING_FAILED, item);
  }
  var view = item.view;
  if (!view.page) {
    return result;
  }
  func(item);
  return result;
}
function handlePrefetchMetrics(prefetchMetrics) {
  if (isNil(prefetchMetrics)) {
    return [null];
  }
  var result = map(getPrefetchMetricsData, [prefetchMetrics]);
  if (hasErrors(result)) {
    logWarn(PREFETCH_RENDERING_FAILED, prefetchMetrics);
  }
  return result;
}
function handleRenderingSuccess$1(values) {
  var results = flatten([
    handlePageLoad(values[0]),
    handleMboxes(values[1]),
    handlePrefetchMboxes(values[2]),
    handlePrefetchMetrics(values[3])
  ]);
  var nonNull = filter(notNil, results);
  var errors = filter(isError, nonNull);
  if (!isEmpty(errors)) {
    return reject(errors);
  }
  return resolve(nonNull);
}
function handleRenderingError$1(err) {
  return reject(err);
}

function processOptions$2(selector, item) {
  if (isEmpty(item)) {
    return;
  }
  var options = item.options;
  if (isEmpty(options)) {
    return;
  }
  forEach(function(option) {
    if (option.type !== HTML) {
      return;
    }
    var type = SET_HTML;
    var content = option.content;
    option.type = ACTIONS;
    option.content = [
      {
        type: type,
        selector: selector,
        content: content
      }
    ];
  }, options);
}
function processMetrics$1(selector, item) {
  var metrics = item.metrics;
  if (isEmpty(metrics)) {
    return;
  }
  var name = item.name;
  forEach(function(metric) {
    metric.name = name;
    metric.selector = metric.selector || selector;
  }, metrics);
}
function createRenderingContext(selector, context) {
  var result = assign({}, context);
  var _result$execute = result.execute,
    execute = _result$execute === void 0 ? {} : _result$execute,
    _result$prefetch = result.prefetch,
    prefetch = _result$prefetch === void 0 ? {} : _result$prefetch;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad,
    _execute$mboxes = execute.mboxes,
    mboxes = _execute$mboxes === void 0 ? [] : _execute$mboxes;
  var _prefetch$mboxes = prefetch.mboxes,
    prefetchMboxes = _prefetch$mboxes === void 0 ? [] : _prefetch$mboxes;
  processOptions$2(selector, pageLoad);
  forEach(function(elem) {
    return processOptions$2(selector, elem);
  }, mboxes);
  forEach(function(elem) {
    return processMetrics$1(selector, elem);
  }, mboxes);
  forEach(function(elem) {
    return processOptions$2(selector, elem);
  }, prefetchMboxes);
  forEach(function(elem) {
    return processMetrics$1(selector, elem);
  }, prefetchMboxes);
  return result;
}
function persistViewsIfPresent(context) {
  var _context$prefetch = context.prefetch,
    prefetch = _context$prefetch === void 0 ? {} : _context$prefetch;
  var _prefetch$views = prefetch.views,
    views = _prefetch$views === void 0 ? [] : _prefetch$views;
  if (isEmpty(views)) {
    return;
  }
  persistViews(views);
}
function renderContext(context) {
  var promises = [];
  var _context$execute = context.execute,
    execute = _context$execute === void 0 ? {} : _context$execute;
  var _execute$pageLoad2 = execute.pageLoad,
    pageLoad = _execute$pageLoad2 === void 0 ? {} : _execute$pageLoad2,
    _execute$mboxes2 = execute.mboxes,
    mboxes = _execute$mboxes2 === void 0 ? [] : _execute$mboxes2;
  if (!isEmpty(pageLoad)) {
    promises.push(renderPageLoad(pageLoad));
  } else {
    promises.push(resolve(null));
  }
  if (!isEmpty(mboxes)) {
    promises.push(renderMboxes(mboxes));
  } else {
    promises.push(resolve(null));
  }
  var _context$prefetch2 = context.prefetch,
    prefetch = _context$prefetch2 === void 0 ? {} : _context$prefetch2;
  var _prefetch$mboxes2 = prefetch.mboxes,
    prefetchMboxes = _prefetch$mboxes2 === void 0 ? [] : _prefetch$mboxes2,
    _prefetch$metrics = prefetch.metrics,
    metrics = _prefetch$metrics === void 0 ? [] : _prefetch$metrics;
  if (!isEmpty(prefetchMboxes)) {
    promises.push(renderPrefetchMboxes(prefetchMboxes));
  } else {
    promises.push(resolve(null));
  }
  if (isArray(metrics) && !isEmpty(metrics)) {
    promises.push(renderPrefetchMetrics(prefetch));
  } else {
    promises.push(resolve(null));
  }
  removeHidingSnippetStyle();
  return all(promises)
    .then(handleRenderingSuccess$1)
    ["catch"](handleRenderingError$1);
}
function executeRedirect(win, url) {
  delay(function() {
    return win.location.replace(url);
  });
}
function retrieveSelector(selector) {
  if (isNotBlank(selector)) {
    return selector;
  }
  if (isElement(selector)) {
    return selector;
  }
  return HEAD_TAG;
}
function showElement(selector) {
  addClass(MARKER_CSS_CLASS, selector);
}
function executeApplyOffer(options) {
  var mbox = options.mbox,
    selector = options.selector,
    actions = options.offer;
  var config = getConfig();
  var pageLoadEnabled = mbox === config[GLOBAL_MBOX_NAME];
  if (isEmpty(actions)) {
    logDebug(NO_ACTIONS);
    showElement(selector);
    removeHidingSnippetStyle();
    notifyRenderingNoOffers({
      mbox: mbox
    });
    return;
  }
  var context = convertToContext(mbox, actions, pageLoadEnabled);
  var renderingContext = createRenderingContext(selector, context);
  var redirect = getRedirect(renderingContext);
  if (!isEmpty(redirect)) {
    var url = redirect.url;
    logDebug(REDIRECT_ACTION, redirect);
    notifyRenderingRedirect({
      url: url
    });
    executeRedirect(window$1, url);
    return;
  }
  notifyRenderingStart({
    mbox: mbox
  });
  hidePageLoadOptions(renderingContext);
  renderContext(renderingContext)
    .then(function(execution) {
      if (isEmpty(execution)) {
        return;
      }
      notifyRenderingSucceeded({
        mbox: mbox,
        execution: execution
      });
    })
    ["catch"](function(error) {
      return notifyRenderingFailed({
        error: error
      });
    });
}
function executeApplyOffers(options) {
  var skipPrehiding =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var selector = options.selector,
    response = options.response;
  if (isEmpty(response)) {
    logDebug(NO_ACTIONS);
    showElement(selector);
    removeHidingSnippetStyle();
    notifyRenderingNoOffers({});
    publish(NO_OFFERS_EVENT);
    return resolve();
  }
  var renderingContext = createRenderingContext(selector, response);
  var redirect = getRedirect(renderingContext);
  if (!isEmpty(redirect)) {
    var url = redirect.url;
    logDebug(REDIRECT_ACTION, redirect);
    notifyRenderingRedirect({
      url: url
    });
    publish(REDIRECT_OFFER_EVENT);
    executeRedirect(window$1, url);
    return resolve();
  }
  notifyRenderingStart({});
  persistViewsIfPresent(renderingContext);
  publish(CACHE_UPDATED_EVENT);
  hidePageLoadOptions(renderingContext, skipPrehiding);
  return renderContext(renderingContext)
    .then(function(execution) {
      if (isEmpty(execution)) {
        return;
      }
      notifyRenderingSucceeded({
        execution: execution
      });
    })
    ["catch"](function(error) {
      return notifyRenderingFailed({
        error: error
      });
    });
}

function hasServerState(config) {
  var serverState = config[SERVER_STATE];
  if (isEmpty(serverState)) {
    return false;
  }
  var request = serverState.request,
    response = serverState.response;
  if (isEmpty(request)) {
    return false;
  }
  if (isEmpty(response)) {
    return false;
  }
  return true;
}
function getServerState(config) {
  return config[SERVER_STATE];
}

var INIT = "[page-init]";
function handleError$1(error) {
  logWarn(INIT, VIEW_DELIVERY_ERROR, error);
  addClientTrace({
    source: INIT,
    error: error
  });
  removeHidingSnippetStyle();
}
function handleSuccess(response) {
  var skipPrehiding =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var options = {
    selector: HEAD_TAG,
    response: response
  };
  logDebug(INIT, RESPONSE, response);
  addClientTrace({
    source: INIT,
    response: response
  });
  executeApplyOffers(options, skipPrehiding)["catch"](handleError$1);
}
function scrubServerStateResponse(config, response) {
  var result = assign({}, response);
  var execute = result.execute,
    prefetch = result.prefetch;
  var pageLoadEnabled = config[PAGE_LOAD_ENABLED];
  var viewsEnabled = config[VIEWS_ENABLED];
  if (execute) {
    result.execute.mboxes = null;
  }
  if (execute && !pageLoadEnabled) {
    result.execute.pageLoad = null;
  }
  if (prefetch) {
    result.prefetch.mboxes = null;
  }
  if (prefetch && !viewsEnabled) {
    result.prefetch.views = null;
  }
  return result;
}
function processServerState(config) {
  var serverState = getServerState(config);
  var request = serverState.request,
    response = serverState.response;
  var skipPrehiding = true;
  logDebug(INIT, USING_SERVER_STATE);
  addClientTrace({
    source: INIT,
    serverState: serverState
  });
  var scrubbedResponse = scrubServerStateResponse(config, response);
  hidePageLoadOptions(scrubbedResponse);
  hideAllViews(scrubbedResponse);
  processResponse({
    request: request,
    response: scrubbedResponse
  })
    .then(function(res) {
      return handleSuccess(res, skipPrehiding);
    })
    ["catch"](handleError$1);
}
function initDelivery() {
  if (!isDeliveryEnabled()) {
    logWarn(INIT, DELIVERY_DISABLED);
    addClientTrace({
      source: INIT,
      error: DELIVERY_DISABLED
    });
    return;
  }
  var config = getConfig();
  if (hasServerState(config)) {
    processServerState(config);
    return;
  }
  var pageLoadEnabled = config[PAGE_LOAD_ENABLED];
  var viewsEnabled = config[VIEWS_ENABLED];
  if (!pageLoadEnabled && !viewsEnabled) {
    logDebug(INIT, PAGE_LOAD_DISABLED);
    addClientTrace({
      source: INIT,
      error: PAGE_LOAD_DISABLED
    });
    return;
  }
  injectHidingSnippetStyle();
  var request = {};
  if (pageLoadEnabled) {
    var execute = {};
    execute.pageLoad = {};
    request.execute = execute;
  }
  if (viewsEnabled) {
    var prefetch = {};
    prefetch.views = [{}];
    request.prefetch = prefetch;
  }
  var timeout = config[TIMEOUT];
  logDebug(INIT, REQUEST, request);
  addClientTrace({
    source: INIT,
    request: request
  });
  var options = {
    request: request,
    timeout: timeout
  };
  if (!shouldUseOptin() || isTargetApproved()) {
    executeGetOffers(options)
      .then(handleSuccess)
      ["catch"](handleError$1);
    return;
  }
  fetchOptinPermissions()
    .then(function() {
      executeGetOffers(options)
        .then(handleSuccess)
        ["catch"](handleError$1);
    })
    ["catch"](handleError$1);
}

function createValid() {
  var result = {};
  result[VALID] = true;
  return result;
}
function createInvalid(error) {
  var result = {};
  result[VALID] = false;
  result[ERROR] = error;
  return result;
}
function validateMbox(mbox) {
  if (isBlank(mbox)) {
    return createInvalid(MBOX_REQUIRED);
  }
  if (mbox.length > MBOX_LENGTH) {
    return createInvalid(MBOX_TOO_LONG);
  }
  return createValid();
}
function validateGetOfferOptions(options) {
  if (!isObject(options)) {
    return createInvalid(OPTIONS_REQUIRED);
  }
  var mbox = options[MBOX];
  var mboxValidation = validateMbox(mbox);
  if (!mboxValidation[VALID]) {
    return mboxValidation;
  }
  if (!isFunction(options[SUCCESS])) {
    return createInvalid(SUCCESS_REQUIRED);
  }
  if (!isFunction(options[ERROR])) {
    return createInvalid(ERROR_REQUIRED);
  }
  return createValid();
}
function validateGetOffersOptions(options) {
  if (!isObject(options)) {
    return createInvalid(OPTIONS_REQUIRED);
  }
  var request = options.request;
  if (!isObject(request)) {
    return createInvalid(REQUEST_REQUIRED);
  }
  var execute = request.execute,
    prefetch = request.prefetch;
  if (!isObject(execute) && !isObject(prefetch)) {
    return createInvalid(EXECUTE_OR_PREFETCH_REQUIRED);
  }
  return createValid();
}
function validateSendNotificationsOptions(options) {
  if (!isObject(options)) {
    return createInvalid(OPTIONS_REQUIRED);
  }
  var request = options.request;
  if (!isObject(request)) {
    return createInvalid(REQUEST_REQUIRED);
  }
  var execute = request.execute,
    prefetch = request.prefetch,
    notifications = request.notifications;
  if (isObject(execute) || isObject(prefetch)) {
    return createInvalid(EXECUTE_OR_PREFETCH_NOT_ALLOWED);
  }
  if (!isArray(notifications)) {
    return createInvalid(NOTIFICATIONS_REQUIRED);
  }
  return createValid();
}
function validateApplyOfferOptions(options) {
  if (!isObject(options)) {
    return createInvalid(OPTIONS_REQUIRED);
  }
  var mbox = options[MBOX];
  var mboxValidation = validateMbox(mbox);
  if (!mboxValidation[VALID]) {
    return mboxValidation;
  }
  var offer = options[OFFER];
  if (!isArray(offer)) {
    return createInvalid(OFFER_REQUIRED);
  }
  return createValid();
}
function validateApplyOffersOptions(options) {
  if (!isObject(options)) {
    return createInvalid(OPTIONS_REQUIRED);
  }
  var response = options.response;
  if (!isObject(response)) {
    return createInvalid(RESPONE_REQUIRED);
  }
  return createValid();
}
function validateTrackEventOptions(options) {
  if (!isObject(options)) {
    return createInvalid(OPTIONS_REQUIRED);
  }
  var mbox = options[MBOX];
  var mboxValidation = validateMbox(mbox);
  if (!mboxValidation[VALID]) {
    return mboxValidation;
  }
  return createValid();
}

function redirect$2(option) {
  return {
    action: REDIRECT,
    url: option.content
  };
}
function setHtml$3(action) {
  var result = {};
  result.action = SET_CONTENT;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function setText$4(action) {
  var result = {};
  result.action = SET_TEXT;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function appendHtml$2(action) {
  var result = {};
  result.action = APPEND_CONTENT;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function prependHtml$2(action) {
  var result = {};
  result.action = PREPEND_CONTENT;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function replaceHtml$2(action) {
  var result = {};
  result.action = REPLACE_CONTENT;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function insertBefore$3(action) {
  var result = {};
  result.action = INSERT_BEFORE;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function insertAfter$3(action) {
  var result = {};
  result.action = INSERT_AFTER;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function customCode$3(action) {
  var result = {};
  result.action = CUSTOM_CODE;
  result.content = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function setAttribute$3(action) {
  var attribute = keys(action.content)[0];
  var result = {};
  result.action = SET_ATTRIBUTE;
  result.attribute = attribute;
  result.value = action.content[attribute];
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function setImageSource$2(action) {
  var result = {};
  result.action = SET_ATTRIBUTE;
  result.attribute = SRC;
  result.value = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function setStyle$3(action) {
  var result = {};
  result.action = SET_STYLE;
  result.style = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function resize$2(action) {
  var result = {};
  result.action = SET_STYLE;
  result.style = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function move$2(action) {
  var result = {};
  result.action = SET_STYLE;
  result.style = action.content;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function remove$4(action) {
  var result = {};
  result.action = REMOVE;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function rearrange$3(action) {
  var result = {};
  result.action = REARRANGE;
  result.from = action.content.from;
  result.to = action.content.to;
  result.selector = action.selector;
  result.cssSelector = action.cssSelector;
  return result;
}
function processActions(actions) {
  var result = [];
  forEach(function(action) {
    var type = action.type;
    switch (type) {
      case SET_HTML:
        result.push(setHtml$3(action));
        break;
      case SET_TEXT:
        result.push(setText$4(action));
        break;
      case APPEND_HTML:
        result.push(appendHtml$2(action));
        break;
      case PREPEND_HTML:
        result.push(prependHtml$2(action));
        break;
      case REPLACE_HTML:
        result.push(replaceHtml$2(action));
        break;
      case INSERT_BEFORE:
        result.push(insertBefore$3(action));
        break;
      case INSERT_AFTER:
        result.push(insertAfter$3(action));
        break;
      case CUSTOM_CODE:
        result.push(customCode$3(action));
        break;
      case SET_ATTRIBUTE:
        result.push(setAttribute$3(action));
        break;
      case SET_IMAGE_SOURCE:
        result.push(setImageSource$2(action));
        break;
      case SET_STYLE:
        result.push(setStyle$3(action));
        break;
      case RESIZE:
        result.push(resize$2(action));
        break;
      case MOVE:
        result.push(move$2(action));
        break;
      case REMOVE:
        result.push(remove$4(action));
        break;
      case REARRANGE:
        result.push(rearrange$3(action));
        break;
      case REDIRECT:
        result.push(redirect$2(action));
        break;
      default:
        break;
    }
  }, actions);
  return result;
}
function processMetrics$2(metrics) {
  if (isEmpty(metrics)) {
    return [];
  }
  var result = [];
  forEach(function(m) {
    if (m.type !== CLICK) {
      return;
    }
    if (hasSelector(m)) {
      result.push({
        action: TRACK_CLICK,
        selector: m.selector,
        clickTrackId: m.eventToken
      });
    } else {
      result.push({
        action: SIGNAL_CLICK,
        clickTrackId: m.eventToken
      });
    }
  }, metrics);
  return result;
}
function processItem(item) {
  if (isEmpty(item)) {
    return [];
  }
  var htmls = [];
  var jsons = [];
  var actions = [];
  var _item$options = item.options,
    options = _item$options === void 0 ? [] : _item$options,
    _item$metrics = item.metrics,
    metrics = _item$metrics === void 0 ? [] : _item$metrics;
  forEach(function(option) {
    var type = option.type;
    switch (type) {
      case HTML:
        htmls.push(option.content);
        break;
      case JSON$1:
        jsons.push(option.content);
        break;
      case REDIRECT:
        actions.push(redirect$2(option));
        break;
      case ACTIONS:
        actions.push.apply(actions, processActions(option.content));
        break;
      default:
        break;
    }
  }, options);
  if (!isEmpty(htmls)) {
    actions.push({
      action: SET_CONTENT,
      content: htmls.join("")
    });
  }
  if (!isEmpty(jsons)) {
    actions.push({
      action: SET_JSON,
      content: jsons
    });
  }
  var clickActions = processMetrics$2(metrics);
  if (!isEmpty(clickActions)) {
    actions.push.apply(actions, clickActions);
  }
  return actions;
}
function convertToActions(response) {
  var _response$execute = response.execute,
    execute = _response$execute === void 0 ? {} : _response$execute;
  var _execute$pageLoad = execute.pageLoad,
    pageLoad = _execute$pageLoad === void 0 ? {} : _execute$pageLoad;
  var _execute$mboxes = execute.mboxes,
    mboxes = _execute$mboxes === void 0 ? [] : _execute$mboxes;
  var result = [];
  result.push.apply(result, processItem(pageLoad));
  result.push.apply(result, flatten(map(processItem, mboxes)));
  return result;
}

var GET_OFFER = "[getOffer()]";
function handleRequestSuccess$1(options, response) {
  var actions = convertToActions(response);
  options[SUCCESS](actions);
}
function handleRequestError$1(options, error) {
  var status = error[STATUS] || UNKNOWN;
  options[ERROR](status, error);
}
function getOffer(options) {
  var validationResult = validateGetOfferOptions(options);
  var error = validationResult[ERROR];
  if (!validationResult[VALID]) {
    logWarn(GET_OFFER, error);
    addClientTrace({
      source: GET_OFFER,
      options: options,
      error: error
    });
    return;
  }
  if (!isDeliveryEnabled()) {
    delay(options[ERROR](WARNING, DELIVERY_DISABLED));
    logWarn(GET_OFFER, DELIVERY_DISABLED);
    addClientTrace({
      source: GET_OFFER,
      options: options,
      error: DELIVERY_DISABLED
    });
    return;
  }
  var successFunc = function successFunc(response) {
    return handleRequestSuccess$1(options, response);
  };
  var errorFunc = function errorFunc(err) {
    return handleRequestError$1(options, err);
  };
  logDebug(GET_OFFER, options);
  addClientTrace({
    source: GET_OFFER,
    options: options
  });
  if (!shouldUseOptin() || isTargetApproved()) {
    executeGetOffer(options)
      .then(successFunc)
      ["catch"](errorFunc);
    return;
  }
  fetchOptinPermissions().then(function() {
    executeGetOffer(options)
      .then(successFunc)
      ["catch"](errorFunc);
  });
}

var GET_OFFERS = "[getOffers()]";
function getOffers(options) {
  var validationResult = validateGetOffersOptions(options);
  var error = validationResult[ERROR];
  if (!validationResult[VALID]) {
    logWarn(GET_OFFERS, error);
    addClientTrace({
      source: GET_OFFERS,
      options: options,
      error: error
    });
    return reject(validationResult);
  }
  if (!isDeliveryEnabled()) {
    logWarn(GET_OFFERS, DELIVERY_DISABLED);
    addClientTrace({
      source: GET_OFFERS,
      options: options,
      error: DELIVERY_DISABLED
    });
    return reject(new Error(DELIVERY_DISABLED));
  }
  logDebug(GET_OFFERS, options);
  addClientTrace({
    source: GET_OFFERS,
    options: options
  });
  if (!shouldUseOptin() || isTargetApproved()) {
    return executeGetOffers(options);
  }
  return fetchOptinPermissions().then(function() {
    return executeGetOffers(options);
  });
}

var APPLY_OFFER = "[applyOffer()]";
function applyOffer(options) {
  var selector = retrieveSelector(options.selector);
  var validationResult = validateApplyOfferOptions(options);
  var error = validationResult[ERROR];
  if (!validationResult[VALID]) {
    logWarn(APPLY_OFFER, options, error);
    addClientTrace({
      source: APPLY_OFFER,
      options: options,
      error: error
    });
    showElement(selector);
    return;
  }
  if (!isDeliveryEnabled()) {
    logWarn(APPLY_OFFER, DELIVERY_DISABLED);
    addClientTrace({
      source: APPLY_OFFER,
      options: options,
      error: DELIVERY_DISABLED
    });
    showElement(selector);
    return;
  }
  options.selector = selector;
  logDebug(APPLY_OFFER, options);
  addClientTrace({
    source: APPLY_OFFER,
    options: options
  });
  executeApplyOffer(options);
}

var APPLY_OFFERS = "[applyOffers()]";
function applyOffers(options) {
  var selector = retrieveSelector(options.selector);
  var validationResult = validateApplyOffersOptions(options);
  var error = validationResult[ERROR];
  if (!validationResult[VALID]) {
    logWarn(APPLY_OFFERS, options, error);
    addClientTrace({
      source: APPLY_OFFERS,
      options: options,
      error: error
    });
    showElement(selector);
    return reject(validationResult);
  }
  if (!isDeliveryEnabled()) {
    logWarn(APPLY_OFFERS, DELIVERY_DISABLED);
    addClientTrace({
      source: APPLY_OFFERS,
      options: options,
      error: DELIVERY_DISABLED
    });
    showElement(selector);
    return reject(new Error(DELIVERY_DISABLED));
  }
  options.selector = selector;
  logDebug(APPLY_OFFERS, options);
  addClientTrace({
    source: APPLY_OFFERS,
    options: options
  });
  return executeApplyOffers(options);
}

var SEND_NOTIFICATIONS = "[sendNotifications()]";
function sendNotifications(options) {
  var config = getConfig();
  var globalMbox = config[GLOBAL_MBOX_NAME];
  var _options$consumerId = options.consumerId,
    consumerId =
      _options$consumerId === void 0 ? globalMbox : _options$consumerId,
    request = options.request;
  var validationResult = validateSendNotificationsOptions(options);
  var error = validationResult[ERROR];
  if (!validationResult[VALID]) {
    logWarn(SEND_NOTIFICATIONS, error);
    addClientTrace({
      source: SEND_NOTIFICATIONS,
      options: options,
      error: error
    });
    return;
  }
  if (!isDeliveryEnabled()) {
    logWarn(SEND_NOTIFICATIONS, DELIVERY_DISABLED);
    addClientTrace({
      source: SEND_NOTIFICATIONS,
      options: options,
      error: DELIVERY_DISABLED
    });
    return;
  }
  logDebug(SEND_NOTIFICATIONS, options);
  addClientTrace({
    source: SEND_NOTIFICATIONS,
    options: options
  });
  var notifications = request.notifications;
  var notificationsRequest = createSyncNotificationRequest(
    consumerId,
    {},
    notifications
  );
  if (shouldUseOptin() && !isTargetApproved()) {
    logWarn(SEND_NOTIFICATIONS, ERROR_TARGET_NOT_OPTED_IN);
    return;
  }
  executeBeaconNotification(notificationsRequest);
}

var TRACK_EVENT = "[trackEvent()]";
function normalizeOptions(config, options) {
  var mbox = options[MBOX];
  var result = assign({}, options);
  var optsParams = isObject(options.params) ? options.params : {};
  result[PARAMS] = assign({}, getTargetPageParams(mbox), optsParams);
  result[TIMEOUT] = getTimeout(config, options[TIMEOUT]);
  result[SUCCESS] = isFunction(options[SUCCESS]) ? options[SUCCESS] : noop;
  result[ERROR] = isFunction(options[ERROR]) ? options[ERROR] : noop;
  return result;
}
function shouldTrackBySelector(options) {
  var type = options[TYPE];
  var selector = options[SELECTOR];
  return isNotBlank(type) && (isNotBlank(selector) || isElement(selector));
}
function trackImmediateInternal(options) {
  var mbox = options.mbox;
  var optsParams = isObject(options.params) ? options.params : {};
  var params = assign({}, getTargetPageParams(mbox), optsParams);
  var type = DISPLAY_EVENT;
  var requestDetails = createRequestDetails({}, params);
  var notification = createNotification(requestDetails, type, []);
  notification.mbox = {
    name: mbox
  };
  var request = createSyncNotificationRequest(mbox, params, [notification]);
  if (executeBeaconNotification(request)) {
    logDebug(TRACK_EVENT_SUCCESS, options);
    options[SUCCESS]();
    return;
  }
  logWarn(TRACK_EVENT_ERROR, options);
  options[ERROR](UNKNOWN, TRACK_EVENT_ERROR);
}
function trackImmediate(options) {
  if (shouldUseOptin() && !isTargetApproved()) {
    logWarn(TRACK_EVENT_ERROR, ERROR_TARGET_NOT_OPTED_IN);
    options[ERROR](ERROR, ERROR_TARGET_NOT_OPTED_IN);
    return;
  }
  trackImmediateInternal(options);
}
function handleEvent(options) {
  trackImmediate(options);
  return !options.preventDefault;
}
function trackBySelector(options) {
  var selector = options[SELECTOR];
  var type = options[TYPE];
  var elements = toArray(select(selector));
  var onEvent = function onEvent() {
    return handleEvent(options);
  };
  forEach(function(element) {
    return addEventListener(type, onEvent, element);
  }, elements);
}
function trackEvent(opts) {
  var validationResult = validateTrackEventOptions(opts);
  var error = validationResult[ERROR];
  if (!validationResult[VALID]) {
    logWarn(TRACK_EVENT, error);
    addClientTrace({
      source: TRACK_EVENT,
      options: opts,
      error: error
    });
    return;
  }
  var config = getConfig();
  var options = normalizeOptions(config, opts);
  if (!isDeliveryEnabled()) {
    logWarn(TRACK_EVENT, DELIVERY_DISABLED);
    delay(options[ERROR](WARNING, DELIVERY_DISABLED));
    addClientTrace({
      source: TRACK_EVENT,
      options: opts,
      error: DELIVERY_DISABLED
    });
    return;
  }
  logDebug(TRACK_EVENT, options);
  addClientTrace({
    source: TRACK_EVENT,
    options: options
  });
  if (shouldTrackBySelector(options)) {
    trackBySelector(options);
    return;
  }
  trackImmediate(options);
}

var TRIGGER_VIEW = "[triggerView()]";
var TASKS = [];
var LOADING = 0;
var LOADED = 1;
var STATE = LOADING;
function executeApplyOffersForView(view) {
  hideViewOptions(view);
  return renderView(view)
    .then(handleView)
    .then(function(execution) {
      if (isEmpty(execution)) {
        return;
      }
      notifyRenderingSucceeded({
        execution: execution
      });
    })
    ["catch"](function(error) {
      logWarn(RENDERING_VIEW_FAILED, error);
      notifyRenderingFailed({
        error: error
      });
    });
}
function processTriggeredViews() {
  while (TASKS.length > 0) {
    var triggeredView = TASKS.pop();
    var viewName = triggeredView.viewName;
    var persistedView = findView(viewName, triggeredView);
    if (!isNil(persistedView)) {
      executeApplyOffersForView(persistedView);
    }
  }
}
function processResponseEvents() {
  STATE = LOADED;
  processTriggeredViews();
}
function setupListeners() {
  subscribe(CACHE_UPDATED_EVENT, processResponseEvents);
  subscribe(NO_OFFERS_EVENT, processResponseEvents);
  subscribe(REDIRECT_OFFER_EVENT, processResponseEvents);
}
function getTriggerViewOptions(viewName, opts) {
  var result = {};
  result.viewName = viewName;
  result.impressionId = uuid();
  result.page = true;
  if (!isEmpty(opts)) {
    result.page = !!opts.page;
  }
  return result;
}
function handleTriggeredView(options) {
  handleAuthoringTriggeredView(options);
  var viewName = options.viewName;
  var persistedView = findView(viewName, options);
  if (isNil(persistedView) && options.page) {
    sendViewTriggeredNotifications(options);
  }
  TASKS.push(options);
  if (STATE !== LOADED) {
    return;
  }
  processTriggeredViews();
}
function triggerView(value, opts) {
  if (!isString(value) || isBlank(value)) {
    logWarn(TRIGGER_VIEW, VIEW_NAME_ERROR, value);
    addClientTrace({
      source: TRIGGER_VIEW,
      view: value,
      error: VIEW_NAME_ERROR
    });
    return;
  }
  var viewName = value.toLowerCase();
  var options = getTriggerViewOptions(viewName, opts);
  logDebug(TRIGGER_VIEW, viewName, options);
  addClientTrace({
    source: TRIGGER_VIEW,
    view: viewName,
    options: options
  });
  handleTriggeredView(options);
}
setupListeners();

var COMMON_MBOX_WARN =
  "function has been deprecated. Please use getOffer() and applyOffer() functions instead.";
var REGISTER_EXTENSION_WARN =
  "adobe.target.registerExtension() function has been deprecated. Please review the documentation for alternatives.";
var MBOX_CREATE_WARN = "mboxCreate() " + COMMON_MBOX_WARN;
var MBOX_DEFINE_WARN = "mboxDefine() " + COMMON_MBOX_WARN;
var MBOX_UPDATE_WARN = "mboxUpdate() " + COMMON_MBOX_WARN;
function registerExtension() {
  logWarn(REGISTER_EXTENSION_WARN, arguments);
}
function mboxCreate() {
  logWarn(MBOX_CREATE_WARN, arguments);
}
function mboxDefine() {
  logWarn(MBOX_DEFINE_WARN, arguments);
}
function mboxUpdate() {
  logWarn(MBOX_UPDATE_WARN, arguments);
}

function overridePublicApi(win) {
  var noop = function noop() {};
  var noopPromise = function noopPromise() {
    return resolve();
  };
  win.adobe = win.adobe || {};
  win.adobe.target = {
    VERSION: "",
    event: {},
    getOffer: noop,
    getOffers: noopPromise,
    applyOffer: noop,
    applyOffers: noopPromise,
    sendNotifications: noop,
    trackEvent: noop,
    triggerView: noop,
    registerExtension: noop,
    init: noop
  };
  win.mboxCreate = noop;
  win.mboxDefine = noop;
  win.mboxUpdate = noop;
}
function init(win, doc, settings) {
  if (
    win.adobe &&
    win.adobe.target &&
    typeof win.adobe.target.getOffer !== "undefined"
  ) {
    logWarn(ALREADY_INITIALIZED);
    return;
  }
  initConfig(settings);
  var config = getConfig();
  var version = config[VERSION];
  win.adobe = win.adobe || {};
  win.adobe.target = win.adobe.target || {};
  win.adobe.target.VERSION = version;
  win.adobe.target.event = {
    LIBRARY_LOADED: LIBRARY_LOADED,
    REQUEST_START: REQUEST_START,
    REQUEST_SUCCEEDED: REQUEST_SUCCEEDED$1,
    REQUEST_FAILED: REQUEST_FAILED$1,
    CONTENT_RENDERING_START: CONTENT_RENDERING_START,
    CONTENT_RENDERING_SUCCEEDED: CONTENT_RENDERING_SUCCEEDED,
    CONTENT_RENDERING_FAILED: CONTENT_RENDERING_FAILED,
    CONTENT_RENDERING_NO_OFFERS: CONTENT_RENDERING_NO_OFFERS,
    CONTENT_RENDERING_REDIRECT: CONTENT_RENDERING_REDIRECT
  };
  if (!config[ENABLED]) {
    overridePublicApi(win);
    logWarn(DELIVERY_DISABLED);
    return;
  }
  initTraces();
  initAuthoringCode();
  initQaMode(win);
  win.adobe.target.getOffer = getOffer;
  win.adobe.target.getOffers = getOffers;
  win.adobe.target.applyOffer = applyOffer;
  win.adobe.target.applyOffers = applyOffers;
  win.adobe.target.sendNotifications = sendNotifications;
  win.adobe.target.trackEvent = trackEvent;
  win.adobe.target.triggerView = triggerView;
  win.adobe.target.registerExtension = registerExtension;
  win.mboxCreate = mboxCreate;
  win.mboxDefine = mboxDefine;
  win.mboxUpdate = mboxUpdate;
  notifyLibraryLoaded();
}
var bootstrapLaunch = {
  init: init,
  initConfig: initConfig,
  initDelivery: initDelivery
};

module.exports = bootstrapLaunch;

          }

        },
        "adobe-target-v2/lib/messages.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

module.exports = {
  ALREADY_INITIALIZED: "AT: Adobe Target has already been initialized.",
  DELIVERY_DISABLED: "AT: Adobe Target content delivery is disabled. Update your DOCTYPE to support Standards mode.",
  NO_REQUEST: "AT: Target library is either not loaded or disabled, no request will be executed"
};
          }

        },
        "adobe-target-v2/lib/modules/params-store.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

var overrideProps = require("./object-override");

var params = {};
var pageLoadParams = {};

function isComplexParam(param) {
  return param.value != null && param.checked != null;
}

function processParams(items) {
  var result = {};
  var keys = Object.keys(items);

  keys.forEach(function (key) {
    var param = items[key];

    if (!isComplexParam(param)) {
      result[key] = param;
      return;
    }

    var checked = param.checked,
        value = param.value;


    if (checked && value === "") {
      return;
    }

    result[key] = value;
  });

  return result;
}

function mergeParams(items) {
  var processedParams = processParams(items);
  overrideProps(params, processedParams);
}

function mergePageLoadParams(items) {
  var processedParams = processParams(items);
  overrideProps(pageLoadParams, processedParams);
}

function getParams() {
  return params;
}

function getPageLoadParams() {
  return pageLoadParams;
}

module.exports = {
  mergeParams: mergeParams,
  mergePageLoadParams: mergePageLoadParams,
  getParams: getParams,
  getPageLoadParams: getPageLoadParams
};
          }

        },
        "adobe-target-v2/lib/modules/object-override.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

function overrideProp(overriden, overriding, field, undef) {
  if (overriding[field] !== undef) {
    overriden[field] = overriding[field]; //eslint-disable-line
  }
}

function subsetFilter(key) {
  if (Array.isArray(this.subset)) {
    return this.subset.indexOf(key) !== -1;
  }
  return true;
}

module.exports = function (overriden, overriding, subset) {
  Object.keys(overriding).filter(subsetFilter, { subset: subset }).forEach(function (key) {
    overrideProp(overriden, overriding, key);
  });
};
          }

        },
        "adobe-target-v2/lib/librarySettings.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

var TARGET_DEFAULT_SETTINGS = {
  version: "2.3.2"
};

module.exports = {
  TARGET_DEFAULT_SETTINGS: TARGET_DEFAULT_SETTINGS
};
          }

        },
        "adobe-target-v2/lib/modules/page-load.js": {
          "script": function(module, exports, require, turbine) {
"use strict";

var _librarySettings = require("../librarySettings");

var win = require("@adobe/reactor-window"); /* eslint-disable import/no-extraneous-dependencies */

var overrideProps = require("./object-override");

var _require = require("./params-store"),
    getParams = _require.getParams,
    getPageLoadParams = _require.getPageLoadParams;

var _require2 = require("../targetSettings"),
    targetSettings = _require2.targetSettings;

module.exports = function (settings) {
  targetSettings.mboxParams = getParams();
  targetSettings.globalMboxParams = getPageLoadParams();

  overrideProps(targetSettings, settings, ["bodyHidingEnabled", "bodyHiddenStyle"]);

  overrideProps(targetSettings, win.targetGlobalSettings || {}, ["enabled", "bodyHidingEnabled", "bodyHiddenStyle"]);
  overrideProps(targetSettings, _librarySettings.TARGET_DEFAULT_SETTINGS || {}, ["version"]);

  return targetSettings;
};
          }

        }
      },
      "settings": {
        "targetSettings": {
          "enabled": true,
          "timeout": 3000,
          "version": "2.3.2",
          "endpoint": "/rest/v1/delivery",
          "imsOrgId": "97D1F3F459CE0AD80A495CBE@AdobeOrg",
          "clientCode": "unifiedjslab",
          "secureOnly": false,
          "serverState": {
          },
          "optinEnabled": false,
          "serverDomain": "unifiedjslab.tt.omtrdc.net",
          "urlSizeLimit": 2048,
          "viewsEnabled": true,
          "optoutEnabled": false,
          "globalMboxName": "target-global-mbox",
          "bodyHiddenStyle": "body {opacity: 0}",
          "pageLoadEnabled": true,
          "analyticsLogging": "server_side",
          "deviceIdLifetime": 63244800000,
          "bodyHidingEnabled": true,
          "sessionIdLifetime": 1860000,
          "visitorApiTimeout": 2000,
          "authoringScriptUrl": "//cdn.tt.omtrdc.net/cdn/target-vec.js",
          "overrideMboxEdgeServer": false,
          "selectorsPollingTimeout": 5000,
          "defaultContentHiddenStyle": "visibility: hidden;",
          "defaultContentVisibleStyle": "visibility: visible;",
          "overrideMboxEdgeServerTimeout": 1860000,
          "supplementalDataIdParamTimeout": 30
        }
      },
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/4bbb6b9dc376/15a347b44599/hostedLibFiles/EP269792aa7319457ea7dd670d3f2f68e5/"
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
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/4bbb6b9dc376/15a347b44599/hostedLibFiles/EP2e2f86ba46954a2b8a2b3bb72276b9f8/"
    },
    "adobe-analytics": {
      "displayName": "Adobe Analytics",
      "modules": {
        "adobe-analytics/src/lib/actions/sendBeacon.js": {
          "name": "send-beacon",
          "displayName": "Send Beacon",
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var getTracker = require('../sharedModules/getTracker');

var isLink = function(element) {
  return element && element.nodeName && element.nodeName.toLowerCase() === 'a';
};

var getLinkName = function(element) {
  if (isLink(element)) {
    return element.innerHTML;
  } else {
    return 'link clicked';
  }
};

var sendBeacon = function(tracker, settings, targetElement) {
  if (settings.type === 'page') {
    turbine.logger.info('Firing page view beacon.');
    tracker.t();
  } else {
    var linkSettings = {
      linkType: settings.linkType || 'o',
      linkName: settings.linkName || getLinkName(targetElement)
    };

    turbine.logger.info(
      'Firing link track beacon using the values: ' +
      JSON.stringify(linkSettings) + '.'
    );

    tracker.tl(
      isLink(targetElement) ? targetElement : 'true',
      linkSettings.linkType,
      linkSettings.linkName
    );
  }
};

module.exports = function(settings, event) {
  return getTracker().then(function(tracker) {
    sendBeacon(tracker, settings, event.element);
  }, function(errorMessage) {
    turbine.logger.error(
      'Cannot send beacon: ' +
      errorMessage
    );
  });
};

          }

        },
        "adobe-analytics/src/lib/sharedModules/getTracker.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var cookie = require('@adobe/reactor-cookie');
var Promise = require('@adobe/reactor-promise');
var window = require('@adobe/reactor-window');
var settingsHelper = require('../helpers/settingsHelper');
var augmenters = require('../helpers/augmenters');

var applyTrackerVariables = require('../helpers/applyTrackerVariables');
var loadLibrary = require('../helpers/loadLibrary');
var generateVersion = require('../helpers/generateVersion');

var version = generateVersion(turbine.buildInfo.turbineBuildDate);
var BEFORE_SETTINGS_LOAD_PHASE = 'beforeSettings';

var mcidInstance = turbine.getSharedModule('adobe-mcid', 'mcid-instance');

var checkEuCompliance = function(trackingCoookieName) {
  if (!trackingCoookieName) {
    return true;
  }

  var euCookieValue = cookie.get(trackingCoookieName);
  return euCookieValue === 'true';
};

var augmentTracker = function(tracker) {
  return Promise.all(augmenters.map(function(augmenterFn) {
    var result;

    // If a tracker augmenter fails, we don't want to fail too. We'll re-throw the error in a
    // timeout so it still hits the console but doesn't reject our promise.
    try {
      result = augmenterFn(tracker);
    } catch (e) {
      setTimeout(function() {
        throw e;
      });
    }

    return Promise.resolve(result);
  })).then(function() {
    return tracker;
  });
};

var linkVisitorId = function(tracker) {
  if (mcidInstance) {
    turbine.logger.info('Setting MCID instance on the tracker.');
    tracker.visitor = mcidInstance;
  }

  return tracker;
};

var updateTrackerVersion = function(tracker) {
  turbine.logger.info('Setting version on tracker: "' + version + '".');

  if (typeof tracker.tagContainerMarker !== 'undefined') {
    tracker.tagContainerMarker = version;
  } else if (typeof tracker.version === 'string'
    && tracker.version.substring(tracker.version.length - 5) !== ('-' + version)) {
    tracker.version += '-' + version;
  }

  return tracker;
};

var updateTrackerVariables = function(trackerProperties, customSetup, tracker) {
  if (customSetup.loadPhase === BEFORE_SETTINGS_LOAD_PHASE && customSetup.source) {
    turbine.logger.info('Calling custom script before settings.');
    customSetup.source.call(window, tracker);
  }

  applyTrackerVariables(tracker, trackerProperties || {});

  if (customSetup.loadPhase !== BEFORE_SETTINGS_LOAD_PHASE && customSetup.source) {
    turbine.logger.info('Calling custom script after settings.');
    customSetup.source.call(window, tracker);
  }

  return tracker;
};

var initializeAudienceManagement = function(settings, tracker) {
  if (settingsHelper.isAudienceManagementEnabled(settings)) {
    tracker.loadModule('AudienceManagement');
    turbine.logger.info('Initializing AudienceManagement module');
    tracker.AudienceManagement.setup(settings.moduleProperties.audienceManager.config);
  }
  return tracker;
};

var initialize = function(settings) {
  if (checkEuCompliance(settings.trackingCookieName)) {
    return loadLibrary(settings)
      .then(augmentTracker)
      .then(linkVisitorId)
      .then(updateTrackerVersion)
      .then(updateTrackerVariables.bind(
        null,
        settings.trackerProperties,
        settings.customSetup || {}
      ))
      .then(initializeAudienceManagement.bind(null, settings));
  } else {
    return Promise.reject('EU compliance was not acknowledged by the user.');
  }
};

var promise = initialize(turbine.getExtensionSettings());
module.exports = function() {
  return promise;
};

          }
,
          "name": "get-tracker",
          "shared": true
        },
        "adobe-analytics/src/lib/sharedModules/augmentTracker.js": {
          "name": "augment-tracker",
          "shared": true,
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var augmenters = require('../helpers/augmenters');

module.exports = function(fn) {
  augmenters.push(fn);
};

          }

        },
        "adobe-analytics/src/lib/helpers/settingsHelper.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var window = require('@adobe/reactor-window');

var settingsHelper = {
  LIB_TYPES: {
    MANAGED: 'managed',
    PREINSTALLED: 'preinstalled',
    REMOTE: 'remote',
    CUSTOM: 'custom'
  },

  MANAGED_LIB_PATHS: {
    APP_MEASUREMENT: 'AppMeasurement.js',
    ACTIVITY_MAP: 'AppMeasurement_Module_ActivityMap.js',
    AUDIENCE_MANAGEMENT: 'AppMeasurement_Module_AudienceManagement.js',
  },

  getReportSuites: function(reportSuitesData) {
    var reportSuiteValues = reportSuitesData.production;
    if (reportSuitesData[turbine.buildInfo.environment]) {
      reportSuiteValues = reportSuitesData[turbine.buildInfo.environment];
    }

    return reportSuiteValues.join(',');
  },

  isActivityMapEnabled: function(settings) {
    return !(settings.libraryCode &&
      !settings.libraryCode.useActivityMap &&
      settings.libraryCode.useActivityMap === false);
  },

  isAudienceManagementEnabled: function(settings) {
    var isEnabled = false;
    // check if audience management module should be enabled
    if (settings &&
      settings.moduleProperties &&
      settings.moduleProperties.audienceManager &&
      settings.moduleProperties.audienceManager.config &&
      window &&
      window._satellite &&
      window._satellite.company &&
      window._satellite.company.orgId) {
      isEnabled = true;
    }

    return isEnabled;
  }
};

module.exports = settingsHelper;

          }

        },
        "adobe-analytics/src/lib/helpers/augmenters.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2017 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

module.exports = [];

          }

        },
        "adobe-analytics/src/lib/helpers/applyTrackerVariables.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var queryString = require('@adobe/reactor-query-string');
var window = require('@adobe/reactor-window');

var eVarRegExp = /eVar([0-9]+)/;
var propRegExp = /prop([0-9]+)/;
var linkTrackVarsKeys = new RegExp('^(eVar[0-9]+)|(prop[0-9]+)|(hier[0-9]+)|campaign|purchaseID|' +
  'channel|server|state|zip|pageType$');

var onlyUnique = function(value, index, self) {
  return self.indexOf(value) === index;
};

var buildLinkTrackVars = function(tracker, newTrackerProperties, addEvents) {
  var linkTrackVarsValues = Object.keys(newTrackerProperties)
    .filter(linkTrackVarsKeys.test.bind(linkTrackVarsKeys));

  if (addEvents) {
    linkTrackVarsValues.push('events');
  }

  // Merge with the values already set on tracker.
  linkTrackVarsValues = linkTrackVarsValues.concat((tracker.linkTrackVars || '').split(','));

  return linkTrackVarsValues.filter(function(value, index) {
    return value !== 'None' && value && onlyUnique(value, index, linkTrackVarsValues);
  }).join(',');
};

var buildLinkTrackEvents = function(tracker, eventsData) {
  var linkTrackEventsValues = eventsData.map(function(event) {
    return event.name;
  });

  // Merge with the values already set on tracker.
  linkTrackEventsValues = linkTrackEventsValues.concat((tracker.linkTrackEvents || '').split(','));

  return linkTrackEventsValues.filter(function(value, index) {
    return value !== 'None'  && onlyUnique(value, index, linkTrackEventsValues);
  }).join(',');
};

var commaJoin = function(store, keyName, trackerProperties) {
  store[keyName] = trackerProperties[keyName].join(',');
};

var variablesTransform = function(store, keyName, trackerProperties) {
  var dynamicVariablePrefix = trackerProperties.dynamicVariablePrefix || 'D=';

  trackerProperties[keyName].forEach(function(variableData) {
    var value;
    if (variableData.type === 'value') {
      value = variableData.value;
    } else {
      var eVarData = eVarRegExp.exec(variableData.value);

      if (eVarData) {
        value = dynamicVariablePrefix + 'v' + eVarData[1];
      } else {
        var propData = propRegExp.exec(variableData.value);

        if (propData) {
          value = dynamicVariablePrefix + 'c' + propData[1];
        }
      }
    }

    store[variableData.name] = value;
  });
};

var transformers = {
  linkDownloadFileTypes: commaJoin,
  linkExternalFilters: commaJoin,
  linkInternalFilters: commaJoin,
  hierarchies: function(store, keyName, trackerProperties) {
    trackerProperties[keyName].forEach(function(hierarchyData) {
      store[hierarchyData.name] = hierarchyData.sections.join(hierarchyData.delimiter);
    });
  },
  props: variablesTransform,
  eVars: variablesTransform,
  campaign: function(store, keyName, trackerProperties) {
    if (trackerProperties[keyName].type === 'queryParam') {
      var queryParams = queryString.parse(window.location.search);
      store[keyName] = queryParams[trackerProperties[keyName].value];
    } else {
      store[keyName] = trackerProperties[keyName].value;
    }
  },
  events: function(store, keyName, trackerProperties) {
    var events = trackerProperties[keyName].map(function(data) {
      var entry = data.name;
      if (data.id) {
        entry = [entry, data.id].join(':');
      }
      if (data.value) {
        entry = [entry, data.value].join('=');
      }
      return entry;
    });
    store[keyName] = events.join(',');
  }
};

module.exports = function(tracker, trackerProperties) {
  var newProperties = {};
  trackerProperties = trackerProperties || {};

  Object.keys(trackerProperties).forEach(function(propertyName) {
    var transform = transformers[propertyName];
    var value = trackerProperties[propertyName];

    if (transform) {
      transform(newProperties, propertyName, trackerProperties);
    } else {
      newProperties[propertyName] = value;
    }
  });

  // New events are added to existing tracker events
  if (newProperties.events) {
    if (tracker.events && tracker.events.length > 0) {
      newProperties.events = tracker.events + ',' + newProperties.events;
    }
  }

  var hasEvents =
    trackerProperties && trackerProperties.events && trackerProperties.events.length > 0;
  var linkTrackVars = buildLinkTrackVars(tracker, newProperties, hasEvents);
  if (linkTrackVars) {
    newProperties.linkTrackVars = linkTrackVars;
  }

  var linkTrackEvents = buildLinkTrackEvents(tracker, trackerProperties.events || []);
  if (linkTrackEvents) {
    newProperties.linkTrackEvents = linkTrackEvents;
  }

  turbine.logger.info(
    'Applying the following properties on tracker: "' +
    JSON.stringify(newProperties) +
    '".'
  );

  Object.keys(newProperties).forEach(function(propertyName) {
    tracker[propertyName] = newProperties[propertyName];
  });
};

          }

        },
        "adobe-analytics/src/lib/helpers/loadLibrary.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var loadScript = require('@adobe/reactor-load-script');
var window = require('@adobe/reactor-window');
var Promise = require('@adobe/reactor-promise');
var settingsHelper = require('./settingsHelper');
var pollHelper = require('./pollHelper');

var createTracker = function(settings, reportSuites) {
  if (!window.s_gi) {
    throw new Error(
      'Unable to create AppMeasurement tracker, `s_gi` function not found.' + window.AppMeasurement
    );
  }
  turbine.logger.info('Creating AppMeasurement tracker with these report suites: "' +
    reportSuites + '"');
  var tracker = window.s_gi(reportSuites);
  if (settings.libraryCode.scopeTrackerGlobally) {
    turbine.logger.info('Setting the tracker as window.s');
    window.s = tracker;
  }
  return tracker;
};

/**
 * @param settings
 *
 * @return array
 */
var getUrlsToLoad = function(settings) {
  var urls = [];
  switch (settings.libraryCode.type) {
    case settingsHelper.LIB_TYPES.MANAGED:
      // load app measurement
      urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.APP_MEASUREMENT));
      // check if activity map should be loaded
      if (settingsHelper.isActivityMapEnabled(settings)) {
        urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.ACTIVITY_MAP));
      }
      break;
    case settingsHelper.LIB_TYPES.CUSTOM:
      urls.push(settings.libraryCode.source);
      break;
    case settingsHelper.LIB_TYPES.REMOTE:
      urls.push(window.location.protocol === 'https:' ?
        settings.libraryCode.httpsUrl : settings.libraryCode.httpUrl);
      break;
  }
  // check if audience management should be loaded
  if (settingsHelper.isAudienceManagementEnabled(settings)) {
    var visitorServiceConfig = {
      namespace: window._satellite.company.orgId
    };
    settings.moduleProperties.audienceManager.config.visitorService = visitorServiceConfig;
    urls.push(turbine.getHostedLibFileUrl(settingsHelper.MANAGED_LIB_PATHS.AUDIENCE_MANAGEMENT));
  }
  return urls;
};

var loadLibraryScripts = function(settings) {
  return Promise.all(getUrlsToLoad(settings).map(function(url) {
    turbine.logger.info("Loading script: " + url);
    return loadScript(url);
  }));
};

var setReportSuitesOnTracker = function(settings, tracker) {
  if (settings.libraryCode.accounts) {
    if (!tracker.sa) {
      turbine.logger.warn('Cannot set report suites on tracker. `sa` method not available.');
    } else {
      var reportSuites = settingsHelper.getReportSuites(settings.libraryCode.accounts);
      turbine.logger.info('Setting the following report suites on the tracker: "' +
        reportSuites + '"');
      tracker.sa(reportSuites);
    }
  }

  return tracker;
};

var getTrackerFromVariable = function(trackerVariableName) {
  if (window[trackerVariableName]) {
    turbine.logger.info('Found tracker located at: "' + trackerVariableName + '".');
    return window[trackerVariableName];
  } else {
    throw new Error('Cannot find the global variable name: "' + trackerVariableName + '".');
  }
};

// returns a promise that resolves with the tracker
module.exports = function(settings) {
  // loads all libraries from urls in parallel
  var loadLibraries = loadLibraryScripts(settings);

  // now setup the tracker
  switch (settings.libraryCode.type) {
    case settingsHelper.LIB_TYPES.MANAGED:
      var reportSuites = settingsHelper.getReportSuites(settings.libraryCode.accounts);
      return loadLibraries
        .then(createTracker.bind(null, settings, reportSuites));

    case settingsHelper.LIB_TYPES.PREINSTALLED:
      return loadLibraries
        .then(pollHelper.poll.bind(null, window, settings.libraryCode.trackerVariableName))
        .then(setReportSuitesOnTracker.bind(null, settings));

    case settingsHelper.LIB_TYPES.CUSTOM:
    case settingsHelper.LIB_TYPES.REMOTE:
      return loadLibraries
        .then(getTrackerFromVariable.bind(null, settings.libraryCode.trackerVariableName))
        .then(setReportSuitesOnTracker.bind(null, settings));

    default:
      throw new Error('Cannot load library. Type not supported.');

  }
};

          }

        },
        "adobe-analytics/src/lib/helpers/generateVersion.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

// The Launch code version is a 4 characters string.  The first character will always be L
// followed by year, month, and day codes.
// For example: JS-1.4.3-L53O = JS 1.4.3 code, Launch 2015 March 24th release (revision 1)
// More info: https://wiki.corp.adobe.com/pages/viewpage.action?spaceKey=tagmanager&title=DTM+Analytics+Code+Versions

'use strict';

var THIRD_OF_DAY = 8; //hours

var getDayField = function(date) {
  return date.getUTCDate().toString(36);
};

var getLastChar = function(str) {
  return str.substr(str.length - 1);
};

var getRevision = function(date) {
  // We are under the assumption that a Turbine version will be release at least 8h apart (max 3
  // releases per day).
  return Math.floor(date.getUTCHours() / THIRD_OF_DAY);
};

var getMonthField = function(date) {
  var monthNumber = date.getUTCMonth() + 1;
  var revision = getRevision(date);

  var monthField = (monthNumber + revision * 12).toString(36);

  return getLastChar(monthField);
};

var getYearField = function(date) {
  return (date.getUTCFullYear() - 2010).toString(36);
};

module.exports = function(dateString) {
  var date = new Date(dateString);

  if (isNaN(date)) {
    throw new Error('Invalid date provided');
  }

  return ('L' + getYearField(date) + getMonthField(date) + getDayField(date)).toUpperCase();
};

          }

        },
        "adobe-analytics/src/lib/helpers/pollHelper.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2020 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by all applicable intellectual property
 * laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

'use strict';

var Promise = require('@adobe/reactor-promise');

var MAX_ITERATIONS = 40;
var INTERVAL = 250;

var found = function(resolve, variableName, result) {
  turbine.logger.info('Found property located at: "' + variableName + '"].');
  resolve(result);
};

var getPromise = function(object, variableName) {
  return new Promise(function(resolve, reject) {
    if (object[variableName]) {
      return found(resolve, variableName, object[variableName]);
    }
    var i = 1;
    var intervalId = setInterval(function() {
      if (object[variableName]) {
        found(resolve, variableName, object[variableName]);
        clearInterval(intervalId);
      }
      // give up after 10 seconds
      if (i >= MAX_ITERATIONS) {
        clearInterval(intervalId);
        reject(new Error(
          'Bailing out. Cannot find the variable name: "' + variableName + '"].'));
      }
      i++;
    }, INTERVAL); // every 1/4th second
  });
};

module.exports = {
  poll: function(object, variableName) {
    turbine.logger.info('Waiting for the property to become accessible at: "'
      + variableName + '"].');
    return getPromise(object, variableName);
  }
};

          }

        }
      },
      "settings": {
        "orgId": "97D1F3F459CE0AD80A495CBE@AdobeOrg",
        "libraryCode": {
          "type": "managed",
          "accounts": {
            "staging": [
              "ujslatest"
            ],
            "production": [
              "ujslatest"
            ],
            "development": [
              "ujslatest"
            ]
          },
          "useActivityMap": false,
          "scopeTrackerGlobally": false
        },
        "trackerProperties": {
          "currencyCode": "USD",
          "trackInlineStats": true,
          "trackDownloadLinks": true,
          "trackExternalLinks": true,
          "linkDownloadFileTypes": [
            "doc",
            "docx",
            "eps",
            "jpg",
            "png",
            "svg",
            "xls",
            "ppt",
            "pptx",
            "pdf",
            "xlsx",
            "tab",
            "csv",
            "zip",
            "txt",
            "vsd",
            "vxd",
            "xml",
            "js",
            "css",
            "rar",
            "exe",
            "wma",
            "mov",
            "avi",
            "wmv",
            "mp3",
            "wav",
            "m4v"
          ]
        }
      },
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/4bbb6b9dc376/15a347b44599/hostedLibFiles/EPbde2f7ca14e540399dcc1f8208860b7b/"
    },
    "aam-dil-extension": {
      "displayName": "Adobe Audience Manager (DIL)",
      "modules": {
        "aam-dil-extension/src/lib/sharedModules/dilinstance.js": {
          "script": function(module, exports, require, turbine) {
'use strict';

var document = require('@adobe/reactor-document');

// It would be best if this module exported the DIL object. At the moment, it sets a global that
// we reference below.
require('../../view/configuration/js/dil');

var settings = turbine.getExtensionSettings();
var augmentTracker = turbine.getSharedModule('adobe-analytics', 'augment-tracker');
var logger = turbine.logger;

function excludePathsMatched(path) {
    var pathExclusions = settings.pathExclusions || [];

    return pathExclusions.some(function(pathExclusion) {
        if (pathExclusion.valueIsRegex) {
            return new RegExp(pathExclusion.value, 'i').test(path);
        } else {
            return pathExclusion.value === path;
        }
    });
}

var dilInstance;

if (excludePathsMatched(document.location.pathname)) {
    logger.warn('AAM DIL extension not loaded. One of the path exclusions matches the current path.');
} else {
    try {
        var initConfig = settings.dilInitConfigData.parsedData;

        dilInstance = DIL.getDil(initConfig.partner, initConfig.containerNSID);

        if (!(dilInstance instanceof DIL)) {
            dilInstance = DIL.create(initConfig);
            logger.log('DIL instance created.');

            if (augmentTracker && settings.useSiteCatalyst) {
                augmentTracker(function(tracker) {
                    if (tracker) { // Should always be true.
                        DIL.modules.siteCatalyst.init(tracker, dilInstance, settings.siteCatalystConfig());
                        logger.log('DIL.modules.siteCatalyst.init called.');
                    }
                });
            }

            if (settings.useGoogleAnalytics) {
                var ga = settings.googleAnalyticsData.parsedData.variableNameForGoogleAnalytics || 'ga';

                DIL.modules.GA.submitUniversalAnalytics(window[ga], dilInstance);
                logger.log('DIL.modules.GA.submitUniversalAnalytics called.');
            }
        } else {
            logger.log('Using existing DIL instance. Not attempting to reinvoke DIL.modules.siteCatalyst.init and DIL.modules.GA.submitUniversalAnalytics');
        }
    } catch(e) {
        try {
            logger.error(e);

            if (dilInstance) {
                dilInstance.log.push(e);
            }
        } catch(e2) {}
    }
}

module.exports = dilInstance;
          }

        },
        "aam-dil-extension/src/view/configuration/js/dil.js": {
          "script": function(module, exports, require, turbine) {
!function(){"use strict";function e(e,t,s){var n="",i=t||"Error caught in DIL module/submodule: ";return e===Object(e)?n=i+(e.message||"err has no message"):(n=i+"err is not a valid object",e={}),e.message=n,s instanceof DIL&&(e.partner=s.api.getPartner()),DIL.errorModule.handleError(e),this.errorMessage=n}var r,a,o,t={submitUniversalAnalytics:function(e,t,s){try{var n,i,r,a,o=e.getAll()[0],d=o[s||"b"].data.keys,u={};for(n=0,i=d.length;n<i;n++)r=d[n],void 0===(a=o.get(r))||"function"==typeof a||a===Object(a)||/^_/.test(r)||/^&/.test(r)||(u[r]=a);return t.api.signals(u,"c_").submit(),u}catch(e){return"Caught error with message: "+e.message}},dil:null,arr:null,tv:null,errorMessage:"",defaultTrackVars:["_setAccount","_setCustomVar","_addItem","_addTrans","_trackSocial"],defaultTrackVarsObj:null,signals:{},hasSignals:!1,handle:e,init:function(e,t,s){try{this.dil=null,this.arr=null,this.tv=null,this.errorMessage="",this.signals={},this.hasSignals=!1;var n={name:"DIL GA Module Error"},i="";t instanceof DIL?(this.dil=t,n.partner=this.dil.api.getPartner()):(i="dilInstance is not a valid instance of DIL",n.message=i,DIL.errorModule.handleError(n)),e instanceof Array&&e.length?this.arr=e:(i="gaArray is not an array or is empty",n.message=i,DIL.errorModule.handleError(n)),this.tv=this.constructTrackVars(s),this.errorMessage=i}catch(e){this.handle(e,"DIL.modules.GA.init() caught error with message ",this.dil)}finally{return this}},constructTrackVars:function(e){var t,s,n,i,r,a,o=[];if(this.defaultTrackVarsObj!==Object(this.defaultTrackVarsObj)){for(a={},s=0,n=(r=this.defaultTrackVars).length;s<n;s++)a[r[s]]=!0;this.defaultTrackVarsObj=a}else a=this.defaultTrackVarsObj;if(e===Object(e)){if((t=e.names)instanceof Array&&(n=t.length))for(s=0;s<n;s++)"string"==typeof(i=t[s])&&i.length&&i in a&&o.push(i);if(o.length)return o}return this.defaultTrackVars},constructGAObj:function(e){var t,s,n,i,r,a,o={},d=e instanceof Array?e:this.arr;for(t=0,s=d.length;t<s;t++)(n=d[t])instanceof Array&&n.length&&(r=n=[],a=d[t],r instanceof Array&&a instanceof Array&&Array.prototype.push.apply(r,a),"string"==typeof(i=n.shift())&&i.length&&(o[i]instanceof Array||(o[i]=[]),o[i].push(n)));return o},addToSignals:function(e,t){return"string"==typeof e&&""!==e&&null!=t&&""!==t&&(this.signals[e]instanceof Array||(this.signals[e]=[]),this.signals[e].push(t),this.hasSignals=!0)},constructSignals:function(){var e,t,s,n,i,r,a=this.constructGAObj(),o={_setAccount:function(e){this.addToSignals("c_accountId",e)},_setCustomVar:function(e,t,s){"string"==typeof t&&t.length&&this.addToSignals("c_"+t,s)},_addItem:function(e,t,s,n,i,r){this.addToSignals("c_itemOrderId",e),this.addToSignals("c_itemSku",t),this.addToSignals("c_itemName",s),this.addToSignals("c_itemCategory",n),this.addToSignals("c_itemPrice",i),this.addToSignals("c_itemQuantity",r)},_addTrans:function(e,t,s,n,i,r,a,o){this.addToSignals("c_transOrderId",e),this.addToSignals("c_transAffiliation",t),this.addToSignals("c_transTotal",s),this.addToSignals("c_transTax",n),this.addToSignals("c_transShipping",i),this.addToSignals("c_transCity",r),this.addToSignals("c_transState",a),this.addToSignals("c_transCountry",o)},_trackSocial:function(e,t,s,n){this.addToSignals("c_socialNetwork",e),this.addToSignals("c_socialAction",t),this.addToSignals("c_socialTarget",s),this.addToSignals("c_socialPagePath",n)}},d=this.tv;for(e=0,t=d.length;e<t;e++)if(s=d[e],a.hasOwnProperty(s)&&o.hasOwnProperty(s)&&(r=a[s])instanceof Array)for(n=0,i=r.length;n<i;n++)o[s].apply(this,r[n])},submit:function(){try{return""!==this.errorMessage?this.errorMessage:(this.constructSignals(),this.hasSignals?(this.dil.api.signals(this.signals).submit(),"Signals sent: "+this.dil.helpers.convertObjectToKeyValuePairs(this.signals,"=",!0)):"No signals present")}catch(e){return this.handle(e,"DIL.modules.GA.submit() caught error with message ",this.dil)}},Stuffer:{LIMIT:5,dil:null,cookieName:null,delimiter:null,errorMessage:"",handle:e,callback:null,v:function(){return!1},init:function(e,t,s){try{this.dil=null,this.callback=null,this.errorMessage="",e instanceof DIL?(this.dil=e,this.v=this.dil.validators.isPopulatedString,this.cookieName=this.v(t)?t:"aam_ga",this.delimiter=this.v(s)?s:"|"):this.handle({message:"dilInstance is not a valid instance of DIL"},"DIL.modules.GA.Stuffer.init() error: ")}catch(e){this.handle(e,"DIL.modules.GA.Stuffer.init() caught error with message ",this.dil)}finally{return this}},process:function(e){var t,s,n,i,r,a,o,d,u,c,l,h=!1,f=1;if(e===Object(e)&&(t=e.stuff)&&t instanceof Array&&(s=t.length))for(n=0;n<s;n++)if((i=t[n])&&i===Object(i)&&(r=i.cn,a=i.cv,r===this.cookieName&&this.v(a))){h=!0;break}if(h){for(o=a.split(this.delimiter),void 0===window._gaq&&(window._gaq=[]),d=window._gaq,n=0,s=o.length;n<s&&(c=(u=o[n].split("="))[0],l=u[1],this.v(c)&&this.v(l)&&d.push(["_setCustomVar",f++,c,l,1]),!(f>this.LIMIT));n++);this.errorMessage=1<f?"No errors - stuffing successful":"No valid values to stuff"}else this.errorMessage="Cookie name and value not found in json";if("function"==typeof this.callback)return this.callback()},submit:function(){try{var t=this;return""!==this.errorMessage?this.errorMessage:(this.dil.api.afterResult(function(e){t.process(e)}).submit(),"DIL.modules.GA.Stuffer.submit() successful")}catch(e){return this.handle(e,"DIL.modules.GA.Stuffer.submit() caught error with message ",this.dil)}}}},s={dil:null,handle:e,init:function(e,t,s,n){try{var f=this,i={name:"DIL Site Catalyst Module Error"},p=function(e){return i.message=e,DIL.errorModule.handleError(i),e};if(this.options=n===Object(n)?n:{},this.dil=null,!(t instanceof DIL))return p("dilInstance is not a valid instance of DIL");if(this.dil=t,i.partner=t.api.getPartner(),e!==Object(e))return p("siteCatalystReportingSuite is not an object");var r=e;return window.AppMeasurement_Module_DIL=r.m_DIL=function(e){var t="function"==typeof e.m_i?e.m_i("DIL"):this;if(t!==Object(t))return p("m is not an object");t.trackVars=f.constructTrackVars(s),t.d=0,t.s=e,t._t=function(){var e,t,s,n,i,r,a=this,o=","+a.trackVars+",",d=a.s,u=[],c=[],l={},h=!1;if(d!==Object(d))return p("Error in m._t function: s is not an object");if(a.d){if("function"==typeof d.foreachVar)d.foreachVar(function(e,t){void 0!==t&&(l[e]=t,h=!0)},a.trackVars);else{if(!(d.va_t instanceof Array))return p("Error in m._t function: s.va_t is not an array");if(d.lightProfileID?e=(e=d.lightTrackVars)&&","+e+","+d.vl_mr+",":(d.pe||d.linkType)&&(e=d.linkTrackVars,d.pe&&(t=d.pe.substring(0,1).toUpperCase()+d.pe.substring(1),d[t]&&(e=d[t].trackVars)),e=e&&","+e+","+d.vl_l+","+d.vl_l2+","),e){for(r=0,u=e.split(",");r<u.length;r++)0<=o.indexOf(","+u[r]+",")&&c.push(u[r]);c.length&&(o=","+c.join(",")+",")}for(n=0,i=d.va_t.length;n<i;n++)s=d.va_t[n],0<=o.indexOf(","+s+",")&&void 0!==d[s]&&null!==d[s]&&""!==d[s]&&(l[s]=d[s],h=!0)}f.includeContextData(d,l).store_populated&&(h=!0),h&&a.d.api.signals(l,"c_").submit()}}},r.loadModule("DIL"),r.DIL.d=t,i.message?i.message:"DIL.modules.siteCatalyst.init() completed with no errors"}catch(e){return this.handle(e,"DIL.modules.siteCatalyst.init() caught error with message ",this.dil)}},constructTrackVars:function(e){var t,s,n,i,r,a,o,d,u=[];if(e===Object(e)){if((t=e.names)instanceof Array&&(i=t.length))for(n=0;n<i;n++)"string"==typeof(r=t[n])&&r.length&&u.push(r);if((s=e.iteratedNames)instanceof Array&&(i=s.length))for(n=0;n<i;n++)if((a=s[n])===Object(a)&&(r=a.name,d=parseInt(a.maxIndex,10),"string"==typeof r&&r.length&&!isNaN(d)&&0<=d))for(o=0;o<=d;o++)u.push(r+o);if(u.length)return u.join(",")}return this.constructTrackVars({names:["pageName","channel","campaign","products","events","pe","pev1","pev2","pev3"],iteratedNames:[{name:"prop",maxIndex:75},{name:"eVar",maxIndex:250}]})},includeContextData:function(e,t){var s={},n=!1;if(e.contextData===Object(e.contextData)){var i,r,a,o,d,u=e.contextData,c=this.options.replaceContextDataPeriodsWith,l=this.options.filterFromContextVariables,h={};if("string"==typeof c&&c.length||(c="_"),l instanceof Array)for(i=0,r=l.length;i<r;i++)a=l[i],this.dil.validators.isPopulatedString(a)&&(h[a]=!0);for(o in u)u.hasOwnProperty(o)&&!h[o]&&(!(d=u[o])&&"number"!=typeof d||(t[o=("contextData."+o).replace(/\./g,c)]=d,n=!0))}return s.store_populated=n,s}};"function"!=typeof window.DIL&&(window.DIL=function(s){var c,e,I,r,u,p,t,a,n,i,o,d,y,l,h,g,f,m,b,v,D,S=[],_={};function O(e){return void 0===e||!0===e}s!==Object(s)&&(s={}),I=s.partner,r=s.containerNSID,u=s.mappings,p=s.uuidCookie,t=!0===s.enableErrorReporting,a=s.visitorService,n=s.declaredId,i=!0===s.delayAllUntilWindowLoad,o=O(s.secureDataCollection),d="boolean"==typeof s.isCoopSafe?s.isCoopSafe:null,y=O(s.enableHrefererParam),l=O(s.enableLogging),h=O(s.enableUrlDestinations),g=O(s.enableCookieDestinations),f=!0===s.disableDefaultRequest,m=s.afterResultForDefaultRequest,b=s.visitorConstructor,v=!0===s.disableCORS,D=!0===s.ignoreHardDependencyOnVisitorAPI,t&&DIL.errorModule.activate(),D&&S.push("Warning: this instance is configured to ignore the hard dependency on the VisitorAPI service. This means that no URL destinations will be fired if the instance has no connection to VisitorAPI. If the VisitorAPI service is not instantiated, ID syncs will not be fired either.");var C=!0===window._dil_unit_tests;if((c=arguments[1])&&S.push(c+""),!I||"string"!=typeof I){var w={name:"error",message:c="DIL partner is invalid or not specified in initConfig",filename:"dil.js"};return DIL.errorModule.handleError(w),new Error(c)}if(c="DIL containerNSID is invalid or not specified in initConfig, setting to default of 0",!r&&"number"!=typeof r||(r=parseInt(r,10),!isNaN(r)&&0<=r&&(c="")),c&&(r=0,S.push(c),c=""),(e=DIL.getDil(I,r))instanceof DIL&&e.api.getPartner()===I&&e.api.getContainerNSID()===r)return e;if(!(this instanceof DIL))return new DIL(s,"DIL was not instantiated with the 'new' operator, returning a valid instance with partner = "+I+" and containerNSID = "+r);DIL.registerDil(this,I,r);var L={doesConsoleLogExist:window.console===Object(window.console)&&"function"==typeof window.console.log,logMemo:{},log:function(e){S.push(e),l&&this.doesConsoleLogExist&&Function.prototype.bind.call(window.console.log,window.console).apply(window.console,arguments)},logOnce:function(e){this.logMemo[e]||(this.logMemo[e]=!0,L.log(e))}},A={IS_HTTPS:o||"https:"===document.location.protocol,SIX_MONTHS_IN_MINUTES:259200,IE_VERSION:function(){if(document.documentMode)return document.documentMode;for(var e=7;4<e;e--){var t=document.createElement("div");if(t.innerHTML="\x3c!--[if IE "+e+"]><span></span><![endif]--\x3e",t.getElementsByTagName("span").length)return t=null,e}return null}()};A.IS_IE_LESS_THAN_10="number"==typeof A.IE_VERSION&&A.IE_VERSION<10;var P={stuffed:{}},T={},R={firingQueue:[],fired:[],firing:!1,sent:[],errored:[],reservedKeys:{sids:!0,pdata:!0,logdata:!0,callback:!0,postCallbackFn:!0,useImageRequest:!0},firstRequestHasFired:!1,abortRequests:!1,num_of_cors_responses:0,num_of_cors_errors:0,corsErrorSources:[],num_of_img_responses:0,num_of_img_errors:0,platformParams:{d_nsid:r+"",d_rtbd:"json",d_jsonv:DIL.jsonVersion+"",d_dst:"1"},nonModStatsParams:{d_rtbd:!0,d_dst:!0,d_cts:!0,d_rs:!0},modStatsParams:null,adms:{TIME_TO_CATCH_ALL_REQUESTS_RELEASE:3e4,calledBack:!1,mid:null,noVisitorAPI:null,VisitorAPI:null,instance:null,releaseType:"no VisitorAPI",isOptedOut:!0,isOptedOutCallbackCalled:!1,admsProcessingStarted:!1,process:function(e){try{if(this.admsProcessingStarted)return;this.admsProcessingStarted=!0;var t,s,n,i=a;if("function"!=typeof e||"function"!=typeof e.getInstance)throw this.noVisitorAPI=!0,new Error("Visitor does not exist.");if(i!==Object(i)||!(t=i.namespace)||"string"!=typeof t)throw this.releaseType="no namespace",new Error("DIL.create() needs the initConfig property `visitorService`:{namespace:'<Experience Cloud Org ID>'}");if((s=e.getInstance(t,{idSyncContainerID:r}))!==Object(s)||"function"!=typeof s.isAllowed||"function"!=typeof s.getMarketingCloudVisitorID||"function"!=typeof s.getCustomerIDs||"function"!=typeof s.isOptedOut||"function"!=typeof s.publishDestinations)throw this.releaseType="invalid instance",n="Invalid Visitor instance.",s===Object(s)&&"function"!=typeof s.publishDestinations&&(n+=" In particular, visitorInstance.publishDestinations is not a function. This is needed to fire URL destinations in DIL v8.0+ and should be present in Visitor v3.3.0+ ."),new Error(n);if(this.VisitorAPI=e,!s.isAllowed())return this.releaseType="VisitorAPI is not allowed to write cookies",void this.releaseRequests();this.instance=s,this.waitForMidToReleaseRequests()}catch(e){if(!D)throw new Error("Error in processing Visitor API, which is a hard dependency for DIL v8.0+: "+e.message);this.releaseRequests()}},waitForMidToReleaseRequests:function(){var t=this;this.instance&&(this.instance.getMarketingCloudVisitorID(function(e){t.mid=e,t.releaseType="VisitorAPI",t.releaseRequests()},!0),(!N.exists||!N.isIabContext&&N.isApproved()||N.isIabContext&&G.hasGoSignal())&&setTimeout(function(){"VisitorAPI"!==t.releaseType&&(t.releaseType="timeout",t.releaseRequests())},this.getLoadTimeout()))},releaseRequests:function(){this.calledBack=!0,R.registerRequest()},getMarketingCloudVisitorID:function(){return this.instance?this.instance.getMarketingCloudVisitorID():null},getMIDQueryString:function(){var e=V.isPopulatedString,t=this.getMarketingCloudVisitorID();return e(this.mid)&&this.mid===t||(this.mid=t),e(this.mid)?"d_mid="+this.mid+"&":""},getCustomerIDs:function(){return this.instance?this.instance.getCustomerIDs():null},getCustomerIDsQueryString:function(e){if(e!==Object(e))return"";var t,s,n,i,r="",a=[],o=[];for(t in e)e.hasOwnProperty(t)&&(s=e[o[0]=t])===Object(s)&&(o[1]=s.id||"",o[2]=s.authState||0,a.push(o),o=[]);if(i=a.length)for(n=0;n<i;n++)r+="&d_cid_ic="+x.encodeAndBuildRequest(a[n],"%01");return r},getIsOptedOut:function(){this.instance?this.instance.isOptedOut([this,this.isOptedOutCallback],this.VisitorAPI.OptOut.GLOBAL,!0):(this.isOptedOut=!1,this.isOptedOutCallbackCalled=!0)},isOptedOutCallback:function(e){this.isOptedOut=e,this.isOptedOutCallbackCalled=!0,R.registerRequest(),N.isIabContext()&&G.checkQueryStringObject()},getLoadTimeout:function(){var e=this.instance;if(e){if("function"==typeof e.getLoadTimeout)return e.getLoadTimeout();if(void 0!==e.loadTimeout)return e.loadTimeout}return this.TIME_TO_CATCH_ALL_REQUESTS_RELEASE}},declaredId:{declaredId:{init:null,request:null},declaredIdCombos:{},setDeclaredId:function(e,t){var s=V.isPopulatedString,n=encodeURIComponent;if(e===Object(e)&&s(t)){var i=e.dpid,r=e.dpuuid,a=null;if(s(i)&&s(r))return a=n(i)+"$"+n(r),!0===this.declaredIdCombos[a]?"setDeclaredId: combo exists for type '"+t+"'":(this.declaredIdCombos[a]=!0,this.declaredId[t]={dpid:i,dpuuid:r},"setDeclaredId: succeeded for type '"+t+"'")}return"setDeclaredId: failed for type '"+t+"'"},getDeclaredIdQueryString:function(){var e=this.declaredId.request,t=this.declaredId.init,s=encodeURIComponent,n="";return null!==e?n="&d_dpid="+s(e.dpid)+"&d_dpuuid="+s(e.dpuuid):null!==t&&(n="&d_dpid="+s(t.dpid)+"&d_dpuuid="+s(t.dpuuid)),n}},registerRequest:function(e){var t,s=this.firingQueue;e===Object(e)&&(s.push(e),e.isDefaultRequest||(f=!0)),this.firing||!s.length||i&&!DIL.windowLoaded||(this.adms.isOptedOutCallbackCalled||this.adms.getIsOptedOut(),this.adms.calledBack&&!this.adms.isOptedOut&&this.adms.isOptedOutCallbackCalled&&(N.isApproved()||G.hasGoSignal())&&(this.adms.isOptedOutCallbackCalled=!1,(t=s.shift()).src=t.src.replace(/&d_nsid=/,"&"+this.adms.getMIDQueryString()+G.getQueryString()+"d_nsid="),V.isPopulatedString(t.corsPostData)&&(t.corsPostData=t.corsPostData.replace(/^d_nsid=/,this.adms.getMIDQueryString()+G.getQueryString()+"d_nsid=")),M.fireRequest(t),this.firstRequestHasFired||"script"!==t.tag&&"cors"!==t.tag||(this.firstRequestHasFired=!0)))},processVisitorAPI:function(){this.adms.process(b||window.Visitor)},getCoopQueryString:function(){var e="";return!0===d?e="&d_coop_safe=1":!1===d&&(e="&d_coop_unsafe=1"),e}};_.requestController=R;var E,j,k={sendingMessages:!1,messages:[],messagesPosted:[],destinations:[],destinationsPosted:[],jsonForComparison:[],jsonDuplicates:[],jsonWaiting:[],jsonProcessed:[],publishDestinationsVersion:null,requestToProcess:function(e,t){var s,n=this;function i(){n.jsonForComparison.push(e),n.jsonWaiting.push([e,t])}if(e&&!V.isEmptyObject(e))if(s=JSON.stringify(e.dests||[]),this.jsonForComparison.length){var r,a,o,d=!1;for(r=0,a=this.jsonForComparison.length;r<a;r++)if(o=this.jsonForComparison[r],s===JSON.stringify(o.dests||[])){d=!0;break}d?this.jsonDuplicates.push(e):i()}else i();if(this.jsonWaiting.length){var u=this.jsonWaiting.shift();this.process(u[0],u[1]),this.requestToProcess()}this.messages.length&&!this.sendingMessages&&this.sendMessages()},process:function(e){if(h){var t,s,n,i,r,a,o=encodeURIComponent,d=this.getPublishDestinationsVersion(),u=!1;if(-1!==d){if((t=e.dests)&&t instanceof Array&&(s=t.length)){for(n=0;n<s;n++)i=t[n],a=[o("dests"),o(i.id||""),o(i.y||""),o(i.c||"")].join("|"),this.addMessage(a),r={url:i.c,hideReferrer:void 0===i.hr||!!i.hr,message:a},this.addDestination(r),void 0!==i.hr&&(u=!0);1===d&&u&&L.logOnce("Warning: visitorInstance.publishDestinations version is old (Visitor v3.3.0 to v4.0.0). URL destinations will not have the option of being fired on page, only in the iframe.")}this.jsonProcessed.push(e)}}},addMessage:function(e){this.messages.push(e)},addDestination:function(e){this.destinations.push(e)},sendMessages:function(){this.sendingMessages||(this.sendingMessages=!0,h&&this.messages.length&&this.publishDestinations())},publishDestinations:function(){function e(e){L.log("visitor.publishDestinations() result: "+(e.error||e.message)),s.sendingMessages=!1,s.requestToProcess()}function t(){s.messages=[],s.destinations=[]}var s=this,n=R.adms.instance,i=[],r=[];return 1===this.publishDestinationsVersion?(x.extendArray(i,this.messages),x.extendArray(this.messagesPosted,this.messages),t(),n.publishDestinations(I,i,e),"Called visitor.publishDestinations() version 1"):1<this.publishDestinationsVersion?(x.extendArray(r,this.destinations),x.extendArray(this.destinationsPosted,this.destinations),t(),n.publishDestinations({subdomain:I,callback:e,urlDestinations:r}),"Called visitor.publishDestinations() version > 1"):void 0},getPublishDestinationsVersion:function(){if(null!==this.publishDestinationsVersion)return this.publishDestinationsVersion;var e=R.adms.instance,s=-1;return e.publishDestinations(null,null,function(e){if(e===Object(e)){var t=e.error;"subdomain is not a populated string."===t?s=1:"Invalid parameters passed."===t&&(s=2)}}),this.publishDestinationsVersion=s}},q={traits:function(e){return V.isValidPdata(e)&&(T.sids instanceof Array||(T.sids=[]),x.extendArray(T.sids,e)),this},pixels:function(e){return V.isValidPdata(e)&&(T.pdata instanceof Array||(T.pdata=[]),x.extendArray(T.pdata,e)),this},logs:function(e){return V.isValidLogdata(e)&&(T.logdata!==Object(T.logdata)&&(T.logdata={}),x.extendObject(T.logdata,e)),this},customQueryParams:function(e){return V.isEmptyObject(e)||x.extendObject(T,e,R.reservedKeys),this},signals:function(e,t){var s,n=e;if(!V.isEmptyObject(n)){if(t&&"string"==typeof t)for(s in n={},e)e.hasOwnProperty(s)&&(n[t+s]=e[s]);x.extendObject(T,n,R.reservedKeys)}return this},declaredId:function(e){return R.declaredId.setDeclaredId(e,"request"),this},result:function(e){return"function"==typeof e&&(T.callback=e),this},afterResult:function(e){return"function"==typeof e&&(T.postCallbackFn=e),this},useImageRequest:function(){return T.useImageRequest=!0,this},clearData:function(){return T={},this},submit:function(e){return T.isDefaultRequest=!!e,M.submitRequest(T),T={},this},getPartner:function(){return I},getContainerNSID:function(){return r},getEventLog:function(){return S},getState:function(){var e={},t={};return x.extendObject(e,R,{registerRequest:!0}),x.extendObject(t,k,{requestToProcess:!0,process:!0,sendMessages:!0}),{initConfig:s,pendingRequest:T,otherRequestInfo:e,destinationPublishingInfo:t,log:S}},idSync:function(){throw new Error("Please use the `idSyncByURL` method of the Experience Cloud ID Service (Visitor) instance")},aamIdSync:function(){throw new Error("Please use the `idSyncByDataSource` method of the Experience Cloud ID Service (Visitor) instance")},passData:function(e){return V.isEmptyObject(e)?"Error: json is empty or not an object":(M.defaultCallback(e),e)},getPlatformParams:function(){return R.platformParams},getEventCallConfigParams:function(){var e,t=R,s=t.modStatsParams,n=t.platformParams;if(!s){for(e in s={},n)n.hasOwnProperty(e)&&!t.nonModStatsParams[e]&&(s[e.replace(/^d_/,"")]=n[e]);!0===d?s.coop_safe=1:!1===d&&(s.coop_unsafe=1),t.modStatsParams=s}return s},setAsCoopSafe:function(){return d=!0,this},setAsCoopUnsafe:function(){return d=!1,this},getEventCallIabSignals:function(e){var t;return e!==Object(e)?"Error: config is not an object":"function"!=typeof e.callback?"Error: config.callback is not a function":(t=parseInt(e.timeout,10),isNaN(t)&&(t=null),void G.getQueryStringObject(e.callback,t))}},M={corsMetadata:(E="none","undefined"!=typeof XMLHttpRequest&&XMLHttpRequest===Object(XMLHttpRequest)&&"withCredentials"in new XMLHttpRequest&&(E="XMLHttpRequest"),{corsType:E}),getCORSInstance:function(){return"none"===this.corsMetadata.corsType?null:new window[this.corsMetadata.corsType]},submitRequest:function(e){return R.registerRequest(M.createQueuedRequest(e)),!0},createQueuedRequest:function(e){var t,s,n,i,r,a=e.callback,o="img",d=e.isDefaultRequest;if(delete e.isDefaultRequest,!V.isEmptyObject(u))for(n in u)if(u.hasOwnProperty(n)){if(null==(i=u[n])||""===i)continue;if(n in e&&!(i in e)&&!(i in R.reservedKeys)){if(null==(r=e[n])||""===r)continue;e[i]=r}}return V.isValidPdata(e.sids)||(e.sids=[]),V.isValidPdata(e.pdata)||(e.pdata=[]),V.isValidLogdata(e.logdata)||(e.logdata={}),e.logdataArray=x.convertObjectToKeyValuePairs(e.logdata,"=",!0),e.logdataArray.push("_ts="+(new Date).getTime()),"function"!=typeof a&&(a=this.defaultCallback),t=this.makeRequestSrcData(e),(s=this.getCORSInstance())&&!0!==e.useImageRequest&&(o="cors"),{tag:o,src:t.src,corsSrc:t.corsSrc,callbackFn:a,postCallbackFn:e.postCallbackFn,useImageRequest:!!e.useImageRequest,requestData:e,corsInstance:s,corsPostData:t.corsPostData,isDefaultRequest:d}},defaultCallback:function(e,t){var s,n,i,r,a,o,d,u,c;if(g&&(s=e.stuff)&&s instanceof Array&&(n=s.length))for(i=0;i<n;i++)(r=s[i])&&r===Object(r)&&(a=r.cn,o=r.cv,void 0!==(d=r.ttl)&&""!==d||(d=Math.floor(x.getMaxCookieExpiresInMinutes()/60/24)),u=r.dmn||"."+document.domain.replace(/^www\./,""),c=r.type,a&&(o||"number"==typeof o)&&("var"!==c&&(d=parseInt(d,10))&&!isNaN(d)&&x.setCookie(a,o,24*d*60,"/",u,!1),P.stuffed[a]=o));var l,h,f=e.uuid;V.isPopulatedString(f)&&(V.isEmptyObject(p)||("string"==typeof(l=p.path)&&l.length||(l="/"),h=parseInt(p.days,10),isNaN(h)&&(h=100),x.setCookie(p.name||"aam_did",f,24*h*60,l,p.domain||"."+document.domain.replace(/^www\./,""),!0===p.secure))),R.abortRequests||k.requestToProcess(e,t)},makeRequestSrcData:function(r){r.sids=V.removeEmptyArrayValues(r.sids||[]),r.pdata=V.removeEmptyArrayValues(r.pdata||[]);var a=R,e=a.platformParams,t=x.encodeAndBuildRequest(r.sids,","),s=x.encodeAndBuildRequest(r.pdata,","),n=(r.logdataArray||[]).join("&");delete r.logdataArray;var i,o,d=encodeURIComponent,u=A.IS_HTTPS?"https://":"http://",c=a.declaredId.getDeclaredIdQueryString(),l=a.adms.instance?a.adms.getCustomerIDsQueryString(a.adms.getCustomerIDs()):"",h=function(){var e,t,s,n,i=[];for(e in r)if(!(e in a.reservedKeys)&&r.hasOwnProperty(e))if(t=r[e],e=d(e),t instanceof Array)for(s=0,n=t.length;s<n;s++)i.push(e+"="+d(t[s]));else i.push(e+"="+d(t));return i.length?"&"+i.join("&"):""}(),f="d_dil_ver="+d(DIL.version),p="d_nsid="+e.d_nsid+a.getCoopQueryString()+c+l+(t.length?"&d_sid="+t:"")+(s.length?"&d_px="+s:"")+(n.length?"&d_ld="+d(n):""),g="&d_rtbd="+e.d_rtbd+"&d_jsonv="+e.d_jsonv+"&d_dst="+e.d_dst,m=y?"&h_referer="+d(location.href):"";return o=(i=u+I+".demdex.net/event")+"?"+f+"&"+p+g+h+m,{corsSrc:i+"?"+f+"&_ts="+(new Date).getTime(),src:o,corsPostData:p+g+h+m,isDeclaredIdCall:""!==c}},fireRequest:function(e){if("img"===e.tag)this.fireImage(e);else{var t=R.declaredId,s=t.declaredId.request||t.declaredId.init||{},n={dpid:s.dpid||"",dpuuid:s.dpuuid||""};this.fireCORS(e,n)}},fireImage:function(t){var e,s,n=R;n.abortRequests||(n.firing=!0,e=new Image(0,0),n.sent.push(t),e.onload=function(){n.firing=!1,n.fired.push(t),n.num_of_img_responses++,n.registerRequest()},s=function(e){c="imgAbortOrErrorHandler received the event of type "+e.type,L.log(c),n.abortRequests=!0,n.firing=!1,n.errored.push(t),n.num_of_img_errors++,n.registerRequest()},e.addEventListener("error",s),e.addEventListener("abort",s),e.src=t.src)},fireCORS:function(n,i){var r=this,a=R,e=this.corsMetadata.corsType,t=n.corsSrc,s=n.corsInstance,o=n.corsPostData,d=n.postCallbackFn,u="function"==typeof d;if(!a.abortRequests&&!v){a.firing=!0;try{s.open("post",t,!0),"XMLHttpRequest"===e&&(s.withCredentials=!0,s.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),s.onreadystatechange=function(){4===this.readyState&&200===this.status&&function(e){var t;try{if((t=JSON.parse(e))!==Object(t))return r.handleCORSError(n,i,"Response is not JSON")}catch(e){return r.handleCORSError(n,i,"Error parsing response as JSON")}try{var s=n.callbackFn;a.firing=!1,a.fired.push(n),a.num_of_cors_responses++,s(t,i),u&&d(t,i)}catch(e){e.message="DIL handleCORSResponse caught error with message "+e.message,c=e.message,L.log(c),e.filename=e.filename||"dil.js",e.partner=I,DIL.errorModule.handleError(e);try{s({error:e.name+"|"+e.message},i),u&&d({error:e.name+"|"+e.message},i)}catch(e){}}finally{a.registerRequest()}}(this.responseText)}),s.onerror=function(){r.handleCORSError(n,i,"onerror")},s.ontimeout=function(){r.handleCORSError(n,i,"ontimeout")},s.send(o)}catch(e){this.handleCORSError(n,i,"try-catch")}a.sent.push(n),a.declaredId.declaredId.request=null}},handleCORSError:function(e,t,s){R.num_of_cors_errors++,R.corsErrorSources.push(s)}},V={isValidPdata:function(e){return!!(e instanceof Array&&this.removeEmptyArrayValues(e).length)},isValidLogdata:function(e){return!this.isEmptyObject(e)},isEmptyObject:function(e){if(e!==Object(e))return!0;var t;for(t in e)if(e.hasOwnProperty(t))return!1;return!0},removeEmptyArrayValues:function(e){var t,s=0,n=e.length,i=[];for(s=0;s<n;s++)null!=(t=e[s])&&""!==t&&i.push(t);return i},isPopulatedString:function(e){return"string"==typeof e&&e.length}},x={convertObjectToKeyValuePairs:function(e,t,s){var n,i,r=[];for(n in t=t||"=",e)e.hasOwnProperty(n)&&null!=(i=e[n])&&""!==i&&r.push(n+t+(s?encodeURIComponent(i):i));return r},encodeAndBuildRequest:function(e,t){return e.map(function(e){return encodeURIComponent(e)}).join(t)},getCookie:function(e){var t,s,n,i=e+"=",r=document.cookie.split(";");for(t=0,s=r.length;t<s;t++){for(n=r[t];" "===n.charAt(0);)n=n.substring(1,n.length);if(0===n.indexOf(i))return decodeURIComponent(n.substring(i.length,n.length))}return null},setCookie:function(e,t,s,n,i,r){var a=new Date;s=s&&1e3*s*60,document.cookie=e+"="+encodeURIComponent(t)+(s?";expires="+new Date(a.getTime()+s).toUTCString():"")+(n?";path="+n:"")+(i?";domain="+i:"")+(r?";secure":"")},extendArray:function(e,t){return e instanceof Array&&t instanceof Array&&(Array.prototype.push.apply(e,t),!0)},extendObject:function(e,t,s){var n;if(e!==Object(e)||t!==Object(t))return!1;for(n in t)if(t.hasOwnProperty(n)){if(!V.isEmptyObject(s)&&n in s)continue;e[n]=t[n]}return!0},getMaxCookieExpiresInMinutes:function(){return A.SIX_MONTHS_IN_MINUTES},replaceMethodsWithFunction:function(e,t){var s;if(e===Object(e)&&"function"==typeof t)for(s in e)e.hasOwnProperty(s)&&"function"==typeof e[s]&&(e[s]=t)}},N=(j=_.requestController,{exists:null,instance:null,aamIsApproved:null,init:function(){var e=this;this.checkIfExists()?(this.exists=!0,this.instance=window.adobe.optIn,this.instance.fetchPermissions(function(){e.callback()},!0)):this.exists=!1},checkIfExists:function(){return window.adobe===Object(window.adobe)&&window.adobe.optIn===Object(window.adobe.optIn)},callback:function(){this.aamIsApproved=this.instance.isApproved([this.instance.Categories.AAM]),j.adms.waitForMidToReleaseRequests(),j.adms.getIsOptedOut()},isApproved:function(){return!this.isIabContext()&&!j.adms.isOptedOut&&(!this.exists||this.aamIsApproved)},isIabContext:function(){return this.instance&&this.instance.isIabContext}});_.optIn=N;var U,F,Q,H,G=(F=(U=_).requestController,Q=U.optIn,H={isVendorConsented:null,doesGdprApply:null,consentString:null,queryStringObjectCallbacks:[],init:function(){this.fetchConsentData()},hasGoSignal:function(){return!(!(Q.isIabContext()&&this.isVendorConsented&&this.doesGdprApply&&"string"==typeof this.consentString&&this.consentString.length)||F.adms.isOptedOut)},fetchConsentData:function(s,e){var n=this,t={};"function"!=typeof s&&(s=function(){}),Q.instance&&Q.isIabContext()?(e&&(t.timeout=e),Q.instance.execute({command:"iabPlugin.fetchConsentData",params:t,callback:function(e,t){t===Object(t)?(n.doesGdprApply=!!t.gdprApplies,n.consentString=t.consentString||""):(n.doesGdprApply=!1,n.consentString=""),n.isVendorConsented=Q.instance.isApproved(Q.instance.Categories.AAM),e?s({}):n.checkQueryStringObject(s),F.adms.waitForMidToReleaseRequests()}})):s({})},getQueryString:function(){return Q.isIabContext()?"gdpr="+(this.doesGdprApply?1:0)+"&gdpr_consent="+this.consentString+"&":""},getQueryStringObject:function(e,t){this.fetchConsentData(e,t)},checkQueryStringObject:function(e){H.hasGoSignal()&&"function"==typeof e&&e({gdpr:this.doesGdprApply?1:0,gdpr_consent:this.consentString})}});_.iab=G,"error"===I&&0===r&&window.addEventListener("load",function(){DIL.windowLoaded=!0});function B(){W||(W=!0,R.registerRequest(),K())}var W=!1,K=function(){setTimeout(function(){f||R.firstRequestHasFired||("function"==typeof m?q.afterResult(m).submit(!0):q.submit(!0))},DIL.constants.TIME_TO_DEFAULT_REQUEST)},X=document;"error"!==I&&(DIL.windowLoaded?B():"complete"!==X.readyState&&"loaded"!==X.readyState?window.addEventListener("load",function(){DIL.windowLoaded=!0,B()}):(DIL.windowLoaded=!0,B())),R.declaredId.setDeclaredId(n,"init"),N.init(),G.init(),R.processVisitorAPI();A.IS_IE_LESS_THAN_10&&x.replaceMethodsWithFunction(q,function(){return this}),this.api=q,this.getStuffedVariable=function(e){var t=P.stuffed[e];return t||"number"==typeof t||(t=x.getCookie(e))||"number"==typeof t||(t=""),t},this.validators=V,this.helpers=x,this.constants=A,this.log=S,this.pendingRequest=T,this.requestController=R,this.destinationPublishing=k,this.requestProcs=M,this.units=_,this.initConfig=s,this.logger=L,C&&(this.variables=P,this.callWindowLoadFunctions=B)},DIL.extendStaticPropertiesAndMethods=function(e){var t;if(e===Object(e))for(t in e)e.hasOwnProperty(t)&&(this[t]=e[t])},DIL.extendStaticPropertiesAndMethods({version:"9.4",jsonVersion:1,constants:{TIME_TO_DEFAULT_REQUEST:500},variables:{scriptNodeList:document.getElementsByTagName("script")},windowLoaded:!1,dils:{},isAddedPostWindowLoad:function(){var e=arguments[0];this.windowLoaded="function"==typeof e?!!e():"boolean"!=typeof e||e},create:function(e){try{return new DIL(e)}catch(e){throw new Error("Error in attempt to create DIL instance with DIL.create(): "+e.message)}},registerDil:function(e,t,s){var n=t+"$"+s;n in this.dils||(this.dils[n]=e)},getDil:function(e,t){var s;return"string"!=typeof e&&(e=""),(s=e+"$"+(t=t||0))in this.dils?this.dils[s]:new Error("The DIL instance with partner = "+e+" and containerNSID = "+t+" was not found")},dexGetQSVars:function(e,t,s){var n=this.getDil(t,s);return n instanceof this?n.getStuffedVariable(e):""}}),DIL.errorModule=(r=DIL.create({partner:"error",containerNSID:0,ignoreHardDependencyOnVisitorAPI:!0}),o=!(a={harvestererror:14138,destpuberror:14139,dpmerror:14140,generalerror:14137,error:14137,noerrortypedefined:15021,evalerror:15016,rangeerror:15017,referenceerror:15018,typeerror:15019,urierror:15020}),{activate:function(){o=!0},handleError:function(e){if(!o)return"DIL error module has not been activated";e!==Object(e)&&(e={});var t=e.name?(e.name+"").toLowerCase():"",s=t in a?a[t]:a.noerrortypedefined,n=[],i={name:t,filename:e.filename?e.filename+"":"",partner:e.partner?e.partner+"":"no_partner",site:e.site?e.site+"":document.location.href,message:e.message?e.message+"":""};return n.push(s),r.api.pixels(n).logs(i).useImageRequest().submit(),"DIL error report sent"},pixelMap:a}),DIL.tools={},DIL.modules={helpers:{}}),window.DIL&&DIL.tools&&DIL.modules&&(DIL.tools.getMetaTags=function(){var e,t,s,n,i,r={},a=document.getElementsByTagName("meta");for(e=0,s=arguments.length;e<s;e++)if(null!==(n=arguments[e]))for(t=0;t<a.length;t++)if((i=a[t]).name===n){r[n]=i.content;break}return r},DIL.tools.decomposeURI=function(e){var s,t=document.createElement("a");return t.href=e||document.referrer,{hash:t.hash,host:t.host.split(":").shift(),hostname:t.hostname,href:t.href,pathname:t.pathname.replace(/^\//,""),protocol:t.protocol,search:t.search,uriParams:(s={},t.search.replace(/^(\/|\?)?|\/$/g,"").split("&").map(function(e){var t=e.split("=");s[t.shift()]=t.shift()}),s)}},DIL.tools.getSearchReferrer=function(e,t){var s=DIL.getDil("error"),n=DIL.tools.decomposeURI(e||document.referrer),i="",r="",a={DEFAULT:{queryParam:"q"},SEARCH_ENGINES:[t===Object(t)?t:{},{hostPattern:/aol\./},{hostPattern:/ask\./},{hostPattern:/bing\./},{hostPattern:/google\./},{hostPattern:/yahoo\./,queryParam:"p"}]},o=a.DEFAULT;return(i=a.SEARCH_ENGINES.filter(function(e){return!(!e.hasOwnProperty("hostPattern")||!n.hostname.match(e.hostPattern))}).shift())?{valid:!0,name:n.hostname,keywords:(s.helpers.extendObject(o,i),i=(""+n.search).match(o.queryPattern),r=o.queryPattern?i?i[1]:"":n.uriParams[o.queryParam],decodeURIComponent(r||"").replace(/\+|%20/g," "))}:{valid:!1,name:"",keywords:""}},DIL.modules.GA=t,DIL.modules.siteCatalyst=s,DIL.modules.helpers.handleModuleError=e)}();

          }

        }
      },
      "settings": {
        "note": "",
        "pathExclusions": [

        ],
        "useSiteCatalyst": false,
        "dilInitConfigData": {
          "parsedData": {
            "partner": "unifiedjslab",
            "visitorService": {
              "namespace": "97D1F3F459CE0AD80A495CBE@AdobeOrg"
            },
            "secureDataCollection": false
          },
          "componentData": {
            "partner": {
              "name": "partner",
              "type": "string",
              "value": "unifiedjslab",
              "tooltip": "Enter a string or select a data element.",
              "errorMsg": "Cannot be blank.",
              "isRequired": true,
              "description": "Partner name as provided by Audience Manager. If this field is not autopopulated, then your org ID is probably not provisioned with Audience Manager.",
              "isValueDisabled": false
            },
            "visitorService": {
              "name": "visitorService",
              "type": "fixedObject",
              "value": "",
              "tooltip": "Use the subproperties or select a data element.",
              "errorMsg": "Select data element.",
              "isRequired": true,
              "description": "Allows DIL to hook into the Visitor ID Service. DIL relies on the setCustomerIDs function in the Visitor ID Service to pass declared IDs into Audience Manager. See <a target=\"_blank\" href=\"https://marketing.adobe.com/resources/help/en_US/mcvid/mcvid-authenticated-state.html\">Customer IDs and Authentication States</a> for more information.",
              "isValueDisabled": true,
              "useSubproperties": true,
              "subRowControllerData": {
                "title": "Subproperties for visitorService Object",
                "rowTitle": "Subproperty",
                "savedData": {
                  "parsedData": {
                    "namespace": "97D1F3F459CE0AD80A495CBE@AdobeOrg"
                  },
                  "componentData": {
                    "namespace": {
                      "name": "namespace",
                      "type": "string",
                      "value": "97D1F3F459CE0AD80A495CBE@AdobeOrg",
                      "tooltip": "Enter a string or select a data element.",
                      "errorMsg": "Cannot be blank.",
                      "isRequired": true,
                      "description": "Your company's Marketing Cloud Org ID. Should be autopopulated.",
                      "isValueDisabled": false
                    }
                  }
                },
                "configData": {
                  "namespace": {
                    "type": "string",
                    "value": "97D1F3F459CE0AD80A495CBE@AdobeOrg",
                    "isRequired": true,
                    "description": "Your company's Marketing Cloud Org ID. Should be autopopulated."
                  }
                },
                "tooltipText": "Add a new subproperty",
                "includeCheckData": false,
                "isFreeObjectController": false
              }
            },
            "secureDataCollection": {
              "name": "secureDataCollection",
              "type": "boolean",
              "value": false,
              "tooltip": "Use the radio buttons.",
              "errorMsg": "Select data element.",
              "isRequired": true,
              "description": "DIL calls are made over https by default (including the destination publishing iframe). This is what is meant by \"secure data collection.\" The flag secureDataCollection is optional and is true by default. If set to false, DIL will follow the page protocol.<br><br>The Visitor ID Service still follows the page protocol. When this is http, the destination publishing iframe is loaded over http. This causes an origin conflict (a JavaScript error) with DIL, which has the destination publishing iframe on https. Id syncs are still fired, but url destinations are not.<br><br>Until the Visitor ID Service is https by default, the workaround is to set DIL's secureDataCollection to false when both the Visitor ID Service and DIL are on the page.",
              "isValueDisabled": true,
              "chooseDataElement": false
            }
          }
        },
        "siteCatalystConfig": function() {
  var siteCatalystModuleConfiguration = {
    names: ["pageName", "channel", "campaign", "products", "events", "pe", "referrer", "server", "purchaseID", "zip", "state"],
    iteratedNames: [{
        name: "eVar",
        maxIndex: 125 /* 250 if Analytics premium is enabled */
    }, {
        name: "prop",
        maxIndex: 75
    }, {
        name: "pev",
        maxIndex: 3
    }, {
        name: "hier",
        maxIndex: 4
    }]
};

return siteCatalystModuleConfiguration;
},
        "useGoogleAnalytics": false,
        "googleAnalyticsData": {
          "parsedData": {
            "variableNameForGoogleAnalytics": "ga"
          },
          "componentData": {
            "variableNameForGoogleAnalytics": {
              "name": "variableNameForGoogleAnalytics",
              "type": "string",
              "value": "ga",
              "tooltip": "Enter a string or select a data element.",
              "errorMsg": "Cannot be blank.",
              "isRequired": true,
              "description": "",
              "isValueDisabled": false
            }
          }
        }
      },
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/4bbb6b9dc376/15a347b44599/hostedLibFiles/EP4e83caf1f501401c8757a221425cd7c8/"
    },
    "adobe-mcid": {
      "displayName": "Experience Cloud ID Service",
      "modules": {
        "adobe-mcid/src/lib/sharedModules/mcidInstance.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';
var document = require('@adobe/reactor-document');
var VisitorAPI = require('../codeLibrary/VisitorAPI');
var timeUnits = require('../../view/utils/timeUnits');

var transformArrayToObject = function(configs) {
  var initConfig = configs.reduce(function(obj, config) {
    var value = /^(true|false)$/i.test(config.value) ? JSON.parse(config.value) : config.value;

    obj[config.name] = value;

    return obj;
  }, {});

  return initConfig;
};

var initializeVisitorId = function(Visitor) {
  var extensionSettings = turbine.getExtensionSettings();
  if (typeof extensionSettings.orgId !== 'string') {
    throw new TypeError('Org ID is not a string.');
  }

  var initConfig = transformArrayToObject(extensionSettings.variables || []);
  var doesOptInApply = extensionSettings.doesOptInApply;
  if (doesOptInApply) {
    if (typeof doesOptInApply === 'boolean') {
      initConfig['doesOptInApply'] = doesOptInApply; 
    } else if (extensionSettings.optInCallback) {
      initConfig['doesOptInApply'] = extensionSettings.optInCallback; 
    }
  }

  var isOptInStorageEnabled = extensionSettings.isOptInStorageEnabled;
  if (isOptInStorageEnabled) {
    initConfig['isOptInStorageEnabled'] = isOptInStorageEnabled;
  }

  var optInCookieDomain = extensionSettings.optInCookieDomain;
  if (optInCookieDomain) {
    initConfig['optInCookieDomain'] = optInCookieDomain;
  }

  var optInStorageExpiry = extensionSettings.optInStorageExpiry;
  if (optInStorageExpiry) {
    var timeUnit = extensionSettings.timeUnit;
    if (timeUnit && timeUnits[timeUnit]) {
      var seconds = optInStorageExpiry * timeUnits[timeUnit];
      initConfig['optInStorageExpiry'] = seconds;
    }
  } else if (isOptInStorageEnabled === true) {
    // default is 13 months
    initConfig['optInStorageExpiry'] = 13 * 30 * 24 * 3600;
  }

  var previousPermissions = extensionSettings.previousPermissions;
  if (previousPermissions) {
    initConfig['previousPermissions'] = previousPermissions;
  }

  var preOptInApprovals = extensionSettings.preOptInApprovals;
  if (preOptInApprovals) {
    initConfig['preOptInApprovals'] = preOptInApprovals;
  } else {
    var preOptInApprovalInput = extensionSettings.preOptInApprovalInput;
    if (preOptInApprovalInput) {
      initConfig['preOptInApprovals'] = preOptInApprovalInput;
    }
  }

  var isIabContext = extensionSettings.isIabContext;
  if (isIabContext) {
    initConfig['isIabContext'] = isIabContext;
  }

  var instance = Visitor.getInstance(extensionSettings.orgId, initConfig);

  turbine.logger.info('Created instance using orgId: "' + extensionSettings.orgId + '"');
  turbine.logger.info('Set variables: ' + JSON.stringify(initConfig));

  // getMarketingCloudVisitorID is called automatically when the instance is created, but
  // we call it here so that we can log the ID once it has been retrieved from the server.
  // Calling getMarketingCloudVisitorID multiple times will not result in multiple requests
  // to the server.
  instance.getMarketingCloudVisitorID(function(id) {
    turbine.logger.info('Obtained Marketing Cloud Visitor Id: ' + id);
  }, true);

  return instance;
};

var excludePathsMatched = function(path) {
  var extensionSettings = turbine.getExtensionSettings();
  var pathExclusions = extensionSettings.pathExclusions || [];

  return pathExclusions.some(function(pathExclusion) {
    if (pathExclusion.valueIsRegex) {
      return new RegExp(pathExclusion.value, 'i').test(path);
    } else {
      return pathExclusion.value === path;
    }
  });
};

var visitorIdInstance = null;

// Overwrite the getVisitorId exposed in Turbine. This is largely for backward compatibility
// since DTM supported this method on _satellite.
_satellite.getVisitorId = function() { return visitorIdInstance; };

if (excludePathsMatched(document.location.pathname)) {
  turbine.logger.warn('MCID library not loaded. One of the path exclusions matches the ' +
    'current path.');
} else {
  visitorIdInstance = initializeVisitorId(VisitorAPI);
}

module.exports = visitorIdInstance;

          }
,
          "name": "mcid-instance",
          "shared": true
        },
        "adobe-mcid/src/lib/codeLibrary/VisitorAPI.js": {
          "script": function(module, exports, require, turbine) {
/* istanbul ignore next */
module.exports = function() {
var e=function(){"use strict";function e(t){"@babel/helpers - typeof";return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function n(){return{callbacks:{},add:function(e,t){this.callbacks[e]=this.callbacks[e]||[];var n=this.callbacks[e].push(t)-1,i=this;return function(){i.callbacks[e].splice(n,1)}},execute:function(e,t){if(this.callbacks[e]){t=void 0===t?[]:t,t=t instanceof Array?t:[t];try{for(;this.callbacks[e].length;){var n=this.callbacks[e].shift();"function"==typeof n?n.apply(null,t):n instanceof Array&&n[1].apply(n[0],t)}delete this.callbacks[e]}catch(e){}}},executeAll:function(e,t){(t||e&&!V.isObjectEmpty(e))&&Object.keys(this.callbacks).forEach(function(t){var n=void 0!==e[t]?e[t]:"";this.execute(t,n)},this)},hasCallbacks:function(){return Boolean(Object.keys(this.callbacks).length)}}}function i(e,t,n){var i=null==e?void 0:e[t];return void 0===i?n:i}function r(e){for(var t=/^\d+$/,n=0,i=e.length;n<i;n++)if(!t.test(e[n]))return!1;return!0}function a(e,t){for(;e.length<t.length;)e.push("0");for(;t.length<e.length;)t.push("0")}function o(e,t){for(var n=0;n<e.length;n++){var i=parseInt(e[n],10),r=parseInt(t[n],10);if(i>r)return 1;if(r>i)return-1}return 0}function s(e,t){if(e===t)return 0;var n=e.toString().split("."),i=t.toString().split(".");return r(n.concat(i))?(a(n,i),o(n,i)):NaN}function c(e){return e===Object(e)&&0===Object.keys(e).length}function u(e){return"function"==typeof e||e instanceof Array&&e.length}function l(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){return!0};this.log=Ie("log",e,t),this.warn=Ie("warn",e,t),this.error=Ie("error",e,t)}function d(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.cookieName,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=n.cookies;if(!t||!i)return{get:we,set:we,remove:we};var r={remove:function(){i.remove(t)},get:function(){var e=i.get(t),n={};try{n=JSON.parse(e)}catch(e){n={}}return n},set:function(e,n){n=n||{};var a=r.get(),o=Object.assign(a,e);i.set(t,JSON.stringify(o),{domain:n.optInCookieDomain||"",cookieLifetime:n.optInStorageExpiry||3419e4,expires:!0})}};return r}function f(e){this.name=this.constructor.name,this.message=e,"function"==typeof Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error(e).stack}function p(){function e(e,t){var n=Ae(e);return n.length?n.every(function(e){return!!t[e]}):be(t)}function t(){M(b),O(le.COMPLETE),_(h.status,h.permissions),s&&m.set(h.permissions,{optInCookieDomain:c,optInStorageExpiry:u}),C.execute(He)}function n(e){return function(n,i){if(!Oe(n))throw new Error("[OptIn] Invalid category(-ies). Please use the `OptIn.Categories` enum.");return O(le.CHANGED),Object.assign(b,Me(Ae(n),e)),i||t(),h}}var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=i.doesOptInApply,a=i.previousPermissions,o=i.preOptInApprovals,s=i.isOptInStorageEnabled,c=i.optInCookieDomain,u=i.optInStorageExpiry,l=i.isIabContext,f=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},p=f.cookies,g=Fe(a);Ne(g,"Invalid `previousPermissions`!"),Ne(o,"Invalid `preOptInApprovals`!");var m=d({cookieName:"adobeujs-optin"},{cookies:p}),h=this,_=ue(h),C=he(),I=Te(g),S=Te(o),v=s?m.get():{},D={},y=function(e,t){return Pe(e)||t&&Pe(t)?le.COMPLETE:le.PENDING}(I,v),A=function(e,t,n){var i=Me(me,!r);return r?Object.assign({},i,e,t,n):i}(S,I,v),b=ke(A),O=function(e){return y=e},M=function(e){return A=e};h.deny=n(!1),h.approve=n(!0),h.denyAll=h.deny.bind(h,me),h.approveAll=h.approve.bind(h,me),h.isApproved=function(t){return e(t,h.permissions)},h.isPreApproved=function(t){return e(t,S)},h.fetchPermissions=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=t?h.on(le.COMPLETE,e):we;return!r||r&&h.isComplete||!!o?e(h.permissions):t||C.add(He,function(){return e(h.permissions)}),n},h.complete=function(){h.status===le.CHANGED&&t()},h.registerPlugin=function(e){if(!e||!e.name||"function"!=typeof e.onRegister)throw new Error(Ue);D[e.name]||(D[e.name]=e,e.onRegister.call(e,h))},h.execute=Ve(D),h.memoizeContent=function(e){Re(e)&&m.set(e,{optInCookieDomain:c,optInStorageExpiry:u})},h.getMemoizedContent=function(e){var t=m.get();if(t)return t[e]},Object.defineProperties(h,{permissions:{get:function(){return A}},status:{get:function(){return y}},Categories:{get:function(){return de}},doesOptInApply:{get:function(){return!!r}},isPending:{get:function(){return h.status===le.PENDING}},isComplete:{get:function(){return h.status===le.COMPLETE}},__plugins:{get:function(){return Object.keys(D)}},isIabContext:{get:function(){return l}}})}function g(e,t){function n(){r=null,e.call(e,new f("The call took longer than you wanted!"))}function i(){r&&(clearTimeout(r),e.apply(e,arguments))}if(void 0===t)return e;var r=setTimeout(n,t);return i}function m(){if(window.__tcfapi)return window.__tcfapi;var e=window;if(e===window.top)return void De.error("__tcfapi not found");for(var t;!t;){e=e.parent;try{e.frames.__tcfapiLocator&&(t=e)}catch(e){}if(e===window.top)break}if(!t)return void De.error("__tcfapi not found");var n={};return window.__tcfapi=function(e,i,r,a){var o=Math.random()+"",s={__tcfapiCall:{command:e,parameter:a,version:i,callId:o}};n[o]=r,t.postMessage(s,"*")},window.addEventListener("message",function(e){var t=e.data;if("string"==typeof t)try{t=JSON.parse(e.data)}catch(e){}if(t.__tcfapiReturn){var i=t.__tcfapiReturn;"function"==typeof n[i.callId]&&(n[i.callId](i.returnValue,i.success),delete n[i.callId])}},!1),window.__tcfapi}function h(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=!0===e.vendor.consents[t],r=n.every(function(t){return!0===e.purpose.consents[t]});return i&&r}function _(){var e=this;e.name="iabPlugin",e.version="0.0.2";var t,n=he(),i={transparencyAndConsentData:null},r=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return i[e]=t};e.fetchConsentData=function(e){var t=e.callback,n=e.timeout,i=g(t,n);a({callback:i})},e.isApproved=function(e){var t=e.callback,n=e.category,r=e.timeout;if(i.transparencyAndConsentData)return t(null,h(i.transparencyAndConsentData,fe[n],pe[n]));var o=g(function(e,i){t(e,h(i,fe[n],pe[n]))},r);a({category:n,callback:o})},e.onRegister=function(n){t=n;var i=Object.keys(fe),r=function(e,t){!e&&t&&(i.forEach(function(e){var i=h(t,fe[e],pe[e]);n[i?"approve":"deny"](e,!0)}),n.complete())};e.fetchConsentData({callback:r})};var a=function(e){var a=e.callback;if(i.transparencyAndConsentData)return a(null,i.transparencyAndConsentData);n.add("FETCH_CONSENT_DATA",a),o(function(e,a){if(a){var o=ke(e),s=t.getMemoizedContent("iabConsentHash"),c=ve(o.tcString).toString(32);o.consentString=e.tcString,o.hasConsentChangedSinceLastCmpPull=s!==c,r("transparencyAndConsentData",o),t.memoizeContent({iabConsentHash:c})}n.execute("FETCH_CONSENT_DATA",[null,i.transparencyAndConsentData])})},o=function(e){var t=je(fe),n=m();"function"==typeof n&&n("getTCData",2,e,t)}}var C="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};Object.assign=Object.assign||function(e){for(var t,n,i=1;i<arguments.length;++i){n=arguments[i];for(t in n)Object.prototype.hasOwnProperty.call(n,t)&&(e[t]=n[t])}return e};var I,S,v={HANDSHAKE:"HANDSHAKE",GETSTATE:"GETSTATE",PARENTSTATE:"PARENTSTATE"},D={MCMID:"MCMID",MCAID:"MCAID",MCAAMB:"MCAAMB",MCAAMLH:"MCAAMLH",MCOPTOUT:"MCOPTOUT",CUSTOMERIDS:"CUSTOMERIDS"},y={MCMID:"getMarketingCloudVisitorID",MCAID:"getAnalyticsVisitorID",MCAAMB:"getAudienceManagerBlob",MCAAMLH:"getAudienceManagerLocationHint",MCOPTOUT:"isOptedOut",ALLFIELDS:"getVisitorValues"},A={CUSTOMERIDS:"getCustomerIDs"},b={MCMID:"getMarketingCloudVisitorID",MCAAMB:"getAudienceManagerBlob",MCAAMLH:"getAudienceManagerLocationHint",MCOPTOUT:"isOptedOut",MCAID:"getAnalyticsVisitorID",CUSTOMERIDS:"getCustomerIDs",ALLFIELDS:"getVisitorValues"},O={MC:"MCMID",A:"MCAID",AAM:"MCAAMB"},M={MCMID:"MCMID",MCOPTOUT:"MCOPTOUT",MCAID:"MCAID",MCAAMLH:"MCAAMLH",MCAAMB:"MCAAMB"},k={UNKNOWN:0,AUTHENTICATED:1,LOGGED_OUT:2},E={GLOBAL:"global"},T={MESSAGES:v,STATE_KEYS_MAP:D,ASYNC_API_MAP:y,SYNC_API_MAP:A,ALL_APIS:b,FIELDGROUP_TO_FIELD:O,FIELDS:M,AUTH_STATE:k,OPT_OUT:E},P=T.STATE_KEYS_MAP,L=function(e){function t(){}function n(t,n){var i=this;return function(){var r=e(0,t),a={};return a[t]=r,i.setStateAndPublish(a),n(r),r}}this.getMarketingCloudVisitorID=function(e){e=e||t;var i=this.findField(P.MCMID,e),r=n.call(this,P.MCMID,e);return void 0!==i?i:r()},this.getVisitorValues=function(e){this.getMarketingCloudVisitorID(function(t){e({MCMID:t})})}},R=T.MESSAGES,w=T.ASYNC_API_MAP,F=T.SYNC_API_MAP,N=function(){function e(){}function t(e,t){var n=this;return function(){return n.callbackRegistry.add(e,t),n.messageParent(R.GETSTATE),""}}function n(n){this[w[n]]=function(i){i=i||e;var r=this.findField(n,i),a=t.call(this,n,i);return void 0!==r?r:a()}}function i(t){this[F[t]]=function(){return this.findField(t,e)||{}}}Object.keys(w).forEach(n,this),Object.keys(F).forEach(i,this)},x=T.ASYNC_API_MAP,j=function(){Object.keys(x).forEach(function(e){this[x[e]]=function(t){this.callbackRegistry.add(e,t)}},this)},V=function(e,t){return t={exports:{}},e(t,t.exports),t.exports}(function(t,n){n.isObjectEmpty=function(e){return e===Object(e)&&0===Object.keys(e).length},n.isValueEmpty=function(e){return""===e||n.isObjectEmpty(e)};var i=function(){var e=navigator.appName,t=navigator.userAgent;return"Microsoft Internet Explorer"===e||t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0&&t.indexOf("Windows NT 6")>=0};n.getIeVersion=function(){return document.documentMode?document.documentMode:i()?7:null},n.encodeAndBuildRequest=function(e,t){return e.map(encodeURIComponent).join(t)},n.isObject=function(t){return null!==t&&"object"===e(t)&&!1===Array.isArray(t)},n.defineGlobalNamespace=function(){return window.adobe=n.isObject(window.adobe)?window.adobe:{},window.adobe},n.pluck=function(e,t){return t.reduce(function(t,n){return e[n]&&(t[n]=e[n]),t},Object.create(null))},n.parseOptOut=function(e,t,n){t||(t=n,e.d_optout&&e.d_optout instanceof Array&&(t=e.d_optout.join(",")));var i=parseInt(e.d_ottl,10);return isNaN(i)&&(i=7200),{optOut:t,d_ottl:i}},n.normalizeBoolean=function(e){var t=e;return"true"===e?t=!0:"false"===e&&(t=!1),t}}),H=(V.isObjectEmpty,V.isValueEmpty,V.getIeVersion,V.encodeAndBuildRequest,V.isObject,V.defineGlobalNamespace,V.pluck,V.parseOptOut,V.normalizeBoolean,n),U=T.MESSAGES,B={0:"prefix",1:"orgID",2:"state"},G=function(e,t){this.parse=function(e){try{var t={};return e.data.split("|").forEach(function(e,n){if(void 0!==e){t[B[n]]=2!==n?e:JSON.parse(e)}}),t}catch(e){}},this.isInvalid=function(n){var i=this.parse(n);if(!i||Object.keys(i).length<2)return!0;var r=e!==i.orgID,a=!t||n.origin!==t,o=-1===Object.keys(U).indexOf(i.prefix);return r||a||o},this.send=function(n,i,r){var a=i+"|"+e;r&&r===Object(r)&&(a+="|"+JSON.stringify(r));try{n.postMessage(a,t)}catch(e){}}},Y=T.MESSAGES,q=function(e,t,n,i){function r(e){Object.assign(p,e)}function a(e){Object.assign(p.state,e),Object.assign(p.state.ALLFIELDS,e),p.callbackRegistry.executeAll(p.state)}function o(e){if(!h.isInvalid(e)){m=!1;var t=h.parse(e);p.setStateAndPublish(t.state)}}function s(e){!m&&g&&(m=!0,h.send(i,e))}function c(){r(new L(n._generateID)),p.getMarketingCloudVisitorID(),p.callbackRegistry.executeAll(p.state,!0),C.removeEventListener("message",u)}function u(e){if(!h.isInvalid(e)){var t=h.parse(e);m=!1,C.clearTimeout(p._handshakeTimeout),C.removeEventListener("message",u),r(new N(p)),C.addEventListener("message",o),p.setStateAndPublish(t.state),p.callbackRegistry.hasCallbacks()&&s(Y.GETSTATE)}}function l(){g&&postMessage?(C.addEventListener("message",u),s(Y.HANDSHAKE),p._handshakeTimeout=setTimeout(c,250)):c()}function d(){C.s_c_in||(C.s_c_il=[],C.s_c_in=0),p._c="Visitor",p._il=C.s_c_il,p._in=C.s_c_in,p._il[p._in]=p,C.s_c_in++}function f(){function e(e){0!==e.indexOf("_")&&"function"==typeof n[e]&&(p[e]=function(){})}Object.keys(n).forEach(e),p.getSupplementalDataID=n.getSupplementalDataID,p.isAllowed=function(){return!0}}var p=this,g=t.whitelistParentDomain;p.state={ALLFIELDS:{}},p.version=n.version,p.marketingCloudOrgID=e,p.cookieDomain=n.cookieDomain||"",p._instanceType="child";var m=!1,h=new G(e,g);p.callbackRegistry=H(),p.init=function(){d(),f(),r(new j(p)),l()},p.findField=function(e,t){if(void 0!==p.state[e])return t(p.state[e]),p.state[e]},p.messageParent=s,p.setStateAndPublish=a},W=T.MESSAGES,X=T.ALL_APIS,K=T.ASYNC_API_MAP,J=T.FIELDGROUP_TO_FIELD,z=function(e,t){function n(){var t={};return Object.keys(X).forEach(function(n){var i=X[n],r=e[i]();V.isValueEmpty(r)||(t[n]=r)}),t}function i(){var t=[];return e._loading&&Object.keys(e._loading).forEach(function(n){if(e._loading[n]){var i=J[n];t.push(i)}}),t.length?t:null}function r(t){return function n(r){var a=i();if(a){var o=K[a[0]];e[o](n,!0)}else t()}}function a(e,i){var r=n();t.send(e,i,r)}function o(e){c(e),a(e,W.HANDSHAKE)}function s(e){r(function(){a(e,W.PARENTSTATE)})()}function c(n){function i(i){r.call(e,i),t.send(n,W.PARENTSTATE,{CUSTOMERIDS:e.getCustomerIDs()})}var r=e.setCustomerIDs;e.setCustomerIDs=i}return function(e){if(!t.isInvalid(e)){(t.parse(e).prefix===W.HANDSHAKE?o:s)(e.source)}}},Q=function(e,t){function n(e){return function(n){i[e]=n,r++,r===a&&t(i)}}var i={},r=0,a=Object.keys(e).length;Object.keys(e).forEach(function(t){var i=e[t];if(i.fn){var r=i.args||[];r.unshift(n(t)),i.fn.apply(i.context||null,r)}})},$={get:function(e){e=encodeURIComponent(e);var t=(";"+document.cookie).split(" ").join(";"),n=t.indexOf(";"+e+"="),i=n<0?n:t.indexOf(";",n+1);return n<0?"":decodeURIComponent(t.substring(n+2+e.length,i<0?t.length:i))},set:function(e,t,n){var r=i(n,"cookieLifetime"),a=i(n,"expires"),o=i(n,"domain"),s=i(n,"secure"),c=s?"Secure":"";if(a&&"SESSION"!==r&&"NONE"!==r){var u=""!==t?parseInt(r||0,10):-60;if(u)a=new Date,a.setTime(a.getTime()+1e3*u);else if(1===a){a=new Date;var l=a.getYear();a.setYear(l+2+(l<1900?1900:0))}}else a=0;return e&&"NONE"!==r?(document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+"; path=/;"+(a?" expires="+a.toGMTString()+";":"")+(o?" domain="+o+";":"")+c,this.get(e)===t):0},remove:function(e,t){var n=i(t,"domain");n=n?" domain="+n+";":"",document.cookie=encodeURIComponent(e)+"=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"+n}},Z=function(e){var t;!e&&C.location&&(e=C.location.hostname),t=e;var n,i=t.split(".");for(n=i.length-2;n>=0;n--)if(t=i.slice(n).join("."),$.set("test","cookie",{domain:t}))return $.remove("test",{domain:t}),t;return""},ee={compare:s,isLessThan:function(e,t){return s(e,t)<0},areVersionsDifferent:function(e,t){return 0!==s(e,t)},isGreaterThan:function(e,t){return s(e,t)>0},isEqual:function(e,t){return 0===s(e,t)}},te=!!C.postMessage,ne={postMessage:function(e,t,n){var i=1;t&&(te?n.postMessage(e,t.replace(/([^:]+:\/\/[^\/]+).*/,"$1")):t&&(n.location=t.replace(/#.*$/,"")+"#"+ +new Date+i+++"&"+e))},receiveMessage:function(e,t){var n;try{te&&(e&&(n=function(n){if("string"==typeof t&&n.origin!==t||"[object Function]"===Object.prototype.toString.call(t)&&!1===t(n.origin))return!1;e(n)}),C.addEventListener?C[e?"addEventListener":"removeEventListener"]("message",n):C[e?"attachEvent":"detachEvent"]("onmessage",n))}catch(e){}}},ie=function(e){var t,n,i="0123456789",r="",a="",o=8,s=10,c=10;if(1==e){for(i+="ABCDEF",t=0;16>t;t++)n=Math.floor(Math.random()*o),r+=i.substring(n,n+1),n=Math.floor(Math.random()*o),a+=i.substring(n,n+1),o=16;return r+"-"+a}for(t=0;19>t;t++)n=Math.floor(Math.random()*s),r+=i.substring(n,n+1),0===t&&9==n?s=3:(1==t||2==t)&&10!=s&&2>n?s=10:2<t&&(s=10),n=Math.floor(Math.random()*c),a+=i.substring(n,n+1),0===t&&9==n?c=3:(1==t||2==t)&&10!=c&&2>n?c=10:2<t&&(c=10);return r+a},re=function(e,t){return{corsMetadata:function(){var e="none",t=!0;return"undefined"!=typeof XMLHttpRequest&&XMLHttpRequest===Object(XMLHttpRequest)&&("withCredentials"in new XMLHttpRequest?e="XMLHttpRequest":"undefined"!=typeof XDomainRequest&&XDomainRequest===Object(XDomainRequest)&&(t=!1),Object.prototype.toString.call(C.HTMLElement).indexOf("Constructor")>0&&(t=!1)),{corsType:e,corsCookiesEnabled:t}}(),getCORSInstance:function(){return"none"===this.corsMetadata.corsType?null:new C[this.corsMetadata.corsType]},fireCORS:function(t,n,i){function r(e){var n;try{if((n=JSON.parse(e))!==Object(n))return void a.handleCORSError(t,null,"Response is not JSON")}catch(e){return void a.handleCORSError(t,e,"Error parsing response as JSON")}try{for(var i=t.callback,r=C,o=0;o<i.length;o++)r=r[i[o]];r(n)}catch(e){a.handleCORSError(t,e,"Error forming callback function")}}var a=this;n&&(t.loadErrorHandler=n);try{var o=this.getCORSInstance();o.open("get",t.corsUrl+"&ts="+(new Date).getTime(),!0),"XMLHttpRequest"===this.corsMetadata.corsType&&(o.withCredentials=!0,o.timeout=e.loadTimeout,o.setRequestHeader("Content-Type","application/x-www-form-urlencoded"),o.onreadystatechange=function(){4===this.readyState&&200===this.status&&r(this.responseText)}),o.onerror=function(e){a.handleCORSError(t,e,"onerror")},o.ontimeout=function(e){a.handleCORSError(t,e,"ontimeout")},o.send(),e._log.requests.push(t.corsUrl)}catch(e){this.handleCORSError(t,e,"try-catch")}},handleCORSError:function(t,n,i){e.CORSErrors.push({corsData:t,error:n,description:i}),t.loadErrorHandler&&("ontimeout"===i?t.loadErrorHandler(!0):t.loadErrorHandler(!1))}}},ae={POST_MESSAGE_ENABLED:!!C.postMessage,DAYS_BETWEEN_SYNC_ID_CALLS:1,MILLIS_PER_DAY:864e5,ADOBE_MC:"adobe_mc",ADOBE_MC_SDID:"adobe_mc_sdid",VALID_VISITOR_ID_REGEX:/^[0-9a-fA-F\-]+$/,ADOBE_MC_TTL_IN_MIN:5,VERSION_REGEX:/vVersion\|((\d+\.)?(\d+\.)?(\*|\d+))(?=$|\|)/,FIRST_PARTY_SERVER_COOKIE:"s_ecid"},oe=function(e,t){var n=C.document;return{THROTTLE_START:3e4,MAX_SYNCS_LENGTH:649,throttleTimerSet:!1,id:null,onPagePixels:[],iframeHost:null,getIframeHost:function(e){if("string"==typeof e){var t=e.split("/");return t[0]+"//"+t[2]}},subdomain:null,url:null,getUrl:function(){var t,i="http://fast.",r="?d_nsid="+e.idSyncContainerID+"#"+encodeURIComponent(n.location.origin);return this.subdomain||(this.subdomain="nosubdomainreturned"),e.loadSSL&&(i=e.idSyncSSLUseAkamai?"https://fast.":"https://"),t=i+this.subdomain+".demdex.net/dest5.html"+r,this.iframeHost=this.getIframeHost(t),this.id="destination_publishing_iframe_"+this.subdomain+"_"+e.idSyncContainerID,t},checkDPIframeSrc:function(){var t="?d_nsid="+e.idSyncContainerID+"#"+encodeURIComponent(n.location.href);"string"==typeof e.dpIframeSrc&&e.dpIframeSrc.length&&(this.id="destination_publishing_iframe_"+(e._subdomain||this.subdomain||(new Date).getTime())+"_"+e.idSyncContainerID,this.iframeHost=this.getIframeHost(e.dpIframeSrc),this.url=e.dpIframeSrc+t)},idCallNotProcesssed:null,doAttachIframe:!1,startedAttachingIframe:!1,iframeHasLoaded:null,iframeIdChanged:null,newIframeCreated:null,originalIframeHasLoadedAlready:null,iframeLoadedCallbacks:[],regionChanged:!1,timesRegionChanged:0,sendingMessages:!1,messages:[],messagesPosted:[],messagesReceived:[],messageSendingInterval:ae.POST_MESSAGE_ENABLED?null:100,onPageDestinationsFired:[],jsonForComparison:[],jsonDuplicates:[],jsonWaiting:[],jsonProcessed:[],canSetThirdPartyCookies:!0,receivedThirdPartyCookiesNotification:!1,readyToAttachIframePreliminary:function(){return!(e.idSyncDisableSyncs||e.disableIdSyncs||e.idSyncDisable3rdPartySyncing||e.disableThirdPartyCookies||e.disableThirdPartyCalls)},readyToAttachIframe:function(){return this.readyToAttachIframePreliminary()&&(this.doAttachIframe||e._doAttachIframe)&&(this.subdomain&&"nosubdomainreturned"!==this.subdomain||e._subdomain)&&this.url&&!this.startedAttachingIframe},attachIframe:function(){function e(){r=n.createElement("iframe"),r.sandbox="allow-scripts allow-same-origin",r.title="Adobe ID Syncing iFrame",r.id=i.id,r.name=i.id+"_name",r.style.cssText="display: none; width: 0; height: 0;",r.src=i.url,i.newIframeCreated=!0,t(),n.body.appendChild(r)}function t(e){r.addEventListener("load",function(){r.className="aamIframeLoaded",i.iframeHasLoaded=!0,i.fireIframeLoadedCallbacks(e),i.requestToProcess()})}this.startedAttachingIframe=!0;var i=this,r=n.getElementById(this.id);r?"IFRAME"!==r.nodeName?(this.id+="_2",this.iframeIdChanged=!0,e()):(this.newIframeCreated=!1,"aamIframeLoaded"!==r.className?(this.originalIframeHasLoadedAlready=!1,t("The destination publishing iframe already exists from a different library, but hadn't loaded yet.")):(this.originalIframeHasLoadedAlready=!0,this.iframeHasLoaded=!0,this.iframe=r,this.fireIframeLoadedCallbacks("The destination publishing iframe already exists from a different library, and had loaded alresady."),this.requestToProcess())):e(),this.iframe=r},fireIframeLoadedCallbacks:function(e){this.iframeLoadedCallbacks.forEach(function(t){"function"==typeof t&&t({message:e||"The destination publishing iframe was attached and loaded successfully."})}),this.iframeLoadedCallbacks=[]},requestToProcess:function(t){function n(){r.jsonForComparison.push(t),r.jsonWaiting.push(t),r.processSyncOnPage(t)}var i,r=this;if(t===Object(t)&&t.ibs)if(i=JSON.stringify(t.ibs||[]),this.jsonForComparison.length){var a,o,s,c=!1;for(a=0,o=this.jsonForComparison.length;a<o;a++)if(s=this.jsonForComparison[a],i===JSON.stringify(s.ibs||[])){c=!0;break}c?this.jsonDuplicates.push(t):n()}else n();if((this.receivedThirdPartyCookiesNotification||!ae.POST_MESSAGE_ENABLED||this.iframeHasLoaded)&&this.jsonWaiting.length){var u=this.jsonWaiting.shift();this.process(u),this.requestToProcess()}e.idSyncDisableSyncs||e.disableIdSyncs||!this.iframeHasLoaded||!this.messages.length||this.sendingMessages||(this.throttleTimerSet||(this.throttleTimerSet=!0,setTimeout(function(){r.messageSendingInterval=ae.POST_MESSAGE_ENABLED?null:150},this.THROTTLE_START)),this.sendingMessages=!0,this.sendMessages())},getRegionAndCheckIfChanged:function(t,n){var i=e._getField("MCAAMLH"),r=t.d_region||t.dcs_region;return i?r&&(e._setFieldExpire("MCAAMLH",n),e._setField("MCAAMLH",r),parseInt(i,10)!==r&&(this.regionChanged=!0,this.timesRegionChanged++,e._setField("MCSYNCSOP",""),e._setField("MCSYNCS",""),i=r)):(i=r)&&(e._setFieldExpire("MCAAMLH",n),e._setField("MCAAMLH",i)),i||(i=""),i},processSyncOnPage:function(e){var t,n,i,r;if((t=e.ibs)&&t instanceof Array&&(n=t.length))for(i=0;i<n;i++)r=t[i],r.syncOnPage&&this.checkFirstPartyCookie(r,"","syncOnPage")},process:function(e){var t,n,i,r,a,o=encodeURIComponent,s=!1;if((t=e.ibs)&&t instanceof Array&&(n=t.length))for(s=!0,i=0;i<n;i++)r=t[i],a=[o("ibs"),o(r.id||""),o(r.tag||""),V.encodeAndBuildRequest(r.url||[],","),o(r.ttl||""),"","",r.fireURLSync?"true":"false"],r.syncOnPage||(this.canSetThirdPartyCookies?this.addMessage(a.join("|")):r.fireURLSync&&this.checkFirstPartyCookie(r,a.join("|")));s&&this.jsonProcessed.push(e)},checkFirstPartyCookie:function(t,n,i){var r="syncOnPage"===i,a=r?"MCSYNCSOP":"MCSYNCS";e._readVisitor();var o,s,c=e._getField(a),u=!1,l=!1,d=Math.ceil((new Date).getTime()/ae.MILLIS_PER_DAY);c?(o=c.split("*"),s=this.pruneSyncData(o,t.id,d),u=s.dataPresent,l=s.dataValid,u&&l||this.fireSync(r,t,n,o,a,d)):(o=[],this.fireSync(r,t,n,o,a,d))},pruneSyncData:function(e,t,n){var i,r,a,o=!1,s=!1;for(r=0;r<e.length;r++)i=e[r],a=parseInt(i.split("-")[1],10),i.match("^"+t+"-")?(o=!0,n<a?s=!0:(e.splice(r,1),r--)):n>=a&&(e.splice(r,1),r--);return{dataPresent:o,dataValid:s}},manageSyncsSize:function(e){if(e.join("*").length>this.MAX_SYNCS_LENGTH)for(e.sort(function(e,t){return parseInt(e.split("-")[1],10)-parseInt(t.split("-")[1],10)});e.join("*").length>this.MAX_SYNCS_LENGTH;)e.shift()},fireSync:function(t,n,i,r,a,o){var s=this;if(t){if("img"===n.tag){var c,u,l,d,f=n.url,p=e.loadSSL?"https:":"http:";for(c=0,u=f.length;c<u;c++){l=f[c],d=/^\/\//.test(l);var g=new Image;g.addEventListener("load",function(t,n,i,r){return function(){s.onPagePixels[t]=null,e._readVisitor();var o,c=e._getField(a),u=[];if(c){o=c.split("*");var l,d,f;for(l=0,d=o.length;l<d;l++)f=o[l],f.match("^"+n.id+"-")||u.push(f)}s.setSyncTrackingData(u,n,i,r)}}(this.onPagePixels.length,n,a,o)),g.src=(d?p:"")+l,this.onPagePixels.push(g)}}}else this.addMessage(i),this.setSyncTrackingData(r,n,a,o)},addMessage:function(t){var n=encodeURIComponent,i=n(e._enableErrorReporting?"---destpub-debug---":"---destpub---");this.messages.push((ae.POST_MESSAGE_ENABLED?"":i)+t)},setSyncTrackingData:function(t,n,i,r){t.push(n.id+"-"+(r+Math.ceil(n.ttl/60/24))),this.manageSyncsSize(t),e._setField(i,t.join("*"))},sendMessages:function(){var e,t=this,n="",i=encodeURIComponent;this.regionChanged&&(n=i("---destpub-clear-dextp---"),this.regionChanged=!1),this.messages.length?ae.POST_MESSAGE_ENABLED?(e=n+i("---destpub-combined---")+this.messages.join("%01"),this.postMessage(e),this.messages=[],this.sendingMessages=!1):(e=this.messages.shift(),this.postMessage(n+e),setTimeout(function(){t.sendMessages()},this.messageSendingInterval)):this.sendingMessages=!1},postMessage:function(e){ne.postMessage(e,this.url,this.iframe.contentWindow),this.messagesPosted.push(e)},receiveMessage:function(e){var t,n=/^---destpub-to-parent---/;"string"==typeof e&&n.test(e)&&(t=e.replace(n,"").split("|"),"canSetThirdPartyCookies"===t[0]&&(this.canSetThirdPartyCookies="true"===t[1],this.receivedThirdPartyCookiesNotification=!0,this.requestToProcess()),this.messagesReceived.push(e))},processIDCallData:function(i){(null==this.url||i.subdomain&&"nosubdomainreturned"===this.subdomain)&&("string"==typeof e._subdomain&&e._subdomain.length?this.subdomain=e._subdomain:this.subdomain=i.subdomain||"",this.url=this.getUrl()),i.ibs instanceof Array&&i.ibs.length&&(this.doAttachIframe=!0),this.readyToAttachIframe()&&(e.idSyncAttachIframeOnWindowLoad?(t.windowLoaded||"complete"===n.readyState||"loaded"===n.readyState)&&this.attachIframe():this.attachIframeASAP()),"function"==typeof e.idSyncIDCallResult?e.idSyncIDCallResult(i):this.requestToProcess(i),"function"==typeof e.idSyncAfterIDCallResult&&e.idSyncAfterIDCallResult(i)},canMakeSyncIDCall:function(t,n){return e._forceSyncIDCall||!t||n-t>ae.DAYS_BETWEEN_SYNC_ID_CALLS},attachIframeASAP:function(){function e(){t.startedAttachingIframe||(n.body?t.attachIframe():setTimeout(e,30))}var t=this;e()}}},se={audienceManagerServer:{},audienceManagerServerSecure:{},cookieDomain:{},cookieLifetime:{},cookieName:{},doesOptInApply:{},disableThirdPartyCalls:{},discardTrackingServerECID:{},idSyncAfterIDCallResult:{},idSyncAttachIframeOnWindowLoad:{},idSyncContainerID:{},idSyncDisable3rdPartySyncing:{},disableThirdPartyCookies:{},idSyncDisableSyncs:{},disableIdSyncs:{},idSyncIDCallResult:{},idSyncSSLUseAkamai:{},isCoopSafe:{},isIabContext:{},isOptInStorageEnabled:{},loadSSL:{},loadTimeout:{},marketingCloudServer:{},marketingCloudServerSecure:{},optInCookieDomain:{},optInStorageExpiry:{},overwriteCrossDomainMCIDAndAID:{},preOptInApprovals:{},previousPermissions:{},resetBeforeVersion:{},sdidParamExpiry:{},serverState:{},sessionCookieName:{},secureCookie:{},takeTimeoutMetrics:{},trackingServer:{},trackingServerSecure:{},whitelistIframeDomains:{},whitelistParentDomain:{}},ce={getConfigNames:function(){return Object.keys(se)},getConfigs:function(){return se},normalizeConfig:function(e){return"function"!=typeof e?e:e()}},ue=function(e){var t={};return e.on=function(e,n,i){if(!n||"function"!=typeof n)throw new Error("[ON] Callback should be a function.");t.hasOwnProperty(e)||(t[e]=[]);var r=t[e].push({callback:n,context:i})-1;return function(){t[e].splice(r,1),t[e].length||delete t[e]}},e.off=function(e,n){t.hasOwnProperty(e)&&(t[e]=t[e].filter(function(e){if(e.callback!==n)return e}))},e.publish=function(e){if(t.hasOwnProperty(e)){var n=[].slice.call(arguments,1);t[e].slice(0).forEach(function(e){e.callback.apply(e.context,n)})}},e.publish},le={PENDING:"pending",CHANGED:"changed",COMPLETE:"complete"},de={AAM:"aam",ADCLOUD:"adcloud",ANALYTICS:"aa",CAMPAIGN:"campaign",ECID:"ecid",LIVEFYRE:"livefyre",TARGET:"target",MEDIA_ANALYTICS:"mediaaa"},fe=(I={},t(I,de.AAM,565),t(I,de.ECID,565),I),pe=(S={},t(S,de.AAM,[1,10]),t(S,de.ECID,[1,10]),S),ge=["videoaa","iabConsentHash"],me=function(e){return Object.keys(e).map(function(t){return e[t]})}(de),he=function(){var e={};return e.callbacks=Object.create(null),e.add=function(t,n){if(!u(n))throw new Error("[callbackRegistryFactory] Make sure callback is a function or an array of functions.");e.callbacks[t]=e.callbacks[t]||[];var i=e.callbacks[t].push(n)-1;return function(){e.callbacks[t].splice(i,1)}},e.execute=function(t,n){if(e.callbacks[t]){n=void 0===n?[]:n,n=n instanceof Array?n:[n];try{for(;e.callbacks[t].length;){var i=e.callbacks[t].shift();"function"==typeof i?i.apply(null,n):i instanceof Array&&i[1].apply(i[0],n)}delete e.callbacks[t]}catch(e){}}},e.executeAll=function(t,n){(n||t&&!c(t))&&Object.keys(e.callbacks).forEach(function(n){var i=void 0!==t[n]?t[n]:"";e.execute(n,i)},e)},e.hasCallbacks=function(){return Boolean(Object.keys(e.callbacks).length)},e},_e=function(){},Ce=function(e){var t=window,n=t.console;return!!n&&"function"==typeof n[e]},Ie=function(e,t,n){return n()?function(){if(Ce(e)){for(var n=arguments.length,i=new Array(n),r=0;r<n;r++)i[r]=arguments[r];console[e].apply(console,[t].concat(i))}}:_e},Se=l,ve=function(){for(var e=[],t=0;t<256;t++){for(var n=t,i=0;i<8;i++)n=1&n?3988292384^n>>>1:n>>>1;e.push(n)}return function(t,n){t=unescape(encodeURIComponent(t)),n||(n=0),n^=-1;for(var i=0;i<t.length;i++){var r=255&(n^t.charCodeAt(i));n=n>>>8^e[r]}return(n^=-1)>>>0}}(),De=new Se("[ADOBE OPT-IN]"),ye=function(t,n){return e(t)===n},Ae=function(e,t){return e instanceof Array?e:ye(e,"string")?[e]:t||[]},be=function(e){var t=Object.keys(e);return!!t.length&&t.every(function(t){return!0===e[t]})},Oe=function(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1];return!(!e||Ee(e))&&Ae(e).every(function(e){return me.indexOf(e)>-1||t&&ge.indexOf(e)>-1})},Me=function(e,t){return e.reduce(function(e,n){return e[n]=t,e},{})},ke=function(e){return JSON.parse(JSON.stringify(e))},Ee=function(e){return"[object Array]"===Object.prototype.toString.call(e)&&!e.length},Te=function(e){if(Re(e))return e;try{return JSON.parse(e)}catch(e){return{}}},Pe=function(e){return void 0===e||(Re(e)?Oe(Object.keys(e),!0):Le(e))},Le=function(e){try{var t=JSON.parse(e);return!!e&&ye(e,"string")&&Oe(Object.keys(t),!0)}catch(e){return!1}},Re=function(e){return null!==e&&ye(e,"object")&&!1===Array.isArray(e)},we=function(){},Fe=function(e){return ye(e,"function")?e():e},Ne=function(e,t){Pe(e)||De.error("".concat(t))},xe=function(e){return Object.keys(e).map(function(t){return e[t]})},je=function(e){return xe(e).filter(function(e,t,n){return n.indexOf(e)===t})},Ve=function(e){return function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=t.command,i=t.params,r=void 0===i?{}:i,a=t.callback,o=void 0===a?we:a;if(!n||-1===n.indexOf("."))throw new Error("[OptIn.execute] Please provide a valid command.");try{var s=n.split("."),c=e[s[0]],u=s[1];if(!c||"function"!=typeof c[u])throw new Error("Make sure the plugin and API name exist.");var l=Object.assign(r,{callback:o});c[u].call(c,l)}catch(e){De.error("[execute] Something went wrong: "+e.message)}}};f.prototype=Object.create(Error.prototype),f.prototype.constructor=f;var He="fetchPermissions",Ue="[OptIn#registerPlugin] Plugin is invalid.";p.Categories=de,p.TimeoutError=f;var Be=Object.freeze({OptIn:p,IabPlugin:_}),Ge=function(e,t){e.publishDestinations=function(n){var i=arguments[1],r=arguments[2];try{r="function"==typeof r?r:n.callback}catch(e){r=function(){}}var a=t;if(!a.readyToAttachIframePreliminary())return void r({error:"The destination publishing iframe is disabled in the Visitor library."});if("string"==typeof n){
if(!n.length)return void r({error:"subdomain is not a populated string."});if(!(i instanceof Array&&i.length))return void r({error:"messages is not a populated array."});var o=!1;if(i.forEach(function(e){"string"==typeof e&&e.length&&(a.addMessage(e),o=!0)}),!o)return void r({error:"None of the messages are populated strings."})}else{if(!V.isObject(n))return void r({error:"Invalid parameters passed."});var s=n;if("string"!=typeof(n=s.subdomain)||!n.length)return void r({error:"config.subdomain is not a populated string."});var c=s.urlDestinations;if(!(c instanceof Array&&c.length))return void r({error:"config.urlDestinations is not a populated array."});var u=[];c.forEach(function(e){V.isObject(e)&&(e.hideReferrer?e.message&&a.addMessage(e.message):u.push(e))});!function e(){u.length&&setTimeout(function(){var t=new Image,n=u.shift();t.src=n.url,a.onPageDestinationsFired.push(n),e()},100)}()}a.iframe?(r({message:"The destination publishing iframe is already attached and loaded."}),a.requestToProcess()):!e.subdomain&&e._getField("MCMID")?(a.subdomain=n,a.doAttachIframe=!0,a.url=a.getUrl(),a.readyToAttachIframe()?(a.iframeLoadedCallbacks.push(function(e){r({message:"Attempted to attach and load the destination publishing iframe through this API call. Result: "+(e.message||"no result")})}),a.attachIframe()):r({error:"Encountered a problem in attempting to attach and load the destination publishing iframe through this API call."})):a.iframeLoadedCallbacks.push(function(e){r({message:"Attempted to attach and load the destination publishing iframe through normal Visitor API processing. Result: "+(e.message||"no result")})})}},Ye=function e(t){function n(e,t){return e>>>t|e<<32-t}for(var i,r,a=Math.pow,o=a(2,32),s="",c=[],u=8*t.length,l=e.h=e.h||[],d=e.k=e.k||[],f=d.length,p={},g=2;f<64;g++)if(!p[g]){for(i=0;i<313;i+=g)p[i]=g;l[f]=a(g,.5)*o|0,d[f++]=a(g,1/3)*o|0}for(t+="";t.length%64-56;)t+="\0";for(i=0;i<t.length;i++){if((r=t.charCodeAt(i))>>8)return;c[i>>2]|=r<<(3-i)%4*8}for(c[c.length]=u/o|0,c[c.length]=u,r=0;r<c.length;){var m=c.slice(r,r+=16),h=l;for(l=l.slice(0,8),i=0;i<64;i++){var _=m[i-15],C=m[i-2],I=l[0],S=l[4],v=l[7]+(n(S,6)^n(S,11)^n(S,25))+(S&l[5]^~S&l[6])+d[i]+(m[i]=i<16?m[i]:m[i-16]+(n(_,7)^n(_,18)^_>>>3)+m[i-7]+(n(C,17)^n(C,19)^C>>>10)|0);l=[v+((n(I,2)^n(I,13)^n(I,22))+(I&l[1]^I&l[2]^l[1]&l[2]))|0].concat(l),l[4]=l[4]+v|0}for(i=0;i<8;i++)l[i]=l[i]+h[i]|0}for(i=0;i<8;i++)for(r=3;r+1;r--){var D=l[i]>>8*r&255;s+=(D<16?0:"")+D.toString(16)}return s},qe=function(e,t){return"SHA-256"!==t&&"SHA256"!==t&&"sha256"!==t&&"sha-256"!==t||(e=Ye(e)),e},We=function(e){return String(e).trim().toLowerCase()},Xe=Be.OptIn;V.defineGlobalNamespace(),window.adobe.OptInCategories=Xe.Categories;var Ke=function(t,n,i){function r(){I._customerIDsHashChanged=!1}function a(e){var t=e;return function(e){var n=e||b.location.href;try{var i=I._extractParamFromUri(n,t);if(i)return B.parsePipeDelimetedKeyValues(i)}catch(e){}}}function o(e){function t(e,t,n){e&&e.match(ae.VALID_VISITOR_ID_REGEX)&&(n===E&&(A=!0),t(e))}t(e[E],I.setMarketingCloudVisitorID,E),I._setFieldExpire(F,-1),t(e[R],I.setAnalyticsVisitorID)}function s(e){e=e||{},I._supplementalDataIDCurrent=e.supplementalDataIDCurrent||"",I._supplementalDataIDCurrentConsumed=e.supplementalDataIDCurrentConsumed||{},I._supplementalDataIDLast=e.supplementalDataIDLast||"",I._supplementalDataIDLastConsumed=e.supplementalDataIDLastConsumed||{}}function c(e){function t(e,t,n){return n=n?n+="|":n,n+=e+"="+encodeURIComponent(t)}function n(e,n){var i=n[0],r=n[1];return null!=r&&r!==N&&(e=t(i,r,e)),e}var i=e.reduce(n,"");return function(e){var t=B.getTimestampInSeconds();return e=e?e+="|":e,e+="TS="+t}(i)}function u(e){var t=e.minutesToLive,n="";return(I.idSyncDisableSyncs||I.disableIdSyncs)&&(n=n||"Error: id syncs have been disabled"),"string"==typeof e.dpid&&e.dpid.length||(n=n||"Error: config.dpid is empty"),"string"==typeof e.url&&e.url.length||(n=n||"Error: config.url is empty"),void 0===t?t=20160:(t=parseInt(t,10),(isNaN(t)||t<=0)&&(n=n||"Error: config.minutesToLive needs to be a positive number")),{error:n,ttl:t}}function l(){return!!I.configs.doesOptInApply&&!(S.optIn.isComplete&&d())}function d(){return I.configs.doesOptInApply&&I.configs.isIabContext?S.optIn.isApproved(S.optIn.Categories.ECID)&&y:S.optIn.isApproved(S.optIn.Categories.ECID)}function f(){[["getMarketingCloudVisitorID"],["setCustomerIDs",void 0],["syncIdentity",void 0],["getAnalyticsVisitorID"],["getAudienceManagerLocationHint"],["getLocationHint"],["getAudienceManagerBlob"]].forEach(function(e){var t=e[0],n=2===e.length?e[1]:"",i=I[t];I[t]=function(e){return d()&&I.isAllowed()?i.apply(I,arguments):("function"==typeof e&&I._callCallback(e,[n]),n)}})}function p(){var e=I._getAudienceManagerURLData(),t=e.url;return I._loadData(k,t,null,e)}function g(e,t){if(y=!0,e)throw new Error("[IAB plugin] : "+e);t&&t.gdprApplies&&(v=t.consentString,D=t.hasConsentChangedSinceLastCmpPull?1:0),p(),_()}function m(e,t){if(y=!0,e)throw new Error("[IAB plugin] : "+e);t.gdprApplies&&(v=t.consentString,D=t.hasConsentChangedSinceLastCmpPull?1:0),I.init(),_()}function h(){S.optIn.isComplete&&(S.optIn.isApproved(S.optIn.Categories.ECID)?I.configs.isIabContext?S.optIn.execute({command:"iabPlugin.fetchConsentData",callback:m}):(I.init(),_()):I.configs.isIabContext?S.optIn.execute({command:"iabPlugin.fetchConsentData",callback:g}):(f(),_()))}function _(){S.optIn.off("complete",h)}if(!i||i.split("").reverse().join("")!==t)throw new Error("Please use `Visitor.getInstance` to instantiate Visitor.");var I=this,S=window.adobe,v="",D=0,y=!1,A=!1;I.version="5.0.1";var b=C,O=b.Visitor;O.version=I.version,O.AuthState=T.AUTH_STATE,O.OptOut=T.OPT_OUT,b.s_c_in||(b.s_c_il=[],b.s_c_in=0),I._c="Visitor",I._il=b.s_c_il,I._in=b.s_c_in,I._il[I._in]=I,b.s_c_in++,I._instanceType="regular",I._log={requests:[]},I.marketingCloudOrgID=t,I.cookieName="AMCV_"+t,I.sessionCookieName="AMCVS_"+t,I.cookieDomain=Z(),I.loadSSL=!0,I.loadTimeout=3e4,I.CORSErrors=[],I.marketingCloudServer=I.audienceManagerServer="dpm.demdex.net",I.sdidParamExpiry=30;var M=null,k="MC",E="MCMID",P="MCIDTS",L="A",R="MCAID",w="AAM",F="MCAAMB",N="NONE",x=function(e){return!Object.prototype[e]},j=re(I);I.FIELDS=T.FIELDS,I.cookieRead=function(e){return $.get(e)},I.cookieWrite=function(e,t,n){var i=I.cookieLifetime?(""+I.cookieLifetime).toUpperCase():"",r=!1;return I.configs&&I.configs.secureCookie&&"https:"===location.protocol&&(r=!0),$.set(e,""+t,{expires:n,domain:I.cookieDomain,cookieLifetime:i,secure:r})},I.resetState=function(e){e?I._mergeServerState(e):s()},I._isAllowedDone=!1,I._isAllowedFlag=!1,I.isAllowed=function(){return I._isAllowedDone||(I._isAllowedDone=!0,(I.cookieRead(I.cookieName)||I.cookieWrite(I.cookieName,"T",1))&&(I._isAllowedFlag=!0)),"T"===I.cookieRead(I.cookieName)&&I._helpers.removeCookie(I.cookieName),I._isAllowedFlag},I.setMarketingCloudVisitorID=function(e){I._setMarketingCloudFields(e)},I._use1stPartyMarketingCloudServer=!1,I.getMarketingCloudVisitorID=function(e,t){I.marketingCloudServer&&I.marketingCloudServer.indexOf(".demdex.net")<0&&(I._use1stPartyMarketingCloudServer=!0);var n=I._getAudienceManagerURLData("_setMarketingCloudFields"),i=n.url;return I._getRemoteField(E,i,e,t,n)};var H=function(e,t){var n={};I.getMarketingCloudVisitorID(function(){t.forEach(function(e){n[e]=I._getField(e,!0)}),-1!==t.indexOf("MCOPTOUT")?I.isOptedOut(function(t){n.MCOPTOUT=t,e(n)},null,!0):e(n)},!0)};I.getVisitorValues=function(e,t){var n={MCMID:{fn:I.getMarketingCloudVisitorID,args:[!0],context:I},MCOPTOUT:{fn:I.isOptedOut,args:[void 0,!0],context:I},MCAID:{fn:I.getAnalyticsVisitorID,args:[!0],context:I},MCAAMLH:{fn:I.getAudienceManagerLocationHint,args:[!0],context:I},MCAAMB:{fn:I.getAudienceManagerBlob,args:[!0],context:I}},i=t&&t.length?V.pluck(n,t):n;t&&-1===t.indexOf("MCAID")?H(e,t):Q(i,e)},I._currentCustomerIDs={},I._customerIDsHashChanged=!1,I._newCustomerIDsHash="",I.setCustomerIDs=function(t,n){if(!I.isOptedOut()&&t){if(!V.isObject(t)||V.isObjectEmpty(t))return!1;I._readVisitor();var i,a,o,s;for(i in t)if(x(i)&&(I._currentCustomerIDs.dataSources=I._currentCustomerIDs.dataSources||{},a=t[i],n=a.hasOwnProperty("hashType")?a.hashType:n,a))if("object"===e(a)){var c={};if(a.id){if(n){if(!(s=qe(We(a.id),n)))return;a.id=s,c.hashType=n}c.id=a.id}void 0!=a.authState&&(c.authState=a.authState),I._currentCustomerIDs.dataSources[i]=c}else if(n){if(!(s=qe(We(a),n)))return;I._currentCustomerIDs.dataSources[i]={id:s,hashType:n}}else I._currentCustomerIDs.dataSources[i]={id:a};var u=I.getCustomerIDs(!0),l=I._getField("MCCIDH"),d="";l||(l=0);for(o in u){var f=u[o];if(!V.isObjectEmpty(f))for(i in f)x(i)&&(a=f[i],d+=(d?"|":"")+i+"|"+(a.id?a.id:"")+(a.authState?a.authState:""))}I._newCustomerIDsHash=String(I._hash(d)),I._newCustomerIDsHash!==l&&(I._customerIDsHashChanged=!0,I._mapCustomerIDs(r))}},I.syncIdentity=function(t,n){if(!I.isOptedOut()&&t){if(!V.isObject(t)||V.isObjectEmpty(t))return!1;I._readVisitor();var i,a,o,s,c;for(i in t)if(x(i)&&(I._currentCustomerIDs.nameSpaces=I._currentCustomerIDs.nameSpaces||{},a=t[i],n=a.hasOwnProperty("hashType")?a.hashType:n,a&&"object"===e(a))){var u={};if(a.id){if(n){if(!(o=qe(We(a.id),n)))return;a.id=o,u.hashType=n}u.id=a.id}void 0!=a.authState&&(u.authState=a.authState),a.dataSource&&(I._currentCustomerIDs.dataSources=I._currentCustomerIDs.dataSources||{},s=a.dataSource,I._currentCustomerIDs.dataSources[s]=u),I._currentCustomerIDs.nameSpaces[i]=u}var l=I.getCustomerIDs(!0),d=I._getField("MCCIDH"),f="";d||(d="0");for(c in l){var p=l[c];if(!V.isObjectEmpty(p))for(i in p)x(i)&&(a=p[i],f+=(f?"|":"")+i+"|"+(a.id?a.id:"")+(a.authState?a.authState:""))}I._newCustomerIDsHash=String(I._hash(f)),I._newCustomerIDsHash!==d&&(I._customerIDsHashChanged=!0,I._mapCustomerIDs(r))}},I.getCustomerIDs=function(e){I._readVisitor();var t,n,i={dataSources:{},nameSpaces:{}},r=I._currentCustomerIDs.dataSources;for(t in r)x(t)&&(n=r[t],n.id&&(i.dataSources[t]||(i.dataSources[t]={}),i.dataSources[t].id=n.id,void 0!=n.authState?i.dataSources[t].authState=n.authState:i.dataSources[t].authState=O.AuthState.UNKNOWN,n.hashType&&(i.dataSources[t].hashType=n.hashType)));var a=I._currentCustomerIDs.nameSpaces;for(t in a)x(t)&&(n=a[t],n.id&&(i.nameSpaces[t]||(i.nameSpaces[t]={}),i.nameSpaces[t].id=n.id,void 0!=n.authState?i.nameSpaces[t].authState=n.authState:i.nameSpaces[t].authState=O.AuthState.UNKNOWN,n.hashType&&(i.nameSpaces[t].hashType=n.hashType)));return e?i:i.dataSources},I.setAnalyticsVisitorID=function(e){I._setAnalyticsFields(e)},I.getAnalyticsVisitorID=function(e,t,n){if(!B.isTrackingServerPopulated()&&!n)return I._callCallback(e,[""]),"";var i="";if(n||(i=I.getMarketingCloudVisitorID(function(t){I.getAnalyticsVisitorID(e,!0)})),i||n){var r=n?I.marketingCloudServer:I.trackingServer,a="";I.loadSSL&&(n?I.marketingCloudServerSecure&&(r=I.marketingCloudServerSecure):I.trackingServerSecure&&(r=I.trackingServerSecure));var o={};if(r){var s="http"+(I.loadSSL?"s":"")+"://"+r+"/id",c="d_visid_ver="+I.version+"&mcorgid="+encodeURIComponent(I.marketingCloudOrgID)+(i?"&mid="+encodeURIComponent(i):"")+(I.idSyncDisable3rdPartySyncing||I.disableThirdPartyCookies?"&d_coppa=true":""),u=["s_c_il",I._in,"_set"+(n?"MarketingCloud":"Analytics")+"Fields"];a=s+"?"+c+"&callback=s_c_il%5B"+I._in+"%5D._set"+(n?"MarketingCloud":"Analytics")+"Fields",o.corsUrl=s+"?"+c,o.callback=u}return o.url=a,I._getRemoteField(n?E:R,a,e,t,o)}return""},I.getAudienceManagerLocationHint=function(e,t){if(I.getMarketingCloudVisitorID(function(t){I.getAudienceManagerLocationHint(e,!0)})){var n=I._getField(R);if(!n&&B.isTrackingServerPopulated()&&(n=I.getAnalyticsVisitorID(function(t){I.getAudienceManagerLocationHint(e,!0)})),n||!B.isTrackingServerPopulated()){var i=I._getAudienceManagerURLData(),r=i.url;return I._getRemoteField("MCAAMLH",r,e,t,i)}}return""},I.getLocationHint=I.getAudienceManagerLocationHint,I.getAudienceManagerBlob=function(e,t){if(I.getMarketingCloudVisitorID(function(t){I.getAudienceManagerBlob(e,!0)})){var n=I._getField(R);if(!n&&B.isTrackingServerPopulated()&&(n=I.getAnalyticsVisitorID(function(t){I.getAudienceManagerBlob(e,!0)})),n||!B.isTrackingServerPopulated()){var i=I._getAudienceManagerURLData(),r=i.url;return I._customerIDsHashChanged&&I._setFieldExpire(F,-1),I._getRemoteField(F,r,e,t,i)}}return""},I._supplementalDataIDCurrent="",I._supplementalDataIDCurrentConsumed={},I._supplementalDataIDLast="",I._supplementalDataIDLastConsumed={},I.getSupplementalDataID=function(e,t){I._supplementalDataIDCurrent||t||(I._supplementalDataIDCurrent=I._generateID(1));var n=I._supplementalDataIDCurrent;return I._supplementalDataIDLast&&!I._supplementalDataIDLastConsumed[e]?(n=I._supplementalDataIDLast,I._supplementalDataIDLastConsumed[e]=!0):n&&(I._supplementalDataIDCurrentConsumed[e]&&(I._supplementalDataIDLast=I._supplementalDataIDCurrent,I._supplementalDataIDLastConsumed=I._supplementalDataIDCurrentConsumed,I._supplementalDataIDCurrent=n=t?"":I._generateID(1),I._supplementalDataIDCurrentConsumed={}),n&&(I._supplementalDataIDCurrentConsumed[e]=!0)),n};var U=!1;I._liberatedOptOut=null,I.getOptOut=function(e,t){var n=I._getAudienceManagerURLData("_setMarketingCloudFields"),i=n.url;if(d())return I._getRemoteField("MCOPTOUT",i,e,t,n);if(I._registerCallback("liberatedOptOut",e),null!==I._liberatedOptOut)return I._callAllCallbacks("liberatedOptOut",[I._liberatedOptOut]),U=!1,I._liberatedOptOut;if(U)return null;U=!0;var r="liberatedGetOptOut";return n.corsUrl=n.corsUrl.replace(/\.demdex\.net\/id\?/,".demdex.net/optOutStatus?"),n.callback=[r],C[r]=function(e){if(e===Object(e)){var t,n,i=V.parseOptOut(e,t,N);t=i.optOut,n=1e3*i.d_ottl,I._liberatedOptOut=t,setTimeout(function(){I._liberatedOptOut=null},n)}I._callAllCallbacks("liberatedOptOut",[t]),U=!1},j.fireCORS(n),null},I.isOptedOut=function(e,t,n){t||(t=O.OptOut.GLOBAL);var i=I.getOptOut(function(n){var i=n===O.OptOut.GLOBAL||n.indexOf(t)>=0;I._callCallback(e,[i])},n);return i?i===O.OptOut.GLOBAL||i.indexOf(t)>=0:null},I._fields=null,I._fieldsExpired=null,I._hash=function(e){var t,n,i=0;if(e)for(t=0;t<e.length;t++)n=e.charCodeAt(t),i=(i<<5)-i+n,i&=i;return i},I._generateID=ie,I._generateLocalMID=function(){var e=I._generateID(0);return q.isClientSideMarketingCloudVisitorID=!0,e},I._callbackList=null,I._callCallback=function(e,t){try{"function"==typeof e?e.apply(b,t):e[1].apply(e[0],t)}catch(e){}},I._registerCallback=function(e,t){t&&(null==I._callbackList&&(I._callbackList={}),void 0==I._callbackList[e]&&(I._callbackList[e]=[]),I._callbackList[e].push(t))},I._callAllCallbacks=function(e,t){if(null!=I._callbackList){var n=I._callbackList[e];if(n)for(;n.length>0;)I._callCallback(n.shift(),t)}},I._addQuerystringParam=function(e,t,n,i){var r=encodeURIComponent(t)+"="+encodeURIComponent(n),a=B.parseHash(e),o=B.hashlessUrl(e);if(-1===o.indexOf("?"))return o+"?"+r+a;var s=o.split("?"),c=s[0]+"?",u=s[1];return c+B.addQueryParamAtLocation(u,r,i)+a},I._extractParamFromUri=function(e,t){var n=new RegExp("[\\?&#]"+t+"=([^&#]*)"),i=n.exec(e);if(i&&i.length)return decodeURIComponent(i[1])},I._parseAdobeMcFromUrl=a(ae.ADOBE_MC),I._parseAdobeMcSdidFromUrl=a(ae.ADOBE_MC_SDID),I._attemptToPopulateSdidFromUrl=function(e){var n=I._parseAdobeMcSdidFromUrl(e),i=1e9;n&&n.TS&&(i=B.getTimestampInSeconds()-n.TS),n&&n.SDID&&n.MCORGID===t&&i<I.sdidParamExpiry&&(I._supplementalDataIDCurrent=n.SDID,I._supplementalDataIDCurrentConsumed.SDID_URL_PARAM=!0)},I._attemptToPopulateIdsFromUrl=function(){var e=I._parseAdobeMcFromUrl();if(e&&e.TS){var n=B.getTimestampInSeconds(),i=n-e.TS;if(Math.floor(i/60)>ae.ADOBE_MC_TTL_IN_MIN||e.MCORGID!==t)return;o(e)}},I._mergeServerState=function(e){if(e)try{if(e=function(e){return B.isObject(e)?e:JSON.parse(e)}(e),e[I.marketingCloudOrgID]){var t=e[I.marketingCloudOrgID];!function(e){B.isObject(e)&&I.setCustomerIDs(e)}(t.customerIDs),s(t.sdid)}}catch(e){throw new Error("`serverState` has an invalid format.")}},I._timeout=null,I._loadData=function(e,t,n,i){t=I._addQuerystringParam(t,"d_fieldgroup",e,1),i.url=I._addQuerystringParam(i.url,"d_fieldgroup",e,1),i.corsUrl=I._addQuerystringParam(i.corsUrl,"d_fieldgroup",e,1),q.fieldGroupObj[e]=!0,i===Object(i)&&i.corsUrl&&"XMLHttpRequest"===j.corsMetadata.corsType&&j.fireCORS(i,n,e)},I._clearTimeout=function(e){null!=I._timeout&&I._timeout[e]&&(clearTimeout(I._timeout[e]),I._timeout[e]=0)},I._settingsDigest=0,I._getSettingsDigest=function(){if(!I._settingsDigest){var e=I.version;I.audienceManagerServer&&(e+="|"+I.audienceManagerServer),I.audienceManagerServerSecure&&(e+="|"+I.audienceManagerServerSecure),I._settingsDigest=I._hash(e)}return I._settingsDigest},I._readVisitorDone=!1,I._readVisitor=function(){if(!I._readVisitorDone){I._readVisitorDone=!0;var e,t,n,i,r,a,o=I._getSettingsDigest(),s=!1,c=I.cookieRead(I.cookieName),u=new Date;if(c||A||I.discardTrackingServerECID||(c=I.cookieRead(ae.FIRST_PARTY_SERVER_COOKIE)),null==I._fields&&(I._fields={}),c&&"T"!==c)for(c=c.split("|"),c[0].match(/^[\-0-9]+$/)&&(parseInt(c[0],10)!==o&&(s=!0),c.shift()),c.length%2==1&&c.pop(),e=0;e<c.length;e+=2)t=c[e].split("-"),n=t[0],i=c[e+1],t.length>1?(r=parseInt(t[1],10),a=t[1].indexOf("s")>0):(r=0,a=!1),s&&("MCCIDH"===n&&(i=""),r>0&&(r=u.getTime()/1e3-60)),n&&i&&(I._setField(n,i,1),r>0&&(I._fields["expire"+n]=r+(a?"s":""),(u.getTime()>=1e3*r||a&&!I.cookieRead(I.sessionCookieName))&&(I._fieldsExpired||(I._fieldsExpired={}),I._fieldsExpired[n]=!0)));!I._getField(R)&&B.isTrackingServerPopulated()&&(c=I.cookieRead("s_vi"))&&(c=c.split("|"),c.length>1&&c[0].indexOf("v1")>=0&&(i=c[1],e=i.indexOf("["),e>=0&&(i=i.substring(0,e)),i&&i.match(ae.VALID_VISITOR_ID_REGEX)&&I._setField(R,i)))}},I._appendVersionTo=function(e){var t="vVersion|"+I.version,n=e?I._getCookieVersion(e):null;return n?ee.areVersionsDifferent(n,I.version)&&(e=e.replace(ae.VERSION_REGEX,t)):e+=(e?"|":"")+t,e},I._writeVisitor=function(){var e,t,n=I._getSettingsDigest();for(e in I._fields)x(e)&&I._fields[e]&&"expire"!==e.substring(0,6)&&(t=I._fields[e],n+=(n?"|":"")+e+(I._fields["expire"+e]?"-"+I._fields["expire"+e]:"")+"|"+t);n=I._appendVersionTo(n),I.cookieWrite(I.cookieName,n,1)},I._getField=function(e,t){return null==I._fields||!t&&I._fieldsExpired&&I._fieldsExpired[e]?null:I._fields[e]},I._setField=function(e,t,n){null==I._fields&&(I._fields={}),I._fields[e]=t,n||I._writeVisitor()},I._getFieldList=function(e,t){var n=I._getField(e,t);return n?n.split("*"):null},I._setFieldList=function(e,t,n){I._setField(e,t?t.join("*"):"",n)},I._getFieldMap=function(e,t){var n=I._getFieldList(e,t);if(n){var i,r={};for(i=0;i<n.length;i+=2)r[n[i]]=n[i+1];return r}return null},I._setFieldMap=function(e,t,n){var i,r=null;if(t){r=[];for(i in t)x(i)&&(r.push(i),r.push(t[i]))}I._setFieldList(e,r,n)},I._setFieldExpire=function(e,t,n){var i=new Date;i.setTime(i.getTime()+1e3*t),null==I._fields&&(I._fields={}),I._fields["expire"+e]=Math.floor(i.getTime()/1e3)+(n?"s":""),t<0?(I._fieldsExpired||(I._fieldsExpired={}),I._fieldsExpired[e]=!0):I._fieldsExpired&&(I._fieldsExpired[e]=!1),n&&(I.cookieRead(I.sessionCookieName)||I.cookieWrite(I.sessionCookieName,"1"))},I._findVisitorID=function(t){return t&&("object"===e(t)&&(t=t.d_mid?t.d_mid:t.visitorID?t.visitorID:t.id?t.id:t.uuid?t.uuid:""+t),t&&"NOTARGET"===(t=t.toUpperCase())&&(t=N),t&&(t===N||t.match(ae.VALID_VISITOR_ID_REGEX))||(t="")),t},I._setFields=function(t,n){if(I._clearTimeout(t),null!=I._loading&&(I._loading[t]=!1),q.fieldGroupObj[t]&&q.setState(t,!1),t===k){!0!==q.isClientSideMarketingCloudVisitorID&&(q.isClientSideMarketingCloudVisitorID=!1);var i=I._getField(E);if(!i||I.overwriteCrossDomainMCIDAndAID){if(!(i="object"===e(n)&&n.mid?n.mid:I._findVisitorID(n))){if(I._use1stPartyMarketingCloudServer&&!I.tried1stPartyMarketingCloudServer)return I.tried1stPartyMarketingCloudServer=!0,void I.getAnalyticsVisitorID(null,!1,!0);i=I._generateLocalMID()}I._setField(E,i)}i&&i!==N||(i=""),"object"===e(n)&&((n.d_region||n.dcs_region||n.d_blob||n.blob)&&I._setFields(w,n),I._use1stPartyMarketingCloudServer&&n.mid&&I._setFields(L,{id:n.id})),I._callAllCallbacks(E,[i])}if(t===w&&"object"===e(n)){var r=604800;void 0!=n.id_sync_ttl&&n.id_sync_ttl&&(r=parseInt(n.id_sync_ttl,10));var a=Y.getRegionAndCheckIfChanged(n,r);I._callAllCallbacks("MCAAMLH",[a]);var o=I._getField(F);(n.d_blob||n.blob)&&(o=n.d_blob,o||(o=n.blob),I._setFieldExpire(F,r),I._setField(F,o)),o||(o=""),I._callAllCallbacks(F,[o]),!n.error_msg&&I._newCustomerIDsHash&&I._setField("MCCIDH",I._newCustomerIDsHash)}if(t===L){var s=I._getField(R);s&&!I.overwriteCrossDomainMCIDAndAID||(s=I._findVisitorID(n),s?s!==N&&I._setFieldExpire(F,-1):s=N,I._setField(R,s)),s&&s!==N||(s=""),I._callAllCallbacks(R,[s])}if(I.idSyncDisableSyncs||I.disableIdSyncs)Y.idCallNotProcesssed=!0;else{Y.idCallNotProcesssed=!1;var c={};c.ibs=n.ibs,c.subdomain=n.subdomain,Y.processIDCallData(c)}if(n===Object(n)){var u,l;d()&&I.isAllowed()&&(u=I._getField("MCOPTOUT"));var f=V.parseOptOut(n,u,N);u=f.optOut,l=f.d_ottl,I._setFieldExpire("MCOPTOUT",l,!0),I._setField("MCOPTOUT",u),I._callAllCallbacks("MCOPTOUT",[u])}},I._loading=null,I._getRemoteField=function(e,t,n,i,r){var a,o="",s=B.isFirstPartyAnalyticsVisitorIDCall(e),c={MCAAMLH:!0,MCAAMB:!0};if(d()&&I.isAllowed()){I._readVisitor(),o=I._getField(e,!0===c[e]);if(function(){return(!o||I._fieldsExpired&&I._fieldsExpired[e])&&(!I.disableThirdPartyCalls||s)}()){if(e===E||"MCOPTOUT"===e?a=k:"MCAAMLH"===e||e===F?a=w:e===R&&(a=L),a)return!t||null!=I._loading&&I._loading[a]||(null==I._loading&&(I._loading={}),I._loading[a]=!0,a===w&&(D=0),I._loadData(a,t,function(t){if(!I._getField(e)){t&&q.setState(a,!0);var n="";e===E?n=I._generateLocalMID():a===w&&(n={error_msg:"timeout"}),I._setFields(a,n)}},r)),I._registerCallback(e,n),o||(t||I._setFields(a,{id:N}),"")}else o||(e===E?(I._registerCallback(e,n),o=I._generateLocalMID(),I.setMarketingCloudVisitorID(o)):e===R?(I._registerCallback(e,n),o="",I.setAnalyticsVisitorID(o)):(o="",i=!0))}return e!==E&&e!==R||o!==N||(o="",i=!0),n&&i&&I._callCallback(n,[o]),o},I._setMarketingCloudFields=function(e){I._readVisitor(),I._setFields(k,e)},I._mapCustomerIDs=function(e){I.getAudienceManagerBlob(e,!0)},I._setAnalyticsFields=function(e){I._readVisitor(),I._setFields(L,e)},I._setAudienceManagerFields=function(e){I._readVisitor(),I._setFields(w,e)},I._getAudienceManagerURLData=function(e){var t=I.audienceManagerServer,n="",i=I._getField(E),r=I._getField(F,!0),a=I._getField(R),o=a&&a!==N?"&d_cid_ic=AVID%01"+encodeURIComponent(a):"";if(I.loadSSL&&I.audienceManagerServerSecure&&(t=I.audienceManagerServerSecure),t){var s,c,u,l=I.getCustomerIDs(!0);if(l)for(c in l){var d=l[c];if(!V.isObjectEmpty(d)){var f="nameSpaces"===c?"&d_cid_ns=":"&d_cid_ic=";for(s in d)x(s)&&(u=d[s],o+=f+encodeURIComponent(s)+"%01"+encodeURIComponent(u.id?u.id:"")+(u.authState?"%01"+u.authState:""))}}e||(e="_setAudienceManagerFields");var p="http"+(I.loadSSL?"s":"")+"://"+t+"/id",g="d_visid_ver="+I.version+(v&&-1!==p.indexOf("demdex.net")?"&gdpr=1&gdpr_consent="+v:"")+(D&&-1!==p.indexOf("demdex.net")?"&d_cf="+D:"")+"&d_rtbd=json&d_ver=2"+(!i&&I._use1stPartyMarketingCloudServer?"&d_verify=1":"")+"&d_orgid="+encodeURIComponent(I.marketingCloudOrgID)+"&d_nsid="+(I.idSyncContainerID||0)+(i?"&d_mid="+encodeURIComponent(i):"")+(I.idSyncDisable3rdPartySyncing||I.disableThirdPartyCookies?"&d_coppa=true":"")+(!0===M?"&d_coop_safe=1":!1===M?"&d_coop_unsafe=1":"")+(r?"&d_blob="+encodeURIComponent(r):"")+o,m=["s_c_il",I._in,e];return n=p+"?"+g+"&d_cb=s_c_il%5B"+I._in+"%5D."+e,{url:n,corsUrl:p+"?"+g,callback:m}}return{url:n}},I.appendVisitorIDsTo=function(e){try{var t=[[E,I._getField(E)],[R,I._getField(R)],["MCORGID",I.marketingCloudOrgID]];return I._addQuerystringParam(e,ae.ADOBE_MC,c(t))}catch(t){return e}},I.appendSupplementalDataIDTo=function(e,t){if(!(t=t||I.getSupplementalDataID(B.generateRandomString(),!0)))return e;try{var n=c([["SDID",t],["MCORGID",I.marketingCloudOrgID]]);return I._addQuerystringParam(e,ae.ADOBE_MC_SDID,n)}catch(t){return e}};var B={parseHash:function(e){var t=e.indexOf("#");return t>0?e.substr(t):""},hashlessUrl:function(e){var t=e.indexOf("#");return t>0?e.substr(0,t):e},addQueryParamAtLocation:function(e,t,n){var i=e.split("&");return n=null!=n?n:i.length,i.splice(n,0,t),i.join("&")},isFirstPartyAnalyticsVisitorIDCall:function(e,t,n){if(e!==R)return!1;var i;return t||(t=I.trackingServer),n||(n=I.trackingServerSecure),!("string"!=typeof(i=I.loadSSL?n:t)||!i.length)&&(i.indexOf("2o7.net")<0&&i.indexOf("omtrdc.net")<0)},isObject:function(e){return Boolean(e&&e===Object(e))},removeCookie:function(e){$.remove(e,{domain:I.cookieDomain})},isTrackingServerPopulated:function(){return!!I.trackingServer||!!I.trackingServerSecure},getTimestampInSeconds:function(){return Math.round((new Date).getTime()/1e3)},parsePipeDelimetedKeyValues:function(e){return e.split("|").reduce(function(e,t){var n=t.split("=");return e[n[0]]=decodeURIComponent(n[1]),e},{})},generateRandomString:function(e){e=e||5;for(var t="",n="abcdefghijklmnopqrstuvwxyz0123456789";e--;)t+=n[Math.floor(Math.random()*n.length)];return t},normalizeBoolean:function(e){return"true"===e||"false"!==e&&e},parseBoolean:function(e){return"true"===e||"false"!==e&&null},replaceMethodsWithFunction:function(e,t){for(var n in e)e.hasOwnProperty(n)&&"function"==typeof e[n]&&(e[n]=t);return e}};I._helpers=B;var Y=oe(I,O);I._destinationPublishing=Y,I.timeoutMetricsLog=[];var q={isClientSideMarketingCloudVisitorID:null,MCIDCallTimedOut:null,AnalyticsIDCallTimedOut:null,AAMIDCallTimedOut:null,fieldGroupObj:{},setState:function(e,t){switch(e){case k:!1===t?!0!==this.MCIDCallTimedOut&&(this.MCIDCallTimedOut=!1):this.MCIDCallTimedOut=t;break;case L:!1===t?!0!==this.AnalyticsIDCallTimedOut&&(this.AnalyticsIDCallTimedOut=!1):this.AnalyticsIDCallTimedOut=t;break;case w:!1===t?!0!==this.AAMIDCallTimedOut&&(this.AAMIDCallTimedOut=!1):this.AAMIDCallTimedOut=t}}};I.isClientSideMarketingCloudVisitorID=function(){return q.isClientSideMarketingCloudVisitorID},I.MCIDCallTimedOut=function(){return q.MCIDCallTimedOut},I.AnalyticsIDCallTimedOut=function(){return q.AnalyticsIDCallTimedOut},I.AAMIDCallTimedOut=function(){return q.AAMIDCallTimedOut},I.idSyncGetOnPageSyncInfo=function(){return I._readVisitor(),I._getField("MCSYNCSOP")},I.idSyncByURL=function(e){if(!I.isOptedOut()){var t=u(e||{});if(t.error)return t.error;var n,i,r=e.url,a=encodeURIComponent,o=Y;return r=r.replace(/^https:/,"").replace(/^http:/,""),n=V.encodeAndBuildRequest(["",e.dpid,e.dpuuid||""],","),i=["ibs",a(e.dpid),"img",a(r),t.ttl,"",n],o.addMessage(i.join("|")),o.requestToProcess(),"Successfully queued"}},I.idSyncByDataSource=function(e){if(!I.isOptedOut())return e===Object(e)&&"string"==typeof e.dpuuid&&e.dpuuid.length?(e.url="//dpm.demdex.net/ibs:dpid="+e.dpid+"&dpuuid="+e.dpuuid,I.idSyncByURL(e)):"Error: config or config.dpuuid is empty"},Ge(I,Y),I._getCookieVersion=function(e){e=e||I.cookieRead(I.cookieName);var t=ae.VERSION_REGEX.exec(e);return t&&t.length>1?t[1]:null},I._resetAmcvCookie=function(e){var t=I._getCookieVersion();t&&!ee.isLessThan(t,e)||B.removeCookie(I.cookieName)},I.setAsCoopSafe=function(){M=!0},I.setAsCoopUnsafe=function(){M=!1},function(){if(I.configs=Object.create(null),B.isObject(n))for(var e in n)x(e)&&(I[e]=n[e],I.configs[e]=n[e])}(),f();var W;I.init=function(){l()&&(S.optIn.fetchPermissions(h,!0),!S.optIn.isApproved(S.optIn.Categories.ECID))||W||(W=!0,function(){if(B.isObject(n)){I.idSyncContainerID=I.idSyncContainerID||0,M="boolean"==typeof I.isCoopSafe?I.isCoopSafe:B.parseBoolean(I.isCoopSafe),I.resetBeforeVersion&&I._resetAmcvCookie(I.resetBeforeVersion),I._attemptToPopulateIdsFromUrl(),I._attemptToPopulateSdidFromUrl(),I._readVisitor();var e=I._getField(P),t=Math.ceil((new Date).getTime()/ae.MILLIS_PER_DAY);I.idSyncDisableSyncs||I.disableIdSyncs||!Y.canMakeSyncIDCall(e,t)||(I._setFieldExpire(F,-1),I._setField(P,t)),I.getMarketingCloudVisitorID(),I.getAudienceManagerLocationHint(),I.getAudienceManagerBlob(),I._mergeServerState(I.serverState)}else I._attemptToPopulateIdsFromUrl(),I._attemptToPopulateSdidFromUrl()}(),function(){if(!I.idSyncDisableSyncs&&!I.disableIdSyncs){Y.checkDPIframeSrc();var e=function(){var e=Y;e.readyToAttachIframe()&&e.attachIframe()};b.addEventListener("load",function(){O.windowLoaded=!0,e()});try{ne.receiveMessage(function(e){Y.receiveMessage(e.data)},Y.iframeHost)}catch(e){}}}(),function(){I.whitelistIframeDomains&&ae.POST_MESSAGE_ENABLED&&(I.whitelistIframeDomains=I.whitelistIframeDomains instanceof Array?I.whitelistIframeDomains:[I.whitelistIframeDomains],I.whitelistIframeDomains.forEach(function(e){var n=new G(t,e),i=z(I,n);ne.receiveMessage(i,e)}))}())}};Ke.config=ce,C.Visitor=Ke;var Je=Ke,ze=function(e){if(V.isObject(e))return Object.keys(e).filter(function(t){return""!==e[t]}).reduce(function(t,n){var i=ce.normalizeConfig(e[n]),r=V.normalizeBoolean(i);return t[n]=r,t},Object.create(null))},Qe=Be.OptIn,$e=Be.IabPlugin;return Je.getInstance=function(e,t){if(!e)throw new Error("Visitor requires Adobe Marketing Cloud Org ID.");e.indexOf("@")<0&&(e+="@AdobeOrg");var n=function(){var t=C.s_c_il;if(t)for(var n=0;n<t.length;n++){var i=t[n];if(i&&"Visitor"===i._c&&i.marketingCloudOrgID===e)return i}}();if(n)return n;var i=ze(t);!function(e){C.adobe.optIn=C.adobe.optIn||function(){var t=V.pluck(e,["doesOptInApply","previousPermissions","preOptInApprovals","isOptInStorageEnabled","optInStorageExpiry","isIabContext"]),n=e.optInCookieDomain||e.cookieDomain;n=n||Z(),n=n===window.location.hostname?"":n,t.optInCookieDomain=n;var i=new Qe(t,{cookies:$});if(t.isIabContext&&t.doesOptInApply){var r=new $e;i.registerPlugin(r)}return i}()}(i||{});var r=e,a=r.split("").reverse().join(""),o=new Je(e,null,a);V.isObject(i)&&i.cookieDomain&&(o.cookieDomain=i.cookieDomain),function(){C.s_c_il.splice(--C.s_c_in,1)}();var s=V.getIeVersion();if("number"==typeof s&&s<10)return o._helpers.replaceMethodsWithFunction(o,function(){});var c=function(){try{return C.self!==C.parent}catch(e){return!0}}()&&!function(e){return e.cookieWrite("TEST_AMCV_COOKIE","T",1),"T"===e.cookieRead("TEST_AMCV_COOKIE")&&(e._helpers.removeCookie("TEST_AMCV_COOKIE"),!0)}(o)&&C.parent?new q(e,i,o,C.parent):new Je(e,i,a);return o=null,c.init(),c},function(){function e(){Je.windowLoaded=!0}C.addEventListener?C.addEventListener("load",e):C.attachEvent&&C.attachEvent("onload",e),Je.codeLoadEnd=(new Date).getTime()}(),Je}();
  return Visitor;
}();

          }

        },
        "adobe-mcid/src/view/utils/timeUnits.js": {
          "script": function(module, exports, require, turbine) {
/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2018 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

var timeUnits = {
  Hours: 3600,
  Days: 24 * 3600,
  Weeks: 7 * 24 * 3600,
  Months: 30 * 24 * 3600,
  Years: 365 * 24 * 3600
};

module.exports = timeUnits;

          }

        }
      },
      "settings": {
        "orgId": "97D1F3F459CE0AD80A495CBE@AdobeOrg"
      },
      "hostedLibFilesBaseUrl": "/perf/js/1281f6ff0c59/4bbb6b9dc376/15a347b44599/hostedLibFiles/EP6437fa78ab024946a211397689052381/"
    }
  },
  "company": {
    "orgId": "97D1F3F459CE0AD80A495CBE@AdobeOrg"
  },
  "property": {
    "name": "alloyio.com [perf w/ old libs]",
    "settings": {
      "domains": [
        "alloyio.com"
      ],
      "undefinedVarsReturnEmpty": false,
      "ruleComponentSequencingEnabled": false
    }
  },
  "rules": [
    {
      "id": "RL2ac704b71a794c04a2b33cc91ac1641b",
      "name": "Send Beacons",
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
          "modulePath": "adobe-target-v2/lib/loadTarget.js",
          "settings": {
          }
        },
        {
          "modulePath": "adobe-target-v2/lib/firePageLoad.js",
          "settings": {
            "bodyHiddenStyle": "body {opacity: 0}",
            "bodyHidingEnabled": true
          }
        },
        {
          "modulePath": "adobe-analytics/src/lib/actions/sendBeacon.js",
          "settings": {
            "type": "page"
          }
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


