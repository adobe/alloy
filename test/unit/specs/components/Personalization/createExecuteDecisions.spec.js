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

import createExecuteDecisions from "../../../../../src/components/Personalization/createExecuteDecisions";
import { DOM_ACTION } from "../../../../../src/components/Personalization/constants/schema";
import createActionsProvider from "../../../../../src/components/Personalization/createActionsProvider";

describe("Personalization::createExecuteDecisions", () => {
  let logger;
  let executeActions;
  let actionsProvider;

  const decisions = [
    {
      id: 1,
      scope: "foo",
      scopeDetails: {
        test: "blah1"
      },
      items: [
        {
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "setHtml",
            selector: "#foo",
            content: "<div>Hola Mundo</div>"
          }
        }
      ]
    },
    {
      id: 5,
      scope: "__view__",
      scopeDetails: {
        test: "blah2"
      },
      items: [
        {
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "setHtml",
            selector: "#foo2",
            content: "<div>offer 2</div>"
          }
        }
      ]
    }
  ];
  const expectedAction = [
    {
      type: "setHtml",
      schema: DOM_ACTION,
      selector: "#foo",
      content: "<div>Hola Mundo</div>",
      meta: {
        id: decisions[0].id,
        scope: "foo",
        scopeDetails: {
          test: "blah1"
        }
      }
    }
  ];
  const metas = [
    {
      id: decisions[0].id,
      scope: decisions[0].scope,
      scopeDetails: decisions[0].scopeDetails
    },
    {
      id: decisions[1].id,
      scope: decisions[1].scope,
      scopeDetails: decisions[1].scopeDetails
    }
  ];

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["info", "warn", "error"]);
    executeActions = jasmine.createSpy();

    actionsProvider = createActionsProvider({
      modules: {
        [DOM_ACTION]: {
          foo() {}
        }
      },
      logger
    });
  });

  it("should trigger executeActions when provided with an array of actions", () => {
    executeActions.and.returnValues(
      [{ meta: metas[0] }, { meta: metas[0] }],
      [{ meta: metas[1], error: "could not render this item" }]
    );
    const executeDecisions = createExecuteDecisions({
      actionsProvider,
      logger,
      executeActions
    });
    return executeDecisions(decisions).then(() => {
      expect(executeActions).toHaveBeenCalledWith(
        expectedAction,
        actionsProvider
      );
      expect(logger.warn).toHaveBeenCalledWith({
        meta: metas[1],
        error: "could not render this item"
      });
    });
  });

  it("shouldn't trigger executeActions when provided with empty array of actions", () => {
    executeActions.and.callThrough();
    const executeDecisions = createExecuteDecisions({
      actionsProvider,
      logger,
      executeActions
    });
    return executeDecisions([]).then(() => {
      expect(executeActions).not.toHaveBeenCalled();
    });
  });
});
