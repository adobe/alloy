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
import renderForm from "../forms/renderForm";
import instancePicker from "../forms/instancePicker";
import checkbox from "../forms/checkbox";
import simpleMap from "../forms/simpleMap";
import notice from "../forms/notice";
import requiredComponent from "../forms/requiredComponent";

const wrapGetInitialValues =
  (getInitialValues) =>
  ({ initInfo }) => {
    const { personalization = {}, ...otherSettings } = initInfo.settings || {};
    return getInitialValues({
      initInfo: {
        ...initInfo,
        settings: { ...personalization, ...otherSettings },
      },
    });
  };

const wrapGetSettings =
  (getSettings) =>
  ({ values }) => {
    const { decisionContext, ...settings } = getSettings({ values });
    if (decisionContext) {
      settings.personalization = {};
      settings.personalization.decisionContext = decisionContext;
    }
    return settings;
  };

const evaluateRulesetsForm = requiredComponent(
  {
    requiredComponent: "rulesEngine",
    title: "the Evaluate rulesets action",
    whole: true,
    wrapGetInitialValues,
    wrapGetSettings,
  },
  [
    notice({
      title: "Evaluate rulesets action",
      description:
        "This action manually triggers ruleset evaluation. Rulesets are returned by Adobe Journey Optimizer to support features like in-browser messages.",
    }),
    instancePicker({ name: "instanceName" }),
    checkbox({
      name: "renderDecisions",
      label: "Render visual personalization decisions",
      description:
        "Check this to render visual personalization decisions for the ruleset items that match.",
      defaultValue: false,
    }),
    simpleMap({
      name: "decisionContext",
      label: "Decision context",
      singularLabel: "Context item",
      description:
        "Provide the keys and values that the rulesets will use to determine which experience to deliver.",
      dataElementDescription:
        "Provide a data element that resolves to a map of key/value pairs.",
      keyLabel: "Key",
      keyLabelPlural: "Keys",
      keyDescription: "Enter the context key.",
      valueLabel: "Value",
      valueDescription: "Enter the context value.",
    }),
  ],
);

renderForm(evaluateRulesetsForm);
