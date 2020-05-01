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

import { assign, flatMap, isNonEmptyArray } from "../../utils";

const identity = item => item;

const buildActions = decision => {
  const meta = { id: decision.id, scope: decision.scope };

  return decision.items.map(item => assign({}, item.data, { meta }));
};

const dedupe = metas => {
  const result = [];
  const set = new Set();

  metas.forEach(item => {
    if (set.has(item.id)) {
      return;
    }

    set.add(item.id);
    result.push(item);
  });

  return result;
};

const collectMetas = (collect, decisionMetas) => {
  const metas = flatMap(decisionMetas, identity);
  const dedupedMetas = dedupe(metas.map(e => e.meta));

  if (isNonEmptyArray(dedupedMetas)) {
    collect({ decisions: dedupedMetas });
  }
};

export default ({ modules, logger, executeActions, collect }) => {
  return decisions => {
    const decisionMetasPromise = decisions.map(decision => {
      const actions = buildActions(decision);

      return executeActions(actions, modules, logger);
    });
    return Promise.all(decisionMetasPromise)
      .then(result => collectMetas(collect, result))
      .catch(error => {
        logger.error(error);
      });
  };
};
