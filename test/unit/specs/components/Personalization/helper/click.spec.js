import { initDomActionsModules } from "../../../../../../src/components/Personalization/turbine";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::click", () => {
  it("should set click tracking attribute", () => {
    const collect = noop();
    const store = jasmine.createSpy();
    const modules = initDomActionsModules(collect, store);
    const { click } = modules;
    const selector = "#click";
    const meta = { a: 1 };
    const settings = { selector, meta };

    click(settings, store);

    expect(store).toHaveBeenCalledWith({ selector, meta });
  });
});
