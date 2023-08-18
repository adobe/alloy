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
import { HTML_CONTENT_ITEM } from "../constants/schema";
import { VIEW_SCOPE_TYPE } from "../constants/scopeType";
import isPageWideScope from "../utils/isPageWideScope";

export default ({ next, modules, preprocess }) => proposition => {
  const {
    scope,
    scopeDetails: { characteristics: { scopeType } = {} } = {},
    items = []
  } = proposition.getHandle();

  items.forEach((item, index) => {
    const { schema, data } = item;
    const { type, selector } = data || {};
    if (schema === HTML_CONTENT_ITEM && type && selector && modules[type]) {
      proposition.includeInDisplayNotification();
      const preprocessedData = preprocess(data);
      proposition.addRenderer(index, () => {
        return modules[type](preprocessedData);
      });
    }
  });

  // only continue processing if it is a view scope proposition
  // or if it is a page wide proposition.
  if (
    scopeType === VIEW_SCOPE_TYPE ||
    isPageWideScope(scope) ||
    proposition.isApplyPropositions()
  ) {
    next(proposition);
  }
};

/*
import { assign } from "../../utils";

export const createViewCacheManager = () => {
  const viewStorage = {};
  let storeViewsCalledAtLeastOnce = false;
  let previousStoreViewsComplete = Promise.resolve();

  const storeViews = viewTypeHandlesPromise => {
    storeViewsCalledAtLeastOnce = true;
    previousStoreViewsComplete = previousStoreViewsComplete
      .then(() => viewTypeHandlesPromise)
      .then(viewTypeHandles => {
        const decisions = viewTypeHandles.reduce((handle, memo) => {
          const { scope } = handle;
          memo[scope] = memo[scope] || [];
          memo[scope].push(handle);
        }, {});
        assign(viewStorage, decisions);
      })
      .catch(() => {});
  };

  const getView = viewName => {
    return previousStoreViewsComplete.then(() => viewStorage[viewName] || []);
  };

  const isInitialized = () => {
    return storeViewsCalledAtLeastOnce;
  };
  return {
    storeViews,
    getView,
    isInitialized
  };
};
*/
