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

import { EMPTY, FULL, PARTIAL, BLANK } from "../constants/populationAmount";
import { PARTS } from "../constants/populationStrategy";
import isFormStateValuePopulated from "./isFormStateValuePopulated";

const calculatePopulationAmountForPartsPopulationStrategy = (
  childrenTreeNodes,
) => {
  if (childrenTreeNodes && childrenTreeNodes.length) {
    const tally = childrenTreeNodes.reduce(
      (memo, childTreeNode) => {
        memo[childTreeNode.populationAmount] += 1;
        return memo;
      },
      {
        [FULL]: 0,
        [PARTIAL]: 0,
        [EMPTY]: 0,
        [BLANK]: 0,
      },
    );

    if (tally[FULL] === childrenTreeNodes.length) {
      return FULL;
    }

    if (tally[FULL] > 0 || tally[PARTIAL] > 0) {
      return PARTIAL;
    }
  }

  return EMPTY;
};

export default ({
  formStateNode,
  isAncestorUsingWholePopulationStrategy,
  childrenTreeNodes,
}) => {
  const { populationStrategy, value } = formStateNode;

  if (isAncestorUsingWholePopulationStrategy) {
    return BLANK;
  }

  if (populationStrategy === PARTS) {
    return calculatePopulationAmountForPartsPopulationStrategy(
      childrenTreeNodes,
    );
  }

  if (isFormStateValuePopulated(value)) {
    return FULL;
  }

  return EMPTY;
};
