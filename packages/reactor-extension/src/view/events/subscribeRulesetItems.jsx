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
import { string } from "yup";
import renderForm from "../forms/renderForm";
import instancePicker from "../forms/instancePicker";
import fieldArray from "../forms/fieldArray";
import { validateSurface } from "../utils/surfaceUtils";
import notice from "../forms/notice";
import requiredComponent from "../forms/requiredComponent";

const subscribeRulesetItemsForm = requiredComponent(
  {
    requiredComponent: "personalization",
    title: "the Subscribe ruleset items event",
    whole: true,
  },
  [
    notice({
      title: "Subscribe ruleset items",
      description:
        "This event will trigger the rule whenever there are ruleset items that have matched. This is a good place to add an action to render the ruleset items. You can use the data element `%event.propositions%` to access the propositions. Or within a custom code action it is available as `event.propositions`.",
    }),
    instancePicker({ name: "instanceName" }),
    fieldArray({
      name: "schemas",
      label: "Schemas",
      singularLabel: "Schema",
      description: "Create an array of schemas to filter the ruleset items",
      dataElementDescription:
        "This data element should resolve to an array of schemas.",
      fieldItems: [
        {
          value: "https://ns.adobe.com/personalization/default-content-item",
          label: "Default content item",
        },
        {
          value: "https://ns.adobe.com/personalization/dom-action",
          label: "Dom action",
        },
        {
          value: "https://ns.adobe.com/personalization/html-content-item",
          label: "HTML content item",
        },
        {
          value: "https://ns.adobe.com/personalization/message/in-app",
          label: "In app message",
        },
        {
          value: "https://ns.adobe.com/personalization/message/content-card",
          label: "Content Card",
        },
        {
          value: "https://ns.adobe.com/personalization/json-content-item",
          label: "JSON content item",
        },
        {
          value: "https://ns.adobe.com/personalization/measurement",
          label: "Measurement item",
        },
        {
          value: "https://ns.adobe.com/personalization/message/native-alert",
          label: "Native alert message",
        },
        {
          value: "https://ns.adobe.com/personalization/redirect-item",
          label: "Redirect item",
        },
        {
          value: "https://ns.adobe.com/personalization/ruleset-item",
          label: "Ruleset item",
        },
      ],
    }),
    fieldArray({
      name: "surfaces",
      label: "Surfaces",
      singularLabel: "Surface",
      description: "Create an array of surfaces to filter the ruleset items.",
      dataElementDescription:
        "This data element should resolve to an array of surfaces.",
      validationSchema: string().test(
        "is-surface",
        () => "Please provide a valid surface",
        (value, testContext) => {
          const message = validateSurface(value);
          if (message) {
            return testContext.createError({ message });
          }
          return true;
        },
      ),
    }),
  ],
);

renderForm(subscribeRulesetItemsForm);
