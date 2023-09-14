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

import { assign, groupBy } from "../../utils";
import defer from "../../utils/defer";

export default ({ createProposition }) => {

  const viewStorage = {};
  let cacheUpdateCreatedAtLeastOnce = false;
  let previousUpdateCacheComplete = Promise.resolve();

  const getViewPropositions = (currentViewStorage, viewName) => {
    const viewPropositions = currentViewStorage[viewName];
    if (viewPropositions && viewPropositions.length > 0) {
      return viewPropositions;
    }

    const emptyViewProposition = createProposition({
      scope: viewName,
      scopeDetails: {
        characteristics: {
          scopeType: "view"
        }
      }
    }, false);
    return [emptyViewProposition];
  };

  // This should be called before making the request to experience edge.
  const createCacheUpdate = viewName => {
    const updateCacheDeferred = defer();

    cacheUpdateCreatedAtLeastOnce = true;
    previousUpdateCacheComplete = previousUpdateCacheComplete
      .then(() => updateCacheDeferred.promise)
      .then(newViewStorage => {
        assign(viewStorage, newViewStorage);
      })
      .catch(() => {});

    return {
      update(viewPropositions) {
        const newViewStorage = groupBy(viewPropositions, proposition => proposition.getScope());
        updateCacheDeferred.resolve(newViewStorage);
        if (viewName) {
          return getViewPropositions(newViewStorage, viewName)
        }
        return [];
      },
      cancel() {
        updateCacheDeferred.reject();
      }
    };
  };

  const getView = viewName => {
    return previousUpdateCacheComplete.then(() =>
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
