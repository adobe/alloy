/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Builds two in-memory indices over a list of variable-type data elements
 * scoped to a single property:
 *
 *   - `byId`: Map<dataElementId, DataElement>. Used to test whether a stored
 *     `dataElementId` is present on the property (`byId.has(id)`).
 *   - `byName`: Map<dataElementName, DataElement[]>. Used to look up repair
 *     candidates by name. Names are not unique within a property, so the
 *     value is always an array.
 *
 * Both indices share references to the underlying data element objects; no
 * copying is performed.
 *
 * @param {Array<{id: string, name: string, settings: object}>} dataElements
 * @returns {{ byId: Map<string, object>, byName: Map<string, object[]> }}
 */
const buildDataElementIndex = (dataElements) => {
  const byId = new Map();
  const byName = new Map();

  dataElements.forEach((dataElement) => {
    byId.set(dataElement.id, dataElement);

    const existing = byName.get(dataElement.name);
    if (existing) {
      existing.push(dataElement);
    } else {
      byName.set(dataElement.name, [dataElement]);
    }
  });

  return { byId, byName };
};

export default buildDataElementIndex;
