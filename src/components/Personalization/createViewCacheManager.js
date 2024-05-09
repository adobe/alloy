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

import { assign, groupBy } from "../../utils/index.js";
import defer from "../../utils/defer.js";
import { DEFAULT_CONTENT_ITEM } from "../../constants/schema.js";
import { VIEW_SCOPE_TYPE } from "./constants/scopeType.js";

export default ({ createProposition }) => {
  let cacheUpdateCreatedAtLeastOnce = false;
  let viewStoragePromise = Promise.resolve({});

  const getViewPropositions = (viewStorage, viewName) => {
    const viewPropositions = viewStorage[viewName.toLowerCase()];
    if (viewPropositions && viewPropositions.length > 0) {
      return viewPropositions;
    }

    const emptyViewProposition = createProposition(
      {
        scope: viewName,
        scopeDetails: {
          characteristics: {
            scopeType: VIEW_SCOPE_TYPE,
          },
        },
        items: [
          {
            schema: DEFAULT_CONTENT_ITEM,
          },
        ],
      },
      false,
    );
    return [emptyViewProposition];
  };

  // This should be called before making the request to experience edge.
  const createCacheUpdate = (viewName) => {
    const updateCacheDeferred = defer();

    cacheUpdateCreatedAtLeastOnce = true;

    // Additional updates will merge the new view propositions with the old.
    // i.e. if there are new "cart" view propositions they will overwrite the
    // old "cart" view propositions, but if there are no new "cart" view
    // propositions the old "cart" view propositions will remain.
    viewStoragePromise = viewStoragePromise.then((oldViewStorage) => {
      return updateCacheDeferred.promise
        .then((newViewStorage) => {
          return assign({}, oldViewStorage, newViewStorage);
        })
        .catch(() => oldViewStorage);
    });

    return {
      update(viewPropositions) {
        const viewPropositionsWithScope = viewPropositions.filter(
          (proposition) => proposition.getScope(),
        );
        const newViewStorage = groupBy(
          viewPropositionsWithScope,
          (proposition) => proposition.getScope().toLowerCase(),
        );
        updateCacheDeferred.resolve(newViewStorage);
        if (viewName) {
          return getViewPropositions(newViewStorage, viewName);
        }
        return [];
      },
      cancel() {
        updateCacheDeferred.reject();
      },
    };
  };

  const getView = (viewName) => {
    return viewStoragePromise.then((viewStorage) =>
      getViewPropositions(viewStorage, viewName),
    );
  };

  const isInitialized = () => {
    return cacheUpdateCreatedAtLeastOnce;
  };

  return {
    createCacheUpdate,
    getView,
    isInitialized,
  };
};
