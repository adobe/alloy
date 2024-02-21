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

export default () => {
  const clickMetaStorage = {};
  const clickItemStorage = {};

  const storeClickMeta = (item, interactId) => {
    const propositionId = item.getProposition().getId();

    if (!clickMetaStorage[interactId]) {
      clickMetaStorage[interactId] = {};
      clickItemStorage[interactId] = {};
    }

    if (!clickItemStorage[interactId][propositionId]) {
      clickItemStorage[interactId][propositionId] = {};
    }

    clickItemStorage[interactId][propositionId][item.getId()] = item;

    const scopeType = item.getProposition().getScopeType();

    clickMetaStorage[interactId][propositionId] = {
      ...item.getProposition().getNotification(),
      scopeType,
      items: Object.values(clickItemStorage[interactId][propositionId]).map(
        itm => ({
          id: itm.getId(),
          characteristics: {
            label: itm.getTrackingLabel()
          }
        })
      )
    };
  };

  const getClickMetas = (interactId, clickToken) => {
    return Object.values(clickMetaStorage[interactId] || {}).map(meta => {
      return {
        ...meta,
        items: meta.items.map(itm => {
          return {
            ...itm,
            characteristics: {
              ...itm.characteristics,
              token: clickToken
            }
          };
        })
      };
    });
  };

  return {
    storeClickMeta,
    getClickMetas
  };
};
