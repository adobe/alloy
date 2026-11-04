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

import { groupBy, isNonEmptyArray } from "@adobe/alloy-core/utils";
import type {
  ItemProcessResult,
  Logger,
  Notification,
  ProcessPropositions,
  Proposition,
  PropositionItem,
  PropositionPayload,
  SchemaProcessor,
} from "../types.js";

type Renderer = () => unknown;
type RenderedMeta = Notification & { items?: unknown[] };

export default ({
  schemaProcessors,
  logger,
}: {
  schemaProcessors: Record<string, SchemaProcessor>;
  logger: Logger;
}): ProcessPropositions => {
  const wrapRenderWithLogging =
    (render: Renderer, item: PropositionItem) => () => {
      return Promise.resolve()
        .then(render)
        .then(() => {
          if (logger.enabled) {
            logger.info(`Action ${item.toString()} executed.`);
          }
          return item.toJSON();
        })
        .catch((error) => {
          const { message, stack } = error;
          const warning = `Failed to execute action ${item.toString()}. ${message} ${stack}`;
          logger.logOnContentRendering({
            status: "rendering-failed",
            detail: {
              propositionDetails: item.getProposition().getNotification(),
              item: item.toJSON(),
            },
            error,
            message: warning,
            logLevel: "warn",
          });

          return undefined;
        });
    };

  const renderItems = async (
    renderers: Renderer[],
    meta: Notification | undefined,
  ): Promise<RenderedMeta | undefined> => {
    const results = await Promise.allSettled(
      renderers.map((renderer) => renderer()),
    );
    const successes = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);
    // as long as at least one renderer succeeds, we want to add the notification
    // to the display notifications
    if (meta && isNonEmptyArray(successes)) {
      return { ...meta, items: successes };
    }
    return undefined;
  };

  const processItem = (item: PropositionItem): ItemProcessResult => {
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
  }: {
    renderers: (() => Promise<RenderedMeta | undefined>)[];
    returnedPropositions: PropositionPayload[];
    returnedDecisions: PropositionPayload[];
    items: PropositionItem[];
    proposition: Proposition;
  }) => {
    let renderers = [...existingRenderers];
    let returnedPropositions = [...existingReturnedPropositions];
    let returnedDecisions = [...existingReturnedDecisions];
    let renderedItems: PropositionItem[] = [];
    let nonRenderedItems: PropositionItem[] = [];
    let itemRenderers: Renderer[] = [];
    let atLeastOneWithNotification: boolean | undefined = false;
    let render: ItemProcessResult["render"];
    let setRenderAttempted: boolean | undefined;
    let includeInNotification: boolean | undefined;
    let onlyRenderThis: boolean | undefined = false;
    let i = 0;
    let item: PropositionItem;

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
        // A processor that sets onlyRenderThis, such as redirect, always provides render.
        itemRenderers = [render as Renderer];
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
    let renderers: (() => Promise<RenderedMeta | undefined>)[] = [];
    let returnedPropositions: PropositionPayload[] = [];
    let returnedDecisions: PropositionPayload[] = [];
    let onlyRenderThis: boolean | undefined;
    let i = 0;
    let proposition: Proposition;
    let items: PropositionItem[];

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
        (metas) => {
          const propositions = metas.filter(
            (meta): meta is RenderedMeta => !!meta,
          );
          const renderedPropositions = propositions.map((prop) => {
            const { id, scope, scopeDetails } = prop;
            return { id, scope, scopeDetails };
          });
          if (isNonEmptyArray(propositions)) {
            const propsByScope = groupBy(propositions, (p) => String(p.scope));
            logger.logOnContentRendering({
              status: "rendering-succeeded",
              detail: { ...propsByScope },
              message: `Scopes: ${JSON.stringify(propsByScope)} successfully executed.`,
              logLevel: "info",
            });
          }
          return renderedPropositions;
        },
      );
    };
    return { returnedPropositions, returnedDecisions, render };
  };
};
