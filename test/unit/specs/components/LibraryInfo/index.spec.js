import createLibraryInfo from "../../../../../src/components/LibraryInfo";

describe("LibraryInfo", () => {
  let toolsMock;

  beforeEach(() => {
    toolsMock = {
      config: {
        foo: "bar"
      },
      componentRegistry: {
        getCommandNames: () => ["bar"]
      }
    };
  });

  it("returns library, command, and config information", () => {
    expect(createLibraryInfo(toolsMock).commands.getLibraryInfo.run()).toEqual({
      libraryInfo: {
        version: `__VERSION__`,
        configs: { foo: "bar" },
        commands: ["bar"]
      }
    });
  });
});
