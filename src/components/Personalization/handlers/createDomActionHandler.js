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
import { DEFAULT_CONTENT_ITEM, DOM_ACTION } from "../constants/schema";

export default ({ next, modules, storeClickMetrics }) => proposition => {
  const { items = [] } = proposition.getHandle();

  items.forEach((item, index) => {
    const { schema, data } = item;
    if (schema === DEFAULT_CONTENT_ITEM) {
      proposition.includeInDisplayNotification();
      proposition.addRenderer(index, () => undefined);
    }
    const { type, selector } = data || {};
    if (schema === DOM_ACTION && type && selector) {
      if (type === "click") {
        // Do not record the click proposition in display notification.
        // Store it for later.
        proposition.addRenderer(index, () => {
          storeClickMetrics({ selector, meta: proposition.getMeta() });
        });
      } else if (modules[type]) {
        proposition.includeInDisplayNotification();
        proposition.addRenderer(index, () => {
          return modules[type](data);
        });
      }
    }
  });

  next(proposition);
};
