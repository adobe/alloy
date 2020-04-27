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

export default ({ modules, logger, executeActions, collect }) => {
  return decisions => {
    const decisionMetasPromise = decisions.map(decision => {
      const actions = buildActions(decision);

      return executeActions(actions, modules, logger);
    });
    return Promise.all(decisionMetasPromise)
      .then(result => {
        const metas = flatMap(result, identity);
        return metas.map(item => item.meta);
      })
      .then(metas => {
        if (isNonEmptyArray(metas)) {
          collect({ decisions: metas });
        }
      })
      .catch(error => {
        logger.error(error);
      });
  };
};
