(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? (module.exports = factory())
    : typeof define === "function" && define.amd
    ? define(factory)
    : (global.__tcfapi = factory());
})(this, function() {
  "use strict";

  var explicitConsentInterval;

  function __tcfapi(apiName, version, callback, parameter) {
    if (apiName && __tcfapi[apiName]) {
      // Wait for Explicit Consent, if shouldWaitForExplicitConsent is `true`.
      if (__tcfapi.shouldWaitForExplicitConsent) {
        if (!explicitConsentInterval) {
          explicitConsentInterval = setInterval(() => {
            __tcfapi(apiName, 2, callback, parameter);
          }, 100);
        }

        return;
      }

      clearInterval(explicitConsentInterval);
      explicitConsentInterval = null;
      __tcfapi[apiName](callback, parameter);
    } else {
      console.error("Invalid __tcfapi command");
    }
  }

  __tcfapi.gdprApplies = true;
  __tcfapi.purpose1 = true;
  __tcfapi.purpose10 = true;
  __tcfapi.vendorConsent = true;
  __tcfapi.latency = 0;
  __tcfapi.tcString = "";
  // This flag stops the CMP from returning any existing consent
  // until it's set to `true`, which mimics the user clicking on the
  // consent POP UP; meaning a situation where there's no existing consent yet.
  __tcfapi.shouldWaitForExplicitConsent = false;

  __tcfapi.PingReturn = {
    cmpLoaded: true,
    cmpStatus: "loaded",
    apiVersion: "2.0",
    cmpVersion: "0.0.0.0"
  };

  __tcfapi.refreshTCData = () => {
    return {
      gdprApplies: __tcfapi.gdprApplies,
      tcString: __tcfapi.tcString,
      tcfPolicyVersion: 2,
      cmpId: 1000,
      cmpVersion: 1000,
      eventStatus: "EVENT STATUS",
      cmpStatus: "CMP STATUS",
      listenerId: 123,
      isServiceSpecific: false,
      useNonStandardStacks: false,
      publisherCC: "FR",
      purposeOneTreatment: false,
      outofBand: {
        allowVendors: {},
        disclosedVendors: { 565: true }
      },
      purpose: {
        consents: {
          1: __tcfapi.purpose1,
          10: __tcfapi.purpose10
        },
        legitimateInterests: {}
      },
      vendor: {
        consents: {
          565: __tcfapi.vendorConsent
        },
        legitimateInterests: {}
      }
    };
  };

  __tcfapi.TCData = __tcfapi.refreshTCData();

  __tcfapi.configure = (paramObject = {}) => {
    Object.keys(paramObject).forEach(param => {
      __tcfapi[param] = paramObject[param];
    });
  };

  __tcfapi.getTCData = function(callback, parameter) {
    setTimeout(() => {
      callback(__tcfapi.refreshTCData(), true);
    }, __tcfapi.latency);
  };

  __tcfapi.ping = function(callback, parameter) {
    setTimeout(() => {
      callback(__tcfapi.PingReturn);
    }, __tcfapi.latency);
  };

  __tcfapi.addEventListener = function(callback, parameter) {
    setTimeout(() => {
      callback(__tcfapi.TCData, true);
    }, __tcfapi.latency);
  };

  __tcfapi.removeEventListener = function(callback, parameter) {
    setTimeout(() => {
      callback(true);
    }, __tcfapi.latency);
  };

  window.__tcfapi = __tcfapi;
  return __tcfapi;
});
