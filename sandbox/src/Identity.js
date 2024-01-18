/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/* eslint-disable no-console, func-names */

import React, { useEffect, useState } from "react";
import { Heading, View, Button, Text, Link } from "@adobe/react-spectrum";
import { TableView, TableBody, Row, Cell } from "@react-spectrum/table";

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
  const value = cookies.kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity;
  if (!value) {
    return "None";
  }
  const decoded = atob(value.substring(0, 60));
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
  window.alloy("appendIdentityToUrl", { url }).then(({ url: newUrl }) => {
    document.location = newUrl;
  });
};

const removeUrlParameter = name => {
  const escapedName = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp(`[\\?&]${escapedName}=([^&#]*)`);
  return document.location.search.replace(regex, "").replace(/^&/, "?");
};
const searchWithoutAdobeMc = removeUrlParameter("adobe_mc");

const otherHost =
  document.location.hostname === "alloyio.com" ? "alloyio2.com" : "alloyio.com";

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
    <View>
      <Heading level="1">Identity</Heading>
      <View>
        <Text>
          This page demonstrates recieving or sending identity within the URL.
          No calls to experience edge are made until you press one of the
          buttons below. The table shows the current and original identities. If
          you click on the link on the bottom, it will generate a link to
          another domain with the ID included in the URL.
        </Text>
      </View>
      <View>
        <Button onPress={getIdentity(wrappedSetIdentity)}>Get Identity</Button>
        <Button onPress={sendEvent(wrappedSetIdentity)}>Send Event</Button>
        <Button onPress={setConsent(wrappedSetIdentity)}>Set Consent</Button>
      </View>
      <View>
        <TableView>
          <TableBody>
            <Row>
              <Cell>Original Identity Cookie</Cell>
              <Cell>
                <Text>{originalIdentityCookie}</Text>
              </Cell>
            </Row>
            <Row>
              <Cell>Current Identity Cookie</Cell>
              <Cell>
                <Text>{currentIdentityCookie}</Text>
              </Cell>
            </Row>
            <Row>
              <Cell>Identity from Web SDK</Cell>
              <Cell>
                <Text>{identity}</Text>
              </Cell>
            </Row>
          </TableBody>
        </TableView>
      </View>
      <View>
        <Link href={`/Identity${searchWithoutAdobeMc}`}>
          Web SDK identity page
        </Link>
        <br />
        <Link href={`/legacy.html${searchWithoutAdobeMc}`}>
          Legacy identity page
        </Link>
        <br />
        <Link
          href={`https://${otherHost}/identity${searchWithoutAdobeMc}`}
          onClick={appendIdentityToUrl}
        >
          Cross domain Web SDK identity page
        </Link>
        <br />
        <Link
          href={`https://${otherHost}/legacy.html${searchWithoutAdobeMc}`}
          onClick={appendIdentityToUrl}
        >
          Cross domain legacy identity page
        </Link>
        <br />
      </View>
    </View>
  );
}
