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

import {
  string,
  objectOf,
  boolean,
  arrayOf,
  enumOf,
  mapOfValues
} from "./validation/index";
import {
  AMBIGUOUS,
  AUTHENTICATED,
  LOGGED_OUT
} from "../constants/identityMapAuthenticatedState";

export default mapOfValues(
  arrayOf(
    objectOf({
      authenticatedState: enumOf(AMBIGUOUS, AUTHENTICATED, LOGGED_OUT),
      id: string(),
      namespace: objectOf({
        code: string()
      }).noUnknownFields(),
      primary: boolean(),
      xid: string()
    })
  ).required()
);
