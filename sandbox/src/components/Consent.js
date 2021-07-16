import React from "react";
import useSendPageViewEvent from "./useSendPageViewEvent";
import Configuration from "./Configuration";
import Cookies from "./Cookies";
import { Button } from "./Button";
import { TBody } from "./Table";

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
    <div>
      <h1>Consent</h1>
      <h2>Opt-In</h2>
      <h4>This page tests user consent:</h4>
      <h4>Current Configuration:</h4>
      <dd>
        <Configuration />
      </dd>
      <h4>Cookies:</h4>
      <dd>
        <Cookies />
      </dd>
      <h4>Adobe 1.0</h4>
      <dd>
        <TBody>
          <Button onClick={executeCommand("setConsent", adobe1Consent("in"))}>
            In
          </Button>
          &nbsp;
          <Button onClick={executeCommand("setConsent", adobe1Consent("out"))}>
            Out
          </Button>
          &nbsp;
        </TBody>
      </dd>
      <h4>Adobe 2.0</h4>
      <dd>
        <TBody>
          <Button
            onClick={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y" })
            )}
          >
            Collect="y"
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "n" })
            )}
          >
            Collect="n"
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y", personalize: "y" })
            )}
          >
            Collect="y" Personalize="y"
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand(
              "setConsent",
              adobe2Consent({ collect: "y", personalize: "n" })
            )}
          >
            Collect="y" Personalize="n"
          </Button>
          &nbsp;
        </TBody>
      </dd>
      <h4>IAB TCF 2.0</h4>
      <dd>
        <TBody>
          <Button
            onClick={executeCommand("setConsent", iabConsent(IAB_OPT_IN))}
          >
            In
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand("setConsent", iabConsent(IAB_OPT_OUT))}
          >
            Out
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand(
              "setConsent",
              iabConsent(IAB_OPT_IN_GOOGLE_VENDOR)
            )}
          >
            Google Vendor In
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand(
              "setConsent",
              iabConsent(IAB_OPT_OUT_GOOGLE_VENDOR)
            )}
          >
            Google Vendor Out
          </Button>
          &nbsp;
        </TBody>
      </dd>
      <h4>Adobe 2.0 and IAB TCF 2.0</h4>
      <dd>
        <TBody>
          <Button
            onClick={executeCommand(
              "setConsent",
              mergeConsent(
                adobe2Consent({ collect: "y" }),
                iabConsent(IAB_OPT_IN)
              )
            )}
          >
            In
          </Button>
          &nbsp;
          <Button
            onClick={executeCommand(
              "setConsent",
              mergeConsent(
                adobe2Consent({ collect: "n" }),
                iabConsent(IAB_OPT_OUT)
              )
            )}
          >
            Out
          </Button>
          &nbsp;
        </TBody>
      </dd>
      <h4>Legacy Opt-in Object</h4>
      <dd>
        <TBody>
          <Button onClick={() => window.adobe.optIn.approveAll()}>
            Approve All
          </Button>
          &nbsp;
          <Button onClick={() => window.adobe.optIn.denyAll()}>Deny All</Button>
          &nbsp;
        </TBody>
      </dd>
      <h4>Alloy Commands</h4>
      <dd>
        <TBody>
          <Button onClick={executeCommand("sendEvent")}>Send Event</Button>
          &nbsp;
          <Button onClick={executeCommand("getIdentity")}>Get Identity</Button>
        </TBody>
      </dd>
    </div>
  );
}
