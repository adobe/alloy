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

export default ({ value, valueWhole }) => {
  if (valueWhole) {
    return true;
  }

  const { evars, props, events, additionalProperties } = value;
  const editorSections = [
    [evars, "evar"],
    [props, "prop"],
    [events, "event"],
    [additionalProperties, "property"],
  ];

  for (let i = 0; i < editorSections.length; i += 1) {
    const [items, property] = editorSections[i];

    for (let j = 0; j < items.length; j += 1) {
      const key = items[j][property];
      if (key) {
        return true;
      }
    }
  }

  return false;
};
