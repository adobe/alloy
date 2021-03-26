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

describe("Personalization::createExecuteDecisions", () => {
  const logger = jasmine.createSpyObj("logger", ["info", "warn", "error"]);
  let executeActions;
  let collect;

  const decisions = [
    {
      id: 1,
      scope: "foo",
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
      selector: "#foo",
      content: "<div>Hola Mundo</div>",
      meta: {
        id: decisions[0].id,
        scope: "foo"
      }
    }
  ];
  const metas = [
    {
      id: decisions[0].id,
      scope: decisions[0].scope
    },
    {
      id: decisions[1].id,
      scope: decisions[1].scope
    }
  ];
  const modules = {
    foo() {}
  };

  beforeEach(() => {
    collect = jasmine.createSpy();
  });

  it("should trigger executeActions and collect when provided with an array of actions", () => {
    executeActions = jasmine
      .createSpy()
      .and.returnValues(
        [{ meta: metas[0] }, { meta: metas[0] }],
        [{ meta: metas[1], error: "could not render this item" }]
      );
    const executeDecisions = createExecuteDecisions({
      modules,
      logger,
      executeActions,
      collect
    });
    return executeDecisions(decisions).then(() => {
      expect(executeActions).toHaveBeenCalledWith(
        expectedAction,
        modules,
        logger
      );
      expect(logger.warn).toHaveBeenCalledWith({
        meta: metas[1],
        error: "could not render this item"
      });
      expect(collect).toHaveBeenCalledWith({ decisionsMeta: [metas[0]] });
    });
  });

  it("shouldn't trigger executeActions and collect when provided with empty array of actions", () => {
    executeActions = jasmine.createSpy().and.callThrough();
    const executeDecisions = createExecuteDecisions({
      modules,
      logger,
      executeActions,
      collect
    });
    return executeDecisions([]).then(() => {
      expect(executeActions).not.toHaveBeenCalled();
      expect(collect).not.toHaveBeenCalled();
    });
  });
  it("should log an error when collect call fails", () => {
    const error = new Error("test error");
    collect = jasmine.createSpy().and.throwError("test error");
    executeActions = jasmine
      .createSpy()
      .and.returnValues([{ meta: metas[0] }], [{ meta: metas[1] }]);
    const executeDecisions = createExecuteDecisions({
      modules,
      logger,
      executeActions,
      collect
    });
    return executeDecisions(decisions).then(() => {
      expect(executeActions).toHaveBeenCalled();
      expect(collect).toThrowError();
      expect(logger.error).toHaveBeenCalledWith(error);
    });
  });
  it("should not trigger collect when dom-action click", () => {
    executeActions = jasmine
      .createSpy()
      .and.returnValues([undefined], [undefined]);
    const executeDecisions = createExecuteDecisions({
      modules,
      logger,
      executeActions,
      collect
    });
    return executeDecisions(decisions).then(() => {
      expect(executeActions).toHaveBeenCalledWith(
        expectedAction,
        modules,
        logger
      );
      expect(collect).not.toHaveBeenCalled();
    });
  });
});
