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
      id: string().required(),
      scope: string().required(),
      scopeDetails: objectOf({
        decisionProvider: string().required()
      }).required(),
      items: arrayOf(
        objectOf({
          id: string().required(),
          schema: string().required(),
          data: objectOf({ content: anything().required() }).required()
        })
      )
        .required()
        .nonEmpty()
    }).required(),
    element: anything(),
    selector: string()
  }).noUnknownFields();

  return validator(options);
};

export default ({
  autoTrackPropositionInteractions,
  storeInteractionMeta,
  createProposition
}) => {
  const run = ({ proposition: propositionJSON, element, selector }) => {
    let elements;

    try {
      elements = isDomElement(element) ? [element] : selectNodes(selector);
      if (elements.length === 0) {
        return Promise.reject(new Error("Invalid DOM element!"));
      }
    } catch (err) {
      return Promise.reject(new Error("Invalid DOM element!"));
    }

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
