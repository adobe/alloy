/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { WHOLE } from "../../constants/populationStrategy";
import isFormStateValuePopulated from "../isFormStateValuePopulated";
import singleDataElementRegex from "../../../../constants/singleDataElementRegex";
import { NONE } from "../../constants/autoPopulationSource";

export default ({
  formStateNode,
  confirmDataPopulatedAtCurrentOrDescendantNode,
  validate,
}) => {
  const { populationStrategy, value, properties } = formStateNode;

  if (populationStrategy === WHOLE) {
    if (isFormStateValuePopulated(value)) {
      if (!singleDataElementRegex.test(value)) {
        return { value: "Value must be a data element." };
      }
      confirmDataPopulatedAtCurrentOrDescendantNode();
    }

    return undefined;
  }

  if (properties) {
    const namesOfPopulatedProperties = new Set();
    const propertyErrors = {};
    const propertyNames = Object.keys(properties);

    propertyNames.forEach((propertyName) => {
      const propertyFormStateNode = properties[propertyName];
      const error = validate({
        formStateNode: propertyFormStateNode,
        confirmDataPopulatedAtCurrentOrDescendantNode() {
          namesOfPopulatedProperties.add(propertyName);
          confirmDataPopulatedAtCurrentOrDescendantNode();
        },
      });

      if (error) {
        propertyErrors[propertyName] = error;
      }
    });

    // Properties marked required are only actually required if the property's owning
    // object exists in the XDM payload. The owning object will only be included in
    // in the XDM payload if the object has at least one property with a populated value.
    // At this point in the code, we know the names of the object properties that
    // have a populated value. If at least one property has a populated value,
    // we know the owning object will exist in the XDM payload, so we need to
    // find any other properties in the object's schema that are required but
    // don't yet have values. We'll ensure that these properties are given an error
    // stating that the property is required.
    // https://jira.corp.adobe.com/browse/PDCL-4413
    if (namesOfPopulatedProperties.size) {
      propertyNames.forEach((propertyName) => {
        if (
          // If the property is already populated, it won't qualify for an error.
          !namesOfPopulatedProperties.has(propertyName) &&
          // If the property already has some other type of error, we won't
          // override it with a "required" error.
          !propertyErrors[propertyName]
        ) {
          const propertyFormStateNode = properties[propertyName];
          if (
            propertyFormStateNode.schema.isRequired &&
            propertyFormStateNode.autoPopulationSource === NONE
          ) {
            propertyErrors[propertyName] = {
              value: "This is a required field and must be populated.",
            };
          }
        }
      });
    }

    if (Object.keys(propertyErrors).length) {
      return { properties: propertyErrors };
    }
  }

  return undefined;
};
