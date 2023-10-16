import createProcessPropositions from "../../../../../../src/components/Personalization/handlers/createProcessPropositions";
import injectCreateProposition from "../../../../../../src/components/Personalization/handlers/injectCreateProposition";

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
    render = jasmine.createSpy("render");
    always = item => ({
      render: () => render(item.getData()),
      setRenderAttempted: true,
      includeInNotification: true
    });
    noNotification = item => ({
      render: () => render(item.getData()),
      setRenderAttempted: true,
      includeInNotification: false
    });
    never = () => ({});
    noRender = () => ({
      setRenderAttempted: true,
      includeInNotification: true
    });
    redirect = item => ({
      render: () => render(item.getData()),
      setRenderAttempted: true,
      onlyRenderThis: true
    });

    schemaProcessors = { always, noNotification, never, noRender, redirect };
    logger = jasmine.createSpyObj("logger", ["info", "error"]);
    processPropositions = createProcessPropositions({
      schemaProcessors,
      logger
    });
    createProposition = injectCreateProposition({
      preprocess: data => data,
      isPageWideSurface: () => false
    });
  });

  it("handles no propositions", async () => {
    const result = processPropositions([]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [],
      returnedDecisions: []
    });
    await expectAsync(result.render()).toBeResolvedTo([]);
  });

  it("processes a proposition with an always item", async () => {
    const prop1 = createProposition({
      id: "always1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "always", data: "mydata" }]
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "always", data: "mydata" }],
          renderAttempted: true
        }
      ],
      returnedDecisions: []
    });
    expect(render).not.toHaveBeenCalled();
    await expectAsync(result.render()).toBeResolvedTo([
      {
        id: "always1",
        scope: "myscope",
        scopeDetails: { a: 1 }
      }
    ]);
    expect(render).toHaveBeenCalledWith("mydata");
  });

  it("processes a proposition with a noNotification item", async () => {
    const prop1 = createProposition({
      id: "noNotification1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "noNotification", data: "mydata" }]
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "noNotification1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "noNotification", data: "mydata" }],
          renderAttempted: true
        }
      ],
      returnedDecisions: []
    });
    expect(render).not.toHaveBeenCalled();
    await expectAsync(result.render()).toBeResolvedTo([]);
    expect(render).toHaveBeenCalledWith("mydata");
  });

  it("processes a proposition with a never item", async () => {
    const prop1 = createProposition({
      id: "never1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "never", data: "mydata" }]
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "never1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "never", data: "mydata" }],
          renderAttempted: false
        }
      ],
      returnedDecisions: [
        {
          id: "never1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "never", data: "mydata" }]
        }
      ]
    });
    await expectAsync(result.render()).toBeResolvedTo([]);
    expect(render).not.toHaveBeenCalled();
  });

  it("processes a proposition with a noRender item", async () => {
    const prop1 = createProposition({
      id: "noRender1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "noRender", data: "mydata" }]
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "noRender1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "noRender", data: "mydata" }],
          renderAttempted: true
        }
      ],
      returnedDecisions: []
    });
    await expectAsync(result.render()).toBeResolvedTo([
      {
        id: "noRender1",
        scope: "myscope",
        scopeDetails: { a: 1 }
      }
    ]);
    expect(render).not.toHaveBeenCalled();
  });

  it("processes a proposition with a redirect item", async () => {
    const prop1 = createProposition({
      id: "redirect1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "redirect", data: "mydata" }]
    });
    const result = processPropositions([prop1]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "redirect1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "redirect", data: "mydata" }],
          renderAttempted: true
        }
      ],
      returnedDecisions: []
    });
    expect(render).not.toHaveBeenCalled();
    await expectAsync(result.render()).toBeResolvedTo([]);
    expect(render).toHaveBeenCalledWith("mydata");
  });

  it("doesn't render other propositions if one has a redirect", async () => {
    const prop1 = createProposition({
      id: "always1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "always", data: "mydata1" }]
    });
    const prop2 = createProposition({
      id: "redirect2",
      scope: "myscope",
      scopeDetails: { a: 2 },
      items: [{ schema: "redirect", data: "mydata2" }]
    });
    const prop3 = createProposition({
      id: "always3",
      scope: "myscope",
      scopeDetails: { a: 3 },
      items: [{ schema: "always", data: "mydata3" }]
    });
    const result = processPropositions([prop1, prop2, prop3]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "redirect2",
          scope: "myscope",
          scopeDetails: { a: 2 },
          items: [{ schema: "redirect", data: "mydata2" }],
          renderAttempted: true
        },
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "always", data: "mydata1" }],
          renderAttempted: false
        },
        {
          id: "always3",
          scope: "myscope",
          scopeDetails: { a: 3 },
          items: [{ schema: "always", data: "mydata3" }],
          renderAttempted: false
        }
      ],
      returnedDecisions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "always", data: "mydata1" }]
        },
        {
          id: "always3",
          scope: "myscope",
          scopeDetails: { a: 3 },
          items: [{ schema: "always", data: "mydata3" }]
        }
      ]
    });
    expect(render).not.toHaveBeenCalled();
    await expectAsync(result.render()).toBeResolvedTo([]);
    expect(render).toHaveBeenCalledWith("mydata2");
  });

  it("processes nonRenderPropositions", async () => {
    const prop1 = createProposition({
      id: "always1",
      scope: "myscope",
      scopeDetails: { a: 1 },
      items: [{ schema: "always", data: "mydata" }]
    });
    const result = processPropositions([], [prop1]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      returnedPropositions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "always", data: "mydata" }],
          renderAttempted: false
        }
      ],
      returnedDecisions: [
        {
          id: "always1",
          scope: "myscope",
          scopeDetails: { a: 1 },
          items: [{ schema: "always", data: "mydata" }]
        }
      ]
    });
    await expectAsync(result.render()).toBeResolvedTo([]);
    expect(render).not.toHaveBeenCalled();
  });
});
