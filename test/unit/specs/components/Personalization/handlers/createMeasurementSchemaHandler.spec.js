import createMeasurementSchemaHandler from "../../../../../../src/components/Personalization/handlers/createMeasurementSchemaHandler";

describe("Personalization::handlers::createMeasurementSchemaHandler", () => {
  let next;
  let proposition;
  let handle;
  let handler;

  beforeEach(() => {
    next = jasmine.createSpy("next");
    proposition = jasmine.createSpyObj("proposition", ["getHandle"]);
    proposition.getHandle.and.callFake(() => handle);
    handler = createMeasurementSchemaHandler({ next });
  });

  it("handles an empty proposition", () => {
    handle = {};
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("handles an empty set of items", () => {
    handle = { items: [] };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("does not pass on a proposition with a measurment schema", () => {
    handle = {
      items: [{ schema: "https://ns.adobe.com/personalization/measurement" }]
    };
    handler(proposition);
    expect(next).not.toHaveBeenCalled();
  });
});
