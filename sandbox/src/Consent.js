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

import React from "react";
import { Heading, View, Button } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";
import "./Consent.css";
import Configuration from "./components/Configuration";
import Cookies from "./components/Cookies";

const IAB_OPT_IN =
  "CO1Z4yuO1Z4yuAcABBENArCsAP_AAH_AACiQGCNX_T5eb2vj-3Zdt_tkaYwf55y3o-wzhhaIse8NwIeH7BoGP2MwvBX4JiQCGBAkkiKBAQdtHGhcCQABgIhRiTKMYk2MjzNKJLJAilsbe0NYCD9mnsHT3ZCY70--u__7P3fAwQgkwVLwCRIWwgJJs0ohTABCOICpBwCUEIQEClhoACAnYFAR6gAAAIDAACAAAAEEEBAIABAAAkIgAAAEBAKACIBAACAEaAhAARIEAsAJEgCAAVA0JACKIIQBCDgwCjlACAoAAAAA.YAAAAAAAAAAA";
const IAB_OPT_OUT =
  "CO1Z5evO1Z5evAcABBENArCgAAAAAH_AACiQGCNX_T5eb2vj-3Zdt_tkaYwf55y3o-wzhhaIse8NwIeH7BoGP2MwvBX4JiQCGBAkkiKBAQdtHGhcCQABgIhRiTKMYk2MjzNKBLJAilsbe0NYCD9mnsHT3ZCY70--u__7P3fAwQgkwVLwCRIWwgJJs0ohTABCOICpBwCUEIQEClhoACAnYFAR6gAAAIDAACAAAAEEEBAIABAAAkIgAAAEBAKACIBAACAEaAhAARIEAsAJEgCAAVA0JACKIIQBCDgwCjlACAoAAAAA.YAAAAAAAAAAA";
const IAB_OPT_IN_GOOGLE_VENDOR =
  "CO2ISm8O2IbZcAVAMBFRACBsAIBAAAAgEIYgGPtjup3rYdY178JUkiCIFabBlBymqcio5Ao1cEACRNnQIUAIyhKBCQmaUqJBKhQRWBDAQtQwBCB06EBmgIQNUmkj1MQGQgCRKSF7BmQBEwQMCagoBDeRAAo-kIhkLCAAqO0E_AB4F5wAgEagLzAA";
const IAB_OPT_OUT_GOOGLE_VENDOR =
  "CO2IS8PO2IbuvAVAMBFRACBsAIBAAAAgEIYgGQBiNh14tYnCZ-5fXnRqprc2dYaErJs0dFpVJBA0ALi95QggwAQXEIa4JmghQMIEJASUkIIMEjHIgsJSyMEIAMIgjpJqrggEIFVAIIgPDKAULEQQkBQcCCC2mhZURCaVE0AVLMF0CNYAICNQAA==";

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

const adobe2Consent = ({ collect, personalize }) => {
  const setConsentOptions = {
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
  if (personalize) {
    setConsentOptions.consent[0].value.personalize = {
      content: {
        val: personalize
      }
    };
  }
  return setConsentOptions;
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

const mergeConsent = (...consentObjects) => {
  return consentObjects.reduce(
    (memo, { consent }) => {
      memo.consent = memo.consent.concat(consent);
      return memo;
    },
    { consent: [] }
  );
};

const executeCommand = (command, options = {}) => () => {
  window.alloy(command, options);
};

export default function Consent() {
  useSendPageViewEvent();

  return (
    <View>
      <ContentSecurityPolicy />
      <Heading level={1}>Consent</Heading>
      <Heading level={2}>Opt-In</Heading>
      <p>This page tests user consent:</p>

      <dl>
        <dt>Current Configuration:</dt>
        <dd>
          <Configuration />
        </dd>
        <dt>Cookies:</dt>
        <dd>
          <Cookies />
        </dd>
        <dt>Adobe 1.0</dt>
        <dd>
          <Button onPress={executeCommand("setConsent", adobe1Consent("in"))}>
            In
          </Button>
          <Button onPress={executeCommand("setConsent", adobe1Consent("out"))}>
            Out
          </Button>
        </dd>
        <dt>Adobe 2.0</dt>
        <dd>
          <Button
            onPress={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y" })
            )}
          >
            Collect="y"
          </Button>
          <Button
            onPress={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "n" })
            )}
          >
            Collect="n"
          </Button>
          <Button
            onPress={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y", personalize: "y" })
            )}
          >
            Collect="y" Personalize="y"
          </Button>
          <Button
            onPress={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y", personalize: "n" })
            )}
          >
            Collect="y" Personalize="n"
          </Button>
        </dd>
        <dt>IAB TCF 2.0</dt>
        <dd>
          <Button
            onPress={executeCommand("setConsent", iabConsent(IAB_OPT_IN))}
          >
            In
          </Button>
          <Button
            onPress={executeCommand("setConsent", iabConsent(IAB_OPT_OUT))}
          >
            Out
          </Button>
          <Button
            onPress={executeCommand(
              "setConsent",
              iabConsent(IAB_OPT_IN_GOOGLE_VENDOR)
            )}
          >
            Google Vendor In
          </Button>
          <Button
            onPress={executeCommand(
              "setConsent",
              iabConsent(IAB_OPT_OUT_GOOGLE_VENDOR)
            )}
          >
            Google Vendor Out
          </Button>
        </dd>
        <dt>Adobe 2.0 and IAB TCF 2.0</dt>
        <dd>
          <Button
            onPress={executeCommand(
              "setConsent",
              mergeConsent(
                adobe2Consent({ collect: "y" }),
                iabConsent(IAB_OPT_IN)
              )
            )}
          >
            In
          </Button>
          <Button
            onPress={executeCommand(
              "setConsent",
              mergeConsent(
                adobe2Consent({ collect: "n" }),
                iabConsent(IAB_OPT_OUT)
              )
            )}
          >
            Out
          </Button>
        </dd>
        <dt>Legacy Opt-in Object</dt>
        <dd>
          <Button onPress={() => window.adobe.optIn.approveAll()}>
            Approve All
          </Button>
          <Button onPress={() => window.adobe.optIn.denyAll()}>Deny All</Button>
        </dd>
        <dt>Alloy Commands</dt>
        <dd>
          <Button onPress={executeCommand("sendEvent")}>Send Event</Button>
          <Button onPress={executeCommand("getIdentity")}>Get Identity</Button>
        </dd>
      </dl>
    </View>
  );
}
