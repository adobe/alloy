/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { useEffect } from "react";

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;

export default ({
  instanceName = "alloy",
  renderDecisions = false,
  viewName,
  data = {},
  xdm = {},
  decisionScopes,
  setPropositions,
} = {}) => {
  useEffect(() => {
    xdm.eventType = "page-view";

    if (viewName) {
      xdm.web = {
        webPageDetails: {
          viewName,
        },
      };
    }

    window[instanceName]("sendEvent", {
      renderDecisions,
      decisionScopes, // Note: this option will soon be deprecated, please use personalization.decisionScopes instead
      xdm,
      data,
    }).then((res) => {
      const { propositions } = res;
      if (setPropositions && isNonEmptyArray(propositions)) {
        setPropositions(propositions);
      }
    });
  }, [
    JSON.stringify(data),
    decisionScopes,
    instanceName,
    setPropositions,
    viewName,
    JSON.stringify(xdm),
  ]);
};
