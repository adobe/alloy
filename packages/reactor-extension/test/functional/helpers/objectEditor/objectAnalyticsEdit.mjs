/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import spectrum from "../spectrum.mjs";

const analyticsField = (type, dataTestId) => {
  return spectrum[type](
    `properties.data.properties.__adobe.properties.analytics.${dataTestId}`,
  );
};
const analyticsArrayField = (type, name, dataTestId) => (index) => {
  return spectrum[type](
    `properties.data.properties.__adobe.properties.analytics.value.${name}.${index}.${dataTestId}`,
  );
};

export const individualAttributesOption = analyticsField(
  "radio",
  "valuePartsOption",
);
export const entireObjectOption = analyticsField("radio", "valueWholeOption");
export const jsonEditor = analyticsField("textArea", "valueWhole");
export const eVarName = analyticsArrayField("comboBox", "evars", "evarField");
export const eVarAction = analyticsArrayField("picker", "evars", "actionField");
export const eVarValue = analyticsArrayField(
  "textField",
  "evars",
  "valueTextField",
);
export const eVarCopy = analyticsArrayField("comboBox", "evars", "copyField");
export const eVarAddButton = analyticsField("button", "value.evarsAddButton");

export const propName = analyticsArrayField("comboBox", "props", "propField");
export const propAction = analyticsArrayField("picker", "props", "actionField");
export const propValue = analyticsArrayField(
  "textField",
  "props",
  "valueTextField",
);
export const propCopy = analyticsArrayField("comboBox", "props", "copyField");
export const propAddButton = analyticsField("button", "value.propsAddButton");

export const eventName = analyticsArrayField(
  "comboBox",
  "events",
  "eventField",
);
export const eventId = analyticsArrayField(
  "textField",
  "events",
  "idTextField",
);
export const eventValue = analyticsArrayField(
  "textField",
  "events",
  "valueTextField",
);
export const eventAddButton = analyticsField("button", "value.eventsAddButton");

export const contextDataDataElementOption = analyticsField(
  "radio",
  "value.contextDataDataElementOption",
);
export const contextDataDataElementField = analyticsField(
  "textField",
  "value.contextDataDataElementField",
);
export const contextDataKey = analyticsArrayField(
  "textField",
  "contextData",
  "keyTextField",
);
export const contextDataValue = analyticsArrayField(
  "textField",
  "contextData",
  "valueTextField",
);
export const contextDataAddButton = analyticsField(
  "button",
  "value.contextDataAddButton",
);

export const additionalPropertiesName = analyticsArrayField(
  "comboBox",
  "additionalProperties",
  "propertyField",
);
export const additionalPropertiesValue = analyticsArrayField(
  "textField",
  "additionalProperties",
  "valueTextField",
);
export const additionalPropertiesAddButton = analyticsField(
  "button",
  "value.additionalPropertiesAddButton",
);
