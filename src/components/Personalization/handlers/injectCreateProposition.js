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

import PAGE_WIDE_SCOPE from "../../../constants/pageWideScope";
import {
  PAGE_SCOPE_TYPE,
  PROPOSITION_SCOPE_TYPE,
  VIEW_SCOPE_TYPE
} from "../constants/scopeType";

export default ({ preprocess, isPageWideSurface }) => {
  const createItem = (item, proposition) => {
    const { id, schema, data, characteristics: { trackingLabel } = {} } = item;

    const schemaType = data ? data.type : undefined;

    const processedData = preprocess(data);

    return {
      getId() {
        return id;
      },
      getSchema() {
        return schema;
      },
      getSchemaType() {
        return schemaType;
      },
      getData() {
        return processedData;
      },
      getProposition() {
        return proposition;
      },
      getTrackingLabel() {
        return trackingLabel;
      },
      getOriginalItem() {
        return item;
      },
      toString() {
        return JSON.stringify(item);
      },
      toJSON() {
        return item;
      }
    };
  };

  return (payload, visibleInReturnedItems = true) => {
    const { id, scope, scopeDetails, items = [] } = payload;
    const { characteristics: { scopeType } = {} } = scopeDetails || {};

    return {
      getScope() {
        if (!scope) {
          return scope;
        }
        return scope;
      },
      getScopeType() {
        if (scope === PAGE_WIDE_SCOPE || isPageWideSurface(scope)) {
          return PAGE_SCOPE_TYPE;
        }
        if (scopeType === VIEW_SCOPE_TYPE) {
          return VIEW_SCOPE_TYPE;
        }
        return PROPOSITION_SCOPE_TYPE;
      },
      getItems() {
        return items.map(item => createItem(item, this));
      },
      getNotification() {
        return { id, scope, scopeDetails };
      },
      getId() {
        return id;
      },
      toJSON() {
        return payload;
      },
      addToReturnValues(
        propositions,
        decisions,
        includedItems,
        renderAttempted
      ) {
        if (visibleInReturnedItems) {
          propositions.push({
            ...payload,
            items: includedItems.map(i => i.getOriginalItem()),
            renderAttempted
          });
          if (!renderAttempted) {
            decisions.push({
              ...payload,
              items: includedItems.map(i => i.getOriginalItem())
            });
          }
        }
      }
    };
  };
};
