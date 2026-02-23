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

import { OBJECT, ARRAY } from "../constants/schemaType";

const addToBreadcrumb = (breadcrumb, displayName, nodeId) => {
  if (displayName) {
    breadcrumb.unshift({
      label: displayName,
      nodeId,
    });
  }
};

/**
 * The data needed to render the node edit view.
 * @typedef {Object} NodeEditData
 * @property {FormStateNode} formStateNode The form state node that will
 * be edited.
 * @property {string} fieldName The Formik field name.
 * @property {Array} An array containing an object for each item in the
 * breadcrumb hierarchy.
 */

/**
 * Retrieves data that's necessary to render the edit view for a particular node.
 * @param {FormStateNode} candidateFormStateNode A form state node that is a
 * candidate for the node we're trying to find by ID.
 * @param {string} candidateFieldName The Formik field name for the candidate.
 * @param {string} candidateDisplayName The display name for the candidate node.
 * @param {string} nodeIdToFind The ID of the node that we're trying to find.
 * @returns {NodeEditData}
 */
const getNodeEditData = ({
  candidateFormStateNode,
  candidateFieldName,
  candidatePropertyName,
  candidateDisplayName,
  nodeIdToFind,
}) => {
  if (candidateFormStateNode.id === nodeIdToFind) {
    const breadcrumb = [];
    addToBreadcrumb(
      breadcrumb,
      candidatePropertyName,
      candidateFormStateNode.id,
    );
    return {
      formStateNode: candidateFormStateNode,
      fieldName: candidateFieldName,
      breadcrumb,
      displayName: candidateDisplayName,
      description: candidateFormStateNode.schema.description,
      hasClearedAncestor: false,
    };
  }

  const { schema } = candidateFormStateNode;

  if (schema.type === OBJECT && candidateFormStateNode.properties) {
    const propertyNames = Object.keys(candidateFormStateNode.properties);

    for (let i = 0; i < propertyNames.length; i += 1) {
      const propertyName = propertyNames[i];
      const propertyNode = candidateFormStateNode.properties[propertyName];
      const propertySchema = propertyNode.schema;
      const foundNodeHierarchyAndFieldName = getNodeEditData({
        candidateFormStateNode: propertyNode,
        nodeIdToFind,
        candidateFieldName: candidateFieldName
          ? `${candidateFieldName}.properties.${propertyName}`
          : `properties.${propertyName}`,
        candidatePropertyName: propertyName,
        candidateDisplayName: propertySchema.title || propertyName,
      });

      if (foundNodeHierarchyAndFieldName) {
        addToBreadcrumb(
          foundNodeHierarchyAndFieldName.breadcrumb,
          candidatePropertyName,
          candidateFormStateNode.id,
        );
        if (candidateFormStateNode.transform.clear) {
          foundNodeHierarchyAndFieldName.hasClearedAncestor = true;
        }
        return foundNodeHierarchyAndFieldName;
      }
    }
  }

  if (schema.type === ARRAY && candidateFormStateNode.items) {
    const { items } = candidateFormStateNode;
    for (let i = 0; i < items.length; i += 1) {
      const itemNode = items[i];
      const foundNodeHierarchyAndFieldName = getNodeEditData({
        candidateFormStateNode: itemNode,
        nodeIdToFind,
        candidateFieldName: candidateFieldName
          ? `${candidateFieldName}.items.${i}`
          : `items.${i}`,
        candidatePropertyName: `Item ${i + 1}`,
        candidateDisplayName: `Item ${i + 1}`,
      });

      if (foundNodeHierarchyAndFieldName) {
        addToBreadcrumb(
          foundNodeHierarchyAndFieldName.breadcrumb,
          candidatePropertyName,
          candidateFormStateNode.id,
        );
        if (candidateFormStateNode.transform.clear) {
          foundNodeHierarchyAndFieldName.hasClearedAncestor = true;
        }
        return foundNodeHierarchyAndFieldName;
      }
    }
  }

  return undefined;
};

export default ({ formState, nodeId }) => {
  return getNodeEditData({
    candidateFormStateNode: formState,
    nodeIdToFind: nodeId,
  });
};
