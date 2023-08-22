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

const renderWithLogging = (renderer, item, logger) => {
  return Promise.resolve()
    .then(renderer)
    .then(() => {
      if (logger.enabled) {
        const details = JSON.stringify(item);
        logger.info(`Action ${details} executed.`);
      }
      return true;
    })
    .catch(error => {
      if (logger.enabled) {
        const details = JSON.stringify(item);
        const { message, stack } = error;
        const errorMessage = `Failed to execute action ${details}. ${message} ${
          stack ? `\n ${stack}` : ""
        }`;
        logger.error(errorMessage);
      }
      return false;
    });
};

export const createProposition = (handle, isApplyPropositions = false) => {
  const { id, scope, scopeDetails, items = [] } = handle;

  const renderers = [];
  let redirectUrl;
  let includeInDisplayNotification = false;
  let includeInReturnedPropositions = true;
  const itemsRenderAttempted = new Array(items.length);
  for (let i = 0; i < items.length; i += 1) {
    itemsRenderAttempted[i] = false;
  }

  return {
    getHandle() {
      return handle;
    },
    getItemMeta(i) {
      const item = items[i];
      const meta = { id, scope, scopeDetails };
      if (item.characteristics && item.characteristics.trackingLabel) {
        meta.trackingLabel = item.characteristics.trackingLabel;
      }

      return meta;
    },
    redirect(url) {
      includeInDisplayNotification = true;
      itemsRenderAttempted.forEach((_, index) => {
        itemsRenderAttempted[index] = true;
      });
      redirectUrl = url;
    },
    getRedirectUrl() {
      return redirectUrl;
    },
    addRenderer(itemIndex, renderer) {
      itemsRenderAttempted[itemIndex] = true;
      renderers.push([itemIndex, renderer]);
    },
    includeInDisplayNotification() {
      includeInDisplayNotification = true;
    },
    excludeInReturnedPropositions() {
      includeInReturnedPropositions = false;
    },
    render(logger) {
      return Promise.all(
        renderers.map(([itemIndex, renderer]) =>
          renderWithLogging(renderer, items[itemIndex], logger)
        )
      ).then(successes => {
        const notifications = [];
        // as long as at least one renderer succeeds, we want to add the notification
        // to the display notifications
        if (successes.length === 0 || successes.includes(true)) {
          this.addToNotifications(notifications);
        }
        return notifications[0];
      });
    },
    addToNotifications(notifications) {
      if (includeInDisplayNotification) {
        notifications.push({ id, scope, scopeDetails });
      }
    },
    addToReturnedPropositions(propositions) {
      if (includeInReturnedPropositions) {
        const renderedItems = items.filter(
          (_, index) => itemsRenderAttempted[index]
        );
        if (renderedItems.length > 0) {
          propositions.push({
            ...handle,
            items: renderedItems,
            renderAttempted: true
          });
        }
        const nonrenderedItems = items.filter(
          (_, index) => !itemsRenderAttempted[index]
        );
        if (nonrenderedItems.length > 0) {
          propositions.push({
            ...handle,
            items: nonrenderedItems,
            renderAttempted: false
          });
        }
      }
    },
    addToReturnedDecisions(decisions) {
      if (includeInReturnedPropositions) {
        const nonrenderedItems = items.filter(
          (item, index) => !itemsRenderAttempted[index]
        );
        if (nonrenderedItems.length > 0) {
          decisions.push({ ...handle, items: nonrenderedItems });
        }
      }
    },
    isApplyPropositions() {
      return isApplyPropositions;
    }
  };
};

export const buildReturnedPropositions = propositions => {
  const returnedPropositions = [];
  propositions.forEach(p => {
    p.addToReturnedPropositions(returnedPropositions);
  });
  return returnedPropositions;
};

export const buildReturnedDecisions = propositions => {
  const returnedDecisions = [];
  propositions.forEach(p => {
    p.addToReturnedDecisions(returnedDecisions);
  });
  return returnedDecisions;
};
