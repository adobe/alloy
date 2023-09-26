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
import {
  mockWindow,
  setupResponseHandler,
  proposition
} from "./contextTestUtils";

let mockedTimestamp;
describe("DecisioningEngine:globalContext:timeContext", () => {
  let applyResponse;
  beforeEach(() => {
    applyResponse = jasmine.createSpy();
    mockedTimestamp = new Date(Date.UTC(2023, 4, 11, 13, 34, 56));
    jasmine.clock().install();
    jasmine.clock().mockDate(mockedTimestamp);
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("satisfies rule based on matched pageLoadTimestamp", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "pageLoadTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched pageLoadTimestamp", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "pageLoadTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentTimestamp", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentTimestamp", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentTimestamp",
        matcher: "eq",
        values: [mockedTimestamp.getTime() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentDate", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentDate",
        matcher: "eq",
        values: [mockedTimestamp.getDate()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentDate", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentDate",
        matcher: "eq",
        values: [mockedTimestamp.getDate() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentDay", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentDay",
        matcher: "eq",
        values: [mockedTimestamp.getDay()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentDay", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentDay",
        matcher: "eq",
        values: [mockedTimestamp.getDay() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentHour", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentHour",
        matcher: "eq",
        values: [mockedTimestamp.getHours()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentHour", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentHour",
        matcher: "eq",
        values: [mockedTimestamp.getHours() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentMinute", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentMinute",
        matcher: "eq",
        values: [mockedTimestamp.getMinutes()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentMinute", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentMinute",
        matcher: "eq",
        values: [mockedTimestamp.getMinutes() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentMonth", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentMonth",
        matcher: "eq",
        values: [mockedTimestamp.getMonth()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentMonth", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentMonth",
        matcher: "eq",
        values: [mockedTimestamp.getMonth() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched currentYear", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentYear",
        matcher: "eq",
        values: [mockedTimestamp.getFullYear()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched currentYear", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "currentYear",
        matcher: "eq",
        values: [mockedTimestamp.getFullYear() + 1]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched pageVisitDuration", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "pageVisitDuration",
        matcher: "eq",
        values: [0]
      },
      type: "matcher"
    });
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched pageVisitDuration", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "pageVisitDuration",
        matcher: "eq",
        values: [1]
      },
      type: "matcher"
    });
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });
  it("satisfies rule based on matched ~timestampu", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "~timestampu",
        matcher: "eq",
        values: [mockedTimestamp.getTime() / 1000]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("satisfies rule based on matched ~timestampz", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "~timestampz",
        matcher: "eq",
        values: [mockedTimestamp.toISOString()]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });
});
