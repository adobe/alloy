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

import { ALWAYS, COMMAND, CONTEXT } from "../constants/autoPopulationSource";
import { OBJECT } from "../constants/schemaType";

export default ({ formStateNode, isAncestorUsingWholePopulationStrategy }) => {
  const { autoPopulationSource, schema } = formStateNode;

  if (isAncestorUsingWholePopulationStrategy) {
    return "";
  }
  if (autoPopulationSource === ALWAYS) {
    return 'This field will be auto-populated when this data element is provided as the XDM object for a "Send event" action';
  }
  if (autoPopulationSource === COMMAND) {
    return 'This field may be specified as an option to the "Send event" action';
  }
  if (autoPopulationSource === CONTEXT && schema.type !== OBJECT) {
    return 'This field may be auto-populated when provided as the XDM object for a "Send event" action';
  }
  if (autoPopulationSource === CONTEXT && schema.type === OBJECT) {
    return 'Some of the attributes of this field may be auto-populated when provided as the XDM object for a "Send event" action';
  }
  return "";
};
