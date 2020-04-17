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
  const logger = {
    log() {},
    warn() {}
  };
  let executeActions;

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
    }
  ];

  beforeEach(() => {
    executeActions = jasmine.createSpy().and.callThrough();
  });

  it("should trigger executeActions", () => {
    const expectedAction = [
      {
        type: "setHtml",
        selector: "#foo",
        content: "<div>Hola Mundo</div>",
        meta: {
          decisionId: decisions[0].id
        }
      }
    ];
    const spy = jasmine.createSpy();
    const modules = {
      foo: spy
    };
    const executeDecisions = createExecuteDecisions({
      modules,
      logger,
      executeActions
    });
    executeDecisions(decisions);
    expect(executeActions).toHaveBeenCalledWith(
      expectedAction,
      modules,
      logger
    );
  });

  it("shouldn't trigger executeActions", () => {
    const actionSpy = jasmine.createSpy();
    const modules = {
      foo: actionSpy
    };
    const executeDecisions = createExecuteDecisions({
      modules,
      logger,
      executeActions
    });
    executeDecisions([]);
    expect(executeActions).not.toHaveBeenCalled();
  });
});
