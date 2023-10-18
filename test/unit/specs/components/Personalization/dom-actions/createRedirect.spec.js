import createRedirect from "../../../../../../src/components/Personalization/dom-actions/createRedirect";

describe("createRedirect", () => {
  it("redirects", () => {
    const window = {
      location: {
        replace: jasmine.createSpy()
      }
    };
    const redirect = createRedirect(window);
    redirect("myurl");
    expect(window.location.replace).toHaveBeenCalledWith("myurl");
  });
});
