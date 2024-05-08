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
import createProcessDomAction from "../../../../../../src/components/Personalization/handlers/createProcessDomAction.js";

describe("createProcessDomAction", () => {
  let item;
  let data;
  let proposition;
  let meta;
  let trackingLabel;
  let scopeType;
  let modules;
  let logger;
  let storeClickMetrics;
  let processDomAction;

  beforeEach(() => {
    proposition = {
      getNotification() {
        return meta;
      },
      getScopeType() {
        return scopeType;
      }
    };
    item = {
      getData() {
        return data;
      },
      getProposition() {
        return proposition;
      },
      getTrackingLabel() {
        return trackingLabel;
      }
    };
    modules = {
      typeA: jasmine.createSpy("typeA"),
      typeB: jasmine.createSpy("typeB")
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);
    storeClickMetrics = jasmine.createSpy("storeClickMetrics");

    processDomAction = createProcessDomAction({
      modules,
      logger,
      storeClickMetrics
    });
  });

  it("returns an empty object if the item has no data, and logs missing type", () => {
    data = undefined;
    expect(processDomAction(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: missing type.",
      undefined
    );
  });

  it("returns an empty object if the item has no type, and logs missing type", () => {
    data = {};
    expect(processDomAction(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: missing type.",
      {}
    );
  });

  it("returns an empty object if the item has an unknown type, and logs unknown type", () => {
    data = { type: "typeC" };
    expect(processDomAction(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: unknown type.",
      {
        type: "typeC"
      }
    );
  });

  it("returns an empty object if the item has no selector for a click type, and logs missing selector", () => {
    data = { type: "click" };
    expect(processDomAction(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid DOM action data: missing selector.",
      {
        type: "click"
      }
    );
  });

  it("handles a click type", () => {
    data = { type: "click", selector: ".selector" };
    meta = { id: "myid", scope: "myscope" };
    trackingLabel = "mytrackinglabel";
    scopeType = "myscopetype";
    expect(processDomAction(item)).toEqual({
      setRenderAttempted: true,
      includeInNotification: false
    });
    expect(storeClickMetrics).toHaveBeenCalledWith({
      selector: ".selector",
      meta: {
        id: "myid",
        scope: "myscope",
        trackingLabel: "mytrackinglabel",
        scopeType: "myscopetype"
      }
    });
  });

  it("handles a non-click known type", () => {
    data = { type: "typeA", a: "b" };
    const result = processDomAction(item);
    expect(result).toEqual({
      render: jasmine.any(Function),
      setRenderAttempted: true,
      includeInNotification: true
    });
    expect(modules.typeA).not.toHaveBeenCalled();
    result.render();
    expect(modules.typeA).toHaveBeenCalledWith({ type: "typeA", a: "b" });
  });
});
