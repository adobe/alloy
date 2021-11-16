import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
    delete window.someEvar123;
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
    cleanUpDomChanges("btn");
    delete window.someEvar123;
  });

  it("should set personalized content", async () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: "bar",
      meta
    };

    await setHtml(settings);
    expect(element.innerHTML).toEqual("bar");
  });

  it("should execute inline JavaScript", async () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content:
        "<script id='evar123'>setTimeout(function onTimeout() { window.someEvar123 = 1; }, 500);</script>",
      meta
    };

    await setHtml(settings);
    await sleep(501);

    expect(window.someEvar123).toEqual(1);

    const scriptElements = document.querySelectorAll("#evar123");
    expect(scriptElements.length).toEqual(1);
  });

  it("should execute inline JavaScript with event listeners", async () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const button = createNode("button", { id: "btn" });
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";

    appendNode(document.body, button);
    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: `<script>
          var btn = document.getElementById('btn');
          btn.addEventListener('click', function onEvent() { window.someEvar123 = 2; });
        </script>`,
      meta
    };

    await setHtml(settings);

    button.click();
    expect(window.someEvar123).toEqual(2);
  });
});
