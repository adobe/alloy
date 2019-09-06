import webFactory from "../../../../../src/components/Context/webFactory";

describe("Context::webFactory", () => {
  const window = {
    location: { href: "http://mylocation.com" }
  };
  const topFrameSetProvider = () => {
    return { document: { referrer: "http://myreferrer.com" } };
  };
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeXdm"]);
  });

  it("works", () => {
    webFactory(window, topFrameSetProvider)(event);
    expect(event.mergeXdm).toHaveBeenCalledWith({
      web: {
        webPageDetails: {
          URL: "http://mylocation.com"
        },
        webReferrer: {
          URL: "http://myreferrer.com"
        }
      }
    });
  });
});
