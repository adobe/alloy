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

import { DOM_ACTION } from "@adobe/alloy/libEs5/components/Personalization/constants/schema";
import executeActions from "../../../../../src/components/Personalization/executeActions";
import createActionsProvider from "../../../../../src/components/Personalization/createActionsProvider";

describe("Personalization::executeActions", () => {
  it("should execute actions", () => {
    const actionSpy = jasmine.createSpy().and.returnValue(Promise.resolve(1));
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [{ type: "foo", schema: DOM_ACTION }];

    return executeActions(
      actions,
      createActionsProvider({
        modules: {
          [DOM_ACTION]: {
            foo: actionSpy
          }
        },
        logger
      })
    ).then(result => {
      expect(result).toEqual([1]);
      expect(actionSpy).toHaveBeenCalled();
      expect(logger.info.calls.count()).toEqual(1);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("should preprocess actions", () => {
    const customCodeActionSpy = jasmine
      .createSpy("customCodeActionSpy")
      .and.returnValue(Promise.resolve(9));

    const setHtmlActionSpy = jasmine
      .createSpy("setHtmlActionSpy")
      .and.returnValue(Promise.resolve(1));
    const appendHtmlActionSpy = jasmine
      .createSpy("appendHtmlActionSpy")
      .and.returnValue(Promise.resolve(2));
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [
      {
        type: "setHtml",
        schema: DOM_ACTION,
        selector: "head",
        content:
          '<script>\n console.log("Test Offer");\n</script><p>Unsupported tag content</p>'
      },
      {
        type: "customCode",
        schema: DOM_ACTION,
        selector: "BODY > *:eq(0)",
        content: "<div>superfluous</div>"
      }
    ];

    const actionsProvider = createActionsProvider({
      modules: {
        [DOM_ACTION]: {
          setHtml: setHtmlActionSpy,
          appendHtml: appendHtmlActionSpy,
          customCode: customCodeActionSpy
        }
      },
      logger
    });

    return executeActions(actions, actionsProvider).then(result => {
      expect(result).toEqual([2, 9]);
      expect(setHtmlActionSpy).not.toHaveBeenCalled();
      expect(appendHtmlActionSpy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          type: "appendHtml",
          selector: "head",
          content: '<script>\n console.log("Test Offer");\n</script>'
        })
      );
      expect(logger.info.calls.count()).toEqual(2);
      expect(logger.error).not.toHaveBeenCalled();

      expect(customCodeActionSpy).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({
          type: "customCode",
          selector: "BODY",
          content: "<div>superfluous</div>"
        })
      );
    });
  });

  it("should not invoke logger.info when logger is not enabled", () => {
    const actionSpy = jasmine.createSpy().and.returnValue(Promise.resolve(1));
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = false;
    const actions = [{ type: "foo", schema: DOM_ACTION }];

    const actionsProvider = createActionsProvider({
      modules: {
        [DOM_ACTION]: {
          foo: actionSpy
        }
      },
      logger
    });

    return executeActions(actions, actionsProvider).then(result => {
      expect(result).toEqual([1]);
      expect(actionSpy).toHaveBeenCalled();
      expect(logger.info.calls.count()).toEqual(0);
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("should throw error when execute actions fails", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [{ type: "foo" }];
    const modules = {
      foo: jasmine.createSpy().and.throwError("foo's error")
    };

    expect(() => executeActions(actions, modules)).toThrowError();
  });

  it("should log nothing when there are no actions", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    const actions = [];
    const modules = {};

    return executeActions(actions, modules).then(result => {
      expect(result).toEqual([]);
      expect(logger.info).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it("should throw error when there are no actions types", () => {
    const logger = jasmine.createSpyObj("logger", ["error", "info"]);
    logger.enabled = true;
    const actions = [{ type: "foo1" }];
    const modules = {
      foo: () => {}
    };
    expect(() => executeActions(actions, modules)).toThrowError();
  });
});
