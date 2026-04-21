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

import computePopulationNote from "../computePopulationNote";
import { EMPTY, FULL, BLANK } from "../../constants/populationAmount";
import { WHOLE, PARTS } from "../../constants/populationStrategy";
import anyErrorsTouched from "../anyErrorsTouched";

const isFormStateValuePopulated = ({ value, items, populationStrategy }) => {
  if (populationStrategy === WHOLE && value !== "") {
    return true;
  }

  if (
    populationStrategy === PARTS &&
    (items.length > 1 ||
      (items.length === 1 && (items[0].key || items[0].value)))
  ) {
    return true;
  }

  return false;
};

const computePopulationAmount = ({
  formStateNode,
  isAncestorUsingWholePopulationStrategy,
}) => {
  if (isAncestorUsingWholePopulationStrategy) {
    return BLANK;
  }

  if (isFormStateValuePopulated(formStateNode)) {
    return FULL;
  }

  return EMPTY;
};

export default ({
  treeNode,
  formStateNode,
  isAncestorUsingWholePopulationStrategy,
  confirmTouchedAtCurrentOrDescendantNode,
  errors,
  touched,
}) => {
  if (anyErrorsTouched(errors, touched)) {
    confirmTouchedAtCurrentOrDescendantNode();
  }

  treeNode.populationAmount = computePopulationAmount({
    formStateNode,
    isAncestorUsingWholePopulationStrategy,
  });

  treeNode.infoTip = computePopulationNote({
    formStateNode,
    isAncestorUsingWholePopulationStrategy,
  });
};
