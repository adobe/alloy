(function () {
  const l = document.createElement("link").relList;
  if (l && l.supports && l.supports("modulepreload")) return;
  for (const f of document.querySelectorAll('link[rel="modulepreload"]')) a(f);
  new MutationObserver((f) => {
    for (const h of f)
      if (h.type === "childList")
        for (const g of h.addedNodes)
          g.tagName === "LINK" && g.rel === "modulepreload" && a(g);
  }).observe(document, { childList: !0, subtree: !0 });
  function c(f) {
    const h = {};
    return (
      f.integrity && (h.integrity = f.integrity),
      f.referrerPolicy && (h.referrerPolicy = f.referrerPolicy),
      f.crossOrigin === "use-credentials"
        ? (h.credentials = "include")
        : f.crossOrigin === "anonymous"
          ? (h.credentials = "omit")
          : (h.credentials = "same-origin"),
      h
    );
  }
  function a(f) {
    if (f.ep) return;
    f.ep = !0;
    const h = c(f);
    fetch(f.href, h);
  }
})();
function cn(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default")
    ? i.default
    : i;
}
var Ul = { exports: {} },
  Fn = {};
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/ var Bl, rc;
function Qo() {
  if (rc) return Bl;
  rc = 1;
  var i = Object.getOwnPropertySymbols,
    l = Object.prototype.hasOwnProperty,
    c = Object.prototype.propertyIsEnumerable;
  function a(h) {
    if (h == null)
      throw new TypeError(
        "Object.assign cannot be called with null or undefined",
      );
    return Object(h);
  }
  function f() {
    try {
      if (!Object.assign) return !1;
      var h = new String("abc");
      if (((h[5] = "de"), Object.getOwnPropertyNames(h)[0] === "5")) return !1;
      for (var g = {}, y = 0; y < 10; y++) g["_" + String.fromCharCode(y)] = y;
      var m = Object.getOwnPropertyNames(g).map(function (C) {
        return g[C];
      });
      if (m.join("") !== "0123456789") return !1;
      var x = {};
      return (
        "abcdefghijklmnopqrst".split("").forEach(function (C) {
          x[C] = C;
        }),
        Object.keys(Object.assign({}, x)).join("") === "abcdefghijklmnopqrst"
      );
    } catch {
      return !1;
    }
  }
  return (
    (Bl = f()
      ? Object.assign
      : function (h, g) {
          for (var y, m = a(h), x, C = 1; C < arguments.length; C++) {
            y = Object(arguments[C]);
            for (var j in y) l.call(y, j) && (m[j] = y[j]);
            if (i) {
              x = i(y);
              for (var P = 0; P < x.length; P++)
                c.call(y, x[P]) && (m[x[P]] = y[x[P]]);
            }
          }
          return m;
        }),
    Bl
  );
}
var Wl = { exports: {} },
  xe = {};
/** @license React v17.0.2
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var oc;
function gp() {
  if (oc) return xe;
  oc = 1;
  var i = Qo(),
    l = 60103,
    c = 60106;
  (xe.Fragment = 60107), (xe.StrictMode = 60108), (xe.Profiler = 60114);
  var a = 60109,
    f = 60110,
    h = 60112;
  xe.Suspense = 60113;
  var g = 60115,
    y = 60116;
  if (typeof Symbol == "function" && Symbol.for) {
    var m = Symbol.for;
    (l = m("react.element")),
      (c = m("react.portal")),
      (xe.Fragment = m("react.fragment")),
      (xe.StrictMode = m("react.strict_mode")),
      (xe.Profiler = m("react.profiler")),
      (a = m("react.provider")),
      (f = m("react.context")),
      (h = m("react.forward_ref")),
      (xe.Suspense = m("react.suspense")),
      (g = m("react.memo")),
      (y = m("react.lazy"));
  }
  var x = typeof Symbol == "function" && Symbol.iterator;
  function C(T) {
    return T === null || typeof T != "object"
      ? null
      : ((T = (x && T[x]) || T["@@iterator"]),
        typeof T == "function" ? T : null);
  }
  function j(T) {
    for (
      var M = "https://reactjs.org/docs/error-decoder.html?invariant=" + T,
        B = 1;
      B < arguments.length;
      B++
    )
      M += "&args[]=" + encodeURIComponent(arguments[B]);
    return (
      "Minified React error #" +
      T +
      "; visit " +
      M +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  var P = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    R = {};
  function U(T, M, B) {
    (this.props = T),
      (this.context = M),
      (this.refs = R),
      (this.updater = B || P);
  }
  (U.prototype.isReactComponent = {}),
    (U.prototype.setState = function (T, M) {
      if (typeof T != "object" && typeof T != "function" && T != null)
        throw Error(j(85));
      this.updater.enqueueSetState(this, T, M, "setState");
    }),
    (U.prototype.forceUpdate = function (T) {
      this.updater.enqueueForceUpdate(this, T, "forceUpdate");
    });
  function G() {}
  G.prototype = U.prototype;
  function Y(T, M, B) {
    (this.props = T),
      (this.context = M),
      (this.refs = R),
      (this.updater = B || P);
  }
  var I = (Y.prototype = new G());
  (I.constructor = Y), i(I, U.prototype), (I.isPureReactComponent = !0);
  var z = { current: null },
    F = Object.prototype.hasOwnProperty,
    te = { key: !0, ref: !0, __self: !0, __source: !0 };
  function N(T, M, B) {
    var W,
      k = {},
      O = null,
      b = null;
    if (M != null)
      for (W in (M.ref !== void 0 && (b = M.ref),
      M.key !== void 0 && (O = "" + M.key),
      M))
        F.call(M, W) && !te.hasOwnProperty(W) && (k[W] = M[W]);
    var J = arguments.length - 2;
    if (J === 1) k.children = B;
    else if (1 < J) {
      for (var X = Array(J), we = 0; we < J; we++) X[we] = arguments[we + 2];
      k.children = X;
    }
    if (T && T.defaultProps)
      for (W in ((J = T.defaultProps), J)) k[W] === void 0 && (k[W] = J[W]);
    return {
      $$typeof: l,
      type: T,
      key: O,
      ref: b,
      props: k,
      _owner: z.current,
    };
  }
  function V(T, M) {
    return {
      $$typeof: l,
      type: T.type,
      key: M,
      ref: T.ref,
      props: T.props,
      _owner: T._owner,
    };
  }
  function Z(T) {
    return typeof T == "object" && T !== null && T.$$typeof === l;
  }
  function $(T) {
    var M = { "=": "=0", ":": "=2" };
    return (
      "$" +
      T.replace(/[=:]/g, function (B) {
        return M[B];
      })
    );
  }
  var ue = /\/+/g;
  function ne(T, M) {
    return typeof T == "object" && T !== null && T.key != null
      ? $("" + T.key)
      : M.toString(36);
  }
  function ce(T, M, B, W, k) {
    var O = typeof T;
    (O === "undefined" || O === "boolean") && (T = null);
    var b = !1;
    if (T === null) b = !0;
    else
      switch (O) {
        case "string":
        case "number":
          b = !0;
          break;
        case "object":
          switch (T.$$typeof) {
            case l:
            case c:
              b = !0;
          }
      }
    if (b)
      return (
        (b = T),
        (k = k(b)),
        (T = W === "" ? "." + ne(b, 0) : W),
        Array.isArray(k)
          ? ((B = ""),
            T != null && (B = T.replace(ue, "$&/") + "/"),
            ce(k, M, B, "", function (we) {
              return we;
            }))
          : k != null &&
            (Z(k) &&
              (k = V(
                k,
                B +
                  (!k.key || (b && b.key === k.key)
                    ? ""
                    : ("" + k.key).replace(ue, "$&/") + "/") +
                  T,
              )),
            M.push(k)),
        1
      );
    if (((b = 0), (W = W === "" ? "." : W + ":"), Array.isArray(T)))
      for (var J = 0; J < T.length; J++) {
        O = T[J];
        var X = W + ne(O, J);
        b += ce(O, M, B, X, k);
      }
    else if (((X = C(T)), typeof X == "function"))
      for (T = X.call(T), J = 0; !(O = T.next()).done; )
        (O = O.value), (X = W + ne(O, J++)), (b += ce(O, M, B, X, k));
    else if (O === "object")
      throw (
        ((M = "" + T),
        Error(
          j(
            31,
            M === "[object Object]"
              ? "object with keys {" + Object.keys(T).join(", ") + "}"
              : M,
          ),
        ))
      );
    return b;
  }
  function ee(T, M, B) {
    if (T == null) return T;
    var W = [],
      k = 0;
    return (
      ce(T, W, "", "", function (O) {
        return M.call(B, O, k++);
      }),
      W
    );
  }
  function oe(T) {
    if (T._status === -1) {
      var M = T._result;
      (M = M()),
        (T._status = 0),
        (T._result = M),
        M.then(
          function (B) {
            T._status === 0 &&
              ((B = B.default), (T._status = 1), (T._result = B));
          },
          function (B) {
            T._status === 0 && ((T._status = 2), (T._result = B));
          },
        );
    }
    if (T._status === 1) return T._result;
    throw T._result;
  }
  var ye = { current: null };
  function se() {
    var T = ye.current;
    if (T === null) throw Error(j(321));
    return T;
  }
  var Oe = {
    ReactCurrentDispatcher: ye,
    ReactCurrentBatchConfig: { transition: 0 },
    ReactCurrentOwner: z,
    IsSomeRendererActing: { current: !1 },
    assign: i,
  };
  return (
    (xe.Children = {
      map: ee,
      forEach: function (T, M, B) {
        ee(
          T,
          function () {
            M.apply(this, arguments);
          },
          B,
        );
      },
      count: function (T) {
        var M = 0;
        return (
          ee(T, function () {
            M++;
          }),
          M
        );
      },
      toArray: function (T) {
        return (
          ee(T, function (M) {
            return M;
          }) || []
        );
      },
      only: function (T) {
        if (!Z(T)) throw Error(j(143));
        return T;
      },
    }),
    (xe.Component = U),
    (xe.PureComponent = Y),
    (xe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Oe),
    (xe.cloneElement = function (T, M, B) {
      if (T == null) throw Error(j(267, T));
      var W = i({}, T.props),
        k = T.key,
        O = T.ref,
        b = T._owner;
      if (M != null) {
        if (
          (M.ref !== void 0 && ((O = M.ref), (b = z.current)),
          M.key !== void 0 && (k = "" + M.key),
          T.type && T.type.defaultProps)
        )
          var J = T.type.defaultProps;
        for (X in M)
          F.call(M, X) &&
            !te.hasOwnProperty(X) &&
            (W[X] = M[X] === void 0 && J !== void 0 ? J[X] : M[X]);
      }
      var X = arguments.length - 2;
      if (X === 1) W.children = B;
      else if (1 < X) {
        J = Array(X);
        for (var we = 0; we < X; we++) J[we] = arguments[we + 2];
        W.children = J;
      }
      return { $$typeof: l, type: T.type, key: k, ref: O, props: W, _owner: b };
    }),
    (xe.createContext = function (T, M) {
      return (
        M === void 0 && (M = null),
        (T = {
          $$typeof: f,
          _calculateChangedBits: M,
          _currentValue: T,
          _currentValue2: T,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
        }),
        (T.Provider = { $$typeof: a, _context: T }),
        (T.Consumer = T)
      );
    }),
    (xe.createElement = N),
    (xe.createFactory = function (T) {
      var M = N.bind(null, T);
      return (M.type = T), M;
    }),
    (xe.createRef = function () {
      return { current: null };
    }),
    (xe.forwardRef = function (T) {
      return { $$typeof: h, render: T };
    }),
    (xe.isValidElement = Z),
    (xe.lazy = function (T) {
      return { $$typeof: y, _payload: { _status: -1, _result: T }, _init: oe };
    }),
    (xe.memo = function (T, M) {
      return { $$typeof: g, type: T, compare: M === void 0 ? null : M };
    }),
    (xe.useCallback = function (T, M) {
      return se().useCallback(T, M);
    }),
    (xe.useContext = function (T, M) {
      return se().useContext(T, M);
    }),
    (xe.useDebugValue = function () {}),
    (xe.useEffect = function (T, M) {
      return se().useEffect(T, M);
    }),
    (xe.useImperativeHandle = function (T, M, B) {
      return se().useImperativeHandle(T, M, B);
    }),
    (xe.useLayoutEffect = function (T, M) {
      return se().useLayoutEffect(T, M);
    }),
    (xe.useMemo = function (T, M) {
      return se().useMemo(T, M);
    }),
    (xe.useReducer = function (T, M, B) {
      return se().useReducer(T, M, B);
    }),
    (xe.useRef = function (T) {
      return se().useRef(T);
    }),
    (xe.useState = function (T) {
      return se().useState(T);
    }),
    (xe.version = "17.0.2"),
    xe
  );
}
var ic;
function Jo() {
  return ic || ((ic = 1), (Wl.exports = gp())), Wl.exports;
}
/** @license React v17.0.2
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var lc;
function wp() {
  if (lc) return Fn;
  (lc = 1), Qo();
  var i = Jo(),
    l = 60103;
  if (((Fn.Fragment = 60107), typeof Symbol == "function" && Symbol.for)) {
    var c = Symbol.for;
    (l = c("react.element")), (Fn.Fragment = c("react.fragment"));
  }
  var a =
      i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    f = Object.prototype.hasOwnProperty,
    h = { key: !0, ref: !0, __self: !0, __source: !0 };
  function g(y, m, x) {
    var C,
      j = {},
      P = null,
      R = null;
    x !== void 0 && (P = "" + x),
      m.key !== void 0 && (P = "" + m.key),
      m.ref !== void 0 && (R = m.ref);
    for (C in m) f.call(m, C) && !h.hasOwnProperty(C) && (j[C] = m[C]);
    if (y && y.defaultProps)
      for (C in ((m = y.defaultProps), m)) j[C] === void 0 && (j[C] = m[C]);
    return {
      $$typeof: l,
      type: y,
      key: P,
      ref: R,
      props: j,
      _owner: a.current,
    };
  }
  return (Fn.jsx = g), (Fn.jsxs = g), Fn;
}
var sc;
function xp() {
  return sc || ((sc = 1), (Ul.exports = wp())), Ul.exports;
}
var u = xp(),
  me = Jo();
const ve = cn(me);
var Vl = { exports: {} },
  nt = {},
  Hl = { exports: {} },
  $l = {};
/** @license React v0.20.2
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ac;
function Cp() {
  return (
    ac ||
      ((ac = 1),
      (function (i) {
        var l, c, a, f;
        if (
          typeof performance == "object" &&
          typeof performance.now == "function"
        ) {
          var h = performance;
          i.unstable_now = function () {
            return h.now();
          };
        } else {
          var g = Date,
            y = g.now();
          i.unstable_now = function () {
            return g.now() - y;
          };
        }
        if (typeof window > "u" || typeof MessageChannel != "function") {
          var m = null,
            x = null,
            C = function () {
              if (m !== null)
                try {
                  var k = i.unstable_now();
                  m(!0, k), (m = null);
                } catch (O) {
                  throw (setTimeout(C, 0), O);
                }
            };
          (l = function (k) {
            m !== null ? setTimeout(l, 0, k) : ((m = k), setTimeout(C, 0));
          }),
            (c = function (k, O) {
              x = setTimeout(k, O);
            }),
            (a = function () {
              clearTimeout(x);
            }),
            (i.unstable_shouldYield = function () {
              return !1;
            }),
            (f = i.unstable_forceFrameRate = function () {});
        } else {
          var j = window.setTimeout,
            P = window.clearTimeout;
          if (typeof console < "u") {
            var R = window.cancelAnimationFrame;
            typeof window.requestAnimationFrame != "function" &&
              console.error(
                "This browser doesn't support requestAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills",
              ),
              typeof R != "function" &&
                console.error(
                  "This browser doesn't support cancelAnimationFrame. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills",
                );
          }
          var U = !1,
            G = null,
            Y = -1,
            I = 5,
            z = 0;
          (i.unstable_shouldYield = function () {
            return i.unstable_now() >= z;
          }),
            (f = function () {}),
            (i.unstable_forceFrameRate = function (k) {
              0 > k || 125 < k
                ? console.error(
                    "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                  )
                : (I = 0 < k ? Math.floor(1e3 / k) : 5);
            });
          var F = new MessageChannel(),
            te = F.port2;
          (F.port1.onmessage = function () {
            if (G !== null) {
              var k = i.unstable_now();
              z = k + I;
              try {
                G(!0, k) ? te.postMessage(null) : ((U = !1), (G = null));
              } catch (O) {
                throw (te.postMessage(null), O);
              }
            } else U = !1;
          }),
            (l = function (k) {
              (G = k), U || ((U = !0), te.postMessage(null));
            }),
            (c = function (k, O) {
              Y = j(function () {
                k(i.unstable_now());
              }, O);
            }),
            (a = function () {
              P(Y), (Y = -1);
            });
        }
        function N(k, O) {
          var b = k.length;
          k.push(O);
          e: for (;;) {
            var J = (b - 1) >>> 1,
              X = k[J];
            if (X !== void 0 && 0 < $(X, O)) (k[J] = O), (k[b] = X), (b = J);
            else break e;
          }
        }
        function V(k) {
          return (k = k[0]), k === void 0 ? null : k;
        }
        function Z(k) {
          var O = k[0];
          if (O !== void 0) {
            var b = k.pop();
            if (b !== O) {
              k[0] = b;
              e: for (var J = 0, X = k.length; J < X; ) {
                var we = 2 * (J + 1) - 1,
                  Ee = k[we],
                  Me = we + 1,
                  Ye = k[Me];
                if (Ee !== void 0 && 0 > $(Ee, b))
                  Ye !== void 0 && 0 > $(Ye, Ee)
                    ? ((k[J] = Ye), (k[Me] = b), (J = Me))
                    : ((k[J] = Ee), (k[we] = b), (J = we));
                else if (Ye !== void 0 && 0 > $(Ye, b))
                  (k[J] = Ye), (k[Me] = b), (J = Me);
                else break e;
              }
            }
            return O;
          }
          return null;
        }
        function $(k, O) {
          var b = k.sortIndex - O.sortIndex;
          return b !== 0 ? b : k.id - O.id;
        }
        var ue = [],
          ne = [],
          ce = 1,
          ee = null,
          oe = 3,
          ye = !1,
          se = !1,
          Oe = !1;
        function T(k) {
          for (var O = V(ne); O !== null; ) {
            if (O.callback === null) Z(ne);
            else if (O.startTime <= k)
              Z(ne), (O.sortIndex = O.expirationTime), N(ue, O);
            else break;
            O = V(ne);
          }
        }
        function M(k) {
          if (((Oe = !1), T(k), !se))
            if (V(ue) !== null) (se = !0), l(B);
            else {
              var O = V(ne);
              O !== null && c(M, O.startTime - k);
            }
        }
        function B(k, O) {
          (se = !1), Oe && ((Oe = !1), a()), (ye = !0);
          var b = oe;
          try {
            for (
              T(O), ee = V(ue);
              ee !== null &&
              (!(ee.expirationTime > O) || (k && !i.unstable_shouldYield()));

            ) {
              var J = ee.callback;
              if (typeof J == "function") {
                (ee.callback = null), (oe = ee.priorityLevel);
                var X = J(ee.expirationTime <= O);
                (O = i.unstable_now()),
                  typeof X == "function"
                    ? (ee.callback = X)
                    : ee === V(ue) && Z(ue),
                  T(O);
              } else Z(ue);
              ee = V(ue);
            }
            if (ee !== null) var we = !0;
            else {
              var Ee = V(ne);
              Ee !== null && c(M, Ee.startTime - O), (we = !1);
            }
            return we;
          } finally {
            (ee = null), (oe = b), (ye = !1);
          }
        }
        var W = f;
        (i.unstable_IdlePriority = 5),
          (i.unstable_ImmediatePriority = 1),
          (i.unstable_LowPriority = 4),
          (i.unstable_NormalPriority = 3),
          (i.unstable_Profiling = null),
          (i.unstable_UserBlockingPriority = 2),
          (i.unstable_cancelCallback = function (k) {
            k.callback = null;
          }),
          (i.unstable_continueExecution = function () {
            se || ye || ((se = !0), l(B));
          }),
          (i.unstable_getCurrentPriorityLevel = function () {
            return oe;
          }),
          (i.unstable_getFirstCallbackNode = function () {
            return V(ue);
          }),
          (i.unstable_next = function (k) {
            switch (oe) {
              case 1:
              case 2:
              case 3:
                var O = 3;
                break;
              default:
                O = oe;
            }
            var b = oe;
            oe = O;
            try {
              return k();
            } finally {
              oe = b;
            }
          }),
          (i.unstable_pauseExecution = function () {}),
          (i.unstable_requestPaint = W),
          (i.unstable_runWithPriority = function (k, O) {
            switch (k) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                k = 3;
            }
            var b = oe;
            oe = k;
            try {
              return O();
            } finally {
              oe = b;
            }
          }),
          (i.unstable_scheduleCallback = function (k, O, b) {
            var J = i.unstable_now();
            switch (
              (typeof b == "object" && b !== null
                ? ((b = b.delay),
                  (b = typeof b == "number" && 0 < b ? J + b : J))
                : (b = J),
              k)
            ) {
              case 1:
                var X = -1;
                break;
              case 2:
                X = 250;
                break;
              case 5:
                X = 1073741823;
                break;
              case 4:
                X = 1e4;
                break;
              default:
                X = 5e3;
            }
            return (
              (X = b + X),
              (k = {
                id: ce++,
                callback: O,
                priorityLevel: k,
                startTime: b,
                expirationTime: X,
                sortIndex: -1,
              }),
              b > J
                ? ((k.sortIndex = b),
                  N(ne, k),
                  V(ue) === null &&
                    k === V(ne) &&
                    (Oe ? a() : (Oe = !0), c(M, b - J)))
                : ((k.sortIndex = X), N(ue, k), se || ye || ((se = !0), l(B))),
              k
            );
          }),
          (i.unstable_wrapCallback = function (k) {
            var O = oe;
            return function () {
              var b = oe;
              oe = O;
              try {
                return k.apply(this, arguments);
              } finally {
                oe = b;
              }
            };
          });
      })($l)),
    $l
  );
}
var uc;
function Ep() {
  return uc || ((uc = 1), (Hl.exports = Cp())), Hl.exports;
}
/** @license React v17.0.2
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var cc;
function Sp() {
  if (cc) return nt;
  cc = 1;
  var i = Jo(),
    l = Qo(),
    c = Ep();
  function a(e) {
    for (
      var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e,
        n = 1;
      n < arguments.length;
      n++
    )
      t += "&args[]=" + encodeURIComponent(arguments[n]);
    return (
      "Minified React error #" +
      e +
      "; visit " +
      t +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  if (!i) throw Error(a(227));
  var f = new Set(),
    h = {};
  function g(e, t) {
    y(e, t), y(e + "Capture", t);
  }
  function y(e, t) {
    for (h[e] = t, e = 0; e < t.length; e++) f.add(t[e]);
  }
  var m = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    x =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    C = Object.prototype.hasOwnProperty,
    j = {},
    P = {};
  function R(e) {
    return C.call(P, e)
      ? !0
      : C.call(j, e)
        ? !1
        : x.test(e)
          ? (P[e] = !0)
          : ((j[e] = !0), !1);
  }
  function U(e, t, n, r) {
    if (n !== null && n.type === 0) return !1;
    switch (typeof t) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return r
          ? !1
          : n !== null
            ? !n.acceptsBooleans
            : ((e = e.toLowerCase().slice(0, 5)),
              e !== "data-" && e !== "aria-");
      default:
        return !1;
    }
  }
  function G(e, t, n, r) {
    if (t === null || typeof t > "u" || U(e, t, n, r)) return !0;
    if (r) return !1;
    if (n !== null)
      switch (n.type) {
        case 3:
          return !t;
        case 4:
          return t === !1;
        case 5:
          return isNaN(t);
        case 6:
          return isNaN(t) || 1 > t;
      }
    return !1;
  }
  function Y(e, t, n, r, o, s, d) {
    (this.acceptsBooleans = t === 2 || t === 3 || t === 4),
      (this.attributeName = r),
      (this.attributeNamespace = o),
      (this.mustUseProperty = n),
      (this.propertyName = e),
      (this.type = t),
      (this.sanitizeURL = s),
      (this.removeEmptyString = d);
  }
  var I = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
    .split(" ")
    .forEach(function (e) {
      I[e] = new Y(e, 0, !1, e, null, !1, !1);
    }),
    [
      ["acceptCharset", "accept-charset"],
      ["className", "class"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
    ].forEach(function (e) {
      var t = e[0];
      I[t] = new Y(t, 1, !1, e[1], null, !1, !1);
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(
      function (e) {
        I[e] = new Y(e, 2, !1, e.toLowerCase(), null, !1, !1);
      },
    ),
    [
      "autoReverse",
      "externalResourcesRequired",
      "focusable",
      "preserveAlpha",
    ].forEach(function (e) {
      I[e] = new Y(e, 2, !1, e, null, !1, !1);
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
      .split(" ")
      .forEach(function (e) {
        I[e] = new Y(e, 3, !1, e.toLowerCase(), null, !1, !1);
      }),
    ["checked", "multiple", "muted", "selected"].forEach(function (e) {
      I[e] = new Y(e, 3, !0, e, null, !1, !1);
    }),
    ["capture", "download"].forEach(function (e) {
      I[e] = new Y(e, 4, !1, e, null, !1, !1);
    }),
    ["cols", "rows", "size", "span"].forEach(function (e) {
      I[e] = new Y(e, 6, !1, e, null, !1, !1);
    }),
    ["rowSpan", "start"].forEach(function (e) {
      I[e] = new Y(e, 5, !1, e.toLowerCase(), null, !1, !1);
    });
  var z = /[\-:]([a-z])/g;
  function F(e) {
    return e[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
    .split(" ")
    .forEach(function (e) {
      var t = e.replace(z, F);
      I[t] = new Y(t, 1, !1, e, null, !1, !1);
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
      .split(" ")
      .forEach(function (e) {
        var t = e.replace(z, F);
        I[t] = new Y(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
      }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
      var t = e.replace(z, F);
      I[t] = new Y(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
    }),
    ["tabIndex", "crossOrigin"].forEach(function (e) {
      I[e] = new Y(e, 1, !1, e.toLowerCase(), null, !1, !1);
    }),
    (I.xlinkHref = new Y(
      "xlinkHref",
      1,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1,
    )),
    ["src", "href", "action", "formAction"].forEach(function (e) {
      I[e] = new Y(e, 1, !1, e.toLowerCase(), null, !0, !0);
    });
  function te(e, t, n, r) {
    var o = I.hasOwnProperty(t) ? I[t] : null,
      s =
        o !== null
          ? o.type === 0
          : r
            ? !1
            : !(
                !(2 < t.length) ||
                (t[0] !== "o" && t[0] !== "O") ||
                (t[1] !== "n" && t[1] !== "N")
              );
    s ||
      (G(t, n, o, r) && (n = null),
      r || o === null
        ? R(t) &&
          (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
        : o.mustUseProperty
          ? (e[o.propertyName] = n === null ? (o.type === 3 ? !1 : "") : n)
          : ((t = o.attributeName),
            (r = o.attributeNamespace),
            n === null
              ? e.removeAttribute(t)
              : ((o = o.type),
                (n = o === 3 || (o === 4 && n === !0) ? "" : "" + n),
                r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
  }
  var N = i.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    V = 60103,
    Z = 60106,
    $ = 60107,
    ue = 60108,
    ne = 60114,
    ce = 60109,
    ee = 60110,
    oe = 60112,
    ye = 60113,
    se = 60120,
    Oe = 60115,
    T = 60116,
    M = 60121,
    B = 60128,
    W = 60129,
    k = 60130,
    O = 60131;
  if (typeof Symbol == "function" && Symbol.for) {
    var b = Symbol.for;
    (V = b("react.element")),
      (Z = b("react.portal")),
      ($ = b("react.fragment")),
      (ue = b("react.strict_mode")),
      (ne = b("react.profiler")),
      (ce = b("react.provider")),
      (ee = b("react.context")),
      (oe = b("react.forward_ref")),
      (ye = b("react.suspense")),
      (se = b("react.suspense_list")),
      (Oe = b("react.memo")),
      (T = b("react.lazy")),
      (M = b("react.block")),
      b("react.scope"),
      (B = b("react.opaque.id")),
      (W = b("react.debug_trace_mode")),
      (k = b("react.offscreen")),
      (O = b("react.legacy_hidden"));
  }
  var J = typeof Symbol == "function" && Symbol.iterator;
  function X(e) {
    return e === null || typeof e != "object"
      ? null
      : ((e = (J && e[J]) || e["@@iterator"]),
        typeof e == "function" ? e : null);
  }
  var we;
  function Ee(e) {
    if (we === void 0)
      try {
        throw Error();
      } catch (n) {
        var t = n.stack.trim().match(/\n( *(at )?)/);
        we = (t && t[1]) || "";
      }
    return (
      `
` +
      we +
      e
    );
  }
  var Me = !1;
  function Ye(e, t) {
    if (!e || Me) return "";
    Me = !0;
    var n = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (t)
        if (
          ((t = function () {
            throw Error();
          }),
          Object.defineProperty(t.prototype, "props", {
            set: function () {
              throw Error();
            },
          }),
          typeof Reflect == "object" && Reflect.construct)
        ) {
          try {
            Reflect.construct(t, []);
          } catch (v) {
            var r = v;
          }
          Reflect.construct(e, [], t);
        } else {
          try {
            t.call();
          } catch (v) {
            r = v;
          }
          e.call(t.prototype);
        }
      else {
        try {
          throw Error();
        } catch (v) {
          r = v;
        }
        e();
      }
    } catch (v) {
      if (v && r && typeof v.stack == "string") {
        for (
          var o = v.stack.split(`
`),
            s = r.stack.split(`
`),
            d = o.length - 1,
            p = s.length - 1;
          1 <= d && 0 <= p && o[d] !== s[p];

        )
          p--;
        for (; 1 <= d && 0 <= p; d--, p--)
          if (o[d] !== s[p]) {
            if (d !== 1 || p !== 1)
              do
                if ((d--, p--, 0 > p || o[d] !== s[p]))
                  return (
                    `
` + o[d].replace(" at new ", " at ")
                  );
              while (1 <= d && 0 <= p);
            break;
          }
      }
    } finally {
      (Me = !1), (Error.prepareStackTrace = n);
    }
    return (e = e ? e.displayName || e.name : "") ? Ee(e) : "";
  }
  function jd(e) {
    switch (e.tag) {
      case 5:
        return Ee(e.type);
      case 16:
        return Ee("Lazy");
      case 13:
        return Ee("Suspense");
      case 19:
        return Ee("SuspenseList");
      case 0:
      case 2:
      case 15:
        return (e = Ye(e.type, !1)), e;
      case 11:
        return (e = Ye(e.type.render, !1)), e;
      case 22:
        return (e = Ye(e.type._render, !1)), e;
      case 1:
        return (e = Ye(e.type, !0)), e;
      default:
        return "";
    }
  }
  function fn(e) {
    if (e == null) return null;
    if (typeof e == "function") return e.displayName || e.name || null;
    if (typeof e == "string") return e;
    switch (e) {
      case $:
        return "Fragment";
      case Z:
        return "Portal";
      case ne:
        return "Profiler";
      case ue:
        return "StrictMode";
      case ye:
        return "Suspense";
      case se:
        return "SuspenseList";
    }
    if (typeof e == "object")
      switch (e.$$typeof) {
        case ee:
          return (e.displayName || "Context") + ".Consumer";
        case ce:
          return (e._context.displayName || "Context") + ".Provider";
        case oe:
          var t = e.render;
          return (
            (t = t.displayName || t.name || ""),
            e.displayName || (t !== "" ? "ForwardRef(" + t + ")" : "ForwardRef")
          );
        case Oe:
          return fn(e.type);
        case M:
          return fn(e._render);
        case T:
          (t = e._payload), (e = e._init);
          try {
            return fn(e(t));
          } catch {}
      }
    return null;
  }
  function Pt(e) {
    switch (typeof e) {
      case "boolean":
      case "number":
      case "object":
      case "string":
      case "undefined":
        return e;
      default:
        return "";
    }
  }
  function Ss(e) {
    var t = e.type;
    return (
      (e = e.nodeName) &&
      e.toLowerCase() === "input" &&
      (t === "checkbox" || t === "radio")
    );
  }
  function kd(e) {
    var t = Ss(e) ? "checked" : "value",
      n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
      r = "" + e[t];
    if (
      !e.hasOwnProperty(t) &&
      typeof n < "u" &&
      typeof n.get == "function" &&
      typeof n.set == "function"
    ) {
      var o = n.get,
        s = n.set;
      return (
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function () {
            return o.call(this);
          },
          set: function (d) {
            (r = "" + d), s.call(this, d);
          },
        }),
        Object.defineProperty(e, t, { enumerable: n.enumerable }),
        {
          getValue: function () {
            return r;
          },
          setValue: function (d) {
            r = "" + d;
          },
          stopTracking: function () {
            (e._valueTracker = null), delete e[t];
          },
        }
      );
    }
  }
  function Br(e) {
    e._valueTracker || (e._valueTracker = kd(e));
  }
  function Ts(e) {
    if (!e) return !1;
    var t = e._valueTracker;
    if (!t) return !0;
    var n = t.getValue(),
      r = "";
    return (
      e && (r = Ss(e) ? (e.checked ? "true" : "false") : e.value),
      (e = r),
      e !== n ? (t.setValue(e), !0) : !1
    );
  }
  function Wr(e) {
    if (
      ((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")
    )
      return null;
    try {
      return e.activeElement || e.body;
    } catch {
      return e.body;
    }
  }
  function Ko(e, t) {
    var n = t.checked;
    return l({}, t, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: n ?? e._wrapperState.initialChecked,
    });
  }
  function js(e, t) {
    var n = t.defaultValue == null ? "" : t.defaultValue,
      r = t.checked != null ? t.checked : t.defaultChecked;
    (n = Pt(t.value != null ? t.value : n)),
      (e._wrapperState = {
        initialChecked: r,
        initialValue: n,
        controlled:
          t.type === "checkbox" || t.type === "radio"
            ? t.checked != null
            : t.value != null,
      });
  }
  function ks(e, t) {
    (t = t.checked), t != null && te(e, "checked", t, !1);
  }
  function ei(e, t) {
    ks(e, t);
    var n = Pt(t.value),
      r = t.type;
    if (n != null)
      r === "number"
        ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
        : e.value !== "" + n && (e.value = "" + n);
    else if (r === "submit" || r === "reset") {
      e.removeAttribute("value");
      return;
    }
    t.hasOwnProperty("value")
      ? ti(e, t.type, n)
      : t.hasOwnProperty("defaultValue") && ti(e, t.type, Pt(t.defaultValue)),
      t.checked == null &&
        t.defaultChecked != null &&
        (e.defaultChecked = !!t.defaultChecked);
  }
  function As(e, t, n) {
    if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
      var r = t.type;
      if (
        !(
          (r !== "submit" && r !== "reset") ||
          (t.value !== void 0 && t.value !== null)
        )
      )
        return;
      (t = "" + e._wrapperState.initialValue),
        n || t === e.value || (e.value = t),
        (e.defaultValue = t);
    }
    (n = e.name),
      n !== "" && (e.name = ""),
      (e.defaultChecked = !!e._wrapperState.initialChecked),
      n !== "" && (e.name = n);
  }
  function ti(e, t, n) {
    (t !== "number" || Wr(e.ownerDocument) !== e) &&
      (n == null
        ? (e.defaultValue = "" + e._wrapperState.initialValue)
        : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
  }
  function Ad(e) {
    var t = "";
    return (
      i.Children.forEach(e, function (n) {
        n != null && (t += n);
      }),
      t
    );
  }
  function ni(e, t) {
    return (
      (e = l({ children: void 0 }, t)),
      (t = Ad(t.children)) && (e.children = t),
      e
    );
  }
  function pn(e, t, n, r) {
    if (((e = e.options), t)) {
      t = {};
      for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
      for (n = 0; n < e.length; n++)
        (o = t.hasOwnProperty("$" + e[n].value)),
          e[n].selected !== o && (e[n].selected = o),
          o && r && (e[n].defaultSelected = !0);
    } else {
      for (n = "" + Pt(n), t = null, o = 0; o < e.length; o++) {
        if (e[o].value === n) {
          (e[o].selected = !0), r && (e[o].defaultSelected = !0);
          return;
        }
        t !== null || e[o].disabled || (t = e[o]);
      }
      t !== null && (t.selected = !0);
    }
  }
  function ri(e, t) {
    if (t.dangerouslySetInnerHTML != null) throw Error(a(91));
    return l({}, t, {
      value: void 0,
      defaultValue: void 0,
      children: "" + e._wrapperState.initialValue,
    });
  }
  function Ps(e, t) {
    var n = t.value;
    if (n == null) {
      if (((n = t.children), (t = t.defaultValue), n != null)) {
        if (t != null) throw Error(a(92));
        if (Array.isArray(n)) {
          if (!(1 >= n.length)) throw Error(a(93));
          n = n[0];
        }
        t = n;
      }
      t == null && (t = ""), (n = t);
    }
    e._wrapperState = { initialValue: Pt(n) };
  }
  function Is(e, t) {
    var n = Pt(t.value),
      r = Pt(t.defaultValue);
    n != null &&
      ((n = "" + n),
      n !== e.value && (e.value = n),
      t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
      r != null && (e.defaultValue = "" + r);
  }
  function _s(e) {
    var t = e.textContent;
    t === e._wrapperState.initialValue &&
      t !== "" &&
      t !== null &&
      (e.value = t);
  }
  var oi = {
    html: "http://www.w3.org/1999/xhtml",
    svg: "http://www.w3.org/2000/svg",
  };
  function Os(e) {
    switch (e) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function ii(e, t) {
    return e == null || e === "http://www.w3.org/1999/xhtml"
      ? Os(t)
      : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
        ? "http://www.w3.org/1999/xhtml"
        : e;
  }
  var Vr,
    Ns = (function (e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
        ? function (t, n, r, o) {
            MSApp.execUnsafeLocalFunction(function () {
              return e(t, n, r, o);
            });
          }
        : e;
    })(function (e, t) {
      if (e.namespaceURI !== oi.svg || "innerHTML" in e) e.innerHTML = t;
      else {
        for (
          Vr = Vr || document.createElement("div"),
            Vr.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
            t = Vr.firstChild;
          e.firstChild;

        )
          e.removeChild(e.firstChild);
        for (; t.firstChild; ) e.appendChild(t.firstChild);
      }
    });
  function Zn(e, t) {
    if (t) {
      var n = e.firstChild;
      if (n && n === e.lastChild && n.nodeType === 3) {
        n.nodeValue = t;
        return;
      }
    }
    e.textContent = t;
  }
  var Qn = {
      animationIterationCount: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0,
    },
    Pd = ["Webkit", "ms", "Moz", "O"];
  Object.keys(Qn).forEach(function (e) {
    Pd.forEach(function (t) {
      (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Qn[t] = Qn[e]);
    });
  });
  function Rs(e, t, n) {
    return t == null || typeof t == "boolean" || t === ""
      ? ""
      : n || typeof t != "number" || t === 0 || (Qn.hasOwnProperty(e) && Qn[e])
        ? ("" + t).trim()
        : t + "px";
  }
  function Ls(e, t) {
    e = e.style;
    for (var n in t)
      if (t.hasOwnProperty(n)) {
        var r = n.indexOf("--") === 0,
          o = Rs(n, t[n], r);
        n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : (e[n] = o);
      }
  }
  var Id = l(
    { menuitem: !0 },
    {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0,
    },
  );
  function li(e, t) {
    if (t) {
      if (Id[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
        throw Error(a(137, e));
      if (t.dangerouslySetInnerHTML != null) {
        if (t.children != null) throw Error(a(60));
        if (
          !(
            typeof t.dangerouslySetInnerHTML == "object" &&
            "__html" in t.dangerouslySetInnerHTML
          )
        )
          throw Error(a(61));
      }
      if (t.style != null && typeof t.style != "object") throw Error(a(62));
    }
  }
  function si(e, t) {
    if (e.indexOf("-") === -1) return typeof t.is == "string";
    switch (e) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  function ai(e) {
    return (
      (e = e.target || e.srcElement || window),
      e.correspondingUseElement && (e = e.correspondingUseElement),
      e.nodeType === 3 ? e.parentNode : e
    );
  }
  var ui = null,
    hn = null,
    mn = null;
  function bs(e) {
    if ((e = pr(e))) {
      if (typeof ui != "function") throw Error(a(280));
      var t = e.stateNode;
      t && ((t = so(t)), ui(e.stateNode, e.type, t));
    }
  }
  function Ms(e) {
    hn ? (mn ? mn.push(e) : (mn = [e])) : (hn = e);
  }
  function Ds() {
    if (hn) {
      var e = hn,
        t = mn;
      if (((mn = hn = null), bs(e), t)) for (e = 0; e < t.length; e++) bs(t[e]);
    }
  }
  function ci(e, t) {
    return e(t);
  }
  function zs(e, t, n, r, o) {
    return e(t, n, r, o);
  }
  function di() {}
  var Fs = ci,
    Gt = !1,
    fi = !1;
  function pi() {
    (hn !== null || mn !== null) && (di(), Ds());
  }
  function _d(e, t, n) {
    if (fi) return e(t, n);
    fi = !0;
    try {
      return Fs(e, t, n);
    } finally {
      (fi = !1), pi();
    }
  }
  function Jn(e, t) {
    var n = e.stateNode;
    if (n === null) return null;
    var r = so(n);
    if (r === null) return null;
    n = r[t];
    e: switch (t) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (r = !r.disabled) ||
          ((e = e.type),
          (r = !(
            e === "button" ||
            e === "input" ||
            e === "select" ||
            e === "textarea"
          ))),
          (e = !r);
        break e;
      default:
        e = !1;
    }
    if (e) return null;
    if (n && typeof n != "function") throw Error(a(231, t, typeof n));
    return n;
  }
  var hi = !1;
  if (m)
    try {
      var Gn = {};
      Object.defineProperty(Gn, "passive", {
        get: function () {
          hi = !0;
        },
      }),
        window.addEventListener("test", Gn, Gn),
        window.removeEventListener("test", Gn, Gn);
    } catch {
      hi = !1;
    }
  function Od(e, t, n, r, o, s, d, p, v) {
    var A = Array.prototype.slice.call(arguments, 3);
    try {
      t.apply(n, A);
    } catch (H) {
      this.onError(H);
    }
  }
  var qn = !1,
    Hr = null,
    $r = !1,
    mi = null,
    Nd = {
      onError: function (e) {
        (qn = !0), (Hr = e);
      },
    };
  function Rd(e, t, n, r, o, s, d, p, v) {
    (qn = !1), (Hr = null), Od.apply(Nd, arguments);
  }
  function Ld(e, t, n, r, o, s, d, p, v) {
    if ((Rd.apply(this, arguments), qn)) {
      if (qn) {
        var A = Hr;
        (qn = !1), (Hr = null);
      } else throw Error(a(198));
      $r || (($r = !0), (mi = A));
    }
  }
  function qt(e) {
    var t = e,
      n = e;
    if (e.alternate) for (; t.return; ) t = t.return;
    else {
      e = t;
      do (t = e), (t.flags & 1026) !== 0 && (n = t.return), (e = t.return);
      while (e);
    }
    return t.tag === 3 ? n : null;
  }
  function Us(e) {
    if (e.tag === 13) {
      var t = e.memoizedState;
      if (
        (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
        t !== null)
      )
        return t.dehydrated;
    }
    return null;
  }
  function Bs(e) {
    if (qt(e) !== e) throw Error(a(188));
  }
  function bd(e) {
    var t = e.alternate;
    if (!t) {
      if (((t = qt(e)), t === null)) throw Error(a(188));
      return t !== e ? null : e;
    }
    for (var n = e, r = t; ; ) {
      var o = n.return;
      if (o === null) break;
      var s = o.alternate;
      if (s === null) {
        if (((r = o.return), r !== null)) {
          n = r;
          continue;
        }
        break;
      }
      if (o.child === s.child) {
        for (s = o.child; s; ) {
          if (s === n) return Bs(o), e;
          if (s === r) return Bs(o), t;
          s = s.sibling;
        }
        throw Error(a(188));
      }
      if (n.return !== r.return) (n = o), (r = s);
      else {
        for (var d = !1, p = o.child; p; ) {
          if (p === n) {
            (d = !0), (n = o), (r = s);
            break;
          }
          if (p === r) {
            (d = !0), (r = o), (n = s);
            break;
          }
          p = p.sibling;
        }
        if (!d) {
          for (p = s.child; p; ) {
            if (p === n) {
              (d = !0), (n = s), (r = o);
              break;
            }
            if (p === r) {
              (d = !0), (r = s), (n = o);
              break;
            }
            p = p.sibling;
          }
          if (!d) throw Error(a(189));
        }
      }
      if (n.alternate !== r) throw Error(a(190));
    }
    if (n.tag !== 3) throw Error(a(188));
    return n.stateNode.current === n ? e : t;
  }
  function Ws(e) {
    if (((e = bd(e)), !e)) return null;
    for (var t = e; ; ) {
      if (t.tag === 5 || t.tag === 6) return t;
      if (t.child) (t.child.return = t), (t = t.child);
      else {
        if (t === e) break;
        for (; !t.sibling; ) {
          if (!t.return || t.return === e) return null;
          t = t.return;
        }
        (t.sibling.return = t.return), (t = t.sibling);
      }
    }
    return null;
  }
  function Vs(e, t) {
    for (var n = e.alternate; t !== null; ) {
      if (t === e || t === n) return !0;
      t = t.return;
    }
    return !1;
  }
  var Hs,
    vi,
    $s,
    Ys,
    yi = !1,
    pt = [],
    It = null,
    _t = null,
    Ot = null,
    Xn = new Map(),
    Kn = new Map(),
    er = [],
    Zs =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
        " ",
      );
  function gi(e, t, n, r, o) {
    return {
      blockedOn: e,
      domEventName: t,
      eventSystemFlags: n | 16,
      nativeEvent: o,
      targetContainers: [r],
    };
  }
  function Qs(e, t) {
    switch (e) {
      case "focusin":
      case "focusout":
        It = null;
        break;
      case "dragenter":
      case "dragleave":
        _t = null;
        break;
      case "mouseover":
      case "mouseout":
        Ot = null;
        break;
      case "pointerover":
      case "pointerout":
        Xn.delete(t.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        Kn.delete(t.pointerId);
    }
  }
  function tr(e, t, n, r, o, s) {
    return e === null || e.nativeEvent !== s
      ? ((e = gi(t, n, r, o, s)),
        t !== null && ((t = pr(t)), t !== null && vi(t)),
        e)
      : ((e.eventSystemFlags |= r),
        (t = e.targetContainers),
        o !== null && t.indexOf(o) === -1 && t.push(o),
        e);
  }
  function Md(e, t, n, r, o) {
    switch (t) {
      case "focusin":
        return (It = tr(It, e, t, n, r, o)), !0;
      case "dragenter":
        return (_t = tr(_t, e, t, n, r, o)), !0;
      case "mouseover":
        return (Ot = tr(Ot, e, t, n, r, o)), !0;
      case "pointerover":
        var s = o.pointerId;
        return Xn.set(s, tr(Xn.get(s) || null, e, t, n, r, o)), !0;
      case "gotpointercapture":
        return (
          (s = o.pointerId), Kn.set(s, tr(Kn.get(s) || null, e, t, n, r, o)), !0
        );
    }
    return !1;
  }
  function Dd(e) {
    var t = Xt(e.target);
    if (t !== null) {
      var n = qt(t);
      if (n !== null) {
        if (((t = n.tag), t === 13)) {
          if (((t = Us(n)), t !== null)) {
            (e.blockedOn = t),
              Ys(e.lanePriority, function () {
                c.unstable_runWithPriority(e.priority, function () {
                  $s(n);
                });
              });
            return;
          }
        } else if (t === 3 && n.stateNode.hydrate) {
          e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
          return;
        }
      }
    }
    e.blockedOn = null;
  }
  function Yr(e) {
    if (e.blockedOn !== null) return !1;
    for (var t = e.targetContainers; 0 < t.length; ) {
      var n = Ti(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
      if (n !== null)
        return (t = pr(n)), t !== null && vi(t), (e.blockedOn = n), !1;
      t.shift();
    }
    return !0;
  }
  function Js(e, t, n) {
    Yr(e) && n.delete(t);
  }
  function zd() {
    for (yi = !1; 0 < pt.length; ) {
      var e = pt[0];
      if (e.blockedOn !== null) {
        (e = pr(e.blockedOn)), e !== null && Hs(e);
        break;
      }
      for (var t = e.targetContainers; 0 < t.length; ) {
        var n = Ti(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
        if (n !== null) {
          e.blockedOn = n;
          break;
        }
        t.shift();
      }
      e.blockedOn === null && pt.shift();
    }
    It !== null && Yr(It) && (It = null),
      _t !== null && Yr(_t) && (_t = null),
      Ot !== null && Yr(Ot) && (Ot = null),
      Xn.forEach(Js),
      Kn.forEach(Js);
  }
  function nr(e, t) {
    e.blockedOn === t &&
      ((e.blockedOn = null),
      yi ||
        ((yi = !0),
        c.unstable_scheduleCallback(c.unstable_NormalPriority, zd)));
  }
  function Gs(e) {
    function t(o) {
      return nr(o, e);
    }
    if (0 < pt.length) {
      nr(pt[0], e);
      for (var n = 1; n < pt.length; n++) {
        var r = pt[n];
        r.blockedOn === e && (r.blockedOn = null);
      }
    }
    for (
      It !== null && nr(It, e),
        _t !== null && nr(_t, e),
        Ot !== null && nr(Ot, e),
        Xn.forEach(t),
        Kn.forEach(t),
        n = 0;
      n < er.length;
      n++
    )
      (r = er[n]), r.blockedOn === e && (r.blockedOn = null);
    for (; 0 < er.length && ((n = er[0]), n.blockedOn === null); )
      Dd(n), n.blockedOn === null && er.shift();
  }
  function Zr(e, t) {
    var n = {};
    return (
      (n[e.toLowerCase()] = t.toLowerCase()),
      (n["Webkit" + e] = "webkit" + t),
      (n["Moz" + e] = "moz" + t),
      n
    );
  }
  var vn = {
      animationend: Zr("Animation", "AnimationEnd"),
      animationiteration: Zr("Animation", "AnimationIteration"),
      animationstart: Zr("Animation", "AnimationStart"),
      transitionend: Zr("Transition", "TransitionEnd"),
    },
    wi = {},
    qs = {};
  m &&
    ((qs = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete vn.animationend.animation,
      delete vn.animationiteration.animation,
      delete vn.animationstart.animation),
    "TransitionEvent" in window || delete vn.transitionend.transition);
  function Qr(e) {
    if (wi[e]) return wi[e];
    if (!vn[e]) return e;
    var t = vn[e],
      n;
    for (n in t) if (t.hasOwnProperty(n) && n in qs) return (wi[e] = t[n]);
    return e;
  }
  var Xs = Qr("animationend"),
    Ks = Qr("animationiteration"),
    ea = Qr("animationstart"),
    ta = Qr("transitionend"),
    na = new Map(),
    xi = new Map(),
    Fd = [
      "abort",
      "abort",
      Xs,
      "animationEnd",
      Ks,
      "animationIteration",
      ea,
      "animationStart",
      "canplay",
      "canPlay",
      "canplaythrough",
      "canPlayThrough",
      "durationchange",
      "durationChange",
      "emptied",
      "emptied",
      "encrypted",
      "encrypted",
      "ended",
      "ended",
      "error",
      "error",
      "gotpointercapture",
      "gotPointerCapture",
      "load",
      "load",
      "loadeddata",
      "loadedData",
      "loadedmetadata",
      "loadedMetadata",
      "loadstart",
      "loadStart",
      "lostpointercapture",
      "lostPointerCapture",
      "playing",
      "playing",
      "progress",
      "progress",
      "seeking",
      "seeking",
      "stalled",
      "stalled",
      "suspend",
      "suspend",
      "timeupdate",
      "timeUpdate",
      ta,
      "transitionEnd",
      "waiting",
      "waiting",
    ];
  function Ci(e, t) {
    for (var n = 0; n < e.length; n += 2) {
      var r = e[n],
        o = e[n + 1];
      (o = "on" + (o[0].toUpperCase() + o.slice(1))),
        xi.set(r, t),
        na.set(r, o),
        g(o, [r]);
    }
  }
  var Ud = c.unstable_now;
  Ud();
  var Se = 8;
  function yn(e) {
    if ((1 & e) !== 0) return (Se = 15), 1;
    if ((2 & e) !== 0) return (Se = 14), 2;
    if ((4 & e) !== 0) return (Se = 13), 4;
    var t = 24 & e;
    return t !== 0
      ? ((Se = 12), t)
      : (e & 32) !== 0
        ? ((Se = 11), 32)
        : ((t = 192 & e),
          t !== 0
            ? ((Se = 10), t)
            : (e & 256) !== 0
              ? ((Se = 9), 256)
              : ((t = 3584 & e),
                t !== 0
                  ? ((Se = 8), t)
                  : (e & 4096) !== 0
                    ? ((Se = 7), 4096)
                    : ((t = 4186112 & e),
                      t !== 0
                        ? ((Se = 6), t)
                        : ((t = 62914560 & e),
                          t !== 0
                            ? ((Se = 5), t)
                            : e & 67108864
                              ? ((Se = 4), 67108864)
                              : (e & 134217728) !== 0
                                ? ((Se = 3), 134217728)
                                : ((t = 805306368 & e),
                                  t !== 0
                                    ? ((Se = 2), t)
                                    : (1073741824 & e) !== 0
                                      ? ((Se = 1), 1073741824)
                                      : ((Se = 8), e))))));
  }
  function Bd(e) {
    switch (e) {
      case 99:
        return 15;
      case 98:
        return 10;
      case 97:
      case 96:
        return 8;
      case 95:
        return 2;
      default:
        return 0;
    }
  }
  function Wd(e) {
    switch (e) {
      case 15:
      case 14:
        return 99;
      case 13:
      case 12:
      case 11:
      case 10:
        return 98;
      case 9:
      case 8:
      case 7:
      case 6:
      case 4:
      case 5:
        return 97;
      case 3:
      case 2:
      case 1:
        return 95;
      case 0:
        return 90;
      default:
        throw Error(a(358, e));
    }
  }
  function rr(e, t) {
    var n = e.pendingLanes;
    if (n === 0) return (Se = 0);
    var r = 0,
      o = 0,
      s = e.expiredLanes,
      d = e.suspendedLanes,
      p = e.pingedLanes;
    if (s !== 0) (r = s), (o = Se = 15);
    else if (((s = n & 134217727), s !== 0)) {
      var v = s & ~d;
      v !== 0
        ? ((r = yn(v)), (o = Se))
        : ((p &= s), p !== 0 && ((r = yn(p)), (o = Se)));
    } else
      (s = n & ~d),
        s !== 0 ? ((r = yn(s)), (o = Se)) : p !== 0 && ((r = yn(p)), (o = Se));
    if (r === 0) return 0;
    if (
      ((r = 31 - Nt(r)),
      (r = n & (((0 > r ? 0 : 1 << r) << 1) - 1)),
      t !== 0 && t !== r && (t & d) === 0)
    ) {
      if ((yn(t), o <= Se)) return t;
      Se = o;
    }
    if (((t = e.entangledLanes), t !== 0))
      for (e = e.entanglements, t &= r; 0 < t; )
        (n = 31 - Nt(t)), (o = 1 << n), (r |= e[n]), (t &= ~o);
    return r;
  }
  function ra(e) {
    return (
      (e = e.pendingLanes & -1073741825),
      e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
    );
  }
  function Jr(e, t) {
    switch (e) {
      case 15:
        return 1;
      case 14:
        return 2;
      case 12:
        return (e = gn(24 & ~t)), e === 0 ? Jr(10, t) : e;
      case 10:
        return (e = gn(192 & ~t)), e === 0 ? Jr(8, t) : e;
      case 8:
        return (
          (e = gn(3584 & ~t)),
          e === 0 && ((e = gn(4186112 & ~t)), e === 0 && (e = 512)),
          e
        );
      case 2:
        return (t = gn(805306368 & ~t)), t === 0 && (t = 268435456), t;
    }
    throw Error(a(358, e));
  }
  function gn(e) {
    return e & -e;
  }
  function Ei(e) {
    for (var t = [], n = 0; 31 > n; n++) t.push(e);
    return t;
  }
  function Gr(e, t, n) {
    e.pendingLanes |= t;
    var r = t - 1;
    (e.suspendedLanes &= r),
      (e.pingedLanes &= r),
      (e = e.eventTimes),
      (t = 31 - Nt(t)),
      (e[t] = n);
  }
  var Nt = Math.clz32 ? Math.clz32 : $d,
    Vd = Math.log,
    Hd = Math.LN2;
  function $d(e) {
    return e === 0 ? 32 : (31 - ((Vd(e) / Hd) | 0)) | 0;
  }
  var Yd = c.unstable_UserBlockingPriority,
    Zd = c.unstable_runWithPriority,
    qr = !0;
  function Qd(e, t, n, r) {
    Gt || di();
    var o = Si,
      s = Gt;
    Gt = !0;
    try {
      zs(o, e, t, n, r);
    } finally {
      (Gt = s) || pi();
    }
  }
  function Jd(e, t, n, r) {
    Zd(Yd, Si.bind(null, e, t, n, r));
  }
  function Si(e, t, n, r) {
    if (qr) {
      var o;
      if ((o = (t & 4) === 0) && 0 < pt.length && -1 < Zs.indexOf(e))
        (e = gi(null, e, t, n, r)), pt.push(e);
      else {
        var s = Ti(e, t, n, r);
        if (s === null) o && Qs(e, r);
        else {
          if (o) {
            if (-1 < Zs.indexOf(e)) {
              (e = gi(s, e, t, n, r)), pt.push(e);
              return;
            }
            if (Md(s, e, t, n, r)) return;
            Qs(e, r);
          }
          Na(e, t, r, null, n);
        }
      }
    }
  }
  function Ti(e, t, n, r) {
    var o = ai(r);
    if (((o = Xt(o)), o !== null)) {
      var s = qt(o);
      if (s === null) o = null;
      else {
        var d = s.tag;
        if (d === 13) {
          if (((o = Us(s)), o !== null)) return o;
          o = null;
        } else if (d === 3) {
          if (s.stateNode.hydrate)
            return s.tag === 3 ? s.stateNode.containerInfo : null;
          o = null;
        } else s !== o && (o = null);
      }
    }
    return Na(e, t, r, o, n), null;
  }
  var Rt = null,
    ji = null,
    Xr = null;
  function oa() {
    if (Xr) return Xr;
    var e,
      t = ji,
      n = t.length,
      r,
      o = "value" in Rt ? Rt.value : Rt.textContent,
      s = o.length;
    for (e = 0; e < n && t[e] === o[e]; e++);
    var d = n - e;
    for (r = 1; r <= d && t[n - r] === o[s - r]; r++);
    return (Xr = o.slice(e, 1 < r ? 1 - r : void 0));
  }
  function Kr(e) {
    var t = e.keyCode;
    return (
      "charCode" in e
        ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
        : (e = t),
      e === 10 && (e = 13),
      32 <= e || e === 13 ? e : 0
    );
  }
  function eo() {
    return !0;
  }
  function ia() {
    return !1;
  }
  function et(e) {
    function t(n, r, o, s, d) {
      (this._reactName = n),
        (this._targetInst = o),
        (this.type = r),
        (this.nativeEvent = s),
        (this.target = d),
        (this.currentTarget = null);
      for (var p in e)
        e.hasOwnProperty(p) && ((n = e[p]), (this[p] = n ? n(s) : s[p]));
      return (
        (this.isDefaultPrevented = (
          s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === !1
        )
          ? eo
          : ia),
        (this.isPropagationStopped = ia),
        this
      );
    }
    return (
      l(t.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var n = this.nativeEvent;
          n &&
            (n.preventDefault
              ? n.preventDefault()
              : typeof n.returnValue != "unknown" && (n.returnValue = !1),
            (this.isDefaultPrevented = eo));
        },
        stopPropagation: function () {
          var n = this.nativeEvent;
          n &&
            (n.stopPropagation
              ? n.stopPropagation()
              : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
            (this.isPropagationStopped = eo));
        },
        persist: function () {},
        isPersistent: eo,
      }),
      t
    );
  }
  var wn = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    ki = et(wn),
    or = l({}, wn, { view: 0, detail: 0 }),
    Gd = et(or),
    Ai,
    Pi,
    ir,
    to = l({}, or, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: _i,
      button: 0,
      buttons: 0,
      relatedTarget: function (e) {
        return e.relatedTarget === void 0
          ? e.fromElement === e.srcElement
            ? e.toElement
            : e.fromElement
          : e.relatedTarget;
      },
      movementX: function (e) {
        return "movementX" in e
          ? e.movementX
          : (e !== ir &&
              (ir && e.type === "mousemove"
                ? ((Ai = e.screenX - ir.screenX), (Pi = e.screenY - ir.screenY))
                : (Pi = Ai = 0),
              (ir = e)),
            Ai);
      },
      movementY: function (e) {
        return "movementY" in e ? e.movementY : Pi;
      },
    }),
    la = et(to),
    qd = l({}, to, { dataTransfer: 0 }),
    Xd = et(qd),
    Kd = l({}, or, { relatedTarget: 0 }),
    Ii = et(Kd),
    ef = l({}, wn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    tf = et(ef),
    nf = l({}, wn, {
      clipboardData: function (e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      },
    }),
    rf = et(nf),
    of = l({}, wn, { data: 0 }),
    sa = et(of),
    lf = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    sf = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    af = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function uf(e) {
    var t = this.nativeEvent;
    return t.getModifierState
      ? t.getModifierState(e)
      : (e = af[e])
        ? !!t[e]
        : !1;
  }
  function _i() {
    return uf;
  }
  var cf = l({}, or, {
      key: function (e) {
        if (e.key) {
          var t = lf[e.key] || e.key;
          if (t !== "Unidentified") return t;
        }
        return e.type === "keypress"
          ? ((e = Kr(e)), e === 13 ? "Enter" : String.fromCharCode(e))
          : e.type === "keydown" || e.type === "keyup"
            ? sf[e.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: _i,
      charCode: function (e) {
        return e.type === "keypress" ? Kr(e) : 0;
      },
      keyCode: function (e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function (e) {
        return e.type === "keypress"
          ? Kr(e)
          : e.type === "keydown" || e.type === "keyup"
            ? e.keyCode
            : 0;
      },
    }),
    df = et(cf),
    ff = l({}, to, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    aa = et(ff),
    pf = l({}, or, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: _i,
    }),
    hf = et(pf),
    mf = l({}, wn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    vf = et(mf),
    yf = l({}, to, {
      deltaX: function (e) {
        return "deltaX" in e
          ? e.deltaX
          : "wheelDeltaX" in e
            ? -e.wheelDeltaX
            : 0;
      },
      deltaY: function (e) {
        return "deltaY" in e
          ? e.deltaY
          : "wheelDeltaY" in e
            ? -e.wheelDeltaY
            : "wheelDelta" in e
              ? -e.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    gf = et(yf),
    wf = [9, 13, 27, 32],
    Oi = m && "CompositionEvent" in window,
    lr = null;
  m && "documentMode" in document && (lr = document.documentMode);
  var xf = m && "TextEvent" in window && !lr,
    ua = m && (!Oi || (lr && 8 < lr && 11 >= lr)),
    ca = " ",
    da = !1;
  function fa(e, t) {
    switch (e) {
      case "keyup":
        return wf.indexOf(t.keyCode) !== -1;
      case "keydown":
        return t.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function pa(e) {
    return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
  }
  var xn = !1;
  function Cf(e, t) {
    switch (e) {
      case "compositionend":
        return pa(t);
      case "keypress":
        return t.which !== 32 ? null : ((da = !0), ca);
      case "textInput":
        return (e = t.data), e === ca && da ? null : e;
      default:
        return null;
    }
  }
  function Ef(e, t) {
    if (xn)
      return e === "compositionend" || (!Oi && fa(e, t))
        ? ((e = oa()), (Xr = ji = Rt = null), (xn = !1), e)
        : null;
    switch (e) {
      case "paste":
        return null;
      case "keypress":
        if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
          if (t.char && 1 < t.char.length) return t.char;
          if (t.which) return String.fromCharCode(t.which);
        }
        return null;
      case "compositionend":
        return ua && t.locale !== "ko" ? null : t.data;
      default:
        return null;
    }
  }
  var Sf = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function ha(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return t === "input" ? !!Sf[e.type] : t === "textarea";
  }
  function ma(e, t, n, r) {
    Ms(r),
      (t = ro(t, "onChange")),
      0 < t.length &&
        ((n = new ki("onChange", "change", null, n, r)),
        e.push({ event: n, listeners: t }));
  }
  var sr = null,
    ar = null;
  function Tf(e) {
    Aa(e, 0);
  }
  function no(e) {
    var t = jn(e);
    if (Ts(t)) return e;
  }
  function jf(e, t) {
    if (e === "change") return t;
  }
  var va = !1;
  if (m) {
    var Ni;
    if (m) {
      var Ri = "oninput" in document;
      if (!Ri) {
        var ya = document.createElement("div");
        ya.setAttribute("oninput", "return;"),
          (Ri = typeof ya.oninput == "function");
      }
      Ni = Ri;
    } else Ni = !1;
    va = Ni && (!document.documentMode || 9 < document.documentMode);
  }
  function ga() {
    sr && (sr.detachEvent("onpropertychange", wa), (ar = sr = null));
  }
  function wa(e) {
    if (e.propertyName === "value" && no(ar)) {
      var t = [];
      if ((ma(t, ar, e, ai(e)), (e = Tf), Gt)) e(t);
      else {
        Gt = !0;
        try {
          ci(e, t);
        } finally {
          (Gt = !1), pi();
        }
      }
    }
  }
  function kf(e, t, n) {
    e === "focusin"
      ? (ga(), (sr = t), (ar = n), sr.attachEvent("onpropertychange", wa))
      : e === "focusout" && ga();
  }
  function Af(e) {
    if (e === "selectionchange" || e === "keyup" || e === "keydown")
      return no(ar);
  }
  function Pf(e, t) {
    if (e === "click") return no(t);
  }
  function If(e, t) {
    if (e === "input" || e === "change") return no(t);
  }
  function _f(e, t) {
    return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
  }
  var it = typeof Object.is == "function" ? Object.is : _f,
    Of = Object.prototype.hasOwnProperty;
  function ur(e, t) {
    if (it(e, t)) return !0;
    if (
      typeof e != "object" ||
      e === null ||
      typeof t != "object" ||
      t === null
    )
      return !1;
    var n = Object.keys(e),
      r = Object.keys(t);
    if (n.length !== r.length) return !1;
    for (r = 0; r < n.length; r++)
      if (!Of.call(t, n[r]) || !it(e[n[r]], t[n[r]])) return !1;
    return !0;
  }
  function xa(e) {
    for (; e && e.firstChild; ) e = e.firstChild;
    return e;
  }
  function Ca(e, t) {
    var n = xa(e);
    e = 0;
    for (var r; n; ) {
      if (n.nodeType === 3) {
        if (((r = e + n.textContent.length), e <= t && r >= t))
          return { node: n, offset: t - e };
        e = r;
      }
      e: {
        for (; n; ) {
          if (n.nextSibling) {
            n = n.nextSibling;
            break e;
          }
          n = n.parentNode;
        }
        n = void 0;
      }
      n = xa(n);
    }
  }
  function Ea(e, t) {
    return e && t
      ? e === t
        ? !0
        : e && e.nodeType === 3
          ? !1
          : t && t.nodeType === 3
            ? Ea(e, t.parentNode)
            : "contains" in e
              ? e.contains(t)
              : e.compareDocumentPosition
                ? !!(e.compareDocumentPosition(t) & 16)
                : !1
      : !1;
  }
  function Sa() {
    for (var e = window, t = Wr(); t instanceof e.HTMLIFrameElement; ) {
      try {
        var n = typeof t.contentWindow.location.href == "string";
      } catch {
        n = !1;
      }
      if (n) e = t.contentWindow;
      else break;
      t = Wr(e.document);
    }
    return t;
  }
  function Li(e) {
    var t = e && e.nodeName && e.nodeName.toLowerCase();
    return (
      t &&
      ((t === "input" &&
        (e.type === "text" ||
          e.type === "search" ||
          e.type === "tel" ||
          e.type === "url" ||
          e.type === "password")) ||
        t === "textarea" ||
        e.contentEditable === "true")
    );
  }
  var Nf = m && "documentMode" in document && 11 >= document.documentMode,
    Cn = null,
    bi = null,
    cr = null,
    Mi = !1;
  function Ta(e, t, n) {
    var r =
      n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
    Mi ||
      Cn == null ||
      Cn !== Wr(r) ||
      ((r = Cn),
      "selectionStart" in r && Li(r)
        ? (r = { start: r.selectionStart, end: r.selectionEnd })
        : ((r = (
            (r.ownerDocument && r.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (r = {
            anchorNode: r.anchorNode,
            anchorOffset: r.anchorOffset,
            focusNode: r.focusNode,
            focusOffset: r.focusOffset,
          })),
      (cr && ur(cr, r)) ||
        ((cr = r),
        (r = ro(bi, "onSelect")),
        0 < r.length &&
          ((t = new ki("onSelect", "select", null, t, n)),
          e.push({ event: t, listeners: r }),
          (t.target = Cn))));
  }
  Ci(
    "cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focusin focus focusout blur input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange".split(
      " ",
    ),
    0,
  ),
    Ci(
      "drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel".split(
        " ",
      ),
      1,
    ),
    Ci(Fd, 2);
  for (
    var ja =
        "change selectionchange textInput compositionstart compositionend compositionupdate".split(
          " ",
        ),
      Di = 0;
    Di < ja.length;
    Di++
  )
    xi.set(ja[Di], 0);
  y("onMouseEnter", ["mouseout", "mouseover"]),
    y("onMouseLeave", ["mouseout", "mouseover"]),
    y("onPointerEnter", ["pointerout", "pointerover"]),
    y("onPointerLeave", ["pointerout", "pointerover"]),
    g(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    ),
    g(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    g("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    g(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    ),
    g(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    g(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    );
  var dr =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    Rf = new Set(
      "cancel close invalid load scroll toggle".split(" ").concat(dr),
    );
  function ka(e, t, n) {
    var r = e.type || "unknown-event";
    (e.currentTarget = n), Ld(r, t, void 0, e), (e.currentTarget = null);
  }
  function Aa(e, t) {
    t = (t & 4) !== 0;
    for (var n = 0; n < e.length; n++) {
      var r = e[n],
        o = r.event;
      r = r.listeners;
      e: {
        var s = void 0;
        if (t)
          for (var d = r.length - 1; 0 <= d; d--) {
            var p = r[d],
              v = p.instance,
              A = p.currentTarget;
            if (((p = p.listener), v !== s && o.isPropagationStopped()))
              break e;
            ka(o, p, A), (s = v);
          }
        else
          for (d = 0; d < r.length; d++) {
            if (
              ((p = r[d]),
              (v = p.instance),
              (A = p.currentTarget),
              (p = p.listener),
              v !== s && o.isPropagationStopped())
            )
              break e;
            ka(o, p, A), (s = v);
          }
      }
    }
    if ($r) throw ((e = mi), ($r = !1), (mi = null), e);
  }
  function je(e, t) {
    var n = za(t),
      r = e + "__bubble";
    n.has(r) || (Oa(t, e, 2, !1), n.add(r));
  }
  var Pa = "_reactListening" + Math.random().toString(36).slice(2);
  function Ia(e) {
    e[Pa] ||
      ((e[Pa] = !0),
      f.forEach(function (t) {
        Rf.has(t) || _a(t, !1, e, null), _a(t, !0, e, null);
      }));
  }
  function _a(e, t, n, r) {
    var o = 4 < arguments.length && arguments[4] !== void 0 ? arguments[4] : 0,
      s = n;
    e === "selectionchange" && n.nodeType !== 9 && (s = n.ownerDocument);
    var d = za(s),
      p = e + "__" + (t ? "capture" : "bubble");
    d.has(p) || (t && (o |= 4), Oa(s, e, o, t), d.add(p));
  }
  function Oa(e, t, n, r) {
    var o = xi.get(t);
    switch (o === void 0 ? 2 : o) {
      case 0:
        o = Qd;
        break;
      case 1:
        o = Jd;
        break;
      default:
        o = Si;
    }
    (n = o.bind(null, t, n, e)),
      (o = void 0),
      !hi ||
        (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
        (o = !0),
      r
        ? o !== void 0
          ? e.addEventListener(t, n, { capture: !0, passive: o })
          : e.addEventListener(t, n, !0)
        : o !== void 0
          ? e.addEventListener(t, n, { passive: o })
          : e.addEventListener(t, n, !1);
  }
  function Na(e, t, n, r, o) {
    var s = r;
    if ((t & 1) === 0 && (t & 2) === 0 && r !== null)
      e: for (;;) {
        if (r === null) return;
        var d = r.tag;
        if (d === 3 || d === 4) {
          var p = r.stateNode.containerInfo;
          if (p === o || (p.nodeType === 8 && p.parentNode === o)) break;
          if (d === 4)
            for (d = r.return; d !== null; ) {
              var v = d.tag;
              if (
                (v === 3 || v === 4) &&
                ((v = d.stateNode.containerInfo),
                v === o || (v.nodeType === 8 && v.parentNode === o))
              )
                return;
              d = d.return;
            }
          for (; p !== null; ) {
            if (((d = Xt(p)), d === null)) return;
            if (((v = d.tag), v === 5 || v === 6)) {
              r = s = d;
              continue e;
            }
            p = p.parentNode;
          }
        }
        r = r.return;
      }
    _d(function () {
      var A = s,
        H = ai(n),
        ae = [];
      e: {
        var D = na.get(e);
        if (D !== void 0) {
          var K = ki,
            le = e;
          switch (e) {
            case "keypress":
              if (Kr(n) === 0) break e;
            case "keydown":
            case "keyup":
              K = df;
              break;
            case "focusin":
              (le = "focus"), (K = Ii);
              break;
            case "focusout":
              (le = "blur"), (K = Ii);
              break;
            case "beforeblur":
            case "afterblur":
              K = Ii;
              break;
            case "click":
              if (n.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              K = la;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              K = Xd;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              K = hf;
              break;
            case Xs:
            case Ks:
            case ea:
              K = tf;
              break;
            case ta:
              K = vf;
              break;
            case "scroll":
              K = Gd;
              break;
            case "wheel":
              K = gf;
              break;
            case "copy":
            case "cut":
            case "paste":
              K = rf;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              K = aa;
          }
          var re = (t & 4) !== 0,
            S = !re && e === "scroll",
            w = re ? (D !== null ? D + "Capture" : null) : D;
          re = [];
          for (var E = A, _; E !== null; ) {
            _ = E;
            var L = _.stateNode;
            if (
              (_.tag === 5 &&
                L !== null &&
                ((_ = L),
                w !== null &&
                  ((L = Jn(E, w)), L != null && re.push(fr(E, L, _)))),
              S)
            )
              break;
            E = E.return;
          }
          0 < re.length &&
            ((D = new K(D, le, null, n, H)),
            ae.push({ event: D, listeners: re }));
        }
      }
      if ((t & 7) === 0) {
        e: {
          if (
            ((D = e === "mouseover" || e === "pointerover"),
            (K = e === "mouseout" || e === "pointerout"),
            D &&
              (t & 16) === 0 &&
              (le = n.relatedTarget || n.fromElement) &&
              (Xt(le) || le[Tn]))
          )
            break e;
          if (
            (K || D) &&
            ((D =
              H.window === H
                ? H
                : (D = H.ownerDocument)
                  ? D.defaultView || D.parentWindow
                  : window),
            K
              ? ((le = n.relatedTarget || n.toElement),
                (K = A),
                (le = le ? Xt(le) : null),
                le !== null &&
                  ((S = qt(le)), le !== S || (le.tag !== 5 && le.tag !== 6)) &&
                  (le = null))
              : ((K = null), (le = A)),
            K !== le)
          ) {
            if (
              ((re = la),
              (L = "onMouseLeave"),
              (w = "onMouseEnter"),
              (E = "mouse"),
              (e === "pointerout" || e === "pointerover") &&
                ((re = aa),
                (L = "onPointerLeave"),
                (w = "onPointerEnter"),
                (E = "pointer")),
              (S = K == null ? D : jn(K)),
              (_ = le == null ? D : jn(le)),
              (D = new re(L, E + "leave", K, n, H)),
              (D.target = S),
              (D.relatedTarget = _),
              (L = null),
              Xt(H) === A &&
                ((re = new re(w, E + "enter", le, n, H)),
                (re.target = _),
                (re.relatedTarget = S),
                (L = re)),
              (S = L),
              K && le)
            )
              t: {
                for (re = K, w = le, E = 0, _ = re; _; _ = En(_)) E++;
                for (_ = 0, L = w; L; L = En(L)) _++;
                for (; 0 < E - _; ) (re = En(re)), E--;
                for (; 0 < _ - E; ) (w = En(w)), _--;
                for (; E--; ) {
                  if (re === w || (w !== null && re === w.alternate)) break t;
                  (re = En(re)), (w = En(w));
                }
                re = null;
              }
            else re = null;
            K !== null && Ra(ae, D, K, re, !1),
              le !== null && S !== null && Ra(ae, S, le, re, !0);
          }
        }
        e: {
          if (
            ((D = A ? jn(A) : window),
            (K = D.nodeName && D.nodeName.toLowerCase()),
            K === "select" || (K === "input" && D.type === "file"))
          )
            var de = jf;
          else if (ha(D))
            if (va) de = If;
            else {
              de = Af;
              var q = kf;
            }
          else
            (K = D.nodeName) &&
              K.toLowerCase() === "input" &&
              (D.type === "checkbox" || D.type === "radio") &&
              (de = Pf);
          if (de && (de = de(e, A))) {
            ma(ae, de, n, H);
            break e;
          }
          q && q(e, D, A),
            e === "focusout" &&
              (q = D._wrapperState) &&
              q.controlled &&
              D.type === "number" &&
              ti(D, "number", D.value);
        }
        switch (((q = A ? jn(A) : window), e)) {
          case "focusin":
            (ha(q) || q.contentEditable === "true") &&
              ((Cn = q), (bi = A), (cr = null));
            break;
          case "focusout":
            cr = bi = Cn = null;
            break;
          case "mousedown":
            Mi = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            (Mi = !1), Ta(ae, n, H);
            break;
          case "selectionchange":
            if (Nf) break;
          case "keydown":
          case "keyup":
            Ta(ae, n, H);
        }
        var fe;
        if (Oi)
          e: {
            switch (e) {
              case "compositionstart":
                var ge = "onCompositionStart";
                break e;
              case "compositionend":
                ge = "onCompositionEnd";
                break e;
              case "compositionupdate":
                ge = "onCompositionUpdate";
                break e;
            }
            ge = void 0;
          }
        else
          xn
            ? fa(e, n) && (ge = "onCompositionEnd")
            : e === "keydown" &&
              n.keyCode === 229 &&
              (ge = "onCompositionStart");
        ge &&
          (ua &&
            n.locale !== "ko" &&
            (xn || ge !== "onCompositionStart"
              ? ge === "onCompositionEnd" && xn && (fe = oa())
              : ((Rt = H),
                (ji = "value" in Rt ? Rt.value : Rt.textContent),
                (xn = !0))),
          (q = ro(A, ge)),
          0 < q.length &&
            ((ge = new sa(ge, e, null, n, H)),
            ae.push({ event: ge, listeners: q }),
            fe
              ? (ge.data = fe)
              : ((fe = pa(n)), fe !== null && (ge.data = fe)))),
          (fe = xf ? Cf(e, n) : Ef(e, n)) &&
            ((A = ro(A, "onBeforeInput")),
            0 < A.length &&
              ((H = new sa("onBeforeInput", "beforeinput", null, n, H)),
              ae.push({ event: H, listeners: A }),
              (H.data = fe)));
      }
      Aa(ae, t);
    });
  }
  function fr(e, t, n) {
    return { instance: e, listener: t, currentTarget: n };
  }
  function ro(e, t) {
    for (var n = t + "Capture", r = []; e !== null; ) {
      var o = e,
        s = o.stateNode;
      o.tag === 5 &&
        s !== null &&
        ((o = s),
        (s = Jn(e, n)),
        s != null && r.unshift(fr(e, s, o)),
        (s = Jn(e, t)),
        s != null && r.push(fr(e, s, o))),
        (e = e.return);
    }
    return r;
  }
  function En(e) {
    if (e === null) return null;
    do e = e.return;
    while (e && e.tag !== 5);
    return e || null;
  }
  function Ra(e, t, n, r, o) {
    for (var s = t._reactName, d = []; n !== null && n !== r; ) {
      var p = n,
        v = p.alternate,
        A = p.stateNode;
      if (v !== null && v === r) break;
      p.tag === 5 &&
        A !== null &&
        ((p = A),
        o
          ? ((v = Jn(n, s)), v != null && d.unshift(fr(n, v, p)))
          : o || ((v = Jn(n, s)), v != null && d.push(fr(n, v, p)))),
        (n = n.return);
    }
    d.length !== 0 && e.push({ event: t, listeners: d });
  }
  function oo() {}
  var zi = null,
    Fi = null;
  function La(e, t) {
    switch (e) {
      case "button":
      case "input":
      case "select":
      case "textarea":
        return !!t.autoFocus;
    }
    return !1;
  }
  function Ui(e, t) {
    return (
      e === "textarea" ||
      e === "option" ||
      e === "noscript" ||
      typeof t.children == "string" ||
      typeof t.children == "number" ||
      (typeof t.dangerouslySetInnerHTML == "object" &&
        t.dangerouslySetInnerHTML !== null &&
        t.dangerouslySetInnerHTML.__html != null)
    );
  }
  var ba = typeof setTimeout == "function" ? setTimeout : void 0,
    Lf = typeof clearTimeout == "function" ? clearTimeout : void 0;
  function Bi(e) {
    e.nodeType === 1
      ? (e.textContent = "")
      : e.nodeType === 9 && ((e = e.body), e != null && (e.textContent = ""));
  }
  function Sn(e) {
    for (; e != null; e = e.nextSibling) {
      var t = e.nodeType;
      if (t === 1 || t === 3) break;
    }
    return e;
  }
  function Ma(e) {
    e = e.previousSibling;
    for (var t = 0; e; ) {
      if (e.nodeType === 8) {
        var n = e.data;
        if (n === "$" || n === "$!" || n === "$?") {
          if (t === 0) return e;
          t--;
        } else n === "/$" && t++;
      }
      e = e.previousSibling;
    }
    return null;
  }
  var Wi = 0;
  function bf(e) {
    return { $$typeof: B, toString: e, valueOf: e };
  }
  var io = Math.random().toString(36).slice(2),
    Lt = "__reactFiber$" + io,
    lo = "__reactProps$" + io,
    Tn = "__reactContainer$" + io,
    Da = "__reactEvents$" + io;
  function Xt(e) {
    var t = e[Lt];
    if (t) return t;
    for (var n = e.parentNode; n; ) {
      if ((t = n[Tn] || n[Lt])) {
        if (
          ((n = t.alternate),
          t.child !== null || (n !== null && n.child !== null))
        )
          for (e = Ma(e); e !== null; ) {
            if ((n = e[Lt])) return n;
            e = Ma(e);
          }
        return t;
      }
      (e = n), (n = e.parentNode);
    }
    return null;
  }
  function pr(e) {
    return (
      (e = e[Lt] || e[Tn]),
      !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3)
        ? null
        : e
    );
  }
  function jn(e) {
    if (e.tag === 5 || e.tag === 6) return e.stateNode;
    throw Error(a(33));
  }
  function so(e) {
    return e[lo] || null;
  }
  function za(e) {
    var t = e[Da];
    return t === void 0 && (t = e[Da] = new Set()), t;
  }
  var Vi = [],
    kn = -1;
  function bt(e) {
    return { current: e };
  }
  function ke(e) {
    0 > kn || ((e.current = Vi[kn]), (Vi[kn] = null), kn--);
  }
  function Ie(e, t) {
    kn++, (Vi[kn] = e.current), (e.current = t);
  }
  var Mt = {},
    Fe = bt(Mt),
    Ze = bt(!1),
    Kt = Mt;
  function An(e, t) {
    var n = e.type.contextTypes;
    if (!n) return Mt;
    var r = e.stateNode;
    if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
      return r.__reactInternalMemoizedMaskedChildContext;
    var o = {},
      s;
    for (s in n) o[s] = t[s];
    return (
      r &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = t),
        (e.__reactInternalMemoizedMaskedChildContext = o)),
      o
    );
  }
  function Qe(e) {
    return (e = e.childContextTypes), e != null;
  }
  function ao() {
    ke(Ze), ke(Fe);
  }
  function Fa(e, t, n) {
    if (Fe.current !== Mt) throw Error(a(168));
    Ie(Fe, t), Ie(Ze, n);
  }
  function Ua(e, t, n) {
    var r = e.stateNode;
    if (((e = t.childContextTypes), typeof r.getChildContext != "function"))
      return n;
    r = r.getChildContext();
    for (var o in r) if (!(o in e)) throw Error(a(108, fn(t) || "Unknown", o));
    return l({}, n, r);
  }
  function uo(e) {
    return (
      (e =
        ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) ||
        Mt),
      (Kt = Fe.current),
      Ie(Fe, e),
      Ie(Ze, Ze.current),
      !0
    );
  }
  function Ba(e, t, n) {
    var r = e.stateNode;
    if (!r) throw Error(a(169));
    n
      ? ((e = Ua(e, t, Kt)),
        (r.__reactInternalMemoizedMergedChildContext = e),
        ke(Ze),
        ke(Fe),
        Ie(Fe, e))
      : ke(Ze),
      Ie(Ze, n);
  }
  var Hi = null,
    en = null,
    Mf = c.unstable_runWithPriority,
    $i = c.unstable_scheduleCallback,
    Yi = c.unstable_cancelCallback,
    Df = c.unstable_shouldYield,
    Wa = c.unstable_requestPaint,
    Zi = c.unstable_now,
    zf = c.unstable_getCurrentPriorityLevel,
    co = c.unstable_ImmediatePriority,
    Va = c.unstable_UserBlockingPriority,
    Ha = c.unstable_NormalPriority,
    $a = c.unstable_LowPriority,
    Ya = c.unstable_IdlePriority,
    Qi = {},
    Ff = Wa !== void 0 ? Wa : function () {},
    Ct = null,
    fo = null,
    Ji = !1,
    Za = Zi(),
    Ue =
      1e4 > Za
        ? Zi
        : function () {
            return Zi() - Za;
          };
  function Pn() {
    switch (zf()) {
      case co:
        return 99;
      case Va:
        return 98;
      case Ha:
        return 97;
      case $a:
        return 96;
      case Ya:
        return 95;
      default:
        throw Error(a(332));
    }
  }
  function Qa(e) {
    switch (e) {
      case 99:
        return co;
      case 98:
        return Va;
      case 97:
        return Ha;
      case 96:
        return $a;
      case 95:
        return Ya;
      default:
        throw Error(a(332));
    }
  }
  function tn(e, t) {
    return (e = Qa(e)), Mf(e, t);
  }
  function hr(e, t, n) {
    return (e = Qa(e)), $i(e, t, n);
  }
  function ht() {
    if (fo !== null) {
      var e = fo;
      (fo = null), Yi(e);
    }
    Ja();
  }
  function Ja() {
    if (!Ji && Ct !== null) {
      Ji = !0;
      var e = 0;
      try {
        var t = Ct;
        tn(99, function () {
          for (; e < t.length; e++) {
            var n = t[e];
            do n = n(!0);
            while (n !== null);
          }
        }),
          (Ct = null);
      } catch (n) {
        throw (Ct !== null && (Ct = Ct.slice(e + 1)), $i(co, ht), n);
      } finally {
        Ji = !1;
      }
    }
  }
  var Uf = N.ReactCurrentBatchConfig;
  function ct(e, t) {
    if (e && e.defaultProps) {
      (t = l({}, t)), (e = e.defaultProps);
      for (var n in e) t[n] === void 0 && (t[n] = e[n]);
      return t;
    }
    return t;
  }
  var po = bt(null),
    ho = null,
    In = null,
    mo = null;
  function Gi() {
    mo = In = ho = null;
  }
  function qi(e) {
    var t = po.current;
    ke(po), (e.type._context._currentValue = t);
  }
  function Ga(e, t) {
    for (; e !== null; ) {
      var n = e.alternate;
      if ((e.childLanes & t) === t) {
        if (n === null || (n.childLanes & t) === t) break;
        n.childLanes |= t;
      } else (e.childLanes |= t), n !== null && (n.childLanes |= t);
      e = e.return;
    }
  }
  function _n(e, t) {
    (ho = e),
      (mo = In = null),
      (e = e.dependencies),
      e !== null &&
        e.firstContext !== null &&
        ((e.lanes & t) !== 0 && (dt = !0), (e.firstContext = null));
  }
  function lt(e, t) {
    if (mo !== e && t !== !1 && t !== 0)
      if (
        ((typeof t != "number" || t === 1073741823) &&
          ((mo = e), (t = 1073741823)),
        (t = { context: e, observedBits: t, next: null }),
        In === null)
      ) {
        if (ho === null) throw Error(a(308));
        (In = t),
          (ho.dependencies = { lanes: 0, firstContext: t, responders: null });
      } else In = In.next = t;
    return e._currentValue;
  }
  var Dt = !1;
  function Xi(e) {
    e.updateQueue = {
      baseState: e.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null },
      effects: null,
    };
  }
  function qa(e, t) {
    (e = e.updateQueue),
      t.updateQueue === e &&
        (t.updateQueue = {
          baseState: e.baseState,
          firstBaseUpdate: e.firstBaseUpdate,
          lastBaseUpdate: e.lastBaseUpdate,
          shared: e.shared,
          effects: e.effects,
        });
  }
  function zt(e, t) {
    return {
      eventTime: e,
      lane: t,
      tag: 0,
      payload: null,
      callback: null,
      next: null,
    };
  }
  function Ft(e, t) {
    if (((e = e.updateQueue), e !== null)) {
      e = e.shared;
      var n = e.pending;
      n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
        (e.pending = t);
    }
  }
  function Xa(e, t) {
    var n = e.updateQueue,
      r = e.alternate;
    if (r !== null && ((r = r.updateQueue), n === r)) {
      var o = null,
        s = null;
      if (((n = n.firstBaseUpdate), n !== null)) {
        do {
          var d = {
            eventTime: n.eventTime,
            lane: n.lane,
            tag: n.tag,
            payload: n.payload,
            callback: n.callback,
            next: null,
          };
          s === null ? (o = s = d) : (s = s.next = d), (n = n.next);
        } while (n !== null);
        s === null ? (o = s = t) : (s = s.next = t);
      } else o = s = t;
      (n = {
        baseState: r.baseState,
        firstBaseUpdate: o,
        lastBaseUpdate: s,
        shared: r.shared,
        effects: r.effects,
      }),
        (e.updateQueue = n);
      return;
    }
    (e = n.lastBaseUpdate),
      e === null ? (n.firstBaseUpdate = t) : (e.next = t),
      (n.lastBaseUpdate = t);
  }
  function mr(e, t, n, r) {
    var o = e.updateQueue;
    Dt = !1;
    var s = o.firstBaseUpdate,
      d = o.lastBaseUpdate,
      p = o.shared.pending;
    if (p !== null) {
      o.shared.pending = null;
      var v = p,
        A = v.next;
      (v.next = null), d === null ? (s = A) : (d.next = A), (d = v);
      var H = e.alternate;
      if (H !== null) {
        H = H.updateQueue;
        var ae = H.lastBaseUpdate;
        ae !== d &&
          (ae === null ? (H.firstBaseUpdate = A) : (ae.next = A),
          (H.lastBaseUpdate = v));
      }
    }
    if (s !== null) {
      (ae = o.baseState), (d = 0), (H = A = v = null);
      do {
        p = s.lane;
        var D = s.eventTime;
        if ((r & p) === p) {
          H !== null &&
            (H = H.next =
              {
                eventTime: D,
                lane: 0,
                tag: s.tag,
                payload: s.payload,
                callback: s.callback,
                next: null,
              });
          e: {
            var K = e,
              le = s;
            switch (((p = t), (D = n), le.tag)) {
              case 1:
                if (((K = le.payload), typeof K == "function")) {
                  ae = K.call(D, ae, p);
                  break e;
                }
                ae = K;
                break e;
              case 3:
                K.flags = (K.flags & -4097) | 64;
              case 0:
                if (
                  ((K = le.payload),
                  (p = typeof K == "function" ? K.call(D, ae, p) : K),
                  p == null)
                )
                  break e;
                ae = l({}, ae, p);
                break e;
              case 2:
                Dt = !0;
            }
          }
          s.callback !== null &&
            ((e.flags |= 32),
            (p = o.effects),
            p === null ? (o.effects = [s]) : p.push(s));
        } else
          (D = {
            eventTime: D,
            lane: p,
            tag: s.tag,
            payload: s.payload,
            callback: s.callback,
            next: null,
          }),
            H === null ? ((A = H = D), (v = ae)) : (H = H.next = D),
            (d |= p);
        if (((s = s.next), s === null)) {
          if (((p = o.shared.pending), p === null)) break;
          (s = p.next),
            (p.next = null),
            (o.lastBaseUpdate = p),
            (o.shared.pending = null);
        }
      } while (!0);
      H === null && (v = ae),
        (o.baseState = v),
        (o.firstBaseUpdate = A),
        (o.lastBaseUpdate = H),
        (Ar |= d),
        (e.lanes = d),
        (e.memoizedState = ae);
    }
  }
  function Ka(e, t, n) {
    if (((e = t.effects), (t.effects = null), e !== null))
      for (t = 0; t < e.length; t++) {
        var r = e[t],
          o = r.callback;
        if (o !== null) {
          if (((r.callback = null), (r = n), typeof o != "function"))
            throw Error(a(191, o));
          o.call(r);
        }
      }
  }
  var eu = new i.Component().refs;
  function vo(e, t, n, r) {
    (t = e.memoizedState),
      (n = n(r, t)),
      (n = n == null ? t : l({}, t, n)),
      (e.memoizedState = n),
      e.lanes === 0 && (e.updateQueue.baseState = n);
  }
  var yo = {
    isMounted: function (e) {
      return (e = e._reactInternals) ? qt(e) === e : !1;
    },
    enqueueSetState: function (e, t, n) {
      e = e._reactInternals;
      var r = tt(),
        o = Wt(e),
        s = zt(r, o);
      (s.payload = t), n != null && (s.callback = n), Ft(e, s), Vt(e, o, r);
    },
    enqueueReplaceState: function (e, t, n) {
      e = e._reactInternals;
      var r = tt(),
        o = Wt(e),
        s = zt(r, o);
      (s.tag = 1),
        (s.payload = t),
        n != null && (s.callback = n),
        Ft(e, s),
        Vt(e, o, r);
    },
    enqueueForceUpdate: function (e, t) {
      e = e._reactInternals;
      var n = tt(),
        r = Wt(e),
        o = zt(n, r);
      (o.tag = 2), t != null && (o.callback = t), Ft(e, o), Vt(e, r, n);
    },
  };
  function tu(e, t, n, r, o, s, d) {
    return (
      (e = e.stateNode),
      typeof e.shouldComponentUpdate == "function"
        ? e.shouldComponentUpdate(r, s, d)
        : t.prototype && t.prototype.isPureReactComponent
          ? !ur(n, r) || !ur(o, s)
          : !0
    );
  }
  function nu(e, t, n) {
    var r = !1,
      o = Mt,
      s = t.contextType;
    return (
      typeof s == "object" && s !== null
        ? (s = lt(s))
        : ((o = Qe(t) ? Kt : Fe.current),
          (r = t.contextTypes),
          (s = (r = r != null) ? An(e, o) : Mt)),
      (t = new t(n, s)),
      (e.memoizedState =
        t.state !== null && t.state !== void 0 ? t.state : null),
      (t.updater = yo),
      (e.stateNode = t),
      (t._reactInternals = e),
      r &&
        ((e = e.stateNode),
        (e.__reactInternalMemoizedUnmaskedChildContext = o),
        (e.__reactInternalMemoizedMaskedChildContext = s)),
      t
    );
  }
  function ru(e, t, n, r) {
    (e = t.state),
      typeof t.componentWillReceiveProps == "function" &&
        t.componentWillReceiveProps(n, r),
      typeof t.UNSAFE_componentWillReceiveProps == "function" &&
        t.UNSAFE_componentWillReceiveProps(n, r),
      t.state !== e && yo.enqueueReplaceState(t, t.state, null);
  }
  function Ki(e, t, n, r) {
    var o = e.stateNode;
    (o.props = n), (o.state = e.memoizedState), (o.refs = eu), Xi(e);
    var s = t.contextType;
    typeof s == "object" && s !== null
      ? (o.context = lt(s))
      : ((s = Qe(t) ? Kt : Fe.current), (o.context = An(e, s))),
      mr(e, n, o, r),
      (o.state = e.memoizedState),
      (s = t.getDerivedStateFromProps),
      typeof s == "function" && (vo(e, t, s, n), (o.state = e.memoizedState)),
      typeof t.getDerivedStateFromProps == "function" ||
        typeof o.getSnapshotBeforeUpdate == "function" ||
        (typeof o.UNSAFE_componentWillMount != "function" &&
          typeof o.componentWillMount != "function") ||
        ((t = o.state),
        typeof o.componentWillMount == "function" && o.componentWillMount(),
        typeof o.UNSAFE_componentWillMount == "function" &&
          o.UNSAFE_componentWillMount(),
        t !== o.state && yo.enqueueReplaceState(o, o.state, null),
        mr(e, n, o, r),
        (o.state = e.memoizedState)),
      typeof o.componentDidMount == "function" && (e.flags |= 4);
  }
  var go = Array.isArray;
  function vr(e, t, n) {
    if (
      ((e = n.ref),
      e !== null && typeof e != "function" && typeof e != "object")
    ) {
      if (n._owner) {
        if (((n = n._owner), n)) {
          if (n.tag !== 1) throw Error(a(309));
          var r = n.stateNode;
        }
        if (!r) throw Error(a(147, e));
        var o = "" + e;
        return t !== null &&
          t.ref !== null &&
          typeof t.ref == "function" &&
          t.ref._stringRef === o
          ? t.ref
          : ((t = function (s) {
              var d = r.refs;
              d === eu && (d = r.refs = {}),
                s === null ? delete d[o] : (d[o] = s);
            }),
            (t._stringRef = o),
            t);
      }
      if (typeof e != "string") throw Error(a(284));
      if (!n._owner) throw Error(a(290, e));
    }
    return e;
  }
  function wo(e, t) {
    if (e.type !== "textarea")
      throw Error(
        a(
          31,
          Object.prototype.toString.call(t) === "[object Object]"
            ? "object with keys {" + Object.keys(t).join(", ") + "}"
            : t,
        ),
      );
  }
  function ou(e) {
    function t(S, w) {
      if (e) {
        var E = S.lastEffect;
        E !== null
          ? ((E.nextEffect = w), (S.lastEffect = w))
          : (S.firstEffect = S.lastEffect = w),
          (w.nextEffect = null),
          (w.flags = 8);
      }
    }
    function n(S, w) {
      if (!e) return null;
      for (; w !== null; ) t(S, w), (w = w.sibling);
      return null;
    }
    function r(S, w) {
      for (S = new Map(); w !== null; )
        w.key !== null ? S.set(w.key, w) : S.set(w.index, w), (w = w.sibling);
      return S;
    }
    function o(S, w) {
      return (S = Yt(S, w)), (S.index = 0), (S.sibling = null), S;
    }
    function s(S, w, E) {
      return (
        (S.index = E),
        e
          ? ((E = S.alternate),
            E !== null
              ? ((E = E.index), E < w ? ((S.flags = 2), w) : E)
              : ((S.flags = 2), w))
          : w
      );
    }
    function d(S) {
      return e && S.alternate === null && (S.flags = 2), S;
    }
    function p(S, w, E, _) {
      return w === null || w.tag !== 6
        ? ((w = bl(E, S.mode, _)), (w.return = S), w)
        : ((w = o(w, E)), (w.return = S), w);
    }
    function v(S, w, E, _) {
      return w !== null && w.elementType === E.type
        ? ((_ = o(w, E.props)), (_.ref = vr(S, w, E)), (_.return = S), _)
        : ((_ = Do(E.type, E.key, E.props, null, S.mode, _)),
          (_.ref = vr(S, w, E)),
          (_.return = S),
          _);
    }
    function A(S, w, E, _) {
      return w === null ||
        w.tag !== 4 ||
        w.stateNode.containerInfo !== E.containerInfo ||
        w.stateNode.implementation !== E.implementation
        ? ((w = Ml(E, S.mode, _)), (w.return = S), w)
        : ((w = o(w, E.children || [])), (w.return = S), w);
    }
    function H(S, w, E, _, L) {
      return w === null || w.tag !== 7
        ? ((w = zn(E, S.mode, _, L)), (w.return = S), w)
        : ((w = o(w, E)), (w.return = S), w);
    }
    function ae(S, w, E) {
      if (typeof w == "string" || typeof w == "number")
        return (w = bl("" + w, S.mode, E)), (w.return = S), w;
      if (typeof w == "object" && w !== null) {
        switch (w.$$typeof) {
          case V:
            return (
              (E = Do(w.type, w.key, w.props, null, S.mode, E)),
              (E.ref = vr(S, null, w)),
              (E.return = S),
              E
            );
          case Z:
            return (w = Ml(w, S.mode, E)), (w.return = S), w;
        }
        if (go(w) || X(w))
          return (w = zn(w, S.mode, E, null)), (w.return = S), w;
        wo(S, w);
      }
      return null;
    }
    function D(S, w, E, _) {
      var L = w !== null ? w.key : null;
      if (typeof E == "string" || typeof E == "number")
        return L !== null ? null : p(S, w, "" + E, _);
      if (typeof E == "object" && E !== null) {
        switch (E.$$typeof) {
          case V:
            return E.key === L
              ? E.type === $
                ? H(S, w, E.props.children, _, L)
                : v(S, w, E, _)
              : null;
          case Z:
            return E.key === L ? A(S, w, E, _) : null;
        }
        if (go(E) || X(E)) return L !== null ? null : H(S, w, E, _, null);
        wo(S, E);
      }
      return null;
    }
    function K(S, w, E, _, L) {
      if (typeof _ == "string" || typeof _ == "number")
        return (S = S.get(E) || null), p(w, S, "" + _, L);
      if (typeof _ == "object" && _ !== null) {
        switch (_.$$typeof) {
          case V:
            return (
              (S = S.get(_.key === null ? E : _.key) || null),
              _.type === $ ? H(w, S, _.props.children, L, _.key) : v(w, S, _, L)
            );
          case Z:
            return (
              (S = S.get(_.key === null ? E : _.key) || null), A(w, S, _, L)
            );
        }
        if (go(_) || X(_)) return (S = S.get(E) || null), H(w, S, _, L, null);
        wo(w, _);
      }
      return null;
    }
    function le(S, w, E, _) {
      for (
        var L = null, de = null, q = w, fe = (w = 0), ge = null;
        q !== null && fe < E.length;
        fe++
      ) {
        q.index > fe ? ((ge = q), (q = null)) : (ge = q.sibling);
        var he = D(S, q, E[fe], _);
        if (he === null) {
          q === null && (q = ge);
          break;
        }
        e && q && he.alternate === null && t(S, q),
          (w = s(he, w, fe)),
          de === null ? (L = he) : (de.sibling = he),
          (de = he),
          (q = ge);
      }
      if (fe === E.length) return n(S, q), L;
      if (q === null) {
        for (; fe < E.length; fe++)
          (q = ae(S, E[fe], _)),
            q !== null &&
              ((w = s(q, w, fe)),
              de === null ? (L = q) : (de.sibling = q),
              (de = q));
        return L;
      }
      for (q = r(S, q); fe < E.length; fe++)
        (ge = K(q, S, fe, E[fe], _)),
          ge !== null &&
            (e &&
              ge.alternate !== null &&
              q.delete(ge.key === null ? fe : ge.key),
            (w = s(ge, w, fe)),
            de === null ? (L = ge) : (de.sibling = ge),
            (de = ge));
      return (
        e &&
          q.forEach(function (Zt) {
            return t(S, Zt);
          }),
        L
      );
    }
    function re(S, w, E, _) {
      var L = X(E);
      if (typeof L != "function") throw Error(a(150));
      if (((E = L.call(E)), E == null)) throw Error(a(151));
      for (
        var de = (L = null), q = w, fe = (w = 0), ge = null, he = E.next();
        q !== null && !he.done;
        fe++, he = E.next()
      ) {
        q.index > fe ? ((ge = q), (q = null)) : (ge = q.sibling);
        var Zt = D(S, q, he.value, _);
        if (Zt === null) {
          q === null && (q = ge);
          break;
        }
        e && q && Zt.alternate === null && t(S, q),
          (w = s(Zt, w, fe)),
          de === null ? (L = Zt) : (de.sibling = Zt),
          (de = Zt),
          (q = ge);
      }
      if (he.done) return n(S, q), L;
      if (q === null) {
        for (; !he.done; fe++, he = E.next())
          (he = ae(S, he.value, _)),
            he !== null &&
              ((w = s(he, w, fe)),
              de === null ? (L = he) : (de.sibling = he),
              (de = he));
        return L;
      }
      for (q = r(S, q); !he.done; fe++, he = E.next())
        (he = K(q, S, fe, he.value, _)),
          he !== null &&
            (e &&
              he.alternate !== null &&
              q.delete(he.key === null ? fe : he.key),
            (w = s(he, w, fe)),
            de === null ? (L = he) : (de.sibling = he),
            (de = he));
      return (
        e &&
          q.forEach(function (yp) {
            return t(S, yp);
          }),
        L
      );
    }
    return function (S, w, E, _) {
      var L =
        typeof E == "object" && E !== null && E.type === $ && E.key === null;
      L && (E = E.props.children);
      var de = typeof E == "object" && E !== null;
      if (de)
        switch (E.$$typeof) {
          case V:
            e: {
              for (de = E.key, L = w; L !== null; ) {
                if (L.key === de) {
                  switch (L.tag) {
                    case 7:
                      if (E.type === $) {
                        n(S, L.sibling),
                          (w = o(L, E.props.children)),
                          (w.return = S),
                          (S = w);
                        break e;
                      }
                      break;
                    default:
                      if (L.elementType === E.type) {
                        n(S, L.sibling),
                          (w = o(L, E.props)),
                          (w.ref = vr(S, L, E)),
                          (w.return = S),
                          (S = w);
                        break e;
                      }
                  }
                  n(S, L);
                  break;
                } else t(S, L);
                L = L.sibling;
              }
              E.type === $
                ? ((w = zn(E.props.children, S.mode, _, E.key)),
                  (w.return = S),
                  (S = w))
                : ((_ = Do(E.type, E.key, E.props, null, S.mode, _)),
                  (_.ref = vr(S, w, E)),
                  (_.return = S),
                  (S = _));
            }
            return d(S);
          case Z:
            e: {
              for (L = E.key; w !== null; ) {
                if (w.key === L)
                  if (
                    w.tag === 4 &&
                    w.stateNode.containerInfo === E.containerInfo &&
                    w.stateNode.implementation === E.implementation
                  ) {
                    n(S, w.sibling),
                      (w = o(w, E.children || [])),
                      (w.return = S),
                      (S = w);
                    break e;
                  } else {
                    n(S, w);
                    break;
                  }
                else t(S, w);
                w = w.sibling;
              }
              (w = Ml(E, S.mode, _)), (w.return = S), (S = w);
            }
            return d(S);
        }
      if (typeof E == "string" || typeof E == "number")
        return (
          (E = "" + E),
          w !== null && w.tag === 6
            ? (n(S, w.sibling), (w = o(w, E)), (w.return = S), (S = w))
            : (n(S, w), (w = bl(E, S.mode, _)), (w.return = S), (S = w)),
          d(S)
        );
      if (go(E)) return le(S, w, E, _);
      if (X(E)) return re(S, w, E, _);
      if ((de && wo(S, E), typeof E > "u" && !L))
        switch (S.tag) {
          case 1:
          case 22:
          case 0:
          case 11:
          case 15:
            throw Error(a(152, fn(S.type) || "Component"));
        }
      return n(S, w);
    };
  }
  var xo = ou(!0),
    iu = ou(!1),
    yr = {},
    mt = bt(yr),
    gr = bt(yr),
    wr = bt(yr);
  function nn(e) {
    if (e === yr) throw Error(a(174));
    return e;
  }
  function el(e, t) {
    switch ((Ie(wr, t), Ie(gr, e), Ie(mt, yr), (e = t.nodeType), e)) {
      case 9:
      case 11:
        t = (t = t.documentElement) ? t.namespaceURI : ii(null, "");
        break;
      default:
        (e = e === 8 ? t.parentNode : t),
          (t = e.namespaceURI || null),
          (e = e.tagName),
          (t = ii(t, e));
    }
    ke(mt), Ie(mt, t);
  }
  function On() {
    ke(mt), ke(gr), ke(wr);
  }
  function lu(e) {
    nn(wr.current);
    var t = nn(mt.current),
      n = ii(t, e.type);
    t !== n && (Ie(gr, e), Ie(mt, n));
  }
  function tl(e) {
    gr.current === e && (ke(mt), ke(gr));
  }
  var _e = bt(0);
  function Co(e) {
    for (var t = e; t !== null; ) {
      if (t.tag === 13) {
        var n = t.memoizedState;
        if (
          n !== null &&
          ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!")
        )
          return t;
      } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
        if ((t.flags & 64) !== 0) return t;
      } else if (t.child !== null) {
        (t.child.return = t), (t = t.child);
        continue;
      }
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return null;
        t = t.return;
      }
      (t.sibling.return = t.return), (t = t.sibling);
    }
    return null;
  }
  var Et = null,
    Ut = null,
    vt = !1;
  function su(e, t) {
    var n = ut(5, null, null, 0);
    (n.elementType = "DELETED"),
      (n.type = "DELETED"),
      (n.stateNode = t),
      (n.return = e),
      (n.flags = 8),
      e.lastEffect !== null
        ? ((e.lastEffect.nextEffect = n), (e.lastEffect = n))
        : (e.firstEffect = e.lastEffect = n);
  }
  function au(e, t) {
    switch (e.tag) {
      case 5:
        var n = e.type;
        return (
          (t =
            t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
              ? null
              : t),
          t !== null ? ((e.stateNode = t), !0) : !1
        );
      case 6:
        return (
          (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
          t !== null ? ((e.stateNode = t), !0) : !1
        );
      case 13:
        return !1;
      default:
        return !1;
    }
  }
  function nl(e) {
    if (vt) {
      var t = Ut;
      if (t) {
        var n = t;
        if (!au(e, t)) {
          if (((t = Sn(n.nextSibling)), !t || !au(e, t))) {
            (e.flags = (e.flags & -1025) | 2), (vt = !1), (Et = e);
            return;
          }
          su(Et, n);
        }
        (Et = e), (Ut = Sn(t.firstChild));
      } else (e.flags = (e.flags & -1025) | 2), (vt = !1), (Et = e);
    }
  }
  function uu(e) {
    for (
      e = e.return;
      e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13;

    )
      e = e.return;
    Et = e;
  }
  function Eo(e) {
    if (e !== Et) return !1;
    if (!vt) return uu(e), (vt = !0), !1;
    var t = e.type;
    if (
      e.tag !== 5 ||
      (t !== "head" && t !== "body" && !Ui(t, e.memoizedProps))
    )
      for (t = Ut; t; ) su(e, t), (t = Sn(t.nextSibling));
    if ((uu(e), e.tag === 13)) {
      if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
        throw Error(a(317));
      e: {
        for (e = e.nextSibling, t = 0; e; ) {
          if (e.nodeType === 8) {
            var n = e.data;
            if (n === "/$") {
              if (t === 0) {
                Ut = Sn(e.nextSibling);
                break e;
              }
              t--;
            } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
          }
          e = e.nextSibling;
        }
        Ut = null;
      }
    } else Ut = Et ? Sn(e.stateNode.nextSibling) : null;
    return !0;
  }
  function rl() {
    (Ut = Et = null), (vt = !1);
  }
  var Nn = [];
  function ol() {
    for (var e = 0; e < Nn.length; e++)
      Nn[e]._workInProgressVersionPrimary = null;
    Nn.length = 0;
  }
  var xr = N.ReactCurrentDispatcher,
    st = N.ReactCurrentBatchConfig,
    Cr = 0,
    Ne = null,
    Be = null,
    De = null,
    So = !1,
    Er = !1;
  function Je() {
    throw Error(a(321));
  }
  function il(e, t) {
    if (t === null) return !1;
    for (var n = 0; n < t.length && n < e.length; n++)
      if (!it(e[n], t[n])) return !1;
    return !0;
  }
  function ll(e, t, n, r, o, s) {
    if (
      ((Cr = s),
      (Ne = t),
      (t.memoizedState = null),
      (t.updateQueue = null),
      (t.lanes = 0),
      (xr.current = e === null || e.memoizedState === null ? Wf : Vf),
      (e = n(r, o)),
      Er)
    ) {
      s = 0;
      do {
        if (((Er = !1), !(25 > s))) throw Error(a(301));
        (s += 1),
          (De = Be = null),
          (t.updateQueue = null),
          (xr.current = Hf),
          (e = n(r, o));
      } while (Er);
    }
    if (
      ((xr.current = Ao),
      (t = Be !== null && Be.next !== null),
      (Cr = 0),
      (De = Be = Ne = null),
      (So = !1),
      t)
    )
      throw Error(a(300));
    return e;
  }
  function rn() {
    var e = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return De === null ? (Ne.memoizedState = De = e) : (De = De.next = e), De;
  }
  function on() {
    if (Be === null) {
      var e = Ne.alternate;
      e = e !== null ? e.memoizedState : null;
    } else e = Be.next;
    var t = De === null ? Ne.memoizedState : De.next;
    if (t !== null) (De = t), (Be = e);
    else {
      if (e === null) throw Error(a(310));
      (Be = e),
        (e = {
          memoizedState: Be.memoizedState,
          baseState: Be.baseState,
          baseQueue: Be.baseQueue,
          queue: Be.queue,
          next: null,
        }),
        De === null ? (Ne.memoizedState = De = e) : (De = De.next = e);
    }
    return De;
  }
  function yt(e, t) {
    return typeof t == "function" ? t(e) : t;
  }
  function Sr(e) {
    var t = on(),
      n = t.queue;
    if (n === null) throw Error(a(311));
    n.lastRenderedReducer = e;
    var r = Be,
      o = r.baseQueue,
      s = n.pending;
    if (s !== null) {
      if (o !== null) {
        var d = o.next;
        (o.next = s.next), (s.next = d);
      }
      (r.baseQueue = o = s), (n.pending = null);
    }
    if (o !== null) {
      (o = o.next), (r = r.baseState);
      var p = (d = s = null),
        v = o;
      do {
        var A = v.lane;
        if ((Cr & A) === A)
          p !== null &&
            (p = p.next =
              {
                lane: 0,
                action: v.action,
                eagerReducer: v.eagerReducer,
                eagerState: v.eagerState,
                next: null,
              }),
            (r = v.eagerReducer === e ? v.eagerState : e(r, v.action));
        else {
          var H = {
            lane: A,
            action: v.action,
            eagerReducer: v.eagerReducer,
            eagerState: v.eagerState,
            next: null,
          };
          p === null ? ((d = p = H), (s = r)) : (p = p.next = H),
            (Ne.lanes |= A),
            (Ar |= A);
        }
        v = v.next;
      } while (v !== null && v !== o);
      p === null ? (s = r) : (p.next = d),
        it(r, t.memoizedState) || (dt = !0),
        (t.memoizedState = r),
        (t.baseState = s),
        (t.baseQueue = p),
        (n.lastRenderedState = r);
    }
    return [t.memoizedState, n.dispatch];
  }
  function Tr(e) {
    var t = on(),
      n = t.queue;
    if (n === null) throw Error(a(311));
    n.lastRenderedReducer = e;
    var r = n.dispatch,
      o = n.pending,
      s = t.memoizedState;
    if (o !== null) {
      n.pending = null;
      var d = (o = o.next);
      do (s = e(s, d.action)), (d = d.next);
      while (d !== o);
      it(s, t.memoizedState) || (dt = !0),
        (t.memoizedState = s),
        t.baseQueue === null && (t.baseState = s),
        (n.lastRenderedState = s);
    }
    return [s, r];
  }
  function cu(e, t, n) {
    var r = t._getVersion;
    r = r(t._source);
    var o = t._workInProgressVersionPrimary;
    if (
      (o !== null
        ? (e = o === r)
        : ((e = e.mutableReadLanes),
          (e = (Cr & e) === e) &&
            ((t._workInProgressVersionPrimary = r), Nn.push(t))),
      e)
    )
      return n(t._source);
    throw (Nn.push(t), Error(a(350)));
  }
  function du(e, t, n, r) {
    var o = He;
    if (o === null) throw Error(a(349));
    var s = t._getVersion,
      d = s(t._source),
      p = xr.current,
      v = p.useState(function () {
        return cu(o, t, n);
      }),
      A = v[1],
      H = v[0];
    v = De;
    var ae = e.memoizedState,
      D = ae.refs,
      K = D.getSnapshot,
      le = ae.source;
    ae = ae.subscribe;
    var re = Ne;
    return (
      (e.memoizedState = { refs: D, source: t, subscribe: r }),
      p.useEffect(
        function () {
          (D.getSnapshot = n), (D.setSnapshot = A);
          var S = s(t._source);
          if (!it(d, S)) {
            (S = n(t._source)),
              it(H, S) ||
                (A(S),
                (S = Wt(re)),
                (o.mutableReadLanes |= S & o.pendingLanes)),
              (S = o.mutableReadLanes),
              (o.entangledLanes |= S);
            for (var w = o.entanglements, E = S; 0 < E; ) {
              var _ = 31 - Nt(E),
                L = 1 << _;
              (w[_] |= S), (E &= ~L);
            }
          }
        },
        [n, t, r],
      ),
      p.useEffect(
        function () {
          return r(t._source, function () {
            var S = D.getSnapshot,
              w = D.setSnapshot;
            try {
              w(S(t._source));
              var E = Wt(re);
              o.mutableReadLanes |= E & o.pendingLanes;
            } catch (_) {
              w(function () {
                throw _;
              });
            }
          });
        },
        [t, r],
      ),
      (it(K, n) && it(le, t) && it(ae, r)) ||
        ((e = {
          pending: null,
          dispatch: null,
          lastRenderedReducer: yt,
          lastRenderedState: H,
        }),
        (e.dispatch = A = cl.bind(null, Ne, e)),
        (v.queue = e),
        (v.baseQueue = null),
        (H = cu(o, t, n)),
        (v.memoizedState = v.baseState = H)),
      H
    );
  }
  function fu(e, t, n) {
    var r = on();
    return du(r, e, t, n);
  }
  function jr(e) {
    var t = rn();
    return (
      typeof e == "function" && (e = e()),
      (t.memoizedState = t.baseState = e),
      (e = t.queue =
        {
          pending: null,
          dispatch: null,
          lastRenderedReducer: yt,
          lastRenderedState: e,
        }),
      (e = e.dispatch = cl.bind(null, Ne, e)),
      [t.memoizedState, e]
    );
  }
  function To(e, t, n, r) {
    return (
      (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
      (t = Ne.updateQueue),
      t === null
        ? ((t = { lastEffect: null }),
          (Ne.updateQueue = t),
          (t.lastEffect = e.next = e))
        : ((n = t.lastEffect),
          n === null
            ? (t.lastEffect = e.next = e)
            : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
      e
    );
  }
  function pu(e) {
    var t = rn();
    return (e = { current: e }), (t.memoizedState = e);
  }
  function jo() {
    return on().memoizedState;
  }
  function sl(e, t, n, r) {
    var o = rn();
    (Ne.flags |= e),
      (o.memoizedState = To(1 | t, n, void 0, r === void 0 ? null : r));
  }
  function al(e, t, n, r) {
    var o = on();
    r = r === void 0 ? null : r;
    var s = void 0;
    if (Be !== null) {
      var d = Be.memoizedState;
      if (((s = d.destroy), r !== null && il(r, d.deps))) {
        To(t, n, s, r);
        return;
      }
    }
    (Ne.flags |= e), (o.memoizedState = To(1 | t, n, s, r));
  }
  function hu(e, t) {
    return sl(516, 4, e, t);
  }
  function ko(e, t) {
    return al(516, 4, e, t);
  }
  function mu(e, t) {
    return al(4, 2, e, t);
  }
  function vu(e, t) {
    if (typeof t == "function")
      return (
        (e = e()),
        t(e),
        function () {
          t(null);
        }
      );
    if (t != null)
      return (
        (e = e()),
        (t.current = e),
        function () {
          t.current = null;
        }
      );
  }
  function yu(e, t, n) {
    return (
      (n = n != null ? n.concat([e]) : null), al(4, 2, vu.bind(null, t, e), n)
    );
  }
  function ul() {}
  function gu(e, t) {
    var n = on();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return r !== null && t !== null && il(t, r[1])
      ? r[0]
      : ((n.memoizedState = [e, t]), e);
  }
  function wu(e, t) {
    var n = on();
    t = t === void 0 ? null : t;
    var r = n.memoizedState;
    return r !== null && t !== null && il(t, r[1])
      ? r[0]
      : ((e = e()), (n.memoizedState = [e, t]), e);
  }
  function Bf(e, t) {
    var n = Pn();
    tn(98 > n ? 98 : n, function () {
      e(!0);
    }),
      tn(97 < n ? 97 : n, function () {
        var r = st.transition;
        st.transition = 1;
        try {
          e(!1), t();
        } finally {
          st.transition = r;
        }
      });
  }
  function cl(e, t, n) {
    var r = tt(),
      o = Wt(e),
      s = {
        lane: o,
        action: n,
        eagerReducer: null,
        eagerState: null,
        next: null,
      },
      d = t.pending;
    if (
      (d === null ? (s.next = s) : ((s.next = d.next), (d.next = s)),
      (t.pending = s),
      (d = e.alternate),
      e === Ne || (d !== null && d === Ne))
    )
      Er = So = !0;
    else {
      if (
        e.lanes === 0 &&
        (d === null || d.lanes === 0) &&
        ((d = t.lastRenderedReducer), d !== null)
      )
        try {
          var p = t.lastRenderedState,
            v = d(p, n);
          if (((s.eagerReducer = d), (s.eagerState = v), it(v, p))) return;
        } catch {
        } finally {
        }
      Vt(e, o, r);
    }
  }
  var Ao = {
      readContext: lt,
      useCallback: Je,
      useContext: Je,
      useEffect: Je,
      useImperativeHandle: Je,
      useLayoutEffect: Je,
      useMemo: Je,
      useReducer: Je,
      useRef: Je,
      useState: Je,
      useDebugValue: Je,
      useDeferredValue: Je,
      useTransition: Je,
      useMutableSource: Je,
      useOpaqueIdentifier: Je,
      unstable_isNewReconciler: !1,
    },
    Wf = {
      readContext: lt,
      useCallback: function (e, t) {
        return (rn().memoizedState = [e, t === void 0 ? null : t]), e;
      },
      useContext: lt,
      useEffect: hu,
      useImperativeHandle: function (e, t, n) {
        return (
          (n = n != null ? n.concat([e]) : null),
          sl(4, 2, vu.bind(null, t, e), n)
        );
      },
      useLayoutEffect: function (e, t) {
        return sl(4, 2, e, t);
      },
      useMemo: function (e, t) {
        var n = rn();
        return (
          (t = t === void 0 ? null : t),
          (e = e()),
          (n.memoizedState = [e, t]),
          e
        );
      },
      useReducer: function (e, t, n) {
        var r = rn();
        return (
          (t = n !== void 0 ? n(t) : t),
          (r.memoizedState = r.baseState = t),
          (e = r.queue =
            {
              pending: null,
              dispatch: null,
              lastRenderedReducer: e,
              lastRenderedState: t,
            }),
          (e = e.dispatch = cl.bind(null, Ne, e)),
          [r.memoizedState, e]
        );
      },
      useRef: pu,
      useState: jr,
      useDebugValue: ul,
      useDeferredValue: function (e) {
        var t = jr(e),
          n = t[0],
          r = t[1];
        return (
          hu(
            function () {
              var o = st.transition;
              st.transition = 1;
              try {
                r(e);
              } finally {
                st.transition = o;
              }
            },
            [e],
          ),
          n
        );
      },
      useTransition: function () {
        var e = jr(!1),
          t = e[0];
        return (e = Bf.bind(null, e[1])), pu(e), [e, t];
      },
      useMutableSource: function (e, t, n) {
        var r = rn();
        return (
          (r.memoizedState = {
            refs: { getSnapshot: t, setSnapshot: null },
            source: e,
            subscribe: n,
          }),
          du(r, e, t, n)
        );
      },
      useOpaqueIdentifier: function () {
        if (vt) {
          var e = !1,
            t = bf(function () {
              throw (
                (e || ((e = !0), n("r:" + (Wi++).toString(36))), Error(a(355)))
              );
            }),
            n = jr(t)[1];
          return (
            (Ne.mode & 2) === 0 &&
              ((Ne.flags |= 516),
              To(
                5,
                function () {
                  n("r:" + (Wi++).toString(36));
                },
                void 0,
                null,
              )),
            t
          );
        }
        return (t = "r:" + (Wi++).toString(36)), jr(t), t;
      },
      unstable_isNewReconciler: !1,
    },
    Vf = {
      readContext: lt,
      useCallback: gu,
      useContext: lt,
      useEffect: ko,
      useImperativeHandle: yu,
      useLayoutEffect: mu,
      useMemo: wu,
      useReducer: Sr,
      useRef: jo,
      useState: function () {
        return Sr(yt);
      },
      useDebugValue: ul,
      useDeferredValue: function (e) {
        var t = Sr(yt),
          n = t[0],
          r = t[1];
        return (
          ko(
            function () {
              var o = st.transition;
              st.transition = 1;
              try {
                r(e);
              } finally {
                st.transition = o;
              }
            },
            [e],
          ),
          n
        );
      },
      useTransition: function () {
        var e = Sr(yt)[0];
        return [jo().current, e];
      },
      useMutableSource: fu,
      useOpaqueIdentifier: function () {
        return Sr(yt)[0];
      },
      unstable_isNewReconciler: !1,
    },
    Hf = {
      readContext: lt,
      useCallback: gu,
      useContext: lt,
      useEffect: ko,
      useImperativeHandle: yu,
      useLayoutEffect: mu,
      useMemo: wu,
      useReducer: Tr,
      useRef: jo,
      useState: function () {
        return Tr(yt);
      },
      useDebugValue: ul,
      useDeferredValue: function (e) {
        var t = Tr(yt),
          n = t[0],
          r = t[1];
        return (
          ko(
            function () {
              var o = st.transition;
              st.transition = 1;
              try {
                r(e);
              } finally {
                st.transition = o;
              }
            },
            [e],
          ),
          n
        );
      },
      useTransition: function () {
        var e = Tr(yt)[0];
        return [jo().current, e];
      },
      useMutableSource: fu,
      useOpaqueIdentifier: function () {
        return Tr(yt)[0];
      },
      unstable_isNewReconciler: !1,
    },
    $f = N.ReactCurrentOwner,
    dt = !1;
  function Ge(e, t, n, r) {
    t.child = e === null ? iu(t, null, n, r) : xo(t, e.child, n, r);
  }
  function xu(e, t, n, r, o) {
    n = n.render;
    var s = t.ref;
    return (
      _n(t, o),
      (r = ll(e, t, n, r, s, o)),
      e !== null && !dt
        ? ((t.updateQueue = e.updateQueue),
          (t.flags &= -517),
          (e.lanes &= ~o),
          St(e, t, o))
        : ((t.flags |= 1), Ge(e, t, r, o), t.child)
    );
  }
  function Cu(e, t, n, r, o, s) {
    if (e === null) {
      var d = n.type;
      return typeof d == "function" &&
        !Rl(d) &&
        d.defaultProps === void 0 &&
        n.compare === null &&
        n.defaultProps === void 0
        ? ((t.tag = 15), (t.type = d), Eu(e, t, d, r, o, s))
        : ((e = Do(n.type, null, r, t, t.mode, s)),
          (e.ref = t.ref),
          (e.return = t),
          (t.child = e));
    }
    return (
      (d = e.child),
      (o & s) === 0 &&
      ((o = d.memoizedProps),
      (n = n.compare),
      (n = n !== null ? n : ur),
      n(o, r) && e.ref === t.ref)
        ? St(e, t, s)
        : ((t.flags |= 1),
          (e = Yt(d, r)),
          (e.ref = t.ref),
          (e.return = t),
          (t.child = e))
    );
  }
  function Eu(e, t, n, r, o, s) {
    if (e !== null && ur(e.memoizedProps, r) && e.ref === t.ref)
      if (((dt = !1), (s & o) !== 0)) (e.flags & 16384) !== 0 && (dt = !0);
      else return (t.lanes = e.lanes), St(e, t, s);
    return fl(e, t, n, r, s);
  }
  function dl(e, t, n) {
    var r = t.pendingProps,
      o = r.children,
      s = e !== null ? e.memoizedState : null;
    if (r.mode === "hidden" || r.mode === "unstable-defer-without-hiding")
      if ((t.mode & 4) === 0) (t.memoizedState = { baseLanes: 0 }), Mo(t, n);
      else if ((n & 1073741824) !== 0)
        (t.memoizedState = { baseLanes: 0 }),
          Mo(t, s !== null ? s.baseLanes : n);
      else
        return (
          (e = s !== null ? s.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = { baseLanes: e }),
          Mo(t, e),
          null
        );
    else
      s !== null ? ((r = s.baseLanes | n), (t.memoizedState = null)) : (r = n),
        Mo(t, r);
    return Ge(e, t, o, n), t.child;
  }
  function Su(e, t) {
    var n = t.ref;
    ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
      (t.flags |= 128);
  }
  function fl(e, t, n, r, o) {
    var s = Qe(n) ? Kt : Fe.current;
    return (
      (s = An(t, s)),
      _n(t, o),
      (n = ll(e, t, n, r, s, o)),
      e !== null && !dt
        ? ((t.updateQueue = e.updateQueue),
          (t.flags &= -517),
          (e.lanes &= ~o),
          St(e, t, o))
        : ((t.flags |= 1), Ge(e, t, n, o), t.child)
    );
  }
  function Tu(e, t, n, r, o) {
    if (Qe(n)) {
      var s = !0;
      uo(t);
    } else s = !1;
    if ((_n(t, o), t.stateNode === null))
      e !== null &&
        ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
        nu(t, n, r),
        Ki(t, n, r, o),
        (r = !0);
    else if (e === null) {
      var d = t.stateNode,
        p = t.memoizedProps;
      d.props = p;
      var v = d.context,
        A = n.contextType;
      typeof A == "object" && A !== null
        ? (A = lt(A))
        : ((A = Qe(n) ? Kt : Fe.current), (A = An(t, A)));
      var H = n.getDerivedStateFromProps,
        ae =
          typeof H == "function" ||
          typeof d.getSnapshotBeforeUpdate == "function";
      ae ||
        (typeof d.UNSAFE_componentWillReceiveProps != "function" &&
          typeof d.componentWillReceiveProps != "function") ||
        ((p !== r || v !== A) && ru(t, d, r, A)),
        (Dt = !1);
      var D = t.memoizedState;
      (d.state = D),
        mr(t, r, d, o),
        (v = t.memoizedState),
        p !== r || D !== v || Ze.current || Dt
          ? (typeof H == "function" && (vo(t, n, H, r), (v = t.memoizedState)),
            (p = Dt || tu(t, n, p, r, D, v, A))
              ? (ae ||
                  (typeof d.UNSAFE_componentWillMount != "function" &&
                    typeof d.componentWillMount != "function") ||
                  (typeof d.componentWillMount == "function" &&
                    d.componentWillMount(),
                  typeof d.UNSAFE_componentWillMount == "function" &&
                    d.UNSAFE_componentWillMount()),
                typeof d.componentDidMount == "function" && (t.flags |= 4))
              : (typeof d.componentDidMount == "function" && (t.flags |= 4),
                (t.memoizedProps = r),
                (t.memoizedState = v)),
            (d.props = r),
            (d.state = v),
            (d.context = A),
            (r = p))
          : (typeof d.componentDidMount == "function" && (t.flags |= 4),
            (r = !1));
    } else {
      (d = t.stateNode),
        qa(e, t),
        (p = t.memoizedProps),
        (A = t.type === t.elementType ? p : ct(t.type, p)),
        (d.props = A),
        (ae = t.pendingProps),
        (D = d.context),
        (v = n.contextType),
        typeof v == "object" && v !== null
          ? (v = lt(v))
          : ((v = Qe(n) ? Kt : Fe.current), (v = An(t, v)));
      var K = n.getDerivedStateFromProps;
      (H =
        typeof K == "function" ||
        typeof d.getSnapshotBeforeUpdate == "function") ||
        (typeof d.UNSAFE_componentWillReceiveProps != "function" &&
          typeof d.componentWillReceiveProps != "function") ||
        ((p !== ae || D !== v) && ru(t, d, r, v)),
        (Dt = !1),
        (D = t.memoizedState),
        (d.state = D),
        mr(t, r, d, o);
      var le = t.memoizedState;
      p !== ae || D !== le || Ze.current || Dt
        ? (typeof K == "function" && (vo(t, n, K, r), (le = t.memoizedState)),
          (A = Dt || tu(t, n, A, r, D, le, v))
            ? (H ||
                (typeof d.UNSAFE_componentWillUpdate != "function" &&
                  typeof d.componentWillUpdate != "function") ||
                (typeof d.componentWillUpdate == "function" &&
                  d.componentWillUpdate(r, le, v),
                typeof d.UNSAFE_componentWillUpdate == "function" &&
                  d.UNSAFE_componentWillUpdate(r, le, v)),
              typeof d.componentDidUpdate == "function" && (t.flags |= 4),
              typeof d.getSnapshotBeforeUpdate == "function" &&
                (t.flags |= 256))
            : (typeof d.componentDidUpdate != "function" ||
                (p === e.memoizedProps && D === e.memoizedState) ||
                (t.flags |= 4),
              typeof d.getSnapshotBeforeUpdate != "function" ||
                (p === e.memoizedProps && D === e.memoizedState) ||
                (t.flags |= 256),
              (t.memoizedProps = r),
              (t.memoizedState = le)),
          (d.props = r),
          (d.state = le),
          (d.context = v),
          (r = A))
        : (typeof d.componentDidUpdate != "function" ||
            (p === e.memoizedProps && D === e.memoizedState) ||
            (t.flags |= 4),
          typeof d.getSnapshotBeforeUpdate != "function" ||
            (p === e.memoizedProps && D === e.memoizedState) ||
            (t.flags |= 256),
          (r = !1));
    }
    return pl(e, t, n, r, s, o);
  }
  function pl(e, t, n, r, o, s) {
    Su(e, t);
    var d = (t.flags & 64) !== 0;
    if (!r && !d) return o && Ba(t, n, !1), St(e, t, s);
    (r = t.stateNode), ($f.current = t);
    var p =
      d && typeof n.getDerivedStateFromError != "function" ? null : r.render();
    return (
      (t.flags |= 1),
      e !== null && d
        ? ((t.child = xo(t, e.child, null, s)), (t.child = xo(t, null, p, s)))
        : Ge(e, t, p, s),
      (t.memoizedState = r.state),
      o && Ba(t, n, !0),
      t.child
    );
  }
  function ju(e) {
    var t = e.stateNode;
    t.pendingContext
      ? Fa(e, t.pendingContext, t.pendingContext !== t.context)
      : t.context && Fa(e, t.context, !1),
      el(e, t.containerInfo);
  }
  var Po = { dehydrated: null, retryLane: 0 };
  function ku(e, t, n) {
    var r = t.pendingProps,
      o = _e.current,
      s = !1,
      d;
    return (
      (d = (t.flags & 64) !== 0) ||
        (d = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
      d
        ? ((s = !0), (t.flags &= -65))
        : (e !== null && e.memoizedState === null) ||
          r.fallback === void 0 ||
          r.unstable_avoidThisFallback === !0 ||
          (o |= 1),
      Ie(_e, o & 1),
      e === null
        ? (r.fallback !== void 0 && nl(t),
          (e = r.children),
          (o = r.fallback),
          s
            ? ((e = Au(t, e, o, n)),
              (t.child.memoizedState = { baseLanes: n }),
              (t.memoizedState = Po),
              e)
            : typeof r.unstable_expectedLoadTime == "number"
              ? ((e = Au(t, e, o, n)),
                (t.child.memoizedState = { baseLanes: n }),
                (t.memoizedState = Po),
                (t.lanes = 33554432),
                e)
              : ((n = Ll({ mode: "visible", children: e }, t.mode, n, null)),
                (n.return = t),
                (t.child = n)))
        : e.memoizedState !== null
          ? s
            ? ((r = Iu(e, t, r.children, r.fallback, n)),
              (s = t.child),
              (o = e.child.memoizedState),
              (s.memoizedState =
                o === null ? { baseLanes: n } : { baseLanes: o.baseLanes | n }),
              (s.childLanes = e.childLanes & ~n),
              (t.memoizedState = Po),
              r)
            : ((n = Pu(e, t, r.children, n)), (t.memoizedState = null), n)
          : s
            ? ((r = Iu(e, t, r.children, r.fallback, n)),
              (s = t.child),
              (o = e.child.memoizedState),
              (s.memoizedState =
                o === null ? { baseLanes: n } : { baseLanes: o.baseLanes | n }),
              (s.childLanes = e.childLanes & ~n),
              (t.memoizedState = Po),
              r)
            : ((n = Pu(e, t, r.children, n)), (t.memoizedState = null), n)
    );
  }
  function Au(e, t, n, r) {
    var o = e.mode,
      s = e.child;
    return (
      (t = { mode: "hidden", children: t }),
      (o & 2) === 0 && s !== null
        ? ((s.childLanes = 0), (s.pendingProps = t))
        : (s = Ll(t, o, 0, null)),
      (n = zn(n, o, r, null)),
      (s.return = e),
      (n.return = e),
      (s.sibling = n),
      (e.child = s),
      n
    );
  }
  function Pu(e, t, n, r) {
    var o = e.child;
    return (
      (e = o.sibling),
      (n = Yt(o, { mode: "visible", children: n })),
      (t.mode & 2) === 0 && (n.lanes = r),
      (n.return = t),
      (n.sibling = null),
      e !== null &&
        ((e.nextEffect = null),
        (e.flags = 8),
        (t.firstEffect = t.lastEffect = e)),
      (t.child = n)
    );
  }
  function Iu(e, t, n, r, o) {
    var s = t.mode,
      d = e.child;
    e = d.sibling;
    var p = { mode: "hidden", children: n };
    return (
      (s & 2) === 0 && t.child !== d
        ? ((n = t.child),
          (n.childLanes = 0),
          (n.pendingProps = p),
          (d = n.lastEffect),
          d !== null
            ? ((t.firstEffect = n.firstEffect),
              (t.lastEffect = d),
              (d.nextEffect = null))
            : (t.firstEffect = t.lastEffect = null))
        : (n = Yt(d, p)),
      e !== null ? (r = Yt(e, r)) : ((r = zn(r, s, o, null)), (r.flags |= 2)),
      (r.return = t),
      (n.return = t),
      (n.sibling = r),
      (t.child = n),
      r
    );
  }
  function _u(e, t) {
    e.lanes |= t;
    var n = e.alternate;
    n !== null && (n.lanes |= t), Ga(e.return, t);
  }
  function hl(e, t, n, r, o, s) {
    var d = e.memoizedState;
    d === null
      ? (e.memoizedState = {
          isBackwards: t,
          rendering: null,
          renderingStartTime: 0,
          last: r,
          tail: n,
          tailMode: o,
          lastEffect: s,
        })
      : ((d.isBackwards = t),
        (d.rendering = null),
        (d.renderingStartTime = 0),
        (d.last = r),
        (d.tail = n),
        (d.tailMode = o),
        (d.lastEffect = s));
  }
  function Ou(e, t, n) {
    var r = t.pendingProps,
      o = r.revealOrder,
      s = r.tail;
    if ((Ge(e, t, r.children, n), (r = _e.current), (r & 2) !== 0))
      (r = (r & 1) | 2), (t.flags |= 64);
    else {
      if (e !== null && (e.flags & 64) !== 0)
        e: for (e = t.child; e !== null; ) {
          if (e.tag === 13) e.memoizedState !== null && _u(e, n);
          else if (e.tag === 19) _u(e, n);
          else if (e.child !== null) {
            (e.child.return = e), (e = e.child);
            continue;
          }
          if (e === t) break e;
          for (; e.sibling === null; ) {
            if (e.return === null || e.return === t) break e;
            e = e.return;
          }
          (e.sibling.return = e.return), (e = e.sibling);
        }
      r &= 1;
    }
    if ((Ie(_e, r), (t.mode & 2) === 0)) t.memoizedState = null;
    else
      switch (o) {
        case "forwards":
          for (n = t.child, o = null; n !== null; )
            (e = n.alternate),
              e !== null && Co(e) === null && (o = n),
              (n = n.sibling);
          (n = o),
            n === null
              ? ((o = t.child), (t.child = null))
              : ((o = n.sibling), (n.sibling = null)),
            hl(t, !1, o, n, s, t.lastEffect);
          break;
        case "backwards":
          for (n = null, o = t.child, t.child = null; o !== null; ) {
            if (((e = o.alternate), e !== null && Co(e) === null)) {
              t.child = o;
              break;
            }
            (e = o.sibling), (o.sibling = n), (n = o), (o = e);
          }
          hl(t, !0, n, null, s, t.lastEffect);
          break;
        case "together":
          hl(t, !1, null, null, void 0, t.lastEffect);
          break;
        default:
          t.memoizedState = null;
      }
    return t.child;
  }
  function St(e, t, n) {
    if (
      (e !== null && (t.dependencies = e.dependencies),
      (Ar |= t.lanes),
      (n & t.childLanes) !== 0)
    ) {
      if (e !== null && t.child !== e.child) throw Error(a(153));
      if (t.child !== null) {
        for (
          e = t.child, n = Yt(e, e.pendingProps), t.child = n, n.return = t;
          e.sibling !== null;

        )
          (e = e.sibling),
            (n = n.sibling = Yt(e, e.pendingProps)),
            (n.return = t);
        n.sibling = null;
      }
      return t.child;
    }
    return null;
  }
  var Nu, ml, Ru, Lu;
  (Nu = function (e, t) {
    for (var n = t.child; n !== null; ) {
      if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
      else if (n.tag !== 4 && n.child !== null) {
        (n.child.return = n), (n = n.child);
        continue;
      }
      if (n === t) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === t) return;
        n = n.return;
      }
      (n.sibling.return = n.return), (n = n.sibling);
    }
  }),
    (ml = function () {}),
    (Ru = function (e, t, n, r) {
      var o = e.memoizedProps;
      if (o !== r) {
        (e = t.stateNode), nn(mt.current);
        var s = null;
        switch (n) {
          case "input":
            (o = Ko(e, o)), (r = Ko(e, r)), (s = []);
            break;
          case "option":
            (o = ni(e, o)), (r = ni(e, r)), (s = []);
            break;
          case "select":
            (o = l({}, o, { value: void 0 })),
              (r = l({}, r, { value: void 0 })),
              (s = []);
            break;
          case "textarea":
            (o = ri(e, o)), (r = ri(e, r)), (s = []);
            break;
          default:
            typeof o.onClick != "function" &&
              typeof r.onClick == "function" &&
              (e.onclick = oo);
        }
        li(n, r);
        var d;
        n = null;
        for (A in o)
          if (!r.hasOwnProperty(A) && o.hasOwnProperty(A) && o[A] != null)
            if (A === "style") {
              var p = o[A];
              for (d in p) p.hasOwnProperty(d) && (n || (n = {}), (n[d] = ""));
            } else
              A !== "dangerouslySetInnerHTML" &&
                A !== "children" &&
                A !== "suppressContentEditableWarning" &&
                A !== "suppressHydrationWarning" &&
                A !== "autoFocus" &&
                (h.hasOwnProperty(A)
                  ? s || (s = [])
                  : (s = s || []).push(A, null));
        for (A in r) {
          var v = r[A];
          if (
            ((p = o != null ? o[A] : void 0),
            r.hasOwnProperty(A) && v !== p && (v != null || p != null))
          )
            if (A === "style")
              if (p) {
                for (d in p)
                  !p.hasOwnProperty(d) ||
                    (v && v.hasOwnProperty(d)) ||
                    (n || (n = {}), (n[d] = ""));
                for (d in v)
                  v.hasOwnProperty(d) &&
                    p[d] !== v[d] &&
                    (n || (n = {}), (n[d] = v[d]));
              } else n || (s || (s = []), s.push(A, n)), (n = v);
            else
              A === "dangerouslySetInnerHTML"
                ? ((v = v ? v.__html : void 0),
                  (p = p ? p.__html : void 0),
                  v != null && p !== v && (s = s || []).push(A, v))
                : A === "children"
                  ? (typeof v != "string" && typeof v != "number") ||
                    (s = s || []).push(A, "" + v)
                  : A !== "suppressContentEditableWarning" &&
                    A !== "suppressHydrationWarning" &&
                    (h.hasOwnProperty(A)
                      ? (v != null && A === "onScroll" && je("scroll", e),
                        s || p === v || (s = []))
                      : typeof v == "object" && v !== null && v.$$typeof === B
                        ? v.toString()
                        : (s = s || []).push(A, v));
        }
        n && (s = s || []).push("style", n);
        var A = s;
        (t.updateQueue = A) && (t.flags |= 4);
      }
    }),
    (Lu = function (e, t, n, r) {
      n !== r && (t.flags |= 4);
    });
  function kr(e, t) {
    if (!vt)
      switch (e.tailMode) {
        case "hidden":
          t = e.tail;
          for (var n = null; t !== null; )
            t.alternate !== null && (n = t), (t = t.sibling);
          n === null ? (e.tail = null) : (n.sibling = null);
          break;
        case "collapsed":
          n = e.tail;
          for (var r = null; n !== null; )
            n.alternate !== null && (r = n), (n = n.sibling);
          r === null
            ? t || e.tail === null
              ? (e.tail = null)
              : (e.tail.sibling = null)
            : (r.sibling = null);
      }
  }
  function Yf(e, t, n) {
    var r = t.pendingProps;
    switch (t.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return null;
      case 1:
        return Qe(t.type) && ao(), null;
      case 3:
        return (
          On(),
          ke(Ze),
          ke(Fe),
          ol(),
          (r = t.stateNode),
          r.pendingContext &&
            ((r.context = r.pendingContext), (r.pendingContext = null)),
          (e === null || e.child === null) &&
            (Eo(t) ? (t.flags |= 4) : r.hydrate || (t.flags |= 256)),
          ml(t),
          null
        );
      case 5:
        tl(t);
        var o = nn(wr.current);
        if (((n = t.type), e !== null && t.stateNode != null))
          Ru(e, t, n, r, o), e.ref !== t.ref && (t.flags |= 128);
        else {
          if (!r) {
            if (t.stateNode === null) throw Error(a(166));
            return null;
          }
          if (((e = nn(mt.current)), Eo(t))) {
            (r = t.stateNode), (n = t.type);
            var s = t.memoizedProps;
            switch (((r[Lt] = t), (r[lo] = s), n)) {
              case "dialog":
                je("cancel", r), je("close", r);
                break;
              case "iframe":
              case "object":
              case "embed":
                je("load", r);
                break;
              case "video":
              case "audio":
                for (e = 0; e < dr.length; e++) je(dr[e], r);
                break;
              case "source":
                je("error", r);
                break;
              case "img":
              case "image":
              case "link":
                je("error", r), je("load", r);
                break;
              case "details":
                je("toggle", r);
                break;
              case "input":
                js(r, s), je("invalid", r);
                break;
              case "select":
                (r._wrapperState = { wasMultiple: !!s.multiple }),
                  je("invalid", r);
                break;
              case "textarea":
                Ps(r, s), je("invalid", r);
            }
            li(n, s), (e = null);
            for (var d in s)
              s.hasOwnProperty(d) &&
                ((o = s[d]),
                d === "children"
                  ? typeof o == "string"
                    ? r.textContent !== o && (e = ["children", o])
                    : typeof o == "number" &&
                      r.textContent !== "" + o &&
                      (e = ["children", "" + o])
                  : h.hasOwnProperty(d) &&
                    o != null &&
                    d === "onScroll" &&
                    je("scroll", r));
            switch (n) {
              case "input":
                Br(r), As(r, s, !0);
                break;
              case "textarea":
                Br(r), _s(r);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof s.onClick == "function" && (r.onclick = oo);
            }
            (r = e), (t.updateQueue = r), r !== null && (t.flags |= 4);
          } else {
            switch (
              ((d = o.nodeType === 9 ? o : o.ownerDocument),
              e === oi.html && (e = Os(n)),
              e === oi.html
                ? n === "script"
                  ? ((e = d.createElement("div")),
                    (e.innerHTML = "<script><\/script>"),
                    (e = e.removeChild(e.firstChild)))
                  : typeof r.is == "string"
                    ? (e = d.createElement(n, { is: r.is }))
                    : ((e = d.createElement(n)),
                      n === "select" &&
                        ((d = e),
                        r.multiple
                          ? (d.multiple = !0)
                          : r.size && (d.size = r.size)))
                : (e = d.createElementNS(e, n)),
              (e[Lt] = t),
              (e[lo] = r),
              Nu(e, t, !1, !1),
              (t.stateNode = e),
              (d = si(n, r)),
              n)
            ) {
              case "dialog":
                je("cancel", e), je("close", e), (o = r);
                break;
              case "iframe":
              case "object":
              case "embed":
                je("load", e), (o = r);
                break;
              case "video":
              case "audio":
                for (o = 0; o < dr.length; o++) je(dr[o], e);
                o = r;
                break;
              case "source":
                je("error", e), (o = r);
                break;
              case "img":
              case "image":
              case "link":
                je("error", e), je("load", e), (o = r);
                break;
              case "details":
                je("toggle", e), (o = r);
                break;
              case "input":
                js(e, r), (o = Ko(e, r)), je("invalid", e);
                break;
              case "option":
                o = ni(e, r);
                break;
              case "select":
                (e._wrapperState = { wasMultiple: !!r.multiple }),
                  (o = l({}, r, { value: void 0 })),
                  je("invalid", e);
                break;
              case "textarea":
                Ps(e, r), (o = ri(e, r)), je("invalid", e);
                break;
              default:
                o = r;
            }
            li(n, o);
            var p = o;
            for (s in p)
              if (p.hasOwnProperty(s)) {
                var v = p[s];
                s === "style"
                  ? Ls(e, v)
                  : s === "dangerouslySetInnerHTML"
                    ? ((v = v ? v.__html : void 0), v != null && Ns(e, v))
                    : s === "children"
                      ? typeof v == "string"
                        ? (n !== "textarea" || v !== "") && Zn(e, v)
                        : typeof v == "number" && Zn(e, "" + v)
                      : s !== "suppressContentEditableWarning" &&
                        s !== "suppressHydrationWarning" &&
                        s !== "autoFocus" &&
                        (h.hasOwnProperty(s)
                          ? v != null && s === "onScroll" && je("scroll", e)
                          : v != null && te(e, s, v, d));
              }
            switch (n) {
              case "input":
                Br(e), As(e, r, !1);
                break;
              case "textarea":
                Br(e), _s(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Pt(r.value));
                break;
              case "select":
                (e.multiple = !!r.multiple),
                  (s = r.value),
                  s != null
                    ? pn(e, !!r.multiple, s, !1)
                    : r.defaultValue != null &&
                      pn(e, !!r.multiple, r.defaultValue, !0);
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = oo);
            }
            La(n, r) && (t.flags |= 4);
          }
          t.ref !== null && (t.flags |= 128);
        }
        return null;
      case 6:
        if (e && t.stateNode != null) Lu(e, t, e.memoizedProps, r);
        else {
          if (typeof r != "string" && t.stateNode === null) throw Error(a(166));
          (n = nn(wr.current)),
            nn(mt.current),
            Eo(t)
              ? ((r = t.stateNode),
                (n = t.memoizedProps),
                (r[Lt] = t),
                r.nodeValue !== n && (t.flags |= 4))
              : ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(
                  r,
                )),
                (r[Lt] = t),
                (t.stateNode = r));
        }
        return null;
      case 13:
        return (
          ke(_e),
          (r = t.memoizedState),
          (t.flags & 64) !== 0
            ? ((t.lanes = n), t)
            : ((r = r !== null),
              (n = !1),
              e === null
                ? t.memoizedProps.fallback !== void 0 && Eo(t)
                : (n = e.memoizedState !== null),
              r &&
                !n &&
                (t.mode & 2) !== 0 &&
                ((e === null &&
                  t.memoizedProps.unstable_avoidThisFallback !== !0) ||
                (_e.current & 1) !== 0
                  ? ze === 0 && (ze = 3)
                  : ((ze === 0 || ze === 3) && (ze = 4),
                    He === null ||
                      ((Ar & 134217727) === 0 && (Ln & 134217727) === 0) ||
                      Mn(He, We))),
              (r || n) && (t.flags |= 4),
              null)
        );
      case 4:
        return On(), ml(t), e === null && Ia(t.stateNode.containerInfo), null;
      case 10:
        return qi(t), null;
      case 17:
        return Qe(t.type) && ao(), null;
      case 19:
        if ((ke(_e), (r = t.memoizedState), r === null)) return null;
        if (((s = (t.flags & 64) !== 0), (d = r.rendering), d === null))
          if (s) kr(r, !1);
          else {
            if (ze !== 0 || (e !== null && (e.flags & 64) !== 0))
              for (e = t.child; e !== null; ) {
                if (((d = Co(e)), d !== null)) {
                  for (
                    t.flags |= 64,
                      kr(r, !1),
                      s = d.updateQueue,
                      s !== null && ((t.updateQueue = s), (t.flags |= 4)),
                      r.lastEffect === null && (t.firstEffect = null),
                      t.lastEffect = r.lastEffect,
                      r = n,
                      n = t.child;
                    n !== null;

                  )
                    (s = n),
                      (e = r),
                      (s.flags &= 2),
                      (s.nextEffect = null),
                      (s.firstEffect = null),
                      (s.lastEffect = null),
                      (d = s.alternate),
                      d === null
                        ? ((s.childLanes = 0),
                          (s.lanes = e),
                          (s.child = null),
                          (s.memoizedProps = null),
                          (s.memoizedState = null),
                          (s.updateQueue = null),
                          (s.dependencies = null),
                          (s.stateNode = null))
                        : ((s.childLanes = d.childLanes),
                          (s.lanes = d.lanes),
                          (s.child = d.child),
                          (s.memoizedProps = d.memoizedProps),
                          (s.memoizedState = d.memoizedState),
                          (s.updateQueue = d.updateQueue),
                          (s.type = d.type),
                          (e = d.dependencies),
                          (s.dependencies =
                            e === null
                              ? null
                              : {
                                  lanes: e.lanes,
                                  firstContext: e.firstContext,
                                })),
                      (n = n.sibling);
                  return Ie(_e, (_e.current & 1) | 2), t.child;
                }
                e = e.sibling;
              }
            r.tail !== null &&
              Ue() > kl &&
              ((t.flags |= 64), (s = !0), kr(r, !1), (t.lanes = 33554432));
          }
        else {
          if (!s)
            if (((e = Co(d)), e !== null)) {
              if (
                ((t.flags |= 64),
                (s = !0),
                (n = e.updateQueue),
                n !== null && ((t.updateQueue = n), (t.flags |= 4)),
                kr(r, !0),
                r.tail === null &&
                  r.tailMode === "hidden" &&
                  !d.alternate &&
                  !vt)
              )
                return (
                  (t = t.lastEffect = r.lastEffect),
                  t !== null && (t.nextEffect = null),
                  null
                );
            } else
              2 * Ue() - r.renderingStartTime > kl &&
                n !== 1073741824 &&
                ((t.flags |= 64), (s = !0), kr(r, !1), (t.lanes = 33554432));
          r.isBackwards
            ? ((d.sibling = t.child), (t.child = d))
            : ((n = r.last),
              n !== null ? (n.sibling = d) : (t.child = d),
              (r.last = d));
        }
        return r.tail !== null
          ? ((n = r.tail),
            (r.rendering = n),
            (r.tail = n.sibling),
            (r.lastEffect = t.lastEffect),
            (r.renderingStartTime = Ue()),
            (n.sibling = null),
            (t = _e.current),
            Ie(_e, s ? (t & 1) | 2 : t & 1),
            n)
          : null;
      case 23:
      case 24:
        return (
          Nl(),
          e !== null &&
            (e.memoizedState !== null) != (t.memoizedState !== null) &&
            r.mode !== "unstable-defer-without-hiding" &&
            (t.flags |= 4),
          null
        );
    }
    throw Error(a(156, t.tag));
  }
  function Zf(e) {
    switch (e.tag) {
      case 1:
        Qe(e.type) && ao();
        var t = e.flags;
        return t & 4096 ? ((e.flags = (t & -4097) | 64), e) : null;
      case 3:
        if ((On(), ke(Ze), ke(Fe), ol(), (t = e.flags), (t & 64) !== 0))
          throw Error(a(285));
        return (e.flags = (t & -4097) | 64), e;
      case 5:
        return tl(e), null;
      case 13:
        return (
          ke(_e),
          (t = e.flags),
          t & 4096 ? ((e.flags = (t & -4097) | 64), e) : null
        );
      case 19:
        return ke(_e), null;
      case 4:
        return On(), null;
      case 10:
        return qi(e), null;
      case 23:
      case 24:
        return Nl(), null;
      default:
        return null;
    }
  }
  function vl(e, t) {
    try {
      var n = "",
        r = t;
      do (n += jd(r)), (r = r.return);
      while (r);
      var o = n;
    } catch (s) {
      o =
        `
Error generating stack: ` +
        s.message +
        `
` +
        s.stack;
    }
    return { value: e, source: t, stack: o };
  }
  function yl(e, t) {
    try {
      console.error(t.value);
    } catch (n) {
      setTimeout(function () {
        throw n;
      });
    }
  }
  var Qf = typeof WeakMap == "function" ? WeakMap : Map;
  function bu(e, t, n) {
    (n = zt(-1, n)), (n.tag = 3), (n.payload = { element: null });
    var r = t.value;
    return (
      (n.callback = function () {
        Oo || ((Oo = !0), (Al = r)), yl(e, t);
      }),
      n
    );
  }
  function Mu(e, t, n) {
    (n = zt(-1, n)), (n.tag = 3);
    var r = e.type.getDerivedStateFromError;
    if (typeof r == "function") {
      var o = t.value;
      n.payload = function () {
        return yl(e, t), r(o);
      };
    }
    var s = e.stateNode;
    return (
      s !== null &&
        typeof s.componentDidCatch == "function" &&
        (n.callback = function () {
          typeof r != "function" &&
            (gt === null ? (gt = new Set([this])) : gt.add(this), yl(e, t));
          var d = t.stack;
          this.componentDidCatch(t.value, {
            componentStack: d !== null ? d : "",
          });
        }),
      n
    );
  }
  var Jf = typeof WeakSet == "function" ? WeakSet : Set;
  function Du(e) {
    var t = e.ref;
    if (t !== null)
      if (typeof t == "function")
        try {
          t(null);
        } catch (n) {
          $t(e, n);
        }
      else t.current = null;
  }
  function Gf(e, t) {
    switch (t.tag) {
      case 0:
      case 11:
      case 15:
      case 22:
        return;
      case 1:
        if (t.flags & 256 && e !== null) {
          var n = e.memoizedProps,
            r = e.memoizedState;
          (e = t.stateNode),
            (t = e.getSnapshotBeforeUpdate(
              t.elementType === t.type ? n : ct(t.type, n),
              r,
            )),
            (e.__reactInternalSnapshotBeforeUpdate = t);
        }
        return;
      case 3:
        t.flags & 256 && Bi(t.stateNode.containerInfo);
        return;
      case 5:
      case 6:
      case 4:
      case 17:
        return;
    }
    throw Error(a(163));
  }
  function qf(e, t, n) {
    switch (n.tag) {
      case 0:
      case 11:
      case 15:
      case 22:
        if (
          ((t = n.updateQueue),
          (t = t !== null ? t.lastEffect : null),
          t !== null)
        ) {
          e = t = t.next;
          do {
            if ((e.tag & 3) === 3) {
              var r = e.create;
              e.destroy = r();
            }
            e = e.next;
          } while (e !== t);
        }
        if (
          ((t = n.updateQueue),
          (t = t !== null ? t.lastEffect : null),
          t !== null)
        ) {
          e = t = t.next;
          do {
            var o = e;
            (r = o.next),
              (o = o.tag),
              (o & 4) !== 0 && (o & 1) !== 0 && (Xu(n, e), ip(n, e)),
              (e = r);
          } while (e !== t);
        }
        return;
      case 1:
        (e = n.stateNode),
          n.flags & 4 &&
            (t === null
              ? e.componentDidMount()
              : ((r =
                  n.elementType === n.type
                    ? t.memoizedProps
                    : ct(n.type, t.memoizedProps)),
                e.componentDidUpdate(
                  r,
                  t.memoizedState,
                  e.__reactInternalSnapshotBeforeUpdate,
                ))),
          (t = n.updateQueue),
          t !== null && Ka(n, t, e);
        return;
      case 3:
        if (((t = n.updateQueue), t !== null)) {
          if (((e = null), n.child !== null))
            switch (n.child.tag) {
              case 5:
                e = n.child.stateNode;
                break;
              case 1:
                e = n.child.stateNode;
            }
          Ka(n, t, e);
        }
        return;
      case 5:
        (e = n.stateNode),
          t === null && n.flags & 4 && La(n.type, n.memoizedProps) && e.focus();
        return;
      case 6:
        return;
      case 4:
        return;
      case 12:
        return;
      case 13:
        n.memoizedState === null &&
          ((n = n.alternate),
          n !== null &&
            ((n = n.memoizedState),
            n !== null && ((n = n.dehydrated), n !== null && Gs(n))));
        return;
      case 19:
      case 17:
      case 20:
      case 21:
      case 23:
      case 24:
        return;
    }
    throw Error(a(163));
  }
  function zu(e, t) {
    for (var n = e; ; ) {
      if (n.tag === 5) {
        var r = n.stateNode;
        if (t)
          (r = r.style),
            typeof r.setProperty == "function"
              ? r.setProperty("display", "none", "important")
              : (r.display = "none");
        else {
          r = n.stateNode;
          var o = n.memoizedProps.style;
          (o = o != null && o.hasOwnProperty("display") ? o.display : null),
            (r.style.display = Rs("display", o));
        }
      } else if (n.tag === 6) n.stateNode.nodeValue = t ? "" : n.memoizedProps;
      else if (
        ((n.tag !== 23 && n.tag !== 24) ||
          n.memoizedState === null ||
          n === e) &&
        n.child !== null
      ) {
        (n.child.return = n), (n = n.child);
        continue;
      }
      if (n === e) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === e) return;
        n = n.return;
      }
      (n.sibling.return = n.return), (n = n.sibling);
    }
  }
  function Fu(e, t) {
    if (en && typeof en.onCommitFiberUnmount == "function")
      try {
        en.onCommitFiberUnmount(Hi, t);
      } catch {}
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
      case 22:
        if (
          ((e = t.updateQueue), e !== null && ((e = e.lastEffect), e !== null))
        ) {
          var n = (e = e.next);
          do {
            var r = n,
              o = r.destroy;
            if (((r = r.tag), o !== void 0))
              if ((r & 4) !== 0) Xu(t, n);
              else {
                r = t;
                try {
                  o();
                } catch (s) {
                  $t(r, s);
                }
              }
            n = n.next;
          } while (n !== e);
        }
        break;
      case 1:
        if (
          (Du(t),
          (e = t.stateNode),
          typeof e.componentWillUnmount == "function")
        )
          try {
            (e.props = t.memoizedProps),
              (e.state = t.memoizedState),
              e.componentWillUnmount();
          } catch (s) {
            $t(t, s);
          }
        break;
      case 5:
        Du(t);
        break;
      case 4:
        Vu(e, t);
    }
  }
  function Uu(e) {
    (e.alternate = null),
      (e.child = null),
      (e.dependencies = null),
      (e.firstEffect = null),
      (e.lastEffect = null),
      (e.memoizedProps = null),
      (e.memoizedState = null),
      (e.pendingProps = null),
      (e.return = null),
      (e.updateQueue = null);
  }
  function Bu(e) {
    return e.tag === 5 || e.tag === 3 || e.tag === 4;
  }
  function Wu(e) {
    e: {
      for (var t = e.return; t !== null; ) {
        if (Bu(t)) break e;
        t = t.return;
      }
      throw Error(a(160));
    }
    var n = t;
    switch (((t = n.stateNode), n.tag)) {
      case 5:
        var r = !1;
        break;
      case 3:
        (t = t.containerInfo), (r = !0);
        break;
      case 4:
        (t = t.containerInfo), (r = !0);
        break;
      default:
        throw Error(a(161));
    }
    n.flags & 16 && (Zn(t, ""), (n.flags &= -17));
    e: t: for (n = e; ; ) {
      for (; n.sibling === null; ) {
        if (n.return === null || Bu(n.return)) {
          n = null;
          break e;
        }
        n = n.return;
      }
      for (
        n.sibling.return = n.return, n = n.sibling;
        n.tag !== 5 && n.tag !== 6 && n.tag !== 18;

      ) {
        if (n.flags & 2 || n.child === null || n.tag === 4) continue t;
        (n.child.return = n), (n = n.child);
      }
      if (!(n.flags & 2)) {
        n = n.stateNode;
        break e;
      }
    }
    r ? gl(e, n, t) : wl(e, n, t);
  }
  function gl(e, t, n) {
    var r = e.tag,
      o = r === 5 || r === 6;
    if (o)
      (e = o ? e.stateNode : e.stateNode.instance),
        t
          ? n.nodeType === 8
            ? n.parentNode.insertBefore(e, t)
            : n.insertBefore(e, t)
          : (n.nodeType === 8
              ? ((t = n.parentNode), t.insertBefore(e, n))
              : ((t = n), t.appendChild(e)),
            (n = n._reactRootContainer),
            n != null || t.onclick !== null || (t.onclick = oo));
    else if (r !== 4 && ((e = e.child), e !== null))
      for (gl(e, t, n), e = e.sibling; e !== null; )
        gl(e, t, n), (e = e.sibling);
  }
  function wl(e, t, n) {
    var r = e.tag,
      o = r === 5 || r === 6;
    if (o)
      (e = o ? e.stateNode : e.stateNode.instance),
        t ? n.insertBefore(e, t) : n.appendChild(e);
    else if (r !== 4 && ((e = e.child), e !== null))
      for (wl(e, t, n), e = e.sibling; e !== null; )
        wl(e, t, n), (e = e.sibling);
  }
  function Vu(e, t) {
    for (var n = t, r = !1, o, s; ; ) {
      if (!r) {
        r = n.return;
        e: for (;;) {
          if (r === null) throw Error(a(160));
          switch (((o = r.stateNode), r.tag)) {
            case 5:
              s = !1;
              break e;
            case 3:
              (o = o.containerInfo), (s = !0);
              break e;
            case 4:
              (o = o.containerInfo), (s = !0);
              break e;
          }
          r = r.return;
        }
        r = !0;
      }
      if (n.tag === 5 || n.tag === 6) {
        e: for (var d = e, p = n, v = p; ; )
          if ((Fu(d, v), v.child !== null && v.tag !== 4))
            (v.child.return = v), (v = v.child);
          else {
            if (v === p) break e;
            for (; v.sibling === null; ) {
              if (v.return === null || v.return === p) break e;
              v = v.return;
            }
            (v.sibling.return = v.return), (v = v.sibling);
          }
        s
          ? ((d = o),
            (p = n.stateNode),
            d.nodeType === 8 ? d.parentNode.removeChild(p) : d.removeChild(p))
          : o.removeChild(n.stateNode);
      } else if (n.tag === 4) {
        if (n.child !== null) {
          (o = n.stateNode.containerInfo),
            (s = !0),
            (n.child.return = n),
            (n = n.child);
          continue;
        }
      } else if ((Fu(e, n), n.child !== null)) {
        (n.child.return = n), (n = n.child);
        continue;
      }
      if (n === t) break;
      for (; n.sibling === null; ) {
        if (n.return === null || n.return === t) return;
        (n = n.return), n.tag === 4 && (r = !1);
      }
      (n.sibling.return = n.return), (n = n.sibling);
    }
  }
  function xl(e, t) {
    switch (t.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
      case 22:
        var n = t.updateQueue;
        if (((n = n !== null ? n.lastEffect : null), n !== null)) {
          var r = (n = n.next);
          do
            (r.tag & 3) === 3 &&
              ((e = r.destroy), (r.destroy = void 0), e !== void 0 && e()),
              (r = r.next);
          while (r !== n);
        }
        return;
      case 1:
        return;
      case 5:
        if (((n = t.stateNode), n != null)) {
          r = t.memoizedProps;
          var o = e !== null ? e.memoizedProps : r;
          e = t.type;
          var s = t.updateQueue;
          if (((t.updateQueue = null), s !== null)) {
            for (
              n[lo] = r,
                e === "input" &&
                  r.type === "radio" &&
                  r.name != null &&
                  ks(n, r),
                si(e, o),
                t = si(e, r),
                o = 0;
              o < s.length;
              o += 2
            ) {
              var d = s[o],
                p = s[o + 1];
              d === "style"
                ? Ls(n, p)
                : d === "dangerouslySetInnerHTML"
                  ? Ns(n, p)
                  : d === "children"
                    ? Zn(n, p)
                    : te(n, d, p, t);
            }
            switch (e) {
              case "input":
                ei(n, r);
                break;
              case "textarea":
                Is(n, r);
                break;
              case "select":
                (e = n._wrapperState.wasMultiple),
                  (n._wrapperState.wasMultiple = !!r.multiple),
                  (s = r.value),
                  s != null
                    ? pn(n, !!r.multiple, s, !1)
                    : e !== !!r.multiple &&
                      (r.defaultValue != null
                        ? pn(n, !!r.multiple, r.defaultValue, !0)
                        : pn(n, !!r.multiple, r.multiple ? [] : "", !1));
            }
          }
        }
        return;
      case 6:
        if (t.stateNode === null) throw Error(a(162));
        t.stateNode.nodeValue = t.memoizedProps;
        return;
      case 3:
        (n = t.stateNode), n.hydrate && ((n.hydrate = !1), Gs(n.containerInfo));
        return;
      case 12:
        return;
      case 13:
        t.memoizedState !== null && ((jl = Ue()), zu(t.child, !0)), Hu(t);
        return;
      case 19:
        Hu(t);
        return;
      case 17:
        return;
      case 23:
      case 24:
        zu(t, t.memoizedState !== null);
        return;
    }
    throw Error(a(163));
  }
  function Hu(e) {
    var t = e.updateQueue;
    if (t !== null) {
      e.updateQueue = null;
      var n = e.stateNode;
      n === null && (n = e.stateNode = new Jf()),
        t.forEach(function (r) {
          var o = ap.bind(null, e, r);
          n.has(r) || (n.add(r), r.then(o, o));
        });
    }
  }
  function Xf(e, t) {
    return e !== null &&
      ((e = e.memoizedState), e === null || e.dehydrated !== null)
      ? ((t = t.memoizedState), t !== null && t.dehydrated === null)
      : !1;
  }
  var Kf = Math.ceil,
    Io = N.ReactCurrentDispatcher,
    Cl = N.ReactCurrentOwner,
    ie = 0,
    He = null,
    be = null,
    We = 0,
    ln = 0,
    El = bt(0),
    ze = 0,
    _o = null,
    Rn = 0,
    Ar = 0,
    Ln = 0,
    Sl = 0,
    Tl = null,
    jl = 0,
    kl = 1 / 0;
  function bn() {
    kl = Ue() + 500;
  }
  var Q = null,
    Oo = !1,
    Al = null,
    gt = null,
    Bt = !1,
    Pr = null,
    Ir = 90,
    Pl = [],
    Il = [],
    Tt = null,
    _r = 0,
    _l = null,
    No = -1,
    jt = 0,
    Ro = 0,
    Or = null,
    Lo = !1;
  function tt() {
    return (ie & 48) !== 0 ? Ue() : No !== -1 ? No : (No = Ue());
  }
  function Wt(e) {
    if (((e = e.mode), (e & 2) === 0)) return 1;
    if ((e & 4) === 0) return Pn() === 99 ? 1 : 2;
    if ((jt === 0 && (jt = Rn), Uf.transition !== 0)) {
      Ro !== 0 && (Ro = Tl !== null ? Tl.pendingLanes : 0), (e = jt);
      var t = 4186112 & ~Ro;
      return (
        (t &= -t),
        t === 0 && ((e = 4186112 & ~e), (t = e & -e), t === 0 && (t = 8192)),
        t
      );
    }
    return (
      (e = Pn()),
      (ie & 4) !== 0 && e === 98
        ? (e = Jr(12, jt))
        : ((e = Bd(e)), (e = Jr(e, jt))),
      e
    );
  }
  function Vt(e, t, n) {
    if (50 < _r) throw ((_r = 0), (_l = null), Error(a(185)));
    if (((e = bo(e, t)), e === null)) return null;
    Gr(e, t, n), e === He && ((Ln |= t), ze === 4 && Mn(e, We));
    var r = Pn();
    t === 1
      ? (ie & 8) !== 0 && (ie & 48) === 0
        ? Ol(e)
        : (at(e, n), ie === 0 && (bn(), ht()))
      : ((ie & 4) === 0 ||
          (r !== 98 && r !== 99) ||
          (Tt === null ? (Tt = new Set([e])) : Tt.add(e)),
        at(e, n)),
      (Tl = e);
  }
  function bo(e, t) {
    e.lanes |= t;
    var n = e.alternate;
    for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
      (e.childLanes |= t),
        (n = e.alternate),
        n !== null && (n.childLanes |= t),
        (n = e),
        (e = e.return);
    return n.tag === 3 ? n.stateNode : null;
  }
  function at(e, t) {
    for (
      var n = e.callbackNode,
        r = e.suspendedLanes,
        o = e.pingedLanes,
        s = e.expirationTimes,
        d = e.pendingLanes;
      0 < d;

    ) {
      var p = 31 - Nt(d),
        v = 1 << p,
        A = s[p];
      if (A === -1) {
        if ((v & r) === 0 || (v & o) !== 0) {
          (A = t), yn(v);
          var H = Se;
          s[p] = 10 <= H ? A + 250 : 6 <= H ? A + 5e3 : -1;
        }
      } else A <= t && (e.expiredLanes |= v);
      d &= ~v;
    }
    if (((r = rr(e, e === He ? We : 0)), (t = Se), r === 0))
      n !== null &&
        (n !== Qi && Yi(n), (e.callbackNode = null), (e.callbackPriority = 0));
    else {
      if (n !== null) {
        if (e.callbackPriority === t) return;
        n !== Qi && Yi(n);
      }
      t === 15
        ? ((n = Ol.bind(null, e)),
          Ct === null ? ((Ct = [n]), (fo = $i(co, Ja))) : Ct.push(n),
          (n = Qi))
        : t === 14
          ? (n = hr(99, Ol.bind(null, e)))
          : ((n = Wd(t)), (n = hr(n, $u.bind(null, e)))),
        (e.callbackPriority = t),
        (e.callbackNode = n);
    }
  }
  function $u(e) {
    if (((No = -1), (Ro = jt = 0), (ie & 48) !== 0)) throw Error(a(327));
    var t = e.callbackNode;
    if (Ht() && e.callbackNode !== t) return null;
    var n = rr(e, e === He ? We : 0);
    if (n === 0) return null;
    var r = n,
      o = ie;
    ie |= 16;
    var s = Ju();
    (He !== e || We !== r) && (bn(), Dn(e, r));
    do
      try {
        np();
        break;
      } catch (p) {
        Qu(e, p);
      }
    while (!0);
    if (
      (Gi(),
      (Io.current = s),
      (ie = o),
      be !== null ? (r = 0) : ((He = null), (We = 0), (r = ze)),
      (Rn & Ln) !== 0)
    )
      Dn(e, 0);
    else if (r !== 0) {
      if (
        (r === 2 &&
          ((ie |= 64),
          e.hydrate && ((e.hydrate = !1), Bi(e.containerInfo)),
          (n = ra(e)),
          n !== 0 && (r = Nr(e, n))),
        r === 1)
      )
        throw ((t = _o), Dn(e, 0), Mn(e, n), at(e, Ue()), t);
      switch (
        ((e.finishedWork = e.current.alternate), (e.finishedLanes = n), r)
      ) {
        case 0:
        case 1:
          throw Error(a(345));
        case 2:
          sn(e);
          break;
        case 3:
          if (
            (Mn(e, n), (n & 62914560) === n && ((r = jl + 500 - Ue()), 10 < r))
          ) {
            if (rr(e, 0) !== 0) break;
            if (((o = e.suspendedLanes), (o & n) !== n)) {
              tt(), (e.pingedLanes |= e.suspendedLanes & o);
              break;
            }
            e.timeoutHandle = ba(sn.bind(null, e), r);
            break;
          }
          sn(e);
          break;
        case 4:
          if ((Mn(e, n), (n & 4186112) === n)) break;
          for (r = e.eventTimes, o = -1; 0 < n; ) {
            var d = 31 - Nt(n);
            (s = 1 << d), (d = r[d]), d > o && (o = d), (n &= ~s);
          }
          if (
            ((n = o),
            (n = Ue() - n),
            (n =
              (120 > n
                ? 120
                : 480 > n
                  ? 480
                  : 1080 > n
                    ? 1080
                    : 1920 > n
                      ? 1920
                      : 3e3 > n
                        ? 3e3
                        : 4320 > n
                          ? 4320
                          : 1960 * Kf(n / 1960)) - n),
            10 < n)
          ) {
            e.timeoutHandle = ba(sn.bind(null, e), n);
            break;
          }
          sn(e);
          break;
        case 5:
          sn(e);
          break;
        default:
          throw Error(a(329));
      }
    }
    return at(e, Ue()), e.callbackNode === t ? $u.bind(null, e) : null;
  }
  function Mn(e, t) {
    for (
      t &= ~Sl,
        t &= ~Ln,
        e.suspendedLanes |= t,
        e.pingedLanes &= ~t,
        e = e.expirationTimes;
      0 < t;

    ) {
      var n = 31 - Nt(t),
        r = 1 << n;
      (e[n] = -1), (t &= ~r);
    }
  }
  function Ol(e) {
    if ((ie & 48) !== 0) throw Error(a(327));
    if ((Ht(), e === He && (e.expiredLanes & We) !== 0)) {
      var t = We,
        n = Nr(e, t);
      (Rn & Ln) !== 0 && ((t = rr(e, t)), (n = Nr(e, t)));
    } else (t = rr(e, 0)), (n = Nr(e, t));
    if (
      (e.tag !== 0 &&
        n === 2 &&
        ((ie |= 64),
        e.hydrate && ((e.hydrate = !1), Bi(e.containerInfo)),
        (t = ra(e)),
        t !== 0 && (n = Nr(e, t))),
      n === 1)
    )
      throw ((n = _o), Dn(e, 0), Mn(e, t), at(e, Ue()), n);
    return (
      (e.finishedWork = e.current.alternate),
      (e.finishedLanes = t),
      sn(e),
      at(e, Ue()),
      null
    );
  }
  function ep() {
    if (Tt !== null) {
      var e = Tt;
      (Tt = null),
        e.forEach(function (t) {
          (t.expiredLanes |= 24 & t.pendingLanes), at(t, Ue());
        });
    }
    ht();
  }
  function Yu(e, t) {
    var n = ie;
    ie |= 1;
    try {
      return e(t);
    } finally {
      (ie = n), ie === 0 && (bn(), ht());
    }
  }
  function Zu(e, t) {
    var n = ie;
    (ie &= -2), (ie |= 8);
    try {
      return e(t);
    } finally {
      (ie = n), ie === 0 && (bn(), ht());
    }
  }
  function Mo(e, t) {
    Ie(El, ln), (ln |= t), (Rn |= t);
  }
  function Nl() {
    (ln = El.current), ke(El);
  }
  function Dn(e, t) {
    (e.finishedWork = null), (e.finishedLanes = 0);
    var n = e.timeoutHandle;
    if ((n !== -1 && ((e.timeoutHandle = -1), Lf(n)), be !== null))
      for (n = be.return; n !== null; ) {
        var r = n;
        switch (r.tag) {
          case 1:
            (r = r.type.childContextTypes), r != null && ao();
            break;
          case 3:
            On(), ke(Ze), ke(Fe), ol();
            break;
          case 5:
            tl(r);
            break;
          case 4:
            On();
            break;
          case 13:
            ke(_e);
            break;
          case 19:
            ke(_e);
            break;
          case 10:
            qi(r);
            break;
          case 23:
          case 24:
            Nl();
        }
        n = n.return;
      }
    (He = e),
      (be = Yt(e.current, null)),
      (We = ln = Rn = t),
      (ze = 0),
      (_o = null),
      (Sl = Ln = Ar = 0);
  }
  function Qu(e, t) {
    do {
      var n = be;
      try {
        if ((Gi(), (xr.current = Ao), So)) {
          for (var r = Ne.memoizedState; r !== null; ) {
            var o = r.queue;
            o !== null && (o.pending = null), (r = r.next);
          }
          So = !1;
        }
        if (
          ((Cr = 0),
          (De = Be = Ne = null),
          (Er = !1),
          (Cl.current = null),
          n === null || n.return === null)
        ) {
          (ze = 1), (_o = t), (be = null);
          break;
        }
        e: {
          var s = e,
            d = n.return,
            p = n,
            v = t;
          if (
            ((t = We),
            (p.flags |= 2048),
            (p.firstEffect = p.lastEffect = null),
            v !== null && typeof v == "object" && typeof v.then == "function")
          ) {
            var A = v;
            if ((p.mode & 2) === 0) {
              var H = p.alternate;
              H
                ? ((p.updateQueue = H.updateQueue),
                  (p.memoizedState = H.memoizedState),
                  (p.lanes = H.lanes))
                : ((p.updateQueue = null), (p.memoizedState = null));
            }
            var ae = (_e.current & 1) !== 0,
              D = d;
            do {
              var K;
              if ((K = D.tag === 13)) {
                var le = D.memoizedState;
                if (le !== null) K = le.dehydrated !== null;
                else {
                  var re = D.memoizedProps;
                  K =
                    re.fallback === void 0
                      ? !1
                      : re.unstable_avoidThisFallback !== !0
                        ? !0
                        : !ae;
                }
              }
              if (K) {
                var S = D.updateQueue;
                if (S === null) {
                  var w = new Set();
                  w.add(A), (D.updateQueue = w);
                } else S.add(A);
                if ((D.mode & 2) === 0) {
                  if (
                    ((D.flags |= 64),
                    (p.flags |= 16384),
                    (p.flags &= -2981),
                    p.tag === 1)
                  )
                    if (p.alternate === null) p.tag = 17;
                    else {
                      var E = zt(-1, 1);
                      (E.tag = 2), Ft(p, E);
                    }
                  p.lanes |= 1;
                  break e;
                }
                (v = void 0), (p = t);
                var _ = s.pingCache;
                if (
                  (_ === null
                    ? ((_ = s.pingCache = new Qf()),
                      (v = new Set()),
                      _.set(A, v))
                    : ((v = _.get(A)),
                      v === void 0 && ((v = new Set()), _.set(A, v))),
                  !v.has(p))
                ) {
                  v.add(p);
                  var L = sp.bind(null, s, A, p);
                  A.then(L, L);
                }
                (D.flags |= 4096), (D.lanes = t);
                break e;
              }
              D = D.return;
            } while (D !== null);
            v = Error(
              (fn(p.type) || "A React component") +
                ` suspended while rendering, but no fallback UI was specified.

Add a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display.`,
            );
          }
          ze !== 5 && (ze = 2), (v = vl(v, p)), (D = d);
          do {
            switch (D.tag) {
              case 3:
                (s = v), (D.flags |= 4096), (t &= -t), (D.lanes |= t);
                var de = bu(D, s, t);
                Xa(D, de);
                break e;
              case 1:
                s = v;
                var q = D.type,
                  fe = D.stateNode;
                if (
                  (D.flags & 64) === 0 &&
                  (typeof q.getDerivedStateFromError == "function" ||
                    (fe !== null &&
                      typeof fe.componentDidCatch == "function" &&
                      (gt === null || !gt.has(fe))))
                ) {
                  (D.flags |= 4096), (t &= -t), (D.lanes |= t);
                  var ge = Mu(D, s, t);
                  Xa(D, ge);
                  break e;
                }
            }
            D = D.return;
          } while (D !== null);
        }
        qu(n);
      } catch (he) {
        (t = he), be === n && n !== null && (be = n = n.return);
        continue;
      }
      break;
    } while (!0);
  }
  function Ju() {
    var e = Io.current;
    return (Io.current = Ao), e === null ? Ao : e;
  }
  function Nr(e, t) {
    var n = ie;
    ie |= 16;
    var r = Ju();
    (He === e && We === t) || Dn(e, t);
    do
      try {
        tp();
        break;
      } catch (o) {
        Qu(e, o);
      }
    while (!0);
    if ((Gi(), (ie = n), (Io.current = r), be !== null)) throw Error(a(261));
    return (He = null), (We = 0), ze;
  }
  function tp() {
    for (; be !== null; ) Gu(be);
  }
  function np() {
    for (; be !== null && !Df(); ) Gu(be);
  }
  function Gu(e) {
    var t = ec(e.alternate, e, ln);
    (e.memoizedProps = e.pendingProps),
      t === null ? qu(e) : (be = t),
      (Cl.current = null);
  }
  function qu(e) {
    var t = e;
    do {
      var n = t.alternate;
      if (((e = t.return), (t.flags & 2048) === 0)) {
        if (((n = Yf(n, t, ln)), n !== null)) {
          be = n;
          return;
        }
        if (
          ((n = t),
          (n.tag !== 24 && n.tag !== 23) ||
            n.memoizedState === null ||
            (ln & 1073741824) !== 0 ||
            (n.mode & 4) === 0)
        ) {
          for (var r = 0, o = n.child; o !== null; )
            (r |= o.lanes | o.childLanes), (o = o.sibling);
          n.childLanes = r;
        }
        e !== null &&
          (e.flags & 2048) === 0 &&
          (e.firstEffect === null && (e.firstEffect = t.firstEffect),
          t.lastEffect !== null &&
            (e.lastEffect !== null && (e.lastEffect.nextEffect = t.firstEffect),
            (e.lastEffect = t.lastEffect)),
          1 < t.flags &&
            (e.lastEffect !== null
              ? (e.lastEffect.nextEffect = t)
              : (e.firstEffect = t),
            (e.lastEffect = t)));
      } else {
        if (((n = Zf(t)), n !== null)) {
          (n.flags &= 2047), (be = n);
          return;
        }
        e !== null &&
          ((e.firstEffect = e.lastEffect = null), (e.flags |= 2048));
      }
      if (((t = t.sibling), t !== null)) {
        be = t;
        return;
      }
      be = t = e;
    } while (t !== null);
    ze === 0 && (ze = 5);
  }
  function sn(e) {
    var t = Pn();
    return tn(99, rp.bind(null, e, t)), null;
  }
  function rp(e, t) {
    do Ht();
    while (Pr !== null);
    if ((ie & 48) !== 0) throw Error(a(327));
    var n = e.finishedWork;
    if (n === null) return null;
    if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
      throw Error(a(177));
    e.callbackNode = null;
    var r = n.lanes | n.childLanes,
      o = r,
      s = e.pendingLanes & ~o;
    (e.pendingLanes = o),
      (e.suspendedLanes = 0),
      (e.pingedLanes = 0),
      (e.expiredLanes &= o),
      (e.mutableReadLanes &= o),
      (e.entangledLanes &= o),
      (o = e.entanglements);
    for (var d = e.eventTimes, p = e.expirationTimes; 0 < s; ) {
      var v = 31 - Nt(s),
        A = 1 << v;
      (o[v] = 0), (d[v] = -1), (p[v] = -1), (s &= ~A);
    }
    if (
      (Tt !== null && (r & 24) === 0 && Tt.has(e) && Tt.delete(e),
      e === He && ((be = He = null), (We = 0)),
      1 < n.flags
        ? n.lastEffect !== null
          ? ((n.lastEffect.nextEffect = n), (r = n.firstEffect))
          : (r = n)
        : (r = n.firstEffect),
      r !== null)
    ) {
      if (
        ((o = ie),
        (ie |= 32),
        (Cl.current = null),
        (zi = qr),
        (d = Sa()),
        Li(d))
      ) {
        if ("selectionStart" in d)
          p = { start: d.selectionStart, end: d.selectionEnd };
        else
          e: if (
            ((p = ((p = d.ownerDocument) && p.defaultView) || window),
            (A = p.getSelection && p.getSelection()) && A.rangeCount !== 0)
          ) {
            (p = A.anchorNode),
              (s = A.anchorOffset),
              (v = A.focusNode),
              (A = A.focusOffset);
            try {
              p.nodeType, v.nodeType;
            } catch {
              p = null;
              break e;
            }
            var H = 0,
              ae = -1,
              D = -1,
              K = 0,
              le = 0,
              re = d,
              S = null;
            t: for (;;) {
              for (
                var w;
                re !== p || (s !== 0 && re.nodeType !== 3) || (ae = H + s),
                  re !== v || (A !== 0 && re.nodeType !== 3) || (D = H + A),
                  re.nodeType === 3 && (H += re.nodeValue.length),
                  (w = re.firstChild) !== null;

              )
                (S = re), (re = w);
              for (;;) {
                if (re === d) break t;
                if (
                  (S === p && ++K === s && (ae = H),
                  S === v && ++le === A && (D = H),
                  (w = re.nextSibling) !== null)
                )
                  break;
                (re = S), (S = re.parentNode);
              }
              re = w;
            }
            p = ae === -1 || D === -1 ? null : { start: ae, end: D };
          } else p = null;
        p = p || { start: 0, end: 0 };
      } else p = null;
      (Fi = { focusedElem: d, selectionRange: p }),
        (qr = !1),
        (Or = null),
        (Lo = !1),
        (Q = r);
      do
        try {
          op();
        } catch (he) {
          if (Q === null) throw Error(a(330));
          $t(Q, he), (Q = Q.nextEffect);
        }
      while (Q !== null);
      (Or = null), (Q = r);
      do
        try {
          for (d = e; Q !== null; ) {
            var E = Q.flags;
            if ((E & 16 && Zn(Q.stateNode, ""), E & 128)) {
              var _ = Q.alternate;
              if (_ !== null) {
                var L = _.ref;
                L !== null &&
                  (typeof L == "function" ? L(null) : (L.current = null));
              }
            }
            switch (E & 1038) {
              case 2:
                Wu(Q), (Q.flags &= -3);
                break;
              case 6:
                Wu(Q), (Q.flags &= -3), xl(Q.alternate, Q);
                break;
              case 1024:
                Q.flags &= -1025;
                break;
              case 1028:
                (Q.flags &= -1025), xl(Q.alternate, Q);
                break;
              case 4:
                xl(Q.alternate, Q);
                break;
              case 8:
                (p = Q), Vu(d, p);
                var de = p.alternate;
                Uu(p), de !== null && Uu(de);
            }
            Q = Q.nextEffect;
          }
        } catch (he) {
          if (Q === null) throw Error(a(330));
          $t(Q, he), (Q = Q.nextEffect);
        }
      while (Q !== null);
      if (
        ((L = Fi),
        (_ = Sa()),
        (E = L.focusedElem),
        (d = L.selectionRange),
        _ !== E &&
          E &&
          E.ownerDocument &&
          Ea(E.ownerDocument.documentElement, E))
      ) {
        for (
          d !== null &&
            Li(E) &&
            ((_ = d.start),
            (L = d.end),
            L === void 0 && (L = _),
            ("selectionStart" in E)
              ? ((E.selectionStart = _),
                (E.selectionEnd = Math.min(L, E.value.length)))
              : ((L =
                  ((_ = E.ownerDocument || document) && _.defaultView) ||
                  window),
                L.getSelection &&
                  ((L = L.getSelection()),
                  (p = E.textContent.length),
                  (de = Math.min(d.start, p)),
                  (d = d.end === void 0 ? de : Math.min(d.end, p)),
                  !L.extend && de > d && ((p = d), (d = de), (de = p)),
                  (p = Ca(E, de)),
                  (s = Ca(E, d)),
                  p &&
                    s &&
                    (L.rangeCount !== 1 ||
                      L.anchorNode !== p.node ||
                      L.anchorOffset !== p.offset ||
                      L.focusNode !== s.node ||
                      L.focusOffset !== s.offset) &&
                    ((_ = _.createRange()),
                    _.setStart(p.node, p.offset),
                    L.removeAllRanges(),
                    de > d
                      ? (L.addRange(_), L.extend(s.node, s.offset))
                      : (_.setEnd(s.node, s.offset), L.addRange(_)))))),
            _ = [],
            L = E;
          (L = L.parentNode);

        )
          L.nodeType === 1 &&
            _.push({ element: L, left: L.scrollLeft, top: L.scrollTop });
        for (
          typeof E.focus == "function" && E.focus(), E = 0;
          E < _.length;
          E++
        )
          (L = _[E]),
            (L.element.scrollLeft = L.left),
            (L.element.scrollTop = L.top);
      }
      (qr = !!zi), (Fi = zi = null), (e.current = n), (Q = r);
      do
        try {
          for (E = e; Q !== null; ) {
            var q = Q.flags;
            if ((q & 36 && qf(E, Q.alternate, Q), q & 128)) {
              _ = void 0;
              var fe = Q.ref;
              if (fe !== null) {
                var ge = Q.stateNode;
                switch (Q.tag) {
                  case 5:
                    _ = ge;
                    break;
                  default:
                    _ = ge;
                }
                typeof fe == "function" ? fe(_) : (fe.current = _);
              }
            }
            Q = Q.nextEffect;
          }
        } catch (he) {
          if (Q === null) throw Error(a(330));
          $t(Q, he), (Q = Q.nextEffect);
        }
      while (Q !== null);
      (Q = null), Ff(), (ie = o);
    } else e.current = n;
    if (Bt) (Bt = !1), (Pr = e), (Ir = t);
    else
      for (Q = r; Q !== null; )
        (t = Q.nextEffect),
          (Q.nextEffect = null),
          Q.flags & 8 && ((q = Q), (q.sibling = null), (q.stateNode = null)),
          (Q = t);
    if (
      ((r = e.pendingLanes),
      r === 0 && (gt = null),
      r === 1 ? (e === _l ? _r++ : ((_r = 0), (_l = e))) : (_r = 0),
      (n = n.stateNode),
      en && typeof en.onCommitFiberRoot == "function")
    )
      try {
        en.onCommitFiberRoot(Hi, n, void 0, (n.current.flags & 64) === 64);
      } catch {}
    if ((at(e, Ue()), Oo)) throw ((Oo = !1), (e = Al), (Al = null), e);
    return (ie & 8) !== 0 || ht(), null;
  }
  function op() {
    for (; Q !== null; ) {
      var e = Q.alternate;
      Lo ||
        Or === null ||
        ((Q.flags & 8) !== 0
          ? Vs(Q, Or) && (Lo = !0)
          : Q.tag === 13 && Xf(e, Q) && Vs(Q, Or) && (Lo = !0));
      var t = Q.flags;
      (t & 256) !== 0 && Gf(e, Q),
        (t & 512) === 0 ||
          Bt ||
          ((Bt = !0),
          hr(97, function () {
            return Ht(), null;
          })),
        (Q = Q.nextEffect);
    }
  }
  function Ht() {
    if (Ir !== 90) {
      var e = 97 < Ir ? 97 : Ir;
      return (Ir = 90), tn(e, lp);
    }
    return !1;
  }
  function ip(e, t) {
    Pl.push(t, e),
      Bt ||
        ((Bt = !0),
        hr(97, function () {
          return Ht(), null;
        }));
  }
  function Xu(e, t) {
    Il.push(t, e),
      Bt ||
        ((Bt = !0),
        hr(97, function () {
          return Ht(), null;
        }));
  }
  function lp() {
    if (Pr === null) return !1;
    var e = Pr;
    if (((Pr = null), (ie & 48) !== 0)) throw Error(a(331));
    var t = ie;
    ie |= 32;
    var n = Il;
    Il = [];
    for (var r = 0; r < n.length; r += 2) {
      var o = n[r],
        s = n[r + 1],
        d = o.destroy;
      if (((o.destroy = void 0), typeof d == "function"))
        try {
          d();
        } catch (v) {
          if (s === null) throw Error(a(330));
          $t(s, v);
        }
    }
    for (n = Pl, Pl = [], r = 0; r < n.length; r += 2) {
      (o = n[r]), (s = n[r + 1]);
      try {
        var p = o.create;
        o.destroy = p();
      } catch (v) {
        if (s === null) throw Error(a(330));
        $t(s, v);
      }
    }
    for (p = e.current.firstEffect; p !== null; )
      (e = p.nextEffect),
        (p.nextEffect = null),
        p.flags & 8 && ((p.sibling = null), (p.stateNode = null)),
        (p = e);
    return (ie = t), ht(), !0;
  }
  function Ku(e, t, n) {
    (t = vl(n, t)),
      (t = bu(e, t, 1)),
      Ft(e, t),
      (t = tt()),
      (e = bo(e, 1)),
      e !== null && (Gr(e, 1, t), at(e, t));
  }
  function $t(e, t) {
    if (e.tag === 3) Ku(e, e, t);
    else
      for (var n = e.return; n !== null; ) {
        if (n.tag === 3) {
          Ku(n, e, t);
          break;
        } else if (n.tag === 1) {
          var r = n.stateNode;
          if (
            typeof n.type.getDerivedStateFromError == "function" ||
            (typeof r.componentDidCatch == "function" &&
              (gt === null || !gt.has(r)))
          ) {
            e = vl(t, e);
            var o = Mu(n, e, 1);
            if ((Ft(n, o), (o = tt()), (n = bo(n, 1)), n !== null))
              Gr(n, 1, o), at(n, o);
            else if (
              typeof r.componentDidCatch == "function" &&
              (gt === null || !gt.has(r))
            )
              try {
                r.componentDidCatch(t, e);
              } catch {}
            break;
          }
        }
        n = n.return;
      }
  }
  function sp(e, t, n) {
    var r = e.pingCache;
    r !== null && r.delete(t),
      (t = tt()),
      (e.pingedLanes |= e.suspendedLanes & n),
      He === e &&
        (We & n) === n &&
        (ze === 4 || (ze === 3 && (We & 62914560) === We && 500 > Ue() - jl)
          ? Dn(e, 0)
          : (Sl |= n)),
      at(e, t);
  }
  function ap(e, t) {
    var n = e.stateNode;
    n !== null && n.delete(t),
      (t = 0),
      t === 0 &&
        ((t = e.mode),
        (t & 2) === 0
          ? (t = 1)
          : (t & 4) === 0
            ? (t = Pn() === 99 ? 1 : 2)
            : (jt === 0 && (jt = Rn),
              (t = gn(62914560 & ~jt)),
              t === 0 && (t = 4194304))),
      (n = tt()),
      (e = bo(e, t)),
      e !== null && (Gr(e, t, n), at(e, n));
  }
  var ec;
  ec = function (e, t, n) {
    var r = t.lanes;
    if (e !== null)
      if (e.memoizedProps !== t.pendingProps || Ze.current) dt = !0;
      else if ((n & r) !== 0) dt = (e.flags & 16384) !== 0;
      else {
        switch (((dt = !1), t.tag)) {
          case 3:
            ju(t), rl();
            break;
          case 5:
            lu(t);
            break;
          case 1:
            Qe(t.type) && uo(t);
            break;
          case 4:
            el(t, t.stateNode.containerInfo);
            break;
          case 10:
            r = t.memoizedProps.value;
            var o = t.type._context;
            Ie(po, o._currentValue), (o._currentValue = r);
            break;
          case 13:
            if (t.memoizedState !== null)
              return (n & t.child.childLanes) !== 0
                ? ku(e, t, n)
                : (Ie(_e, _e.current & 1),
                  (t = St(e, t, n)),
                  t !== null ? t.sibling : null);
            Ie(_e, _e.current & 1);
            break;
          case 19:
            if (((r = (n & t.childLanes) !== 0), (e.flags & 64) !== 0)) {
              if (r) return Ou(e, t, n);
              t.flags |= 64;
            }
            if (
              ((o = t.memoizedState),
              o !== null &&
                ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
              Ie(_e, _e.current),
              r)
            )
              break;
            return null;
          case 23:
          case 24:
            return (t.lanes = 0), dl(e, t, n);
        }
        return St(e, t, n);
      }
    else dt = !1;
    switch (((t.lanes = 0), t.tag)) {
      case 2:
        if (
          ((r = t.type),
          e !== null &&
            ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
          (e = t.pendingProps),
          (o = An(t, Fe.current)),
          _n(t, n),
          (o = ll(null, t, r, e, o, n)),
          (t.flags |= 1),
          typeof o == "object" &&
            o !== null &&
            typeof o.render == "function" &&
            o.$$typeof === void 0)
        ) {
          if (
            ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            Qe(r))
          ) {
            var s = !0;
            uo(t);
          } else s = !1;
          (t.memoizedState =
            o.state !== null && o.state !== void 0 ? o.state : null),
            Xi(t);
          var d = r.getDerivedStateFromProps;
          typeof d == "function" && vo(t, r, d, e),
            (o.updater = yo),
            (t.stateNode = o),
            (o._reactInternals = t),
            Ki(t, r, e, n),
            (t = pl(null, t, r, !0, s, n));
        } else (t.tag = 0), Ge(null, t, o, n), (t = t.child);
        return t;
      case 16:
        o = t.elementType;
        e: {
          switch (
            (e !== null &&
              ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
            (e = t.pendingProps),
            (s = o._init),
            (o = s(o._payload)),
            (t.type = o),
            (s = t.tag = cp(o)),
            (e = ct(o, e)),
            s)
          ) {
            case 0:
              t = fl(null, t, o, e, n);
              break e;
            case 1:
              t = Tu(null, t, o, e, n);
              break e;
            case 11:
              t = xu(null, t, o, e, n);
              break e;
            case 14:
              t = Cu(null, t, o, ct(o.type, e), r, n);
              break e;
          }
          throw Error(a(306, o, ""));
        }
        return t;
      case 0:
        return (
          (r = t.type),
          (o = t.pendingProps),
          (o = t.elementType === r ? o : ct(r, o)),
          fl(e, t, r, o, n)
        );
      case 1:
        return (
          (r = t.type),
          (o = t.pendingProps),
          (o = t.elementType === r ? o : ct(r, o)),
          Tu(e, t, r, o, n)
        );
      case 3:
        if ((ju(t), (r = t.updateQueue), e === null || r === null))
          throw Error(a(282));
        if (
          ((r = t.pendingProps),
          (o = t.memoizedState),
          (o = o !== null ? o.element : null),
          qa(e, t),
          mr(t, r, null, n),
          (r = t.memoizedState.element),
          r === o)
        )
          rl(), (t = St(e, t, n));
        else {
          if (
            ((o = t.stateNode),
            (s = o.hydrate) &&
              ((Ut = Sn(t.stateNode.containerInfo.firstChild)),
              (Et = t),
              (s = vt = !0)),
            s)
          ) {
            if (((e = o.mutableSourceEagerHydrationData), e != null))
              for (o = 0; o < e.length; o += 2)
                (s = e[o]),
                  (s._workInProgressVersionPrimary = e[o + 1]),
                  Nn.push(s);
            for (n = iu(t, null, r, n), t.child = n; n; )
              (n.flags = (n.flags & -3) | 1024), (n = n.sibling);
          } else Ge(e, t, r, n), rl();
          t = t.child;
        }
        return t;
      case 5:
        return (
          lu(t),
          e === null && nl(t),
          (r = t.type),
          (o = t.pendingProps),
          (s = e !== null ? e.memoizedProps : null),
          (d = o.children),
          Ui(r, o) ? (d = null) : s !== null && Ui(r, s) && (t.flags |= 16),
          Su(e, t),
          Ge(e, t, d, n),
          t.child
        );
      case 6:
        return e === null && nl(t), null;
      case 13:
        return ku(e, t, n);
      case 4:
        return (
          el(t, t.stateNode.containerInfo),
          (r = t.pendingProps),
          e === null ? (t.child = xo(t, null, r, n)) : Ge(e, t, r, n),
          t.child
        );
      case 11:
        return (
          (r = t.type),
          (o = t.pendingProps),
          (o = t.elementType === r ? o : ct(r, o)),
          xu(e, t, r, o, n)
        );
      case 7:
        return Ge(e, t, t.pendingProps, n), t.child;
      case 8:
        return Ge(e, t, t.pendingProps.children, n), t.child;
      case 12:
        return Ge(e, t, t.pendingProps.children, n), t.child;
      case 10:
        e: {
          (r = t.type._context),
            (o = t.pendingProps),
            (d = t.memoizedProps),
            (s = o.value);
          var p = t.type._context;
          if ((Ie(po, p._currentValue), (p._currentValue = s), d !== null))
            if (
              ((p = d.value),
              (s = it(p, s)
                ? 0
                : (typeof r._calculateChangedBits == "function"
                    ? r._calculateChangedBits(p, s)
                    : 1073741823) | 0),
              s === 0)
            ) {
              if (d.children === o.children && !Ze.current) {
                t = St(e, t, n);
                break e;
              }
            } else
              for (p = t.child, p !== null && (p.return = t); p !== null; ) {
                var v = p.dependencies;
                if (v !== null) {
                  d = p.child;
                  for (var A = v.firstContext; A !== null; ) {
                    if (A.context === r && (A.observedBits & s) !== 0) {
                      p.tag === 1 &&
                        ((A = zt(-1, n & -n)), (A.tag = 2), Ft(p, A)),
                        (p.lanes |= n),
                        (A = p.alternate),
                        A !== null && (A.lanes |= n),
                        Ga(p.return, n),
                        (v.lanes |= n);
                      break;
                    }
                    A = A.next;
                  }
                } else d = p.tag === 10 && p.type === t.type ? null : p.child;
                if (d !== null) d.return = p;
                else
                  for (d = p; d !== null; ) {
                    if (d === t) {
                      d = null;
                      break;
                    }
                    if (((p = d.sibling), p !== null)) {
                      (p.return = d.return), (d = p);
                      break;
                    }
                    d = d.return;
                  }
                p = d;
              }
          Ge(e, t, o.children, n), (t = t.child);
        }
        return t;
      case 9:
        return (
          (o = t.type),
          (s = t.pendingProps),
          (r = s.children),
          _n(t, n),
          (o = lt(o, s.unstable_observedBits)),
          (r = r(o)),
          (t.flags |= 1),
          Ge(e, t, r, n),
          t.child
        );
      case 14:
        return (
          (o = t.type),
          (s = ct(o, t.pendingProps)),
          (s = ct(o.type, s)),
          Cu(e, t, o, s, r, n)
        );
      case 15:
        return Eu(e, t, t.type, t.pendingProps, r, n);
      case 17:
        return (
          (r = t.type),
          (o = t.pendingProps),
          (o = t.elementType === r ? o : ct(r, o)),
          e !== null &&
            ((e.alternate = null), (t.alternate = null), (t.flags |= 2)),
          (t.tag = 1),
          Qe(r) ? ((e = !0), uo(t)) : (e = !1),
          _n(t, n),
          nu(t, r, o),
          Ki(t, r, o, n),
          pl(null, t, r, !0, e, n)
        );
      case 19:
        return Ou(e, t, n);
      case 23:
        return dl(e, t, n);
      case 24:
        return dl(e, t, n);
    }
    throw Error(a(156, t.tag));
  };
  function up(e, t, n, r) {
    (this.tag = e),
      (this.key = n),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.ref = null),
      (this.pendingProps = t),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = r),
      (this.flags = 0),
      (this.lastEffect = this.firstEffect = this.nextEffect = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null);
  }
  function ut(e, t, n, r) {
    return new up(e, t, n, r);
  }
  function Rl(e) {
    return (e = e.prototype), !(!e || !e.isReactComponent);
  }
  function cp(e) {
    if (typeof e == "function") return Rl(e) ? 1 : 0;
    if (e != null) {
      if (((e = e.$$typeof), e === oe)) return 11;
      if (e === Oe) return 14;
    }
    return 2;
  }
  function Yt(e, t) {
    var n = e.alternate;
    return (
      n === null
        ? ((n = ut(e.tag, t, e.key, e.mode)),
          (n.elementType = e.elementType),
          (n.type = e.type),
          (n.stateNode = e.stateNode),
          (n.alternate = e),
          (e.alternate = n))
        : ((n.pendingProps = t),
          (n.type = e.type),
          (n.flags = 0),
          (n.nextEffect = null),
          (n.firstEffect = null),
          (n.lastEffect = null)),
      (n.childLanes = e.childLanes),
      (n.lanes = e.lanes),
      (n.child = e.child),
      (n.memoizedProps = e.memoizedProps),
      (n.memoizedState = e.memoizedState),
      (n.updateQueue = e.updateQueue),
      (t = e.dependencies),
      (n.dependencies =
        t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
      (n.sibling = e.sibling),
      (n.index = e.index),
      (n.ref = e.ref),
      n
    );
  }
  function Do(e, t, n, r, o, s) {
    var d = 2;
    if (((r = e), typeof e == "function")) Rl(e) && (d = 1);
    else if (typeof e == "string") d = 5;
    else
      e: switch (e) {
        case $:
          return zn(n.children, o, s, t);
        case W:
          (d = 8), (o |= 16);
          break;
        case ue:
          (d = 8), (o |= 1);
          break;
        case ne:
          return (
            (e = ut(12, n, t, o | 8)),
            (e.elementType = ne),
            (e.type = ne),
            (e.lanes = s),
            e
          );
        case ye:
          return (
            (e = ut(13, n, t, o)),
            (e.type = ye),
            (e.elementType = ye),
            (e.lanes = s),
            e
          );
        case se:
          return (e = ut(19, n, t, o)), (e.elementType = se), (e.lanes = s), e;
        case k:
          return Ll(n, o, s, t);
        case O:
          return (e = ut(24, n, t, o)), (e.elementType = O), (e.lanes = s), e;
        default:
          if (typeof e == "object" && e !== null)
            switch (e.$$typeof) {
              case ce:
                d = 10;
                break e;
              case ee:
                d = 9;
                break e;
              case oe:
                d = 11;
                break e;
              case Oe:
                d = 14;
                break e;
              case T:
                (d = 16), (r = null);
                break e;
              case M:
                d = 22;
                break e;
            }
          throw Error(a(130, e == null ? e : typeof e, ""));
      }
    return (
      (t = ut(d, n, t, o)), (t.elementType = e), (t.type = r), (t.lanes = s), t
    );
  }
  function zn(e, t, n, r) {
    return (e = ut(7, e, r, t)), (e.lanes = n), e;
  }
  function Ll(e, t, n, r) {
    return (e = ut(23, e, r, t)), (e.elementType = k), (e.lanes = n), e;
  }
  function bl(e, t, n) {
    return (e = ut(6, e, null, t)), (e.lanes = n), e;
  }
  function Ml(e, t, n) {
    return (
      (t = ut(4, e.children !== null ? e.children : [], e.key, t)),
      (t.lanes = n),
      (t.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        implementation: e.implementation,
      }),
      t
    );
  }
  function dp(e, t, n) {
    (this.tag = t),
      (this.containerInfo = e),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.pendingContext = this.context = null),
      (this.hydrate = n),
      (this.callbackNode = null),
      (this.callbackPriority = 0),
      (this.eventTimes = Ei(0)),
      (this.expirationTimes = Ei(-1)),
      (this.entangledLanes =
        this.finishedLanes =
        this.mutableReadLanes =
        this.expiredLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = Ei(0)),
      (this.mutableSourceEagerHydrationData = null);
  }
  function fp(e, t, n) {
    var r =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: Z,
      key: r == null ? null : "" + r,
      children: e,
      containerInfo: t,
      implementation: n,
    };
  }
  function zo(e, t, n, r) {
    var o = t.current,
      s = tt(),
      d = Wt(o);
    e: if (n) {
      n = n._reactInternals;
      t: {
        if (qt(n) !== n || n.tag !== 1) throw Error(a(170));
        var p = n;
        do {
          switch (p.tag) {
            case 3:
              p = p.stateNode.context;
              break t;
            case 1:
              if (Qe(p.type)) {
                p = p.stateNode.__reactInternalMemoizedMergedChildContext;
                break t;
              }
          }
          p = p.return;
        } while (p !== null);
        throw Error(a(171));
      }
      if (n.tag === 1) {
        var v = n.type;
        if (Qe(v)) {
          n = Ua(n, v, p);
          break e;
        }
      }
      n = p;
    } else n = Mt;
    return (
      t.context === null ? (t.context = n) : (t.pendingContext = n),
      (t = zt(s, d)),
      (t.payload = { element: e }),
      (r = r === void 0 ? null : r),
      r !== null && (t.callback = r),
      Ft(o, t),
      Vt(o, d, s),
      d
    );
  }
  function Dl(e) {
    if (((e = e.current), !e.child)) return null;
    switch (e.child.tag) {
      case 5:
        return e.child.stateNode;
      default:
        return e.child.stateNode;
    }
  }
  function tc(e, t) {
    if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
      var n = e.retryLane;
      e.retryLane = n !== 0 && n < t ? n : t;
    }
  }
  function zl(e, t) {
    tc(e, t), (e = e.alternate) && tc(e, t);
  }
  function pp() {
    return null;
  }
  function Fl(e, t, n) {
    var r =
      (n != null &&
        n.hydrationOptions != null &&
        n.hydrationOptions.mutableSources) ||
      null;
    if (
      ((n = new dp(e, t, n != null && n.hydrate === !0)),
      (t = ut(3, null, null, t === 2 ? 7 : t === 1 ? 3 : 0)),
      (n.current = t),
      (t.stateNode = n),
      Xi(t),
      (e[Tn] = n.current),
      Ia(e.nodeType === 8 ? e.parentNode : e),
      r)
    )
      for (e = 0; e < r.length; e++) {
        t = r[e];
        var o = t._getVersion;
        (o = o(t._source)),
          n.mutableSourceEagerHydrationData == null
            ? (n.mutableSourceEagerHydrationData = [t, o])
            : n.mutableSourceEagerHydrationData.push(t, o);
      }
    this._internalRoot = n;
  }
  (Fl.prototype.render = function (e) {
    zo(e, this._internalRoot, null, null);
  }),
    (Fl.prototype.unmount = function () {
      var e = this._internalRoot,
        t = e.containerInfo;
      zo(null, e, null, function () {
        t[Tn] = null;
      });
    });
  function Rr(e) {
    return !(
      !e ||
      (e.nodeType !== 1 &&
        e.nodeType !== 9 &&
        e.nodeType !== 11 &&
        (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
    );
  }
  function hp(e, t) {
    if (
      (t ||
        ((t = e ? (e.nodeType === 9 ? e.documentElement : e.firstChild) : null),
        (t = !(!t || t.nodeType !== 1 || !t.hasAttribute("data-reactroot")))),
      !t)
    )
      for (var n; (n = e.lastChild); ) e.removeChild(n);
    return new Fl(e, 0, t ? { hydrate: !0 } : void 0);
  }
  function Fo(e, t, n, r, o) {
    var s = n._reactRootContainer;
    if (s) {
      var d = s._internalRoot;
      if (typeof o == "function") {
        var p = o;
        o = function () {
          var A = Dl(d);
          p.call(A);
        };
      }
      zo(t, d, e, o);
    } else {
      if (
        ((s = n._reactRootContainer = hp(n, r)),
        (d = s._internalRoot),
        typeof o == "function")
      ) {
        var v = o;
        o = function () {
          var A = Dl(d);
          v.call(A);
        };
      }
      Zu(function () {
        zo(t, d, e, o);
      });
    }
    return Dl(d);
  }
  (Hs = function (e) {
    if (e.tag === 13) {
      var t = tt();
      Vt(e, 4, t), zl(e, 4);
    }
  }),
    (vi = function (e) {
      if (e.tag === 13) {
        var t = tt();
        Vt(e, 67108864, t), zl(e, 67108864);
      }
    }),
    ($s = function (e) {
      if (e.tag === 13) {
        var t = tt(),
          n = Wt(e);
        Vt(e, n, t), zl(e, n);
      }
    }),
    (Ys = function (e, t) {
      return t();
    }),
    (ui = function (e, t, n) {
      switch (t) {
        case "input":
          if ((ei(e, n), (t = n.name), n.type === "radio" && t != null)) {
            for (n = e; n.parentNode; ) n = n.parentNode;
            for (
              n = n.querySelectorAll(
                "input[name=" + JSON.stringify("" + t) + '][type="radio"]',
              ),
                t = 0;
              t < n.length;
              t++
            ) {
              var r = n[t];
              if (r !== e && r.form === e.form) {
                var o = so(r);
                if (!o) throw Error(a(90));
                Ts(r), ei(r, o);
              }
            }
          }
          break;
        case "textarea":
          Is(e, n);
          break;
        case "select":
          (t = n.value), t != null && pn(e, !!n.multiple, t, !1);
      }
    }),
    (ci = Yu),
    (zs = function (e, t, n, r, o) {
      var s = ie;
      ie |= 4;
      try {
        return tn(98, e.bind(null, t, n, r, o));
      } finally {
        (ie = s), ie === 0 && (bn(), ht());
      }
    }),
    (di = function () {
      (ie & 49) === 0 && (ep(), Ht());
    }),
    (Fs = function (e, t) {
      var n = ie;
      ie |= 2;
      try {
        return e(t);
      } finally {
        (ie = n), ie === 0 && (bn(), ht());
      }
    });
  function nc(e, t) {
    var n =
      2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Rr(t)) throw Error(a(200));
    return fp(e, t, null, n);
  }
  var mp = { Events: [pr, jn, so, Ms, Ds, Ht, { current: !1 }] },
    Lr = {
      findFiberByHostInstance: Xt,
      bundleType: 0,
      version: "17.0.2",
      rendererPackageName: "react-dom",
    },
    vp = {
      bundleType: Lr.bundleType,
      version: Lr.version,
      rendererPackageName: Lr.rendererPackageName,
      rendererConfig: Lr.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: N.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (e) {
        return (e = Ws(e)), e === null ? null : e.stateNode;
      },
      findFiberByHostInstance: Lr.findFiberByHostInstance || pp,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
    };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Uo = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Uo.isDisabled && Uo.supportsFiber)
      try {
        (Hi = Uo.inject(vp)), (en = Uo);
      } catch {}
  }
  return (
    (nt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = mp),
    (nt.createPortal = nc),
    (nt.findDOMNode = function (e) {
      if (e == null) return null;
      if (e.nodeType === 1) return e;
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == "function"
          ? Error(a(188))
          : Error(a(268, Object.keys(e)));
      return (e = Ws(t)), (e = e === null ? null : e.stateNode), e;
    }),
    (nt.flushSync = function (e, t) {
      var n = ie;
      if ((n & 48) !== 0) return e(t);
      ie |= 1;
      try {
        if (e) return tn(99, e.bind(null, t));
      } finally {
        (ie = n), ht();
      }
    }),
    (nt.hydrate = function (e, t, n) {
      if (!Rr(t)) throw Error(a(200));
      return Fo(null, e, t, !0, n);
    }),
    (nt.render = function (e, t, n) {
      if (!Rr(t)) throw Error(a(200));
      return Fo(null, e, t, !1, n);
    }),
    (nt.unmountComponentAtNode = function (e) {
      if (!Rr(e)) throw Error(a(40));
      return e._reactRootContainer
        ? (Zu(function () {
            Fo(null, null, e, !1, function () {
              (e._reactRootContainer = null), (e[Tn] = null);
            });
          }),
          !0)
        : !1;
    }),
    (nt.unstable_batchedUpdates = Yu),
    (nt.unstable_createPortal = function (e, t) {
      return nc(
        e,
        t,
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null,
      );
    }),
    (nt.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
      if (!Rr(n)) throw Error(a(200));
      if (e == null || e._reactInternals === void 0) throw Error(a(38));
      return Fo(e, t, n, !1, r);
    }),
    (nt.version = "17.0.2"),
    nt
  );
}
var dc;
function Tp() {
  if (dc) return Vl.exports;
  dc = 1;
  function i() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i);
      } catch (l) {
        console.error(l);
      }
  }
  return i(), (Vl.exports = Sp()), Vl.exports;
}
var jp = Tp();
const kp = cn(jp);
function ss(i, l) {
  return (
    (ss = Object.setPrototypeOf
      ? Object.setPrototypeOf.bind()
      : function (c, a) {
          return (c.__proto__ = a), c;
        }),
    ss(i, l)
  );
}
function xt(i, l) {
  (i.prototype = Object.create(l.prototype)),
    (i.prototype.constructor = i),
    ss(i, l);
}
var Yl = { exports: {} },
  Zl,
  fc;
function Ap() {
  if (fc) return Zl;
  fc = 1;
  var i = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return (Zl = i), Zl;
}
var Ql, pc;
function Pp() {
  if (pc) return Ql;
  pc = 1;
  var i = Ap();
  function l() {}
  function c() {}
  return (
    (c.resetWarningCache = l),
    (Ql = function () {
      function a(g, y, m, x, C, j) {
        if (j !== i) {
          var P = new Error(
            "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types",
          );
          throw ((P.name = "Invariant Violation"), P);
        }
      }
      a.isRequired = a;
      function f() {
        return a;
      }
      var h = {
        array: a,
        bigint: a,
        bool: a,
        func: a,
        number: a,
        object: a,
        string: a,
        symbol: a,
        any: a,
        arrayOf: f,
        element: a,
        elementType: a,
        instanceOf: f,
        node: a,
        objectOf: f,
        oneOf: f,
        oneOfType: f,
        shape: f,
        exact: f,
        checkPropTypes: c,
        resetWarningCache: l,
      };
      return (h.PropTypes = h), h;
    }),
    Ql
  );
}
var hc;
function Ip() {
  return hc || ((hc = 1), (Yl.exports = Pp()())), Yl.exports;
}
var _p = Ip();
const Te = cn(_p);
function $e() {
  return (
    ($e = Object.assign
      ? Object.assign.bind()
      : function (i) {
          for (var l = 1; l < arguments.length; l++) {
            var c = arguments[l];
            for (var a in c) ({}).hasOwnProperty.call(c, a) && (i[a] = c[a]);
          }
          return i;
        }),
    $e.apply(null, arguments)
  );
}
function Bo(i) {
  return i.charAt(0) === "/";
}
function Jl(i, l) {
  for (var c = l, a = c + 1, f = i.length; a < f; c += 1, a += 1) i[c] = i[a];
  i.pop();
}
function Op(i, l) {
  l === void 0 && (l = "");
  var c = (i && i.split("/")) || [],
    a = (l && l.split("/")) || [],
    f = i && Bo(i),
    h = l && Bo(l),
    g = f || h;
  if (
    (i && Bo(i) ? (a = c) : c.length && (a.pop(), (a = a.concat(c))), !a.length)
  )
    return "/";
  var y;
  if (a.length) {
    var m = a[a.length - 1];
    y = m === "." || m === ".." || m === "";
  } else y = !1;
  for (var x = 0, C = a.length; C >= 0; C--) {
    var j = a[C];
    j === "." ? Jl(a, C) : j === ".." ? (Jl(a, C), x++) : x && (Jl(a, C), x--);
  }
  if (!g) for (; x--; x) a.unshift("..");
  g && a[0] !== "" && (!a[0] || !Bo(a[0])) && a.unshift("");
  var P = a.join("/");
  return y && P.substr(-1) !== "/" && (P += "/"), P;
}
var Np = "Invariant failed";
function dn(i, l) {
  throw new Error(Np);
}
function Fr(i) {
  return i.charAt(0) === "/" ? i : "/" + i;
}
function mc(i) {
  return i.charAt(0) === "/" ? i.substr(1) : i;
}
function Rp(i, l) {
  return (
    i.toLowerCase().indexOf(l.toLowerCase()) === 0 &&
    "/?#".indexOf(i.charAt(l.length)) !== -1
  );
}
function Gc(i, l) {
  return Rp(i, l) ? i.substr(l.length) : i;
}
function qc(i) {
  return i.charAt(i.length - 1) === "/" ? i.slice(0, -1) : i;
}
function Lp(i) {
  var l = i || "/",
    c = "",
    a = "",
    f = l.indexOf("#");
  f !== -1 && ((a = l.substr(f)), (l = l.substr(0, f)));
  var h = l.indexOf("?");
  return (
    h !== -1 && ((c = l.substr(h)), (l = l.substr(0, h))),
    { pathname: l, search: c === "?" ? "" : c, hash: a === "#" ? "" : a }
  );
}
function Ke(i) {
  var l = i.pathname,
    c = i.search,
    a = i.hash,
    f = l || "/";
  return (
    c && c !== "?" && (f += c.charAt(0) === "?" ? c : "?" + c),
    a && a !== "#" && (f += a.charAt(0) === "#" ? a : "#" + a),
    f
  );
}
function rt(i, l, c, a) {
  var f;
  typeof i == "string"
    ? ((f = Lp(i)), (f.state = l))
    : ((f = $e({}, i)),
      f.pathname === void 0 && (f.pathname = ""),
      f.search
        ? f.search.charAt(0) !== "?" && (f.search = "?" + f.search)
        : (f.search = ""),
      f.hash
        ? f.hash.charAt(0) !== "#" && (f.hash = "#" + f.hash)
        : (f.hash = ""),
      l !== void 0 && f.state === void 0 && (f.state = l));
  try {
    f.pathname = decodeURI(f.pathname);
  } catch (h) {
    throw h instanceof URIError
      ? new URIError(
          'Pathname "' +
            f.pathname +
            '" could not be decoded. This is likely caused by an invalid percent-encoding.',
        )
      : h;
  }
  return (
    c && (f.key = c),
    a
      ? f.pathname
        ? f.pathname.charAt(0) !== "/" &&
          (f.pathname = Op(f.pathname, a.pathname))
        : (f.pathname = a.pathname)
      : f.pathname || (f.pathname = "/"),
    f
  );
}
function ms() {
  var i = null;
  function l(g) {
    return (
      (i = g),
      function () {
        i === g && (i = null);
      }
    );
  }
  function c(g, y, m, x) {
    if (i != null) {
      var C = typeof i == "function" ? i(g, y) : i;
      typeof C == "string"
        ? typeof m == "function"
          ? m(C, x)
          : x(!0)
        : x(C !== !1);
    } else x(!0);
  }
  var a = [];
  function f(g) {
    var y = !0;
    function m() {
      y && g.apply(void 0, arguments);
    }
    return (
      a.push(m),
      function () {
        (y = !1),
          (a = a.filter(function (x) {
            return x !== m;
          }));
      }
    );
  }
  function h() {
    for (var g = arguments.length, y = new Array(g), m = 0; m < g; m++)
      y[m] = arguments[m];
    a.forEach(function (x) {
      return x.apply(void 0, y);
    });
  }
  return {
    setPrompt: l,
    confirmTransitionTo: c,
    appendListener: f,
    notifyListeners: h,
  };
}
var Xc = !!(
  typeof window < "u" &&
  window.document &&
  window.document.createElement
);
function Kc(i, l) {
  l(window.confirm(i));
}
function bp() {
  var i = window.navigator.userAgent;
  return (i.indexOf("Android 2.") !== -1 || i.indexOf("Android 4.0") !== -1) &&
    i.indexOf("Mobile Safari") !== -1 &&
    i.indexOf("Chrome") === -1 &&
    i.indexOf("Windows Phone") === -1
    ? !1
    : window.history && "pushState" in window.history;
}
function Mp() {
  return window.navigator.userAgent.indexOf("Trident") === -1;
}
function Dp() {
  return window.navigator.userAgent.indexOf("Firefox") === -1;
}
function zp(i) {
  return i.state === void 0 && navigator.userAgent.indexOf("CriOS") === -1;
}
var vc = "popstate",
  yc = "hashchange";
function gc() {
  try {
    return window.history.state || {};
  } catch {
    return {};
  }
}
function Fp(i) {
  i === void 0 && (i = {}), Xc || dn();
  var l = window.history,
    c = bp(),
    a = !Mp(),
    f = i,
    h = f.forceRefresh,
    g = h === void 0 ? !1 : h,
    y = f.getUserConfirmation,
    m = y === void 0 ? Kc : y,
    x = f.keyLength,
    C = x === void 0 ? 6 : x,
    j = i.basename ? qc(Fr(i.basename)) : "";
  function P(B) {
    var W = B || {},
      k = W.key,
      O = W.state,
      b = window.location,
      J = b.pathname,
      X = b.search,
      we = b.hash,
      Ee = J + X + we;
    return j && (Ee = Gc(Ee, j)), rt(Ee, O, k);
  }
  function R() {
    return Math.random().toString(36).substr(2, C);
  }
  var U = ms();
  function G(B) {
    $e(M, B), (M.length = l.length), U.notifyListeners(M.location, M.action);
  }
  function Y(B) {
    zp(B) || F(P(B.state));
  }
  function I() {
    F(P(gc()));
  }
  var z = !1;
  function F(B) {
    if (z) (z = !1), G();
    else {
      var W = "POP";
      U.confirmTransitionTo(B, W, m, function (k) {
        k ? G({ action: W, location: B }) : te(B);
      });
    }
  }
  function te(B) {
    var W = M.location,
      k = V.indexOf(W.key);
    k === -1 && (k = 0);
    var O = V.indexOf(B.key);
    O === -1 && (O = 0);
    var b = k - O;
    b && ((z = !0), ne(b));
  }
  var N = P(gc()),
    V = [N.key];
  function Z(B) {
    return j + Ke(B);
  }
  function $(B, W) {
    var k = "PUSH",
      O = rt(B, W, R(), M.location);
    U.confirmTransitionTo(O, k, m, function (b) {
      if (b) {
        var J = Z(O),
          X = O.key,
          we = O.state;
        if (c)
          if ((l.pushState({ key: X, state: we }, null, J), g))
            window.location.href = J;
          else {
            var Ee = V.indexOf(M.location.key),
              Me = V.slice(0, Ee + 1);
            Me.push(O.key), (V = Me), G({ action: k, location: O });
          }
        else window.location.href = J;
      }
    });
  }
  function ue(B, W) {
    var k = "REPLACE",
      O = rt(B, W, R(), M.location);
    U.confirmTransitionTo(O, k, m, function (b) {
      if (b) {
        var J = Z(O),
          X = O.key,
          we = O.state;
        if (c)
          if ((l.replaceState({ key: X, state: we }, null, J), g))
            window.location.replace(J);
          else {
            var Ee = V.indexOf(M.location.key);
            Ee !== -1 && (V[Ee] = O.key), G({ action: k, location: O });
          }
        else window.location.replace(J);
      }
    });
  }
  function ne(B) {
    l.go(B);
  }
  function ce() {
    ne(-1);
  }
  function ee() {
    ne(1);
  }
  var oe = 0;
  function ye(B) {
    (oe += B),
      oe === 1 && B === 1
        ? (window.addEventListener(vc, Y), a && window.addEventListener(yc, I))
        : oe === 0 &&
          (window.removeEventListener(vc, Y),
          a && window.removeEventListener(yc, I));
  }
  var se = !1;
  function Oe(B) {
    B === void 0 && (B = !1);
    var W = U.setPrompt(B);
    return (
      se || (ye(1), (se = !0)),
      function () {
        return se && ((se = !1), ye(-1)), W();
      }
    );
  }
  function T(B) {
    var W = U.appendListener(B);
    return (
      ye(1),
      function () {
        ye(-1), W();
      }
    );
  }
  var M = {
    length: l.length,
    action: "POP",
    location: N,
    createHref: Z,
    push: $,
    replace: ue,
    go: ne,
    goBack: ce,
    goForward: ee,
    block: Oe,
    listen: T,
  };
  return M;
}
var wc = "hashchange",
  Up = {
    hashbang: {
      encodePath: function (l) {
        return l.charAt(0) === "!" ? l : "!/" + mc(l);
      },
      decodePath: function (l) {
        return l.charAt(0) === "!" ? l.substr(1) : l;
      },
    },
    noslash: { encodePath: mc, decodePath: Fr },
    slash: { encodePath: Fr, decodePath: Fr },
  };
function ed(i) {
  var l = i.indexOf("#");
  return l === -1 ? i : i.slice(0, l);
}
function br() {
  var i = window.location.href,
    l = i.indexOf("#");
  return l === -1 ? "" : i.substring(l + 1);
}
function Bp(i) {
  window.location.hash = i;
}
function Gl(i) {
  window.location.replace(ed(window.location.href) + "#" + i);
}
function Wp(i) {
  i === void 0 && (i = {}), Xc || dn();
  var l = window.history;
  Dp();
  var c = i,
    a = c.getUserConfirmation,
    f = a === void 0 ? Kc : a,
    h = c.hashType,
    g = h === void 0 ? "slash" : h,
    y = i.basename ? qc(Fr(i.basename)) : "",
    m = Up[g],
    x = m.encodePath,
    C = m.decodePath;
  function j() {
    var W = C(br());
    return y && (W = Gc(W, y)), rt(W);
  }
  var P = ms();
  function R(W) {
    $e(B, W), (B.length = l.length), P.notifyListeners(B.location, B.action);
  }
  var U = !1,
    G = null;
  function Y(W, k) {
    return (
      W.pathname === k.pathname && W.search === k.search && W.hash === k.hash
    );
  }
  function I() {
    var W = br(),
      k = x(W);
    if (W !== k) Gl(k);
    else {
      var O = j(),
        b = B.location;
      if ((!U && Y(b, O)) || G === Ke(O)) return;
      (G = null), z(O);
    }
  }
  function z(W) {
    if (U) (U = !1), R();
    else {
      var k = "POP";
      P.confirmTransitionTo(W, k, f, function (O) {
        O ? R({ action: k, location: W }) : F(W);
      });
    }
  }
  function F(W) {
    var k = B.location,
      O = Z.lastIndexOf(Ke(k));
    O === -1 && (O = 0);
    var b = Z.lastIndexOf(Ke(W));
    b === -1 && (b = 0);
    var J = O - b;
    J && ((U = !0), ce(J));
  }
  var te = br(),
    N = x(te);
  te !== N && Gl(N);
  var V = j(),
    Z = [Ke(V)];
  function $(W) {
    var k = document.querySelector("base"),
      O = "";
    return (
      k && k.getAttribute("href") && (O = ed(window.location.href)),
      O + "#" + x(y + Ke(W))
    );
  }
  function ue(W, k) {
    var O = "PUSH",
      b = rt(W, void 0, void 0, B.location);
    P.confirmTransitionTo(b, O, f, function (J) {
      if (J) {
        var X = Ke(b),
          we = x(y + X),
          Ee = br() !== we;
        if (Ee) {
          (G = X), Bp(we);
          var Me = Z.lastIndexOf(Ke(B.location)),
            Ye = Z.slice(0, Me + 1);
          Ye.push(X), (Z = Ye), R({ action: O, location: b });
        } else R();
      }
    });
  }
  function ne(W, k) {
    var O = "REPLACE",
      b = rt(W, void 0, void 0, B.location);
    P.confirmTransitionTo(b, O, f, function (J) {
      if (J) {
        var X = Ke(b),
          we = x(y + X),
          Ee = br() !== we;
        Ee && ((G = X), Gl(we));
        var Me = Z.indexOf(Ke(B.location));
        Me !== -1 && (Z[Me] = X), R({ action: O, location: b });
      }
    });
  }
  function ce(W) {
    l.go(W);
  }
  function ee() {
    ce(-1);
  }
  function oe() {
    ce(1);
  }
  var ye = 0;
  function se(W) {
    (ye += W),
      ye === 1 && W === 1
        ? window.addEventListener(wc, I)
        : ye === 0 && window.removeEventListener(wc, I);
  }
  var Oe = !1;
  function T(W) {
    W === void 0 && (W = !1);
    var k = P.setPrompt(W);
    return (
      Oe || (se(1), (Oe = !0)),
      function () {
        return Oe && ((Oe = !1), se(-1)), k();
      }
    );
  }
  function M(W) {
    var k = P.appendListener(W);
    return (
      se(1),
      function () {
        se(-1), k();
      }
    );
  }
  var B = {
    length: l.length,
    action: "POP",
    location: V,
    createHref: $,
    push: ue,
    replace: ne,
    go: ce,
    goBack: ee,
    goForward: oe,
    block: T,
    listen: M,
  };
  return B;
}
function xc(i, l, c) {
  return Math.min(Math.max(i, l), c);
}
function Vp(i) {
  i === void 0 && (i = {});
  var l = i,
    c = l.getUserConfirmation,
    a = l.initialEntries,
    f = a === void 0 ? ["/"] : a,
    h = l.initialIndex,
    g = h === void 0 ? 0 : h,
    y = l.keyLength,
    m = y === void 0 ? 6 : y,
    x = ms();
  function C($) {
    $e(Z, $),
      (Z.length = Z.entries.length),
      x.notifyListeners(Z.location, Z.action);
  }
  function j() {
    return Math.random().toString(36).substr(2, m);
  }
  var P = xc(g, 0, f.length - 1),
    R = f.map(function ($) {
      return typeof $ == "string"
        ? rt($, void 0, j())
        : rt($, void 0, $.key || j());
    }),
    U = Ke;
  function G($, ue) {
    var ne = "PUSH",
      ce = rt($, ue, j(), Z.location);
    x.confirmTransitionTo(ce, ne, c, function (ee) {
      if (ee) {
        var oe = Z.index,
          ye = oe + 1,
          se = Z.entries.slice(0);
        se.length > ye ? se.splice(ye, se.length - ye, ce) : se.push(ce),
          C({ action: ne, location: ce, index: ye, entries: se });
      }
    });
  }
  function Y($, ue) {
    var ne = "REPLACE",
      ce = rt($, ue, j(), Z.location);
    x.confirmTransitionTo(ce, ne, c, function (ee) {
      ee && ((Z.entries[Z.index] = ce), C({ action: ne, location: ce }));
    });
  }
  function I($) {
    var ue = xc(Z.index + $, 0, Z.entries.length - 1),
      ne = "POP",
      ce = Z.entries[ue];
    x.confirmTransitionTo(ce, ne, c, function (ee) {
      ee ? C({ action: ne, location: ce, index: ue }) : C();
    });
  }
  function z() {
    I(-1);
  }
  function F() {
    I(1);
  }
  function te($) {
    var ue = Z.index + $;
    return ue >= 0 && ue < Z.entries.length;
  }
  function N($) {
    return $ === void 0 && ($ = !1), x.setPrompt($);
  }
  function V($) {
    return x.appendListener($);
  }
  var Z = {
    length: R.length,
    action: "POP",
    location: R[P],
    index: P,
    entries: R,
    createHref: U,
    push: G,
    replace: Y,
    go: I,
    goBack: z,
    goForward: F,
    canGo: te,
    block: N,
    listen: V,
  };
  return Z;
}
var an = { exports: {} },
  ql,
  Cc;
function Hp() {
  return (
    Cc ||
      ((Cc = 1),
      (ql =
        Array.isArray ||
        function (i) {
          return Object.prototype.toString.call(i) == "[object Array]";
        })),
    ql
  );
}
var Ec;
function $p() {
  if (Ec) return an.exports;
  Ec = 1;
  var i = Hp();
  (an.exports = Y),
    (an.exports.parse = c),
    (an.exports.compile = f),
    (an.exports.tokensToFunction = y),
    (an.exports.tokensToRegExp = G);
  var l = new RegExp(
    [
      "(\\\\.)",
      "([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))",
    ].join("|"),
    "g",
  );
  function c(I, z) {
    for (
      var F = [], te = 0, N = 0, V = "", Z = (z && z.delimiter) || "/", $;
      ($ = l.exec(I)) != null;

    ) {
      var ue = $[0],
        ne = $[1],
        ce = $.index;
      if (((V += I.slice(N, ce)), (N = ce + ue.length), ne)) {
        V += ne[1];
        continue;
      }
      var ee = I[N],
        oe = $[2],
        ye = $[3],
        se = $[4],
        Oe = $[5],
        T = $[6],
        M = $[7];
      V && (F.push(V), (V = ""));
      var B = oe != null && ee != null && ee !== oe,
        W = T === "+" || T === "*",
        k = T === "?" || T === "*",
        O = oe || Z,
        b = se || Oe,
        J = oe || (typeof F[F.length - 1] == "string" ? F[F.length - 1] : "");
      F.push({
        name: ye || te++,
        prefix: oe || "",
        delimiter: O,
        optional: k,
        repeat: W,
        partial: B,
        asterisk: !!M,
        pattern: b ? x(b) : M ? ".*" : a(O, J),
      });
    }
    return N < I.length && (V += I.substr(N)), V && F.push(V), F;
  }
  function a(I, z) {
    return !z || z.indexOf(I) > -1
      ? "[^" + m(I) + "]+?"
      : m(z) + "|(?:(?!" + m(z) + ")[^" + m(I) + "])+?";
  }
  function f(I, z) {
    return y(c(I, z), z);
  }
  function h(I) {
    return encodeURI(I).replace(/[\/?#]/g, function (z) {
      return "%" + z.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  function g(I) {
    return encodeURI(I).replace(/[?#]/g, function (z) {
      return "%" + z.charCodeAt(0).toString(16).toUpperCase();
    });
  }
  function y(I, z) {
    for (var F = new Array(I.length), te = 0; te < I.length; te++)
      typeof I[te] == "object" &&
        (F[te] = new RegExp("^(?:" + I[te].pattern + ")$", j(z)));
    return function (N, V) {
      for (
        var Z = "",
          $ = N || {},
          ue = V || {},
          ne = ue.pretty ? h : encodeURIComponent,
          ce = 0;
        ce < I.length;
        ce++
      ) {
        var ee = I[ce];
        if (typeof ee == "string") {
          Z += ee;
          continue;
        }
        var oe = $[ee.name],
          ye;
        if (oe == null)
          if (ee.optional) {
            ee.partial && (Z += ee.prefix);
            continue;
          } else
            throw new TypeError('Expected "' + ee.name + '" to be defined');
        if (i(oe)) {
          if (!ee.repeat)
            throw new TypeError(
              'Expected "' +
                ee.name +
                '" to not repeat, but received `' +
                JSON.stringify(oe) +
                "`",
            );
          if (oe.length === 0) {
            if (ee.optional) continue;
            throw new TypeError('Expected "' + ee.name + '" to not be empty');
          }
          for (var se = 0; se < oe.length; se++) {
            if (((ye = ne(oe[se])), !F[ce].test(ye)))
              throw new TypeError(
                'Expected all "' +
                  ee.name +
                  '" to match "' +
                  ee.pattern +
                  '", but received `' +
                  JSON.stringify(ye) +
                  "`",
              );
            Z += (se === 0 ? ee.prefix : ee.delimiter) + ye;
          }
          continue;
        }
        if (((ye = ee.asterisk ? g(oe) : ne(oe)), !F[ce].test(ye)))
          throw new TypeError(
            'Expected "' +
              ee.name +
              '" to match "' +
              ee.pattern +
              '", but received "' +
              ye +
              '"',
          );
        Z += ee.prefix + ye;
      }
      return Z;
    };
  }
  function m(I) {
    return I.replace(/([.+*?=^!:${}()[\]|\/\\])/g, "\\$1");
  }
  function x(I) {
    return I.replace(/([=!:$\/()])/g, "\\$1");
  }
  function C(I, z) {
    return (I.keys = z), I;
  }
  function j(I) {
    return I && I.sensitive ? "" : "i";
  }
  function P(I, z) {
    var F = I.source.match(/\((?!\?)/g);
    if (F)
      for (var te = 0; te < F.length; te++)
        z.push({
          name: te,
          prefix: null,
          delimiter: null,
          optional: !1,
          repeat: !1,
          partial: !1,
          asterisk: !1,
          pattern: null,
        });
    return C(I, z);
  }
  function R(I, z, F) {
    for (var te = [], N = 0; N < I.length; N++) te.push(Y(I[N], z, F).source);
    var V = new RegExp("(?:" + te.join("|") + ")", j(F));
    return C(V, z);
  }
  function U(I, z, F) {
    return G(c(I, F), z, F);
  }
  function G(I, z, F) {
    i(z) || ((F = z || F), (z = [])), (F = F || {});
    for (
      var te = F.strict, N = F.end !== !1, V = "", Z = 0;
      Z < I.length;
      Z++
    ) {
      var $ = I[Z];
      if (typeof $ == "string") V += m($);
      else {
        var ue = m($.prefix),
          ne = "(?:" + $.pattern + ")";
        z.push($),
          $.repeat && (ne += "(?:" + ue + ne + ")*"),
          $.optional
            ? $.partial
              ? (ne = ue + "(" + ne + ")?")
              : (ne = "(?:" + ue + "(" + ne + "))?")
            : (ne = ue + "(" + ne + ")"),
          (V += ne);
      }
    }
    var ce = m(F.delimiter || "/"),
      ee = V.slice(-ce.length) === ce;
    return (
      te || (V = (ee ? V.slice(0, -ce.length) : V) + "(?:" + ce + "(?=$))?"),
      N ? (V += "$") : (V += te && ee ? "" : "(?=" + ce + "|$)"),
      C(new RegExp("^" + V, j(F)), z)
    );
  }
  function Y(I, z, F) {
    return (
      i(z) || ((F = z || F), (z = [])),
      (F = F || {}),
      I instanceof RegExp ? P(I, z) : i(I) ? R(I, z, F) : U(I, z, F)
    );
  }
  return an.exports;
}
var Yp = $p();
const Zp = cn(Yp);
var Xl = { exports: {} },
  Ce = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Sc;
function Qp() {
  if (Sc) return Ce;
  Sc = 1;
  var i = typeof Symbol == "function" && Symbol.for,
    l = i ? Symbol.for("react.element") : 60103,
    c = i ? Symbol.for("react.portal") : 60106,
    a = i ? Symbol.for("react.fragment") : 60107,
    f = i ? Symbol.for("react.strict_mode") : 60108,
    h = i ? Symbol.for("react.profiler") : 60114,
    g = i ? Symbol.for("react.provider") : 60109,
    y = i ? Symbol.for("react.context") : 60110,
    m = i ? Symbol.for("react.async_mode") : 60111,
    x = i ? Symbol.for("react.concurrent_mode") : 60111,
    C = i ? Symbol.for("react.forward_ref") : 60112,
    j = i ? Symbol.for("react.suspense") : 60113,
    P = i ? Symbol.for("react.suspense_list") : 60120,
    R = i ? Symbol.for("react.memo") : 60115,
    U = i ? Symbol.for("react.lazy") : 60116,
    G = i ? Symbol.for("react.block") : 60121,
    Y = i ? Symbol.for("react.fundamental") : 60117,
    I = i ? Symbol.for("react.responder") : 60118,
    z = i ? Symbol.for("react.scope") : 60119;
  function F(N) {
    if (typeof N == "object" && N !== null) {
      var V = N.$$typeof;
      switch (V) {
        case l:
          switch (((N = N.type), N)) {
            case m:
            case x:
            case a:
            case h:
            case f:
            case j:
              return N;
            default:
              switch (((N = N && N.$$typeof), N)) {
                case y:
                case C:
                case U:
                case R:
                case g:
                  return N;
                default:
                  return V;
              }
          }
        case c:
          return V;
      }
    }
  }
  function te(N) {
    return F(N) === x;
  }
  return (
    (Ce.AsyncMode = m),
    (Ce.ConcurrentMode = x),
    (Ce.ContextConsumer = y),
    (Ce.ContextProvider = g),
    (Ce.Element = l),
    (Ce.ForwardRef = C),
    (Ce.Fragment = a),
    (Ce.Lazy = U),
    (Ce.Memo = R),
    (Ce.Portal = c),
    (Ce.Profiler = h),
    (Ce.StrictMode = f),
    (Ce.Suspense = j),
    (Ce.isAsyncMode = function (N) {
      return te(N) || F(N) === m;
    }),
    (Ce.isConcurrentMode = te),
    (Ce.isContextConsumer = function (N) {
      return F(N) === y;
    }),
    (Ce.isContextProvider = function (N) {
      return F(N) === g;
    }),
    (Ce.isElement = function (N) {
      return typeof N == "object" && N !== null && N.$$typeof === l;
    }),
    (Ce.isForwardRef = function (N) {
      return F(N) === C;
    }),
    (Ce.isFragment = function (N) {
      return F(N) === a;
    }),
    (Ce.isLazy = function (N) {
      return F(N) === U;
    }),
    (Ce.isMemo = function (N) {
      return F(N) === R;
    }),
    (Ce.isPortal = function (N) {
      return F(N) === c;
    }),
    (Ce.isProfiler = function (N) {
      return F(N) === h;
    }),
    (Ce.isStrictMode = function (N) {
      return F(N) === f;
    }),
    (Ce.isSuspense = function (N) {
      return F(N) === j;
    }),
    (Ce.isValidElementType = function (N) {
      return (
        typeof N == "string" ||
        typeof N == "function" ||
        N === a ||
        N === x ||
        N === h ||
        N === f ||
        N === j ||
        N === P ||
        (typeof N == "object" &&
          N !== null &&
          (N.$$typeof === U ||
            N.$$typeof === R ||
            N.$$typeof === g ||
            N.$$typeof === y ||
            N.$$typeof === C ||
            N.$$typeof === Y ||
            N.$$typeof === I ||
            N.$$typeof === z ||
            N.$$typeof === G))
      );
    }),
    (Ce.typeOf = F),
    Ce
  );
}
var Tc;
function td() {
  return Tc || ((Tc = 1), (Xl.exports = Qp())), Xl.exports;
}
td();
function Go(i, l) {
  if (i == null) return {};
  var c = {};
  for (var a in i)
    if ({}.hasOwnProperty.call(i, a)) {
      if (l.indexOf(a) !== -1) continue;
      c[a] = i[a];
    }
  return c;
}
var Kl, jc;
function Jp() {
  if (jc) return Kl;
  jc = 1;
  var i = td(),
    l = {
      childContextTypes: !0,
      contextType: !0,
      contextTypes: !0,
      defaultProps: !0,
      displayName: !0,
      getDefaultProps: !0,
      getDerivedStateFromError: !0,
      getDerivedStateFromProps: !0,
      mixins: !0,
      propTypes: !0,
      type: !0,
    },
    c = {
      name: !0,
      length: !0,
      prototype: !0,
      caller: !0,
      callee: !0,
      arguments: !0,
      arity: !0,
    },
    a = {
      $$typeof: !0,
      render: !0,
      defaultProps: !0,
      displayName: !0,
      propTypes: !0,
    },
    f = {
      $$typeof: !0,
      compare: !0,
      defaultProps: !0,
      displayName: !0,
      propTypes: !0,
      type: !0,
    },
    h = {};
  (h[i.ForwardRef] = a), (h[i.Memo] = f);
  function g(U) {
    return i.isMemo(U) ? f : h[U.$$typeof] || l;
  }
  var y = Object.defineProperty,
    m = Object.getOwnPropertyNames,
    x = Object.getOwnPropertySymbols,
    C = Object.getOwnPropertyDescriptor,
    j = Object.getPrototypeOf,
    P = Object.prototype;
  function R(U, G, Y) {
    if (typeof G != "string") {
      if (P) {
        var I = j(G);
        I && I !== P && R(U, I, Y);
      }
      var z = m(G);
      x && (z = z.concat(x(G)));
      for (var F = g(U), te = g(G), N = 0; N < z.length; ++N) {
        var V = z[N];
        if (!c[V] && !(Y && Y[V]) && !(te && te[V]) && !(F && F[V])) {
          var Z = C(G, V);
          try {
            y(U, V, Z);
          } catch {}
        }
      }
    }
    return U;
  }
  return (Kl = R), Kl;
}
Jp();
var es = 1073741823,
  kc =
    typeof globalThis < "u"
      ? globalThis
      : typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : {};
function Gp() {
  var i = "__global_unique_id__";
  return (kc[i] = (kc[i] || 0) + 1);
}
function qp(i, l) {
  return i === l ? i !== 0 || 1 / i === 1 / l : i !== i && l !== l;
}
function Xp(i) {
  var l = [];
  return {
    on: function (a) {
      l.push(a);
    },
    off: function (a) {
      l = l.filter(function (f) {
        return f !== a;
      });
    },
    get: function () {
      return i;
    },
    set: function (a, f) {
      (i = a),
        l.forEach(function (h) {
          return h(i, f);
        });
    },
  };
}
function Kp(i) {
  return Array.isArray(i) ? i[0] : i;
}
function eh(i, l) {
  var c,
    a,
    f = "__create-react-context-" + Gp() + "__",
    h = (function (y) {
      xt(m, y);
      function m() {
        for (var C, j = arguments.length, P = new Array(j), R = 0; R < j; R++)
          P[R] = arguments[R];
        return (
          (C = y.call.apply(y, [this].concat(P)) || this),
          (C.emitter = Xp(C.props.value)),
          C
        );
      }
      var x = m.prototype;
      return (
        (x.getChildContext = function () {
          var j;
          return (j = {}), (j[f] = this.emitter), j;
        }),
        (x.componentWillReceiveProps = function (j) {
          if (this.props.value !== j.value) {
            var P = this.props.value,
              R = j.value,
              U;
            qp(P, R)
              ? (U = 0)
              : ((U = typeof l == "function" ? l(P, R) : es),
                (U |= 0),
                U !== 0 && this.emitter.set(j.value, U));
          }
        }),
        (x.render = function () {
          return this.props.children;
        }),
        m
      );
    })(ve.Component);
  h.childContextTypes = ((c = {}), (c[f] = Te.object.isRequired), c);
  var g = (function (y) {
    xt(m, y);
    function m() {
      for (var C, j = arguments.length, P = new Array(j), R = 0; R < j; R++)
        P[R] = arguments[R];
      return (
        (C = y.call.apply(y, [this].concat(P)) || this),
        (C.observedBits = void 0),
        (C.state = { value: C.getValue() }),
        (C.onUpdate = function (U, G) {
          var Y = C.observedBits | 0;
          (Y & G) !== 0 && C.setState({ value: C.getValue() });
        }),
        C
      );
    }
    var x = m.prototype;
    return (
      (x.componentWillReceiveProps = function (j) {
        var P = j.observedBits;
        this.observedBits = P ?? es;
      }),
      (x.componentDidMount = function () {
        this.context[f] && this.context[f].on(this.onUpdate);
        var j = this.props.observedBits;
        this.observedBits = j ?? es;
      }),
      (x.componentWillUnmount = function () {
        this.context[f] && this.context[f].off(this.onUpdate);
      }),
      (x.getValue = function () {
        return this.context[f] ? this.context[f].get() : i;
      }),
      (x.render = function () {
        return Kp(this.props.children)(this.state.value);
      }),
      m
    );
  })(ve.Component);
  return (
    (g.contextTypes = ((a = {}), (a[f] = Te.object), a)),
    { Provider: h, Consumer: g }
  );
}
var th = ve.createContext || eh,
  nd = function (l) {
    var c = th();
    return (c.displayName = l), c;
  },
  nh = nd("Router-History"),
  Jt = nd("Router"),
  qo = (function (i) {
    xt(l, i),
      (l.computeRootMatch = function (f) {
        return { path: "/", url: "/", params: {}, isExact: f === "/" };
      });
    function l(a) {
      var f;
      return (
        (f = i.call(this, a) || this),
        (f.state = { location: a.history.location }),
        (f._isMounted = !1),
        (f._pendingLocation = null),
        a.staticContext ||
          (f.unlisten = a.history.listen(function (h) {
            f._pendingLocation = h;
          })),
        f
      );
    }
    var c = l.prototype;
    return (
      (c.componentDidMount = function () {
        var f = this;
        (this._isMounted = !0),
          this.unlisten && this.unlisten(),
          this.props.staticContext ||
            (this.unlisten = this.props.history.listen(function (h) {
              f._isMounted && f.setState({ location: h });
            })),
          this._pendingLocation &&
            this.setState({ location: this._pendingLocation });
      }),
      (c.componentWillUnmount = function () {
        this.unlisten &&
          (this.unlisten(),
          (this._isMounted = !1),
          (this._pendingLocation = null));
      }),
      (c.render = function () {
        return ve.createElement(
          Jt.Provider,
          {
            value: {
              history: this.props.history,
              location: this.state.location,
              match: l.computeRootMatch(this.state.location.pathname),
              staticContext: this.props.staticContext,
            },
          },
          ve.createElement(nh.Provider, {
            children: this.props.children || null,
            value: this.props.history,
          }),
        );
      }),
      l
    );
  })(ve.Component);
ve.Component;
ve.Component;
var Ac = {},
  rh = 1e4,
  Pc = 0;
function oh(i, l) {
  var c = "" + l.end + l.strict + l.sensitive,
    a = Ac[c] || (Ac[c] = {});
  if (a[i]) return a[i];
  var f = [],
    h = Zp(i, f, l),
    g = { regexp: h, keys: f };
  return Pc < rh && ((a[i] = g), Pc++), g;
}
function vs(i, l) {
  l === void 0 && (l = {}),
    (typeof l == "string" || Array.isArray(l)) && (l = { path: l });
  var c = l,
    a = c.path,
    f = c.exact,
    h = f === void 0 ? !1 : f,
    g = c.strict,
    y = g === void 0 ? !1 : g,
    m = c.sensitive,
    x = m === void 0 ? !1 : m,
    C = [].concat(a);
  return C.reduce(function (j, P) {
    if (!P && P !== "") return null;
    if (j) return j;
    var R = oh(P, { end: h, strict: y, sensitive: x }),
      U = R.regexp,
      G = R.keys,
      Y = U.exec(i);
    if (!Y) return null;
    var I = Y[0],
      z = Y.slice(1),
      F = i === I;
    return h && !F
      ? null
      : {
          path: P,
          url: P === "/" && I === "" ? "/" : I,
          isExact: F,
          params: G.reduce(function (te, N, V) {
            return (te[N.name] = z[V]), te;
          }, {}),
        };
  }, null);
}
function ih(i) {
  return ve.Children.count(i) === 0;
}
var Ae = (function (i) {
  xt(l, i);
  function l() {
    return i.apply(this, arguments) || this;
  }
  var c = l.prototype;
  return (
    (c.render = function () {
      var f = this;
      return ve.createElement(Jt.Consumer, null, function (h) {
        h || dn();
        var g = f.props.location || h.location,
          y = f.props.computedMatch
            ? f.props.computedMatch
            : f.props.path
              ? vs(g.pathname, f.props)
              : h.match,
          m = $e({}, h, { location: g, match: y }),
          x = f.props,
          C = x.children,
          j = x.component,
          P = x.render;
        return (
          Array.isArray(C) && ih(C) && (C = null),
          ve.createElement(
            Jt.Provider,
            { value: m },
            m.match
              ? C
                ? typeof C == "function"
                  ? C(m)
                  : C
                : j
                  ? ve.createElement(j, m)
                  : P
                    ? P(m)
                    : null
              : typeof C == "function"
                ? C(m)
                : null,
          )
        );
      });
    }),
    l
  );
})(ve.Component);
function ys(i) {
  return i.charAt(0) === "/" ? i : "/" + i;
}
function lh(i, l) {
  return i ? $e({}, l, { pathname: ys(i) + l.pathname }) : l;
}
function sh(i, l) {
  if (!i) return l;
  var c = ys(i);
  return l.pathname.indexOf(c) !== 0
    ? l
    : $e({}, l, { pathname: l.pathname.substr(c.length) });
}
function Ic(i) {
  return typeof i == "string" ? i : Ke(i);
}
function ts(i) {
  return function () {
    dn();
  };
}
function _c() {}
ve.Component;
var rd = (function (i) {
    xt(l, i);
    function l() {
      return i.apply(this, arguments) || this;
    }
    var c = l.prototype;
    return (
      (c.render = function () {
        var f = this;
        return ve.createElement(Jt.Consumer, null, function (h) {
          h || dn();
          var g = f.props.location || h.location,
            y,
            m;
          return (
            ve.Children.forEach(f.props.children, function (x) {
              if (m == null && ve.isValidElement(x)) {
                y = x;
                var C = x.props.path || x.props.from;
                m = C ? vs(g.pathname, $e({}, x.props, { path: C })) : h.match;
              }
            }),
            m ? ve.cloneElement(y, { location: g, computedMatch: m }) : null
          );
        });
      }),
      l
    );
  })(ve.Component),
  od = ve.useContext;
function ah() {
  return od(Jt).location;
}
function id(i) {
  ah();
  var l = od(Jt).match;
  return l;
}
var uh = (function (i) {
  xt(l, i);
  function l() {
    for (var a, f = arguments.length, h = new Array(f), g = 0; g < f; g++)
      h[g] = arguments[g];
    return (
      (a = i.call.apply(i, [this].concat(h)) || this),
      (a.history = Fp(a.props)),
      a
    );
  }
  var c = l.prototype;
  return (
    (c.render = function () {
      return ve.createElement(qo, {
        history: this.history,
        children: this.props.children,
      });
    }),
    l
  );
})(ve.Component);
ve.Component;
var as = function (l, c) {
    return typeof l == "function" ? l(c) : l;
  },
  us = function (l, c) {
    return typeof l == "string" ? rt(l, null, null, c) : l;
  },
  gs = function (l) {
    return l;
  },
  $n = ve.forwardRef;
typeof $n > "u" && ($n = gs);
function ch(i) {
  return !!(i.metaKey || i.altKey || i.ctrlKey || i.shiftKey);
}
var dh = $n(function (i, l) {
    var c = i.innerRef,
      a = i.navigate,
      f = i.onClick,
      h = Go(i, ["innerRef", "navigate", "onClick"]),
      g = h.target,
      y = $e({}, h, {
        onClick: function (x) {
          try {
            f && f(x);
          } catch (C) {
            throw (x.preventDefault(), C);
          }
          !x.defaultPrevented &&
            x.button === 0 &&
            (!g || g === "_self") &&
            !ch(x) &&
            (x.preventDefault(), a());
        },
      });
    return gs !== $n ? (y.ref = l || c) : (y.ref = c), ve.createElement("a", y);
  }),
  Re = $n(function (i, l) {
    var c = i.component,
      a = c === void 0 ? dh : c,
      f = i.replace,
      h = i.to,
      g = i.innerRef,
      y = Go(i, ["component", "replace", "to", "innerRef"]);
    return ve.createElement(Jt.Consumer, null, function (m) {
      m || dn();
      var x = m.history,
        C = us(as(h, m.location), m.location),
        j = C ? x.createHref(C) : "",
        P = $e({}, y, {
          href: j,
          navigate: function () {
            var U = as(h, m.location),
              G = Ke(m.location) === Ke(us(U)),
              Y = f || G ? x.replace : x.push;
            Y(U);
          },
        });
      return (
        gs !== $n ? (P.ref = l || g) : (P.innerRef = g), ve.createElement(a, P)
      );
    });
  }),
  ld = function (l) {
    return l;
  },
  $o = ve.forwardRef;
typeof $o > "u" && ($o = ld);
function fh() {
  for (var i = arguments.length, l = new Array(i), c = 0; c < i; c++)
    l[c] = arguments[c];
  return l
    .filter(function (a) {
      return a;
    })
    .join(" ");
}
$o(function (i, l) {
  var c = i["aria-current"],
    a = c === void 0 ? "page" : c,
    f = i.activeClassName,
    h = f === void 0 ? "active" : f,
    g = i.activeStyle,
    y = i.className,
    m = i.exact,
    x = i.isActive,
    C = i.location,
    j = i.sensitive,
    P = i.strict,
    R = i.style,
    U = i.to,
    G = i.innerRef,
    Y = Go(i, [
      "aria-current",
      "activeClassName",
      "activeStyle",
      "className",
      "exact",
      "isActive",
      "location",
      "sensitive",
      "strict",
      "style",
      "to",
      "innerRef",
    ]);
  return ve.createElement(Jt.Consumer, null, function (I) {
    I || dn();
    var z = C || I.location,
      F = us(as(U, z), z),
      te = F.pathname,
      N = te && te.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1"),
      V = N
        ? vs(z.pathname, { path: N, exact: m, sensitive: j, strict: P })
        : null,
      Z = !!(x ? x(V, z) : V),
      $ = typeof y == "function" ? y(Z) : y,
      ue = typeof R == "function" ? R(Z) : R;
    Z && (($ = fh($, h)), (ue = $e({}, ue, g)));
    var ne = $e(
      { "aria-current": (Z && a) || null, className: $, style: ue, to: F },
      Y,
    );
    return (
      ld !== $o ? (ne.ref = l || G) : (ne.innerRef = G),
      ve.createElement(Re, ne)
    );
  });
});
var ns, Oc;
function ph() {
  if (Oc) return ns;
  Oc = 1;
  function i(y) {
    return y && typeof y == "object" && "default" in y ? y.default : y;
  }
  var l = Jo(),
    c = i(l);
  function a(y, m, x) {
    return (
      m in y
        ? Object.defineProperty(y, m, {
            value: x,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (y[m] = x),
      y
    );
  }
  function f(y, m) {
    (y.prototype = Object.create(m.prototype)),
      (y.prototype.constructor = y),
      (y.__proto__ = m);
  }
  var h = !!(
    typeof window < "u" &&
    window.document &&
    window.document.createElement
  );
  function g(y, m, x) {
    if (typeof y != "function")
      throw new Error("Expected reducePropsToState to be a function.");
    if (typeof m != "function")
      throw new Error("Expected handleStateChangeOnClient to be a function.");
    if (typeof x < "u" && typeof x != "function")
      throw new Error(
        "Expected mapStateOnServer to either be undefined or a function.",
      );
    function C(j) {
      return j.displayName || j.name || "Component";
    }
    return function (P) {
      if (typeof P != "function")
        throw new Error("Expected WrappedComponent to be a React component.");
      var R = [],
        U;
      function G() {
        (U = y(
          R.map(function (I) {
            return I.props;
          }),
        )),
          Y.canUseDOM ? m(U) : x && (U = x(U));
      }
      var Y = (function (I) {
        f(z, I);
        function z() {
          return I.apply(this, arguments) || this;
        }
        (z.peek = function () {
          return U;
        }),
          (z.rewind = function () {
            if (z.canUseDOM)
              throw new Error(
                "You may only call rewind() on the server. Call peek() to read the current state.",
              );
            var N = U;
            return (U = void 0), (R = []), N;
          });
        var F = z.prototype;
        return (
          (F.UNSAFE_componentWillMount = function () {
            R.push(this), G();
          }),
          (F.componentDidUpdate = function () {
            G();
          }),
          (F.componentWillUnmount = function () {
            var N = R.indexOf(this);
            R.splice(N, 1), G();
          }),
          (F.render = function () {
            return c.createElement(P, this.props);
          }),
          z
        );
      })(l.PureComponent);
      return (
        a(Y, "displayName", "SideEffect(" + C(P) + ")"), a(Y, "canUseDOM", h), Y
      );
    };
  }
  return (ns = g), ns;
}
var hh = ph();
const mh = cn(hh);
var rs, Nc;
function vh() {
  if (Nc) return rs;
  Nc = 1;
  var i = typeof Element < "u",
    l = typeof Map == "function",
    c = typeof Set == "function",
    a = typeof ArrayBuffer == "function" && !!ArrayBuffer.isView;
  function f(h, g) {
    if (h === g) return !0;
    if (h && g && typeof h == "object" && typeof g == "object") {
      if (h.constructor !== g.constructor) return !1;
      var y, m, x;
      if (Array.isArray(h)) {
        if (((y = h.length), y != g.length)) return !1;
        for (m = y; m-- !== 0; ) if (!f(h[m], g[m])) return !1;
        return !0;
      }
      var C;
      if (l && h instanceof Map && g instanceof Map) {
        if (h.size !== g.size) return !1;
        for (C = h.entries(); !(m = C.next()).done; )
          if (!g.has(m.value[0])) return !1;
        for (C = h.entries(); !(m = C.next()).done; )
          if (!f(m.value[1], g.get(m.value[0]))) return !1;
        return !0;
      }
      if (c && h instanceof Set && g instanceof Set) {
        if (h.size !== g.size) return !1;
        for (C = h.entries(); !(m = C.next()).done; )
          if (!g.has(m.value[0])) return !1;
        return !0;
      }
      if (a && ArrayBuffer.isView(h) && ArrayBuffer.isView(g)) {
        if (((y = h.length), y != g.length)) return !1;
        for (m = y; m-- !== 0; ) if (h[m] !== g[m]) return !1;
        return !0;
      }
      if (h.constructor === RegExp)
        return h.source === g.source && h.flags === g.flags;
      if (
        h.valueOf !== Object.prototype.valueOf &&
        typeof h.valueOf == "function" &&
        typeof g.valueOf == "function"
      )
        return h.valueOf() === g.valueOf();
      if (
        h.toString !== Object.prototype.toString &&
        typeof h.toString == "function" &&
        typeof g.toString == "function"
      )
        return h.toString() === g.toString();
      if (((x = Object.keys(h)), (y = x.length), y !== Object.keys(g).length))
        return !1;
      for (m = y; m-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(g, x[m])) return !1;
      if (i && h instanceof Element) return !1;
      for (m = y; m-- !== 0; )
        if (
          !(
            (x[m] === "_owner" || x[m] === "__v" || x[m] === "__o") &&
            h.$$typeof
          ) &&
          !f(h[x[m]], g[x[m]])
        )
          return !1;
      return !0;
    }
    return h !== h && g !== g;
  }
  return (
    (rs = function (g, y) {
      try {
        return f(g, y);
      } catch (m) {
        if ((m.message || "").match(/stack|recursion/i))
          return (
            console.warn("react-fast-compare cannot handle circular refs"), !1
          );
        throw m;
      }
    }),
    rs
  );
}
var yh = vh();
const gh = cn(yh);
var wh = Qo();
const xh = cn(wh);
var un = {
    BODY: "bodyAttributes",
    HTML: "htmlAttributes",
    TITLE: "titleAttributes",
  },
  pe = {
    BASE: "base",
    BODY: "body",
    HEAD: "head",
    HTML: "html",
    LINK: "link",
    META: "meta",
    NOSCRIPT: "noscript",
    SCRIPT: "script",
    STYLE: "style",
    TITLE: "title",
  };
Object.keys(pe).map(function (i) {
  return pe[i];
});
var Pe = {
    CHARSET: "charset",
    CSS_TEXT: "cssText",
    HREF: "href",
    HTTPEQUIV: "http-equiv",
    INNER_HTML: "innerHTML",
    ITEM_PROP: "itemprop",
    NAME: "name",
    PROPERTY: "property",
    REL: "rel",
    SRC: "src",
    TARGET: "target",
  },
  Yo = {
    accesskey: "accessKey",
    charset: "charSet",
    class: "className",
    contenteditable: "contentEditable",
    contextmenu: "contextMenu",
    "http-equiv": "httpEquiv",
    itemprop: "itemProp",
    tabindex: "tabIndex",
  },
  Ur = {
    DEFAULT_TITLE: "defaultTitle",
    DEFER: "defer",
    ENCODE_SPECIAL_CHARACTERS: "encodeSpecialCharacters",
    ON_CHANGE_CLIENT_STATE: "onChangeClientState",
    TITLE_TEMPLATE: "titleTemplate",
  },
  Ch = Object.keys(Yo).reduce(function (i, l) {
    return (i[Yo[l]] = l), i;
  }, {}),
  Eh = [pe.NOSCRIPT, pe.SCRIPT, pe.STYLE],
  ft = "data-react-helmet",
  Sh =
    typeof Symbol == "function" && typeof Symbol.iterator == "symbol"
      ? function (i) {
          return typeof i;
        }
      : function (i) {
          return i &&
            typeof Symbol == "function" &&
            i.constructor === Symbol &&
            i !== Symbol.prototype
            ? "symbol"
            : typeof i;
        },
  Th = function (i, l) {
    if (!(i instanceof l))
      throw new TypeError("Cannot call a class as a function");
  },
  jh = (function () {
    function i(l, c) {
      for (var a = 0; a < c.length; a++) {
        var f = c[a];
        (f.enumerable = f.enumerable || !1),
          (f.configurable = !0),
          "value" in f && (f.writable = !0),
          Object.defineProperty(l, f.key, f);
      }
    }
    return function (l, c, a) {
      return c && i(l.prototype, c), a && i(l, a), l;
    };
  })(),
  Xe =
    Object.assign ||
    function (i) {
      for (var l = 1; l < arguments.length; l++) {
        var c = arguments[l];
        for (var a in c)
          Object.prototype.hasOwnProperty.call(c, a) && (i[a] = c[a]);
      }
      return i;
    },
  kh = function (i, l) {
    if (typeof l != "function" && l !== null)
      throw new TypeError(
        "Super expression must either be null or a function, not " + typeof l,
      );
    (i.prototype = Object.create(l && l.prototype, {
      constructor: { value: i, enumerable: !1, writable: !0, configurable: !0 },
    })),
      l &&
        (Object.setPrototypeOf
          ? Object.setPrototypeOf(i, l)
          : (i.__proto__ = l));
  },
  Rc = function (i, l) {
    var c = {};
    for (var a in i)
      l.indexOf(a) >= 0 ||
        (Object.prototype.hasOwnProperty.call(i, a) && (c[a] = i[a]));
    return c;
  },
  Ah = function (i, l) {
    if (!i)
      throw new ReferenceError(
        "this hasn't been initialised - super() hasn't been called",
      );
    return l && (typeof l == "object" || typeof l == "function") ? l : i;
  },
  cs = function (l) {
    var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
    return c === !1
      ? String(l)
      : String(l)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#x27;");
  },
  Ph = function (l) {
    var c = Vn(l, pe.TITLE),
      a = Vn(l, Ur.TITLE_TEMPLATE);
    if (a && c)
      return a.replace(/%s/g, function () {
        return Array.isArray(c) ? c.join("") : c;
      });
    var f = Vn(l, Ur.DEFAULT_TITLE);
    return c || f || void 0;
  },
  Ih = function (l) {
    return Vn(l, Ur.ON_CHANGE_CLIENT_STATE) || function () {};
  },
  os = function (l, c) {
    return c
      .filter(function (a) {
        return typeof a[l] < "u";
      })
      .map(function (a) {
        return a[l];
      })
      .reduce(function (a, f) {
        return Xe({}, a, f);
      }, {});
  },
  _h = function (l, c) {
    return c
      .filter(function (a) {
        return typeof a[pe.BASE] < "u";
      })
      .map(function (a) {
        return a[pe.BASE];
      })
      .reverse()
      .reduce(function (a, f) {
        if (!a.length)
          for (var h = Object.keys(f), g = 0; g < h.length; g++) {
            var y = h[g],
              m = y.toLowerCase();
            if (l.indexOf(m) !== -1 && f[m]) return a.concat(f);
          }
        return a;
      }, []);
  },
  Mr = function (l, c, a) {
    var f = {};
    return a
      .filter(function (h) {
        return Array.isArray(h[l])
          ? !0
          : (typeof h[l] < "u" &&
              Lh(
                "Helmet: " +
                  l +
                  ' should be of type "Array". Instead found type "' +
                  Sh(h[l]) +
                  '"',
              ),
            !1);
      })
      .map(function (h) {
        return h[l];
      })
      .reverse()
      .reduce(function (h, g) {
        var y = {};
        g.filter(function (P) {
          for (var R = void 0, U = Object.keys(P), G = 0; G < U.length; G++) {
            var Y = U[G],
              I = Y.toLowerCase();
            c.indexOf(I) !== -1 &&
              !(R === Pe.REL && P[R].toLowerCase() === "canonical") &&
              !(I === Pe.REL && P[I].toLowerCase() === "stylesheet") &&
              (R = I),
              c.indexOf(Y) !== -1 &&
                (Y === Pe.INNER_HTML ||
                  Y === Pe.CSS_TEXT ||
                  Y === Pe.ITEM_PROP) &&
                (R = Y);
          }
          if (!R || !P[R]) return !1;
          var z = P[R].toLowerCase();
          return (
            f[R] || (f[R] = {}),
            y[R] || (y[R] = {}),
            f[R][z] ? !1 : ((y[R][z] = !0), !0)
          );
        })
          .reverse()
          .forEach(function (P) {
            return h.push(P);
          });
        for (var m = Object.keys(y), x = 0; x < m.length; x++) {
          var C = m[x],
            j = xh({}, f[C], y[C]);
          f[C] = j;
        }
        return h;
      }, [])
      .reverse();
  },
  Vn = function (l, c) {
    for (var a = l.length - 1; a >= 0; a--) {
      var f = l[a];
      if (f.hasOwnProperty(c)) return f[c];
    }
    return null;
  },
  Oh = function (l) {
    return {
      baseTag: _h([Pe.HREF, Pe.TARGET], l),
      bodyAttributes: os(un.BODY, l),
      defer: Vn(l, Ur.DEFER),
      encode: Vn(l, Ur.ENCODE_SPECIAL_CHARACTERS),
      htmlAttributes: os(un.HTML, l),
      linkTags: Mr(pe.LINK, [Pe.REL, Pe.HREF], l),
      metaTags: Mr(
        pe.META,
        [Pe.NAME, Pe.CHARSET, Pe.HTTPEQUIV, Pe.PROPERTY, Pe.ITEM_PROP],
        l,
      ),
      noscriptTags: Mr(pe.NOSCRIPT, [Pe.INNER_HTML], l),
      onChangeClientState: Ih(l),
      scriptTags: Mr(pe.SCRIPT, [Pe.SRC, Pe.INNER_HTML], l),
      styleTags: Mr(pe.STYLE, [Pe.CSS_TEXT], l),
      title: Ph(l),
      titleAttributes: os(un.TITLE, l),
    };
  },
  ds = (function () {
    var i = Date.now();
    return function (l) {
      var c = Date.now();
      c - i > 16
        ? ((i = c), l(c))
        : setTimeout(function () {
            ds(l);
          }, 0);
    };
  })(),
  Lc = function (l) {
    return clearTimeout(l);
  },
  Nh =
    typeof window < "u"
      ? (window.requestAnimationFrame &&
          window.requestAnimationFrame.bind(window)) ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        ds
      : global.requestAnimationFrame || ds,
  Rh =
    typeof window < "u"
      ? window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        Lc
      : global.cancelAnimationFrame || Lc,
  Lh = function (l) {
    return console && typeof console.warn == "function" && console.warn(l);
  },
  Dr = null,
  bh = function (l) {
    Dr && Rh(Dr),
      l.defer
        ? (Dr = Nh(function () {
            bc(l, function () {
              Dr = null;
            });
          }))
        : (bc(l), (Dr = null));
  },
  bc = function (l, c) {
    var a = l.baseTag,
      f = l.bodyAttributes,
      h = l.htmlAttributes,
      g = l.linkTags,
      y = l.metaTags,
      m = l.noscriptTags,
      x = l.onChangeClientState,
      C = l.scriptTags,
      j = l.styleTags,
      P = l.title,
      R = l.titleAttributes;
    fs(pe.BODY, f), fs(pe.HTML, h), Mh(P, R);
    var U = {
        baseTag: Un(pe.BASE, a),
        linkTags: Un(pe.LINK, g),
        metaTags: Un(pe.META, y),
        noscriptTags: Un(pe.NOSCRIPT, m),
        scriptTags: Un(pe.SCRIPT, C),
        styleTags: Un(pe.STYLE, j),
      },
      G = {},
      Y = {};
    Object.keys(U).forEach(function (I) {
      var z = U[I],
        F = z.newTags,
        te = z.oldTags;
      F.length && (G[I] = F), te.length && (Y[I] = U[I].oldTags);
    }),
      c && c(),
      x(l, G, Y);
  },
  sd = function (l) {
    return Array.isArray(l) ? l.join("") : l;
  },
  Mh = function (l, c) {
    typeof l < "u" && document.title !== l && (document.title = sd(l)),
      fs(pe.TITLE, c);
  },
  fs = function (l, c) {
    var a = document.getElementsByTagName(l)[0];
    if (a) {
      for (
        var f = a.getAttribute(ft),
          h = f ? f.split(",") : [],
          g = [].concat(h),
          y = Object.keys(c),
          m = 0;
        m < y.length;
        m++
      ) {
        var x = y[m],
          C = c[x] || "";
        a.getAttribute(x) !== C && a.setAttribute(x, C),
          h.indexOf(x) === -1 && h.push(x);
        var j = g.indexOf(x);
        j !== -1 && g.splice(j, 1);
      }
      for (var P = g.length - 1; P >= 0; P--) a.removeAttribute(g[P]);
      h.length === g.length
        ? a.removeAttribute(ft)
        : a.getAttribute(ft) !== y.join(",") && a.setAttribute(ft, y.join(","));
    }
  },
  Un = function (l, c) {
    var a = document.head || document.querySelector(pe.HEAD),
      f = a.querySelectorAll(l + "[" + ft + "]"),
      h = Array.prototype.slice.call(f),
      g = [],
      y = void 0;
    return (
      c &&
        c.length &&
        c.forEach(function (m) {
          var x = document.createElement(l);
          for (var C in m)
            if (m.hasOwnProperty(C))
              if (C === Pe.INNER_HTML) x.innerHTML = m.innerHTML;
              else if (C === Pe.CSS_TEXT)
                x.styleSheet
                  ? (x.styleSheet.cssText = m.cssText)
                  : x.appendChild(document.createTextNode(m.cssText));
              else {
                var j = typeof m[C] > "u" ? "" : m[C];
                x.setAttribute(C, j);
              }
          x.setAttribute(ft, "true"),
            h.some(function (P, R) {
              return (y = R), x.isEqualNode(P);
            })
              ? h.splice(y, 1)
              : g.push(x);
        }),
      h.forEach(function (m) {
        return m.parentNode.removeChild(m);
      }),
      g.forEach(function (m) {
        return a.appendChild(m);
      }),
      { oldTags: h, newTags: g }
    );
  },
  ad = function (l) {
    return Object.keys(l).reduce(function (c, a) {
      var f = typeof l[a] < "u" ? a + '="' + l[a] + '"' : "" + a;
      return c ? c + " " + f : f;
    }, "");
  },
  Dh = function (l, c, a, f) {
    var h = ad(a),
      g = sd(c);
    return h
      ? "<" + l + " " + ft + '="true" ' + h + ">" + cs(g, f) + "</" + l + ">"
      : "<" + l + " " + ft + '="true">' + cs(g, f) + "</" + l + ">";
  },
  zh = function (l, c, a) {
    return c.reduce(function (f, h) {
      var g = Object.keys(h)
          .filter(function (x) {
            return !(x === Pe.INNER_HTML || x === Pe.CSS_TEXT);
          })
          .reduce(function (x, C) {
            var j = typeof h[C] > "u" ? C : C + '="' + cs(h[C], a) + '"';
            return x ? x + " " + j : j;
          }, ""),
        y = h.innerHTML || h.cssText || "",
        m = Eh.indexOf(l) === -1;
      return (
        f +
        "<" +
        l +
        " " +
        ft +
        '="true" ' +
        g +
        (m ? "/>" : ">" + y + "</" + l + ">")
      );
    }, "");
  },
  ud = function (l) {
    var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return Object.keys(l).reduce(function (a, f) {
      return (a[Yo[f] || f] = l[f]), a;
    }, c);
  },
  Fh = function (l) {
    var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    return Object.keys(l).reduce(function (a, f) {
      return (a[Ch[f] || f] = l[f]), a;
    }, c);
  },
  Uh = function (l, c, a) {
    var f,
      h = ((f = { key: c }), (f[ft] = !0), f),
      g = ud(a, h);
    return [ve.createElement(pe.TITLE, g, c)];
  },
  Bh = function (l, c) {
    return c.map(function (a, f) {
      var h,
        g = ((h = { key: f }), (h[ft] = !0), h);
      return (
        Object.keys(a).forEach(function (y) {
          var m = Yo[y] || y;
          if (m === Pe.INNER_HTML || m === Pe.CSS_TEXT) {
            var x = a.innerHTML || a.cssText;
            g.dangerouslySetInnerHTML = { __html: x };
          } else g[m] = a[y];
        }),
        ve.createElement(l, g)
      );
    });
  },
  kt = function (l, c, a) {
    switch (l) {
      case pe.TITLE:
        return {
          toComponent: function () {
            return Uh(l, c.title, c.titleAttributes);
          },
          toString: function () {
            return Dh(l, c.title, c.titleAttributes, a);
          },
        };
      case un.BODY:
      case un.HTML:
        return {
          toComponent: function () {
            return ud(c);
          },
          toString: function () {
            return ad(c);
          },
        };
      default:
        return {
          toComponent: function () {
            return Bh(l, c);
          },
          toString: function () {
            return zh(l, c, a);
          },
        };
    }
  },
  cd = function (l) {
    var c = l.baseTag,
      a = l.bodyAttributes,
      f = l.encode,
      h = l.htmlAttributes,
      g = l.linkTags,
      y = l.metaTags,
      m = l.noscriptTags,
      x = l.scriptTags,
      C = l.styleTags,
      j = l.title,
      P = j === void 0 ? "" : j,
      R = l.titleAttributes;
    return {
      base: kt(pe.BASE, c, f),
      bodyAttributes: kt(un.BODY, a, f),
      htmlAttributes: kt(un.HTML, h, f),
      link: kt(pe.LINK, g, f),
      meta: kt(pe.META, y, f),
      noscript: kt(pe.NOSCRIPT, m, f),
      script: kt(pe.SCRIPT, x, f),
      style: kt(pe.STYLE, C, f),
      title: kt(pe.TITLE, { title: P, titleAttributes: R }, f),
    };
  },
  Wh = function (l) {
    var c, a;
    return (
      (a = c =
        (function (f) {
          kh(h, f);
          function h() {
            return Th(this, h), Ah(this, f.apply(this, arguments));
          }
          return (
            (h.prototype.shouldComponentUpdate = function (y) {
              return !gh(this.props, y);
            }),
            (h.prototype.mapNestedChildrenToProps = function (y, m) {
              if (!m) return null;
              switch (y.type) {
                case pe.SCRIPT:
                case pe.NOSCRIPT:
                  return { innerHTML: m };
                case pe.STYLE:
                  return { cssText: m };
              }
              throw new Error(
                "<" +
                  y.type +
                  " /> elements are self-closing and can not contain children. Refer to our API for more information.",
              );
            }),
            (h.prototype.flattenArrayTypeChildren = function (y) {
              var m,
                x = y.child,
                C = y.arrayTypeChildren,
                j = y.newChildProps,
                P = y.nestedChildren;
              return Xe(
                {},
                C,
                ((m = {}),
                (m[x.type] = [].concat(C[x.type] || [], [
                  Xe({}, j, this.mapNestedChildrenToProps(x, P)),
                ])),
                m),
              );
            }),
            (h.prototype.mapObjectTypeChildren = function (y) {
              var m,
                x,
                C = y.child,
                j = y.newProps,
                P = y.newChildProps,
                R = y.nestedChildren;
              switch (C.type) {
                case pe.TITLE:
                  return Xe(
                    {},
                    j,
                    ((m = {}),
                    (m[C.type] = R),
                    (m.titleAttributes = Xe({}, P)),
                    m),
                  );
                case pe.BODY:
                  return Xe({}, j, { bodyAttributes: Xe({}, P) });
                case pe.HTML:
                  return Xe({}, j, { htmlAttributes: Xe({}, P) });
              }
              return Xe({}, j, ((x = {}), (x[C.type] = Xe({}, P)), x));
            }),
            (h.prototype.mapArrayTypeChildrenToProps = function (y, m) {
              var x = Xe({}, m);
              return (
                Object.keys(y).forEach(function (C) {
                  var j;
                  x = Xe({}, x, ((j = {}), (j[C] = y[C]), j));
                }),
                x
              );
            }),
            (h.prototype.warnOnInvalidChildren = function (y, m) {
              return !0;
            }),
            (h.prototype.mapChildrenToProps = function (y, m) {
              var x = this,
                C = {};
              return (
                ve.Children.forEach(y, function (j) {
                  if (!(!j || !j.props)) {
                    var P = j.props,
                      R = P.children,
                      U = Rc(P, ["children"]),
                      G = Fh(U);
                    switch ((x.warnOnInvalidChildren(j, R), j.type)) {
                      case pe.LINK:
                      case pe.META:
                      case pe.NOSCRIPT:
                      case pe.SCRIPT:
                      case pe.STYLE:
                        C = x.flattenArrayTypeChildren({
                          child: j,
                          arrayTypeChildren: C,
                          newChildProps: G,
                          nestedChildren: R,
                        });
                        break;
                      default:
                        m = x.mapObjectTypeChildren({
                          child: j,
                          newProps: m,
                          newChildProps: G,
                          nestedChildren: R,
                        });
                        break;
                    }
                  }
                }),
                (m = this.mapArrayTypeChildrenToProps(C, m)),
                m
              );
            }),
            (h.prototype.render = function () {
              var y = this.props,
                m = y.children,
                x = Rc(y, ["children"]),
                C = Xe({}, x);
              return (
                m && (C = this.mapChildrenToProps(m, C)), ve.createElement(l, C)
              );
            }),
            jh(h, null, [
              {
                key: "canUseDOM",
                set: function (y) {
                  l.canUseDOM = y;
                },
              },
            ]),
            h
          );
        })(ve.Component)),
      (c.propTypes = {
        base: Te.object,
        bodyAttributes: Te.object,
        children: Te.oneOfType([Te.arrayOf(Te.node), Te.node]),
        defaultTitle: Te.string,
        defer: Te.bool,
        encodeSpecialCharacters: Te.bool,
        htmlAttributes: Te.object,
        link: Te.arrayOf(Te.object),
        meta: Te.arrayOf(Te.object),
        noscript: Te.arrayOf(Te.object),
        onChangeClientState: Te.func,
        script: Te.arrayOf(Te.object),
        style: Te.arrayOf(Te.object),
        title: Te.string,
        titleAttributes: Te.object,
        titleTemplate: Te.string,
      }),
      (c.defaultProps = { defer: !0, encodeSpecialCharacters: !0 }),
      (c.peek = l.peek),
      (c.rewind = function () {
        var f = l.rewind();
        return (
          f ||
            (f = cd({
              baseTag: [],
              bodyAttributes: {},
              htmlAttributes: {},
              linkTags: [],
              metaTags: [],
              noscriptTags: [],
              scriptTags: [],
              styleTags: [],
              title: "",
              titleAttributes: {},
            })),
          f
        );
      }),
      a
    );
  },
  Vh = function () {
    return null;
  },
  Hh = mh(Oh, bh, cd)(Vh),
  Zo = Wh(Hh);
Zo.renderStatic = Zo.rewind;
function Ve() {
  const [i, l] = ve.useState("");
  return (
    ve.useEffect(() => {
      const c = () => {
        var f, h;
        return (
          ((f = document.querySelector('meta[property="nonce"]')) == null
            ? void 0
            : f.getAttribute("nonce")) ||
          ((h = document.querySelector("script[nonce]")) == null
            ? void 0
            : h.getAttribute("nonce")) ||
          ""
        );
      };
      l(c());
      const a = new MutationObserver(() => {
        l(c());
      });
      return (
        a.observe(document.head, {
          childList: !0,
          subtree: !0,
          attributes: !0,
        }),
        () => a.disconnect()
      );
    }, []),
    u.jsx(Zo, {
      children: u.jsx("meta", {
        httpEquiv: "Content-Security-Policy",
        content: `default-src 'self' blob:;
              script-src 'self'${i ? ` 'nonce-${i}'` : ""} cdn.jsdelivr.net assets.adobedtm.com cdn.tt.omtrdc.net;
              style-src 'self' 'unsafe-inline';
              img-src * data:;
              connect-src 'self' *.alloyio.com *.adobedc.net *.demdex.net *.sc.omtrdc.net`,
      }),
    })
  );
}
const $h = (i, l) => {
    l.forEach(function (c) {
      i[c] ||
        ((i.__alloyNS = i.__alloyNS || []).push(c),
        (i[c] = function () {
          var a = arguments;
          return new Promise(function (f, h) {
            i[c].q.push([f, h, a]);
          });
        }),
        (i[c].q = []));
    });
  },
  Qt = (i) => new URLSearchParams(window.location.search).get(i),
  is = (i) =>
    new Promise((l) => {
      var f, h;
      const c = document.createElement("script");
      (c.type = "text/javascript"), (c.src = i), (c.async = !0);
      const a =
        ((f = document.querySelector('meta[property="nonce"]')) == null
          ? void 0
          : f.getAttribute("nonce")) ||
        ((h = document.querySelector("script[nonce]")) == null
          ? void 0
          : h.getAttribute("nonce")) ||
        "";
      c.setAttribute("nonce", a),
        c.addEventListener("load", l),
        document.head.appendChild(c);
    }),
  Yh = ({
    instanceNames: i,
    options: { keepExistingMonitors: l = !1, onAlloySetupCompleted: c },
  }) => {
    l || delete window.__alloyMonitors,
      delete window.__alloyNS,
      i.forEach((a) => {
        delete window[a];
      }),
      $h(window, i),
      Qt("includeVisitor") === "true"
        ? is(
            "https://github.com/Adobe-Marketing-Cloud/id-service/releases/download/4.5.1/visitorapi.min.js",
          ).then(() => {
            Visitor.getInstance("53A16ACB5CC1D3760A495C99@AdobeOrg", {
              doesOptInApply: Qt("legacyOptIn") === "true",
            }),
              is("/alloy.js");
          })
        : is("/alloy.js"),
      c && c();
  },
  Zh = {
    datastreamId:
      Qt("datastreamId") ||
      Qt("edgeConfigId") ||
      "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
    orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
    debugEnabled: !0,
    edgeDomain:
      window.location.host.indexOf("alloyio.com") !== -1
        ? "firstparty.alloyio.com"
        : void 0,
    edgeBasePath: Qt("edgeBasePath") || "ee",
    onBeforeEventSend: (i) => {
      const l = i.xdm,
        c = i.data,
        a = Qt("title");
      a && (l.web.webPageDetails.name = a);
      const f = Qt("campaign");
      f && (c.campaign = f);
      const h = l._unifiedjsqeonly || {};
      return (
        (h.rawTimestamp = new Date().getTime()), (l._unifiedjsqeonly = h), !0
      );
    },
    thirdPartyCookiesEnabled: !0,
    targetMigrationEnabled: !0,
    clickCollectionEnabled: !0,
    defaultConsent: Qt("defaultConsent") || "in",
    personalizationStorageEnabled: !0,
  },
  Qh = (i, l = {}) => {
    window[i]("configure", { ...Zh, ...l });
  },
  Le = ({
    instanceNames: i = ["alloy"],
    configurations: l = {},
    options: c = {},
  } = {}) => {
    me.useEffect(() => {
      Yh({ instanceNames: i, options: c }),
        Object.entries(i).forEach(([, a]) => {
          Qh(a, l[a]);
        });
    }, []);
  },
  Jh = (i) => Array.isArray(i) && i.length > 0,
  ot = ({
    instanceName: i = "alloy",
    renderDecisions: l = !1,
    viewName: c,
    data: a = {},
    xdm: f = {},
    decisionScopes: h,
    setPropositions: g,
  } = {}) => {
    me.useEffect(() => {
      (f.eventType = "page-view"),
        c && (f.web = { webPageDetails: { viewName: c } }),
        window[i]("sendEvent", {
          renderDecisions: l,
          decisionScopes: h,
          xdm: f,
          data: a,
        }).then((y) => {
          const { propositions: m } = y;
          g && Jh(m) && g(m);
        });
    }, [JSON.stringify(a), h, i, g, c, JSON.stringify(f)]);
  },
  Gh = () => {
    window.alloy("getIdentity", { namespaces: ["ECID"] }).then((i) => {
      i.identity
        ? console.log(
            "Sandbox: Get Identity command has completed.",
            i.identity.ECID,
          )
        : console.log(
            "Sandbox: Get Identity command has completed but no identity was provided in the result (possibly due to lack of consent).",
          );
    });
  },
  qh = () => {
    window.alloy("getLibraryInfo");
  };
function Xh() {
  return (
    me.useEffect(() => {
      (window.__alloyMonitors = []),
        window.__alloyMonitors.push({
          onContentRendering(i) {
            console.log("Alloy Content Rendering"),
              console.log("data", i.status, i);
          },
          onContentHiding(i) {
            console.log("Alloy Content Hiding"), console.log("data", i.status);
          },
          onInstanceCreated(i) {
            console.log("Alloy Instance Created"),
              console.log(i.instanceName),
              console.log(i.instance);
          },
          onInstanceConfigured(i) {
            console.log("Alloy Instance Configured"),
              console.log(JSON.stringify(i.config, null, 2));
            const { getLinkDetails: l } = i,
              c = document.links;
            setTimeout(async () => {
              console.log(`Will now print link details for ${c.length} links`);
              for (let a = 0; a < c.length; a += 1) {
                const f = l(c[a]);
                console.log("link details", f);
              }
            }, 1e3);
          },
        });
    }, []),
    Le({ options: { keepExistingMonitors: !0 } }),
    ot(),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Home" }),
        u.jsxs("section", {
          children: [
            u.jsx("h2", { children: "Get Identity" }),
            u.jsx("div", {
              children: u.jsx("button", { onClick: Gh, children: "Get ECID" }),
            }),
          ],
        }),
        u.jsxs("section", {
          children: [
            u.jsx("h2", { children: "Library Info" }),
            u.jsx("div", {
              children: u.jsx("button", {
                onClick: qh,
                children: "Get Library Info",
              }),
            }),
          ],
        }),
      ],
    })
  );
}
const Xo = (i) => new URLSearchParams(window.location.search).get(i),
  Kh = (i, l, c) => {
    const a = new URLSearchParams(window.location.search);
    return (
      l !== c ? a.set(i, l) : a.delete(i), `${window.location.pathname}?${a}`
    );
  },
  Mc = Xo("defaultConsent") || "in",
  Dc = Xo("idMigrationEnabled") !== "false",
  zc = Xo("includeVisitor") === "true",
  Fc = Xo("legacyOptIn") === "true",
  Wo = ({ param: i, currentValue: l, defaultValue: c, options: a }) =>
    a.map(({ value: f, label: h }, g) =>
      f === l
        ? u.jsx("span", { className: "disabled", children: h }, g)
        : u.jsx("a", { href: Kh(i, f, c), children: h }, g),
    );
function em() {
  return u.jsx("table", {
    className: "configuration",
    children: u.jsxs("tbody", {
      children: [
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "defaultConsent" }),
            u.jsx("td", { children: Mc }),
            u.jsx("td", {
              children: u.jsx(Wo, {
                param: "defaultConsent",
                currentValue: Mc,
                defaultValue: "in",
                options: [
                  { value: "pending", label: "Set to pending" },
                  { value: "in", label: "Set to in" },
                  { value: "out", label: "Set to out" },
                ],
              }),
            }),
          ],
        }),
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "idMigrationEnabled" }),
            u.jsx("td", { children: Dc.toString() }),
            u.jsx("td", {
              children: u.jsx(Wo, {
                param: "idMigrationEnabled",
                currentValue: Dc,
                defaultValue: "true",
                options: [
                  { value: !0, label: "Enable" },
                  { value: !1, label: "Disable" },
                ],
              }),
            }),
          ],
        }),
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "Include Visitor.js" }),
            u.jsx("td", { children: zc.toString() }),
            u.jsx("td", {
              children: u.jsx(Wo, {
                param: "includeVisitor",
                currentValue: zc,
                defaultValue: "false",
                options: [
                  { value: !0, label: "Include" },
                  { value: !1, label: "Remove" },
                ],
              }),
            }),
          ],
        }),
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "Enable Opt-in in Visitor" }),
            u.jsx("td", { children: Fc.toString() }),
            u.jsx("td", {
              children: u.jsx(Wo, {
                param: "legacyOptIn",
                currentValue: Fc,
                defaultValue: "false",
                options: [
                  { value: !0, label: "Enable" },
                  { value: !1, label: "Disable" },
                ],
              }),
            }),
          ],
        }),
      ],
    }),
  });
}
const Hn = "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_",
  dd = "AMCV_5BFE274A5F6980A50A495C08%40AdobeOrg";
let Yn;
const fd = () => {
    (Yn = {}),
      document.cookie.split(";").forEach(function (i) {
        const l = i.trim(),
          c = l.indexOf("="),
          a = l.slice(0, c),
          f = l.slice(c + 1);
        Yn[a] = f;
      });
  },
  pd = () => Yn[`${Hn}consent`],
  hd = () => Yn[`${Hn}consent_check`] !== void 0,
  md = () => Yn[`${Hn}identity`] !== void 0,
  vd = () => Yn[dd] !== void 0;
fd();
const tm = pd(),
  nm = hd(),
  rm = md(),
  om = vd(),
  ps = {};
window.__alloyMonitors = window.__alloyMonitors || [];
window.__alloyMonitors.push(ps);
function im() {
  const [i, l] = me.useState(tm),
    [c, a] = me.useState(nm),
    [f, h] = me.useState(rm),
    [g, y] = me.useState(om),
    m = () => {
      fd(), l(pd()), a(hd()), h(md()), y(vd());
    };
  me.useEffect(() => {
    (ps.onCommandResolved = m), (ps.onCommandRejected = m);
  });
  const x = (C) => () => {
    (document.cookie = `${C}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`), m();
  };
  return u.jsx("table", {
    children: u.jsxs("tbody", {
      children: [
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "Consent Cookie" }),
            u.jsx("td", { children: i }),
            u.jsx("td", {
              children: u.jsx("button", {
                onClick: x(`${Hn}consent`),
                disabled: i === void 0,
                children: "Delete",
              }),
            }),
          ],
        }),
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "Has Consent Check Cookie" }),
            u.jsx("td", { children: c ? "true" : "false" }),
            u.jsx("td", {
              children: u.jsx("button", {
                onClick: x(`${Hn}consent_check`),
                disabled: !c,
                children: "Delete",
              }),
            }),
          ],
        }),
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "Has Identity Cookie" }),
            u.jsx("td", { children: f ? "true" : "false" }),
            u.jsx("td", {
              children: u.jsx("button", {
                onClick: x(`${Hn}identity`),
                disabled: !f,
                children: "Delete",
              }),
            }),
          ],
        }),
        u.jsxs("tr", {
          children: [
            u.jsx("td", { children: "Has Legacy Identity Cookie" }),
            u.jsx("td", { children: g ? "true" : "false" }),
            u.jsx("td", {
              children: u.jsx("button", {
                onClick: x(dd),
                disabled: !g,
                children: "Delete",
              }),
            }),
          ],
        }),
      ],
    }),
  });
}
const Uc =
    "CO1Z4yuO1Z4yuAcABBENArCsAP_AAH_AACiQGCNX_T5eb2vj-3Zdt_tkaYwf55y3o-wzhhaIse8NwIeH7BoGP2MwvBX4JiQCGBAkkiKBAQdtHGhcCQABgIhRiTKMYk2MjzNKJLJAilsbe0NYCD9mnsHT3ZCY70--u__7P3fAwQgkwVLwCRIWwgJJs0ohTABCOICpBwCUEIQEClhoACAnYFAR6gAAAIDAACAAAAEEEBAIABAAAkIgAAAEBAKACIBAACAEaAhAARIEAsAJEgCAAVA0JACKIIQBCDgwCjlACAoAAAAA.YAAAAAAAAAAA",
  Bc =
    "CO1Z5evO1Z5evAcABBENArCgAAAAAH_AACiQGCNX_T5eb2vj-3Zdt_tkaYwf55y3o-wzhhaIse8NwIeH7BoGP2MwvBX4JiQCGBAkkiKBAQdtHGhcCQABgIhRiTKMYk2MjzNKBLJAilsbe0NYCD9mnsHT3ZCY70--u__7P3fAwQgkwVLwCRIWwgJJs0ohTABCOICpBwCUEIQEClhoACAnYFAR6gAAAIDAACAAAAEEEBAIABAAAkIgAAAEBAKACIBAACAEaAhAARIEAsAJEgCAAVA0JACKIIQBCDgwCjlACAoAAAAA.YAAAAAAAAAAA",
  lm =
    "CO2ISm8O2IbZcAVAMBFRACBsAIBAAAAgEIYgGPtjup3rYdY178JUkiCIFabBlBymqcio5Ao1cEACRNnQIUAIyhKBCQmaUqJBKhQRWBDAQtQwBCB06EBmgIQNUmkj1MQGQgCRKSF7BmQBEwQMCagoBDeRAAo-kIhkLCAAqO0E_AB4F5wAgEagLzAA",
  sm =
    "CO2IS8PO2IbuvAVAMBFRACBsAIBAAAAgEIYgGQBiNh14tYnCZ-5fXnRqprc2dYaErJs0dFpVJBA0ALi95QggwAQXEIa4JmghQMIEJASUkIIMEjHIgsJSyMEIAMIgjpJqrggEIFVAIIgPDKAULEQQkBQcCCC2mhZURCaVE0AVLMF0CNYAICNQAA==",
  Wc = (i) => ({
    consent: [{ standard: "Adobe", version: "1.0", value: { general: i } }],
  }),
  Bn = ({ collect: i, personalize: l }) => {
    const c = {
      consent: [
        { standard: "Adobe", version: "2.0", value: { collect: { val: i } } },
      ],
    };
    return l && (c.consent[0].value.personalize = { content: { val: l } }), c;
  },
  Wn = (i) => ({
    consent: [{ standard: "IAB TCF", version: "2.0", value: i }],
  }),
  Vc = (...i) =>
    i.reduce((l, { consent: c }) => ((l.consent = l.consent.concat(c)), l), {
      consent: [],
    }),
  qe =
    (i, l = {}) =>
    () => {
      window.alloy(i, l);
    };
function am() {
  return (
    Le(),
    ot(),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Consent" }),
        u.jsx("h2", { children: "Opt-In" }),
        u.jsx("p", { children: "This page tests user consent:" }),
        u.jsxs("dl", {
          children: [
            u.jsx("dt", { children: "Current Configuration:" }),
            u.jsx("dd", { children: u.jsx(em, {}) }),
            u.jsx("dt", { children: "Cookies:" }),
            u.jsx("dd", { children: u.jsx(im, {}) }),
            u.jsx("dt", { children: "Adobe 1.0" }),
            u.jsxs("dd", {
              children: [
                u.jsx("button", {
                  onClick: qe("setConsent", Wc("in")),
                  children: "In",
                }),
                u.jsx("button", {
                  onClick: qe("setConsent", Wc("out")),
                  children: "Out",
                }),
              ],
            }),
            u.jsx("dt", { children: "Adobe 2.0" }),
            u.jsxs("dd", {
              children: [
                u.jsx("button", {
                  onClick: qe("setConsent", Bn({ collect: "y" })),
                  children: 'Collect="y"',
                }),
                u.jsx("button", {
                  onClick: qe("setConsent", Bn({ collect: "n" })),
                  children: 'Collect="n"',
                }),
                u.jsx("button", {
                  onClick: qe(
                    "setConsent",
                    Bn({ collect: "y", personalize: "y" }),
                  ),
                  children: 'Collect="y" Personalize="y"',
                }),
                u.jsx("button", {
                  onClick: qe(
                    "setConsent",
                    Bn({ collect: "y", personalize: "n" }),
                  ),
                  children: 'Collect="y" Personalize="n"',
                }),
              ],
            }),
            u.jsx("dt", { children: "IAB TCF 2.0" }),
            u.jsxs("dd", {
              children: [
                u.jsx("button", {
                  onClick: qe("setConsent", Wn(Uc)),
                  children: "In",
                }),
                u.jsx("button", {
                  onClick: qe("setConsent", Wn(Bc)),
                  children: "Out",
                }),
                u.jsx("button", {
                  onClick: qe("setConsent", Wn(lm)),
                  children: "Google Vendor In",
                }),
                u.jsx("button", {
                  onClick: qe("setConsent", Wn(sm)),
                  children: "Google Vendor Out",
                }),
              ],
            }),
            u.jsx("dt", { children: "Adobe 2.0 and IAB TCF 2.0" }),
            u.jsxs("dd", {
              children: [
                u.jsx("button", {
                  onClick: qe("setConsent", Vc(Bn({ collect: "y" }), Wn(Uc))),
                  children: "In",
                }),
                u.jsx("button", {
                  onClick: qe("setConsent", Vc(Bn({ collect: "n" }), Wn(Bc))),
                  children: "Out",
                }),
              ],
            }),
            u.jsx("dt", { children: "Legacy Opt-in Object" }),
            u.jsxs("dd", {
              children: [
                u.jsx("button", {
                  onClick: () => window.adobe.optIn.approveAll(),
                  children: "Approve All",
                }),
                u.jsx("button", {
                  onClick: () => window.adobe.optIn.denyAll(),
                  children: "Deny All",
                }),
              ],
            }),
            u.jsx("dt", { children: "Alloy Commands" }),
            u.jsxs("dd", {
              children: [
                u.jsx("button", {
                  onClick: qe("sendEvent"),
                  children: "Send Event",
                }),
                u.jsx("button", {
                  onClick: qe("getIdentity"),
                  children: "Get Identity",
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
}
function um() {
  return (
    Le(),
    ot({ renderDecisions: !0 }),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Personalization" }),
        u.jsxs("p", {
          children: [
            "This page tests rendering of activities using a ",
            u.jsx("i", { children: "__view__" }),
            " scope. If you navigated here from another sandbox view, you will probably need to refresh your browser because this is how to properly simulate a non-SPA workflow.",
          ],
        }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "personalization-container",
          children:
            "This is the personalization placeholder. Personalized content has not been loaded.",
        }),
      ],
    })
  );
}
const ws = ({ viewName: i }) => {
    const [l, c] = me.useState(void 0);
    ot({ renderDecisions: !0, viewName: i, setPropositions: c }),
      me.useEffect(() => {
        l && window.alloy("applyPropositions", { propositions: l });
      }, [l]);
  },
  cm = () => (
    ws({ viewName: "products" }),
    u.jsxs("div", {
      children: [
        u.jsx("h2", { children: "Products" }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "personalization-products-container",
          className: "personalization-container",
          children:
            "This is the personalization placeholder for the products view. Personalized content has not been loaded.",
        }),
      ],
    })
  ),
  dm = () => (
    ws({ viewName: "cart" }),
    u.jsxs("div", {
      children: [
        u.jsx("h2", { children: "Cart" }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "personalization-cart-container",
          className: "personalization-container",
          children:
            "This is the personalization placeholder for the cart view. Personalized content has not been loaded.",
        }),
      ],
    })
  ),
  fm = () => (
    ws({ viewName: "promotion" }),
    u.jsxs("div", {
      children: [
        u.jsx("h2", { children: "Cart" }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "personalization-cart-container",
          className: "personalization-container",
          children:
            "This is the personalization placeholder for the promotion view. We use this view to test the use case when nothing was stored in cache.",
        }),
      ],
    })
  );
function pm() {
  const [i, l] = me.useState(!1);
  Le({
    options: {
      onAlloySetupCompleted: () => {
        l(!0);
      },
    },
  }),
    ot();
  const c = id();
  return (
    i &&
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Personalization - SPA" }),
        u.jsxs("p", {
          children: [
            "Below are links to two different single-page app views. Each view contains personalized content set up in Target using a view scope of",
            " ",
            u.jsx("i", { children: "product" }),
            " and ",
            u.jsx("i", { children: "cart" }),
            ", respectively. Each view's personalized content contains a button whose clicks are tracked as conversions.",
          ],
        }),
        u.jsxs("ul", {
          children: [
            u.jsx("li", {
              children: u.jsx(Re, {
                to: `${c.url}/products`,
                children: "Products",
              }),
            }),
            u.jsx("li", {
              children: u.jsx(Re, { to: `${c.url}/cart`, children: "Cart" }),
            }),
            u.jsx("li", {
              children: u.jsx(Re, {
                to: `${c.url}/promotion`,
                children: "Promotion",
              }),
            }),
          ],
        }),
        u.jsxs(rd, {
          children: [
            u.jsx(Ae, { path: `${c.path}/products`, children: u.jsx(cm, {}) }),
            u.jsx(Ae, { path: `${c.path}/cart`, children: u.jsx(dm, {}) }),
            u.jsx(Ae, { path: `${c.path}/promotion`, children: u.jsx(fm, {}) }),
          ],
        }),
      ],
    })
  );
}
function hm() {
  return (
    Le({
      instanceNames: ["cjmProd"],
      configurations: {
        cjmProd: {
          datastreamId: "3e808bee-74f7-468f-be1d-99b498f36fa8:prod",
          orgId: "4DA0571C5FDC4BF70A495FC2@AdobeOrg",
          thirdPartyCookiesEnabled: !1,
          clickCollectionEnabled: !1,
        },
      },
    }),
    ot({ renderDecisions: !0, instanceName: "cjmProd" }),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "AJO Personalization" }),
        u.jsx("p", {
          children:
            "This page tests rendering of activities using an AJO surface. If you navigated here from another sandbox view, you will probably need to refresh your browser because this is how to properly simulate a non-SPA workflow.",
        }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          className: "personalization-container-ajo",
          children:
            "This is the AJO personalization placeholder. Personalized content has not been loaded.",
        }),
      ],
    })
  );
}
function mm() {
  return (
    Le(),
    ot({
      renderDecisions: !0,
      data: { __adobe: { target: { "profile.favoriteColor": "Black" } } },
    }),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Personalization Profile" }),
        u.jsx("div", {
          id: "profile-based-offer",
          children:
            "This will be replaced by an offer based on a profile attribute.",
        }),
      ],
    })
  );
}
const vm = () => {
  window.alloy("sendEvent", {
    documentUnloading: !0,
    xdm: { "activitystreams:href": "http://www.adobe.com" },
  });
};
function ym() {
  return (
    Le(),
    ot(),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Links" }),
        u.jsx("p", {
          children:
            "This page shows a few different ways link clicks can be handled in Alloy.",
        }),
        u.jsxs("p", {
          children: [
            "When clicking on this ",
            u.jsx("a", { href: "https://example.com", children: "exit link" }),
            ", Alloy records and transmits an exit-link web interaction event.",
          ],
        }),
        u.jsxs("p", {
          children: [
            "When clicking on this",
            " ",
            u.jsx("a", {
              href: "download.zip",
              target: "_blank",
              children: "download link",
            }),
            ", Alloy records and transmits a download-link web interaction event.",
          ],
        }),
        u.jsxs("p", {
          children: [
            "When clicking on this",
            " ",
            u.jsx("a", {
              onClick: vm,
              href: "http://www.adobe.com",
              children: "custom link",
            }),
            ", Alloy is instructed to collect a custom event through a sendBeacon call (in browsers that support beacons).",
          ],
        }),
        u.jsx("p", {
          children:
            "In addition when clicking on any of the internal links (e.g. navigation menu), Alloy records and transmits a web interaction link (of type other) click event.",
        }),
        u.jsx("br", {}),
        u.jsxs("i", {
          children: [
            u.jsx("b", { children: "TIP:" }),
            "  You can view the source of this page to gain more insight on how the different links work.",
          ],
        }),
      ],
    })
  );
}
function gm() {
  const [i, l] = ve.useState(null);
  return (
    Le(),
    ot(),
    me.useEffect(() => {
      l(window.alloy("createEventMergeId"));
    }, []),
    me.useEffect(() => {
      i &&
        i.then((c) => {
          window
            .alloy("sendEvent", {
              xdm: { key1: "value1", eventMergeId: c.eventMergeId },
            })
            .catch(console.error),
            setTimeout(() => {
              window
                .alloy("sendEvent", {
                  xdm: { key2: "value2", eventMergeId: c.eventMergeId },
                })
                .catch(console.error);
            }, 3e3);
        });
    }, [i]),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Event Merge" }),
        u.jsx("p", {
          children:
            "This is the Event Merge view, part of the Single Page Application.",
        }),
        u.jsx("p", {
          children:
            "On this view, we are sending two events at different times, merged together using an event merge ID.",
        }),
      ],
    })
  );
}
const At =
  (i, l = 1) =>
  () => {
    for (let c = 0; c < l; c += 1) {
      const a = new Uint8Array(i * 1024);
      window.alloy("sendEvent", {
        documentUnloading: !0,
        data: { payload: a },
      });
    }
  };
function wm() {
  return (
    Le(),
    ot(),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Large Payload" }),
        u.jsx("p", {
          children: "This page tests send really large payloads to the edge.",
        }),
        u.jsxs("p", {
          children: [
            "All those requests should attempt to use ",
            u.jsx("code", { children: "sendBeacon" }),
            " and fall back to ",
            u.jsx("code", { children: "fetch" }),
            " if the request can't be queued.",
          ],
        }),
        u.jsx("p", {
          children:
            "The sizes below do not include the size of the Context data:",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(5),
          children: "Send 5kb payload",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(10),
          children: "Send 10kb payload",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(20),
          children: "Send 20kb payload",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(50),
          children: "Send 50kb payload",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(100),
          children: "Send 100kb payload",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(200),
          children: "Send 200kb payload",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(5, 2),
          children: "Send 2 5kb payloads",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(5, 3),
          children: "Send 3 5kb payloads",
        }),
        u.jsx("button", {
          type: "button",
          onClick: At(5, 4),
          children: "Send 4 5kb payloads",
        }),
      ],
    })
  );
}
function xm() {
  return (
    Le({
      instanceNames: ["alloy", "organizationTwo"],
      configurations: {
        organizationTwo: {
          datastreamId: "7984963a-6609-4e84-98d5-4e2ff8c0dd5e:prod",
          orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
          clickCollectionEnabled: !1,
        },
      },
    }),
    ot({ instanceName: "organizationTwo" }),
    u.jsxs("div", {
      children: [
        u.jsx("h1", { children: "Multiple Organizations" }),
        u.jsx("p", {
          children:
            "This view is managed by a partnering company that owns a different Org ID.",
        }),
        u.jsx("p", {
          children:
            "For that reason, we have created a second instance of Alloy, and configured it using the Org and Property IDs of Organization Two.",
        }),
        u.jsxs("p", {
          children: [
            "Alloy instance is called: ",
            u.jsx("i", { children: "organizationTwo" }),
          ],
        }),
        u.jsx("pre", {
          children: u.jsx("code", {
            children: `
                organizationTwo("configure", {
                  datastreamId: 8888888,
                });
            `,
          }),
        }),
        u.jsxs("p", {
          children: [
            "By going to the Network tab in your Developer Tools, you should see requests ending with ",
            u.jsx("i", { children: "?configId=8888888" }),
          ],
        }),
      ],
    })
  );
}
function Cm() {
  return u.jsx(Zo, {
    children: u.jsx("meta", {
      httpEquiv: "Content-Security-Policy",
      content: `default-src 'self' *.demdex.net;
              script-src 'self' 'unsafe-inline' cdn.jsdelivr.net assets.adobedtm.com *.omtrdc.net;
              style-src 'self' 'unsafe-inline';
              img-src * data:;
              connect-src 'self' *.adobedc.net *.demdex.net *.omtrdc.net`,
    }),
  });
}
const Em = () => {
  const i = document.createElement("script");
  (i.src =
    "http://assets.adobedtm.com/launch-ENaa9d45a2136f487791ebc8420ec24dbe.min.js"),
    (i.async = !0),
    document.body.appendChild(i);
};
function Sm() {
  return (
    Le(),
    ot(),
    u.jsxs("div", {
      children: [
        u.jsx(Cm, {}),
        Em(),
        u.jsx("h1", { children: "Dual Tagging" }),
        u.jsx("p", {
          children:
            "This page loads a launch library containing Analytics, ECID, DIL, and Target.",
        }),
        u.jsx("p", {
          children:
            "This is for testing interactions between alloy and the legacy libraries. In particular we are looking for conflicts in personalization, ecid, and id/dest syncs.",
        }),
      ],
    })
  );
}
function Tm() {
  return (
    Le(),
    me.useEffect(() => {
      window
        .alloy("sendEvent", { renderDecisions: !0 })
        .then(({ decisions: i = [] }) => {
          console.log("personalized decisions", i);
        });
    }, []),
    u.jsxs("div", {
      className: "personalization-container",
      children: [
        u.jsx(Ve, {}),
        u.jsxs("div", {
          children: [
            u.jsx("h1", { children: "Redirect Offers" }),
            u.jsx("h2", {
              children: "You shouldn't see it, this is an old page!!!",
            }),
            u.jsx("h2", {
              children: "The new content was moved to /redirectedNewPage ",
            }),
          ],
        }),
      ],
    })
  );
}
function jm() {
  return (
    Le(),
    me.useEffect(() => {
      window.alloy("sendEvent", { renderDecisions: !0 });
    }, []),
    u.jsxs("div", {
      className: "personalization-container",
      children: [
        u.jsx(Ve, {}),
        u.jsxs("div", {
          children: [
            u.jsx("h1", {
              children: "You have qualified for the redirect offer",
            }),
            u.jsx("h2", { children: "Here are the newer offers!" }),
          ],
        }),
      ],
    })
  );
}
const yd = (i) => {
    const { scopeDetails: l = {} } = i,
      { characteristics: c = {} } = l,
      { analyticsTokens: a, analyticsToken: f } = c;
    return a ? a.display : f;
  },
  gd = (i) => (i.size > 1 ? [...i].join(",") : [...i].join()),
  km = (i) => {
    const l = new Set();
    return (
      i.forEach((c) => {
        const { renderAttempted: a = !1 } = c;
        if (a !== !0) return;
        const f = yd(c);
        f && l.add(f);
      }),
      gd(l)
    );
  },
  wd = (i) =>
    window[i]("getIdentity", { namespaces: ["ECID"] }).then(
      (l) => l.identity.ECID,
    ),
  Am = "ujsl.sc.omtrdc.net",
  Pm = "ujslecommerce",
  xd = ({ analyticsPayload: i, visitorID: l }) => {
    const c = `https://${Am}/b/ss/${Pm}/0?g=${window.location}&r=${document.referrer}&mid=${l}&tnta=${i}`;
    return fetch(c)
      .then((a) => {
        console.log("success", a);
      })
      .catch((a) => {
        console.warn("error while triggering Analytics hit", a);
      });
  },
  xs = "organizationTwo",
  Im = "https://ns.adobe.com/personalization/html-content-item",
  _m = "https://ns.adobe.com/personalization/measurement",
  Om = () => window.location.pathname.split("personalizationA4TClientSide/")[1],
  Ho = ({
    eventType: i,
    viewName: l,
    decisionScopes: c,
    renderDecisions: a,
    executedPropositions: f,
  }) => {
    const h = { eventType: i };
    return (
      l && (h.web = { webPageDetails: { viewName: l } }),
      f && (h._experience = { decisioning: { propositions: f } }),
      window[xs]("sendEvent", { renderDecisions: a, decisionScopes: c, xdm: h })
    );
  },
  Cs = ({ renderDecisions: i }) => {
    const l = Om();
    Ho({
      eventType: l ? "view-change" : "page-view",
      viewName: l,
      renderDecisions: i,
    }).then((a) => {
      if (!a.propositions) return;
      const f = km(a.propositions);
      wd(xs).then((h) => {
        xd({ analyticsPayload: f, visitorID: h });
      });
    });
  },
  Nm = () => {
    Ho({ eventType: "form-based-offer", decisionScopes: ["a4t-test"] }).then(
      (i) => {
        if (!i.propositions) return;
        const l = new Set(),
          c = [];
        i.propositions.forEach((a) => {
          a.items.forEach((f) => {
            f.schema === Im &&
              ((document.getElementById(
                "form-based-offer-container",
              ).innerHTML = f.data.content),
              c.push({
                id: a.id,
                scope: a.scope,
                scopeDetails: a.scopeDetails,
              }),
              l.add(yd(a))),
              f.schema === _m &&
                document
                  .getElementById("form-based-click-metric")
                  .addEventListener("click", () => {
                    Ho({
                      eventType: "decisioning.propositionInteract",
                      executedPropositions: [
                        {
                          id: a.id,
                          scope: a.scope,
                          scopeDetails: a.scopeDetails,
                        },
                      ],
                    });
                  });
          });
        }),
          Ho({
            eventType: "decisioning.propositionDisplay",
            executedPropositions: c,
          }),
          wd(xs).then((a) => {
            const f = gd(l);
            xd({ analyticsPayload: f, visitorID: a });
          });
      },
    );
  },
  Rm = () => (
    Cs({ renderDecisions: !0 }),
    u.jsxs("div", {
      children: [
        u.jsx("h2", { children: "Products" }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "personalization-products-container",
          children:
            "This is the personalization placeholder for the products view. Personalized content has not been loaded.",
        }),
      ],
    })
  ),
  Lm = () => (
    Cs({ renderDecisions: !0 }),
    u.jsxs("div", {
      children: [
        u.jsx("h2", { children: "Cart" }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "personalization-cart-container",
          children:
            "This is the personalization placeholder for the cart view. Personalized content has not been loaded.",
        }),
      ],
    })
  );
function bm() {
  const [i, l] = me.useState(!1);
  Le({
    instanceNames: ["organizationTwo"],
    configurations: {
      organizationTwo: {
        datastreamId: "7984963a-6609-4e84-98d5-4e2ff8c0dd5e:prod",
        orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
        clickCollectionEnabled: !1,
      },
    },
    options: {
      onAlloySetupCompleted: () => {
        l(!0);
      },
    },
  }),
    me.useEffect(() => {
      Cs({ renderDecisions: !0 });
    }, []);
  const c = id();
  return (
    i &&
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", {
          children: "Personalization with A4T client side logging",
        }),
        u.jsxs("p", {
          children: [
            "This page tests rendering of activities using a ",
            u.jsx("i", { children: "__view__" }),
            " scope, collecting the analyticsTokens from the rendered propositions and trigger a Analytics hit using Data Insertion API. Important!!! If you navigated here from another sandbox view, you will probably need to refresh your browser because this is how to properly simulate a non-SPA workflow.",
          ],
        }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          className: "personalization-container",
          children:
            "This is the personalization placeholder. Personalized content has not been loaded.",
        }),
        u.jsxs("div", {
          children: [
            u.jsx("p", {
              children:
                "To retrieve a form based composed offer click on this button:",
            }),
            u.jsx("button", {
              onClick: Nm,
              children: "Get a4t-test-scope location offer",
            }),
            u.jsx("div", {
              style: { border: "1px solid red", margin: "10px 0 10px 0" },
              id: "form-based-offer-container",
              children:
                "This is the personalization placeholder for a form based composed offer. Personalized content has not been loaded.",
            }),
            u.jsxs("button", {
              style: { margin: "10px 0 10px 0" },
              id: "form-based-click-metric",
              children: [" ", "Click me!"],
            }),
          ],
        }),
        u.jsx("p", {
          children: " This section is to simulate a SPA use case. ",
        }),
        u.jsxs("ul", {
          children: [
            u.jsx("li", {
              children: u.jsx(Re, {
                to: `${c.url}/products`,
                children: "Products",
              }),
            }),
            u.jsx("li", {
              children: u.jsx(Re, { to: `${c.url}/cart`, children: "Cart" }),
            }),
          ],
        }),
        u.jsxs(rd, {
          children: [
            u.jsx(Ae, { path: `${c.path}/products`, children: u.jsx(Rm, {}) }),
            u.jsx(Ae, { path: `${c.path}/cart`, children: u.jsx(Lm, {}) }),
          ],
        }),
      ],
    })
  );
}
const Mm = ["sandbox-personalization-page2"],
  Dm = {
    "sandbox-personalization-page2": {
      selector: "#form-based-personalization",
      actionType: "setHtml",
    },
  };
function zm() {
  const [i, l] = me.useState(0),
    [c, a] = me.useState(void 0);
  return (
    Le(),
    ot({ renderDecisions: !0, setPropositions: a, decisionScopes: Mm }),
    me.useEffect(() => {
      c && window.alloy("applyPropositions", { propositions: c, metadata: Dm });
    }, [c]),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx("h1", { children: "Personalization" }),
        u.jsxs("h2", { children: ["Number of times rendered: ", i] }),
        u.jsx("button", {
          onClick: () => l((f) => f + 1),
          children: "Re-render component",
        }),
        u.jsx("p", {
          children:
            "This page tests rendering of form-based activities, which need a user-provided selector and actionType in order to be properly rendered for a given scope. If you navigated here from another sandbox view, you will probably need to refresh your browser because this is how to properly simulate a non-SPA workflow.",
        }),
        u.jsx("div", {
          style: { border: "1px solid red" },
          id: "form-based-personalization",
          children:
            "This is a form-based personalization placeholder. Personalized content has not been loaded.",
        }),
      ],
    })
  );
}
const Fm = () => {
    const i = {};
    return (
      document.cookie.split(";").forEach(function (l) {
        const c = l.trim(),
          a = c.indexOf("="),
          f = c.slice(0, a),
          h = c.slice(a + 1);
        i[f] = h;
      }),
      i
    );
  },
  Hc = () => {
    const l = Fm().kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity;
    return l ? atob(l.substring(0, 60)).substring(2, 40) : "None";
  },
  Es = (i) => () => {
    window.alloy("getIdentity", { namespaces: ["ECID"] }).then(function (l) {
      l.identity
        ? (console.log(
            "Sandbox: Get Identity command has completed.",
            l.identity.ECID,
          ),
          i(l.identity.ECID))
        : (console.log(
            "Sandbox: Get Identity command has completed but no identity was provided in the result (possibly due to lack of consent).",
          ),
          i("No Identity"));
    });
  },
  Um = (i) => () => {
    window.alloy("sendEvent", {}).then(Es(i));
  },
  Bm = (i) => () => {
    window
      .alloy("setConsent", {
        consent: [
          {
            standard: "Adobe",
            version: "2.0",
            value: { collect: { val: "y" } },
          },
        ],
      })
      .then(Es(i));
  },
  $c = (i) => {
    const l = i.target.href;
    i.preventDefault(),
      window.alloy("appendIdentityToUrl", { url: l }).then(({ url: c }) => {
        document.location = c;
      });
  },
  Wm = (i) => {
    const l = new URLSearchParams(document.location.search);
    return l.delete(i), l.toString() ? `?${l.toString()}` : "";
  },
  Vo = Wm("adobe_mc"),
  Yc =
    document.location.hostname === "alloyio.com"
      ? "alloyio2.com"
      : "alloyio.com";
function Vm() {
  const [i, l] = me.useState(""),
    [c, a] = me.useState(""),
    [f, h] = me.useState("");
  Le(),
    me.useEffect(() => {
      const y = Hc();
      l(y), a(y);
    }, []);
  const g = (y) => {
    h(y), a(Hc());
  };
  return u.jsxs("div", {
    children: [
      u.jsx("h1", { children: "Identity" }),
      u.jsx("section", {
        children:
          "This page demonstrates recieving or sending identity within the URL. No calls to experience edge are made until you press one of the buttons below. The table shows the current and original identities. If you click on the link on the bottom, it will generate a link to another domain with the ID included in the URL.",
      }),
      u.jsxs("section", {
        children: [
          u.jsx("button", { onClick: Es(g), children: "Get Identity" }),
          u.jsx("button", { onClick: Um(g), children: "Send Event" }),
          u.jsx("button", { onClick: Bm(g), children: "Set Consent" }),
        ],
      }),
      u.jsx("section", {
        children: u.jsx("table", {
          children: u.jsxs("tbody", {
            children: [
              u.jsxs("tr", {
                children: [
                  u.jsx("td", { children: "Original Identity Cookie" }),
                  u.jsx("td", { children: u.jsx("pre", { children: i }) }),
                ],
              }),
              u.jsxs("tr", {
                children: [
                  u.jsx("td", { children: "Current Identity Cookie" }),
                  u.jsx("td", { children: u.jsx("pre", { children: c }) }),
                ],
              }),
              u.jsxs("tr", {
                children: [
                  u.jsx("td", { children: "Identity from Web SDK" }),
                  u.jsx("td", { children: u.jsx("pre", { children: f }) }),
                ],
              }),
            ],
          }),
        }),
      }),
      u.jsxs("section", {
        children: [
          u.jsx("a", {
            href: `/Identity${Vo}`,
            children: "Web SDK identity page",
          }),
          u.jsx("br", {}),
          u.jsx("a", {
            href: `/legacy.html${Vo}`,
            children: "Legacy identity page",
          }),
          u.jsx("br", {}),
          u.jsx("a", {
            href: `https://${Yc}/identity${Vo}`,
            onClick: $c,
            children: "Cross domain Web SDK identity page",
          }),
          u.jsx("br", {}),
          u.jsx("a", {
            href: `https://${Yc}/legacy.html${Vo}`,
            onClick: $c,
            children: "Cross domain legacy identity page",
          }),
          u.jsx("br", {}),
        ],
      }),
    ],
  });
}
function Hm() {
  const [i, l] = me.useState("0.0.0");
  return (
    me.useEffect(() => {
      const c = window.__alloyNS[0] || "alloy";
      window[c]("getLibraryInfo").then(({ libraryInfo: { version: a } }) => {
        l(a);
      });
    }, []),
    u.jsx("div", {
      style: {
        bottom: 0,
        fontFamily: "monospace",
        margin: "4px",
        padding: "0",
        opacity: 0.4,
        position: "fixed",
        right: 0,
        size: "0.8rem",
        userSelect: "none",
      },
      children: i,
    })
  );
}
const Zc = {
    datastreamId: "",
    com_adobe_experience_platform: {
      datasets: { event: { datasetId: "" }, profile: { datasetId: "" } },
    },
    com_adobe_analytics: { reportSuites: [] },
    com_adobe_identity: { idSyncContainerId: "" },
    com_adobe_target: { propertyToken: "" },
  },
  $m = (i) =>
    window.alloy("sendEvent", {
      renderDecisions: !0,
      edgeConfigOverrides: { ...i },
    }),
  Ym = (i) =>
    window.alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "2.0",
          value: { collect: { val: "in" } },
        },
      ],
      edgeConfigOverrides: { ...i },
    }),
  Zm = (i) =>
    window.alloy("getIdentity", {
      namespaces: ["ECID"],
      edgeConfigOverrides: { ...i },
    }),
  Qm = (i) =>
    window
      .alloy("appendIdentityToUrl", {
        url: "https://example.com",
        edgeConfigOverrides: { ...i },
      })
      .then((l) => console.log("URL with appended identity: ", l));
function Jm() {
  const [i, l] = me.useState(""),
    [c, a] = me.useState({ ...Zc }),
    f = JSON.stringify(c, null, 2);
  Le();
  const h = (x) => {
      try {
        const C = JSON.parse(x.target.value);
        a(C), l("");
      } catch (C) {
        console.error(C),
          l(`The text you just entered is not valid JSON. Try again.
${C}`);
      }
    },
    g = () => {
      console.log("Add report suite"),
        a({
          ...c,
          com_adobe_analytics: {
            ...c.com_adobe_analytics,
            analyticsReportSuites: [
              ...((c.com_adobe_analytics || {}).analyticsReportSuites || []),
              "",
            ],
          },
        });
    },
    y = () => {
      a({ ...Zc });
    },
    m = (x) => () =>
      x(c).catch((C) => {
        console.error(C),
          l(`The request failed.
${C.toString()}`);
      });
  return u.jsxs("div", {
    children: [
      u.jsx("h2", { children: "Overrides" }),
      i &&
        u.jsxs("div", {
          style: {
            margin: "8px",
            border: "1px solid red",
            borderRadius: "8px",
            padding: "8px",
          },
          children: [
            u.jsx("span", {
              role: "img",
              "aria-label": "A siren, signifying something to be alerted by",
              children: "🚨",
            }),
            u.jsx("pre", { style: { wordWrap: "break-word" }, children: i }),
          ],
        }),
      u.jsxs("div", {
        style: { margin: "8px" },
        children: [
          u.jsx("button", {
            type: "button",
            onClick: g,
            children: "Add report suite",
          }),
          u.jsx("button", { type: "button", onClick: y, children: "Reset" }),
        ],
      }),
      u.jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          flexWrap: "wrap-reverse",
          maxWidth: "875px",
        },
        children: [
          u.jsx("textarea", {
            style: { fontFamily: "monospace", boxSizing: "border-box" },
            name: "overrideEditor",
            id: "overrideEditor",
            cols: "50",
            rows: "20",
            value: f,
            onChange: h,
          }),
          u.jsx("pre", {
            children: u.jsxs("code", {
              children: [
                'alloy("sendEvent",',
                " ",
                JSON.stringify(
                  { renderDecisions: !0, edgeConfigOverrides: c },
                  null,
                  2,
                ),
                ")",
              ],
            }),
          }),
        ],
      }),
      u.jsxs("div", {
        style: { margin: "8px" },
        children: [
          u.jsx("button", {
            type: "button",
            onClick: m($m),
            children: "Send Event",
          }),
          u.jsx("button", {
            type: "button",
            onClick: m(Zm),
            children: "Get Identity",
          }),
          u.jsx("button", {
            type: "button",
            onClick: m(Qm),
            children: "Append Identity to URL",
          }),
          u.jsx("button", {
            type: "button",
            onClick: m(Ym),
            children: "Set Consent",
          }),
        ],
      }),
    ],
  });
}
const Cd = () => {
    const i = document.cookie.split(";");
    for (let l = 0; l < i.length; l += 1) {
      const c = i[l],
        a = c.indexOf("="),
        f = a > -1 ? c.substr(0, a) : c;
      document.cookie = `${f}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  },
  Ed = () => ({
    cjmProdNld2: {
      name: "CJM Prod NLD2 – Prod (NLD2)",
      alloyInstance: window.alloy,
      datastreamId: "7a19c434-6648-48d3-948f-ba0258505d98",
      orgId: "4DA0571C5FDC4BF70A495FC2@AdobeOrg",
      decisionContext: {},
      edgeDomain: "edge.adobedc.net",
    },
    aemonacpprodcampaign: {
      name: "AEM Assets Departmental - Campaign – Prod (VA7)",
      alloyInstance: window.iamAlloy,
      datastreamId: "8cefc5ca-1c2a-479f-88f2-3d42cc302514",
      orgId: "906E3A095DC834230A495FD6@AdobeOrg",
      decisionContext: {},
      edgeDomain: "edge.adobedc.net",
    },
    stage: {
      name: "CJM Stage - AJO Web (VA7)",
      alloyInstance: window.iamAlloy,
      datastreamId: "15525167-fd4e-4511-b9e0-02119485784f",
      orgId: "745F37C35E4B776E0A49421B@AdobeOrg",
      decisionContext: {},
      edgeDomain: "edge-int.adobedc.net",
    },
  }),
  Sd = localStorage.getItem("iam-configKey") || "aemonacpprodcampaign",
  hs = Ed(),
  { datastreamId: Gm, orgId: qm, decisionContext: Xm, edgeDomain: Km } = hs[Sd],
  ev = (i) => new URLSearchParams(window.location.search).get(i),
  Qc = "iam-customtrait-key",
  Jc = "iam-customtrait-value";
function tv() {
  const [i, l] = me.useState(!1),
    [c, a] = me.useState(localStorage.getItem(Qc) || ""),
    [f, h] = me.useState(localStorage.getItem(Jc) || ""),
    g = (j) => {
      a(j), localStorage.setItem(Qc, j);
    },
    y = (j) => {
      h(j), localStorage.setItem(Jc, j);
    };
  Le({
    configurations: {
      alloy: {
        defaultConsent: ev("defaultConsent") || "in",
        datastreamId: Gm,
        orgId: qm,
        edgeDomain: Km,
        thirdPartyCookiesEnabled: !1,
        targetMigrationEnabled: !1,
        personalizationStorageEnabled: !0,
        debugEnabled: !0,
      },
    },
  }),
    me.useEffect(() => {
      const j = window.alloy("subscribeRulesetItems", {
        callback: (P) => {
          console.log("subscribeRulesetItems", P);
        },
      });
      return () => {
        j.then(({ unsubscribe: P }) => P());
      };
    }, []);
  const m = (j = !1) => {
      const P = { ...Xm };
      if ((c.length !== 0 && f.length !== 0 && (P[c] = f), j)) {
        window.alloy("evaluateRulesets", {
          renderDecisions: !0,
          personalization: { decisionContext: P },
        });
        return;
      }
      window
        .alloy("sendEvent", {
          renderDecisions: !0,
          type: "decisioning.propositionFetch",
          personalization: {
            surfaces: ["#hello"],
            decisionContext: P,
            sendDisplayEvent: !1,
          },
        })
        .then(() => {
          l(!0);
        });
    },
    x = () => {
      window.alloy("sendEvent", {
        renderDecisions: !1,
        personalization: { includeRenderedPropositions: !0 },
      });
    },
    C = (j) => {
      localStorage.setItem("iam-configKey", j), Cd(), window.location.reload();
    };
  return u.jsxs("div", {
    children: [
      u.jsx(Ve, {}),
      u.jsx("h1", { children: "In App Messages For Web" }),
      u.jsxs("div", {
        children: [
          u.jsx("label", { htmlFor: "configEnv", children: "Environment:" }),
          u.jsx("select", {
            id: "configEnv",
            name: "configEnv",
            onChange: (j) => C(j.target.value),
            defaultValue: Sd,
            children: Object.keys(hs).map((j) =>
              u.jsx("option", { value: j, children: hs[j].name }, j),
            ),
          }),
          u.jsxs("div", {
            style: { marginBottom: "20px" },
            children: [
              u.jsx("h3", { children: "Custom Trait" }),
              u.jsxs("span", {
                style: { marginRight: "20px" },
                children: [
                  u.jsx("label", {
                    htmlFor: "input-custom-trait-key",
                    children: "Key",
                  }),
                  u.jsx("input", {
                    id: "input-custom-trait-key",
                    type: "text",
                    value: c,
                    onChange: (j) => g(j.target.value),
                  }),
                ],
              }),
              u.jsxs("span", {
                style: { marginRight: "20px" },
                children: [
                  u.jsx("label", {
                    htmlFor: "input-custom-trait-value",
                    children: "Value",
                  }),
                  u.jsx("input", {
                    id: "input-custom-trait-value",
                    type: "text",
                    value: f,
                    onChange: (j) => y(j.target.value),
                  }),
                ],
              }),
            ],
          }),
          u.jsx("button", { onClick: () => m(), children: "sendEvent" }),
          u.jsx("button", {
            onClick: () => x(),
            disabled: !i,
            children: "send display events",
          }),
          u.jsx("button", {
            onClick: () => m(!0),
            disabled: !i,
            children: "evaluateRulesets",
          }),
        ],
      }),
    ],
  });
}
const Td = localStorage.getItem("iam-configKey") || "stage";
let zr = localStorage.getItem("iam-responseSource") || "mock";
const nv = Ed(),
  { datastreamId: rv, orgId: ov, decisionContext: iv, edgeDomain: lv } = nv[Td],
  wt = "web://aepdemo.com/contentCards",
  sv = {
    requestId: "5a38a9ef-67d7-4f66-8977-c4dc0e0967b6",
    handle: [
      {
        payload: [
          {
            id: "11893040138696185741718511332124641876",
            namespace: { code: "ECID" },
          },
        ],
        type: "identity:result",
      },
      {
        payload: [
          {
            scopeDetails: {
              decisionProvider: "AJO",
              characteristics: {
                eventToken:
                  "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
              },
              strategies: [
                {
                  strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                  treatmentID: "yu7rkogezumca7i0i44v",
                },
              ],
              activity: {
                id: "8e24e51d-5203-4d0b-99c9-2b3c95ff48f2#05885219-ea84-43bc-874e-1ef4a85b6fbb",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
            id: "1a3d874f-39ee-4310-bfa9-6559a10041a4",
            items: [
              {
                id: "9d9c6e62-a8e5-419b-abe3-429950c27425",
                schema: "https://ns.adobe.com/personalization/ruleset-item",
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    "iam.eventType": "dismiss",
                                    "iam.id":
                                      "8e24e51d-5203-4d0b-99c9-2b3c95ff48f2#05885219-ea84-43bc-874e-1ef4a85b6fbb",
                                  },
                                ],
                                matcher: "le",
                                value: 0,
                              },
                              type: "historical",
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "events",
                                      matcher: "ex",
                                    },
                                    type: "matcher",
                                  },
                                  {
                                    definition: {
                                      events: [
                                        {
                                          "iam.eventType": "trigger",
                                          "iam.id":
                                            "8e24e51d-5203-4d0b-99c9-2b3c95ff48f2#05885219-ea84-43bc-874e-1ef4a85b6fbb",
                                        },
                                      ],
                                      matcher: "ge",
                                      value: 1,
                                    },
                                    type: "historical",
                                  },
                                ],
                                logic: "or",
                              },
                              type: "group",
                            },
                          ],
                          logic: "and",
                        },
                        type: "group",
                      },
                      consequences: [
                        {
                          type: "schema",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/message/content-card",
                            data: {
                              expiryDate: 1712190456,
                              publishedDate: 167775264e4,
                              meta: { surface: wt },
                              content: {
                                imageUrl: "/img/lumon.png",
                                actionTitle: "Shop the sale!",
                                actionUrl: "https://luma.com/sale",
                                body: "a handshake is available upon request.",
                                title: "Welcome to Lumon!",
                              },
                              contentType: "application/json",
                            },
                            id: "a48ca420-faea-467e-989a-5d179d9f562d",
                          },
                          id: "a48ca420-faea-467e-989a-5d179d9f562d",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            scope: wt,
          },
          {
            scopeDetails: {
              decisionProvider: "AJO",
              characteristics: {
                eventToken:
                  "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
              },
              strategies: [
                {
                  strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                  treatmentID: "yu7rkogezumca7i0i44v",
                },
              ],
              activity: {
                id: "9d8d3896-872f-4fab-8440-220c7f012ba8#b1e22d27-40cb-42ba-aa1f-9a6d26a737a6",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
            id: "532a0ac7-7412-42e1-b2c3-62fb0d0e5db0",
            items: [
              {
                id: "97b69bf2-dc9c-43d4-8a39-4c9def816cf2",
                schema: "https://ns.adobe.com/personalization/ruleset-item",
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    "iam.eventType": "dismiss",
                                    "iam.id":
                                      "9d8d3896-872f-4fab-8440-220c7f012ba8#b1e22d27-40cb-42ba-aa1f-9a6d26a737a6",
                                  },
                                ],
                                matcher: "le",
                                value: 0,
                              },
                              type: "historical",
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "events",
                                      matcher: "ex",
                                    },
                                    type: "matcher",
                                  },
                                  {
                                    definition: {
                                      events: [
                                        {
                                          "iam.eventType": "trigger",
                                          "iam.id":
                                            "9d8d3896-872f-4fab-8440-220c7f012ba8#b1e22d27-40cb-42ba-aa1f-9a6d26a737a6",
                                        },
                                      ],
                                      matcher: "ge",
                                      value: 1,
                                    },
                                    type: "historical",
                                  },
                                ],
                                logic: "or",
                              },
                              type: "group",
                            },
                          ],
                          logic: "and",
                        },
                        type: "group",
                      },
                      consequences: [
                        {
                          type: "schema",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/message/content-card",
                            data: {
                              expiryDate: 1712190456,
                              publishedDate: 167783904e4,
                              meta: { surface: wt },
                              content: {
                                imageUrl: "/img/achievement.jpg",
                                actionTitle: "Shop the sale!",
                                actionUrl: "https://luma.com/sale",
                                body: "Great job, you completed your profile.",
                                title: "Achievement Unlocked!",
                              },
                              contentType: "application/json",
                            },
                            id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
                          },
                          id: "b7173290-588f-40c6-a05c-43ed5ec08b28",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            scope: wt,
          },
          {
            scopeDetails: {
              decisionProvider: "AJO",
              characteristics: {
                eventToken:
                  "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
              },
              strategies: [
                {
                  strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                  treatmentID: "yu7rkogezumca7i0i44v",
                },
              ],
              activity: {
                id: "cf087a6e-131d-4147-adc7-bc1ea947f09c#ff64e6e6-e43f-479d-b5c0-f5568c771b3b",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
            id: "1ae11bc5-96dc-41c7-8f71-157c57a5290e",
            items: [
              {
                id: "e0575812-74e5-46b9-a4f2-9541dfaec2d0",
                schema: "https://ns.adobe.com/personalization/ruleset-item",
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    "iam.eventType": "dismiss",
                                    "iam.id":
                                      "cf087a6e-131d-4147-adc7-bc1ea947f09c#ff64e6e6-e43f-479d-b5c0-f5568c771b3b",
                                  },
                                ],
                                matcher: "le",
                                value: 0,
                              },
                              type: "historical",
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "action",
                                      matcher: "eq",
                                      values: ["share-social-media"],
                                    },
                                    type: "matcher",
                                  },
                                  {
                                    definition: {
                                      events: [
                                        {
                                          "iam.eventType": "trigger",
                                          "iam.id":
                                            "cf087a6e-131d-4147-adc7-bc1ea947f09c#ff64e6e6-e43f-479d-b5c0-f5568c771b3b",
                                        },
                                      ],
                                      matcher: "ge",
                                      value: 1,
                                    },
                                    type: "historical",
                                  },
                                ],
                                logic: "or",
                              },
                              type: "group",
                            },
                          ],
                          logic: "and",
                        },
                        type: "group",
                      },
                      consequences: [
                        {
                          type: "schema",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/message/content-card",
                            data: {
                              expiryDate: 1712190456,
                              publishedDate: 167809824e4,
                              meta: { surface: wt },
                              content: {
                                imageUrl: "/img/twitter.png",
                                actionTitle: "Shop the sale!",
                                actionUrl: "https://luma.com/sale",
                                body: "Posting on social media helps us spread the word.",
                                title: "Thanks for sharing!",
                              },
                              contentType: "application/json",
                            },
                            id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
                          },
                          id: "cfcb1af7-7bc2-45b2-a86a-0aa93fe69ce7",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            scope: wt,
          },
          {
            scopeDetails: {
              decisionProvider: "AJO",
              characteristics: {
                eventToken:
                  "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiMDJjNzdlYTgtN2MwZS00ZDMzLTgwOTAtNGE1YmZkM2Q3NTAzIiwibWVzc2FnZVR5cGUiOiJtYXJrZXRpbmciLCJjYW1wYWlnbklEIjoiMzlhZThkNGItYjU1ZS00M2RjLWExNDMtNzdmNTAxOTViNDg3IiwiY2FtcGFpZ25WZXJzaW9uSUQiOiJiZDg1ZDllOC0yMDM3LTQyMmYtYjZkMi0zOTU3YzkwNTU5ZDMiLCJjYW1wYWlnbkFjdGlvbklEIjoiYjQ3ZmRlOGItNTdjMS00YmJlLWFlMjItNjRkNWI3ODJkMTgzIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiJhZTUyY2VkOC0yMDBjLTQ5N2UtODc4Ny1lZjljZmMxNzgyMTUifSwibWVzc2FnZVByb2ZpbGUiOnsiY2hhbm5lbCI6eyJfaWQiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbHMvd2ViIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy93ZWIifSwibWVzc2FnZVByb2ZpbGVJRCI6ImY1Y2Q5OTk1LTZiNDQtNDIyMS05YWI3LTViNTMzOGQ1ZjE5MyJ9fQ==",
              },
              strategies: [
                {
                  strategyID: "3VQe3oIqiYq2RAsYzmDTSf",
                  treatmentID: "yu7rkogezumca7i0i44v",
                },
              ],
              activity: {
                id: "57712381-1690-4d19-9469-0a35ea5bd4e3#74f8e5cf-d770-41c3-b595-557b3ee00ba3",
              },
              correlationID: "02c77ea8-7c0e-4d33-8090-4a5bfd3d7503",
            },
            id: "d1f7d411-a549-47bc-a4d8-c8e638b0a46b",
            items: [
              {
                id: "f47638a0-b785-4f56-afa6-c24e714b8ff4",
                schema: "https://ns.adobe.com/personalization/ruleset-item",
                data: {
                  version: 1,
                  rules: [
                    {
                      condition: {
                        definition: {
                          conditions: [
                            {
                              definition: {
                                events: [
                                  {
                                    "iam.eventType": "dismiss",
                                    "iam.id":
                                      "57712381-1690-4d19-9469-0a35ea5bd4e3#74f8e5cf-d770-41c3-b595-557b3ee00ba3",
                                  },
                                ],
                                matcher: "le",
                                value: 0,
                              },
                              type: "historical",
                            },
                            {
                              definition: {
                                conditions: [
                                  {
                                    definition: {
                                      key: "action",
                                      matcher: "eq",
                                      values: ["deposit-funds"],
                                    },
                                    type: "matcher",
                                  },
                                  {
                                    definition: {
                                      events: [
                                        {
                                          "iam.eventType": "trigger",
                                          "iam.id":
                                            "57712381-1690-4d19-9469-0a35ea5bd4e3#74f8e5cf-d770-41c3-b595-557b3ee00ba3",
                                        },
                                      ],
                                      matcher: "ge",
                                      value: 1,
                                    },
                                    type: "historical",
                                  },
                                ],
                                logic: "or",
                              },
                              type: "group",
                            },
                          ],
                          logic: "and",
                        },
                        type: "group",
                      },
                      consequences: [
                        {
                          type: "schema",
                          detail: {
                            schema:
                              "https://ns.adobe.com/personalization/message/content-card",
                            data: {
                              expiryDate: 1712190456,
                              publishedDate: 167818464e4,
                              meta: { surface: wt },
                              content: {
                                imageUrl: "/img/gold-coin.jpg",
                                actionTitle: "Shop the sale!",
                                actionUrl: "https://luma.com/sale",
                                body: "Now you're ready to earn!",
                                title: "Funds deposited!",
                              },
                              contentType: "application/json",
                            },
                            id: "0263e171-fa32-4c7a-9611-36b28137a81d",
                          },
                          id: "0263e171-fa32-4c7a-9611-36b28137a81d",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            scope: wt,
          },
        ],
        type: "personalization:decisions",
        eventIndex: 0,
      },
      {
        payload: [
          { scope: "Target", hint: "35", ttlSeconds: 1800 },
          { scope: "AAM", hint: "9", ttlSeconds: 1800 },
          { scope: "EdgeNetwork", hint: "or2", ttlSeconds: 1800 },
        ],
        type: "locationHint:result",
      },
      {
        payload: [
          {
            key: "kndctr_4DA0571C5FDC4BF70A495FC2_AdobeOrg_cluster",
            value: "or2",
            maxAge: 1800,
            attrs: { SameSite: "None" },
          },
        ],
        type: "state:store",
      },
    ],
  },
  ls = (i) => {
    let l = "";
    if (typeof i < "u") {
      const c = new Date().getTime(),
        a = Math.floor(c / 1e3),
        f = Math.floor(i / 1e3),
        h = a - f;
      h < 60
        ? (l = `${h} second(s) ago`)
        : h < 3600
          ? (l = `${Math.floor(h / 60)} min ago`)
          : h < 86400
            ? (l = `${Math.floor(h / 3600)} hour(s) ago`)
            : h < 2620800
              ? (l = `${Math.floor(h / 86400)} day(s) ago`)
              : h < 31449600
                ? (l = `${Math.floor(h / 2620800)} month(s) ago`)
                : (l = `${Math.floor(h / 31449600)} year(s) ago`);
    }
    return l;
  },
  av = (i, l) => {
    const { data: c = {} } = l,
      {
        content: a = {},
        meta: f = {},
        publishedDate: h,
        qualifiedDate: g,
        displayedDate: y,
      } = c;
    return {
      ...a,
      meta: f,
      qualifiedDate: g,
      displayedDate: y,
      publishedDate: h,
      getProposition: () => i,
    };
  },
  uv = (i) =>
    i
      .reduce((l, c) => {
        const { items: a = [] } = c;
        return [...l, ...a.map((f) => av(c, f))];
      }, [])
      .sort(
        (l, c) =>
          c.qualifiedDate - l.qualifiedDate ||
          c.publishedDate - l.publishedDate,
      );
function cv() {
  const [i, l] = me.useState(() => () => {}),
    [c, a] = me.useState(() => () => {}),
    [f, h] = me.useState([]),
    g = () =>
      window.alloy("subscribeRulesetItems", {
        surfaces: [wt],
        schemas: ["https://ns.adobe.com/personalization/message/content-card"],
        callback: (R, U) => {
          const { propositions: G = [] } = R,
            Y = uv(G),
            I = (z) =>
              U(
                "dismiss",
                z.map((F) => F.getProposition()),
              );
          l(
            () => (z) =>
              U(
                "interact",
                z.map((F) => F.getProposition()),
              ),
          ),
            a(() => (z) => I(z)),
            U("display", G),
            h(Y);
        },
      });
  Le({
    configurations: {
      alloy: {
        defaultConsent: "in",
        datastreamId: rv,
        orgId: ov,
        edgeDomain: lv,
        thirdPartyCookiesEnabled: !1,
        targetMigrationEnabled: !1,
        personalizationStorageEnabled: !0,
        debugEnabled: !0,
      },
    },
  }),
    me.useEffect(() => {
      const R = Promise.all([
        g(),
        zr === "edge"
          ? window.alloy("sendEvent", {
              renderDecisions: !0,
              type: "decisioning.propositionFetch",
              personalization: {
                surfaces: [wt],
                decisionContext: { ...iv },
                sendDisplayEvent: !1,
              },
            })
          : window.alloy("applyResponse", {
              renderDecisions: !0,
              responseBody: sv,
            }),
      ]);
      return () => {
        R.then(([U, G]) => {
          G.unsubscribe(), U.unsubscribe();
        });
      };
    }, ["clickHandler"]);
  const y = (R) => {
      c(R).then(() => {
        window.alloy("evaluateRulesets", { renderDecisions: !0 });
      });
    },
    m = (R) => {
      if (R.length === 0) return;
      i(R);
      const { actionUrl: U = "" } = R[0];
      typeof U != "string" || U.length === 0 || (window.location.href = U);
    },
    x = () => {
      window.alloy("evaluateRulesets", {
        renderDecisions: !0,
        personalization: { decisionContext: { action: "share-social-media" } },
      });
    },
    C = () => {
      window.alloy("evaluateRulesets", {
        renderDecisions: !0,
        personalization: { decisionContext: { action: "deposit-funds" } },
      });
    },
    j = () => {
      Cd(),
        localStorage.clear(),
        localStorage.setItem("iam-configKey", Td),
        localStorage.setItem("iam-responseSource", zr),
        window.location.reload();
    },
    P = (R) => {
      (zr = R), localStorage.setItem("iam-responseSource", zr), j();
    };
  return u.jsxs("div", {
    children: [
      u.jsx(Ve, {}),
      u.jsxs("div", {
        children: [
          u.jsx("label", { htmlFor: "cars", children: "Response Source:" }),
          u.jsxs("select", {
            id: "responseSource",
            name: "responseSource",
            onChange: (R) => P(R.target.value),
            defaultValue: zr,
            children: [
              u.jsx("option", { value: "mock", children: "Mock" }, "mock"),
              u.jsx("option", { value: "edge", children: "Edge" }, "edge"),
            ],
          }),
        ],
      }),
      u.jsxs("div", {
        style: { margin: "10px 0" },
        children: [
          u.jsx("button", {
            id: "social-media-share",
            onClick: () => x(),
            children: "Share on social media",
          }),
          u.jsx("button", {
            id: "deposit-funds",
            onClick: () => C(),
            children: "Deposit funds",
          }),
          u.jsx("button", {
            id: "reset",
            onClick: () => j(),
            children: "Reset",
          }),
        ],
      }),
      u.jsxs("div", {
        style: { margin: "30px 0", maxWidth: "1000px" },
        children: [
          u.jsx("h3", { children: "Content Cards" }),
          u.jsx("div", {
            id: "content-cards",
            children: f.map((R, U) =>
              u.jsxs(
                "div",
                {
                  className: "pretty-card",
                  onClick: () => m([R]),
                  children: [
                    u.jsx("button", {
                      onClick: (G) => {
                        G.stopPropagation(), y([R]);
                      },
                      children: "dismiss",
                    }),
                    u.jsx("p", { children: R.title }),
                    u.jsx("p", {
                      children:
                        R.imageUrl &&
                        u.jsx("img", { src: R.imageUrl, alt: "Item Image" }),
                    }),
                    u.jsx("p", { children: R.body }),
                    u.jsxs("p", {
                      children: ["Published: ", ls(R.publishedDate)],
                    }),
                    u.jsxs("p", {
                      children: ["Qualified: ", ls(R.qualifiedDate)],
                    }),
                    u.jsxs("p", {
                      children: ["Displayed: ", ls(R.displayedDate)],
                    }),
                  ],
                },
                U,
              ),
            ),
          }),
        ],
      }),
    ],
  });
}
const dv = () => {
    const [i, l] = me.useState(!0),
      [c, a] = me.useState(Notification.permission),
      f = async () => {
        const h = await Notification.requestPermission();
        a(h),
          h === "granted" &&
            new Notification(
              "You successfully granted permsissions to Push notifications!",
            );
      };
    return i
      ? u.jsxs("div", {
          className: "notification-banner",
          children: [
            u.jsx("div", {
              children: u.jsxs("div", {
                className: "notification-text",
                children: [
                  !("Notification" in window) &&
                    "This browser does not support desktop notifications.",
                  c === "default" &&
                    u.jsxs(u.Fragment, {
                      children: [
                        u.jsx("strong", {
                          children:
                            "Would you like to receive push notifications?",
                        }),
                        u.jsx("button", {
                          className: "notification-link positive",
                          onClick: f,
                          children: "Sure",
                        }),
                        u.jsx("button", {
                          className: "notification-link negative",
                          onClick: () => a("denied"),
                          children: "Nope",
                        }),
                      ],
                    }),
                  c !== "default" &&
                    u.jsxs(u.Fragment, {
                      children: [
                        u.jsxs("div", {
                          children: [
                            "You have already chosen your notification preference. Permission value: ",
                            u.jsx("strong", { children: c }),
                            ".",
                          ],
                        }),
                        u.jsxs("div", {
                          children: [
                            "For Chrome open the following link in a new tab:",
                            " ",
                            u.jsx("strong", {
                              children:
                                "chrome://settings/content/notifications?search=notifications",
                            }),
                            u.jsx("button", {
                              className: "notification-link",
                              onClick: () => {
                                navigator.clipboard.writeText(
                                  "chrome://settings/content/notifications?search=notifications",
                                );
                              },
                              children: "Copy",
                            }),
                          ],
                        }),
                        u.jsxs("div", {
                          children: [
                            "For Edge open the following link in a new tab:",
                            " ",
                            u.jsx("strong", {
                              children:
                                "edge://settings/content/notifications?search=notifications",
                            }),
                            u.jsx("button", {
                              className: "notification-link",
                              onClick: () => {
                                navigator.clipboard.writeText(
                                  "edge://settings/content/notifications?search=notifications",
                                );
                              },
                              children: "Copy",
                            }),
                          ],
                        }),
                        u.jsxs("div", {
                          children: [
                            "For Safari, go to",
                            " ",
                            u.jsx("strong", {
                              children:
                                "Preferences > Websites > Notifications",
                            }),
                            " ",
                            "and manually remove each website entry that appears there",
                          ],
                        }),
                        u.jsxs("div", {
                          children: [
                            "For Firefox, go to",
                            " ",
                            u.jsx("strong", {
                              children:
                                "Settings > Privacy & Security > Permissions > Notifications > Settings",
                            }),
                            " ",
                            "and manually remove each website entry that appears there",
                          ],
                        }),
                      ],
                    }),
                ],
              }),
            }),
            u.jsx("button", {
              className: "close-button",
              onClick: () => l(!1),
              "aria-label": "Close notification",
              children: "×",
            }),
          ],
        })
      : null;
  },
  fv = async () => (await navigator.serviceWorker.getRegistration()) != null,
  pv = async () => {
    try {
      if (!("serviceWorker" in navigator))
        throw new Error("Service workers are not supported in this browser.");
      if (!("PushManager" in window))
        throw new Error(
          "Push notifications are not supported in this browser.",
        );
      return await navigator.serviceWorker.register(
        "/pushNotificationsServiceWorker.js",
        { scope: "/pushNotifications" },
      );
    } catch (i) {
      console.error(
        "Push Notifications Service Worker registration failed: ",
        i,
      );
    }
  },
  hv = async () => {
    try {
      if (!("serviceWorker" in navigator))
        throw new Error("Service workers are not supported in this browser.");
      if (!("PushManager" in window))
        throw new Error(
          "Push notifications are not supported in this browser.",
        );
      const i = await navigator.serviceWorker.getRegistration(
        "/pushNotificationsServiceWorker.js",
      );
      if (i && !(await i.unregister()))
        throw new Error("Service worker was not unregistered");
    } catch (i) {
      console.error(
        "Push Notifications Service Worker registration failed: ",
        i,
      );
    }
  },
  mv = () => {
    window.alloy("sendPushSubscription");
  };
function vv() {
  const [i, l] = me.useState(null),
    [c, a] = me.useState(0);
  return (
    Le({
      configurations: {
        alloy: {
          orgId: "97D1F3F459CE0AD80A495CBE@AdobeOrg",
          datastreamId: "9db94cb5-a892-4ae9-b117-a667a4ed67a8",
          thirdPartyCookiesEnabled: !1,
          targetMigrationEnabled: !1,
          clickCollectionEnabled: !1,
          personalizationStorageEnabled: !1,
          onBeforeEventSend: () => {},
          pushNotifications: {
            vapidPublicKey:
              "BBNXFX_qxm8d7ry08dh0qt-CLMdiXamv7KlvLz0p4nCTxW3ePvrMb1x_VL-tg4TINPPZaJoNX4FQvthuAOR1VuI",
          },
        },
      },
    }),
    me.useEffect(() => {
      (async () => {
        try {
          const h = await fv();
          l(h);
        } catch (h) {
          console.error("Error checking service worker status:", h);
        }
      })();
    }, [c]),
    u.jsxs("div", {
      children: [
        u.jsx(Ve, {}),
        u.jsx(dv, {}),
        u.jsx("h1", { children: "Push Notifications" }),
        u.jsxs("section", {
          children: [
            u.jsx("h2", {}),
            u.jsxs("div", {
              children: [
                i !== null &&
                  i &&
                  u.jsx("button", {
                    onClick: async () => {
                      await hv(), a((f) => f + 1);
                    },
                    children: "Unregister Service Worker",
                  }),
                i !== null &&
                  !i &&
                  u.jsx("button", {
                    onClick: async () => {
                      await pv(), a((f) => f + 1);
                    },
                    children: "Register Service Worker",
                  }),
                u.jsx("button", {
                  onClick: () => {
                    localStorage.removeItem(
                      "com.adobe.alloy.97D1F3F459CE0AD80A495CBE_AdobeOrg.pushNotifications.subscriptionDetails",
                    );
                  },
                  children: "Clear subscription cache",
                }),
                u.jsx("button", {
                  onClick: mv,
                  children: "Send Push Subscription",
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
}
const yv = () =>
  u.jsxs(u.Fragment, {
    children: [
      u.jsx(uh, {
        children: u.jsxs("div", {
          children: [
            u.jsxs("ul", {
              children: [
                u.jsx("li", {
                  children: u.jsx(Re, { to: "/", children: "Home" }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, { to: "/consent", children: "Consent" }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/personalization",
                    children: "Personalization",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/personalizationSpa",
                    children: "Personalization - SPA",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/personalizationAjo",
                    children: "Personalization - AJO",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/personalizationA4TClientSide",
                    children: "Personalization - A4T Client Side",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/personalizationProfile",
                    children: "Personalization - Profile",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/personalizationFormBased",
                    children: "Personalization - Form Based",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, { to: "/links", children: "Links" }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/eventMerge",
                    children: "Event-Merge",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/largePayload",
                    children: "Large Payload",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/orgTwo",
                    children: "Multiple Orgs",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx("a", {
                    href: "/dualTag",
                    children: "Dual Tag",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx("a", {
                    href: "/legacy.html",
                    children: "Legacy Visitor ID",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx("a", {
                    href: "/redirectOffers",
                    children: "Redirect Offers",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx("a", {
                    href: "/identity",
                    children: "Identity",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx("a", {
                    href: "/configOverrides",
                    children: "Config Overrides",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx("a", {
                    href: "/advertisingTest",
                    children: "Advertising Test",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/inAppMessages",
                    children: "In-app Messages",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/contentCards",
                    children: "Content Cards",
                  }),
                }),
                u.jsx("li", {
                  children: u.jsx(Re, {
                    to: "/pushNotifications",
                    children: "Push Notifications",
                  }),
                }),
              ],
            }),
            u.jsx("hr", {}),
            u.jsx(Ae, { exact: !0, path: "/", component: Xh }),
            u.jsx(Ae, { path: "/consent", component: am }),
            u.jsx(Ae, { path: "/personalization", component: um }),
            u.jsx(Ae, { path: "/personalizationSpa", component: pm }),
            u.jsx(Ae, { path: "/personalizationAjo", component: hm }),
            u.jsx(Ae, { path: "/personalizationA4TClientSide", component: bm }),
            u.jsx(Ae, { path: "/personalizationProfile", component: mm }),
            u.jsx(Ae, { path: "/personalizationFormBased", component: zm }),
            u.jsx(Ae, { path: "/links", component: ym }),
            u.jsx(Ae, { path: "/eventMerge", component: gm }),
            u.jsx(Ae, { path: "/largePayload", component: wm }),
            u.jsx(Ae, { path: "/orgTwo", component: xm }),
            u.jsx(Ae, { path: "/dualTag", component: Sm }),
            u.jsx(Ae, { path: "/redirectOffers", component: Tm }),
            u.jsx(Ae, { path: "/redirectedNewPage", component: jm }),
            u.jsx(Ae, { path: "/identity", component: Vm }),
            u.jsx(Ae, { path: "/configOverrides", component: Jm }),
            u.jsx(Ae, { path: "/inAppMessages", component: tv }),
            u.jsx(Ae, { path: "/contentCards", component: cv }),
            u.jsx(Ae, { path: "/pushNotifications", component: vv }),
          ],
        }),
      }),
      u.jsx(Hm, {}),
    ],
  });
kp.render(u.jsx(yv, {}), document.getElementById("root"));
//# sourceMappingURL=index-D9tMLpod.js.map
