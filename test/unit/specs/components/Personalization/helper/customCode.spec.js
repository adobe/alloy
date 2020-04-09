import {
  appendNode,
  createNode,
  selectNodes,
  removeNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/turbine";

describe("Personalization::actions::customCode", () => {
  beforeEach(() => {
    selectNodes(".customCode").forEach(removeNode);
    delete window.someEvar123;
  });

  afterEach(() => {
    selectNodes(".customCode").forEach(removeNode);
    delete window.someEvar123;
  });

  it("should set content in container that has children", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { customCode } = modules;
    const element = createNode("div", { class: "customCode" });
    element.innerHTML = `<div id="inner"></div>`;
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<p>Hola!</p>",
      meta
    };
    const event = { elements };

    return customCode(settings, event).then(() => {
      expect(elements[0].innerHTML).toEqual(
        `<p>Hola!</p><div id="inner"></div>`
      );
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });

  it("should set content in container that has NO children", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { customCode } = modules;
    const element = createNode("div", { class: "customCode" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<p>Hola!</p>",
      meta
    };
    const event = { elements };

    return customCode(settings, event).then(() => {
      expect(elements[0].innerHTML).toEqual(`<p>Hola!</p>`);
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
