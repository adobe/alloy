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
import createProcessPropositions from "../../../../../../src/components/Personalization/handlers/createProcessPropositions.js";
import injectCreateProposition from "../../../../../../src/components/Personalization/handlers/injectCreateProposition.js";

describe("createProcessPropositions", () => {
  let schemaProcessors;
  let logger;
  let createProposition;
  let processPropositions;
  let render;
  let always;
  let noNotification;
  let never;
  let noRender;
  let redirect;
  beforeEach(() => {
    render = vi.fn().mockReturnValue(Promise.resolve());
    always = (item) => ({
      render: () => render(item.getData()),
      setRenderAttempted: true,
      includeInNotification: true,
    });
    noNotification = (item) => ({
      render: () => render(item.getData()),
      setRenderAttempted: true,
      includeInNotification: false,
    });
    never = () => ({});
    noRender = () => ({
      setRenderAttempted: true,
      includeInNotification: true,
    });
    redirect = (item) => ({
      render: () => render(item.getData()),
      setRenderAttempted: true,
      onlyRenderThis: true,
    });
    schemaProcessors = {
      always,
      noNotification,
      never,
      noRender,
      redirect,
    };
    logger = {
      info: vi.fn(),
      error: vi.fn(),
      logOnContentRendering: vi.fn(),
    };
    processPropositions = createProcessPropositions({
      schemaProcessors,
      logger,
    });
    createProposition = injectCreateProposition({
      preprocess: (data) => data,
      isPageWideSurface: () => false,
    });
  });
  it("handles no propositions", async () => {
    const result = processPropositions([]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [],
      returnedDecisions: [],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([]);
  });
  it("processes a proposition with an always item", async () => {
    const prop1 = createProposition({
      id: "always1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "always",
          data: "mydata",
        },
      ],
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "always",
              data: "mydata",
            },
          ],
          renderAttempted: true,
        },
      ],
      returnedDecisions: [],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([
      {
        id: "always1",
        scope: "myscope",
        scopeDetails: {
          a: 1,
        },
      },
    ]);
    expect(render).toHaveBeenCalledWith("mydata");
  });
  it("processes a proposition with a noNotification item", async () => {
    const prop1 = createProposition({
      id: "noNotification1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "noNotification",
          data: "mydata",
        },
      ],
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "noNotification1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "noNotification",
              data: "mydata",
            },
          ],
          renderAttempted: true,
        },
      ],
      returnedDecisions: [],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([]);
    expect(render).toHaveBeenCalledWith("mydata");
  });
  it("processes a proposition with a never item", async () => {
    const prop1 = createProposition({
      id: "never1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "never",
          data: "mydata",
        },
      ],
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "never1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "never",
              data: "mydata",
            },
          ],
          renderAttempted: false,
        },
      ],
      returnedDecisions: [
        {
          id: "never1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "never",
              data: "mydata",
            },
          ],
        },
      ],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([]);
    expect(render).not.toHaveBeenCalled();
  });
  it("processes a proposition with a noRender item", async () => {
    const prop1 = createProposition({
      id: "noRender1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "noRender",
          data: "mydata",
        },
      ],
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "noRender1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "noRender",
              data: "mydata",
            },
          ],
          renderAttempted: true,
        },
      ],
      returnedDecisions: [],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([
      {
        id: "noRender1",
        scope: "myscope",
        scopeDetails: {
          a: 1,
        },
      },
    ]);
    expect(render).not.toHaveBeenCalled();
  });
  it("processes a proposition with a redirect item", async () => {
    const prop1 = createProposition({
      id: "redirect1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "redirect",
          data: "mydata",
        },
      ],
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "redirect1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "redirect",
              data: "mydata",
            },
          ],
          renderAttempted: true,
        },
      ],
      returnedDecisions: [],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([]);
    expect(render).toHaveBeenCalledWith("mydata");
  });
  it("doesn't render other propositions if one has a redirect", async () => {
    const prop1 = createProposition({
      id: "always1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "always",
          data: "mydata1",
        },
      ],
    });
    const prop2 = createProposition({
      id: "redirect2",
      scope: "myscope",
      scopeDetails: {
        a: 2,
      },
      items: [
        {
          schema: "redirect",
          data: "mydata2",
        },
      ],
    });
    const prop3 = createProposition({
      id: "always3",
      scope: "myscope",
      scopeDetails: {
        a: 3,
      },
      items: [
        {
          schema: "always",
          data: "mydata3",
        },
      ],
    });
    const result = processPropositions([prop1, prop2, prop3]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "redirect2",
          scope: "myscope",
          scopeDetails: {
            a: 2,
          },
          items: [
            {
              schema: "redirect",
              data: "mydata2",
            },
          ],
          renderAttempted: true,
        },
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "always",
              data: "mydata1",
            },
          ],
          renderAttempted: false,
        },
        {
          id: "always3",
          scope: "myscope",
          scopeDetails: {
            a: 3,
          },
          items: [
            {
              schema: "always",
              data: "mydata3",
            },
          ],
          renderAttempted: false,
        },
      ],
      returnedDecisions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "always",
              data: "mydata1",
            },
          ],
        },
        {
          id: "always3",
          scope: "myscope",
          scopeDetails: {
            a: 3,
          },
          items: [
            {
              schema: "always",
              data: "mydata3",
            },
          ],
        },
      ],
    });
    await expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    expect(render).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([]);
    expect(render).toHaveBeenCalledWith("mydata2");
  });
  it("processes nonRenderPropositions", async () => {
    const prop1 = createProposition({
      id: "always1",
      scope: "myscope",
      scopeDetails: {
        a: 1,
      },
      items: [
        {
          schema: "always",
          data: "mydata",
        },
      ],
    });
    const result = processPropositions([], [prop1]);
    expect(result).toEqual({
      render: expect.any(Function),
      returnedPropositions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "always",
              data: "mydata",
            },
          ],
          renderAttempted: false,
        },
      ],
      returnedDecisions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: {
            a: 1,
          },
          items: [
            {
              schema: "always",
              data: "mydata",
            },
          ],
        },
      ],
    });
    expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    await expect(result.render()).resolves.toStrictEqual([]);
    expect(render).not.toHaveBeenCalled();
  });
});
