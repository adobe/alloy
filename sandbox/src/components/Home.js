import React from "react";
import useSendPageViewEvent from "./useSendPageViewEvent";
import { Button } from "./Button";

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
      <h2>Home</h2>
      <section>
        <h4>Get Identity</h4>
        <div>
          <Button onClick={getIdentity}>Get ECID</Button>
        </div>
      </section>
      <section>
        <h4>Collect data by overriding the Dataset configured in Config UI</h4>
        <div>
          <Button onClick={sendDataToSecondaryDataset}>
            Send Event to Secondary Dataset
          </Button>
        </div>
      </section>
    </div>
  );
}
