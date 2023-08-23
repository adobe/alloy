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

import { assign, flatMap } from "../../utils";

const DEFAULT_ACTION_TYPE = "defaultContent";

const identity = item => item;

const getItemMeta = (item, decisionMeta) =>
  item.characteristics && item.characteristics.trackingLabel
    ? assign(
        { trackingLabel: item.characteristics.trackingLabel },
        decisionMeta
      )
    : decisionMeta;

const buildActions = decision => {
  const decisionMeta = {
    id: decision.id,
    scope: decision.scope,
    scopeDetails: decision.scopeDetails
  };

  return decision.items.map(item =>
    assign({ type: DEFAULT_ACTION_TYPE }, item.data, {
      schema: item.schema,
      meta: getItemMeta(item, { ...decisionMeta })
    })
  );
};

const processMetas = (logger, actionResults) => {
  const results = flatMap(actionResults, identity);
  const finalMetas = [];
  const set = new Set();

  results.forEach(item => {
    // for click actions we don't return an item
    if (!item) {
      return;
    }
    if (item.error) {
      logger.warn(item);
      return;
    }

    const { meta } = item;

    if (set.has(meta.id)) {
      return;
    }

    set.add(meta.id);
    finalMetas.push(meta);
  });

  return finalMetas;
};

export default ({ actionsProvider, logger, executeActions }) => {
  return decisions => {
    const actionResultsPromises = decisions.map(decision => {
      const actions = buildActions(decision);
      return executeActions(actions, actionsProvider);
    });
    return Promise.all(actionResultsPromises)
      .then(results => processMetas(logger, results))
      .catch(error => {
        logger.error(error);
      });
  };
};