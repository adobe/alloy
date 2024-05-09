import createRedirect from "../../../../../../src/components/Personalization/dom-actions/createRedirect.js";

describe("createRedirect", () => {
  it("redirects", () => {
    const window = {
      location: {
        replace: jasmine.createSpy(),
        href: jasmine.createSpy(),
      },
    };
    const redirect = createRedirect(window);
    redirect("myurl");
    expect(window.location.replace).toHaveBeenCalledWith("myurl");
    expect(window.location.href).not.toHaveBeenCalled();
  });

  it("redirects using window.location.href when preserveHistory is true", () => {
    const window = {
      location: {
        href: jasmine.createSpy(),
        replace: jasmine.createSpy(),
      },
    };
    const redirectUrl = "https://www.adobe.com";
    const redirect = createRedirect(window);
    redirect(redirectUrl, true);
    expect(window.location.href).toBe(redirectUrl);
    expect(window.location.replace).not.toHaveBeenCalled();
  });
});
