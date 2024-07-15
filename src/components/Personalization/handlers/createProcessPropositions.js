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

export default ({ schemaProcessors, logger }) => {
  const wrapRenderWithLogging = (render, item) => () => {
    return Promise.resolve()
      .then(render)
      .then(() => {
        logger.logOnContentRendering({
          status: "rendering-succeeded",
          detail: {
            propositionDetails: item.getProposition().getNotification(),
            item: item.toJSON()
          },
          message: `Action ${item.toString()} executed.`,
          logLevel: "info",
        });

        return true;
      })
      .catch((error) => {
        const { message, stack } = error;
        const warning = `Failed to execute action ${item.toString()}. ${message} ${stack}`;
        logger.logOnContentRendering({
          status: "rendering-failed",
          detail: {
            propositionDetails: item.getProposition().getNotification(),
            item: item.toJSON()
          },
          error,
          message: warning,
          logLevel: "warn",
        });

        return false;
      });
  };

  const renderItems = (renderers, meta) =>
    Promise.all(renderers.map((renderer) => renderer())).then((successes) => {
      // as long as at least one renderer succeeds, we want to add the notification
      // to the display notifications
      if (!successes.includes(true)) {
        return undefined;
      }
      return meta;
    });

  const processItem = (item) => {
    const processor = schemaProcessors[item.getSchema()];
    if (!processor) {
      return {};
    }
    return processor(item);
  };

  const processItems = ({
    renderers: existingRenderers,
    returnedPropositions: existingReturnedPropositions,
    returnedDecisions: existingReturnedDecisions,
    items,
    proposition,
  }) => {
    let renderers = [...existingRenderers];
    let returnedPropositions = [...existingReturnedPropositions];
    let returnedDecisions = [...existingReturnedDecisions];
    let renderedItems = [];
    let nonRenderedItems = [];
    let itemRenderers = [];
    let atLeastOneWithNotification = false;
    let render;
    let setRenderAttempted;
    let includeInNotification;
    let onlyRenderThis = false;
    let i = 0;
    let item;

    while (items.length > i) {
      item = items[i];
      ({ render, setRenderAttempted, includeInNotification, onlyRenderThis } =
        processItem(item));
      if (onlyRenderThis) {
        returnedPropositions = [];
        returnedDecisions = [];
        if (setRenderAttempted) {
          renderedItems = [item];
          nonRenderedItems = [];
        } else {
          renderedItems = [];
          nonRenderedItems = [item];
        }
        renderers = [];
        itemRenderers = [render];
        atLeastOneWithNotification = includeInNotification;
        break;
      }
      if (render) {
        itemRenderers.push(wrapRenderWithLogging(render, item));
      }
      if (includeInNotification) {
        atLeastOneWithNotification = true;
      }
      if (setRenderAttempted) {
        renderedItems.push(item);
      } else {
        nonRenderedItems.push(item);
      }
      i += 1;
    }
    if (itemRenderers.length > 0) {
      const meta = atLeastOneWithNotification
        ? proposition.getNotification()
        : undefined;
      renderers.push(() => renderItems(itemRenderers, meta));
    } else if (atLeastOneWithNotification) {
      renderers.push(() => Promise.resolve(proposition.getNotification()));
    }
    if (renderedItems.length > 0) {
      proposition.addToReturnValues(
        returnedPropositions,
        returnedDecisions,
        renderedItems,
        true,
      );
    }
    if (nonRenderedItems.length > 0) {
      proposition.addToReturnValues(
        returnedPropositions,
        returnedDecisions,
        nonRenderedItems,
        false,
      );
    }

    return {
      renderers,
      returnedPropositions,
      returnedDecisions,
      onlyRenderThis,
    };
  };

  return (renderPropositions, nonRenderPropositions = []) => {
    let renderers = [];
    let returnedPropositions = [];
    let returnedDecisions = [];
    let onlyRenderThis;
    let i = 0;
    let proposition;
    let items;

    while (renderPropositions.length > i) {
      proposition = renderPropositions[i];
      items = proposition.getItems();
      ({ renderers, returnedPropositions, returnedDecisions, onlyRenderThis } =
        processItems({
          renderers,
          returnedPropositions,
          returnedDecisions,
          items,
          proposition,
        }));
      if (onlyRenderThis) {
        break;
      }
      i += 1;
    }

    if (onlyRenderThis) {
      // if onlyRenderThis is true, that means returnedPropositions and returnedDecisions
      // only contains the proposition that triggered only rendering this. We need to
      // add the other propositions to the returnedPropositions and returnedDecisions.
      renderPropositions.forEach((p, index) => {
        if (index !== i) {
          p.addToReturnValues(
            returnedPropositions,
            returnedDecisions,
            p.getItems(),
            false,
          );
        }
      });
    }

    nonRenderPropositions.forEach((p) => {
      p.addToReturnValues(
        returnedPropositions,
        returnedDecisions,
        p.getItems(),
        false,
      );
    });
    const render = () => {
      return Promise.all(renderers.map((renderer) => renderer())).then(
        (metas) => metas.filter((meta) => meta),
      );
    };
    return { returnedPropositions, returnedDecisions, render };
  };
};
