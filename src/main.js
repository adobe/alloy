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

import window from "@adobe/reactor-window";
import createInstance from "./createInstance";

// eslint-disable-next-line no-underscore-dangle
const namespaces = window.__adobeNS;

if (namespaces) {
  namespaces.forEach(namespace => {
    const instance = createInstance(namespace);
    const queue = window[namespace].q;
    queue.push = instance;
    queue.forEach(instance);
  });
}

// TODO: Is this something we want to support? Would it have a different API?
// Allows a consumer using the npm package to build an instance without
// any base code.
export default namespace => {
  return createInstance(namespace);
};
