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
import { vi, beforeEach, describe, it, expect } from "vitest";
import {
  mockWindow,
  setupResponseHandler,
  proposition,
} from "./contextTestUtils.js";

describe("RulesEngine:globalContext:window", () => {
  let applyResponse;
  beforeEach(() => {
    applyResponse = vi.fn();
  });

  it("satisfies rule based on matched window height", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "window.height",
        matcher: "gt",
        values: [90],
      },
      type: "matcher",
    });

    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [proposition],
      }),
    );
  });

  it("does not satisfy rule due to unmatched window height", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        height: 50,
      }),
      {
        definition: {
          key: "window.height",
          matcher: "gt",
          values: [90],
        },
        type: "matcher",
      },
    );

    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [],
      }),
    );
  });

  it("satisfies rule based on matched window width", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        width: 200,
      }),
      {
        definition: {
          key: "window.width",
          matcher: "gt",
          values: [90],
        },
        type: "matcher",
      },
    );

    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [proposition],
      }),
    );
  });

  it("does not satisfy rule due to unmatched window width", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        width: 50,
      }),
      {
        definition: {
          key: "window.width",
          matcher: "gt",
          values: [90],
        },
        type: "matcher",
      },
    );

    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [],
      }),
    );
  });

  it("satisfies rule based on matched window scrollX", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        scrollX: 200,
      }),
      {
        definition: {
          key: "window.scrollX",
          matcher: "gt",
          values: [90],
        },
        type: "matcher",
      },
    );

    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [proposition],
      }),
    );
  });

  it("does not satisfy rule due to unmatched window scrollX", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        scrollX: 50,
      }),
      {
        definition: {
          key: "window.scrollX",
          matcher: "gt",
          values: [90],
        },
        type: "matcher",
      },
    );

    expect(applyResponse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        propositions: [],
      }),
    );
  });

  it("satisfies rule based on matched window scrollY", () => {
    expect(() => {
      setupResponseHandler(
        applyResponse,
        mockWindow({
          scrollY: 200,
        }),
        {
          definition: {
            key: "window.scrollY",
            matcher: "gt",
            values: [90],
          },
          type: "matcher",
        },
      );
    }).not.toThrow();
  });

  it("does not satisfy rule due to unmatched window scrollY", () => {
    expect(() => {
      setupResponseHandler(
        applyResponse,
        mockWindow({
          scrollY: 50,
        }),
        {
          definition: {
            key: "window.scrollY",
            matcher: "gt",
            values: [90],
          },
          type: "matcher",
        },
      );
    }).not.toThrow();
  });
});
