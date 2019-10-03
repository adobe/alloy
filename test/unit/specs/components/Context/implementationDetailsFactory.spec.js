import versionFactory from "../../../../../src/components/Context/implementationDetailsFactory";

describe("Context::versionFactory", () => {
  const version = "1.2.3";
  let event;
  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeXdm"]);
  });

  it("works", () => {
    versionFactory(version)(event);
    expect(event.mergeXdm).toHaveBeenCalledWith({
      implementationDetails: {
        name: "https://ns.adobe.com/experience/alloy",
        version: "1.2.3",
        environment: "web"
      }
    });
  });
});
