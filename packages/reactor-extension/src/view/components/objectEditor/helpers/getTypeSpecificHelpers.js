/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import {
  ARRAY,
  BOOLEAN,
  INTEGER,
  NUMBER,
  OBJECT,
  OBJECT_JSON,
  OBJECT_ANALYTICS,
} from "../constants/schemaType";
import arrayHelpers from "./array";
import booleanHelpers from "./boolean";
import integerHelpers from "./integer";
import numberHelpers from "./number";
import objectHelpers from "./object";
import stringHelpers from "./string";
import objectJsonHelpers from "./object-json";
import objectAnalyticsHelpers from "./object-analytics";
import enumHelpers from "./enum";

export default (schema) => {
  if (schema.enum) {
    return enumHelpers;
  }
  switch (schema.type) {
    case ARRAY:
      return arrayHelpers;
    case BOOLEAN:
      return booleanHelpers;
    case INTEGER:
      return integerHelpers;
    case NUMBER:
      return numberHelpers;
    case OBJECT:
      return objectHelpers;
    case OBJECT_JSON:
      return objectJsonHelpers;
    case OBJECT_ANALYTICS:
      return objectAnalyticsHelpers;
    default:
      return stringHelpers;
  }
};
