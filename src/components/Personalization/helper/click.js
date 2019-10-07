/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { uuid } from "../../../utils";
import { awaitSelector } from "../../../utils/dom";
import { selectNodesWithEq, setAttribute } from "./dom";

const ALLOY_KEY = "data-alloy-key";

export default (settings, storage) => {
  const key = uuid();
  const { selector, meta } = settings;

  return awaitSelector(selector, selectNodesWithEq).then(elements => {
    storage.setItem(key, meta);

    elements.forEach(element => {
      setAttribute(element, ALLOY_KEY, key);
    });
  });
};
