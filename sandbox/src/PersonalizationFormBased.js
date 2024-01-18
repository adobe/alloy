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

import React, { useEffect, useState } from "react";
import { Heading, View, Button } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const SCOPES_FOR_PAGE = ["sandbox-personalization-page2"];

const metadata = {
  "sandbox-personalization-page2": {
    selector: "#form-based-personalization",
    actionType: "setHtml"
  }
};

const usePropositions = () => {
  const [propositions, setPropositions] = useState(undefined);
  useSendPageViewEvent({
    setPropositions,
    decisionScopes: SCOPES_FOR_PAGE // Note: this option will soon be deprecated, please use personalization.decisionScopes instead
  });
  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions,
        metadata
      });
    }
  });
};

const updateComponent = ({ renderCounter, setRenderCounter }) => {
  setRenderCounter(renderCounter + 1);
};

export default function Personalization() {
  const [renderCounter, setRenderCounter] = useState(0);
  usePropositions();
  return (
    <View>
      <ContentSecurityPolicy />
      <Heading level="1">Personalization</Heading>
      <Heading level="2">Number of times rendered: {renderCounter}</Heading>
      <Button
        onPress={() => updateComponent({ renderCounter, setRenderCounter })}
      >
        Re-render component
      </Button>
      <p>
        This page tests rendering of form-based activities, which need a
        user-provided selector and actionType in order to be properly rendered
        for a given scope. If you navigated here from another sandbox view, you
        will probably need to refresh your browser because this is how to
        properly simulate a non-SPA workflow.
      </p>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        id="form-based-personalization"
      >
        This is a form-based personalization placeholder. Personalized content
        has not been loaded.
      </View>
    </View>
  );
}
