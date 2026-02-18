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

import numberAwareCompareFunction from "../../../../utils/numberAwareCompareFunction";
import { WHOLE } from "../../constants/populationStrategy";
import computePopulationAmount from "../computePopulationAmount";
import computePopulationNote from "../computePopulationNote";

export default ({
  treeNode,
  formStateNode,
  treeNodeComponent,
  isAncestorUsingWholePopulationStrategy,
  confirmTouchedAtCurrentOrDescendantNode,
  errors,
  touched,
  getTreeNode,
}) => {
  const { properties, populationStrategy, schema } = formStateNode;

  if (properties && schema.properties) {
    const propertyNames = Object.keys(schema.properties);
    if (propertyNames.length) {
      treeNode.children = propertyNames
        .sort(numberAwareCompareFunction)
        .map((propertyName) => {
          const propertyFormStateNode = properties[propertyName];
          const childNode = getTreeNode({
            formStateNode: propertyFormStateNode,
            treeNodeComponent,
            displayName: propertyName,
            isAncestorUsingWholePopulationStrategy:
              isAncestorUsingWholePopulationStrategy ||
              populationStrategy === WHOLE,
            notifyParentOfTouched: confirmTouchedAtCurrentOrDescendantNode,
            errors:
              errors && errors.properties
                ? errors.properties[propertyName]
                : undefined,
            touched:
              touched && touched.properties
                ? touched.properties[propertyName]
                : undefined,
          });
          return childNode;
        });
    }
  }

  treeNode.populationAmount = computePopulationAmount({
    formStateNode,
    isAncestorUsingWholePopulationStrategy,
    childrenTreeNodes: treeNode.children,
  });
  treeNode.infoTip = computePopulationNote({
    formStateNode,
    isAncestorUsingWholePopulationStrategy,
  });
};
