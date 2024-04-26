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
import { anything, arrayOf, objectOf, string } from "../../utils/validation";
import createDecorateProposition from "./handlers/createDecorateProposition";
import { includes } from "../../utils";
import { HTML_CONTENT_ITEM, JSON_CONTENT_ITEM } from "../../constants/schema";
import isDomElement from "./dom-actions/dom/isDomElement";
import selectNodes from "../../utils/dom/selectNodes";

const validateOptions = ({ options }) => {
  const validator = objectOf({
    proposition: objectOf({
      id: string(),
      scope: string(),
      scopeDetails: anything(),
      items: arrayOf(anything())
    }).required(),
    element: anything(),
    selector: string()
  }).noUnknownFields();

  return validator(options);
};

const REQUIRED_FIELDS_PROPOSITION = ["id", "scope", "scopeDetails", "items"];
const REQUIRED_FIELDS_ITEM = ["id", "schema", "data"];

const checkMalformedPropositionJSON = propositionJSON => {
  for (let i = 0; i < REQUIRED_FIELDS_PROPOSITION.length; i += 1) {
    if (
      !Object.hasOwnProperty.call(
        propositionJSON,
        REQUIRED_FIELDS_PROPOSITION[i]
      )
    ) {
      return new Error(
        `Proposition object is missing "${REQUIRED_FIELDS_PROPOSITION[i]}" field`
      );
    }
  }

  const { items } = propositionJSON;

  if (!Array.isArray(items)) {
    return new Error(`Proposition items must be an Array`);
  }

  for (let i = 0; i < items.length; i += 1) {
    for (let j = 0; j < REQUIRED_FIELDS_ITEM.length; j += 1) {
      if (!Object.hasOwnProperty.call(items[i], REQUIRED_FIELDS_ITEM[j])) {
        return new Error(
          `Proposition item is missing "${REQUIRED_FIELDS_ITEM[j]}" field`
        );
      }
    }
  }

  return undefined;
};

export default ({
  autoTrackPropositionInteractions,
  storeInteractionMeta,
  createProposition
}) => {
  const run = ({ proposition: propositionJSON, element, selector }) => {
    const error = checkMalformedPropositionJSON(propositionJSON);

    if (error) {
      return Promise.reject(error);
    }

    const elements = isDomElement(element) ? [element] : selectNodes(selector);

    const proposition = createProposition(propositionJSON);

    proposition
      .getItems()
      .filter(item =>
        includes([HTML_CONTENT_ITEM, JSON_CONTENT_ITEM], item.getSchema())
      )
      .forEach(item => {
        const decorateProposition = createDecorateProposition(
          autoTrackPropositionInteractions,
          item.getSchemaType(),
          proposition.getId(),
          item.getId(),
          item.getTrackingLabel(),
          proposition.getScopeType(),
          proposition.getNotification(),
          storeInteractionMeta
        );
        elements.forEach(el => decorateProposition(el));
      });

    return Promise.resolve();
  };

  const optionsValidator = options => validateOptions({ options });

  return {
    command: {
      optionsValidator,
      run
    }
  };
};
