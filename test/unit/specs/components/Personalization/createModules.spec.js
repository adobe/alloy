import createModules from "../../../../../src/components/Personalization/createModules";
import {
  DOM_ACTION,
  IN_APP_MESSAGE
} from "../../../../../src/components/Personalization/constants/schema";

describe("createModules", () => {
  it("has dom-action modules", () => {
    const modules = createModules(() => undefined);

    expect(modules[DOM_ACTION]).toEqual({
      setHtml: jasmine.any(Function),
      customCode: jasmine.any(Function),
      setText: jasmine.any(Function),
      setAttribute: jasmine.any(Function),
      setImageSource: jasmine.any(Function),
      setStyle: jasmine.any(Function),
      move: jasmine.any(Function),
      resize: jasmine.any(Function),
      rearrange: jasmine.any(Function),
      remove: jasmine.any(Function),
      insertAfter: jasmine.any(Function),
      insertBefore: jasmine.any(Function),
      replaceHtml: jasmine.any(Function),
      prependHtml: jasmine.any(Function),
      appendHtml: jasmine.any(Function),
      click: jasmine.any(Function),
      defaultContent: jasmine.any(Function)
    });

    expect(Object.keys(modules[DOM_ACTION]).length).toEqual(17);
  });
  it("has in-app-message modules", () => {
    const modules = createModules(() => undefined);

    expect(modules[IN_APP_MESSAGE]).toEqual({
      modal: jasmine.any(Function),
      banner: jasmine.any(Function)
    });

    expect(Object.keys(modules[IN_APP_MESSAGE]).length).toEqual(2);
  });
});
