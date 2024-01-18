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
import { Heading, View, Text } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

export default function PersonalizationAjo() {
  useSendPageViewEvent({ instanceName: "cjmProd" });
  return (
    <View>
      <ContentSecurityPolicy />
      <Heading level={1}>AJO Personalization</Heading>
      <Text>
        This page tests rendering of activities using an AJO surface. If you
        navigated here from another sandbox view, you will probably need to
        refresh your browser because this is how to properly simulate a non-SPA
        workflow.
      </Text>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        UNSAFE_className="personalization-container-ajo"
      >
        This is the AJO personalization placeholder. Personalized content has
        not been loaded.
      </View>
    </View>
  );
}
