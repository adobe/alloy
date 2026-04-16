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
import textField from "../forms/textField";
import objectArray from "../forms/objectArray";
import dataElement from "../forms/dataElement";
import comboBox from "../forms/comboBox";
import requiredComponent from "../forms/requiredComponent";

const applyPropositionsForm = requiredComponent(
  {
    requiredComponent: "personalization",
    title: "the Apply proposition action",
    whole: true,
  },
  [
    instancePicker({ name: "instanceName" }),
    dataElement({
      name: "propositions",
      label: "Propositions",
      description:
        'Provide a data element that resolves to an array of propositions to render. Enter "%event.propositions%" if this is an action of a Send event complete event.',
    }),
    textField({
      name: "viewName",
      label: "View name",
      description: "Provide a view to render the propositions for that view.",
    }),
    objectArray(
      {
        name: "metadata",
        label: "Proposition metadata",
        singularLabel: "Scope",
        dataElementDescription:
          "Provide a data element that resolves to an object scope keys, and object values with keys: selector and actionType.",
        objectKey: "scope",
        objectLabelPlural: "Scopes",
        isRowEmpty: ({ scope, selector, actionType }) =>
          scope === "" && selector === "" && actionType === "",
      },
      [
        textField({
          name: "scope",
          label: "Scope",
          description: "Enter your scope",
          validationSchemaBase: string().required("Please provide a scope."),
        }),
        textField({
          name: "selector",
          label: "Selector",
          description: "Enter your selector",
          validationSchemaBase: string().required("Please provide a selector."),
        }),
        comboBox({
          name: "actionType",
          label: "Action Type",
          description: "Select your action type",
          items: [
            { value: "setHtml", label: "Set HTML" },
            { value: "replaceHtml", label: "Replace HTML" },
            { value: "appendHtml", label: "Append HTML" },
            { value: "collectInteractions", label: "Collect interactions" },
          ],
          validationSchemaBase: string().required(
            "Please provide an action type.",
          ),
        }),
      ],
    ),
  ],
);

renderForm(applyPropositionsForm);
