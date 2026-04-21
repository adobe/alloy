/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import EnumEdit from "../enumEdit";
import ArrayEdit from "../arrayEdit";
import BooleanEdit from "../booleanEdit";
import IntegerEdit from "../integerEdit";
import NumberEdit from "../numberEdit";
import ObjectEdit from "../objectEdit";
import ObjectJsonEdit from "../objectJsonEdit";
import ObjectAnalyticsEdit from "../objectAnalyticsEdit";
import StringEdit from "../stringEdit";
import {
  ARRAY,
  BOOLEAN,
  INTEGER,
  NUMBER,
  OBJECT,
  OBJECT_JSON,
  OBJECT_ANALYTICS,
} from "../constants/schemaType";

export default (schema) => {
  if (schema.enum) {
    return EnumEdit;
  }
  switch (schema.type) {
    case ARRAY:
      return ArrayEdit;
    case BOOLEAN:
      return BooleanEdit;
    case INTEGER:
      return IntegerEdit;
    case NUMBER:
      return NumberEdit;
    case OBJECT:
      return ObjectEdit;
    case OBJECT_JSON:
      return ObjectJsonEdit;
    case OBJECT_ANALYTICS:
      return ObjectAnalyticsEdit;
    default:
      return StringEdit;
  }
};
