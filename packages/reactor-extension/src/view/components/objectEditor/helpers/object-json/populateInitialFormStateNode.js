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

import singleDataElementRegex from "../../../../constants/singleDataElementRegex";
import { PARTS, WHOLE } from "../../constants/populationStrategy";

export default ({ formStateNode, value = {} }) => {
  formStateNode.isPartsPopulationStrategySupported = true;
  formStateNode.value = "";

  if (typeof value === "string" && singleDataElementRegex.test(value)) {
    formStateNode.populationStrategy = WHOLE;
    formStateNode.value = value;
  } else {
    formStateNode.populationStrategy = PARTS;
    formStateNode.items = Object.keys(value).reduce((accumulator, key) => {
      accumulator.push({ key, value: value[key] });
      return accumulator;
    }, []);
  }

  if (!formStateNode.items || formStateNode.items.length === 0) {
    formStateNode.items = [{ key: "", value: "" }];
  }
};
