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
import analyticsForm from "./analyticsForm";
import anyErrorsTouched from "../anyErrorsTouched";
import { PARTS, WHOLE } from "../../constants/populationStrategy";

const computePopulationAmount = ({
  formStateNode,
  isAncestorUsingWholePopulationStrategy,
}) => {
  if (isAncestorUsingWholePopulationStrategy) {
    return BLANK;
  }

  const { value = {} } = analyticsForm.getSettings({ values: formStateNode });
  if (Object.keys(value).length > 0) {
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
  if (
    (formStateNode.populationStrategy === WHOLE &&
      errors?.wholeValue &&
      touched?.wholeValue) ||
    (formStateNode.populationStrategy === PARTS &&
      anyErrorsTouched(errors?.value, touched?.value))
  ) {
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
