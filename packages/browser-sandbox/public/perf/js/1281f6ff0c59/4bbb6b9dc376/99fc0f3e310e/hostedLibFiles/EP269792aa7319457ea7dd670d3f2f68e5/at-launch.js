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
