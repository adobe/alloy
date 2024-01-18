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

import React from "react";
import { Heading, View, Button } from "@adobe/react-spectrum";
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
    <View>
      <ContentSecurityPolicy />
      <Heading level="1">Home</Heading>
      <section>
        <Heading level="2">Get Identity</Heading>
        <View>
          <Button onPress={getIdentity}>Get ECID</Button>
        </View>
      </section>
      <section>
        <Heading level="2">
          Collect data by overriding the Dataset configured in Config UI
        </Heading>
        <View>
          <Button onPress={sendDataToSecondaryDataset}>
            Send Event to Secondary Dataset
          </Button>
        </View>
      </section>
    </View>
  );
}
