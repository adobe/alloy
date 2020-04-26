import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";

describe("Personalization::actions::click", () => {
  it("should set click tracking attribute", () => {
    const store = jasmine.createSpy();
    const modules = initDomActionsModules(store);
    const { click } = modules;
    const selector = "#click";
    const meta = { a: 1 };
    const settings = { selector, meta };

    click(settings, store);

    expect(store).toHaveBeenCalledWith({ selector, meta });
  });
});
