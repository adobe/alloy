import { DOM_ACTION } from "@adobe/alloy/libEs5/components/Personalization/constants/schema";
import createModulesProvider from "../../../../../src/components/Personalization/createModulesProvider";
import createPreprocessors from "../../../../../src/components/Personalization/createPreprocessors";

describe("createModulesProvider", () => {
  let modulesProvider;
  beforeEach(() => {
    modulesProvider = createModulesProvider({
      modules: {
        something: {
          eat: () => undefined,
          sleep: () => undefined,
          exercise: () => undefined
        },
        superfluous: {
          bend: () => undefined,
          crease: () => undefined,
          fold: () => undefined
        }
      },
      preprocessors: {
        something: [() => undefined],
        superfluous: [() => undefined, () => undefined, () => undefined]
      }
    });
  });

  it("has schema property", () => {
    expect(modulesProvider.getModules("something").getSchema()).toEqual(
      "something"
    );
  });

  it("has 'something' module actions", () => {
    expect(modulesProvider.getModules("something").getAction("eat")).toEqual(
      jasmine.any(Function)
    );
    expect(modulesProvider.getModules("something").getAction("sleep")).toEqual(
      jasmine.any(Function)
    );
    expect(
      modulesProvider.getModules("something").getAction("exercise")
    ).toEqual(jasmine.any(Function));
  });

  it("has 'superfluous' module actions", () => {
    expect(modulesProvider.getModules("superfluous").getAction("bend")).toEqual(
      jasmine.any(Function)
    );
    expect(
      modulesProvider.getModules("superfluous").getAction("crease")
    ).toEqual(jasmine.any(Function));
    expect(modulesProvider.getModules("superfluous").getAction("fold")).toEqual(
      jasmine.any(Function)
    );
  });
  it("does not have 'moo' module actions", () => {
    expect(modulesProvider.getModules("moo").getAction("a")).not.toBeDefined();
  });

  it("has 'something' preprocessors", () => {
    expect(modulesProvider.getModules("something").getPreprocessors()).toEqual([
      jasmine.any(Function)
    ]);
  });
  it("has 'superfluous' preprocessors", () => {
    expect(
      modulesProvider.getModules("superfluous").getPreprocessors()
    ).toEqual([
      jasmine.any(Function),
      jasmine.any(Function),
      jasmine.any(Function)
    ]);
  });

  it("has default preprocessors if none specified", () => {
    const provider = createModulesProvider({
      modules: {
        something: {
          eat: () => undefined,
          sleep: () => undefined,
          exercise: () => undefined
        }
      }
    });

    expect(provider.getModules(DOM_ACTION).getPreprocessors()).toEqual(
      createPreprocessors()[DOM_ACTION]
    );
  });
});
