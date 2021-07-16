"use strict";
import React, { useEffect, useState } from "react";
import { Table, TBody, Td, Tr } from "../Table";
import { Button } from "../Button";

const isBrowser = typeof window !== "undefined";

const KONDUCTOR_COOKIE_PREFIX = "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_";
const LEGACY_IDENTITY_COOKIE = "AMCV_5BFE274A5F6980A50A495C08%40AdobeOrg";

let cookies;
const refreshCookies = () => {
  cookies = {};
  if (isBrowser) {
    document.cookie.split(";").forEach(function(c) {
      const ct = c.trim();
      const index = ct.indexOf("=");
      const key = ct.slice(0, index);
      const value = ct.slice(index + 1);
      cookies[key] = value;
    });
  }
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

const monitor = {};
if (isBrowser) {
  window.__alloyMonitors = window.__alloyMonitors || [];
  window.__alloyMonitors.push(monitor);
}

export default () => {
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

  useEffect(() => {
    monitor.onCommandResolved = refreshCookieState;
    monitor.onCommandRejected = refreshCookieState;
  });

  const clearCookie = key => () => {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    refreshCookieState();
  };

  return (
    <Table>
      <TBody>
        <Tr>
          <Td>Consent Cookie</Td>
          <Td>{consent}</Td>
          <Td>
            <Button
              onClick={clearCookie(`${KONDUCTOR_COOKIE_PREFIX}consent`)}
              disabled={consent === undefined}
            >
              Delete
            </Button>
          </Td>
        </Tr>
        <Tr>
          <Td>Has Consent Check Cookie</Td>
          <Td>{hasConsentCheck ? "true" : "false"}</Td>
          <Td>
            <Button
              onClick={clearCookie(`${KONDUCTOR_COOKIE_PREFIX}consent_check`)}
              disabled={!hasConsentCheck}
            >
              Delete
            </Button>
          </Td>
        </Tr>
        <Tr>
          <Td>Has Identity Cookie</Td>
          <Td>{hasIdentity ? "true" : "false"}</Td>
          <Td>
            <Button
              onClick={clearCookie(`${KONDUCTOR_COOKIE_PREFIX}identity`)}
              disabled={!hasIdentity}
            >
              Delete
            </Button>
          </Td>
        </Tr>
        <Tr>
          <Td>Has Legacy Identity Cookie</Td>
          <Td>{hasLegacyIdentity ? "true" : "false"}</Td>
          <Td>
            <Button
              onClick={clearCookie(LEGACY_IDENTITY_COOKIE)}
              disabled={!hasLegacyIdentity}
            >
              Delete
            </Button>
          </Td>
        </Tr>
      </TBody>
    </Table>
  );
};
