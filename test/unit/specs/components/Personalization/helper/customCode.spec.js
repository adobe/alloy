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

  it("should set custom code in container", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { customCode } = modules;
    const element = createNode("div", { class: "customCode" });
    element.innerHTML = "foo";
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
      expect(elements[0].innerHTML).toEqual("<p>Hola!</p>");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });

  it("should execute inline JavaScript", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { customCode } = modules;
    const element = createNode("div", { class: "customCode" });
    element.innerHTML = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: ".customCode",
      prehidingSelector: ".customCode",
      content: "<script>window.someEvar123 = 1;</script>",
      meta
    };
    const event = { elements };

    return customCode(settings, event).then(() => {
      expect(collect).toHaveBeenCalledWith(meta);
      expect(window.someEvar123).toEqual(1);
    });
  });

  it("should append custom code if the container is an HTML HEAD container", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { customCode } = modules;
    const headElement = createNode("style", { class: "customCode" });
    const elements = [headElement];

    appendNode(document.head, headElement);

    const meta = { a: 1 };
    const settings = {
      selector: "head",
      prehidingSelector: "head",
      content: `<link class="customCode" href="foo">`,
      meta
    };
    const event = { elements };

    return customCode(settings, event).then(() => {
      expect(collect).toHaveBeenCalledWith(meta);

      expect(document.head.innerHTML).toContain(
        `<style class="customCode"></style><link class="customCode" href="foo">`
      );
    });
  });
});
