import createLibraryInfo from "../../../../../src/components/LibraryInfo";

describe("LibraryInfo", () => {
  let toolsMock;
  let componentRegistryMock;

  beforeEach(() => {
    toolsMock = {
      config: {
        foo: "bar"
      }
    };
    componentRegistryMock = {
      getCommandNames: () => ["bar"]
    };
  });

  it("returns library, command, and config information", () => {
    expect(
      createLibraryInfo(
        toolsMock,
        componentRegistryMock
      ).commands.getLibraryInfo.run()
    ).toEqual({
      libraryInfo: {
        version: `__VERSION__`
      },
      configInfo: {
        foo: "bar"
      },
      commandInfo: ["bar"]
    });
  });
});
