import React, { useState } from "react";
import ContentSecurityPolicy from "./ContentSecurityPolicy";
import "./Consent.css";

const KONDUCTOR_COOKIE_PREFIX = "kndctr_334F60F35E1597910A495EC2_AdobeOrg_";
const LEGACY_IDENTITY_COOKIE = "AMCV_334F60F35E1597910A495EC2%40AdobeOrg";
const IAB_OPT_IN =
  "CO1Z4yuO1Z4yuAcABBENArCsAP_AAH_AACiQGCNX_T5eb2vj-3Zdt_tkaYwf55y3o-wzhhaIse8NwIeH7BoGP2MwvBX4JiQCGBAkkiKBAQdtHGhcCQABgIhRiTKMYk2MjzNKJLJAilsbe0NYCD9mnsHT3ZCY70--u__7P3fAwQgkwVLwCRIWwgJJs0ohTABCOICpBwCUEIQEClhoACAnYFAR6gAAAIDAACAAAAEEEBAIABAAAkIgAAAEBAKACIBAACAEaAhAARIEAsAJEgCAAVA0JACKIIQBCDgwCjlACAoAAAAA.YAAAAAAAAAAA";
const IAB_OPT_OUT =
  "CO1Z5evO1Z5evAcABBENArCgAAAAAH_AACiQGCNX_T5eb2vj-3Zdt_tkaYwf55y3o-wzhhaIse8NwIeH7BoGP2MwvBX4JiQCGBAkkiKBAQdtHGhcCQABgIhRiTKMYk2MjzNKBLJAilsbe0NYCD9mnsHT3ZCY70--u__7P3fAwQgkwVLwCRIWwgJJs0ohTABCOICpBwCUEIQEClhoACAnYFAR6gAAAIDAACAAAAEEEBAIABAAAkIgAAAEBAKACIBAACAEaAhAARIEAsAJEgCAAVA0JACKIIQBCDgwCjlACAoAAAAA.YAAAAAAAAAAA";
const IAB_OPT_IN_GOOGLE_VENDOR =
  "CO2ISm8O2IbZcAVAMBFRACBsAIBAAAAgEIYgGPtjup3rYdY178JUkiCIFabBlBymqcio5Ao1cEACRNnQIUAIyhKBCQmaUqJBKhQRWBDAQtQwBCB06EBmgIQNUmkj1MQGQgCRKSF7BmQBEwQMCagoBDeRAAo-kIhkLCAAqO0E_AB4F5wAgEagLzAA";
const IAB_OPT_OUT_GOOGLE_VENDOR =
  "CO2IS8PO2IbuvAVAMBFRACBsAIBAAAAgEIYgGQBiNh14tYnCZ-5fXnRqprc2dYaErJs0dFpVJBA0ALi95QggwAQXEIa4JmghQMIEJASUkIIMEjHIgsJSyMEIAMIgjpJqrggEIFVAIIgPDKAULEQQkBQcCCC2mhZURCaVE0AVLMF0CNYAICNQAA==";

let cookies;
const refreshCookies = () => {
  cookies = {};
  document.cookie.split(";").forEach(function(c) {
    const ct = c.trim();
    const index = ct.indexOf("=");
    const key = ct.slice(0, index);
    const value = ct.slice(index + 1);
    cookies[key] = value;
  });
};
const getConsentCookie = () => {
  return cookies[`${KONDUCTOR_COOKIE_PREFIX}consent`];
};
const getHasConsentCheckCookie = () => {
  return cookies[`${KONDUCTOR_COOKIE_PREFIX}consent_check`] !== undefined;
};
const getHasIdentityCookie = () => {
  return cookies[`${KONDUCTOR_COOKIE_PREFIX}identity`] !== undefined;
};
const getHasLegacyIdentityCookie = () => {
  return cookies[LEGACY_IDENTITY_COOKIE] !== undefined;
};
refreshCookies();
const originalConsentCookie = getConsentCookie();
const originalHasConsentCheckCookie = getHasConsentCheckCookie();
const originalHasIdentityCookie = getHasIdentityCookie();
const originalHasLegacyIdentityCookie = getHasLegacyIdentityCookie();

const getQueryStringParameter = key => {
  var searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(key);
};

const updateQueryStringParameterAndReload = (key, value) => () => {
  var searchParams = new URLSearchParams(window.location.search);
  if (value) {
    searchParams.set(key, value);
  } else {
    searchParams.delete(key);
  }
  window.location.search = searchParams.toString();
};

const adobe1Consent = generalPurpose => {
  return {
    consent: [
      {
        standard: "Adobe",
        version: "1.0",
        value: {
          general: generalPurpose
        }
      }
    ]
  };
};

const adobe2Consent = ({ collect }) => {
  return {
    consent: [
      {
        standard: "Adobe",
        version: "2.0",
        value: {
          collect: {
            val: collect
          }
        }
      }
    ]
  };
};

const iabConsent = consentString => {
  return {
    consent: [
      {
        standard: "IAB TCF",
        version: "2.0",
        value: consentString
      }
    ]
  };
};

const defaultConsent = getQueryStringParameter("defaultConsent") || "in";
const idMigrationEnabled =
  getQueryStringParameter("idMigrationEnabled") === "false" ? "false" : "true";
const includeVisitor =
  getQueryStringParameter("includeVisitor") === "true" ? "true" : "false";
const legacyOptIn =
  getQueryStringParameter("legacyOptIn") === "true" ? "true" : "false";

export default function Consent() {
  const [consent, setConsent] = useState(originalConsentCookie);
  const [hasConsentCheck, setHasConsentCheck] = useState(
    originalHasConsentCheckCookie
  );
  const [hasIdentity, setHasIdentity] = useState(originalHasIdentityCookie);
  const [hasLegacyIdentity, setHasLegacyIdentity] = useState(
    originalHasLegacyIdentityCookie
  );

  const refreshCookieState = () => {
    refreshCookies();
    setConsent(getConsentCookie());
    setHasConsentCheck(getHasConsentCheckCookie());
    setHasIdentity(getHasIdentityCookie());
    setHasLegacyIdentity(getHasLegacyIdentityCookie());
  };

  const executeCommand = (command, options = {}) => () => {
    window.alloy(command, options).then(result => {
      console.log(`Result from ${command}:`, result);
      refreshCookieState();
    });
  };

  const clearCookie = key => () => {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    refreshCookieState();
  };

  return (
    <div>
      <ContentSecurityPolicy />
      <h2>Opt-In</h2>
      <p>This page tests user consent:</p>

      <dl>
        <dt>Current Configuration:</dt>
        <dd>
          <table>
            <tbody>
              <tr>
                <td>defaultConsent</td>
                <td>{defaultConsent}</td>
                <td>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "defaultConsent",
                      "in"
                    )}
                    disabled={defaultConsent === "in"}
                  >
                    Set to "in"
                  </button>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "defaultConsent",
                      "pending"
                    )}
                    disabled={defaultConsent === "pending"}
                  >
                    Set to "pending"
                  </button>
                </td>
              </tr>
              <tr>
                <td>idMigrationEnabled</td>
                <td>{idMigrationEnabled}</td>
                <td>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "idMigrationEnabled"
                    )}
                    disabled={idMigrationEnabled === "true"}
                  >
                    Enable
                  </button>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "idMigrationEnabled",
                      "false"
                    )}
                    disabled={idMigrationEnabled === "false"}
                  >
                    Disable
                  </button>
                </td>
              </tr>
              <tr>
                <td>includeVisitor</td>
                <td>{includeVisitor}</td>
                <td>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "includeVisitor",
                      "true"
                    )}
                    disabled={includeVisitor === "true"}
                  >
                    Include
                  </button>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "includeVisitor"
                    )}
                    disabled={includeVisitor === "false"}
                  >
                    Remove
                  </button>
                </td>
              </tr>
              <tr>
                <td>legacyOptIn</td>
                <td>{legacyOptIn}</td>
                <td>
                  <button
                    onClick={updateQueryStringParameterAndReload(
                      "legacyOptIn",
                      "true"
                    )}
                    disabled={legacyOptIn === "true"}
                  >
                    Enable
                  </button>
                  <button
                    onClick={updateQueryStringParameterAndReload("legacyOptIn")}
                    disabled={legacyOptIn === "false"}
                  >
                    Disable
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </dd>
        <dt>Cookies:</dt>
        <dd>
          <table>
            <tbody>
              <tr>
                <td>Consent Cookie</td>
                <td>{consent}</td>
                <td>
                  <button
                    onClick={clearCookie(`${KONDUCTOR_COOKIE_PREFIX}consent`)}
                    disabled={consent === undefined}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td>Has Consent Check Cookie</td>
                <td>{hasConsentCheck ? "true" : "false"}</td>
                <td>
                  <button
                    onClick={clearCookie(
                      `${KONDUCTOR_COOKIE_PREFIX}consent_check`
                    )}
                    disabled={!hasConsentCheck}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td>Has Identity Cookie</td>
                <td>{hasIdentity ? "true" : "false"}</td>
                <td>
                  <button
                    onClick={clearCookie(`${KONDUCTOR_COOKIE_PREFIX}identity`)}
                    disabled={!hasIdentity}
                  >
                    Delete
                  </button>
                </td>
              </tr>
              <tr>
                <td>Has Legacy Identity Cookie</td>
                <td>{hasLegacyIdentity ? "true" : "false"}</td>
                <td>
                  <button
                    onClick={clearCookie(LEGACY_IDENTITY_COOKIE)}
                    disabled={!hasLegacyIdentity}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </dd>
        <dt>Adobe 1.0</dt>
        <dd>
          <button onClick={executeCommand("setConsent", adobe1Consent("in"))}>
            In
          </button>
          <button onClick={executeCommand("setConsent", adobe1Consent("out"))}>
            Out
          </button>
        </dd>
        <dt>Adobe 2.0</dt>
        <dd>
          <button
            onClick={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y" })
            )}
          >
            Collect="y"
          </button>
          <button
            onClick={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "n" })
            )}
          >
            Collect="n"
          </button>
        </dd>
        <dt>IAB TCF 2.0</dt>
        <dd>
          <button
            onClick={executeCommand("setConsent", iabConsent(IAB_OPT_IN))}
          >
            In
          </button>
          <button
            onClick={executeCommand("setConsent", iabConsent(IAB_OPT_OUT))}
          >
            Out
          </button>
          <button
            onClick={executeCommand(
              "setConsent",
              iabConsent(IAB_OPT_IN_GOOGLE_VENDOR)
            )}
          >
            Google Vendor In
          </button>
          <button
            onClick={executeCommand(
              "setConsent",
              iabConsent(IAB_OPT_OUT_GOOGLE_VENDOR)
            )}
          >
            Google Vendor Out
          </button>
        </dd>
        <dt>Legacy Opt-in Object</dt>
        <dd>
          <button onClick={() => window.adobe.optIn.approveAll()}>
            Approve All
          </button>
          <button onClick={() => window.adobe.optIn.denyAll()}>Deny All</button>
        </dd>
        <dt>Alloy Commands</dt>
        <dd>
          <button onClick={executeCommand("sendEvent")}>Send Event</button>
          <button onClick={executeCommand("getIdentity")}>Get Identity</button>
        </dd>
      </dl>
    </div>
  );
}
