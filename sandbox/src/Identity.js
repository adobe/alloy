/*
 Copyright 2022 Adobe. All rights reserved.
 This file is licensed to you under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License. You may obtain a copy
 of the License at http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software distributed under
 the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 OF ANY KIND, either express or implied. See the License for the specific language
 governing permissions and limitations under the License.
 */

import React, { useEffect, useState } from "react";

const getQueryStringParameter = key => {
  var searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(key);
};

const urlWithUpdatedQueryStringParameter = (key, value, defaultValue) => {
  var searchParams = new URLSearchParams(window.location.search);
  if (value !== defaultValue) {
    searchParams.set(key, value);
  } else {
    searchParams.delete(key);
  }
  return window.location.pathname + "?" + searchParams;
};

const readCookies = () => {
  const cookies = {};
  document.cookie.split(";").forEach(function(c) {
    const ct = c.trim();
    const index = ct.indexOf("=");
    const key = ct.slice(0, index);
    const value = ct.slice(index + 1);
    cookies[key] = value;
  });
  return cookies;
};
const readIdentityCookie = () => {
  const cookies = readCookies();
  const value = cookies["kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity"];
  if (!value) {
    return "None";
  }
  const decoded = Buffer.from(value, "base64").toString();
  return decoded.substring(2, 40);
};

const getIdentity = setIdentity => () => {
  window.alloy("getIdentity", { namespaces: ["ECID"] }).then(function(result) {
    if (result.identity) {
      console.log(
        "Sandbox: Get Identity command has completed.",
        result.identity.ECID
      );
      setIdentity(result.identity.ECID);
    } else {
      console.log(
        "Sandbox: Get Identity command has completed but no identity was provided in the result (possibly due to lack of consent)."
      );
      setIdentity("No Identity");
    }
  });
};

const sendEvent = setIdentity => () => {
  window.alloy("sendEvent", {}).then(getIdentity(setIdentity));
};

const setConsent = setIdentity => () => {
  window
    .alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "2.0",
          value: {
            collect: {
              val: "y"
            }
          }
        }
      ]
    })
    .then(getIdentity(setIdentity));
};

const appendIdentityToUrl = event => {
  const url = event.target.href;
  event.preventDefault();
  window.alloy("appendIdentityToUrl", { url }).then(({ url }) => {
    document.location = url;
  });
};

const linkedUrl = new URL(window.location.href);
linkedUrl.protocol = "https";
linkedUrl.port = "";
linkedUrl.host =
  linkedUrl.host === "alloyio2.com" ? "alloyio.com" : "alloyio2.com";

const idOverwriteEnabled =
  getQueryStringParameter("idOverwriteEnabled") === "true";

export default function Identity() {
  const [originalIdentityCookie, setOriginalIdentityCookie] = useState("");
  const [currentIdentityCookie, setCurrentIdentityCookie] = useState("");
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    const ecid = readIdentityCookie();
    setOriginalIdentityCookie(ecid);
    setCurrentIdentityCookie(ecid);
  }, []);

  const wrappedSetIdentity = ecid => {
    setIdentity(ecid);
    setCurrentIdentityCookie(readIdentityCookie());
  };

  return (
    <div>
      <h1>Identity</h1>
      <section>
        This page demonstrates recieving or sending identity within the URL. The
        current value of the `idOverwriteEnabled` configuration parameter is
        shown in the first table. No calls to experience edge are made until you
        press one of the buttons below. The second table shows the current and
        original identities. If you click on the link on the bottom, it will
        generate a link to another domain with the ID included in the URL.
      </section>
      <section>
        <table>
          <tbody>
            <tr>
              <td>idOverwriteEnabled</td>
              <td>{idOverwriteEnabled ? "true" : "false"}</td>
              <td>
                {idOverwriteEnabled ? (
                  <a
                    href={urlWithUpdatedQueryStringParameter(
                      "idOverwriteEnabled",
                      "false",
                      "false"
                    )}
                  >
                    Disable
                  </a>
                ) : (
                  <a
                    href={urlWithUpdatedQueryStringParameter(
                      "idOverwriteEnabled",
                      "true",
                      "false"
                    )}
                  >
                    Enable
                  </a>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <button onClick={getIdentity(wrappedSetIdentity)}>Get Identity</button>
        <button onClick={sendEvent(wrappedSetIdentity)}>Send Event</button>
        <button onClick={setConsent(wrappedSetIdentity)}>Set Consent</button>
      </section>
      <section>
        <table>
          <tbody>
            <tr>
              <td>Original Identity Cookie</td>
              <td>
                <pre>{originalIdentityCookie}</pre>
              </td>
            </tr>
            <tr>
              <td>Current Identity Cookie</td>
              <td>
                <pre>{currentIdentityCookie}</pre>
              </td>
            </tr>
            <tr>
              <td>Identity from Web SDK</td>
              <td>
                <pre>{identity}</pre>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <a href={linkedUrl.toString()} onClick={appendIdentityToUrl}>
          Cross domain linked identity.
        </a>
      </section>
    </div>
  );
}
