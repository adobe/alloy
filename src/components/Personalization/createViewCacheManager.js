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

import { groupBy } from "../../utils";
import defer from "../../utils/defer";
import { DEFAULT_CONTENT_ITEM } from "./constants/schema";

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
            scopeType: "view"
          }
        },
        items: [
          {
            schema: DEFAULT_CONTENT_ITEM
          }
        ]
      },
      false
    );
    return [emptyViewProposition];
  };

  // This should be called before making the request to experience edge.
  const createCacheUpdate = viewName => {
    const updateCacheDeferred = defer();

    cacheUpdateCreatedAtLeastOnce = true;
    viewStoragePromise = viewStoragePromise.then(oldViewStorage =>
      updateCacheDeferred.promise.catch(() => oldViewStorage)
    );

    return {
      update(viewPropositions) {
        const viewPropositionsWithScope = viewPropositions.filter(proposition =>
          proposition.getScope()
        );
        const newViewStorage = groupBy(viewPropositionsWithScope, proposition =>
          proposition.getScope().toLowerCase()
        );
        updateCacheDeferred.resolve(newViewStorage);
        if (viewName) {
          return getViewPropositions(newViewStorage, viewName);
        }
        return [];
      },
      cancel() {
        updateCacheDeferred.reject();
      }
    };
  };

  const getView = viewName => {
    return viewStoragePromise.then(viewStorage =>
      getViewPropositions(viewStorage, viewName)
    );
  };

  const isInitialized = () => {
    return cacheUpdateCreatedAtLeastOnce;
  };

  return {
    createCacheUpdate,
    getView,
    isInitialized
  };
};
