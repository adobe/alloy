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

import { assign } from "../../utils";
import { executeActions } from "./dom-actions";

const buildActions = decision => {
  const meta = { decisionId: decision.id };

  return decision.items.map(item => assign({}, item.data, { meta }));
};

export default (decisions, modules, logger) => {
  decisions.forEach(decision => {
    const actions = buildActions(decision);

    executeActions(actions, modules, logger);
  });
};
