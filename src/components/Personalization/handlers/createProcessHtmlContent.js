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
import createDecorateProposition from "./createDecorateProposition.js";
import createRenderStatusHandler from "./createRenderStatusHandler.js";

export default ({
    modules,
    logger,
    storeInteractionMeta,
    autoCollectPropositionInteractions,
  }) =>
  (item) => {
    const { type, selector } = item.getData() || {};

    if (!selector || !type) {
      return { setRenderAttempted: false, includeInNotification: false };
    }

    if (!modules[type]) {
      logger.warn("Invalid HTML content data", item.getData());
      return { setRenderAttempted: false, includeInNotification: false };
    }

    const decorateProposition = createDecorateProposition(
      autoCollectPropositionInteractions,
      type,
      item.getProposition().getId(),
      item.getId(),
      item.getTrackingLabel(),
      item.getProposition().getScopeType(),
      item.getProposition().getNotification(),
      storeInteractionMeta,
    );

    const renderStatusHandler = createRenderStatusHandler(
      item.getProposition().getScopeType(),
      item.getId(),
    );

    return {
      render: () => {
        return modules[type](
          item.getData(),
          decorateProposition,
          renderStatusHandler,
        );
      },
      setRenderAttempted: true,
      includeInNotification: true,
    };
  };
