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

/* eslint-disable no-console */

import React, { useEffect } from "react";
import { Heading, View } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";

export default function RedirectedNewPage() {
  useEffect(() => {
    window
      .alloy("sendEvent", {
        renderDecisions: true
      })
      .then(({ decisions = [] }) => {
        console.log("personalized decisions on the redirected view", decisions);
      });
  }, []);
  return (
    <View className="personalization-container">
      <ContentSecurityPolicy />
      <View>
        <Heading level="1">You have qualified for the redirect offer</Heading>
        <Heading level="2">Here are the newer offers!</Heading>
      </View>
    </View>
  );
}
