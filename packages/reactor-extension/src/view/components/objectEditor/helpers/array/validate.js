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

export default ({
  formStateNode,
  confirmDataPopulatedAtCurrentOrDescendantNode,
  validate,
}) => {
  const { populationStrategy, value, items } = formStateNode;

  if (populationStrategy === WHOLE) {
    if (isFormStateValuePopulated(value)) {
      if (!singleDataElementRegex.test(value)) {
        return { value: "Value must be a data element." };
      }
      confirmDataPopulatedAtCurrentOrDescendantNode();
    }

    return undefined;
  }

  if (items) {
    const itemErrors = items.map((itemFormStateNode) => {
      let itemIsPopulated = false;
      let itemError = validate({
        formStateNode: itemFormStateNode,
        confirmDataPopulatedAtCurrentOrDescendantNode() {
          itemIsPopulated = true;
          confirmDataPopulatedAtCurrentOrDescendantNode();
        },
      });
      if (!itemIsPopulated && !itemError) {
        itemError = {
          value:
            "Items within arrays must not be empty. Please populate or remove the item.",
        };
      }
      return itemError;
    });
    if (itemErrors.filter((error) => error).length) {
      return { items: itemErrors };
    }
  }

  return undefined;
};
