/* eslint-disable no-console, func-names */

import React from "react";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const getIdentity = () => {
  window.alloy("getIdentity", { namespaces: ["ECID"] }).then(function(result) {
    if (result.identity) {
      console.log(
        "Sandbox: Get Identity command has completed.",
        result.identity.ECID
      );
    } else {
      console.log(
        "Sandbox: Get Identity command has completed but no identity was provided in the result (possibly due to lack of consent)."
      );
    }
  });
};

const sendDataToSecondaryDataset = () => {
  window.alloy("sendEvent", {
    datasetId: "5eb9aaa6a3b16e18a818e06f"
  });
};

export default function Home() {
  useSendPageViewEvent();
  return (
    <div>
      <ContentSecurityPolicy />
      <Heading level={1}>Home</Heading>
      <section>
        <h2>Get Identity</h2>
        <div>
          <button onClick={getIdentity}>Get ECID</button>
        </div>
      </section>
      <section>
        <h2>Collect data by overriding the Dataset configured in Config UI</h2>
        <div>
          <button onClick={sendDataToSecondaryDataset}>
            Send Event to Secondary Dataset
          </button>
        </div>
      </section>
    </div>
  );
}
